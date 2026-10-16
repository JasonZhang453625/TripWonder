/* TripWonder entry split: the hub (今日挑战 / 社区), the community feed, a journey's detail page with its board,
   and the UGC publish form (prototype only: nothing is uploaded).
   Official journeys stay in TRIPWONDER_CATALOG.cities and only appear here once this player has challenged them,
   so the community never spoils today's draw. Sample UGC journeys (content/ugc.js) join as TRIPWONDER_CATALOG.ugc:
   playable, but never part of the daily draw, atlas, rankings, coins, badges or perks. */
(() => {
  'use strict';
  const t = (zh, en) => window.I18N.t(zh, en), isEn = () => window.I18N.isEn(), f = (item, key) => window.I18N.f(item, key);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const icon = name => window.TWIcon?.(name) || '';
  const C = window.TRIPWONDER_CATALOG;

  // Register approved UGC journeys beside the official catalog (works for the static and the database catalog.js).
  // Sample journeys (content/ugc.js) plus reviewed UGC from the admin database (served only by admin/server.mjs).
  const ugc = [...(window.UGC_JOURNEYS || []), ...(window.DB_JOURNEYS || []).filter(j => j.channel === 'ugc').map(j => ({...j, review: 'approved'}))].filter((j, i, all) => all.findIndex(other => other.id === j.id) === i).filter(j => j.channel === 'ugc' && j.review === 'approved' && j.scenes?.length && j.scenes.every(scene => scene.photo));
  for (const journey of ugc) {
    journey.questions.forEach((question, index) => { question.sceneId ||= journey.scenes[index]?.id || journey.scenes[0].id; });
    for (const scene of journey.scenes) {
      const p = scene.photo;
      p.id = scene.id; p.name = p.name || scene.name; p.city = journey.name;
      p.width = p.screen?.width || p.width; p.height = p.screen?.height || p.height;
      if (p.screen && p.thumb && window.MEDIA_ASSETS) window.MEDIA_ASSETS[scene.id] = {screen: p.screen, thumb: p.thumb, detail: p.detail || p.screen};
      C.photoById.set(scene.id, p);
    }
  }
  C.ugc = ugc;

  const isUgc = c => c?.channel === 'ugc';
  // Admin-generated UGC carries a plain author name; samples carry {name, nameEn}.
  for (const journey of ugc) if (typeof journey.author === 'string' || !journey.author) journey.author = {name: journey.author || t('玩家', 'Player')};
  // A UGC journey is a guessing game: before this player has finished it, only its spoiler-free title shows.
  const label = (c, revealed) => isUgc(c) && !revealed ? f(c, 'title') : f(c, 'name');
  const noteCount = c => window.SceneBubbles ? c.scenes.reduce((n, scene) => n + window.SceneBubbles.list(scene.id).length, 0) : 0;
  const boardOpen = (c, played) => !isUgc(c) || (c.boardEnabled && played);
  const thumb = (ctx, c, index = 0) => ctx.img(c.scenes[index].id, '');

  function hub(ctx) {
    const done = ctx.order.filter(id => ctx.daily[id]?.result).length, first = ctx.cities.find(c => c.id === ctx.order.find(id => !ctx.daily[id]?.result) || ctx.order[0]);
    const collage = ugc.slice(0, 3).map(c => `<i>${thumb(ctx, c)}</i>`).join('');
    return `<div class="page cm-page cm-hub">${ctx.head('TripWonder', 'home')}
      <button class="cm-entry cm-entry-challenge" data-go="today"><span class="cm-entry-art">${first ? thumb(ctx, first) : ''}</span><span class="cm-entry-copy"><b class="cm-entry-tag">${t('官方', 'Official')}</b><strong>${t('今日挑战', 'Today’s challenge')}</strong><small>${t(`今日 ${ctx.order.length} 城 · 已完成 ${done}`, `${ctx.order.length} cities today · ${done} done`)}</small><span class="cm-entry-perks">${icon('ticket')}${t('赢目的地优惠 · 点亮徽章', 'Win destination perks · Earn badges')}</span></span>${icon('next')}</button>
      <button class="cm-entry cm-entry-community" data-go="feed"><span class="cm-entry-art cm-collage">${collage}</span><span class="cm-entry-copy"><b class="cm-entry-tag">${t('社区', 'Community')}</b><strong>${t('社区', 'Community')}</strong><small>${t(`去过的目的地 · ${ugc.length} 个玩家 Journey`, `Places you’ve been · ${ugc.length} player journeys`)}</small><span class="cm-entry-perks">${icon('message')}${t('留言讨论 · 玩家出题', 'Notes and player-made challenges')}</span></span>${icon('next')}</button>
    </div>`;
  }

  function officialCard(ctx, c) {
    const record = ctx.challenged[c.id], badge = ctx.badges[c.id];
    const medal = window.RewardMedal?.medal ? window.RewardMedal.medal(c) : '';
    return `<button class="cm-card" data-journey="${esc(c.id)}"><span class="cm-thumb">${thumb(ctx, c)}</span><span class="cm-card-body"><strong>${esc(f(c, 'name'))}</strong><small>${esc(f(c, 'region'))} · ${t(`${c.scenes.length} 处实景`, `${c.scenes.length} scenes`)}</small><small class="cm-card-stats">${icon('message')}${noteCount(c)}${record ? ` · ${t(`最高 ${record.score} 分`, `Best ${record.score}`)}` : ''}</small></span><span class="cm-mark cm-medal${badge ? ' is-lit' : ''}" title="${badge ? t('已点亮徽章', 'Badge earned') : t('已挑战', 'Challenged')}"><span class="cm-medal-art" aria-hidden="true">${medal}</span><b>${badge ? t('已点亮', 'Badge') : t('已挑战', 'Played')}</b></span></button>`;
  }
  function ugcCard(ctx, c) {
    const played = ctx.played[c.id];
    return `<button class="cm-card" data-journey="${esc(c.id)}"><span class="cm-thumb">${thumb(ctx, c)}</span><span class="cm-card-body"><strong>${esc(label(c, played))}</strong><small>${esc(f(c.author, 'name'))} · ${t(`${c.scenes.length} 处实景`, `${c.scenes.length} scenes`)}</small><small class="cm-card-stats">${c.boardEnabled ? `${icon('message')}${t('留言板已开启', 'Board on')}` : t('留言板未开启', 'Board off')}</small></span>${played ? `<span class="cm-mark cm-stamp">${icon('check')}<b>${t('已挑战', 'Played')}</b><small>${t(`${played.score} 分`, `${played.score} pts`)}</small></span>` : `<span class="cm-mark cm-new">${t('去挑战', 'Play')}</span>`}</button>`;
  }
  function feed(ctx) {
    const officials = ctx.cities.filter(c => ctx.challenged[c.id]);
    const tab = ctx.tab === 'ugc' ? 'ugc' : 'official';
    const tabs = [['official', t('官方目的地', 'Official'), officials.length], ['ugc', t('玩家 Journey', 'Player journeys'), ugc.length]]
      .map(([id, name, count]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? 'active' : ''}" data-feed-tab="${id}">${name}<small>${count}</small></button>`).join('');
    const list = tab === 'official'
      ? (officials.length ? officials.map(c => officialCard(ctx, c)).join('') : `<div class="cm-empty"><p>${t('完成今日挑战后，你去过的目的地会出现在这里，可以看看大家的留言。', 'Finish today’s challenge and the destinations you’ve been to will appear here, with everyone’s notes.')}</p><button class="primary" data-go="today">${t('去今日挑战', 'Go to today’s challenge')}</button></div>`)
      : ugc.map(c => ugcCard(ctx, c)).join('');
    const publish = `<button class="head-action cm-publish-btn" data-go="publish">${t('+ 发布', '+ Post')}</button>`;
    return `<div class="page cm-page cm-feed">${ctx.head(t('社区', 'Community'), 'hub', publish)}<div class="cm-tabs" role="tablist">${tabs}</div><p class="cm-note-line">${tab === 'official' ? t('只展示你挑战过的官方目的地，防止剧透。', 'Only official destinations you’ve challenged are shown, to avoid spoilers.') : t('玩家上传的小众目的地，审核通过后可见。社区挑战不参与优惠与成就。', 'Lesser-known places shared by players, shown after review. Community challenges earn no perks or achievements.')}</p><div class="cm-list">${list}</div></div>`;
  }

  function board(ctx, c, played) {
    if (isUgc(c) && !c.boardEnabled) return `<section class="cm-board is-off"><h3>${t('留言板', 'Board')}</h3><p>${t('发布者没有开启这个 Journey 的留言板。', 'The author has turned the board off for this journey.')}</p></section>`;
    if (!boardOpen(c, played)) return `<section class="cm-board is-locked"><h3>${t('留言板', 'Board')}</h3><p>${t('完成挑战后就能看到大家的留言，防止剧透。', 'Finish the challenge to see everyone’s notes. No spoilers before then.')}</p></section>`;
    const notes = c.scenes.flatMap(scene => window.SceneBubbles?.list(scene.id).map(note => ({...note, scene})) || []);
    const filter = ['been', 'want'].includes(ctx.boardFilter) ? ctx.boardFilter : 'all';
    const shown = notes.filter(note => filter === 'all' || note.kind === filter).sort((a, b) => (b.mine - a.mine) || (b.at || 0) - (a.at || 0) || b.likes - a.likes);
    const hue = text => { let h = 0; for (const ch of String(text)) h = (h * 31 + ch.codePointAt(0)) % 360; return h; };
    const filters = [['all', t('全部', 'All')], ['been', t('去过', 'Been')], ['want', t('没去过', 'Not yet')]]
      .map(([id, name]) => `<button class="${filter === id ? 'active' : ''}" aria-pressed="${filter === id}" data-board-filter="${id}">${name}</button>`).join('');
    return `<section class="cm-board"><div class="cm-board-head"><h3>${t('留言板', 'Board')} <small>${notes.length}</small></h3><button class="cm-write" data-action="board-write">${icon('message')}${t('写留言', 'Leave a note')}</button></div><div class="cm-board-filters">${filters}</div>${shown.length ? shown.map(note => `<article class="cm-note${note.mine ? ' mine' : ''}"><span class="cm-avatar" style="--hue:${note.mine ? 222 : hue(note.name)}" aria-hidden="true">${esc([...String(note.name)][0] || '')}</span><div><p class="cm-note-meta"><b>${esc(note.name)}</b><span class="cm-kind kind-${note.kind}">${window.SceneBubbles.kindLabel(note.kind)}</span><span>${esc(f(note.scene, 'name'))}</span></p><p class="cm-note-text">${esc(note.body)}</p></div><button class="cm-like" data-note-like="${esc(note.id)}" aria-pressed="${note.liked}" aria-label="${t('点赞', 'Like')}">${icon('heart')}<b>${note.likes}</b></button></article>`).join('') : `<p class="cm-board-empty">${t('还没有这一类留言，来写第一条吧。', 'No notes of this kind yet. Be the first.')}</p>`}</section>`;
  }
  function journey(ctx) {
    const c = ctx.journey;
    if (!c) return feed(ctx);
    const ugcJourney = isUgc(c), played = ugcJourney ? ctx.played[c.id] : ctx.challenged[c.id], revealed = !ugcJourney || !!played;
    const story = !ugcJourney ? window.ResultReveal?.destination?.(c) : null;
    const intro = ugcJourney ? f(c, 'intro') : f(story, 'description') || t('你挑战过的目的地，看看其他旅人在这里留下了什么。', 'A destination you’ve challenged. See what other travellers left here.');
    const medal = !ugcJourney && window.RewardMedal?.medal ? `<span class="cm-mark cm-medal cm-hero-mark${ctx.badges[c.id] ? ' is-lit' : ''}"><span class="cm-medal-art" aria-hidden="true">${window.RewardMedal.medal(c)}</span><b>${ctx.badges[c.id] ? t('已点亮', 'Badge') : t('已挑战', 'Played')}</b></span>` : played ? `<span class="cm-mark cm-stamp cm-hero-mark">${icon('check')}<b>${t('已挑战', 'Played')}</b><small>${t(`${played.score} 分`, `${played.score} pts`)}</small></span>` : '';
    const scenes = c.scenes.map((scene, i) => revealed ? `<button class="cm-scene" data-browse-scene="${i}" aria-label="${t(`浏览第 ${i + 1} 处实景`, `Browse scene ${i + 1}`)}">${thumb(ctx, c, i)}<span>${esc(f(scene, 'name'))}</span></button>` : `<span class="cm-scene">${thumb(ctx, c, i)}<span>${t(`第 ${i + 1} 处`, `Scene ${i + 1}`)}</span></span>`).join('');
    const actions = ugcJourney
      ? `<button class="primary" data-action="ugc-start">${played ? t('再挑战一次', 'Play again') : t('开始挑战', 'Start the challenge')} ${icon('next')}</button>${played ? `<button class="secondary" data-action="browse">${t('浏览场景与讲解', 'Browse scenes and notes')}</button>` : ''}`
      : `<button class="primary" data-action="browse">${t('浏览场景与讲解', 'Browse scenes and notes')} ${icon('next')}</button>`;
    const header = `<header class="page-head"><button class="icon-btn" data-action="journey-back" aria-label="${t('返回', 'Back')}">${icon('back')}</button><strong>${ugcJourney ? t('玩家 Journey', 'Player journey') : t('官方目的地', 'Official destination')}</strong><span style="width:36px"></span></header>`;
    return `<div class="page cm-page cm-journey">${header}<div class="cm-hero">${ctx.img(c.scenes[0].id, label(c, revealed))}${medal}</div><section class="cm-info"><span class="cm-channel ${ugcJourney ? 'is-ugc' : 'is-official'}">${ugcJourney ? t('玩家', 'Player') : t('官方', 'Official')}</span><h1>${esc(label(c, revealed))}</h1><p class="cm-meta">${revealed ? `${icon('pin')}${esc(f(c, 'region'))}` : t('目的地在挑战后揭晓', 'Revealed after the challenge')}${ugcJourney ? ` · ${t('发布者', 'By')} ${esc(f(c.author, 'name'))}` : ''}</p><p class="cm-intro">${esc(intro)}</p>${ugcJourney ? `<p class="cm-rule">${t('社区挑战：限时观察场景并答题，再在地图上猜位置。不参与优惠、徽章、奇境币和排行。', 'Community challenge: look and answer against the clock, then guess the spot on the map. No perks, badges, coins or rankings.')}</p>` : ''}</section><div class="cm-scenes">${scenes}</div><div class="cm-actions">${actions}</div>${board(ctx, c, played)}</div>`;
  }

  function publish(ctx) {
    const field = (id, label, input, hint = '') => `<label class="cm-field" for="${id}"><span>${label}</span>${input}${hint ? `<small>${hint}</small>` : ''}</label>`;
    const question = i => `<fieldset class="cm-question"><legend>${t(`第 ${i + 1} 题`, `Question ${i + 1}`)}</legend><input name="q${i}" maxlength="60" placeholder="${t('题目（只看照片就能回答）', 'Question (answerable from the photos)')}">${[0, 1, 2, 3].map(j => `<span class="cm-option"><input type="radio" name="a${i}" value="${j}" aria-label="${t(`选项 ${'ABCD'[j]} 为正确答案`, `Option ${'ABCD'[j]} is correct`)}"><input name="o${i}-${j}" maxlength="24" placeholder="${t(`选项 ${'ABCD'[j]}`, `Option ${'ABCD'[j]}`)}"></span>`).join('')}</fieldset>`;
    return `<div class="page cm-page cm-publish">${ctx.head(t('发布 Journey', 'Post a journey'), 'feed')}<form class="cm-form" novalidate>
      <p class="cm-note-line">${t('分享一个你熟悉的小众地点，让其他玩家猜猜它在哪里。审核通过后会出现在社区。', 'Share a lesser-known place you know well and let others guess where it is. It appears in the community after review.')}</p>
      <section class="cm-form-block"><h3>${t('照片', 'Photos')}</h3><label class="cm-drop"><input type="file" name="photos" accept="image/*" multiple hidden>${icon('spark')}<span>${t('选择 1–5 张照片', 'Choose 1–5 photos')}</span></label><div class="cm-previews" aria-live="polite"></div></section>
      <section class="cm-form-block"><h3>${t('目的地信息', 'Place')}</h3>
        ${field('pub-name', t('地点名称（答案）', 'Place name (the answer)'), `<input id="pub-name" name="name" maxlength="20" placeholder="${t('如：沙坡尾避风坞', 'e.g. Shapowei Typhoon Shelter')}">`)}
        ${field('pub-title', t('挑战标题（不能透露地名）', 'Challenge title (no place names)'), `<input id="pub-title" name="title" maxlength="20" placeholder="${t('如：十年前后的渔港老街', 'e.g. A fishing harbour, ten years apart')}">`)}
        ${field('pub-region', t('所在城市', 'City'), `<input id="pub-region" name="region" maxlength="20" placeholder="${t('如：福建 · 厦门', 'e.g. Xiamen, Fujian')}">`)}
        <div class="cm-field-row">${field('pub-lat', t('纬度', 'Latitude'), '<input id="pub-lat" name="lat" inputmode="decimal" placeholder="24.4447">')}${field('pub-lng', t('经度', 'Longitude'), '<input id="pub-lng" name="lng" inputmode="decimal" placeholder="118.0898">')}</div>
        ${field('pub-intro', t('一句话介绍', 'A line about it'), `<textarea id="pub-intro" name="intro" maxlength="120" rows="2" placeholder="${t('为什么推荐这里？', 'Why do you recommend it?')}"></textarea>`)}
      </section>
      <section class="cm-form-block"><h3>${t('三道题', 'Three questions')}</h3><p class="cm-hint">${t('选中正确答案前的圆点。题目里不要出现地名。', 'Tick the circle beside the right answer. Keep place names out of the questions.')}</p>${[0, 1, 2].map(question).join('')}</section>
      <section class="cm-form-block cm-switches"><label class="cm-switch"><input type="checkbox" name="board" checked><span><b>${t('开启留言板', 'Turn the board on')}</b><small>${t('玩家完成挑战后可以留言', 'Players can leave notes after finishing')}</small></span></label>${field('pub-author', t('昵称', 'Nickname'), `<input id="pub-author" name="author" maxlength="16" placeholder="${t('展示为发布者', 'Shown as the author')}">`)}</section>
      <p class="cm-error" role="alert" hidden></p>
      <button class="primary cm-submit" type="submit">${t('提交审核', 'Submit for review')}</button>
      <p class="cm-foot">${t('演示：上传服务尚未接入，提交后不会保存或上传任何内容。', 'Demo: uploads aren’t connected yet, so nothing is saved or sent.')}</p>
    </form></div>`;
  }
  // Client-side checks for the prototype form; returns an error message or ''.
  function validate(form) {
    const data = new FormData(form), text = name => String(data.get(name) || '').trim();
    const photos = form.querySelector('input[type=file]').files.length;
    if (!photos) return t('请至少选择 1 张照片', 'Choose at least one photo');
    if (photos > 5) return t('最多 5 张照片', 'Five photos at most');
    if (!text('name') || !text('title') || !text('region')) return t('请填写地点名称、挑战标题和所在城市', 'Fill in the place name, title and city');
    if (text('title').includes(text('name'))) return t('挑战标题不能包含地点名称', 'The title can’t include the place name');
    const lat = Number(text('lat')), lng = Number(text('lng'));
    if (!(lat >= 3.5 && lat <= 54 && lng >= 73 && lng <= 136)) return t('请填写中国境内的经纬度', 'Enter a latitude and longitude in China');
    for (let i = 0; i < 3; i++) {
      if (!text(`q${i}`) || [0, 1, 2, 3].some(j => !text(`o${i}-${j}`))) return t(`请把第 ${i + 1} 题和 4 个选项填完整`, `Complete question ${i + 1} and its four options`);
      if (data.get(`a${i}`) === null) return t(`请为第 ${i + 1} 题选出正确答案`, `Pick the right answer for question ${i + 1}`);
    }
    return '';
  }
  function previews(input) {
    const box = input.closest('.cm-form').querySelector('.cm-previews');
    box.querySelectorAll('img').forEach(img => URL.revokeObjectURL(img.src));
    box.innerHTML = [...input.files].slice(0, 5).map((file, i) => `<span class="cm-preview"><img src="${URL.createObjectURL(file)}" alt=""><b>${i + 1}</b></span>`).join('') + (input.files.length > 5 ? `<p class="cm-hint">${t('只会使用前 5 张', 'Only the first five are used')}</p>` : '');
  }

  window.Community = Object.freeze({isUgc, label, boardOpen, hub, feed, journey, publish, validate, previews});
})();
