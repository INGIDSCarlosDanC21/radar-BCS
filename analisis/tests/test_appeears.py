import json

import pytest

from analisis import appeears


class _Resp:
    def __init__(self, codigo=200, datos=None, contenido=b""):
        self.status_code, self._d, self.content, self.text = codigo, datos or {}, contenido, ""

    def json(self):
        return self._d

    def raise_for_status(self):
        pass


def test_cargar_env_no_pisa_variables_ni_lee_comentarios(monkeypatch, tmp_path):
    ruta = tmp_path / ".env"
    ruta.write_text('# nota\nPRUEBA_A="uno"\nPRUEBA_B=dos\nPRUEBA_C=\nsin_igual\n', encoding="utf-8")
    monkeypatch.setenv("PRUEBA_B", "ya")
    for k in ("PRUEBA_A", "PRUEBA_C"):
        monkeypatch.delenv(k, raising=False)
    appeears.cargar_env(ruta)
    import os
    assert os.environ["PRUEBA_A"] == "uno"
    assert os.environ["PRUEBA_B"] == "ya"
    assert "PRUEBA_C" not in os.environ
    monkeypatch.delenv("PRUEBA_A", raising=False)


def test_cargar_env_sin_archivo_no_falla(tmp_path):
    appeears.cargar_env(tmp_path / "no-existe")


def test_login_sin_credenciales_sale(monkeypatch, tmp_path):
    monkeypatch.setattr(appeears, "cargar_env", lambda *a, **k: None)
    monkeypatch.delenv("EARTHDATA_USERNAME", raising=False)
    monkeypatch.delenv("EARTHDATA_PASSWORD", raising=False)
    with pytest.raises(SystemExit):
        appeears.login()


def test_enviar_no_reenvia_tareas_guardadas(monkeypatch, tmp_path, capsys):
    monkeypatch.setattr(appeears, "CACHE", tmp_path)
    monkeypatch.setattr(appeears, "TAREAS", tmp_path / "tareas.json")
    llamadas = []

    def post(url, **k):
        llamadas.append(k["json"]["task_name"])
        return _Resp(202, {"task_id": "t-" + str(len(llamadas))})

    monkeypatch.setattr(appeears.requests, "post", post)
    appeears.enviar({})
    assert len(llamadas) == len(appeears.PRODUCTOS)
    guardadas = json.loads((tmp_path / "tareas.json").read_text(encoding="utf-8"))
    assert set(guardadas) == set(appeears.PRODUCTOS)
    appeears.enviar({})
    assert len(llamadas) == len(appeears.PRODUCTOS)  # la segunda vez no envía nada
    assert "ya enviada" in capsys.readouterr().out


def test_enviar_falla_con_http_de_error(monkeypatch, tmp_path):
    monkeypatch.setattr(appeears, "CACHE", tmp_path)
    monkeypatch.setattr(appeears, "TAREAS", tmp_path / "tareas.json")
    monkeypatch.setattr(appeears.requests, "post", lambda *a, **k: _Resp(500))
    with pytest.raises(SystemExit):
        appeears.enviar({})


def test_descargar_guarda_solo_csv_de_datos_y_no_repite(monkeypatch, tmp_path):
    monkeypatch.setattr(appeears, "CACHE", tmp_path)
    monkeypatch.setattr(appeears, "TAREAS", tmp_path / "tareas.json")
    (tmp_path / "tareas.json").write_text(json.dumps({"P": "t1"}), encoding="utf-8")
    archivos = [{"file_name": "x/P-results.csv", "file_id": "a"},
                {"file_name": "x/P-lookup.csv", "file_id": "b"},
                {"file_name": "x/otro.tif", "file_id": "c"}]
    pedidos = []

    def get(url, **k):
        pedidos.append(url)
        if "/status/" in url:
            return _Resp(200, {"status": "done"})
        if url.endswith("/t1"):
            return _Resp(200, {"files": archivos})
        return _Resp(200, contenido=b"datos")

    monkeypatch.setattr(appeears.requests, "get", get)
    appeears.descargar_tareas({})
    assert [p.name for p in (tmp_path / "P").iterdir()] == ["P-results.csv"]
    n = len(pedidos)
    appeears.descargar_tareas({})
    assert not any(p.endswith("/a") for p in pedidos[n:])  # el CSV ya existe: no se baja otra vez
