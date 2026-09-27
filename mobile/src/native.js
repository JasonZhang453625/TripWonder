import {Capacitor} from '@capacitor/core';
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
  const updater=createUpdater({plugin:LiveUpdate,fetcher:fetch,runtime:__RUNTIME__,origin:__PUBLIC_ORIGIN__,builtInId:__BUNDLE_ID__,notify:message=>window.TripWonderNativeHooks?.toast(message)});
  window.TripWonderUpdates={check:()=>updater.check({force:true}),runtime:__RUNTIME__,bundleId:__BUNDLE_ID__};
  let ready=false;
  const check=()=>updater.check().catch(error=>console.info('Live update unavailable; using installed content.',error.message));
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
