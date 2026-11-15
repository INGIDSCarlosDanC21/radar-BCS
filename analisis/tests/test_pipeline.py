import numpy as np
import pytest

from analisis import exportar, tendencias as t

INI, FIN = 2001, 2025
ANIOS = FIN - INI + 1


def _datos_power(t2m, lluvia, relleno=-999.0):
    """Respuesta falsa con la misma forma que NASA POWER mensual (matrices años x 12)."""
    def a_dict(m):
        return {f"{INI + i}{j + 1:02d}": float(m[i, j]) for i in range(m.shape[0]) for j in range(12)}
    return {"header": {"fill_value": relleno},
            "properties": {"parameter": {"T2M": a_dict(t2m), "PRECTOTCORR": a_dict(lluvia)}}}


def _serie(pend, ruido=0.0, seed=0):
    rng = np.random.default_rng(seed)
    ciclo = 8 * np.sin(2 * np.pi * np.arange(12) / 12)
    return 25 + ciclo[None, :] + pend * np.arange(ANIOS)[:, None] + rng.normal(0, ruido, (ANIOS, 12))


def test_sen_recupera_pendiente_conocida():
    r = t.tendencia_estacional(_serie(0.05))
    assert r["pendiente_por_anio"] == pytest.approx(0.05, abs=1e-6)
    assert r["significativo"] is True


def test_sin_tendencia_no_es_significativa():
    r = t.tendencia_estacional(_serie(0.0, ruido=1.0, seed=3))
    assert r["significativo"] is False
    assert abs(r["pendiente_por_anio"]) < 0.05


def test_tendencia_anual_recupera_pendiente_y_sin_tendencia():
    r = t.tendencia_anual(np.arange(ANIOS) * 2.0 + 100)
    assert r["pendiente_por_anio"] == pytest.approx(2.0) and r["significativo"] is True
    rng = np.random.default_rng(5)
    assert t.tendencia_anual(rng.normal(100, 10, ANIOS))["significativo"] is False
    assert t.tendencia_anual([1.0, np.nan, 2.0, 3.0, 4.0, 5.0, 6.0])["pendiente_por_anio"] == pytest.approx(1.0)


def test_p_valor_nunca_es_cero_con_tendencia_muy_fuerte():
    r = t.tendencia_estacional(_serie(0.5))
    assert 0 < r["p_valor"] < 1e-6


def test_cambio_total_usa_intervalos():
    assert t.cambio_total(0.05, 2001, 2025) == pytest.approx(1.2)


def test_faltantes_y_relleno_son_nan():
    m = _serie(0.0)
    m[3, 4] = -999.0
    mat = t.matriz_mensual(_datos_power(m, m), "T2M", INI, FIN)
    assert np.isnan(mat[3, 4]) and np.isnan(mat).sum() == 1


def test_clave_anual_mes13_se_ignora():
    datos = _datos_power(_serie(0.0), _serie(0.0))
    datos["properties"]["parameter"]["T2M"]["200113"] = 999.0
    assert not (t.matriz_mensual(datos, "T2M", INI, FIN) == 999.0).any()


def test_suma_anual_con_mes_faltante_es_nan():
    m = np.ones((2, 12))
    m[1, 0] = np.nan
    s = t.suma_anual(m)
    assert s[0] == 12 and np.isnan(s[1])


def test_mm_por_mes_bisiesto():
    m = t.mm_por_mes(np.ones((1, 12)), 2004)  # 2004 es bisiesto
    assert m[0, 1] == 29 and m[0, 0] == 31


def test_por_decada_etiquetas_y_media():
    anios = list(range(2001, 2026))
    filas = t.por_decada(anios, [1.0] * 10 + [2.0] * 10 + [3.0] * 5, 2001, 2025)
    assert [f["decada"] for f in filas] == ["2001-2010", "2011-2020", "2021-2025"]
    assert [f["media"] for f in filas] == [1.0, 2.0, 3.0]


def test_salida_cumple_contrato():
    t2m = _serie(0.06)
    lluvia = np.abs(_serie(0.0, ruido=0.5, seed=1)) / 10
    salida = exportar.construir(_datos_power(t2m, lluvia), "2026-11-14", INI, FIN)
    assert salida["version_contrato"] == "0.1" and salida["datos_de_prueba"] is False
    assert [i["id"] for i in salida["indicadores"]] == ["calor", "vegetacion", "lluvia", "agua"]
    claves = {"id", "titulo", "variable", "unidades", "cambio_total", "cambio_total_nota", "tendencia_por_decada",
              "por_decada", "significancia", "serie_anual", "fuente", "limitacion"}
    for i in salida["indicadores"]:
        assert set(i) == claves
    calor, veg, lluvia_i, agua = salida["indicadores"]
    assert calor["unidades"] == "°C" and calor["cambio_total"] == pytest.approx(1.44, abs=0.01)
    assert lluvia_i["unidades"] == "mm/año" and len(lluvia_i["serie_anual"]) == ANIOS
    for vacio in (veg, agua):
        assert vacio["cambio_total"] is None and vacio["significancia"]["significativo"] is None
        assert vacio["fuente"] is None
    assert calor["fuente"]["dataset"] and calor["fuente"]["url"] and calor["fuente"]["fecha_descarga"] == "2026-11-14"
