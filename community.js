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
  const commentUsers = [
    {id: 'xiaoman', name: '小满', nameEn: 'Xiaoman'},
    {id: 'mili', name: '米粒', nameEn: 'Mili'},
    {id: 'azhe', name: '阿哲', nameEn: 'Zhe'},
    {id: 'wanfeng', name: '晚风', nameEn: 'Evening Breeze'},
    {id: 'nanfeng', name: '南风', nameEn: 'South Wind'}
  ].map((user, index) => ({...user, avatar: `assets/community/user-${index + 1}.jpg`}));
  // Journey comments are independent of the position-anchored scene bubbles.
  // Keep distinct IDs so likes and replies never change a scene note.
  function boardNotes(c) {
    const entries = [
      [t('这组照片好有氛围，想找个周末去走走。', 'These photos make me want to plan a weekend trip.'), 'want', 12],
      [t('去过一次，还想换个季节再去看看。', 'I’ve been once and would love to return in a different season.'), 'been', 8],
      [t('这个视角拍得真好，细节值得慢慢看。', 'Such a lovely perspective. There’s so much detail to take in.'), 'been', 6],
      [t('先收藏了，下次出行再翻出来看看。', 'Saved this to come back to when I plan my next trip.'), 'want', 4],
      [t('越看越想出发，已经开始期待了。', 'The more I look, the more I want to go.'), 'want', 2]
    ];
    const initial = commentUsers.map((user, index) => {
      const id = `journey-comment:${c.id}:${user.id}`, liked = !!window.TWStore.get().likes[id];
      return {id, userId: user.id, name: f(user, 'name'), body: entries[index][0], kind: entries[index][1], likes: entries[index][2] + Number(liked), liked};
    });
    return [...initial, ...(window.TWStore?.get().boardComments?.[c.id] || []).map(note => ({...note, mine: true, name: t('我', 'Me'), body: note.text, likes: Number(!!window.TWStore.get().likes[note.id]), liked: !!window.TWStore.get().likes[note.id]}))];
  }
  const repliesFor = id => window.TWStore?.get().boardReplies?.[id] || [];
  const noteCount = c => boardNotes(c).reduce((n, note) => n + 1 + repliesFor(note.id).length, 0);
  // The publisher flag controls scene bubbles only. Comments are a separate feature.
  const boardOpen = c => !isUgc(c) || c.boardEnabled !== false;
  const commentsOpen = (c, played) => !isUgc(c) || !!played;
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
  const commentAvatar = () => `<span class="cm-comment-avatar" aria-hidden="true"><img src="${commentUsers[0].avatar}" alt="" width="36" height="36"></span>`;
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
    const comments = noteCount(c);
    return `<article class="cm-card cm-post" data-journey="${esc(c.id)}" aria-label="${esc(title)}">
      <header class="cm-post-author"><span class="cm-post-avatar" aria-hidden="true">${thumb(ctx, c)}</span><div class="cm-post-byline"><div><b>${esc(author)}</b>${age ? `<span class="cm-post-age"><i>·</i>${esc(age)}</span>` : ''}</div><span class="cm-post-status${userJourney ? '' : ' is-local'}">${userJourney ? t('🚗 在路上', '🚗 On the road') : t('🏡 目的地分享', '🏡 Destination stories')}</span></div><button class="cm-follow" data-feed-follow="${esc(authorId)}" aria-pressed="${following}" aria-label="${esc(t(`关注 ${author}`, `Follow ${author}`))}">${following ? t('已关注', 'Following') : t('关注', 'Follow')}</button></header>
      <button class="cm-post-copy" data-post-open><strong>${esc(title)}</strong><span>${esc(text)}</span></button>
      <button class="cm-post-gallery${c.scenes.length === 1 ? ' is-single' : c.scenes.length === 2 ? ' is-pair' : ''}" data-post-open aria-label="${esc(t(`查看${title}的照片与 Journey`, `View photos and journey: ${title}`))}">${photos}${c.scenes.length > 3 ? `<span class="cm-photo-count">${t(`${c.scenes.length}图`, `${c.scenes.length} photos`)}</span>` : ''}</button>
      ${revealed ? `<div class="cm-post-place-row"><button class="cm-post-place" data-post-open>${icon('pin')}<span>${esc(f(c, 'region'))}<i>｜</i>${esc(f(c, 'name'))}</span>${icon('next')}</button>${mark}</div>` : ''}
      <footer class="cm-post-footer"><button class="cm-comment-entry" data-post-open data-feed-discuss title="${!revealed ? t('完成挑战后可评论', 'Comment after completing the challenge') : ''}">${commentAvatar()}<span>${t('发表评论', 'Add a comment')}</span></button><button class="cm-post-reaction" data-feed-like="${esc(c.id)}" aria-pressed="${liked}" aria-label="${t('点赞', 'Like')}">${feedIcon('like')}<span data-feed-like-count>${liked ? 1 : ''}</span></button><button class="cm-post-reaction" data-post-open data-feed-discuss aria-label="${t(`查看 ${comments} 条评论`, `View ${comments} comments`)}">${feedIcon('comment')}<span>${comments || ''}</span></button></footer>
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
    if (!commentsOpen(c, played)) return `<section class="cm-board is-locked"><h3>${t('评论区', 'Comments')}</h3><p>${t('完成挑战后就能看到大家的评论，防止剧透。', 'Finish the challenge to read the comments without spoilers.')}</p></section>`;
    const notes = boardNotes(c);
    const filter = ['been', 'want'].includes(ctx.boardFilter) ? ctx.boardFilter : 'all';
    const shown = notes.filter(note => filter === 'all' || note.kind === filter).sort((a, b) => (b.mine - a.mine) || (b.at || 0) - (a.at || 0) || b.likes - a.likes);
    const filters = [['all', t('全部', 'All')], ['been', t('去过', 'Been')], ['want', t('没去过', 'Not yet')]]
      .map(([id, name]) => `<option value="${id}"${filter === id ? ' selected' : ''}>${name}</option>`).join('');
    return `<section class="cm-board" data-comment-journey="${esc(c.id)}" data-filter="${filter}"><div class="cm-board-head"><h3>${t(`共 ${noteCount(c)} 条评论`, `${noteCount(c)} comments`)}</h3><label class="cm-board-sort"><select data-comment-filter aria-label="${t('筛选评论', 'Filter comments')}">${filters}</select></label></div><div class="cm-comments">${shown.length ? shown.map(note => noteMarkup(note)).join('') : `<p class="cm-board-empty">${t('还没有评论，说点什么吧', 'No comments yet. Start the conversation.')}</p>`}</div>${shown.length ? `<p class="cm-comments-end">${t('- THE END -', '- THE END -')}</p>` : ''}</section>`;
  }

  const commentIcon = name => `<svg class="cm-comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z"/>',message:'<path d="M21 11.5a9 9 0 0 1-9.5 9c-1.5 0-3-.3-4.3-1L3 21l1.4-4.2A9 9 0 1 1 21 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',pen:'<path d="m15 4 5 5M4 20l4.5-1L21 6.5 17.5 3 5 15.5 4 20ZM4 23h16"/>',smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1 3 4 3 4-3 4-3M8 8h.01M16 8h.01"/>'})[name] || ''}</svg>`;
  function noteAvatar(name, mine, userId) {
    if (mine) return commentAvatar();
    const user = commentUsers.find(user => user.id === userId || user.name === name || user.nameEn === name) || commentUsers[0];
    return `<span class="cm-note-avatar" aria-hidden="true"><img src="${user.avatar}" alt="" width="36" height="36" loading="lazy"></span>`;
  }
  const commentAge = note => !note.at ? '' : Date.now() - note.at < 60000 ? t('刚刚', 'Just now') : Date.now() - note.at < 3600000 ? t(`${Math.floor((Date.now() - note.at) / 60000)}分钟前`, `${Math.floor((Date.now() - note.at) / 60000)}m ago`) : new Date(note.at).toLocaleDateString(isEn() ? 'en-US' : 'zh-CN', {month: '2-digit', day: '2-digit'});
  function noteMarkup(note, parentId = '') {
    const reply = !!parentId, replies = reply ? [] : repliesFor(note.id);
    const name = note.mine ? t('我', 'Me') : note.name;
    const liked = !!window.TWStore.get().likes[note.id], likes = reply ? Number(liked) : note.likes;
    return `<article class="cm-note${reply ? ' cm-reply' : ''}" data-comment-id="${esc(note.id)}">${noteAvatar(name, note.mine, note.userId)}<div class="cm-note-main"><p class="cm-note-meta">${esc(name)}</p><p class="cm-note-text">${reply && note.to && note.to !== t('我', 'Me') ? `${t('回复', 'Reply to')} <span class="cm-reply-to">${esc(note.to)}</span>：` : ''}${esc(note.body ?? note.text)}</p><div class="cm-note-foot"><span>${esc(commentAge(note))}${!reply && note.kind ? `${note.at ? ' · ' : ''}${window.SceneBubbles.kindLabel(note.kind)}` : ''}</span><button data-comment-reply="${esc(parentId || note.id)}" data-reply-to="${esc(name)}">${t('回复', 'Reply')}</button></div>${!reply && replies.length ? `<div class="cm-replies">${replies.map((item, i) => `<div${i ? ' hidden' : ''} data-reply-row>${noteMarkup({...item, mine: true}, note.id)}</div>`).join('')}${replies.length > 1 ? `<button class="cm-expand-replies" data-comment-expand aria-expanded="false">${t(`展开 ${replies.length - 1} 条回复`, `View ${replies.length - 1} more replies`)}<span>⌄</span></button>` : ''}</div>` : ''}</div><button class="cm-like" data-note-like="${esc(note.id)}" aria-pressed="${liked}" aria-label="${esc(t(`赞 ${name} 的评论`, `Like ${name}’s comment`))}">${commentIcon('heart')}<b>${likes || ''}</b></button></article>`;
  }
  function commentDock(c, played) {
    if (!commentsOpen(c, played)) return '';
    const data = window.TWStore.get(), liked = !!data.likes[`feed:${c.id}`], saved = !!data.prefs.communitySaved?.[c.id];
    return `<footer class="cm-comment-dock" data-dock-journey="${esc(c.id)}"><div class="cm-dock-idle"><button class="cm-dock-write" data-comment-compose>${commentIcon('pen')}<span>${t('说点什么...', 'Say something…')}</span></button><button class="cm-dock-reaction" data-comment-react="like" aria-pressed="${liked}" aria-label="${t('赞这个 Journey', 'Like this journey')}">${commentIcon('heart')}<b>${liked ? '1' : ''}</b></button><button class="cm-dock-reaction" data-comment-react="save" aria-pressed="${saved}" aria-label="${t('收藏这个 Journey', 'Save this journey')}">${commentIcon('star')}</button><button class="cm-dock-reaction" data-comment-scroll aria-label="${t('查看评论', 'View comments')}">${commentIcon('message')}<b data-comment-total>${noteCount(c)}</b></button></div><form class="cm-comment-form" hidden><div class="cm-compose-heading"><span data-reply-label>${t('发表评论', 'Leave a comment')}</span><button type="button" data-comment-cancel aria-label="${t('收起输入框', 'Close composer')}">×</button></div><textarea name="comment" rows="2" maxlength="200" aria-label="${t('评论内容', 'Your comment')}" placeholder="${t('说点什么...', 'Say something…')}" required></textarea><div class="cm-comment-tools"><select name="kind" aria-label="${t('你去过这里吗', 'Have you been here?')}"><option value="want">${t('还没去过', 'Not yet')}</option><option value="been">${t('我去过', 'I’ve been')}</option></select>${boardOpen(c) ? `<button type="button" class="cm-scene-write" data-action="board-write">${t('在场景里留言', 'Place a scene note')}</button>` : ''}<button type="button" data-comment-emoji aria-label="${t('添加表情', 'Add an emoji')}" aria-expanded="false">${commentIcon('smile')}</button><button class="cm-comment-send" type="submit" disabled>${t('发送', 'Send')}</button></div><div class="cm-emoji-picker" hidden>${['😊','❤️','👍','😍','😂','🥹','👏','✨'].map(emoji => `<button type="button" data-emoji="${emoji}">${emoji}</button>`).join('')}</div><p class="cm-comment-local">${t('评论仅保存在本机', 'Comments are saved on this device only')}</p></form><p class="cm-comment-status" role="status" aria-live="polite"></p></footer>`;
  }
  function journey(ctx) {
    const c = ctx.journey;
    if (!c) return feed(ctx);
    const ugcJourney = isUgc(c), played = ugcJourney ? ctx.played[c.id] : ctx.challenged[c.id], revealed = !ugcJourney || !!played;
    const medal = !ugcJourney && window.RewardMedal?.medal ? `<span class="cm-hero-badge${ctx.badges[c.id] ? ' is-lit' : ''}"><span class="cm-medal-art">${window.RewardMedal.medal(c)}</span></span>` : '';
    const scenes = c.scenes.map((scene, i) => `<button class="cm-gallery-slide" ${ugcJourney ? 'data-action="ugc-start"' : `data-browse-scene="${i}"`} aria-label="${esc(ugcJourney ? t(`挑战整个 Journey，第 ${i + 1} 张照片`, `Challenge the whole journey, photo ${i + 1}`) : t(`沉浸探索：${f(scene, 'name')}`, `Explore: ${f(scene, 'name')}`))}" aria-roledescription="${t('幻灯片', 'slide')}">${thumb(ctx, c, i)}</button>`).join('');
    const header = `<header class="page-head"><button class="icon-btn" data-action="journey-back" aria-label="${t('返回', 'Back')}">${icon('back')}</button><strong>${ugcJourney ? t('玩家 Journey', 'Player journey') : t('官方目的地', 'Official destination')}</strong><span style="width:36px"></span></header>`;
    return `<div class="page cm-page cm-journey">${header}<div class="cm-journey-scroll"><div class="cm-hero"><div class="cm-gallery" data-gallery-journey="${esc(c.id)}" role="region" aria-roledescription="${t('轮播图', 'carousel')}" aria-label="${t('目的地照片，左右滑动，点击沉浸探索', 'Destination photos. Swipe to browse, select to explore.')}">${scenes}</div>${medal}</div><section class="cm-info"><h1>${esc(label(c, revealed))}</h1>${revealed ? `<p class="cm-meta">${icon('pin')}${esc(f(c, 'region'))}</p>` : ''}</section>${board(ctx, c, played)}</div>${commentDock(c, played)}</div>`;
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
      <section class="cm-form-block cm-switches"><label class="cm-switch"><input type="checkbox" name="board" checked><span><b>${t('开启场景留言气泡', 'Enable scene bubbles')}</b><small>${t('在沉浸场景中查看和放置气泡，不影响独立评论区', 'View and place bubbles in scenes; independent comments stay available')}</small></span></label>${field('pub-author', t('昵称', 'Nickname'), `<input id="pub-author" name="author" maxlength="16" placeholder="${t('展示为发布者', 'Shown as the author')}">`)}</section>
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

  function refreshComments(page, filter) {
    const section = page.querySelector('.cm-board[data-comment-journey]');
    const c = C.cities.find(c => c.id === section?.dataset.commentJourney) || ugc.find(c => c.id === section?.dataset.commentJourney);
    if (!c) return;
    const expanded = [...section.querySelectorAll('[data-comment-expand][aria-expanded="true"]')].map(button => button.closest('[data-comment-id]').dataset.commentId);
    section.outerHTML = board({boardFilter: filter || section.dataset.filter}, c, true);
    page.querySelector('[data-comment-total]').textContent = noteCount(c);
    for (const button of page.querySelectorAll('[data-comment-expand]')) {
      if (expanded.includes(button.closest('[data-comment-id]').dataset.commentId)) button.click();
    }
  }
  function openComposer(page, parent = '', to = '') {
    const dock = page.querySelector('.cm-comment-dock');
    if (!dock) return;
    const form = dock.querySelector('form');
    // Keep an unfinished draft when opening the same target again.
    if (form.dataset.parent !== parent || form.dataset.to !== to) { form.reset(); form.querySelector('[type="submit"]').disabled = true; }
    form.dataset.parent = parent; form.dataset.to = to;
    form.querySelector('[data-reply-label]').textContent = parent ? t(`回复 ${to}`, `Reply to ${to}`) : t('发表评论', 'Leave a comment');
    form.querySelector('[name="kind"]').hidden = !!parent;
    const sceneWrite = form.querySelector('.cm-scene-write');
    if (sceneWrite) sceneWrite.hidden = !!parent;
    dock.querySelector('.cm-dock-idle').hidden = true;
    form.hidden = false;
    form.querySelector('textarea').focus();
  }
  function closeComposer(page) {
    const dock = page.querySelector('.cm-comment-dock');
    dock.querySelector('form').hidden = true;
    dock.querySelector('.cm-dock-idle').hidden = false;
    dock.querySelector('.cm-emoji-picker').hidden = true;
    dock.querySelector('[data-comment-emoji]').setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('.cm-journey button');
    if (!button || window.ChallengeMotion?.busy) return;
    const page = button.closest('.cm-journey');
    if (button.hasAttribute('data-comment-compose')) openComposer(page);
    else if (button.hasAttribute('data-comment-reply')) openComposer(page, button.dataset.commentReply, button.dataset.replyTo);
    else if (button.hasAttribute('data-comment-cancel')) { closeComposer(page); page.querySelector('[data-comment-compose]')?.focus(); }
    else if (button.hasAttribute('data-comment-scroll')) page.querySelector('.cm-board')?.scrollIntoView({block: 'start', behavior: 'smooth'});
    else if (button.hasAttribute('data-comment-expand')) {
      const open = button.getAttribute('aria-expanded') !== 'true', rows = button.parentElement.querySelectorAll(':scope > [data-reply-row]');
      rows.forEach((row, i) => { if (i) row.hidden = !open; });
      button.setAttribute('aria-expanded', String(open));
      button.innerHTML = `${open ? t('收起回复', 'Hide replies') : t(`展开 ${rows.length - 1} 条回复`, `View ${rows.length - 1} more replies`)}<span>${open ? '⌃' : '⌄'}</span>`;
    } else if (button.hasAttribute('data-comment-emoji')) {
      const picker = page.querySelector('.cm-emoji-picker');
      picker.hidden = !picker.hidden;
      button.setAttribute('aria-expanded', String(!picker.hidden));
    } else if (button.hasAttribute('data-emoji')) {
      const field = page.querySelector('.cm-comment-form textarea');
      if (field.value.length - (field.selectionEnd - field.selectionStart) + button.dataset.emoji.length <= field.maxLength) field.setRangeText(button.dataset.emoji, field.selectionStart, field.selectionEnd, 'end');
      field.dispatchEvent(new Event('input', {bubbles: true})); field.focus();
    } else if (button.hasAttribute('data-comment-react')) {
      const id = page.querySelector('.cm-comment-dock').dataset.dockJourney, like = button.dataset.commentReact === 'like';
      const on = window.TWStore.update(data => {
        const collection = like ? data.likes : (data.prefs.communitySaved ||= {}), key = like ? `feed:${id}` : id;
        if (collection[key]) delete collection[key]; else collection[key] = true;
        return !!collection[key];
      });
      button.setAttribute('aria-pressed', String(on));
      if (like) button.querySelector('b').textContent = on ? '1' : '';
    }
  });
  document.addEventListener('change', event => {
    if (event.target.matches('[data-comment-filter]')) refreshComments(event.target.closest('.cm-journey'), event.target.value);
  });
  document.addEventListener('input', event => {
    if (event.target.matches('.cm-comment-form textarea')) event.target.form.querySelector('[type="submit"]').disabled = !event.target.value.trim();
  });
  document.addEventListener('keydown', event => {
    if (!event.target.closest('.cm-comment-form')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeComposer(event.target.closest('.cm-journey')); }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); event.target.closest('form').requestSubmit(); }
  });
  document.addEventListener('submit', event => {
    if (!event.target.matches('.cm-comment-form')) return;
    event.preventDefault();
    const form = event.target, page = form.closest('.cm-journey'), section = page.querySelector('.cm-board[data-comment-journey]');
    const c = C.cities.find(c => c.id === section?.dataset.commentJourney) || ugc.find(c => c.id === section?.dataset.commentJourney);
    const text = form.elements.comment.value.trim(), parent = form.dataset.parent;
    if (!c || !text || text.length > 200 || (parent && !boardNotes(c).some(note => note.id === parent))) return;
    const id = `comment-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    window.TWStore.update(data => {
      const note = {id, text, at: Date.now()};
      if (parent) ((data.boardReplies ||= {})[parent] ||= []).push({...note, to: form.dataset.to});
      else ((data.boardComments ||= {})[c.id] ||= []).unshift({...note, kind: form.elements.kind.value});
    });
    form.reset(); form.dataset.parent = ''; form.dataset.to = ''; form.querySelector('[type="submit"]').disabled = true;
    closeComposer(page); refreshComments(page, 'all');
    const status = page.querySelector('.cm-comment-status');
    status.textContent = t('已发送，保存在本机', 'Sent and saved on this device');
    const added = [...page.querySelectorAll('[data-comment-id]')].find(node => node.dataset.commentId === id);
    if (parent && added?.closest('[data-reply-row]')?.hidden) added.closest('.cm-replies').querySelector('[data-comment-expand]')?.click();
    added?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  });

  const galleryPositions = new Map();
  let galleryCleanup = () => {};
  function mountJourney(root) {
    galleryCleanup();
    const gallery = root.querySelector('.cm-gallery');
    if (!gallery) return;
    const slides = [...gallery.children], id = gallery.dataset.galleryJourney;
    const controller = new AbortController(), options = {signal: controller.signal};
    let index = Math.min(galleryPositions.get(id) || 0, slides.length - 1), down = null, suppressUntil = 0;
    const sync = () => {
      index = Math.max(0, Math.min(slides.length - 1, Math.round(gallery.scrollLeft / (gallery.clientWidth || 1))));
      galleryPositions.set(id, index);
      slides.forEach((slide, i) => { slide.tabIndex = i === index ? 0 : -1; });
    };
    gallery.scrollLeft = index * gallery.clientWidth;
    sync();
    gallery.addEventListener('scroll', sync, {...options, passive: true});
    gallery.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : Math.max(0, Math.min(slides.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
      gallery.scrollTo({left: next * gallery.clientWidth, behavior: 'instant'});
      sync(); slides[next].focus({preventScroll: true});
    }, options);
    gallery.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || slides.length < 2) return;
      suppressUntil = 0;
      down = {id: event.pointerId, x: event.clientX, y: event.clientY, left: gallery.scrollLeft, dragging: false};
    }, options);
    gallery.addEventListener('pointermove', event => {
      if (!down || event.pointerId !== down.id) return;
      const dx = event.clientX - down.x, dy = event.clientY - down.y;
      if (!down.dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        down.dragging = true; gallery.classList.add('is-dragging'); gallery.setPointerCapture(event.pointerId);
      }
      if (down.dragging) { event.preventDefault(); gallery.scrollLeft = down.left - dx; }
    }, options);
    const endDrag = event => {
      if (!down || event.pointerId !== down.id) return;
      const dragged = down.dragging;
      down = null;
      if (dragged) {
        suppressUntil = performance.now() + 500;
        sync(); gallery.classList.remove('is-dragging');
        gallery.scrollTo({left: index * gallery.clientWidth, behavior: 'smooth'});
      }
      if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
    };
    gallery.addEventListener('pointerup', endDrag, options);
    gallery.addEventListener('pointercancel', endDrag, options);
    gallery.addEventListener('lostpointercapture', endDrag, options);
    gallery.addEventListener('pointerleave', event => { if (down && !down.dragging) down = null; }, options);
    gallery.addEventListener('click', event => {
      if (performance.now() < suppressUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, {...options, capture: true});
    let width = gallery.clientWidth;
    const resize = new ResizeObserver(() => {
      if (width === gallery.clientWidth) return;
      width = gallery.clientWidth; gallery.scrollLeft = index * width;
    });
    resize.observe(gallery);
    galleryCleanup = () => { sync(); controller.abort(); resize.disconnect(); galleryCleanup = () => {}; };
  }
  function releasePress(){galleryCleanup();window.HubCards3D?.release();}
  window.Community = Object.freeze({isUgc, label, boardOpen, hub, feed, journey, publish, validate, previews, releasePress, mountJourney});
})();
