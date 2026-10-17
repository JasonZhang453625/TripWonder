/* Machine-checkable part of content/QUIZ-SPEC.md, shared by the question bank tests and the admin pipeline.
   Each check returns a list of problems in Chinese; an empty list means the question passes. */
((root, factory) => { const api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.QuizRules = api; })(typeof window === 'object' ? window : globalThis, () => {
  'use strict';
  const LIMITS = {stem: [6, 28], option: [4, 12], optionSpread: 4, explain: 60, longestShare: 1 / 3, position: [0.2, 0.3]};
  // Book knowledge, statistics and trivial questions.
  const KNOWLEDGE = [
    [/\d{3,4}\s*年/, '考了年份'],
    [/(秦|汉|晋|隋|唐|宋|辽|金|元|明|清|北魏|民国)(朝|代|时期)/, '考了朝代'],
    [/谁(设计|建造|修建|题写)|哪位|哪首诗|诗句|出自/, '考了人物或诗文出处'],
    [/GDP|人口|房价|地铁规模|里程|人均/, '考了统计数字'],
    [/(?<!好)几(层|座|个|根|尊|级)|多少(个|座|层|根)|什么颜色|哪种颜色/, '考了数数或颜色']
  ];
  // Questions about photography or reasoning technique rather than the place itself.
  const META = /怎样|如何(判断|避免|区分|确认|辨认)|哪种(方法|方式|观察|拍法|操作|路线|镜头|记录)|更可靠|额外证据|误(看|判|当)|稳妥|拍摄|取景|镜头/;
  const HEDGE = /^(只|仅)|以上都|都不是/;
  const len = s => [...String(s)].length;

  function lint(q, banned = []) {
    const problems = [], stem = String(q.q || ''), options = (q.options || []).map(String), explain = String(q.explain || '');
    if (len(stem) < LIMITS.stem[0] || len(stem) > LIMITS.stem[1]) problems.push(`题干应为 ${LIMITS.stem.join('–')} 字（当前 ${len(stem)}）`);
    if (options.length !== 4 || new Set(options).size !== 4) problems.push('需要 4 个互不相同的选项');
    const lengths = options.map(len);
    if (lengths.some(n => n < LIMITS.option[0] || n > LIMITS.option[1])) problems.push(`每个选项应为 ${LIMITS.option.join('–')} 字`);
    if (Math.max(...lengths) - Math.min(...lengths) > LIMITS.optionSpread) problems.push(`选项长短相差不超过 ${LIMITS.optionSpread} 字`);
    if (options.some(o => HEDGE.test(o))) problems.push('选项不要以「只/仅」开头，也不用「以上都」「都不是」');
    if (!Number.isInteger(Number(q.answer)) || q.answer < 0 || q.answer > 3) problems.push('answer 需为 0–3');
    if (!explain || len(explain) > LIMITS.explain) problems.push(`解析不能为空且不超过 ${LIMITS.explain} 字（当前 ${len(explain)}）`);
    const asked = [stem, ...options].join(' ');
    const knowledge = KNOWLEDGE.filter(([pattern]) => pattern.test(asked)).map(([, why]) => why);
    if (knowledge.length) problems.push(`${knowledge.join('、')}，请换成靠画面和大众常识就能答的题`);
    if (META.test(stem)) problems.push('题干在问观察或拍摄方法，请直接问景物本身（是什么、为什么、原来如此）');
    const hit = banned.filter(word => word && [asked, explain].join(' ').includes(word));
    if (hit.length) problems.push(`出现了禁用词「${hit.join('、')}」`);
    return problems;
  }

  // One destination's three questions. Scenes are compared by sceneId or sceneIndex, whichever is present.
  function lintSet(list, sceneCount = 3) {
    const problems = [];
    if (!Array.isArray(list) || list.length !== 3) return ['需要 3 道题'];
    if (list.some((q, i) => q.level != null && Number(q.level) !== i + 1)) problems.push('3 道题需按 level 1、2、3 由易到难排列');
    if (sceneCount >= 3 && new Set(list.map(q => q.sceneId ?? q.sceneIndex)).size < 3) problems.push('3 道题应分别对应 3 个不同场景');
    if (new Set(list.map(q => Number(q.answer))).size < 2) problems.push('3 道题的正确答案位置不要全相同');
    return problems;
  }

  // The whole bank: the right answer must not be guessable as the longest option, and positions stay spread.
  function lintBank(questions) {
    const problems = [], n = questions.length;
    if (!n) return problems;
    const longest = questions.filter(q => {
      const lengths = q.options.map(len), max = Math.max(...lengths);
      return lengths[q.answer] === max && lengths.filter(x => x === max).length === 1;
    }).length;
    if (longest / n > LIMITS.longestShare) problems.push(`正确答案是唯一最长选项的题占 ${longest}/${n}，应不超过 1/3`);
    const counts = [0, 1, 2, 3].map(i => questions.filter(q => Number(q.answer) === i).length);
    counts.forEach((c, i) => { const share = c / n; if (share < LIMITS.position[0] || share > LIMITS.position[1]) problems.push(`答案为 ${'ABCD'[i]} 的题占 ${c}/${n}，应在 20%–30% 之间`); });
    return problems;
  }

  return {LIMITS, lint, lintSet, lintBank};
});
