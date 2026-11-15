import datetime as dt

from analisis import pesca_erddap as pe

FIN = dt.date(2026, 11, 7)
CSV = """time,altitude,latitude,longitude,chla
UTC,m,degrees_north,degrees_east,mg m^-3
2026-11-02T12:00:00Z,0.0,24.25125,-110.35125,NaN
2026-11-03T12:00:00Z,0.0,24.25125,-110.35125,0.39114523
"""


def test_parsear_nan_a_none_y_redondeo():
    s = pe.parsear(CSV, "chla")
    assert s[0]["valor"] is None
    assert s[1] == {"fecha": "2026-11-03", "valor": 0.391, "lat": 24.25125, "lon": -110.35125}


def test_url_clorofila_lleva_altitud_y_sst_no():
    assert "%5B(0.0)%5D" in pe.url_punto("clorofila", 24.25, -110.35, FIN)
    assert "%5B(0.0)%5D" not in pe.url_punto("sst", 24.25, -110.35, FIN)
    assert "(2026-11-01):1:(2026-11-07)" in pe.url_punto("sst", 24.25, -110.35, FIN)


def test_ocho_puertos_como_la_web():
    assert len(pe.PUERTOS) == 8 and pe.PUERTOS["lapaz"][1:] == (24.25, -110.35)
