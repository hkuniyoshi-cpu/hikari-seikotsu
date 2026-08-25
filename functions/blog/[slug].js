const GAS_URL       = 'https://script.google.com/macros/s/AKfycbxd94TXZuT-G3AUvUOyt_ZG_g9pLQLPK14B09iTngYGdnmmRKXOvsfwuZuqpAEUMW-Sxg/exec';
const SITE_URL      = 'https://hikari-seikotsu.search-mania.net';
const STORE_NAME    = 'ひかり整骨院';
const STORE_NAME_EN = 'HIKARI SEIKOTSUIN';
const THEME_INK     = '#282018';
const THEME_BG      = '#FFFCF9';
const THEME_ACCENT  = '#F07530';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtDate(s) {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[1] + '.' + m[2] + '.' + m[3] : String(s);
}

function driveImg(url) {
  if (!url) return '';
  const s = String(url).trim();
  const m1 = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return 'https://drive.google.com/thumbnail?id=' + m1[1] + '&sz=w1200';
  const m2 = s.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (m2) return 'https://lh3.googleusercontent.com/d/' + m2[1] + '=w1200';
  if (s.indexOf('drive.google.com/thumbnail') !== -1) {
    return s.replace(/([?&])sz=[^&]*/, '$1sz=w1200');
  }
  return s;
}

function findBySlug(items, slug) {
  if (!Array.isArray(items) || !slug) return null;
  return items.find(function(b) {
    if (!b) return false;
    if (b.url) {
      var m = b.url.match(/\/blog\/([^\/\?#]+)/);
      if (m && m[1] === slug) return true;
    }
    return b.date === slug;
  }) || null;
}

function render404(slug) {
  const html = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex">' +
    '<title>記事が見つかりません | ' + esc(STORE_NAME) + '</title>' +
    '<style>body{font-family:"Noto Sans JP",sans-serif;background:' + THEME_BG + ';color:' + THEME_INK + ';text-align:center;padding:120px 24px;margin:0}' +
    'h1{font-size:22px;margin-bottom:18px}p{color:#9A8C7E;margin-bottom:32px}' +
    'a{display:inline-block;padding:12px 28px;border:1.5px solid ' + THEME_ACCENT + ';color:' + THEME_ACCENT + ';text-decoration:none;border-radius:6px;font-size:13px;letter-spacing:.2em}</style>' +
    '</head><body><h1>記事が見つかりません</h1>' +
    '<p>指定された記事は削除されたか、URLが正しくない可能性があります。</p>' +
    '<a href="' + SITE_URL + '/">← トップへ戻る</a></body></html>';
  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function buildArticleHTML(item, slug) {
  let title = (item.title || '').trim();
  if (!title && item.body) title = String(item.body).split(/[。\n]/)[0].trim();
  if (!title && item.date) title = fmtDate(item.date) + ' の投稿';

  const desc = String(item.body || title).replace(/\s+/g, ' ').trim().slice(0, 160);
  const imgUrl = driveImg(item.image);
  const canonical = SITE_URL + '/blog/' + encodeURIComponent(slug) + '/';
  const ogImage = imgUrl || (SITE_URL + '/ogp.svg');
  const date = item.date || '';

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': title,
    'description': desc,
    'datePublished': date,
    'inLanguage': 'ja',
    'url': canonical,
    'image': imgUrl || undefined,
    'publisher': {
      '@type': 'MedicalBusiness',
      'name': STORE_NAME,
      'url': SITE_URL,
      'logo': { '@type': 'ImageObject', 'url': SITE_URL + '/logo.png' }
    },
    'author': { '@type': 'MedicalBusiness', 'name': STORE_NAME, 'url': SITE_URL },
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical }
  };

  return '<!DOCTYPE html><html lang="ja"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<meta name="theme-color" content="' + THEME_ACCENT + '">' +
    '<title>' + esc(title) + ' | ' + esc(STORE_NAME) + '</title>' +
    '<meta name="description" content="' + esc(desc) + '">' +
    '<meta http-equiv="content-language" content="ja">' +
    '<link rel="canonical" href="' + esc(canonical) + '">' +
    '<link rel="icon" type="image/png" href="/logo.png">' +
    '<meta property="og:type" content="article">' +
    '<meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(desc) + '">' +
    '<meta property="og:url" content="' + esc(canonical) + '">' +
    '<meta property="og:site_name" content="' + esc(STORE_NAME) + '">' +
    '<meta property="og:image" content="' + esc(ogImage) + '">' +
    '<meta property="og:locale" content="ja_JP">' +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(desc) + '">' +
    '<meta name="twitter:image" content="' + esc(ogImage) + '">' +
    '<script type="application/ld+json">' + JSON.stringify(jsonld) + '</' + 'script>' +
    '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'body{background:' + THEME_BG + ';color:' + THEME_INK + ';font-family:"Noto Sans JP","Hiragino Sans",sans-serif;line-height:1.85;-webkit-font-smoothing:antialiased}' +
    'header{background:' + THEME_ACCENT + ';padding:16px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,.2);position:sticky;top:0;z-index:10;box-shadow:0 2px 16px rgba(240,117,48,.3)}' +
    'header a{color:#fff;text-decoration:none;font-size:17px;letter-spacing:.24em;font-weight:600}' +
    '.wrap{max-width:720px;margin:60px auto;padding:0 24px 80px}' +
    '.card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 28px rgba(40,32,24,.08);border:1px solid rgba(240,117,48,.10)}' +
    '.card img{width:100%;display:block;max-height:480px;object-fit:cover}' +
    '.accent-bar{height:3px;background:linear-gradient(90deg,#FF9D5C,#D45F10)}' +
    '.card-body{padding:36px 38px 44px}' +
    '.date{font-size:11px;color:#9A8C7E;letter-spacing:.24em;display:block}' +
    'h1{margin:14px 0 28px;font-size:22px;line-height:1.7;font-weight:600;color:' + THEME_INK + ';letter-spacing:.04em}' +
    '.text{font-size:15px;line-height:2.05;white-space:pre-wrap;color:#5A4A3C;word-break:break-word}' +
    '.back-wrap{margin-top:52px;text-align:center}' +
    '.back-btn{display:inline-block;padding:14px 36px;border:1.5px solid ' + THEME_ACCENT + ';color:' + THEME_ACCENT + ';text-decoration:none;border-radius:6px;font-size:13px;letter-spacing:.24em;transition:all .35s ease}' +
    '.back-btn:hover{background:' + THEME_ACCENT + ';color:#fff}' +
    '.produced-by{text-align:center;margin-top:64px;font-size:10px;letter-spacing:.28em;color:rgba(40,32,24,.4);text-transform:uppercase}' +
    '.produced-by a{color:rgba(40,32,24,.6);text-decoration:none}' +
    '@media(max-width:600px){.wrap{margin:30px auto;padding:0 16px 60px}.card-body{padding:26px 22px 32px}h1{font-size:19px;margin:12px 0 22px}.text{font-size:14.5px;line-height:1.95}header a{font-size:14px;letter-spacing:.18em}.back-btn{padding:13px 28px;font-size:12px}}' +
    '</style></head><body>' +
    '<header><a href="' + SITE_URL + '/">' + esc(STORE_NAME) + '</a></header>' +
    '<div class="wrap"><article class="card">' +
    (imgUrl ? '<img src="' + esc(imgUrl) + '" alt="' + esc(title) + '" loading="eager">' : '') +
    '<div class="accent-bar"></div>' +
    '<div class="card-body">' +
    (date ? '<span class="date">' + esc(fmtDate(date)) + '</span>' : '') +
    (item.title && item.title.trim() ? '<h1>' + esc(item.title) + '</h1>' : '') +
    '<p class="text">' + esc(item.body || '') + '</p>' +
    '</div></article>' +
    '<div class="back-wrap"><a class="back-btn" href="' + SITE_URL + '/">← トップへ戻る</a></div>' +
    '<div class="produced-by">Produced by <a href="https://search-mania.net/" target="_blank" rel="noopener">SearchMania Inc.</a></div>' +
    '</div></body></html>';
}

export async function onRequest(context) {
  const slug = context.params.slug;
  if (!slug) return render404(slug);

  try {
    const upstream = await fetch(GAS_URL + '?blog_all=1', {
      redirect: 'follow',
      cf: { cacheTtl: 900, cacheEverything: true },
    });
    if (!upstream.ok) return render404(slug);
    const data = await upstream.json();
    const item = findBySlug(data && data.blog, slug);
    if (!item) return render404(slug);

    const html = buildArticleHTML(item, slug);
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900',
      },
    });
  } catch (err) {
    return render404(slug);
  }
}
