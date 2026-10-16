// Today's challenge runs on one clock: it starts at the first scene, keeps running through the cover, the scenes and
// the quiz, turns red at 15 s and beats in the last 10 s, and on time-out submits the current answers and opens the map.
// Returning from the map with time left restarts the same clock. TRIPWONDER_BASE / TRIPWONDER_BROWSER override defaults.
const {chromium,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const executablePath=process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const epoch=Date.parse('2026-10-17T12:00:00+08:00');
async function shot(page,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png')});}}
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
    assert.match(await page.locator('.cover-enter').textContent(),/限时 02:00/,'the cover states the limit');
    await start(page);await timerIs(page,'02:00');
    assert.equal(await page.locator('.hotspot').count(),0,'no clue hotspots');
    assert.equal(await page.locator('.explore-go-quiz').count(),1,'answering is available from any scene');
    // The clock runs while exploring and while back on the cover.
    await advance(page,40);await timerIs(page,'01:20');
    await page.locator('[data-action="next-scene"]').click();await page.locator('.scene-counter',{hasText:'2 / 3'}).waitFor();await idle(page);
    await page.locator('[data-action="leave"]').click();await page.locator('.cover-page').waitFor();await idle(page);
    assert.match(await page.locator('.cover-enter').textContent(),/继续挑战/);
    await advance(page,30);await start(page);await timerIs(page,'00:50');
    assert.equal(await page.locator('.scene-counter').textContent(),'2 / 3','resuming keeps the current scene');
    // The last scene's button starts answering on the same clock; urgency shows from 15 s.
    await page.locator('[data-action="next-scene"]').click();await page.locator('.scene-counter',{hasText:'3 / 3'}).waitFor();await idle(page);
    assert.equal(await page.locator('.explore-go-quiz').count(),0,'the last scene uses its own button');
    await page.locator('[data-action="next-scene"]').click();await page.locator('.quiz-page').waitFor();await idle(page);
    await timerIs(page,'00:50');
    await advance(page,38);await timerIs(page,'00:12');
    assert.equal(await page.locator('.quiz-timer.urgent').count(),1);
    await advance(page,3);await timerIs(page,'00:09');
    await page.waitForFunction(()=>document.querySelector('.quiz-timer')?.classList.contains('final'));
    await shot(page,'quiz-urgent');
    // Answer two questions, then go back to a scene: the clock keeps running there.
    const answers=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.find(c=>c.id==='datong').questions.map(q=>q.answer));
    for(const i of [0,1]){await idle(page);await page.locator(`[data-option="${answers[i]}"]`).click();await page.locator('[data-action="submit"]').click();}
    await idle(page);await page.locator('[data-action="quiz-back"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    await timerIs(page,'00:09');assert.ok(await page.locator('.explore-timer.urgent').count(),'urgency also shows in the scene');
    await page.locator('[data-action="go-quiz"]').count()&&await page.locator('[data-action="go-quiz"]').click();
    if(!(await page.locator('.quiz-page').count()))await page.locator('[data-action="next-scene"]').click();
    await page.locator('.quiz-page').waitFor();await idle(page);
    // Answering the last question opens the map; going back restarts the remaining time.
    await page.locator(`[data-option="${(answers[2]+1)%4}"]`).click();await page.locator('[data-action="submit"]').click();
    await page.locator('.guess-map').waitFor();await idle(page);
    assert.equal(await page.locator('#timer').count(),0,'the map has no countdown');
    await advance(page,300);await page.locator('[data-action="guess-back"]').click();await page.locator('.quiz-page').waitFor();await timerIs(page,'00:09');
    // Time-out submits the selected answer and opens the map without a way back.
    await advance(page,9);await page.locator('.guess-map').waitFor();await idle(page);
    assert.equal(await page.locator('[data-action="guess-back"]').isDisabled(),true);
    await reveal(page);
    assert.match(await page.locator('.result-score-breakdown').textContent(),/限时答题\s*40\s*\/ 60/,'two right answers, the third selected answer was wrong');

    // A clock that ran out while on the cover goes straight to the map on return, answers unanswered (0 points).
    const other=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.find(c=>c.id!=='datong').id);
    await open(page,other);await start(page);
    await page.locator('[data-action="leave"]').click();await page.locator('.cover-page').waitFor();await idle(page);
    await advance(page,121);await page.locator('[data-action="start"]').click();await page.locator('.guess-map').waitFor();await idle(page);
    await reveal(page);
    assert.match(await page.locator('.result-score-breakdown').textContent(),/限时答题\s*0\s*\/ 60/);
    await page.locator('[data-review="0"]').click();assert.match(await page.locator('.sheet').textContent(),/你的答案：未作答/);
    assert.deepEqual(errors,[]);
    console.log('PASS: one 2-minute clock from the first scene; runs on the cover and while answering; resume keeps the scene; answer from any scene; red at 15 s and final beat in scenes and quiz; map has no clock and going back restarts the remaining time; time-out submits and locks the map; expiry while away scores unanswered questions 0.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
