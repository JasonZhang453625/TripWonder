import {readFileSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {validateJourney} from './journey.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
// Evaluate only trusted repository content scripts, in the same order as the
// current page. No browser, network, application code or external scripts run.
export function loadExistingJourneys() {
  const window = {};
  const context = vm.createContext({window});
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"?]+)(?:\?[^" ]*)?"/g)]
    .map(match => match[1]).filter(file =>
      ['data.js', 'media-manifest.js', 'catalog.js'].includes(file) || /^content\/[a-z]+\.js$/.test(file));
  for (const file of scripts) vm.runInContext(readFileSync(path.join(root, file), 'utf8'), context, {filename: file, timeout: 1000});
  const cities = JSON.parse(JSON.stringify(window.TRIPWONDER_CATALOG.cities));
  const dictionary = {};
  for (const city of cities) {
    for (const scene of city.scenes) {
      const photo = scene.photo;
      const directory = path.dirname(photo.src);
      const metadata = JSON.parse(readFileSync(path.join(root, directory, 'photo.json'), 'utf8'));
      const filename = typeof photo.original === 'string' ? photo.original : undefined;
      Object.assign(photo, metadata, {
        id: scene.id,
        displaySource: metadata.displaySource || metadata.original,
        sphere: {projection: 'sphere'}
      });
      if (filename) photo.originalFilename = filename;
    }
    dictionary[city.id] = validateJourney(city.id, city);
  }
  return dictionary;
}
