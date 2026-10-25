/* ===== KARHUTLA OPS CONSOLE — tampilan utama bergaya command center =====
   Membaca data yang sama dengan dashboard (cache.post + state.range) dan menggambar ulang setiap kali data berubah. */
(() => {
  const ICON = {
    spark: '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.01"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    wave: '<path d="M3 12h3l2-6 4 12 3-9 2 3h4"/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
    flame: '<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.6 3-5.3 3.5-9 2.5 1.5 4 3.5 4 6 1-.8 1.6-2 1.7-3.3 2 1.6 3.8 4 3.8 6.3 0 3.4-2.5 6-6.5 6z"/>',
    layers: '<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>',
    arrow: '<path d="M7 17L17 7M9 7h8v8"/>',
    link: '<path d="M7 17L17 7M9 7h8v8"/>'
  };
  const ic = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f = n => Number(n).toLocaleString('id-ID');
  const pc = (a, b, d = 1) => b ? (a / b * 100).toFixed(d).replace('.', ',') + '%' : '0%';
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const tg = t => { const [, m, d] = t.split('-'); return `${+d} ${BLN[m - 1]}`; };
  const TEAL = '#46D6C8', AMBER = '#FFC46B', ORANGE = '#FF7F3B', GREY = '#8A97A6';

  const css = document.createElement('style');
  css.textContent = `
.oc{position:relative;margin:0 0 22px;font-family:var(--f-body)}
.oc-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:6px 2px 16px}
.oc-head h1{margin:0}
.oc-sub{display:flex;align-items:center;gap:8px;color:var(--mute);font-size:13px;margin-top:8px}
.oc-dot{width:7px;height:7px;border-radius:50%;background:${TEAL};box-shadow:0 0 0 0 rgba(70,214,200,.6);animation:ocLive 1.8s infinite}
.oc-pills{display:flex;gap:8px;flex-wrap:wrap}
.oc-pill{display:flex;align-items:center;gap:10px;height:40px;padding:0 16px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-size:13px;color:var(--ink);white-space:nowrap}
.oc-pill small{color:var(--mute);font-size:12.5px}.oc-pill i{width:1px;height:16px;background:var(--line)}
.oc-stage{position:relative;height:640px;border-radius:28px;overflow:hidden;border:1px solid var(--line);
  background:radial-gradient(70% 60% at 50% 35%,rgba(70,214,200,.08),transparent 70%),radial-gradient(circle at 1px 1px,rgba(160,200,210,.10) 1px,transparent 1.5px) 0 0/26px 26px,rgba(0,0,0,.35)}
[data-theme=light] .oc-stage{background:radial-gradient(70% 60% at 50% 35%,rgba(70,214,200,.12),transparent 70%),radial-gradient(circle at 1px 1px,rgba(4,7,10,.08) 1px,transparent 1.5px) 0 0/26px 26px,rgba(255,255,255,.5)}
.oc-map{position:absolute;left:300px;right:330px;top:40px;bottom:200px}
.oc-map .lokmap{position:absolute!important;inset:0;aspect-ratio:auto!important;background:none!important;border:0!important;border-radius:0!important}
.oc-map .lokmap .badge,.oc-map .lokmap .legend,.oc-map .lokmap .grid,.oc-map .lokmap .scan{display:none}
.oc-map .lokmap .isl{stroke:rgba(70,214,200,.35)!important;stroke-width:.8!important;stroke-opacity:1!important}
.oc-sweep{position:absolute;top:0;bottom:0;left:0;width:220px;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(70,214,200,.06) 80%,rgba(70,214,200,.22));will-change:transform;transform:translateX(-240px)}
.oc-p{position:absolute;border-radius:24px;padding:18px 18px 16px;background:linear-gradient(180deg,var(--glass-hi),transparent 40%),var(--card);border:1px solid var(--line);box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 18px 50px rgba(0,0,0,.35)}
[data-theme=light] .oc-p{box-shadow:inset 0 1px 0 #fff,0 14px 40px rgba(10,30,40,.10)}
.oc-brief{left:18px;top:18px;width:270px}
.oc-alerts{right:18px;top:18px;width:310px;bottom:200px;display:flex;flex-direction:column}
.oc-pulse{left:18px;right:18px;bottom:18px;height:166px;display:grid;grid-template-columns:200px repeat(4,minmax(0,1fr));gap:12px;padding:14px}
.oc-t{display:flex;align-items:center;justify-content:space-between;gap:8px}
.oc-t h3,.oc-intro h3{margin:0;font-size:16px;font-weight:500;letter-spacing:.01em;color:var(--ink);text-transform:none!important;font-family:var(--f-body)!important}
.oc-upd{display:flex;align-items:center;gap:6px;color:var(--mute);font-size:11.5px;margin-top:4px}
.oc-upd:before{content:"";width:6px;height:6px;border-radius:50%;background:${TEAL}}
.chipx{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-radius:8px;font-size:11.5px;font-weight:500;border:1px solid transparent;white-space:nowrap}
.chipx.hi{color:${ORANGE};background:rgba(255,127,59,.12);border-color:rgba(255,127,59,.25)}
.chipx.md{color:${AMBER};background:rgba(255,196,107,.12);border-color:rgba(255,196,107,.25)}
.chipx.lo{color:${TEAL};background:rgba(70,214,200,.12);border-color:rgba(70,214,200,.25)}
[data-theme=light] .chipx.md{color:#B7791F}[data-theme=light] .chipx.lo{color:#13897E}
.oc-big{display:flex;align-items:baseline;gap:8px;margin:14px 0 2px}
.oc-big b{font-size:34px;font-weight:500;letter-spacing:-.02em;color:var(--ink)}
.oc-big small{color:${ORANGE};font-size:12.5px;font-weight:500}
.oc-desc{font-size:12.5px;line-height:1.5;color:var(--mute);margin:10px 0 12px}.oc-desc b{color:var(--ink);font-weight:500}
.oc-kv{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px}
.oc-kv div{font-size:11px;color:var(--mute)}.oc-kv b{display:block;margin-top:3px;font-size:13px;color:var(--ink);font-weight:500}
.oc-cta{width:100%;height:44px;border:0;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;font:600 13.5px var(--f-body);color:#04201D;
  background:linear-gradient(180deg,#5EE3D6,#2FB3A6);box-shadow:0 0 0 1px rgba(70,214,200,.45),0 8px 26px rgba(70,214,200,.3);cursor:pointer}
.oc-cta:hover{filter:brightness(1.06)}
.oc-tabs{display:flex;gap:6px;margin:14px 0 12px}
.oc-tabs button{flex:1;height:34px;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:var(--mute);font:500 12.5px var(--f-body);cursor:pointer}
.oc-tabs button.on{color:#04201D;background:linear-gradient(180deg,#5EE3D6,#2FB3A6);border-color:transparent;box-shadow:0 0 16px rgba(70,214,200,.35)}
.oc-list{flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding-right:2px;scrollbar-width:thin}
.oc-item{display:grid;grid-template-columns:38px 1fr;gap:10px;padding:12px;border-radius:16px;background:var(--card2);border:1px solid var(--line)}
.oc-ico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;color:${ORANGE};background:rgba(255,127,59,.10);border:1px solid rgba(255,127,59,.2)}
.oc-ico.t{color:${TEAL};background:rgba(70,214,200,.1);border-color:rgba(70,214,200,.22)}
.oc-ico.a{color:${AMBER};background:rgba(255,196,107,.1);border-color:rgba(255,196,107,.22)}
.oc-item h4{margin:0 0 3px;font-size:13px;font-weight:500;color:var(--ink);display:flex;justify-content:space-between;gap:6px}
.oc-item p{margin:0;font-size:12px;line-height:1.45;color:var(--mute);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.oc-item .oc-meta{display:flex;align-items:center;gap:8px;margin-top:7px;font-size:11px;color:var(--mute)}
.oc-item a{color:${AMBER};text-decoration:none;display:inline-flex;align-items:center;gap:2px}
[data-theme=light] .oc-item a{color:#B7791F}
.oc-pt{border-radius:18px;background:var(--card2);border:1px solid var(--line);padding:12px 14px;display:flex;flex-direction:column;min-width:0;position:relative;overflow:hidden}
.oc-pt .oc-t h3{font-size:13.5px}
.oc-pt .v{font-size:24px;font-weight:500;color:var(--ink);margin-top:8px;letter-spacing:-.01em}.oc-pt .v small{font-size:12px;color:var(--mute);font-weight:400;margin-left:4px}
.oc-pt svg.sp{position:absolute;left:0;right:0;bottom:0;width:100%;height:58px}
.oc-intro h3{font-size:18px!important}.oc-intro p{margin:6px 0 0;font-size:12px;color:var(--mute);line-height:1.45}
.oc-intro{background:none;border:0;padding:6px 6px}
@keyframes ocLive{0%{box-shadow:0 0 0 0 rgba(70,214,200,.6)}70%{box-shadow:0 0 0 9px rgba(70,214,200,0)}100%{box-shadow:0 0 0 0 rgba(70,214,200,0)}}
@keyframes ocSweep{from{transform:translateX(-240px)}to{transform:translateX(1500px)}}
@keyframes ocBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes ocDraw{from{stroke-dashoffset:var(--len)}to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:no-preference){
  .oc-sweep{animation:ocSweep 9s linear infinite}
  .oc-pt .bar{transform-origin:bottom;animation:ocBar .9s cubic-bezier(.2,.7,.3,1) both}
  .oc-pt path.ln{stroke-dasharray:var(--len);animation:ocDraw 1.4s ease-out both}
}
/* sembunyikan hero & KPI lama: diganti console */
#viewDash>.kpis,.content>.page-head.hero{display:none!important}
@media(max-width:1180px){
  .oc-stage{height:auto;padding:14px;display:grid;gap:12px;grid-template-columns:1fr 1fr}
  .oc-map{position:relative;left:auto;right:auto;top:auto;bottom:auto;height:300px;grid-column:1/-1}
  .oc-p{position:relative;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;width:auto!important;height:auto!important}
  .oc-alerts{max-height:520px}
  .oc-pulse{grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr))}
  .oc-intro{grid-column:1/-1}
  .oc-pt{min-height:140px}
}
@media(max-width:640px){
  .oc-stage{grid-template-columns:1fr;padding:10px;border-radius:22px}
  .oc-map{height:200px}
  .oc-pills{width:100%}.oc-pill{height:36px;padding:0 12px;font-size:12px}
}`;
  document.head.append(css);

  let tab = 'neg';
  function build() {
    const all = (typeof cache !== 'undefined' && cache.post) || [];
    const rg = (typeof state !== 'undefined' && state.range) || {};
    const D = all.filter(r => !rg.from || (r.tgl >= rg.from && r.tgl <= rg.to));
    const view = document.getElementById('viewDash'); if (!view || !D.length) return;
    let root = document.getElementById('opsConsole');
    if (!root) { root = document.createElement('section'); root.id = 'opsConsole'; root.className = 'oc'; view.prepend(root); }
    const T = D.length, neg = D.filter(r => r.sent === 'negatif'), pos = D.filter(r => r.sent === 'positif');
    const negP = neg.length / T * 100, nsi = Math.round((pos.length - neg.length) / T * 100);
    const cnt = (a, k) => { const m = {}; a.forEach(x => { const v = typeof k === 'function' ? k(x) : x[k]; m[v] = (m[v] || 0) + 1; }); return Object.entries(m).sort((x, y) => y[1] - x[1]); };
    const days = [...new Set(D.map(r => r.tgl))].sort();
    const perDay = days.map(d => { const R = D.filter(r => r.tgl === d); return { d, t: R.length, n: R.filter(r => r.sent === 'negatif').length, p: R.filter(r => r.sent === 'positif').length }; });
    const last = perDay.at(-1) || { t: 0 }, prev7 = perDay.slice(-8, -1), avg7 = prev7.length ? prev7.reduce((s, x) => s + x.t, 0) / prev7.length : 0;
    const chg = avg7 ? Math.round((last.t - avg7) / avg7 * 100) : 0;
    const peak = perDay.reduce((a, b) => b.n > a.n ? b : a, perDay[0]);
    const lvl = negP >= 35 ? ['Tinggi', 'hi'] : negP >= 20 ? ['Sedang', 'md'] : ['Rendah', 'lo'];
    const negTop = cnt(neg.filter(r => r.topik && r.topik !== 'Lainnya'), 'topik');
    const lok = cnt(D.filter(r => r.lokasi && r.lokasi !== 'Tidak menyebutkan lokasi'), 'lokasi');
    const plat = cnt(D, 'platform');
    const per = rg.from ? (rg.from === rg.to ? tg(rg.from) : `${tg(rg.from)} – ${tg(rg.to)}`) : '';
    const drLabel = document.getElementById('drLabel')?.textContent || 'Semua periode';

    // ---- Alerts list ----
    const akun = r => /profile\.php|^\d+$/.test(r.user) ? (r.nama || r.user) : '@' + r.user;
    let items = '';
    if (tab === 'neg') items = [...neg].sort((a, b) => b.eng - a.eng).slice(0, 6).map(r => `<div class="oc-item"><span class="oc-ico">${ic('alert')}</span><div>
        <h4><span>${esc(r.topik || 'Negatif')}</span><span class="chipx hi">Negatif</span></h4><p>“${esc(r.text.slice(0, 180))}”</p>
        <div class="oc-meta"><span>${esc(akun(r))} · ${esc(r.platform)} · ${tg(r.tgl)}</span>${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener">Lihat ${ic('link', 12)}</a>` : ''}</div></div></div>`).join('');
    if (tab === 'lok') items = lok.slice(0, 7).map(([k, v]) => { const R = D.filter(r => r.lokasi === k), n = R.filter(r => r.sent === 'negatif').length, np = n / v * 100;
        const c = np >= 60 ? ['hi', 'Kritis'] : np >= 45 ? ['md', 'Waspada'] : ['lo', 'Terkendali'];
        return `<div class="oc-item"><span class="oc-ico a">${ic('pin')}</span><div><h4><span>${esc(k)}</span><span class="chipx ${c[0]}">${c[1]}</span></h4>
          <p>${f(v)} postingan (${pc(v, T)}) · negatif ${pc(n, v, 0)}</p></div></div>`; }).join('');
    if (tab === 'akun') { const acc = {}; neg.filter(r => r.user).forEach(r => { const k = akun(r); (acc[k] = acc[k] || { n: 0, e: 0, p: r.platform }).n++; acc[k].e += r.eng; });
      items = Object.entries(acc).sort((a, b) => b[1].n - a[1].n || b[1].e - a[1].e).slice(0, 7).map(([k, a]) => `<div class="oc-item"><span class="oc-ico t">${ic('user')}</span><div>
        <h4><span>${esc(k)}</span><span class="chipx hi">${a.n} post</span></h4><p>${esc(a.p)} · ${f(a.e)} engagement pada postingan negatif</p></div></div>`).join(''); }

    // ---- mini charts ----
    const W = 260, Hh = 58, mx = Math.max(1, ...perDay.map(x => x.t));
    const pts = perDay.map((x, i) => [perDay.length > 1 ? i / (perDay.length - 1) * W : W / 2, Hh - 6 - x.t / mx * (Hh - 14)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
    const spark = `<svg class="sp" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><defs><linearGradient id="ocg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TEAL}" stop-opacity=".35"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></linearGradient></defs>
      <path d="${line}L${W} ${Hh}L0 ${Hh}Z" fill="url(#ocg)"/><path class="ln" style="--len:900" d="${line}" fill="none" stroke="${TEAL}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
    const mn = Math.max(1, ...perDay.map(x => x.n)), bw = W / Math.max(1, perDay.length);
    const bars = `<svg class="sp" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none">${perDay.map((x, i) => { const h = Math.max(2, x.n / mn * (Hh - 10)), t = x.n / mn;
      return `<rect class="bar" style="animation-delay:${i * 25}ms" x="${(i * bw + bw * .2).toFixed(1)}" y="${(Hh - h).toFixed(1)}" width="${(bw * .6).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${t > .66 ? ORANGE : t > .33 ? AMBER : '#5FA8A0'}"/>`; }).join('')}</svg>`;
    const g = (nsi + 100) / 200, ang = Math.PI * (1 - g), gx = 60 + 46 * Math.cos(ang), gy = 58 - 46 * Math.sin(ang);
    const gauge = `<svg class="sp" viewBox="0 0 120 64" style="height:64px"><defs><linearGradient id="ocgg" x1="0" x2="1"><stop offset="0" stop-color="${ORANGE}"/><stop offset=".5" stop-color="${AMBER}"/><stop offset="1" stop-color="${TEAL}"/></linearGradient></defs>
      <path d="M14 58A46 46 0 0 1 106 58" fill="none" stroke="url(#ocgg)" stroke-width="5" stroke-linecap="round" opacity=".9"/><line x1="60" y1="58" x2="${gx.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><circle cx="60" cy="58" r="3.5" fill="var(--ink)"/></svg>`;
    const pmax = Math.max(1, ...plat.map(p => p[1]));
    const platBars = `<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">${plat.slice(0, 4).map(([k, v]) => `<div style="display:grid;grid-template-columns:62px 1fr 34px;gap:6px;align-items:center;font-size:11px;color:var(--mute)"><span>${esc(k)}</span><span style="height:5px;border-radius:9px;background:var(--line);overflow:hidden"><i style="display:block;height:100%;width:${v / pmax * 100}%;background:${TEAL};border-radius:9px"></i></span><span style="text-align:right;color:var(--ink)">${pc(v, T, 0)}</span></div>`).join('')}</div>`;
    const nsiChip = nsi <= -20 ? ['hi', 'Negatif'] : nsi < 10 ? ['md', 'Moderat'] : ['lo', 'Positif'];
    const chgChip = chg >= 50 ? ['hi', 'Lonjakan'] : chg >= 10 ? ['md', 'Naik'] : chg <= -10 ? ['lo', 'Turun'] : ['lo', 'Stabil'];

    root.innerHTML = `
      <div class="oc-head"><div><h1>Karhutla Ops Console</h1><div class="oc-sub"><span class="oc-dot"></span>Monitoring percakapan media sosial · ${esc(per)} · ${f(T)} postingan</div></div>
        <div class="oc-pills"><span class="oc-pill"><small>Negara</small><i></i>Indonesia</span><span class="oc-pill"><small>Isu</small><i></i>Karhutla</span><span class="oc-pill"><small>Periode</small><i></i>${esc(drLabel)}</span></div></div>
      <div class="oc-stage">
        <div class="oc-sweep"></div>
        <div class="oc-map"><div class="lokmap"></div></div>
        <div class="oc-p oc-brief">
          <div class="oc-t"><h3>AI Situation Brief</h3><span class="chipx ${lvl[1]}">${lvl[0]}</span></div>
          <div class="oc-upd">Diperbarui otomatis</div>
          <div class="oc-big"><b>${pc(neg.length, T, 1)}</b><small>sentimen negatif</small></div>
          <p class="oc-desc">Isu dominan: <b>${esc(negTop[0]?.[0] || '-')}</b>${lok[0] ? `. Lokasi paling disorot: <b>${esc(lok[0][0])}</b> (${pc(lok[0][1], T)})` : ''}. Puncak negatif pada <b>${peak ? tg(peak.d) : '-'}</b> (${peak ? f(peak.n) : 0} postingan).</p>
          <div class="oc-kv"><div>Hari terakhir<b>${f(last.t)}</b></div><div>vs rata² 7h<b style="color:${chg >= 0 ? ORANGE : TEAL}">${chg >= 0 ? '+' : ''}${chg}%</b></div><div>NSI<b>${nsi > 0 ? '+' : ''}${nsi}</b></div></div>
          <button class="oc-cta" type="button" data-ai>${ic('spark', 16)} Buka AI Ops Console</button>
        </div>
        <div class="oc-p oc-alerts">
          <div class="oc-t"><h3>Alerts</h3><span class="chipx hi">${f(neg.length)} negatif</span></div>
          <div class="oc-tabs" role="tablist"><button data-t="neg" class="${tab === 'neg' ? 'on' : ''}">Negatif</button><button data-t="lok" class="${tab === 'lok' ? 'on' : ''}">Lokasi</button><button data-t="akun" class="${tab === 'akun' ? 'on' : ''}">Akun</button></div>
          <div class="oc-list">${items || '<p class="hint">Belum ada data</p>'}</div>
        </div>
        <div class="oc-p oc-pulse">
          <div class="oc-intro"><h3>Pulse · Karhutla</h3><div class="oc-upd">${esc(per)}</div><p>Ringkasan denyut percakapan pada periode terpilih.</p></div>
          <div class="oc-pt"><div class="oc-t"><h3>Volume Harian</h3><span class="chipx ${chgChip[0]}">${chgChip[1]}</span></div><div class="v">${f(last.t)}<small>hari terakhir</small></div>${spark}</div>
          <div class="oc-pt"><div class="oc-t"><h3>Sentimen Bersih</h3><span class="chipx ${nsiChip[0]}">${nsiChip[1]}</span></div><div class="v">${nsi > 0 ? '+' : ''}${nsi}<small>NSI</small></div>${gauge}</div>
          <div class="oc-pt"><div class="oc-t"><h3>Negatif Harian</h3><span class="chipx hi">Puncak ${peak ? tg(peak.d) : '-'}</span></div><div class="v">${f(neg.length)}<small>${pc(neg.length, T, 0)}</small></div>${bars}</div>
          <div class="oc-pt"><div class="oc-t"><h3>Kanal</h3><span class="chipx lo">${esc(plat[0]?.[0] || '-')}</span></div>${platBars}</div>
        </div>
      </div>`;
    const mapBox = root.querySelector('.oc-map .lokmap');
    if (window.renderIdMap && window.__lok) window.renderIdMap(mapBox, window.__lok, { H: 360, oy: 13 });
    root.querySelector('[data-ai]').onclick = () => document.querySelector('.ai-fab')?.click();
    root.querySelectorAll('.oc-tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; build(); });
  }
  // Ikon emoji di judul & tab diganti gaya bersih (tanpa emoji)
  const strip = () => document.querySelectorAll('#main h2, .tabs [role=tab]').forEach(h => { if (h.children.length === 0) h.textContent = h.textContent.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, ''); });
  window.addEventListener('lok:update', () => requestAnimationFrame(strip));
  // gambar ulang setiap kali dashboard selesai render (event dikirim app.js)
  window.addEventListener('lok:update', () => setTimeout(build, 0));
  if (window.__lok) build();
})();
