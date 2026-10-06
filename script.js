document.addEventListener("DOMContentLoaded", () => {

  // ===========================
  // FUNCIONES MATEMÁTICAS
  // ===========================

  function calcIHH(shares) {
    return shares.reduce((acc, s) => acc + (s * 100) ** 2, 0);
  }
  function calcCRk(shares, k) {
    return [...shares].sort((a, b) => b - a).slice(0, k).reduce((acc, s) => acc + s * 100, 0);
  }
  function calcIEnorm(shares) {
    const N = shares.length;
    return -shares.reduce((acc, s) => acc + s * Math.log(s), 0) / Math.log(N);
  }
  function calcID(shares) {
    const N = shares.length;
    return (calcIHH(shares) / 10000 - 1 / N) / (1 - 1 / N);
  }
  function generateShares(N) {
    const alpha = 0.5;
    const gammas = Array.from({ length: N }, () => sampleGamma(alpha));
    const total = gammas.reduce((a, b) => a + b, 0);
    return gammas.map(g => g / total);
  }
  function sharesToPercent(shares, decimals = 2) {
    const factor = 10 ** decimals;
    const total = 100 * factor;
    const exact = shares.map(s => s * 100 * factor);
    const floored = exact.map(v => Math.floor(v));
    let remainder = total - floored.reduce((a, b) => a + b, 0);
    const indices = exact.map((v, i) => ({ i, frac: v - floored[i] }))
      .sort((a, b) => b.frac - a.frac).map(o => o.i);
    for (let j = 0; j < remainder; j++) floored[indices[j]] += 1;
    return floored.map(v => (v / factor).toFixed(decimals));
  }
  function sampleGamma(alpha) {
    if (alpha < 1) return sampleGamma(alpha + 1) * Math.random() ** (1 / alpha);
    const d = alpha - 1 / 3, c = 1 / Math.sqrt(9 * d);
    while (true) {
      let x, v;
      do { x = sampleNormal(); v = 1 + c * x; } while (v <= 0);
      v = v ** 3;
      const u = Math.random();
      if (u < 1 - 0.0331 * x ** 4) return d * v;
      if (Math.log(u) < 0.5 * x ** 2 + d * (1 - v + Math.log(v))) return d * v;
    }
  }
  function sampleNormal() {
    return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
  }

  window.MCX = { calcIHH, calcCRk, calcIEnorm, calcID, generateShares, sharesToPercent };

  // ===========================
  // AUDIO
  // ===========================

  const sndStartup = document.getElementById("snd-startup");
  const sndError   = document.getElementById("snd-error");
  const sndTada    = document.getElementById("snd-tada");
  function playSound(el) { el.currentTime = 0; el.play().catch(() => {}); }

  // ===========================
  // LOGON
  // ===========================

  const loginScreen = document.getElementById("login-screen");
  const desktop     = document.getElementById("desktop");

  loginScreen.addEventListener("click", () => {
    playSound(sndStartup);
    loginScreen.classList.add("hidden");
    desktop.classList.add("visible");
    setTimeout(() => { resizeCanvas(); resizeSharesCanvas(); }, 120);
  });

  // ===========================
  // RELOJ
  // ===========================

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    document.getElementById("tray-clock").textContent = `${h}:${m}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ===========================
  // ÍCONOS DEL ESCRITORIO
  // ===========================

  document.querySelectorAll(".desktop-icon").forEach(icon => {
    icon.addEventListener("click", e => {
      e.stopPropagation();
      document.querySelectorAll(".desktop-icon").forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".desktop-icon").forEach(i => i.classList.remove("selected"));
  });

  // ===========================
  // MENÚ INICIO
  // ===========================

  const startBtn   = document.getElementById("start-btn");
  const startMenu  = document.getElementById("start-menu");

  startBtn.addEventListener("click", e => {
    e.stopPropagation();
    startMenu.classList.toggle("hidden");
  });
  document.addEventListener("click", e => {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      startMenu.classList.add("hidden");
    }
  });

  // Apagar
  const shutdownModal = document.getElementById("shutdown-modal");

  document.getElementById("btn-shutdown").addEventListener("click", () => {
    startMenu.classList.add("hidden");
    shutdownModal.classList.remove("hidden");
  });
  function closeShutdown() { shutdownModal.classList.add("hidden"); }
  document.getElementById("btn-shutdown-cancel").addEventListener("click", closeShutdown);
  document.getElementById("btn-shutdown-cancel-x").addEventListener("click", closeShutdown);
  document.getElementById("btn-shutdown-confirm").addEventListener("click", () => {
    document.body.innerHTML = `
      <div style="background:#000;width:100vw;height:100vh;display:flex;
                  align-items:center;justify-content:center;">
        <div style="color:#fff;font-family:Tahoma,Arial,sans-serif;font-size:14px;
                    text-align:center;opacity:0;animation:fadeIn 0.8s ease 0.2s forwards;">
          <p style="font-size:18px;margin-bottom:12px;">Windows está apagando...</p>
          <p style="font-size:12px;color:#aaa;">Ahora puede apagar el equipo con seguridad.</p>
        </div>
      </div>
      <style>@keyframes fadeIn{to{opacity:1}}</style>`;
  });

  // Cerrar sesión
  document.getElementById("btn-logout").addEventListener("click", () => {
    location.reload();
  });

  // ===========================
  // MODAL XP GENÉRICO
  // ===========================

  function showModal({ title, body, btnLabel = "Aceptar", onClose } = {}) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;`;
    const win = document.createElement("div");
    win.style.cssText = `width:400px;background:#ece9d8;border:2px solid #003c74;
      border-radius:8px 8px 0 0;overflow:hidden;font-family:Tahoma,Arial,sans-serif;font-size:11px;
      box-shadow:2px 2px 0 #7ab4e8 inset,-1px -1px 0 #003c74 inset,4px 6px 18px rgba(0,0,0,0.55);`;
    const bar = document.createElement("div");
    bar.style.cssText = `background:linear-gradient(to right,#0a246a 0%,#3a6ecc 35%,
      #4a8ee8 50%,#3a6ecc 65%,#0a246a 100%);padding:5px 8px;display:flex;
      align-items:center;justify-content:space-between;user-select:none;`;
    const barText = document.createElement("span");
    barText.textContent = title;
    barText.style.cssText = `color:#fff;font-weight:bold;font-size:12px;
      text-shadow:1px 1px 2px rgba(0,0,0,.7);`;
    const barClose = document.createElement("button");
    barClose.textContent = "✕";
    barClose.style.cssText = `width:21px;height:21px;font-size:10px;font-weight:bold;
      border-radius:3px;border:1px solid #6a1010;cursor:pointer;color:#fff;
      background:linear-gradient(to bottom,#e05050 0%,#c03030 45%,#901010 100%);
      display:flex;align-items:center;justify-content:center;`;
    bar.appendChild(barText); bar.appendChild(barClose);
    const bodyEl = document.createElement("div");
    bodyEl.style.cssText = `padding:14px 16px 10px;line-height:1.6;`;
    bodyEl.innerHTML = body;
    const btnRow = document.createElement("div");
    btnRow.style.cssText = `padding:8px 16px 14px;display:flex;justify-content:flex-end;`;
    const btn = document.createElement("button");
    btn.textContent = btnLabel; btn.className = "xp-btn";
    const close = () => { overlay.remove(); if (onClose) onClose(); };
    btn.addEventListener("click", close);
    barClose.addEventListener("click", close);
    btnRow.appendChild(btn);
    win.appendChild(bar); win.appendChild(bodyEl); win.appendChild(btnRow);
    overlay.appendChild(win); document.body.appendChild(overlay);
  }

  // ===========================
  // UTILIDADES DE ERROR INLINE
  // ===========================

  function showError(containerEl, message) {
    clearError(containerEl); playSound(sndError);
    const div = document.createElement("div");
    div.className = "feedback-incorrect error-msg";
    div.textContent = message;
    containerEl.appendChild(div);
  }
  function clearError(containerEl) {
    const prev = containerEl.querySelector(".error-msg");
    if (prev) prev.remove();
  }

  // ===========================
  // REFERENCIAS DOM
  // ===========================

  const inputN          = document.getElementById("input-n");
  const inputIter       = document.getElementById("input-iter");
  const inputK          = document.getElementById("input-k");
  const cellK           = document.getElementById("cell-k");
  const selectIndicator = document.getElementById("select-indicator");
  const btnGenerar      = document.getElementById("btn-generar");
  const previewEl       = document.getElementById("preview-puntual");
  const configErrorEl   = document.getElementById("config-error");
  const iterWarningEl   = document.getElementById("iter-warning");
  const btnSimular      = document.getElementById("btn-simular");
  const casoStatsLine   = document.getElementById("caso-stats-line");
  const sharesStatsLine = document.getElementById("shares-stats-line");

  // ===========================
  // CONTROL k
  // ===========================

  function getK() { return parseInt(inputK.value, 10) || 4; }

  selectIndicator.addEventListener("change", () => {
    cellK.style.display = selectIndicator.value === "CR" ? "flex" : "none";
  });
  inputN.addEventListener("change", () => {
    const N = parseInt(inputN.value, 10);
    if (!isNaN(N) && N >= 2 && N <= 100) buildCasoFields(N);
  });

  // ===========================
  // ADVERTENCIA DE ITERACIONES
  // ===========================

  let iterWarningShown = false;

  function checkIterWarning(value) {
    if (value > 1000 && !iterWarningShown) {
      iterWarningShown = true;
      iterWarningEl.style.display = "block";
      playSound(sndError);
      showModal({
        title: "Advertencia de rendimiento",
        body: `<p style="margin-bottom:10px;">Ha configurado <strong>${value.toLocaleString()}</strong> iteraciones. Tenga en cuenta:</p>
          <ul style="padding-left:18px;line-height:2;">
            <li><strong>Impacto en rendimiento:</strong> volúmenes elevados pueden degradar la fluidez.</li>
            <li><strong>Latencia de respuesta:</strong> el tiempo aumenta proporcionalmente.</li>
            <li><strong>Consumo de recursos de cómputo:</strong> la carga sobre el hilo principal será mayor.</li>
          </ul>`,
        btnLabel: "Comprendo",
      });
    }
    if (value <= 1000) iterWarningEl.style.display = "none";
  }

  inputIter.addEventListener("change", () => {
    const val = parseInt(inputIter.value, 10);
    if (!isNaN(val)) checkIterWarning(val);
  });

  // ===========================
  // INDICADOR
  // ===========================

  function getIndicatorValue(shares, indicator) {
    switch (indicator) {
      case "IHH": return MCX.calcIHH(shares);
      case "CR":  return MCX.calcCRk(shares, getK());
      case "IE":  return MCX.calcIEnorm(shares);
      case "ID":  return MCX.calcID(shares);
    }
  }
  function getIndicatorLabel() {
    const ind = selectIndicator.value;
    return ind === "CR" ? `CR${getK()}` : ind;
  }
  const INDICATOR_META = {
    IHH: { unit: "puntos",  decimals: 1 },
    CR:  { unit: "%",       decimals: 2 },
    IE:  { unit: "(0–1)",   decimals: 4 },
    ID:  { unit: "(0–1)",   decimals: 4 },
  };
  function getMeta() {
    const ind = selectIndicator.value;
    return { label: getIndicatorLabel(), ...INDICATOR_META[ind] };
  }

  // ===========================
  // ESTADO
  // ===========================

  const ITER_MAX      = 10000;
  let simResults      = [];
  let punturalVal     = null;
  let activeMode      = "histo";
  let showPuntualLine = true;
  let histoBins       = [];   // [{min, max, count}] — para tooltip
  let histoGeometry   = {};   // {barW, minVal, step, PAD, ph, pw}

  // ===========================
  // CANVAS MC
  // ===========================

  const canvas        = document.getElementById("sim-canvas");
  const ctx           = canvas.getContext("2d");
  const chartTitle    = document.getElementById("chart-title");
  const statsLine     = document.getElementById("stats-line");
  const btnHisto      = document.getElementById("btn-histo");
  const btnDensity    = document.getElementById("btn-density");
  const btnToggleLine = document.getElementById("btn-toggle-line");

  function resizeCanvas() {
    const W = canvas.parentElement.clientWidth - 24;
    canvas.width  = Math.max(W, 200);
    canvas.height = Math.round(canvas.width * 0.45);
    if (simResults.length) renderChart(activeMode);
  }
  window.addEventListener("resize", () => { resizeCanvas(); resizeSharesCanvas(); });

  // ===========================
  // PREVIEW
  // ===========================

  function previewShares(shares, N, label) {
    const pcts = sharesToPercent(shares, 2);
    const sorted = shares.map((s, i) => ({ s, pct: pcts[i] })).sort((a, b) => b.s - a.s);
    const top = sorted.slice(0, Math.min(3, N));
    previewEl.innerHTML =
      `<strong>${label}:</strong> ${N} empresa${N !== 1 ? "s" : ""} &nbsp;|&nbsp; Top cuotas: ` +
      top.map((o, i) => `s<sub>${i+1}</sub> = ${o.pct}%`).join("&emsp;");
    previewEl.style.display = "block";
  }

  btnGenerar.addEventListener("click", () => {
    clearError(configErrorEl);
    const N = parseInt(inputN.value, 10);
    if (isNaN(N) || N < 2 || N > 100) {
      showError(configErrorEl, "El número de empresas debe ser un entero entre 2 y 100."); return;
    }
    MCX.currentShares = MCX.generateShares(N);
    previewShares(MCX.currentShares, N, "Vector generado");
    renderSharesChart(sharesMode);
  });

  // ===========================
  // SIMULACIÓN
  // ===========================

  btnSimular.addEventListener("click", () => {
    clearError(configErrorEl);
    const N    = parseInt(inputN.value, 10);
    const iter = parseInt(inputIter.value, 10);
    const ind  = selectIndicator.value;

    if (isNaN(N) || N < 2 || N > 100) {
      showError(configErrorEl, "El número de empresas debe ser un entero entre 2 y 100."); return;
    }
    if (isNaN(iter) || iter < 100) {
      showError(configErrorEl, "El número de iteraciones debe ser al menos 100."); return;
    }
    if (iter > ITER_MAX) {
      showError(configErrorEl,
        `El límite es ${ITER_MAX.toLocaleString()} iteraciones. Consulta la nota debajo del botón.`); return;
    }
    if (ind === "CR") {
      const k = getK();
      if (isNaN(k) || k < 1 || k > 100) {
        showError(configErrorEl, "k debe estar entre 1 y 100."); return;
      }
      if (k > N) {
        showError(configErrorEl,
          `k (${k}) no puede superar N (${N}). Con k > N el CR${k} equivale al CR${N}.`); return;
      }
    }

    if (!MCX.currentShares || MCX.currentShares.length !== N) {
      MCX.currentShares = MCX.generateShares(N);
      previewShares(MCX.currentShares, N, "Vector generado automáticamente");
    }

    // Cursor de espera
    document.body.classList.add("simulating");

    // Defer un frame para que el cursor cambie antes del cómputo pesado
    requestAnimationFrame(() => {
      setTimeout(() => {
        simResults = [];
        for (let i = 0; i < iter; i++) {
          simResults.push(getIndicatorValue(MCX.generateShares(N), ind));
        }
        punturalVal = getIndicatorValue(MCX.currentShares, ind);

        document.body.classList.remove("simulating");
        resizeCanvas();
        renderChart(activeMode);
        updateStats();
        renderSharesChart(sharesMode);
        updateSharesStats();
      }, 30);
    });
  });

  // ===========================
  // ESTADÍSTICAS
  // ===========================

  function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
  function percentile(sorted, val) {
    let count = 0;
    for (const v of sorted) { if (v <= val) count++; }
    return (count / sorted.length * 100).toFixed(1);
  }

  function updateStats() {
    if (!simResults.length) return;
    const meta   = getMeta();
    const sorted = [...simResults].sort((a, b) => a - b);
    const mu     = mean(simResults);
    const sd     = Math.sqrt(simResults.reduce((a, v) => a + (v - mu) ** 2, 0) / simResults.length);
    const pct    = percentile(sorted, punturalVal);

    statsLine.innerHTML =
      `<strong>Distribución simulada —</strong> ` +
      `Media: <strong>${mu.toFixed(meta.decimals)} ${meta.unit}</strong>` +
      `&emsp;Desv. estándar: <strong>${sd.toFixed(meta.decimals)}</strong>` +
      `&emsp;Min: <strong>${Math.min(...simResults).toFixed(meta.decimals)}</strong>` +
      `&emsp;Max: <strong>${Math.max(...simResults).toFixed(meta.decimals)}</strong>`;

    casoStatsLine.style.display = "block";
    casoStatsLine.innerHTML =
      `<strong>Caso particular —</strong> ` +
      `${meta.label}: <strong style="color:#1a7a1a">${punturalVal.toFixed(meta.decimals)} ${meta.unit}</strong>` +
      `&emsp;|&emsp;Percentil: <strong style="color:#1a7a1a">${pct}</strong> ` +
      `(supera al ${pct}% de los mercados simulados)`;
  }

  function updateSharesStats() {
    if (!MCX.currentShares || punturalVal === null) return;
    const meta   = getMeta();
    const shares = MCX.currentShares;
    const pcts   = sharesToPercent(shares, 2);
    const N      = shares.length;
    let pctStr   = "—";
    if (simResults.length) {
      const sorted = [...simResults].sort((a, b) => a - b);
      pctStr = percentile(sorted, punturalVal);
    }
    const sorted = shares.map((s, i) => ({ s, pct: pcts[i] })).sort((a, b) => b.s - a.s);
    const cuotasStr = sorted.map((o, i) => `s<sub>${i+1}</sub>=${o.pct}%`).join(" &nbsp; ");

    sharesStatsLine.style.display = "block";
    sharesStatsLine.innerHTML =
      `<strong>${meta.label} del caso:</strong> ` +
      `<strong style="color:#1a7a1a">${punturalVal.toFixed(meta.decimals)} ${meta.unit}</strong>` +
      `&emsp;|&emsp;Percentil MC: <strong style="color:#1a7a1a">${pctStr}</strong>` +
      `<br><strong>Cuotas (desc.):</strong> ${cuotasStr}`;
  }

  // ===========================
  // TOGGLE LÍNEA VERDE
  // ===========================

  btnToggleLine.addEventListener("click", () => {
    showPuntualLine = !showPuntualLine;
    btnToggleLine.textContent = showPuntualLine ? "Ocultar línea del caso" : "Mostrar línea del caso";
    if (simResults.length) renderChart(activeMode);
  });

  // ===========================
  // TRANSICIÓN SUAVE ENTRE MODOS
  // ===========================

  function switchChart(newMode) {
    if (activeMode === newMode && simResults.length) return;
    canvas.classList.add("fading");
    setTimeout(() => {
      canvas.classList.remove("fading");
      renderChart(newMode);
    }, 160);
  }

  function switchSharesChart(newMode) {
    if (sharesMode === newMode && MCX.currentShares) return;
    sharesCanvas.classList.add("fading");
    setTimeout(() => {
      sharesCanvas.classList.remove("fading");
      renderSharesChart(newMode);
    }, 160);
  }

  btnHisto.addEventListener("click", () => {
    btnHisto.classList.add("active-mode"); btnDensity.classList.remove("active-mode");
    switchChart("histo");
  });
  btnDensity.addEventListener("click", () => {
    btnDensity.classList.add("active-mode"); btnHisto.classList.remove("active-mode");
    switchChart("density");
  });

  // ===========================
  // RENDERIZADO MC
  // ===========================

  const PAD = { top: 36, right: 24, bottom: 52, left: 58 };

  function renderChart(mode) {
    activeMode = mode;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!simResults.length) return;

    const meta   = getMeta();
    chartTitle.textContent = `${meta.label} — ${simResults.length.toLocaleString()} iteraciones`;

    const pw = W - PAD.left - PAD.right;
    const ph = H - PAD.top  - PAD.bottom;
    const minVal = Math.min(...simResults);
    const maxVal = Math.max(...simResults);
    const range  = maxVal - minVal || 1;

    let maxFreq;
    if (mode === "histo") maxFreq = drawHistogram(ctx, pw, ph, minVal, range);
    else                  maxFreq = drawDensity(ctx, pw, ph, minVal, range);

    drawAxesLabels(ctx, W, H, pw, ph, minVal, maxVal, maxFreq, meta, mode);
    if (showPuntualLine) drawPuntualLine(ctx, W, H, pw, ph, minVal, range, meta);
  }

  function drawHistogram(ctx, pw, ph, minVal, range) {
    const bins  = Math.ceil(Math.sqrt(simResults.length));
    const step  = range / bins;
    const counts = new Array(bins).fill(0);
    for (const v of simResults) {
      let b = Math.floor((v - minVal) / step);
      if (b >= bins) b = bins - 1;
      counts[b]++;
    }
    const maxCount = Math.max(...counts);
    const barW = pw / bins;

    // Guardar geometría para tooltip
    histoBins = counts.map((count, b) => ({
      min: minVal + b * step,
      max: minVal + (b + 1) * step,
      count,
    }));
    histoGeometry = { barW, minVal, step, bins, ph, pw };

    ctx.save();
    for (let b = 0; b < bins; b++) {
      const bh = (counts[b] / maxCount) * ph;
      const x  = PAD.left + b * barW;
      const y  = PAD.top  + ph - bh;
      const r  = 3;
      ctx.fillStyle   = "rgba(58,110,204,0.65)";
      ctx.strokeStyle = "#1a4a9a";
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + bh); ctx.lineTo(x, y + bh);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    return maxCount;
  }

  function drawDensity(ctx, pw, ph, minVal, range) {
    const n  = simResults.length;
    const mu = mean(simResults);
    const sd = Math.sqrt(simResults.reduce((a, v) => a + (v - mu) ** 2, 0) / n);
    const h  = 1.06 * sd * Math.pow(n, -0.2);
    const pts = 200, ys = [];
    for (let i = 0; i <= pts; i++) {
      const x = minVal + (i / pts) * range;
      let density = 0;
      for (const v of simResults) { const u = (x - v) / h; density += Math.exp(-0.5 * u * u); }
      ys.push(density / (n * h * Math.sqrt(2 * Math.PI)));
    }
    const maxY = Math.max(...ys);
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = PAD.left + (i / pts) * pw;
      const cy = PAD.top  + ph - (ys[i] / maxY) * ph;
      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    }
    ctx.lineTo(PAD.left + pw, PAD.top + ph);
    ctx.lineTo(PAD.left,      PAD.top + ph);
    ctx.closePath();
    ctx.fillStyle = "rgba(58,110,204,0.35)"; ctx.fill();
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = PAD.left + (i / pts) * pw;
      const cy = PAD.top  + ph - (ys[i] / maxY) * ph;
      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = "#1a4a9a"; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    histoBins = []; // sin tooltip en densidad
    return null;
  }

  function drawAxesLabels(ctx, W, H, pw, ph, minVal, maxVal, maxFreq, meta, mode) {
    ctx.save();
    ctx.strokeStyle = "#888"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top + ph); ctx.lineTo(PAD.left + pw, PAD.top + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top);      ctx.lineTo(PAD.left, PAD.top + ph);      ctx.stroke();
    ctx.fillStyle = "#333"; ctx.font = "10px Tahoma, Arial";
    ctx.textAlign = "left";   ctx.fillText(minVal.toFixed(meta.decimals), PAD.left, PAD.top + ph + 14);
    ctx.textAlign = "right";  ctx.fillText(maxVal.toFixed(meta.decimals), PAD.left + pw, PAD.top + ph + 14);
    ctx.textAlign = "center"; ctx.fillText(`${meta.label} (${meta.unit})`, PAD.left + pw / 2, H - 8);
    ctx.save();
    ctx.translate(12, PAD.top + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center";
    ctx.fillText(mode === "histo" ? "Frecuencia" : "Densidad", 0, 0);
    ctx.restore();
    if (maxFreq !== null) {
      ctx.textAlign = "right";
      ctx.fillText(maxFreq, PAD.left - 4, PAD.top + 4);
      ctx.fillText("0", PAD.left - 4, PAD.top + ph);
    }
    ctx.restore();
  }

  function drawPuntualLine(ctx, W, H, pw, ph, minVal, range, meta) {
    if (punturalVal === null) return;
    const sorted = [...simResults].sort((a, b) => a - b);
    const pct    = percentile(sorted, punturalVal);
    const x      = PAD.left + ((punturalVal - minVal) / range) * pw;

    ctx.save();
    ctx.strokeStyle = "#1a8a1a"; ctx.lineWidth = 2.5; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + ph); ctx.stroke();
    ctx.setLineDash([]);

    const label = `${meta.label}=${punturalVal.toFixed(meta.decimals)} | p${pct}`;
    ctx.font = "bold 10px Tahoma, Arial";
    const tw = ctx.measureText(label).width;
    const lx = x + 5 + tw > PAD.left + pw ? x - tw - 7 : x + 5;

    ctx.fillStyle = "rgba(240,255,240,0.90)"; ctx.fillRect(lx - 2, PAD.top + 6, tw + 4, 14);
    ctx.strokeStyle = "#1a8a1a"; ctx.lineWidth = 0.5; ctx.strokeRect(lx - 2, PAD.top + 6, tw + 4, 14);
    ctx.fillStyle = "#1a6a1a"; ctx.textAlign = "left"; ctx.fillText(label, lx, PAD.top + 17);
    ctx.restore();
  }

  // ===========================
  // TOOLTIP HISTOGRAMA
  // ===========================

  const tooltip = document.getElementById("histo-tooltip");

  canvas.addEventListener("mousemove", e => {
    if (!histoBins.length || activeMode !== "histo") { tooltip.classList.remove("visible"); return; }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const { barW, ph } = histoGeometry;

    const b = Math.floor((mx - PAD.left) / barW);
    if (b < 0 || b >= histoBins.length || my < PAD.top || my > PAD.top + ph) {
      tooltip.classList.remove("visible"); return;
    }
    const bin  = histoBins[b];
    const meta = getMeta();
    const pct  = (bin.count / simResults.length * 100).toFixed(1);
    tooltip.innerHTML =
      `Rango: [${bin.min.toFixed(meta.decimals)}, ${bin.max.toFixed(meta.decimals)})<br>` +
      `Frecuencia: <strong>${bin.count}</strong><br>` +
      `% del total: <strong>${pct}%</strong>`;
    tooltip.classList.add("visible");

    // Posición: seguir cursor, nunca salirse de pantalla
    const tx = e.clientX + 12;
    const ty = e.clientY + 12;
    const tw2 = tooltip.offsetWidth;
    const th2 = tooltip.offsetHeight;
    tooltip.style.left = (tx + tw2 > window.innerWidth  ? tx - tw2 - 20 : tx) + "px";
    tooltip.style.top  = (ty + th2 > window.innerHeight ? ty - th2 - 20 : ty) + "px";
  });

  canvas.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));

  // ===========================
  // CANVAS DE CUOTAS
  // ===========================

  const sharesCanvas  = document.getElementById("shares-canvas");
  const sharesCtx     = sharesCanvas.getContext("2d");
  const btnSharesBars = document.getElementById("btn-shares-bars");
  const btnSharesDens = document.getElementById("btn-shares-density");
  const sharesEmpty   = document.getElementById("shares-empty-note");
  let sharesMode      = "bars";

  const SPAD = { top: 30, right: 16, bottom: 48, left: 46 };

  function resizeSharesCanvas() {
    const W = sharesCanvas.parentElement.clientWidth - 24;
    sharesCanvas.width  = Math.max(W, 160);
    sharesCanvas.height = Math.round(sharesCanvas.width * 0.5);
    if (MCX.currentShares) renderSharesChart(sharesMode);
  }

  function renderSharesChart(mode) {
    sharesMode = mode;
    sharesCanvas.style.display = "block";
    sharesEmpty.style.display  = "none";
    const W = sharesCanvas.width, H = sharesCanvas.height;
    sharesCtx.clearRect(0, 0, W, H);
    const pw = W - SPAD.left - SPAD.right;
    const ph = H - SPAD.top  - SPAD.bottom;
    const N  = MCX.currentShares.length;
    if (mode === "bars") drawSharesBars(MCX.currentShares, N, pw, ph, W, H);
    else                 drawSharesDensity(MCX.currentShares, pw, ph, W, H);
  }

  function drawSharesBars(shares, N, pw, ph, W, H) {
    const sorted = [...shares].sort((a, b) => b - a);
    const maxVal = sorted[0] * 100;
    const barW   = pw / N;
    sharesCtx.save();
    for (let i = 0; i < N; i++) {
      const pct = sorted[i] * 100;
      const bh  = (pct / maxVal) * ph;
      const x   = SPAD.left + i * barW, y = SPAD.top + ph - bh, r = 2;
      sharesCtx.fillStyle = "rgba(58,110,204,0.70)"; sharesCtx.strokeStyle = "#1a4a9a"; sharesCtx.lineWidth = 0.6;
      sharesCtx.beginPath();
      sharesCtx.moveTo(x + r, y); sharesCtx.lineTo(x + barW - r, y);
      sharesCtx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      sharesCtx.lineTo(x + barW, y + bh); sharesCtx.lineTo(x, y + bh);
      sharesCtx.lineTo(x, y + r); sharesCtx.quadraticCurveTo(x, y, x + r, y);
      sharesCtx.closePath(); sharesCtx.fill(); sharesCtx.stroke();
      if (barW >= 14) {
        sharesCtx.fillStyle = "#333"; sharesCtx.font = "9px Tahoma, Arial"; sharesCtx.textAlign = "center";
        sharesCtx.fillText(i + 1, x + barW / 2, SPAD.top + ph + 12);
      }
    }
    sharesCtx.restore();
    drawSharesAxes(W, H, pw, ph, 0, maxVal, maxVal, "Empresa (ord. desc.)", "Cuota (%)");
  }

  function drawSharesDensity(shares, pw, ph, W, H) {
    const pcts  = shares.map(s => s * 100);
    const n     = pcts.length;
    const mu    = pcts.reduce((a, b) => a + b, 0) / n;
    const sd    = Math.sqrt(pcts.reduce((a, v) => a + (v - mu) ** 2, 0) / n) || 0.01;
    const h     = 1.06 * sd * Math.pow(n, -0.2);
    const minV  = Math.min(...pcts), maxV = Math.max(...pcts);
    const range = maxV - minV || 0.01;
    const pts = 200, ys = [];
    for (let i = 0; i <= pts; i++) {
      const x = minV + (i / pts) * range;
      let density = 0;
      for (const v of pcts) { const u = (x - v) / h; density += Math.exp(-0.5 * u * u); }
      ys.push(density / (n * h * Math.sqrt(2 * Math.PI)));
    }
    const maxY = Math.max(...ys);
    sharesCtx.save();
    sharesCtx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = SPAD.left + (i / pts) * pw;
      const cy = SPAD.top  + ph - (ys[i] / maxY) * ph;
      i === 0 ? sharesCtx.moveTo(cx, cy) : sharesCtx.lineTo(cx, cy);
    }
    sharesCtx.lineTo(SPAD.left + pw, SPAD.top + ph); sharesCtx.lineTo(SPAD.left, SPAD.top + ph);
    sharesCtx.closePath(); sharesCtx.fillStyle = "rgba(58,110,204,0.35)"; sharesCtx.fill();
    sharesCtx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = SPAD.left + (i / pts) * pw;
      const cy = SPAD.top  + ph - (ys[i] / maxY) * ph;
      i === 0 ? sharesCtx.moveTo(cx, cy) : sharesCtx.lineTo(cx, cy);
    }
    sharesCtx.strokeStyle = "#1a4a9a"; sharesCtx.lineWidth = 2; sharesCtx.stroke();
    sharesCtx.restore();
    drawSharesAxes(W, H, pw, ph, minV, maxV, null, "Cuota (%)", "Densidad");

    // Línea verde: cuota media
    if (punturalVal !== null && MCX.currentShares) {
      const muCuota = (MCX.currentShares.reduce((a, b) => a + b, 0) / MCX.currentShares.length) * 100;
      const xLine = SPAD.left + ((muCuota - minV) / range) * pw;
      sharesCtx.save();
      sharesCtx.strokeStyle = "#1a8a1a"; sharesCtx.lineWidth = 2.5; sharesCtx.setLineDash([6, 3]);
      sharesCtx.beginPath(); sharesCtx.moveTo(xLine, SPAD.top); sharesCtx.lineTo(xLine, SPAD.top + ph); sharesCtx.stroke();
      sharesCtx.setLineDash([]);
      const lbl = `μ=${muCuota.toFixed(2)}%`;
      sharesCtx.font = "bold 9px Tahoma, Arial";
      const tw = sharesCtx.measureText(lbl).width;
      const lx = xLine + 4 + tw > SPAD.left + pw ? xLine - tw - 5 : xLine + 4;
      sharesCtx.fillStyle = "rgba(240,255,240,0.90)"; sharesCtx.fillRect(lx - 2, SPAD.top + 5, tw + 4, 13);
      sharesCtx.strokeStyle = "#1a8a1a"; sharesCtx.lineWidth = 0.5; sharesCtx.strokeRect(lx - 2, SPAD.top + 5, tw + 4, 13);
      sharesCtx.fillStyle = "#1a6a1a"; sharesCtx.textAlign = "left"; sharesCtx.fillText(lbl, lx, SPAD.top + 15);
      sharesCtx.restore();
    }
  }

  function drawSharesAxes(W, H, pw, ph, minV, maxV, maxFreq, xLabel, yLabel) {
    sharesCtx.save();
    sharesCtx.strokeStyle = "#888"; sharesCtx.lineWidth = 1;
    sharesCtx.beginPath(); sharesCtx.moveTo(SPAD.left, SPAD.top + ph); sharesCtx.lineTo(SPAD.left + pw, SPAD.top + ph); sharesCtx.stroke();
    sharesCtx.beginPath(); sharesCtx.moveTo(SPAD.left, SPAD.top); sharesCtx.lineTo(SPAD.left, SPAD.top + ph); sharesCtx.stroke();
    sharesCtx.fillStyle = "#333"; sharesCtx.font = "9px Tahoma, Arial";
    sharesCtx.textAlign = "left";   sharesCtx.fillText(minV.toFixed(1) + "%", SPAD.left, SPAD.top + ph + 12);
    sharesCtx.textAlign = "right";  sharesCtx.fillText(maxV.toFixed(1) + "%", SPAD.left + pw, SPAD.top + ph + 12);
    sharesCtx.textAlign = "center"; sharesCtx.fillText(xLabel, SPAD.left + pw / 2, H - 6);
    sharesCtx.save();
    sharesCtx.translate(11, SPAD.top + ph / 2); sharesCtx.rotate(-Math.PI / 2); sharesCtx.textAlign = "center";
    sharesCtx.fillText(yLabel, 0, 0); sharesCtx.restore();
    if (maxFreq !== null) {
      sharesCtx.textAlign = "right";
      sharesCtx.fillText(maxFreq.toFixed(1) + "%", SPAD.left - 3, SPAD.top + 4);
      sharesCtx.fillText("0%", SPAD.left - 3, SPAD.top + ph);
    }
    sharesCtx.restore();
  }

  btnSharesBars.addEventListener("click", () => {
    btnSharesBars.classList.add("active-mode"); btnSharesDens.classList.remove("active-mode");
    if (MCX.currentShares) switchSharesChart("bars");
  });
  btnSharesDens.addEventListener("click", () => {
    btnSharesDens.classList.add("active-mode"); btnSharesBars.classList.remove("active-mode");
    if (MCX.currentShares) switchSharesChart("density");
  });

  // ===========================
  // VISTA AMPLIADA
  // ===========================

  const expandOverlay     = document.getElementById("expand-overlay");
  const expandCanvas      = document.getElementById("expand-canvas");
  const expandCtx         = expandCanvas.getContext("2d");
  const expandTitle       = document.getElementById("expand-title");
  const expandScaler      = document.getElementById("expand-canvas-scaler");
  const btnExpandClose    = document.getElementById("btn-expand-close");
  const btnZoomIn         = document.getElementById("btn-zoom-in");
  const btnZoomOut        = document.getElementById("btn-zoom-out");
  const btnZoomReset      = document.getElementById("btn-zoom-reset");
  const zoomLabel         = document.getElementById("zoom-label");

  let expandZoom   = 1.0;
  let expandSource = null; // "sim" | "shares"

  function openExpand(source) {
    expandSource = source;
    expandZoom   = 1.0;
    expandScaler.style.transform = "scale(1)";
    zoomLabel.textContent = "1.0×";

    // Dimensionar el canvas de expand al área disponible
    const wrap = document.getElementById("expand-canvas-wrap");
    const W = Math.round(wrap.clientWidth  - 20);
    const H = Math.round(wrap.clientHeight - 20);
    expandCanvas.width  = W;
    expandCanvas.height = H;

    if (source === "sim") {
      expandTitle.textContent = chartTitle.textContent || "Gráfico Monte Carlo";
      drawExpandSim(W, H);
    } else {
      expandTitle.textContent = "Distribución de Cuotas del Caso Particular";
      drawExpandShares(W, H);
    }

    expandOverlay.classList.remove("hidden");
  }

  function closeExpand() { expandOverlay.classList.add("hidden"); }

  function drawExpandSim(W, H) {
    if (!simResults.length) { expandCtx.clearRect(0, 0, W, H); return; }
    const meta   = getMeta();
    const pw = W - PAD.left - PAD.right;
    const ph = H - PAD.top  - PAD.bottom;
    const minVal = Math.min(...simResults);
    const maxVal = Math.max(...simResults);
    const range  = maxVal - minVal || 1;

    expandCtx.clearRect(0, 0, W, H);

    let maxFreq;
    if (activeMode === "histo") maxFreq = drawExpandHistogram(pw, ph, minVal, range);
    else                        maxFreq = drawExpandDensity(pw, ph, minVal, range);

    // Reutilizamos drawAxesLabels con expandCtx inline
    drawExpandAxes(W, H, pw, ph, minVal, maxVal, maxFreq, meta, activeMode);
    if (showPuntualLine) drawExpandPuntualLine(W, H, pw, ph, minVal, range, meta);
  }

  function drawExpandHistogram(pw, ph, minVal, range) {
    const bins   = Math.ceil(Math.sqrt(simResults.length));
    const step   = range / bins;
    const counts = new Array(bins).fill(0);
    for (const v of simResults) {
      let b = Math.floor((v - minVal) / step); if (b >= bins) b = bins - 1; counts[b]++;
    }
    const maxCount = Math.max(...counts);
    const barW = pw / bins;
    expandCtx.save();
    for (let b = 0; b < bins; b++) {
      const bh = (counts[b] / maxCount) * ph;
      const x = PAD.left + b * barW, y = PAD.top + ph - bh, r = 3;
      expandCtx.fillStyle = "rgba(58,110,204,0.65)"; expandCtx.strokeStyle = "#1a4a9a"; expandCtx.lineWidth = 0.8;
      expandCtx.beginPath();
      expandCtx.moveTo(x + r, y); expandCtx.lineTo(x + barW - r, y);
      expandCtx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      expandCtx.lineTo(x + barW, y + bh); expandCtx.lineTo(x, y + bh);
      expandCtx.lineTo(x, y + r); expandCtx.quadraticCurveTo(x, y, x + r, y);
      expandCtx.closePath(); expandCtx.fill(); expandCtx.stroke();
    }
    expandCtx.restore();
    return maxCount;
  }

  function drawExpandDensity(pw, ph, minVal, range) {
    const n = simResults.length, mu = mean(simResults);
    const sd = Math.sqrt(simResults.reduce((a, v) => a + (v - mu) ** 2, 0) / n);
    const h = 1.06 * sd * Math.pow(n, -0.2), pts = 200, ys = [];
    for (let i = 0; i <= pts; i++) {
      const x = minVal + (i / pts) * range;
      let d = 0; for (const v of simResults) { const u = (x - v) / h; d += Math.exp(-0.5 * u * u); }
      ys.push(d / (n * h * Math.sqrt(2 * Math.PI)));
    }
    const maxY = Math.max(...ys);
    expandCtx.save();
    expandCtx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = PAD.left + (i / pts) * pw, cy = PAD.top + ph - (ys[i] / maxY) * ph;
      i === 0 ? expandCtx.moveTo(cx, cy) : expandCtx.lineTo(cx, cy);
    }
    expandCtx.lineTo(PAD.left + pw, PAD.top + ph); expandCtx.lineTo(PAD.left, PAD.top + ph);
    expandCtx.closePath(); expandCtx.fillStyle = "rgba(58,110,204,0.35)"; expandCtx.fill();
    expandCtx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = PAD.left + (i / pts) * pw, cy = PAD.top + ph - (ys[i] / maxY) * ph;
      i === 0 ? expandCtx.moveTo(cx, cy) : expandCtx.lineTo(cx, cy);
    }
    expandCtx.strokeStyle = "#1a4a9a"; expandCtx.lineWidth = 2; expandCtx.stroke();
    expandCtx.restore();
    return null;
  }

  function drawExpandAxes(W, H, pw, ph, minVal, maxVal, maxFreq, meta, mode) {
    expandCtx.save();
    expandCtx.strokeStyle = "#888"; expandCtx.lineWidth = 1;
    expandCtx.beginPath(); expandCtx.moveTo(PAD.left, PAD.top + ph); expandCtx.lineTo(PAD.left + pw, PAD.top + ph); expandCtx.stroke();
    expandCtx.beginPath(); expandCtx.moveTo(PAD.left, PAD.top); expandCtx.lineTo(PAD.left, PAD.top + ph); expandCtx.stroke();
    expandCtx.fillStyle = "#333"; expandCtx.font = "11px Tahoma, Arial";
    expandCtx.textAlign = "left";   expandCtx.fillText(minVal.toFixed(meta.decimals), PAD.left, PAD.top + ph + 16);
    expandCtx.textAlign = "right";  expandCtx.fillText(maxVal.toFixed(meta.decimals), PAD.left + pw, PAD.top + ph + 16);
    expandCtx.textAlign = "center"; expandCtx.fillText(`${meta.label} (${meta.unit})`, PAD.left + pw / 2, H - 8);
    expandCtx.save();
    expandCtx.translate(14, PAD.top + ph / 2); expandCtx.rotate(-Math.PI / 2); expandCtx.textAlign = "center";
    expandCtx.fillText(mode === "histo" ? "Frecuencia" : "Densidad", 0, 0); expandCtx.restore();
    if (maxFreq !== null) {
      expandCtx.textAlign = "right";
      expandCtx.fillText(maxFreq, PAD.left - 5, PAD.top + 5);
      expandCtx.fillText("0", PAD.left - 5, PAD.top + ph);
    }
    expandCtx.restore();
  }

  function drawExpandPuntualLine(W, H, pw, ph, minVal, range, meta) {
    if (punturalVal === null) return;
    const sorted = [...simResults].sort((a, b) => a - b);
    const pct    = percentile(sorted, punturalVal);
    const x      = PAD.left + ((punturalVal - minVal) / range) * pw;
    expandCtx.save();
    expandCtx.strokeStyle = "#1a8a1a"; expandCtx.lineWidth = 2.5; expandCtx.setLineDash([6, 3]);
    expandCtx.beginPath(); expandCtx.moveTo(x, PAD.top); expandCtx.lineTo(x, PAD.top + ph); expandCtx.stroke();
    expandCtx.setLineDash([]);
    const label = `${meta.label}=${punturalVal.toFixed(meta.decimals)} | p${pct}`;
    expandCtx.font = "bold 11px Tahoma, Arial";
    const tw = expandCtx.measureText(label).width;
    const lx = x + 6 + tw > PAD.left + pw ? x - tw - 8 : x + 6;
    expandCtx.fillStyle = "rgba(240,255,240,0.90)"; expandCtx.fillRect(lx - 2, PAD.top + 8, tw + 4, 16);
    expandCtx.strokeStyle = "#1a8a1a"; expandCtx.lineWidth = 0.5; expandCtx.strokeRect(lx - 2, PAD.top + 8, tw + 4, 16);
    expandCtx.fillStyle = "#1a6a1a"; expandCtx.textAlign = "left"; expandCtx.fillText(label, lx, PAD.top + 21);
    expandCtx.restore();
  }

  function drawExpandShares(W, H) {
    if (!MCX.currentShares) { expandCtx.clearRect(0, 0, W, H); return; }
    const pw = W - SPAD.left - SPAD.right;
    const ph = H - SPAD.top  - SPAD.bottom;
    const shares = MCX.currentShares;
    expandCtx.clearRect(0, 0, W, H);

    if (sharesMode === "bars") {
      const sorted = [...shares].sort((a, b) => b - a);
      const maxVal = sorted[0] * 100, N = sorted.length, barW = pw / N;
      expandCtx.save();
      for (let i = 0; i < N; i++) {
        const pct = sorted[i] * 100, bh = (pct / maxVal) * ph;
        const x = SPAD.left + i * barW, y = SPAD.top + ph - bh, r = 3;
        expandCtx.fillStyle = "rgba(58,110,204,0.70)"; expandCtx.strokeStyle = "#1a4a9a"; expandCtx.lineWidth = 0.8;
        expandCtx.beginPath();
        expandCtx.moveTo(x + r, y); expandCtx.lineTo(x + barW - r, y);
        expandCtx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        expandCtx.lineTo(x + barW, y + bh); expandCtx.lineTo(x, y + bh);
        expandCtx.lineTo(x, y + r); expandCtx.quadraticCurveTo(x, y, x + r, y);
        expandCtx.closePath(); expandCtx.fill(); expandCtx.stroke();
        if (barW >= 12) {
          expandCtx.fillStyle = "#333"; expandCtx.font = "10px Tahoma, Arial"; expandCtx.textAlign = "center";
          expandCtx.fillText(i + 1, x + barW / 2, SPAD.top + ph + 14);
        }
      }
      expandCtx.restore();
      // Ejes shares en expand
      drawExpandSharesAxes(W, H, pw, ph, 0, maxVal, maxVal, "Empresa (ord. desc.)", "Cuota (%)");
    } else {
      // Density en expand — reutilizar lógica
      const pcts = shares.map(s => s * 100);
      const n = pcts.length, mu2 = pcts.reduce((a, b) => a + b, 0) / n;
      const sd2 = Math.sqrt(pcts.reduce((a, v) => a + (v - mu2) ** 2, 0) / n) || 0.01;
      const h2 = 1.06 * sd2 * Math.pow(n, -0.2);
      const minV = Math.min(...pcts), maxV = Math.max(...pcts), range2 = maxV - minV || 0.01;
      const pts = 200, ys = [];
      for (let i = 0; i <= pts; i++) {
        const x = minV + (i / pts) * range2;
        let d = 0; for (const v of pcts) { const u = (x - v) / h2; d += Math.exp(-0.5 * u * u); }
        ys.push(d / (n * h2 * Math.sqrt(2 * Math.PI)));
      }
      const maxY = Math.max(...ys);
      expandCtx.save();
      expandCtx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const cx = SPAD.left + (i / pts) * pw, cy = SPAD.top + ph - (ys[i] / maxY) * ph;
        i === 0 ? expandCtx.moveTo(cx, cy) : expandCtx.lineTo(cx, cy);
      }
      expandCtx.lineTo(SPAD.left + pw, SPAD.top + ph); expandCtx.lineTo(SPAD.left, SPAD.top + ph);
      expandCtx.closePath(); expandCtx.fillStyle = "rgba(58,110,204,0.35)"; expandCtx.fill();
      expandCtx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const cx = SPAD.left + (i / pts) * pw, cy = SPAD.top + ph - (ys[i] / maxY) * ph;
        i === 0 ? expandCtx.moveTo(cx, cy) : expandCtx.lineTo(cx, cy);
      }
      expandCtx.strokeStyle = "#1a4a9a"; expandCtx.lineWidth = 2; expandCtx.stroke(); expandCtx.restore();

      drawExpandSharesAxes(W, H, pw, ph, minV, maxV, null, "Cuota (%)", "Densidad");

      // Línea verde cuota media
      if (punturalVal !== null) {
        const muC = (shares.reduce((a, b) => a + b, 0) / shares.length) * 100;
        const xLine = SPAD.left + ((muC - minV) / range2) * pw;
        expandCtx.save();
        expandCtx.strokeStyle = "#1a8a1a"; expandCtx.lineWidth = 2.5; expandCtx.setLineDash([6, 3]);
        expandCtx.beginPath(); expandCtx.moveTo(xLine, SPAD.top); expandCtx.lineTo(xLine, SPAD.top + ph); expandCtx.stroke();
        expandCtx.setLineDash([]);
        const lbl = `μ=${muC.toFixed(2)}%`;
        expandCtx.font = "bold 10px Tahoma, Arial";
        const tw = expandCtx.measureText(lbl).width;
        const lx = xLine + 4 + tw > SPAD.left + pw ? xLine - tw - 5 : xLine + 4;
        expandCtx.fillStyle = "rgba(240,255,240,0.90)"; expandCtx.fillRect(lx - 2, SPAD.top + 5, tw + 4, 14);
        expandCtx.strokeStyle = "#1a8a1a"; expandCtx.lineWidth = 0.5; expandCtx.strokeRect(lx - 2, SPAD.top + 5, tw + 4, 14);
        expandCtx.fillStyle = "#1a6a1a"; expandCtx.textAlign = "left"; expandCtx.fillText(lbl, lx, SPAD.top + 16);
        expandCtx.restore();
      }
    }
  }

  function drawExpandSharesAxes(W, H, pw, ph, minV, maxV, maxFreq, xLabel, yLabel) {
    expandCtx.save();
    expandCtx.strokeStyle = "#888"; expandCtx.lineWidth = 1;
    expandCtx.beginPath(); expandCtx.moveTo(SPAD.left, SPAD.top + ph); expandCtx.lineTo(SPAD.left + pw, SPAD.top + ph); expandCtx.stroke();
    expandCtx.beginPath(); expandCtx.moveTo(SPAD.left, SPAD.top); expandCtx.lineTo(SPAD.left, SPAD.top + ph); expandCtx.stroke();
    expandCtx.fillStyle = "#333"; expandCtx.font = "10px Tahoma, Arial";
    expandCtx.textAlign = "left";   expandCtx.fillText(minV.toFixed(1) + "%", SPAD.left, SPAD.top + ph + 14);
    expandCtx.textAlign = "right";  expandCtx.fillText(maxV.toFixed(1) + "%", SPAD.left + pw, SPAD.top + ph + 14);
    expandCtx.textAlign = "center"; expandCtx.fillText(xLabel, SPAD.left + pw / 2, H - 7);
    expandCtx.save();
    expandCtx.translate(13, SPAD.top + ph / 2); expandCtx.rotate(-Math.PI / 2); expandCtx.textAlign = "center";
    expandCtx.fillText(yLabel, 0, 0); expandCtx.restore();
    if (maxFreq !== null) {
      expandCtx.textAlign = "right";
      expandCtx.fillText(maxFreq.toFixed(1) + "%", SPAD.left - 4, SPAD.top + 5);
      expandCtx.fillText("0%", SPAD.left - 4, SPAD.top + ph);
    }
    expandCtx.restore();
  }

  // Botones de apertura
  document.getElementById("btn-sim-expand").addEventListener("click", () => openExpand("sim"));
  document.getElementById("btn-shares-expand").addEventListener("click", () => openExpand("shares"));

  // Cierre
  btnExpandClose.addEventListener("click", closeExpand);
  expandOverlay.addEventListener("click", e => { if (e.target === expandOverlay) closeExpand(); });

  // Zoom
  const ZOOM_STEP = 0.25, ZOOM_MIN = 0.5, ZOOM_MAX = 3.0;

  function applyZoom(z) {
    expandZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
    expandScaler.style.transform = `scale(${expandZoom})`;
    zoomLabel.textContent = `${expandZoom.toFixed(2)}×`;
  }

  btnZoomIn.addEventListener("click",    () => applyZoom(expandZoom + ZOOM_STEP));
  btnZoomOut.addEventListener("click",   () => applyZoom(expandZoom - ZOOM_STEP));
  btnZoomReset.addEventListener("click", () => applyZoom(1.0));

  // ===========================
  // CASO PARTICULAR
  // ===========================

  const casoFieldsWrap  = document.getElementById("caso-fields-wrap");
  const casoErrorEl     = document.getElementById("caso-error");
  const btnModoManual   = document.getElementById("btn-modo-manual");
  const btnModoRandom   = document.getElementById("btn-modo-random");
  const btnCasoRandFill = document.getElementById("btn-caso-random-fill");
  const btnCasoCalc     = document.getElementById("btn-caso-calcular");

  function buildCasoFields(N) {
    casoFieldsWrap.innerHTML = ""; clearError(casoErrorEl);
    const grid = document.createElement("div"); grid.id = "caso-fields-grid";
    for (let i = 1; i <= N; i++) {
      const cell = document.createElement("div"); cell.className = "caso-cell";
      const lbl = document.createElement("label"); lbl.textContent = `Empresa ${i}`; lbl.setAttribute("for", `caso-s${i}`);
      const inp = document.createElement("input");
      inp.type = "number"; inp.id = `caso-s${i}`; inp.className = "caso-input";
      inp.min = "0"; inp.max = "100"; inp.step = "0.01"; inp.placeholder = "0 – 100";
      cell.appendChild(lbl); cell.appendChild(inp); grid.appendChild(cell);
    }
    casoFieldsWrap.appendChild(grid);
  }

  buildCasoFields(parseInt(inputN.value, 10) || 10);

  btnModoManual.addEventListener("click", () => {
    btnModoManual.classList.add("active-mode"); btnModoRandom.classList.remove("active-mode");
    btnCasoRandFill.style.display = "none";
    casoFieldsWrap.querySelectorAll(".caso-input").forEach(inp => { inp.value = ""; inp.disabled = false; });
    clearError(casoErrorEl);
  });
  btnModoRandom.addEventListener("click", () => {
    btnModoRandom.classList.add("active-mode"); btnModoManual.classList.remove("active-mode");
    btnCasoRandFill.style.display = "inline-block"; clearError(casoErrorEl);
  });
  btnCasoRandFill.addEventListener("click", () => {
    const N = parseInt(inputN.value, 10);
    const shares = MCX.generateShares(N);
    const pcts   = sharesToPercent(shares, 2);
    casoFieldsWrap.querySelectorAll(".caso-input").forEach((inp, i) => { inp.value = pcts[i]; });
    clearError(casoErrorEl);
  });

  btnCasoCalc.addEventListener("click", () => {
    clearError(casoErrorEl);
    const N      = parseInt(inputN.value, 10);
    const inputs = [...casoFieldsWrap.querySelectorAll(".caso-input")];
    if (!simResults.length) {
      showError(casoErrorEl, "Primero ejecuta la simulación para tener una distribución de referencia."); return;
    }
    if (inputs.length !== N) {
      showError(casoErrorEl, "Los campos no coinciden con el N actual. Vuelve a configurar."); return;
    }
    for (let i = 0; i < inputs.length; i++) {
      const val = parseFloat(inputs[i].value);
      if (isNaN(val) || val < 0 || val > 100) {
        showError(casoErrorEl,
          `Empresa ${i + 1}: el valor "${inputs[i].value}" es inválido. Cada cuota debe estar entre 0 y 100.`); return;
      }
    }
    const vals = inputs.map(inp => parseFloat(inp.value));
    const sum  = vals.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.01) {
      showError(casoErrorEl,
        `La suma de las cuotas es ${sum.toFixed(2)}%, pero debe ser exactamente 100%.`); return;
    }
    const shares = vals.map(v => v / 100);
    MCX.currentShares = shares;
    const ind = selectIndicator.value;
    punturalVal = getIndicatorValue(shares, ind);
    previewShares(shares, N, "Caso ingresado manualmente");
    renderSharesChart(sharesMode);
    renderChart(activeMode);
    updateStats();
    updateSharesStats();
  });

  // ===========================
  // EVALUADOR
  // ===========================

  const btnEvalVerif = document.getElementById("btn-eval-verificar");
  const btnEvalReset = document.getElementById("btn-eval-reset");
  const evalFeedback = document.getElementById("eval-feedback");

  const UMBRALES = {
    IHH: { classify: v => v < 1500 ? "poco" : v < 2500 ? "moderado" : "alto",
            fuente: "FNE Chile, Guía para el Análisis de Operaciones de Concentración Horizontales (mayo 2022)",
            fmt: (v, m) => `${v.toFixed(m.decimals)} ${m.unit}` },
    CR:  { classify: v => v < 40 ? "poco" : v < 60 ? "moderado" : "alto",
            fuente: "Convención académica: Carlton & Perloff; Tirole",
            fmt: (v, m) => `${v.toFixed(m.decimals)}${m.unit}` },
    IE:  { classify: v => v >= 0.67 ? "poco" : v >= 0.33 ? "moderado" : "alto",
            fuente: "Shannon (1948); Theil (1967) — umbrales orientativos",
            fmt: (v, m) => `${v.toFixed(m.decimals)} ${m.unit}` },
    ID:  { classify: v => v < 0.25 ? "poco" : v < 0.50 ? "moderado" : "alto",
            fuente: "García Alba Idunate (1994) — umbrales orientativos",
            fmt: (v, m) => `${v.toFixed(m.decimals)} ${m.unit}` },
  };
  const NIVEL_LABEL = { poco: "poco concentrado", moderado: "moderadamente concentrado", alto: "altamente concentrado" };

  btnEvalVerif.addEventListener("click", () => {
    evalFeedback.innerHTML = "";
    if (punturalVal === null || !simResults.length) {
      evalFeedback.innerHTML = `<div class="feedback-incorrect">Primero ejecuta la simulación y define un caso particular.</div>`;
      playSound(sndError); return;
    }
    const sel = document.querySelector("input[name='eval-resp']:checked");
    if (!sel) {
      evalFeedback.innerHTML = `<div class="feedback-incorrect">Selecciona una opción antes de verificar.</div>`;
      playSound(sndError); return;
    }
    const ind      = selectIndicator.value;
    const meta     = getMeta();
    const umbral   = UMBRALES[ind];
    const correcto = umbral.classify(punturalVal);
    const respUser = sel.value;
    const sortedSim = [...simResults].sort((a, b) => a - b);
    const pct       = percentile(sortedSim, punturalVal);
    const valFmt    = umbral.fmt(punturalVal, meta);
    const nivelStr  = NIVEL_LABEL[correcto];

    const justificacion = `<br><br>
      <strong>Valor del caso particular:</strong> ${valFmt}<br>
      <strong>Percentil en la distribución simulada:</strong> ${pct} (supera al ${pct}% de los mercados simulados)<br>
      <strong>Clasificación correcta:</strong> ${nivelStr}<br>
      <strong>Fuente:</strong> ${umbral.fuente}`;

    if (respUser === correcto) {
      playSound(sndTada);
      evalFeedback.innerHTML = `<div class="feedback-correct"><strong>¡Correcto!</strong> Este mercado es ${nivelStr} según el indicador ${meta.label}.${justificacion}</div>`;
    } else {
      playSound(sndError);
      evalFeedback.innerHTML = `<div class="feedback-incorrect"><strong>Incorrecto.</strong> Seleccionaste "${NIVEL_LABEL[respUser]}", pero este mercado es <strong>${nivelStr}</strong> según el indicador ${meta.label}.${justificacion}</div>`;
    }
    document.querySelectorAll("input[name='eval-resp']").forEach(r => { r.disabled = true; });
    btnEvalVerif.disabled = true;
  });

  btnEvalReset.addEventListener("click", () => {
    document.querySelectorAll("input[name='eval-resp']").forEach(r => { r.checked = false; r.disabled = false; });
    evalFeedback.innerHTML = "";
    btnEvalVerif.disabled  = false;
  });

}); // fin DOMContentLoaded
