const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B='<span class="badge"><img src="/logo.svg" alt="">Wisdom</span>';
let lib=JSON.parse(localStorage.lib||'[]'),pos=JSON.parse(localStorage.pos||'{}'),player,cur;const reg={};let rid=0;
const CATS=[
['Classics',['classic literature full audiobook','jane austen pride and prejudice full audiobook','charles dickens full audiobook']],
['Self-Help',['self help full audiobook','atomic habits audiobook full','personal development full audiobook']],
['Philosophy & Stoicism',['stoicism full audiobook','meditations marcus aurelius full audiobook','seneca letters full audiobook']],
['Mystery & Detective',['sherlock holmes full audiobook','agatha christie full audiobook','mystery novel full audiobook']],
['Science Fiction',['science fiction full audiobook','isaac asimov full audiobook','h g wells full audiobook']],
['Fantasy',['fantasy full audiobook','fantasy novel complete audiobook','tolkien audiobook full']],
['Horror & Gothic',['horror full audiobook','edgar allan poe full audiobook','dracula full audiobook']],
['History',['history full audiobook','world history audiobook full','ancient rome full audiobook']],
['Biography',['biography full audiobook','autobiography full audiobook','benjamin franklin autobiography audiobook']],
['Business & Money',['business full audiobook','think and grow rich full audiobook','richest man in babylon full audiobook']],
['Psychology',['psychology full audiobook','human behavior audiobook full']],
['Spirituality',['spiritual full audiobook','the prophet kahlil gibran audiobook','tao te ching full audiobook']],
['Adventure',['adventure full audiobook','jules verne full audiobook','treasure island full audiobook']],
['Romance',['romance novel full audiobook','classic romance full audiobook']],
['Thriller',['thriller full audiobook','crime thriller full audiobook']],
['Children & Young Adult',['childrens classic full audiobook','alice in wonderland full audiobook','peter pan full audiobook']],
['Poetry',['poetry full audiobook','classic poems audiobook full']],
['Shakespeare & Drama',['shakespeare full audiobook','greek tragedy audiobook full']],
['Russian Classics',['dostoevsky full audiobook','tolstoy full audiobook','chekhov audiobook full']],
['American Classics',['mark twain full audiobook','great gatsby full audiobook','jack london full audiobook']],
['Epic & Mythology',['homer odyssey full audiobook','iliad full audiobook','greek mythology full audiobook']],
['Science & Nature',['science full audiobook','charles darwin audiobook full','cosmos audiobook']],
['Religion & Scripture',['bible full audiobook','quran english audiobook full','bhagavad gita full audiobook']],
['Leadership & Strategy',['art of war full audiobook','the prince machiavelli full audiobook','leadership audiobook full']],
['Health & Wellness',['health full audiobook','mindfulness audiobook full']],
['Short Stories',['short stories full audiobook','o henry short stories audiobook']],
['Sleep Stories',['audiobook for sleep full','calm bedtime stories audiobook long']],
['Westerns',['western novel full audiobook','zane grey audiobook full']],
['Economics',['economics full audiobook','wealth of nations audiobook']],
['Mystic & Occult',['kybalion full audiobook','hermetic philosophy audiobook']],
];
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('on'),1800)};
const save=()=>{localStorage.lib=JSON.stringify(lib);renderLib()};
function show(v){for(const s of['home','results','library'])$('#'+s).hidden=s!=v;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.v==(v=='results'?'home':v)));$('.searchbar').hidden=v=='library'}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>show(b.dataset.v));$('#clear').onclick=()=>show('home');
async function yt(q,long){const k='yt:'+(long?'L:':'')+q;try{const c=JSON.parse(localStorage[k]||'null');if(c&&Date.now()-c.t<216e5)return c.v}catch{}
  const r=await fetch('/api/youtube?'+(long?'long=1&':'')+'q='+encodeURIComponent(q));const j=await r.json();if(j.error&&!j.items.length)throw Error(j.error);
  try{localStorage[k]=JSON.stringify({t:Date.now(),v:j.items})}catch{}return j.items}
const secs=d=>d?d.split(':').reduce((a,x)=>a*60+ +x,0):0;
function card(it,{book}={}){const id=++rid;reg[id]=it;const inLib=it.videoId&&lib.some(x=>x.videoId==it.videoId);
  return`<div class="card"><div class="cover" ${it.videoId?`onclick="playIt(${id})"`:`onclick="addBook(${id})"`}>${B}${it.duration?`<span class="dur">${esc(it.duration)}</span>`:''}${it.videoId?'':''}</div>
  <div class="body"><div class="t">${esc(it.title)}</div><div class="s">${esc(it.author)}</div><div class="acts">${book?`<button class="add" onclick="addBook(${id})">+ Add</button>`:inLib?`<button disabled>✓ Saved</button>`:`<button class="add" onclick="addIt(${id},this)">+ Add</button>`}${it.videoId?`<button onclick="playIt(${id})">▶ Play</button>`:''}</div></div></div>`}
const NOISE=/\b(full[- ]length|full|complete|unabridged|abridged|audio ?books?|audio ?book|free|english|with text|subtitles?|high quality|hq|hd|narrated|read along|classic literature|collection|greatest)\b/gi;
function cleanTitle(t){t=String(t||'').replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F]/gu,'').replace(/\s*[\[(][^\])]*[\])]/g,m=>/audio|full|part|book|unabridged|chapter|\d/i.test(m)?'':m)
  .replace(/\b(part|pt|book|vol(ume)?|chapter|ch)\.?\s*\d+(\s*(of|\/)\s*\d+)?\b/gi,'').replace(NOISE,'').replace(/\s*[|#].*$/,'')
  .replace(/\s+([:,])/g,'$1').replace(/\s{2,}/g,' ').replace(/^[\s\-–—:|,.]+|[\s\-–—:|,.]+$/g,'').trim();return t}
function parseYT(raw,channel){let t=String(raw||'').replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F]/gu,'').split(/\s[|#]\s?/)[0];let title,author,m;
  if((m=t.match(/^(.+?)\s+by\s+([^\-–—:|(\[]+)/i))){title=m[1];author=m[2]}
  else if((m=t.match(/^([^\-–—:]+?)\s+[-–—:]\s+(.+)$/))){const L=cleanTitle(m[1]),R=cleanTitle(m[2]);
    const nm=/^[A-Z][\w.'’]*( [A-Z][\w.'’]*){1,3}$/;if(L&&R&&nm.test(R)&&!nm.test(L)){title=L;author=R}else if(L&&R&&nm.test(L)){author=L;title=R}else{title=m[1];author=''}}
  else title=t;
  title=cleanTitle(title)||cleanTitle(raw)||raw;author=cleanTitle(author||'').replace(/\b(read|narrated)\b.*$/i,'').trim()||channel||'';return{title,author}}
const vid=v=>{const p=parseYT(v.title,v.channel);return{videoId:v.id,title:p.title,author:p.author,ytTitle:v.title,thumb:`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,duration:v.duration}};
const OV=it=>`<div class="ov"><b>${esc(it.title)}</b><span>${esc(it.author||'')}</span></div>`;
// Discover
const seen=new Set();let next=0;
$('#chips').innerHTML=CATS.map((c,i)=>`<button onclick="goCat(${i})">${esc(c[0])}</button>`).join('');
async function loadCat(i){if(i>=CATS.length||$('#cat'+i))return;const [name,qs]=CATS[i];
  $('#rows').insertAdjacentHTML('beforeend',`<section id="cat${i}"><h2>${esc(name)}</h2><div class="shelf">${'<div class="skel"></div>'.repeat(5)}</div></section>`);
  const res=await Promise.allSettled(qs.map(q=>yt(q,true)));let items=[];
  for(const r of res)if(r.status=='fulfilled')for(const v of r.value)if(!seen.has(v.id)&&(!v.duration||secs(v.duration)>=3600)){seen.add(v.id);items.push(vid(v))}
  $(`#cat${i} .shelf`).innerHTML=items.map(x=>card(x)).join('')||'<p class="empty">Nothing found right now.</p>'}
async function loadMore(n=4){const end=Math.min(next+n,CATS.length);const ps=[];for(;next<end;next++)ps.push(loadCat(next));if(next>=CATS.length)$('#more').hidden=true;await Promise.all(ps)}
window.goCat=async i=>{document.querySelectorAll('.chips button').forEach((b,j)=>b.classList.toggle('on',i==j));show('home');if(!$('#cat'+i))await loadCat(i);$('#cat'+i).scrollIntoView({behavior:'smooth',block:'start'})};
$('#more').onclick=()=>loadMore();
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!$('#home').hidden&&next<CATS.length)loadMore()},{rootMargin:'600px'}).observe($('#more'));
// Search
let books=[];
$('#f').onsubmit=async e=>{e.preventDefault();const q=$('#q').value.trim();if(!q)return show('home');show('results');
  $('#books').innerHTML=$('#yt').innerHTML='<div class="skel"></div>'.repeat(4);
  fetch('https://openlibrary.org/search.json?limit=12&fields=key,title,author_name,cover_i,first_publish_year&q='+encodeURIComponent(q)).then(r=>r.json()).then(j=>{
    $('#books').innerHTML=j.docs.map(b=>card({title:b.title,author:[(b.author_name||[]).join(', '),b.first_publish_year].filter(Boolean).join(' · '),thumb:b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`:'',bookAuthor:(b.author_name||[])[0]||''},{book:1})).join('')||'<p class="empty">No books found.</p>'
  }).catch(()=>$('#books').innerHTML='<p class="empty">Open Library search failed.</p>');
  yt(q+' audiobook').then(v=>$('#yt').innerHTML=v.map(x=>card(vid(x))).join('')||'<p class="empty">No videos.</p>').catch(e=>$('#yt').innerHTML=`<p class="empty">YouTube search failed: ${esc(e.message)}</p>`)};
function addItem(it){if(lib.some(x=>x.videoId==it.videoId))return toast('Already in library');lib.unshift({videoId:it.videoId,title:it.title,author:it.author,ytTitle:it.ytTitle||'',thumb:it.thumb,duration:it.duration});save();toast('Added to library')}
window.addIt=(id,btn)=>{addItem(reg[id]);if(btn){btn.textContent='✓ Saved';btn.disabled=true;btn.classList.remove('add')}};
window.addBook=async id=>{const b=reg[id];$('#pickt').textContent='Pick a recording for “'+b.title+'”';$('#picks').innerHTML='<div class="skel"></div>'.repeat(3);pick.showModal();
  try{const v=await yt(`${b.title} ${b.bookAuthor} audiobook`);$('#picks').innerHTML=v.map(x=>{const it=vid(x);it.title=b.title;it.author=b.bookAuthor||it.author;if(b.thumb)it.thumb=b.thumb;it.ytTitle=x.title;const i=++rid;reg[i]=it;
    return`<div class="card"><div class="cover" onclick="choose(${i})">${B}${x.duration?`<span class="dur">${esc(x.duration)}</span>`:''}</div><div class="body"><div class="t">${esc(it.title)}</div><div class="s">${esc(it.author)}</div><div class="s">${esc(x.channel)}</div><div class="acts"><button class="add" onclick="choose(${i})">Use</button><button onclick="cur=null;playIt(${i})">▶ Preview</button></div></div></div>`}).join('')||'<p class="empty">No matches.</p>'}
  catch(e){$('#picks').innerHTML='<p class="empty">YouTube search failed: '+esc(e.message)+'</p>'}};
window.choose=i=>{pick.close();addItem(reg[i])};
// Library
const fmt=s=>{s=Math.floor(s||0);return`${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
function renderLib(){lib.forEach(x=>{if(x.ytTitle===undefined&&!x._c){const p=parseYT(x.title,x.author);x.title=p.title;x.author=p.author;x._c=1}});$('#lib').innerHTML=lib.map((x,i)=>{const id=++rid;reg[id]=x;return`<div class="card"><div class="cover" onclick="playIt(${id})">${B}${x.duration?`<span class="dur">${esc(x.duration)}</span>`:''}</div><div class="body"><div class="t">${esc(x.title)}</div><div class="s">${esc(x.author)}</div><div class="s">${pos[x.videoId]?'Resume at '+fmt(pos[x.videoId]):'Not started'}</div><div class="acts"><button class="add" onclick="playIt(${id})">▶ Play</button><button onclick="rm(${i})" aria-label="Remove">🗑</button></div></div></div>`}).join('')||'<p class="empty">Your library is empty. Discover or search, then tap + Add.</p>'}
window.rm=i=>{if(confirm('Remove “'+lib[i].title+'”?')){lib.splice(i,1);save()}};
// Player
window.playIt=id=>{persist();cur=reg[id];$('#player').hidden=false;$('#ptitle').textContent=cur.title;$('#pauthor').textContent=cur.author||'';const start=Math.floor(pos[cur.videoId]||0);
  if(player?.loadVideoById)player.loadVideoById({videoId:cur.videoId,startSeconds:start});
  else player=new YT.Player('yt-frame',{videoId:cur.videoId,playerVars:{start,autoplay:1,playsinline:1},events:{onReady:e=>{e.target.setPlaybackRate(+$('#speed').value);e.target.playVideo()}}})};
$('#speed').onchange=()=>player?.setPlaybackRate(+$('#speed').value);
$('#toggle').onclick=()=>{const o=$('#player').classList.toggle('open');$('#toggle').textContent=o?'▴':'▾'};
$('#close').onclick=()=>{persist();player?.stopVideo();$('#player').hidden=true;renderLib()};
function persist(){if(cur&&player?.getCurrentTime){const t=player.getCurrentTime();if(t>0){pos[cur.videoId]=t;localStorage.pos=JSON.stringify(pos)}$('#ptime').textContent=fmt(t)+(player.getDuration?' / '+fmt(player.getDuration()):'')}}
setInterval(persist,5000);addEventListener('pagehide',persist);renderLib();loadMore(6);
