/* Eagle Vision Logistics: shared helpers used by index.html and admin.html.
   Font presets, tracking stages, and the tracking-number hash. */
(function () {
  'use strict';

  /* ---------- font presets ----------
     Pick one by setting  site.font  in data.js (or with the Font style menu in admin.html).
     To preview without saving, open the site with ?font=NAME, e.g. index.html?font=inter  */
  var FONTS = {
    classic:    { label: 'Classic (current): Chakra Petch + Public Sans', head: '"Chakra Petch"', body: '"Public Sans"', css: 'family=Chakra+Petch:wght@500;600;700&family=Public+Sans:wght@400;500;600' },
    corporate:  { label: 'Corporate: Montserrat + Source Sans 3',         head: '"Montserrat"',   body: '"Source Sans 3"', css: 'family=Montserrat:wght@500;600;700&family=Source+Sans+3:wght@400;500;600' },
    modern:     { label: 'Modern: Poppins + Open Sans',                    head: '"Poppins"',      body: '"Open Sans"', css: 'family=Poppins:wght@500;600;700&family=Open+Sans:wght@400;500;600' },
    clean:      { label: 'Clean: Inter',                                   head: '"Inter"',        body: '"Inter"', css: 'family=Inter:wght@400;500;600;700' },
    roboto:     { label: 'Neutral: Roboto',                                head: '"Roboto"',       body: '"Roboto"', css: 'family=Roboto:wght@400;500;700' },
    friendly:   { label: 'Friendly: Nunito Sans',                          head: '"Nunito Sans"',  body: '"Nunito Sans"', css: 'family=Nunito+Sans:wght@400;600;700' },
    technical:  { label: 'Technical: IBM Plex Sans',                       head: '"IBM Plex Sans"', body: '"IBM Plex Sans"', css: 'family=IBM+Plex+Sans:wght@400;500;600;700' },
    executive:  { label: 'Executive (serif headings): Playfair Display + Lato', head: '"Playfair Display"', body: '"Lato"', css: 'family=Playfair+Display:wght@500;600;700&family=Lato:wght@400;700' },
    system:     { label: 'System fonts (fastest, nothing to download)',    head: '', body: '', css: '' }
  };
  var FALLBACK = ',"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif';
  var FALLBACK_SERIF = ',Georgia,"Times New Roman",serif';

  function stack(name, serif) { return name ? name + (serif ? FALLBACK_SERIF : FALLBACK) : FALLBACK.slice(1); }

  // Load a preset's Google Font (if any) and set the two CSS variables.
  function applyFont(key, target) {
    var f = FONTS[key] || FONTS.classic;
    var el = target || document.documentElement;
    el.style.setProperty('--head', stack(f.head, key === 'executive'));
    el.style.setProperty('--body', stack(f.body));
    if (f.css && !document.querySelector('link[data-evl-font="' + key + '"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet'; l.setAttribute('data-evl-font', key);
      l.href = 'https://fonts.googleapis.com/css2?' + f.css + '&display=swap';
      document.head.appendChild(l);
    }
    return f;
  }

  /* ---------- tracking ---------- */
  // The order shipments move through. A shipment's "status" must be one of these.
  var STAGES = ['Booked', 'Cargo received', 'In transit', 'Arrived at destination', 'Customs clearance', 'Out for delivery', 'Delivered'];
  var MODES = ['Sea freight', 'Air freight', 'Road freight', 'Multimodal'];

  // "evl-abcde 12345" -> "EVLABCDE12345"
  function norm(n) { return String(n || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  // Compact SHA-256 fallback for browsers/contexts without crypto.subtle.
  function sha256js(str) {
    var m = unescape(encodeURIComponent(str)), l = m.length, w = [], i, j;
    var K = [], H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var primes = [], c = 2;
    while (primes.length < 64) { for (j = 2; j * j <= c; j++) if (c % j === 0) break; if (j * j > c) primes.push(c); c++; }
    for (i = 0; i < 64; i++) K[i] = (Math.pow(primes[i], 1 / 3) % 1) * 4294967296 | 0;
    var total = (((l + 8) >> 6) + 1) * 16;
    for (i = 0; i < total; i++) w[i] = 0;
    for (i = 0; i < l; i++) w[i >> 2] |= m.charCodeAt(i) << (24 - (i % 4) * 8);
    w[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    w[total - 1] = l * 8;
    var rr = function (x, n) { return (x >>> n) | (x << (32 - n)); };
    for (i = 0; i < w.length; i += 16) {
      var s = w.slice(i, i + 16), a = H.slice(), t;
      for (j = 16; j < 64; j++) {
        var s0 = rr(s[j - 15], 7) ^ rr(s[j - 15], 18) ^ (s[j - 15] >>> 3), s1 = rr(s[j - 2], 17) ^ rr(s[j - 2], 19) ^ (s[j - 2] >>> 10);
        s[j] = (s[j - 16] + s0 + s[j - 7] + s1) | 0;
      }
      for (j = 0; j < 64; j++) {
        var S1 = rr(a[4], 6) ^ rr(a[4], 11) ^ rr(a[4], 25), ch = (a[4] & a[5]) ^ (~a[4] & a[6]);
        var t1 = (a[7] + S1 + ch + K[j] + s[j]) | 0;
        var S0 = rr(a[0], 2) ^ rr(a[0], 13) ^ rr(a[0], 22), mj = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]);
        t = (S0 + mj) | 0;
        a = [(t1 + t) | 0, a[0], a[1], a[2], (a[3] + t1) | 0, a[4], a[5], a[6]];
      }
      for (j = 0; j < 8; j++) H[j] = (H[j] + a[j]) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }

  // Tracking numbers are never stored in the public file, only this hash of them.
  function hash(number) {
    var text = 'evl-track|' + norm(number);
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      }).catch(function () { return sha256js(text); });
    }
    return Promise.resolve(sha256js(text));
  }

  window.EVL = { FONTS: FONTS, applyFont: applyFont, STAGES: STAGES, MODES: MODES, norm: norm, hash: hash };
})();
