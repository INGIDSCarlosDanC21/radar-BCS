# Video de 30 segundos: guion y lista de tomas (versión del 2026-11-15, tarde)

Reemplaza la versión de la mañana. **Decisión de Carlos (2026-11-15): pantalla + voz sintética de ElevenLabs, nadie en cámara.** Narración **en inglés** (los jueces oyen y leen inglés) con **subtítulos en inglés quemados**, idénticos a la voz. El brief para quien arme el video está en [`08c-brief-video.md`](08c-brief-video.md).

**Una sola historia:** el problema local → qué cambió (con honestidad sobre lo que no sabemos) → dónde → qué es de hoy y qué no → cierre. Responde las 4 preguntas del reto (qué, dónde, cuánto, ¿significativo?) sin enseñar todas las pantallas.

**Línea de apertura de la entrega:** "Radar BCS turns NASA open data into answers for every resident of La Paz."

## Guion (64 palabras en inglés, unos 25 s a ritmo calmado, 5 s de margen)

| Tiempo | En pantalla (grabación de la web pública, 390 × 844) | Narración (EN, voz de ElevenLabs) y subtítulo (EN, igual) |
|---|---|---|
| 0:00 | Tarjeta de título "Radar BCS · OptiPaz" y luego **Inicio** con las 4 tarjetas (calor, vegetación, lluvia, agua) | "In La Paz, heat, water and the sea touch everyone. Radar BCS turns NASA data into answers." (17) |
| 0:06 | **Ficha de Calor:** cifra del aire (+1.5 °C) y el "p < 0.001" a la vista | "Air temperature rose about 1.5 degrees since 2001, a statistically significant change." (12) |
| 0:12 | **Ficha de Lluvia** ("no se detecta cambio claro") | "Where we are unsure, we say it: rainfall shows no clear change." (12) |
| 0:17 | **Mapa de zonas** con los pines por estado | "The map shows where, across six zones." (7) |
| 0:21 | **Clima** (4 tarjetas) y un vistazo a **Pesca** con la pastilla "modelo, no oficial" | "Today's sea and weather are model estimates, not official warnings." (10) |
| 0:26 | Texto: enlace de la web + "Data: NASA POWER · MODIS · GRACE · GIBS" | "What changed, not why. Radar BCS." (6) |

**Texto fijo en pantalla durante todo el video (pequeño, arriba): "AI-generated voice (ElevenLabs)."** Cumple la regla de la Guía de envío (videos generados con marca visible) y se repite en la descripción del video.

Las cifras salen de `data/salida/indicadores.json` y `docs/investigacion/hallazgos.md` (aire +1.47 °C, 2001-2025, p < 0.001; lluvia p = 0.129, no significativa). **No decir:** por qué subió el calor, que la superficie se calentó (Terra y Aqua no coinciden), que hay más agua local o que el acuífero se recupera, ninguna causa (urbanización, cambio climático), que los avisos del modelo son oficiales, ni que se probó en un celular real hasta que el issue #71 lo confirme.

## Alternativas si algo falla

- **ElevenLabs no disponible o rechazado:** el mismo texto lo narra un integrante **mayor de 18** que acepte que NASA use su voz; entonces se quita la línea "AI-generated voice" y se corrige `05` y `docs/RECURSOS.md`.
- **No alcanza el tiempo para armar el video:** 7 diapositivas (máx., contando portada) con las mismas ideas; el campo de demo acepta un enlace a las diapositivas.

## Cómo producirlo

1. **Quién hace qué:** Carlos crea la voz en su cuenta de ElevenLabs con el texto de la tabla (columna de narración) y descarga el audio; otro Claude arma el video con el brief `08c` (tomas, subtítulos, medición); Carlos lo sube a un enlace público.
2. **Cuándo grabar la pantalla:** de día (después de las 07:00) para que los íconos del cielo sean de sol; con el sitio público ya actualizado con `main`.
3. **Cómo:** Chrome en modo celular 390 × 844, español de la web, sin cursor visible ni notificaciones, una toma por fila de la tabla. Se pueden usar `?lang=en` para que la pantalla coincida con el inglés de la voz.
4. **Antes de grabar:** abrir cada pantalla una vez para que carguen los datos en vivo y confirmar que aparecen cifras, no "sin dato".

## Lista de producción

- [ ] Subtítulos en inglés quemados, legibles en un celular, idénticos a la voz.
- [ ] Línea fija visible "AI-generated voice (ElevenLabs)" y lo mismo en la descripción del video.
- [ ] Solo imágenes propias o libres: la web y el logo; todo recurso está en `docs/RECURSOS.md` y `docs/entrega/07`.
- [ ] Sin logos, banderas ni parches de la NASA. NASA solo se menciona en texto.
- [ ] **Sin menores de 18:** nadie aparece, se nombra o se oye (créditos incluidos).
- [ ] Si el logo (generado con Gemini) sale en pantalla, conserva su marca "AI-generated"; está declarado en `05`.
- [ ] ElevenLabs declarado en `05`, en `docs/RECURSOS.md` y marcado en el campo de IA de la plataforma.
- [ ] Duración de 30 s o menos (medida con cronómetro o con la herramienta de edición, no a ojo).
- [ ] Enlace público, probado con una ventana sin sesión iniciada.
