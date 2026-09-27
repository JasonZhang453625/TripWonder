/* A destination keepsake for the existing reward-claim dialog. */
window.RewardMedal = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const {t, f} = window.I18N;
  let instance = 0;
  // Latin names run far wider than two or three Songti characters: set them in capitals, sized to the ring.
  const engravedName = name => {
    if (!window.I18N.isEn()) return `font-family="'Songti SC','SimSun','Noto Serif CJK SC',serif" font-size="27" font-weight="700" letter-spacing="7">${escape(name)}`;
    const size = name.length <= 6 ? 24 : name.length <= 9 ? 20 : 17;
    return `font-family="Georgia,'Times New Roman',serif" font-size="${size}" font-weight="700" letter-spacing="2">${escape(name.toUpperCase())}`;
  };
  const engravings = {
    shenzhen: {
      label:'深圳天际线 · 平安金融中心', labelEn:'Shenzhen skyline · Ping An Finance Centre',
      art:`<path d="M58 190H242M68 190V150H94V190M72 150V143H90V150M100 190V124H121V190M104 133H117M104 142H117M104 151H117M104 160H117M104 169H117M104 178H117M131 190V120L144 70L157 120V190M136 120L144 88L152 120M136 125V181M144 112V181M152 125V181M166 190V138H191V190M172 145V182M178 145V182M185 145V182M203 190V118L216 105L229 118V190M207 128H224M207 137H224M207 146H224M207 155H224M207 164H224M207 173H224M207 182H224"/><path d="M58 201C81 195 106 207 128 201S174 195 199 201 226 203 242 198M79 158V183M86 158V183" opacity=".55"/>`
    },
    datong: {
      label:'大同古城 · 古建飞檐', labelEn:'Datong old town · Upturned eaves',
      art:`<path d="M57 192H243M65 185H235V192H65ZM79 161H221V185H79M72 161Q95 152 102 141H198Q205 152 228 161ZM84 155H216M91 141V119H209V141M81 119Q106 111 113 95H187Q194 111 219 119ZM100 112H200M121 95V82H179V95M110 82Q137 75 150 65Q163 75 190 82ZM98 165V180M114 165V180M186 165V180M202 165V180M128 185V167Q150 145 172 167V185M140 185V169M160 185V169M109 124V136M126 124V136M144 124V136M161 124V136M179 124V136M196 124V136M133 86V93M150 84V93M167 86V93"/><path d="M52 200H248M61 206H239" opacity=".55"/>`
    },
    suzhou: {
      label:'苏州虎丘 · 云岩寺塔', labelEn:'Tiger Hill, Suzhou · Yunyan Pagoda',
      art:`<path d="M74 199H226M104 195V181H196V195M111 181V163H189V181M115 163V145H185V163M119 145V127H181V145M123 127V109H177V127M127 109V91H173V109M132 91V76H168V91M123 76L150 62L177 76ZM121 91L150 85L179 91M117 109L150 103L183 109M113 127L150 121L187 127M109 145L150 139L191 145M105 163L150 157L195 163M101 181L150 175L199 181M130 195V183M150 195V181M170 195V183M132 175V165M150 175V163M168 175V165M135 157V147M150 157V145M165 157V147M137 139V129M150 139V127M163 139V129M139 121V111M150 121V109M161 121V111M141 103V93M150 103V91M159 103V93M144 86V77M156 86V77"/><path d="M58 197Q65 185 77 193Q70 173 83 169Q94 169 91 183Q101 180 104 187M196 186Q205 174 215 185Q211 164 224 162Q238 166 230 183Q243 183 243 197" opacity=".6"/>`
    },
    guilin: {
      label:'桂林山水 · 漓江峰林', labelEn:'Guilin landscape · Li River peaks',
      art:`<path d="M51 181Q61 166 66 148T76 105Q82 92 88 116L94 137Q100 145 104 166M90 181Q105 170 110 142L119 92Q125 73 132 105L139 141Q145 153 150 180M134 179Q144 165 153 160Q161 150 165 126L170 94Q177 64 184 106L190 142Q195 154 201 158M179 182Q190 170 199 149L211 117Q219 95 226 118L233 146Q238 166 249 181M68 162L78 126L81 146M116 157L124 116L132 157M172 150L177 111L185 155M210 161L218 133L224 164M55 187C93 182 115 195 151 187S210 181 245 187M64 198C105 193 123 204 156 198S203 193 237 197M101 205H182M133 181L155 172H173L188 181ZM162 172V152L177 170M162 153L148 170"/>`
    },
    hongkong: {
      label:'香港维港 · 中银大厦', labelEn:'Victoria Harbour · Bank of China Tower',
      art:`<path d="M54 185H246M61 185V133H87V185M65 140H83M65 148H83M65 156H83M65 164H83M65 172H83M96 185V96H119V185M101 96V84H115V96M102 104V178M111 104V178M131 185V95L146 77L170 102V185M146 77V64M137 90V75M131 95L170 137L131 185M170 102L131 142L170 185M146 111V168M181 185V127H200V185M187 135H195M187 145H195M187 155H195M187 165H195M210 185V113H236V185M215 121V177M223 121V177M231 121V177"/><path d="M52 193C77 188 98 200 126 193S178 188 204 194 235 196 248 191M62 202C90 196 107 208 138 202S189 198 224 203" opacity=".6"/>`
    },
    beijing: {
      label:'北京天坛 · 祈年殿', labelEn:'Temple of Heaven · Hall of Prayer for Good Harvests',
      art:`<path d="M66 195H234V201H66ZM77 188H223V195H77ZM88 180H212V188H88ZM94 180V150H206V180M82 150Q116 140 128 122H172Q184 140 218 150ZM99 143H201M110 125V111H190V125M100 111Q132 101 139 85H161Q168 101 200 111ZM116 105H184M132 88V78H168V88M119 78Q141 70 150 57Q159 70 181 78ZM150 57V49M105 155V174M119 155V174M133 155V174M150 155V180M167 155V174M181 155V174M195 155V174M126 112V120M142 112V120M158 112V120M174 112V120"/><path d="M55 207H245M80 203V207M101 203V207M123 203V207M177 203V207M199 203V207M220 203V207" opacity=".6"/>`
    },
    shanghai: {
      label:'上海陆家嘴 · 东方明珠', labelEn:'Lujiazui · Oriental Pearl Tower',
      art:`<path d="M58 190H242M69 190V152H89V190M73 160H85M73 168H85M73 176H85M107 190L112 155M132 190L127 155M119 114V100M119 84V58M116 130V114M122 130V114M155 190V115L164 87L173 115V190M160 121V182M168 121V182M183 190V108H207V190M190 113V125H200V113ZM185 109L203 95L207 108M218 190V134H236V190M222 142H232M222 153H232M222 164H232M222 175H232"/><circle cx="119" cy="144" r="16"/><circle cx="119" cy="93" r="9"/><path d="M104 144H134M119 130C110 137 110 151 119 158M119 130C128 137 128 151 119 158M111 93H127M59 199C88 194 113 205 145 199S208 194 241 199M78 206H226" opacity=".65"/>`
    }
  };
  const fallback = {label:'目的地探索纪念',labelEn:'Destination keepsake',art:'<path d="M62 188L119 103L155 153L183 116L239 188ZM94 188L135 135L173 188M62 200H239"/><circle cx="192" cy="87" r="13"/>'};
  function medal(city) {
    const id=`reward-${++instance}`;
    const destination = engravings[city.id] || fallback;
    const ticks = Array.from({length:96},(_,i)=>`<path d="M150 15V21" transform="rotate(${i*3.75} 150 150)"/>`).join('');
    return `<svg class="reward-medal-art" viewBox="0 0 300 300" role="img" aria-label="${t(`${escape(city.name)}探索纪念勋章，${escape(destination.label)}线雕`, `${escape(f(city, 'name'))} discovery medal, engraved with ${escape(destination.labelEn)}`)}">
      <defs>
        <linearGradient id="${id}-edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4c8"/><stop offset=".18" stop-color="#eec777"/><stop offset=".38" stop-color="#a16b27"/><stop offset=".58" stop-color="#ffe8a7"/><stop offset=".76" stop-color="#ad752a"/><stop offset="1" stop-color="#edc97d"/></linearGradient>
        <linearGradient id="${id}-face" x1="0" y1="0" x2=".82" y2="1"><stop stop-color="#fff0bc"/><stop offset=".4" stop-color="#ebc878"/><stop offset=".7" stop-color="#c9913e"/><stop offset="1" stop-color="#f6d795"/></linearGradient>
        <linearGradient id="${id}-shine" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".46" stop-color="#fff8dc" stop-opacity=".1"/><stop offset=".53" stop-color="#fffbe6" stop-opacity=".65"/><stop offset=".68" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="${id}-glow" cx=".3" cy=".22" r=".85"><stop stop-color="#fff6cc" stop-opacity=".8"/><stop offset="1" stop-color="#ebc776" stop-opacity="0"/></radialGradient>
        <clipPath id="${id}-clip"><circle cx="150" cy="150" r="128"/></clipPath>
        <filter id="${id}-engrave" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy=".85" stdDeviation=".15" flood-color="#fff2ba" flood-opacity=".85"/></filter>
        <path id="${id}-arc" d="M67 81A109 109 0 0 1 233 81"/>
      </defs>
      <circle cx="150" cy="153" r="139" fill="#80551d"/>
      <circle cx="150" cy="150" r="139" fill="url(#${id}-edge)" stroke="#fce5a9" stroke-width=".8"/>
      <g stroke="#80541b" stroke-width=".75" opacity=".56">${ticks}</g>
      <circle cx="150" cy="150" r="128" fill="url(#${id}-face)" stroke="#7f561f" stroke-width="1.2"/>
      <circle cx="150" cy="150" r="124.5" fill="url(#${id}-glow)" stroke="#fff0be" stroke-width=".8"/>
      <circle cx="150" cy="150" r="119" fill="none" stroke="#a77731" stroke-width=".5" opacity=".65"/>
      <g clip-path="url(#${id}-clip)" fill="none" stroke="#8d5d22" stroke-width=".55" opacity=".12"><path d="M15 162Q73 60 131 141T289 108M10 169Q78 69 139 150T298 115M9 177Q83 78 147 159T304 123M10 185Q88 87 155 168T311 131M13 193Q93 96 163 177T315 139M17 201Q98 105 171 186T319 147M23 209Q103 114 179 195T320 155M28 217Q108 123 187 204T320 163"/></g>
      <text fill="#76501e" font-family="Arial,sans-serif" font-size="8.5" font-weight="600" letter-spacing="2.8"><textPath href="#${id}-arc" startOffset="50%" text-anchor="middle">TRIPWONDER</textPath></text>
      <g fill="none" stroke="#835523" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}-engrave)">${destination.art}</g>
      <g fill="#825522" filter="url(#${id}-engrave)"><text x="150" y="237" text-anchor="middle" ${engravedName(f(city, 'name'))}</text><text x="150" y="256" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" letter-spacing="3">CITY DISCOVERED</text></g>
      <g fill="#8c612a"><path d="M47 142L49 149L56 151L49 153L47 160L45 153L38 151L45 149Z"/><path d="M253 142L255 149L262 151L255 153L253 160L251 153L244 151L251 149Z"/></g>
      <g clip-path="url(#${id}-clip)"><rect class="reward-metal-sheen" x="-260" y="-60" width="220" height="420" fill="url(#${id}-shine)" transform="rotate(-20 150 150)"/></g>
    </svg>`;
  }
  function markup({city,score=0,percentile,date}={}) {
    const destination=typeof city==='string' ? {id:city,name:city} : city || {id:'',name:'目的地',nameEn:'Destination'};
    const points=Math.max(0,Math.min(100,Number(score)||0));
    // 原型缺省按得分估算百分位；没有真实全站排名数据，接入后由调用方传入 percentile。
    const fallbackPercentile=Math.min(99.9,Math.round((1-Math.pow(1-points/100,1.6))*1000)/10);
    const suppliedPercentile=percentile!==null && percentile!=='' && Number.isFinite(Number(percentile));
    const surpassed=Math.max(0,Math.min(99.9,suppliedPercentile ? Number(percentile) : fallbackPercentile)).toFixed(1);
    return `<div class="reward-celebration">
      <div class="reward-intro"><h3>${t(`奇境挑战徽章 · ${escape(destination.name)}`, `TripWonder badge · ${escape(f(destination, 'name'))}`)}</h3></div>
      <div class="reward-medal-stage">
        <div class="reward-medal-halo" aria-hidden="true"></div>
        <div class="reward-medal-object"><div class="reward-medal-coin" style="animation:none;transform:none">${medal(destination)}</div></div>
        <div class="reward-sparks" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i style="--spark:${i}"></i>`).join('')}</div>
      </div>
      <div class="reward-caption">${date?`<span class="reward-date">${t('获得于', 'Earned on')} ${escape(String(date).replace(/-/g,'.'))}</span>`:''}<span class="reward-score">${t(`超越了<strong class="reward-percentile">${surpassed}%</strong>的驴友`, `Better than <strong class="reward-percentile">${surpassed}%</strong> of travelers`)}</span></div>
      <button class="reward-continue" data-action="close">${t('收下徽章', 'Keep badge')}<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12H19M13 6L19 12L13 18"/></svg></button>
    </div>`;
  }

  async function dismiss(overlay) {
    overlay.classList.add('closing');
    overlay.setAttribute('aria-busy','true');
    const animations=[];
    let fallback;
    try {
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      // Freeze any unfinished entrance before collecting the medal.
      overlay.getAnimations({subtree:true}).forEach(animation=>animation.pause());
      const play=(element,frames,options={})=>{
        if(element)animations.push(element.animate(frames,{duration:240,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards',...options}));
      };
      play(overlay.querySelector('.reward-medal-stage'),[
        {opacity:1,transform:'translateY(0) scale(1)'},
        {opacity:0,transform:'translateY(42px) scale(.76)'}
      ],{duration:380,easing:'cubic-bezier(.32,0,.5,1)'});
      overlay.querySelectorAll('.reward-intro,.reward-caption,.reward-continue,.sheet-heading').forEach(element=>{
        const style=getComputedStyle(element);
        play(element,[{opacity:style.opacity,transform:style.transform},{opacity:0,transform:'translateY(10px)'}],{duration:220});
      });
      play(overlay,[{opacity:getComputedStyle(overlay).opacity},{opacity:0}],{duration:220,delay:160});
      // Cancellation, a replaced dialog, or a stalled animation must never leave
      // the result page inert. The caller always releases it after this settles.
      await Promise.race([
        Promise.allSettled(animations.map(animation=>animation.finished)),
        new Promise(resolve=>{fallback=setTimeout(resolve,600);})
      ]);
    } finally {
      clearTimeout(fallback);
      animations.forEach(animation=>animation.cancel());
    }
  }

  return {markup, medal, dismiss};
})();
