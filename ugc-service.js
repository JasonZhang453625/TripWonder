/* Persistent prototype publishing. Photo bytes live in IndexedDB, never localStorage. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t = (zh, en) => I18N.t(zh, en), rows = new Map(), catalog = new Map(), thumbnails = new Map();
  const states = {draft:'草稿', processing:'正在处理照片', pending:'待审核', approved:'已发布', rejected:'已退回', disabled:'已下架', failed:'生成失败'};
  let db, backend = false, storageError = '', editingId = null, timer, saveTimer, writeQueue = Promise.resolve(), submitting = false, photoTask = Promise.resolve(), photoGeneration = 0;
  const emit = () => window.dispatchEvent(new CustomEvent('tw-ugc-updated'));
  const navigate = (view, options = {}) => window.dispatchEvent(new CustomEvent('tw-ugc-navigate', {detail:{view,...options}}));
  const request = async (url, options) => {
    const response = await fetch(url, {...options, signal: AbortSignal.timeout(15000)});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(data.error || `服务暂不可用（${response.status}）`);
    return data;
  };
  const post = (url, data) => request(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
  function transaction(mode, run) {
    if (!db) return Promise.reject(Error(storageError || '无法保存，请允许此网页使用本机存储后重试'));
    return new Promise((resolve, reject) => {
      const tx = db.transaction('submissions', mode); let result;
      const req = run(tx.objectStore('submissions'));
      if (req) req.onsuccess = () => { result = req.result; };
      tx.oncomplete = () => resolve(result); tx.onerror = tx.onabort = () => reject(Error('保存失败，请检查设备剩余空间；照片和填写内容仍留在当前页面'));
    });
  }
  function save(record, notify = true) {
    const snapshot = structuredClone(record);
    const task = writeQueue.catch(() => {}).then(() => transaction('readwrite', store => store.put(snapshot)));
    writeQueue = task;
    return task.then(() => { rows.set(snapshot.id, snapshot); if (notify) emit(); return snapshot; });
  }
  const fieldsOf = form => Object.fromEntries([...new FormData(form)].filter(([key]) => key !== 'photos'));
  const questionsOf = fields => [0,1,2].map(i => ({q:fields[`q${i}`], options:[0,1,2,3].map(j => fields[`o${i}-${j}`]), answer:fields[`a${i}`], sceneIndex:Number(fields[`scene${i}`] ?? i), explain:fields[`explain${i}`]}));
  function validate(fields, photos) {
    if (photos.length < 3 || photos.length > 9) throw Error('每个 Journey 需要 3–9 张照片');
    const name = String(fields.name || '').trim(), title = String(fields.title || '').trim(), region = String(fields.region || '').trim();
    if (!name || !title || !region) throw Error('请填写地点名称、挑战标题和所在城市');
    if (!(Number(fields.lat) >= 3.5 && Number(fields.lat) <= 54 && Number(fields.lng) >= 73 && Number(fields.lng) <= 136)) throw Error('请填写中国境内的经纬度');
    if ([name,...region.split(/[·,，\s]+/)].filter(s => s.length >= 2).some(s => (title + String(fields.intro || '')).includes(s))) throw Error('挑战标题和介绍不能透露目的地或所在城市');
    return UGCContract.questions(questionsOf(fields), photos.length, name, region);
  }
  const photoUrl = blob => URL.createObjectURL(blob);
  function journey(record) {
    if (catalog.get(record.id)?.revision === record.revision) return catalog.get(record.id).journey;
    const fields = record.fields, questions = validate(fields, record.photos);
    const scenes = record.photos.map((p, i) => {
      const id = `${record.id}-s${i+1}`, original = photoUrl(p.original);
      return {id, name:`场景 ${i+1}`, type:'玩家实景', hotspots:UGCContract.observations(), photo:{id, src:original, original:{src:original,width:p.width,height:p.height}, width:p.screen.width,height:p.screen.height, version:record.revision, credit:fields.author || '发布者提供', thumb:{...p.thumb,src:photoUrl(p.thumb.blob)},screen:{...p.screen,src:photoUrl(p.screen.blob)},detail:{...p.detail,src:photoUrl(p.detail.blob)}}};
    });
    const result = {id:record.id,channel:'ugc',review:'approved',title:fields.title,name:fields.name,region:fields.region,intro:fields.intro,author:{name:fields.author || t('玩家','Player')},boardEnabled:fields.board === 'on',lat:Number(fields.lat),lng:Number(fields.lng),publishedAt:record.publishedAt,revision:record.revision,local:true,scenes,questions:questions.map(q => ({...q,sceneId:scenes[q.sceneIndex].id})),stops:[]};
    catalog.set(record.id,{revision:record.revision,journey:result}); return result;
  }
  function register(record) {
    if (record.state === 'approved') Community.register(record.remoteJourney || journey(record));
    else Community.unregister(record.id);
  }
  async function initializeUpload() {
    const id = 'ugc-6fc1b6bc-e1b5-4fe4-93d2-871f5bde8a90';
    const existing=rows.get(id),latest=window.UGC_JOURNEYS?.find(j=>j.id==='ugc-shapowei');
    if(existing?.initialized&&latest&&existing.quizRevision!==window.UGC_SAMPLE_REVISION){
      const next=structuredClone(existing),scenes=next.remoteJourney.scenes;
      next.remoteJourney.questions=latest.questions.map(question=>({...question,sceneId:scenes[latest.scenes.findIndex(scene=>scene.id===question.sceneId)].id}));
      next.remoteJourney.questions.forEach((question,index)=>{next.fields[`q${index}`]=question.q;next.fields[`a${index}`]=String(question.answer);next.fields[`explain${index}`]=question.explain;question.options.forEach((option,n)=>{next.fields[`o${index}-${n}`]=option;});});
      next.quizRevision=window.UGC_SAMPLE_REVISION;await save(next,false);register(next);
    }
    if (rows.has(id) || [...rows.values()].some(row => !row.imported && row.photos.length >= 3 && row.fields.title?.trim())) return;
    const source = window.UGC_JOURNEYS?.find(journey => journey.id === 'ugc-shapowei');
    if (!source) return;
    const sample = structuredClone(source), now = Date.now();
    sample.id = id; sample.author = {name:'我',nameEn:'Me'};
    sample.title = '把周末交给海风'; sample.titleEn = 'A weekend by the sea';
    sample.intro = '沿着水边慢慢走，看看停泊的小船、临水的老房子，还有藏在街角的生活。';
    sample.introEn = 'A slow walk past little boats, waterside houses and everyday life along the shore.';
    sample.publishedAt = new Date(now).toISOString(); sample.revision = now; sample.local = true;
    delete sample.sampleRevision;
    const sceneIds = new Map(sample.scenes.map((scene,index) => [scene.id,`${id}-s${index+1}`]));
    sample.scenes.forEach(scene => { scene.id = sceneIds.get(scene.id); scene.photo.id = scene.id; });
    sample.questions.forEach(question => { question.sceneId = sceneIds.get(question.sceneId); });
    const fields = {title:sample.title,name:sample.name,region:sample.region,intro:sample.intro,author:'我',lat:String(sample.lat),lng:String(sample.lng),board:'on'};
    sample.questions.forEach((question,index) => {
      fields[`q${index}`] = question.q; fields[`a${index}`] = String(question.answer);
      fields[`scene${index}`] = String(index); fields[`explain${index}`] = question.explain;
      question.options.forEach((option,n) => { fields[`o${index}-${n}`] = option; });
    });
    const record = {id,state:'approved',fields,photos:sample.scenes.map(scene => ({name:scene.name,width:scene.photo.width,height:scene.photo.height})),remoteJourney:sample,initialized:true,quizRevision:window.UGC_SAMPLE_REVISION,revision:now,publishedAt:sample.publishedAt,updatedAt:now};
    rows.set(id,record); register(record);
    if(db)await save(record,false);
  }
  function uploadCard(record) {
    const photo = record.remoteJourney?.scenes[0]?.photo;
    let cover = photo?.thumb?.src || photo?.src || '';
    const blob = record.photos[0]?.thumb?.blob;
    if(!cover && blob){
      let cached=thumbnails.get(record.id);
      if(cached?.blob!==blob){if(cached)URL.revokeObjectURL(cached.url);cached={blob,url:photoUrl(blob)};thumbnails.set(record.id,cached);}
      cover=cached.url;
    }
    return `<article class="cm-upload-card" data-upload-id="${esc(record.id)}"><button class="cm-upload-open" ${record.state==='approved'?`data-journey="${esc(record.id)}"`:`data-ugc-edit="${esc(record.id)}"`}${record.state==='processing'?' disabled':''}>${cover?`<img class="cm-upload-cover" src="${esc(cover)}" alt="" decoding="async">`:'<span class="cm-upload-cover cm-upload-cover-empty" aria-hidden="true"></span>'}<span class="cm-upload-copy"><strong>${esc(record.fields.title || t('未命名旅程','Untitled journey'))}</strong><span>${record.photos.length}${t('张照片',' photos')}<i>·</i>${esc(states[record.state] || record.state)}</span></span><svg class="cm-upload-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></article>`;
  }
  async function originalPhotos(record) {
    if(!record.initialized)return record.photos;
    const photos=[];
    for(const scene of record.remoteJourney.scenes){
      const response=await fetch(scene.photo.original?.src || scene.photo.src);
      if(!response.ok)throw Error('照片暂未载入，请通过本地预览地址打开后重试');
      const blob=await response.blob();
      photos.push(await processPhoto(new File([blob],`${scene.id}.jpg`,{type:blob.type})));
    }
    return photos;
  }
  async function processPhoto(file) {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type) || file.size > 60 * 1024 * 1024) throw Error('请使用 JPG、PNG、WebP 或 AVIF 照片，单张不超过 60 MB');
    let bitmap;
    try { bitmap = await createImageBitmap(file); } catch { throw Error(`无法读取「${file.name}」，请选择有效图片`); }
    try {
      if (Math.min(bitmap.width,bitmap.height) < 600) throw Error(`「${file.name}」太小，短边需至少 600 像素`);
      const result = {name:file.name,type:file.type,original:file,width:bitmap.width,height:bitmap.height};
      for (const [kind,edge] of [['thumb',480],['screen',1440],['detail',2400]]) {
        const scale = Math.min(1,edge/Math.max(bitmap.width,bitmap.height)), canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width*scale); canvas.height = Math.round(bitmap.height*scale);
        canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
        const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/webp',.86));
        if (!blob) throw Error('图片处理失败，请重试');
        result[kind] = {blob,width:canvas.width,height:canvas.height};
      }
      return result;
    } finally { bitmap.close(); }
  }
  function formError(form, error) { const box = form.querySelector('.cm-error'); box.hidden = false; box.textContent = error.message || String(error); }
  function currentDraft() {
    return rows.get(editingId) || {id:`ugc-${crypto.randomUUID()}`,state:'draft',fields:{},photos:[],revision:Date.now(),updatedAt:Date.now()};
  }
  function mountPublish(form) {
    photoTask = Promise.resolve();
    let record = currentDraft(); editingId = record.id;
    const status = form.querySelector('[data-draft-status]');
    for (const [name,value] of Object.entries(record.fields)) {
      const element = form.elements.namedItem(name);
      if (!element) continue;
      if (element instanceof RadioNodeList) { if (element[0]?.type === 'radio') element.value = value; }
      else if (element.type === 'checkbox') element.checked = value === 'on';
      else element.value = value;
    }
    if (Object.keys(record.fields).length && !record.fields.board) form.elements.board.checked = false;
    if (record.photos.length) {
      const transfer = new DataTransfer(); record.photos.forEach(p => transfer.items.add(new File([p.original],p.name,{type:p.type})));
      form.elements.photos.files = transfer.files; Community.previews(form.elements.photos);
    }
    status.textContent = storageError || '';
    const draft = async () => {
      clearTimeout(saveTimer); if (submitting || form.dataset.submitted === 'true' || record.state !== 'draft') return;
      record = {...record,fields:fieldsOf(form),updatedAt:Date.now()};
      try { await save(record,false); status.textContent = t('草稿已保存','Draft saved'); } catch(error) { formError(form,error); }
    };
    const rememberFields=()=>{try{localStorage.setItem('tripwonder-ugc-editor',JSON.stringify({id:record.id,fields:fieldsOf(form)}));}catch{/* IndexedDB still reports its own save outcome. */}};
    form.addEventListener('input',() => { rememberFields();clearTimeout(saveTimer); saveTimer = setTimeout(draft,250); });
    form.addEventListener('change',event => {
      rememberFields();
      if (event.target !== form.elements.photos) { draft(); return; }
      const files = [...event.target.files], generation=++photoGeneration;
      photoTask = (async () => {
        if (files.length > 9) throw Error('最多选择 9 张照片');
        status.textContent = t('正在保存照片…','Saving photos…');
        const photos = []; for (const file of files) photos.push(await processPhoto(file));
        if(generation!==photoGeneration)return;
        record = {...record,photos}; await draft();
      })();
      photoTask.catch(error => formError(form,error));
    });
    form._ugcRecord = () => record;
    form._saveUgcDraft = draft;
    form._flushUgcDraft = () => { clearTimeout(saveTimer); return draft(); };
  }
  async function submit(form) {
    if (submitting) return null;
    submitting = true; const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try {
      clearTimeout(saveTimer); await photoTask;
      let record = form._ugcRecord(), fields = fieldsOf(form);
      const questions = validate(fields,record.photos);
      if (form.elements.photos.files.length !== record.photos.length) throw Error('照片尚未保存，请重新选择照片');
      record = {...record,fields,state:'draft',revision:Date.now(),updatedAt:Date.now(),feedback:''};
      await save(record,false);
      if (backend) {
        const scenes = [];
        for (const [i,p] of record.photos.entries()) {
          button.textContent = t(`正在上传 ${i+1}/${record.photos.length}`,`Uploading ${i+1}/${record.photos.length}`);
          const uploaded = await request('/api/uploads',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:p.original});
          scenes.push({uploadId:uploaded.uploadId,name:`照片 ${i+1}`,filename:p.name,credit:fields.author || '发布者提供'});
        }
        const job = await post('/api/journeys',{id:record.id,name:fields.name,title:fields.title,region:fields.region,intro:fields.intro,lat:fields.lat,lng:fields.lng,author:fields.author,boardEnabled:fields.board === 'on',channel:'ugc',scenes,questions,resubmit:true});
        record.remoteJobId = job.jobId;
      }
      record.state = backend ? 'processing' : 'pending'; await save(record); editingId = null; form.dataset.submitted = 'true';try{localStorage.removeItem('tripwonder-ugc-editor');}catch{}
      return {id:record.id,backend};
    } finally { submitting = false; button.disabled = false; button.textContent = t('提交审核','Submit for review'); }
  }
  async function refresh() {
    if (!backend) return;
    const data = await request('/api/journeys');
    for (const remote of data.journeys.filter(j => j.channel === 'ugc')) {
      remote.revision ||= remote.generated?.at || remote.createdAt;
      const row = rows.get(remote.id);
      const processing=data.jobs.some(job=>job.destinationId===remote.id&&['queued','running'].includes(job.status));
      if (remote.status === 'ready' && remote.review === 'approved') Community.register(remote);
      else Community.unregister(remote.id);
      if (!row?.remoteJobId || row.state === 'draft') continue;
      const state = processing ? 'processing' : remote.status === 'disabled' ? 'disabled' : remote.review;
      if (row.state !== state || row.feedback !== (remote.reviewNote || '')) await save({...row,state,feedback:remote.reviewNote || '',remoteJourney:remote},false);
    }
    for (const job of data.jobs) {
      const row = rows.get(job.destinationId);
      if (row?.remoteJobId === job.id && row.state !== 'draft' && job.status === 'failed') await save({...row,state:'failed',feedback:job.error},false);
    }
  }
  function management(ctx, review = false, embedded = false) {
    const list = [...rows.values()].filter(r => !r.imported && (!review || (!r.initialized && !r.remoteJobId && r.state !== 'draft'))).sort((a,b) => b.updatedAt-a.updatedAt);
    if(embedded&&!review)return `<section class="cm-mine-management cm-upload-list"><p class="cm-error" data-ugc-error hidden role="alert"></p>${list.map(uploadCard).join('')}</section>`;
    return `<${embedded ? 'section' : 'div'} class="${embedded ? 'cm-mine-management' : 'page cm-page cm-submissions'}">${embedded ? '' : ctx.head(t(review ? '本机审核工作台' : '我的发布',review ? 'Local review' : 'My journeys'),'feed')}<p class="cm-management-note">${t(backend ? '已连接后台。后台审核后，社区目录会同步更新。' : '本机原型：投稿和审核结果只影响此设备。',backend ? 'Connected to the admin. The community updates after review.' : 'Prototype: submissions and reviews affect this device only.')}</p><div class="cm-management-tools"><button class="secondary" data-ugc-new>${t('发布 Journey','New journey')}</button><button class="secondary" data-ugc-import>${t('导入旅程','Import journey')}</button>${!backend ? `<button class="secondary" data-ugc-review>${t(review ? '我的发布' : '本机审核工作台',review ? 'My journeys' : 'Local review')}</button>` : '<a href="photos.html#tab=ugc" target="_blank" rel="noopener">打开后台审核 ↗</a>'}</div><p class="cm-error" data-ugc-error hidden role="alert"></p>${list.length ? list.map(row => `<article class="cm-submission"><div class="row"><strong>${esc(row.fields.title || t('未命名草稿','Untitled draft'))}</strong><span class="pill">${esc(states[row.state] || row.state)}</span></div><p>${row.photos.length} ${t('张照片','photos')} · ${esc(row.fields.author || t('我','Me'))}</p>${row.feedback ? `<p class="cm-review-feedback">${esc(row.feedback)}</p>` : ''}<div class="cm-management-tools">${review ? `<button class="primary" data-ugc-inspect="${esc(row.id)}">${t('检查投稿','Inspect submission')}</button><button class="secondary" data-ugc-approve="${esc(row.id)}">${t('审核通过','Approve')}</button><button class="secondary" data-ugc-reject="${esc(row.id)}">${t('退回修改','Return for changes')}</button>${row.state === 'approved' ? `<button class="secondary" data-ugc-disable="${esc(row.id)}">${t('下架','Unpublish')}</button>` : ''}` : `<button class="secondary" data-ugc-edit="${esc(row.id)}"${row.state === 'processing' ? ' disabled' : ''}>${t('修改 / 继续填写','Edit / continue')}</button>${row.state === 'approved' ? `<button class="primary" data-journey="${esc(row.id)}">${t('开始挑战','Start challenge')}</button><button class="secondary" data-ugc-withdraw="${esc(row.id)}">${t('下架','Unpublish')}</button>` : ''}`}</div></article>`).join('') : `<p class="cm-empty">${t('还没有上传的 Journey，发布你的第一段旅程吧。','No uploads yet. Share your first journey.')}</p>`}</${embedded ? 'section' : 'div'}>`;
  }
  function release() { clearInterval(timer); }
  function mountManagement() { release(); if (backend) timer = setInterval(async () => { try { const before = JSON.stringify([...rows.values()].map(r => [r.id,r.state,r.feedback])); await refresh(); if (before !== JSON.stringify([...rows.values()].map(r => [r.id,r.state,r.feedback]))) emit(); } catch(error) { const box = document.querySelector('[data-ugc-error]'); if(box){box.hidden=false;box.textContent=error.message;} } },2000); }
  function mountFeed() { release();if(backend){const old=window.TRIPWONDER_CATALOG.ugc.map(j=>[j.id,j.revision,j.publishedAt]);refresh().then(()=>{if(JSON.stringify(old)!==JSON.stringify(window.TRIPWONDER_CATALOG.ugc.map(j=>[j.id,j.revision,j.publishedAt])))emit();}).catch(()=>{});} }
  async function reviewRecord(id, state, feedback = '') {
    const row = rows.get(id); if (!row || row.remoteJobId) throw Error('请在后台审核该投稿');
    if (state === 'approved') validate(row.fields,row.photos);
    const next = {...row,state,feedback,revision:Date.now(),publishedAt:state === 'approved' ? new Date().toISOString() : row.publishedAt,updatedAt:Date.now()};
    await save(next,false); register(next); emit();
  }
  async function exportJourney(id) {
    const row=rows.get(id);if(!row||row.state!=='approved')throw Error('只能导出已经发布的 Journey');
    const originals=await originalPhotos(row);
    if(originals.reduce((sum,p)=>sum+p.original.size,0)>70*1024*1024)throw Error('原始照片总大小超过 70 MB，请通过后台发布后分享链接');
    const photos=[];
    for(const p of originals){const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(p.original);});photos.push({name:p.name,type:p.type,data});}
    const blob=new Blob([JSON.stringify({type:'tripwonder-journey',schema:1,id:row.id,fields:row.fields,photos,publishedAt:row.publishedAt,revision:row.revision})],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${row.id}.tripwonder.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importJourney(file) {
    if(file.size>100*1024*1024)throw Error('旅程文件超过 100 MB');
    let pack;try{pack=JSON.parse(await file.text());}catch{throw Error('无法读取 Journey 文件');}
    if(pack.type!=='tripwonder-journey'||pack.schema!==1||!/^ugc-[a-f0-9-]{10,36}$/.test(pack.id)||pack.photos?.length<3||pack.photos?.length>9||!pack.fields)throw Error('Journey 文件结构不完整');
    if(rows.has(pack.id)||window.TRIPWONDER_CATALOG.ugc.some(j=>j.id===pack.id))throw Error('此 Journey 已在本机，无需重复导入');
    validate(pack.fields,pack.photos);
    const photos=[];
    for(const p of pack.photos){if(typeof p.data!=='string'||!/^data:image\/(jpeg|png|webp|avif);base64,/.test(p.data))throw Error('旅程包含无效图片');const blob=await fetch(p.data).then(r=>r.blob());photos.push(await processPhoto(new File([blob],String(p.name||'photo.jpg'),{type:blob.type})));}
    const row={id:pack.id,state:'approved',fields:pack.fields,photos,revision:Number(pack.revision)||Date.now(),publishedAt:pack.publishedAt||new Date().toISOString(),updatedAt:Date.now(),imported:true};
    await save(row,false);register(row);emit();navigate('feed',{tab:'ugc'});
  }
  document.addEventListener('click',async event => {
    const button = event.target.closest('[data-ugc-new],[data-ugc-mine],[data-ugc-review],[data-ugc-edit],[data-ugc-approve],[data-ugc-reject],[data-ugc-disable],[data-ugc-inspect],[data-ugc-export],[data-ugc-import],[data-ugc-withdraw]');
    if (!button || submitting) return;
    try {
      if(button.dataset.ugcExport){await exportJourney(button.dataset.ugcExport);}
      else if(button.hasAttribute('data-ugc-import')){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);input.onchange=async()=>{try{if(input.files[0])await importJourney(input.files[0]);}catch(error){alert(error.message);}finally{input.remove();}};input.oncancel=()=>input.remove();input.click();}
      else if (button.hasAttribute('data-ugc-new')) { editingId=null; navigate('publish'); }
      else if (button.hasAttribute('data-ugc-mine')) navigate('myjourneys');
      else if (button.hasAttribute('data-ugc-review')) navigate(document.querySelector('#app [data-view="ugcreview"]') ? 'myjourneys' : 'ugcreview');
      else if (button.dataset.ugcWithdraw) {
        const row = rows.get(button.dataset.ugcWithdraw);
        if (!row || row.imported || row.state !== 'approved') throw Error('只能下架自己已发布的 Journey');
        button.disabled = true;
        try {
          if (row.remoteJobId) await post('/api/journeys/' + encodeURIComponent(row.id) + '/status',{status:'disabled'});
          await save({...row,state:'disabled',updatedAt:Date.now()},false);Community.unregister(row.id);emit();
        } finally { button.disabled = false; }
      }
      else if (button.dataset.ugcEdit) { const row = rows.get(button.dataset.ugcEdit); if (!row || row.imported || row.state === 'processing') return; const photos=await originalPhotos(row),next={...row,photos,state:'draft',updatedAt:Date.now()};if(row.initialized){delete next.initialized;delete next.remoteJourney;}editingId=row.id; await save(next,false); if(!row.remoteJobId)Community.unregister(row.id); navigate('publish'); }
      else if (button.dataset.ugcApprove) await reviewRecord(button.dataset.ugcApprove,'approved');
      else if (button.dataset.ugcDisable) await reviewRecord(button.dataset.ugcDisable,'disabled');
      else if (button.dataset.ugcReject) { const feedback = prompt('请填写退回原因，发布者可以据此修改后重新提交'); if (feedback?.trim()) await reviewRecord(button.dataset.ugcReject,'rejected',feedback.trim()); }
      else if (button.dataset.ugcInspect) {
        const row=rows.get(button.dataset.ugcInspect), panel=document.createElement('dialog');
        panel.className='cm-review-dialog'; const urls=row.photos.map(p=>photoUrl(p.screen.blob));
        panel.innerHTML=`<h2>${esc(row.fields.title)}</h2><p>${esc(row.fields.name)} · ${esc(row.fields.region)} · ${esc(row.fields.lat)}, ${esc(row.fields.lng)}</p><p>${esc(row.fields.intro)}</p><p>${row.fields.board==='on'?'场景气泡开启':'场景气泡关闭'}</p><div class="cm-review-photos">${urls.map((src,i)=>`<figure><img src="${src}" alt="第 ${i+1} 张照片"><figcaption>第 ${i+1} 张</figcaption></figure>`).join('')}</div>${questionsOf(row.fields).map((q,i)=>`<p><b>${i+1}. ${esc(q.q)}</b>（第 ${Number(q.sceneIndex)+1} 张）<br>${q.options.map((o,j)=>`${j===Number(q.answer)?'✓ ':''}${esc(o)}`).join(' / ')}<br>${esc(q.explain||'')}</p>`).join('')}<button class="primary" data-review-close>关闭</button>`;
        document.querySelector('#phone').append(panel);panel.showModal();const close=()=>{urls.forEach(URL.revokeObjectURL);panel.remove();};panel.querySelector('button').onclick=()=>panel.close();panel.onclose=close;
      }
    } catch(error) { const box=document.querySelector('[data-ugc-error]');if(box){box.hidden=false;box.textContent=error.message;}else alert(error.message); }
  });
  const ready = (async () => {
    try {
      db = await new Promise((resolve,reject) => { const open=indexedDB.open('tripwonder-ugc',1);open.onupgradeneeded=()=>open.result.createObjectStore('submissions',{keyPath:'id'});open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(Error('无法打开投稿存储，请检查浏览器存储权限')); });
      (await transaction('readonly',store=>store.getAll())).forEach(row=>rows.set(row.id,row));
      try{const editor=JSON.parse(localStorage.getItem('tripwonder-ugc-editor')||'null');if(editor?.id&&(!rows.has(editor.id)||rows.get(editor.id).state==='draft')){editingId=editor.id;const prior=rows.get(editor.id)||{id:editor.id,state:'draft',photos:[],revision:Date.now(),updatedAt:Date.now()};rows.set(editor.id,{...prior,fields:editor.fields});}}catch{}
      for(const row of rows.values()) { try { if(!row.remoteJobId)register(row); } catch { /* An invalid imported record never blocks the game. */ } }
    } catch(error) { storageError=error.message; }
    try { await initializeUpload(); } catch { /* Existing uploads and the game remain available if saving the initial sample fails. */ }
    try { const response=await fetch('/api/status',{signal:AbortSignal.timeout(1500)});backend=response.ok&&(await response.json()).ok===true;if(backend)await refresh(); } catch { backend=false; }
  })();
  window.UGCService = {ready,submit,mountPublish,management,mountManagement,mountFeed,release,refresh,validate,questionsOf,get backend(){return backend;},get records(){return [...rows.values()];}};
})();
