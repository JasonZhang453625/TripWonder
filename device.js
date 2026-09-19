// Run before styles are painted, including iPads requesting desktop websites.
(() => {
  const mobile = navigator.userAgentData?.mobile === true
    || /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent)
    || (/Macintosh|MacIntel/i.test(navigator.userAgent + ' ' + navigator.platform)
        && navigator.maxTouchPoints > 1);
  if (!mobile) return;
  document.documentElement.classList.add('mobile-device');
  // Older browsers lack dynamic viewport units. Modern ones use CSS 100dvh.
  if (!CSS.supports('height', '100dvh')) {
    const resize = () => document.documentElement.style.setProperty('--device-height', `${window.innerHeight}px`);
    resize();
    window.addEventListener('resize', resize, {passive: true});
  }
})();
