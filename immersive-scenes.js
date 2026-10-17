// Source dimensions are decoded at runtime. Every scene uses a finite sphere-interior
// photo patch with a fixed center viewpoint; legacy portrait photos remain supported.
const SPHERE_SCENE = {projection: 'sphere', periphery: 'sphere'};

window.IMMERSIVE_SCENES = {
  'yungang': {
    ...SPHERE_SCENE,
    id: 'yungang',
    assetScript: 'immersive-yungang-assets.js?v=e642543cb183',
    sourceUrl: 'photo-library/datong/yungang/immersive-blur/photo.jpg?v=e642543cb183',
    sourceAspect: 1.5,
    focusX: 0.5
  },
  'huayan': {
    ...SPHERE_SCENE,
    id: 'huayan',
    assetScript: 'immersive-huayan-assets.js?v=b11f3c21a825',
    sourceUrl: 'photo-library/datong/huayan/immersive-blur/photo.jpg?v=b11f3c21a825',
    sourceAspect: 1.5,
    focusX: 0.5
  },
  xuankong: {
    ...SPHERE_SCENE,
    id: 'xuankong',
    assetScript: 'immersive-xuankong-assets.js?v=aa45bd9550ff',
    sourceUrl: 'photo-library/datong/xuankong/immersive-blur/photo.jpg?v=aa45bd9550ff',
    sourceAspect: 1.5
  },
  'sz-futian': {
    ...SPHERE_SCENE,
    id: 'sz-futian',
    assetScript: 'immersive-sz-futian-assets.js?v=eb487325031a',
    sourceUrl: 'photo-library/shenzhen/futian/immersive-blur/photo.jpg?v=eb487325031a',
    sourceAspect: 1.5,
    focusX: 0.25
  },
  'sz-houhai': {
    ...SPHERE_SCENE,
    id: 'sz-houhai',
    assetScript: 'immersive-sz-houhai-assets.js?v=6965ecd58c4d',
    sourceUrl: 'photo-library/shenzhen/houhai/immersive-blur/photo.jpg?v=6965ecd58c4d',
    sourceAspect: 1.5,
    focusX: 0.53
  },
  'sz-qianhai': {
    ...SPHERE_SCENE,
    id: 'sz-qianhai',
    assetScript: 'immersive-sz-qianhai-assets.js?v=3c38385a7837',
    sourceUrl: 'photo-library/shenzhen/qianhai/immersive-blur/photo.jpg?v=3c38385a7837',
    sourceAspect: 1.5,
    focusX: 0.36
  },
  'hk-peak': {
    ...SPHERE_SCENE,
    id: 'hk-peak',
    assetScript: 'immersive-hk-peak-assets.js?v=3e6b791cb267',
    sourceUrl: 'photo-library/hongkong/peak/immersive-blur/photo.jpg?v=3e6b791cb267',
    sourceAspect: 1.5,
    focusX: 0.56
  },
  'hk-star-ferry': {
    ...SPHERE_SCENE,
    id: 'hk-star-ferry',
    assetScript: 'immersive-hk-star-ferry-assets.js?v=b4ad9a8754b1',
    sourceUrl: 'photo-library/hongkong/star-ferry/immersive-blur/photo.jpg?v=b4ad9a8754b1',
    sourceAspect: 1.3333333333333333
  },
  'hk-sham-shui-po': {
    ...SPHERE_SCENE,
    id: 'hk-sham-shui-po',
    assetScript: 'immersive-hk-sham-shui-po-assets.js?v=a39cbf6b2fcd',
    sourceUrl: 'photo-library/hongkong/sham-shui-po/immersive-blur/photo.jpg?v=a39cbf6b2fcd',
    sourceAspect: 1.500133654103181
  },
  'gl-xingping': {
    ...SPHERE_SCENE,
    id: 'gl-xingping',
    assetScript: 'immersive-gl-xingping-assets.js?v=6db15dfcd91b',
    sourceUrl: 'photo-library/guilin/xingping/immersive-blur/photo.jpg?v=6db15dfcd91b',
    sourceAspect: 1.5
  },
  'gl-yulong': {
    ...SPHERE_SCENE,
    id: 'gl-yulong',
    assetScript: 'immersive-gl-yulong-assets.js?v=b0fdfdba40c6',
    sourceUrl: 'photo-library/guilin/yulong/immersive-blur/photo.jpg?v=b0fdfdba40c6',
    sourceAspect: 1.6280206353516156
  },
  'gl-longji': {
    ...SPHERE_SCENE,
    id: 'gl-longji',
    assetScript: 'immersive-gl-longji-assets.js?v=d6824007fc07',
    sourceUrl: 'photo-library/guilin/longji/immersive-blur/photo.jpg?v=d6824007fc07',
    sourceAspect: 1.3333333333333333
  },
  'suzhou-huqiu': {
    ...SPHERE_SCENE,
    id: 'suzhou-huqiu',
    assetScript: 'immersive-suzhou-huqiu-assets.js?v=cdbe124a1678',
    sourceUrl: 'photo-library/suzhou/huqiu/immersive-blur/photo.jpg?v=cdbe124a1678',
    sourceAspect: 1.3333333333333333,
    focusX: 0.47
  },
  'bj-zhengyangmen': {
    ...SPHERE_SCENE,
    id: 'bj-zhengyangmen',
    assetScript: 'immersive-bj-zhengyangmen-assets.js?v=8ba032d363f1',
    sourceUrl: 'photo-library/beijing/zhengyangmen/immersive-blur/photo.jpg?v=8ba032d363f1',
    sourceAspect: 1.3333333333333333
  },
  'bj-hongyige': {
    ...SPHERE_SCENE,
    id: 'bj-hongyige',
    assetScript: 'immersive-bj-hongyige-assets.js?v=efb1331c8ea9',
    sourceUrl: 'photo-library/beijing/hongyige/immersive-blur/photo.jpg?v=efb1331c8ea9',
    sourceAspect: 1.4999081388939923,
    focusX: 0.58
  },
  'bj-beihai': {
    ...SPHERE_SCENE,
    id: 'bj-beihai',
    assetScript: 'immersive-bj-beihai-assets.js?v=7721d65f08b9',
    sourceUrl: 'photo-library/beijing/beihai/immersive-blur/photo.jpg?v=7721d65f08b9',
    sourceAspect: 1.5
  },
  'sh-bund': {
    ...SPHERE_SCENE,
    id: 'sh-bund',
    assetScript: 'immersive-sh-bund-assets.js?v=bb10216797f1',
    sourceUrl: 'photo-library/shanghai/bund/immersive-blur/photo.jpg?v=bb10216797f1',
    sourceAspect: 1.5
  },
  'sh-lujiazui': {
    ...SPHERE_SCENE,
    id: 'sh-lujiazui',
    assetScript: 'immersive-sh-lujiazui-assets.js?v=05e3957a5220',
    sourceUrl: 'photo-library/shanghai/lujiazui/immersive-blur/photo.jpg?v=05e3957a5220',
    sourceAspect: 1.4999110794949315
  },
  'sh-bund-night': {
    ...SPHERE_SCENE,
    id: 'sh-bund-night',
    assetScript: 'immersive-sh-bund-night-assets.js?v=5991dd75f496',
    sourceUrl: 'photo-library/shanghai/bund-night/immersive-blur/photo.jpg?v=5991dd75f496',
    sourceAspect: 1.5
  },
  'zjj-tianzishan': {
    ...SPHERE_SCENE,
    id: 'zjj-tianzishan',
    assetScript: 'immersive-zjj-tianzishan-assets.js?v=b5cef2b54754',
    sourceUrl: 'photo-library/zhangjiajie/tianzishan/immersive-blur/photo.jpg?v=b5cef2b54754',
    sourceAspect: 2.0024915062287656,
    focusX: 0.48
  },
  'zjj-misty-peaks': {
    ...SPHERE_SCENE,
    id: 'zjj-misty-peaks',
    assetScript: 'immersive-zjj-misty-peaks-assets.js?v=1a4d22ceddfa',
    sourceUrl: 'photo-library/zhangjiajie/misty-peaks/immersive-blur/photo.jpg?v=1a4d22ceddfa',
    sourceAspect: 1.4991317769631487,
    focusX: 0.62
  },
  'zjj-tianmen-cave': {
    ...SPHERE_SCENE,
    id: 'zjj-tianmen-cave',
    assetScript: 'immersive-zjj-tianmen-cave-assets.js?v=1adffd9a4127',
    sourceUrl: 'photo-library/zhangjiajie/tianmen-cave/immersive-blur/photo.jpg?v=1adffd9a4127',
    sourceAspect: 1.3333333333333333,
    focusX: 0.5
  },
  'zjj-winding-road': {
    ...SPHERE_SCENE,
    id: 'zjj-winding-road',
    assetScript: 'immersive-zjj-winding-road-assets.js?v=235add2cd5ff',
    sourceUrl: 'photo-library/zhangjiajie/winding-road/immersive-blur/photo.jpg?v=235add2cd5ff',
    sourceAspect: 1.5,
    focusX: 0.55
  },
  'suzhou-zhuozheng': {
    ...SPHERE_SCENE,
    id: 'suzhou-zhuozheng',
    assetScript: 'immersive-suzhou-zhuozheng-assets.js?v=d149166470e7',
    sourceUrl: 'photo-library/suzhou/zhuozheng/immersive-blur/photo.jpg?v=d149166470e7',
    sourceAspect: 1.49800796812749
  },
  'suzhou-shantang': {
    ...SPHERE_SCENE,
    id: 'suzhou-shantang',
    assetScript: 'immersive-suzhou-shantang-assets.js?v=5339db97fd0d',
    sourceUrl: 'photo-library/suzhou/shantang/immersive-blur/photo.jpg?v=5339db97fd0d',
    sourceAspect: 1.3333333333333333,
    focusX: 0.26
  }
};
