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
      }
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
      }
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
      }
    }
  ],
  questions: [
    {
      q: '城楼墙面上一排排的小方窗，原本是做什么用的？',
      options: ['商铺的橱窗', '给城楼通风散热', '挂灯笼装饰', '守城时向外射箭'],
      answer: 3, points: 30,
      source: '第 1 处 · 数一数箭窗',
      explain: '这些小方窗是箭窗，供守城时向外射箭；北面朝城内，不开箭窗。'
    },
    {
      q: '楼阁正中的匾额是什么配色？',
      options: ['白底蓝字', '黑底金字', '蓝底金字', '红底黑字'],
      answer: 2, points: 30,
      source: '第 2 处 · 匾额换过三次名',
      explain: '蓝底金字的匾额写着楼阁今天的名字；它明初叫“武楼”，后来改过两次名。'
    },
    {
      q: '牌坊中间门额上的四个字，应该怎样读？',
      options: ['从中间向两边', '从右往左', '从左往右', '从下往上'],
      answer: 1, points: 40,
      source: '第 3 处 · 从右往左读的门额',
      explain: '门额四字要从右往左读：“证功德水”。传统门额和匾额多按这个方向书写。'
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
