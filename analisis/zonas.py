"""zonas.geojson con datos reales: cada zona es el píxel MODIS (1 km, MOD11A2) donde se midió.

Los polígonos salen de la rejilla sinusoidal de MODIS (tile, línea, muestra del CSV de AppEEARS), no se dibujan a mano.
Verificación: el centro del píxel cae a menos de 1 km del punto pedido (ver pruebas).
"""
import csv
import json

import numpy as np

from analisis import exportar, modis, tendencias as t
from analisis.descargar import RAIZ

SALIDA = RAIZ / "data" / "salida" / "zonas.geojson"
R = 6371007.181                 # radio de la esfera sinusoidal de MODIS (m)
TAM_TILE = 1111950.5197         # lado de un tile (m)
ESQ_X, ESQ_Y = -20015109.354, 10007554.677
TAM_PIXEL_1KM = TAM_TILE / 1200


def _a_lonlat(x, y):
    lat = y / R
    return np.degrees(x / (R * np.cos(lat))), np.degrees(lat)


def poligono_pixel(tile, linea, muestra, tam=TAM_PIXEL_1KM):
    """Esquinas (lon, lat) del píxel de una rejilla MODIS; el índice cuenta desde la esquina superior izquierda del tile."""
    h, v = int(tile[1:3]), int(tile[4:6])
    x0 = ESQ_X + h * TAM_TILE + muestra * tam
    y0 = ESQ_Y - v * TAM_TILE - linea * tam
    esquinas = [(x0, y0), (x0 + tam, y0), (x0 + tam, y0 - tam), (x0, y0 - tam), (x0, y0)]
    return [[round(float(a), 5), round(float(b), 5)] for a, b in (_a_lonlat(x, y) for x, y in esquinas)]


def pixeles(ruta):
    """{zona: (tile, línea, muestra, lat, lon)} del primer registro de cada zona del CSV de LST."""
    sal = {}
    with open(ruta, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            sal.setdefault(r["Category"], (r["MODIS_Tile"], float(r["MOD11A2_061_Line_Y_1km"]),
                                           float(r["MOD11A2_061_Sample_X_1km"]), float(r["Latitude"]), float(r["Longitude"])))
    return sal


def _cambio(res):
    return {"cambio_total": res["cambio_total"], "significativo": res["significativo"]}


def construir(inicio, fin, lst, ndvi, pix):
    tendencias = exportar.zonas(lst, ndvi, inicio, fin)
    feats = []
    for i, (zona, (tile, linea, muestra, lat, lon)) in enumerate(sorted(pix.items()), 1):
        tz = tendencias[zona]
        feats.append({
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [poligono_pixel(tile, linea, muestra)]},
            "properties": {
                "id": f"z{i:02d}", "nombre": zona,
                "cambios": {
                    "calor": _cambio(tz["calor_lst"]),
                    "vegetacion": _cambio(tz["vegetacion_ndvi"]),
                    "lluvia": {"cambio_total": None, "significativo": None},
                    "agua": {"cambio_total": None, "significativo": None}},
                "nota": "Polígono = píxel MODIS de 1 km (LST); el NDVI es del punto de 250 m dentro de ese píxel."}})
    return {"type": "FeatureCollection", "datos_de_prueba": False,
            "generado_con": exportar.GENERADO_CON, "periodo": {"inicio": inicio, "fin": fin}, "features": feats}


def main():
    from analisis.descargar import INICIO, ultimo_anio_completo
    inicio, fin = INICIO, ultimo_anio_completo()
    fin_lst = modis.anio_final("MOD11A2")
    lst, ndvi = modis.cargar(inicio, fin_lst, modis.anio_final("MOD13Q1"))
    salida = construir(inicio, fin_lst, lst, ndvi, pixeles(modis.ruta_csv("MOD11A2")))
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Escrito {SALIDA} ({SALIDA.stat().st_size} bytes, {len(salida['features'])} zonas)")


if __name__ == "__main__":
    main()
