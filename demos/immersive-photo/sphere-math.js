/* Shared by the viewer and the geometry tests. Angles are radians. */
(function (root) {
  'use strict';
  const rad = degrees => degrees * Math.PI / 180;
  function projection(imageAspect, viewportAspect) {
    if (!Number.isFinite(imageAspect) || imageAspect <= 1 || !Number.isFinite(viewportAspect) || viewportAspect <= 0) {
      throw Error('Expected a landscape image and positive viewport aspect');
    }
    // Limit latitude to avoid the poles; reduce the FOV for very wide photographs.
    const horizontalSpan = rad(Math.min(150, 100 * imageAspect));
    const verticalSpan = horizontalSpan / imageAspect;
    const verticalFov = Math.min(rad(58), verticalSpan * .78);
    const ty = Math.tan(verticalFov / 2);
    const pitchLimit = Math.max(0, (verticalSpan - verticalFov) / 2 - rad(.5));
    const cornerYaw = Math.atan2(ty * viewportAspect, Math.cos(pitchLimit) - ty * Math.sin(pitchLimit));
    const yawLimit = Math.max(0, horizontalSpan / 2 - cornerYaw - rad(.5));
    return { horizontalSpan, verticalSpan, verticalFov, ty, yawLimit, pitchLimit };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { projection };
  else root.SphereMath = { projection };
})(typeof window !== 'undefined' ? window : globalThis);
