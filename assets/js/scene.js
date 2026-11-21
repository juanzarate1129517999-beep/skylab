/* SKYLAB · Escena 3D
   - Intro: miles de partículas llegan desde fuera de la pantalla y forman el logo.
   - Después, cada capítulo tiene una figura (red neuronal, fuentes de datos, lakehouse,
     embeddings, atención, métricas, superficie de pérdida) y la transición entre figuras
     está amarrada al scroll: las partículas viajan en remolino de una a otra.
   - Brillo (bloom), cámara que se mueve por capítulo y partículas que esquivan el cursor. */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const CAT_KEYS = ["datos", "gen", "pred", "vv", "ops"];
const CAT_NAMES = ["Datos y BI", "IA Generativa", "Analítica Predictiva", "Visión y Voz", "Operaciones"];
const SOURCES = ["Excel", "Google Sheets", "Shopify", "WooCommerce", "WhatsApp", "SAP", "Salesforce", "HubSpot", "PostgreSQL", "SQL Server", "BigQuery", "Snowflake", "Power BI", "APIs REST"];
const TOKENS = ["¿Cuánto", "vendí", "en", "marzo", "por", "sede", "?"];
const STEPS = ["01 Diagnóstico", "02 Integración", "03 Modelado", "04 Despliegue", "05 Mejora continua"];

/* Cada capítulo: figura, posición, giro, cámara y opacidad. */
const STATES = {
  hero:         { shape: "network",   pos: [2.8, 0, 0],     scale: 0.74, tilt: [0.15, -0.5, 0],  spin: 0.07, cam: [0, 0, 12] },
  scatter:      { shape: "scatter",   pos: [1.2, 0, 0],     scale: 1,    tilt: [0, 0, 0],        cam: [0, 0, 13.5], size: 1.15 },
  lake:         { shape: "lake",      pos: [-2.95, -0.2, 0], scale: 0.78, tilt: [0.36, 0.38, 0], cam: [0, 0.6, 11.5] },
  embed:        { shape: "embed",     pos: [3.1, 0.3, -1],  scale: 1,    tilt: [0.1, 0, 0],      spin: 0.05, cam: [0.6, 0, 9.8], size: 1.1, deep: 0.4 },
  attention:    { shape: "attention", pos: [3.3, 0, 0],     scale: 0.78, tilt: [0.12, -0.35, 0], wobble: 0.22, cam: [0, 0, 11.5] },
  attentionDim: { shape: "attention", pos: [0, 0, -3],      scale: 1,    tilt: [0.12, -0.35, 0], wobble: 0.22, cam: [0, 0, 12], op: 0.32 },
  bars:         { shape: "bars",      pos: [3.3, 0.9, -1],  scale: 0.8,  tilt: [0.42, 0.6, 0],   spin: 0.08, cam: [0, 1.0, 12], deep: 0.45 },
  loss:         { shape: "loss",      pos: [-3.0, 0.1, 0],  scale: 0.9,  tilt: [0.9, 0.55, 0],   wobble: 0.1, cam: [0, 0.4, 11], progress: "metodo", size: 1.1 },
  embedDim:     { shape: "embed",     pos: [0, 0.3, -4],    scale: 1.15, tilt: [0.1, 0, 0],      spin: 0.05, cam: [0, 0, 12], op: 0.32 },
  heroFar:      { shape: "network",   pos: [4.2, 0, -4],    scale: 0.8,  tilt: [0.15, -0.5, 0],  spin: 0.07, cam: [0, 0, 12], op: 0.42 },
  final:        { shape: "network",   pos: [0, 0.35, -1],   scale: 0.8,  tilt: [0.15, -0.5, 0],  spin: 0.08, cam: [0, 0, 12], op: 0.85 },
};
const LOGO_STATE = { pos: [0, 0.95, 0], scale: 1.1, tilt: [0, 0, 0], cam: [0, 0, 12] };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const mix = (a, b, t) => a + (b - a) * t;

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function init() {
  const canvas = document.getElementById("scene");
  const labelsEl = document.getElementById("labels");
  const root = document.documentElement;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (e) {
    root.classList.add("no-webgl");
    dispatchEvent(new CustomEvent("skylab:scene-ready"));
    return;
  }
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const small = () => innerWidth < 860;
  const MOBILE = innerWidth < 860;
  const BLOOM = !MOBILE;
  const N = MOBILE ? 1600 : 3000;

  // Con bloom se renderiza en espacio lineal y OutputPass convierte a sRGB.
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const hex = (h) => [1, 3, 5].map((k) => { const c = parseInt(h.slice(k, k + 2), 16) / 255; return BLOOM ? toLin(c) : c; });
  // Paleta de Skylab Phoenix: ámbar → naranja → rosa → violeta sobre grises pizarra
  const PAL = {
    white: hex("#F1F5F9"), light: hex("#CBD5E1"), gray: hex("#94A3B8"), dark: hex("#334155"),
    blue: hex("#F43F5E"), sky: hex("#F97316"), mid: hex("#8B5CF6"), pale: hex("#FBBF24"),
  };
  const CAT_COL = [PAL.pale, PAL.sky, PAL.blue, PAL.mid, PAL.light];

  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, BLOOM ? 1.5 : 1.75));
  const PR = renderer.getPixelRatio();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 9, 30);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(0, 0, 12);

  let composer = null, bloom = null;
  if (BLOOM) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.9, 0.55, 0.05);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* ---------- Material de puntos ---------- */
  const BASE_SIZE = BLOOM ? 3.3 : 3.6;
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uSize: { value: BASE_SIZE }, uPR: { value: PR }, uTime: { value: 0 }, uOpacity: { value: 1 } },
    vertexShader: `
      attribute float aSize; attribute float aSeed; attribute vec3 aColor; attribute float aAlpha;
      uniform float uSize; uniform float uPR; uniform float uTime; uniform float uOpacity;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.8 + 0.2 * sin(uTime * 1.6 + aSeed * 40.0);
        gl_PointSize = max(1.0, aSize * uSize * uPR * (10.0 / -mv.z) * tw);
        vColor = aColor; vAlpha = aAlpha * uOpacity;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = pow(1.0 - d * 2.0, 1.3);
        gl_FragColor = vec4(vColor * (0.75 + 0.5 * a), a * vAlpha);
      }`,
  });

  /* ---------- Piso ---------- */
  const grid = new THREE.GridHelper(80, 80, 0x1a1a1a, 0x0e0e0e);
  grid.position.y = -4.6;
  grid.material.transparent = true;
  scene.add(grid);

  const stage = new THREE.Group(), spin = new THREE.Group();
  stage.add(spin); scene.add(stage);

  /* ---------- Partículas ---------- */
  const R = Array.from({ length: 7 }, (_, k) => { const r = rng(11 + k * 31); return Float32Array.from({ length: N }, r); });
  const gauss = (i, a, b) => Math.sqrt(-2 * Math.log(Math.max(1e-6, R[a][i]))) * Math.cos(2 * Math.PI * R[b][i]);
  const CAT = Uint8Array.from({ length: N }, (_, i) => i % 5);
  const D = R[6]; // retraso por partícula: crea la ola del remolino
  const P = new Float32Array(N * 3), COL = new Float32Array(N * 3), AL = new Float32Array(N);
  const SIZE = Float32Array.from({ length: N }, (_, i) => 0.7 + Math.pow(R[5][i], 6) * 2.4);
  const SEED = Float32Array.from({ length: N }, (_, i) => R[4][i]);
  const K = Float32Array.from({ length: N }, (_, i) => 5 + R[3][i] * 4);
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
  const lerp3 = (a, b, f, out, o) => { out[o] = a[0] + (b[0] - a[0]) * f; out[o + 1] = a[1] + (b[1] - a[1]) * f; out[o + 2] = a[2] + (b[2] - a[2]) * f; };
  const SH = {};

  /* 0 · Logo: el fénix de Skylab Phoenix, muestreado desde su SVG */
  SH.logo = mkShape(false);
  {
    const S = 256, cv = document.createElement("canvas"); cv.width = cv.height = S;
    const g = cv.getContext("2d");
    g.scale(S / 64, S / 64); g.fillStyle = "#fff";
    [
      "M32 29C24 21 14 19 3 9c4 13 12 21 25 25zM30 34c-8-2-16-2-22-8 5 8 12 11 21 12zM32 29c8-8 18-10 29-20-4 13-12 21-25 25zM34 34c8-2 16-2 22-8-5 8-12 11-21 12z",
      "M32 12c3 6 6.5 10 6.5 18 0 5.5-2.8 10-6.5 10s-6.5-4.5-6.5-10c0-8 3.5-12 6.5-18z",
      "M32 40c-2 6-6 10-8 18 5-4 7-8 8-12 1 4 3 8 8 12-2-8-6-12-8-18z",
    ].forEach((d) => g.fill(new Path2D(d)));
    g.globalCompositeOperation = "destination-out";
    g.beginPath(); g.arc(32, 22, 1.9, 0, Math.PI * 2); g.fill();
    const data = g.getImageData(0, 0, S, S).data, pix = [];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (data[(y * S + x) * 4 + 3] > 128) pix.push(x, y);
    const M = pix.length / 2, SC = 0.078;
    const STOPS = [[0, PAL.pale], [0.4, PAL.sky], [0.72, PAL.blue], [1, PAL.mid]];
    const grad = (t) => {
      let k = 0; while (k < STOPS.length - 2 && t > STOPS[k + 1][0]) k++;
      const [o0, c0] = STOPS[k], [o1, c1] = STOPS[k + 1], f = clamp((t - o0) / (o1 - o0), 0, 1);
      return [0, 1, 2].map((c) => mix(c0[c], c1[c], f));
    };
    for (let i = 0; i < N; i++) {
      const q = Math.floor(R[0][i] * M) * 2, u = ((pix[q] + R[1][i]) / S) * 64, v = ((pix[q + 1] + R[2][i]) / S) * 64;
      SH.logo.T.set([(u - 32) * SC, -(v - 33.5) * SC, (R[3][i] - 0.5) * 0.35], i * 3);
      SH.logo.C.set(grad(clamp((u / 64 + (64 - v) / 64) / 2, 0, 1)), i * 3);
      SH.logo.A[i] = 0.95;
    }
  }

  /* 1 · Red neuronal */
  SH.network = mkShape(true);
  {
    const LAYERS = [4, 7, 10, 10, 7, 3], X0 = -4.5, DX = 9 / (LAYERS.length - 1), NODES = [];
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
        } else { const [ia, ib] = EDGES[i % EDGES.length]; lerp3(NODES[ia].p, NODES[ib].p, (SEED[i] + t * 0.28) % 1, T, i * 3); }
      }
    };
    SH.network.lines = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(EDGES.flatMap(([a, b]) => [new THREE.Vector3(...NODES[a].p), new THREE.Vector3(...NODES[b].p)])),
      lineMat(0xfbbf24),
    );
    SH.network.lineOp = 0.08;
  }

  /* 2 · Fuentes de datos dispersas */
  SH.scatter = mkShape(true);
  const SC = SOURCES.map((_, k) => { const r = rng(300 + k); return [-6.2 + (k % 7) * (12.4 / 6) + (r() - 0.5) * 0.9, (k < 7 ? 1.9 : -1.9) + (r() - 0.5) * 1.3, -2.2 + (r() - 0.5) * 3.2]; });
  const MESS = [PAL.white, PAL.gray, PAL.light, PAL.sky, PAL.gray, PAL.mid, PAL.light];
  {
    const base = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const k = i % SOURCES.length, loose = R[2][i] < 0.12, c = SC[k];
      base.set(loose ? [(R[0][i] - 0.5) * 16, (R[1][i] - 0.5) * 8.5, -4 + R[3][i] * 5] : [c[0] + gauss(i, 0, 1) * 0.42, c[1] + gauss(i, 1, 2) * 0.32, c[2] + gauss(i, 2, 3) * 0.42], i * 3);
      SH.scatter.C.set(loose || R[4][i] < 0.25 ? PAL.dark : MESS[k % MESS.length], i * 3);
      SH.scatter.A[i] = loose ? 0.5 : 0.9;
    }
    SH.scatter.update = (t) => {
      const T = SH.scatter.T;
      for (let i = 0; i < N; i++) {
        const s = SEED[i] * 40;
        T[i * 3] = base[i * 3] + Math.sin(t * 0.5 + s) * 0.08; T[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * 0.4 + s) * 0.08; T[i * 3 + 2] = base[i * 3 + 2];
      }
    };
    SH.scatter.labels = SOURCES.map((name, k) => ({ text: name, p: [SC[k][0], SC[k][1] + 0.85, SC[k][2]], cls: "lbl--src" }));
  }

  /* 3 · Lakehouse por capas */
  SH.lake = mkShape(true);
  {
    const LW = 6.2, LH = 3.4, LD = 3.0, NX = MOBILE ? 14 : 18, NZ = MOBILE ? 7 : 9, NY = MOBILE ? 3 : 4;
    const slabH = LH / 3, LAT = Math.min(N, NX * NZ * NY * 3), base = new Float32Array(N * 3), SLAB_COL = [PAL.gray, PAL.light, PAL.sky];
    for (let i = 0; i < N; i++) {
      if (i < LAT) {
        const slab = Math.floor(i / (NX * NZ * NY)), r = i % (NX * NZ * NY);
        const iy = Math.floor(r / (NX * NZ)), iz = Math.floor((r % (NX * NZ)) / NX), ix = r % NX, jit = [0.16, 0.05, 0][slab];
        base.set([-LW / 2 + (ix + 0.5) * (LW / NX) + gauss(i, 0, 1) * jit, -LH / 2 + slab * slabH + 0.2 + (iy / (NY - 1)) * (slabH - 0.4) + gauss(i, 1, 2) * jit, -LD / 2 + (iz + 0.5) * (LD / NZ) + gauss(i, 2, 3) * jit], i * 3);
        SH.lake.C.set(SLAB_COL[slab], i * 3); SH.lake.A[i] = [0.5, 0.75, 1][slab];
      } else { SH.lake.C.set(MESS[i % MESS.length], i * 3); SH.lake.A[i] = 0.8; }
    }
    SH.lake.update = (t) => {
      const T = SH.lake.T;
      T.set(base.subarray(0, LAT * 3));
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
    const g = new THREE.Group();
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(LW + 0.4, LH + 0.3, LD + 0.4)), lineMat(0xffffff)));
    [-LH / 2 + slabH, -LH / 2 + slabH * 2].forEach((y) => {
      const w = LW / 2 + 0.2, d = LD / 2 + 0.2;
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([[-w, -d], [w, -d], [w, d], [-w, d], [-w, -d]].map(([x, z]) => new THREE.Vector3(x, y, z))), lineMat(0xffffff)));
    });
    SH.lake.lines = g; SH.lake.lineOp = 0.3;
  }

  /* 4 · Espacio de embeddings */
  SH.embed = mkShape(true);
  {
    const EC = [[-2.3, 1.3, 0.4], [1.9, 1.6, -0.9], [2.4, -1.1, 0.8], [-1.7, -1.5, -0.8], [0.2, 0.05, 1.7]], base = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const c = EC[CAT[i]], noise = R[2][i] < 0.08;
      base.set(noise ? [(R[0][i] - 0.5) * 8, (R[1][i] - 0.5) * 5.5, (R[3][i] - 0.5) * 5] : [c[0] + gauss(i, 0, 1) * 0.62, c[1] + gauss(i, 1, 2) * 0.42, c[2] + gauss(i, 2, 3) * 0.5], i * 3);
      SH.embed.C.set(noise ? PAL.dark : CAT_COL[CAT[i]], i * 3);
      SH.embed.A[i] = noise ? 0.5 : 0.55 + R[4][i] * 0.45;
    }
    SH.embed.update = (t) => {
      const T = SH.embed.T;
      for (let i = 0; i < N; i++) {
        const s = SEED[i] * 50;
        T[i * 3] = base[i * 3] + Math.sin(t * 0.3 + s) * 0.06; T[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * 0.35 + s) * 0.06; T[i * 3 + 2] = base[i * 3 + 2] + Math.sin(t * 0.25 + s * 1.3) * 0.06;
      }
    };
    SH.embed.labels = EC.map((c, k) => ({ text: CAT_NAMES[k], p: [c[0], c[1] + 1.05, c[2]], cls: "lbl--cat" }));
  }

  /* 5 · Atención de un transformer */
  SH.attention = mkShape(true);
  {
    const NT = TOKENS.length, TX = (k) => -3.6 + (k * 7.2) / (NT - 1), DIMS = 8, DY = 0.13, BOT = -2.3, TOP = 1.25;
    const W = Array.from({ length: NT }, (_, i) => {
      const r = rng(900 + i), row = TOKENS.map((_, j) => (i === j ? 1.2 : 0.2) + r() * 0.8 + (j === 1 || j === 3 ? 0.9 : 0));
      return row.map((v) => v / row.reduce((a, b) => a + b, 0));
    });
    const ARCS = [];
    W.forEach((row, i) => row.map((w, j) => [w, j]).sort((a, b) => b[0] - a[0]).slice(0, 3).forEach(([w, j]) => ARCS.push({ i, j, w })));
    const arcPts = (a, f, out, o) => {
      const p0 = [TX(a.j), BOT + DIMS * DY + 0.15, 0], p2 = [TX(a.i), TOP - 0.15, 0], c = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, 1.2 + (a.i - a.j) * 0.15], u = 1 - f;
      for (let k = 0; k < 3; k++) out[o + k] = u * u * p0[k] + 2 * u * f * c[k] + f * f * p2[k];
    };
    const TOK_N = Math.floor(N * 0.34), arcOf = new Uint16Array(N), cum = [];
    let acc = 0; ARCS.forEach((a) => { acc += a.w; cum.push(acc); });
    for (let i = 0; i < N; i++) {
      if (i < TOK_N) {
        const tk = i % (NT * 2), d = Math.floor(i / (NT * 2)) % DIMS, v = rng(tk * 31 + d)();
        SH.attention.C.set(v > 0.75 ? PAL.sky : v > 0.45 ? PAL.white : v > 0.2 ? PAL.gray : PAL.dark, i * 3); SH.attention.A[i] = 0.95;
      } else {
        let k = cum.findIndex((c) => c >= R[0][i] * acc); if (k < 0) k = ARCS.length - 1;
        arcOf[i] = k;
        SH.attention.C.set(ARCS[k].w > 0.22 ? PAL.sky : ARCS[k].w > 0.15 ? PAL.mid : PAL.gray, i * 3); SH.attention.A[i] = 0.8;
      }
    }
    SH.attention.update = (t) => {
      const T = SH.attention.T;
      for (let i = 0; i < N; i++) {
        if (i < TOK_N) {
          const tk = i % (NT * 2), d = Math.floor(i / (NT * 2)) % DIMS;
          T[i * 3] = TX(tk % NT) + gauss(i, 0, 1) * 0.035; T[i * 3 + 1] = (tk >= NT ? TOP : BOT) + d * DY + gauss(i, 1, 2) * 0.02; T[i * 3 + 2] = gauss(i, 2, 3) * 0.035;
        } else arcPts(ARCS[arcOf[i]], (SEED[i] + t * 0.22) % 1, T, i * 3);
      }
    };
    SH.attention.labels = [...TOKENS.map((w, k) => ({ text: w, p: [TX(k), BOT - 0.35, 0], cls: "lbl--tok" })), { text: "Capa de atención · transformer", p: [0, TOP + DIMS * DY + 0.55, 0], cls: "lbl--box" }];
    const pts = [], o = new Float32Array(3);
    ARCS.forEach((a) => { for (let s = 0; s < 24; s++) { arcPts(a, s / 24, o, 0); pts.push(new THREE.Vector3(...o)); arcPts(a, (s + 1) / 24, o, 0); pts.push(new THREE.Vector3(...o)); } });
    SH.attention.lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0xf97316));
    SH.attention.lineOp = 0.14;
  }

  /* 6 · Métricas en barras 3D */
  SH.bars = mkShape(true);
  {
    const CX = 8, CZ = 4, ROWCOL = [PAL.white, PAL.light, PAL.sky, PAL.gray];
    for (let i = 0; i < N; i++) { SH.bars.C.set(ROWCOL[Math.floor((i % (CX * CZ)) / CX)], i * 3); SH.bars.A[i] = 0.85; }
    SH.bars.update = (t) => {
      const T = SH.bars.T;
      for (let i = 0; i < N; i++) {
        const c = i % (CX * CZ), x = c % CX, z = Math.floor(c / CX);
        const h = 0.5 + 2.6 * (0.5 + 0.5 * Math.sin(t * 0.5 + x * 1.3 + z * 0.8)) * (0.55 + 0.45 * Math.cos(x * 0.7 - z));
        T[i * 3] = -3.5 + x + (R[0][i] - 0.5) * 0.24; T[i * 3 + 1] = -1.7 + R[1][i] * h; T[i * 3 + 2] = -1.5 + z + (R[2][i] - 0.5) * 0.24;
      }
    };
  }

  /* 7 · Superficie de pérdida: el descenso avanza con el scroll */
  SH.loss = mkShape(true);
  {
    const f = (x, z) => 0.55 * Math.sin(0.9 * x) * Math.cos(0.8 * z) + 0.075 * (x * x + z * z) + 0.18 * Math.cos(1.7 * x + 0.6 * z);
    const Y = (x, z) => f(x, z) * 1.1 - 1.2;
    const NG = Math.floor(Math.sqrt(N * 0.6)), SURF = NG * NG;
    for (let i = 0; i < SURF; i++) {
      const gx = i % NG, gz = Math.floor(i / NG), x = -3.6 + (gx / (NG - 1)) * 7.2, z = -3.2 + (gz / (NG - 1)) * 6.4, y = Y(x, z);
      SH.loss.T.set([x, y, z], i * 3);
      const h = clamp((y + 1.6) / 2.6, 0, 1);
      SH.loss.C.set(h > 0.55 ? PAL.light : h > 0.3 ? PAL.gray : PAL.dark, i * 3);
      SH.loss.A[i] = 0.3 + h * 0.5;
    }
    const RAW = []; let x = -3.1, z = 2.6, vx = 0, vz = 0;
    for (let s = 0; s < 600; s++) {
      const e = 1e-3, gx = (f(x + e, z) - f(x - e, z)) / (2 * e), gz = (f(x, z + e) - f(x, z - e)) / (2 * e);
      vx = vx * 0.86 - gx * 0.03; vz = vz * 0.86 - gz * 0.03; x += vx; z += vz;
      RAW.push([x, Y(x, z) + 0.12, z]);
      if (s > 20 && Math.hypot(vx, vz) < 2e-4) break;
    }
    const LEN = [0];
    for (let k = 1; k < RAW.length; k++) LEN.push(LEN[k - 1] + Math.hypot(RAW[k][0] - RAW[k - 1][0], RAW[k][1] - RAW[k - 1][1], RAW[k][2] - RAW[k - 1][2]));
    const PATH = []; let kk = 0;
    for (let q = 0; q <= 200; q++) {
      const d = (q / 200) * LEN.at(-1);
      while (kk < LEN.length - 2 && LEN[kk + 1] < d) kk++;
      const o = [0, 0, 0]; lerp3(RAW[kk], RAW[kk + 1], clamp((d - LEN[kk]) / Math.max(1e-6, LEN[kk + 1] - LEN[kk]), 0, 1), o, 0); PATH.push(o);
    }
    const pathAt = (u, out, o) => { u = clamp(u, 0, 1); const k = Math.min(PATH.length - 2, Math.floor(u * (PATH.length - 1))); lerp3(PATH[k], PATH[k + 1], u * (PATH.length - 1) - k, out, o); };
    for (let i = SURF; i < N; i++) { const head = R[2][i] < 0.25; SH.loss.C.set(head ? PAL.white : PAL.sky, i * 3); SH.loss.A[i] = head ? 1 : 0.85; }
    const base = SH.loss.T.slice(0, SURF * 3);
    SH.loss.update = (t, p) => {
      const T = SH.loss.T;
      T.set(base);
      for (let i = SURF; i < N; i++) {
        const head = R[2][i] < 0.25;
        const u = head ? p : p - Math.pow(SEED[i], 1.6) * Math.min(p, 0.5);
        pathAt(u, T, i * 3);
        const sp = head ? 0.09 : 0.035;
        T[i * 3] += gauss(i, 0, 1) * sp; T[i * 3 + 1] += Math.abs(gauss(i, 1, 2)) * sp; T[i * 3 + 2] += gauss(i, 2, 3) * sp;
      }
    };
    const o = new Float32Array(3);
    SH.loss.labels = STEPS.map((text, k) => { pathAt(k / 4, o, 0); return { text, p: [o[0], o[1] + 0.5, o[2]], cls: "lbl--step", step: k }; });
  }

  Object.values(SH).forEach((s) => { if (s.lines) { s.lines.visible = false; spin.add(s.lines); } });
  const setLineOpacity = (obj, o) => obj.traverse((c) => { if (c.material) c.material.opacity = o; });

  /* ---------- Etiquetas HTML proyectadas desde 3D ---------- */
  const LBL = [];
  Object.entries(SH).forEach(([name, sh]) => sh.labels.forEach((l) => {
    const el = document.createElement("span");
    el.className = `lbl ${l.cls || ""}`; el.textContent = l.text;
    labelsEl.append(el);
    LBL.push({ el, shape: name, v: new THREE.Vector3(...l.p), on: false, step: l.step });
  }));
  const tmp = new THREE.Vector3();

  /* ---------- Scroll → mezcla entre capítulos ---------- */
  const secs = [...document.querySelectorAll("main section[data-scene]")];
  const blendInfo = { a: 0, b: 0, s: 0, deep: 0 };
  const scrollBlend = () => {
    const c = innerHeight * 0.5, Z = innerHeight * 0.45;
    const tops = secs.map((s) => s.getBoundingClientRect().top);
    let k = 0;
    for (let i = 0; i < secs.length; i++) if (tops[i] <= c) k = i;
    if (k + 1 < secs.length && tops[k + 1] - c < Z) { blendInfo.a = k; blendInfo.b = k + 1; blendInfo.s = 0.5 - (tops[k + 1] - c) / (2 * Z); }
    else if (k > 0 && c - tops[k] < Z) { blendInfo.a = k - 1; blendInfo.b = k; blendInfo.s = 0.5 + (c - tops[k]) / (2 * Z); }
    else { blendInfo.a = k; blendInfo.b = k; blendInfo.s = 0; }
    // cuánto se ha avanzado dentro de un capítulo largo (para atenuar la escena detrás del contenido)
    blendInfo.deep = smooth(-tops[blendInfo.a] / innerHeight);
    return blendInfo;
  };
  const stateOf = (i) => STATES[secs[i]?.dataset.scene] || STATES.hero;
  const progressOf = (st) => {
    if (!st.progress) return 0;
    const el = document.getElementById(st.progress); if (!el) return 0;
    const r = el.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
  };

  /* ---------- Intro ---------- */
  let intro = RM ? 0 : 1, introRelease = RM, introT0 = 0;
  if (!RM) for (let i = 0; i < N; i++) {
    const u = R[0][i] * 2 - 1, th = R[1][i] * Math.PI * 2, s = Math.sqrt(1 - u * u), rad = 10 + R[2][i] * 10;
    P.set([Math.cos(th) * s * rad, u * rad, Math.sin(th) * s * rad - 4], i * 3);
  }
  addEventListener("skylab:intro-end", () => { if (!introRelease) { introRelease = true; introT0 = performance.now(); } });

  /* ---------- Eventos ---------- */
  let focus = -1;
  addEventListener("skylab:focus", (e) => { focus = CAT_KEYS.indexOf(e.detail?.cat); });
  addEventListener("skylab:launch", () => {
    if (RM) return;
    for (let i = 0; i < N; i++) {
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], l = Math.hypot(x, y, z) || 1, f = 1.5 + R[2][i] * 3;
      P[i * 3] += (x / l) * f; P[i * 3 + 1] += (y / l) * f; P[i * 3 + 2] += (z / l) * f;
    }
  });
  const mouse = new THREE.Vector2(), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  let mx = 0, my = 0, mouseAt = 0;
  addEventListener("pointermove", (e) => { mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1; mouseAt = performance.now(); }, { passive: true });
  let lastScroll = scrollY, vel = 0;

  const resize = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  addEventListener("resize", resize);
  resize();

  /* ---------- Bucle ---------- */
  const camT = new THREE.Vector3(), look = new THREE.Vector3();
  let time = 0, last = performance.now(), opac = 0, spinAngle = 0, wob = 0, fov = 45;
  AL.fill(RM ? 1 : 0);
  COL.set(SH.logo.C);

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!RM) time += dt;
    const sm = small();

    // Intro: el logo se sostiene hasta que main.js lo libera
    if (introRelease && intro > 0) intro = RM ? 0 : Math.max(0, 1 - (now - introT0) / 1700);
    const im = smooth(intro);

    // Capítulos
    const { a, b, s, deep } = scrollBlend();
    const ss = smooth(s), stA = stateOf(a), stB = stateOf(b);
    const shA = SH[stA.shape], shB = SH[stB.shape], same = shA === shB;
    const pA = progressOf(stA), pB = progressOf(stB);
    if (shA.dynamic) shA.update(time, pA);
    if (!same && shB.dynamic) shB.update(time, pB);
    const L = SH.logo;

    const fOn = focus >= 0 && ((shA === SH.embed && ss < 0.5) || (shB === SH.embed && ss >= 0.5));
    const ka = RM ? 1 : 1 - Math.exp(-dt * 4);
    const slow = intro >= 1;
    for (let i = 0; i < N; i++) {
      const j = i * 3;
      // mezcla entre figuras con retraso por partícula y remolino
      const si = same ? 0 : smooth(ss * 1.7 - D[i] * 0.7);
      let x, y, z, cr, cg, cb, al;
      if (si <= 0) { x = shA.T[j]; y = shA.T[j + 1]; z = shA.T[j + 2]; cr = shA.C[j]; cg = shA.C[j + 1]; cb = shA.C[j + 2]; al = shA.A[i]; }
      else {
        x = mix(shA.T[j], shB.T[j], si); y = mix(shA.T[j + 1], shB.T[j + 1], si); z = mix(shA.T[j + 2], shB.T[j + 2], si);
        cr = mix(shA.C[j], shB.C[j], si); cg = mix(shA.C[j + 1], shB.C[j + 1], si); cb = mix(shA.C[j + 2], shB.C[j + 2], si); al = mix(shA.A[i], shB.A[i], si);
        const w = Math.sin(Math.PI * si);
        if (w > 0.001) {
          const ang = w * (1.1 + D[i] * 1.4), co = Math.cos(ang), sn = Math.sin(ang), rad = 1 + w * 0.45;
          const nx = (x * co - z * sn) * rad, nz = (x * sn + z * co) * rad;
          x = nx; z = nz; y = y * (1 + w * 0.2) + w * (R[1][i] - 0.5) * 1.6;
        }
      }
      // intro: del logo hacia la escena
      if (im > 0) {
        const li = smooth(im * 1.7 - (1 - D[i]) * 0.7);
        if (li > 0) {
          const w = slow ? 0 : Math.sin(Math.PI * li);
          x = mix(x, L.T[j], li); y = mix(y, L.T[j + 1], li); z = mix(z, L.T[j + 2], li);
          cr = mix(cr, L.C[j], li); cg = mix(cg, L.C[j + 1], li); cb = mix(cb, L.C[j + 2], li); al = mix(al, L.A[i], li);
          if (w > 0.001) { const ang = -w * (1.4 + D[i]), co = Math.cos(ang), sn = Math.sin(ang); const nx = x * co - z * sn; z = x * sn + z * co; x = nx; z += w * 1.5; }
        }
      }
      const k = RM ? 1 : 1 - Math.exp(-dt * (slow ? K[i] * 0.55 : K[i]));
      P[j] += (x - P[j]) * k; P[j + 1] += (y - P[j + 1]) * k; P[j + 2] += (z - P[j + 2]) * k;
      COL[j] += (cr - COL[j]) * k; COL[j + 1] += (cg - COL[j + 1]) * k; COL[j + 2] += (cb - COL[j + 2]) * k;
      AL[i] += ((fOn ? (CAT[i] === focus ? 1 : 0.08) : al) - AL[i]) * ka;
    }

    // Transformación: mezcla de los dos capítulos y del logo
    const blend = (key, i) => mix(mix(stA[key][i], stB[key][i], ss), LOGO_STATE[key][i], im);
    const tgt = [blend("pos", 0), blend("pos", 1), blend("pos", 2)];
    if (sm) { tgt[0] *= 0.1; tgt[2] -= 1.5 * (1 - im); }
    const e = RM ? 1 : 1 - Math.exp(-dt * 5);
    stage.position.x += (tgt[0] - stage.position.x) * e; stage.position.y += (tgt[1] - stage.position.y) * e; stage.position.z += (tgt[2] - stage.position.z) * e;
    const sc = mix(mix(stA.scale, stB.scale, ss), LOGO_STATE.scale, im) * (sm ? 0.8 : 1);
    stage.scale.setScalar(stage.scale.x + (sc - stage.scale.x) * e);
    const spinRate = mix(stA.spin || 0, stB.spin || 0, ss) * (1 - im);
    if (spinRate > 0.005 && !RM) spinAngle += spinRate * dt;
    else spinAngle += (Math.round(spinAngle / (Math.PI * 2)) * Math.PI * 2 - spinAngle) * e;
    const wobAmp = mix(stA.wobble || 0, stB.wobble || 0, ss);
    wob += (Math.sin(time * 0.35) * wobAmp - wob) * e;
    spin.rotation.x += (blend("tilt", 0) - spin.rotation.x) * e;
    spin.rotation.z += (blend("tilt", 2) - spin.rotation.z) * e;
    spin.rotation.y = mix(mix(stA.tilt[1], stB.tilt[1], ss) + spinAngle + wob, Math.sin(time * 0.6) * 0.35, im);

    // Ratón: las partículas se apartan del cursor
    if (FINE && now - mouseAt < 2500 && !RM && im < 0.5) {
      mouse.set(mx, -my); ray.setFromCamera(mouse, camera);
      plane.constant = -stage.position.z;
      if (ray.ray.intersectPlane(plane, hit)) {
        spin.worldToLocal(hit);
        const RR = 1.25 / stage.scale.x, R2 = RR * RR;
        for (let i = 0; i < N; i++) {
          const j = i * 3, dx = P[j] - hit.x, dy = P[j + 1] - hit.y, dz = P[j + 2] - hit.z, d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < R2 && d2 > 1e-6) { const d = Math.sqrt(d2), f = (((RR - d) / RR) * 0.16 * RR) / d; P[j] += dx * f; P[j + 1] += dy * f; P[j + 2] += dz * f; }
        }
      }
    }
    aPos.needsUpdate = true; aCol.needsUpdate = true; aAl.needsUpdate = true;

    const depthOp = mix(1, stA.deep ?? 1, deep * (1 - ss));
    const op = mix(mix(stA.op ?? 1, stB.op ?? 1, ss) * depthOp, 1, im) * (sm ? 0.65 + 0.35 * im : 1);
    opac += (op - opac) * e;
    pMat.uniforms.uOpacity.value = opac;
    const size = BASE_SIZE * mix(mix(stA.size || 1, stB.size || 1, ss), 1.15, im);
    pMat.uniforms.uSize.value += (size - pMat.uniforms.uSize.value) * e;
    pMat.uniforms.uTime.value = time;
    if (bloom) bloom.strength = 0.85 + im * 0.6;
    grid.material.opacity = 1 - im;

    Object.values(SH).forEach((sh) => {
      if (!sh.lines) return;
      const wgt = (shA === sh ? 1 - ss : 0) + (shB === sh ? ss : 0);
      sh.curOp += (sh.lineOp * Math.min(1, wgt) * opac * (1 - im) - sh.curOp) * e;
      setLineOpacity(sh.lines, sh.curOp); sh.lines.visible = sh.curOp > 0.004;
    });

    // Cámara: posición por capítulo, paralaje y "warp" con la velocidad del scroll
    vel += ((scrollY - lastScroll) / Math.max(dt, 1e-3) - vel) * 0.15; lastScroll = scrollY;
    camT.set(blend("cam", 0) + mx * 0.45, blend("cam", 1) - my * 0.3, blend("cam", 2) + (camera.aspect < 1 ? (1 - camera.aspect) * 7 : 0));
    camera.position.lerp(camT, RM ? 1 : 1 - Math.exp(-dt * 2.4));
    look.set(0, blend("cam", 1) * 0.4, 0);
    camera.lookAt(look);
    const fovT = 45 + (RM ? 0 : clamp(Math.abs(vel) * 0.004, 0, 9));
    fov += (fovT - fov) * 0.08;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    scene.updateMatrixWorld();

    // Etiquetas
    let labShape = im > 0.05 ? null : same ? shA : ss < 0.12 ? shA : ss > 0.88 ? shB : null;
    if (labShape && labShape === shA && !stA.progress && deep > 0.3) labShape = null;
    const w = canvas.clientWidth, h = canvas.clientHeight, pL = labShape === SH.loss ? (shA === SH.loss ? pA : pB) : 0;
    for (const l of LBL) {
      const on = !!labShape && SH[l.shape] === labShape && opac > 0.55;
      if (on) {
        tmp.copy(l.v).applyMatrix4(spin.matrixWorld).project(camera);
        l.el.style.transform = `translate3d(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px, 0)`;
        if (l.step !== undefined) l.el.classList.toggle("is-active", Math.round(pL * 4) === l.step);
      }
      if (on !== l.on) { l.on = on; l.el.classList.toggle("is-on", on); }
    }

    if (composer) composer.render(); else renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);
  root.classList.add("has-webgl");
  dispatchEvent(new CustomEvent("skylab:scene-ready"));
}

init();
