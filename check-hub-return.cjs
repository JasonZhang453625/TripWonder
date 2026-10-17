// Return-path acceptance: retain one idle canvas, refresh progress, and recover after resize/context loss.
const {chromium,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const idle=p=>p.waitForFunction(()=>!ChallengeMotion.busy&&!document.querySelector('.scene-transition'));
const state=p=>p.evaluate(()=>HubCards3D.inspect());
async function auditReturn(p,selector){
  await p.evaluate(()=>{
    window.returnAudit={long:[]};
    const tasks=new PerformanceObserver(list=>returnAudit.long.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));tasks.observe({type:'longtask'});
    returnAudit.stop=()=>tasks.disconnect();
    document.addEventListener('click',()=>{returnAudit.click=performance.now();},{once:true,capture:true});
    const observer=new MutationObserver(()=>{
      const hub=document.querySelector('#app>.cm-hub:not([data-hub-prewarm])');
      if(hub&&!returnAudit.visible){returnAudit.visible=performance.now();returnAudit.threeAtEntry=hub.dataset.hubRenderer==='three';}
      if(hub?.dataset.hubRenderer==='three'){returnAudit.ready=performance.now();observer.disconnect();}
    });observer.observe(document,{childList:true,attributes:true,subtree:true});
  });
  await p.locator(selector).click();await p.locator('.cm-hub:not([data-hub-prewarm])').waitFor();await idle(p);
  await p.waitForTimeout(50);await p.evaluate(()=>returnAudit.stop());
  const audit=await p.evaluate(()=>({threeAtEntry:returnAudit.threeAtEntry,delayAfterPageVisible:returnAudit.ready-returnAudit.visible,reused:document.querySelector('.hub3d-stage canvas')===savedHubCanvas,long:returnAudit.long.filter(e=>e.start>=returnAudit.click)}));
  assert.ok(audit.threeAtEntry&&audit.reused,'ready 3D canvas accompanies the returning page');
  assert.ok(audit.delayAfterPageVisible<32,'no delayed native-to-3D replacement');
  assert.ok(audit.long.every(e=>e.duration<100),'return avoids renderer construction long tasks');
  return audit;
}
async function paused(p){
  const before=await state(p);assert.equal(before.suspended,true);
  await p.waitForTimeout(250);assert.equal((await state(p)).frames,before.frames,'cached hub schedules no background frames');
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    for(const [name,options] of [['mobile',{...devices['iPhone 13'],deviceScaleFactor:1}],['desktop',{viewport:{width:1440,height:1080}}],['reduced',{...devices['iPhone 13'],deviceScaleFactor:1,reducedMotion:'reduce'}]]){
      const p=await browser.newPage(options),errors=[];p.on('pageerror',e=>errors.push(e.message));
      const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
      await p.clock.setFixedTime(new Date());await p.goto(base);await p.locator('.th-wonder').waitFor();await p.evaluate(()=>HomePromo.dismiss());
      await p.waitForFunction(()=>document.querySelector('[data-hub-prewarm]')?.dataset.hubRenderer==='three');
      await p.locator('.th-wonder').click();await idle(p);
      await p.evaluate(()=>{window.savedHubCanvas=document.querySelector('.hub3d-stage canvas');window.savedHubRoot=document.querySelector('.cm-hub');});
      const initial=await state(p);const results=[];
      for(let i=0;i<3;i++){
        await p.locator('.cm-entry-community').click();await p.locator('.cm-feed').waitFor();await idle(p);await paused(p);
        results.push(await auditReturn(p,'.cm-feed [data-go="hub"]'));
        const returned=await state(p);assert.deepEqual(returned.cards.map(m=>m.geometry),initial.cards.map(m=>m.geometry));assert.deepEqual(returned.cards.map(m=>m.texture),initial.cards.map(m=>m.texture));
      }
      await p.locator('.cm-entry-challenge').click();await p.locator('.cover-page').waitFor();await idle(p);
      if(await p.locator('.rules-popover').count()){await p.locator('.rules-popover [data-action="close"]').click();await p.locator('.rules-popover').waitFor({state:'detached'});}
      await paused(p);results.push(await auditReturn(p,'.cover-page [data-action="leave-cover"]'));
      await p.locator('.cm-entry-challenge').click();await p.locator('.cover-page').waitFor();await idle(p);
      await p.locator('[data-action="start"]').click();await p.locator('.explore-page').waitFor();await idle(p);await paused(p);
      await p.clock.setFixedTime(new Date((await p.evaluate(()=>Date.now()))+61000));await p.locator('.guess-map').waitFor();await idle(p);
      await p.locator('.guess-map').click({position:{x:200,y:300}});await p.locator('[data-action="guess-submit"]').click();await p.locator('.guess-card [data-action="show-result"]').click();await p.locator('.result-page').waitFor();await idle(p);
      results.push(await auditReturn(p,'.result-topbar [data-action="result-exit"]'));
      assert.match(await p.locator('.cm-entry-challenge small').textContent(),/已完成 1/);
      const updated=await state(p);assert.notEqual(updated.cards[0].texture,initial.cards[0].texture,'completed challenge refreshes its printed card');assert.equal(updated.cards[1].texture,initial.cards[1].texture,'unchanged community card retains texture');assert.deepEqual(updated.cards.map(m=>m.geometry),initial.cards.map(m=>m.geometry),'progress refresh does not rebuild meshes');
      await p.locator('.cm-entry-community').click();await p.locator('.cm-feed').waitFor();await idle(p);
      await p.setViewportSize({width:844,height:390});await paused(p);
      results.push(await auditReturn(p,'.cm-feed [data-go="hub"]'));assert.ok(await p.locator('.cm-hub').evaluate(e=>e.scrollHeight<=e.clientHeight),'cached hub resizes on return');
      if(name==='mobile'){
        await p.locator('.cm-entry-community').click();await p.locator('.cm-feed').waitFor();await idle(p);
        await p.evaluate(()=>savedHubCanvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
        assert.equal(await state(p),null,'lost cached context is disposed');
        await p.locator('.cm-feed [data-go="hub"]').click();await idle(p);await p.waitForFunction(()=>document.querySelector('.cm-hub')?.dataset.hubRenderer==='three');
        assert.ok(await p.evaluate(()=>document.querySelector('.hub3d-stage canvas')!==savedHubCanvas),'fresh renderer recovers after context loss');
      }
      await p.locator('.cm-hub [data-go="home"]').click();await idle(p);await p.locator('.th-nav [data-go="profile"]').click();await idle(p);assert.equal(await state(p),null,'leaving the flow frees the cache');
      assert.deepEqual(errors,[]);console.log(name,JSON.stringify(results));await p.close();
    }
    console.log('PASS: repeated feed/cover/result returns reuse a ready canvas at 4x CPU; suspended renderer stays idle; progress refreshes only changed texture; hidden resize, context loss, reduced motion and final disposal work.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
