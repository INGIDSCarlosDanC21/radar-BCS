# Space Agency Partner Data and Other Resources

<!--
Requirement (literal, from "Components of Project"):
"Suggested space-based data is provided for each of the Challenges under the "Resources" tab.
What Space Apps Challenge Space Agency Partner data did you use in your project?
Space Agency Partner data is optional but encouraged.
All other references can be listed here.
Provide links for all of the data and resources used in your project.
Resources should include any code, text, and images (even if they are open source or freely available) that you used when creating your project."
-->

<!-- Nota interna: licencias de las librerias leidas de PyPI el 2026-11-14. Las fuentes de las cifras locales (Forest Trends, FMCN, Zeta, El Congresista; docs/investigacion/contexto-local.md) se agregan aqui SOLO si terminan en la web o en la demo. Agregar todo codigo, texto, imagen, audio y modelo 3D externo conforme se use, aunque sea libre. La rubrica es la guia global de jurado https://www.spaceappschallenge.org/resources/judging-awards-guide/ (solo interno, no va en la plataforma). -->

## Space Agency Partner data (optional)

None. We did not use Space Agency Partner data.

## Other references: code, text, images, data, audio, 3D

| Name | Link | License | Where used |
|---|---|---|---|
| Radar BCS source code (our own work) | https://github.com/INGIDSCarlosDanC21/radar-BCS | Apache-2.0 | Whole project |
| pyMannKendall (Hussain and Mahmud, 2019, Journal of Open Source Software, DOI 10.21105/joss.01556) | https://github.com/mmhs013/pyMannKendall | MIT | Seasonal Mann-Kendall tests and Sen's slope in the analysis |
| NumPy | https://numpy.org/ | BSD-3-Clause | Numerical work in the analysis |
| Requests | https://requests.readthedocs.io/ | Apache-2.0 | Downloading NASA POWER, MODIS (AppEEARS API) and GRACE (NASA Earthdata) data |
| netCDF4 (Python) | https://unidata.github.io/netcdf4-python/ | MIT | Reading the GRACE netCDF file |
| SciPy | https://scipy.org/ | BSD-3-Clause | Spearman correlation check between rainfall and water (analysis only) |
| Leaflet 1.9.4 | https://leafletjs.com/ | BSD-2-Clause | Interactive map on the website |
| OpenStreetMap tiles | https://www.openstreetmap.org/copyright | ODbL (attribution "© OpenStreetMap contributors" shown on the map) | Map background |
| CDC, *Five Steps to help your patients stay safe on hot days* | https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf | Official site; cited only | Heat tips on the Actions screen |
| EPA WaterSense, *Start Saving* | https://www.epa.gov/watersense/start-saving | Official site; cited only | Water-saving tips on the Actions screen |
| SIAP, *Agricultural production closing by municipality 2025* (La Paz, BCS) | https://nube.agricultura.gob.mx/index.php?view=10AE434F-A2158368-A120BC5A-EDF4AFAA&ANIO=2025 | Official Mexican government data; license TO BE CONFIRMED; cited only (accessed 2026-11-14) | Agricultural Map screen (crops) |
| CONAGUA aquifer availability: DOF 09/11/2023, DOF 17/08/2023 (La Paz aquifer), sheets DR_0323 (Los Planes) and DR_0313 (Todos Santos) | https://dof.gob.mx/nota_detalle.php?codigo=5708074&fecha=09/11/2023 ; https://dof.gob.mx/nota_detalle.php?codigo=5698953&fecha=17/08/2023 ; https://sigagis.conagua.gob.mx/gas1/Edos_Acuiferos_18/BajaCaliforniaSur/DR_0323.pdf ; https://sigagis.conagua.gob.mx/gas1/Edos_Acuiferos_18/BajaCaliforniaSur/DR_0313.pdf | Official Mexican government data; license TO BE CONFIRMED; cited only (accessed 2026-11-14) | Agricultural Map screen (water) |
| ISRIC SoilGrids v2.0 (REST API) | https://www.isric.org/explore/soilgrids | CC BY 4.0 | Agricultural Map screen (soil health) |
| GeoNames (coordinates of Los Planes, El Carrizal, El Centenario) | https://www.geonames.org/ | CC BY 4.0 | Agricultural Map markers |
| SMN-CONAGUA Drought Monitor (municipal table) | https://smn.conagua.gob.mx/tools/RESOURCES/Monitor%20de%20Sequia%20en%20Mexico/MunicipiosSequia.xlsx | Official Mexican government data; license TO BE CONFIRMED; cited only (accessed 2026-11-14) | Agricultural Map screen (risks) |
| DOF 05/10/2018 (fruit-fly-free zones), SEPADA BCS 11/08/2023 (emergency plan), BCS Health Ministry *State Risk Profile 2025* | https://dof.gob.mx/nota_detalle.php?codigo=5540162&fecha=05%2F10%2F2018 ; https://sepada.bcs.gob.mx/avalan-senasica-y-usda-plan-emergente-contra-la-mosca-de-la-fruta/ ; https://ssbcs.gob.mx/pdf/2025/vigilancia/Perfil_Estatal_de_Riesgos_BCS_2025.pdf | Official sites; license TO BE CONFIRMED; cited only (accessed 2026-11-14) | Agricultural Map screen (risks and plant health) |
| pytest | https://docs.pytest.org/ | MIT | Tests of the analysis code (development only) |
| True-color image of Baja California Sur, NASA GIBS, MODIS Terra Corrected Reflectance, 20 April 2025 (no edits other than JPEG recompression; no NASA logos) | https://gibs.earthdata.nasa.gov/ (exact request URL in `web/img/FUENTES.md` of the repository) | CC0, per the NASA Earthdata data use policy: https://www.earthdata.nasa.gov/learn/use-data/data-use-policy | Home screen image |
| Live satellite imagery (WMTS tiles) from NASA GIBS: layers `MODIS_Terra_CorrectedReflectance_TrueColor` and `MODIS_Terra_L3_Land_Surface_Temp_8Day_Day` (2001-2026, April of each year), and the color scale `MODIS_Land_Surface_Temp.xml` (10 to 65 °C) | https://gibs.earthdata.nasa.gov/ ; https://gibs.earthdata.nasa.gov/colormaps/v1.3/MODIS_Land_Surface_Temp.xml | CC0, per the NASA Earthdata data use policy: https://www.earthdata.nasa.gov/learn/use-data/data-use-policy ; tiles carry no NASA logos; credit shown on screen. Loaded by the browser, not copied into the repository | Map screen: "See La Paz from space" block |
| Fonts Space Grotesk, Manrope and JetBrains Mono (loaded from Google Fonts) | https://github.com/google/fonts/tree/main/ofl/ (OFL.txt of each family; checked 2026-11-14) | SIL Open Font License 1.1 | Website typography (Figma design and `web/`) |
| Radar BCS logo ("Radar BCS": radar rings, cactus and water drop), exported from our Figma file "Radar paceño" | Own repository file: `web/assets/logo-radar-bcs.png` (no external link) | Generated with Gemini (Google); Google Terms of Service (https://policies.google.com/terms): Google does not claim ownership of generated content; Generative AI Prohibited Use Policy (https://policies.google.com/terms/generative-ai/use-policy). A visible "AI-generated" text label is shown next to the logo in the site header, and the site footer says the logo was generated with AI (Gemini). Contains no NASA marks | Header of all website screens, including the Agricultural Map. Disclosed on the site as "AI-generated logo" |
| 6 section icons, `web/assets/iconos/*.svg`: Google Material Symbols glyphs (device_thermostat, cloud_sync, potted_plant, water_drop, layers, shield_with_heart; files `clima-calor-y-sensacion-termica`, `clima-humedad-y-lluvia`, `agricultura-factibilidad-y-cultivos`, `agricultura-clima-y-agua`, `agricultura-salud-del-suelo`, `agricultura-riesgos-y-sanidad`). The same folder holds six more icons from the set (fishing and wind/UV) that the site does not load | <https://fonts.google.com/icons> | Apache License 2.0 (copy in `web/assets/iconos/LICENSE-material-symbols.txt`) | Four cards of the Home screen, the title of each indicator page, and the four tabs of the Agricultural Map |
| TODO: small inline SVG icons drawn in `web/js/agricola.js` (Agricultural Map: pins, arrows, status marks). Origin and license to be confirmed by UI/UX (Figma design) before submitting; if they are Material Symbols, add them to the row above; if not, list their source | TODO | TODO | Agricultural Map screen |
