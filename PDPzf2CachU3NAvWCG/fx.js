/* ===== Efek Ops Console: intro saat halaman dimuat + parallax saat scroll =====
   Ringan: hanya transform/opacity, animasi angka dengan requestAnimationFrame, scroll di-throttle per frame. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = `
.fx-intro .g-earth img{animation:fxEarth 1.6s cubic-bezier(.2,.7,.2,1) both}
.fx-intro .g-pin .dot{animation:fxPop .5s cubic-bezier(.3,1.6,.5,1) both;animation-delay:calc(.5s + var(--i)*.14s)}
.fx-intro .g-pin .stem{transform-origin:bottom;animation:fxGrow .45s ease-out both;animation-delay:calc(.7s + var(--i)*.14s)}
.fx-intro .g-pin .lab{animation:fxLab .55s ease-out both;animation-delay:calc(.95s + var(--i)*.14s)}
.fx-intro .g-arc,.fx-intro .g-smoke{animation:fxFade 1.2s ease-out .9s both}
.fx-intro .g-kpi,.fx-intro .g-int,.fx-intro .g-ctrl,.fx-intro .g-grid4>*{animation:fxUp .7s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.15s + var(--i,0)*.08s)}
.fx-scan{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden;border-radius:inherit}
.fx-scan:before{content:"";position:absolute;left:0;right:0;height:140px;top:-140px;background:linear-gradient(180deg,transparent,rgba(70,214,200,.10) 70%,rgba(120,240,225,.55) 98%,transparent);animation:fxScan 1.5s cubic-bezier(.4,0,.2,1) .2s both}
.fx-scan:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 1px 1px,rgba(70,214,200,.35) 1px,transparent 1.6px) 0 0/22px 22px;animation:fxGrid 1.8s ease-out .2s both}
@keyframes fxEarth{from{opacity:0;transform:scale(1.08);filter:brightness(1.8) saturate(.4)}to{opacity:1;transform:none;filter:none}}
@keyframes fxPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes fxGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes fxLab{from{opacity:0;transform:translateY(8px);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@keyframes fxFade{from{opacity:0}to{opacity:1}}
@keyframes fxUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fxScan{from{transform:translateY(0)}to{transform:translateY(calc(100vh + 280px))}}
@keyframes fxGrid{0%{opacity:0}25%{opacity:1}100%{opacity:0}}
/* parallax */
.g-earth{will-change:transform}
.g-pins{transition:none;will-change:opacity,transform}`;
  document.head.append(css);

  /* Angka menghitung naik: "2.491", "58,2%", "926 postingan", "↑ +226%" */
  function countUp(el, dur = 1200, delay = 0) {
    const txt = el.textContent, m = txt.match(/\d[\d.]*(,\d+)?/); if (!m) return;
    const raw = m[0], dec = (m[1] || '').length ? m[1].length - 1 : 0;
    const target = parseFloat(raw.replace(/\./g, '').replace(',', '.')); if (!isFinite(target) || target === 0) return;
    const pre = txt.slice(0, m.index), post = txt.slice(m.index + raw.length);
    const fmt = v => v.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const t0 = performance.now() + delay; el.textContent = pre + fmt(0) + post;
    const step = now => { const q = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - q, 3);
      el.textContent = pre + fmt(target * e) + post; if (q < 1) requestAnimationFrame(step); else el.textContent = txt; };
    requestAnimationFrame(step);
  }

  let introDone = false;
  function intro() {
    const root = document.getElementById('gConsole'); if (!root || introDone) return;
    if (!root.querySelector('.g-pin')) return;          // tunggu data
    introDone = true; if (reduce) return;
    root.querySelectorAll('.g-pin').forEach((p, i) => p.style.setProperty('--i', i));
    root.querySelectorAll('.g-kpi').forEach((p, i) => p.style.setProperty('--i', i));
    root.querySelectorAll('.g-grid4>*').forEach((p, i) => p.style.setProperty('--i', i + 4));
    root.classList.add('fx-intro');
    const stage = root.querySelector('.g-stage'); if (stage) { const s = document.createElement('div'); s.className = 'fx-scan'; stage.append(s); setTimeout(() => s.remove(), 2400); }
    root.querySelectorAll('.g-kpi b').forEach((b, i) => countUp(b.firstChild?.nodeType === 3 ? { get textContent() { return b.firstChild.textContent; }, set textContent(v) { b.firstChild.textContent = v; } } : b, 1300, 200 + i * 80));
    root.querySelectorAll('.g-pin').forEach((p, i) => p.querySelectorAll('.lab span, .lab em').forEach(el => countUp(el, 1100, 950 + i * 140)));
    root.querySelectorAll('.g-rank .v, .g-vol .big').forEach((el, i) => countUp(el, 1100, 400 + i * 60));
    setTimeout(() => root.classList.remove('fx-intro'), 4000);
  }

  /* Parallax: globe bergerak lebih lambat; label & angka globe memudar + blur saat discroll */
  let ticking = false;
  function parallax() {
    ticking = false;
    const root = document.getElementById('gConsole'), view = document.getElementById('viewDash');
    if (!root || !view || view.hidden || innerWidth < 1100 || reduce) return;
    const stage = root.querySelector('.g-stage'), earth = root.querySelector('.g-earth'), pins = root.querySelector('.g-pins'); if (!stage || !earth) return;
    const r = stage.getBoundingClientRect(), y = Math.max(0, -r.top + 90), p = Math.min(1, y / (r.height * .55));
    earth.style.transform = `translate3d(0,${(y * .42).toFixed(1)}px,0) scale(${(1 + p * .04).toFixed(3)})`;
    if (pins) { pins.style.opacity = (1 - p * 1.4).toFixed(3); pins.style.filter = p > .02 ? `blur(${(p * 6).toFixed(1)}px)` : ''; pins.style.transform = `translate3d(0,${(-p * 30).toFixed(1)}px,0)`; }
    const side = root.querySelectorAll('.g-int,.g-ctrl');
    side.forEach(el => { el.style.opacity = (1 - p * 1.1).toFixed(3); el.style.transform = `translate3d(0,${(-y * .12).toFixed(1)}px,0)`; });
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  window.addEventListener('lok:update', () => setTimeout(() => { intro(); parallax(); }, 40));
})();
