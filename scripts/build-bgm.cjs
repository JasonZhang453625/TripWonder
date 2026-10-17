/* Renders the destination music heard while exploring scenes: one original, seamless loop per city.
   Everything is synthesized here (plucked strings, winds, bells, choir, pads, drums); no samples or recordings.
   Each file holds one loop period plus a HANDLE-second hand-off. The player starts a new copy every `loop`
   seconds, and the baked fade-out of one copy plus the fade-in of the next sum back to the continuous loop.
   Usage: node scripts/build-bgm.cjs --ffmpeg <ffmpeg> [--only <cityId>] [--wav <dir>]
   Writes assets/bgm/<city>.mp3, bgm-manifest.js, and bgm-local/<city>.js: the same MP3 as a script for pages
   opened straight from disk, where browsers refuse to fetch local files. bgm-local/ is left out of both builds. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');

const SR=44100,HANDLE=3,TARGET_LUFS=-18,CEILING=10**(-1.5/20),TAU=2*Math.PI;
const root=path.resolve(__dirname,'..'),outDir=path.join(root,'assets/bgm'),localDir=path.join(root,'bgm-local');
const arg=name=>{const i=process.argv.indexOf(name);return i>0?process.argv[i+1]:null;};
const FFMPEG=arg('--ffmpeg')||process.env.FFMPEG||'ffmpeg';

/* ---------- basics ---------- */
const prng=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const midi=n=>{if(typeof n==='number')return n;const m=/^([A-G])([#b]?)(-?\d)$/.exec(n);if(!m)throw Error(`Bad note ${n}`);return 12*(Number(m[3])+1)+SEMI[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);};
const hz=n=>440*2**((midi(n)-69)/12);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const secs=s=>Math.round(s*SR);
const sin2=x=>{const s=Math.sin(Math.PI/2*clamp(x,0,1));return s*s;};
const scale=(sig,g)=>{for(let i=0;i<sig.length;i++)sig[i]*=g;return sig;};
const peakOf=sig=>{let p=1e-12;for(const x of sig)p=Math.max(p,Math.abs(x));return p;};
const fadeTail=(sig,s=.03)=>{const k=Math.min(sig.length,secs(s));for(let i=0;i<k;i++)sig[sig.length-1-i]*=i/k;return sig;};
const noise=(n,rand)=>{const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=rand()*2-1;return o;};

// RBJ biquad coefficients, normalized: [b0,b1,b2,a1,a2].
function coeffs(type,f,q=Math.SQRT1_2,db=0){
  const w=TAU*Math.min(f,SR*.45)/SR,cs=Math.cos(w),al=Math.sin(w)/(2*q),A=10**(db/40),r=2*Math.sqrt(A)*al;
  let b0,b1,b2,a0,a1,a2;
  if(type==='lp'){b0=(1-cs)/2;b1=1-cs;b2=b0;a0=1+al;a1=-2*cs;a2=1-al;}
  else if(type==='hp'){b0=(1+cs)/2;b1=-(1+cs);b2=b0;a0=1+al;a1=-2*cs;a2=1-al;}
  else if(type==='bp'){b0=al;b1=0;b2=-al;a0=1+al;a1=-2*cs;a2=1-al;}
  else if(type==='hs'){b0=A*((A+1)+(A-1)*cs+r);b1=-2*A*((A-1)+(A+1)*cs);b2=A*((A+1)+(A-1)*cs-r);a0=(A+1)-(A-1)*cs+r;a1=2*((A-1)-(A+1)*cs);a2=(A+1)-(A-1)*cs-r;}
  else throw Error(type);
  return [b0/a0,b1/a0,b2/a0,a1/a0,a2/a0];
}
// In-place biquad. circular=true treats the buffer as one loop period: a first pass settles the state.
function filter(buf,c,circular=false){
  const [b0,b1,b2,a1,a2]=c;let z1=0,z2=0;
  for(let pass=circular?0:1;pass<2;pass++)for(let i=0;i<buf.length;i++){const x=buf[i],y=b0*x+z1;z1=b1*x-a1*y+z2;z2=b2*x-a2*y;if(pass)buf[i]=y;}
  return buf;
}
// Zavalishin state-variable lowpass with a per-sample cutoff fc(i).
function svfLow(buf,fc,q=Math.SQRT1_2,circular=false){
  const k=1/q;let s1=0,s2=0,a1=0,a2=0,a3=0;
  for(let pass=circular?0:1;pass<2;pass++)for(let i=0;i<buf.length;i++){
    if((i&15)===0){const g=Math.tan(Math.PI*clamp(fc(i),20,SR*.45)/SR);a1=1/(1+g*(g+k));a2=g*a1;a3=g*a2;}
    const v3=buf[i]-s2,v1=a1*s1+a2*v3,v2=s2+a2*s1+a3*v3;s1=2*v1-s1;s2=2*v2-s2;if(pass)buf[i]=v2;
  }
  return buf;
}
const TBL=4096;
function wavetable(amps,phases){
  const t=new Float32Array(TBL+1);
  amps.forEach((a,h)=>{if(!a)return;const ph=phases?phases[h]:0;for(let i=0;i<TBL;i++)t[i]+=a*Math.sin(TAU*(h+1)*i/TBL+ph);});
  t[TBL]=t[0];return t;
}
const look=(t,ph)=>{const x=ph*TBL,i=x|0;return t[i]+(t[i+1]-t[i])*(x-i);};

/* ---------- instruments (each returns a mono Float32Array or [L,R]) ---------- */
// Karplus-Strong string with fractional (cubic) delay, pitch bends, re-strikes for tremolo and a resonant body.
const BODIES={
  zheng:[[160,2.2,.45],[390,2.8,.5],[950,3,.3],[2500,2.5,.18]],
  qin:[[105,2,.55],[230,2.5,.45],[520,3,.25]],
  pipa:[[280,3,.4],[760,3,.5],[2100,2.5,.35]],
  yangqin:[[420,2.5,.35],[1500,2.5,.4],[3600,2,.3]],
  guitar:[[105,2.5,.5],[215,3,.45],[460,3,.3],[1200,2,.15]]
};
function pluck(note,o={}){
  const {decay=3,bright=.5,body='zheng',pick=.13,slide=null,vib=null,strikes=[{t:0,amp:1}],damp=null,nail=.03,seed=1}=o;
  const f0=hz(note),rand=prng(seed*7919+midi(note)*13);
  const last=Math.max(...strikes.map(s=>s.t)),len=o.len||last+Math.min(decay*1.05+.05,12);
  const N=secs(len),out=new Float32Array(N),inp=new Float32Array(N);
  const P=Math.max(2,Math.round(SR/f0)),fc=Math.min(8000,f0*(2+bright*14)),a=Math.exp(-TAU*fc/SR),pk=Math.max(1,Math.round(P*pick));
  for(const st of strikes){
    const e=new Float32Array(P),c=new Float32Array(P);let lp=0,lp2=0,mean=0;
    for(let pass=0;pass<2;pass++)for(let i=0;i<P;i++){lp=(1-a)*(rand()*2-1)+a*lp;lp2=(1-a)*lp+a*lp2;if(pass)e[i]=lp2;}
    for(let i=0;i<P;i++){c[i]=e[i]-(i>=pk?e[i-pk]:0);mean+=c[i]/P;}
    for(let i=0;i<P;i++)c[i]-=mean;
    const g=st.amp/peakOf(c),i0=secs(st.t);
    for(let i=0;i<P&&i0+i<N;i++)inp[i0+i]+=c[i]*g;
  }
  const s=.5-.42*clamp(bright,0,1),mag=Math.sqrt((1-s)**2+s*s+2*s*(1-s)*Math.cos(TAU*f0/SR));
  const g=Math.min(.99995,10**(-3/(decay*f0))/mag),gd=10**(-3/(.12*f0))/mag,dampAt=damp==null?Infinity:secs(damp);
  const size=1<<Math.ceil(Math.log2(SR/f0*2.2+8)),mask=size-1,line=new Float32Array(size);
  const bend=t=>{
    let st=0;
    if(slide){if(t<=slide[0][0])st=slide[0][1];else if(t>=slide.at(-1)[0])st=slide.at(-1)[1];else for(let k=1;k<slide.length;k++)if(t<slide[k][0]){const [t0,v0]=slide[k-1],[t1,v1]=slide[k];st=v0+(v1-v0)*sin2((t-t0)/(t1-t0));break;}}
    if(vib&&t>vib.delay){const u=t-vib.delay;st+=vib.depth*Math.min(1,u/(vib.ramp||.3))*Math.sin(TAU*vib.rate*u);}
    return st;
  };
  let w=0,prev=0,D=SR/f0-s;
  for(let n=0;n<N;n++){
    if((slide||vib)&&(n&15)===0)D=SR/(f0*2**(bend(n/SR)/12))-s;
    const rp=w-D,ri=Math.floor(rp),fr=rp-ri;
    const xm1=line[(ri-1)&mask],x0=line[ri&mask],x1=line[(ri+1)&mask],x2=line[(ri+2)&mask];
    const y=x0+.5*fr*(x1-xm1+fr*(2*xm1-5*x0+4*x1-x2+fr*(3*(x0-x1)+x2-xm1)));
    const v=(n<dampAt?g:gd)*((1-s)*y+s*prev)+inp[n];prev=y;
    line[w&mask]=v;w++;out[n]=v;
  }
  const dry=Float32Array.from(out);
  for(const [f,q,amt] of BODIES[body]||[]){const b=filter(Float32Array.from(dry),coeffs('bp',f,q));for(let i=0;i<N;i++)out[i]+=b[i]*amt;}
  if(nail)for(const st of strikes){
    const k=secs(.012),i0=secs(st.t),z=filter(noise(k,rand),coeffs('bp',3600,1.1));
    for(let i=0;i<k&&i0+i<N;i++)out[i0+i]+=z[i]*nail*st.amp*Math.exp(-i/(SR*.004));
  }
  return fadeTail(filter(out,coeffs('hp',45)));
}
// Re-strikes for a plucked tremolo (摇指 / 轮指).
function tremolo(d,rate=13,rand=Math.random){
  const out=[];for(let t=0;t<d;t+=1/rate)out.push({t:t+(rand()-.5)*.008,amp:(.55+.25*Math.sin(Math.PI*t/d))*(.9+rand()*.2)});
  out[0].amp=1;return out;
}
// Pure sine-like harmonic (guqin 泛音).
function ping(note,decay=2.4){
  const f=hz(note),N=secs(decay),out=new Float32Array(N),k=Math.exp(-6.9/(decay*SR));let e=1;
  for(let n=0;n<N;n++){const t=n/SR;out[n]=Math.min(1,t/.004)*e*(Math.sin(TAU*f*t)+.08*Math.sin(TAU*2*f*t)+.03*Math.sin(TAU*3*f*t));e*=k;}
  return fadeTail(out);
}
// Bells: inharmonic partials [ratio, amp, T60, beating Hz] plus a struck transient.
const BELLS={
  temple:{p:[[.5,.55,16,.35],[1,1,11,.6],[1.19,.55,7,.9],[1.5,.4,5,.7],[2,.45,4.5,1.1],[2.52,.22,3,1.3],[2.99,.18,2.2,.8],[4.07,.1,1.4,1.5],[5.3,.06,.9,2]],strike:.35,hz:900},
  qing:{p:[[1,1,7,.6],[2.76,.45,3,.9],[5.4,.2,1.4,1.3],[8.93,.08,.6,1.7]],strike:.12,hz:2500},
  zhong:{p:[[1,1,5,.4],[2,.5,3.2,.7],[2.4,.35,2.6,.6],[3,.25,1.8,.9],[4.2,.12,1.1,1.2],[5.4,.06,.7,1.6]],strike:.2,hz:1600}
};
function bell(note,kind,{len=8,seed=1}={}){
  const f0=hz(note),B=BELLS[kind],rand=prng(seed),N=secs(len),out=new Float32Array(N);
  for(const [ratio,amp,dec,beat] of B.p){
    const f=f0*ratio;if(f>SR*.45)continue;
    const w1=TAU*f/SR,w2=TAU*(f+beat)/SR,p1=rand()*TAU,p2=rand()*TAU,k=Math.exp(-6.9/(dec*SR));let e=amp*.5;
    for(let n=0;n<N;n++){out[n]+=e*(Math.sin(w1*n+p1)+Math.sin(w2*n+p2));e*=k;}
  }
  for(let n=0;n<secs(.003);n++)out[n]*=n/secs(.003);
  const k=secs(.06),z=filter(noise(k,rand),coeffs('lp',B.hz));
  for(let i=0;i<k;i++)out[i]+=z[i]*B.strike*Math.exp(-i/(SR*.012));
  return fadeTail(out,.5);
}
// Wind instruments: one continuous voice per phrase list, with slurs, grace notes, vibrato and breath.
const WINDS={
  dizi:{harm:[1,.55,.32,.2,.12,.08,.05,.03],buzz:.035,breath:.05,breathHz:3200,vib:{rate:5.4,depth:.18,delay:.22},atk:.05,rel:.12,glide:.06},
  xiao:{harm:[1,.22,.07,.03,.015],buzz:0,breath:.12,breathHz:1700,vib:{rate:4.6,depth:.12,delay:.32},atk:.1,rel:.22,glide:.09},
  hulusi:{harm:[1,.06,.42,.05,.22,.04,.11,.03,.05],buzz:0,breath:.035,breathHz:2400,vib:{rate:5,depth:.15,delay:.25},atk:.06,rel:.15,glide:.05}
};
function wind(kind,notes,o={}){
  const c={...WINDS[kind],...o},rand=prng(o.seed||1);
  notes=[...notes].sort((a,b)=>a.t-b.t);
  const N=secs(notes.at(-1).t+notes.at(-1).d+c.rel+.3);
  const fr=new Float32Array(N),am=new Float32Array(N),onset=new Float32Array(N);
  notes.forEach((x,k)=>{
    const nx=notes[k+1],pv=notes[k-1],f=hz(x.n),i0=secs(x.t),i1=secs(x.t+x.d),rel=secs(c.rel);
    const joined=!!pv&&x.t-(pv.t+pv.d)<.03,stop=nx?Math.min(secs(nx.t),i1+rel):i1+rel;
    const fp=pv?hz(pv.n):f,g=x.grace?hz(x.grace):0,vel=x.v??1;
    for(let i=i0;i<stop&&i<N;i++){
      const t=(i-i0)/SR;let fi=f;
      if(g&&t<.075)fi=t<.05?g:g+(f-g)*(t-.05)/.025;
      else if(joined&&t<c.glide)fi=fp+(f-fp)*sin2(t/c.glide);
      if(x.d>.5&&t>c.vib.delay){const u=t-c.vib.delay;fi*=2**(c.vib.depth*Math.min(1,u/.4)*Math.sin(TAU*c.vib.rate*u)/12);}
      fr[i]=fi;
      let a=t<c.atk?(joined?.78+.22*t/c.atk:sin2(t/c.atk)):1-.14*Math.min(1,(t-c.atk)/Math.max(.25,x.d))+.08*Math.sin(Math.PI*Math.min(1,t/x.d));
      if(i>=i1)a*=1-(i-i1)/rel;
      am[i]=Math.max(0,a)*vel;
    }
    if(!joined&&i0<N)onset[i0]=vel;
  });
  const sm=Math.exp(-1/(SR*.006));let z=0;for(let i=0;i<N;i++){z=am[i]+(z-am[i])*sm;am[i]=z;}
  const br=filter(noise(N,rand),coeffs('bp',c.breathHz,.7)),out=new Float32Array(N),H=c.harm,norm=H.reduce((s,x)=>s+x,0);
  const dk=Math.exp(-1/(SR*.05)),droneF=c.drone?hz(c.drone):0;
  let ph=0,dph=0,ch=0,act=0,lastF=hz(notes[0].n);
  for(let i=0;i<N;i++){
    const f=fr[i]||lastF;lastF=f;ph+=f/SR;ph-=Math.floor(ph);
    ch=onset[i]?onset[i]:ch*dk;
    const a=am[i];act=a>act?act+(a-act)*.0002:act+(a-act)*.00005;
    let s=0;
    if(a>1e-5){
      const bright=a**.35;let b=1;
      for(let h=0;h<H.length&&f*(h+1)<SR*.45;h++){s+=H[h]*b*Math.sin(TAU*(h+1)*ph);b*=bright;}
      if(c.buzz)for(let h=6;h<12&&f*h<SR*.45;h++)s+=c.buzz*a*Math.sin(TAU*h*ph)/(h-4);
      s=s*a/norm+br[i]*(c.breath*a+c.breath*1.4*ch);
    }
    if(droneF){dph+=droneF/SR;dph-=Math.floor(dph);s+=act*.32*(Math.sin(TAU*dph)+.35*Math.sin(TAU*3*dph)+.15*Math.sin(TAU*5*dph))/1.5;}
    out[i]=s;
  }
  return fadeTail(out);
}
// Formant choir: several detuned singers on one vowel.
const VOWELS={a:[[800,100,1],[1150,120,.5],[2900,160,.22],[3900,200,.08]],u:[[325,60,1],[700,80,.25],[2530,170,.05]],o:[[450,80,1],[800,100,.4],[2830,150,.12]]};
function choir(note,d,{vowel='a',voices=4,atk=.8,rel=1.6,detune=9,vib=.12,seed=1}={}){
  const f=hz(note),rand=prng(seed+midi(note)*31),amps=[];
  for(let h=1;h*f<5200;h++){const x=h*f;let g=.015;for(const [fc,bw,a] of VOWELS[vowel])g+=a/(1+((x-fc)/bw)**2);amps.push(g/h**.35);}
  const norm=amps.reduce((s,x)=>s+x,0)*Math.sqrt(voices),N=secs(d+rel),L=new Float32Array(N),R=new Float32Array(N);
  for(let v=0;v<voices;v++){
    const tbl=wavetable(amps,amps.map(()=>rand()*TAU)),cents=(rand()*2-1)*detune,vr=4.6+rand()*1.2,vph=rand()*TAU,dr=.13+rand()*.2,dph=rand()*TAU;
    const pan=voices>1?(v/(voices-1)*2-1)*.7:0,gl=Math.cos((pan+1)*Math.PI/4)/norm,gr=Math.sin((pan+1)*Math.PI/4)/norm;
    let ph=rand();
    for(let n=0;n<N;n++){
      const t=n/SR,st=cents/100+vib*Math.sin(TAU*vr*t+vph)*Math.min(1,t/.6)+.06*Math.sin(TAU*dr*t+dph);
      ph+=f*2**(st/12)/SR;ph-=Math.floor(ph);
      const e=t<atk?sin2(t/atk):t>d?1-sin2((t-d)/rel):1,y=look(tbl,ph)*e;
      L[n]+=y*gl;R[n]+=y*gr;
    }
  }
  return [L,R];
}
// Sustained pads from detuned wavetable voices.
const SPECTRA={
  saw:h=>1/h, soft:h=>1/(h*h), square:h=>h%2?1/h:.04/h,
  sheng:h=>[1,.7,.55,.42,.35,.25,.2,.15,.12,.1][h-1]??.08/h
};
function pad(notes,d,{atk=1.5,rel=2,cutoff=1800,voices=3,detune=7,spectrum='saw',seed=1,width=.8}={}){
  const rand=prng(seed),N=secs(d+rel),L=new Float32Array(N),R=new Float32Array(N);
  for(const note of notes){
    const f=hz(note),amps=[];
    for(let h=1;h*f<Math.min(SR*.45,cutoff*4);h++)amps.push(SPECTRA[spectrum](h)/Math.sqrt(1+(h*f/cutoff)**4));
    const norm=amps.reduce((s,x)=>s+x,0)*Math.sqrt(voices*notes.length);
    for(let v=0;v<voices;v++){
      const tbl=wavetable(amps,amps.map(()=>rand()*TAU)),cents=voices>1?(v/(voices-1)*2-1)*detune:0;
      const pan=voices>1?(v/(voices-1)*2-1)*width:0,gl=Math.cos((pan+1)*Math.PI/4)/norm,gr=Math.sin((pan+1)*Math.PI/4)/norm;
      const inc=f*2**(cents/1200)/SR,dr=.1+rand()*.15,dph=rand()*TAU;let ph=rand();
      for(let n=0;n<N;n++){
        const t=n/SR;ph+=inc*(1+.0007*Math.sin(TAU*dr*t+dph));ph-=Math.floor(ph);
        const e=t<atk?sin2(t/atk):t>d?1-sin2((t-d)/rel):1,y=look(tbl,ph)*e;
        L[n]+=y*gl;R[n]+=y*gr;
      }
    }
  }
  return [L,R];
}
// FM electric piano (tine + bar).
function epiano(note,d,{vel=.6,bright=1}={}){
  const f=hz(note),T=clamp(5*(196/f)**.55,1.4,7),N=secs(Math.min(d+.6,T+.2)),out=new Float32Array(N);
  for(let n=0;n<N;n++){
    const t=n/SR,I=(.3+1.6*vel*bright)*Math.exp(-t/.35)+.25*bright;
    let a=Math.min(1,t/.002)*Math.exp(-6.9*t/T);if(t>d)a*=Math.exp(-(t-d)/.08);
    const y=Math.sin(TAU*f*t+I*Math.sin(TAU*f*t)),tine=.14*vel*Math.sin(TAU*f*7*t)*Math.exp(-t/.06);
    out[n]=Math.tanh(1.3*a*(y*.8+tine))/1.3*(.4+vel);
  }
  return fadeTail(out);
}
// Vibraphone: 1:4:10 bar partials and a mallet click (motor tremolo is applied on the bus).
function vibes(note,d,{vel=.7,seed=1}={}){
  const f=hz(note),T=clamp(4.5*(440/f)**.3,2,6),N=secs(Math.min(d+.5,T)),out=new Float32Array(N),rand=prng(seed);
  for(let n=0;n<N;n++){
    const t=n/SR;let a=Math.min(1,t/.002);if(t>d)a*=Math.exp(-(t-d)/.15);
    out[n]=a*(Math.sin(TAU*f*t)*Math.exp(-6.9*t/T)+.3*Math.sin(TAU*4*f*t)*Math.exp(-6.9*t/(T*.22))+.08*Math.sin(TAU*10*f*t)*Math.exp(-6.9*t/(T*.05)))*vel;
  }
  const k=secs(.006),z=filter(noise(k,rand),coeffs('bp',2200,1.2));for(let i=0;i<k;i++)out[i]+=z[i]*.08*vel;
  return fadeTail(out);
}
// Upright bass: plucked harmonics with faster-decaying overtones and a finger thump.
function upright(note,d,{vel=.8,seed=1}={}){
  const f=hz(note),N=secs(d+.15),out=new Float32Array(N),rand=prng(seed),H=[1,.55,.32,.18,.1,.06];
  for(let n=0;n<N;n++){
    const t=n/SR,fi=f*(1+.006*Math.exp(-t/.03));let a=Math.min(1,t/.006);if(t>d)a*=Math.exp(-(t-d)/.05);
    let s=0;H.forEach((h,k)=>{s+=h*Math.sin(TAU*fi*(k+1)*t)*Math.exp(-t*(1+k*1.2)/1.6);});
    out[n]=a*s*vel*.6;
  }
  const k=secs(.03),z=filter(noise(k,rand),coeffs('lp',600));for(let i=0;i<k;i++)out[i]+=z[i]*.25*vel*(1-i/k);
  return fadeTail(out);
}
// Sine sub bass with a touch of second harmonic.
function sub(note,d,{atk=.01,rel=.12,vel=1,h2=.15}={}){
  const f=hz(note),N=secs(d+rel),out=new Float32Array(N);
  for(let n=0;n<N;n++){const t=n/SR,e=t<atk?t/atk:t>d?1-(t-d)/rel:1;out[n]=e*vel*(Math.sin(TAU*f*t)+h2*Math.sin(TAU*2*f*t));}
  return out;
}
// Felt piano: soft hammer, slightly stretched partials.
function felt(note,d,{vel=.6,seed=1}={}){
  const f=hz(note),T=clamp(7*(110/f)**.5,1.5,9),N=secs(Math.min(d+1.2,T)+.1),out=new Float32Array(N),rand=prng(seed);
  for(let h=1;h<=8;h++){
    const fh=f*h*Math.sqrt(1+.0004*h*h);if(fh>SR*.45)break;
    const amp=1/h**2*(vel**(.2*h)),Th=T/(1+.7*(h-1)),k=Math.exp(-6.9/(Th*SR)),ph=rand()*TAU;let e=amp;
    for(let n=0;n<N;n++){out[n]+=e*Math.sin(TAU*fh*n/SR+ph);e*=k;}
  }
  for(let n=0;n<N;n++){const t=n/SR;out[n]*=Math.min(1,t/.008)*(t>d?Math.exp(-(t-d)/.3):1)*vel;}
  return fadeTail(out);
}
// Subtractive pluck: band-limited saw through an enveloped resonant lowpass.
const sawCache=new Map();
function synthPluck(note,{decay=.18,cut=900,env=3200,q=1.4,len=.45,vel=.6}={}){
  const f=hz(note),key=midi(note);
  if(!sawCache.has(key)){const amps=[];for(let h=1;h*f<SR*.42;h++)amps.push(1/h);sawCache.set(key,wavetable(amps));}
  const tbl=sawCache.get(key),N=secs(len),out=new Float32Array(N);let ph=0;
  for(let n=0;n<N;n++){ph+=f/SR;ph-=Math.floor(ph);out[n]=look(tbl,ph)*.5*Math.min(1,n/secs(.003))*Math.exp(-6.9*n/N);}
  svfLow(out,i=>cut+env*Math.exp(-i/(SR*decay)),q);
  return fadeTail(scale(out,vel));
}
// FM bell / glockenspiel tone.
function fmBell(note,d,{ratio=3.01,index=1.6,decay=1.5,vel=.7}={}){
  const f=hz(note),N=secs(Math.min(d+decay,decay*1.6)),out=new Float32Array(N);
  for(let n=0;n<N;n++){
    const t=n/SR,I=index*vel*Math.exp(-t/(decay*.35));let a=Math.min(1,t/.003)*Math.exp(-6.9*t/(decay*1.6));if(t>d)a*=Math.exp(-(t-d)/.25);
    out[n]=a*vel*Math.sin(TAU*f*t+I*Math.sin(TAU*f*ratio*t));
  }
  return fadeTail(out);
}
// Drums and percussion.
function kick({f1=48,f0=140,decay=.45,click=.3,drop=.035,vel=1,seed=5}={}){
  const N=secs(decay*1.2),o=new Float32Array(N),rand=prng(seed);let ph=0;
  for(let n=0;n<N;n++){const t=n/SR,f=f1+(f0-f1)*Math.exp(-t/drop);ph+=f/SR;o[n]=Math.sin(TAU*ph)*Math.exp(-t*6.9/decay)*Math.min(1,t/.0015);if(t<.004)o[n]+=click*(rand()*2-1)*(1-t/.004);}
  return fadeTail(scale(o,vel),.01);
}
function snare({tone=185,decay=.2,noiseHz=1900,tight=.5,vel=1,seed=3,lp=9000}={}){
  const N=secs(decay*1.5),rand=prng(seed),z=filter(filter(noise(N,rand),coeffs('bp',noiseHz,.55)),coeffs('lp',lp));
  for(let n=0;n<N;n++){const t=n/SR;z[n]=(z[n]*1.6*Math.exp(-t*6.9/decay)+tight*Math.sin(TAU*tone*t)*Math.exp(-t/.05))*Math.min(1,t/.001)*vel;}
  return fadeTail(z,.01);
}
function clap({vel=1,seed=4}={}){
  const N=secs(.35),rand=prng(seed),z=filter(noise(N,rand),coeffs('bp',1300,.9));
  for(let n=0;n<N;n++){const t=n/SR;let e=Math.exp(-t/.11)*.6;for(const b of [0,.011,.022])if(t>=b&&t<b+.008)e=Math.max(e,1-(t-b)/.008);z[n]*=e*vel*1.5;}
  return fadeTail(z,.01);
}
const HAT_HZ=[205.3,304.4,369.6,522.7,540,800];
function hat({decay=.045,vel=1,seed=6}={}){
  const N=secs(decay*3+.01),rand=prng(seed),o=new Float32Array(N),nz=noise(N,rand);
  for(let n=0;n<N;n++){const t=n/SR;let m=0;for(const f of HAT_HZ)m+=Math.sign(Math.sin(TAU*f*1.7*t));o[n]=(m*.12+nz[n]*.6)*Math.exp(-t*6.9/(decay*3));}
  filter(o,coeffs('hp',7000));filter(o,coeffs('hp',7000));filter(o,coeffs('lp',13000));
  return fadeTail(scale(o,vel*1.4),.005);
}
function ride({vel=1,seed=7}={}){
  const N=secs(1.6),rand=prng(seed),o=new Float32Array(N),parts=[];
  for(let k=0;k<10;k++)parts.push([3100+rand()*5200,rand()*TAU,.6+rand()*1.1]);
  for(let n=0;n<N;n++){const t=n/SR;let s=0;for(const [f,p,d] of parts)s+=Math.sin(TAU*f*t+p)*Math.exp(-6.9*t/d);o[n]=s*.07;}
  const k=secs(.02),z=filter(noise(k,rand),coeffs('bp',5200,1));for(let i=0;i<k;i++)o[i]+=z[i]*.5*(1-i/k);
  filter(o,coeffs('hp',2500));filter(o,coeffs('lp',10000));
  return fadeTail(scale(o,vel),.05);
}
function brush(d,{vel=1,seed=8}={}){
  const N=secs(d),rand=prng(seed),z=filter(filter(noise(N,rand),coeffs('lp',3200)),coeffs('hp',600));
  for(let n=0;n<N;n++)z[n]*=Math.sin(Math.PI*n/N)**1.5*vel*.35;
  return z;
}
function taiko({f=62,decay=1.8,vel=1,seed=9}={}){
  const N=secs(decay*1.1),rand=prng(seed),o=new Float32Array(N),z=filter(noise(secs(.12),rand),coeffs('lp',350));let p1=0,p2=0;
  for(let n=0;n<N;n++){const t=n/SR,fi=f*(1+.35*Math.exp(-t/.03));p1+=fi/SR;p2+=fi*1.59/SR;
    o[n]=(Math.sin(TAU*p1)*Math.exp(-6.9*t/decay)+.35*Math.sin(TAU*p2)*Math.exp(-6.9*t/(decay*.35))+(n<z.length?z[n]*1.5*Math.exp(-t/.04):0))*Math.min(1,t/.002)*vel;}
  return fadeTail(o,.1);
}
function tok({f=820,decay=.07,vel=1,seed=10}={}){
  const N=secs(decay*2.5),rand=prng(seed),o=new Float32Array(N),z=filter(noise(secs(.004),rand),coeffs('bp',f*2.2,1.2));let ph=0;
  for(let n=0;n<N;n++){const t=n/SR;ph+=f*(1+.15*Math.exp(-t/.006))/SR;o[n]=Math.sin(TAU*ph)*Math.exp(-6.9*t/decay)*vel+(n<z.length?z[n]*.6*vel:0);}
  return fadeTail(o,.01);
}
function shaker({len=.09,vel=1,seed=11}={}){
  const N=secs(len),rand=prng(seed),z=filter(noise(N,rand),coeffs('bp',5500,.8));
  for(let n=0;n<N;n++){const t=n/len/SR;z[n]*=vel*1.2*(t<.25?t/.25:Math.exp(-(t-.25)*6));}
  return z;
}
function cymbal({decay=2.4,vel=1,seed=12}={}){
  const N=secs(decay*1.1),rand=prng(seed),z=filter(filter(noise(N,rand),coeffs('hp',4000)),coeffs('lp',11000));
  for(let n=0;n<N;n++)z[n]*=Math.exp(-6.9*n/(decay*SR))*Math.min(1,n/secs(.004))*vel*.5;
  return fadeTail(z,.1);
}
function riser(d,{from=300,to=7000,vel=1,seed=13}={}){
  const N=secs(d),rand=prng(seed),z=noise(N,rand);
  svfLow(z,i=>from*(to/from)**(i/N),2.2);
  for(let n=0;n<N;n++)z[n]*=vel*(n/N)**2*.8;
  return fadeTail(z,.05);
}
function horn(notes,d,{vel=1}={}){
  const N=secs(d+.6),out=new Float32Array(N);
  for(const note of notes){const f=hz(note);let ph=0;
    for(let n=0;n<N;n++){const t=n/SR;ph+=f*(1+.003*Math.sin(TAU*5.5*t))/SR;let s=0;for(let h=1;h<=14;h++)s+=Math.sin(TAU*h*ph)/h;const e=t<.25?sin2(t/.25):t>d?1-sin2((t-d)/.6):1;out[n]+=s*e*vel*.3;}}
  return filter(filter(out,coeffs('lp',900)),coeffs('lp',900));
}

/* ---------- whole-loop beds (exactly periodic) ---------- */
const cycles=(hzWanted,loop)=>Math.max(1,Math.round(hzWanted*loop)); // integer cycles per loop
function droneBed(n,loop,notes,{harm=[1,.3,.1],levels,lfo=[[4,.25]],seed=1}={}){
  const rand=prng(seed),L=new Float32Array(n),R=new Float32Array(n);
  notes.forEach((note,j)=>{
    const f=cycles(hz(note),loop)/loop,lvl=levels?levels[j]:1,ph=rand()*TAU,lp=lfo.map(([k,d])=>[k,d,rand()*TAU]),pan=(j%2?.3:-.3);
    for(let i=0;i<n;i++){
      const t=i/SR;let s=0;harm.forEach((a,h)=>{s+=a*Math.sin(TAU*f*(h+1)*t+ph*(h+1));});
      let m=1;for(const [k,d,p] of lp)m-=d*(.5+.5*Math.sin(TAU*k*i/n+p));
      const y=s*m*lvl;L[i]+=y*(1-pan)*.5;R[i]+=y*(1+pan)*.5;
    }
  });
  return [L,R];
}
function windBed(n,loop,{seed=1,lo=300,hi=1100,swell=.5}={}){
  const rand=prng(seed),out=[];
  for(let ch=0;ch<2;ch++){
    const z=noise(n,rand),k1=cycles(1/9,loop),k2=cycles(1/23,loop),p1=rand()*TAU,p2=rand()*TAU;
    svfLow(z,i=>lo+(hi-lo)*(.5+.5*Math.sin(TAU*k1*i/n+p1)),1.4,true);
    filter(z,coeffs('hp',120),true);
    for(let i=0;i<n;i++)z[i]*=(1-swell)+swell*(.5+.5*Math.sin(TAU*k2*i/n+p2+ch));
    out.push(z);
  }
  return out;
}
function waterBed(n,loop,{seed=1}={}){
  const rand=prng(seed),out=[];
  for(let ch=0;ch<2;ch++){
    const z=noise(n,rand);filter(z,coeffs('bp',1100,.45),true);filter(z,coeffs('lp',4500),true);
    const k1=cycles(1/6,loop),k2=cycles(.7,loop),p1=rand()*TAU,p2=rand()*TAU;
    for(let i=0;i<n;i++)z[i]*=.55+.3*Math.sin(TAU*k1*i/n+p1)+.15*Math.sin(TAU*k2*i/n+p2);
    out.push(z);
  }
  const count=Math.round(loop*2.5);
  for(let b=0;b<count;b++){
    const len=secs(.03+rand()*.04),f0=350+rand()*700,i0=Math.floor(rand()*n),amp=.15+rand()*.35,side=rand()<.5?0:1;let ph=0;
    for(let i=0;i<len;i++){const u=i/len;ph+=f0*(1+.7*u)/SR;out[side][(i0+i)%n]+=Math.sin(TAU*ph)*Math.sin(Math.PI*u)*amp;}
  }
  return out;
}
function vinylBed(n,loop,{seed=1}={}){
  const rand=prng(seed),L=new Float32Array(n),R=new Float32Array(n);
  for(let i=0;i<n;i++){const h=(rand()*2-1)*.012;L[i]=h;R[i]=h*.6+(rand()*2-1)*.005;}
  const count=Math.round(loop*7);
  for(let k=0;k<count;k++){const i=Math.floor(rand()*n),a=(rand()<.08?.9:.25)*rand()*(rand()<.5?-1:1),ch=rand()<.5?L:R;ch[i]+=a;ch[(i+1)%n]-=a*.6;}
  for(const c of [L,R]){filter(c,coeffs('bp',2600,.5),true);filter(c,coeffs('hp',400),true);}
  return [L,R];
}

/* ---------- mixing ---------- */
class Bus{
  constructor(n,o){this.n=n;this.L=new Float32Array(n);this.R=new Float32Array(n);Object.assign(this,{gain:1,send:0,fx:[],name:''},o);}
  // Adds a mono or stereo signal at time t; the position wraps around the loop.
  add(sig,t,{gain=1,pan=0}={}){
    const stereo=Array.isArray(sig),l=stereo?sig[0]:sig,r=stereo?sig[1]:sig,p=clamp(pan,-1,1);
    const gl=stereo?gain*Math.min(1,1-p):gain*Math.cos((p+1)*Math.PI/4),gr=stereo?gain*Math.min(1,1+p):gain*Math.sin((p+1)*Math.PI/4);
    let j=Math.round(t*SR)%this.n;if(j<0)j+=this.n;
    for(let k=0;k<l.length;k++){this.L[j]+=l[k]*gl;this.R[j]+=r[k]*gr;if(++j>=this.n)j=0;}
  }
}
class Mix{
  constructor(seconds){this.seconds=seconds;this.n=Math.round(seconds*SR);this.buses=[];}
  bus(name,o={}){const b=new Bus(this.n,{name,...o});this.buses.push(b);return b;}
}
const lowpass=f=>(L,R)=>{filter(L,coeffs('lp',f),true);filter(R,coeffs('lp',f),true);};
const highpass=f=>(L,R)=>{filter(L,coeffs('hp',f),true);filter(R,coeffs('hp',f),true);};
const autopan=(m,rate,depth)=>(L,R)=>{const k=cycles(rate,m.seconds);for(let i=0;i<m.n;i++){const s=Math.sin(TAU*k*i/m.n)*depth;L[i]*=1-s;R[i]*=1+s;}};
const trem=(m,rate,depth)=>(L,R)=>{const k=cycles(rate,m.seconds);for(let i=0;i<m.n;i++){const g=1-depth*(.5+.5*Math.sin(TAU*k*i/m.n));L[i]*=g;R[i]*=g;}};
const sat=drive=>(L,R)=>{for(let i=0;i<L.length;i++){L[i]=Math.tanh(drive*L[i])/drive;R[i]=Math.tanh(drive*R[i])/drive;}};
// Tape wow: a slowly modulated delay, circular over the loop.
const wow=(m,rate,depthMs)=>(L,R)=>{
  const k=cycles(rate,m.seconds),n=m.n,base=secs(depthMs/1000)+2,d=secs(depthMs/1000);
  for(const ch of [L,R]){const src=Float32Array.from(ch);for(let i=0;i<n;i++){const rp=i-base-d*Math.sin(TAU*k*i/n);const ri=Math.floor(rp),fr=rp-ri,a=src[((ri%n)+n)%n],b=src[(((ri+1)%n)+n)%n];ch[i]=a+(b-a)*fr;}}
};
// Sidechain-style ducking from known kick times (seconds within the loop).
const duck=(m,times,depth=.5,release=.18)=>{
  const env=new Float32Array(m.n).fill(1),span=secs(release*5),pre=secs(.006);
  for(const t of times){const i0=Math.round(t*SR);
    for(let j=-pre;j<span;j++){const g=j<0?1-depth*(1+j/pre):1-depth*Math.exp(-j/(release*SR));const i=((i0+j)%m.n+m.n)%m.n;if(g<env[i])env[i]=g;}}
  return (L,R)=>{for(let i=0;i<m.n;i++){L[i]*=env[i];R[i]*=env[i];}};
};
// Freeverb (Jezar), run twice over the loop so the tail wraps into the start.
function freeverb(inL,inR,{room=.84,damp=.4,width=1,predelay=.02}={}){
  const n=inL.length,outL=new Float32Array(n),outR=new Float32Array(n),spread=23;
  const fb=room*.28+.7,d1=damp*.4,d2=1-d1,mk=len=>({buf:new Float32Array(len),i:0,store:0});
  const combs=[1116,1188,1277,1356,1422,1491,1557,1617],aps=[556,441,341,225];
  const cl=combs.map(mk),cr=combs.map(l=>mk(l+spread)),al=aps.map(mk),ar=aps.map(l=>mk(l+spread));
  const comb=(c,x)=>{const y=c.buf[c.i];c.store=y*d2+c.store*d1;c.buf[c.i]=x+c.store*fb;if(++c.i>=c.buf.length)c.i=0;return y;};
  const allp=(a,x)=>{const b=a.buf[a.i];a.buf[a.i]=x+b*.5;if(++a.i>=a.buf.length)a.i=0;return b-x;};
  const w1=width/2+.5,w2=(1-width)/2,pd=secs(predelay);
  for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++){
    let j=i-pd;if(j<0)j+=n;
    const x=(inL[j]+inR[j])*.015;let l=0,r=0;
    for(let k=0;k<8;k++){l+=comb(cl[k],x);r+=comb(cr[k],x);}
    for(let k=0;k<4;k++){l=allp(al[k],l);r=allp(ar[k],r);}
    if(pass){outL[i]=l*w1+r*w2;outR[i]=r*w1+l*w2;}
  }
  return [outL,outR];
}
const rms=(L,R)=>{let s=0;for(let i=0;i<L.length;i++)s+=L[i]*L[i]+R[i]*R[i];return Math.sqrt(s/(2*L.length));};
const db=x=>(20*Math.log10(Math.max(x,1e-9))).toFixed(1);
function mixdown(m,rv){
  const n=m.n,L=new Float32Array(n),R=new Float32Array(n),sL=new Float32Array(n),sR=new Float32Array(n),levels=[];
  for(const b of m.buses){
    for(const fx of b.fx)fx(b.L,b.R);
    for(let i=0;i<n;i++){const l=b.L[i]*b.gain,r=b.R[i]*b.gain;L[i]+=l;R[i]+=r;sL[i]+=l*b.send;sR[i]+=r*b.send;}
    levels.push(`${b.name} ${db(rms(b.L,b.R)*b.gain)}`);
  }
  const [wl,wr]=freeverb(sL,sR,rv);
  for(const w of [wl,wr]){filter(w,coeffs('hp',rv.hp||180),true);filter(w,coeffs('lp',rv.lp||7000),true);}
  for(let i=0;i<n;i++){L[i]+=wl[i]*(rv.wet??1)*3;R[i]+=wr[i]*(rv.wet??1)*3;}
  levels.push(`reverb ${db(rms(wl,wr)*(rv.wet??1)*3)}`);
  filter(L,coeffs('hp',28),true);filter(R,coeffs('hp',28),true);
  return {L,R,levels};
}
// ITU-R BS.1770 K-weighted, gated loudness of one loop period.
function lufs(L,R){
  const pre=[...[[1681.974450955533,3.999843853973347,.7071752369554196]].map(([f,g,q])=>coeffs('hs',f,q,g))][0],hp=coeffs('hp',38.13547087602444,.5003270373238773);
  const k=x=>filter(filter(Float32Array.from(x),pre,true),hp,true),l=k(L),r=k(R);
  const block=secs(.4),hop=secs(.1),z=[];
  for(let s=0;s+block<=l.length;s+=hop){let e=0;for(let i=s;i<s+block;i++)e+=l[i]*l[i]+r[i]*r[i];z.push(e/block);}
  const lk=e=>-.691+10*Math.log10(e),abs=z.filter(e=>lk(e)>-70),mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
  const gate=lk(mean(abs))-10;return lk(mean(abs.filter(e=>lk(e)>gate)));
}
// Look-ahead peak limiter, circular over the loop.
function limit(L,R,ceiling=CEILING){
  const n=L.length,ahead=secs(.004),g=new Float32Array(n).fill(1),rel=1-Math.exp(-1/(SR*.12));
  for(let i=0;i<n;i++){const p=Math.max(Math.abs(L[i]),Math.abs(R[i]));if(p>ceiling){const need=ceiling/p;for(let k=0;k<=ahead;k++){const j=(i-ahead+k+n)%n,v=1-(1-need)*k/ahead;if(v<g[j])g[j]=v;}}}
  let e=1;for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++){e=g[i]<e?g[i]:e+(1-e)*rel;if(e>g[i])e=g[i];if(pass){L[i]*=e;R[i]*=e;}}
}

/* ---------- scores ---------- */
function score(bpm,rand){const beat=60/bpm;return{beat,rand,at:(bar,b=0)=>((bar-1)*4+b)*beat,dur:b=>b*beat,hum:(t,ms=8)=>t+(rand()-.5)*ms/500};}
const VIB={yin:{rate:3.2,depth:.12,delay:.35},nao:{rate:2.6,depth:.28,delay:.3},zheng:{rate:4.5,depth:.2,delay:.3}};

// 大同 · 云冈晨钟: temple bells over a low drone, a guqin melody that climbs an octave, chanting voices.
function datong(m,{at,dur,hum,rand}){
  const S=m.seconds;
  const drone=m.bus('drone',{gain:.1,send:.3}),air=m.bus('air',{gain:.08,send:.1}),bells=m.bus('bells',{gain:.55,send:.6});
  const qin=m.bus('qin',{gain:1.1,send:.28,fx:[lowpass(5200)]}),harm=m.bus('harmonics',{gain:.32,send:.6}),voice=m.bus('voices',{gain:.25,send:.5});
  drone.add(droneBed(m.n,S,['D2','A2','D3'],{harm:[1,.35,.12,.05],levels:[1,.55,.3],lfo:[[4,.25],[8,.12]]}),0);
  air.add(windBed(m.n,S,{seed:3,lo:250,hi:900}),0);
  bells.add(bell('D3','temple',{len:16,seed:1}),at(1),{pan:-.1});
  bells.add(bell('D3','temple',{len:16,seed:2}),at(9),{pan:.1,gain:.85});
  bells.add(bell('A4','qing',{len:8,seed:3}),at(5),{pan:.35,gain:.5});
  bells.add(bell('A4','qing',{len:8,seed:4}),at(13),{pan:-.35,gain:.45});
  voice.add(choir('D3',dur(28),{vowel:'u',voices:5,atk:4,rel:4,vib:.05,seed:2}),at(9,.5));
  voice.add(choir('A2',dur(26),{vowel:'u',voices:4,atk:5,rel:4,vib:.05,seed:3}),at(9,2.5),{gain:.7});
  const melody=[
    [2,0,'A3',2,{vib:'nao'}],[2,2,'C4',1],[2,3,'D4',1],
    [3,0,'C4',1.5],[3,1.5,'A3',.5],[3,2,'G3',2,{up:true}],
    [4,0,'A3',1],[4,1,'G3',1],[4,2,'F3',1],[4,3,'G3',1],
    [5,0,'D3',4,{vib:'yin',octave:true}],
    [6,0,'F3',1],[6,1,'G3',1],[6,2,'A3',2,{vib:'nao'}],
    [7,0,'D4',1],[7,1,'C4',1],[7,2,'A3',1],[7,3,'C4',1],
    [8,0,'A3',3,{vib:'nao',down:true}],
    [9,0,'D2',4,{v:.55}],
    [9,2,'A4',2,{vib:'nao'}],[10,0,'G4',1],[10,1,'F4',1,{up:true}],[10,2,'G4',1],[10,3,'A4',1],
    [11,0,'A2',4,{v:.5}],[11,0,'C5',2,{vib:'yin'}],[11,2,'A4',1],[11,3,'G4',1],
    [12,0,'A4',3,{vib:'nao'}],
    [13,0,'F2',4,{v:.5}],[13,0,'D5',2,{vib:'nao'}],[13,2,'C5',1],[13,3,'A4',1],
    [14,0,'G4',1.5],[14,1.5,'A4',.5],[14,2,'G4',1],[14,3,'F4',1],
    [15,0,'D4',4,{vib:'yin',octave:true}]
  ];
  melody.forEach(([bar,b,n,len,o={}],k)=>{
    const t=hum(at(bar,b)),d=dur(len);
    const slide=o.up?[[0,-2],[.16,-2],[.4,0]]:o.down?[[0,0],[d*.55,0],[d*.55+.35,-2]]:null;
    qin.add(pluck(n,{body:'qin',decay:3.4,bright:.24,pick:.18,vib:o.vib?VIB[o.vib]:null,slide,seed:k+1}),t,{gain:o.v||.9,pan:-.08});
    if(o.octave)qin.add(pluck(midi(n)-12,{body:'qin',decay:4,bright:.18,seed:k+50}),t+.012,{gain:.5,pan:-.15});
  });
  [[5,2,'D5'],[5,3,'A5'],[12,2.5,'D5'],[12,3.5,'A4'],[16,0,'D5'],[16,1,'A5'],[16,2,'D6'],[16,3,'A5']]
    .forEach(([bar,b,n],k)=>harm.add(ping(n,2.6),hum(at(bar,b)),{pan:k%2?.4:-.3}));
}

// 北京 · 红墙金瓦: guzheng glissando and arpeggios, a stately zheng melody answered by dizi, bells and hall drum.
function beijing(m,{at,dur,hum,rand}){
  const arp=m.bus('zheng-arp',{gain:.47,send:.3,fx:[lowpass(8500)]}),zh=m.bus('zheng',{gain:1.25,send:.3,fx:[lowpass(9000)]}),di=m.bus('dizi',{gain:.41,send:.3});
  const sheng=m.bus('sheng',{gain:.22,send:.35,fx:[lowpass(2600)]}),perc=m.bus('perc',{gain:.65,send:.45});
  const C={
    D:{arp:['D3','A3','D4','E4','F#4','A4','F#4','E4'],pad:['D3','A3','E4']},
    Bm7:{arp:['B2','F#3','B3','D4','E4','F#4','E4','D4'],pad:['B2','F#3','D4']},
    E7sus:{arp:['E3','B3','D4','E4','A4','E4','D4','B3'],pad:['E3','B3','D4']},
    Asus:{arp:['A2','E3','A3','B3','D4','E4','D4','B3'],pad:['A2','E3','B3']},
    'D/F#':{arp:['F#2','D3','A3','D4','E4','F#4','E4','D4'],pad:['F#3','A3','D4']}
  };
  const prog=['D','D','D','Bm7','E7sus','Asus','D','D/F#','E7sus','Asus','Bm7','D/F#','D','Asus','Bm7','E7sus','Asus','D'];
  ['D3','E3','F#3','A3','B3','D4','E4','F#4','A4','B4','D5','E5','F#5','A5','B5','D6'].forEach((n,k)=>
    arp.add(pluck(n,{body:'zheng',decay:2.8,bright:.6,seed:200+k}),at(1)+k*dur(1)/16,{gain:.35+k*.03,pan:-.5+k/16}));
  prog.forEach((name,i)=>{
    const bar=i+1,c=C[name];
    c.arp.forEach((n,k)=>{if(bar===1&&k<4)return;arp.add(pluck(n,{body:'zheng',decay:2.6,bright:.55,seed:bar*16+k}),hum(at(bar,k*.5)),{gain:(k===0?.85:.5)+rand()*.12,pan:k%2?.25:-.15});});
    sheng.add(pad(c.pad,dur(4)+.2,{atk:.8,rel:1.2,spectrum:'sheng',cutoff:2200,voices:2,detune:4,seed:bar}),at(bar));
  });
  const melA=[[3,0,'A4',1.5],[3,1.5,'B4',.5],[3,2,'A4',1],[3,3,'F#4',1,{up:true}],
    [4,0,'E4',1],[4,1,'F#4',1],[4,2,'D4',2,{vib:true}],
    [5,0,'E4',1],[5,1,'F#4',.5],[5,1.5,'A4',.5],[5,2,'B4',1.5],[5,3.5,'A4',.5],
    [6,0,'A4',3,{trem:true}],
    [7,0,'D5',1.5],[7,1.5,'B4',.5],[7,2,'A4',1],[7,3,'B4',1],
    [8,0,'F#4',1],[8,1,'A4',1],[8,2,'E4',2,{vib:true}],
    [9,0,'D4',1],[9,1,'E4',.5],[9,1.5,'F#4',.5],[9,2,'A4',1],[9,3,'B4',1],
    [10,0,'A4',3,{trem:true}]];
  melA.forEach(([bar,b,n,len,o={}],k)=>{
    const d=dur(len);
    zh.add(pluck(n,{body:'zheng',decay:o.trem?1.6:2.6,bright:.65,seed:300+k,vib:o.vib?VIB.zheng:null,slide:o.up?[[0,-2],[.12,-2],[.3,0]]:null,strikes:o.trem?tremolo(d,13,rand):undefined}),hum(at(bar,b)),{gain:.9,pan:.05});
  });
  const melB=[[11,0,'B5',2,{grace:'D6'}],[11,2,'A5',1],[11,3,'F#5',1],
    [12,0,'A5',1.5],[12,1.5,'F#5',.5,{slur:true}],[12,2,'E5',2],
    [13,0,'D5',1],[13,1,'E5',1,{slur:true}],[13,2,'F#5',1],[13,3,'A5',1],
    [14,0,'E5',3,{grace:'F#5'}],
    [15,0,'F#5',1],[15,1,'A5',1],[15,2,'B5',1.5,{slur:true}],[15,3.5,'D6',.5],
    [16,0,'B5',1],[16,1,'A5',1],[16,2,'F#5',1,{slur:true}],[16,3,'E5',1],
    [17,0,'F#5',1.5,{grace:'A5'}],[17,1.5,'E5',.5],[17,2,'D5',1],[17,3,'E5',1],
    [18,0,'D5',3]];
  di.add(wind('dizi',melB.map(([bar,b,n,l,o={}],k,a)=>({t:hum(at(bar,b),5),d:dur(l)-(a[k+1]?.[4]?.slur||o.slur?0:.06),n,grace:o.grace})),{seed:5}),0,{pan:.12});
  [[1,'D4',.7],[1,'A4',.45],[11,'B3',.6],[15,'B3',.5],[18,'D4',.6]].forEach(([bar,n,g],k)=>perc.add(bell(n,'zhong',{len:6,seed:20+k}),at(bar),{gain:g,pan:k%2?.3:-.3}));
  [[3,0,1],[7,0,.6],[10,3,.5],[11,0,1],[15,0,.8],[18,2,.5]].forEach(([bar,b,v],k)=>perc.add(taiko({f:92,decay:1.1,vel:v,seed:40+k}),at(bar,b),{pan:-.05}));
}

// 苏州 · 姑苏塔影: Jiangnan pipa with tremolo, yangqin ripples and a soft xiao countermelody.
function suzhou(m,{at,dur,hum,rand}){
  const yq=m.bus('yangqin',{gain:.52,send:.3,fx:[lowpass(6500)]}),pipa=m.bus('pipa',{gain:1.16,send:.28,fx:[lowpass(8000)]}),xiao=m.bus('xiao',{gain:.25,send:.38}),strings=m.bus('strings',{gain:.21,send:.4});
  const C={
    G:{arp:['G3','D4','G4','A4','B4','D5','B4','A4'],pad:['G2','D3','B3']},
    Em7:{arp:['E3','B3','E4','G4','B4','D5','B4','G4'],pad:['E2','B2','G3']},
    A7sus:{arp:['A3','E4','G4','A4','D5','E5','D5','A4'],pad:['A2','E3','D4']},
    Dsus:{arp:['D3','A3','D4','E4','A4','B4','A4','E4'],pad:['D3','A3','E4']},
    'G/B':{arp:['B2','G3','D4','E4','G4','B4','G4','E4'],pad:['B2','G3','D4']}
  };
  const prog=[['G'],['Em7'],['A7sus'],['Dsus'],['G'],['Em7'],['A7sus','Dsus'],['G'],['Em7'],['G/B'],['A7sus'],['Dsus'],['Em7'],['A7sus'],['Dsus'],['G']];
  prog.forEach((cs,i)=>{
    const bar=i+1;
    cs.forEach((name,h)=>{
      const c=C[name],notes=cs.length===2?c.arp.slice(h*4,h*4+4):c.arp,step=cs.length===2?.5:.5,off=cs.length===2?h*2:0;
      notes.forEach((n,k)=>yq.add(pluck(n,{body:'yangqin',decay:2.2,bright:.7,pick:.08,nail:.05,seed:bar*20+h*8+k}),hum(at(bar,off+k*step)),{gain:(k===0?.8:.5)+rand()*.12,pan:k%2?.35:-.2}));
      strings.add(pad(c.pad,dur(cs.length===2?2:4)+.1,{atk:.9,rel:1.3,spectrum:'saw',cutoff:1300,voices:3,detune:6,seed:bar*2+h}),at(bar,off));
    });
  });
  const melA=[[1,0,'G4',2,{trem:true,dyad:'D5'}],[1,2,'B4',.5],[1,2.5,'A4',.5],[1,3,'G4',1],
    [2,0,'E4',1.5],[2,1.5,'G4',.5],[2,2,'A4',1],[2,3,'B4',1],
    [3,0,'A4',1],[3,1,'B4',.5],[3,1.5,'D5',.5],[3,2,'E5',1.5],[3,3.5,'D5',.5],
    [4,0,'B4',2,{trem:true}],[4,2,'A4',1],[4,3,'G4',.5],[4,3.5,'A4',.5],
    [5,0,'B4',1],[5,1,'D5',1],[5,2,'G5',1.5,{up:true}],[5,3.5,'E5',.5],
    [6,0,'D5',1],[6,1,'E5',.5],[6,1.5,'D5',.5],[6,2,'B4',2,{trem:true}],
    [7,0,'A4',1],[7,1,'B4',.5],[7,1.5,'A4',.5],[7,2,'A4',1.5],[7,3.5,'B4',.5],
    [8,0,'G4',3,{trem:true,dyad:'D5'}],
    [9,0,'E4',2,{trem:true,dyad:'B4',v:.45}],[13,0,'E4',2,{trem:true,dyad:'B4',v:.45}],[16,2,'D5',.5,{v:.5}],[16,2.5,'E5',.5,{v:.5}],[16,3,'D5',1,{v:.5}]];
  melA.forEach(([bar,b,n,len,o={}],k)=>{
    const d=dur(len),strikes=o.trem?tremolo(d,15,rand):undefined,t=hum(at(bar,b));
    pipa.add(pluck(n,{body:'pipa',decay:o.trem?1.1:1.7,bright:.72,pick:.1,nail:.06,seed:400+k,strikes,slide:o.up?[[0,-2],[.12,-2],[.28,0]]:null}),t,{gain:(o.v||.9),pan:-.12});
    if(o.dyad)pipa.add(pluck(o.dyad,{body:'pipa',decay:1.1,bright:.7,pick:.1,seed:450+k,strikes}),t+.01,{gain:(o.v||.9)*.6,pan:-.05});
  });
  const melB=[[9,0,'B4',2],[9,2,'A4',1],[9,3,'G4',1],
    [10,0,'D5',1.5,{grace:'E5'}],[10,1.5,'B4',.5,{slur:true}],[10,2,'A4',2],
    [11,0,'E4',1],[11,1,'G4',1,{slur:true}],[11,2,'A4',1.5],[11,3.5,'B4',.5],
    [12,0,'A4',3],
    [13,0,'G4',1],[13,1,'A4',1,{slur:true}],[13,2,'B4',1],[13,3,'D5',1],
    [14,0,'E5',2,{grace:'G5'}],[14,2,'D5',1,{slur:true}],[14,3,'B4',1],
    [15,0,'A4',1.5],[15,1.5,'B4',.5,{slur:true}],[15,2,'A4',1],[15,3,'E4',1],
    [16,0,'G4',2.5]];
  xiao.add(wind('xiao',melB.map(([bar,b,n,l,o={}],k,a)=>({t:hum(at(bar,b),5),d:dur(l)-(a[k+1]?.[4]?.slur?0:.07),n,grace:o.grace})),{seed:7}),0,{pan:.15});
}

// 桂林 · 漓水青峰: rippling guzheng over flowing water, a hulusi tune with its drone, light rafting percussion.
function guilin(m,{at,dur,hum,rand}){
  const S=m.seconds;
  const water=m.bus('water',{gain:.08,send:.1}),zh=m.bus('zheng',{gain:.49,send:.3}),bass=m.bus('zheng-bass',{gain:.56,send:.3}),hu=m.bus('hulusi',{gain:.26,send:.3}),perc=m.bus('perc',{gain:.85,send:.2}),pad_=m.bus('pad',{gain:.115,send:.4});
  water.add(waterBed(m.n,S,{seed:4}),0);
  const L={A:['A3','C#4','E4','A4','B4','C#5'],'F#m7':['F#3','A3','C#4','E4','F#4','A4'],B7sus:['B3','E4','F#4','A4','B4','E5'],Esus:['E3','B3','E4','F#4','A4','B4'],'C#m11':['C#4','E4','F#4','B4','C#5','E5']};
  const R={A:'A2','F#m7':'F#2',B7sus:'B2',Esus:'E2','C#m11':'C#3'};
  const prog=['A','A','A','F#m7','B7sus','Esus','A','C#m11','B7sus','A','F#m7','C#m11','A','Esus','F#m7','B7sus','Esus','A','F#m7','Esus'];
  const ripple=[0,1,2,3,1,2,3,4,2,3,4,5,4,3,2,1];
  prog.forEach((name,i)=>{
    const bar=i+1;
    ripple.forEach((idx,k)=>zh.add(pluck(L[name][idx],{body:'zheng',decay:1.8,bright:.62,pick:.12,seed:bar*32+k}),hum(at(bar,k*.25),5),{gain:(k%4===0?.75:.45)+rand()*.12,pan:Math.sin(k/16*TAU)*.5}));
    bass.add(pluck(R[name],{body:'zheng',decay:3.6,bright:.4,seed:bar}),hum(at(bar)),{gain:.9});
    pad_.add(pad(L[name].slice(0,3),dur(4)+.2,{atk:1,rel:1.4,spectrum:'soft',cutoff:1500,voices:3,detune:8,seed:bar}),at(bar));
  });
  for(let bar=11;bar<=18;bar++){
    [1,3].forEach(b=>perc.add(tok({f:520,decay:.09,vel:.8,seed:bar*4+b}),hum(at(bar,b)),{pan:-.3}));
    for(let k=0;k<8;k++)perc.add(shaker({vel:k%2?.35:.55,seed:bar*8+k}),hum(at(bar,k*.5),6),{pan:.4});
  }
  const mel=[[3,0,'E4',.5],[3,.5,'A4',1.5,{slur:true}],[3,2,'B4',1],[3,3,'C#5',1,{grace:'E5'}],
    [4,0,'B4',1],[4,1,'A4',.5],[4,1.5,'F#4',.5,{slur:true}],[4,2,'E4',2],
    [5,0,'F#4',1],[5,1,'A4',1],[5,2,'B4',1.5,{grace:'C#5'}],[5,3.5,'C#5',.5],
    [6,0,'B4',3],
    [7,0,'C#5',1],[7,1,'E5',1],[7,2,'F#5',.5],[7,2.5,'E5',.5,{slur:true}],[7,3,'C#5',1],
    [8,0,'B4',1],[8,1,'C#5',.5],[8,1.5,'B4',.5,{slur:true}],[8,2,'A4',2],
    [9,0,'F#4',1],[9,1,'A4',.5],[9,1.5,'B4',.5],[9,2,'C#5',1],[9,3,'B4',1],
    [10,0,'A4',3],
    [11,0,'C#5',1.5,{grace:'E5'}],[11,1.5,'E5',.5,{slur:true}],[11,2,'F#5',2],
    [12,0,'E5',1],[12,1,'C#5',1],[12,2,'B4',1],[12,3,'C#5',1],
    [13,0,'E5',2,{grace:'F#5'}],[13,2,'C#5',1],[13,3,'A4',1],
    [14,0,'B4',3],
    [15,0,'A4',1],[15,1,'B4',1],[15,2,'C#5',1.5],[15,3.5,'E5',.5],
    [16,0,'F#5',1],[16,1,'E5',1,{slur:true}],[16,2,'C#5',1],[16,3,'B4',1],
    [17,0,'A4',1.5,{grace:'B4'}],[17,1.5,'B4',.5,{slur:true}],[17,2,'A4',1],[17,3,'F#4',1],
    [18,0,'A4',3.5]];
  hu.add(wind('hulusi',mel.map(([bar,b,n,l,o={}],k,a)=>({t:hum(at(bar,b),5),d:dur(l)-(a[k+1]?.[4]?.slur?0:.06),n,grace:o.grace})),{seed:9,drone:'A3'}),0,{pan:.08});
}

// 张家界 · 峰林云海: wind over the peaks, a felt-piano ostinato, strings, a wordless choir and taiko swells.
function zhangjiajie(m,{at,dur,hum,rand}){
  const S=m.seconds;
  const air=m.bus('wind',{gain:.11,send:.2}),piano=m.bus('piano',{gain:.47,send:.3}),str=m.bus('strings',{gain:.36,send:.35,fx:[lowpass(3200)]});
  const voice=m.bus('choir',{gain:.33,send:.4}),drums=m.bus('taiko',{gain:.85,send:.4}),low=m.bus('sub',{gain:.21,send:.05});
  air.add(windBed(m.n,S,{seed:6,lo:220,hi:1400,swell:.6}),0);
  const C={
    Em:{arp:['E3','B3','E4','G4','B4','G4','E4','B3'],pad:['E3','B3','E4','G4'],root:'E2'},
    Cmaj7:{arp:['C3','G3','B3','E4','G4','E4','B3','G3'],pad:['C3','G3','B3','E4'],root:'C2'},
    C:{arp:['C3','G3','C4','E4','G4','E4','C4','G3'],pad:['C3','G3','C4','E4'],root:'C2'},
    G:{arp:['G2','D3','G3','B3','D4','B3','G3','D3'],pad:['G2','D3','B3','D4'],root:'G1'},
    D:{arp:['D3','A3','D4','F#4','A4','F#4','D4','A3'],pad:['D3','A3','D4','F#4'],root:'D2'},
    Dsus:{arp:['D3','A3','D4','G4','A4','G4','D4','A3'],pad:['D3','A3','D4','G4'],root:'D2'}
  };
  const prog=['Em','Cmaj7','G','D','Em','Cmaj7','G','Dsus','C','G','D','Em','C','G','Dsus','D'];
  prog.forEach((name,i)=>{
    const bar=i+1,c=C[name],big=bar>=9;
    c.arp.forEach((n,k)=>piano.add(felt(n,dur(.9),{vel:(k===0?.62:.45)+rand()*.08,seed:bar*8+k}),hum(at(bar,k*.5),6),{pan:k%2?.2:-.2}));
    str.add(pad(c.pad,dur(4)+.3,{atk:1.6,rel:2,spectrum:'saw',cutoff:big?2200:1400,voices:3,detune:9,seed:bar}),at(bar),{gain:big?1:.7});
    if(big)str.add(pad([midi(c.pad[2])+12],dur(4)+.3,{atk:1.8,rel:2,spectrum:'saw',cutoff:2600,voices:3,detune:10,seed:bar+90}),at(bar),{gain:.45});
    if(big)low.add(sub(c.root,dur(4)-.1,{atk:.9,rel:.8,vel:.8}),at(bar));
  });
  const mel=[[5,0,'E5',2],[5,2,'D5',1],[5,3,'B4',1],[6,0,'G4',3],[6,3,'A4',1],[7,0,'B4',2],[7,2,'D5',1.5],[7,3.5,'E5',.5],[8,0,'D5',4],
    [9,0,'E5',2],[9,2,'G5',2],[10,0,'D5',3],[10,3,'B4',1],[11,0,'A4',2],[11,2,'B4',1],[11,3,'D5',1],[12,0,'E5',4],
    [13,0,'G5',2],[13,2,'E5',1],[13,3,'D5',1],[14,0,'B4',2],[14,2,'D5',2],[15,0,'E5',2],[15,2,'D5',1],[15,3,'A4',1],[16,0,'B4',3.5]];
  mel.forEach(([bar,b,n,len],k)=>voice.add(choir(n,dur(len)+.15,{vowel:'a',voices:4,atk:Math.min(.5,dur(len)*.35),rel:1.1,vib:.13,seed:k+3}),at(bar,b)-.08));
  [[1,0,1],[5,0,.6],[8,3.5,.35],[9,0,1],[11,0,.85],[12,3.5,.4],[13,0,1],[15,0,.85],[16,3,.4],[16,3.5,.5]]
    .forEach(([bar,b,v],k)=>drums.add(taiko({f:b?78:56,decay:b?.9:2.2,vel:v,seed:60+k}),at(bar,b),{pan:k%2?.15:-.15}));
}

// 上海 · 外滩旧梦: a 1930s-style swing lounge — rhodes comping, walking upright bass, brushes and vibraphone.
function shanghai(m,{at,dur,hum,rand}){
  const rh=m.bus('rhodes',{gain:.32,send:.22,fx:[autopan(m,4.2,.3),lowpass(4200)]}),bass=m.bus('bass',{gain:.36,send:.06});
  const vib=m.bus('vibes',{gain:.52,send:.32,fx:[trem(m,5.3,.28)]}),dr=m.bus('drums',{gain:1.15,send:.14,fx:[lowpass(9500)]});
  const V={Fmaj7:['A3','C4','E4','G4'],D7:['F#3','C4','E4','A4'],Gm7:['Bb3','D4','F4','A4'],C7:['Bb3','D4','E4','A4'],Am7:['G3','B3','C4','E4'],Dm7:['F3','A3','C4','E4'],F6:['A3','C4','D4','F4'],F7:['A3','C4','Eb4','G4'],Bbmaj7:['A3','C4','D4','F4'],Bbm6:['G3','Bb3','Db4','F4']};
  const bars=[['Fmaj7'],['D7'],['Gm7'],['C7'],['Am7'],['D7'],['Gm7','C7'],['Fmaj7'],
    ['Fmaj7'],['D7'],['Gm7'],['C7'],['Am7'],['Dm7'],['Gm7','C7'],['F6','F7'],
    ['Bbmaj7'],['Bbm6'],['Am7'],['D7'],['Gm7'],['C7'],['Am7','D7'],['Gm7','C7']];
  const walk=[['F2','A2','C3','C#3'],['D3','A2','F#2','Ab2'],['G2','Bb2','D3','Db3'],['C3','G2','E2','G#2'],['A2','C3','E3','Eb3'],['D3','C3','A2','Ab2'],['G2','Bb2','C3','E2'],['F2','A2','C3','E2'],
    ['F2','A2','C3','C#3'],['D3','A2','F#2','Ab2'],['G2','Bb2','D3','Db3'],['C3','G2','E2','G#2'],['A2','C3','E3','Eb3'],['D3','C3','A2','F#2'],['G2','Bb2','C3','E2'],['F2','A2','C3','B2'],
    ['Bb2','D3','F2','A2'],['Bb2','Db3','F2','Bb2'],['A2','C3','E3','Eb3'],['D3','C3','A2','Ab2'],['G2','Bb2','D3','Db3'],['C3','Bb2','G2','Bb2'],['A2','E2','D2','F#2'],['G2','Bb2','C3','E2']];
  bars.forEach((cs,i)=>{
    const bar=i+1;
    const hits=cs.length===2?[[0,cs[0],1.6],[2,cs[1],1.6]]:bar%2?[[0,cs[0],1.3],[2.667,cs[0],1.1]]:[[0,cs[0],.6],[1.667,cs[0],1.9]];
    for(const [b,c,l] of hits){const t=hum(at(bar,b),10),v=.42+rand()*.14;V[c].forEach((n,k)=>rh.add(epiano(n,dur(l),{vel:v}),t+k*.007,{pan:(k-1.5)*.15}));}
    walk[i].forEach((n,b)=>bass.add(upright(n,dur(.92),{vel:b%2?.72:.9,seed:bar*4+b}),hum(at(bar,b),6),{pan:.05}));
    [[0,.3],[1,.48],[1.667,.22],[2,.3],[3,.48],[3.667,.22]].forEach(([b,v],k)=>dr.add(ride({vel:v,seed:bar*6+k}),hum(at(bar,b),6),{pan:.35}));
    [1,3].forEach(b=>dr.add(hat({decay:.03,vel:.3,seed:bar*2+b}),hum(at(bar,b),5),{pan:-.25}));
    [0,2].forEach(b=>dr.add(brush(dur(2),{vel:.55,seed:bar*2+b}),at(bar,b),{pan:-.1}));
    [0,1,2,3].forEach(b=>dr.add(kick({f1:52,f0:95,decay:.3,click:.05,vel:.2,seed:bar}),at(bar,b)));
    if(bar%4===0)dr.add(snare({vel:.3,tight:.2,decay:.16,noiseHz:2400,lp:5000,seed:bar}),hum(at(bar,3.667)),{pan:-.1});
  });
  const A=[[1,.667,'A4',.333],[1,1,'C5',1],[1,2,'D5',.667],[1,2.667,'C5',1.333],
    [2,0,'A4',1],[2,1,'F#4',.667],[2,1.667,'A4',.333],[2,2,'C5',2],
    [3,0,'D5',1],[3,1,'Bb4',.667],[3,1.667,'A4',.333],[3,2,'G4',2],
    [4,.667,'G4',.333],[4,1,'A4',.667],[4,1.667,'Bb4',.333],[4,2,'C5',.667],[4,2.667,'D5',.333],[4,3,'E5',1]];
  const mel=[...A,
    [5,0,'E5',1.5],[5,1.667,'D5',.333],[5,2,'C5',1],[5,3,'A4',1],
    [6,0,'C5',.667],[6,.667,'A4',.333],[6,1,'F#4',1],[6,2,'A4',2],
    [7,0,'G4',1],[7,1,'Bb4',.667],[7,1.667,'D5',.333],[7,2,'C5',1],[7,3,'Bb4',1],
    [8,0,'A4',3],
    ...A.map(([bar,...r])=>[bar+8,...r]),
    [13,0,'E5',1],[13,1,'G5',.667],[13,1.667,'E5',.333],[13,2,'D5',1],[13,3,'C5',1],
    [14,0,'D5',1.5],[14,1.667,'C5',.333],[14,2,'A4',2],
    [15,0,'Bb4',.667],[15,.667,'A4',.333],[15,1,'G4',1],[15,2,'Bb4',1],[15,3,'G4',1],
    [16,0,'F4',2],[16,3,'Eb5',.667],[16,3.667,'D5',.333],
    [17,0,'D5',2],[17,2,'C5',.667],[17,2.667,'A4',1.333],
    [18,0,'Db5',2],[18,2,'Bb4',.667],[18,2.667,'F4',1.333],
    [19,0,'C5',1],[19,1,'E5',.667],[19,1.667,'G5',.333],[19,2,'E5',2],
    [20,0,'D5',.667],[20,.667,'C5',.333],[20,1,'A4',1],[20,2,'F#4',2],
    [21,0,'G4',.667],[21,.667,'Bb4',.333],[21,1,'D5',1],[21,2,'F5',1.5],[21,3.667,'E5',.333],
    [22,0,'E5',1],[22,1,'D5',.667],[22,1.667,'C5',.333],[22,2,'Bb4',2],
    [23,0,'A4',1],[23,1,'C5',1],[23,2,'A4',.667],[23,2.667,'C5',.333],[23,3,'D5',1],
    [24,0,'Bb4',1.5],[24,1.667,'A4',.333],[24,2,'G4',2]];
  mel.forEach(([bar,b,n,len],k)=>vib.add(vibes(n,dur(len)+.15,{vel:.6+rand()*.15,seed:k}),hum(at(bar,b),9),{pan:-.15}));
}

// 深圳 · 湾区之光: bright synth arpeggios, half-time beat, sub bass and a glassy lead over the IV–V–iii–vi cycle.
function shenzhen(m,{at,dur,hum,rand}){
  const kicks=[];
  const cyc=['Dmaj7','E','C#m7','F#m7'];
  const P={Dmaj7:['A3','C#4','D4','F#4'],E:['B3','E4','F#4','G#4'],'C#m7':['B3','C#4','E4','G#4'],'F#m7':['A3','C#4','E4','F#4']};
  const A={Dmaj7:['D4','F#4','A4','C#5','D5','F#5'],E:['E4','G#4','B4','E5','F#5','B5'],'C#m7':['C#4','E4','G#4','B4','C#5','E5'],'F#m7':['F#4','A4','C#5','E5','F#5','A5']};
  const R={Dmaj7:'D2',E:'E2','C#m7':'C#2','F#m7':'F#2'};
  for(let bar=5;bar<=28;bar++){kicks.push(at(bar,0),at(bar,1.5));if(bar%4===0)kicks.push(at(bar,3.5));}
  const pd=m.bus('pad',{gain:.34,send:.35,fx:[duck(m,kicks,.45)]}),ar=m.bus('arp',{gain:.64,send:.3,fx:[duck(m,kicks,.35),autopan(m,.25,.3)]});
  const bs=m.bus('bass',{gain:.25,send:0,fx:[duck(m,kicks,.6,.14)]}),dr=m.bus('drums',{gain:.84,send:.12}),ld=m.bus('lead',{gain:.41,send:.38});
  const idx=[0,1,2,3,4,3,2,1,0,1,2,3,5,3,2,1];
  const cutoff=bar=>bar<=4?600+(bar-1+.5)*500:bar>=29?2500-(bar-28-.5)*500:2800;
  for(let bar=1;bar<=32;bar++){
    const name=cyc[(bar-1)%4],full=bar>=5&&bar<=28;
    pd.add(pad(P[name],dur(4)+.1,{atk:.4,rel:.9,spectrum:'saw',cutoff:full?2600:1600,voices:3,detune:12,seed:bar}),at(bar));
    idx.forEach((j,k)=>ar.add(synthPluck(A[name][j],{cut:cutoff(bar)*.35,env:cutoff(bar),vel:k%4===0?.75:.5,len:.4}),hum(at(bar,k*.25),3),{pan:k%2?.3:-.3}));
    if(bar>=21&&bar<=28)idx.forEach((j,k)=>{if(k%2)ar.add(synthPluck(midi(A[name][j])+12,{cut:1500,env:4000,vel:.35,len:.3}),at(bar,k*.25),{pan:k%4===1?.6:-.6});});
    if(full){
      bs.add(sub(R[name],dur(3.8),{atk:.02,rel:.1,vel:.9}),at(bar));
      kicks.filter(t=>t>=at(bar)&&t<at(bar+1)).forEach((t,k)=>dr.add(kick({vel:k?.75:1,seed:bar}),t));
      dr.add(clap({vel:.6,seed:bar}),hum(at(bar,2),4),{pan:.05});
    }
    if(bar>=3)for(let k=0;k<8;k++)dr.add(hat({vel:(k%2?.5:.32)*(full?1:.7),decay:k%2?.06:.04,seed:bar*8+k}),hum(at(bar,k*.5),4),{pan:.3});
    if(full&&bar%2===0)dr.add(hat({vel:.22,decay:.03,seed:bar}),at(bar,3.75),{pan:.35});
  }
  [5,13,21].forEach(bar=>dr.add(cymbal({vel:.5,seed:bar}),at(bar),{pan:-.2}));
  dr.add(riser(dur(8),{vel:.4}),at(31),{pan:0});
  const B=[[13,0,'C#5',.75],[13,.75,'E5',.75],[13,1.5,'F#5',1],[13,2.5,'E5',.5],[13,3,'C#5',1],
    [14,0,'B4',.75],[14,.75,'C#5',.75],[14,1.5,'E5',1.5],[14,3,'B4',1],
    [15,0,'G#4',.75],[15,.75,'B4',.75],[15,1.5,'C#5',1],[15,2.5,'E5',.5],[15,3,'F#5',1],
    [16,0,'E5',2],[16,2,'C#5',1],
    [17,0,'A5',.75],[17,.75,'F#5',.75],[17,1.5,'E5',1],[17,2.5,'C#5',.5],[17,3,'E5',1],
    [18,0,'G#5',.75],[18,.75,'F#5',.75],[18,1.5,'E5',1.5],[18,3,'B4',1],
    [19,0,'C#5',.75],[19,.75,'E5',.75],[19,1.5,'G#5',1],[19,2.5,'F#5',.5],[19,3,'E5',1],
    [20,0,'F#5',3]];
  const mel=[...B,...B.slice(0,-1).map(([bar,...r])=>[bar+8,...r]),[28,0,'A5',3]];
  mel.forEach(([bar,b,n,len],k)=>{
    const t=hum(at(bar,b),4);
    ld.add(fmBell(n,dur(len),{ratio:2,index:1.3,decay:1.1,vel:.7}),t,{pan:.1});
    if(bar>=21)ld.add(fmBell(midi(n)+12,dur(len),{ratio:3.01,index:.8,decay:.8,vel:.35}),t+.01,{pan:-.2});
  });
}

// 香港 · 维港夜色: lo-fi city pop — a distant ferry horn, dusty rhodes, boom-bap drums, a glassy lead and zheng fills.
function hongkong(m,{at,dur,hum,rand,beat}){
  const S=m.seconds;
  const vinyl=m.bus('vinyl',{gain:1.4,send:0}),rh=m.bus('rhodes',{gain:.35,send:.25,fx:[lowpass(3400),wow(m,.45,1.6)]});
  const bs=m.bus('bass',{gain:.3,send:.02,fx:[sat(2)]}),dr=m.bus('drums',{gain:.98,send:.1,fx:[lowpass(7000),sat(1.6)]});
  const ld=m.bus('lead',{gain:.53,send:.35,fx:[lowpass(6000)]}),zh=m.bus('zheng',{gain:1.2,send:.35}),hn=m.bus('horn',{gain:.33,send:.9});
  vinyl.add(vinylBed(m.n,S,{seed:8}),0);
  hn.add(horn(['F2','C3'],2.2),at(1,.5),{pan:-.35});
  const cyc=[['Fmaj7'],['E7'],['Am7'],['Gm7','C7']];
  const V={Fmaj7:['A3','C4','E4','G4'],E7:['G#3','D4','G4','B4'],Am7:['G3','B3','C4','E4'],Gm7:['F3','A3','Bb3','D4'],C7:['Bb3','E4','A4']};
  const Rt={Fmaj7:'F2',E7:'E2',Am7:'A2',Gm7:'G2',C7:'C2'};
  const sw=x=>Math.floor(x)+(x%1===.5?.58:x%1);
  for(let bar=1;bar<=20;bar++){
    const cs=cyc[(bar-1)%4],drums=bar>=5;
    const hits=cs.length===2?[[0,cs[0],1.8],[2,cs[1],1.8]]:[[0,cs[0],1.75],[2.5,cs[0],1.4]];
    for(const [b,c,l] of hits){const t=hum(at(bar,b),14),v=.38+rand()*.12;V[c].forEach((n,k)=>rh.add(epiano(n,dur(l),{vel:v,bright:.7}),t+k*.012,{pan:(k-1.5)*.2}));}
    if(drums){
      (cs.length===2?[[0,cs[0],1.4],[2,cs[1],1.4]]:[[0,cs[0],1.5],[2.5,cs[0],1.3]]).forEach(([b,c,l])=>bs.add(sub(Rt[c],dur(l),{atk:.015,rel:.12,vel:.9,h2:.3}),hum(at(bar,b),6)));
      [[0,1],[.75,.45],[2.5,.85]].forEach(([b,v])=>dr.add(kick({f1:50,f0:120,decay:.38,click:.1,vel:v,seed:bar}),hum(at(bar,sw(b)),8)));
      [1,3].forEach(b=>dr.add(snare({vel:.75,tone:200,decay:.22,noiseHz:1700,lp:6000,seed:bar*2+b}),hum(at(bar,b),10),{pan:.05}));
      for(let k=0;k<8;k++)dr.add(hat({vel:k%2?.28:.42,decay:.05,seed:bar*8+k}),hum(at(bar,sw(k*.5)),8),{pan:.25});
      if(bar%4===0)dr.add(snare({vel:.25,tight:.1,decay:.1,seed:bar}),at(bar,sw(3.5)+.25),{pan:-.1});
    }
  }
  const A=[[5,0,'E5',1],[5,1,'G5',.5],[5,1.5,'A5',1],[5,2.5,'G5',.5],[5,3,'E5',1],
    [6,0,'D5',.75],[6,.75,'E5',.25],[6,1,'G#4',1.5],[6,2.5,'B4',.5],[6,3,'D5',1],
    [7,0,'C5',1.5],[7,1.5,'E5',.5],[7,2,'A4',2],
    [8,0,'D5',1],[8,1,'Bb4',.5],[8,1.5,'A4',.5],[8,2,'G4',1.5],[8,3.5,'E5',.5]];
  const mel=[...A,
    [9,0,'E5',.75],[9,.75,'G5',.75],[9,1.5,'C6',1],[9,2.5,'A5',.5],[9,3,'G5',1],
    [10,0,'G#5',1],[10,1,'E5',1],[10,2,'D5',1],[10,3,'B4',1],
    [11,0,'C5',1],[11,1,'B4',.5],[11,1.5,'A4',.5],[11,2,'E5',2],
    [12,0,'D5',1.5],[12,1.5,'C5',.5],[12,2,'Bb4',1],
    ...A.slice(0,-5).map(([bar,...r])=>[bar+12,...r]),
    [20,0,'D5',1],[20,1,'Bb4',.5],[20,1.5,'A4',.5],[20,2,'G4',2]];
  mel.forEach(([bar,b,n,len],k)=>ld.add(fmBell(n,dur(len),{ratio:3.01,index:1.1,decay:1.3,vel:.65+rand()*.1}),hum(at(bar,sw(b)),8),{pan:.12}));
  const fill=[[13,0,'A4',.5],[13,.5,'C5',.5],[13,1,'D5',.5],[13,1.5,'E5',.5],[13,2,'G5',1],[13,3,'E5',.5],[13,3.5,'D5',.5],
    [14,0,'E5',1.5,{vib:true}],[14,1.5,'D5',.5],[14,2,'B4',1],[14,3,'D5',.5],[14,3.5,'B4',.5],
    [15,0,'C5',.5],[15,.5,'E5',.5],[15,1,'A5',1],[15,2,'G5',.5],[15,2.5,'E5',.5],[15,3,'D5',.5],[15,3.5,'C5',.5],
    [16,0,'D5',1.5,{up:true}],[16,1.5,'C5',.5],[16,2,'A4',1],[16,3,'G4',1]];
  fill.forEach(([bar,b,n,len,o={}],k)=>zh.add(pluck(n,{body:'zheng',decay:2.2,bright:.62,seed:700+k,vib:o.vib?VIB.zheng:null,slide:o.up?[[0,-2],[.12,-2],[.3,0]]:null}),hum(at(bar,sw(b)),8),{gain:.85,pan:-.2}));
}

// PK · 同频竞逐: restrained 120 BPM minor-key pulse; no vocals, alarms or sudden drops.
// Sixteen bars loop from the suspended dominant back to D minor; circular mixing keeps tails intact.
function pk(m,{at,dur,hum}){
  const harmony=[['D3','F3','A3','E4'],['Bb2','D3','F3','A3'],['G2','Bb2','D3','A3'],['A2','D3','E3','G3']];
  const roots=['D2','Bb1','G1','A1'];
  const motifs=[['D4','A4','E4','F4','D4','A4','F4','E4'],['D4','A4','F4','D4','Bb3','F4','A4','F4'],['D4','A4','Bb4','A4','G4','D4','A4','D4'],['E4','A4','G4','E4','D4','E4','G4','A4']];
  const kicks=[];for(let bar=1;bar<=16;bar++)for(const beat of [0,2])kicks.push(at(bar,beat));
  const bed=m.bus('suspended pad',{gain:.16,send:.34,fx:[highpass(170),duck(m,kicks,.16)]});
  const arp=m.bus('soft pulse motif',{gain:.50,send:.18,fx:[lowpass(3800),duck(m,kicks,.12)]});
  const bass=m.bus('rounded bass',{gain:.16,send:.025,fx:[sat(1.25)]});
  const drums=m.bus('restrained percussion',{gain:.65,send:.08,fx:[lowpass(6500)]});
  const glint=m.bus('answer spark',{gain:.09,send:.32});
  for(let bar=1;bar<=16;bar++){
    const chord=Math.floor((bar-1)/4),lift=bar>8?1.08:1;
    bed.add(pad(harmony[chord],dur(4),{atk:.15,rel:.5,cutoff:1150,voices:2,detune:5,seed:70+bar}),at(bar));
    for(let k=0;k<8;k++){
      arp.add(synthPluck(motifs[chord][k],{cut:540,env:1350,decay:.1,len:.32,q:.85,vel:(k%2?.40:.58)*lift}),at(bar,k*.5),{pan:k%2?.2:-.2});
      drums.add(hat({vel:k%2?.13:.18,decay:.025,seed:600+bar*8+k}),hum(at(bar,k*.5),2),{pan:.16});
    }
    for(const beat of [0,1.5,2,3.5])bass.add(sub(roots[chord],dur(.32),{atk:.009,rel:.09,h2:.22,vel:beat%1?.46:.67}),at(bar,beat));
    for(const beat of [0,2])drums.add(kick({f0:100,f1:53,decay:.22,click:.06,vel:.55,seed:100+bar}),at(bar,beat));
    for(const beat of [1,3])drums.add(tok({f:560,decay:.045,vel:.12,seed:200+bar}),at(bar,beat),{pan:-.12});
    if(bar%4===0){drums.add(shaker({vel:.10,len:.08,seed:bar}),at(bar,3.75),{pan:.25});glint.add(fmBell(chord===3?'C#5':'A4',dur(.7),{ratio:2,index:.55,decay:.5,vel:.28}),at(bar,3),{pan:-.18});}
  }
}

const TRACKS={
  pk:{title:'同频竞逐',titleEn:'Friendly Rivalry',bpm:120,bars:16,seed:29,render:pk,reverb:{room:.72,damp:.58,predelay:.018,wet:.22,hp:230,lp:4300}},
  datong:{title:'云冈晨钟',titleEn:'Morning Bell at Yungang',bpm:60,bars:16,seed:11,render:datong,reverb:{room:.93,damp:.45,predelay:.035,wet:.3,hp:150,lp:6000}},
  beijing:{title:'红墙金瓦',titleEn:'Red Walls, Golden Tiles',bpm:72,bars:18,seed:12,render:beijing,reverb:{room:.88,damp:.4,predelay:.03,wet:.42}},
  suzhou:{title:'姑苏塔影',titleEn:'Pagoda over Gusu',bpm:64,bars:16,seed:13,render:suzhou,reverb:{room:.86,damp:.45,predelay:.025,wet:.4}},
  guilin:{title:'漓水青峰',titleEn:'Green Peaks by the Li',bpm:80,bars:20,seed:14,render:guilin,reverb:{room:.87,damp:.4,predelay:.03,wet:.4}},
  zhangjiajie:{title:'峰林云海',titleEn:'Sea of Clouds over the Peaks',bpm:64,bars:16,seed:15,render:zhangjiajie,reverb:{room:.94,damp:.4,predelay:.045,wet:.3,hp:140,lp:6500}},
  shanghai:{title:'外滩旧梦',titleEn:'Old Dreams on the Bund',bpm:90,bars:24,seed:16,render:shanghai,reverb:{room:.8,damp:.5,predelay:.02,wet:.35}},
  shenzhen:{title:'湾区之光',titleEn:'Lights of the Bay',bpm:120,bars:32,seed:17,render:shenzhen,reverb:{room:.86,damp:.35,predelay:.03,wet:.38}},
  hongkong:{title:'维港夜色',titleEn:'Victoria Harbour by Night',bpm:75,bars:20,seed:18,render:hongkong,reverb:{room:.84,damp:.55,predelay:.02,wet:.35,lp:5500}}
};

/* ---------- output ---------- */
function writeWav(file,L,R){
  const n=L.length,buf=Buffer.alloc(44+n*8);
  buf.write('RIFF',0);buf.writeUInt32LE(36+n*8,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(3,20);buf.writeUInt16LE(2,22);
  buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*8,28);buf.writeUInt16LE(8,32);buf.writeUInt16LE(32,34);buf.write('data',36);buf.writeUInt32LE(n*8,40);
  for(let i=0;i<n;i++){buf.writeFloatLE(L[i],44+i*8);buf.writeFloatLE(R[i],48+i*8);}
  fs.writeFileSync(file,buf);
}
function build(id){
  const cfg=TRACKS[id],beat=60/cfg.bpm,loop=cfg.bars*4*beat;
  if(Math.abs(loop-Math.round(loop))>1e-9)throw Error(`${id}: the loop must last whole seconds (${loop})`);
  const m=new Mix(loop),started=Date.now();
  cfg.render(m,score(cfg.bpm,prng(cfg.seed)));
  const {L,R,levels}=mixdown(m,cfg.reverb);
  const before=lufs(L,R),g=10**((TARGET_LUFS-before)/20);
  scale(L,g);scale(R,g);limit(L,R);
  const n=m.n,h=secs(HANDLE),FL=new Float32Array(n+h),FR=new Float32Array(n+h);
  for(let i=0;i<n;i++){const e=i<h?sin2(i/h):1;FL[i]=L[i]*e;FR[i]=R[i]*e;}
  for(let i=0;i<h;i++){const e=1-sin2(i/h);FL[n+i]=L[i]*e;FR[n+i]=R[i]*e;}
  const wavDir=arg('--wav')||fs.mkdtempSync(path.join(os.tmpdir(),'tripwonder-bgm-')),wav=path.join(wavDir,`${id}.wav`),mp3=path.join(outDir,`${id}.mp3`);
  fs.mkdirSync(wavDir,{recursive:true});fs.mkdirSync(outDir,{recursive:true});
  writeWav(wav,FL,FR);
  execFileSync(FFMPEG,['-y','-hide_banner','-loglevel','error','-i',wav,'-c:a','libmp3lame','-q:a','5','-metadata',`title=${cfg.title} · ${cfg.titleEn}`,'-metadata','artist=TripWonder','-metadata','comment=Original music synthesized by scripts/build-bgm.cjs',mp3]);
  if(!arg('--wav'))fs.rmSync(wavDir,{recursive:true,force:true});
  const after=lufs(L,R),peak=Math.max(peakOf(L),peakOf(R));
  console.log(`${id.padEnd(12)} ${cfg.title}  loop ${loop}s  ${(fs.statSync(mp3).size/1024).toFixed(0)} KB  ${after.toFixed(1)} LUFS  peak ${db(peak)} dBFS  ${((Date.now()-started)/1000).toFixed(1)}s`);
  console.log(`  buses: ${levels.join(' · ')}`);
}
module.exports={SR,hz,midi,pluck,wind,choir,bell,pad,epiano,vibes,felt,fmBell,lufs,TRACKS};
if(require.main===module){
  const only=arg('--only');
  for(const id of Object.keys(TRACKS))if(!only||only===id)build(id);
  const manifest={};
  for(const [id,cfg] of Object.entries(TRACKS)){
    const file=path.join(outDir,`${id}.mp3`);if(!fs.existsSync(file))continue;
    const data=fs.readFileSync(file),v=crypto.createHash('sha256').update(data).digest('hex').slice(0,12);
    fs.mkdirSync(localDir,{recursive:true});
    fs.writeFileSync(path.join(localDir,`${id}.js`),`/* Generated by scripts/build-bgm.cjs for file:// previews. */
(window.BGM_LOCAL=window.BGM_LOCAL||{})[${JSON.stringify(id)}]="${data.toString('base64')}";
`);
    manifest[id]={src:`assets/bgm/${id}.mp3?v=${v}`,local:`bgm-local/${id}.js?v=${v}`,loop:cfg.bars*4*60/cfg.bpm,title:cfg.title,titleEn:cfg.titleEn};
  }
  fs.writeFileSync(path.join(root,'bgm-manifest.js'),`/* Generated by scripts/build-bgm.cjs. Original music; loop = seconds between overlapping copies. */\nwindow.BGM_TRACKS=${JSON.stringify(manifest,null,2)};\n`);
}
