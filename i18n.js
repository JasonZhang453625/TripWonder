/* Prototype language: Chinese (default) or English. Code keeps Chinese values as internal keys
   (route stops, map regions, interests), and every visible string goes through t(), f() or term(). */
window.I18N = (() => {
  'use strict';
  const KEY = 'tripwonder-lang';
  let lang = 'zh';
  try { const saved = localStorage.getItem(KEY); if (saved === 'en' || saved === 'zh') lang = saved; } catch {}
  const listeners = new Set();

  // Closed vocabularies used as data values: clue tags, route interests, pace, map labels.
  const TERMS = {
    历史:'History', 艺术:'Art', 建筑:'Architecture', 体验:'Experience', 城市:'City', 自然:'Nature', 地标:'Landmark',
    地理:'Geography', 生活:'Daily life', 农耕:'Farming', 季节:'Seasons', 乘船:'By boat', 识别:'Identify', 辨别:'Tell apart',
    地名:'Place names', 宫廷:'Court life', 文字:'Inscriptions', 保护:'Conservation', 纪念:'Memorial', 摄影:'Photography',
    文化:'Culture', 推理:'Reasoning', 美食:'Food', 自动:'Auto', 慢游:'Relaxed', 舒适:'Balanced', 紧凑:'Packed',
    景点:'Sight', 旅行发现:'Travel finds', 南海诸岛:'South China Sea Islands'
  };
  const PROVINCES = {
    北京:'Beijing', 天津:'Tianjin', 上海:'Shanghai', 重庆:'Chongqing', 河北:'Hebei', 山西:'Shanxi', 内蒙古:'Inner Mongolia',
    辽宁:'Liaoning', 吉林:'Jilin', 黑龙江:'Heilongjiang', 江苏:'Jiangsu', 浙江:'Zhejiang', 安徽:'Anhui', 福建:'Fujian',
    江西:'Jiangxi', 山东:'Shandong', 河南:'Henan', 湖北:'Hubei', 湖南:'Hunan', 广东:'Guangdong', 广西:'Guangxi',
    海南:'Hainan', 四川:'Sichuan', 贵州:'Guizhou', 云南:'Yunnan', 西藏:'Xizang', 陕西:'Shaanxi', 甘肃:'Gansu',
    青海:'Qinghai', 宁夏:'Ningxia', 新疆:'Xinjiang', 香港:'Hong Kong', 澳门:'Macao', 台湾:'Taiwan',
    广西壮族自治区:'Guangxi', 中国香港特别行政区:'Hong Kong SAR'
  };
  const NATIONS = {
    不丹:'Bhutan', 俄罗斯:'Russia', 印度:'India', 吉尔吉斯斯坦:'Kyrgyzstan', 哈萨克斯坦:'Kazakhstan', 塔吉克斯坦:'Tajikistan',
    孟加拉国:'Bangladesh', 尼泊尔:'Nepal', 巴基斯坦:'Pakistan', 日本:'Japan', 朝鲜:'North Korea', 柬埔寨:'Cambodia', 泰国:'Thailand',
    缅甸:'Myanmar', 老挝:'Laos', 菲律宾:'Philippines', 蒙古:'Mongolia', 越南:'Vietnam', 阿富汗:'Afghanistan', 韩国:'South Korea',
    马来西亚:'Malaysia'
  };
  // Provincial capitals and every prefecture-level division of the city layer (keys without 市).
  const CITIES = Object.fromEntries(`石家庄 Shijiazhuang|唐山 Tangshan|秦皇岛 Qinhuangdao|邯郸 Handan|邢台 Xingtai|保定 Baoding|张家口 Zhangjiakou|承德 Chengde|沧州 Cangzhou|廊坊 Langfang|衡水 Hengshui|太原 Taiyuan|大同 Datong|阳泉 Yangquan|长治 Changzhi|晋城 Jincheng|朔州 Shuozhou|晋中 Jinzhong|运城 Yuncheng|忻州 Xinzhou|临汾 Linfen|吕梁 Lüliang|呼和浩特 Hohhot|包头 Baotou|乌海 Wuhai|赤峰 Chifeng|通辽 Tongliao|鄂尔多斯 Ordos|呼伦贝尔 Hulunbuir|巴彦淖尔 Bayannur|乌兰察布 Ulanqab|兴安盟 Hinggan League|锡林郭勒盟 Xilingol League|阿拉善盟 Alxa League|沈阳 Shenyang|大连 Dalian|鞍山 Anshan|抚顺 Fushun|本溪 Benxi|丹东 Dandong|锦州 Jinzhou|营口 Yingkou|阜新 Fuxin|辽阳 Liaoyang|盘锦 Panjin|铁岭 Tieling|朝阳 Chaoyang|葫芦岛 Huludao|长春 Changchun|吉林 Jilin|四平 Siping|辽源 Liaoyuan|通化 Tonghua|白山 Baishan|松原 Songyuan|白城 Baicheng|延边朝鲜族自治州 Yanbian Prefecture|哈尔滨 Harbin|齐齐哈尔 Qiqihar|鸡西 Jixi|鹤岗 Hegang|双鸭山 Shuangyashan|大庆 Daqing|伊春 Yichun|佳木斯 Jiamusi|七台河 Qitaihe|牡丹江 Mudanjiang|黑河 Heihe|绥化 Suihua|大兴安岭地区 Da Hinggan Ling|南京 Nanjing|无锡 Wuxi|徐州 Xuzhou|常州 Changzhou|苏州 Suzhou|南通 Nantong|连云港 Lianyungang|淮安 Huai'an|盐城 Yancheng|扬州 Yangzhou|镇江 Zhenjiang|泰州 Taizhou|宿迁 Suqian|杭州 Hangzhou|宁波 Ningbo|温州 Wenzhou|嘉兴 Jiaxing|湖州 Huzhou|绍兴 Shaoxing|金华 Jinhua|衢州 Quzhou|舟山 Zhoushan|台州 Taizhou|丽水 Lishui|合肥 Hefei|芜湖 Wuhu|蚌埠 Bengbu|淮南 Huainan|马鞍山 Ma'anshan|淮北 Huaibei|铜陵 Tongling|安庆 Anqing|黄山 Huangshan|滁州 Chuzhou|阜阳 Fuyang|宿州 Suzhou (Anhui)|六安 Lu'an|亳州 Bozhou|池州 Chizhou|宣城 Xuancheng|福州 Fuzhou|厦门 Xiamen|莆田 Putian|三明 Sanming|泉州 Quanzhou|漳州 Zhangzhou|南平 Nanping|龙岩 Longyan|宁德 Ningde|南昌 Nanchang|景德镇 Jingdezhen|萍乡 Pingxiang|九江 Jiujiang|新余 Xinyu|鹰潭 Yingtan|赣州 Ganzhou|吉安 Ji'an|宜春 Yichun|抚州 Fuzhou (Jiangxi)|上饶 Shangrao|济南 Jinan|青岛 Qingdao|淄博 Zibo|枣庄 Zaozhuang|东营 Dongying|烟台 Yantai|潍坊 Weifang|济宁 Jining|泰安 Tai'an|威海 Weihai|日照 Rizhao|临沂 Linyi|德州 Dezhou|聊城 Liaocheng|滨州 Binzhou|菏泽 Heze|郑州 Zhengzhou|开封 Kaifeng|洛阳 Luoyang|平顶山 Pingdingshan|安阳 Anyang|鹤壁 Hebi|新乡 Xinxiang|焦作 Jiaozuo|濮阳 Puyang|许昌 Xuchang|漯河 Luohe|三门峡 Sanmenxia|南阳 Nanyang|商丘 Shangqiu|信阳 Xinyang|周口 Zhoukou|驻马店 Zhumadian|济源 Jiyuan|武汉 Wuhan|黄石 Huangshi|十堰 Shiyan|宜昌 Yichang|襄阳 Xiangyang|鄂州 Ezhou|荆门 Jingmen|孝感 Xiaogan|荆州 Jingzhou|黄冈 Huanggang|咸宁 Xianning|随州 Suizhou|恩施土家族苗族自治州 Enshi Prefecture|仙桃 Xiantao|潜江 Qianjiang|天门 Tianmen|神农架林区 Shennongjia|长沙 Changsha|株洲 Zhuzhou|湘潭 Xiangtan|衡阳 Hengyang|邵阳 Shaoyang|岳阳 Yueyang|常德 Changde|张家界 Zhangjiajie|益阳 Yiyang|郴州 Chenzhou|永州 Yongzhou|怀化 Huaihua|娄底 Loudi|湘西土家族苗族自治州 Xiangxi Prefecture|广州 Guangzhou|韶关 Shaoguan|深圳 Shenzhen|珠海 Zhuhai|汕头 Shantou|佛山 Foshan|江门 Jiangmen|湛江 Zhanjiang|茂名 Maoming|肇庆 Zhaoqing|惠州 Huizhou|梅州 Meizhou|汕尾 Shanwei|河源 Heyuan|阳江 Yangjiang|清远 Qingyuan|东莞 Dongguan|中山 Zhongshan|潮州 Chaozhou|揭阳 Jieyang|云浮 Yunfu|南宁 Nanning|柳州 Liuzhou|桂林 Guilin|梧州 Wuzhou|北海 Beihai|防城港 Fangchenggang|钦州 Qinzhou|贵港 Guigang|玉林 Yulin|百色 Baise|贺州 Hezhou|河池 Hechi|来宾 Laibin|崇左 Chongzuo|海口 Haikou|三亚 Sanya|三沙 Sansha|儋州 Danzhou|五指山 Wuzhishan|琼海 Qionghai|文昌 Wenchang|万宁 Wanning|东方 Dongfang|定安县 Ding'an County|屯昌县 Tunchang County|澄迈县 Chengmai County|临高县 Lingao County|白沙黎族自治县 Baisha County|昌江黎族自治县 Changjiang County|乐东黎族自治县 Ledong County|陵水黎族自治县 Lingshui County|保亭黎族苗族自治县 Baoting County|琼中黎族苗族自治县 Qiongzhong County|成都 Chengdu|自贡 Zigong|攀枝花 Panzhihua|泸州 Luzhou|德阳 Deyang|绵阳 Mianyang|广元 Guangyuan|遂宁 Suining|内江 Neijiang|乐山 Leshan|南充 Nanchong|眉山 Meishan|宜宾 Yibin|广安 Guang'an|达州 Dazhou|雅安 Ya'an|巴中 Bazhong|资阳 Ziyang|阿坝藏族羌族自治州 Ngawa Prefecture|甘孜藏族自治州 Garzê Prefecture|凉山彝族自治州 Liangshan Prefecture|贵阳 Guiyang|六盘水 Liupanshui|遵义 Zunyi|安顺 Anshun|毕节 Bijie|铜仁 Tongren|黔西南布依族苗族自治州 Qianxinan Prefecture|黔东南苗族侗族自治州 Qiandongnan Prefecture|黔南布依族苗族自治州 Qiannan Prefecture|昆明 Kunming|曲靖 Qujing|玉溪 Yuxi|保山 Baoshan|昭通 Zhaotong|丽江 Lijiang|普洱 Pu'er|临沧 Lincang|楚雄彝族自治州 Chuxiong Prefecture|红河哈尼族彝族自治州 Honghe Prefecture|文山壮族苗族自治州 Wenshan Prefecture|西双版纳傣族自治州 Xishuangbanna|大理白族自治州 Dali Prefecture|德宏傣族景颇族自治州 Dehong Prefecture|怒江傈僳族自治州 Nujiang Prefecture|迪庆藏族自治州 Dêqên Prefecture|拉萨 Lhasa|日喀则 Shigatse|昌都 Qamdo|林芝 Nyingchi|山南 Shannan|那曲 Nagqu|阿里地区 Ngari|西安 Xi'an|铜川 Tongchuan|宝鸡 Baoji|咸阳 Xianyang|渭南 Weinan|延安 Yan'an|汉中 Hanzhong|榆林 Yulin (Shaanxi)|安康 Ankang|商洛 Shangluo|兰州 Lanzhou|嘉峪关 Jiayuguan|金昌 Jinchang|白银 Baiyin|天水 Tianshui|武威 Wuwei|张掖 Zhangye|平凉 Pingliang|酒泉 Jiuquan|庆阳 Qingyang|定西 Dingxi|陇南 Longnan|临夏回族自治州 Linxia Prefecture|甘南藏族自治州 Gannan Prefecture|西宁 Xining|海东 Haidong|海北藏族自治州 Haibei Prefecture|黄南藏族自治州 Huangnan Prefecture|海南藏族自治州 Hainan Prefecture (Qinghai)|果洛藏族自治州 Golog Prefecture|玉树藏族自治州 Yushu Prefecture|海西蒙古族藏族自治州 Haixi Prefecture|银川 Yinchuan|石嘴山 Shizuishan|吴忠 Wuzhong|固原 Guyuan|中卫 Zhongwei|乌鲁木齐 Ürümqi|克拉玛依 Karamay|吐鲁番 Turpan|哈密 Hami|昌吉回族自治州 Changji Prefecture|博尔塔拉蒙古自治州 Bortala Prefecture|巴音郭楞蒙古自治州 Bayingolin Prefecture|阿克苏地区 Aksu|克孜勒苏柯尔克孜自治州 Kizilsu Prefecture|喀什地区 Kashgar|和田地区 Hotan|伊犁哈萨克自治州 Ili Prefecture|塔城地区 Tacheng|阿勒泰地区 Altay|石河子 Shihezi|阿拉尔 Aral|图木舒克 Tumxuk|五家渠 Wujiaqu|北屯 Beitun|铁门关 Tiemenguan|双河 Shuanghe|可克达拉 Kokdala|昆玉 Kunyu|胡杨河 Huyanghe|台北 Taipei|重庆 Chongqing|天津 Tianjin|北京 Beijing|上海 Shanghai|香港 Hong Kong|澳门 Macao`
    .split('|').map(pair => { const at = pair.indexOf(' '); return [pair.slice(0, at), pair.slice(at + 1)]; }));

  const isEn = () => lang === 'en';
  const t = (zh, en) => lang === 'en' ? en : zh;
  // Data objects carry English beside Chinese as <key>En.
  const f = (item, key) => {
    if (!item) return '';
    if (lang !== 'en') return item[key];
    const en = item[key + 'En'] ?? (key === 'text' ? item.en : undefined);
    return en ?? item[key];
  };
  const term = value => lang === 'en' ? (TERMS[value] ?? value) : value;
  const place = name => {
    if (lang !== 'en' || !name) return name;
    return PROVINCES[name] || NATIONS[name] || CITIES[name] || CITIES[String(name).replace(/市$/, '')] || TERMS[name] || name;
  };
  function apply() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = t('TripWonder · 携程奇境挑战', 'TripWonder · Trip.com Challenge');
    document.querySelectorAll('[data-i18n-zh]').forEach(el => { el.textContent = t(el.dataset.i18nZh, el.dataset.i18nEn); });
    document.querySelectorAll('[data-i18n-label-zh]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nLabelZh, el.dataset.i18nLabelEn)));
  }
  function set(next) {
    if (next !== 'en' && next !== 'zh' || next === lang) return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch {}
    apply();
    listeners.forEach(fn => { try { fn(lang); } catch (error) { console.error(error); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once: true}); else apply();
  return Object.freeze({
    get lang() { return lang; }, isEn, t, f, term, place, set, apply,
    toggle: () => set(lang === 'en' ? 'zh' : 'en'),
    onChange: fn => { listeners.add(fn); return () => listeners.delete(fn); }
  });
})();
