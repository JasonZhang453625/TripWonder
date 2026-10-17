// Export approved database UGC into the same build that ships its media.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function publishedJourneys() {
  if(!fs.existsSync(process.env.TRIPWONDER_DB || path.join(root,'admin/data/tripwonder.db')))return [];
  const {listJourneys}=await import('./db.mjs');
  const {validateJourney}=await import('./pipeline.mjs');
  return listJourneys().filter(j=>j.channel==='ugc'&&j.status==='ready'&&j.review==='approved').map(j=>{
    validateJourney(j);
    const {status,reviewNote,generated,...publicJourney}=j;
    return {...publicJourney,revision:j.generated?.at || j.createdAt};
  });
}
export const publishedScript = journeys => '/* Approved UGC snapshot; updated by the hosting/mobile build. */\nwindow.PUBLISHED_JOURNEYS='+JSON.stringify(journeys)+';\n';
