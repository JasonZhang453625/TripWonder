const test=require('node:test'),assert=require('node:assert/strict');
const {buildSync}=require('esbuild'),vm=require('node:vm'),path=require('node:path');
const compiled=buildSync({entryPoints:[path.join(__dirname,'../src/updates.js')],bundle:true,format:'cjs',write:false}).outputFiles[0].text;
const context={module:{exports:{}},exports:{},URL,AbortSignal,Date,console};vm.runInNewContext(compiled,context);
const {createUpdater,validateRelease}=context.module.exports;
const origin='https://trip-guessr.vercel.app',runtime='android-test',id='a'.repeat(24),old='b'.repeat(24);
function fixture(overrides={}){
 const calls=[],release={schema:1,runtime,bundleId:id,url:`${origin}/mobile-updates/files/${id}`};
 const plugin={getCurrentBundle:async()=>({bundleId:old}),getNextBundle:async()=>({bundleId:null}),getBlockedBundles:async()=>({bundleIds:[]}),getBundles:async()=>({bundleIds:[]}),downloadBundle:async x=>calls.push(['download',x]),setNextBundle:async x=>calls.push(['next',x]),...overrides};
 return {calls,release,updater:createUpdater({plugin,fetcher:async()=>({ok:true,json:async()=>release}),runtime,origin,builtInId:old})};
}
test('downloads then schedules; never reloads the active challenge',async()=>{const f=fixture();assert.equal(await f.updater.check(),'downloaded');assert.deepEqual(f.calls.map(c=>c[0]),['download','next']);assert.equal(f.calls[0][1].artifactType,'manifest');});
test('download failure never schedules incomplete content; manual retry works',async()=>{let fails=true;const f=fixture({downloadBundle:async()=>{if(fails)throw Error('offline');}});await assert.rejects(f.updater.check());assert.equal(f.calls.length,0);fails=false;assert.equal(await f.updater.check({force:true}),'downloaded');});
test('deduplicates concurrent checks',async()=>{const f=fixture();await Promise.all([f.updater.check(),f.updater.check()]);assert.equal(f.calls.length,2);});
test('blocked bad release is skipped',async()=>{const f=fixture({getBlockedBundles:async()=>({bundleIds:[id]})});assert.equal(await f.updater.check(),'blocked');assert.equal(f.calls.length,0);});
test('built in version and already scheduled version are not redownloaded',async()=>{const f=fixture({getCurrentBundle:async()=>({bundleId:null})});f.release.bundleId=old;f.release.url=`${origin}/mobile-updates/files/${old}`;assert.equal(await f.updater.check(),'current');assert.equal(f.calls.length,0);const pending=fixture({getNextBundle:async()=>({bundleId:id})});assert.equal(await pending.updater.check(),'pending');assert.equal(pending.calls.length,0);});
test('rejects foreign origins and incompatible native runtime',()=>{const f=fixture();assert.equal(validateRelease({...f.release,runtime:'wrong'},runtime,origin),null);assert.equal(validateRelease({...f.release,url:`https://evil.example/mobile-updates/files/${id}`},runtime,origin),null);});
test('withdrawn release cancels stale pending update',async()=>{const f=fixture({getNextBundle:async()=>({bundleId:id})});f.release.bundleId=old;f.release.url=`${origin}/mobile-updates/files/${old}`;assert.equal(await f.updater.check(),'current');assert.equal(f.calls[0][1].bundleId,old);});
test('reports download start, ready and failure for the status-bar notification',async()=>{
 const seen=[],mk=(dl)=>{const f=fixture({downloadBundle:dl});return createUpdater({plugin:{getCurrentBundle:async()=>({bundleId:old}),getNextBundle:async()=>({bundleId:null}),getBlockedBundles:async()=>({bundleIds:[]}),getBundles:async()=>({bundleIds:[]}),downloadBundle:dl,setNextBundle:async()=>{}},fetcher:async()=>({ok:true,json:async()=>f.release}),runtime,origin,builtInId:old,report:e=>seen.push(e.state)});};
 assert.equal(await mk(async()=>{}).check(),'downloaded');assert.deepEqual(seen.splice(0),['downloading','ready']);
 await assert.rejects(mk(async()=>{throw Error('offline');}).check());assert.deepEqual(seen,['downloading','failed']);
});
