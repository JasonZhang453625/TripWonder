import {decodeImage, blurredPeriphery} from './immersive-image-src.js';
import {ImmersiveSceneStorage} from './immersive-storage-src.js';

// Full-resolution encoded files survive destination changes within a bounded LRU.
// Decoded pixels are limited to active viewers and, when memory permits, ONE next
// image. Background preparation never creates a WebGL context or GPU texture.
const entries = new Map();
const fileCache = new Map();
const CACHE_LIMIT = 96 * 1024 * 1024;
let cacheBytes = 0, destination, warm, warmTimer, coverTimer;

function cachedFile(url) {
  const blob = fileCache.get(url);
  if (blob) { fileCache.delete(url); fileCache.set(url, blob); }
  return blob;
}

function rememberFile(url, blob) {
  if (blob.size > CACHE_LIMIT) return;
  forgetFile(url);
  fileCache.set(url, blob); cacheBytes += blob.size;
  while (cacheBytes > CACHE_LIMIT) forgetFile(fileCache.keys().next().value);
}

function forgetFile(url) {
  const blob = fileCache.get(url);
  if (blob) { cacheBytes -= blob.size; fileCache.delete(url); }
}

function dropPixels(entry) {
  entry.decodeController?.abort();
  entry.decoded = null;
  if (entry.images) {
    entry.images.sourceImage.removeAttribute('src');
    if (entry.images.atlasImage instanceof HTMLImageElement) entry.images.atlasImage.removeAttribute('src');
    else entry.images.atlasImage.width = entry.images.atlasImage.height = 1;
    entry.images = null;
  }
}

function stopWarm() {
  clearTimeout(warmTimer);
  warm?.abort(); warm = null;
}

function dispose(entry) {
  entry.controller.abort();
  dropPixels(entry);
  entry.urls.forEach(url => URL.revokeObjectURL(url));
  entry.urls.length = 0;
}

function clear() {
  clearTimeout(coverTimer);
  stopWarm();
  destination = undefined;
  entries.forEach(dispose);
  entries.clear();
}

function invalidate(config) {
  [config.sourceUrl, config.atlasUrl].filter(Boolean).forEach(url => {
    const key = new URL(url, location.href).href;
    forgetFile(key); ImmersiveSceneStorage.remove(key);
  });
  const entry = entries.get(config.id);
  if (entry) { entries.delete(config.id); dispose(entry); }
}

function embeddedAssets(config, signal, priority) {
  if (window.IMMERSIVE_ASSETS?.[config.id]) return Promise.resolve(window.IMMERSIVE_ASSETS[config.id]);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const finish = error => {
      script.remove();
      script.onload = script.onerror = null;
      signal.removeEventListener('abort', cancel);
      const assets = window.IMMERSIVE_ASSETS?.[config.id];
      if (error) reject(error);
      else if (assets) resolve(assets);
      else reject(new Error('Scene assets missing'));
    };
    const cancel = () => finish(signal.reason);
    script.src = config.assetScript;
    script.fetchPriority = priority;
    script.onload = () => finish();
    script.onerror = () => finish(new Error('Scene asset script unavailable'));
    signal.addEventListener('abort', cancel, {once:true});
    if (signal.aborted) { cancel(); return; }
    document.head.append(script);
  });
}

function download(config, priority) {
  if (entries.has(config.id)) return entries.get(config.id);
  const entry = {controller:new AbortController(), urls:[], readers:0, foreground:0};
  const {signal} = entry.controller;
  const timeout = setTimeout(() => entry.controller.abort(new Error('Scene asset load timed out')), 45000);
  const imageFile = async url => {
    const key = new URL(url, location.href).href;
    let blob = cachedFile(key);
    if (!blob) {
      blob = await ImmersiveSceneStorage.read(key);
      signal.throwIfAborted();
      if (blob) rememberFile(key, blob);
    }
    if (!blob) {
      const response = await fetch(url, {signal, priority});
      if (!response.ok) throw new Error(`Scene photo unavailable (${response.status})`);
      blob = await response.blob();
      signal.throwIfAborted();
      rememberFile(key, blob);
      ImmersiveSceneStorage.write(key, blob);
    }
    signal.throwIfAborted();
    const objectUrl = URL.createObjectURL(blob);
    entry.urls.push(objectUrl);
    return objectUrl;
  };
  entry.promise = (async () => {
    if (config.sourceUrl && location.protocol !== 'file:' && (config.periphery === 'blur' || config.atlasUrl)) {
      const [source, atlas] = await Promise.all([
        imageFile(config.sourceUrl),
        config.atlasUrl ? imageFile(config.atlasUrl) : undefined
      ]);
      return {source, atlas};
    }
    const assets = await embeddedAssets(config, signal, priority);
    signal.throwIfAborted();
    delete window.IMMERSIVE_ASSETS?.[config.id];
    return assets;
  })().catch(error => {
    // A failed background request must not poison an explicit retry.
    if (entries.get(config.id) === entry) entries.delete(config.id);
    dispose(entry);
    throw error;
  }).finally(() => clearTimeout(timeout));
  entries.set(config.id, entry);
  return entry;
}

function waitFor(promise, signal) {
  // Cancelling a staged viewer must not cancel a download shared with this destination.
  return new Promise((resolve, reject) => {
    const cancel = () => reject(signal.reason);
    signal.addEventListener('abort', cancel, {once:true});
    if (signal.aborted) cancel();
    promise.then(value => {
      signal.removeEventListener('abort', cancel);
      if (!signal.aborted) resolve(value);
    }, error => {
      signal.removeEventListener('abort', cancel);
      reject(error);
    });
  });
}

function decoded(entry, config, assets, pixelBudget) {
  if (entry.decoded) return entry.decoded;
  const controller = entry.decodeController = new AbortController();
  const {signal} = controller;
  const job = (async () => {
    const sourceImage = await decodeImage(assets.source, signal, pixelBudget, () => entry.foreground > 0);
    let atlasImage;
    try {
      signal.throwIfAborted();
      atlasImage = config.periphery === 'blur' ? blurredPeriphery(sourceImage) : await decodeImage(assets.atlas, signal);
      signal.throwIfAborted();
      return entry.images = {sourceImage, atlasImage};
    } catch (error) {
      sourceImage.removeAttribute('src');
      throw error;
    }
  })().catch(error => {
    if (entry.decoded === job) entry.decoded = null;
    if (error.name !== 'AbortError' && error.name !== 'BackgroundDecodeSkipped') invalidate(config);
    throw error;
  });
  entry.decoded = job;
  return job;
}

export const ImmersiveSceneMedia = {
  setDestination(id, configs) {
    if (destination?.id === id) return;
    clear();
    destination = {id, configs, started:false};
  },
  prefetchCover(id, configs, first) {
    this.setDestination(id, configs);
    clearTimeout(coverTimer);
    const scope = destination;
    // Start the first/resume photo while the visitor reads the cover. Only one
    // full-size file; all remaining scenes still wait for an explicit entry.
    coverTimer = setTimeout(() => {
      if (scope === destination && !scope.started && !document.hidden) download(first, 'low').promise.catch(() => {});
    }, 500);
  },
  async load(config, signal) {
    clearTimeout(coverTimer);
    const scope = destination;
    const assets = await waitFor(download(config, 'high').promise, signal);
    // Give the first scene the connection first. As soon as its file arrives, fetch
    // every remaining scene while the viewer prepares and the user explores.
    if (scope && scope === destination && !scope.started) {
      scope.started = true;
      scope.configs.forEach(other => { download(other, 'low').promise.catch(() => {}); });
    }
    return assets;
  },
  async prepare(config, signal, {background = false, pixelBudget = Infinity} = {}) {
    const assets = await this.load(config, signal);
    signal.throwIfAborted();
    const entry = entries.get(config.id);
    if (!entry) throw new DOMException('Destination changed', 'AbortError');
    entry.readers++; if (!background) entry.foreground++;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      signal.removeEventListener('abort', release);
      entry.readers--; if (!background) entry.foreground--;
      if (!entry.readers) dropPixels(entry);
    };
    signal.addEventListener('abort', release, {once:true});
    try {
      try { return await waitFor(decoded(entry, config, assets, pixelBudget), signal); }
      catch (error) {
        if (background || error.name !== 'BackgroundDecodeSkipped') throw error;
        return await waitFor(decoded(entry, config, assets, Infinity), signal);
      }
    } catch (error) { release(); throw error; }
  },
  present(config, pixels) {
    stopWarm();
    const scope = destination;
    const index = scope?.configs.findIndex(other => other.id === config.id) ?? -1;
    const next = index >= 0 && scope.configs[index + 1];
    if (!next) return;
    // ~192 MB of decoded RGBA at most (64 MB on known low-memory devices),
    // plus the active GPU texture. Large pairs stay encoded, never downsampled.
    const pixelBudget = (navigator.deviceMemory <= 2 ? 16 : 48) * 1000000 - pixels;
    if (pixelBudget <= 0) return;
    warmTimer = setTimeout(() => {
      if (scope !== destination || document.hidden || !entries.has(next.id)) return;
      warm = new AbortController();
      this.prepare(next, warm.signal, {background:true, pixelBudget}).catch(() => {});
    }, 450);
  },
  // Diagnostics expose counts only, not user data or image contents.
  status() {
    return {...ImmersiveSceneStorage.status(),cacheBytes, cacheLimit:CACHE_LIMIT, cachedFiles:fileCache.size,
      decodedScenes:[...entries].filter(([,entry]) => entry.images).map(([id]) => id)};
  },
  invalidate,
  clear
};

window.ImmersiveSceneMedia = ImmersiveSceneMedia;
