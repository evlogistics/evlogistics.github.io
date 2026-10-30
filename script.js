/* Eagle Vision Logistics — site behaviour.
   Content comes from data.js (edit it by hand or with admin.html). */
(function () {
  'use strict';

  var S = window.SITE || {}, I = S.site || {}, A = S.about || {}, P = S.purpose || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var L = function (k) { return Array.isArray(S[k]) ? S[k] : []; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var src = function (p) { return esc(encodeURI(String(p))); };
  var paras = function (t) { return String(t || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join(''); };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- icons ---------- */
  var svg = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>'; };
  var IC = {
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    link: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c2-5 5-8 9-10"/>',
    diamond: '<path d="M12 3l9 9-9 9-9-9z"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>'
  };
  var VAL_ICON = { clarity: 'eye', precision: 'target', integrity: 'shield', excellence: 'star', reliab: 'clock', innovation: 'bulb', partner: 'link', strategic: 'flag', customer: 'headset', sustainab: 'leaf' };
  var valIcon = function (t) { t = String(t || '').toLowerCase(); var k = Object.keys(VAL_ICON).filter(function (x) { return t.indexOf(x) > -1; })[0]; return IC[k ? VAL_ICON[k] : 'diamond']; };

  /* =========================================================
     THEME SWITCH — saved in localStorage so it is remembered
     after refresh, closing the tab, or restarting the device.
     ========================================================= */
  var KEY = 'evl-theme', root = document.documentElement, sw = $('#themeSwitch'), metaTheme = $('meta[name="theme-color"]');
  var saved = function () { try { var v = localStorage.getItem(KEY); return (v === 'dark' || v === 'light') ? v : null; } catch (e) { return null; } };
  var sysDark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    sw.setAttribute('aria-checked', String(t === 'dark'));
    sw.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#0a1424' : '#0b2248');
  }
  applyTheme(saved() || root.getAttribute('data-theme') || 'light');
  sw.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-anim');
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* private mode: still works for this visit */ }
    setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
  });
  // No saved choice yet? Follow the device setting live.
  if (sysDark) {
    var onSys = function (e) { if (!saved()) applyTheme(e.matches ? 'dark' : 'light'); };
    if (sysDark.addEventListener) sysDark.addEventListener('change', onSys); else if (sysDark.addListener) sysDark.addListener(onSys);
  }
  // Keep other open tabs in sync.
  window.addEventListener('storage', function (e) { if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) applyTheme(e.newValue); });

  /* ---------- basic content ---------- */
  var name = I.name || 'Eagle Vision Logistics';
  document.title = name + ' | Freight Forwarding & Cargo Services in Ghana';
  $('#nm').textContent = name;
  $$('.nm2').forEach(function (e) { e.textContent = name; });
  $('#yr').textContent = new Date().getFullYear();

  var phone = I.phone || '', email = I.email || '', addr = I.address || '', hours = I.hours || '';
  var tel = 'tel:' + phone.replace(/[^\d+]/g, '');
  var wa = (I.whatsapp || '').replace(/\D/g, '');
  var mapUrl = addr ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr + ', Ghana') : '';

  // top bar
  $('#topAddr').innerHTML = addr ? '<li>' + svg(IC.pin) + '<span>' + esc(addr) + '</span></li>' : '';
  $('#topContact').innerHTML =
    (phone ? '<li>' + svg(IC.phone) + '<a href="' + esc(tel) + '">' + esc(phone) + '</a></li>' : '') +
    (email ? '<li>' + svg(IC.mail) + '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a></li>' : '');

  /* ---------- hero ---------- */
  var heroes = L('hero');
  $('#slides').innerHTML = heroes.map(function (h, k) {
    var tag = k === 0 ? 'h1' : 'h2';
    var second = (h.link && h.link !== '#contact') ? '<a class="btn ghost" href="#contact">Get a quote</a>' : '';
    return '<div class="slide" role="group" aria-roledescription="slide" aria-label="Slide ' + (k + 1) + ' of ' + heroes.length + '">' +
      (h.image ? '<img src="' + src(h.image) + '" alt="" decoding="async"' + (k === 0 ? ' fetchpriority="high"' : ' fetchpriority="low"') + '>' : '') +
      '<div class="wrap"><' + tag + '>' + esc(h.title) + '</' + tag + '><p>' + esc(h.text) + '</p>' +
      '<div class="actions">' + (h.btn ? '<a class="btn" href="' + esc(h.link || '#contact') + '">' + esc(h.btn) + '</a>' : '') + second + '</div></div></div>';
  }).join('');

  var slides = $$('.slide'), dotsBox = $('#dots'), idx = 0, timer = null, paused = reduced, hovering = false;
  var pauseBtn = $('#pause');
  function setPausedUI() { pauseBtn.classList.toggle('is-paused', paused); pauseBtn.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow'); }
  function go(k) {
    idx = (k + slides.length) % slides.length;
    slides.forEach(function (s, j) { s.classList.toggle('on', j === idx); });
    $$('.dot', dotsBox).forEach(function (d, j) { d.classList.toggle('on', j === idx); d.setAttribute('aria-current', j === idx ? 'true' : 'false'); });
  }
  function tick() { clearInterval(timer); if (!paused && !hovering && slides.length > 1) timer = setInterval(function () { go(idx + 1); }, 6500); }
  if (slides.length) {
    slides.forEach(function (_, k) {
      var d = document.createElement('button'); d.type = 'button'; d.className = 'dot'; d.setAttribute('aria-label', 'Go to slide ' + (k + 1));
      d.addEventListener('click', function () { go(k); tick(); }); dotsBox.appendChild(d);
    });
    $('#prev').addEventListener('click', function () { go(idx - 1); tick(); });
    $('#next').addEventListener('click', function () { go(idx + 1); tick(); });
    pauseBtn.addEventListener('click', function () { paused = !paused; setPausedUI(); tick(); });
    var hero = $('#home');
    hero.addEventListener('mouseenter', function () { hovering = true; tick(); });
    hero.addEventListener('mouseleave', function () { hovering = false; tick(); });
    hero.addEventListener('focusin', function () { hovering = true; tick(); });
    hero.addEventListener('focusout', function () { hovering = false; tick(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else tick(); });
    setPausedUI(); go(0); tick();
    if (slides.length < 2) $('.ctl').hidden = true;
  } else { $('#home').remove(); }

  /* ---------- services ---------- */
  var svcs = L('services'), n = svcs.length, r = n % 3;
  $('#svcs').innerHTML = svcs.map(function (s, i) {
    var cls = '';
    if (r === 2 && i >= n - 2) cls = ' w3'; else if (r === 1 && i === n - 1) cls = ' w6';
    return '<button type="button" class="svc' + cls + '" data-i="' + i + '" aria-haspopup="dialog">' +
      '<div class="ph">' + (s.image ? '<img src="' + src(s.image) + '" alt="" loading="lazy" decoding="async">' : '') + '</div>' +
      '<div class="body"><h3>' + esc(s.title) + '</h3><p>' + esc(s.short) + '</p><span class="more">Learn more ' + svg(IC.arrow) + '</span></div></button>';
  }).join('');
  if (!n) $('#services').remove();

  var dlg = $('#dlg');
  $('#svcs').addEventListener('click', function (e) {
    var c = e.target.closest('.svc'); if (!c) return;
    var s = svcs[+c.dataset.i];
    dlg.dataset.service = s.title;
    $('#dt').textContent = s.title; $('#dp').textContent = s.more || s.short || '';
    $('#dimg').style.backgroundImage = s.image ? 'url("' + encodeURI(s.image) + '")' : 'none';
    dlg.showModal();
  });
  ['#dc', '#dq', '#dx'].forEach(function (id) { $(id).addEventListener('click', function () { dlg.close(); }); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- about ---------- */
  $('#aT').textContent = A.title || '';
  $('#a1').innerHTML = paras(A.p1);
  $('#a2').innerHTML = paras(A.p2);
  var why = String(A.why || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
  $('#why').innerHTML = why.map(function (x) { return '<li>' + svg(IC.check) + '<span>' + esc(x) + '</span></li>'; }).join('');
  if (!why.length) $('#whyPanel').remove();
  if (A.image) { var fig = $('#aImg'); fig.innerHTML = '<img src="' + src(A.image) + '" alt="Cargo handlers checking packed goods at a container" loading="lazy" decoding="async">'; fig.hidden = false; }
  if (!A.title && !A.p1 && !A.p2) $('#about').remove();

  /* ---------- mission & vision ---------- */
  var pur = [['Our mission', P.mission, 'target'], ['Our vision', P.vision, 'eye']].filter(function (x) { return x[1]; });
  $('#purposeGrid').innerHTML = pur.map(function (x) {
    return '<article><div class="ttl"><span class="ico">' + svg(IC[x[2]]) + '</span><h2>' + x[0] + '</h2></div><p>' + esc(x[1]) + '</p></article>';
  }).join('');
  if (pur.length === 1) $('#purposeGrid').style.gridTemplateColumns = '1fr';
  if (!pur.length) $('#purpose').remove();

  /* ---------- values ---------- */
  $('#vals').innerHTML = L('values').map(function (v, i) {
    return '<div class="vcard"><span class="num" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span><span class="ico">' + svg(valIcon(v.title)) + '</span><h3>' + esc(v.title) + '</h3><p>' + esc(v.text) + '</p></div>';
  }).join('');
  if (!L('values').length) $('#values').remove();
  else if (I.brochure) $('#broL').href = I.brochure; else $('#bro').remove();

  /* ---------- gallery + lightbox ---------- */
  var gal = L('gallery');
  $('#gal').innerHTML = gal.map(function (g, i) {
    var alt = g.alt || ('Logistics operation photo ' + (i + 1));
    return '<button type="button" class="shot" data-i="' + i + '" aria-label="Enlarge photo: ' + esc(alt) + '"><img src="' + src(g.image) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></button>';
  }).join('');
  if (!gal.length) $('#gallery').remove();
  var lb = $('#lb');
  $('#gal').addEventListener('click', function (e) {
    var b = e.target.closest('.shot'); if (!b) return;
    var g = gal[+b.dataset.i], alt = g.alt || '';
    $('#lbImg').src = encodeURI(g.image); $('#lbImg').alt = alt; $('#lbCap').textContent = alt; lb.showModal();
  });
  $('#lx').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });

  /* ---------- team, quote, partners ---------- */
  var team = L('team');
  $('#tm').innerHTML = team.map(function (m) {
    return '<div>' + (m.image ? '<img src="' + src(m.image) + '" alt="' + esc(m.name) + '" loading="lazy" decoding="async">' : '<div class="noimg"></div>') + '<h3>' + esc(m.name) + '</h3><p>' + esc(m.role) + '</p></div>';
  }).join('');
  if (!team.length) $('#team').remove();
  var Q = S.quote || {};
  $('#q').innerHTML = Q.text ? '&ldquo;' + esc(Q.text) + '&rdquo;<cite>' + esc(Q.by) + '</cite>' : '';
  $('#logos').innerHTML = L('partners').map(function (p) { return '<div>' + (p.image ? '<img src="' + src(p.image) + '" alt="Partner logo" loading="lazy">' : '') + '</div>'; }).join('');
  if (!Q.text && !L('partners').length) $('#testi').remove();

  /* ---------- contact + footer ---------- */
  var rows = [];
  if (addr) rows.push([IC.pin, 'Address', '<a href="' + esc(mapUrl) + '" target="_blank" rel="noopener">' + esc(addr) + '</a>']);
  if (phone) rows.push([IC.phone, 'Phone', '<a href="' + esc(tel) + '">' + esc(phone) + '</a>']);
  if (email) rows.push([IC.mail, 'Email', '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a>']);
  if (hours) rows.push([IC.clock, 'Opening hours', '<span>' + esc(hours.replace(/\s*\|\s*/g, ' · ')) + '</span>']);
  $('#cRows').innerHTML = rows.map(function (x) { return '<li><span class="ico">' + svg(x[0]) + '</span><div><small>' + x[1] + '</small>' + x[2] + '</div></li>'; }).join('');
  $('#cActions').innerHTML =
    (wa ? '<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent('Hello ' + name + ', I would like a quote.') + '">Chat on WhatsApp</a>' : '') +
    (mapUrl ? '<a class="btn sm ghost-ink" target="_blank" rel="noopener" href="' + esc(mapUrl) + '">Open in Maps</a>' : '');

  var navTargets = [['#track', 'Track shipment'], ['#services', 'Services'], ['#about', 'About us'], ['#values', 'Core values'], ['#gallery', 'Gallery'], ['#contact', 'Contact']].filter(function (x) { return $(x[0]); });
  $('#fLinks').innerHTML = navTargets.map(function (x) { return '<li><a href="' + x[0] + '">' + x[1] + '</a></li>'; }).join('');
  $('#fContact').innerHTML =
    (addr ? '<li>' + svg(IC.pin) + '<span>' + esc(addr) + '</span></li>' : '') +
    (phone ? '<li>' + svg(IC.phone) + '<a href="' + esc(tel) + '">' + esc(phone) + '</a></li>' : '') +
    (email ? '<li>' + svg(IC.mail) + '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a></li>' : '');

  if (wa) { var w = $('#wa'); w.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hello ' + name + ', I would like a quote.'); w.hidden = false; }

  // search-engine data
  try {
    var ld = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: name, url: location.href.split('#')[0] };
    if (phone) ld.telephone = phone; if (email) ld.email = email;
    if (addr) ld.address = { '@type': 'PostalAddress', streetAddress: addr, addressCountry: 'GH' };
    ld.image = new URL('logo.jpeg', location.href).href;
    var sc = document.createElement('script'); sc.type = 'application/ld+json'; sc.textContent = JSON.stringify(ld); document.head.appendChild(sc);
  } catch (e) { /* not essential */ }

  /* ---------- quote form ---------- */
  var form = $('#frm'), note = $('#formNote'), sendBtn = $('#sendBtn'), sendLabel = sendBtn.textContent;
  var svcSel = $('select[name="service"]', form);

  // Keep the "Service required" list in step with the services in data.js.
  if (svcs.length) {
    svcSel.innerHTML = '<option value="">Choose a service</option>' +
      svcs.map(function (s) { return '<option>' + esc(s.title) + '</option>'; }).join('') + '<option>Other</option>';
  }
  // "Request a quote" inside a service pop-up pre-selects that service.
  $('#dq').addEventListener('click', function () { if (dlg.dataset.service) svcSel.value = dlg.dataset.service; });

  var val = function (n) { var f = form.elements[n]; return f ? String(f.value || '').trim() : ''; };
  // The visitor's details as plain text, used by the WhatsApp / email fallback.
  function summary() {
    var lines = ['Hello ' + name + ', I would like a quote.', ''];
    [['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Service', 'service'], ['Route', 'route'], ['Cargo details', 'message']].forEach(function (f) {
      if (val(f[1])) lines.push(f[0] + ': ' + val(f[1]));
    });
    return lines.join('\n');
  }
  function fallbackHtml() {
    var txt = summary(), out = '';
    if (wa) out += '<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent(txt) + '">Send on WhatsApp</a>';
    if (email) out += '<a class="btn sm ghost-ink" href="mailto:' + esc(email) + '?subject=' + encodeURIComponent('Quote request - ' + name) + '&amp;body=' + encodeURIComponent(txt) + '">Send by email</a>';
    return (out ? '<div class="note-actions">' + out + '</div>' : '') +
      (phone ? '<div class="note-alt">Or call <a href="' + esc(tel) + '">' + esc(phone) + '</a>.</div>' : '');
  }
  function say(kind, html) {
    note.className = 'form-note ' + kind;
    note.innerHTML = '<span class="nico">' + svg(kind === 'ok' ? IC.check : IC.alert) + '</span><div>' + html + '</div>';
    note.hidden = false;
    note.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('[name="_honey"]', form).value) return;                 // bots fill the hidden field
    if (!form.checkValidity()) { form.classList.add('was-validated'); form.reportValidity(); return; }

    // Which service receives the form: Web3Forms (if a key is set), else Formspree link, else FormSubmit.
    var w3key = String(I.web3formsKey || '').trim(), body = null;
    var endpoint = w3key ? 'https://api.web3forms.com/submit'
      : (I.formUrl && !/YOUR_FORM_ID/.test(I.formUrl)) ? I.formUrl : (email ? 'https://formsubmit.co/ajax/' + email : '');
    if (w3key) {
      body = new FormData();
      body.append('access_key', w3key);
      body.append('subject', 'New quote request from ' + val('name') + ' - ' + name + ' website');
      body.append('from_name', name + ' website');
      body.append('name', val('name'));
      body.append('email', val('email'));
      if (val('phone')) body.append('Phone / WhatsApp', val('phone'));
      body.append('Service required', val('service'));
      if (val('route')) body.append('Shipment route', val('route'));
      body.append('Cargo details', val('message'));
    }
    if (!endpoint) { say('err', '<strong>The form is not connected yet.</strong> Please contact us directly:' + fallbackHtml()); return; }

    var who = val('name').split(/\s+/)[0];
    sendBtn.disabled = true; sendBtn.classList.add('is-loading'); sendBtn.textContent = 'Sending…'; note.hidden = true;

    fetch(endpoint, { method: 'POST', body: body || new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          if (!res.ok || j.success === false || j.success === 'false') throw new Error(j.message || ('HTTP ' + res.status));
        });
      })
      .then(function () {
        say('ok', '<strong>Request sent.</strong> Thank you' + (who ? ', ' + esc(who) : '') + '. We will reply with a quote shortly.');
        form.reset(); form.classList.remove('was-validated');
      })
      .catch(function (err) {
        if (window.console) console.warn('Quote form not delivered:', err && err.message);
        say('err', '<strong>We could not send your request automatically.</strong> ' +
          (location.protocol === 'file:' ? 'Sending only works on the published website, not from a file on your computer. ' : '') +
          'Your details are still in the form. Please send them to us another way:' + fallbackHtml());
      })
      .then(function () { sendBtn.disabled = false; sendBtn.classList.remove('is-loading'); sendBtn.textContent = sendLabel; });
  });

  /* ---------- shipment tracking ----------
     Data lives in tracking.js (managed from admin.html). Numbers are stored only as hashes. */
  var trkForm = $('#trkForm'), trkOut = $('#trkOut'), trkNo = $('#trkNo'), trkBtn = $('#trkBtn');
  var SHIP = (window.TRACKING && window.TRACKING.shipments) || {};
  var EV = window.EVL || null;
  var STAGES = EV ? EV.STAGES : ['Booked', 'Cargo received', 'In transit', 'Arrived at destination', 'Customs clearance', 'Out for delivery', 'Delivered'];

  // "2026-10-27T11:20" or "2026-10-27" -> Date in the visitor's own time zone (no UTC shift).
  function parseWhen(v) {
    var m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
    if (!m) return null;
    return { d: new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)), time: !!m[4] };
  }
  function fmtWhen(v) {
    var w = parseWhen(v); if (!w) return esc(v || '');
    var o = { day: 'numeric', month: 'short', year: 'numeric' };
    if (w.time) { o.hour = '2-digit'; o.minute = '2-digit'; }
    try { return w.d.toLocaleString('en-GB', o); } catch (e) { return w.d.toDateString(); }
  }
  function when(v) { var w = parseWhen(v); return w ? w.d.getTime() : 0; }

  function trkMsg(kind, html) {
    trkOut.innerHTML = '<div class="form-note ' + kind + '"><span class="nico">' + svg(kind === 'ok' ? IC.check : IC.alert) + '</span><div>' + html + '</div></div>';
  }
  function trkHelp(number) {
    var txt = 'Hello ' + name + ', I am trying to track a shipment' + (number ? ' (tracking number: ' + number + ')' : '') + '. Please can you help?', out = '';
    if (wa) out += '<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent(txt) + '">Ask on WhatsApp</a>';
    if (email) out += '<a class="btn sm ghost-ink" href="mailto:' + esc(email) + '?subject=' + encodeURIComponent('Shipment tracking - ' + name) + '&amp;body=' + encodeURIComponent(txt) + '">Ask by email</a>';
    return (out ? '<div class="note-actions">' + out + '</div>' : '') + (phone ? '<div class="note-alt">Or call <a href="' + esc(tel) + '">' + esc(phone) + '</a>.</div>' : '');
  }

  function showShipment(r, number) {
    var idx = STAGES.indexOf(r.status), delivered = idx === STAGES.length - 1;
    var evs = (Array.isArray(r.events) ? r.events : []).slice().sort(function (a, b) { return when(b.date) - when(a.date); });
    var last = evs[0] ? fmtWhen(evs[0].date) : '';
    var meta = [['From', r.origin], ['To', r.destination], ['Mode', r.mode], [delivered ? 'Delivered' : 'Estimated arrival', delivered && evs[0] ? evs[0].date : r.eta], ['Cargo', r.cargo]]
      .filter(function (x) { return x[1]; })
      .map(function (x) { return '<div' + (x[0] === 'Cargo' ? ' class="wide"' : '') + '><dt>' + x[0] + '</dt><dd>' + ((x[0] === 'Estimated arrival' || x[0] === 'Delivered') ? fmtWhen(x[1]) : esc(x[1])) + '</dd></div>'; }).join('');
    var steps = STAGES.map(function (st, i) {
      var c = i < idx || delivered ? ' done' : (i === idx ? ' now' : '');
      return '<li class="' + c.trim() + '"' + (i === idx ? ' aria-current="step"' : '') + '><span class="dot-s">' + (i < idx || delivered ? svg(IC.check) : '') + '</span><span class="lbl">' + esc(st) + '</span></li>';
    }).join('');
    var timeline = evs.map(function (e, i) {
      return '<li' + (i === 0 ? ' class="latest"' : '') + '><time>' + fmtWhen(e.date) + '</time><strong>' + esc(e.status || '') + '</strong>' +
        (e.location ? '<span class="loc">' + svg(IC.pin) + esc(e.location) + '</span>' : '') + (e.note ? '<p>' + esc(e.note) + '</p>' : '') + '</li>';
    }).join('');

    trkOut.innerHTML =
      '<article class="trk-card">' +
        '<header class="trk-top"><div><small>Tracking number</small><h3>' + esc(number) + '</h3></div>' +
        '<div class="trk-state"><span class="chip' + (delivered ? ' ok' : '') + '">' + esc(r.status || 'Status unavailable') + '</span>' + (last ? '<small>Last update: ' + last + '</small>' : '') + '</div></header>' +
        (r.alert ? '<p class="trk-alert">' + svg(IC.alert) + '<span>' + esc(r.alert) + '</span></p>' : '') +
        '<dl class="trk-meta">' + meta + '</dl>' +
        (idx > -1 ? '<ol class="trk-steps" aria-label="Shipment progress">' + steps + '</ol>' : '') +
        (timeline ? '<h4>Tracking history</h4><ol class="trk-line">' + timeline + '</ol>' : '') +
        '<p class="trk-foot">Questions about this shipment? ' + (phone ? 'Call <a href="' + esc(tel) + '">' + esc(phone) + '</a>' : 'Contact us') + (wa ? ' or <a target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent('Hello ' + name + ', about tracking number ' + number) + '">message us on WhatsApp</a>' : '') + '.</p>' +
      '</article>';
  }

  function lookup(raw) {
    var number = EV ? EV.norm(raw) : String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!number) { trkMsg('err', '<strong>Please enter your tracking number.</strong> You will find it on your booking confirmation.'); trkNo.focus(); return; }
    if (!EV) { trkMsg('err', '<strong>Tracking is temporarily unavailable.</strong>' + trkHelp(raw)); return; }
    trkBtn.disabled = true; trkBtn.textContent = 'Searching…';
    EV.hash(number).then(function (h) {
      var r = Object.prototype.hasOwnProperty.call(SHIP, h) ? SHIP[h] : null;
      if (r) showShipment(r, raw.trim().toUpperCase().replace(/\s+/g, '-'));
      else trkMsg('err', '<strong>We could not find that tracking number.</strong> Check it for typing mistakes (letters and numbers only; dashes are optional). New shipments can take a little while to appear.' + trkHelp(raw.trim().toUpperCase()));
    }).catch(function () {
      trkMsg('err', '<strong>Something went wrong while searching.</strong> Please try again.' + trkHelp(raw));
    }).then(function () { trkBtn.disabled = false; trkBtn.textContent = 'Track shipment'; trkOut.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); });
  }
  if (trkForm) {
    trkForm.addEventListener('submit', function (e) { e.preventDefault(); lookup(trkNo.value); });
    // Shareable link: index.html?track=EVL-XXXXX-XXXXX opens straight to the result.
    var qn = (location.search.match(/[?&]track=([^&#]+)/) || [])[1];
    if (qn) { try { qn = decodeURIComponent(qn); } catch (e) {} trkNo.value = qn; lookup(qn); setTimeout(function () { var t = $('#track'); if (t) t.scrollIntoView(); }, 50); }
  }

  /* ---------- hover effects (mouse only; skipped for touch and reduced motion) ---------- */
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduced) {
    var TILT = '.svc, .vcard', GLOW = '.svc, .vcard, .panel, .purpose article';
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var el = e.target.closest && e.target.closest(GLOW);
      if (!el) return;
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
      if (el.matches(TILT)) {
        el.style.setProperty('--ry', ((x / r.width - 0.5) * 7).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y / r.height) * 7).toFixed(2) + 'deg');
      }
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var el = e.target.closest && e.target.closest(TILT);
      if (el && !el.contains(e.relatedTarget)) { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); }
    });

    // Gentle parallax on the hero photo and route art.
    var heroEl = $('#home');
    if (heroEl) {
      heroEl.addEventListener('pointermove', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        var r = heroEl.getBoundingClientRect();
        heroEl.style.setProperty('--tx', ((0.5 - (e.clientX - r.left) / r.width) * 28).toFixed(1) + 'px');
        heroEl.style.setProperty('--ty', ((0.5 - (e.clientY - r.top) / r.height) * 18).toFixed(1) + 'px');
      }, { passive: true });
      heroEl.addEventListener('pointerleave', function () { heroEl.style.removeProperty('--tx'); heroEl.style.removeProperty('--ty'); });
    }
  }

  /* ---------- navigation ---------- */
  $$('#menu a[href^="#"]:not(.btn)').forEach(function (a) { if (!$(a.getAttribute('href'))) a.closest('li').remove(); });
  var burger = $('#burger'), menu = $('#menu');
  function closeMenu() { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
  burger.addEventListener('click', function () { var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#menu, #burger')) closeMenu(); });

  var header = $('#header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var links = $$('#menu a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) io.observe(t); });
  }
})();
