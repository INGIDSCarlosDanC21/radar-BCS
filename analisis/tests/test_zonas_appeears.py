import numpy as np
import pytest

from analisis import appeears, zonas


def test_poligono_pixel_contiene_el_punto_pedido():
    # Centro: tile h07v06, línea 701, muestra 1121 (CSV de AppEEARS), punto 24.153 N, -110.313 O
    p = np.array(zonas.poligono_pixel("h07v06", 701, 1121))
    assert (p[0] == p[-1]).all() and len(p) == 5
    lon, lat = p[:4].mean(0)
    assert abs(lat - 24.153) < 0.01 and abs(lon + 110.313) < 0.01
    # el píxel mide ~1 km de lado
    assert (p[:, 1].max() - p[:, 1].min()) * 111 == pytest.approx(0.93, abs=0.05)


def test_zonas_geojson_cumple_contrato():
    ceros = {"Z": np.full((3, 12), 1.0) + np.arange(36).reshape(3, 12) * 0.1}
    g = zonas.construir(2001, 2003, ceros, ceros, {"Z": ("h07v06", 701.0, 1121.0, 24.153, -110.313)})
    assert g["type"] == "FeatureCollection" and g["datos_de_prueba"] is False
    f = g["features"][0]
    assert f["geometry"]["type"] == "Polygon"
    assert set(f["properties"]["cambios"]) == {"calor", "vegetacion", "lluvia", "agua"}
    assert f["properties"]["cambios"]["agua"]["cambio_total"] is None


class _Resp:
    def __init__(self, codigo, datos=None):
        self.status_code, self._d, self.text = codigo, datos or {}, ""

    def json(self):
        return self._d


def test_login_falla_con_http_distinto_de_200(monkeypatch):
    monkeypatch.setenv("EARTHDATA_USERNAME", "u")
    monkeypatch.setenv("EARTHDATA_PASSWORD", "p")
    monkeypatch.setattr(appeears.requests, "post", lambda *a, **k: _Resp(401))
    with pytest.raises(SystemExit):
        appeears.login()


def test_descargar_trata_estado_ausente_como_procesando(monkeypatch, tmp_path, capsys):
    monkeypatch.setattr(appeears, "TAREAS", tmp_path / "t.json")
    (tmp_path / "t.json").write_text('{"P.061": "id1"}', encoding="utf-8")
    monkeypatch.setattr(appeears.requests, "get", lambda *a, **k: _Resp(200, {"progress": {"details": []}}))
    appeears.descargar_tareas({})
    assert "processing" in capsys.readouterr().out
