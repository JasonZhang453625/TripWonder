(() => {
  'use strict';
  const C = window.TRIPWONDER_CATALOG;
  const paths = {
    back:'m15 5-7 7 7 7', next:'m9 5 7 7-7 7', close:'m6 6 12 12M18 6 6 18',
    atlas:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16',
    trophy:'M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v5m-4 2h8m-7-2h6',
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
  // A stable daily draw: five different destinations from the complete library.
  const libraryOrder = shuffle(C.cities.map(c => c.id), day);
  const order = libraryOrder.slice(0,5);
  const daily = {}, benefits = {};
  let invitation=null;
  try { const raw=new URL(location.href).searchParams.get('challenge');if(raw){const token=raw.replace(/-/g,'+').replace(/_/g,'/'),candidate=JSON.parse(atob(token));if(libraryOrder.includes(candidate.cityId)&&Number.isInteger(candidate.score)&&candidate.score>=0&&candidate.score<=100)invitation=candidate;} } catch {}
  // A shared destination must stay playable even when it is outside today's draw.
  if(invitation&&!order.includes(invitation.cityId))order[order.length-1]=invitation.cityId;
  const QUIZ_DURATION = 2 * 60 * 1000;
  const s = {
    view:invitation?'cover':'home', cityId: invitation?.cityId || order.find(id => !daily[id]?.result && !daily[id]?.skipped) || order[0],
    scene:0, exploring:false, deadline:0, quizRemaining:QUIZ_DURATION, clues:new Set(), visited:new Set([0]), questions:[], answers:[], q:0, selected:null,
    result:null, days:2, pace:'舒适', theme:'自动', date:'', route:null, rank:'今日', collectionBack:'today',
    daily, benefits, badges:{}, invitation, itineraries:{}, bookmarks:{}, rulesSeen:false
  };
  let timer, viewer, mapView, resultReveal, coverCarousel, clueSheet, toastTimer, transition=0, pendingCleanup, rulesCleanup, previousFocus, activeShare, resultRouteReturn;
  const cityProgress = new Map();
  const city = () => C.cities.find(c => c.id === s.cityId) || C.cities[0];
  const current = () => s.daily[s.cityId] || {};
  // Location guess scoring: full marks for a pin in the destination's own city (prefecture level; municipalities
  // and SARs as a whole), otherwise full inside fullKm, then exponential decay. A city may override via city.guess.
  const GUESS = {max:40, fullKm:25, decayKm:450}, QUIZ_POINTS = [20,20,20];
  const guessRule = () => ({...GUESS, ...city().guess});
  function guessScore(km,sameCity=false) { const c=guessRule(); return sameCity||km<=c.fullKm?c.max:Math.round(c.max*Math.exp(-(km-c.fullKm)/c.decayKm)); }
  const guessVerdict = ({km,sameCity}) => sameCity?'同城命中':km<=25?'精准命中':km<=100?'近在咫尺':km<=300?'八九不离十':km<=800?'方向对了':'下次再近一点';
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
  let favoriteAudio;
  async function playFavoriteSound() {
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)return;
    try {
      if(!favoriteAudio||favoriteAudio.state==='closed')favoriteAudio=new AudioContext();
      if(favoriteAudio.state!=='running')await favoriteAudio.resume();
      if(favoriteAudio.state!=='running')return;
      const start=favoriteAudio.currentTime;
      for(const [offset,frequency] of [[0,880],[.065,1174.66]]){
        const tone=favoriteAudio.createOscillator(),gain=favoriteAudio.createGain(),at=start+offset;
        tone.type='sine';tone.frequency.setValueAtTime(frequency,at);
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.055,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+.18);
        tone.connect(gain);gain.connect(favoriteAudio.destination);
        tone.onended=()=>{tone.disconnect();gain.disconnect();};tone.start(at);tone.stop(at+.2);
      }
    } catch {}
  }
  function head(title,back='today',right='') { return `<header class="page-head"><button class="icon-btn" data-go="${back}" aria-label="返回">${icon('back')}</button><strong>${esc(title)}</strong>${right || '<span style="width:36px"></span>'}</header>`; }
  function nav(active='home') { return `<nav class="bottom-nav" aria-label="携程导航">${[['home','首页','home'],['message','消息','notice'],['people','社区','community'],['bag','行程','itinerary'],['user','我的','profile']].map(([i,t,v])=>`<button class="${active===v?'active':''}" data-go="${v}">${icon(i)}${t}</button>`).join('')}</nav>`; }
  function homeNav() { return `<nav class="bottom-nav th-nav" aria-label="携程导航">${[['home','Home','home'],['messages','Messages','notice'],['community','Community','ranking'],['trips','My Trips','atlas'],['account','Account','profile']].map(([i,t,v])=>`<button class="${v==='home'?'active':''}" data-go="${v}"><img src="assets/home/nav-${i}.png" alt="">${t}</button>`).join('')}</nav>`; }
  function home() { const h='assets/home/';
    const main=[['hotels','Hotels'],['flights','Flights'],['flight-hotel','Flight + Hotel'],['trains','Trains']].map(([i,t])=>`<button class="th-main-item" data-service="${t}"><img src="${h}svc-${i}.png" alt=""><span>${t}<i>.</i></span></button>`).join('');
    const sub=[['vacation','Vacation Rentals'],['attractions','Attractions & Tours'],['car','Car Rentals'],['package','Package Tours'],['more','+7 more']].map(([i,t])=>`<button class="th-sub-item" data-service="${esc(t)}"><img src="${h}sub-${i}.png" alt=""><span>${esc(t).replace(/^(Vacation|Attractions|Package) /,'$1<br>')}</span></button>`).join('');
    const apps=`<button class="th-app th-wonder entry" data-go="today"><span class="th-app-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8.5c-7 0-12.5 5.3-12.5 12.1 0 8.6 12.5 19.9 12.5 19.9s12.5-11.3 12.5-19.9C36.5 13.8 31 8.5 24 8.5Z" fill="none" stroke="#161a2b" stroke-width="3.2" stroke-linejoin="round"/><path d="M20.2 18.4a3.9 3.9 0 1 1 5.6 3.5c-1.3.7-1.8 1.4-1.8 2.8" fill="none" stroke="#2d61ff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="29" r="1.9" fill="#2d61ff"/><path d="m38 5 1.5 3.6L43 10l-3.5 1.4L38 15l-1.5-3.6L33 10l3.5-1.4Z" fill="#2d61ff"/></svg><b>NEW</b></span>TripWonder</button>`+[['deals','Deals','deals'],['events','Events','events'],['planner','Trip.Planner','itinerary'],['trending','Trending','trending'],['best','Trip.Best','trending']].map(([i,t,v])=>`<button class="th-app" data-go="${v}"><span class="th-app-icon"><img src="${h}qa-${i}.png" alt=""></span>${t}</button>`).join('');
    const coupon=(icon,off)=>`<button class="th-coupon" data-action="home-coupon"><span class="th-coupon-body"><img src="${h}cp-${icon}.png" alt=""><span><strong>${off}</strong><small>Use <svg viewBox="0 0 8 14" aria-hidden="true"><path d="m1.5 1.5 5 5.5-5 5.5"/></svg></small></span></span></button>`;
    return `<div class="page trip-home"><header class="th-head"><img class="th-logo" src="${h}logo.png" alt="Trip.com"><div class="th-member"><span class="th-silver"><img src="${h}silver.png" alt="">Silver</span><img class="th-coin" src="${h}coin.png" alt="Trip Coins"></div></header>`
    + `<div class="th-sheet"><div class="th-main">${main}</div><div class="th-sub">${sub}</div>`
    + `<form class="th-search" role="search"><input type="search" name="q" enterkeyhint="search" autocomplete="off" aria-label="Search destinations, hotels, flights"><button class="th-search-btn" type="submit" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg></button></form>`
    + `<div class="th-chips"><div class="th-chip-scroll">${["Hotels in Xi'an","Xi'an",'Shanghai','Beijing','Chengdu'].map(t=>`<button type="button" data-action="home-chip">${esc(t)}</button>`).join('')}</div><button class="th-map" data-action="home-search"><img src="${h}map-pin.png" alt="">Map</button></div>`
    + `<div class="th-apps">${apps}</div>`
    + `<section class="th-discount"><button class="th-discount-head" data-action="home-coupon"><img src="${h}hat.png" alt=""><strong>New User Discounts Available</strong><img class="th-chev" src="${h}chev.png" alt=""></button><div class="th-coupons">${coupon('hotel','10% off')}${coupon('train','5% off')}${coupon('car','8% off')}</div></section>`
    + `<div class="th-recent-head"><strong>Your recent activities</strong><img src="${h}trash.png" alt="Clear"></div>`
    + `<button class="th-recent" data-go="today"><img src="${h}westlake.png" alt="West Lake"><span><strong>West Lake</strong><small>Hangzhou<i></i><b>4.7</b>/5</small></span></button>`
    + `<div class="th-banners"><button class="th-banner th-banner-photo" data-go="today">${img('bj-beihai','')}<span><small>Explore</small><strong>North<br>China</strong></span></button><button class="th-banner th-banner-tuesday" data-action="home-coupon"><strong class="th-tt">Trip<i>.</i>Tuesday</strong><span class="th-tt-coupon"><b>$40</b>COUPON<br>AVAILABLE</span><strong class="th-tt-copy">Canada<br>and Japan from</strong></button></div></div>`
    + `<button class="th-ai" data-action="home-ai"><img src="${h}ai.png" alt=""><span>Ask AI or hold to speak</span></button>${homeNav()}</div>`; }
  function cover() {
    const c=city(),record=current(),friend=s.invitation?.cityId===c.id,index=order.indexOf(c.id);
    return `<div class="page cover-page" data-cover-city="${esc(c.id)}" role="region" aria-roledescription="轮播" aria-label="今日目的地，左右滑动切换"><div class="cover-hero" tabindex="0" aria-label="第 ${index+1} 个目的地，共 ${order.length} 个；左右方向键切换">${img(c.scenes[0].id,'待探索的目的地',true)}</div><header class="immersive-top"><button class="glass round" data-go="home" aria-label="返回首页">${icon('back')}</button><span class="cover-name">TripWonder</span><button class="glass" data-action="rules" aria-haspopup="dialog" aria-expanded="false">玩法</button></header><div class="cover-footer"><nav class="cover-dock" aria-label="探索与发现"><div class="cover-dock-links"><button class="cover-tool" data-go="atlas">${icon('atlas')}<span>图鉴</span></button><button class="cover-tool" data-go="ranking">${icon('trophy')}<span>排行榜</span></button></div><button class="primary cover-enter" data-action="${record.result&&!friend?'show-result':'start'}"><span>${friend?'接受好友挑战':record.result?'查看探索结果':s.exploring?'继续探索':'进入探索'}</span>${icon('next')}</button></nav></div></div>`;
  }
  function explore(index=s.scene) { const scene=city().scenes[index],last=index===city().scenes.length-1; return `<div class="page explore-page"><div class="photo-viewport" tabindex="0" role="region" aria-label="景点照片，可双指缩放、拖动和平移"><div class="photo-plane">${window.IMMERSIVE_SCENES?.[scene.id]?'':img(scene.id,`第${index+1}处景点`,true)}${scene.hotspots.map((h,i)=>`<button class="hotspot ${s.clues.has(`${index}-${i}`)?'read':''}" data-clue="${i}" aria-label="查看线索 ${i+1}" aria-haspopup="dialog" style="left:${h.x}%;top:${h.y}%;--pulse-delay:${i*-.8}s"><span class="hotspot-dot" aria-hidden="true"></span></button>`).join('')}</div></div><header class="immersive-top"><button class="glass round" data-action="leave" aria-label="退出探索">${icon('back')}</button><span class="scene-counter">${index+1} / ${city().scenes.length}</span><span class="top-right"><button class="glass round fav" data-action="fav" aria-pressed="${!!s.bookmarks[s.cityId]}" aria-label="${s.bookmarks[s.cityId]?'取消收藏':'收藏这个目的地'}">${icon('heart')}</button></span></header><div class="explore-bottom"><div class="scene-nav${last?' scene-nav-last':''}" role="group" aria-label="场景导航"><button class="prev-scene" data-action="prev-scene" aria-label="上一处"${index?'':' disabled'}>${icon('back')}</button><button data-action="next-scene" aria-label="${last?'开始挑战':'下一处'}">${last?'开始挑战':icon('next')}</button></div></div></div>`; }
  function quizBody() {
    const q=s.questions[s.q];
    return `<section class="quiz-top"><div class="quiz-progress" aria-label="第 ${s.q+1} 题，共 3 题">${s.questions.map((_,i)=>`<span class="${i<s.q?'done':i===s.q?'current':''}"></span>`).join('')}</div><h1 class="quiz-question" tabindex="-1">${esc(q.q)}</h1></section><div class="question-card quiz-options" role="group" aria-label="选择答案">${q.options.map((o,i)=>`<button class="option ${s.selected===i?'selected':''}" data-option="${i}" aria-pressed="${s.selected===i}"><b class="option-letter">${String.fromCharCode(65+i)}</b><span class="option-text">${esc(o)}</span><span class="option-check" aria-hidden="true">${icon('check')}</span></button>`).join('')}</div>`;
  }
  function quiz() {
    return `<div class="page quiz-page"><div class="quiz-backdrop" aria-hidden="true"></div><header class="page-head quiz-header"><button class="glass round quiz-back" data-action="quiz-back" aria-label="返回刚刚的场景">${icon('back')}</button><strong>线索挑战</strong><span class="glass timer quiz-timer" role="timer" aria-label="答题剩余时间"><svg class="icon quiz-clock" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></svg><b id="timer">02:00</b></span></header><main class="quiz-body">${quizBody()}</main><footer class="quiz-submit"><button class="primary" data-action="submit" ${s.selected===null?'disabled':''}><span>${s.q===2?'前往地图':'下一题'}</span>${icon('next')}</button></footer></div>`;
  }
  function selectAnswer(index) {
    if(s.view!=='quiz'||ChallengeMotion.busy)return;
    if(s.deadline<=Date.now()){tick();return;}
    const changed=s.selected!==index;s.selected=index;
    app.querySelectorAll('[data-option]').forEach(button=>{const selected=Number(button.dataset.option)===index;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    const submit=app.querySelector('[data-action="submit"]'),wasDisabled=submit.disabled;submit.disabled=false;
    if(changed)ChallengeMotion.select(app.querySelector('[data-option="'+index+'"]'));
    if(wasDisabled)ChallengeMotion.activate(submit);
  }
  function submitAnswer() {
    if(s.view!=='quiz'||s.selected===null||ChallengeMotion.busy)return;
    if(s.deadline<=Date.now()){tick();return;}
    const index=s.q,selected=s.selected,q=s.questions[index];
    if(index===2){s.answers.push({...q,selected,correct:q.answer===selected});finishQuiz();return;}
    ChallengeMotion.run(()=>{
      if(s.view!=='quiz'||s.q!==index)return;
      if(s.deadline<=Date.now()){tick();return;}
      s.answers.push({...q,selected,correct:q.answer===selected});s.q++;s.selected=null;
      app.querySelector('.quiz-body').innerHTML=quizBody();
      QuizScene.set(app.querySelector('.quiz-page'),city(),s.questions[s.q]);
      const submit=app.querySelector('[data-action="submit"]');submit.disabled=true;submit.querySelector('span').textContent=s.q===2?'前往地图':'下一题';
    },{kind:'question'});
  }
  function guess() { return `<div class="page guess-page${s.guessDone?' done':''}"><div class="guess-map" id="guess-map" role="application" aria-label="中国地图：轻点放置落点，双指或滚轮缩放，拖动平移"></div><header class="guess-top"><button class="glass-light round" data-action="guess-back" aria-label="${s.guessDone?'返回首页':'返回第 3 题'}"${!s.guessDone&&s.quizRemaining<=0?' disabled':''}>${icon('back')}</button><div><h2>这个目的地在哪里？</h2></div></header><div class="guess-zoom"><button class="glass-light" data-action="zoom-in" aria-label="放大地图">+</button><button class="glass-light" data-action="zoom-out" aria-label="缩小地图">−</button></div><section class="guess-card" aria-live="polite">${guessCard()}</section></div>`; }
  function guessStatus() { const g=s.guess; return g?`${icon('pin')}<div><strong>${esc([g.province,g.city].filter(Boolean).join(' · ')||'所选位置')}</strong><small>北纬 ${g.lat.toFixed(1)}° · 东经 ${g.lng.toFixed(1)}° · 再点一次可调整</small></div>`:`<span class="guess-hint-dot" aria-hidden="true"></span><div><strong>轻点地图，放下你的落点</strong><small>双指缩放更精准 · 越近得分越高，最高 ${guessRule().max} 分</small></div>`; }
  function guessCard() {
    if(s.guessDone){ const g=s.guess; return `<div class="guess-result"><div><span class="guess-verdict">${esc(guessVerdict(g))}</span><strong class="guess-km"><b data-count="${g.km}">${g.km}</b> km</strong><small>你的落点距${esc(city().name)}（直线）</small></div><div class="guess-points"><b data-count="${g.points}">${g.points}</b><small>/ ${guessRule().max} 定位分</small></div></div><button class="primary" data-action="show-result">查看完整结果 ${icon('next')}</button>`; }
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
    if(status){status.innerHTML=guessStatus();ChallengeMotion.update(status);}if(submit){const wasDisabled=submit.disabled;submit.disabled=false;if(wasDisabled)ChallengeMotion.activate(submit);}
  }
  let locating=null;
  async function submitGuess() {
    if(!s.guess||s.guessDone||locating)return;
    const c=city(),guessAt=s.guess;
    // Same city scores full marks, so the pin and the destination are both resolved to a city first.
    locating=Promise.all([GuessMap.locate(guessAt),GuessMap.locate(GuessMap.toXY(c.lat,c.lng))]);
    const [mine,target]=await locating.finally(()=>{locating=null;});
    if(s.view!=='guess'||city()!==c||s.guess!==guessAt||s.guessDone)return;
    const sameCity=!!target.city&&mine.province===target.province&&mine.city===target.city;
    const km=Math.round(distance(s.guess,c));s.guess={...s.guess,...(mine.province?mine:{}),km,sameCity,points:guessScore(km,sameCity)};s.guessDone=true;finish();
    const page=app.querySelector('.guess-page'),card=app.querySelector('.guess-card'),back=page.querySelector('[data-action="guess-back"]');page.classList.add('done');back.disabled=false;back.setAttribute('aria-label','返回首页');page.querySelector('.guess-top h2').textContent=`答案揭晓：${city().name}`;card.innerHTML=guessCard();ChallengeMotion.reveal(card,page.querySelector('.guess-top h2'));
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
  const REWARD_TERMS='领取后 30 日内有效。优惠券具体可用范围请查看活动规则。';
  const benefitFor = () => ({name:`优惠权益 · ${city().name}`,detail:'景点门票 20 元优惠券',threshold:'满 100 元可用',amount:20,minimumSpend:100,validDays:30,terms:REWARD_TERMS});
  // Display-only coupon row on the result card; the first entry mirrors benefitFor().
  const RESULT_COUPONS=[['20 元优惠券','景点门票 · 满 100 元可用'],['50 元优惠券','酒店 · 满 500 元可用'],['15 元优惠券','火车票 · 满 200 元可用'],['9 折优惠','当地玩乐 · 最高减 30 元'],['10 元优惠券','美食 · 满 80 元可用']];
  // Prototype-only score mapping until a real participant score distribution is available.
  function estimateRewardPercentile(score) {const points=Math.max(0,Math.min(100,Number(score)||0));return Math.min(99.9,Math.round((1-Math.pow(1-points/100,1.6))*1000)/10);}
  const benefitStatus = id => !s.benefits[id]?'none':s.benefits[id].expires>=today()?'active':'expired';
  function benefitDialog(benefit,earned) {
    return `<div class="benefit-pack">
      <header class="benefit-pack-hero">
        <span class="benefit-pack-brand" aria-label="Trip.com">Trip<span>.</span>com</span>
        <span class="benefit-pack-eyebrow">目的地专属礼遇</span>
        <h3>${esc(benefit.name)}</h3><p>让下一程多一份惊喜</p>
        <img class="benefit-pack-gift" src="assets/home/hat.png" alt="" aria-hidden="true">
      </header>
      <div class="benefit-pack-body">
        <div class="benefit-pack-ticket">
          <div class="benefit-pack-ticket-top">${icon('ticket')}<span>景点门票优惠券</span></div>
          <div class="benefit-pack-amount"><span>¥</span><strong>${earned.amount}</strong></div>
          <p class="benefit-pack-threshold">${esc(earned.threshold)}</p>
          <div class="benefit-pack-ticket-rule" aria-hidden="true"></div>
          <div class="benefit-pack-meta"><span>适用目的地</span><strong>${esc(city().name)}</strong></div>
          <div class="benefit-pack-meta"><span>有效至</span><strong>${esc(earned.expires)}</strong></div>
          <button class="benefit-pack-accept" data-action="close">收下权益 ${icon('next')}</button>
        </div>
        <p class="benefit-pack-terms">${REWARD_TERMS}</p>
      </div>
    </div>`;
  }
  const datePlusDays = count => {const d=new Date();d.setDate(d.getDate()+count);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function resultOpening(c,r) {
    const story=ResultReveal.destination(c);
    return `<header class="result-topbar"><button class="result-tool" data-go="home" aria-label="返回首页">${icon('back')}</button><span>我的发现</span><div class="result-top-actions"><button class="result-tool" data-action="fav" aria-pressed="${!!s.bookmarks[c.id]}" aria-label="${s.bookmarks[c.id]?'取消收藏':'收藏这个目的地'}">${icon('heart')}</button><button class="result-tool" data-action="share" aria-label="分享成绩">${icon('share')}</button></div></header><section class="result-intro" aria-label="${esc(c.name)}探索成绩">
      <div class="result-hero" style="--result-position:${story.position||'50% 50%'}">
        <div class="result-visual">${img(story.scene.id,`${c.name} · ${story.scene.name}`,true)}<div class="result-shade"></div></div>
        <div class="result-copy"><div class="result-region">${icon('pin')}${esc(c.region)} · ${esc(c.name)}</div><h1 class="result-arrival"><span>你好，</span><strong>${esc(c.name)}<i>。</i></strong></h1></div>
        <p class="result-description">${esc(story.description||'沿着眼前的风景，继续发现这座城市。')}</p>
        <div class="result-score-module"><div class="result-score-label">本次探索得分</div><div class="result-score-number">${r.score}<small>/ 100</small></div></div>
        <div class="result-score-breakdown"><span>地图定位 <b>${r.guess?.points??0}<small> / ${GUESS.max}</small></b></span><span>线索答题 <b>${r.quiz??r.score}<small> / 60</small></b></span></div>
        <button class="result-scroll-cue" aria-label="向下查看地图与探索详情">向下，继续这段旅程 ${icon('down')}</button>
      </div>
    </section>`;
  }
  function result() { const r=s.result || current().result; if(!r)return empty('目的地尚未揭晓','完成探索和三道题，再来查看结果。'); const c=city(), benefit=benefitFor(r), status=benefitStatus(c.id), next=nextDestination(s.cityId,true), prev=previousDestination(s.cityId); return `<div class="page result-page">${resultOpening(c,r)}<div class="result-details">${r.guess?`<section class="content-card guess-summary"><div class="row"><h3>地图定位</h3><span class="pill">${esc(guessVerdict(r.guess))}</span></div><div class="guess-mini">${GuessMap.snapshot(r.guess,c)}</div><div class="guess-legend"><span class="you">你的落点</span><span class="target">${esc(c.name)}</span></div><div class="guess-stats"><div><b>${r.guess.km} km</b><small>直线距离</small></div><div><b>+${r.guess.points}</b><small>定位得分 / ${GUESS.max}</small></div><div><b>${esc(r.guess.city||r.guess.province||'—')}</b><small>你的落点</small></div></div></section>`:''}<section class="content-card"><h3>三题一起揭晓</h3>${r.answers.map((a,i)=>`<button class="answer-line" data-review="${i}" style="width:100%;text-align:left">${icon(a.correct?'check':'book')}<span>第 ${i+1} 题 · ${a.correct?'答对':'查看解析'}</span><b>${a.correct?'+'+a.points:'0'} 分</b>${icon('next')}</button>`).join('')}</section><section class="content-card benefit badge-benefit" aria-label="纪念徽章"><div class="row"><div><strong>奇境挑战徽章 · ${esc(c.name)}</strong><p>珍藏这一站的发现</p></div><button data-action="claim">${s.badges[c.id]?'查看徽章':'领取徽章'}</button></div></section><section class="content-card benefit coupon-benefit" aria-label="优惠权益"><div class="coupon-panel"><div class="coupon-head"><strong>${esc(benefit.name)}</strong><button data-action="claim-coupon">${status==='active'?'查看权益':status==='expired'?'重新领取':'领取权益'}</button></div><div class="coupon-tickets" tabindex="0" aria-label="优惠券列表，左右滑动查看">${RESULT_COUPONS.map(([title,detail])=>`<div class="coupon-ticket"><b>${title}</b><span>${detail}</span></div>`).join('')}</div><p class="coupon-terms">${REWARD_TERMS}</p></div></section><div class="result-actions"><button class="primary" data-go="route">为我规划${esc(c.name)}之旅 ${icon('next')}</button><div class="stop-nav"><button class="glass-light prev-city" data-action="prev-city"${prev?'':' disabled'}>${icon('back')} 上一个目的地</button>${next?`<button class="secondary next-city" data-action="next-city">下一个目的地 ${icon('next')}</button>`:'<button class="secondary next-city" data-go="home">返回首页</button>'}</div></div></div></div>`; }
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
  function atlas() { return CollectionPages.atlas({order,cities:C.cities,daily:s.daily,badges:s.badges,img,head,esc,back:s.collectionBack}); }
  function ranking() { return CollectionPages.ranking({order,cities:C.cities,daily:s.daily,rank:s.rank,head,esc,icon,img,back:s.collectionBack}); }
  function itinerary() { const items=Object.entries(s.itineraries); return `<div class="page">${head('我的行程','home')}<div class="pad"><h2>${items.length?`${items.length} 份已保存路线`:'还没有行程'}</h2></div>${items.length?items.map(([id,it])=>`<section class="content-card itinerary-card"><strong>${esc(it.city)} ${it.days} 日</strong><p>${esc(it.date || '日期待定')} · ${it.route.flat().length} 处停留 · ${esc(it.pace)}节奏</p><button class="secondary" data-itinerary="${id}">查看并调整</button></section>`).join(''):`<div class="pad"><button class="primary" data-go="today">去发现目的地</button></div>`}</div>`; }
  function profile() { const tags={}; for(const item of Object.values(s.daily))for(const tag of item.result?.tags||[])tags[tag]=(tags[tag]||0)+1; return `<div class="page">${head('我的旅行','home')}<div class="pad"><h2>我的发现</h2><p class="muted tiny">今日完成 ${order.filter(id=>s.daily[id]?.result).length} / ${order.length} 座城</p><div class="tag-row">${Object.entries(tags).sort((a,b)=>b[1]-a[1]).map(([tag,n])=>`<span class="pill">${esc(tag)} · ${n}</span>`).join('')}</div></div><div class="content-card"><button class="answer-line" data-go="atlas" style="width:100%">${icon('book')}<span>目的地图鉴</span>${icon('next')}</button><button class="answer-line" data-go="ranking" style="width:100%">${icon('spark')}<span>今日成绩</span>${icon('next')}</button><button class="answer-line" data-go="itinerary" style="width:100%">${icon('bag')}<span>我的行程</span>${icon('next')}</button></div></div>`; }
  function empty(title,body) { return `<div class="page">${head(title)}<div class="empty"><p>${body}</p><button class="primary" data-go="today">探索今日目的地</button></div></div>`; }

  function cancelPending() { transition++; pendingCleanup?.(); pendingCleanup=null; }
  async function loadView(view,index,commit) {
    cancelPending(); const ticket=transition, p=city().scenes[index].photo;
    const config=view==='explore' && window.IMMERSIVE_SCENES?.[p.id];
    const immersive=!!(config && window.ImmersivePhotoViewer);
    if(immersive)window.ImmersiveSceneMedia?.setDestination(city().id,city().scenes.map(scene=>window.IMMERSIVE_SCENES?.[scene.photo.id]).filter(Boolean));
    else window.ImmersiveSceneMedia?.clear();
    const buttons=[...app.querySelectorAll('[data-action="start"],[data-action="next-scene"],[data-action="prev-scene"]')];
    const old=buttons.map(b=>[b,b.innerHTML,b.disabled]);
    buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');});
    let stage, incoming, overlay, transferred=false;
    const cleanOverlay=()=>{overlay?.getAnimations().forEach(a=>a.cancel());overlay?.remove();app.classList.remove('scene-loading');};
    const cleanup=()=>{
      cleanOverlay();
      if(!transferred){incoming?.destroy();stage?.remove();if(s.view!=='explore')window.ImmersiveSceneMedia?.clear();}
      old.forEach(([b,label,disabled])=>{if(b.isConnected){b.innerHTML=label;b.disabled=disabled;b.removeAttribute('aria-busy');}});
    };
    pendingCleanup=cleanup;
    try {
      let ready;
      if(immersive){
        const phone=document.querySelector('#phone'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
        overlay=document.createElement('div');overlay.className='scene-transition';overlay.setAttribute('role','status');
        overlay.innerHTML='<span class="scene-transition-orbit" aria-hidden="true"></span><span>'+(s.view==='quiz'?'正在返回刚刚的场景':'正在展开下一处风景')+'</span>';
        phone.append(overlay);app.classList.add('scene-loading');
        const entrance=overlay.animate([{opacity:0},{opacity:1}],{duration:reduced?0:180,fill:'both'});
        const frame=document.createElement('div');frame.innerHTML=explore(index);stage=frame.firstElementChild;
        stage.classList.add('scene-staging');stage.inert=true;stage.setAttribute('aria-hidden','true');phone.append(stage);
        incoming=new ImmersivePhotoViewer(stage.querySelector('.photo-viewport'),p,config);
        await Promise.all([incoming.ready,entrance.finished]);
      }else{
        const existing=app.querySelector('.cover-hero>img');
        SceneMedia.retain([SceneMedia.source(p,true).src,...(existing?[existing.src]:[])]);
        ready=await SceneMedia.prepare(p);
      }
      if(ticket!==transition)return;
      commit?.();s.view=view;pendingCleanup=null;transferred=true;
      render(ready,immersive?{page:stage,viewer:incoming}:null);
      if(overlay){
        pendingCleanup=cleanOverlay;
        await overlay.animate([{opacity:1},{opacity:0}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:320,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}).finished;
        if(pendingCleanup===cleanOverlay){cleanOverlay();pendingCleanup=null;}
      }
    }catch(error){if(ticket===transition){if(!transferred&&s.view==='quiz'){s.exploring=false;resumeQuizTimer();}if(error.name!=='AbortError')toast('场景暂未载入，请重试');}}
    finally{if(ticket===transition){cleanup();pendingCleanup=null;}}
  }
  function render(ready,prepared,{deferRules=false}={}) {
    QuizScene.destroy();
    coverCarousel?.destroy();coverCarousel=null;
    cancelPending(); closeModal(); pauseQuizTimer(); viewer?.destroy(); viewer=null; mapView?.destroy(); mapView=null;resultReveal?.destroy();resultReveal=null;
    if(s.view!=='explore')window.ImmersiveSceneMedia?.clear();
    document.querySelector('#phone').classList.toggle('immersive',['cover','explore'].includes(s.view));
    document.querySelector('#phone').classList.toggle('flat-mode',!['cover','explore'].includes(s.view));
    document.querySelector('#phone').classList.toggle('quiz-mode',s.view==='quiz');
    document.querySelector('#phone').classList.toggle('home-mode',s.view==='home');
    document.querySelector('#phone').classList.toggle('result-mode',s.view==='result'&&!!(s.result||current().result));
    const views={home,cover,explore,quiz,guess,result,route,atlas,ranking,itinerary,profile};
    const frame=document.createElement('div');
    if(prepared){prepared.page.classList.remove('scene-staging');prepared.page.inert=false;prepared.page.removeAttribute('aria-hidden');frame.append(prepared.page);}
    else frame.innerHTML=(views[s.view]||home)();
    frame.firstElementChild.dataset.view=s.view;
    if(ready){const placeholder=frame.querySelector('.photo-plane>img,.cover-hero>img,.result-visual>img,.route-hero>img'); if(placeholder){ready.alt=placeholder.alt;placeholder.replaceWith(ready);}}
    app.replaceChildren(...frame.childNodes);app.scrollTop=0;showOpeningWarnings();showFriendComparison();
    document.querySelectorAll('.flow button').forEach(b=>b.classList.toggle('active',b.dataset.go===s.view || (b.dataset.go==='today'&&['cover','explore','quiz','guess','result','route','atlas','ranking'].includes(s.view))));
    app.querySelectorAll('img').forEach(el=>el.addEventListener('error',()=>{el.insertAdjacentHTML('afterend','<span class="error-image">照片未能载入</span>');},{once:true}));
    if(s.view==='explore') { const root=app.querySelector('.photo-viewport'),config=window.IMMERSIVE_SCENES?.[activePhoto().id];viewer=prepared?.viewer||(config&&window.ImmersivePhotoViewer?new ImmersivePhotoViewer(root,activePhoto(),config):new PhotoViewer(root,activePhoto()));viewer.ready?.then(()=>{if(viewer?.root===root)viewer.present?.();},()=>{}); }
    if(s.view==='quiz'){resumeQuizTimer();QuizScene.set(app.querySelector('.quiz-page'),city(),s.questions[s.q]);}
    if(s.view==='guess'&&!mapView)mountGuess();
    if(s.view==='result')resultReveal=ResultReveal.mount(app);
    if(s.view==='cover' && !s.rulesSeen&&!deferRules){s.rulesSeen=true;showRules();}
    if(s.view==='home'&&!s.promoSeen){s.promoSeen=true;HomePromo.show({phone:document.querySelector('#phone'),getTarget:()=>app.querySelector('.th-wonder .th-app-icon'),onAccept:()=>go('today')});}else if(s.view!=='home')HomePromo.dismiss();
    if(s.view==='cover')mountCover();else SceneMedia.retain([]);
  }
  function activateCity(id) {
    if(s.cityId!==id){
      pauseQuizTimer();
      cityProgress.set(s.cityId,{scene:s.scene,exploring:s.exploring,quizRemaining:s.quizRemaining,clues:new Set(s.clues),visited:new Set(s.visited),questions:[...s.questions],answers:[...s.answers],q:s.q,selected:s.selected,guess:s.guess,guessDone:s.guessDone});
      Object.assign(s,cityProgress.get(id)||{scene:0,exploring:false,quizRemaining:QUIZ_DURATION,clues:new Set(),visited:new Set([0]),questions:[],answers:[],q:0,selected:null,guess:null,guessDone:false});
    }
    s.cityId=id;s.result=s.daily[id]?.result||null;s.route=null;s.days=2;s.pace='舒适';s.theme='自动';s.date='';
  }
  function selectCity(id,{back=false}={}) {
    const destination=C.cities.find(c=>c.id===id);if(!destination)return;
    if(s.view==='result'){
      const view=s.daily[id]?.result?'result':'cover';
      const targetPhoto=view==='result'?ResultReveal.destination(destination).scene.photo:destination.scenes[0].photo;
      return ChallengeMotion.slide(ready=>{activateCity(id);s.view=view;render(ready.cloneNode());},{back,restoreScroll:false,prepare:()=>{
        resultReveal?.finishTransition();cancelPending();return SceneMedia.prepare(targetPhoto);
      }}).catch(error=>{if(error.name!=='AbortError')toast('目的地暂未载入，请重试');});
    }
    activateCity(id);return go(s.result?'result':'cover',{back});
  }
  function mountCover() {
    if(!current().result&&!navigator.connection?.saveData){const configs=city().scenes.map(scene=>window.IMMERSIVE_SCENES?.[scene.id]).filter(Boolean),first=window.IMMERSIVE_SCENES?.[city().scenes[s.scene]?.id];if(first)window.ImmersiveSceneMedia?.prefetchCover(city().id,configs,first);}
    const index=order.indexOf(s.cityId),adjacent=step=>C.cities.find(c=>c.id===order[(index+step+order.length)%order.length]);
    const neighbors=[adjacent(-1),adjacent(1)].filter(c=>c&&c.id!==s.cityId);
    const economical=navigator.connection?.saveData||/(^|-)2g$/.test(navigator.connection?.effectiveType||'');
    SceneMedia.retain([city(),...(economical?[]:neighbors)].map(c=>SceneMedia.source(c.scenes[0].photo,true).src));
    if(!economical&&!document.hidden)neighbors.forEach(c=>SceneMedia.prepare(c.scenes[0].photo,true).catch(()=>{}));
    coverCarousel=CoverCarousel.mount(app.querySelector('.cover-page'),{
      getDestination:step=>order.length>1?adjacent(step):null,
      prepare:c=>SceneMedia.prepare(c.scenes[0].photo),
      canInteract:()=>s.view==='cover'&&!modalRoot.firstElementChild&&!pendingCleanup&&!ChallengeMotion.busy,
      commit:(c,image)=>{activateCity(c.id);render(image);},
      onError:()=>toast('照片暂未载入，请再滑动一次')
    });
  }
  function go(view,{force=false,back=false}={}) {
    if(view==='today'){openToday();return;}
    if(['notice','community','events','trending','deals'].includes(view)){sheet('携程服务入口','<p>当前原型聚焦 TripWonder 目的地探索。</p>');return;}
    if(view==='quiz'&&!s.questions.length)view='cover';if(view==='guess'&&s.answers.length<3)view='cover';
    if(['atlas','ranking'].includes(view)&&view!==s.view)s.collectionBack=s.view==='home'?'home':s.view==='cover'?'cover':'today';
    if(view!=='quiz')pauseQuizTimer();if(view==='result')s.result=current().result||s.result;
    const previous=s.view,commit=()=>{if(view==='cover'||view==='explore')return loadView(view,view==='cover'?0:s.scene);s.view=view;render();};
    if((previous==='result'&&view==='route')||(previous==='route'&&view==='result')){
      if(previous==='result')resultRouteReturn={cityId:s.cityId,state:resultReveal?.snapshot()};
      const targetPhoto=view==='result'?ResultReveal.destination(city()).scene.photo:city().scenes.at(-1).photo;
      return ChallengeMotion.slide(ready=>{
        s.view=view;render(ready.cloneNode());
        if(view==='result'&&resultRouteReturn?.cityId===s.cityId)resultReveal?.restore(resultRouteReturn.state);
      },{force,back:previous==='route',restoreScroll:false,prepare:()=>{cancelPending();return SceneMedia.prepare(targetPhoto);}})
        .catch(error=>{if(error.name!=='AbortError')toast('页面暂未载入，请重试');});
    }
    if(previous==='home'&&view==='cover'){
      const destinationPhoto=city().scenes[0].photo;
      return ChallengeMotion.slide(ready=>{s.view='cover';render(ready,undefined,{deferRules:true});},{force,prepare:()=>{
        cancelPending();SceneMedia.retain([SceneMedia.source(destinationPhoto,true).src]);
        return SceneMedia.prepare(destinationPhoto);
      }}).then(shown=>{if(shown&&s.view==='cover'&&!s.rulesSeen){s.rulesSeen=true;showRules();}}).catch(error=>{if(error.name!=='AbortError')toast('场景暂未载入，请重试');});
    }
    if((previous==='home'&&['atlas','ranking'].includes(view))||(view==='home'&&['atlas','ranking','cover','result'].includes(previous)))return ChallengeMotion.slide(commit,{force,back:view==='home'});
    if(['quiz','guess'].includes(previous)||['quiz','guess'].includes(view)||(view==='result'&&previous!==view))return ChallengeMotion.run(commit,{force,back:back||view==='cover'});
    ChallengeMotion.cancel();return commit();
  }
  function sheet(title,content,kind='') { resultReveal?.finishTransition();closeModal();previousFocus=document.activeElement;modalRoot.innerHTML=`<div class="modal-overlay ${kind?`${kind}-overlay`:''}"><section class="sheet ${kind}" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"><div class="sheet-handle"></div><div class="sheet-heading"><h2>${esc(title)}</h2>${kind==='clue-dialog'?'':`<button class="icon-btn sheet-close" data-action="close" aria-label="关闭">${icon('close')}</button>`}</div>${content}</section></div>`;modalRoot.querySelector('.sheet').focus({preventScroll:true});if(kind==='clue-dialog'){app.inert=true;clueSheet=ClueSheet.mount(modalRoot.firstElementChild,closeModal);}else if(['quiz','guess','result'].includes(s.view))ChallengeMotion.dialogIn(modalRoot.firstElementChild); }
  function closeModal() { clueSheet?.destroy();clueSheet=null;rulesCleanup?.();rulesCleanup=null;activeShare=null;app.inert=false;document.querySelector('[data-action="rules"]')?.setAttribute('aria-expanded','false');window.speechSynthesis?.cancel?.();modalRoot.innerHTML='';if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null; }
  function showRules() {
    closeModal(); const anchor=app.querySelector('[data-action="rules"]');if(!anchor)return;
    previousFocus=anchor;anchor.setAttribute('aria-expanded','true');
    modalRoot.innerHTML=`<div class="rules-overlay"><section class="rules-popover" role="dialog" aria-modal="true" aria-labelledby="rules-title" tabindex="-1"><div class="rules-heading"><div><span class="rules-eyebrow">玩法说明</span><h2 id="rules-title">奇境挑战TripWonder</h2></div><button class="icon-btn" data-action="close" aria-label="关闭玩法">${icon('close')}</button></div><ol class="rules-steps"><li><span>探</span><p>在全景画面中自由移动和缩放画面，探索场景中的文化背景线索！</p></li><li><span>答</span><p>在2分钟内根据收集到的线索完成答题挑战！</p></li><li><span>猜</span><p>推测目的地地点，并在地图上标记位置。距离实际地点越近，得分越高！</p></li><li><span>奖</span><p>查看最终得分，点亮成就勋章！不仅可以一键规划目的地旅行路线，还能凭挑战排名领取丰厚优惠权益！</p></li></ol><button class="primary rules-cta" data-action="rules-start">开始探索</button></section></div>`;
    const panel=modalRoot.querySelector('.rules-popover'),phone=document.querySelector('#phone');
    const position=()=>{const a=anchor.getBoundingClientRect(),p=phone.getBoundingClientRect(),top=a.bottom-p.top-phone.clientTop+12,right=Math.max(12,phone.clientWidth-(a.right-p.left-phone.clientLeft));panel.style.top=top+'px';panel.style.right=right+'px';panel.style.maxHeight=Math.max(80,phone.clientHeight-top-16)+'px';};
    position();const observer=new ResizeObserver(position);observer.observe(phone);rulesCleanup=()=>observer.disconnect();app.inert=true;panel.focus({preventScroll:true});
  }
  function dismissModal(after) {
    if(clueSheet){clueSheet.dismiss();return;}
    const reward=modalRoot.querySelector('.reward-dialog-overlay');
    if(reward){
      if(reward.classList.contains('closing'))return;
      const finish=()=>{if(modalRoot.contains(reward)){closeModal();after?.();}};
      RewardMedal.dismiss(reward).then(finish,finish);return;
    }
    const overlay=modalRoot.querySelector('.rules-overlay');if(!overlay){const dialog=modalRoot.querySelector('.flow-dialog');if(dialog){ChallengeMotion.dialogOut(dialog,()=>{closeModal();after?.();});return;}closeModal();after?.();return;}if(overlay.classList.contains('closing'))return;overlay.classList.add('closing');const panel=overlay.querySelector('.rules-popover'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;panel.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-8px) scale(.94)'}],{duration:reduced?0:170,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'}).finished.then(()=>{if(modalRoot.contains(overlay)){closeModal();after?.();}}).catch(()=>{});
  }
  // The rules only explain the game; entering stays an explicit tap on the cover CTA.
  function cueStart() { const cta=app.querySelector('.cover-enter');if(cta)cta.focus({preventScroll:true}); }
  function start() {
    const resume=s.exploring;
    pauseQuizTimer();
    loadView('explore',resume?s.scene:0,()=>{if(!resume){s.scene=0;s.exploring=true;s.quizRemaining=QUIZ_DURATION;s.clues.clear();s.visited=new Set([0]);s.answers=[];s.questions=[];s.q=0;s.selected=null;}});
  }
  function pauseQuizTimer() {
    clearInterval(timer);timer=null;
    if(s.deadline)s.quizRemaining=Math.max(0,s.deadline-Date.now());
    s.deadline=0;
  }
  function resumeQuizTimer() {
    if(s.view!=='quiz'||s.deadline)return;
    clearInterval(timer);timer=null;
    s.deadline=Date.now()+s.quizRemaining;tick();
    if(s.view==='quiz'&&s.deadline)timer=setInterval(tick,250);
  }
  function tick() {
    if(s.view!=='quiz'||!s.deadline)return;
    const remain=Math.max(0,Math.ceil((s.deadline-Date.now())/1000)),el=app.querySelector('#timer');
    if(el){el.textContent=String(Math.floor(remain/60)).padStart(2,'0')+':'+String(remain%60).padStart(2,'0');el.parentElement.classList.toggle('urgent',remain<=30);}
    if(remain===0){finishQuiz(true);toast('答题时间到，已提交当前答案，未作答题目计 0 分');}
  }
  function beginQuiz() {
    pauseQuizTimer();s.exploring=false;
    const resume=s.questions.length===3&&s.answers.length<3;
    if(!resume){s.quizRemaining=QUIZ_DURATION;s.questions=city().questions.slice(0,3).map((q,i)=>({...q,points:QUIZ_POINTS[i]}));s.q=0;s.selected=null;s.answers=[];}
    go('quiz');
  }
  function finishQuiz(timedOut=false) {
    pauseQuizTimer();
    if(timedOut){
      s.quizRemaining=0;
      while(s.answers.length<s.questions.length){const i=s.answers.length,q=s.questions[i],selected=i===s.q?s.selected:null;s.answers.push({...q,selected,correct:selected!==null&&q.answer===selected});}
    }
    s.guess=null;s.guessDone=false;go('guess',{force:timedOut});
  }
  function clue(index) { const h=city().scenes[s.scene].hotspots[index];if(!h)return;s.clues.add(`${s.scene}-${index}`);app.querySelector(`[data-clue="${index}"]`)?.classList.add('read');const source=h.source?.startsWith('http')?`<a href="${esc(h.source)}" target="_blank" rel="noopener noreferrer">资料出处 ↗</a>`:'';sheet(h.title,`<p id="clue-text">${esc(h.text)}</p><div class="clue-footer"><button data-action="speak">朗读</button>${source}</div>`,'clue-dialog'); }
  function answerSource(answer) { if(answer.source?.startsWith('http'))return answer.source;const match=answer.source?.match(/第\s*(\d+)\s*处\s*·\s*(.+)/);if(!match)return null;return city().scenes[Number(match[1])-1]?.hotspots.find(h=>h.title===match[2])?.source||null; }
  function finish() { const counts={};for(const key of s.clues){const [i,j]=key.split('-').map(Number),tag=city().scenes[i].hotspots[j]?.tag;if(tag)counts[tag]=(counts[tag]||0)+1;}const tags=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]).slice(0,2);const quiz=s.answers.reduce((n,a)=>n+(a.correct?a.points:0),0),r={score:quiz+(s.guess?.points||0),quiz,guess:s.guess?{...s.guess}:null,correct:s.answers.filter(a=>a.correct).length,answers:s.answers,clues:s.clues.size,tags:tags.length?tags:['旅行发现'],date:day};s.result=r;const previous=current().result;s.daily[s.cityId]={...current(),result:!previous||r.score>previous.score?r:previous,skipped:false}; }
  function inviteUrl() { const r=s.result||current().result,token=btoa(JSON.stringify({cityId:s.cityId,score:r.score,day})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=new URL('index.html',window.TRIPWONDER_PUBLIC_ORIGIN||location.href);url.searchParams.set('challenge',token);return url.href; }
  function share() {
    const r=s.result||current().result,c=city(),url=inviteUrl();
    const representative={datong:['yungang','xMidYMax'],shenzhen:['sz-futian','xMidYMid'],suzhou:['suzhou-huqiu','xMidYMin'],guilin:['gl-xingping','xMidYMid'],hongkong:['hk-peak','xMidYMid'],beijing:['bj-zhengyangmen','xMidYMid'],shanghai:['sh-lujiazui','xMidYMid']}[c.id];
    const scene=c.scenes.find(item=>item.id===representative?.[0])||c.scenes[0];
    const session={r,c,url,scene,align:representative?.[1]||'xMidYMid',art:SceneMedia.source(scene.photo,true).src,file:null};
    sheet('分享挑战',`<div class="share-sheet">
      <figure class="share-preview" data-scene="${esc(scene.id)}">${sharePoster(session,session.art)}</figure>
      <div class="share-actions">${ShareOptions.markup()}<input hidden class="invite-link" id="invite-link" readonly value="${esc(url)}" aria-label="好友挑战链接"></div>
    </div>`,'share-dialog');
    activeShare=session;app.inert=true;
    // Prepare the same card for native image sharing before the user's next tap.
    session.preparing=shareImage(session).then(file=>{session.file=file;return file;}).catch(()=>null);
  }
  function sharePoster({r,c,align},art) {
    const suffix=48+String(r.score).length*61;
    return `<svg class="share-poster" xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900" role="img" aria-label="奇境挑战分享卡，${r.score} 分，${c.scenes.length} 处实景">
      <defs><clipPath id="share-corners"><rect width="720" height="900" rx="36"/></clipPath><linearGradient id="share-photo-shade" x2="0" y2="1"><stop stop-color="#10253b" stop-opacity=".48"/><stop offset=".3" stop-color="#10253b" stop-opacity="0"/><stop offset=".58" stop-color="#10253b" stop-opacity=".04"/><stop offset="1" stop-color="#10253b" stop-opacity=".9"/></linearGradient></defs>
      <g clip-path="url(#share-corners)" font-family="'Segoe UI','Microsoft YaHei',sans-serif">
        <rect width="720" height="900" fill="#fff"/>
        <image class="share-landscape" href="${esc(art)}" width="720" height="590" preserveAspectRatio="${align} slice"/>
        <path fill="url(#share-photo-shade)" d="M0 0h720v590H0z"/>
        <text x="42" y="72" fill="#fff" font-size="38" font-weight="800" letter-spacing="-1.5">Trip<tspan fill="#ffc340">.</tspan>com</text>
        <text x="676" y="55" text-anchor="end" fill="#fff" font-size="17" letter-spacing="3">TRIPWONDER</text><text x="676" y="85" text-anchor="end" fill="#fff" fill-opacity=".85" font-size="19" letter-spacing="3">奇境挑战</text>
        <path d="M44 455h34" stroke="#ffc340" stroke-width="5" stroke-linecap="round"/>
        <text x="42" y="514" fill="#fff" font-size="43" font-weight="700">猜猜，这是哪座城？</text>
        <text x="44" y="557" fill="#fff" fill-opacity=".86" font-size="22">我已抵达这片风景，现在轮到你。</text>
        <text x="44" y="639" fill="#748096" font-size="21" letter-spacing="1">我的挑战成绩</text>
        <text x="40" y="750" fill="#2855f7" font-size="112" font-weight="750" letter-spacing="-4">${r.score}</text><text x="${suffix}" y="746" fill="#8b96a9" font-size="28">/ 100</text>
        <text x="676" y="686" text-anchor="end" fill="#233451" font-size="28" font-weight="650">等你来超越</text>
        <circle cx="650" cy="730" r="23" fill="#edf2ff"/><path d="M638 730h24m-9-9 9 9-9 9" fill="none" stroke="#3264ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M44 786h632" stroke="#e8edf5"/>
        <g text-anchor="middle" fill="#233451" font-size="28" font-weight="650"><text x="147" y="831">${r.guess?.points??0}<tspan fill="#9aa5b6" font-size="20" font-weight="400"> / 40</tspan></text><text x="360" y="831">${r.quiz??r.score}<tspan fill="#9aa5b6" font-size="20" font-weight="400"> / 60</tspan></text><text x="573" y="831">${c.scenes.length}<tspan font-size="20" font-weight="400"> 处</tspan></text></g>
        <g text-anchor="middle" fill="#8290a5" font-size="20"><text x="147" y="866">地图定位</text><text x="360" y="866">线索答题</text><text x="573" y="866">探索实景</text></g>
      </g></svg>`;
  }
  async function shareImage(session) {
    const source=await SceneMedia.prepare(session.scene.photo),canvas=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(source.naturalWidth,source.naturalHeight));
    canvas.width=Math.round(source.naturalWidth*scale);canvas.height=Math.round(source.naturalHeight*scale);canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);
    const svg=sharePoster(session,canvas.toDataURL('image/jpeg',.94)),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
    try { const image=new Image();image.src=url;await image.decode();canvas.width=1080;canvas.height=1350;canvas.getContext('2d').drawImage(image,0,0,1080,1350);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Card unavailable');return new File([blob],`TripWonder-${day}.png`,{type:'image/png'}); }
    finally { URL.revokeObjectURL(url); }
  }
  async function copyChallengeLink(session) {
    if(activeShare!==session)return false;
    let copied=false;
    try { await navigator.clipboard.writeText(session.url);copied=true; } catch {}
    if(activeShare!==session)return false;
    if(!copied){const field=document.createElement('textarea');field.value=session.url;field.style.cssText='position:fixed;left:-9999px;top:0';modalRoot.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();}
    if(activeShare!==session)return false;
    if(copied)toast('挑战链接已复制，发给好友一起玩');
    else {const field=modalRoot.querySelector('#invite-link');field.hidden=false;field.focus();field.select();toast('请复制下方挑战链接');}
    return copied;
  }
  async function saveChallengeImage(button,session) {
    button.disabled=true;button.setAttribute('aria-busy','true');
    try {
      const file=session.file||await session.preparing||await shareImage(session);
      if(activeShare!==session)return;
      session.file=file;
      const url=URL.createObjectURL(file),link=document.createElement('a');
      link.href=url;link.download=file.name;modalRoot.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),2000);toast('已发起挑战卡图片下载');
    } catch {if(activeShare===session)toast('图片暂时无法保存，请稍后重试');}
    finally {button.disabled=false;button.removeAttribute('aria-busy');}
  }
  async function chooseShareOption(button) {
    const session=activeShare;if(!session||button.disabled)return;
    const channel=button.dataset.shareChannel;
    if(channel==='save'){await saveChallengeImage(button,session);return;}
    if(channel==='more'){await sendChallenge(button);return;}
    button.disabled=true;
    try {await ShareOptions.activate(channel,{title:'TripWonder 奇境挑战',text:`我在 TripWonder 拿到了 ${session.r.score} 分，猜猜这是哪座城？`,url:session.url,file:session.file,copy:()=>copyChallengeLink(session),toast});}
    catch {if(activeShare===session)toast('暂时无法打开分享，请试试复制链接');}
    finally {button.disabled=false;}
  }
  async function sendChallenge(button) {
    const session=activeShare;if(!session||button.disabled)return;
    button.disabled=true;
    try {
      if(navigator.share){const data={title:'TripWonder 奇境挑战',text:`我在 TripWonder 拿到了 ${session.r.score} 分，猜猜这是哪座城？`,url:session.url};if(session.file&&navigator.canShare?.({files:[session.file]}))data.files=[session.file];try{await navigator.share(data);return;}catch(error){if(error.name==='AbortError')return;}}
      await copyChallengeLink(session);
    } finally {if(activeShare===session){button.disabled=false;if(!modalRoot.contains(document.activeElement))button.focus({preventScroll:true});}}
  }

  // Fireworks over the whole phone for a moment of reward. Canvas, pointer-transparent, removes itself.
  function celebrate(origin) {
    const host=document.querySelector('#phone')||document.body,box=host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    host.querySelector('.celebrate-canvas')?.remove();
    const canvas=document.createElement('canvas');canvas.className='celebrate-canvas';canvas.setAttribute('aria-hidden','true');
    canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);host.append(canvas);
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    const W=box.width,H=box.height,colors=['#ffd166','#ff8a5b','#3264ff','#7dd3fc','#f472b6','#ffe7a3'],parts=[],rockets=[];
    const burst=(x,y,n,speed,palette)=>{for(let i=0;i<n;i++){const a=Math.PI*2*i/n+Math.random()*.25,v=speed*(.45+Math.random()*.7);parts.push({x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,decay:.009+Math.random()*.01,color:palette[i%palette.length],size:2.4+Math.random()*2.2,spark:Math.random()<.35});}};
    const o=origin?.getBoundingClientRect?.();
    if(o){const ox=o.left-box.left+o.width/2,oy=o.top-box.top+o.height/2;burst(ox,oy,48,5.5,colors);setTimeout(()=>burst(ox,oy,36,3.6,['#ffd166','#fff1c1','#ff8a5b']),140);}
    [[.26,.3,0],[.74,.24,180],[.5,.18,360],[.18,.42,560],[.82,.38,700],[.4,.28,900],[.62,.34,1080]].forEach(([fx,fy,delay])=>setTimeout(()=>{if(canvas.isConnected)rockets.push({x:W*fx+(Math.random()-.5)*30,y:H*.96,ty:H*fy,vy:-(H*.96-H*fy)/38,color:colors[Math.floor(Math.random()*colors.length)]});},delay));
    const start=performance.now();
    const step=now=>{
      if(!canvas.isConnected)return;
      ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation='source-over';
      for(let i=rockets.length-1;i>=0;i--){const k=rockets[i];k.y+=k.vy;k.vy*=.985;ctx.fillStyle=k.color;ctx.shadowColor=k.color;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(k.x,k.y,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        if(k.y<=k.ty){rockets.splice(i,1);burst(k.x,k.y,96,6.4,[k.color,'#fff4d6',colors[(colors.indexOf(k.color)+2)%colors.length]]);}}
      for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.px=q.x;q.py=q.y;q.vx*=.972;q.vy=q.vy*.972+.075;q.x+=q.vx;q.y+=q.vy;q.life-=q.decay;
        if(q.life<=0){parts.splice(i,1);continue;}
        ctx.globalAlpha=Math.max(0,q.life)*(q.spark&&Math.random()<.35?.35:1);ctx.strokeStyle=q.color;ctx.lineWidth=q.size*(.6+.4*q.life);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q.px,q.py);ctx.lineTo(q.x,q.y);ctx.stroke();}
      ctx.globalAlpha=1;
      if(now-start<900||parts.length||rockets.length)requestAnimationFrame(step);else canvas.remove();
    };
    requestAnimationFrame(step);
  }

  function product(name) { const earned=s.benefits[s.cityId],active=benefitStatus(s.cityId)==='active';sheet(name,`<p>已带入目的地：${esc(city().name)}。此入口展示旅行产品承接方式，暂未接入实时库存、报价或下单。</p>${active?`<div class="clue-quote">已领取：${esc(earned.detail)}<br>${esc(earned.threshold)} · 有效至 ${esc(earned.expires)} · 仅适用于${esc(city().name)}相关产品。示例权益，无真实券码。</div>`:''}<a class="primary" href="https://www.ctrip.com/" target="_blank" rel="noopener noreferrer">打开携程官网</a>`); }
  // Mouse drag for the coupon row; touch and trackpads scroll it natively.
  app.addEventListener('pointerdown',event=>{const row=event.target.closest('.coupon-tickets');if(!row||event.pointerType!=='mouse'||event.button)return;const x=event.clientX,left=row.scrollLeft;row.classList.add('dragging');const move=e=>{row.scrollLeft=left-(e.clientX-x);},up=()=>{row.classList.remove('dragging');removeEventListener('pointermove',move);removeEventListener('pointerup',up);};addEventListener('pointermove',move);addEventListener('pointerup',up);});
  document.addEventListener('pointerdown',event=>{const button=event.target.closest('button');if(!button)return;if(['quiz','guess','result'].includes(s.view)||(s.view==='explore'&&button.dataset.action==='next-scene'&&s.scene===city().scenes.length-1))ChallengeMotion.press(button);},{passive:true});
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||b.disabled)return;if(ChallengeMotion.busy){event.preventDefault();return;}if(event.detail===0&&['quiz','guess','result'].includes(s.view))ChallengeMotion.press(b);
    if(b.dataset.shareChannel){chooseShareOption(b);return;}
    if(b.dataset.city){selectCity(b.dataset.city);return;} if(b.dataset.go){go(b.dataset.go);return;}
    if(b.dataset.service){product(b.dataset.service);return;}if(b.dataset.product){product(b.dataset.product);return;}
    if(b.dataset.clue!==undefined){clue(Number(b.dataset.clue));return;}
    if(b.dataset.recall!==undefined){recall(Number(b.dataset.recall));return;}
    if(b.dataset.option!==undefined){selectAnswer(Number(b.dataset.option));return;}
    if(b.dataset.days){s.days=Number(b.dataset.days);makeRoute();render();return;}
    if(b.dataset.rank){s.rank=b.dataset.rank;render();return;}
    if(b.dataset.review!==undefined){const a=(s.result||current().result).answers[Number(b.dataset.review)],url=answerSource(a),source=url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">资料出处 ↗</a>`:esc(a.source);sheet(`第 ${Number(b.dataset.review)+1} 题`, `<p><b>${esc(a.q)}</b></p><p>你的答案：${a.selected===null?'未作答':esc(a.options[a.selected])}<br>正确答案：${esc(a.options[a.answer])}</p><div class="clue-quote">${esc(a.explain)}<br>${source}</div>`);return;}
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
    else if(action==='prev-city'){const prev=previousDestination(s.cityId);if(prev)selectCity(prev,{back:true});}
    else if(action==='next-city'){const next=nextDestination(s.cityId,true);if(next)selectCity(next);else go('home');}
    else if(action==='quiz-back'&&s.view==='quiz'){if(s.deadline<=Date.now()){tick();return;}s.exploring=true;go('explore',{back:true});}
    else if(action==='leave')go('cover');
    else if(action==='prev-scene'){if(s.scene>0){const prev=s.scene-1;loadView('explore',prev,()=>{s.scene=prev;});}}
    else if(action==='fav'){const on=!s.bookmarks[s.cityId];s.bookmarks[s.cityId]=on;b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'取消收藏':'收藏这个目的地');if(on)playFavoriteSound();}
    else if(action==='next-scene'){if(s.scene<city().scenes.length-1){const next=s.scene+1;loadView('explore',next,()=>{s.scene=next;s.visited.add(next);});}else beginQuiz();}
    else if(action==='speak'){if(!('speechSynthesis' in window)){toast('当前浏览器不支持朗读');return;}const u=new SpeechSynthesisUtterance(modalRoot.querySelector('#clue-text').textContent);u.lang='zh-CN';u.rate=.92;u.onerror=()=>toast('朗读暂不可用');speechSynthesis.cancel();speechSynthesis.speak(u);}
    else if(action==='submit')submitAnswer();
    else if(action==='guess-submit')submitGuess();
    else if(action==='guess-back'){if(s.guessDone){go('home');return;}if(!s.guessDone&&s.quizRemaining>0&&s.answers.length===3){const last=s.answers.pop();s.q=2;s.selected=last.selected;go('quiz',{back:true});}}
    else if(action==='zoom-in')mapView?.zoomBy(1.7);
    else if(action==='zoom-out')mapView?.zoomBy(1/1.7);
    else if(action==='bookmark'){s.bookmarks[s.cityId]=!s.bookmarks[s.cityId];const y=app.scrollTop;render();app.scrollTop=y;resultReveal?.refresh();}
    else if(action==='claim'&&current().result){
      const score=(s.result||current().result).score;
      s.badges[s.cityId]??={date:today()};
      // Keep the expanded result panel and its native scroll state intact.
      b.textContent='查看徽章';
      sheet(`奇境挑战徽章 · ${city().name}`,RewardMedal.markup({city:city(),score,percentile:estimateRewardPercentile(score)}),'reward-dialog');
      app.inert=true;previousFocus=b;
    }
    else if(action==='claim-coupon'&&current().result){
      const benefit=benefitFor();
      if(benefitStatus(s.cityId)!=='active')s.benefits[s.cityId]={...benefit,date:today(),expires:datePlusDays(benefit.validDays)};
      const earned=s.benefits[s.cityId];
      b.textContent='查看权益';
      sheet(benefit.name,benefitDialog(benefit,earned),'coupon-dialog');
      app.inert=true;previousFocus=b;
    }
    else if(action==='share')share();else if(action==='share-challenge')sendChallenge(b);
    else if(action==='save-trip'){s.itineraries[s.cityId]={city:city().name,days:s.days,pace:s.pace,theme:s.theme,date:s.date,route:s.route.map(d=>[...d])};sheet('路线已保存',`<p>${esc(city().name)} ${s.days} 日路线已保存在本次体验中，刷新页面后会重新开始。</p><button class="primary" data-go="itinerary">查看我的行程</button>`);}
    else if(action==='search')go('today');
    else if(action==='home-chip'){const input=app.querySelector('.th-search input');if(input){input.value=b.textContent;input.focus();}}
    else if(action==='home-ai')app.querySelector('.th-search input')?.focus();
    else if(action==='home-search')toast('搜索暂未接入，当前原型仅演示输入');
    else if(action==='home-coupon')sheet('旅行好礼','<p>首页优惠为携程界面示例。完成 TripWonder 挑战可领取原型示例权益。</p><button class="primary" data-go="today">去探索</button>');
  });
  document.addEventListener('change',event=>{const el=event.target;if(el.id==='route-pace'){s.pace=el.value;makeRoute();render();}else if(el.id==='route-theme'){s.theme=el.value;makeRoute();render();}else if(el.id==='route-date'){s.date=el.value;s.route=reorderDaysForOpenings(s.route);render();}});
  document.addEventListener('submit',event=>{if(!event.target.matches('.th-search'))return;event.preventDefault();const q=event.target.q.value.trim();q?toast(`搜索「${q}」暂未接入，当前原型仅演示输入`):event.target.q.focus();});
  document.addEventListener('keydown',event=>{if(!modalRoot.innerHTML)return;if(event.key==='Escape')dismissModal();if(event.key==='Tab'){const f=[...modalRoot.querySelectorAll('button:not(:disabled),a[href],input:not([hidden]):not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');if(!f.length)return;if(event.shiftKey&&(document.activeElement===f[0]||document.activeElement===modalRoot.querySelector('[role="dialog"]'))){event.preventDefault();f.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===f.at(-1)){event.preventDefault();f[0].focus();}}});
  modalRoot.addEventListener('click',event=>{if(event.target.classList.contains('modal-overlay')||event.target.classList.contains('rules-overlay'))dismissModal();});
  window.addEventListener('pagehide',()=>{cancelPending();SceneMedia.retain([]);viewer?.destroy();window.ImmersiveSceneMedia?.clear();resultReveal?.destroy();window.speechSynthesis?.cancel?.();});
  // Capacitor uses the same page navigation and modal dismissal as the website.
  if(window.Capacitor?.isNativePlatform?.())window.TripWonderNativeHooks={
    isReady:()=>!!app.firstElementChild,
    toast,
    back:()=>{
      if(document.querySelector('.hp-layer')){HomePromo.dismiss();return true;}
      if(modalRoot.firstElementChild){dismissModal();return true;}
      if(pendingCleanup||ChallengeMotion.busy){cancelPending();ChallengeMotion.cancel();return true;}
      if(s.view==='home')return false;
      const action=s.view==='quiz'?'quiz-back':s.view==='guess'?'guess-back':null;
      if(action){app.querySelector(`[data-action="${action}"]`)?.click();return true;}
      if(s.view==='explore')go('cover',{back:true});
      else if(s.view==='route')go('result',{back:true});
      else go('home',{back:true});
      return true;
    }
  };
  if(invitation)loadView('cover',0);else render();
})();
