/* Destination music for the exploration view: one seamless loop per city (rendered by scripts/build-bgm.cjs).
   Each file is a loop period plus a short hand-off with baked fades, so a new copy starts every `loop` seconds
   and neighbouring copies overlap back into continuous music. Web Audio does the fades because iOS ignores
   media-element volume. Music only plays after a tap or key press (browser autoplay rules). */
(()=>{
  const TRACKS=window.BGM_TRACKS||{},KEY='tripwonder-bgm-muted',LEVEL=.6;
  const FADE_IN=1.4,FADE_OUT=.7,SWITCH=1,LEAD_IN=1.5,AC=window.AudioContext||window.webkitAudioContext;
  let ctx=null,master=null,track=null,want=null,muted=false,idleTimer=0,unlocked=false;
  const raw=new Map(),decoded=new Map();
  try{muted=localStorage.getItem(KEY)==='1';}catch{}

  const target=()=>muted||document.hidden?null:want;
  const glide=(param,value,seconds)=>{const t=ctx.currentTime;param.cancelScheduledValues(t);param.setTargetAtTime(value,t,seconds/4);};

  function context(){
    if(ctx||!AC)return ctx;
    try{ctx=new AC();}catch{return null;}
    master=ctx.createGain();master.gain.value=LEVEL;master.connect(ctx.destination);
    ctx.onstatechange=()=>{if(ctx.state==='running')unlocked=true;};
    unlocked=ctx.state==='running';
    return ctx;
  }
  // The first start must happen inside a gesture on iOS; afterwards the context may resume on its own.
  function unlock(){
    if(!context()||ctx.state==='closed'||ctx.state==='running'||(unlocked&&!target()))return;
    ctx.resume().then(()=>{unlocked=true;apply();},()=>{});
    if(!unlocked){const blip=ctx.createBufferSource();blip.buffer=ctx.createBuffer(1,1,ctx.sampleRate);blip.connect(ctx.destination);blip.start();}
  }
  ['pointerup','touchend','click','keydown'].forEach(type=>window.addEventListener(type,unlock,{capture:true,passive:true}));

  // Pages opened straight from disk cannot fetch files, so they load the same MP3 wrapped in a script.
  function fromScript(id){
    return new Promise((resolve,reject)=>{
      const el=document.createElement('script');el.src=TRACKS[id].local;
      el.onerror=()=>{el.remove();reject(new Error('Missing local music'));};
      el.onload=()=>{
        el.remove();const text=window.BGM_LOCAL?.[id];if(!text)return reject(new Error('Missing local music'));delete window.BGM_LOCAL[id];
        const bytes=atob(text),out=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)out[i]=bytes.charCodeAt(i);
        resolve(out.buffer);
      };
      document.head.append(el);
    });
  }
  // Keeps the three most recent downloads so returning to a city does not fetch again.
  function fetchRaw(id){
    if(raw.has(id)){const hit=raw.get(id);raw.delete(id);raw.set(id,hit);return hit;}
    const job=location.protocol==='file:'&&TRACKS[id].local?fromScript(id):fetch(TRACKS[id].src).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.arrayBuffer();});
    job.catch(()=>raw.delete(id));
    raw.set(id,job);
    while(raw.size>3)raw.delete(raw.keys().next().value);
    return job;
  }
  function decode(id){
    if(!decoded.has(id)){
      const job=fetchRaw(id).then(buf=>new Promise((resolve,reject)=>{const p=ctx.decodeAudioData(buf.slice(0),resolve,reject);p?.then?.(resolve,reject);}));
      job.catch(()=>decoded.delete(id));
      decoded.set(id,job);
    }
    return decoded.get(id);
  }

  function schedule(t){
    if(t.stopped)return;
    const src=ctx.createBufferSource();src.buffer=t.buffer;src.connect(t.gain);
    const when=Math.max(t.next,ctx.currentTime+.02);
    src.start(when);t.next=when+t.loop;t.sources.add(src);
    src.onended=()=>{t.sources.delete(src);src.disconnect();schedule(t);};
  }
  // Starts LEAD_IN seconds before the loop point so the fade-in leads into the opening downbeat.
  function begin(id,buffer){
    const gain=ctx.createGain();gain.gain.value=0;gain.connect(master);
    const loop=TRACKS[id].loop,start=ctx.currentTime+.05,t={id,buffer,gain,loop,next:start+LEAD_IN,sources:new Set(),stopped:false};
    const lead=ctx.createBufferSource();lead.buffer=buffer;lead.connect(gain);lead.start(start,loop-LEAD_IN);t.sources.add(lead);
    lead.onended=()=>{t.sources.delete(lead);lead.disconnect();};
    schedule(t);schedule(t);
    glide(gain.gain,1,FADE_IN);
    return t;
  }
  function end(t,seconds){
    if(!t)return;
    t.stopped=true;glide(t.gain.gain,0,seconds);
    const at=ctx.currentTime+seconds*1.5;
    t.sources.forEach(src=>{src.onended=null;try{src.stop(at);}catch{}});
    setTimeout(()=>{t.gain.disconnect();if(t.id!==want)decoded.delete(t.id);},seconds*1500+200);
  }
  // Fades out and suspends the context so a paused track keeps its place and costs nothing.
  function scheduleIdle(){
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{if(!target()&&ctx?.state==='running')ctx.suspend().catch(()=>{});},FADE_OUT*1500+150);
  }

  function apply(){
    const id=target();
    if(!ctx)return;
    if(!id){if(track)glide(track.gain.gain,0,FADE_OUT);scheduleIdle();return;}
    clearTimeout(idleTimer);
    if(ctx.state!=='running')ctx.resume().catch(()=>{});
    if(track?.id===id){glide(track.gain.gain,1,FADE_IN);return;}
    if(track){end(track,SWITCH);track=null;}
    decode(id).then(buffer=>{if(target()===id&&!track&&ctx.state!=='closed')track=begin(id,buffer);},()=>{});
  }

  function sync(id){
    const next=id&&TRACKS[id]?id:null;
    if(next===want)return;
    want=next;
    if(track&&track.id!==want&&want){end(track,SWITCH);track=null;}
    apply();
  }
  function setMuted(value){
    muted=!!value;
    try{localStorage.setItem(KEY,muted?'1':'0');}catch{}
    if(!muted)unlock();
    apply();
  }
  function prefetch(id){if(TRACKS[id])fetchRaw(id).catch(()=>{});}
  // Leaves the track silent so it fades back in when the page returns.
  function pause(){
    if(track){track.gain.gain.cancelScheduledValues(0);track.gain.gain.value=0;}
    if(ctx?.state==='running')ctx.suspend().catch(()=>{});
  }

  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else apply();});
  window.addEventListener('pageshow',event=>{if(event.persisted)apply();});

  window.SceneBGM={sync,prefetch,setMuted,pause,
    isMuted:()=>muted,
    title:id=>TRACKS[id]?{zh:TRACKS[id].title,en:TRACKS[id].titleEn}:null,
    state:()=>({context:ctx?.state||'none',want,playing:track?.id||null,copies:track?.sources.size||0,gain:track?track.gain.gain.value:0,level:master?master.gain.value:0,muted,unlocked})};
})();
