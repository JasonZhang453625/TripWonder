import * as THREE from 'three';

const rad = THREE.MathUtils.degToRad;
const deg = THREE.MathUtils.radToDeg;
const clamp = THREE.MathUtils.clamp;

// Continuous cylindrical photo view, rendered in ONE full-screen pass: every screen pixel casts
// its ray, intersects the cylinder analytically and samples the photo. No mesh, no offscreen
// target, no MSAA, and frames are only drawn while the view is changing.
// UI, game state and clue dialogs remain owned by app.js.
window.ImmersivePhotoViewer = class {
  constructor(root, photo, config) {
    this.root = root;
    this.plane = root.querySelector('.photo-plane');
    this.config = config;
    this.fallback = new window.PhotoViewer(root, photo);
    this.abort = new AbortController();
    this.pointers = new Map();
    this.frame = 0;
    this.state = {yaw: 0, targetYaw: 0, pitch: 0, targetPitch: 0, zoom: 1, targetZoom: 1, walkX: 0, yawLimit: 0, pitchMin: 0, pitchMax: 0};
    this.init().catch(error => { if (!this.destroyed) console.warn('Immersive photo unavailable; using original image.', error); });
  }

  async init() {
    const cfg = this.config;
    const assets = await this.loadAssets();
    const load = src => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load ${src}`));
      image.src = src;
    });
    const blur = cfg.periphery === 'blur';
    const sourceImage = await load(assets.source);
    const atlasImage = blur ? blurredPeriphery(sourceImage, BLUR_PAD) : await load(assets.atlas);
    delete window.IMMERSIVE_ASSETS?.[cfg.id];
    if (this.destroyed) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'immersive-canvas';
    // A single full-screen pass has no geometric edges, so the default framebuffer needs no MSAA.
    const renderer = new THREE.WebGLRenderer({canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance'});
    this.canvas = canvas;
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const makeTexture = (image, mipmaps) => {
      const result = new THREE.Texture(image);
      result.colorSpace = THREE.SRGBColorSpace;
      result.generateMipmaps = mipmaps;
      result.minFilter = mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      result.anisotropy = 1; // the view is never oblique enough for anisotropic filtering to pay off
      result.needsUpdate = true;
      return result;
    };
    this.sourceTexture = makeTexture(sourceImage, true);
    // The blurred far layer is tiny and always magnified; it needs no mipmaps.
    this.atlasTexture = makeTexture(atlasImage, !blur);
    const {sourceAspect} = cfg;
    // Blur scenes have no AI periphery: the reachable region is the photo plus a soft margin
    // of equal physical width on every side. Atlas scenes stay inside their verified safeRect.
    const my = cfg.blurMargin ?? .12, mx = my / sourceAspect, blurFeather = cfg.blurFeather ?? .004;
    this.region = blur ? {x: -mx, y: -my, w: 1 + 2 * mx, h: 1 + 2 * my} : cfg.safeRect;
    const alignment = blur ? [[1 / (1 + 2 * BLUR_PAD), 0, BLUR_PAD / (1 + 2 * BLUR_PAD)], [0, 1 / (1 + 2 * BLUR_PAD), BLUR_PAD / (1 + 2 * BLUR_PAD)], [0, 0, 1]] : cfg.alignment;
    // tanV and halfH are set per viewport in updateCamera(); the photo's width is laid on the
    // cylinder as arc length (halfH = tanV * aspect) so its proportions are not distorted.
    this.tanV = 1;
    this.halfH = sourceAspect;
    this.eye = {x: 0, z: 0};
    const f = value => value.toFixed(5);
    const feather = cfg.feather ?? {left: .1, right: .1, top: .04, bottom: .04};
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        sourceMap: {value: this.sourceTexture},
        periphery: {value: this.atlasTexture},
        atlasMap: {value: new THREE.Matrix3().set(...alignment.flat())},
        tangents: {value: new THREE.Vector2()},
        pitchOffset: {value: 0},
        heading: {value: new THREE.Vector2(0, 1)},
        eye: {value: new THREE.Vector2()},
        projection: {value: new THREE.Vector2(this.halfH, this.tanV)}
      },
      depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: `
        uniform sampler2D sourceMap;uniform sampler2D periphery;uniform mat3 atlasMap;
        uniform vec2 tangents;uniform float pitchOffset;uniform vec2 heading;uniform vec2 eye;uniform vec2 projection;
        varying vec2 vUv;
        void main(){
          // Screen pixel -> camera ray. Horizontal angle is linear across the screen and the vertical
          // component is divided by cos(angle), which keeps vertical lines straight.
          float angle=(vUv.x*2.0-1.0)*atan(tangents.x);
          float c=cos(angle);
          vec2 d=vec2(heading.y,heading.x)*(sin(angle)/c)+vec2(heading.x,-heading.y);
          float dy=((vUv.y*2.0-1.0)*tangents.y+pitchOffset)/c;
          // Ray -> cylinder of radius ${cfg.radius}, from the (slightly walked) eye position.
          float a=dot(d,d),b=dot(eye,d),k=dot(eye,eye)-${f(cfg.radius * cfg.radius)};
          float t=(-b+sqrt(b*b-a*k))/a;
          vec2 hit=eye+t*d;
          vec2 p=vec2(.5+atan(hit.x,-hit.y)/(2.0*projection.x),.5-t*dy/(${f(cfg.radius)}*2.0*projection.y));
          // Gradients are taken here, in uniform control flow, and reused by every sample below.
          vec2 gx=dFdx(p),gy=dFdy(p);
          vec3 source=textureGrad(sourceMap,vec2(clamp(p.x,0.0,1.0),1.0-clamp(p.y,0.0,1.0)),gx,gy).rgb;
          vec3 color=source;
          ${blur ? `
          // Signed distance to the photo edge in photo-height units (negative inside). Inside the
          // photo only one sample is taken. Outside, the photo is mirrored and softened (gradient
          // scaling = mipmap bias), then crossfades into the pre-blurred far layer.
          float outside=max(max(-p.x,p.x-1.0)*${f(sourceAspect)},max(-p.y,p.y-1.0));
          if(outside>${f(-blurFeather)}){
            float fade=clamp(outside/${f(my)},0.0,1.0);
            vec2 m=vec2(1.0-abs(1.0-abs(p.x)),1.0-abs(1.0-abs(p.y)));
            float spread=exp2(${f(cfg.nearBlurBase ?? 2)}+${f(cfg.nearBlurGrowth ?? 5)}*fade);
            vec3 near=textureGrad(sourceMap,vec2(m.x,1.0-m.y),gx*spread,gy*spread).rgb;
            vec3 h=atlasMap*vec3(p,1.0);
            vec3 far=textureLod(periphery,vec2(h.x/h.z,1.0-h.y/h.z),0.0).rgb;
            vec3 outer=mix(near,far,smoothstep(0.0,0.5,fade));
            color=mix(outer,source,1.0-smoothstep(${f(-blurFeather)},0.0,outside));
          }` : `
          vec3 h=atlasMap*vec3(p,1.0);
          vec2 uv=clamp(h.xy/h.z,.001,.999);
          vec3 outer=texture2D(periphery,vec2(uv.x,1.0-uv.y)).rgb;
          float xWeight=smoothstep(0.0,${f(feather.left)},p.x)*smoothstep(0.0,${f(feather.right)},1.0-p.x);
          float yWeight=smoothstep(0.0,${f(feather.top)},p.y)*smoothstep(0.0,${f(feather.bottom)},1.0-p.y);
          color=mix(outer,source,xWeight*yWeight);`}
          gl_FragColor=vec4(color,1.0);
          #include <colorspace_fragment>
        }`
    });
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.markers = [...this.plane.querySelectorAll('.hotspot')].map(element => ({element, u: parseFloat(element.style.left) / 100, v: parseFloat(element.style.top) / 100, x: NaN, y: NaN, hidden: null}));
    this.fallback.destroy();
    this.fallback = null;
    this.root.classList.add('immersive-active');
    this.root.prepend(canvas);
    this.plane.style.width = '100%';
    this.plane.style.height = '100%';
    this.plane.style.transform = 'none';
    this.plane.style.setProperty('--inverse-zoom', 1);
    this.attachControls();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.root);
    document.addEventListener('visibilitychange', () => this.invalidate(), {signal: this.abort.signal});
    canvas.addEventListener('webglcontextrestored', () => this.invalidate(), {signal: this.abort.signal});
    this.resize();
  }

  loadAssets() {
    const cfg = this.config;
    if (window.IMMERSIVE_ASSETS?.[cfg.id]) return Promise.resolve(window.IMMERSIVE_ASSETS[cfg.id]);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = cfg.assetScript;
      script.onload = () => {script.remove(); const assets = window.IMMERSIVE_ASSETS?.[cfg.id]; assets ? resolve(assets) : reject(new Error('Scene assets missing'));};
      script.onerror = () => {script.remove(); reject(new Error('Scene asset script unavailable'));};
      document.head.append(script);
    });
  }

  attachControls() {
    const on = (type, handler, options = {}) => this.canvas.addEventListener(type, handler, {...options, signal: this.abort.signal});
    on('pointerdown', event => {
      if (event.button > 0) return;
      event.preventDefault();
      this.canvas.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      this.root.classList.add('dragging');
      if (this.pointers.size === 2) this.startPinch();
    });
    on('pointermove', event => {
      const old = this.pointers.get(event.pointerId);
      if (!old) return;
      this.pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      if (this.pointers.size === 1) {
        this.state.targetYaw = clamp(this.state.targetYaw - (event.clientX - old.x) * 75 / Math.max(this.w, 1), -this.state.yawLimit, this.state.yawLimit);
        this.state.targetPitch = clamp(this.state.targetPitch + (event.clientY - old.y) * 45 / Math.max(this.h, 1), this.state.pitchMin, this.state.pitchMax);
      } else if (this.pointers.size === 2 && this.pinch) {
        const points = [...this.pointers.values()];
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        this.state.targetZoom = clamp(this.pinch.zoom * distance / Math.max(this.pinch.distance, 1), 1, 1.4);
      }
      this.state.walkX = this.config.walkX * this.state.targetYaw / Math.max(this.state.yawLimit, 1);
      this.invalidate();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) on(type, event => {
      this.pointers.delete(event.pointerId);
      if (this.pointers.size === 2) this.startPinch();
      if (!this.pointers.size) this.root.classList.remove('dragging');
    });
    on('wheel', event => {event.preventDefault(); this.state.targetZoom = clamp(this.state.targetZoom * Math.exp(-event.deltaY * .0008), 1, 1.4); this.invalidate();}, {passive: false});
    on('dblclick', () => {
      const yaw = this.homeYaw();
      this.state.targetYaw = yaw; this.state.targetPitch = 0; this.state.targetZoom = 1;
      this.state.walkX = this.config.walkX * yaw / Math.max(this.state.yawLimit, 1);
      this.invalidate();
    });
    this.root.addEventListener('keydown', event => {
      if (event.target !== this.root) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.state.targetYaw = clamp(this.state.targetYaw + (event.key === 'ArrowLeft' ? -3 : 3), -this.state.yawLimit, this.state.yawLimit);
        this.state.walkX = this.config.walkX * this.state.targetYaw / Math.max(this.state.yawLimit, 1);
        this.invalidate();
      }
    }, {signal: this.abort.signal});
  }

  startPinch() {
    const points = [...this.pointers.values()];
    this.pinch = {distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), zoom: this.state.targetZoom};
  }

  resize() {
    if (!this.renderer || this.destroyed) return;
    this.w = this.root.clientWidth;
    this.h = this.root.clientHeight;
    if (!this.w || !this.h) return;
    this.renderer.setSize(this.w, this.h, false);
    this.invalidate();
  }

  // Schedule one frame; animate() keeps scheduling only while the view is still easing.
  invalidate() {
    if (this.frame || this.destroyed || !this.renderer) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(time => this.animate(time));
  }

  updateCamera() {
    const a = this.w / this.h;
    const fov = clamp(a < .8 ? 62 : deg(2 * Math.atan(Math.tan(rad(60 / 2)) / a)), 18, 65);
    const baseTv = Math.tan(rad(fov / 2));
    const tv = Math.tan(rad(fov / this.state.zoom / 2));
    const th = tv * a;
    this.tv = tv;
    this.th = th;
    // Fit the photo to this viewport: at zoom 1 its full height fits the screen (fitScale 1),
    // it always covers the screen width, and the view never leaves the reachable region.
    const cfg = this.config, rect = this.region, aspect = cfg.sourceAspect;
    const margin = Math.atan(Math.max(cfg.walkX, .07) / cfg.radius) + rad(.5);
    const walkScale = (cfg.radius + Math.max(cfg.walkX, .07)) / cfg.radius;
    const halfView = Math.atan(baseTv * a) + margin;
    const vertical = Math.min(.5 - rect.y, rect.y + rect.h - .5), horizontal = Math.min(.5 - rect.x, rect.x + rect.w - .5);
    const minPitch = Math.tan(rad(cfg.minPitchDeg ?? 4));
    this.tanV = Math.max(baseTv * (cfg.fitScale ?? 1), (baseTv + minPitch) * walkScale / (2 * vertical), halfView / aspect, halfView / (2 * aspect * horizontal));
    this.halfH = this.tanV * aspect;
    const left = (.5 - rect.x) * 2 * this.halfH;
    const right = (rect.x + rect.w - .5) * 2 * this.halfH;
    this.state.yawLimit = Math.max(0, deg(Math.min(left, right) - Math.atan(th) - margin));
    if (!this.homed) {
      // First frame: open facing the scene's subject (config.focusX, 0–1 of the photo width).
      this.homed = true;
      this.state.yaw = this.state.targetYaw = this.homeYaw();
      this.state.walkX = cfg.walkX * this.state.yaw / Math.max(this.state.yawLimit, 1);
    }
    this.state.targetYaw = clamp(this.state.targetYaw, -this.state.yawLimit, this.state.yawLimit);
    this.state.yaw = clamp(this.state.yaw, -this.state.yawLimit, this.state.yawLimit);
    // Pitch is a vertical lens shift in tangent units; up and down limits differ when the region is asymmetric.
    const top = (.5 - rect.y) * 2 * this.tanV / walkScale, bottom = (rect.y + rect.h - .5) * 2 * this.tanV / walkScale;
    this.state.pitchMax = deg(Math.atan(Math.max(0, top - tv)));
    this.state.pitchMin = -deg(Math.atan(Math.max(0, bottom - tv)));
    this.state.targetPitch = clamp(this.state.targetPitch, this.state.pitchMin, this.state.pitchMax);
    this.state.pitch = clamp(this.state.pitch, this.state.pitchMin, this.state.pitchMax);
    const yaw = rad(this.state.yaw);
    this.eye.x = this.state.walkX * Math.cos(yaw);
    this.eye.z = -this.state.walkX * Math.sin(yaw);
    const u = this.material.uniforms;
    u.tangents.value.set(th, tv);
    u.pitchOffset.value = Math.tan(rad(this.state.pitch));
    u.heading.value.set(Math.sin(yaw), Math.cos(yaw));
    u.eye.value.set(this.eye.x, this.eye.z);
    u.projection.value.set(this.halfH, this.tanV);
    const data = this.root.dataset;
    data.pitchRange = `${this.state.pitchMin.toFixed(2)},${this.state.pitchMax.toFixed(2)}`;
    data.yawLimit = this.state.yawLimit.toFixed(2);
    data.yaw = this.state.yaw.toFixed(2);
    this.projectMarkers();
  }

  // Yaw that puts config.focusX (default: photo centre) in the middle of the screen, within reach.
  homeYaw() {
    const focus = this.config.focusX ?? .5;
    return clamp(deg((focus - .5) * 2 * this.halfH), -this.state.yawLimit, this.state.yawLimit);
  }

  projectMarkers() {
    const yaw = rad(this.state.yaw);
    const py = Math.tan(rad(this.state.pitch));
    const hh = Math.atan(this.th);
    const radius = this.config.radius;
    for (const marker of this.markers) {
      const theta = (marker.u - .5) * 2 * this.halfH;
      const x = radius * Math.sin(theta) - this.eye.x;
      const z = -radius * Math.cos(theta) - this.eye.z;
      const y = radius * (.5 - marker.v) * 2 * this.tanV;
      const forward = x * Math.sin(yaw) - z * Math.cos(yaw);
      const right = x * Math.cos(yaw) + z * Math.sin(yaw);
      const angle = Math.atan2(right, forward);
      const screenX = Math.round(this.w * (.5 + angle / (2 * hh)) * 2) / 2;
      const screenY = Math.round(this.h * (.5 - ((Math.cos(angle) * y / Math.max(forward, .001) - py) / this.tv) / 2) * 2) / 2;
      const hidden = forward <= 0 || screenX < -22 || screenX > this.w + 22 || screenY < -22 || screenY > this.h + 22;
      // Only touch the DOM when a marker actually moved, so a settled view causes no layout work.
      if (screenX !== marker.x) marker.element.style.left = `${marker.x = screenX}px`;
      if (screenY !== marker.y) marker.element.style.top = `${marker.y = screenY}px`;
      if (hidden !== marker.hidden) marker.element.hidden = marker.hidden = hidden;
    }
  }

  animate(now) {
    this.frame = 0;
    if (this.destroyed || document.hidden || !this.w || !this.h) return;
    const dt = clamp((now - this.last) / 1000, 0, .1);
    this.last = now;
    const t = 1 - Math.exp(-dt * 11);
    let moving = false;
    for (const [value, target, epsilon] of [['yaw', 'targetYaw', .01], ['pitch', 'targetPitch', .01], ['zoom', 'targetZoom', .0005]]) {
      const delta = this.state[target] - this.state[value];
      if (Math.abs(delta) > epsilon) {
        this.state[value] += delta * t;
        moving = true;
      } else this.state[value] = this.state[target];
    }
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
    if (moving) this.frame = requestAnimationFrame(time => this.animate(time));
  }

  destroy() {
    this.destroyed = true;
    this.abort.abort();
    this.fallback?.destroy();
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    this.geometry?.dispose();
    this.material?.dispose();
    this.sourceTexture?.dispose();
    this.atlasTexture?.dispose();
    this.renderer?.dispose();
    this.canvas?.remove();
  }
};

const BLUR_PAD = .3;

// Soft periphery for scenes without an AI extension: mirror the photo's edges outward, then
// blur, so colour and tone continue past the frame without inventing structure.
function blurredPeriphery(image, pad) {
  const width = 512, height = Math.round(width * image.height / image.width);
  const W = Math.round(width * (1 + 2 * pad)), H = Math.round(height * (1 + 2 * pad));
  const ox = Math.round(width * pad), oy = Math.round(height * pad);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) {
    // Tile (i, j) occupies [ox + i*width, oy + j*height]; outer tiles are mirrored so edges meet.
    ctx.save();
    ctx.translate(ox + i * width + (i ? width : 0), oy + j * height + (j ? height : 0));
    ctx.scale(i ? -1 : 1, j ? -1 : 1);
    ctx.drawImage(image, 0, 0, width, height);
    ctx.restore();
  }
  // Far layer only: the shader mirrors the full-resolution photo for the near zone.
  return softened(canvas, 18);
}

function softened(canvas, radius) {
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext('2d');
  ctx.filter = `blur(${radius}px)`;
  if (ctx.filter === `blur(${radius}px)`) {
    ctx.drawImage(canvas, 0, 0);
    return out;
  }
  // No canvas filter (older Safari): downscale then upscale with smoothing.
  const small = document.createElement('canvas');
  small.width = Math.max(1, Math.round(canvas.width / radius * 1.5));
  small.height = Math.max(1, Math.round(canvas.height / radius * 1.5));
  const sctx = small.getContext('2d');
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(canvas, 0, 0, small.width, small.height);
  ctx.filter = 'none';
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, out.width, out.height);
  return out;
}
