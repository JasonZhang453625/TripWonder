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

  const feedIcon = name => `<svg class="cm-feed-icon" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${name === 'like'
    ? '<path d="M9 12c3-2 4-5 4-9 0-1 3-1 4 2 1 2 0 5-1 7h7c2 0 3 1 2 3l-2 9c0 1-1 2-3 2H9V12ZM3 12h6v14H3z"/>'
    : '<path d="M24 20c2-2 3-5 2-8C25 6 21 3 15 3 8 3 3 7 3 13s5 10 11 10c2 0 4 0 5-1l6 3-1-5Z"/><path d="M9 11h10M9 16h8"/>'}</svg>`;
  const commentAvatar = () => '<span class="cm-comment-avatar" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#fffdf5"/><path d="M7 23h18v3H7z" fill="#c7b98d"/><path d="M9 22v-7c0-6 14-6 14 0v7" fill="#abc56b" stroke="#829a4c"/><circle cx="12" cy="12" r="4" fill="#f5fae6" stroke="#829a4c"/><circle cx="20" cy="12" r="4" fill="#f5fae6" stroke="#829a4c"/><circle cx="12" cy="12" r="1.2" fill="#414d32"/><circle cx="20" cy="12" r="1.2" fill="#414d32"/><path d="M13 18q3 3 6 0" fill="none" stroke="#667b3a" stroke-linecap="round"/></svg></span>';
  function postAge(value) {
    const at = Date.parse(value), days = Math.floor((Date.now() - at) / 86400000);
    if (!Number.isFinite(at)) return '';
    if (days <= 0) return t('今天', 'Today');
    return days < 30 ? t(`${days}天前`, `${days}d ago`) : new Date(at).toLocaleDateString(isEn() ? 'en-US' : 'zh-CN', {month: 'numeric', day: 'numeric'});
  }
  function postCard(ctx, c) {
    const userJourney = isUgc(c), played = userJourney ? ctx.played[c.id] : ctx.challenged[c.id];
    const revealed = !userJourney || !!played;
    const author = userJourney ? f(c.author, 'name') : 'TripWonder';
    const authorId = userJourney ? `player:${c.author.name}` : 'tripwonder-official';
    const following = !!window.TWStore?.get().prefs.communityFollowing?.[authorId];
    const liked = !!window.TWStore?.get().likes[`feed:${c.id}`];
    const story = userJourney ? null : window.ResultReveal?.destination?.(c);
    const text = userJourney ? f(c, 'intro') : f(story, 'description') || t('分享这一路看见的风景，也想听听你的旅行故事。', 'Sharing the views along the way. What is your travel story?');
    const age = postAge(c.publishedAt || played?.date);
    const title = userJourney ? f(c, 'title') : f(c, 'name');
    const photos = c.scenes.slice(0, 3).map((scene, i) => `<span class="cm-post-photo">${thumb(ctx, c, i)}</span>`).join('');
    const medal = !userJourney && window.RewardMedal?.medal ? window.RewardMedal.medal(c) : '';
    const mark = !userJourney ? `<span class="cm-mark cm-medal${ctx.badges[c.id] ? ' is-lit' : ''}" title="${ctx.badges[c.id] ? t('已点亮徽章', 'Badge earned') : t('已挑战', 'Challenged')}"><span class="cm-medal-art" aria-hidden="true">${medal}</span><b>${ctx.badges[c.id] ? t('已点亮', 'Badge') : t('已挑战', 'Played')}</b></span>`
      : played ? `<span class="cm-mark cm-stamp">${icon('check')}<b>${t('已挑战', 'Played')}</b><small>${t(`${played.score} 分`, `${played.score} pts`)}</small></span>` : '';
    const commentsOn = !userJourney || c.boardEnabled;
    const comments = commentsOn ? noteCount(c) : 0;
    return `<article class="cm-card cm-post" data-journey="${esc(c.id)}" aria-label="${esc(title)}">
      <header class="cm-post-author"><span class="cm-post-avatar" aria-hidden="true">${thumb(ctx, c)}</span><div class="cm-post-byline"><div><b>${esc(author)}</b>${age ? `<span class="cm-post-age"><i>·</i>${esc(age)}</span>` : ''}</div><span class="cm-post-status${userJourney ? '' : ' is-local'}">${userJourney ? t('🚗 在路上', '🚗 On the road') : t('🏡 目的地分享', '🏡 Destination stories')}</span></div><button class="cm-follow" data-feed-follow="${esc(authorId)}" aria-pressed="${following}" aria-label="${esc(t(`关注 ${author}`, `Follow ${author}`))}">${following ? t('已关注', 'Following') : t('关注', 'Follow')}</button></header>
      <button class="cm-post-copy" data-post-open><strong>${esc(title)}</strong><span>${esc(text)}</span></button>
      <button class="cm-post-gallery${c.scenes.length === 1 ? ' is-single' : c.scenes.length === 2 ? ' is-pair' : ''}" data-post-open aria-label="${esc(t(`查看${title}的照片与 Journey`, `View photos and journey: ${title}`))}">${photos}${c.scenes.length > 3 ? `<span class="cm-photo-count">${t(`${c.scenes.length}图`, `${c.scenes.length} photos`)}</span>` : ''}</button>
      ${revealed ? `<div class="cm-post-place-row"><button class="cm-post-place" data-post-open>${icon('pin')}<span>${esc(f(c, 'region'))}<i>｜</i>${esc(f(c, 'name'))}</span>${icon('next')}</button>${mark}</div>` : ''}
      <footer class="cm-post-footer"><button class="cm-comment-entry" data-post-open data-feed-discuss${commentsOn ? '' : ' disabled'} title="${commentsOn && !revealed ? t('完成挑战后可评论', 'Comment after completing the challenge') : ''}">${commentAvatar()}<span>${commentsOn ? t('发表评论', 'Add a comment') : t('评论已关闭', 'Comments off')}</span></button><button class="cm-post-reaction" data-feed-like="${esc(c.id)}" aria-pressed="${liked}" aria-label="${t('点赞', 'Like')}">${feedIcon('like')}<span data-feed-like-count>${liked ? 1 : ''}</span></button><button class="cm-post-reaction" data-post-open data-feed-discuss aria-label="${t(`查看 ${comments} 条评论`, `View ${comments} comments`)}"${commentsOn ? '' : ' disabled'}>${feedIcon('comment')}<span>${comments || ''}</span></button></footer>
    </article>`;
  }
  function feed(ctx) {
    const officials = ctx.cities.filter(c => ctx.challenged[c.id]);
    const tab = ['ugc', 'official'].includes(ctx.tab) ? ctx.tab : 'all';
    const tabs = [['all', t('广场', 'Square'), officials.length + ugc.length], ['official', t('已挑战', 'Played'), officials.length], ['ugc', t('玩家 Journey', 'Player journeys'), ugc.length]]
      .map(([id, name, count]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? 'active' : ''}" data-feed-tab="${id}">${name}<small>${count}</small></button>`).join('');
    const list = tab === 'official'
      ? (officials.length ? officials.map(c => postCard(ctx, c)).join('') : `<div class="cm-empty"><p>${t('完成今日挑战后，你去过的目的地会出现在这里，可以看看大家的留言。', 'Finish today’s challenge and the destinations you’ve been to will appear here, with everyone’s notes.')}</p><button class="primary" data-go="today">${t('去今日挑战', 'Go to today’s challenge')}</button></div>`)
      : [...(tab === 'all' ? officials : []), ...ugc].map(c => postCard(ctx, c)).join('');
    return `<div class="page cm-page cm-feed">${ctx.head(t('社区', 'Community'), 'hub')}<div class="cm-tabs" role="tablist" aria-label="${t('社区分类', 'Community categories')}">${tabs}</div><div class="cm-feed-scroll"><div class="cm-list">${list || `<div class="cm-empty">${t('还没有新的分享，来发布第一篇吧。', 'No stories yet. Share the first one.')}</div>`}</div></div><button class="cm-publish-fab" data-go="publish" aria-label="${t('发布 Journey', 'Post a journey')}"><span aria-hidden="true">+</span></button></div>`;
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
      ? `<button class="primary" data-action="ugc-start">${played ? t('再挑战一次', 'Play again') : t('开始挑战', 'Start the challenge')} ${icon('next')}</button>${played ? `<button class="secondary" data-action="browse">${t('浏览场景与留言', 'Browse scenes and notes')}</button>` : ''}`
      : `<button class="primary" data-action="browse">${t('浏览场景与留言', 'Browse scenes and notes')} ${icon('next')}</button>`;
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

  // Feed reactions use the same device-local store and reset as the rest of the prototype.
  document.addEventListener('click', event => {
    const button = event.target.closest('.cm-feed button');
    if (!button || button.disabled || window.ChallengeMotion?.busy) return;
    const authorId = button.dataset.feedFollow, journeyId = button.dataset.feedLike;
    if (authorId) {
      const on = window.TWStore.update(data => {
        data.prefs.communityFollowing ||= {};
        if (data.prefs.communityFollowing[authorId]) delete data.prefs.communityFollowing[authorId];
        else data.prefs.communityFollowing[authorId] = true;
        return !!data.prefs.communityFollowing[authorId];
      });
      document.querySelectorAll('[data-feed-follow]').forEach(other => {
        if (other.dataset.feedFollow !== authorId) return;
        other.setAttribute('aria-pressed', String(on));
        other.textContent = on ? t('已关注', 'Following') : t('关注', 'Follow');
      });
    } else if (journeyId) {
      const on = window.TWStore.update(data => {
        const key = `feed:${journeyId}`;
        if (data.likes[key]) delete data.likes[key]; else data.likes[key] = true;
        return !!data.likes[key];
      });
      button.setAttribute('aria-pressed', String(on));
      button.querySelector('[data-feed-like-count]').textContent = on ? '1' : '';
    }
  });

  function releasePress(){window.HubCards3D?.release();}
  window.Community = Object.freeze({isUgc, label, boardOpen, hub, feed, journey, publish, validate, previews, releasePress});
})();
