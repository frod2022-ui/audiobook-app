export async function onRequest({ request, env }) {
  const u = new URL(request.url), q = u.searchParams.get('q'), long = u.searchParams.get('long') === '1';
  const h = { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=21600' };
  const cache = globalThis.caches?.default, ck = new Request(u.toString());
  if (cache) { const hit = await cache.match(ck); if (hit) return hit; }
  if (!q) return new Response(JSON.stringify({ error: 'missing q', items: [] }), { status: 400, headers: h });
  try { let items = await search(q, env.YOUTUBE_API_KEY, long);
    if (long) items = items.filter(i => !i.duration || secs(i.duration) >= 3600);
    const res = new Response(JSON.stringify({ items }), { headers: h });
    if (cache && items.length) await cache.put(ck, res.clone()); return res; }
  catch (e) { return new Response(JSON.stringify({ error: String(e.message || e), items: [] }), { status: 502, headers: h }); }
}
const secs = d => d.split(':').reduce((a, x) => a * 60 + +x, 0);
export async function search(q, key, long) {
  if (key) {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=25${long ? '&videoDuration=long' : ''}&q=${encodeURIComponent(q)}&key=${key}`);
    const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'api error');
    return j.items.map(i => ({ id: i.id.videoId, title: i.snippet.title, channel: i.snippet.channelTitle, thumbnail: i.snippet.thumbnails?.medium?.url, duration: null }));
  }
  const r = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=en${long ? '&sp=EgIYAg%3D%3D' : ''}`, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36', 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1' } });
  const html = await r.text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) throw new Error('could not parse YouTube results');
  const out = []; (function walk(o) {
    if (!o || typeof o !== 'object' || out.length >= 40) return;
    if (o.videoRenderer?.videoId) { const v = o.videoRenderer;
      out.push({ id: v.videoId, title: v.title?.runs?.map(x => x.text).join('') || '', channel: v.ownerText?.runs?.[0]?.text || '',
        thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`, duration: v.lengthText?.simpleText || null }); return; }
    for (const k in o) walk(o[k]);
  })(JSON.parse(m[1]));
  return out;
}
