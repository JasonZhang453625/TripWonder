// 深圳关卡。探索文字不直接说出城市名；坐标为原片百分比（photo.src 的完整画面）。
// 照片来自 Pexels（Pexels License），来源与处理记录见 photo-library/shenzhen/ATTRIBUTION.md。
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
        src: 'photo-library/shenzhen/futian/original.jpg',
        width: 3000,
        height: 2000,
        screen: { src: 'photo-library/shenzhen/futian/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/shenzhen/futian/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/shenzhen/futian/detail.webp', width: 2400, height: 1600 },
        credit: 'lywin / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/38833568/'
      },
      hotspots: [
        {
          x: 64, y: 27, title: '最高的那根“针”', tag: '建筑',
          text: '画面中央最高的塔楼高 599 米，地上 118 层。2019 年，世界高层建筑与都市人居学会把它认证为“世界最高办公建筑”。这里的天际线在几十年里被一次次刷新，它是目前的最高点。',
          en: 'The tallest tower in the centre rises 599 metres over 118 floors. In 2019 the Council on Tall Buildings and Urban Habitat certified it as the world’s tallest office building — the latest peak of a skyline that has been rewritten again and again.',
          source: 'http://www.sznews.com/news/content/2019-04/09/content_21610673.htm'
        },
        {
          x: 64.5, y: 15, title: '塔顶下的观光层', tag: '体验',
          text: '塔尖下方亮灯的几层里，第 116 层是对外开放的云际观光层，离地约 541 米，2018 年 2 月开始售票迎客。从这里往下看，整片中心区的路网会像一张摊开的地图。',
          en: 'Among the lit floors just below the crown, level 116 is a public observation deck about 541 metres above the ground, open to ticketed visitors since February 2018. From there the district’s street grid spreads out like a map.',
          source: 'http://ifutian.sznews.com/content/2018-03/09/content_18638064.htm'
        },
        {
          x: 72, y: 81, title: '脚下的十字路口', tag: '城市',
          text: '右下方车流汇成光带的街道，就是大厦所在的路口：它位于两条干道交会处的西南角，旁边是购物公园。办公、商业与交通在同一块地上叠起来，是中心区的典型做法。',
          en: 'The light trails at lower right mark the tower’s own junction: it stands on the south-west corner where two main roads meet, next to a shopping park. Offices, retail and transport stacked on one plot are typical of this central district.',
          source: 'http://ifutian.sznews.com/content/2018-03/09/content_18638064.htm'
        }
      ]
    },
    {
      id: 'sz-houhai',
      name: '深圳湾·后海天际线',
      type: '海湾夜景',
      photo: {
        src: 'photo-library/shenzhen/houhai/original.jpg',
        width: 6043,
        height: 2438,
        screen: { src: 'photo-library/shenzhen/houhai/screen.webp', width: 1440, height: 581 },
        thumb: { src: 'photo-library/shenzhen/houhai/thumb.webp', width: 640, height: 258 },
        detail: { src: 'photo-library/shenzhen/houhai/detail.webp', width: 2400, height: 968 },
        credit: 'ben-cheung / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/11980026/'
      },
      hotspots: [
        {
          x: 53, y: 52, title: '一颗竖起的“笋”', tag: '建筑',
          text: '亮灯的子弹形塔楼被叫作“春笋”，高 392.5 米，是这片海湾边的第一高楼。外框由 56 根钢柱围成，每层平面都是圆形，直径逐层变化，最宽处约 68 米，所以远看像一根向上收尖的竹笋。',
          en: 'The lit bullet-shaped tower is nicknamed the “Spring Bamboo Shoot”. At 392.5 metres it is the tallest building on this bay. Its outer frame is 56 steel columns around circular floors whose diameter changes storey by storey — about 68 metres at the widest — so it tapers like a shoot.',
          source: 'http://ilonggang.sznews.com/lgnews/content/2017-01/17/content_14838429_0.htm'
        },
        {
          x: 86, y: 76, title: '岸边那只白色的“茧”', tag: '建筑',
          text: '右侧低矮的白色曲面屋顶是一座体育中心，因外形像一只蚕茧又称“春茧”。一个屋盖下装着“一场两馆”：2 万座的海景体育场、1.3 万座的体育馆和游泳馆，大型赛事后向公众开放。',
          en: 'The low white curved roof on the right is a sports centre called the “Spring Cocoon” for its silkworm-cocoon shape. One roof covers a 20,000-seat seaside stadium, a 13,000-seat arena and a swimming hall, opened to the public after a major games.',
          source: 'https://www.szns.gov.cn/mlns/whns/tycg/content/post_12589347.html'
        },
        {
          x: 36, y: 87, title: '水面上的一排排浮架', tag: '生态',
          text: '前景水面上的深色方格是养蚝的浮排，照片应是从海湾对岸拍的：那一侧的滩岸处在咸淡水交界，适合养蚝，是当地唯一的产蚝区。一湾之隔，一边是蚝排，一边是摩天楼。',
          en: 'The dark grids on the water are oyster rafts. The photo was taken from the opposite shore, where brackish water makes the only oyster-farming area on that side of the bay — oyster rafts on one shore, skyscrapers on the other.',
          source: 'https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Lau+Fau+Shan'
        }
      ]
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
      },
      hotspots: [
        {
          x: 29, y: 49, title: '会发光的摩天轮', tag: '地标',
          text: '水边这座摩天轮叫“湾区之光”，高 128 米，2021 年 4 月 18 日启用，建设用了三年。双面轮廓和 112 道辐条都装了全彩 LED 灯，所以夜里整座轮子会变色。',
          en: 'The Ferris wheel by the water, “Bay Glory”, is 128 metres tall and opened on 18 April 2021 after three years of construction. Both rims and all 112 spokes carry full-colour LEDs, which is why the whole wheel changes colour at night.',
          source: 'https://www.sznews.com/content/mb/2021-04/22/content_24154597.htm'
        },
        {
          x: 24, y: 58, title: '轿厢与一圈的时间', tag: '体验',
          text: '它是国内首座全天景轿厢摩天轮：28 个轿厢各有 16.8 平方米，可坐 25 人，转一圈约 27 分钟。升到高处，周边城区、沿江高速的车流和海面上的船会同时出现在四周的玻璃里。',
          en: 'It was the country’s first Ferris wheel with all-round panoramic cabins: 28 cabins of 16.8 square metres, 25 people each, about 27 minutes per turn. Near the top, the surrounding districts, the riverside expressway and ships at sea all appear around the glass.',
          source: 'http://www.sznews.com/news/content/2021-04/06/content_24108184.htm'
        },
        {
          x: 80, y: 79, title: '灯牌上的两个字', tag: '城市',
          text: '右下角大楼上亮着这片片区的名字。2010 年 8 月，国务院批复这里的发展规划，设立一个以现代服务业和粤港合作为方向的合作区；如今高楼几乎都在那之后建起。',
          en: 'The sign at lower right spells out the district’s name. In August 2010 the State Council approved its development plan as a co-operation zone for modern services with Hong Kong; almost every tower in view has gone up since.',
          source: 'https://www.gov.cn/jrzg/2010-08/27/content_1689210.htm'
        }
      ]
    }
  ],
  questions: [
    {
      q: '第一处画面里最高的塔楼获得过哪项认证？',
      options: ['世界最高办公建筑', '世界最高电视塔', '世界最长跨海大桥', '世界最大体育场'],
      answer: 0, points: 30,
      explain: '这座 599 米、118 层的塔楼在 2019 年被世界高层建筑与都市人居学会认证为“世界最高办公建筑”。',
      source: 'http://www.sznews.com/news/content/2019-04/09/content_21610673.htm'
    },
    {
      q: '第二处海湾边那座白色曲面屋顶的建筑，为什么被叫作“春茧”？',
      options: ['外形像一只蚕茧', '屋顶种满桑树', '只在春天开放', '最早是丝绸仓库'],
      answer: 0, points: 30,
      explain: '这座体育中心的椭圆形屋盖像一只蚕茧，因此又称“春茧”；一个屋盖下包含 2 万座体育场、1.3 万座体育馆和游泳馆。',
      source: 'https://www.szns.gov.cn/mlns/whns/tycg/content/post_12589347.html'
    },
    {
      q: '第三处摩天轮在夜里变色，主要靠什么？',
      options: ['轮廓和辐条上的全彩 LED 灯', '水面反射的月光', '轿厢里的霓虹招牌', '周围大楼的探照灯'],
      answer: 0, points: 40,
      explain: '摩天轮的双面轮廓与 112 道辐条都使用全彩 LED 灯光矩阵，所以整座轮子能变换颜色。',
      source: 'https://www.sznews.com/content/mb/2021-04/22/content_24154597.htm'
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
