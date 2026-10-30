/* ===== Grafik tren bergaya hi-tech (Chart.js): garis halus bercahaya, area gradasi, crosshair, titik menyala ===== */
(() => {
  const C = { t: '#9B8CFF', p: '#3AA6F0', n: '#F0524F', z: '#8A97A6' };
  const BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const tgS = d => { const [, m, dd] = d.split('-'); return `${+dd} ${BL[m - 1]}`; };
  const tgL = d => { const [y, m, dd] = d.split('-'); return `${+dd} ${BL[m - 1]} ${y}`; };
  const glow = {
    id: 'hiGlow',
    beforeDatasetDraw(ch, a) { const ds = ch.data.datasets[a.index]; const c = ch.ctx; c.save(); c.shadowColor = ds.borderColor; c.shadowBlur = ds._glow || 8; },
    afterDatasetDraw(ch) { ch.ctx.restore(); },
    afterDraw(ch) { const act = ch.tooltip?.getActiveElements?.() || []; if (!act.length) return;
      const x = act[0].element.x, { top, bottom } = ch.chartArea, c = ch.ctx; c.save();
      c.setLineDash([3, 4]); c.strokeStyle = 'rgba(160,190,220,.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, top); c.lineTo(x, bottom); c.stroke(); c.restore(); }
  };
  const light = () => document.documentElement.dataset.theme === 'light';
  function hiTrend(canvas, perDay, opt = {}) {
    if (!canvas || !window.Chart) return null;
    Chart.getChart(canvas)?.destroy();
    const L = light(), tick = L ? '#5B6873' : '#8A97A6', grid = L ? 'rgba(4,7,10,.08)' : 'rgba(255,255,255,.07)';
    const fill = (c, a1) => ctx => { const ar = ctx.chart.chartArea; if (!ar) return c + '22';
      const g = ctx.chart.ctx.createLinearGradient(0, ar.top, 0, ar.bottom); g.addColorStop(0, c + a1); g.addColorStop(1, c + '00'); return g; };
    const line = (label, data, c, main) => ({ label, data, borderColor: c, borderWidth: main ? 2.4 : 1.8, tension: .42, fill: true,
      backgroundColor: fill(c, main ? '66' : '2E'), pointRadius: main ? 3 : 2.2, pointBackgroundColor: c, pointBorderColor: c,
      pointHoverRadius: main ? 7 : 5, pointHoverBorderWidth: 3, pointHoverBorderColor: '#fff', pointHoverBackgroundColor: c, _glow: main ? 14 : 7, order: main ? 0 : 1 });
    const sets = [line('Total', perDay.map(x => x.t), C.t, true), line('Positif', perDay.map(x => x.p), C.p), line('Negatif', perDay.map(x => x.n), C.n), line('Netral', perDay.map(x => x.z), C.z)];
    return new Chart(canvas, {
      type: 'line', data: { labels: perDay.map(x => tgS(x.d)), datasets: opt.noTotal ? sets.slice(1) : sets }, plugins: [glow],
      options: { maintainAspectRatio: false, responsive: true, animation: { duration: 700 }, interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 6 } },
        plugins: {
          legend: { display: opt.legend !== false, position: 'top', align: 'center', labels: { color: tick, usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 14, font: { size: 11 } } },
          tooltip: { backgroundColor: L ? 'rgba(255,255,255,.97)' : 'rgba(6,14,26,.94)', borderColor: L ? 'rgba(4,7,10,.12)' : 'rgba(80,160,255,.35)', borderWidth: 1, padding: 10,
            titleColor: L ? '#0F1A24' : '#fff', bodyColor: L ? '#334155' : '#C9D6E2', titleFont: { size: 15, weight: '700' }, bodyFont: { size: 11.5 }, displayColors: true, boxWidth: 7, boxHeight: 7, usePointStyle: true,
            callbacks: { title: it => (perDay[it[0].dataIndex]?.t ?? 0).toLocaleString('id-ID') + ' percakapan', beforeBody: it => tgL(perDay[it[0].dataIndex].d),
              label: i => i.dataset.label === 'Total' ? null : ` ${i.dataset.label}: ${i.raw.toLocaleString('id-ID')}` } } },
        scales: { x: { grid: { display: false }, ticks: { color: tick, maxRotation: 0, autoSkip: true, maxTicksLimit: opt.ticks || 8, font: { size: 10.5 } }, border: { color: grid } },
          y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, maxTicksLimit: 5, font: { size: 10.5 } }, border: { display: false } } } } });
  }
  // Versi umum: banyak seri bebas (mis. tren topik)
  function hiLines(canvas, dates, series) {
    if (!canvas || !window.Chart) return null;
    Chart.getChart(canvas)?.destroy();
    const L = light(), tick = L ? '#5B6873' : '#8A97A6', grid = L ? 'rgba(4,7,10,.08)' : 'rgba(255,255,255,.07)';
    const fill = c => ctx => { const ar = ctx.chart.chartArea; if (!ar) return c + '18';
      const g = ctx.chart.ctx.createLinearGradient(0, ar.top, 0, ar.bottom); g.addColorStop(0, c + '30'); g.addColorStop(1, c + '00'); return g; };
    return new Chart(canvas, { type: 'line', plugins: [glow],
      data: { labels: dates.map(tgS), datasets: series.map((s, i) => ({ label: s.label, data: s.data, borderColor: s.color, borderWidth: i === 0 ? 2.4 : 1.9, tension: .42, fill: true,
        backgroundColor: fill(s.color), pointRadius: 2.4, pointBackgroundColor: s.color, pointBorderColor: s.color, pointHoverRadius: 6, pointHoverBorderWidth: 3, pointHoverBorderColor: '#fff', _glow: i === 0 ? 12 : 8 })) },
      options: { maintainAspectRatio: false, responsive: true, animation: { duration: 700 }, interaction: { mode: 'index', intersect: false }, layout: { padding: { top: 6 } },
        plugins: { legend: { position: 'top', align: 'start', labels: { color: tick, usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 12, font: { size: 11 } } },
          tooltip: { backgroundColor: L ? 'rgba(255,255,255,.97)' : 'rgba(6,14,26,.94)', borderColor: L ? 'rgba(4,7,10,.12)' : 'rgba(80,160,255,.35)', borderWidth: 1, padding: 10,
            titleColor: L ? '#0F1A24' : '#fff', bodyColor: L ? '#334155' : '#C9D6E2', titleFont: { size: 13, weight: '700' }, bodyFont: { size: 11.5 }, boxWidth: 7, boxHeight: 7, usePointStyle: true,
            itemSort: (a, b) => b.raw - a.raw,
            callbacks: { title: it => tgL(dates[it[0].dataIndex]), label: i => ` ${i.dataset.label}: ${i.raw.toLocaleString('id-ID')}` } } },
        scales: { x: { grid: { display: false }, ticks: { color: tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 10.5 } }, border: { color: grid } },
          y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, maxTicksLimit: 5, font: { size: 10.5 } }, border: { display: false } } } } });
  }
  // Efek cahaya untuk semua grafik Chart.js lain (donut, bar, dll.)
  if (window.Chart && !Chart.registry.plugins.get('hiGlowAll')) Chart.register({ id: 'hiGlowAll',
    beforeDatasetDraw(ch, a) { if (ch.config.plugins?.includes?.(glow)) return; const ds = ch.data.datasets[a.index]; const col = typeof ds.borderColor === 'string' && ds.type !== 'doughnut' && ch.config.type !== 'doughnut' ? ds.borderColor : 'rgba(90,180,255,.55)';
      ch.ctx.save(); ch.ctx.shadowColor = col; ch.ctx.shadowBlur = 10; },
    afterDatasetDraw(ch) { if (ch.config.plugins?.includes?.(glow)) return; ch.ctx.restore(); } });
  window.G = Object.assign(window.G || {}, { hiTrend, hiLines });
})();
