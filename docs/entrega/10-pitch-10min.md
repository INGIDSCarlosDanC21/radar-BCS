# Pitch de 10 minutos ante el jurado local: guion, demo y respuestas

Para la evaluación local del domingo (hora por confirmar con el Local Lead; el plan decía 17:00). **No es el demo de la plataforma** (ese es el video de 30 s, `08b`). Es la exposición en vivo, en español, con los mismos números y las mismas reglas.

**Una sola idea que el jurado debe recordar:** *Radar BCS pone en el celular de cada vecino lo que hoy vive en reportes técnicos, y dice con honestidad qué cambió, qué tan seguros estamos y qué no sabemos.*

**Criterios que se califican (1-5 cada uno):** Impact, Creativity, Validity, Relevance, Presentation. Cada bloque de abajo dice cuál sirve.

## Reglas del pitch (de `AGENTS.md`)

- Solo cifras de `data/salida/` y `docs/investigacion/` (regla 1). Nada inventado.
- **Qué cambió, no por qué** (regla 2). No decir urbanización, cambio climático ni ninguna causa.
- **Sin menores:** quien abra la documentación no habla ni sale en pantalla ni se nombra (regla 7).
- Sin logos NASA; NASA solo en texto (regla 6). La voz del tráiler es sintética y está declarada.
- No decir "probado en celular real" hasta cerrar el issue #71.

## Línea de tiempo (10:00 en total)

| Min | Bloque | Quién habla (propuesta, Carlos decide) | Pantalla | Criterio |
|---|---|---|---|---|
| 0:00-0:45 | 1. Gancho | Líder | Diapositiva 1 (título) | Presentation |
| 0:45-2:00 | 2. El problema local | Líder | Diapositiva 2 | Impact |
| 2:00-3:00 | 3. El reto y la solución | Líder | Diapositiva 3 | Relevance |
| 3:00-6:30 | 4. Demo en vivo (4 paradas) | Programador B maneja; Líder narra | Celular proyectado | Creativity, Validity |
| 6:30-7:45 | 5. La ciencia y la honestidad | Programador A (datos) | Diapositiva 4 | Validity |
| 7:45-8:45 | 6. Datos NASA e IA declarada | UI/UX o Programador A | Diapositiva 5 | Relevance |
| 8:45-9:30 | 7. Impacto y siguientes pasos | Líder | Diapositiva 6 | Impact |
| 9:30-10:00 | 8. Cierre | Líder | Diapositiva 7 (enlace) | Presentation |

Ritmo: unas 130 palabras por minuto. El guion completo (demo incluida) suma unas 990 palabras, cerca de 7.5 minutos hablados; el resto son pausas y toques en pantalla de la demo, con unos 40 segundos de margen. **Ensayar con cronómetro dos veces y recortar el bloque 6 si pasa de 10:00.**

## Diapositivas (7, para el fondo; la estrella es la demo)

Diseño (skills `rol-ui-ux` y `ui-ux-pro-max`): un mensaje por diapositiva, texto grande (mínimo 28 pt), contraste AA, tokens de color y tipografía de `web/css/`, sin viñetas largas, sin logos NASA, el logo de Radar BCS solo en título y cierre. Capturas reales de la web, no maquetas.

1. **Título:** logo, "Radar BCS", "Equipo OptiPaz · NASA Space Apps 2026 · La Paz", y el reto *Be An Earth System Trend Detective!*.
2. **El problema:** tres números grandes con fuente chica debajo: 21 vs 37 (acuífero), +41.8 % (enfermedades por calor, estatal), 90 % (agua de un solo acuífero).
3. **Cuatro preguntas, cuatro respuestas:** ¿Qué cambia? ¿Dónde? ¿Cuánto? ¿Es significativo? con la pantalla que la responde, y "¿Qué hago?" como extra.
4. **Cómo sabemos que es cierto:** Mann-Kendall estacional + pendiente de Sen, α = 0.05, y una columna "Lo que NO decimos".
5. **De dónde sale cada número:** MODIS, NASA POWER, GRACE/GRACE-FO, GIBS, con los límites de cada uno; abajo, las herramientas de IA declaradas.
6. **Impacto:** para quién es, qué cambia en su día, qué sigue.
7. **Cierre:** el enlace grande (`https://ingidscarlosdanc21.github.io/radar-BCS/`) y un código QR, "Qué cambió, no por qué."

## Guion

### 1. Gancho (0:00-0:45)

> Buenas tardes. Somos OptiPaz, de La Paz.
>
> Hagan la pregunta que se hace cualquier vecino: ¿mi ciudad se está calentando? ¿Qué pasa con el agua? Hoy esa respuesta existe, pero vive en reportes técnicos y en portales para especialistas.
>
> Nosotros la pusimos en el celular de cada vecino. Esto es **Radar BCS**: datos abiertos de la NASA, explicados en lenguaje sencillo, gratis y sin instalar nada.
>
> En diez minutos les mostramos qué cambió en La Paz desde 2001, qué tan seguros estamos y qué puede hacer cada quien.

*(Opcional: abrir con el tráiler de 29 s en lugar de este bloque, si hay sonido. Su voz es sintética y está declarada en `05`. Si se usa, saltar a "Esto es Radar BCS".)*

### 2. El problema local (0:45-2:00)

> El problema es local y es real.
>
> La Paz toma el 90 % de su agua de un solo acuífero. Según CONAGUA, en el Diario Oficial de 2023, ese acuífero recibe 21 millones de metros cúbicos al año y se le extraen 37.
>
> Y el calor ya llega a los hospitales. Según El Congresista, con datos de la Secretaría de Salud, las enfermedades por calor en Baja California Sur subieron 41.8 % este año respecto al anterior, y Zeta reporta siete defunciones por temperaturas extremas. Son cifras de todo el estado, no solo de La Paz.
>
> Y hay un hueco: en un taller sobre agua en La Paz, los participantes señalaron como desafío el escaso entendimiento público del sistema hídrico. La información existe, pero no está en manos de quien vive el cambio.
>
> Ese es el hueco que cubre Radar BCS.

*Fuentes: `docs/investigacion/contexto-local.md` (cifras verificadas el 2026-11-14). Si preguntan por el "13 millones" de otros reportes: la cifra oficial es la del DOF; no mezclar las dos fuentes en una frase. No usar el 47 % de fugas ni el número de manzanas.*

### 3. El reto y la solución (2:00-3:00)

> El reto de la NASA nos pide ser detectives de tendencias de la Tierra, y responder cuatro preguntas: **qué cambia, dónde, cuánto, y si ese cambio es estadísticamente significativo.**
>
> Nuestra respuesta es una pantalla por pregunta. Inicio dice qué cambia: calor, vegetación, lluvia y agua. El mapa dice dónde: 38 lugares de Baja California Sur. La ficha dice cuánto desde 2001, y qué tan seguros estamos. Y una pregunta más, que el reto no pide pero el vecino sí: ¿qué hago con esto?
>
> Les voy a enseñar cómo se ve en un teléfono.

### 4. Demo en vivo (3:00-6:30)

**Antes de empezar:** teléfono o Chrome en 390 × 844 con la web pública abierta, datos en vivo cargados (abrir cada pantalla una vez), brillo alto, modo no molestar. **Quien maneja no habla; quien narra no toca.** Todo en español; `?lang=en` queda para preguntas.

**Parada 1: Inicio → Calor (0:50).**
> Esto es Inicio: cuatro tarjetas. Toco Calor. El aire en La Paz subió unos 1.5 grados entre 2001 y 2025, y la prueba estadística dice que es un cambio real: significativo, p menor a 0.001. Fuente: NASA POWER.
>
> Y aquí viene algo que casi nadie hace: la temperatura de la superficie que mide el satélite MODIS la dejamos como **no concluyente**, porque dos satélites MODIS no coinciden. Preferimos decirlo antes que fingir certeza.

**Parada 2: Lluvia (0:40).**
> En lluvia, la respuesta honesta es: no se detecta un cambio claro. Varía mucho de un año a otro. No detectar un cambio no prueba que no exista, y la pantalla lo dice. Aquí no mostramos ningún número, porque no hay uno que defender.

**Parada 3: Clima, mapa de 38 lugares (1:10).**
> ¿Dónde? Este mapa tiene 38 lugares de Baja California Sur. El calor del aire subió en los 38, entre unos 0.6 y 1.5 grados. La lluvia solo muestra un aumento claro en ocho lugares de la zona de Los Cabos; en el resto, dice "sin cambio claro".
>
> Un detalle de honestidad: la fuente tiene celdas de unos 50 kilómetros, así que lugares cercanos comparten cifra. Los 38 lugares caen en 21 celdas, y la página lo dice.
>
> *(Buscar "Chametla" en el buscador; mostrar la vegetación de las 6 zonas.)* En la ciudad, la vegetación bajó un poco en promedio en seis puntos de La Paz, y es significativo, aunque en dos zonas subió. Son seis puntos, no la ciudad entera, y también lo decimos.

**Parada 4: Agua y qué hago (0:50).**
> En agua, el satélite GRACE ve que el agua almacenada en la región subió. Pero ve cientos de kilómetros a la vez: esto **no es el acuífero de La Paz**, y la pantalla lo dice en grande.
>
> Y bajando en Clima: tarjetas de qué hacer contra el calor y para cuidar el agua. Más abajo, un vistazo de Pesca y Avisos: son estimaciones de un modelo, con la etiqueta "no oficial", y enlazan a las fuentes oficiales: SMN, CENAPRED y SEMAR.

### 5. La ciencia y la honestidad (6:30-7:45)

> Para quien se pregunta cómo sabemos que es cierto: usamos la prueba de Mann-Kendall estacional y la pendiente de Sen, con un nivel de significancia de 0.05. La primera pregunta si hay una tendencia sostenida; la segunda, de qué tamaño. Donde la prueba no la ve, no publicamos número.
>
> Nuestro equipo de investigación reprodujo las cifras por su cuenta con otros métodos, y los resultados coincidieron para el aire. Donde el resultado depende del método, como en la superficie, lo reportamos como no concluyente.
>
> Y la regla que nos define: **mostramos qué cambió, no por qué.** Una tendencia no prueba su causa. No vamos a decirles que el calor subió por tal cosa, porque nuestros datos no lo demuestran.

### 6. Datos NASA e IA declarada (7:45-8:45)

> Cada cifra trae su fuente. Del calor de superficie y la vegetación: MODIS. De lluvia y temperatura del aire: NASA POWER. Del agua: GRACE y GRACE-FO. Las fotos de La Paz año por año y las nubes en movimiento: NASA GIBS. Todo es abierto.
>
> Usamos inteligencia artificial y lo declaramos: Claude Code para código y documentación, Gemini para el logotipo, Google Stitch para el diseño de la interfaz, y una voz sintética de ElevenLabs en el tráiler. Todo está en el repositorio, abierto, con licencia Apache 2.0.
>
> Los datos en vivo de clima y mar vienen de un modelo, no de estaciones, y la web lo dice en cada pantalla.

### 7. Impacto y siguientes pasos (8:45-9:30)

> Esto es para el vecino, no para el especialista. Alguien de Chametla puede abrir un enlace, ver qué cambió cerca de su casa y qué hacer hoy.
>
> Lo que sigue: actualizar los datos cada año, sumar más zonas de la ciudad y más variables, como lluvia por satélite y humedad del suelo, y aplicar el mismo método a otras ciudades de Baja California Sur.

### 8. Cierre (9:30-10:00)

> Radar BCS convierte datos abiertos de la NASA en respuestas para cada vecino de La Paz.
>
> Qué cambió, qué tan seguros estamos, y qué podemos hacer. No por qué.
>
> Gracias. El enlace está en pantalla; pueden abrirlo ahora mismo en su celular.

## Preguntas probables y respuestas (preparar con todo el equipo)

| Pregunta | Respuesta corta y verdadera |
|---|---|
| ¿Por qué subió el calor? | No lo sabemos y no lo afirmamos. Mostramos qué cambió; una tendencia no prueba la causa. |
| ¿Los datos son locales? | NASA POWER es un reanálisis de celdas de unos 50 km; MODIS son 6 puntos de 1 km. Lo decimos en cada pantalla. No es una estación. |
| ¿Por qué la superficie no es concluyente? | Terra sube +0.94 °C (2001-2021), pero Aqua, el otro satélite MODIS, no ve cambio claro, y la hora de paso de ambos se mueve desde 2022. Preferimos no afirmar. |
| ¿El agua subió, entonces el acuífero se recupera? | No. GRACE ve la región completa (suelo, superficie y acuíferos juntos). No mide el acuífero de La Paz; ahí la cifra oficial es de CONAGUA: recibe 21 y se extraen 37 millones de m³ al año. |
| ¿Qué tan confiable es el clima y el mar de hoy? | Es un modelo (Open-Meteo, ~9 km en mar), no estaciones ni boyas. No es aviso oficial; enlazamos SMN, CENAPRED y SEMAR. |
| ¿Qué usaron de IA? | Claude Code (código, documentación y revisión), Gemini (logotipo), Google Stitch (diseño de interfaz) y ElevenLabs (voz del tráiler). Todo declarado en el proyecto y en `docs/FUENTES-Y-IA.md`. Los números salen de los datos y de pruebas reproducibles, no de la IA. |
| ¿Cómo prueban que funciona en celular? | Se probó en navegadores a 360 px; la prueba en teléfono real sigue pendiente (issue #71). *No decir más que eso hasta cerrarla.* |
| ¿Qué la hace diferente de los portales NASA? | Responde las cuatro preguntas del reto, en español y en inglés, con la confianza estadística explicada en una frase, y con acciones concretas. |
| ¿Quién la mantiene? | Código abierto (Apache 2.0); el análisis se corre con un comando (`python -m analisis...`) y los datos se actualizan cada año. |
| ¿Por qué solo 6 puntos de vegetación? | Fue la cobertura que pudimos descargar y validar a tiempo. Es el primer paso; el siguiente es ampliar zonas. |
| ¿Los comentarios de los vecinos? | No hay entrevistas todavía; no afirmamos nada en nombre de nadie. |

## Plan B (si algo falla)

- **Sin internet:** capturas de las 4 paradas en una carpeta del celular y en una diapositiva de respaldo; el tráiler de 29 s guardado en local (video en Drive, `docs/DRIVE.md`).
- **El celular no proyecta:** laptop con Chrome en 390 × 844; mismo orden de paradas.
- **Un dato en vivo dice "sin dato":** seguir con la ficha (que usa series locales) y decir "este bloque es contexto de hoy de un modelo; aquí falló la conexión".
- **Se acaba el tiempo:** recortar en este orden: bloque 6 (resumir en 20 s), parada 4 (solo agua), parada 3 (sin vegetación).

## Ensayo y lista antes de pasar al frente

- [ ] Ensayo 1 con cronómetro; ensayo 2 con alguien que no conozca el proyecto.
- [ ] Cada persona sabe su bloque y quién maneja el celular.
- [ ] Sitio público abierto sin sesión y con datos cargados; plan B probado.
- [ ] Respuestas de la tabla leídas por todos (sobre todo "¿por qué?" y "¿es el acuífero?").
- [ ] Nadie menor de 18 aparece ni habla; la documentación la abre quien Carlos indique, fuera de cámara.
- [ ] Entrega ya enviada en la plataforma (esto va después del "Submit for Judging").
