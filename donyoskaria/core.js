/* ===== Garuda Dony Oskaria — core: helper, warna, CSS bersama, olah data =====
   Dipakai oleh globe.js, console.js, analitik.js (lewat window.G). */
(() => {
  const P = {
    spark: '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    frown: '<circle cx="12" cy="12" r="9"/><path d="M8.5 16.2c1.8-1.9 5.2-1.9 7 0"/><path d="M9 9.5v.01M15 9.5v.01" stroke-width="2.6"/><path d="M7.5 7.3l2.4 1M16.5 7.3l-2.4 1"/>',
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
.g-title{margin:6px 0 6px;font-family:var(--f-display)!important;font-size:32px!important;line-height:1.12;letter-spacing:.02em!important;text-transform:uppercase}
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
.g-kw{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.g-kw button{font:600 12.5px var(--f-body);padding:7px 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--mute);cursor:pointer;transition:.2s}.g-kw button:hover{color:var(--ink)}.g-kw button.on{background:#46D6C8;border-color:#46D6C8;color:#04121A}
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
.g-earth{position:relative;width:100%;aspect-ratio:1672/1051}
.g-earth img{position:absolute;inset:0;width:100%;height:100%;display:block;user-select:none;object-fit:cover;object-position:70% 30%}
[data-theme=light] .g-kpi,[data-theme=light] .g-insight{background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.72))!important;border-color:rgba(4,7,10,.08)!important;box-shadow:0 8px 24px rgba(15,30,45,.08)}
@media(min-width:1101px){.g-earth.g-photo{position:absolute!important;top:-28px!important;bottom:0!important;left:calc(50% - 50vw)!important;width:100vw!important;height:auto!important;transform:none!important;border-radius:0!important;aspect-ratio:auto!important}
.g-photo img{object-position:right 30%!important;transform:scale(.84);transform-origin:88% 100%;-webkit-mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.5) 12%,#000 30%),linear-gradient(180deg,transparent 0%,rgba(0,0,0,.5) 14%,#000 34%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.5) 12%,#000 30%),linear-gradient(180deg,transparent 0%,rgba(0,0,0,.5) 14%,#000 34%);mask-composite:intersect}
.g-earth.g-photo{background:linear-gradient(180deg,#020D28 0%,#021130 45%,#011739 100%);will-change:transform,clip-path}
[data-theme=light] .g-earth.g-photo{background:linear-gradient(180deg,#ACC9F1 0%,#9AC1EE 30%,#84B5EC 55%,#60ABED 100%)}
.g-photo:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(2,6,14,.82) 0%,rgba(2,6,14,.55) 26%,rgba(2,6,14,.12) 46%,transparent 60%),linear-gradient(0deg,rgba(2,6,14,.55),transparent 18%)}
[data-theme=light] .g-photo:after{background:linear-gradient(90deg,rgba(244,248,249,.85) 0%,rgba(244,248,249,.55) 26%,rgba(244,248,249,.1) 46%,transparent 60%),linear-gradient(0deg,rgba(244,248,249,.6),transparent 18%)}}
.g-prio{position:absolute;width:420px;z-index:3;padding:16px 18px;border-radius:22px}
.g-prio .g-h{display:flex;justify-content:space-between;align-items:center;gap:8px}.g-prio h3{margin:0;font-size:15px}
.g-pl{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:10px}
.g-pl li{padding:11px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-left:3px solid #46D6C8}
.g-pl li.hi{border-left-color:#F0524F}.g-pl li.md{border-left-color:#FFC46B}
.g-pl .h{display:flex;align-items:center;gap:8px}.g-pl .h b{flex:1;font-size:13.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-pl .h .n{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;font-size:11px;border:1px solid var(--line);color:var(--mute)}
.g-pl .h .v{font-weight:700;font-size:13px}
.g-pl .m{display:flex;gap:10px;align-items:center;margin-top:6px;font-size:11.5px;color:var(--mute)}
.g-pl .q{margin:8px 0 0;font-size:12px;line-height:1.45;color:var(--ink);opacity:.85}
.g-pl .q .src{display:block;margin-top:3px;font-size:11px;color:var(--mute)}.g-pl .q a{color:#46D6C8;text-decoration:none}
@media(max-width:1100px){.g-prio{position:relative;width:auto;left:auto!important;top:auto!important}}
.g-photo .ph-l{display:none}[data-theme=light] .g-photo .ph-l{display:block}[data-theme=light] .g-photo .ph-d{display:none}
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
.g-eng{display:flex;gap:12px;font-size:11.5px;color:var(--mute)}.g-eng span{display:inline-flex;align-items:center;gap:4px}.g-post .ft .who{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;margin-right:8px}

/* Globe penuh: tidak terpotong, meluber ke belakang kartu di bawahnya */
.g-stage{overflow:visible!important;border:0!important;background:none!important;z-index:0}
.g-stage:after{display:none}
.g-earth{z-index:0;pointer-events:none}
.g-earth .g-pins{pointer-events:auto}
.g-earth:before{content:"";position:absolute;inset:-2px;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,var(--bg) 0%,rgba(4,7,10,0) 14%,rgba(4,7,10,0) 90%,var(--bg) 100%),linear-gradient(180deg,var(--bg) 0%,rgba(4,7,10,0) 10%,rgba(4,7,10,0) 82%,var(--bg) 100%)}
.g-pins{z-index:2}
.g-int,.g-ctrl{z-index:3}
.g-grid4,.g-grid2{position:relative;z-index:2}
@media(min-width:1101px){.g-stage{height:clamp(640px,54vw,840px)!important}.g-grid4{margin-top:-170px}.g-ctrl{bottom:186px!important}}
.g-grid4 .g-card{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.01) 45%),rgba(8,13,18,.55)!important;
  -webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%);border-color:rgba(160,220,215,.16)!important}
[data-theme=light] .g-earth:before{background:linear-gradient(90deg,var(--bg) 0%,transparent 14%,transparent 90%,var(--bg) 100%),linear-gradient(180deg,var(--bg) 0%,transparent 10%,transparent 70%,var(--bg) 100%)}
/* Kepulan asap: radial-gradient + transform (tanpa filter blur, ringan) */
.smk{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none}
.smk i{position:absolute;left:calc(var(--z)/-2);top:calc(var(--z)/-1);width:var(--z);height:var(--z);border-radius:50%;opacity:0;
  background:radial-gradient(circle at 50% 55%,rgba(225,225,228,var(--o)) 0%,rgba(190,190,195,calc(var(--o)*.55)) 38%,rgba(160,160,165,0) 70%);
  will-change:transform,opacity;animation:smk 6.5s ease-out var(--d) infinite}
@keyframes smk{0%{transform:translate(0,10px) scale(.35);opacity:0}15%{opacity:1}100%{transform:translate(var(--x),calc(var(--z)*-1.1)) scale(1.6);opacity:0}}
@media (prefers-reduced-motion:reduce){.smk i{animation:none;opacity:.6;transform:translateY(-10px)}}
@media(max-width:1100px){.g-earth:before{display:none}.smk i{--z:30px!important}}
.g-smoke{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
/* Light mode: globe siang hari */
.g-earth .e-day{display:none}
[data-theme=light] .g-earth img:not(.e-day){display:none}
[data-theme=light] .g-earth .e-day{display:block}
[data-theme=light] .g-stage,[data-theme=light] .g-stage.g-stage{background:none!important}
[data-theme=light] .g-pin .lab{text-shadow:0 1px 2px rgba(0,0,0,.55),0 0 8px rgba(0,0,0,.35)}
[data-theme=light] .g-grid4 .g-card{background:rgba(255,255,255,.62)!important;border-color:rgba(4,7,10,.08)!important}
/* Globe utuh di belakang judul & KPI: tepi dipudarkan dengan mask (benar-benar transparan) */
@media(min-width:1101px){
.g-earth:before{display:none!important}
.g-earth img{-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 3%,#000 84%,transparent 100%),linear-gradient(90deg,transparent 0,#000 12%,#000 92%,transparent 100%);-webkit-mask-composite:source-in;
  mask-image:linear-gradient(180deg,transparent 0,#000 3%,#000 84%,transparent 100%),linear-gradient(90deg,transparent 0,#000 12%,#000 92%,transparent 100%);mask-composite:intersect}
.g-hero{position:relative;z-index:3}
@media(min-width:1101px){.g-hero{grid-template-columns:1fr!important;max-width:560px;align-items:start}.g-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}.g-int{top:calc(var(--heroH,0px) + 16px)!important;left:0!important}.g-prio{top:calc(var(--heroH,0px) + 16px);left:calc(270px + 20px)}.g-stage{transition:none}}
.g-stage{z-index:1}
}
.g-kpi{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.01) 45%),rgba(8,13,18,.5)!important;
  -webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%);border-color:rgba(160,220,215,.16)!important}
@media(max-width:1100px){.g-stage{margin-bottom:10px!important;gap:10px!important;padding:0!important}.g-hero{margin-bottom:10px}.g-grid4,.g-grid2{gap:10px;margin-bottom:10px}}
.g-grid-tt{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:14px}
.g-grid-wh{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:14px}
.g-wc{position:relative;width:100%;overflow:hidden}.g-wc span{position:absolute;white-space:nowrap;line-height:1;cursor:default;transition:transform .15s}.g-wc span:hover{transform:scale(1.08)}
@media(max-width:1100px){.g-grid-tt,.g-grid-wh{grid-template-columns:1fr}}
.g-ctrl{display:none!important}
.g-insight{position:relative;z-index:3;margin-bottom:14px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.01) 45%),rgba(8,13,18,.6)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.g-insight h3{display:flex;align-items:center;gap:8px;color:var(--ink)}.g-insight h3 svg{color:#46D6C8}
.g-ins{list-style:none;margin:0 0 12px;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.g-ins li{padding:12px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid var(--line);border-left:3px solid var(--mute)}
.g-ins li.hi{border-left-color:#F0524F}.g-ins li.md{border-left-color:#FFC46B}.g-ins li.lo{border-left-color:#46D6C8}
.g-ins p{margin:8px 0 0;font-size:12.8px;line-height:1.5;color:rgba(234,242,244,.86)}
.g-insight .g-btn{height:32px}
@media(max-width:1280px){.g-ins{grid-template-columns:1fr 1fr}}@media(max-width:640px){.g-ins{grid-template-columns:1fr}}
@media(min-width:1101px){.g-insight{margin-top:-170px}.g-insight+.g-grid4{margin-top:0!important}}
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
@media(max-width:640px){.g-title{font-size:22px!important}.g-kpis{grid-template-columns:1fr 1fr;gap:8px}.g-kpi{padding:12px}.g-kpi .gi{width:36px;height:36px}.g-kpi b{font-size:18px}
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
    // Pembanding: periode terpilih vs periode sebelumnya dengan panjang hari yang sama
    const allDays = [...new Set(all.map(r => r.tgl))].sort();
    const from = rg.from || days[0], to = rg.to || days.at(-1);
    const span = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1);
    const pTo = new Date(new Date(from) - 864e5).toISOString().slice(0, 10), pFrom = new Date(new Date(from) - span * 864e5).toISOString().slice(0, 10);
    const L = D, Pv = all.filter(r => r.tgl >= pFrom && r.tgl <= pTo);
    const cmpLbl = Pv.length ? `vs ${span} hari sebelumnya` : 'tidak ada pembanding';
    return { all, rg, D, days, perDay, L, Pv, by, cmpLbl };
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

  window.G = Object.assign(window.G || {}, { ic,pfIco,esc,f,k,pc,tg,tgY,TEAL,AMBER,ORANGE,RED,GREY,NONE,cnt,akun,delta,dChip,data,barsSvg,linesSvg,heat });
})();
