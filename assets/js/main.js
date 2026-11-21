(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n, d = 0) => n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  root.classList.add("js");
  const ready = () => root.classList.add("is-ready");
  if (document.readyState === "complete") setTimeout(ready, 60); else addEventListener("load", () => setTimeout(ready, 60));
  setTimeout(ready, 1500);

  /* ---------------------------------------------------------------
     Catálogo: 5 familias, 19 soluciones de IA.
     El color de cada familia es el mismo de su nube en el espacio de embeddings 3D.
  ---------------------------------------------------------------- */
  const CATS = {
    datos: { name: "Datos y BI", color: "#00A6FF" },
    gen: { name: "IA Generativa", color: "#FFFFFF" },
    pred: { name: "Analítica Predictiva", color: "#5C78FF" },
    vv: { name: "Visión y Voz", color: "#9DB4FF" },
    ops: { name: "Operaciones", color: "#A9A9A5" },
  };

  const MODULES = [
    { name: "Nexus", cat: "datos", short: "Plataforma de datos administrada",
      tagline: "Todos tus datos, una sola fuente de verdad.",
      desc: "Conecta tus sistemas, limpia la información y la organiza por capas en una plataforma lista para análisis e inteligencia artificial.",
      feats: ["Conectores a ERP, CRM, Excel y tiendas online", "Flujos ETL/ELT programados y monitoreados", "Capas bronce, plata y oro con trazabilidad"],
      uses: ["Unificar ventas físicas y online", "Consolidar varias sedes", "Base confiable para reportes y modelos"] },
    { name: "Insight", cat: "datos", short: "Tableros y preguntas en español",
      tagline: "Pregúntale a tus datos en español.",
      desc: "Tableros en tiempo real y un copiloto que responde preguntas de negocio en lenguaje natural, con el gráfico y la consulta detrás.",
      feats: ["Preguntas en español, respuestas con gráfico", "Indicadores por área y por sede", "Reportes automáticos por correo"],
      uses: ["Tablero de gerencia", "Seguimiento comercial", "Análisis sin depender de TI"] },
    { name: "Forge", cat: "datos", short: "Modelos a medida y MLOps", isNew: true,
      tagline: "Tu propio modelo de IA, en producción y vigilado.",
      desc: "Entrenamos, desplegamos y monitoreamos modelos de machine learning hechos para tu problema, con versionado, alertas de desempeño y re-entrenamiento.",
      feats: ["Entrenamiento con tus datos de Nexus", "Despliegue como API o en tu nube", "Monitoreo de deriva y re-entrenamiento"],
      uses: ["Modelos de riesgo propios", "Clasificadores por industria", "Ajuste fino de modelos de lenguaje"] },

    { name: "Agents", cat: "gen", short: "Agentes de atención al cliente",
      tagline: "Atención 24/7 que sí resuelve.",
      desc: "Agentes de IA que conversan con tus clientes por WhatsApp, web e Instagram: responden, cotizan, agendan y pasan a una persona cuando hace falta.",
      feats: ["Aprende de tus documentos y catálogo", "Consulta pedidos e inventario en tus sistemas", "Escala a tu equipo con todo el contexto"],
      uses: ["Preguntas frecuentes y horarios", "Cotizaciones automáticas", "Seguimiento de pedidos"] },
    { name: "Copilot", cat: "gen", short: "Asistente interno con tus documentos", isNew: true,
      tagline: "Todo lo que sabe tu empresa, a una pregunta de distancia.",
      desc: "Un asistente para tu equipo que responde con base en manuales, políticas, contratos y correos internos, citando siempre el documento de origen.",
      feats: ["Búsqueda semántica en tus documentos", "Respuestas con cita a la fuente", "Permisos según el rol de cada persona"],
      uses: ["Inducción de nuevos empleados", "Soporte interno de TI y RR. HH.", "Consulta de procedimientos y normas"] },
    { name: "DocAI", cat: "gen", short: "Lectura inteligente de documentos",
      tagline: "Documentos que se procesan solos.",
      desc: "Extrae los datos de facturas, contratos, órdenes y formularios en segundos, los valida contra tus reglas y los envía a tu contabilidad o ERP.",
      feats: ["Lectura de PDF, fotos y escaneos", "Validación automática de campos", "Flujo de aprobación incluido"],
      uses: ["Cuentas por pagar", "Revisión de contratos", "Digitalización de formularios"] },
    { name: "Studio", cat: "gen", short: "Contenido de marketing con IA", isNew: true,
      tagline: "Campañas listas en minutos, con la voz de tu marca.",
      desc: "Genera textos, descripciones de producto, imágenes y piezas para redes alineadas con tu manual de marca, y mide cuál funciona mejor.",
      feats: ["Plantillas con tu tono y tu marca", "Descripciones de catálogo en lote", "Pruebas A/B y métricas por pieza"],
      uses: ["Fichas de producto para e-commerce", "Calendario de redes sociales", "Correos de campaña personalizados"] },

    { name: "Forecast", cat: "pred", short: "Pronóstico de demanda y ventas",
      tagline: "Anticipa la demanda antes de que llegue.",
      desc: "Modelos de machine learning que pronostican ventas y demanda por producto, sede y temporada para que compres y produzcas lo justo.",
      feats: ["Pronóstico por producto y por sede", "Escenarios de precio, campañas y temporada", "Alertas de quiebre y sobre-stock"],
      uses: ["Planeación de compras", "Producción por temporada", "Dimensionamiento de personal"] },
    { name: "Pulse", cat: "pred", short: "Segmentación y retención de clientes",
      tagline: "Conoce a cada cliente.",
      desc: "Segmenta a tus clientes automáticamente, predice quién está por irse y recomienda la mejor oferta para cada uno.",
      feats: ["Segmentos automáticos por comportamiento", "Riesgo de abandono por cliente", "Recomendación de productos"],
      uses: ["Campañas de retención", "Programas de fidelización", "Venta cruzada"] },
    { name: "Price", cat: "pred", short: "Precios dinámicos y promociones", isNew: true,
      tagline: "El precio correcto, en el momento correcto.",
      desc: "Mide la sensibilidad al precio de cada producto y recomienda precios y promociones que protegen el margen sin perder ventas.",
      feats: ["Elasticidad por producto y canal", "Simulador de promociones", "Monitoreo de precios de la competencia"],
      uses: ["Liquidación de inventario", "Precios por temporada", "Descuentos rentables"] },
    { name: "Leads", cat: "pred", short: "Puntaje de prospectos y ventas", isNew: true,
      tagline: "Tu equipo comercial, llamando primero a quien sí va a comprar.",
      desc: "Califica cada prospecto según su probabilidad de compra, sugiere el siguiente paso y redacta la propuesta comercial con los datos de tu CRM.",
      feats: ["Puntaje de cierre por prospecto", "Siguiente mejor acción sugerida", "Propuestas generadas desde el CRM"],
      uses: ["Priorizar la agenda comercial", "Pronóstico del embudo de ventas", "Seguimiento automático"] },
    { name: "Shield", cat: "pred", short: "Detección de fraude y anomalías",
      tagline: "Detecta lo inusual antes de que cueste.",
      desc: "Monitorea transacciones, inventario y operaciones en tiempo real para encontrar fraude, errores y comportamientos fuera de lo normal.",
      feats: ["Detección de anomalías en tiempo real", "Puntaje de riesgo por transacción", "Explicación de cada alerta"],
      uses: ["Fraude en pagos y devoluciones", "Diferencias de inventario", "Errores contables"] },

    { name: "Vision", cat: "vv", short: "Visión por computador", isNew: true,
      tagline: "Cámaras que entienden lo que ven.",
      desc: "Modelos de visión que inspeccionan calidad, cuentan productos, leen placas y etiquetas, y vigilan la seguridad en planta usando tus cámaras actuales.",
      feats: ["Inspección de defectos en línea", "Conteo y reconocimiento de productos", "Alertas de seguridad industrial (EPP)"],
      uses: ["Control de calidad en manufactura", "Auditoría de góndolas", "Lectura de placas y etiquetas"] },
    { name: "Voice", cat: "vv", short: "Agentes de voz y call center", isNew: true,
      tagline: "Llamadas atendidas al primer timbre.",
      desc: "Agentes de voz naturales que atienden y hacen llamadas, agendan citas y cobran, y analizan el 100 % de las conversaciones de tu call center.",
      feats: ["Voz natural en español latino", "Transcripción y análisis de sentimiento", "Integración con tu conmutador"],
      uses: ["Confirmación de citas", "Cobranza preventiva", "Calidad del call center"] },
    { name: "Meet", cat: "vv", short: "Actas y tareas de cada reunión", isNew: true,
      tagline: "Ninguna decisión se pierde después de una reunión.",
      desc: "Transcribe tus reuniones, resume decisiones, asigna tareas a cada responsable y las envía a tus herramientas de trabajo.",
      feats: ["Transcripción en español e inglés", "Resumen, decisiones y pendientes", "Envío a correo, CRM o gestor de tareas"],
      uses: ["Comités de gerencia", "Reuniones con clientes", "Seguimiento de proyectos"] },

    { name: "Flow", cat: "ops", short: "Automatización de procesos con IA",
      tagline: "El trabajo repetitivo, automatizado.",
      desc: "Diseña flujos que conectan tus aplicaciones y agregan pasos inteligentes con IA: clasificar, resumir, decidir y avisar.",
      feats: ["Constructor visual sin código", "Pasos con IA dentro del flujo", "Más de 300 integraciones"],
      uses: ["Facturación y cobranza", "Clasificación de correos", "Sincronización entre sistemas"] },
    { name: "Route", cat: "ops", short: "Logística y rutas óptimas", isNew: true,
      tagline: "Más entregas, menos kilómetros.",
      desc: "Optimiza rutas de reparto, asigna pedidos a vehículos y predice tiempos de entrega con tráfico, ventanas horarias y capacidad de carga.",
      feats: ["Ruteo con restricciones reales", "Seguimiento en tiempo real", "Tiempo estimado de entrega por pedido"],
      uses: ["Distribución urbana", "Visitas de fuerza de ventas", "Recolección y logística inversa"] },
    { name: "Sentinel", cat: "ops", short: "Mantenimiento predictivo", isNew: true,
      tagline: "Repara la máquina antes de que falle.",
      desc: "Lee sensores y registros de tus equipos para predecir fallas, programar mantenimientos y reducir paradas no planeadas.",
      feats: ["Conexión a sensores e IoT", "Probabilidad de falla por equipo", "Órdenes de trabajo automáticas"],
      uses: ["Líneas de producción", "Flotas de vehículos", "Refrigeración y energía"] },
    { name: "Talent", cat: "ops", short: "IA para recursos humanos", isNew: true,
      tagline: "Contrata mejor y retén a tu equipo.",
      desc: "Filtra hojas de vida según el perfil, agenda entrevistas, responde dudas de colaboradores y alerta sobre riesgo de rotación.",
      feats: ["Preselección de candidatos explicada", "Asistente de RR. HH. para colaboradores", "Indicadores de clima y rotación"],
      uses: ["Contratación masiva", "Inducción de personal", "Retención de talento"] },
  ];

  const INDUSTRIES = [
    { name: "Retail y e-commerce", uses: ["Pronóstico de demanda por tienda", "Agentes de venta en WhatsApp", "Precios y promociones dinámicas"], mods: ["Forecast", "Agents", "Price"] },
    { name: "Manufactura", uses: ["Inspección de calidad con cámaras", "Mantenimiento predictivo", "Planeación de producción"], mods: ["Vision", "Sentinel", "Forecast"] },
    { name: "Salud", uses: ["Agendamiento y confirmación de citas", "Lectura de órdenes y autorizaciones", "Asistente para personal clínico"], mods: ["Voice", "DocAI", "Copilot"] },
    { name: "Finanzas y seguros", uses: ["Detección de fraude", "Análisis de documentos de crédito", "Cobranza preventiva"], mods: ["Shield", "DocAI", "Voice"] },
    { name: "Logística y transporte", uses: ["Ruteo y tiempos de entrega", "Mantenimiento de flota", "Seguimiento al cliente"], mods: ["Route", "Sentinel", "Agents"] },
    { name: "Agro y alimentos", uses: ["Pronóstico de cosecha y demanda", "Control de calidad de producto", "Trazabilidad de lotes"], mods: ["Forecast", "Vision", "Nexus"] },
    { name: "Educación", uses: ["Asistente para estudiantes 24/7", "Alertas de deserción", "Gestión documental"], mods: ["Agents", "Pulse", "DocAI"] },
    { name: "Servicios profesionales", uses: ["Actas y tareas de reuniones", "Propuestas comerciales con IA", "Base de conocimiento interna"], mods: ["Meet", "Leads", "Copilot"] },
  ];

  const emit = (type, detail) => dispatchEvent(new CustomEvent(`skylab:${type}`, { detail }));

  /* ---------------- Menú ---------------- */
  const burger = $("#burger"), menu = $("#menu");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open); burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open)); menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("lock", open);
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------------- Capítulos → escena 3D ---------------- */
  const chapters = $$("main section[data-scene]");
  const dots = $("#dots");
  dots.innerHTML = chapters.map((c, i) => `<a href="#${c.id}" aria-label="${c.dataset.label}" title="${String(i).padStart(2, "0")} · ${c.dataset.label}"><i></i></a>`).join("");
  const dotEls = $$("a", dots);
  let curScene = null, curIdx = -1;
  const updateChapter = () => {
    const mid = innerHeight * 0.5;
    let idx = 0;
    chapters.forEach((c, i) => { if (c.getBoundingClientRect().top <= mid) idx = i; });
    if (idx === curIdx) return;
    curIdx = idx;
    dotEls.forEach((d, i) => d.classList.toggle("is-on", i === idx));
    $$("a", menu).forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === `#${chapters[idx].id}`));
    const s = chapters[idx].dataset.scene;
    if (s !== curScene) { curScene = s; root.dataset.scene = s; emit("scene", { name: s }); }
  };

  /* ---------------- Revelado al hacer scroll ---------------- */
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const watch = (els) => els.forEach((el, i) => { el.style.setProperty("--d", `${Math.min(i % 6, 5) * 0.06}s`); revObs.observe(el); });
  $$(".chap__txt > *:not(.load)").forEach((el) => el.classList.add("rv"));
  watch($$(".rv"));

  /* ---------------- Palabra rotativa del hero ---------------- */
  const swap = $("#swap");
  const WORDS = ["decisiones", "ventas", "predicciones", "eficiencia", "crecimiento"];
  if (!RM) {
    (async () => {
      await sleep(3200);
      let i = 0;
      for (;;) {
        const cur = WORDS[i], next = WORDS[(i + 1) % WORDS.length];
        for (let k = cur.length; k >= 0; k--) { swap.textContent = cur.slice(0, k) || "​"; await sleep(36); }
        await sleep(160);
        for (let k = 1; k <= next.length; k++) { swap.textContent = next.slice(0, k); await sleep(68); }
        i = (i + 1) % WORDS.length;
        await sleep(2600);
      }
    })();
  }

  /* ---------------- Soluciones ---------------- */
  const modsEl = $("#mods"), filters = $("#filters");
  $("#modCount").textContent = MODULES.length;
  filters.innerHTML = [`<button type="button" role="tab" class="is-on" data-cat="all" aria-selected="true">Todas <i>${MODULES.length}</i></button>`]
    .concat(Object.entries(CATS).map(([k, c]) => `<button type="button" role="tab" data-cat="${k}" aria-selected="false" style="--c:${c.color}"><b></b>${c.name} <i>${MODULES.filter((m) => m.cat === k).length}</i></button>`)).join("");
  modsEl.innerHTML = MODULES.map((m, i) => `
    <button type="button" class="mod" role="listitem" data-i="${i}" data-cat="${m.cat}" style="--c:${CATS[m.cat].color}">
      <span class="mod__top"><span class="mod__n">${String(i + 1).padStart(2, "0")}</span>${m.isNew ? '<span class="mod__new">Nuevo</span>' : ""}</span>
      <span class="mod__cat"><b></b>${CATS[m.cat].name}</span>
      <span class="mod__name"><small>SkyLab</small> ${m.name}</span>
      <span class="mod__short">${m.short}</span>
      <span class="mod__tag">${m.tagline}</span>
      <span class="mod__go" aria-hidden="true">Ver detalle →</span>
    </button>`).join("");
  watch($$(".mod", modsEl));
  $$(".mod", modsEl).forEach((card) => {
    card.addEventListener("click", () => openDrawer(+card.dataset.i));
    card.addEventListener("pointerenter", () => emit("focus", { cat: card.dataset.cat }));
    card.addEventListener("pointerleave", () => emit("focus", { cat: activeCat === "all" ? null : activeCat }));
  });
  let activeCat = "all";
  $$("button", filters).forEach((b) => b.addEventListener("click", () => {
    activeCat = b.dataset.cat;
    $$("button", filters).forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", String(on)); });
    $$(".mod", modsEl).forEach((m) => m.classList.toggle("is-hidden", activeCat !== "all" && m.dataset.cat !== activeCat));
    emit("focus", { cat: activeCat === "all" ? null : activeCat });
  }));

  const sel = $("#fInterest");
  sel.insertAdjacentHTML("beforeend", MODULES.map((m) => `<option value="${m.name}">SkyLab ${m.name} · ${m.short}</option>`).join(""));

  /* ---------------- Drawer de detalle ---------------- */
  const drawer = $("#drawer");
  let dIdx = 0, lastFocus = null;
  const fillDrawer = (i) => {
    dIdx = (i + MODULES.length) % MODULES.length;
    const m = MODULES[dIdx], c = CATS[m.cat];
    drawer.style.setProperty("--c", c.color);
    $("#dCode").textContent = `${String(dIdx + 1).padStart(2, "0")} / ${MODULES.length}`;
    $("#dCat").innerHTML = `<b></b>${c.name}`;
    $("#dTitle").innerHTML = `<small>SkyLab</small> ${m.name}`;
    $("#dGlyph").textContent = m.name;
    $("#dTag").textContent = m.tagline;
    $("#dDesc").textContent = m.desc;
    $("#dFeats").innerHTML = m.feats.map((f) => `<li>${f}</li>`).join("");
    $("#dUses").innerHTML = m.uses.map((f) => `<li>${f}</li>`).join("");
    $("#dCta").dataset.module = m.name;
    emit("focus", { cat: m.cat });
  };
  const openDrawer = (i) => {
    lastFocus = document.activeElement;
    fillDrawer(i);
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); document.body.classList.add("lock");
    setTimeout(() => $("[data-close]:not(.drawer__bg)", drawer).focus(), 50);
  };
  const closeDrawer = () => {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("lock");
    emit("focus", { cat: activeCat === "all" ? null : activeCat });
    lastFocus?.focus({ preventScroll: true });
  };
  $$("[data-close]", drawer).forEach((b) => b.addEventListener("click", closeDrawer));
  $("#dCta").addEventListener("click", (e) => { sel.value = e.currentTarget.dataset.module || ""; });
  $("#dPrev").addEventListener("click", () => fillDrawer(dIdx - 1));
  $("#dNext").addEventListener("click", () => fillDrawer(dIdx + 1));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeDrawer(); setMenu(false); }
    if (!drawer.classList.contains("is-open")) return;
    if (e.key === "ArrowRight") fillDrawer(dIdx + 1);
    if (e.key === "ArrowLeft") fillDrawer(dIdx - 1);
  });

  /* ---------------- Industrias ---------------- */
  const modCat = Object.fromEntries(MODULES.map((m) => [m.name, m.cat]));
  $("#inds").innerHTML = INDUSTRIES.map((ind, i) => `
    <article class="ind glass">
      <p class="ind__n">${String(i + 1).padStart(2, "0")}</p>
      <h3>${ind.name}</h3>
      <ul>${ind.uses.map((u) => `<li>${u}</li>`).join("")}</ul>
      <p class="ind__mods">${ind.mods.map((m) => `<button type="button" style="--c:${CATS[modCat[m]].color}" data-m="${m}">${m}</button>`).join("")}</p>
    </article>`).join("");
  watch($$(".ind"));
  $$(".ind__mods button").forEach((b) => b.addEventListener("click", () => openDrawer(MODULES.findIndex((m) => m.name === b.dataset.m))));

  /* ---------------- Rangos ---------------- */
  const paint = (r) => r.style.setProperty("--fill", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
  $$('input[type="range"]').forEach((r) => { paint(r); r.addEventListener("input", () => paint(r)); });

  /* ---------------- Consola de demos ---------------- */
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
    fctx.font = '11px "JetBrains Mono", monospace'; fctx.strokeStyle = "rgba(255,255,255,.07)"; fctx.fillStyle = "#6B6B68"; fctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) { const v = (max / 4) * g; fctx.beginPath(); fctx.moveTo(pad.l, Y(v)); fctx.lineTo(w - pad.r, Y(v)); fctx.stroke(); fctx.textAlign = "right"; fctx.fillText(Math.round(v), pad.l - 8, Y(v) + 4); }
    fctx.textAlign = "center";
    const step = w < 520 ? 3 : 1;
    all.forEach((_, i) => { if (i % step === 0) fctx.fillText(months[i], X(i), h - 8); });
    const xNow = X(history.length - 1);
    fctx.setLineDash([2, 4]); fctx.strokeStyle = "rgba(255,255,255,.25)"; fctx.beginPath(); fctx.moveTo(xNow, pad.t); fctx.lineTo(xNow, h - pad.b); fctx.stroke(); fctx.setLineDash([]);
    fctx.fillStyle = "#8A8A86"; fctx.fillText("HOY", xNow, pad.t + 2);
    const idx = values.map((_, k) => history.length + k);
    fctx.beginPath(); fctx.moveTo(xNow, Y(history.at(-1)));
    idx.forEach((i, k) => fctx.lineTo(X(i), Y(values[k] * (1 + 0.04 * (k + 1)))));
    for (let k = values.length - 1; k >= 0; k--) fctx.lineTo(X(idx[k]), Y(values[k] * (1 - 0.04 * (k + 1))));
    fctx.closePath(); fctx.fillStyle = "rgba(43,75,255,.22)"; fctx.fill();
    fctx.beginPath(); history.forEach((v, i) => (i ? fctx.lineTo(X(i), Y(v)) : fctx.moveTo(X(i), Y(v))));
    fctx.strokeStyle = "#C8C8C4"; fctx.lineWidth = 2; fctx.lineJoin = "round"; fctx.stroke();
    fctx.beginPath(); fctx.moveTo(xNow, Y(history.at(-1))); idx.forEach((i, k) => fctx.lineTo(X(i), Y(values[k])));
    fctx.strokeStyle = "#00A6FF"; fctx.lineWidth = 2; fctx.setLineDash([6, 5]); fctx.stroke(); fctx.setLineDash([]);
    idx.forEach((i, k) => { fctx.fillStyle = "#00A6FF"; fctx.beginPath(); fctx.arc(X(i), Y(values[k]), 3.5, 0, 7); fctx.fill(); });
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
    $("#pRows").textContent = "0"; $("#pDup").textContent = "0"; $("#pQual").textContent = "—";
    const srcs = $$('[data-n="src"]'), dsts = $$('[data-n="dst"]'), counts = [18420, 6210, 41877, 3904];
    const plan = [
      [12, "Extrayendo", "[bronce] Shopify → 18.420 pedidos", 0], [24, "Extrayendo", "[bronce] Excel de ventas → 6.210 filas", 1],
      [38, "Extrayendo", "[bronce] ERP → 41.877 movimientos", 2], [50, "Extrayendo", "[bronce] WhatsApp → 3.904 conversaciones", 3],
      [66, "Limpiando", "[plata] fechas, monedas y códigos normalizados"], [80, "Deduplicando", "[plata] 1.284 registros duplicados eliminados"],
      [92, "Validando", "[oro] 42 de 42 pruebas de calidad superadas"], [100, "Completado", "<b>✓ Pipeline completado en 3,2 s · datos disponibles</b>"],
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

  /* ---------------- Calculadora de ahorro ---------------- */
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

  /* ---------------- Formulario ---------------- */
  const form = $("#contactForm"), formMsg = $("#formMsg"), sendBtn = $("#sendBtn");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let ok = true;
    $$("input[required]:not([type=radio])", form).forEach((el) => { const v = el.checkValidity() && el.value.trim() !== ""; el.closest(".field").classList.toggle("is-bad", !v); if (!v) ok = false; });
    const radio = !!$("input[name=tamano]:checked", form);
    $(".field--seg", form).classList.toggle("is-bad", !radio); if (!radio) ok = false;
    if (!ok) { formMsg.className = "form__msg err"; formMsg.textContent = "Revisa los campos marcados."; return; }
    sendBtn.disabled = true; sendBtn.innerHTML = 'Enviando <span aria-hidden="true">◌</span>';
    formMsg.className = "form__msg"; formMsg.textContent = "";
    // TODO: conectar a un backend o a un servicio como Formspree.
    await sleep(1100);
    const name = $("#fName").value.trim().split(" ")[0];
    sendBtn.disabled = false; sendBtn.innerHTML = 'Solicitar demo <span aria-hidden="true">→</span>';
    formMsg.className = "form__msg ok"; formMsg.textContent = `Gracias, ${name}. Te escribiremos en menos de 24 horas.`;
    emit("launch", {});
    form.reset();
  });
  $$("input, textarea, select", form).forEach((el) => el.addEventListener("input", () => el.closest(".field")?.classList.remove("is-bad")));
  $("#year").textContent = new Date().getFullYear();

  /* ---------------- Scroll ---------------- */
  const nav = $("#nav");
  const onScroll = () => { nav.classList.toggle("is-scrolled", scrollY > 10); updateChapter(); };
  addEventListener("scroll", onScroll, { passive: true });
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { drawForecast(); onScroll(); }, 120); });
  onScroll();
  // La escena es un módulo y carga después: le reenviamos el capítulo actual.
  addEventListener("skylab:scene-ready", () => { emit("scene", { name: curScene }); });
})();
