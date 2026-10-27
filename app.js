const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B='<span class="badge"><img src="/logo.svg" alt="">Wisdom</span>';
let lib=JSON.parse(localStorage.lib||'[]'),pos=JSON.parse(localStorage.pos||'{}'),player,cur;const reg={};let rid=0;
const CATS=[
['✨ Metaphysical',["metaphysical full audiobook", "law of attraction full audiobook", "neville goddard full audiobook", "napoleon hill full audiobook", "florence scovel shinn full audiobook", "emmet fox full audiobook", "ernest holmes science of mind audiobook", "wallace wattles full audiobook", "joseph murphy power of your subconscious mind audiobook", "edgar cayce full audiobook", "seth speaks jane roberts audiobook", "the kybalion full audiobook", "hermetic teachings full audiobook", "new thought full audiobook", "theosophy full audiobook", "eckhart tolle full audiobook", "manifestation full audiobook", "abraham hicks full audiobook", "mysticism full audiobook", "esoteric full audiobook", "rosicrucian full audiobook", "spiritual awakening full audiobook"]],
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
function show(v){if(v=='allv'&&!aStarted){aStarted=true;aStep()}for(const s of['home','results','library','allv'])$('#'+s).hidden=s!=v;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.v==(v=='results'?'home':v)));$('.searchbar').hidden=v=='library'}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>show(b.dataset.v));$('#clear').onclick=()=>show('home');
async function ytPage(q,long,c){const k='yp:'+(long?'L:':'')+(c||q);try{const x=JSON.parse(localStorage[k]||'null');if(x&&Date.now()-x.t<216e5)return x.v}catch{}
  const r=await fetch('/api/youtube?'+(long?'long=1&':'')+(c?'c='+encodeURIComponent(c):'q='+encodeURIComponent(q)));const j=await r.json();if(j.error&&!j.items.length)throw Error(j.error);
  const v={items:j.items,next:j.next};if(!c)try{localStorage[k]=JSON.stringify({t:Date.now(),v})}catch{}return v}
async function yt(q,long){const k='yt:'+(long?'L:':'')+q;try{const c=JSON.parse(localStorage[k]||'null');if(c&&Date.now()-c.t<216e5)return c.v}catch{}
  const r=await fetch('/api/youtube?'+(long?'long=1&':'')+'q='+encodeURIComponent(q));const j=await r.json();if(j.error&&!j.items.length)throw Error(j.error);
  try{localStorage[k]=JSON.stringify({t:Date.now(),v:j.items})}catch{}return j.items}
const secs=d=>d?d.split(':').reduce((a,x)=>a*60+ +x,0):0;
function card(it,{book}={}){const id=++rid;reg[id]=it;const inLib=it.videoId&&lib.some(x=>x.videoId==it.videoId);
  return`<div class="card"><div class="cover" ${it.videoId?`onclick="playIt(${id})"`:`onclick="addBook(${id})"`}>${B}${it.duration?`<span class="dur">${esc(it.duration)}</span>`:''}${it.videoId?'':''}</div>
  <div class="body"><div class="t">${esc(it.title)}</div>${it.sub?`<div class="sub">${esc(it.sub)}</div>`:''}<div class="s">${esc(it.author)}</div><div class="acts">${book?`<button class="add" onclick="addBook(${id})">+ Add</button>`:inLib?`<button disabled>✓ Saved</button>`:`<button class="add" onclick="addIt(${id},this)">+ Add</button>`}${it.videoId?`<button onclick="playIt(${id})">▶ Play</button>`:''}</div></div></div>`}
const NOISE=/\b(full[- ]length|full|complete|unabridged|abridged|audio ?books?|audio ?book|free|english|with text|subtitles?|high quality|hq|hd|narrated|read along|classic literature|collection|greatest)\b/gi;
function cleanTitle(t){t=String(t||'').replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F]/gu,'').replace(/\s*[\[(][^\])]*[\])]/g,m=>/audio|full|part|book|unabridged|chapter|\d/i.test(m)?'':m)
  .replace(/\b(part|pt|book|vol(ume)?|chapter|ch)\.?\s*\d+(\s*(of|\/)\s*\d+)?\b/gi,'').replace(NOISE,'').replace(/\s*[|#].*$/,'')
  .replace(/\s+([:,])/g,'$1').replace(/\s{2,}/g,' ').replace(/^[\s\-–—:|,.]+|[\s\-–—:|,.]+$/g,'').trim();return t}
function splitSub(t){const m=String(t||'').match(/^(.{2,}?)\s*(?::|\s[-–—]\s)\s*(.{2,})$/);return m?{title:m[1].trim(),sub:cleanTitle(m[2])}:{title:t,sub:''}}
function parseYT(raw,channel){let t=String(raw||'').replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F]/gu,'').split(/\s[|#]\s?/)[0];let title,author,m;
  if((m=t.match(/^(.+?)\s+by\s+([^\-–—:|(\[]+)/i))){title=m[1];author=m[2]}
  else if((m=t.match(/^([^\-–—:]+?)\s+[-–—:]\s+(.+)$/))){const L=cleanTitle(m[1]),R=cleanTitle(m[2]);
    const nm=/^[A-Z][\w.'’]*( [A-Z][\w.'’]*){1,3}$/;if(L&&R&&nm.test(R)&&!nm.test(L)){title=L;author=R}else if(L&&R&&nm.test(L)){author=L;title=R}else{title=m[1];author=''}}
  else title=t;
  title=cleanTitle(title)||cleanTitle(raw)||raw;let sub='';({title,sub}=splitSub(title));author=cleanTitle(author||'').replace(/\b(read|narrated)\b.*$/i,'').trim()||channel||'';return{title,sub,author}}
const vid=v=>{const p=parseYT(v.title,v.channel);return{videoId:v.id,title:p.title,sub:p.sub,author:p.author,ytTitle:v.title,thumb:`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,duration:v.duration}};
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
// All Audiobooks (endless)
const AUTH='Jane Austen,Charles Dickens,Mark Twain,Leo Tolstoy,Fyodor Dostoevsky,Victor Hugo,Alexandre Dumas,Jules Verne,H. G. Wells,Arthur Conan Doyle,Agatha Christie,Edgar Allan Poe,H. P. Lovecraft,Bram Stoker,Mary Shelley,Oscar Wilde,Charlotte Bronte,Emily Bronte,George Eliot,Thomas Hardy,Herman Melville,Nathaniel Hawthorne,Jack London,F. Scott Fitzgerald,Ernest Hemingway,John Steinbeck,George Orwell,Aldous Huxley,Virginia Woolf,James Joyce,Franz Kafka,Hermann Hesse,Anton Chekhov,Ivan Turgenev,Nikolai Gogol,Homer,Virgil,Dante,Plato,Aristotle,Marcus Aurelius,Seneca,Epictetus,Confucius,Lao Tzu,Sun Tzu,Machiavelli,Friedrich Nietzsche,Arthur Schopenhauer,Ralph Waldo Emerson,Henry David Thoreau,Walt Whitman,William Shakespeare,Lewis Carroll,L. Frank Baum,J. M. Barrie,Rudyard Kipling,Robert Louis Stevenson,Jonathan Swift,Daniel Defoe,Miguel de Cervantes,Voltaire,Gustave Flaubert,Honore de Balzac,Emile Zola,Guy de Maupassant,O. Henry,Edith Wharton,Henry James,Louisa May Alcott,Lucy Maud Montgomery,Frances Hodgson Burnett,Kenneth Grahame,Beatrix Potter,Hans Christian Andersen,Brothers Grimm,Edgar Rice Burroughs,Robert E. Howard,Zane Grey,Rafael Sabatini,Baroness Orczy,Wilkie Collins,Anthony Trollope,G. K. Chesterton,P. G. Wodehouse,Jerome K. Jerome,Joseph Conrad,E. M. Forster,D. H. Lawrence,Sinclair Lewis,Upton Sinclair,Willa Cather,Kate Chopin,Booker T. Washington,Frederick Douglass,Benjamin Franklin,Napoleon Hill,Dale Carnegie,James Allen,Wallace Wattles,Neville Goddard,Florence Scovel Shinn,Joseph Murphy,Earl Nightingale,Orison Swett Marden,Prentice Mulford,Charles Haanel,Emmet Fox,Ernest Holmes,Rudolf Steiner,Helena Blavatsky,Manly P. Hall,Edgar Cayce,Alan Watts,Krishnamurti,Paramahansa Yogananda,Swami Vivekananda,Rumi,Kahlil Gibran,Thomas a Kempis,Augustine,C. S. Lewis,G. MacDonald,J. R. R. Tolkien,Isaac Asimov,Philip K. Dick,Robert Heinlein,Arthur C. Clarke,Ray Bradbury,Frank Herbert,Stephen King,Dean Koontz,Lee Child,Michael Connelly,James Patterson,John Grisham,Tom Clancy,Clive Cussler,Dan Brown,Brandon Sanderson,Terry Pratchett,Neil Gaiman,Robert Jordan,George R. R. Martin,Patrick Rothfuss,Andy Weir,Yuval Noah Harari,Malcolm Gladwell,Robert Greene,Ryan Holiday,Eckhart Tolle,Wayne Dyer,Deepak Chopra,Louise Hay,Tony Robbins,Jordan Peterson,Brian Tracy,Zig Ziglar,Jim Rohn,Stephen Covey,Viktor Frankl,Carl Jung,Sigmund Freud,William James,Charles Darwin,Adam Smith,Thomas Paine,Alexis de Tocqueville,Edward Gibbon,Will Durant,Winston Churchill,Abraham Lincoln'.split(','),GEN='fantasy,science fiction,mystery,detective,thriller,horror,romance,historical fiction,western,adventure,biography,autobiography,memoir,history,philosophy,self help,psychology,business,finance,economics,politics,war,military history,ancient history,mythology,religion,spirituality,metaphysical,occult,poetry,drama,short stories,children,young adult,classic,gothic,dystopian,cyberpunk,space opera,litrpg,cozy mystery,true crime,science,nature,travel,humor,satire,essays,leadership,productivity,health,meditation,stoicism,law of attraction,new thought,sleep story,ghost stories,fairy tales,sea stories,pirates,samurai,knights,detective noir'.split(','),LANG='english,spanish,french,german,italian,portuguese,russian,hindi,arabic,japanese,chinese,korean,polish,dutch,turkish,greek,latin'.split(','),CH='librivox,greatest audiobooks,audiobooks unleashed,books should be free,classic audiobooks,audio book club,storytelling audiobooks,the audiobook library,public domain audiobook,golden audiobooks,audiobook world,free audiobooks,complete audiobook,unabridged audiobook'.split(',');
function buildQ(){const q=[];AUTH.forEach(x=>q.push(x+' full audiobook'));GEN.forEach(x=>q.push(x+' full audiobook',x+' audiobook complete unabridged'));
  LANG.forEach(x=>q.push('full audiobook '+x,'audiolibro completo '+x));CH.forEach(x=>q.push(x));'abcdefghijklmnopqrstuvwxyz'.split('').forEach(l=>q.push('full audiobook '+l,l+' audiobook unabridged'));
  for(let i=1;i<=30;i++)q.push('full audiobook part '+i);for(let i=q.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[q[i],q[j]]=[q[j],q[i]]}return q}
const AQ=buildQ(),aSeen=new Set();let aIdx=0,aCont=[],aBusy=false,aStarted=false;
async function aStep(){if(aBusy)return;aBusy=true;$('#aload').textContent='Loading more…';
  try{let n=0;for(let k=0;k<4;k++){let p;if(aCont.length&&Math.random()<.5){const c=aCont.shift();p=await ytPage('',true,c.t).catch(()=>null);if(p&&p.next&&c.d<6)aCont.push({t:p.next,d:c.d+1})}
      else if(aIdx<AQ.length){p=await ytPage(AQ[aIdx++],true).catch(()=>null);if(p&&p.next)aCont.push({t:p.next,d:1})}else if(aCont.length)continue;else break;
      if(!p)continue;const h=p.items.filter(x=>(!x.duration||secs(x.duration)>=3300)&&!aSeen.has(x.id)&&aSeen.add(x.id)).map(x=>card(vid(x))).join('');n+=h.length;$('#all').insertAdjacentHTML('beforeend',h)}
    $('#acount').textContent=aSeen.size.toLocaleString()+' audiobooks loaded';}finally{aBusy=false;$('#aload').textContent=aIdx>=AQ.length&&!aCont.length?'That\'s everything for now':'Load more'}}
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!$('#allv').hidden)aStep()},{rootMargin:'1200px'}).observe($('#aload'));
$('#aload').onclick=aStep;
// Search
let books=[];
$('#f').onsubmit=async e=>{e.preventDefault();const q=$('#q').value.trim();if(!q)return show('home');show('results');
  $('#books').innerHTML=$('#yt').innerHTML='<div class="skel"></div>'.repeat(4);
  fetch('https://openlibrary.org/search.json?limit=12&fields=key,title,subtitle,author_name,cover_i,first_publish_year&q='+encodeURIComponent(q)).then(r=>r.json()).then(j=>{
    $('#books').innerHTML=j.docs.map(b=>card({title:b.title,sub:b.subtitle||'',author:[(b.author_name||[]).join(', '),b.first_publish_year].filter(Boolean).join(' · '),thumb:b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`:'',bookAuthor:(b.author_name||[])[0]||''},{book:1})).join('')||'<p class="empty">No books found.</p>'
  }).catch(()=>$('#books').innerHTML='<p class="empty">Open Library search failed.</p>');
  sNext=null;sSeen=new Set();$('#ytmore').hidden=true;
  ytPage(q+' audiobook').then(p=>{$('#yt').innerHTML='';addS(p)}).catch(e=>$('#yt').innerHTML=`<p class="empty">YouTube search failed: ${esc(e.message)}</p>`)};
let sNext=null,sSeen=new Set(),sBusy=false;
function addS(p){const h=p.items.filter(x=>!sSeen.has(x.id)&&sSeen.add(x.id)).map(x=>card(vid(x))).join('');$('#yt').insertAdjacentHTML('beforeend',h);
  if(!$('#yt').children.length)$('#yt').innerHTML='<p class="empty">No videos.</p>';sNext=p.next;$('#ytmore').hidden=!sNext;$('#ytcount').textContent=sSeen.size+' results'}
$('#ytmore').onclick=async()=>{if(!sNext||sBusy)return;sBusy=true;$('#ytmore').textContent='Loading…';try{addS(await ytPage('',false,sNext))}catch(e){toast('Could not load more')}sBusy=false;$('#ytmore').textContent='Load more results'};
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!$('#results').hidden)$('#ytmore').click()},{rootMargin:'800px'}).observe($('#ytmore'));
function addItem(it){if(lib.some(x=>x.videoId==it.videoId))return toast('Already in library');lib.unshift({videoId:it.videoId,title:it.title,sub:it.sub||'',author:it.author,ytTitle:it.ytTitle||'',thumb:it.thumb,duration:it.duration});save();toast('Added to library')}
window.addIt=(id,btn)=>{addItem(reg[id]);if(btn){btn.textContent='✓ Saved';btn.disabled=true;btn.classList.remove('add')}};
window.addBook=async id=>{const b=reg[id];$('#pickt').textContent='Pick a recording for “'+b.title+'”';$('#picks').innerHTML='<div class="skel"></div>'.repeat(3);pick.showModal();
  try{const v=await yt(`${b.title} ${b.bookAuthor} audiobook`);$('#picks').innerHTML=v.map(x=>{const it=vid(x);it.title=b.title;it.sub=b.sub||'';it.author=b.bookAuthor||it.author;if(b.thumb)it.thumb=b.thumb;it.ytTitle=x.title;const i=++rid;reg[i]=it;
    return`<div class="card"><div class="cover" onclick="choose(${i})">${B}${x.duration?`<span class="dur">${esc(x.duration)}</span>`:''}</div><div class="body"><div class="t">${esc(it.title)}</div>${it.sub?`<div class="sub">${esc(it.sub)}</div>`:''}<div class="s">${esc(it.author)}</div><div class="s">${esc(x.channel)}</div><div class="acts"><button class="add" onclick="choose(${i})">Use</button><button onclick="cur=null;playIt(${i})">▶ Preview</button></div></div></div>`}).join('')||'<p class="empty">No matches.</p>'}
  catch(e){$('#picks').innerHTML='<p class="empty">YouTube search failed: '+esc(e.message)+'</p>'}};
window.choose=i=>{pick.close();addItem(reg[i])};
// Library
const fmt=s=>{s=Math.floor(s||0);return`${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
function renderLib(){lib.forEach(x=>{if(x.ytTitle===undefined&&!x._c){const p=parseYT(x.title,x.author);x.title=p.title;x.author=p.author;x._c=1}if(x.sub===undefined){const s=splitSub(x.title);x.title=s.title;x.sub=s.sub}});$('#lib').innerHTML=lib.map((x,i)=>{const id=++rid;reg[id]=x;return`<div class="card"><div class="cover" onclick="playIt(${id})">${B}${x.duration?`<span class="dur">${esc(x.duration)}</span>`:''}</div><div class="body"><div class="t">${esc(x.title)}</div>${x.sub?`<div class="sub">${esc(x.sub)}</div>`:''}<div class="s">${esc(x.author)}</div><div class="s">${pos[x.videoId]?'Resume at '+fmt(pos[x.videoId]):'Not started'}</div><div class="acts"><button class="add" onclick="playIt(${id})">▶ Play</button><button onclick="rm(${i})" aria-label="Remove">🗑</button></div></div></div>`}).join('')||'<p class="empty">Your library is empty. Discover or search, then tap + Add.</p>'}
window.rm=i=>{if(confirm('Remove “'+lib[i].title+'”?')){lib.splice(i,1);save()}};
// Player
window.playIt=id=>{persist();cur=reg[id];$('#player').hidden=false;$('#ptitle').textContent=cur.title;$('#psub').textContent=cur.sub||'';$('#psub').hidden=!cur.sub;$('#pauthor').textContent=cur.author||'';const start=Math.floor(pos[cur.videoId]||0);
  if(player?.loadVideoById)player.loadVideoById({videoId:cur.videoId,startSeconds:start});
  else player=new YT.Player('yt-frame',{videoId:cur.videoId,playerVars:{start,autoplay:1,playsinline:1},events:{onReady:e=>{e.target.setPlaybackRate(+$('#speed').value);e.target.playVideo()}}})};
$('#speed').onchange=()=>player?.setPlaybackRate(+$('#speed').value);
$('#toggle').onclick=()=>{const o=$('#player').classList.toggle('open');$('#toggle').textContent=o?'▴':'▾'};
$('#close').onclick=()=>{persist();player?.stopVideo();$('#player').hidden=true;renderLib()};
function persist(){if(cur&&player?.getCurrentTime){const t=player.getCurrentTime();if(t>0){pos[cur.videoId]=t;localStorage.pos=JSON.stringify(pos)}$('#ptime').textContent=fmt(t)+(player.getDuration?' / '+fmt(player.getDuration()):'')}}
setInterval(persist,5000);addEventListener('pagehide',persist);renderLib();loadMore(6);
