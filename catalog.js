/* One destination is one challenge. Scenes and photo variants share a stable id. */
(() => {
  const datong = {
    id: 'datong', name: '大同', region: '山西', lat: 40.0768, lng: 113.3001,
    scenes: window.SCENES.map(scene => ({
      ...scene, name: window.PHOTOS.find(photo => photo.id === scene.id).name,
      photo: window.PHOTOS.find(photo => photo.id === scene.id)
    })),
    questions: [window.QUESTION_BANK[0][0], window.QUESTION_BANK[1][0], window.QUESTION_BANK[2][0]],
    stops: [
      {name:'云冈石窟', lat:40.1085, lng:113.1340, visitMinutes:180, theme:'文化', note:'为石窟群预留半天。出发前核对预约与开放信息。'},
      {name:'华严寺', lat:40.0962, lng:113.2825, visitMinutes:90, theme:'文化', note:'重点看两座辽金大殿；照片中的宝塔是另一座建筑。'},
      {name:'大同古城墙', lat:40.0910, lng:113.3000, visitMinutes:75, theme:'摄影', note:'沿城墙与街巷步行，留意景区实际开放路段。'},
      {name:'九龙壁', lat:40.0908, lng:113.3000, visitMinutes:45, theme:'文化', note:'适合作为古城步行段的短暂停留。'},
      {name:'悬空寺', lat:39.6650, lng:113.7050, visitMinutes:120, theme:'建筑', note:'位于浑源，单独安排半天至一天并核对登临预约。'},
      {name:'大同博物馆', lat:40.0706, lng:113.3165, visitMinutes:90, theme:'文化', note:'适合补足城市历史背景，先核对开放日。'}
    ]
  };
  const cities = [datong, window.CITY_SHENZHEN, window.CITY_SUZHOU, window.CITY_GUILIN, window.CITY_HONGKONG, window.CITY_BEIJING, window.CITY_SHANGHAI, window.CITY_ZHANGJIAJIE].filter(Boolean);
  const interests = {
    datong: [['文化','建筑'],['文化','建筑'],['建筑','摄影'],['文化','摄影'],['建筑','摄影'],['文化']],
    shenzhen: [['文化','摄影'],['文化'],['自然','摄影'],['自然','摄影'],['建筑','文化'],['自然','摄影']],
    suzhou: [['文化','建筑'],['建筑','摄影'],['建筑','摄影'],['美食','摄影'],['建筑','文化'],['建筑','摄影']],
    guilin: [['自然','摄影'],['自然'],['摄影','文化'],['自然','摄影'],['美食','摄影'],['自然','摄影']],
    hongkong: [['摄影','自然'],['摄影','文化'],['文化','美食'],['摄影','文化'],['文化','建筑'],['自然','摄影']]
  };
  const photoById = new Map();
  // The mountain challenge has four scenes but three questions; its first
  // question covers both peak views, followed by the cave and winding road.
  const questionScenes = {zhangjiajie:['zjj-tianzishan','zjj-tianmen-cave','zjj-winding-road']};
  for (const city of cities) city.questions.forEach((question,index) => {
    question.sceneId ||= questionScenes[city.id]?.[index] || city.scenes[index]?.id || city.scenes[0].id;
  });
  for (const city of cities) city.stops.forEach((stop,index) => { stop.interests = stop.interests || interests[city.id]?.[index] || []; });
  for (const city of cities) for (const scene of city.scenes) {
    const p = scene.photo;
    if (!p) throw Error(`Missing photo: ${city.id}/${scene.id}`);
    scene.name = scene.placeName || scene.name;
    p.id = scene.id;
    p.name = p.name || scene.name;
    p.city = city.name;
    p.width = p.screen?.width || p.screenWidth || p.width;
    p.height = p.screen?.height || p.screenHeight || p.height;
    if (!p.width || !p.height) throw Error(`Missing display dimensions: ${scene.id}`);
    if (p.screen && p.thumb) window.MEDIA_ASSETS[scene.id] = {screen:p.screen,thumb:p.thumb,detail:p.detail || p.screen};
    photoById.set(scene.id, p);
  }
  window.TRIPWONDER_CATALOG = {cities, photoById};
})();
