"""Compuesto de color verdadero de Baja California Sur con Google Earth Engine.

Fuente: MODIS/061/MCD43A4 (NASA LP DAAC). Catálogo:
https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MCD43A4
Términos del dataset: "MODIS data and products acquired through the LP DAAC
have no restrictions on subsequent use, sale, or redistribution."

Requisitos (todavía no se ha corrido en el equipo):
  pip install earthengine-api
  earthengine authenticate          # cuenta de Google, la hace la persona
  EE_PROJECT=<proyecto no comercial de Google Cloud> en .env o en el entorno

Uso:
  python web/tools/gee_imagen_bcs.py 2025-03-01 2025-05-31
Escribe web/img/bcs-mcd43a4-<inicio>_<fin>.jpg. Después hay que registrarlo en
web/img/FUENTES.md. Los valores de visualización (VIS) son un punto de partida:
hay que revisar la imagen antes de publicarla.
"""
import os
import sys
import urllib.request

import ee

CAJA = [-115.3, 22.8, -109.3, 28.1]  # lon min, lat min, lon max, lat max (la misma que la imagen GIBS)
BANDAS = ["Nadir_Reflectance_Band1", "Nadir_Reflectance_Band4", "Nadir_Reflectance_Band3"]  # rojo, verde, azul
VIS = {"min": 0, "max": 4000, "gamma": 1.4}


def main(inicio, fin):
    proyecto = os.environ.get("EE_PROJECT")
    if not proyecto:
        sys.exit("Falta EE_PROJECT (proyecto de Google Cloud registrado en Earth Engine).")
    ee.Initialize(project=proyecto)
    region = ee.Geometry.Rectangle(CAJA)
    img = (ee.ImageCollection("MODIS/061/MCD43A4")
           .filterDate(inicio, fin)
           .select(BANDAS)
           .median()
           .clip(region))
    url = img.getThumbURL({**VIS, "bands": BANDAS, "region": region, "dimensions": 1200, "format": "jpg"})
    salida = os.path.join(os.path.dirname(__file__), "..", "img", f"bcs-mcd43a4-{inicio}_{fin}.jpg")
    urllib.request.urlretrieve(url, salida)
    print("ok:", os.path.normpath(salida))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Uso: python web/tools/gee_imagen_bcs.py AAAA-MM-DD AAAA-MM-DD")
    main(sys.argv[1], sys.argv[2])
