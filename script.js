document.addEventListener("DOMContentLoaded", () => {

  // ===========================
  // FUNCIONES MATEMÁTICAS
  // ===========================

  function calcIHH(shares) {
    return shares.reduce((acc, s) => acc + (s * 100) ** 2, 0);
  }

  function calcCRk(shares, k) {
    const sorted = [...shares].sort((a, b) => b - a);
    return sorted.slice(0, k).reduce((acc, s) => acc + s * 100, 0);
  }

  function calcIEnorm(shares) {
    const N = shares.length;
    const H = -shares.reduce((acc, s) => acc + s * Math.log(s), 0);
    return H / Math.log(N);
  }

  function calcID(shares) {
    const N = shares.length;
    const HHI_norm = calcIHH(shares) / 10000;
    return (HHI_norm - 1 / N) / (1 - 1 / N);
  }

  function generateShares(N) {
    const alpha = 0.5;
    const gammas = Array.from({ length: N }, () => sampleGamma(alpha));
    const total = gammas.reduce((a, b) => a + b, 0);
    return gammas.map(g => g / total);
  }

  function sampleGamma(alpha) {
    if (alpha < 1) {
      return sampleGamma(alpha + 1) * Math.random() ** (1 / alpha);
    }
    const d = alpha - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
      let x, v;
      do {
        x = sampleNormal();
        v = 1 + c * x;
      } while (v <= 0);
      v = v ** 3;
      const u = Math.random();
      if (u < 1 - 0.0331 * x ** 4) return d * v;
      if (Math.log(u) < 0.5 * x ** 2 + d * (1 - v + Math.log(v))) return d * v;
    }
  }

  function sampleNormal() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  window.MCX = { calcIHH, calcCRk, calcIEnorm, calcID, generateShares };

  // ===========================
  // AUDIO
  // ===========================

  const sndStartup = document.getElementById("snd-startup");
  const sndError   = document.getElementById("snd-error");
  const sndTada    = document.getElementById("snd-tada");

  function playSound(audioEl) {
    audioEl.currentTime = 0;
    audioEl.play().catch(() => {});
  }

  // ===========================
  // LOGON
  // ===========================

  const loginScreen = document.getElementById("login-screen");
  const desktop     = document.getElementById("desktop");

  loginScreen.addEventListener("click", () => {
    playSound(sndStartup);
    loginScreen.classList.add("hidden");
    desktop.classList.add("visible");
    setTimeout(resizeCanvas, 100);
  });

  // ===========================
  // MODAL XP GENÉRICO
  // ===========================

  function showModal({ title, body, btnLabel = "Aceptar", onClose } = {}) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:200;
      background:rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    `;
    const win = document.createElement("div");
    win.style.cssText = `
      width:380px;background:#ece9d8;
      border:2px solid #003c74;border-radius:8px 8px 0 0;
      box-shadow:2px 2px 0 #7ab4e8 inset,-1px -1px 0 #003c74 inset,
                 4px 6px 18px rgba(0,0,0,0.55);
      overflow:hidden;font-family:Tahoma,Arial,sans-serif;font-size:11px;
    `;
    const bar = document.createElement("div");
    bar.style.cssText = `
      background:linear-gradient(to right,
        #0a246a 0%,#3a6ecc 35%,#4a8ee8 50%,#3a6ecc 65%,#0a246a 100%);
      padding:5px 8px;display:flex;align-items:center;
      justify-content:space-between;user-select:none;
    `;
    const barText = document.createElement("span");
    barText.textContent = title;
    barText.style.cssText =
      `color:#fff;font-weight:bold;font-size:12px;
       text-shadow:1px 1px 2px rgba(0,0,0,.7);`;
    const barClose = document.createElement("button");
    barClose.textContent = "✕";
    barClose.style.cssText = `
      width:21px;height:21px;font-size:10px;font-weight:bold;
      border-radius:3px;border:1px solid #6a1010;cursor:pointer;color:#fff;
      background:linear-gradient(to bottom,#e05050 0%,#c03030 45%,#901010 100%);
      display:flex;align-items:center;justify-content:center;
    `;
    bar.appendChild(barText);
    bar.appendChild(barClose);

    const bodyEl = document.createElement("div");
    bodyEl.style.cssText = `padding:14px 16px 10px;line-height:1.6;`;
    bodyEl.innerHTML = body;

    const btnRow = document.createElement("div");
    btnRow.style.cssText =
      `padding:8px 16px 14px;display:flex;justify-content:flex-end;`;
    const btn = document.createElement("button");
    btn.textContent = btnLabel;
    btn.className = "xp-btn";

    const close = () => { overlay.remove(); if (onClose) onClose(); };
    btn.addEventListener("click", close);
    barClose.addEventListener("click", close);

    btnRow.appendChild(btn);
    win.appendChild(bar);
    win.appendChild(bodyEl);
    win.appendChild(btnRow);
    overlay.appendChild(win);
    document.body.appendChild(overlay);
  }

  // ===========================
  // UTILIDADES DE ERROR INLINE
  // ===========================

  function showError(containerEl, message) {
    clearError(containerEl);
    playSound(sndError);
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
  // REFERENCIAS DOM — CONFIGURACIÓN
  // ===========================

  const inputN          = document.getElementById("input-n");
  const inputIter       = document.getElementById("input-iter");
  const selectIndicator = document.getElementById("select-indicator");
  const btnGenerar      = document.getElementById("btn-generar");
  const previewEl       = document.getElementById("preview-puntual");
  const configErrorEl   = document.getElementById("config-error");
  const iterWarningEl   = document.getElementById("iter-warning");
  const btnSimular      = document.getElementById("btn-simular");

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
        body: `
          <p style="margin-bottom:10px;">
            Ha configurado <strong>${value.toLocaleString()}</strong> iteraciones.
            Tenga en cuenta lo siguiente:
          </p>
          <ul style="padding-left:18px;line-height:2;">
            <li><strong>Impacto en rendimiento:</strong> volúmenes elevados
                pueden degradar la fluidez de la interfaz durante la simulación.</li>
            <li><strong>Latencia de respuesta:</strong> el tiempo hasta obtener
                resultados aumenta proporcionalmente al número de iteraciones.</li>
            <li><strong>Consumo de recursos de cómputo:</strong> la carga sobre
                el hilo principal del navegador será significativamente mayor,
                pudiendo afectar otras pestañas o procesos activos.</li>
          </ul>`,
        btnLabel: "Comprendo",
      });
    }
    if (value <= 1000) {
      iterWarningEl.style.display = "none";
    }
  }

  inputIter.addEventListener("change", () => {
    const val = parseInt(inputIter.value, 10);
    if (!isNaN(val)) checkIterWarning(val);
  });

  // ===========================
  // GENERAR CASO PUNTUAL
  // ===========================

  btnGenerar.addEventListener("click", () => {
    clearError(configErrorEl);
    const N = parseInt(inputN.value, 10);
    if (isNaN(N) || N < 2 || N > 100) {
      showError(configErrorEl,
        "El número de empresas debe ser un entero entre 2 y 100.");
      return;
    }
    MCX.currentShares = MCX.generateShares(N);
    const sorted  = [...MCX.currentShares].sort((a, b) => b - a);
    const preview = sorted.slice(0, Math.min(3, N));
    previewEl.innerHTML =
      `<strong>Vector generado:</strong> ${N} empresa${N !== 1 ? "s" : ""}` +
      ` &nbsp;|&nbsp; Top cuotas: ` +
      preview.map((s, i) =>
        `s<sub>${i+1}</sub> = ${(s * 100).toFixed(2)}%`).join("&emsp;");
    previewEl.style.display = "block";
  });

  // ===========================
  // CANVAS — dimensionado responsivo
  // ===========================

  const canvas     = document.getElementById("sim-canvas");
  const ctx        = canvas.getContext("2d");
  const chartTitle = document.getElementById("chart-title");
  const statsLine  = document.getElementById("stats-line");
  const btnHisto   = document.getElementById("btn-histo");
  const btnDensity = document.getElementById("btn-density");

  function resizeCanvas() {
    const parent = canvas.parentElement;
    const W = parent.clientWidth - 24;
    canvas.width  = Math.max(W, 200);
    canvas.height = Math.round(canvas.width * 0.45);
    if (simResults.length) renderChart(activeMode);
  }

  window.addEventListener("resize", resizeCanvas);

  // ===========================
  // ESTADO DE SIMULACIÓN
  // ===========================

  const ITER_MAX  = 10000;
  let simResults  = [];
  let punturalVal = null;
  let activeMode  = "histo";

  const INDICATOR_META = {
    IHH: { label: "IHH", unit: "puntos",  decimals: 1 },
    CR4: { label: "CR4", unit: "%",        decimals: 2 },
    IE:  { label: "IE",  unit: "(0 – 1)", decimals: 4 },
    ID:  { label: "ID",  unit: "(0 – 1)", decimals: 4 },
  };

  function getIndicatorValue(shares, indicator) {
    switch (indicator) {
      case "IHH": return MCX.calcIHH(shares);
      case "CR4": return MCX.calcCRk(shares, 4);
      case "IE":  return MCX.calcIEnorm(shares);
      case "ID":  return MCX.calcID(shares);
    }
  }

  // ===========================
  // SIMULACIÓN
  // ===========================

  btnSimular.addEventListener("click", () => {
    clearError(configErrorEl);

    const N    = parseInt(inputN.value, 10);
    const iter = parseInt(inputIter.value, 10);
    const ind  = selectIndicator.value;

    if (isNaN(N) || N < 2 || N > 100) {
      showError(configErrorEl,
        "El número de empresas debe ser un entero entre 2 y 100.");
      return;
    }
    if (isNaN(iter) || iter < 100) {
      showError(configErrorEl,
        "El número de iteraciones debe ser al menos 100.");
      return;
    }
    if (iter > ITER_MAX) {
      showError(configErrorEl,
        `El límite es ${ITER_MAX.toLocaleString()} iteraciones para evitar ` +
        `que el navegador se bloquee al saturar su hilo principal.`);
      return;
    }

    if (!MCX.currentShares || MCX.currentShares.length !== N) {
      MCX.currentShares = MCX.generateShares(N);
      const sorted  = [...MCX.currentShares].sort((a, b) => b - a);
      const preview = sorted.slice(0, Math.min(3, N));
      previewEl.innerHTML =
        `<strong>Vector generado automáticamente:</strong> ${N} empresas` +
        ` &nbsp;|&nbsp; Top cuotas: ` +
        preview.map((s, i) =>
          `s<sub>${i+1}</sub> = ${(s * 100).toFixed(2)}%`).join("&emsp;");
      previewEl.style.display = "block";
    }

    simResults = [];
    for (let i = 0; i < iter; i++) {
      simResults.push(getIndicatorValue(MCX.generateShares(N), ind));
    }
    punturalVal = getIndicatorValue(MCX.currentShares, ind);

    resizeCanvas();
    renderChart(activeMode);
    updateStats(ind);
  });

  // ===========================
  // ESTADÍSTICAS
  // ===========================

  function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function percentile(sortedArr, val) {
    let count = 0;
    for (const v of sortedArr) { if (v <= val) count++; }
    return (count / sortedArr.length * 100).toFixed(1);
  }

  function updateStats(ind) {
    const meta   = INDICATOR_META[ind];
    const sorted = [...simResults].sort((a, b) => a - b);
    const mu     = mean(simResults);
    const pct    = percentile(sorted, punturalVal);
    statsLine.innerHTML =
      `Media: <strong>${mu.toFixed(meta.decimals)} ${meta.unit}</strong>` +
      `&emsp;|&emsp;Caso particular: ` +
      `<strong style="color:#c0392b">` +
      `${punturalVal.toFixed(meta.decimals)} ${meta.unit}</strong>` +
      `&emsp;|&emsp;Percentil: ` +
      `<strong style="color:#c0392b">${pct}</strong>`;
  }

  // ===========================
  // RENDERIZADO
  // ===========================

  const PAD = { top: 36, right: 24, bottom: 52, left: 54 };

  function renderChart(mode) {
    activeMode = mode;
    const W  = canvas.width;
    const H  = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!simResults.length) return;

    const ind  = selectIndicator.value;
    const meta = INDICATOR_META[ind];
    chartTitle.textContent =
      `${meta.label} — ${simResults.length.toLocaleString()} iteraciones`;

    const pw = W - PAD.left - PAD.right;
    const ph = H - PAD.top  - PAD.bottom;

    const minVal = Math.min(...simResults);
    const maxVal = Math.max(...simResults);
    const range  = maxVal - minVal || 1;

    let maxFreq;
    if (mode === "histo") {
      maxFreq = drawHistogram(pw, ph, minVal, range);
    } else {
      maxFreq = drawDensity(pw, ph, minVal, range);
    }

    drawAxesLabels(W, H, pw, ph, minVal, maxVal, maxFreq, meta);
    drawPuntualLine(W, H, pw, ph, minVal, range, meta);
  }

  function drawHistogram(pw, ph, minVal, range) {
    const bins   = Math.ceil(Math.sqrt(simResults.length));
    const counts = new Array(bins).fill(0);
    const step   = range / bins;

    for (const v of simResults) {
      let b = Math.floor((v - minVal) / step);
      if (b >= bins) b = bins - 1;
      counts[b]++;
    }

    const maxCount = Math.max(...counts);
    const barW = pw / bins;

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
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + bh);
      ctx.lineTo(x, y + bh);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return maxCount;
  }

  function drawDensity(pw, ph, minVal, range) {
    const n  = simResults.length;
    const mu = mean(simResults);
    const sd = Math.sqrt(
      simResults.reduce((a, v) => a + (v - mu) ** 2, 0) / n
    );
    const h   = 1.06 * sd * Math.pow(n, -0.2);
    const pts = 200;
    const ys  = [];

    for (let i = 0; i <= pts; i++) {
      const x = minVal + (i / pts) * range;
      let density = 0;
      for (const v of simResults) {
        const u = (x - v) / h;
        density += Math.exp(-0.5 * u * u);
      }
      density /= n * h * Math.sqrt(2 * Math.PI);
      ys.push(density);
    }

    const maxY = Math.max(...ys);

    ctx.save();
    // Relleno
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = PAD.left + (i / pts) * pw;
      const cy = PAD.top  + ph - (ys[i] / maxY) * ph;
      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    }
    ctx.lineTo(PAD.left + pw, PAD.top + ph);
    ctx.lineTo(PAD.left,      PAD.top + ph);
    ctx.closePath();
    ctx.fillStyle = "rgba(58,110,204,0.35)";
    ctx.fill();
    // Línea
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const cx = PAD.left + (i / pts) * pw;
      const cy = PAD.top  + ph - (ys[i] / maxY) * ph;
      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = "#1a4a9a";
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.restore();
    return null;
  }

  function drawAxesLabels(W, H, pw, ph, minVal, maxVal, maxFreq, meta) {
    ctx.save();
    ctx.strokeStyle = "#888";
    ctx.lineWidth   = 1;

    // Eje X
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top + ph);
    ctx.lineTo(PAD.left + pw, PAD.top + ph);
    ctx.stroke();
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + ph);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.font      = "10px Tahoma, Arial";

    // Min / Max en X
    ctx.textAlign = "left";
    ctx.fillText(minVal.toFixed(meta.decimals), PAD.left, PAD.top + ph + 14);
    ctx.textAlign = "right";
    ctx.fillText(maxVal.toFixed(meta.decimals), PAD.left + pw, PAD.top + ph + 14);

    // Título eje X
    ctx.textAlign = "center";
    ctx.fillText(`${meta.label} (${meta.unit})`, PAD.left + pw / 2, H - 8);

    // Título eje Y
    ctx.save();
    ctx.translate(12, PAD.top + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Frecuencia", 0, 0);
    ctx.restore();

    // Frecuencia máxima solo en histograma
    if (maxFreq !== null) {
      ctx.textAlign = "right";
      ctx.fillText(maxFreq, PAD.left - 4, PAD.top + 4);
      ctx.fillText("0", PAD.left - 4, PAD.top + ph);
    }

    ctx.restore();
  }

  function drawPuntualLine(W, H, pw, ph, minVal, range, meta) {
    if (punturalVal === null) return;
    const sorted = [...simResults].sort((a, b) => a - b);
    const pct    = percentile(sorted, punturalVal);
    const x      = PAD.left + ((punturalVal - minVal) / range) * pw;

    ctx.save();
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth   = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(x, PAD.top);
    ctx.lineTo(x, PAD.top + ph);
    ctx.stroke();
    ctx.setLineDash([]);

    const label = `${punturalVal.toFixed(meta.decimals)} | p${pct}`;
    ctx.font = "bold 10px Tahoma, Arial";
    const tw = ctx.measureText(label).width;
    const lx = x + 5 + tw > PAD.left + pw ? x - tw - 7 : x + 5;

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillRect(lx - 2, PAD.top + 6, tw + 4, 14);
    ctx.fillStyle = "#c0392b";
    ctx.textAlign = "left";
    ctx.fillText(label, lx, PAD.top + 17);
    ctx.restore();
  }

  // ===========================
  // BOTONES DE MODO DE VISUALIZACIÓN
  // ===========================

  btnHisto.addEventListener("click", () => {
    btnHisto.classList.add("active-mode");
    btnDensity.classList.remove("active-mode");
    renderChart("histo");
  });

  btnDensity.addEventListener("click", () => {
    btnDensity.classList.add("active-mode");
    btnHisto.classList.remove("active-mode");
    renderChart("density");
  });

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
    casoFieldsWrap.innerHTML = "";
    clearError(casoErrorEl);
    const grid = document.createElement("div");
    grid.id = "caso-fields-grid";

    for (let i = 1; i <= N; i++) {
      const cell = document.createElement("div");
      cell.className = "caso-cell";
      const lbl = document.createElement("label");
      lbl.textContent = `Empresa ${i}`;
      lbl.setAttribute("for", `caso-s${i}`);
      const inp = document.createElement("input");
      inp.type        = "number";
      inp.id          = `caso-s${i}`;
      inp.className   = "caso-input";
      inp.min         = "0";
      inp.max         = "100";
      inp.step        = "0.01";
      inp.placeholder = "0 – 100";
      cell.appendChild(lbl);
      cell.appendChild(inp);
      grid.appendChild(cell);
    }
    casoFieldsWrap.appendChild(grid);
  }

  inputN.addEventListener("change", () => {
    const N = parseInt(inputN.value, 10);
    if (!isNaN(N) && N >= 2 && N <= 100) buildCasoFields(N);
  });

  buildCasoFields(parseInt(inputN.value, 10) || 10);

  btnModoManual.addEventListener("click", () => {
    btnModoManual.classList.add("active-mode");
    btnModoRandom.classList.remove("active-mode");
    btnCasoRandFill.style.display = "none";
    casoFieldsWrap.querySelectorAll(".caso-input")
      .forEach(inp => { inp.value = ""; inp.disabled = false; });
    clearError(casoErrorEl);
  });

  btnModoRandom.addEventListener("click", () => {
    btnModoRandom.classList.add("active-mode");
    btnModoManual.classList.remove("active-mode");
    btnCasoRandFill.style.display = "inline-block";
    clearError(casoErrorEl);
  });

  btnCasoRandFill.addEventListener("click", () => {
    const N      = parseInt(inputN.value, 10);
    const shares = MCX.generateShares(N);
    const inputs = casoFieldsWrap.querySelectorAll(".caso-input");
    shares.forEach((s, i) => { inputs[i].value = (s * 100).toFixed(2); });
    clearError(casoErrorEl);
  });

  btnCasoCalc.addEventListener("click", () => {
    clearError(casoErrorEl);

    const N      = parseInt(inputN.value, 10);
    const inputs = [...casoFieldsWrap.querySelectorAll(".caso-input")];

    if (!simResults.length) {
      showError(casoErrorEl,
        "Primero ejecuta la simulación para tener una distribución de referencia.");
      return;
    }
    if (inputs.length !== N) {
      showError(casoErrorEl,
        "Los campos no coinciden con el N actual. Vuelve a configurar.");
      return;
    }

    // Nivel 1: rango individual
    for (let i = 0; i < inputs.length; i++) {
      const val = parseFloat(inputs[i].value);
      if (isNaN(val) || val < 0 || val > 100) {
        showError(casoErrorEl,
          `Empresa ${i + 1}: el valor "${inputs[i].value}" es inválido. ` +
          `Cada cuota debe estar entre 0 y 100.`);
        return;
      }
    }

    // Nivel 2: suma = 100
    const vals = inputs.map(inp => parseFloat(inp.value));
    const sum  = vals.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 0.01) {
      showError(casoErrorEl,
        `La suma de las cuotas es ${sum.toFixed(2)}%, pero debe ser ` +
        `exactamente 100%. Corrige los valores antes de continuar.`);
      return;
    }

    const shares = vals.map(v => v / 100);
    MCX.currentShares = shares;
    const ind = selectIndicator.value;
    punturalVal = getIndicatorValue(shares, ind);

    const sorted  = [...shares].sort((a, b) => b - a);
    const preview = sorted.slice(0, Math.min(3, N));
    previewEl.innerHTML =
      `<strong>Caso ingresado manualmente:</strong> ${N} empresas` +
      ` &nbsp;|&nbsp; Top cuotas: ` +
      preview.map((s, i) =>
        `s<sub>${i+1}</sub> = ${(s * 100).toFixed(2)}%`).join("&emsp;");
    previewEl.style.display = "block";

    renderChart(activeMode);
    updateStats(ind);
  });

  // ===========================
  // EVALUADOR
  // ===========================

  const btnEvalVerif = document.getElementById("btn-eval-verificar");
  const btnEvalReset = document.getElementById("btn-eval-reset");
  const evalFeedback = document.getElementById("eval-feedback");

  const UMBRALES = {
    IHH: {
      classify: v => v < 1500 ? "poco" : v < 2500 ? "moderado" : "alto",
      fuente: "FNE Chile, Guía para el Análisis de Operaciones de " +
              "Concentración Horizontales (mayo 2022)",
      fmt: (v, meta) => `${v.toFixed(meta.decimals)} ${meta.unit}`,
    },
    CR4: {
      classify: v => v < 40 ? "poco" : v < 60 ? "moderado" : "alto",
      fuente: "Convención académica: Carlton & Perloff; Tirole",
      fmt: (v, meta) => `${v.toFixed(meta.decimals)}${meta.unit}`,
    },
    IE: {
      classify: v => v >= 0.67 ? "poco" : v >= 0.33 ? "moderado" : "alto",
      fuente: "Shannon (1948); Theil (1967) — umbrales orientativos",
      fmt: (v, meta) => `${v.toFixed(meta.decimals)} ${meta.unit}`,
    },
    ID: {
      classify: v => v < 0.25 ? "poco" : v < 0.50 ? "moderado" : "alto",
      fuente: "García Alba Idunate (1994) — umbrales orientativos",
      fmt: (v, meta) => `${v.toFixed(meta.decimals)} ${meta.unit}`,
    },
  };

  const NIVEL_LABEL = {
    poco:     "poco concentrado",
    moderado: "moderadamente concentrado",
    alto:     "altamente concentrado",
  };

  btnEvalVerif.addEventListener("click", () => {
    evalFeedback.innerHTML = "";

    if (punturalVal === null || !simResults.length) {
      evalFeedback.innerHTML =
        `<div class="feedback-incorrect">
           Primero ejecuta la simulación y define un caso particular.
         </div>`;
      playSound(sndError);
      return;
    }

    const seleccionada =
      document.querySelector("input[name='eval-resp']:checked");
    if (!seleccionada) {
      evalFeedback.innerHTML =
        `<div class="feedback-incorrect">
           Selecciona una opción antes de verificar.
         </div>`;
      playSound(sndError);
      return;
    }

    const ind      = selectIndicator.value;
    const meta     = INDICATOR_META[ind];
    const umbral   = UMBRALES[ind];
    const correcto = umbral.classify(punturalVal);
    const respUser = seleccionada.value;

    const sortedSim = [...simResults].sort((a, b) => a - b);
    const pct       = percentile(sortedSim, punturalVal);
    const valFmt    = umbral.fmt(punturalVal, meta);
    const nivelStr  = NIVEL_LABEL[correcto];

    const justificacion = `<br><br>
      <strong>Valor del caso particular:</strong> ${valFmt}<br>
      <strong>Percentil en la distribución simulada:</strong> ${pct}
        (por encima del ${pct}% de los mercados simulados)<br>
      <strong>Clasificación correcta:</strong> ${nivelStr}<br>
      <strong>Fuente:</strong> ${umbral.fuente}`;

    if (respUser === correcto) {
      playSound(sndTada);
      evalFeedback.innerHTML =
        `<div class="feedback-correct">
           <strong>¡Correcto!</strong> Este mercado es ${nivelStr}
           según el indicador ${meta.label}.${justificacion}
         </div>`;
    } else {
      playSound(sndError);
      evalFeedback.innerHTML =
        `<div class="feedback-incorrect">
           <strong>Incorrecto.</strong> Seleccionaste
           "${NIVEL_LABEL[respUser]}", pero este mercado es
           <strong>${nivelStr}</strong> según el indicador
           ${meta.label}.${justificacion}
         </div>`;
    }

    document.querySelectorAll("input[name='eval-resp']")
      .forEach(r => { r.disabled = true; });
    btnEvalVerif.disabled = true;
  });

  btnEvalReset.addEventListener("click", () => {
    document.querySelectorAll("input[name='eval-resp']").forEach(r => {
      r.checked  = false;
      r.disabled = false;
    });
    evalFeedback.innerHTML = "";
    btnEvalVerif.disabled  = false;
  });

}); // fin DOMContentLoaded
