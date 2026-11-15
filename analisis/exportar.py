"""Calcula las tendencias y escribe data/salida/indicadores.json (contrato docs/contrato-datos.md).

Un solo comando:  python -m analisis.exportar        (desde la raíz del repo)
"""
import datetime as dt
import json
import sys
from pathlib import Path

import numpy as np

from analisis import agua, descargar, modis, tendencias as t

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "data" / "salida" / "indicadores.json"
SALIDA_ZONAS = RAIZ / "data" / "salida" / "zonas_tendencias.json"
VERSION_CONTRATO = "0.1"
GENERADO_CON = "analisis/exportar.py (código generado con IA: sí, Claude)"


def _r(x, n=3):
    return None if x is None or np.isnan(x) else round(float(x), n)


def _indicador(id_, titulo, variable, unidades, mat_anual_fn, mat, datos, fecha, inicio, fin,
               fuente_extra, limitacion, anual_simple=False, prueba=None, metodo=None):
    """Arma un indicador a partir de una matriz mensual (años x 12)."""
    anios = list(range(inicio, fin + 1))
    anual = mat_anual_fn(mat)
    est = prueba(mat) if prueba else (t.tendencia_anual(anual) if anual_simple else t.tendencia_estacional(mat))
    pend = est["pendiente_por_anio"]
    claro = est["significativo"]  # sin cambio claro: sin cifra (contrato, anexo 3, aplicado a todos los indicadores)
    return {
        "id": id_, "titulo": titulo, "variable": variable, "unidades": unidades,
        "cambio_total": _r(t.cambio_total(pend, inicio, fin)) if claro else None,
        "cambio_total_nota": (f"pendiente de Sen por año × {fin - inicio} intervalos anuales ({inicio}-{fin}); estimación, no medición"
                              if claro else "No se detecta un cambio claro; por eso no se muestra una cifra de cambio."),
        "tendencia_por_decada": _r(pend * 10) if claro else None,
        "por_decada": [{"decada": d["decada"], "media": _r(d["media"])}
                       for d in t.por_decada(anios, anual, inicio, fin)],
        "significancia": {"metodo": metodo or ("Mann-Kendall sobre el total anual + pendiente de Sen" if anual_simple else "Mann-Kendall estacional + pendiente de Sen"), "p_valor": float(f"{est['p_valor']:.4g}"),
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


def _parcial(mat, fin):
    """Frase para la limitación cuando el último año no está completo."""
    if not np.isnan(mat[-1]).any():
        return ""
    return (f" El año {fin} es parcial: entra a la prueba de tendencia mensual, pero no al promedio anual ni a la media por década.")


def _deriva(fin_lst, fin):
    """Nota cuando el calor se corta antes del último año: Terra pasa cada vez más temprano desde 2022."""
    if fin_lst >= fin:
        return ""
    return (f" El periodo termina en {fin_lst} a propósito: desde 2022 el satélite Terra pasa cada vez más temprano "
            "(hora local media de 10.8 h a 9.2 h en 2026, según el campo Day_view_time de MOD11A2), la superficie "
            "se mide antes de calentarse y la serie baja de forma artificial. Es lo más probable, no está probado que lo explique todo. "
            "El cambio del aire se calcula con todo el periodo de POWER.")


FUENTE_MODIS ={"url": "https://appeears.earthdatacloud.nasa.gov/", "resolucion": "MODIS, 6 puntos de La Paz (promedio de zonas)"}


def _vegetacion(ndvi_zonas, fecha, inicio, fin):
    mat = modis.ciudad(ndvi_zonas)
    return _indicador(
        "vegetacion", "Vegetación", "NDVI (MODIS MOD13Q1 V061, 250 m), promedio de 6 zonas", "NDVI", t.promedio_anual_sin_parcial,
        mat, None, fecha, inicio, fin,
        {**FUENTE_MODIS, "dataset": "MODIS MOD13Q1.061 (NDVI) vía NASA AppEEARS"},
        "Se descartan lecturas de relleno y de calidad baja (MODLAND 0b10/0b11); algunos meses de zonas urbanas quedan "
        "sin dato. El NDVI de un punto de 250 m no representa toda la ciudad. No indica la causa del cambio." + _parcial(mat, fin))


def _agua(mat, fecha, fin):
    return _indicador(
        "agua", "Agua", "Anomalía de agua total almacenada (GRACE/GRACE-FO, JPL Mascon CRI RL06.3Mv04), celda de La Paz",
        "cm", agua.promedio_anual_minimo, mat, None, fecha, agua.INICIO, fin,
        {"dataset": "JPL GRACE and GRACE-FO Mascon CRI RL06.3Mv04 (PO.DAAC)", "url": agua.DOI,
         "resolucion": "malla de 0.5° (interpolada de mascones de 3°); señal regional de cientos de km"},
        "Tendencia REGIONAL del agua total almacenada (suelo, agua subterránea y superficial), no del acuífero de La Paz. "
        "Es una anomalía respecto a un promedio de referencia, en cm de agua equivalente. El periodo va de 2002 al último mes publicado "
        f"(el año {fin} es parcial: entra a la prueba de tendencia mensual, no al promedio anual); "
        "faltan meses (hueco entre GRACE y GRACE-FO) y se promedian solo los años con al menos 9 meses. "
        "El p-valor corrige la autocorrelación entre meses (la prueba estacional simple da uno mucho menor, demasiado optimista). "
        "No indica la causa.",
        prueba=t.tendencia_estacional_correlacionada,
        metodo="Mann-Kendall estacional con corrección por autocorrelación + pendiente de Sen")


def zonas(lst, ndvi, inicio, fin):
    """Tendencia por zona (LST en °C y NDVI); archivo auxiliar, no forma parte del contrato v0.1."""
    sal = {}
    for nombre, mats, unidad in (("calor_lst", lst, "°C"), ("vegetacion_ndvi", ndvi, "NDVI")):
        for z, m in mats.items():
            fin = inicio + m.shape[0] - 1  # cada producto llega hasta su último año
            e = t.tendencia_estacional(m)
            sal.setdefault(z, {})[nombre] = {
                "unidades": unidad, "pendiente_por_anio": _r(e["pendiente_por_anio"], 4),
                "cambio_total": _r(t.cambio_total(e["pendiente_por_anio"], inicio, fin), 3),
                "p_valor": float(f"{e['p_valor']:.4g}"), "significativo": e["significativo"],
                "meses_sin_dato": int(np.isnan(m).sum())}
    return sal


def construir(datos, fecha, inicio=descargar.INICIO, fin=None, ndvi_zonas=None, lst_mat=None, agua_mat=None, fin_agua=None,
              fin_lst=None, fin_ndvi=None):
    fin = fin or descargar.ultimo_anio_completo()
    fuente_power = {"url": descargar.DOCS, "resolucion": "reanálisis MERRA-2, ~50 km (no es medición local)"}
    t2m = t.matriz_mensual(datos, "T2M", inicio, fin)
    lluvia = t.mm_por_mes(t.matriz_mensual(datos, "PRECTOTCORR", inicio, fin), inicio)
    est_aire = t.tendencia_estacional(t2m)
    fin_lst, fin_ndvi = fin_lst or fin, fin_ndvi or fin
    if lst_mat is not None:
        calor = _indicador(
            "calor", "Calor", "Temperatura de superficie de día (MODIS MOD11A2 LST), promedio de 6 zonas", "°C",
            t.promedio_anual_sin_parcial, lst_mat, datos, fecha, inicio, fin_lst,
            {**FUENTE_MODIS, "dataset": "MODIS MOD11A2.061 (LST_Day_1km) vía NASA AppEEARS", "resolucion": "1 km, 6 puntos de La Paz (promedio de zonas)"},
            "Temperatura de la superficie (suelo y techos), no del aire. Se descartan lecturas de relleno y nubes. "
            f"La temperatura del aire (NASA POWER, reanálisis ~50 km) sí sube: {est_aire['pendiente_por_anio'] * (fin - inicio):+.2f} °C en {inicio}-{fin}; "
            "miden cosas distintas y no se explica la diferencia." + _parcial(lst_mat, fin_lst) + _deriva(fin_lst, fin))
    else:
        calor = _indicador(
            "calor", "Calor", "Temperatura del aire a 2 m (NASA POWER T2M)", "°C", t.promedio_anual, t2m, datos, fecha,
            inicio, fin, {**fuente_power, "dataset": "NASA POWER Monthly (MERRA-2), parámetro T2M, community AG"},
            "Es temperatura del aire (reanálisis ~50 km), no de la superficie. Pendiente: MODIS MOD11A2.")
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
            _vegetacion(ndvi_zonas, fecha, inicio, fin_ndvi) if ndvi_zonas else
            _vacio("vegetacion", "Vegetación", "Pendiente: MODIS MOD13Q1 (NDVI)."),
            rain,
            _agua(agua_mat, fecha, fin_agua or fin) if agua_mat is not None else
            _vacio("agua", "Agua", "Pendiente: GRACE (tendencia regional)."),
        ],
    }


def main():
    datos, fecha = descargar.descargar_power()
    inicio, fin = descargar.INICIO, descargar.ultimo_anio_completo()
    fin_lst, fin_ndvi = modis.anio_final("MOD11A2", modis.tope_calor(sys.argv)), modis.anio_final("MOD13Q1")
    lst, ndvi = modis.cargar(inicio, fin_lst, fin_ndvi)
    ruta, fecha_grace = agua.descargar_grace()
    lecturas = agua.leer(ruta)
    fin_agua = max(a for a, _, _ in lecturas)  # lo más reciente que tenga GRACE (2026 parcial)
    mat_agua = agua.matriz_grace(lecturas, fin_agua)
    salida = construir(datos, fecha, inicio, fin, ndvi, modis.ciudad(lst), mat_agua, fin_agua, fin_lst, fin_ndvi)
    salida["indicadores"][3]["fuente"]["fecha_descarga"] = fecha_grace
    SALIDA_ZONAS.write_text(json.dumps({"generado_con": GENERADO_CON, "periodo": {"inicio": inicio, "fin": fin_lst},
                                        "zonas": zonas(lst, ndvi, inicio, fin_lst)}, ensure_ascii=False, indent=1), encoding="utf-8")
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    for i in salida["indicadores"]:
        print(i["id"], i["cambio_total"], i["unidades"], i["significancia"]["significativo"])
    print(f"Escrito {SALIDA} ({SALIDA.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
