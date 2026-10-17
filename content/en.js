// English for the destination library. catalog.js merges it as <key>En fields beside the Chinese.
// Scenes are keyed by id, hotspots and questions by position, stops by their Chinese name.
// As in the Chinese, clue titles and questions never name the city before the answer is revealed.
window.CONTENT_EN = {
  datong: {
    name: 'Datong', region: 'Shanxi',
    scenes: {
      yungang: { name: 'Yungang Grottoes', type: 'Cave art', hotspots: ['A Buddha carved from the cliff', 'Imperial caves of the Northern Wei', 'Robe folds and rock layers'] },
      huayan: { name: 'Huayan Temple', type: 'Temple architecture', hotspots: ['A mortise-and-tenon timber pagoda', 'Two halls from the Liao and Jin', 'The copper crypt beneath the pagoda'] },
      xuankong: { name: 'Hanging Temple', type: 'Cliffside architecture', hotspots: ['How the beams carry the load', 'Why this cliff face?', 'Three teachings in one'] }
    },
    questions: [
      {
        "q": "The timber pagoda gets smaller with every storey. What is that mainly for?",
        "options": [
          "A lower centre of gravity keeps it stable",
          "More daylight on each floor",
          "Room to hang bells from the eaves",
          "Looks only, no structural role"
        ],
        "explain": "With a broad base and a narrow top, the weight sits low and less of the tower catches the wind; tall timber and brick pagodas taper like this."
      },
      {
        "q": "These halls cling to a cliff. What mainly carries their weight into the rock?",
        "options": [
          "The thin wooden posts below",
          "Beams set into the cliff face",
          "Iron chains hung from the clifftop",
          "Outer walls pressed against the rock"
        ],
        "explain": "The thin posts catch the eye, but the key members are beams driven into the rock at one end and carrying the halls at the other, working with rock brackets."
      },
      {
        "q": "The cliff around the great Buddha shows horizontal layers. What kind of rock is it?",
        "options": [
          "Granite",
          "Basalt",
          "Marble",
          "Sandstone"
        ],
        "explain": "Horizontal bedding marks a sedimentary rock laid down layer by layer. This cliff is sandstone: even and moderately soft, ideal for carving on a vast scale."
      }
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
      'sz-futian': { name: 'Futian CBD · Ping An Finance Centre', type: 'City skyline', hotspots: ['The tallest “needle”', 'The observation deck below the crown', 'The city’s scale between the towers'] },
      'sz-houhai': { name: 'Shenzhen at night', type: 'View from above', hotspots: ['The distant cluster of towers', 'The ridge between the towers', 'A ribbon of light around the hill'] },
      'sz-qianhai': { name: 'Qianhai · Joy Harbour', type: 'Waterfront new district', hotspots: ['The glowing Ferris wheel', 'Cabins and one full turn', 'Two characters on the light sign'] }
    },
    questions: [
      {
        "q": "The tallest tower narrows towards a pointed top. What is that mainly for?",
        "options": [
          "Saving building materials",
          "Reducing the force of high winds",
          "Making room for roof antennas",
          "Making the tower look shorter"
        ],
        "explain": "Winds are strong high up; a tapering body and pointed crown break up the airflow and cut wind loads, which is why most supertall towers take this shape."
      },
      {
        "q": "This brand-new district hugs the bay. How was it most likely built?",
        "options": [
          "By rebuilding an old town",
          "On land reclaimed from the sea",
          "By terracing a hillside",
          "On a former airport"
        ],
        "explain": "New towers spread flat right along the bay are the mark of reclaimed land, and this district was indeed built on land reclaimed from the sea."
      },
      {
        "q": "What is the average age of this city's residents, roughly?",
        "options": [
          "About 32",
          "About 38",
          "About 43",
          "About 48"
        ],
        "explain": "A city of newcomers that grew up only after the reform era, it draws young workers: its residents average about 32.5 years old, some six years younger than the national average."
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
    "type": "Classical garden",
    "hotspots": [
      "A pond connects the views",
      "Leaves mark the season",
      "A changing view along the bank"
    ]
  },
  "suzhou-huqiu": {
    "name": "Tiger Hill · Pagoda beyond the gate",
    "type": "Pagoda courtyard",
    "hotspots": [
      "The pagoda above the trees",
      "White walls and dark eaves",
      "Trees and the paved approach"
    ]
  },
  "suzhou-shantang": {
    "name": "Shantang Street · Houses by the canal",
    "type": "Canal neighbourhood",
    "hotspots": [
      "Houses line the canal",
      "Dark frames on white walls",
      "Another row of houses in the water"
    ]
  }
},
    questions: [
      {
        "q": "The houses along the canal stand on stone blocks that reach into the water. Why?",
        "options": [
          "To keep water from soaking and eroding the walls",
          "To draw washing water from the windows",
          "To serve as landing stages for boats",
          "To make the houses look grander"
        ],
        "explain": "Walls that stand in water rot quickly if they are brick or timber; water-resistant stone blocks take the soaking and the wash from passing boats."
      },
      {
        "q": "Judging by the trees and what people are wearing, when was this photo most likely taken?",
        "options": [
          "High summer",
          "Early spring, in blossom",
          "Late autumn, early winter",
          "Just after heavy snow"
        ],
        "explain": "Most trees are bare with a few yellow leaves left, people wear jackets and there is no snow: late autumn turning to winter."
      },
      {
        "q": "Roughly where does this city's economy rank among all Chinese cities?",
        "options": [
          "Top 10",
          "Around 30th",
          "Around 60th",
          "Around 100th"
        ],
        "explain": "Though not a provincial capital, it is a manufacturing and export powerhouse: in 2024 its GDP of about 2.67 trillion yuan ranked 6th among Chinese cities."
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
      'gl-xingping': { name: 'Xingping · River view from Laozhai Hill', type: 'Riverside old town', hotspots: ['The river bends sharply below', 'A 1,700-year-old town', 'Peaks rising straight from the ground'] },
      'gl-yulong': { name: 'Bamboo rafts on the Yulong River', type: 'River rafting', hotspots: ['Rafts under colourful parasols', 'Clumps of bamboo on the bank', 'A small river in the mist'] },
      'gl-longji': { name: 'Longji Rice Terraces', type: 'Mountain rice farming', hotspots: ['The curving lines aren’t roads', 'A wooden hut in the fields', 'The gold doesn’t last all year'] }
    },
    questions: [
      {
        "q": "These bamboo rafts carry visitors under sunshades. What mainly moves them along?",
        "options": [
          "A raftsman poling with bamboo",
          "A sail catching the wind",
          "A propeller",
          "Trackers hauling from the bank"
        ],
        "explain": "The river is shallow and slow and the rafts sit low; a raftsman pushes a long pole against the riverbed to move them."
      },
      {
        "q": "The terraces are golden and the rice heads droop. What time of year is it most likely?",
        "options": [
          "Spring planting",
          "Summer, with green seedlings",
          "Around the autumn harvest",
          "Winter fallow"
        ],
        "explain": "Drooping, golden heads mean ripe rice. Mountain farms here grow one crop a year and harvest it in autumn; this photo was taken in October."
      },
      {
        "q": "These steep, free-standing peaks rise straight from the plain. What landform are they?",
        "options": [
          "Danxia landform",
          "Karst peak forest",
          "Yardang landform",
          "Glacial horns"
        ],
        "explain": "Limestone dissolved by water over ages in a warm, wet climate leaves isolated, steep peaks: a karst peak forest."
      }
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
      'hk-peak': { name: 'Victoria Peak · Harbour at night', type: 'Night view from the peak', hotspots: ['A triangular tower like bamboo', 'The harbour between two shores', 'How high are you standing?'] },
      'hk-star-ferry': { name: 'Star Ferry', type: 'Harbour crossing', hotspots: ['Upper and lower decks', 'White cabin, green hull', 'The tour sign on the hull'] },
      'hk-sham-shui-po': { name: 'Sham Shui Po', type: 'Everyday street life', hotspots: ['The bakery building at the end of the street', 'The place name on the sign', 'A street of tightly packed buildings'] }
    },
    questions: [
      {
        "q": "To look down on the towers and the harbour like this, where is the photographer standing?",
        "options": [
          "On a boat in the harbour",
          "On the peak behind the city",
          "On a waterfront pier",
          "At the foot of a tower"
        ],
        "explain": "The nearest rooftops are below the camera and the harbour and far shore are all in view; only the mountain behind the city gives a panorama like this."
      },
      {
        "q": "Tall buildings line the street and a green hill rises right behind them. What does that say about land here?",
        "options": [
          "Hills everywhere and little flat land, so it builds upwards",
          "Flat land with room to spread out",
          "Cheap land on the outskirts",
          "Freshly reclaimed land in neat blocks"
        ],
        "explain": "Buildings packed up to the foot of the hill, narrow streets and tall blocks all point to scarce flat land: the city can only grow upwards."
      },
      {
        "q": "What is this city's GDP per person, converted to renminbi, roughly?",
        "options": [
          "About 90,000 yuan",
          "About 150,000 yuan",
          "About 240,000 yuan",
          "About 360,000 yuan"
        ],
        "explain": "A global finance and trade hub: in 2023 its GDP per person was about 397,000 in local currency, roughly 360,000 yuan."
      }
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
      'bj-zhengyangmen': { name: 'Zhengyangmen Arrow Tower', type: 'City gate', hotspots: ['Count the arrow windows', 'White arched window hoods', 'The high point of the central axis'] },
      'bj-hongyige': { name: 'Hongyi Pavilion, Palace Museum', type: 'Palace architecture', hotspots: ['Two storeys, one roof', 'A plaque with three names', 'Once full of gold and silver'] },
      'bj-beihai': { name: 'Glazed Archway of Xiaoxitian, Beihai Park', type: 'Imperial garden', hotspots: ['A panel read from right to left', 'Built for a mother’s longevity', 'The hall beyond the archway'] }
    },
    questions: [
      {
        "q": "Of the three arches, the middle one is clearly taller and wider. Why?",
        "options": [
          "The centre ranks highest",
          "Room for carts to turn",
          "Saving masonry",
          "Making the wall stronger"
        ],
        "explain": "Traditional architecture honours the centre: the middle arch is the tallest and widest and the side arches step down, expressing rank through size."
      },
      {
        "q": "Large open vats stand in front of the hall's terrace. What were they mainly for?",
        "options": [
          "Storing drinking water",
          "Burning incense",
          "Holding water to fight fires",
          "Catching rain for the gardens"
        ],
        "explain": "These palaces are built of timber and fire was the greatest danger; the vats were kept full, even kept from freezing in winter, so water was always at hand."
      },
      {
        "q": "How long is this city's urban rail network in operation, roughly?",
        "options": [
          "About 120 km",
          "About 250 km",
          "About 500 km",
          "About 880 km"
        ],
        "explain": "A megacity of over 20 million, it runs the longest urban rail network in the country: about 879 km at the end of 2024."
      }
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
      'sh-bund': { name: 'The Bund · HSBC Building & Custom House', type: 'Heritage architecture', hotspots: ['The bank under the dome', 'A clock tower that strikes the hours', 'Neighbouring numbers on the list'] },
      'sh-lujiazui': { name: 'Lujiazui skyline', type: 'City skyline', hotspots: ['Pearls large and small on a jade plate', 'The financial district across the river', '“Muddy Ferry Road”, lost to time'] },
      'sh-bund-night': { name: 'The Bund at night, from across the river', type: 'Riverside night view', hotspots: ['A row of old buildings', 'The slender white tower by the river', 'Ribbons of light on the river'] }
    },
    questions: [
      {
        "q": "The building on the right has a large clock on its tower. What was it originally for?",
        "options": [
          "Telling the time to the river and street",
          "Guiding ships like a lighthouse",
          "Watching the weather",
          "Carrying a broadcast antenna"
        ],
        "explain": "Set at the top of the tower and facing outwards, the clock let people on the river and in the streets see the time and hear the chimes."
      },
      {
        "q": "Compared with the stone buildings in the first scene, how much later were these glass towers built?",
        "options": [
          "At about the same time",
          "About 10 years later",
          "More than 70 years later",
          "50 years earlier"
        ],
        "explain": "The stone-faced buildings mostly date from the early 20th century; the glass supertalls across the river went up from the 1990s on, some 70 to 80 years later."
      },
      {
        "q": "What is this city's resident population, roughly?",
        "options": [
          "About 4 million",
          "About 8 million",
          "About 14 million",
          "About 25 million"
        ],
        "explain": "Lights spreading across both banks signal a megacity: about 24.8 million residents at the end of 2024, among the most populous cities in China."
      }
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
      'zjj-tianzishan': { name: 'Tianzi Mountain · Sandstone peak forest', type: 'Peak forest vista', hotspots: ['Peaks standing like stone pillars', 'Mountains fading into the distance', 'Green valleys below the peaks'] },
      'zjj-misty-peaks': { name: 'Misty peaks · Light in the mountains', type: 'Light and shadow', hotspots: ['The sunlit side', 'Rows of rock walls stretching away', 'Leaves right in front of you'] },
      'zjj-tianmen-cave': { name: 'Tianmen Mountain · Tianmen Cave', type: 'Natural arch', hotspots: ['Sky through the middle of the mountain', '999 steps to the opening', 'From sandstone pillars to karst cliffs'] },
      'zjj-winding-road': { name: 'Tianmen Mountain · Heaven-Linking Avenue', type: 'Mountain switchbacks', hotspots: ['Switchback after switchback', 'An arch hidden beneath the road', 'Where do the 99 bends lead?'] }
    },
    questions: [
      {
        "q": "Why does this road zigzag back and forth instead of climbing straight up?",
        "options": [
          "To ease the gradient for vehicles",
          "To avoid villages on the way",
          "To protect the trees on top",
          "To avoid an underground river"
        ],
        "explain": "The slope is too steep to drive straight up; switchbacks spread the same climb over a longer road, so the gradient is gentler."
      },
      {
        "q": "How was the huge opening through the mountain at the top of the stairs most likely formed?",
        "options": [
          "A channel left by a volcanic eruption",
          "Water dissolving limestone until it collapsed",
          "A pass carved by a glacier",
          "A man-made tunnel"
        ],
        "explain": "The mountain is limestone; water dissolved it along cracks over ages until the rock fell away, leaving a natural arch right through."
      },
      {
        "q": "What landform are these slender, sheer stone pillars standing in crowds?",
        "options": [
          "Karst peak forest",
          "Danxia landform",
          "Quartz-sandstone peak forest",
          "Yardang landform"
        ],
        "explain": "The pillars are hard quartz sandstone in flat layers with many vertical cracks; water cut along the cracks and left columns, unlike karst peaks dissolved from limestone."
      }
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
