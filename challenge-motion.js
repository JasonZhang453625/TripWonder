/* Motion for the quiz-to-reveal journey. Selection never remounts the page. */
window.ChallengeMotion=(()=>{
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease='cubic-bezier(.22,1,.36,1)';
  let serial=0,busy=false,active=[],slideCleanup=null;
  const presses=new WeakMap();
  const scrollPositions=new Map();
  function animate(element,frames,options={}){
    if(!element||reduce())return Promise.resolve();
    const animation=element.animate(frames,{duration:360,easing:ease,...options});
    return animation.finished.catch(()=>{});
  }
  function setBusy(value){
    busy=value;
    const app=document.querySelector('#app');
    app.classList.toggle('flow-changing',value);
    if(value)app.setAttribute('aria-busy','true');else app.removeAttribute('aria-busy');
  }
  function cancel(){
    serial++;
    active.forEach(animation=>animation.cancel());active=[];
    slideCleanup?.();slideCleanup=null;
    setBusy(false);
  }
  function track(element,frames,options={}){
    if(!element||reduce())return Promise.resolve();
    const animation=element.animate(frames,{duration:360,easing:ease,...options});
    active.push(animation);return animation.finished.catch(()=>{});
  }
  async function run(commit,{kind='page',back=false,force=false}={}){
    if(busy&&!force)return false;
    cancel();const ticket=serial;setBusy(true);
    const app=document.querySelector('#app');
    const outgoing=kind==='question'?[...app.querySelectorAll('.quiz-top,.quiz-options')]:[app.querySelector(':scope > .page')];
    try{
      await Promise.all(outgoing.map(element=>track(element,[{opacity:1,transform:'translate3d(0,0,0)'},{opacity:0,transform:kind==='question'?`translate3d(${back?16:-16}px,0,0)`:'translate3d(0,-8px,0)'}],{duration:130,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'})));
      if(ticket!==serial)return false;
      await commit();
      if(ticket!==serial)return false;
      active.forEach(animation=>animation.cancel());active=[];
      const page=app.querySelector(':scope > .page');
      if(page?.classList.contains('quiz-page')){
        const nodes=kind==='question'?[page.querySelector('.quiz-top'),...page.querySelectorAll('.option')]:[page.querySelector('.quiz-header'),page.querySelector('.quiz-top'),...page.querySelectorAll('.option'),page.querySelector('.quiz-submit')];
        await Promise.all(nodes.map((node,i)=>track(node,[{opacity:0,transform:`translate3d(${kind==='question'?back?-16:16:0}px,${kind==='question'?0:14}px,0)`},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:340,delay:i*24,fill:'both'})));
      }else{
        await Promise.all([
          track(page,[{opacity:0,transform:'translate3d(0,12px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:420,fill:'both'}),
          track(page?.querySelector('.guess-card'),[{opacity:0,transform:'translate3d(0,24px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:450,delay:65,fill:'both'})
        ]);
      }
      if(ticket===serial){
        const heading=page?.querySelector('.quiz-question');heading?.focus({preventScroll:true});
      }
      return true;
    }finally{
      if(ticket===serial){active.forEach(animation=>animation.cancel());active=[];setBusy(false);}
    }
  }
  // Prepare media while the current page stays visible, then commit synchronously.
  // Both page nodes remain under #app so their existing scoped styles keep working.
  async function slide(commit,{back=false,force=false,prepare}={}){
    if(busy&&!force)return false;
    cancel();const ticket=serial;setBusy(true);
    const app=document.querySelector('#app');
    const key=page=>['trip-home','atlas-page','ranking-page','cover-page'].find(name=>page?.classList.contains(name));
    const padding=element=>{const css=getComputedStyle(element);return {padding:css.padding,'box-sizing':css.boxSizing};};
    const capture=page=>({page,rect:page.getBoundingClientRect(),padding:padding(page),floats:[...page.querySelectorAll('.th-ai,.th-nav,:scope > .immersive-top,:scope > .cover-footer,:scope > .cover-hero')].map(element=>({element,rect:element.getBoundingClientRect(),padding:padding(element)}))});
    let cleanup;
    try{
      const ready=prepare?await prepare():undefined;
      if(ticket!==serial)return false;
      const outgoing=app.querySelector(':scope > .page'),fromKey=key(outgoing);
      if(fromKey)scrollPositions.set(fromKey,{top:app.scrollTop,left:app.scrollLeft});
      const before=outgoing&&capture(outgoing);
      const pending=commit(ready);
      // Legacy async commits retain their own transition. New media routes should
      // use prepare above so no target page can flash before its slide starts.
      if(pending&&typeof pending.then==='function'){await pending;return ticket===serial;}
      if(ticket!==serial)return false;
      const incoming=app.querySelector(':scope > .page'),toKey=key(incoming);
      if(!incoming||incoming===outgoing||!fromKey||!toKey)return true;
      const saved=back&&scrollPositions.get(toKey);
      if(saved){app.scrollTop=saved.top;app.scrollLeft=saved.left;}
      if(reduce())return true;
      const after=capture(incoming),viewport=app.getBoundingClientRect();
      const targetScroll={top:app.scrollTop,left:app.scrollLeft},restores=[];
      const remember=(element,name)=>{
        const value=element.getAttribute(name);
        restores.push(()=>{if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);});
      };
      const style=(element,values)=>{
        remember(element,'style');
        for(const [name,value] of Object.entries(values))element.style.setProperty(name,value,'important');
      };
      const freezeFloats=({page,rect,floats})=>{
        for(const {element,rect:box,padding:boxPadding} of floats)style(element,{
          ...boxPadding,
          position:'absolute',left:`${box.left-rect.left-page.clientLeft}px`,top:`${box.top-rect.top-page.clientTop}px`,
          width:`${box.width}px`,height:`${box.height}px`,right:'auto',bottom:'auto',margin:'0'
        });
      };
      cleanup=()=>{
        outgoing.remove();
        for(const restore of restores.reverse())restore();
        if(incoming.isConnected){
          app.scrollTop=targetScroll.top;app.scrollLeft=targetScroll.left;
          // Restoring the base .page rule must not replay its legacy fade.
          incoming.getAnimations().filter(animation=>animation.animationName==='fade').forEach(animation=>animation.finish());
        }
      };
      slideCleanup=cleanup;
      // Transform/position create a containing block. Freeze the phone-anchored
      // home controls before that happens, including scrolled and safe-area views.
      freezeFloats(before);freezeFloats(after);
      style(app,{position:'relative',overflow:'hidden','overflow-anchor':'none'});
      style(incoming,{position:'relative','z-index':back?'1':'2',animation:'none',transition:'none','will-change':'transform, filter',isolation:'isolate'});
      style(outgoing,{
        ...before.padding,
        position:'absolute',left:`${before.rect.left-viewport.left-app.clientLeft+targetScroll.left}px`,
        top:`${before.rect.top-viewport.top-app.clientTop+targetScroll.top}px`,width:`${before.rect.width}px`,
        height:`${before.rect.height}px`,'min-height':'0',margin:'0','z-index':back?'2':'1',
        animation:'none',transition:'none','will-change':'transform, filter',isolation:'isolate','pointer-events':'none'
      });
      for(const [page,layer] of [[outgoing,'outgoing'],[incoming,'incoming']]){
        remember(page,'inert');remember(page,'data-slide-layer');page.inert=true;page.dataset.slideLayer=layer;
      }
      remember(outgoing,'aria-hidden');outgoing.setAttribute('aria-hidden','true');
      for(const element of [outgoing,...outgoing.querySelectorAll('[id]')])if(element.id){remember(element,'id');element.removeAttribute('id');}
      app.append(outgoing);app.scrollTop=targetScroll.top;app.scrollLeft=targetScroll.left;
      const front=back?outgoing:incoming;
      style(front,{'box-shadow':'-10px 0 28px rgba(18,31,53,.12)'});
      const options={duration:420,easing:'cubic-bezier(.32,.72,0,1)',fill:'both'};
      await Promise.all([
        track(outgoing,back?
          [{transform:'translate3d(0,0,0)'},{transform:'translate3d(100%,0,0)'}]:
          [{transform:'translate3d(0,0,0)',filter:'brightness(1)'},{transform:'translate3d(-28%,0,0)',filter:'brightness(.94)'}],options),
        track(incoming,back?
          [{transform:'translate3d(-28%,0,0)',filter:'brightness(.94)'},{transform:'translate3d(0,0,0)',filter:'brightness(1)'}]:
          [{transform:'translate3d(100%,0,0)'},{transform:'translate3d(0,0,0)'}],options)
      ]);
      return ticket===serial;
    }catch(error){
      if(ticket!==serial)return false;
      throw error;
    }finally{
      if(ticket===serial){
        active.forEach(animation=>animation.cancel());active=[];
        if(slideCleanup===cleanup){slideCleanup?.();slideCleanup=null;}
        setBusy(false);
      }
    }
  }
  function press(button){
    if(!button||button.disabled||reduce()||busy)return;
    presses.get(button)?.cancel();
    const animation=button.animate([{scale:1},{scale:.965,offset:.3},{scale:1}],{duration:260,easing:ease});
    presses.set(button,animation);
  }
  function select(button){
    animate(button?.querySelector('.option-check'),[{opacity:0,scale:.55},{opacity:1,scale:1}],{duration:260});
  }
  function activate(button){animate(button,[{opacity:.6,scale:.985},{opacity:1,scale:1}],{duration:300});}
  function update(element){animate(element,[{opacity:.25,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:280});}
  function reveal(card,heading){
    animate(card,[{opacity:.35,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:420});
    update(heading);
  }
  function dialogIn(overlay){
    overlay.classList.add('flow-dialog');
    animate(overlay,[{opacity:0},{opacity:1}],{duration:200});
    animate(overlay.querySelector('.sheet'),[{opacity:0,translate:'0 26px',scale:.98},{opacity:1,translate:'0 0',scale:1}],{duration:360});
  }
  async function dialogOut(overlay,done){
    if(overlay.classList.contains('closing'))return;
    overlay.classList.add('closing');
    await Promise.all([
      animate(overlay,[{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}),
      animate(overlay.querySelector('.sheet'),[{translate:'0 0'},{translate:'0 18px'}],{duration:160,fill:'forwards'})
    ]);
    if(overlay.isConnected)done();
  }
  return {run,slide,cancel,press,select,activate,update,reveal,dialogIn,dialogOut,get busy(){return busy;}};
})();
