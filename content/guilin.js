// 桂林关卡。探索文字不直接说出城市名；坐标为原片百分比（photo.src 的完整画面）。
// 景点事实见各 source 字段；照片署名与处理见 photo-library/guilin/ATTRIBUTION.md。
window.CITY_GUILIN = {
  id: 'guilin',
  name: '桂林',
  region: '广西壮族自治区',
  lat: 25.274,
  lng: 110.29,
  scenes: [
    {
      id: 'gl-xingping',
      name: '兴坪·老寨山望江',
      type: '山水古镇',
      photo: {
        src: 'photo-library/guilin/xingping/original.jpg',
        width: 6000,
        height: 4000,
        screen: { src: 'photo-library/guilin/xingping/screen.webp', width: 1440, height: 960 },
        thumb: { src: 'photo-library/guilin/xingping/thumb.webp', width: 640, height: 427 },
        detail: { src: 'photo-library/guilin/xingping/detail.webp', width: 2400, height: 1600 },
        credit: 'willianjusten / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/36535023/'
      },
      hotspots: [
        {
          x: 78, y: 64, title: '江在脚下拐了个大弯', tag: '地理',
          text: '右侧江面在山脚下转了一个约 90 度的大弯，像一条带子绕着古镇向南流去。这张照片应是从镇边一座小山的山顶拍的：登山小道直通山顶，是从高处看这段江景的经典位置。',
          en: 'On the right the river swings through a bend of about 90 degrees at the foot of the hill, wrapping round the old town like a ribbon as it flows south. The photo appears to be taken from the summit of a small hill by the town — a classic high viewpoint reached by a footpath.',
          source: 'http://wlt.gxzf.gov.cn/ztzl/lsgd/2025gxlyn/lylx/t19732754.shtml'
        },
        {
          x: 28, y: 81, title: '一千七百年的小镇', tag: '历史',
          text: '下方这片房屋所在的镇子已有 1700 多年历史：公元 265 年这里设县治，不久改名“熙平县”。隋代县治迁走，这里只剩圩集，“熙平”日久被讹传成了今天的镇名。',
          en: 'The town below has more than 1,700 years of history: it became a county seat in AD 265 and was soon renamed Xiping. When the seat moved away in the Sui dynasty only a market remained, and over time “Xiping” was corrupted into the town’s present name.',
          source: 'http://mzt.gxzf.gov.cn/bgdmwhxlzb/gxdmwhyc/t16833316.shtml'
        },
        {
          x: 32, y: 40, title: '拔地而起的峰林', tag: '自然',
          text: '一座座孤立、陡峭的石灰岩山峰，是典型的“峰林”喀斯特。这一带的喀斯特在 2014 年作为“中国南方喀斯特”第二期的一部分列入世界遗产名录，峰林与峰丛是它的代表地貌。',
          en: 'These isolated, steep limestone peaks are classic fenglin (tower) karst. In 2014 this karst was added to the World Heritage List as part of phase II of the South China Karst, with tower and cone karst as its signature landforms.',
          source: 'https://whc.unesco.org/en/list/1248/'
        }
      ]
    },
    {
      id: 'gl-yulong',
      name: '遇龙河竹筏',
      type: '河上漂流',
      photo: {
        src: 'photo-library/guilin/yulong/original.jpg',
        width: 5996,
        height: 3683,
        screen: { src: 'photo-library/guilin/yulong/screen.webp', width: 1440, height: 884 },
        thumb: { src: 'photo-library/guilin/yulong/thumb.webp', width: 640, height: 393 },
        detail: { src: 'photo-library/guilin/yulong/detail.webp', width: 2400, height: 1474 },
        credit: 'yfs-visuals / Pexels',
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
        source: 'https://www.pexels.com/photo/19966000/'
      },
      hotspots: [
        {
          x: 47, y: 84, title: '撑着花伞的竹筏', tag: '体验',
          text: '河面上撑着彩色遮阳伞的是游客乘坐的竹筏。2000 年，岸边一个村子开始用竹筏接待游客；二十多年里，全县营运竹筏从最初的 5 张增加到 3000 多张，成了来这里的必玩项目。',
          en: 'The rafts with colourful parasols carry visitors. In 2000 a riverside village began offering bamboo-raft trips; in twenty-odd years the county’s licensed rafts grew from 5 to more than 3,000, making it a must-do here.',
          source: 'http://slt.gxzf.gov.cn/dtxx/ztjj/hzzzl/xjx/t19030768.shtml'
        },
        {
          x: 72, y: 62, title: '岸边成丛的竹子', tag: '生活',
          text: '右岸垂向水面的是一丛丛竹子。两岸翠竹茂密，竹筏最早就是岸边村民过河、运货的主要交通工具，后来才变成载游客的漂流船。',
          en: 'The clumps leaning over the water on the right are bamboo. Both banks are thick with it, and bamboo rafts were first the villagers’ main way to cross the river and move goods, long before they carried tourists.',
          source: 'http://slt.gxzf.gov.cn/dtxx/ztjj/hzzzl/xjx/t19030768.shtml'
        },
        {
          x: 52, y: 44, title: '云雾里的小河', tag: '地理',
          text: '这条河并不宽，全长 43.5 公里，流域面积约 158 平方公里，一路穿过几个乡镇和二十多个村庄。雨后云雾压在山腰，是这里最常见、也最像水墨画的样子。',
          en: 'This narrow river runs 43.5 kilometres and drains about 158 square kilometres, passing several townships and more than twenty villages. After rain, cloud sits on the hillsides — its most common and most ink-painting-like look.',
          source: 'http://slt.gxzf.gov.cn/dtxx/ztjj/hzzzl/xjx/t19074277.shtml'
        }
      ]
    },
    {
      id: 'gl-longji',
      name: '龙脊梯田',
      type: '山地稻作',
      photo: {
        // Wikimedia 提供的 3840×2880 高分辨率预览，并非原始上传文件（见 ATTRIBUTION.md）。
        src: 'photo-library/guilin/longji/original.jpg',
        width: 3840,
        height: 2880,
        screen: { src: 'photo-library/guilin/longji/screen.webp', width: 1440, height: 1080 },
        thumb: { src: 'photo-library/guilin/longji/thumb.webp', width: 640, height: 480 },
        detail: { src: 'photo-library/guilin/longji/detail.webp', width: 2400, height: 1800 },
        credit: 'Kurinurm / Wikimedia Commons',
        license: 'CC0 1.0',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Longji_rice_terraces_-_2023_10_11_Kaur_Virunurm.jpg'
      },
      hotspots: [
        {
          x: 55.1, y: 38, title: '弯曲的线不是公路', tag: '农耕',
          text: '层层弯线是梯田田埂。农户顺着山坡地势逐级整理田块、引水灌溉，让陡坡也能种水稻；从高处看，田埂才形成一圈又一圈的曲线。',
          en: 'The curving lines are terrace ridges. Farmers level the slope step by step and channel water to it so rice can grow on steep ground; only from above do the ridges form ring after ring of curves.',
          source: 'https://dnr.gxzf.gov.cn/xwzx/gnzx/t19768557.shtml'
        },
        {
          x: 36.5, y: 54, title: '田间的木屋', tag: '生活',
          text: '照片里的木屋紧挨稻田，提示这里仍是有人耕作的山地，而非只为游客铺设的观景花纹。当地持续补助农户耕种、修护田埂与灌溉，维持梯田的农业功能。',
          en: 'The wooden hut beside the paddies shows this is still farmed land, not a pattern laid out for visitors. Local subsidies keep farmers planting, repairing ridges and irrigating, so the terraces stay working farmland.',
          source: 'https://dnr.gxzf.gov.cn/xwzx/sxdt/t19279622.shtml'
        },
        {
          x: 50, y: 81, title: '金色不会持续一整年', tag: '季节',
          text: '近处稻穗已变金黄；这张照片拍于十月。梯田在春季灌水、夏季转绿、秋季成熟时呈金色，不同季节看到的并不是同一幅“金色海报”。',
          en: 'The nearby ears of rice have turned gold; the photo was taken in October. The terraces are flooded in spring, green in summer and golden only at harvest, so each season shows a different picture.',
          source: 'https://guangxi.chinadaily.com.cn/2019-01/16/c_316842.htm'
        }
      ]
    }
  ],
  questions: [
    {
      "q": "河面上这些载着游客、撑着遮阳伞的竹筏，主要靠什么前进？",
      "options": [
        "船夫用竹篙撑行",
        "张帆借风",
        "螺旋桨推动",
        "岸上纤夫拉纤"
      ],
      "answer": 0,
      "points": 20,
      "level": 1,
      "sceneId": "gl-yulong",
      "explain": "河水浅而平缓，竹筏吃水很浅；筏上的人握着长篙点住河底，就能推着竹筏前进。"
    },
    {
      "q": "梯田一片金黄、稻穗低垂，这时最可能是什么时节？",
      "options": [
        "春耕插秧时",
        "夏季稻苗正绿时",
        "秋收前后",
        "冬季休耕时"
      ],
      "answer": 2,
      "points": 20,
      "level": 2,
      "sceneId": "gl-longji",
      "explain": "稻穗低垂、整片转黄是成熟的标志，山区多种一季稻，在秋季收割；这张照片拍于十月。"
    },
    {
      "q": "这些拔地而起、四壁陡峭的孤峰，属于哪种地貌？",
      "options": [
        "丹霞地貌",
        "喀斯特峰林",
        "雅丹地貌",
        "冰川角峰"
      ],
      "answer": 1,
      "points": 20,
      "level": 3,
      "sceneId": "gl-xingping",
      "explain": "石灰岩在湿热气候下被流水长期溶蚀，留下一座座孤立、陡峭的山峰，就是喀斯特峰林。"
    }
  ],
  stops: [
    {
      id: 'gl-elephant', name: '象鼻山', lat: 25.2705, lng: 110.2922,
      visitMinutes: 75, interests: ['自然', '摄影'], openingHours: null,
      note: '市区景点；入园规则与当日时段以景区公告为准。',
      source: 'https://www.glljsh.com/post/13772.html'
    },
    {
      id: 'gl-reed', name: '芦笛岩', lat: 25.3127, lng: 110.2667,
      visitMinutes: 75, interests: ['自然'], openingHours: null,
      note: '位于秀峰区芦笛路；洞内步行游览，适合和市区景点同日。',
      source: 'https://wlt.gxzf.gov.cn/ztzl/rdjj/gxajlyjq/t19045600.shtml'
    },
    {
      id: 'gl-lijiang', name: '漓江游船', lat: 24.9608, lng: 110.4575,
      visitMinutes: 240, interests: ['自然', '摄影'], openingHours: null,
      note: '这是河段大致中心坐标；乘船须从实际码头出发，路线和时长取决于水位、班次。',
      source: 'https://www.lijiangriver.com.cn/'
    },
    {
      id: 'gl-xingping', name: '兴坪古镇与老寨山', lat: 24.9191, lng: 110.5236,
      visitMinutes: 120, interests: ['摄影', '文化'], openingHours: null,
      note: '登老寨山有陡峭步道，看江湾与日落需预留体力和下山时间。',
      source: 'http://wlt.gxzf.gov.cn/ztzl/lsgd/2025gxlyn/lylx/t19732754.shtml'
    },
    {
      id: 'gl-yulong', name: '遇龙河竹筏漂流', lat: 24.7722, lng: 110.4447,
      visitMinutes: 120, interests: ['自然', '摄影'], openingHours: null,
      note: '竹筏码头与漂流段有多处，时长与是否开航受水位影响，以当日安排为准。',
      source: 'http://slt.gxzf.gov.cn/dtxx/ztjj/hzzzl/xjx/t19030768.shtml'
    },
    {
      id: 'gl-longji', name: '龙脊梯田', lat: 25.753, lng: 110.1206,
      visitMinutes: 210, interests: ['自然', '摄影'], openingHours: null,
      note: '位于龙胜县，离市区较远，应单独留出半日以上并核对往返交通。',
      source: 'https://wlt.gxzf.gov.cn/ztzl/rdjj/gxajlyjq/t19045600.shtml'
    }
  ]
};
