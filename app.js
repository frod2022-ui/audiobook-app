const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B='<span class="badge"><img src="/logo.svg" alt="">Wisdom</span>';
let lib=JSON.parse(localStorage.lib||'[]'),pos=JSON.parse(localStorage.pos||'{}'),player,cur;const reg={};let rid=0;
const CATS=[
["Lectures", ["full lecture", "complete lecture series", "famous lectures full", "great courses lecture full"]],
["Philosophy Lectures", ["philosophy lecture full", "philosophy lecture series complete", "stoicism lecture full", "existentialism lecture full"]],
["Metaphysical Lectures", ["alan watts lecture full", "manly p hall lecture full", "neville goddard lecture full", "joseph campbell lecture full", "terence mckenna lecture full", "carl jung lecture full", "wayne dyer lecture full", "bob proctor lecture full", "joe dispenza lecture full", "eckhart tolle talk full"]],
["Spiritual Talks", ["spiritual talk full", "spiritual awakening talk full", "ram dass talk full", "krishnamurti talk full", "mooji satsang full", "thich nhat hanh talk full"]],
["Psychology Lectures", ["psychology lecture full", "jordan peterson lecture full", "personality psychology lecture", "jung psychology lecture full"]],
["History Lectures", ["history lecture full", "ancient history lecture full", "medieval history lecture full", "world war lecture full"]],
["Science Lectures", ["science lecture full", "physics lecture full", "richard feynman lecture full", "astronomy lecture full", "neuroscience lecture full"]],
["Religion & Theology Lectures", ["theology lecture full", "religion lecture full", "bible lecture series full", "comparative religion lecture full"]],
["Self-Improvement Talks", ["self improvement talk full", "motivational talk full", "jim rohn lecture full", "les brown speech full", "earl nightingale talk full"]],
["University Lectures", ["university lecture full", "harvard lecture full", "yale open course lecture", "stanford lecture full", "mit opencourseware lecture full", "oxford lecture full"]],
["TED Talks", ["ted talk", "tedx talk", "ted-ed", "ted talk psychology", "ted talk science", "ted talk motivation", "ted talk leadership", "ted talk happiness", "ted talk education", "ted talk technology", "ted talk health", "ted talk spirituality", "ted talk creativity", "ted talk business", "ted talk relationships", "tedx talk mindset"]],
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
CATS.sort((x,y)=>{const k=s=>s.replace(/^[^A-Za-z0-9]+/,'').replace(/^the\s+/i,'').toLowerCase();return k(x[0]).localeCompare(k(y[0]))});
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('on'),1800)};
const save=()=>{localStorage.lib=JSON.stringify(lib);renderLib()};
function show(v){if(v=='allv'&&!aStarted){aStarted=true;aStep()}for(const s of['home','results','library','allv'])$('#'+s).hidden=s!=v;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.v==(v=='results'?'home':v)));$('.searchbar').hidden=v=='library'}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>show(b.dataset.v));$('#clear').onclick=()=>show('home');
const minFor=q=>/\bted(x)?\b|ted-ed/i.test(q)?5:/lecture|talks?\b|speech|sermon|seminar|course|keynote/i.test(q)?30:55;
async function ytPage(q,long,c){const m=long?(typeof long=='number'?long:minFor(q)):0;const k='yp:'+(long?'L'+m+':':'')+(c||q);try{const x=JSON.parse(localStorage[k]||'null');if(x&&Date.now()-x.t<216e5)return x.v}catch{}
  const r=await fetch('/api/youtube?'+(long?'long=1&min='+m+'&':'')+(c?'c='+encodeURIComponent(c):'q='+encodeURIComponent(q)));const j=await r.json();if(j.error&&!j.items.length)throw Error(j.error);
  const v={items:j.items,next:j.next};if(!c)try{localStorage[k]=JSON.stringify({t:Date.now(),v})}catch{}return v}
async function yt(q,long){const m=long?(typeof long=='number'?long:minFor(q)):0;const k='yt:'+(long?'L'+m+':':'')+q;try{const c=JSON.parse(localStorage[k]||'null');if(c&&Date.now()-c.t<216e5)return c.v}catch{}
  const r=await fetch('/api/youtube?'+(long?'long=1&min='+m+'&':'')+'q='+encodeURIComponent(q));const j=await r.json();if(j.error&&!j.items.length)throw Error(j.error);
  try{localStorage[k]=JSON.stringify({t:Date.now(),v:j.items})}catch{}return j.items}
const secs=d=>d?d.split(':').reduce((a,x)=>a*60+ +x,0):0;
function card(it,{book}={}){const id=++rid;reg[id]=it;const inLib=it.videoId&&lib.some(x=>x.videoId==it.videoId);
  return`<div class="card"><div class="cover" ${it.videoId?`onclick="playIt(${id})"`:`onclick="addBook(${id})"`}>${B}${KIND(it)}${it.duration?`<span class="dur">${esc(it.duration)}</span>`:''}${it.videoId?'':''}</div>
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
const kindOf=t=>/\bted(x)?\b|ted-ed/i.test(t)?'Talk':/lecture|seminar|course|keynote|sermon|lesson/i.test(t)?'Lecture':/\btalks?\b|speech|podcast|interview/i.test(t)?'Talk':'Audiobook';
const KIND=it=>it.kind?`<span class="kind k-${it.kind.toLowerCase()}">${it.kind}</span>`:'';
const vid=v=>{const p=parseYT(v.title,v.channel);{const ps=String(v.title).split('|').map(s=>s.trim());if(ps.length>=3&&/^TED/i.test(ps[ps.length-1])&&/^[A-Z][\w.'’-]*( [A-Z][\w.'’-]*){0,3}$/.test(ps[1]))p.author=ps[1]}return{kind:kindOf(v.title),videoId:v.id,title:p.title,sub:p.sub,author:p.author,ytTitle:v.title,thumb:`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,duration:v.duration}};
const OV=it=>`<div class="ov"><b>${esc(it.title)}</b><span>${esc(it.author||'')}</span></div>`;

// Alphabetical helpers
const sk=t=>String(t||'').toLowerCase().replace(/^[^a-z0-9]+/,'').replace(/^(the|an|a)\s+/,'').replace(/^[^a-z0-9]+/,'');
const L=t=>{const c=sk(t)[0]||'#';return/[a-z]/.test(c)?c.toUpperCase():'#'};
const byT=(x,y)=>sk(x.title).localeCompare(sk(y.title));
const LETTERS='#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function el(html){const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild}
function insSorted(box,html,k){const n=el(html);n.dataset.k=k;let lo=0,hi=box.children.length;while(lo<hi){const m=(lo+hi)>>1;if((box.children[m].dataset.k||'')<=k)lo=m+1;else hi=m}box.insertBefore(n,box.children[lo]||null)}
function lsec(root,l){let s=root.querySelector(`[data-l="${l}"]`);if(s)return s.querySelector('.shelf');s=el(`<div class="lsec" data-l="${l}" id="${root.id}-${l=='#'?'num':l}"><h3 class="lh">${l}</h3><div class="shelf wrap"></div></div>`);
  const after=[...root.children].find(c=>LETTERS.indexOf(c.dataset.l)>LETTERS.indexOf(l));root.insertBefore(s,after||null);return s.querySelector('.shelf')}
function azBar(bar,root){bar.innerHTML=LETTERS.map(l=>`<button data-j="${l}">${l}</button>`).join('');bar.onclick=e=>{const l=e.target.dataset?.j;if(!l)return;const s=root.querySelector(`[data-l="${l}"]`);if(s)s.scrollIntoView({behavior:'smooth',block:'start'});else toast('No titles under '+l+' yet')}}
function addSorted(root,it){insSorted(lsec(root,L(it.title)),card(it),sk(it.title)+'|'+it.videoId)}
// Discover
const seen=new Set();let next=0;
$('#chips').innerHTML=CATS.map((c,i)=>`<button onclick="goCat(${i})">${esc(c[0])}</button>`).join('');
async function loadCat(i){if(i>=CATS.length||$('#cat'+i))return;const [name,qs]=CATS[i];
  $('#rows').insertAdjacentHTML('beforeend',`<section id="cat${i}"><h2>${esc(name)}</h2><div class="shelf">${'<div class="skel"></div>'.repeat(5)}</div></section>`);
  const res=await Promise.allSettled(qs.map(q=>yt(q,true)));let items=[];
  for(const r of res)if(r.status=='fulfilled')for(const v of r.value)if(!seen.has(v.id)){seen.add(v.id);items.push(vid(v))}
  items.sort(byT);$(`#cat${i} .shelf`).innerHTML=items.map(x=>card(x)).join('')||'<p class="empty">Nothing found right now.</p>'}
async function loadMore(n=4){const end=Math.min(next+n,CATS.length);const ps=[];for(;next<end;next++)ps.push(loadCat(next));if(next>=CATS.length)$('#more').hidden=true;await Promise.all(ps)}
window.goCat=async i=>{document.querySelectorAll('.chips button').forEach((b,j)=>b.classList.toggle('on',i==j));show('home');if(!$('#cat'+i))await loadCat(i);$('#cat'+i).scrollIntoView({behavior:'smooth',block:'start'})};
$('#more').onclick=()=>loadMore();
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!$('#home').hidden&&next<CATS.length)loadMore()},{rootMargin:'600px'}).observe($('#more'));
// All Audiobooks (endless)
const AUTH='Jane Austen,Charles Dickens,Mark Twain,Leo Tolstoy,Fyodor Dostoevsky,Victor Hugo,Alexandre Dumas,Jules Verne,H. G. Wells,Arthur Conan Doyle,Agatha Christie,Edgar Allan Poe,H. P. Lovecraft,Bram Stoker,Mary Shelley,Oscar Wilde,Charlotte Bronte,Emily Bronte,George Eliot,Thomas Hardy,Herman Melville,Nathaniel Hawthorne,Jack London,F. Scott Fitzgerald,Ernest Hemingway,John Steinbeck,George Orwell,Aldous Huxley,Virginia Woolf,James Joyce,Franz Kafka,Hermann Hesse,Anton Chekhov,Ivan Turgenev,Nikolai Gogol,Homer,Virgil,Dante,Plato,Aristotle,Marcus Aurelius,Seneca,Epictetus,Confucius,Lao Tzu,Sun Tzu,Machiavelli,Friedrich Nietzsche,Arthur Schopenhauer,Ralph Waldo Emerson,Henry David Thoreau,Walt Whitman,William Shakespeare,Lewis Carroll,L. Frank Baum,J. M. Barrie,Rudyard Kipling,Robert Louis Stevenson,Jonathan Swift,Daniel Defoe,Miguel de Cervantes,Voltaire,Gustave Flaubert,Honore de Balzac,Emile Zola,Guy de Maupassant,O. Henry,Edith Wharton,Henry James,Louisa May Alcott,Lucy Maud Montgomery,Frances Hodgson Burnett,Kenneth Grahame,Beatrix Potter,Hans Christian Andersen,Brothers Grimm,Edgar Rice Burroughs,Robert E. Howard,Zane Grey,Rafael Sabatini,Baroness Orczy,Wilkie Collins,Anthony Trollope,G. K. Chesterton,P. G. Wodehouse,Jerome K. Jerome,Joseph Conrad,E. M. Forster,D. H. Lawrence,Sinclair Lewis,Upton Sinclair,Willa Cather,Kate Chopin,Booker T. Washington,Frederick Douglass,Benjamin Franklin,Napoleon Hill,Dale Carnegie,James Allen,Wallace Wattles,Neville Goddard,Florence Scovel Shinn,Joseph Murphy,Earl Nightingale,Orison Swett Marden,Prentice Mulford,Charles Haanel,Emmet Fox,Ernest Holmes,Rudolf Steiner,Helena Blavatsky,Manly P. Hall,Edgar Cayce,Alan Watts,Krishnamurti,Paramahansa Yogananda,Swami Vivekananda,Rumi,Kahlil Gibran,Thomas a Kempis,Augustine,C. S. Lewis,G. MacDonald,J. R. R. Tolkien,Isaac Asimov,Philip K. Dick,Robert Heinlein,Arthur C. Clarke,Ray Bradbury,Frank Herbert,Stephen King,Dean Koontz,Lee Child,Michael Connelly,James Patterson,John Grisham,Tom Clancy,Clive Cussler,Dan Brown,Brandon Sanderson,Terry Pratchett,Neil Gaiman,Robert Jordan,George R. R. Martin,Patrick Rothfuss,Andy Weir,Yuval Noah Harari,Malcolm Gladwell,Robert Greene,Ryan Holiday,Eckhart Tolle,Wayne Dyer,Deepak Chopra,Louise Hay,Tony Robbins,Jordan Peterson,Brian Tracy,Zig Ziglar,Jim Rohn,Stephen Covey,Viktor Frankl,Carl Jung,Sigmund Freud,William James,Charles Darwin,Adam Smith,Thomas Paine,Alexis de Tocqueville,Edward Gibbon,Will Durant,Winston Churchill,Abraham Lincoln'.split(','),GEN='fantasy,science fiction,mystery,detective,thriller,horror,romance,historical fiction,western,adventure,biography,autobiography,memoir,history,philosophy,self help,psychology,business,finance,economics,politics,war,military history,ancient history,mythology,religion,spirituality,metaphysical,occult,poetry,drama,short stories,children,young adult,classic,gothic,dystopian,cyberpunk,space opera,litrpg,cozy mystery,true crime,science,nature,travel,humor,satire,essays,leadership,productivity,health,meditation,stoicism,law of attraction,new thought,sleep story,ghost stories,fairy tales,sea stories,pirates,samurai,knights,detective noir'.split(','),LANG='english,spanish,french,german,italian,portuguese,russian,hindi,arabic,japanese,chinese,korean,polish,dutch,turkish,greek,latin'.split(','),CH='librivox,greatest audiobooks,audiobooks unleashed,books should be free,classic audiobooks,audio book club,storytelling audiobooks,the audiobook library,public domain audiobook,golden audiobooks,audiobook world,free audiobooks,complete audiobook,unabridged audiobook'.split(',');
function buildQ(){const q=[];AUTH.forEach(x=>q.push(x+' full audiobook'));GEN.forEach(x=>q.push(x+' full audiobook',x+' audiobook complete unabridged'));
  LANG.forEach(x=>q.push('full audiobook '+x,'audiolibro completo '+x));CH.forEach(x=>q.push(x));AUTH.slice(0,80).forEach(x=>q.push(x+' lecture'));GEN.forEach(x=>q.push(x+' lecture full','ted talk '+x));['tedx talk','ted talk','ted-ed','full lecture','lecture series','university lecture','keynote speech','commencement speech'].forEach(x=>q.push(x));'abcdefghijklmnopqrstuvwxyz'.split('').forEach(l=>q.push('full audiobook '+l,l+' audiobook unabridged'));
  for(let i=1;i<=30;i++)q.push('full audiobook part '+i);for(let i=q.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[q[i],q[j]]=[q[j],q[i]]}return q}
const AQ=buildQ(),aSeen=new Set();let aIdx=0,aCont=[],aBusy=false,aStarted=false;
function updCount(){const n=$('#all').querySelectorAll('.card').length;$('#acount').textContent=n.toLocaleString()+(n==1?' audiobook':' audiobooks')+' loaded'}
async function aStep(){if(aBusy)return;aBusy=true;$('#aload').textContent='Loading more…';
  try{let n=0;for(let k=0;k<4;k++){let p;if(aCont.length&&Math.random()<.5){const c=aCont.shift();p=await ytPage('',c.m,c.t).catch(()=>null);if(p&&p.next&&c.d<6)aCont.push({t:p.next,d:c.d+1,m:c.m})}
      else if(aIdx<AQ.length){const q=AQ[aIdx++];p=await ytPage(q,true).catch(()=>null);if(p&&p.next)aCont.push({t:p.next,d:1,m:minFor(q)})}else if(aCont.length)continue;else break;
      if(!p)continue;p.items.filter(x=>!aSeen.has(x.id)&&aSeen.add(x.id)).map(vid).forEach(it=>{try{addSorted($('#all'),it);n++}catch(e){}});updCount()}
    }finally{updCount();aBusy=false;$('#aload').textContent=aIdx>=AQ.length&&!aCont.length?'That\'s everything for now':'Load more'}}
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!$('#allv').hidden)aStep()},{rootMargin:'1200px'}).observe($('#aload'));
$('#aload').onclick=aStep;azBar($('#aaz'),$('#all'));azBar($('#laz'),$('#lib'));
// Search
let books=[];
$('#f').onsubmit=async e=>{e.preventDefault();const q=$('#q').value.trim();if(!q)return show('home');show('results');
  $('#books').innerHTML=$('#yt').innerHTML='<div class="skel"></div>'.repeat(4);
  fetch('https://openlibrary.org/search.json?limit=12&fields=key,title,subtitle,author_name,cover_i,first_publish_year&q='+encodeURIComponent(q)).then(r=>r.json()).then(j=>{
    $('#books').innerHTML=j.docs.sort((x,y)=>sk(x.title).localeCompare(sk(y.title))).map(b=>card({title:b.title,sub:b.subtitle||'',author:[(b.author_name||[]).join(', '),b.first_publish_year].filter(Boolean).join(' · '),thumb:b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`:'',bookAuthor:(b.author_name||[])[0]||''},{book:1})).join('')||'<p class="empty">No books found.</p>'
  }).catch(()=>$('#books').innerHTML='<p class="empty">Open Library search failed.</p>');
  sNext=null;sSeen=new Set();$('#ytmore').hidden=true;
  Promise.allSettled([ytPage(q+' audiobook'),ytPage(q+' lecture'),ytPage(q+' TED talk')]).then(r=>{$('#yt').innerHTML='';const ok=r.filter(x=>x.status=='fulfilled').map(x=>x.value);if(!ok.length)throw Error(r[0].reason?.message||'failed');ok.slice(1).forEach(p=>addS({items:p.items,next:null}));addS(ok[0])}).catch(e=>$('#yt').innerHTML=`<p class="empty">YouTube search failed: ${esc(e.message)}</p>`)};
let sNext=null,sSeen=new Set(),sBusy=false;
function addS(p){$('#yt').querySelector('.empty')?.remove();p.items.filter(x=>!sSeen.has(x.id)&&sSeen.add(x.id)).map(vid).forEach(it=>insSorted($('#yt'),card(it),sk(it.title)+'|'+it.videoId));
  if(!$('#yt').children.length)$('#yt').innerHTML='<p class="empty">No videos.</p>';sNext=p.next;$('#ytmore').hidden=!sNext;$('#ytcount').textContent=sSeen.size+' results'}
$('#ytmore').onclick=async()=>{if(!sNext||sBusy)return;sBusy=true;$('#ytmore').textContent='Loading…';try{addS(await ytPage('',false,sNext))}catch(e){toast('Could not load more')}sBusy=false;$('#ytmore').textContent='Load more results'};
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!$('#results').hidden)$('#ytmore').click()},{rootMargin:'800px'}).observe($('#ytmore'));
function addItem(it){if(lib.some(x=>x.videoId==it.videoId))return toast('Already in library');lib.unshift({kind:it.kind||'',videoId:it.videoId,title:it.title,sub:it.sub||'',author:it.author,ytTitle:it.ytTitle||'',thumb:it.thumb,duration:it.duration});save();toast('Added to library')}
window.addIt=(id,btn)=>{addItem(reg[id]);if(btn){btn.textContent='✓ Saved';btn.disabled=true;btn.classList.remove('add')}};
window.addBook=async id=>{const b=reg[id];$('#pickt').textContent='Pick a recording for “'+b.title+'”';$('#picks').innerHTML='<div class="skel"></div>'.repeat(3);pick.showModal();
  try{const v=await yt(`${b.title} ${b.bookAuthor} audiobook`);$('#picks').innerHTML=v.map(x=>{const it=vid(x);it.title=b.title;it.sub=b.sub||'';it.author=b.bookAuthor||it.author;if(b.thumb)it.thumb=b.thumb;it.ytTitle=x.title;const i=++rid;reg[i]=it;
    return`<div class="card"><div class="cover" onclick="choose(${i})">${B}${KIND(it)}${x.duration?`<span class="dur">${esc(x.duration)}</span>`:''}</div><div class="body"><div class="t">${esc(it.title)}</div>${it.sub?`<div class="sub">${esc(it.sub)}</div>`:''}<div class="s">${esc(it.author)}</div><div class="s">${esc(x.channel)}</div><div class="acts"><button class="add" onclick="choose(${i})">Use</button><button onclick="cur=null;playIt(${i})">▶ Preview</button></div></div></div>`}).join('')||'<p class="empty">No matches.</p>'}
  catch(e){$('#picks').innerHTML='<p class="empty">YouTube search failed: '+esc(e.message)+'</p>'}};
window.choose=i=>{pick.close();addItem(reg[i])};
// Library
const fmt=s=>{s=Math.floor(s||0);return`${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
function renderLib(){lib.forEach(x=>{if(x.ytTitle===undefined&&!x._c){const p=parseYT(x.title,x.author);x.title=p.title;x.author=p.author;x._c=1}if(x.sub===undefined){const s=splitSub(x.title);x.title=s.title;x.sub=s.sub}});const ord=lib.map((x,i)=>[x,i]).sort((p,q)=>byT(p[0],q[0]));let lastL='';const _cardL=(x,i)=>{const id=++rid;reg[id]=x;return`<div class="card"><div class="cover" onclick="playIt(${id})">${B}${KIND(x)}${x.duration?`<span class="dur">${esc(x.duration)}</span>`:''}</div><div class="body"><div class="t">${esc(x.title)}</div>${x.sub?`<div class="sub">${esc(x.sub)}</div>`:''}<div class="s">${esc(x.author)}</div><div class="s">${pos[x.videoId]?'Resume at '+fmt(pos[x.videoId]):'Not started'}</div><div class="acts"><button class="add" onclick="playIt(${id})">▶ Play</button><button onclick="rm(${i})" aria-label="Remove">🗑</button></div></div></div>`};$('#lib').innerHTML=ord.map(([x,i])=>{const l=L(x.title);const hd=l!==lastL?`</div><h3 class="lh" id="lib-${l=='#'?'num':l}" data-l="${l}">${l}</h3><div class="shelf wrap">`:'';lastL=l;return hd+_cardL(x,i)}).join('').replace(/^<\/div>/,'')+(ord.length?'</div>':'')||'<p class="empty">Your library is empty. Discover or search, then tap + Add.</p>'}
window.rm=i=>{if(confirm('Remove “'+lib[i].title+'”?')){lib.splice(i,1);save()}};
// Player
window.playIt=id=>{const host=window.event?.target?.closest?.('.card');if(cur&&reg[id]&&cur.videoId===reg[id].videoId&&player?.getPlayerState){if(host&&!host.querySelector('.tp'))mountTile(host);return togglePlay()}persist();if(host)mountTile(host);cur=reg[id];$('#player').hidden=false;$('#ptitle').textContent=cur.title;$('#psub').textContent=cur.sub||'';$('#psub').hidden=!cur.sub;$('#pauthor').textContent=cur.author||'';const start=Math.floor(pos[cur.videoId]||0);
  if(player?.loadVideoById)player.loadVideoById({videoId:cur.videoId,startSeconds:start});
  else player=new YT.Player('yt-frame',{videoId:cur.videoId,playerVars:{start,autoplay:1,playsinline:1},events:{onReady:e=>{e.target.setPlaybackRate(+$('#speed').value);e.target.playVideo()}}})};
$('#speed').onchange=()=>player?.setPlaybackRate(+$('#speed').value);
$('#toggle').onclick=()=>{const o=$('#player').classList.toggle('open');$('#toggle').textContent=o?'▴':'▾'};
$('#close').onclick=()=>{if(tileEl){tileEl.classList.remove('playing');tileEl.querySelector('.tp')?.remove();tileEl=null}persist();player?.stopVideo();$('#player').hidden=true;renderLib()};
function persist(){if(cur&&player?.getCurrentTime){const t=player.getCurrentTime();if(t>0){pos[cur.videoId]=t;localStorage.pos=JSON.stringify(pos)}$('#ptime').textContent=fmt(t)+(player.getDuration?' / '+fmt(player.getDuration()):'')}}
setInterval(persist,5000);addEventListener('pagehide',persist);renderLib();loadMore(6);

// In-tile mini player
let tileEl=null;
function mountTile(card){if(tileEl&&tileEl!==card){tileEl.classList.remove('playing');tileEl.querySelector('.tp')?.remove()}tileEl=card;card.classList.add('playing');
  if(card.querySelector('.tp'))return;card.querySelector('.body').insertAdjacentHTML('beforeend',`<div class="tp" onclick="event.stopPropagation()">
  <div class="tprow"><button class="tb add" data-a="pp" aria-label="Play">▶ Play</button><button class="tb" data-a="stop" aria-label="Stop">■ Stop</button><button class="tb" data-a="back" aria-label="Back 15 seconds">↺ 15s</button><select data-a="spd" aria-label="Speed">${[.75,1,1.25,1.5,1.75,2].map(s=>`<option ${s==+$('#speed').value?'selected':''}>${s}×</option>`).join('')}</select></div>
  <input type="range" class="seek" min="0" max="1000" value="0" aria-label="Seek"><div class="tptime"><span class="el">0:00:00</span><span class="tot">--:--</span></div></div>`);
  const tp=card.querySelector('.tp');
  tp.querySelector('[data-a=pp]').onclick=togglePlay;
  tp.querySelector('[data-a=back]').onclick=()=>skip(-15);tp.querySelector('[data-a=stop]').onclick=stopTile;
  tp.querySelector('[data-a=spd]').onchange=e=>{const v=parseFloat(e.target.value);$('#speed').value=v;player?.setPlaybackRate(v)};
  const sk=tp.querySelector('.seek');sk.oninput=()=>{sk._drag=true};sk.onchange=()=>{const d=player?.getDuration?.()||0;if(d)player.seekTo(sk.value/1000*d,true);sk._drag=false}}
function stopTile(){persist();player?.pauseVideo?.();if(tileEl){tileEl.classList.remove('playing');tileEl.querySelector('.tp')?.remove();tileEl=null}renderLib()}
function togglePlay(){if(!player?.getPlayerState)return;player.getPlayerState()===1?player.pauseVideo():player.playVideo()}
function skip(s){if(player?.getCurrentTime)player.seekTo(Math.max(0,player.getCurrentTime()+s),true)}
setInterval(()=>{if(!player?.getCurrentTime||!cur)return;const t=player.getCurrentTime(),d=player.getDuration()||0,st=player.getPlayerState();
  $('#ptime').textContent=fmt(t)+(d?' / '+fmt(d):'');$('#gpp').textContent=st===1?'⏸':'▶';
  if(tileEl){const tp=tileEl.querySelector('.tp');if(tp){tp.querySelector('.el').textContent=fmt(t);tp.querySelector('.tot').textContent=d?fmt(d):'--:--';tp.querySelector('[data-a=pp]').textContent=st===1?'⏸ Pause':'▶ Play';
    const sk=tp.querySelector('.seek');if(!sk._drag&&d)sk.value=Math.round(t/d*1000);tp.querySelector('[data-a=spd]').value=$('#speed').value+'×'}}},500);
$('#gpp').onclick=togglePlay;$('#gback').onclick=()=>skip(-15);$('#gfwd').onclick=()=>skip(15);
