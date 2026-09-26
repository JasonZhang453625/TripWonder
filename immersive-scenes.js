// Every scene uses the ORIGINAL photo only, with a soft blurred projection outside its edges
// (no AI periphery). Scale, yaw and pitch limits are fitted per viewport by ImmersivePhotoViewer:
// the photo keeps its true proportions, its full height fits the screen at zoom 1, and turning
// reaches every edge of the photo plus the blur margin.
// Assets: node build-immersive-assets.cjs <id> <dir with photo.jpg, 1600 px tall> none
const BLUR_SCENE = {periphery: 'blur', blurMargin: .12, blurFeather: .004, radius: 8, walkX: .07};

window.IMMERSIVE_SCENES = {
  yungang: {
    ...BLUR_SCENE,
    id: 'yungang',
    assetScript: 'immersive-yungang-assets.js?v=20260926-540d5820',
    sourceAspect: 0.75
  },
  huayan: {
    ...BLUR_SCENE,
    id: 'huayan',
    assetScript: 'immersive-huayan-assets.js?v=20260926-56600ae1',
    sourceAspect: 0.5625
  },
  xuankong: {
    ...BLUR_SCENE,
    id: 'xuankong',
    assetScript: 'immersive-xuankong-assets.js?v=20260926-d9dcc0b3',
    sourceAspect: 1.5
  },
  'sz-futian': {
    ...BLUR_SCENE,
    id: 'sz-futian',
    assetScript: 'immersive-sz-futian-assets.js?v=20260926-80ccb40a',
    sourceAspect: 1.5,
    focusX: 0.64
  },
  'sz-houhai': {
    ...BLUR_SCENE,
    id: 'sz-houhai',
    assetScript: 'immersive-sz-houhai-assets.js?v=20260926-92acd1ac',
    sourceAspect: 2.47875,
    focusX: 0.53
  },
  'sz-qianhai': {
    ...BLUR_SCENE,
    id: 'sz-qianhai',
    assetScript: 'immersive-sz-qianhai-assets.js?v=20260926-ca30e868',
    sourceAspect: 1.5,
    focusX: 0.36
  },
  'hk-peak': {
    ...BLUR_SCENE,
    id: 'hk-peak',
    assetScript: 'immersive-hk-peak-assets.js?v=20260926-94113fde',
    sourceAspect: 1.5,
    focusX: 0.56
  },
  'hk-star-ferry': {
    ...BLUR_SCENE,
    id: 'hk-star-ferry',
    assetScript: 'immersive-hk-star-ferry-assets.js?v=20260926-10049c28',
    sourceAspect: 1.333125
  },
  'hk-sham-shui-po': {
    ...BLUR_SCENE,
    id: 'hk-sham-shui-po',
    assetScript: 'immersive-hk-sham-shui-po-assets.js?v=20260926-fb91cb22',
    sourceAspect: 1.5
  },
  'gl-xingping': {
    ...BLUR_SCENE,
    id: 'gl-xingping',
    assetScript: 'immersive-gl-xingping-assets.js?v=20260926-be15bd55',
    sourceAspect: 1.5
  },
  'gl-yulong': {
    ...BLUR_SCENE,
    id: 'gl-yulong',
    assetScript: 'immersive-gl-yulong-assets.js?v=20260926-033e9279',
    sourceAspect: 1.628125
  },
  'gl-longji': {
    ...BLUR_SCENE,
    id: 'gl-longji',
    assetScript: 'immersive-gl-longji-assets.js?v=20260926-6ab6cc55',
    sourceAspect: 1.333125
  },
  'suzhou-huqiu': {
    ...BLUR_SCENE,
    id: 'suzhou-huqiu',
    assetScript: 'immersive-suzhou-huqiu-assets.js?v=20260926-565695c6',
    sourceAspect: 0.75
  },
  'bj-zhengyangmen': {
    ...BLUR_SCENE,
    id: 'bj-zhengyangmen',
    assetScript: 'immersive-bj-zhengyangmen-assets.js?v=20260926-44f798f1',
    sourceAspect: 1.333125
  },
  'bj-hongyige': {
    ...BLUR_SCENE,
    id: 'bj-hongyige',
    assetScript: 'immersive-bj-hongyige-assets.js?v=20260926-5347af30',
    sourceAspect: 1.5,
    focusX: 0.58
  },
  'bj-beihai': {
    ...BLUR_SCENE,
    id: 'bj-beihai',
    assetScript: 'immersive-bj-beihai-assets.js?v=20260926-28ffecdc',
    sourceAspect: 1.5
  },
  'sh-bund': {
    ...BLUR_SCENE,
    id: 'sh-bund',
    assetScript: 'immersive-sh-bund-assets.js?v=20260926-213bb1fe',
    sourceAspect: 1.5
  },
  'sh-lujiazui': {
    ...BLUR_SCENE,
    id: 'sh-lujiazui',
    assetScript: 'immersive-sh-lujiazui-assets.js?v=20260926-546b020e',
    sourceAspect: 1.5
  },
  'sh-bund-night': {
    ...BLUR_SCENE,
    id: 'sh-bund-night',
    assetScript: 'immersive-sh-bund-night-assets.js?v=20260926-e839282e',
    sourceAspect: 1.5
  }
};
