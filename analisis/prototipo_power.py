# /// script
# requires-python = ">=3.10"
# dependencies = ["requests", "pymannkendall", "numpy"]
# ///
"""PROTOTIPO (riesgo para el issue #7): serie mensual NASA POWER y tendencia para La Paz, B.C.S.

El pipeline final es de Diego (Prog. A). Valores NO revisados por Investigacion.

Correr:
  uv run --python 3.12 --with requests --with pymannkendall --with numpy analisis/prototipo_power.py

Punto: 24.14 N, -110.31 O (redondeo de 24.1486, -110.3067, infobox de Wikipedia, citado en
.claude/skills/earthdata-datasets/SKILL.md: https://es.wikipedia.org/wiki/La_Paz_(Baja_California_Sur)).
API verificada: endpoint /api/temporal/monthly/point con start/end = anio (docs oficiales
https://power.larc.nasa.gov/docs/services/api/temporal/monthly/). La documentacion no dice el valor de
relleno ni la clave anual; la RESPUESTA real trae header.fill_value = -999.0 y la clave YYYY13 = promedio
anual (mes 13). Se usa lo que devuelve la API.
"""
import datetime as dt
import json
import sys
from pathlib import Path

import numpy as np
import pymannkendall as mk
import requests

RAIZ = Path(__file__).resolve().parent.parent
LAT, LON = 24.14, -110.31
PARAMS = ["T2M", "PRECTOTCORR"]
INICIO = 2001
hoy = dt.date.today()
FIN = hoy.year - 1  # ultimo anio completo
ALFA = 0.05
URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"
CONSULTA = {"parameters": ",".join(PARAMS), "community": "AG", "latitude": LAT, "longitude": LON,
            "start": INICIO, "end": FIN, "format": "JSON"}
CACHE = RAIZ / "data" / "cache" / "power" / f"power_monthly_{LAT}_{LON}_{INICIO}_{FIN}.json"
OUT = RAIZ / "data" / "prototipo"


def descargar():
    if CACHE.exists():
        print(f"Usando cache: {CACHE}")
        return json.loads(CACHE.read_text(encoding="utf-8")), dt.date.fromtimestamp(CACHE.stat().st_mtime).isoformat()
    r = requests.get(URL, params=CONSULTA, timeout=120)
    if r.status_code != 200:
        sys.exit(f"Error POWER HTTP {r.status_code}: {r.text[:500]}")
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(r.text, encoding="utf-8")
    return r.json(), hoy.isoformat()


def sen_anual_manual(mat):
    """Sen estacional independiente: mediana de pendientes (v_j - v_i)/(anio_j - anio_i) del mismo mes."""
    pend = []
    for m in range(mat.shape[1]):
        c = mat[:, m]
        for i in range(len(c)):
            for j in range(i + 1, len(c)):
                if not (np.isnan(c[i]) or np.isnan(c[j])):
                    pend.append((c[j] - c[i]) / (j - i))
    return float(np.median(pend))


def procesar(datos, fecha):
    cuerpo = datos["properties"]["parameter"]
    relleno = datos["header"]["fill_value"]
    series, tend = {}, {}
    anios = list(range(INICIO, FIN + 1))
    nint = FIN - INICIO  # intervalos anuales
    for v in PARAMS:
        crudo = cuerpo[v]
        unidad = datos["parameters"][v]["units"]
        mat = np.full((len(anios), 12), np.nan)
        for k, val in crudo.items():
            a, m = int(k[:4]), int(k[4:])
            if m == 13 or a not in anios:
                continue
            if val != relleno:  # quita -999
                mat[a - INICIO, m - 1] = val
        n_faltan = int(np.isnan(mat).sum())
        x = mat.reshape(-1)  # orden cronologico, 12 meses por anio
        anual = np.nanmean(mat, axis=1)  # promedio de meses validos (no usa la clave 13)
        series[v] = {"unidades": unidad,
                     "promedio_anual": {str(a): round(float(p), 3) for a, p in zip(anios, anual)}}

        s = mk.seasonal_test(x, period=12, alpha=ALFA)
        c = mk.correlated_seasonal_test(x, period=12, alpha=ALFA)
        sen_chk = sen_anual_manual(mat)
        ols = float(np.polyfit(anios, anual, 1)[0])  # OLS independiente, serie anual promedio
        # pymannkendall: el paso de tiempo es el ciclo completo (anio) => slope ya es por anio
        tend[v] = {
            "variable": v, "nombre": datos["parameters"][v]["longname"], "unidades": unidad,
            "periodo": f"{INICIO}-{FIN}", "n_meses_validos": int(x.size - n_faltan), "n_meses_faltantes": n_faltan,
            "metodo": "pymannkendall 1.4.3 seasonal_test (Mann-Kendall estacional, period=12; su docstring cita "
                      "Hirsch y Slack 1984, varianza sumada sin covarianza entre estaciones) + pendiente de Sen estacional",
            "tendencia_por_anio": round(float(s.slope), 5),
            "cambio_total_estimado": round(float(s.slope) * nint, 4),
            "nota_cambio_total": f"Estimacion lineal: pendiente por anio x {nint} intervalos anuales ({INICIO}-{FIN}); no es una medicion",
            "p_valor": float(f"{s.p:.4g}"), "significativo_alfa_0.05": "si" if s.h else "no",
            "tau": round(float(s.Tau), 4),
            "verificacion_cruzada": {
                "mk_estacional_con_correlacion_entre_estaciones": {
                    "funcion": "pymannkendall.correlated_seasonal_test (Hipel y McLeod 1994)",
                    "p_valor": float(f"{c.p:.4g}"), "significativo_alfa_0.05": "si" if c.h else "no",
                    "tendencia_por_anio": round(float(c.slope), 5)},
                "sen_estacional_manual_por_anio": round(sen_chk, 5),
                "ols_serie_anual_por_anio": round(ols, 5),
                "ols_cambio_total_estimado": round(ols * nint, 4)},
            "fuente": {"dataset": "NASA POWER Monthly (MERRA-2), community AG", "url": URL, "consulta": CONSULTA,
                       "api": datos["header"]["api"], "fecha_descarga": fecha},
            "nota": "prototipo; valores no revisados por Investigacion",
        }
    tend["PRECTOTCORR"]["limitacion"] = (
        "Precipitacion mensual con muchos ceros y distribucion muy asimetrica (lluvia concentrada en jul-oct): "
        "el MK estacional es no parametrico y tolera empates, pero la pendiente de Sen puede quedar cerca de 0 "
        "y el cambio total no capta variaciones de eventos extremos; dato de reanalisis ~50 km, no de pluviometro.")
    return series, tend


def main():
    datos, fecha = descargar()
    series, tend = procesar(datos, fecha)
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {"prototipo": True, "nota": "prototipo; valores no revisados por Investigacion",
            "punto": {"lat": LAT, "lon": LON,
                      "fuente_coordenadas": "Wikipedia, infobox La Paz (24.1486, -110.3067), redondeado; ver skill earthdata-datasets"},
            "generado_con": "analisis/prototipo_power.py (codigo generado con IA, Claude)", "fecha_descarga": fecha}
    (OUT / "power_lapaz_series.json").write_text(
        json.dumps({**meta, "series": series}, ensure_ascii=False, indent=1), encoding="utf-8")
    (OUT / "power_lapaz_tendencias.json").write_text(
        json.dumps({**meta, "tendencias": list(tend.values())}, ensure_ascii=False, indent=1), encoding="utf-8")
    for t in tend.values():
        v = t["verificacion_cruzada"]
        print(f"\n{t['variable']} ({t['unidades']}) {t['periodo']}, meses faltantes={t['n_meses_faltantes']}")
        print(f"  MK estacional: p={t['p_valor']} signif={t['significativo_alfa_0.05']} tau={t['tau']}")
        print(f"  Sen/anio={t['tendencia_por_anio']}  cambio total={t['cambio_total_estimado']}")
        print(f"  MK corr. entre estaciones: p={v['mk_estacional_con_correlacion_entre_estaciones']['p_valor']}")
        print(f"  Sen manual/anio={v['sen_estacional_manual_por_anio']}  OLS anual/anio={v['ols_serie_anual_por_anio']}  OLS cambio total={v['ols_cambio_total_estimado']}")


if __name__ == "__main__":
    main()
