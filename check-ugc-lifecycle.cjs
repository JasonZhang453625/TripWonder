const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_URL||'http://127.0.0.1:18947/';
const output=process.env.TRIPWONDER_AUDIT_DIR||'C:/Users/Administrator/Documents/Codex/ugc-fix-20261017';
const executablePath=process.env.TRIPWONDER_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const idle=p=>p.waitForFunction(()=>!window.ChallengeMotion?.busy&&!document.querySelector('#app.scene-loading'));
async function feed(p){await p.evaluate(()=>HomePromo.dismiss());await p.locator('#app .th-wonder').click();await p.locator('#app .cm-entry-community').click();await p.locator('#app .cm-feed').waitFor();await idle(p);}
async function fill(p){
  const values={name:'测试海湾',title:'沿水慢行的周末',region:'福建',lat:'24.4447',lng:'118.0898',intro:'走进港口街区，寻找画面中的细节。',author:'旅程测试员'};
  for(let i=0;i<3;i++){values[`q${i}`]=`第${i+1}张照片的主要景观是什么？`;for(let j=0;j<4;j++)values[`o${i}-${j}`]=['港口街道','高山雪地','森林营地','沙漠公路'][j];values[`explain${i}`]='照片里的船只与建筑提供了观察依据。';}
  for(const [name,value]of Object.entries(values))await p.locator(`.cm-form [name="${name}"]`).fill(value);
  for(let i=0;i<3;i++)await p.locator(`.cm-form [name="a${i}"][value="${i%2}"]`).check();
  await p.locator('.cm-form [name="board"]').uncheck();
}
async function submit(p){await p.locator('.cm-submit').click();await p.locator('[role="dialog"]').waitFor();assert.ok((await p.locator('[role="dialog"]').innerText()).includes('已提交审核'));await p.locator('[role="dialog"] [data-go="myjourneys"]').click();await p.locator('[data-view="myjourneys"]').waitFor();await idle(p);}
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath,headless:true});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true}),p=await context.newPage();
 const failures=[];p.on('pageerror',e=>failures.push(e.message));
 await p.goto(base);await p.locator('#app .trip-home').waitFor();await feed(p);
 await p.locator('#app .cm-publish-fab').click();await p.locator('.cm-form').waitFor();
 const files=['shapowei-harbor-2015','shapowei-harbor-now','shapowei-harbor-wide'].map(d=>path.join(__dirname,'photo-library/ugc',d,'original.jpg'));
 await p.locator('.cm-form [name="photos"]').setInputFiles(files);await fill(p);
 await p.waitForFunction(()=>UGCService.records.some(r=>r.photos.length===3&&r.fields.title==='沿水慢行的周末'));
 const id=await p.evaluate(()=>UGCService.records.find(r=>r.fields.title==='沿水慢行的周末').id);
 await p.reload();await feed(p);await p.locator('#app .cm-publish-fab').click();await p.locator('.cm-form').waitFor();
 assert.equal(await p.locator('[name="title"]').inputValue(),'沿水慢行的周末');
 assert.equal(await p.locator('[name="photos"]').evaluate(e=>e.files.length),3);
 assert.equal(await p.locator('[name="board"]').isChecked(),false);
 await submit(p);
 assert.equal(await p.evaluate(id=>UGCService.records.find(r=>r.id===id).state,id),'pending');
 assert.equal(await p.evaluate(id=>TRIPWONDER_CATALOG.ugc.some(j=>j.id===id),id),false);
 const backend=await p.evaluate(()=>UGCService.backend);
 if(backend){
   await p.waitForFunction(async id=>(await fetch('/api/journeys').then(r=>r.json())).journeys.some(j=>j.id===id),id,{timeout:20000});
   const r=await p.request.post(base+'api/journeys/'+id+'/review',{data:{review:'rejected',note:'请补充观察依据'}});assert.equal(r.status(),200);
   await p.waitForFunction(id=>UGCService.records.find(r=>r.id===id).state==='rejected',id);
 }else{
   await p.locator('#app [data-ugc-review]').click();await p.locator(`[data-ugc-inspect="${id}"]`).click();await p.locator('.cm-review-dialog').waitFor();assert.equal(await p.locator('.cm-review-dialog img').count(),3);await p.locator('[data-review-close]').click();
   p.once('dialog',dialog=>dialog.accept('请补充观察依据'));await p.locator(`[data-ugc-reject="${id}"]`).click();await p.waitForFunction(id=>UGCService.records.find(r=>r.id===id).state==='rejected',id);
   await p.locator('#app [data-ugc-review]').click();await p.locator('[data-view="myjourneys"]').waitFor();
 }
 await p.locator(`[data-ugc-edit="${id}"]`).click();await p.locator('.cm-form').waitFor();assert.ok((await p.locator('[name="q0"]').inputValue()).includes('主要景观'));await p.locator('[name="explain0"]').fill('修改后的观察依据：画面里可见船只与临水建筑。');await submit(p);
 if(backend){
   await p.waitForFunction(async id=>{const d=await fetch('/api/journeys').then(r=>r.json());return d.journeys.some(j=>j.id===id)&&!d.jobs.some(j=>j.destinationId===id&&j.status==='running');},id,{timeout:20000});
   const r=await p.request.post(base+'api/journeys/'+id+'/review',{data:{review:'approved'}});assert.equal(r.status(),200);
   await p.waitForFunction(id=>UGCService.records.find(r=>r.id===id).state==='approved',id);
 }else{await p.locator('#app [data-ugc-review]').click();await p.locator(`[data-ugc-approve="${id}"]`).click();await p.waitForFunction(id=>UGCService.records.find(r=>r.id===id).state==='approved',id);}
 await p.locator('#app .page-head [data-go="feed"]').click();await p.locator('.cm-feed').waitFor();await idle(p);
 await p.locator(`[data-journey="${id}"] .cm-post-copy`).click();await p.locator('#app .explore-page').waitFor();await idle(p);
 assert.equal(await p.locator('#app .tw-bubble-bar').count(),0);
 await p.locator('#app [data-action="next-scene"]').click();await p.waitForFunction(()=>document.querySelector('#app .scene-counter')?.textContent.trim()==='2 / 3'&&!document.querySelector('#app.scene-loading'));
 await p.waitForTimeout(1100);const remaining=await p.locator('#app #timer').textContent();await p.reload();await p.locator('#app .explore-page').waitFor();await idle(p);
 assert.equal((await p.locator('#app .scene-counter').textContent()).trim(),'2 / 3');assert.ok(await p.locator('#app #timer').textContent()<=remaining);
 await p.locator('#app [data-action="next-scene"]').click();await p.waitForFunction(()=>document.querySelector('#app .scene-counter')?.textContent.trim()==='3 / 3'&&!document.querySelector('#app.scene-loading'));
 await p.locator('#app [data-action="next-scene"]').click();await p.locator('.quiz-page').waitFor();await idle(p);
 await p.locator('[data-option="0"]').click();await p.reload();await p.locator('.quiz-page').waitFor();await idle(p);assert.equal(await p.locator('[data-option="0"]').getAttribute('aria-pressed'),'true');
 for(let i=0;i<3;i++){await p.locator(`[data-option="${i%2}"]`).click();await p.locator('[data-action="submit"]').click();await idle(p);}
 await p.locator('#guess-map').waitFor();const map=p.locator('#guess-map'),box=await map.boundingBox();await map.click({position:{x:box.width*.55,y:box.height*.42}});await p.reload();await p.locator('#guess-map').waitFor();assert.equal(await p.locator('[data-action="guess-submit"]').isEnabled(),true);
 await p.locator('[data-action="guess-submit"]').click();await p.locator('[data-action="show-result"]').click();await p.locator('.result-ugc').waitFor();await idle(p);assert.equal(await p.locator('.badge-benefit,.coupon-benefit').count(),0);
 assert.equal(await p.evaluate(()=>TWStore.get().wallet.balance),0);assert.deepEqual(await p.evaluate(()=>TWStore.get().challenged),{});
 await p.locator('.result-topbar [data-action="share"]').click();const link=await p.locator('#invite-link').inputValue();
 let exported;
 if(!backend){const download=p.waitForEvent('download');await p.locator('[data-ugc-export]').click();const file=await download;exported=path.join(output,'shared-journey.tripwonder.json');await file.saveAs(exported);}
 await p.locator('[role="dialog"] [data-action="close"]').click();await p.locator('.result-topbar [data-action="result-exit"]').click();await p.locator('.cm-comment-dock').waitFor();
 assert.equal(await p.locator('.cm-board.is-locked,.cm-scene-write').count(),0);await p.locator('[data-comment-compose]').click();await p.locator('.cm-comment-form textarea').fill('完整挑战后的独立评论');await p.locator('.cm-comment-send').click();assert.ok((await p.locator('.cm-comments').innerText()).includes('完整挑战后的独立评论'));
 await p.reload();await feed(p);await p.locator(`[data-journey="${id}"] [data-feed-discuss]`).last().click();await p.locator('.cm-comment-dock').waitFor();assert.ok((await p.locator('.cm-comments').innerText()).includes('完整挑战后的独立评论'));
 const friendContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),friend=await friendContext.newPage();
 if(exported){await friend.goto(base);await feed(friend);const chooser=friend.waitForEvent('filechooser');await friend.locator('[data-ugc-import]').click();await (await chooser).setFiles(exported);await friend.locator(`[data-journey="${id}"]`).waitFor();}
 await friend.goto(link);await friend.locator('#app .explore-page').waitFor();await idle(friend);assert.equal((await friend.locator('#app .scene-counter').textContent()).trim(),'1 / 3');
 assert.deepEqual(failures,[]);
 console.log(JSON.stringify({pass:true,backend,id,draftReload:true,rejectResubmit:true,originalQuestions:true,exploreReload:true,quizReload:true,mapReload:true,commentReload:true,share:true,exportImport:!!exported}));
 await context.close();await friendContext.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
