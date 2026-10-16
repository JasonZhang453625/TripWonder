// 张家界四场景。线索点采用完整原片百分比；探索阶段不直接公布城市名。
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
        id:'zjj-tianzishan', name:'天子山·砂岩峰林', type:'峰林远眺', photo:photos['zjj-tianzishan'],
        hotspots:[
          {
            x:48, y:48, title:'像石柱一样站立的山峰', tag:'自然',
            text:'眼前许多山峰细长而陡直，像一根根石柱从谷地里竖起来。这片风景以石英砂岩峰林著称，和常见的圆缓山丘很不一样。留意石峰之间深深的空隙。',
            en:'Many peaks rise like slender stone pillars, separated by deep gaps. Quartz sandstone towers define this landscape, unlike gently rounded hills.',
            source:heritage
          },
          {
            x:59, y:27, title:'越远越淡的山影', tag:'摄影',
            text:'近处能分辨岩壁与树丛，远处的山峰逐渐变成浅蓝灰色轮廓。把前后的峰林放在一起看，云雾便把山谷的纵深显现出来。',
            en:'Nearby cliffs show rock and trees, while distant peaks fade into pale blue-grey silhouettes. The mist makes the depth of the valley visible.',
            source:'photo-library/zhangjiajie/tianzishan/original.jpg'
          },
          {
            x:43, y:75, title:'石峰脚下的绿色谷地', tag:'自然',
            text:'峰脚和谷地铺满绿色，许多峰顶也长着树。这里的风景不仅有裸露的石柱，还有与峰林相伴的森林和沟谷，共同组成层次丰富的自然景观。',
            en:'Green forest covers the valleys and even many summit tops. The woodland and ravines are as much a part of the landscape as the stone pillars.',
            source:heritage
          }
        ]
      },
      {
        id:'zjj-misty-peaks', name:'云雾峰林·山间光影', type:'山间光影', photo:photos['zjj-misty-peaks'],
        hotspots:[
          {
            x:63, y:30, title:'光照到的那一面', tag:'摄影',
            text:'山峰的一侧泛着暖色，另一侧藏在阴影里。沿着明暗交界看，原本叠在一起的山峰就有了清楚的前后层次；一张照片也能让人感到山谷很深。',
            en:'Warm light touches one face of the peaks while the other stays in shadow. Follow that boundary to separate the overlapping layers of the valley.',
            source:'photo-library/zhangjiajie/misty-peaks/original.avif'
          },
          {
            x:50, y:66, title:'一排排岩壁向远处延伸', tag:'自然',
            text:'近处山体像一面陡直的石墙，后面还有好几排峰壁。试着左右拖动画面，对照上一处的一根根石柱，看看同一片山地还有哪些不同轮廓。',
            en:'A steep wall of rock fills the foreground, followed by more rows of peaks. Pan sideways and compare these walls with the separate pillars in the previous scene.',
            source:'photo-library/zhangjiajie/misty-peaks/original.avif'
          },
          {
            x:76, y:79, title:'近在眼前的枝叶', tag:'摄影',
            text:'右下方的枝叶离镜头最近，远山则被薄雾包围。前景、岩峰、远山形成三层画面；把照片缩小一些，这种远近关系会更容易观察。',
            en:'Leaves in the lower right sit closest to the camera, followed by cliffs and distant misty peaks. Zoom out a little to compare these three layers.',
            source:'photo-library/zhangjiajie/misty-peaks/original.avif'
          }
        ]
      },
      {
        id:'zjj-tianmen-cave', name:'天门山·天门洞', type:'穿山洞门', photo:photos['zjj-tianmen-cave'],
        hotspots:[
          {
            x:50, y:42, title:'山体中间透出一片天空', tag:'自然',
            text:'抬头看，岩壁中央出现了一道天然穿山洞口，里面透出明亮的天空。它属于这座喀斯特山体的自然景观，洞口周围仍是连成一体的陡峭岩壁。',
            en:'A natural opening passes through the mountain, revealing the sky beyond. The cave belongs to a karst landscape and is framed by continuous steep cliffs.',
            source:reserve
          },
          {
            x:50, y:71, title:'通往洞口的九百九十九级', tag:'文化',
            text:'这条直通洞口的长台阶叫“上天梯”，共 999 级。台阶中间设置了休息平台，也寄托了登高祈福的寓意。画面里密密的小人，让这段高度有了直观的参照。',
            en:'The stairway leading to the cave has 999 steps and rest platforms along the ascent. It is also associated with prayers for good fortune; the visitors reveal its scale.',
            source:mountain
          },
          {
            x:73, y:26, title:'从砂岩峰林走到岩溶绝壁', tag:'自然',
            text:'这里的岩壁与前面细长的峰林并不相同：前面是石英砂岩峰林，这一带则是喀斯特岩溶地貌。观察连续的崖面与天然洞口，是区分两类山景的一个线索。',
            en:'This continuous cliff and its natural opening differ from the quartz sandstone pillars seen earlier. Here the landscape is karst, offering another clue to its geology.',
            source:reserve
          }
        ]
      },
      {
        id:'zjj-winding-road', name:'天门山·通天大道', type:'盘山公路', photo:photos['zjj-winding-road'],
        hotspots:[
          {
            x:53, y:57, title:'一圈又一圈的折返', tag:'推理',
            text:'公路没有直冲山顶，而是绕着山体反复折返。对同样的爬升高度来说，路线拉长后，爬升可以分摊到更长的路段上。顺着弯道找一找：哪一段在上，哪一段在下？',
            en:'Instead of heading straight uphill, the road doubles back around the mountain. A longer route spreads the same elevation gain over more distance. Trace which section runs above the next.',
            source:'photo-library/zhangjiajie/winding-road/original.jpg'
          },
          {
            x:72, y:44, title:'路面下面藏着一个拱洞', tag:'建筑',
            text:'右侧上层公路下方有一个明显的拱洞，下层路段从它附近绕过。石砌挡墙把不同高度的路面托起来，让道路在狭窄的山坡上继续延伸。',
            en:'A visible arch sits beneath the upper road on the right. Stone retaining walls support the stacked road sections as they wind around the steep slope.',
            source:'photo-library/zhangjiajie/winding-road/original.jpg'
          },
          {
            x:29, y:55, title:'九十九道弯通向哪里', tag:'文化',
            text:'这条山路因通往前一处的天然洞门而得名，全长约 10.77 公里，有 99 道弯。照片只截取了其中一段，远处还能看见公路继续钻进绿色山谷。',
            en:'This road leads toward the natural gate from the previous scene. It is about 10.77 kilometres long with 99 bends; the photograph shows only part of its route.',
            source:mountain
          }
        ]
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
