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
      },
      hotspots: [
        {
          x: 52.2, y: 24, title: '远处的高楼群', tag: '建筑',
          text: '先找远处这座轮廓收尖的高塔，再看看它周围：高低不同的楼顶叠成一条天际线，亮着的窗户让楼身显出细密的格子。向下看，前景楼顶也清晰可见，这是一幅从高处俯瞰城区的夜景。',
          en: 'Find the slender, tapering tower in the distance, then look around it. Rooftops of different heights form a layered skyline, while lit windows trace grids across the buildings. The visible rooftops in the foreground show that we are looking down over the city from a high viewpoint.',
          source: 'photo-library/shenzhen/houhai/original.png'
        },
        {
          x: 59, y: 51, title: '楼群之间的山脊', tag: '自然',
          text: '前后两片亮着灯的楼群之间，横着一片起伏的暗色轮廓。沿着它的边缘看，可以辨认出山坡和树木；周围的楼房贴着山脚展开。记住这处山脊：密集的城区里，也能看到山体穿插其间。',
          en: 'An uneven dark ridge separates the lit buildings in the foreground from those behind it. Follow its edge to pick out wooded slopes, with buildings gathered around their foot. Remember this ridge: hills remain visible among the dense city blocks.',
          source: 'photo-library/shenzhen/houhai/original.png'
        },
        {
          x: 43, y: 67, title: '绕山延伸的灯带', tag: '城市',
          text: '顺着脚下这条亮着灯的道路看，它在楼房与暗色山坡之间弯出一道弧线，再接入前方的街区。道路两侧的灯光把走向勾勒出来。把这条曲线和旁边的山脊放在一起看，能发现楼群、道路与地形之间的关系。',
          en: 'Follow the brightly lit road below. It curves between buildings and a dark hillside before joining the blocks ahead. Lights along its sides reveal its course. Compare this curve with the ridge beside it to see how streets and buildings fit around the terrain.',
          source: 'photo-library/shenzhen/houhai/original.png'
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
      category: '观察',
      q: '第二处夜景中，前后两片楼群之间起伏的暗色轮廓是什么？',
      options: ['覆盖着树木的山脊', '平坦开阔的海面', '沿岸排列的码头', '规则矩形的运动场'],
      answer: 0, points: 30,
      explain: '画面中部的暗色轮廓有起伏的山坡和树木，前后分布着亮灯的楼群，左侧还有弯曲的道路。线索“楼群之间的山脊”对应的正是这处地形。',
      source: '第2处 · 楼群之间的山脊'
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
