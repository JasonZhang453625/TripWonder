/* A question's photograph is decorative: never expose the destination name. */
window.QuizScene = (() => {
  const requests = new WeakMap();
  const toneSources = new Map();
  let active;
  const ink='#000000',paper='#ffffff';
  const linear=value=>{value/=255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;};
  function toneSource(id) {
    if(toneSources.has(id))return toneSources.get(id);
    const tone=window.QUIZ_SCENE_TONES?.[id];
    if(!tone)throw new Error('Missing scene contrast map');
    const source=document.createElement('canvas');source.width=tone.width;source.height=tone.height;
    const ctx=source.getContext('2d'),pixels=ctx.createImageData(tone.width,tone.height),rgb=atob(tone.rgb);
    for(let i=0,j=0;i<rgb.length;i+=3,j+=4){
      pixels.data[j]=rgb.charCodeAt(i);pixels.data[j+1]=rgb.charCodeAt(i+1);pixels.data[j+2]=rgb.charCodeAt(i+2);pixels.data[j+3]=255;
    }
    ctx.putImageData(pixels,0,0);toneSources.set(id,source);return source;
  }
  function destroy() {
    if(!active)return;
    cancelAnimationFrame(active.frame);
    active.observer.disconnect();
    active.app.removeEventListener('scroll',active.schedule);
    active.status.forEach(element=>{element.style.removeProperty('color');delete element.dataset.photoInk;});
    active=null;
  }
  function mount(page,backdrop) {
    if(active?.page===page)return active;
    destroy();
    const phone=page.closest('.phone'),app=page.parentElement,canvas=document.createElement('canvas');
    const state={page,backdrop,app,phone,canvas,context:canvas.getContext('2d',{willReadFrequently:true}),frame:0,until:0,status:[...phone.querySelectorAll('.statusbar')]};
    state.schedule=()=>{
      if(active!==state||state.frame)return;
      state.frame=requestAnimationFrame(()=>{
        state.frame=0;
        if(!page.isConnected)return;
        contrast(state);
        if(performance.now()<state.until)state.schedule();
      });
    };
    state.observer=new ResizeObserver(state.schedule);
    active=state;
    state.observer.observe(page);state.observer.observe(phone);
    app.addEventListener('scroll',state.schedule,{passive:true});
    return state;
  }
  function contrast({page,backdrop,canvas,context:ctx,status}) {
    if(!ctx)return;
    const box=backdrop.getBoundingClientRect(),width=160,height=Math.max(1,Math.round(width*box.height/box.width));
    if(!box.width||!box.height)return;
    canvas.width=width;canvas.height=height;
    ctx.fillStyle='#f8faff';ctx.fillRect(0,0,width,height);
    const targets=[page.querySelector('.quiz-question'),page.querySelector('.quiz-header strong'),...status].filter(element=>element?.getClientRects().length);
    try {
      // Local files taint a canvas drawn from <img>. Sample the bundled RGB map
      // instead, with the same cover crop, crossfade and gradient as the photo.
      for(const image of backdrop.querySelectorAll('img')){
        if(!image.complete||!image.naturalWidth)continue;
        const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
        ctx.globalAlpha=Number(getComputedStyle(image).opacity);
        ctx.drawImage(toneSource(image.dataset.sceneId),(width-w)*.5,(height-h)*.4,w,h);
      }
      ctx.globalAlpha=1;
      const shade=ctx.createLinearGradient(0,0,0,height);
      const stops=[[0,'#0716260d'],[.18,'#07162600'],[.42,'#07162640'],[.58,'#07162670'],[1,'#0716268c']];
      stops.forEach(([offset,color])=>shade.addColorStop(offset,color));ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
      const pixels=ctx.getImageData(0,0,width,height).data;
      for(const element of targets){
        const rect=element.getBoundingClientRect(),levels=[];
        for(let y=0;y<8;y++)for(let x=0;x<16;x++){
          const px=Math.floor((rect.left-box.left+rect.width*(x+.5)/16)/box.width*width),py=Math.floor((rect.top-box.top+rect.height*(y+.5)/8)/box.height*height);
          if(px<0||px>=width||py<0||py>=height){levels.push(1);continue;}
          const i=(py*width+px)*4;levels.push(.2126*linear(pixels[i])+.7152*linear(pixels[i+1])+.0722*linear(pixels[i+2]));
        }
        levels.sort((a,b)=>a-b);
        // Use the typical luminance under the text, with a small dead band to
        // avoid flickering between black and white while two scenes crossfade.
        const light=levels[Math.floor(levels.length/2)],threshold=element.dataset.photoInk==='light' ? .185 : .175;
        const useWhite=light<threshold;
        element.style.color=useWhite?paper:ink;element.dataset.photoInk=useWhite?'light':'dark';
      }
      page.dataset.contrastSource='local-map';
    }catch {
      page.dataset.contrastSource='fallback';
      targets.forEach(element=>{element.style.color=paper;element.dataset.photoInk='light';});
    }
  }
  function set(page,city,question) {
    const backdrop=page?.querySelector('.quiz-backdrop');
    if(!backdrop)return;
    const state=mount(page,backdrop);state.schedule();
    const scene=city.scenes.find(scene=>scene.id===question.sceneId);
    if(!scene)return;
    if(backdrop.dataset.sceneId===scene.id || requests.get(backdrop)?.sceneId===scene.id)return;
    const request={sceneId:scene.id};requests.set(backdrop,request);
    const asset=SceneMedia.source(scene.photo,true),image=new Image(asset.width,asset.height);
    image.className='quiz-scene-photo';image.dataset.sceneId=scene.id;image.alt='';image.decoding='async';image.draggable=false;
    const current=()=>page.isConnected&&requests.get(backdrop)===request;
    const fallback=()=>{
      if(!current())return;
      // Keep the readable gradient if an asset fails, rather than showing a
      // photograph from a different question or blocking the quiz timer.
      backdrop.querySelectorAll('img').forEach(photo=>photo.remove());
      backdrop.dataset.sceneId=scene.id;backdrop.dataset.imageFailed='true';
      requests.delete(backdrop);
      state.schedule();
    };
    image.onerror=fallback;
    image.onload=async()=>{
      try {await image.decode();} catch {fallback();return;}
      if(!current())return;
      const outgoing=[...backdrop.querySelectorAll('img')];
      backdrop.append(image);backdrop.dataset.sceneId=scene.id;delete backdrop.dataset.imageFailed;
      requests.delete(backdrop);
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){outgoing.forEach(photo=>photo.remove());state.schedule();return;}
      const transition=image.animate([{opacity:0},{opacity:1}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
      state.until=performance.now()+520;state.schedule();
      transition.finished.catch(()=>{}).finally(()=>{outgoing.forEach(photo=>photo.remove());transition.cancel();state.schedule();});
    };
    image.src=asset.src;
  }
  return {set,destroy};
})();
