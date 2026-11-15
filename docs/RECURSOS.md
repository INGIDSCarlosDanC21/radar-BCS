# Registro de recursos

Todo recurso externo (código, texto, imágenes, datos, audio, modelos 3D) se anota aquí con URL y licencia. La entrega lo exige. Lo pendiente se deja vacío, no se inventa.

## Datos NASA

| Dataset | URL | Uso |
|---|---|---|
| NASA POWER, datos mensuales (MERRA-2), comunidad AG, API v2.10.0 | <https://power.larc.nasa.gov/docs/services/api/temporal/monthly/> | **Usado** (pipeline `analisis/`, issues #5 y #7; descargado el 2026-11-14): temperatura del aire a 2 m (T2M) y lluvia (PRECTOTCORR), La Paz (24.14 N, -110.31 O), 2001-2025; salida `data/salida/indicadores.json` |
| MODIS MOD11A2 V061 (temperatura de superficie, 1 km) | <https://lpdaac.usgs.gov/products/mod11a2v061/> | **Usado** (2026-11-14): LST de 6 zonas de La Paz 2001-2025 vía AppEEARS; filtros y resultado en `analisis/modis.py` |
| MODIS MOD13Q1 V061 (NDVI, 250 m) | <https://lpdaac.usgs.gov/products/mod13q1v061/> | **Usado** (2026-11-14): NDVI de 6 zonas 2001-2025 vía AppEEARS; indicador `vegetacion` |
| JPL GRACE y GRACE-FO Mascon CRI RL06.3Mv04 (agua total almacenada, malla de 0.5°, mensual desde 2002-04), DOI 10.5067/TEMSC-3JC634 | <https://doi.org/10.5067/TEMSC-3JC634> (PO.DAAC; cita: Wiese et al., 2023; datos descargados de PO.DAAC el 2026-11-14) | **Usado** (`analisis/agua.py`): anomalía de agua en la celda de La Paz, tendencia regional. GLDAS-2.2 CLSM (DOI 10.5067/TXBMLX370XX8) quedó previsto como contraste, sin usar |
| ECOSTRESS (70 m) | <https://ecostress.jpl.nasa.gov/> | Previsto; sin usar todavía |
| NASADEM (relieve, 30 m) | <https://lpdaac.usgs.gov/products/nasadem_hgtv001/> | Previsto; sin usar todavía |
| NASA Earthdata AppEEARS (herramienta de descarga) | <https://appeears.earthdatacloud.nasa.gov/> | **Usado** (2026-11-14): extracción de puntos MODIS (`analisis/appeears.py`) |

Enlaces comprobados el 2026-11-14 (responden y el título coincide con el producto).

## Otros datos y recursos

| Nombre | URL | Licencia | Dónde se usa |
|---|---|---|---|
| Forest Trends (2024), *Resultados del taller: Liderazgo e innovación financiera para la resiliencia hídrica de La Paz* | <https://forest-trends.org/wp-content/uploads/2025/01/Reporte-Taller-Liderazgo-Resiliencia-Hidrica-La-Paz-2024.11.11.pdf> | Derechos del autor; solo se cita | `docs/investigacion/contexto-local.md` (cifras de agua) |
| FMCN, estudio de vulnerabilidad de La Paz | <https://desarrollo.fmcn.org/wp-content/uploads/2025/07/Estudio_Vulnerabilidad_LaPaz.pdf> | Derechos del autor; solo se cita | `docs/investigacion/contexto-local.md` (29,825 habitantes) |
| El Congresista, 27 oct 2026, nota sobre enfermedades por calor en BCS | <https://elcongresista.mx/politica/baja-california-sur/aumento-enfermedades-calor-bcs> | Derechos del medio; solo se cita | `docs/investigacion/contexto-local.md` |
| Zeta, 27 oct 2026, nota sobre enfermedades y muertes por calor en BCS | <https://zetatijuana.com/2026/10/incrementan-enfermedades-y-muertes-por-calor-en-bcs/> | Derechos del medio; solo se cita | `docs/investigacion/contexto-local.md` |
| Zeta, 30 may 2023, nota sobre fugas en La Paz | <https://zetatijuana.com/2023/05/veto-de-conagua-a-la-paz-por-desvio-de-recursos/> | Derechos del medio; solo se cita | `docs/investigacion/contexto-local.md` |
| NASA Space Apps, *2026 Judging & Awards Guide* | <https://www.spaceappschallenge.org/resources/judging-awards-guide/> | Sitio oficial; solo se cita | `docs/decisiones.md` (rúbrica) |
| Leaflet 1.9.4 | <https://leafletjs.com/> (cargado desde <https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/>) | BSD-2-Clause | `web/` (mapa) |
| Teselas de OpenStreetMap | <https://www.openstreetmap.org/copyright> | ODbL; atribución "© OpenStreetMap contributors" en el mapa | `web/` (mapa base) |
| CDC, *Five Steps to help your patients stay safe on hot days* (Heat Action Plan) | <https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf> | Sitio oficial; solo se cita | `web/` (pantalla Acciones) |
| EPA WaterSense, *Start Saving* | <https://www.epa.gov/watersense/start-saving> | Sitio oficial; solo se cita | `web/` (pantalla Acciones) |
| `pymannkendall` 1.4.3 (Hussain y Mahmud, 2019, DOI 10.21105/joss.01556) | <https://github.com/mmhs013/pyMannKendall> | MIT (PyPI, 2026-11-14) | `analisis/tendencias.py` (y el prototipo `analisis/prototipo_power.py`): pruebas Mann-Kendall estacionales y pendiente de Sen |
| NumPy | <https://numpy.org/> | BSD-3-Clause (PyPI, 2026-11-14) | `analisis/tendencias.py` y `analisis/exportar.py` (y el prototipo) |
| Requests | <https://requests.readthedocs.io/> | Apache-2.0 (PyPI, 2026-11-14) | `analisis/descargar.py`: descarga de NASA POWER (y el prototipo) |
| netCDF4 (Python) 1.7.5 | <https://unidata.github.io/netcdf4-python/> | MIT (PyPI, 2026-11-14) | `analisis/agua.py`: lectura del netCDF de GRACE |
| SciPy 1.18.1 | <https://scipy.org/> | BSD-3-Clause (licencia del proyecto; versión instalada verificada el 2026-11-15) | `analisis/correlacion.py`: correlación de Spearman lluvia-agua |
| pytest | <https://docs.pytest.org/> | MIT (PyPI, versión 9.2.0, verificado el 2026-11-14) | `analisis/tests/`: pruebas del pipeline (solo desarrollo) |
| Imagen de Baja California Sur: NASA GIBS, MODIS Terra Corrected Reflectance, 2025-04-20 | <https://gibs.earthdata.nasa.gov/> (URL exacta en `web/img/FUENTES.md`) | CC0 según la política de datos de NASA Earthdata (<https://www.earthdata.nasa.gov/learn/use-data/data-use-policy>); sin logos de NASA; crédito en pantalla | `web/img/` (Inicio y Login/Registro). **Previsto: PR #69 en revisión** |
| Fuentes Space Grotesk, Manrope y JetBrains Mono | <https://github.com/google/fonts/tree/main/ofl/> (cargadas desde Google Fonts) | SIL Open Font License 1.1 (verificado el 2026-11-14 en los OFL.txt del repositorio google/fonts). Aviso: cargarlas desde Google envía la IP del visitante a Google | `web/` (interfaz de Figma). **Previsto: PR #69 en revisión** |
| Logotipo "Radar BCS" (radar, cactus y gota de agua, texto azul marino), `web/assets/logo-radar-bcs.png`, exportado del archivo de Figma "Radar paceño" (id `ae9KMSMZUexeV0dBhDkNR1`) | Archivo propio del repositorio (no hay URL externa) | Generado con Gemini (Google), confirmado por Ehileen el 2026-11-14; términos de uso de Gemini para imágenes generadas: POR CONFIRMAR. No lleva marca NASA. Debe declararse en el sitio como "Logotipo generado con IA (AI-generated)" | Encabezado de todas las pantallas de `web/` (componente de Figma) |
| 12 íconos de sección, `web/assets/iconos/*.svg` (clima-, agricultura-, pesca-), exportados como vectores de las maquetas de Figma | Origen (confirmado por Ehileen el 2026-11-14): parte de las maquetas de Google Stitch y parte de Flaticon <https://www.flaticon.com/>. Qué ícono viene de cada fuente y los autores de Flaticon: POR CONFIRMAR | Flaticon, licencia gratuita: exige atribución en la web, una línea por autor ("Icon made by [autor] from www.flaticon.com"), junto al ícono o en el pie (<https://support.flaticon.com/s/article/Attribution-How-when-and-where-FI?language=en_US>, revisado el 2026-11-14). Los packs de Google y de Dave Gandy en Flaticon no están cubiertos por esa licencia. Stitch: términos POR CONFIRMAR | Pantallas de sección de `web/` |
| supabase-js 2.118.0 | <https://github.com/supabase/supabase-js> (cargado desde jsDelivr con SRI) | MIT (según Diego; verificar al integrar) | `web/js/acceso.js` (login opcional). **Previsto: PR #69 en revisión** |
| Supabase Auth (servicio, plan gratuito) | <https://supabase.com/> | Términos del servicio de Supabase: POR CONFIRMAR por Programación B. Guarda solo correo y contraseña (cifrada) de quien se registre | Login opcional (issue #73). El proyecto aún no existe; entra a `main` solo si pasa la hora de corte del domingo 09:00 |

## Uso de IA

| Herramienta | Para qué | Dónde | Estado |
|---|---|---|---|
| Claude Code | Configuración del repositorio, documentación y código; para UI/UX: pulido de las pantallas de Figma (encabezado, pie, pestañas, colores), exportación de assets, especificación de diseño y pruebas de diseño (2026-11-14) | Todo el repositorio; para UI/UX: `diseno/` (incl. `diseno/ESPECIFICACION.md` y `diseno/tools/`), `web/assets/` | Usado |
| Gemini (Google), confirmado por Ehileen el 2026-11-14 (no Google Stitch) | Generación del logotipo "Radar BCS" (radar, cactus y gota de agua) | `web/assets/logo-radar-bcs.png` (encabezado de todas las pantallas) | **Usado** (declarar como "Logotipo generado con IA (AI-generated)" en el sitio). Términos de uso de Gemini: POR CONFIRMAR por UI/UX |
| Claude Code (subagentes haiku y sonnet), 2026-11-14 | Búsqueda de fuentes del contexto local y de referencias del método; redacción del borrador de entrega en inglés; revisado por el Líder | `docs/investigacion/contexto-local.md`, `docs/investigacion/metodo.md`, `docs/entrega/`, `docs/decisiones.md`, `docs/bitacora.md` | Usado |
| Claude Code (subagente sonnet), 2026-11-14 | Código de la web (HTML/CSS/JS) y datos sintéticos de prueba marcados "DATOS DE PRUEBA"; revisado por Diego | `web/` | Usado |
| Claude Code (Sonnet 5.5), 2026-11-14 | Código del pipeline de tendencias y sus pruebas; datos calculados por ese código (`data/salida/indicadores.json`, campo `generado_con`); pendiente de revisión por Luca e Investigación | `analisis/`, `data/salida/` | Usado |
| Codex | Tareas delegadas | — | **No usado** (confirmado por el equipo el 2026-11-14) |
| Tripo3D | Modelo 3D (relieve) | — | **No usado** (confirmado el 2026-11-14) |
| ElevenLabs | Voz/narración del video | — | **No usado** (confirmado el 2026-11-14); la narración es humana |
| Google Stitch (herramienta de diseño de interfaces con IA, stitch.google.com), 2026-11-14 | Diseño de la interfaz de las 4 pantallas (disposición, paleta) por UI/UX (Ehileen y Roberto). Las pantallas de referencia (maquetas importadas a Figma) salieron de Stitch; el logotipo NO salió de Stitch (ver fila anterior). Lo que se use en la web se adapta y se revisa a mano | `web/assets/`, `diseno/` y la interfaz de `web/` (pantallas de referencia en `diseno/pantallas/`; las pantallas finales son del equipo) | **Usado** (confirmado por Carlos el 2026-11-14). Toda imagen generada lleva marca "AI-generated"; términos de uso y licencia de lo generado: POR CONFIRMAR por UI/UX |
| Skills y plugins de terceros | Ver [`docs/skills-terceros.md`](skills-terceros.md) | Herramientas de desarrollo | Ver archivo |

Recordatorio: imágenes y video generados llevan marca de agua visible "AI-generated"; prohibido usar o modificar logos de la NASA; sin menores de 18.
