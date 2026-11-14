---
name: rol-investigacion
description: Úsala para el trabajo científico de Radar BCS: obtener y validar datos NASA, aplicar el método estadístico (Mann-Kendall estacional con corrección Hirsch-Slack y pendiente de Sen), redactar con fuente y revisar que la web no afirme causalidad. Entregables en docs/investigacion/.
---

# Rol: Investigación / ciencia (Carlos)

Entregables en `docs/investigacion/`. Colabora con Prog. A (ejecuta el análisis) y UI/UX (textos). Para descargar datos usa la skill `earthdata-datasets`.

## Principios
- **No inventes datos.** Todo número, fecha o afirmación lleva fuente (URL, dataset, versión). Lo no verificado se marca "POR VERIFICAR".
- **Mostramos qué cambió, no por qué.** Una tendencia no prueba la causa. Prohibido "debido a", "causado por", "culpa de" en la web, salvo cita explícita de una fuente.
- Cada dato externo (prensa, reportes) con medio, fecha y enlace. Preferir la fuente primaria.

## Flujo
1. **Ficha de dataset** en `docs/investigacion/datasets.md`: nombre, short_name y versión, resolución, cobertura temporal, unidades, factor de escala, banderas de calidad y límites (ECOSTRESS es foto, no tendencia; GRACE/GLDAS solo tendencia regional).
2. **Validar** lo que entrega Prog. A: rango físico plausible, valores de relleno, nubes y calidad, huecos y escala (MOD11A2 llega en Kelvin con factor de escala; confirmarlo en la ficha del producto).
3. **Método** (documentar en `docs/investigacion/metodo.md` con referencias):
   - Series mensuales por zona; prueba **Mann-Kendall estacional** con corrección de Hirsch y Slack por correlación serial entre estaciones.
   - **Pendiente de Sen** (estacional) como magnitud del cambio: unidad por año, cambio total desde 2001 y por década.
   - Definir y registrar el nivel de significancia (p. ej. 0.05) y reportar p y años con datos.
   - Decidir y documentar manejo de huecos, mínimo de datos por estación y agregación espacial.
   - Citar la fuente del método y de la implementación (el paquete `pymannkendall` es una opción: POR VERIFICAR antes de citarlo).
4. **Resultado en lenguaje sencillo**: "Subió X desde 2001 (cambio estadísticamente significativo)" más "Esto describe qué cambió, no por qué". Los números salen del análisis, no de ejemplos.
5. **Límites visibles**: un píxel MODIS de 1 km abarca varias colonias; NASA POWER es de ~50 km; agua subterránea solo regional.

## Revisión de la web (checklist)
- [ ] Cada cifra muestra fuente, dataset y periodo.
- [ ] Ningún texto afirma causa ni implica culpa.
- [ ] "Significativo" explicado en una frase y con el nivel usado.
- [ ] Agua subterránea solo como tendencia regional, nunca por colonia.
- [ ] Las cifras del problema (acuífero, fugas, calor) citan su medio con enlace; sin enlace, se quitan.
- [ ] Las 4 preguntas (qué, dónde, cuánto, significativo) tienen respuesta visible.
- [ ] Texto literal de las preguntas del reto confirmado en la página oficial (pendiente según el plan).

## Formato de cada hallazgo (para `docs/investigacion/hallazgos.md`)
- Variable y zona.
- Dataset, versión y periodo usados.
- Cambio total desde 2001 y por década, con unidad.
- Pendiente de Sen y p; ¿significativo? (sí/no, nivel usado).
- Límites o advertencias (resolución, huecos, calidad).
- Frase para la web, ya revisada contra causalidad.

## Entrega
Resumen en inglés de método y datos para `docs/entrega/`, con enlaces a datos NASA, y una entrada de bitácora por cada decisión metodológica. Registra en `docs/RECURSOS.md` el código o texto de terceros que uses.
