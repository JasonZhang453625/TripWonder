/* Sample traveller notes floating over each scene (scene-bubbles.js). All samples are fictional.
   Rule: like the clues, no note may name the city, province or landmark — the player still has to guess.
   Positions are photo percentages (like hotspots) and keep clear of the scene's hotspots.
   Row: [x, y, 'been' | 'want', nameIndex, 中文, English, likes] */
(() => {
  'use strict';
  const NAMES = [['小满', 'Xiaoman'], ['米粒', 'Rice Grain'], ['背包里的猫', 'Cat in a Backpack'], ['拾光', 'Light Catcher'], ['南风', 'South Wind'], ['慢慢走', 'Slow Walker'], ['橘子汽水', 'Orange Soda'], ['一只鹿', 'A Deer'], ['阿哲', 'Zhe'], ['晚风', 'Evening Breeze'], ['Momo', 'Momo'], ['山间小路', 'Mountain Path']];
  const rows = {
    'yungang': [[22, 40, 'been', 0, '清晨去人少，阳光斜照进洞窟，佛像的脸会慢慢亮起来。', 'Go early when it’s quiet: the morning light slowly lights up the faces.', 23], [78, 30, 'want', 1, '看图就被震撼了，想亲眼看看这么大的石像。', 'The photo alone blew me away. I want to see how huge these statues really are.', 9], [72, 76, 'been', 5, '建议请个讲解，每个洞窟的故事都不一样。', 'Get a guide: every cave has its own story.', 14]],
    'huayan': [[24, 30, 'been', 3, '殿里的彩塑特别精美，抬头看藻井能看很久。', 'The painted statues are stunning. You’ll crane your neck at the ceiling for ages.', 17], [80, 55, 'want', 6, '下雪的时候来一定很美，已经收藏了。', 'This must be beautiful in the snow. Saved for later.', 6], [25, 80, 'been', 9, '傍晚的屋檐剪影很好看，适合拍照。', 'The rooflines at dusk make great silhouettes.', 11]],
    'xuankong': [[20, 62, 'been', 2, '栈道很窄，恐高的朋友要做好心理准备！', 'The walkways are narrow. Brace yourself if you’re scared of heights!', 31], [66, 66, 'want', 7, '不敢相信这些楼是挂在崖壁上的，想去确认一下。', 'Can’t believe these halls hang off a cliff. I need to see it for myself.', 12], [42, 80, 'been', 8, '建议早点去，旺季会限流排队。', 'Go early: in peak season they limit visitor numbers.', 8]],
    'sz-futian': [[25, 40, 'been', 4, '晚上灯光秀的时候来，整片楼会一起亮。', 'Come for the evening light show when the whole skyline lights up together.', 19], [30, 70, 'want', 10, '想去最顶层看看云在脚下的感觉。', 'I want to stand at the top and see the clouds below.', 7], [86, 50, 'been', 1, '坐地铁过来很方便，出站就是公园。', 'Easy by metro: you walk straight out into a park.', 5]],
    'sz-houhai': [[20, 40, 'been', 11, '夜跑路线超赞，海风很舒服。', 'A great evening running route, with a lovely sea breeze.', 13], [82, 36, 'want', 6, '收藏了！下次出差一定留一个晚上。', 'Saved! Next work trip I’m keeping one evening free for this.', 4], [80, 80, 'been', 3, '从高处往下看，城市像一块发光的电路板。', 'From up high the city looks like a glowing circuit board.', 22]],
    'sz-qianhai': [[55, 30, 'been', 0, '摩天轮转一圈大概二十分钟，日落时段最抢手。', 'One loop takes about twenty minutes; sunset slots go fast.', 15], [60, 64, 'want', 7, '想带家人来坐摩天轮看海边夜景。', 'I want to bring my family for a night ride by the sea.', 9], [86, 40, 'been', 5, '周末有很多市集和街头表演。', 'Lots of weekend markets and street performers.', 6]],
    'suzhou-zhuozheng': [[23, 46, 'been', 0, '沿着池边慢慢走，倒影和树影会一直变化。', 'Walk slowly around the pond: the reflections keep changing.', 12], [76, 34, 'want', 2, '喜欢这片秋色，下次想在园里多待一会。', 'I love these autumn colours. I want to linger here next time.', 7]],
    'suzhou-shantang': [[19, 45, 'been', 4, '两岸的白墙倒映在水里，很适合慢慢看。', 'The white walls reflected in the canal reward a slow look.', 9], [77, 26, 'want', 6, '想沿着小河一直走下去。', 'I want to follow this canal on foot.', 5]],
    'suzhou-huqiu': [[22, 40, 'been', 8, '塔真的是斜的，站在下面看有点不可思议。', 'The tower really does lean. Standing beneath it feels unreal.', 27], [80, 36, 'want', 1, '听说秋天去人少景美，计划中。', 'I hear autumn is quiet and gorgeous. Planning it.', 8], [25, 80, 'been', 9, '园子很适合慢慢逛一个下午。', 'A lovely place for a slow afternoon stroll.', 10]],
    'gl-xingping': [[55, 28, 'been', 2, '爬到山顶大概四十分钟，看到这片江湾一切都值了。', 'About forty minutes to climb, and the river bend at the top makes it worth it.', 34], [12, 62, 'want', 6, '这山水像画一样，已经加入心愿单。', 'It looks like a painting. It’s on my wishlist.', 12], [55, 84, 'been', 4, '日出时云雾停在江面上，美到不想下山。', 'At sunrise the mist sits on the river. I didn’t want to come down.', 18]],
    'gl-yulong': [[20, 40, 'been', 5, '竹筏很慢很稳，适合发呆。', 'The rafts are slow and steady, perfect for daydreaming.', 16], [80, 30, 'want', 10, '想在雨后来，河上起雾一定很美。', 'I want to come after rain, when mist rises off the water.', 7], [25, 66, 'been', 3, '记得带防晒，河上几乎没有遮挡。', 'Bring sunscreen: there’s almost no shade on the water.', 9]],
    'gl-longji': [[20, 30, 'been', 7, '五月灌水时像一面面镜子，秋天又是金色的。', 'In May the flooded fields are mirrors; in autumn they turn gold.', 25], [78, 62, 'want', 0, '想住在山上的木屋里看日出。', 'I want to stay in a wooden house up here and watch the sunrise.', 11], [82, 25, 'been', 11, '台阶很多，穿双好走的鞋。', 'Lots of steps. Wear comfy shoes.', 6]],
    'hk-peak': [[25, 30, 'been', 9, '晚上八点前后最好看，提前去占位。', 'Best around 8 p.m. Get there early for a spot.', 21], [80, 30, 'want', 1, '想坐缆车上山看一次夜景。', 'I want to ride up for the night view.', 10], [80, 76, 'been', 4, '山顶风很大，记得带件外套。', 'It’s windy at the top. Bring a jacket.', 7]],
    'hk-star-ferry': [[20, 30, 'been', 6, '船票很便宜，坐上层看两岸风景最好。', 'Tickets are cheap. Sit on the upper deck for the best views.', 14], [80, 30, 'want', 7, '想在黄昏时坐一次渡轮。', 'I want to take the ferry at dusk.', 9], [82, 82, 'been', 2, '木椅背可以前后翻转，很有年代感。', 'The wooden seat backs flip over. So retro.', 12]],
    'hk-sham-shui-po': [[76, 25, 'been', 10, '街边小吃很多，豆腐花一定要试。', 'Street snacks everywhere. Try the tofu pudding.', 15], [80, 60, 'want', 3, '想来淘旧相机和布料。', 'I want to come hunting for old cameras and fabric.', 6], [15, 56, 'been', 8, '招牌密密麻麻，随手一拍都很有电影感。', 'Signs everywhere: every snapshot looks like a film still.', 19]],
    'bj-zhengyangmen': [[20, 36, 'been', 0, '在城楼下站一会儿，才感受到它有多高大。', 'Stand at its foot for a moment and you realise how massive it is.', 13], [82, 34, 'want', 9, '想看看它晚上亮灯的样子。', 'I want to see it lit up at night.', 5], [22, 76, 'been', 5, '附近的老街很好逛，小吃也多。', 'The old streets nearby are fun to wander, with lots of snacks.', 9]],
    'bj-hongyige': [[20, 30, 'been', 3, '红墙黄瓦配蓝天，随便拍都好看。', 'Red walls, yellow tiles and blue sky: every photo works.', 24], [85, 36, 'want', 6, '想下雪天来，红墙白雪一定绝美。', 'I want to come on a snowy day. Red walls and white snow!', 16], [18, 82, 'been', 11, '里面很大，至少留半天，走得脚都酸了。', 'It’s huge inside. Leave half a day; my feet were sore!', 8]],
    'bj-beihai': [[18, 42, 'been', 7, '琉璃的颜色特别鲜亮，近看细节很多。', 'The glazed tiles are so vivid, full of detail up close.', 12], [74, 66, 'want', 1, '想春天来划船。', 'I want to come rowing in spring.', 7], [20, 76, 'been', 4, '园子里很安静，适合散步。', 'The garden is calm, great for a walk.', 5]],
    'sh-bund': [[15, 25, 'been', 8, '这一排老楼每栋风格都不一样，像一本建筑书。', 'Every building in this row has its own style, like a book of architecture.', 20], [85, 60, 'want', 10, '想在晚上沿着江边散步看灯。', 'I want to stroll along the river at night.', 9], [20, 76, 'been', 2, '整点会听到钟声，很有仪式感。', 'You’ll hear the clock chime on the hour.', 11]],
    'sh-lujiazui': [[18, 50, 'been', 9, '从对岸看天际线最完整，傍晚到夜里都好看。', 'The skyline looks best from across the river, from dusk into night.', 18], [66, 20, 'want', 0, '想登上最高的那栋楼看城市。', 'I want to go up the tallest tower and look out over the city.', 10], [85, 76, 'been', 5, '下雨天云会遮住楼顶，也很有氛围。', 'On rainy days the clouds swallow the rooftops. Very atmospheric.', 7]],
    'sh-bund-night': [[20, 30, 'been', 3, '坐夜游船能同时看到两岸的灯光。', 'A night cruise lets you see both banks lit up at once.', 15], [40, 60, 'want', 6, '收藏了，下次要在这里跨年。', 'Saved. Next time I want to see in the New Year here.', 12], [86, 30, 'been', 11, '晚上人很多，注意随身物品。', 'It gets crowded at night. Keep an eye on your things.', 4]],
    'zjj-tianzishan': [[18, 30, 'been', 4, '云雾散开的那一刻，整片石峰一下子出现，太震撼了。', 'When the mist parted and all the stone pillars appeared at once: breathtaking.', 29], [82, 56, 'want', 7, '想看看这些石柱在雪后的样子。', 'I want to see these pillars after snowfall.', 9], [80, 84, 'been', 1, '山上住一晚，看日出很值得。', 'Stay a night up here. The sunrise is worth it.', 11]],
    'zjj-misty-peaks': [[20, 30, 'been', 9, '雨后上山最容易遇到云海。', 'You’re most likely to see a sea of clouds after rain.', 14], [25, 78, 'want', 3, '想带相机来拍光影。', 'I want to bring my camera for the light and shadows.', 6], [88, 50, 'been', 8, '步道很多，建议提前规划路线。', 'Lots of trails. Plan your route ahead.', 5]],
    'zjj-tianmen-cave': [[18, 36, 'been', 2, '台阶爬到一半腿就软了，但站在洞口看天空很值。', 'My legs gave out halfway up the steps, but the sky through the arch was worth it.', 22], [82, 50, 'want', 10, '想看看云从山洞里穿过的样子。', 'I want to see clouds drift through the arch.', 10], [20, 82, 'been', 5, '也可以坐扶梯上去，体力不够别硬撑。', 'There are escalators too. Don’t push yourself.', 8]],
    'zjj-winding-road': [[20, 25, 'been', 6, '坐车上山，每次转弯都忍不住惊呼。', 'On the bus up, every hairpin bend made me gasp.', 17], [85, 25, 'want', 0, '想从上往下拍这条路的全貌。', 'I want to shoot the whole road from above.', 8], [76, 84, 'been', 11, '容易晕车的朋友记得提前准备。', 'Prone to car sickness? Come prepared.', 6]]
  };
  // Everyday one-liners that fit any scene and name no place. More notes per scene, some placed close together,
  // so the strips (top three by likes) sit beside smaller envelope bubbles that group nearby notes.
  const POOL = [
    ['这个角度很好出片。', 'A great angle for photos.'],
    ['傍晚的光线最温柔。', 'The evening light is the softest.'],
    ['记得穿双舒服的鞋。', 'Wear comfortable shoes.'],
    ['人有点多，但值得等。', 'A bit crowded, but worth the wait.'],
    ['已收藏，下次一定来。', 'Saved. Next time for sure.'],
    ['和照片里一模一样！', 'Exactly like the photo!'],
    ['早点来，能避开人潮。', 'Come early to beat the crowds.'],
    ['带上充电宝，根本拍不停。', 'Bring a power bank. You won’t stop shooting.'],
    ['雨天来也别有味道。', 'It has its own charm on a rainy day.'],
    ['想和朋友再来一次。', 'I want to come back with friends.'],
    ['细节越看越有意思。', 'The details get better the longer you look.'],
    ['站在这里，心会安静下来。', 'Standing here, everything goes quiet.'],
    ['找个地方坐一会儿，很惬意。', 'Find a spot to sit for a while. Lovely.'],
    ['第一次看到，有点被震住了。', 'Seeing it for the first time left me a little stunned.'],
    ['拍全景记得横着拿手机。', 'Hold your phone sideways for the full view.'],
    ['慢慢逛，别赶时间。', 'Take it slow. Don’t rush.']
  ];
  // Row: [x, y, 'been' | 'want', nameIndex, POOL index, likes]
  const extra = {
    'yungang': [[23, 29, 'been', 9, 8, 4], [28, 29, 'want', 2, 9, 3], [26, 25, 'been', 7, 7, 2], [29, 62, 'want', 0, 11, 1], [33, 59, 'want', 0, 10, 7], [49, 45, 'want', 9, 13, 5]],
    'huayan': [[20, 45, 'want', 3, 10, 6], [25, 45, 'been', 0, 13, 4], [22, 41, 'want', 10, 15, 2], [37, 71, 'been', 5, 2, 1], [41, 68, 'been', 10, 7, 5], [75, 25, 'been', 8, 3, 1]],
    'xuankong': [[39, 67, 'been', 8, 3, 4], [44, 67, 'want', 5, 0, 1], [42, 63, 'been', 7, 5, 6], [20, 49, 'been', 11, 15, 6], [25, 46, 'been', 3, 13, 6], [73, 49, 'been', 9, 6, 1]],
    'sz-futian': [[76, 67, 'been', 8, 9, 7], [81, 67, 'want', 0, 12, 7], [78, 63, 'want', 1, 10, 5], [48, 53, 'been', 7, 3, 4], [52, 50, 'want', 7, 7, 1], [73, 26, 'been', 2, 8, 6]],
    'sz-houhai': [[18, 67, 'want', 11, 4, 2], [23, 67, 'want', 11, 3, 3], [21, 63, 'been', 11, 14, 3], [37, 40, 'been', 0, 7, 7], [42, 37, 'been', 4, 5, 6], [80, 53, 'want', 5, 9, 2]],
    'sz-qianhai': [[32, 32, 'been', 8, 6, 7], [37, 32, 'want', 0, 11, 1], [34, 28, 'been', 1, 0, 2], [31, 73, 'want', 1, 15, 2], [35, 70, 'want', 0, 3, 3], [75, 51, 'want', 6, 13, 1]],
    'suzhou-zhuozheng': [[81, 54, 'been', 9, 13, 1], [86, 54, 'want', 6, 9, 2], [83, 50, 'been', 10, 6, 3], [36, 56, 'want', 9, 1, 5], [41, 53, 'been', 7, 8, 5], [56, 25, 'want', 4, 14, 5]],
    'suzhou-huqiu': [[62, 59, 'want', 7, 1, 4], [68, 59, 'been', 9, 9, 2], [65, 55, 'want', 7, 0, 6], [22, 61, 'want', 6, 3, 4], [27, 58, 'been', 4, 12, 4], [47, 77, 'want', 4, 4, 1]],
    'suzhou-shantang': [[70, 72, 'been', 6, 0, 3], [76, 71, 'want', 3, 15, 5], [73, 67, 'want', 3, 2, 3], [67, 50, 'been', 0, 5, 7], [72, 47, 'been', 7, 14, 2], [37, 33, 'been', 9, 9, 5]],
    'gl-xingping': [[59, 68, 'been', 11, 13, 7], [64, 67, 'want', 8, 3, 2], [62, 63, 'want', 9, 9, 2], [77, 47, 'want', 0, 2, 6], [82, 44, 'want', 8, 6, 7], [43, 67, 'been', 4, 14, 7]],
    'gl-yulong': [[28, 30, 'been', 4, 6, 6], [32, 29, 'want', 7, 5, 6], [30, 25, 'been', 9, 13, 5], [75, 44, 'been', 1, 14, 1], [79, 41, 'want', 0, 3, 7], [51, 25, 'want', 1, 8, 7]],
    'gl-longji': [[13, 59, 'been', 1, 1, 4], [19, 58, 'been', 1, 3, 4], [16, 54, 'want', 5, 10, 2], [56, 61, 'want', 0, 4, 4], [61, 58, 'want', 7, 13, 4], [38, 32, 'want', 4, 9, 5]],
    'hk-peak': [[56, 34, 'been', 11, 1, 1], [61, 34, 'been', 6, 0, 6], [59, 29, 'want', 11, 10, 1], [21, 57, 'want', 4, 7, 5], [25, 54, 'want', 2, 15, 5], [84, 58, 'been', 3, 3, 1]],
    'hk-star-ferry': [[34, 73, 'want', 10, 2, 1], [40, 73, 'want', 8, 13, 3], [37, 69, 'been', 5, 5, 1], [63, 49, 'want', 4, 15, 7], [68, 46, 'been', 11, 6, 7], [51, 25, 'want', 8, 8, 6]],
    'hk-sham-shui-po': [[32, 58, 'been', 1, 14, 6], [37, 57, 'been', 3, 9, 3], [35, 53, 'been', 4, 8, 6], [53, 54, 'been', 3, 3, 1], [58, 51, 'want', 9, 2, 5], [79, 77, 'been', 5, 0, 3]],
    'bj-zhengyangmen': [[41, 77, 'been', 2, 0, 4], [47, 77, 'want', 5, 4, 2], [44, 73, 'been', 7, 14, 1], [76, 50, 'want', 2, 13, 6], [80, 47, 'been', 9, 11, 3], [68, 28, 'been', 4, 6, 7]],
    'bj-hongyige': [[35, 37, 'been', 8, 10, 5], [40, 36, 'want', 5, 5, 7], [38, 32, 'want', 1, 7, 4], [81, 53, 'want', 9, 15, 1], [85, 50, 'been', 7, 3, 3], [18, 48, 'want', 5, 1, 1]],
    'bj-beihai': [[60, 44, 'been', 3, 13, 1], [65, 44, 'been', 4, 11, 6], [63, 40, 'want', 7, 10, 4], [78, 78, 'been', 1, 12, 7], [82, 75, 'want', 5, 9, 1], [31, 29, 'been', 4, 7, 4]],
    'sh-bund': [[22, 56, 'been', 6, 11, 2], [27, 56, 'been', 5, 6, 6], [25, 52, 'want', 7, 10, 2], [56, 52, 'want', 3, 13, 2], [60, 49, 'want', 1, 4, 6], [82, 47, 'want', 0, 2, 4]],
    'sh-lujiazui': [[25, 65, 'been', 2, 3, 4], [30, 65, 'want', 5, 13, 2], [28, 60, 'been', 8, 4, 1], [39, 51, 'want', 7, 12, 4], [43, 48, 'want', 9, 10, 7], [20, 39, 'want', 2, 1, 2]],
    'sh-bund-night': [[55, 35, 'want', 5, 8, 3], [60, 35, 'want', 7, 15, 6], [57, 31, 'been', 5, 14, 6], [40, 27, 'want', 3, 11, 4], [45, 24, 'want', 7, 12, 1], [27, 40, 'want', 8, 3, 4]],
    'zjj-tianzishan': [[20, 69, 'want', 2, 4, 7], [24, 69, 'want', 9, 6, 5], [22, 65, 'want', 0, 5, 1], [33, 44, 'been', 11, 8, 4], [36, 41, 'been', 2, 9, 5], [54, 62, 'been', 1, 1, 3]],
    'zjj-misty-peaks': [[49, 45, 'been', 8, 4, 5], [54, 45, 'want', 7, 5, 6], [52, 41, 'been', 7, 0, 5], [23, 53, 'been', 8, 12, 1], [28, 50, 'been', 4, 6, 2], [77, 61, 'been', 2, 11, 5]],
    'zjj-tianmen-cave': [[17, 71, 'want', 9, 6, 2], [23, 70, 'been', 0, 9, 2], [20, 66, 'been', 2, 5, 5], [67, 73, 'want', 8, 12, 3], [72, 70, 'been', 11, 0, 2], [37, 36, 'been', 7, 1, 2]],
    'zjj-winding-road': [[64, 65, 'been', 0, 14, 1], [69, 64, 'been', 10, 3, 2], [67, 60, 'want', 8, 13, 6], [37, 69, 'want', 7, 2, 1], [42, 66, 'been', 5, 10, 4], [62, 31, 'want', 3, 8, 4]]
  };
  for (const [sceneId, list] of Object.entries(extra)) rows[sceneId] = [...(rows[sceneId] || []), ...list.map(([x, y, kind, who, line, likes]) => [x, y, kind, who, ...POOL[line], likes])];
  window.TW_BUBBLE_SEED = Object.freeze(Object.fromEntries(Object.entries(rows).map(([sceneId, list]) => [sceneId, list.map(([x, y, kind, who, text, en, likes], i) => ({id: `seed-${sceneId}-${i}`, u: x / 100, v: y / 100, kind, name: NAMES[who][0], nameEn: NAMES[who][1], text, textEn: en, likes, seed: true}))])));
})();
