// Today's challenge runs on one clock: it starts at the first scene, keeps running through the cover, the scenes and
// the quiz, turns red at 15 s and beats in the last 10 s, and on time-out submits the current answers and opens the map.
// A revealed answer freezes the clock until the player moves on. TRIPWONDER_BASE / TRIPWONDER_BROWSER override defaults.
const {chromium,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const executablePath=process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const epoch=Date.parse('2026-10-17T12:00:00+08:00');
async function shot(page,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.waitForTimeout(300);await page.screenshot({path:path.join(artifacts,name+'.png')});}}
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy&&!document.querySelector('.scene-transition'));
async function closeRules(page){if(await page.locator('.rules-popover').count()){await page.locator('.rules-popover [data-action="close"]').click();await page.locator('.rules-popover').waitFor({state:'detached'});}}
async function advance(page,seconds){const now=await page.evaluate(()=>Date.now());await page.clock.setFixedTime(new Date(now+seconds*1000));}
async function timerIs(page,value){await page.waitForFunction(value=>document.querySelector('#timer')?.textContent===value,value);}
async function open(page,cityId){
  const token=Buffer.from(JSON.stringify({cityId,score:0,day:'2026-10-17'})).toString('base64url');
  await page.goto(base+'?challenge='+token);await page.locator('.cover-page').waitFor();await idle(page);await closeRules(page);
}
async function start(page){await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);}
async function reveal(page){await idle(page);await page.locator('.guess-map').click({position:{x:200,y:300}});await page.locator('[data-action="guess-submit"]').click();await page.locator('.guess-card [data-action="show-result"]').click();await page.locator('.result-hero').waitFor();await idle(page);}

(async()=>{
  const browser=await chromium.launch({executablePath,headless:true});
  try{
    const page=await browser.newPage({...devices['iPhone 13'],deviceScaleFactor:1});page.setDefaultTimeout(20000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.clock.setFixedTime(new Date(epoch));
    await open(page,'datong');
    assert.equal(await page.locator('.cover-limit').count(),0,'no limit chip on the start button');
    await start(page);await timerIs(page,'01:00');
    assert.equal(await page.locator('.countdown-edge').count(),1,'one shared screen-edge clock');
    const edge=()=>page.locator('.countdown-edge').evaluate(el=>({length:Number(el.style.getPropertyValue('--edge-length')),offset:Number(el.style.getPropertyValue('--edge-offset')),color:el.style.color}));
    const full=await edge();assert.equal(full.length,1);assert.equal(full.color,'rgb(47, 158, 255)');
    const boxes=await page.locator('.explore-timer').evaluate(el=>{const time=el.querySelector('#timer').getBoundingClientRect(),counter=el.querySelector('.scene-counter').getBoundingClientRect(),box=el.getBoundingClientRect();return {separate:time.right<counter.left,inside:counter.right<=box.right};});
    assert.ok(boxes.separate&&boxes.inside,'time and pagination occupy separate space within the capsule');
    await shot(page,'edge-start');
    assert.equal(await page.locator('.hotspot').count(),0,'no clue hotspots');
    assert.equal(await page.locator('[data-action="go-quiz"],.explore-go-quiz').count(),0,'no shortcut before the last scene');
    assert.equal(await page.locator('[data-action="next-scene"]').getAttribute('aria-label'),'下一处');
    // Back cannot leave an active daily round; the clock keeps running.
    await advance(page,15);await timerIs(page,'00:45');
    const midway=await edge();assert.ok(midway.length<1&&midway.length>0);assert.ok(Math.abs(midway.offset+1-midway.length)<1e-6);
    await shot(page,'edge-descending');
    await page.locator('[data-action="next-scene"]').click();await page.locator('.scene-counter',{hasText:'2 / 3'}).waitFor();await idle(page);
    assert.equal(await page.locator('[data-action="leave"]').isVisible(),false,'daily exploration exit stays hidden');
    await page.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));await idle(page);
    assert.equal(await page.locator('.explore-page').count(),1,'system back stays in the round');
    await advance(page,10);await timerIs(page,'00:35');
    const resumed=await edge();assert.ok(resumed.length<midway.length,'edge resumes from elapsed time');
    assert.equal(await page.locator('.scene-counter').textContent(),'2 / 3','resuming keeps the current scene');
    // The last scene's button starts answering on the same clock; urgency shows from 15 s.
    await page.locator('[data-action="next-scene"]').click();await page.locator('.scene-counter',{hasText:'3 / 3'}).waitFor();await idle(page);
    assert.equal(await page.locator('.explore-go-quiz').count(),0,'the last scene uses its own button');
    await page.locator('[data-action="next-scene"]').click();await page.locator('.quiz-page').waitFor();await idle(page);
    await timerIs(page,'00:35');
    assert.equal(await page.locator('.countdown-edge').count(),1,'quiz uses the same single edge');assert.equal((await edge()).length,resumed.length);
    await advance(page,23);await timerIs(page,'00:12');
    const late=await edge();assert.equal(late.color,'rgb(255, 65, 74)');assert.ok(late.length<resumed.length);
    assert.equal(await page.locator('.quiz-timer.urgent').count(),1);
    await advance(page,3);await timerIs(page,'00:09');
    const finalEdge=await edge();assert.ok((late.length-finalEdge.length)/3<(midway.length-resumed.length)/10,'edge movement slows near the end');
    await page.waitForFunction(()=>document.querySelector('.quiz-timer')?.classList.contains('final'));
    await shot(page,'quiz-urgent');
    // Answer two questions, then go back to a scene: the clock keeps running there.
    const answers=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.find(c=>c.id==='datong').questions.map(q=>q.answer));
    for(const i of [0,1]){
      await idle(page);await page.locator(`[data-option="${answers[i]}"]`).click();await page.locator('[data-action="submit"]').click();
      await page.locator('.quiz-reveal.is-correct').waitFor();
      if(i===0){await advance(page,5);await timerIs(page,'00:09');assert.equal(await page.locator('.quiz-timer.paused').count(),1,'reading the explanation costs no time');}
      await page.locator('[data-action="submit"]').click();
    }
    await idle(page);await page.locator('[data-action="quiz-back"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    await timerIs(page,'00:09');assert.ok(await page.locator('.explore-timer.urgent').count(),'urgency also shows in the scene');
    await page.locator('[data-action="next-scene"]').click();
    await page.locator('.quiz-page').waitFor();await idle(page);
    // Time-out on the last question submits the selected answer and opens the map without a way back.
    await page.locator(`[data-option="${(answers[2]+1)%4}"]`).click();
    await advance(page,9);await page.locator('.countdown-edge.is-ended').waitFor();
    assert.equal((await edge()).length,0,'both paths meet at the bottom centre at zero');
    await shot(page,'edge-end');
    await page.locator('.guess-map').waitFor();await idle(page);
    await page.locator('.countdown-edge').waitFor({state:'detached'});
    assert.equal(await page.locator('[data-action="guess-back"]').isDisabled(),true);
    await reveal(page);
    assert.match(await page.locator('.result-score-breakdown').textContent(),/限时答题\s*40\s*\/ 60/,'two right answers, the third selected answer was wrong');

    // Ignoring a system-back exit attempt still allows timeout to submit unanswered questions.
    const other=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.find(c=>c.id!=='datong').id);
    await open(page,other);await start(page);
    await page.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));
    await advance(page,61);await page.locator('.guess-map').waitFor();await idle(page);
    await reveal(page);
    assert.match(await page.locator('.result-score-breakdown').textContent(),/限时答题\s*0\s*\/ 60/);
    await page.locator('[data-review="0"]').click();assert.match(await page.locator('.sheet').textContent(),/你的答案：未作答/);
    assert.deepEqual(errors,[]);
    console.log('PASS: no cover limit chip; timer/pagination do not overlap; one edge clock shrinks symmetrically, slows and turns red, resumes across scenes/quiz, and ends at zero; cover/map hide it; time-out submits current answers and locks the map; expiry while away scores unanswered questions 0.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
