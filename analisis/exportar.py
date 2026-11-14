"""Calcula las tendencias y escribe data/salida/indicadores.json (contrato docs/contrato-datos.md).

Un solo comando:  python -m analisis.exportar        (desde la raíz del repo)
"""
import datetime as dt
import json
from pathlib import Path

import numpy as np

from analisis import descargar, tendencias as t

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "data" / "salida" / "indicadores.json"
VERSION_CONTRATO = "0.1"
GENERADO_CON = "analisis/exportar.py (código generado con IA: sí, Claude)"


def _r(x, n=3):
    return None if x is None or np.isnan(x) else round(float(x), n)


def _indicador(id_, titulo, variable, unidades, mat_anual_fn, mat, datos, fecha, inicio, fin,
               fuente_extra, limitacion, anual_simple=False):
    """Arma un indicador a partir de una matriz mensual (años x 12)."""
    anios = list(range(inicio, fin + 1))
    anual = mat_anual_fn(mat)
    est = t.tendencia_anual(anual) if anual_simple else t.tendencia_estacional(mat)
    pend = est["pendiente_por_anio"]
    claro = est["significativo"] or not anual_simple  # lluvia sin cambio claro: sin cifra (contrato, anexo 3)
    return {
        "id": id_, "titulo": titulo, "variable": variable, "unidades": unidades,
        "cambio_total": _r(t.cambio_total(pend, inicio, fin)) if claro else None,
        "cambio_total_nota": (f"pendiente de Sen por año × {fin - inicio} intervalos anuales ({inicio}-{fin}); estimación, no medición"
                              if claro else "No se detecta un cambio claro; por eso no se muestra una cifra de cambio."),
        "tendencia_por_decada": _r(pend * 10) if claro else None,
        "por_decada": [{"decada": d["decada"], "media": _r(d["media"])}
                       for d in t.por_decada(anios, anual, inicio, fin)],
        "significancia": {"metodo": ("Mann-Kendall sobre el total anual + pendiente de Sen" if anual_simple else "Mann-Kendall estacional + pendiente de Sen"), "p_valor": float(f"{est['p_valor']:.4g}"),
                          "alfa": t.ALFA, "significativo": est["significativo"]},
        "serie_anual": [{"anio": a, "valor": _r(v)} for a, v in zip(anios, anual)],
        "fuente": {**fuente_extra, "periodo": f"{inicio}-{fin}", "fecha_descarga": fecha},
        "limitacion": limitacion,
    }


def _vacio(id_, titulo, pendiente):
    return {"id": id_, "titulo": titulo, "variable": None, "unidades": None, "cambio_total": None,
            "cambio_total_nota": None, "tendencia_por_decada": None, "por_decada": [],
            "significancia": {"metodo": None, "p_valor": None, "alfa": None, "significativo": None},
            "serie_anual": [], "fuente": None, "limitacion": pendiente}


def construir(datos, fecha, inicio=descargar.INICIO, fin=None):
    fin = fin or descargar.ultimo_anio_completo()
    fuente_power = {"url": descargar.DOCS, "resolucion": "reanálisis MERRA-2, ~50 km (no es medición local)"}
    t2m = t.matriz_mensual(datos, "T2M", inicio, fin)
    lluvia = t.mm_por_mes(t.matriz_mensual(datos, "PRECTOTCORR", inicio, fin), inicio)
    calor = _indicador(
        "calor", "Calor", "Temperatura del aire a 2 m (NASA POWER T2M)", "°C", t.promedio_anual, t2m, datos, fecha,
        inicio, fin, {**fuente_power, "dataset": "NASA POWER Monthly (MERRA-2), parámetro T2M, community AG"},
        "Es temperatura del aire, no de la superficie (LST). Pendiente: MODIS MOD11A2 (requiere cuenta Earthdata).")
    rain = _indicador(
        "lluvia", "Lluvia", "Precipitación corregida (NASA POWER PRECTOTCORR), total anual", "mm/año", t.suma_anual,
        lluvia, datos, fecha, inicio, fin,
        {**fuente_power, "dataset": "NASA POWER Monthly (MERRA-2), parámetro PRECTOTCORR, community AG"},
        "Lluvia concentrada en pocos meses y muy variable de un año a otro; la tendencia se calcula con el total anual. "
        "Dato de reanálisis (~50 km), no de pluviómetro.", anual_simple=True)
    return {
        "version_contrato": VERSION_CONTRATO, "datos_de_prueba": False, "generado": dt.date.today().isoformat(),
        "generado_con": GENERADO_CON, "periodo": {"inicio": inicio, "fin": fin},
        "indicadores": [
            calor,
            _vacio("vegetacion", "Vegetación", "Pendiente: MODIS MOD13Q1 (NDVI, requiere cuenta Earthdata)."),
            rain,
            _vacio("agua", "Agua", "Pendiente: GRACE/GLDAS (tendencia regional)."),
        ],
    }


def main():
    datos, fecha = descargar.descargar_power()
    salida = construir(datos, fecha)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    for i in salida["indicadores"]:
        print(i["id"], i["cambio_total"], i["unidades"], i["significancia"]["significativo"])
    print(f"Escrito {SALIDA} ({SALIDA.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
