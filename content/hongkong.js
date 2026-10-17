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
      }
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
      }
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
      }
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
