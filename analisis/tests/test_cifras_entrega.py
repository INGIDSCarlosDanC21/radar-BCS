"""Las cifras principales de data/salida/indicadores.json deben aparecer escritas igual en los textos de la entrega.

Si falla, no se edita docs/entrega/ desde aquí: el mensaje dice qué cifra y en qué archivo para que el Líder la corrija.
"""
import json

import pytest

from analisis import validar

RAIZ = validar.RAIZ
UNIDAD = {"calor": "°C", "vegetacion": "NDVI", "lluvia": "mm", "agua": "cm"}
# archivo -> {indicador: se espera el p-valor escrito}. 08 solo cuenta con calor y vegetación.
ARCHIVOS = {
    "docs/entrega/04-project-details.md": {"calor": True, "vegetacion": True, "lluvia": True, "agua": True},
    "docs/entrega/08-demo-draft.md": {"calor": False, "vegetacion": True},
}


def _formas(x):
    """Formas en que un texto puede redondear x: 1, 2 o 3 decimales."""
    return {f"{round(abs(x), n):.{n}f}" for n in (1, 2, 3)}


def _formas_p(p):
    return {"p < 0.001"} if p < 0.001 else {f"p = {round(p, n):.{n}f}" for n in (2, 3)}


def _revisar(ind, texto, archivo, con_p):
    errores = []
    if ind["cambio_total"] is not None:
        u = UNIDAD[ind["id"]]
        formas = [f"{f} {u}" for f in sorted(_formas(ind["cambio_total"]))]
        if not any(f in texto for f in formas):
            errores.append(f"{ind['id']}: el cambio {ind['cambio_total']} {u} no aparece en {archivo} (se busca {' o '.join(formas)})")
    if con_p:
        p = ind["significancia"]["p_valor"]
        if not any(f in texto for f in _formas_p(p)):
            errores.append(f"{ind['id']}: p = {p} no aparece en {archivo} (se busca {' o '.join(sorted(_formas_p(p)))})")
    return errores


def test_cifras_de_la_entrega_coinciden_con_data_salida():
    datos = {i["id"]: i for i in json.loads(validar.INDICADORES.read_text(encoding="utf-8"))["indicadores"]}
    errores = []
    for archivo, ids in ARCHIVOS.items():
        texto = (RAIZ / archivo).read_text(encoding="utf-8")
        for id_, con_p in ids.items():
            errores += _revisar(datos[id_], texto, archivo, con_p)
    assert not errores, "Cifras desfasadas entre data/salida y la entrega:\n" + "\n".join(errores)


def test_la_comprobacion_detecta_una_cifra_distinta():
    ind = {"id": "calor", "cambio_total": 1.465, "significancia": {"p_valor": 1e-17}}
    assert _revisar(ind, "rose 1.5 °C (p < 0.001)", "x.md", True) == []
    assert _revisar(ind, "rose 2.1 °C (p < 0.001)", "x.md", True)
    assert _revisar(ind, "rose 1.47 °C", "x.md", True)  # falta el p-valor


def test_cambio_nulo_no_pide_cifra():
    ind = {"id": "lluvia", "cambio_total": None, "significancia": {"p_valor": 0.129}}
    assert _revisar(ind, "p = 0.13", "x.md", True) == []
    assert _revisar(ind, "sin dato", "x.md", True)
