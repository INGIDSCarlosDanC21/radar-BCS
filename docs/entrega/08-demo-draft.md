# Demo draft (English) — Radar BCS, team OptiPaz

<!--
Nota interna (español): borrador de la demo. Se elige UNA opción: diapositivas (máx. 7, la portada cuenta) o video (máx. 30 s, subtítulos en inglés). Solo un enlace público en la entrega.
Reglas de la guía: la demo es de lo primero que ven los jueces globales. Debe incluir nombre del equipo, integrantes y reto; una imagen del proyecto; la experiencia del usuario; y cómo los datos abiertos y la tecnología de agencias espaciales hacen posible la solución.
Todo lo marcado [FILL] depende de resultados reales que Luca/Diego aún no entregan: NO inventes números. Completa solo con salidas verificadas de `analisis/`.
Menor de 18: un integrante del equipo es menor de edad y NO puede aparecer, nombrarse ni oírse (ni en el video, ni en la narración, ni en capturas); la narración la hace otra persona.
IA: imágenes o video generados llevan marca de agua visible "AI-generated"; si se agrega voz generada, se declara en docs/entrega/05-use-of-ai.md (hasta ahora se usaron Claude Code y Google Stitch). Sin logos ni marca de la NASA. Sin menores de 18.
-->

Pitch line (use in both options): **"Radar BCS turns NASA open data into answers for every resident of La Paz."**

## Option A — Slide deck (7 slides, title slide included)

**Slide 1 — Title**
- Radar BCS: what is changing in La Paz, told with NASA data
- Team OptiPaz · NASA Space Apps Challenge 2026 · La Paz, Mexico
- Challenge: *Be An Earth System Trend Detective!*
- Visual: Radar BCS logo.

**Slide 2 — The local problem**
- Heat and water are daily concerns in La Paz, Baja California Sur.
- The information that shows how they are changing lives in technical reports and specialist data portals, not in residents' hands.
- [FILL: one or two local figures, only after each has a verified source — see `docs/investigacion/contexto-local.md`; cite the source on the slide]

**Slide 3 — Our solution (project screenshot)**
- A free, Spanish-language website for phones. No install, no account.
- Pick a variable and see what changed since 2001 (2002 for water); the Weather map shows 38 places of the state.
- Visual: **real screenshot of the live app** at https://ingidscarlosdanc21.github.io/radar-BCS/ [FILL: replace placeholder page with real screen].

**Slide 4 — Four questions, four screens**
- *What is changing?* Heat, vegetation, rainfall, regional water storage.
- *Where?* A map of 38 places of Baja California Sur (air heat and rainfall) and six zones in La Paz (vegetation).
- *How much?* Total change since 2001 and by decade.
- *Is it significant?* A trend test shows how sure we are, in plain language.
- Plus: *What can I do?* Simple actions for heat and water, inside the Weather screen.

**Slide 5 — How NASA data makes it possible**
- Land surface temperature and vegetation: MODIS (MOD11A2, MOD13Q1).
- Rainfall and air temperature: NASA POWER.
- Regional water storage trend: GRACE and GRACE-FO (JPL Mascon).
- Method: Mann-Kendall trend test and Sen's slope on time series for La Paz.
- We state each dataset's limits (for example, regional resolution) on the screen itself.

**Slide 6 — Local impact: what a neighbor sees**
- Walkthrough of one real example (copy from the app screen): vegetation, average of six points in La Paz, fell by about 0.013 NDVI units in 2001-2026 (2026 partial), statistically significant (p = 0.004). Source: MODIS MOD13Q1.
- A "what can I do" tip next to that result.
- Honest by design: we show **what changed, not why**. A trend does not prove its cause.

**Slide 7 — What's next and credits**
- Next: more zones and variables, and the same method for other Mexican cities.
- Links: project (GitHub Pages) and code (GitHub, Apache-2.0).
- Credits: NASA open data (MODIS, NASA POWER, GRACE/GRACE-FO). This project is not endorsed by NASA.
- AI disclosure: Claude Code helped with code, documentation and drafting, and Google Stitch helped design the interface; AI-generated media carries a visible "AI-generated" mark (details in the project submission).

## Option B — 30-second video (English subtitles required)

> **Actualizado el 2026-11-15:** el guion vigente (con Mapa Meteorológico, "Mira La Paz desde el espacio", Pesca y Avisos) está en [`08b-video-shotlist.md`](08b-video-shotlist.md). La tabla de abajo es la versión anterior.

About 60 spoken words (about 24 s at a calm pace, 6 s of margin). Narrated in Spanish with burned-in English subtitles, or narrated in English to avoid the risk. Use only these numbers (all from `data/salida/indicadores.json` or `docs/investigacion/hallazgos.md`); say what changed and how sure we are, never why.

| Time | On screen | Narration (ES) | Subtitle (EN) |
|---|---|---|---|
| 0:00 | Team name + "Be An Earth System Trend Detective!" | "Somos OptiPaz, de La Paz." | "We are OptiPaz, from La Paz." |
| 0:03 | Phone: Home with the four cards | "Radar BCS: datos de la NASA, explicados para cada vecino." | "Radar BCS: NASA data, explained for every resident." |
| 0:07 | Heat sheet (air first, surface inconclusive) | "El aire subió 1.47 grados. La superficie, vista por satélite, no da una respuesta clara." | "Air temperature rose 1.47 °C. Satellite surface temperature is not conclusive." |
| 0:13 | Vegetation sheet or map | "La vegetación bajó, y es significativo." | "Vegetation declined, a statistically significant trend." |
| 0:17 | Water sheet with the word "regional" | "El agua regional subió, pero no mide nuestro acuífero." | "Regional water storage rose, but it does not measure our aquifer." |
| 0:22 | Actions screen | "Qué cambió y qué tan seguro es; no por qué." | "What changed and how sure we are, not why." |
| 0:26 | Link + "Data: NASA MODIS · POWER · GRACE" (text only) | "Radar BCS: datos abiertos para La Paz." | "Radar BCS: open data for La Paz." |

Do not say: why heat rose, that the surface warmed (the two satellites disagree), that there is more water or the aquifer is recovering, or any cause (urbanization, climate change). Do not claim it was tested on a real phone until issue #71 is done.

Production checklist for the video:
- [ ] Subtitles burned in (English), readable on a phone.
- [ ] Only footage we own or CC0; list every asset in `docs/RECURSOS.md`.
- [ ] No NASA logos, flags or mission patches. Credit NASA data in text only.
- [ ] Visible "AI-generated" mark on any generated image or video; synthetic voice declared in the Use of AI field.
- [ ] Nobody under 18 appears or is heard.
- [ ] Public link, tested while logged out.

## Why this scores (judging criteria)

- **Impact:** a real local problem, solved for residents, aimed at the Local Impact Award.
- **Creativity:** takes expert-only information to a phone, with guided examples.
- **Validity:** correct trend test, limits of each dataset stated, works on a phone.
- **Relevance:** NASA data is the core of every number shown, with its source.
- **Presentation:** one clear story in 30 seconds or 7 slides; give it as much care as the other four.

## Open items before recording

1. Real results from `analisis/` and real screens from `web/` (issues #7, #9, #11).
2. Decide slides or video (video is faster to watch for judges; slides are easier to edit).
3. Verify every local statistic and cite it, or leave it out.
4. Deadline: the official platform deadline is **Sunday 23:59** (confirmed by Carlos). The team aims to submit by 13:00 to leave time to practice before the 17:00 judging. Plan the recording for Saturday night or Sunday morning.
