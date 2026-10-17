const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.TRIPWONDER_BASE||'http://127.0.0.1:8798/';
const idle=page=>page.waitForFunction(()=>!window.ChallengeMotion?.busy&&!document.querySelector('.scene-transition'));
async function uploads(page){
  await page.goto(base);await page.locator('.th-wonder').click();await page.locator('.cm-hub').waitFor();await idle(page);
  await page.locator('.cm-entry-community').click();await page.locator('.cm-feed').waitFor();await idle(page);
  await page.locator('[data-feed-tab="mine"]').click();await page.locator('[data-feed-mine-tab="uploads"]').click();
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await uploads(page);
    const list=page.locator('.cm-upload-list');
    assert.equal(await list.locator('.cm-upload-card').count(),1);
    assert.match(await list.innerText(),/把周末交给海风/);
    assert.doesNotMatch(await list.innerText(),/本机原型|投稿和审核|发布 Journey|导入旅程|本机审核工作台|还没有上传/);
    assert.equal(await list.locator('.cm-upload-cover').evaluate(image=>image.complete&&image.naturalWidth>0),true);
    const id=await list.locator('.cm-upload-card').getAttribute('data-upload-id');
    const initial=await page.evaluate(id=>{const row=UGCService.records.find(row=>row.id===id);return {publishedAt:row.publishedAt,photos:row.photos.length,questions:UGCService.validate(row.fields,row.photos).length};},id);
    assert.equal(initial.photos,3);assert.equal(initial.questions,3);
    await uploads(page);assert.equal(await list.locator('.cm-upload-card').count(),1);
    assert.equal(await page.evaluate(id=>UGCService.records.find(row=>row.id===id).publishedAt,id),initial.publishedAt,'reload keeps one original upload');
    for(const width of [320,390,480]){await page.setViewportSize({width,height:844});assert.equal(await page.locator('#app').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);}
    await page.setViewportSize({width:390,height:844});
    if(process.env.TRIPWONDER_TEST_ARTIFACTS)await page.screenshot({path:process.env.TRIPWONDER_TEST_ARTIFACTS});
    await list.locator('.cm-upload-open').click();await page.locator('.explore-page').waitFor();await idle(page);
    assert.equal(await page.locator('.explore-page').count(),1,'initialized upload opens a real journey');
    await page.locator('[data-action="leave"]').click();await page.locator('.cm-feed').waitFor();await idle(page);
    await page.evaluate(()=>dispatchEvent(new CustomEvent('tw-ugc-navigate',{detail:{view:'myjourneys'}})));
    await page.locator(`[data-ugc-edit="${id}"]`).click();await page.locator('.cm-form').waitFor();
    assert.equal(await page.locator('.cm-form [name="title"]').inputValue(),'把周末交给海风');
    assert.equal(await page.locator('.cm-form [name="photos"]').evaluate(input=>input.files.length),3,'initialized photos remain editable');
    assert.deepEqual(errors,[]);
    console.log('PASS: one persistent initialized upload, three photos and questions, clean personal list, working journey, 320/390/480px layouts');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
