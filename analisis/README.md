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
```

## Estado

- Calor sale de MODIS MOD11A2 (temperatura de la superficie de día, 6 zonas); el aire de NASA POWER (+1.47 °C) va en la limitación porque no coinciden. Lluvia sale de NASA POWER (MERRA-2, ~50 km; reanálisis, no medición local).
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
