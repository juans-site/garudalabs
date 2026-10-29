/* ====== KONFIGURASI ====== */
const SHEET_ID = '1ETKbNqO5euQGu-TgeehePeHviKDvWRg44u65RHDq3CU';
const SHEET_NAME = 'Data Bersih';
/* ======================== */

const C = {Positif:'#22c55e',Netral:'#94a3b8',Negatif:'#ef4444'};
const PLAT_C = ['#1a73e8','#f7941d','#a855f7','#06b6d4','#ec4899','#eab308','#10b981','#64748b'];
const SENTS = ['Positif','Netral','Negatif'];
let ALL = [], F = [], charts = {}, state = {drv:'Negatif',wc:'Negatif',acc:'Negatif',sort:{k:'date',d:-1},page:0};
const $ = s => document.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = n => Number(n||0).toLocaleString('id-ID');

/* ---- load via JSONP (Google Visualization API, butuh sheet "Anyone with link") ---- */
function loadSheet(){
  return new Promise((res,rej)=>{
    const cb = 'gv'+Date.now();
    window[cb] = r => { delete window[cb]; r.status==='error' ? rej(new Error(r.errors?.[0]?.detailed_message||'Sheet error')) : res(r.table); };
    const s = document.createElement('script');
    s.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?headers=1&sheet=${encodeURIComponent(SHEET_NAME)}&tqx=responseHandler:${cb}`;
    s.onerror = () => rej(new Error('Gagal memuat Google Sheet. Pastikan sheet dibagikan "Anyone with the link – Viewer".'));
    document.body.appendChild(s);
    setTimeout(()=>rej(new Error('Timeout memuat data')),20000);
  });
}
function cellVal(c){
  if(!c) return '';
  if(typeof c.v==='string' && c.v.startsWith('Date(')){
    const a = c.v.slice(5,-1).split(',').map(Number);
    return new Date(a[0],a[1],a[2]||1,a[3]||0,a[4]||0);
  }
  return c.v ?? c.f ?? '';
}
function parseDate(v){
  if(v instanceof Date) return v;
  const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
  return m ? new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0)) : null;
}
const num = v => { const n = parseFloat(String(v).replace(/[^\d.-]/g,'')); return isFinite(n)&&n>0?n:0; };

function normalize(table){
  const cols = table.cols.map(c=>(c.label||'').trim());
  const idx = name => cols.findIndex(c=>c.toLowerCase().startsWith(name.toLowerCase()));
  const I = {date:idx('Tanggal'),plat:idx('Platform'),acc:idx('Akun'),jenis:idx('Jenis Akun'),cap:idx('Konten'),url:idx('URL'),cat:idx('Kategori'),sent:idx('Sentimen'),likes:idx('Likes'),com:idx('Komentar'),sh:idx('Shares'),views:idx('Views'),fol:idx('Followers'),kw:idx('Kata Kunci'),note:idx('Catatan')};
  return table.rows.map(r=>{
    const g = k => I[k]<0 ? '' : cellVal(r.c[I[k]]);
    const d = parseDate(g('date'));
    const o = {date:d,plat:String(g('plat')).trim(),acc:String(g('acc')).trim(),jenis:String(g('jenis')).trim(),cap:String(g('cap')),url:String(g('url')),cat:String(g('cat')).trim(),sent:String(g('sent')).trim(),likes:num(g('likes')),com:num(g('com')),sh:num(g('sh')),views:num(g('views')),fol:num(g('fol')),kw:String(g('kw')),note:String(g('note')).trim()};
    o.eng = o.likes+o.com*2+o.sh*3;
    return o;
  }).filter(o=>o.date && o.plat && SENTS.includes(o.sent));
}
const dkey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

function fillSelect(id,vals){ const s=$(id); [...new Set(vals)].filter(Boolean).sort().forEach(v=>s.insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`)); }

function applyFilters(){
  const p=$('#fPlat').value,c=$('#fCat').value,j=$('#fJenis').value,f=$('#fFrom').value,t=$('#fTo').value;
  F = ALL.filter(o=>(!p||o.plat===p)&&(!c||o.cat===c)&&(!j||o.jenis===j)&&(!f||dkey(o.date)>=f)&&(!t||dkey(o.date)<=t));
  state.page=0; render();
}

/* ---- charts helpers ---- */
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
function chart(id,cfg){
  charts[id]?.destroy();
  Chart.defaults.color = css('--muted'); Chart.defaults.borderColor = css('--line'); Chart.defaults.font.family='Inter';
  charts[id] = new Chart(document.getElementById(id),cfg);
}
const countBy = (arr,fn) => arr.reduce((m,o)=>{const k=fn(o);m[k]=(m[k]||0)+1;return m},{});

/* ---- stopwords for word cloud ---- */
const STOP = new Set('yang dan di ke dari ini itu untuk dengan pada atau juga sudah saya kamu kami kita mereka ada tidak bisa akan karena jadi aja ya yg ga gak nggak tdk utk dgn dr sy aku kak min admin mau lagi sama apa kalau kalo kok sih dong nya the to of in for a an is are on and or you your my we it this that be at by as with https http www com co id amp btn bank bankbtn bale baleby by tapi masih belum lebih banyak hanya saat oleh agar bagi para semua setiap secara hal dalam tersebut adalah sebagai serta telah dapat bahwa harus hari pak bu buat udah emang pun lah kah nih tuh deh rp mas mbak gimana kenapa kapan dimana siapa berapa ok oke'.split(' '));
function words(list){
  const m={};
  list.forEach(o=>o.cap.toLowerCase().replace(/https?:\S+|[@#]\S+/g,' ').replace(/[^a-zÀ-ɏ\s]/g,' ').split(/\s+/).forEach(w=>{if(w.length>3&&!STOP.has(w))m[w]=(m[w]||0)+1}));
  return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,60);
}

/* ---- render ---- */
function render(){
  const n=F.length, cnt=countBy(F,o=>o.sent); SENTS.forEach(s=>cnt[s]=cnt[s]||0);
  const pct = x => n? (x/n*100).toFixed(1)+'%' : '0%';
  const dates=F.map(o=>o.date).sort((a,b)=>a-b);
  $('#meta').textContent = n ? `${fmt(n)} data • ${dates[0].toLocaleDateString('id-ID')} – ${dates[n-1].toLocaleDateString('id-ID')}` : 'Tidak ada data';
  $('#kTotal').textContent=fmt(n); $('#kTotalS').textContent=`${Object.keys(countBy(F,o=>o.plat)).length} platform • ${fmt(new Set(F.map(o=>o.acc)).size)} akun`;
  $('#kPos').textContent=fmt(cnt.Positif); $('#kPosS').textContent=pct(cnt.Positif)+' dari total';
  $('#kNeu').textContent=fmt(cnt.Netral); $('#kNeuS').textContent=pct(cnt.Netral)+' dari total';
  $('#kNeg').textContent=fmt(cnt.Negatif); $('#kNegS').textContent=pct(cnt.Negatif)+' dari total';

  // risk
  const negP = n? cnt.Negatif/n*100 : 0;
  const fraud = F.filter(o=>/penipuan|impersonasi/i.test(o.cat)).length;
  let lvl='RENDAH',col=C.Positif; if(negP>=10||fraud>=15){lvl='SEDANG';col=css('--orange')} if(negP>=20){lvl='TINGGI';col=C.Negatif}
  $('#rLvl').textContent=lvl; $('#rLvl').style.color=col;
  $('#gauge').style.background=`conic-gradient(${col} ${Math.min(negP*3,100)}%, ${css('--panel2')} 0)`;
  const negCat = Object.entries(countBy(F.filter(o=>o.sent==='Negatif'),o=>o.cat)).sort((a,b)=>b[1]-a[1]);
  $('#rNarr').innerHTML = negCat.length? `${esc(negCat[0][0])} <span class="pill p-Negatif">${negCat[0][1]} negatif</span>` : 'Tidak ada narasi negatif';
  $('#rDesc').textContent = `Sentimen negatif ${negP.toFixed(1)}% dari total percakapan. ${fraud? fraud+' konten terindikasi penipuan/impersonasi akun BTN.':''}`;

  // trend
  const days=[...new Set(F.map(o=>dkey(o.date)))].sort();
  const byDay=s=>days.map(d=>F.filter(o=>o.sent===s&&dkey(o.date)===d).length);
  chart('chTrend',{type:'line',data:{labels:days.map(d=>d.slice(5)),datasets:SENTS.map(s=>({label:s,data:byDay(s),borderColor:C[s],backgroundColor:C[s]+'33',fill:true,tension:.35,pointRadius:2}))},options:{maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true}}}});

  // SOV
  const plat=Object.entries(countBy(F,o=>o.plat)).sort((a,b)=>b[1]-a[1]);
  chart('chSov',{type:'doughnut',data:{labels:plat.map(p=>p[0]),datasets:[{data:plat.map(p=>p[1]),backgroundColor:PLAT_C,borderWidth:0}]},options:{maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'right'},tooltip:{callbacks:{label:c=>`${c.label}: ${c.raw} (${pct(c.raw)})`}}}}});

  // summary
  const topCat=Object.entries(countBy(F,o=>o.cat)).sort((a,b)=>b[1]-a[1]);
  $('#summary').innerHTML = n? `Selama periode ini tercatat <b>${fmt(n)}</b> percakapan relevan tentang Bank BTN. Kanal terbesar adalah <b>${esc(plat[0][0])}</b> (${pct(plat[0][1])}). Topik dominan: <b>${esc(topCat[0][0])}</b> (${topCat[0][1]} konten). Sentimen didominasi <b>${SENTS.reduce((a,b)=>cnt[a]>=cnt[b]?a:b)}</b>, dengan negatif ${pct(cnt.Negatif)}.` : '–';

  // reco
  const reco=[];
  if(negCat[0]) reco.push(`Prioritaskan respons untuk isu <b>${esc(negCat[0][0])}</b> — ${negCat[0][1]} konten negatif.`);
  if(fraud) reco.push(`Tindaklanjuti ${fraud} akun/konten penipuan: laporkan ke platform & sebar edukasi anti-fraud.`);
  const negPlat=Object.entries(countBy(F.filter(o=>o.sent==='Negatif'),o=>o.plat)).sort((a,b)=>b[1]-a[1]);
  if(negPlat[0]) reco.push(`Perkuat customer care di <b>${esc(negPlat[0][0])}</b> (kanal dengan keluhan terbanyak).`);
  if(topCat.find(c=>/digital|bale/i.test(c[0]))) reco.push('Amplifikasi konten positif promo/fitur <b>bale by BTN</b> melalui kolaborasi merchant & KOL.');
  reco.push('Pantau lonjakan harian sentimen negatif & siapkan holding statement.');
  $('#reco').innerHTML=reco.map(r=>`<li>${r}</li>`).join('');

  renderDrivers(); renderTopNeg(); renderCloud(); renderAcc(); renderAnalytics(); renderTable();
}
function renderDrivers(){
  const s=state.drv, sub=F.filter(o=>o.sent===s);
  const m=countBy(sub,o=>o.note||o.cat); const arr=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8); const max=arr[0]?.[1]||1;
  $('#drivers').innerHTML = arr.map(([k,v])=>`<div class="row"><span>${esc(k)}</span><b>${v}</b><div class="track"><i style="width:${v/max*100}%;background:${C[s]}"></i></div></div>`).join('')||'<span style="color:var(--muted)">Tidak ada data</span>';
}
function postHtml(o){return `<div class="post"><div class="h"><b>${esc(o.acc)}</b>· ${esc(o.plat)} · ${o.date.toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})} <span class="pill p-${o.sent}">${o.sent}</span>${o.url?`<a href="${esc(o.url)}" target="_blank" rel="noopener" style="margin-left:auto">Buka ↗</a>`:''}</div><p>${esc(o.cap.slice(0,240))}${o.cap.length>240?'…':''}</p><div class="h" style="margin-top:6px">❤ ${fmt(o.likes)} · 💬 ${fmt(o.com)} · ↻ ${fmt(o.sh)} · ${esc(o.cat)}</div></div>`}
function renderTopNeg(){
  const l=F.filter(o=>o.sent==='Negatif').sort((a,b)=>b.eng-a.eng||b.date-a.date).slice(0,10);
  $('#topNeg').innerHTML=l.map(postHtml).join('')||'<span style="color:var(--muted)">Tidak ada postingan negatif 🎉</span>';
}
function renderCloud(){
  const s=state.wc, w=words(s?F.filter(o=>o.sent===s):F); const max=w[0]?.[1]||1;
  const col = s?C[s]:css('--blue');
  $('#cloud').innerHTML=w.sort(()=>Math.random()-.5).map(([k,v])=>{const r=v/max;return `<span title="${v}x" style="font-size:${12+r*26}px;color:${col};opacity:${.45+r*.55}">${esc(k)}</span>`}).join('')||'<span style="color:var(--muted)">–</span>';
}
function renderAcc(){
  const s=state.acc, sub=s?F.filter(o=>o.sent===s):F; const m={};
  sub.forEach(o=>{(m[o.acc]??={acc:o.acc,plat:o.plat,jenis:o.jenis,n:0,eng:0}).n++;m[o.acc].eng+=o.eng});
  const arr=Object.values(m).sort((a,b)=>b.n-a.n||b.eng-a.eng).slice(0,5);
  $('#topAcc').innerHTML=arr.map((a,i)=>`<div class="post" style="display:flex;align-items:center;gap:12px"><div style="font-weight:800;font-size:20px;color:var(--muted);width:22px">${i+1}</div><div style="flex:1;min-width:0"><b style="overflow-wrap:anywhere">${esc(a.acc)}</b><div class="h">${esc(a.plat)} · ${esc(a.jenis)}</div></div><div style="text-align:right"><b>${a.n}</b><div class="h">konten</div></div></div>`).join('')||'<span style="color:var(--muted)">–</span>';
}
function renderAnalytics(){
  const plats=[...new Set(F.map(o=>o.plat))].sort();
  chart('chPlatSent',{type:'bar',data:{labels:plats,datasets:SENTS.map(s=>({label:s,data:plats.map(p=>F.filter(o=>o.plat===p&&o.sent===s).length),backgroundColor:C[s],borderRadius:4}))},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{x:{stacked:true},y:{stacked:true}}}});
  const cats=Object.entries(countBy(F,o=>o.cat)).sort((a,b)=>b[1]-a[1]);
  chart('chCat',{type:'bar',data:{labels:cats.map(c=>c[0]),datasets:SENTS.map(s=>({label:s,data:cats.map(c=>F.filter(o=>o.cat===c[0]&&o.sent===s).length),backgroundColor:C[s],borderRadius:4}))},options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{x:{stacked:true},y:{stacked:true}}}});
  const days=[...new Set(F.map(o=>dkey(o.date)))].sort();
  chart('chDaily',{type:'bar',data:{labels:days.map(d=>d.slice(5)),datasets:plats.map((p,i)=>({label:p,data:days.map(d=>F.filter(o=>o.plat===p&&dkey(o.date)===d).length),backgroundColor:PLAT_C[i%8]}))},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{x:{stacked:true},y:{stacked:true}}}});
  const jen=Object.entries(countBy(F,o=>o.jenis||'—'));
  chart('chJenis',{type:'doughnut',data:{labels:jen.map(j=>j[0]),datasets:[{data:jen.map(j=>j[1]),backgroundColor:['#0057b8','#f7941d','#06b6d4','#a855f7'],borderWidth:0}]},options:{maintainAspectRatio:false,cutout:'60%',plugins:{legend:{position:'right'}}}});
  const rows=plats.map(p=>{const s=F.filter(o=>o.plat===p);const sum=k=>s.reduce((a,o)=>a+o[k],0);const neg=s.filter(o=>o.sent==='Negatif').length;return `<tr><td><b>${esc(p)}</b></td><td>${s.length}</td><td>${fmt(sum('likes'))}</td><td>${fmt(sum('com'))}</td><td>${fmt(sum('sh'))}</td><td>${fmt(sum('views'))}</td><td><span class="pill p-Negatif">${(neg/s.length*100).toFixed(1)}%</span></td></tr>`});
  $('#engTbl').innerHTML=`<thead><tr><th>Platform</th><th>Konten</th><th>Likes</th><th>Komentar</th><th>Shares</th><th>Views</th><th>% Negatif</th></tr></thead><tbody>${rows.join('')}</tbody>`;
}
const PER=50;
function tableRows(){
  const q=$('#q').value.toLowerCase(), s=$('#fSent').value;
  const r=F.filter(o=>(!s||o.sent===s)&&(!q||(o.cap+' '+o.acc).toLowerCase().includes(q)));
  const {k,d}=state.sort; return r.sort((a,b)=>(a[k]>b[k]?1:a[k]<b[k]?-1:0)*d);
}
function renderTable(){
  const r=tableRows(), pages=Math.max(1,Math.ceil(r.length/PER)); state.page=Math.min(state.page,pages-1);
  const cols=[['date','Tanggal & Jam'],['acc','Akun / Platform'],['cap','Caption'],['cat','Kategori'],['sent','Sentimen'],['com','Komentar'],['url','Link']];
  $('#rawTbl').innerHTML=`<thead><tr>${cols.map(([k,l])=>`<th data-k="${k}">${l}${state.sort.k===k?(state.sort.d>0?' ▲':' ▼'):''}</th>`).join('')}</tr></thead><tbody>${r.slice(state.page*PER,(state.page+1)*PER).map(o=>`<tr><td style="white-space:nowrap">${o.date.toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'})}</td><td><b>${esc(o.acc)}</b><div style="color:var(--muted);font-size:12px">${esc(o.plat)} · ${esc(o.jenis)}</div></td><td class="cap">${esc(o.cap)}</td><td>${esc(o.cat)}</td><td><span class="pill p-${o.sent}">${o.sent}</span></td><td>${fmt(o.com)}</td><td>${o.url?`<a href="${esc(o.url)}" target="_blank" rel="noopener">↗</a>`:''}</td></tr>`).join('')}</tbody>`;
  $('#pinfo').textContent=`${fmt(r.length)} baris • hal ${state.page+1}/${pages}`;
  document.querySelectorAll('#rawTbl th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;state.sort={k,d:state.sort.k===k?-state.sort.d:-1};renderTable()});
}

/* ---- events ---- */
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));['dash','ana','raw'].forEach(t=>$('#tab-'+t).classList.toggle('hide',t!==b.dataset.tab))});
document.querySelectorAll('.seg[data-g]').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));state[g.dataset.g]=b.dataset.v;({drv:renderDrivers,wc:renderCloud,acc:renderAcc})[g.dataset.g]()}));
['#fPlat','#fCat','#fJenis','#fFrom','#fTo'].forEach(id=>$(id).onchange=applyFilters);
$('#fReset').onclick=()=>{['#fPlat','#fCat','#fJenis','#fFrom','#fTo'].forEach(id=>$(id).value='');applyFilters()};
$('#q').oninput=()=>{state.page=0;renderTable()}; $('#fSent').onchange=()=>{state.page=0;renderTable()};
$('#prev').onclick=()=>{state.page=Math.max(0,state.page-1);renderTable()}; $('#next').onclick=()=>{state.page++;renderTable()};
$('#dl').onclick=()=>{const ws=XLSX.utils.json_to_sheet(tableRows().map(o=>({Tanggal:dkey(o.date)+' '+o.date.toTimeString().slice(0,5),Platform:o.plat,Akun:o.acc,'Jenis Akun':o.jenis,Konten:o.cap,URL:o.url,Kategori:o.cat,Sentimen:o.sent,Likes:o.likes,Komentar:o.com,Shares:o.sh,Views:o.views,Catatan:o.note})));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Data');XLSX.writeFile(wb,'btn-monitoring.xlsx')};
$('#theme').onclick=()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('btn-theme',r.dataset.theme)}catch(e){}render()};
try{const t=localStorage.getItem('btn-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}

/* ---- boot ---- */
loadSheet().then(t=>{
  ALL=normalize(t);
  fillSelect('#fPlat',ALL.map(o=>o.plat)); fillSelect('#fCat',ALL.map(o=>o.cat)); fillSelect('#fJenis',ALL.map(o=>o.jenis));
  F=ALL.slice(); render();
}).catch(e=>{ $('#errbox').innerHTML=`<div class="err"><b>Data tidak dapat dimuat.</b> ${esc(e.message)}</div>`; })
.finally(()=>{ const l=$('#loader'); l.style.opacity=0; setTimeout(()=>l.remove(),500); });
