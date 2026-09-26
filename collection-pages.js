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

  function ranking({order, cities, daily, rank, head, esc, back='today'}) {
    const lookup = new Map(cities.map(city => [city.id, city]));
    const destinations = order.filter(id => lookup.has(id));
    const done = destinations.filter(id => daily[id]?.result);
    const total = done.reduce((sum, id) => sum + finiteScore(daily[id].result.score), 0);
    const friends = rank === '好友榜' || rank === '演示好友榜';
    const activeRank = friends ? '好友榜' : '今日';
    const entries = (friends ? [
      {name: '小野', score: 420},
      {name: '景行', score: 370},
      {name: '我', score: total, mine: true},
      {name: '山间来信', score: 290}
    ] : done.map(id => ({name: lookup.get(id).name, score: finiteScore(daily[id].result.score)})))
      .sort((a, b) => b.score - a.score);
    const podium = entries.slice(0, 3);
    const badge = entry => entry.mine ? '<span class="collection-mine-label">你</span>' : '';
    const podiumCards = podium.map((entry, index) => `<li class="collection-podium-place place-${index + 1}${entry.mine ? ' is-mine' : ''}" aria-label="第 ${index + 1} 名，${esc(entry.name)}，${entry.score} 分">
      <span class="collection-place-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="collection-rank-avatar" aria-hidden="true">${esc(entry.name.slice(0, 1))}</span>
      <strong class="collection-rank-name">${esc(entry.name)}</strong>
      ${badge(entry)}
      <b class="collection-podium-score">${entry.score}<small> 分</small></b>
    </li>`).join('');
    const rows = entries.slice(3).map((entry, index) => `<li class="collection-ranking-row${entry.mine ? ' is-mine' : ''}">
      <span class="collection-ranking-number">${String(index + 4).padStart(2, '0')}</span>
      <span class="collection-row-avatar" aria-hidden="true">${esc(entry.name.slice(0, 1))}</span>
      <span class="collection-row-name"><strong>${esc(entry.name)}</strong>${badge(entry)}</span>
      <b>${entry.score}<small> 分</small></b>
    </li>`).join('');
    return `<div class="page collection-page ranking-page">
      ${head('探索榜单', back)}
      <section class="collection-score-summary">
        <div class="collection-score-heading"><span>今日累计</span><span class="collection-completed">已完成 ${done.length} / ${destinations.length} 座城</span></div>
        <h1>${total}<span> 分</span></h1>
        <div class="collection-score-progress" aria-hidden="true">${destinations.map(id => `<span class="${daily[id]?.result ? 'is-complete' : ''}"></span>`).join('')}</div>
        <p>每城满分 100 · 地图定位 40 + 三题 60</p>
      </section>
      <div class="collection-rank-tabs" role="tablist" aria-label="排行榜类型">${['今日', '好友榜'].map(tab => `<button data-rank="${tab}" role="tab" aria-selected="${activeRank === tab}" aria-controls="collection-rank-panel" class="${activeRank === tab ? 'active' : ''}">${tab}</button>`).join('')}</div>
      <section class="collection-rank-panel" id="collection-rank-panel" role="tabpanel" aria-label="${activeRank}">
        ${entries.length ? `<div class="collection-rank-caption"><strong>${friends ? '好友探索排行' : '今日目的地排行'}</strong>${friends ? '' : '<span>按探索得分排序</span>'}</div>
          <ol class="collection-podium" data-count="${podium.length}">${podiumCards}</ol>
          ${rows ? `<ol class="collection-ranking-list" start="4">${rows}</ol>` : ''}` : `<div class="collection-ranking-empty"><svg viewBox="0 0 120 88" aria-hidden="true"><path class="empty-route" d="M18 64h27c21 0 18-40 39-40h17"/><circle class="empty-origin" cx="18" cy="64" r="7"/><path class="empty-flag" d="M85 51V13m0 1h24l-7 9 7 9H85"/><circle class="empty-dot" cx="54" cy="28" r="3"/></svg><h2>第一站，等你点亮</h2><p>完成第一个挑战后，成绩会显示在这里。</p><button data-go="today" class="collection-empty-action">去探索 ${arrow}</button></div>`}
      </section>
    </div>`;
  }

  window.CollectionPages = Object.freeze({atlas, ranking});
})();
