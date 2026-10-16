const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {out,root,sha}=require('../scripts/build.cjs');
test('built bundle contains executable bridge and every checksummed file',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'capawesome-live-update-manifest.json')));
 const bridge=fs.readFileSync(path.join(out,'native.js'),'utf8');
 assert.ok(bridge.startsWith('(()=>'),'compiled JavaScript, not byte-array text');new vm.Script(bridge);
 for(const file of manifest){const bytes=fs.readFileSync(path.join(out,file.href));assert.equal(sha(bytes),file.checksum,file.href);assert.equal(bytes.length,file.sizeInBytes);assert.ok(!file.href.includes('original.'));}
 // 23 official scenes plus the sample community (UGC) scenes in photo-library/ugc.
 const ugc=fs.readdirSync(path.join(root,'photo-library/ugc')).filter(dir=>fs.existsSync(path.join(root,'photo-library/ugc',dir,'original.jpg'))).length;
 const scenes=manifest.filter(f=>f.href.endsWith('/immersive-blur/photo.jpg'));assert.equal(scenes.length,23+ugc);
 for(const file of scenes)assert.equal(file.checksum,sha(fs.readFileSync(path.join(root,file.href))));
});
