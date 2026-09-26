// 苏州关卡：本轮素材库只保留虎丘一景，因此只有一处探索（题目仍为三道，均来自这一景）。
// 事实来源见各 source 字段与 photo-library/suzhou/SOURCES.md；游览时长为原型估计。
window.CITY_SUZHOU = {
  id: 'suzhou',
  name: '苏州',
  region: '江苏',
  lat: 31.324,
  lng: 120.624,
  scenes: [
    {
      id: 'suzhou-huqiu',
      name: '虎丘云岩寺塔',
      type: '古塔',
      photo: {
        src: 'photo-library/suzhou/huqiu/original.jpg',
        width: 4032,
        height: 3024,
        screen: { src: 'photo-library/suzhou/huqiu/screen.webp', width: 1080, height: 1440 },
        thumb: { src: 'photo-library/suzhou/huqiu/thumb.webp', width: 480, height: 640 },
        detail: { src: 'photo-library/suzhou/huqiu/detail.webp', width: 1800, height: 2400 },
        credit: 'Chainwit. / Wikimedia Commons',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        source: 'https://commons.wikimedia.org/wiki/File:2024-Apr_Suzhou_-_Tiger_Hill_Pagoda_%E8%99%8E%E4%B8%98%E5%A1%94_(Huqiu_Ta)_-_img_01.jpg'
      },
      hotspots: [
        {
          x: 51, y: 27, title: '数一数塔檐', tag: '建筑',
          text: '从上到下能数出七级塔檐。塔身平面是八角形，主体用砖砌成；建造始于后周显德六年（959年），至北宋建隆二年（961年）完成。眼前像木楼阁的层次，其实藏着一座砖塔。',
          en: 'Count seven eaves from top to bottom. The plan is octagonal and the body is brick; building began in 959 and finished in 961. What looks like a timber pavilion is really a brick pagoda.',
          source: 'https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml'
        },
        {
          x: 55, y: 48, title: '砖砌的“木构”', tag: '建筑',
          text: '放大看每层檐下层层挑出的细部，它们是用砖砌出的斗拱和出檐，模仿木构楼阁的节奏。远看像一层层屋顶，近看则能读出砖塔的做法。',
          en: 'Zoom in on the brackets stepping out under each eave: they are brick imitations of timber bracket sets and eaves. From afar they read as roof after roof; up close they reveal how a brick pagoda was built.',
          source: 'https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml'
        },
        {
          x: 50, y: 61, title: '斜而未倒', tag: '历史',
          text: '树梢遮住了塔基，但塔身上部的轻微偏斜仍值得留意。园林局记载，明代时第七层已经向西北倾斜。它因长期倾斜而闻名，不能只凭照片的透视去估计实际倾角。',
          en: 'Trees hide the base, but look for the slight lean of the upper body. Records say the seventh storey was already tilting north-west in the Ming dynasty. The pagoda is famous for its long-standing lean; don’t judge the real angle from photo perspective.',
          source: 'https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml'
        }
      ]
    }
  ],
  questions: [
    {
      q: '这座古塔从上到下是怎样的结构？',
      options: ['七层八角的砖塔', '三层方形木楼', '单层石亭', '九层圆形铁塔'],
      answer: 0, points: 30,
      explain: '塔为七层八角砖构；檐下的砖砌斗拱让它远看具有木构楼阁的层次。',
      source: 'https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml'
    },
    {
      q: '这座塔大约建于什么时候？',
      options: ['五代后周至北宋初（959—961 年）', '唐代开元年间', '元代至正年间', '清代乾隆年间'],
      answer: 0, points: 30,
      explain: '园林局记载，塔始建于后周显德六年（959 年），至北宋建隆二年（961 年）完成。',
      source: 'https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml'
    },
    {
      q: '关于这座塔的倾斜，哪项说法有记载依据？',
      options: ['明代时第七层已向西北倾斜', '塔是故意斜着建造的', '倾斜发生在二十一世纪', '倾斜只是照片的透视错觉'],
      answer: 0, points: 40,
      explain: '园林局记载，明代时塔的第七层已经向西北倾斜；照片透视会放大或缩小倾角，不能据此估计。',
      source: 'https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml'
    }
  ],
  stops: [
    {
      id: 'suzhou-stop-museum', name: '苏州博物馆本馆', lat: 31.3251, lng: 120.6235,
      visitMinutes: 90, tags: ['文博', '建筑'], cluster: '古城东北',
      note: '与拙政园相邻；本馆实行分时预约，入馆时段按预约结果安排。',
      opening: null,
      source: 'https://www.suzhou.gov.cn/szsrmzf/mszx/202609/2d1a50ec4496485d9f5c332de585dfdc.shtml'
    },
    {
      id: 'suzhou-stop-zhuozheng', name: '拙政园', lat: 31.3261, lng: 120.6239,
      visitMinutes: 120, tags: ['园林', '历史'], cluster: '古城东北',
      note: '3—10月 07:30—17:30；11—次年2月 07:30—17:00，节假日可能调整。',
      opening: 'seasonal',
      source: 'https://ylj.suzhou.gov.cn/szsylj/kfsj/wztt.shtml'
    },
    {
      id: 'suzhou-stop-shizilin', name: '狮子林', lat: 31.3219, lng: 120.6292,
      visitMinutes: 75, tags: ['园林', '建筑'], cluster: '古城东北',
      note: '3—10月 07:30—17:30；11—次年2月 07:30—17:00，节假日可能调整。',
      opening: 'seasonal',
      source: 'https://ylj.suzhou.gov.cn/szsylj/kfsj/wztt.shtml'
    },
    {
      id: 'suzhou-stop-pingjiang', name: '平江路', lat: 31.3185, lng: 120.6325,
      visitMinutes: 75, tags: ['街巷', '水乡'], cluster: '古城东北',
      note: '规划点设在街区中段；这条水巷以“水陆并行、河街相邻”的格局著称。',
      opening: null,
      source: 'https://dfzb.suzhou.gov.cn/dfzb/szdq/202109/c4b0ffee88744ab3a80a643f25fca382.shtml'
    },
    {
      id: 'suzhou-stop-huqiu', name: '虎丘景区', lat: 31.3376, lng: 120.5762,
      visitMinutes: 120, tags: ['历史', '建筑'], cluster: '古城西北',
      note: '5—10月 07:30—18:00；11—次年4月 07:30—17:30，节假日可能调整。',
      opening: 'seasonal',
      source: 'https://ylj.suzhou.gov.cn/szsylj/kfsj/wztt.shtml'
    },
    {
      id: 'suzhou-stop-liuyuan', name: '留园', lat: 31.3175, lng: 120.5881,
      visitMinutes: 90, tags: ['园林', '历史'], cluster: '古城西北',
      note: '3—10月 07:30—17:30；11—次年2月 07:30—17:00，节假日可能调整。',
      opening: 'seasonal',
      source: 'https://ylj.suzhou.gov.cn/szsylj/kfsj/wztt.shtml'
    }
  ]
};
