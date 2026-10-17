/* Shared by the browser's self-authored journeys and the admin pipeline. */
((root, factory) => { const api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.UGCContract = api; })(typeof window === 'object' ? window : globalThis, () => {
  'use strict';
  function questions(value, count, place = '', region = '') {
    if (!Array.isArray(value) || value.length !== 3) throw Error('请填写三道题');
    const forbidden = [place, ...region.split(/[·,，\s]+/)].filter(s => s.length >= 2);
    const out = value.map((q, i) => {
      const text = String(q.q || '').trim(), options = (q.options || []).map(v => String(v).trim());
      const answer = Number(q.answer), sceneIndex = Number(q.sceneIndex ?? i);
      if (text.length < 6 || text.length > 70) throw Error(`第 ${i + 1} 题请填写 6–70 字题目`);
      if (options.length !== 4 || options.some(o => !o || o.length > 30) || new Set(options).size !== 4) throw Error(`第 ${i + 1} 题需要四个不同的选项（各不超过 30 字）`);
      if (q.answer == null || q.answer === '' || !Number.isInteger(answer) || answer < 0 || answer > 3) throw Error(`请为第 ${i + 1} 题选择正确答案`);
      if (!Number.isInteger(sceneIndex) || sceneIndex < 0 || sceneIndex >= count) throw Error(`请为第 ${i + 1} 题选择对应照片`);
      if (forbidden.some(word => [text, ...options, String(q.explain || '')].join(' ').includes(word))) throw Error(`第 ${i + 1} 题不能透露目的地或所在城市`);
      return {q: text, options, answer, sceneIndex, level: i + 1, explain: String(q.explain || `正确答案是「${options[answer]}」，可结合第 ${sceneIndex + 1} 张照片观察。`).trim().slice(0, 120)};
    });
    if (new Set(out.map(q => q.sceneIndex)).size !== 3) throw Error('三道题请选择三张不同的照片');
    return out;
  }
  const observations = () => [[20, 30, '整体轮廓', '先观察画面的整体轮廓，留意建筑、道路或自然景观之间的关系。'], [65, 45, '局部细节', '放大画面，观察材质、色彩和局部结构，再与整体环境相互印证。'], [45, 75, '空间关系', '沿着画面中的路径与边界观察，比较前景、远景和人们活动的位置。']].map(([x, y, title, text]) => ({x, y, title, text, tag: '体验'}));
  return {questions, observations};
});
