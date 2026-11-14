# NASA Data

<!--
Requirement (literal, from "Components of Project"):
"Suggested NASA data is provided for each of the challenges under the "Resources" tab. At least one NASA resource from the Challenge is required for global awards!
What NASA data did you use in your project? Provide links to all resources used."

Also from "Project Submission": "How did you use it? How did it inspire your project?"
-->

<!-- Nota interna: enlaces comprobados el 2026-11-14 (todos responden HTTP 200 y el titulo de cada pagina coincide con el producto). Solo NASA POWER se ha usado de verdad hasta ahora (prototipo, issue #5); el resto sigue PREVISTO: confirmar antes de enviar. Giovanni y Hydrology Time Series estan en docs/referencia/reto-earth-system-trend-detective.md como recursos del reto, pero no estan previstos: agregarlos solo si se usan. Para premios globales hay que usar al menos un recurso NASA del reto. -->

Planned datasets. All are open and free. Confirm which ones were actually used before submitting.

| Dataset | Link | How we used it |
|---|---|---|
| MODIS MOD11A2 (land surface temperature, 1 km, 2001 onward) | https://lpdaac.usgs.gov/products/mod11a2v061/ | Heat trend for La Paz. TODO: confirm. |
| MODIS MOD13Q1 (NDVI vegetation index, 250 m, 2000 onward) | https://lpdaac.usgs.gov/products/mod13q1v061/ | Vegetation trend for La Paz. TODO: confirm. |
| NASA POWER (rainfall and air temperature, about 50 km) | https://power.larc.nasa.gov/ (monthly API: https://power.larc.nasa.gov/docs/services/api/temporal/monthly/) | **Used.** Monthly air temperature (T2M) and rainfall (PRECTOTCORR) for La Paz, 2001-2025, for the trend tests. |
| GRACE / GLDAS (groundwater, 28-300 km) | https://gracefo.jpl.nasa.gov/ and https://ldas.gsfc.nasa.gov/gldas | Regional groundwater trend only, not by neighborhood. TODO: confirm. |
| ECOSTRESS (70 m) | https://ecostress.jpl.nasa.gov/ | Snapshot of heat by neighborhood, not a trend. TODO: confirm. |
| NASADEM (relief, 30 m) | https://lpdaac.usgs.gov/products/nasadem_hgtv001/ | Terrain relief for the 3D visual. TODO: confirm. |
| NASA Earthdata AppEEARS (access tool) | https://appeears.earthdatacloud.nasa.gov/ | Tool to download and transform the satellite data for La Paz. TODO: confirm. |

How the data inspired the project: satellite and reanalysis records from NASA go back to 2001 and are free, but they sit in technical tools that most residents never open. Seeing in NASA POWER that the air temperature of La Paz has gone up while rainfall shows no clear change showed us the story that residents could read for themselves on a phone. TODO: review this wording once the MODIS and groundwater results are in.
