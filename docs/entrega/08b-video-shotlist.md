# Video de 30 segundos: guion y lista de tomas (versión del 2026-11-15)

Reemplaza la tabla de la opción B de `08-demo-draft.md`, que se escribió antes de Pesca, Avisos, el Mapa Meteorológico y "Mira La Paz desde el espacio". Narración en español con **subtítulos en inglés quemados en el video** (la plataforma pide inglés escrito). Si preferimos evitar el riesgo, se narra en inglés.

**Línea de apertura de la entrega:** "Radar BCS turns NASA open data into answers for every resident of La Paz."

## Guion (unas 62 palabras en español, unos 26 s a ritmo calmado, 4 s de margen)

| Tiempo | En pantalla (grabación de la web, 390 px) | Narración (ES) | Subtítulo (EN) |
|---|---|---|---|
| 0:00 | Tarjeta de título: "Radar BCS · OptiPaz · Be An Earth System Trend Detective!" | "Somos OptiPaz, de La Paz." | "We are OptiPaz, from La Paz." |
| 0:03 | **Inicio:** las 4 tarjetas (calor, vegetación, lluvia, agua) | "Radar BCS: datos de la NASA para cada vecino." | "Radar BCS: NASA data for every resident." |
| 0:07 | **Ficha de calor:** cifra del aire y la prueba estadística; "Viaja en el tiempo" un instante | "El aire subió casi un grado y medio desde 2001, y mostramos qué tan seguros estamos." | "Air temperature rose about 1.5 °C since 2001, and we show how sure we are." |
| 0:13 | **Ficha de vegetación** y luego **Ficha de agua** con la palabra "regional" a la vista | "La vegetación bajó. El agua regional subió, pero no mide nuestro acuífero." | "Vegetation declined. Regional water rose, but it does not measure our aquifer." |
| 0:19 | **Mapa:** cielo en vivo con íconos y luego "Mira La Paz desde el espacio" (fotos de la NASA año por año); un vistazo a **Pesca** con "modelo, no oficial" | "Hoy: cielo en vivo, fotos de la NASA y el mar, con estimaciones, no avisos oficiales." | "Today: live sky, NASA photos and the sea, as estimates, not official warnings." |
| 0:26 | Enlace de la web en texto + "Datos: NASA MODIS · POWER · GRACE · GIBS" (solo texto) | "Qué cambió, no por qué. Radar BCS." | "What changed, not why. Radar BCS." |

Todas las cifras salen de `data/salida/indicadores.json` y `docs/investigacion/hallazgos.md` (calor del aire +1.47 °C, 2001-2025). **No decir:** por qué subió el calor, que la superficie se calentó (los dos satélites no coinciden), que hay más agua local o que el acuífero se recupera, ninguna causa (urbanización, cambio climático), ni que se probó en un celular real hasta que el issue #71 lo confirme.

## Cómo grabar

1. **Cuándo:** de día (después de las 07:00), para que los íconos del mapa sean de sol y no de luna; con la web pública (https://ingidscarlosdanc21.github.io/radar-BCS/) ya actualizada con `main`.
2. **Cómo:** grabación de pantalla del celular o de Chrome con el modo de celular a 390 × 844. Una toma por fila de la tabla, de 3 a 6 segundos, sin cursor visible y sin notificaciones.
3. **Idioma de la web:** la grabación va con la web en español; los subtítulos en inglés se agregan en la edición.
4. **Antes de grabar:** abrir cada pantalla una vez para que carguen los datos en vivo (cielo, mapa y Pesca) y confirmar que aparecen cifras, no "sin dato".

## Lista de producción

- [ ] Subtítulos en inglés quemados, legibles en un celular.
- [ ] Solo imágenes propias o libres: la web, el logo y las fotos de NASA GIBS; todo recurso está en `docs/RECURSOS.md` y `docs/entrega/07`.
- [ ] Sin logos, banderas ni parches de la NASA. NASA solo se menciona en texto.
- [ ] **Sin menores de 18:** nadie aparece, se nombra o se oye (incluida la narración y los créditos). Quien narre debe ser mayor de edad y estar de acuerdo con que NASA use su voz en relación con el material.
- [ ] Si el logo (generado con Gemini) sale en pantalla, queda declarado en `05` y en la descripción del video ("logo generated with AI (Gemini)"), según la regla de `docs/FUENTES-Y-IA.md`.
- [ ] Sin voz sintética; si se usa, declararla en `05` y en el campo de IA de la plataforma.
- [ ] Duración de 30 s o menos (contar con el cronómetro, no a ojo).
- [ ] Enlace público, probado con una ventana sin sesión iniciada.
