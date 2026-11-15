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

Radar BCS is a free website for phones, with no installation, available in Spanish and English, for the residents of La Paz, Baja California Sur, Mexico. It uses open NASA data to show how four things have changed in La Paz since 2001: heat, vegetation, rainfall and groundwater. It is built to answer the four questions of the "Be An Earth System Trend Detective!" challenge, one screen at a time:

| Question | Screen | How it answers |
|---|---|---|
| What is changing? | 1. Home | Four cards: heat, vegetation, rainfall and water. The user picks a variable. |
| Where is it changing? | 2. Map | Zones of La Paz with the most change. |
| How much is it changing? | 3. Fact sheet | Total change since 2001 and change by decade. |
| Is the change statistically significant? | 3. Fact sheet | Seasonal Mann-Kendall test and Sen's slope (rainfall: Mann-Kendall on annual totals; water: seasonal test corrected for autocorrelation). |
| (Extra) What can I do? | 4. Actions | Tips to protect yourself from heat and to save water. |

Every number on the site shows its data source. The site shows what changed, not why. A trend does not prove its cause, and we do not claim one.

To make the numbers easy to read, the site also has a few interactive aids. None of them adds a new result: they use the same series or NASA imagery.

- **See La Paz from space (Map screen):** real MODIS Terra photos from NASA GIBS, one per year (2001-2026, taken in April), in true color or as ground heat, with a year slider and a Play button. It is one photo per year, not a trend.
- **Travel through time (Details screen):** a year slider over the real yearly series of each indicator, with a plain-language sentence. For heat and vegetation, where the trend is clear, it can also extend the Sen's-slope line to 2035; this is shown with a dashed style, labeled "not a forecast", and it does not say why anything changes. Rainfall (no clear trend) and water (regional, not the aquifer) are not extended.
- **The sky now in BCS (Home screen):** current sky conditions and temperature of eight places from the Open-Meteo weather model (not weather stations), next to a near-real-time NOAA GOES-West satellite image served by NASA GIBS. **This section is current context, not a trend.** It is not one of our results, it is not used to claim causes, and the trend results above do not depend on it.
- **Fishing Map (Fishing screen):** a map of icons for eight ports of Baja California Sur with waves, wind or sea temperature from the Open-Meteo marine model (about 9 km, not buoys), an hour control with a "Start simulation" button that plays the hours of the day, and four short tiles (sea state, sea conditions, coastal wind, chlorophyll). The chlorophyll layer is NASA satellite imagery (VIIRS NOAA-20, served by NASA GIBS). The sea state is green, yellow or red from the Douglas and Beaufort scales; **it is a model estimate, not an official warning or a port flag**.
- **Alerts (Alerts screen):** automatic notices computed from the same model for the next 24 hours (waves, wind, rain, thunderstorms and UV), each with its level, zone and time, the two farming notices already audited on the Farming Map, and links to the official sources (SMN, NHC, CENAPRED, SEMAR, CONAPESCA). **Model notices are not official**; when there is none, the screen says so.

<!-- Nota interna: las metas de 'What do you hope to achieve' son una propuesta de Claude (tomadas de la diapositiva 7 de 08-demo-draft.md); Carlos confirma o cambia. Vegetacion con los numeros de data/salida/ en dev (PR #84, 2001-2026); web/data/ debe copiarse igual antes de enviar. Calor: Carlos eligio la opcion B el 2026-11-15 (principal = aire +1.47 C 2001-2025; superficie MODIS 2001-2021 como no concluyente porque Aqua no confirma a Terra; ver docs/decisiones.md). -->
<!-- Nota interna: resultados del pipeline de Luca (data/salida/indicadores.json y zonas_tendencias.json, 2026-11-14), revisados por Investigacion en docs/investigacion/hallazgos.md. Si algun numero cambia, cambiarlo aqui. Investigacion reprodujo las salidas de MODIS con los CSV de Drive; la baja de la superficie en El Centenario y Sur depende de la prueba y de los ultimos anios (hallazgos.md), por eso no se interpreta. -->

Results so far (2001-2025 unless noted; NASA POWER is a single grid cell about 50 km wide around La Paz; MODIS is six sample points in and around the city):

- **Air temperature (NASA POWER), the main heat figure on the site:** rose by about 0.06 °C per year, roughly 1.5 °C in total (Sen's slope over the period; an estimate, not a measurement). The change is statistically significant (p < 0.001).
- **Land surface temperature (MODIS, daytime, average of six points): inconclusive.** Terra shows a rise of about 0.9 °C over 2001-2021 (+0.94 °C, Sen's slope; p = 0.0003). But Aqua, a second MODIS satellite that passes in the afternoon, shows no clear change over a similar period (2003-2021: +0.27 °C, p = 0.29, against +1.04 °C for Terra), and the observation time of both satellites drifts from 2022 (Terra earlier in the morning, Aqua later in the afternoon). The two satellites do not confirm each other, so the heat card leads with the air temperature and shows the surface only as an inconclusive result, without a headline figure. We cut the Terra series in 2021 because from 2022 its mean local pass time falls from about 10.8 h to 9.2 h in 2026 (MOD11A2 Day_view_time field), which makes the surface drop artificially. We do not claim to know the cause; this is the most likely explanation, not proven.
- **Vegetation (MODIS NDVI, average of six points, 2001-2026; 2026 is a partial year):** fell by about 0.013 NDVI units, which is statistically significant (p = 0.004). Some months have no valid reading at urban points, so this is a rough picture, not a measurement of the whole city.
- **Rainfall (NASA POWER):** varies a lot from year to year, and no clear change is detected in the annual total (p = 0.13, not significant). Not detecting a change does not prove there is none.
- **Water (NASA GRACE and GRACE-FO, JPL Mascon CRI RL06.3Mv04, 2002-2026):** total water stored in the region (soil, surface water and aquifers together) rose by about 1.4 cm of water equivalent, a statistically significant change (p = 0.009, seasonal Mann-Kendall with a correction for autocorrelation; 2026 is a partial year). The satellite sees hundreds of kilometers at once, so this describes the region, **not the La Paz aquifer**.
- **Zones of La Paz with the most change:** six sample points only (Centro, Chametla, El Centenario, Oriente, Sur, Surponiente), each drawn as the 1 km MODIS pixel that contains it, not full neighborhood polygons. Vegetation shows a number at all six points (a statistically significant decrease at four, and a small increase at Oriente and Sur); heat by zone comes from the Terra surface series (a rise at four points, Centro, Chametla, Oriente and Surponiente, and no clear change at El Centenario and Sur) and is shown with a note that Aqua does not confirm the surface trend, so it is indicative only; rainfall and water are measured at regional scale, so the map has no zones for them.

## How does it work?

1. We take long time series of NASA data for La Paz (see the NASA Data section). The datasets used are MODIS land surface temperature (MOD11A2) and vegetation index (MOD13Q1, NDVI), downloaded for six points in La Paz with NASA AppEEARS, and NASA POWER rainfall and air temperature, and NASA GRACE and GRACE-FO (JPL Mascon) water storage.
2. We turn them into monthly or seasonal series for the region and for zones of the city, and plot them.
3. We measure the rate of change with Sen's slope.
4. We test significance with the seasonal Mann-Kendall test. This test looks for a steady upward or downward trend while taking the yearly seasonal cycle into account. For rainfall we apply the Mann-Kendall test to annual totals, and for water we correct for autocorrelation between months.
5. The website shows the result in plain language, including when a trend is not significant: those are reported as "no clear change detected", without a number.

Limits we state on the site:

- MODIS land surface temperature has 1 km resolution, so one pixel covers several neighborhoods. We use six sample points, not the whole city, and we drop readings flagged as low quality, so some months are missing at some points.
- GRACE water storage (hundreds of km) only gives a regional trend, not a trend by neighborhood, and it does not say how much water the La Paz aquifer holds.
- NASA POWER (about 50 km) is coarse for a single city.
- A trend shows what changed, not why.
- The Fishing and Alerts screens are model estimates for the next hours, not trends and not official warnings; the thresholds come from published scales (`docs/investigacion/umbrales-mar.md`).
- "The sky now in BCS" is current context from a weather model, not a trend and not a measurement from weather stations; it is not used to answer the challenge's questions.
- Rainfall and air temperature have 25 years of data (2001-2025). Urban NDVI points lose many months after quality filtering (up to 175 months at one point), which makes their trend less reliable.
- Air temperature (2001-2025) is the main heat figure. MODIS surface temperature (2001-2021) is inconclusive: Terra and Aqua disagree and the pass time of both drifts. We report both and say so.

## What benefits does it have?

- Puts information that today sits in technical reports and specialist data portals in the hands of residents, in simple language and on a phone.
- Free, open, and needs no account or installation. It can be shared with just a link.
- Shows how sure we are about each change, not only the change itself.
- Gives simple actions for heat and water at the end of the visit.

## What do you hope to achieve?

We hope residents of La Paz can see for themselves what has changed around them, how certain that change is, and what they can do about it. The target audience is the general public of La Paz, not only specialists. Next steps we would like to take: update the data every year, add more zones of the city, and apply the same method to other cities of Baja California Sur.

## Tools, coding languages, hardware and software

- Data access: NASA Earthdata AppEEARS (MODIS), the NASA POWER API, and NASA Earthdata / PO.DAAC (GRACE and GRACE-FO).
- Analysis: Python with the open-source libraries `pymannkendall` (trend tests), `numpy`, `requests`, `netCDF4` (reading the GRACE files) and `scipy`, with `pytest` for tests.
- Website: plain HTML, CSS and JavaScript (no build step) with the Leaflet 1.9.4 map library and OpenStreetMap tiles, and hand-made SVG charts, published on GitHub Pages.
- Code and coordination: Git and GitHub. Large files (datasets, video, 3D, audio) are kept on Google Drive.
- AI tools used during development: see the Use of AI section.
- License of our project: Apache-2.0.
- Hardware: no special hardware; everything was built on the team members' own computers: an ASUS TUF Gaming A16 laptop; a desktop PC (Ryzen 5700X, NVIDIA RTX 3060 12 GB, 32 GB RAM); an Acer Aspire A515 laptop; a Lenovo LOQ 15IAX9 laptop; an Acer Nitro AM515-58 laptop; and an HP 245 G8 notebook. The analysis (Python) does not need a GPU, and the site is static (GitHub Pages), so no servers, sensors or microcontrollers were used. The site was checked in desktop browsers at phone width (360 px). TODO: once it has been opened on a real phone (issue #71), add the phone model and browser here; until then, do not claim phone testing.
