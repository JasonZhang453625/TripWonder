const assert=require('node:assert/strict');
const {chromium,devices}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const token=Buffer.from(JSON.stringify({cityId:'beijing',score:0})).toString('base64url');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  try{
    const page=await browser.newPage({...devices['iPhone 13'],viewport:{width:390,height:844}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(/passive event listener|Unable to preventDefault/.test(message.text()))errors.push(message.text());});
    await page.goto((process.env.TRIPWONDER_URL||'http://127.0.0.1:8765/')+'?challenge='+token);
    await page.locator('.cover-page').waitFor();
    if(await page.locator('.rules-popover').count())await page.locator('[data-action="rules-start"]').click();
    await page.locator('[data-action="start"]').click();await page.locator('.scene-counter').waitFor();await page.locator('.scene-transition').waitFor({state:'detached'});
    const sheet=page.locator('.clue-dialog'),overlay=page.locator('.clue-dialog-overlay'),hotspot=page.locator('[data-clue="0"]');
    const open=async()=>{await hotspot.click();await sheet.waitFor();await page.waitForTimeout(390);};
    const closed=async()=>{await overlay.waitFor({state:'detached'});assert.equal(await page.locator('#app').evaluate(el=>el.inert),false);};
    const cdp=await page.context().newCDPSession(page);
    async function drag(x,y,delta,{cancel=false,steps=8,delay=18}={}){
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
      for(let n=1;n<=steps;n++){
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+delta*n/steps,id:1}]});
        await page.waitForTimeout(delay);
      }
      const draggedTop=(await sheet.boundingBox()).y;
      await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});return draggedTop;
    }
    await open();
    assert.equal(await sheet.locator('[data-action="close"]').count(),0);
    assert.equal(await page.locator('#app').evaluate(el=>el.inert),true);
    await page.locator('#clue-text').tap();assert.ok(await sheet.isVisible());
    await page.evaluate(()=>{window.spoken=0;speechSynthesis.speak=()=>window.spoken++;});
    await page.locator('[data-action="speak"]').tap();assert.equal(await page.evaluate(()=>window.spoken),1);
    const initial=(await sheet.boundingBox()).y;
    await overlay.tap({position:{x:350,y:150}});
    await page.waitForTimeout(75);
    assert.ok((await sheet.boundingBox()).y>initial+20,'outside tap animates the sheet downward before removal');
    await closed();assert.equal(await page.evaluate(()=>document.activeElement?.dataset.clue),'0');
    console.log('PASS no close icon, text/reading taps, outside dismissal animation, focus restoration');

    await open();let box=await sheet.boundingBox();
    const dragged=await drag(170,box.y+75,120);assert.ok(dragged>box.y+90,'sheet follows the finger');await closed();
    await open();box=await sheet.boundingBox();
    await drag(160,box.y+65,12,{steps:4,delay:40});await page.waitForTimeout(300);
    assert.ok(Math.abs((await sheet.boundingBox()).y-box.y)<1,'small drag returns to rest');
    await drag(160,box.y+65,75,{cancel:true});await page.waitForTimeout(300);
    assert.ok(Math.abs((await sheet.boundingBox()).y-box.y)<1,'cancelled drag returns to rest');
    await drag(160,box.y+100,-55);await page.waitForTimeout(100);assert.ok(await sheet.isVisible(),'upward gesture does not dismiss');
    await page.keyboard.press('Escape');await closed();
    console.log('PASS content drag-to-close, small/cancelled/upward gestures, Escape');

    await open();
    const speakBox=await page.locator('[data-action="speak"]').boundingBox();
    // Dragging a footer control must not activate it when the gesture ends.
    await drag(speakBox.x+20,speakBox.y+10,25,{cancel:true,steps:2,delay:16});await page.waitForTimeout(300);
    assert.equal(await page.evaluate(()=>window.spoken),1);
    await page.keyboard.press('Escape');await closed();
    await open();await page.locator('#clue-text').evaluate(el=>el.textContent=el.textContent.repeat(10));
    box=await sheet.boundingBox();await drag(180,730,-260,{steps:12});await page.waitForTimeout(400);
    assert.ok(await sheet.evaluate(el=>el.scrollTop>0),'long content scrolls natively');
    await sheet.evaluate(el=>el.scrollTop=100);
    await drag(180,box.y+95,210,{steps:14});await page.waitForTimeout(350);
    assert.ok(await sheet.isVisible(),'a gesture starting in scrolled content cannot dismiss');
    assert.ok(Math.abs((await sheet.boundingBox()).y-box.y)<1);
    assert.equal(await sheet.evaluate(el=>el.scrollTop),0);
    await drag(180,box.y+95,135);await closed();
    console.log('PASS footer gesture has no accidental click, long-content scroll and fresh-gesture dismissal');

    await open();await page.setViewportSize({width:320,height:568});await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>document.body.scrollWidth),320);
    await page.keyboard.press('Escape');await closed();
    await page.emulateMedia({reducedMotion:'reduce'});await open();
    assert.equal(await sheet.evaluate(el=>el.getAnimations().length),0);
    await overlay.tap({position:{x:280,y:50}});await closed();
    assert.deepEqual(errors,[]);console.log('PASS narrow screen, reduced motion, no browser errors');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
