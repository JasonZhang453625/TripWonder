// Native bridge simulation exercises the actual bundled bridge and existing UI.
// This is not a physical Android-device test.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {walk,sha,root,out,mobile}=require('../scripts/build.cjs');
const release=JSON.parse(fs.readFileSync(path.join(mobile,'build-report.json')));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(out,'.'+(p==='/'?'/index.html':p));
 if(!file.startsWith(out+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const report={bridgeSimulation:true,realAndroidDevice:false,errors:[],missing:[]};
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()===404)report.missing.push(r.url());});
  await page.addInitScript(()=>{
   window.androidBridge={};window.nativeCalls=[];window.nativeListeners={};
   const names={App:['minimizeApp'],Share:['share'],Filesystem:['writeFile'],LiveUpdate:['ready','getCurrentBundle','getNextBundle','getBlockedBundles','getBundles','downloadBundle','setNextBundle']};
   window.Capacitor={PluginHeaders:Object.entries(names).map(([name,methods])=>({name,methods:[...methods.map(name=>({name,rtype:'promise'})),{name:'addListener',rtype:'callback'},{name:'removeListener',rtype:'callback'}]})),nativeCallback:(plugin,method,options,callback)=>{window.nativeListeners[options.eventName]=callback;return 'listener';},nativePromise:async(plugin,method,options)=>{
    window.nativeCalls.push({plugin,method,options});
    if(method==='getCurrentBundle'||method==='getNextBundle')return {bundleId:null};
    if(method==='getBlockedBundles'||method==='getBundles')return {bundleIds:[]};
    if(method==='writeFile')return {uri:'file:///cache/test.png'};
    return {};
   }};
  });
  await page.route('https://trip-guessr.vercel.app/mobile-updates/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(release)}));
  const token=Buffer.from(JSON.stringify({cityId:'shenzhen',score:0})).toString('base64url');
  await page.goto(`http://127.0.0.1:${server.address().port}/?challenge=${token}`);
  await page.locator('.cover-page').waitFor();
  await page.waitForFunction(()=>nativeCalls.some(x=>x.method==='ready'),{},{timeout:5000}).catch(async error=>{console.log(await page.evaluate(()=>({platform:window.Capacitor?.getPlatform?.(),hooks:!!window.TripWonderNativeHooks,updates:!!window.TripWonderUpdates,calls:nativeCalls})),report.errors);throw error;});
  if(await page.locator('.rules-popover').count())await page.evaluate(()=>nativeListeners.backButton({}));
  await page.locator('#app [data-action="start"]').click();
  await page.locator('#app .photo-viewport[data-rendered="true"]').waitFor();
  await page.locator('.scene-transition').waitFor({state:'detached'});
  await page.locator('[data-action="next-scene"]').click();
  await page.waitForFunction(()=>document.querySelector('.photo-viewport')?.dataset.sourceSize==='7002x4668');
  await page.locator('.scene-transition').waitFor({state:'detached'});
  report.nativeSceneSize=await page.locator('.photo-viewport').getAttribute('data-source-size');
  await page.locator('[data-clue="0"]').click();
  await page.locator('#modal-root [role="dialog"]').waitFor();
  await page.evaluate(()=>nativeListeners.backButton({}));
  await page.locator('#modal-root [role="dialog"]').waitFor({state:'detached'});
  assert.equal(await page.locator('.explore-page').count(),1);
  await page.evaluate(()=>nativeListeners.backButton({}));await page.locator('.cover-page').waitFor();
  await page.waitForTimeout(500);
  await page.evaluate(()=>nativeListeners.backButton({}));await page.locator('.trip-home').waitFor();
  await page.waitForFunction(()=>!ChallengeMotion.busy);
  if(await page.locator('.hp-layer').count())await page.evaluate(()=>nativeListeners.backButton({}));
  await page.evaluate(()=>nativeListeners.backButton({}));
  await page.waitForFunction(()=>nativeCalls.some(x=>x.method==='minimizeApp'),{},{timeout:5000}).catch(async error=>{console.log(await page.evaluate(()=>({busy:ChallengeMotion.busy,app:document.querySelector('#app').className,modal:document.querySelector('#modal-root').innerHTML,calls:nativeCalls,back:TripWonderNativeHooks.back()})));throw error;});
  await page.evaluate(()=>navigator.share({title:'TripWonder',url:TRIPWONDER_PUBLIC_ORIGIN+'/index.html',files:[new File(['test'],'card.png',{type:'image/png'})]}));
  const calls=await page.evaluate(()=>nativeCalls);assert.ok(calls.some(x=>x.method==='share'&&x.options.files[0]==='file:///cache/test.png'));
  assert.ok(!calls.some(x=>x.method==='reload'));
  report.backAndShare=true;
  const photos=walk(out).filter(f=>f.endsWith(path.join('immersive-blur','photo.jpg')));
  assert.equal(photos.length,23);
  for(const file of photos)assert.equal(sha(fs.readFileSync(file)),sha(fs.readFileSync(path.join(root,path.relative(out,file)))));
  report.fullResolutionFilesUnchanged=photos.length;
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);
  const artifacts=path.join(mobile,'artifacts');fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:path.join(artifacts,'android-bridge-home.png')});
  fs.writeFileSync(path.join(artifacts,'browser-smoke-report.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
