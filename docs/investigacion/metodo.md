# Método estadístico

Estado: **borrador del 2026-11-14**. Las decisiones marcadas PENDIENTE se acuerdan con Prog. A (Luca) antes de publicar cifras.

## ¿El método responde las 4 preguntas del reto?

Sí. Preguntas confirmadas en `docs/referencia/reto-earth-system-trend-detective.md`.

| Pregunta del reto | Pantalla | Con qué se responde |
|---|---|---|
| ¿Qué cambia? | 1. Inicio | Signo de la tendencia de cada variable (calor, vegetación, lluvia, agua) |
| ¿Dónde? | 2. Mapa | La misma prueba aplicada por zona; se comparan las pendientes |
| ¿Cuánto? | 3. Ficha | Pendiente de Sen estacional: unidad por año, por década y total desde 2001 |
| ¿Es estadísticamente significativo? | 3. Ficha | Valor p de la prueba Mann-Kendall estacional con corrección por correlación serial |

Límite que hay que decir en la web: "dónde" depende de la resolución de cada dato (1 km en temperatura de superficie, 250 m en vegetación, ~50 km en NASA POWER, solo regional en agua subterránea). La prueba describe **qué cambió, no por qué**.

## Pasos

1. Serie mensual por variable y por zona.
2. Prueba **Mann-Kendall estacional**: compara cada mes solo con el mismo mes de otros años, así el ciclo anual no se confunde con tendencia.
3. **Dependencia entre meses consecutivos:** verificación con `correlated_seasonal_test` (Hipel y McLeod, 1994). La corrección completa de Hirsch y Slack NO está implementada en la librería; no la afirmes (ver el hallazgo más abajo).
4. **Pendiente de Sen estacional** como magnitud del cambio.
5. Reportar: pendiente, p, nivel de significancia usado y años con datos.

## Referencias

Los DOI se obtuvieron de resultados de búsqueda; las páginas de las editoriales respondieron 403, así que **el contenido de los artículos no se leyó**. Antes de citarlos en la entrega, abrir cada DOI en un navegador.

- Hirsch, R. M., Slack, J. R. y Smith, R. A. (1982). Techniques of trend analysis for monthly water quality data. *Water Resources Research*, 18(1), 107-121. DOI 10.1029/WR018i001p00107
- Hirsch, R. M. y Slack, J. R. (1984). A nonparametric trend test for seasonal data with serial dependence. *Water Resources Research*, 20(6), 727-732. DOI 10.1029/WR020i006p00727
- Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall's tau. *Journal of the American Statistical Association*, 63(324), 1379-1389. DOI 10.1080/01621459.1968.10480934 (otra fuente lista 10.2307/2285891; **POR VERIFICAR** cuál resuelve)

## Implementación: `pymannkendall`

Reportado por subagente a partir del README del repositorio (no releído por el Líder):

- Repositorio: <https://github.com/mmhs013/pyMannKendall>, licencia MIT. PyPI: <https://pypi.org/project/pymannkendall/>.
- Artículo: Hussain, M. M. y Mahmud, I. (2019). pyMannKendall: a python package for non parametric Mann Kendall family of trend tests. *Journal of Open Source Software*, 4(39), 1556. DOI 10.21105/joss.01556
- Funciones: `seasonal_test` (cita a Hirsch, Slack y Smith, 1982), `correlated_seasonal_test` y `seasonal_sens_slope`.

**Hallazgo que hay que resolver.** El README atribuye `correlated_seasonal_test` y `seasonal_sens_slope` a **Hipel y McLeod (1994)**, no a Hirsch y Slack (1984). Además hay issues abiertos en el repositorio sobre esa función (#23, sobre la varianza; #36, sobre `alpha`). Por lo tanto, **no escribir todavía "corrección de Hirsch-Slack" como hecho sobre nuestro código**. PENDIENTE (Carlos + Luca): leer el código de `correlated_seasonal_test` y confirmar que calcula la covarianza entre estaciones de Hirsch y Slack; si no se puede confirmar, la web y la entrega dirán "prueba Mann-Kendall estacional corregida por correlación serial (`pymannkendall.correlated_seasonal_test`)" y se citará lo que cite el paquete.

## Validación con NASA POWER (2026-11-14, issue #5)

Se reprodujo el prototipo del PR #20 (`analisis/prototipo_power.py`) en una carpeta temporal y salieron los mismos números. Después se contrastó con otras pruebas sobre los mismos datos. Resultados en `docs/investigacion/hallazgos.md`.

**Supuestos del Mann-Kendall estacional:** los años son independientes entre sí dentro de cada mes; no hay huecos grandes (en POWER hay 0 de 300 meses faltantes); la tendencia tiene el mismo signo en todos los meses.

**Lo que se comprobó:**

| Comprobación | Temperatura (T2M) | Lluvia (PRECTOTCORR) |
|---|---|---|
| Mann-Kendall estacional (`seasonal_test`) | p < 0.001, significativo | p = 0.18, no significativo |
| Con correlación entre estaciones (`correlated_seasonal_test`) | p = 5.1e-5, significativo | p = 0.29, no significativo |
| Mann-Kendall sobre el promedio anual | p = 7.9e-5, significativo | p = 0.12, no significativo |
| Lluvia solo de la temporada jun-oct | no aplica | p = 0.11, no significativo |
| Pendiente de Sen (estacional / calculada a mano / anual) | 0.061 / 0.061 / 0.060 °C por año | 0.0 / 0.0 / 0.017 mm/día por año |
| Regresión lineal anual (OLS), solo como contraste | 0.0615 °C por año | 0.0152 mm/día por año |

**Conclusiones:**

1. **Temperatura: el método funciona y el resultado es robusto.** Todas las variantes coinciden en el signo, la magnitud (≈0.06 °C/año) y la significancia.
2. **Lluvia: la conclusión "sin cambio claro" es robusta** (ninguna variante sale significativa), **pero la pendiente de Sen estacional no sirve para mostrarse.** Da 0.0 porque 87 de los 300 meses valen exactamente 0 y la lluvia se concentra en agosto-octubre: la mediana de todas las pendientes queda en 0 aunque el total anual haya variado. Un "cambio total = 0" en la web sería engañoso.
3. **No decir "no hay cambio" cuando p no es significativo.** Con 25 años y la variación de la lluvia entre años (el promedio anual de POWER va de 0.28 a 1.37 mm/día), un cambio pequeño no se detectaría. Redacción: "no se detecta un cambio claro".

**Límites que deben verse en la web:**

- POWER es un **reanálisis** (modelo que combina observaciones), no una estación ni un pluviómetro. No es la lectura de un termómetro en La Paz.
- Se consulta **un solo punto** (24.14 N, -110.31 O) que representa una celda de unos 50 km: **no puede responder "¿dónde?"** dentro de la ciudad. Esa pregunta depende de MODIS (1 km y 250 m).
- POWER mide **temperatura del aire a 2 m**, no la temperatura de la superficie que se calienta en el pavimento (MODIS).
- Lo anterior vale para POWER. MODIS y GRACE/GLDAS **aún no se han validado** (no hay datos todavía); hay que repetir estas mismas comprobaciones cuando existan.

## Decisiones PENDIENTES

- **Lluvia: cómo calcular la pendiente** (propuesta del Líder, por acordar con Prog. A): con el total anual (o el de jun-oct) y Mann-Kendall simple más pendiente de Sen, en lugar de la pendiente estacional mensual. Mientras no se acuerde, la web no muestra pendiente ni cambio total para lluvia, solo "no se detecta un cambio claro".
- **Cómo mostrar p cuando es casi cero:** el prototipo guarda `0.0`; la web debe decir "p < 0.001", nunca "p = 0".
- Nivel de significancia (propuesta: α = 0.05).
- Manejo de huecos y mínimo de años con datos por mes para correr la prueba.
- Agregación espacial: cómo se define cada zona y cómo se promedia.
- Filtro de calidad de MODIS (banderas QA) antes de promediar.
- Qué se muestra cuando la tendencia no es significativa (propuesta: "sin cambio claro").
