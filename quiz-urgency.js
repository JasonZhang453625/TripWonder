/* The last ten seconds of the quiz: the timer beats once a second, with a soft tick and a short buzz on phones.
   Called from app.js tick() several times a second; each second is handled once per timer element. */
(() => {
  'use strict';
  const FINAL = 10;
  let audio;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tickSound(strong) {
    if (window.SceneBGM?.isMuted?.()) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      if (!audio || audio.state === 'closed') audio = new AudioContext();
      if (audio.state !== 'running') audio.resume().catch(() => {});
      const at = audio.currentTime + .01, tone = audio.createOscillator(), gain = audio.createGain();
      tone.type = 'triangle'; tone.frequency.setValueAtTime(strong ? 1046.5 : 784, at);
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(strong ? .06 : .035, at + .006); gain.gain.exponentialRampToValueAtTime(.0001, at + .12);
      tone.connect(gain); gain.connect(audio.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(at); tone.stop(at + .14);
    } catch {}
  }
  function update(remain, timer) {
    if (!timer) return;
    const final = remain > 0 && remain <= FINAL;
    timer.classList.toggle('final', final);
    timer.closest('.quiz-page')?.classList.toggle('final-countdown', final);
    if (!final || timer.dataset.beat === String(remain)) return;
    timer.dataset.beat = String(remain);
    if (!reduced()) { timer.classList.remove('beat'); void timer.offsetWidth; timer.classList.add('beat'); }
    tickSound(remain <= 3);
    try { navigator.vibrate?.(remain <= 3 ? 28 : 12); } catch {}
  }
  window.QuizUrgency = Object.freeze({update, FINAL});
})();
