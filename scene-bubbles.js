/* Notes over the explore scene: what earlier travellers left here.
   Each note is anchored to a photo position (like a hotspot) and follows the view as it is dragged:
   the flat viewer scales the plane, and the immersive viewer projects them with its own hotspot markers.
   The three most-liked notes show as strips (avatar, one line, tail); every other note is counted once in a
   small envelope bubble, and ordinary notes close together share one. Near the view's edge both fade and shrink
   around their anchor; off screen they are invisible and inert. New notes go where the user taps the view.
   Notes live on this device (TWStore); samples come from content/bubble-seed.js. */
(() => {
  'use strict';
  const t = (zh, en) => window.I18N.t(zh, en), isEn = () => window.I18N.isEn();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const MAX_LENGTH = 40;
  // STRIPS most-liked notes get a strip. GROUP: notes closer than this (in photo heights) share a bubble.
  // EDGE: px from the view's edge where fading starts; EDGE_SCALE: size at the edge. BOB: float animation height.
  const STRIPS = 3, GROUP = .1, EDGE = 42, EDGE_SCALE = .86, BOB = 6;
  const ENVELOPE = '<svg class="tw-bundle-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/></svg>';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function notes(sceneId) {
    const data = window.TWStore.get();
    return [...(data.bubbles[sceneId] || []).map(note => ({...note, mine: true})), ...(window.TW_BUBBLE_SEED?.[sceneId] || []), ...(window.TW_UGC_BUBBLE_SEED?.[sceneId] || [])];
  }
  const likes = note => (note.likes || 0) + (window.TWStore.get().likes[note.id] ? 1 : 0);
  const liked = note => !!window.TWStore.get().likes[note.id];

  // Photo position (0–1) at the centre of the screen.
  function pointUV(root, viewer, clientX, clientY) {
    if (viewer?.photoAt && viewer.projection) return viewer.photoAt(clientX, clientY);
    const plane = root.querySelector('.photo-plane').getBoundingClientRect();
    return {u: (clientX - plane.left) / plane.width, v: (clientY - plane.top) / plane.height};
  }
  const hashOf = text => { let h = 0; for (const c of String(text)) h = (h * 31 + c.codePointAt(0)) % 9973; return h; };
  // The same five profile pictures as the community comments; the people who appear there keep their own,
  // everyone else gets one by note id. My notes use the picture the comment box shows for me.
  const AVATAR_NAMES = ['小满', '米粒', '阿哲', '晚风', '南风'];
  const avatarOf = note => {
    const known = note.mine ? 0 : AVATAR_NAMES.indexOf(note.name);
    return `assets/community/user-${(known >= 0 ? known : hashOf(note.id) % AVATAR_NAMES.length) + 1}.jpg`;
  };
  const avatar = (note, size) => `<img class="tw-bubble-avatar" src="${avatarOf(note)}" alt="" width="${size}" height="${size}" decoding="async" draggable="false">`;

  // Merge the two nearest groups until none are closer than GROUP. Distances are in photo heights, so
  // `aspect` (photo width / height) keeps horizontal and vertical spacing comparable.
  function group(list, aspect) {
    const groups = list.map(note => ({notes: [note], u: note.u, v: note.v}));
    for (;;) {
      let best = null;
      for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
        const d = Math.hypot((groups[i].u - groups[j].u) * aspect, groups[i].v - groups[j].v);
        if (d < GROUP && (!best || d < best.d)) best = {i, j, d};
      }
      if (!best) return groups;
      const merged = [...groups[best.i].notes, ...groups[best.j].notes];
      groups[best.i] = {notes: merged, u: merged.reduce((s, n) => s + n.u, 0) / merged.length, v: merged.reduce((s, n) => s + n.v, 0) / merged.length};
      groups.splice(best.j, 1);
    }
  }

  function mount({root, viewer, scene, hiddenNames = [], onCompose}) {
    const page = root.closest('.page'), plane = root.querySelector('.photo-plane');
    if (!page || !plane) return {destroy() {}};
    // Anything a note says that would name the destination is shown as "here" before the map guess.
    const pattern = hiddenNames.filter(n => n && n.length > 1).sort((a, b) => b.length - a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const mask = text => pattern.length ? text.replace(new RegExp(pattern.join('|'), 'gi'), t('这里', 'here')) : text;
    const textOf = note => mask(note.mine ? note.text : isEn() ? note.textEn : note.text);
    const nameOf = note => note.mine ? t('我', 'Me') : isEn() ? note.nameEn : note.name;
    const photo = window.TRIPWONDER_CATALOG?.photoById?.get(scene.id) || scene.photo;
    const aspect = photo?.width > 0 && photo?.height > 0 ? photo.width / photo.height : 1.5;
    let destroyed = false, placing = null, freshId = null;
    // Anchored elements (strips and bubbles), with their unscaled size and the viewer marker that positions them.
    let anchored = [];
    const sizes = new Map(), markerOf = new Map(), edge = new Map();


    const likeButton = note => `<button class="tw-bubble-like" aria-pressed="${liked(note)}" aria-label="${t('点赞', 'Like')}">♥ <b>${likes(note)}</b></button>`;
    const pos = (u, v) => `data-u="${u}" data-v="${v}" style="left:${(u * 100).toFixed(2)}%;top:${(v * 100).toFixed(2)}%"`;
    const strip = (note, i) => `<div class="tw-bubble${note.mine ? ' mine' : ''}" data-id="${esc(note.id)}" ${pos(note.u, note.v)}><div class="tw-bubble-float" style="--float-delay:${(-i * 1.37).toFixed(2)}s"><button class="tw-bubble-body" aria-expanded="false">${avatar(note, 22)}<span class="tw-bubble-text">${esc(textOf(note))}</span></button><div class="tw-bubble-more"><p>${esc(textOf(note))}</p><div class="tw-bubble-meta"><span>${esc(nameOf(note))}</span>${likeButton(note)}</div></div></div></div>`;
    const bundle = g => `<div class="tw-bundle${g.notes.some(n => n.mine) ? ' mine' : ''}" ${pos(g.u, g.v)}><div class="tw-bubble-float"><button class="tw-bundle-pill" aria-expanded="false" aria-label="${t(`这里还有 ${g.notes.length} 条留言`, `${g.notes.length} more ${g.notes.length === 1 ? 'note' : 'notes'} here`)}">${ENVELOPE}<b>${g.notes.length}</b></button><div class="tw-bundle-list" role="list">${g.notes.map(note => `<div class="tw-bundle-note" role="listitem" data-id="${esc(note.id)}">${avatar(note, 26)}<div class="tw-bundle-copy"><span>${esc(nameOf(note))}</span><p>${esc(textOf(note))}</p></div>${likeButton(note)}</div>`).join('')}</div></div></div>`;

    function markers() {
      if (!Array.isArray(viewer?.markers)) return;
      const own = element => element.matches('.tw-bubble, .tw-pin, .tw-bundle');
      viewer.markers = viewer.markers.filter(m => !own(m.element));
      markerOf.clear();
      plane.querySelectorAll('.tw-bubble, .tw-pin, .tw-bundle').forEach(element => {
        const marker = {element, u: Number(element.dataset.u), v: Number(element.dataset.v), x: NaN, y: NaN, hidden: null};
        viewer.markers.push(marker); markerOf.set(element, marker);
      });
      viewer.projectMarkers?.();
    }
    function build() {
      plane.querySelectorAll('.tw-bubble:not(.tw-pin), .tw-bundle').forEach(el => el.remove());
      const list = notes(scene.id);
      // Ranked once per build, so liking a note never moves it under the finger. A note just posted keeps a strip
      // of its own until the scene is left; every note is shown exactly once.
      const ranked = list.filter(n => n.id !== freshId).map((note, index) => ({note, index})).sort((a, b) => likes(b.note) - likes(a.note) || a.index - b.index).map(x => x.note);
      const strips = [...ranked.slice(0, STRIPS), ...list.filter(n => n.id === freshId)];
      plane.insertAdjacentHTML('beforeend', strips.map(strip).join('') + group(ranked.slice(STRIPS), aspect).map(bundle).join(''));
      anchored = [...plane.querySelectorAll('.tw-bubble:not(.tw-pin), .tw-bundle')];
      sizes.clear(); edge.clear();
      if (viewer?.ready) Promise.resolve(viewer.ready).then(() => { if (!destroyed) { markers(); measure(); } }, () => {}); else markers();
      measure();
    }
    const el = id => plane.querySelector(`.tw-bubble[data-id="${CSS.escape(id)}"]`);

    // Edge fade: the distance from the element's unscaled box to the nearest edge of the view sets its opacity,
    // and its size from 100% down to EDGE_SCALE. The scale is applied to the zero-size anchor, so it shrinks
    // towards the anchored photo point without moving it. Sizes are measured on build and on open/close only.
    function measureOne(node) {
      const box = node.querySelector('.tw-bubble-float'), size = {w: box.offsetWidth, h: box.offsetHeight};
      if (size.w) sizes.set(node, size);
      return size;
    }
    function measure() { anchored.forEach(measureOne); fade(); }
    function anchorAt(node) {
      const marker = markerOf.get(node);
      if (marker) return marker.hidden || !Number.isFinite(marker.x) ? null : {x: marker.x, y: marker.y, w: viewer.w, h: viewer.h};
      if (viewer?.bw) {
        const u = Number(node.dataset.u), v = Number(node.dataset.v);
        return {x: viewer.w / 2 + viewer.x + (u - .5) * viewer.bw * viewer.zoom, y: viewer.h / 2 + viewer.y + (v - .5) * viewer.bh * viewer.zoom, w: viewer.w, h: viewer.h};
      }
      return null;
    }
    function fade() {
      if (destroyed) return;
      for (const node of anchored) {
        const at = anchorAt(node), size = at && (sizes.get(node) || measureOne(node));
        let k = 0;
        if (at && size.w) {
          const gap = Math.min(at.x - size.w / 2, at.w - at.x - size.w / 2, at.y - 4 - size.h - BOB, at.h - at.y);
          k = Math.round(clamp(gap / EDGE, 0, 1) * 100) / 100;
        }
        if (edge.get(node) === k) continue;
        edge.set(node, k);
        node.style.setProperty('--edge-alpha', k);
        node.style.setProperty('--edge-scale', (EDGE_SCALE + (1 - EDGE_SCALE) * k).toFixed(3));
        const out = k === 0;
        if (node.inert !== out) { node.inert = out; node.classList.toggle('is-out', out); }
      }
    }
    // Run after every viewer repaint: the immersive viewer reprojects its markers each frame, the flat one paints.
    const hookName = typeof viewer?.projectMarkers === 'function' ? 'projectMarkers' : typeof viewer?.paint === 'function' ? 'paint' : '';
    const hookOwn = hookName && Object.prototype.hasOwnProperty.call(viewer, hookName), hookOriginal = hookName && viewer[hookName];
    if (hookName) viewer[hookName] = function (...args) { const result = hookOriginal.apply(this, args); fade(); return result; };
    const unhook = () => { if (!hookName) return; if (hookOwn) viewer[hookName] = hookOriginal; else delete viewer[hookName]; };

    const toggleButton = node => node.querySelector('.tw-bubble-body, .tw-bundle-pill');
    function setOpen(node, open) {
      node.classList.toggle('open', open);
      toggleButton(node).setAttribute('aria-expanded', String(open));
      measureOne(node);
    }
    function toggleOpen(node) {
      const open = !node.classList.contains('open');
      plane.querySelectorAll('.tw-bubble.open, .tw-bundle.open').forEach(other => { if (other !== node) setOpen(other, false); });
      setOpen(node, open);
      fade();
    }
    function like(holder, button) {
      const id = holder.dataset.id, on = window.TWStore.update(data => { if (data.likes[id]) delete data.likes[id]; else data.likes[id] = true; return !!data.likes[id]; });
      const note = notes(scene.id).find(n => n.id === id);
      button.setAttribute('aria-pressed', String(on)); button.querySelector('b').textContent = likes(note);
      if (on) { button.classList.remove('pop'); void button.offsetWidth; button.classList.add('pop'); }
    }

    let picked = null, down = null;
    const setPin = (u, v) => {
      picked = {u, v};
      let pin = plane.querySelector('.tw-pin');
      if (!pin) {
        plane.insertAdjacentHTML('beforeend', `<div class="tw-pin"><div class="tw-bubble-float"><span class="tw-bubble-body">${avatar({mine: true}, 22)}<span class="tw-bubble-text">${t('我的留言', 'My note')}</span></span></div></div>`);
        pin = plane.querySelector('.tw-pin');
      }
      pin.dataset.u = u; pin.dataset.v = v;
      pin.style.left = `${(u * 100).toFixed(2)}%`; pin.style.top = `${(v * 100).toFixed(2)}%`;
      markers();
      placing?.querySelector('[data-place-ok]')?.removeAttribute('disabled');
    };
    // A tap (not a drag) on the view drops the pin there.
    const onDown = event => { down = event.target.closest('.tw-place-actions') ? null : {x: event.clientX, y: event.clientY}; };
    const onUp = event => {
      if (!placing || !down) return;
      const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y); down = null;
      if (moved > 8) return;
      const {u, v} = pointUV(root, viewer, event.clientX, event.clientY);
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) setPin(clamp(u, .04, .96), clamp(v, .1, .9));
    };
    function startPlacing() {
      if (placing) return;
      page.classList.add('tw-placing');
      placing = document.createElement('div');
      placing.className = 'tw-place';
      placing.innerHTML = `<p class="tw-place-hint">${t('点击画面，选一个想留言的位置', 'Tap the view to choose where your note goes')}</p><div class="tw-place-actions"><button class="tw-place-cancel" data-place-cancel>${t('取消', 'Cancel')}</button><button class="tw-place-ok" data-place-ok disabled>${t('放在这里', 'Place here')}</button></div>`;
      page.append(placing);
      page.addEventListener('pointerdown', onDown, true);
      page.addEventListener('pointerup', onUp, true);
    }
    function stopPlacing() {
      placing?.remove(); placing = null; picked = null; down = null; page.classList.remove('tw-placing');
      page.removeEventListener('pointerdown', onDown, true); page.removeEventListener('pointerup', onUp, true);
      plane.querySelector('.tw-pin')?.remove(); markers();
    }
    function confirmPlace() {
      if (!picked) return;
      let {u, v} = picked;
      // Keep clear of the clue hotspots so a note never covers one.
      if (scene.hotspots.some(h => Math.hypot(h.x / 100 - u, (h.y / 100 - v) * .7) < .07)) v = clamp(v + .1, .1, .9);
      stopPlacing();
      onCompose?.({u, v});
    }
    function add({u, v, text}) {
      const id = `me-${Date.now().toString(36)}`;
      window.TWStore.update(data => { (data.bubbles[scene.id] ||= []).unshift({id, u, v, text: [...text].slice(0, MAX_LENGTH).join(''), at: Date.now(), likes: 0}); });
      freshId = id; build();
      const node = el(id);
      if (node) { node.classList.add('fresh'); toggleOpen(node); }
    }

    const onClick = event => {
      const target = event.target;
      if (target.closest('[data-place-cancel]')) { stopPlacing(); return; }
      if (target.closest('[data-place-ok]')) { confirmPlace(); return; }
      const node = target.closest('.tw-bubble, .tw-bundle');
      if (!node || node.classList.contains('tw-pin')) return;
      const heart = target.closest('.tw-bubble-like');
      if (heart) like(heart.closest('[data-id]'), heart); else if (target.closest('.tw-bubble-body, .tw-bundle-pill')) toggleOpen(node);
    };
    page.addEventListener('click', onClick);
    // A plain tap opens the note composer at the tapped photo point. Panning,
    // pinching, existing note controls and clue buttons keep their own gestures.
    const touches=new Map();let composeTimer=0;
    const tapDown=event=>{
      clearTimeout(composeTimer);
      if(event.button||placing||event.target.closest('button,a,input,textarea,.tw-bubble,.tw-bundle,.hotspot'))return;
      touches.set(event.pointerId,{x:event.clientX,y:event.clientY,moved:false});
      if(touches.size>1)for(const touch of touches.values())touch.moved=true;
    };
    const tapMove=event=>{const touch=touches.get(event.pointerId);if(touch&&Math.hypot(event.clientX-touch.x,event.clientY-touch.y)>8)touch.moved=true;};
    const tapUp=event=>{
      const touch=touches.get(event.pointerId);touches.delete(event.pointerId);
      if(!touch||touch.moved||destroyed||placing||Math.hypot(event.clientX-touch.x,event.clientY-touch.y)>8)return;
      if(document.querySelector('#modal-root')?.firstElementChild||window.ChallengeMotion?.busy)return;
      const at=pointUV(root,viewer,event.clientX,event.clientY);
      if(at&&at.u>=0&&at.u<=1&&at.v>=0&&at.v<=1)composeTimer=setTimeout(()=>{if(!destroyed&&!document.querySelector('#modal-root')?.firstElementChild&&!window.ChallengeMotion?.busy)onCompose?.(at);},220);
    };
    const tapCancel=event=>touches.delete(event.pointerId);
    const doubleTap=()=>clearTimeout(composeTimer);
    root.addEventListener('pointerdown',tapDown,true);root.addEventListener('pointermove',tapMove,true);
    root.addEventListener('pointerup',tapUp,true);root.addEventListener('pointercancel',tapCancel,true);
    root.addEventListener('dblclick',doubleTap,true);
    build();
    return {
      add,
      place: startPlacing,
      destroy() { destroyed = true; unhook(); page.removeEventListener('click', onClick); stopPlacing();root.removeEventListener('pointerdown',tapDown,true);root.removeEventListener('pointermove',tapMove,true);root.removeEventListener('pointerup',tapUp,true);root.removeEventListener('pointercancel',tapCancel,true);root.removeEventListener('dblclick',doubleTap,true);clearTimeout(composeTimer);touches.clear(); plane.querySelectorAll('.tw-bubble, .tw-bundle').forEach(node => node.remove()); }
    };
  }

  function composeMarkup() {
    return `<div class="tw-compose"><p class="tw-compose-lead">${t('留给之后来到这里的旅人', 'For the travellers who come here next')}</p><textarea maxlength="${MAX_LENGTH}" rows="3" aria-label="${t('留言内容', 'Your note')}" placeholder="${t('写一句话，比如：清晨来人最少', 'One line, e.g. “Come early, it’s quiet”')}"></textarea><div class="tw-compose-foot"><small><span data-compose-count>0</span>/${MAX_LENGTH} · ${t('只保存在本机', 'Saved on this device only')}</small><button class="primary tw-compose-submit" data-compose-submit disabled>${t('放上气泡', 'Post')}</button></div></div>`;
  }
  function bindCompose(sheet, onSubmit) {
    const field = sheet.querySelector('textarea'), submit = sheet.querySelector('[data-compose-submit]'), count = sheet.querySelector('[data-compose-count]');
    const sync = () => { count.textContent = [...field.value].length; submit.disabled = !field.value.trim(); };
    sheet.addEventListener('click', event => {
      if (event.target.closest('[data-compose-submit]') && !submit.disabled) onSubmit({text: field.value.trim()});
    });
    field.addEventListener('input', sync);
  }

  const toggleLike = id => window.TWStore.update(data => { if (data.likes[id]) delete data.likes[id]; else data.likes[id] = true; return !!data.likes[id]; });

  window.SceneBubbles = Object.freeze({mount, composeMarkup, bindCompose, toggleLike});
})();
