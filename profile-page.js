/* Personal discovery overview. Only completed destinations contribute to the atlas. */
(() => {
  'use strict';
  function render({cities, order, daily, badges, itineraries, head, esc, icon, extra = ''}) {
    const {t, term} = window.I18N;
    const unlocked = cities.filter(city => daily[city.id]?.result);
    const completed = order.filter(id => daily[id]?.result);
    const score = completed.reduce((sum, id) => sum + (Number(daily[id].result.score) || 0), 0);
    const medals = unlocked.filter(city => badges[city.id]).length;
    const trips = Object.keys(itineraries).length;
    const remaining = order.length - completed.length;
    const ring = 2 * Math.PI * 40;
    const tags = {};
    for (const city of unlocked) for (const tag of daily[city.id].result.tags || []) tags[tag] = (tags[tag] || 0) + 1;
    const interests = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 4);
    return `<div class="page profile-page">
      ${head(t('我的旅行', 'My travels'), 'home')}
      <div class="pf-content">
        <div class="pf-intro"><span>TRIPWONDER</span><h1>${t('我的发现', 'My discoveries')}</h1><p>${t('每一站，都有新的收获。', 'Every stop brings a new discovery.')}</p></div>
        <section class="pf-overview" aria-label="${t('探索概览', 'Discovery overview')}">
          <div class="pf-overview-top">
            <div class="pf-discoveries"><span>${t('已解锁目的地', 'Destinations unlocked')}</span><div><b>${unlocked.length}</b><small>/ ${cities.length}</small></div></div>
            <div class="pf-progress" role="progressbar" aria-label="${t('今日挑战完成度', 'Today’s challenge progress')}" aria-valuemin="0" aria-valuemax="${order.length}" aria-valuenow="${completed.length}">
              <svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="40"/><circle class="pf-progress-value" cx="48" cy="48" r="40" stroke-dasharray="${ring}" stroke-dashoffset="${ring * (1 - (order.length ? completed.length / order.length : 0))}"/></svg>
              <span><b>${completed.length}<i> / ${order.length}</i></b><small>${t('今日挑战', 'Today')}</small></span>
            </div>
          </div>
          <div class="pf-stats"><div>${icon('trophy')}<span><b>${score}</b><small>${t('今日积分', 'Today’s points')}</small></span></div><div>${icon('spark')}<span><b>${medals}</b><small>${t('珍藏徽章', 'Badges collected')}</small></span></div></div>
        </section>${extra}
        <section class="pf-library" aria-label="${t('探索档案', 'Your discoveries')}">
          <div class="pf-section-heading"><h2>${t('探索档案', 'Your collection')}</h2><span>${t('把发现好好收藏', 'Keep your discoveries close')}</span></div>
          <div class="pf-shortcuts">
            <button class="pf-shortcut pf-atlas" data-go="atlas"><span class="pf-feature-icon">${icon('atlas')}</span><strong>${t('目的地图鉴', 'Destination atlas')}</strong><small>${unlocked.length ? t(`已点亮 ${unlocked.length} 个目的地`, `${unlocked.length} destinations unlocked`) : t('点亮你的第一站', 'Discover your first destination')}</small><span class="pf-shortcut-arrow">${icon('next')}</span></button>
            <button class="pf-shortcut pf-ranking" data-go="ranking"><span class="pf-feature-icon">${icon('trophy')}</span><strong>${t('探索榜单', 'Exploration rankings')}</strong><small>${t('查看战绩，与好友比一比', 'See how you rank with friends')}</small><span class="pf-shortcut-arrow">${icon('next')}</span></button>
          </div>
          <button class="pf-itinerary" data-go="itinerary"><span class="pf-feature-icon">${icon('bag')}</span><span><strong>${t('我的行程', 'My trips')}</strong><small>${trips ? t(`已保存 ${trips} 份旅行路线`, `${trips} saved ${trips === 1 ? 'route' : 'routes'}`) : t('把心动的发现，变成下一次出发', 'Turn a discovery into your next trip')}</small></span>${icon('next')}</button>
        </section>
        <section class="pf-interests"><div class="pf-section-heading"><h2>${t('我的旅行偏好', 'Your travel interests')}</h2>${icon('spark')}</div>
          ${interests.length ? `<div class="pf-tags">${interests.map(([tag]) => `<span>${esc(term(tag))}</span>`).join('')}</div>` : `<p>${t('探索喜欢的线索，慢慢发现你的旅行偏好。', 'Explore the clues you love to discover your travel interests.')}</p>`}
        </section>
        <button class="pf-explore" data-go="${remaining ? 'today' : 'atlas'}"><span>${remaining ? t(completed.length ? '继续今日探索' : '开启今日探索', completed.length ? 'Continue exploring' : 'Start exploring today') : t('回看我的发现', 'Revisit my discoveries')}</span>${icon('next')}</button>
      </div>
    </div>`;
  }
  window.ProfilePage = Object.freeze({render});
})();
