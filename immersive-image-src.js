export const BLUR_PAD = .3;

export function decodeImage(src, signal, pixelBudget = Infinity, canExceedBudget = () => false) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    let settled = false;
    const finish = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener('abort', cancel);
      image.onload = image.onerror = null;
      if (error) { image.removeAttribute('src'); reject(error); }
      else resolve(image);
    };
    const cancel = () => finish(new DOMException('Scene preparation cancelled', 'AbortError'));
    const timeout = setTimeout(() => finish(new Error('Scene photo decode timed out')), 45000);
    image.onload = async () => {
      if (image.naturalWidth * image.naturalHeight > pixelBudget && !canExceedBudget()) {
        const error = new Error('Keep large background images encoded until needed');
        error.name = 'BackgroundDecodeSkipped';
        finish(error);
        return;
      }
      try { await image.decode?.(); finish(); } catch (error) { finish(error); }
    };
    image.onerror = () => finish(new Error('Scene photo unavailable'));
    signal.addEventListener('abort', cancel, {once:true});
    if (signal.aborted) { cancel(); return; }
    image.src = src;
  });
}

// Only the intentionally blurred outer projection is small. The source texture
// stays at its original dimensions. Scale the source ONCE, then mirror that tile.
export function blurredPeriphery(image, pad = BLUR_PAD) {
  const width = 512, height = Math.round(width * image.height / image.width);
  const tile = document.createElement('canvas');
  tile.width = width; tile.height = height;
  tile.getContext('2d').drawImage(image, 0, 0, width, height);
  const W = Math.round(width * (1 + 2 * pad)), H = Math.round(height * (1 + 2 * pad));
  const ox = Math.round(width * pad), oy = Math.round(height * pad);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) {
    ctx.save();
    ctx.translate(ox + i * width + (i ? width : 0), oy + j * height + (j ? height : 0));
    ctx.scale(i ? -1 : 1, j ? -1 : 1);
    ctx.drawImage(tile, 0, 0);
    ctx.restore();
  }
  const result = softened(canvas, 18);
  tile.width = tile.height = canvas.width = canvas.height = 1;
  return result;
}

function softened(canvas, radius) {
  const out = document.createElement('canvas');
  out.width = canvas.width; out.height = canvas.height;
  const ctx = out.getContext('2d');
  ctx.filter = `blur(${radius}px)`;
  if (ctx.filter === `blur(${radius}px)`) {
    ctx.drawImage(canvas, 0, 0);
    return out;
  }
  // Older Safari fallback, matching the previous renderer.
  const small = document.createElement('canvas');
  small.width = Math.max(1, Math.round(canvas.width / radius * 1.5));
  small.height = Math.max(1, Math.round(canvas.height / radius * 1.5));
  const sctx = small.getContext('2d');
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(canvas, 0, 0, small.width, small.height);
  ctx.filter = 'none'; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, out.width, out.height);
  small.width = small.height = 1;
  return out;
}
