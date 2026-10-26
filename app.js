const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let lib=JSON.parse(localStorage.lib||'[]'),pos=JSON.parse(localStorage.pos||'{}'),player,cur,lastYT=[];
const save=()=>{localStorage.lib=JSON.stringify(lib);renderLib()};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));
  $('#search').hidden=b.dataset.v!='search';$('#library').hidden=b.dataset.v!='library'});
async function yt(q){const r=await fetch('/api/youtube?q='+encodeURIComponent(q));const j=await r.json();if(j.error&&!j.items.length)throw Error(j.error);return j.items}
const ytCard=(v,btn)=>`<div class="card"><img src="${esc(v.thumbnail)}" loading="lazy"><div class="m"><div>${esc(v.title)}</div><div class="s">${esc(v.channel)} ${v.duration?'· '+esc(v.duration):''}</div></div>${btn}</div>`;
$('#f').onsubmit=async e=>{e.preventDefault();const q=$('#q').value.trim();if(!q)return;
  $('#books').textContent=$('#yt').textContent='Loading…';
  fetch('https://openlibrary.org/search.json?limit=12&fields=key,title,author_name,cover_i,first_publish_year&q='+encodeURIComponent(q)).then(r=>r.json()).then(j=>{
    window._books=j.docs;$('#books').innerHTML=j.docs.map((b,i)=>`<div class="card"><img src="${b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`:''}" loading="lazy"><div>${esc(b.title)}</div><div class="s">${esc((b.author_name||[]).join(', '))} ${b.first_publish_year||''}</div><button class="add" onclick="addBook(${i})">+ Add</button></div>`).join('')||'No books found.'
  }).catch(()=>$('#books').textContent='Open Library search failed.');
  yt(q+' audiobook').then(v=>{lastYT=v;$('#yt').innerHTML=v.map((x,i)=>ytCard(x,`<button class="add" onclick="addYT(${i})">+ Add</button>`)).join('')||'No videos.'})
  .catch(e=>$('#yt').textContent='YouTube search failed: '+e.message)};
function addItem(it){if(lib.some(x=>x.videoId==it.videoId))return alert('Already in library');lib.unshift(it);save();alert('Added: '+it.title)}
window.addYT=i=>{const v=lastYT[i];addItem({videoId:v.id,title:v.title,author:v.channel,thumb:v.thumbnail})};
window.addBook=async i=>{const b=_books[i],author=(b.author_name||[])[0]||'';$('#pickt').textContent='Pick audio for “'+b.title+'”';$('#picks').textContent='Searching YouTube…';pick.showModal();
  try{const v=await yt(`${b.title} ${author} audiobook`);window._picks=v;$('#picks').innerHTML=v.map((x,j)=>ytCard(x,`<button class="add" onclick="choose(${i},${j})">Use</button>`)).join('')||'No matches.'}
  catch(e){$('#picks').textContent='YouTube search failed: '+e.message}};
window.choose=(i,j)=>{const b=_books[i],v=_picks[j];pick.close();addItem({videoId:v.id,title:b.title,author:(b.author_name||[]).join(', '),thumb:b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`:v.thumbnail,ytTitle:v.title})};
function fmt(s){s=Math.floor(s||0);return`${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function renderLib(){$('#lib').innerHTML=lib.map((x,i)=>`<div class="card"><img src="${esc(x.thumb)}"><div class="m" onclick="play(${i})"><div>${esc(x.title)}</div><div class="s">${esc(x.author)}${pos[x.videoId]?' · resume '+fmt(pos[x.videoId]):''}</div></div><button onclick="play(${i})">▶</button><button onclick="rm(${i})">🗑</button></div>`).join('')||'<p class="s">Library is empty. Search and add a book.</p>'}
window.rm=i=>{if(confirm('Remove “'+lib[i].title+'”?')){lib.splice(i,1);save()}};
window.play=i=>{cur=lib[i];$('#player').hidden=false;$('#ptitle').textContent=cur.title;const start=Math.floor(pos[cur.videoId]||0);
  if(player)player.loadVideoById({videoId:cur.videoId,startSeconds:start});
  else player=new YT.Player('yt-frame',{videoId:cur.videoId,playerVars:{start,autoplay:1,playsinline:1},events:{onReady:e=>{e.target.setPlaybackRate(+$('#speed').value);e.target.playVideo()}}})};
$('#speed').onchange=()=>player?.setPlaybackRate(+$('#speed').value);
$('#close').onclick=()=>{persist();player?.stopVideo();$('#player').hidden=true;renderLib()};
function persist(){if(cur&&player?.getCurrentTime){pos[cur.videoId]=player.getCurrentTime();localStorage.pos=JSON.stringify(pos)}}
setInterval(persist,5000);addEventListener('pagehide',persist);renderLib();
