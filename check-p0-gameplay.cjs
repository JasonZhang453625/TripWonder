// P0 gameplay layer: Wonder Coins rules, simulated PK, scene notes, no destination leaks, blocked storage.
// TRIPWONDER_BASE (default http://127.0.0.1:8765/) and TRIPWONDER_BROWSER (default: local Chrome) can be overridden.
const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8765/';
const executablePath=process.env.TRIPWONDER_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy);
async function closeRules(page){if(await page.locator('.rules-popover').count()){await page.locator('.rules-popover [data-action="close"]').click();await page.locator('.rules-popover').waitFor({state:'detached'});}}

(async()=>{
  const browser=await chromium.launch({executablePath,headless:true});
  try{
    const context=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
    const page=await context.newPage();page.setDefaultTimeout(20000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);await page.evaluate(()=>TWStore.reset());

    // Coins: score + badge + PK win; speed, improved-score replays and additional destinations add no bonus.
    const day='2026-10-15';
    const first=await page.evaluate(day=>Wallet.award({cityId:'datong',day,score:85,quizRemaining:40000,pk:{outcome:'win'}}),day);
    assert.equal(first.total,9+5+10,'85 points, badge and a PK win');
    await page.reload();
    assert.equal(await page.evaluate(()=>TWStore.get().wallet.balance),24,'balance survives a reload');
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'datong',day,score:85,quizRemaining:40000,pk:{outcome:'win'}}),day)).total,0,'a repeat after reload pays nothing');
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'datong',day,score:95,quizRemaining:50000}),day)).total,0,'a new best pays nothing');
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'beijing',day,score:40}),day)).total,4);
    const third=await page.evaluate(day=>Wallet.award({cityId:'suzhou',day,score:40}),day);
    assert.equal(third.total,4,'third destination does not add a daily bonus');
    await page.reload();
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'guilin',day,score:40}),day)).total,4,'each destination pays only its score reward');
    await page.evaluate(()=>TWStore.update(data=>{data.wallet.balance=1500;}));
    const before=await page.evaluate(()=>Wallet.balance());
    const bought=await page.evaluate(()=>Wallet.redeem('c-food'));
    assert.ok(bought.ok&&/^TW[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(bought.code));
    assert.equal(await page.evaluate(()=>Wallet.balance()),before-1500);
    assert.equal((await page.evaluate(()=>Wallet.redeem('c-hotel'))).reason,'balance','cannot overspend');

    // PK: the same city, day and opponent always replay the same match; a friend's link lands exactly on their score.
    const pk=await page.evaluate(()=>{
      const city=TRIPWONDER_CATALOG.cities[0],guess=km=>km<=25?40:Math.round(40*Math.exp(-(km-25)/450));
      const make=invitation=>PKMode.create({city,day:'2026-10-15',points:[20,20,20],guessScore:guess,guessMax:40,duration:60000,invitation});
      const a=make(null),b=make(null),friends=[];
      for(let score=0;score<=100;score+=1)friends.push([score,make({score}).score]);
      return {same:JSON.stringify(a)===JSON.stringify(b),inTime:a.answers.every(x=>x.at<60000),friends};
    });
    assert.ok(pk.same,'PK is reproducible');assert.ok(pk.inTime,'opponent answers within the minute');
    for(const [score,got] of pk.friends)assert.equal(got,score,`friend opponent rebuilt for score ${score}`);

    // Sample notes never name a destination, its province or its scenes.
    const leaks=await page.evaluate(()=>{
      const out=[];
      for(const city of TRIPWONDER_CATALOG.cities){
        const names=[city.name,city.nameEn,city.region?.replace(/^中国|特别行政区$|省$/g,''),city.regionEn?.replace(/ SAR$/,''),...city.scenes.flatMap(sc=>String(sc.name||'').split(/[·\s]+/))].filter(n=>n&&n.length>1);
        for(const scene of city.scenes)for(const note of TW_BUBBLE_SEED[scene.id]||[])for(const name of names)if(note.text.includes(name)||note.textEn.toLowerCase().includes(name.toLowerCase()))out.push(`${scene.id}: ${name}`);
      }
      return {out,missing:TRIPWONDER_CATALOG.cities.flatMap(c=>c.scenes).filter(sc=>!TW_BUBBLE_SEED[sc.id]?.length).map(sc=>sc.id)};
    });
    assert.deepEqual(leaks.out,[],'seed notes stay anonymous');assert.deepEqual(leaks.missing,[],'every scene has sample notes');

    // Rewards page before any result: only merchants without a city.
    await page.evaluate(()=>TWStore.reset());await page.goto(base);await page.evaluate(()=>window.HomePromo?.dismiss());
    await page.locator('.th-nav [data-go="profile"]').waitFor();await page.locator('.th-nav [data-go="profile"]').click();await page.locator('.profile-page').waitFor();await idle(page);
    await page.locator('.pf-wallet-main').click();await page.locator('.tw-mall-page').waitFor();await idle(page);
    const mallText=await page.locator('.tw-mall-page').textContent(),cityNames=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.map(c=>c.name));
    for(const name of cityNames)assert.ok(!mallText.includes(name),`rewards page does not name ${name} before it is solved`);

    // Today's challenge shows no notes; they live in the community, on cities this player has challenged.
    await page.goto(base);await page.locator('.entry').first().click();await page.locator('.cm-entry[data-go="today"]').click();await page.locator('.cover-page').waitFor();await idle(page);await closeRules(page);
    await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.equal(await page.locator('.tw-bubble,.tw-bundle').count(),0,'no notes in the challenge');
    // Scene notes in the community: the three most-liked notes are strips, every other note is counted once in an
    // envelope bubble (nearby ones grouped), a tap on the photo writes a note, and posted notes are escaped and persist.
    await page.evaluate(()=>TWStore.update(data=>{data.challenged={datong:{at:Date.now(),result:{score:50}}};}));
    await page.goto(base);await page.evaluate(()=>window.HomePromo?.dismiss());await page.locator('.th-wonder').click();await page.locator('.cm-hub').waitFor();await idle(page);
    await page.locator('.cm-entry[data-go="feed"]').click();await page.locator('.cm-feed').waitFor();await idle(page);
    await page.locator('[data-journey="datong"] .cm-post-gallery').click();await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();await idle(page);
    await page.locator('.photo-plane .tw-bubble').first().waitFor({state:'attached'});
    const current=await page.evaluate(()=>{
      const strips=[...document.querySelectorAll('.photo-plane .tw-bubble')].map(n=>n.dataset.id),bundles=[...document.querySelectorAll('.photo-plane .tw-bundle')];
      const grouped=bundles.flatMap(b=>[...b.querySelectorAll('.tw-bundle-note')].map(n=>n.dataset.id));
      const counted=bundles.reduce((n,b)=>n+Number(b.querySelector('.tw-bundle-pill b').textContent),0);
      const scene=strips[0].match(/^seed-(.+)-\d+$/)[1],seed=TW_BUBBLE_SEED[scene];
      const top=seed.map((note,index)=>({note,index})).sort((a,b)=>b.note.likes-a.note.likes||a.index-b.index).slice(0,3).map(x=>x.note.id);
      return {name:TRIPWONDER_CATALOG.cities.find(c=>c.scenes.some(sc=>sc.id===scene)).name,scene,strips,top,grouped,counted,total:seed.length,largest:Math.max(...bundles.map(b=>b.querySelectorAll('.tw-bundle-note').length))};
    });
    assert.deepEqual(current.strips,current.top,'the three most-liked notes are strips');
    assert.equal(current.counted,current.grouped.length,'a bubble shows how many notes it holds');
    assert.equal(new Set([...current.strips,...current.grouped]).size,current.total,'every note shows exactly once');
    assert.ok(current.largest>1,'nearby notes share a bubble');
    const spot=await page.locator('.photo-viewport').evaluate(root=>{const r=root.getBoundingClientRect();for(const y of [.5,.62,.38])for(const x of [.5,.3,.7]){const at={x:r.left+r.width*x,y:r.top+r.height*y},n=document.elementFromPoint(at.x,at.y);if(n&&root.contains(n)&&!n.closest('button,a,.tw-bubble,.tw-bundle,.hotspot'))return at;}return null;});
    assert.ok(spot,'a clear spot on the photo');
    await page.mouse.click(spot.x,spot.y);await page.locator('.tw-compose').waitFor();
    assert.ok(await page.locator('[data-compose-submit]').isDisabled(),'a note needs text');
    await page.locator('.tw-compose textarea').fill(`<img src=x onerror="window.__xss=1">${current.name}真好`);
    await page.locator('[data-compose-submit]').click();await page.locator('.tw-bubble.mine').waitFor({state:'attached'});
    const mine=await page.locator('.tw-bubble.mine .tw-bubble-more p').textContent();
    assert.ok(mine.includes(current.name),'a challenged city is no secret in the community');
    assert.equal(await page.locator('.tw-bubble-text img,.tw-bubble-more img').count(),0);assert.equal(await page.evaluate(()=>window.__xss),undefined,'note text is escaped');
    assert.equal(await page.evaluate(scene=>TWStore.get().bubbles[scene]?.length,current.scene),1,'note saved');
    assert.ok(await page.evaluate(scene=>!!TWStore.get().explored[scene],current.scene),'explored scene remembered');
    await page.evaluate(()=>TWStore.reset());

    // Friend link through the real UI: the friend becomes the PK opponent, the 60-second quiz times out,
    // unanswered questions score 0, and the VS card carries the link's score (no second comparison card).
    const friend=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
    const fp=await friend.newPage();fp.setDefaultTimeout(20000);const friendErrors=[];fp.on('pageerror',error=>friendErrors.push(error.message));
    await fp.clock.install({time:new Date('2026-10-15T12:00:00+08:00')});
    const token=Buffer.from(JSON.stringify({cityId:'datong',score:70,day:'2026-10-15'})).toString('base64url');
    await fp.goto(base+'?challenge='+token);await fp.locator('.cover-page').waitFor();await idle(fp);await closeRules(fp);
    assert.match(await fp.locator('.cover-enter').textContent(),/接受好友挑战/);
    assert.equal(await fp.locator('[data-action="pk-start"]').count(),0,'no separate PK entry on a friend challenge');
    await fp.locator('[data-action="start"]').click();
    assert.match(await fp.locator('.pk-match').textContent(),/好友挑战/);
    await fp.locator('.explore-page').waitFor();await idle(fp);
    assert.equal(await fp.locator('#timer').textContent(),'02:00','one 2-minute clock from the first scene');
    await fp.locator('[data-action="go-quiz"]').click();await fp.locator('.quiz-page').waitFor();await idle(fp);
    assert.equal(await fp.locator('.quiz-header .pk-hud').count(),1,'PK progress replaces the title');
    const firstAnswer=await fp.evaluate(()=>TRIPWONDER_CATALOG.cities.find(c=>c.id==='datong').questions[0].answer);
    await fp.locator(`[data-option="${firstAnswer}"]`).click();
    assert.match(await fp.locator('.quiz-reveal').textContent(),/答对了 +20/,'the answer is revealed at once');assert.equal(await fp.locator('.option.correct').count(),1);
    await fp.locator('[data-action="submit"]').click();await idle(fp);
    await fp.clock.fastForward(Math.max(0,await fp.evaluate(()=>{const [m,s]=document.querySelector('#timer').textContent.split(':').map(Number);return (m*60+s-8)*1000;})));await fp.waitForFunction(()=>document.querySelector('.quiz-timer')?.classList.contains('final'));
    assert.equal(await fp.locator('.quiz-timer.urgent').count(),1,'red from 15 s');
    await fp.clock.fastForward(9000);await fp.locator('.guess-map').waitFor();
    assert.match(await fp.locator('#toast').textContent(),/挑战时间到/);
    await idle(fp);await fp.locator('.guess-map').click({position:{x:200,y:330}});await fp.locator('[data-action="guess-submit"]').click();
    await fp.locator('.gm-pin.rival').waitFor({state:'attached'});
    assert.match(await fp.locator('.gm-pin.rival .gm-tag').textContent(),/好友/);
    await fp.locator('.guess-card [data-action="show-result"]').click();await fp.locator('.result-hero').waitFor();await idle(fp);
    assert.match(await fp.locator('.pk-result .pk-player').nth(1).textContent(),/70/,'VS card shows the friend’s score');
    assert.equal(await fp.locator('.friend-compare').count(),0,'no duplicate friend comparison');
    assert.deepEqual(await fp.locator('.answer-line b').allTextContents(),['+20 分','0 分','0 分'],'unanswered questions score 0');
    assert.deepEqual(friendErrors,[]);

    // Blocked storage: the page and the coin rules still work in memory.
    const locked=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
    await locked.addInitScript(()=>{for(const name of ['getItem','setItem','removeItem'])Storage.prototype[name]=()=>{throw new DOMException('blocked','SecurityError');};});
    const lockedPage=await locked.newPage();const lockedErrors=[];lockedPage.on('pageerror',error=>lockedErrors.push(error.message));
    await lockedPage.goto(base);await lockedPage.locator('.trip-home').waitFor();
    assert.equal((await lockedPage.evaluate(()=>Wallet.award({cityId:'datong',day:'2026-10-15',score:50}))).total,5);
    assert.deepEqual(lockedErrors,[]);
    await page.evaluate(()=>TWStore.reset());
    assert.deepEqual(errors,[]);
    console.log('PASS: coin rules and same-day replay guard across reloads; daily bonus once; redeem and overspend guard; reproducible PK and exact friend scores; anonymous sample notes; rewards page hides unsolved cities; community scene notes: top-three strips, grouped envelope bubbles counted once, tap to post, escaped and persisted; explored scenes recorded; no notes in the challenge; friend link plays as PK through the shared 2-minute timeout (red at 15 s, beat in the last 10 s, unanswered score 0); blocked storage still works.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
