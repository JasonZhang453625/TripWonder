// 北京关卡。探索文字不直接说出城市名；坐标为原片百分比（photo.src 的完整画面）。
// 照片来自 Pexels（Pexels License），来源与处理记录见 photo-library/beijing/ATTRIBUTION.md。
window.CITY_BEIJING = {
  id: 'beijing',
  name: '北京',
  region: '北京',
  lat: 39.9042,
  lng: 116.4074,
  scenes: [
    {
      id: 'bj-zhengyangmen',
      name: '正阳门箭楼',
      type: '城门建筑',
      photo: {
        src: 'photo-library/beijing/zhengyangmen/original.jpg',
        width: 4096,
        height: 3072,
        screen: { src: 'photo-library/beijing/zhengyangmen/screen.webp', width: 1440, height: 1080 },
        thumb: { src: 'photo-library/beijing/zhengyangmen/thumb.webp', width: 640, height: 480 },
        detail: { src: 'photo-library/beijing/zhengyangmen/detail.webp', width: 2400, height: 1800 },
        credit: 'yuan-yuan / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/35385599/'
      },
      hotspots: [
        {
          x: 50, y: 51, title: '数一数箭窗', tag: '建筑',
          text: '墙面上一排排小方窗是箭窗，供守城时向外射箭。1780 年重建后，南面每层 13 个、东西两面每层各 4 个，共四层；北面朝城内，不开箭窗。1915 年改建后，箭窗总数变成 94 个。',
          en: 'The rows of small square openings are arrow windows for firing outward. After the 1780 rebuild there were 13 per floor on the south face and 4 on each of the east and west, over four floors; the north face, looking into the city, has none. After the 1915 renovation there were 94 in all.',
          source: 'https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738090/wwgs/623138/index.html'
        },
        {
          x: 63, y: 59, title: '白色的弧形窗檐', tag: '历史',
          text: '下面两层箭窗顶上的白色弧形窗檐，还有城台边的白色护栏，并不是明代原物：1915 年改建时由一位德国建筑师设计加上，护栏是仿汉白玉的混凝土，东西两侧还加了西式浮雕。',
          en: 'The white arched hoods over the lower two rows of windows, and the white railing on the platform, are not Ming originals: a German architect added them in the 1915 renovation. The railing is concrete imitating white marble, and Western-style reliefs were added on the east and west sides.',
          source: 'https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738090/wwgs/623138/index.html'
        },
        {
          x: 50, y: 33, title: '中轴线上的制高点', tag: '历史',
          text: '这座箭楼建成于 1439 年，明清时与后面的城楼、瓮城组成一组既防御又讲礼仪的城门。它是这一带景观的制高点，向南可以遥望另一座城门；2024 年底重新开放，楼内展出城市中轴线的专题展。',
          en: 'The arrow tower was completed in 1439 and, with the gate tower and enclosure behind it, formed a gate complex for both defence and ceremony. It is the high point of the area, with a view south to another city gate; it reopened in late 2024 with an exhibition on the city’s central axis.',
          source: 'https://wwj.beijing.gov.cn/bjww/362679/483700/543493973/index.html'
        }
      ]
    },
    {
      id: 'bj-hongyige',
      name: '故宫弘义阁',
      type: '宫殿建筑',
      photo: {
        src: 'photo-library/beijing/hongyige/original.jpg',
        width: 8164,
        height: 5443,
        screen: { src: 'photo-library/beijing/hongyige/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/beijing/hongyige/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/beijing/hongyige/detail.webp', width: 2400, height: 1600 },
        credit: 'zhai-zhai / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/28956203/'
      },
      hotspots: [
        {
          x: 57, y: 42, title: '两层楼，一层屋顶', tag: '建筑',
          text: '这座楼阁有上下两层，中间用一圈腰檐和平座分开，顶上是单檐庑殿顶，高 23.8 米，大约是正前方主殿高度的十分之七。它坐西朝东，立在大殿前广场的西侧。',
          en: 'The pavilion has two storeys divided by a waist eave and a balcony, under a single-eave hipped roof. At 23.8 metres it is about seven-tenths the height of the main hall; it faces east from the west side of the great courtyard.',
          source: 'https://www.dpm.org.cn/explore/building/236491.html'
        },
        {
          x: 43, y: 63, title: '匾额换过三次名', tag: '历史',
          text: '蓝底金字的匾额写着它今天的名字。它始建于 1420 年，明初叫“武楼”，嘉靖时改称“武成阁”，清初才改成现在的名字；广场对面还有一座形式完全相同的楼阁，两者左右对称。',
          en: 'The blue-and-gold plaque gives its present name. Built in 1420, it was the “Martial Tower” in the early Ming, renamed “Pavilion of Martial Achievement” under Jiajing, and given today’s name in the early Qing. An identical pavilion stands opposite across the courtyard.',
          source: 'https://www.dpm.org.cn/explore/building/236491.html'
        },
        {
          x: 72, y: 72, title: '楼里曾装满金银', tag: '宫廷',
          text: '到了清代，这座楼成了内务府的银库，存放金、银、制钱、珠宝、玉器和金银器皿。对面那座“双胞胎”楼阁 1783 年失火烧毁后，就是照着这一座重建的。',
          en: 'In the Qing it served as the Imperial Household Department’s silver vault, holding gold, silver, coins, jewels, jade and precious vessels. When its twin across the courtyard burned down in 1783, it was rebuilt as a copy of this one.',
          source: 'https://www.dpm.org.cn/explore/building/236491.html'
        }
      ]
    },
    {
      id: 'bj-beihai',
      name: '北海小西天琉璃牌坊',
      type: '皇家园林',
      photo: {
        src: 'photo-library/beijing/beihai/original.jpg',
        width: 9504,
        height: 6336,
        screen: { src: 'photo-library/beijing/beihai/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/beijing/beihai/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/beijing/beihai/detail.webp', width: 2400, height: 1600 },
        credit: 'zhangkaiyv / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/6963404/'
      },
      hotspots: [
        {
          x: 49, y: 32, title: '从右往左读的门额', tag: '文字',
          text: '中间门额上的四个字要从右往左读：“证功德水”。像这样的琉璃牌坊一共有四座，分别立在一座大殿的东、南、西、北四面，大殿四周环水，有桥相通。',
          en: 'The four characters on the central panel read right to left. There are four glazed archways like this one, one on each side of a great hall that is surrounded by water and reached by bridges.',
          source: 'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/202204/t20220403_2653746.html'
        },
        {
          x: 80, y: 36, title: '为母亲祝寿的工程', tag: '历史',
          text: '绿黄相间的琉璃面砖和龙纹浮雕，属于 1768 年动工、1770 年建成的一组佛教建筑。它是乾隆皇帝为母亲孝圣皇太后祝寿祈福而建的，所以用料和装饰都格外华丽。',
          en: 'The green-and-yellow glazed tiles and dragon reliefs belong to a Buddhist complex begun in 1768 and completed in 1770. The Qianlong Emperor built it to pray for the longevity of his mother, the Empress Dowager Xiaosheng — hence the lavish materials.',
          source: 'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/202204/t20220403_2653746.html'
        },
        {
          x: 49, y: 80, title: '门洞后面的大殿', tag: '建筑',
          text: '透过中间的拱门能看到后面的大殿：它占地 1200 平方米，横梁跨度 13.5 米，是国内最大的方亭式宫殿。殿里原本有一座泥塑的海岛仙山，山上布有 226 尊罗汉像。',
          en: 'Through the central arch you can see the hall behind: covering 1,200 square metres with 13.5-metre beams, it is the largest square pavilion-style palace hall in the country. Inside once stood a clay island-mountain peopled with 226 arhat figures.',
          source: 'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/202204/t20220403_2653746.html'
        }
      ]
    }
  ],
  questions: [
    {
      "q": "这座牌坊三个门洞里，中间那个明显更高更宽，主要是为了什么？",
      "options": [
        "体现以中为尊的等级",
        "方便大车马转弯",
        "节省砌筑材料",
        "让墙体更能承重"
      ],
      "answer": 0,
      "points": 20,
      "level": 1,
      "sceneId": "bj-beihai",
      "explain": "传统建筑讲究以中为尊：中间门洞最高最宽，两侧依次降低，用门洞的大小表达等级。"
    },
    {
      "q": "楼阁台基前摆着几口敞口的大缸，它们最主要的用途是什么？",
      "options": [
        "储存饮用水",
        "当作香炉",
        "蓄水，用来扑救火灾",
        "收集雨水浇花"
      ],
      "answer": 2,
      "points": 20,
      "level": 2,
      "sceneId": "bj-hongyige",
      "explain": "宫殿全是木结构，最怕失火；大缸常年蓄水、冬天还要保温防冻，是就近取水灭火的设施。"
    },
    {
      "q": "这座城市的城市轨道交通运营里程，大约是多少？",
      "options": [
        "约 120 公里",
        "约 250 公里",
        "约 500 公里",
        "约 880 公里"
      ],
      "answer": 3,
      "points": 20,
      "level": 3,
      "sceneId": "bj-zhengyangmen",
      "source": "https://www.stdaily.com/web/gdxw/2024-12/15/content_273696.html",
      "explain": "作为人口超两千万的超大城市，它的轨道交通网规模全国第一；截至 2024 年底运营里程约 879 公里。"
    }
  ],
  stops: [
    {
      id: 'bj-stop-zhengyangmen', name: '正阳门箭楼', lat: 39.8990, lng: 116.3977,
      visitMinutes: 60, interests: ['建筑', '文化'], openingHours: '周二至周日 09:00–17:00，16:30 停止入馆；周一闭馆',
      note: '实名预约参观；楼内一至三层为中轴线专题展。',
      source: 'https://wwj.beijing.gov.cn/bjww/362679/483700/543493973/index.html'
    },
    {
      id: 'bj-stop-yongdingmen', name: '永定门', lat: 39.8676, lng: 116.3939,
      visitMinutes: 40, interests: ['建筑', '摄影'], openingHours: null,
      note: '中轴线南端的城门，从正阳门箭楼可向南遥望；两处可沿中轴线串联。',
      source: 'https://wwj.beijing.gov.cn/bjww/362679/483700/543493973/index.html'
    },
    {
      id: 'bj-stop-palace', name: '故宫博物院', lat: 39.9163, lng: 116.3972,
      visitMinutes: 240, interests: ['文化', '建筑'], openingHours: '08:30–17:00，16:00 停止入馆；周一闭馆',
      note: '须提前实名预约；11 月至次年 3 月为淡季，15:30 停止入馆。',
      source: 'https://www.dpm.org.cn/Visit.html'
    },
    {
      id: 'bj-stop-jingshan', name: '景山公园万春亭', lat: 39.9245, lng: 116.3963,
      visitMinutes: 60, interests: ['摄影', '自然'], openingHours: null,
      note: '万春亭在中轴线最高处，可俯瞰故宫全景；与故宫北门相邻。',
      source: 'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/201912/t20191211_1048536.html'
    },
    {
      id: 'bj-stop-beihai', name: '北海公园（小西天、白塔）', lat: 39.9254, lng: 116.3860,
      visitMinutes: 150, interests: ['自然', '文化'], openingHours: '06:30–21:00',
      note: '小西天在北岸；11 月至次年 3 月开放至 20:00，以公园公告为准。',
      source: 'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/202204/t20220403_2653746.html'
    },
    {
      id: 'bj-stop-qianmen', name: '前门大街', lat: 39.8955, lng: 116.3978,
      visitMinutes: 60, interests: ['美食', '文化'], openingHours: null,
      note: '箭楼南侧的步行街，适合与箭楼、中轴线步行同段安排。',
      source: 'https://wwj.beijing.gov.cn/bjww/362679/483700/543493973/index.html'
    }
  ]
};
