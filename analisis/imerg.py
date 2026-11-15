"""Lluvia por celda de 0.1° alrededor de La Paz con GPM IMERG V07 Final mensual (GPM_3IMERGM, GES DISC). Issue #188.

Recorta con OPeNDAP (unos KB por mes) en vez de bajar los archivos completos. Necesita EARTHDATA_TOKEN en .env (nunca se imprime).
La variable `precipitation` viene en mm/hr (promedio del mes): el total mensual en mm es mm/hr x horas del mes.
Límites que se declaran en la ficha: menos fiable en costa y relieve, y los cambios de satélites pueden crear artefactos en tendencias largas.
"""
import calendar
import json
import os

import numpy as np
import requests

from analisis.appeears import cargar_env
from analisis.descargar import RAIZ

COLECCION = "C2723754851-GES_DISC"          # GPM_3IMERGM V07
CMR = "https://cmr.earthdata.nasa.gov/search/granules.umm_json"
OPENDAP = f"https://opendap.earthdata.nasa.gov/collections/{COLECCION}/granules/"
CACHE = RAIZ / "data" / "cache" / "imerg" / "lapaz_mensual.json"
# Índices de la malla global de 0.1° (lon desde -179.95, lat desde -89.95): lon -110.55..-110.15, lat 23.95..24.35
I_LON, I_LAT, N = 694, 1139, 5
LONS = [round(-179.95 + 0.1 * (I_LON + i), 2) for i in range(N)]
LATS = [round(-89.95 + 0.1 * (I_LAT + j), 2) for j in range(N)]
INICIO, FIN = 2001, 2024                    # el Final mensual llega hasta sep 2025: 2025 queda fuera por incompleto


def granulos(inicio=INICIO, fin=FIN):
    """{(año, mes): GranuleUR} desde CMR."""
    r = requests.get(CMR, params={"collection_concept_id": COLECCION, "page_size": 400,
                                  "temporal": f"{inicio}-01-01T00:00:00Z,{fin}-12-31T23:59:59Z"}, timeout=60)
    r.raise_for_status()
    sal = {}
    for it in r.json()["items"]:
        ur = it["umm"]["GranuleUR"]
        f = ur.split(".3IMERG.")[1][:8]
        sal[(int(f[:4]), int(f[4:6]))] = ur
    return sal


def recorte(ur, token):
    """Matriz (N lon x N lat) en mm/hr del mes."""
    ce = f"/Grid/precipitation[0][{I_LON}:{I_LON + N - 1}][{I_LAT}:{I_LAT + N - 1}]"
    r = requests.get(OPENDAP + ur.replace(":", "%3A") + ".dap.csv", params={"dap4.ce": ce},
                     headers={"Authorization": "Bearer " + token}, timeout=120)
    r.raise_for_status()
    return parsear_csv(r.text)


def parsear_csv(texto):
    filas = [ln.split(",")[1:] for ln in texto.splitlines() if ln.startswith("/Grid/precipitation[")]
    m = np.array([[float(x) for x in f] for f in filas])
    m[m < -9000] = np.nan                    # valor de relleno de IMERG
    return m


def descargar_mensual():
    """Lee o completa la caché {"AAAA-MM": matriz}. Reanuda donde se quedó."""
    cargar_env()
    token = os.environ.get("EARTHDATA_TOKEN")
    if not token:
        raise SystemExit("Falta EARTHDATA_TOKEN en .env")
    datos = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    for (a, m), ur in sorted(granulos().items()):
        k = f"{a}-{m:02d}"
        if k not in datos:
            datos[k] = recorte(ur, token).tolist()
            CACHE.write_text(json.dumps(datos))
    return datos


def totales_anuales(datos, inicio=INICIO, fin=FIN):
    """(años, matriz años x N x N) en mm; el año sin sus 12 meses queda en NaN."""
    anios = list(range(inicio, fin + 1))
    out = np.full((len(anios), N, N), np.nan)
    for i, a in enumerate(anios):
        meses = [datos.get(f"{a}-{m:02d}") for m in range(1, 13)]
        if all(x is not None for x in meses):
            out[i] = sum(np.array(x) * calendar.monthrange(a, m)[1] * 24 for m, x in enumerate(meses, 1))
    return anios, out


def tendencia(serie):
    """Mann-Kendall (sin estacionalidad: la serie ya es anual) y pendiente de Sen de una serie anual en mm."""
    import pymannkendall as mk
    s = np.asarray(serie, float)
    if np.isnan(s).any() or s.size < 10:
        return None
    r = mk.original_test(s)
    return {"pendiente_mm_anio": float(r.slope), "p": float(r.p), "tendencia": r.trend, "media_mm": float(s.mean())}


if __name__ == "__main__":
    d = descargar_mensual()
    anios, t = totales_anuales(d)
    print(len(d), "meses en caché;", anios[0], "-", anios[-1])
    for i, lo in enumerate(LONS):
        for j, la in enumerate(LATS):
            print(lo, la, tendencia(t[:, i, j]))
