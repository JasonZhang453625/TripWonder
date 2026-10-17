/* What Wonder Coins can buy: coupon tiers and sample merchant slots.
   All merchants are fictional samples. This file is the seam where Trip.com coupon and merchant data
   can replace the samples later (same fields, different source). */
(() => {
  'use strict';
  // All travel coupons are redeemed in the Points Mall using Wonder Coins.
  const coupons = [
    {id: 'c-hotel', kind: '酒店', kindEn: 'Hotels', icon: 'bed', amount: 80, rule: '满 600 元可用', ruleEn: 'On orders of ¥600+', price: 6000},
    {id: 'c-flight', kind: '机票', kindEn: 'Flights', icon: 'plane', amount: 50, rule: '满 800 元可用', ruleEn: 'On orders of ¥800+', price: 5000},
    {id: 'c-ticket', kind: '景点门票', kindEn: 'Attraction tickets', icon: 'ticket', amount: 30, rule: '满 150 元可用', ruleEn: 'On orders of ¥150+', price: 2500},
    {id: 'c-local', kind: '当地玩乐', kindEn: 'Local experiences', icon: 'spark', amount: 8.5, discount: true, rule: '最高减 50 元', ruleEn: 'Save up to ¥50', price: 3000},
    {id: 'c-train', kind: '火车票', kindEn: 'Train tickets', icon: 'train', amount: 20, rule: '满 200 元可用', ruleEn: 'On orders of ¥200+', price: 2000},
    {id: 'c-food', kind: '美食', kindEn: 'Dining', icon: 'bag', amount: 25, rule: '满 100 元可用', ruleEn: 'On orders of ¥100+', price: 1500}
  ];
  // cityIds: [] = shown everywhere. A city-specific slot only appears once that destination has been solved,
  // so a merchant can never give away the answer to an unplayed challenge.
  const sponsors = [
    {id: 's-photo', name: '拾光旅拍', nameEn: 'Lightkeeper Photos', category: '旅拍', categoryEn: 'Travel photos', icon: 'spark', hue: 330, cityIds: [],
      tagline: '在你喜欢的风景里，拍一组旅行写真。', taglineEn: 'A travel photo shoot in the view you love.', offer: '旅拍套餐立减 100 元', offerEn: '¥100 off a photo package', price: 4000},
    {id: 's-luggage', name: '轻行寄存', nameEn: 'Travel Light Lockers', category: '行李寄存', categoryEn: 'Luggage storage', icon: 'bag', hue: 205, cityIds: [],
      tagline: '车站附近寄存行李，空手逛城市。', taglineEn: 'Drop your bags near the station and explore hands-free.', offer: '免费寄存 1 次', offerEn: 'One free bag drop', price: 1000},
    {id: 's-craft', name: '山海手作', nameEn: 'Hills & Seas Crafts', category: '手作体验', categoryEn: 'Craft workshops', icon: 'heart', hue: 28, cityIds: [],
      tagline: '跟着本地匠人，做一件带得走的纪念品。', taglineEn: 'Make a keepsake with a local craftsperson.', offer: '手作体验 9 折', offerEn: '10% off a workshop', price: 1500},
    {id: 's-datong', name: '刀削面工坊', nameEn: 'Knife-Cut Noodle Workshop', category: '美食', categoryEn: 'Food', icon: 'bag', hue: 38, cityIds: ['datong'],
      tagline: '看师傅一刀一刀削出面条，再亲手试一次。', taglineEn: 'Watch the chef shave noodles, then try it yourself.', offer: '双人面食套餐减 20 元', offerEn: '¥20 off a noodle set for two', price: 1500},
    {id: 's-beijing', name: '胡同骑行社', nameEn: 'Hutong Bike Club', category: '骑行', categoryEn: 'Cycling', icon: 'route', hue: 4, cityIds: ['beijing'],
      tagline: '傍晚骑车穿过胡同，绕湖看日落。', taglineEn: 'An evening ride through the lanes to a lakeside sunset.', offer: '骑行导览 8 折', offerEn: '20% off a guided ride', price: 2000},
    {id: 's-shanghai', name: '弄堂咖啡', nameEn: 'Lane House Coffee', category: '咖啡', categoryEn: 'Coffee', icon: 'bag', hue: 24, cityIds: ['shanghai'],
      tagline: '老房子里的一杯手冲。', taglineEn: 'Pour-over coffee in an old lane house.', offer: '第二杯半价', offerEn: 'Second cup half price', price: 1000},
    {id: 's-suzhou', name: '听雨茶馆', nameEn: 'Rain-Listening Teahouse', category: '茶馆', categoryEn: 'Teahouse', icon: 'heart', hue: 150, cityIds: ['suzhou'],
      tagline: '一壶茶，一段评弹。', taglineEn: 'A pot of tea and a ballad performance.', offer: '双人茶位减 30 元', offerEn: '¥30 off seats for two', price: 2000},
    {id: 's-guilin', name: '青竹筏', nameEn: 'Green Bamboo Rafts', category: '漂流', categoryEn: 'Rafting', icon: 'palm', hue: 130, cityIds: ['guilin'],
      tagline: '一支竹篙，慢慢漂过山水。', taglineEn: 'Drift slowly past the hills on a bamboo raft.', offer: '竹筏票减 40 元', offerEn: '¥40 off a raft ride', price: 3000},
    {id: 's-hongkong', name: '叮叮茶餐厅', nameEn: 'Ding Ding Café', category: '茶餐厅', categoryEn: 'Café', icon: 'bag', hue: 0, cityIds: ['hongkong'],
      tagline: '奶茶、菠萝油和一张靠窗的卡座。', taglineEn: 'Milk tea, pineapple buns and a window booth.', offer: '下午茶套餐 85 折', offerEn: '15% off afternoon tea', price: 1500},
    {id: 's-shenzhen', name: '湾区单车', nameEn: 'Bay Ride Bikes', category: '骑行', categoryEn: 'Cycling', icon: 'route', hue: 190, cityIds: ['shenzhen'],
      tagline: '沿着海边绿道骑到日落。', taglineEn: 'Ride the seaside greenway into the sunset.', offer: '单车日租减 15 元', offerEn: '¥15 off a day rental', price: 1000},
    {id: 's-zhangjiajie', name: '峰林向导', nameEn: 'Pillar Peak Guides', category: '向导', categoryEn: 'Guides', icon: 'pin', hue: 110, cityIds: ['zhangjiajie'],
      tagline: '避开人流的小路，看最安静的峰林。', taglineEn: 'Quiet trails to the stone pillars, away from the crowds.', offer: '半日向导减 60 元', offerEn: '¥60 off a half-day guide', price: 3500}
  ];
  window.TW_OFFERS = Object.freeze({coupons, sponsors});
})();
