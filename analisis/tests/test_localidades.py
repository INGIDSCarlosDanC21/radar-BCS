import json

import numpy as np

from analisis import localidades as L


def _power(t2m_fn, lluvia_fn, inicio=2001, fin=2025, lat=24.14, lon=-110.31):
    """JSON mínimo con la forma de NASA POWER mensual."""
    par = {"T2M": {}, "PRECTOTCORR": {}}
    for a in range(inicio, fin + 1):
        for m in range(1, 13):
            par["T2M"][f"{a}{m:02d}"] = t2m_fn(a, m)
            par["PRECTOTCORR"][f"{a}{m:02d}"] = lluvia_fn(a, m)
    return {"geometry": {"coordinates": [lon, lat, 10.0]}, "header": {"fill_value": -999},
            "properties": {"parameter": par}}


def test_38_localidades_sin_repetir_ni_id_ni_geonames():
    assert len(L.LOCALIDADES) == 38
    assert len({x[0] for x in L.LOCALIDADES}) == 38
    assert len({x[1] for x in L.LOCALIDADES}) == 38
    assert {x[3] for x in L.LOCALIDADES} == {"La Paz", "Los Cabos", "Comondú", "Mulegé", "Loreto"}


def test_las_coordenadas_estan_dentro_de_baja_california_sur():
    for _, _, nombre, _, lat, lon in L.LOCALIDADES:
        assert 22.5 < lat < 28.1 and -115.2 < lon < -109.3, nombre


def test_celda_de_power_son_multiplos_de_0_5_y_0_625():
    assert L.celda(24.14, -110.31) == [24.0, -110.0]
    assert L.celda(24.14231, -110.31316) == [24.0, -110.625]   # la ciudad cae en el borde: por eso La Paz usa el punto del proyecto
    assert L.celda(22.89, -109.91) == L.celda(23.05, -109.70) == [23.0, -110.0]


def test_tendencia_clara_da_cifra_y_sin_cambio_da_none():
    sube = _power(lambda a, m: 20 + 0.05 * (a - 2001) + (m % 12) * 0.5, lambda a, m: 1.0)
    r = L.tendencias_localidad(sube)
    assert r["calor"]["significativo"] and abs(r["calor"]["cambio_total"] - 1.2) < 0.05
    rng = np.random.default_rng(1)
    plano = _power(lambda a, m: 22 + (m % 12) * 0.3, lambda a, m: float(rng.uniform(0, 2)))
    r2 = L.tendencias_localidad(plano)
    assert r2["lluvia"]["significativo"] is False and r2["lluvia"]["cambio_total"] is None


def test_construir_marca_las_localidades_que_comparten_celda():
    datos = _power(lambda a, m: 22 + 0.02 * (a - 2001), lambda a, m: 1.0)
    out = L.construir(descargar_fn=lambda la, lo: (datos, "2026-11-15"))
    assert out["celdas_distintas"] < len(out["localidades"]) == 38
    cabo = next(f for f in out["localidades"] if f["id"] == "cabosanlucas")
    assert "sanjosedelcabo" in cabo["comparte_celda_con"]
    assert "cabosanlucas" not in cabo["comparte_celda_con"]
    json.dumps(out, ensure_ascii=False)


def test_la_salida_publicada_coincide_con_indicadores_en_la_paz():
    import pathlib
    raiz = pathlib.Path(__file__).resolve().parents[2] / "data" / "salida"
    loc = json.loads((raiz / "localidades_tendencias.json").read_text(encoding="utf-8"))
    ind = {i["id"]: i for i in json.loads((raiz / "indicadores.json").read_text(encoding="utf-8"))["indicadores"]}
    lp = next(f for f in loc["localidades"] if f["id"] == "lapaz")
    assert lp["calor"]["cambio_total"] == ind["calor"]["cambio_total"]
    assert lp["lluvia"]["significativo"] == ind["lluvia"]["significancia"]["significativo"]
    assert loc["celdas_distintas"] == 21 and loc["periodo"] == {"inicio": 2001, "fin": 2025}
