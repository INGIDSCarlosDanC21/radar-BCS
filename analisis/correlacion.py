"""Correlación de Spearman entre la lluvia anual (POWER) y la anomalía anual de agua (GRACE), solo años con ambos datos.

Una correlación no es una causa. Se calcula desde data/salida/indicadores.json:  python -m analisis.correlacion
"""
import json
import sys

import numpy as np
from scipy import stats

from analisis.exportar import SALIDA


def spearman_series(a, b):
    """Spearman entre dos series anuales [{'anio','valor'}]; usa los años donde ambas tienen valor."""
    va = {x["anio"]: x["valor"] for x in a if x["valor"] is not None}
    vb = {x["anio"]: x["valor"] for x in b if x["valor"] is not None}
    anios = sorted(set(va) & set(vb))
    if len(anios) < 3:
        raise ValueError("Se necesitan al menos 3 años con ambos datos")
    r = stats.spearmanr([va[x] for x in anios], [vb[x] for x in anios])
    return {"rho": float(r.statistic), "p_valor": float(r.pvalue), "n": len(anios), "anios": [anios[0], anios[-1]]}


def main(ruta=SALIDA):
    ind = {i["id"]: i for i in json.loads(ruta.read_text(encoding="utf-8"))["indicadores"]}
    r = spearman_series(ind["lluvia"]["serie_anual"], ind["agua"]["serie_anual"])
    print(f"Spearman lluvia vs agua: rho = {r['rho']:.2f}, p = {r['p_valor']:.3f}, n = {r['n']} años ({r['anios'][0]}-{r['anios'][1]})")
    return r


if __name__ == "__main__":
    sys.exit(0 if main() else 1)
