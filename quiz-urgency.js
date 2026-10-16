/* One edge clock shared by scenes and quiz. The two remaining light trails descend
   from the top centre, slow down, turn red, and meet at the bottom when time is up. */
(() => {
  'use strict';
  const FINAL = 10;
  let audio;
  let edge, resize, ending;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function removeEdge() {
    clearTimeout(ending);ending=null;
    resize?.disconnect();resize=null;
    edge?.remove();edge=null;
  }
  function clear() {
    // Let the final point finish its brief fade over the time-out navigation.
    if(!edge?.classList.contains('is-ended'))removeEdge();
  }
  function mountEdge() {
    const phone=document.querySelector('#phone');
    edge=document.createElement('div');edge.className='countdown-edge is-new';edge.setAttribute('aria-hidden','true');
    edge.innerHTML='<svg xmlns="http://www.w3.org/2000/svg"><g class="countdown-edge-halo"><path pathLength="1"/><path pathLength="1"/></g><g class="countdown-edge-core"><path pathLength="1"/><path pathLength="1"/></g></svg><i class="countdown-edge-end"></i>';
    phone.append(edge);
    const layout=()=>{
      const w=edge.clientWidth,h=edge.clientHeight,inset=4;
      const radius=Math.min(w/2,h/2,Math.max(8,parseFloat(getComputedStyle(phone).borderTopLeftRadius)||0));
      edge.firstElementChild.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const left=`M ${w/2} ${inset} H ${radius} Q ${inset} ${inset} ${inset} ${radius} V ${h-radius} Q ${inset} ${h-inset} ${radius} ${h-inset} H ${w/2}`;
      const right=`M ${w/2} ${inset} H ${w-radius} Q ${w-inset} ${inset} ${w-inset} ${radius} V ${h-radius} Q ${w-inset} ${h-inset} ${w-radius} ${h-inset} H ${w/2}`;
      edge.querySelectorAll('g').forEach(group=>[...group.children].forEach((path,i)=>path.setAttribute('d',i?right:left)));
    };
    layout();resize=new ResizeObserver(layout);resize.observe(phone);
    const mounted=edge;
    requestAnimationFrame(()=>requestAnimationFrame(()=>mounted.classList.remove('is-new')));
  }
  function updateEdge(left,total) {
    if(!edge)mountEdge();
    if(edge.classList.contains('is-ended')){
      if(left<=0)return;
      removeEdge();mountEdge();
    }
    const fraction=Math.max(0,Math.min(1,left/Math.max(1,total)));
    // Ease the spatial movement towards zero; the numerical clock stays exact.
    const length=Math.pow(fraction,1.4),offset=1-length;
    const redAt=Math.min(15000,total*.25),warmAt=Math.min(35000,total*.5);
    const warmth=Math.max(0,Math.min(1,(warmAt-left)/Math.max(1,warmAt-redAt)));
    const blue=[47,158,255],red=[255,65,74];
    edge.style.color=`rgb(${blue.map((value,i)=>Math.round(value+(red[i]-value)*warmth)).join(',')})`;
    edge.style.setProperty('--edge-length',String(length));
    edge.style.setProperty('--edge-offset',String(-offset));
    if(left<=0){
      edge.classList.add('is-ended');
      ending=setTimeout(removeEdge,reduced()?120:700);
    }
  }
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
  function update(remain, timer, {left=remain*1000,total=60000}={}) {
    if (!timer) return;
    updateEdge(left,total);
    const final = remain > 0 && remain <= FINAL;
    timer.classList.toggle('final', final);
    timer.closest('.quiz-page')?.classList.toggle('final-countdown', final);
    if (!final || timer.dataset.beat === String(remain)) return;
    timer.dataset.beat = String(remain);
    if (!reduced()) { timer.classList.remove('beat'); void timer.offsetWidth; timer.classList.add('beat'); }
    tickSound(remain <= 3);
    try { navigator.vibrate?.(remain <= 3 ? 28 : 12); } catch {}
  }
  window.QuizUrgency = Object.freeze({update, clear, FINAL});
})();
