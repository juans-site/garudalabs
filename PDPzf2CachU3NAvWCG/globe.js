/* ===== Globe: asap partikel canvas per pulau (intensitas = volume percakapan) ===== */
(() => {
  const { ic,pfIco,esc,f,k,pc,tg,tgY,TEAL,AMBER,ORANGE,RED,GREY,NONE,cnt,akun,delta,dChip,data,barsSvg,linesSvg,heat } = window.G;
  /* ---------------- Asap partikel (canvas, ringan) ----------------
     Sprite asap dibuat sekali secara prosedural; partikel tersebar di area tiap pulau,
     jumlah & kepekatan sebanding volume percakapan. Berhenti saat tak terlihat. */
  const AREA = { 'Sumatera': [320, 505, 165, 48, 52], 'Kalimantan': [715, 520, 135, 85, 0], 'Sulawesi': [985, 590, 55, 85, 10], 'Jawa': [560, 732, 165, 22, 14],
    'Bali & Nusa Tenggara': [960, 815, 150, 18, -6], 'Papua': [1440, 670, 105, 95, 20], 'Maluku': [1180, 515, 40, 55, 0] };
  let SPR = null;
  function sprites() {
    if (SPR) return SPR; SPR = [];
    for (let v = 0; v < 4; v++) { const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s; const x = cv.getContext('2d');
      for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() ** .7 * s * .3, px = s / 2 + Math.cos(a) * r, py = s / 2 + Math.sin(a) * r * .8, rr = 10 + Math.random() * 26;
        const g = x.createRadialGradient(px, py, 0, px, py, rr), sh = 205 + Math.random() * 40 | 0; g.addColorStop(0, `rgba(${sh},${sh},${sh + 4},.10)`); g.addColorStop(1, `rgba(${sh},${sh},${sh},0)`);
        x.fillStyle = g; x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill(); }
      x.globalCompositeOperation = 'destination-in'; const m = x.createRadialGradient(s / 2, s / 2, s * .1, s / 2, s / 2, s * .5); m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = m; x.fillRect(0, 0, s, s);
      SPR.push(cv); }
    return SPR;
  }
  function smoke(cv, earth, isl, mx) {
    if (!cv) return; if (smoke.stop) smoke.stop();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, ctx = cv.getContext('2d'), spr = sprites();
    const em = []; isl.forEach(([kk, v]) => { const A = AREA[kk]; if (!A || !v) return; const t = v / mx, n = Math.round(2 + t * 14), ang = A[4] * Math.PI / 180;
      for (let i = 0; i < n; i++) { const r = Math.sqrt(Math.random()), th = Math.random() * Math.PI * 2, ex = Math.cos(th) * r * A[2], ey = Math.sin(th) * r * A[3];
        em.push({ x: A[0] + ex * Math.cos(ang) - ey * Math.sin(ang), y: A[1] + ex * Math.sin(ang) + ey * Math.cos(ang), t, acc: Math.random() * 3 }); } });
    let P = [], last = performance.now(), raf = 0, vis = true, sc = 1;
    const size = () => { const dpr = Math.min(1.5, devicePixelRatio || 1), w = earth.clientWidth, h = earth.clientHeight; cv.width = w * dpr; cv.height = h * dpr; sc = w / 1672 * dpr; };
    size();
    const spawn = e => P.push({ x: e.x + (Math.random() - .5) * 10, y: e.y, vx: -6 - Math.random() * 6, vy: -9 - Math.random() * 8, life: 0, max: 6 + Math.random() * 5,
      s0: 14 + e.t * 16, s1: 70 + e.t * 110 + Math.random() * 40, a: .14 + e.t * .30, rot: Math.random() * 6.3, vr: (Math.random() - .5) * .25, k: Math.random() * spr.length | 0 });
    const tick = dt => { em.forEach(e => { e.acc += dt * (.25 + e.t * .9); while (e.acc > 1) { e.acc--; spawn(e); } }); P.forEach(p => p.life += dt); P = P.filter(p => p.life < p.max); };
    for (let i = 0; i < 160; i++) tick(.05);   // pemanasan: langsung berasap
    const draw = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of P) { const q = p.life / p.max, s = (p.s0 + (p.s1 - p.s0) * Math.sqrt(q)) * sc, al = p.a * Math.min(1, q * 6) * (1 - q) ** 1.4;
        ctx.globalAlpha = al; ctx.setTransform(1, 0, 0, 1, (p.x + p.vx * p.life) * sc, (p.y + p.vy * p.life) * sc); ctx.rotate(p.rot + p.vr * p.life); ctx.drawImage(spr[p.k], -s / 2, -s / 2, s, s); }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; };
    const step = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; tick(dt); draw(); if (vis) raf = requestAnimationFrame(step); };
    const go = () => { if (reduce) { draw(); return; } cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(step); };
    go();
    const io = new IntersectionObserver(es => { vis = es[0].isIntersecting && !document.hidden; if (vis) go(); }); io.observe(cv);
    const onVis = () => { vis = !document.hidden; if (vis) go(); }; document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(() => { size(); if (reduce) draw(); }); ro.observe(earth);
    smoke.stop = () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }

  window.G.smoke = smoke;
})();
