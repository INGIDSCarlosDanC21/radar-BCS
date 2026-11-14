# Registro de recursos

Todo recurso externo (código, texto, imágenes, datos, audio, modelos 3D) se anota aquí con URL y licencia. La entrega lo exige. Lo pendiente se deja vacío, no se inventa.

## Datos NASA

| Dataset | URL | Uso |
|---|---|---|
| | | |

## Otros datos y recursos

| Nombre | URL | Licencia | Dónde se usa |
|---|---|---|---|
| Forest Trends (2024), *Resultados del taller: Liderazgo e innovación financiera para la resiliencia hídrica de La Paz* | <https://forest-trends.org/wp-content/uploads/2025/01/Reporte-Taller-Liderazgo-Resiliencia-Hidrica-La-Paz-2024.11.11.pdf> | Derechos del autor; solo se cita | `docs/investigacion/contexto-local.md` (cifras de agua) |
| FMCN, estudio de vulnerabilidad de La Paz | <https://desarrollo.fmcn.org/wp-content/uploads/2025/07/Estudio_Vulnerabilidad_LaPaz.pdf> | Derechos del autor; solo se cita | `docs/investigacion/contexto-local.md` (29,825 habitantes) |
| El Congresista, 27 oct 2026, nota sobre enfermedades por calor en BCS | <https://elcongresista.mx/politica/baja-california-sur/aumento-enfermedades-calor-bcs> | Derechos del medio; solo se cita | `docs/investigacion/contexto-local.md` |
| Zeta, 27 oct 2026, nota sobre enfermedades y muertes por calor en BCS | <https://zetatijuana.com/2026/10/incrementan-enfermedades-y-muertes-por-calor-en-bcs/> | Derechos del medio; solo se cita | `docs/investigacion/contexto-local.md` |
| Zeta, 30 may 2023, nota sobre fugas en La Paz | <https://zetatijuana.com/2023/05/veto-de-conagua-a-la-paz-por-desvio-de-recursos/> | Derechos del medio; solo se cita | `docs/investigacion/contexto-local.md` |
| NASA Space Apps, *2026 Judging & Awards Guide* | <https://www.spaceappschallenge.org/resources/judging-awards-guide/> | Sitio oficial; solo se cita | `docs/decisiones.md` (rúbrica) |
| `pymannkendall` (previsto, aún no usado) | <https://github.com/mmhs013/pyMannKendall> | MIT (según su README) | `docs/investigacion/metodo.md` |
| Leaflet 1.9.4 | <https://leafletjs.com/> (cargado desde <https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/>) | BSD-2-Clause | `web/` (mapa) |
| Teselas de OpenStreetMap | <https://www.openstreetmap.org/copyright> | ODbL; atribución "© OpenStreetMap contributors" en el mapa | `web/` (mapa base) |
| CDC, *Heat and Health* | <https://www.cdc.gov/heat-health/> | Sitio oficial; solo se cita | `web/` (pantalla Acciones) |
| EPA, *WaterSense* | <https://www.epa.gov/watersense> | Sitio oficial; solo se cita | `web/` (pantalla Acciones) |

## Uso de IA

| Herramienta | Para qué | Dónde | Estado |
|---|---|---|---|
| Claude Code | Configuración del repositorio, documentación y código | Todo el repositorio | Usado |
| Claude Code (subagentes haiku y sonnet), 2026-11-14 | Búsqueda de fuentes del contexto local y de referencias del método; redacción del borrador de entrega en inglés; revisado por el Líder | `docs/investigacion/contexto-local.md`, `docs/investigacion/metodo.md`, `docs/entrega/`, `docs/decisiones.md`, `docs/bitacora.md` | Usado |
| Claude Code (subagente sonnet), 2026-11-14 | Código de la web (HTML/CSS/JS) y datos sintéticos de prueba marcados "DATOS DE PRUEBA"; revisado por Diego | `web/` | Usado |
| Codex | Por definir (tareas delegadas) | Por definir | Previsto |
| Tripo3D | Modelo 3D (relieve) | Por definir | Previsto |
| ElevenLabs | Voz/narración del video | Por definir | Previsto |
| Gemini | Imagen/texto | Por definir | Previsto |
| Skills y plugins de terceros | Ver [`docs/skills-terceros.md`](skills-terceros.md) | Herramientas de desarrollo | Ver archivo |

Recordatorio: imágenes y video generados llevan marca de agua visible "AI-generated"; prohibido usar o modificar logos de la NASA; sin menores de 18.
