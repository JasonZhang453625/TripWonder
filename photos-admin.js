/* Official and player journey management share the local admin API. */
(() => {
  'use strict';
  const catalog = window.TRIPWONDER_CATALOG;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaults = {quizSeconds:60, points:[20,20,20], guess:{max:40,fullKm:25,decayKm:450}};
  const view = document.getElementById('view');
  const tabs = [...document.querySelectorAll('[data-library-tab]')];
  let backend = {online:false,journeys:[],jobs:[]}, pollTimer = 0, reviewFilter = 'all';
  const channelOf = d => d.channel === 'ugc' ? 'ugc' : 'official';
  const rulesOf = d => ({...defaults,...d.rules,guess:{...defaults.guess,...(d.guess || d.rules?.guess)}});
  const route = () => new URLSearchParams(location.hash.slice(1));
  const tabName = tab => tab === 'ugc' ? 'UGC 审核管理' : '官方旅程';
  const listUrl = tab => `#tab=${tab}`;
  const detailUrl = d => `#tab=${channelOf(d)}&dest=${encodeURIComponent(d.id)}`;
  const thumb = s => s.photo?.thumb?.src || window.MEDIA_ASSETS?.[s.photo?.id]?.thumb?.src || s.photo?.src;
  const authorName = d => typeof d.author === 'string' ? d.author : d.author?.name || '玩家';

  async function loadBackend() {
    try {
      const r = await fetch('/api/journeys', {cache:'no-store'});
      if (!r.ok) throw new Error();
      const data = await r.json();
      backend = {online:true,journeys:data.journeys || [],jobs:data.jobs || []};
    } catch { backend = {online:false,journeys:[],jobs:[]}; }
  }
  function destinations() {
    const stored = backend.journeys.map(d => ({...d,channel:channelOf(d),rules:rulesOf(d),kind:'db'}));
    const known = new Set(stored.map(d => d.id));
    const builtin = [...catalog.cities, ...(window.UGC_JOURNEYS || [])].filter(d => !known.has(d.id)).map(d => ({
      ...d,channel:channelOf(d),rules:rulesOf(d),kind:'builtin',status:'ready',review:'approved'
    }));
    const jobs = backend.jobs.filter(j => !known.has(j.destinationId)).map(job => ({
      id:job.destinationId,name:job.name,channel:channelOf(job),kind:'job',job,scenes:[],status:job.status
    }));
    return [...builtin,...stored,...jobs];
  }
  function statusPill(d) {
    if (d.kind === 'job') return d.status === 'failed' ? '<span class="pill err">生成失败</span>' : '<span class="pill warn">生成中…</span>';
    if (d.kind === 'builtin') return '<span class="pill mute">内置示例 · 只读</span>';
    if (d.status === 'disabled') return '<span class="pill mute">已停用</span>';
    if (d.channel === 'ugc') return d.review === 'approved' ? '<span class="pill ok">审核通过 · 社区可见</span>' : `<span class="pill warn">${d.review==='rejected'?'已退回 · 等待修改':'待审核 · 社区隐藏'}</span>`;
    return d.review === 'approved' ? '<span class="pill ok">已启用 · 已核对</span>' : '<span class="pill warn">已启用 · 待核对</span>';
  }
  function stepList(job) {
    return `<ul class="steps">${job.steps.map(s => `<li class="${esc(s.status)}"><span class="mark">${{done:'✓',running:'…',failed:'✕',skipped:'–',pending:'·'}[s.status] || '·'}</span><span>${esc(s.label)}${s.detail ? ` · ${esc(s.detail)}` : ''}</span></li>`).join('')}</ul>`;
  }
  function jobActions(job) {
    return job.status === 'failed' ? `<div class="card-actions"><button class="btn solid" data-retry="${esc(job.id)}">重试</button><button class="btn danger" data-discard="${esc(job.id)}">放弃</button></div>` : '';
  }
  function renderList(tab, all) {
    const channelList = all.filter(d => channelOf(d) === tab);
    const pending = channelList.filter(d => d.kind === 'db' && d.review !== 'approved' && d.status !== 'disabled').length;
    const list = channelList.filter(d => tab !== 'ugc' || reviewFilter === 'all' || (reviewFilter === 'pending' ? d.kind === 'db' && d.review !== 'approved' && d.status !== 'disabled' : reviewFilter === 'disabled' ? d.status === 'disabled' : d.review === 'approved' && d.status !== 'disabled'));
    const note = backend.online ? '' : '<div class="notice">后台服务未连接：当前只能查看内置示例。运行 <code>node admin/server.mjs</code> 并访问 http://127.0.0.1:8787/photos.html 即可上传和管理旅程。</div>';
    const add = backend.online ? `<a class="btn solid" href="journey-new.html?channel=${tab}">${tab === 'ugc' ? '＋ 录入 UGC Journey' : '＋ 上传官方 Journey'}</a>` : '';
    const filters = tab === 'ugc' ? `<label class="library-filter">审核状态 <select id="review-filter">${[['all','全部'],['pending','待审核'],['approved','已通过'],['disabled','已停用']].map(([v,label]) => `<option value="${v}"${v === reviewFilter ? ' selected' : ''}>${label}</option>`).join('')}</select></label>` : '';
    const summary = tab === 'ugc' ? '审核玩家提交的 Journey，通过后才进入社区；撤回审核或停用后会从社区隐藏。内置示例仅供查看。' : '维护官方目的地、上传场景照片并查看生成进度。启用的官方 Journey 进入今日挑战，内置目的地仅供查看。';
    view.innerHTML = `${note}<p class="library-summary">${summary}</p><div class="library-bar"><span class="library-count">共 ${channelList.length} 个 Journey${tab === 'ugc' ? ` · ${pending} 个待审核` : ''}${list.length !== channelList.length ? ` · 当前显示 ${list.length} 个` : ''}</span><div class="library-tools">${filters}${add}</div></div>${list.length ? `<div class="photo-grid">${list.map(d => {
      const first = d.scenes[0];
      const image = first && thumb(first) ? `<img src="${esc(thumb(first))}" alt="${esc(d.name)}" loading="lazy" decoding="async">` : `<div class="dest-ph">${esc(d.name.slice(0,2))}</div>`;
      const meta = d.kind === 'job' ? stepList(d.job) : `<p>${d.scenes.length} 个场景 · ${d.questions.length} 道题 · 倒计时 ${d.rules.quizSeconds} 秒</p>`;
      return `<article class="photo-card dest-card" tabindex="0" role="link" data-dest="${esc(d.id)}" aria-label="${esc(d.name)}"><div class="photo-preview">${image}</div><div class="details"><div class="pill-row">${d.region ? `<span class="pill">${esc(d.region)}</span>` : ''}${statusPill(d)}</div><h2>${esc(d.name)}</h2>${d.channel === 'ugc' && d.kind !== 'job' ? `<div class="library-author">${esc(d.title || '')} · 发布者：${esc(authorName(d))}</div>` : ''}${meta}${d.job?.error ? `<p style="color:#c53030">${esc(d.job.error)}</p>` : ''}${d.kind === 'job' ? jobActions(d.job) : ''}</div></article>`;
    }).join('')}</div>` : `<div class="library-empty"><strong>${reviewFilter === 'pending' && tab === 'ugc' ? '暂无待审核的 UGC' : '暂无符合条件的 Journey'}</strong>${tab === 'ugc' ? '玩家内容和生成任务会显示在这里，可切换审核状态查看。' : '点击「上传官方 Journey」添加新的目的地。'}</div>`}`;
  }
  function sceneCard(d, scene) {
    const p = scene.photo;
    const license = p.licenseUrl || ({'CC0 1.0':'https://creativecommons.org/publicdomain/zero/1.0/','CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/','CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/','CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/'}[p.license]);
    return `<article class="photo-card"><div class="photo-preview"><img src="${esc(thumb(scene))}" alt="${esc(scene.name)}" loading="lazy" decoding="async"></div><div class="details"><span class="pill">${esc(d.name)}</span><h2>${esc(scene.name)}</h2><p>展示版 ${p.width} × ${p.height} px · ${esc(p.credit || '用户提供')}${p.license ? ` · ${license ? `<a href="${esc(license)}" target="_blank" rel="noopener noreferrer">${esc(p.license)}</a>` : esc(p.license)}` : ''}</p><div class="library-source"><a href="${esc(p.sourceOriginal || p.src)}" target="_blank" rel="noopener noreferrer">查看原始素材或来源预览 ↗</a>${p.source?.startsWith('http') ? `<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">素材来源 ↗</a>` : ''}</div>${scene.hotspots?.length ? `<details><summary>${scene.hotspots.length} 个讲解点</summary>${scene.hotspots.map(h => `<p class="hs"><b>${esc(h.title)}</b>（${esc(h.tag)} · ${h.x}%, ${h.y}%）<br>${esc(h.text)}</p>`).join('')}</details>` : ''}</div></article>`;
  }
  function renderDetail(d, tab) {
    document.title = `${d.name} · ${tabName(tab)} · TripWonder`;
    const back = `<div class="library-bar"><a class="btn" href="${listUrl(tab)}">← 返回${tabName(tab)}</a></div>`;
    if (d.kind === 'job') {
      view.innerHTML = `${back}<div class="panel"><h2>${esc(d.name)}</h2>${statusPill(d)}${stepList(d.job)}${d.job.error ? `<p>${esc(d.job.error)}</p>` : ''}${jobActions(d.job)}</div>`;
      return;
    }
    const r = d.rules, g = r.guess;
    const reviewAction = d.channel === 'ugc'
      ? `<button class="btn${d.review !== 'approved' ? ' solid' : ''}" data-review="${d.review === 'approved' ? 'pending' : 'approved'}">${d.review === 'approved' ? '撤回审核（社区隐藏）' : '审核通过'}</button><button class="btn" data-review="rejected">退回修改</button>`
      : (d.review !== 'approved' ? '<button class="btn" data-review="approved">标记为已核对</button>' : '');
    const actions = d.kind === 'db' ? `<div class="detail-actions">${reviewAction}<button class="btn" data-toggle="${d.status === 'disabled' ? 'ready' : 'disabled'}">${d.status === 'disabled' ? '重新启用' : '停用'}</button><button class="btn danger" data-delete="1">删除</button></div>` : '';
    const flags = d.generated?.flags?.length ? `<div class="notice"><b>待人工核对：</b><ul>${d.generated.flags.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>` : '';
    const rules = `<div class="panel"><h3>游戏规则</h3><div class="rule-grid"><div><small>挑战总时长</small><b>${r.quizSeconds} 秒</b></div><div><small>三题分值</small><b>${r.points.join(' / ')}</b></div><div><small>定位满分</small><b>${g.max} 分</b></div><div><small>满分半径</small><b>${g.fullKm} km</b></div><div><small>距离衰减尺度</small><b>${g.decayKm} km</b></div>${d.lat != null ? `<div><small>地图坐标</small><b>${d.lat}, ${d.lng}</b></div>` : ''}</div></div>`;
    const qs = `<div class="panel"><h3>题目</h3>${d.questions.map((q,i) => `<div class="qa"><b>${i+1}. ${q.level ? `〔${['','热身','推理','挑战'][q.level] || ''}〕` : ''}${esc(q.q)}</b>${q.options.map((o,k) => `<span class="opt${k === q.answer ? ' right' : ''}">${'ABCD'[k]}. ${esc(o)}${k === q.answer ? ' ✓' : ''}</span>`).join('')}<span class="hs">${esc(q.explain)}</span></div>`).join('')}</div>`;
    view.innerHTML = `${back}<div class="detail-head"><div>${statusPill(d)}<h1>${esc(d.name)}</h1>${d.channel === 'ugc' ? `<p class="library-author">${esc(d.title || '')} · 发布者：${esc(authorName(d))} · 留言板${d.boardEnabled === false ? '关闭' : '开启'}</p>` : ''}${d.intro ? `<p class="library-intro">${esc(d.intro)}</p>` : ''}</div>${actions}</div>${d.kind === 'builtin' ? '<p class="library-summary">这是随项目内置的只读内容。需在对应内容文件中维护，不支持后台审核、停用或删除。</p>' : ''}${flags}<div class="photo-grid">${d.scenes.map(s => sceneCard(d,s)).join('')}</div>${rules}${qs}`;
    view.dataset.dest = d.id;
  }
  function render() {
    delete view.dataset.dest;
    const params = route(), all = destinations(), d = all.find(d => d.id === params.get('dest'));
    const tab = d ? channelOf(d) : params.get('tab') === 'ugc' ? 'ugc' : 'official';
    tabs.forEach(t => {
      const selected = t.dataset.libraryTab === tab;
      t.setAttribute('aria-selected', selected);
      t.tabIndex = selected ? 0 : -1;
      t.querySelector('.tab-count').textContent = all.filter(d => channelOf(d) === t.dataset.libraryTab).length;
    });
    view.setAttribute('aria-labelledby', `tab-${tab}`);
    document.title = `${tabName(tab)} · 目的地旅程库 · TripWonder`;
    if (d) renderDetail(d,tab); else renderList(tab,all);
    clearTimeout(pollTimer);
    if (backend.jobs.some(j => j.status === 'running' || j.status === 'queued')) pollTimer = setTimeout(refresh,2000);
  }
  async function refresh() { await loadBackend(); render(); }
  async function call(url,method,body) {
    const r = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:body ? JSON.stringify(body) : undefined});
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || r.statusText);
    return data;
  }
  tabs.forEach((t,i) => {
    t.addEventListener('click', () => { location.hash = listUrl(t.dataset.libraryTab); });
    t.addEventListener('keydown', e => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const next = tabs[e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length-1 : (i+(e.key === 'ArrowRight' ? 1 : -1)+tabs.length)%tabs.length];
      next.click(); next.focus();
    });
  });
  view.addEventListener('change', e => { if (e.target.id === 'review-filter') { reviewFilter = e.target.value; render(); } });
  document.addEventListener('click', async event => {
    const t = event.target;
    try {
      const retry = t.closest('[data-retry]');
      if (retry) { retry.disabled = true; await call(`/api/jobs/${retry.dataset.retry}/retry`,'POST'); return refresh(); }
      const discard = t.closest('[data-discard]');
      if (discard) { if (confirm('放弃这次生成？已上传的图片会被清理。')) await call(`/api/jobs/${discard.dataset.discard}`,'DELETE'); return refresh(); }
      const id = view.dataset.dest, d = destinations().find(d => d.id === id);
      const toggle = t.closest('[data-toggle]');
      if (toggle) { toggle.disabled = true; await call(`/api/journeys/${id}/status`,'POST',{status:toggle.dataset.toggle}); return refresh(); }
      const review = t.closest('[data-review]');
      if (review) { const note=review.dataset.review==='rejected'?prompt('请填写退回原因，发布者可在「我的发布」查看并修改'):'';if(review.dataset.review==='rejected'&&!note?.trim())return;review.disabled = true; await call(`/api/journeys/${id}/review`,'POST',{review:review.dataset.review,note}); return refresh(); }
      if (t.closest('[data-delete]')) {
        if (confirm('删除该目的地？数据库记录和已生成的图片会被永久删除。')) {
          await call(`/api/journeys/${id}`,'DELETE'); location.hash = listUrl(channelOf(d)); await refresh();
        }
        return;
      }
      const card = t.closest('[data-dest]');
      if (card && !t.closest('a,button')) location.hash = detailUrl(destinations().find(d => d.id === card.dataset.dest));
    } catch(error) { alert(error.message); refresh(); }
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.dest-card')) {
      e.preventDefault(); location.hash = detailUrl(destinations().find(d => d.id === e.target.dataset.dest));
    }
  });
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0,0); });
  refresh();
})();
