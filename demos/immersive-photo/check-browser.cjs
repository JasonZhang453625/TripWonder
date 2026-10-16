// PLAYWRIGHT_PATH: installed Playwright module; BROWSER_PATH: optional Chrome executable.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const registry = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'scenes.js'),'utf8'),registry);
const base = process.env.DEMO_URL || 'http://127.0.0.1:8766/demos/immersive-photo/';
const output = process.env.SPHERE_QA_DIR || path.join(require('node:os').tmpdir(),'tripwonder-sphere-qa');
fs.mkdirSync(output,{recursive:true});
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH} : {channel:'chrome'})});
  try {
    const results = [];
    for (const scene of registry.window.SPHERE_SCENES) {
      const page = await browser.newPage({viewport:{width:390,height:780},hasTouch:true});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      const url = new URL(base);url.searchParams.set('scene',scene.id);
      await page.goto(url.href);
      await page.waitForFunction(()=>document.querySelector('#view').style.opacity==='1');
      const box=await page.locator('#stage').boundingBox();
      assert.equal(box.width,390);assert.equal(box.height,780);
      assert.equal(await page.locator('button').count(),0);
      assert.equal(await page.locator('#stage').innerText(),'');
      const center=await page.locator('#stage').screenshot({path:path.join(output,scene.id+'-center.png')});
      // Actual touch events exercise the same pointer handlers used on phones.
      const touch = await page.context().newCDPSession(page);
      await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:80,y:390}]});
      await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:290,y:420}]});
      await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(500);
      assert.ok(!center.equals(await page.locator('#stage').screenshot()),'touch drag must change rendered view');
      await page.locator('#stage').focus();
      for(const direction of ['ArrowLeft','ArrowRight']) {
        for(let i=0;i<80;i++)await page.keyboard.press(direction);
        await page.waitForTimeout(450);
        await page.locator('#stage').screenshot({path:path.join(output,scene.id+'-'+direction+'.png')});
      }
      const diagnostics = await page.evaluate(()=>({width:image.naturalWidth,height:image.naturalHeight,
        glError:gl.getError(),span:[horizontalSpan,verticalSpan],fov:verticalFov}));
      assert.equal(diagnostics.glError,0);assert.deepEqual(errors,[]);
      await page.setViewportSize({width:360,height:720});
      assert.equal((await page.locator('#stage').boundingBox()).height,720);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      results.push({id:scene.id,...diagnostics,touchDrag:true});
      await page.close();
    }
    // Simulate a device whose GPU cannot accept either source at full size.
    const limited = await browser.newPage({viewport:{width:390,height:780}});
    await limited.addInitScript(()=>{
      const original=WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter=function(parameter){
        return parameter===this.MAX_TEXTURE_SIZE?1024:original.call(this,parameter);
      };
    });
    await limited.goto(base);
    await limited.waitForFunction(()=>document.querySelector('#view').style.opacity==='1');
    assert.equal(await limited.evaluate(()=>gl.getError()),0);
    await limited.close();
    const interrupted = await browser.newPage();
    await interrupted.route('**/immersive-blur/photo.jpg',route=>route.abort());
    await interrupted.goto(base);
    await interrupted.waitForFunction(()=>document.querySelector('#view').style.opacity==='1');
    assert.equal(await interrupted.evaluate(()=>image.naturalWidth),registry.window.SPHERE_SCENES[0].fallback.width);
    await interrupted.close();
    // Verify unavailable WebGL leaves a loaded static photo, without error UI.
    const page = await browser.newPage();
    await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});
    await page.goto(base);
    await page.waitForFunction(()=>document.querySelector('#fallback').naturalWidth>0);
    assert.equal(await page.locator('#view').evaluate(el=>getComputedStyle(el).opacity),'0');
    await page.close();
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify({scenes:results.length,mobileSizes:['390×780','360×720'],staticFallback:true,textureLimitFallback:true,networkFallback:true,output,results},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
