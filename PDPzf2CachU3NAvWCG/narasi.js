/* ===== Narasi yang Menonjol — insight AI otomatis dari data terbaru =====
   Data dihitung di browser (topik, contoh postingan, deteksi amplifikasi, topik baru),
   lalu diringkas Cloudflare Workers AI. Hasil di-cache 20 menit di Worker. */
(() => {
  const ENDPOINT = (typeof CHAT_ENDPOINT !== 'undefined' && CHAT_ENDPOINT) || 'https://karhutla-chat.abrahms-juan.workers.dev';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = t => String(t).toLowerCase().replace(/https?:\S+|[@#]\S+/g, ' ').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const LV = { hi: ['hi', 'Kritis'], md: ['md', 'Pantau'], lo: ['lo', 'Positif'], new: ['md', 'Topik baru'] };
  let lastKey = '', busy = false, cached = null;

  function build() {
    const all = (typeof cache !== 'undefined' && cache.post) || []; if (!all.length) return null;
    const latest = all.map(r => r.tgl).sort().at(-1);
    const W = all.filter(r => r.tgl === latest);                        // fokus: hari terbaru di data
    const prevDays = new Set([...new Set(all.map(r => r.tgl))].sort().filter(d => d < latest).slice(-7));
    const Pv = all.filter(r => prevDays.has(r.tgl));
    const lastJam = W.map(r => r.jamStr || '').sort().at(-1) || '';
    const cnt = (a, f) => { const m = {}; a.forEach(x => { const k = f(x); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((x, y) => y[1] - x[1]); };
    // amplifikasi: teks (dinormalisasi) identik dari >=3 akun berbeda
    const groups = {}; W.forEach(r => { const k = norm(r.text).slice(0, 160); if (k.length < 40) return; (groups[k] = groups[k] || []).push(r); });
    const amp = Object.values(groups).map(g => ({ g, acc: new Set(g.map(r => r.user)).size })).filter(x => x.acc >= 3).sort((a, b) => b.acc - a.acc).slice(0, 3);
    // topik baru: tidak muncul di 7 hari sebelumnya / naik tajam
    const prevT = Object.fromEntries(cnt(Pv, r => r.topik));
    const topics = cnt(W, r => r.topik !== 'Lainnya' && r.topik);
    const newT = topics.filter(([t, n]) => !prevT[t] || n / Math.max(1, prevT[t] / 7) >= 3).slice(0, 3);
    const sample = (arr, n) => { const seen = new Set(), out = []; arr.slice().sort((a, b) => b.eng - a.eng).forEach(r => { const k = norm(r.text).slice(0, 80); if (!seen.has(k) && out.length < n) { seen.add(k); out.push(r); } }); return out; };
    const line = r => `- [${r.platform}] ${r.sent}: "${r.text.replace(/\s+/g, ' ').slice(0, 220)}"`;
    let ctx = `Tanggal: ${latest} (data s/d pukul ${lastJam} WIB) | ${W.length} postingan hari ini\n\nKELOMPOK TOPIK HARI INI:\n`;
    topics.slice(0, 6).forEach(([t, n]) => { const R = W.filter(r => r.topik === t); ctx += `\n## ${t}: ${n} postingan (neg ${R.filter(r => r.sent === 'negatif').length}, pos ${R.filter(r => r.sent === 'positif').length})\n${sample(R, 6).map(line).join('\n')}\n`; });
    const other = W.filter(r => r.topik === 'Lainnya'); if (other.length) ctx += `\n## Lainnya/belum berlabel: ${other.length}\n${sample(other, 4).map(line).join('\n')}\n`;
    ctx += `\nINDIKASI AMPLIFIKASI (teks identik dari banyak akun):\n${amp.map(a => `- ${a.g.length} postingan dari ${a.acc} akun berbeda: "${a.g[0].text.slice(0, 160)}"`).join('\n') || '- tidak ada'}\n`;
    ctx += `\nTOPIK BARU / MELONJAK:\n${newT.map(([t, n]) => `- ${t}: ${n} hari ini (rata-rata 7 hari sebelumnya ${((prevT[t] || 0) / 7).toFixed(1)}/hari)`).join('\n') || '- tidak ada'}\n`;
    const pos = W.filter(r => r.sent === 'positif'); ctx += `\nSINYAL POSITIF (${pos.length}):\n${sample(pos, 5).map(line).join('\n')}\n`;
    // buang emoji/karakter khusus: model AI menolak input berisi surrogate/emoji
    ctx = ctx.replace(/[\uD800-\uDFFF]/g, '').replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F\u2010-\u2027]/g, '');
    return { ctx, key: `${latest}-${W.length}`, latest, lastJam, n: W.length, amp };
  }

  function render(box, data, meta, state) {
    const tag = box.querySelector('.g-h .g-tag'), list = box.querySelector('.g-ins'), h3 = box.querySelector('.g-h h3');
    if (h3 && !h3.dataset.n) { h3.dataset.n = 1; h3.lastChild.textContent = ' Narasi yang Menonjol'; }
    if (tag) tag.textContent = meta ? `AI · ${meta.latest.split('-').reverse().slice(0, 2).join('/')} s/d ${meta.lastJam} WIB · ${meta.n} postingan` : 'AI';
    if (state === 'loading') { list.innerHTML = '<li class="md" style="grid-column:1/-1"><span class="g-lv md">Menganalisis</span><p>Garuda AI sedang membaca percakapan terbaru…</p></li>'; return; }
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
    } catch (e) { box.querySelector('.g-ins').innerHTML = fallback; const t = box.querySelector('.g-h .g-tag'); if (t) t.textContent = 'Otomatis dari data (AI tidak tersedia)'; }
    busy = false;
  }

  const css = document.createElement('style');
  css.textContent = `.g-ins li .nj{display:block;margin-top:8px;font-size:13.5px;color:var(--ink)}.g-ins li .nj+p{margin-top:4px}
  @media(min-width:1281px){.g-ins{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important}}`;
  document.head.append(css);
  // jalankan setiap kali console digambar ulang (render ulang menimpa card, jadi pakai cache)
  window.addEventListener('lok:update', () => setTimeout(() => run(false), 1500));
})();
