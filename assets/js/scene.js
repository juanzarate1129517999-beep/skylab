/* SKYLAB · Escena 3D
   Una sola nube de partículas que cambia de forma según el capítulo visible:
   red neuronal → fuentes de datos → lakehouse → espacio de embeddings →
   atención de un transformer → métricas en 3D → superficie de pérdida.
   main.js avisa el capítulo con el evento skylab:scene. */
import * as THREE from "../vendor/three.module.min.js";

const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const PAL = {
  white: hex("#FFFFFF"), light: hex("#C8C8C4"), gray: hex("#8A8A86"), dark: hex("#3A3A3A"), dim: hex("#2A2A2A"),
  blue: hex("#2B4BFF"), sky: hex("#00A6FF"), mid: hex("#5C78FF"), pale: hex("#9DB4FF"),
};
const CAT_KEYS = ["datos", "gen", "pred", "vv", "ops"];
const CAT_COL = [PAL.sky, PAL.white, PAL.mid, PAL.pale, PAL.gray];
const CAT_NAMES = ["Datos y BI", "IA Generativa", "Analítica Predictiva", "Visión y Voz", "Operaciones"];
const SOURCES = ["Excel", "Google Sheets", "Shopify", "WooCommerce", "WhatsApp", "SAP", "Salesforce", "HubSpot", "PostgreSQL", "SQL Server", "BigQuery", "Snowflake", "Power BI", "APIs REST"];
const TOKENS = ["¿Cuánto", "vendí", "en", "marzo", "por", "sede", "?"];

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Configuración por capítulo: figura, posición, giro y opacidad. */
const STATES = {
  hero:         { shape: "network",   pos: [3.0, 0, 0],     scale: 0.72, tilt: [0.15, -0.5, 0], spin: 0.07, op: 1,    size: 1.1 },
  scatter:      { shape: "scatter",   pos: [1.2, 0, 0],     scale: 1,    tilt: [0, 0, 0],       spin: 0,    op: 1,    size: 1.2 },
  lake:         { shape: "lake",      pos: [-2.95, -0.2, 0], scale: 0.78, tilt: [0.36, 0.38, 0],  spin: 0,    op: 1,    size: 1.1 },
  embed:        { shape: "embed",     pos: [3.1, 0.3, -1],  scale: 1,    tilt: [0.1, 0, 0],     spin: 0.05, op: 1,    size: 1.15 },
  attention:    { shape: "attention", pos: [3.3, 0, 0],     scale: 0.78, tilt: [0.12, -0.35, 0], spin: 0,   wobble: 0.22, op: 1, size: 1.1 },
  attentionDim: { shape: "attention", pos: [0, 0, -3],      scale: 1,    tilt: [0.12, -0.35, 0], spin: 0,   wobble: 0.22, op: 0.4 },
  bars:         { shape: "bars",      pos: [3.3, 1.0, -1],  scale: 0.8,  tilt: [0.42, 0.6, 0],  spin: 0.08,  op: 1,    size: 1.1 },
  loss:         { shape: "loss",      pos: [-3.3, 0.2, 0],  scale: 0.82, tilt: [0.9, 0.55, 0],  spin: 0,    wobble: 0.2, op: 1, size: 1.15 },
  embedDim:     { shape: "embed",     pos: [0, 0.3, -4],    scale: 1.15, tilt: [0.1, 0, 0],     spin: 0.05, op: 0.4 },
  heroFar:      { shape: "network",   pos: [4.2, 0, -4],    scale: 0.8,  tilt: [0.15, -0.5, 0], spin: 0.07, op: 0.5 },
  final:        { shape: "network",   pos: [0, 0.3, -1],    scale: 0.78, tilt: [0.15, -0.5, 0], spin: 0.08, op: 0.85, size: 1.1 },
};

function init() {
  const canvas = document.getElementById("scene");
  const labelsEl = document.getElementById("labels");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (e) {
    document.documentElement.classList.add("no-webgl");
    return;
  }
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = () => innerWidth < 860;
  const N = innerWidth < 860 ? 1500 : 2600;

  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  const PR = renderer.getPixelRatio();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 9, 30);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(0, 0, 12);

  /* ---------- Material de puntos ---------- */
  const VS = `
    attribute float aSize; attribute float aSeed; attribute vec3 aColor; attribute float aAlpha;
    uniform float uSize; uniform float uPR; uniform float uTime; uniform float uOpacity;
    varying vec3 vColor; varying float vAlpha;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      float tw = 0.78 + 0.22 * sin(uTime * 1.6 + aSeed * 40.0);
      gl_PointSize = max(1.0, aSize * uSize * uPR * (10.0 / -mv.z) * tw);
      vColor = aColor; vAlpha = aAlpha * uOpacity;
    }`;
  const FS = `
    varying vec3 vColor; varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float a = pow(1.0 - d * 2.0, 1.3);
      gl_FragColor = vec4(vColor * (0.75 + 0.5 * a), a * vAlpha);
    }`;
  const BASE_SIZE = 3.6;
  const pMat = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uSize: { value: BASE_SIZE }, uPR: { value: PR }, uTime: { value: 0 }, uOpacity: { value: 1 } },
  });

  /* ---------- Piso de ingeniería (grilla que se pierde en la niebla) ---------- */
  const grid = new THREE.GridHelper(80, 80, 0x161616, 0x0d0d0d);
  grid.position.y = -4.6;
  scene.add(grid);

  /* ---------- Escenario: stage (posición) → spin (rotación) ---------- */
  const stage = new THREE.Group(), spin = new THREE.Group();
  stage.add(spin); scene.add(stage);

  /* ---------- Partículas ---------- */
  const R = Array.from({ length: 6 }, (_, k) => { const r = rng(11 + k * 31); return Float32Array.from({ length: N }, r); });
  const gauss = (i, a, b) => Math.sqrt(-2 * Math.log(Math.max(1e-6, R[a][i]))) * Math.cos(2 * Math.PI * R[b][i]);
  const CAT = Uint8Array.from({ length: N }, (_, i) => i % 5);
  const P = new Float32Array(N * 3), COL = new Float32Array(N * 3), AL = new Float32Array(N);
  const SIZE = Float32Array.from({ length: N }, (_, i) => 0.7 + Math.pow(R[5][i], 6) * 2.4);
  const SEED = Float32Array.from({ length: N }, (_, i) => R[4][i]);
  const K = Float32Array.from({ length: N }, (_, i) => 1.4 + R[3][i] * 2.6);
  const pg = new THREE.BufferGeometry();
  const aPos = new THREE.BufferAttribute(P, 3).setUsage(THREE.DynamicDrawUsage);
  const aCol = new THREE.BufferAttribute(COL, 3).setUsage(THREE.DynamicDrawUsage);
  const aAl = new THREE.BufferAttribute(AL, 1).setUsage(THREE.DynamicDrawUsage);
  pg.setAttribute("position", aPos); pg.setAttribute("aColor", aCol); pg.setAttribute("aAlpha", aAl);
  pg.setAttribute("aSize", new THREE.BufferAttribute(SIZE, 1)); pg.setAttribute("aSeed", new THREE.BufferAttribute(SEED, 1));
  const points = new THREE.Points(pg, pMat);
  points.frustumCulled = false;
  spin.add(points);

  const lineMat = (color) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const mkShape = (dynamic) => ({ T: new Float32Array(N * 3), C: new Float32Array(N * 3), A: new Float32Array(N), dynamic, labels: [], lines: null, lineOp: 0, curOp: 0 });
  const SH = {};
  const lerp3 = (a, b, f, out, o) => { out[o] = a[0] + (b[0] - a[0]) * f; out[o + 1] = a[1] + (b[1] - a[1]) * f; out[o + 2] = a[2] + (b[2] - a[2]) * f; };

  /* 1 · Red neuronal (hero) */
  SH.network = mkShape(true);
  {
    const LAYERS = [4, 7, 10, 10, 7, 3], X0 = -4.5, DX = 9 / (LAYERS.length - 1);
    const NODES = [];
    LAYERS.forEach((n, l) => {
      const rad = n <= 4 ? 0.55 + n * 0.12 : 0.3 + n * 0.19;
      for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2 + l * 0.5; NODES.push({ l, p: [X0 + l * DX, Math.cos(a) * rad, Math.sin(a) * rad] }); }
    });
    const EDGES = [];
    NODES.forEach((a, ia) => NODES.forEach((b, ib) => { if (b.l === a.l + 1) EDGES.push([ia, ib]); }));
    const NODE_N = Math.floor(N * 0.3);
    for (let i = 0; i < N; i++) {
      if (i < NODE_N) { const nd = NODES[i % NODES.length]; SH.network.C.set(nd.l === LAYERS.length - 1 ? PAL.sky : PAL.white, i * 3); SH.network.A[i] = 0.95; }
      else { const r = R[3][i]; SH.network.C.set(r < 0.35 ? PAL.sky : r < 0.6 ? PAL.mid : PAL.gray, i * 3); SH.network.A[i] = 0.7; }
    }
    SH.network.update = (t) => {
      const T = SH.network.T;
      for (let i = 0; i < N; i++) {
        if (i < NODE_N) {
          const nd = NODES[i % NODES.length].p;
          T[i * 3] = nd[0] + gauss(i, 0, 1) * 0.08; T[i * 3 + 1] = nd[1] + gauss(i, 1, 2) * 0.08; T[i * 3 + 2] = nd[2] + gauss(i, 2, 3) * 0.08;
        } else {
          const [ia, ib] = EDGES[i % EDGES.length];
          lerp3(NODES[ia].p, NODES[ib].p, (SEED[i] + t * 0.28) % 1, T, i * 3);
        }
      }
    };
    SH.network.lines = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(EDGES.flatMap(([a, b]) => [new THREE.Vector3(...NODES[a].p), new THREE.Vector3(...NODES[b].p)])),
      lineMat(0x9db4ff),
    );
    SH.network.lineOp = 0.09;
  }

  /* 2 · Fuentes de datos dispersas */
  SH.scatter = mkShape(true);
  const SC = SOURCES.map((_, k) => {
    const r = rng(300 + k);
    return [-6.2 + (k % 7) * (12.4 / 6) + (r() - 0.5) * 0.9, (k < 7 ? 1.9 : -1.9) + (r() - 0.5) * 1.3, -2.2 + (r() - 0.5) * 3.2];
  });
  const MESS = [PAL.white, PAL.gray, PAL.light, PAL.sky, PAL.gray, PAL.mid, PAL.light];
  const scBase = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const k = i % SOURCES.length, loose = R[2][i] < 0.12, c = SC[k];
    scBase.set(loose
      ? [(R[0][i] - 0.5) * 16, (R[1][i] - 0.5) * 8.5, -4 + R[3][i] * 5]
      : [c[0] + gauss(i, 0, 1) * 0.42, c[1] + gauss(i, 1, 2) * 0.32, c[2] + gauss(i, 2, 3) * 0.42], i * 3);
    SH.scatter.C.set(loose || R[4][i] < 0.25 ? PAL.dark : MESS[k % MESS.length], i * 3);
    SH.scatter.A[i] = loose ? 0.5 : 0.9;
  }
  SH.scatter.update = (t) => {
    const T = SH.scatter.T;
    for (let i = 0; i < N; i++) {
      const s = SEED[i] * 40;
      T[i * 3] = scBase[i * 3] + Math.sin(t * 0.5 + s) * 0.08;
      T[i * 3 + 1] = scBase[i * 3 + 1] + Math.cos(t * 0.4 + s) * 0.08;
      T[i * 3 + 2] = scBase[i * 3 + 2];
    }
  };
  SH.scatter.labels = SOURCES.map((name, k) => ({ text: name, p: [SC[k][0], SC[k][1] + 0.85, SC[k][2]], cls: "lbl--src" }));

  /* 3 · Lakehouse por capas: bronce (crudo) → plata (limpio) → oro (listo para IA) */
  SH.lake = mkShape(true);
  const LW = 6.2, LH = 3.4, LD = 3.0, NX = small() ? 14 : 18, NZ = small() ? 7 : 9, NY = small() ? 3 : 4;
  const slabH = LH / 3, LAT = Math.min(N, NX * NZ * NY * 3);
  const lakeBase = new Float32Array(N * 3);
  const SLAB_COL = [PAL.gray, PAL.light, PAL.sky];
  for (let i = 0; i < N; i++) {
    if (i < LAT) {
      const slab = Math.floor(i / (NX * NZ * NY)), r = i % (NX * NZ * NY);
      const iy = Math.floor(r / (NX * NZ)), iz = Math.floor((r % (NX * NZ)) / NX), ix = r % NX, jit = [0.16, 0.05, 0][slab];
      lakeBase.set([
        -LW / 2 + (ix + 0.5) * (LW / NX) + gauss(i, 0, 1) * jit,
        -LH / 2 + slab * slabH + 0.2 + (iy / (NY - 1)) * (slabH - 0.4) + gauss(i, 1, 2) * jit,
        -LD / 2 + (iz + 0.5) * (LD / NZ) + gauss(i, 2, 3) * jit,
      ], i * 3);
      SH.lake.C.set(SLAB_COL[slab], i * 3); SH.lake.A[i] = [0.5, 0.75, 1][slab];
    } else { SH.lake.C.set(MESS[i % MESS.length], i * 3); SH.lake.A[i] = 0.8; }
  }
  SH.lake.update = (t) => {
    const T = SH.lake.T;
    T.set(lakeBase.subarray(0, LAT * 3));
    for (let i = LAT; i < N; i++) {
      const f = (SEED[i] + t * 0.22) % 1, lane = (i % 7) / 6 - 0.5;
      T[i * 3] = -LW / 2 - 4.2 + f * 4.4;
      T[i * 3 + 1] = -LH / 2 + slabH * 0.5 + lane * 1.6 * (1 - f) + Math.sin(f * 6 + SEED[i] * 9) * 0.06;
      T[i * 3 + 2] = (R[1][i] - 0.5) * LD * (0.4 + f * 0.6);
    }
  };
  SH.lake.labels = [
    { text: "SKYLAB NEXUS · LAKEHOUSE", p: [0, LH / 2 + 0.45, LD / 2], cls: "lbl--box" },
    { text: "ORO · listos para IA", p: [-LW / 2 - 0.3, LH / 2 - slabH / 2, LD / 2], cls: "lbl--side lbl--sky" },
    { text: "PLATA · limpios", p: [-LW / 2 - 0.3, 0, LD / 2], cls: "lbl--side" },
    { text: "BRONCE · crudos", p: [-LW / 2 - 0.3, -LH / 2 + slabH / 2, LD / 2], cls: "lbl--side lbl--dim" },
  ];
  {
    const g = new THREE.Group();
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(LW + 0.4, LH + 0.3, LD + 0.4)), lineMat(0xffffff)));
    [-LH / 2 + slabH, -LH / 2 + slabH * 2].forEach((y) => {
      const w = LW / 2 + 0.2, d = LD / 2 + 0.2;
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([[-w, -d], [w, -d], [w, d], [-w, d], [-w, -d]].map(([x, z]) => new THREE.Vector3(x, y, z))), lineMat(0xffffff)));
    });
    SH.lake.lines = g; SH.lake.lineOp = 0.3;
  }

  /* 4 · Espacio de embeddings: un grupo por familia de soluciones */
  SH.embed = mkShape(true);
  const EC = [[-2.3, 1.3, 0.4], [1.9, 1.6, -0.9], [2.4, -1.1, 0.8], [-1.7, -1.5, -0.8], [0.2, 0.05, 1.7]];
  const embBase = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const c = EC[CAT[i]], noise = R[2][i] < 0.08;
    embBase.set(noise
      ? [(R[0][i] - 0.5) * 8, (R[1][i] - 0.5) * 5.5, (R[3][i] - 0.5) * 5]
      : [c[0] + gauss(i, 0, 1) * 0.62, c[1] + gauss(i, 1, 2) * 0.42, c[2] + gauss(i, 2, 3) * 0.5], i * 3);
    SH.embed.C.set(noise ? PAL.dark : CAT_COL[CAT[i]], i * 3);
    SH.embed.A[i] = noise ? 0.5 : 0.55 + R[4][i] * 0.45;
  }
  SH.embed.update = (t) => {
    const T = SH.embed.T;
    for (let i = 0; i < N; i++) {
      const s = SEED[i] * 50;
      T[i * 3] = embBase[i * 3] + Math.sin(t * 0.3 + s) * 0.06;
      T[i * 3 + 1] = embBase[i * 3 + 1] + Math.cos(t * 0.35 + s) * 0.06;
      T[i * 3 + 2] = embBase[i * 3 + 2] + Math.sin(t * 0.25 + s * 1.3) * 0.06;
    }
  };
  SH.embed.labels = EC.map((c, k) => ({ text: CAT_NAMES[k], p: [c[0], c[1] + 1.05, c[2]], cls: "lbl--cat" }));

  /* 5 · Atención de un transformer (modelos de lenguaje como Claude) */
  SH.attention = mkShape(true);
  {
    const NT = TOKENS.length, TX = (k) => -3.6 + (k * 7.2) / (NT - 1), DIMS = 8, DY = 0.13;
    const BOT = -2.3, TOP = 1.25;
    const W = Array.from({ length: NT }, (_, i) => {
      const r = rng(900 + i), row = TOKENS.map((_, j) => (i === j ? 1.2 : 0.2) + r() * 0.8 + (j === 1 || j === 3 ? 0.9 : 0));
      return row.map((v) => v / row.reduce((a, b) => a + b, 0));
    });
    const ARCS = [];
    W.forEach((row, i) => row.map((w, j) => [w, j]).sort((a, b) => b[0] - a[0]).slice(0, 3).forEach(([w, j]) => ARCS.push({ i, j, w })));
    const arcPts = (a, f, out, o) => {
      const p0 = [TX(a.j), BOT + DIMS * DY + 0.15, 0], p2 = [TX(a.i), TOP - 0.15, 0];
      const c = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, 1.2 + (a.i - a.j) * 0.15], u = 1 - f;
      out[o] = u * u * p0[0] + 2 * u * f * c[0] + f * f * p2[0];
      out[o + 1] = u * u * p0[1] + 2 * u * f * c[1] + f * f * p2[1];
      out[o + 2] = u * u * p0[2] + 2 * u * f * c[2] + f * f * p2[2];
    };
    const TOK_N = Math.floor(N * 0.34);
    const arcOf = new Uint16Array(N);
    const cum = []; let acc = 0; ARCS.forEach((a) => { acc += a.w; cum.push(acc); });
    for (let i = 0; i < N; i++) {
      if (i < TOK_N) {
        const tk = i % (NT * 2), d = Math.floor(i / (NT * 2)) % DIMS, v = rng(tk * 31 + d)();
        SH.attention.C.set(v > 0.75 ? PAL.sky : v > 0.45 ? PAL.white : v > 0.2 ? PAL.gray : PAL.dark, i * 3);
        SH.attention.A[i] = 0.95;
      } else {
        const x = R[0][i] * acc; let k = cum.findIndex((c) => c >= x); if (k < 0) k = ARCS.length - 1;
        arcOf[i] = k;
        SH.attention.C.set(ARCS[k].w > 0.22 ? PAL.sky : ARCS[k].w > 0.15 ? PAL.mid : PAL.gray, i * 3);
        SH.attention.A[i] = 0.8;
      }
    }
    SH.attention.update = (t) => {
      const T = SH.attention.T;
      for (let i = 0; i < N; i++) {
        if (i < TOK_N) {
          const tk = i % (NT * 2), d = Math.floor(i / (NT * 2)) % DIMS, top = tk >= NT, k = tk % NT;
          T[i * 3] = TX(k) + gauss(i, 0, 1) * 0.035;
          T[i * 3 + 1] = (top ? TOP : BOT) + d * DY + gauss(i, 1, 2) * 0.02;
          T[i * 3 + 2] = gauss(i, 2, 3) * 0.035;
        } else {
          arcPts(ARCS[arcOf[i]], (SEED[i] + t * 0.22) % 1, T, i * 3);
        }
      }
    };
    SH.attention.labels = [
      ...TOKENS.map((w, k) => ({ text: w, p: [TX(k), BOT - 0.35, 0], cls: "lbl--tok" })),
      { text: "Capa de atención · transformer", p: [0, TOP + DIMS * DY + 0.55, 0], cls: "lbl--box" },
    ];
    const pts = [], tmpA = new Float32Array(3);
    ARCS.forEach((a) => { for (let s = 0; s < 24; s++) { arcPts(a, s / 24, tmpA, 0); pts.push(new THREE.Vector3(...tmpA)); arcPts(a, (s + 1) / 24, tmpA, 0); pts.push(new THREE.Vector3(...tmpA)); } });
    SH.attention.lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0x5c78ff));
    SH.attention.lineOp = 0.14;
  }

  /* 6 · Métricas en 3D: industrias × indicadores */
  SH.bars = mkShape(true);
  {
    const CX = 8, CZ = 4, BASE = -1.7;
    const ROWCOL = [PAL.white, PAL.light, PAL.sky, PAL.gray];
    for (let i = 0; i < N; i++) { const c = i % (CX * CZ), z = Math.floor(c / CX); SH.bars.C.set(ROWCOL[z], i * 3); SH.bars.A[i] = 0.85; }
    SH.bars.update = (t) => {
      const T = SH.bars.T;
      for (let i = 0; i < N; i++) {
        const c = i % (CX * CZ), x = c % CX, z = Math.floor(c / CX);
        const h = 0.5 + 2.6 * (0.5 + 0.5 * Math.sin(t * 0.5 + x * 1.3 + z * 0.8)) * (0.55 + 0.45 * Math.cos(x * 0.7 - z));
        T[i * 3] = -3.5 + x + (R[0][i] - 0.5) * 0.24;
        T[i * 3 + 1] = BASE + R[1][i] * h;
        T[i * 3 + 2] = -1.5 + z + (R[2][i] - 0.5) * 0.24;
      }
    };
  }

  /* 7 · Superficie de pérdida y descenso del gradiente (el método) */
  SH.loss = mkShape(true);
  {
    const f = (x, z) => 0.55 * Math.sin(0.9 * x) * Math.cos(0.8 * z) + 0.075 * (x * x + z * z) + 0.18 * Math.cos(1.7 * x + 0.6 * z);
    const Y = (x, z) => f(x, z) * 1.1 - 1.2;
    const NG = Math.floor(Math.sqrt(N * 0.64)), SURF = NG * NG;
    for (let i = 0; i < SURF; i++) {
      const gx = i % NG, gz = Math.floor(i / NG), x = -3.6 + (gx / (NG - 1)) * 7.2, z = -3.2 + (gz / (NG - 1)) * 6.4, y = Y(x, z);
      SH.loss.T.set([x, y, z], i * 3);
      const h = Math.min(1, Math.max(0, (y + 1.6) / 2.6));
      SH.loss.C.set(h > 0.55 ? PAL.light : h > 0.3 ? PAL.gray : PAL.dark, i * 3);
      SH.loss.A[i] = 0.35 + h * 0.5;
    }
    // descenso del gradiente con momento desde una esquina alta
    const RAW = []; let x = -3.1, z = 2.6, vx = 0, vz = 0;
    for (let s = 0; s < 600; s++) {
      const e = 1e-3, gx = (f(x + e, z) - f(x - e, z)) / (2 * e), gz = (f(x, z + e) - f(x, z - e)) / (2 * e);
      vx = vx * 0.86 - gx * 0.03; vz = vz * 0.86 - gz * 0.03; x += vx; z += vz;
      RAW.push([x, Y(x, z) + 0.12, z]);
      if (s > 20 && Math.hypot(vx, vz) < 2e-4) break;
    }
    // re-muestreo por longitud de arco: el recorrido se reparte parejo entre los 5 pasos
    const LEN = [0]; for (let k = 1; k < RAW.length; k++) LEN.push(LEN[k - 1] + Math.hypot(RAW[k][0] - RAW[k - 1][0], RAW[k][1] - RAW[k - 1][1], RAW[k][2] - RAW[k - 1][2]));
    const PATH = []; let kk = 0;
    for (let q = 0; q <= 200; q++) {
      const d = (q / 200) * LEN.at(-1);
      while (kk < LEN.length - 2 && LEN[kk + 1] < d) kk++;
      const fr = (d - LEN[kk]) / Math.max(1e-6, LEN[kk + 1] - LEN[kk]), o = [0, 0, 0];
      lerp3(RAW[kk], RAW[kk + 1], Math.min(1, fr), o, 0); PATH.push(o);
    }
    const pathAt = (u, out, o) => { const k = Math.min(PATH.length - 2, Math.floor(u * (PATH.length - 1))), fr = u * (PATH.length - 1) - k; lerp3(PATH[k], PATH[k + 1], fr, out, o); };
    for (let i = SURF; i < N; i++) { SH.loss.C.set(R[3][i] < 0.5 ? PAL.sky : PAL.white, i * 3); SH.loss.A[i] = 0.95; }
    const base = SH.loss.T.slice(0, SURF * 3);
    SH.loss.update = (t) => {
      const T = SH.loss.T;
      T.set(base);
      for (let i = SURF; i < N; i++) {
        pathAt((SEED[i] + t * 0.06) % 1, T, i * 3);
        T[i * 3] += gauss(i, 0, 1) * 0.04; T[i * 3 + 1] += Math.abs(gauss(i, 1, 2)) * 0.04; T[i * 3 + 2] += gauss(i, 2, 3) * 0.04;
      }
    };
    const out = new Float32Array(3);
    SH.loss.labels = ["01 Diagnóstico", "02 Integración", "03 Modelado", "04 Despliegue", "05 Mejora continua"].map((text, k) => {
      pathAt([0, 0.25, 0.5, 0.75, 1][k], out, 0);
      return { text, p: [out[0], out[1] + 0.5, out[2]], cls: "lbl--step" };
    });
  }

  Object.values(SH).forEach((s) => { if (s.lines) { s.lines.visible = false; spin.add(s.lines); } });
  const setLineOpacity = (obj, o) => obj.traverse((c) => { if (c.material) c.material.opacity = o; });

  /* ---------- Etiquetas HTML proyectadas desde 3D ---------- */
  const LBL = [];
  Object.entries(SH).forEach(([name, sh]) => sh.labels.forEach((l) => {
    const el = document.createElement("span");
    el.className = `lbl ${l.cls || ""}`; el.textContent = l.text;
    labelsEl.append(el);
    LBL.push({ el, shape: name, v: new THREE.Vector3(...l.p), on: false });
  }));
  const tmp = new THREE.Vector3();

  /* ---------- Estado ---------- */
  let stName = document.documentElement.dataset.scene || "hero";
  let st = STATES[stName] || STATES.hero;
  let shapeName = st.shape, shapeSince = performance.now();
  let focus = -1, spinAngle = 0, wob = 0;
  SH[shapeName].dynamic && SH[shapeName].update(0);
  const intro = RM ? 1 : 0.04;
  for (let i = 0; i < N * 3; i++) P[i] = SH[shapeName].T[i] * intro;
  COL.set(SH[shapeName].C);
  if (RM) AL.set(SH[shapeName].A);

  const setState = (name) => {
    const next = STATES[name];
    if (!next || name === stName) return;
    stName = name; st = next;
    if (next.shape !== shapeName) { shapeName = next.shape; shapeSince = performance.now(); }
  };
  addEventListener("skylab:scene", (e) => setState(e.detail?.name));
  addEventListener("skylab:focus", (e) => { focus = CAT_KEYS.indexOf(e.detail?.cat); });
  addEventListener("skylab:launch", () => {
    if (RM) return;
    for (let i = 0; i < N; i++) {
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], l = Math.hypot(x, y, z) || 1, f = 1 + R[2][i] * 2;
      P[i * 3] += (x / l) * f; P[i * 3 + 1] += (y / l) * f; P[i * 3 + 2] += (z / l) * f;
    }
  });

  let mx = 0, my = 0;
  addEventListener("pointermove", (e) => { mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

  let camZ = 12;
  const resize = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camZ = camera.aspect < 1 ? 12 + (1 - camera.aspect) * 7 : 12;
  };
  addEventListener("resize", resize);
  resize();

  const tgtPos = new THREE.Vector3();
  let time = 0, last = performance.now(), opac = 0;

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!RM) time += dt;
    const sm = small(), sh = SH[shapeName];
    if (sh.dynamic) sh.update(time);

    // Morfología de partículas
    const T = sh.T, C = sh.C, A = sh.A, fOn = focus >= 0 && sh === SH.embed;
    const ea = RM ? 1 : 1 - Math.exp(-dt * 4);
    for (let i = 0; i < N; i++) {
      const e = RM ? 1 : 1 - Math.exp(-dt * K[i]), j = i * 3, ec = e * 0.8;
      P[j] += (T[j] - P[j]) * e; P[j + 1] += (T[j + 1] - P[j + 1]) * e; P[j + 2] += (T[j + 2] - P[j + 2]) * e;
      COL[j] += (C[j] - COL[j]) * ec; COL[j + 1] += (C[j + 1] - COL[j + 1]) * ec; COL[j + 2] += (C[j + 2] - COL[j + 2]) * ec;
      AL[i] += ((fOn ? (CAT[i] === focus ? 1 : 0.08) : A[i]) - AL[i]) * ea;
    }
    aPos.needsUpdate = true; aCol.needsUpdate = true; aAl.needsUpdate = true;

    // Transformación del escenario
    const ease = RM ? 1 : 1 - Math.exp(-dt * 2.2);
    tgtPos.set(sm ? st.pos[0] * 0.1 : st.pos[0], st.pos[1], sm ? st.pos[2] - 1.5 : st.pos[2]);
    stage.position.lerp(tgtPos, ease);
    const sc = st.scale * (sm ? 0.8 : 1);
    stage.scale.setScalar(stage.scale.x + (sc - stage.scale.x) * ease);
    if (st.spin && !RM) spinAngle += st.spin * dt;
    else spinAngle += (Math.round(spinAngle / (Math.PI * 2)) * Math.PI * 2 - spinAngle) * ease;
    wob += ((st.wobble ? Math.sin(time * 0.35) * st.wobble : 0) - wob) * ease;
    spin.rotation.x += (st.tilt[0] - spin.rotation.x) * ease;
    spin.rotation.z += (st.tilt[2] - spin.rotation.z) * ease;
    spin.rotation.y = st.tilt[1] + spinAngle + wob;

    opac += (st.op * (sm ? 0.65 : 1) - opac) * ease;
    pMat.uniforms.uOpacity.value = opac;
    pMat.uniforms.uSize.value += (BASE_SIZE * (st.size || 1) - pMat.uniforms.uSize.value) * ease;
    pMat.uniforms.uTime.value = time;

    Object.entries(SH).forEach(([name, s]) => {
      if (!s.lines) return;
      s.curOp += ((name === shapeName ? s.lineOp * opac : 0) - s.curOp) * ease;
      setLineOpacity(s.lines, s.curOp); s.lines.visible = s.curOp > 0.004;
    });

    // Cámara con paralaje suave
    const ce = RM ? 1 : 1 - Math.exp(-dt * 2);
    camera.position.x += (mx * 0.45 - camera.position.x) * ce;
    camera.position.y += (-my * 0.3 - camera.position.y) * ce;
    camera.position.z += (camZ - camera.position.z) * ce;
    camera.lookAt(0, 0, 0);
    scene.updateMatrixWorld();

    // Etiquetas
    const showLabels = performance.now() - shapeSince > 700 && opac > 0.6;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    for (const l of LBL) {
      const on = showLabels && l.shape === shapeName;
      if (on) {
        tmp.copy(l.v).applyMatrix4(spin.matrixWorld).project(camera);
        l.el.style.transform = `translate3d(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px, 0)`;
      }
      if (on !== l.on) { l.on = on; l.el.classList.toggle("is-on", on); }
    }

    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);
  document.documentElement.classList.add("has-webgl");
  dispatchEvent(new CustomEvent("skylab:scene-ready"));
}

init();
