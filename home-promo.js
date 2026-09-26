// First-visit TripWonder promo on the Trip.com home: pops in, stays 3 s, then
// shrinks onto the TripWonder entry icon and makes that icon bounce.
(() => {
  'use strict';
  const DURATION = 3000;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pin = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8.5c-7 0-12.5 5.3-12.5 12.1 0 8.6 12.5 19.9 12.5 19.9s12.5-11.3 12.5-19.9C36.5 13.8 31 8.5 24 8.5Z" fill="none" stroke="#161a2b" stroke-width="3.2" stroke-linejoin="round"/><path d="M20.2 18.4a3.9 3.9 0 1 1 5.6 3.5c-1.3.7-1.8 1.4-1.8 2.8" fill="none" stroke="#2d61ff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="29" r="1.9" fill="#2d61ff"/></svg>';
  let active = null;

  function markup() {
    return `<div class="hp-backdrop"></div>
      <button class="hp-card" type="button" aria-label="参加 TripWonder 挑战，赢得优惠券！点击开始">
        <div class="hp-content">
          <div class="hp-stage" aria-hidden="true">
            <i class="hp-rays"></i><i class="hp-glow"></i>
            <span class="hp-ticket side"><span><b>奖励</b><small>REWARD</small></span></span>
            <span class="hp-ticket main"><span class="hp-pin">${pin}</span><span><b>优惠券</b><small>TRIPWONDER</small></span></span>
            <i class="hp-spark s1"></i><i class="hp-spark s2"></i><i class="hp-spark s3"></i><i class="hp-spark s4"></i>
            <i class="hp-confetti c1"></i><i class="hp-confetti c2"></i><i class="hp-confetti c3"></i><i class="hp-confetti c4"></i>
          </div>
          <span class="hp-kicker" aria-hidden="true">TRIPWONDER · 携程奇境挑战</span>
          <p class="hp-title" aria-hidden="true"><span class="hp-line1">参加TripWonder挑战，</span><span class="hp-line2">赢得优惠券！</span></p>
          <div class="hp-progress" aria-hidden="true"><i></i></div>
        </div>
      </button>`;
  }

  function enter(layer) {
    const card = layer.querySelector('.hp-card');
    if (reduced()) { layer.animate([{opacity:0},{opacity:1}], {duration:200, fill:'both'}); return; }
    layer.querySelector('.hp-backdrop').animate([{opacity:0},{opacity:1}], {duration:320, easing:'ease-out', fill:'both'});
    card.animate([
      {opacity:0, transform:'translateY(28px) scale(.55)'},
      {opacity:1, transform:'translateY(-4px) scale(1.04)', offset:.62},
      {opacity:1, transform:'none'}
    ], {duration:620, easing:'cubic-bezier(.2,.9,.3,1)', fill:'both'});
    layer.querySelector('.hp-stage').animate([
      {opacity:0, transform:'translateY(-22px) scale(.6) rotate(-8deg)'},
      {opacity:1, transform:'translateY(3px) scale(1.06) rotate(2deg)', offset:.7},
      {opacity:1, transform:'none'}
    ], {duration:640, delay:120, easing:'cubic-bezier(.2,.9,.3,1)', fill:'both'});
    layer.querySelector('.hp-kicker').animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'none'}], {duration:360, delay:220, easing:'ease-out', fill:'both'});
    layer.querySelector('.hp-line1').animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'none'}], {duration:420, delay:280, easing:'cubic-bezier(.2,.9,.3,1)', fill:'both'});
    layer.querySelector('.hp-line2').animate([
      {opacity:0, transform:'scale(.4) rotate(-6deg)'},
      {opacity:1, transform:'scale(1.16) rotate(2deg)', offset:.6},
      {opacity:1, transform:'none'}
    ], {duration:560, delay:380, easing:'cubic-bezier(.2,.9,.3,1)', fill:'both'});
  }

  // Landing cue, 900 ms in total: the disc absorbs the card with a soft glint,
  // pops once and settles; the pin nods, one ripple spreads and the NEW tag winks.
  function cue(icon) {
    if (!icon || reduced()) return;
    icon.querySelectorAll('.hp-ripple,.hp-glint').forEach(el => el.remove());
    const ease = 'cubic-bezier(.22,1,.36,1)';
    const glint = Object.assign(document.createElement('i'), {className:'hp-glint'});
    const ripple = Object.assign(document.createElement('i'), {className:'hp-ripple'});
    icon.prepend(glint); icon.append(ripple);
    icon.animate([
      {transform:'scale(.9)'}, {transform:'scale(1.12)', offset:.3}, {transform:'scale(.97)', offset:.58}, {transform:'scale(1.02)', offset:.8}, {transform:'none'}
    ], {duration:760, easing:'ease-out'});
    icon.querySelector('svg')?.animate([
      {transform:'none'}, {transform:'translateY(-3px) rotate(-10deg)', offset:.32}, {transform:'translateY(0) rotate(6deg)', offset:.6}, {transform:'none'}
    ], {duration:700, delay:60, easing:ease});
    glint.animate([{opacity:0}, {opacity:1, offset:.2}, {opacity:0}], {duration:620, easing:'ease-out', fill:'forwards'}).finished.then(() => glint.remove());
    ripple.animate([{opacity:.55, transform:'scale(1)'}, {opacity:0, transform:'scale(1.26)'}], {duration:700, delay:100, easing:ease, fill:'forwards'}).finished.then(() => ripple.remove());
    icon.querySelector('b')?.animate([
      {transform:'none'}, {transform:'scale(1.22) rotate(-8deg)', offset:.4}, {transform:'scale(.96) rotate(3deg)', offset:.7}, {transform:'none'}
    ], {duration:520, delay:300, easing:ease});
  }

  function finish(state) { state.layer.remove(); if (active === state) active = null; }

  // Shrink the card into the entry icon, then bounce the icon.
  function close(state) {
    if (state.closing) return; state.closing = true; clearTimeout(state.timer);
    const {layer, getTarget} = state, card = layer.querySelector('.hp-card');
    const icon = getTarget?.();
    const scroller = icon?.closest('#app');
    if (icon && scroller) {
      const a = scroller.getBoundingClientRect(), r = icon.getBoundingClientRect();
      if (r.top < a.top || r.bottom > a.bottom) scroller.scrollTop += r.top - a.top - 90;
    }
    const target = icon?.getBoundingClientRect();
    if (!target || !target.width || reduced()) {
      layer.animate([{opacity:1},{opacity:0}], {duration:220, fill:'forwards'}).finished.then(() => { finish(state); cue(icon); });
      return;
    }
    card.getAnimations().forEach(a => a.finish());
    const c = card.getBoundingClientRect();
    const dx = target.left + target.width/2 - (c.left + c.width/2), dy = target.top + target.height/2 - (c.top + c.height/2);
    const sx = target.width / c.width, sy = target.height / c.height;
    layer.querySelector('.hp-content').animate([{opacity:1, filter:'blur(0)'},{opacity:0, filter:'blur(4px)'}], {duration:260, easing:'ease-in', fill:'forwards'});
    layer.querySelector('.hp-backdrop').animate([{opacity:1},{opacity:0}], {duration:520, delay:80, easing:'ease-out', fill:'forwards'});
    const shrink = card.animate([
      {transform:'none', borderRadius:'28px', opacity:1},
      {transform:'translate(0,-10px) scale(1.03)', borderRadius:'32px', opacity:1, offset:.14},
      {transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`, borderRadius:'50%', opacity:.9, offset:.88},
      {transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`, borderRadius:'50%', opacity:0}
    ], {duration:720, easing:'cubic-bezier(.55,0,.25,1)', fill:'forwards'});
    shrink.finished.then(() => { finish(state); cue(icon); });
  }

  function accept(state) {
    if (state.closing) return; state.closing = true; clearTimeout(state.timer);
    state.layer.animate([{opacity:1},{opacity:0}], {duration:180, fill:'forwards'}).finished.then(() => { finish(state); state.onAccept?.(); });
  }

  async function show({phone, getTarget, onAccept}) {
    if (active || !phone) return;
    const layer = document.createElement('div');
    layer.className = 'hp-layer'; layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-label', 'TripWonder 挑战邀请');
    layer.innerHTML = markup();
    const state = active = {layer, getTarget, onAccept, closing:false, timer:0};
    try { await Promise.race([document.fonts.load("48px 'TripWonder Promo'", '赢得优惠券'), new Promise(r => setTimeout(r, 600))]); } catch {}
    if (active !== state) return;
    phone.append(layer);
    layer.querySelector('.hp-card').addEventListener('click', event => { event.stopPropagation(); accept(state); });
    layer.querySelector('.hp-backdrop').addEventListener('click', event => { event.stopPropagation(); close(state); });
    enter(layer);
    layer.querySelector('.hp-progress i').animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}], {duration:DURATION, easing:'linear', fill:'forwards'});
    state.timer = setTimeout(() => close(state), DURATION);
  }

  function dismiss() { if (!active) return; clearTimeout(active.timer); finish(active); }

  document.addEventListener('keydown', event => { if (event.key === 'Escape' && active) close(active); });
  window.HomePromo = {show, dismiss, get open() { return !!active; }};
})();
