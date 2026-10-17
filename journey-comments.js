// Comments stay independent of scene-positioned notes and the photo viewer.
window.JourneyComments=(()=>{
  let current=null;
  function mount(page,html){
    current?.destroy();
    const trigger=page.querySelector('[data-journey-comments]');if(!trigger)return;
    const layer=document.createElement('div');layer.className='journey-comments-layer';layer.hidden=true;
    layer.innerHTML=`<button class="journey-comments-shade" aria-label="${I18N.t('收起评论','Close comments')}" tabindex="-1"></button><section class="journey-comments-panel" role="dialog" aria-modal="true" aria-label="${I18N.t('评论','Comments')}" tabindex="-1" data-size="half"><header class="journey-comments-head"><button class="journey-comments-expand" type="button">${I18N.t('展开','Expand')}</button><h2>${I18N.t('评论','Comments')}</h2><button class="journey-comments-close" aria-label="${I18N.t('关闭评论','Close comments')}" type="button">×</button></header>${html}</section>`;
    page.append(layer);
    const panel=layer.querySelector('.journey-comments-panel'),head=layer.querySelector('.journey-comments-head'),expand=layer.querySelector('.journey-comments-expand');
    const controller=new AbortController(),opts={signal:controller.signal};
    let drag=null,timer=0,open=false,previousFocus;
    const background=()=>[...page.children].filter(n=>n!==layer);
    function size(value){panel.dataset.size=value;panel.style.setProperty('--comments-height',value==='full'?'100%':'52%');expand.textContent=I18N.t(value==='full'?'半屏':'展开',value==='full'?'Half screen':'Expand');expand.setAttribute('aria-expanded',String(value==='full'));}
    function show(){clearTimeout(timer);previousFocus=document.activeElement;open=true;layer.hidden=false;layer.classList.remove('is-closing');layer.classList.add('is-opening');size('half');trigger.setAttribute('aria-expanded','true');background().forEach(n=>n.inert=true);panel.focus({preventScroll:true});}
    function close(){if(!open)return false;open=false;trigger.setAttribute('aria-expanded','false');background().forEach(n=>n.inert=false);layer.classList.remove('is-opening');layer.classList.add('is-closing');previousFocus?.isConnected&&previousFocus.focus({preventScroll:true});timer=setTimeout(()=>{layer.hidden=true;layer.classList.remove('is-closing');},matchMedia('(prefers-reduced-motion: reduce)').matches?0:220);return true;}
    trigger.addEventListener('click',show,opts);
    layer.querySelector('.journey-comments-shade').addEventListener('click',close,opts);
    layer.querySelector('.journey-comments-close').addEventListener('click',close,opts);
    expand.addEventListener('click',()=>size(panel.dataset.size==='full'?'half':'full'),opts);
    head.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button)return;drag={id:e.pointerId,y:e.clientY,height:panel.getBoundingClientRect().height,full:page.clientHeight,last:e.clientY,at:performance.now()};head.setPointerCapture(e.pointerId);panel.classList.add('is-dragging');},opts);
    head.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();drag.last=e.clientY;panel.style.setProperty('--comments-height',Math.max(100,Math.min(drag.full,drag.height+drag.y-e.clientY))+'px');},opts);
    const end=e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag,delta=d.last-d.y;drag=null;panel.classList.remove('is-dragging');if(head.hasPointerCapture(e.pointerId))head.releasePointerCapture(e.pointerId);if(e.type==='pointercancel'){size(d.height>d.full*.75?'full':'half');return;}if(delta>80&&d.height<d.full*.75){size('half');close();}else if(delta<-45)size('full');else if(delta>45)size('half');else size(panel.getBoundingClientRect().height>d.full*.75?'full':'half');};
    head.addEventListener('pointerup',end,opts);head.addEventListener('pointercancel',end,opts);
    layer.addEventListener('focusin',e=>{if(e.target.matches('textarea'))size('full');},opts);
    let touch=null;
    layer.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('textarea,button,select'))return;const list=e.target.closest('.cm-board');if(list)touch={y:e.touches[0].clientY,top:list.scrollTop};},{...opts,passive:true});
    layer.addEventListener('touchmove',e=>{if(!touch||e.touches.length!==1)return;const delta=e.touches[0].clientY-touch.y;if(delta<-32&&panel.dataset.size==='half'){e.preventDefault();size('full');touch=null;}else if(delta>55&&touch.top<=0&&panel.dataset.size==='full'){e.preventDefault();size('half');touch=null;}},{...opts,passive:false});
    layer.addEventListener('touchend',()=>touch=null,opts);layer.addEventListener('touchcancel',()=>touch=null,opts);
    document.addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'){const nodes=[...panel.querySelectorAll('button,input,textarea,select,[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);if(!nodes.length){e.preventDefault();panel.focus();}else if(e.shiftKey&&(document.activeElement===nodes[0]||document.activeElement===panel)){e.preventDefault();nodes.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus();}}},{...opts,capture:true});
    current={close,destroy(){clearTimeout(timer);controller.abort();background().forEach(n=>n.inert=false);layer.remove();current=null;}};
    return current;
  }
  return {mount,close:()=>current?.close()||false,destroy:()=>current?.destroy()};
})();
