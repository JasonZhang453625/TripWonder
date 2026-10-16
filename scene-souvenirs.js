/* Optional explore-page layer. Does not own game progress, clues or viewer controls. */
(() => {
  'use strict';
  const KEY = 'tripwonder-scene-souvenirs-v1';
  const catalog = Object.freeze([Object.freeze({
    id: 'guilin-passenger', sceneId: 'gl-yulong', u: .16, v: .944,
    name: '山水小旅伴', nameEn: 'Little Mountain Traveller',
    image: 'assets/souvenirs/guilin-passenger.png',
  })]);
  const collected = new Map();
  let persistent = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    for (const item of catalog) if (Number.isFinite(saved?.[item.id]) && saved[item.id] > 0) collected.set(item.id, saved[item.id]);
  } catch { persistent = false; }
  const t = (zh, en) => window.I18N?.t(zh, en) || zh;

  function mount({root, viewer, scene}) {
    const page = root?.closest('.explore-page'), plane = root?.querySelector('.photo-plane');
    if (!page || !plane) return {destroy() {}};
    let destroyed = false, marker = null, projection = null, dialog = null;
    const abort = new AbortController(), pointers = new Set();
    let down = null, moved = false;
    const item = catalog.find(entry => entry.sceneId === scene.id);
    const bar = document.createElement('div');
    bar.className = 'tw-souvenir-bar';
    page.append(bar);
    function paintBar() {
      bar.innerHTML = `<button type="button" class="tw-souvenir-open" aria-label="${t('打开文创收藏', 'Open souvenir collection')}">◇ <span>${t('文创收藏', 'Souvenirs')}</span> <b>${collected.size}/${catalog.length}</b></button>`;
    }
    function removeMarker() {
      if (projection && Array.isArray(viewer?.markers)) viewer.markers = viewer.markers.filter(entry => entry !== projection);
      projection = null; marker?.remove(); marker = null;
    }
    function closeDialog() { dialog?.close(); dialog?.remove(); dialog = null; }
    function showDialog(entry, discovery = false) {
      if (destroyed) return;
      closeDialog();
      dialog = document.createElement('dialog');
      dialog.className = 'tw-souvenir-dialog';
      const isCollected = entry && collected.has(entry.id);
      const title = entry ? t(entry.name, entry.nameEn) : t('旅行里的小收藏', 'Little travel treasures');
      dialog.innerHTML = `<button type="button" class="tw-souvenir-close" aria-label="${t('关闭', 'Close')}">×</button><p class="tw-souvenir-kicker">${discovery ? t('发现一位小旅伴', 'A little traveller found') : t('旅行收藏', 'Travel collection')}</p><h2>${title}</h2>${entry ? `<div class="tw-souvenir-art"><img src="${entry.image}" alt="${title}"></div><p>${t('把山水间的一次偶遇，收进你的旅行。', 'Keep a small encounter from the landscape.')}</p>` : `<div class="tw-souvenir-empty">?</div><p>${t('有一位小旅伴，正搭着当地的交通工具。', 'A little traveller is riding local transport.')}</p>`}<p class="tw-souvenir-progress">${t('彩蛋解锁', 'Treasures unlocked')} ${collected.size}/${catalog.length}</p><progress max="${catalog.length}" value="${collected.size}" aria-label="${t('彩蛋解锁进度', 'Treasure progress')}"></progress><p class="tw-souvenir-note">${persistent ? t('数字文创 · 收藏保存在当前浏览器', 'Digital souvenir · Saved in this browser') : t('当前无法保存；收藏仅在本次打开期间保留', 'Storage unavailable; collection lasts this visit')}</p><button type="button" class="tw-souvenir-primary">${discovery && !isCollected ? t('收进旅行收藏', 'Add to collection') : t('继续探索', 'Keep exploring')}</button>`;
      dialog.querySelector('.tw-souvenir-close').onclick = closeDialog;
      dialog.querySelector('.tw-souvenir-primary').onclick = () => {
        if (discovery && !collected.has(entry.id)) {
          collected.set(entry.id, Date.now());
          try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(collected))); } catch { persistent = false; }
          removeMarker(); paintBar();
          if (!persistent) { showDialog(entry); return; }
        }
        closeDialog();
      };
      // The page is removed between scenes; destroy() closes the top-layer dialog too.
      dialog.addEventListener('close', () => { bar.querySelector('button')?.focus(); }, {signal: abort.signal});
      page.append(dialog); dialog.showModal();
    }
    bar.addEventListener('click', () => showDialog(catalog.find(entry => collected.has(entry.id))), {signal: abort.signal});
    paintBar();
    if (item && !collected.has(item.id)) {
      marker = document.createElement('button');
      marker.type = 'button'; marker.className = 'tw-souvenir-marker';
      marker.setAttribute('aria-label', t('观察风景中的小物', 'Inspect the little object in the landscape'));
      marker.style.left = `${item.u * 100}%`; marker.style.top = `${item.v * 100}%`;
      marker.innerHTML = `<img src="${item.image}" alt="" draggable="false">`;
      plane.append(marker);
      // Reuse the same projection registration as existing scene bubbles.
      const register = () => {
        if (destroyed || !marker || collected.has(item.id)) return;
        if (Array.isArray(viewer?.markers)) {
          projection = {element: marker, u: item.u, v: item.v, x: NaN, y: NaN, hidden: null};
          viewer.markers.push(projection); viewer.projectMarkers?.();
        }
      };
      if (viewer?.ready) Promise.resolve(viewer.ready).then(register, () => {}); else register();
      marker.addEventListener('click', event => { if (event.detail === 0) showDialog(item, true); }, {signal: abort.signal});
      const on = (type, handler) => root.addEventListener(type, handler, {capture: true, signal: abort.signal});
      on('pointerdown', event => {
        pointers.add(event.pointerId);
        if (pointers.size > 1) { moved = true; return; }
        if (event.button > 0) { down = null; return; }
        down = {id: event.pointerId, x: event.clientX, y: event.clientY}; moved = false;
      });
      on('pointermove', event => { if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 8) moved = true; });
      on('pointerup', event => {
        const tap = down && down.id === event.pointerId && !moved && Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 8;
        pointers.delete(event.pointerId); down = null;
        if (!tap || !marker || marker.hidden || collected.has(item.id) || page.classList.contains('tw-placing')) return;
        const r = marker.getBoundingClientRect(), pad = 5;
        if (event.clientX >= r.left-pad && event.clientX <= r.right+pad && event.clientY >= r.top-pad && event.clientY <= r.bottom+pad) showDialog(item, true);
      });
      for (const type of ['pointercancel', 'lostpointercapture']) on(type, event => { pointers.delete(event.pointerId); down = null; });
    }
    return {destroy() { destroyed = true; abort.abort(); pointers.clear(); removeMarker(); closeDialog(); bar.remove(); }};
  }
  window.SceneSouvenirs = Object.freeze({catalog, mount});
})();
