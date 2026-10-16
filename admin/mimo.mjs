// MiMo (Xiaomi) chat-completions client. OpenAI-compatible; the key is read server-side only.
import fs from 'node:fs';
import path from 'node:path';
import {ADMIN_DIR} from './db.mjs';

const BASE_URL = (process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1').replace(/\/$/, '');
export const MODEL = process.env.MIMO_MODEL || 'mimo-v2.6-flash';

function loadKey() {
  if (process.env.MIMO_API_KEY) return process.env.MIMO_API_KEY.trim();
  for (const file of [path.join(ADMIN_DIR, 'mimo.key'), path.join(ADMIN_DIR, '..', '..', 'mimo api key.txt')]) {
    try {
      const match = fs.readFileSync(file, 'utf8').match(/(?:sk|tp)-[A-Za-z0-9_-]+/);
      if (match) return match[0];
    } catch { /* try the next location */ }
  }
  return '';
}
export const hasKey = () => !!loadKey();

// Returns the model's JSON object. Reasoning models can spend the whole budget thinking and return
// empty content (finish_reason "length"); that, transient HTTP errors and malformed JSON are retried here.
export async function chatJson({system, user, images = [], maxTokens = 16000, timeoutMs = 240000}) {
  const key = loadKey();
  if (!key) throw new Error('未配置 MiMo API Key（环境变量 MIMO_API_KEY，或放置 mimo api key.txt）');
  const userContent = images.length
    ? [...images.map(url => ({type: 'image_url', image_url: {url}})), {type: 'text', text: user}]
    : user;
  const body = {
    model: MODEL, max_completion_tokens: maxTokens, temperature: 0.4,
    response_format: {type: 'json_object'},
    messages: [{role: 'system', content: system}, {role: 'user', content: userContent}]
  };
  if (process.env.MIMO_THINKING === 'off') body.thinking = {type: 'disabled'};
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(BASE_URL + '/chat/completions', {
        method: 'POST', headers: {Authorization: 'Bearer ' + key, 'Content-Type': 'application/json'},
        body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw Object.assign(new Error(`MiMo ${response.status}: ${payload.error?.message || response.statusText}`), {fatal: response.status === 400 || response.status === 401});
      const choice = payload.choices?.[0];
      const text = choice?.message?.content?.trim();
      if (!text) throw new Error(`MiMo 返回为空（finish_reason=${choice?.finish_reason}）`);
      return {json: extractJson(text), usage: payload.usage};
    } catch (error) {
      lastError = error;
      if (error.fatal) break;
      await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError;
}

function extractJson(text) {
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(stripped); } catch { /* fall back to a brace scan */ }
  const start = stripped.indexOf('{'), end = stripped.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('MiMo 返回内容不是 JSON');
  return JSON.parse(stripped.slice(start, end + 1));
}
