const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// Put your own photo links here (inside this folder or a data: URL)
const PHOTOS={entrance:'',hallway:'',buildings:{}};
const BUILD=[
 {n:'HVAC Building',x:22,y:6},{n:'Automotive Building',x:47,y:6},{n:'Railway Building',x:47,y:30},
 {n:'Mechatronics Building',x:75,y:6},{n:'Main Building',x:14,y:57}];
const PILLS=['Main Building','Railway Inc.','Automotive','HVAC','Mechatronics'];
const plan='<svg viewBox="0 0 50 60" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h42v52H4z"/><path d="M4 30h24v26M28 40h18"/></svg>';
let floor=3,zoom=1,sel='Comlab A',spot='entrance',view='home',slide=0;
const FL=['1ST','2ND','3RD'];
const found=new Set();
function quest(){$('#quest').textContent='TOUR QUEST: '+found.size+'/'+BUILD.length+' STAMPS'+(found.size===BUILD.length?' - COMPLETE!':'')}

// views
function go(v){
 view=v;$$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));
 $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===v||(v==='pano'&&false)));
 $('#nav').classList.remove('open');
 $('#side').style.display=(v==='pano'&&spot==='entrance')?'none':'';
 $$('.you')[0].style.display=(v==='pano'&&spot==='hallway')?'block':'none';
 if(v==='pano')renderPano();
}
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$('#burger').onclick=()=>$('#nav').classList.toggle('open');

// home: building buttons + slider
$('#pills').innerHTML=PILLS.map(p=>`<button class="pill">${p}</button>`).join('');
$$('.pill').forEach(b=>b.onclick=()=>{$$('.pill').forEach(x=>x.classList.remove('on'));b.classList.add('on');select(b.textContent);$('#cap').textContent=b.textContent+' photos'});
const SL=['Front view','Side view','Entrance'];
$('#slider').insertAdjacentHTML('afterbegin',SL.map((t,i)=>`<div class="slide${i?'':' on'}">${t}</div>`).join(''));
$('#dots').innerHTML=SL.map((_,i)=>`<button class="${i?'':'on'}" aria-label="Photo ${i+1}"></button>`).join('');
function showSlide(i){slide=i;$$('.slide').forEach((s,k)=>s.classList.toggle('on',k===i));$$('#dots button').forEach((s,k)=>s.classList.toggle('on',k===i))}
$$('#dots button').forEach((b,i)=>b.onclick=()=>showSlide(i));
setInterval(()=>{if(view==='home')showSlide((slide+1)%SL.length)},4500);

// map
$('#bl').innerHTML=BUILD.map((b,i)=>`<button class="b" data-n="${b.n}" style="left:${b.x}%;top:${b.y}%">${b.n.toUpperCase()}${plan}</button>`).join('');
$$('.b').forEach(b=>{b.insertAdjacentHTML('beforeend','<span class="dot" style="left:62%;top:46%" title="360 view"></span>');
 b.onclick=e=>{if(e.target.classList.contains('dot')){found.add(b.dataset.n);quest();e.target.style.background='#f5b400';spot='entrance';go('pano')}else select(b.dataset.n)}});
function select(n){sel=n;$$('.b').forEach(b=>b.classList.toggle('on',b.dataset.n===n));info();if($('#route').style.display==='block')drawRoute()}
function info(){$('#info').textContent=(sel==='Comlab A'?'COMLAB A':sel.toUpperCase())+' | '+FL[floor-1]+' FLOOR';$('#fpl').textContent='FLOOR '+floor}

// side panel
function applyZoom(){$('#mapin').style.transform='scale('+zoom+')'}
$('#zi').onclick=()=>{zoom=Math.min(2,zoom+.2);applyZoom()};
$('#zo').onclick=()=>{zoom=Math.max(.6,zoom-.2);applyZoom()};
$('#loc').onclick=()=>{go('map');const m=$('#me');const on=m.style.display!=='block';m.style.display=on?'block':'none';$('#loc').classList.toggle('on',on)};
$('#rs').onclick=()=>{zoom=1;applyZoom();$('#q').value='';$$('.b').forEach(b=>b.classList.remove('on','hit'));$('#me').style.display='none';$('#route').style.display='none';$('#rinfo').textContent='';$('#dir').classList.remove('on');$('#loc').classList.remove('on');go('home')};
// A* path-finding on a walkway graph (start: Main Gate, goal: selected building door)
function drawRoute(){const t=$('.b.on');if(!t)return;
 const N={G:[50,78],C:[47,62],R0:[14,62],R1:[22,62],R3:[75,62]},E=[['G','C'],['R0','R1'],['R1','C'],['C','R3']],L={'Main Building':'R0','HVAC Building':'R1','Railway Building':'C','Mechatronics Building':'R3'};
 BUILD.forEach(b=>{N[b.n]=[b.x,b.y+16]});E.push(['Automotive Building','Railway Building']);for(const k in L)E.push([k,L[k]]);
 const d=(a,b)=>Math.hypot(N[a][0]-N[b][0],N[a][1]-N[b][1]),adj={};
 E.forEach(([a,b])=>{(adj[a]=adj[a]||[]).push([b,d(a,b)]);(adj[b]=adj[b]||[]).push([a,d(a,b)])});
 const tg=t.dataset.n,g={G:0},prev={},open=['G'],done={};
 while(open.length){open.sort((a,b)=>g[a]+d(a,tg)-g[b]-d(b,tg));const u=open.shift();if(u===tg)break;done[u]=1;
  for(const[v,w]of adj[u]){const ng=g[u]+w;if(!done[v]&&(g[v]===undefined||ng<g[v])){g[v]=ng;prev[v]=u;if(!open.includes(v))open.push(v)}}}
 const pts=[];for(let n=tg;n;n=prev[n])pts.unshift(n);
 $('#rp').setAttribute('d','M'+pts.map(n=>N[n].join(' ')).join(' L'));
 const m=Math.round(g[tg]*3);$('#rinfo').textContent='A* ROUTE: ~'+m+' M, ~'+Math.max(1,Math.round(m/80))+' MIN WALK'}
$('#dir').onclick=()=>{go('map');const r=$('#route');const on=r.style.display!=='block';if(on&&!$('.b.on'))select('Main Building');r.style.display=on?'block':'none';if(on)drawRoute();else $('#rinfo').textContent='';$('#dir').classList.toggle('on',on)};
$('#fl').onclick=()=>{floor=floor%3+1;info()};
$('#q').oninput=e=>{const v=e.target.value.trim().toLowerCase();go('map');$$('.b').forEach(b=>b.classList.toggle('hit',!!v&&b.dataset.n.toLowerCase().includes(v)));
 const m=BUILD.find(b=>v&&b.n.toLowerCase().includes(v));if(m)select(m.n)};
$('#v360').onclick=()=>{spot='entrance';go('pano')};

// 360 view
function renderPano(){
 const h=spot==='hallway';
 $('#ptxt').innerHTML=h?'HALLWAY 1ST FLOOR<br>(MAIN BUILDING)':'MAIN ENTRANCE';
 const img=PHOTOS[spot];$('#pano').style.backgroundImage=img?`url(${img})`:'';
 $('#pnote').style.display=img?'none':'';
 $$('.you')[0].style.display=h?'block':'none';
 $('#side').style.display=h?'':'none';
}
$('#hs1').onclick=$('#hs2').onclick=()=>{spot=spot==='entrance'?'hallway':'entrance';go('pano')};
info();quest();
