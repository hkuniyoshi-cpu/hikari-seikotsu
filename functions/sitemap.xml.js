const GAS_URL = 'https://script.google.com/macros/s/AKfycbxd94TXZuT-G3AUvUOyt_ZG_g9pLQLPK14B09iTngYGdnmmRKXOvsfwuZuqpAEUMW-Sxg/exec';

export async function onRequest(context) {
  try {
    // v2: cache-bust after GAS _buildSitemap deploy (2026-08-28)
    const upstream = await fetch(GAS_URL + '?sitemap=1&v=2', {
      redirect: 'follow',
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!upstream.ok) {
      return new Response('<!-- upstream error: ' + upstream.status + ' -->', {
        status: 502,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }
    const xml = await upstream.text();
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (err) {
    return new Response('<!-- sitemap fetch failed: ' + (err && err.message || err) + ' -->', {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
