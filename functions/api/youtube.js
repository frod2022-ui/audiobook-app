export async function onRequest({ request, env }) {
  const q = new URL(request.url).searchParams.get('q');
  const h = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };
  if (!q) return new Response(JSON.stringify({ error: 'missing q', items: [] }), { status: 400, headers: h });
  try { return new Response(JSON.stringify({ items: await search(q, env.YOUTUBE_API_KEY) }), { headers: h }); }
  catch (e) { return new Response(JSON.stringify({ error: String(e.message || e), items: [] }), { status: 502, headers: h }); }
}
export async function search(q, key) {
  if (key) {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(q)}&key=${key}`);
    const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'api error');
    return j.items.map(i => ({ id: i.id.videoId, title: i.snippet.title, channel: i.snippet.channelTitle, thumbnail: i.snippet.thumbnails?.medium?.url, duration: null }));
  }
  const r = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=en`, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36', 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1' } });
  const html = await r.text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) throw new Error('could not parse YouTube results');
  const out = []; (function walk(o) {
    if (!o || typeof o !== 'object' || out.length >= 20) return;
    if (o.videoRenderer?.videoId) { const v = o.videoRenderer;
      out.push({ id: v.videoId, title: v.title?.runs?.map(x => x.text).join('') || '', channel: v.ownerText?.runs?.[0]?.text || '',
        thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`, duration: v.lengthText?.simpleText || null }); return; }
    for (const k in o) walk(o[k]);
  })(JSON.parse(m[1]));
  return out;
}
