// English for the destination library. catalog.js merges it as <key>En fields beside the Chinese.
// Scenes are keyed by id, questions by position, stops by their Chinese name.
// As in the Chinese, questions never name the city before the answer is revealed.
window.CONTENT_EN = {
  datong: {
    name: 'Datong', region: 'Shanxi',
    scenes: {
      yungang: { name: 'Yungang Grottoes', type: 'Cave art' },
      huayan: { name: 'Huayan Temple', type: 'Temple architecture' },
      xuankong: { name: 'Hanging Temple', type: 'Cliffside architecture' }
    },
    questions: [
      { q: 'Why is the Buddha in the first scene exposed to the open air?',
        options: ['The front wall of the original cave later collapsed', 'It was designed as an open-air plaza from the start', 'The front wall was removed to give visitors a view', 'It was moved here from somewhere else'],
        explain: 'Cave 20 was originally an enclosed cave. When its front wall collapsed, the main Buddha was exposed; the western standing Buddha has also been lost, which is why the scene today is asymmetrical.' },
      { q: 'What is the square pagoda in the photo mainly built from?',
        options: ['Rammed earth', 'Glass and steel', 'Timber joined with mortise and tenon', 'Reinforced concrete'],
        explain: 'It is a square timber pagoda: beams and columns lock together with mortise-and-tenon joints, a tenon slotting into the next piece’s mortise.' },
      { q: 'How do the halls on the cliff mainly transfer their weight to the mountain?',
        options: ['Slender wooden posts underneath hold them up on their own', 'Beams set into the rock work together with brackets and the timber frame', 'Iron chains hang the whole building from the summit', 'The outer walls are glued to the rock face'],
        explain: 'Beams set into the mountain are key load-bearing members, working with rock supports and the post-and-beam frame. The slender posts you can see are not the whole structure.' }
    ],
    stops: {
      云冈石窟: { name: 'Yungang Grottoes', note: 'Allow half a day for the caves. Check reservations and opening information before you go.' },
      华严寺: { name: 'Huayan Temple', note: 'Focus on the two Liao and Jin halls; the pagoda in the photo is a separate building.' },
      大同古城墙: { name: 'Datong City Wall', note: 'Walk along the wall and the old streets; check which sections are actually open.' },
      九龙壁: { name: 'Nine-Dragon Screen', note: 'A good short stop on a walk through the old town.' },
      悬空寺: { name: 'Hanging Temple', note: 'In Hunyuan County. Set aside half a day to a full day for it and check climbing reservations.' },
      大同博物馆: { name: 'Datong Museum', note: 'Fills in the city’s historical background. Check opening days first.' }
    }
  },
  shenzhen: {
    name: 'Shenzhen', region: 'Guangdong',
    scenes: {
      'sz-futian': { name: 'Futian CBD · Ping An Finance Centre', type: 'City skyline' },
      'sz-houhai': { name: 'Shenzhen at night', type: 'View from above' },
      'sz-qianhai': { name: 'Qianhai · Joy Harbour', type: 'Waterfront new district' }
    },
    questions: [
  {
    "q": "What distinguishes the tallest building in the first scene from its neighbours?",
    "options": [
      "It has one floor and spreads sideways",
      "It is slender and tapers towards the top",
      "It has a huge circular dome",
      "It is a bridge spanning two banks"
    ],
    "explain": "The tallest tower rises well above its neighbours, with a slender facade and a tapering crown."
  },
  {
    "q": "In the second night view, what is the rolling dark outline between the front and back clusters of buildings?",
    "options": [
      "A tree-covered ridge",
      "A flat, open stretch of sea",
      "A row of piers along the shore",
      "A rectangular sports ground"
    ],
    "explain": "The dark outline in the middle of the picture has rolling slopes and trees, with lit buildings in front of and behind it and a curving road on the left: a tree-covered ridge."
  },
  {
    "q": "What mainly makes the Ferris wheel in the third scene change colour at night?",
    "options": [
      "Full-colour LEDs on its rims and spokes",
      "Moonlight reflected off the water",
      "Neon signs inside the cabins",
      "Searchlights on nearby towers"
    ],
    "explain": "Both rims and all 112 spokes carry a full-colour LED lighting array, so the whole wheel can change colour."
  }
],
    stops: {
      平安金融中心云际观光层: { name: 'Ping An Finance Centre Observation Deck', note: 'Level 116, about 541 metres up. Tickets required; opening times follow the official notice for the day.' },
      莲花山公园山顶广场: { name: 'Lianhuashan Park Summit Plaza', hours: '06:00–23:00; last entry 22:30', note: 'A city park at the north end of the central district; the summit looks back over the skyline. Involves an uphill walk.' },
      '深圳湾体育中心“春茧”': { name: 'Shenzhen Bay Sports Center (“Spring Cocoon”)', note: 'Midway along the Houhai waterfront. The exterior can be seen at any time; access inside depends on events.' },
      深圳湾公园: { name: 'Shenzhen Bay Park', note: 'Follow the seaside promenade south for views across the bay; around dusk is best for the bay skyline.' },
      '欢乐港湾“湾区之光”摩天轮': { name: 'Bay Glory Ferris Wheel, Joy Harbour', note: 'Closed Tuesday mornings for maintenance; open until 22:00 on weekends and public holidays. Tickets and time slots follow the operator’s notices.' },
      深圳人才公园: { name: 'Shenzhen Talent Park', note: 'Also in Houhai; combine it with the bayside promenade and the “Spring Cocoon”.' }
    }
  },
  suzhou: {
    name: 'Suzhou', region: 'Jiangsu',
    scenes: {
  "suzhou-zhuozheng": {
    "name": "Humble Administrator’s Garden · Autumn pond",
    "type": "Classical garden"
  },
  "suzhou-huqiu": {
    "name": "Tiger Hill · Pagoda beyond the gate",
    "type": "Pagoda courtyard"
  },
  "suzhou-shantang": {
    "name": "Shantang Street · Houses by the canal",
    "type": "Canal neighbourhood"
  }
},
    questions: [
  {
    "q": "What is the broad area of water at the centre of the first garden scene?",
    "options": [
      "A garden pond",
      "An outdoor swimming pool",
      "A harbour channel",
      "An alpine glacial lake"
    ],
    "explain": "A garden pond occupies the centre, reflecting the trees and buildings along its banks."
  },
  {
    "q": "Looking along the path in the second scene, what rises behind the trees?",
    "options": [
      "A windmill",
      "An ancient pagoda",
      "A modern TV tower",
      "A Ferris wheel"
    ],
    "explain": "A pagoda with stacked eaves rises above the trees and the low courtyard roofs."
  },
  {
    "q": "In the third scene, what do the houses mainly line?",
    "options": [
      "Sand dunes",
      "An airport runway",
      "Both banks of a canal",
      "An elevated highway"
    ],
    "explain": "The canal runs through the middle, with houses closely lining both banks and their windows reflected in the water."
  }
],
    stops: {
      苏州博物馆本馆: { name: 'Suzhou Museum (Main Building)', note: 'Next to the Humble Administrator’s Garden. Entry is by timed reservation; your slot follows your booking.' },
      拙政园: { name: 'Humble Administrator’s Garden', note: 'Mar–Oct 07:30–17:30; Nov–Feb 07:30–17:00. Hours may change on public holidays.' },
      狮子林: { name: 'Lion Grove Garden', note: 'Mar–Oct 07:30–17:30; Nov–Feb 07:30–17:00. Hours may change on public holidays.' },
      平江路: { name: 'Pingjiang Road', note: 'The stop is set midway along the historic block; this canal lane is known for its street and river running side by side.' },
      虎丘景区: { name: 'Tiger Hill Scenic Area', note: 'May–Oct 07:30–18:00; Nov–Apr 07:30–17:30. Hours may change on public holidays.' },
      留园: { name: 'Lingering Garden', note: 'Mar–Oct 07:30–17:30; Nov–Feb 07:30–17:00. Hours may change on public holidays.' }
    }
  },
  guilin: {
    name: 'Guilin', region: 'Guangxi',
    scenes: {
      'gl-xingping': { name: 'Xingping · River view from Laozhai Hill', type: 'Riverside old town' },
      'gl-yulong': { name: 'Bamboo rafts on the Yulong River', type: 'River rafting' },
      'gl-longji': { name: 'Longji Rice Terraces', type: 'Mountain rice farming' }
    },
    questions: [
      { q: 'Seen from above, what does the river do beside the town at the foot of the hills?',
        options: ['It splits into three branches', 'It flows into a lake', 'It makes a big bend', 'It runs dead straight'],
        explain: 'The river turns through a bend of about 90 degrees below the hills, wrapping round the old town like a ribbon.' },
      { q: 'What carries the visitors under colourful parasols on the river?',
        options: ['Speedboats', 'Sailing boats', 'Dragon boats', 'Bamboo rafts'],
        explain: 'They are bamboo rafts. Villagers once used them to cross the river and carry goods; later they became rafts for visitors.' },
      { q: 'What problem do the curving ridges stepping up the hillside mainly solve?',
        options: ['Marking channels for tour boats', 'Turning steep slopes into fields that can be farmed and irrigated', 'Marking the location of underground caves', 'Stopping winter snow from sliding down'],
        explain: 'The terraces are cut into the slope level by level and kept farmable with ridges and channelled water. Above all, they are a mountain rice-farming system that is still in use.' }
    ],
    stops: {
      象鼻山: { name: 'Elephant Trunk Hill', note: 'In the city centre. Entry rules and times follow the scenic area’s notice for the day.' },
      芦笛岩: { name: 'Reed Flute Cave', note: 'On Ludi Road, Xiufeng District. Toured on foot inside the cave; easy to pair with other city sights on the same day.' },
      漓江游船: { name: 'Li River cruise', note: 'These are rough coordinates for the middle of the river section. Boats leave from specific piers; route and duration depend on water levels and schedules.' },
      兴坪古镇与老寨山: { name: 'Xingping Old Town & Laozhai Hill', note: 'The trail up Laozhai Hill is steep. To see the river bend and sunset, save some energy and allow time to get back down.' },
      遇龙河竹筏漂流: { name: 'Yulong River bamboo rafting', note: 'There are several raft piers and sections. Duration, and whether rafts run at all, depend on water levels; follow the day’s arrangements.' },
      龙脊梯田: { name: 'Longji Rice Terraces', note: 'In Longsheng County, far from the city. Set aside at least half a day and check transport there and back.' }
    }
  },
  hongkong: {
    name: 'Hong Kong', region: 'Hong Kong SAR',
    scenes: {
      'hk-peak': { name: 'Victoria Peak · Harbour at night', type: 'Night view from the peak' },
      'hk-star-ferry': { name: 'Star Ferry', type: 'Harbour crossing' },
      'hk-sham-shui-po': { name: 'Sham Shui Po', type: 'Everyday street life' }
    },
    questions: [
      { q: 'Judging from the picture, where is the photographer standing?',
        options: ['On a boat in the harbour', 'On the peak above the city', 'On a pier by the sea', 'At the foot of a tower'],
        explain: 'The nearby rooftops are below you: the photo was taken from a hill about 552 m up, the highest point on the island.' },
      { q: 'What colours is this ferry painted?',
        options: ['A white upper deck over a dark green hull', 'Bright red all over', 'Black and white stripes', 'A gold hull'],
        explain: 'A white upper deck over a dark green hull is this fleet’s signature, running across the harbour since the late 19th century.' },
      { q: 'The district in the third scene has a name ending in the character “埗” (po). What does it mean?',
        options: ['Pier', 'City gate', 'Well', 'Market'],
        explain: '“埗” is interchangeable with “埠” and means a pier. The name comes from a deep-water pier that once stood nearby and disappeared after land reclamation.' }
    ],
    stops: {
      山顶缆车中环总站: { name: 'Peak Tram Garden Road Terminus', note: '33 Garden Road. Budget time for the queue and the ride; operating hours follow the official notice for the day.' },
      太平山顶凌霄阁: { name: 'The Peak Tower', note: 'At the tram’s upper terminus. The viewing deck may need a separate ticket; go up late in the afternoon to see both the sunset and the night view.' },
      山顶环回步行径: { name: 'Peak Circle Walk', note: 'Loops along Lugard Road and Harlech Road with views of the island’s north and south sides and the harbour. Adjust in bad weather.' },
      尖沙咀天星码头: { name: 'Tsim Sha Tsui Star Ferry Pier', note: 'Ferries to Central or Wan Chai. Check the operator’s live information for sailings and harbour-tour times.' },
      星光大道: { name: 'Avenue of Stars', note: 'On the Tsim Sha Tsui waterfront promenade; easy to combine with the ferry pier on foot.' },
      深水埗鸭寮街: { name: 'Apliu Street, Sham Shui Po', note: 'A signature street packed with electronics and fabric stalls. Walk on to Castle Peak Road to see the bakery building at the end of the street.' }
    }
  },
  beijing: {
    name: 'Beijing', region: 'Beijing',
    scenes: {
      'bj-zhengyangmen': { name: 'Zhengyangmen Arrow Tower', type: 'City gate' },
      'bj-hongyige': { name: 'Hongyi Pavilion, Palace Museum', type: 'Palace architecture' },
      'bj-beihai': { name: 'Glazed Archway of Xiaoxitian, Beihai Park', type: 'Imperial garden' }
    },
    questions: [
      { q: 'What were the rows of small square windows on the gate tower originally for?',
        options: ['Shop windows', 'Ventilating the tower', 'Hanging lanterns', 'Shooting arrows when defending the city'],
        explain: 'They are arrow windows for defending the gate; the north side faces the city and has none.' },
      { q: 'What colours is the plaque in the middle of the pavilion?',
        options: ['Blue characters on white', 'Gold characters on black', 'Gold characters on blue', 'Black characters on red'],
        explain: 'The gold-on-blue plaque carries the pavilion’s present name; it was renamed twice after being called the Martial Tower in the early Ming.' },
      { q: 'How should the four characters on the central panel of the archway be read?',
        options: ['From the middle outwards', 'Right to left', 'Left to right', 'Bottom to top'],
        explain: 'The panel reads right to left. Traditional gate panels and plaques are usually written this way.' }
    ],
    stops: {
      正阳门箭楼: { name: 'Zhengyangmen Arrow Tower', hours: 'Tue–Sun 09:00–17:00, last entry 16:30; closed Mondays', note: 'Visits by real-name reservation. Floors 1–3 house an exhibition on the city’s central axis.' },
      永定门: { name: 'Yongdingmen Gate', note: 'The gate at the southern end of the central axis, visible to the south from the arrow tower. Link the two along the axis.' },
      故宫博物院: { name: 'The Palace Museum', hours: '08:30–17:00, last entry 16:00; closed Mondays', note: 'Real-name reservation required in advance. In the low season (November to March) last entry is at 15:30.' },
      景山公园万春亭: { name: 'Wanchun Pavilion, Jingshan Park', note: 'The highest point on the central axis, with a panoramic view over the Palace Museum; right by its north gate.' },
      '北海公园（小西天、白塔）': { name: 'Beihai Park (Xiaoxitian & White Dagoba)', note: 'Xiaoxitian is on the north shore. From November to March the park closes at 20:00; check park notices.' },
      前门大街: { name: 'Qianmen Street', note: 'The pedestrian street south of the arrow tower; pair it with the tower and a walk along the central axis.' }
    }
  },
  shanghai: {
    name: 'Shanghai', region: 'Shanghai',
    scenes: {
      'sh-bund': { name: 'The Bund · HSBC Building & Custom House', type: 'Heritage architecture' },
      'sh-lujiazui': { name: 'Lujiazui skyline', type: 'City skyline' },
      'sh-bund-night': { name: 'The Bund at night, from across the river', type: 'Riverside night view' }
    },
    questions: [
      { q: 'What is mounted on the tower at the top of the building on the right?',
        options: ['A big clock', 'A windmill', 'A radar dish', 'A neon billboard'],
        explain: 'The building on the right with the clock tower is the Custom House, completed in 1927; its clock still chimes the hours.' },
      { q: 'Which line of poetry inspired the design of the TV tower strung with spheres in the second scene?',
        options: ['“Pearls large and small fall on a jade plate”', '“The torrent plunges three thousand feet”', '“Over the sea rises a bright moon”', '“To see a thousand li further”'],
        explain: 'The design team drew on the line “pearls large and small fall on a jade plate” from Bai Juyi’s “Song of the Pipa”, building the tower from 11 spheres of different sizes.' },
      { q: 'What is the row of Western-style old buildings along the river in the third scene often called?',
        options: ['An exhibition of world architecture', 'The Venice of the East', 'The lighthouse of the foreign concessions', 'The finest of the Jiangnan gardens'],
        explain: 'This riverside ensemble of varied early modern buildings is known as the “exhibition of world architecture” and records the city’s development.' }
    ],
    stops: {
      外滩万国建筑群: { name: 'The Bund heritage buildings', note: 'Walk along East Zhongshan No. 1 Road to see the façades; whether interiors are open depends on each building.' },
      '海关大楼（外滩 13 号）': { name: 'Custom House (No. 13 The Bund)', note: 'Still in use; the interior opens by reservation only during special events. From outside you can hear the clock strike the hour.' },
      黄浦公园与人民英雄纪念塔: { name: 'Huangpu Park & Monument to the People’s Heroes', note: 'At the north end of the Bund; start or finish your Bund walk here.' },
      东方明珠广播电视塔: { name: 'Oriental Pearl TV Tower', note: 'Tickets required to go up. Queues vary a lot with crowds, so go off-peak.' },
      陆家嘴滨江步道: { name: 'Lujiazui Riverside Promenade', note: 'A great spot to look back across the river at the Bund; the lights are at their fullest from dusk into the night.' }
    }
  },
  zhangjiajie: {
    name: 'Zhangjiajie', region: 'Hunan',
    scenes: {
      'zjj-tianzishan': { name: 'Tianzi Mountain · Sandstone peak forest', type: 'Peak forest vista' },
      'zjj-misty-peaks': { name: 'Misty peaks · Light in the mountains', type: 'Light and shadow' },
      'zjj-tianmen-cave': { name: 'Tianmen Mountain · Tianmen Cave', type: 'Natural arch' },
      'zjj-winding-road': { name: 'Tianmen Mountain · Heaven-Linking Avenue', type: 'Mountain switchbacks' }
    },
    questions: [
      { q: 'Which landform appears again and again in the first two scenes?',
        options: ['Clusters of slender stone pillars and sheer rock walls', 'Gentle sand dunes merging into one', 'Rounded, glacier-covered summits', 'Isolated volcanoes around a round lake'],
        explain: 'The first scene shows dense stone pillars and the second shows layer upon layer of rock walls; a steep, dense peak forest is the clue the two mountain views share.' },
      { q: 'How did the great hole showing sky in the middle of the cliff form?',
        options: ['A gap blasted in a war', 'An opening made for a cable car', 'It is a natural arch through the mountain', 'A tunnel cut by people'],
        explain: 'It is a natural arch through the karst mountain; the steep cliff around it is still one continuous face.' },
      { q: 'How does doubling back again and again help vehicles climb the road in the fourth scene?',
        options: ['It makes the way up a short straight line', 'It spreads the climb over a longer stretch of road', 'It keeps every section at the same altitude', 'It lets vehicles avoid bends altogether'],
        explain: 'Doubling back lengthens the route, spreading the same height gain over a longer distance instead of going straight up the steep slope. The stacked road sections in the photo show exactly this.' }
    ],
    stops: {
      天子山景区: { name: 'Tianzi Mountain Scenic Area', note: 'Look over the sandstone peak forest from above. The area is large, so allow time for walking and park shuttles. Coordinates are a reference point for the area.' },
      袁家界景区: { name: 'Yuanjiajie Scenic Area', note: 'Follow the viewing trails for cliffs and valleys; it pairs well with Tianzi Mountain. Check park transport and entry routes first.' },
      金鞭溪: { name: 'Golden Whip Stream', note: 'The valley walk is long; choose how far to go based on your energy. Coordinates are a reference point along the route.' },
      '天门山（天门洞与通天大道）': { name: 'Tianmen Mountain (Cave & Heaven-Linking Avenue)', note: 'The cave and the avenue are in the same scenic area and fit in one day, separate from the Wulingyuan area. Access to the avenue, shuttle rides and the cave visit depend on the route you buy and the day’s arrangements.' },
      黄石寨: { name: 'Huangshizhai', note: 'Mostly walking and viewpoints on the summit. Confirm how you’ll go up and down, and your return time, first. Coordinates are a reference point for the summit area.' },
      杨家界景区: { name: 'Yangjiajie Scenic Area', note: 'An extra option for peak-forest views; adjust to your energy, the weather and which trails are open. Coordinates are a reference point for the area.' }
    }
  }
};
