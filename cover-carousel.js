/* Cover-only gestures. Decode the next photograph before committing its city. */
window.CoverCarousel=(()=>{
  'use strict';
  let wheelCooldownUntil=0;
  function mount(page,{getDestination,prepare,canInteract,commit,onError}){
    const abort=new AbortController(),hero=page.querySelector('.cover-hero');
    const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
    const on=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:abort.signal});
    let destroyed=false,busy=false,gesture=null,preview=null,previewDirection=0,previewPromise=null;
    let offset=0,generation=0,animations=[],disabled=[],wheelX=0,wheelTimer,wheelBlocked=false;
    const width=()=>page.clientWidth;
    function lock(value){
      if(value&&!busy){disabled=[...page.querySelectorAll('button')].map(button=>[button,button.disabled]);disabled.forEach(([button])=>button.disabled=true);}
      busy=value;page.classList.toggle('cover-changing',value);
      if(value)page.setAttribute('aria-busy','true');
      else{page.removeAttribute('aria-busy');disabled.forEach(([button,wasDisabled])=>button.disabled=wasDisabled);disabled=[];}
    }
    function position(x){
      offset=x;
      // Reduced-motion users get the same selection without sliding photographs.
      hero.style.transform=reduced()?'':`translate3d(${x}px,0,0)`;
      if(preview)preview.style.transform=`translate3d(${previewDirection*width()+x}px,0,0)`;
    }
    function clearPreview(){generation++;preview?.remove();preview=null;previewPromise=null;previewDirection=0;}
    function requestPreview(direction){
      if(previewDirection===direction&&previewPromise)return previewPromise;
      clearPreview();previewDirection=direction;
      const destination=getDestination(direction),ticket=generation;
      if(!destination)return Promise.resolve(null);
      previewPromise=prepare(destination).then(image=>{
        if(destroyed||ticket!==generation)return null;
        preview=document.createElement('div');preview.className='cover-hero cover-preview';preview.setAttribute('aria-hidden','true');
        const clone=image.cloneNode();clone.alt='';preview.append(clone);page.insertBefore(preview,hero);
        position(offset);return {destination,image};
      });
      return previewPromise;
    }
    async function slide(element,to,duration){
      if(!element||reduced())return;
      const animation=element.animate([{transform:element.style.transform||'translate3d(0,0,0)'},{transform:`translate3d(${to}px,0,0)`}],{duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
      animations.push(animation);await animation.finished.catch(()=>{});
    }
    function reset(){
      animations.forEach(a=>a.cancel());animations=[];hero.style.transform='';offset=0;
      page.classList.remove('cover-dragging');clearPreview();lock(false);
    }
    async function settleBack(){
      lock(true);await Promise.all([slide(hero,0,280),slide(preview,previewDirection*width(),280)]);
      if(!destroyed)reset();
    }
    async function change(direction){
      if(destroyed||busy||!canInteract())return;
      lock(true);
      try{
        const ready=await requestPreview(direction);
        if(destroyed)return;
        if(!ready||!canInteract()){await settleBack();return;}
        await Promise.all([slide(hero,-direction*width(),420),slide(preview,0,420)]);
        if(destroyed)return;
        if(!canInteract()){reset();return;}
        // render() destroys this controller. City state changes only here.
        const keyboardFocus=page.contains(document.activeElement);
        commit(ready.destination,ready.image.cloneNode());
        if(keyboardFocus)document.querySelector('.cover-page .cover-hero')?.focus({preventScroll:true});
      }catch(error){
        if(destroyed)return;
        await settleBack();if(!destroyed&&error.name!=='AbortError')onError();
      }
    }
    function releaseCapture(id){try{if(page.hasPointerCapture(id))page.releasePointerCapture(id);}catch{}}
    function cancelGesture(){
      if(!gesture)return;
      const previous=gesture;gesture=null;releaseCapture(previous.id);
      if(previous.axis==='x'&&!busy)settleBack();
    }
    on(page,'pointerdown',event=>{
      if(gesture){if(event.pointerId!==gesture.id)cancelGesture();return;}
      if(busy||!canInteract()||!event.isPrimary||event.button!==0||event.target.closest('button,a,input,select,textarea'))return;
      gesture={id:event.pointerId,x:event.clientX,y:event.clientY,at:performance.now(),axis:null,dx:0};
    });
    on(page,'pointermove',event=>{
      if(!gesture||event.pointerId!==gesture.id)return;
      const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
      if(!gesture.axis){
        if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
        if(Math.abs(dy)>Math.abs(dx)*1.1){gesture=null;return;}
        gesture.axis='x';page.setPointerCapture(event.pointerId);page.classList.add('cover-dragging');
      }
      event.preventDefault();gesture.dx=dx;
      requestPreview(dx<0?1:-1).catch(()=>{});
      position(Math.sign(dx)*Math.min(Math.abs(dx)*.85,width()*.85));
    },{passive:false});
    on(page,'pointerup',event=>{
      if(!gesture||event.pointerId!==gesture.id)return;
      const previous=gesture;gesture=null;releaseCapture(previous.id);
      if(previous.axis!=='x')return;
      const distance=Math.abs(previous.dx),velocity=distance/Math.max(1,performance.now()-previous.at);
      if(canInteract()&&(distance>=Math.min(70,width()*.17)||(distance>22&&velocity>.45)))change(previous.dx<0?1:-1);
      else settleBack();
    });
    on(page,'pointercancel',cancelGesture);on(page,'lostpointercapture',cancelGesture);
    on(window,'blur',cancelGesture);on(window,'resize',()=>{if(!busy)cancelGesture();});
    on(page,'dragstart',event=>event.preventDefault());
    on(page,'wheel',event=>{
      if(!canInteract()||Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;
      event.preventDefault();clearTimeout(wheelTimer);
      wheelTimer=setTimeout(()=>{wheelX=0;wheelBlocked=false;},180);
      if(performance.now()<wheelCooldownUntil){wheelCooldownUntil=performance.now()+180;return;}
      if(busy||wheelBlocked)return;
      wheelX+=event.deltaX*(event.deltaMode===1?16:1);
      if(Math.abs(wheelX)>44){wheelBlocked=true;wheelCooldownUntil=performance.now()+600;change(wheelX>0?1:-1);}
    },{passive:false});
    on(page,'keydown',event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select'))return;
      if(busy||!canInteract())return;
      event.preventDefault();change(event.key==='ArrowRight'?1:-1);
    });
    return {destroy(){destroyed=true;abort.abort();clearTimeout(wheelTimer);gesture=null;reset();}};
  }
  return {mount};
})();
