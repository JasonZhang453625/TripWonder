'use strict';
const stage = document.getElementById('stage');
const canvas = document.getElementById('view');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const scenes = window.SPHERE_SCENES;
const sceneId = new URLSearchParams(location.search).get('scene');
const scene = scenes.find(item => item.id === sceneId) || scenes[0];
const fallback = document.getElementById('fallback');
fallback.src = scene.fallback.src;
fallback.alt = scene.name || '目的地实景';
const credit = document.getElementById('credit');
credit.replaceChildren(document.createTextNode(`${scene.credit}；${scene.license}。照片以球面投影呈现。`));
function creditLink(label, value) {
  if (!value || !/^https?:\/\//i.test(value)) return;
  const link = document.createElement('a'); link.textContent = label; link.href = value; credit.append(link);
}
creditLink('照片来源', scene.source);
creditLink('照片许可', scene.licenseUrl);
let verticalFov, horizontalSpan;
const image = new Image();
let gl, program, ready = false, previous = 0;
let target = [0, 0], camera = [0, 0], dragging = false, last = [0, 0];
let verticalSpan, yawLimit = 0, pitchLimit = 0;
let cameraUniform, aspectUniform, spanUniform, fovUniform;

function compile(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
  return shader;
}

function fail() {
  ready = false;
  canvas.style.opacity = '0';
}

async function init() {
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) throw Error('WebGL unavailable');
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const full = scene.image;
    const preview = scene.fallback;
    image.src = Math.max(full.width, full.height) <= max ? full.src : preview.src;
    try { await image.decode(); }
    catch (error) {
      if (image.src === new URL(preview.src, location.href).href) throw error;
      image.src = preview.src;
      await image.decode();
    }
    if (image.naturalWidth <= image.naturalHeight) throw Error('Expected a landscape photograph');
    // Resize only when even the fallback exceeds this device's texture limit.
    let textureSource = image;
    if (Math.max(image.naturalWidth, image.naturalHeight) > max) {
      const scaled = document.createElement('canvas');
      const factor = max / Math.max(image.naturalWidth, image.naturalHeight);
      scaled.width = Math.max(1, Math.floor(image.naturalWidth * factor));
      scaled.height = Math.max(1, Math.floor(image.naturalHeight * factor));
      scaled.getContext('2d').drawImage(image, 0, 0, scaled.width, scaled.height);
      textureSource = scaled;
    }
    // The camera remains at the center; the image covers a finite spherical patch.
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, `
      attribute vec2 p;
      varying vec2 uv;
      void main() {
        uv = (p + 1.0) * 0.5;
        gl_Position = vec4(p, 0.0, 1.0);
      }
    `));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `
      precision highp float;
      varying vec2 uv;
      uniform sampler2D photo;
      uniform vec2 camera;
      uniform vec2 span;
      uniform float aspect;
      uniform float tanHalfFov;
      void main() {
        vec2 screen = (uv * 2.0 - 1.0) * tanHalfFov;
        vec3 ray = normalize(vec3(screen.x * aspect, screen.y, 1.0));
        float cp = cos(camera.y), sp = sin(camera.y);
        ray = vec3(ray.x, cp * ray.y + sp * ray.z, -sp * ray.y + cp * ray.z);
        float cy = cos(camera.x), sy = sin(camera.x);
        ray = vec3(cy * ray.x + sy * ray.z, ray.y, -sy * ray.x + cy * ray.z);
        vec2 photoUV = vec2(0.5 + atan(ray.x, ray.z) / span.x,
                            0.5 - asin(clamp(ray.y, -1.0, 1.0)) / span.y);
        gl_FragColor = texture2D(photo, photoUV);
      }
    `));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Shader linking failed');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSource);
    gl.uniform1i(gl.getUniformLocation(program, 'photo'), 0);
    cameraUniform = gl.getUniformLocation(program, 'camera');
    aspectUniform = gl.getUniformLocation(program, 'aspect');
    spanUniform = gl.getUniformLocation(program, 'span');
    fovUniform = gl.getUniformLocation(program, 'tanHalfFov');
    ready = true;
    requestAnimationFrame(frame);
  } catch (error) {
    console.warn('Spherical photo fallback:', error);
    fail();
  }
}

function frame(time) {
  if (!ready) return;
  const dt = Math.min((time - previous) / 1000, .06);
  previous = time;
  const rect = stage.getBoundingClientRect();
  const aspect = rect.width / rect.height;
  const dpr = Math.min(devicePixelRatio, 2);
  const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
  const projection = window.SphereMath.projection(image.naturalWidth / image.naturalHeight, aspect);
  ({ verticalFov, horizontalSpan, verticalSpan, yawLimit, pitchLimit } = projection);
  const ty = projection.ty;
  target = [Math.max(-yawLimit, Math.min(yawLimit, target[0])),
            Math.max(-pitchLimit, Math.min(pitchLimit, target[1]))];
  const ease = reduced.matches ? 1 : 1 - Math.exp(-dt * 12);
  camera = camera.map((value, i) => value + (target[i] - value) * ease);
  gl.uniform2f(cameraUniform, ...camera);
  gl.uniform2f(spanUniform, horizontalSpan, verticalSpan);
  gl.uniform1f(aspectUniform, aspect);
  gl.uniform1f(fovUniform, ty);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  canvas.style.opacity = '1';
  requestAnimationFrame(frame);
}

stage.addEventListener('pointerdown', event => {
  if (event.isPrimary === false) return;
  dragging = true;
  last = [event.clientX, event.clientY];
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!dragging || event.isPrimary === false) return;
  const scale = verticalFov / stage.clientHeight;
  target[0] -= (event.clientX - last[0]) * scale;
  target[1] += (event.clientY - last[1]) * scale;
  target[0] = Math.max(-yawLimit, Math.min(yawLimit, target[0]));
  target[1] = Math.max(-pitchLimit, Math.min(pitchLimit, target[1]));
  last = [event.clientX, event.clientY];
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name =>
  stage.addEventListener(name, () => { dragging = false; }));
stage.addEventListener('keydown', event => {
  const keys = { ArrowLeft: [-.06, 0], ArrowRight: [.06, 0], ArrowUp: [0, .04], ArrowDown: [0, -.04] };
  if (!keys[event.key]) return;
  event.preventDefault();
  target = target.map((value, i) => value + keys[event.key][i]);
});
stage.addEventListener('dblclick', () => { target = [0, 0]; });
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fail(); });
init();
