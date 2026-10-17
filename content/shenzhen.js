// 深圳关卡。探索文字不直接说出城市名；坐标为原片百分比（photo.src 的完整画面）。
// 照片来自 Pexels 与用户提供的原图，来源与处理记录见 photo-library/shenzhen/ATTRIBUTION.md。
window.CITY_SHENZHEN = {
  id: 'shenzhen',
  name: '深圳',
  region: '广东',
  lat: 22.5431,
  lng: 114.0579,
  scenes: [
    {
      id: 'sz-futian',
      name: '福田中心区·平安金融中心',
      type: '城市天际线',
      photo: {
  "id": "sz-futian",
  "src": "photo-library/shenzhen/futian/original.jpg",
  "width": 4608,
  "height": 3072,
  "credit": "Chris from Shenzhen, China / Wikimedia Commons",
  "license": "CC BY-SA 2.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
  "source": "https://commons.wikimedia.org/wiki/File:Ping_An_Finance_Centre_Shenzhen_city_China_(36461945211).jpg",
  "thumb": {
    "src": "photo-library/shenzhen/futian/thumb.webp?v=eb487325031a",
    "width": 640,
    "height": 427,
    "bytes": 13160
  },
  "screen": {
    "src": "photo-library/shenzhen/futian/screen.webp?v=eb487325031a",
    "width": 1440,
    "height": 960,
    "bytes": 69628
  },
  "detail": {
    "src": "photo-library/shenzhen/futian/detail.webp?v=eb487325031a",
    "width": 2400,
    "height": 1600,
    "bytes": 289490
  }
}
    },
    {
      id: 'sz-houhai',
      name: '深圳·城市夜色',
      type: '高处俯瞰',
      photo: {
        src: 'photo-library/shenzhen/houhai/original.png',
        width: 7002,
        height: 4668,
        screen: { src: 'photo-library/shenzhen/houhai/screen.webp?v=20260926-a71cb979', width: 1440, height: 960 },
        thumb: { src: 'photo-library/shenzhen/houhai/thumb.webp?v=20260926-a71cb979', width: 640, height: 427 },
        detail: { src: 'photo-library/shenzhen/houhai/detail.webp?v=20260926-a71cb979', width: 2400, height: 1600 },
        credit: '用户提供',
        license: '',
        licenseUrl: '',
        source: ''
      }
    },
    {
      id: 'sz-qianhai',
      name: '前海·欢乐港湾',
      type: '滨海新城',
      photo: {
        src: 'photo-library/shenzhen/qianhai/original.jpg',
        width: 5019,
        height: 3346,
        screen: { src: 'photo-library/shenzhen/qianhai/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/shenzhen/qianhai/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/shenzhen/qianhai/detail.webp', width: 2400, height: 1600 },
        credit: 'ainc-t / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/34947074/'
      }
    }
  ],
  questions: [
  {
    "q": "第一处场景中，最高楼与周围建筑相比有什么明显特征？",
    "options": [
      "只有一层，向两侧铺开",
      "塔身细长，顶部逐渐收尖",
      "顶部是巨大的圆形穹顶",
      "整体是横跨两岸的桥梁"
    ],
    "answer": 1,
    "points": 20,
    "source": "第 1 处 · 最高的那根“针”",
    "explain": "最高的塔楼明显高于周围楼群，立面细长，塔冠逐渐收尖。"
  },
  {
    "category": "观察",
    "q": "第二处夜景中，前后两片楼群之间起伏的暗色轮廓是什么？",
    "options": [
      "覆盖着树木的山脊",
      "平坦开阔的海面",
      "沿岸排列的码头",
      "规则矩形的运动场"
    ],
    "answer": 0,
    "points": 30,
    "explain": "画面中部的暗色轮廓有起伏的山坡和树木，前后分布着亮灯的楼群，左侧还有弯曲的道路，这是一道覆盖着树木的山脊。",
    "source": "第2处 · 楼群之间的山脊"
  },
  {
    "q": "第三处摩天轮在夜里变色，主要靠什么？",
    "options": [
      "轮廓和辐条上的全彩 LED 灯",
      "水面反射的月光",
      "轿厢里的霓虹招牌",
      "周围大楼的探照灯"
    ],
    "answer": 0,
    "points": 40,
    "explain": "摩天轮的双面轮廓与 112 道辐条都使用全彩 LED 灯光矩阵，所以整座轮子能变换颜色。",
    "source": "https://www.sznews.com/content/mb/2021-04/22/content_24154597.htm"
  }
],
  stops: [
    {
      id: 'sz-stop-futian', name: '平安金融中心云际观光层', lat: 22.5333, lng: 114.0553,
      visitMinutes: 90, interests: ['建筑', '摄影'], openingHours: null,
      note: '第 116 层，约 541 米；需购票，开放时段以官方当日公告为准。',
      source: 'http://ifutian.sznews.com/content/2018-03/09/content_18638064.htm'
    },
    {
      id: 'shenzhen-lianhuashan', name: '莲花山公园山顶广场', lat: 22.555966, lng: 114.05426,
      visitMinutes: 90, interests: ['自然', '摄影'], openingHours: '06:00–23:00，22:30 停止入园',
      note: '中心区北端的城市公园，山顶可回望中心区天际线；有上坡步行。',
      source: 'https://cgj.sz.gov.cn/xsmh/gysz/twf/etly/content/post_10841730.html'
    },
    {
      id: 'sz-stop-houhai', name: '深圳湾体育中心“春茧”', lat: 22.5174, lng: 113.9446,
      visitMinutes: 45, interests: ['建筑', '摄影'], openingHours: null,
      note: '后海片区滨海带中段，外观可随时看；场馆内部开放以赛事与活动安排为准。',
      source: 'https://www.szns.gov.cn/mlns/whns/tycg/content/post_12589347.html'
    },
    {
      id: 'shenzhen-bay', name: '深圳湾公园', lat: 22.498, lng: 113.947,
      visitMinutes: 80, interests: ['自然', '摄影'], openingHours: '06:00–23:00',
      note: '沿滨海步道向南可远望对岸；黄昏前后适合看海湾天际线。',
      source: 'https://www.sz.gov.cn/ztfw/gysy/wyw_183970/ywzsk_184570/content/post_12660949.html'
    },
    {
      id: 'sz-stop-qianhai', name: '欢乐港湾“湾区之光”摩天轮', lat: 22.5578, lng: 113.8836,
      visitMinutes: 75, interests: ['摄影', '美食'], openingHours: '10:30–21:30',
      note: '每周二上午检修；周末及节假日延长至 22:00。票务与时段以运营方公告为准。',
      source: 'https://www.sznews.com/content/mb/2021-04/22/content_24154597.htm'
    },
    {
      id: 'shenzhen-talent-park', name: '深圳人才公园', lat: 22.51366, lng: 113.94417,
      visitMinutes: 60, interests: ['自然', '摄影'], openingHours: '06:00–23:00',
      note: '同在后海片区，可与湾畔步道和“春茧”串联。',
      source: 'https://cgj.sz.gov.cn/xsmh/gysz/twf/bhxx/content/post_10841318.html'
    }
  ]
};
