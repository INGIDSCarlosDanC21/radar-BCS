# Project Details

<!--
Requirement (literal, from "Components of Project"):
"Provide additional details about your project. Some questions to consider:
- What exactly does it do?
- How does it work?
- What benefits does it have?
- What do you hope to achieve?
- What tools, coding languages, hardware, or software did you use to develop your project?"
-->

<!-- Nota interna: este borrador no usa cifras locales. Desde el 2026-11-14 varias ya tienen fuente leida (docs/investigacion/contexto-local.md); si se agregan, respetar los matices de ese archivo y citar la fuente. La frase "Hirsch-Slack correction" se retiro el 2026-11-14 porque pymannkendall.seasonal_test no implementa Hirsch-Slack completo (docs/investigacion/metodo.md); no volver a ponerla. Todo lo que dependa de resultados queda TODO. -->

## What exactly does it do?

Radar BCS is a free website for phones, with no installation, written in Spanish for the residents of La Paz, Baja California Sur, Mexico. It uses open NASA data to show how four things have changed in La Paz since 2001: heat, vegetation, rainfall and groundwater. It is built to answer the four questions of the "Be An Earth System Trend Detective!" challenge, one screen at a time:

| Question | Screen | How it answers |
|---|---|---|
| What is changing? | 1. Home | Four cards: heat, vegetation, rainfall and water. The user picks a variable. |
| Where is it changing? | 2. Map | Zones of La Paz with the most change. |
| How much is it changing? | 3. Fact sheet | Total change since 2001 and change by decade. |
| Is the change statistically significant? | 3. Fact sheet | Seasonal Mann-Kendall test and Sen's slope. |
| (Extra) What can I do? | 4. Actions | Tips to protect yourself from heat and to save water. |

Every number on the site shows its data source. The site shows what changed, not why. A trend does not prove its cause, and we do not claim one.

<!-- Nota interna: resultados PRELIMINARES de NASA POWER, reproducidos por el Lider (docs/investigacion/hallazgos.md, issue #5). Actualizar con el pipeline final de Luca antes de enviar; si algun numero cambia, cambiarlo aqui. -->

Results so far (preliminary, NASA POWER monthly data, one point of about 50 km around La Paz, 2001-2025):

- **Air temperature:** rose by about 0.06 °C per year, roughly 1.5 °C in total (a linear estimate, not a measurement). The change is statistically significant (p < 0.001).
- **Rainfall:** varies a lot from year to year, and no clear change is detected (not statistically significant). Not detecting a change does not prove there is none.
- Vegetation, land surface temperature and groundwater: TODO (waiting for the MODIS and GRACE/GLDAS analysis).
- Zones of La Paz with the most change: TODO (needs the 1 km MODIS data; NASA POWER cannot tell zones apart).

## How does it work?

1. We take long time series of NASA data for La Paz (see the NASA Data section). The planned datasets are MODIS land surface temperature and vegetation index (NDVI), NASA POWER rainfall and air temperature, and GRACE/GLDAS groundwater.
2. We turn them into monthly or seasonal series for the region and for zones of the city, and plot them.
3. We measure the rate of change with Sen's slope.
4. We test significance with the seasonal Mann-Kendall test. This test looks for a steady upward or downward trend while taking the yearly seasonal cycle into account.
5. The website shows the result in plain language, including when a trend is not significant. A trend that is not significant is still reported honestly, without exaggeration.

Limits we state on the site:

- MODIS land surface temperature has 1 km resolution, so one pixel covers several neighborhoods.
- ECOSTRESS (70 m) has irregular dates, so it gives a snapshot of heat by neighborhood, not a trend.
- GRACE/GLDAS groundwater (28-300 km) only gives a regional trend, not a trend by neighborhood.
- NASA POWER (about 50 km) is coarse for a single city.
- A trend shows what changed, not why.
- Whether the series are long enough for every variable: TODO

## What benefits does it have?

- Puts information that today sits in technical reports and platforms in the hands of residents, in simple language and on a phone.
- Free, open, and needs no account or installation. It can be shared by messaging apps.
- Shows how sure we are about each change, not only the change itself.
- Gives simple actions for heat and water at the end of the visit.

## What do you hope to achieve?

We hope residents of La Paz can see for themselves what has changed around them, how certain that change is, and what they can do about it. The target audience is the general public of La Paz, not only specialists. TODO: add any follow-up goals the team agrees on.

## Tools, coding languages, hardware and software

- Data access: NASA Earthdata AppEEARS or Google Earth Engine; NASA POWER.
- Analysis: Python with the open-source libraries `pymannkendall` (trend tests), `numpy` and `requests`.
- Website: web front end with a map and charts, published on GitHub Pages. TODO: list the exact libraries once the code is final.
- Code and coordination: Git and GitHub. Large files (datasets, video, 3D, audio) are kept on Google Drive.
- AI tools used during development: see the Use of AI section.
- License of our project: Apache-2.0.
- Hardware: TODO (confirm what was used for development and testing).
