(() => {
  'use strict';
  const C = window.TRIPWONDER_CATALOG;
  const paths = {
    back:'m15 5-7 7 7 7', next:'m9 5 7 7-7 7', close:'m6 6 12 12M18 6 6 18',
    pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM9.5 8a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1-1.5 2M12 15h.01',
    bed:'M3 19V7m18 12V7M3 15h18M5 15V9h14v6M8 9V6h8v3', plane:'m22 2-8 20-3-9-9-3 20-8ZM11 13l5-5',
    building:'M4 21V6l10-3v18M14 9h6v12M8 8h2M8 12h2M8 16h2M17 12h1M17 16h1M2 21h20',
    train:'M6 17h12V4H6v13ZM6 11h12M9 17l-3 4m9-4 3 4M9 14h.01M15 14h.01M9 2h6',
    home:'m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7', spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
    car:'M3 17V9l3-5h12l3 5v8H3ZM3 10h18M6 17v3m12-3v3M7 14h1m8 0h1',
    palm:'M11 21h9M15 21l-2-13M13 8Q4 4 2 10q7-3 11-2ZM13 8Q17 1 22 6q-6-1-9 2ZM13 8Q10 0 5 3q5 2 8 5Z',
    down:'m6 9 6 6 6-6', route:'M7 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM17 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM10 6h6a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h6',
    search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6', mic:'M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V4ZM5 10v1a7 7 0 0 0 14 0v-1M12 18v4m-4 0h8',
    music:'M9 17V5l10-3v12M9 5l10-3M9 17c0 4-6 4-6 1s6-3 6-1ZM19 14c0 4-6 4-6 1s6-3 6-1Z',
    trend:'M4 3h16v18H4V3Zm3 12 4-4 3 2 4-6m-4 0h4v4', message:'M3 4h18v14H8l-5 3V4Zm3 3 6 5 6-5',
    people:'M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM2 21v-6a6 6 0 0 1 12 0v6M17 4a3 3 0 0 1 0 6m0 3a5 5 0 0 1 5 5v3',
    bag:'M4 7h16v14H4V7Zm4 0V3h8v4M8 11v5m8-5v5', user:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21a8 8 0 0 1 16 0',
    check:'m5 12 4 4L19 6', heart:'M12 21 3 12C-3 5 7-2 12 6c5-8 15-1 9 6l-9 9Z',
    share:'M12 16V2m-5 5 5-5 5 5M5 12H3v10h18V12h-2', book:'M12 5Q6 1 2 4v16q5-3 10 0 5-3 10 0V4q-4-3-10 1Zm0 0v15',
    ticket:'M2 6h20v4a2 2 0 0 0 0 4v4H2v-4a2 2 0 0 0 0-4V6Zm13 0v3m0 3v2m0 2v2'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const app = document.querySelector('#app'), modalRoot = document.querySelector('#modal-root');
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const day = today();
  try { localStorage.removeItem('tripwonder-challenges-v1'); } catch {}
  const pageUrl = new URL(location.href);
  if (pageUrl.searchParams.has('preview')) {
    pageUrl.searchParams.delete('preview');
    try { history.replaceState(history.state, '', pageUrl.href); } catch {}
  }
  const hash = str => [...str].reduce((n, char) => Math.imul(n ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const shuffle = (items, seed) => { const out = [...items]; let n = hash(seed); for (let i=out.length-1;i>0;i--) { n ^= n<<13; n ^= n>>>17; n ^= n<<5; const j = (n>>>0)%(i+1); [out[i],out[j]]=[out[j],out[i]]; } return out; };
  const order = shuffle(C.cities.map(c => c.id), day);
  const daily = {}, benefits = {};
  let invitation=null;
  try { const raw=new URL(location.href).searchParams.get('challenge');if(raw){const token=raw.replace(/-/g,'+').replace(/_/g,'/'),candidate=JSON.parse(atob(token));if(order.includes(candidate.cityId)&&Number.isInteger(candidate.score)&&candidate.score>=0&&candidate.score<=100)invitation=candidate;} } catch {}
  const s = {
    view:invitation?'cover':'home', cityId: invitation?.cityId || order.find(id => !daily[id]?.result && !daily[id]?.skipped) || order[0],
    scene:0, deadline:0, clues:new Set(), visited:new Set([0]), questions:[], answers:[], q:0, selected:null,
    result:null, days:2, pace:'舒适', theme:'自动', date:'', route:null, rank:'今日',
    daily, benefits, invitation, itineraries:{}, bookmarks:{}, rulesSeen:false
  };
  let timer, viewer, mapView, prefetchTimer, toastTimer, transition=0, pendingCleanup, rulesCleanup, previousFocus;
  const city = () => C.cities.find(c => c.id === s.cityId) || C.cities[0];
  const current = () => s.daily[s.cityId] || {};
  // Location guess scoring: full marks inside fullKm, then exponential decay. A city may override via city.guess.
  const GUESS = {max:40, fullKm:25, decayKm:450}, QUIZ_POINTS = [20,20,20];
  const guessRule = () => ({...GUESS, ...city().guess});
  function guessScore(km) { const c=guessRule(); return km<=c.fullKm?c.max:Math.round(c.max*Math.exp(-(km-c.fullKm)/c.decayKm)); }
  const guessVerdict = km => km<=25?'精准命中':km<=100?'近在咫尺':km<=300?'八九不离十':km<=800?'方向对了':'下次再近一点';
  function nextDestination(fromId=s.cityId, includeSkipped=false) {
    const index=Math.max(0,order.indexOf(fromId));
    const following=order.slice(index+1).concat(order.slice(0,index));
    return following.find(id=>!s.daily[id]?.result&&!s.daily[id]?.skipped)
      || (includeSkipped ? following.find(id=>!s.daily[id]?.result) : null);
  }
  function previousDestination(fromId=s.cityId) {
    const index=order.indexOf(fromId);
    return index>0 ? order[index-1] : null;
  }
  function openToday() {
    const id=order.find(id=>!s.daily[id]?.result&&!s.daily[id]?.skipped)
      || order.find(id=>!s.daily[id]?.result) || order[0];
    selectCity(id);
  }
  const photo = id => C.photoById.get(id);
  const activePhoto = () => city().scenes[s.scene].photo;
  function img(id, alt='', immersive=false) { const p=photo(id), a=SceneMedia.source(p,immersive); return `<img src="${esc(a.src)}" width="${a.width}" height="${a.height}" alt="${esc(alt)}" decoding="async" draggable="false">`; }
  function toast(message) { const el=document.querySelector('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),3200); }
  function head(title,back='today',right='') { return `<header class="page-head"><button class="icon-btn" data-go="${back}" aria-label="返回">${icon('back')}</button><strong>${esc(title)}</strong>${right || '<span style="width:36px"></span>'}</header>`; }
  function nav(active='home') { return `<nav class="bottom-nav" aria-label="携程导航">${[['home','首页','home'],['message','消息','notice'],['people','社区','community'],['bag','行程','itinerary'],['user','我的','profile']].map(([i,t,v])=>`<button class="${active===v?'active':''}" data-go="${v}">${icon(i)}${t}</button>`).join('')}</nav>`; }
  function home() { return `<div class="page white"><div class="top-brand"><span class="brand">Trip<span>.</span>com</span><div class="row"><span class="silver"><b>⬟</b> Silver</span><span class="coin">T</span></div></div><section class="services"><div class="service-row">${[['bed','酒店'],['plane','机票'],['building','机票 + 酒店'],['train','火车票']].map(([i,t])=>`<button class="service" data-service="${t}"><span class="bubble">${icon(i)}</span>${t}</button>`).join('')}</div><div class="service-row small">${[['home','民宿·短租'],['spark','景点·玩乐'],['car','租车'],['palm','旅游度假'],['down','更多']].map(([i,t])=>`<button class="service" data-service="${t}">${icon(i)}${t}</button>`).join('')}</div></section><div class="quick-apps">${[['pin','TripWonder','today'],['music','演出·赛事','events'],['route','Trip.Planner','itinerary'],['trend','旅行热点','trending']].map(([i,t,v])=>`<button class="${v==='today'?'entry':''}" data-go="${v}"><span class="quick-icon">${icon(i)}${v==='today'?'<span class="new-dot">NEW</span>':''}</span>${t}</button>`).join('')}</div><div class="home-body"><div class="search-box"><button class="search-line" data-action="search">${icon('search')}<span>下一站，想去哪里？</span>${icon('mic')}</button><div class="chips"><span>上海</span><span>曼谷</span><span>北京</span><span>悉尼</span></div></div><section class="offer"><div class="row"><strong>🎁 新人专享 · 旅行好礼</strong><button class="claim" data-action="home-coupon">一键领取</button></div><div class="tickets"><div class="ticket">${icon('bed')}<span>酒店优惠<strong>9 折起</strong></span></div><div class="ticket">${icon('train')}<span>境外火车票<strong>95 折</strong></span></div></div></section><div class="home-section-head"><strong>最近浏览</strong></div><button class="recent" data-go="today" style="width:100%;text-align:left">${img('huayan','目的地照片')}<div style="flex:1"><strong>下一站，等你发现</strong><small>TripWonder <span style="color:var(--blue)"> | 奇境挑战</span></small></div>${icon('next')}</button><button class="home-banner" data-go="today">${img('yungang','目的地照片')}<span class="pill">每日灵感</span><p>打开世界的另一种方式</p><strong>先探索，再出发</strong></button></div>${nav()}</div>`; }
  function cover() { const c=city(), record=current(),friend=s.invitation?.cityId===c.id; return `<div class="page cover-page"><div class="cover-hero">${img(c.scenes[0].id,'待探索的目的地',true)}</div><header class="immersive-top"><button class="glass round" data-go="home" aria-label="返回首页">${icon('back')}</button><span class="cover-name">TripWonder</span><button class="glass" data-action="rules" aria-haspopup="dialog" aria-expanded="false">玩法</button></header><div class="cover-footer"><div class="cover-actions"><button class="primary" data-action="${record.result&&!friend?'show-result':'start'}">${friend?'接受好友挑战':record.result?'查看探索结果':s.deadline>Date.now()?'继续探索':'进入探索'}</button><button class="glass cover-skip" data-action="skip">跳过</button></div><div class="cover-links"><button class="glass" data-go="atlas">图鉴</button><button class="glass" data-go="ranking">排行榜</button></div></div></div>`; }
  function explore() { const scene=city().scenes[s.scene]; return `<div class="page explore-page"><div class="photo-viewport" tabindex="0" role="region" aria-label="景点照片，可双指缩放、拖动和平移"><div class="photo-plane">${img(scene.id,`第${s.scene+1}处景点`,true)}${scene.hotspots.map((h,i)=>`<button class="hotspot ${s.clues.has(`${s.scene}-${i}`)?'read':''}" data-clue="${i}" aria-label="查看线索 ${i+1}" aria-haspopup="dialog" style="left:${h.x}%;top:${h.y}%;--pulse-delay:${i*-.8}s"><span class="hotspot-dot" aria-hidden="true"></span></button>`).join('')}</div></div><header class="immersive-top"><button class="glass round" data-action="leave" aria-label="退出探索">${icon('back')}</button><span class="scene-counter">${s.scene+1} / ${city().scenes.length}</span><span class="top-right"><span class="timer"><b id="timer">03:00</b></span><button class="glass round fav" data-action="fav" aria-pressed="${!!s.bookmarks[s.cityId]}" aria-label="${s.bookmarks[s.cityId]?'取消收藏':'收藏这个目的地'}">${icon('heart')}</button></span></header><div class="explore-bottom"><div class="scene-nav"><button class="glass prev-scene" data-action="prev-scene"${s.scene?'':' disabled'}>${icon('back')} 上一处</button><button class="primary" data-action="next-scene">${s.scene===city().scenes.length-1?'开始答题':'下一处'} ${icon('next')}</button></div></div></div>`; }
  function quiz() { const q=s.questions[s.q]; return `<div class="page">${head('线索挑战','cover',`<span class="pill">${s.q+1} / 3</span>`)}<div class="quiz-top"><div class="row"><span class="eyebrow">${['观察','文化','推理'][s.q]}</span><span class="pill">${q.points} 分</span></div><div class="quiz-progress"><span style="width:${s.q/3*100}%"></span></div><h2>${esc(q.q)}</h2></div><div class="question-card">${q.options.map((o,i)=>`<button class="option ${s.selected===i?'selected':''}" data-option="${i}"><b>${String.fromCharCode(65+i)}</b><span style="flex:1">${esc(o)}</span></button>`).join('')}</div><div class="quiz-submit"><button class="primary" data-action="submit" ${s.selected===null?'disabled':''}>${s.q===2?'下一步：地图定位':'下一题'} ${icon('next')}</button><p class="quiz-foot">三题答完后在地图上标出目的地，最后一起揭晓。</p></div></div>`; }
  function guess() { return `<div class="page guess-page${s.guessDone?' done':''}"><div class="guess-map" id="guess-map" role="application" aria-label="中国地图：轻点放置落点，双指或滚轮缩放，拖动平移"></div><header class="guess-top"><button class="glass-light round" data-action="guess-back" aria-label="返回第 3 题">${icon('back')}</button><div><h2>这个目的地在哪里？</h2></div></header><div class="guess-zoom"><button class="glass-light" data-action="zoom-in" aria-label="放大地图">+</button><button class="glass-light" data-action="zoom-out" aria-label="缩小地图">−</button></div><section class="guess-card" aria-live="polite">${guessCard()}</section></div>`; }
  function guessStatus() { const g=s.guess; return g?`${icon('pin')}<div><strong>${esc([g.province,g.city].filter(Boolean).join(' · ')||'所选位置')}</strong><small>北纬 ${g.lat.toFixed(1)}° · 东经 ${g.lng.toFixed(1)}° · 再点一次可调整</small></div>`:`<span class="guess-hint-dot" aria-hidden="true"></span><div><strong>轻点地图，放下你的落点</strong><small>双指缩放更精准 · 越近得分越高，最高 ${guessRule().max} 分</small></div>`; }
  function guessCard() {
    if(s.guessDone){ const g=s.guess; return `<div class="guess-result"><div><span class="guess-verdict">${esc(guessVerdict(g.km))}</span><strong class="guess-km"><b data-count="${g.km}">${g.km}</b> km</strong><small>你的落点距${esc(city().name)}（直线）</small></div><div class="guess-points"><b data-count="${g.points}">${g.points}</b><small>/ ${guessRule().max} 定位分</small></div></div><button class="primary" data-action="show-result">查看完整结果 ${icon('next')}</button>`; }
    return `<div class="guess-status">${guessStatus()}</div><div class="guess-actions"><div class="guess-recall" role="group" aria-label="回看实景">${city().scenes.map((sc,i)=>`<button data-recall="${i}" aria-label="回看第 ${i+1} 处景点">${img(sc.id,'')}</button>`).join('')}</div><button class="primary" data-action="guess-submit" ${s.guess?'':'disabled'}>确认落点</button></div>`;
  }
  function mountGuess() {
    const root=app.querySelector('#guess-map'),card=app.querySelector('.guess-card'),top=app.querySelector('.guess-top');
    const insets=()=>({top:top.offsetTop+top.offsetHeight,bottom:root.clientHeight-card.offsetTop+10});
    mapView=new GuessMap(root,{insets,avoid:C.cities.map(c=>({name:c.name,lat:c.lat,lng:c.lng})),onPick:pickGuess,onReject:()=>toast('请在主图上标记，右下角为南海诸岛示意')});
    if(s.guess)mapView.setPin(s.guess,s.guess.province,s.guess.city);
  }
  function pickGuess(point) {
    s.guess={lat:point.lat,lng:point.lng,x:point.x,y:point.y,province:point.province,city:point.city};
    const status=app.querySelector('.guess-status'),submit=app.querySelector('[data-action="guess-submit"]');
    if(status)status.innerHTML=guessStatus(); if(submit)submit.disabled=false;
  }
  function submitGuess() {
    if(!s.guess||s.guessDone)return;
    const km=Math.round(distance(s.guess,city()));s.guess={...s.guess,km,points:guessScore(km)};s.guessDone=true;finish();
    const page=app.querySelector('.guess-page'),card=app.querySelector('.guess-card');page.classList.add('done');page.querySelector('.guess-top h2').textContent=`答案揭晓：${city().name}`;card.innerHTML=guessCard();
    const counters=[...card.querySelectorAll('[data-count]')];counters.forEach(el=>el.textContent='0');
    card.querySelector('.primary').focus({preventScroll:true});
    mapView.remeasure();mapView.reveal(city(),{name:city().name,km},()=>countUp(counters));
  }
  function countUp(els) {
    const t0=performance.now(),dur=matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
    const step=now=>{const t=dur?Math.min(1,(now-t0)/dur):1,e=1-(1-t)**3;els.forEach(el=>{if(el.isConnected)el.textContent=Math.round(Number(el.dataset.count)*e);});if(t<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  }
  function recall(index) {
    const scene=city().scenes[index];if(!scene)return;
    const read=scene.hotspots.filter((_,j)=>s.clues.has(`${index}-${j}`));
    sheet(`第 ${index+1} 处实景`,`<div class="recall-photo">${img(scene.id,`第 ${index+1} 处景点`)}</div><p class="recall-note">${read.length?'你在这里点开过的线索：':'这一处还没有点开线索。'}</p>${read.length?`<div class="tag-row recall-tags">${read.map(h=>`<span class="pill">${esc(h.title)}</span>`).join('')}</div>`:''}`);
  }
  const benefitFor = result => result.score>=60 ? {name:result.score===100?'满分探索礼':'探索好礼',detail:'景点门票 20 元优惠券',threshold:'示例满 100 元可用'} : {name:'探索纪念徽章',detail:'完成本次挑战的发现记录',threshold:'无需消费'};
  const benefitStatus = id => !s.benefits[id]?'none':s.benefits[id].expires>=day?'active':'expired';
  const datePlusDays = count => {const d=new Date();d.setDate(d.getDate()+count);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function result() { const r=s.result || current().result; if(!r)return empty('目的地尚未揭晓','完成探索和三道题，再来查看结果。'); const c=city(), benefit=benefitFor(r), status=benefitStatus(c.id), next=nextDestination(s.cityId,true), prev=previousDestination(s.cityId); return `<div class="page">${head('我的发现','home',`<button class="icon-btn" data-action="share" aria-label="分享成绩">${icon('share')}</button>`)}<div class="result-hero"><div class="score">${r.score}<small> / 100</small></div><div class="score-split"><span>定位 <b>${r.guess?.points??0}</b> / ${GUESS.max}</span><span>答题 <b>${r.quiz??r.score}</b> / 60</span></div><h2>你好，${esc(c.name)}。</h2><p>三题答对 ${r.correct} 题 · 看过 ${r.clues} 条线索</p><div class="tag-row">${r.tags.map(tag=>`<span class="pill">${esc(tag)}</span>`).join('')}</div></div><section class="destination-card">${img(c.scenes.at(-1).id,c.name)}<div><span class="pill">${esc(c.region)}</span><h3>${esc(c.name)}</h3><p>${c.scenes.length>1?`刚才探索的 ${c.scenes.length} 处景点，都在这座目的地。`:'刚才探索的那处景点，就在这座目的地。'}</p></div></section>${r.guess?`<section class="content-card guess-summary"><div class="row"><h3>地图定位</h3><span class="pill">${esc(guessVerdict(r.guess.km))}</span></div><div class="guess-mini">${GuessMap.snapshot(r.guess,c)}<div class="guess-legend"><span class="you">你的落点</span><span class="target">${esc(c.name)}</span></div></div><div class="guess-stats"><div><b>${r.guess.km} km</b><small>直线距离</small></div><div><b>+${r.guess.points}</b><small>定位得分 / ${GUESS.max}</small></div><div><b>${esc(r.guess.city||r.guess.province||'—')}</b><small>你的落点</small></div></div></section>`:''}<section class="content-card"><h3>三题一起揭晓</h3>${r.answers.map((a,i)=>`<button class="answer-line" data-review="${i}" style="width:100%;text-align:left">${icon(a.correct?'check':'book')}<span>第 ${i+1} 题 · ${a.correct?'答对':'查看解析'}</span><b>${a.correct?'+'+a.points:'0'} 分</b>${icon('next')}</button>`).join('')}</section><section class="content-card benefit"><div class="row"><div><strong>${benefit.name}</strong><p>${benefit.detail}</p></div><button data-action="claim" ${status==='active'?'disabled':''}>${status==='active'?'已领取':status==='expired'?'重新领取':'领取'}</button></div><div class="tiny muted">${benefit.threshold} · 领取后 7 日内有效 · 仅限${esc(c.name)}相关产品 · 原型示例，无真实券码或抵扣效力${status==='expired'?' · 上次权益已过期':''}</div></section><div class="result-actions"><button class="primary" data-go="route">为我规划${esc(c.name)}之旅 ${icon('next')}</button><div class="stop-nav"><button class="glass-light prev-city" data-action="prev-city"${prev?'':' disabled'}>${icon('back')} 上一个目的地</button>${next?`<button class="secondary next-city" data-action="next-city">下一个目的地 ${icon('next')}</button>`:'<button class="secondary next-city" data-go="home">返回首页</button>'}</div><div class="split-actions"><button class="secondary" data-action="bookmark">${icon('heart')} ${s.bookmarks[c.id]?'已收藏':'收藏目的地'}</button><button class="secondary" data-action="share">${icon('share')} 分享挑战</button></div></div><p class="demo-note">今日已完成 ${order.filter(id=>s.daily[id]?.result).length} / 5 个目的地 · 综合得分 = 地图定位 ${GUESS.max} + 三题 60</p></div>`; }
  function distance(a,b) { const rad=Math.PI/180, dLat=(b.lat-a.lat)*rad, dLng=(b.lng-a.lng)*rad; const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2; return 12742*Math.asin(Math.sqrt(h)); }
  function travelMinutes(a,b) { const km=distance(a,b); return Math.max(15,Math.ceil((km/32*60+12)/5)*5); }
  function makeRoute() {
    const stops=[...city().stops], capacity=s.pace==='慢游'?1:s.pace==='紧凑'?3:2;
    const target=Math.min(stops.length,s.days*capacity);
    const featured=stop=>city().scenes.some(scene=>scene.name===stop.name || scene.id===stop.id || (stop.id&&scene.id.split('-').at(-1)===stop.id.split('-').at(-1)));
    const priority=[...stops.filter(stop=>s.theme!=='自动'&&stop.interests?.includes(s.theme)),...stops.filter(featured),...stops].filter((stop,index,all)=>all.indexOf(stop)===index);
    const anchorCount=Math.min(target,priority.filter(stop=>(s.theme!=='自动'&&stop.interests?.includes(s.theme))||featured(stop)).length);
    const chosen=priority.slice(0,anchorCount);
    const arrange=items=>{
      const sizes=Array.from({length:s.days},(_,i)=>Math.floor(items.length/s.days)+(i<items.length%s.days?1:0));
      let bestCost=Infinity,best=null;
      function visit(prefix,remaining) {
        if(!remaining.length){let at=0,cost=0;const groups=sizes.map(size=>{const group=prefix.slice(at,at+size);at+=size;for(let i=1;i<group.length;i++)cost+=distance(group[i-1],group[i]);return group;});if(cost<bestCost){bestCost=cost;best=groups;}return;}
        for(let i=0;i<remaining.length;i++)visit([...prefix,remaining[i]],[...remaining.slice(0,i),...remaining.slice(i+1)]);
      }
      visit([],items);return {cost:bestCost,groups:best};
    };
    while(chosen.length<target){const next=stops.filter(stop=>!chosen.includes(stop)).map(stop=>({stop,cost:arrange([...chosen,stop]).cost})).sort((a,b)=>a.cost-b.cost)[0];chosen.push(next.stop);}
    const best=arrange(chosen).groups;
    best.sort((a,b)=>Math.min(...a.map(stop=>distance(city(),stop)))-Math.min(...b.map(stop=>distance(city(),stop))));
    s.route=reorderDaysForOpenings(best.map(group=>group.map(stop=>stop.name)));
  }
  function stopByName(name) { return city().stops.find(x=>x.name===name); }
  function time(t) { return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`; }
  function dateForDay(index) { if(!s.date)return null;const [year,month,date]=s.date.split('-').map(Number),d=new Date(year,month-1,date+index);return d; }
  function openConflict(stop,date,start,end) {
    if(!date)return '';
    if(date.getDay()===1 && stop.openingHours?.includes('周一闭馆'))return '周一闭馆';
    let open=null,close=null;
    const match=stop.openingHours?.match(/(\d{2}):(\d{2})[–-](\d{2}):(\d{2})/);
    if(match){open=Number(match[1])*60+Number(match[2]);close=Number(match[3])*60+Number(match[4]);}
    if(stop.opening==='seasonal'){
      const month=date.getMonth()+1;open=7*60+30;
      close=stop.name==='虎丘景区'?(month>=5&&month<=10?18*60:17*60+30):(month>=3&&month<=10?17*60+30:17*60);
    }
    if(open!==null && start<open)return `建议 ${time(open)} 后入园`;
    if(close!==null && end>close)return `预计 ${time(end)} 结束，晚于参考闭园时间 ${time(close)}`;
    return '';
  }
  function dayConflicts(stops,index) { const date=dateForDay(index);if(!date)return 0;let clock=9*60,previous=null,count=0;for(const name of stops){const stop=stopByName(name);clock+=previous?travelMinutes(previous,stop):0;const start=clock;clock+=stop.visitMinutes;if(openConflict(stop,date,start,clock))count++;previous=stop;}return count; }
  function reorderDaysForOpenings(route) {
    if(!s.date||route.length<2)return route;
    let best=route,bestScore=Infinity;
    const visit=(prefix,remaining)=>{if(!remaining.length){const score=prefix.reduce((n,day,i)=>n+dayConflicts(day,i)*1000+Math.abs(route.indexOf(day)-i),0);if(score<bestScore){bestScore=score;best=prefix;}return;}for(const group of remaining)visit([...prefix,group],remaining.filter(item=>item!==group));};
    visit([],route);return best;
  }
  function showOpeningWarnings() {
    if(s.view!=='route'||!s.date)return;
    app.querySelectorAll('.day-card').forEach((card,index)=>{
      const date=dateForDay(index),dateText=`${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
      card.querySelector('.day-label')?.insertAdjacentHTML('beforeend',`<span class="route-day-date">${dateText}</span>`);
      card.querySelectorAll('.route-stop').forEach((row,si)=>{const stop=stopByName(s.route[index][si]),startText=row.querySelector('.time').textContent,[hour,minute]=startText.split(':').map(Number),start=hour*60+minute,reason=openConflict(stop,date,start,start+stop.visitMinutes);if(reason)row.insertAdjacentHTML('beforeend',`<div class="availability-warning">${esc(reason)}。请调整日期或替换地点。${stop.source?.startsWith('http')?`<a href="${esc(stop.source)}" target="_blank" rel="noopener noreferrer">核对来源 ↗</a>`:''}</div>`);});
    });
  }
  function showFriendComparison() {
    if(s.view!=='result'||s.invitation?.cityId!==s.cityId)return;
    const score=(s.result||current().result)?.score;if(score===undefined)return;
    const other=s.invitation.score,difference=score-other;
    const card=document.createElement('section');card.className='content-card friend-compare';
    card.innerHTML=`<strong>好友挑战</strong><p>好友 ${other} 分 · 你 ${score} 分</p><b>${difference>0?`领先 ${difference} 分`:difference<0?`还差 ${-difference} 分`:'本局打平'}</b><small>链接携带的是好友分享时的分数；仅在本地比对，不是实时榜单。</small>`;
    app.querySelector('.result-actions')?.before(card);
  }
  function route() { if(!current().result&&!s.route)return empty('先发现，再出发','完成目的地挑战后，就能规划这座城市的行程。'); if(!s.route)makeRoute(); const c=city(); return `<div class="page">${head('我的路线',current().result?'result':'itinerary',`<button class="head-action" data-go="itinerary">行程单</button>`)}<div class="route-hero">${img(c.scenes.at(-1).id,c.name)}<div><span class="pill">可调整的路线示例</span><h2>${esc(c.name)} ${s.days} 日</h2><p>从刚才的景点出发，按兴趣安排停留。</p></div></div><div class="route-tabs">${[1,2,3].map(d=>`<button class="${s.days===d?'active':''}" data-days="${d}">${d} 日</button>`).join('')}</div><div class="route-controls"><label>节奏<select id="route-pace">${['慢游','舒适','紧凑'].map(v=>`<option ${s.pace===v?'selected':''}>${v}</option>`).join('')}</select></label><label>兴趣<select id="route-theme">${['自动','文化','建筑','自然','摄影','美食'].map(v=>`<option ${s.theme===v?'selected':''}>${v}</option>`).join('')}</select></label><label>出发日期<input id="route-date" type="date" value="${esc(s.date)}"></label></div>${s.route.map((day,di)=>{let clock=9*60,prior=null;return `<section class="day-card"><div class="day-label">第 ${di+1} 天</div>${day.map((name,si)=>{const stop=stopByName(name); const transfer=prior?travelMinutes(prior,stop):0; clock+=transfer;const at=time(clock);clock+=stop.visitMinutes;prior=stop;return `<div class="route-stop"><div class="row"><strong>${esc(name)}</strong><span class="time">${at}</span></div><p>${prior&&si>0?`建议预留约 ${transfer} 分钟交通 · `:''}停留约 ${stop.visitMinutes} 分钟。${esc(stop.note)}</p><div class="stop-actions"><button data-swap="${di}-${si}">替换</button><button data-move="${di}-${si}-up" ${si===0?'disabled':''}>上移</button><button data-move="${di}-${si}-down" ${si===day.length-1?'disabled':''}>下移</button></div></div>`;}).join('')}</section>`;}).join('')}<section class="content-card"><h3>接着安排出行</h3><div class="travel-products">${[['bed','附近酒店'],['ticket','景点门票'],['train','往返交通']].map(([i,t])=>`<button data-product="${t}">${icon(i)}${t}</button>`).join('')}</div>${benefitStatus(c.id)==='active'?'<p class="tiny muted">已领取的示例权益可在门票承接弹窗中查看使用范围。</p>':''}</section><div class="route-bottom"><button class="primary" data-action="save-trip">保存到我的行程</button><p class="demo-note">基于本地景点资料生成；交通为直线距离粗估，时间与开放情况请出发前核实。</p></div></div>`; }
  function atlas() { const count=order.filter(id=>s.daily[id]?.result).length; return `<div class="page">${head('目的地图鉴','today')}<div class="pad"><h2>已点亮 ${count} / ${order.length} 座城</h2></div><div class="atlas-grid">${order.map((id,i)=>{const c=C.cities.find(x=>x.id===id),done=!!s.daily[id]?.result;return `<button class="atlas-item" data-city="${id}">${img(c.scenes[0].id,done?c.name:'未揭晓目的地')}<div><strong>${done?esc(c.name):`第 ${i+1} 个目的地`}</strong><small>${done?`${s.daily[id].result.score} 分 · ${esc(c.region)}`:'尚未揭晓'}</small></div></button>`;}).join('')}</div></div>`; }
  function ranking() { const done=order.filter(id=>s.daily[id]?.result),total=done.reduce((n,id)=>n+s.daily[id].result.score,0); const entries=s.rank==='今日'?done.map(id=>[C.cities.find(c=>c.id===id).name,s.daily[id].result.score]):[['小野（演示）',420],['景行（演示）',370],['我',total],['山间来信（演示）',290]]; return `<div class="page">${head('探索榜单','today')}<div class="pad"><h2>今日累计 ${total} 分</h2><p class="muted tiny">已完成 ${done.length} / 5 座城；每城满分 100（地图定位 40 + 三题 60）。好友数据为演示。</p></div><div class="route-tabs">${['今日','演示好友榜'].map(t=>`<button data-rank="${t}" class="${s.rank===t?'active':''}">${t}</button>`).join('')}</div><div class="content-card">${entries.length?entries.sort((a,b)=>b[1]-a[1]).map(([name,score],i)=>`<div class="ranking-row"><strong>${i+1}</strong><div class="avatar">${esc(name[0])}</div><span>${esc(name)}</span><b>${score} 分</b></div>`).join(''):'<p class="muted">完成第一个挑战后，成绩会显示在这里。</p>'}</div></div>`; }
  function itinerary() { const items=Object.entries(s.itineraries); return `<div class="page">${head('我的行程','home')}<div class="pad"><h2>${items.length?`${items.length} 份已保存路线`:'还没有行程'}</h2></div>${items.length?items.map(([id,it])=>`<section class="content-card itinerary-card"><strong>${esc(it.city)} ${it.days} 日</strong><p>${esc(it.date || '日期待定')} · ${it.route.flat().length} 处停留 · ${esc(it.pace)}节奏</p><button class="secondary" data-itinerary="${id}">查看并调整</button></section>`).join(''):`<div class="pad"><button class="primary" data-go="today">去发现目的地</button></div>`}</div>`; }
  function profile() { const tags={}; for(const item of Object.values(s.daily))for(const tag of item.result?.tags||[])tags[tag]=(tags[tag]||0)+1; return `<div class="page">${head('我的旅行','home')}<div class="pad"><h2>我的发现</h2><p class="muted tiny">今日完成 ${order.filter(id=>s.daily[id]?.result).length} / 5 座城</p><div class="tag-row">${Object.entries(tags).sort((a,b)=>b[1]-a[1]).map(([tag,n])=>`<span class="pill">${esc(tag)} · ${n}</span>`).join('')}</div></div><div class="content-card"><button class="answer-line" data-go="atlas" style="width:100%">${icon('book')}<span>目的地图鉴</span>${icon('next')}</button><button class="answer-line" data-go="ranking" style="width:100%">${icon('spark')}<span>今日成绩</span>${icon('next')}</button><button class="answer-line" data-go="itinerary" style="width:100%">${icon('bag')}<span>我的行程</span>${icon('next')}</button></div></div>`; }
  function empty(title,body) { return `<div class="page">${head(title)}<div class="empty"><p>${body}</p><button class="primary" data-go="today">探索今日目的地</button></div></div>`; }

  function cancelPending() { transition++; pendingCleanup?.(); pendingCleanup=null; clearTimeout(prefetchTimer); }
  async function loadView(view,index,commit) {
    cancelPending(); const ticket=transition, p=city().scenes[index].photo;
    const existing=app.querySelector('.photo-plane>img,.cover-hero>img');
    SceneMedia.retain([SceneMedia.source(p,true).src,...(existing?[existing.src]:[])]);
    const buttons=[...document.querySelectorAll('[data-action="start"],[data-action="next-scene"],[data-action="prev-scene"]')];
    const old=buttons.map(b=>[b,b.innerHTML,b.disabled]);
    buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');if(b.dataset.action!=='prev-scene')b.textContent='载入中…';});
    pendingCleanup=()=>old.forEach(([b,label,disabled])=>{if(b.isConnected){b.innerHTML=label;b.disabled=disabled;b.removeAttribute('aria-busy');}});
    try { const ready=await SceneMedia.prepare(p); if(ticket!==transition)return; commit?.();s.view=view;render(ready); }
    catch(error) { if(ticket===transition && error.name!=='AbortError')toast('照片暂未载入，请重试'); }
    finally { if(ticket===transition){pendingCleanup?.();pendingCleanup=null;} }
  }
  function render(ready) {
    cancelPending(); closeModal(); clearInterval(timer); viewer?.destroy(); viewer=null; mapView?.destroy(); mapView=null;
    document.querySelector('#phone').classList.toggle('immersive',['cover','explore'].includes(s.view));
    const views={home,cover,explore,quiz,guess,result,route,atlas,ranking,itinerary,profile};
    const frame=document.createElement('div');frame.innerHTML=(views[s.view]||home)();
    if(ready){const placeholder=frame.querySelector('.photo-plane>img,.cover-hero>img'); if(placeholder){ready.alt=placeholder.alt;placeholder.replaceWith(ready);}}
    app.replaceChildren(...frame.childNodes);app.scrollTop=0;showOpeningWarnings();showFriendComparison();
    document.querySelectorAll('.flow button').forEach(b=>b.classList.toggle('active',b.dataset.go===s.view || (b.dataset.go==='today'&&['cover','explore','quiz','guess','result','route','atlas','ranking'].includes(s.view))));
    app.querySelectorAll('img').forEach(el=>el.addEventListener('error',()=>{el.insertAdjacentHTML('afterend','<span class="error-image">照片未能载入</span>');},{once:true}));
    if(s.view==='explore') { const root=app.querySelector('.photo-viewport'),config=window.IMMERSIVE_SCENES?.[activePhoto().id];viewer=config&&window.ImmersivePhotoViewer?new ImmersivePhotoViewer(root,activePhoto(),config):new PhotoViewer(root,activePhoto());tick();if(s.view==='explore')timer=setInterval(tick,500); const next=city().scenes[s.scene+1];prefetchTimer=setTimeout(()=>SceneMedia.prefetch(activePhoto(),next?.photo),200); }
    if(s.view==='guess')mountGuess();
    if(s.view==='cover' && s.cityId===order[0] && !s.rulesSeen){s.rulesSeen=true;showRules();}
    if(['cover','explore'].includes(s.view))SceneMedia.retain([SceneMedia.source(s.view==='cover'?city().scenes[0].photo:activePhoto(),true).src]);else SceneMedia.retain([]);
  }
  function selectCity(id) { if(!C.cities.some(c=>c.id===id))return;if(s.cityId!==id){s.deadline=0;s.scene=0;s.clues.clear();s.visited=new Set([0]);}s.cityId=id;s.result=s.daily[id]?.result||null;s.route=null;s.days=2;s.pace='舒适';s.theme='自动';s.date='';go(s.result?'result':'cover'); }
  function go(view) { if(view==='today'){openToday();return;} if(['notice','community','events','trending'].includes(view)){sheet('携程服务入口','<p>当前原型聚焦 TripWonder 目的地探索。</p>');return;} if(view==='quiz'&&!s.questions.length)view='cover';if(view==='guess'&&s.answers.length<3)view='cover';if(view==='result')s.result=current().result||s.result;if(view==='cover'||view==='explore'){loadView(view,view==='cover'?0:s.scene);return;}s.view=view;render(); }
  function sheet(title,content) { closeModal();previousFocus=document.activeElement;modalRoot.innerHTML=`<div class="modal-overlay"><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"><div class="sheet-handle"></div><div class="sheet-heading"><h2>${esc(title)}</h2><button class="icon-btn sheet-close" data-action="close" aria-label="关闭">${icon('close')}</button></div>${content}</section></div>`;modalRoot.querySelector('.sheet').focus({preventScroll:true}); }
  function closeModal() { rulesCleanup?.();rulesCleanup=null;app.inert=false;document.querySelector('[data-action="rules"]')?.setAttribute('aria-expanded','false');window.speechSynthesis?.cancel?.();modalRoot.innerHTML='';if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null; }
  function showRules() {
    closeModal(); const anchor=app.querySelector('[data-action="rules"]');if(!anchor)return;
    previousFocus=anchor;anchor.setAttribute('aria-expanded','true');
    modalRoot.innerHTML=`<div class="rules-overlay"><section class="rules-popover" role="dialog" aria-modal="true" aria-labelledby="rules-title" tabindex="-1"><div class="rules-heading"><div><span class="rules-eyebrow">玩法说明</span><h2 id="rules-title">看实景，猜出今日目的地</h2></div><button class="icon-btn" data-action="close" aria-label="关闭玩法">${icon('close')}</button></div><p class="rules-intro">每天 5 个神秘目的地，城市名先保密。每一站按下面 4 步完成，想换一个可以直接跳过。</p><ol class="rules-steps"><li><span>看</span><div><strong>探索 3 处实景 · 限时 3 分钟</strong><p>拖动、双指缩放，点开发光圆点收集线索</p></div></li><li><span>答</span><div><strong>回答 3 道线索题 · 每题 20 分</strong><p>观察、文化、推理各一题，对错先不公布</p></div></li><li><span>定</span><div><strong>在地图上标出位置 · 最高 40 分</strong><p>越近分越高，25 公里内满分；确认前可调整</p></div></li><li><span>揭</span><div><strong>揭晓城市、距离与总分</strong><p>查看解析，规划行程，凭成绩领旅行好礼</p></div></li></ol><div class="rules-score" aria-label="计分方式"><b>满分 100</b><span>地图定位 40</span><i>+</i><span>三题 60</span></div><button class="primary rules-cta" data-action="rules-start">开始探索</button></section></div>`;
    const panel=modalRoot.querySelector('.rules-popover'),phone=document.querySelector('#phone');
    const position=()=>{const a=anchor.getBoundingClientRect(),p=phone.getBoundingClientRect(),top=a.bottom-p.top-phone.clientTop+12,right=Math.max(12,phone.clientWidth-(a.right-p.left-phone.clientLeft));panel.style.top=top+'px';panel.style.right=right+'px';panel.style.maxHeight=Math.max(80,phone.clientHeight-top-16)+'px';};
    position();const observer=new ResizeObserver(position);observer.observe(phone);rulesCleanup=()=>observer.disconnect();app.inert=true;panel.focus({preventScroll:true});
  }
  function dismissModal(after) { const overlay=modalRoot.querySelector('.rules-overlay');if(!overlay){closeModal();after?.();return;}if(overlay.classList.contains('closing'))return;overlay.classList.add('closing');const panel=overlay.querySelector('.rules-popover'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;panel.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-8px) scale(.94)'}],{duration:reduced?0:170,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}).finished.then(()=>{if(modalRoot.contains(overlay)){closeModal();after?.();}}).catch(()=>{}); }
  // The rules only explain the game; entering stays an explicit tap on the cover CTA.
  function cueStart() { const cta=app.querySelector('.cover-actions>.primary');if(!cta)return;cta.focus({preventScroll:true});cta.classList.remove('cue');void cta.offsetWidth;cta.classList.add('cue'); }
  function start() { const resume=s.deadline>Date.now();loadView('explore',resume?s.scene:0,()=>{if(!resume){s.scene=0;s.deadline=Date.now()+180000;s.clues.clear();s.visited=new Set([0]);s.answers=[];s.questions=[];s.q=0;s.selected=null;}}); }
  function tick() { const remain=Math.max(0,Math.ceil((s.deadline-Date.now())/1000)),el=app.querySelector('#timer');if(el){el.textContent=`${String(Math.floor(remain/60)).padStart(2,'0')}:${String(remain%60).padStart(2,'0')}`;el.parentElement.classList.toggle('urgent',remain<=30);}if(remain===0){beginQuiz();toast('探索时间到，开始线索挑战');} }
  function beginQuiz() { clearInterval(timer);s.deadline=0;s.questions=city().questions.slice(0,3).map((q,i)=>({...q,points:QUIZ_POINTS[i]}));s.q=0;s.selected=null;s.answers=[];go('quiz'); }
  function clue(index) { const h=city().scenes[s.scene].hotspots[index];if(!h)return;s.clues.add(`${s.scene}-${index}`);app.querySelector(`[data-clue="${index}"]`)?.classList.add('read');const source=h.source?.startsWith('http')?`<a href="${esc(h.source)}" target="_blank" rel="noopener noreferrer">资料出处 ↗</a>`:'';sheet(h.title,`<p id="clue-text">${esc(h.text)}</p><div class="clue-footer"><button data-action="speak">朗读</button>${source}</div>`); }
  function answerSource(answer) { if(answer.source?.startsWith('http'))return answer.source;const match=answer.source?.match(/第\s*(\d+)\s*处\s*·\s*(.+)/);if(!match)return null;return city().scenes[Number(match[1])-1]?.hotspots.find(h=>h.title===match[2])?.source||null; }
  function finish() { const counts={};for(const key of s.clues){const [i,j]=key.split('-').map(Number),tag=city().scenes[i].hotspots[j]?.tag;if(tag)counts[tag]=(counts[tag]||0)+1;}const tags=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]).slice(0,2);const quiz=s.answers.reduce((n,a)=>n+(a.correct?a.points:0),0),r={score:quiz+(s.guess?.points||0),quiz,guess:s.guess?{...s.guess}:null,correct:s.answers.filter(a=>a.correct).length,answers:s.answers,clues:s.clues.size,tags:tags.length?tags:['旅行发现'],date:day};s.result=r;const previous=current().result;s.daily[s.cityId]={...current(),result:!previous||r.score>previous.score?r:previous,skipped:false}; }
  function inviteUrl() { const r=s.result||current().result,token=btoa(JSON.stringify({cityId:s.cityId,score:r.score,day})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=new URL('index.html',location.href);url.searchParams.set('challenge',token);return url.href; }
  function share() {
    const r=s.result||current().result,c=city(),url=inviteUrl(),link=new URL(url),local=link.protocol==='file:';
    // The friend will guess the place, so the card shows a heavily blurred scene as mood, never a name.
    const art=SceneMedia.source(photo(c.scenes[0].id)).src,count=c.scenes.length;
    const shown=local?'本地预览链接 · 仅本机可打开':`${link.host}${link.pathname.replace(/index\.html$/,'')}?challenge=…`;
    const linkIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>';
    const saveIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></svg>';
    sheet('分享挑战',`<div class="share-sheet">
      <figure class="share-ticket">
        <div class="share-ticket-art"><img src="${esc(art)}" alt="" aria-hidden="true">
          <div class="share-ticket-top"><span class="brand">Trip<span>.</span>com</span><span class="share-kicker">TRIPWONDER · 奇境挑战</span></div>
          <div class="share-score"><b>${r.score}</b><small>/ 100</small></div>
          <p class="share-dare">猜猜我去了哪里？<br>你能超过这个分数吗？</p>
        </div>
        <figcaption class="share-ticket-stub">
          <div><b>${r.guess?.points??0}</b><small>地图定位</small></div>
          <div><b>${r.quiz??r.score}</b><small>线索答题</small></div>
          <div><b>${count}</b><small>处实景</small></div>
        </figcaption>
      </figure>
      <label class="share-link" for="invite-link"><span class="share-link-icon">${linkIcon}</span><span class="share-link-text"><strong>好友挑战链接</strong><small>${esc(shown)}</small></span>
        <input class="invite-link" id="invite-link" readonly value="${esc(url)}" aria-label="好友挑战链接"></label>
      <div class="share-actions"><button class="primary" data-action="copy-invite">${linkIcon}复制链接</button><button class="secondary" data-action="download-share">${saveIcon}保存挑战卡</button></div>
      ${navigator.share?`<button class="share-more" data-action="system-share">${icon('share')}更多分享方式</button>`:''}
      <p class="share-note">${local?'当前是本地预览：链接只能在这台电脑上打开，发布到网页后好友才能接受挑战。':'好友打开链接会进入同一个目的地；成绩只在各自的浏览器里比对。'}</p>
    </div>`); }

  // Fireworks over the whole phone for a moment of reward. Canvas, pointer-transparent, removes itself.
  function celebrate(origin) {
    const host=document.querySelector('#phone')||document.body,box=host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    host.querySelector('.celebrate-canvas')?.remove();
    const canvas=document.createElement('canvas');canvas.className='celebrate-canvas';canvas.setAttribute('aria-hidden','true');
    canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);host.append(canvas);
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    const W=box.width,H=box.height,colors=['#ffd166','#ff8a5b','#3264ff','#7dd3fc','#f472b6','#ffe7a3'],parts=[],rockets=[];
    const burst=(x,y,n,speed,palette)=>{for(let i=0;i<n;i++){const a=Math.PI*2*i/n+Math.random()*.3,v=speed*(.55+Math.random()*.6);parts.push({x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,decay:.011+Math.random()*.012,color:palette[i%palette.length],size:1.4+Math.random()*1.8});}};
    const o=origin?.getBoundingClientRect?.();
    if(o)burst(o.left-box.left+o.width/2,o.top-box.top+o.height/2,34,4.2,colors);
    [[.28,.26,0],[.72,.2,220],[.5,.14,430],[.2,.36,650],[.8,.34,820]].forEach(([fx,fy,delay])=>setTimeout(()=>{if(canvas.isConnected)rockets.push({x:W*fx+(Math.random()-.5)*30,y:H*.96,ty:H*fy,vy:-(H*.96-H*fy)/38,color:colors[Math.floor(Math.random()*colors.length)]});},delay));
    const start=performance.now();
    const step=now=>{
      if(!canvas.isConnected)return;
      ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';
      for(let i=rockets.length-1;i>=0;i--){const k=rockets[i];k.y+=k.vy;k.vy*=.985;ctx.fillStyle=k.color;ctx.beginPath();ctx.arc(k.x,k.y,2.2,0,Math.PI*2);ctx.fill();
        if(k.y<=k.ty){rockets.splice(i,1);burst(k.x,k.y,64,5.2,[k.color,'#fff4d6',colors[(colors.indexOf(k.color)+2)%colors.length]]);}}
      for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.px=q.x;q.py=q.y;q.vx*=.972;q.vy=q.vy*.972+.075;q.x+=q.vx;q.y+=q.vy;q.life-=q.decay;
        if(q.life<=0){parts.splice(i,1);continue;}
        ctx.globalAlpha=Math.max(0,q.life);ctx.strokeStyle=q.color;ctx.lineWidth=q.size;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q.px,q.py);ctx.lineTo(q.x,q.y);ctx.stroke();}
      ctx.globalAlpha=1;
      if(now-start<900||parts.length||rockets.length)requestAnimationFrame(step);else canvas.remove();
    };
    requestAnimationFrame(step);
  }

  function downloadShare() { const r=s.result||current().result,svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440"><rect width="1080" height="1440" fill="#edf4ff"/><g font-family="Microsoft YaHei,sans-serif" text-anchor="middle"><text x="540" y="180" fill="#3264ff" font-size="70" font-weight="bold">Trip.com</text><text x="540" y="290" fill="#3264ff" font-size="38">TRIPWONDER · 奇境挑战</text><text x="540" y="480" fill="#193253" font-size="60">我发现了${esc(city().name)}</text><text x="540" y="800" fill="#3264ff" font-size="250" font-weight="bold">${r.score}</text><text x="540" y="885" fill="#6280b1" font-size="40">综合得分 / 100 · 定位 ${r.guess?.points??0} + 答题 ${r.quiz??r.score}</text><text x="540" y="1160" fill="#193253" font-size="38">下一站，等你发现</text><text x="540" y="1320" fill="#8ea1bc" font-size="28">TripWonder 原型 · ${day}</text></g></svg>`;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`TripWonder-${city().id}-${day}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('挑战卡已保存'); }
  function product(name) { const earned=s.benefits[s.cityId],active=benefitStatus(s.cityId)==='active';sheet(name,`<p>已带入目的地：${esc(city().name)}。此入口展示旅行产品承接方式，暂未接入实时库存、报价或下单。</p>${active?`<div class="clue-quote">已领取：${esc(earned.detail)}<br>${esc(earned.threshold)} · 有效至 ${esc(earned.expires)} · 仅适用于${esc(city().name)}相关产品。示例权益，无真实券码。</div>`:''}<a class="primary" href="https://www.ctrip.com/" target="_blank" rel="noopener noreferrer">打开携程官网</a>`); }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.city){selectCity(b.dataset.city);return;} if(b.dataset.go){go(b.dataset.go);return;}
    if(b.dataset.service){product(b.dataset.service);return;}if(b.dataset.product){product(b.dataset.product);return;}
    if(b.dataset.clue!==undefined){clue(Number(b.dataset.clue));return;}
    if(b.dataset.recall!==undefined){recall(Number(b.dataset.recall));return;}
    if(b.dataset.option!==undefined){s.selected=Number(b.dataset.option);const y=app.scrollTop;render();app.scrollTop=y;return;}
    if(b.dataset.days){s.days=Number(b.dataset.days);makeRoute();render();return;}
    if(b.dataset.rank){s.rank=b.dataset.rank;render();return;}
    if(b.dataset.review!==undefined){const a=(s.result||current().result).answers[Number(b.dataset.review)],url=answerSource(a),source=url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">资料出处 ↗</a>`:esc(a.source);sheet(`第 ${Number(b.dataset.review)+1} 题`, `<p><b>${esc(a.q)}</b></p><p>你的答案：${esc(a.options[a.selected])}<br>正确答案：${esc(a.options[a.answer])}</p><div class="clue-quote">${esc(a.explain)}<br>${source}</div>`);return;}
    if(b.dataset.itinerary){selectCity(b.dataset.itinerary);const it=s.itineraries[b.dataset.itinerary];s.days=it.days;s.pace=it.pace;s.theme=it.theme;s.date=it.date;s.route=it.route.map(d=>[...d]);go('route');return;}
    if(b.dataset.swap){const [di,si]=b.dataset.swap.split('-').map(Number),used=s.route.flat(),other=city().stops.filter(x=>!used.includes(x.name));sheet('替换停留地点',`<div class="swap-list">${other.length?other.map(x=>`<button class="answer-line" data-replace="${di}-${si}" data-stop="${esc(x.name)}"><span>${esc(x.name)}</span><small>${esc(x.theme||'景点')}</small></button>`).join(''):'<p>此目的地的其他景点已全部排入路线。可先缩短天数，再进行替换。</p>'}</div>`);return;}
    if(b.dataset.replace){const [di,si]=b.dataset.replace.split('-').map(Number);s.route[di][si]=b.dataset.stop;render();return;}
    if(b.dataset.move){const [di,si,direction]=b.dataset.move.split('-'),list=s.route[Number(di)],from=Number(si),to=from+(direction==='up'?-1:1);if(to>=0&&to<list.length){[list[from],list[to]]=[list[to],list[from]];render();}return;}
    const action=b.dataset.action;
    if(action==='close')dismissModal();
    else if(action==='rules')showRules();
    else if(action==='rules-start')dismissModal(cueStart);
    else if(action==='start')start();
    else if(action==='show-result')go('result');
    else if(action==='prev-city'){const prev=previousDestination(s.cityId);if(prev)selectCity(prev);}
    else if(action==='next-city'){const next=nextDestination(s.cityId,true);if(next)selectCity(next);else go('home');}
    else if(action==='skip'){s.daily[s.cityId]={...current(),skipped:true};const next=nextDestination(s.cityId);if(next)selectCity(next);else{go('home');toast('今日目的地已浏览，可从首页重新探索');}}
    else if(action==='leave')sheet('暂时离开？','<p>探索倒计时仍会继续。</p><button class="primary" data-go="cover">返回目的地封面</button>');
    else if(action==='prev-scene'){if(s.scene>0){const prev=s.scene-1;loadView('explore',prev,()=>{s.scene=prev;});}}
    else if(action==='fav'){const on=!s.bookmarks[s.cityId];s.bookmarks[s.cityId]=on;b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'取消收藏':'收藏这个目的地');toast(on?'已收藏，揭晓目的地后可在结果页查看':'已取消收藏');}
    else if(action==='next-scene'){if(s.scene<city().scenes.length-1){const next=s.scene+1;loadView('explore',next,()=>{s.scene=next;s.visited.add(next);});}else beginQuiz();}
    else if(action==='speak'){if(!('speechSynthesis' in window)){toast('当前浏览器不支持朗读');return;}const u=new SpeechSynthesisUtterance(modalRoot.querySelector('#clue-text').textContent);u.lang='zh-CN';u.rate=.92;u.onerror=()=>toast('朗读暂不可用');speechSynthesis.cancel();speechSynthesis.speak(u);}
    else if(action==='submit'&&s.selected!==null){const q=s.questions[s.q];s.answers.push({...q,selected:s.selected,correct:q.answer===s.selected});if(s.q===2){s.guess=null;s.guessDone=false;go('guess');}else{s.q++;s.selected=null;render();}}
    else if(action==='guess-submit')submitGuess();
    else if(action==='guess-back'){if(!s.guessDone&&s.answers.length===3){const last=s.answers.pop();s.q=2;s.selected=last.selected;go('quiz');}}
    else if(action==='zoom-in')mapView?.zoomBy(1.7);
    else if(action==='zoom-out')mapView?.zoomBy(1/1.7);
    else if(action==='bookmark'){s.bookmarks[s.cityId]=!s.bookmarks[s.cityId];render();}
    else if(action==='claim'&&current().result){const benefit=benefitFor(current().result);s.benefits[s.cityId]={date:day,expires:datePlusDays(7),detail:benefit.detail,threshold:benefit.threshold};render();const card=app.querySelector('.benefit');card?.classList.add('just-claimed');celebrate(card?.querySelector('[data-action="claim"]'));toast('已领取示例权益，可在路线页查看使用范围');}
    else if(action==='share')share();else if(action==='system-share'){navigator.share?.({title:'TripWonder 奇境挑战',text:`我在 TripWonder 拿到了 ${(s.result||current().result).score} 分，猜猜我去了哪里？`,url:inviteUrl()}).catch(()=>{});}else if(action==='download-share')downloadShare();
    else if(action==='copy-invite'){const input=modalRoot.querySelector('#invite-link'),copy=navigator.clipboard?.writeText(input.value);if(copy)copy.then(()=>toast('挑战链接已复制')).catch(()=>{input.focus();input.select();toast('已选中挑战链接，请手动复制');});else{input.focus();input.select();toast('已选中挑战链接，请手动复制');}}
    else if(action==='save-trip'){s.itineraries[s.cityId]={city:city().name,days:s.days,pace:s.pace,theme:s.theme,date:s.date,route:s.route.map(d=>[...d])};sheet('路线已保存',`<p>${esc(city().name)} ${s.days} 日路线已保存在本次体验中，刷新页面后会重新开始。</p><button class="primary" data-go="itinerary">查看我的行程</button>`);}
    else if(action==='search')go('today');
    else if(action==='home-coupon')sheet('旅行好礼','<p>首页优惠为携程界面示例。完成 TripWonder 挑战可领取原型示例权益。</p><button class="primary" data-go="today">去探索</button>');
  });
  document.addEventListener('change',event=>{const el=event.target;if(el.id==='route-pace'){s.pace=el.value;makeRoute();render();}else if(el.id==='route-theme'){s.theme=el.value;makeRoute();render();}else if(el.id==='route-date'){s.date=el.value;s.route=reorderDaysForOpenings(s.route);render();}});
  document.addEventListener('keydown',event=>{if(!modalRoot.innerHTML)return;if(event.key==='Escape')dismissModal();if(event.key==='Tab'){const f=[...modalRoot.querySelectorAll('button,a[href],[tabindex="0"]')];if(!f.length)return;if(event.shiftKey&&(document.activeElement===f[0]||document.activeElement===modalRoot.querySelector('[role="dialog"]'))){event.preventDefault();f.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===f.at(-1)){event.preventDefault();f[0].focus();}}});
  modalRoot.addEventListener('click',event=>{if(event.target.classList.contains('modal-overlay')||event.target.classList.contains('rules-overlay'))dismissModal();});
  window.addEventListener('pagehide',()=>{cancelPending();SceneMedia.retain([]);viewer?.destroy();window.speechSynthesis?.cancel?.();});
  if(invitation)loadView('cover',0);else render();
})();
