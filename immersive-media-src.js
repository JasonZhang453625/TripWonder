// Keep encoded, full-resolution files for one destination. Decoding and GPU textures
// belong to the active viewer, so preloading does not allocate every scene on the GPU.
const entries = new Map();
let destination;

function dispose(entry) {
  entry.controller.abort();
  entry.urls.forEach(url => URL.revokeObjectURL(url));
  entry.urls.length = 0;
}

function clear() {
  destination = undefined;
  entries.forEach(dispose);
  entries.clear();
}

function invalidate(config) {
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
  const entry = {controller:new AbortController(), urls:[]};
  const {signal} = entry.controller;
  const timeout = setTimeout(() => entry.controller.abort(new Error('Scene asset load timed out')), 45000);
  const imageFile = async url => {
    const response = await fetch(url, {signal, priority});
    if (!response.ok) throw new Error(`Scene photo unavailable (${response.status})`);
    const blob = await response.blob();
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

export const ImmersiveSceneMedia = {
  setDestination(id, configs) {
    if (destination?.id === id) return;
    clear();
    destination = {id, configs, started:false};
  },
  async load(config, signal) {
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
  invalidate,
  clear
};

window.ImmersiveSceneMedia = ImmersiveSceneMedia;
