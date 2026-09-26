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
    const hero=page.querySelector('.result-hero'),phone=app.closest('.phone'),topbar=page.querySelector('.result-topbar');
    let frame=0,snapFrame=0,height=0,width=0,compact=0,toolbarBottom=0;
    let settleTimer=0,wheelTimer=0,touch=null,wheel=null,wheelLockedUntil=0,snapTarget=0,detailFloor=false,destroyed=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const mix=(from,to,p)=>from+(to-from)*p;
    const range=()=>Math.max(1,height-compact);
    const blocked=()=>app.inert||!!phone.querySelector('#modal-root')?.childElementCount;
    const interactive=target=>target.closest('button,a,input,textarea,select,[contenteditable="true"]');
    function paint() {
      if(destroyed)return;
      const distance=Math.max(1,height-compact),offset=Math.max(0,app.scrollTop);
      const p=Math.min(1,offset/distance),short=height<480;
      const copyStart=short?100:Math.max(125,height-423),copyEnd=Math.max(toolbarBottom+12,compact-181);
      const values={
        '--reveal-height':`${height-Math.min(offset,distance)}px`,
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
      phone.classList.toggle('result-on-photo',height-offset-24*p>toolbarBottom);
    }
    function stopSnap() {cancelAnimationFrame(snapFrame);snapFrame=0;clearTimeout(settleTimer);}
    function snapTo(target,fromWheel=false) {
      stopSnap();wheel=null;clearTimeout(wheelTimer);
      snapTarget=target;detailFloor=false;
      const start=app.scrollTop;
      if(reduced.matches||Math.abs(start-target)<1){app.scrollTop=target;paint();if(fromWheel)wheelLockedUntil=performance.now()+160;return;}
      const started=performance.now(),duration=520;
      // Critically damped spring: approach the endpoint without bouncing past it.
      function step(now) {
        const t=Math.min(1,(now-started)/duration),u=8*t;
        const eased=(1-(1+u)*Math.exp(-u))/(1-9*Math.exp(-8));
        app.scrollTop=mix(start,target,eased);paint();
        if(t<1)snapFrame=requestAnimationFrame(step);
        else {snapFrame=0;app.scrollTop=target;paint();if(fromWheel)wheelLockedUntil=performance.now()+160;}
      }
      snapFrame=requestAnimationFrame(step);
    }
    function settle() {
      if(snapFrame||touch||wheel||blocked())return;
      const y=app.scrollTop,d=range();
      if(y>1&&y<d-1)snapTo(y>=d/2?d:0);
    }
    function onScroll() {
      if(detailFloor&&!snapFrame&&app.scrollTop<range())app.scrollTop=range();
      queue();clearTimeout(settleTimer);
      if(!snapFrame&&!touch&&!wheel)settleTimer=setTimeout(settle,160);
    }
    function measure() {
      if(height===app.clientHeight&&width===app.clientWidth)return;
      const oldRange=range(),oldY=app.scrollTop,hadSize=height>0;
      stopSnap();touch=null;wheel=null;detailFloor=false;clearTimeout(wheelTimer);
      height=app.clientHeight;width=app.clientWidth;
      compact=Math.min(296,Math.round(height*.68));
      page.style.setProperty('--intro-height',`${height}px`);
      page.style.setProperty('--result-width',`${width}px`);
      page.classList.toggle('result-short',height<480);
      toolbarBottom=topbar.getBoundingClientRect().bottom-app.getBoundingClientRect().top;
      if(hadSize)app.scrollTop=oldY>=oldRange-1?range()+Math.max(0,oldY-oldRange):oldY>oldRange/2?range():0;
      paint();
    }
    function queue() {if(!frame)frame=requestAnimationFrame(()=>{frame=0;paint();});}
    function onWheel(event) {
      if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      if(blocked()){event.preventDefault();return;}
      const now=performance.now(),d=range(),y=app.scrollTop;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1);
      if(!delta)return;
      // One trackpad fling opens one stage; its inertial tail cannot skip the panel.
      if(snapFrame||now<wheelLockedUntil){event.preventDefault();wheelLockedUntil=now+160;return;}
      detailFloor=false;
      if(y>d+1){
        if(delta<0&&y+delta<d){event.preventDefault();snapTo(d,true);}
        return;
      }
      if(!wheel){
        if(y>=d-1&&delta>0)return;
        if(y<=1&&delta<0)return;
        wheel={origin:y>=d/2?d:0,amount:0};
      }
      event.preventDefault();clearTimeout(settleTimer);clearTimeout(wheelTimer);
      wheel.amount+=delta;
      app.scrollTop=Math.max(0,Math.min(d,wheel.origin+wheel.amount*.38));paint();
      const inward=wheel.origin===0?wheel.amount:-wheel.amount;
      if(inward>=42)snapTo(wheel.origin===0?d:0,true);
      else wheelTimer=setTimeout(()=>{const origin=wheel.origin;wheel=null;snapTo(origin,true);},130);
    }
    function onTouchStart(event) {
      if(event.touches.length!==1||blocked()||interactive(event.target))return;
      stopSnap();wheel=null;clearTimeout(wheelTimer);
      const y=event.touches[0].clientY,now=performance.now();
      detailFloor=app.scrollTop>range()+1;
      touch={startY:y,lastY:y,startScroll:app.scrollTop,lastAt:now,velocity:0,dragging:false,native:detailFloor,origin:app.scrollTop>=range()/2?range():0};
    }
    function onTouchMove(event) {
      if(!touch||event.touches.length!==1)return;
      if(blocked()){event.preventDefault();return;}
      const y=event.touches[0].clientY,now=performance.now(),dy=touch.startY-y,d=range();
      touch.velocity=(touch.lastY-y)/Math.max(1,now-touch.lastAt);touch.lastY=y;touch.lastAt=now;
      if(touch.startScroll>=d-1&&dy>6&&!touch.dragging){touch.native=true;detailFloor=true;}
      if(touch.native){
        if(app.scrollTop<=d&&dy<0){if(event.cancelable)event.preventDefault();app.scrollTop=d;paint();}
        return;
      }
      if(!touch.dragging){
        const atOpen=touch.startScroll<=1&&dy>0,atCard=touch.startScroll>=d-1&&touch.startScroll<=d+1&&dy<0;
        if(atOpen||atCard||(touch.startScroll>1&&touch.startScroll<d-1))touch.dragging=true;
      }
      if(!touch.dragging)return;
      event.preventDefault();app.scrollTop=Math.max(0,Math.min(d,touch.origin+dy*.38));paint();
    }
    function onTouchEnd(event) {
      if(!touch)return;
      const gesture=touch;touch=null;
      if(!gesture.dragging){settleTimer=setTimeout(settle,160);return;}
      const sign=gesture.origin===0?1:-1;
      const travel=(gesture.startY-gesture.lastY)*sign;
      const velocity=performance.now()-gesture.lastAt<100?gesture.velocity*sign:0;
      const advance=event.type!=='touchcancel'&&(travel>=48||(travel>=12&&velocity>.35));
      snapTo(advance?(gesture.origin===0?range():0):gesture.origin);
    }
    function onKeyDown(event) {
      if(blocked()||interactive(event.target)||event.ctrlKey||event.metaKey||event.altKey)return;
      detailFloor=false;
      const direction=['ArrowDown','PageDown'].includes(event.key)||(event.key===' '&&!event.shiftKey)?1:['ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:0;
      if(direction&&app.scrollTop<=range()+1&&(app.scrollTop<range()-1||direction<0)){event.preventDefault();snapTo(direction>0?range():0);}
    }
    function revealDetails() {snapTo(range());}
    function finishTransition() {
      const y=app.scrollTop,d=range(),target=snapFrame?snapTarget:y>=d/2?d:0;
      stopSnap();wheel=null;touch=null;clearTimeout(wheelTimer);
      if(y>0&&y<d){app.scrollTop=target;paint();}
    }
    const cue=page.querySelector('.result-scroll-cue');
    cue.addEventListener('click',revealDetails);
    app.addEventListener('scroll',onScroll,{passive:true});
    app.addEventListener('wheel',onWheel,{passive:false});
    app.addEventListener('touchstart',onTouchStart,{passive:true});
    app.addEventListener('touchmove',onTouchMove,{passive:false});
    app.addEventListener('touchend',onTouchEnd);
    app.addEventListener('touchcancel',onTouchEnd);
    app.addEventListener('keydown',onKeyDown);
    reduced.addEventListener('change',queue);
    const observer=new ResizeObserver(measure);observer.observe(app);
    measure();
    return {refresh:paint,finishTransition,destroy(){
      destroyed=true;
      stopSnap();clearTimeout(wheelTimer);cancelAnimationFrame(frame);observer.disconnect();app.removeEventListener('scroll',onScroll);
      app.removeEventListener('wheel',onWheel);app.removeEventListener('touchstart',onTouchStart);app.removeEventListener('touchmove',onTouchMove);
      app.removeEventListener('touchend',onTouchEnd);app.removeEventListener('touchcancel',onTouchEnd);app.removeEventListener('keydown',onKeyDown);
      reduced.removeEventListener('change',queue);cue.removeEventListener('click',revealDetails);
      phone.classList.remove('result-on-photo');
    }};
  }
  return {destination,mount};
})();
