# Registro de recursos

Todo recurso externo (código, texto, imágenes, datos, audio, modelos 3D) se anota aquí con URL y licencia. La entrega lo exige. Lo pendiente se deja vacío, no se inventa.

## Datos NASA

| Dataset | URL | Uso |
|---|---|---|
| NASA POWER, datos mensuales (MERRA-2), comunidad AG, API v2.10.0 | <https://power.larc.nasa.gov/docs/services/api/temporal/monthly/> | **Usado** (prototipo, issue #5): temperatura del aire a 2 m y lluvia, La Paz, 2001-2025 |
| MODIS MOD11A2 V061 (temperatura de superficie, 1 km) | <https://lpdaac.usgs.gov/products/mod11a2v061/> | Previsto; sin usar todavía |
| MODIS MOD13Q1 V061 (NDVI, 250 m) | <https://lpdaac.usgs.gov/products/mod13q1v061/> | Previsto; sin usar todavía |
| GRACE-FO / GLDAS (agua subterránea, regional) | <https://gracefo.jpl.nasa.gov/> y <https://ldas.gsfc.nasa.gov/gldas> | Previsto; sin usar todavía |
| ECOSTRESS (70 m) | <https://ecostress.jpl.nasa.gov/> | Previsto; sin usar todavía |
| NASADEM (relieve, 30 m) | <https://lpdaac.usgs.gov/products/nasadem_hgtv001/> | Previsto; sin usar todavía |
| NASA Earthdata AppEEARS (herramienta de descarga) | <https://appeears.earthdatacloud.nasa.gov/> | Previsto; sin usar todavía |

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
| `pymannkendall` 1.4.3 (Hussain y Mahmud, 2019, DOI 10.21105/joss.01556) | <https://github.com/mmhs013/pyMannKendall> | MIT (PyPI, 2026-11-14) | `analisis/prototipo_power.py`: pruebas Mann-Kendall estacionales y pendiente de Sen |
| NumPy | <https://numpy.org/> | BSD-3-Clause (PyPI, 2026-11-14) | `analisis/prototipo_power.py` |
| Requests | <https://requests.readthedocs.io/> | Apache-2.0 (PyPI, 2026-11-14) | `analisis/prototipo_power.py`: descarga de NASA POWER |

## Uso de IA

| Herramienta | Para qué | Dónde | Estado |
|---|---|---|---|
| Claude Code | Configuración del repositorio, documentación y código | Todo el repositorio | Usado |
| Claude Code (subagentes haiku y sonnet), 2026-11-14 | Búsqueda de fuentes del contexto local y de referencias del método; redacción del borrador de entrega en inglés; revisado por el Líder | `docs/investigacion/contexto-local.md`, `docs/investigacion/metodo.md`, `docs/entrega/`, `docs/decisiones.md`, `docs/bitacora.md` | Usado |
| Codex | Tareas delegadas | — | **No usado** (confirmado por el equipo el 2026-11-14) |
| Tripo3D | Modelo 3D (relieve) | — | **No usado** (confirmado el 2026-11-14) |
| ElevenLabs | Voz/narración del video | — | **No usado** (confirmado el 2026-11-14); la narración es humana |
| Gemini | Imagen/texto | — | **No usado** (confirmado el 2026-11-14) |
| Skills y plugins de terceros | Ver [`docs/skills-terceros.md`](skills-terceros.md) | Herramientas de desarrollo | Ver archivo |

Recordatorio: imágenes y video generados llevan marca de agua visible "AI-generated"; prohibido usar o modificar logos de la NASA; sin menores de 18.
