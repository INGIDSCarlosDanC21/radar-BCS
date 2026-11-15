import copy
import json

import pytest

from analisis import validar as v


@pytest.fixture
def ind():
    return json.loads(v.INDICADORES.read_text(encoding="utf-8"))


@pytest.fixture
def zon():
    return json.loads(v.ZONAS.read_text(encoding="utf-8"))


def _hay(errores, texto):
    return any(texto in e for e in errores)


def test_archivos_reales_validan(ind, zon):
    assert v.validar_indicadores(ind) == []
    assert v.validar_zonas(zon) == []


def test_main_ok(capsys):
    assert v.main() == 0
    assert capsys.readouterr().out.strip() == "OK"


def test_falta_campo(ind):
    del ind["indicadores"][0]["unidades"]
    assert _hay(v.validar_indicadores(ind), "falta el campo 'unidades'")


def test_falta_campo_de_significancia(ind):
    del ind["indicadores"][1]["significancia"]["alfa"]
    assert _hay(v.validar_indicadores(ind), "alfa")


@pytest.mark.parametrize("p", [0.0, -0.1, 1.5])
def test_p_valor_invalido(ind, p):
    ind["indicadores"][0]["significancia"]["p_valor"] = p
    assert _hay(v.validar_indicadores(ind), "p_valor")


def test_p_valor_uno_y_nulo_valen(ind):
    ind["indicadores"][0]["significancia"]["p_valor"] = 1.0
    ind["indicadores"][1]["significancia"]["p_valor"] = None
    assert v.validar_indicadores(ind) == []


def test_cambio_total_con_no_significativo(ind):
    i = ind["indicadores"][0]
    i["significancia"]["significativo"] = False
    i["cambio_total"] = 0.5
    assert _hay(v.validar_indicadores(ind), "debe ser null cuando significativo es false")


def test_datos_de_prueba_ausente(ind):
    del ind["datos_de_prueba"]
    assert _hay(v.validar_indicadores(ind), "datos_de_prueba")


def test_id_repetido_y_faltante(ind):
    ind["indicadores"][3]["id"] = "calor"
    e = v.validar_indicadores(ind)
    assert _hay(e, "'calor' está repetido")
    assert _hay(e, "falta el id 'agua'")


def test_id_desconocido(ind):
    ind["indicadores"][3]["id"] = "aire"
    assert _hay(v.validar_indicadores(ind), "'aire' no es válido")


def test_menos_9999(ind):
    ind["indicadores"][1]["serie_anual"][0]["valor"] = -9999
    assert _hay(v.validar_indicadores(ind), "-9999")


def test_indicador_vacio_valido(ind):
    ind["indicadores"][3] = {"id": "agua", "titulo": "Agua", "variable": None, "unidades": None, "cambio_total": None,
                             "cambio_total_nota": None, "tendencia_por_decada": None, "por_decada": [],
                             "significancia": {"metodo": None, "p_valor": None, "alfa": None, "significativo": None},
                             "serie_anual": [], "fuente": None, "limitacion": "pendiente"}
    assert v.validar_indicadores(ind) == []


def test_fuente_incompleta(ind):
    del ind["indicadores"][0]["fuente"]["url"]
    assert _hay(v.validar_indicadores(ind), "fuente: falta el campo 'url'")


def test_zona_sin_los_4_indicadores(zon):
    del zon["features"][0]["properties"]["cambios"]["agua"]
    assert _hay(v.validar_zonas(zon), "falta el indicador 'agua'")


def test_zona_sin_campos_en_cambio(zon):
    del zon["features"][0]["properties"]["cambios"]["calor"]["significativo"]
    assert _hay(v.validar_zonas(zon), "significativo")


def test_zonas_geometria_y_tipo(zon):
    z = copy.deepcopy(zon)
    z["type"] = "Otro"
    z["features"][0]["geometry"] = None
    e = v.validar_zonas(z)
    assert _hay(e, "FeatureCollection") and _hay(e, "geometry")
