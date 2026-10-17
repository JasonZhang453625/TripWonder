/* Wonder Coins: earned on the first result for each destination each day, spent on sample offers.
   Balances and the one-time award record live in TWStore on this device. */
(() => {
  'use strict';
  const EARN = Object.freeze({medalScore: 80, medal: 5, pkWin: 10, pkTie: 3});
  const t = (zh, en) => window.I18N.t(zh, en), f = (item, key) => window.I18N.f(item, key);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const offers = () => window.TW_OFFERS || {coupons: [], sponsors: []};
  const coin = (cls = '') => `<svg class="tw-coin ${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#ffc340"/><circle cx="12" cy="12" r="7.6" fill="none" stroke="#e8980f" stroke-width="1.4"/><path d="m12 7.4 1.35 2.9 3.15.35-2.35 2.13.66 3.12L12 14.3l-2.81 1.6.66-3.12L7.5 10.65l3.15-.35Z" fill="#fff"/></svg>`;
  const balance = () => window.TWStore.get().wallet.balance;
  const ymd = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  function award({cityId, day, score, pk = null}) {
    const key = `${cityId}@${day}`;
    return window.TWStore.update(data => {
      const w = data.wallet, before = w.best[key] || {score: -1, medal: false, pk: false}, items = [];
      const completed = data.challenged?.[cityId];
      if (completed?.completedDay === day || completed?.result?.date === day)
        return {total: 0, items, repeat: true, balance: w.balance};
      if (before.score >= 0) return {total: 0, items, repeat: true, balance: w.balance};
      const base = Math.round(score / 10);
      if (base > 0) items.push({zh: `探索得分 ${score}`, en: `Score ${score}`, amount: base});
      const medal = score >= EARN.medalScore;
      if (medal && !before.medal) items.push({zh: '点亮徽章', en: 'Badge unlocked', amount: EARN.medal});
      const pkPaid = pk && pk.outcome !== 'lose';
      if (pkPaid && !before.pk) items.push(pk.outcome === 'win' ? {zh: 'PK 获胜', en: 'PK win', amount: EARN.pkWin} : {zh: 'PK 打平', en: 'PK tie', amount: EARN.pkTie});
      w.best[key] = {score: Math.max(before.score, score), medal: before.medal || medal, pk: before.pk || !!pkPaid};
      const total = items.reduce((sum, item) => sum + item.amount, 0);
      if (total) {
        w.balance += total;
        w.ledger.unshift({type: 'earn', amount: total, cityId, day, at: Date.now(), items});
        w.ledger.length = Math.min(w.ledger.length, 120);
      }
      return {total, items, repeat: false, balance: w.balance};
    });
  }

  const find = id => [...offers().coupons, ...offers().sponsors].find(offer => offer.id === id);
  const isSponsor = offer => offers().sponsors.includes(offer);
  const couponTitle = c => c.discount ? t(`${c.amount} 折`, `${Math.round(100 - c.amount * 10)}% off`) : t(`${c.amount} 元`, `¥${c.amount} off`);
  const offerTitle = o => isSponsor(o) ? f(o, 'offer') : t(`${o.kind}优惠券 · ${couponTitle(o)}`, `${o.kindEn} coupon · ${couponTitle(o)}`);
  function redeem(id) {
    const offer = find(id);
    if (!offer) return {ok: false, reason: 'missing'};
    if (balance() < offer.price) return {ok: false, reason: 'balance', short: offer.price - balance()};
    return window.TWStore.update(data => {
      const expires = new Date(); expires.setDate(expires.getDate() + 30);
      const code = 'TW' + Array.from({length: 8}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('').replace(/(.{4})/, '$1-');
      const record = {offerId: id, code, at: Date.now(), expires: ymd(expires)};
      data.wallet.balance -= offer.price;
      data.wallet.ledger.unshift({type: 'spend', amount: offer.price, offerId: id, at: record.at});
      data.redemptions.unshift(record);
      return {ok: true, ...record, offer};
    });
  }

  // Destinations with a result (today in memory, or any day in storage). Only these may show city-specific merchants.
  function solvedCities(extra = []) {
    const ids = new Set(extra);
    for (const key of Object.keys(window.TWStore.get().wallet.best)) ids.add(key.split('@')[0]);
    return ids;
  }
  const visibleSponsors = solved => offers().sponsors.filter(s => !s.cityIds.length || s.cityIds.some(id => solved.has(id)));
  const priceButton = o => `<button class="tw-price" data-redeem="${esc(o.id)}" aria-label="${t(`用 ${o.price} 奇境币兑换`, `Redeem for ${o.price} coins`)}">${coin()}<b>${o.price}</b></button>`;
  const owned = id => window.TWStore.get().redemptions.filter(r => r.offerId === id).length;
  const ownedTag = id => { const n = owned(id); return n ? `<span class="tw-owned">${t(`已兑换 ${n}`, `${n} redeemed`)}</span>` : ''; };
  function sponsorCard(s, cities, extraClass = '') {
    const where = s.cityIds.map(id => cities.find(c => c.id === id)).filter(Boolean).map(c => f(c, 'name')).join(' · ');
    return `<article class="tw-sponsor ${extraClass}" style="--hue:${s.hue}"><div class="tw-sponsor-art" aria-hidden="true">${window.TWIcon?.(s.icon) || ''}</div><div class="tw-sponsor-copy"><span class="tw-sample">${t('示例商家', 'Sample merchant')} · ${esc(f(s, 'category'))}${where ? ` · ${esc(where)}` : ''}</span><strong>${esc(f(s, 'name'))}</strong><p>${esc(f(s, 'tagline'))}</p><b>${esc(f(s, 'offer'))}</b>${ownedTag(s.id)}</div>${priceButton(s)}</article>`;
  }

  function mall({head, back = 'result', cities, solved = []}) {
    const w = window.TWStore.get().wallet, solvedIds = solvedCities(solved);
    const sponsors = visibleSponsors(solvedIds).sort((a, b) => b.cityIds.length - a.cityIds.length);
    const locked = offers().sponsors.length - sponsors.length;
    return `<div class="page tw-mall-page">${head(t('奇境币兑换', 'Coin rewards'), back)}
      <section class="tw-mall-hero"><div class="tw-mall-balance">${coin('big')}<div><small>${t('我的奇境币', 'My Wonder Coins')}</small><b>${w.balance}</b></div></div>
        <p>${t('完成目的地挑战赚取奇境币：每 10 分 1 枚，点亮徽章和 PK 获胜还有额外奖励。', 'Earn coins from each destination: 1 for every 10 points, plus extras for badges and PK wins.')}</p>
        <button class="tw-mall-history" data-action="coin-history">${t('收支明细', 'History')}</button></section>
      <section class="tw-mall-section"><div class="tw-mall-heading"><h2>${t('旅行优惠券', 'Travel coupons')}</h2></div><div class="tw-coupon-grid">${offers().coupons.map(c => `<article class="tw-coupon-card"><div class="tw-coupon-amount">${c.discount ? t(`<strong>${c.amount}</strong><span>折</span>`, `<strong>${Math.round(100 - c.amount * 10)}%</strong><span>off</span>`) : `<span>¥</span><strong>${c.amount}</strong>`}</div><div class="tw-coupon-info"><b>${esc(t(`${c.kind}优惠券`, `${c.kindEn} coupon`))}</b><small>${esc(f(c, 'rule'))}</small>${ownedTag(c.id)}</div>${priceButton(c)}</article>`).join('')}</div></section>
      <section class="tw-mall-section"><div class="tw-mall-heading"><h2>${t('商家专区', 'Merchant offers')}</h2><span class="tw-sample">${t('示例商家', 'Samples')}</span></div>${sponsors.map(s => sponsorCard(s, cities)).join('')}${locked ? `<p class="tw-mall-locked">${t(`完成更多目的地，解锁 ${locked} 家当地商家`, `Solve more destinations to unlock ${locked} local merchants`)}</p>` : ''}</section>
      <p class="demo-note">${t('原型示例：奇境币与券码只保存在本机，不能在携程实际使用。', 'Prototype sample: coins and codes are stored on this device only and can’t be used on Trip.com.')}</p>
    </div>`;
  }

  function confirmMarkup(id) {
    const o = find(id), have = balance();
    if (!o) return '';
    const enough = have >= o.price;
    return `<div class="tw-redeem"><p class="tw-redeem-title">${esc(isSponsor(o) ? f(o, 'name') : t('携程旅行优惠券', 'Trip.com travel coupon'))}</p><strong>${esc(offerTitle(o))}</strong>${isSponsor(o) ? '' : `<small>${esc(f(o, 'rule'))}</small>`}
      <div class="tw-redeem-math"><span>${t('需要', 'Cost')} ${coin()}<b>${o.price}</b></span><span>${t('当前余额', 'Balance')} ${coin()}<b>${have}</b></span></div>
      ${enough ? `<button class="primary" data-action="redeem-confirm" data-offer="${esc(o.id)}">${t('确认兑换', 'Redeem')}</button>` : `<p class="tw-redeem-short">${t(`还差 ${o.price - have} 枚奇境币，去挑战下一个目的地吧`, `You need ${o.price - have} more coins. Try the next destination!`)}</p><button class="primary" data-go="today">${t('去赚奇境币', 'Earn coins')}</button>`}</div>`;
  }
  function successMarkup(result) {
    return `<div class="tw-redeem tw-redeem-done"><div class="tw-redeem-check" aria-hidden="true">${window.TWIcon?.('check') || ''}</div><strong>${esc(offerTitle(result.offer))}</strong><div class="tw-code"><small>${t('示例券码', 'Sample code')}</small><b>${esc(result.code)}</b></div><small>${t(`有效至 ${result.expires} · 余额 ${balance()} 枚`, `Valid until ${result.expires} · ${balance()} coins left`)}</small><button class="primary" data-action="close">${t('好的', 'Done')}</button></div>`;
  }
  function historyMarkup() {
    const w = window.TWStore.get().wallet, redemptions = window.TWStore.get().redemptions;
    const when = at => { const d = new Date(at); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
    const line = entry => {
      if (entry.type === 'spend') { const o = find(entry.offerId), code = redemptions.find(r => r.at === entry.at)?.code; return `<li><div><b>${esc(o ? offerTitle(o) : t('兑换', 'Redeemed'))}</b><small>${when(entry.at)}${code ? ` · ${esc(code)}` : ''}</small></div><span class="out">-${entry.amount}</span></li>`; }
      return `<li><div><b>${esc(entry.items.map(item => t(item.zh, item.en)).join(' · '))}</b><small>${when(entry.at)}</small></div><span class="in">+${entry.amount}</span></li>`;
    };
    return w.ledger.length ? `<ul class="tw-ledger">${w.ledger.map(line).join('')}</ul>` : `<p>${t('还没有收支记录。完成一个目的地挑战就能赚到第一笔奇境币。', 'No coins yet. Finish a destination challenge to earn your first ones.')}</p>`;
  }

  // Result page: what this round paid, counted up by app.js (data-count).
  function earnedCard(result) {
    if (!result) return '';
    return `<section class="content-card tw-earned" aria-label="${t('本局奇境币', 'Coins this round')}"><div class="tw-earned-head">${coin('big')}<div class="tw-earned-total"><small>${t('本局获得', 'This round')}</small><b>+<span data-coin-count="${result.total}">${result.total}</span> ${t('奇境币', 'coins')}</b></div><div class="tw-earned-actions"><span class="tw-earned-balance">${t('余额', 'Balance')} <b>${balance()}</b> ${t('枚', 'coins')}</span><button data-go="mall">${t('积分商城', 'Points mall')}</button></div></div></section>`;
  }
  // Count the coins up once the card scrolls into view (the result details sit below the reveal).
  function animateEarned(root) {
    const card = root.querySelector('.tw-earned'), number = card?.querySelector('[data-coin-count]');
    if (!number) return;
    const target = Number(number.dataset.coinCount) || 0;
    if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches || !window.IntersectionObserver) return;
    number.textContent = '0';
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect(); card.classList.add('counting');
      const t0 = performance.now(), step = now => { const k = Math.min(1, (now - t0) / 700); if (number.isConnected) number.textContent = Math.round(target * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, {threshold: .35});
    observer.observe(card);
  }
  function sponsorSlot(cityId, cities) {
    const list = offers().sponsors, pick = list.find(s => s.cityIds.includes(cityId)) || list.find(s => !s.cityIds.length);
    return pick ? `<section class="tw-slot" aria-label="${t('商家专区', 'Merchant offer')}">${sponsorCard(pick, cities, 'compact')}</section>` : '';
  }
  function profileCard() {
    const data = window.TWStore.get();
    return `<section class="pf-wallet" aria-label="${t('奇境币', 'Wonder Coins')}"><button class="pf-wallet-main" data-go="mall">${coin('big')}<span><small>${t('奇境币', 'Wonder Coins')}</small><b>${data.wallet.balance}</b></span><span class="pf-wallet-meta">${t(`已兑换 ${data.redemptions.length} 张`, `${data.redemptions.length} redeemed`)}</span></button><button class="pf-wallet-reset" data-action="reset-demo">${t('重置演示数据', 'Reset demo data')}</button></section>`;
  }

  window.Wallet = Object.freeze({EARN, award, redeem, balance, mall, confirmMarkup, successMarkup, historyMarkup, earnedCard, animateEarned, sponsorSlot, profileCard, coin});
})();
