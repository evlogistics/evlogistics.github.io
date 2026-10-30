#!/usr/bin/env python3
"""
Eagle Vision Logistics: search-engine build step.

Run from the site folder after you change content in data.js (or with admin.html):

    python3 _tools/prerender.py

What it does
  1. Copies the content from data.js into index.html as plain HTML, so search engines and
     social-media previews can read it without running JavaScript. (The page still
     refreshes the same content in the browser, so visitors always see the latest data.js.)
  2. Writes the page <title>, description, canonical link, social-share tags and the
     structured data (JSON-LD) from the values in data.js.
  3. Rebuilds the service pages in /services/, the 404 page, sitemap.xml and robots.txt.

Settings it reads from data.js ("site" section): url, seoTitle, seoDescription, city,
region, country, sameAs, plus the usual name, phone, email, address, hours, whatsapp.
Page wording for each service page lives in _tools/service-pages.json.
"""
import json, re, sys, urllib.parse, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = Path(__file__).resolve().parent

# ------------------------------------------------------------------ helpers (same rules as script.js)
def load_data():
    t = (ROOT / 'data.js').read_text(encoding='utf8')
    m = re.match(r'\s*window\.SITE\s*=\s*(\{.*\})\s*;\s*$', t, re.S)
    if not m:
        sys.exit('Could not read data.js')
    return json.loads(m.group(1))

def esc(s):
    return (str('' if s is None else s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('"', '&quot;').replace("'", '&#39;'))

def enc_uri(p):            # JavaScript encodeURI
    return urllib.parse.quote(str(p), safe="-_.!~*'();/?:@&=+$,#")

def enc_comp(p):           # JavaScript encodeURIComponent
    return urllib.parse.quote(str(p), safe="-_.!~*'()")

def src(p):
    return esc(enc_uri(p))

def paras(t):
    parts = [x.strip() for x in re.split(r'\n\s*\n', str(t or '')) if x.strip()]
    return ''.join('<p>' + esc(x) + '</p>' for x in parts)

js = (ROOT / 'script.js').read_text(encoding='utf8')
IC_BLOCK = re.search(r'var IC = \{(.*?)\n  \};', js, re.S).group(1)
IC = dict(re.findall(r"(\w+): '(.*?)'(?:,|\s*$)", IC_BLOCK, re.M))
VAL_ICON = dict(re.findall(r"(\w+): '(\w+)'", re.search(r'var VAL_ICON = \{(.*?)\};', js, re.S).group(1)))

def svg(name):
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[name] + '</svg>'

def val_icon(title):
    t = str(title or '').lower()
    k = next((x for x in VAL_ICON if x in t), None)
    return VAL_ICON[k] if k else 'diamond'

def fill(html, name, content):
    pat = re.compile(r'(<!--pr:%s-->)(.*?)(<!--/pr:%s-->)' % (name, name), re.S)
    if not pat.search(html):
        sys.exit('Marker missing in index.html: ' + name)
    return pat.sub(lambda m: m.group(1) + content + m.group(3), html)

def edit_open_tag(html, tag_id, fn):
    pat = re.compile(r'<([a-z0-9]+)([^>]*\bid="%s"[^>]*)>' % re.escape(tag_id))
    m = pat.search(html)
    if not m:
        sys.exit('Element not found in index.html: #' + tag_id)
    return html[:m.start()] + '<%s%s>' % (m.group(1), fn(m.group(2))) + html[m.end():]

def set_hidden(html, tag_id, hidden):
    def fn(attrs):
        attrs = re.sub(r'\s+hidden(?=\s|$)', '', attrs)
        return attrs + (' hidden' if hidden else '')
    return edit_open_tag(html, tag_id, fn)

# ------------------------------------------------------------------ data
D = load_data()
I, A, P = D.get('site', {}), D.get('about', {}), D.get('purpose', {})
L = lambda k: D[k] if isinstance(D.get(k), list) else []
name = I.get('name') or 'Eagle Vision Logistics'
base = (I.get('url') or '').rstrip('/')
if not base.startswith('http'):
    sys.exit('Set "url" in the site section of data.js, e.g. https://evlogistics.github.io')
phone, email, addr, hours = I.get('phone', ''), I.get('email', ''), I.get('address', ''), I.get('hours', '')
tel = 'tel:' + re.sub(r'[^\d+]', '', phone)
wa = re.sub(r'\D', '', I.get('whatsapp', ''))
map_url = ('https://www.google.com/maps/search/?api=1&query=' + enc_comp(addr + ', Ghana')) if addr else ''
seo_title = I.get('seoTitle') or (name + ' | Freight Forwarding in Ghana')
seo_desc = I.get('seoDescription') or ''
services = L('services')
pages = json.loads((TOOLS / 'service-pages.json').read_text(encoding='utf8'))
lastmod = sys.argv[sys.argv.index('--lastmod') + 1] if '--lastmod' in sys.argv else datetime.date.today().isoformat()

def page_url(slug):
    return base + '/services/' + slug + '/'

# ------------------------------------------------------------------ fragments shared by home, service pages and 404
def wa_link(text):
    return 'https://wa.me/' + wa + '?text=' + enc_comp(text)

def top_addr():
    return '<li>' + svg('pin') + '<span>' + esc(addr) + '</span></li>' if addr else ''

def top_contact():
    return ((('<li>' + svg('phone') + '<a href="' + esc(tel) + '">' + esc(phone) + '</a></li>') if phone else '') +
            (('<li>' + svg('mail') + '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a></li>') if email else ''))

def contact_rows():
    rows = []
    if addr: rows.append(('pin', 'Address', '<a href="' + esc(map_url) + '" target="_blank" rel="noopener">' + esc(addr) + '</a>'))
    if phone: rows.append(('phone', 'Phone', '<a href="' + esc(tel) + '">' + esc(phone) + '</a>'))
    if email: rows.append(('mail', 'Email', '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a>'))
    if hours: rows.append(('clock', 'Opening hours', '<span>' + esc(re.sub(r'\s*\|\s*', ' \u00b7 ', hours)) + '</span>'))
    return ''.join('<li><span class="ico">' + svg(i) + '</span><div><small>' + l + '</small>' + v + '</div></li>' for i, l, v in rows)

def contact_actions():
    return ((('<a class="btn sm" target="_blank" rel="noopener" href="' + wa_link('Hello ' + name + ', I would like a quote.') + '">Chat on WhatsApp</a>') if wa else '') +
            (('<a class="btn sm ghost-ink" target="_blank" rel="noopener" href="' + esc(map_url) + '">Open in Maps</a>') if map_url else ''))

# ------------------------------------------------------------------ home page sections (match script.js exactly)
def hero_html():
    heroes = L('hero')
    out = []
    for k, h in enumerate(heroes):
        tag = 'h1' if k == 0 else 'h2'
        second = '<a class="btn ghost" href="#contact">Get a quote</a>' if (h.get('link') and h['link'] != '#contact') else ''
        img = ('<img src="' + src(h['image']) + '" alt="" decoding="async"' + (' fetchpriority="high"' if k == 0 else ' fetchpriority="low"') + '>') if h.get('image') else ''
        out.append('<div class="slide' + (' on' if k == 0 else '') + '" role="group" aria-roledescription="slide" aria-label="Slide %d of %d">' % (k + 1, len(heroes)) +
                   img + '<div class="wrap"><' + tag + '>' + esc(h.get('title')) + '</' + tag + '><p>' + esc(h.get('text')) + '</p>' +
                   '<div class="actions">' + (('<a class="btn" href="' + esc(h.get('link') or '#contact') + '">' + esc(h['btn']) + '</a>') if h.get('btn') else '') + second + '</div></div></div>')
    return '<div id="slides" data-pr="1">' + ''.join(out) + '</div>'

def services_html():
    n = len(services); r = n % 3; out = []
    for i, s in enumerate(services):
        cls = ''
        if r == 2 and i >= n - 2: cls = ' w3'
        elif r == 1 and i == n - 1: cls = ' w6'
        link = bool(s.get('slug')); tag = 'a' if link else 'button'
        img = ('<img src="' + src(s['image']) + '" alt="' + esc(s.get('imageAlt') or '') + '" loading="lazy" decoding="async">') if s.get('image') else ''
        out.append('<' + tag + ((' href="services/' + esc(s['slug']) + '/"') if link else ' type="button"') + ' class="svc' + cls + '" data-i="%d" aria-haspopup="dialog">' % i +
                   '<div class="ph">' + img + '</div><div class="body"><h3>' + esc(s.get('title')) + '</h3><p>' + esc(s.get('short')) + '</p><span class="more">Learn more ' + svg('arrow') + '</span></div></' + tag + '>')
    return ''.join(out)

def about_img_html():
    if A.get('image'):
        return ('<figure class="about-img" id="aImg"><img src="' + src(A['image']) + '" alt="Cargo handlers checking packed goods at a container" loading="lazy" decoding="async"></figure>')
    return '<figure class="about-img" id="aImg" hidden></figure>'

def why_html():
    why = [x.strip() for x in str(A.get('why') or '').split('\n') if x.strip()]
    return ''.join('<li>' + svg('check') + '<span>' + esc(x) + '</span></li>' for x in why)

def purpose_html():
    pur = [x for x in (('Our mission', P.get('mission'), 'target'), ('Our vision', P.get('vision'), 'eye')) if x[1]]
    return ''.join('<article><div class="ttl"><span class="ico">' + svg(i) + '</span><h2>' + l + '</h2></div><p>' + esc(t) + '</p></article>' for l, t, i in pur)

def values_html():
    return ''.join('<div class="vcard"><span class="num" aria-hidden="true">' + ('0' if i < 9 else '') + str(i + 1) + '</span><span class="ico">' + svg(val_icon(v.get('title'))) +
                   '</span><h3>' + esc(v.get('title')) + '</h3><p>' + esc(v.get('text')) + '</p></div>' for i, v in enumerate(L('values')))

def gallery_html():
    out = []
    for i, g in enumerate(L('gallery')):
        alt = g.get('alt') or ('Logistics operation photo %d' % (i + 1))
        out.append('<button type="button" class="shot" data-i="%d" aria-label="Enlarge photo: ' % i + esc(alt) + '"><img src="' + src(g['image']) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"></button>')
    return ''.join(out)

def team_html():
    return ''.join('<div>' + (('<img src="' + src(m['image']) + '" alt="' + esc(m.get('name')) + '" loading="lazy" decoding="async">') if m.get('image') else '<div class="noimg"></div>') +
                   '<h3>' + esc(m.get('name')) + '</h3><p>' + esc(m.get('role')) + '</p></div>' for m in L('team'))

def quote_html():
    q = D.get('quote') or {}
    return ('&ldquo;' + esc(q.get('text')) + '&rdquo;<cite>' + esc(q.get('by')) + '</cite>') if q.get('text') else ''

def logos_html():
    return ''.join('<div>' + (('<img src="' + src(p['image']) + '" alt="Partner logo" loading="lazy">') if p.get('image') else '') + '</div>' for p in L('partners'))

def footer_links_html():
    t = [('#track', 'Track shipment', True), ('#services', 'Services', bool(services)), ('#about', 'About us', bool(A.get('title') or A.get('p1') or A.get('p2'))),
         ('#values', 'Core values', bool(L('values'))), ('#gallery', 'Gallery', bool(L('gallery'))), ('#contact', 'Contact', True)]
    return ''.join('<li><a href="' + h + '">' + l + '</a></li>' for h, l, ok in t if ok)

def footer_services_html():
    return ''.join('<li><a href="services/' + esc(s['slug']) + '/">' + esc(s['title']) + '</a></li>' for s in services if s.get('slug'))

def footer_contact_html():
    return (('<li>' + svg('pin') + '<span>' + esc(addr) + '</span></li>' if addr else '') +
            ('<li>' + svg('phone') + '<a href="' + esc(tel) + '">' + esc(phone) + '</a></li>' if phone else '') +
            ('<li>' + svg('mail') + '<a href="mailto:' + esc(email) + '">' + esc(email) + '</a></li>' if email else ''))

# ------------------------------------------------------------------ structured data + head tags
def opening_hours():
    m = re.search(r'(\w+)\s*[\u2013-]\s*(\w+):\s*(\d{1,2}):(\d{2})\s*([AP]M)\s*[\u2013-]\s*(\d{1,2}):(\d{2})\s*([AP]M)', hours or '', re.I)
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if not m or m.group(1).title() not in days or m.group(2).title() not in days:
        return []
    def h24(h, mi, ap):
        h = int(h) % 12 + (12 if ap.upper() == 'PM' else 0)
        return '%02d:%s' % (h, mi)
    a, b = days.index(m.group(1).title()), days.index(m.group(2).title())
    return [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': days[a:b + 1], 'opens': h24(m.group(3), m.group(4), m.group(5)), 'closes': h24(m.group(6), m.group(7), m.group(8))}]

def org_node():
    n = {'@type': 'LocalBusiness', '@id': base + '/#organization', 'name': name, 'url': base + '/',
         'logo': {'@type': 'ImageObject', 'url': base + '/logo-mark.png', 'width': 240, 'height': 225},
         'image': [base + '/og-image.jpg'], 'description': seo_desc}
    if phone: n['telephone'] = phone
    if email: n['email'] = email
    if addr:
        n['address'] = {'@type': 'PostalAddress', 'streetAddress': re.sub(r',\s*' + re.escape(I.get('city', '')) + r'\b', '', addr, count=1) if I.get('city') else addr,
                        'addressLocality': I.get('city') or '', 'addressRegion': I.get('region') or '', 'addressCountry': I.get('country') or 'GH'}
        if not I.get('city'): n['address'].pop('addressLocality'); n['address'].pop('addressRegion')
    n['areaServed'] = ['Ghana', 'West Africa']
    oh = opening_hours()
    if oh: n['openingHoursSpecification'] = oh
    if phone: n['contactPoint'] = [{'@type': 'ContactPoint', 'telephone': phone, 'contactType': 'customer service', 'areaServed': 'GH', 'availableLanguage': 'English'}]
    if I.get('sameAs'): n['sameAs'] = I['sameAs']
    items = [{'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': s['title'], **({'url': page_url(s['slug'])} if s.get('slug') else {})}} for s in services]
    if items: n['hasOfferCatalog'] = {'@type': 'OfferCatalog', 'name': 'Freight and logistics services', 'itemListElement': items}
    return n

def ld_script(graph):
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return '<script type="application/ld+json">' + data + '</script>'

def social_tags(title, desc, url):
    return ('<meta property="og:site_name" content="' + esc(name) + '">\n<meta property="og:locale" content="en_GB">\n<meta property="og:type" content="website">\n'
            '<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:url" content="' + esc(url) + '">\n'
            '<meta property="og:image" content="' + base + '/og-image.jpg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            '<meta property="og:image:alt" content="' + esc(name) + ': container ship, port cranes and a freight truck">\n'
            '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="' + esc(title) + '">\n'
            '<meta name="twitter:description" content="' + esc(desc) + '">\n<meta name="twitter:image" content="' + base + '/og-image.jpg">')

def home_head():
    heroes = L('hero')
    pre = ('<link rel="preload" as="image" href="' + src(heroes[0]['image']) + '" fetchpriority="high">\n') if heroes and heroes[0].get('image') else ''
    graph = [org_node(), {'@type': 'WebSite', '@id': base + '/#website', 'url': base + '/', 'name': name, 'inLanguage': 'en', 'publisher': {'@id': base + '/#organization'}}]
    return ('\n<title>' + esc(seo_title) + '</title>\n<meta name="description" content="' + esc(seo_desc) + '">\n'
            '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">\n<link rel="canonical" href="' + base + '/">\n' +
            social_tags(seo_title, seo_desc, base + '/') + '\n' + pre + ld_script(graph) + '\n')

# ------------------------------------------------------------------ build index.html
def build_index():
    h = (ROOT / 'index.html').read_text(encoding='utf8')
    h = fill(h, 'head', home_head())
    h = fill(h, 'topAddr', top_addr()); h = fill(h, 'topContact', top_contact())
    h = fill(h, 'slides', hero_html())
    h = fill(h, 'svcs', services_html())
    h = fill(h, 'aT', esc(A.get('title'))); h = fill(h, 'a1', paras(A.get('p1'))); h = fill(h, 'a2', paras(A.get('p2')))
    h = fill(h, 'aImg', about_img_html()); h = fill(h, 'why', why_html())
    h = fill(h, 'purposeGrid', purpose_html()); h = fill(h, 'vals', values_html())
    h = fill(h, 'gal', gallery_html()); h = fill(h, 'tm', team_html())
    h = fill(h, 'q', quote_html()); h = fill(h, 'logos', logos_html())
    h = fill(h, 'cRows', contact_rows()); h = fill(h, 'cActions', contact_actions())
    h = fill(h, 'fLinks', footer_links_html()); h = fill(h, 'fServices', footer_services_html()); h = fill(h, 'fContact', footer_contact_html())
    h = fill(h, 'nm', esc(name)); h = fill(h, 'yr', str(datetime.date.today().year))
    # sections that stay hidden until they have content
    q = D.get('quote') or {}
    h = set_hidden(h, 'team', not L('team')); h = set_hidden(h, 'navTeam', not L('team'))
    h = set_hidden(h, 'testi', not (q.get('text') or L('partners')))
    h = set_hidden(h, 'bro', not I.get('brochure'))
    if I.get('brochure'):
        h = edit_open_tag(h, 'broL', lambda a: re.sub(r'\s+href="[^"]*"', '', a) + ' href="' + esc(I['brochure']) + '"')
    if wa:
        h = edit_open_tag(h, 'wa', lambda a: re.sub(r'\s+(hidden|href="[^"]*")(?=\s|$)', '', a) + ' href="' + esc(wa_link('Hello ' + name + ', I would like a quote.')) + '"')
    (ROOT / 'index.html').write_text(h, encoding='utf8')
    return h

# ------------------------------------------------------------------ service pages and 404
THEME_JS = ("<script>\n(function () {\n  var theme = null;\n  try { theme = localStorage.getItem('evl-theme'); } catch (e) {}\n"
            "  if (theme !== 'dark' && theme !== 'light') {\n    theme = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';\n  }\n"
            "  document.documentElement.setAttribute('data-theme', theme);\n  var m = document.querySelector('meta[name=\"theme-color\"]');\n"
            "  if (m) m.setAttribute('content', theme === 'dark' ? '#0a1424' : '#0b2248');\n})();\n</script>")
FONT_JS = ("<script>\n(function () {\n  var q = (location.search.match(/[?&]font=([a-z]+)/) || [])[1];\n"
           "  var key = q || ((window.SITE || {}).site || {}).font || 'classic';\n  if (window.EVL) window.EVL.applyFont(key);\n})();\n</script>")

def rebase(block, prefix):
    block = re.sub(r'href="(#[^"]*)"', lambda m: 'href="' + prefix + m.group(1) + '"', block)
    block = block.replace('href="' + prefix + '#home"', 'href="' + prefix + '"')
    block = block.replace('href="services/', 'href="' + prefix + 'services/')
    block = block.replace('src="logo-mark.png"', 'src="' + prefix + 'logo-mark.png"')
    return block

def chrome(index_html, prefix):
    top = re.search(r'<div class="topbar" id="topbar">.*?</header>', index_html, re.S).group(0)
    foot = re.search(r'<footer class="band footer">.*?</footer>', index_html, re.S).group(0)
    wa_el = re.search(r'<a class="wa" id="wa".*?</a>', index_html, re.S)
    return rebase(top, prefix), rebase(foot, prefix), (wa_el.group(0) if wa_el else '')

def doc(title, desc, canonical, prefix, body, robots, extra_head=''):
    return ('<!DOCTYPE html>\n<html lang="en" data-theme="light">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>' + esc(title) + '</title>\n<meta name="description" content="' + esc(desc) + '">\n<meta name="robots" content="' + robots + '">\n' +
            (('<link rel="canonical" href="' + canonical + '">\n') if canonical else '') +
            '<meta name="color-scheme" content="light dark">\n<meta name="theme-color" content="#0b2248">\n' + extra_head +
            '<link rel="icon" type="image/png" href="' + prefix + 'favicon.png">\n<link rel="apple-touch-icon" href="' + prefix + 'apple-touch-icon.png">\n' + THEME_JS + '\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="' + prefix + 'styles.css">\n<script src="' + prefix + 'data.js"></script>\n<script src="' + prefix + 'shared.js"></script>\n' + FONT_JS + '\n</head>\n<body>\n'
            '<a class="skip" href="#main">Skip to content</a>\n' + body + '\n<script src="' + prefix + 'page.js"></script>\n</body>\n</html>\n')

STEPS = [('Tell us about your shipment', 'Send the cargo details through the quote form, WhatsApp, phone or email.'),
         ('We confirm the plan', 'We reply with a proposed plan and a quote.'),
         ('We coordinate the work', 'Bookings, documents and handling are coordinated with authorised carriers and service providers.'),
         ('You follow progress', 'Use your tracking number on our website to see the status and updates for your shipment.')]

def build_service_pages(index_html):
    top, foot, wa_el = chrome(index_html, '../../')
    by_slug = {s['slug']: s for s in services if s.get('slug')}
    try:
        from PIL import Image
    except Exception:
        Image = None
    for slug, c in pages.items():
        s = by_slug.get(slug)
        if not s:
            print('  skipped (no matching service in data.js):', slug); continue
        url = page_url(slug)
        cta_label = c.get('cta_label', 'Request a quote'); cta_href = '../../' + c.get('cta_href', '#contact')
        wa_url = wa_link('Hello ' + name + ', I would like a quote for ' + s['title'] + '.')
        dims = ''
        if Image and s.get('image') and (ROOT / s['image']).exists():
            w, h = Image.open(ROOT / s['image']).size; dims = ' width="%d" height="%d"' % (w, h)
        fig = ('<figure><img src="../../' + src(s['image']) + '" alt="' + esc(s.get('imageAlt') or s['title']) + '"' + dims + ' loading="lazy" decoding="async"></figure>') if s.get('image') else ''
        others = ''.join('<a href="../' + esc(o['slug']) + '/">' + esc(o['title']) + '<small>' + esc(o.get('short')) + '</small></a>' for o in services if o.get('slug') and o['slug'] != slug)
        main = (
            '<main id="main">\n<section class="band tight page-head"><div class="wrap">\n'
            '<div class="crumbs" role="navigation" aria-label="Breadcrumb"><ol><li><a href="../../">Home</a></li><li aria-current="page">' + esc(s['title']) + '</li></ol></div>\n'
            '<h1>' + esc(c['h1']) + '</h1>\n<p class="lead">' + esc(c['lead']) + '</p>\n'
            '<div class="actions"><a class="btn" href="' + cta_href + '">' + esc(cta_label) + '</a>' +
            (('<a class="btn ghost" target="_blank" rel="noopener" href="' + esc(wa_url) + '">Chat on WhatsApp</a>') if wa else '') + '</div>\n</div></section>\n'
            '<section class="tint"><div class="wrap svc-layout">\n<article class="prose">\n<h2>About this service</h2>\n' + ''.join('<p>' + esc(p) + '</p>\n' for p in c['about']) + fig + '\n'
            '<h2>What it covers</h2>\n<ul class="ticks">' + ''.join('<li>' + svg('check') + '<span>' + esc(x) + '</span></li>' for x in c['covers']) + '</ul>\n'
            '<h2>' + esc(c['needs_title']) + '</h2>\n<ul class="ticks">' + ''.join('<li>' + svg('check') + '<span>' + esc(x) + '</span></li>' for x in c['needs']) + '</ul>\n'
            '<h2>How it works</h2>\n<ol class="steps">' + ''.join('<li><div><b>' + esc(t) + '</b><span>' + esc(d) + '</span></div></li>' for t, d in STEPS) + '</ol>\n</article>\n'
            '<aside class="panel info aside-sticky" aria-label="Contact details"><h3>Talk to us</h3><ul class="rows">' + contact_rows() + '</ul>'
            '<div class="info-actions"><a class="btn sm" href="../../#contact">Request a quote</a>' +
            (('<a class="btn sm ghost-ink" target="_blank" rel="noopener" href="' + esc(wa_url) + '">WhatsApp us</a>') if wa else '') + '</div></aside>\n</div></section>\n'
            '<section class="bg-grid"><div class="wrap"><div class="head"><h2>Our other services</h2></div><div class="rel">' + others + '</div></div></section>\n</main>')
        graph = [{'@type': 'Service', '@id': url + '#service', 'name': s['title'], 'description': c['description'], 'url': url, 'areaServed': ['Ghana', 'West Africa'],
                  'provider': {'@id': base + '/#organization'}},
                 {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': base + '/'},
                                                                  {'@type': 'ListItem', 'position': 2, 'name': s['title'], 'item': url}]},
                 {k: v for k, v in org_node().items()}]
        extra = social_tags(c['title'], c['description'], url) + '\n' + ld_script(graph) + '\n'
        out = ROOT / 'services' / slug; out.mkdir(parents=True, exist_ok=True)
        (out / 'index.html').write_text(doc(c['title'], c['description'], url, '../../', top + '\n<main-placeholder>\n' + foot + '\n' + wa_el, 'index, follow, max-image-preview:large', extra).replace('<main-placeholder>', main), encoding='utf8')
        flag = '' if len(c['title']) <= 60 else '  (title is %d characters, 60 or fewer is best)' % len(c['title'])
        print('  services/%s/index.html%s' % (slug, flag))

def build_404(index_html):
    top, foot, wa_el = chrome(index_html, '/')
    others = ''.join('<a href="/services/' + esc(s['slug']) + '/">' + esc(s['title']) + '<small>' + esc(s.get('short')) + '</small></a>' for s in services if s.get('slug'))
    main = ('<main id="main">\n<section class="band tight page-head"><div class="wrap">\n<h1>Page not found</h1>\n'
            '<p class="lead">The page you were looking for is not here. It may have moved, or the address may be mistyped.</p>\n'
            '<div class="actions"><a class="btn" href="/">Go to the home page</a><a class="btn ghost" href="/#contact">Get a quote</a></div>\n</div></section>\n'
            '<section class="bg-grid"><div class="wrap"><div class="head"><h2>Our services</h2></div><div class="rel">' + others + '</div></div></section>\n</main>')
    (ROOT / '404.html').write_text(doc('Page not found | ' + name, 'This page could not be found.', '', '/', top + '\n' + main + '\n' + foot + '\n' + wa_el, 'noindex'), encoding='utf8')
    print('  404.html')

def build_sitemap_and_robots():
    urls = [(base + '/', '1.0')] + [(page_url(s['slug']), '0.8') for s in services if s.get('slug') and s['slug'] in pages]
    body = ''.join('  <url>\n    <loc>' + u + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' + p + '</priority>\n  </url>\n' for u, p in urls)
    (ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '</urlset>\n', encoding='utf8')
    (ROOT / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + base + '/sitemap.xml\n', encoding='utf8')
    print('  sitemap.xml (%d addresses), robots.txt' % len(urls))

if __name__ == '__main__':
    print('Building for', base)
    if len(seo_title) > 60: print('  note: seoTitle is %d characters (60 or fewer is best)' % len(seo_title))
    if not 110 <= len(seo_desc) <= 160: print('  note: seoDescription is %d characters (110 to 160 is best)' % len(seo_desc))
    idx = build_index(); print('  index.html')
    build_service_pages(idx); build_404(idx); build_sitemap_and_robots()
    print('Done.')
