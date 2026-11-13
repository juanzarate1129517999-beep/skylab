(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const fmt = (n, d = 0) => n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const W = "#FFFFFF", G2 = "#8A8A86", G3 = "#3A3A3A", G4 = "#1C1C1C", INK = "#0A0A0A";

  root.classList.add("js");
  const ready = () => root.classList.add("is-ready");
  if (document.readyState === "complete") setTimeout(ready, 60); else addEventListener("load", () => setTimeout(ready, 60));
  setTimeout(ready, 1500);

  const MODULES = [
    { name: "Nexus", cat: "Ingeniería de Datos", vis: "nexus", short: "Plataforma de datos administrada",
      tagline: "Todos tus datos, una sola fuente de verdad.",
      desc: "Conecta tus sistemas, limpia la información y la organiza en una plataforma de datos lista para análisis e inteligencia artificial.",
      feats: ["Conectores a ERP, CRM, Excel y tiendas online", "Flujos ETL/ELT programados y monitoreados", "Calidad y trazabilidad de cada dato"],
      uses: ["Unificar ventas de tienda física y online", "Consolidar información de varias sedes", "Base confiable para reportes y modelos"] },
    { name: "Agents", cat: "IA Generativa", vis: "agents", short: "Agentes de IA para atención al cliente",
      tagline: "Atención 24/7 que sí resuelve.",
      desc: "Agentes de IA que conversan con tus clientes por WhatsApp, web e Instagram: responden, cotizan, agendan y pasan a una persona cuando hace falta.",
      feats: ["Aprende de tus documentos y catálogo", "Consulta pedidos e inventario en tus sistemas", "Escala a tu equipo con todo el contexto"],
      uses: ["Preguntas frecuentes y horarios", "Cotizaciones automáticas", "Seguimiento de pedidos"] },
    { name: "Forecast", cat: "Analítica Predictiva", vis: "forecast", short: "Pronóstico de demanda y ventas",
      tagline: "Anticipa la demanda antes de que llegue.",
      desc: "Modelos de machine learning que pronostican ventas y demanda por producto, sede y temporada para que compres y produzcas lo justo.",
      feats: ["Pronóstico por producto y por sede", "Escenarios de precio, campañas y temporada", "Alertas de quiebre y sobre-stock"],
      uses: ["Planeación de compras", "Producción por temporada", "Dimensionamiento de personal"] },
    { name: "DocAI", cat: "IA Generativa", vis: "docai", short: "Lectura inteligente de documentos",
      tagline: "Documentos que se procesan solos.",
      desc: "Extrae los datos de facturas, contratos, órdenes y formularios en segundos, los valida contra tus reglas y los envía a tu contabilidad o ERP.",
      feats: ["Lectura de PDF, fotos y escaneos", "Validación automática de campos", "Flujo de aprobación incluido"],
      uses: ["Cuentas por pagar", "Revisión de contratos", "Digitalización de formularios"] },
    { name: "Insight", cat: "Inteligencia de Negocio", vis: "insight", short: "Tableros y preguntas en lenguaje natural",
      tagline: "Pregúntale a tus datos en español.",
      desc: "Tableros en tiempo real y un copiloto que responde preguntas de negocio en lenguaje natural, con el gráfico y la consulta detrás.",
      feats: ["Preguntas en español, respuestas con gráfico", "Indicadores por área y por sede", "Reportes automáticos por correo"],
      uses: ["Tablero de gerencia", "Seguimiento comercial", "Análisis sin depender de TI"] },
    { name: "Shield", cat: "Analítica Predictiva", vis: "shield", short: "Detección de fraude y anomalías",
      tagline: "Detecta lo inusual antes de que cueste.",
      desc: "Monitorea transacciones, inventario y operaciones en tiempo real para encontrar fraude, errores y comportamientos fuera de lo normal.",
      feats: ["Detección de anomalías en tiempo real", "Puntaje de riesgo por transacción", "Explicación de cada alerta"],
      uses: ["Fraude en pagos y devoluciones", "Diferencias de inventario", "Errores contables"] },
    { name: "Pulse", cat: "Analítica de Clientes", vis: "pulse", short: "Segmentación y retención de clientes",
      tagline: "Conoce a cada cliente.",
      desc: "Segmenta a tus clientes automáticamente, predice quién está por irse y recomienda la mejor oferta para cada uno.",
      feats: ["Segmentos automáticos por comportamiento", "Riesgo de abandono por cliente", "Recomendación de productos"],
      uses: ["Campañas de retención", "Programas de fidelización", "Venta cruzada"] },
    { name: "Flow", cat: "Automatización", vis: "flow", short: "Automatización de procesos con IA",
      tagline: "El trabajo repetitivo, automatizado.",
      desc: "Diseña flujos que conectan tus aplicaciones y agregan pasos inteligentes con IA: clasificar, resumir, decidir y avisar.",
      feats: ["Constructor visual sin código", "Pasos con IA dentro del flujo", "Más de 300 integraciones"],
      uses: ["Facturación y cobranza", "Clasificación de correos", "Sincronización entre sistemas"] },
  ];

  const nav = $("#nav"), burger = $("#burger"), navLinks = $("#navLinks");
  const closeMenu = () => { navLinks.classList.remove("is-open"); burger.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", navLinks).forEach((a) => a.addEventListener("click", closeMenu));
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$("a", navLinks).forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => navObs.observe(s));

  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
  $$(".rv").forEach((el) => {
    const sib = [...el.parentElement.children].filter((c) => c.classList.contains("rv"));
    el.style.setProperty("--d", `${Math.min(sib.indexOf(el), 4) * 0.08}s`);
    revObs.observe(el);
  });

  const swap = $("#swap");
  const WORDS = ["decisiones", "ventas", "predicciones", "eficiencia", "crecimiento"];
  if (!RM) {
    (async () => {
      await sleep(2600);
      let i = 0;
      while (true) {
        const cur = WORDS[i], next = WORDS[(i + 1) % WORDS.length];
        for (let k = cur.length; k >= 0; k--) { swap.textContent = cur.slice(0, k); await sleep(38); }
        await sleep(180);
        for (let k = 1; k <= next.length; k++) { swap.textContent = next.slice(0, k); await sleep(70); }
        i = (i + 1) % WORDS.length;
        await sleep(2400);
      }
    })();
  }

  const topo = $("#topo"), tx = topo.getContext("2d"), hero = $(".hero");
  const probe = $("#probe"), probeTxt = $("#probeTxt");
  const PERM = new Uint8Array(512);
  {
    const p = [...Array(256).keys()];
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  }
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const h = (i, j) => PERM[(PERM[i & 255] + j) & 511] / 255;
    const u = fade(xf), v = fade(yf);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
  };
  let TW = 0, TH = 0, cols = 0, rows = 0, CELL = 12, field = null, topoVisible = true;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, k: 0, tk: 0 };
  const sizeTopo = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    TW = topo.offsetWidth; TH = topo.offsetHeight;
    topo.width = TW * dpr; topo.height = TH * dpr;
    tx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CELL = TW < 700 ? 14 : 12;
    cols = Math.ceil(TW / CELL) + 1; rows = Math.ceil(TH / CELL) + 1;
    field = new Float32Array(cols * rows);
  };
  const LEVELS = 18;
  const fieldAt = (px, py, t) => {
    const s = 0.0024;
    let v = vnoise(px * s + t * 0.05, py * s - t * 0.03) * 0.62 + vnoise(px * s * 2.1 - t * 0.04, py * s * 2.1 + 9) * 0.28 + vnoise(px * s * 4.3, py * s * 4.3 + t * 0.06) * 0.1;
    if (mouse.k > 0.01) {
      const dx = px - mouse.x, dy = py - mouse.y;
      v += mouse.k * 0.42 * Math.exp(-(dx * dx + dy * dy) / (2 * 110 * 110));
    }
    return v;
  };
  const drawTopo = (t) => {
    if (!field) return;
    mouse.x = lerp(mouse.x, mouse.tx, 0.12); mouse.y = lerp(mouse.y, mouse.ty, 0.12); mouse.k = lerp(mouse.k, mouse.tk, 0.06);
    const time = t / 1000;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) field[j * cols + i] = fieldAt(i * CELL, j * CELL, time);
    tx.clearRect(0, 0, TW, TH);
    const seg = (p, q) => { tx.moveTo(p[0], p[1]); tx.lineTo(q[0], q[1]); };
    for (let l = 1; l < LEVELS; l++) {
      const L = 0.12 + (l / LEVELS) * 0.9;
      const major = l % 4 === 0;
      tx.beginPath();
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const a = field[j * cols + i], b = field[j * cols + i + 1], c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
          const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          const x = i * CELL, y = j * CELL;
          const top = [x + CELL * ((L - a) / (b - a)), y];
          const right = [x + CELL, y + CELL * ((L - b) / (c - b))];
          const bottom = [x + CELL * ((L - d) / (c - d)), y + CELL];
          const left = [x, y + CELL * ((L - a) / (d - a))];
          switch (idx) {
            case 1: case 14: seg(left, bottom); break;
            case 2: case 13: seg(bottom, right); break;
            case 3: case 12: seg(left, right); break;
            case 4: case 11: seg(top, right); break;
            case 5: seg(left, top); seg(bottom, right); break;
            case 6: case 9: seg(top, bottom); break;
            case 7: case 8: seg(left, top); break;
            case 10: seg(left, bottom); seg(top, right); break;
          }
        }
      }
      tx.strokeStyle = major ? "rgba(10,10,10,.42)" : "rgba(10,10,10,.14)";
      tx.lineWidth = major ? 1 : 0.8;
      tx.stroke();
    }
  };
  if (FINE) {
    hero.addEventListener("pointermove", (e) => {
      const r = topo.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; mouse.tk = 1;
      if (mouse.x < -1000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
      const overUI = e.target.closest(".ask, .btn, h1, .hero__lead");
      probe.classList.toggle("is-on", !overUI);
      probe.style.transform = `translate(${mouse.tx}px, ${mouse.ty}px)`;
      const z = fieldAt(mouse.tx, mouse.ty, performance.now() / 1000);
      probeTxt.textContent = `x ${fmt(mouse.tx / TW, 3)} · y ${fmt(mouse.ty / TH, 3)} · z ${fmt(z, 3)}`;
    });
    hero.addEventListener("pointerleave", () => { mouse.tk = 0; probe.classList.remove("is-on"); });
  }
  new IntersectionObserver(([e]) => { topoVisible = e.isIntersecting; }).observe(topo);

  const ASKS = [
    { chip: "Inventario", q: "¿Qué productos se agotarán la próxima semana?", v: "3 productos", t: "Termo 750 ml, Botella 1 L y Tapa x12 · reponer antes del jueves", s: [9, 8, 8, 7, 6, 6, 5, 4, 3, 2] },
    { chip: "Ventas", q: "Compara las ventas de octubre con septiembre", v: "+12,4 %", t: "USD 248.900 en octubre · el canal online creció 31 %", s: [3, 4, 4, 5, 5, 6, 6, 7, 8, 9] },
    { chip: "Clientes", q: "¿Qué clientes tienen riesgo de dejar de comprar?", v: "47 clientes", t: "Representan USD 18.900 al mes · campaña sugerida lista", s: [5, 6, 5, 7, 6, 8, 7, 8, 9, 9] },
    { chip: "Facturas", q: "Resume las facturas pendientes de pago", v: "USD 32.410", t: "18 facturas · 4 vencen esta semana", s: [6, 4, 7, 5, 8, 6, 5, 7, 4, 6] },
  ];
  const askQ = $("#askQ"), askA = $("#askA"), askVal = $("#askVal"), askTxt = $("#askTxt"), askSpark = $("#askSpark"), askChips = $("#askChips");
  let askToken = 0, askAuto = true;
  const sparkPath = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${(i / (arr.length - 1)) * 120},${30 - (v / 10) * 28}`).join(" ");
  async function runAsk(i, user = false) {
    if (user) askAuto = false;
    const my = ++askToken;
    $$("button", askChips).forEach((b, k) => b.classList.toggle("is-on", k === i));
    const a = ASKS[i];
    askA.classList.add("is-wait");
    askTxt.textContent = "Consultando tus datos…";
    if (RM) askQ.textContent = a.q;
    else for (let k = 1; k <= a.q.length; k++) { if (my !== askToken) return; askQ.textContent = a.q.slice(0, k); await sleep(26); }
    await sleep(380);
    if (my !== askToken) return;
    askVal.textContent = a.v; askTxt.textContent = a.t; askSpark.setAttribute("d", sparkPath(a.s));
    askA.classList.remove("is-wait");
    if (askAuto) { await sleep(4200); if (my === askToken && askAuto) runAsk((i + 1) % ASKS.length); }
  }
  ASKS.forEach((a, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = a.chip;
    b.addEventListener("click", () => runAsk(i, true));
    askChips.append(b);
  });
  setTimeout(() => runAsk(0), 900);

  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
  const mono = (sz, w = 500) => `${w} ${sz}px "Geist Mono", ui-monospace, monospace`;
  const seeded = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const CL = Array.from({ length: 90 }, (_, i) => ({ k: i % 3, rx: seeded(i), ry: seeded(i + 99), jx: seeded(i + 7) - 0.5, jy: seeded(i + 13) - 0.5 }));
  const VIS = {
    nexus(c, w, h, t) {
      const srcs = [0.2, 0.4, 0.6, 0.8].map((f) => [w * 0.12, h * f]), dsts = [0.3, 0.5, 0.7].map((f) => [w * 0.88, h * f]);
      const cx = w * 0.5, cy = h * 0.5;
      const bez = (p0, p3, u) => { const p1 = [(p0[0] + p3[0]) / 2, p0[1]], p2 = [(p0[0] + p3[0]) / 2, p3[1]], v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
      c.strokeStyle = G3; c.lineWidth = 1;
      [...srcs, ...dsts].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.bezierCurveTo((x + cx) / 2, y, (x + cx) / 2, cy, cx, cy); c.stroke(); });
      for (let i = 0; i < 56; i++) {
        const s = (t * 0.00018 + i / 56) % 1;
        const [x, y] = s < 0.5 ? bez(srcs[i % 4], [cx, cy], s * 2) : bez([cx, cy], dsts[i % 3], (s - 0.5) * 2);
        c.fillStyle = s < 0.5 ? G2 : W; c.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
      const s = Math.min(w, h) * 0.2;
      rr(c, cx - s / 2, cy - s / 2, s, s, 8); c.fillStyle = W; c.fill();
      c.fillStyle = INK; c.font = mono(Math.max(9, s / 7), 600); c.textAlign = "center"; c.fillText("NEXUS", cx, cy + 4); c.textAlign = "left";
      c.font = mono(9.5); c.fillStyle = G2;
      ["SHOPIFY", "EXCEL", "ERP", "CRM"].forEach((l, i) => c.fillText(l, srcs[i][0] - 10, srcs[i][1] - 8));
      ["BI", "IA", "API"].forEach((l, i) => c.fillText(l, dsts[i][0] - 10, dsts[i][1] - 8));
    },
    agents(c, w, h, t) {
      const msgs = [["u", 0.55], ["b", 0.7], ["u", 0.4], ["b", 0.75], ["u", 0.5], ["b", 0.62]];
      const shown = Math.min(msgs.length, Math.floor(((t / 1000) % 9) / 1.3) + 1);
      const bh = Math.max(24, h * 0.09), pad = w * 0.09;
      let y = h - pad;
      for (let i = shown - 1; i >= 0; i--) {
        const [who, f] = msgs[i], bw = (w - pad * 2) * f, x = who === "u" ? w - pad - bw : pad;
        y -= bh; rr(c, x, y, bw, bh, 9); c.fillStyle = who === "u" ? W : G4; c.fill();
        c.fillStyle = who === "u" ? "rgba(10,10,10,.35)" : "rgba(255,255,255,.3)";
        c.fillRect(x + 12, y + bh / 2 - 3, bw * 0.6, 2.5); c.fillRect(x + 12, y + bh / 2 + 3, bw * 0.35, 2.5);
        y -= 10;
      }
      if (shown < msgs.length && msgs[shown][0] === "b") {
        y -= bh; rr(c, pad, y, 58, bh, 9); c.fillStyle = G4; c.fill();
        for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * Math.abs(Math.sin(t / 250 + k))})`; c.beginPath(); c.arc(pad + 16 + k * 13, y + bh / 2, 3, 0, 7); c.fill(); }
      }
    },
    forecast(c, w, h, t) {
      const pad = Math.min(30, w * 0.08), n = 18, hist = 12;
      const val = (i) => 0.32 + i * 0.022 + Math.sin(i / 1.6) * 0.07 + seeded(i) * 0.05;
      const X = (i) => pad + (i / (n - 1)) * (w - pad * 2), Y = (v) => h - pad - v * (h - pad * 2);
      c.strokeStyle = G4; c.lineWidth = 1;
      for (let g = 0; g <= 4; g++) { c.beginPath(); c.moveTo(pad, Y(g / 4)); c.lineTo(w - pad, Y(g / 4)); c.stroke(); }
      const prog = clamp(((t / 1000) % 6) / 4, 0, 1), last = hist - 1, end = last + (n - hist) * prog;
      c.beginPath(); for (let i = 0; i < hist; i++) i ? c.lineTo(X(i), Y(val(i))) : c.moveTo(X(i), Y(val(i)));
      c.strokeStyle = G2; c.lineWidth = 1.6; c.stroke();
      c.beginPath(); c.moveTo(X(last), Y(val(last)));
      for (let i = last + 1; i <= end; i++) c.lineTo(X(i), Y(val(i) + 0.04 * (i - last)));
      for (let i = Math.floor(end); i > last; i--) c.lineTo(X(i), Y(val(i) - 0.04 * (i - last)));
      c.closePath(); c.fillStyle = "rgba(255,255,255,.12)"; c.fill();
      c.beginPath(); c.moveTo(X(last), Y(val(last))); for (let i = last + 1; i <= end; i++) c.lineTo(X(i), Y(val(i)));
      c.strokeStyle = W; c.setLineDash([5, 4]); c.lineWidth = 1.8; c.stroke(); c.setLineDash([]);
      c.strokeStyle = G3; c.beginPath(); c.moveTo(X(last), pad); c.lineTo(X(last), h - pad); c.stroke();
      c.font = mono(9.5); c.fillStyle = G2; c.fillText("HOY", X(last) + 6, pad + 10);
    },
    docai(c, w, h, t) {
      const dw = Math.min(w * 0.4, h * 0.58), dh = dw * 1.3, dx = w * 0.1, dy = (h - dh) / 2;
      rr(c, dx, dy, dw, dh, 4); c.fillStyle = W; c.fill();
      const scan = ((t / 1000) % 4) / 3;
      for (let r = 0; r < 10; r++) {
        const ly = dy + 18 + r * ((dh - 36) / 10), lw = dw * (r % 3 === 0 ? 0.5 : 0.75), hit = ly < dy + scan * dh;
        c.fillStyle = hit && [1, 4, 8].includes(r) ? INK : "rgba(10,10,10,.18)"; c.fillRect(dx + 12, ly, lw, 4);
      }
      if (scan <= 1) { const sy = dy + scan * dh; c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(dx - 6, sy - 10, dw + 12, 10); c.fillStyle = G2; c.fillRect(dx - 6, sy, dw + 12, 1.5); }
      const F = [["PROVEEDOR", "Aurora S.A.S."], ["FECHA", "13/11/2026"], ["TOTAL", "$ 1.248,00"]];
      const fx = dx + dw + w * 0.06, fw = w - fx - w * 0.06;
      F.forEach(([k, v], i) => {
        const on = scan > [0.2, 0.45, 0.85][i], fy = dy + i * (dh / 3) + 6, fh = dh / 3 - 12;
        rr(c, fx, fy, fw, fh, 6); c.strokeStyle = on ? W : G3; c.lineWidth = 1; c.stroke();
        c.font = mono(9); c.fillStyle = G2; c.fillText(k, fx + 10, fy + 16);
        c.font = mono(Math.max(10, Math.min(14, fw / 10)), 500); c.fillStyle = on ? W : G3; c.fillText(on ? v : "········", fx + 10, fy + Math.min(fh - 8, 36));
      });
    },
    insight(c, w, h, t) {
      const pad = Math.min(28, w * 0.08), n = 7, top = 60;
      rr(c, pad, 18, w - pad * 2, 28, 14); c.strokeStyle = G3; c.lineWidth = 1; c.stroke();
      const q = "¿Ventas por región este mes?", shown = Math.min(q.length, Math.floor(((t / 1000) % 7) * 12));
      c.font = mono(10); c.fillStyle = W; c.fillText(q.slice(0, shown), pad + 12, 36);
      const bw = (w - pad * 2) / n;
      for (let i = 0; i < n; i++) {
        const v = 0.3 + 0.6 * seeded(i + 3) + 0.05 * Math.sin(t / 600 + i), grow = clamp(((t / 1000) % 7) / 2.5 - i * 0.05, 0, 1);
        const bh = (h - top - pad - 12) * v * grow;
        c.fillStyle = i === 3 ? W : G3; c.fillRect(pad + i * bw + bw * 0.2, h - pad - bh, bw * 0.6, bh);
      }
    },
    shield(c, w, h, t) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.38, ang = (t / 1400) % (Math.PI * 2);
      c.strokeStyle = G4; c.lineWidth = 1;
      for (let k = 1; k <= 4; k++) { c.beginPath(); c.arc(cx, cy, (R * k) / 4, 0, 7); c.stroke(); }
      c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke();
      if (c.createConicGradient) { const g = c.createConicGradient(ang - 0.9, cx, cy); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.14, "rgba(255,255,255,.18)"); g.addColorStop(0.15, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill(); }
      c.strokeStyle = W; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); c.stroke();
      for (let i = 0; i < 14; i++) {
        const a = seeded(i) * Math.PI * 2, d = (0.2 + seeded(i + 40) * 0.75) * R;
        let diff = (ang - a) % (Math.PI * 2); if (diff < 0) diff += Math.PI * 2;
        const al = clamp(1 - diff / 2.5, 0, 1), bad = i === 5, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
        c.fillStyle = `rgba(255,255,255,${0.15 + al * 0.8})`; c.beginPath(); c.arc(x, y, bad ? 4 : 2.5, 0, 7); c.fill();
        if (bad) { c.strokeStyle = W; c.beginPath(); c.arc(x, y, 9 + 3 * Math.sin(t / 200), 0, 7); c.stroke(); c.font = mono(9.5, 600); c.fillStyle = W; c.fillText("ANOMALÍA 0,97", x + 14, y - 8); }
      }
    },
    pulse(c, w, h, t) {
      const cyc = (t / 1000) % 8, k = cyc < 1 ? 0 : cyc < 3.5 ? (cyc - 1) / 2.5 : cyc < 6 ? 1 : 1 - (cyc - 6) / 2, e = k * k * (3 - 2 * k);
      const C = [[0.27, 0.36], [0.72, 0.34], [0.5, 0.72]];
      CL.forEach((p) => {
        const sx = w * (0.1 + p.rx * 0.8), sy = h * (0.12 + p.ry * 0.76), ex = w * C[p.k][0] + p.jx * w * 0.2, ey = h * C[p.k][1] + p.jy * h * 0.2;
        const x = lerp(sx, ex, e), y = lerp(sy, ey, e);
        c.beginPath(); c.arc(x, y, 3, 0, 7);
        if (e > 0.2 && p.k === 2) { c.strokeStyle = W; c.lineWidth = 1; c.stroke(); } else { c.fillStyle = e > 0.2 && p.k === 1 ? G2 : W; c.fill(); }
      });
      if (e > 0.9) { c.font = mono(9.5, 600); c.fillStyle = W; ["LEALES", "NUEVOS", "EN RIESGO"].forEach((l, i) => c.fillText(l, w * C[i][0] - 22, h * C[i][1] - h * 0.13)); }
    },
    flow(c, w, h, t) {
      const N = [["CORREO", 0.13, 0.5], ["IA · CLASIFICA", 0.4, 0.27], ["IA · RESUME", 0.4, 0.73], ["APROBACIÓN", 0.66, 0.5], ["ERP", 0.88, 0.3], ["AVISO", 0.88, 0.7]];
      const E = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5]], pos = (i) => [w * N[i][1], h * N[i][2]];
      c.lineWidth = 1;
      E.forEach(([a, b], i) => {
        const [x1, y1] = pos(a), [x2, y2] = pos(b);
        c.strokeStyle = G3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
        const u = (t / 1600 + i * 0.17) % 1; c.fillStyle = W; c.beginPath(); c.arc(lerp(x1, x2, u), lerp(y1, y2, u), 3, 0, 7); c.fill();
      });
      N.forEach(([label], i) => {
        const [x, y] = pos(i); c.font = mono(Math.max(8, Math.min(9.5, w / 52)), 500);
        const tw = c.measureText(label).width + 16, ai = i === 1 || i === 2;
        rr(c, x - tw / 2, y - 12, tw, 24, 4); c.fillStyle = ai ? W : G4; c.fill();
        c.fillStyle = ai ? INK : W; c.fillText(label, x - tw / 2 + 8, y + 3.5);
      });
    },
  };
  const makeStage = (canvas) => {
    const ctx = canvas.getContext("2d");
    const st = { w: 0, h: 0, mod: 0, t0: 0, on: false };
    st.size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); st.w = canvas.offsetWidth; st.h = canvas.offsetHeight; canvas.width = st.w * dpr; canvas.height = st.h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    st.draw = (t) => { if (!st.on || !st.w) return; ctx.clearRect(0, 0, st.w, st.h); try { VIS[MODULES[st.mod].vis](ctx, st.w, st.h, RM ? 4000 : t - st.t0 + 1200); } catch { return; } };
    st.set = (i) => { st.mod = i; st.t0 = performance.now(); };
    return st;
  };

  const index = $("#index"), peek = $("#peek"), peekLabel = $("#peekLabel");
  const peekSt = makeStage($("#peekCanvas"));
  MODULES.forEach((m, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "row"; b.setAttribute("role", "listitem");
    b.innerHTML = `<span class="row__n">${String(i + 1).padStart(2, "0")}</span><span class="row__name">${m.name}</span><span class="row__desc">${m.short}</span><span class="row__cat">${m.cat}</span><span class="row__go" aria-hidden="true">→</span>`;
    b.setAttribute("aria-label", `${m.name}: ${m.short}. Ver detalle`);
    b.addEventListener("click", () => openDrawer(i));
    if (FINE) b.addEventListener("pointerenter", () => { peekSt.set(i); peekLabel.textContent = m.name; peek.classList.add("is-on"); peekSt.on = true; if (!peekSt.w) peekSt.size(); });
    index.append(b);
  });
  if (FINE) {
    let px = 0, py = 0, fx = 0, fy = 0;
    index.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; });
    index.addEventListener("pointerleave", () => { peek.classList.remove("is-on"); setTimeout(() => { if (!peek.classList.contains("is-on")) peekSt.on = false; }, 300); });
    const follow = () => {
      fx = lerp(fx, px, 0.16); fy = lerp(fy, py, 0.16);
      peek.style.left = `${Math.min(fx + 28, innerWidth - 280)}px`; peek.style.top = `${fy - 90}px`;
      requestAnimationFrame(follow);
    };
    follow();
  }

  const drawer = $("#drawer"), dSt = makeStage($("#dCanvas"));
  let dIdx = 0, lastFocus = null;
  const fillDrawer = (i) => {
    dIdx = (i + MODULES.length) % MODULES.length;
    const m = MODULES[dIdx];
    $("#dCode").textContent = `${String(dIdx + 1).padStart(2, "0")} / 08`;
    $("#dCat").textContent = m.cat; $("#dTitle").textContent = m.name; $("#dTag").textContent = m.tagline; $("#dDesc").textContent = m.desc;
    $("#dFeats").innerHTML = m.feats.map((f) => `<li>${f}</li>`).join("");
    $("#dUses").innerHTML = m.uses.map((f) => `<li>${f}</li>`).join("");
    const body = $(".drawer__body"); body.classList.remove("drawer__swap"); void body.offsetWidth; body.classList.add("drawer__swap");
    dSt.set(dIdx);
  };
  function openDrawer(i) {
    lastFocus = document.activeElement;
    fillDrawer(i);
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => { dSt.size(); dSt.on = true; });
    setTimeout(() => $("[data-close]", $(".drawer__nav")).focus(), 50);
  }
  const closeDrawer = () => {
    drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; dSt.on = false; lastFocus?.focus();
  };
  $$("[data-close]", drawer).forEach((b) => b.addEventListener("click", closeDrawer));
  $("#dPrev").addEventListener("click", () => fillDrawer(dIdx - 1));
  $("#dNext").addEventListener("click", () => fillDrawer(dIdx + 1));
  addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    if (e.key === "Escape") closeDrawer();
    if (e.key === "ArrowRight") fillDrawer(dIdx + 1);
    if (e.key === "ArrowLeft") fillDrawer(dIdx - 1);
  });

  const SEGS = [
    { max: 10, name: "Microempresa", mods: ["Agents", "Insight", "DocAI"], plan: "Esencial", time: "1 a 7 días", team: "Soporte por chat",
      desc: "Empieza por lo que más tiempo te quita: responder clientes, ordenar ventas y registrar facturas. Sin equipo técnico y con resultados desde la primera semana." },
    { max: 50, name: "Pequeña empresa", mods: ["Agents", "Insight", "DocAI", "Flow"], plan: "Esencial o Crecimiento", time: "1 a 2 semanas", team: "Soporte y sesiones de configuración",
      desc: "Automatiza tareas entre áreas y centraliza tus indicadores. Ideal cuando el equipo crece y la información empieza a dispersarse." },
    { max: 250, name: "Mediana empresa", mods: ["Nexus", "Insight", "Forecast", "Pulse", "Flow", "Agents"], plan: "Crecimiento", time: "2 a 4 semanas", team: "Gerente de cuenta dedicado",
      desc: "Unifica ERP, CRM, e-commerce y hojas de cálculo en una sola base, y construye encima pronósticos de demanda y segmentación de clientes." },
    { max: Infinity, name: "Gran empresa", mods: MODULES.map((m) => m.name), plan: "Corporativo", time: "Por fases, desde 6 semanas", team: "Equipo de ingeniería asignado",
      desc: "Arquitectura de datos corporativa, MLOps, agentes con acceso controlado a sistemas internos y despliegue en tu propia nube, con gobierno y auditoría." },
  ];
  const sizeRange = $("#sizeRange"), sizeMods = $("#sizeMods"), LOGMAX = Math.log10(5000);
  sizeMods.innerHTML = MODULES.map((m) => `<li data-m="${m.name}">${m.name}<small>${m.cat.split(" ")[0]}</small></li>`).join("");
  $$(".sizer__ticks span").forEach((s, i) => { s.style.left = `${(Math.log10([1, 10, 50, 250, 1000, 5000][i]) / LOGMAX) * 100}%`; });
  let lastSeg = -1;
  const updateSize = () => {
    const n = Math.max(1, Math.round(Math.pow(10, (sizeRange.value / 1000) * LOGMAX)));
    $("#sizeNum").textContent = n >= 5000 ? "5.000+" : fmt(n);
    const si = SEGS.findIndex((s) => n <= s.max), s = SEGS[si];
    if (si === lastSeg) return;
    lastSeg = si;
    $("#sizeSeg").textContent = s.name; $("#sizeDesc").textContent = s.desc;
    $("#sizePlan").textContent = s.plan; $("#sizeTime").textContent = s.time; $("#sizeTeam").textContent = s.team;
    $$("li", sizeMods).forEach((li, k) => { li.style.transitionDelay = `${k * 0.04}s`; li.classList.toggle("is-on", s.mods.includes(li.dataset.m)); });
  };
  sizeRange.addEventListener("input", updateSize);

  const method = $("#metodo"), track = $("#methodTrack"), steps = $$(".step", track), mBar = $("#methodBar");
  const updateMethod = () => {
    if (innerWidth <= 900) { track.style.transform = ""; steps.forEach((s) => s.classList.add("is-on")); return; }
    const r = method.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    const dist = Math.max(0, track.scrollWidth - innerWidth);
    track.style.transform = `translate3d(${-dist * p}px,0,0)`;
    mBar.style.transform = `scaleX(${p})`;
    const active = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
    steps.forEach((s, i) => s.classList.toggle("is-on", i === active));
  };

  const paint = (r) => r.style.setProperty("--fill", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
  $$('input[type="range"]').forEach((r) => { paint(r); r.addEventListener("input", () => paint(r)); });

  $$(".console__tab").forEach((tab) => tab.addEventListener("click", () => {
    $$(".console__tab").forEach((t) => { const on = t === tab; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", String(on)); });
    $$(".panel").forEach((p) => p.classList.toggle("is-on", p.dataset.panel === tab.dataset.demo));
    if (tab.dataset.demo === "forecast") requestAnimationFrame(() => drawForecast());
  }));

  const chatBody = $("#chatBody"), chatLog = $("#chatLog"), chatInput = $("#chatInput"), t0 = Date.now();
  const stamp = () => { const s = Math.floor((Date.now() - t0) / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  const log = (text) => { const li = document.createElement("li"); const tm = document.createElement("time"); tm.textContent = stamp(); li.append(tm, text); chatLog.prepend(li); };
  const addMsg = (content, who) => { const d = document.createElement("div"); d.className = `msg msg--${who}`; if (who === "user") d.textContent = content; else d.innerHTML = content; chatBody.append(d); chatBody.scrollTop = chatBody.scrollHeight; return d; };
  const RULES = [
    { k: ["envío", "envio", "domicilio", "entrega"], r: "Sí. Enviamos a todo el país: en la ciudad llega en <b>24 horas</b> y a otras ciudades en <b>2 a 4 días hábiles</b>. El envío es gratis desde $150.", l: "Intención: envíos → política de envíos" },
    { k: ["cotiz", "precio", "unidades", "cuesta", "comprar"], r: "Te preparé una cotización:<div class='card'>20 × Termo Aurora 750 ml<br>Unitario: $18,50 → <b>$15,90</b> por volumen<br><b>Total: $318,00</b> · válida 7 días</div>¿Te la envío por correo?", l: "Herramienta: catalogo.precio() → cotización Q-2291" },
    { k: ["pedido", "orden", "estado", "4821", "rastreo"], r: "Encontré tu pedido <b>#4821</b>.<div class='card'>Estado: <b>En camino</b><br>Entrega estimada: mañana, 10:00 a 14:00</div>", l: "Herramienta: erp.consultar_pedido(4821) → en tránsito" },
    { k: ["asesor", "humano", "persona"], r: "Te conecto con <b>Laura</b>, del equipo comercial. Ya le compartí el resumen de la conversación para que no tengas que repetir nada.", l: "Escalado a una persona · resumen enviado al CRM" },
    { k: ["hola", "buenas", "buenos"], r: "¡Hola! Te ayudo con envíos, cotizaciones, el estado de tu pedido o te paso con un asesor.", l: "Intención: saludo" },
    { k: ["horario", "abren", "hora"], r: "Atendemos de <b>lunes a sábado, de 8:00 a 19:00</b>. Este asistente responde las 24 horas.", l: "Intención: horarios → base de conocimiento" },
    { k: ["gracias"], r: "Con gusto. Aquí estaré si necesitas algo más.", l: "Conversación resuelta · encuesta enviada" },
  ];
  const reply = (text) => {
    const tl = text.toLowerCase(), rule = RULES.find((r) => r.k.some((k) => tl.includes(k)));
    const typing = addMsg("<i></i><i></i><i></i>", "bot"); typing.classList.add("msg--typing");
    log("Mensaje recibido · analizando intención");
    setTimeout(() => {
      typing.remove();
      if (rule) { addMsg(rule.r, "bot"); log(rule.l); }
      else { addMsg("En esta demo respondo sobre <b>envíos, cotizaciones, pedidos y horarios</b>. Con tu negocio, respondería con tu propia información.", "bot"); log("Intención no reconocida → sugerencias"); }
    }, 800 + Math.random() * 500);
  };
  $("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); const v = chatInput.value.trim(); if (!v) return; addMsg(v, "user"); chatInput.value = ""; reply(v); });
  $$("#chatChips button").forEach((b) => b.addEventListener("click", () => { addMsg(b.textContent, "user"); reply(b.textContent); }));

  const fcCanvas = $("#fcCanvas"), fctx = fcCanvas.getContext("2d");
  const rMkt = $("#rMkt"), rPrice = $("#rPrice"), rSeason = $("#rSeason");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const history = [420, 390, 450, 470, 510, 540, 520, 560, 600, 640, 720, 860];
  let fcVals = null;
  const computeForecast = () => {
    const mkt = +rMkt.value / 100, price = +rPrice.value / 100, season = [0.5, 1, 1.6][+rSeason.value], base = history.at(-1) * 0.82;
    return Array.from({ length: 6 }, (_, k) => Math.max(80, (base + 14 * (k + 1) + Math.sin(((k + 1) / 6) * Math.PI) * 60 * season) * (1 + mkt * 0.6) * (1 - price * 1.3)));
  };
  function drawForecast(values = fcVals || computeForecast()) {
    const w = fcCanvas.offsetWidth, h = 320;
    if (!w) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    fcCanvas.width = w * dpr; fcCanvas.height = h * dpr; fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.clearRect(0, 0, w, h);
    const pad = { l: 42, r: 10, t: 16, b: 28 }, all = [...history, ...values];
    const max = Math.max(...all.map((v, i) => (i >= history.length ? v * 1.2 : v))) * 1.06;
    const X = (i) => pad.l + (i / (all.length - 1)) * (w - pad.l - pad.r), Y = (v) => h - pad.b - (v / max) * (h - pad.t - pad.b);
    fctx.font = '11px "Geist Mono", monospace'; fctx.strokeStyle = "#1F1F1F"; fctx.fillStyle = "#6B6B68"; fctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) { const v = (max / 4) * g; fctx.beginPath(); fctx.moveTo(pad.l, Y(v)); fctx.lineTo(w - pad.r, Y(v)); fctx.stroke(); fctx.textAlign = "right"; fctx.fillText(Math.round(v), pad.l - 8, Y(v) + 4); }
    fctx.textAlign = "center";
    const step = w < 520 ? 3 : 1;
    all.forEach((_, i) => { if (i % step === 0) fctx.fillText(months[i], X(i), h - 8); });
    const xNow = X(history.length - 1);
    fctx.setLineDash([2, 4]); fctx.strokeStyle = "#444"; fctx.beginPath(); fctx.moveTo(xNow, pad.t); fctx.lineTo(xNow, h - pad.b); fctx.stroke(); fctx.setLineDash([]);
    fctx.fillStyle = "#8A8A86"; fctx.fillText("HOY", xNow, pad.t + 2);
    const idx = values.map((_, k) => history.length + k);
    fctx.beginPath(); fctx.moveTo(xNow, Y(history.at(-1)));
    idx.forEach((i, k) => fctx.lineTo(X(i), Y(values[k] * (1 + 0.04 * (k + 1)))));
    for (let k = values.length - 1; k >= 0; k--) fctx.lineTo(X(idx[k]), Y(values[k] * (1 - 0.04 * (k + 1))));
    fctx.closePath(); fctx.fillStyle = "rgba(255,255,255,.12)"; fctx.fill();
    fctx.beginPath(); history.forEach((v, i) => (i ? fctx.lineTo(X(i), Y(v)) : fctx.moveTo(X(i), Y(v))));
    fctx.strokeStyle = "#8A8A86"; fctx.lineWidth = 2; fctx.lineJoin = "round"; fctx.stroke();
    fctx.beginPath(); fctx.moveTo(xNow, Y(history.at(-1))); idx.forEach((i, k) => fctx.lineTo(X(i), Y(values[k])));
    fctx.strokeStyle = W; fctx.lineWidth = 2; fctx.setLineDash([6, 5]); fctx.stroke(); fctx.setLineDash([]);
    idx.forEach((i, k) => { fctx.fillStyle = W; fctx.beginPath(); fctx.arc(X(i), Y(values[k]), 3.5, 0, 7); fctx.fill(); });
  }
  const updateForecast = () => {
    $("#oMkt").textContent = `+${rMkt.value}%`; $("#oPrice").textContent = `${rPrice.value > 0 ? "+" : ""}${rPrice.value}%`; $("#oSeason").textContent = ["Baja", "Media", "Alta"][+rSeason.value];
    const target = computeForecast(), from = fcVals || target.map(() => history.at(-1)), start = performance.now();
    const tick = (now) => { const p = Math.min((now - start) / 420, 1), e = 1 - Math.pow(1 - p, 3); fcVals = from.map((v, i) => v + (target[i] - v) * e); drawForecast(fcVals); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    $("#fcTotal").textContent = fmt(Math.round(target.reduce((a, b) => a + b, 0)));
    $("#fcStock").textContent = fmt(Math.round(target[0] * 1.15));
  };
  [rMkt, rPrice, rSeason].forEach((r) => r.addEventListener("input", updateForecast));
  updateForecast();

  const pipe = $("#pipe"), runBtn = $("#pipeRun"), term = $("#pipeTerm");
  let running = false;
  const tline = (html) => { term.insertAdjacentHTML("beforeend", `\n${html}`); term.scrollTop = term.scrollHeight; };
  runBtn.addEventListener("click", async () => {
    if (running) return;
    running = true; runBtn.disabled = true; runBtn.textContent = "Ejecutando…";
    term.textContent = "$ skylab pipeline run ventas_unificadas";
    $$(".node", pipe).forEach((n) => n.classList.remove("is-on")); pipe.classList.add("is-run");
    const srcs = $$('[data-n="src"]'), dsts = $$('[data-n="dst"]'), counts = [18420, 6210, 41877, 3904];
    const plan = [
      [12, "Extrayendo", "[extract] Shopify → 18.420 pedidos", 0], [24, "Extrayendo", "[extract] Excel de ventas → 6.210 filas", 1],
      [38, "Extrayendo", "[extract] ERP → 41.877 movimientos", 2], [50, "Extrayendo", "[extract] WhatsApp → 3.904 conversaciones", 3],
      [66, "Limpiando", "[transform] fechas, monedas y códigos normalizados"], [80, "Deduplicando", "[transform] 1.284 registros duplicados eliminados"],
      [92, "Validando", "[quality] 42 de 42 pruebas superadas"], [100, "Completado", "<b>✓ Pipeline completado en 3,2 s · datos disponibles</b>"],
    ];
    let total = 0;
    for (const [pct, status, msg, si] of plan) {
      await sleep(460);
      $("#pipeBar").style.width = `${pct}%`; $("#pipeStatus").textContent = `${status}… ${pct}%`; tline(msg);
      if (si !== undefined) { srcs[si].classList.add("is-on"); total += counts[si]; $("#pRows").textContent = fmt(total); }
      if (pct === 80) { $("#pDup").textContent = "1.284"; $("#pRows").textContent = fmt(total - 1284); }
      if (pct === 92) $("#pQual").textContent = "99,2 %";
      if (pct === 100) { $("#pipeCore").classList.add("is-on"); dsts.forEach((d, i) => setTimeout(() => d.classList.add("is-on"), i * 150)); }
    }
    $("#pipeStatus").textContent = "Sincronizado"; pipe.classList.remove("is-run");
    runBtn.disabled = false; runBtn.textContent = "Ejecutar de nuevo"; running = false;
  });

  const rPeople = $("#rPeople"), rHours = $("#rHours"), rCost = $("#rCost"), rAuto = $("#rAuto"), roiSave = $("#roiSave");
  let shownSave = 0, roiAnim = 0;
  const updateROI = () => {
    const people = +rPeople.value, hours = +rHours.value, cost = +rCost.value, auto = +rAuto.value / 100;
    $("#oPeople").textContent = people; $("#oHours").textContent = hours; $("#oCost").textContent = `$${cost}`; $("#oAuto").textContent = `${rAuto.value}%`;
    const now = people * hours * 48, freed = now * auto, save = freed * cost;
    const plan = people <= 10 ? ["Esencial", 49 * 12] : people <= 60 ? ["Crecimiento", 390 * 12] : ["Corporativo", 2500 * 12];
    $("#roiHours").textContent = fmt(Math.round(freed)); $("#roiX").textContent = `${fmt(save / plan[1], 1)}x`; $("#roiPlan").textContent = plan[0];
    $("#roiNow").textContent = `${fmt(Math.round(now))} h`; $("#roiNew").textContent = `${fmt(Math.round(now - freed))} h`;
    $("#barNow").style.transform = "scaleX(1)"; $("#barNew").style.transform = `scaleX(${1 - auto})`;
    const from = shownSave, start = performance.now(), my = ++roiAnim;
    const tick = (t) => { if (my !== roiAnim) return; const p = Math.min((t - start) / 500, 1), e = 1 - Math.pow(1 - p, 3); shownSave = from + (save - from) * e; roiSave.textContent = fmt(Math.round(shownSave)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  [rPeople, rHours, rCost, rAuto].forEach((r) => r.addEventListener("input", updateROI));
  updateROI();

  $$(".billing button").forEach((b) => b.addEventListener("click", () => {
    const y = b.dataset.bill === "y";
    $$(".billing button").forEach((x) => x.classList.toggle("is-on", x === b));
    $$(".plan__price b[data-m]").forEach((p) => { p.classList.add("out"); setTimeout(() => { p.textContent = y ? p.dataset.y : p.dataset.m; p.classList.remove("out"); }, 200); });
  }));

  const form = $("#contactForm"), formMsg = $("#formMsg"), sendBtn = $("#sendBtn");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    $$("input[required]:not([type=radio])", form).forEach((el) => { const v = el.checkValidity() && el.value.trim() !== ""; el.closest(".field").classList.toggle("is-bad", !v); if (!v) ok = false; });
    const radio = !!$("input[name=tamano]:checked", form);
    $(".field--seg", form).classList.toggle("is-bad", !radio); if (!radio) ok = false;
    if (!ok) { formMsg.className = "form__msg err"; formMsg.textContent = "Revisa los campos marcados."; return; }
    sendBtn.classList.add("is-sending"); sendBtn.innerHTML = 'Enviando <span aria-hidden="true">◌</span>';
    formMsg.className = "form__msg"; formMsg.textContent = "";
    await sleep(1100);
    const name = $("#fName").value.trim().split(" ")[0];
    sendBtn.classList.remove("is-sending"); sendBtn.innerHTML = 'Solicitar demo <span aria-hidden="true">→</span>';
    formMsg.className = "form__msg ok"; formMsg.textContent = `Gracias, ${name}. Te escribiremos en menos de 24 horas.`;
    form.reset();
  });
  $$("input, textarea", form).forEach((el) => el.addEventListener("input", () => el.closest(".field")?.classList.remove("is-bad")));
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#newsMail");
    if (!input.checkValidity()) { $("#newsMsg").textContent = "Escribe un correo válido."; return; }
    input.value = ""; $("#newsMsg").textContent = "Listo. Recibirás el próximo boletín.";
  });
  $("#year").textContent = new Date().getFullYear();

  const onScroll = () => { nav.classList.toggle("is-scrolled", scrollY > 10); updateMethod(); };
  addEventListener("scroll", onScroll, { passive: true });
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { sizeTopo(); peekSt.size(); if (dSt.on) dSt.size(); drawForecast(); onScroll(); }, 120); });
  sizeTopo(); updateSize(); onScroll();

  let lastTopo = 0;
  const loop = (t) => {
    if (topoVisible && t - lastTopo > 40) { drawTopo(t); lastTopo = t; }
    peekSt.draw(t); dSt.draw(t);
    if (!RM) requestAnimationFrame(loop);
  };
  if (RM) drawTopo(0); else requestAnimationFrame(loop);
})();
