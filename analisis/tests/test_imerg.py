import numpy as np
import pytest

from analisis import imerg

CSV = """Dataset: x.HDF5
/Grid/precipitation[0][0], 0.001, 0.003, -9999.9, 0.003, 0.003
/Grid/precipitation[0][1], 0.004, 0.004, 0.003, 0.004, 0.002
"""


def test_parsear_csv_convierte_relleno_en_nan():
    m = imerg.parsear_csv(CSV)
    assert m.shape == (2, 5) and m[0, 0] == pytest.approx(0.001)
    assert np.isnan(m[0, 2]) and not np.isnan(m[1]).any()


def test_totales_anuales_mm_por_hora_a_mm_del_mes():
    datos = {f"2001-{m:02d}": np.full((imerg.N, imerg.N), 0.01).tolist() for m in range(1, 13)}
    anios, t = imerg.totales_anuales(datos, 2001, 2002)
    assert t[0, 0, 0] == pytest.approx(0.01 * 365 * 24)   # 87.6 mm
    assert np.isnan(t[1]).all()                            # 2002 sin datos: NaN, no cero


def test_anio_con_mes_faltante_queda_en_nan():
    datos = {f"2001-{m:02d}": np.ones((imerg.N, imerg.N)).tolist() for m in range(1, 12)}
    assert np.isnan(imerg.totales_anuales(datos, 2001, 2001)[1]).all()


def test_tendencia_conocida_y_serie_corta():
    pytest.importorskip("pymannkendall")
    t = imerg.tendencia(np.arange(24) * 2.0 + 100)
    assert t["pendiente_mm_anio"] == pytest.approx(2.0) and t["p"] < 0.01
    assert imerg.tendencia([1, 2, 3]) is None
    assert imerg.tendencia([1.0] * 11 + [float("nan")] * 3) is None


def test_celdas_cubren_la_paz():
    assert LONS_OK(imerg.LONS, -110.31) and LONS_OK(imerg.LATS, 24.14)


def LONS_OK(v, x):
    return min(v) <= x <= max(v)
