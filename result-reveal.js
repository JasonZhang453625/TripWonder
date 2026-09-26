/* Keep the photograph at full size while the white details panel rises over it. */
window.ResultReveal = (() => {
  const destinations = {
    datong: {scene:'yungang', position:'50% 65%', description:'石窟与古寺之间，时间留下了自己的笔迹。沿着古城的街巷，走进山西的千年故事。'},
    shenzhen: {scene:'sz-qianhai', position:'50% 50%', description:'海湾盛下晚风，天际线点亮夜色。在山海与城市之间，发现深圳的另一种节奏。'},
    suzhou: {scene:'suzhou-huqiu', position:'50% 28%', description:'一座塔，一条河，一段慢下来的时光。穿过园林与街巷，听见江南的温柔回响。'},
    guilin: {scene:'gl-xingping', position:'50% 50%', description:'山峰在江水里写下倒影，竹筏从画中轻轻划过。下一程，把自己交给山水。'},
    hongkong: {scene:'hk-peak', position:'50% 50%', description:'从山顶的万家灯火，到街角的人间烟火。沿着海港与街巷，读懂香港的层次。'},
    beijing: {scene:'bj-zhengyangmen', position:'50% 45%', description:'城门收藏着岁月，胡同延续着日常。在古都的街巷里，遇见鲜活的北京。'},
    shanghai: {scene:'sh-lujiazui', position:'50% 50%', description:'江风吹过两岸，旧时光与新天际线相望。沿着黄浦江，收藏上海的一刻。'},
    zhangjiajie: {scene:'zjj-tianzishan', position:'48% 50%', description:'石峰从云雾里升起，山路沿绝壁盘旋。从武陵源的峰林到天门山的洞门，把下一段旅程交给群山。'}
  };
  function destination(city) {
    const story=destinations[city.id] || {};
    return {...story,scene:city.scenes.find(scene=>scene.id===story.scene)||city.scenes[0]};
  }
  function mount(app) {
    const page=app.querySelector('.result-page');
    if(!page)return;
    const hero=page.querySelector('.result-hero'),intro=page.querySelector('.result-intro'),phone=app.closest('.phone'),topbar=page.querySelector('.result-topbar');
    let frame=0,snapFrame=0,height=0,width=0,compact=0,toolbarBottom=0,reveal=0,paintedReveal=-1;
    let wheelTimer=0,nativeWheelTimer=0,touch=null,wheel=null,nativeWheel=false,wheelLockedUntil=0,snapTarget=0,destroyed=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const mix=(from,to,p)=>from+(to-from)*p;
    const range=()=>Math.max(1,height-compact);
    const blocked=()=>app.inert||!!phone.querySelector('#modal-root')?.childElementCount;
    const interactive=target=>target.closest('button,a,input,textarea,select,[contenteditable="true"]');
    function paint() {
      if(destroyed)return;
      const distance=range(),p=Math.min(1,reveal/distance),short=height<480;
      phone.classList.toggle('result-on-photo',height-reveal-Math.max(0,app.scrollTop)-24*p>toolbarBottom);
      // Native scrolling only moves the details. It never changes the reveal stage.
      if(paintedReveal===reveal)return;
      paintedReveal=reveal;
      intro.style.height=`${height-reveal}px`;
      app.classList.toggle('result-revealing',reveal<distance);
      const copyStart=short?100:Math.max(125,height-423),copyEnd=Math.max(toolbarBottom+12,compact-181);
      const values={
        '--reveal-height':`${height-reveal}px`,
        '--copy-top':`${mix(copyStart,copyEnd,p)}px`,
        '--copy-left':`${mix(28,24,p)}px`,
        '--copy-scale':mix(1,.59,p),
        '--description-top':`${(short?height-92:height-242)+(copyEnd-copyStart)*p}px`,
        '--description-opacity':Math.max(0,1-p*7),
        '--score-top':`${mix(height-161,compact-133,p)}px`,
        '--score-left':`${mix(short?width-174:28,width-136,p)}px`,
        '--score-scale':mix(1,.62,p),
        '--detail-opacity':Math.max(0,1-p*2.2),
        '--cue-opacity':Math.max(0,1-p*5),
        '--photo-pan':`${reduced.matches?0:-distance*.28*p}px`
      };
      for(const [key,value] of Object.entries(values))hero.style.setProperty(key,value);
      page.style.setProperty('--panel-overlap',`${24*p}px`);
      cue.style.visibility=p>=.2?'hidden':'visible';
    }
    function stopSnap() {cancelAnimationFrame(snapFrame);snapFrame=0;}
    function snapTo(target,fromWheel=false) {
      stopSnap();wheel=null;clearTimeout(wheelTimer);
      snapTarget=target;
      const start=reveal;
      if(reduced.matches||Math.abs(start-target)<1){reveal=target;paint();if(fromWheel)wheelLockedUntil=performance.now()+180;return;}
      const started=performance.now(),duration=520;
      // Critically damped spring: approach the endpoint without bouncing past it.
      function step(now) {
        const t=Math.min(1,(now-started)/duration),u=8*t;
        const eased=(1-(1+u)*Math.exp(-u))/(1-9*Math.exp(-8));
        reveal=mix(start,target,eased);paint();
        if(t<1)snapFrame=requestAnimationFrame(step);
        else {snapFrame=0;reveal=target;paint();if(fromWheel)wheelLockedUntil=performance.now()+180;}
      }
      snapFrame=requestAnimationFrame(step);
    }
    // The details stage has a real scroll boundary at zero. Do not clamp scrollTop
    // or start a spring from scroll events: that fights mobile compositor momentum.
    function onScroll() {queue();}
    function measure() {
      if(height===app.clientHeight&&width===app.clientWidth)return;
      const wasCompact=(snapFrame?snapTarget:reveal)>=range()/2;
      stopSnap();touch=null;wheel=null;nativeWheel=false;clearTimeout(wheelTimer);clearTimeout(nativeWheelTimer);
      height=app.clientHeight;width=app.clientWidth;
      compact=Math.min(296,Math.round(height*.68));
      page.style.setProperty('--intro-height',`${height}px`);
      page.style.setProperty('--result-width',`${width}px`);
      page.classList.toggle('result-short',height<480);
      toolbarBottom=topbar.getBoundingClientRect().bottom-app.getBoundingClientRect().top;
      reveal=wasCompact?range():0;paintedReveal=-1;
      paint();
    }
    function queue() {if(!frame)frame=requestAnimationFrame(()=>{frame=0;paint();});}
    function onWheel(event) {
      if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      if(blocked()){event.preventDefault();return;}
      const now=performance.now(),d=range();
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1);
      if(!delta)return;
      // One trackpad fling opens one stage; its inertial tail cannot skip the panel.
      if(snapFrame||now<wheelLockedUntil){event.preventDefault();wheelLockedUntil=now+180;return;}
      if(nativeWheel||app.scrollTop>1||(reveal>=d-1&&delta>0)){
        // Keep a fling and its remaining wheel events in the same native stage.
        nativeWheel=true;clearTimeout(nativeWheelTimer);
        nativeWheelTimer=setTimeout(()=>{nativeWheel=false;},180);
        return;
      }
      if(!wheel){
        if(reveal<=1&&delta<0)return;
        wheel={origin:reveal>=d/2?d:0,amount:0};
      }
      event.preventDefault();clearTimeout(wheelTimer);
      wheel.amount+=delta;
      reveal=Math.max(0,Math.min(d,wheel.origin+wheel.amount*.38));paint();
      const inward=wheel.origin===0?wheel.amount:-wheel.amount;
      if(inward>=42)snapTo(wheel.origin===0?d:0,true);
      else wheelTimer=setTimeout(()=>{const origin=wheel.origin;wheel=null;snapTo(origin,true);},130);
    }
    function onTouchStart(event) {
      if(event.touches.length!==1){if(touch)finishTransition();return;}
      if(blocked()||interactive(event.target))return;
      stopSnap();wheel=null;clearTimeout(wheelTimer);
      const {clientY:y,clientX:x}=event.touches[0],now=performance.now();
      touch={startX:x,startY:y,lastY:y,lastAt:now,velocity:0,dragging:false,native:app.scrollTop>1,origin:reveal>=range()/2?range():0};
    }
    function onTouchMove(event) {
      if(!touch||event.touches.length!==1)return;
      if(blocked()){if(event.cancelable)event.preventDefault();return;}
      const y=event.touches[0].clientY,now=performance.now(),dy=touch.startY-y,d=range();
      touch.velocity=(touch.lastY-y)/Math.max(1,now-touch.lastAt);touch.lastY=y;touch.lastAt=now;
      if(touch.native)return;
      if(!touch.dragging){
        if(Math.abs(dy)<6)return;
        if(Math.abs(event.touches[0].clientX-touch.startX)>Math.abs(dy)){touch.native=true;return;}
        if(reveal>=d-1&&dy>0){touch.native=true;return;}
        if(reveal<=1&&dy<0)return;
        if(!event.cancelable){touch.native=true;return;}
        touch.dragging=true;
      }
      if(event.cancelable)event.preventDefault();
      reveal=Math.max(0,Math.min(d,touch.origin+dy*.38));paint();
    }
    function onTouchEnd(event) {
      if(!touch)return;
      const gesture=touch;touch=null;
      if(!gesture.dragging){if(reveal>0&&reveal<range())snapTo(gesture.origin);return;}
      const sign=gesture.origin===0?1:-1;
      const travel=(gesture.startY-gesture.lastY)*sign;
      const velocity=performance.now()-gesture.lastAt<100?gesture.velocity*sign:0;
      const advance=event.type!=='touchcancel'&&(travel>=48||(travel>=12&&velocity>.35));
      snapTo(advance?(gesture.origin===0?range():0):gesture.origin);
    }
    function onKeyDown(event) {
      if(blocked()||interactive(event.target)||event.ctrlKey||event.metaKey||event.altKey)return;
      const direction=['ArrowDown','PageDown'].includes(event.key)||(event.key===' '&&!event.shiftKey)?1:['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:0;
      if(direction&&app.scrollTop<=1&&(reveal<range()-1||direction<0)){event.preventDefault();snapTo(direction>0?range():0);}
    }
    function revealDetails() {snapTo(range());}
    function finishTransition() {
      const d=range(),target=snapFrame?snapTarget:reveal>=d/2?d:0;
      stopSnap();wheel=null;touch=null;clearTimeout(wheelTimer);
      reveal=target;paint();
    }
    function onReducedChange(){paintedReveal=-1;finishTransition();}
    const cue=page.querySelector('.result-scroll-cue');
    cue.addEventListener('click',revealDetails);
    app.addEventListener('scroll',onScroll,{passive:true});
    app.addEventListener('wheel',onWheel,{passive:false});
    app.addEventListener('touchstart',onTouchStart,{passive:true});
    app.addEventListener('touchmove',onTouchMove,{passive:false});
    app.addEventListener('touchend',onTouchEnd);
    app.addEventListener('touchcancel',onTouchEnd);
    app.addEventListener('keydown',onKeyDown);
    reduced.addEventListener('change',onReducedChange);
    const observer=new ResizeObserver(measure);observer.observe(app);
    measure();
    return {refresh:paint,finishTransition,
      snapshot(){finishTransition();return {details:reveal===range(),scrollTop:app.scrollTop};},
      restore(state){
        if(!state)return;
        stopSnap();reveal=state.details?range():0;paint();
        app.scrollTop=state.details?Math.max(0,state.scrollTop):0;paint();
      },
      destroy(){
      destroyed=true;
      stopSnap();clearTimeout(wheelTimer);clearTimeout(nativeWheelTimer);cancelAnimationFrame(frame);observer.disconnect();app.removeEventListener('scroll',onScroll);
      app.removeEventListener('wheel',onWheel);app.removeEventListener('touchstart',onTouchStart);app.removeEventListener('touchmove',onTouchMove);
      app.removeEventListener('touchend',onTouchEnd);app.removeEventListener('touchcancel',onTouchEnd);app.removeEventListener('keydown',onKeyDown);
      reduced.removeEventListener('change',onReducedChange);cue.removeEventListener('click',revealDetails);
      app.classList.remove('result-revealing');
      phone.classList.remove('result-on-photo');
    }};
  }
  return {destination,mount};
})();
