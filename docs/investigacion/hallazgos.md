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

---

## Pendiente (no hay datos todavía)

- Temperatura de superficie y vegetación por zona (MODIS): responderán "¿dónde?".
- Agua subterránea (GRACE/GLDAS): solo tendencia regional.
