# analisis

**Dueño:** Luca (Prog. A).
**Propósito:** descarga, procesamiento y estadística de tendencias con datos NASA: Mann-Kendall estacional (`pymannkendall.seasonal_test`, no se llama Hirsch-Slack) y pendiente de Sen.

## Pipeline

| Módulo | Qué hace |
|---|---|
| `descargar.py` | NASA POWER mensual para La Paz (24.14 N, -110.31 O), sin credenciales; caché en `data/cache/power/` (no se sube) |
| `tendencias.py` | Matrices mensuales, MK estacional + Sen, cambio total y por década |
| `exportar.py` | Escribe `data/salida/indicadores.json` según `docs/contrato-datos.md` |
| `modis.py` | CSV de AppEEARS (6 zonas) -> matrices mensuales con filtro de calidad |
| `appeears.py` | Cliente de AppEEARS (credenciales en `.env`) |
| `agua.py` | GRACE/GRACE-FO (JPL Mascon CRI) de PO.DAAC: baja el netCDF con tus credenciales de `.env` y extrae la celda de La Paz |
| `zonas.py` | `data/salida/zonas.geojson`: cada zona es el píxel MODIS de 1 km donde se midió |
| `publicar.py` | Copia la salida a `web/data/` (úsalo en un PR aparte, avisando a Prog. B) |
| `tests/` | Pruebas con series sintéticas y validación del contrato |

Un solo comando, desde la raíz del repo:

```
pip install -r analisis/requirements.txt
python -m analisis.exportar
python -m analisis.zonas
python -m pytest analisis
python -m analisis.validar   # valida data/salida/ contra el contrato
```

## Estado

- Calor (opción B, `docs/decisiones.md`) sale de NASA POWER T2M, temperatura del aire a 2 m (+1.47 °C, 2001-2025). La superficie MODIS MOD11A2 es "no concluyente" (Terra +0.9 °C 2001-2021; Aqua +0.27 °C, p = 0.29, 2003-2021; `python -m analisis.contraste_aqua`, `python -m analisis.hora_paso`) y solo alimenta el calor por zona (`zonas.py`, `--calor-hasta 2021`). Lluvia sale de NASA POWER (MERRA-2, ~50 km; reanálisis, no medición local).
- Vegetación sale de MODIS MOD13Q1 (NDVI, 6 zonas). Agua sale de GRACE/GRACE-FO (tendencia regional, desde 2002; ver `PLAN.md`).
- Código generado con IA (Claude); se declara en `generado_con` de cada salida.

## Prototipo NASA POWER (referencia de Investigación, no es el pipeline final)

`prototipo_power.py` baja la serie mensual de NASA POWER (T2M y PRECTOTCORR, punto 24.14 N, -110.31 O, 2001 al último año completo), calcula Mann-Kendall estacional + pendiente de Sen y compara con OLS anual. Sin credenciales. Caché en `data/cache/power/` (no se repite la descarga).

```
uv run --python 3.12 --with requests --with pymannkendall --with numpy analisis/prototipo_power.py
```

Salidas en `data/prototipo/` (ver su README). Sirve para contrastar el pipeline de arriba; los valores validados están en `docs/investigacion/hallazgos.md`.

## Reproducir las cifras de MODIS

Los CSV de AppEEARS (6 zonas) no van al repo: están en Drive, `datasets/appeears-6-zonas/` (`docs/DRIVE.md`). Cópialos a `data/cache/appeears/usuario/` y corre `python -m analisis.exportar`.

## Reproducir el contraste con Aqua

Compara Terra (MOD11A2) con Aqua (MYD11A2) en los mismos 6 puntos de La Paz (issue #87). Es lo que sostiene que la superficie MODIS sea "no concluyente" en la opción B (`docs/decisiones.md`).

**Entradas** (no van al repo; la caché `data/cache/` la ignora git):
- Terra: los CSV de MOD11A2 de AppEEARS que ya usa `exportar` (`data/cache/appeears/usuario/`, ver arriba).
- Aqua: `data/cache/appeears/MYD11A2.061-aqua-zonas/radar-bcs-MYD11A2-061-aqua-zonas-MYD11A2-061-results.csv` (1.7 MB). Se descargó con AppEEARS (`python -m analisis.appeears enviaraqua`, luego `descargar`; credenciales Earthdata solo en `.env`): producto MYD11A2.061, capas LST_Day_1km, QC_Day y Day_view_time, los mismos 6 puntos que los CSV de Terra, del 04-07-2002 al 31-12-2026. Cópialo a esa ruta si lo recibes de Drive (`datasets/appeears-6-zonas/`).

**Comando** (desde la raíz del repo; no escribe archivos ni usa red):

```
python -m analisis.contraste_aqua
```

**Salida esperada** (tendencia estacional de Sen sobre el promedio de las 6 zonas):

| Periodo | Satélite | Cambio | p |
|---|---|---|---|
| 2003-2021 | Terra | +1.04 °C | 0.0005 |
| 2003-2021 | Aqua | +0.27 °C | 0.29 (no significativo) |

Imprime además la hora local media de paso de Aqua por año (≈13.3-13.4 h hasta 2021, más tarde desde 2022) y la media anual de ambos satélites. Esas dos líneas son las que cita la `limitacion` del calor.

**Prueba sin red:** `python -m pytest analisis/tests/test_contraste_aqua.py` usa un CSV sintético y no descarga nada.
