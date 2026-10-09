import {Capacitor, registerPlugin} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Share} from '@capacitor/share';
import {Filesystem, Directory} from '@capacitor/filesystem';
import {LiveUpdate} from '@capawesome/capacitor-live-update';
import {createUpdater} from './updates.js';

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('mobile-device','native-app');
  window.TRIPWONDER_PUBLIC_ORIGIN=__PUBLIC_ORIGIN__;
  // Preserve the existing share UI, routing its final action to Android's sheet.
  Object.defineProperty(navigator,'canShare',{configurable:true,value:({files=[]}={})=>files.every(file=>file instanceof Blob)});
  Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{
    const files=[];
    for (const [index,file] of (data.files||[]).entries()) {
      const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);});
      const saved=await Filesystem.writeFile({path:`tripwonder-share-${index}.png`,data:base64,directory:Directory.Cache});
      files.push(saved.uri);
    }
    try { await Share.share({title:data.title,text:data.text,url:data.url,files:files.length?files:undefined,dialogTitle:'分享奇境挑战'}); }
    catch(error) { if (/cancel/i.test(error.message||'')) throw new DOMException('Share cancelled','AbortError');throw error; }
  }});
  App.addListener('backButton',async()=>{
    if (window.TripWonderNativeHooks?.back()) return;
    await App.minimizeApp();
  });
  // Status-bar progress for live updates (native UpdateNotifierPlugin). Failures to notify never block the update.
  const UpdateNotifier=registerPlugin('UpdateNotifier');
  const quiet=promise=>promise.catch(()=>{});
  const mb=bytes=>(bytes/1048576).toFixed(1);
  let lastPercent=-1,lastPaint=0;
  LiveUpdate.addListener('downloadBundleProgress',({progress=0,downloadedBytes=0,totalBytes=0})=>{
    const percent=Math.floor(progress*100),now=Date.now();
    if(!totalBytes||percent===lastPercent||(percent<100&&now-lastPaint<250))return;
    lastPercent=percent;lastPaint=now;
    void quiet(UpdateNotifier.progress({percent,title:'正在拉取新版页面',text:`${mb(downloadedBytes)} MB / ${mb(totalBytes)} MB`}));
  });
  const report=({state,message})=>{
    if(state==='downloading'){lastPercent=-1;void quiet(UpdateNotifier.progress({percent:0,indeterminate:true,title:'正在拉取新版页面',text:'正在比对需要更新的文件…'}));}
    else if(state==='ready')void quiet(UpdateNotifier.finish({apply:true,title:'新版页面已就绪',text:'点按立即使用新版页面（下次打开 App 也会自动生效）'}));
    else if(state==='failed')void quiet(UpdateNotifier.finish({apply:false,title:'新版页面拉取失败',text:`${message}。已保留当前版本，下次打开 App 会自动重试。`}));
  };
  // Tapping the "ready" notification while the app is open switches to the downloaded bundle right away.
  window.addEventListener('tripwonderapplyupdate',async()=>{
    const next=await LiveUpdate.getNextBundle().catch(()=>({}));
    if(!next.bundleId)return;
    await quiet(UpdateNotifier.clear());
    await LiveUpdate.reload();
  });
  const updater=createUpdater({plugin:LiveUpdate,fetcher:fetch,runtime:__RUNTIME__,origin:__PUBLIC_ORIGIN__,builtInId:__BUNDLE_ID__,notify:message=>window.TripWonderNativeHooks?.toast(message),report});
  window.TripWonderUpdates={check:()=>updater.check({force:true}),runtime:__RUNTIME__,bundleId:__BUNDLE_ID__};
  let ready=false,firstCheck=true;
  // The first check after launch says so when the update server is unreachable, instead of failing silently.
  const check=()=>{
    const announce=firstCheck;firstCheck=false;
    return updater.check().catch(error=>{
      console.info('Live update unavailable; using installed content.',error.message);
      if(announce&&!/: 404$/.test(error.message||''))window.TripWonderNativeHooks?.toast('暂时连不上更新服务器，当前使用已安装版本');
    });
  };
  App.addListener('appStateChange',({isActive})=>{if(isActive&&ready)void check();});
  // A JS crash or blank page must not acknowledge a broken bundle as healthy.
  const deadline=Date.now()+25000;
  const timer=setInterval(async()=>{
    if(Date.now()>deadline){clearInterval(timer);return;}
    if(!window.TripWonderNativeHooks?.isReady())return;
    clearInterval(timer);
    try { await LiveUpdate.ready();ready=true;setTimeout(check,2000); }
    catch(error){console.error('Live update readiness failed',error);}
  },100);
}
