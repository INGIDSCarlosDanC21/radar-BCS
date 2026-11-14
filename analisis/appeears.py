"""MODIS (MOD11A2 temperatura de superficie, MOD13Q1 NDVI) por AppEEARS, tarea tipo punto.

Credenciales: EARTHDATA_USERNAME / EARTHDATA_PASSWORD desde .env (ignorado por git); nunca se imprimen.
Las tareas enviadas se guardan en data/cache/appeears/tareas.json para no reenviarlas.

  python -m analisis.appeears login       # solo comprueba las credenciales
  python -m analisis.appeears enviar      # envía las tareas que falten
  python -m analisis.appeears descargar   # baja los CSV de las tareas terminadas
"""
import json
import os
import sys
from pathlib import Path

import requests

from analisis.descargar import LAT, LON, RAIZ, ultimo_anio_completo

API = "https://appeears.earthdatacloud.nasa.gov/api"
CACHE = RAIZ / "data" / "cache" / "appeears"
TAREAS = CACHE / "tareas.json"
PRODUCTOS = {
    "MOD11A2.061": ["LST_Day_1km", "QC_Day"],
    "MOD13Q1.061": ["_250m_16_days_NDVI", "_250m_16_days_pixel_reliability"],
}


def cargar_env(ruta=RAIZ / ".env"):
    """Carga .env en os.environ sin pisar variables ya definidas; no imprime nada."""
    if not ruta.exists():
        return
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            k, v = linea.split("=", 1)
            if v.strip() and k.strip() not in os.environ:
                os.environ[k.strip()] = v.strip().strip("\"'")


def login():
    cargar_env()
    usuario, clave = os.environ.get("EARTHDATA_USERNAME"), os.environ.get("EARTHDATA_PASSWORD")
    if not usuario or not clave:
        sys.exit("Faltan EARTHDATA_USERNAME / EARTHDATA_PASSWORD en .env")
    r = requests.post(f"{API}/login", auth=(usuario, clave), timeout=60)
    if r.status_code != 200:
        sys.exit(f"Login AppEEARS falló: HTTP {r.status_code}")
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _tareas():
    return json.loads(TAREAS.read_text(encoding="utf-8")) if TAREAS.exists() else {}


def enviar(h):
    tareas = _tareas()
    fin = ultimo_anio_completo()
    for producto, capas in PRODUCTOS.items():
        if producto in tareas:
            print(f"{producto}: ya enviada ({tareas[producto]})")
            continue
        cuerpo = {"task_type": "point", "task_name": f"radar-bcs-{producto}",
                  "params": {"dates": [{"startDate": "01-01-2001", "endDate": f"12-31-{fin}"}],
                             "layers": [{"product": producto, "layer": c} for c in capas],
                             "coordinates": [{"id": "lapaz", "category": "lapaz", "latitude": LAT, "longitude": LON}]}}
        r = requests.post(f"{API}/task", json=cuerpo, headers=h, timeout=60)
        if r.status_code not in (200, 202):
            sys.exit(f"{producto}: HTTP {r.status_code} {r.text[:300]}")
        tareas[producto] = r.json()["task_id"]
        CACHE.mkdir(parents=True, exist_ok=True)
        TAREAS.write_text(json.dumps(tareas, indent=1), encoding="utf-8")
        print(f"{producto}: tarea enviada ({tareas[producto]})")


def descargar_tareas(h):
    for producto, tid in _tareas().items():
        est = requests.get(f"{API}/status/{tid}", headers=h, timeout=60).json()
        estado = est.get("status") or "processing"
        print(f"{producto}: {estado}" + (f" {est['progress']}" if isinstance(est.get("progress"), (int, float)) else ""))
        if estado != "done":
            continue
        for f in requests.get(f"{API}/bundle/{tid}", headers=h, timeout=60).json()["files"]:
            if not f["file_name"].endswith(".csv") or "lookup" in f["file_name"].lower():
                continue
            destino = CACHE / producto / Path(f["file_name"]).name
            if destino.exists():
                continue
            destino.parent.mkdir(parents=True, exist_ok=True)
            r = requests.get(f"{API}/bundle/{tid}/{f['file_id']}", headers=h, timeout=300)
            r.raise_for_status()
            destino.write_bytes(r.content)
            print(f"  guardado {destino.name} ({len(r.content)} bytes)")


if __name__ == "__main__":
    orden = sys.argv[1] if len(sys.argv) > 1 else "login"
    cabeceras = login()
    print("Login AppEEARS correcto")
    if orden == "enviar":
        enviar(cabeceras)
    elif orden == "descargar":
        descargar_tareas(cabeceras)
