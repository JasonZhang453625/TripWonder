/* Sample UGC journeys for the community (社区 · 玩家 Journey). Authors are fictional sample users; photos are
   Wikimedia Commons files listed in photo-library/ugc/SOURCES.md, with display versions in content/ugc-media.js.
   A UGC journey keeps the official journey shape plus: channel 'ugc', a spoiler-free `title` shown before the
   player has finished it (the real `name` is the answer), author, intro, boardEnabled (publisher's choice) and
   review ('approved' is visible to everyone). Questions must be answerable from the photos alone: scenes carry no
   on-photo notes. */
(() => {
  'use strict';
  const M = window.UGC_MEDIA || {};
  const scene = (id, name, nameEn, type, typeEn) => ({id, name, nameEn, type, typeEn, photo: M[id]});
  const question = (sceneId, q, qEn, options, optionsEn, answer, explain, explainEn) => ({sceneId, q, qEn, options, optionsEn, answer, explain, explainEn});

  window.UGC_JOURNEYS = [
    {
      id: 'ugc-shapowei', channel: 'ugc', review: 'approved', boardEnabled: true, publishedAt: '2026-10-12',
      author: {name: '海蛎煎不加蛋', nameEn: 'NoEggOysterOmelette'},
      title: '十年前后的渔港老街', titleEn: 'A fishing harbour, ten years apart',
      name: '沙坡尾避风坞', nameEn: 'Shapowei Typhoon Shelter', region: '福建 · 厦门', regionEn: 'Xiamen, Fujian',
      lat: 24.4447, lng: 118.0898,
      intro: '在这附近住了很多年，看着它从渔船挤满的避风港，变成年轻人周末散步的水边街区。一张是十年前，一张是现在。',
      introEn: 'I lived nearby for years and watched it change from a shelter crowded with fishing boats into a waterside street for weekend strolls. One photo is from ten years ago, one is from now.',
      scenes: [
        scene('ugc-shapowei-harbor-2015', '避风坞旧貌', 'The shelter, 2015', '渔港', 'Fishing harbour'),
        scene('ugc-shapowei-harbor-now', '避风坞现在', 'The shelter today', '水岸街区', 'Waterside street')
      ],
      questions: [
        question('ugc-shapowei-harbor-2015', '第一张照片里，停在水边的主要是什么船？', 'In the first photo, what kind of boats are moored by the water?', ['游艇', '渔船', '邮轮', '军舰'], ['Yachts', 'Fishing boats', 'Cruise ships', 'Warships'], 1, '木壳的小渔船挤在坞里，这里原本是渔船躲避台风的避风坞。', 'Small wooden fishing boats crowd the basin: this was a shelter where fishing boats waited out typhoons.'),
        question('ugc-shapowei-harbor-now', '对比两张照片，这片水边后来最明显的变化是？', 'Comparing the two photos, what is the biggest change by the water?', ['老楼全部拆除，建成高楼', '水道被填平，改成马路', '修了栈道，沿水开满店铺', '改造成了海滨浴场'], ['The old houses were replaced by towers', 'The channel was filled in for a road', 'A boardwalk went in, lined with shops', 'It became a bathing beach'], 2, '老楼大多还在，泥岸修成了木栈道，沿水开起了咖啡馆和小店。', 'Most old buildings remain; the muddy bank became a boardwalk lined with cafés and shops.'),
        question('ugc-shapowei-harbor-2015', '这种供渔船躲避台风的“避风坞”，最可能出现在哪里？', 'Where would you most likely find a typhoon shelter for fishing boats like this?', ['西北的高原湖泊', '东北的林区', '东南沿海的港口城市', '西南的山区小镇'], ['A highland lake in the northwest', 'A forest in the northeast', 'A port city on the southeast coast', 'A mountain town in the southwest'], 2, '台风多发、渔业发达的东南沿海港口才需要这样的避风坞。', 'Shelters like this belong to typhoon-prone fishing ports on the southeast coast.')
      ],
      stops: []
    },
    {
      id: 'ugc-shibati', channel: 'ugc', review: 'approved', boardEnabled: true, publishedAt: '2026-10-09',
      author: {name: '爬坡上坎', nameEn: 'UphillAllDay'},
      title: '一级一级往下走的老街', titleEn: 'An old street, one step at a time',
      name: '十八梯', nameEn: 'Shibati', region: '重庆 · 渝中', regionEn: 'Yuzhong, Chongqing',
      lat: 29.5551, lng: 106.5717,
      intro: '小时候放学抄近路就走这条梯坎。前几年翻修后重新开放了，拍了两张对比，你能猜出是哪里吗？',
      introEn: 'As a kid I took these steps as a shortcut home from school. It reopened after renovation a few years ago, so here is a before and after. Can you guess where it is?',
      scenes: [
        scene('ugc-shibati-old-steps', '老街石阶', 'The old stone steps', '老街', 'Old street'),
        scene('ugc-shibati-new-street', '翻修后的梯街', 'The renovated street', '街区', 'Street')
      ],
      questions: [
        question('ugc-shibati-old-steps', '第一张照片里，这条老街主要靠什么方式通行？', 'In the first photo, how do people get along this old street?', ['走石阶', '坐有轨电车', '骑自行车', '坐缆车'], ['Walking the stone steps', 'Taking a tram', 'Cycling', 'Riding a cable car'], 0, '整条街就是一级级石阶，只能步行上下。', 'The street is one long flight of stone steps, so people walk up and down.'),
        question('ugc-shibati-new-street', '第二张照片中，近处老街屋顶与远处建筑形成什么对照？', 'In the second photo, what contrasts with the old roofs in front?', ['大片沙丘', '连绵雪山', '现代高楼', '海边灯塔'], ['Sand dunes', 'Snowy mountains', 'Modern high-rise buildings', 'A coastal lighthouse'], 2, '近处是低矮灰瓦屋顶，远处是现代高楼，两种尺度的建筑形成鲜明对照。', 'Low grey-tiled roofs in front contrast with modern high-rise buildings behind.'),
        question('ugc-shibati-new-street', '对比两张照片，老街为什么主要用台阶连接不同高度？', 'Comparing the photos, why do steps connect the different levels of the neighbourhood?' , ['为了让汽车开得更快', '街区依山而建，高差明显', '因为街区漂浮在水面上', '为了避开机场跑道'], ['To let cars travel faster', 'It is built on a hillside with changing elevations', 'It floats on water', 'To avoid an airport runway'], 1, '两张照片中的街道都顺着坡地上下延伸，台阶用于连接不同高度。', 'The streets in both photographs follow sloping ground, with steps connecting different elevations.')
      ],
      stops: []
    },
    {
      id: 'ugc-dongjiao', channel: 'ugc', review: 'approved', boardEnabled: false, publishedAt: '2026-10-05',
      author: {name: '熊猫不吃辣', nameEn: 'PandaNoSpice'},
      title: '两根烟囱下的周末', titleEn: 'A weekend under two chimneys',
      name: '东郊记忆', nameEn: 'Dongjiao Memory', region: '四川 · 成都', regionEn: 'Chengdu, Sichuan',
      lat: 30.6703, lng: 104.1219,
      intro: '周末常来这里看展、听现场。只放一张图，难度高一点。留言板先不开，答案留给你自己去现场找。',
      introEn: 'I come here at weekends for exhibitions and live music. Just one photo, so it is a little harder. Comments are off: go and find the answer yourself.',
      scenes: [
        scene('ugc-dongjiao-south-gate', '红砖拱门', 'Red-brick arches', '文创园区', 'Creative park')
      ],
      questions: [
        question('ugc-dongjiao-south-gate', '画面中两根高耸的圆柱形构筑物，原本最可能是做什么用的？', 'What were the two tall cylindrical structures most likely built for?', ['灯塔', '钟楼', '电视塔', '工厂烟囱'], ['Lighthouses', 'Clock towers', 'TV towers', 'Factory chimneys'], 3, '砖砌和混凝土的高烟囱，是老工厂锅炉房的典型配置。', 'Tall brick and concrete chimneys are typical of an old factory boiler house.'),
        question('ugc-dongjiao-south-gate', '这排红砖拱门建筑，过去最可能是？', 'What was this row of red-brick arched buildings most likely used for in the past?', ['工厂厂房', '寺庙大殿', '火车站候车厅', '中学教学楼'], ['A factory workshop', 'A temple hall', 'A railway waiting hall', 'A school building'], 0, '大跨度的红砖厂房配上烟囱，说明这里原来是工业厂区。', 'Wide red-brick workshops next to chimneys show this was once an industrial site.'),
        question('ugc-dongjiao-south-gate', '把旧厂房改成展演、餐饮和创意空间的地方，通常被称为？', 'What do we usually call an old factory turned into venues, food and creative spaces?', ['自然保护区', '文创园区', '历史古镇', '主题乐园'], ['A nature reserve', 'A creative park', 'A historic town', 'A theme park'], 1, '旧工业建筑改造成文化创意空间，就是常说的文创园区。', 'An old industrial site reused for culture and creative work is called a creative park.')
      ],
      stops: []
    }
  ];

  // Sample notes for the UGC scenes that keep their board on; same row format as content/bubble-seed.js.
  const NAMES = [['阿吉', 'Aji'], ['码头的风', 'Pier Breeze'], ['半糖', 'Half Sugar'], ['老城区', 'Old Town'], ['走走停停', 'Stop and Go']];
  const rows = {
    'ugc-shapowei-harbor-2015': [[30, 70, 'been', 0, '以前退潮的时候这里一股海腥味，现在想起来还挺怀念。', 'At low tide it used to smell of the sea. I kind of miss it now.', 12], [70, 25, 'want', 2, '没想到十年前是这个样子，变化好大。', 'I had no idea it looked like this ten years ago. What a change.', 6]],
    'ugc-shapowei-harbor-now': [[40, 70, 'been', 1, '傍晚沿着栈道走一圈，水里的倒影特别好看。', 'Walk the boardwalk at dusk: the reflections are lovely.', 18], [80, 60, 'been', 4, '老楼一楼的冰淇淋店排队很久，但值得。', 'The ice-cream shop on the ground floor has a long queue, but it’s worth it.', 9], [15, 30, 'want', 3, '收藏了，下次过去一定去拍日落。', 'Saved. Next time I’ll go for the sunset.', 4]],
    'ugc-shibati-old-steps': [[70, 40, 'been', 3, '以前这一路都是小吃摊和茶馆，下雨天石阶特别滑。', 'This used to be all snack stalls and teahouses; the steps get slippery in the rain.', 14], [20, 30, 'want', 4, '好有烟火气的老街，可惜现在看不到了。', 'Such a lively old street. A pity it’s gone now.', 5]],
    'ugc-shibati-new-street': [[20, 40, 'been', 0, '翻修后很好拍，就是周末人太多，建议工作日去。', 'Great for photos after the renovation, but packed at weekends. Go on a weekday.', 11], [80, 70, 'want', 2, '想从上面一路走到江边。', 'I want to walk all the way down to the river.', 3]]
  };
  window.TW_UGC_BUBBLE_SEED = Object.freeze(Object.fromEntries(Object.entries(rows).map(([sceneId, list]) => [sceneId, list.map(([x, y, kind, who, text, en, likes], i) => ({id: `seed-${sceneId}-${i}`, u: x / 100, v: y / 100, kind, name: NAMES[who][0], nameEn: NAMES[who][1], text, textEn: en, likes, seed: true}))])));
})();
