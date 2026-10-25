/* ===== GARUDA · KARHUTLA INDONESIA — Ops Console & Analitik (v2) =====
   Semua angka dihitung dari data sheet (cache.post) sesuai periode terpilih (state.range).
   Elemen tanpa data (satelit, cuaca, provinsi, dll.) sengaja tidak ditampilkan. */
(() => {
  const P = {
    spark: '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.01"/>',
    flame: '<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.6 3-5.3 3.5-9 2.5 1.5 4 3.5 4 6 1-.8 1.6-2 1.7-3.3 2 1.6 3.8 4 3.8 6.3 0 3.4-2.5 6-6.5 6z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    ext: '<path d="M7 17L17 7M9 7h8v8"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    x: '<path d="M5 4l14 16M19 4L5 20"/>',
    fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
    ig: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".9" fill="currentColor"/>',
    th: '<path d="M16.5 11.2c-.3-3-2-4.6-4.6-4.6-3 0-5 2.4-5 5.6 0 3.4 2 5.6 5.2 5.6 2.6 0 4.6-1.5 4.6-3.6 0-2.4-2.3-3.3-4.4-3-1.8.2-2.7 1.2-2.6 2.3.1 1.1 1.2 1.8 2.6 1.6 2.2-.3 3-2.6 2.8-5.4"/>',
    tt: '<path d="M14 4c.4 2.4 2 4 4.5 4.2v3.2c-1.7 0-3.2-.5-4.5-1.4V15a5 5 0 1 1-5-5v3.2a1.8 1.8 0 1 0 1.8 1.8V4z"/>',
    web: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17"/>'
  };
  const ic = (n, s = 18, sw = 1.7) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const PF = { x: ['x', '#E7E9EA'], twitter: ['x', '#E7E9EA'], facebook: ['fb', '#1877F2'], instagram: ['ig', '#E1306C'], threads: ['th', '#C9CDD2'], tiktok: ['tt', '#25F4EE'] };
  const pfIco = (p, s = 15) => { const k = PF[String(p).toLowerCase()] || ['web', '#8A97A6']; return `<span class="g-pf" style="--pc:${k[1]}">${ic(k[0], s, 1.9)}</span>`; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f = n => Number(n).toLocaleString('id-ID');
  const k = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',') + 'K' : f(n);
  const pc = (a, b, d = 1) => b ? (a / b * 100).toFixed(d).replace('.', ',') + '%' : '0%';
  const BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const tg = t => { const [, m, d] = t.split('-'); return `${+d} ${BL[m - 1]}`; };
  const tgY = t => { const [y, m, d] = t.split('-'); return `${+d} ${BL[m - 1]} ${y}`; };
  const TEAL = '#46D6C8', AMBER = '#FFC46B', ORANGE = '#FF7F3B', RED = '#F0524F', GREY = '#8A97A6';
  const NONE = 'Tidak menyebutkan lokasi';
  const cnt = (a, key) => { const m = {}; a.forEach(x => { const v = typeof key === 'function' ? key(x) : x[key]; if (v == null || v === '') return; m[v] = (m[v] || 0) + 1; }); return Object.entries(m).sort((x, y) => y[1] - x[1]); };
  const akun = r => /profile\.php|^\d+$/.test(r.user) ? (r.nama || r.user) : '@' + r.user;
  const delta = (cur, prev) => prev ? Math.round((cur - prev) / prev * 100) : null;
  const dChip = (d, invert, unit = '%') => d == null ? '' : `<span class="g-d ${(invert ? d < 0 : d > 0) ? 'good' : d === 0 ? '' : 'bad'}">${ic(d >= 0 ? 'up' : 'down', 11, 2.4)}${Math.abs(d)}${unit}</span>`;

  /* ---------------- CSS ---------------- */
  const css = document.createElement('style');
  css.textContent = `
.g-wrap{font-family:var(--f-body);color:var(--ink)}
.g-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:end;margin:4px 0 18px}
.g-eyebrow{font:500 11.5px var(--f-body);letter-spacing:.32em;color:var(--mute);text-transform:uppercase}
.g-title{margin:6px 0 6px;font-family:var(--f-display)!important;font-size:44px!important;line-height:1.05;letter-spacing:.02em!important;text-transform:uppercase}
.g-title b{font-weight:400}.g-title span{font-family:var(--f-body);font-weight:300;letter-spacing:.04em}
.g-sub{color:var(--mute);font-size:14px;max-width:560px;line-height:1.5;margin:0}
.g-kpis{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px}
.g-kpi{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:18px;background:var(--card);border:1px solid var(--line);position:relative;overflow:hidden}
.g-kpi:after{content:"";position:absolute;inset:auto -30% -60% auto;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 22%,transparent),transparent 70%)}
.g-kpi .gi{width:44px;height:44px;flex:none;border-radius:14px;display:grid;place-items:center;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 35%,transparent);box-shadow:0 0 18px color-mix(in srgb,var(--c) 22%,transparent)}
.g-kpi b{display:block;font-size:22px;font-weight:600;letter-spacing:-.01em}.g-kpi small{color:var(--mute);font-size:12px}
.g-kpi{padding-right:58px!important}.g-kpi .g-d{position:absolute;top:12px;right:12px}
.g-d{display:inline-flex;align-items:center;gap:2px;font-size:11.5px;font-weight:600;color:var(--mute)}
.g-d.bad{color:${ORANGE}}.g-d.good{color:${TEAL}}
.g-stage{position:relative;height:560px;border-radius:26px;overflow:hidden;border:1px solid var(--line);margin-bottom:16px;
  background:radial-gradient(60% 70% at 55% 45%,rgba(255,127,59,.10),transparent 65%),radial-gradient(80% 80% at 50% 120%,rgba(70,214,200,.10),transparent 60%),radial-gradient(circle at 1px 1px,rgba(160,200,210,.09) 1px,transparent 1.5px) 0 0/24px 24px,#05090C}
[data-theme=light] .g-stage{background:radial-gradient(60% 70% at 55% 45%,rgba(255,127,59,.10),transparent 65%),radial-gradient(circle at 1px 1px,rgba(4,7,10,.07) 1px,transparent 1.5px) 0 0/24px 24px,#F4F8F9}
.g-stage .g-map{position:absolute;left:300px;right:20px;top:24px;bottom:84px}
.g-map .lokmap{position:absolute!important;inset:0;aspect-ratio:auto!important;background:none!important;border:0!important;border-radius:0!important}
.g-map .lokmap .badge,.g-map .lokmap .legend,.g-map .lokmap .grid,.g-map .lokmap .scan{display:none}
.g-map .lokmap .isl{stroke:rgba(255,190,120,.35)!important;stroke-width:.7!important;stroke-opacity:1!important;filter:drop-shadow(0 0 6px rgba(255,110,50,.35))}
.g-map .lokmap .hs-lbl{font-size:15px;font-weight:600}.g-map .lokmap .hs-sub{font-size:12.5px;fill:var(--ink)}
.g-arc{fill:none;stroke:url(#gArc);stroke-width:1.3;stroke-dasharray:4 6;opacity:.8}
.g-glass{border-radius:22px;padding:16px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.01) 45%),rgba(9,14,18,.62);border:1px solid rgba(160,220,215,.16);
  -webkit-backdrop-filter:blur(16px) saturate(150%);backdrop-filter:blur(16px) saturate(150%);box-shadow:0 18px 50px rgba(0,0,0,.35)}
[data-theme=light] .g-glass{background:rgba(255,255,255,.78);border-color:rgba(4,7,10,.08);box-shadow:0 14px 40px rgba(10,30,40,.10)}
.g-int{position:absolute;left:18px;top:18px;width:270px}
.g-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.g-h h3{margin:0;font:600 15px var(--f-body)!important;text-transform:none!important;letter-spacing:.01em;color:var(--ink)}
.g-live{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:600;color:${TEAL};background:rgba(70,214,200,.12);border:1px solid rgba(70,214,200,.3)}
.g-live:before{content:"";width:6px;height:6px;border-radius:50%;background:${TEAL};animation:gPulse 1.8s infinite}
.g-scale{height:6px;border-radius:9px;background:linear-gradient(90deg,${TEAL},${AMBER},${ORANGE},${RED})}
.g-scale-l{display:flex;justify-content:space-between;font-size:11px;color:var(--mute);margin:5px 0 10px}
.g-rank{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px}
.g-rank li{display:grid;grid-template-columns:24px 1fr auto auto;gap:8px;align-items:center;font-size:13px}
.g-rank .n{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;font-size:11.5px;color:var(--mute);background:var(--card2);border:1px solid var(--line)}
.g-rank .bar{grid-column:2/-1;height:4px;border-radius:9px;background:var(--line);overflow:hidden;margin-top:-3px}
.g-rank .bar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,${AMBER},${ORANGE})}
.g-rank .v{font-weight:600}.g-rank .g-d{min-width:46px;justify-content:flex-end}
.g-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font:500 12.5px var(--f-body);cursor:pointer}
.g-btn:hover{border-color:rgba(70,214,200,.45)}
.g-btn.pri{border:0;color:#04201D;background:linear-gradient(180deg,#5EE3D6,#2FB3A6);box-shadow:0 0 18px rgba(70,214,200,.3)}
.g-int .g-btn{width:100%;margin-top:14px}
.g-ctrl{position:absolute;left:310px;right:20px;bottom:16px;display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap}
.g-seg{display:inline-flex;padding:4px;border-radius:14px;gap:2px}
.g-seg button{height:32px;padding:0 14px;border:0;border-radius:10px;background:none;color:var(--mute);font:500 12.5px var(--f-body);cursor:pointer}
.g-seg button.on{color:#04201D;background:linear-gradient(180deg,#5EE3D6,#2FB3A6)}
.g-cap{font-size:12px;color:var(--mute);padding:8px 14px;border-radius:12px}
.g-cap b{color:var(--ink);font-weight:500}
.g-grid4{display:grid;grid-template-columns:1.2fr 1.2fr 1fr 1fr;gap:14px;margin-bottom:14px}
.g-grid2{display:grid;grid-template-columns:1.7fr 1fr;gap:14px;margin-bottom:14px}
.g-grid3{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:14px;margin-bottom:14px}
.g-card{border-radius:22px;padding:16px 18px;background:linear-gradient(180deg,var(--glass-hi),transparent 40%),var(--card);border:1px solid var(--line);min-width:0;position:relative}
.g-card .g-h h3{font-size:15.5px!important}
.g-tag{font-size:11.5px;color:var(--mute);padding:4px 10px;border-radius:9px;border:1px solid var(--line);background:var(--card2);white-space:nowrap}
.g-tag.hot{color:${ORANGE};border-color:rgba(255,127,59,.35);background:rgba(255,127,59,.10)}
.g-vol{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:end}
.g-vol .big{font-size:30px;font-weight:600;line-height:1}.g-vol small{display:block;color:var(--mute);font-size:11.5px;margin-top:4px}
.g-svg{width:100%;display:block}
.g-legend{display:flex;flex-direction:column;gap:10px;font-size:12px;color:var(--mute)}
.g-legend b{display:block;font-size:17px;color:var(--ink);font-weight:600}
.g-dot{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px}
.g-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px}
.g-list li{display:grid;grid-template-columns:22px minmax(0,1fr) 70px 44px;gap:8px;align-items:center;font-size:12.5px}
.g-list li .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-list .n{color:var(--mute);font-size:11.5px;text-align:center}
.g-list .bar{height:5px;border-radius:9px;background:var(--line);overflow:hidden}.g-list .bar i{display:block;height:100%;border-radius:9px}
.g-list .p{text-align:right;font-weight:600}
.g-src li{grid-template-columns:22px minmax(0,1fr) 90px 40px}
.g-pf{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;color:var(--pc);background:color-mix(in srgb,var(--pc) 14%,transparent)}
.g-feed-tabs{display:flex;gap:6px;flex-wrap:wrap}
.g-feed-tabs button{height:30px;padding:0 13px;border-radius:10px;border:1px solid var(--line);background:var(--card2);color:var(--mute);font:500 12px var(--f-body);cursor:pointer}
.g-feed-tabs button.on{color:#04201D;border-color:transparent;background:linear-gradient(180deg,#5EE3D6,#2FB3A6)}
.g-feed{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.g-post{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:16px;background:var(--card2);border:1px solid var(--line);min-width:0}
.g-post .top{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--mute)}
.g-post .top .sn{margin-left:auto;font-size:10.5px;padding:2px 8px;border-radius:7px}
.g-post p{margin:0;font-size:12.5px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.g-post .ft{display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--mute);margin-top:auto}
.g-post a{color:${AMBER};text-decoration:none;display:inline-flex;align-items:center;gap:2px}
[data-theme=light] .g-post a{color:#B7791F}
.sn.neg{color:${ORANGE};background:rgba(255,127,59,.12)}.sn.pos{color:${TEAL};background:rgba(70,214,200,.12)}.sn.net{color:${GREY};background:rgba(138,151,166,.14)}
.g-warn{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px}
.g-warn li{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 10px;border-radius:14px;background:var(--card2);border:1px solid var(--line)}
.g-warn .wi{width:34px;height:34px;border-radius:11px;display:grid;place-items:center}
.g-warn b{display:block;font-size:13px;font-weight:600}.g-warn small{color:var(--mute);font-size:11.5px}
.g-lv{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;padding:3px 9px;border-radius:8px}
.g-lv.hi{color:${RED};background:rgba(240,82,79,.12)}.g-lv.md{color:${AMBER};background:rgba(255,196,107,.12)}.g-lv.lo{color:${TEAL};background:rgba(70,214,200,.12)}
[data-theme=light] .g-lv.md{color:#B7791F}
.g-donut{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:center}
.g-peak{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.g-peak li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;padding:11px 12px;border-radius:16px;background:var(--card2);border:1px solid var(--line)}
.g-peak .n{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;font-weight:600;color:${ORANGE};background:rgba(255,127,59,.12)}
.g-peak .meta{display:flex;justify-content:space-between;font-size:11.5px;color:var(--mute)}
.g-peak b{font-size:17px}.g-peak p{margin:3px 0 0;font-size:12px;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-cmp{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:14px;align-items:center}
.g-cmp .lokmap{position:relative!important;aspect-ratio:1000/400!important;background:none!important;border:0!important}
.g-cmp .lokmap .badge,.g-cmp .lokmap .scan,.g-cmp .lokmap .grid,.g-cmp .lokmap .hs-sub,.g-cmp .lokmap .legend{display:none}.g-cmp .lokmap .hs-lbl{font-size:22px}
.g-tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.g-tbl th{font-weight:500;color:var(--mute);text-align:left;padding:6px 6px;font-size:11.5px}
.g-tbl td{padding:7px 6px;border-top:1px solid var(--line)}.g-tbl .r{text-align:right}
.g-tbl .n{color:var(--mute)}
.g-sub-tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.g-sub-tabs button{height:30px;padding:0 12px;border-radius:10px;border:1px solid var(--line);background:var(--card2);color:var(--mute);font:500 12px var(--f-body);cursor:pointer}
.g-sub-tabs button.on{color:#04201D;border-color:transparent;background:linear-gradient(180deg,#5EE3D6,#2FB3A6)}
.g-cloud{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;align-items:center;min-height:170px;line-height:1.1}
.g-stack{display:flex;flex-direction:column;gap:12px}
.g-stack .row{display:grid;grid-template-columns:150px minmax(0,1fr) 42px;gap:10px;align-items:center;font-size:12.5px}
.g-stack .row .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-stack .sb{display:flex;height:10px;border-radius:9px;overflow:hidden;background:var(--line)}
.g-cv{position:relative;height:250px}
.g-section-t{display:flex;align-items:center;gap:10px;margin:22px 2px 12px;font:500 12px var(--f-body);letter-spacing:.22em;text-transform:uppercase;color:var(--mute)}
.g-section-t:after{content:"";flex:1;height:1px;background:var(--line)}
/* Peta bergaya bumi malam: horizon biru, awan tipis, CSS saja */
.g-stage{background:
  radial-gradient(circle 1800px at 62% 1700px,#0D2438 0px,#071624 1400px,#040B12 1755px,rgba(120,195,255,.85) 1762px,rgba(70,150,255,.22) 1775px,transparent 1820px),
  radial-gradient(40% 30% at 22% 78%,rgba(255,255,255,.045),transparent 70%),radial-gradient(30% 22% at 70% 82%,rgba(255,255,255,.035),transparent 70%),
  radial-gradient(1px 1px at 92% 12%,#fff,transparent),radial-gradient(1px 1px at 84% 6%,#cfe,transparent),radial-gradient(1px 1px at 97% 30%,#fff,transparent),#010307!important}
[data-theme=light] .g-stage{background:radial-gradient(circle 1800px at 62% 1700px,#0D2438 0px,#071624 1400px,#040B12 1755px,rgba(120,195,255,.85) 1762px,rgba(70,150,255,.22) 1775px,transparent 1820px),#010307!important}
.g-stage .g-map .lokmap .isl{stroke:rgba(255,200,120,.25)!important;filter:none!important}
.g-stage .hs-core{fill:#fff!important;stroke:#FF6A1F!important;stroke-width:3!important}
.g-stage .hs-ring{stroke:#FFB04A!important}
.e-n{font:700 13px var(--f-body);letter-spacing:.06em;fill:#fff;paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:3px}
.e-v{font:500 12.5px var(--f-body);fill:#E8EEF2;paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:3px}
.e-d{font:700 12px var(--f-body);fill:#FF6B4A;paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:3px}
.g-stage .g-arc{stroke:rgba(120,190,255,.55);stroke-dasharray:2 5}
@media(max-width:640px){.e-n{font-size:22px}.e-v,.e-d{display:none}}

/* Peta foto bumi malam (1 gambar JPG ±80–300KB, sisanya HTML ringan) */
.g-stage{background:#01040A!important;height:clamp(500px,46vw,680px)!important}
.g-earth{position:relative;width:100%;aspect-ratio:1672/941}
.g-earth img{position:absolute;inset:0;width:100%;height:100%;display:block;user-select:none}
.g-stage:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(1,4,10,.55),transparent 28%),linear-gradient(0deg,rgba(1,4,10,.7),transparent 22%)}
.g-int,.g-ctrl{z-index:2}
.g-pins{position:absolute;inset:0}
.g-pin{position:absolute;width:0;height:0}
.g-pin .dot{position:absolute;left:calc(var(--s)/-2);top:calc(var(--s)/-2);width:var(--s);height:var(--s);border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(255,90,40,.9),0 0 18px 6px rgba(255,110,40,.75)}
.g-pin .dot:after{content:"";position:absolute;inset:-9px;border-radius:50%;border:1.5px solid rgba(255,160,90,.8);animation:gRing 2.4s ease-out infinite}
.g-pin .stem{position:absolute;left:0;bottom:8px;width:1px;height:72px;background:linear-gradient(0deg,rgba(255,255,255,.75),rgba(255,255,255,.35))}
.g-pin .lab{position:absolute;left:10px;bottom:24px;white-space:nowrap;line-height:1.25;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 10px rgba(0,0,0,.6)}
.g-pin.l .lab{left:auto;right:10px;text-align:right}
.g-pin .lab b{display:block;font:700 13.5px var(--f-body);letter-spacing:.06em;color:#fff}
.g-pin .lab span{display:block;font:500 13px var(--f-body);color:#EEF3F6}
.g-pin .lab em{display:block;font:700 13px var(--f-body);font-style:normal}
.g-pin .lab em.eu{color:#FF5B3A!important}.g-pin .lab em.ed{color:#46D6C8!important}
@keyframes gRing{from{transform:scale(.6);opacity:1}to{transform:scale(1.9);opacity:0}}
@media(max-width:1100px){.g-stage{height:auto!important}.g-earth{border-radius:18px;overflow:hidden}}
@media(max-width:640px){.g-pin .stem{height:34px}.g-pin .lab{bottom:12px;left:6px}.g-pin .lab b{font-size:10px}.g-pin .lab span,.g-pin .lab em{display:none}.g-pin .dot:after{display:none}.g-pin .dot{transform:scale(.55)}.g-pin .lab b{font-size:9px}}
@media (prefers-reduced-motion:reduce){.g-pin .dot:after{animation:none}}
@keyframes gPulse{0%{box-shadow:0 0 0 0 rgba(70,214,200,.6)}70%{box-shadow:0 0 0 7px rgba(70,214,200,0)}100%{box-shadow:0 0 0 0 rgba(70,214,200,0)}}
@keyframes gDash{to{stroke-dashoffset:-40}}
@media (prefers-reduced-motion:no-preference){.g-arc{animation:gDash 2.4s linear infinite}}
/* Navigasi atas: tab dipindah ke topbar (layar lebar) */
.topbar .tabs.g-topnav{margin:0!important;padding:4px!important;border-radius:16px;background:var(--card2);border:1px solid var(--line)!important;gap:2px!important;flex-wrap:nowrap}
.topbar .tabs.g-topnav [role=tab]{border:0!important;background:none!important;padding:8px 16px!important;border-radius:12px!important;box-shadow:none!important;white-space:nowrap}
.topbar .tabs.g-topnav [role=tab].on{background:linear-gradient(180deg,rgba(70,214,200,.30),rgba(70,214,200,.12))!important;color:var(--ink)!important;box-shadow:inset 0 0 0 1px rgba(70,214,200,.5),0 0 16px rgba(70,214,200,.2)!important}
.g-ai-tab{color:${TEAL}!important;display:inline-flex!important;align-items:center;gap:6px}
.content>.tabs:empty{display:none}
/* sembunyikan yang digantikan */
.content>.page-head.hero,#viewDash>.kpis{display:none!important}
.g-hide{display:none!important}
/* Responsif */
@media(max-width:1280px){.g-kpis{grid-template-columns:repeat(2,minmax(160px,1fr))}.g-grid4{grid-template-columns:1fr 1fr}.g-feed{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:1100px){.g-hero{grid-template-columns:1fr}.g-grid2,.g-grid3{grid-template-columns:1fr}
  .g-stage{height:auto;padding:12px;display:flex;flex-direction:column;gap:12px}
  .g-stage .g-map{position:relative;left:auto;right:auto;top:auto;bottom:auto;height:320px}
  .g-int,.g-ctrl{position:relative;left:auto;right:auto;top:auto;bottom:auto;width:auto}}
@media(max-width:640px){.g-title{font-size:26px!important}.g-kpis{grid-template-columns:1fr 1fr;gap:8px}.g-kpi{padding:12px}.g-kpi .gi{width:36px;height:36px}.g-kpi b{font-size:18px}
  .g-grid4,.g-feed{grid-template-columns:1fr}.g-stage .g-map{height:210px}.g-donut{grid-template-columns:120px 1fr}.g-cmp{grid-template-columns:1fr}.g-stack .row{grid-template-columns:110px 1fr 38px}}`;
  document.head.append(css);

  /* ---------------- Data ---------------- */
  function data() {
    const all = (typeof cache !== 'undefined' && cache.post) || [];
    const rg = (typeof state !== 'undefined' && state.range) || {};
    const D = all.filter(r => !rg.from || (r.tgl >= rg.from && r.tgl <= rg.to));
    const days = [...new Set(D.map(r => r.tgl))].sort();
    const by = (R) => ({ t: R.length, n: R.filter(r => r.sent === 'negatif').length, p: R.filter(r => r.sent === 'positif').length, z: R.filter(r => r.sent === 'netral').length });
    const perDay = days.map(d => ({ d, ...by(D.filter(r => r.tgl === d)) }));
    // pembanding: 7 hari terakhir vs 7 hari sebelumnya (dalam periode)
    const last7 = days.slice(-7), prev7 = days.slice(-14, -7);
    const L = D.filter(r => last7.includes(r.tgl)), Pv = D.filter(r => prev7.includes(r.tgl));
    return { all, rg, D, days, perDay, L, Pv, by };
  }

  /* ---------------- Mini SVG charts ---------------- */
  const barsSvg = (vals, W = 300, H = 110, colorFn) => { const mx = Math.max(1, ...vals), bw = W / Math.max(1, vals.length);
    return `<svg class="g-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px">${[.25, .5, .75].map(g => `<line x1="0" x2="${W}" y1="${H * g}" y2="${H * g}" stroke="var(--line)" stroke-dasharray="3 4"/>`).join('')}
      ${vals.map((v, i) => { const h = Math.max(2, v / mx * (H - 6)); return `<rect x="${(i * bw + bw * .18).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${(bw * .64).toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${colorFn(v / mx, i)}"/>`; }).join('')}</svg>`; };
  const linesSvg = (series, W = 300, H = 110) => { const mx = Math.max(1, ...series.flatMap(s => s.v)), n = Math.max(...series.map(s => s.v.length));
    const xy = (v, i) => [n > 1 ? i / (n - 1) * W : W / 2, H - 4 - v / mx * (H - 10)];
    return `<svg class="g-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px"><defs>${series.map((s, j) => `<linearGradient id="gl${j}${s.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.c}" stop-opacity=".32"/><stop offset="1" stop-color="${s.c}" stop-opacity="0"/></linearGradient>`).join('')}</defs>
      ${[.25, .5, .75].map(g => `<line x1="0" x2="${W}" y1="${H * g}" y2="${H * g}" stroke="var(--line)" stroke-dasharray="3 4"/>`).join('')}
      ${series.map((s, j) => { const d = s.v.map((v, i) => (i ? 'L' : 'M') + xy(v, i).map(z => z.toFixed(1)).join(' ')).join('');
        return (s.fill ? `<path d="${d}L${W} ${H}L0 ${H}Z" fill="url(#gl${j}${s.id})"/>` : '') + `<path d="${d}" fill="none" stroke="${s.c}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`; }).join('')}</svg>`; };
  const heat = t => t > .75 ? RED : t > .5 ? ORANGE : t > .25 ? AMBER : '#3FBFB2';

  /* ---------------- Peta gaya "Earth at night" (ringan: SVG statis, tanpa gambar) ---------------- */
  function earthStyle(svg, isl, islL, islP) {
    const NS = 'http://www.w3.org/2000/svg', C = window.__IDCENT || {};
    const max = Math.max(1, ...isl.map(x => x[1])), byK = Object.fromEntries(isl);
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = `
      <pattern id="ePts" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="#FFD27A" opacity=".55"/><circle cx="5.5" cy="5" r=".6" fill="#FFB347" opacity=".4"/></pattern>
      <radialGradient id="eHot" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".35" stop-color="#FF8A2B"/><stop offset=".75" stop-color="#C2300F"/><stop offset="1" stop-color="#5A1206"/></radialGradient>
      <radialGradient id="eWarm" cx=".5" cy=".5" r=".65"><stop offset="0" stop-color="#FFC46B"/><stop offset=".6" stop-color="#C9702A"/><stop offset="1" stop-color="#4A2A12"/></radialGradient>
      <radialGradient id="eCool" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#5C6B4A"/><stop offset="1" stop-color="#1E2A22"/></radialGradient>
      <filter id="eGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
      <radialGradient id="eHalo"><stop offset="0" stop-color="#FF7A2B" stop-opacity=".55"/><stop offset="1" stop-color="#FF7A2B" stop-opacity="0"/></radialGradient>`;
    svg.prepend(defs);
    const g = svg.querySelector('g[transform]:last-of-type') || svg;
    const paths = [...svg.querySelectorAll('.isl')];
    // lapisan cahaya (sekali render, statis)
    const glow = document.createElementNS(NS, 'g'); glow.setAttribute('filter', 'url(#eGlow)'); glow.setAttribute('opacity', '.85');
    const tex = document.createElementNS(NS, 'g');
    paths.forEach(p => { const v = byK[p.dataset.k] || 0, t = v / max;
      p.style.fill = `url(#${t > .45 ? 'eHot' : t > .08 ? 'eWarm' : 'eCool'})`;
      if (v) { const q = p.cloneNode(); q.removeAttribute('class'); q.style.fill = t > .45 ? '#FF6A1F' : '#E08A2E'; q.style.opacity = .35 + t * .6; glow.append(q); }
      const d = p.cloneNode(); d.removeAttribute('class'); d.style.fill = 'url(#ePts)'; d.style.pointerEvents = 'none'; d.style.opacity = v ? .4 + t * .6 : .15; tex.append(d); });
    paths[0]?.parentNode.insertBefore(glow, paths[0]);
    paths.at(-1)?.after(tex);
    // halo + callout bergaya label satelit
    svg.querySelectorAll('.hs-lbl,.hs-sub').forEach(t => t.remove());
    const call = document.createElementNS(NS, 'g'); call.setAttribute('class', 'e-call');
    isl.forEach(([kk, v], i) => { const c = C[kk]; if (!c) return; const t = v / max, d = delta(islL[kk] || 0, islP[kk] || 0);
      const up = c[1] > 170 ? 1 : 0, len = 46 + (i % 2) * 18, y2 = c[1] - len, name = kk === 'Bali & Nusa Tenggara' ? 'NUSA TENGGARA' : kk.toUpperCase();
      call.insertAdjacentHTML('beforeend', `<circle cx="${c[0]}" cy="${c[1]}" r="${18 + t * 40}" fill="url(#eHalo)"/>
        <line x1="${c[0]}" y1="${c[1] - 6}" x2="${c[0]}" y2="${y2}" stroke="rgba(255,255,255,.55)" stroke-width="1"/>
        <text x="${c[0] + (c[0] > 860 ? -7 : 7)}" y="${y2 + 9}" text-anchor="${c[0] > 860 ? 'end' : 'start'}" class="e-n">${esc(name)}</text>
        <text x="${c[0] + (c[0] > 860 ? -7 : 7)}" y="${y2 + 26}" text-anchor="${c[0] > 860 ? 'end' : 'start'}" class="e-v">${k(v)} postingan</text>
        ${d != null ? `<text x="${c[0] + (c[0] > 860 ? -7 : 7)}" y="${y2 + 42}" text-anchor="${c[0] > 860 ? 'end' : 'start'}" class="e-d">${d >= 0 ? '↑ +' : '↓ '}${d}%</text>` : ''}`); });
    (svg.querySelector('.hs')?.parentNode || svg).append(call);
  }

  /* ---------------- OPS CONSOLE ---------------- */
  let feedPf = 'Semua';
  function buildConsole() {
    const view = document.getElementById('viewDash'); if (!view) return;
    const { D, days, perDay, L, Pv, by, rg } = data(); if (!D.length) return;
    let root = document.getElementById('gConsole');
    if (!root) { root = document.createElement('section'); root.id = 'gConsole'; root.className = 'g-wrap'; view.prepend(root); }
    document.getElementById('opsConsole')?.remove();
    const S = by(D), Ls = by(L), Ps = by(Pv);
    const isl = cnt(D.filter(r => r.lokasi && r.lokasi !== NONE), 'lokasi');
    const islL = Object.fromEntries(cnt(L.filter(r => r.lokasi && r.lokasi !== NONE), 'lokasi')), islP = Object.fromEntries(cnt(Pv.filter(r => r.lokasi && r.lokasi !== NONE), 'lokasi'));
    const negShareL = Ls.t ? Ls.n / Ls.t * 100 : 0, negShareP = Ps.t ? Ps.n / Ps.t * 100 : 0;
    const per = rg.from ? (rg.from === rg.to ? tgY(rg.from) : `${tg(rg.from)} – ${tgY(rg.to)}`) : '';
    const maxIsl = isl[0]?.[1] || 1;
    const topics = cnt(D.filter(r => r.topik && r.topik !== 'Lainnya'), 'topik');
    const plat = cnt(D, 'platform');
    const lastD = perDay.at(-1) || { t: 0 }, prevAvg = perDay.slice(-8, -1).reduce((s, x, _, a) => s + x.t / a.length, 0);
    const chg = prevAvg ? Math.round((lastD.t - prevAvg) / prevAvg * 100) : 0;
    const last7d = perDay.slice(-7);
    // waktu relatif terhadap postingan terbaru di data
    const stamp = r => new Date(`${r.tgl}T${(r.jamStr || '00:00')}:00`).getTime();
    const latest = Math.max(...D.map(stamp));
    const ago = r => { const m = Math.round((latest - stamp(r)) / 60000); return m < 60 ? `${m} menit lalu` : m < 1440 ? `${Math.round(m / 60)} jam lalu` : `${Math.round(m / 1440)} hari lalu`; };
    const feedSrc = (feedPf === 'Semua' ? D : D.filter(r => r.platform === feedPf)).slice().sort((a, b) => stamp(b) - stamp(a) || b.eng - a.eng).slice(0, 8);
    const snC = s => s === 'negatif' ? 'neg' : s === 'positif' ? 'pos' : 'net';
    // peringatan dini: pulau dengan negatif tinggi / lonjakan
    const warn = isl.slice(0, 6).map(([kk, v]) => { const R = D.filter(r => r.lokasi === kk), n = R.filter(r => r.sent === 'negatif').length, np = n / v * 100, d = delta(islL[kk] || 0, islP[kk] || 0);
      const lv = np >= 60 || (d != null && d >= 100) ? ['hi', 'Tinggi'] : np >= 45 || (d != null && d >= 30) ? ['md', 'Sedang'] : ['lo', 'Rendah'];
      const topT = cnt(R.filter(r => r.sent === 'negatif' && r.topik !== 'Lainnya'), 'topik')[0]?.[0] || 'percakapan meningkat';
      return { kk, v, np, d, lv, topT }; }).sort((a, b) => (b.lv[0] === 'hi') - (a.lv[0] === 'hi') || b.np - a.np);
    const nHigh = warn.filter(w => w.lv[0] === 'hi').length;

    const preset = (typeof state !== 'undefined' && state.preset) || 'all';
    root.innerHTML = `
      <div class="g-hero">
        <div><div class="g-eyebrow">Pemantauan Nasional · ${esc(per)}</div>
          <h1 class="g-title"><b>Karhutla</b> <span>Indonesia</span></h1>
          <p class="g-sub">Pemantauan percakapan media sosial secara berkala dengan analitik AI untuk deteksi dini, pemetaan risiko, dan respons cepat.</p></div>
        <div class="g-kpis">
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('chat', 22)}</span><div><b>${f(S.t)}</b><small>Total postingan</small></div>${dChip(delta(Ls.t, Ps.t), false)}</div>
          <div class="g-kpi" style="--c:${RED}"><span class="gi">${ic('heart', 22)}</span><div><b>${pc(S.n, S.t)}</b><small>Sentimen negatif</small></div>${dChip(Ps.t ? Math.round(negShareL - negShareP) : null, true, ' pp')}</div>
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('pin', 22)}</span><div><b>${isl.length}<small style="font-size:13px"> / 7</small></b><small>Pulau disebut</small></div></div>
          <div class="g-kpi" style="--c:${ORANGE}"><span class="gi">${ic('alert', 22)}</span><div><b>${f(S.n)}</b><small>Postingan negatif</small></div>${dChip(delta(Ls.n, Ps.n), true)}</div>
        </div>
      </div>

      <div class="g-stage">
        <div class="g-earth"><img src="earth.jpg?v=1" srcset="earth-sm.jpg?v=1 836w, earth.jpg?v=1 1672w" sizes="(max-width:700px) 100vw, 1400px" alt="Peta sebaran percakapan karhutla di Indonesia" decoding="async" fetchpriority="high"><div class="g-pins"></div></div>
        <div class="g-glass g-int">
          <div class="g-h"><h3>Intensitas Percakapan</h3><span class="g-live">Live</span></div>
          <div class="g-scale"></div><div class="g-scale-l"><span>Rendah</span><span>Tinggi</span></div>
          <ol class="g-rank">${isl.slice(0, 6).map(([kk, v], i) => { const d = delta(islL[kk] || 0, islP[kk] || 0);
            return `<li><span class="n">${i + 1}</span><span>${esc(kk)}</span><span class="v">${k(v)}</span>${dChip(d, true)}<span class="bar"><i style="width:${v / maxIsl * 100}%"></i></span></li>`; }).join('') || '<li>Belum ada lokasi</li>'}</ol>
          <button class="g-btn" type="button" data-go="analitik">Lihat detail ${ic('arrow', 14)}</button>
        </div>
        <div class="g-ctrl">
          <div class="g-glass g-seg" role="group" aria-label="Rentang waktu">${[['last1', 'Hari terakhir'], ['last3', '3 Hari'], ['last7', '7 Hari'], ['last30', '30 Hari'], ['all', 'Semua']].map(([v, l]) => `<button type="button" data-p="${v}" class="${preset === v ? 'on' : ''}">${l}</button>`).join('')}</div>
          <div class="g-glass g-cap">Periode <b>${esc(per)}</b> · Δ dibanding 7 hari sebelumnya</div>
        </div>
      </div>

      <div class="g-grid4">
        <div class="g-card"><div class="g-h"><h3>Volume Percakapan</h3><span class="g-tag">Harian</span></div>
          <div class="g-vol"><div>${barsSvg(perDay.map(x => x.t), 300, 120, (t) => heat(t))}</div>
          <div><span class="big">${f(lastD.t)}</span><small>postingan hari terakhir</small><div style="margin-top:8px">${dChip(chg, true)}</div><small>vs rata-rata 7 hari</small></div></div></div>
        <div class="g-card"><div class="g-h"><h3>Tren Sentimen</h3><span class="g-tag">7 hari terakhir</span></div>
          <div class="g-vol"><div>${linesSvg([{ id: 'n', c: RED, fill: 1, v: last7d.map(x => x.n) }, { id: 'p', c: TEAL, v: last7d.map(x => x.p) }, { id: 'z', c: GREY, v: last7d.map(x => x.z) }], 300, 120)}</div>
          <div class="g-legend"><div><span class="g-dot" style="background:${RED}"></span>Negatif<b>${pc(Ls.n, Ls.t)}</b></div><div><span class="g-dot" style="background:${GREY}"></span>Netral<b>${pc(Ls.z, Ls.t)}</b></div><div><span class="g-dot" style="background:${TEAL}"></span>Positif<b>${pc(Ls.p, Ls.t)}</b></div></div></div></div>
        <div class="g-card"><div class="g-h"><h3>Top Isu Terkini</h3><span class="g-tag">Semua sumber</span></div>
          <ol class="g-list">${topics.slice(0, 5).map(([kk, v], i) => `<li><span class="n">${i + 1}</span><span class="t" title="${esc(kk)}">${esc(kk)}</span><span class="bar"><i style="width:${v / topics[0][1] * 100}%;background:${i < 1 ? RED : i < 3 ? ORANGE : AMBER}"></i></span><span class="p">${pc(v, S.t, 0)}</span></li>`).join('')}</ol></div>
        <div class="g-card"><div class="g-h"><h3>Sumber Percakapan</h3><span class="g-tag">Semua</span></div>
          <ol class="g-list g-src">${plat.map(([kk, v]) => `<li>${pfIco(kk)}<span class="t">${esc(kk)}</span><span class="bar"><i style="width:${v / plat[0][1] * 100}%;background:${TEAL}"></i></span><span class="p">${pc(v, S.t, 0)}</span></li>`).join('')}</ol></div>
      </div>

      <div class="g-grid2">
        <div class="g-card"><div class="g-h"><h3>Aktivitas Terbaru</h3>
          <div class="g-feed-tabs">${['Semua', ...plat.map(p => p[0])].map(p => `<button type="button" data-pf="${esc(p)}" class="${feedPf === p ? 'on' : ''}">${esc(p)}</button>`).join('')}</div></div>
          <div class="g-feed">${feedSrc.map(r => `<div class="g-post"><div class="top">${pfIco(r.platform, 13)}<span>${esc(ago(r))}</span><span class="sn ${snC(r.sent)}">${esc(r.sent)}</span></div>
            <p>${esc(r.text.slice(0, 220))}</p><div class="ft"><span>${esc(akun(r))} · ${k(r.eng)} interaksi</span>${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener">Buka ${ic('ext', 12)}</a>` : ''}</div></div>`).join('') || '<p class="hint">Tidak ada postingan</p>'}</div></div>
        <div class="g-card"><div class="g-h"><h3>Peringatan Dini</h3><span class="g-lv hi">Tinggi (${nHigh})</span></div>
          <ul class="g-warn">${warn.slice(0, 4).map(w => `<li><span class="wi g-lv ${w.lv[0]}">${ic('flame', 18)}</span><div><b>${esc(w.kk)}</b><small>${esc(w.topT)} · ${pc(w.np, 100, 0)} negatif${w.d != null ? ` · ${w.d >= 0 ? '+' : ''}${w.d}% 7h` : ''}</small></div><span class="g-lv ${w.lv[0]}">${ic('alert', 12, 2)}${w.lv[1]}</span></li>`).join('')}</ul></div>
      </div>`;

    // peta foto bumi + pin data
    const PIN = { 'Sumatera': [328, 340], 'Kalimantan': [740, 393], 'Sulawesi': [978, 491], 'Jawa': [576, 631], 'Bali & Nusa Tenggara': [932, 701], 'Papua': [1445, 541], 'Maluku': [1185, 398] };
    const IW = 1672, IH = 941, mx = Math.max(1, ...isl.map(x => x[1]));
    const pins = root.querySelector('.g-pins');
    pins.innerHTML = isl.map(([kk, v]) => { const p = PIN[kk]; if (!p) return ''; const d = delta(islL[kk] || 0, islP[kk] || 0), t = v / mx;
      const nm = kk === 'Bali & Nusa Tenggara' ? 'Nusa Tenggara' : kk;
      return `<div class="g-pin${p[0] > 1350 ? ' l' : ''}" style="left:${p[0] / IW * 100}%;top:${p[1] / IH * 100}%;--s:${(10 + t * 10).toFixed(1)}px">
        <i class="dot"></i><i class="stem"></i><div class="lab"><b>${esc(nm.toUpperCase())}</b><span>${k(v)} postingan</span>${d != null ? `<em class="${d >= 0 ? 'eu' : 'ed'}">${d >= 0 ? '↑ +' : '↓ '}${d}%</em>` : ''}</div></div>`; }).join('');
    const earth = root.querySelector('.g-earth'), stage = root.querySelector('.g-stage');
    const fit = () => { const W = stage.clientWidth, H = stage.clientHeight, wide = innerWidth >= 1100;
      if (!wide) { earth.style.cssText = ''; return; }
      const left = 300, right = 16, sc = (W - left - right) / (1640 - 150), w = IW * sc, h = IH * sc;
      earth.style.cssText = `position:absolute;width:${w}px;height:${h}px;left:${left - 150 * sc}px;top:${(H - 70) / 2 - 460 * sc}px`; };
    fit(); if (!buildConsole.fitBound) { buildConsole.fitBound = 1; addEventListener('resize', () => { const f = document.querySelector('#gConsole')?._fit; f && f(); }); }
    root._fit = fit;
    root.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (typeof state === 'undefined') return; state.preset = b.dataset.p; render(); });
    root.querySelectorAll('[data-pf]').forEach(b => b.onclick = () => { feedPf = b.dataset.pf; buildConsole(); });
    root.querySelector('[data-go=analitik]')?.addEventListener('click', () => document.querySelector('[data-tab=analitik]')?.click());
  }

  /* ---------------- ANALITIK ---------------- */
  let cmpMode = 'vol', charts2 = {};
  function buildAnalitik() {
    const an = document.getElementById('viewAnalitik'); if (!an) return;
    const { D, perDay, L, Pv, by } = data(); if (!D.length) return;
    let root = document.getElementById('gAnalitik');
    if (!root) { root = document.createElement('section'); root.id = 'gAnalitik'; root.className = 'g-wrap'; an.prepend(root); }
    // sembunyikan kartu lama yang sudah tergantikan
    ['kpis'].forEach(id => document.getElementById(id)?.classList.add('g-hide'));
    ['cTrend', 'cSov', 'kanalSent', 'causePos', 'cloud', 'lokasi'].forEach(id => document.getElementById(id)?.closest('section.card')?.classList.add('g-hide'));
    an.querySelectorAll('.row').forEach(r => { if ([...r.children].every(c => c.classList.contains('g-hide'))) r.classList.add('g-hide'); });
    const S = by(D), Ls = by(L), Ps = by(Pv);
    const topics = cnt(D.filter(r => r.topik && r.topik !== 'Lainnya'), 'topik'), T5 = topics.slice(0, 5).map(t => t[0]);
    const topicsL = Object.fromEntries(cnt(L, 'topik')), topicsP = Object.fromEntries(cnt(Pv, 'topik'));
    const plat = cnt(D, 'platform'), isl = cnt(D.filter(r => r.lokasi && r.lokasi !== NONE), 'lokasi');
    const islL = Object.fromEntries(cnt(L, 'lokasi')), islP = Object.fromEntries(cnt(Pv, 'lokasi'));
    const peak = perDay.slice().sort((a, b) => b.t - a.t).slice(0, 3).map(p => { const R = D.filter(r => r.tgl === p.d); const top = R.slice().sort((a, b) => b.eng - a.eng)[0];
      const i = perDay.findIndex(x => x.d === p.d), prv = perDay.slice(Math.max(0, i - 7), i), avg = prv.length ? prv.reduce((s, x) => s + x.t, 0) / prv.length : 0;
      return { ...p, top, d7: avg ? Math.round((p.t - avg) / avg * 100) : null, tp: cnt(R.filter(r => r.topik !== 'Lainnya'), 'topik')[0]?.[0] }; });
    const avgDay = perDay.length ? Math.round(S.t / perDay.length) : 0;
    // kata kunci
    const STOP = new Set('yang dan di ke dari ini itu untuk dengan pada juga ada tidak bisa sudah akan atau aja saja kita kami saya aku gue lu kamu dia mereka nya ya ga gak nggak tapi karena jadi lagi mau buat sama oleh dalam the https http www com co id yg dgn utk sih kok deh dong lah kan pun para seperti lebih bagi masih hanya kalau kalo tak telah agar semua baru banyak pak bu udah belum dapat hari jangan kena usai milik setelah sedang hingga sampai menjadi tersebut karna emang memang banget sangat orang terjadi kembali saat tengah selatan utara barat timur sejumlah kondisi kawasan wilayah sekitar terus video bukan harus kota lokasi kabupaten provinsi oktober tahun bulan minggu pagi siang sore malam dari menurut ujar kata katanya disebut melalui antara lain this that with from have will are was'.split(' '));
    const wc = {}; D.forEach(r => r.text.toLowerCase().replace(/https?:\S+|[@#]\S+/g, ' ').split(/[^a-z0-9]+/).forEach(w => { if (w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)) wc[w] = (wc[w] || 0) + 1; }));
    const words = Object.entries(wc).sort((a, b) => b[1] - a[1]).slice(0, 26), wMax = words[0]?.[1] || 1;
    const lay = []; words.forEach((w, i) => i % 2 ? lay.push(w) : lay.unshift(w));
    const wCol = [TEAL, AMBER, ORANGE, '#7FB8FF', '#A78BFA', '#E7E9EA'];
    const cmpRows = isl.map(([kk, v]) => { const R = D.filter(r => r.lokasi === kk), n = R.filter(r => r.sent === 'negatif').length; return { kk, v, n, np: n / v * 100, d: delta(islL[kk] || 0, islP[kk] || 0) }; })
      .sort((a, b) => cmpMode === 'neg' ? b.np - a.np : cmpMode === 'grow' ? (b.d ?? -1e9) - (a.d ?? -1e9) : b.v - a.v);
    const negD = Ps.t ? Math.round(Ls.n / Ls.t * 100 - Ps.n / Ps.t * 100) : null, posD = Ps.t ? Math.round(Ls.p / Ls.t * 100 - Ps.p / Ps.t * 100) : null, netD = Ps.t ? Math.round(Ls.z / Ls.t * 100 - Ps.z / Ps.t * 100) : null;

    root.innerHTML = `
      <div class="g-hero">
        <div><div class="g-eyebrow">Analitik</div><h1 class="g-title"><b>Karhutla</b> <span>Indonesia</span></h1>
          <p class="g-sub">Analisis mendalam percakapan media sosial untuk memahami tren, isu, sentimen, dan sebaran wilayah.</p></div>
        <div class="g-kpis">
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('chat', 22)}</span><div><b>${f(S.t)}</b><small>Total postingan</small></div>${dChip(delta(Ls.t, Ps.t), false)}</div>
          <div class="g-kpi" style="--c:${RED}"><span class="gi">${ic('heart', 22)}</span><div><b>${pc(S.n, S.t)}</b><small>Sentimen negatif</small></div>${dChip(negD, true, ' pp')}</div>
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('pin', 22)}</span><div><b>${isl.length}<small style="font-size:13px"> / 7</small></b><small>Pulau disebut</small></div></div>
          <div class="g-kpi" style="--c:${ORANGE}"><span class="gi">${ic('alert', 22)}</span><div><b>${f(S.n)}</b><small>Postingan negatif</small></div>${dChip(delta(Ls.n, Ps.n), true)}</div>
        </div>
      </div>
      <div class="g-grid3">
        <div class="g-card"><div class="g-h"><h3>Tren Percakapan & Sentimen</h3><span class="g-tag">Harian</span></div><div class="g-cv"><canvas id="gcTrend"></canvas></div></div>
        <div class="g-card"><div class="g-h"><h3>Distribusi Sentimen</h3><span class="g-tag">Δ 7 hari</span></div>
          <div class="g-donut"><div style="position:relative;height:150px"><canvas id="gcDonut"></canvas></div>
            <div class="g-legend"><div><span class="g-dot" style="background:${RED}"></span>Negatif <b>${pc(S.n, S.t)} ${dChip(negD, true, ' pp')}</b></div><div><span class="g-dot" style="background:${GREY}"></span>Netral <b>${pc(S.z, S.t)} ${dChip(netD, false, ' pp')}</b></div><div><span class="g-dot" style="background:${TEAL}"></span>Positif <b>${pc(S.p, S.t)} ${dChip(posD, false, ' pp')}</b></div></div></div>
          <div class="g-card" style="margin-top:14px;padding:12px 14px;background:var(--card2)"><div class="g-h" style="margin-bottom:6px"><h3 style="font-size:13.5px!important">Volume Percakapan</h3><span class="g-tag hot">Puncak ${peak[0] ? tg(peak[0].d) : '-'}</span></div>
            <div class="g-vol"><div><span class="big">${f(avgDay)}</span><small>rata-rata harian</small></div><div style="width:160px">${barsSvg(perDay.map(x => x.t), 160, 54, t => heat(t))}</div></div></div></div>
        <div class="g-card"><div class="g-h"><h3>Top Isu Dominan</h3><span class="g-tag">Semua sumber</span></div>
          <ol class="g-list" style="gap:14px">${topics.slice(0, 6).map(([kk, v], i) => `<li style="grid-template-columns:22px minmax(0,1fr) 70px 44px"><span class="n">${i + 1}</span><span class="t" title="${esc(kk)}">${esc(kk)}<small style="display:block;color:var(--mute);font-size:11px">${f(v)} postingan ${dChip(delta(topicsL[kk] || 0, topicsP[kk] || 0), true)}</small></span><span class="bar"><i style="width:${v / topics[0][1] * 100}%;background:${i < 1 ? RED : i < 3 ? ORANGE : AMBER}"></i></span><span class="p" style="color:${i < 1 ? RED : 'var(--ink)'}">${pc(v, S.t, 0)}</span></li>`).join('')}</ol></div>
      </div>
      <div class="g-grid3">
        <div class="g-card"><div class="g-h"><h3>Perbandingan Antar Pulau</h3></div>
          <div class="g-sub-tabs">${[['vol', 'Volume'], ['neg', 'Sentimen negatif'], ['grow', 'Pertumbuhan 7h']].map(([v, l]) => `<button type="button" data-cmp="${v}" class="${cmpMode === v ? 'on' : ''}">${l}</button>`).join('')}</div>
          <div class="g-cmp"><div class="lokmap"></div>
            <table class="g-tbl"><thead><tr><th></th><th>Pulau</th><th class="r">Volume</th><th class="r">Negatif</th><th class="r">Δ 7h</th></tr></thead><tbody>
            ${cmpRows.map((r, i) => `<tr><td class="n">${i + 1}</td><td>${esc(r.kk)}</td><td class="r">${f(r.v)}</td><td class="r" style="color:${r.np >= 60 ? RED : r.np >= 45 ? AMBER : 'var(--ink)'}">${pc(r.np, 100, 0)}</td><td class="r">${dChip(r.d, true) || '–'}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="g-card"><div class="g-h"><h3>Sumber Percakapan</h3><span class="g-tag">Semua</span></div>
          <ol class="g-list g-src" style="gap:16px">${plat.map(([kk, v]) => { const R = D.filter(r => r.platform === kk), n = R.filter(r => r.sent === 'negatif').length;
            return `<li>${pfIco(kk)}<span class="t">${esc(kk)}<small style="display:block;color:var(--mute);font-size:11px">${f(v)} postingan · ${pc(n, v, 0)} negatif</small></span><span class="bar"><i style="width:${v / plat[0][1] * 100}%;background:linear-gradient(90deg,#2FB3A6,${TEAL})"></i></span><span class="p">${pc(v, S.t, 0)}</span></li>`; }).join('')}</ol></div>
        <div class="g-card"><div class="g-h"><h3>Puncak Percakapan</h3><span class="g-tag">3 hari teratas</span></div>
          <ol class="g-peak">${peak.map((p, i) => `<li><span class="n">${i + 1}</span><div><div class="meta"><span>${tgY(p.d)}</span>${dChip(p.d7, true)}</div><b>${f(p.t)}</b> <small style="color:var(--mute)">postingan · ${pc(p.n, p.t, 0)} negatif</small>
            <p title="${esc(p.top?.text || '')}">${esc(p.tp || '')}${p.top ? ` — ${esc(akun(p.top))}: “${esc(p.top.text.slice(0, 80))}”` : ''}</p></div></li>`).join('')}</ol></div>
      </div>
      <div class="g-grid3">
        <div class="g-card"><div class="g-h"><h3>Tren Topik</h3><span class="g-tag">5 topik teratas</span></div><div class="g-cv" style="height:220px"><canvas id="gcTopic"></canvas></div></div>
        <div class="g-card"><div class="g-h"><h3>Kata Kunci Populer</h3><span class="g-tag">Semua sentimen</span></div>
          <div class="g-cloud">${lay.map(([w, c], i) => { const r = c / wMax; return `<span title="${esc(w)}: ${f(c)}×" style="font-size:${12 + r * 26}px;font-weight:${r > .5 ? 700 : 500};color:${wCol[i % wCol.length]};opacity:${(.55 + r * .45).toFixed(2)}">${esc(w)}</span>`; }).join('')}</div></div>
        <div class="g-card"><div class="g-h"><h3>Sentimen per Topik</h3><span class="g-tag"><span class="g-dot" style="background:${RED}"></span>Neg <span class="g-dot" style="background:${GREY};margin-left:6px"></span>Net <span class="g-dot" style="background:${TEAL};margin-left:6px"></span>Pos</span></div>
          <div class="g-stack">${T5.map(t => { const R = D.filter(r => r.topik === t), b = by(R);
            return `<div class="row"><span class="t" title="${esc(t)}">${esc(t)}</span><span class="sb"><i style="width:${b.n / b.t * 100}%;background:${RED}"></i><i style="width:${b.z / b.t * 100}%;background:${GREY}"></i><i style="width:${b.p / b.t * 100}%;background:${TEAL}"></i></span><span style="text-align:right;color:var(--mute)">${pc(b.p, b.t, 0)}</span></div>`; }).join('')}</div>
          <p class="hint" style="margin:12px 0 0">Angka kanan = porsi positif per topik.</p></div>
      </div>
      <div class="g-section-t">Detail lanjutan</div>`;

    const box = root.querySelector('.g-cmp .lokmap');
    if (window.renderIdMap && window.__lok) window.renderIdMap(box, window.__lok);
    root.querySelectorAll('[data-cmp]').forEach(b => b.onclick = () => { cmpMode = b.dataset.cmp; buildAnalitik(); });

    // Chart.js (hanya bila tab terlihat agar ukuran benar)
    if (typeof Chart === 'undefined' || an.hidden) return;
    Object.values(charts2).forEach(c => c.destroy()); charts2 = {};
    const tick = getComputedStyle(document.documentElement).getPropertyValue('--mute').trim() || '#8A97A6';
    const grid = getComputedStyle(document.documentElement).getPropertyValue('--line').trim() || 'rgba(255,255,255,.08)';
    const labels = perDay.map(x => tg(x.d));
    const base = { maintainAspectRatio: false, responsive: true, animation: { duration: 600 }, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(9,14,18,.95)', borderColor: 'rgba(70,214,200,.3)', borderWidth: 1, padding: 10, titleColor: '#EAF2F4', bodyColor: '#EAF2F4',
        callbacks: { footer: items => items.length > 1 ? 'Total: ' + f(items.filter(i => i.dataset.type !== 'bar' && i.dataset.label !== 'Total').reduce((s, i) => s + i.raw, 0)) : '' } } },
      scales: { x: { grid: { display: false }, ticks: { color: tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, border: { color: grid } }, y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick }, border: { display: false } } } };
    const area = (label, data, c) => ({ type: 'line', label, data, borderColor: c, borderWidth: 2, tension: .35, pointRadius: 0, pointHoverRadius: 4, fill: true,
      backgroundColor: ctx => { const a = ctx.chart.chartArea; if (!a) return c + '22'; const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, c + '55'); g.addColorStop(1, c + '00'); return g; } });
    charts2.t = new Chart(document.getElementById('gcTrend'), { data: { labels, datasets: [
      { type: 'bar', label: 'Total', data: perDay.map(x => x.t), backgroundColor: perDay.map(x => heat(x.t / Math.max(...perDay.map(y => y.t))) + '66'), borderRadius: 3, barPercentage: .7, order: 3 },
      { ...area('Negatif', perDay.map(x => x.n), RED), order: 1 }, { ...area('Netral', perDay.map(x => x.z), GREY), order: 2 }, { ...area('Positif', perDay.map(x => x.p), TEAL), order: 2 }] }, options: base });
    charts2.d = new Chart(document.getElementById('gcDonut'), { type: 'doughnut', data: { labels: ['Negatif', 'Netral', 'Positif'], datasets: [{ data: [S.n, S.z, S.p], backgroundColor: [RED, GREY, TEAL], borderWidth: 0, spacing: 3, borderRadius: 6 }] },
      options: { maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip: base.plugins.tooltip } } });
    const tCol = [ORANGE, RED, AMBER, TEAL, '#7FB8FF'];
    charts2.p = new Chart(document.getElementById('gcTopic'), { type: 'line', data: { labels, datasets: T5.map((t, i) => ({ label: t, data: perDay.map(x => D.filter(r => r.tgl === x.d && r.topik === t).length), borderColor: tCol[i], borderWidth: 2, tension: .35, pointRadius: 0 })) },
      options: { ...base, plugins: { ...base.plugins, legend: { display: true, position: 'top', align: 'start', labels: { color: tick, boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 11 } } }, tooltip: { ...base.plugins.tooltip, callbacks: {} } } } });
  }

  /* ---------------- Navigasi & tab ---------------- */
  function setupNav() {
    const dash = document.getElementById('viewDash'), tabs = document.querySelector('.tabs');
    if (!dash || !tabs) return;
    if (!document.getElementById('viewAnalitik')) {
      const an = document.createElement('div'); an.id = 'viewAnalitik'; an.hidden = true;
      [...dash.children].forEach(ch => { if (ch.id !== 'gConsole') an.append(ch); });
      dash.after(an);
      const dBtn = tabs.querySelector('[data-tab=dash]'); if (dBtn) dBtn.textContent = 'Ops Console';
      const aBtn = document.createElement('button'); aBtn.setAttribute('role', 'tab'); aBtn.dataset.tab = 'analitik'; aBtn.textContent = 'Analitik';
      dBtn ? dBtn.after(aBtn) : tabs.prepend(aBtn);
      const ai = document.createElement('button'); ai.type = 'button'; ai.className = 'g-ai-tab'; ai.setAttribute('role', 'tab'); ai.innerHTML = ic('spark', 15) + 'Garuda AI';
      ai.style.cssText = 'border:0;background:none;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer';
      ai.onclick = e => { e.stopPropagation(); document.querySelector('.ai-fab')?.click(); };
      tabs.querySelector('[data-tab=sna]')?.after(ai);
      aBtn.addEventListener('click', () => {
        tabs.querySelectorAll('[role=tab]').forEach(x => x.classList.toggle('on', x === aBtn));
        ['viewDash', 'viewRaw', 'viewSna'].forEach(id => { const v = document.getElementById(id); if (v) v.hidden = true; });
        an.hidden = false; buildAnalitik();
        setTimeout(() => { try { Object.values(charts).forEach(ch => ch.resize()); } catch (_) {} }, 30);
      });
      tabs.querySelectorAll('[data-tab]').forEach(b => { if (b !== aBtn) b.addEventListener('click', () => { an.hidden = true; }); });
    }
    // pindahkan tab ke topbar pada layar lebar
    const top = document.querySelector('.topbar'), content = document.querySelector('.content'), main = document.getElementById('main');
    const place = () => { const wide = innerWidth >= 1100;
      if (wide && !tabs.classList.contains('g-topnav')) { tabs.classList.add('g-topnav'); top.querySelector('.brand')?.after(tabs); }
      else if (!wide && tabs.classList.contains('g-topnav')) { tabs.classList.remove('g-topnav'); main?.prepend(tabs); } };
    place(); if (!setupNav.bound) { setupNav.bound = 1; addEventListener('resize', place); }
    // hapus emoji tersisa di judul/tab
    document.querySelectorAll('#main h2, .tabs [role=tab]').forEach(h => { if (h.children.length === 0) h.textContent = h.textContent.replace(/^[\p{Extended_Pictographic}️\s]+/u, ''); });
  }

  const refresh = () => { setupNav(); buildConsole(); if (!document.getElementById('viewAnalitik')?.hidden) buildAnalitik(); };
  window.addEventListener('lok:update', () => setTimeout(refresh, 0));
  if (window.__lok) setTimeout(refresh, 0);
})();
