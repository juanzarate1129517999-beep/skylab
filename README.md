# SKYLAB 🚀

**Plataforma SaaS de Inteligencia Artificial e Ingeniería de Datos** para grandes empresas, PyMEs y microempresas.

**CEO & Fundador:** Juan Sebastián Zárate Camargo

---

## Soluciones (19)

| Familia | Soluciones |
|---|---|
| **Datos y BI** | Nexus (lakehouse y pipelines) · Insight (BI y preguntas en español) · Forge (modelos a medida y MLOps) |
| **IA Generativa** | Agents (atención 24/7) · Copilot (asistente interno con RAG) · DocAI (lectura de documentos) · Studio (contenido de marketing) |
| **Analítica Predictiva** | Forecast (demanda) · Pulse (clientes y churn) · Price (precios dinámicos) · Leads (puntaje comercial) · Shield (fraude y anomalías) |
| **Visión y Voz** | Vision (visión por computador) · Voice (agentes de voz) · Meet (actas y tareas de reuniones) |
| **Operaciones** | Flow (automatización) · Route (logística) · Sentinel (mantenimiento predictivo) · Talent (RR. HH.) |

### Planes
- **Esencial** — microempresas (desde USD 49/mes)
- **Crecimiento** — PyMEs (desde USD 390/mes)
- **Corporativo** — grandes empresas (a medida)

## Sitio web

Sitio estático (HTML + CSS + JavaScript, sin build) con fondo negro, paleta monocromática y el azul del logo.
Una escena 3D fija (three.js) acompaña el scroll: una sola nube de partículas cambia de forma en cada capítulo.

| Capítulo | Figura 3D |
|---|---|
| 00 · Inicio | Red neuronal con señales viajando entre capas |
| 01 · Tus datos | 14 fuentes de datos dispersas |
| 02 · La base | Lakehouse por capas (bronce, plata, oro) |
| 03 · Soluciones de IA | Espacio de embeddings: una nube por familia (19 tarjetas con filtro y detalle) |
| 04 · Modelos de lenguaje | Capa de atención de un transformer (Claude, RAG, agentes) |
| 05 · Demo | Agente de WhatsApp, pronóstico y pipeline funcionando en el navegador |
| 06 · Industrias | Métricas en barras 3D |
| 07 · Método | Superficie de pérdida y descenso del gradiente con los 5 pasos |
| 08 · Precios | Calculadora de ahorro y planes |
| 09 · Nosotros | Carta del fundador y preguntas frecuentes |
| 10 · Contacto | Formulario de demo |

Responsive, compatible con `prefers-reduced-motion` y con fondo de respaldo si el navegador no tiene WebGL.

### Logo

PNG listos para usar en `assets/img/png/`: `skylab-logo-color.png` (fondo oscuro), `skylab-logo-dark.png` (fondo claro),
`skylab-logo-white.png`, `skylab-mark.png`, `skylab-mark-dark.png` y `skylab-icon.png` (1024 px).

### Estructura

```
.
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/main.js        # interfaz, demos, catálogo de soluciones
│   ├── js/scene.js       # escena 3D (módulo ES)
│   ├── vendor/three.module.min.js
│   └── img/              # logos SVG/PNG, favicon, foto del CEO
└── .github/workflows/pages.yml   # despliegue automático a GitHub Pages
```

### Ejecutar en local

```bash
python3 -m http.server 8080
```

Luego abre http://localhost:8080

### Despliegue

El workflow `.github/workflows/pages.yml` publica el sitio en **GitHub Pages** en cada push a `main`.
Actívalo en *Settings → Pages → Build and deployment → Source: GitHub Actions*.

### Personalización pendiente

- **Formulario de contacto:** hoy simula el envío. Conéctalo a un backend o a un servicio como Formspree (ver `TODO` en `assets/js/main.js`).
- **Métricas:** las cifras del sitio son objetivos / escenarios de referencia; actualízalas con resultados reales de clientes.

---

© SKYLAB
