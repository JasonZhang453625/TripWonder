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
      }
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
      }
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
      }
    }
  ],
  questions: [
    {
      q: '从高处看，山脚下的江水在镇子旁边是什么样子？',
      options: ['分成三条支流', '流进一个湖泊', '拐了一个大弯', '笔直向前流去'],
      answer: 2, points: 30,
      source: '第 1 处 · 江在脚下拐了个大弯',
      explain: '江面在山脚下转了约 90 度的大弯，像一条带子绕着古镇流过。'
    },
    {
      q: '河面上撑着彩色遮阳伞、载着游客的是什么？',
      options: ['快艇', '帆船', '龙舟', '竹筏'],
      answer: 3, points: 30,
      source: '第 2 处 · 撑着花伞的竹筏',
      explain: '撑着花伞的是游客乘坐的竹筏。竹筏原是岸边村民过河、运货的工具，后来变成了漂流船。'
    },
    {
      q: '山坡上层层弯曲的田埂，最主要解决了什么问题？',
      options: ['给游船标出航道', '把陡坡整理成能耕种、灌溉的田块', '标记地下洞穴的位置', '阻挡冬季积雪下滑'],
      answer: 1, points: 40,
      explain: '梯田顺着地势逐层开垦，并通过田埂、引水维护耕作条件；它首先是一套仍在使用的山地稻作系统。',
      source: 'https://dnr.gxzf.gov.cn/xwzx/gnzx/t19768557.shtml'
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
