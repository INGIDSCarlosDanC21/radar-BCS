|  |
| --- |
| **NASA SPACE APPS CHALLENGE 2026 · LA PAZ, BCS**  **Radar Paceño**  Qué está cambiando en La Paz, contado con datos de la NASA  13 de noviembre de 2026 · Carlos (líder del equipo) |

Una web en español, para celular, que muestra con datos de la NASA cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz desde 2001, y qué puede hacer cada vecino al respecto.

| **Dato** | **Detalle** |
| --- | --- |
| **Reto** | Be An Earth System Trend Detective! (nivel avanzado · Ciencias de la Tierra y Software) |
| **Sede** | San Juan II |
| **Fechas** | Sábado 14, 07:00, al domingo 15 de noviembre, 21:00 (hora local) |
| **Equipo** | 6 integrantes (máximo permitido) |
| **Producto** | Web en español para celular, gratuita y sin instalar nada |

# Objetivo del reto

|  |
| --- |
| **Lo que pide la NASA**  Crear una herramienta que permita **elegir variables medidas por misiones de ciencias de la Tierra**, **visualizar cómo cambian con el tiempo** y evaluar **qué cambia, dónde, cuánto y si el cambio es estadísticamente significativo**.  Fuente: resumen del reto publicado por [<u>HackAthlone</u>](https://hackathlone.com/challenges). El enunciado completo está en la [<u>página oficial</u>](https://www.spaceappschallenge.org/2026/). |

**Lo que debemos lograr para ganar en La Paz**

* **Herramienta funcional:** se abre en el celular y funciona en vivo frente al jurado.
* **Responde las 4 preguntas:** qué, dónde, cuánto y si es significativo, para La Paz.
* **Datos abiertos de la NASA:** cada número muestra su fuente.
* **Impacto local:** agua y calor, por zona de la ciudad, en lenguaje sencillo.
* **Entrega completa:** web publicada, repositorio, video demo y declaración del uso de IA.

# El problema

La Paz enfrenta dos crisis que afectan a toda la ciudad: falta de agua y calor extremo.

|  |  |  |  |
| --- | --- | --- | --- |
| **90 %**  del agua sale de un solo acuífero | **13 M m³**  de déficit del acuífero al año | **47 %**  de fugas estimadas en la red | **+41.8 %**  enfermedades por calor en BCS (2026) |

* **Agua:** el acuífero de La Paz se extrae por encima de su recarga ([<u>Forest Trends, 2024</u>](https://forest-trends.org/wp-content/uploads/2025/01/Reporte-Taller-Liderazgo-Resiliencia-Hidrica-La-Paz-2024.11.11.pdf)). Las fugas en la red se estiman hasta en 47 % ([<u>Zeta Tijuana</u>](https://zetatijuana.com/2022/09/bcs-sin-reserva-de-agua/)).
* **Calor:** las enfermedades por calor en BCS subieron 41.8 % respecto a 2025 ([<u>El Congresista</u>](https://elcongresista.mx/aumento-enfermedades-calor-bcs)), con siete muertes en la temporada ([<u>Zeta Tijuana</u>](https://zetatijuana.com/2026/10/incrementan-enfermedades-y-muertes-por-calor-en-bcs/)).
* **El hueco:** un taller local sobre resiliencia hídrica señaló el escaso entendimiento público del sistema hídrico (mismo reporte de Forest Trends).

# La solución

**No inventamos nada nuevo:** hacemos accesible información que hoy solo leen especialistas.

* Ya existen el visualizador de islas de calor URSA del [<u>BID</u>](https://blogs.iadb.org/ciudades-sostenibles/es/como-identificar-islas-de-calor-urbanas-descubre-ursa-el-nuevo-software-inteligente-del-bid), una tesis de la UABCS que relaciona colonias con islas de calor y un [<u>estudio de vulnerabilidad</u>](https://desarrollo.fmcn.org/wp-content/uploads/2025/07/Estudio_Vulnerabilidad_LaPaz.pdf) con 29,825 habitantes expuestos a peligros climáticos.
* Todo está en PDFs y plataformas técnicas. Nadie lo ha puesto en manos del vecino.
* **Radar Paceño:** abres la web en el celular, eliges tu zona y ves qué cambió desde 2001, qué tan seguro es ese cambio y qué puedes hacer (horarios de riesgo por calor, ahorro de agua). Se comparte por WhatsApp.

|  |
| --- |
| **Regla de validez**  Mostramos *qué* cambió, no afirmamos *por qué*. Una tendencia no prueba la causa. |

# Cómo respondemos al reto

El resumen del reto coincide con las cuatro preguntas que trabajan otros equipos. Cada una tiene su pantalla:

| **Pregunta** | **Pantalla** | **Cómo la responde** |
| --- | --- | --- |
| **¿Qué cambia?** | 1. Inicio | 4 tarjetas: calor, vegetación, lluvia y agua (el usuario elige la variable) |
| **¿Dónde?** | 2. Mapa | Zonas de La Paz con más cambio |
| **¿Cuánto?** | 3. Ficha | Cambio total desde 2001 y por década (°C, %) |
| **¿Es significativo?** | 3. Ficha | Prueba Mann-Kendall estacional con corrección Hirsch-Slack y pendiente de Sen |
| **(extra) ¿Qué hago?** | 4. Acciones | Consejos contra el calor y para ahorrar agua |

# Datos NASA

Todos son abiertos y gratuitos; se descargan con NASA Earthdata (AppEEARS) o Google Earth Engine.

| **Variable** | **Dataset** | **Resolución** | **Límite** |
| --- | --- | --- | --- |
| **Temperatura del suelo** | MODIS MOD11A2 (2001–) | 1 km | Cada píxel abarca varias colonias |
| **Calor por colonia** | ECOSTRESS | 70 m | Fechas irregulares: foto, no tendencia |
| **Vegetación (NDVI)** | MODIS MOD13Q1 (2000–) | 250 m | — |
| **Lluvia y temperatura del aire** | NASA POWER | ~50 km | Respaldo inmediato, sin cuenta |
| **Agua subterránea** | GRACE / GLDAS | 28–300 km | Solo tendencia regional, no por colonia |
| **Relieve (video 3D)** | NASADEM | 30 m | — |

# Equipo y roles

Seis integrantes, el máximo permitido.

| **Rol** | **Responsabilidad** |
| --- | --- |
| **Carlos (líder)** | Coordinación, contacto con expertos locales, pitch y video |
| **Alexys** | Datos y estadística en Python |
| **Carrega** | Web, mapa, gráficas y publicación |
| **Arte** | Diseño de la interfaz e iconos |
| **3D (Carlos)** | Relieve de La Paz para el video y la portada |
| **Samuel** | Video, narración y revisión de textos |

**Herramientas de IA:** Claude, Codex, Tripo3D y ElevenLabs. Su uso se declara en la presentación, como piden las reglas.

# Plan del fin de semana

|  |  |  |
| --- | --- | --- |
| **Sáb 20:00**  4 pantallas con datos reales | **Dom 12:00**  Congelar funciones | **Dom 17:00**  Entrega del proyecto |

El horario también está en la hoja [<u>Horarios Space Apps La Paz</u>](https://claude.ai/artifact/QToaF7cMWAU1nHoDAXh1Wr). Las metas críticas van resaltadas.

| **Día** | **Hora** | **Responsable** | **Actividad** |
| --- | --- | --- | --- |
| Viernes 13 | 14:30 | Carlos | Mandar al grupo: llamada a las 18:00 y enlace al enunciado del reto |
| Viernes 13 | 14:30–16:30 | Carlos | Escribir a Cómo Vamos La Paz, CIBNOR y UABCS (horario de oficina). Confirmar las 4 preguntas en la página oficial |
| Viernes 13 | 15:00–17:30 | Prog. A | Crear cuenta de NASA Earthdata y proyecto de Google Earth Engine; pedir datos de La Paz (MODIS temperatura y NDVI, 2001 a la fecha) |
| Viernes 13 | 15:00–17:30 | Prog. B | Crear el repo en GitHub; probar NASA POWER con coordenadas de La Paz |
| Viernes 13 | 15:00–17:30 | Arte | Paleta de colores y estilo |
| Viernes 13 | 15:00–17:30 | 3D | Conseguir el modelo de elevación de La Paz (NASADEM) |
| Viernes 13 | 15:00–17:30 | Audio | Leer el enunciado y anotar los requisitos de entrega |
| Viernes 13 | 18:00–19:00 | Todos | Llamada: discurso, dudas y confirmación de roles |
| Viernes 13 | 19:00–21:00 | Prog. A | Esqueleto del análisis (Mann-Kendall estacional) con los datos que ya hayan llegado |
| Viernes 13 | 19:00–21:00 | Prog. B | Web base con datos de prueba, publicada en GitHub Pages |
| Viernes 13 | 19:00–21:00 | Arte | Bocetos de las 4 pantallas |
| Viernes 13 | 19:00–21:00 | Carlos | Primer borrador del guion del pitch |
| Viernes 13 | 21:00 | Todos | Revisión de 10 minutos: qué quedó listo y qué falta |
| Viernes 13 | 22:00 | Todos | Preparar mochila (laptop, cargador, extensión, audífonos, celular para la demo, agua, snacks) y dormir |
| Sábado 14 | 06:45 | Todos | Llegar a UABCS, Edificio de Humanidades |
| Sábado 14 | 07:00–08:00 | Carlos | Inauguración; preguntar la rúbrica local y la hora límite de entrega |
| Sábado 14 | 08:00–09:00 | Todos | Tablero de tareas; todos compilan el proyecto |
| Sábado 14 | 09:00–14:00 | Todos | Prog. A: tendencias con datos reales. Prog. B: mapa y fichas. Arte: interfaz. 3D: terreno. Audio: textos y video del proceso |
| Sábado 14 | 14:00–15:00 | Todos | Comida y checkpoint |
| Sábado 14 | 15:00–20:00 | Prog. A y B | Conectar los datos reales a la web |
| **Sábado 14** | **20:00** | **Todos** | **META: las 4 pantallas funcionando con datos reales** |
| Sábado 14 | 20:00–22:00 | Todos | Corrección de bugs; luego a descansar |
| Domingo 15 | 07:00–12:00 | Todos | Pulido, textos y pantalla "¿Qué hago?" |
| **Domingo 15** | **12:00** | **Todos** | **CONGELAR FUNCIONES: solo se corrigen bugs** |
| Domingo 15 | 12:00–15:00 | Prog. B + Audio | Versión final; grabar la demo |
| Domingo 15 | 15:00–17:00 | Carlos + Audio | Editar el video; ensayar el pitch 3 veces |
| **Domingo 15** | **17:00–18:00** | **Carlos** | **ENTREGA** |
| Domingo 15 | 18:00–21:00 | Todos | Margen y presentación ante el jurado |

# Convocatoria y reglas

* **Convocatoria oficial:** [<u>NASA Space Apps Challenge 2026</u>](https://www.spaceappschallenge.org/2026/). El enunciado completo del reto está en Challenges → Be An Earth System Trend Detective!
* **Sede local:** [<u>La Paz, México</u>](https://www.spaceappschallenge.org/2026/local-events/la-paz-mexico/?tab=details), UABCS, Edificio de Humanidades.
* **Reglas clave:** equipos de 1 a 6; usar principalmente datos abiertos de la NASA; resolver un reto oficial; declarar el uso de IA en la presentación; participación gratuita.
* **Pendiente:** confirmar con la sede la rúbrica local y la hora límite de entrega.