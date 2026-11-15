# Guía de revisión: cómo reproducir las cifras de Radar BCS

Para revisores (Luca e Investigación). Las cifras salen de `data/salida/indicadores.json` (contrato 0.1) y de `data/salida/zonas_tendencias.json`. Todo se reproduce desde la raíz del repo. Actualizada el 2026-11-15.

## Comandos (existen en el repo)

```
pip install -r analisis/requirements.txt
python -m analisis.exportar --calor-hasta 2021   # escribe indicadores.json (calor = aire) y zonas_tendencias.json (superficie 2001-2021)
python -m analisis.zonas --calor-hasta 2021      # escribe zonas.geojson
python -m analisis.validar                       # contrato de datos + campos *_en
python -m pytest analisis                        # 56 funciones test_
python -m analisis.correlacion                   # Spearman lluvia-agua
python -m analisis.hora_paso                     # hora local de paso de Terra
python -m analisis.contraste_aqua                # Terra contra Aqua
powershell -File scripts/verificar-todo.ps1      # puerta de calidad completa
```

Opcional: `python -m analisis.appeears descargar` baja los CSV de AppEEARS (requiere `.env`; no se leyó).
Prototipo de referencia: `uv run --python 3.12 --with requests --with pymannkendall --with numpy analisis/prototipo_power.py`.

## Tabla por indicador

Cifra = `cambio_total` (JSON). Sin cifra = `null`. Los valores son los del JSON tal cual.

| Indicador (`id`) | Cifra publicada | p-valor (JSON) | Periodo | Método (`significancia.metodo`) | Función en el código |
|---|---|---|---|---|---|
| Calor (`calor`, NASA POWER T2M, aire a 2 m; opción B) | +1.465 °C (por década +0.611) | 2.762e-17 (significativo) | 2001-2025 | MK estacional + Sen | `tendencias.tendencia_estacional` |
| Vegetación (`vegetacion`, NDVI MOD13Q1) | -0.013 (por década -0.005) | 0.003626 (significativo) | 2001-2026 (2026 parcial) | MK estacional + Sen | `tendencias.tendencia_estacional` |
| Lluvia (`lluvia`, NASA POWER PRECTOTCORR) | sin cifra | 0.129 (no significativo) | 2001-2025 | MK sobre total anual + Sen | `tendencias.tendencia_anual` |
| Agua (`agua`, GRACE/GRACE-FO CRI) | +1.362 cm (por década +0.568) | 0.009435 (significativo) | 2002-2026 (2026 parcial) | MK estacional con corrección por autocorrelación + Sen | `tendencias.tendencia_estacional_correlacionada` |

Cadena de cálculo: `python -m analisis.exportar` (`analisis/exportar.py`, función `construir`) llama a `modis.py`, `agua.py` y `tendencias.py`. El campo `cambio_total` solo se llena si el test es significativo (`exportar._indicador`). Un año parcial no entra al promedio anual ni al de la década, pero sí a la prueba mensual.

## Comprobaciones puntuales

1. **Lluvia 2001 (serie anual): JSON 329.89 mm.** Recalculado de forma independiente desde `data/cache/power/power_monthly_24.14_-110.31_2001_2025.json`: suma de PRECTOTCORR (mm/día) × días de cada mes de 2001 = 329.89. Coincide.
2. **Calor 2001: JSON 35.759 °C.** Recalculado con `modis.cargar` + `modis.ciudad` (promedio de las 6 zonas): 35.759. Coincide.
3. **Agua 2003, 2010, 2016, 2019, 2025: JSON -0.601, 0.027, 1.276, 0.948, 0.527 cm.** Recalculados desde el netCDF de GRACE (celda 24.25 N, -110.25 O): coinciden. Faltan 35 de 294 meses (2002-04 a 2026-09; hueco GRACE/GRACE-FO), contados sobre la serie mensual.
4. **Spearman lluvia-agua:** `python -m analisis.correlacion` da rho = 0.52, p = 0.018, n = 20 (prueba en `analisis/tests/test_correlacion.py`). Es correlación, no causa.
5. **Hora de paso de Terra:** `python -m analisis.hora_paso`: ≈10.7-10.9 h hasta 2021 y 9.17 h en 2026.

Pendiente de verificar contra la fuente: los valores de NDVI y de POWER T2M (no se comprobó ningún año contra el portal de origen).

## Contraste con Aqua (issue #87)

`python -m analisis.contraste_aqua` compara Terra (MOD11A2) y Aqua (MYD11A2) en los mismos 6 puntos, 2003-2021: Terra +1.04 °C (p = 0.0005), Aqua +0.27 °C (p = 0.29, no significativo). Aqua también cambia su hora de paso desde 2022 (de ≈13.4 h a 15.2 h en 2026, más tarde). Aqua no confirma el calentamiento de superficie de 2001-2021 y la deriva de Terra no basta como explicación. No se afirma ninguna causa; la decisión sobre la cifra de calor es de Carlos.

## Qué NO se afirma

- **No es causa.** Las tendencias muestran qué cambió, no por qué (regla 2 de `AGENTS.md`).
- **Agua regional, no acuífero.** GRACE mide cientos de km; el dato no describe el acuífero de La Paz ni los pozos (`analisis/texto-ficha-agua.md`).
- **Calor de superficie ≠ aire.** El calor publicado es el aire (NASA POWER T2M, reanálisis ~50 km). MODIS LST mide superficie (suelo y techos) y queda como "no concluyente" (Terra +0.9 °C, Aqua +0.27 °C, p = 0.29): solo en `zonas_tendencias.json` y `contraste_aqua`. Se explica en la `limitacion`; no se explica la diferencia.
- **Lluvia de reanálisis.** NASA POWER (MERRA-2, ~50 km) no es pluviómetro local.

## Discrepancias detectadas (para revisar)

- Agua, décadas: el JSON etiqueta `2022-2026` pero el promedio solo cubre 2022-2025 (así lo explica la `limitacion`).
- `PLAN.md` menciona `correlated_seasonal_test` para calor y vegetación; el código de `exportar.py` no lo usa (solo `tendencia_estacional_correlacionada` en agua).
- Resuelto con la opción B (`docs/decisiones.md`, 2026-11-15): el calor es el del aire y su `limitacion` ya no atribuye la caída a la deriva de Terra; explica el contraste con Aqua.

## No pude verificar

- Ninguna cifra contra la fuente original (portal NASA, PO.DAAC o AppEEARS) en esta revisión.
- La reproducción completa con `exportar` y la comparación contra los portales las hace el revisor humano; las comprobaciones 1 a 3 se hicieron contra la caché local.
- `analisis/appeears.py` (sin pruebas).
