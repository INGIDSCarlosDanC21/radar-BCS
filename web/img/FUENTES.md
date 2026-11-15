# Imágenes de `web/img/`

| Archivo | Qué es | Fuente | Licencia |
|---|---|---|---|
| `bcs-modis-2025-04-20.jpg` (1200×1060) y `bcs-modis-2025-04-20-600.jpg` (600×530) | Color verdadero de Baja California Sur, 20 de abril de 2025, satélite Terra, MODIS Corrected Reflectance. Caja: lat 22.8 a 28.1, lon −115.3 a −109.3 | NASA GIBS (WMS), capa `MODIS_Terra_CorrectedReflectance_TrueColor`: <https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&STYLES=&CRS=EPSG:4326&BBOX=22.8,-115.3,28.1,-109.3&WIDTH=1200&HEIGHT=1060&FORMAT=image/jpeg&TIME=2025-04-20> | CC0. Según la política de uso de datos de NASA Earthdata, "data provided from a NASA-led mission are licensed as Creative Commons Zero (CC0)". Fuente: <https://www.earthdata.nasa.gov/learn/use-data/data-use-policy>, consultada el 2026-11-14. Crédito: NASA EOSDIS GIBS / Worldview |

- **Proceso:** solo se recomprimió a JPEG (calidad 82 y 80) y se redujo el tamaño de la versión de 600 px. No hay retoque ni IA.
- **Pendiente:** `web/tools/gee_imagen_bcs.py` hace un compuesto MODIS MCD43A4 con Google Earth Engine. Requiere una cuenta y un proyecto no comercial de Google Cloud; todavía no se ha corrido.
