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

    // Coins: base + badge + speed + PK win; same-day replays only pay above the stored best, even after a reload.
    const day='2026-10-15';
    const first=await page.evaluate(day=>Wallet.award({cityId:'datong',day,score:85,quizRemaining:40000,pk:{outcome:'win'}}),day);
    assert.equal(first.total,9+5+2+10,'85 points, badge, 40 s left and a PK win');
    await page.reload();
    assert.equal(await page.evaluate(()=>TWStore.get().wallet.balance),26,'balance survives a reload');
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'datong',day,score:85,quizRemaining:40000,pk:{outcome:'win'}}),day)).total,0,'a repeat after reload pays nothing');
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'datong',day,score:95,quizRemaining:50000}),day)).total,1+1,'a new best pays the difference and the faster finish');
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'beijing',day,score:40}),day)).total,4);
    const third=await page.evaluate(day=>Wallet.award({cityId:'suzhou',day,score:40}),day);
    assert.equal(third.total,4+10,'third destination of the day adds the daily bonus');
    await page.reload();
    assert.equal((await page.evaluate(day=>Wallet.award({cityId:'guilin',day,score:40}),day)).total,4,'daily bonus is paid once');
    const before=await page.evaluate(()=>Wallet.balance());
    const bought=await page.evaluate(()=>Wallet.redeem('c-food'));
    assert.ok(bought.ok&&/^TW[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(bought.code));
    assert.equal(await page.evaluate(()=>Wallet.balance()),before-15);
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
    await page.evaluate(()=>TWStore.reset());await page.reload();
    await page.evaluate(()=>document.querySelector('[data-go="profile"]').click());await page.locator('.profile-page').waitFor();await idle(page);
    await page.locator('.pf-wallet-main').click();await page.locator('.tw-mall-page').waitFor();await idle(page);
    const mallText=await page.locator('.tw-mall-page').textContent(),cityNames=await page.evaluate(()=>TRIPWONDER_CATALOG.cities.map(c=>c.name));
    for(const name of cityNames)assert.ok(!mallText.includes(name),`rewards page does not name ${name} before it is solved`);

    // Scene notes on the explore page: visible, filterable, posted notes are escaped and masked, and they persist.
    await page.goto(base);await page.locator('.entry').first().click();await page.locator('.cover-page').waitFor();await idle(page);await closeRules(page);
    await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    await page.locator('.tw-bubble').first().waitFor({state:'attached'});
    assert.ok(await page.locator('.tw-bubble.on').count()>0,'some notes float on arrival');
    const current=await page.evaluate(()=>{const scenes=TRIPWONDER_CATALOG.cities.flatMap(c=>c.scenes.map(sc=>({c,sc})));const id=[...document.querySelectorAll('.tw-bubble')].map(b=>b.dataset.id).find(id=>id.startsWith('seed-'));const hit=scenes.find(x=>id?.startsWith(`seed-${x.sc.id}-`));return {name:hit.c.name,scene:hit.sc.id};});
    await page.locator('[data-bubble-filter]').click();
    assert.ok(await page.evaluate(()=>[...document.querySelectorAll('.tw-bubble')].every(b=>b.classList.contains('kind-been'))),'filter shows "been" notes');
    await page.locator('[data-bubble-filter]').click();await page.locator('[data-bubble-filter]').click();
    assert.equal(await page.locator('.tw-bubble').count(),0,'notes can be switched off');
    await page.locator('[data-bubble-new]').click();await page.locator('[data-place-ok]').click();await page.locator('.tw-compose').waitFor();
    assert.ok(await page.locator('[data-compose-submit]').isDisabled(),'a note needs a choice and text');
    await page.locator('[data-compose-kind="been"]').click();
    await page.locator('.tw-compose textarea').fill(`<img src=x onerror="window.__xss=1">${current.name}真好`);
    await page.locator('[data-compose-submit]').click();await page.locator('.tw-bubble.mine').waitFor({state:'attached'});
    const mine=await page.locator('.tw-bubble.mine .tw-bubble-more p').textContent();
    assert.ok(!mine.includes(current.name)&&mine.includes('这里'),'the destination name is hidden before the guess');
    assert.equal(await page.locator('.tw-bubble img').count(),0);assert.equal(await page.evaluate(()=>window.__xss),undefined,'note text is escaped');
    assert.equal(await page.evaluate(scene=>TWStore.get().bubbles[scene]?.length,current.scene),1,'note saved');
    assert.ok(await page.evaluate(scene=>!!TWStore.get().explored[scene],current.scene),'explored scene remembered');

    // Blocked storage: the page and the coin rules still work in memory.
    const locked=await browser.newContext({...devices['iPhone 13'],deviceScaleFactor:1});
    await locked.addInitScript(()=>{for(const name of ['getItem','setItem','removeItem'])Storage.prototype[name]=()=>{throw new DOMException('blocked','SecurityError');};});
    const lockedPage=await locked.newPage();const lockedErrors=[];lockedPage.on('pageerror',error=>lockedErrors.push(error.message));
    await lockedPage.goto(base);await lockedPage.locator('.trip-home').waitFor();
    assert.equal((await lockedPage.evaluate(()=>Wallet.award({cityId:'datong',day:'2026-10-15',score:50}))).total,5);
    assert.deepEqual(lockedErrors,[]);
    await page.evaluate(()=>TWStore.reset());
    assert.deepEqual(errors,[]);
    console.log('PASS: coin rules and same-day replay guard across reloads; daily bonus once; redeem and overspend guard; reproducible PK and exact friend scores; anonymous sample notes; rewards page hides unsolved cities; scene notes filter, post, escape, mask and persist; explored scenes recorded; blocked storage still works.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
