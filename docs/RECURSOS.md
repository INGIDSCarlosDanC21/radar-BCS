# Registro de recursos

Todo recurso externo (código, texto, imágenes, datos, audio, modelos 3D) se anota aquí con URL y licencia. La entrega lo exige. Lo pendiente se deja vacío, no se inventa.

## Datos NASA

| Dataset | URL | Uso |
|---|---|---|
| NASA POWER, datos mensuales (MERRA-2), comunidad AG, API v2.10.0 | <https://power.larc.nasa.gov/docs/services/api/temporal/monthly/> | **Usado** (pipeline `analisis/`, issues #5 y #7; descargado el 2026-11-14): temperatura del aire a 2 m (T2M) y lluvia (PRECTOTCORR), La Paz (24.14 N, -110.31 O), 2001-2025; salida `data/salida/indicadores.json` |
| MODIS MOD11A2 V061 (temperatura de superficie, 1 km) | <https://lpdaac.usgs.gov/products/mod11a2v061/> | **Usado** (2026-11-14): LST de 6 zonas de La Paz 2001-2025 vía AppEEARS; filtros y resultado en `analisis/modis.py` |
| MODIS MOD13Q1 V061 (NDVI, 250 m) | <https://lpdaac.usgs.gov/products/mod13q1v061/> | **Usado** (2026-11-14): NDVI de 6 zonas 2001-2025 vía AppEEARS; indicador `vegetacion` |
| GRACE-FO / GLDAS (agua subterránea, regional) | <https://gracefo.jpl.nasa.gov/> y <https://ldas.gsfc.nasa.gov/gldas> | Previsto; sin usar todavía |
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
| pytest | <https://docs.pytest.org/> | MIT (PyPI, versión 9.2.0, verificado el 2026-11-14) | `analisis/tests/`: pruebas del pipeline (solo desarrollo) |

## Uso de IA

| Herramienta | Para qué | Dónde | Estado |
|---|---|---|---|
| Claude Code | Configuración del repositorio, documentación y código | Todo el repositorio | Usado |
| Claude Code (subagentes haiku y sonnet), 2026-11-14 | Búsqueda de fuentes del contexto local y de referencias del método; redacción del borrador de entrega en inglés; revisado por el Líder | `docs/investigacion/contexto-local.md`, `docs/investigacion/metodo.md`, `docs/entrega/`, `docs/decisiones.md`, `docs/bitacora.md` | Usado |
| Claude Code (subagente sonnet), 2026-11-14 | Código de la web (HTML/CSS/JS) y datos sintéticos de prueba marcados "DATOS DE PRUEBA"; revisado por Diego | `web/` | Usado |
| Claude Code (Sonnet 5.5), 2026-11-14 | Código del pipeline de tendencias y sus pruebas; datos calculados por ese código (`data/salida/indicadores.json`, campo `generado_con`); pendiente de revisión por Luca e Investigación | `analisis/`, `data/salida/` | Usado |
| Codex | Tareas delegadas | — | **No usado** (confirmado por el equipo el 2026-11-14) |
| Tripo3D | Modelo 3D (relieve) | — | **No usado** (confirmado el 2026-11-14) |
| ElevenLabs | Voz/narración del video | — | **No usado** (confirmado el 2026-11-14); la narración es humana |
| Gemini | Imagen/texto | — | **No usado** (confirmado el 2026-11-14) |
| Skills y plugins de terceros | Ver [`docs/skills-terceros.md`](skills-terceros.md) | Herramientas de desarrollo | Ver archivo |

Recordatorio: imágenes y video generados llevan marca de agua visible "AI-generated"; prohibido usar o modificar logos de la NASA; sin menores de 18.
