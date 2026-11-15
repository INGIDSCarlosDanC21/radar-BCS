"""Clorofila-a y temperatura del mar por puerto (últimos 7 días) desde NOAA CoastWatch ERDDAP. Issue #197.

ERDDAP no trae CORS: se consulta aquí y se publica un JSON estático en data/salida/pesca_mar.json.
Punto de consulta = el punto de agua de cada puerto (RBVivo.PUERTOS.mar en web/js/datos-vivos.js); ERDDAP devuelve la celda más cercana.
Clorofila: VIIRS NOAA (erdVHNchla1day, 750 m, mg m^-3, compuesto diario). SST: MUR (jplMURSST41, 0.01°, °C).
Un día sin dato (nubes) queda en null; nunca se rellena. Es dato de satélite, no un aviso oficial.
"""
import datetime as dt
import json
import time
from pathlib import Path

import requests

RAIZ = Path(__file__).resolve().parent.parent
BASE = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/"
SALIDA = RAIZ / "data" / "salida" / "pesca_mar.json"
DIAS = 7
PUERTOS = {  # id: (nombre, lat, lon) del punto de agua; igual que web/js/datos-vivos.js
    "bahiamagdalena": ("Bahía Magdalena", 24.70, -112.30),
    "guerreronegro": ("Guerrero Negro", 27.90, -114.45),
    "todossantos": ("Todos Santos", 23.40, -110.35),
    "cabos": ("Cabo San Lucas", 22.85, -109.90),
    "lapaz": ("La Paz", 24.25, -110.35),
    "loreto": ("Loreto", 26.01, -111.25),
    "mulege": ("Mulegé", 26.90, -111.85),
    "santarosalia": ("Santa Rosalía", 27.34, -112.15),
}
PRODUCTOS = {
    "clorofila": {"dataset": "erdVHNchla1day", "var": "chla", "altitud": True, "unidad": "mg m^-3"},
    "sst": {"dataset": "jplMURSST41", "var": "analysed_sst", "altitud": False, "unidad": "°C"},
}


def _get(url, intentos=5):
    """ERDDAP da 503 intermitentes: reintenta con espera creciente."""
    for i in range(intentos):
        r = requests.get(url, timeout=90)
        if r.status_code == 200:
            return r.text
        if r.status_code == 404:                 # ERDDAP: punto fuera de la cobertura del producto
            return None
        if r.status_code not in (500, 502, 503, 504):
            r.raise_for_status()
        time.sleep(15 * (i + 1))
    raise RuntimeError(f"ERDDAP no respondió tras {intentos} intentos: {url}")


def fin_cobertura(prod):
    """Fecha (date) del último día publicado, leída del metadato (time_coverage_end)."""
    das = _get(f"{BASE}{PRODUCTOS[prod]['dataset']}.das")
    i = das.find('String time_coverage_end "') + 26
    return dt.date.fromisoformat(das[i:i + 10])


def url_punto(prod, lat, lon, fin, dias=DIAS):
    p = PRODUCTOS[prod]
    ini = fin - dt.timedelta(days=dias - 1)
    alt = "%5B(0.0)%5D" if p["altitud"] else ""
    return (f"{BASE}{p['dataset']}.csv?{p['var']}%5B({ini}):1:({fin})%5D{alt}"
            f"%5B({lat}):1:({lat})%5D%5B({lon}):1:({lon})%5D")


def parsear(texto, var):
    """[{fecha, valor, lat, lon}] desde el CSV de ERDDAP (2 filas de cabecera; NaN -> None)."""
    filas = [ln.split(",") for ln in texto.strip().splitlines()[2:]]
    cab = texto.strip().splitlines()[0].split(",")
    i_t, i_v, i_la, i_lo = cab.index("time"), cab.index(var), cab.index("latitude"), cab.index("longitude")
    sal = []
    for f in filas:
        v = f[i_v].strip()
        sal.append({"fecha": f[i_t][:10], "valor": None if v in ("NaN", "") else round(float(v), 3),
                    "lat": float(f[i_la]), "lon": float(f[i_lo])})
    return sal


def licencia(prod):
    """Texto de licencia del metadato del dataset (.das), tal como lo publica ERDDAP."""
    das = _get(f"{BASE}{PRODUCTOS[prod]['dataset']}.das")
    ini = das.find('String license "')
    if ini < 0:
        return None
    fin = das.find('";', ini)
    return " ".join(das[ini + 16:fin].split())


def construir(hoy=None):
    sal = {"generado_por": "analisis/pesca_erddap.py", "fecha": (hoy or dt.date.today()).isoformat(),
           "aviso": "Datos de satélite (modelo/composición diaria), no boyas ni aviso oficial. Un día sin valor es nube o costa.",
           "productos": {}, "puertos": {}}
    for prod, p in PRODUCTOS.items():
        sal["productos"][prod] = {"dataset": p["dataset"], "unidad": p["unidad"],
                                  "url": f"{BASE}{p['dataset']}.html", "licencia": licencia(prod)}
    fines = {prod: fin_cobertura(prod) for prod in PRODUCTOS}
    for pid, (nombre, lat, lon) in PUERTOS.items():
        item = {"nombre": nombre, "punto": [lat, lon]}
        for prod in PRODUCTOS:
            texto = _get(url_punto(prod, lat, lon, fines[prod]))
            if texto is None:
                item[prod] = {"celda": None, "serie": [], "ultimo_dato": None, "nota": "fuera de la cobertura del producto"}
                continue
            serie = parsear(texto, PRODUCTOS[prod]["var"])
            con = [s for s in serie if s["valor"] is not None]
            item[prod] = {"celda": [serie[0]["lat"], serie[0]["lon"]] if serie else None,
                          "serie": [{"fecha": s["fecha"], "valor": s["valor"]} for s in serie],
                          "ultimo_dato": con[-1]["fecha"] if con else None}
        sal["puertos"][pid] = item
    return sal


if __name__ == "__main__":
    datos = construir()
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
    for pid, it in datos["puertos"].items():
        print(pid, "chl último:", it["clorofila"]["ultimo_dato"], "| sst último:", it["sst"]["ultimo_dato"])
