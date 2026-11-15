# Hallazgos

Estado: **preliminar, 2026-11-14.** Salen del prototipo del PR #20 (`analisis/prototipo_power.py`), que el Líder reprodujo con los mismos números y contrastó con otras pruebas (ver `docs/investigacion/metodo.md`). Cuando Prog. A (Luca) entregue el pipeline final, hay que repetir la revisión; si algún número cambia, esta página manda actualizarlo. Las frases para la web ya están revisadas contra causalidad, pero **no son finales hasta que se publique el pipeline**.

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

Origen: `data/salida/indicadores.json` y `zonas_tendencias.json` (Luca, PR #50), 6 puntos de La Paz (Centro, Chametla, El Centenario, Oriente, Sur, Surponiente), 2001-2025, Mann-Kendall estacional + Sen. Investigación reprodujo las salidas con los CSV de Drive (ver "Reproducción" abajo).

### Resultados (como salen del pipeline)

| Indicador | Cambio 2001-2025 | p | Significativo | Meses sin dato |
|---|---|---|---|---|
| Calor, aire (POWER T2M) | +1.465 °C | < 0.001 | Sí | 0 |
| Calor, superficie de día (MODIS LST, promedio de 6 puntos) | -0.02 °C por año (≈ -0.5 °C) | 0.11 | No | 0 |
| Vegetación (MODIS NDVI, promedio de 6 puntos) | -0.019 | < 0.001 | Sí | varía (ver abajo) |
| Lluvia (POWER, total anual) | sin cifra | 0.129 | No | 0 |

Por punto: el NDVI baja de forma significativa en Centro (-0.034), Chametla (-0.034), El Centenario (-0.047) y Surponiente (-0.050), y no cambia de forma clara en Oriente y Sur. La temperatura de superficie baja de forma significativa en El Centenario (-1.30 °C) y Sur (-1.26 °C) y no cambia de forma clara en los otros cuatro.

### Lo que hay que decir con honestidad

1. **El aire y la superficie no coinciden.** El aire sube de forma clara; la superficie vista por el satélite no. Son mediciones distintas (el aire a 2 m es un reanálisis de ~50 km; la superficie es una lectura de día de 1 km en un instante). **No elegir la que "cuenta mejor la historia":** la web muestra las dos juntas y dice que no sabemos por qué difieren.
2. **No interpretar todavía la baja de -1.3 °C en El Centenario y Sur.** Es un resultado inesperado y puede ser un efecto de los datos (esos puntos solo tienen calidad MODLAND 0b01; el filtro de calidad cambia con el tiempo; la hora de paso del satélite). No es evidencia de que esas zonas "se enfríen". Hay que revisarlo antes de citarlo en la demo.
3. **El NDVI urbano pierde muchos meses al filtrar** (167 de 300 en Centro, 30 en Surponiente). Al promediar los 6 puntos, la composición cambia con los meses sin dato y eso puede sesgar la tendencia. Que sea significativo no quiere decir que sea preciso.
4. **Son 6 puntos, no zonas.** Las celdas del mapa siguen siendo sintéticas. Nada de esto responde "¿dónde?" para toda la ciudad.
5. **Causa:** nada de esto dice por qué cambió la vegetación o el calor.

### Reproducción con los CSV de AppEEARS (2026-11-14, Investigación)

Los CSV están en Drive (`datasets/appeears-6-zonas/`, subidos por Luca) y se copiaron a `data/cache/appeears/usuario/` (git los ignora).

- **El pipeline reproduce sus salidas.** Al correr `modis.cargar` y `exportar.zonas` con esos CSV salen las mismas cifras de `zonas_tendencias.json` en las 6 zonas (calor y vegetación; cambio total y significancia). Esto confirma que los archivos y las salidas son consistentes entre sí; no es todavía una verificación independiente del método.
- **Comprobación independiente de los datos (LST):** una matriz mensual armada otra vez desde el CSV (lecturas con calidad MODLAND 0b00 o 0b01, relleno 0 descartado, K a °C) coincide con la del pipeline (diferencia máxima 0.000 °C), y la prueba estacional (`pymannkendall.seasonal_test`) da lo mismo: El Centenario -0.054 °C por año (p = 0.0001), Sur -0.053 (p = 0.0006), Centro -0.004 (p = 0.70).
- **Pero el resultado depende de la prueba.** Con la media de cada año y Mann-Kendall simple, El Centenario da -0.022 °C por año (p = 0.27) y Sur -0.026 (p = 0.39): **no significativo**. Con medias anuales y Mann-Kendall simple (mismos datos y mismo filtro), ninguna de las 6 zonas sale significativa para la superficie (p entre 0.25 y 0.59).
- **La baja viene de los últimos años.** En El Centenario la media anual de superficie de día fue de 37-38.5 °C hasta 2021 y bajó a 36.9 (2022), 35.7 (2023), 35.6 (2024) y **33.5 °C (2025)**; las 46 lecturas de cada año son válidas. En Centro también cae en 2025 (30.0 °C frente a unos 32 de años anteriores). Una baja de ~4 °C de un año al otro en toda la ciudad no se parece a un cambio del paisaje.
- **Hipótesis (sin verificar, no citar como hecho):** la órbita de Terra se desplaza desde 2020 y su hora de paso es cada vez más temprana (NASA: https://terra.nasa.gov/about/terra-orbital-drift-information); una lectura de "día" más temprano sería más fría. NASA dice que el efecto en los datos de tierra es pequeño, y no se encontró un estudio que mida su efecto sobre las tendencias de MOD11. Alguien tendría que comprobarlo (por ejemplo, con la hora de paso `Day_view_time` de MOD11A2 o con MYD11A2 de Aqua).
- **Consecuencia para la web y la demo:** no se cita "baja de 1.3 °C" en El Centenario ni en Sur. Para la superficie se mantiene "sin cambio claro" en el promedio de la ciudad (p = 0.11) y una limitación que diga que la tendencia por punto cambia según la prueba y los últimos años.

### Frases propuestas para la web (sin causalidad)

- **Calor:** "El aire en La Paz se calentó cerca de 1.5 °C entre 2001 y 2025 (cambio estadísticamente significativo; reanálisis de NASA POWER, ~50 km). La temperatura de la superficie que mide el satélite MODIS no muestra un cambio claro en el mismo periodo. Son dos mediciones distintas y no sabemos por qué no coinciden. Esto describe qué cambió, no por qué."
- **Vegetación:** "El índice de vegetación (NDVI) bajó un poco entre 2001 y 2025 en seis puntos de la ciudad, y el cambio es estadísticamente significativo. Algunos meses no tienen lectura válida en zonas urbanas, así que es un panorama aproximado. Esto describe qué cambió, no por qué. Fuente: MODIS (NASA)."

---

## Pendiente

- Probar la hipótesis de la hora de paso de Terra (`Day_view_time` en MOD11A2 o MYD11A2 de Aqua) para explicar la baja de los últimos años.
- Decidir si el pipeline debe usar también la prueba sobre medias anuales para la superficie.
- Agua subterránea (GRACE/GLDAS): solo tendencia regional; no empezada.
