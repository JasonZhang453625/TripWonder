const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const idle=p=>p.waitForFunction(()=>!ChallengeMotion.busy&&!document.querySelector('.scene-transition'));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.clock.setFixedTime(new Date());
 await p.goto(base);await p.locator('.th-wonder').waitFor();await p.evaluate(()=>HomePromo.dismiss());await p.locator('.th-wonder').click();await p.locator('.cm-hub').waitFor();await idle(p);
 await p.locator('.cm-entry[data-go="today"]').click();await p.locator('.cover-page').waitFor();await idle(p);
 if(await p.locator('.rules-popover').count()){await p.locator('[data-action="rules-start"]').click();await p.locator('.rules-popover').waitFor({state:'detached'});}
 const ids=[];
 for(let n=0;n<5;n++){
  const id=await p.locator('.cover-page').getAttribute('data-cover-city');assert.ok(!ids.includes(id),'next challenge skips completed destinations');ids.push(id);
  await p.locator('[data-action="start"]').click();await p.locator('.explore-page').waitFor();await idle(p);
  assert.equal(await p.locator('.immersive-top [data-action="leave"]').isVisible(),false,'daily scene exit stays hidden');
  await p.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));await idle(p);assert.equal(await p.locator('.explore-page').count(),1);
  const now=await p.evaluate(()=>Date.now());await p.clock.setFixedTime(new Date(now+61000));await p.locator('.guess-map').waitFor();await idle(p);
  await p.locator('.guess-map').click({position:{x:180,y:260}});await p.locator('[data-action="guess-submit"]').click();await p.locator('.guess-card [data-action="show-result"]').waitFor();
  assert.equal(await p.locator('[data-action="guess-back"]').isVisible(),false,'revealed map cannot exit before result');
  await p.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));await idle(p);assert.equal(await p.locator('.guess-page').count(),1);
  await p.locator('[data-action="show-result"]').click();await p.locator('.result-page').waitFor();await idle(p);
  assert.ok(await p.locator('.result-discuss').evaluate(e=>e.nextElementSibling?.classList.contains('result-next-challenge')),'continue entry is immediately below community');
  await p.locator('.result-scroll-cue').click();await p.waitForTimeout(600);await p.locator('.result-next-challenge').scrollIntoViewIfNeeded();
  if(n<4){assert.match(await p.locator('.result-next-challenge').innerText(),/继续下一个挑战/);await p.locator('.result-next-challenge').click();await p.locator('.cover-page').waitFor();await idle(p);}
  else{assert.match(await p.locator('.result-next-challenge').innerText(),/今日挑战已完成/);assert.equal(await p.locator('[data-action="continue-challenge"]').count(),0);await p.locator('.result-next-challenge').click();await p.locator('.cm-hub').waitFor();await idle(p);}
 }
 await p.locator('.cm-entry[data-go="feed"]').click();await p.locator('.cm-feed').waitFor();await idle(p);
 await p.locator('[data-journey="ugc-shapowei"] .cm-post-gallery').click();await p.locator('.explore-page').waitFor();await idle(p);
 assert.equal(await p.locator('[data-action="leave"]').isVisible(),true,'player challenge retains its own exit');await p.locator('[data-action="leave"]').click();await p.locator('.cm-feed').waitFor();await idle(p);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({dailyDestinations:ids,passed:'daily exit locked, five successive rounds, completion boundary, UGC exit preserved',errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
