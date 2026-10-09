// Self-hosted differential bundles. No cloud account or device identifier needed.
export function validateRelease(value, runtime, origin) {
  if (value?.schema !== 1 || value.runtime !== runtime || !/^[a-f0-9]{24}$/.test(value.bundleId || '')) return null;
  const url = new URL(value.url, origin);
  if (url.protocol !== 'https:' || url.origin !== origin || url.pathname !== `/mobile-updates/files/${value.bundleId}` || url.search || url.hash) return null;
  return {...value, url:url.href};
}

// report({state}) drives the status-bar notification: 'downloading' → 'ready', or 'failed'.
export function createUpdater({plugin, fetcher, runtime, origin, builtInId, notify=()=>{}, report=()=>{}}) {
  let running, lastCheck=0;
  async function check() {
    const response=await fetcher(`${origin}/mobile-updates/${runtime}.json`, {cache:'no-store', signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw Error(`Update check: ${response.status}`);
    const release=validateRelease(await response.json(), runtime, origin);
    if (!release) throw Error('Incompatible update manifest');
    const current=await plugin.getCurrentBundle();
    const next=await plugin.getNextBundle();
    const effectiveId=current.bundleId || builtInId;
    if (release.bundleId===effectiveId) {
      // A withdrawn release must not remain scheduled for next launch.
      if (next.bundleId && next.bundleId!==current.bundleId) await plugin.setNextBundle({bundleId:current.bundleId});
      return 'current';
    }
    if ((await plugin.getBlockedBundles()).bundleIds.includes(release.bundleId)) return 'blocked';
    // Already downloaded earlier but not yet applied: surface it again instead of waiting silently.
    if (next.bundleId===release.bundleId) { report({state:'ready', bundleId:release.bundleId}); return 'pending'; }
    const downloaded=await plugin.getBundles();
    if (!downloaded.bundleIds.includes(release.bundleId)) {
      report({state:'downloading', bundleId:release.bundleId});
      try { await plugin.downloadBundle({bundleId:release.bundleId, artifactType:'manifest', url:release.url}); }
      catch (error) { report({state:'failed', bundleId:release.bundleId, message:error?.message||'下载中断'}); throw error; }
    }
    await plugin.setNextBundle({bundleId:release.bundleId});
    report({state:'ready', bundleId:release.bundleId});
    notify('新版页面已下载：点按通知栏提示即可立即使用');
    return 'downloaded';
  }
  return {
    check({force=false}={}) {
      if (running) return running;
      if (!force && Date.now()-lastCheck<15*60*1000) return Promise.resolve('throttled');
      lastCheck=Date.now();
      running=check().finally(()=>{running=null;});
      return running;
    }
  };
}
