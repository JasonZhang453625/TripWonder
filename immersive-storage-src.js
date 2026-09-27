// Explicit origin storage for large versioned scene files. HTTP caches can decline
// large objects even with immutable headers. Cache API storage is best-effort: a
// quota/private-mode failure falls back to ordinary fetching without changing pixels.
const NAME = 'tripwonder-scene-files-v1';
const LIMIT = 96 * 1024 * 1024;
let opened, queue = Promise.resolve(), pending = 0, hits = 0;
const eligible = url => {
  const target = new URL(url, location.href);
  return target.origin === location.origin && /^[a-f0-9]{12}$/.test(target.searchParams.get('v') || '');
};
function cache() {
  if (!isSecureContext || !window.caches) return Promise.resolve(null);
  return opened ||= caches.open(NAME).catch(() => null);
}
function mutate(work) {
  pending++;
  queue = queue.then(async () => { const store = await cache(); if (store) await work(store); }).catch(() => {}).finally(() => pending--);
}
export const ImmersiveSceneStorage = {
  async read(url) {
    if (!eligible(url)) return null;
    try {
      const store = await cache(), response = await store?.match(url);
      if (!response) return null;
      const blob = await response.blob();
      if (!blob.size || blob.size !== Number(response.headers.get('content-length'))) {
        this.remove(url); return null;
      }
      hits++;
      return blob;
    } catch { return null; }
  },
  write(url, blob) {
    if (!eligible(url) || blob.size > LIMIT) return;
    mutate(async store => {
      const keys = await store.keys();
      const rows = await Promise.all(keys.map(async key => ({key, size:Number((await store.match(key))?.headers.get('content-length')) || 0})));
      let bytes = rows.reduce((sum, row) => sum + row.size, 0);
      // Drop an earlier version of this path; then evict oldest stored files before
      // adding the new one, so a write never intentionally exceeds the byte budget.
      const pathname = new URL(url).pathname;
      for (const row of rows) if (new URL(row.key.url).pathname === pathname) {
        await store.delete(row.key); bytes -= row.size; row.removed = true;
      }
      for (const row of rows) if (!row.removed && bytes + blob.size > LIMIT) {
        await store.delete(row.key); bytes -= row.size;
      }
      await store.put(url, new Response(blob, {headers:{'Content-Type':blob.type || 'image/jpeg', 'Content-Length':String(blob.size)}}));
    });
  },
  remove(url) { if (eligible(url)) mutate(store => store.delete(url)); },
  status() { return {persistentHits:hits, pendingWrites:pending, persistentLimit:LIMIT}; }
};
