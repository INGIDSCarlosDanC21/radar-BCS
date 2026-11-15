"""Agua: anomalía de agua total almacenada de GRACE/GRACE-FO (JPL Mascon CRI RL06.3Mv04, PO.DAAC), celda de La Paz.

Es una tendencia REGIONAL (la señal de GRACE representa cientos de km), no del acuífero de La Paz.
Se usa la versión CRI (Coastal Resolution Improvement), pensada para mascones costeros.
Credenciales Earthdata: EARTHDATA_USERNAME / EARTHDATA_PASSWORD desde .env (nunca se imprimen).
"""
import datetime as dt
import os
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
import requests

from analisis.appeears import cargar_env
from analisis.descargar import LAT, LON, RAIZ

CMR = "https://cmr.earthdata.nasa.gov/search/granules.umm_json"
COLECCION = "C3195527175-POCLOUD"          # TELLUS_GRAC-GRFO_MASCON_CRI_GRID_RL06.3_V4
DOI = "https://doi.org/10.5067/TEMSC-3JC634"
CACHE = RAIZ / "data" / "cache" / "grace"
INICIO = 2002                              # el primer mes de GRACE es abril de 2002
ORIGEN_TIEMPO = dt.date(2002, 1, 1)         # el tiempo del archivo son días desde esta fecha


class _SesionEarthdata(requests.Session):
    """Mantiene las credenciales solo hacia urs.earthdata.nasa.gov al seguir las redirecciones."""

    def rebuild_auth(self, prepared, response):
        host = urlparse(prepared.url).hostname
        if host == "urs.earthdata.nasa.gov" and self.auth:
            return
        prepared.headers.pop("Authorization", None)


def url_granulo():
    r = requests.get(CMR, params={"collection_concept_id": COLECCION, "page_size": 1}, timeout=60)
    r.raise_for_status()
    for u in r.json()["items"][0]["umm"]["RelatedUrls"]:
        if u.get("Type") == "GET DATA" and u["URL"].startswith("https") and u["URL"].endswith(".nc"):
            return u["URL"]
    raise RuntimeError("CMR no devolvió el archivo .nc del producto")


def descargar_grace():
    """Baja el netCDF (una sola vez, ~46 MB) a data/cache/grace/ y devuelve (ruta, fecha_iso)."""
    en_cache = sorted(CACHE.glob("*.nc"))
    destino = en_cache[0] if en_cache else CACHE / Path(urlparse(url_granulo()).path).name
    if not destino.exists():
        url = url_granulo()
        cargar_env()
        usuario, clave = os.environ.get("EARTHDATA_USERNAME"), os.environ.get("EARTHDATA_PASSWORD")
        if not usuario or not clave:
            raise SystemExit("Faltan EARTHDATA_USERNAME / EARTHDATA_PASSWORD en .env")
        s = _SesionEarthdata()
        s.auth = (usuario, clave)
        CACHE.mkdir(parents=True, exist_ok=True)
        r = s.get(url, stream=True, timeout=300)
        r.raise_for_status()
        parcial = destino.with_suffix(".parcial")
        with open(parcial, "wb") as f:
            for trozo in r.iter_content(1 << 20):
                f.write(trozo)
        parcial.replace(destino)
    return destino, dt.date.fromtimestamp(destino.stat().st_mtime).isoformat()


def celda_cercana(lats, lons, lat=LAT, lon=LON):
    """Índices de la celda más cercana; las longitudes del archivo pueden ir de 0 a 360."""
    lon = lon % 360 if float(np.max(lons)) > 180 else lon
    return int(np.argmin(np.abs(np.asarray(lats) - lat))), int(np.argmin(np.abs(np.asarray(lons) - lon)))


def fecha(dias):
    return ORIGEN_TIEMPO + dt.timedelta(days=float(dias))


def leer(ruta, lat=LAT, lon=LON):
    """Devuelve [(año, mes, cm)] de la celda más cercana; los meses sin dato (hueco GRACE/GRACE-FO) no aparecen."""
    import netCDF4
    with netCDF4.Dataset(ruta) as ds:
        i, j = celda_cercana(ds["lat"][:], ds["lon"][:], lat, lon)
        v = np.ma.filled(ds["lwe_thickness"][:, i, j].astype(float), np.nan)
        tiempo = ds["time"][:]
    return [(f.year, f.month, float(x)) for f, x in ((fecha(d), x) for d, x in zip(tiempo, v)) if not np.isnan(x)]


def matriz_grace(lecturas, fin, inicio=INICIO):
    """Matriz (años x 12) en cm; NaN en los meses sin dato (abril 2002 es el primero; hueco 2017-2018)."""
    from analisis import modis
    return modis.matriz(lecturas, inicio, fin)


def promedio_anual_minimo(mat, min_meses=9):
    """Media anual de la anomalía solo si el año tiene al menos `min_meses` meses; si no, NaN."""
    validos = (~np.isnan(mat)).sum(axis=1)
    with np.errstate(all="ignore"):
        anual = np.where(validos >= min_meses, np.nanmean(mat, axis=1), np.nan)
    if validos[-1] < 12 and anual.size:
        anual[-1] = np.nan  # el último año, si está incompleto, no entra al promedio anual (sesgo estacional)
    return anual
