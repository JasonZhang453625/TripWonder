/* Sample UGC journeys for the community (社区 · 玩家 Journey). Authors are fictional sample users; photos are
   Wikimedia Commons files listed in photo-library/ugc/ATTRIBUTION.md, with display versions in content/ugc-media.js.
   A UGC journey keeps the official journey shape plus: channel 'ugc', a spoiler-free `title` shown before the
   player has finished it (the real `name` is the answer), author, intro, boardEnabled (publisher's choice) and
   review ('approved' is visible to everyone). Questions must be answerable from the photos alone: the challenge
   has no clue hotspots; hotspots are only shown when browsing after the game. */
(() => {
  'use strict';
  const M = window.UGC_MEDIA || {};
  window.UGC_SAMPLE_REVISION = '20261017-photos3-v1';
  const scene = (id, name, nameEn, type, typeEn, hotspots) => ({id, name, nameEn, type, typeEn, photo: M[id], hotspots: hotspots.map(([x, y, tag, title, titleEn, text, en]) => ({x, y, tag, title, titleEn, text, en}))});
  const question = (sceneId, q, qEn, options, optionsEn, answer, explain, explainEn) => ({sceneId, q, qEn, options, optionsEn, answer, explain, explainEn});

  window.UGC_JOURNEYS = [
    {
      id: 'ugc-shapowei', channel: 'ugc', review: 'approved', boardEnabled: true, publishedAt: '2026-10-12',
      author: {name: '海蛎煎不加蛋', nameEn: 'NoEggOysterOmelette'},
      title: '十年前后的渔港老街', titleEn: 'A fishing harbour, ten years apart',
      name: '沙坡尾避风坞', nameEn: 'Shapowei Typhoon Shelter', region: '福建 · 厦门', regionEn: 'Xiamen, Fujian',
      lat: 24.4447, lng: 118.0898,
      intro: '从旧渔港到临水街区，再走上灯笼下的木栈道。用三张照片看看这片水边十年来的变化，你能猜出是哪里吗？',
      introEn: 'From the old fishing harbour to the waterfront, then onto a lantern-lined boardwalk. Three photos trace a decade of change. Can you guess where this is?',
      scenes: [
        scene('ugc-shapowei-harbor-2015', '避风坞旧貌', 'The shelter, 2015', '渔港', 'Fishing harbour', [
          [17, 60, '生活', '退潮后的船', 'Boats at low tide', '退潮时坞里的水几乎见底，渔船就搁在泥滩上，等涨潮再出海。', 'At low tide the water almost drains away and the boats sit on the mud until the tide comes back in.'],
          [58, 36, '建筑', '临水的老楼', 'Old houses on the water', '贴着水边挤在一起的老楼，一楼多是修船、卖渔具和小吃的铺子。', 'Old houses squeeze together along the water; the ground floors were boat repair shops, tackle stores and snack stalls.'],
          [10, 34, '城市', '远处的高楼', 'Towers in the distance', '老渔港的背后就是新城区的高楼，新旧只隔着一片水。', 'Right behind the old harbour stand the towers of the new city, with only water in between.']
        ]),
        scene('ugc-shapowei-harbor-now', '避风坞现在', 'The shelter today', '水岸街区', 'Waterside street', [
          [20, 58, '生活', '还在的小船', 'The boats that stayed', '仍有几条小船停在坞里，提醒你这里原本是渔港。', 'A few small boats still moor here, a reminder that this was once a fishing harbour.'],
          [72, 47, '体验', '水边的栈道', 'The waterside boardwalk', '原来的泥岸修成了步道和栏杆，咖啡馆、小店沿水一字排开。', 'The muddy bank became a boardwalk with railings, lined with cafés and small shops.'],
          [92, 30, '建筑', '翻新的老楼', 'Renovated old buildings', '老楼大多保留了下来，换了颜色和招牌，变成店铺和民宿。', 'Most of the old buildings survived, repainted and re-signed as shops and guesthouses.']
        ]),
        scene('ugc-shapowei-harbor-wide', '临水栈道', 'The waterside boardwalk', '步行街', 'Walking street', [
          [48, 38, '生活', '沿水的灯笼', 'Lanterns by the water', '红灯笼沿着步道排开，右侧老楼的一层开着店铺。', 'Red lanterns line the boardwalk beside ground-floor shops.'],
          [48, 84, '体验', '木栈道', 'The wooden boardwalk', '木板铺成的步行道沿岸延伸，栏杆把行人与水面隔开。', 'A wooden walkway follows the shore, separated from the water by a railing.'],
          [15, 64, '地理', '水面上的小船', 'A small boat', '小船仍停在岸边，让这段步行街保留着渔港的轮廓。', 'A small boat moored beside the walkway recalls the fishing harbour.']
        ])
      ],
      questions: [
        question('ugc-shapowei-harbor-2015', '第一张照片里，停在水边的主要是什么船？', 'In the first photo, what kind of boats are moored by the water?', ['游艇', '渔船', '邮轮', '军舰'], ['Yachts', 'Fishing boats', 'Cruise ships', 'Warships'], 1, '木壳的小渔船挤在坞里，这里原本是渔船躲避台风的避风坞。', 'Small wooden fishing boats crowd the basin: this was a shelter where fishing boats waited out typhoons.'),
        question('ugc-shapowei-harbor-now', '对比两张照片，这片水边后来最明显的变化是？', 'Comparing the two photos, what is the biggest change by the water?', ['老楼全部拆除，建成高楼', '水道被填平，改成马路', '修了栈道，沿水开满店铺', '改造成了海滨浴场'], ['The old houses were replaced by towers', 'The channel was filled in for a road', 'A boardwalk went in, lined with shops', 'It became a bathing beach'], 2, '老楼大多还在，泥岸修成了木栈道，沿水开起了咖啡馆和小店。', 'Most old buildings remain; the muddy bank became a boardwalk lined with cafés and shops.'),
        question('ugc-shapowei-harbor-wide', '结合小渔船、临水老楼和沿岸栈道，这组照片更可能来自哪里？', 'Considering the fishing boats, waterside houses and boardwalk, where is this most likely?', ['西北的高原牧场', '东北的林区', '东南沿海的港口街区', '西南的高山雪场'], ['A highland pasture in the northwest', 'A forest in the northeast', 'A waterfront district in a southeast port city', 'An alpine ski resort in the southwest'], 2, '小渔船和避风水面指向港口，沿水老楼与木栈道显示这里已成为可以步行游逛的滨水街区。', 'Fishing boats and sheltered water suggest a port, while the waterfront houses and boardwalk show its pedestrian use.')
      ],
      stops: []
    },
    {
      id: 'ugc-shibati', channel: 'ugc', review: 'approved', boardEnabled: true, publishedAt: '2026-10-09',
      author: {name: '爬坡上坎', nameEn: 'UphillAllDay'},
      title: '一级一级往下走的老街', titleEn: 'An old street, one step at a time',
      name: '十八梯', nameEn: 'Shibati', region: '重庆 · 渝中', regionEn: 'Yuzhong, Chongqing',
      lat: 29.5551, lng: 106.5717,
      intro: '从老街石阶到翻修后的灰瓦屋顶，再沿指路牌往下走。三张照片里，台阶把老街和新城连在一起。',
      introEn: 'From the old stone steps to renovated tiled roofs, then down past a signpost. Three views show steps connecting the old street and the modern city.',
      scenes: [
        scene('ugc-shibati-old-steps', '老街石阶', 'The old stone steps', '老街', 'Old street', [
          [46, 84, '地理', '磨圆的石阶', 'Worn stone steps', '整条街都是台阶，上上下下全靠走，石阶边缘被踩得发亮。', 'The whole street is steps; everyone walks, and the edges are polished by feet.'],
          [24, 62, '生活', '街边的小屋', 'A house by the steps', '青砖小屋贴着台阶而建，门口的告示板写着街坊的生活信息。', 'Small brick houses hug the steps; a notice board by the door carries neighbourhood news.'],
          [52, 24, '自然', '红色的花', 'Red blossoms', '石阶上方的大树开着红花，给灰色老街添了一点颜色。', 'The big tree over the steps is in red bloom, colouring the grey old street.']
        ]),
        scene('ugc-shibati-new-street', '翻修后的梯街', 'The renovated street', '街区', 'Street', [
          [35, 54, '建筑', '青瓦坡屋顶', 'Grey-tiled roofs', '翻修后的房子用了青瓦坡顶和木构外观，层层叠叠顺着山势往下。', 'The rebuilt houses use grey tiles and timber fronts, stacked down the slope.'],
          [72, 73, '体验', '人挤人的台阶', 'Crowded steps', '台阶还是那条台阶，只是两边变成了店铺和小吃，周末人很多。', 'Same steps as ever, but now lined with shops and snacks, and packed at weekends.'],
          [62, 18, '城市', '新旧楼群的对照', 'Old roofs and modern towers', '近处是层层叠叠的灰瓦屋顶，远处是现代高楼。两种高度和形态的建筑同时出现在画面里，形成老街与新城的对照。', 'Layered grey roofs in the foreground contrast with modern towers in the distance. The two scales reveal an old neighbourhood within a growing city.']
        ]),
        scene('ugc-shibati-street-2024', '梯街指路牌', 'A signpost on the steps', '山城街区', 'Hillside district', [
          [48, 33, '体验', '步行指路牌', 'Walking directions', '指路牌标出店铺与公共设施的方向，方便行人在街巷里寻找路线。', 'The signpost points pedestrians towards shops and public facilities.'],
          [56, 82, '地理', '顺坡向下的街道', 'A street descending the slope', '石阶沿坡地向下延伸，左右房屋的入口处在不同高度。', 'Steps descend the slope between buildings at different elevations.'],
          [73, 13, '城市', '老街后的高楼', 'Towers behind the old street', '近处的木构外观与灰瓦屋顶，和远处的现代高楼形成对照。', 'Timber fronts and tiled roofs contrast with the modern towers beyond.']
        ])
      ],
      questions: [
        question('ugc-shibati-old-steps', '第一张照片里，这条老街主要靠什么方式通行？', 'In the first photo, how do people get along this old street?', ['走石阶', '坐有轨电车', '骑自行车', '坐缆车'], ['Walking the stone steps', 'Taking a tram', 'Cycling', 'Riding a cable car'], 0, '整条街就是一级级石阶，只能步行上下。', 'The street is one long flight of stone steps, so people walk up and down.'),
        question('ugc-shibati-new-street', '第二张照片中，近处老街屋顶与远处建筑形成什么对照？', 'In the second photo, what contrasts with the old roofs in front?', ['大片沙丘', '连绵雪山', '现代高楼', '海边灯塔'], ['Sand dunes', 'Snowy mountains', 'Modern high-rise buildings', 'A coastal lighthouse'], 2, '近处是低矮灰瓦屋顶，远处是现代高楼，两种尺度的建筑形成鲜明对照。', 'Low grey-tiled roofs in front contrast with modern high-rise buildings behind.'),
        question('ugc-shibati-street-2024', '第三张照片里，为什么道路主要用石阶连接各处？', 'Why do steps connect the different parts of the street in the third photo?', ['为了让汽车开得更快', '街区依山而建，高差明显', '因为街区漂浮在水面上', '为了避开机场跑道'], ['To let cars travel faster', 'It is built on a hillside with changing elevations', 'It floats on water', 'To avoid an airport runway'], 1, '指路牌后方的街道明显向下延伸，沿坡布置的房屋入口高低不同，需要台阶连接。', 'The street descends behind the signpost, linking buildings at different elevations with steps.')
      ],
      stops: []
    },
    {
      id: 'ugc-dongjiao', channel: 'ugc', review: 'approved', boardEnabled: false, publishedAt: '2026-10-05',
      author: {name: '熊猫不吃辣', nameEn: 'PandaNoSpice'},
      title: '两根烟囱下的周末', titleEn: 'A weekend under two chimneys',
      name: '东郊记忆', nameEn: 'Dongjiao Memory', region: '四川 · 成都', regionEn: 'Chengdu, Sichuan',
      lat: 30.6703, lng: 104.1219,
      intro: '从地铁到老厂区，再到演出剧院，三张照片串起一个周末。场景气泡先不开，独立评论区照常保留。',
      introEn: 'From the metro to the old factory and a theatre: three photos of a weekend route. Scene bubbles are off; independent comments stay available.',
      scenes: [
        scene('ugc-dongjiao-south-gate', '红砖拱门', 'Red-brick arches', '文创园区', 'Creative park', [
          [42, 28, '历史', '两根烟囱', 'Two chimneys', '高高的砖烟囱和混凝土烟囱都是老厂区留下的，如今成了这里的标志。', 'The tall brick and concrete chimneys are left from the old works and are now its landmarks.'],
          [70, 70, '建筑', '红砖拱门', 'Red-brick arches', '厂房的红砖墙开出一排拱门，改成了园区入口和店铺。', 'The red-brick factory wall opens into a row of arches, now the entrance and shops.'],
          [43, 66, '体验', '门头的标识', 'The gate sign', '拱门上方的小标识写着这是园区的南大门，进去就是展演和餐饮空间。', 'The small sign over the arch marks the south gate; inside are venues, galleries and food.']
        ]),
        scene('ugc-dongjiao-theatre', '旧厂房剧院', 'A theatre in the old works', '演出空间', 'Performance venue', [
          [43, 18, '建筑', '架空的管道', 'Overhead pipes', '粗大的管道与交叉钢架保留着旧厂区的工业外观。', 'Large pipes and cross-braced steelwork retain the industrial appearance.'],
          [47, 65, '体验', '剧院入口', 'The theatre entrance', '红色标识与入口空间显示，这里已成为可以观看演出的场所。', 'The red signage and entrance identify a space now used for performances.'],
          [81, 77, '生活', '入口前的步行空间', 'Space outside the entrance', '入口前留出宽阔的铺装空地，方便观众步行、等候和集合。', 'The paved space outside gives visitors room to walk, wait and meet.']
        ]),
        scene('ugc-dongjiao-metro-platform', '附近的地铁站台', 'The nearby metro platform', '城市轨道交通', 'Urban rail', [
          [81, 54, '交通', '站台屏蔽门', 'Platform screen doors', '整排玻璃屏蔽门将候车区与列车轨道分隔。', 'Glass platform doors separate waiting passengers from the tracks.'],
          [41, 80, '体验', '候车区域', 'The waiting area', '明亮的地面与柱列之间留出通行空间，便于乘客上下车。', 'Open space between the columns lets passengers move along the platform.'],
          [55, 49, '交通', '站台中的扶梯', 'Escalators on the platform', '扶梯连接站台与其他楼层，方便乘客进出车站。', 'Escalators connect the platform with the other levels of the station.']
        ])
      ],
      questions: [
        question('ugc-dongjiao-south-gate', '画面中两根高耸的圆柱形构筑物，原本最可能是做什么用的？', 'What were the two tall cylindrical structures most likely built for?', ['灯塔', '钟楼', '电视塔', '工厂烟囱'], ['Lighthouses', 'Clock towers', 'TV towers', 'Factory chimneys'], 3, '砖砌和混凝土的高烟囱，是老工厂锅炉房的典型配置。', 'Tall brick and concrete chimneys are typical of an old factory boiler house.'),
        question('ugc-dongjiao-theatre', '第二张照片同时出现旧管道、钢架和剧院入口，最合理的解释是？', 'Why do old pipes, steelwork and a theatre entrance appear together in the second photo?', ['旧工业建筑被改作演出空间', '这里是一座正在炼钢的高炉', '这是港口的渔船维修区', '这是一座古代城门'], ['An industrial building has been reused for performances', 'This is an active steelmaking furnace', 'This is a fishing-boat repair yard', 'This is an ancient city gate'], 0, '旧管道和钢架保留工业痕迹，剧院标识与入口则说明空间已有新的文化用途。', 'The pipes and steelwork preserve the industrial character, while the theatre entrance shows a new cultural use.'),
        question('ugc-dongjiao-metro-platform', '把旧厂房、剧院与附近的地铁站结合起来，哪种变化最符合这片区域？', 'Which change best fits the old factory, theatre and nearby metro station shown in these photos?', ['由工业厂区转向文创休闲街区', '由沙漠改造成远洋渔港', '由农田改造成高山滑雪场', '由机场改造成自然保护区'], ['An industrial site is becoming a cultural leisure district', 'A desert has become an ocean fishing port', 'Farmland has become an alpine ski resort', 'An airport has become a nature reserve'], 0, '保留的工业建筑被用于演出等活动，附近的城市轨道交通也方便游客到达，符合城市文创街区的形态。', 'Reused industrial buildings, performance venues and urban rail access fit a cultural leisure district.')
      ],
      stops: []
    }
  ];

  for (const journey of window.UGC_JOURNEYS) {
    journey.sampleRevision = window.UGC_SAMPLE_REVISION;
    journey.publishedAt = '2026-10-17';
  }

  // Sample notes for the UGC scenes that keep their board on; same row format as content/bubble-seed.js.
  const NAMES = [['阿吉', 'Aji'], ['码头的风', 'Pier Breeze'], ['半糖', 'Half Sugar'], ['老城区', 'Old Town'], ['走走停停', 'Stop and Go']];
  const rows = {
    'ugc-shapowei-harbor-2015': [[30, 70, 'been', 0, '以前退潮的时候这里一股海腥味，现在想起来还挺怀念。', 'At low tide it used to smell of the sea. I kind of miss it now.', 12], [70, 25, 'want', 2, '没想到十年前是这个样子，变化好大。', 'I had no idea it looked like this ten years ago. What a change.', 6]],
    'ugc-shapowei-harbor-now': [[40, 70, 'been', 1, '傍晚沿着栈道走一圈，水里的倒影特别好看。', 'Walk the boardwalk at dusk: the reflections are lovely.', 18], [80, 60, 'been', 4, '老楼一楼的冰淇淋店排队很久，但值得。', 'The ice-cream shop on the ground floor has a long queue, but it’s worth it.', 9], [15, 30, 'want', 3, '收藏了，下次过去一定去拍日落。', 'Saved. Next time I’ll go for the sunset.', 4]],
    'ugc-shibati-old-steps': [[70, 40, 'been', 3, '以前这一路都是小吃摊和茶馆，下雨天石阶特别滑。', 'This used to be all snack stalls and teahouses; the steps get slippery in the rain.', 14], [20, 30, 'want', 4, '好有烟火气的老街，可惜现在看不到了。', 'Such a lively old street. A pity it’s gone now.', 5]],
    'ugc-shibati-new-street': [[20, 40, 'been', 0, '翻修后很好拍，就是周末人太多，建议工作日去。', 'Great for photos after the renovation, but packed at weekends. Go on a weekday.', 11], [80, 70, 'want', 2, '想从上面一路走到江边。', 'I want to walk all the way down to the river.', 3]],
    'ugc-shapowei-harbor-wide': [[35, 44, 'been', 1, '沿水走一小段，慢慢看老楼和小船。', 'Take a slow walk beside the water and look at the houses and boats.', 8], [73, 67, 'want', 2, '想挑个晴天来这里散步。', 'I’d like to come for a walk on a clear day.', 4]],
    'ugc-shibati-street-2024': [[58, 47, 'been', 0, '下台阶时慢一点，边走边拍很容易分心。', 'Take your time on the steps; photos can distract you.', 9], [24, 72, 'want', 4, '想找个工作日来慢慢逛。', 'I’d like to explore here on a weekday.', 3]]
  };
  // Shorter notes placed near each other, so nearby ordinary notes group into one envelope bubble.
  const extra = {
    'ugc-shapowei-harbor-2015': [[54, 72, 'been', 0, '慢慢逛，别赶时间。', 'Take it slow. Don’t rush.', 4], [59, 69, 'want', 0, '找个地方坐一会儿，很惬意。', 'Find a spot to sit for a while. Lovely.', 4], [68, 47, 'been', 3, '已收藏，下次一定来。', 'Saved. Next time for sure.', 1], [73, 44, 'been', 4, '带上充电宝，根本拍不停。', 'Bring a power bank. You won’t stop shooting.', 6]],
    'ugc-shapowei-harbor-now': [[41, 31, 'want', 3, '早点来，能避开人潮。', 'Come early to beat the crowds.', 6], [46, 28, 'been', 0, '这个角度很好出片。', 'A great angle for photos.', 7], [57, 43, 'been', 0, '站在这里，心会安静下来。', 'Standing here, everything goes quiet.', 4], [62, 40, 'want', 0, '雨天来也别有味道。', 'It has its own charm on a rainy day.', 7]],
    'ugc-shapowei-harbor-wide': [[19, 35, 'been', 2, '这个角度很好出片。', 'A great angle for photos.', 1], [23, 32, 'been', 1, '和照片里一模一样！', 'Exactly like the photo!', 7], [29, 71, 'been', 4, '记得穿双舒服的鞋。', 'Wear comfortable shoes.', 4], [34, 68, 'been', 1, '雨天来也别有味道。', 'It has its own charm on a rainy day.', 3]],
    'ugc-shibati-old-steps': [[60, 76, 'been', 3, '已收藏，下次一定来。', 'Saved. Next time for sure.', 7], [65, 73, 'been', 4, '带上充电宝，根本拍不停。', 'Bring a power bank. You won’t stop shooting.', 5], [72, 57, 'been', 0, '拍全景记得横着拿手机。', 'Hold your phone sideways for the full view.', 1], [77, 54, 'been', 2, '记得穿双舒服的鞋。', 'Wear comfortable shoes.', 7]],
    'ugc-shibati-new-street': [[65, 56, 'been', 0, '傍晚的光线最温柔。', 'The evening light is the softest.', 4], [69, 53, 'been', 1, '细节越看越有意思。', 'The details get better the longer you look.', 5], [51, 34, 'been', 0, '慢慢逛，别赶时间。', 'Take it slow. Don’t rush.', 4], [55, 31, 'want', 2, '这个角度很好出片。', 'A great angle for photos.', 5]],
    'ugc-shibati-street-2024': [[34, 29, 'want', 3, '雨天来也别有味道。', 'It has its own charm on a rainy day.', 2], [38, 26, 'been', 4, '站在这里，心会安静下来。', 'Standing here, everything goes quiet.', 3], [29, 49, 'been', 3, '早点来，能避开人潮。', 'Come early to beat the crowds.', 4], [32, 46, 'want', 4, '带上充电宝，根本拍不停。', 'Bring a power bank. You won’t stop shooting.', 3]]
  };
  for (const [sceneId, list] of Object.entries(extra)) rows[sceneId] = [...(rows[sceneId] || []), ...list];
  window.TW_UGC_BUBBLE_SEED = Object.freeze(Object.fromEntries(Object.entries(rows).map(([sceneId, list]) => [sceneId, list.map(([x, y, kind, who, text, en, likes], i) => ({id: `seed-${sceneId}-${i}`, u: x / 100, v: y / 100, kind, name: NAMES[who][0], nameEn: NAMES[who][1], text, textEn: en, likes, seed: true}))])));
})();
