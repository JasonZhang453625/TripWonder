// Server-side content contract. Existing city documents become journeys unchanged.
export function validateDestinationId(id) {
  if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(id)) {
    throw new TypeError('Invalid destination ID');
  }
}
function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value) { return typeof value === 'string' && value.trim().length > 0; }
function asset(value) {
  return object(value) && text(value.src) &&
    (/^https:\/\//.test(value.src) || /^photo-library\//.test(value.src)) &&
    Number.isInteger(value.width) && value.width > 0 &&
    Number.isInteger(value.height) && value.height > 0;
}
export function validateJourney(id, journey) {
  validateDestinationId(id);
  if (!object(journey) || journey.id !== id || !text(journey.name) ||
      !Array.isArray(journey.scenes) || !Array.isArray(journey.questions)) {
    throw new TypeError('Journey must match its destination and contain name, scenes and questions');
  }
  const sceneIds = new Set();
  for (const scene of journey.scenes) {
    if (!object(scene) || !text(scene.id) || sceneIds.has(scene.id) || !object(scene.photo)) {
      throw new TypeError('Every scene needs a unique ID and a photo');
    }
    sceneIds.add(scene.id);
    const photo = scene.photo;
    if (!asset(photo.original) || !asset(photo.displaySource) ||
        !object(photo.sphere) || photo.sphere.projection !== 'sphere' ||
        (photo.sphere.asset !== undefined && !asset(photo.sphere.asset))) {
      throw new TypeError('Photo needs original, displaySource and sphere configuration');
    }
    if (!Array.isArray(scene.hotspots)) throw new TypeError('Scene hotspots must be an array');
    for (const hotspot of scene.hotspots) {
      if (!object(hotspot) || !Number.isFinite(hotspot.x) || !Number.isFinite(hotspot.y) ||
          hotspot.x < 0 || hotspot.x > 100 || hotspot.y < 0 || hotspot.y > 100 ||
          !text(hotspot.title) || !text(hotspot.text)) {
        throw new TypeError('Hotspot needs photo coordinates (0–100), title and text');
      }
    }
  }
  for (const question of journey.questions) {
    if (!object(question) || !text(question.q) || !Array.isArray(question.options) ||
        question.options.length < 2 || !question.options.every(text) ||
        !Number.isInteger(question.answer) || question.answer < 0 ||
        question.answer >= question.options.length || !text(question.explain) ||
        !sceneIds.has(question.sceneId)) {
      throw new TypeError('Question needs options, a valid answer, explanation and linked scene');
    }
  }
  // Also reject values that would be silently lost or changed by JSON storage.
  const encoded = JSON.stringify(journey, (_key, value) => {
    if (value === undefined || typeof value === 'function' || typeof value === 'symbol' ||
        (typeof value === 'number' && !Number.isFinite(value))) {
      throw new TypeError('Journey must contain only JSON values');
    }
    return value;
  });
  return JSON.parse(encoded);
}

// The current viewer prioritizes original.src. Give it the correctly oriented
// display asset while retaining the untouched source in the database document.
export function toSpherePhoto(photo) {
  const source = photo.sphere?.asset ?? photo.displaySource ?? photo.original;
  if (!asset(source)) throw new TypeError('Missing sphere display asset');
  const hash = source.sha256 || (source.src === photo.original?.src ? photo.sourceSha256 : undefined);
  const result = {...photo, src: source.src, original: {...source},
    width: source.width, height: source.height};
  // A different display file must never inherit the untouched source hash.
  delete result.sourceSha256;
  delete result.version;
  if (hash) Object.assign(result, {sourceSha256: hash, version: hash});
  return result;
}
