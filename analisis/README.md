# analisis

**Dueño:** Luca (Prog. A).
**Propósito:** descarga, procesamiento y estadística de tendencias con datos NASA: Mann-Kendall estacional (`pymannkendall.seasonal_test`, no se llama Hirsch-Slack) y pendiente de Sen.

## Pipeline

| Módulo | Qué hace |
|---|---|
| `descargar.py` | NASA POWER mensual para La Paz (24.14 N, -110.31 O), sin credenciales; caché en `data/cache/power/` (no se sube) |
| `tendencias.py` | Matrices mensuales, MK estacional + Sen, cambio total y por década |
| `exportar.py` | Escribe `data/salida/indicadores.json` según `docs/contrato-datos.md` |
| `tests/` | Pruebas con series sintéticas y validación del contrato |

Un solo comando, desde la raíz del repo:

```
pip install -r analisis/requirements.txt
python -m analisis.exportar
python -m pytest analisis
```

## Estado

- Calor y lluvia salen de NASA POWER (MERRA-2, ~50 km; reanálisis, no medición local). El calor es temperatura del aire, no de superficie.
- Vegetación (MODIS MOD13Q1) y agua (GRACE/GLDAS) van como `null` hasta tener acceso a Earthdata.
- Código generado con IA (Claude); se declara en `generado_con` de cada salida.

## Prototipo NASA POWER (referencia de Investigación, no es el pipeline final)

`prototipo_power.py` baja la serie mensual de NASA POWER (T2M y PRECTOTCORR, punto 24.14 N, -110.31 O, 2001 al último año completo), calcula Mann-Kendall estacional + pendiente de Sen y compara con OLS anual. Sin credenciales. Caché en `data/cache/power/` (no se repite la descarga).

```
uv run --python 3.12 --with requests --with pymannkendall --with numpy analisis/prototipo_power.py
```

Salidas en `data/prototipo/` (ver su README). Sirve para contrastar el pipeline de arriba; los valores validados están en `docs/investigacion/hallazgos.md`.
