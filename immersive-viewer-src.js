import * as THREE from 'three';
import {ImmersiveSceneMedia} from './immersive-media-src.js';
import {sphereProjection, spherePhotoAt, sphereScreenAt} from './sphere-projection.mjs';

const rad = THREE.MathUtils.degToRad;
const deg = THREE.MathUtils.radToDeg;
const clamp = THREE.MathUtils.clamp;

// Sphere-interior photo view in ONE full-screen pass. Perspective rays originate
// at the sphere center; rotation and zoom never translate the camera. Frames are
// drawn only while the view is changing. No depth map or generated scenery.
// UI, game state and clue dialogs remain owned by app.js.
window.ImmersivePhotoViewer = class {
  constructor(root, photo, config = window.resolveImmersiveScene(photo)) {
    this.root = root;
    this.plane = root.querySelector('.photo-plane');
    this.config = config;
    this.abort = new AbortController();
    this.pointers = new Map();
    this.frame = 0;
    this.state = {yaw: 0, targetYaw: 0, pitch: 0, targetPitch: 0, zoom: 1, targetZoom: 1, yawLimit: 0, pitchMin: 0, pitchMax: 0};
    this.minZoom = 1;
    this.maxZoom = config.maxZoom ?? 3;
    this.ready = this.init();
    this.ready.catch(error => { if (!this.destroyed) console.warn('Immersive scene could not be prepared.', error); });
  }

  async init() {
    const cfg = this.config;
    const {sourceImage} = await ImmersiveSceneMedia.prepare(cfg, this.abort.signal);
    this.sourcePixels = sourceImage.width * sourceImage.height;
    this.sourceAspect = sourceImage.width / sourceImage.height;
    delete window.IMMERSIVE_ASSETS?.[cfg.id];
    this.abort.signal.throwIfAborted();
    const canvas = document.createElement('canvas');
    canvas.className = 'immersive-canvas';
    // A single full-screen pass has no geometric edges, so the default framebuffer needs no MSAA.
    const renderer = new THREE.WebGLRenderer({canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance'});
    this.canvas = canvas;
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
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
    // Keep native pixels unless the device cannot accommodate the texture dimensions.
    const limit = renderer.capabilities.maxTextureSize;
    let textureImage = sourceImage;
    if (Math.max(sourceImage.width, sourceImage.height) > limit) {
      const scale = limit / Math.max(sourceImage.width, sourceImage.height);
      textureImage = document.createElement('canvas');
      textureImage.width = Math.max(1, Math.round(sourceImage.width * scale));
      textureImage.height = Math.max(1, Math.round(sourceImage.height * scale));
      const context = textureImage.getContext('2d');
      context.imageSmoothingQuality = 'high';
      context.drawImage(sourceImage, 0, 0, textureImage.width, textureImage.height);
    }
    this.root.dataset.sourceSize = `${sourceImage.width}x${sourceImage.height}`;
    this.root.dataset.textureSize = `${textureImage.width}x${textureImage.height}`;
    this.root.dataset.maxZoom = this.maxZoom;
    this.sourceTexture = makeTexture(textureImage, true);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        sourceMap: {value: this.sourceTexture},
        tangents: {value: new THREE.Vector2()},
        rotation: {value: new THREE.Vector2()},
        span: {value: new THREE.Vector2()}
      },
      depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: `
        uniform sampler2D sourceMap;
        uniform vec2 tangents;uniform vec2 rotation;uniform vec2 span;
        varying vec2 vUv;
        void main(){
          vec3 ray=normalize(vec3((vUv*2.0-1.0)*tangents,1.0));
          float cp=cos(rotation.y),sp=sin(rotation.y);
          ray=vec3(ray.x,cp*ray.y+sp*ray.z,-sp*ray.y+cp*ray.z);
          float cy=cos(rotation.x),sy=sin(rotation.x);
          ray=vec3(cy*ray.x+sy*ray.z,ray.y,-sy*ray.x+cy*ray.z);
          vec2 p=vec2(.5+atan(ray.x,ray.z)/span.x,.5-asin(clamp(ray.y,-1.0,1.0))/span.y);
          gl_FragColor=texture2D(sourceMap,vec2(p.x,1.0-p.y));
          #include <colorspace_fragment>
        }`
    });
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.markers = [...this.plane.querySelectorAll('.hotspot')].map(element => ({element, u: parseFloat(element.style.left) / 100, v: parseFloat(element.style.top) / 100, x: NaN, y: NaN, hidden: null}));
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
    this.updateCamera();
    await renderer.compileAsync(this.scene, this.camera);
    this.abort.signal.throwIfAborted();
    renderer.render(this.scene, this.camera);
    this.initialized = true;
    this.root.dataset.rendered = 'true';
    await new Promise(resolve => requestAnimationFrame(resolve));
    this.abort.signal.throwIfAborted();
  }

  present() {
    if (!this.destroyed) ImmersiveSceneMedia.present(this.config, this.sourcePixels);
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
        this.state.targetYaw = clamp(this.state.targetYaw - (event.clientX - old.x) * 75 / (Math.max(this.w, 1) * this.state.zoom), -this.state.yawLimit, this.state.yawLimit);
        this.state.targetPitch = clamp(this.state.targetPitch + (event.clientY - old.y) * 45 / (Math.max(this.h, 1) * this.state.zoom), this.state.pitchMin, this.state.pitchMax);
      } else if (this.pointers.size === 2 && this.pinch) {
        const points = [...this.pointers.values()];
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        this.state.targetZoom = clamp(this.pinch.zoom * distance / Math.max(this.pinch.distance, 1), this.minZoom, this.maxZoom);
      }
      this.invalidate();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) on(type, event => {
      this.pointers.delete(event.pointerId);
      if (this.pointers.size === 2) this.startPinch();
      if (!this.pointers.size) this.root.classList.remove('dragging');
    });
    on('wheel', event => {event.preventDefault(); this.state.targetZoom = clamp(this.state.targetZoom * Math.exp(-event.deltaY * .0008), this.minZoom, this.maxZoom); this.invalidate();}, {passive: false});
    on('dblclick', () => {
      const yaw = this.homeYaw();
      this.state.targetYaw = yaw; this.state.targetPitch = 0; this.state.targetZoom = 1;
      this.invalidate();
    });
    this.root.addEventListener('keydown', event => {
      if (event.target !== this.root) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.state.targetYaw = clamp(this.state.targetYaw + (event.key === 'ArrowLeft' ? -3 : 3) / this.state.zoom, -this.state.yawLimit, this.state.yawLimit);
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
    const width = this.root.clientWidth, height = this.root.clientHeight;
    if (!width || !height || (this.w === width && this.h === height)) return;
    this.w = width;
    this.h = height;
    this.renderer.setSize(this.w, this.h, false);
    if (this.initialized) this.invalidate();
  }

  // Schedule one frame; animate() keeps scheduling only while the view is still easing.
  invalidate() {
    if (this.frame || this.destroyed || !this.renderer || !this.initialized) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(time => this.animate(time));
  }

  updateCamera() {
    this.state.zoom = clamp(this.state.zoom, 1, this.maxZoom);
    this.state.targetZoom = clamp(this.state.targetZoom, 1, this.maxZoom);
    this.projection = sphereProjection(this.sourceAspect, this.w / this.h, this.state.zoom);
    const p = this.projection;
    this.tv = p.tv; this.th = p.th;
    this.state.yawLimit = deg(p.yawLimit);
    this.state.pitchMin = -deg(p.pitchLimit);
    this.state.pitchMax = deg(p.pitchLimit);
    if (!this.homed) {
      this.homed = true;
      this.state.yaw = this.state.targetYaw = this.homeYaw();
    }
    for (const key of ['yaw', 'targetYaw']) this.state[key] = clamp(this.state[key], -this.state.yawLimit, this.state.yawLimit);
    for (const key of ['pitch', 'targetPitch']) this.state[key] = clamp(this.state[key], this.state.pitchMin, this.state.pitchMax);
    const u = this.material.uniforms;
    u.tangents.value.set(p.th, p.tv);
    u.rotation.value.set(rad(this.state.yaw), rad(this.state.pitch));
    u.span.value.set(p.horizontalSpan, p.verticalSpan);
    Object.assign(this.root.dataset, {
      projection: 'sphere', sourceAspect: String(this.sourceAspect), zoom: this.state.zoom.toFixed(3),
      minZoom: '1', pitchRange: `${this.state.pitchMin.toFixed(2)},${this.state.pitchMax.toFixed(2)}`,
      yawLimit: this.state.yawLimit.toFixed(2), yaw: this.state.yaw.toFixed(2)
    });
    this.projectMarkers();
  }

  homeYaw() {
    return clamp(deg(((this.config.focusX ?? .5) - .5) * this.projection.horizontalSpan), -this.state.yawLimit, this.state.yawLimit);
  }

  // Public adapter for future uploads and photo-anchored interactions. Coordinates
  // match the shader and hotspot projection, so notes stay on the photographed object.
  photoAt(clientX, clientY) {
    const rect = this.root.getBoundingClientRect();
    return spherePhotoAt((clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height,
      rad(this.state.yaw), rad(this.state.pitch), this.projection);
  }

  projectMarkers() {
    if (!this.projection) return;
    for (const marker of this.markers) {
      const point = sphereScreenAt(marker.u, marker.v, rad(this.state.yaw), rad(this.state.pitch), this.projection);
      const screenX = Math.round(point.x * this.w * 2) / 2;
      const screenY = Math.round(point.y * this.h * 2) / 2;
      const hidden = point.forward <= 0 || screenX < -22 || screenX > this.w + 22 || screenY < -22 || screenY > this.h + 22;
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
    if (this.destroyed) return;
    this.destroyed = true;
    this.abort.abort();
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    this.canvas?.remove();
    // Shader compilation can still be in flight when navigation cancels preparation.
    // Release its program after the readiness promise settles, rather than deleting
    // a program that compileAsync is still polling.
    if (this.renderer && !this.initialized) this.ready.then(() => this.disposeGraphics(), () => this.disposeGraphics());
    else this.disposeGraphics();
  }

  disposeGraphics() {
    this.geometry?.dispose();
    this.material?.dispose();
    this.sourceTexture?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
  }
};

// Registration seam for the future upload backend: a photo needs a stable id and
// full-resolution src (optionally a content version). Dimensions come from decode.
window.resolveImmersiveScene = (photo, configured) => {
  // A versioned upload (or an explicit original object) supersedes legacy baked assets.
  if (configured && !photo?.version && !photo?.sourceSha256 && !photo?.original?.src) return configured;
  let sourceUrl = photo?.original?.src || photo?.src;
  if (!photo?.id || !sourceUrl) return null;
  const version = photo.sourceSha256 || photo.version;
  if (version && !/^(blob:|data:)/i.test(sourceUrl)) {
    const url = new URL(sourceUrl, location.href); url.searchParams.set('v', String(version)); sourceUrl = url.href;
  }
  return {id: photo.id, sourceUrl, projection: 'sphere', periphery: 'sphere', maxZoom: 3};
};
