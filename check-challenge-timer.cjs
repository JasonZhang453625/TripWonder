const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base='http://127.0.0.1:8765/';
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const epoch=Date.parse('2026-09-26T12:00:00+08:00');
async function shot(page,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png')});}}
async function idle(page){await page.waitForFunction(()=>!window.ChallengeMotion?.busy);}
async function closeRules(page){if(await page.locator('.rules-popover').count()){await page.locator('[aria-label="关闭玩法"]').click();await page.locator('.rules-popover').waitFor({state:'detached'});}}
async function enter(page){await page.locator('.cover-page').waitFor();await closeRules(page);await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);}
async function toQuiz(page){
  while(await page.locator('.explore-page').count()){
    const previous=await page.locator('.scene-counter').textContent();
    await page.locator('[data-action="next-scene"]').click();
    await page.waitForFunction(previous=>!document.querySelector('.scene-counter')||document.querySelector('.scene-counter').textContent!==previous,previous);
  }
  await page.locator('#timer').waitFor();await idle(page);
}
async function advance(page,seconds){
  const now=await page.evaluate(()=>Date.now());await page.clock.setFixedTime(new Date(now+seconds*1000));
}
async function timerIs(page,value){await page.waitForFunction(value=>document.querySelector('#timer')?.textContent===value,value);await idle(page);}
async function answer(page,index){await idle(page);await page.locator(`[data-option="${index}"]`).click();await page.locator('[data-action="submit"]').click();await idle(page);}
async function reveal(page){await idle(page);await page.locator('.guess-map').click({position:{x:200,y:300}});await page.locator('[data-action="guess-submit"]').click();await page.locator('.guess-card [data-action="show-result"]').click();await page.locator('.result-hero').waitFor();await idle(page);}

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({...devices['iPhone 13'],deviceScaleFactor:1});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.clock.setFixedTime(new Date(epoch));await page.goto(base);await page.locator('.entry').click();
    const ids=await page.evaluate(()=>window.TRIPWONDER_CATALOG.cities.map(c=>c.id));
    await closeRules(page);
    // Every destination uses the same untimed exploration and two-minute quiz.
    for(let i=0;i<ids.length;i++){
      await enter(page);assert.equal(await page.locator('#timer,[role="timer"]').count(),0);
      await advance(page,300);await page.waitForTimeout(300);
      assert.equal(await page.locator('.explore-page').count(),1,'exploration never expires');
      if(i===0){
        const total=Number((await page.locator('.scene-counter').textContent()).split('/')[1]);
        if(total>1){await page.locator('[data-action="next-scene"]').click();await page.locator('.scene-counter').filter({hasText:`2 / ${total}`}).waitFor();}
        const counter=await page.locator('.scene-counter').textContent();await shot(page,'explore-no-timer');
        await page.locator('[data-action="leave"]').click();await page.locator('.cover-page').waitFor();
        assert.equal(await page.locator('[role="dialog"]').count(),0,'return does not show an interception dialog');
        await advance(page,300);await page.waitForTimeout(300);assert.equal(await page.locator('.cover-page').count(),1);
        await enter(page);assert.equal(await page.locator('.scene-counter').textContent(),counter,'return preserves the current scene');
      }
      await toQuiz(page);await timerIs(page,'02:00');
      await advance(page,43);await timerIs(page,'01:17');
      await answer(page,0);await timerIs(page,'01:17');
      if(i===0){
        await shot(page,'quiz-two-minutes');
        await answer(page,1);await answer(page,2);await page.locator('.guess-map').waitFor();
        assert.equal(await page.locator('#timer').count(),0,'map has no countdown');
        await advance(page,300);await page.locator('[data-action="guess-back"]').click();await timerIs(page,'01:17');
        await advance(page,47);await timerIs(page,'00:30');assert.ok(await page.locator('.quiz-timer.urgent').count());
        await page.locator('[data-action="submit"]').click();await page.locator('.guess-map').waitFor();await idle(page);
        await page.locator('[data-action="guess-back"]').click();await timerIs(page,'00:30');
      }
      await page.locator('[data-action="quiz-back"]').click();await page.locator('.explore-page').waitFor();await idle(page);
      const sceneCounter=await page.locator('.scene-counter').textContent(),sceneParts=sceneCounter.split('/').map(Number);
      assert.equal(sceneParts[0],sceneParts[1],'quiz back returns to the last explored scene');
      assert.equal(await page.locator('#timer,[role="dialog"]').count(),0,'return to exploration pauses quiz without a dialog');
      await advance(page,300);await page.waitForTimeout(300);
      assert.equal(await page.locator('.explore-page').count(),1,'returned exploration never expires');
      await page.locator('[data-action="leave"]').click();await page.locator('.cover-page').waitFor();
      assert.equal(await page.locator('#timer,[role="dialog"]').count(),0);
      await advance(page,300);await page.waitForTimeout(300);
      assert.equal(await page.locator('.cover-page').count(),1,'leaving the quiz stops expiry navigation');
      const cover=await page.locator('.cover-hero img').getAttribute('src');
      await page.locator('[data-action="skip"]').click();
      if(i<ids.length-1)await page.waitForFunction(previous=>{const image=document.querySelector('.cover-hero img');return image&&image.getAttribute('src')!==previous;},cover);
    }
    await page.locator('.entry').waitFor();
    // Timeout preserves submitted answers and the currently selected answer; unanswered questions score zero.
    const token=Buffer.from(JSON.stringify({cityId:'datong',score:0,day:'2026-09-26'})).toString('base64url');
    await page.goto(base+'?challenge='+token);await enter(page);await toQuiz(page);await timerIs(page,'02:00');
    const answers=await page.evaluate(()=>window.TRIPWONDER_CATALOG.cities.find(c=>c.id==='datong').questions.map(q=>q.answer));
    await answer(page,answers[0]);await page.locator(`[data-option="${answers[1]}"]`).click();
    await advance(page,120);await page.locator('.guess-map').waitFor();
    assert.equal(await page.locator('#timer').count(),0);assert.equal(await page.locator('[data-action="guess-back"]').isDisabled(),true);
    await reveal(page);assert.match(await page.locator('.result-score-breakdown,.score-split').textContent(),/答题\s*40\s*\/ 60/);
    assert.equal(await page.locator('[data-review]').count(),3);await page.locator('[data-review="2"]').click();
    assert.match(await page.locator('.sheet').textContent(),/你的答案：未作答/);
    await page.reload();await enter(page);
    assert.match(await page.locator('.scene-counter').textContent(),/^1 \/ /);assert.equal(await page.locator('#timer').count(),0);
    await toQuiz(page);await timerIs(page,'02:00');await advance(page,120);await page.locator('.guess-map').waitFor();
    await reveal(page);assert.match(await page.locator('.result-score-breakdown,.score-split').textContent(),/答题\s*0\s*\/ 60/);
    assert.deepEqual(errors,[]);
    console.log(`PASS: all ${ids.length} destinations; untimed exploration; quiz back returns to the last scene without a dialog; direct scene exit and resume; shared 120-second quiz; stopped timer on exploration/cover/map; remaining time on map return; timeout scoring and unanswered review; fresh reload.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
