/* Flat, result-page-aligned atlas and ranking views. State stays in app.js. */
(() => {
  'use strict';

  const photoPositions = {
    datong: '50% 62%', shenzhen: '54% 50%', suzhou: '50% 28%',
    guilin: '50% 50%', hongkong: '50% 50%', beijing: '50% 45%', shanghai: '50% 50%'
  };
  const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>';
  const finiteScore = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  // Atlas: only unlocked (completed) destinations, counted against the whole library.
  const lock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';
  // The medal comes with the result-page reward, which can only be claimed at 80+ points.
  const MEDAL_SCORE = 80;
  function atlas({cities, daily, badges = {}, img, head, esc, back='today'}) {
    const unlocked = cities.filter(city => daily[city.id]?.result);
    const total = cities.length, count = unlocked.length, remaining = total - count;
    const sum = unlocked.reduce((n, city) => n + finiteScore(daily[city.id].result.score), 0);
    const ratio = total ? count / total : 0, ring = 2 * Math.PI * 30;
    const medal = city => window.RewardMedal?.medal ? window.RewardMedal.medal(city) : '';
    const earned = city => !!daily[city.id]?.result && !!badges[city.id];
    const medals = unlocked.filter(earned).length;
    const slots = cities.map(city => {
      const done = !!daily[city.id]?.result;
      const won = done && earned(city);
      return `<li class="atlas-slot${won ? ' is-lit' : done ? ' is-pending' : ''}" aria-label="${won ? `${esc(city.name)}纪念徽章，已获得` : done ? `${esc(city.name)}，已解锁，徽章未领取` : '未解锁目的地'}">${done ? medal(city) : lock}</li>`;
    }).join('');
    const cards = unlocked.map((city, index) => {
      const r = daily[city.id].result, score = finiteScore(r.score);
      const guess = r.guess ? `${finiteScore(r.guess.points)}<small>/40</small>` : '—';
      const quiz = `${finiteScore(r.correct ?? r.answers?.filter(a => a.correct).length)}<small>/3</small>`;
      return `<button class="atlas-card" data-city="${esc(city.id)}" style="--atlas-delay:${index * 60}ms" aria-label="${esc(city.name)}，${esc(city.region)}，${score} 分，查看探索结果">
        <span class="atlas-photo" style="--atlas-position:${photoPositions[city.id] || '50% 50%'}">
          ${img(city.scenes[0].id, city.name)}
          <span class="atlas-photo-copy">${city.region && city.region !== city.name ? `<small>${esc(city.region)}</small>` : ''}<strong>${esc(city.name)}</strong></span>
          ${earned(city) ? `<span class="atlas-medal">${medal(city)}</span>` : score >= MEDAL_SCORE ? `<span class="atlas-medal is-pending is-claimable" aria-hidden="true"><b>待领取</b><small>点击领取徽章</small></span>` : `<span class="atlas-medal is-pending" aria-hidden="true">${lock}<b>${MEDAL_SCORE} 分</b><small>解锁徽章</small></span>`}
        </span>
        <span class="atlas-info">
          <span class="atlas-score"><b>${score}</b><small>分</small></span>
          <span class="atlas-stats"><span><em>地图定位</em><b>${guess}</b></span><span><em>答对</em><b>${quiz}</b></span></span>
        </span>
        ${r.tags?.length ? `<span class="atlas-tags">${r.tags.map(tag => `<i>${esc(tag)}</i>`).join('')}</span>` : ''}
      </button>`;
    }).join('');
    const skeleton = `<div class="atlas-list"><div class="atlas-card atlas-skeleton">
        <span class="atlas-photo"><span class="atlas-skeleton-lock">${lock}<b>尚未解锁</b></span><span class="atlas-medal is-pending" aria-hidden="true">${lock}</span></span>
        <span class="atlas-info"><i class="atlas-bone w1"></i><i class="atlas-bone w2"></i></span>
        <span class="atlas-skeleton-copy"><strong>还没有解锁的目的地</strong><span>完成一次挑战即可点亮第一座城市</span><button data-go="today">去探索 ${arrow}</button></span>
      </div></div>`;
    const more = !count ? ''
      : remaining > 0
      ? `<section class="atlas-more">
          <span class="atlas-more-icon">${lock}</span>
          <strong>还有 ${remaining} 座目的地待解锁</strong>
          <p>完成挑战即可解锁城市<br>得分达到 ${MEDAL_SCORE} 分可领取纪念徽章</p>
          <button data-go="today">去探索 ${arrow}</button>
        </section>`
      : `<section class="atlas-more is-complete"><strong>全部 ${total} 座目的地已解锁</strong><p>徽章已集齐，旅行灵感满格</p></section>`;
    return `<div class="page collection-page atlas-page">
      ${head('目的地图鉴', back)}
      <section class="atlas-summary" aria-label="图鉴进度">
        <div class="atlas-summary-top">
          <div>
            <p>已解锁目的地</p>
            <h1><b>${count}</b><span>/ ${total}</span></h1>
            <small>${count ? `累计探索 ${sum} 分` : '尚未解锁任何目的地'}</small>
          </div>
          <div class="atlas-ring" role="progressbar" aria-label="图鉴完成度" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}">
            <svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30"/><circle class="atlas-ring-value" cx="36" cy="36" r="30" stroke-dasharray="${ring}" stroke-dashoffset="${ring * (1 - ratio)}"/></svg>
            <span>${Math.round(ratio * 100)}<small>%</small></span>
          </div>
        </div>
        <div class="atlas-slots-head"><span>纪念徽章 · ${MEDAL_SCORE} 分可领取</span><span>${medals} / ${total}</span></div>
        <ol class="atlas-slots" style="--slots:${total}">${slots}</ol>
      </section>
      <h2 class="atlas-section-title">我的目的地<span>${count}</span></h2>
      ${count ? `<div class="atlas-list">${cards}</div>` : skeleton}
      ${more}
    </div>`;
  }

  // Ranking: today's score at a glance, my destinations by score, and a friends podium.
  const CITY_MAX = 100;
  const trophy = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5a3 3 0 0 0 3 4m8-4h3a3 3 0 0 1-3 4M12 13v4m-4 3h8m-6-3h4"/></svg>';
  const crown = '<svg viewBox="0 0 32 20" aria-hidden="true"><path d="M3 17 1.5 5l8 5.5L16 1l6.5 9.5 8-5.5L29 17Z"/><circle cx="1.8" cy="4.6" r="1.8"/><circle cx="16" cy="1.8" r="1.8"/><circle cx="30.2" cy="4.6" r="1.8"/></svg>';
  const flag = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4m0 1h11l-2.5 4L17 13H6"/></svg>';
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4 8-9"/></svg>';
  const FRIENDS = [
    {name: '小野', score: 420, cities: 5, hue: 18},
    {name: '景行', score: 370, cities: 4, hue: 160},
    {name: '山间来信', score: 290, cities: 3, hue: 280}
  ];

  function ranking({order, cities, daily, rank, head, esc, img, back='today'}) {
    const lookup = new Map(cities.map(city => [city.id, city]));
    const destinations = order.filter(id => lookup.has(id)).map(id => lookup.get(id));
    const done = destinations.filter(city => daily[city.id]?.result);
    const scoreOf = city => finiteScore(daily[city.id]?.result?.score);
    const total = done.reduce((sum, city) => sum + scoreOf(city), 0);
    const left = destinations.length - done.length;
    const friends = rank === '好友榜' || rank === '演示好友榜';

    // Friends board, always computed so the header can show my place.
    const board = [...FRIENDS, {name: '我', score: total, cities: done.length, mine: true}]
      .sort((a, b) => b.score - a.score || (a.mine ? -1 : b.mine ? 1 : 0));
    const myPlace = board.findIndex(entry => entry.mine) + 1;
    const ahead = board[myPlace - 2], behind = board[myPlace];
    const chase = myPlace === 1
      ? (behind.score === total ? `与「${esc(behind.name)}」同分，暂列第一` : `领先第 2 名「${esc(behind.name)}」${total - behind.score} 分`)
      : `距第 ${myPlace - 1} 名「${esc(ahead.name)}」还差 ${ahead.score - total} 分`;
    const avatar = (entry, size = '') => `<span class="rk-avatar${size}${entry.mine ? ' is-mine' : ''}" style="--rk-hue:${entry.hue ?? 224}" aria-hidden="true">${esc(entry.name.slice(0, 1))}</span>`;
    const you = entry => entry.mine ? '<span class="rk-you">你</span>' : '';

    const trail = destinations.map((city, index) => {
      const lit = !!daily[city.id]?.result;
      return `<li class="${lit ? 'is-lit' : ''}" style="--rk-i:${index}"><span>${lit ? scoreOf(city) : lock}</span><small>${lit ? esc(city.name) : '待解锁'}</small></li>`;
    }).join('');

    const hero = `<section class="rk-hero" aria-label="今日成绩">
        <div class="rk-hero-top"><span>今日累计得分</span><span class="rk-hero-chip">${trophy}好友第 ${myPlace} 名</span></div>
        <h1><b>${total}</b><span>分</span><small>/ ${destinations.length * CITY_MAX}</small></h1>
        <p class="rk-hero-note">${done.length ? chase : '完成第一座城，开始今日积分'}</p>
        <ol class="rk-trail" style="--rk-n:${destinations.length}" aria-label="已完成 ${done.length} / ${destinations.length} 座城">${trail}</ol>
        <p class="rk-hero-foot">每城满分 ${CITY_MAX} · 地图定位 40 + 三题 60</p>
      </section>`;

    const tabs = [['今日', '今日战绩'], ['好友榜', '好友排行']].map(([value, label]) => {
      const on = friends === (value === '好友榜');
      return `<button data-rank="${value}" role="tab" aria-selected="${on}" aria-controls="rk-panel" class="${on ? 'active' : ''}">${label}</button>`;
    }).join('');

    // A destination is revealed only after a completed challenge, including a zero score.
    const sorted = [...done].sort((a, b) => scoreOf(b) - scoreOf(a));
    const cityRows = sorted.map((city, index) => {
      const r = daily[city.id]?.result, score = scoreOf(city);
      const thumb = img ? img(city.scenes[0].id, '') : `<span class="rk-thumb-fallback">${esc(city.name.slice(0, 1))}</span>`;
      const guess = r.guess ? finiteScore(r.guess.points) : 0;
      const quiz = finiteScore(r.correct ?? r.answers?.filter(a => a.correct).length);
      return `<li style="--rk-i:${index}"><button class="rk-city" data-city="${esc(city.id)}" aria-label="第 ${index + 1} 名，${esc(city.name)}，${score} 分，查看探索结果">
          <span class="rk-thumb">${thumb}<b class="rk-place-badge p${Math.min(index + 1, 4)}">${index + 1}</b></span>
          <span class="rk-city-copy"><strong>${esc(city.name)}</strong><small>定位 ${guess}/40 · 答对 ${quiz}/3</small><i class="rk-bar"><i style="--rk-fill:${Math.min(score, CITY_MAX) / CITY_MAX}"></i></i></span>
          <span class="rk-city-score"><b>${score}</b><small>分</small></span>
        </button></li>`;
    }).join('');
    const unlock = left ? `<section class="rk-unlock">
        <span class="rk-unlock-icon">${lock}</span>
        <strong>${done.length ? `还有 ${left} 个目的地待解锁` : '还没有解锁的目的地'}</strong>
        <p>完成挑战后，目的地将在这里揭晓</p>
        <button data-go="today">${done.length ? '继续探索' : '去探索'}${arrow}</button>
      </section>` : '';
    const today = `<div class="rk-caption"><strong>已解锁目的地</strong><span>已完成 ${done.length} / ${destinations.length}</span></div>
      ${cityRows ? `<ol class="rk-cities">${cityRows}</ol>` : ''}${unlock}`;

    // Friends: a three-step podium, the rest as rows, then what it takes to move up.
    const podium = board.slice(0, 3).map((entry, index) => `<li class="rk-step p${index + 1}${entry.mine ? ' is-mine' : ''}" style="--rk-i:${[1, 0, 2][index]}" aria-label="第 ${index + 1} 名，${esc(entry.name)}${entry.mine ? '（你）' : ''}，${entry.score} 分">
        ${index === 0 ? `<i class="rk-crown">${crown}</i>` : ''}
        ${avatar(entry, index === 0 ? ' lg' : '')}
        <strong>${esc(entry.name)}${you(entry)}</strong>
        <b>${entry.score}<small>分</small></b>
        <span class="rk-block"><em>${index + 1}</em><small>${entry.cities} 城</small></span>
      </li>`).join('');
    const rows = board.slice(3).map((entry, index) => {
      const prev = board[index + 2];
      return `<li class="rk-row${entry.mine ? ' is-mine' : ''}" style="--rk-i:${index + 3}">
        <span class="rk-no">${index + 4}</span>
        ${avatar(entry, ' sm')}
        <span class="rk-row-name"><strong>${esc(entry.name)}${you(entry)}</strong><small>完成 ${entry.cities} 城</small></span>
        <span class="rk-row-score"><b>${entry.score}<small>分</small></b><em>差上一名 ${prev.score - entry.score}</em></span>
      </li>`;
    }).join('');
    const target = myPlace > 1 ? ahead : null;
    const cta = target
      ? `<section class="rk-chase">
          <span class="rk-chase-icon">${flag}</span>
          <span class="rk-chase-copy"><strong>再得 <b>${target.score - total}</b> 分，超越${esc(target.name)}</strong><small>${left ? `今日还有 ${left} 座城可挑战，最多 +${left * CITY_MAX} 分` : '今日挑战已全部完成，明天再来反超'}</small></span>
          ${left ? `<button data-go="today">去挑战</button>` : ''}
        </section>`
      : `<section class="rk-chase is-top"><span class="rk-chase-icon">${check}</span><span class="rk-chase-copy"><strong>你是今日好友第一</strong><small>${left ? `还有 ${left} 座城可挑战，继续拉开差距` : '今日挑战全部完成，稳坐榜首'}</small></span></section>`;
    const friendsPanel = `<div class="rk-caption"><strong>好友今日得分</strong><span>每日 0 点刷新</span></div>
      <ol class="rk-podium">${podium}</ol>
      ${rows ? `<ol class="rk-rows" start="4">${rows}</ol>` : ''}
      ${cta}`;

    return `<div class="page collection-page ranking-page rk-page">
      ${head('探索榜单', back)}
      ${hero}
      <div class="rk-tabs" role="tablist" aria-label="排行榜类型">${tabs}</div>
      <section class="rk-panel" id="rk-panel" role="tabpanel" aria-label="${friends ? '好友排行' : '今日战绩'}">${friends ? friendsPanel : today}</section>
    </div>`;
  }

  window.CollectionPages = Object.freeze({atlas, ranking});
})();
