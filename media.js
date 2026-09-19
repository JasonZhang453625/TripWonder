/* Decode before committing a scene. Keep at most the current and next photo. */
window.SceneMedia = (() => {
  const cache = new Map();
  const connection = () => navigator.connection;
  const economical = () => connection()?.saveData || /(^|-)2g$/.test(connection()?.effectiveType || '');
  function source(photo, immersive = false) {
    const assets = window.MEDIA_ASSETS?.[photo.id];
    if (!assets) return photo;
    if (!immersive) return assets.thumb;
    const phone = document.querySelector('#phone');
    const w = phone?.clientWidth || innerWidth, h = phone?.clientHeight || innerHeight;
    const pixels = Math.max(w, h * photo.width / photo.height) * 1.15 * Math.min(devicePixelRatio || 1, 1.5);
    return pixels > 1150 && !economical() ? assets.detail : assets.screen;
  }
  function retain(urls) {
    for (const [url, entry] of cache) if (!urls.includes(url)) {
      cache.delete(url);
      entry.cancel?.();
    }
  }
  function prepare(photo, speculative = false) {
    const asset = source(photo, true), url = asset.src;
    const existing = cache.get(url);
    if (existing) { if (!speculative) existing.image.fetchPriority = 'high'; return existing.promise; }
    const image = new Image(asset.width, asset.height);
    image.decoding = 'async'; image.fetchPriority = speculative ? 'low' : 'high';
    image.draggable = false;
    const entry = {image};
    cache.set(url, entry);
    entry.promise = new Promise((resolve, reject) => {
      let settled = false;
      const finish = error => {
        if (settled) return;
        settled = true; clearTimeout(timeout); image.onload = image.onerror = null; entry.cancel = null;
        if (error) {
          if (cache.get(url) === entry) cache.delete(url);
          image.removeAttribute('src'); reject(error);
        } else resolve(image);
      };
      const timeout = setTimeout(() => finish(new Error('Photo load timed out')), 15000);
      entry.cancel = () => finish(new DOMException('Navigation cancelled', 'AbortError'));
      image.onload = async () => { try { await image.decode(); finish(); } catch (error) { finish(error); } };
      image.onerror = () => finish(new Error('Photo unavailable'));
      image.src = url;
    });
    return entry.promise;
  }
  function prefetch(current, next) {
    const urls = [source(current,true).src];
    if (next && !economical() && !document.hidden) urls.push(source(next,true).src);
    retain(urls);
    if (urls.length > 1) prepare(next,true).catch(() => {});
  }

  // Optional scene.video = {sources:[{src:'...mp4',type:'video/mp4'}]}.
  // Poster stays visible until a decoded video frame is presented; never preload next video.
  class Video {
    constructor(plane, config) {
      this.plane = plane; this.config = config; this.abort = new AbortController();
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.on = (target, type, fn) => target.addEventListener(type, fn, {signal:this.abort.signal});
      this.on(document,'visibilitychange',()=>this.sync());
      this.on(this.motion,'change',()=>this.sync());
      if (connection()) this.on(connection(),'change',()=>this.sync());
      this.sync();
    }
    sync() {
      if (this.destroyed) return;
      if (document.hidden || economical() || this.motion.matches) { this.stop(); return; }
      if (this.failed || this.video) return;
      const video = document.createElement('video');
      video.className = 'scene-video'; video.muted = true; video.defaultMuted = true;
      video.playsInline = true; video.loop = true; video.preload = 'metadata';
      video.setAttribute('muted',''); video.setAttribute('playsinline',''); video.setAttribute('aria-hidden','true');
      const candidate = this.config.sources?.find(item => !item.type || video.canPlayType(item.type));
      if (!candidate) return;
      this.video = video; this.plane.append(video);
      const fallback = () => { if (this.video !== video) return; this.failed = true; this.stop(); };
      const reveal = () => {
        if (this.video !== video || document.hidden) return;
        clearTimeout(this.timeout); video.classList.add('ready');
      };
      video.addEventListener('error',fallback,{once:true});
      video.addEventListener('playing',() => {
        if (video.requestVideoFrameCallback) this.frame = video.requestVideoFrameCallback(reveal);
        else if (video.readyState >= 2) this.raf = requestAnimationFrame(reveal);
      },{once:true});
      this.timeout = setTimeout(fallback,12000);
      video.src = candidate.src;
      video.play()?.catch(fallback);
    }
    stop() {
      clearTimeout(this.timeout); cancelAnimationFrame(this.raf);
      const video = this.video; if (!video) return;
      this.video = null;
      if (this.frame != null) video.cancelVideoFrameCallback?.(this.frame);
      video.pause(); video.removeAttribute('src'); video.load(); video.remove();
    }
    destroy() { this.destroyed = true; this.abort.abort(); this.stop(); }
  }
  return {source,prepare,prefetch,retain,Video};
})();
