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
               fuente_extra, limitacion, anual_simple=False, prueba=None, metodo=None, en=None):
    """Arma un indicador a partir de una matriz mensual (años x 12)."""
    anios = list(range(inicio, fin + 1))
    anual = mat_anual_fn(mat)
    est = prueba(mat) if prueba else (t.tendencia_anual(anual) if anual_simple else t.tendencia_estacional(mat))
    pend = est["pendiente_por_anio"]
    claro = est["significativo"]  # sin cambio claro: sin cifra (contrato, anexo 3, aplicado a todos los indicadores)
    en = en or {}
    metodo_es = metodo or ("Mann-Kendall sobre el total anual + pendiente de Sen" if anual_simple else "Mann-Kendall estacional + pendiente de Sen")
    return {
        "id": id_, "titulo": titulo, "titulo_en": en.get("titulo"), "variable": variable, "variable_en": en.get("variable"),
        "unidades": unidades,
        "cambio_total": _r(t.cambio_total(pend, inicio, fin)) if claro else None,
        "cambio_total_nota": (f"pendiente de Sen por año × {fin - inicio} intervalos anuales ({inicio}-{fin}); estimación, no medición"
                              if claro else "No se detecta un cambio claro; por eso no se muestra una cifra de cambio."),
        "cambio_total_nota_en": (f"Sen's slope per year × {fin - inicio} yearly intervals ({inicio}-{fin}); an estimate, not a measurement"
                                 if claro else "No clear change is detected, so no change figure is shown."),
        "tendencia_por_decada": _r(pend * 10) if claro else None,
        "por_decada": [{"decada": d["decada"], "media": _r(d["media"])}
                       for d in t.por_decada(anios, anual, inicio, fin)],
        "significancia": {"metodo": metodo_es, "metodo_en": en.get("metodo"), "p_valor": float(f"{est['p_valor']:.4g}"),
                          "alfa": t.ALFA, "significativo": est["significativo"]},
        "serie_anual": [{"anio": a, "valor": _r(v)} for a, v in zip(anios, anual)],
        "fuente": {**fuente_extra, "dataset_en": fuente_extra.get("dataset_en") or fuente_extra["dataset"].replace(" vía ", " via ").replace("parámetro", "parameter"),
                   "periodo": f"{inicio}-{fin}", "fecha_descarga": fecha},
        "limitacion": limitacion, "limitacion_en": en.get("limitacion"),
    }


def _vacio(id_, titulo, pendiente):
    return {"id": id_, "titulo": titulo, "titulo_en": None, "variable": None, "variable_en": None, "unidades": None,
            "cambio_total": None, "cambio_total_nota": None, "cambio_total_nota_en": None, "tendencia_por_decada": None,
            "por_decada": [],
            "significancia": {"metodo": None, "metodo_en": None, "p_valor": None, "alfa": None, "significativo": None},
            "serie_anual": [], "fuente": None, "limitacion": pendiente, "limitacion_en": None}


def _parcial(mat, fin):
    """Frase para la limitación cuando el último año no está completo."""
    if not np.isnan(mat[-1]).any():
        return ""
    return (f" El año {fin} es parcial: entra a la prueba de tendencia mensual, pero no al promedio anual ni a la media por década.")


def _parcial_en(mat, fin):
    if not np.isnan(mat[-1]).any():
        return ""
    return f" The year {fin} is partial: it enters the monthly trend test, but not the annual average or the decade average."


FUENTE_MODIS = {"url": "https://appeears.earthdatacloud.nasa.gov/", "resolucion": "MODIS, 6 puntos de La Paz (promedio de zonas)",
                "resolucion_en": "MODIS, 6 points in La Paz (average of the zones)"}


def _vegetacion(ndvi_zonas, fecha, inicio, fin):
    mat = modis.ciudad(ndvi_zonas)
    return _indicador(
        "vegetacion", "Vegetación", "NDVI (MODIS MOD13Q1 V061, 250 m), promedio de 6 zonas", "NDVI", t.promedio_anual_sin_parcial,
        mat, None, fecha, inicio, fin,
        {**FUENTE_MODIS, "dataset": "MODIS MOD13Q1.061 (NDVI) vía NASA AppEEARS"},
        "Se descartan lecturas de relleno y de calidad baja (MODLAND 0b10/0b11); algunos meses de zonas urbanas quedan "
        "sin dato. El NDVI de un punto de 250 m no representa toda la ciudad. No indica la causa del cambio." + _parcial(mat, fin),
        en={"titulo": "Vegetation", "variable": "NDVI (MODIS MOD13Q1 V061, 250 m), average of 6 zones",
            "metodo": "Seasonal Mann-Kendall + Sen's slope",
            "limitacion": "Fill values and low-quality readings are discarded (MODLAND 0b10/0b11); some months in urban zones have no data. "
                          "The NDVI of a 250 m point does not represent the whole city. It does not tell the cause of the change." + _parcial_en(mat, fin)})


def _agua(mat, fecha, fin):
    return _indicador(
        "agua", "Agua", "Anomalía de agua total almacenada (GRACE/GRACE-FO, JPL Mascon CRI RL06.3Mv04), celda de La Paz",
        "cm", agua.promedio_anual_minimo, mat, None, fecha, agua.INICIO, fin,
        {"dataset": "JPL GRACE and GRACE-FO Mascon CRI RL06.3Mv04 (PO.DAAC)", "url": agua.DOI,
         "resolucion": "malla de 0.5° (interpolada de mascones de 3°); señal regional de cientos de km",
         "resolucion_en": "0.5° grid (interpolated from 3° mascons); regional signal of hundreds of km",
         "dataset_en": "JPL GRACE and GRACE-FO Mascon CRI RL06.3Mv04 (PO.DAAC)"},
        "Tendencia REGIONAL del agua total almacenada (suelo, agua subterránea y superficial), no del acuífero de La Paz. "
        "Es una anomalía respecto a un promedio de referencia, en cm de agua equivalente. El periodo va de 2002 al último mes publicado "
        f"(el año {fin} es parcial: entra a la prueba de tendencia mensual, no al promedio anual); "
        "faltan meses (hueco entre GRACE y GRACE-FO) y se promedian solo los años con al menos 9 meses. "
        "El p-valor corrige la autocorrelación entre meses (la prueba estacional simple da uno mucho menor, demasiado optimista). "
        "No indica la causa.",
        prueba=t.tendencia_estacional_correlacionada,
        metodo="Mann-Kendall estacional con corrección por autocorrelación + pendiente de Sen",
        en={"titulo": "Water", "variable": "Total water storage anomaly (GRACE/GRACE-FO, JPL Mascon CRI RL06.3Mv04), La Paz grid cell",
            "metodo": "Seasonal Mann-Kendall with autocorrelation correction + Sen's slope",
            "limitacion": "REGIONAL trend of total stored water (soil, groundwater and surface water), not of the La Paz aquifer. "
                          "It is an anomaly against a reference average, in cm of water equivalent. The period goes from 2002 to the last published month "
                          f"(the year {fin} is partial: it enters the monthly trend test, not the annual average); "
                          "months are missing (gap between GRACE and GRACE-FO) and only years with at least 9 months are averaged. "
                          "The p-value corrects for autocorrelation between months (the plain seasonal test gives a much lower, too optimistic one). "
                          "It does not tell the cause."})


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


def construir(datos, fecha, inicio=descargar.INICIO, fin=None, ndvi_zonas=None, agua_mat=None, fin_agua=None, fin_ndvi=None):
    fin = fin or descargar.ultimo_anio_completo()
    fuente_power = {"url": descargar.DOCS, "resolucion": "reanálisis MERRA-2, ~50 km (no es medición local)",
                    "resolucion_en": "MERRA-2 reanalysis, ~50 km (not a local measurement)"}
    t2m = t.matriz_mensual(datos, "T2M", inicio, fin)
    lluvia = t.mm_por_mes(t.matriz_mensual(datos, "PRECTOTCORR", inicio, fin), inicio)
    fin_ndvi = fin_ndvi or fin
    # Opción B (docs/decisiones.md, 2026-11-15): el calor es el del aire (POWER T2M); la superficie MODIS es "no concluyente"
    # porque Aqua no confirma a Terra (python -m analisis.contraste_aqua). MODIS sigue en zonas.py y en el contraste.
    calor = _indicador(
        "calor", "Calor", "Temperatura del aire a 2 m (NASA POWER T2M)", "°C", t.promedio_anual, t2m, datos, fecha,
        inicio, fin, {**fuente_power, "dataset": "NASA POWER Monthly (MERRA-2), parámetro T2M, community AG"},
        "Es temperatura del aire a 2 m (reanálisis MERRA-2, ~50 km), no una medición local ni de la superficie. "
        "La temperatura de la superficie (MODIS) no es la cifra principal porque no es concluyente: Terra da +0.9 °C en 2001-2021 (p = 0.0003) "
        "pero Aqua, en los mismos puntos, da +0.27 °C en 2003-2021 (p = 0.29, sin cambio claro), y la hora de paso de ambos satélites "
        "se mueve desde 2022. No se explica la diferencia entre aire y superficie. No indica la causa del cambio.",
        en={"titulo": "Heat", "variable": "Air temperature at 2 m (NASA POWER T2M)", "metodo": "Seasonal Mann-Kendall + Sen's slope",
            "limitacion": "This is air temperature at 2 m (MERRA-2 reanalysis, ~50 km), not a local measurement nor surface temperature. "
                          "Surface temperature (MODIS) is not the main figure because it is inconclusive: Terra gives +0.9 °C in 2001-2021 (p = 0.0003) "
                          "but Aqua, at the same points, gives +0.27 °C in 2003-2021 (p = 0.29, no clear change), and the overpass time of both satellites "
                          "has been shifting since 2022. The difference between air and surface is not explained. It does not tell the cause of the change."})
    rain = _indicador(
        "lluvia", "Lluvia", "Precipitación corregida (NASA POWER PRECTOTCORR), total anual", "mm/año", t.suma_anual,
        lluvia, datos, fecha, inicio, fin,
        {**fuente_power, "dataset": "NASA POWER Monthly (MERRA-2), parámetro PRECTOTCORR, community AG"},
        "Lluvia concentrada en pocos meses y muy variable de un año a otro; la tendencia se calcula con el total anual. "
        "Dato de reanálisis (~50 km), no de pluviómetro.", anual_simple=True,
        en={"titulo": "Rain", "variable": "Corrected precipitation (NASA POWER PRECTOTCORR), annual total",
            "metodo": "Mann-Kendall on the annual total + Sen's slope",
            "limitacion": "Rain is concentrated in a few months and varies a lot from year to year; the trend is computed with the annual total. "
                          "Reanalysis data (~50 km), not a rain gauge."})
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
    salida = construir(datos, fecha, inicio, fin, ndvi, mat_agua, fin_agua, fin_ndvi)
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
