const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base=process.env.TRIPWONDER_TEST_URL||'http://127.0.0.1:8765/';
const artifacts=process.env.TRIPWONDER_TEST_ARTIFACTS;
const epoch=Date.parse('2026-09-26T12:00:00+08:00');
const reports=[];
const errors=[];

async function shot(page,name){if(artifacts){fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,name+'.png')});}}
async function idle(page){await page.waitForFunction(()=>!!window.ChallengeMotion&&!window.ChallengeMotion.busy);}
async function timerIs(page,value){await page.waitForFunction(value=>document.querySelector('#timer')?.textContent===value,value);}
async function advance(page,seconds){const now=await page.evaluate(()=>Date.now());await page.clock.setFixedTime(new Date(now+seconds*1000));}
async function closeRules(page){if(await page.locator('.rules-popover').count()){await page.locator('[aria-label="关闭玩法"]').click();await page.locator('.rules-popover').waitFor({state:'detached'});}}
async function questionIs(page,index){await page.waitForFunction(index=>Number(document.querySelector('.quiz-number')?.textContent?.match(/\d+/)?.[0])===index,index);await idle(page);}
async function openQuiz(page,cityId='suzhou',checkEntrance=false){
  const token=Buffer.from(JSON.stringify({cityId,score:0,day:'2026-09-26'})).toString('base64url');
  await page.clock.setFixedTime(new Date(epoch));
  await page.goto(base+'?challenge='+token,{waitUntil:'domcontentloaded'});
  await page.locator('.cover-page').waitFor();await closeRules(page);
  await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();
  let count=0;
  while(await page.locator('.explore-page').count()){
    assert.ok(++count<5,'exploration must reach quiz within the catalog scene count');
    const current=await page.locator('.scene-counter').textContent();
    const [index,total]=current.split('/').map(Number);
    if(index===total&&checkEntrance){
      const before=await page.locator('[data-action="next-scene"]').evaluate(button=>{button.click();return {busy:window.ChallengeMotion?.busy,oldScene:!!document.querySelector('.explore-page')};});
      assert.equal(before.busy,true,'start quiz acquires the transition lock');
      if(!await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches))assert.equal(before.oldScene,true,'scene stays mounted during its exit animation');
    }else await page.locator('[data-action="next-scene"]').click();
    await page.waitForFunction(previous=>!document.querySelector('.scene-counter')||document.querySelector('.scene-counter').textContent!==previous,current);
  }
  await questionIs(page,1);await timerIs(page,'02:00');
  assert.equal(await page.locator('.quiz-page .eyebrow,.quiz-page .quiz-foot').count(),0,'old category label and instruction are removed');
  assert.equal(await page.getByText('三题共限时 2 分钟，答完后在地图上标出目的地。',{exact:true}).count(),0);
  assert.equal(await page.locator('.quiz-progress > span').count(),3,'three distinct question progress segments');
  assert.equal(await page.locator('.option-letter,.option-text,.option-check').count(),12,'all four answers use the new option structure');
  return page.evaluate(id=>window.TRIPWONDER_CATALOG.cities.find(c=>c.id===id).questions.slice(0,3).map(q=>q.answer),cityId);
}
async function select(page,index){await page.locator(`[data-option="${index}"]`).click();assert.equal(await page.locator(`[data-option="${index}"]`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.option[aria-pressed="true"]').count(),1);}
async function submit(page,next){await page.locator('[data-action="submit"]').click();if(next)await questionIs(page,next);else{await page.locator('.guess-map').waitFor();await idle(page);}}

async function assertGlassAndInk(page,state){
  const styles=await page.locator('.quiz-page').evaluate(root=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),texts=[];let node;
    while(node=walker.nextNode()){
      const text=node.textContent.trim(),el=node.parentElement;if(!text||!el.getClientRects().length)continue;
      const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden')continue;
      texts.push({text,color:style.color});
    }
    const glass=[...root.querySelectorAll('[data-action="quiz-back"],.quiz-timer,.option,[data-action="submit"]')].map(el=>{const s=getComputedStyle(el);return {control:el.dataset.action||el.className,backdrop:s.backdropFilter||s.webkitBackdropFilter,border:s.borderTopStyle,shadow:s.boxShadow};});
    return {texts,glass};
  });
  assert.ok(styles.texts.length>=12,`${state}: visible text colors are inspected`);
  for(const {text,color} of styles.texts){const channels=color.match(/[\d.]+/g)?.slice(0,3).map(Number);assert.ok(channels?.length===3&&Math.max(...channels)<=80,`${state}: "${text}" uses near-black text, got ${color}`);}
  assert.equal(styles.glass.length,7,`${state}: back, timer, four answers and submit are inspected`);
  for(const item of styles.glass){assert.match(item.backdrop,/blur\(/,`${state}: ${item.control} has a glass blur`);assert.notEqual(item.border,'none',`${state}: ${item.control} has a glass edge`);assert.notEqual(item.shadow,'none',`${state}: ${item.control} has a glass highlight`);}
}

async function returnToSceneAndResume(page,{cityId,question,selected,viaCover=false}){
  await idle(page);
  const before={timer:await page.locator('#timer').textContent(),question:await page.locator('.quiz-question').textContent(),done:await page.locator('.quiz-progress > .done').count()};
  const sceneCount=await page.evaluate(id=>window.TRIPWONDER_CATALOG.cities.find(city=>city.id===id).scenes.length,cityId);
  await page.locator('[data-action="quiz-back"]').click();
  await page.locator('.explore-page').waitFor();await idle(page);
  assert.equal((await page.locator('.scene-counter').textContent()).replace(/\s/g,''),`${sceneCount}/${sceneCount}`,`${cityId} Q${question}: back restores the final scene`);
  assert.equal(await page.locator('#timer,[role="dialog"]').count(),0,'scene return pauses the quiz with no interception dialog');
  await advance(page,300);await page.waitForTimeout(300);
  assert.equal(await page.locator('.explore-page').count(),1,'five minutes of revisiting scenery never expire the quiz');
  if(viaCover){
    await page.locator('[data-action="leave"]').click();await page.locator('.cover-page').waitFor();
    assert.equal(await page.locator('[role="dialog"]').count(),0,'scene-to-cover remains direct');
    await advance(page,300);await page.waitForTimeout(300);assert.equal(await page.locator('.cover-page').count(),1);
    await page.locator('[data-action="start"]').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.equal((await page.locator('.scene-counter').textContent()).replace(/\s/g,''),`${sceneCount}/${sceneCount}`,'cover reentry preserves the last scene');
  }
  await page.locator('[data-action="next-scene"]').click();await questionIs(page,question);
  await timerIs(page,before.timer);
  assert.equal(await page.locator('.quiz-question').textContent(),before.question,'resume preserves the current question text');
  assert.equal(await page.locator('.quiz-progress > .done').count(),before.done,'resume preserves completed question progress');
  assert.equal(await page.locator('.option[aria-pressed="true"]').count(),selected===null?0:1,'resume preserves whether an answer was selected');
  if(selected!==null)assert.equal(await page.locator(`[data-option="${selected}"]`).getAttribute('aria-pressed'),'true','resume restores the selected answer');
}

async function assertReachable(page,selector,label){
  const item=page.locator(selector);await item.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);
  const box=await item.evaluate(el=>{
    const r=el.getBoundingClientRect(),app=document.querySelector('#app').getBoundingClientRect(),phone=document.querySelector('#phone').getBoundingClientRect();
    const left=Math.max(0,app.left,phone.left),right=Math.min(innerWidth,app.right,phone.right),top=Math.max(0,app.top,phone.top),bottom=Math.min(innerHeight,app.bottom,phone.bottom);
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,clip:{left,right,top,bottom},display:getComputedStyle(el).display};
  });
  assert.ok(box.width>0&&box.height>0&&box.display!=='none',`${label}: control renders`);
  assert.ok(box.left>=box.clip.left-2&&box.right<=box.clip.right+2,`${label}: control fits horizontally ${JSON.stringify(box)}`);
  assert.ok(box.top>=box.clip.top-2&&box.bottom<=box.clip.bottom+2,`${label}: control is reachable after scrolling ${JSON.stringify(box)}`);
}
async function assertLayout(page,name){
  const widths=await page.evaluate(()=>({document:[document.documentElement.scrollWidth,innerWidth],app:[document.querySelector('#app').scrollWidth,document.querySelector('#app').clientWidth]}));
  for(const [where,[scroll,width]] of Object.entries(widths))assert.ok(scroll<=width+2,`${name}: ${where} has no horizontal overflow (${scroll}/${width})`);
  for(let i=0;i<4;i++)await assertReachable(page,`[data-option="${i}"]`,`${name} answer ${i+1}`);
  await assertReachable(page,'[data-action="submit"]',`${name} submit`);
  await page.locator('.quiz-top').scrollIntoViewIfNeeded();await shot(page,`${name}-quiz`);
}
async function pickMap(page,xFraction=.42,yFraction=.42){
  const box=await page.locator('.guess-map').boundingBox();assert.ok(box);
  await page.locator('.guess-map').click({position:{x:box.width*xFraction,y:box.height*yFraction}});
  await page.waitForFunction(()=>!document.querySelector('[data-action="guess-submit"]')?.disabled);
  await page.locator('.gm-pin.guess:not([hidden])').waitFor({state:'attached'});
}
async function finishMap(page,{stress=false,name='flow'}={}){
  await pickMap(page);
  const first=await page.locator('.guess-status').textContent();
  await pickMap(page,.56,.47);
  assert.notEqual(await page.locator('.guess-status').textContent(),first,'a second map tap adjusts the location');
  const recall=page.locator('[data-recall="0"]');
  await recall.click();await page.locator('.sheet .recall-photo').waitFor();
  await page.locator('.sheet [data-action="close"]').click();await page.locator('.sheet').waitFor({state:'detached'});
  await recall.click();await page.locator('.sheet .recall-photo').waitFor();
  await page.keyboard.press('Escape');await page.locator('.sheet').waitFor({state:'detached'});
  await page.locator('[data-action="zoom-in"]').click();await page.locator('[data-action="zoom-out"]').click();
  await page.locator('[data-action="guess-submit"]').click();
  if(stress){
    const b=await page.locator('.guess-map').boundingBox();
    await page.mouse.move(b.x+b.width*.45,b.y+b.height*.38);
    await page.mouse.wheel(0,-300);await page.mouse.down();
    await page.mouse.move(b.x+b.width*.62,b.y+b.height*.42,{steps:3});await page.mouse.up();
  }
  await page.locator('.gm-pin.answer:not([hidden])').waitFor({state:'attached'});
  await page.waitForFunction(()=>[...document.querySelectorAll('.guess-card [data-count]')].length===2&&[...document.querySelectorAll('.guess-card [data-count]')].every(el=>Number(el.textContent)===Number(el.dataset.count)));
  assert.equal(await page.locator('[data-action="guess-back"]').isDisabled(),true,'confirmed location cannot return to quiz');
  await shot(page,`${name}-map-reveal`);
  const mapPoints=Number(await page.locator('.guess-points [data-count]').getAttribute('data-count'));
  const transition=await page.locator('.guess-card [data-action="show-result"]').evaluate(button=>{button.click();return !!window.ChallengeMotion.busy;});
  assert.equal(transition,true,'result route uses transition lock');
  await page.locator('.result-hero').waitFor();await idle(page);
  assert.equal(await page.locator('[data-review]').count(),3,'the result contains exactly three answers');
  await page.waitForTimeout(800);await shot(page,`${name}-result`);
  return mapPoints;
}
async function scoreIs(page,quizPoints,mapPoints){
  const split=(await page.locator('.result-score-breakdown').textContent()).replace(/\s+/g,' ');
  assert.match(split,new RegExp(`答题\\s*${quizPoints}\\s*\\/ 60`));
  const total=await page.locator('.result-score-number').textContent();
  assert.equal(Number(total.match(/\d+/)[0]),quizPoints+mapPoints,'combined score uses exactly the three recorded answers');
}
async function contextPage(browser,options,label){
  const context=await browser.newContext({deviceScaleFactor:1,...options});const page=await context.newPage();
  page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(`${label}: ${error.message}`));
  return {context,page};
}

async function checkBackFailure(browser){
  const {context,page}=await contextPage(browser,{...devices['iPhone 13'],deviceScaleFactor:1},'back-failure');
  try{
    const answers=await openQuiz(page,'suzhou');
    await select(page,answers[0]);await submit(page,2);await select(page,answers[1]);
    await advance(page,43);await timerIs(page,'01:17');
    const before=await page.locator('.quiz-page').elementHandle();
    const source=await page.evaluate(()=>new URL(window.IMMERSIVE_SCENES['suzhou-huqiu'].sourceUrl,location.href).href);
    let aborted=0;
    const reject=async route=>{aborted++;await route.abort('failed');};
    // Register after entering the quiz: its scene loader is cleared, and routing disables HTTP cache.
    await context.route(source,reject);
    await page.locator('[data-action="quiz-back"]').click();await idle(page);
    assert.ok(aborted>0,'the returned scene photo request was actually aborted');
    await questionIs(page,2);await timerIs(page,'01:17');
    assert.equal(await before.evaluate(node=>node===document.querySelector('.quiz-page')),true,'failed scene return keeps the original quiz page');
    assert.equal(await page.locator(`[data-option="${answers[1]}"]`).getAttribute('aria-pressed'),'true','failed scene return keeps the selected second answer');
    assert.equal(await page.locator('.scene-staging,.scene-transition,.scene-loading,[role="dialog"]').count(),0,'failed scene return leaves no staging, loading overlay or dialog');
    await advance(page,7);await timerIs(page,'01:10');
    await shot(page,'quiz-back-failed-recovered');
    const changed=(answers[1]+1)%4;await select(page,changed);await submit(page,3);await timerIs(page,'01:10');
    assert.equal(await page.locator('.quiz-progress > .done').count(),2,'after load failure, the changed answer can still be submitted once');
    await context.unroute(source,reject);
    await returnToSceneAndResume(page,{cityId:'suzhou',question:3,selected:null});
    await timerIs(page,'01:10');await shot(page,'quiz-back-retry-resumed');
    reports.push('Failed scene return: real photo request aborted on Q2; current page and selection preserved; overlays cleaned; timer resumes from 01:17 to 01:10; answer change and submit work; retry succeeds and 300 seconds exploring preserve Q3 progress and 01:10.');
  }finally{await context.close();}
}

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.TRIPWONDER_TEST_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    await checkBackFailure(browser);
    if(process.argv.includes('--back-failure-only')){
      assert.deepEqual(errors,[],'no browser page errors during failed return recovery');
      if(artifacts)fs.writeFileSync(path.join(artifacts,'quiz-back-failure-report.json'),JSON.stringify({base,passed:true,reports,errors},null,2));
      console.log('PASS: quiz back failure recovery\n'+reports.map(item=>'- '+item).join('\n'));return;
    }
    const {context,page}=await contextPage(browser,{...devices['iPhone 13'],viewport:{width:390,height:844},deviceScaleFactor:1},'main');
    const answers=await openQuiz(page,'suzhou',true);await assertLayout(page,'phone-390x844');await assertGlassAndInk(page,'normal and disabled');
    await advance(page,43);await timerIs(page,'01:17');
    const original=await page.locator('.quiz-page').elementHandle(),timerNode=await page.locator('#timer').elementHandle(),optionNode=await page.locator('[data-option="0"]').elementHandle();
    await select(page,0);await select(page,answers[0]);await page.waitForTimeout(350);await assertGlassAndInk(page,'selected and enabled');
    assert.equal(await original.evaluate(node=>node===document.querySelector('.quiz-page')),true,'selection preserves quiz page DOM');
    assert.equal(await timerNode.evaluate(node=>node===document.querySelector('#timer')),true,'selection preserves timer DOM');
    assert.equal(await optionNode.evaluate(node=>node===document.querySelector('[data-option="0"]')),true,'selection preserves answer DOM');
    await timerIs(page,'01:17');
    const double=await page.locator('[data-action="submit"]').evaluate(button=>{button.click();const busy=window.ChallengeMotion.busy;button.click();return busy;});
    assert.equal(double,true,'submit locks before the second rapid click');await questionIs(page,2);
    assert.equal(await page.locator('.option[aria-pressed="true"]').count(),0,'next question starts without an answer');
    assert.equal(await page.locator('[data-action="submit"]').isDisabled(),true,'double submit cannot skip the unanswered second question');
    await select(page,answers[1]);await submit(page,3);await select(page,answers[2]);await submit(page);
    assert.equal(await page.locator('#timer').count(),0,'map is untimed');await advance(page,300);
    await page.locator('[data-action="guess-back"]').click();await questionIs(page,3);await timerIs(page,'01:17');
    assert.equal(await page.locator(`[data-option="${answers[2]}"]`).getAttribute('aria-pressed'),'true','return restores the third answer');
    await submit(page);const points=await finishMap(page,{stress:true,name:'phone-390x844'});await scoreIs(page,60,points);
    reports.push('Normal flow: animated start and result; local option updates; shared timer; duplicate-submit guard; three questions; map return; map repick/recall/zoom; reveal survives wheel and drag; correct score.');
    await context.close();

    for(const cityId of ['suzhou','shenzhen']){
      const {context,page}=await contextPage(browser,{...devices['iPhone 13'],deviceScaleFactor:1},`scene-resume-${cityId}`);
      const answers=await openQuiz(page,cityId);
      await advance(page,13);await timerIs(page,'01:47');
      await returnToSceneAndResume(page,{cityId,question:1,selected:null});
      for(let q=0;q<3;q++){
        await select(page,answers[q]);await advance(page,7);await timerIs(page,`01:${String(40-q*7).padStart(2,'0')}`);
        await returnToSceneAndResume(page,{cityId,question:q+1,selected:answers[q],viaCover:q===1});
        await submit(page,q<2?q+2:0);
      }
      const points=await finishMap(page,{name:`scene-resume-${cityId}`});await scoreIs(page,60,points);
      reports.push(`${cityId}: Q1/Q2/Q3 return to final scenery; 300 seconds exploring and cover detour pause countdown; question, selected answer, submitted answers and remaining time survive; final quiz score 60/60.`);
      await context.close();
    }

    for(const sample of [
      {name:'desktop-1440x1000',options:{viewport:{width:1440,height:1000}}},
      {name:'small-320x568',options:{...devices['iPhone SE'],viewport:{width:320,height:568},deviceScaleFactor:1}},
      {name:'landscape-844x390',options:{...devices['iPhone 13'],viewport:{width:844,height:390},deviceScaleFactor:1}},
      {name:'reduced-motion',options:{...devices['iPhone 13'],viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'}}
    ]){
      const {context,page}=await contextPage(browser,sample.options,sample.name);
      const answers=await openQuiz(page);await assertLayout(page,sample.name);
      for(let q=0;q<3;q++){await select(page,answers[q]);await submit(page,q<2?q+2:0);}
      if(sample.name==='reduced-motion'){const points=await finishMap(page,{stress:true,name:sample.name});await scoreIs(page,60,points);}
      reports.push(`${sample.name}: quiz choices and submit are reachable; no horizontal overflow; three-question navigation${sample.name==='reduced-motion'?' and full reveal complete with reduced motion':''}.`);
      await context.close();
    }

    for(const stage of [1,3]){
      const {context,page}=await contextPage(browser,{...devices['iPhone 13'],deviceScaleFactor:1},`timeout-${stage}`);
      const answers=await openQuiz(page);
      for(let q=0;q<stage-1;q++){await select(page,answers[q]);await submit(page,q+2);}
      await select(page,answers[stage-1]);await advance(page,119.9);await timerIs(page,'00:01');
      const locked=await page.locator('[data-action="submit"]').evaluate(button=>{button.click();button.click();return window.ChallengeMotion.busy;});
      assert.equal(locked,true,'near-expiry submit begins a transition');
      await advance(page,.2);
      await page.locator('.guess-map').waitFor();await idle(page);
      await page.waitForTimeout(350);
      assert.equal(await page.locator('.guess-map').count(),1,'timeout and transition settle on a single map');
      assert.equal(await page.locator('#timer').count(),0,'timer is removed after expiry or quiz completion');
      const points=await finishMap(page,{name:`timeout-${stage}`});await scoreIs(page,stage*20,points);
      if(stage===1){await page.locator('[data-review="2"]').click();assert.match(await page.locator('.sheet').textContent(),/你的答案：未作答/);}
      reports.push(`Near-expiry question ${stage}: rapid submit and deadline crossing settle once; exactly three answer records; ${stage*20}/60 quiz score.`);
      await context.close();
    }
    assert.deepEqual(errors,[],'no browser page errors');
    if(artifacts)fs.writeFileSync(path.join(artifacts,'quiz-flow-report.json'),JSON.stringify({base,passed:true,reports,errors},null,2));
    console.log('PASS: quiz redesign and motion regression\n'+reports.map(item=>'- '+item).join('\n'));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
