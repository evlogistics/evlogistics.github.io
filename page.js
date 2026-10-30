/* Eagle Vision Logistics: behaviour for the service pages and the 404 page.
   Theme switch, mobile menu and header shadow (the home page does the same in script.js). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var KEY = 'evl-theme', root = document.documentElement, sw = $('#themeSwitch'), metaTheme = $('meta[name="theme-color"]');
  var saved = function () { try { var v = localStorage.getItem(KEY); return (v === 'dark' || v === 'light') ? v : null; } catch (e) { return null; } };
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (sw) { sw.setAttribute('aria-checked', String(t === 'dark')); sw.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'; }
    if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#0a1424' : '#0b2248');
  }
  applyTheme(saved() || root.getAttribute('data-theme') || 'light');
  if (sw) sw.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-anim'); applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
    setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) applyTheme(e.newValue); });

  var burger = $('#burger'), menu = $('#menu');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
  if (burger && menu) {
    burger.addEventListener('click', function () { var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('#menu, #burger')) closeMenu(); });
  }
  var header = $('#header');
  if (header) { var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); }; window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
})();
