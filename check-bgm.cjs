const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_URL||'http://127.0.0.1:8765/';
const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:0})).toString('base64url');
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const shot=async(page,name)=>{if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png')});}};
const state=page=>page.evaluate(()=>SceneBGM.state());
const until=(page,test,arg)=>page.waitForFunction(test,arg,{timeout:8000});
async function idle(page){await page.waitForFunction(()=>!window.ChallengeMotion?.busy);}
async function enter(page){
  await page.goto(base+'?challenge='+token);
  await page.locator('#app .cover-page').waitFor();
  if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
  await page.locator('#app [data-action="start"]').click();
  await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();
  await page.locator('.scene-transition').waitFor({state:'detached'});
}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  const errors=[],report={};
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    page.on('pageerror',e=>errors.push(e.message));
    const fetched=[];page.on('request',r=>{if(r.url().includes('/assets/bgm/'))fetched.push(new URL(r.url()).pathname);});

    // Every destination has a track, and each file decodes to one loop plus the hand-off with a clean seam.
    await page.goto(base+'?challenge='+token);await page.locator('#app .cover-page').waitFor();
    report.tracks=await page.evaluate(async()=>{
      const out={},ids=window.TRIPWONDER_CATALOG.cities.map(c=>c.id);
      for(const id of ids){
        const t=window.BGM_TRACKS[id];if(!t){out[id]=null;continue;}
        const data=await (await fetch(t.src)).arrayBuffer(),probe=new OfflineAudioContext(2,44100,44100),buf=await probe.decodeAudioData(data);
        const len=Math.ceil((t.loop*2+4)*44100),ctx=new OfflineAudioContext(2,len,44100);
        for(const at of [0,t.loop]){const s=ctx.createBufferSource();s.buffer=buf;s.connect(ctx.destination);s.start(at);}
        const mix=(await ctx.startRendering()).getChannelData(0),src=buf.getChannelData(0),N=Math.round(t.loop*44100),H=src.length-N,W=4410;
        // Two copies L seconds apart must rebuild the ideal loop sample for sample across the hand-off,
        // and the loop's own wrap point must be no sharper than the music right around it.
        const P=i=>i<H?src[i]+src[N+i]:src[i];
        let overlapError=0,rms=0,local=0;
        for(let i=0;i<H;i++)overlapError=Math.max(overlapError,Math.abs(mix[N+i]-P(i)));
        for(let i=N-W;i<N+W;i++)rms+=mix[i]*mix[i];
        for(let i=1;i<W;i++)local=Math.max(local,Math.abs(P(i)-P(i-1)),Math.abs(src[N-i]-src[N-i-1]));
        out[id]={duration:+buf.duration.toFixed(3),loop:t.loop,overlapError:+overlapError.toExponential(1),wrapStep:+Math.abs(P(0)-src[N-1]).toFixed(4),localStep:+local.toFixed(4),seamRms:+Math.sqrt(rms/(2*W)).toFixed(4)};
      }
      return out;
    });
    for(const [id,t] of Object.entries(report.tracks)){
      assert.ok(t,`${id} has music`);
      assert.ok(t.duration>t.loop+2.95&&t.duration<t.loop+3.2,`${id} holds one loop plus the hand-off`);
      assert.ok(t.seamRms>.005,`${id} keeps playing across the loop point`);
      assert.ok(t.overlapError<1e-4,`${id} copies overlap sample-accurately`);
      assert.ok(t.wrapStep<=t.localStep,`${id} has no click at the loop point`);
    }

    // The cover prefetches the destination's music; nothing plays before a gesture or outside exploration.
    fetched.length=0;
    await page.goto(base+'?challenge='+token);await page.locator('#app .cover-page').waitFor();
    await until(page,()=>performance.getEntriesByType('resource').some(e=>e.name.includes('/assets/bgm/shenzhen.mp3')));
    assert.notEqual((await state(page)).playing,'shenzhen','no music on the cover');
    if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
    await page.locator('#app [data-action="start"]').click();
    await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();await page.locator('.scene-transition').waitFor({state:'detached'});
    await until(page,()=>{const s=SceneBGM.state();return s.context==='running'&&s.playing==='shenzhen'&&s.gain>.9;});
    report.playing=await state(page);
    assert.ok(report.playing.copies>=2,'the next loop copy is already scheduled');
    assert.equal(fetched.filter(p=>p.endsWith('shenzhen.mp3')).length,1,'the prefetched file is reused');
    const toggle=page.locator('#app [data-action="bgm"]');
    assert.equal(await toggle.getAttribute('aria-pressed'),'true');
    await shot(page,'bgm-explore');

    // Scene changes inside one destination keep the same performance going.
    const before=await page.evaluate(()=>SceneBGM.state().copies);
    await page.locator('#app [data-action="next-scene"]').click();
    await page.locator('#app .scene-counter',{hasText:'2 / 3'}).waitFor();await page.locator('.scene-transition').waitFor({state:'detached'});
    const during=await state(page);
    assert.equal(during.playing,'shenzhen');assert.ok(during.gain>.9,'music continues between scenes');assert.ok(during.copies>=before-1);

    // The toggle fades out, suspends the context, remembers the choice, and fades back in.
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-pressed'),'false');
    await until(page,()=>SceneBGM.state().muted&&SceneBGM.state().context==='suspended');
    assert.equal(await page.evaluate(()=>localStorage.getItem('tripwonder-bgm-muted')),'1');
    await toggle.click();
    await until(page,()=>{const s=SceneBGM.state();return !s.muted&&s.context==='running'&&s.gain>.9;});

    // Leaving for the quiz pauses the music; returning picks the same track up without a new download.
    await page.locator('#app [data-action="go-quiz"]').click();await page.locator('#app .quiz-page').waitFor();await idle(page);
    await until(page,()=>{const s=SceneBGM.state();return s.want===null&&s.context==='suspended';});
    report.quiz=await state(page);
    await page.locator('[data-action="quiz-back"]').click();await page.locator('#app .explore-page').waitFor();await idle(page);
    await until(page,()=>{const s=SceneBGM.state();return s.playing==='shenzhen'&&s.context==='running'&&s.gain>.9;});
    assert.equal(fetched.filter(p=>p.endsWith('shenzhen.mp3')).length,1,'returning does not download again');

    // A muted visitor stays muted after reloading.
    await toggle.click();await until(page,()=>SceneBGM.state().muted);
    await enter(page);
    assert.equal(await page.locator('#app [data-action="bgm"]').getAttribute('aria-pressed'),'false');
    await page.waitForTimeout(600);
    assert.notEqual((await state(page)).playing,'shenzhen','muted visitors hear nothing');
    await page.evaluate(()=>localStorage.removeItem('tripwonder-bgm-muted'));

    // Opened straight from disk, the page cannot fetch files and loads the music from bgm-local/ instead.
    const disk=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    disk.on('pageerror',e=>errors.push(e.message));
    await disk.goto(pathToFileURL(path.join(__dirname,'index.html')).href+'?challenge='+token);
    await disk.locator('#app .cover-page').waitFor();
    if(await disk.locator('.rules-popover').count())await disk.locator('[data-action="rules-start"]').click();
    await disk.locator('#app [data-action="start"]').click();
    await disk.locator('#app .explore-page').waitFor();
    await until(disk,()=>{const s=SceneBGM.state();return s.playing==='shenzhen'&&s.context==='running'&&s.gain>.9;});
    report.filePreview=await state(disk);

    assert.deepEqual(errors,[]);
    console.log(JSON.stringify(report,null,2));
    console.log('BGM checks passed');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
