# Guía de revisión: cómo reproducir las cifras de Radar BCS

Para revisores (Luca e Investigación). Las cifras salen de `data/salida/indicadores.json` (contrato 0.1) y de `data/salida/zonas_tendencias.json`. Todo se reproduce desde la raíz del repo.

## Comandos (existen en el repo)

```
pip install -r analisis/requirements.txt
python -m analisis.exportar     # escribe indicadores.json y zonas_tendencias.json
python -m analisis.zonas        # escribe zonas.geojson
python -m pytest analisis       # 23 funciones test_ (agua 5, modis 3, pipeline 11, zonas_appeears 4)
```

Opcional: `python -m analisis.appeears descargar` baja los CSV de AppEEARS (requiere `.env`; no se leyó).
Prototipo de referencia: `uv run --python 3.12 --with requests --with pymannkendall --with numpy analisis/prototipo_power.py`.

## Tabla por indicador

Cifra = `cambio_total` (JSON). Sin cifra = `null`. Los valores son los del JSON tal cual.

| Indicador (`id`) | Cifra publicada | p-valor (JSON) | Periodo | Método (`significancia.metodo`) | Campo JSON | Función en el código |
|---|---|---|---|---|---|---|
| Calor (`calor`, MODIS LST, 6 zonas) | sin cifra | 0.1101 (no significativo) | 2001-2025 | MK estacional + Sen | `indicadores[calor].cambio_total` = null; `significancia.p_valor` | `tendencias.tendencia_estacional` |
| Vegetación (`vegetacion`, NDVI MOD13Q1) | -0.019 (NDVI) | 1.288e-05 (significativo) | 2001-2025 | MK estacional + Sen | `indicadores[vegetacion].cambio_total`; `tendencia_por_decada` = -0.008 | `tendencias.tendencia_estacional` |
| Lluvia (`lluvia`, NASA POWER PRECTOTCORR) | sin cifra | 0.129 (no significativo) | 2001-2025 | MK sobre total anual + Sen | `indicadores[lluvia].cambio_total` = null | `tendencias.tendencia_anual` |
| Agua (`agua`, GRACE/GRACE-FO CRI) | +1.362 cm | 0.009435 (significativo) | 2002-2026 | MK estacional con corrección por autocorrelación + Sen | `indicadores[agua].cambio_total`; `tendencia_por_decada` = 0.568 | `tendencias.tendencia_estacional_correlacionada` |

Cadena de cálculo: `python -m analisis.exportar` (`analisis/exportar.py`, función `construir`) llama a `modis.py`, `agua.py` y `tendencias.py`. El campo `cambio_total` solo se llena si el test es significativo (`exportar._indicador`).

Nota de lectura: `agua.periodo` va de 2002 a 2026, pero 2026 es parcial. Se usa en la prueba mensual, no en el promedio anual.

## Comprobaciones puntuales

1. **Lluvia 2001 (serie anual): JSON 329.89 mm.** Recalculado de forma independiente desde `data/cache/power/power_monthly_24.14_-110.31_2001_2025.json`: suma de PRECTOTCORR (mm/día) × días de cada mes de 2001 = 329.89. Coincide.
2. **Calor 2001: JSON 35.759 °C.** Recalculado con `modis.cargar` + `modis.ciudad` (promedio de las 6 zonas): 35.759. Coincide.
3. **Agua 2003, 2010, 2016, 2019, 2025: JSON -0.601, 0.027, 1.276, 0.948, 0.527 cm.** Recalculados desde el netCDF de GRACE (celda 24.25 N, -110.25 O): coinciden. Faltan 35 de 294 meses (2002-04 a 2026-09; hueco GRACE/GRACE-FO), contados sobre la serie mensual.

Pendiente de verificar contra la fuente: los valores de NDVI y de POWER T2M (no se comprobó ningún año contra el portal de origen).

## Qué NO se afirma

- **No es causa.** Las tendencias muestran qué cambió, no por qué (regla 2 de `AGENTS.md`).
- **Agua regional, no acuífero.** GRACE mide cientos de km; el dato no describe el acuífero de La Paz ni los pozos (`analisis/texto-ficha-agua.md`).
- **Calor de superficie ≠ aire.** MODIS LST mide superficie (suelo y techos); NASA POWER T2M mide aire (reanálisis ~50 km). El aire sube +1.47 °C en 2001-2025 según la `limitacion` del JSON, pero la superficie no tiene cifra. No se explica la diferencia.
- **Lluvia de reanálisis.** NASA POWER (MERRA-2, ~50 km) no es pluviómetro local.

## Discrepancias detectadas (para revisar)

- Agua, décadas: el JSON etiqueta `2022-2026` pero el promedio solo cubre 2022-2025 (así lo explica la `limitacion`).
- `texto-ficha-agua.md` cita Spearman 0.52 (p = 0.018, 20 años) entre lluvia y agua: POR VERIFICAR, no hay código de ese cálculo en `analisis/`.
- `PLAN.md` menciona `correlated_seasonal_test` para calor y vegetación; el código de `exportar.py` no lo usa (solo `tendencia_estacional_correlacionada` en agua).

## No pude verificar

- Ninguna cifra contra la fuente original (portal NASA, PO.DAAC o AppEEARS) en esta revisión.
- La reproducción completa con `exportar` y la comparación contra los portales las hace el revisor humano; las comprobaciones 1 a 3 se hicieron contra la caché local.
- `analisis/appeears.py` (sin pruebas, según `PLAN.md`).
