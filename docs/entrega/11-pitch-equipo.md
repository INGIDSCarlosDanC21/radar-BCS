# Pitch del equipo OptiPaz: 8 minutos, 6 voces

Para la evaluación local ante el jurado de La Paz. Sustituye el reparto de `10-pitch-10min.md` (que era casi todo del Líder) por **seis oradores con relevos**. Mismos números, mismas reglas, otro tono: más cercano y más de aquí.

**Idea que el jurado debe llevarse:** *Radar BCS pone en manos de cualquier paceño lo que hoy vive en reportes técnicos, y dice con honestidad qué cambió, qué tan seguros estamos y qué no sabemos. Mostramos qué cambió, no por qué.*

## Cómo leer este guion

- Lo que va en `>` es lo que se **dice en voz alta**. Lo que va entre corchetes `[ ]` es **indicación** (pausa, respiración, gesto, diapositiva): no se dice.
- Conteo de palabras: solo el texto hablado, sin corchetes. Ritmo de referencia: **130 palabras por minuto** (≈2.17 palabras por segundo).
- Diapositivas: las de `presentacion/` (6 partes, `DISENO.md`). "Avanza" = el orador o quien maneja pulsa la flecha; la entrada animada (`data-animacion`) se dispara sola al llegar.
- Los ejemplos de la vida diaria van **siempre** con "imagina…": son escenarios, no datos (`eventos-extremos.md`, sección final).
- Fuentes de cada cifra: `docs/investigacion/eventos-extremos.md`, `contexto-local.md` y `hallazgos.md`; lugares y celdas en `docs/decisiones.md` y `04-project-details.md`.

## Tiempos

| # | Parte | Orador | Tiempo | Palabras objetivo | Palabras reales | Tiempo hablado a 130 ppm |
|---|---|---|---|---|---|---|
| 1 | El gancho | Ehileen (UI/UX) | 0:00-0:50 (0:50) | ~105 | 100 | ≈0:46 |
| 2 | Problema y reto | Roberto (UI/UX) | 0:50-2:00 (1:10) | ~150 | 146 | ≈1:07 |
| 3 | Solución + datos de la NASA | Carlos (Líder) | 2:00-3:10 (1:10) | ~150 | 150 | ≈1:09 (justo; no agregar nada) |
| 4 | Demostración | Diego (web) | 3:10-5:40 (2:30) | ≤190 | 189 (11 al presentar el video + 178 en la web) | video 0:30 + ≈1:22 hablado en 2:00 de web (el resto son toques y pausas) |
| 5 | Impacto y escalabilidad | Integrante 6 | 5:40-6:50 (1:10) | ~150 | 142 | ≈1:06 |
| 6 | Cierre | Luca (datos) + todos | 6:50-7:30 (0:40) | ~85 | 81 | ≈0:37 (incluye el coro) |

Total hablado: 808 palabras (≈6:13) + 0:30 de video. Margen real: unos 30 s repartidos en pausas y toques de pantalla. **Total: 7:30, con 30 s de colchón para llegar a 8:00.**

> Ojo: los conteos se hicieron con un script sobre este archivo (palabras separadas por espacios en las líneas `>`, sin corchetes). Cifras como "41.8" o "p = 0.129" cuentan como 1-3 palabras pero se tardan más en decir: por eso cada bloque queda un poco por debajo del objetivo.

---

## 1. EL GANCHO · Ehileen · 0:00-0:50

**Objetivo:** captar la atención y situar el problema. **Voz:** cálida, pausada, mirando al público. Es quien diseñó la cara de la web: habla de personas, no de números.

**Diapositiva 1/6 · GANCHO.** Al empezar: fondo oscuro con viento y grano, solo "Radar BCS". Al decir "Odile": aparece la `cifra` grande **10,000** (contador sube 1.4 s) y debajo la `fuente` "NHC, Tropical Cyclone Report, Odile (2014)".

> Levanten la mano si alguna vez han guardado agua en cubetas antes de una tormenta. [pausa 2 s, mirar a la sala, bajar la mano]
>
> Septiembre de 2014. Odile entra como huracán categoría 3 junto a Cabo San Lucas. [avanza: cifra 10,000] Aquí, en La Paz, según el Centro Nacional de Huracanes, hasta diez mil personas se quedaron sin hogar. [respira, 1 s]
>
> Eso lo recordamos todos. Lo que casi nadie ve es lo que cambia despacio, año con año, sin hacer ruido.
>
> Imagina a tu abuela, un mediodía de julio, decidiendo si sale al patio. Ella vive aquí desde siempre, y dice que antes no hacía tanto calor. [pausa corta] ¿Tiene razón?
>
> [voltea hacia Roberto] Roberto, ¿qué dicen los datos?

**Frase de relevo:** "Roberto, ¿qué dicen los datos?"

**Dato verificado:** Odile, cat. 3, tocó tierra "just to the east of Cabo San Lucas"; "up to 10,000 inhabitants were left homeless" en La Paz (TCR del NHC, basado en prensa). **No decir** que golpeó La Paz de frente ni que las muertes fueron en La Paz.

---

## 2. PROBLEMA Y RETO · Roberto · 0:50-2:00

**Objetivo:** conectar el dolor real con el desafío de la NASA. **Voz:** directa, un poco más rápida, de "esto ya está pasando".

**Diapositiva 2/6 · PROBLEMA.** Al entrar: `titulo` y una sola `tarjeta` naranja (`.calor`) con **+41.8 %** y su `fuente`. Al decir "Cuatro preguntas": `rejilla` de 4 tarjetas que entran escalonadas: ¿Qué cambia? · ¿Dónde? · ¿Cuánto? · ¿Es significativo?

> Algo sí está cambiando. Y no es solo una sensación. [pausa 1 s]
>
> Este año, en Baja California Sur, las enfermedades por calor subieron 41.8 % frente a 2025. Es la cifra de todo el estado, según El Congresista. [respira]
>
> Imagina el camión de las tres de la tarde. Tú, sin sombra, esperando. Y en la noche, una casa donde el ventilador ya no alcanza.
>
> La información existe. Pero vive en reportes y portales técnicos, hechos para especialistas. No llega a quien espera ese camión. [pausa]
>
> Por eso tomamos el reto de la NASA: ser detectives de las tendencias de la Tierra. [avanza: rejilla de 4] Cuatro preguntas. ¿Qué cambia? El aire, el suelo y el agua. ¿Dónde? En Baja California Sur. ¿Cuánto? De 2001 a 2026. ¿Es significativo? Para el calor, sí. Y cuando no lo es, como en la lluvia, también lo decimos.
>
> [voltea hacia Carlos] Carlos, ¿cómo se lo pusimos en la mano a todos?

**Frase de relevo:** "Carlos, ¿cómo se lo pusimos en la mano a todos?"

**Dato verificado:** +41.8 % de enfermedades por calor en BCS en 2026 respecto a 2025 (El Congresista, 27 oct 2026, cifra **estatal**). **No** dar estimado para La Paz ni mezclar con las 7 defunciones en la misma frase.

---

## 3. SOLUCIÓN + DATOS DE LA NASA · Carlos · 2:00-3:10

**Objetivo:** presentar el proyecto y validar su base científica. **Voz:** segura, de líder, con frases cortas. Es quien defiende la ciencia ante el jurado.

**Diapositiva 3/6 · SOLUCIÓN.** `columnas texto-captura`: a la izquierda el `telefono` con la captura de Inicio. Al nombrar cada dataset entra su `chip-dato` (MODIS · NASA POWER · GRACE/GRACE-FO · GIBS). Al decir "Mann-Kendall": cae el `sello` verde "Mann-Kendall + Sen". Sin logos de la NASA.

> En la mano, y gratis. [pausa]
>
> Esto es Radar BCS: una página web gratuita, sin instalar nada, en español y también en inglés.
>
> Abajo, un menú sencillo: Inicio, Clima, Pesca, Agro y Avisos. Y dentro de Clima, Acciones: qué puede hacer cada quien contra el calor y para cuidar el agua. Nuestro propósito es uno: que la información técnica, que hoy llega a pocos, llegue a todos. [respira]
>
> ¿Los números? Datos abiertos de la NASA. [chips, uno por nombre] MODIS, para la vegetación. NASA POWER, para el aire y la lluvia. GRACE y GRACE-FO, para el agua, a escala regional. Y GIBS, para las imágenes de satélite.
>
> Para el aire: 300 meses seguidos, de 2001 a 2025, sin un hueco. [sello] Cada tendencia pasa por Mann-Kendall estacional y la pendiente de Sen: cuánto cambió y qué tan seguros estamos.
>
> Imagina al pescador que, antes de salir, revisa el mar en su teléfono.
>
> [voltea hacia Diego] Diego, enséñales cómo se ve.

**Frase de relevo:** "Diego, enséñales cómo se ve."

**Dato verificado:** NASA POWER mensual 2001-2025, 300 meses, ninguno faltante (`hallazgos.md`). **No decir** que la prueba "demuestra la causa" ni nombrarla "Hirsch-Slack".

---

## 4. DEMOSTRACIÓN · Diego · 3:10-5:40

**Objetivo:** que el jurado vea la web funcionando y entienda lo importante aunque nunca la use. **Voz:** práctica, de quien la construyó; dice poco y deja que hable la pantalla.

**Diapositiva 4/6 · DEMO.** Primero el **tráiler** (29 s, voz sintética en inglés, subtítulos en inglés). Luego cambia a la **web en vivo** proyectada (navegador con la versión publicada, ya abierta en Inicio y con caché cargada). Respaldo si falla internet: capturas en `telefono` (`assets/capturas/*.png`), una por parada.

### 4a. Tráiler · 3:10-3:40

> Primero, treinta segundos. La voz es sintética y está en inglés.

[clic en reproducir · 29 s de video · no hablar encima · al terminar, cambiar a la web en vivo]

### 4b. Web en vivo · 3:40-5:40 (4 paradas cronometradas)

**Parada 1 · 3:40-4:10 · Inicio → tarjeta Calor**
[pantalla: Inicio con las 4 tarjetas · tocar Calor · señalar la cifra y el sello]

> Esto es Inicio: calor, vegetación, lluvia y agua. Toco Calor. [toca] El aire en La Paz subió 1.47 grados de 2001 a 2025. [señala el sello] Y este sello dice p menor a 0.001: estadísticamente significativo. Es un cambio medido, no una sensación.

**Parada 2 · 4:10-4:40 · Lluvia**
[pantalla: regresar a Inicio · tocar Lluvia · señalar "sin cambio claro"]

> Ahora la lluvia. [toca] Aquí la web es honesta: no se detecta un cambio claro, p igual a 0.129. [pausa 1 s] No inventamos una tendencia que los datos no muestran. Eso también es información.

**Parada 3 · 4:40-5:15 · Clima: mapa de 38 lugares**
[pantalla: menú inferior → Clima · bajar a "Cómo ha cambiado cada lugar" · alternar Calor / Lluvia]

> En Clima está el mapa de 38 lugares de Baja California Sur. [muestra Calor] El calor del aire subió en los 38. [cambia a Lluvia] La lluvia, solo en 8 lugares de Los Cabos. Ojo: varios lugares comparten la misma celda de datos, de unos 50 kilómetros, y la pantalla lo avisa.

**Parada 4 · 5:15-5:40 · Agua regional + Acciones y Avisos**
[pantalla: opción Agua (una sola cifra regional) · bajar a Acciones · menú inferior → Avisos]

> La opción Agua es regional: el satélite GRACE mide cientos de kilómetros. No es el acuífero de La Paz, y lo decimos. [baja] Abajo, Acciones: qué hacer hoy. [toca Avisos] Y en Avisos, alertas del modelo. No son oficiales; aquí están los enlaces a las fuentes oficiales. [voltea al público]
>
> Esto es lo que hay hoy. Lo que sigue te lo cuenta el más joven del equipo.

**Frase de relevo:** "Esto es lo que hay hoy. Lo que sigue te lo cuenta el más joven del equipo." (Diego **no** dice el nombre.)

**Datos verificados:** +1.47 °C (POWER, p < 0.001); lluvia p = 0.129; 38 lugares en 21 celdas, calor subió en los 38, lluvia aumento claro solo en 8 lugares de Los Cabos (`decisiones.md`, `04-project-details.md`); GRACE regional, no acuífero; avisos del modelo no oficiales.

---

## 5. IMPACTO Y ESCALABILIDAD · Integrante 6 · 5:40-6:50

**Objetivo:** el futuro fuera del hackatón. **Voz:** primera persona, sencilla, de joven de La Paz que habla a su gente. En el repo y en las diapositivas el orador figura **solo como "Integrante 6"** (regla 7: ni nombre, ni foto, ni voz grabada de menores).

**Diapositiva 5/6 · IMPACTO.** Al entrar: `display` corto "No se acaba hoy". Al decir "Lo que sigue": `rejilla-3` de `tarjeta acento` escalonadas: **Escuelas** · **Revisión local** · **Otras ciudades**. Al decir "90 %": la cifra con su `fuente` (Forest Trends, 2024).

> Yo soy de aquí. En 2023, con Norma, cerraron el puerto de La Paz. Esas cosas se ven venir. Lo que cambia despacio, no. [pausa 1 s]
>
> Y hay algo que muchos no saben: La Paz toma el 90 % de su agua de un solo acuífero. [respira]
>
> Imagina a la familia que, antes de una tormenta, no sabe si el arroyo va a bajar. Quizá tú nunca abras Radar BCS. Pero alguien en tu casa, sí.
>
> Esto no se acaba cuando termine el hackatón. [avanza: 3 tarjetas] Lo que sigue: queremos llevarlo a las escuelas, para que un maestro lo abra en clase. Queremos que expertos de aquí lo revisen y nos corrijan. Y como los datos de la NASA que usamos cubren todo el planeta, el mismo método puede servir para Loreto, Mulegé o cualquier otra ciudad. El código es abierto: cualquiera puede usarlo.
>
> [voltea hacia Luca] Luca, dilo tú.

**Frase de relevo:** "Luca, dilo tú."

**Dato verificado:** "La Paz toma 90 % de su agua del acuífero de La Paz" (Forest Trends, 2024). Norma: "Conditions forced the port in La Paz to close" (TCR del NHC). Las metas son **planes**, no logros: decir "queremos", nunca "ya estamos en escuelas". Licencia Apache-2.0 (código abierto).

---

## 6. CIERRE · Luca + todos · 6:50-7:30

**Objetivo:** una frase que se quede. **Voz:** Luca lento y firme; el lema lo dice **todo el equipo a la vez** (Integrante 6 incluido en el coro solo si el equipo lo decide; no se graba).

**Diapositiva 6/6 · CIERRE.** `zona centro`, una frase en `display`: "Mostramos qué cambió, no por qué." Debajo, solo el enlace de la web. Nada más.

> Un huracán se ve venir en el cielo. El calor, no: llega despacio, año con año. [pausa 1 s]
>
> Con datos de la NASA les mostramos 1.47 grados más en el aire de La Paz, de 2001 a 2025. No les decimos por qué. Les decimos qué cambió, y qué tan seguros estamos. [respira]
>
> Imagina que la próxima vez que tu abuela dude en salir al patio, la respuesta ya esté en su mano. [pausa 2 s; el equipo da un paso al frente]
>
> [todos, a la vez] Radar BCS. Mostramos qué cambió, no por qué.
>
> [Luca] Gracias. Somos OptiPaz.

**Frase final (memorable):** "Mostramos qué cambió, no por qué."

**Dato verificado:** +1.47 °C, aire, NASA POWER 2001-2025, p < 0.001.

---

## Tabla de una página

| # | Min | Orador | Diapositiva | Dato verificado | Escenario ("imagina…") | Frase de relevo / transición |
|---|---|---|---|---|---|---|
| 1 | 0:00-0:50 | Ehileen | 1/6 Gancho: cifra 10,000 | Odile 2014, cat. 3 junto a Cabo San Lucas; hasta 10,000 sin hogar en La Paz (NHC) | La abuela que decide si sale al patio | "Roberto, ¿qué dicen los datos?" |
| 2 | 0:50-2:00 | Roberto | 2/6 Problema: +41.8 % y 4 preguntas | +41.8 % enfermedades por calor en BCS, 2026 vs 2025 (estatal) | El camión de las 3 pm | "Carlos, ¿cómo se lo pusimos en la mano a todos?" |
| 3 | 2:00-3:10 | Carlos | 3/6 Solución: teléfono, chips, sello | 300 meses de NASA POWER sin hueco; Mann-Kendall estacional + Sen | El pescador antes de salir | "Diego, enséñales cómo se ve." |
| 4 | 3:10-5:40 | Diego | 4/6 Demo: tráiler 0:30 + web en vivo 2:00 | +1.47 °C p < 0.001 · lluvia p = 0.129 · 38 lugares/21 celdas · GRACE regional | (la propia demo) | "Esto es lo que hay hoy. Lo que sigue te lo cuenta el más joven del equipo." |
| 5 | 5:40-6:50 | Integrante 6 | 5/6 Impacto: 3 tarjetas | 90 % del agua de un solo acuífero; Norma cerró el puerto | La familia y el arroyo | "Luca, dilo tú." |
| 6 | 6:50-7:30 | Luca + todos | 6/6 Cierre: lema | +1.47 °C de 2001 a 2025 | La abuela, otra vez | "Mostramos qué cambió, no por qué." |

**Colchón:** 0:30 (7:30 → 8:00). Si el tráiler no suena, Diego lo salta y la demo empieza 30 s antes; no se rellena.
**Ensayo:** dos pasadas con el cronómetro de `deck.js` (tecla **T**). Si una parte se pasa, se recorta su escenario, nunca el dato ni la frase de relevo.

## Frases que NO decir

- "Odile / Norma / Olaf golpeó La Paz de frente." (Odile y Norma tocaron tierra junto a Cabo San Lucas; Olaf junto a San José del Cabo; Lorena en La Ventana, cerca de La Paz, no en la ciudad.)
- "Odile mató a once personas en La Paz." (11 muertes directas en total; 8 en todo BCS.)
- "Norma llegó como categoría 4." (Fue cat. 1 al tocar tierra.) / "Hubo muertos en BCS por Norma u Olaf." (El NHC dice que no.)
- "Kay golpeó La Paz con fuerza." (Hubo inundaciones de ríos en el municipio y cierres de la carretera 1 cerca de La Paz; el impacto mayor fue en Mulegé.)
- Cualquier cifra de daños de Lorena, o Hilary, Lidia o John como eventos de La Paz.
- "En La Paz las enfermedades por calor subieron X %." (Solo la cifra **estatal**.) / Mezclar +41.8 % con las 7 defunciones en una frase.
- "El calor sube por culpa de…", "por el cambio climático", "por la urbanización", "por la falta de árboles". (Regla 2: qué cambió, no por qué.)
- "El acuífero de La Paz está subiendo / bajando según la NASA." (GRACE es regional, no es el acuífero.)
- "La lluvia está aumentando en La Paz." (p = 0.129, sin cambio claro; el aumento claro es solo en 8 lugares de Los Cabos.)
- "Nuestros avisos son alertas oficiales." (Son del modelo; las oficiales están enlazadas.)
- "Lo probamos en un celular real." / "Ya funciona en escuelas." / "Ya lo usan pescadores." (No verificado; son planes o escenarios.)
- "El satélite mide la temperatura de cada colonia." (POWER son celdas de ~50 km; las 6 zonas de MODIS son puntos de muestra.)
- "La superficie se enfrió desde 2022." (Es efecto probable de la hora de paso del satélite; el resultado de superficie es no concluyente.)
- "Hasta 10,000 muertos / damnificados" dicho como dato oficial mexicano. (Es "hasta 10,000 sin hogar", según el NHC con base en prensa.)
- El nombre real de Integrante 6, en voz, diapositiva o notas.
- Cualquier mención o imagen de logos de la NASA.
