import pytest

from analisis import correlacion


def _s(vals, ini=2001):
    return [{"anio": ini + i, "valor": v} for i, v in enumerate(vals)]


def test_spearman_monotona_da_uno():
    r = correlacion.spearman_series(_s([1, 2, 3, 4, 5]), _s([10, 20, 35, 50, 90]))
    assert r["rho"] == pytest.approx(1.0) and r["n"] == 5


def test_spearman_usa_solo_anios_con_ambos_datos():
    r = correlacion.spearman_series(_s([1, 2, None, 4, 5]), _s([5, 4, 3, None, 1]))
    assert r["n"] == 3 and r["rho"] == pytest.approx(-1.0)


def test_spearman_pocos_anios_falla():
    with pytest.raises(ValueError):
        correlacion.spearman_series(_s([1, 2]), _s([2, 1]))
