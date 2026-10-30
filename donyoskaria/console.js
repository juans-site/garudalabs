/* ===== Tab Ops Console + navigasi atas ===== */
(() => {
  const { ic,pfIco,esc,f,k,pc,tg,tgY,TEAL,AMBER,ORANGE,RED,GREY,NONE,cnt,akun,delta,dChip,data,barsSvg,linesSvg,heat } = window.G;
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
    const emo = cnt(D.filter(r => r.emosi && !/^netral$/i.test(r.emosi)), 'emosi'), maxEmo = emo[0]?.[1] || 1;
    const emoL = Object.fromEntries(cnt(L.filter(r => r.emosi), 'emosi')), emoP = Object.fromEntries(cnt(Pv.filter(r => r.emosi), 'emosi'));
    const topics = cnt(D.filter(r => r.topik && r.topik !== 'Lainnya'), 'topik');
    const plat = cnt(D, 'platform');
    const lastD = perDay.at(-1) || { t: 0 }, prevAvg = perDay.slice(-8, -1).reduce((s, x, _, a) => s + x.t / a.length, 0);
    const chg = prevAvg ? Math.round((lastD.t - prevAvg) / prevAvg * 100) : 0;
    const last7d = perDay.slice(-7);
    // waktu relatif terhadap postingan terbaru di data
    const stamp = r => new Date(`${r.tgl}T${(r.jamStr || '00:00')}:00`).getTime();
    const latest = Math.max(...D.map(stamp));
    const ago = r => { const m = Math.round((latest - stamp(r)) / 60000); return m < 60 ? `${m} menit lalu` : m < 1440 ? `${Math.round(m / 60)} jam lalu` : `${Math.round(m / 1440)} hari lalu`; };
    const feedSrc = (feedPf === 'Semua' ? D : D.filter(r => r.platform === feedPf)).slice().sort((a, b) => (b.km || 0) - (a.km || 0) || (b.lk || 0) - (a.lk || 0) || (b.sh || 0) - (a.sh || 0)).slice(0, 8);
    const snC = s => s === 'negatif' ? 'neg' : s === 'positif' ? 'pos' : 'net';
    // peringatan dini: pulau dengan negatif tinggi / lonjakan
    const warn = isl.slice(0, 6).map(([kk, v]) => { const R = D.filter(r => r.lokasi === kk), n = R.filter(r => r.sent === 'negatif').length, np = n / v * 100, d = delta(islL[kk] || 0, islP[kk] || 0);
      const lv = np >= 60 || (d != null && d >= 100) ? ['hi', 'Tinggi'] : np >= 45 || (d != null && d >= 30) ? ['md', 'Sedang'] : ['lo', 'Rendah'];
      const topT = cnt(R.filter(r => r.sent === 'negatif' && r.topik !== 'Lainnya'), 'topik')[0]?.[0] || 'percakapan meningkat';
      return { kk, v, np, d, lv, topT }; }).sort((a, b) => (b.lv[0] === 'hi') - (a.lv[0] === 'hi') || b.np - a.np);
    const nHigh = warn.filter(w => w.lv[0] === 'hi').length;
    // ---- Insight otomatis (3–4 poin, semua berbasis angka) ----
    const ins = [];
    const dTot = delta(Ls.t, Ps.t), dNeg = negShareP ? Math.round((negShareL - negShareP) / negShareP * 100) : null;
    ins.push([S.n / S.t >= .5 ? 'hi' : S.n / S.t >= .35 ? 'md' : 'lo', 'Sentimen',
      `${pc(S.n, S.t)} percakapan bernada negatif${dNeg != null ? ` (${dNeg >= 0 ? 'naik' : 'turun'} ${Math.abs(dNeg)}% vs periode sebelumnya)` : ''}${dTot != null ? `; volume total ${dTot >= 0 ? 'naik' : 'turun'} ${Math.abs(dTot)}%` : ''}.`]);
    const negT = cnt(D.filter(r => r.sent === 'negatif' && r.topik !== 'Lainnya'), 'topik');
    if (negT[0]) { const tL = L.filter(r => r.topik === negT[0][0]).length, tP = Pv.filter(r => r.topik === negT[0][0]).length, dt = delta(tL, tP);
      ins.push(['hi', 'Isu pemicu', `"${negT[0][0]}" jadi sumber negatif terbesar: ${f(negT[0][1])} postingan (${pc(negT[0][1], S.n, 0)} dari negatif)${dt != null ? `, ${dt >= 0 ? '+' : ''}${dt}%` : ''}.`]); }
    if (isl[0]) { const R = D.filter(r => r.lokasi === isl[0][0]), n = R.filter(r => r.sent === 'negatif').length;
      ins.push([n / isl[0][1] >= .55 ? 'hi' : 'md', 'Wilayah', `${isl[0][0]} paling disorot: ${f(isl[0][1])} postingan (${pc(isl[0][1], S.t, 0)} dari total), ${pc(n, isl[0][1], 0)} negatif${isl[1] ? `; disusul ${isl[1][0]} (${f(isl[1][1])})` : ''}.`]); }
    const posT = cnt(D.filter(r => r.sent === 'positif' && r.topik !== 'Lainnya'), 'topik');
    if (posT[0]) ins.push(['lo', 'Peluang', `Narasi positif terkuat: "${posT[0][0]}" (${f(posT[0][1])} postingan) — layak diamplifikasi untuk menyeimbangkan percakapan.`]);

    const preset = (typeof state !== 'undefined' && state.preset) || 'all';
    root.innerHTML = `
      <div class="g-hero">
        <div><div class="g-eyebrow">Pemantauan Nasional · ${esc(per)}</div>
          <h1 class="g-title"><b>Dony Oskaria</b> <span>&amp; Danantara</span></h1>
          <p class="g-sub">Pemantauan percakapan media sosial secara berkala dengan analitik AI untuk deteksi dini, pemetaan risiko, dan respons cepat.</p></div>
        <div class="g-kpis" title="Perubahan (%) dibanding periode sebelumnya dengan jumlah hari yang sama">
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('chat', 22)}</span><div><b>${f(S.t)}</b><small>Total postingan</small></div>${dChip(delta(Ls.t, Ps.t), false)}</div>
          <div class="g-kpi" style="--c:${RED}"><span class="gi">${ic('frown', 22)}</span><div><b>${pc(S.n, S.t)}</b><small>Sentimen negatif</small></div>${dChip(negShareP ? Math.round((negShareL - negShareP) / negShareP * 100) : null, true)}</div>
          <div class="g-kpi" style="--c:${TEAL}"><span class="gi">${ic('pin', 22)}</span><div><b>${isl.length}<small style="font-size:13px"> / 7</small></b><small>Pulau disebut</small></div></div>
          <div class="g-kpi" style="--c:${ORANGE}"><span class="gi">${ic('alert', 22)}</span><div><b>${f(S.n)}</b><small>Postingan negatif</small></div>${dChip(delta(Ls.n, Ps.n), true)}</div>
        </div>
      </div>

      <div class="g-stage">
        <div class="g-earth"><img src="earth.jpg?v=3" srcset="earth-sm.jpg?v=3 836w, earth.jpg?v=3 1672w" sizes="(max-width:700px) 100vw, 1400px" alt="Peta sebaran percakapan Danantara & BUMN di Indonesia" decoding="async" fetchpriority="high"><canvas class="g-smoke" aria-hidden="true"></canvas><div class="g-pins"></div></div>
        <div class="g-glass g-int">
          <div class="g-h"><h3>Emosi Percakapan</h3><span class="g-live">Live</span></div>
          <div class="g-scale"></div><div class="g-scale-l"><span>Rendah</span><span>Tinggi</span></div>
          <ol class="g-rank">${emo.slice(0, 7).map(([kk, v], i) => { const d = delta(emoL[kk] || 0, emoP[kk] || 0), neg = /kecewa|marah|khawatir|sinis|takut|sedih/i.test(kk);
            return `<li><span class="n">${i + 1}</span><span>${esc(kk)}</span><span class="v">${k(v)}</span>${dChip(d, neg)}<span class="bar"><i style="width:${v / maxEmo * 100}%"></i></span></li>`; }).join('') || '<li>Belum ada data emosi</li>'}</ol>
          <button class="g-btn" type="button" data-go="analitik">Lihat detail ${ic('arrow', 14)}</button>
        </div>
        <div class="g-ctrl">
          <div class="g-glass g-seg" role="group" aria-label="Rentang waktu">${[['last1', 'Hari terakhir'], ['last3', '3 Hari'], ['last7', '7 Hari'], ['last30', '30 Hari'], ['all', 'Semua']].map(([v, l]) => `<button type="button" data-p="${v}" class="${preset === v ? 'on' : ''}">${l}</button>`).join('')}</div>
          <div class="g-glass g-cap">Periode <b>${esc(per)}</b> · Δ dibanding 7 hari sebelumnya</div>
        </div>
      </div>

      <div class="g-card g-insight"><div class="g-h"><h3>${ic('spark', 16)} Insight Utama</h3><span class="g-tag">Otomatis dari data · ${esc(per)}</span></div>
        <ul class="g-ins">${ins.slice(0, 4).map(([lv, t, x]) => `<li class="${lv}"><span class="g-lv ${lv}">${esc(t)}</span><p>${esc(x)}</p></li>`).join('')}</ul>
        <button class="g-btn" type="button" data-ask>${ic('spark', 14)} Tanya Garuda AI</button></div>
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
        <div class="g-card"><div class="g-h"><h3>Postingan Terviral</h3>
          <div class="g-feed-tabs">${['Semua', ...plat.map(p => p[0])].map(p => `<button type="button" data-pf="${esc(p)}" class="${feedPf === p ? 'on' : ''}">${esc(p)}</button>`).join('')}</div></div>
          <div class="g-feed">${feedSrc.map(r => `<div class="g-post"><div class="top">${pfIco(r.platform, 13)}<span>${tg(r.tgl)}${r.jamStr ? ' · ' + r.jamStr : ''}</span><span class="sn ${snC(r.sent)}">${esc(r.sent)}</span></div>
            <p>${esc(r.text.slice(0, 220))}</p><div class="g-eng"><span title="Likes/Reaksi">${ic('heart', 12, 2)}${k(r.lk || 0)}</span><span title="Komentar">${ic('chat', 12, 2)}${k(r.km || 0)}</span><span title="Share/Repost">${ic('ext', 12, 2)}${k(r.sh || 0)}</span></div><div class="ft"><span class="who">${esc(akun(r))}</span>${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener">Buka ${ic('ext', 12)}</a>` : ''}</div></div>`).join('') || '<p class="hint">Tidak ada postingan</p>'}</div></div>
        <div class="g-card"><div class="g-h"><h3>Peringatan Dini</h3><span class="g-lv hi">Tinggi (${nHigh})</span></div>
          <ul class="g-warn">${warn.slice(0, 4).map(w => `<li><span class="wi g-lv ${w.lv[0]}">${ic('flame', 18)}</span><div><b>${esc(w.kk)}</b><small>${esc(w.topT)} · ${pc(w.np, 100, 0)} negatif${w.d != null ? ` · ${w.d >= 0 ? '+' : ''}${w.d}%` : ''}</small></div><span class="g-lv ${w.lv[0]}">${ic('alert', 12, 2)}${w.lv[1]}</span></li>`).join('')}</ul></div>
      </div>`;

    // peta foto bumi + pin data
    const PIN = { 'Sumatera': [328, 450], 'Kalimantan': [740, 503], 'Sulawesi': [978, 601], 'Jawa': [576, 741], 'Bali & Nusa Tenggara': [932, 811], 'Papua': [1445, 651], 'Maluku': [1185, 508] };
    const IW = 1672, IH = 1051, mx = Math.max(1, ...isl.map(x => x[1]));
    const pins = root.querySelector('.g-pins');
    pins.innerHTML = isl.map(([kk, v]) => { const p = PIN[kk]; if (!p) return ''; const d = delta(islL[kk] || 0, islP[kk] || 0), t = v / mx;
      const nm = kk === 'Bali & Nusa Tenggara' ? 'Nusa Tenggara' : kk;
      return `<div class="g-pin${p[0] > 1350 ? ' l' : ''}" style="left:${p[0] / IW * 100}%;top:${p[1] / IH * 100}%;--s:${(10 + t * 10).toFixed(1)}px">
        <i class="dot"></i><i class="stem"></i><div class="lab"><b>${esc(nm.toUpperCase())}</b><span>${k(v)} postingan</span>${d != null ? `<em class="${d >= 0 ? 'eu' : 'ed'}">${d >= 0 ? '↑ +' : '↓ '}${d}%</em>` : ''}</div></div>`; }).join('');
    const earth = root.querySelector('.g-earth'), stage = root.querySelector('.g-stage');
    const fit = () => { const W = stage.clientWidth, H = stage.clientHeight, wide = innerWidth >= 1100;
      if (!wide) { earth.style.cssText = ''; return; }
      // ukuran globe dibatasi seperti tata letak awal (lebar konten 1500px), lalu diletakkan di tengah area kanan
      const left = 300, right = 16, avail = W - left - right, sc = Math.min(avail, 1128) / (1640 - 150), w = IW * sc, h = IH * sc, gx = left - 150 * sc + (avail - 1490 * sc) / 2;
      earth.style.cssText = `position:absolute;width:${w}px;height:${h}px;left:${gx}px;top:${(H - 20) / 2 - 570 * sc + 20}px`;
      const below = Math.max(0, (H - 70) / 2 - 460 * sc + h - H); stage.style.setProperty('--below', below + 'px'); };
    fit(); if (!buildConsole.fitBound) { buildConsole.fitBound = 1; addEventListener('resize', () => { const f = document.querySelector('#gConsole')?._fit; f && f(); }); }
    root._fit = fit;
    window.G.smoke?.(root.querySelector('.g-smoke'), earth, isl, mx);
    root.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (typeof state === 'undefined') return; state.preset = b.dataset.p; render(); });
    root.querySelectorAll('[data-pf]').forEach(b => b.onclick = () => { feedPf = b.dataset.pf; buildConsole(); });
    root.querySelector('[data-ask]')?.addEventListener('click', () => document.querySelector('.ai-fab')?.click());
    root.querySelector('[data-go=analitik]')?.addEventListener('click', () => document.querySelector('[data-tab=analitik]')?.click());
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
      const aBtn = document.createElement('button'); aBtn.setAttribute('role', 'tab'); aBtn.dataset.tab = 'analitik'; aBtn.textContent = 'Analytics';
      dBtn ? dBtn.after(aBtn) : tabs.prepend(aBtn);
      const ai = document.createElement('button'); ai.type = 'button'; ai.className = 'g-ai-tab'; ai.setAttribute('role', 'tab'); ai.innerHTML = ic('spark', 15) + 'Garuda AI';
      ai.style.cssText = 'border:0;background:none;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer';
      ai.onclick = e => { e.stopPropagation(); document.querySelector('.ai-fab')?.click(); };
      tabs.querySelector('[data-tab=sna]')?.after(ai);
      aBtn.addEventListener('click', () => {
        tabs.querySelectorAll('[role=tab]').forEach(x => x.classList.toggle('on', x === aBtn));
        ['viewDash', 'viewRaw', 'viewSna'].forEach(id => { const v = document.getElementById(id); if (v) v.hidden = true; });
        an.hidden = false; window.G.buildAnalitik?.();
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

  const refresh = () => { setupNav(); buildConsole(); if (!document.getElementById('viewAnalitik')?.hidden) window.G.buildAnalitik?.(); };
  window.addEventListener('lok:update', () => setTimeout(refresh, 0));
  if (window.__lok) setTimeout(refresh, 0);
})();
