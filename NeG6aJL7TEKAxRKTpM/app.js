/* ===== PENGATURAN ===== */
const SHEET_ID = "12BRmeOf5no04WlzBuokYGDkqMUivziw3dCLE6lcSz8M";
const TABS = { post: "Post", komentar: "Komentar" };
const RISK = { tinggi: 35, sedang: 20 };          // ambang % negatif
const REFRESH_MENIT = 5;
// Akun resmi Mandiri: sentimennya selalu dihitung Netral.
// Otomatis: baris dengan Tipe "Akun Resmi". Tambahan: username di daftar ini (huruf besar/kecil diabaikan).
const AKUN_RESMI = ['bankmandiri', 'bank mandiri', 'mandiricard', 'mandiricare', 'mandiri kartu kredit', 'livinpoin', 'mandiritaspen', 'bank mandiri taspen', 'mandiri update', 'wrausahamandiri', 'officialbankmandiri'];
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
  if (src === 'all') { const [p, k] = await Promise.all([load('post'), load('komentar')]); return cache.all = p.concat(k); }
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(TABS[src])}&_=${Date.now()}`;
  const txt = await fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
  const rows = Papa.parse(txt, { header: true, skipEmptyLines: true }).data;
  return cache[src] = rows.map(r => norm(r, src)).filter(r => r.tgl && r.sent);
}
// Tanggal: "dd/mm/yyyy", serial angka, atau "yyyy-mm-dd". Jam: "HH:MM" atau pecahan hari.
function norm(r, kind) {
  const t = r['Waktu'] || ''; let tgl = '';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(t)) { const [d, m, y] = t.split(/[\/ ]/); tgl = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; }
  else if (/^\d+([.,]\d+)?$/.test(t)) tgl = new Date(Date.UTC(1899, 11, 30) + parseFloat(t.replace(',', '.')) * 864e5).toISOString().slice(0, 10);
  else if (/^\d{4}-\d{2}-\d{2}/.test(t)) tgl = t.slice(0, 10);
  const j = r['Jam'] || ''; let jam = NaN;
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
    text: r['Caption'] || r['Text Komentar'] || '',
    topik: (r['Topik (tanpa label buzzer)'] || r['Topik'] || 'Lainnya').trim(),
    sent: !s ? '' : resmi ? 'netral' : s.startsWith('pos') ? 'positif' : s.startsWith('neg') ? 'negatif' : 'netral', resmi,
    link: r['Link'] || '', jamStr, media: /^media$/i.test((r['Tipe'] || '').trim()) && !HOMELESS_MEDIA.includes(user.toLowerCase()), eng: parseInt(r['Jumlah Komentar'] || r['Jumlah Likes'] || 0) || 0, kind
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
  const days = dates.filter(inRange);
  buildPicker(dates, from, to);



  const single = from === to, isAll = from <= minD && to >= maxD, D = all.filter(r => inRange(r.tgl));
  $('loading').hidden = true; $('main').hidden = false;
  state.rawD = D; state.rawUnitPost = state.src; renderRaw(true); document.querySelector('.raw-wrap').scrollTop = 0;

  const periode = single ? tglLabel(from) : `${tglLabel(from)} – ${tglLabel(to)}`;
  const unit = { post: 'post', komentar: 'komentar', all: 'mention' }[state.src];
  $('periode').textContent = `Percakapan media sosial terkait Bank Mandiri · ${periode} · ${unit}`;

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
    <div class="meta"><span>💬 ${fmt(p.eng)} ${p.kind === 'post' ? 'komentar' : 'likes'} · ${tglShort(p.tgl)}</span>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Lihat ↗</a>` : ''}</div></div>`).join('') || '<p>Tidak ada postingan negatif.</p>';

  /* Word cloud */
  const STOP = new Set('yang dan di ke dari ini itu untuk dengan pada juga ada tidak bisa sudah akan atau aja saja kita kami saya aku gue gw lu kamu dia mereka nya ya ga gak nggak enggak tapi karena jadi lagi mau buat sama oleh dalam bank mandiri bankmandiri bmri the https http www com co id dll yg dgn utk sih kok deh dong lah kan pun para seperti lebih bagi masih hanya kalau kalo tak telah agar semua baru banyak pak bu min admin mohon terima kasih halo sahabat apa siapa udah udh sdh tdk gimana bagaimana akibat belum dapat hari jangan kena usai terlihat milik khusus berbeda kapan setelah sedang hingga sampai menjadi tersebut karna emang memang banget sangat orang'.split(' '));
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
  $('impact').textContent = negTop.length ? `${t3} dari ${N.length} mention negatif (${pct(t3, N.length)}) berasal dari 3 topik teratas. Dampak: reputasi, kepercayaan nasabah, dan sentimen investor.` : '';

  /* Rekomendasi (template otomatis) */
  const negPf = negK[0]?.[0] || 'kanal utama';
  const reco = {
    'Jangka Pendek': [...negTop.slice(0, 3).map(x => `Holding statement & klarifikasi isu "${x[0]}"`), `Perkuat respons akun resmi di ${negPf}`],
    'Jangka Menengah': ['Susun FAQ untuk pertanyaan berulang', 'Koordinasi dengan unit terkait untuk penyelesaian isu', 'Laporan monitoring harian ke manajemen'],
    'Jangka Panjang': [`Dorong konten positif: ${count(P, 'topik')[0]?.[0] || 'kinerja'}`, 'Libatkan media & komunitas untuk narasi penyeimbang', 'Evaluasi tren NSI mingguan']
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
  setThemeIcon(); render();
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
  $('viewDash').hidden = b.dataset.tab !== 'dash'; $('viewRaw').hidden = b.dataset.tab !== 'raw';
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
  const engHead = state.src === 'post' ? 'Komentar' : state.src === 'komentar' ? 'Likes' : 'Komentar / Likes';
  document.querySelector('th[data-sort=eng]').firstChild.textContent = engHead + ' ';
  document.querySelectorAll('th.sortable i').forEach(i => i.textContent = i.parentNode.dataset.sort === raw.sort ? (raw.dir < 0 ? '▼' : '▲') : '');
  $('rawCount').textContent = rows.length ? `${fmt(start + 1)}–${fmt(start + view.length)} dari ${fmt(rows.length)} baris` : '0 baris';
  $('rawBody').innerHTML = view.map(r => `<tr>
    <td class="nw"><b>${tglShort(r.tgl)} ${r.tgl.slice(0, 4)}</b><br><small>${r.jamStr || '–'}</small></td>
    <td class="acc"><b title="${esc(r.user)}">${esc(r.user || '–')}</b><span class="chip sm"><i style="background:${pColor(r.platform)}"></i>${esc(r.platform)}</span></td>
    <td class="cap"><div class="txt">${esc(r.text)}</div>${r.text.length > 220 ? '<button class="more">Selengkapnya</button>' : ''}</td>
    <td><span class="badge ${r.sent}">${r.sent[0].toUpperCase() + r.sent.slice(1)}</span>${r.resmi ? '<br><small>akun resmi</small>' : ''}</td>
    <td class="r">${fmt(r.eng)}<br><small>${r.kind === 'post' ? 'komentar' : 'likes'}</small></td>
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
