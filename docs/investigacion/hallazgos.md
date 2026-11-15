# Hallazgos

Estado: **al día con las salidas de `dev` el 2026-11-15** (PR #84 y #90). Las secciones de aire y lluvia salen del prototipo del PR #20 (`analisis/prototipo_power.py`), que el Líder reprodujo con los mismos números y contrastó con otras pruebas (ver `docs/investigacion/metodo.md`); la lluvia ahora se prueba sobre el total anual (p = 0.129) y la web usa esa cifra. La sección de MODIS y agua muestra las cifras vigentes del pipeline; las frases para la web están revisadas contra causalidad. Fuente de verdad de los números: `data/salida/`.

Fuente de todo lo de esta página: NASA POWER, datos mensuales (MERRA-2), comunidad AG, API v2.10.0, consulta del 2026-11-14, <https://power.larc.nasa.gov/api/temporal/monthly/point>.

---

## Temperatura del aire (T2M), La Paz

- **Variable y zona:** temperatura del aire a 2 m; un punto (24.14 N, -110.31 O) que representa una celda de unos 50 km alrededor de La Paz. No distingue colonias.
- **Dataset y periodo:** NASA POWER mensual, 2001 a 2025 (300 meses, ninguno faltante).
- **Cambio:** +0.061 °C por año. Por década, unos +0.6 °C. Total estimado 2001-2025: unos +1.5 °C (estimación lineal: 0.061 × 24 intervalos anuales; no es una medición).
- **Pendiente de Sen y p:** Sen = 0.061 °C/año; p < 0.001 (el prototipo guarda 0.0; mostrar "p < 0.001"). **Significativo** con α = 0.05.
- **Contraste:** con correlación entre estaciones p = 5.1e-5; sobre el promedio anual p = 7.9e-5 y Sen = 0.060; regresión lineal 0.0615. Todo coincide.
- **Límites:** reanálisis, no estación; un solo punto; es temperatura del aire, no de la superficie.
- **Frase para la web:** "La temperatura del aire en La Paz subió en promedio unos 0.06 °C por año entre 2001 y 2025, cerca de 1.5 °C en total (estimación). Es un cambio estadísticamente significativo (p < 0.001). Esto describe qué cambió, no por qué. Fuente: NASA POWER."

## Lluvia (PRECTOTCORR), La Paz

- **Variable y zona:** precipitación corregida, mm por día; el mismo punto y celda de ~50 km.
- **Dataset y periodo:** NASA POWER mensual, 2001 a 2025 (300 meses, ninguno faltante).
- **Cambio:** **no se detecta un cambio claro.** El promedio es de unos 0.76 mm/día (reanálisis, no pluviómetro) y varía mucho de un año a otro (de 0.28 a 1.37 mm/día en el promedio anual).
- **Pendiente de Sen y p:** **no mostrar pendiente ni cambio total** (ver advertencia). p = 0.18 con el método estacional; 0.29 con correlación entre estaciones; 0.12 con el promedio anual; 0.11 solo con jun-oct. **Ninguna variante es significativa** con α = 0.05.
- **Advertencia:** la pendiente de Sen estacional sale exactamente 0.0 porque 87 de los 300 meses valen 0 y la lluvia se concentra en agosto-octubre. No significa "sin cambio"; es un efecto de los ceros. El contraste lineal (+0.015 mm/día por año) tampoco es significativo, así que tampoco se muestra.
- **Límites:** reanálisis de ~50 km; con 25 años y esta variación, un cambio pequeño no se detectaría; no capta eventos extremos.
- **Frase para la web:** "La lluvia en La Paz cambia mucho de un año a otro. Entre 2001 y 2025 no se detecta un cambio claro (no es estadísticamente significativo). Esto describe qué cambió, no por qué. Fuente: NASA POWER."

## MODIS por zona: revisión de Investigación (2026-11-14)

Origen: `data/salida/indicadores.json` y `zonas_tendencias.json` (Luca, PR #50, #84 y #90), 6 puntos de La Paz (Centro, Chametla, El Centenario, Oriente, Sur, Surponiente). **Calor 2001-2021** y **vegetación 2001-2026 (2026 parcial)**, Mann-Kendall estacional + Sen. Investigación reprodujo las salidas con los CSV de Drive el 2026-11-14 (ver "Reproducción" abajo; esa revisión se hizo con calor 2001-2025).

### Resultados (como salen del pipeline)

| Indicador | Cambio (periodo en la fila) | p | Significativo | Meses sin dato |
|---|---|---|---|---|
| Calor, aire (POWER T2M, 2001-2025) | +1.465 °C | < 0.001 | Sí | 0 |
| Calor, superficie de día (MODIS LST, promedio de 6 puntos, 2001-2021) | +0.935 °C | 0.0003 | Sí | 0 |
| Vegetación (MODIS NDVI, promedio de 6 puntos, 2001-2026) | -0.013 | 0.0036 | Sí | varía (ver abajo) |
| Lluvia (POWER, total anual, 2001-2025) | sin cifra | 0.129 | No | 0 |
| Agua (GRACE JPL Mascon CRI RL06.3Mv04, regional, 2002-2026) | +1.362 cm | 0.0094 | Sí (prueba estacional con corrección por autocorrelación) | no aplica |

Por punto: el NDVI baja de forma significativa en Centro (-0.030), Chametla (-0.033), El Centenario (-0.046) y Surponiente (-0.042), y **sube un poco** en Oriente (+0.008) y Sur (+0.024); los seis son significativos. La temperatura de superficie (2001-2021) **sube de forma significativa** en Centro (+1.09 °C), Chametla (+1.50), Oriente (+1.10) y Surponiente (+0.90), y no cambia de forma clara en El Centenario (+0.38, p = 0.21) y Sur (+0.42, p = 0.16). El agua (GRACE) es una tendencia regional, no del acuífero de La Paz ni por zona.

### Lo que hay que decir con honestidad

1. **Aire y superficie son mediciones distintas y cubren periodos distintos.** El aire (POWER, 2001-2025) sube +1.47 °C; la superficie vista por el satélite (MODIS, 2001-2021) sube +0.94 °C. El aire a 2 m es un reanálisis de ~50 km; la superficie es una lectura de día de 1 km en un instante. La web muestra las dos y dice que son periodos distintos.
2. **La serie de superficie se corta en 2021 a propósito.** Con 2022-2026 la superficie baja de forma pareja en las seis zonas (-1.06 °C con 2026), y eso apunta al sensor: según `Day_view_time` de MOD11A2 (PR #90, Luca), la hora local media de paso de Terra baja de ≈10.8 h a ≈9.2 h en 2026, así que la superficie se mide antes de calentarse. Es la explicación más probable, **no probada**; el contraste con Aqua (MYD11A2) sigue pendiente (#87). No se interpreta como enfriamiento. Carlos confirmó el corte el 2026-11-14 mientras no haya datos más recientes y confiables.
3. **El NDVI urbano pierde muchos meses al filtrar** (175 meses sin dato en Centro, 34 en Surponiente, 25 en El Centenario). Al promediar los 6 puntos, la composición cambia con los meses sin dato y eso puede sesgar la tendencia. Que sea significativo no quiere decir que sea preciso. 2026 es un año parcial y no entra al promedio anual.
4. **Son 6 puntos, no zonas.** Las celdas del mapa siguen siendo sintéticas. Nada de esto responde "¿dónde?" para toda la ciudad.
5. **Causa:** nada de esto dice por qué cambió la vegetación o el calor.

### Reproducción con los CSV de AppEEARS (2026-11-14, Investigación)

> **Registro histórico, con calor 2001-2025.** Las cifras de abajo (por ejemplo -1.30 °C en El Centenario y Sur) ya no son las vigentes: con la serie cortada en 2021 esos dos puntos dejan de ser significativos (+0.38 y +0.42 °C). Se conserva porque documenta que el resultado dependía de la prueba y de los últimos años, y llevó a revisar la hora de paso de Terra.

Los CSV están en Drive (`datasets/appeears-6-zonas/`, subidos por Luca) y se copiaron a `data/cache/appeears/usuario/` (git los ignora).

- **El pipeline reproduce sus salidas.** Al correr `modis.cargar` y `exportar.zonas` con esos CSV salen las mismas cifras de `zonas_tendencias.json` en las 6 zonas (calor y vegetación; cambio total y significancia). Esto confirma que los archivos y las salidas son consistentes entre sí; no es todavía una verificación independiente del método.
- **Comprobación independiente de los datos (LST):** una matriz mensual armada otra vez desde el CSV (lecturas con calidad MODLAND 0b00 o 0b01, relleno 0 descartado, K a °C) coincide con la del pipeline (diferencia máxima 0.000 °C), y la prueba estacional (`pymannkendall.seasonal_test`) da lo mismo: El Centenario -0.054 °C por año (p = 0.0001), Sur -0.053 (p = 0.0006), Centro -0.004 (p = 0.70).
- **Pero el resultado depende de la prueba.** Con la media de cada año y Mann-Kendall simple, El Centenario da -0.022 °C por año (p = 0.27) y Sur -0.026 (p = 0.39): **no significativo**. Con medias anuales y Mann-Kendall simple (mismos datos y mismo filtro), ninguna de las 6 zonas sale significativa para la superficie (p entre 0.25 y 0.59).
- **La baja viene de los últimos años.** En El Centenario la media anual de superficie de día fue de 37-38.5 °C hasta 2021 y bajó a 36.9 (2022), 35.7 (2023), 35.6 (2024) y **33.5 °C (2025)**; las 46 lecturas de cada año son válidas. En Centro también cae en 2025 (30.0 °C frente a unos 32 de años anteriores). Una baja de ~4 °C de un año al otro en toda la ciudad no se parece a un cambio del paisaje.
- **Hipótesis, luego revisada:** la órbita de Terra se desplaza desde 2020 y su hora de paso es cada vez más temprana (NASA: https://terra.nasa.gov/about/terra-orbital-drift-information). NASA dice que el efecto en los datos de tierra es pequeño. Luca la contrastó con `Day_view_time` de MOD11A2 (PR #90): la hora media de paso baja de ≈10.8 h a ≈9.2 h en 2026. Sigue siendo la causa más probable y **no está probada**; falta el contraste con Aqua (#87).
- **Consecuencia (vigente):** la web y la demo muestran la superficie 2001-2021 (+0.94 °C, significativa) con la nota del aire (+1.47 °C, 2001-2025) y la limitación del corte en 2021. No se cita "baja de 1.3 °C" en ninguna zona.

### Frases propuestas para la web (sin causalidad)

- **Calor:** "El aire en La Paz se calentó cerca de 1.5 °C entre 2001 y 2025 (cambio estadísticamente significativo; reanálisis de NASA POWER, ~50 km). La temperatura de la superficie que mide el satélite MODIS subió cerca de 1 °C entre 2001 y 2021 (también significativo); cortamos ahí porque desde 2022 el satélite pasa más temprano y mide la superficie antes de que se caliente. Son dos mediciones distintas con periodos distintos. Esto describe qué cambió, no por qué."
- **Vegetación:** "El índice de vegetación (NDVI) bajó un poco entre 2001 y 2026 en el promedio de seis puntos de la ciudad (cambio estadísticamente significativo); en dos puntos, Oriente y Sur, subió un poco. Algunos meses no tienen lectura válida en zonas urbanas, así que es un panorama aproximado, y 2026 es un año parcial. Esto describe qué cambió, no por qué. Fuente: MODIS (NASA)."

---

## Pendiente

- Contraste de la superficie con Aqua (MYD11A2) para reforzar o descartar la explicación de la hora de paso de Terra (#87).
- Decidir si el pipeline debe usar también la prueba sobre medias anuales para la superficie.
- Agua: hecha con GRACE JPL Mascon como tendencia regional (PR #63 y #84); no es el acuífero de La Paz ni se puede bajar a zonas.
