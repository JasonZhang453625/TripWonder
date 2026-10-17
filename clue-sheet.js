/* The clue sheet follows a downward drag; native scrolling owns long content. */
window.ClueSheet=(()=>{
  function mount(overlay,onClose){
    const panel=overlay.querySelector('.clue-dialog'),listeners=[];
    const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
    let gesture=null,motion=null,destroyed=false,closing=false,offset=0,suppressUntil=0;
    const height=()=>panel.getBoundingClientRect().height+24;
    function listen(target,type,handler,options){
      target.addEventListener(type,handler,options);
      listeners.push(()=>target.removeEventListener(type,handler,options));
    }
    function paint(y){
      offset=y;panel.style.transform=`translate3d(0,${y}px,0)`;
      overlay.style.backgroundColor=`rgba(16,24,32,${.1*(1-Math.min(1,y/height()))})`;
    }
    function stop(){
      if(!motion)return;
      const y=new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42;
      motion.cancel();motion=null;paint(Math.max(0,y));
    }
    function moveTo(y,duration,done){
      stop();const from=offset;
      panel.style.willChange='transform';
      if(reduced()){paint(y);panel.style.willChange='';done?.();return;}
      const animation=panel.animate([
        {transform:`translate3d(0,${from}px,0)`},
        {transform:`translate3d(0,${y}px,0)`}
      ],{duration,easing:'cubic-bezier(.22,.8,.25,1)',fill:'both'});
      motion=animation;
      // Fade the dimming independently so the glass keeps sampling the photo.
      overlay.style.transition=`background-color ${duration}ms ease-out`;
      overlay.style.backgroundColor=`rgba(16,24,32,${y?0:.1})`;
      animation.finished.then(()=>{
        if(destroyed||motion!==animation)return;
        motion=null;paint(y);animation.cancel();panel.style.willChange='';
        overlay.style.transition='';done?.();
      }).catch(()=>{});
    }
    function dismiss(){
      if(destroyed||closing)return;
      closing=true;gesture=null;overlay.classList.add('closing');panel.inert=true;
      moveTo(height(),280,()=>{if(!destroyed&&overlay.isConnected)onClose();});
    }
    function start(x,y,id){
      if(closing||destroyed)return;
      gesture={x,y,id,startScroll:panel.scrollTop,mode:'pending',base:offset,lastY:y,lastTime:performance.now(),velocity:0};
    }
    function move(x,y,event){
      if(!gesture||closing)return;
      const g=gesture,dx=x-g.x,dy=y-g.y,now=performance.now();
      if(g.mode==='pending'){
        if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;
        // A gesture already scrolling content stays native until the next touch.
        if(g.startScroll>1||dy<0||Math.abs(dx)>dy){g.mode='scroll';return;}
        g.mode='drag';stop();g.base=offset;panel.style.willChange='transform';overlay.style.transition='';
      }
      if(g.mode!=='drag')return;
      if(event.cancelable)event.preventDefault();
      g.velocity=(y-g.lastY)/Math.max(1,now-g.lastTime);g.lastY=y;g.lastTime=now;
      paint(Math.min(height(),Math.max(0,g.base+dy)));
    }
    function end(cancelled,event){
      const g=gesture;gesture=null;if(!g||g.mode!=='drag')return;
      if(event?.cancelable)event.preventDefault();suppressUntil=performance.now()+400;
      const distance=offset-g.base,velocity=performance.now()-g.lastTime<100?g.velocity:0;
      if(!cancelled&&(distance>Math.min(96,panel.clientHeight*.24)||(distance>18&&velocity>.5)))dismiss();
      else moveTo(0,240);
    }
    listen(panel,'touchstart',event=>{
      if(event.touches.length!==1){end(true);return;}
      const p=event.touches[0];start(p.clientX,p.clientY,p.identifier);
    },{passive:true});
    listen(panel,'touchmove',event=>{
      if(event.touches.length!==1){end(true,event);return;}
      const p=event.touches[0];if(p.identifier===gesture?.id)move(p.clientX,p.clientY,event);
    },{passive:false});
    listen(panel,'touchend',event=>end(false,event),{passive:false});
    listen(panel,'touchcancel',event=>end(true,event),{passive:false});
    listen(panel,'pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button===0)start(event.clientX,event.clientY,event.pointerId);
    });
    listen(window,'pointermove',event=>{
      if(event.pointerType==='mouse'&&event.pointerId===gesture?.id)move(event.clientX,event.clientY,event);
    });
    listen(window,'pointerup',event=>{if(event.pointerType==='mouse')end(false,event);});
    listen(window,'pointercancel',event=>{if(event.pointerType==='mouse')end(true,event);});
    listen(window,'blur',()=>end(true));
    listen(overlay,'click',event=>{
      if(closing||(performance.now()<suppressUntil&&event.detail!==0)){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    paint(reduced()?0:height());moveTo(0,340);
    return {dismiss,destroy(){destroyed=true;gesture=null;motion?.cancel();motion=null;listeners.forEach(remove=>remove());}};
  }
  return {mount};
})();
