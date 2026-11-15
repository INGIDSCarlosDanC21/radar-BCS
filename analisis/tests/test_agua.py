import datetime as dt

import numpy as np
import pytest

from analisis import agua


def test_celda_cercana_con_longitudes_0_360():
    lats = np.arange(-89.75, 90, 0.5)
    lons = np.arange(0.25, 360, 0.5)
    i, j = agua.celda_cercana(lats, lons, 24.14, -110.31)
    assert lats[i] == pytest.approx(24.25) and lons[j] == pytest.approx(249.75)


def test_fecha_dias_desde_2002():
    assert agua.fecha(0) == dt.date(2002, 1, 1)
    assert agua.fecha(105.5) == dt.date(2002, 4, 16)


def test_hueco_queda_en_nan_no_en_cero():
    lecturas = [(2017, m, 1.0) for m in range(1, 7)] + [(2018, m, 1.0) for m in range(6, 13)]
    mat = agua.matriz_grace(lecturas, 2018, inicio=2017)
    assert np.isnan(mat[0, 6:]).all() and np.isnan(mat[1, :5]).all()


def test_promedio_anual_exige_meses_minimos():
    mat = np.full((2, 12), np.nan)
    mat[0, :9] = 2.0
    mat[1, :8] = 5.0
    a = agua.promedio_anual_minimo(mat)
    assert a[0] == 2.0 and np.isnan(a[1])


def test_p_valor_del_agua_corrige_autocorrelacion():
    from analisis import exportar, tendencias as t
    rng = np.random.default_rng(2)
    mat = np.cumsum(rng.normal(0, 0.3, 24 * 12)).reshape(24, 12) + np.arange(24)[:, None] * 0.05
    ind = exportar._agua(mat, "2026-11-14", 2025)
    assert ind["significancia"]["p_valor"] == pytest.approx(
        float(f"{t.tendencia_estacional_correlacionada(mat)['p_valor']:.4g}"))
    assert "autocorrelación" in ind["significancia"]["metodo"]
