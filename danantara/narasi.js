/* ===== Narasi yang Menonjol — insight AI otomatis dari data terbaru =====
   Data dihitung di browser (topik, contoh postingan, deteksi amplifikasi, topik baru),
   lalu diringkas Cloudflare Workers AI. Hasil di-cache 20 menit di Worker. */
(() => {
  const ENDPOINT = (typeof CHAT_ENDPOINT !== 'undefined' && CHAT_ENDPOINT) || 'https://donyoskaria-chat.abrahms-juan.workers.dev';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = t => String(t).toLowerCase().replace(/https?:\S+|[@#]\S+/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const LV = { hi: ['hi', 'Kritis'], md: ['md', 'Pantau'], lo: ['lo', 'Positif'], new: ['md', 'Topik baru'] };
  let lastKey = '', busy = false, cached = null;

  function build() {
    const all = (typeof cache !== 'undefined' && (cache[state.src] || cache.post)) || []; if (!all.length) return null;
    // Ikut filter periode dashboard; pembanding = periode sebelumnya dengan jumlah hari sama
    const rg = (typeof state !== 'undefined' && state.range) || {}, days = [...new Set(all.map(r => r.tgl))].sort();
    const from = rg.from || days[0], to = rg.to || days.at(-1), latest = to;
    const W = all.filter(r => r.tgl >= from && r.tgl <= to);
    const span = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1);
    const pTo = new Date(new Date(from) - 864e5).toISOString().slice(0, 10), pFrom = new Date(new Date(from) - span * 864e5).toISOString().slice(0, 10);
    const Pv = all.filter(r => r.tgl >= pFrom && r.tgl <= pTo);
    const lastJam = W.filter(r => r.tgl === W.map(x => x.tgl).sort().at(-1)).map(r => r.jamStr || '').sort().at(-1) || '', lastTgl = W.map(r => r.tgl).sort().at(-1) || to;
    const cnt = (a, f) => { const m = {}; a.forEach(x => { const k = f(x); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((x, y) => y[1] - x[1]); };
    // amplifikasi: teks (dinormalisasi) identik dari >=3 akun berbeda
    const groups = {}; W.forEach(r => { const k = norm(r.text).slice(0, 160); if (k.length < 40) return; (groups[k] = groups[k] || []).push(r); });
    const amp = Object.values(groups).map(g => ({ g, acc: new Set(g.map(r => r.user)).size })).filter(x => x.acc >= 3).sort((a, b) => b.acc - a.acc).slice(0, 3);
    // topik baru: tidak muncul di 7 hari sebelumnya / naik tajam
    const prevT = Object.fromEntries(cnt(Pv, r => r.topik));
    const topics = cnt(W, r => r.topik !== 'Lainnya' && r.topik);
    const newT = topics.filter(([t, n]) => !prevT[t] || n / Math.max(1, prevT[t] || 0) >= 3).slice(0, 3);
    const sample = (arr, n) => { const seen = new Set(), out = []; arr.slice().sort((a, b) => b.eng - a.eng).forEach(r => { const k = norm(r.text).slice(0, 80); if (!seen.has(k) && out.length < n) { seen.add(k); out.push(r); } }); return out; };
    const line = r => `- [${r.platform}] ${r.sent}: "${r.text.replace(/\s+/g, ' ').slice(0, 220)}"`;
    let ctx = `Periode: ${from} s/d ${lastTgl} pukul ${lastJam} WIB (${span} hari) | ${W.length} postingan\n\nKELOMPOK TOPIK PADA PERIODE INI:\n`;
    topics.slice(0, 6).forEach(([t, n]) => { const R = W.filter(r => r.topik === t); ctx += `\n## ${t}: ${n} postingan (neg ${R.filter(r => r.sent === 'negatif').length}, pos ${R.filter(r => r.sent === 'positif').length})\n${sample(R, 6).map(line).join('\n')}\n`; });
    const other = W.filter(r => r.topik === 'Lainnya'); if (other.length) ctx += `\n## Lainnya/belum berlabel: ${other.length}\n${sample(other, 4).map(line).join('\n')}\n`;
    ctx += `\nINDIKASI AMPLIFIKASI (teks identik dari banyak akun):\n${amp.map(a => `- ${a.g.length} postingan dari ${a.acc} akun berbeda: "${a.g[0].text.slice(0, 160)}"`).join('\n') || '- tidak ada'}\n`;
    ctx += `\nTOPIK BARU / MELONJAK:\n${newT.map(([t, n]) => `- ${t}: ${n} hari ini (periode sebelumnya ${prevT[t] || 0})`).join('\n') || '- tidak ada'}\n`;
    const pos = W.filter(r => r.sent === 'positif'); ctx += `\nSINYAL POSITIF (${pos.length}):\n${sample(pos, 5).map(line).join('\n')}\n`;
    // buang emoji/karakter khusus: model AI menolak input berisi surrogate/emoji
    ctx = ctx.replace(/[\uD800-\uDFFF]/g, '').replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F\u2010-\u2027]/g, '');
    return { ctx, key: `${(typeof state !== "undefined" && state.src) || "post"}_${(typeof state !== "undefined" && state.kw) || ""}_${from}_${to}`, from, to: lastTgl, span, lastJam, n: W.length, amp };
  }

  function render(box, data, meta, state) {
    const tag = box.querySelector('.g-h .g-tag'), list = box.querySelector('.g-ins'), h3 = box.querySelector('.g-h h3');
    const BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'], d = t => { const [y, m, dd] = t.split('-'); return { d: +dd, m: BL[m - 1], y }; };
    if (h3 && meta) { const a = d(meta.from), b = d(meta.to);
      const per = meta.from === meta.to ? `${b.d} ${b.m} ${b.y}` : a.m === b.m && a.y === b.y ? `${a.d}–${b.d} ${b.m} ${b.y}` : `${a.d} ${a.m} – ${b.d} ${b.m} ${b.y}`;
      h3.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/></svg><span class="nt-t">Narasi per ${esc(per)}</span>`; }
    if (tag) tag.innerHTML = meta ? `<span class="ai-dot"></span>Garuda AI · ${meta.n.toLocaleString('id-ID')} postingan` : 'Garuda AI';
    if (state === 'loading') { list.innerHTML = `<li class="ai-load" style="grid-column:1/-1"><div class="al-head"><span class="al-orb"><i></i><i></i><i></i></span><span class="al-txt">Garuda AI menganalisis percakapan<em>.</em><em>.</em><em>.</em></span></div><div class="al-sk">${'<div><b></b><i></i><i></i></div>'.repeat(4)}</div></li>`; return; }
    if (state === 'error' || !data) return;   // tetap tampilkan insight angka bawaan
    list.innerHTML = data.poin.map(p => { const lv = LV[p.level] || LV.md;
      return `<li class="${lv[0]}"><span class="g-lv ${lv[0]}">${esc(lv[1])}${p.jumlah ? ` · ${esc(p.jumlah)}` : ''}</span><b class="nj">${esc(p.judul || '')}</b><p>${esc(p.isi || '')}</p></li>`; }).join('');
  }

  async function run(force) {
    const box = document.querySelector('#gConsole .g-insight'); if (!box || busy) return;
    const m = build(); if (!m) return;
    if (!force && m.key === lastKey && cached) { render(box, cached, m); return; }
    const fallback = box.querySelector('.g-ins').innerHTML;
    busy = true; render(box, null, m, 'loading');
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'narasi', key: m.key, context: m.ctx }) });
      const j = await r.json(); if (!r.ok || !j.poin) throw new Error(j.error || r.status);
      cached = j; lastKey = m.key; render(box, j, m);
    } catch (e) { box.querySelector('.g-ins').innerHTML = fallback; const t = box.querySelector('.g-h .g-tag'); if (t) t.textContent = 'Ringkasan angka (AI sedang tidak tersedia)'; }
    busy = false;
  }

  const css = document.createElement('style');
  css.textContent = `.ai-load{border-left:0!important;padding:14px!important;position:relative;overflow:hidden}
  .ai-load:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(58,166,240,.08),transparent);transform:translateX(-100%);animation:alSweep 1.6s ease-in-out infinite}
  .al-head{display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:12.5px;color:var(--mute)}
  .al-orb{position:relative;width:18px;height:18px}.al-orb i{position:absolute;inset:0;border-radius:50%;border:1.5px solid #3AA6F0;opacity:0;animation:alRing 1.8s ease-out infinite}.al-orb i:nth-child(2){animation-delay:.6s}.al-orb i:nth-child(3){animation-delay:1.2s}
  .al-orb:after{content:"";position:absolute;inset:6px;border-radius:50%;background:#3AA6F0;box-shadow:0 0 10px #3AA6F0}
  .al-txt em{font-style:normal;animation:alDot 1.2s infinite}.al-txt em:nth-child(2){animation-delay:.2s}.al-txt em:nth-child(3){animation-delay:.4s}
  .al-sk{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
  .al-sk>div{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid var(--line)}
  .al-sk b,.al-sk i{display:block;height:9px;border-radius:6px;background:rgba(255,255,255,.07)}.al-sk b{width:45%;height:11px}.al-sk i:last-child{width:70%}
  @keyframes alSweep{to{transform:translateX(100%)}}@keyframes alRing{0%{transform:scale(.4);opacity:.9}100%{transform:scale(1.6);opacity:0}}@keyframes alDot{0%,100%{opacity:.2}50%{opacity:1}}
  @media(prefers-reduced-motion:reduce){.ai-load:after,.al-orb i,.al-txt em{animation:none}}
  .g-insight .g-h h3{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.g-insight .nt-t{font-size:16px;font-weight:600}.g-insight .nt-s{font-size:12px;font-weight:400;color:var(--mute)}
  .g-insight .g-h h3 svg{align-self:center;color:#3AA6F0}
  .g-insight .g-tag{display:inline-flex;align-items:center;gap:6px}.ai-dot{width:6px;height:6px;border-radius:50%;background:#3AA6F0;box-shadow:0 0 8px #3AA6F0}
  .g-ins li .nj{display:block;margin-top:8px;font-size:13.5px;color:var(--ink)}.g-ins li .nj+p{margin-top:4px}
  @media(min-width:1281px){.g-ins{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important}}`;
  document.head.append(css);
  // jalankan setiap kali console digambar ulang (render ulang menimpa card, jadi pakai cache)
  window.addEventListener('lok:update', () => setTimeout(() => run(false), 1500));
})();
