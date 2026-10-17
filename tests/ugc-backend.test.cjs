const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const sharp=require('sharp');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
test('self-authored upload → one generation job → review → publication → return and resubmit',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tripwonder-ugc-test-'));let server;
 try{
  fs.mkdirSync(path.join(dir,'admin'),{recursive:true});
  for(const file of ['server.mjs','db.mjs','pipeline.mjs','mimo.mjs','export.mjs'])fs.copyFileSync(path.join(root,'admin',file),path.join(dir,'admin',file));
  for(const file of ['ugc-contract.js','quiz-rules.js'])fs.copyFileSync(path.join(root,file),path.join(dir,file));
  const net=require('node:net'),probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
  const base=`http://127.0.0.1:${port}`;let logs='';
  server=cp.spawn(process.execPath,['admin/server.mjs'],{cwd:dir,windowsHide:true,env:{...process.env,NODE_PATH:path.join(root,'node_modules'),PORT:String(port),TRIPWONDER_DB:path.join(dir,'admin/data/test.db'),MIMO_BASE_URL:'http://127.0.0.1:1',MIMO_API_KEY:'not-used-for-self-authored'}});
  server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
  async function api(route,body){const r=await fetch(base+route,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);return {status:r.status,data:await r.json()};}
  for(let n=0;n<100;n++){try{await api('/api/status');break;}catch{await delay(50);}}
  const bytes=await sharp({create:{width:1200,height:800,channels:3,background:'#8899aa'}}).jpeg().toBuffer();
  async function upload(){const r=await fetch(base+'/api/uploads',{method:'POST',body:bytes});assert.equal(r.status,200);return(await r.json()).uploadId;}
  const scenes=[];for(let i=0;i<3;i++)scenes.push({uploadId:await upload(),name:`照片 ${i+1}`,filename:`${i}.jpg`});
  const questions=[0,1,2].map(i=>({q:`第${i+1}张照片最明显的景观是什么？`,options:['建筑街道','雪山冰川','沙漠公路','森林营地'],answer:i%2,sceneIndex:i,explain:'这是发布者亲自填写的解析。'}));
  const input={id:'ugc-test-submission',channel:'ugc',name:'测试海湾',region:'福建',title:'沿水慢行的周末',intro:'观察画面中的细节。',author:'发布者',lat:24.4,lng:118.1,boardEnabled:false,scenes,questions};
  const first=await api('/api/journeys',input);assert.equal(first.status,202);
  const duplicate=await api('/api/journeys',input);assert.equal(duplicate.status,409,'duplicate submissions must not create another job');
  async function done(id){for(let i=0;i<200;i++){const j=(await api('/api/jobs/'+id)).data;assert.equal(j.destinationId,input.id);if(j.status==='failed')throw Error(j.error);if(j.status==='done')return j;await delay(25);}throw Error('Job timeout '+logs);}
  await done(first.data.jobId);
  const saved=(await api('/api/journeys/'+input.id)).data;
  assert.deepEqual(saved.questions.map(q=>q.q),questions.map(q=>q.q));assert.deepEqual(saved.questions.map(q=>q.answer),questions.map(q=>q.answer));assert.equal(saved.boardEnabled,false);
  for(const s of saved.scenes)assert.ok(fs.existsSync(path.join(dir,path.dirname(s.photo.original.src),'immersive-blur/photo.jpg')));
  const visible=async()=> (await fetch(base+'/db-journeys.js').then(r=>r.text())).includes(input.id);
  assert.equal(await visible(),false);
  assert.equal((await api(`/api/journeys/${input.id}/review`,{review:'approved'})).status,200);assert.equal(await visible(),true);
  const exported=JSON.parse(cp.execFileSync(process.execPath,['--input-type=module','-e',"import {publishedJourneys} from './admin/export.mjs';console.log(JSON.stringify(await publishedJourneys()))"],{cwd:dir,env:{...process.env,NODE_PATH:path.join(root,'node_modules'),TRIPWONDER_DB:path.join(dir,'admin/data/test.db')}}).toString());
  assert.equal(exported[0].id,input.id);assert.equal(exported[0].review,'approved');assert.equal(exported[0].questions[0].q,questions[0].q);
  assert.equal((await api(`/api/journeys/${input.id}/review`,{review:'rejected',note:'补充图片依据'})).status,200);assert.equal(await visible(),false);
  const review=(await api('/api/journeys')).data.journeys[0];assert.equal(review.reviewNote,'补充图片依据');
  for(const s of scenes)s.uploadId=await upload();
  const second=await api('/api/journeys',{...input,resubmit:true,questions:questions.map(q=>({...q,explain:'修改后重提的原始解析。'}))});assert.equal(second.status,202);await done(second.data.jobId);
  const revised=(await api('/api/journeys/'+input.id)).data;assert.equal(revised.questions[0].explain,'修改后重提的原始解析。');assert.equal(await visible(),false);
  assert.equal((await api(`/api/journeys/${input.id}/review`,{review:'approved'})).status,200);assert.equal(await visible(),true);
  assert.equal((await api(`/api/journeys/${input.id}/status`,{status:'disabled'})).status,200);assert.equal(await visible(),false);
 }finally{
  if(server){server.kill();await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve));}
  const absolute=path.resolve(dir);assert.ok(absolute.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(absolute).startsWith('tripwonder-ugc-test-'));
  fs.rmSync(absolute,{recursive:true,force:true});
 }
});

test('self-authored quiz contract rejects missing answers, duplicate choices, spoilers and invalid scene links',()=>{
 const {questions}=require('../ugc-contract.js');
 const valid=[0,1,2].map(i=>({q:'眼前的画面有什么主要特征？',options:['建筑','雪山','森林','沙漠'],answer:i,sceneIndex:i}));
 assert.equal(questions(valid,9,'海湾','福建').length,3);
 for(const mutation of [q=>q.answer=null,q=>q.options=['相同','相同','森林','沙漠'],q=>q.q='福建的画面有什么主要特征？',q=>q.sceneIndex=9]){const rows=structuredClone(valid);mutation(rows[0]);assert.throws(()=>questions(rows,9,'海湾','福建'));}
 const duplicate=structuredClone(valid);duplicate[1].sceneIndex=0;assert.throws(()=>questions(duplicate,9,'海湾','福建'),/不同/);
});
