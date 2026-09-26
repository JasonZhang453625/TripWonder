/* The postcard stays unchanged; this module owns only the sharing options below it. */
(() => {
  'use strict';

  const icon = (body, extra = '') => `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;
  const line = body => icon(`<g fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${body}</g>`);
  const icons = {
    whatsapp: icon('<path d="M26 15.2a10.3 10.3 0 0 1-15.3 9l-5.3 1.4 1.5-5.1A10.3 10.3 0 1 1 26 15.2Z" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="m11.4 9.8 1.7 3.1-1.1 1.5c1 2 2.5 3.5 4.5 4.5l1.6-1.1 3.1 1.7c-.4 2.2-2 2.7-3.7 2.1-5-1.5-8.7-5.7-8.5-9.3.1-1.3 1.1-2.6 2.4-2.5Z" fill="currentColor"/>'),
    line: icon('<path d="M28 14.2C28 8.5 22.6 4 16 4S4 8.5 4 14.2c0 5 4.2 9.1 9.8 10l-.3 3.4c0 .6.5.9 1.1.6 6.4-3.5 13.4-8 13.4-14Z" fill="currentColor"/><text x="16" y="17.3" text-anchor="middle" fill="#06c755" font-family="Arial,sans-serif" font-size="8.2" font-weight="800" letter-spacing="-.3">LINE</text>'),
    wechat: icon('<path d="M19.5 18.3c-5.7-.6-8.1 3.2-6.6 7.2l-2.7-.8-3.9 2.1.9-3.6C4.6 21.6 3 19.2 3 16.6 3 12.4 7.2 9 12.5 9c3.8 0 7.1 1.8 8.6 4.5a8.5 8.5 0 0 0-1.6 4.8Z" fill="currentColor" transform="translate(0 -4)"/><path d="M29 19.5c0-3.7-3.7-6.7-8.2-6.7s-8.1 3-8.1 6.7 3.6 6.7 8.1 6.7c1.2 0 2.3-.2 3.3-.5l3.5 1.8-.8-3c1.4-1.3 2.2-3 2.2-5Z" fill="currentColor"/><g fill="#39c938"><circle cx="8.8" cy="11.3" r="1.25"/><circle cx="15.8" cy="11.3" r="1.25"/><circle cx="18" cy="18.2" r="1.05"/><circle cx="23.6" cy="18.2" r="1.05"/></g>'),
    instagram: line('<rect x="5.5" y="5.5" width="21" height="21" rx="6.4"/><circle cx="16" cy="16" r="5.1"/><circle cx="22.5" cy="9.5" r="1" fill="currentColor" stroke="none"/>'),
    snapchat: icon('<path d="M16 4.7c-4.4 0-6 3.8-5.6 7.4.1.8.1 1.5 0 2.1-.6.5-1.3.2-2-.1-1.5-.6-2.1.8-.8 1.5l2 .9c-.1 3.2-2.7 5-5 5.8-.7.3-.7 1 .2 1.3 1 .4 2.1.5 3 .7l.7 2c.3.5 1.4-.2 2.7-.1 2 .2 2.6 1.6 4.8 1.6s2.8-1.4 4.8-1.6c1.3-.1 2.4.6 2.7.1l.7-2c.9-.2 2-.3 3-.7.9-.3.9-1 .2-1.3-2.3-.8-4.9-2.6-5-5.8l2-.9c1.3-.7.7-2.1-.8-1.5-.7.3-1.4.6-2 .1-.1-.6-.1-1.3 0-2.1.4-3.6-1.2-7.4-5.6-7.4Z" fill="#fff" stroke="#101820" stroke-width="1.3" stroke-linejoin="round"/>'),
    copy: line('<path d="m13 20-1.6 1.6a5 5 0 0 1-7.1-7.1l4.6-4.6a5 5 0 0 1 7.1 0m3 2 1.6-1.6a5 5 0 0 1 7.1 7.1l-4.6 4.6a5 5 0 0 1-7.1 0m-5-6 10 0" transform="rotate(-25 16 16)"/>'),
    sms: line('<path d="M5 5.5h22v16H15l-7 5v-5H5Z"/><circle cx="10" cy="13.5" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="13.5" r="1" fill="currentColor" stroke="none"/><circle cx="22" cy="13.5" r="1" fill="currentColor" stroke="none"/>'),
    email: line('<rect x="4.5" y="7" width="23" height="18" rx="1"/><path d="m5 8 11 9L27 8"/>'),
    save: line('<path d="M16 4v16m-6-6 6 6 6-6M5 21v6h22v-6"/>'),
    more: icon('<g fill="currentColor"><circle cx="7" cy="16" r="2.5"/><circle cx="16" cy="16" r="2.5"/><circle cx="25" cy="16" r="2.5"/></g>')
  };
  const social = [
    ['whatsapp', 'WhatsApp'], ['line', 'LINE'], ['wechat', '微信'],
    ['instagram', 'Instagram'], ['snapchat', 'Snapchat']
  ];
  const actions = [['copy', '复制链接'], ['sms', '短信'], ['email', '邮件'], ['save', '保存图片'], ['more', '更多']];
  const names = Object.fromEntries([...social, ...actions]);
  const option = ([channel, label]) => `<button class="share-option share-option--${channel}" type="button" data-share-channel="${channel}" aria-label="${label}${social.some(item => item[0] === channel) ? '分享' : ''}"><span class="share-option-disc">${icons[channel]}</span><span class="share-option-label">${label}</span></button>`;

  function markup() {
    return `<div class="share-options" aria-label="分享方式"><div class="share-options-row share-options-social" role="group" aria-label="社交应用">${social.map(option).join('')}</div><div class="share-options-row share-options-tools" role="group" aria-label="更多分享方式">${actions.map(option).join('')}</div></div>`;
  }

  async function activate(channel, {title = 'TripWonder 奇境挑战', text = '', url, file, copy, save, more, toast = () => {}} = {}) {
    if (!names[channel] || !url) return;
    if (channel === 'copy') return copy?.();
    if (channel === 'save') return save?.();
    if (channel === 'more') return more?.();
    if (channel === 'sms' || channel === 'email') {
      const message = [text, url].filter(Boolean).join('\n');
      const href = channel === 'email'
        ? `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`
        : `sms:${/iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(message)}`;
      const link = document.createElement('a');
      link.href = href;
      document.body.append(link);
      link.click();
      link.remove();
      toast(channel === 'email' ? '请在邮件应用中选择收件人并发送' : '请在短信应用中选择收件人并发送');
      return;
    }
    // Browsers cannot select a specific installed social app. The user chooses it
    // in the system sheet; when unavailable, copy the same invitation for pasting.
    if (navigator.share) {
      try {
        const data = {title, text, url};
        if (file && navigator.canShare?.({files: [file]})) data.files = [file];
        await navigator.share(data);
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    const copied = await copy?.();
    if (copied === false) return;
    toast(copied === true ? `链接已复制，请前往${names[channel]}分享` : `请前往${names[channel]}粘贴挑战链接`);
  }

  window.ShareOptions = Object.freeze({markup, activate});
})();
