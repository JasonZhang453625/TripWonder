/* The itinerary assistant uses the prototype's local route planner. */
window.ItineraryPlanner = (() => {
  const draft = {text:'', city:'', date:'', people:0, theme:'自动', days:2, inspiration:0};
  let cleanup;
  const svg = (path, cls='') => `<svg class="ip-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  const icons = {
    back:svg('<path d="m15 3-10 9 10 9"/>'),
    info:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>'),
    history:svg('<path d="M6 3h16v15M2 7h16v13H9l-4 3v-3H2Z"/><path d="M8 11v4h5"/>'),
    calendar:svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 10h18"/>'),
    user:svg('<circle cx="12" cy="6" r="4"/><path d="M4 21v-3a8 7 0 0 1 16 0v3Z"/>'),
    heart:svg('<path d="M12 21S2 14 2 7a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 7-10 14-10 14Z"/>'),
    mic:svg('<rect x="8" y="2" width="8" height="15" rx="4"/><path d="M3 11v2a9 9 0 0 0 18 0v-2M12 22v-2"/>'),
    spark:svg('<path d="m14 6 2.5 6.5L23 15l-6.5 2.5L14 24l-2.5-6.5L5 15l6.5-2.5ZM5 1l1.3 3.7L10 6 6.3 7.3 5 11 3.7 7.3 0 6l3.7-1.3Z" fill="currentColor" stroke="none"/>'),
    next:svg('<path d="m9 4 8 8-8 8"/>'),
    refresh:svg('<path d="M20 8a9 9 0 1 0 1 7M20 2v6h-6"/>'),
    send:svg('<path d="m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2"/>')
  };
  const ideas = [
    [['丛林徒步看自然风景','guilin','自然'],['动物园里观察小动物','beijing','自然']],
    [['在古城里寻找历史','datong','文化'],['沿着海岸慢慢散步','shenzhen','摄影']],
    [['周末去园林发发呆','suzhou','建筑'],['去山间追一场云海','zhangjiajie','自然']]
  ];
  function seed(city) { draft.city=city.name; draft.text=city.name; }
  function render({esc, tr, cities, itineraries, img, back}) {
    const items=Object.entries(itineraries);
    const cityChips=['大同','北京','浑源','深圳','舟山'];
    const cards=items.length?items.slice(0,1).map(([id,it])=>`<button class="ip-route-card" data-itinerary="${esc(id)}"><span><strong>${esc(it.city)}·${it.days}日之旅</strong><small>${it.days}天<span>｜</span>${it.route.flat().length}个地点</small></span>${img(cities.find(c=>c.id===id)?.scenes[0].id,'')}</button>`).join(''):`<button class="ip-route-card" data-ip="sample"><span><strong>舟山·海天佛国三日文化之旅</strong><small>3天<span>｜</span>10个地点</small></span><img src="assets/planner/zhoushan-reference.webp" alt="舟山海滨风景"></button>`;
    const currentIdeas=ideas[draft.inspiration%ideas.length];
    const photos=[['guilin','自然山水','自然'],['datong','古城寻迹','文化'],['zhangjiajie','山间漫游','自然']];
    return `<div class="page ip-page"><header class="ip-header"><button class="ip-back" data-go="${back}" aria-label="${tr('返回','Back')}">${icons.back}</button><h1>${tr('AI行程助手','AI Trip Planner')}</h1><button class="ip-rules" data-ip="rules">${icons.info}<span>${tr('使用规则','Guide')}</span></button><button class="ip-history" data-ip="all" aria-label="${tr('行程记录','Trip history')}">${icons.history}</button></header>
      <section class="ip-compose"><h2><span aria-hidden="true">👋</span>${tr('下一站想去哪？','Where to next?')}</h2><div class="ip-input-frame"><div class="ip-cities" aria-label="${tr('推荐目的地','Suggested destinations')}">${cityChips.map(name=>`<button data-ip-city="${name}" aria-pressed="${draft.city===name}">${name}<span>＋</span></button>`).join('')}</div><textarea id="ip-prompt" rows="4" aria-label="${tr('目的地或者旅行想法','Destination or travel ideas')}" placeholder="${tr('告诉我一个目的地或者想法，我来规划','Tell me a destination or an idea, I’ll plan it')}">${esc(draft.text)}</textarea><div class="ip-tools"><button data-ip="date" class="${draft.date?'is-set':''}">${icons.calendar}<span>${draft.date?esc(draft.date.slice(5).replace('-','/')):tr('日期','Dates')}</span></button><button data-ip="people" class="${draft.people?'is-set':''}">${icons.user}<span>${draft.people?draft.people+tr('人',' guests'):tr('人数','Guests')}</span></button><button data-ip="theme" class="${draft.theme!=='自动'?'is-set':''}">${icons.heart}<span>${draft.theme==='自动'?tr('偏好','Interests'):esc(draft.theme)}</span></button><button class="ip-mic" data-ip="voice" aria-label="${tr('语音输入','Voice input')}">${icons.mic}</button></div></div><button class="ip-generate" data-ip="generate">${icons.spark}${tr('AI规划旅程','Plan my trip')}</button><button class="ip-manual" data-ip="manual">${tr('手动创建线路','Create a route manually')}</button></section>
      <section class="ip-section ip-my-routes"><div class="ip-section-title"><h2>${tr('我的线路','My routes')}</h2><button data-ip="all">${tr('查看全部','View all')}${icons.next}</button></div>${cards}</section>
      <section class="ip-section ip-inspiration"><div class="ip-section-title"><h2>${tr('旅行灵感','Travel inspiration')}</h2><button data-ip="refresh">${tr('换一换','Refresh')}${icons.refresh}</button></div><div class="ip-ideas">${currentIdeas.map(([text,id,theme])=>`<button data-ip-idea="${id}" data-ip-theme="${theme}">${text}${icons.send}</button>`).join('')}</div><div class="ip-photo-strip">${photos.map(([id,label,theme],index)=>{const c=cities.find(c=>c.id===id);return `<button data-ip-idea="${id}" data-ip-theme="${theme}"><img src="assets/planner/inspiration-${index+1}.webp" alt="${label}"><span>${label}</span></button>`;}).join('')}</div></section></div>`;
  }
  function mount(root,ctx) {
    cleanup?.();
    const controller=new AbortController(), {signal}=controller;
    let recognition;
    const {esc,tr,cities,itineraries,img,sheet,closeModal,toast,onPlan}=ctx;
    const prompt=root.querySelector('#ip-prompt');
    const updateTools=()=>{
      for(const [key,value] of [['date',draft.date?draft.date.slice(5).replace('-','/'):'日期'],['people',draft.people?`${draft.people}人`:'人数'],['theme',draft.theme==='自动'?'偏好':draft.theme]]){
        const b=root.querySelector(`[data-ip="${key}"]`);b.querySelector('span').textContent=value;b.classList.toggle('is-set',!['日期','人数','偏好'].includes(value));
      }
    };
    const choose=(name,text=name)=>{draft.city=name;draft.text=text;prompt.value=text;root.querySelectorAll('[data-ip-city]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ipCity===name));prompt.focus({preventScroll:true});};
    const list=()=>sheet(tr('我的线路','My routes'),Object.entries(itineraries).map(([id,it])=>`<button class="ip-saved-route" data-itinerary="${esc(id)}">${img(cities.find(c=>c.id===id).scenes[0].id,'')}<span><strong>${esc(it.city)} ${it.days}日之旅</strong><small>${it.days}天 · ${it.route.flat().length}个地点</small></span>${icons.next}</button>`).join('')||`<p>还没有保存的线路，先规划一次旅程吧。</p><button class="ip-saved-route" data-ip="sample">舟山·海天佛国三日文化之旅 ${icons.next}</button>`,'ip-dialog');
    function plan(manual=false) {
      const text=draft.text.trim();
      if(manual){sheet('选择目的地',`<div class="ip-choices">${cities.map(c=>`<button data-ip-start="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</div>`,'ip-dialog');return;}
      if(!text){prompt.focus();toast('告诉我一个目的地或者想法吧');return;}
      let c=cities.find(c=>text.includes(c.name));
      if(!c&&text.includes('浑源'))c=cities.find(c=>c.id==='datong');
      if(!c){sheet('选择这次旅行的目的地',`<p>当前可使用以下目的地的本地景点资料规划线路，请选择一座城市。</p><div class="ip-choices">${cities.map(c=>`<button data-ip-start="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</div>`,'ip-dialog');return;}
      const dayMatch=text.match(/([一二三123])\s*[天日]/);if(dayMatch)draft.days=({'一':1,'二':2,'三':3})[dayMatch[1]]||Number(dayMatch[1]);
      const theme=['文化','建筑','自然','摄影','美食'].find(t=>text.includes(t));
      closeModal();onPlan(c.id,{...draft,theme:theme||draft.theme});
    }
    prompt.addEventListener('input',()=>{draft.text=prompt.value;},{signal});
    document.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.ipCity){choose(b.dataset.ipCity);return;}
      if(b.dataset.ipIdea){const c=cities.find(c=>c.id===b.dataset.ipIdea);draft.theme=b.dataset.ipTheme;choose(c.name,`${c.name}，${b.textContent.trim()}`);updateTools();root.scrollIntoView({block:'start',behavior:'smooth'});return;}
      if(b.dataset.ipStart){const c=cities.find(c=>c.id===b.dataset.ipStart);draft.city=c.name;closeModal();onPlan(c.id,{...draft});return;}
      if(b.dataset.ipChoice){const [key,value]=b.dataset.ipChoice.split(':');draft[key]=key==='people'?Number(value):value;closeModal();updateTools();return;}
      switch(b.dataset.ip){
        case 'rules':sheet('使用规则','<p>输入目的地或旅行想法，选择日期、出行人数和偏好，再点击「AI规划旅程」。也可以手动创建线路。</p><p>当前原型使用本地景点资料生成可调整的线路，暂未连接在线 AI 行程服务。线路可编辑并保存于本次体验，刷新后清空；开放时间与交通请出发前核实。</p>','ip-dialog');break;
        case 'date':sheet('选择出发日期',`<label class="ip-date-label">出发日期<input type="date" id="ip-date" value="${esc(draft.date)}"></label><button class="ip-confirm" data-ip="save-date">确定</button>`,'ip-dialog');break;
        case 'save-date':draft.date=document.querySelector('#ip-date').value;closeModal();updateTools();break;
        case 'people':sheet('出行人数',`<div class="ip-choices">${[1,2,3,4,5,6].map(n=>`<button data-ip-choice="people:${n}" aria-pressed="${draft.people===n}">${n}人</button>`).join('')}</div>`,'ip-dialog');break;
        case 'theme':sheet('旅行偏好',`<div class="ip-choices">${['自动','文化','建筑','自然','摄影','美食'].map(t=>`<button data-ip-choice="theme:${t}" aria-pressed="${draft.theme===t}">${t}</button>`).join('')}</div>`,'ip-dialog');break;
        case 'all':list();break;
        case 'sample':sheet('舟山·海天佛国三日文化之旅','<p>参考线路 · 3天 · 10个地点</p><p>第1天：普陀山、普济寺、百步沙</p><p>第2天：法雨寺、慧济寺、佛顶山、南海观音</p><p>第3天：朱家尖、南沙、大青山</p><p class="ip-muted">此卡片为参考图中的示例线路。当前本地规划资料未收录舟山。</p>','ip-dialog');break;
        case 'refresh':draft.inspiration=(draft.inspiration+1)%ideas.length;{const scroll=root.parentElement.scrollTop;ctx.rerender();document.querySelector('#app').scrollTop=scroll;}break;
        case 'generate':plan();break;
        case 'manual':plan(true);break;
        case 'voice':{
          if(recognition){recognition.stop();return;}
          const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
          if(!Speech){prompt.focus();toast('当前浏览器不支持语音输入，请使用键盘输入');break;}
          recognition=new Speech();recognition.lang=I18N.isEn()?'en-US':'zh-CN';recognition.interimResults=false;
          recognition.onresult=e=>{draft.text=prompt.value=e.results[0][0].transcript;};
          recognition.onerror=()=>toast('语音输入未完成，请重试或使用键盘输入');
          recognition.onend=()=>{recognition=null;b.classList.remove('is-recording');b.setAttribute('aria-label','语音输入');};
          try{recognition.start();b.classList.add('is-recording');b.setAttribute('aria-label','停止语音输入');}catch{recognition=null;toast('语音输入暂不可用，请使用键盘输入');}break;
        }
      }
    },{signal});
    cleanup=()=>{controller.abort();recognition?.abort();recognition=null;};
  }
  function destroy(){cleanup?.();cleanup=null;}
  return {render,mount,destroy,seed};
})();
