/* ===== Asisten AI (Claude) — floating chat, teks saja ===== */
const CHAT_ENDPOINT = 'https://karhutla-chat.abrahms-juan.workers.dev'; // ganti dengan URL Worker kamu
const CHAT_MAX_POSTS = 50; // Workers AI punya batas konteks lebih kecil

(() => {
  const SUGGEST = ['Apa isu negatif terbesar minggu ini?', 'Kenapa sentimen negatif melonjak di hari puncak?', 'Pulau mana yang paling banyak disebut dan bagaimana sentimennya?', 'Siapa akun paling berpengaruh?'];
  const css = document.createElement('style');
  css.textContent = `
.ai-fab{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:60;display:flex;align-items:center;gap:8px;height:52px;padding:0 18px 0 14px;border:0;border-radius:26px;background:var(--accent);color:var(--accent-ink);font:700 14px "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.28);cursor:pointer}
.ai-fab svg{width:22px;height:22px}.ai-fab:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.ai-panel{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(84px,calc(env(safe-area-inset-bottom) + 84px));z-index:61;width:min(400px,calc(100vw - 40px));height:min(600px,calc(100dvh - 120px));display:flex;flex-direction:column;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.35);overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}
.ai-panel[hidden]{display:none}
.ai-h{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line)}
.ai-h b{display:block;font-size:15px}.ai-h small{color:var(--mute);font-size:11.5px}
.ai-h .ai-dot{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--accent);color:var(--accent-ink);flex:none}
.ai-h button{margin-left:auto;width:32px;height:32px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--ink);font-size:18px;cursor:pointer}
.ai-log{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;font-size:13.5px;line-height:1.5}
.ai-m{max-width:88%;padding:9px 12px;border-radius:14px;white-space:normal;word-wrap:break-word}
.ai-m.u{align-self:flex-end;background:var(--accent);color:var(--accent-ink);border-bottom-right-radius:4px}
.ai-m.a{align-self:flex-start;background:var(--card2,rgba(127,127,127,.12));border-bottom-left-radius:4px}
.ai-m.a ul{margin:4px 0;padding-left:18px}.ai-m.a p{margin:0 0 6px}.ai-m.a p:last-child{margin:0}
.ai-m.a a{color:var(--accent);font-weight:600;text-decoration:none;word-break:break-all}.ai-m.a a:hover{text-decoration:underline}
.ai-m.err{background:transparent;border:1px solid var(--neg,#F05252);color:var(--neg,#F05252)}
.ai-typing span{display:inline-block;width:6px;height:6px;margin-right:3px;border-radius:50%;background:var(--mute);animation:aiB 1s infinite}
.ai-typing span:nth-child(2){animation-delay:.15s}.ai-typing span:nth-child(3){animation-delay:.3s}
@keyframes aiB{0%,80%,100%{opacity:.25}40%{opacity:1}}
.ai-sug{display:flex;flex-wrap:wrap;gap:6px}
.ai-sug button{border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:999px;padding:6px 10px;font:500 12px inherit;font-family:inherit;cursor:pointer;text-align:left}
.ai-f{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}
.ai-f textarea{flex:1;resize:none;height:42px;max-height:120px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:14px/1.4 "Plus Jakarta Sans",system-ui,sans-serif}
.ai-f button{width:42px;height:42px;border-radius:12px;border:0;background:var(--accent);color:var(--accent-ink);font-size:18px;cursor:pointer}
.ai-f button:disabled{opacity:.5;cursor:default}
.ai-note{padding:0 16px 10px;color:var(--mute);font-size:10.5px}
@media(max-width:640px){.ai-fab span{display:none}.ai-fab{width:52px;padding:0;justify-content:center}
.ai-panel{right:0;left:0;bottom:0;width:100%;height:min(88dvh,100dvh - 60px);border-radius:18px 18px 0 0;padding-bottom:env(safe-area-inset-bottom)}}`;
  document.head.append(css);

  const ico = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
  const fab = document.createElement('button');
  fab.className = 'ai-fab'; fab.setAttribute('aria-label', 'Tanya AI Assistant'); fab.innerHTML = ico + '<span>Tanya AI</span>';
  const panel = document.createElement('div');
  panel.className = 'ai-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'AI Assistant');
  panel.innerHTML = `<div class="ai-h"><span class="ai-dot">${ico}</span><div><b>AI Assistant</b><small>Powered with Cloudflare AI</small></div><button type="button" aria-label="Tutup">×</button></div>
    <div class="ai-log" aria-live="polite"></div>
    <div class="ai-f"><textarea rows="1" maxlength="2000" placeholder="Tanya tentang data karhutla…" aria-label="Pertanyaan"></textarea><button type="button" aria-label="Kirim">➤</button></div>
    <div class="ai-note">Jawaban AI bisa keliru. Cek kembali angka penting di dashboard.</div>`;
  document.body.append(fab, panel);
  const log = panel.querySelector('.ai-log'), ta = panel.querySelector('textarea'), send = panel.querySelector('.ai-f button');
  const history = [];

  const e = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const md = t => { // markdown ringan: **tebal**, bullet, paragraf
    const lines = e(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener nofollow">$1 ↗</a>').replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (m, p, u) => `${p}<a href="${u}" target="_blank" rel="noopener nofollow">Lihat postingan ↗</a>`).split('\n'); let out = '', ul = false;
    lines.forEach(l => { const m = l.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
      if (m) { if (!ul) { out += '<ul>'; ul = true; } out += `<li>${m[1]}</li>`; }
      else { if (ul) { out += '</ul>'; ul = false; } if (l.trim()) out += `<p>${l}</p>`; } });
    return out + (ul ? '</ul>' : ''); };
  const add = (cls, html) => { const d = document.createElement('div'); d.className = 'ai-m ' + cls; d.innerHTML = html; log.append(d); log.scrollTop = log.scrollHeight; return d; };

  function welcome() {
    add('a', '<p>Halo! Saya asisten AI untuk dashboard karhutla ini. Tanyakan apa saja tentang sentimen, topik, lokasi, akun, atau tren pada periode yang sedang dipilih.</p>');
    const s = document.createElement('div'); s.className = 'ai-sug';
    SUGGEST.forEach(q => { const b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.onclick = () => { s.remove(); ask(q); }; s.append(b); });
    log.append(s);
  }

  /* Konteks data: ringkasan agregat periode aktif + postingan paling relevan dengan pertanyaan */
  function buildContext(q) {
    const all = (typeof cache !== 'undefined' && cache.post) || [];
    const rg = (typeof state !== 'undefined' && state.range) || {};
    const D = all.filter(r => !rg.from || (r.tgl >= rg.from && r.tgl <= rg.to));
    if (!D.length) return 'Data belum termuat.';
    const T = D.length, cnt = (arr, f) => { const m = {}; arr.forEach(x => { const k = f(x); m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
    const p = x => (x / T * 100).toFixed(1) + '%';
    const sent = s => D.filter(r => r.sent === s).length;
    const bySent = (f, top = 12) => cnt(D, f).slice(0, top).map(([k, v]) => { const R = D.filter(r => f(r) === k);
      return `- ${k}: ${v} (${p(v)}) | neg ${R.filter(r => r.sent === 'negatif').length}, net ${R.filter(r => r.sent === 'netral').length}, pos ${R.filter(r => r.sent === 'positif').length}`; }).join('\n');
    const days = cnt(D, r => r.tgl).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([d]) => { const R = D.filter(r => r.tgl === d);
      return `${d}: total ${R.length}, neg ${R.filter(r => r.sent === 'negatif').length}, net ${R.filter(r => r.sent === 'netral').length}, pos ${R.filter(r => r.sent === 'positif').length}`; }).join('\n');
    const acc = cnt(D.filter(r => r.user), r => r.user + ' (' + r.platform + ')').slice(0, 15).map(([k, v]) => `- ${k}: ${v} post`).join('\n');
    const tags = {}; D.forEach(r => (r.text.match(/#[\p{L}\d_]+/gu) || []).forEach(t => { t = t.toLowerCase(); tags[t] = (tags[t] || 0) + 1; }));
    const tagTop = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${k} (${v})`).join(', ');
    // skor relevansi sederhana: kata pertanyaan yang muncul di teks/topik/akun/lokasi + engagement
    const words = q.toLowerCase().split(/[^\p{L}\d]+/u).filter(w => w.length > 3);
    const score = r => { const h = (r.text + ' ' + r.topik + ' ' + r.user + ' ' + (r.lokasi || '') + ' ' + r.platform + ' ' + r.sent).toLowerCase();
      return words.reduce((s, w) => s + (h.includes(w) ? 3 : 0), 0) + Math.log10(1 + r.eng); };
    const posts = [...D].sort((a, b) => score(b) - score(a)).slice(0, CHAT_MAX_POSTS)
      .map(r => { const akun = /profile\.php|^\d+$/.test(r.user) ? (r.nama || r.user) : '@' + r.user;
        return `[${r.tgl} ${r.jamStr || ''}] ${r.platform} ${akun} | ${r.sent} | topik: ${r.topik} | lokasi: ${r.lokasi || '-'} | eng ${r.eng} | link: ${r.link || '-'}\n  "${r.text.replace(/\s+/g, ' ').slice(0, 180)}"`; }).join('\n');
    return `Periode: ${rg.from || D[0].tgl} s/d ${rg.to || ''} | Total ${T} postingan
Sentimen: positif ${sent('positif')} (${p(sent('positif'))}), negatif ${sent('negatif')} (${p(sent('negatif'))}), netral ${sent('netral')} (${p(sent('netral'))})
Engagement = likes + komentar + share.

PER PLATFORM:\n${bySent(r => r.platform)}
\nPER TOPIK:\n${bySent(r => r.topik, 15)}
\nPER LOKASI (pulau yang disebut):\n${bySent(r => r.lokasi || 'Tidak menyebutkan lokasi')}
\nTREN HARIAN:\n${days}
\nAKUN PALING AKTIF:\n${acc}
\nHASHTAG TERATAS: ${tagTop}
\nPOSTINGAN PALING RELEVAN DENGAN PERTANYAAN (maks ${CHAT_MAX_POSTS}, dari ${T}):\n${posts}`;
  }

  let busy = false;
  async function ask(q) {
    q = q.trim(); if (!q || busy) return;
    busy = true; send.disabled = true; ta.value = ''; ta.style.height = '';
    add('u', e(q)); history.push({ role: 'user', content: q });
    const t = add('a ai-typing', '<span></span><span></span><span></span>');
    try {
      const r = await fetch(CHAT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-8), context: buildContext(q) }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.reply) throw new Error(j.error || 'Layanan AI sedang tidak tersedia');
      t.className = 'ai-m a'; t.innerHTML = md(j.reply); history.push({ role: 'assistant', content: j.reply });
    } catch (err) {
      t.className = 'ai-m err'; t.textContent = 'Maaf, jawaban gagal dimuat: ' + err.message + '. Coba lagi sebentar lagi.'; history.pop();
    }
    busy = false; send.disabled = false; log.scrollTop = log.scrollHeight; ta.focus();
  }

  const open = o => { panel.hidden = !o; fab.setAttribute('aria-expanded', o); if (o) { if (!log.children.length) welcome(); setTimeout(() => ta.focus(), 50); } };
  fab.onclick = () => open(panel.hidden);
  panel.querySelector('.ai-h button').onclick = () => open(false);
  send.onclick = () => ask(ta.value);
  ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); ask(ta.value); } if (ev.key === 'Escape') open(false); });
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; });
  // Blokir tempel/seret file & gambar: hanya teks yang bisa dikirim
  ta.addEventListener('paste', ev => { if ([...(ev.clipboardData?.items || [])].some(i => i.kind === 'file')) ev.preventDefault(); });
  ta.addEventListener('drop', ev => ev.preventDefault());
  ta.addEventListener('dragover', ev => ev.preventDefault());
})();
