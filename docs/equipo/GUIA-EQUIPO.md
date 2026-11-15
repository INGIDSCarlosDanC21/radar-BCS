# Guía del equipo OptiPaz: qué es Radar BCS, qué hace cada pantalla y por qué estamos aquí

Para **todos los integrantes**. Español sencillo; la entrega oficial va en inglés. Todas las cifras salen de `data/salida/` y de `docs/investigacion/hallazgos.md` (revisado el 2026-11-15); si algo cambia, se cambia allí y aquí. **Regla de esta guía: aquí no hay nombres de menores de edad ni datos inventados.**

---

## 1. Radar BCS en tres frases

1. Es una **web gratis para el celular** (español e inglés, sin instalar nada) que cuenta con **datos abiertos de la NASA** cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz desde 2001.
2. Para cada cambio dice **qué tan seguros estamos** (con una prueba estadística) y, al final, **qué puede hacer un vecino**.
3. Además muestra el **cielo y el mar de hoy** (con un modelo público, no con la NASA) y lo deja claramente etiquetado como "contexto de hoy, no avisos oficiales".

**Lo que mostramos es qué cambió, no por qué.** Una tendencia no prueba su causa; nunca decimos "por el cambio climático" ni "por la urbanización".

## 2. Qué problema resolvemos de verdad

La información sobre cómo cambia el clima y la tierra en La Paz **existe**, pero vive en portales técnicos y reportes en inglés. Un vecino, un agricultor o un pescador no la lee ni sabe si "subió" es real o ruido. Radar BCS la lleva al celular, en palabras simples, y la ordena en **tres problemas locales** que sí viven en La Paz:

| Problema local | Qué mostramos | Fuente |
|---|---|---|
| **Calor urbano** | Temperatura del aire (+1.5 °C desde 2001), vegetación que baja en varias zonas, consejos contra el calor | NASA POWER, MODIS |
| **Estrés hídrico y sequía** | Lluvia que varía mucho y sin cambio claro, agua regional almacenada, valles agrícolas | NASA POWER, GRACE/GRACE-FO, MODIS NDVI |
| **Costa y ciclones** | Oleaje, viento, temperatura del mar y corriente de hoy; clorofila y satélite en imagen; enlaces a avisos oficiales | Modelo Open-Meteo (no NASA); NASA GIBS (imágenes) |

**Para quién:** el vecino de La Paz, no solo el especialista. Por eso nuestra meta principal es el **Local Impact Award**.

## 3. Por qué participa cada quien

Todos participamos para lo mismo: **que La Paz vea su propio cambio con datos de la NASA y sepa qué hacer**. Cada rol aporta una parte:

| Persona | Rol | Qué aporta al proyecto |
|---|---|---|
| Carlos | Líder + Investigación | Decide el rumbo, cuida que ninguna cifra se invente, revisa el método y fusiona a `main` |
| Luca | Programador A (datos) | Descarga y analiza las series de la NASA y calcula las tendencias (Python): de ahí sale cada número |
| Diego | Programador B (web) | Construye las pantallas, los mapas y la publicación en GitHub Pages |
| Ehileen y Roberto | UI/UX | Que sea claro, accesible y bonito en un celular; logo e íconos |

Cada una de estas piezas responde una pregunta del reto (ver sección 5). Si falta una, la herramienta no cierra el ciclo "dato → análisis → pantalla → vecino".

## 4. Cada pantalla: qué es, por qué está y qué significa

El menú inferior es **Inicio · Mapa · Clima · Pesca · Más** (en "Más": Agro, Avisos, Acciones). Cada número muestra su fuente.

### Cómo leer los números (vale para todas las fichas)

- **Cambio total:** cuánto subió o bajó desde 2001 (estimado con la pendiente de Sen; es una estimación, no una medición directa).
- **Pendiente de Sen:** el ritmo de cambio, por año; es robusta a datos raros.
- **p (valor p):** qué tan probable es ver ese cambio "por pura casualidad". **Menos de 0.05 = significativo** (estamos bastante seguros de que el cambio es real). Más de 0.05 = **no se puede asegurar** que haya cambio; no es lo mismo que "no hay cambio".
- **Mann-Kendall estacional:** la prueba que usamos; busca una subida o bajada sostenida y toma en cuenta el ciclo de cada año (verano/invierno).

### Inicio
- **Qué es:** las cuatro tarjetas (calor, vegetación, lluvia, agua) y el "cielo ahora en BCS".
- **Por qué está:** responde **¿qué cambia?**. Cada tarjeta lleva a su ficha.
- **Qué significa:** cada tarjeta resume el cambio más importante. El "cielo ahora" es **contexto de hoy** (modelo Open-Meteo y una imagen de satélite GOES-West de la NASA); **no es una tendencia ni un resultado nuestro**.

### Ficha de cada variable (Calor, Vegetación, Lluvia, Agua)
- **Qué es:** gráfica de 2001 a hoy, cambio total y por década, prueba de significancia, límites del dato, y "Viaja en el tiempo" (un control de año).
- **Por qué está:** responde **¿cuánto?** y **¿es significativo?**. Es la pantalla que más pesa en Validez.
- **Qué significa (cifras vigentes):**
  - **Calor, aire:** +0.06 °C por año, unos **+1.5 °C** de 2001 a 2025, **p < 0.001** → significativo. Fuente NASA POWER (una celda de ~50 km; reanálisis, no estación).
  - **Calor, superficie (MODIS):** sube +0.94 °C en 2001-2021 (p = 0.0003) pero **Aqua no lo confirma** (+0.27 °C, p = 0.29) y la hora de paso de ambos satélites se mueve desde 2022. **Se muestra como no concluyente**, sin titular. No decimos que la superficie se calentó.
  - **Vegetación (NDVI):** baja unos 0.013 (p = 0.004), significativo en el promedio de seis puntos; en Oriente y Sur sube un poco. Algunos meses urbanos no tienen lectura válida, así que es un panorama aproximado.
  - **Lluvia:** cambia mucho de un año a otro; **no se detecta cambio claro** (p = 0.13). No mostramos pendiente: sería engañosa (la lluvia tiene muchos meses de cero).
  - **Agua (GRACE):** el agua almacenada en la **región** subió unos 1.4 cm (p = 0.009). **No es el acuífero de La Paz**; el satélite ve cientos de kilómetros.

### Mapa
- **Qué es:** mapa de las **zonas de La Paz** (6 puntos) con íconos por estado (sube, baja, sin cambio, sin datos), indicadores, búsqueda de un lugar (Nominatim/OpenStreetMap) y "Mira La Paz desde el espacio" (fotos de la NASA año por año).
- **Por qué está:** responde **¿dónde?**.
- **Qué significa:** son **6 puntos de muestra** (un píxel de 1 km cada uno), no polígonos de colonias. La búsqueda envía lo que escribes a Nominatim; el mapa lo avisa.

### Clima
- **Qué es:** mapa meteorológico de BCS con los lugares, buscador, 4 tarjetas (calor y sensación térmica, UV y sol, viento-oleaje-corrientes, humedad y lluvia) y su detalle con curva de 12 h hacia atrás y adelante; al tocar un lugar cambian las cifras.
- **Por qué está:** el vecino pregunta "¿qué hago hoy?". Complementa las tendencias con **contexto de hoy**.
- **Qué significa:** son valores de un **modelo** (Open-Meteo), **no de estaciones**. La sensación térmica se muestra sin etiqueta de peligro porque no hallamos una fuente primaria para un nivel; el UV usa la escala de la OMS.

### Pesca
- **Qué es:** mapa de 8 puertos con oleaje, viento o temperatura del mar, control de hora y animación de las horas del día, y cuatro fichas (estado del mar, condiciones, viento costero, clorofila).
- **Por qué está:** costa y ciclones son un problema local; el pescador necesita el panorama del mar.
- **Qué significa:** el verde/amarillo/rojo sale de las escalas **Douglas** y **Beaufort** y es una **estimación del modelo, no un aviso oficial ni la bandera del puerto**. La clorofila es imagen de satélite de la NASA (VIIRS, servida por GIBS).

### Avisos
- **Qué es:** avisos automáticos para las próximas 24 h (oleaje, viento, lluvia, tormenta, UV) con nivel, zona y hora, más enlaces a las fuentes oficiales (SMN, NHC, CENAPRED, SEMAR, CONAPESCA).
- **Por qué está:** para que quien necesite una decisión sepa **dónde está lo oficial**.
- **Qué significa:** **los avisos del modelo no son oficiales**; lo oficial está en los enlaces.

### Agro
- **Qué es:** mapa agrícola con las fichas de los valles (suelo, agua, vegetación) y dos avisos agrícolas auditados.
- **Por qué está:** estrés hídrico y sequía afectan al campo. Datos de SoilGrids, CONAGUA, SIAP, SEPADA y MODIS NDVI.
- **Qué significa:** lo no verificado (SIAP, SEPADA) está declarado como tal.

### Acciones
- **Qué es:** consejos contra el calor y para ahorrar agua.
- **Por qué está:** cierra el ciclo con **¿qué hago?**. Salen de fuentes públicas (CDC, EPA WaterSense, OMS).

## 5. Las respuestas al reto

**Reto:** *Be An Earth System Trend Detective!* (Ciencias de la Tierra y Software). Pide elegir variables de la NASA, verlas en el tiempo y decir **qué, dónde, cuánto y si es significativo**.

| Pregunta del reto | Nuestra respuesta | Dónde |
|---|---|---|
| **¿Qué está cambiando?** | Calor (aire +1.5 °C), vegetación (baja), lluvia (sin cambio claro), agua regional (sube) | Inicio y fichas |
| **¿Dónde?** | En 6 puntos de La Paz: por ejemplo, la vegetación baja en cuatro y sube un poco en Oriente y Sur | Mapa |
| **¿Cuánto?** | Cambio total desde 2001 y por década, con cifra y unidades | Fichas |
| **¿Es significativo?** | Sí para aire, vegetación y agua regional; **no** para lluvia; **no concluyente** para la superficie | Fichas |

**Los 4 elementos de una respuesta exitosa del reto, y cómo los cumplimos:**

1. **Variables con posible tendencia:** temperatura del aire y de superficie, NDVI, lluvia, agua almacenada.
2. **Una región concreta:** La Paz, B.C.S., con 6 puntos de muestra.
3. **Serie de tiempo larga:** 25 años (2001-2025; agua 2002-2026) con gráfica.
4. **Análisis estadístico básico:** pendiente de Sen y Mann-Kendall estacional, con valor p; mostramos también cuando **no** hay cambio claro (el reto lo considera válido).

## 6. Preguntas probables del jurado (y respuestas)

**¿Qué es de la NASA y qué no?** NASA: temperatura del aire y lluvia (POWER), temperatura de superficie y vegetación (MODIS), agua almacenada (GRACE), imágenes y clorofila (GIBS). **No NASA:** el cielo, el mar y el clima de hoy (modelo Open-Meteo), que mostramos aparte como contexto y que **no entra en ningún resultado de tendencia**.

**¿Por qué el calor de superficie no es su dato estrella?** Porque Terra y Aqua no coinciden y la hora de paso de ambos satélites cambia desde 2022. Preferimos decir "no concluyente" que presumir un número dudoso (Validez).

**¿Por qué no dicen la causa?** Porque una tendencia no prueba la causa; el reto pide tendencias y significancia, no atribución.

**¿Qué tan confiable es el agua?** Es una tendencia **regional**; no mide el acuífero de La Paz y lo decimos en pantalla.

**¿Qué uso de IA hubo?** Claude Code (asistente de código y redacción), Gemini (logo, con marca "AI-generated" dentro de la imagen), Google Stitch (diseño) y, si se usa, ElevenLabs (voz sintética del video). Todo está declarado en `docs/FUENTES-Y-IA.md` y en el campo de IA.

**¿Por qué tantas pantallas?** Cada una responde una pregunta del reto o un problema local; ninguna agrega resultados sin fuente.

**Criterios globales (1 a 5):**

| Criterio | Cómo lo respondemos |
|---|---|
| **Impact** | Problema local real (calor, agua, costa) para un público general; meta Local Impact Award |
| **Creativity** | Lleva información de expertos al celular con "Viaja en el tiempo", "Mira La Paz desde el espacio" y zonas con íconos |
| **Validity** | Pendiente de Sen y Mann-Kendall estacional, límites de cada dato a la vista, y "no concluyente" cuando toca |
| **Relevance** | Los números centrales salen de NASA, con fuente por cifra; las variables son las del reto |
| **Presentation** | Una historia clara en 30 s o 7 diapositivas; el sitio completo también cuenta |

## 7. Lo que no debemos decir ni hacer

- Ninguna **causa** del calor, la vegetación o la lluvia (regla 2).
- No decir que la **superficie** se calentó, que hay **más agua en el acuífero** ni que se probó en un **celular real** hasta que #71 lo confirme.
- No llamar "avisos oficiales" a lo que sale del modelo.
- **Ningún menor de 18**: ni nombre, ni voz, ni imagen, en ningún lugar.
- Nada de logos ni marca de la NASA; la NASA solo aparece escrita.
- Trabajar en `dev`; solo se sube a `main` lo ya revisado y con el "fusiona" de Carlos.
