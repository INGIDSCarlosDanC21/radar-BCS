# Método estadístico

Estado: **borrador del 2026-11-14**. Las decisiones marcadas PENDIENTE se acuerdan con Prog. A (Diego) antes de publicar cifras.

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
3. **Corrección de Hirsch y Slack** para la dependencia entre meses consecutivos.
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

**Hallazgo que hay que resolver.** El README atribuye `correlated_seasonal_test` y `seasonal_sens_slope` a **Hipel y McLeod (1994)**, no a Hirsch y Slack (1984). Además hay issues abiertos en el repositorio sobre esa función (#23, sobre la varianza; #36, sobre `alpha`). Por lo tanto, **no escribir todavía "corrección de Hirsch-Slack" como hecho sobre nuestro código**. PENDIENTE (Carlos + Diego): leer el código de `correlated_seasonal_test` y confirmar que calcula la covarianza entre estaciones de Hirsch y Slack; si no se puede confirmar, la web y la entrega dirán "prueba Mann-Kendall estacional corregida por correlación serial (`pymannkendall.correlated_seasonal_test`)" y se citará lo que cite el paquete.

## Decisiones PENDIENTES

- Nivel de significancia (propuesta: α = 0.05).
- Manejo de huecos y mínimo de años con datos por mes para correr la prueba.
- Agregación espacial: cómo se define cada zona y cómo se promedia.
- Filtro de calidad de MODIS (banderas QA) antes de promediar.
- Qué se muestra cuando la tendencia no es significativa (propuesta: "sin cambio claro").
