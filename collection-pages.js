/* Flat, result-page-aligned atlas and ranking views. State stays in app.js. */
(() => {
  'use strict';

  const photoPositions = {
    datong: '50% 62%', shenzhen: '54% 50%', suzhou: '50% 28%',
    guilin: '50% 50%', hongkong: '50% 50%', beijing: '50% 45%', shanghai: '50% 50%'
  };
  const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>';
  const {t, f, term} = window.I18N, name = item => f(item, 'name');
  const pts = n => t(`${n} 分`, n === 1 ? '1 pt' : `${n} pts`);
  const ordinal = n => { const suffix = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]); };
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
      return `<li class="atlas-slot${won ? ' is-lit' : done ? ' is-pending' : ''}" aria-label="${won ? t(`${esc(city.name)}纪念徽章，已获得`, `${esc(name(city))} badge, earned`) : done ? t(`${esc(city.name)}，已解锁，徽章未领取`, `${esc(name(city))}, unlocked, badge not claimed`) : t('未解锁目的地', 'Locked destination')}">${done ? medal(city) : lock}</li>`;
    }).join('');
    const cards = unlocked.map((city, index) => {
      const r = daily[city.id].result, score = finiteScore(r.score);
      const guess = r.guess ? `${finiteScore(r.guess.points)}<small>/40</small>` : '—';
      const quiz = `${finiteScore(r.correct ?? r.answers?.filter(a => a.correct).length)}<small>/3</small>`;
      return `<button class="atlas-card" data-city="${esc(city.id)}" style="--atlas-delay:${index * 60}ms" aria-label="${t(`${esc(city.name)}，${esc(city.region)}，${score} 分，查看探索结果`, `${esc(name(city))}, ${esc(f(city, 'region'))}, ${score} points. View result`)}">
        <span class="atlas-photo" style="--atlas-position:${photoPositions[city.id] || '50% 50%'}">
          ${img(city.scenes[0].id, name(city))}
          <span class="atlas-photo-copy">${city.region && city.region !== city.name ? `<small>${esc(f(city, 'region'))}</small>` : ''}<strong>${esc(name(city))}</strong></span>
          ${earned(city) ? `<span class="atlas-medal">${medal(city)}</span>` : score >= MEDAL_SCORE ? `<span class="atlas-medal is-pending is-claimable" aria-hidden="true"><b>${t('待领取', 'Ready')}</b><small>${t('点击领取徽章', 'Tap to claim badge')}</small></span>` : `<span class="atlas-medal is-pending" aria-hidden="true">${lock}<b>${pts(MEDAL_SCORE)}</b><small>${t('解锁徽章', 'unlocks badge')}</small></span>`}
        </span>
        <span class="atlas-info">
          <span class="atlas-score"><b>${score}</b><small>${t('分', 'pts')}</small></span>
          <span class="atlas-stats"><span><em>${t('地图定位', 'Map guess')}</em><b>${guess}</b></span><span><em>${t('答对', 'Correct')}</em><b>${quiz}</b></span></span>
        </span>
        ${r.tags?.length ? `<span class="atlas-tags">${r.tags.map(tag => `<i>${esc(term(tag))}</i>`).join('')}</span>` : ''}
      </button>`;
    }).join('');
    const skeleton = `<div class="atlas-list"><div class="atlas-card atlas-skeleton">
        <span class="atlas-photo"><span class="atlas-skeleton-lock">${lock}<b>${t('尚未解锁', 'Locked')}</b></span><span class="atlas-medal is-pending" aria-hidden="true">${lock}</span></span>
        <span class="atlas-info"><i class="atlas-bone w1"></i><i class="atlas-bone w2"></i></span>
        <span class="atlas-skeleton-copy"><strong>${t('还没有解锁的目的地', 'No destinations unlocked yet')}</strong><span>${t('完成一次挑战即可点亮第一座城市', 'Finish a challenge to unlock your first city')}</span><button data-go="today">${t('去探索', 'Explore')} ${arrow}</button></span>
      </div></div>`;
    const more = !count ? ''
      : remaining > 0
      ? `<section class="atlas-more">
          <span class="atlas-more-icon">${lock}</span>
          <strong>${t(`还有 ${remaining} 座目的地待解锁`, remaining === 1 ? '1 more destination to unlock' : `${remaining} more destinations to unlock`)}</strong>
          <p>${t(`完成挑战即可解锁城市<br>得分达到 ${MEDAL_SCORE} 分可领取纪念徽章`, `Finish a challenge to unlock a city<br>Score ${MEDAL_SCORE}+ to claim its badge`)}</p>
          <button data-go="today">${t('去探索', 'Explore')} ${arrow}</button>
        </section>`
      : `<section class="atlas-more is-complete"><strong>${t(`全部 ${total} 座目的地已解锁`, `All ${total} destinations unlocked`)}</strong><p>${t('徽章已集齐，旅行灵感满格', 'Every badge collected. Your travel inspiration is full.')}</p></section>`;
    return `<div class="page collection-page atlas-page">
      ${head(t('目的地图鉴', 'Destination atlas'), back)}
      <section class="atlas-summary" aria-label="${t('图鉴进度', 'Atlas progress')}">
        <div class="atlas-summary-top">
          <div>
            <p>${t('已解锁目的地', 'Destinations unlocked')}</p>
            <h1><b>${count}</b><span>/ ${total}</span></h1>
            <small>${count ? t(`累计探索 ${sum} 分`, `${sum} points in total`) : t('尚未解锁任何目的地', 'No destinations unlocked yet')}</small>
          </div>
          <div class="atlas-ring" role="progressbar" aria-label="${t('图鉴完成度', 'Atlas completion')}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}">
            <svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30"/><circle class="atlas-ring-value" cx="36" cy="36" r="30" stroke-dasharray="${ring}" stroke-dashoffset="${ring * (1 - ratio)}"/></svg>
            <span>${Math.round(ratio * 100)}<small>%</small></span>
          </div>
        </div>
        <div class="atlas-slots-head"><span>${t(`纪念徽章 · ${MEDAL_SCORE} 分可领取`, `Badges · claim at ${MEDAL_SCORE}+ points`)}</span><span>${medals} / ${total}</span></div>
        <ol class="atlas-slots" style="--slots:${total}">${slots}</ol>
      </section>
      <h2 class="atlas-section-title">${t('已挑战', 'Challenged')}<span>${count}</span></h2>
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
    {name: '小野', nameEn: 'Nova', score: 420, cities: 5, hue: 18},
    {name: '景行', nameEn: 'Kai', score: 370, cities: 4, hue: 160},
    {name: '山间来信', nameEn: 'Hillside Letters', score: 290, cities: 3, hue: 280}
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
    const board = [...FRIENDS, {name: '我', nameEn: 'Me', score: total, cities: done.length, mine: true}]
      .sort((a, b) => b.score - a.score || (a.mine ? -1 : b.mine ? 1 : 0));
    const myPlace = board.findIndex(entry => entry.mine) + 1;
    const ahead = board[myPlace - 2], behind = board[myPlace];
    const chase = myPlace === 1
      ? (behind.score === total ? t(`与「${esc(behind.name)}」同分，暂列第一`, `Tied with ${esc(name(behind))} for 1st place`) : t(`领先第 2 名「${esc(behind.name)}」${total - behind.score} 分`, `${total - behind.score} points ahead of ${esc(name(behind))} in 2nd`))
      : t(`距第 ${myPlace - 1} 名「${esc(ahead.name)}」还差 ${ahead.score - total} 分`, `${ahead.score - total} points behind ${esc(name(ahead))} in ${ordinal(myPlace - 1)}`);
    const avatar = (entry, size = '') => `<span class="rk-avatar${size}${entry.mine ? ' is-mine' : ''}" style="--rk-hue:${entry.hue ?? 224}" aria-hidden="true">${esc(name(entry).slice(0, 1))}</span>`;
    const you = entry => entry.mine ? `<span class="rk-you">${t('你', 'You')}</span>` : '';

    const trail = destinations.map((city, index) => {
      const lit = !!daily[city.id]?.result;
      return `<li class="${lit ? 'is-lit' : ''}" style="--rk-i:${index}"><span>${lit ? scoreOf(city) : lock}</span><small>${lit ? esc(name(city)) : t('待解锁', 'Locked')}</small></li>`;
    }).join('');

    const hero = `<section class="rk-hero" aria-label="${t('今日成绩', 'Today’s scores')}">
        <div class="rk-hero-top"><span>${t('今日累计得分', 'Today’s total')}</span><span class="rk-hero-chip">${trophy}${t(`好友第 ${myPlace} 名`, `${ordinal(myPlace)} among friends`)}</span></div>
        <h1><b>${total}</b><span>${t('分', 'pts')}</span><small>/ ${destinations.length * CITY_MAX}</small></h1>
        <p class="rk-hero-note">${done.length ? chase : t('完成第一座城，开始今日积分', 'Finish your first city to start today’s tally')}</p>
        <ol class="rk-trail" style="--rk-n:${destinations.length}" aria-label="${t(`已完成 ${done.length} / ${destinations.length} 座城`, `${done.length} of ${destinations.length} cities done`)}">${trail}</ol>
        <p class="rk-hero-foot">${t(`每城满分 ${CITY_MAX} · 地图定位 40 + 三题 60`, `Up to ${CITY_MAX} per city · map guess 40 + three questions 60`)}</p>
      </section>`;

    const tabs = [['今日', t('今日战绩', 'Today')], ['好友榜', t('好友排行', 'Friends')]].map(([value, label]) => {
      const on = friends === (value === '好友榜');
      return `<button data-rank="${value}" role="tab" aria-selected="${on}" aria-controls="rk-panel" class="${on ? 'active' : ''}">${label}</button>`;
    }).join('');

    // A destination is revealed only after a completed challenge, including a zero score.
    const sorted = [...done].sort((a, b) => scoreOf(b) - scoreOf(a));
    const cityRows = sorted.map((city, index) => {
      const r = daily[city.id]?.result, score = scoreOf(city);
      const thumb = img ? img(city.scenes[0].id, '') : `<span class="rk-thumb-fallback">${esc(name(city).slice(0, 1))}</span>`;
      const guess = r.guess ? finiteScore(r.guess.points) : 0;
      const quiz = finiteScore(r.correct ?? r.answers?.filter(a => a.correct).length);
      return `<li style="--rk-i:${index}"><button class="rk-city" data-city="${esc(city.id)}" aria-label="${t(`第 ${index + 1} 名，${esc(city.name)}，${score} 分，查看探索结果`, `${ordinal(index + 1)}: ${esc(name(city))}, ${score} points. View result`)}">
          <span class="rk-thumb">${thumb}<b class="rk-place-badge p${Math.min(index + 1, 4)}">${index + 1}</b></span>
          <span class="rk-city-copy"><strong>${esc(name(city))}</strong><small>${t(`定位 ${guess}/40 · 答对 ${quiz}/3`, `Map ${guess}/40 · Correct ${quiz}/3`)}</small><i class="rk-bar"><i style="--rk-fill:${Math.min(score, CITY_MAX) / CITY_MAX}"></i></i></span>
          <span class="rk-city-score"><b>${score}</b><small>${t('分', 'pts')}</small></span>
        </button></li>`;
    }).join('');
    const unlock = left ? `<section class="rk-unlock">
        <span class="rk-unlock-icon">${lock}</span>
        <strong>${done.length ? t(`还有 ${left} 个目的地待解锁`, left === 1 ? '1 more destination to unlock' : `${left} more destinations to unlock`) : t('还没有解锁的目的地', 'No destinations unlocked yet')}</strong>
        <p>${t('完成挑战后，目的地将在这里揭晓', 'Finish a challenge and the destination is revealed here')}</p>
        <button data-go="today">${done.length ? t('继续探索', 'Keep exploring') : t('去探索', 'Explore')}${arrow}</button>
      </section>` : '';
    const today = `<div class="rk-caption"><strong>${t('已解锁目的地', 'Unlocked destinations')}</strong><span>${t(`已完成 ${done.length} / ${destinations.length}`, `${done.length} / ${destinations.length} done`)}</span></div>
      ${cityRows ? `<ol class="rk-cities">${cityRows}</ol>` : ''}${unlock}`;

    // Friends: a three-step podium, the rest as rows, then what it takes to move up.
    const podium = board.slice(0, 3).map((entry, index) => `<li class="rk-step p${index + 1}${entry.mine ? ' is-mine' : ''}" style="--rk-i:${[1, 0, 2][index]}" aria-label="${t(`第 ${index + 1} 名，${esc(entry.name)}${entry.mine ? '（你）' : ''}，${entry.score} 分`, `${ordinal(index + 1)}: ${esc(name(entry))}${entry.mine ? ' (you)' : ''}, ${entry.score} points`)}">
        ${index === 0 ? `<i class="rk-crown">${crown}</i>` : ''}
        ${avatar(entry, index === 0 ? ' lg' : '')}
        <strong>${esc(name(entry))}${you(entry)}</strong>
        <b>${entry.score}<small>${t('分', 'pts')}</small></b>
        <span class="rk-block"><em>${index + 1}</em><small>${t(`${entry.cities} 城`, `${entry.cities} cities`)}</small></span>
      </li>`).join('');
    const rows = board.slice(3).map((entry, index) => {
      const prev = board[index + 2];
      return `<li class="rk-row${entry.mine ? ' is-mine' : ''}" style="--rk-i:${index + 3}">
        <span class="rk-no">${index + 4}</span>
        ${avatar(entry, ' sm')}
        <span class="rk-row-name"><strong>${esc(name(entry))}${you(entry)}</strong><small>${t(`完成 ${entry.cities} 城`, `${entry.cities} cities done`)}</small></span>
        <span class="rk-row-score"><b>${entry.score}<small>${t('分', 'pts')}</small></b><em>${t(`差上一名 ${prev.score - entry.score}`, `${prev.score - entry.score} behind next`)}</em></span>
      </li>`;
    }).join('');
    const target = myPlace > 1 ? ahead : null;
    const cta = target
      ? `<section class="rk-chase">
          <span class="rk-chase-icon">${flag}</span>
          <span class="rk-chase-copy"><strong>${t(`再得 <b>${target.score - total}</b> 分，超越${esc(target.name)}`, `Score <b>${target.score - total}</b> more to pass ${esc(name(target))}`)}</strong><small>${left ? t(`今日还有 ${left} 座城可挑战，最多 +${left * CITY_MAX} 分`, `${left} ${left === 1 ? 'city' : 'cities'} left today, worth up to +${left * CITY_MAX} points`) : t('今日挑战已全部完成，明天再来反超', 'All of today’s challenges are done. Come back tomorrow to catch up.')}</small></span>
          ${left ? `<button data-go="today">${t('去挑战', 'Play')}</button>` : ''}
        </section>`
      : `<section class="rk-chase is-top"><span class="rk-chase-icon">${check}</span><span class="rk-chase-copy"><strong>${t('你是今日好友第一', 'You’re top among friends today')}</strong><small>${left ? t(`还有 ${left} 座城可挑战，继续拉开差距`, `${left} ${left === 1 ? 'city' : 'cities'} left to widen your lead`) : t('今日挑战全部完成，稳坐榜首', 'All of today’s challenges are done. The top spot is yours.')}</small></span></section>`;
    const friendsPanel = `<div class="rk-caption"><strong>${t('好友今日得分', 'Friends’ scores today')}</strong><span>${t('每日 0 点刷新', 'Resets daily at midnight')}</span></div>
      <ol class="rk-podium">${podium}</ol>
      ${rows ? `<ol class="rk-rows" start="4">${rows}</ol>` : ''}
      ${cta}`;

    return `<div class="page collection-page ranking-page rk-page">
      ${head(t('探索榜单', 'Leaderboard'), back)}
      ${hero}
      <div class="rk-tabs" role="tablist" aria-label="${t('排行榜类型', 'Leaderboard type')}">${tabs}</div>
      <section class="rk-panel" id="rk-panel" role="tabpanel" aria-label="${friends ? t('好友排行', 'Friends') : t('今日战绩', 'Today')}">${friends ? friendsPanel : today}</section>
    </div>`;
  }

  window.CollectionPages = Object.freeze({atlas, ranking});
})();
