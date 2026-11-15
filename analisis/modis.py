"""MODIS (AppEEARS, puntos por zona) -> matrices mensuales por zona y de la ciudad.

Lee los CSV de data/cache/appeears/usuario/ (6 zonas de La Paz); si no están, usa los de la tarea del pipeline.
Filtros (declarados en la limitación de cada indicador):
  LST (MOD11A2): se descartan rellenos (0) y calidad MODLAND 0b10/0b11 (nubes o sin producir); LST en K -> °C.
  NDVI (MOD13Q1): se descartan rellenos (< -2000) y calidad MODLAND 0b10/0b11.
Cada mes vale el promedio de las composiciones (8 o 16 días) fechadas en ese mes.
"""
import csv
from pathlib import Path

import numpy as np

from analisis.descargar import RAIZ

CACHE = RAIZ / "data" / "cache" / "appeears"
BUENA = {"0b00", "0b01"}
LST = {"prefijo": "MOD11A2_061", "valor": "MOD11A2_061_LST_Day_1km", "calidad": "MOD11A2_061_QC_Day_MODLAND"}
NDVI = {"prefijo": "MOD13Q1_061", "valor": "MOD13Q1_061__250m_16_days_NDVI",
        "calidad": "MOD13Q1_061__250m_16_days_VI_Quality_MODLAND"}


def leer(rutas, capa, convertir=lambda v: v, valido=lambda v: True):
    """Devuelve {zona: [(año, mes, valor)]} con solo las lecturas válidas.

    `rutas` es un CSV o una lista (2001-2025 y 2026); una composición repetida (misma zona y fecha) cuenta una vez.
    """
    zonas, vistos = {}, set()
    for ruta in ([rutas] if isinstance(rutas, (str, Path)) else rutas):
        with open(ruta, encoding="utf-8") as f:
            for r in csv.DictReader(f):
                if (r["Category"], r["Date"]) in vistos:
                    continue
                vistos.add((r["Category"], r["Date"]))
                try:
                    v = float(r[capa["valor"]])
                except ValueError:
                    continue
                if r[capa["calidad"]] not in BUENA or not valido(v):
                    continue
                anio, mes = int(r["Date"][:4]), int(r["Date"][5:7])
                zonas.setdefault(r["Category"], []).append((anio, mes, convertir(v)))
    return zonas


def matriz(lecturas, inicio, fin):
    """Matriz (años x 12): promedio mensual; NaN si el mes no tiene lecturas válidas."""
    suma = np.zeros((fin - inicio + 1, 12))
    n = np.zeros_like(suma)
    for anio, mes, v in lecturas:
        if inicio <= anio <= fin:
            suma[anio - inicio, mes - 1] += v
            n[anio - inicio, mes - 1] += 1
    with np.errstate(all="ignore"):
        return np.where(n > 0, suma / n, np.nan)


def ciudad(mats):
    """Promedio de las zonas mes a mes (ignora NaN)."""
    with np.errstate(all="ignore"):
        return np.nanmean(np.stack(list(mats.values())), axis=0)


def ruta_csv(producto):
    for carpeta in ("usuario", f"{producto}.061"):
        for p in sorted((CACHE / carpeta).glob(f"*{producto}*results.csv")):
            return p
    raise FileNotFoundError(f"No hay CSV de {producto} en {CACHE}")


def rutas_csv(producto):
    """CSV de usuario (2001-2025) más los de las tareas de zonas (p. ej. 2026), si existen."""
    extra = sorted((CACHE / f"{producto}.061-zonas-2026").glob(f"*{producto}*results.csv"))
    return [ruta_csv(producto)] + extra


def anio_final(producto):
    """Último año con alguna lectura válida de ese producto."""
    capa, conv, ok = ((LST, lambda k: k - 273.15, lambda v: v > 0) if producto == "MOD11A2"
                      else (NDVI, lambda v: v, lambda v: v > -2000))
    return max(a for z in leer(rutas_csv(producto), capa, conv, ok).values() for a, _, _ in z)


def cargar(inicio, fin, fin_ndvi=None):
    """Devuelve (mats_lst_por_zona, mats_ndvi_por_zona) en °C y NDVI; cada producto llega hasta su año final."""
    lst = leer(rutas_csv("MOD11A2"), LST, lambda k: k - 273.15, lambda v: v > 0)
    ndvi = leer(rutas_csv("MOD13Q1"), NDVI, valido=lambda v: v > -2000)
    return ({z: matriz(l, inicio, fin) for z, l in lst.items()},
            {z: matriz(l, inicio, fin_ndvi or fin) for z, l in ndvi.items()})
