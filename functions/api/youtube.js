export async function onRequest({ request, env }) {
  const u = new URL(request.url), q = u.searchParams.get('q'), long = u.searchParams.get('long') === '1', c = u.searchParams.get('c'), min = Math.max(1, +u.searchParams.get('min') || 60);
  const h = { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=21600' };
  const cache = globalThis.caches?.default, ck = new Request(u.toString());
  if (cache) { const hit = await cache.match(ck); if (hit) return hit; }
  if (!q && !c) return new Response(JSON.stringify({ error: 'missing q', items: [] }), { status: 400, headers: h });
  try { let { items, next } = c ? await cont(c) : await searchPage(q, env.YOUTUBE_API_KEY, long && min >= 20);
    if (long) items = items.filter(i => !i.duration || secs(i.duration) >= min * 60);
    const res = new Response(JSON.stringify({ items, next: next || null }), { headers: h });
    if (cache && items.length) await cache.put(ck, res.clone()); return res; }
  catch (e) { return new Response(JSON.stringify({ error: String(e.message || e), items: [] }), { status: 502, headers: h }); }
}
const secs = d => d.split(':').reduce((a, x) => a * 60 + +x, 0);
export async function search(q, key, long) { return (await searchPage(q, key, long)).items; }
export async function searchPage(q, key, long) {
  if (key) {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=25${long ? '&videoDuration=long' : ''}&q=${encodeURIComponent(q)}&key=${key}`);
    const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || 'api error');
    return { items: j.items.map(i => ({ id: i.id.videoId, title: i.snippet.title, channel: i.snippet.channelTitle, thumbnail: i.snippet.thumbnails?.medium?.url, duration: null })) };
  }
  const r = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=en${long ? '&sp=EgIYAg%3D%3D' : ''}`, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36', 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1' } });
  const html = await r.text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) throw new Error('could not parse YouTube results');
  return extract(JSON.parse(m[1]));
}

function extract(data) {
  const items = []; let next = null;
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (o.videoRenderer?.videoId) { const v = o.videoRenderer;
      items.push({ id: v.videoId, title: v.title?.runs?.map(x => x.text).join('') || '', channel: v.ownerText?.runs?.[0]?.text || '',
        thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`, duration: v.lengthText?.simpleText || null }); return; }
    if (o.continuationCommand?.token) next = o.continuationCommand.token;
    for (const k in o) walk(o[k]);
  })(data);
  return { items, next };
}
async function cont(token) {
  const r = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', { method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36' },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: '2.20241020.00.00', hl: 'en', gl: 'US' } }, continuation: token }) });
  if (!r.ok) throw new Error('continuation failed ' + r.status);
  return extract(await r.json());
}
