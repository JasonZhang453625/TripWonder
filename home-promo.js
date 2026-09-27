// First-visit TripWonder promo on the Trip.com home: pops in, stays 3 s, then
// shrinks onto the TripWonder entry icon and makes that icon bounce.
(() => {
  'use strict';
  const DURATION = 3000;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Upper stage art: a sky over Paris and Santorini, a ticket slipping out of an envelope.
  const plane = fill => `<svg viewBox="0 0 24 24"><path fill="${fill}" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
  const marker = (fill, dot) => `<svg viewBox="0 0 24 30"><path fill="${fill}" d="M12 29s10-10.5 10-18a10 10 0 0 0-20 0c0 7.5 10 18 10 18Z"/><circle cx="12" cy="11" r="4.2" fill="${dot}"/></svg>`;
  const scene = `<svg class="hp-scene" viewBox="0 0 300 184" preserveAspectRatio="xMidYMax slice">
    <defs><linearGradient id="hp-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52b5ff"/><stop offset="1" stop-color="#3b6cff" stop-opacity="0"/></linearGradient>
    <radialGradient id="hp-sun"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="160" cy="44" r="80" fill="url(#hp-sun)" opacity=".5"/>
    <g fill="#fff" opacity=".75"><ellipse cx="204" cy="34" rx="26" ry="6"/><ellipse cx="216" cy="29" rx="12" ry="7"/><ellipse cx="116" cy="22" rx="18" ry="4.5"/></g>
    <rect y="136" width="300" height="48" fill="url(#hp-sea)"/>
    <path d="M150 142h34M200 148h26M92 148h22" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>
    <g fill="#35b37c"><ellipse cx="6" cy="146" rx="24" ry="13"/><ellipse cx="68" cy="147" rx="16" ry="8"/></g>
    <path fill="#2856c8" fill-opacity=".78" d="M38 58l1 12 1 14 1.5 14H44v3h-1.2l2.7 15H49v3h-1.8L57 150h-9q-10-22-20 0h-9l9.8-31H27v-3h3.5l2.7-15H32v-3h2.5L36 84l1-14z"/>
    <path fill="#e8f3ff" d="M204 146c16-22 42-30 96-34v38h-96z"/>
    <g fill="#fff"><rect x="222" y="126" width="15" height="17" rx="1.5"/><rect x="240" y="119" width="20" height="24" rx="1.5"/><rect x="263" y="124" width="14" height="19" rx="1.5"/><rect x="280" y="113" width="20" height="30" rx="1.5"/></g>
    <g fill="#2f6bff"><path d="M223.5 126a6 6 0 0 1 12 0z"/><path d="M264.5 124a5.5 5.5 0 0 1 11 0z"/><path d="M281 113a8 8 0 0 1 16 0z"/><rect x="288.4" y="99.5" width="1.2" height="6"/><rect x="286.5" y="101.2" width="5" height="1.2"/></g>
    <g fill="#8dbbff"><rect x="245" y="126" width="3" height="5" rx="1.5"/><rect x="252" y="126" width="3" height="5" rx="1.5"/><rect x="227.5" y="132" width="3" height="5" rx="1.5"/><rect x="268.5" y="130" width="3" height="5" rx="1.5"/><rect x="286" y="122" width="3" height="5" rx="1.5"/><rect x="292" y="122" width="3" height="5" rx="1.5"/></g>
    <path d="M136 56c40 12 78-2 108-22" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 4" stroke-linecap="round" opacity=".85"/>
    <g class="hp-jet"><g transform="translate(240 14) rotate(58 12 12)">${plane('#fff').replace(/<\/?svg[^>]*>/g, '')}</g></g>
    <g fill="#fff"><circle cx="16" cy="164" r="14"/><circle cx="40" cy="158" r="16"/><circle cx="64" cy="166" r="12"/><rect y="164" width="78" height="20"/><circle cx="238" cy="164" r="12"/><circle cx="260" cy="155" r="17"/><circle cx="284" cy="161" r="14"/><circle cx="300" cy="152" r="12"/><rect x="228" y="162" width="72" height="22"/></g>
  </svg>`;
  const envelopeBack = `<svg class="hp-env" viewBox="0 0 300 184"><path fill="#1e4fd6" d="M58 118h184v66H58z"/><path fill="#3e7bff" d="M58 118 150 76l92 42z"/></svg>`;
  const envelopeFront = `<svg class="hp-env" viewBox="0 0 300 184"><defs><linearGradient id="hp-env-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6aafff"/><stop offset=".55" stop-color="#3f7dff"/><stop offset="1" stop-color="#2a5ef2"/></linearGradient></defs>
    <path fill="url(#hp-env-f)" d="M58 118 150 162l92-44v66H58z"/>
    <path d="M58 184l70-36M242 184l-70-36" stroke="#fff" stroke-opacity=".22" stroke-width="1.5"/>
    <path d="M59 119 150 162.5 241 119" fill="none" stroke="#d6ebff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  let active = null;

  function markup() {
    return `<div class="hp-backdrop"></div>
      <button class="hp-card" type="button" aria-label="参加 TripWonder 挑战，赢得优惠券！点击开始">
        <div class="hp-content">
          <div class="hp-stage" aria-hidden="true">
            ${scene}
            <span class="hp-script">Explore<br>More<br>Together</span>
            <div class="hp-pop">
              ${envelopeBack}
              <span class="hp-ticket back"></span>
              <span class="hp-ticket main"><span class="hp-ticket-face"><b>目的地</b><b>优惠券</b></span><span class="hp-ticket-stub">${plane('#f08a1c')}</span></span>
              ${envelopeFront}
              <span class="hp-mark yellow">${marker('#ffc83d','#fff4c7')}</span>
              <span class="hp-mark red">${marker('#ff5b4d','#ffe1dc')}</span>
            </div>
            <i class="hp-spark s1"></i><i class="hp-spark s2"></i><i class="hp-spark s3"></i>
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
    layer.querySelector('.hp-scene').animate([{opacity:0, transform:'scale(1.08)'},{opacity:1, transform:'none'}], {duration:520, delay:60, easing:'ease-out', fill:'both'});
    layer.querySelector('.hp-script').animate([{opacity:0, transform:'translateX(-10px) rotate(-10deg)'},{opacity:1, transform:'rotate(-10deg)'}], {duration:420, delay:260, easing:'ease-out', fill:'both'});
    layer.querySelector('.hp-pop').animate([
      {opacity:0, transform:'translateY(30px) scale(.7)'},
      {opacity:1, transform:'translateY(-4px) scale(1.04)', offset:.7},
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
