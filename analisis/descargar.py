"""Descarga NASA POWER (mensual, un punto) con caché en data/cache/power/.

Sin credenciales. Si el archivo de caché existe no se vuelve a consultar.
"""
import datetime as dt
import json
from pathlib import Path

import requests

RAIZ = Path(__file__).resolve().parent.parent
URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"
DOCS = "https://power.larc.nasa.gov/docs/services/api/temporal/monthly/"
# La Paz, B.C.S.: 24.14 N, -110.31 O (redondeo de 24.1486, -110.3067; Wikipedia, ver skill earthdata-datasets)
LAT, LON = 24.14, -110.31
PARAMETROS = ["T2M", "PRECTOTCORR"]
COMUNIDAD = "AG"
INICIO = 2001


def ultimo_anio_completo(hoy=None):
    return (hoy or dt.date.today()).year - 1


def descargar_power(inicio=INICIO, fin=None, lat=LAT, lon=LON, parametros=PARAMETROS, cache_dir=None):
    """Devuelve (datos_json, fecha_descarga_iso). La fecha es la de la caché si se reutiliza."""
    fin = fin or ultimo_anio_completo()
    cache_dir = Path(cache_dir) if cache_dir else RAIZ / "data" / "cache" / "power"
    cache = cache_dir / f"power_monthly_{lat}_{lon}_{inicio}_{fin}.json"
    if cache.exists():
        fecha = dt.date.fromtimestamp(cache.stat().st_mtime).isoformat()
        return json.loads(cache.read_text(encoding="utf-8")), fecha
    consulta = {"parameters": ",".join(parametros), "community": COMUNIDAD, "latitude": lat,
                "longitude": lon, "start": inicio, "end": fin, "format": "JSON"}
    r = requests.get(URL, params=consulta, timeout=120)
    r.raise_for_status()
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(r.text, encoding="utf-8")
    return r.json(), dt.date.today().isoformat()


if __name__ == "__main__":
    datos, fecha = descargar_power()
    print(f"POWER listo (descarga {fecha}): {list(datos['properties']['parameter'])}")
