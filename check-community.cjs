// TripWonder entry split: hub → 今日挑战 / 社区; official journeys only after being challenged (with the city badge);
// sample UGC journeys playable with no rewards; browse mode with clues and notes; no notes or clues in the challenge.
// TRIPWONDER_BASE (default http://127.0.0.1:8765/) and TRIPWONDER_BROWSER (default: local Chrome) can be overridden.
const {chromium,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const executablePath=process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
async function shot(page,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png')});}}
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy&&!document.querySelector('.scene-transition'));
const ready=page=>page.waitForFunction(()=>window.TWStore&&window.Community&&document.querySelector('#app').firstElementChild);
async function closeRules(page){if(await page.locator('.rules-popover').count()){await page.locator('.rules-popover [data-action="close"]').click();await page.locator('.rules-popover').waitFor({state:'detached'});}}
async function advance(page,seconds){const now=await page.evaluate(()=>Date.now());await page.clock.setFixedTime(new Date(now+seconds*1000));}
async function answerAll(page,choice=0){for(let i=0;i<3;i++){await idle(page);await page.locator(`[data-option="${choice}"]`).click();await page.locator('[data-action="submit"]').click();await page.locator('.quiz-reveal').waitFor();await page.locator('[data-action="submit"]').click();}await page.locator('.guess-map').waitFor();await idle(page);}
async function reveal(page){await idle(page);await page.locator('.guess-map').click({position:{x:200,y:300}});await page.locator('[data-action="guess-submit"]').click();await page.locator('.guess-card [data-action="show-result"]').click();await page.locator('.result-hero').waitFor();await idle(page);}

(async()=>{
  const browser=await chromium.launch({executablePath,headless:true});
  try{
    const page=await browser.newPage({...devices['iPhone 13'],deviceScaleFactor:1});page.setDefaultTimeout(20000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.clock.setFixedTime(new Date());
    await page.goto(base);await ready(page);await page.evaluate(()=>TWStore.reset());await page.reload();await ready(page);
    await page.evaluate(()=>window.HomePromo?.dismiss());

    // UGC never joins the official pool (daily draw, atlas, rankings).
    const pools=await page.evaluate(()=>({official:TRIPWONDER_CATALOG.cities.map(c=>c.id),ugc:TRIPWONDER_CATALOG.ugc.map(c=>c.id)}));
    assert.ok(pools.ugc.length>=3,'sample UGC journeys are registered');
    assert.ok(pools.ugc.every(id=>!pools.official.includes(id)),'UGC stays out of the official pool');

    // Home → hub with the two entries.
    await page.locator('.th-wonder').click();await page.locator('.cm-hub').waitFor();await idle(page);
    assert.equal(await page.locator('.cm-entry').count(),2);await shot(page,'hub');
    await page.locator('.cm-entry[data-go="feed"]').click();await page.locator('.cm-feed').waitFor();await idle(page);
    assert.equal(await page.locator('[data-feed-tab="all"]').getAttribute('aria-selected'),'true','the community opens on the square');
    assert.equal(await page.locator('.cm-post').count(),pools.ugc.length,'approved player posts fill the first visit');
    assert.equal(await page.locator('.cm-post-author,.cm-post-footer').count(),pools.ugc.length*2,'each post has author and social actions');
    const follow=page.locator('[data-journey="ugc-shapowei"] .cm-follow'),like=page.locator('[data-feed-like="ugc-shapowei"]');
    await follow.click();assert.equal(await follow.getAttribute('aria-pressed'),'true');
    await like.click();assert.equal(await like.getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.cm-feed').count(),1,'social actions keep the feed open');
    await like.click();assert.equal(await like.getAttribute('aria-pressed'),'false','a second tap removes the like');
    await like.click();
    assert.equal(await page.locator('[data-journey="ugc-dongjiao"] .cm-comment-entry').isDisabled(),true,'disabled boards have no comment action');
    await shot(page,'feed-square');
    await page.locator('[data-feed-tab="official"]').click();
    assert.equal(await page.locator('.cm-card').count(),0,'no official journey before any challenge');
    assert.equal(await page.locator('.cm-empty').count(),1);
    await page.locator('[data-feed-tab="ugc"]').click();assert.equal(await page.locator('.cm-card').count(),pools.ugc.length);
    assert.equal(await page.locator('.cm-stamp').count(),0,'nothing played yet');
    const ugcTitle=await page.locator('[data-journey="ugc-shapowei"] strong').textContent();
    assert.ok(!ugcTitle.includes('沙坡尾'),'an unplayed UGC card hides the place name');

    // Today's challenge: no clue hotspots, no notes, one clock across exploring and answering.
    await page.locator('.cm-feed [data-action="journey-back"],.cm-feed .page-head [data-go="hub"]').first().click();await page.locator('.cm-hub').waitFor();await idle(page);
    await page.locator('.cm-entry[data-go="today"]').click();await page.locator('.cover-page').waitFor();await idle(page);await closeRules(page);
    const cityId=await page.locator('.cover-page').getAttribute('data-cover-city');
    await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.equal(await page.locator('.hotspot').count(),0,'the challenge has no clue hotspots');
    assert.equal(await page.locator('.tw-bubble-bar,.tw-bubble').count(),0,'the challenge shows no notes');
    assert.equal(await page.locator('#timer').textContent(),'01:00');await shot(page,'challenge-explore');
    await advance(page,15);await page.waitForFunction(()=>document.querySelector('#timer')?.textContent==='00:45');
    await page.locator('[data-action="leave"]').click();await page.locator('.cover-page').waitFor();await idle(page);
    await advance(page,10);await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.equal(await page.locator('#timer').textContent(),'00:35','the clock keeps running on the cover');
    await page.locator('[data-action="go-quiz"]').click();await page.locator('.quiz-page').waitFor();await idle(page);
    assert.equal(await page.locator('#timer').textContent(),'00:35','answering shares the same clock');
    await page.locator('[data-option="0"]').click();await page.locator('[data-action="submit"]').click();await idle(page);
    await page.locator('[data-action="quiz-back"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.equal(await page.locator('.hotspot').count(),0);
    await advance(page,40);await page.locator('.guess-map').waitFor();await idle(page);
    assert.equal(await page.locator('[data-action="guess-back"]').isDisabled(),true,'time-out leaves no time to go back');
    await reveal(page);
    assert.equal(await page.locator('.badge-benefit').count(),1,'the challenge keeps its badge module');
    assert.equal(await page.locator('[data-action="discuss"]').count(),1);
    const challenged=await page.evaluate(()=>TWStore.get().challenged);
    assert.ok(challenged[cityId],'the challenged city is stored');

    // The result opens the city's community page, which lists it with a dim badge (no badge claimed).
    await page.locator('[data-action="discuss"]').click();await page.locator('.cm-journey').waitFor();await idle(page);
    assert.equal(await page.locator('.cm-hero .cm-medal').count(),1);assert.equal(await page.locator('.cm-hero .cm-medal.is-lit').count(),0);
    assert.ok(await page.locator('.cm-board .cm-note').count()>0,'official board shows notes');
    await page.locator('[data-board-filter="been"]').click();
    assert.ok(await page.locator('.cm-board .cm-kind.kind-want').count()===0,'filter keeps only "been" notes');
    await shot(page,'official-journey');
    // Browse mode: clue hotspots and notes, no clock and no quiz.
    await page.locator('[data-action="browse"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.ok(await page.locator('.hotspot').count()>0,'browse shows clue hotspots');
    assert.equal(await page.locator('#timer,.explore-go-quiz').count(),0,'browse has no clock or quiz');
    await page.locator('.tw-bubble-bar').waitFor();await shot(page,'browse');
    await page.locator('[data-action="leave"]').click();await page.locator('.cm-journey').waitFor();await idle(page);
    await page.locator('[data-action="journey-back"]').click();await page.locator('.result-page').waitFor();await idle(page);

    // A claimed badge lights the mark in the feed and survives a reload.
    const medalReady=await page.locator('.badge-benefit [data-action="claim"]').isEnabled();
    await page.reload();await ready(page);await page.evaluate(()=>window.HomePromo?.dismiss());
    await page.locator('.th-wonder').click();await page.locator('.cm-hub').waitFor();await idle(page);
    await page.locator('.cm-entry[data-go="feed"]').click();await page.locator('.cm-feed').waitFor();await idle(page);
    assert.equal(await page.locator('[data-journey="ugc-shapowei"] .cm-follow').getAttribute('aria-pressed'),'true','following survives reload');
    assert.equal(await page.locator('[data-feed-like="ugc-shapowei"]').getAttribute('aria-pressed'),'true','post likes survive reload');
    await page.locator('[data-feed-tab="official"]').click();
    assert.equal(await page.locator(`.cm-card[data-journey="${cityId}"]`).count(),1,'challenged city stays in the feed after a reload');
    assert.equal(await page.locator('.cm-card').count(),1,'only challenged official cities are listed');
    assert.equal(medalReady,false,'a timed-out round scores below the badge line');
    assert.equal(await page.locator(`.cm-card[data-journey="${cityId}"] .cm-medal.is-lit`).count(),0,'no badge claimed yet');
    // A badge claimed on the result page is stored with the challenge record; the feed lights it after a reload.
    await page.evaluate(id=>TWStore.update(data=>{data.challenged[id]={...data.challenged[id],badge:{date:'2026-10-16'}};}),cityId);
    await page.reload();await ready(page);await page.evaluate(()=>window.HomePromo?.dismiss());await page.locator('.th-wonder').click();await page.locator('.cm-entry[data-go="feed"]').click();await page.locator('.cm-feed').waitFor();await idle(page);
    await page.locator('[data-feed-tab="official"]').click();
    assert.equal(await page.locator(`.cm-card[data-journey="${cityId}"] .cm-medal.is-lit`).count(),1,'a claimed badge lights the mark');
    await shot(page,'feed-official');

    // Player journey: playable from the community, no rewards, marked as played.
    const coins=await page.evaluate(()=>TWStore.get().wallet.balance);
    await page.locator('[data-feed-tab="ugc"]').click();await page.locator('[data-journey="ugc-shapowei"]').click();await page.locator('.cm-journey').waitFor();await idle(page);
    assert.equal(await page.locator('.cm-board.is-locked').count(),1,'the board stays locked until the journey is played');
    assert.equal(await page.locator('[data-action="browse"]').count(),0,'no browsing before playing');
    await page.locator('[data-action="ugc-start"]').click();await page.locator('.cover-ugc').waitFor();await idle(page);await closeRules(page);
    assert.equal(await page.locator('.cover-ugc [data-go="atlas"],.cover-ugc [data-action="pk-start"]').count(),0,'no atlas, rankings or PK on a player journey');
    await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.equal(await page.locator('.hotspot,.tw-bubble-bar').count(),0);
    await page.locator('[data-action="go-quiz"]').click();await page.locator('.quiz-page').waitFor();
    await answerAll(page,1);await reveal(page);
    assert.equal(await page.locator('.result-ugc').count(),1);
    for(const selector of ['.badge-benefit','.coupon-benefit','[data-action="claim"]','[data-action="claim-coupon"]','.stop-nav','[data-go="route"]','.pk-result','.wallet-earned'])assert.equal(await page.locator('#app '+selector).count(),0,'no '+selector+' on a player journey');
    assert.equal(await page.evaluate(()=>TWStore.get().wallet.balance),coins,'no coins for a player journey');
    assert.ok(!(await page.evaluate(()=>TWStore.get().challenged))['ugc-shapowei'],'a player journey is not an official challenge');
    assert.ok((await page.evaluate(()=>TWStore.get().ugcPlayed))['ugc-shapowei'],'the play is recorded');
    await page.locator('.result-actions [data-action="result-exit"]').click();await page.locator('.cm-journey').waitFor();await idle(page);
    assert.equal(await page.locator('.cm-hero .cm-stamp').count(),1,'played stamp on the journey');
    assert.ok((await page.locator('.cm-info h1').textContent()).includes('沙坡尾'),'the place name is revealed after playing');
    assert.ok(await page.locator('.cm-board .cm-note').count()>0,'the board opens after playing');
    await page.locator('[data-action="journey-back"]').click();await page.locator('.cm-feed').waitFor();await idle(page);
    assert.equal(await page.locator('[data-journey="ugc-shapowei"] .cm-stamp').count(),1,'played stamp in the feed');
    // A publisher who turned the board off: no board even after playing.
    await page.locator('[data-journey="ugc-dongjiao"]').click();await page.locator('.cm-journey').waitFor();
    assert.equal(await page.locator('.cm-board.is-off').count(),1);
    await page.locator('[data-action="journey-back"]').click();await page.locator('.cm-feed').waitFor();await idle(page);

    // Publish form prototype validates on the device and uploads nothing.
    await page.locator('[data-go="publish"]').click();await page.locator('.cm-form').waitFor();await idle(page);
    await page.locator('.cm-submit').click();assert.match(await page.locator('.cm-error').textContent(),/照片/);
    const official=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.length);
    assert.equal(await page.evaluate(()=>TRIPWONDER_CATALOG.ugc.length),pools.ugc.length);
    assert.equal(official,pools.official.length);

    assert.deepEqual(errors,[]);
    console.log('PASS: hub entries; UGC outside the official pool; feed lists only challenged cities with their badge; challenge without clues or notes on one 1-minute clock (runs on the cover, shared with answering, time-out to the map); result → community page; browse with clues and notes, no clock; player journey without rewards, played stamp and board unlock; board switched off; publish form validation.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
