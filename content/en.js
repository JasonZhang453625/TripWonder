// English for the destination library. catalog.js merges it as <key>En fields beside the Chinese.
// Scenes are keyed by id, hotspots and questions by position, stops by their Chinese name.
// As in the Chinese, clue titles and questions never name the city before the answer is revealed.
window.CONTENT_EN = {
  datong: {
    name: 'Datong', region: 'Shanxi',
    scenes: {
      yungang: { name: 'Yungang Grottoes', type: 'Cave art', hotspots: ['Why is it open to the sky?', 'Imperial caves of the Northern Wei', 'Robe and aureole'] },
      huayan: { name: 'Huayan Temple', type: 'Temple architecture', hotspots: ['A mortise-and-tenon timber pagoda', 'Two halls from the Liao and Jin', 'The copper crypt beneath the pagoda'] },
      xuankong: { name: 'Hanging Temple', type: 'Cliffside architecture', hotspots: ['How the beams carry the load', 'Why this cliff face?', 'Three teachings in one'] }
    },
    questions: [
      { q: 'Why is the Buddha in the first scene exposed to the open air?',
        options: ['The front wall of the original cave later collapsed', 'It was designed as an open-air plaza from the start', 'The front wall was removed to give visitors a view', 'It was moved here from somewhere else'],
        explain: 'Cave 20 was originally an enclosed cave. When its front wall collapsed, the main Buddha was exposed; the western standing Buddha has also been lost, which is why the scene today is asymmetrical.' },
      { q: 'Which two dynasties do the Bhagavat Sutra Repository Hall and the rebuilt Great Buddha Hall belong to?',
        options: ['Qin and Han', 'Sui and Tang', 'Liao and Jin', 'Ming and Qing'],
        explain: 'The Bhagavat Sutra Repository Hall was built in 1038 under the Liao; the Great Buddha Hall was rebuilt in 1140 under the Jin. The pagoda in the photo should not be confused with these two ancient halls.' },
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
      'sz-futian': { name: 'Futian CBD · Ping An Finance Centre', type: 'City skyline', hotspots: ['The tallest “needle”', 'The observation deck below the crown', 'The crossroads below'] },
      'sz-houhai': { name: 'Shenzhen at night', type: 'View from above', hotspots: ['The distant cluster of towers', 'The ridge between the towers', 'A ribbon of light around the hill'] },
      'sz-qianhai': { name: 'Qianhai · Joy Harbour', type: 'Waterfront new district', hotspots: ['The glowing Ferris wheel', 'Cabins and one full turn', 'Two characters on the light sign'] }
    },
    questions: [
      { q: 'What title has the tallest tower in the first scene been certified with?',
        options: ['World’s tallest office building', 'World’s tallest TV tower', 'World’s longest sea-crossing bridge', 'World’s largest stadium'],
        explain: 'In 2019 the Council on Tall Buildings and Urban Habitat certified this 599-metre, 118-storey tower as the world’s tallest office building.' },
      { q: 'In the second night view, what is the rolling dark outline between the front and back clusters of buildings?',
        options: ['A tree-covered ridge', 'A flat, open stretch of sea', 'A row of piers along the shore', 'A rectangular sports ground'],
        explain: 'The dark outline in the middle of the picture has rolling slopes and trees, with lit buildings in front of and behind it and a curving road on the left. The clue “The ridge between the towers” points to exactly this terrain.' },
      { q: 'What mainly makes the Ferris wheel in the third scene change colour at night?',
        options: ['Full-colour LEDs on its rims and spokes', 'Moonlight reflected off the water', 'Neon signs inside the cabins', 'Searchlights on nearby towers'],
        explain: 'Both rims and all 112 spokes carry a full-colour LED lighting array, so the whole wheel can change colour.' }
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
      'suzhou-huqiu': { name: 'Yunyan Temple Pagoda, Tiger Hill', type: 'Ancient pagoda', hotspots: ['Count the eaves', '“Timberwork” made of brick', 'Leaning but still standing'] }
    },
    questions: [
      { q: 'How is this ancient pagoda built, from top to bottom?',
        options: ['A seven-storey octagonal brick pagoda', 'A three-storey square timber tower', 'A single-storey stone pavilion', 'A nine-storey round iron pagoda'],
        explain: 'The pagoda is a seven-storey octagonal brick structure; the brick brackets under its eaves give it the layered look of a timber pavilion from afar.' },
      { q: 'Roughly when was this pagoda built?',
        options: ['Later Zhou to early Northern Song (959–961)', 'The Kaiyuan era of the Tang dynasty', 'The Zhizheng era of the Yuan dynasty', 'The Qianlong era of the Qing dynasty'],
        explain: 'According to the city’s landscape and forestry bureau, work began in 959 (sixth year of Xiande, Later Zhou) and was completed in 961 (second year of Jianlong, Northern Song).' },
      { q: 'Which statement about the pagoda’s lean is supported by historical records?',
        options: ['By the Ming dynasty its seventh storey already tilted north-west', 'It was deliberately built at an angle', 'The lean began in the 21st century', 'The lean is only a perspective illusion in the photo'],
        explain: 'The landscape and forestry bureau records that the seventh storey was already leaning north-west in the Ming dynasty. Photo perspective can exaggerate or reduce the angle, so it can’t be judged from the picture.' }
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
      { q: 'How did the riverside old town in the first scene get its name?',
        options: ['From the old county name “Xiping”, corrupted over time', 'From a general who came from the town', 'From the shape of a rock in the river', 'It was coined when a road was built in modern times'],
        explain: 'From the Jin dynasty this was the seat of Xiping County. After the seat moved away in the Sui dynasty only a market town remained, and over time “Xiping” was corrupted into the town’s present name.' },
      { q: 'When bamboo rafting began on the river in the second scene in 2000, how many rafts were there?',
        options: ['5', '50', '500', '3,000'],
        explain: 'In 2000 a riverside village began taking visitors out on bamboo rafts, starting with just 5. More than twenty years later the county has over 3,000 licensed rafts.' },
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
      'hk-peak': { name: 'Victoria Peak · Harbour at night', type: 'Night view from the peak', hotspots: ['A triangular tower like bamboo', 'The harbour between two shores', 'How high are you standing?'] },
      'hk-star-ferry': { name: 'Star Ferry', type: 'Harbour crossing', hotspots: ['Upper and lower decks', 'White cabin, green hull', 'The tour sign on the hull'] },
      'hk-sham-shui-po': { name: 'Sham Shui Po', type: 'Everyday street life', hotspots: ['The bakery building at the end of the street', 'The place name on the sign', 'A street of tightly packed buildings'] }
    },
    questions: [
      { q: 'What inspired the design of the triangular-prism tower in the middle of the first night view?',
        options: ['Bamboo “rising node by node”', 'The sail of a sailing boat', 'Lotus petals', 'The outline of a mountain peak'],
        explain: 'I. M. Pei drew on bamboo “rising node by node”, combining four triangular shafts of different heights into a tower 367.4 metres tall.' },
      { q: 'How is the Shining Star, the boat with the tour sign in the photo, related to the everyday ferries?',
        options: ['It is only on display on land', 'It is a harbour-tour experience run by the same fleet', 'It can only sail on rivers', 'It is used only to carry vehicles'],
        explain: 'The fleet runs everyday passenger ferries between piers on both sides of the harbour, and also offers harbour tours on the Shining Star.' },
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
      'bj-zhengyangmen': { name: 'Zhengyangmen Arrow Tower', type: 'City gate', hotspots: ['Count the arrow windows', 'White arched window hoods', 'The high point of the central axis'] },
      'bj-hongyige': { name: 'Hongyi Pavilion, Palace Museum', type: 'Palace architecture', hotspots: ['Two storeys, one roof', 'A plaque with three names', 'Once full of gold and silver'] },
      'bj-beihai': { name: 'Glazed Archway of Xiaoxitian, Beihai Park', type: 'Imperial garden', hotspots: ['A panel read from right to left', 'Built for a mother’s longevity', 'The hall beyond the archway'] }
    },
    questions: [
      { q: 'When were the white arched hoods added over the lower two rows of arrow windows on the first gate tower?',
        options: ['During the 1915 renovation', 'When it was completed in 1439', 'During the 1780 rebuild', 'When it reopened in 2024'],
        explain: 'The white arched hoods and the imitation-marble railing were designed by a German architect and added in the 1915 renovation; they are not Ming originals.' },
      { q: 'What was the second pavilion mainly used for in the Qing dynasty?',
        options: ['A silver vault for the Imperial Household Department', 'The emperor’s living quarters', 'An imperial examination hall', 'A library'],
        explain: 'In the Qing it was the Imperial Household Department’s silver vault, storing gold, silver, coins, jewels, jade and gold and silver vessels.' },
      { q: 'Why did the Qianlong Emperor build the complex around the third glazed archway?',
        options: ['To pray for his mother’s long life', 'To celebrate his own accession', 'To receive foreign envoys', 'To commemorate a battle'],
        explain: 'Begun in 1768 and completed in 1770, the complex was built by Qianlong to pray for the longevity of his mother, the Empress Dowager Xiaosheng.' }
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
      { q: 'In what year did the great clock on the first clock tower first ring?',
        options: ['1928', '1900', '1949', '1996'],
        explain: 'The Custom House was completed in 1927, and the great clock on its roof first rang in January 1928.' },
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
      'zjj-tianzishan': { name: 'Tianzi Mountain · Sandstone peak forest', type: 'Peak forest vista', hotspots: ['Peaks standing like stone pillars', 'Mountains fading into the distance', 'Green valleys below the peaks'] },
      'zjj-misty-peaks': { name: 'Misty peaks · Light in the mountains', type: 'Light and shadow', hotspots: ['The sunlit side', 'Rows of rock walls stretching away', 'Leaves right in front of you'] },
      'zjj-tianmen-cave': { name: 'Tianmen Mountain · Tianmen Cave', type: 'Natural arch', hotspots: ['Sky through the middle of the mountain', '999 steps to the opening', 'From sandstone pillars to karst cliffs'] },
      'zjj-winding-road': { name: 'Tianmen Mountain · Heaven-Linking Avenue', type: 'Mountain switchbacks', hotspots: ['Switchback after switchback', 'An arch hidden beneath the road', 'Where do the 99 bends lead?'] }
    },
    questions: [
      { q: 'Which landform appears again and again in the first two scenes?',
        options: ['Clusters of slender stone pillars and sheer rock walls', 'Gentle sand dunes merging into one', 'Rounded, glacier-covered summits', 'Isolated volcanoes around a round lake'],
        explain: 'The first scene shows dense stone pillars and the second shows layer upon layer of rock walls; a steep, dense peak forest is the clue the two mountain views share.' },
      { q: 'In the third scene, how many steps does the “Stairway to Heaven” up to the natural opening have?',
        options: ['99', '365', '999', '1,080'],
        explain: 'The Stairway to Heaven in front of Tianmen Cave has 999 steps with rest platforms along the way, and climbing it carries the meaning of praying for good fortune.' },
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
