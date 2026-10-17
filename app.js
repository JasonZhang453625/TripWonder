(async () => {
  'use strict';
  await window.UGCService?.ready;
  const C = window.TRIPWONDER_CATALOG;
  window.Community?.initializeSamples();
  // Language: tr('中文','English') for UI copy, f() for data fields, term()/place() for data vocabularies.
  const {t:tr, f, term, place} = I18N, en = () => I18N.isEn();
  const cname = item => f(item,'name');
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
    sound:'M4 9h4l5-4v14l-5-4H4V9Zm12.5-.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
    soundOff:'M4 9h4l5-4v14l-5-4H4V9Zm12 1 5 5m0-5-5 5',
    trend:'M4 3h16v18H4V3Zm3 12 4-4 3 2 4-6m-4 0h4v4', message:'M3 4h18v14H8l-5 3V4Zm3 3 6 5 6-5',
    people:'M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM2 21v-6a6 6 0 0 1 12 0v6M17 4a3 3 0 0 1 0 6m0 3a5 5 0 0 1 5 5v3',
    bag:'M4 7h16v14H4V7Zm4 0V3h8v4M8 11v5m8-5v5', user:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21a8 8 0 0 1 16 0',
    check:'m5 12 4 4L19 6', heart:'M12 21 3 12C-3 5 7-2 12 6c5-8 15-1 9 6l-9 9Z',
    share:'M12 16V2m-5 5 5-5 5 5M5 12H3v10h18V12h-2', book:'M12 5Q6 1 2 4v16q5-3 10 0 5-3 10 0V4q-4-3-10 1Zm0 0v15',
    ticket:'M2 6h20v4a2 2 0 0 0 0 4v4H2v-4a2 2 0 0 0 0-4V6Zm13 0v3m0 3v2m0 2v2'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
  window.TWIcon = icon;
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
  // Cities the player has already challenged (kept on this device) are never drawn again while unplayed ones remain; they
  // live in the atlas under "已挑战". If fewer than five unplayed cities are left, the draw is padded with challenged ones.
  const challenged = window.TWStore?.get().challenged || {};
  const libraryOrder = [...shuffle(C.cities.map(c => c.id).filter(id => !challenged[id]), day), ...shuffle(C.cities.map(c => c.id).filter(id => challenged[id]), day)];
  const order = libraryOrder.slice(0,5);
  const daily = {}, benefits = {};
  let invitation=null;
  let unavailableInvitation=false;
  try { const raw=new URL(location.href).searchParams.get('challenge');if(raw){const token=raw.replace(/-/g,'+').replace(/_/g,'/'),candidate=JSON.parse(atob(token));if(Number.isInteger(candidate.score)&&candidate.score>=0&&candidate.score<=100){if(libraryOrder.includes(candidate.cityId)||C.ugc?.some(j=>j.id===candidate.cityId))invitation=candidate;else unavailableInvitation=true;}} } catch { unavailableInvitation=true; }
  const ugcInvitation=invitation&&C.ugc?.some(j=>j.id===invitation.cityId);
  // A shared destination must stay playable even when it is outside today's draw.
  if(invitation&&!ugcInvitation&&!order.includes(invitation.cityId))order[order.length-1]=invitation.cityId;
  // Earlier results of challenged cities that are not part of today's draw feed the atlas and the mall.
  for(const [id,record] of Object.entries(challenged))if(record?.result&&!order.includes(id)&&C.cities.some(c=>c.id===id))daily[id]={result:record.result,skipped:false};
  // One clock covers looking at the scenes and answering: it starts on entering the first scene and keeps running
  // until the last answer (or time-out), also while the player is back on the cover. A journey may set rules.challengeSeconds.
  const QUIZ_DURATION = 60 * 1000;
  // Admin-generated journeys store the same clock as rules.quizSeconds.
  const quizMs = () => (city().rules?.challengeSeconds ?? city().rules?.quizSeconds ?? QUIZ_DURATION / 1000) * 1000;
  const quizPoints = c => c?.rules?.points || [20,20,20];
  const quizTotal = c => quizPoints(c).reduce((sum,p)=>sum+p,0);
  const mmss = ms => { const sec=Math.max(0,Math.ceil(ms/1000)); return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0'); };
  const s = {
    view:invitation?'cover':'home', cityId: invitation?.cityId || order.find(id => !daily[id]?.result && !daily[id]?.skipped) || order[0],
    scene:0, exploring:false, deadline:0, quizRemaining:QUIZ_DURATION, clues:new Set(), visited:new Set([0]), questions:[], answers:[], q:0, selected:null,
    result:null, days:2, pace:'舒适', theme:'自动', date:'', route:null, rank:'今日', collectionBack:'today', itineraryBack:'home',
    daily, benefits, badges:Object.fromEntries(Object.entries(challenged).filter(([,record])=>record?.badge).map(([id,record])=>[id,record.badge])), invitation, itineraries:{}, bookmarks:{}, rulesSeen:false, pk:null, mallBack:'home',
    // Entry split: challenge = today's official draw (rewards, no notes); browse = a community visit to a journey
    // (clues and notes, no quiz); ugc = a player journey's game (no rewards of any kind).
    mode:ugcInvitation?'ugc':'challenge', ugcResults:{}, journeyId:null, journeyBack:'feed', journeyReturn:null, feedTab:'all', boardFilter:'all', composeScene:null
  };
  // Gameplay layer (tw-store.js): coins, simulated PK and scene notes, each switchable for the live demo.
  const feature = name => !!window.TW_FEATURES?.[name] && !!window.TWStore && !!{wallet:window.Wallet,pk:window.PKMode,bubbles:window.SceneBubbles}[name];
  let bubbles=null, pkMatching=false, hubCards=null, hubWarm=null, hubWarmTask=null;
  let timer, viewer, mapView, resultReveal, coverCarousel, clueSheet, toastTimer, transition=0, pendingCleanup, rulesCleanup, previousFocus, activeShare, resultRouteReturn;
  let feedResultReturn=null,ugcBack='feed';
  const cityProgress = new Map();
  const journeyById = id => C.cities.find(c => c.id === id) || C.ugc?.find(c => c.id === id);
  const city = () => journeyById(s.cityId) || C.cities[0];
  const current = () => s.mode==='ugc' ? s.ugcResults[s.cityId] || {} : s.mode==='browse' ? {} : s.daily[s.cityId] || {};
  const gameMode = () => s.mode!=='browse';
  // Location guess scoring: full marks for a pin in the destination's own city (prefecture level; municipalities
  // and SARs as a whole), otherwise full inside fullKm, then exponential decay. A city may override via city.guess.
  const GUESS = {max:40, fullKm:25, decayKm:450};
  const guessRule = () => ({...GUESS, ...city().guess});
  function guessScore(km,sameCity=false) { const c=guessRule(); return sameCity||km<=c.fullKm?c.max:Math.round(c.max*Math.exp(-(km-c.fullKm)/c.decayKm)); }
  const guessVerdict = ({km,sameCity}) => sameCity?tr('同城命中','Right city!'):km<=guessRule().fullKm?tr('精准命中','Bullseye'):km<=100?tr('近在咫尺','So close'):km<=300?tr('八九不离十','Nearly there'):km<=800?tr('方向对了','Right direction'):tr('下次再近一点','Closer next time');
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
  function head(title,back='today',right='') { return `<header class="page-head"><button class="icon-btn" data-go="${back}" aria-label="${tr('返回','Back')}">${icon('back')}</button><strong>${esc(title)}</strong>${right || '<span style="width:36px"></span>'}</header>`; }
  // TripWonder banner art: a destination coupon slipping out of an envelope over Paris and Santorini.
  const homeWonderArt = () => `<svg class="th-tw-art" viewBox="0 0 200 126" aria-hidden="true"><defs><linearGradient id="th-tw-env" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6aa8ff"/><stop offset="1" stop-color="#2d5ff0"/></linearGradient><linearGradient id="th-tw-tk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffbe2e"/></linearGradient></defs><path fill="#2c56d8" fill-opacity=".55" d="M18 30l1 11 1 13 1.4 13H23v3h-1l2.5 14H27v3h-1.6L34 126h-8q-9-20-18 0H0l8.6-39H7v-3h3.3l2.5-14H12v-3h2.4L16 54l1-13z"/><g fill="#fff" opacity=".85"><ellipse cx="70" cy="20" rx="18" ry="4.5"/><ellipse cx="80" cy="16" rx="9" ry="5.5"/><ellipse cx="150" cy="56" rx="14" ry="3.5"/></g><path d="M58 34c26 6 48-2 64-18" fill="none" stroke="#fff" stroke-width="1.3" stroke-dasharray="3 3.5" stroke-linecap="round" opacity=".8"/><g transform="translate(122 4) rotate(58 12 12)"><path fill="#fff" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></g><path fill="url(#th-tw-env)" d="M44 92 96 66l52 26v34H44z" opacity=".95"/><g transform="rotate(-14 96 62)"><rect x="46" y="38" width="100" height="50" rx="7" fill="url(#th-tw-tk)"/><circle cx="122" cy="38" r="5" fill="#ffd660"/><circle cx="122" cy="88" r="5" fill="#ffd660"/><path d="M122 45v36" stroke="#e59a12" stroke-width="1.4" stroke-dasharray="3 3"/><rect x="53" y="45" width="63" height="36" rx="4" fill="none" stroke="#f0a824" stroke-width="1.4"/>${en()?'<text x="84.5" y="60" text-anchor="middle" font-size="9.5" font-weight="900" fill="#c2410c" font-family="Roboto,Segoe UI,sans-serif" letter-spacing=".3">DESTINATION</text><text x="84.5" y="74" text-anchor="middle" font-size="13" font-weight="900" fill="#c2410c" font-family="Roboto,Segoe UI,sans-serif" letter-spacing=".6">COUPON</text>':'<text x="84.5" y="60" text-anchor="middle" font-size="11" font-weight="900" fill="#c2410c" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" letter-spacing="1">目的地</text><text x="84.5" y="75" text-anchor="middle" font-size="13.5" font-weight="900" fill="#c2410c" font-family="\'PingFang SC\',\'Microsoft YaHei\',sans-serif" letter-spacing="1.5">优惠券</text>'}<g transform="translate(125.5 51) scale(.8)"><path fill="#f08a1c" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 11.5 12)"/></g></g><path fill="url(#th-tw-env)" d="M44 92l52 26 52-26v34H44z"/><path d="M45 93l51 25.5L147 93" fill="none" stroke="#d6ebff" stroke-width="1.8" stroke-linejoin="round"/><text x="120" y="119" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" fill-opacity=".85" font-family="Roboto,Segoe UI,sans-serif" transform="rotate(-8 120 119)">Trip.com</text><g transform="translate(38 74)"><path fill="#ffc83d" d="M8 19.5s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z"/><circle cx="8" cy="7.5" r="2.8" fill="#fff4c7"/></g><g transform="translate(150 56)"><path fill="#ff4d4d" d="M9 23s9-8.4 9-14.4a9 9 0 0 0-18 0C0 14.6 9 23 9 23Z"/><circle cx="9" cy="8.8" r="3.4" fill="#ffe1dc"/></g><path fill="#eaf4ff" d="M150 126c10-16 26-22 50-24v24z"/><g fill="#fff"><rect x="160" y="104" width="11" height="14" rx="1"/><rect x="173" y="98" width="13" height="20" rx="1"/><rect x="188" y="92" width="12" height="26" rx="1"/></g><g fill="#2f6bff"><path d="M161 104a4.5 4.5 0 0 1 9 0z"/><path d="M189 92a5.5 5.5 0 0 1 11 0z"/><rect x="194" y="82" width="1" height="5"/><rect x="192.5" y="83.5" width="4" height="1"/></g><g fill="#8dbbff"><rect x="176" y="104" width="2.4" height="4" rx="1.2"/><rect x="181" y="104" width="2.4" height="4" rx="1.2"/><rect x="164" y="109" width="2.4" height="4" rx="1.2"/><rect x="192.5" y="100" width="2.4" height="4" rx="1.2"/></g><path fill="#fff" d="m34 58 1.6 4.4L40 64l-4.4 1.6L34 70l-1.6-4.4L28 64l4.4-1.6zM112 22l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1zM146 80l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" opacity=".95"/><text transform="rotate(-10 172 20)" font-size="9.5" font-style="italic" font-weight="700" fill="#fff" text-anchor="middle" font-family="'Segoe Script','Brush Script MT','Snell Roundhand',cursive"><tspan x="172" y="13">Explore</tspan><tspan x="172" dy="10">More</tspan><tspan x="172" dy="10">Together</tspan></text></svg>`;
  function homeNav() { return `<nav class="bottom-nav th-nav" aria-label="${tr('携程导航','Trip.com navigation')}">${[['home',tr('首页','Home'),'home'],['messages',tr('消息','Messages'),'notice'],['community',tr('社区','Community'),'ranking'],['trips',tr('我的行程','My Trips'),'atlas'],['account',tr('我的','Account'),'profile']].map(([i,label,v])=>`<button class="${v==='home'?'active':''}" data-go="${v}"><img src="assets/home/nav-${i}.png" alt="">${label}</button>`).join('')}</nav>`; }
  // Trip.com's English home puts a blue dot after each main service; the Chinese labels go without.
  function home() { const h='assets/home/',arrow='<svg viewBox="0 0 8 14" aria-hidden="true"><path d="m1.5 1.5 5 5.5-5 5.5"/></svg>';
    const main=[['hotels',tr('酒店','Hotels')],['flights',tr('机票','Flights')],['flight-hotel',tr('机票+酒店','Flight + Hotel')],['trains',tr('火车票','Trains')]].map(([i,label])=>`<button class="th-main-item" data-service="${esc(label)}"><img src="${h}svc-${i}.png" alt=""><span>${esc(label)}${en()?'<i>.</i>':''}</span></button>`).join('');
    const sub=[['vacation',tr('民宿','Vacation Rentals')],['attractions',tr('门票·玩乐','Attractions & Tours')],['car',tr('租车','Car Rentals')],['package',tr('跟团游','Package Tours')],['more',tr('更多 +7','+7 more')]].map(([i,label])=>`<button class="th-sub-item" data-service="${esc(label)}"><img src="${h}sub-${i}.png" alt=""><span>${esc(label).replace(/^(Vacation|Attractions|Package) /,'$1<br>')}</span></button>`).join('');
    const apps=`<button class="th-app th-wonder entry" data-go="hub"><span class="th-app-icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8.5c-7 0-12.5 5.3-12.5 12.1 0 8.6 12.5 19.9 12.5 19.9s12.5-11.3 12.5-19.9C36.5 13.8 31 8.5 24 8.5Z" fill="none" stroke="#161a2b" stroke-width="3.2" stroke-linejoin="round"/><path d="M20.2 18.4a3.9 3.9 0 1 1 5.6 3.5c-1.3.7-1.8 1.4-1.8 2.8" fill="none" stroke="#2d61ff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="29" r="1.9" fill="#2d61ff"/><path d="m38 5 1.5 3.6L43 10l-3.5 1.4L38 15l-1.5-3.6L33 10l3.5-1.4Z" fill="#2d61ff"/></svg><b>NEW</b></span>TripWonder</button>`+[['deals',tr('特惠','Deals'),'deals'],['events',tr('活动','Events'),'events'],['planner',tr('行程助手','Trip.Planner'),'itinerary'],['trending',tr('热门榜单','Trending'),'trending'],['best','Trip.Best','trending']].map(([i,label,v])=>`<button class="th-app" data-go="${v}"><span class="th-app-icon"><img src="${h}qa-${i}.png" alt=""></span>${label}</button>`).join('');
    const coupon=(icon,off)=>`<button class="th-coupon" data-action="home-coupon"><span class="th-coupon-body"><img src="${h}cp-${icon}.png" alt=""><span><strong>${off}</strong><small>${tr('去使用','Use')} ${arrow}</small></span></span></button>`;
    return `<div class="page trip-home"><header class="th-head"><img class="th-logo" src="${h}logo.png" alt="Trip.com"><div class="th-member"><span class="th-silver"><img src="${h}silver.png" alt="">${tr('白银会员','Silver')}</span><button class="th-coin" type="button" data-action="lang" aria-label="${tr('切换语言：当前为中文','Switch language: currently English')}"><img src="${h}coin.png" alt=""></button></div></header>`
    + `<div class="th-sheet"><div class="th-main">${main}</div><div class="th-sub">${sub}</div>`
    + `<form class="th-search" role="search"><input type="search" name="q" enterkeyhint="search" autocomplete="off" aria-label="${tr('搜索目的地、酒店、机票','Search destinations, hotels, flights')}"><button class="th-search-btn" type="submit" aria-label="${tr('搜索','Search')}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg></button></form>`
    + `<div class="th-chips"><div class="th-chip-scroll">${(en()?["Hotels in Xi'an","Xi'an",'Shanghai','Beijing','Chengdu']:['西安酒店','西安','上海','北京','成都']).map(label=>`<button type="button" data-action="home-chip">${esc(label)}</button>`).join('')}</div><button class="th-map" data-action="home-search"><img src="${h}map-pin.png" alt="">${tr('地图','Map')}</button></div>`
    + `<div class="th-apps">${apps}</div>`
    + `<button class="th-tw" data-go="hub" aria-label="${tr('参加 TripWonder 奇境挑战，赢取目的地优惠券','Join the TripWonder Challenge and win destination coupons')}"><span class="th-tw-copy"><span class="th-tw-kicker">${tr('TRIPWONDER · 携程奇境挑战','TRIPWONDER · DAILY CHALLENGE')}</span><strong>${tr('参加 <em>TripWonder</em><br>奇境挑战','Join the <em>TripWonder</em><br>Challenge')}</strong><small>${tr('赢取目的地优惠券','Win destination coupons')}</small><span class="th-tw-cta">${tr('去探索','Explore')}${arrow}</span></span>${homeWonderArt()}<span class="th-tw-dots" aria-hidden="true"><i></i><i></i><i></i></span></button>`
    + `<section class="th-discount"><button class="th-discount-head" data-action="home-coupon"><img src="${h}hat.png" alt=""><strong>${tr('新用户专享优惠','New User Discounts Available')}</strong><img class="th-chev" src="${h}chev.png" alt=""></button><div class="th-coupons">${coupon('hotel',tr('9折','10% off'))}${coupon('train',tr('95折','5% off'))}${coupon('car',tr('92折','8% off'))}</div></section>`
    + `<div class="th-recent-head"><strong>${tr('最近浏览','Your recent activities')}</strong><img src="${h}trash.png" alt="${tr('清空','Clear')}"></div>`
    + `<button class="th-recent" data-go="today"><img src="${h}westlake.png" alt="${tr('西湖','West Lake')}"><span><strong>${tr('西湖','West Lake')}</strong><small>${tr('杭州','Hangzhou')}<i></i><b>4.7</b>/5</small></span></button>`
    + `<div class="th-banners"><button class="th-banner th-banner-photo" data-go="today">${img('bj-beihai','')}<span><small>${tr('探索','Explore')}</small><strong>${tr('华北<br>风光','North<br>China')}</strong></span></button><button class="th-banner th-banner-tuesday" data-action="home-coupon"><strong class="th-tt">Trip<i>.</i>Tuesday</strong><span class="th-tt-coupon"><b>$40</b>${tr('优惠券<br>可领取','COUPON<br>AVAILABLE')}</span><strong class="th-tt-copy">${tr('加拿大、日本<br>特价出发','Canada<br>and Japan from')}</strong></button></div></div>`
    + `<button class="th-ai" data-action="home-ai"><img src="${h}ai.png" alt=""><span>${tr('问问 AI，或按住说话','Ask AI or hold to speak')}</span></button>${homeNav()}</div>`; }
  function cover() {
    const c=city(),record=current(),friend=s.invitation?.cityId===c.id,index=order.indexOf(c.id);
    const enter=s.exploring&&s.deadline?tr('继续挑战','Continue'):friend?tr('接受好友挑战','Accept friend’s challenge'):record.result?tr('查看挑战结果','View results'):tr('开始挑战','Start');
    const cta=`<button class="primary cover-enter" data-action="${record.result&&!friend?'show-result':'start'}"><span>${enter}</span>${icon('next')}</button>`;
    // A player journey opens on its own single cover: no carousel, atlas, rankings or PK.
    if(s.mode==='ugc')return `<div class="page cover-page cover-ugc" data-cover-city="${esc(c.id)}"><div class="cover-hero">${img(c.scenes[0].id,tr('待挑战的玩家 Journey','A player journey to play'),true)}</div><header class="immersive-top"><button class="glass round" data-action="leave-cover" aria-label="${tr('返回 Journey','Back to the journey')}">${icon('back')}</button><span class="cover-name">${esc(Community.label(c,false))}</span><button class="glass" data-action="rules" aria-haspopup="dialog" aria-expanded="false">${tr('玩法','How to play')}</button></header><div class="cover-footer"><p class="cover-ugc-note">${tr(`玩家 ${esc(f(c.author,'name'))} 出题 · 社区挑战不参与优惠与成就`,`Made by ${esc(f(c.author,'name'))} · Community challenges earn no perks or achievements`)}</p><nav class="cover-dock">${cta}</nav></div></div>`;
    return `<div class="page cover-page" data-cover-city="${esc(c.id)}" role="region" aria-roledescription="${tr('轮播','carousel')}" aria-label="${tr('今日目的地，左右滑动切换','Today’s destinations. Swipe left or right to switch')}"><div class="cover-hero" tabindex="0" aria-label="${tr(`第 ${index+1} 个目的地，共 ${order.length} 个；左右方向键切换`,`Destination ${index+1} of ${order.length}. Use the left and right arrow keys to switch`)}">${img(c.scenes[0].id,tr('待探索的目的地','A destination to explore'),true)}</div><header class="immersive-top"><button class="glass round" data-action="leave-cover" aria-label="${tr('返回 TripWonder','Back to TripWonder')}">${icon('back')}</button><span class="cover-name">${tr('今日挑战','Today’s challenge')}</span><button class="glass" data-action="rules" aria-haspopup="dialog" aria-expanded="false">${tr('玩法','How to play')}</button></header><div class="cover-footer"><nav class="cover-dock" aria-label="${tr('探索与发现','Explore and discover')}"><div class="cover-dock-links"><button class="cover-tool" data-go="atlas">${icon('atlas')}<span>${tr('图鉴','Atlas')}</span></button><button class="cover-tool" data-go="ranking">${icon('trophy')}<span>${tr('排行榜','Rankings')}</span></button>${feature('pk')&&!record.result&&!friend&&!s.exploring?`<button class="cover-tool cover-pk" data-action="pk-start"><b class="pk-vs" aria-hidden="true">VS</b><span>${tr('PK 对战','PK battle')}</span></button>`:''}</div>${cta}</nav></div></div>`;
  }
  function bgmButton() { if(!window.SceneBGM||!window.BGM_TRACKS?.[s.cityId])return ''; const on=!SceneBGM.isMuted(); return `<button class="glass round bgm" data-action="bgm" aria-pressed="${on}" aria-label="${tr('背景音乐','Background music')}">${icon(on?'sound':'soundOff')}</button>`; }
  // Existing catalog entries may carry an optimized/embedded asset config. New
  // uploaded photo objects use the same sphere viewer without adding a config row.
  function immersiveConfig(photo) { return window.resolveImmersiveScene?.(photo,window.IMMERSIVE_SCENES?.[photo?.id]) || window.IMMERSIVE_SCENES?.[photo?.id]; }
  // Challenge and player-journey games show no clue hotspots and run on the shared clock; a community visit
  // (browse) shows the clues and notes and has no quiz.
  function explore(index=s.scene) { const scene=city().scenes[index],last=index===city().scenes.length-1,browse=!gameMode(),lastLabel=browse?tr('完成浏览','Done'):tr('开始答题','Answer now'); return `<div class="page explore-page${browse?' explore-browse':' explore-game'}"><div class="photo-viewport" tabindex="0" role="region" aria-label="${tr('景点照片，可双指缩放、拖动转动视角','Scene photo. Pinch to zoom, drag to look around')}"><div class="photo-plane">${immersiveConfig(scene.photo)?'':img(scene.id,tr(`第${index+1}处景点`,`Scene ${index+1}`),true)}${browse?scene.hotspots.map((h,i)=>`<button class="hotspot ${s.clues.has(`${index}-${i}`)?'read':i===scene.hotspots.findIndex((_,j)=>!s.clues.has(`${index}-${j}`))?'next':''}" data-clue="${i}" aria-label="${tr(`查看讲解 ${i+1}`,`Open note ${i+1}`)}" aria-haspopup="dialog" style="left:${h.x}%;top:${h.y}%;--pulse-delay:${i*-.8}s"><span class="hotspot-dot" aria-hidden="true"></span></button>`).join(''):''}</div></div><header class="immersive-top"><button class="glass round" data-action="leave" aria-label="${browse?tr('返回 Journey','Back to the journey'):tr('退出挑战','Leave the challenge')}">${icon('back')}</button>${browse?`<span class="scene-counter">${index+1} / ${city().scenes.length}</span>`:`<span class="glass timer explore-timer" role="timer" aria-label="${tr('挑战剩余时间','Time left')}"><svg class="icon quiz-clock" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></svg><b id="timer">${mmss(remaining())}</b><small class="scene-counter">${index+1} / ${city().scenes.length}</small></span>`}<span class="top-right">${bgmButton()}<button class="glass round fav" data-action="fav" aria-pressed="${!!s.bookmarks[s.cityId]}" aria-label="${favLabel(s.bookmarks[s.cityId])}">${icon('heart')}</button></span></header><div class="explore-bottom"><div class="scene-nav${last?' scene-nav-last':''}" role="group" aria-label="${tr('场景导航','Scene navigation')}"><button class="prev-scene" data-action="prev-scene" aria-label="${tr('上一处','Previous scene')}"${index?'':' disabled'}>${icon('back')}</button><button data-action="next-scene" aria-label="${last?lastLabel:tr('下一处','Next scene')}">${last?lastLabel:icon('next')}</button></div></div></div>`; }
  function favLabel(on) { return on?tr('取消收藏','Remove from saved'):tr('收藏这个目的地','Save this destination'); }
  function quizBody() {
    const q=s.questions[s.q];
    return `<section class="quiz-top"><div class="quiz-progress" aria-label="${tr(`第 ${s.q+1} 题，共 3 题`,`Question ${s.q+1} of 3`)}">${s.questions.map((_,i)=>`<span class="${i<s.q?'done':i===s.q?'current':''}"></span>`).join('')}</div><h1 class="quiz-question" tabindex="-1">${esc(f(q,'q'))}</h1></section><div class="question-card quiz-options" role="group" aria-label="${tr('选择答案','Choose an answer')}">${f(q,'options').map((o,i)=>`<button class="option ${s.selected===i?'selected':''}" data-option="${i}" aria-pressed="${s.selected===i}"><b class="option-letter">${String.fromCharCode(65+i)}</b><span class="option-text">${esc(o)}</span><span class="option-check" aria-hidden="true">${icon('check')}</span></button>`).join('')}</div>`;
  }
  function quiz() {
    return `<div class="page quiz-page"><div class="quiz-backdrop" aria-hidden="true"></div><header class="page-head quiz-header"><button class="glass round quiz-back" data-action="quiz-back" aria-label="${tr('返回刚刚的场景','Back to the last scene')}">${icon('back')}</button>${s.pk?PKMode.hud(s.pk,{mine:s.answers.length,total:s.questions.length,elapsed:quizMs()-remaining()}):`<strong>${tr('限时答题','Quick quiz')}</strong>`}<span class="glass timer quiz-timer" role="timer" aria-label="${tr('挑战剩余时间','Time left')}"><svg class="icon quiz-clock" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></svg><b id="timer">${mmss(remaining())}</b></span></header><main class="quiz-body">${quizBody()}</main><footer class="quiz-submit"><button class="primary" data-action="submit" ${s.selected===null?'disabled':''}><span>${submitLabel()}</span>${icon('next')}</button></footer></div>`;
  }
  function submitLabel() { return s.q===2?tr('前往地图','Go to the map'):tr('下一题','Next question');
  }
  function selectAnswer(index) {
    if(s.view!=='quiz'||ChallengeMotion.busy)return;
    if(expired()){tick();return;}
    const changed=s.selected!==index;s.selected=index;persistUgc();
    app.querySelectorAll('[data-option]').forEach(button=>{const selected=Number(button.dataset.option)===index;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    const submit=app.querySelector('[data-action="submit"]'),wasDisabled=submit.disabled;submit.disabled=false;
    if(changed)ChallengeMotion.select(app.querySelector('[data-option="'+index+'"]'));
    if(wasDisabled)ChallengeMotion.activate(submit);
  }
  function submitAnswer() {
    if(s.view!=='quiz'||s.selected===null||ChallengeMotion.busy)return;
    if(expired()){tick();return;}
    const index=s.q,selected=s.selected,q=s.questions[index];
    if(index===2){s.answers.push({...q,selected,correct:q.answer===selected});finishQuiz();return;}
    ChallengeMotion.run(()=>{
      if(s.view!=='quiz'||s.q!==index)return;
      if(expired()){tick();return;}
      s.answers.push({...q,selected,correct:q.answer===selected});s.q++;s.selected=null;persistUgc();
      app.querySelector('.quiz-body').innerHTML=quizBody();
      QuizScene.set(app.querySelector('.quiz-page'),city(),s.questions[s.q]);
      const submit=app.querySelector('[data-action="submit"]');submit.disabled=true;submit.querySelector('span').textContent=submitLabel();
    },{kind:'question'});
  }
  function guess() { return `<div class="page guess-page${s.guessDone?' done':''}"><div class="guess-map" id="guess-map" role="application" aria-label="${tr('中国地图：轻点放置落点，双指或滚轮缩放，拖动平移','Map of China: tap to drop a pin, pinch or scroll to zoom, drag to pan')}"></div><header class="guess-top"><button class="glass-light round" data-action="guess-back" aria-label="${s.guessDone?exitLabel():tr('返回第 3 题','Back to question 3')}"${!s.guessDone&&s.quizRemaining<=0?' disabled':''}>${icon('back')}</button><div><h2>${tr('这个目的地在哪里？','Where is this destination?')}</h2></div></header><div class="guess-zoom"><button class="glass-light" data-action="zoom-in" aria-label="${tr('放大地图','Zoom in')}">+</button><button class="glass-light" data-action="zoom-out" aria-label="${tr('缩小地图','Zoom out')}">−</button></div><section class="guess-card" aria-live="polite">${guessCard()}</section></div>`; }
  const revealTitle = () => tr(`答案揭晓：${city().name}`,`It’s ${cname(city())}!`);
  function guessStatus() { const g=s.guess; return g?`${icon('pin')}<div><strong>${esc([g.province,g.city].filter(Boolean).map(place).join(' · ')||tr('所选位置','Selected spot'))}</strong><small>${tr(`北纬 ${g.lat.toFixed(1)}° · 东经 ${g.lng.toFixed(1)}° · 再点一次可调整`,`${g.lat.toFixed(1)}° N · ${g.lng.toFixed(1)}° E · Tap again to adjust`)}</small></div>`:`<span class="guess-hint-dot" aria-hidden="true"></span><div><strong>${tr('轻点地图，放下你的落点','Tap the map to drop your pin')}</strong><small>${tr(`双指缩放更精准 · 越近得分越高，最高 ${guessRule().max} 分`,`Pinch to zoom for accuracy · The closer, the more points, up to ${guessRule().max}`)}</small></div>`; }
  function guessCard() {
    if(s.guessDone){ const g=s.guess; return `<div class="guess-result"><div><span class="guess-verdict">${esc(guessVerdict(g))}</span><strong class="guess-km"><b data-count="${g.km}">${g.km}</b> km</strong><small>${tr(`你的落点距${esc(city().name)}（直线）`,`From your pin to ${esc(cname(city()))} (straight line)`)}</small></div><div class="guess-points"><b data-count="${g.points}">${g.points}</b><small>${tr(`/ ${guessRule().max} 定位分`,`/ ${guessRule().max} map points`)}</small></div></div><button class="primary" data-action="show-result">${tr('查看完整结果','See full results')} ${icon('next')}</button>`; }
    return `<div class="guess-status">${guessStatus()}</div><div class="guess-actions"><div class="guess-recall" role="group" aria-label="${tr('回看实景','Look back at the scenes')}">${city().scenes.map((sc,i)=>`<button data-recall="${i}" aria-label="${tr(`回看第 ${i+1} 处景点`,`Look back at scene ${i+1}`)}">${img(sc.id,'')}</button>`).join('')}</div><button class="primary" data-action="guess-submit" ${s.guess?'':'disabled'}>${tr('确认落点','Confirm pin')}</button></div>`;
  }
  function mountGuess() {
    const root=app.querySelector('#guess-map'),card=app.querySelector('.guess-card'),top=app.querySelector('.guess-top');
    const insets=()=>({top:top.offsetTop+top.offsetHeight,bottom:root.clientHeight-card.offsetTop+10});
    mapView=new GuessMap(root,{insets,avoid:C.cities.map(c=>({name:c.name,lat:c.lat,lng:c.lng})),onPick:pickGuess,onReject:()=>toast(tr('请在主图上标记，右下角为南海诸岛示意','Drop your pin on the main map; the inset at lower right shows the South China Sea Islands'))});
    if(s.guess)mapView.setPin(s.guess,s.guess.province,s.guess.city);
  }
  function pickGuess(point) {
    s.guess={lat:point.lat,lng:point.lng,x:point.x,y:point.y,province:point.province,city:point.city};persistUgc();
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
    const page=app.querySelector('.guess-page'),card=app.querySelector('.guess-card'),back=page.querySelector('[data-action="guess-back"]');page.classList.add('done');back.disabled=false;back.setAttribute('aria-label',exitLabel());page.querySelector('.guess-top h2').textContent=revealTitle();card.innerHTML=guessCard();ChallengeMotion.reveal(card,page.querySelector('.guess-top h2'));
    const counters=[...card.querySelectorAll('[data-count]')];counters.forEach(el=>el.textContent='0');
    card.querySelector('.primary').focus({preventScroll:true});
    const rival=s.pk&&s.result?.pk;
    mapView.remeasure();mapView.reveal(city(),{name:cname(city()),km},()=>{countUp(counters);if(rival)mapView?.addMarker(rival.guess.lat,rival.guess.lng,tr(`${rival.opponent.name} · ${rival.guess.km} km`,`${cname(rival.opponent)} · ${rival.guess.km} km`));});
  }
  function countUp(els) {
    const t0=performance.now(),dur=matchMedia('(prefers-reduced-motion: reduce)').matches?0:650;
    const step=now=>{const t=dur?Math.min(1,(now-t0)/dur):1,e=1-(1-t)**3;els.forEach(el=>{if(el.isConnected)el.textContent=Math.round(Number(el.dataset.count)*e);});if(t<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  }
  function recall(index) {
    const scene=city().scenes[index];if(!scene)return;
    const read=gameMode()?[]:scene.hotspots.filter((_,j)=>s.clues.has(`${index}-${j}`));
    sheet(tr(`第 ${index+1} 处实景`,`Scene ${index+1}`),`<div class="recall-photo">${img(scene.id,tr(`第 ${index+1} 处景点`,`Scene ${index+1}`))}</div>${read.length?`<p class="recall-note">${tr('你在这里点开过的线索：','Clues you opened here:')}</p>`:''}${read.length?`<div class="tag-row recall-tags">${read.map(h=>`<span class="pill">${esc(f(h,'title'))}</span>`).join('')}</div>`:''}`);
  }
  const rewardTerms = () => tr('领取后 30 日内有效。优惠券具体可用范围请查看活动规则。','Valid for 30 days after claiming. See the campaign rules for where each coupon can be used.');
  // Prices stay in yuan in both languages: the rewards are for trips in China.
  const benefitFor = () => ({name:tr(`优惠权益 · ${city().name}`,`Travel perks · ${cname(city())}`),detail:tr('景点门票 20 元优惠券','¥20 off attraction tickets'),threshold:tr('满 100 元可用','On orders of ¥100+'),amount:20,minimumSpend:100,validDays:30});
  // A destination badge needs 80+ points, matching the atlas (collection-pages.js MEDAL_SCORE).
  const MEDAL_SCORE=80;
  // Coupons shown on the result card and in the claim dialog; the first entry mirrors benefitFor().
  const RESULT_COUPONS=[{kind:'景点门票',kindEn:'Attraction tickets',icon:'ticket',amount:20,rule:'满 100 元可用',ruleEn:'On orders of ¥100+'},{kind:'酒店',kindEn:'Hotels',icon:'bed',amount:50,rule:'满 500 元可用',ruleEn:'On orders of ¥500+'},{kind:'火车票',kindEn:'Train tickets',icon:'train',amount:15,rule:'满 200 元可用',ruleEn:'On orders of ¥200+'},{kind:'当地玩乐',kindEn:'Local experiences',icon:'spark',amount:9,discount:true,rule:'最高减 30 元',ruleEn:'Save up to ¥30'},{kind:'美食',kindEn:'Dining',icon:'bag',amount:10,rule:'满 80 元可用',ruleEn:'On orders of ¥80+'}];
  // 9 折 means paying 90%: 10% off.
  const couponTitle = c => c.discount?tr(`${c.amount} 折优惠`,`${100-c.amount*10}% off`):tr(`${c.amount} 元优惠券`,`¥${c.amount} off`);
  // Prototype-only score mapping until a real participant score distribution is available.
  function estimateRewardPercentile(score) {const points=Math.max(0,Math.min(100,Number(score)||0));return Math.min(99.9,Math.round((1-Math.pow(1-points/100,1.6))*1000)/10);}
  const benefitStatus = id => !s.benefits[id]?'none':s.benefits[id].expires>=today()?'active':'expired';
  function benefitDialog(benefit,earned) {
    return `<div class="benefit-pack">
      <header class="benefit-pack-hero">
        <span class="benefit-pack-brand" aria-label="Trip.com">Trip<span>.</span>com</span>
        <span class="benefit-pack-eyebrow">${tr('目的地专属礼遇','Destination perks')}</span>
        <h3>${esc(benefit.name)}</h3><p>${tr('让下一程多一份惊喜','A little extra for your next trip')}</p>
        <img class="benefit-pack-gift" src="assets/home/hat.png" alt="" aria-hidden="true">
      </header>
      <div class="benefit-pack-body">
        <div class="benefit-pack-list" tabindex="0" aria-label="${tr(`${RESULT_COUPONS.length} 张优惠券，上下滑动查看`,`${RESULT_COUPONS.length} coupons. Scroll to see them all`)}">${RESULT_COUPONS.map((c,i)=>`
          <div class="benefit-pack-ticket" style="animation-delay:${(.06+i*.05).toFixed(2)}s">
            <div class="benefit-pack-amount">${c.discount?(en()?`<strong>${100-c.amount*10}%</strong><span>off</span>`:`<strong>${c.amount}</strong><span>折</span>`):`<span>¥</span><strong>${c.amount}</strong>`}</div>
            <div class="bp-info">
              <div class="bp-kind">${icon(c.icon)}<span>${tr(`${c.kind}优惠券`,`${c.kindEn} coupon`)}</span></div>
              <p class="bp-rule">${f(c,'rule')}</p>
              <p class="bp-meta">${tr(`适用 ${esc(city().name)} · 有效至 ${esc(earned.expires)}`,`For ${esc(cname(city()))} · Valid until ${esc(earned.expires)}`)}</p>
            </div>
          </div>`).join('')}
        </div>
        <button class="benefit-pack-accept" data-action="close">${tr('收下权益','Claim perks')} ${icon('next')}</button>
        <p class="benefit-pack-terms">${rewardTerms()}</p>
      </div>
    </div>`;
  }
  const datePlusDays = count => {const d=new Date();d.setDate(d.getDate()+count);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function resultOpening(c,r) {
    const story=ResultReveal.destination(c),name=esc(cname(c));
    return `<header class="result-topbar"><button class="result-tool" data-action="result-exit" aria-label="${exitLabel()}">${icon('back')}</button><span>${tr('我的发现','My discovery')}</span><div class="result-top-actions"><button class="result-tool" data-action="fav" aria-pressed="${!!s.bookmarks[c.id]}" aria-label="${favLabel(s.bookmarks[c.id])}">${icon('heart')}</button><button class="result-tool" data-action="share" aria-label="${tr('分享成绩','Share your score')}">${icon('share')}</button></div></header><section class="result-intro" aria-label="${tr(`${name}探索成绩`,`Your ${name} score`)}">
      <div class="result-hero" style="--result-position:${story.position||'50% 50%'}">
        <div class="result-visual">${img(story.scene.id,`${cname(c)} · ${cname(story.scene)}`,true)}<div class="result-shade"></div></div>
        <div class="result-copy"><div class="result-region">${icon('pin')}${esc(f(c,'region'))} · ${name}</div><h1 class="result-arrival${en()?' is-en':''}">${en()?`<span>Hello,</span><strong>${name}<i>.</i></strong>`:`<span>你好，</span><strong>${name}<i>。</i></strong>`}</h1></div>
        <p class="result-description">${esc(f(story,'description')||tr('沿着眼前的风景，继续发现这座城市。','Follow the view in front of you and keep discovering this city.'))}</p>
        <div class="result-score-module"><div class="result-score-label">${tr('本次探索得分','Your score')}</div><div class="result-score-number">${r.score}<small>/ 100</small></div></div>
        <div class="result-score-breakdown"><span>${tr('地图定位','Map guess')} <b>${r.guess?.points??0}<small> / ${guessRule().max}</small></b></span><span>${tr('限时答题','Quiz')} <b>${r.quiz??r.score}<small> / ${quizTotal(c)}</small></b></span></div>
        <button class="result-scroll-cue" aria-label="${tr('向下查看地图与探索详情','Scroll down for the map and details')}">${tr('向下，继续这段旅程','Scroll on to continue the journey')} ${icon('down')}</button>
      </div>
    </section>`;
  }
  function guessCardMarkup(r,c,name) { return r.guess?`<section class="content-card guess-summary"><div class="row"><h3>${tr('地图定位','Map guess')}</h3><span class="pill">${esc(guessVerdict(r.guess))}</span></div><div class="guess-mini">${GuessMap.snapshot(r.guess,c)}</div><div class="guess-legend"><span class="you">${tr('你的落点','Your pin')}</span><span class="target">${name}</span></div><div class="guess-stats"><div><b>${r.guess.km} km</b><small>${tr('直线距离','Straight-line distance')}</small></div><div><b>+${r.guess.points}</b><small>${tr(`定位得分 / ${guessRule().max}`,`Map points / ${guessRule().max}`)}</small></div><div><b>${esc(place(r.guess.city||r.guess.province)||'—')}</b><small>${tr('你的落点','Your pin')}</small></div></div></section>`:''; }
  function answersMarkup(r) { return `<section class="content-card"><h3>${tr('三题一起揭晓','Your three answers')}</h3>${r.answers.map((a,i)=>`<button class="answer-line" data-review="${i}" style="width:100%;text-align:left">${icon(a.correct?'check':'book')}<span>${tr(`第 ${i+1} 题 · ${a.correct?'答对':'查看解析'}`,`Question ${i+1} · ${a.correct?'Correct':'See explanation'}`)}</span><b>${tr(`${a.correct?'+'+a.points:'0'} 分`,`${a.correct?'+'+a.points:'0'} pts`)}</b>${icon('next')}</button>`).join('')}</section>`; }
  // A player journey's result: score, map and answers only. No badge, perks, coins, PK, rankings or route.
  function ugcResult(r) { const c=city(),name=esc(cname(c)); return `<div class="page result-page result-ugc">${resultOpening(c,r)}<div class="result-details"><section class="content-card ugc-result-note"><div class="ugc-result-maker"><span>${tr('制作人：','Creator:')}</span><span class="cm-channel is-ugc">${esc(f(c.author,'name'))}</span></div><p>${tr('社区Journey不获取奇境币和目的地徽章','Community Journeys earn no Wonder Coins or destination badges')}</p></section><div class="result-actions ugc-result-actions"><button class="primary" data-action="discuss">${tr('查看评论','Read comments')} ${icon('next')}</button><button class="secondary" data-go="feed">${tr('更多玩家 Journey','More player journeys')}</button></div>${guessCardMarkup(r,c,name)}${answersMarkup(r)}</div></div>`; }
  function result() { const r=s.result || current().result; if(!r)return empty(tr('目的地尚未揭晓','Destination not revealed yet'),tr('完成探索和三道题，再来查看结果。','Finish exploring and the three questions to see your result.')); if(s.mode==='ugc')return ugcResult(r); const c=city(), name=esc(cname(c)), benefit=benefitFor(r), status=benefitStatus(c.id), next=nextDestination(s.cityId,true), prev=previousDestination(s.cityId), medalReady=r.score>=MEDAL_SCORE||!!s.badges[c.id]; return `<div class="page result-page">${resultOpening(c,r)}<div class="result-details">${r.pk?PKMode.resultCard(r.pk,r):''}${feature('wallet')&&r.coins?Wallet.earnedCard(r.coins):''}<button class="content-card result-discuss" data-action="discuss">${icon('message')}<span><strong>${tr('去社区看看大家怎么说','See what others say in the community')}</strong><small>${tr(`${name}的留言板已为你解锁`,`The ${name} board is now open to you`)}</small></span>${icon('next')}</button>${r.guess?`<section class="content-card guess-summary"><div class="row"><h3>${tr('地图定位','Map guess')}</h3><span class="pill">${esc(guessVerdict(r.guess))}</span></div><div class="guess-mini">${GuessMap.snapshot(r.guess,c)}</div><div class="guess-legend"><span class="you">${tr('你的落点','Your pin')}</span><span class="target">${name}</span></div><div class="guess-stats"><div><b>${r.guess.km} km</b><small>${tr('直线距离','Straight-line distance')}</small></div><div><b>+${r.guess.points}</b><small>${tr(`定位得分 / ${guessRule().max}`,`Map points / ${guessRule().max}`)}</small></div><div><b>${esc(place(r.guess.city||r.guess.province)||'—')}</b><small>${tr('你的落点','Your pin')}</small></div></div></section>`:''}<section class="content-card"><h3>${tr('三题一起揭晓','Your three answers')}</h3>${r.answers.map((a,i)=>`<button class="answer-line" data-review="${i}" style="width:100%;text-align:left">${icon(a.correct?'check':'book')}<span>${tr(`第 ${i+1} 题 · ${a.correct?'答对':'查看解析'}`,`Question ${i+1} · ${a.correct?'Correct':'See explanation'}`)}</span><b>${tr(`${a.correct?'+'+a.points:'0'} 分`,`${a.correct?'+'+a.points:'0'} pts`)}</b>${icon('next')}</button>`).join('')}</section><section class="content-card benefit badge-benefit" aria-label="${tr('纪念徽章','Keepsake badge')}"><div class="row"><div><strong>${badgeTitle(c)}</strong><p>${medalReady?tr('珍藏这一站的发现','Keep a memento of this stop'):tr(`本次 ${r.score} 分，达到 ${MEDAL_SCORE} 分可领取`,`You scored ${r.score}. Reach ${MEDAL_SCORE} to claim it`)}</p></div><button data-action="claim"${medalReady?'':' disabled'}>${s.badges[c.id]?tr('查看徽章','View badge'):medalReady?tr('领取徽章','Claim badge'):tr(`${MEDAL_SCORE} 分解锁`,`Unlocks at ${MEDAL_SCORE}`)}</button></div></section><section class="content-card benefit coupon-benefit" aria-label="${tr('优惠权益','Travel perks')}"><div class="coupon-panel"><div class="coupon-head"><strong>${esc(benefit.name)}</strong><button data-action="claim-coupon">${status==='active'?tr('查看权益','View perks'):status==='expired'?tr('重新领取','Claim again'):tr('领取权益','Claim perks')}</button></div><div class="coupon-tickets" tabindex="0" aria-label="${tr('优惠券列表，左右滑动查看','Coupons. Swipe sideways to see them all')}">${RESULT_COUPONS.map(c=>`<div class="coupon-ticket"><b>${couponTitle(c)}</b><span>${f(c,'kind')} · ${f(c,'rule')}</span></div>`).join('')}</div><p class="coupon-terms">${rewardTerms()}</p></div></section>${feature('wallet')?Wallet.sponsorSlot(c.id,C.cities):''}<div class="result-actions"><button class="primary" data-go="route">${tr(`为我规划${name}之旅`,`Plan my ${name} trip`)} ${icon('next')}</button><div class="stop-nav"><button class="glass-light prev-city" data-action="prev-city"${prev?'':' disabled'}>${icon('back')} ${tr('上一个目的地','Previous destination')}</button>${next?`<button class="secondary next-city" data-action="next-city">${tr('下一个目的地','Next destination')} ${icon('next')}</button>`:`<button class="secondary next-city" data-go="hub">${tr('返回 TripWonder','Back to TripWonder')}</button>`}</div></div></div></div>`; }
  const badgeTitle = c => tr(`奇境挑战徽章 · ${esc(c.name)}`,`TripWonder badge · ${esc(cname(c))}`);
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
  // Chinese opening-hours strings are the source data; the warnings they produce are translated.
  function openConflict(stop,date,start,end) {
    if(!date)return '';
    if(date.getDay()===1 && stop.openingHours?.includes('周一闭馆'))return tr('周一闭馆','Closed on Mondays');
    let open=null,close=null;
    const match=stop.openingHours?.match(/(\d{2}):(\d{2})[–-](\d{2}):(\d{2})/);
    if(match){open=Number(match[1])*60+Number(match[2]);close=Number(match[3])*60+Number(match[4]);}
    if(stop.opening==='seasonal'){
      const month=date.getMonth()+1;open=7*60+30;
      close=stop.name==='虎丘景区'?(month>=5&&month<=10?18*60:17*60+30):(month>=3&&month<=10?17*60+30:17*60);
    }
    if(open!==null && start<open)return tr(`建议 ${time(open)} 后入园`,`Arrive after ${time(open)}`);
    if(close!==null && end>close)return tr(`预计 ${time(end)} 结束，晚于参考闭园时间 ${time(close)}`,`Ends around ${time(end)}, after the usual closing time of ${time(close)}`);
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
      card.querySelectorAll('.route-stop').forEach((row,si)=>{const stop=stopByName(s.route[index][si]),startText=row.querySelector('.time').textContent,[hour,minute]=startText.split(':').map(Number),start=hour*60+minute,reason=openConflict(stop,date,start,start+stop.visitMinutes);if(reason)row.insertAdjacentHTML('beforeend',`<div class="availability-warning">${esc(reason)}${tr('。请调整日期或替换地点。','. Change the date or swap this stop.')}${stop.source?.startsWith('http')?` <a href="${esc(stop.source)}" target="_blank" rel="noopener noreferrer">${tr('核对来源','Check source')} ↗</a>`:''}</div>`);});
    });
  }
  function showFriendComparison() {
    if(s.view!=='result'||s.invitation?.cityId!==s.cityId)return;
    // A friend PK already shows the full comparison in its VS card.
    if((s.result||current().result)?.pk)return;
    const score=(s.result||current().result)?.score;if(score===undefined)return;
    const other=s.invitation.score,difference=score-other;
    const card=document.createElement('section');card.className='content-card friend-compare';
    card.innerHTML=`<strong>${tr('好友挑战','Friend challenge')}</strong><p>${tr(`好友 ${other} 分 · 你 ${score} 分`,`Friend ${other} pts · You ${score} pts`)}</p><b>${difference>0?tr(`领先 ${difference} 分`,`You’re ahead by ${difference}`):difference<0?tr(`还差 ${-difference} 分`,`${-difference} points behind`):tr('本局打平','It’s a tie')}</b><small>${tr('链接携带的是好友分享时的分数；仅在本地比对，不是实时榜单。','The link carries your friend’s score from when they shared it. It’s compared on this device only, not on a live leaderboard.')}</small>`;
    app.querySelector('.result-actions')?.before(card);
  }
  const PACES=['慢游','舒适','紧凑'], THEMES=['自动','文化','建筑','自然','摄影','美食'];
  const daysLabel = d => tr(`${d} 日`,d===1?'1 day':`${d} days`);
  function route() { if(!current().result&&!s.route)return empty(tr('先发现，再出发','Discover first, then go'),tr('完成目的地挑战后，就能规划这座城市的行程。','Finish the destination challenge to plan a trip to this city.')); if(!s.route)makeRoute(); const c=city(),name=esc(cname(c)); return `<div class="page">${head(tr('我的路线','My route'),current().result?'result':'itinerary',`<button class="head-action" data-go="itinerary">${tr('行程单','My Trips')}</button>`)}<div class="route-hero">${img(c.scenes.at(-1).id,cname(c))}<div><span class="pill">${tr('可调整的路线示例','Sample route you can adjust')}</span><h2>${tr(`${name} ${s.days} 日`,`${name} in ${daysLabel(s.days)}`)}</h2><p>${tr('从刚才的景点出发，按兴趣安排停留。','Starting from the scenes you just explored, with stops picked by interest.')}</p></div></div><div class="route-tabs">${[1,2,3].map(d=>`<button class="${s.days===d?'active':''}" data-days="${d}">${daysLabel(d)}</button>`).join('')}</div><div class="route-controls"><label>${tr('节奏','Pace')}<select id="route-pace">${PACES.map(v=>`<option value="${v}" ${s.pace===v?'selected':''}>${term(v)}</option>`).join('')}</select></label><label>${tr('兴趣','Interest')}<select id="route-theme">${THEMES.map(v=>`<option value="${v}" ${s.theme===v?'selected':''}>${term(v)}</option>`).join('')}</select></label><label>${tr('出发日期','Start date')}<input id="route-date" type="date" value="${esc(s.date)}"></label></div>${s.route.map((day,di)=>{let clock=9*60,prior=null;return `<section class="day-card"><div class="day-label">${tr(`第 ${di+1} 天`,`Day ${di+1}`)}</div>${day.map((stopName,si)=>{const stop=stopByName(stopName); const transfer=prior?travelMinutes(prior,stop):0; clock+=transfer;const at=time(clock);clock+=stop.visitMinutes;prior=stop;return `<div class="route-stop"><div class="row"><strong>${esc(cname(stop))}</strong><span class="time">${at}</span></div><p>${prior&&si>0?tr(`建议预留约 ${transfer} 分钟交通 · `,`Allow about ${transfer} min to get here · `):''}${tr(`停留约 ${stop.visitMinutes} 分钟。`,`Stay about ${stop.visitMinutes} min. `)}${esc(f(stop,'note'))}</p><div class="stop-actions"><button data-swap="${di}-${si}">${tr('替换','Swap')}</button><button data-move="${di}-${si}-up" ${si===0?'disabled':''}>${tr('上移','Move up')}</button><button data-move="${di}-${si}-down" ${si===day.length-1?'disabled':''}>${tr('下移','Move down')}</button></div></div>`;}).join('')}</section>`;}).join('')}<section class="content-card"><h3>${tr('接着安排出行','Book the rest of your trip')}</h3><div class="travel-products">${[['bed',tr('附近酒店','Nearby hotels')],['ticket',tr('景点门票','Attraction tickets')],['train',tr('往返交通','Getting there')]].map(([i,label])=>`<button data-product="${label}">${icon(i)}${label}</button>`).join('')}</div>${benefitStatus(c.id)==='active'?`<p class="tiny muted">${tr('已领取的示例权益可在门票承接弹窗中查看使用范围。','Open attraction tickets to see where your claimed sample perks apply.')}</p>`:''}</section><div class="route-bottom"><button class="primary" data-action="save-trip">${tr('保存到我的行程','Save to My Trips')}</button><p class="demo-note">${tr('基于本地景点资料生成；交通为直线距离粗估，时间与开放情况请出发前核实。','Generated from the prototype’s own sight data. Travel times are rough straight-line estimates; check times and opening hours before you go.')}</p></div></div>`; }
  function atlas() { return CollectionPages.atlas({order,cities:C.cities,daily:s.daily,badges:s.badges,img,head,esc,back:s.collectionBack}); }
  function ranking() { return CollectionPages.ranking({order,cities:C.cities,daily:s.daily,rank:s.rank,head,esc,icon,img,back:s.collectionBack}); }
  function itinerary() { const items=Object.entries(s.itineraries); return `<div class="page">${head(tr('我的行程','My Trips'),s.itineraryBack)}<div class="pad"><h2>${items.length?tr(`${items.length} 份已保存路线`,items.length===1?'1 saved route':`${items.length} saved routes`):tr('还没有行程','No trips yet')}</h2></div>${items.length?items.map(([id,it])=>`<section class="content-card itinerary-card"><strong>${tr(`${esc(it.city)} ${it.days} 日`,`${esc(cname(C.cities.find(c=>c.id===id)))} · ${daysLabel(it.days)}`)}</strong><p>${esc(it.date || tr('日期待定','Date to be decided'))} · ${tr(`${it.route.flat().length} 处停留`,`${it.route.flat().length} stops`)} · ${tr(`${esc(it.pace)}节奏`,`${esc(term(it.pace))} pace`)}</p><button class="secondary" data-itinerary="${id}">${tr('查看并调整','View and adjust')}</button></section>`).join(''):`<div class="pad"><button class="primary" data-go="today">${tr('去发现目的地','Discover a destination')}</button></div>`}</div>`; }
  function profile() { return ProfilePage.render({cities:C.cities,order,daily:s.daily,badges:s.badges,itineraries:s.itineraries,head,esc,icon,extra:feature('wallet')?Wallet.profileCard():''}); }
  function mall() { return feature('wallet')?Wallet.mall({head,back:s.mallBack,cities:C.cities,solved:Object.keys(s.daily).filter(id=>s.daily[id]?.result)}):empty(tr('奇境币兑换','Coin rewards'),tr('当前演示未开启奇境币。','Wonder Coins are switched off in this demo.')); }
  // Community pages (community.js): official cities appear only once challenged on this device; UGC never earns rewards.
  function communityContext() {
    const stored=window.TWStore?.get()||{},played={};
    for(const [id,record] of Object.entries(stored.challenged||{}))if(record?.result)played[id]={score:record.result.score};
    for(const [id,record] of Object.entries(s.daily))if(record?.result&&(!played[id]||record.result.score>played[id].score))played[id]={score:record.result.score};
    const ugcPlayed={...(stored.ugcPlayed||{})};
    for(const [id,record] of Object.entries(s.ugcResults))if(record?.result&&(!ugcPlayed[id]||record.result.score>ugcPlayed[id].score))ugcPlayed[id]={score:record.result.score};
    return {cities:C.cities,order,daily:s.daily,badges:s.badges,challenged:played,played:ugcPlayed,tab:s.feedTab,boardFilter:s.boardFilter,journey:journeyById(s.journeyId),img,head,esc};
  }
  function hub() { return Community.hub(communityContext()); }
  function feed() {
    const ctx=communityContext();
    return Community.feed({...ctx,head:(title,back,right)=>head(title,back==='hub'&&feedResultReturn?'result':back,right)});
  }
  const immersiveJourney=()=>s.view==='journey'&&!Community.isUgc(journeyById(s.journeyId));
  function journey() { return immersiveJourney()?explore(s.scene):Community.journey(communityContext()); }
  function publish() { return Community.publish(communityContext()); }
  function openJourney(id) {
    if(!journeyById(id))return;
    // Comments opened from either kind of result are a child of that result.
    if(s.view==='result'){s.journeyBack='result';s.journeyReturn=resultReturnPoint();}
    else if(!['explore','cover','journey'].includes(s.view)){s.journeyBack='feed';s.journeyReturn=null;}
    s.journeyId=id;s.boardFilter='all';if(!Community.isUgc(journeyById(id))){activateCity(id,'browse');s.scene=0;}return go('journey');
  }
  function leaveJourney() {
    if(s.journeyBack==='result'&&s.journeyReturn){const point=s.journeyReturn;return restoreCommunityResult(point).then(shown=>{if(shown){s.journeyReturn=null;s.journeyBack='feed';}});}
    return go('feed',{back:true});
  }
  function resultReturnPoint() { return {cityId:s.cityId,mode:s.mode,result:s.result||current().result,state:resultReveal?.snapshot()}; }
  function restoreCommunityResult(point,{force=false}={}) {
    const c=journeyById(point.cityId);if(!c)return Promise.resolve(go('feed',{back:true,force}));
    return ChallengeMotion.slide(ready=>{
      activateCity(point.cityId,point.mode);s.result=point.result||s.result;s.view='result';render(ready.cloneNode());resultReveal?.restore(point.state);
    },{force,back:true,restoreScroll:false,prepare:()=>{cancelPending();return SceneMedia.prepare(ResultReveal.destination(c).scene.photo);}})
      .catch(error=>{if(error.name!=='AbortError')toast(tr('页面暂未载入，请重试','This page didn’t load. Please try again.'));});
  }
  function startBrowse(index=0,{compose=false}={}) {
    const c=journeyById(s.journeyId);if(!c)return;
    activateCity(c.id,'browse');s.composeScene=compose?index:null;
    loadView(Community.isUgc(c)?'explore':'journey',index,()=>{s.scene=index;s.exploring=true;s.visited.add(index);});
  }
  function startUgc() {
    const c=journeyById(s.journeyId);if(!Community.isUgc(c))return;
    if(s.view==='feed'||s.view==='journey')ugcBack=s.view;
    activateCity(c.id,'ugc');
    // Every entry into a player journey is a fresh round with a full clock; the best score stays on the card.
    delete s.ugcResults[c.id];Object.assign(s,freshProgress());s.result=null;
    start();
  }
  const exitLabel = () => s.mode==='ugc'?(ugcBack==='journey'?tr('返回 Journey','Back to the journey'):tr('返回社区','Back to the community')):tr('返回 TripWonder','Back to TripWonder');
  function exitGame() { if(s.mode==='ugc'){s.journeyId=s.cityId;pauseQuizTimer();Object.assign(s,freshProgress());return go(ugcBack,{back:true});}return go('hub',{back:true}); }
  // Names a scene note must not show before the map guess (scene-bubbles.js replaces them with "here").
  function hiddenNames() { const c=city(),parts=value=>String(value||'').split(/[·\s,，、]+/); return [c.name,c.nameEn,c.region,String(c.region||'').replace(/^中国|特别行政区$|省$|市$|自治区$/g,''),c.regionEn,String(c.regionEn||'').replace(/ SAR$/,''),...c.scenes.flatMap(sc=>[...parts(sc.name),...String(sc.nameEn||'').split('·').map(x=>x.trim())])]; }
  function composeNote(at) {
    const target=bubbles;
    sheet(tr('留下你的气泡','Leave a note'),SceneBubbles.composeMarkup());
    SceneBubbles.bindCompose(modalRoot.querySelector('.sheet'),note=>{closeModal();target?.add({...at,...note});toast(tr('留言已放上，下一位旅人会看到它','Your note is up for the next traveller'));});
  }
  function rememberExplored() { const scene=city().scenes[s.scene];if(scene&&window.TWStore)TWStore.update(data=>{data.explored[scene.id]={cityId:s.cityId,at:Date.now()};}); }
  function beginChallenge() {
    // Accepting a friend's link plays against the friend; a fresh normal start drops any earlier PK.
    if(!s.exploring){if(s.invitation?.cityId===s.cityId&&feature('pk')){startPK(s.invitation);return;}s.pk=null;}
    start();
  }
  function startPK(invitation=null) {
    if(pkMatching||s.view!=='cover')return;
    s.pk=PKMode.create({city:city(),day,points:quizPoints(city()),guessScore:km=>guessScore(km),guessMax:guessRule().max,duration:quizMs(),invitation});
    pkMatching=true;
    PKMode.match(document.querySelector('#phone'),s.pk).then(()=>{pkMatching=false;if(s.view==='cover')start();});
  }
  function empty(title,body) { return `<div class="page">${head(title)}<div class="empty"><p>${body}</p><button class="primary" data-go="today">${tr('探索今日目的地','Explore today’s destinations')}</button></div></div>`; }

  function cancelPending() { transition++; pendingCleanup?.(); pendingCleanup=null; }
  async function loadView(view,index,commit) {
    cancelPending(); const ticket=transition, p=city().scenes[index].photo;
    const config=['explore','journey'].includes(view) && immersiveConfig(p);
    const immersive=!!(config && window.ImmersivePhotoViewer);
    if(immersive)window.ImmersiveSceneMedia?.setDestination(city().id,city().scenes.map(scene=>immersiveConfig(scene.photo)).filter(Boolean));
    else window.ImmersiveSceneMedia?.clear();
    const buttons=[...app.querySelectorAll('[data-action="start"],[data-action="next-scene"],[data-action="prev-scene"]')];
    const old=buttons.map(b=>[b,b.innerHTML,b.disabled]);
    buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');});
    let stage, incoming, overlay, transferred=false;
    const cleanOverlay=()=>{overlay?.getAnimations().forEach(a=>a.cancel());overlay?.remove();app.classList.remove('scene-loading');};
    const cleanup=()=>{
      cleanOverlay();
      if(!transferred){incoming?.destroy();stage?.remove();if(!['explore','journey'].includes(s.view))window.ImmersiveSceneMedia?.clear();}
      old.forEach(([b,label,disabled])=>{if(b.isConnected){b.innerHTML=label;b.disabled=disabled;b.removeAttribute('aria-busy');}});
    };
    pendingCleanup=cleanup;
    try {
      let ready;
      if(immersive){
        const phone=document.querySelector('#phone'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
        overlay=document.createElement('div');overlay.className='scene-transition';overlay.setAttribute('role','status');
        overlay.innerHTML='<span class="scene-transition-orbit" aria-hidden="true"></span><span>'+(s.view==='quiz'?tr('正在返回刚刚的场景','Returning to the last scene'):tr('正在展开下一处风景','Opening the next view'))+'</span>';
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
    }catch(error){if(ticket===transition){if(!transferred&&s.view==='quiz'){s.exploring=false;resumeQuizTimer();}if(error.name!=='AbortError')toast(tr('场景暂未载入，请重试','This scene didn’t load. Please try again.'));}}
    finally{if(ticket===transition){cleanup();pendingCleanup=null;}}
  }
  function cancelHubWarm(keep=false) {
    clearTimeout(hubWarmTask);hubWarmTask=null;
    if(!keep&&hubWarm){hubWarm.cards?.destroy(false);hubWarm.page.remove();hubWarm=null;}
  }
  function warmHub() {
    clearTimeout(hubWarmTask);hubWarmTask=null;
    if(s.view!=='home'||hubWarm||!window.HubCards3D||document.hidden)return hubWarm;
    const frame=document.createElement('div');frame.innerHTML=hub();const page=frame.firstElementChild,style=getComputedStyle(app);
    const width=app.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),height=app.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    page.style.cssText=`position:absolute;left:0;top:0;width:${width}px;height:${height}px;visibility:hidden;pointer-events:none`;
    page.inert=true;page.setAttribute('aria-hidden','true');page.dataset.hubPrewarm='true';app.append(page);
    const cards=window.HubCards3D.mount(page,{suspended:true});hubWarm={page,cards};return hubWarm;
  }
  function render(ready,prepared,{deferRules=false}={}) {
    window.JourneyComments?.destroy();
    const warmed=s.view==='hub'?hubWarm:null;cancelHubWarm(!!warmed);if(warmed)hubWarm=null;
    hubCards?.destroy();hubCards=null;
    Community.releasePress();
    QuizScene.destroy();
    bubbles?.destroy();bubbles=null;
    coverCarousel?.destroy();coverCarousel=null;
    cancelPending(); closeModal(); pauseQuizTimer(); viewer?.destroy(); viewer=null; mapView?.destroy(); mapView=null;resultReveal?.destroy();resultReveal=null;
    if(s.view!=='explore'&&!immersiveJourney())window.ImmersiveSceneMedia?.clear();
    document.querySelector('#phone').classList.toggle('immersive',['cover','explore'].includes(s.view)||immersiveJourney());
    document.querySelector('#phone').classList.toggle('flat-mode',!(['cover','explore'].includes(s.view)||immersiveJourney()));
    document.querySelector('#phone').classList.toggle('quiz-mode',s.view==='quiz');
    document.querySelector('#phone').classList.toggle('home-mode',s.view==='home');
    document.querySelector('#phone').classList.toggle('result-mode',s.view==='result'&&!!(s.result||current().result));
    const views={home,cover,explore,quiz,guess,result,route,atlas,ranking,itinerary,profile,mall,hub,feed,journey,publish,myjourneys:()=>UGCService.management(communityContext()),ugcreview:()=>UGCService.management(communityContext(),true)};
    const frame=document.createElement('div');
    if(prepared){prepared.page.classList.remove('scene-staging');prepared.page.inert=false;prepared.page.removeAttribute('aria-hidden');frame.append(prepared.page);}
    else if(warmed){warmed.page.removeAttribute('style');warmed.page.inert=false;warmed.page.removeAttribute('aria-hidden');delete warmed.page.dataset.hubPrewarm;frame.append(warmed.page);}
    else frame.innerHTML=(views[s.view]||home)();
    frame.firstElementChild.dataset.view=s.view;
    if(ready){const placeholder=frame.querySelector('.photo-plane>img,.cover-hero>img,.result-visual>img,.route-hero>img'); if(placeholder){ready.alt=placeholder.alt;placeholder.replaceWith(ready);}}
    app.replaceChildren(...frame.childNodes);app.scrollTop=0;showOpeningWarnings();showFriendComparison();
    if(s.view==='hub'){hubCards=warmed?.cards||window.HubCards3D?.mount(app.firstElementChild);hubCards?.present();}
    if(immersiveJourney()){
      const page=app.firstElementChild;
      page.insertAdjacentHTML('beforeend',`<button class="journey-comments-trigger" data-journey-comments aria-haspopup="dialog" aria-expanded="false">${icon('message')} ${tr('评论','Comments')}</button>`);
      JourneyComments.mount(page,Community.comments(communityContext()));
    }
    else if(s.view==='journey')Community.mountJourney(app);
    window.UGCService?.release();
    if(s.view==='publish')UGCService.mountPublish(app.querySelector('.cm-form'));
    if(['myjourneys','ugcreview'].includes(s.view))UGCService.mountManagement();
    persistUgc();
    document.querySelectorAll('.flow button').forEach(b=>b.classList.toggle('active',b.dataset.go===s.view || (b.dataset.go==='today'&&s.mode==='challenge'&&['cover','explore','quiz','guess','atlas','ranking'].includes(s.view)) || (b.dataset.go==='feed'&&['journey','publish'].includes(s.view)) || (b.dataset.go==='feed'&&s.mode!=='challenge'&&['cover','explore','quiz','guess'].includes(s.view))));
    app.querySelectorAll('img').forEach(el=>el.addEventListener('error',()=>{el.insertAdjacentHTML('afterend','<span class="error-image">'+tr('照片未能载入','Photo failed to load')+'</span>');},{once:true}));
    if(s.view==='explore'||immersiveJourney()) { const root=app.querySelector('.photo-viewport'),config=immersiveConfig(activePhoto());viewer=prepared?.viewer||(config&&window.ImmersivePhotoViewer?new ImmersivePhotoViewer(root,activePhoto(),config):new PhotoViewer(root,activePhoto()));viewer.ready?.then(()=>{if(viewer?.root===root)viewer.present?.();},()=>{}); rememberExplored(); if(feature('bubbles')&&['browse','ugc'].includes(s.mode)&&Community.boardOpen(city())){bubbles=SceneBubbles.mount({root,viewer,scene:city().scenes[s.scene],hiddenNames:s.mode==='ugc'?hiddenNames():[],onCompose:composeNote});if(s.composeScene===s.scene){s.composeScene=null;bubbles.place?.();}} }
    window.SceneBGM?.sync(s.view==='explore'||immersiveJourney()?s.cityId:null);
    resumeQuizTimer();
    if(s.view==='quiz'){QuizScene.set(app.querySelector('.quiz-page'),city(),s.questions[s.q]);}
    if(s.view==='guess'&&!mapView)mountGuess();
    if(s.view==='result'){resultReveal=ResultReveal.mount(app);if(feature('wallet'))Wallet.animateEarned(app);}
    if(s.view==='cover' && !s.rulesSeen&&!deferRules){s.rulesSeen=true;showRules();}
    if(s.view==='home'&&!s.promoSeen){s.promoSeen=true;HomePromo.show({phone:document.querySelector('#phone'),getTarget:()=>app.querySelector('.th-wonder .th-app-icon'),onAccept:()=>go('hub')});}else if(s.view!=='home')HomePromo.dismiss();
    if(s.view==='cover')mountCover();else SceneMedia.retain([]);
    if(s.view==='home')hubWarmTask=setTimeout(()=>warmHub(),200);
  }
  const freshProgress = () => ({scene:0,exploring:false,deadline:0,quizRemaining:QUIZ_DURATION,clues:new Set(),visited:new Set([0]),questions:[],answers:[],q:0,selected:null,guess:null,guessDone:false,pk:null});
  const ugcRevision=c=>hash(JSON.stringify([c.revision||c.sampleRevision||c.publishedAt,c.scenes.map(sc=>[sc.id,sc.photo.sourceSha256||sc.photo.version]),c.questions,c.rules,c.guess]));
  function persistUgc() {
    if(!window.TWStore)return;
    const active=s.mode==='ugc'&&['explore','quiz','guess','result'].includes(s.view);
    TWStore.update(data=>{
      if(s.mode==='ugc'&&Community.isUgc(city())){
        const prior=data.ugcProgress?.[s.cityId];
        const progress={scene:s.scene,exploring:s.exploring,deadline:s.deadline,quizRemaining:s.quizRemaining,clues:[...s.clues],visited:[...s.visited],q:s.q,selected:s.selected,answers:s.answers.map(a=>({selected:a.selected})),guess:s.guess,guessDone:s.guessDone};
        (data.ugcProgress||={})[s.cityId]={revision:ugcRevision(city()),progress,view:active?s.view:prior?.view||'explore',result:current().result||null};
      }
      if(active)data.prefs.ugcActive={id:s.cityId,view:s.view};else delete data.prefs.ugcActive;
    });
  }
  for(const c of C.ugc||[]){
    const saved=window.TWStore?.get().ugcProgress?.[c.id];
    if(!saved||saved.revision!==ugcRevision(c))continue;
    try{
      const p=saved.progress;
      if(!Number.isInteger(p.scene)||p.scene<0||p.scene>=c.scenes.length||!Number.isInteger(p.q)||p.q<0||p.q>2||p.answers.length>3)continue;
      const questions=c.questions.map((q,i)=>({...q,points:quizPoints(c)[i]}));
      const progress={...freshProgress(),...p,clues:new Set(p.clues),visited:new Set(p.visited),questions:(p.answers.length||!p.exploring)?questions:[],answers:p.answers.map((a,i)=>({...questions[i],selected:a.selected,correct:a.selected!==null&&a.selected===questions[i].answer})),pk:null};
      cityProgress.set(`ugc:${c.id}`,progress);
      if(saved.result)s.ugcResults[c.id]={result:saved.result};
    }catch{/* Discard only an invalid in-progress snapshot. */}
  }
  // Progress is kept per mode and journey, so a community visit never touches today's challenge state.
  function activateCity(id,mode='challenge') {
    persistUgc();
    if(s.cityId!==id||s.mode!==mode){
      pauseQuizTimer();
      cityProgress.set(`${s.mode}:${s.cityId}`,{scene:s.scene,exploring:s.exploring,deadline:s.deadline,quizRemaining:s.quizRemaining,clues:new Set(s.clues),visited:new Set(s.visited),questions:[...s.questions],answers:[...s.answers],q:s.q,selected:s.selected,guess:s.guess,guessDone:s.guessDone,pk:s.pk});
      Object.assign(s,cityProgress.get(`${mode}:${id}`)||freshProgress());
    }
    s.mode=mode;s.cityId=id;s.result=current().result||null;s.route=null;s.days=2;s.pace='舒适';s.theme='自动';s.date='';
  }
  function selectCity(id,{back=false}={}) {
    const destination=C.cities.find(c=>c.id===id);if(!destination)return;
    if(s.view==='result'){
      const view=s.daily[id]?.result?'result':'cover';
      const targetPhoto=view==='result'?ResultReveal.destination(destination).scene.photo:destination.scenes[0].photo;
      return ChallengeMotion.slide(ready=>{activateCity(id);s.view=view;render(ready.cloneNode());},{back,restoreScroll:false,prepare:()=>{
        resultReveal?.finishTransition();cancelPending();return SceneMedia.prepare(targetPhoto);
      }}).catch(error=>{if(error.name!=='AbortError')toast(tr('目的地暂未载入，请重试','This destination didn’t load. Please try again.'));});
    }
    activateCity(id);return go(s.result?'result':'cover',{back});
  }
  function mountCover() {
    if(!current().result&&!navigator.connection?.saveData){const configs=city().scenes.map(scene=>immersiveConfig(scene.photo)).filter(Boolean),first=immersiveConfig(city().scenes[s.scene]?.photo);if(first)window.ImmersiveSceneMedia?.prefetchCover(city().id,configs,first);}
    if(s.mode!=='challenge'){SceneMedia.retain([SceneMedia.source(city().scenes[0].photo,true).src]);return;}
    const index=order.indexOf(s.cityId),adjacent=step=>C.cities.find(c=>c.id===order[(index+step+order.length)%order.length]);
    const neighbors=[adjacent(-1),adjacent(1)].filter(c=>c&&c.id!==s.cityId);
    const economical=navigator.connection?.saveData||/(^|-)2g$/.test(navigator.connection?.effectiveType||'');
    SceneMedia.retain([city(),...(economical?[]:neighbors)].map(c=>SceneMedia.source(c.scenes[0].photo,true).src));
    if(!economical&&!document.hidden)neighbors.forEach(c=>SceneMedia.prepare(c.scenes[0].photo,true).catch(()=>{}));
    if(!economical&&!current().result)window.SceneBGM?.prefetch(city().id);
    coverCarousel=CoverCarousel.mount(app.querySelector('.cover-page'),{
      getDestination:step=>order.length>1?adjacent(step):null,
      prepare:c=>SceneMedia.prepare(c.scenes[0].photo),
      canInteract:()=>s.view==='cover'&&!modalRoot.firstElementChild&&!pendingCleanup&&!ChallengeMotion.busy,
      commit:(c,image)=>{activateCity(c.id);render(image);},
      onError:()=>toast(tr('照片暂未载入，请再滑动一次','The photo didn’t load. Swipe once more.'))
    });
  }
  function go(view,{force=false,back=false}={}) {
    if(s.view==='publish')app.querySelector('.cm-form')?._flushUgcDraft?.();
    persistUgc();
    if(view==='today'){openToday();return;}
    if(['notice','community','events','trending','deals'].includes(view)){sheet(tr('携程服务入口','Trip.com services'),`<p>${tr('当前原型聚焦 TripWonder 目的地探索。','This prototype focuses on TripWonder destination discovery.')}</p>`);return;}
    if(view==='quiz'&&!s.questions.length)view='cover';if(view==='guess'&&s.answers.length<3)view='cover';
    if(['atlas','ranking'].includes(view)&&view!==s.view)s.collectionBack=['home','cover','profile'].includes(s.view)?s.view:'today';
    if(view==='itinerary'&&view!==s.view)s.itineraryBack=s.view==='profile'?'profile':'home';
    if(view!=='quiz')pauseQuizTimer();if(view==='result')s.result=current().result||s.result;
    const previous=s.view,commit=()=>{if(view==='cover'||view==='explore')return loadView(view,view==='cover'?0:s.scene);s.view=view;render();};
    if(previous==='feed'&&view==='result'&&feedResultReturn){const point=feedResultReturn;return restoreCommunityResult(point,{force}).then(shown=>{if(shown)feedResultReturn=null;});}
    if(previous==='result'&&view==='feed'&&!back)feedResultReturn=resultReturnPoint();
    if(view==='feed'&&['home','hub'].includes(previous))feedResultReturn=null;
    if(view==='journey'&&!Community.isUgc(journeyById(s.journeyId))){
      let staged;
      const c=journeyById(s.journeyId);if(!c)return;
      activateCity(c.id,'browse');
      return ChallengeMotion.slide(prepared=>{s.view='journey';render(prepared.image,prepared.viewer?prepared:undefined);},{force,back,prepare:async()=>{
        cancelPending();
        const p=c.scenes[s.scene].photo,config=immersiveConfig(p);
        if(!config||!window.ImmersivePhotoViewer)return {image:await SceneMedia.prepare(p)};
        window.ImmersiveSceneMedia?.setDestination(c.id,c.scenes.map(scene=>immersiveConfig(scene.photo)).filter(Boolean));
        const frame=document.createElement('div');frame.innerHTML=explore(s.scene);const page=frame.firstElementChild;
        page.classList.add('scene-staging');page.inert=true;page.setAttribute('aria-hidden','true');document.querySelector('#phone').append(page);
        const viewer=new ImmersivePhotoViewer(page.querySelector('.photo-viewport'),p,config);staged={page,viewer};
        try{await viewer.ready;return {page,viewer};}catch(error){viewer.destroy();page.remove();throw error;}
      }}).catch(error=>{if(error.name!=='AbortError')toast(tr('场景暂未载入，请重试','This scene didn’t load. Please try again.'));})
        .finally(()=>{if(staged?.page.classList.contains('scene-staging')){staged.viewer.destroy();staged.page.remove();}});
    }
    if(previous==='home'&&view==='hub')return ChallengeMotion.slide(commit,{force,prepare:async()=>{
      const warmed=warmHub();if(!warmed)return;
      // A cold/failed image must not hold navigation; native cards remain usable meanwhile.
      await new Promise(resolve=>{const timeout=setTimeout(resolve,120);warmed.cards.ready.then(()=>{clearTimeout(timeout);resolve();});});
    }});
    if((previous==='result'&&view==='route')||(previous==='route'&&view==='result')){
      if(previous==='result')resultRouteReturn={cityId:s.cityId,state:resultReveal?.snapshot()};
      const targetPhoto=view==='result'?ResultReveal.destination(city()).scene.photo:city().scenes.at(-1).photo;
      return ChallengeMotion.slide(ready=>{
        s.view=view;render(ready.cloneNode());
        if(view==='result'&&resultRouteReturn?.cityId===s.cityId)resultReveal?.restore(resultRouteReturn.state);
      },{force,back:previous==='route',restoreScroll:false,prepare:()=>{cancelPending();return SceneMedia.prepare(targetPhoto);}})
        .catch(error=>{if(error.name!=='AbortError')toast(tr('页面暂未载入，请重试','This page didn’t load. Please try again.'));});
    }
    if(['home','hub','journey'].includes(previous)&&view==='cover'){
      const destinationPhoto=city().scenes[0].photo;
      const motion=previous==='hub'?ChallengeMotion.expand:ChallengeMotion.slide;
      return motion(ready=>{s.view='cover';render(ready,undefined,{deferRules:true});},{force,source:app.querySelector('.cm-entry-challenge'),prepare:()=>{
        cancelPending();SceneMedia.retain([SceneMedia.source(destinationPhoto,true).src]);
        return SceneMedia.prepare(destinationPhoto);
      }}).then(shown=>{if(shown&&s.view==='cover'&&!s.rulesSeen){s.rulesSeen=true;showRules();}}).catch(error=>{if(error.name!=='AbortError')toast(tr('场景暂未载入，请重试','This scene didn’t load. Please try again.'));});
    }
    if(view==='mall'&&previous!=='mall')s.mallBack=['result','profile','home'].includes(previous)?previous:'home';
    if((previous==='result'&&view==='mall')||(previous==='mall'&&view==='result')){
      if(previous==='result')resultRouteReturn={cityId:s.cityId,state:resultReveal?.snapshot()};
      return ChallengeMotion.slide(()=>{s.view=view;render();if(view==='result'&&resultRouteReturn?.cityId===s.cityId)resultReveal?.restore(resultRouteReturn.state);},{force,back:previous==='mall',restoreScroll:false,prepare:()=>{cancelPending();}});
    }
    if(view==='mall'||previous==='mall')return ChallengeMotion.slide(commit,{force,back:previous==='mall'});
    if((previous==='profile'&&['atlas','ranking','itinerary'].includes(view))||(view==='profile'&&['atlas','ranking','itinerary'].includes(previous)))return ChallengeMotion.slide(commit,{force,back:view==='profile'});
    if((previous==='home'&&['atlas','ranking','profile'].includes(view))||(view==='home'&&['atlas','ranking','cover','result','profile'].includes(previous)))return ChallengeMotion.slide(commit,{force,back:view==='home'});
    if(previous==='hub'&&['feed','result'].includes(view))return ChallengeMotion.expand(commit,{force,source:app.querySelector(view==='feed'?'.cm-entry-community':'.cm-entry-challenge')});
    // Other community routes keep their page-stack navigation and back gesture.
    const depth={home:0,hub:1,feed:2,journey:3,publish:3,myjourneys:3,ugcreview:3};
    if(view in depth&&previous in depth&&view!==previous)return ChallengeMotion.slide(commit,{force,back:depth[view]<depth[previous]});
    if(['hub','journey','feed'].includes(view)&&['cover','result','atlas','ranking','profile','guess','explore'].includes(previous))return ChallengeMotion.slide(commit,{force,back:back||view==='hub'||previous==='explore'});
    if(['quiz','guess'].includes(previous)||['quiz','guess'].includes(view)||(view==='result'&&previous!==view))return ChallengeMotion.run(commit,{force,back:back||view==='cover'});
    ChallengeMotion.cancel();return commit();
  }
  function sheet(title,content,kind='') { resultReveal?.finishTransition();closeModal();previousFocus=document.activeElement;modalRoot.innerHTML=`<div class="modal-overlay ${kind?`${kind}-overlay`:''}"><section class="sheet ${kind}" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"><div class="sheet-handle"></div><div class="sheet-heading"><h2>${esc(title)}</h2>${kind==='clue-dialog'?'':`<button class="icon-btn sheet-close" data-action="close" aria-label="${tr('关闭','Close')}">${icon('close')}</button>`}</div>${content}</section></div>`;modalRoot.querySelector('.sheet').focus({preventScroll:true});if(kind==='clue-dialog'){app.inert=true;clueSheet=ClueSheet.mount(modalRoot.firstElementChild,closeModal);window.SceneBGM?.duck('clue');}else if(['quiz','guess','result'].includes(s.view))ChallengeMotion.dialogIn(modalRoot.firstElementChild); }
  function closeModal() { clueSheet?.destroy();clueSheet=null;window.SceneBGM?.duck(null);rulesCleanup?.();rulesCleanup=null;activeShare=null;app.inert=false;document.querySelector('[data-action="rules"]')?.setAttribute('aria-expanded','false');window.speechSynthesis?.cancel?.();modalRoot.innerHTML='';if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null; }
  function showRules() {
    closeModal(); const anchor=app.querySelector('[data-action="rules"]');if(!anchor)return;
    previousFocus=anchor;anchor.setAttribute('aria-expanded','true');
    modalRoot.innerHTML=`<div class="rules-overlay"><section class="rules-popover" role="dialog" aria-modal="true" aria-labelledby="rules-title" tabindex="-1"><div class="rules-heading"><div><span class="rules-eyebrow">${tr('玩法说明','How to play')}</span><h2 id="rules-title">${tr('奇境挑战TripWonder','TripWonder Challenge')}</h2></div><button class="icon-btn" data-action="close" aria-label="${tr('关闭玩法','Close how to play')}">${icon('close')}</button></div><ol class="rules-steps">${[['看','Look',`进入第一处场景就开始计时！${mmss(quizMs())} 内转动、放大画面，从建筑、风景和街头细节里找答案。`,`The clock starts at the first scene. You have ${mmss(quizMs())} to look around and zoom in for answers in the buildings, scenery and street details.`],['答','Quiz','浏览到最后一处场景后点「开始答题」，在同一倒计时内答完三道题；时间到会自动提交。','Reach the last scene, then tap “Answer now” and finish three questions on the same clock. Answers are submitted when time runs out.'],['猜','Guess','推测目的地地点，并在地图上标记位置。距离实际地点越近，得分越高！','Work out the destination and drop a pin on the map. The closer you are, the more points you score.'],['奖','Win','查看最终得分，点亮成就勋章！不仅可以一键规划目的地旅行路线，还能凭挑战排名领取丰厚优惠权益！','See your final score and unlock a badge. Plan a trip to the destination in one tap, and claim travel perks based on your result.']].map(([zh,enStep,zhText,enText])=>`<li><span${en()?' class="rules-step-en"':''}>${tr(zh,enStep)}</span><p>${tr(zhText,enText)}</p></li>`).join('')}</ol><button class="primary rules-cta" data-action="rules-start">${tr('知道了','Got it')}</button></section></div>`;
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
    const resume=s.exploring&&!!s.deadline;
    if(resume&&expired()){timeUp();return;}
    pauseQuizTimer();
    // The clock starts once the first scene is on screen and then runs through exploring and answering.
    loadView('explore',resume?s.scene:0,()=>{if(!resume){Object.assign(s,{scene:0,exploring:true,deadline:Date.now()+quizMs(),quizRemaining:quizMs(),visited:new Set([0]),answers:[],questions:[],q:0,selected:null});s.clues.clear();}});
  }
  const remaining = () => s.deadline?Math.max(0,s.deadline-Date.now()):s.quizRemaining;
  const expired = () => !!s.deadline&&s.deadline<=Date.now();
  // Stops the on-screen ticking only; the deadline itself keeps running until the answers are in.
  function pauseQuizTimer() {
    clearInterval(timer);timer=null;
    if(s.deadline)s.quizRemaining=Math.max(0,s.deadline-Date.now());
  }
  function resumeQuizTimer() {
    clearInterval(timer);timer=null;
    if(!s.deadline||!gameMode()||!['explore','quiz'].includes(s.view)){window.QuizUrgency?.clear();return;}
    tick();
    if(s.deadline&&['explore','quiz'].includes(s.view))timer=setInterval(tick,250);
  }
  function tick() {
    if(!s.deadline||!['explore','quiz'].includes(s.view))return;
    const left=Math.max(0,s.deadline-Date.now()),remain=Math.ceil(left/1000),el=app.querySelector('#timer');
    if(el){el.textContent=mmss(remain*1000);el.parentElement.classList.toggle('urgent',remain<=15);window.QuizUrgency?.update(remain,el.parentElement,{left,total:quizMs()});}
    if(s.pk&&s.view==='quiz')PKMode.update(app.querySelector('.quiz-page'),s.pk,{mine:s.answers.length,total:s.questions.length,elapsed:quizMs()-left});
    if(remain===0)timeUp();
  }
  function timeUp() {
    prepareQuestions();finishQuiz(true);
    toast(tr('挑战时间到，已提交当前答案，未作答题目计 0 分','Time’s up. Your answers have been submitted; unanswered questions score 0.'));
  }
  function prepareQuestions() {
    if(s.questions.length===3)return;
    s.questions=city().questions.slice(0,3).map((q,i)=>({...q,points:quizPoints(city())[i]}));s.q=0;s.selected=null;s.answers=[];
  }
  function beginQuiz() {
    if(expired()){timeUp();return;}
    pauseQuizTimer();s.exploring=false;prepareQuestions();
    go('quiz');
  }
  function finishQuiz(timedOut=false) {
    pauseQuizTimer();
    s.quizRemaining=timedOut?0:remaining();s.deadline=0;s.exploring=false;
    if(timedOut){
      while(s.answers.length<s.questions.length){const i=s.answers.length,q=s.questions[i],selected=i===s.q?s.selected:null;s.answers.push({...q,selected,correct:selected!==null&&q.answer===selected});}
    }
    s.guess=null;s.guessDone=false;go('guess',{force:timedOut});
  }
  // Only one unread explore point is shown large at a time; reading it hands the spotlight to the next.
  function spotlightNextClue() { const spots=[...app.querySelectorAll('.hotspot[data-clue]')];spots.forEach(el=>el.classList.remove('next'));spots.find(el=>!el.classList.contains('read'))?.classList.add('next'); }
  function clue(index) { const h=city().scenes[s.scene].hotspots[index];if(!h)return;s.clues.add(`${s.scene}-${index}`);app.querySelector(`[data-clue="${index}"]`)?.classList.add('read');spotlightNextClue();const source=h.source?.startsWith('http')?`<a href="${esc(h.source)}" target="_blank" rel="noopener noreferrer">${tr('资料出处','Source')} ↗</a>`:'';sheet(f(h,'title'),`<p id="clue-text">${esc(f(h,'text'))}</p><div class="clue-footer"><button data-action="speak">${tr('朗读','Read aloud')}</button>${source}</div>`,'clue-dialog'); }
  // Fallback sources read "第 n 处 · 线索标题"; in English they point at the same hotspot by its translated title.
  function sourceHotspot(answer) { const match=answer.source?.match(/第\s*(\d+)\s*处\s*·\s*(.+)/);if(!match)return null;return {n:Number(match[1]),hotspot:city().scenes[Number(match[1])-1]?.hotspots.find(h=>h.title===match[2])}; }
  function sourceLabel(answer) { const found=sourceHotspot(answer);return en()&&found?.hotspot?`Scene ${found.n} · ${f(found.hotspot,'title')}`:(en()&&/[\u4e00-\u9fa5]/.test(answer.source||'')?'':answer.source||''); }
  function answerSource(answer) { if(answer.source?.startsWith('http'))return answer.source;return sourceHotspot(answer)?.hotspot?.source||null; }
  function finish() { const counts={};for(const key of s.clues){const [i,j]=key.split('-').map(Number),tag=city().scenes[i].hotspots[j]?.tag;if(tag)counts[tag]=(counts[tag]||0)+1;}const tags=Object.keys(counts).sort((a,b)=>counts[b]-counts[a]).slice(0,2);const quiz=s.answers.reduce((n,a)=>n+(a.correct?a.points:0),0),r={score:quiz+(s.guess?.points||0),quiz,guess:s.guess?{...s.guess}:null,correct:s.answers.filter(a=>a.correct).length,answers:s.answers,clues:s.clues.size,tags:tags.length?tags:['旅行发现'],date:day};
    // A player journey records only that it was played: no coins, PK, badge, perks or today's progress.
    if(s.mode==='ugc'){s.result=r;s.ugcResults[s.cityId]={result:r};if(window.TWStore)TWStore.update(data=>{const old=data.ugcPlayed?.[s.cityId];if(!old||r.score>=old.score)data.ugcPlayed={...data.ugcPlayed,[s.cityId]:{at:Date.now(),score:r.score}};});return;}
    if(s.pk)r.pk=PKMode.settle(s.pk,r,quizMs()-s.quizRemaining);if(feature('wallet'))r.coins=Wallet.award({cityId:s.cityId,day,score:r.score,quizRemaining:s.quizRemaining,pk:r.pk});s.result=r;const previous=current().result;s.daily[s.cityId]={...current(),result:!previous||r.score>previous.score?r:previous,skipped:false};
    if(window.TWStore)TWStore.update(data=>{const old=data.challenged?.[s.cityId]?.result;if(!old||r.score>=old.score){const {pk,coins,...keep}=r;data.challenged={...data.challenged,[s.cityId]:{...data.challenged?.[s.cityId],at:Date.now(),result:keep}};}}); }
  function inviteUrl() { const r=s.result||current().result,token=btoa(JSON.stringify({cityId:s.cityId,score:r.score,day})).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=new URL('index.html',window.TRIPWONDER_PUBLIC_ORIGIN||location.href);url.searchParams.set('challenge',token);return url.href; }
  function share() {
    const r=s.result||current().result,c=city(),url=inviteUrl();
    const representative={datong:['yungang','xMidYMax'],shenzhen:['sz-futian','xMidYMid'],suzhou:['suzhou-huqiu','xMidYMin'],guilin:['gl-xingping','xMidYMid'],hongkong:['hk-peak','xMidYMid'],beijing:['bj-zhengyangmen','xMidYMid'],shanghai:['sh-lujiazui','xMidYMid']}[c.id];
    const scene=c.scenes.find(item=>item.id===representative?.[0])||c.scenes[0];
    const session={r,c,url,scene,align:representative?.[1]||'xMidYMid',art:SceneMedia.source(scene.photo,true).src,file:null};
    sheet(tr('分享挑战','Share the challenge'),`<div class="share-sheet">
      <figure class="share-preview" data-scene="${esc(scene.id)}">${sharePoster(session,session.art)}</figure>
      <div class="share-actions">${c.local?`<p class="cm-hint">${tr('此 Journey 仅保存在本机。请导出旅程文件给好友，好友导入后即可挑战。','This journey is stored on this device. Export it for friends to import and play.')}</p><button class="secondary" data-ugc-export="${esc(c.id)}">${tr('导出 Journey 文件','Export journey file')}</button>`:''}${ShareOptions.markup()}<input hidden class="invite-link" id="invite-link" readonly value="${esc(url)}" aria-label="${tr('好友挑战链接','Friend challenge link')}"></div>
    </div>`,'share-dialog');
    activeShare=session;app.inert=true;
    // Prepare the same card for native image sharing before the user's next tap.
    session.preparing=shareImage(session).then(file=>{session.file=file;return file;}).catch(()=>null);
  }
  function sharePoster({r,c,align},art) {
    const suffix=48+String(r.score).length*61;
    return `<svg class="share-poster" xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900" role="img" aria-label="${tr(`奇境挑战分享卡，${r.score} 分，${c.scenes.length} 处实景`,`TripWonder share card: ${r.score} points, ${c.scenes.length} real-world scenes`)}">
      <defs><clipPath id="share-corners"><rect width="720" height="900" rx="36"/></clipPath><linearGradient id="share-photo-shade" x2="0" y2="1"><stop stop-color="#10253b" stop-opacity=".48"/><stop offset=".3" stop-color="#10253b" stop-opacity="0"/><stop offset=".58" stop-color="#10253b" stop-opacity=".04"/><stop offset="1" stop-color="#10253b" stop-opacity=".9"/></linearGradient></defs>
      <g clip-path="url(#share-corners)" font-family="'Segoe UI','Microsoft YaHei',sans-serif">
        <rect width="720" height="900" fill="#fff"/>
        <image class="share-landscape" href="${esc(art)}" width="720" height="590" preserveAspectRatio="${align} slice"/>
        <path fill="url(#share-photo-shade)" d="M0 0h720v590H0z"/>
        <text x="42" y="72" fill="#fff" font-size="38" font-weight="800" letter-spacing="-1.5">Trip<tspan fill="#ffc340">.</tspan>com</text>
        <text x="676" y="55" text-anchor="end" fill="#fff" font-size="17" letter-spacing="3">TRIPWONDER</text><text x="676" y="85" text-anchor="end" fill="#fff" fill-opacity=".85" font-size="19" letter-spacing="3">${tr('奇境挑战','CHALLENGE')}</text>
        <path d="M44 455h34" stroke="#ffc340" stroke-width="5" stroke-linecap="round"/>
        <text x="42" y="514" fill="#fff" font-size="43" font-weight="700">${tr('猜猜，这是哪座城？','Can you guess this city?')}</text>
        <text x="44" y="557" fill="#fff" fill-opacity=".86" font-size="22">${tr('我已抵达这片风景，现在轮到你。','I’ve found my way here. Now it’s your turn.')}</text>
        <text x="44" y="639" fill="#748096" font-size="21" letter-spacing="1">${tr('我的挑战成绩','My score')}</text>
        <text x="40" y="750" fill="#2855f7" font-size="112" font-weight="750" letter-spacing="-4">${r.score}</text><text x="${suffix}" y="746" fill="#8b96a9" font-size="28">/ 100</text>
        <text x="676" y="686" text-anchor="end" fill="#233451" font-size="28" font-weight="650">${tr('等你来超越','Can you beat it?')}</text>
        <circle cx="650" cy="730" r="23" fill="#edf2ff"/><path d="M638 730h24m-9-9 9 9-9 9" fill="none" stroke="#3264ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M44 786h632" stroke="#e8edf5"/>
        <g text-anchor="middle" fill="#233451" font-size="28" font-weight="650"><text x="147" y="831">${r.guess?.points??0}<tspan fill="#9aa5b6" font-size="20" font-weight="400"> / ${{...GUESS,...c.guess}.max}</tspan></text><text x="360" y="831">${r.quiz??r.score}<tspan fill="#9aa5b6" font-size="20" font-weight="400"> / ${quizTotal(c)}</tspan></text><text x="573" y="831">${c.scenes.length}<tspan font-size="20" font-weight="400">${tr(' 处','')}</tspan></text></g>
        <g text-anchor="middle" fill="#8290a5" font-size="20"><text x="147" y="866">${tr('地图定位','Map guess')}</text><text x="360" y="866">${tr('线索答题','Clue quiz')}</text><text x="573" y="866">${tr('探索实景','Scenes')}</text></g>
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
    if(copied)toast(tr('挑战链接已复制，发给好友一起玩','Challenge link copied. Send it to a friend!'));
    else {const field=modalRoot.querySelector('#invite-link');field.hidden=false;field.focus();field.select();toast(tr('请复制下方挑战链接','Copy the challenge link below'));}
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
      setTimeout(()=>URL.revokeObjectURL(url),2000);toast(tr('已发起挑战卡图片下载','Downloading your challenge card'));
    } catch {if(activeShare===session)toast(tr('图片暂时无法保存，请稍后重试','Couldn’t save the image. Please try again later.'));}
    finally {button.disabled=false;button.removeAttribute('aria-busy');}
  }
  async function chooseShareOption(button) {
    const session=activeShare;if(!session||button.disabled)return;
    const channel=button.dataset.shareChannel;
    if(channel==='save'){await saveChallengeImage(button,session);return;}
    if(channel==='more'){await sendChallenge(button);return;}
    button.disabled=true;
    try {await ShareOptions.activate(channel,{title:tr('TripWonder 奇境挑战','TripWonder Challenge'),text:shareText(session),url:session.url,file:session.file,copy:()=>copyChallengeLink(session),toast});}
    catch {if(activeShare===session)toast(tr('暂时无法打开分享，请试试复制链接','Sharing isn’t available right now. Try copying the link.'));}
    finally {button.disabled=false;}
  }
  async function sendChallenge(button) {
    const session=activeShare;if(!session||button.disabled)return;
    button.disabled=true;
    try {
      if(navigator.share){const data={title:tr('TripWonder 奇境挑战','TripWonder Challenge'),text:shareText(session),url:session.url};if(session.file&&navigator.canShare?.({files:[session.file]}))data.files=[session.file];try{await navigator.share(data);return;}catch(error){if(error.name==='AbortError')return;}}
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

  function product(name) { const earned=s.benefits[s.cityId],active=benefitStatus(s.cityId)==='active',cn=esc(cname(city())),perks=RESULT_COUPONS.map(couponTitle).join(en()?', ':'、');sheet(name,`<p>${tr(`已带入目的地：${cn}。此入口展示旅行产品承接方式，暂未接入实时库存、报价或下单。`,`Destination added: ${cn}. This entry shows how travel products would follow on; it isn’t connected to live inventory, prices or booking.`)}</p>${active?`<div class="clue-quote">${tr(`已领取：${perks}<br>有效至 ${esc(earned.expires)} · 仅适用于${cn}相关产品。示例权益，无真实券码。`,`Claimed: ${perks}<br>Valid until ${esc(earned.expires)} · ${cn} products only. Sample perks with no real coupon codes.`)}</div>`:''}<a class="primary" href="${en()?'https://www.trip.com/':'https://www.ctrip.com/'}" target="_blank" rel="noopener noreferrer">${tr('打开携程官网','Open Trip.com')}</a>`); }
  const shareText = session => tr(`我在 TripWonder 拿到了 ${session.r.score} 分，猜猜这是哪座城？`,`I scored ${session.r.score} on TripWonder. Can you guess which city this is?`);
  // Mouse drag for the coupon row; touch and trackpads scroll it natively.
  app.addEventListener('pointerdown',event=>{const row=event.target.closest('.coupon-tickets');if(!row||event.pointerType!=='mouse'||event.button)return;const x=event.clientX,left=row.scrollLeft;row.classList.add('dragging');const move=e=>{row.scrollLeft=left-(e.clientX-x);},up=()=>{row.classList.remove('dragging');removeEventListener('pointermove',move);removeEventListener('pointerup',up);};addEventListener('pointermove',move);addEventListener('pointerup',up);});
  document.addEventListener('pointerdown',event=>{const button=event.target.closest('button');if(!button||event.button)return;if(['quiz','guess','result'].includes(s.view)||(s.view==='explore'&&button.dataset.action==='next-scene'&&s.scene===city().scenes.length-1))ChallengeMotion.hold(button);},{passive:true});
  // iOS Safari only applies :active pressed states when a touchstart listener exists.
  document.addEventListener('touchstart',()=>{},{passive:true});
  document.addEventListener('click',event=>{
    const b=event.target.closest('button')||event.target.closest('.cm-post[data-journey]');if(!b||b.disabled)return;if(ChallengeMotion.busy){event.preventDefault();return;}if(event.detail===0&&['quiz','guess','result'].includes(s.view))ChallengeMotion.press(b);
    if(b.dataset.shareChannel){chooseShareOption(b);return;}
    if(b.dataset.city){selectCity(b.dataset.city);return;} if(b.dataset.go){if(b.matches('.cm-entry')&&hubCards&&!hubCards.destroyed)hubCards.activate(b,()=>go(b.dataset.go));else go(b.dataset.go);return;}
    if(b.dataset.service){product(b.dataset.service);return;}if(b.dataset.product){product(b.dataset.product);return;}
    if(b.dataset.clue!==undefined){clue(Number(b.dataset.clue));return;}
    if(b.dataset.recall!==undefined){recall(Number(b.dataset.recall));return;}
    if(b.dataset.option!==undefined){selectAnswer(Number(b.dataset.option));return;}
    if(b.dataset.days){s.days=Number(b.dataset.days);makeRoute();render();return;}
    if(b.dataset.rank){s.rank=b.dataset.rank;render();return;}
    if(b.dataset.review!==undefined){const a=(s.result||current().result).answers[Number(b.dataset.review)],url=answerSource(a),source=url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${tr('资料出处','Source')} ↗</a>`:esc(sourceLabel(a));const options=f(a,'options');sheet(tr(`第 ${Number(b.dataset.review)+1} 题`,`Question ${Number(b.dataset.review)+1}`), `<p><b>${esc(f(a,'q'))}</b></p><p>${tr('你的答案：','Your answer: ')}${a.selected===null?tr('未作答','Not answered'):esc(options[a.selected])}<br>${tr('正确答案：','Correct answer: ')}${esc(options[a.answer])}</p><div class="clue-quote">${esc(f(a,'explain'))}<br>${source}</div>`);return;}
    if(b.dataset.itinerary){selectCity(b.dataset.itinerary);const it=s.itineraries[b.dataset.itinerary];s.days=it.days;s.pace=it.pace;s.theme=it.theme;s.date=it.date;s.route=it.route.map(d=>[...d]);go('route');return;}
    if(b.dataset.swap){const [di,si]=b.dataset.swap.split('-').map(Number),used=s.route.flat(),other=city().stops.filter(x=>!used.includes(x.name));sheet(tr('替换停留地点','Swap this stop'),`<div class="swap-list">${other.length?other.map(x=>`<button class="answer-line" data-replace="${di}-${si}" data-stop="${esc(x.name)}"><span>${esc(cname(x))}</span><small>${esc(term(x.theme||'景点'))}</small></button>`).join(''):`<p>${tr('此目的地的其他景点已全部排入路线。可先缩短天数，再进行替换。','Every other sight here is already in your route. Shorten the trip first, then swap.')}</p>`}</div>`);return;}
    if(b.dataset.replace){const [di,si]=b.dataset.replace.split('-').map(Number);s.route[di][si]=b.dataset.stop;render();return;}
    if(b.dataset.move){const [di,si,direction]=b.dataset.move.split('-'),list=s.route[Number(di)],from=Number(si),to=from+(direction==='up'?-1:1);if(to>=0&&to<list.length){[list[from],list[to]]=[list[to],list[from]];render();}return;}
    if(b.dataset.redeem){sheet(tr('兑换确认','Redeem'),Wallet.confirmMarkup(b.dataset.redeem));return;}
    // Community pages (community.js).
    if(b.dataset.journey||b.hasAttribute('data-post-open')){
      const id=b.dataset.journey||b.closest('.cm-post')?.dataset.journey;
      if(Community.isUgc(journeyById(id))&&!b.hasAttribute('data-feed-discuss')){
        s.journeyId=id;s.journeyBack='feed';s.journeyReturn=null;startUgc();return;
      }
      const opened=openJourney(id);
      if(b.hasAttribute('data-feed-discuss'))Promise.resolve(opened).then(()=>{if(s.view==='journey'&&s.journeyId===id)app.querySelector('[data-journey-comments]')?.click();});
      return;
    }
    if(b.dataset.feedTab){s.feedTab=b.dataset.feedTab;render();return;}
    if(b.dataset.boardFilter){s.boardFilter=b.dataset.boardFilter;const y=app.scrollTop;render();app.scrollTop=y;return;}
    if(b.dataset.noteLike){const on=SceneBubbles.toggleLike(b.dataset.noteLike),count=b.querySelector('b');b.setAttribute('aria-pressed',String(on));if(count)count.textContent=Number(count.textContent)+(on?1:-1);return;}
    if(b.dataset.browseScene!==undefined){startBrowse(Number(b.dataset.browseScene));return;}
    if(b.dataset.composeScene!==undefined){closeModal();startBrowse(Number(b.dataset.composeScene),{compose:true});return;}
    const action=b.dataset.action;
    if(action==='close')dismissModal();
    else if(action==='pk-start')startPK();
    else if(action==='leave-cover'){if(s.mode==='ugc')exitGame();else go('hub',{back:true});}
    else if(action==='result-exit')exitGame();
    else if(action==='discuss')Promise.resolve(openJourney(s.cityId)).then(()=>{if(immersiveJourney())app.querySelector('[data-journey-comments]')?.click();});
    else if(action==='browse')startBrowse(0);
    else if(action==='ugc-start')startUgc();
    else if(action==='journey-back')leaveJourney();
    else if(action==='board-write'){window.JourneyComments?.close();const c=journeyById(s.journeyId);if(c&&Community.boardOpen(c))sheet(tr('选一个场景留言','Pick a scene for your note'),`<div class="cm-compose-scenes">${c.scenes.map((scene,i)=>`<button data-compose-scene="${i}">${img(scene.id,'')}<span>${esc(f(scene,'name'))}</span></button>`).join('')}</div><p class="cm-hint">${tr('进入场景后，点击画面选择留言的位置。','In the scene, tap the view to choose where your note goes.')}</p>`);}
    else if(action==='redeem-confirm'){const res=Wallet.redeem(b.dataset.offer);if(!res.ok){toast(tr('奇境币不足','Not enough coins'));return;}if(s.view==='mall'){const y=app.scrollTop;render();app.scrollTop=y;}else closeModal();sheet(tr('兑换成功','Redeemed'),Wallet.successMarkup(res));}
    else if(action==='coin-history')sheet(tr('收支明细','Coin history'),Wallet.historyMarkup());
    else if(action==='reset-demo')sheet(tr('重置演示数据','Reset demo data'),`<p>${tr('将清空本机的奇境币、兑换记录、场景留言和 PK 记录，用于重新演示。今日挑战进度不受影响。','This clears coins, redemptions, scene notes and PK history on this device so the demo can start fresh. Today’s challenge progress is kept.')}</p><button class="primary" data-action="reset-demo-confirm">${tr('确认清空','Clear demo data')}</button>`);
    else if(action==='reset-demo-confirm'){TWStore.reset();render();toast(tr('演示数据已清空','Demo data cleared'));}
    else if(action==='rules')showRules();
    else if(action==='rules-start')dismissModal(cueStart);
    else if(action==='start')beginChallenge();
    else if(action==='show-result')go('result');
    else if(action==='prev-city'){const prev=previousDestination(s.cityId);if(prev)selectCity(prev,{back:true});}
    else if(action==='next-city'){const next=nextDestination(s.cityId,true);if(next)selectCity(next);else go('hub');}
    else if(action==='quiz-back'&&s.view==='quiz'){if(expired()){tick();return;}s.exploring=true;go('explore',{back:true});}
    else if(action==='leave'){if(s.mode==='browse'){if(immersiveJourney())leaveJourney();else go('journey',{back:true});}else if(s.mode==='ugc')exitGame();else go('cover');}
    else if(action==='prev-scene'){if(s.scene>0){const prev=s.scene-1;loadView(s.mode==='browse'&&!Community.isUgc(city())?'journey':'explore',prev,()=>{s.scene=prev;});}}
    else if(action==='bgm'){const on=SceneBGM.isMuted();SceneBGM.setMuted(!on);b.setAttribute('aria-pressed',String(on));b.innerHTML=icon(on?'sound':'soundOff');const title=SceneBGM.title(s.cityId);toast(on?tr(`背景音乐 · ${title.zh}`,`Music · ${title.en}`):tr('已关闭背景音乐','Music off'));}
    else if(action==='fav'){const on=!s.bookmarks[s.cityId];s.bookmarks[s.cityId]=on;b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',favLabel(on));if(on)playFavoriteSound();}
    else if(action==='next-scene'){if(s.scene<city().scenes.length-1){const next=s.scene+1;loadView(s.mode==='browse'&&!Community.isUgc(city())?'journey':'explore',next,()=>{s.scene=next;s.visited.add(next);});}else if(s.mode==='browse'){if(immersiveJourney())leaveJourney();else go('journey',{back:true});}else beginQuiz();}
    else if(action==='speak'){if(!('speechSynthesis' in window)){toast(tr('当前浏览器不支持朗读','Read aloud isn’t supported in this browser'));return;}const u=new SpeechSynthesisUtterance(modalRoot.querySelector('#clue-text').textContent);u.lang=en()?'en-US':'zh-CN';u.rate=.92;const restore=()=>window.SceneBGM?.duck(clueSheet?'clue':null);u.onstart=()=>window.SceneBGM?.duck('speech');u.onend=restore;u.onerror=()=>{restore();toast(tr('朗读暂不可用','Read aloud is unavailable right now'));};speechSynthesis.cancel();speechSynthesis.speak(u);}
    else if(action==='submit')submitAnswer();
    else if(action==='guess-submit')submitGuess();
    else if(action==='guess-back'){if(s.guessDone){exitGame();return;}if(!s.guessDone&&s.quizRemaining>0&&s.answers.length===3){const last=s.answers.pop();s.q=2;s.selected=last.selected;s.deadline=Date.now()+s.quizRemaining;go('quiz',{back:true});}}
    else if(action==='zoom-in')mapView?.zoomBy(1.7);
    else if(action==='zoom-out')mapView?.zoomBy(1/1.7);
    else if(action==='bookmark'){s.bookmarks[s.cityId]=!s.bookmarks[s.cityId];const y=app.scrollTop;render();app.scrollTop=y;resultReveal?.refresh();}
    else if(action==='claim'&&current().result){
      const score=(s.result||current().result).score;
      if(score<MEDAL_SCORE&&!s.badges[s.cityId])return;
      s.badges[s.cityId]??={date:today()};
      // The badge marks this city in the community feed, so it is kept with the challenge record on this device.
      if(window.TWStore){const id=s.cityId,badge=s.badges[id];TWStore.update(data=>{if(data.challenged?.[id])data.challenged={...data.challenged,[id]:{...data.challenged[id],badge}};});}
      // Keep the expanded result panel and its native scroll state intact.
      b.textContent=tr('查看徽章','View badge');
      sheet(badgeTitle(city()),RewardMedal.markup({city:city(),score,percentile:estimateRewardPercentile(score),date:s.badges[s.cityId].date}),'reward-dialog');
      app.inert=true;previousFocus=b;
    }
    else if(action==='claim-coupon'&&current().result){
      const benefit=benefitFor();
      if(benefitStatus(s.cityId)!=='active')s.benefits[s.cityId]={...benefit,date:today(),expires:datePlusDays(benefit.validDays)};
      const earned=s.benefits[s.cityId];
      b.textContent=tr('查看权益','View perks');
      sheet(benefit.name,benefitDialog(benefit,earned),'coupon-dialog');
      app.inert=true;previousFocus=b;
    }
    else if(action==='share')share();else if(action==='share-challenge')sendChallenge(b);
    else if(action==='save-trip'){s.itineraries[s.cityId]={city:city().name,days:s.days,pace:s.pace,theme:s.theme,date:s.date,route:s.route.map(d=>[...d])};const cn=esc(cname(city()));sheet(tr('路线已保存','Route saved'),`<p>${tr(`${cn} ${s.days} 日路线已保存在本次体验中，刷新页面后会重新开始。`,`Your ${daysLabel(s.days)} ${cn} route is saved for this session. It resets when you reload the page.`)}</p><button class="primary" data-go="itinerary">${tr('查看我的行程','View My Trips')}</button>`);}
    else if(action==='search')go('today');
    else if(action==='home-chip'){const input=app.querySelector('.th-search input');if(input){input.value=b.textContent;input.focus();}}
    else if(action==='home-ai')app.querySelector('.th-search input')?.focus();
    else if(action==='home-search')toast(tr('搜索暂未接入，当前原型仅演示输入','Search isn’t connected yet. This prototype only demonstrates typing.'));
    else if(action==='home-coupon')sheet(tr('旅行好礼','Travel deals'),`<p>${tr('首页优惠为携程界面示例。完成 TripWonder 挑战可领取原型示例权益。','The home page deals are Trip.com UI samples. Finish a TripWonder challenge to claim the prototype’s sample perks.')}</p><button class="primary" data-go="today">${tr('去探索','Start exploring')}</button>`);
    else if(action==='lang'){I18N.toggle();render();toast(tr('已切换为中文','Switched to English'));}
  });
  document.addEventListener('change',event=>{const el=event.target;if(el.matches('.cm-form input[type=file]')){Community.previews(el);return;}if(el.id==='route-pace'){s.pace=el.value;makeRoute();render();}else if(el.id==='route-theme'){s.theme=el.value;makeRoute();render();}else if(el.id==='route-date'){s.date=el.value;s.route=reorderDaysForOpenings(s.route);render();}});
  document.addEventListener('submit',event=>{
    if(event.target.matches('.cm-form')){event.preventDefault();const form=event.target,message=Community.validate(form),error=form.querySelector('.cm-error');error.hidden=!message;error.textContent=message;if(message){error.scrollIntoView({block:'center',behavior:'smooth'});return;}window.UGCService.submit(form).then(record=>{if(!record)return;sheet(tr('已提交审核','Submitted for review'),`<p>${tr(record.backend?'照片与原题已上传后台，审核结果可在「我的发布」查看。':'投稿已保存在本机，可在「本机审核工作台」检查并审核发布。',record.backend?'Your photos and original questions were uploaded. Check My journeys for the review result.':'Saved on this device. Inspect and approve it in Local review.')}</p><button class="primary" data-go="myjourneys">${tr('查看我的发布','My journeys')}</button>`);}).catch(reason=>{error.hidden=false;error.textContent=reason.message;error.scrollIntoView({block:'center'});});return;}
    if(!event.target.matches('.th-search'))return;event.preventDefault();const q=event.target.q.value.trim();q?toast(tr(`搜索「${q}」暂未接入，当前原型仅演示输入`,`Search for “${q}” isn’t connected yet. This prototype only demonstrates typing.`)):event.target.q.focus();});
  document.addEventListener('keydown',event=>{if(!modalRoot.innerHTML)return;if(event.key==='Escape')dismissModal();if(event.key==='Tab'){const f=[...modalRoot.querySelectorAll('button:not(:disabled),a[href],input:not([hidden]):not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');if(!f.length)return;if(event.shiftKey&&(document.activeElement===f[0]||document.activeElement===modalRoot.querySelector('[role="dialog"]'))){event.preventDefault();f.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===f.at(-1)){event.preventDefault();f[0].focus();}}});
  modalRoot.addEventListener('click',event=>{if(event.target.classList.contains('modal-overlay')||event.target.classList.contains('rules-overlay'))dismissModal();});
  window.addEventListener('pagehide',()=>{window.SceneBGM?.pause();cancelPending();SceneMedia.retain([]);viewer?.destroy();window.ImmersiveSceneMedia?.clear();resultReveal?.destroy();window.speechSynthesis?.cancel?.();});
  // One back behaviour for the Android back button and the browser back gesture.
  // Returns false only on the home page, where leaving the prototype is expected.
  const handleBack=()=>{
    if(window.JourneyComments?.close())return true;
    if(document.querySelector('.hp-layer')){HomePromo.dismiss();return true;}
    if(modalRoot.firstElementChild){dismissModal();return true;}
    if(pendingCleanup||ChallengeMotion.busy){cancelPending();ChallengeMotion.cancel();return true;}
    if(s.view==='home')return false;
    const action=s.view==='quiz'?'quiz-back':s.view==='guess'?'guess-back':null;
    if(action){app.querySelector(`[data-action="${action}"]`)?.click();return true;}
    if(s.view==='explore')app.querySelector('[data-action="leave"]')?.click();
    else if(s.view==='cover')app.querySelector('[data-action="leave-cover"]')?.click();
    else if(s.view==='result')app.querySelector('[data-action="result-exit"]')?.click();
    else if(s.view==='journey')leaveJourney();
    else if(s.view==='feed')go(feedResultReturn?'result':'hub',{back:true});
    else if(['publish','myjourneys','ugcreview'].includes(s.view))go('feed',{back:true});
    else if(s.view==='route')go('result',{back:true});
    else if(s.view==='mall')go(s.mallBack,{back:true});
    else go('home',{back:true});
    return true;
  };
  // Capacitor uses the same page navigation and modal dismissal as the website.
  if(window.Capacitor?.isNativePlatform?.())window.TripWonderNativeHooks={isReady:()=>!!app.firstElementChild,toast,back:handleBack};
  else{
    // Progress lives only in this page, so a browser back (iOS swipe, Android back) must not
    // leave the site. Keep a same-URL guard entry above the page and spend it on in-app back
    // steps. Chrome skips entries pushed without a user gesture, so a tap re-arms the guard.
    let guard=0; // 0: none, 1: pushed after a back step, 2: pushed during a tap
    const arm=level=>{if(guard>=level)return;guard=level;try{history.pushState({tripwonderGuard:true},'',location.href);}catch{}};
    document.addEventListener('click',()=>arm(2),true);
    window.addEventListener('popstate',()=>{guard=0;if(handleBack())arm(1);else history.back();});
  }
  window.addEventListener('tw-ugc-navigate',event=>go(event.detail.view));
  window.addEventListener('tw-ugc-updated',()=>{if(['feed','myjourneys','ugcreview'].includes(s.view))render();});
  window.addEventListener('pagehide',()=>{app.querySelector('.cm-form')?._flushUgcDraft?.();persistUgc();});
  if(ugcInvitation){s.journeyId=invitation.cityId;activateCity(invitation.cityId,'ugc');startUgc();}
  else if(invitation)loadView('cover',0);
  else{
    const active=window.TWStore?.get().prefs.ugcActive,saved=active&&window.TWStore.get().ugcProgress?.[active.id];
    if(active&&saved&&cityProgress.has('ugc:'+active.id)&&['explore','quiz','guess','result'].includes(active.view)){
      activateCity(active.id,'ugc');s.view=active.view;
      if(s.view==='explore')loadView('explore',s.scene);else render();
    }else render();
  }
  if(unavailableInvitation)sheet(tr('Journey 暂不可用','Journey unavailable'),'<p>'+tr('此旅程可能尚未发布、已下架，或仅保存在分享者设备。请先导入分享者导出的 Journey 文件，或刷新后重试。','This journey may be unpublished, unavailable, or stored only on the sender’s device. Import their journey file, or refresh and try again.')+'</p><button class="primary" data-go="feed">'+tr('前往社区','Community')+'</button>');
})();
