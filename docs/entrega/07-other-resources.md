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
| pytest | https://docs.pytest.org/ | MIT | Tests of the analysis code (development only) |
| True-color image of Baja California Sur, NASA GIBS, MODIS Terra Corrected Reflectance, 20 April 2025 (no edits other than JPEG recompression; no NASA logos) | https://gibs.earthdata.nasa.gov/ (exact request URL in `web/img/FUENTES.md` of the repository) | CC0, per the NASA Earthdata data use policy: https://www.earthdata.nasa.gov/learn/use-data/data-use-policy | Home screen image |
| Fonts Space Grotesk, Manrope and JetBrains Mono (loaded from Google Fonts) | https://github.com/google/fonts/tree/main/ofl/ (OFL.txt of each family; checked 2026-11-14) | SIL Open Font License 1.1 | Website typography (Figma design and `web/`) |
| Radar BCS logo ("Radar BCS": radar rings, cactus and water drop), exported from our Figma file "Radar paceño" | Own repository file: `web/assets/logo-radar-bcs.png` (no external link) | Generated with Gemini (Google); Gemini's terms of use for generated images are TO BE CONFIRMED. Contains no NASA marks | Header of all website screens. Disclosed on the site as "AI-generated logo" |
| 12 section icons (climate, agriculture, fishing), `web/assets/iconos/*.svg` | Partly from Google Stitch mockups and partly from Flaticon <https://www.flaticon.com/> (which icon comes from which source, and the Flaticon authors, are TO BE CONFIRMED) | Flaticon free license: attribution required on the website, one line per author ("Icon made by [author] from www.flaticon.com"), next to the icon or in the footer (<https://support.flaticon.com/s/article/Attribution-How-when-and-where-FI?language=en_US>). Stitch terms TO BE CONFIRMED | Section screens of `web/` |
| supabase-js 2.118.0 (loaded from jsDelivr with SRI) | https://github.com/supabase/supabase-js | MIT | Optional login (only if it ships) |
| Supabase Auth (hosted service, free plan) | https://supabase.com/ (terms: https://supabase.com/terms) | Supabase terms of service | Optional email login; stores only the email and an encrypted password (only if it ships) |
| TODO: audio, 3D models | TODO | TODO | TODO |
