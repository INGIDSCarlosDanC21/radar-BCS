# Demo draft (English) — Radar BCS, team OptiPaz

<!--
Nota interna (español): borrador de la demo. Se elige UNA opción: diapositivas (máx. 7, la portada cuenta) o video (máx. 30 s, subtítulos en inglés). Solo un enlace público en la entrega.
Reglas de la guía: la demo es de lo primero que ven los jueces globales. Debe incluir nombre del equipo, integrantes y reto; una imagen del proyecto; la experiencia del usuario; y cómo los datos abiertos y la tecnología de agencias espaciales hacen posible la solución.
Todo lo marcado [FILL] depende de resultados reales que Luca/Diego aún no entregan: NO inventes números. Completa solo con salidas verificadas de `analisis/`.
Menor de 18: un integrante del equipo es menor de edad y NO puede aparecer, nombrarse ni oírse (ni en el video, ni en la narración, ni en capturas); la narración la hace otra persona.
IA: imágenes o video generados llevan marca de agua visible "AI-generated"; la voz generada (ElevenLabs) se declara en docs/entrega/05-use-of-ai.md. Sin logos ni marca de la NASA. Sin menores de 18.
-->

Pitch line (use in both options): **"Radar BCS turns NASA satellite data into answers for every neighbor in La Paz."**

## Option A — Slide deck (7 slides, title slide included)

**Slide 1 — Title**
- Radar BCS: what is changing in La Paz, told with NASA data
- Team OptiPaz · NASA Space Apps Challenge 2026 · La Paz, Mexico
- Challenge: *Be An Earth System Trend Detective!*
- Team members: Diego Careaga Celis, Carlos Daniel Castro Ochoa, Luca Alexander Reinaga Genesta, Ehileen Rocha Garcia, Roberto Vega Hernandez *(confirm everyone is registered in the platform and appears on the Members tab)*
- Visual: Radar BCS logo.

**Slide 2 — The local problem**
- Heat and water are daily concerns in La Paz, Baja California Sur.
- The information that explains how they are changing lives in technical reports and specialist platforms, not in residents' hands.
- [FILL: one or two local figures, only after each has a verified source — see `docs/investigacion/contexto-local.md`; cite the source on the slide]

**Slide 3 — Our solution (project screenshot)**
- A free, Spanish-language website for phones. No install, no account.
- Pick a variable and your zone; see the change since 2001.
- Visual: **real screenshot of the live app** at https://ingidscarlosdanc21.github.io/radar-BCS/ [FILL: replace placeholder page with real screen].

**Slide 4 — Four questions, four screens**
- *What is changing?* Heat, vegetation, rainfall, groundwater.
- *Where?* A map of La Paz zones with the most change.
- *How much?* Total change since 2001 and by decade.
- *Is it significant?* A trend test shows how sure we are, in plain language.
- Plus: *What can I do?* Simple actions for heat and water.

**Slide 5 — How NASA data makes it possible**
- Land surface temperature and vegetation: MODIS (MOD11A2, MOD13Q1).
- Rainfall and air temperature: NASA POWER.
- Groundwater trend (regional): GRACE / GLDAS.
- Method: Mann-Kendall trend test and Sen's slope on time series for La Paz. [FILL: final list of datasets actually used]
- We state each dataset's limits (for example, regional resolution) on the screen itself.

**Slide 6 — Local impact: what a neighbor sees**
- Walkthrough of one real example: [FILL: variable, zone, change, significance — copy exactly from the app output].
- A "what can I do" tip tied to that result, shareable by WhatsApp.
- Honest by design: we show **what changed, not why**. A trend does not prove its cause.

**Slide 7 — What's next and credits**
- Next: more zones and variables, and the same method for other Mexican cities.
- Links: project (GitHub Pages) and code (GitHub, Apache-2.0).
- Credits: NASA open data (MODIS, NASA POWER, GRACE/GLDAS). This project is not endorsed by NASA.
- AI disclosure: AI tools helped with code, documentation and drafting; AI-generated media carries a visible "AI-generated" mark (details in the project submission).

## Option B — 30-second video (English subtitles required)

Target about 65 words at a calm pace. The video may be narrated in Spanish, but English subtitles are mandatory; narrating in English avoids the risk.

| Time | On screen | Narration |
|---|---|---|
| 0:00 | Team name + logo | "We are OptiPaz, from La Paz, Mexico." |
| 0:03 | Short local shot or map of La Paz | "Heat and water shape our daily life, but the data explaining the change is out of reach." |
| 0:09 | App home screen on a phone | "Meet Radar BCS: NASA satellite data, made simple, on any phone." |
| 0:14 | Map + zone fact card (real screen) | "Pick your zone. See what changed since 2001, where, by how much, and whether it is statistically significant." |
| 0:23 | "What can I do?" screen | "Then get simple actions for heat and water." |
| 0:27 | Logo + link | "Radar BCS. Open NASA data for our community." |

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
4. Local site deadline: the lead notes say **local submissions close Sunday 12:00**, earlier than the platform's 11:59 p.m. Confirm and plan the recording for Saturday night or Sunday morning.
