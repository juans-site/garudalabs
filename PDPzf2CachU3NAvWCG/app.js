/* ===== PENGATURAN ===== */
const SHEET_ID = "17TKTfowFucPllDf5fE1TTw6GizCWg5B1axB90xuzd2Q";
const TABS = { post: "Data Postingan" }; // sheet ini belum punya tab Komentar
const RISK = { tinggi: 35, sedang: 20 };          // ambang % negatif
const REFRESH_MENIT = 5;
// Akun resmi pemerintah/lembaga terkait karhutla (huruf besar/kecil diabaikan). Dipakai untuk penanda & insight SNA.
const AKUN_RESMI = ['bnpb_indonesia', 'bnpb', 'bmkgnews', 'infobmkg', 'kemenlhk', 'klhk', 'kementerianlhk', 'manggala_agni', 'brgmindonesia', 'divhumas_polri', 'tniad', 'puspentni', 'kemensetneg', 'jokowi', 'prabowo', 'setkabgoid'];
// Top 5 Akun tidak memasukkan akun media/berita (Tipe "Media" di sheet),
// KECUALI homeless media di daftar ini (huruf besar/kecil diabaikan) — silakan tambah/kurangi.
const HOMELESS_MEDIA = ['putrapostdaily', 'mojiupdates', 'volleyballidn', 'democrazymedia', 'updatenusantaracom', 'mediakonsumenid'];
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
const SENT = { positif: '#22C55E', negatif: '#F05252', netral: '#94A3B8' };

const state = { gran: 'harian', cloud: 'neg', acc: 'neg', src: 'post', from: null, to: null, preset: 'all' }; // from/to = 'yyyy-mm-dd', null = semua
const cache = {}, charts = {};
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------- Data ---------- */
async function load(src) {
  if (cache[src]) return cache[src];
  if (!TABS[src] && src !== 'all') return cache[src] = [];
  if (src === 'all') { const [p, k] = await Promise.all([load('post'), load('komentar')]); return cache.all = p.concat(k); }
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(TABS[src])}&_=${Date.now()}`;
  const txt = await fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
  const rows = Papa.parse(txt, { header: true, skipEmptyLines: true }).data;
  return cache[src] = rows.map(r => norm(r, src)).filter(r => r.tgl && r.sent);
}
// Tanggal: "dd/mm/yyyy", serial angka, atau "yyyy-mm-dd". Jam: "HH:MM" atau pecahan hari.
function norm(r, kind) {
  const t = r['Waktu'] || r['Tanggal (WIB)'] || ''; let tgl = '';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(t)) { const [d, m, y] = t.split(/[\/ ]/); tgl = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; }
  else if (/^\d+([.,]\d+)?$/.test(t)) tgl = new Date(Date.UTC(1899, 11, 30) + parseFloat(t.replace(',', '.')) * 864e5).toISOString().slice(0, 10);
  else if (/^\d{4}-\d{2}-\d{2}/.test(t)) tgl = t.slice(0, 10);
  const j = r['Jam'] || r['Jam (WIB)'] || ''; let jam = NaN;
  if (/^\d{1,2}[:.]\d{2}/.test(j)) jam = parseInt(j);
  else if (/^0?[.,]\d+$|^[01]$/.test(j)) jam = Math.floor(parseFloat(j.replace(',', '.')) * 24);
  // jam lengkap HH:MM untuk tabel raw data
  let jamStr = '';
  if (/^\d{1,2}[:.]\d{2}/.test(j)) { const [hh, mm] = j.split(/[:.]/); jamStr = hh.padStart(2, '0') + ':' + mm.slice(0, 2); }
  else if (/^0?[.,]\d+$|^[01]$/.test(j)) { const m = Math.round(parseFloat(j.replace(',', '.')) * 1440) % 1440; jamStr = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  const s = (r['Sentimen'] || '').trim().toLowerCase();
  const user = (r['Username'] || '').trim();
  const resmi = /resmi/i.test(r['Tipe'] || '') || AKUN_RESMI.includes(user.toLowerCase());
  return {
    platform: (r['Platform'] || 'Lainnya').trim(), user: r['Username'] || '', tgl, jam,
    text: r['Caption'] || r['Teks Postingan'] || r['Text Komentar'] || '',
    topik: (r['Topik (tanpa label buzzer)'] || r['Topik'] || 'Lainnya').trim(),
    sent: !s ? '' : s.startsWith('pos') ? 'positif' : s.startsWith('neg') ? 'negatif' : 'netral', resmi,
    link: r['Link'] || r['URL'] || '', jamStr, media: /^media$/i.test((r['Tipe'] || '').trim()) && !HOMELESS_MEDIA.includes(user.toLowerCase()), eng: ['Likes/Reaksi', 'Komentar', 'Share/Repost'].reduce((s, k) => s + (parseInt(String(r[k] || '0').replace(/[.,]/g, '')) || 0), 0), kind
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
  $('loading').hidden = !$('main').hidden; // spinner hanya saat pertama memuat
  let all;
  try { all = await load(state.src); }
  catch (e) { $('loading').textContent = `Gagal memuat data. Silakan muat ulang halaman beberapa saat lagi. (${e.message})`; return; }
  const dates = [...new Set(all.map(r => r.tgl))].sort();
  const minD = dates[0], maxD = dates.at(-1);
  applyPreset(dates);
  const from = state.from || minD, to = state.to || maxD;
  const inRange = d => d >= from && d <= to;
  state.range = { from, to };
  const days = dates.filter(inRange);
  buildPicker(dates, from, to);



  const single = from === to, isAll = from <= minD && to >= maxD, D = all.filter(r => inRange(r.tgl));
  $('loading').hidden = true; $('main').hidden = false;
  if (!$('viewSna').hidden) renderSNA();
  state.rawD = D; state.rawUnitPost = state.src; renderRaw(true); document.querySelector('.raw-wrap').scrollTop = 0;

  const periode = single ? tglLabel(from) : `${tglLabel(from)} – ${tglLabel(to)}`;
  const unit = { post: 'post', komentar: 'komentar', all: 'mention' }[state.src];
  $('periode').textContent = `Percakapan media sosial terkait Kebakaran Hutan & Lahan (KARHUTLA) · ${periode} · ${unit}`;

  const S = stats(D), N = D.filter(r => r.sent === 'negatif'), P = D.filter(r => r.sent === 'positif');

  /* KPI + sparkline per hari + perbandingan dengan hari sebelumnya */
  // Grafik kecil mengikuti date range: per hari, atau per jam bila hanya 1 hari
  const perDay = single
    ? [...Array(24).keys()].map(h => stats(D.filter(r => r.jam === h)))
    : days.map(d => stats(D.filter(r => r.tgl === d)));
  // Pembanding: periode sebelumnya dengan jumlah hari yang sama
  const span = days.length, prevDays = dates.filter(d => d < from).slice(-span);
  const cur = S, prev = (!isAll && prevDays.length === span) ? stats(all.filter(r => prevDays.includes(r.tgl))) : undefined;
  const prevLbl = prevDays.length ? (span === 1 ? tglShort(prevDays[0]) : `${span} hari sebelumnya`) : '';

  const delta = (a, b, unitTxt, inverse) => {
    if (isAll) return `<span>tren ${dates.length} hari</span>`;
    if (b === undefined) return `<span>tidak ada pembanding</span>`;
    const d = a - b, good = inverse ? d < 0 : d > 0, cls = d === 0 ? '' : good ? 'up' : 'down';
    return `<b class="${cls}">${d > 0 ? '▲ +' : d < 0 ? '▼ ' : ''}${(Math.round(d * 10) / 10).toString().replace('.', ',')}${unitTxt}</b> vs ${prevLbl}`;
  };
  const lvl = S.negP >= RISK.tinggi ? 'TINGGI' : S.negP >= RISK.sedang ? 'SEDANG' : 'RENDAH';
  const lvlColor = { TINGGI: SENT.negatif, SEDANG: '#f59e0b', RENDAH: SENT.positif }[lvl];
  const sh = (s, k) => s ? s[k] / (s.T || 1) * 100 : undefined;
  const K = [
    ['💬', 'Total Mention', fmt(S.T), '', perDay.map(s => s.T), css('--accent'), delta(cur.T, prev?.T, '')],
    ['😊', 'Positif', fmt(S.p), pct(S.p, S.T), perDay.map(s => s.p), SENT.positif, delta(sh(cur, 'p'), sh(prev, 'p'), ' pp')],
    ['☹️', 'Negatif', fmt(S.n), pct(S.n, S.T), perDay.map(s => s.n), SENT.negatif, delta(sh(cur, 'n'), sh(prev, 'n'), ' pp', true)],
    ['😐', 'Netral', fmt(S.z), pct(S.z, S.T), perDay.map(s => s.z), SENT.netral, delta(sh(cur, 'z'), sh(prev, 'z'), ' pp')],
    ['⚖️', 'Net Sentiment Index', (S.nsi > 0 ? '+' : '') + S.nsi, '', perDay.map(s => s.nsi), '#a78bfa', delta(cur.nsi, prev?.nsi, ' poin')],
    ['🚨', 'Level Risiko', `<span style="color:${lvlColor}">${lvl[0] + lvl.slice(1).toLowerCase()}</span>`, `negatif ${pct(S.n, S.T)} dari total`, null, lvlColor, '']
  ];
  const segs = Math.min(5, Math.ceil(S.negP / 10));
  $('kpis').innerHTML = K.map((k, i) => `<div class="kpi">
    <div class="kh"><span class="l">${k[1]}</span><span class="ic" style="background:${k[5]}26">${k[0]}</span></div>
    <div class="v">${k[2]}</div>${k[3] ? `<div class="sub">${k[3]}</div>` : '<div class="sub">&nbsp;</div>'}
    <div class="kf">${k[4] ? `<div class="d">${k[6]}</div><canvas id="sp${i}"></canvas>`
      : `<div class="riskbar">${[0, 1, 2, 3, 4].map(x => `<i style="${x < segs ? `background:${k[5]}` : ''}"></i>`).join('')}</div>`}</div></div>`).join('');
  K.forEach((k, i) => { if (!k[4]) return; new Chart($('sp' + i), { type: 'line', data: { labels: k[4].map((_, x) => x), datasets: [{ data: k[4], borderColor: k[5], borderWidth: 1.8, pointRadius: 0, tension: .35, fill: true,
    backgroundColor: ctx => { const a = ctx.chart.chartArea; if (!a) return k[5] + '22'; const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, k[5] + '55'); g.addColorStop(1, k[5] + '00'); return g; } }] },
    options: { responsive: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } } }); });

  /* Tren */
  // Pilihan granularitas grafik tren: Per Jam (khusus 1 hari), Harian, Mingguan, Bulanan
  const gOpts = single ? [['jam', 'Per Jam']] : [['harian', 'Harian'], ['mingguan', 'Mingguan'], ['bulanan', 'Bulanan']];
  if (!gOpts.some(o => o[0] === state.gran)) state.gran = gOpts[0][0];
  $('fGran').innerHTML = gOpts.map(([v, l]) => `<option value="${v}" ${v === state.gran ? 'selected' : ''}>${l}</option>`).join('');
  $('fGran').disabled = single;
  const weekStart = d => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
  let labels, key, fmtL;
  if (state.gran === 'jam') { labels = [...Array(24).keys()].map(h => String(h).padStart(2, '0') + '.00'); key = r => String(r.jam).padStart(2, '0') + '.00'; fmtL = l => l; }
  else if (state.gran === 'mingguan') { labels = [...new Set(days.map(weekStart))]; key = r => weekStart(r.tgl); fmtL = l => 'Mg ' + tglShort(l); }
  else if (state.gran === 'bulanan') { labels = [...new Set(days.map(d => d.slice(0, 7)))]; key = r => r.tgl.slice(0, 7); fmtL = l => BULAN[+l.slice(5) - 1] + ' ' + l.slice(0, 4); }
  else { labels = days; key = r => r.tgl; fmtL = tglShort; }
  $('trendTitle').textContent = 'Tren Sentimen ' + { jam: 'per Jam', harian: 'per Hari', mingguan: 'per Minggu', bulanan: 'per Bulan' }[state.gran];
  const ser = s => labels.map(l => D.filter(r => r.sent === s && key(r) === l).length);
  const sp = ser('positif'), sn = ser('negatif'), sz = ser('netral');
  if (single) { let last = labels.length - 1; while (last > 0 && sp[last] + sn[last] + sz[last] === 0) last--; [labels, sp, sn, sz].forEach(a => a.length = last + 1); }
  const area = (label, data, c) => ({ label, data, borderColor: c, borderWidth: 2.5, tension: .4, pointRadius: 0, pointHoverRadius: 5, fill: true,
    backgroundColor: ctx => { const { chart } = ctx, a = chart.chartArea; if (!a) return c + '22'; const g = chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, c + '40'); g.addColorStop(1, c + '00'); return g; } });
  mk('cTrend', { type: 'line', data: { labels: labels.map(fmtL), datasets: [area('Negatif', sn, SENT.negatif), area('Netral', sz, SENT.netral), area('Positif', sp, SENT.positif)] },
    options: baseOpts({ interaction: { mode: 'index', intersect: false }, plugins: { ...baseOpts().plugins, legend: { display: false } } }) });
  const pk = sn.indexOf(Math.max(...sn));
  $('trendNote').textContent = Math.max(...sn) > 0 ? `Puncak negatif: ${state.gran === 'jam' ? 'pukul ' + labels[pk] : fmtL(labels[pk])} (${sn[pk]})` : '';

  /* Share of voice: bar horizontal */
  const kanal = count(D, 'platform');
  mk('cSov', { type: 'bar', data: { labels: kanal.map(k => k[0]), datasets: [{ label: 'Mention', data: kanal.map(k => k[1]), backgroundColor: kanal.map(k => pColor(k[0])), borderRadius: 4, barThickness: 16 }] },
    plugins: [{ id: 'pctLbl', afterDatasetsDraw(c) { const { ctx } = c; ctx.save(); ctx.fillStyle = css('--ink'); ctx.font = '600 12px Plus Jakarta Sans, sans-serif'; ctx.textBaseline = 'middle'; c.getDatasetMeta(0).data.forEach((b, x) => ctx.fillText(pct(kanal[x][1], S.T), b.x + 8, b.y)); ctx.restore(); } }],
    options: baseOpts({ indexAxis: 'y', plugins: { ...baseOpts().plugins, legend: { display: false }, tooltip: { ...baseOpts().plugins.tooltip, callbacks: { label: c => ` ${fmt(c.raw)} mention (${pct(c.raw, S.T)})` } } },
      layout: { padding: { right: 56 } }, scales: { x: { display: false, beginAtZero: true }, y: { grid: { display: false }, ticks: { color: css('--ink'), font: { weight: 600 } }, border: { display: false } } } }) });
  $('sovNote').textContent = kanal[0] ? `${kanal[0][0]} dominan (${pct(kanal[0][1], S.T)})` : '';

  /* Sentimen per kanal: grouped bar */
  const pf = kanal.map(k => k[0]);
  const by = s => pf.map(p => D.filter(r => r.platform === p && r.sent === s).length);
  $('kanalSent').innerHTML = `<div class="ks-h"><span></span><span></span><span>Negatif</span><span>Netral</span><span>Positif</span></div>` + pf.map((p, i) => {
    const n = by('negatif')[i], z = by('netral')[i], q = by('positif')[i], t = n + z + q || 1;
    return `<div class="ks-r"><span class="ks-n">${esc(p)}</span><div class="ks-bar"><i style="width:${n / t * 100}%;background:${SENT.negatif}"></i><i style="width:${z / t * 100}%;background:${SENT.netral}"></i><i style="width:${q / t * 100}%;background:${SENT.positif}"></i></div><span>${Math.round(n / t * 100)}%</span><span>${Math.round(z / t * 100)}%</span><span>${Math.round(q / t * 100)}%</span></div>`;
  }).join('');
  const negK = count(N, 'platform');
  $('negNote').textContent = negK[0] ? `${negK[0][0]}: ${pct(negK[0][1], N.length)} dari negatif` : '';

  /* Penyebab */
  const bars = (arr, c) => { const mx = arr[0]?.[1] || 1; return arr.slice(0, 6).map(([k, v], x) => `<li><span class="num">${x + 1}</span><div class="cb"><div class="t"><span>${esc(k)}</span><b>${fmt(v)}</b></div><div class="bar"><i style="width:${v / mx * 100}%;background:${c}"></i></div></div></li>`).join('') || '<li>–</li>'; };
  const negTop = count(N, 'topik');
  $('causePos').innerHTML = bars(count(P, 'topik'), SENT.positif);
  $('causeNeg').innerHTML = bars(negTop, SENT.negatif);
  $('causeHint').textContent = periode;

  /* Postingan negatif */
  const NN = N.filter(r => !/^news/i.test(r.platform));
  const ex = [...NN].sort((a, b) => b.eng - a.eng).slice(0, 8);
  $('postsHint').textContent = `${fmt(NN.length)} ${unit} negatif · ${periode} · tanpa News · urut engagement`;
  $('posts').scrollLeft = 0;
  $('posts').innerHTML = ex.map(p => `<div class="post"><span class="chip"><i style="background:${pColor(p.platform)}"></i>${esc(p.platform)}</span>
    <div><b>${esc(p.user)}</b></div><p>“${esc(p.text.slice(0, 160))}${p.text.length > 160 ? '…' : ''}”</p>
    <div class="meta"><span>💬 ${fmt(p.eng)} engagement · ${tglShort(p.tgl)}</span>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Lihat ↗</a>` : ''}</div></div>`).join('') || '<p>Tidak ada postingan negatif.</p>';

  /* Word cloud */
  const STOP = new Set('yang dan di ke dari ini itu untuk dengan pada juga ada tidak bisa sudah akan atau aja saja kita kami saya aku gue gw lu kamu dia mereka nya ya ga gak nggak enggak tapi karena jadi lagi mau buat sama oleh dalam bank karhutla kebakaran hutan lahan the https http www com co id dll yg dgn utk sih kok deh dong lah kan pun para seperti lebih bagi masih hanya kalau kalo tak telah agar semua baru banyak pak bu min admin mohon terima kasih halo sahabat apa siapa udah udh sdh tdk gimana bagaimana akibat belum dapat hari jangan kena usai terlihat milik khusus berbeda kapan setelah sedang hingga sampai menjadi tersebut karna emang memang banget sangat orang'.split(' '));
  const cloudSrc = state.cloud === 'pos' ? P : N;
  const wc = {}; cloudSrc.forEach(r => r.text.toLowerCase().replace(/https?:\S+|[@#]\S+/g, ' ').split(/[^a-z0-9]+/).forEach(w => { if (w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)) wc[w] = (wc[w] || 0) + 1; }));
  const words = Object.entries(wc).sort((a, b) => b[1] - a[1]).slice(0, 30), wMax = words[0]?.[1] || 1;
  const wcc = state.cloud === 'pos' ? ['#22c55e', '#38bdf8', '#FFBE00', '#a78bfa', '#14b8a6', css('--ink')] : ['#F05252', '#FFBE00', '#f97316', '#a78bfa', '#38bdf8', css('--ink')];
  words.sort((a, b) => a[0].localeCompare(b[0]));
  $('cloud').innerHTML = words.map((w, i) => `<span title="${w[1]}x" style="font-size:${12 + w[1] / wMax * 26}px;color:${wcc[i % wcc.length]}">${esc(w[0])}</span>`).join('') || '<p class="empty">Belum ada data</p>';
  $('cloudTitle').textContent = `Word Cloud ${state.cloud === 'pos' ? 'Positif' : 'Negatif'}`;

  /* Top akun */
  // tanpa News dan tanpa username kosong/tidak valid
  const badUser = u => !u || /^(-|—|–|n\/?a|null|unknown|anonim)$/i.test(u.trim());
  const accSrc = (state.acc === 'pos' ? P : N).filter(r => !/^news/i.test(r.platform) && !r.media && !badUser(r.user));
  const acc = {}; accSrc.forEach(r => { const a = acc[r.user] || (acc[r.user] = { n: 0, eng: 0, topik: {}, pf: r.platform }); a.n++; a.eng += r.eng; a.topik[r.topik] = (a.topik[r.topik] || 0) + 1; });
  const topAcc = Object.entries(acc).sort((a, b) => b[1].n - a[1].n || b[1].eng - a[1].eng).slice(0, 5);
  const accC = state.acc === 'pos' ? SENT.positif : SENT.negatif, accMax = topAcc[0]?.[1].n || 1, engLbl = state.src === 'post' ? 'komentar' : 'likes';
  $('accTitle').textContent = `Top 5 Akun ${state.acc === 'pos' ? 'Positif' : 'Negatif'}`;
  $('topAcc').innerHTML = topAcc.map(([u, a], i) => `<li>
    <span class="rank">${i + 1}</span>
    <span class="av" style="background:${pColor(a.pf)}22;color:${pColor(a.pf)}">${esc(u[0]?.toUpperCase() || '?')}</span>
    <div class="acc-main"><div class="acc-top"><b title="${esc(u)}">${esc(u)}</b><span class="acc-n" style="color:${accC}">${a.n} ${unit}</span></div>
      <div class="acc-sub"><span class="chip sm"><i style="background:${pColor(a.pf)}"></i>${esc(a.pf)}</span><span title="${esc(Object.entries(a.topik).sort((x, y) => y[1] - x[1])[0][0])}">${esc(Object.entries(a.topik).sort((x, y) => y[1] - x[1])[0][0])}</span></div>
      <div class="acc-bar"><i style="width:${a.n / accMax * 100}%;background:${accC}"></i></div></div>
  </li>`).join('') || '<li class="empty">Belum ada data</li>';


  /* Risiko & narasi */
  $('riskRing').style.setProperty('--p', S.negP.toFixed(1)); $('riskRing').style.setProperty('--c', lvlColor);
  $('riskPct').textContent = pct(S.n, S.T);
  $('risk').textContent = lvl; $('risk').style.color = lvlColor;
  $('riskNote').textContent = `Tinggi ≥${RISK.tinggi}% · Sedang ≥${RISK.sedang}%`;
  const nMax = negTop[0]?.[1] || 1;
  $('flow').innerHTML = negTop.slice(0, 4).map(([k, v], i) => `<li><span class="rank">${i + 1}</span><div><div class="acc-top"><span class="nt">${esc(k)}</span><b style="color:var(--neg)">${v}</b></div><div class="acc-bar"><i style="width:${v / nMax * 100}%;background:var(--neg)"></i></div></div></li>`).join('') || '<li class="empty">Tidak ada isu negatif</li>';
  const t3 = negTop.slice(0, 3).reduce((s, x) => s + x[1], 0);
  $('impact').textContent = negTop.length ? `${t3} dari ${N.length} mention negatif (${pct(t3, N.length)}) berasal dari 3 topik teratas. Dampak: kepercayaan publik pada penanganan karhutla, kesehatan warga, dan hubungan lintas negara.` : '';

  /* Rekomendasi (template otomatis) */
  const negPf = negK[0]?.[0] || 'kanal utama';
  const reco = {
    'Jangka Pendek': [...negTop.slice(0, 3).map(x => `Siapkan informasi & klarifikasi resmi untuk isu "${x[0]}"`), `Perkuat kanal informasi resmi (titik api, kualitas udara) di ${negPf}`],
    'Jangka Menengah': ['Publikasi rutin data hotspot & ISPU per wilayah', 'Koordinasi BNPB, KLHK, BMKG & pemda untuk pesan yang seragam', 'Laporan monitoring harian ke pimpinan'],
    'Jangka Panjang': [`Angkat cerita positif: ${count(P, 'topik')[0]?.[0] || 'pemadaman'}`, 'Kampanye pencegahan pembakaran lahan bersama komunitas', 'Evaluasi tren NSI & penegakan hukum terhadap pelaku']
  };
  $('reco').innerHTML = Object.entries(reco).map(([k, v]) => `<div><h3>${k}</h3><ul>${v.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');

  /* Summary */
  const posTop = count(P, 'topik');
  const pts = [
    ['Periode', `${periode} · ${fmt(S.T)} ${unit}`],
    ['Sentimen', `<span class="pos">${fmt(S.p)} positif (${pct(S.p, S.T)})</span> · <span class="neg">${fmt(S.n)} negatif (${pct(S.n, S.T)})</span> · ${fmt(S.z)} netral (${pct(S.z, S.T)})`],
    ['Net Sentiment Index', `${S.nsi > 0 ? '+' : ''}${S.nsi}`],
    negTop[0] && ['Isu negatif utama', esc(negTop.slice(0, 2).map(x => `${x[0]} (${fmt(x[1])})`).join('; '))],
    posTop[0] && ['Isu positif utama', esc(posTop.slice(0, 2).map(x => `${x[0]} (${fmt(x[1])})`).join('; '))],
    kanal[0] && ['Kanal dominan', `${esc(kanal[0][0])} (${pct(kanal[0][1], S.T)})${negK[0] ? `; negatif terbanyak di ${esc(negK[0][0])}` : ''}`],
    ['Level risiko', `<b style="color:${lvlColor}">${lvl}</b>`]
  ].filter(Boolean);
  $('summaryText').innerHTML = pts.map(([k, v]) => `<li><span class="sk">${k}</span><span class="sv">${v}</span></li>`).join('');
}

/* ---------- UI ---------- */
function setThemeIcon() { $('themeBtn').textContent = document.documentElement.dataset.theme === 'dark' ? '☀' : '☾'; }
$('themeBtn').onclick = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t); } catch (e) {}
  setThemeIcon(); sna.key = ''; render();
};
setThemeIcon();

$('fSumber').onclick = e => { const b = e.target.closest('button'); if (!b) return; state.src = b.dataset.v; [...$('fSumber').children].forEach(x => x.classList.toggle('on', x === b)); render(); };



// Date range picker
function applyPreset(dates) {
  const maxD = dates.at(-1), p = state.preset;
  if (p === 'custom') return;
  if (p === 'all') { state.from = state.to = null; return; }
  const n = { last1: 1, last3: 3, last7: 7, last30: 30 }[p];
  // hitung mundur n hari kalender dari tanggal data terbaru
  const d = new Date(maxD + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (n - 1));
  state.from = d.toISOString().slice(0, 10); state.to = maxD;
}
const PRESETS = [['all', 'Semua periode'], ['last1', 'Hari terakhir'], ['last3', '3 hari terakhir'], ['last7', '7 hari terakhir'], ['last30', '30 hari terakhir']];
function buildPicker(dates, from, to) {
  const maxD = dates.at(-1);
  $('presets').innerHTML = PRESETS.map(([k, l]) => `<button data-p="${k}" class="${state.preset === k ? 'on' : ''}">${l}${k === 'last1' ? `<small>${tglShort(maxD)}</small>` : ''}</button>`).join('');
  $('dFrom').min = $('dTo').min = dates[0]; $('dFrom').max = $('dTo').max = maxD;
  $('dFrom').value = from; $('dTo').value = to;
  const lbl = PRESETS.find(p => p[0] === state.preset);
  $('drLabel').textContent = state.preset === 'custom' ? (from === to ? tglLabel(from) : `${tglShort(from)} – ${tglLabel(to)}`) : lbl[1];
}
const pop = $('drPop'), openPop = o => { pop.hidden = !o; $('drBtn').setAttribute('aria-expanded', o); };
$('drBtn').onclick = e => { e.stopPropagation(); openPop(pop.hidden); };
pop.onclick = e => e.stopPropagation();
document.addEventListener('click', () => openPop(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') openPop(false); });
$('presets').onclick = e => { const b = e.target.closest('button'); if (!b) return; state.preset = b.dataset.p; openPop(false); render(); };
$('drCancel').onclick = () => openPop(false);
$('drApply').onclick = () => {
  let a = $('dFrom').value, b = $('dTo').value; if (!a || !b) return;
  if (a > b) [a, b] = [b, a];
  state.preset = 'custom'; state.from = a; state.to = b; openPop(false); render();
};



Chart.defaults.font.family = 'Plus Jakarta Sans, system-ui, sans-serif';
render();
setInterval(() => { delete cache.post; delete cache.komentar; delete cache.all; render(); }, REFRESH_MENIT * 60 * 1000);

document.querySelectorAll('.seg.mini').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; state[g.dataset.k] = b.dataset.v; [...g.children].forEach(x => x.classList.toggle('on', x === b)); render(); });

/* ---------- Tab & Raw Data ---------- */
const raw = { q: '', sent: '', pf: '', sort: 'dt', dir: -1, page: 1, size: 50 };
document.querySelectorAll('.tabs [role=tab]').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabs [role=tab]').forEach(x => x.classList.toggle('on', x === b));
  $('viewDash').hidden = b.dataset.tab !== 'dash'; $('viewRaw').hidden = b.dataset.tab !== 'raw'; $('viewSna').hidden = b.dataset.tab !== 'sna';
  $('fSumber').style.visibility = b.dataset.tab === 'sna' ? 'hidden' : ''; // SNA selalu Post + Komentar
  if (b.dataset.tab === 'sna') { renderSNA(); requestAnimationFrame(() => sna.fitAll?.()); }
  if (b.dataset.tab === 'dash') Object.values(charts).forEach(c => c.resize());
});
function renderRaw(reset) {
  const D = state.rawD || [];
  if (reset) {
    raw.page = 1;
    const pfs = [...new Set(D.map(r => r.platform))].sort();
    if (raw.pf && !pfs.includes(raw.pf)) raw.pf = '';
    $('rawPf').innerHTML = '<option value="">Semua platform</option>' + pfs.map(p => `<option ${p === raw.pf ? 'selected' : ''}>${esc(p)}</option>`).join('');
  }
  const q = raw.q.toLowerCase();
  let rows = D.filter(r => (!raw.sent || r.sent === raw.sent) && (!raw.pf || r.platform === raw.pf) &&
    (!q || (r.text + ' ' + r.user + ' ' + r.topik).toLowerCase().includes(q)));
  const key = r => raw.sort === 'eng' ? r.eng : r.tgl + ' ' + (r.jamStr || '');
  rows.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * raw.dir);
  const pages = Math.max(1, Math.ceil(rows.length / raw.size)); raw.page = Math.min(raw.page, pages);
  const start = (raw.page - 1) * raw.size, view = rows.slice(start, start + raw.size);
  const engHead = 'Engagement';
  document.querySelector('th[data-sort=eng]').firstChild.textContent = engHead + ' ';
  document.querySelectorAll('th.sortable i').forEach(i => i.textContent = i.parentNode.dataset.sort === raw.sort ? (raw.dir < 0 ? '▼' : '▲') : '');
  $('rawCount').textContent = rows.length ? `${fmt(start + 1)}–${fmt(start + view.length)} dari ${fmt(rows.length)} baris` : '0 baris';
  $('rawBody').innerHTML = view.map(r => `<tr>
    <td class="nw"><b>${tglShort(r.tgl)} ${r.tgl.slice(0, 4)}</b><br><small>${r.jamStr || '–'}</small></td>
    <td class="acc"><b title="${esc(r.user)}">${esc(r.user || '–')}</b><span class="chip sm"><i style="background:${pColor(r.platform)}"></i>${esc(r.platform)}</span></td>
    <td class="cap"><div class="txt">${esc(r.text)}</div>${r.text.length > 220 ? '<button class="more">Selengkapnya</button>' : ''}</td>
    <td><span class="badge ${r.sent}">${r.sent[0].toUpperCase() + r.sent.slice(1)}</span>${r.resmi ? '<br><small>akun resmi</small>' : ''}</td>
    <td class="r">${fmt(r.eng)}<br><small>likes+komen+share</small></td>
    <td class="c">${r.link ? `<a class="lnk" href="${esc(r.link)}" target="_blank" rel="noopener" title="Buka link" aria-label="Buka link">↗</a>` : '–'}</td>
  </tr>`).join('') || '<tr><td colspan="6" class="empty">Tidak ada data yang cocok</td></tr>';
  const btn = (p, l, dis) => `<button data-p="${p}" ${dis ? 'disabled' : ''} class="${p === raw.page ? 'on' : ''}">${l}</button>`;
  const nums = [...new Set([1, raw.page - 1, raw.page, raw.page + 1, pages])].filter(p => p >= 1 && p <= pages).sort((a, b) => a - b);
  let out = btn(raw.page - 1, '‹', raw.page === 1), prev = 0;
  nums.forEach(p => { if (p - prev > 1) out += '<span>…</span>'; out += btn(p, p); prev = p; });
  $('rawPager').innerHTML = out + btn(raw.page + 1, '›', raw.page === pages);
}
let qT; $('rawQ').oninput = e => { clearTimeout(qT); qT = setTimeout(() => { raw.q = e.target.value; raw.page = 1; renderRaw(); }, 250); };
$('rawSent').onclick = e => { const b = e.target.closest('button'); if (!b) return; raw.sent = b.dataset.v; raw.page = 1; [...$('rawSent').children].forEach(x => x.classList.toggle('on', x === b)); renderRaw(); };
$('rawPf').onchange = e => { raw.pf = e.target.value; raw.page = 1; renderRaw(); };
document.querySelectorAll('th.sortable').forEach(th => th.onclick = () => { const s = th.dataset.sort; raw.dir = raw.sort === s ? -raw.dir : -1; raw.sort = s; raw.page = 1; renderRaw(); });
$('rawPager').onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; raw.page = +b.dataset.p; renderRaw(); document.querySelector('.raw-wrap').scrollTop = 0; };
// buka / tutup caption panjang
$('rawBody').onclick = e => {
  const t = e.target.closest('.cap'); if (!t || !(e.target.closest('.more') || e.target.closest('.txt'))) return;
  const txt = t.querySelector('.txt'), more = t.querySelector('.more'); if (!more) return;
  txt.classList.toggle('open'); more.textContent = txt.classList.contains('open') ? 'Tutup' : 'Selengkapnya';
};

$('fGran').onchange = e => { state.gran = e.target.value; render(); };

/* ---------- SNA (Social Network Analysis) ---------- */
// Koneksi dibangun dari: (1) @mention di caption/komentar: penulis → akun yang disebut,
// (2) komentar: pengomentar → pemilik postingan (diambil dari link).
// Data: Post + Komentar platform terpilih, mengikuti date range. Toggle Post/Komentar/All tidak berlaku di tab ini.
const sna = { pf: 'X', color: 'sent', rank: 'in', cy: null, key: '', max: 150 };
// Pengaturan tata letak: angka lebih besar = jaringan lebih longgar
const SNA_LAYOUT = { name: 'cose', nodeRepulsion: () => 6000, idealEdgeLength: () => 45, edgeElasticity: () => 120, nodeOverlap: 10, gravity: 1.2, nestingFactor: 1.2, componentSpacing: 18, nodeDimensionsIncludeLabels: false, numIter: 2500, randomize: true, fit: true, padding: 30 };
const KOM_COLORS = ['#FFBE00', '#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#60a5fa', '#e879f9', '#2dd4bf', '#facc15'];
const ownerFromLink = (link, pf) => {
  const m = /^(x|twitter)$/i.test(pf) ? link.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/status/i) : link.match(/threads\.(?:com|net)\/@([A-Za-z0-9_.]+)/i);
  return m ? m[1] : '';
};
const mentionsOf = t => [...new Set((t.match(/@([A-Za-z0-9_.]{2,30})/g) || []).map(x => x.slice(1).replace(/\.+$/, '')))];

async function renderSNA() {
  $('snaLoad').hidden = false;
  let rows;
  try { const [p, k] = await Promise.all([load('post'), load('komentar')]); rows = p.concat(k); }
  catch (e) { $('snaLoad').hidden = true; $('snaEmpty').hidden = false; $('snaEmpty').textContent = 'Gagal memuat data'; return; }
  const { from, to } = state.range || {};
  rows = rows.filter(r => r.platform.toLowerCase() === sna.pf.toLowerCase() && (!from || (r.tgl >= from && r.tgl <= to)));

  // Bangun graf penuh (nama akun disamakan huruf kecil)
  const nodes = new Map(), edges = new Map();
  const node = u => { const id = u.toLowerCase(); if (!nodes.has(id)) nodes.set(id, { id, label: u, posts: 0, pos: 0, neg: 0, net: 0, din: 0, dout: 0, resmi: false }); return nodes.get(id); };
  const link = (a, b) => { if (!a || !b) return; const A = a.toLowerCase(), B = b.toLowerCase(); if (A === B) return; node(a); node(b);
    const k = A + '→' + B; edges.set(k, (edges.get(k) || 0) + 1); nodes.get(A).dout++; nodes.get(B).din++; };
  rows.forEach(r => {
    if (!r.user || /^(-|—|n\/?a)$/i.test(r.user)) return;
    const n = node(r.user); n.posts++; n[r.sent === 'positif' ? 'pos' : r.sent === 'negatif' ? 'neg' : 'net']++; if (r.resmi) n.resmi = true;
    mentionsOf(r.text).forEach(m => link(r.user, m));
    if (r.kind === 'komentar') link(r.user, ownerFromLink(r.link, sna.pf));
  });
  const totalNodes = [...nodes.values()].filter(n => n.din + n.dout > 0).length, totalEdges = edges.size;
  const totalInter = [...edges.values()].reduce((s, v) => s + v, 0);

  // Ambil akun paling terhubung supaya graf tetap terbaca
  const keep = new Set([...nodes.values()].filter(n => n.din + n.dout > 0).sort((a, b) => (b.din + b.dout) - (a.din + a.dout)).slice(0, sna.max).map(n => n.id));
  const E = [...edges].map(([k, w]) => { const [s, t] = k.split('→'); return { s, t, w }; }).filter(e => keep.has(e.s) && keep.has(e.t));
  // Buang pasangan/kelompok kecil yang terisolasi (< 3 akun) supaya grafik fokus pada percakapan yang benar-benar berjejaring
  { const par = new Map(); const f = x => { while (par.get(x) !== x) { par.set(x, par.get(par.get(x))); x = par.get(x); } return x; };
    E.forEach(e => { [e.s, e.t].forEach(v => par.has(v) || par.set(v, v)); par.set(f(e.s), f(e.t)); });
    const sz = {}; par.forEach((_, v) => { const r = f(v); sz[r] = (sz[r] || 0) + 1; });
    const big = E.filter(e => sz[f(e.s)] >= 3); if (big.length) E.splice(0, E.length, ...big); }
  const used = new Set(E.flatMap(e => [e.s, e.t]));
  const N = [...nodes.values()].filter(n => used.has(n.id));

  // Komunitas sederhana (label propagation)
  const adj = new Map(N.map(n => [n.id, []]));
  E.forEach(e => { adj.get(e.s).push([e.t, e.w]); adj.get(e.t).push([e.s, e.w]); });
  const lab = new Map(N.map(n => [n.id, n.id]));
  for (let it = 0; it < 15; it++) {
    let changed = false;
    N.slice().sort(() => Math.random() - .5).forEach(n => {
      const c = {}; adj.get(n.id).forEach(([m, w]) => { const l = lab.get(m); c[l] = (c[l] || 0) + w; });
      const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; if (best && best[0] !== lab.get(n.id)) { lab.set(n.id, best[0]); changed = true; }
    });
    if (!changed) break;
  }
  const komSize = {}; lab.forEach(l => komSize[l] = (komSize[l] || 0) + 1);
  const komRank = Object.entries(komSize).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const komIdx = l => { const i = komRank.indexOf(l); return i < KOM_COLORS.length ? i : -1; };

  const sentOf = n => n.posts === 0 ? 'unk' : (n.neg > n.pos && n.neg >= n.net) ? 'negatif' : (n.pos > n.neg && n.pos >= n.net) ? 'positif' : 'netral';
  const maxDeg = Math.max(1, ...N.map(n => n.din + n.dout));
  const labelMin = N.map(n => n.din + n.dout).sort((a, b) => b - a)[Math.min(($('snaGraph').clientWidth < 640 ? 10 : 30) - 1, N.length - 1)] || 0; // label hanya akun teratas (10 di HP, 30 di desktop)
  const colorOf = n => sna.color === 'kom' ? (komIdx(lab.get(n.id)) >= 0 ? KOM_COLORS[komIdx(lab.get(n.id))] : '#6b7280')
    : ({ positif: SENT.positif, negatif: SENT.negatif, netral: SENT.netral, unk: '#6b7280' })[sentOf(n)];

  // Statistik
  const dens = N.length > 1 ? (E.length / (N.length * (N.length - 1)) * 100) : 0;
  $('snaStats').innerHTML = [['Akun', fmt(totalNodes)], ['Koneksi', fmt(totalEdges)], ['Interaksi', fmt(totalInter)], ['Lingkaran obrolan', fmt(komRank.filter(l => komSize[l] > 2).length)]]
    .map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('') + `<p class="hint">Grafik menampilkan ${fmt(N.length)} akun yang paling banyak berinteraksi</p>`;
  // Penjelasan deskriptif ringkasan jaringan
  const nKom = komRank.filter(l => komSize[l] > 2).length;
  const avgConn = totalNodes ? totalEdges * 2 / totalNodes : 0, avgInt = totalEdges ? totalInter / totalEdges : 0;
  const per = state.range ? (state.range.from === state.range.to ? tglLabel(state.range.from) : `${tglLabel(state.range.from)} – ${tglLabel(state.range.to)}`) : 'periode ini';
  const f1 = x => x.toFixed(1).replace('.', ',');
  const topIn = [...nodes.values()].filter(n => n.din > 0).sort((a, b) => b.din - a.din).slice(0, 3);
  const top3Share = totalInter ? topIn.reduce((s, n) => s + n.din, 0) / totalInter * 100 : 0;
  const bigGroup = komRank[0], bigHub = N.filter(n => lab.get(n.id) === bigGroup).sort((a, b) => (b.din + b.dout) - (a.din + a.dout))[0];
  const at = n => `<b>@${esc(n.label)}</b>`;
  $('snaExplain').innerHTML = !totalInter ? '<p>Belum ada akun yang saling menyebut atau berkomentar di platform dan tanggal ini, jadi belum ada jaringan yang bisa dibaca.</p>' : `
    <div class="ex"><h4>Seberapa ramai?</h4><p>Pada <b>${per}</b>, ada <b>${fmt(totalNodes)} akun</b> ${sna.pf} yang ikut membicarakan karhutla sambil menyebut (@) atau membalas akun lain. Totalnya <b>${fmt(totalInter)} kali</b> saling sebut atau balas.</p></div>
    <div class="ex"><h4>Siapa yang paling banyak dituju?</h4><p>${topIn.map(at).join(', ')}. Sekitar <b>${Math.round(top3Share)} dari setiap 100</b> sebutan dan balasan mengarah ke tiga akun ini. ${top3Share >= 25 ? 'Artinya, percakapan banyak <b>bertumpu pada akun-akun tersebut</b>: orang datang untuk menyapa, bertanya, atau mengeluh ke sana.' : 'Artinya, perhatian orang <b>tersebar</b> ke banyak akun, tidak tertuju pada beberapa akun saja.'}</p></div>
    <div class="ex"><h4>Apakah orang saling ngobrol?</h4><p>Rata-rata satu akun berinteraksi dengan <b>${f1(avgConn)} akun lain</b>. ${avgConn < 3 ? 'Jadi kebanyakan orang hanya menyebut satu-dua akun (biasanya akun besar seperti di atas) lalu selesai. <b>Jarang terjadi diskusi panjang</b> antar-pengguna.' : 'Jadi cukup banyak orang yang <b>saling membalas dan berdiskusi</b>, tidak hanya menyebut satu akun lalu selesai.'}</p></div>
    <div class="ex"><h4>Bagaimana nada percakapannya?</h4><p>${(() => { const au = [...nodes.values()].filter(n => n.posts > 0), ng = au.filter(n => sentOf(n) === 'negatif').length, ps = au.filter(n => sentOf(n) === 'positif').length;
      return au.length ? `Dari <b>${fmt(au.length)} akun</b> yang ikut menulis, sekitar <b>${Math.round(ng / au.length * 100)} dari 100</b> akun nadanya cenderung negatif (mengeluh, kecewa, atau mengkritik) dan <b>${Math.round(ps / au.length * 100)} dari 100</b> cenderung positif (memuji atau mendukung). Sisanya netral, misalnya hanya bertanya atau berbagi info. ${ng > ps ? 'Artinya, di jaringan ini <b>suara keluhan lebih banyak</b> daripada suara dukungan.' : 'Artinya, <b>suara dukungan masih seimbang atau lebih banyak</b> daripada keluhan.'}` : 'Belum ada tulisan yang bisa dinilai nadanya.'; })()}</p></div>
    <div class="ex"><h4>Siapa yang paling rajin menyebut akun lain?</h4><p>${(() => { const ao = [...nodes.values()].filter(n => n.dout > 0).sort((a, b) => b.dout - a.dout).slice(0, 3);
      return ao.length ? `${ao.map(n => `${at(n)} (${fmt(n.dout)}×)`).join(', ')}. Akun-akun ini paling sering menyapa atau menandai akun lain. Bisa jadi mereka pelanggan yang mengeluh berulang kali, akun yang sedang mengampanyekan sesuatu, atau akun penyebar informasi. Klik namanya di grafik untuk melihat isinya.` : '-'; })()}</p></div>
    <div class="ex"><h4>Ada berapa "lingkaran obrolan"?</h4><p>Lingkaran obrolan adalah sekumpulan akun yang lebih sering bicara satu sama lain, seperti grup tongkrongan. Di sini ada <b>${fmt(nKom)}</b> lingkaran${bigHub ? `; yang terbesar berkumpul di sekitar ${at(bigHub)}` : ''}. ${nKom <= 1 ? 'Satu lingkaran saja berarti hampir semua orang membicarakan hal yang sama di tempat yang sama.' : 'Beberapa lingkaran biasanya berarti ada beberapa topik atau kubu yang berbeda. Pilih <b>Warna: Komunitas</b> untuk melihatnya di grafik.'}</p></div>`;
  $('snaReadHint').textContent = `${sna.pf} · ${per}`;
  $('snaHint').textContent = `${sna.pf} · ${state.range ? (state.range.from === state.range.to ? tglLabel(state.range.from) : tglLabel(state.range.from) + ' – ' + tglLabel(state.range.to)) : ''} · Post + Komentar`;
  $('snaList').innerHTML = N.map(n => `<option value="${esc(n.label)}">`).join('');

  // Peringkat
  const rankList = () => {
    const k = sna.rank === 'in' ? 'din' : 'dout', top = [...nodes.values()].filter(n => n[k] > 0).sort((a, b) => b[k] - a[k]).slice(0, 10), mx = top[0]?.[k] || 1;
    $('snaTop').innerHTML = top.map((n, i) => `<li data-id="${esc(n.id)}" class="clickable"><span class="rank">${i + 1}</span><div class="acc-main"><div class="acc-top"><b>${esc(n.label)}</b><span class="acc-n" style="color:var(--accent)">${fmt(n[k])}×</span></div>
      <div class="acc-bar"><i style="width:${n[k] / mx * 100}%;background:var(--accent)"></i></div></div></li>`).join('') || '<li class="empty">Belum ada data</li>';
  };
  rankList(); sna.rankList = rankList;

  // Legenda
  $('snaLegend').innerHTML = sna.color === 'sent'
    ? [['Positif', SENT.positif], ['Negatif', SENT.negatif], ['Netral', SENT.netral], ['Hanya disebut', '#6b7280']].map(([l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join('') + '<span class="lg-note">Ukuran = jumlah koneksi</span>'
    : komRank.slice(0, 6).map((l, i) => `<span><i style="background:${KOM_COLORS[i]}"></i>${esc(nodes.get(l)?.label || l)} (${komSize[l]})</span>`).join('') + '<span class="lg-note">Komunitas dinamai dari salah satu anggotanya</span>';

  $('snaEmpty').hidden = N.length > 0; $('snaEmpty').textContent = 'Tidak ada interaksi pada rentang ini';
  const key = sna.pf + JSON.stringify(state.range) + N.length + E.length;
  const els = [
    ...N.map(n => ({ data: { id: n.id, label: n.label, big: (n.din + n.dout) >= labelMin, size: 9 + Math.sqrt((n.din + n.dout) / maxDeg) * 22, color: colorOf(n), deg: n.din + n.dout } })),
    ...E.map(e => ({ data: { id: e.s + '→' + e.t, source: e.s, target: e.t, w: Math.min(6, 0.6 + Math.log2(e.w + 1)) } }))
  ];
  sna.nodes = nodes; sna.edgesAll = edges; sna.lab = lab;

  /* Insight otomatis: menerjemahkan grafik ke bahasa sehari-hari */
  const all = [...nodes.values()];
  const nm = n => `<b>${esc(n.label)}</b>`;
  const byIn = all.filter(n => n.din > 0).sort((a, b) => b.din - a.din), byOut = all.filter(n => n.dout > 0).sort((a, b) => b.dout - a.dout);
  const top3In = byIn.slice(0, 3).reduce((s, n) => s + n.din, 0), shareTop3 = totalInter ? top3In / totalInter * 100 : 0;
  const authors = all.filter(n => n.posts > 0), negA = authors.filter(n => sentOf(n) === 'negatif'), posA = authors.filter(n => sentOf(n) === 'positif');
  const resmiIds = new Set(all.filter(n => n.resmi || AKUN_RESMI.includes(n.id)).map(n => n.id));
  let toResmi = 0, negToResmi = new Set();
  edges.forEach((w, k) => { const [s, t] = k.split('→'); if (resmiIds.has(t)) { toResmi += w; if (nodes.get(s) && sentOf(nodes.get(s)) === 'negatif') negToResmi.add(s); } });
  const bigKom = komRank.filter(l => komSize[l] > 2);
  const komHub = l => N.filter(n => lab.get(n.id) === l).sort((a, b) => (b.din + b.dout) - (a.din + a.dout))[0];
  const ins = [];
  if (!totalInter) ins.push(['ℹ️', 'Belum ada interaksi antar-akun pada rentang dan platform ini.']);
  else {
    if (toResmi) ins.push(['🏦', `<b>${pct(toResmi, totalInter)}</b> sebutan dan balasan ditujukan ke akun resmi pemerintah/lembaga, dan <b>${fmt(negToResmi.size)}</b> akun bernada negatif ikut menyebut akun tersebut. Akun resmi menjadi tujuan utama kritik dan desakan publik, jadi kecepatan informasi dan klarifikasi di sana sangat menentukan.`]);
    const negLoud = negA.slice().sort((a, b) => (b.dout + b.din) - (a.dout + a.din)).slice(0, 3);
    if (negLoud.length) ins.push(['👀', `Akun bernada negatif yang paling banyak berinteraksi: ${negLoud.map(nm).join(', ')}. Layak dipantau dan, bila perlu, dihubungi langsung sebelum keluhannya menyebar.`]);
    const nonResmi = byIn.filter(n => !resmiIds.has(n.id)).slice(0, 3);
    if (nonResmi.length) ins.push(['📌', `Akun non-resmi yang paling sering dituju orang: ${nonResmi.map(nm).join(', ')}. Akun seperti ini (misalnya media, influencer, atau brand lain) ikut membentuk opini publik, jadi perlu dipantau apa yang mereka sampaikan tentang karhutla.`]);
    if (negA.length > posA.length) ins.push(['⚖️', `Suara keluhan lebih banyak daripada suara dukungan (${pct(negA.length, authors.length)} vs ${pct(posA.length, authors.length)} akun). Konten positif dan klarifikasi perlu diperkuat di ${sna.pf}.`]);
  }
  $('snaInsight').innerHTML = ins.map(([i, t]) => `<li><span class="ii">${i}</span><span>${t}</span></li>`).join('');
  const ink = css('--ink'), line = css('--line'), bg = css('--card');
  if (sna.cy && sna.key === key) { // hanya ganti warna
    sna.cy.batch(() => N.forEach(n => sna.cy.getElementById(n.id).data('color', colorOf(n))));
    $('snaLoad').hidden = true; return;
  }
  sna.key = key; sna.cy?.destroy();
  sna.cy = cytoscape({
    container: $('snaGraph'), elements: els, minZoom: .1, maxZoom: 4, wheelSensitivity: .25,
    style: [
      { selector: 'node', style: { 'background-color': 'data(color)', width: 'data(size)', height: 'data(size)', label: 'data(label)', color: ink, 'font-size': 10, 'font-family': 'Plus Jakarta Sans, sans-serif', 'text-valign': 'bottom', 'text-margin-y': 4, 'text-outline-color': bg, 'text-outline-width': 2, 'min-zoomed-font-size': 7, 'text-wrap': 'ellipsis', 'text-max-width': 110, 'border-width': 1.5, 'border-color': bg } },
      { selector: 'node[!big]', style: { label: '' } },
      { selector: 'node.lbl', style: { label: 'data(label)' } },
      { selector: 'edge', style: { width: 1.2, 'line-color': css('--mute'), 'curve-style': 'bezier', opacity: .8, 'target-arrow-shape': 'triangle', 'target-arrow-color': css('--mute'), 'arrow-scale': .6 } },
      { selector: '.faded', style: { opacity: .12 } },
      { selector: 'node.hl', style: { label: 'data(label)', 'border-color': css('--accent'), 'border-width': 3, 'z-index': 10 } },
      { selector: 'edge.hl', style: { 'line-color': css('--accent'), opacity: 1, 'z-index': 9 } }
    ],
    layout: { ...SNA_LAYOUT, animate: false }
  });
  const showZoom = () => $('zLvl').textContent = Math.round(sna.cy.zoom() * 100) + '%';
  // Zoom semantik: ukuran titik, teks, dan garis tetap kurang lebih sama di layar,
  // jadi saat zoom in jarak antar titik terlihat makin longgar.
  let raf = 0;
  // Ukuran di layar dibuat tetap (px) apa pun level zoom-nya: titik, nama akun, dan garis selalu terbaca
  const scaleEls = () => { raf = 0; const z = sna.cy.zoom(), m = Math.min(1, Math.max(.55, $('snaGraph').clientWidth / 900)), k = m / Math.max(z, .05);
    sna.cy.batch(() => {
      sna.cy.nodes().toggleClass('lbl', z > 1.1);
      sna.cy.nodes().forEach(n => { const s = n.data('size') * k; n.style({ width: s, height: s, 'font-size': 11 * k / m * Math.max(m, .85), 'text-outline-width': 2.5 * k, 'border-width': 1.5 * k, 'text-margin-y': 3 * k }); });
      sna.cy.edges().forEach(e => e.style({ width: Math.max(1.2, e.data('w')) * k, 'arrow-scale': .7 }));
    }); };
  sna.fitAll = () => { if (!sna.cy) return; sna.cy.resize(); sna.cy.fit(undefined, 30); };
  sna.cy.on('zoom', () => { showZoom(); if (!raf) raf = requestAnimationFrame(scaleEls); });
  sna.fitAll(); showZoom(); scaleEls();
  sna.cy.on('tap', 'node', e => focusNode(e.target.id()));
  sna.cy.on('tap', e => { if (e.target === sna.cy) clearFocus(); });
  $('snaLoad').hidden = true; $('snaDetailCard').hidden = true;
}
function clearFocus() { sna.cy?.elements().removeClass('faded hl'); $('snaDetailCard').hidden = true; }
function focusNode(id) {
  const n = sna.nodes?.get(id); if (!n) return;
  if (sna.cy) {
    const el = sna.cy.getElementById(id);
    if (el.length) {
      const hood = el.closedNeighborhood();
      sna.cy.elements().addClass('faded').removeClass('hl'); hood.removeClass('faded').addClass('hl');
      sna.cy.animate({ fit: { eles: hood, padding: 60 } }, { duration: 400 });
    }
  }
  const conn = {}; sna.edgesAll.forEach((w, k) => { const [s, t] = k.split('→'); if (s === id) conn[t] = (conn[t] || 0) + w; if (t === id) conn[s] = (conn[s] || 0) + w; });
  const top = Object.entries(conn).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const url = /^(x|twitter)$/i.test(sna.pf) ? `https://x.com/${encodeURIComponent(n.label)}` : `https://www.threads.com/@${encodeURIComponent(n.label)}`;
  const t = n.posts || 1;
  $('snaDetail').innerHTML = `<div class="sd-h"><span class="av" style="background:${pColor(sna.pf)}22;color:${pColor(sna.pf)}">${esc(n.label[0].toUpperCase())}</span>
    <div><b>${esc(n.label)}</b>${n.resmi ? ' <span class="chip sm">akun resmi</span>' : ''}<br><a href="${url}" target="_blank" rel="noopener">Buka profil ↗</a></div></div>
    <div class="sna-stats sm"><div><small>Disebut</small><b>${fmt(n.din)}</b></div><div><small>Menyebut</small><b>${fmt(n.dout)}</b></div><div><small>Post/komentar</small><b>${fmt(n.posts)}</b></div></div>
    ${n.posts ? `<div class="ks-bar" style="margin:12px 0 4px"><i style="width:${n.neg / t * 100}%;background:${SENT.negatif}"></i><i style="width:${n.net / t * 100}%;background:${SENT.netral}"></i><i style="width:${n.pos / t * 100}%;background:${SENT.positif}"></i></div>
    <small class="hint">${n.neg} negatif · ${n.net} netral · ${n.pos} positif</small>` : '<small class="hint">Akun ini hanya disebut, tidak ada post/komentar darinya di data.</small>'}
    <h3 class="sub">Koneksi teratas</h3><ul class="sd-conn">${top.map(([m, w]) => `<li data-id="${esc(m)}" class="clickable"><span>${esc(sna.nodes.get(m)?.label || m)}</span><b>${w}×</b></li>`).join('')}</ul>`;
  $('snaDetailCard').hidden = false;
}
// Kontrol
const zoomBy = f => { const cy = sna.cy; if (!cy) return; cy.animate({ zoom: { level: Math.max(cy.minZoom(), Math.min(cy.maxZoom(), cy.zoom() * f)), renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } } }, { duration: 200 }); };
$('zIn').onclick = () => zoomBy(1.3); $('zOut').onclick = () => zoomBy(1 / 1.3);
$('zFit').onclick = () => sna.cy?.animate({ fit: { padding: 30 } }, { duration: 300 });
$('zRe').onclick = () => sna.cy?.layout({ ...SNA_LAYOUT, animate: true, animationDuration: 700 }).run();
const segOn = (id, fn) => $(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; [...$(id).children].forEach(x => x.classList.toggle('on', x === b)); fn(b.dataset.v); };
segOn('snaPf', v => { sna.pf = v; renderSNA(); });
segOn('snaColor', v => { sna.color = v; renderSNA(); });
segOn('snaMax', v => { sna.max = +v; sna.key = ''; renderSNA(); });
segOn('snaRank', v => { sna.rank = v; sna.rankList?.(); });
$('snaTop').onclick = e => { const li = e.target.closest('li[data-id]'); if (li) focusNode(li.dataset.id); };
$('snaDetail').onclick = e => { const li = e.target.closest('li[data-id]'); if (li) focusNode(li.dataset.id); };
$('snaClose').onclick = clearFocus;
$('snaQ').onchange = e => { const id = e.target.value.trim().toLowerCase(); if (sna.nodes?.has(id)) focusNode(id); };

let snaRT; addEventListener('resize', () => { clearTimeout(snaRT); snaRT = setTimeout(() => { if (!$('viewSna').hidden) sna.fitAll?.(); }, 200); });
