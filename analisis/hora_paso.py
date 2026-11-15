"""Hora local de observación de Terra (MOD11A2 Day_view_time) por año, para ver si el paso del satélite se movió.

Lee el CSV de la tarea `python -m analisis.appeears enviarhora` (data/cache/appeears/MOD11A2.061-hora-de-paso/).
  python -m analisis.hora_paso
"""
import csv
import statistics as st
from collections import defaultdict

from analisis.appeears import CACHE


def media_por_anio(ruta):
    """{año: hora local media}; 255 y valores fuera de 0-24 h son relleno y se descartan."""
    por = defaultdict(list)
    with open(ruta, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            try:
                v = float(r["MOD11A2_061_Day_view_time"])
            except ValueError:
                continue
            if 0 <= v < 24:
                por[int(r["Date"][:4])].append(v)
    return {a: round(st.mean(v), 2) for a, v in sorted(por.items())}


if __name__ == "__main__":
    ruta = next((CACHE / "MOD11A2.061-hora-de-paso").glob("*results.csv"))
    for a, h in media_por_anio(ruta).items():
        print(a, h)
