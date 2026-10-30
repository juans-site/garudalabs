/* ===== Peta holografik Indonesia: volume percakapan per provinsi (38) =====
   Geometri: peta-geo.js (batas provinsi asli + negara tetangga, proyeksi globe miring). */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const css = document.createElement('style');
  css.textContent = `
.g-holo{position:absolute;inset:0;width:100%;height:100%;display:block}
.g-holo .pv{fill:url(#hFill);stroke:#8BE9FF;stroke-width:1;stroke-opacity:.55;transition:fill-opacity .25s,stroke-opacity .25s;cursor:pointer}
.g-holo .pv:hover,.g-holo .pv.on{stroke:#fff;stroke-opacity:1;stroke-width:1.6}
.g-holo .arc{fill:none;stroke:url(#hArc);stroke-linecap:round;stroke-dasharray:6 10;animation:hFlow 2.6s linear infinite}
.g-holo .node{fill:#FFD27A;filter:url(#hDot)}
.g-holo .ring{fill:none;stroke:#FFC15A;stroke-width:1.4;transform-box:fill-box;transform-origin:center;animation:hPulse 2.8s ease-out infinite}
.g-holo .hub{fill:#fff;filter:url(#hDot)}
@keyframes hFlow{to{stroke-dashoffset:-32}}
@keyframes hPulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.4);opacity:0}}
@media(prefers-reduced-motion:reduce){.g-holo .arc,.g-holo .ring{animation:none}}
.g-earth .g-holo{pointer-events:auto}
.g-holo-tip{position:absolute;z-index:6;pointer-events:none;padding:8px 11px;border-radius:10px;background:rgba(4,14,26,.88);border:1px solid rgba(120,220,255,.45);color:#EAF6FF;font:500 12.5px var(--f-body,system-ui);box-shadow:0 0 18px rgba(60,180,255,.25);white-space:nowrap;transform:translate(-50%,calc(-100% - 14px))}
.g-holo-tip b{display:block;font-size:13px;color:#fff}.g-holo-tip i{font-style:normal;color:#FFC15A}`;
  document.head.append(css);

  function holo(host, counts = {}, deltas = {}) {
    const g = window.PETA_GEO; if (!g || !host) return;
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1, mx = Math.max(1, ...Object.values(counts));
    const jkt = g.prov.find(p => p.n === 'DKI Jakarta').c;
    const lvl = n => n ? .25 + .75 * Math.sqrt(n / mx) : 0;
    const prov = g.prov.map(p => {
      const n = counts[p.n] || 0, t = lvl(n);
      return `<path class="pv" data-n="${esc(p.n)}" d="${p.d}" style="fill-opacity:${(.22 + t * .6).toFixed(2)}"/>`; }).join('');
    const act = g.prov.filter(p => counts[p.n]).sort((a, b) => counts[a.n] - counts[b.n]);
    const arcs = act.filter(p => p.n !== 'DKI Jakarta').map(p => {
      const [x1, y1] = p.c, [x2, y2] = jkt, mxp = (x1 + x2) / 2, myp = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * .32, t = lvl(counts[p.n]);
      return `<path class="arc" d="M${x1},${y1}Q${mxp.toFixed(0)},${myp.toFixed(0)} ${x2},${y2}" style="stroke-width:${(1 + t * 2.4).toFixed(1)};opacity:${(.35 + t * .6).toFixed(2)};animation-delay:-${(Math.random() * 2.6).toFixed(2)}s"/>`; }).join('');
    const nodes = act.map(p => { const r = 3 + lvl(counts[p.n]) * 9;
      return `<circle class="ring" cx="${p.c[0]}" cy="${p.c[1]}" r="${r.toFixed(1)}" style="animation-delay:-${(Math.random() * 2.8).toFixed(2)}s"/><circle class="node" cx="${p.c[0]}" cy="${p.c[1]}" r="${(r * .55).toFixed(1)}"/>`; }).join('');
    host.querySelector('.g-holo')?.remove();
    host.querySelector('img')?.remove();
    host.insertAdjacentHTML('afterbegin', `<svg class="g-holo" viewBox="0 0 ${g.W} ${g.H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Peta volume percakapan per provinsi di Indonesia">
      <defs>
        <radialGradient id="hSea" cx="50%" cy="85%" r="85%"><stop offset="0" stop-color="#0B2440"/><stop offset=".7" stop-color="#051427"/><stop offset="1" stop-color="#020A16"/></radialGradient>
        <linearGradient id="hFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FE6FF"/><stop offset="1" stop-color="#1A8FD6"/></linearGradient>
        <linearGradient id="hArc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB547"/><stop offset="1" stop-color="#8FD8FF"/></linearGradient>
        <pattern id="hDots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".9" fill="#CFF6FF" fill-opacity=".55"/></pattern>
        <filter id="hGlow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>
        <filter id="hDot" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="hLimb" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
        <clipPath id="hClip"><path d="${g.prov.map(p => p.d).join('')}"/></clipPath>
      </defs>
      <path d="${g.limb}" fill="none" stroke="#3FA2FF" stroke-width="16" stroke-opacity=".5" filter="url(#hLimb)"/>
      <path d="${g.limb}" fill="url(#hSea)" stroke="#9FD4FF" stroke-width="2.2"/>
      <g fill="none" stroke="#3C8FD9" stroke-opacity=".16" stroke-width="1">${g.grat.map(d => `<path d="${d}"/>`).join('')}</g>
      <g fill="#0D2138" fill-opacity=".85" stroke="#4F86B8" stroke-opacity=".35" stroke-width=".8">${g.nb.map(d => `<path d="${d}"/>`).join('')}</g>
      <g fill="#33C8FF" opacity=".55" filter="url(#hGlow)">${g.prov.map(p => `<path d="${p.d}"/>`).join('')}</g>
      <g>${prov}</g>
      <rect width="${g.W}" height="${g.H}" fill="url(#hDots)" clip-path="url(#hClip)" pointer-events="none" opacity=".55"/>
      <g pointer-events="none">${arcs}</g>
      <g pointer-events="none">${nodes}<circle class="ring" cx="${jkt[0]}" cy="${jkt[1]}" r="16"/><circle class="hub" cx="${jkt[0]}" cy="${jkt[1]}" r="6"/></g>
    </svg>`);
    // tooltip
    let tip = host.querySelector('.g-holo-tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'g-holo-tip'; tip.hidden = true; host.append(tip); }
    const svg = host.querySelector('.g-holo');
    svg.addEventListener('pointermove', e => { const p = e.target.closest('.pv'); if (!p) { tip.hidden = true; return; }
      const n = p.dataset.n, v = counts[n] || 0, d = deltas[n], r = host.getBoundingClientRect();
      tip.innerHTML = `<b>${esc(n)}</b>${v.toLocaleString('id-ID')} percakapan · ${(v / total * 100).toFixed(1).replace('.', ',')}%${d != null ? ` · <i>${d >= 0 ? '+' : ''}${d}%</i>` : ''}`;
      tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px'; tip.hidden = false; });
    svg.addEventListener('pointerleave', () => tip.hidden = true);
  }
  window.G = Object.assign(window.G || {}, { holo });
})();
