// Rebuild only Shenzhen's reusable Commons assets; never overwrite an existing original.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }

const files = [
  {id:'lianhuashan', title:'File:Statue of Deng Xiaoping in Lianhuashan Park Shenzen China 1310759.jpg'},
  {id:'shenzhen-bay', title:'File:南山 于深圳湾公园遥望香港元朗 01.jpg'},
  {id:'dapeng', title:'File:Dapeng Fortress, Shenzhen (41).jpg',cropAspect:3/4}
];
const ua = 'TripWonder local educational prototype (Commons attribution preserved)';

async function getInfo(title) {
  const endpoint = new URL('https://commons.wikimedia.org/w/api.php');
  endpoint.search = new URLSearchParams({action:'query',format:'json',prop:'imageinfo',iiprop:'url|size|mime|extmetadata',iiurlwidth:'3840',titles:title}).toString();
  const response = await fetch(endpoint, {headers:{'User-Agent':ua}});
  if (!response.ok) throw new Error(`Commons API HTTP ${response.status}: ${title}`);
  const data = await response.json();
  const page = Object.values(data.query.pages)[0];
  if (!page.imageinfo) throw new Error(`No image info: ${title}`);
  return page.imageinfo[0];
}

async function download(url, output) {
  try { await fs.access(output); return; } catch {}
  const response = await fetch(url, {headers:{'User-Agent':ua}});
  if (!response.ok) {const error=new Error(`Image HTTP ${response.status}: ${url}`);error.status=response.status;throw error;}
  const tmp = `${output}.part`;
  try {
    await fs.writeFile(tmp, Buffer.from(await response.arrayBuffer()));
    await fs.rename(tmp, output);
  } catch (error) {
    await fs.rm(tmp,{force:true});
    throw error;
  }
}

(async () => {
  const manifest = [];
  for (const {id,title,cropAspect} of files) {
    const info = await getInfo(title);
    const meta = info.extmetadata;
    if (info.mime !== 'image/jpeg' || meta.LicenseShortName?.value !== 'CC BY-SA 4.0') {
      throw new Error(`Unexpected media or license: ${title} / ${info.mime} / ${meta.LicenseShortName?.value}`);
    }
    const dir = path.join(__dirname,id);
    await fs.mkdir(dir,{recursive:true});
    const original = path.join(dir,'original.jpg');
    let sourceFile = original;
    let completeOriginal = true;
    try { await download(info.url, original); }
    catch (error) {
      if (error.status !== 429 || !info.thumburl) throw error;
      // Wikimedia's original-file endpoint may rate-limit. A documented 3840px
      // Commons rendition keeps the scene usable without pretending it is full source.
      sourceFile = path.join(dir,'source-3840.jpg');
      completeOriginal = false;
      await download(info.thumburl,sourceFile);
    }
    const data = await fs.readFile(sourceFile);
    if (completeOriginal && data.length !== info.size) throw new Error(`Local original size differs from Commons: ${title}`);
    const dimensions = await sharp(data).metadata();
    const originalWidth = dimensions.autoOrient?.width || dimensions.width;
    const originalHeight = dimensions.autoOrient?.height || dimensions.height;
    const cropWidth = cropAspect ? Math.floor(originalHeight*cropAspect) : 0;
    const crop = cropAspect ? {left:Math.floor((originalWidth-cropWidth)/2),top:0,width:cropWidth,height:originalHeight} : null;
    // The portrait master remains fixed even after a later full-resolution
    // source download, so scene coordinates and viewer sizing never drift.
    const width = crop ? 1920 : originalWidth;
    const height = crop ? 2561 : originalHeight;
    if (width < 1080 || height/width < 4/3 || height/width > 16/9) {
      throw new Error(`Display aspect outside 3:4–9:16: ${title}: ${width}x${height}`);
    }
    const displayPath = crop ? path.join(dir,'portrait.jpg') : sourceFile;
    if (crop) await sharp(data).rotate().extract(crop).resize({width,height,fit:'cover'}).jpeg({quality:90,mozjpeg:true}).toFile(displayPath);
    const derivatives = {};
    for (const [kind,targetWidth,quality] of [['screen',1080,84],['thumb',480,76],['detail',1600,86]]) {
      const target = path.join(dir,`${kind}.webp`);
      const result = await sharp(displayPath).rotate().resize({width:targetWidth,withoutEnlargement:true}).webp({quality,effort:5}).toFile(target);
      derivatives[kind] = {path:`photo-library/shenzhen/${id}/${kind}.webp`,width:result.width,height:result.height,bytes:result.size};
    }
    manifest.push({id,title,source:info.descriptionurl,license:meta.LicenseShortName.value,licenseUrl:meta.LicenseUrl.value,artist:(meta.Artist?.value||'').replace(/<[^>]*>/g,'').trim(),sourceFile:{path:`photo-library/shenzhen/${id}/${path.basename(sourceFile)}`,fullResolution:completeOriginal,width:originalWidth,height:originalHeight,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')},remoteOriginal:{url:info.url,width:info.width,height:info.height,bytes:info.size},display:{path:`photo-library/shenzhen/${id}/${path.basename(displayPath)}`,width,height,crop},derivatives,change:crop?'Central 3:4 portrait crop for display, then WebP downscale; local source file preserved':'WebP downscale only; local source file preserved'});
    console.log(`${id}: display ${width}x${height}, source ${originalWidth}x${originalHeight} ${data.length} bytes${completeOriginal?' full':' 3840px rendition'}, screen ${derivatives.screen.bytes} bytes`);
  }
  await fs.writeFile(path.join(__dirname,'SOURCES.json'),JSON.stringify(manifest,null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1});
