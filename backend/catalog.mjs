import {validateJourney, toSpherePhoto} from './journey.mjs';
import {connectDatabase} from './database.mjs';

// Both the Vercel export and local database preview use this exact adapter.
export function gameCatalogScript(dictionary) {
  const entries = Object.entries(dictionary);
  if (!entries.length) throw new Error('Journey database is empty; import destination materials first');
  const cities = entries.map(([id, document]) => {
    const journey = validateJourney(id, document);
    for (const scene of journey.scenes) scene.photo = toSpherePhoto(scene.photo);
    return journey;
  });
  const json = JSON.stringify(cities).replaceAll('<', '\\u003c');
  return `/* Generated from the journey database; do not edit. */
(() => {
  const cities = ${json};
  const photoById = new Map();
  for (const city of cities) for (const scene of city.scenes) {
    const photo = scene.photo;
    photoById.set(scene.id, photo);
    if (photo.thumb && photo.screen) window.MEDIA_ASSETS[scene.id] = {
      thumb: photo.thumb, screen: photo.screen, detail: photo.detail || photo.screen
    };
  }
  window.TRIPWONDER_CATALOG = {cities, photoById};
})();
`;
}

export async function databaseCatalogScript({local = false} = {}) {
  const connection = await connectDatabase({local});
  try { return gameCatalogScript(await connection.database.dictionary()); }
  finally { await connection.close(); }
}
