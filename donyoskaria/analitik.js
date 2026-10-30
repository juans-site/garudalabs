/* ===== Tab Analitik ===== */
(() => {
  const { ic,pfIco,esc,f,k,pc,tg,tgY,TEAL,AMBER,ORANGE,RED,GREY,NONE,cnt,akun,delta,dChip,data,barsSvg,linesSvg,heat } = window.G;
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
    const wc = {}, ws = {}; D.forEach(r => new Set(r.text.toLowerCase().replace(/https?:\S+|[@#]\S+/g, ' ').split(/[^a-z0-9]+/)).forEach(w => { if (w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)) { wc[w] = (wc[w] || 0) + 1; const s = ws[w] || (ws[w] = { n: 0, p: 0, z: 0 }); r.sent === 'negatif' ? s.n++ : r.sent === 'positif' ? s.p++ : s.z++; } }));
    const tags = {}, tagS = {}; D.forEach(r => new Set((r.text.match(/#[\p{L}\d_]+/gu) || []).map(t => t.toLowerCase())).forEach(t => { tags[t] = (tags[t] || 0) + 1; const s = tagS[t] || (tagS[t] = { n: 0, p: 0, z: 0 }); r.sent === 'negatif' ? s.n++ : r.sent === 'positif' ? s.p++ : s.z++; }));
    const tag5 = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const words = Object.entries(wc).sort((a, b) => b[1] - a[1]).slice(0, 45), wMax = words[0]?.[1] || 1;
    
    const sCol = s => { const t = s.n + s.p + s.z || 1, nr = s.n / t, pr = s.p / t; return nr >= .5 ? RED : pr >= .5 ? TEAL : nr > pr ? ORANGE : pr > nr ? '#7FD8CE' : GREY; };
    const cmpRows = isl.map(([kk, v]) => { const R = D.filter(r => r.lokasi === kk), n = R.filter(r => r.sent === 'negatif').length; return { kk, v, n, np: n / v * 100, d: delta(islL[kk] || 0, islP[kk] || 0) }; })
      .sort((a, b) => cmpMode === 'neg' ? b.np - a.np : cmpMode === 'grow' ? (b.d ?? -1e9) - (a.d ?? -1e9) : b.v - a.v);
    const rel = (x, y) => y ? Math.round((x - y) / y * 100) : null, sh = (b, kk) => b.t ? b[kk] / b.t : 0;
    const negD = Ps.t ? rel(sh(Ls, 'n'), sh(Ps, 'n')) : null, posD = Ps.t ? rel(sh(Ls, 'p'), sh(Ps, 'p')) : null, netD = Ps.t ? rel(sh(Ls, 'z'), sh(Ps, 'z')) : null;

    root.innerHTML = `
      <div class="g-hero">
        <div><div class="g-eyebrow">Analytics</div><h1 class="g-title"><b>Karhutla</b> <span>Indonesia</span></h1>
          <p class="g-sub">Analisis mendalam percakapan media sosial untuk memahami tren, isu, sentimen, dan sebaran wilayah.</p></div>
        <div class="g-kpis" title="Perubahan (%) dibanding periode sebelumnya dengan jumlah hari yang sama">
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('chat', 22)}</span><div><b>${f(S.t)}</b><small>Total postingan</small></div>${dChip(delta(Ls.t, Ps.t), false)}</div>
          <div class="g-kpi" style="--c:${RED}"><span class="gi">${ic('frown', 22)}</span><div><b>${pc(S.n, S.t)}</b><small>Sentimen negatif</small></div>${dChip(negD, true)}</div>
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('pin', 22)}</span><div><b>${isl.length}<small style="font-size:13px"> / 7</small></b><small>Pulau disebut</small></div></div>
          <div class="g-kpi" style="--c:${ORANGE}"><span class="gi">${ic('alert', 22)}</span><div><b>${f(S.n)}</b><small>Postingan negatif</small></div>${dChip(delta(Ls.n, Ps.n), true)}</div>
        </div>
      </div>
      <div class="g-grid3">
        <div class="g-card"><div class="g-h"><h3>Tren Percakapan & Sentimen</h3><span class="g-tag">Harian</span></div><div class="g-cv"><canvas id="gcTrend"></canvas></div></div>
        <div class="g-card"><div class="g-h"><h3>Distribusi Sentimen</h3><span class="g-tag">Δ periode sebelumnya</span></div>
          <div class="g-donut"><div style="position:relative;height:150px"><canvas id="gcDonut"></canvas></div>
            <div class="g-legend"><div><span class="g-dot" style="background:${RED}"></span>Negatif <b>${pc(S.n, S.t)} ${dChip(negD, true)}</b></div><div><span class="g-dot" style="background:${GREY}"></span>Netral <b>${pc(S.z, S.t)} ${dChip(netD, false)}</b></div><div><span class="g-dot" style="background:${TEAL}"></span>Positif <b>${pc(S.p, S.t)} ${dChip(posD, false)}</b></div></div></div>
          <div class="g-card" style="margin-top:14px;padding:12px 14px;background:var(--card2)"><div class="g-h" style="margin-bottom:6px"><h3 style="font-size:13.5px!important">Volume Percakapan</h3><span class="g-tag hot">Puncak ${peak[0] ? tg(peak[0].d) : '-'}</span></div>
            <div class="g-vol"><div><span class="big">${f(avgDay)}</span><small>rata-rata harian</small></div><div style="width:160px">${barsSvg(perDay.map(x => x.t), 160, 54, t => heat(t))}</div></div></div></div>
        <div class="g-card"><div class="g-h"><h3>Top Isu Dominan</h3><span class="g-tag">Semua sumber</span></div>
          <ol class="g-list" style="gap:14px">${topics.slice(0, 6).map(([kk, v], i) => `<li style="grid-template-columns:22px minmax(0,1fr) 70px 44px"><span class="n">${i + 1}</span><span class="t" title="${esc(kk)}">${esc(kk)}<small style="display:block;color:var(--mute);font-size:11px">${f(v)} postingan ${dChip(delta(topicsL[kk] || 0, topicsP[kk] || 0), true)}</small></span><span class="bar"><i style="width:${v / topics[0][1] * 100}%;background:${i < 1 ? RED : i < 3 ? ORANGE : AMBER}"></i></span><span class="p" style="color:${i < 1 ? RED : 'var(--ink)'}">${pc(v, S.t, 0)}</span></li>`).join('')}</ol></div>
      </div>
      <div class="g-grid3">
        <div class="g-card"><div class="g-h"><h3>Perbandingan Antar Pulau</h3></div>
          <div class="g-sub-tabs">${[['vol', 'Volume'], ['neg', 'Sentimen negatif'], ['grow', 'Pertumbuhan']].map(([v, l]) => `<button type="button" data-cmp="${v}" class="${cmpMode === v ? 'on' : ''}">${l}</button>`).join('')}</div>
          <div class="g-cmp"><div class="lokmap"></div>
            <table class="g-tbl"><thead><tr><th></th><th>Pulau</th><th class="r">Volume</th><th class="r">Negatif</th><th class="r">Δ</th></tr></thead><tbody>
            ${cmpRows.map((r, i) => `<tr><td class="n">${i + 1}</td><td>${esc(r.kk)}</td><td class="r">${f(r.v)}</td><td class="r" style="color:${r.np >= 60 ? RED : r.np >= 45 ? AMBER : 'var(--ink)'}">${pc(r.np, 100, 0)}</td><td class="r">${dChip(r.d, true) || '–'}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="g-card"><div class="g-h"><h3>Sumber Percakapan</h3><span class="g-tag">Semua</span></div>
          <ol class="g-list g-src" style="gap:16px">${plat.map(([kk, v]) => { const R = D.filter(r => r.platform === kk), n = R.filter(r => r.sent === 'negatif').length;
            return `<li>${pfIco(kk)}<span class="t">${esc(kk)}<small style="display:block;color:var(--mute);font-size:11px">${f(v)} postingan · ${pc(n, v, 0)} negatif</small></span><span class="bar"><i style="width:${v / plat[0][1] * 100}%;background:linear-gradient(90deg,#2FB3A6,${TEAL})"></i></span><span class="p">${pc(v, S.t, 0)}</span></li>`; }).join('')}</ol></div>
        <div class="g-card"><div class="g-h"><h3>Puncak Percakapan</h3><span class="g-tag">3 hari teratas</span></div>
          <ol class="g-peak">${peak.map((p, i) => `<li><span class="n">${i + 1}</span><div><div class="meta"><span>${tgY(p.d)}</span>${dChip(p.d7, true)}</div><b>${f(p.t)}</b> <small style="color:var(--mute)">postingan · ${pc(p.n, p.t, 0)} negatif</small>
            <p title="${esc(p.top?.text || '')}">${esc(p.tp || '')}${p.top ? ` — ${esc(akun(p.top))}: “${esc(p.top.text.slice(0, 80))}”` : ''}</p></div></li>`).join('')}</ol></div>
      </div>
      <div class="g-grid-tt">
        <div class="g-card"><div class="g-h"><h3>Tren Topik</h3><span class="g-tag">5 topik teratas</span></div><div class="g-cv" style="height:260px"><canvas id="gcTopic"></canvas></div></div>
        <div class="g-card"><div class="g-h"><h3>Sentimen per Topik</h3><span class="g-tag"><span class="g-dot" style="background:${RED}"></span>Neg <span class="g-dot" style="background:${GREY};margin-left:6px"></span>Net <span class="g-dot" style="background:${TEAL};margin-left:6px"></span>Pos</span></div>
          <div class="g-stack">${T5.map(t => { const R = D.filter(r => r.topik === t), b = by(R);
            return `<div class="row"><span class="t" title="${esc(t)}">${esc(t)}</span><span class="sb"><i style="width:${b.n / b.t * 100}%;background:${RED}"></i><i style="width:${b.z / b.t * 100}%;background:${GREY}"></i><i style="width:${b.p / b.t * 100}%;background:${TEAL}"></i></span><span style="text-align:right;color:var(--mute)">${pc(b.p, b.t, 0)}</span></div>`; }).join('')}</div>
          <p class="hint" style="margin:12px 0 0">Angka kanan = porsi positif per topik.</p></div>
      </div>
      <div class="g-grid-wh">
        <div class="g-card"><div class="g-h"><h3>Word Cloud</h3><span class="g-tag"><span class="g-dot" style="background:${RED}"></span>Negatif <span class="g-dot" style="background:${GREY};margin-left:6px"></span>Netral <span class="g-dot" style="background:${TEAL};margin-left:6px"></span>Positif</span></div>
          <div class="g-wc" id="gWc"></div><p class="hint" style="margin:6px 0 0">Ukuran = jumlah postingan yang memuat kata · warna = sentimen dominan.</p></div>
        <div class="g-card"><div class="g-h"><h3>5 Hashtag Populer</h3><span class="g-tag">Semua sumber</span></div>
          <ol class="g-list" style="gap:16px">${tag5.map(([t, v], i) => { const s = tagS[t], tt = s.n + s.p + s.z;
            return `<li style="grid-template-columns:22px minmax(0,1fr) 90px 44px"><span class="n">${i + 1}</span><span class="t" title="${esc(t)}" style="color:${sCol(s)};font-weight:600">${esc(t)}<small style="display:block;color:var(--mute);font-weight:400;font-size:11px">${f(v)} postingan · ${pc(s.n, tt, 0)} negatif</small></span><span class="sb" style="display:flex;height:8px;border-radius:9px;overflow:hidden;background:var(--line)"><i style="width:${s.n / tt * 100}%;background:${RED}"></i><i style="width:${s.z / tt * 100}%;background:${GREY}"></i><i style="width:${s.p / tt * 100}%;background:${TEAL}"></i></span><span class="p">${pc(v, S.t, 0)}</span></li>`; }).join('') || '<li class="hint" style="display:block">Belum ada hashtag pada periode ini</li>'}</ol></div>
      </div>
      <div class="g-section-t">Detail lanjutan</div>`;

    // Word cloud spiral: kata terbesar di tengah, tidak bertumpuk
    (() => { const el = root.querySelector('#gWc'); if (!el) return; const W = el.clientWidth || 600, sk = Math.max(.5, Math.min(1, W / 720)), H = W < 600 ? 340 : 300; el.style.height = H + 'px';
      const boxes = [], ctx = document.createElement('canvas').getContext('2d');
      words.forEach(([w, c]) => { const r = Math.sqrt(c / wMax), fs = Math.round((12 + r * 32) * sk), fw = r > .45 ? 700 : 600; ctx.font = `${fw} ${fs}px Outfit, sans-serif`;
        const bw = ctx.measureText(w).width + 6, bh = fs * 1.05;
        for (let t = 0; t < 1800; t += 1) { const a = t * .32, rad = 1.6 * t * .35, x = W / 2 + rad * Math.cos(a) * (W < 600 ? 1 : 1.5) - bw / 2, y = H / 2 + rad * Math.sin(a) * .8 - bh / 2;
          if (x < 2 || y < 2 || x + bw > W - 2 || y + bh > H - 2) continue;
          if (boxes.some(b => x < b.x + b.w && x + bw > b.x && y < b.y + b.h && y + bh > b.y)) continue;
          boxes.push({ x, y, w: bw, h: bh, word: w, c, fs, fw }); break; } });
      el.innerHTML = boxes.map(b => { const s = ws[b.word]; return `<span title="${esc(b.word)} — ${f(b.c)} postingan · neg ${s.n} / net ${s.z} / pos ${s.p}" style="left:${b.x}px;top:${b.y}px;font-size:${b.fs}px;font-weight:${b.fw};color:${sCol(s)};opacity:${(.6 + b.c / wMax * .4).toFixed(2)}">${esc(b.word)}</span>`; }).join(''); })();
    if (!buildAnalitik.rz) { buildAnalitik.rz = 1; let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (!document.getElementById('viewAnalitik')?.hidden) buildAnalitik(); }, 300); }); }
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

  window.G.buildAnalitik = buildAnalitik;
})();
