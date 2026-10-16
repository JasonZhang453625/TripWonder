// 香港关卡。探索文字不直接说出城市名；坐标为原片百分比（photo.src 的完整画面）。
// 照片来源、改动与许可见 photo-library/hongkong/ATTRIBUTION.md。
window.CITY_HONGKONG = {
  id: 'hongkong',
  name: '香港',
  region: '中国香港特别行政区',
  lat: 22.286,
  lng: 114.165,
  scenes: [
    {
      id: 'hk-peak',
      name: '太平山顶·维港夜景',
      type: '山顶夜景',
      photo: {
        src: 'photo-library/hongkong/peak/original.jpg',
        width: 6000,
        height: 4000,
        screen: { src: 'photo-library/hongkong/peak/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/hongkong/peak/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/hongkong/peak/detail.webp', width: 2400, height: 1600 },
        credit: 'willianjusten / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/35654634/'
      },
      hotspots: [
        {
          x: 57.5, y: 52, title: '竹节般的三角塔', tag: '建筑',
          text: '画面中央棱角分明的高楼由美籍华裔建筑师贝聿铭设计，灵感来自竹子的“节节高升”：四个高度不同、像晶体一样的三角柱身叠在一起，楼高 367.4 米。它 1989 年启用时是城里最高的建筑。',
          en: 'The angular tower in the centre was designed by I. M. Pei after bamboo “rising node by node”: four crystal-like triangular shafts of different heights, 367.4 metres in all. When it opened in 1989 it was the city’s tallest building.',
          source: 'https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Bank+of+China+Tower'
        },
        {
          x: 46, y: 59, title: '两岸之间的海港', tag: '地理',
          text: '灯火之间那片暗色水面，是隔开岛与对岸半岛的海港。山顶有一条环回步行径，沿着两条山路绕一圈，就能先后看到岛的南北两面，以及这片海港的全景。',
          en: 'The dark water between the lights is the harbour separating the island from the peninsula opposite. A circular walking trail at the summit follows two hillside roads, showing both sides of the island and the whole harbour in one loop.',
          source: 'https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=The+Peak+and+Peak+Tram'
        },
        {
          x: 30, y: 82, title: '你站得有多高', tag: '体验',
          text: '近处一片片楼顶在脚下，因为拍摄点在海拔约 552 米的山上，这是整座岛最高的地方。很多人坐 1888 年启用的缆车上山，它是亚洲最早的缆索铁路，从商业区一路爬过半山住宅区。',
          en: 'The nearby rooftops sit below you because this is about 552 metres up — the island’s highest point. Many visitors ride up on the funicular opened in 1888, Asia’s earliest, climbing from the business district through the mid-level homes.',
          source: 'https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=The+Peak+and+Peak+Tram'
        }
      ]
    },
    {
      id: 'hk-star-ferry',
      name: '天星小轮',
      type: '海港航渡',
      photo: {
        src: 'photo-library/hongkong/star-ferry/original.jpg',
        width: 3840,
        height: 2880,
        screen: { src: 'photo-library/hongkong/star-ferry/screen.webp', width: 1440, height: 1080 },
        thumb: { src: 'photo-library/hongkong/star-ferry/thumb.webp', width: 640, height: 480 },
        detail: { src: 'photo-library/hongkong/star-ferry/detail.webp', width: 2400, height: 1800 },
        credit: 'Minghong / Wikimedia Commons',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Shining_Star,_Star_Ferry_1.jpg'
      },
      hotspots: [
        {
          x: 50.6, y: 55, title: '上下两层船舱', tag: '乘船',
          text: '船身分成上下两层，乘客可以从不同高度看海面与天际线。普通航线连接尖沙咀与中环或湾仔的码头，短短一程就完成两岸的转换。',
          en: 'The hull has an upper and a lower deck, so passengers see the water and skyline from two heights. Regular routes link piers on either side of the harbour, crossing from shore to shore in one short ride.',
          source: 'https://www.discoverhongkong.com/eng/place-to-go/travel.guide-star-ferry-pier.html'
        },
        {
          x: 42.1, y: 48, title: '白舱与绿船身', tag: '识别',
          text: '白色上层与深绿色下层，是这支船队容易辨认的配色。它从 19 世纪末开始承担海港两岸的客运，如今仍是当地人的交通工具，也让游客从水面读懂城市。',
          en: 'A white upper deck over a dark green hull is this fleet’s recognisable livery. It has carried passengers across the harbour since the late 19th century and is still everyday transport, letting visitors read the city from the water.',
          source: 'https://www.discoverhongkong.com/eng/place-to-go/travel.guide-star-ferry-pier.html'
        },
        {
          x: 56.2, y: 63, title: '船身上的游览标识', tag: '辨别',
          text: '这艘照片中的船是“辉星号”海港游览船，并非画面所见就一定在执行日常往返班次。船队同时经营定期渡轮和游览体验，安排路线时应分别核对。',
          en: 'The vessel shown is the Shining Star harbour-tour boat, so it is not necessarily running the everyday shuttle. The fleet operates both scheduled ferries and harbour tours; check them separately when planning.',
          source: 'https://www.discoverhongkong.com/eng/place-to-go/travel.guide-star-ferry-pier.html'
        }
      ]
    },
    {
      id: 'hk-sham-shui-po',
      name: '深水埗',
      type: '街区日常',
      photo: {
        src: 'photo-library/hongkong/sham-shui-po/original.jpg',
        width: 5612,
        height: 3741,
        screen: { src: 'photo-library/hongkong/sham-shui-po/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/hongkong/sham-shui-po/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/hongkong/sham-shui-po/detail.webp', width: 2400, height: 1600 },
        credit: 'throughnislens / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/33859545/'
      },
      hotspots: [
        {
          x: 48, y: 39, title: '街尾那栋饼家大楼', tag: '历史',
          text: '街道尽头印着厨师帽标志的楼，是一家 1926 年起家的面包公司的总部。它 1932 年就搬到这个路口，1958 年扩建成今天七层高的样子，由建筑师朱彬设计，屋顶的红色商标和钟楼是区里的地标。',
          en: 'The building at the end of the street, with the chef’s-hat logo, is the headquarters of a bakery founded in 1926. It has stood at this junction since 1932; the 1958 extension to today’s seven storeys was designed by Chu Pin, and its red rooftop logo and clock tower are local landmarks.',
          source: 'https://www.districtcouncils.gov.hk/ssp/doc/2016_2019/en/dc_meetings_doc/11729/SSP_DC_2017_152_TC.pdf'
        },
        {
          x: 33.5, y: 30, title: '招牌里的地名', tag: '地名',
          text: '左边竖着的旧招牌写着这一区的名字。“埗”与“埠”相通，指码头：从前附近街口有一个深水码头，地名由此而来。后来填海让海岸线外移，原来的码头已经找不到痕迹。',
          en: 'The old vertical sign on the left carries the district’s name. Its last character means a pier: a deep-water pier once stood at a nearby street corner. Land reclamation later pushed the shoreline out, and no trace of it remains.',
          source: 'https://www.gohk.gov.hk/tc/districts/ssp.php'
        },
        {
          x: 40, y: 78, title: '楼挤着楼的街道', tag: '城市',
          text: '两边密密排开的楼房，记录了这里的变化：20 世纪初纺织、制衣、五金等工业陆续进驻，五六十年代又建起大批住宅，包括全城最早的公共屋邨。到 1980 年代初，这里曾是人口密度最高的地区。',
          en: 'The densely packed blocks record the area’s growth: textiles, garment-making and metalwork moved in from the early 20th century, and the 1950s–60s brought mass housing, including the city’s first public estate. By the early 1980s it was the most densely populated district.',
          source: 'https://www.gohk.gov.hk/tc/districts/ssp.php'
        }
      ]
    }
  ],
  questions: [
    {
      q: '从画面看，拍摄者大概站在哪里？',
      options: ['海上的游船', '城市背后的山顶', '海边的码头', '一座高楼的底层'],
      answer: 1, points: 30,
      source: '第 1 处 · 你站得有多高',
      explain: '近处的楼顶都在脚下：拍摄点在海拔约 552 米的山上，是整座岛的最高处。'
    },
    {
      q: '这艘渡轮的船身是什么配色？',
      options: ['白色上层、深绿色下层', '通体大红色', '黑白相间的条纹', '金色船身'],
      answer: 0, points: 30,
      source: '第 2 处 · 白舱与绿船身',
      explain: '白色上层与深绿色下层是这支船队最容易辨认的配色，它从 19 世纪末开始往返海港两岸。'
    },
    {
      q: '第三处街区的地名里，“埗”字指的是什么？',
      options: ['码头', '城门', '水井', '市场'],
      answer: 0, points: 40,
      explain: '“埗”与“埠”相通，意思是码头；地名来自从前附近的一个深水码头，填海后已不见踪影。',
      source: 'https://www.gohk.gov.hk/tc/districts/ssp.php'
    }
  ],
  stops: [
    {
      id: 'hk-peak-tram', name: '山顶缆车中环总站', lat: 22.2769, lng: 114.1582,
      visitMinutes: 45, interests: ['摄影', '文化'], openingHours: null,
      note: '花园道 33 号；把排队和车程留入预算，运营时间以官方当日公告为准。',
      source: 'https://www.discoverhongkong.com/eng/place-to-go/travel.guide-peak-tram.html'
    },
    {
      id: 'hk-peak', name: '太平山顶凌霄阁', lat: 22.2711, lng: 114.1495,
      visitMinutes: 75, interests: ['摄影', '自然'], openingHours: null,
      note: '缆车上站所在；观景台可能另需购票，傍晚上山可同时看日落与夜景。',
      source: 'https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=The+Peak+and+Peak+Tram'
    },
    {
      id: 'hk-peak-circle', name: '山顶环回步行径', lat: 22.2724, lng: 114.1494,
      visitMinutes: 75, interests: ['自然', '摄影'], openingHours: null,
      note: '沿卢吉道与夏力道绕行，可看岛的南北两面与海港；天气不佳时自行调整。',
      source: 'https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=The+Peak+and+Peak+Tram'
    },
    {
      id: 'hk-star-ferry', name: '尖沙咀天星码头', lat: 22.2932, lng: 114.1685,
      visitMinutes: 35, interests: ['文化', '摄影'], openingHours: null,
      note: '接驳中环或湾仔方向渡轮；班次与游览船时段以营运方实时信息为准。',
      source: 'https://www.discoverhongkong.com/eng/place-to-go/travel.guide-star-ferry-pier.html'
    },
    {
      id: 'hk-avenue-stars', name: '星光大道', lat: 22.2934, lng: 114.1744,
      visitMinutes: 60, interests: ['摄影', '文化'], openingHours: null,
      note: '尖沙咀海滨步道，适合与渡轮码头连在一起步行游览。',
      source: 'https://www.discoverhongkong.com/eng/place-to-go/travel.guide-avenue-of-stars.html'
    },
    {
      id: 'hk-sham-shui-po', name: '深水埗鸭寮街', lat: 22.3292, lng: 114.1622,
      visitMinutes: 75, interests: ['文化', '美食'], openingHours: null,
      note: '区内特色街道与电子、布料摊档集中；可顺路走到青山道看街尾的饼家大楼。',
      source: 'https://www.gohk.gov.hk/tc/districts/ssp.php'
    }
  ]
};
