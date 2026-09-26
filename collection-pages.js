/* Flat, result-page-aligned atlas and ranking views. State stays in app.js. */
(() => {
  'use strict';

  const photoPositions = {
    datong: '50% 62%', shenzhen: '54% 50%', suzhou: '50% 28%',
    guilin: '50% 50%', hongkong: '50% 50%', beijing: '50% 45%', shanghai: '50% 50%'
  };
  const photoRatios = ['4 / 5', '3 / 4', '1 / 1', '4 / 5', '3 / 4', '1 / 1', '4 / 5'];
  const check = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3.2 3.2L13 4.5"/></svg>';
  const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>';
  const finiteScore = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function atlas({order, cities, daily, img, head, esc, back='today'}) {
    const lookup = new Map(cities.map(city => [city.id, city]));
    const destinations = order.filter(id => lookup.has(id));
    const completed = destinations.filter(id => daily[id]?.result).length;
    const cards = destinations.map((id, index) => {
      const city = lookup.get(id), result = daily[id]?.result, done = !!result;
      const title = done ? city.name : `第 ${index + 1} 个目的地`;
      return `<button class="collection-destination${done ? ' is-lit' : ''}" data-city="${esc(id)}" aria-label="${esc(title)}，${done ? `${finiteScore(result.score)} 分，${esc(city.region)}` : '尚未揭晓'}">
        <span class="collection-photo" style="--collection-photo-ratio:${photoRatios[index % photoRatios.length]};--collection-photo-position:${photoPositions[id] || '50% 50%'}">
          ${img(city.scenes[0].id, done ? city.name : '未揭晓目的地')}
          <span class="collection-photo-status${done ? ' is-lit' : ''}">${done ? `${check}已点亮` : String(index + 1).padStart(2, '0')}</span>
        </span>
        <span class="collection-destination-copy"><strong>${esc(title)}</strong><span class="collection-destination-meta">${done ? `<span>${esc(city.region)}</span><b>${finiteScore(result.score)}<small> 分</small></b>` : '<span>尚未揭晓</span>'}</span></span>
      </button>`;
    });
    return `<div class="page collection-page atlas-page">
      ${head('目的地图鉴', back)}
      <section class="collection-intro" aria-label="图鉴进度">
        <p class="collection-kicker">我的探索足迹</p>
        <h1>已点亮 <b>${completed}</b><span> / ${destinations.length} 座城</span></h1>
        <div class="collection-progress" role="progressbar" aria-label="已点亮目的地" aria-valuemin="0" aria-valuemax="${destinations.length}" aria-valuenow="${completed}"><span style="width:${destinations.length ? completed / destinations.length * 100 : 0}%"></span></div>
      </section>
      <div class="collection-masonry" aria-label="目的地列表">${[0, 1].map(column => `<div class="collection-column">${cards.filter((_, index) => index % 2 === column).join('')}</div>`).join('')}</div>
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
