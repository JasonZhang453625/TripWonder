/* Device-local storage for the gameplay layer: coins, redemptions, scene bubbles, explored scenes, PK history,
   challenged official cities (with their badge) and played community (UGC) journeys.
   Daily challenge progress stays in memory; player-journey progress also survives a reload.
   Every read and write tolerates blocked storage, so the prototype keeps working in private windows. */
(() => {
  'use strict';
  const KEY = 'tripwonder-v2';
  const blank = () => ({version: 2, wallet: {balance: 0, ledger: [], best: {}}, redemptions: [], bubbles: {}, likes: {}, explored: {}, challenged: {}, ugcPlayed: {}, pk: {history: []}, prefs: {}});
  const listeners = new Set();
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (parsed?.version === 2) {
        const base = blank();
        return {...base, ...parsed, wallet: {...base.wallet, ...parsed.wallet}, pk: {...base.pk, ...parsed.pk}};
      }
    } catch {}
    return blank();
  }
  let data = load();
  function notify() { listeners.forEach(fn => { try { fn(data); } catch {} }); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} }
  function update(fn) { const result = fn(data); save(); notify(); return result; }
  // The scene-note filter (scene-bubbles.js) is a demo setting too: a reset must bring the notes back.
  function reset() { data = blank(); try { localStorage.removeItem(KEY); localStorage.removeItem('tripwonder-bubble-filter'); } catch {} notify(); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  window.TWStore = Object.freeze({get: () => data, update, reset, subscribe});

  // Feature switches for the live demo: window.TW_FEATURES = {pk:false} before this script, or ?off=pk,bubbles.
  let off = [];
  try { off = (new URL(location.href).searchParams.get('off') || '').split(','); } catch {}
  const preset = window.TW_FEATURES || {};
  window.TW_FEATURES = Object.freeze(Object.fromEntries(['wallet', 'pk', 'bubbles'].map(key => [key, preset[key] !== false && !off.includes(key)])));
})();
