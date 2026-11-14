import csv

import numpy as np
import pytest

from analisis import modis


def _csv(ruta, filas):
    cols = ["Category", "Date", modis.LST["valor"], modis.LST["calidad"]]
    with open(ruta, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(cols)
        w.writerows(filas)


def test_leer_descarta_relleno_y_mala_calidad_y_convierte_a_celsius(tmp_path):
    ruta = tmp_path / "x.csv"
    _csv(ruta, [("A", "2001-01-01", 300.15, "0b00"), ("A", "2001-01-09", 0.0, "0b01"),
                ("A", "2001-01-17", 310.0, "0b10"), ("A", "2001-02-01", 290.15, "0b01")])
    z = modis.leer(ruta, modis.LST, lambda k: k - 273.15, lambda v: v > 0)
    assert [(a, m) for a, m, _ in z["A"]] == [(2001, 1), (2001, 2)]
    assert z["A"][0][2] == pytest.approx(27.0)


def test_matriz_promedia_por_mes_y_deja_nan():
    m = modis.matriz([(2001, 1, 10.0), (2001, 1, 20.0), (2002, 3, 5.0), (1999, 1, 99.0)], 2001, 2002)
    assert m[0, 0] == 15.0 and m[1, 2] == 5.0 and np.isnan(m[0, 1]) and np.isnan(m).sum() == 22


def test_ciudad_ignora_nan():
    a, b = np.full((1, 12), np.nan), np.ones((1, 12))
    a[0, 0] = 3.0
    c = modis.ciudad({"a": a, "b": b})
    assert c[0, 0] == 2.0 and c[0, 1] == 1.0
