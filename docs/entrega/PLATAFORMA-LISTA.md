# Paquete listo para la plataforma (solo para pegar; no se ha guardado ni enviado nada)

Preparado el 2026-11-15 por el asistente del Líder. **Todo el contenido de la plataforma va en inglés.** El texto largo de cada campo vive en su borrador (`01` a `07`); aquí está qué pegar, con los conteos y las filas de enlaces ya armadas. Las reglas oficiales están en [`CHECKLIST-ENVIO.md`](CHECKLIST-ENVIO.md) y en la [Guía de envío](https://www.spaceappschallenge.org/resources/project-submission-guide/) (13 nov 2026).

**Plazo:** cierra el **domingo 15 de noviembre a las 23:59** (hora de La Paz). Meta interna: 13:00. Solo cuenta el último "Submit for Judging". Quien tenga la sesión del equipo hace estos pasos; **un asistente no debe guardar ni enviar**.

## Antes de empezar

1. Entrar como dueño del equipo: icono de perfil → **My Team** → pestaña **Project** → **Edit**.
2. Poner el **Lock en ON** y avisar al equipo.
3. "Save Progress" solo guarda, pero deja visible el borrador a quien abra la página del equipo: **no guardar nada a medias, en español, con TODO ni con nombres de menores.**
4. Comprobar que **todos los integrantes** están en la pestaña *Members* y fuera de la lista de espera (no se puede arreglar después del cierre).

## Los campos, en orden

| # | Campo de la plataforma | Qué pegar | Conteo / nota |
|---|---|---|---|
| 1 | **Project Name** | `Radar BCS` (reemplaza el "Project OptiPaz" que trae) | |
| 2 | **High-Level Project Summary** | Texto de [`01`](01-high-level-summary.md) (el párrafo bajo "Summary") | **198 palabras, 1203 caracteres** (límite 50-200 palabras; la plataforma topa en 1500 caracteres) |
| 3 | **Link to Project Demo** | **UN solo** enlace público al video de 30 s (o a las diapositivas, máx. 7). Ver [`02`](02-demo-link.md), el guion [`08b`](08b-video-shotlist.md) y el brief [`08c`](08c-brief-video.md). Voz sintética de ElevenLabs, declarada en el video | **Pendiente: falta grabar el video.** Probar el enlace en una ventana sin sesión. Sin menores (nombre, voz ni imagen); subtítulos en inglés quemados |
| 4 | **Link to Final Project** | `https://ingidscarlosdanc21.github.io/radar-BCS/?lang=en` (abre directo en inglés) y, si cabe, el repositorio `https://github.com/INGIDSCarlosDanC21/radar-BCS` | Probado sin sesión el 2026-11-15; volver a abrirlo justo antes de enviar |
| 5 | **Detailed Project Description** | Texto de [`04`](04-project-details.md), **sin** los comentarios `<!-- -->` ni el TODO de la última viñeta (hardware: quitar la frase "TODO..." o la del celular real si #71 aún no se hizo) | Editor de texto enriquecido: pegar como texto sin formato |
| 6 | **Use of Super Intelligence (SI)** | Lista desplegable ("select all that apply"): marcar **todo lo usado** (modelo de lenguaje / asistente de código: Claude Code; generación de imágenes: Gemini; voz sintética: ElevenLabs (solo si se usó de verdad en el video); Google Stitch, o "Other" y escribir "Google Stitch" si no está). Texto de [`05`](05-use-of-ai.md) | **No lo ven los jueces**; sí ven la marca de agua del logo, el pie y los metadatos. No omitir nada (regla 10 de `AGENTS.md`) |
| 7 | **NASA Data** | Filas de la tabla de abajo (A) | "Link Text" + "Link Url", una fila por recurso, con `https://` completo |
| 8 | **Space Agency Partner Data and Other References** | Filas de la tabla de abajo (B). **Partner Data: ninguno** | Una fila por recurso |
| 9 | Casillas finales | **Agree to Terms and Conditions** y **Confirm All Work is Original** | Obligatorias; las marca quien envía |

## (A) NASA Data: filas para "Add New Link"

| Link Text | Link Url |
|---|---|
| NASA POWER (monthly air temperature and rainfall) | https://power.larc.nasa.gov/ |
| MODIS MOD11A2 v061 (land surface temperature, Terra) | https://lpdaac.usgs.gov/products/mod11a2v061/ |
| MODIS MYD11A2 v061 (land surface temperature, Aqua) | https://lpdaac.usgs.gov/products/myd11a2v061/ |
| MODIS MOD13Q1 v061 (NDVI vegetation index) | https://lpdaac.usgs.gov/products/mod13q1v061/ |
| GRACE and GRACE-FO JPL Mascon (total water storage anomaly) | https://doi.org/10.5067/TEMSC-3JC634 |
| NASA Earthdata AppEEARS (extraction of the MODIS series) | https://appeears.earthdatacloud.nasa.gov/ |
| NASA GIBS imagery: MODIS Terra photos, GOES-West clouds, IMERG rain estimates, VIIRS chlorophyll | https://gibs.earthdata.nasa.gov/ |

## (B) Other references: filas para "Add New Link"

| Link Text | Link Url |
|---|---|
| Radar BCS source code (our own work, Apache-2.0) | https://github.com/INGIDSCarlosDanC21/radar-BCS |
| Open-Meteo weather and marine models (CC BY 4.0) | https://open-meteo.com/ |
| Open-Meteo Marine API | https://open-meteo.com/en/docs/marine-weather-api |
| Leaflet 1.9.4 (map library, BSD-2-Clause) | https://leafletjs.com/ |
| OpenStreetMap tiles (ODbL) | https://www.openstreetmap.org/copyright |
| Nominatim place search (OpenStreetMap, ODbL) | https://nominatim.org/release-docs/latest/api/Search/ |
| U.S. Naval Observatory moon phases API | https://aa.usno.navy.mil/data/api |
| NOAA CoastWatch ERDDAP (chlorophyll and sea surface temperature) | https://coastwatch.pfeg.noaa.gov/erddap/ |
| Google Material Symbols (icons, Apache-2.0) | https://fonts.google.com/icons |
| Google Fonts: Space Grotesk, Manrope, JetBrains Mono (OFL 1.1) | https://github.com/google/fonts/tree/main/ofl/ |
| pyMannKendall (MIT) | https://github.com/mmhs013/pyMannKendall |
| NumPy (BSD-3-Clause) | https://numpy.org/ |
| SciPy (BSD-3-Clause) | https://scipy.org/ |
| Requests (Apache-2.0) | https://requests.readthedocs.io/ |
| netCDF4 for Python (MIT) | https://unidata.github.io/netcdf4-python/ |
| pytest (MIT, tests only) | https://docs.pytest.org/ |
| CDC: Five Steps to help your patients stay safe on hot days | https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf |
| EPA WaterSense: Start Saving | https://www.epa.gov/watersense/start-saving |
| WHO: Radiation, the ultraviolet (UV) index | https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index |
| ISRIC SoilGrids v2.0 (CC BY 4.0) | https://www.isric.org/explore/soilgrids |
| GeoNames (CC BY 4.0) | https://www.geonames.org/ |
| SIAP: agricultural production closing 2025, La Paz | https://nube.agricultura.gob.mx/index.php?view=10AE434F-A2158368-A120BC5A-EDF4AFAA&ANIO=2025 |
| CONAGUA aquifer availability, DOF 09/11/2023 | https://dof.gob.mx/nota_detalle.php?codigo=5708074&fecha=09/11/2023 |
| CONAGUA aquifer availability, DOF 17/08/2023 | https://dof.gob.mx/nota_detalle.php?codigo=5698953&fecha=17/08/2023 |
| SMN-CONAGUA Drought Monitor (municipal table) | https://smn.conagua.gob.mx/tools/RESOURCES/Monitor%20de%20Sequia%20en%20Mexico/MunicipiosSequia.xlsx |
| DOF 05/10/2018: fruit-fly-free zones | https://dof.gob.mx/nota_detalle.php?codigo=5540162&fecha=05%2F10%2F2018 |
| SEPADA BCS: emergency plan against the fruit fly | https://sepada.bcs.gob.mx/avalan-senasica-y-usda-plan-emergente-contra-la-mosca-de-la-fruta/ |
| BCS Health Ministry: State Risk Profile 2025 | https://ssbcs.gob.mx/pdf/2025/vigilancia/Perfil_Estatal_de_Riesgos_BCS_2025.pdf |
| Douglas sea scale (cited) | https://en.wikipedia.org/wiki/Douglas_sea_scale |
| Beaufort scale (cited) | https://en.wikipedia.org/wiki/Beaufort_scale |
| Generated logo: Google Terms of Service (Gemini) | https://policies.google.com/terms |

Los textos largos de licencia y "dónde se usa" de cada fila están en [`06`](06-nasa-data.md) y [`07`](07-other-resources.md); si la plataforma deja una descripción por fila, copiarlos de ahí.

## Revisión final antes de pulsar "Submit for Judging"

- [ ] Todo en **inglés** (nombre, resumen, detalles, filas de enlaces).
- [ ] **Sin nombre, voz ni imagen de menores** en el texto, el video, las capturas y la lista de integrantes del campo de detalles.
- [ ] Enlace de la **demo** y del **proyecto** abiertos en una ventana **sin sesión**, sin contraseña ni registro.
- [ ] Video de **30 s o menos** con subtítulos en inglés (o diapositivas, máx. 7 contando la portada).
- [ ] Resumen entre 50 y 200 palabras y menos de 1500 caracteres (hoy: 198 y 1203).
- [ ] Ninguna fila dice "TODO" ni queda un campo en español.
- [ ] Todos los integrantes en *Members*, en La Paz y fuera de la lista de espera.
- [ ] Pulsar **Submit for Judging** antes del domingo 15 de noviembre a las 23:59 (meta: 13:00). Debe aparecer un **banner de confirmación** y el panel debe decir "Project Submitted for Judging": guardar una **captura de pantalla** en esta carpeta.
- [ ] Si se corrige algo después, **reenviar** (solo cuenta el último envío).
