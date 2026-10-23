/* ===== PENGATURAN ===== */
const SHEET_ID = "12BRmeOf5no04WlzBuokYGDkqMUivziw3dCLE6lcSz8M";
const TABS = { post: "Data Post (Gabungan)", komentar: "Data Komentar (Gabungan)" };
const RISK = { tinggi: 35, sedang: 20 };          // ambang % negatif
const REFRESH_MENIT = 5;
/* ====================== */

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('id-ID');
const pct = (a, b) => b ? (a / b * 100).toFixed(1).replace('.', ',') + '%' : '0%';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const tglLabel = t => { const [y, m, d] = t.split('-'); return `${+d} ${BULAN[m - 1]} ${y}`; };
const tglShort = t => { const [, m, d] = t.split('-'); return `${+d} ${BULAN[m - 1]}`; };
const PLATFORM_COLOR = { twitter: '#1d9bf0', x: '#1d9bf0', facebook: '#1877f2', instagram: '#e1306c', tiktok: '#25d5e4', youtube: '#ff3b30', threads: '#9b8cff', linkedin: '#0a66c2', news: '#f59e0b', media: '#f59e0b' };
const pColor = p => PLATFORM_COLOR[p.toLowerCase().split(/[ /]/)[0]] || '#94a3b8';
const SENT = { positif: '#22c55e', negatif: '#ef4444', netral: '#94a3b8' };

const state = { src: 'post', tgl: 'all' };
const cache = {}, charts = {};
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------- Data ---------- */
async function load(src) {
  if (cache[src]) return cache[src];
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(TABS[src])}&_=${Date.now()}`;
  const txt = await fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
  const rows = Papa.parse(txt, { header: true, skipEmptyLines: true }).data;
  return cache[src] = rows.map(norm).filter(r => r.tgl && r.sent);
}
// Tanggal: "dd/mm/yyyy", serial angka, atau "yyyy-mm-dd". Jam: "HH:MM" atau pecahan hari.
function norm(r) {
  const t = r['Waktu'] || ''; let tgl = '';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(t)) { const [d, m, y] = t.split(/[\/ ]/); tgl = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; }
  else if (/^\d+([.,]\d+)?$/.test(t)) tgl = new Date(Date.UTC(1899, 11, 30) + parseFloat(t.replace(',', '.')) * 864e5).toISOString().slice(0, 10);
  else if (/^\d{4}-\d{2}-\d{2}/.test(t)) tgl = t.slice(0, 10);
  const j = r['Jam'] || ''; let jam = NaN;
  if (/^\d{1,2}[:.]\d{2}/.test(j)) jam = parseInt(j);
  else if (/^0?[.,]\d+$|^[01]$/.test(j)) jam = Math.floor(parseFloat(j.replace(',', '.')) * 24);
  const s = (r['Sentimen'] || '').trim().toLowerCase();
  return {
    platform: (r['Platform'] || 'Lainnya').trim(), user: r['Username'] || '', tgl, jam,
    text: r['Caption'] || r['Text Komentar'] || '',
    topik: (r['Topik (tanpa label buzzer)'] || r['Topik'] || 'Lainnya').trim(),
    sent: s.startsWith('pos') ? 'positif' : s.startsWith('neg') ? 'negatif' : s ? 'netral' : '',
    link: r['Link'] || '', eng: parseInt(r['Jumlah Komentar'] || r['Jumlah Likes'] || 0) || 0
  };
}
const count = (arr, key) => { const m = {}; arr.forEach(x => { const k = typeof key == 'function' ? key(x) : x[key]; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
const stats = D => { const T = D.length, p = D.filter(r => r.sent === 'positif').length, n = D.filter(r => r.sent === 'negatif').length; return { T, p, n, z: T - p - n, nsi: T ? Math.round((p - n) / T * 100) : 0, negP: T ? n / T * 100 : 0 }; };

/* ---------- Chart helpers ---------- */
function baseOpts(extra = {}) {
  const grid = css('--line'), tick = css('--mute');
  return Object.assign({
    maintainAspectRatio: false, responsive: true,
    plugins: { legend: { labels: { color: tick, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: 'Plus Jakarta Sans' } } },
      tooltip: { backgroundColor: css('--card2'), titleColor: css('--ink'), bodyColor: css('--ink'), borderColor: grid, borderWidth: 1, padding: 10 } },
    scales: { x: { grid: { display: false }, ticks: { color: tick }, border: { color: grid } },
      y: { beginAtZero: true, grid: { color: grid, borderDash: [4, 4] }, ticks: { color: tick }, border: { display: false } } }
  }, extra);
}
function mk(id, cfg) { charts[id]?.destroy(); charts[id] = new Chart($(id), cfg); }

/* ---------- Render ---------- */
async function render() {
  $('loading').hidden = false; $('loading').textContent = 'Mengambil data dari Google Sheets…';
  let all;
  try { all = await load(state.src); }
  catch (e) { $('loading').textContent = `Gagal mengambil data. Pastikan Google Sheets dibagikan "Anyone with the link – Viewer". (${e.message})`; return; }
  const dates = [...new Set(all.map(r => r.tgl))].sort();
  if (state.tgl !== 'all' && !dates.includes(state.tgl)) state.tgl = 'all';
  $('fTanggal').innerHTML = `<button data-v="all">Semua</button>` + dates.map(d => `<button data-v="${d}">${tglShort(d)}</button>`).join('');
  [...$('fTanggal').children].forEach(b => b.classList.toggle('on', b.dataset.v === state.tgl));

  const f = state.tgl, D = f === 'all' ? all : all.filter(r => r.tgl === f);
  $('loading').hidden = true; $('main').hidden = false;
  $('updated').textContent = 'Diperbarui ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ` · otomatis tiap ${REFRESH_MENIT} menit`;
  const periode = f === 'all' ? `${tglLabel(dates[0])} – ${tglLabel(dates.at(-1))}` : tglLabel(f);
  const unit = state.src === 'post' ? 'post' : 'komentar';
  $('periode').textContent = `Percakapan media sosial terkait Bank Mandiri · ${periode} · ${unit}`;

  const S = stats(D), N = D.filter(r => r.sent === 'negatif'), P = D.filter(r => r.sent === 'positif');

  /* KPI + sparkline per hari + perbandingan dengan hari sebelumnya */
  const perDay = dates.map(d => stats(all.filter(r => r.tgl === d)));
  const idx = f === 'all' ? dates.length - 1 : dates.indexOf(f);
  const cur = perDay[idx], prev = perDay[idx - 1];
  const delta = (a, b, unitTxt, inverse) => {
    if (f === 'all') return `<span>tren ${dates.length} hari (grafik kecil)</span>`;
    if (b === undefined) return `<span>tidak ada pembanding</span>`;
    const d = a - b, good = inverse ? d < 0 : d > 0, cls = d === 0 ? '' : good ? 'up' : 'down';
    return `<b class="${cls}">${d > 0 ? '▲ +' : d < 0 ? '▼ ' : ''}${(Math.round(d * 10) / 10).toString().replace('.', ',')}${unitTxt}</b> vs ${tglShort(dates[idx - 1])}`;
  };
  const lvl = S.negP >= RISK.tinggi ? 'TINGGI' : S.negP >= RISK.sedang ? 'SEDANG' : 'RENDAH';
  const lvlColor = { TINGGI: SENT.negatif, SEDANG: '#f59e0b', RENDAH: SENT.positif }[lvl];
  const sh = (s, k) => s ? s[k] / (s.T || 1) * 100 : undefined;
  const K = [
    ['💬', 'Total Mention', fmt(S.T), perDay.map(s => s.T), css('--accent'), delta(cur.T, prev?.T, '')],
    ['😊', 'Positif', `${fmt(S.p)} <small>${pct(S.p, S.T)}</small>`, perDay.map(s => s.p), SENT.positif, delta(sh(cur, 'p'), sh(prev, 'p'), ' pp')],
    ['☹️', 'Negatif', `${fmt(S.n)} <small>${pct(S.n, S.T)}</small>`, perDay.map(s => s.n), SENT.negatif, delta(sh(cur, 'n'), sh(prev, 'n'), ' pp', true)],
    ['😐', 'Netral', `${fmt(S.z)} <small>${pct(S.z, S.T)}</small>`, perDay.map(s => s.z), '#94a3b8', delta(sh(cur, 'z'), sh(prev, 'z'), ' pp')],
    ['⚖️', 'Net Sentiment Index', (S.nsi > 0 ? '+' : '') + S.nsi, perDay.map(s => s.nsi), '#a78bfa', delta(cur.nsi, prev?.nsi, ' poin')],
    ['🚨', 'Level Risiko', `<span style="color:${lvlColor}">${lvl}</span>`, perDay.map(s => s.negP), lvlColor, `negatif ${pct(S.n, S.T)} dari total`]
  ];
  $('kpis').innerHTML = K.map((k, i) => `<div class="kpi"><div class="top"><span class="ic">${k[0]}</span><canvas id="sp${i}"></canvas></div>
    <div class="l">${k[1]}</div><div class="v">${k[2]}</div><div class="d">${k[5]}</div></div>`).join('');
  document.querySelectorAll('.kpi .v small').forEach(s => s.style.cssText = 'font-size:13px;color:var(--mute);font-weight:600;margin-left:4px');
  K.forEach((k, i) => new Chart($('sp' + i), { type: 'line', data: { labels: dates, datasets: [{ data: k[3], borderColor: k[4], borderWidth: 2, pointRadius: 0, tension: .4, fill: false }] },
    options: { responsive: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } } }));

  /* Tren */
  let labels, key;
  if (f === 'all') { labels = dates; key = r => r.tgl; $('trendTitle').textContent = 'Tren Sentimen per Hari'; }
  else { labels = [...Array(24).keys()].map(h => String(h).padStart(2, '0') + '.00'); key = r => String(r.jam).padStart(2, '0') + '.00'; $('trendTitle').textContent = 'Tren Sentimen per Jam'; }
  const ser = s => labels.map(l => D.filter(r => r.sent === s && key(r) === l).length);
  const sp = ser('positif'), sn = ser('negatif'), sz = ser('netral');
  if (f !== 'all') { let last = labels.length - 1; while (last > 0 && sp[last] + sn[last] + sz[last] === 0) last--; [labels, sp, sn, sz].forEach(a => a.length = last + 1); }
  const area = (label, data, c) => ({ label, data, borderColor: c, borderWidth: 2.5, tension: .4, pointRadius: 0, pointHoverRadius: 5, fill: true,
    backgroundColor: ctx => { const { chart } = ctx, a = chart.chartArea; if (!a) return c + '22'; const g = chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, c + '40'); g.addColorStop(1, c + '00'); return g; } });
  mk('cTrend', { type: 'line', data: { labels: labels.map(l => f === 'all' ? tglShort(l) : l), datasets: [area('Negatif', sn, SENT.negatif), area('Netral', sz, SENT.netral), area('Positif', sp, SENT.positif)] },
    options: baseOpts({ interaction: { mode: 'index', intersect: false } }) });
  const pk = sn.indexOf(Math.max(...sn));
  $('trendNote').textContent = Math.max(...sn) > 0 ? `Puncak negatif: ${f === 'all' ? tglShort(labels[pk]) : 'pukul ' + labels[pk]} (${sn[pk]})` : '';

  /* Share of voice: bar horizontal */
  const kanal = count(D, 'platform');
  mk('cSov', { type: 'bar', data: { labels: kanal.map(k => k[0]), datasets: [{ label: 'Mention', data: kanal.map(k => k[1]), backgroundColor: kanal.map(k => pColor(k[0])), borderRadius: 6, barThickness: 22 }] },
    options: baseOpts({ indexAxis: 'y', plugins: { ...baseOpts().plugins, legend: { display: false }, tooltip: { ...baseOpts().plugins.tooltip, callbacks: { label: c => ` ${fmt(c.raw)} mention (${pct(c.raw, S.T)})` } } },
      scales: { x: { beginAtZero: true, grid: { color: css('--line'), borderDash: [4, 4] }, ticks: { color: css('--mute') }, border: { display: false } }, y: { grid: { display: false }, ticks: { color: css('--ink'), font: { weight: 600 } }, border: { display: false } } } }) });
  $('sovNote').textContent = kanal[0] ? `${kanal[0][0]} dominan (${pct(kanal[0][1], S.T)})` : '';

  /* Sentimen per kanal: grouped bar */
  const pf = kanal.map(k => k[0]);
  const by = s => pf.map(p => D.filter(r => r.platform === p && r.sent === s).length);
  mk('cKanalSent', { type: 'bar', data: { labels: pf, datasets: [
    { label: 'Positif', data: by('positif'), backgroundColor: SENT.positif, borderRadius: 6, maxBarThickness: 26 },
    { label: 'Negatif', data: by('negatif'), backgroundColor: SENT.negatif, borderRadius: 6, maxBarThickness: 26 },
    { label: 'Netral', data: by('netral'), backgroundColor: SENT.netral, borderRadius: 6, maxBarThickness: 26 }] }, options: baseOpts() });
  const negK = count(N, 'platform');
  $('negNote').textContent = negK[0] ? `${negK[0][0]}: ${pct(negK[0][1], N.length)} dari negatif` : '';

  /* Penyebab */
  const bars = (arr, c) => { const mx = arr[0]?.[1] || 1; return arr.slice(0, 6).map(([k, v]) => `<li><div class="t"><span>${esc(k)}</span><b>${v}</b></div><div class="bar"><i style="width:${v / mx * 100}%;background:${c}"></i></div></li>`).join('') || '<li>–</li>'; };
  const negTop = count(N, 'topik');
  $('causePos').innerHTML = bars(count(P, 'topik'), SENT.positif);
  $('causeNeg').innerHTML = bars(negTop, SENT.negatif);

  /* Postingan negatif */
  const ex = [...N].sort((a, b) => b.eng - a.eng).slice(0, 8);
  $('posts').innerHTML = ex.map(p => `<div class="post"><span class="chip"><i style="background:${pColor(p.platform)}"></i>${esc(p.platform)}</span>
    <div><b>${esc(p.user)}</b></div><p>“${esc(p.text.slice(0, 160))}${p.text.length > 160 ? '…' : ''}”</p>
    <div class="meta"><span>💬 ${fmt(p.eng)} ${state.src === 'post' ? 'komentar' : 'likes'} · ${tglShort(p.tgl)}</span>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Lihat ↗</a>` : ''}</div></div>`).join('') || '<p>Tidak ada postingan negatif.</p>';

  /* Word cloud */
  const STOP = new Set('yang dan di ke dari ini itu untuk dengan pada juga ada tidak bisa sudah akan atau aja saja kita kami saya aku gue gw lu kamu dia mereka nya ya ga gak nggak enggak tapi karena jadi lagi mau buat sama oleh dalam bank mandiri bankmandiri bmri the https http www com co id dll yg dgn utk sih kok deh dong lah kan pun para seperti lebih bagi masih hanya kalau kalo tak telah agar semua baru banyak pak bu min admin mohon terima kasih halo sahabat apa siapa udah udh sdh tdk gimana bagaimana'.split(' '));
  const wc = {}; N.forEach(r => r.text.toLowerCase().replace(/https?:\S+|[@#]\S+/g, ' ').split(/[^a-z0-9]+/).forEach(w => { if (w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)) wc[w] = (wc[w] || 0) + 1; }));
  const words = Object.entries(wc).sort((a, b) => b[1] - a[1]).slice(0, 30), wMax = words[0]?.[1] || 1;
  const wcc = ['#ef4444', '#FDB913', '#38bdf8', '#a78bfa', '#22c55e', '#f97316', css('--ink')];
  words.sort((a, b) => a[0].localeCompare(b[0]));
  $('cloud').innerHTML = words.map((w, i) => `<span title="${w[1]}x" style="font-size:${12 + w[1] / wMax * 28}px;color:${wcc[i % wcc.length]}">${esc(w[0])}</span>`).join('') || '–';

  /* Top akun */
  const acc = {}; N.forEach(r => { const a = acc[r.user] || (acc[r.user] = { n: 0, eng: 0, topik: {}, pf: r.platform }); a.n++; a.eng += r.eng; a.topik[r.topik] = (a.topik[r.topik] || 0) + 1; });
  const topAcc = Object.entries(acc).sort((a, b) => b[1].n - a[1].n || b[1].eng - a[1].eng).slice(0, 5);
  $('topAcc').innerHTML = `<tr><th>Akun</th><th class="r">Neg.</th><th class="r">${state.src === 'post' ? 'Komen' : 'Likes'}</th><th>Topik utama</th></tr>` +
    topAcc.map(([u, a]) => `<tr><td><span class="av" style="color:${pColor(a.pf)}">${esc(u[0]?.toUpperCase() || '?')}</span><b>${esc(u)}</b><br><small style="margin-left:36px">${esc(a.pf)}</small></td><td class="r">${a.n}</td><td class="r">${fmt(a.eng)}</td><td>${esc(Object.entries(a.topik).sort((x, y) => y[1] - x[1])[0][0])}</td></tr>`).join('');

  /* Risiko & narasi */
  $('riskRing').style.setProperty('--p', S.negP.toFixed(1)); $('riskRing').style.setProperty('--c', lvlColor);
  $('riskPct').textContent = pct(S.n, S.T);
  $('risk').textContent = lvl; $('risk').style.color = lvlColor;
  $('riskNote').textContent = `Tinggi ≥${RISK.tinggi}% · Sedang ≥${RISK.sedang}%`;
  $('flow').innerHTML = negTop.slice(0, 4).map(([k, v]) => `<span class="s">${esc(k)} <b>${v}</b></span>`).join('<span class="a">→</span>') || '–';
  const t3 = negTop.slice(0, 3).reduce((s, x) => s + x[1], 0);
  $('impact').textContent = negTop.length ? `${t3} dari ${N.length} mention negatif (${pct(t3, N.length)}) berasal dari 3 topik teratas. Dampak: reputasi, kepercayaan nasabah, dan sentimen investor.` : '';

  /* Rekomendasi (template otomatis) */
  const negPf = negK[0]?.[0] || 'kanal utama';
  const reco = {
    'Jangka Pendek': [...negTop.slice(0, 3).map(x => `Holding statement & klarifikasi isu "${x[0]}"`), `Perkuat respons akun resmi di ${negPf}`],
    'Jangka Menengah': ['Susun FAQ untuk pertanyaan berulang', 'Koordinasi dengan unit terkait untuk penyelesaian isu', 'Laporan monitoring harian ke manajemen'],
    'Jangka Reputasi': [`Dorong konten positif: ${count(P, 'topik')[0]?.[0] || 'kinerja'}`, 'Libatkan media & komunitas untuk narasi penyeimbang', 'Evaluasi tren NSI mingguan']
  };
  $('reco').innerHTML = Object.entries(reco).map(([k, v]) => `<div><h3>${k}</h3><ul>${v.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');

  /* Summary */
  $('summaryText').textContent = `Monitoring periode ${periode} mencatat ${fmt(S.T)} ${unit}: ${fmt(S.p)} positif (${pct(S.p, S.T)}), ${fmt(S.n)} negatif (${pct(S.n, S.T)}), dan ${fmt(S.z)} netral (${pct(S.z, S.T)}), dengan Net Sentiment Index ${S.nsi}. ` +
    (negTop[0] ? `Isu negatif terbesar adalah "${negTop[0][0]}" (${negTop[0][1]} mention)${negTop[1] ? `, disusul "${negTop[1][0]}" (${negTop[1][1]})` : ''}. ` : '') +
    (kanal[0] ? `Percakapan paling banyak terjadi di ${kanal[0][0]} (${pct(kanal[0][1], S.T)}). ` : '') + `Level risiko saat ini: ${lvl}.`;
  $('disclaimer').textContent = `Dihitung otomatis dari sheet "${TABS[state.src]}" pada kanal: ${kanal.map(k => k[0]).join(', ')}. Sentimen dan topik mengikuti label di sheet; data hari berjalan bisa belum lengkap. Rekomendasi adalah template otomatis yang perlu ditinjau. Dashboard ini analisis independen, bukan publikasi resmi bank.`;
}

/* ---------- UI ---------- */
function setThemeIcon() { $('themeBtn').textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾'; }
$('themeBtn').onclick = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t); } catch (e) {}
  setThemeIcon(); render();
};
setThemeIcon();
$('fTanggal').onclick = e => { const b = e.target.closest('button'); if (!b) return; state.tgl = b.dataset.v; render(); };
$('fSumber').onclick = e => { const b = e.target.closest('button'); if (!b) return; state.src = b.dataset.v; [...$('fSumber').children].forEach(x => x.classList.toggle('on', x === b)); render(); };
$('menuBtn').onclick = () => document.body.classList.toggle('nav-open');
$('backdrop').onclick = () => document.body.classList.remove('nav-open');
document.querySelectorAll('nav a').forEach(a => a.onclick = () => document.body.classList.remove('nav-open'));
// Sorot menu sesuai bagian yang sedang dilihat
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('nav a').forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });

Chart.defaults.font.family = 'Plus Jakarta Sans, system-ui, sans-serif';
render();
setInterval(() => { delete cache.post; delete cache.komentar; render(); }, REFRESH_MENIT * 60 * 1000);
