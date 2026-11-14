# Reto oficial: Be An Earth System Trend Detective!

Fuente: https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/ (leído el 2026-11-14 por Claude desde el navegador). Dificultad: avanzada. Temas: ciencias de la Tierra y software. Resumen en nuestras palabras; ante duda, consulta la página.

## Qué pide el reto

Una herramienta que permita elegir variables medidas por misiones de ciencias de la Tierra (o producidas por modelos), ver cómo cambian en el tiempo y determinar:

1. **Qué** está cambiando.
2. **Dónde** está cambiando.
3. **Cuánto** está cambiando.
4. Si el cambio es **significativo** en el sentido estadístico.

Esto confirma las 4 preguntas de `AGENTS.md` (issue #4 cerrado).

## Los 4 elementos de una respuesta exitosa

1. Identificar variables de interés que puedan tener tendencia.
2. Obtener esas variables para una **región concreta** (la mayoría de las tendencias no son globales).
3. Generar y **visualizar una serie de tiempo** lo bastante larga para hacer estadística.
4. Hacer un análisis estadístico **básico**: tasa de cambio y prueba de significancia (el reto menciona t-test, Mann-Kendall o intervalos de confianza).

El reto dice que una respuesta que hace **visualización y análisis** cumple todo el alcance.

## Consideraciones opcionales (no obligatorias)

- Público probable del reto: estudiantes de bachillerato y universidad y público con algo de formación científica. Definiciones sencillas de las variables ayudan. **Nuestro público es el vecino de La Paz**: es una decisión nuestra, justificada por el impacto local; hay que cuidar el lenguaje sencillo.
- Preguntas cortas al usuario (qué y dónde quiere investigar) y **un par de ejemplos de demostración** que el usuario pueda ver. Pueden aportar a Creatividad y Presentación.
- Datos diarios o mensuales son los más fáciles de procesar.
- Encontrar una tendencia aunque **no sea significativa** también es válido; a veces solo falta más años de datos. Nuestra web debe decirlo con claridad y sin exagerar.
- Las tendencias pueden no ser lineales y a veces no se ven sin quitar ciclos regulares como el estacional. El reto considera **fuera de alcance** los análisis complejos; detectar tendencias lineales es "un gran comienzo". Por eso Mann-Kendall + pendiente de Sen basta; la corrección estacional (Hirsch-Slack) es un extra que conviene mantener solo si no pone en riesgo el tiempo.
- El reto menciona que la IA puede ayudar a identificar datos con potencial de mostrar tendencias; recuerda declarar el uso de IA en la entrega.

## Instrumentos y modelos que nombra

MODIS, OMI, AIRS, GPM, MERRA-2 y GLDAS. Nosotros usamos MODIS y GLDAS más NASA POWER, GRACE, ECOSTRESS y NASADEM (ver `docs/investigacion/datasets.md`).

## Recursos oficiales del reto

Datos y herramientas de la NASA:

- Giovanni (menús de variables, series de tiempo y descarga): https://giovanni.gsfc.nasa.gov/
- Hydrology Time Series (series hidrológicas): https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series
- AppEEARS (acceso y transformación de datos geoespaciales, con series de tiempo): https://appeears.earthdatacloud.nasa.gov/
- Climate Data Online (NOAA/NCEI): https://www.ncei.noaa.gov/cdo-web/
- Artículo sobre series de tiempo y significancia (clorofila SeaWiFS): https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf

Socios espaciales y apoyo estadístico:

- KNMI Climate Explorer: https://climexp.knmi.nl/
- Métodos estadísticos para detectar tendencias (artículo en Medium): https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b
- Guía de significancia estadística: https://www.statsig.com/perspectives/a-comprehensive-guide-to-statistical-significance
- CSA (Canadá): datos RADARSAT Constellation, Geo.ca, misión SWOT y tutorial de radar con Python (enlaces en la página del reto).

Nota de la página: la NASA no avala entidades no gubernamentales y quien las use debe cumplir sus condiciones de uso de datos.

## Qué implica para Radar BCS

- Para premios globales hay que usar **al menos un recurso NASA** del reto y listarlo con enlace en la entrega. Giovanni y AppEEARS son opciones rápidas para obtener series sin escribir descargas propias.
- Criterios globales (Impact, Creativity, Validity, Relevance, Presentation): la Validez depende de mostrar bien la prueba de significancia y las limitaciones de resolución; la Relevancia, de usar de verdad variables del reto.
- Riesgo a vigilar: no prometer causas. El reto habla de tendencias y significancia; relacionar con procesos causales queda fuera de lo que mostramos (regla 2 de `AGENTS.md`).
