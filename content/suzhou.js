// 苏州三场景：拙政园、虎丘、山塘街；原生高清横图与画面观察题。
// 事实来源见各 source 字段与 photo-library/suzhou/SOURCES.md；游览时长为原型估计。
window.CITY_SUZHOU = {
  id: 'suzhou',
  name: '苏州',
  region: '江苏',
  lat: 31.324,
  lng: 120.624,
  scenes: [
  {
    "id": "suzhou-zhuozheng",
    "name": "拙政园·池畔秋色",
    "type": "古典园林",
    "photo": {
      "id": "suzhou-zhuozheng",
      "src": "photo-library/suzhou/zhuozheng/original.jpg",
      "width": 6016,
      "height": 4016,
      "credit": "King of Hearts / Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Humble_Administrator%27s_Garden_Suzhou_November_2017_005.jpg",
      "thumb": {
        "src": "photo-library/suzhou/zhuozheng/thumb.webp?v=d149166470e7",
        "width": 640,
        "height": 427,
        "bytes": 77018
      },
      "screen": {
        "src": "photo-library/suzhou/zhuozheng/screen.webp?v=d149166470e7",
        "width": 1440,
        "height": 961,
        "bytes": 493278
      },
      "detail": {
        "src": "photo-library/suzhou/zhuozheng/detail.webp?v=d149166470e7",
        "width": 2400,
        "height": 1602,
        "bytes": 1577580
      }
    }
  },
  {
    "id": "suzhou-huqiu",
    "name": "虎丘·古塔与山门",
    "type": "古塔庭院",
    "photo": {
      "id": "suzhou-huqiu",
      "src": "photo-library/suzhou/huqiu/original.jpg",
      "width": 4000,
      "height": 3000,
      "credit": "Another Believer / Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Tiger_Hill,_Suzhou,_December_2015_-_10.JPG",
      "thumb": {
        "src": "photo-library/suzhou/huqiu/thumb.webp?v=cdbe124a1678",
        "width": 640,
        "height": 480,
        "bytes": 46350
      },
      "screen": {
        "src": "photo-library/suzhou/huqiu/screen.webp?v=cdbe124a1678",
        "width": 1440,
        "height": 1080,
        "bytes": 266434
      },
      "detail": {
        "src": "photo-library/suzhou/huqiu/detail.webp?v=cdbe124a1678",
        "width": 2400,
        "height": 1800,
        "bytes": 839316
      }
    }
  },
  {
    "id": "suzhou-shantang",
    "name": "山塘街·临河人家",
    "type": "水巷街区",
    "photo": {
      "id": "suzhou-shantang",
      "src": "photo-library/suzhou/shantang/original.jpg",
      "width": 4000,
      "height": 3000,
      "credit": "Another Believer / Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Shantang_Street,_Suzhou_(December_2015)_-_03.JPG",
      "thumb": {
        "src": "photo-library/suzhou/shantang/thumb.webp?v=5339db97fd0d",
        "width": 640,
        "height": 480,
        "bytes": 29176
      },
      "screen": {
        "src": "photo-library/suzhou/shantang/screen.webp?v=5339db97fd0d",
        "width": 1440,
        "height": 1080,
        "bytes": 148752
      },
      "detail": {
        "src": "photo-library/suzhou/shantang/detail.webp?v=5339db97fd0d",
        "width": 2400,
        "height": 1800,
        "bytes": 483978
      }
    }
  }
],
  questions: [
  {
    "sceneId": "suzhou-zhuozheng",
    "q": "第一处园景中央，大面积的水面是什么？",
    "options": [
      "园林池塘",
      "露天游泳池",
      "港口航道",
      "高山冰湖"
    ],
    "answer": 0,
    "points": 20,
    "explain": "画面中央是园林池塘，岸边的树木与建筑倒映在水中。",
    "source": "https://whc.unesco.org/en/list/813/"
  },
  {
    "sceneId": "suzhou-huqiu",
    "q": "第二处场景中，沿着道路望向远处，树梢后露出的高建筑是什么？",
    "options": [
      "风车",
      "古塔",
      "现代电视塔",
      "摩天轮"
    ],
    "answer": 1,
    "points": 20,
    "explain": "沿中间道路远望，能看到层层塔檐的古塔，高于近处的院落屋顶。",
    "source": "https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml"
  },
  {
    "sceneId": "suzhou-shantang",
    "q": "第三处场景里，房屋主要沿着什么排列？",
    "options": [
      "沙丘",
      "机场跑道",
      "河道两岸",
      "高架公路"
    ],
    "answer": 2,
    "points": 20,
    "explain": "水道从画面中间延伸，房屋沿两岸紧密排列，白墙和窗洞倒映在水中。",
    "source": "https://commons.wikimedia.org/wiki/File:Shantang_Street,_Suzhou_(December_2015)_-_03.JPG"
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
