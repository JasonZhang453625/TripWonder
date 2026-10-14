/* Floating notes over the explore scene: what earlier travellers left here, tagged "been" or "not yet".
   Each note is anchored to a photo position (like a hotspot) and follows the view as it is dragged:
   the flat viewer scales the plane, and the immersive viewer projects them with its own hotspot markers.
   A few notes float at a time and take turns. New notes are placed at the centre of the current view.
   Notes live on this device (TWStore); samples come from content/bubble-seed.js. */
(() => {
  'use strict';
  const t = (zh, en) => window.I18N.t(zh, en), isEn = () => window.I18N.isEn();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const FILTERS = ['all', 'been', 'want', 'off'], PREF = 'tripwonder-bubble-filter', MAX_LENGTH = 40;
  const MAX_VISIBLE = 3, ROTATE_MS = 4200, SNIPPET = 15;
  const readPref = () => { try { const v = localStorage.getItem(PREF); return FILTERS.includes(v) ? v : 'all'; } catch { return 'all'; } };
  const writePref = value => { try { localStorage.setItem(PREF, value); } catch {} };
  const kindLabel = kind => kind === 'been' ? t('去过', 'Been') : t('没去过', 'Not yet');
  const filterLabel = value => ({all: t('全部', 'All'), been: t('去过', 'Been'), want: t('没去过', 'Not yet'), off: t('已关闭', 'Off')})[value];
  const icon = name => window.TWIcon?.(name) || '';
  const rad = d => d * Math.PI / 180;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function notes(sceneId) {
    const data = window.TWStore.get();
    return [...(data.bubbles[sceneId] || []).map(note => ({...note, mine: true})), ...(window.TW_BUBBLE_SEED?.[sceneId] || [])];
  }
  const likes = note => (note.likes || 0) + (window.TWStore.get().likes[note.id] ? 1 : 0);
  const liked = note => !!window.TWStore.get().likes[note.id];

  // Photo position (0–1) at the centre of the screen.
  function centreUV(root, viewer) {
    if (Array.isArray(viewer?.markers) && viewer.state && viewer.eye) {
      // Inverse of the immersive shader's ray for the centre pixel: ray -> cylinder -> photo coordinates.
      const yaw = rad(viewer.state.yaw), dy = Math.tan(rad(viewer.state.pitch)), r = viewer.config.radius;
      const dx = Math.sin(yaw), dz = -Math.cos(yaw), ex = viewer.eye.x, ez = viewer.eye.z;
      const b = ex * dx + ez * dz, k = ex * ex + ez * ez - r * r, hit = -b + Math.sqrt(Math.max(0, b * b - k));
      const hx = ex + hit * dx, hz = ez + hit * dz;
      return {u: .5 + Math.atan2(hx, -hz) / (2 * viewer.halfH), v: .5 - hit * dy / (r * 2 * viewer.tanV)};
    }
    const plane = root.querySelector('.photo-plane').getBoundingClientRect(), view = root.getBoundingClientRect();
    return {u: (view.left + view.width / 2 - plane.left) / plane.width, v: (view.top + view.height / 2 - plane.top) / plane.height};
  }

  function mount({root, viewer, scene, hiddenNames = [], onCompose}) {
    const page = root.closest('.page'), plane = root.querySelector('.photo-plane');
    if (!page || !plane) return {destroy() {}};
    // Anything a note says that would name the destination is shown as "here" before the map guess.
    const pattern = hiddenNames.filter(n => n && n.length > 1).sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const mask = text => pattern.length ? text.replace(new RegExp(pattern.join('|'), 'gi'), t('这里', 'here')) : text;
    const textOf = note => mask(note.mine ? note.text : isEn() ? note.textEn : note.text);
    const nameOf = note => note.mine ? t('我', 'Me') : isEn() ? note.nameEn : note.name;
    let filter = readPref(), list = [], shown = [], cursor = 0, timer = 0, destroyed = false, placing = null, freshId = null;

    const bar = document.createElement('div');
    bar.className = 'tw-bubble-bar';
    page.append(bar);
    const paintBar = () => {
      const count = notes(scene.id).filter(n => filter === 'all' || n.kind === filter).length;
      bar.innerHTML = `<button class="tw-bubble-filter" data-bubble-filter aria-label="${t(`切换留言显示，当前：${filterLabel(filter)}`, `Change which notes show. Now: ${filterLabel(filter)}`)}">${icon('message')}<span>${filterLabel(filter)}${filter === 'off' ? '' : ` ${count}`}</span></button><button class="tw-bubble-new" data-bubble-new aria-label="${t('在这个场景留言', 'Leave a note here')}">${icon('spark')}<span>${t('留言', 'Note')}</span></button>`;
    };

    function markers() {
      if (!Array.isArray(viewer?.markers)) return;
      viewer.markers = viewer.markers.filter(m => !m.element.classList.contains('tw-bubble'));
      plane.querySelectorAll('.tw-bubble').forEach(element => viewer.markers.push({element, u: Number(element.dataset.u), v: Number(element.dataset.v), x: NaN, y: NaN, hidden: null}));
      viewer.projectMarkers?.();
    }
    function build() {
      plane.querySelectorAll('.tw-bubble').forEach(el => el.remove());
      list = filter === 'off' ? [] : notes(scene.id).filter(n => filter === 'all' || n.kind === filter);
      plane.insertAdjacentHTML('beforeend', list.map((note, i) => `<div class="tw-bubble kind-${note.kind}${note.mine ? ' mine' : ''}" data-id="${esc(note.id)}" data-u="${note.u}" data-v="${note.v}" style="left:${(note.u * 100).toFixed(2)}%;top:${(note.v * 100).toFixed(2)}%"><div class="tw-bubble-float" style="--float-delay:${(-i * 1.37).toFixed(2)}s"><button class="tw-bubble-body" aria-expanded="false"><span class="tw-bubble-tag">${kindLabel(note.kind)}</span><span class="tw-bubble-text">${esc([...textOf(note)].length > SNIPPET ? [...textOf(note)].slice(0, SNIPPET).join('') + '…' : textOf(note))}</span></button><div class="tw-bubble-more"><p>${esc(textOf(note))}</p><div class="tw-bubble-meta"><span>${esc(nameOf(note))}${note.seed ? ` · ${t('示例', 'Sample')}` : ''}</span><button class="tw-bubble-like" aria-pressed="${liked(note)}" aria-label="${t('点赞', 'Like')}">♥ <b>${likes(note)}</b></button></div></div></div></div>`).join(''));
      shown = []; cursor = 0;
      const first = list.slice(0, MAX_VISIBLE).map(n => n.id);
      if (freshId && !first.includes(freshId)) first[first.length - 1] = freshId;
      first.forEach(show);
      if (viewer?.ready) Promise.resolve(viewer.ready).then(() => { if (!destroyed) markers(); }, () => {}); else markers();
      paintBar();
    }
    const el = id => plane.querySelector(`.tw-bubble[data-id="${CSS.escape(id)}"]`);
    function show(id) { const node = el(id); if (!node) return; node.classList.add('on'); shown.push(id); }
    function hide(id) { const node = el(id); node?.classList.remove('on', 'open'); node?.querySelector('.tw-bubble-body')?.setAttribute('aria-expanded', 'false'); shown = shown.filter(x => x !== id); }
    function rotate() {
      if (destroyed || document.hidden || placing || list.length <= MAX_VISIBLE || plane.querySelector('.tw-bubble.open')) return;
      const out = shown.find(id => id !== freshId);
      const candidates = list.map(n => n.id).filter(id => !shown.includes(id));
      if (!out || !candidates.length) return;
      hide(out); show(candidates[cursor++ % candidates.length]);
    }

    function toggleOpen(node) {
      const open = !node.classList.contains('open');
      plane.querySelectorAll('.tw-bubble.open').forEach(other => { other.classList.remove('open'); other.querySelector('.tw-bubble-body').setAttribute('aria-expanded', 'false'); });
      node.classList.toggle('open', open);
      node.querySelector('.tw-bubble-body').setAttribute('aria-expanded', String(open));
    }
    function like(node, button) {
      const id = node.dataset.id, on = window.TWStore.update(data => { if (data.likes[id]) delete data.likes[id]; else data.likes[id] = true; return !!data.likes[id]; });
      const note = notes(scene.id).find(n => n.id === id);
      button.setAttribute('aria-pressed', String(on)); button.querySelector('b').textContent = likes(note);
      if (on) { button.classList.remove('pop'); void button.offsetWidth; button.classList.add('pop'); }
    }

    function startPlacing() {
      if (placing) return;
      page.classList.add('tw-placing');
      placing = document.createElement('div');
      placing.className = 'tw-place';
      placing.innerHTML = `<p class="tw-place-hint">${t('拖动画面，把准星对准想留言的位置', 'Drag the view to aim the crosshair where your note should go')}</p><span class="tw-place-cross" aria-hidden="true"></span><div class="tw-place-actions"><button class="tw-place-cancel" data-place-cancel>${t('取消', 'Cancel')}</button><button class="tw-place-ok" data-place-ok>${t('放在这里', 'Place here')}</button></div>`;
      page.append(placing);
    }
    function stopPlacing() { placing?.remove(); placing = null; page.classList.remove('tw-placing'); }
    function confirmPlace() {
      let {u, v} = centreUV(root, viewer);
      u = clamp(u, .04, .96); v = clamp(v, .1, .9);
      // Keep clear of the clue hotspots so a note never covers one.
      if (scene.hotspots.some(h => Math.hypot(h.x / 100 - u, (h.y / 100 - v) * .7) < .07)) v = clamp(v + .1, .1, .9);
      stopPlacing();
      onCompose?.({u, v});
    }
    function add({u, v, kind, text}) {
      const id = `me-${Date.now().toString(36)}`;
      window.TWStore.update(data => { (data.bubbles[scene.id] ||= []).unshift({id, u, v, kind, text: [...text].slice(0, MAX_LENGTH).join(''), at: Date.now(), likes: 0}); });
      if (filter === 'off' || (filter !== 'all' && filter !== kind)) { filter = 'all'; writePref(filter); }
      freshId = id; build();
      const node = el(id);
      if (node) { node.classList.add('fresh'); toggleOpen(node); }
    }

    const onClick = event => {
      const target = event.target;
      if (target.closest('[data-bubble-filter]')) { filter = FILTERS[(FILTERS.indexOf(filter) + 1) % FILTERS.length]; writePref(filter); build(); return; }
      if (target.closest('[data-bubble-new]')) { startPlacing(); return; }
      if (target.closest('[data-place-cancel]')) { stopPlacing(); return; }
      if (target.closest('[data-place-ok]')) { confirmPlace(); return; }
      const node = target.closest('.tw-bubble');
      if (!node) return;
      const likeButton = target.closest('.tw-bubble-like');
      if (likeButton) like(node, likeButton); else if (target.closest('.tw-bubble-body')) toggleOpen(node);
    };
    page.addEventListener('click', onClick);
    build();
    timer = setInterval(rotate, ROTATE_MS);
    return {
      add,
      destroy() { destroyed = true; clearInterval(timer); page.removeEventListener('click', onClick); stopPlacing(); bar.remove(); plane.querySelectorAll('.tw-bubble').forEach(node => node.remove()); }
    };
  }

  function composeMarkup() {
    return `<div class="tw-compose"><p class="tw-compose-lead">${t('留给之后来到这里的旅人', 'For the travellers who come here next')}</p><div class="tw-compose-kinds" role="radiogroup" aria-label="${t('你去过这里吗', 'Have you been here?')}"><button role="radio" aria-checked="false" data-compose-kind="been">${t('我去过', 'I’ve been')}</button><button role="radio" aria-checked="false" data-compose-kind="want">${t('还没去过', 'Not yet')}</button></div><textarea maxlength="${MAX_LENGTH}" rows="3" aria-label="${t('留言内容', 'Your note')}" placeholder="${t('写一句话，比如：清晨来人最少', 'One line, e.g. “Come early, it’s quiet”')}"></textarea><div class="tw-compose-foot"><small><span data-compose-count>0</span>/${MAX_LENGTH} · ${t('只保存在本机', 'Saved on this device only')}</small><button class="primary tw-compose-submit" data-compose-submit disabled>${t('放上气泡', 'Post')}</button></div></div>`;
  }
  function bindCompose(sheet, onSubmit) {
    const field = sheet.querySelector('textarea'), submit = sheet.querySelector('[data-compose-submit]'), count = sheet.querySelector('[data-compose-count]');
    let kind = null;
    const sync = () => { count.textContent = [...field.value].length; submit.disabled = !kind || !field.value.trim(); };
    sheet.addEventListener('click', event => {
      const choice = event.target.closest('[data-compose-kind]');
      if (choice) { kind = choice.dataset.composeKind; sheet.querySelectorAll('[data-compose-kind]').forEach(b => b.setAttribute('aria-checked', String(b === choice))); sync(); if (!field.value) field.focus(); return; }
      if (event.target.closest('[data-compose-submit]') && !submit.disabled) onSubmit({kind, text: field.value.trim()});
    });
    field.addEventListener('input', sync);
  }

  window.SceneBubbles = Object.freeze({mount, composeMarkup, bindCompose});
})();
