/* Spatial note clusters: each wooden sign stays at its photo location. Hover/tap opens only that spot’s list.
   Existing device-local notes, filters, likes and placement coordinates stay intact. */
(() => {
  'use strict';
  const t = (zh, en) => window.I18N.t(zh, en), isEn = () => window.I18N.isEn();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const FILTERS = ['all', 'been', 'want', 'off'], PREF = 'tripwonder-bubble-filter', MAX_LENGTH = 40;
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
  function pointUV(root, viewer, clientX, clientY) {
    if (Array.isArray(viewer?.markers) && viewer.state && viewer.eye) {
      // Inverse of the immersive projection (see projectMarkers): screen point -> ray -> cylinder -> photo coordinates.
      const view = root.getBoundingClientRect();
      const sx = (clientX - view.left) / view.width, sy = (clientY - view.top) / view.height;
      const yaw = rad(viewer.state.yaw), r = viewer.config.radius;
      const angle = (sx - .5) * 2 * Math.atan(viewer.th), slope = Math.tan(rad(viewer.state.pitch)) + viewer.tv * (1 - 2 * sy);
      const dx = Math.sin(yaw) * Math.cos(angle) + Math.cos(yaw) * Math.sin(angle), dz = -Math.cos(yaw) * Math.cos(angle) + Math.sin(yaw) * Math.sin(angle);
      const ex = viewer.eye.x, ez = viewer.eye.z;
      const b = ex * dx + ez * dz, k = ex * ex + ez * ez - r * r, hit = -b + Math.sqrt(Math.max(0, b * b - k));
      const hx = ex + hit * dx, hz = ez + hit * dz;
      return {u: .5 + Math.atan2(hx, -hz) / (2 * viewer.halfH), v: .5 - hit * slope / (r * 2 * viewer.tanV)};
    }
    const plane = root.querySelector('.photo-plane').getBoundingClientRect();
    return {u: (clientX - plane.left) / plane.width, v: (clientY - plane.top) / plane.height};
  }
  // A small coloured initial stands in for a profile picture.
  const hueOf = text => { let h = 0; for (const c of String(text)) h = (h * 31 + c.codePointAt(0)) % 360; return h; };

  // Group in photo space, never by a fixed corner or by transient screen overlap.
  // Each group is bounded in diameter, so a chain cannot merge separate landmarks.
  function groupNotes(items, aspect = 1) {
    const scale = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
    const distance = (a, b) => Math.hypot(a.u-b.u, (a.v-b.v)/scale);
    const groups = [];
    for (const note of [...items].filter(n => Number.isFinite(n.u) && Number.isFinite(n.v) && n.u>=0 && n.u<=1 && n.v>=0 && n.v<=1).sort((a,b) => a.u-b.u || a.v-b.v || String(a.id).localeCompare(String(b.id)))) {
      const group = groups.find(g => g.notes.every(other => distance(note, other) <= .045));
      if (group) group.notes.push(note);
      else groups.push({u: note.u, v: note.v, notes: [note]});
    }
    return groups;
  }

  function mount({root, viewer, scene, hiddenNames = [], onCompose}) {
    const page = root.closest('.page'), plane = root.querySelector('.photo-plane');
    if (!page || !plane) return {destroy() {}};
    const pattern = hiddenNames.filter(n => n && n.length > 1).sort((a,b) => b.length-a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const mask = text => pattern.length ? String(text || '').replace(new RegExp(pattern.join('|'), 'gi'), t('这里', 'here')) : String(text || '');
    const textOf = note => mask(note.mine ? note.text : isEn() ? note.textEn : note.text);
    const nameOf = note => note.mine ? t('我', 'Me') : isEn() ? note.nameEn : note.name;
    let filter = readPref(), destroyed = false, placing = null, picked = null, down = null;
    let active = null, pinned = false, closeTimer = 0;
    const placementPointers = new Set();
    const bar = document.createElement('div'), panel = document.createElement('section');
    bar.className = 'tw-bubble-bar'; panel.className = 'tw-notes-panel'; panel.hidden = true;
    panel.id = 'tw-place-notes-' + scene.id.replace(/[^a-z0-9-]/gi, '-');
    panel.setAttribute('aria-label', t('这个位置的留言', 'Notes at this spot'));
    page.append(bar, panel);
    const stopClose = () => { clearTimeout(closeTimer); closeTimer = 0; };
    function closePanel() {
      stopClose(); panel.hidden = true; pinned = false;
      active?.element.classList.remove('open');
      active?.element.querySelector('button').setAttribute('aria-expanded', 'false');
      active = null;
    }
    function scheduleClose() {
      stopClose();
      closeTimer = setTimeout(() => { if (!pinned && !panel.contains(document.activeElement)) closePanel(); }, 240);
    }
    function positionPanel() {
      if (!active || panel.hidden) return;
      const a = active.element.querySelector('button').getBoundingClientRect(), p = page.getBoundingClientRect();
      panel.style.maxHeight = Math.max(100, Math.min(330, p.height-100))+'px';
      const w = panel.offsetWidth, h = panel.offsetHeight;
      panel.style.left = clamp(a.left+a.width/2-p.left-w/2, 10, Math.max(10,p.width-w-10))+'px';
      const below = a.bottom-p.top+10;
      panel.style.top = clamp(below+h<=p.height-12 ? below : a.top-p.top-h-10, 12, Math.max(12,p.height-h-12))+'px';
    }
    function openGroup(group, element) {
      if (destroyed || placing) return;
      stopClose();
      if (active?.element === element && !panel.hidden) return;
      closePanel(); active = {group, element};
      element.classList.add('open'); element.querySelector('button').setAttribute('aria-expanded','true');
      panel.innerHTML = `<div class="tw-notes-heading"><strong>${t('此处留言', 'Notes at this spot')} · ${group.notes.length}</strong><button type="button" data-notes-close aria-label="${t('关闭列表','Close notes')}">×</button></div><div class="tw-notes-list">${group.notes.map(note => `<article class="tw-note-row" data-id="${esc(note.id)}"><button type="button" class="tw-note-summary" aria-expanded="false"><span class="tw-bubble-avatar" aria-hidden="true">${esc([...nameOf(note)][0] || '')}</span><span class="tw-note-author">${esc(nameOf(note))}<small>${kindLabel(note.kind)}${note.seed ? ' · '+t('示例','Sample') : ''}</small></span><span class="tw-note-read">${t('展开','Read')} ›</span></button><div class="tw-note-detail" hidden><p>${esc(textOf(note))}</p><button type="button" class="tw-bubble-like" aria-pressed="${liked(note)}" aria-label="${t('点赞','Like')}">♥ <b>${likes(note)}</b></button></div></article>`).join('')}</div>`;
      panel.hidden = false; positionPanel();
    }
    function markers() {
      if (!Array.isArray(viewer?.markers)) return;
      viewer.markers = viewer.markers.filter(m => !m.element.classList.contains('tw-note-cluster') && !m.element.classList.contains('tw-pin'));
      plane.querySelectorAll('.tw-note-cluster, .tw-pin').forEach(element => viewer.markers.push({element, u:Number(element.dataset.u), v:Number(element.dataset.v), x:NaN, y:NaN, hidden:null}));
      viewer.projectMarkers?.();
    }
    function build() {
      closePanel();
      plane.querySelectorAll('.tw-note-cluster').forEach(node => node.remove());
      const list = filter === 'off' ? [] : notes(scene.id).filter(n => filter === 'all' || n.kind === filter);
      const aspect = scene.photo?.width / scene.photo?.height;
      for (const group of groupNotes(list, aspect)) {
        const element = document.createElement('div');
        element.className = 'tw-note-cluster'; element.dataset.u = group.u; element.dataset.v = group.v;
        element.style.left = `${group.u*100}%`; element.style.top = `${group.v*100}%`;
        element.innerHTML = `<button type="button" class="tw-wood-sign" aria-expanded="false" aria-controls="${panel.id}" aria-label="${t(`此处有${group.notes.length}条留言`,`${group.notes.length} notes at this spot`)}"><span class="tw-wood-leaf" aria-hidden="true">♧</span><b>${group.notes.length}</b></button>`;
        element.addEventListener('pointerenter', event => { if(event.pointerType==='mouse') openGroup(group, element); });
        element.addEventListener('pointerleave', scheduleClose);
        element.querySelector('button').onclick = () => {
          if (active?.element===element && pinned) { closePanel(); return; }
          openGroup(group, element); pinned = true;
        };
        plane.append(element);
      }
      bar.innerHTML = `<button type="button" data-bubble-filter>${t('留言','Notes')} · ${filterLabel(filter)}</button><button type="button" data-bubble-new>＋ ${t('选点留言','Pick a spot')}</button>`;
      if(viewer?.ready)Promise.resolve(viewer.ready).then(()=>{if(!destroyed)markers();},()=>{});else markers();
    }
    const onOutside = event => { if (!panel.contains(event.target) && !event.target.closest('.tw-note-cluster')) closePanel(); };
    const onKey = event => { if(event.key==='Escape' && active){const button=active.element.querySelector('button');event.preventDefault();closePanel();button.focus();} };
    const onPanelClick = event => {
      if(event.target.closest('[data-notes-close]')){closePanel();return;}
      const row = event.target.closest('.tw-note-row'); if(!row)return;
      const note = active?.group.notes.find(n=>n.id===row.dataset.id);if(!note)return;
      const likeButton=event.target.closest('.tw-bubble-like');
      if(likeButton){const id=note.id;window.TWStore.update(data=>{if(data.likes[id])delete data.likes[id];else data.likes[id]=true;});likeButton.setAttribute('aria-pressed',String(liked(note)));likeButton.querySelector('b').textContent=likes(note);return;}
      if(event.target.closest('.tw-note-summary')){
        const detail=row.querySelector('.tw-note-detail'),open=detail.hidden;
        panel.querySelectorAll('.tw-note-row').forEach(other=>{other.querySelector('.tw-note-detail').hidden=true;other.querySelector('.tw-note-summary').setAttribute('aria-expanded','false');});
        detail.hidden=!open;row.querySelector('.tw-note-summary').setAttribute('aria-expanded',String(open));pinned=true;positionPanel();
      }
    };
    panel.addEventListener('pointerenter', stopClose); panel.addEventListener('pointerleave',scheduleClose);panel.addEventListener('click',onPanelClick);
    page.addEventListener('keydown',onKey);document.addEventListener('pointerdown',onOutside);root.addEventListener('wheel',closePanel,{passive:true});window.addEventListener('resize',closePanel);
    function setPin(u,v){
      picked={u,v};let pin=plane.querySelector('.tw-pin');
      if(!pin){plane.insertAdjacentHTML('beforeend',`<div class="tw-pin"><div class="tw-bubble-float"><span class="tw-bubble-body">${t('我的留言','My note')}</span></div></div>`);pin=plane.querySelector('.tw-pin');}
      pin.dataset.u=u;pin.dataset.v=v;pin.style.left=`${u*100}%`;pin.style.top=`${v*100}%`;markers();placing?.querySelector('[data-place-ok]')?.removeAttribute('disabled');
    }
    const onDown=event=>{placementPointers.add(event.pointerId);if(placementPointers.size>1){if(down)down.moved=true;return;}down=event.target.closest('button')?null:{id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};};
    const onMove=event=>{if(down&&(event.pointerId!==down.id||Math.hypot(event.clientX-down.x,event.clientY-down.y)>8))down.moved=true;};
    const onUp=event=>{placementPointers.delete(event.pointerId);const start=down;down=null;if(!placing||!start||start.moved||start.id!==event.pointerId||Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)return;const {u,v}=pointUV(root,viewer,event.clientX,event.clientY);if(u>=0&&u<=1&&v>=0&&v<=1)setPin(u,v);};
    const cancelPointer=()=>{down=null;placementPointers.clear();};
    function startPlacing(){
      if(placing)return;closePanel();page.classList.add('tw-placing');placing=document.createElement('div');placing.className='tw-place';
      placing.innerHTML=`<p class="tw-place-hint">${t('点击画面，选一个想留言的位置','Tap the view to choose your note’s location')}</p><div class="tw-place-actions"><button type="button" class="tw-place-cancel" data-place-cancel>${t('取消','Cancel')}</button><button type="button" class="tw-place-ok" data-place-ok disabled>${t('放在这里','Place here')}</button></div>`;
      page.append(placing);page.addEventListener('pointerdown',onDown,true);page.addEventListener('pointermove',onMove,true);page.addEventListener('pointerup',onUp,true);page.addEventListener('pointercancel',cancelPointer,true);
    }
    function stopPlacing(){placing?.remove();placing=null;picked=null;down=null;placementPointers.clear();page.classList.remove('tw-placing');page.removeEventListener('pointerdown',onDown,true);page.removeEventListener('pointermove',onMove,true);page.removeEventListener('pointerup',onUp,true);page.removeEventListener('pointercancel',cancelPointer,true);plane.querySelector('.tw-pin')?.remove();markers();}
    function add({u,v,kind,text}){
      const id=`me-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
      window.TWStore.update(data=>{(data.bubbles[scene.id]||=[]).unshift({id,u,v,kind,text:[...text].slice(0,MAX_LENGTH).join(''),at:Date.now(),likes:0});});
      if(filter==='off'||(filter!=='all'&&filter!==kind)){filter='all';writePref(filter);}build();
    }
    const onClick=event=>{
      if(event.target.closest('[data-bubble-filter]')){filter=FILTERS[(FILTERS.indexOf(filter)+1)%FILTERS.length];writePref(filter);build();return;}
      if(event.target.closest('[data-bubble-new]')){startPlacing();return;}
      if(event.target.closest('[data-place-cancel]')){stopPlacing();return;}
      if(event.target.closest('[data-place-ok]')&&picked){const point={...picked};stopPlacing();onCompose?.(point);}
    };
    page.addEventListener('click',onClick);build();
    return {add,destroy(){destroyed=true;closePanel();document.removeEventListener('pointerdown',onOutside);page.removeEventListener('keydown',onKey);page.removeEventListener('click',onClick);root.removeEventListener('wheel',closePanel);window.removeEventListener('resize',closePanel);stopPlacing();plane.querySelectorAll('.tw-note-cluster').forEach(node=>node.remove());markers();panel.remove();bar.remove();}};
  }

  function composeMarkup() {
    return `<div class="tw-compose"><p class="tw-compose-lead">${t('留给之后来到这里的旅人', 'For the travellers who come here next')}</p><div class="tw-compose-kinds" role="radiogroup" aria-label="${t('你去过这里吗', 'Have you been here?')}"><button role="radio" aria-checked="false" data-compose-kind="been">${t('我去过', 'I’ve been')}</button><button role="radio" aria-checked="false" data-compose-kind="want">${t('还没去过', 'Not yet')}</button></div><textarea maxlength="${MAX_LENGTH}" rows="3" aria-label="${t('留言内容', 'Your note')}" placeholder="${t('写一句话，比如：清晨来人最少', 'One line, e.g. “Come early, it’s quiet”')}"></textarea><div class="tw-compose-foot"><small><span data-compose-count>0</span>/${MAX_LENGTH} · ${t('只保存在本机', 'Saved on this device only')}</small><button class="primary tw-compose-submit" data-compose-submit disabled>${t('放进留言簿', 'Post note')}</button></div></div>`;
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

  window.SceneBubbles = Object.freeze({mount, composeMarkup, bindCompose, groupNotes});
})();
