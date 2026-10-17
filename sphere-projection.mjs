// A rectangular photograph covers a finite patch of a sphere. All rays originate
// at its center. Shared by rendering, marker projection and note placement.
const rad = degrees => degrees * Math.PI / 180;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export function sphereProjection(imageAspect, viewportAspect, zoom = 1) {
  if (![imageAspect, viewportAspect, zoom].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Photo aspect, viewport aspect and zoom must be positive finite numbers');
  }
  const horizontalSpan = rad(Math.min(150, 100 * imageAspect));
  const verticalSpan = horizontalSpan / imageAspect;
  const baseFov = Math.min(rad(58), verticalSpan * .78,
    2 * Math.atan(Math.tan(horizontalSpan * .32) / viewportAspect));
  const verticalFov = baseFov / Math.max(1, zoom);
  const tv = Math.tan(verticalFov / 2), th = tv * viewportAspect;
  const margin = Math.min(rad(.5), horizontalSpan * .01, verticalSpan * .01);
  const pitchLimit = Math.max(0, (verticalSpan - verticalFov) / 2 - margin);
  const cornerYaw = Math.atan2(th, Math.cos(pitchLimit) - tv * Math.sin(pitchLimit));
  const yawLimit = Math.max(0, horizontalSpan / 2 - cornerYaw - margin);
  return {horizontalSpan, verticalSpan, verticalFov, tv, th, pitchLimit, yawLimit};
}

export function spherePhotoAt(sx, sy, yaw, pitch, projection) {
  const {tv, th, horizontalSpan, verticalSpan} = projection;
  let x = (sx * 2 - 1) * th, y = (1 - sy * 2) * tv, z = 1;
  const norm = Math.hypot(x, y, z); x /= norm; y /= norm; z /= norm;
  const py = Math.cos(pitch) * y + Math.sin(pitch) * z;
  const pz = -Math.sin(pitch) * y + Math.cos(pitch) * z;
  const wx = Math.cos(yaw) * x + Math.sin(yaw) * pz;
  const wz = -Math.sin(yaw) * x + Math.cos(yaw) * pz;
  return {u: .5 + Math.atan2(wx, wz) / horizontalSpan,
    v: .5 - Math.asin(clamp(py, -1, 1)) / verticalSpan};
}

export function sphereScreenAt(u, v, yaw, pitch, projection) {
  const theta = (u - .5) * projection.horizontalSpan;
  const phi = (.5 - v) * projection.verticalSpan;
  const x = Math.sin(theta) * Math.cos(phi), y = Math.sin(phi), z = Math.cos(theta) * Math.cos(phi);
  const cx = Math.cos(yaw) * x - Math.sin(yaw) * z;
  const cz = Math.sin(yaw) * x + Math.cos(yaw) * z;
  const cy = Math.cos(pitch) * y - Math.sin(pitch) * cz;
  const forward = Math.sin(pitch) * y + Math.cos(pitch) * cz;
  return {x: .5 + cx / (2 * projection.th * Math.max(forward, 1e-12)),
    y: .5 - cy / (2 * projection.tv * Math.max(forward, 1e-12)), forward};
}
