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
- **Microempresa** (1 a 10 personas) — cotización a medida
- **PyME** (11 a 250 personas) — cotización a medida
- **Gran empresa** (más de 250 personas) — cotización a medida

## Sitio web

Sitio estático (HTML + CSS + JavaScript, sin build) con fondo negro y la misma identidad de Skylab Phoenix: logo del fénix, tipografía Geist y paleta ámbar → naranja → rosa → violeta.
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
| 08 · Planes | Calculadora de ahorro y planes por tamaño de empresa, con botón "Cotizar" |
| 09 · Nosotros | Carta del fundador y preguntas frecuentes |
| 10 · Contacto | Formulario de demo |

Experiencia:
- **Intro**: miles de partículas llegan desde fuera de la pantalla y forman el logo de SKYLAB en 3D mientras un contador "carga" los datos.
- **Transiciones amarradas al scroll**: las partículas viajan en remolino de una figura a la siguiente según cuánto bajes.
- **Brillo (bloom)**, cámara que cambia por capítulo y efecto "warp" al hacer scroll rápido.
- **Partículas que esquivan el cursor**, cursor propio y grano de película.
- **Títulos que se revelan palabra por palabra** y textos que se "decodifican".
- **Método fijo en pantalla**: al bajar, el descenso del gradiente avanza por la superficie de pérdida y cambia el paso.
- Bandas tipográficas gigantes que reaccionan a la velocidad del scroll.

Responsive, compatible con `prefers-reduced-motion` y con fondo de respaldo si el navegador no tiene WebGL.

### Logo

Logo del fénix (el mismo de Skylab Phoenix) con la paleta ámbar → naranja → rosa → violeta. PNG listos para usar en `assets/img/png/`: `skylab-logo-color.png` (fondo oscuro), `skylab-logo-dark.png` (fondo claro),
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

- **Formulario de contacto:** envía las solicitudes de demo a tu correo con [Web3Forms](https://web3forms.com). Genera tu clave de acceso en web3forms.com y pégala en el campo `access_key` de `index.html` (formulario `#contactForm`). La clave no revela tu correo. Sin clave, el formulario avisa que aún no está activo.
- **Métricas:** las cifras del sitio son objetivos / escenarios de referencia; actualízalas con resultados reales de clientes.

---

© SKYLAB
