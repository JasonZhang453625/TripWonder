const assert=require('node:assert/strict');
const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_URL||'http://127.0.0.1:8765/';
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy);
async function complete(page){
  await page.locator('.cover-enter').click();await page.locator('.scene-counter').waitFor();await idle(page);
  const count=Number((await page.locator('.scene-counter').textContent()).split('/')[1]);
  for(let n=1;n<=count;n++){
    await page.locator('[data-action="next-scene"]').click();
    if(n<count)await page.locator('.scene-counter').filter({hasText:`${n+1} / ${count}`}).waitFor();
    await idle(page);
  }
  for(let n=0;n<3;n++){await page.locator('[data-option="0"]').click();await page.locator('.quiz-reveal').waitFor();await page.locator('[data-action="submit"]').click();await idle(page);}
  await page.locator('.guess-map').click({position:{x:170,y:260}});
  await page.locator('[data-action="guess-submit"]').click();await page.locator('[data-action="show-result"]').click();await idle(page);
}
async function bottom(page){
  await page.locator('.result-scroll-cue').click();await page.waitForTimeout(580);
  await page.locator('#app').evaluate(app=>app.scrollTop=app.scrollHeight);
  await page.waitForTimeout(60);
}
async function navigation(page,selector,{to,back=false,screenshot}={}){
  const before=await page.locator(selector).boundingBox();
  const oldBar=await page.locator('.result-topbar').count()?await page.locator('.result-topbar').boundingBox():null;
  await page.evaluate(()=>{
    window.navigationAnimations=[];window.navigationCommits=0;
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(...args){
      const animation=animate.apply(this,args);
      if(this.matches('[data-slide-layer]')){navigationAnimations.push(animation);animation.pause();animation.currentTime=0;}
      return animation;
    };
    window.restoreNavigationAnimate=()=>{Element.prototype.animate=animate};
  });
  // Rapid second activation must not navigate twice while media is being prepared.
  await page.locator(selector).evaluate(button=>{button.click();button.click()});
  await page.waitForFunction(()=>navigationAnimations.length===2);
  const layers=await page.evaluate(selector=>{
    const app=document.querySelector('#app'),out=app.querySelector('[data-slide-layer="outgoing"]'),incoming=app.querySelector('[data-slide-layer="incoming"]');
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
    return {view:incoming.dataset.view,button:rect(out.querySelector(selector)),bar:out.querySelector('.result-topbar')&&rect(out.querySelector('.result-topbar')),
      outgoingX:new DOMMatrix(getComputedStyle(out).transform).m41,incomingX:new DOMMatrix(getComputedStyle(incoming).transform).m41,
      width:app.clientWidth,photosReady:[...incoming.querySelectorAll('.cover-hero>img,.result-visual>img,.route-hero>img')].every(img=>img.complete&&img.naturalWidth>0)};
  },selector);
  assert.equal(layers.view,to);assert.ok(layers.photosReady,'new hero is decoded before slide');
  assert.ok(Math.abs(layers.button.y-before.y)<1,'departing button must not jump vertically: '+JSON.stringify({before,after:layers.button}));
  if(oldBar)assert.ok(Math.abs(oldBar.y-layers.bar.y)<1,'sticky toolbar keeps its screen position');
  assert.ok(Math.abs(layers.outgoingX)<1);
  assert.ok(back?layers.incomingX<0:layers.incomingX>0,'incoming direction');
  await page.evaluate(()=>navigationAnimations.forEach(animation=>animation.currentTime=210));
  const mid=await page.evaluate(()=>navigationAnimations.map(a=>new DOMMatrix(getComputedStyle(a.effect.target).transform).m41));
  assert.ok(back?mid[0]>0:mid[0]<0,'outgoing direction');
  if(screenshot)await page.screenshot({path:screenshot});
  await page.evaluate(()=>{navigationAnimations.forEach(animation=>animation.finish());restoreNavigationAnimate()});await idle(page);
  assert.equal(await page.locator('#app > .page').count(),1);
  assert.equal(await page.locator('[data-slide-layer]').count(),0);
  assert.equal(await page.locator('#app > .page').evaluate(page=>page.inert),false);
}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const errors=[];
  try{
    for(const [name,options] of [['mobile',{...devices['iPhone 13'],viewport:{width:390,height:844}}],['desktop',{viewport:{width:1440,height:1040}}]]){
      const page=await browser.newPage(options);page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base);await page.keyboard.press('Escape');await page.locator('.hp-layer').waitFor({state:'detached'});
      await page.locator('.th-wonder').click();await idle(page);await page.locator('.cm-entry[data-go="today"]').click();await idle(page);await page.locator('[data-action="close"]').click();
      const first=await page.locator('.cover-page').getAttribute('data-cover-city');
      await complete(page);await bottom(page);
      assert.equal(await page.locator('.prev-city').isDisabled(),true);
      const previousScroll=await page.locator('#app').evaluate(app=>app.scrollTop);
      await navigation(page,'.result-actions [data-go="route"]',{to:'route',screenshot:name==='mobile'?process.env.TRIPWONDER_NAV_SCREENSHOT:undefined});
      await navigation(page,'.page-head [data-go="result"]',{to:'result',back:true});
      assert.ok(Math.abs((await page.locator('#app').evaluate(app=>app.scrollTop))-previousScroll)<1,'return restores results scroll');
      assert.equal(await page.locator('.result-hero').evaluate(hero=>hero.clientHeight),296);
      await navigation(page,'[data-action="next-city"]',{to:'cover'});
      const second=await page.locator('.cover-page').getAttribute('data-cover-city');assert.notEqual(second,first);
      await complete(page);await bottom(page);
      await navigation(page,'[data-action="prev-city"]',{to:'result',back:true});
      const label=await page.locator('.result-arrival strong').textContent();
      assert.equal(label,await page.evaluate(id=>TRIPWONDER_CATALOG.cities.find(city=>city.id===id).name+'。',first));
      await bottom(page);
      // A failed image preparation leaves the original destination and its controls intact.
      await page.evaluate(()=>{window.originalPrepare=SceneMedia.prepare;SceneMedia.prepare=()=>Promise.reject(new Error('test unavailable'))});
      await page.locator('[data-action="next-city"]').click();await idle(page);
      assert.equal(await page.locator('.result-arrival strong').textContent(),label);
      assert.equal(await page.locator('[data-slide-layer]').count(),0);
      await page.evaluate(()=>{SceneMedia.prepare=originalPrepare});
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.locator('.result-actions [data-go="route"]').click();await idle(page);await page.locator('.route-hero').waitFor();
      await page.locator('.page-head [data-go="result"]').click();await idle(page);
      assert.equal(await page.locator('.result-hero').evaluate(hero=>hero.clientHeight),296);
      assert.equal(await page.locator('#app > .page').count(),1);
      console.log('PASS '+name+': route forward/back, next/previous destination, scroll continuity, no duplicate navigation, preload failure, reduced motion');
      await page.close();
    }
    assert.deepEqual(errors,[]);console.log('PASS no browser errors');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
