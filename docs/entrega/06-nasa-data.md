# NASA Data

<!--
Requirement (literal, from "Components of Project"):
"Suggested NASA data is provided for each of the challenges under the "Resources" tab. At least one NASA resource from the Challenge is required for global awards!
What NASA data did you use in your project? Provide links to all resources used."

Also from "Project Submission": "How did you use it? How did it inspire your project?"
-->

<!-- Nota interna: enlaces comprobados el 2026-11-14 (todos responden HTTP 200 y el titulo de cada pagina coincide con el producto). Usados de verdad (2026-11-14): NASA POWER, MODIS MOD11A2, MODIS MOD13Q1 y AppEEARS. NO usados hasta ahora: GRACE/GLDAS, ECOSTRESS y NASADEM; quedaron fuera de la tabla. Si se llegan a usar, agregar su fila con el enlace de abajo: GRACE/GLDAS https://gracefo.jpl.nasa.gov/ y https://ldas.gsfc.nasa.gov/gldas ; ECOSTRESS https://ecostress.jpl.nasa.gov/ ; NASADEM https://lpdaac.usgs.gov/products/nasadem_hgtv001/ . No se declara nada que no se haya usado. Giovanni y Hydrology Time Series estan en docs/referencia/reto-earth-system-trend-detective.md como recursos del reto, pero no estan previstos: agregarlos solo si se usan. Para premios globales hay que usar al menos un recurso NASA del reto. -->

All are open and free. Everything listed here was used.

| Dataset | Link | How we used it |
|---|---|---|
| MODIS MOD11A2 v061 (land surface temperature, 1 km, 8-day) | https://lpdaac.usgs.gov/products/mod11a2v061/ (DOI 10.5067/MODIS/MOD11A2.061) | Daytime land surface temperature at six points in La Paz, 2001-2025, for the heat trend. We drop fill values and low-quality readings and convert kelvin to °C. |
| MODIS MOD13Q1 v061 (NDVI vegetation index, 250 m, 16-day) | https://lpdaac.usgs.gov/products/mod13q1v061/ (DOI 10.5067/MODIS/MOD13Q1.061) | NDVI at six points in La Paz, 2001-2025, for the vegetation trend. |
| NASA POWER (rainfall and air temperature, about 50 km) | https://power.larc.nasa.gov/ (monthly API: https://power.larc.nasa.gov/docs/services/api/temporal/monthly/) | Monthly air temperature (T2M) and rainfall (PRECTOTCORR) for La Paz, 2001-2025, for the trend tests. |
| NASA Earthdata AppEEARS (access tool) | https://appeears.earthdatacloud.nasa.gov/ | Used to extract the MODIS time series at the six points. |

How the data inspired the project: satellite and reanalysis records from NASA go back to 2001 and are free, but they sit in technical tools that most residents never open. Comparing them showed us a story residents can read for themselves on a phone: the air temperature of La Paz has gone up significantly, rainfall shows no clear change, and vegetation seems to have declined. It also showed something we did not expect: the satellite's daytime surface temperature does not show the same warming, so we show both measurements and say that we do not know why they differ. TODO: review this wording once the groundwater result is in.
