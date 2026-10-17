// 张家界四场景。探索阶段不直接公布城市名。
// 素材与事实来源见 photo-library/zhangjiajie/ATTRIBUTION.md。
(() => {
  // BEGIN GENERATED PHOTO METADATA
  const photos = {
  "zjj-tianzishan": {
    "src": "photo-library/zhangjiajie/tianzishan/original.jpg",
    "width": 8841,
    "height": 4415,
    "screen": {
      "src": "photo-library/zhangjiajie/tianzishan/screen.webp",
      "width": 1440,
      "height": 719,
      "bytes": 231098
    },
    "thumb": {
      "src": "photo-library/zhangjiajie/tianzishan/thumb.webp",
      "width": 640,
      "height": 319,
      "bytes": 33160
    },
    "detail": {
      "src": "photo-library/zhangjiajie/tianzishan/detail.webp",
      "width": 2400,
      "height": 1198,
      "bytes": 799758
    },
    "credit": "chensiyuan / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "source": "https://commons.wikimedia.org/wiki/File:1_tianzishan_wulingyuan_zhangjiajie_2012.jpg"
  },
  "zjj-misty-peaks": {
    "id": "zjj-misty-peaks",
    "src": "photo-library/zhangjiajie/misty-peaks/original.jpg",
    "width": 7770,
    "height": 5183,
    "credit": "Joshua Sortino / Unsplash",
    "license": "Unsplash License",
    "licenseUrl": "https://unsplash.com/license",
    "source": "https://unsplash.com/photos/aerial-view-of-mountains-gii7lF4y0WY",
    "thumb": {
      "src": "photo-library/zhangjiajie/misty-peaks/thumb.webp?v=1a4d22ceddfa",
      "width": 640,
      "height": 426,
      "bytes": 23324
    },
    "screen": {
      "src": "photo-library/zhangjiajie/misty-peaks/screen.webp?v=1a4d22ceddfa",
      "width": 1440,
      "height": 960,
      "bytes": 151180
    },
    "detail": {
      "src": "photo-library/zhangjiajie/misty-peaks/detail.webp?v=1a4d22ceddfa",
      "width": 2400,
      "height": 1601,
      "bytes": 565514
    }
  },
  "zjj-tianmen-cave": {
    "id": "zjj-tianmen-cave",
    "src": "photo-library/zhangjiajie/tianmen-cave/original.jpg",
    "width": 4000,
    "height": 3000,
    "credit": "Huangdan2060 / Wikimedia Commons",
    "license": "Public domain (PD-self)",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:Tian_Menshan_Mountain_5.jpg#Licensing",
    "source": "https://commons.wikimedia.org/wiki/File:Tian_Menshan_Mountain_5.jpg",
    "thumb": {
      "src": "photo-library/zhangjiajie/tianmen-cave/thumb.webp?v=1adffd9a4127",
      "width": 640,
      "height": 480,
      "bytes": 58822
    },
    "screen": {
      "src": "photo-library/zhangjiajie/tianmen-cave/screen.webp?v=1adffd9a4127",
      "width": 1440,
      "height": 1080,
      "bytes": 381262
    },
    "detail": {
      "src": "photo-library/zhangjiajie/tianmen-cave/detail.webp?v=1adffd9a4127",
      "width": 2400,
      "height": 1800,
      "bytes": 1177268
    }
  },
  "zjj-winding-road": {
    "id": "zjj-winding-road",
    "src": "photo-library/zhangjiajie/winding-road/original.jpg",
    "width": 4272,
    "height": 2848,
    "credit": "Kovacs Bela-Hungary / Wikimedia Commons",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Zhangjiajie,_Tianmen_mountain_-_panoramio.jpg",
    "thumb": {
      "src": "photo-library/zhangjiajie/winding-road/thumb.webp?v=235add2cd5ff",
      "width": 640,
      "height": 427,
      "bytes": 64890
    },
    "screen": {
      "src": "photo-library/zhangjiajie/winding-road/screen.webp?v=235add2cd5ff",
      "width": 1440,
      "height": 960,
      "bytes": 405298
    },
    "detail": {
      "src": "photo-library/zhangjiajie/winding-road/detail.webp?v=235add2cd5ff",
      "width": 2400,
      "height": 1600,
      "bytes": 1264528
    }
  }
};
  // END GENERATED PHOTO METADATA
  const heritage = 'https://whc.unesco.org/en/list/640/';
  const mountain = 'https://lyj.hunan.gov.cn/tslm_71206/slly/slgy/201512/t20151227_2587623.html';
  const reserve = 'https://lyj.hunan.gov.cn/tslm_71206/slly/zrbhq/201512/t20151227_2587436.html';
  const park = 'https://whhlyt.hunan.gov.cn/whhlyt/english/Tourism/NationalForestParks/202205/t20220530_24762927.html';
  window.CITY_ZHANGJIAJIE = {
    id:'zhangjiajie', name:'张家界', region:'湖南', lat:29.127401, lng:110.479921,
    scenes:[
      {
        id:'zjj-tianzishan', name:'天子山·砂岩峰林', type:'峰林远眺', photo:photos['zjj-tianzishan']
      },
      {
        id:'zjj-misty-peaks', name:'云雾峰林·山间光影', type:'山间光影', photo:photos['zjj-misty-peaks']
      },
      {
        id:'zjj-tianmen-cave', name:'天门山·天门洞', type:'穿山洞门', photo:photos['zjj-tianmen-cave']
      },
      {
        id:'zjj-winding-road', name:'天门山·通天大道', type:'盘山公路', photo:photos['zjj-winding-road']
      }
    ],
    questions:[
      {
        category:'观察', q:'前两处场景中，反复出现的山体形态是哪一种？',
        options:['细长石柱与陡直峰壁成群排列','平缓沙丘连成一片','冰川覆盖的圆形山顶','孤立火山围着圆形湖泊'],
        answer:0, points:20,
        explain:'第一处能看到密集石柱，第二处能看到层层峰壁；陡直而密集的峰林是这两幅山景共同的观察线索。',
        source:'第 1 处 · 像石柱一样站立的山峰'
      },
      {
      q: '岩壁中央那个透出天空的大洞，是怎么形成的？',
      options: ['战争中炸出的缺口', '修索道时打通的', '天然形成的穿山洞口', '人工开凿的隧道'],
      answer: 2, points: 20,
      source: '第 3 处 · 山体中间透出一片天空',
      explain: '岩壁中央是一道天然穿山洞口，属于这座喀斯特山体的自然景观，四周仍是连成一体的陡峭岩壁。'
    },
      {
        category:'推理', q:'第四处公路反复折返，对车辆爬升有什么帮助？',
        options:['让上山路线变成最短直线','把爬升高度分摊到更长路段上','让不同路段都处在同一海拔','使车辆可以不经过任何弯道'],
        answer:1, points:20,
        explain:'反复折返会拉长路线，把同样的高差分摊到更长距离上，避免直接沿陡坡直上。照片中的上下层路段正体现了这种安排。',
        source:'第 4 处 · 一圈又一圈的折返'
      }
    ],
    // Coordinates locate approximate sightseeing areas, not exact photo camera positions.
    // Durations are prototype planning estimates; no opening times or transport inventory is asserted.
    stops:[
      {id:'zjj-tianzishan',name:'天子山景区',lat:29.402,lng:110.441,visitMinutes:180,interests:['自然','摄影'],openingHours:null,note:'从高处看砂岩峰林，景区范围较大，预留步行和景区交通时间。坐标为游览区域参考点。',source:heritage},
      {id:'zjj-yuanjiajie',name:'袁家界景区',lat:29.326,lng:110.445,visitMinutes:180,interests:['自然','摄影'],openingHours:null,note:'沿观景步道看峰壁与山谷，可与天子山结合安排；先核对景区交通与入园路线。',source:park},
      {id:'zjj-jinbian-stream',name:'金鞭溪',lat:29.319,lng:110.437,visitMinutes:150,interests:['自然','摄影'],openingHours:null,note:'溪谷步行段较长，可按体力选择游览长度；坐标为沿线参考点。',source:park},
      {id:'zjj-tianmen-cave',name:'天门山（天门洞与通天大道）',lat:29.052,lng:110.481,visitMinutes:300,interests:['自然','摄影','文化'],openingHours:null,note:'天门洞与通天大道同属天门山景区，可安排在同一天，与武陵源片区分日游览。通天大道是否通行、乘车及洞口游览按所购线路和当日安排。',source:mountain},
      {id:'zjj-huangshizhai',name:'黄石寨',lat:29.327,lng:110.416,visitMinutes:180,interests:['自然','摄影'],openingHours:null,note:'以山顶步行观景为主，先确认上下山方式与返程时间。坐标为山顶区域参考点。',source:park},
      {id:'zjj-yangjiajie',name:'杨家界景区',lat:29.353,lng:110.409,visitMinutes:180,interests:['自然','摄影'],openingHours:null,note:'可作为峰林观景的补充选择，按体力、天气与开放路段调整。坐标为游览区域参考点。',source:park}
    ]
  };
})();
