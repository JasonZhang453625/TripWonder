/* Simulated PK: a matched opponent plays the same destination on a seeded timeline (same city + day + opponent
   = same match), scored with the player's own rules. A friend's challenge link turns the friend into the
   opponent, with a timeline rebuilt to land exactly on the shared score. Nothing is sent anywhere. */
(() => {
  'use strict';
  const t = (zh, en) => window.I18N.t(zh, en), f = (item, key) => window.I18N.f(item, key);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const LEVELS = {
    rookie: {zh: '新手', en: 'Rookie', accuracy: .5, perQuestion: 17, medianKm: 420},
    expert: {zh: '达人', en: 'Explorer', accuracy: .7, perQuestion: 13, medianKm: 160},
    master: {zh: '学霸', en: 'Mastermind', accuracy: .86, perQuestion: 9, medianKm: 45}
  };
  // Fictional players; every match says it is simulated.
  const PLAYERS = [
    {id: 'whale', name: '云游的鲸', nameEn: 'Drifting Whale', hue: 200},
    {id: 'qing', name: '阿青', nameEn: 'Ah Qing', hue: 150},
    {id: 'leo', name: '背包客Leo', nameEn: 'Backpacker Leo', hue: 25},
    {id: 'sunny', name: '晴天打卡', nameEn: 'Sunny Snaps', hue: 45},
    {id: 'breeze', name: '路过的风', nameEn: 'Passing Breeze', hue: 265},
    {id: 'hillsea', name: '山海旅人', nameEn: 'Hill & Sea', hue: 340}
  ].map((player, index) => ({...player, avatar: `assets/community/user-${index % 4 + 2}.jpg`}));
  const hash = str => [...str].reduce((n, char) => Math.imul(n ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
  function random(seed) { let n = hash(seed) || 1; return () => { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return (n >>> 0) / 4294967296; }; }
  const gauss = rnd => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());

  // A point km away from the destination, leaning inland so the pin lands on the map rather than at sea.
  function offsetPoint(city, km, rnd) {
    const toCentre = Math.atan2(108 - city.lng, 34 - city.lat), bearing = toCentre + (rnd() - .5) * 2.1;
    const lat = city.lat + km / 111 * Math.cos(bearing), lng = city.lng + km / (111 * Math.cos(city.lat * Math.PI / 180)) * Math.sin(bearing);
    return {lat: Math.max(19, Math.min(52, lat)), lng: Math.max(76, Math.min(133, lng))};
  }
  function timeline(rnd, level, count, duration) {
    let at = 0;
    return Array.from({length: count}, () => { at += Math.max(3, LEVELS[level].perQuestion * (.65 + rnd() * .7)) * 1000; return Math.min(at, duration - 1500); });
  }

  // points: the quiz points per question; guessScore(km): the destination's own map scoring.
  function create({city, day, points, guessScore, guessMax, duration, invitation = null}) {
    const rnd = random(`${city.id}|${day}|${invitation ? 'friend' + invitation.score : 'pk'}`);
    let opponent, correct, km;
    if (invitation) {
      // Rebuild a plausible round for the shared total: as many right answers as fit, the rest from the map.
      const n = Math.min(points.length, Math.floor(invitation.score / points[0]));
      const mapPoints = Math.min(guessMax, invitation.score - points.slice(0, n).reduce((a, b) => a + b, 0));
      correct = points.map((_, i) => i < n); for (let i = correct.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [correct[i], correct[j]] = [correct[j], correct[i]]; }
      km = 5; while (guessScore(km) > mapPoints && km < 6000) km += 5;
      opponent = {id: 'friend', name: '好友', nameEn: 'Your friend', hue: 220, level: 'expert', friend: true};
    } else {
      const player = PLAYERS[Math.floor(rnd() * PLAYERS.length)], roll = rnd();
      const level = roll < .3 ? 'rookie' : roll < .75 ? 'expert' : 'master';
      opponent = {...player, level, friend: false};
      correct = points.map(() => rnd() < LEVELS[level].accuracy);
      km = Math.max(3, Math.round(LEVELS[level].medianKm * Math.exp(.75 * gauss(rnd))));
    }
    const answers = timeline(rnd, opponent.level, points.length, duration).map((at, i) => ({at, correct: correct[i]}));
    const quiz = answers.reduce((sum, a, i) => sum + (a.correct ? points[i] : 0), 0), guessPoints = guessScore(km);
    return {opponent, answers, quiz, guess: {km, points: guessPoints, ...offsetPoint(city, km, rnd)}, score: quiz + guessPoints, seen: 0, duration};
  }

  // Reuse the five local community portraits. My comments and PK share user-1.
  const avatar = (who, me = false) => {
    const player=PLAYERS.find(p=>p.id===who?.id);
    const src=me?'assets/community/user-1.jpg':player?.avatar||`assets/community/user-${hash(who?.id||who?.name||'friend')%4+2}.jpg`;
    return `<span class="pk-avatar${me?' me':''}" aria-hidden="true"><img src="${src}" alt="" width="64" height="64" decoding="async" draggable="false"></span>`;
  };
  const dots = (done, total, current = -1) => `<span class="pk-dots">${Array.from({length: total}, (_, i) => `<i class="${i < done ? 'done' : i === current ? 'current' : ''}"></i>`).join('')}</span>`;
  const levelName = o => o.friend ? t('好友', 'Friend') : t(LEVELS[o.level].zh, LEVELS[o.level].en);

  // Quiz header: the player's progress against the opponent's. Correctness is never shown before the result.
  function hud(pk, {mine, total, elapsed}) {
    const theirs = pk.answers.filter(a => a.at <= elapsed).length;
    return `<div class="pk-hud" role="group" aria-label="${esc(t(`我的答题进度 ${mine}/${total}，${f(pk.opponent, 'name')} ${theirs}/${total}`,`My progress ${mine}/${total}, ${f(pk.opponent, 'name')} ${theirs}/${total}`))}">${avatar(null, true)}${dots(mine, total, mine)}<b class="pk-vs">VS</b><span class="pk-rival">${dots(theirs, total)}${avatar(pk.opponent)}</span></div>`;
  }
  function update(page, pk, {mine, total, elapsed}) {
    const root = page?.querySelector('.pk-hud');
    if (!root) return;
    const theirs = pk.answers.filter(a => a.at <= elapsed).length;
    root.setAttribute('aria-label',t(`我的答题进度 ${mine}/${total}，${f(pk.opponent, 'name')} ${theirs}/${total}`,`My progress ${mine}/${total}, ${f(pk.opponent, 'name')} ${theirs}/${total}`));
    root.querySelectorAll(':scope > .pk-dots i').forEach((dot, i) => { dot.classList.toggle('done', i < mine); dot.classList.toggle('current', i === mine); });
    root.querySelectorAll('.pk-rival .pk-dots i').forEach((dot, i) => dot.classList.toggle('done', i < theirs));
    if (theirs > pk.seen) {
      pk.seen = theirs;
      const ping = document.createElement('div');
      ping.className = 'pk-ping'; ping.setAttribute('role', 'status');
      ping.textContent = theirs >= total ? t(`${f(pk.opponent, 'name')} 已答完，正在地图定位`, `${f(pk.opponent, 'name')} has finished and is on the map`) : t(`${f(pk.opponent, 'name')} 已作答第 ${theirs} 题`, `${f(pk.opponent, 'name')} answered question ${theirs}`);
      page.querySelector('.pk-ping')?.remove();
      page.append(ping);
      root.querySelector('.pk-rival')?.classList.remove('bump'); void root.offsetWidth; root.querySelector('.pk-rival')?.classList.add('bump');
      setTimeout(() => ping.remove(), 1900);
    }
  }

  // Short matchmaking moment before exploring. Tap anywhere to skip.
  function match(phone, pk) {
    return new Promise(resolve => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, o = pk.opponent;
      const layer = document.createElement('div');
      layer.className = 'pk-match'; layer.setAttribute('role', 'status');
      const previousInert=phone.querySelector('#app')?.inert;
      if(phone.querySelector('#app'))phone.querySelector('#app').inert=true;
      const reel = PLAYERS.map(p => avatar(p)).join('');
      layer.innerHTML = `<div class="pk-match-card"><span class="pk-match-title">${o.friend ? t('好友挑战', 'Friend challenge') : t('正在匹配对手…', 'Finding an opponent…')}</span><div class="pk-match-row"><div class="pk-match-side">${avatar(null, true)}<b>${t('我', 'Me')}</b></div><b class="pk-vs big">VS</b><div class="pk-match-side rival"><span class="pk-reel">${o.friend ? '' : reel}</span>${avatar(o)}<b>${esc(f(o, 'name'))}</b><small>${levelName(o)}</small></div></div><p>${o.friend ? t('好友的成绩已就位，同一目的地，看谁更高分。', 'Your friend’s score is in. Same destination: who scores higher?') : t('同一目的地 · 同样计分 · 模拟对手', 'Same destination · same scoring · simulated opponent')}</p></div>`;
      phone.append(layer);
      let done = false;
      const finish = () => { if (done) return; done = true; layer.classList.add('leaving'); setTimeout(() => { layer.remove(); if(phone.querySelector('#app'))phone.querySelector('#app').inert=!!previousInert; resolve(); }, reduced ? 0 : 260); };
      layer.addEventListener('click', finish);
      requestAnimationFrame(() => layer.classList.add('shown'));
      setTimeout(() => layer.classList.add('locked'), reduced || o.friend ? 0 : 1100);
      setTimeout(finish, reduced ? 700 : 2300);
    });
  }

  function settle(pk, result, quizElapsed) {
    const outcome = result.score > pk.score ? 'win' : result.score < pk.score ? 'lose' : 'tie';
    return {opponent: pk.opponent, returnCityId: pk.returnCityId, outcome, score: pk.score, quiz: pk.quiz, guess: pk.guess, correct: pk.answers.filter(a => a.correct).length, time: Math.round(pk.answers.at(-1).at / 1000), myTime: Math.round(quizElapsed / 1000)};
  }

  function resultCard(summary, result, {rewards=true} = {}) {
    if (!summary) return '';
    const o = summary.opponent, label = {win: t('胜利', 'Victory'), lose: t('惜败', 'Defeat'), tie: t('平局', 'Draw')}[summary.outcome];
    const row = (name, mine, theirs, better) => `<div class="pk-row"><b class="${better === 1 ? 'lead' : ''}">${mine}</b><span>${name}</span><b class="${better === -1 ? 'lead' : ''}">${theirs}</b></div>`;
    const cmp = (a, b) => Math.sign(a - b);
    return `<section class="content-card pk-result ${summary.outcome}" aria-label="${t('PK 结果', 'PK result')}">
      <div class="pk-result-top"><span class="pk-stamp">${label}</span>${o.friend?`<span class="tw-sample">${t('好友挑战 · 本地比对', 'Friend challenge · compared on this device')}</span>`:''}</div>
      <div class="pk-versus"><div class="pk-player">${avatar(null, true)}<b>${result.score}</b><small>${t('我', 'Me')}</small></div><b class="pk-vs big">VS</b><div class="pk-player">${avatar(o)}<b>${summary.score}</b><small>${esc(f(o, 'name'))} · ${levelName(o)}</small></div></div>
      <div class="pk-rows">${row(t('线索答题', 'Clue quiz'), result.quiz, summary.quiz, cmp(result.quiz, summary.quiz))}${row(t('地图定位', 'Map guess'), result.guess?.points ?? 0, summary.guess.points, cmp(result.guess?.points ?? 0, summary.guess.points))}${row(t('落点距离', 'Pin distance'), `${result.guess?.km ?? '—'} km`, `${summary.guess.km} km`, cmp(summary.guess.km, result.guess?.km ?? Infinity))}${row(t('答题用时', 'Quiz time'), `${summary.myTime}s`, `${summary.time}s`, cmp(summary.time, summary.myTime))}</div>
      ${!rewards || summary.outcome === 'lose' ? '' : `<p class="pk-bonus">${t(`PK ${summary.outcome === 'win' ? '获胜' : '打平'}奖励：每个目的地每天首次 +${summary.outcome === 'win' ? 10 : 3} 奇境币`, `PK ${summary.outcome === 'win' ? 'win' : 'draw'} bonus: +${summary.outcome === 'win' ? 10 : 3} coins, first time per destination each day`)}</p>`}
    </section>`;
  }

  function pickJourney(journeys,lastId=null) {
    const approved=journeys.filter(j=>j.channel==='ugc'&&j.review==='approved'&&j.scenes?.length>=3&&j.scenes.length<=9&&j.scenes.every(s=>s.photo)&&j.questions?.length===3);
    const fresh=approved.filter(j=>j.id!==lastId),pool=fresh.length?fresh:approved;
    return pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
  }
  window.PKMode = Object.freeze({pickJourney,create, hud, update, match, settle, resultCard, avatar});
})();
