"""Valida data/salida/ contra el contrato docs/contrato-datos.md (v0.1) con Python estándar.

Un solo comando:  python -m analisis.validar        (desde la raíz del repo)
Sale con código 1 si hay errores.
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
INDICADORES = RAIZ / "data" / "salida" / "indicadores.json"
ZONAS = RAIZ / "data" / "salida" / "zonas.geojson"

IDS = ("calor", "vegetacion", "lluvia", "agua")
RAIZ_CAMPOS = ("version_contrato", "datos_de_prueba", "generado", "generado_con", "periodo", "indicadores")
IND_CAMPOS = ("id", "titulo", "variable", "unidades", "cambio_total", "cambio_total_nota", "tendencia_por_decada",
              "por_decada", "significancia", "serie_anual", "fuente", "limitacion")
SIG_CAMPOS = ("metodo", "p_valor", "alfa", "significativo")
FUENTE_CAMPOS = ("dataset", "url", "resolucion", "periodo", "fecha_descarga")
# textos en inglés (issue #93): obligatorios en todo indicador con datos; la web inglesa los lee sin traducir nada
IND_EN = ("titulo_en", "variable_en", "cambio_total_nota_en", "limitacion_en")
FUENTE_EN = ("dataset_en", "resolucion_en")
UNIDADES_FIJAS = {"calor": "°C", "lluvia": "mm/año"}  # vegetación y agua las define Prog. A
# Calor, opción B (docs/decisiones.md, 2026-11-15): cifra principal = aire (POWER T2M) desde 2001; la limitación explica por qué la superficie no es la principal


def _num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def _faltan(obj, campos, donde, err):
    """Anota los campos ausentes; devuelve True si obj es un dict."""
    if not isinstance(obj, dict):
        err.append(f"{donde}: debe ser un objeto")
        return False
    for c in campos:
        if c not in obj:
            err.append(f"{donde}: falta el campo '{c}'")
    return True


def _numero_o_nulo(v, donde, err):
    """Faltantes son null, nunca -9999 (contrato)."""
    if v is None:
        return
    if not _num(v):
        err.append(f"{donde}: debe ser número o null")
    elif v == -9999:
        err.append(f"{donde}: -9999 no vale, los faltantes van como null")


def _texto(obj, campo, donde, err):
    """Un texto en inglés debe ser una cadena no vacía."""
    v = obj.get(campo)
    if not isinstance(v, str) or not v.strip():
        err.append(f"{donde}.{campo}: falta el texto en inglés (cadena no vacía)")


def _calor_del_aire(ind, donde, err):
    """El calor publicado es el del aire (T2M, desde 2001) y su limitación explica el contraste con Aqua, en español y en inglés."""
    if "T2M" not in str(ind.get("variable")):
        err.append(f"{donde}.variable: el calor debe ser el del aire (NASA POWER T2M), no la superficie")
    periodo = str((ind.get("fuente") or {}).get("periodo"))
    if not periodo.startswith("2001-"):
        err.append(f"{donde}.fuente.periodo: el calor debe empezar en 2001, no {periodo}")
    for campo in ("limitacion", "limitacion_en"):
        if "aqua" not in str(ind.get(campo)).lower():
            err.append(f"{donde}.{campo}: debe mencionar el contraste con Aqua")


def _indicador(ind, donde, err):
    if not _faltan(ind, IND_CAMPOS, donde, err):
        return
    for k in ("cambio_total", "tendencia_por_decada"):
        _numero_o_nulo(ind.get(k), f"{donde}.{k}", err)
    un = UNIDADES_FIJAS.get(ind.get("id"))
    if un and ind.get("unidades") not in (None, un):
        err.append(f"{donde}.unidades: para {ind['id']} debe ser '{un}'")

    sig = ind.get("significancia")
    if _faltan(sig, SIG_CAMPOS, f"{donde}.significancia", err):
        p = sig.get("p_valor")
        if p is not None and (not _num(p) or not 0 < p <= 1):
            err.append(f"{donde}.significancia.p_valor: debe ser null o estar en (0, 1], no {p!r} (nunca 0.0)")
        if sig.get("significativo") not in (True, False, None):
            err.append(f"{donde}.significancia.significativo: debe ser true, false o null")
        if sig.get("significativo") is False:
            for k in ("cambio_total", "tendencia_por_decada"):
                if ind.get(k) is not None:
                    err.append(f"{donde}.{k}: debe ser null cuando significativo es false")

    dec = ind.get("por_decada")
    if not isinstance(dec, list):
        err.append(f"{donde}.por_decada: debe ser una lista")
    else:
        for n, d in enumerate(dec):
            if _faltan(d, ("decada", "media"), f"{donde}.por_decada[{n}]", err):
                _numero_o_nulo(d.get("media"), f"{donde}.por_decada[{n}].media", err)
    ser = ind.get("serie_anual")
    if not isinstance(ser, list):
        err.append(f"{donde}.serie_anual: debe ser una lista")
    else:
        for n, s in enumerate(ser):
            if _faltan(s, ("anio", "valor"), f"{donde}.serie_anual[{n}]", err):
                _numero_o_nulo(s.get("valor"), f"{donde}.serie_anual[{n}].valor", err)

    # un indicador sin dato va con fuente null; si trae fuente, debe estar completa
    if ind.get("fuente") is not None:
        if ind.get("id") == "calor":
            _calor_del_aire(ind, donde, err)
        _faltan(ind["fuente"], FUENTE_CAMPOS, f"{donde}.fuente", err)
        # solo los indicadores con datos llevan inglés; los "pendiente" (fuente null) no tienen texto que traducir
        for c in IND_EN:
            _texto(ind, c, donde, err)
        if isinstance(sig, dict):
            _texto(sig, "metodo_en", f"{donde}.significancia", err)
        if isinstance(ind["fuente"], dict):
            for c in FUENTE_EN:
                _texto(ind["fuente"], c, f"{donde}.fuente", err)


def validar_indicadores(d):
    """Devuelve la lista de errores (vacía si cumple el contrato)."""
    err = []
    if not _faltan(d, RAIZ_CAMPOS, "raíz", err):
        return err
    if "datos_de_prueba" in d and not isinstance(d["datos_de_prueba"], bool):
        err.append("raíz.datos_de_prueba: debe ser true o false")
    if "periodo" in d:
        _faltan(d["periodo"], ("inicio", "fin"), "raíz.periodo", err)
    if "indicadores" not in d:
        return err
    lista = d["indicadores"]
    if not isinstance(lista, list):
        err.append("raíz.indicadores: debe ser una lista")
        return err
    ids = []
    for n, ind in enumerate(lista):
        _indicador(ind, f"indicadores[{n}]", err)
        if isinstance(ind, dict) and "id" in ind:
            ids.append(ind["id"])
    for i in ids:
        if i not in IDS:
            err.append(f"indicadores: id '{i}' no es válido (debe ser uno de {', '.join(IDS)})")
    for i in IDS:
        if ids.count(i) == 0:
            err.append(f"indicadores: falta el id '{i}'")
        elif ids.count(i) > 1:
            err.append(f"indicadores: el id '{i}' está repetido")
    return err


def validar_zonas(d):
    """Devuelve la lista de errores (vacía si cumple el contrato)."""
    err = []
    if not isinstance(d, dict):
        return ["raíz: debe ser un objeto"]
    if d.get("type") != "FeatureCollection":
        err.append("raíz.type: debe ser 'FeatureCollection'")
    if "datos_de_prueba" in d and not isinstance(d["datos_de_prueba"], bool):
        err.append("raíz.datos_de_prueba: debe ser true o false")
    feats = d.get("features")
    if not isinstance(feats, list):
        err.append("raíz.features: debe ser una lista")
        return err
    for n, f in enumerate(feats):
        donde = f"features[{n}]"
        if not _faltan(f, ("type", "geometry", "properties"), donde, err):
            continue
        if f.get("type") != "Feature":
            err.append(f"{donde}.type: debe ser 'Feature'")
        g = f.get("geometry")
        if not isinstance(g, dict) or g.get("type") not in ("Polygon", "MultiPolygon") or not g.get("coordinates"):
            err.append(f"{donde}.geometry: debe ser un polígono con coordinates")
        p = f.get("properties")
        if not _faltan(p, ("id", "nombre", "cambios"), f"{donde}.properties", err):
            continue
        for c in ("nombre_en", "nota_en"):
            _texto(p, c, f"{donde}.properties", err)
        cambios = p["cambios"]
        if not isinstance(cambios, dict):
            err.append(f"{donde}.properties.cambios: debe ser un objeto")
            continue
        for i in IDS:
            if i not in cambios:
                err.append(f"{donde}.properties.cambios: falta el indicador '{i}'")
            elif _faltan(cambios[i], ("cambio_total", "significativo"), f"{donde}.cambios.{i}", err):
                _numero_o_nulo(cambios[i].get("cambio_total"), f"{donde}.cambios.{i}.cambio_total", err)
                if cambios[i].get("significativo") not in (True, False, None):
                    err.append(f"{donde}.cambios.{i}.significativo: debe ser true, false o null")
    return err


def _leer(ruta):
    return json.loads(ruta.read_text(encoding="utf-8"))


def main():
    errores = []
    for ruta, fn in ((INDICADORES, validar_indicadores), (ZONAS, validar_zonas)):
        try:
            errores += [f"{ruta.name}: {e}" for e in fn(_leer(ruta))]
        except (OSError, ValueError) as e:
            errores.append(f"{ruta.name}: no se pudo leer ({e})")
    if errores:
        print("\n".join(errores))
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
