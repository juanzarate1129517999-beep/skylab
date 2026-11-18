# SKYLAB 🚀

**Plataforma SaaS de Inteligencia Artificial e Ingeniería de Datos** para grandes empresas, PyMEs y microempresas.

**CEO & Fundador:** Juan Sebastián Zárate Camargo

---

## Soluciones

| Módulo | Categoría | Qué resuelve |
|---|---|---|
| **SkyLab Nexus** | Ingeniería de Datos | Lakehouse administrado, conectores y pipelines ETL/ELT |
| **SkyLab Insight** | Ingeniería de Datos | BI en tiempo real y consultas en lenguaje natural (Text-to-SQL) |
| **SkyLab Agents** | IA Generativa | Agentes de atención al cliente 24/7 (WhatsApp, web, Instagram) |
| **SkyLab DocAI** | IA Generativa | Extracción inteligente de facturas, contratos y formularios |
| **SkyLab Flow** | IA Generativa | Automatización de procesos con pasos de IA |
| **SkyLab Forecast** | Analítica Predictiva | Pronóstico de demanda, ventas e inventario |
| **SkyLab Pulse** | Analítica Predictiva | Segmentación, churn, CLV y recomendaciones |
| **SkyLab Shield** | Analítica Predictiva | Detección de fraude y anomalías |

### Planes
- **Despegue** — microempresas (desde USD 49/mes)
- **Órbita** — PyMEs (desde USD 390/mes)
- **Galaxia** — grandes empresas (a medida)

## Sitio web

Sitio estático (HTML + CSS + JavaScript, sin dependencias ni build) con identidad visual **"Ascenso"**:
la página es un despegue. Empieza de día en la superficie y, al hacer scroll, asciende por la atmósfera
hasta la órbita geoestacionaria.

- Intro con cuenta regresiva de lanzamiento
- Altímetro fijo que marca la altitud real (km) y la capa atmosférica según el scroll
- Planeta de datos 3D interactivo (canvas) con los 8 módulos como satélites en órbita
- Selector de módulos con un visual animado distinto para cada uno
- Línea de Kármán (100 km) como transición del cielo al espacio
- "Elige tu órbita": LEO / MEO / GEO para micro, PyME y gran empresa
- Secuencia de lanzamiento fijada al scroll: un cohete recorre las 5 etapas del método
- Centro de control con demos: agente de IA, pronóstico y pipeline de datos
- Calculadora de ahorro con tablero tipo aeropuerto (split-flap)
- Precios como pases de abordar
- Insignia de misión del CEO
- Formulario que lanza un cohete al enviarse
- Footer con el horizonte de la Tierra vista desde la órbita
- Responsive y compatible con `prefers-reduced-motion`

### Estructura

```
.
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   └── img/favicon.svg
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

- **Foto del CEO:** agrega `assets/img/ceo.jpg` y reemplaza el bloque de iniciales en la sección *Nosotros* de `index.html`.
- **Formulario de contacto:** hoy simula el envío. Conéctalo a un backend o a un servicio como Formspree (ver `TODO` en `assets/js/main.js`).
- **Métricas:** las cifras del sitio son objetivos / escenarios de referencia; actualízalas con resultados reales de clientes.

---

© SKYLAB
