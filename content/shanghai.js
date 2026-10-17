// 上海关卡。探索文字不直接说出城市名；坐标为原片百分比（photo.src 的完整画面）。
// 照片来自 Pexels（Pexels License），来源与处理记录见 photo-library/shanghai/ATTRIBUTION.md。
window.CITY_SHANGHAI = {
  id: 'shanghai',
  name: '上海',
  region: '上海',
  lat: 31.2304,
  lng: 121.4737,
  scenes: [
    {
      id: 'sh-bund',
      name: '外滩·汇丰银行大楼与海关大楼',
      type: '近代建筑',
      photo: {
        src: 'photo-library/shanghai/bund/original.jpg',
        width: 6240,
        height: 4160,
        screen: { src: 'photo-library/shanghai/bund/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/shanghai/bund/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/shanghai/bund/detail.webp', width: 2400, height: 1600 },
        credit: 'jcterry / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/30685870/'
      }
    },
    {
      id: 'sh-lujiazui',
      name: '陆家嘴天际线',
      type: '城市天际线',
      photo: {
        src: 'photo-library/shanghai/lujiazui/original.jpg',
        width: 8434,
        height: 5623,
        screen: { src: 'photo-library/shanghai/lujiazui/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/shanghai/lujiazui/thumb.webp', width: 640, height: 426 },
        detail: { src: 'photo-library/shanghai/lujiazui/detail.webp', width: 2400, height: 1600 },
        credit: 'throughnislens / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/31772145/'
      }
    },
    {
      id: 'sh-bund-night',
      name: '隔江望外滩夜景',
      type: '滨江夜景',
      photo: {
        src: 'photo-library/shanghai/bund-night/original.jpg',
        width: 4701,
        height: 3134,
        screen: { src: 'photo-library/shanghai/bund-night/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/shanghai/bund-night/thumb.webp', width: 640, height: 426 },
        detail: { src: 'photo-library/shanghai/bund-night/detail.webp', width: 2400, height: 1600 },
        credit: 'claudia-seidensticker / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/345162/'
      }
    }
  ],
  questions: [
    {
      q: '画面右边那座大楼顶部的塔楼上装着什么？',
      options: ['大钟', '风车', '雷达天线', '霓虹广告牌'],
      answer: 0, points: 30,
      source: '第 1 处 · 会报时的钟楼',
      explain: '右边带钟楼的是海关大楼，1927 年落成，楼顶大钟至今还会报时。'
    },
    {
      q: '第二处那座串着圆球的电视塔，设计取意于哪句诗？',
      options: ['大珠小珠落玉盘', '飞流直下三千尺', '海上生明月', '欲穷千里目'],
      answer: 0, points: 30,
      explain: '设计团队从白居易《琵琶行》“大珠小珠落玉盘”取意，用 11 个大小不一的球体组成塔身。',
      source: 'https://www.shda.gov.cn/dawh/csjy/202509/t20250919_75918.html'
    },
    {
      q: '第三处江边一字排开的西式老建筑群，常被誉为什么？',
      options: ['万国建筑博览会', '东方威尼斯', '十里洋场灯塔', '江南园林之冠'],
      answer: 0, points: 40,
      explain: '沿江这片风格各异的近代建筑群被誉为“万国建筑博览会”，记录了城市发展的历程。',
      source: 'https://edu.sh.gov.cn/study_cn_news/20211130/f2d0ef623a304ae2bcc67bd746d7a541.html'
    }
  ],
  stops: [
    {
      id: 'sh-stop-bund', name: '外滩万国建筑群', lat: 31.2400, lng: 121.4905,
      visitMinutes: 90, interests: ['建筑', '摄影'], openingHours: null,
      note: '沿中山东一路步行看建筑外立面；楼内是否开放以各单位安排为准。',
      source: 'https://edu.sh.gov.cn/study_cn_news/20211130/f2d0ef623a304ae2bcc67bd746d7a541.html'
    },
    {
      id: 'sh-stop-customs', name: '海关大楼（外滩 13 号）', lat: 31.2393, lng: 121.4908,
      visitMinutes: 30, interests: ['建筑', '文化'], openingHours: null,
      note: '大楼仍在使用，内部只在特定活动期间预约开放；平时可在楼外听整点钟声。',
      source: 'https://whlyj.sh.gov.cn/gqfc/20251013/6a35642662844b4bbbd64fe5a1625711.html'
    },
    {
      id: 'sh-stop-huangpu-park', name: '黄浦公园与人民英雄纪念塔', lat: 31.2436, lng: 121.4907,
      visitMinutes: 40, interests: ['文化', '摄影'], openingHours: null,
      note: '位于外滩北端，可与外滩步行段首尾相接。',
      source: 'https://www.shanghai.gov.cn/nw9822/20200906/0001-9822_361953.html'
    },
    {
      id: 'sh-stop-pearl', name: '东方明珠广播电视塔', lat: 31.2397, lng: 121.4998,
      visitMinutes: 120, interests: ['建筑', '摄影'], openingHours: null,
      note: '需购票登塔；排队时间受客流影响较大，建议错峰。',
      source: 'https://www.shda.gov.cn/dawh/csjy/202509/t20250919_75918.html'
    },
    {
      id: 'sh-stop-lujiazui-riverside', name: '陆家嘴滨江步道', lat: 31.2385, lng: 121.5005,
      visitMinutes: 60, interests: ['摄影', '美食'], openingHours: null,
      note: '隔江回望外滩的好位置，傍晚到入夜时段灯光最完整。',
      source: 'https://www.shanghai.gov.cn/nw4411/20240418/89f962f1b54743df8ff3c916f9fd7769.html'
    }
  ]
};
