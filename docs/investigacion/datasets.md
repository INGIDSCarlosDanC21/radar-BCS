# Datasets NASA previstos

Fuente: documento del equipo "Radar Paceño" (original del equipo, no publicado en el repositorio), sección "Datos NASA". Según el documento, todos son abiertos y gratuitos y se descargan con NASA Earthdata (AppEEARS) o Google Earth Engine. URLs exactas: PENDIENTE (el documento no las trae).

| Variable | Dataset | Resolución | Límite |
|---|---|---|---|
| Temperatura del suelo | MODIS MOD11A2 (2001–) | 1 km | Cada píxel abarca varias colonias |
| Calor por colonia | ECOSTRESS | 70 m | Fechas irregulares: foto, no tendencia |
| Vegetación (NDVI) | MODIS MOD13Q1 (2000–) | 250 m | — |
| Lluvia y temperatura del aire | NASA POWER | ~50 km | Respaldo inmediato, sin cuenta |
| Agua subterránea | GRACE / GLDAS | 28–300 km | Solo tendencia regional, no por colonia |
| Relieve (video 3D) | NASADEM | 30 m | — |

## Fichas verificadas (2026-11-14)

Datos tomados de las páginas oficiales de cada producto (las URL están en `docs/entrega/06-nasa-data.md`). Lo que no se pudo confirmar va como **POR CONFIRMAR**; no se rellena de memoria.

| Producto | Unidad y escala | Valor de relleno | DOI | Cobertura |
|---|---|---|---|---|
| MODIS MOD11A2 v061 (temperatura de superficie, 8 días, 1 km) | Kelvin, factor 0.02 (°C = K × 0.02 − 273.15) | 0 (rango válido 7500–65535) | 10.5067/MODIS/MOD11A2.061 | 2000-02-18 a la fecha |
| MODIS MOD13Q1 v061 (NDVI, 16 días, 250 m) | Adimensional, factor 0.0001 | −3000 | 10.5067/MODIS/MOD13Q1.061 | 2000 a la fecha |
| NASADEM (relieve, 30 m) | Metros | — | 10.5067/MEASURES/NASADEM/NASADEM_HGT.001 | Global |
| ECOSTRESS ECO_L2T_LSTE v002 (temperatura de superficie, 70 m) | Kelvin | — | POR CONFIRMAR | Desde 2018-07-09 (fechas irregulares: foto, no tendencia) |
| NASA POWER mensual | Reanálisis MERRA-2, malla de ½° × ⅝° (~50 km) | POR CONFIRMAR | — | POR CONFIRMAR (el prototipo usó 2001-2025) |
| GLDAS y GRACE-FO | Variables y DOI POR CONFIRMAR | POR CONFIRMAR | POR CONFIRMAR | POR CONFIRMAR |

Consecuencias para el análisis (ver `metodo.md`): los valores de relleno **no son datos** y deben pasar a vacío (`null`) antes de promediar; MOD11A2 y MOD13Q1 necesitan filtro de calidad antes de usarse; ECOSTRESS no sirve para tendencias.
