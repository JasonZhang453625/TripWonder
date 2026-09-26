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
      },
      hotspots: [
        {
          x: 37, y: 42, title: '穹顶下的银行大楼', tag: '建筑',
          text: '左边顶着圆穹顶的大楼 1923 年落成，原是一家外资银行的大楼，曾被誉为“从苏伊士运河到白令海峡间最壮观的建筑”。1955 年起它是市政府所在地，1996 年后由一家本地银行使用。',
          en: 'The domed building on the left was completed in 1923 as a foreign bank’s headquarters and was once hailed as the finest building from the Suez Canal to the Bering Strait. From 1955 it housed the city government, and since 1996 a local bank.',
          source: 'https://edu.sh.gov.cn/study_cn_news/20211130/f2d0ef623a304ae2bcc67bd746d7a541.html'
        },
        {
          x: 68, y: 33, title: '会报时的钟楼', tag: '历史',
          text: '右边带钟楼的是海关大楼，1927 年落成；1928 年 1 月，楼顶大钟第一次敲响。大楼门厅的八角藻井里，有八幅由上万颗天然彩色马赛克镶成的帆船海事壁画。',
          en: 'The clock-towered building on the right is the Customs House, completed in 1927; its great clock first rang in January 1928. In the octagonal ceiling of its lobby are eight maritime murals of sailing ships made from tens of thousands of natural coloured mosaic tiles.',
          source: 'https://whlyj.sh.gov.cn/gqfc/20251013/6a35642662844b4bbbd64fe5a1625711.html'
        },
        {
          x: 50, y: 70, title: '名单上相邻的两个编号', tag: '保护',
          text: '这两座并肩的大楼，在全市第一批优秀历史建筑名录里编号也紧挨着：1A003 和 1A004。名录同时记着原名和现在的使用单位——穹顶大楼如今是一家银行，钟楼那座仍是海关。',
          en: 'The two neighbours are also neighbours on the city’s first list of outstanding historic buildings, numbers 1A003 and 1A004. The list records both the original name and today’s user: the domed building is now a bank, and the clock-tower building is still the customs house.',
          source: 'https://fgj.sh.gov.cn/yxlsjz/20200331/fe7b4d6f35774b708a2c5122849065bd.html'
        }
      ]
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
      },
      hotspots: [
        {
          x: 44, y: 30, title: '大珠小珠落玉盘', tag: '建筑',
          text: '串着粉色圆球的是一座广播电视塔，总高 468 米，由 3 根直径 9 米的斜柱撑起，身上一共 11 个大小不一的球体。设计取意“大珠小珠落玉盘”；1991 年 7 月动工，1995 年 5 月开始发射信号。',
          en: 'The tower strung with pink spheres is a broadcasting tower, 468 metres tall, braced by three 9-metre diagonal columns and carrying 11 spheres of different sizes. Its design recalls the line “pearls large and small falling on a jade plate”; work began in July 1991 and it began broadcasting in May 1995.',
          source: 'https://www.shda.gov.cn/dawh/csjy/202509/t20250919_75918.html'
        },
        {
          x: 78, y: 48, title: '江对岸的金融城', tag: '城市',
          text: '右边一排玻璃塔楼属于江东岸的金融区。1990 年 4 月 18 日，国务院宣布这片江东地区开发开放；此后大量金融机构入驻，才有了如今高楼林立的天际线。',
          en: 'The glass towers on the right belong to the financial district on the east bank. On 18 April 1990 the State Council announced the opening-up and development of this area; financial institutions poured in, producing today’s forest of towers.',
          source: 'https://www.shanghai.gov.cn/nw4411/20240418/89f962f1b54743df8ff3c916f9fd7769.html'
        },
        {
          x: 47, y: 85, title: '被埋进时光的“烂泥渡路”', tag: '历史',
          text: '沿江的矮房和绿地背后，曾有一条叫“烂泥渡路”的小马路，20 世纪 80 年代还是这一带的主干道，靠近江边。后来它被更名为银城中路，常被人拿来对照这里几十年的变化。',
          en: 'Behind the low riverside buildings and greenery there was once a road called Lannidu Road — “muddy ferry road” — the area’s main street in the 1980s. It has since been renamed Yincheng Middle Road and is often cited to show how much the district has changed.',
          source: 'https://www.shanghai.gov.cn/nw4411/20240418/89f962f1b54743df8ff3c916f9fd7769.html'
        }
      ]
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
      },
      hotspots: [
        {
          x: 83, y: 64, title: '一字排开的老建筑', tag: '建筑',
          text: '江边亮着暖黄灯光、一栋挨一栋的西式老楼，就是被誉为“万国建筑博览会”的沿江建筑群。它们大多建于 20 世纪上半叶，记录了这座城市发展的历程。',
          en: 'The row of warmly lit Western-style buildings along the river is the waterfront ensemble nicknamed the “exhibition of world architecture”. Most date from the first half of the 20th century and record the city’s growth.',
          source: 'https://edu.sh.gov.cn/study_cn_news/20211130/f2d0ef623a304ae2bcc67bd746d7a541.html'
        },
        {
          x: 66, y: 69, title: '江边那根白色细塔', tag: '纪念',
          text: '滨江步道尽头那根细高的白色塔，是公园里的人民英雄纪念塔。滨水区做综合改造时，纪念塔先完成了修缮，所在的公园也一并整修，陈毅雕像等重要标志则被保留下来。',
          en: 'The slender white tower at the end of the riverside promenade is the Monument to the People’s Heroes in the park there. During the waterfront’s comprehensive renovation the monument was restored first and the park refurbished, while landmarks such as the Chen Yi statue were kept.',
          source: 'https://www.shanghai.gov.cn/nw9822/20200906/0001-9822_361953.html'
        },
        {
          x: 64, y: 84, title: '江面上的光带', tag: '体验',
          text: '长时间曝光里，夜航的船在江面上拉出一道道光。岸边的步道建在防汛墙上方；滨水区综合改造时扩建、增设了几处广场，让更多人能停在江边看两岸灯火。',
          en: 'In this long exposure, night boats draw streaks of light across the river. The promenade runs on top of the flood wall; the waterfront renovation enlarged and added several plazas so more people can stop by the river and watch both banks light up.',
          source: 'https://www.shanghai.gov.cn/nw9822/20200906/0001-9822_361953.html'
        }
      ]
    }
  ],
  questions: [
    {
      q: '第一处钟楼上的大钟，第一次敲响是在哪一年？',
      options: ['1928 年', '1900 年', '1949 年', '1996 年'],
      answer: 0, points: 30,
      explain: '海关大楼 1927 年落成，1928 年 1 月楼顶大钟第一次敲响。',
      source: 'https://whlyj.sh.gov.cn/gqfc/20251013/6a35642662844b4bbbd64fe5a1625711.html'
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
