# NASA Data

<!--
Requirement (literal, from "Components of Project"):
"Suggested NASA data is provided for each of the challenges under the "Resources" tab. At least one NASA resource from the Challenge is required for global awards!
What NASA data did you use in your project? Provide links to all resources used."

Also from "Project Submission": "How did you use it? How did it inspire your project?"
-->

<!-- Nota interna (2026-11-15): se agregaron las 3 capas de NASA GIBS que usa la web (Terra, GOES-West y clorofila VIIRS); las tres tambien estan en 07 con su detalle tecnico. Enlaces comprobados el 2026-11-14 (todos responden HTTP 200 y el titulo de cada pagina coincide con el producto). Usados de verdad (2026-11-14): NASA POWER, MODIS MOD11A2, MODIS MOD13Q1, AppEEARS y GRACE/GRACE-FO (JPL Mascon, agregado el mismo dia; GLDAS NO se uso). NO usados hasta ahora: GLDAS, ECOSTRESS y NASADEM; quedaron fuera de la tabla. Si se llegan a usar, agregar su fila con el enlace de abajo: GRACE/GLDAS https://gracefo.jpl.nasa.gov/ y https://ldas.gsfc.nasa.gov/gldas ; ECOSTRESS https://ecostress.jpl.nasa.gov/ ; NASADEM https://lpdaac.usgs.gov/products/nasadem_hgtv001/ . No se declara nada que no se haya usado. Giovanni y Hydrology Time Series estan en docs/referencia/reto-earth-system-trend-detective.md como recursos del reto, pero no estan previstos: agregarlos solo si se usan. Para premios globales hay que usar al menos un recurso NASA del reto. -->

All are open and free. Everything listed here was used.

| Dataset | Link | How we used it |
|---|---|---|
| MODIS MOD11A2 v061 (land surface temperature, 1 km, 8-day) | https://lpdaac.usgs.gov/products/mod11a2v061/ (DOI 10.5067/MODIS/MOD11A2.061) | Daytime land surface temperature at six points in La Paz, 2001-2021, shown as an inconclusive result next to the air temperature (Terra and Aqua do not confirm each other). We stop in 2021 because from 2022 the Terra satellite passes earlier in the morning (we checked its Day_view_time field). The same product is used to read the observation time. We drop fill values and low-quality readings and convert kelvin to °C. |
| MODIS MYD11A2 v061 (Aqua land surface temperature, 1 km, 8-day) | https://lpdaac.usgs.gov/products/myd11a2v061/ (DOI 10.5067/MODIS/MYD11A2.061) | Daytime land surface temperature at the same six points, 2003-2021, downloaded with NASA AppEEARS to cross-check Terra. Aqua shows no clear change (+0.27 °C, p = 0.29, against +1.04 °C for Terra over the same years). |
| MODIS MOD13Q1 v061 (NDVI vegetation index, 250 m, 16-day) | https://lpdaac.usgs.gov/products/mod13q1v061/ (DOI 10.5067/MODIS/MOD13Q1.061) | NDVI at six points in La Paz, 2001-2026 (2026 is a partial year), for the vegetation trend. |
| NASA POWER (rainfall and air temperature, about 50 km) | https://power.larc.nasa.gov/ (monthly API: https://power.larc.nasa.gov/docs/services/api/temporal/monthly/) | Monthly air temperature (T2M) and rainfall (PRECTOTCORR) for La Paz, 2001-2025, for the trend tests. |
| GRACE and GRACE-FO, JPL Mascon CRI RL06.3Mv04 (total water storage anomaly, 0.5° grid, monthly, April 2002 to September 2026) | https://doi.org/10.5067/TEMSC-3JC634 (PO.DAAC) | Regional water storage trend for the La Paz area, 2002-2026 (2026 is a partial year). It covers hundreds of kilometers, so it describes the region, not the La Paz aquifer. |
| NASA GIBS (Global Imagery Browse Services) imagery layers: `MODIS_Terra_CorrectedReflectance_TrueColor` and `MODIS_Terra_L3_Land_Surface_Temp_8Day_Day` | https://gibs.earthdata.nasa.gov/ | "See La Paz from space": one real MODIS Terra photo per year (2001-2026, April), in true color or as ground heat, with a year slider. It is one photo per year, not a trend, and it adds no result. |
| NASA GIBS, `GOES-West_ABI_GeoColor_v0_NRT` (NOAA GOES-West ABI GeoColor, near real time, every 10 minutes) | https://gibs.earthdata.nasa.gov/ | Current satellite image of the peninsula on the Home screen, next to the weather-model readings. Current context, not a trend. |
| NASA GIBS, `VIIRS_NOAA20_Chlorophyll_a` (VIIRS NOAA-20 chlorophyll-a, one day behind) | https://gibs.earthdata.nasa.gov/ | Optional chlorophyll layer on the Fishing map. Satellite imagery, not an official fishing forecast. |
| NASA GIBS, `GOES-West_ABI_GeoColor` (every 10 minutes) and `IMERG_Precipitation_Rate_30min` (NASA GPM IMERG, every 30 minutes) | https://gibs.earthdata.nasa.gov/ | "Watch the sky move" (Weather screen): the last 3 hours of real cloud images and the last 6 hours of satellite rain estimates, played one after another. Real images only; not a forecast or an official warning. |
| NASA Earthdata AppEEARS (access tool) | https://appeears.earthdatacloud.nasa.gov/ | Used to extract the MODIS time series at the six points. |

Where each dataset fits (local problems): water stress and drought use NASA POWER rainfall, GRACE/GRACE-FO and MODIS NDVI; urban heat uses MODIS Terra and Aqua land surface temperature, NASA POWER air temperature and MODIS NDVI; coastal and cyclone risk uses NASA GIBS imagery (GOES-West GeoColor and VIIRS chlorophyll) together with model readings that are not NASA data.

Planned, not used yet: GPM IMERG, SMAP, OMI/TROPOMI, Landsat/Sentinel, ECOSTRESS and MODIS sea surface temperature.

How the data inspired the project: the satellite and reanalysis records from NASA that we used go back to 2001 (2002 for water) and are free, but they sit in technical tools that most residents never open. Comparing them showed us a story residents can read for themselves on a phone: the air temperature of La Paz has gone up significantly, rainfall shows no clear change, and vegetation seems to have declined. It also showed something we did not expect: the satellite's daytime surface temperature does not give a clear answer. Terra suggests a rise of about 0.9 °C up to 2021, but Aqua does not confirm it, and the pass time of both satellites drifts, so we show the air temperature as the main heat result and the surface as inconclusive. The groundwater result was also a surprise: regional water storage from GRACE has risen since 2002, which describes the region and not the La Paz aquifer, so we show it as it is and do not read it as a sign that local water shortages are easing.
