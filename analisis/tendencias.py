"""Series mensuales y tendencias: Mann-Kendall estacional + pendiente de Sen.

La pendiente que devuelve pymannkendall.seasonal_test(period=12) es por año (verificada contra una
mediana de pendientes por mes en el prototipo). Los faltantes (valor de relleno de POWER) son NaN.
"""
import calendar

import numpy as np
import pymannkendall as mk

ALFA = 0.05


def matriz_mensual(datos, variable, inicio, fin):
    """Matriz (años x 12) con NaN en faltantes; ignora la clave YYYY13 (promedio anual de POWER)."""
    relleno = datos["header"]["fill_value"]
    mat = np.full((fin - inicio + 1, 12), np.nan)
    for clave, val in datos["properties"]["parameter"][variable].items():
        anio, mes = int(clave[:4]), int(clave[4:])
        if mes == 13 or not inicio <= anio <= fin:
            continue
        if val != relleno:
            mat[anio - inicio, mes - 1] = val
    return mat


def mm_por_mes(mat_mm_dia, inicio):
    """mm/día -> mm/mes multiplicando por los días de cada mes (con bisiesto)."""
    dias = np.array([[calendar.monthrange(inicio + i, m)[1] for m in range(1, 13)]
                     for i in range(mat_mm_dia.shape[0])])
    return mat_mm_dia * dias


def promedio_anual(mat):
    """Media de los meses válidos de cada año (NaN si el año no tiene ninguno)."""
    with np.errstate(all="ignore"):
        return np.nanmean(mat, axis=1)


def suma_anual(mat):
    """Suma anual; NaN si falta algún mes (no se rellena un total incompleto)."""
    return np.where(np.isnan(mat).any(axis=1), np.nan, np.nansum(mat, axis=1))


def tendencia_estacional(mat, alfa=ALFA):
    """MK estacional y Sen sobre la serie cronológica. Devuelve pendiente/año, p, significativo, tau."""
    r = mk.seasonal_test(mat.reshape(-1), period=12, alpha=alfa)
    return {"pendiente_por_anio": float(r.slope), "p_valor": float(r.p),
            "significativo": bool(r.h), "tau": float(r.Tau)}


def tendencia_anual(serie, alfa=ALFA):
    """MK simple y Sen sobre una serie ANUAL (para lluvia: los ceros mensuales anulan el Sen estacional)."""
    v = np.asarray(serie, dtype=float)
    r = mk.original_test(v[~np.isnan(v)], alpha=alfa)
    return {"pendiente_por_anio": float(r.slope), "p_valor": float(r.p),
            "significativo": bool(r.h), "tau": float(r.Tau)}


def cambio_total(pendiente_por_anio, inicio, fin):
    """Estimación lineal: pendiente por año x intervalos anuales (no es una medición)."""
    return pendiente_por_anio * (fin - inicio)


def por_decada(anios, valores, inicio, fin):
    """Media de la serie anual por década; la última puede ser parcial (se etiqueta con su rango real)."""
    filas = []
    ini = inicio
    while ini <= fin:
        fin_d = min(ini + 9, fin)
        sel = [v for a, v in zip(anios, valores) if ini <= a <= fin_d and not np.isnan(v)]
        filas.append({"decada": f"{ini}-{fin_d}", "media": float(np.mean(sel)) if sel else None})
        ini += 10
    return filas
