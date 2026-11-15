"""Contraste de calor: Terra (MOD11A2) contra Aqua (MYD11A2), mismos 6 puntos (issue #87).

Pregunta: ¿la caída de Terra después de 2021 viene de que pasa cada vez más temprano (deriva orbital)?
Si Aqua, cuya hora de paso se mantuvo, también baja, la deriva no basta como explicación.
  python -m analisis.contraste_aqua
Lee los CSV de AppEEARS en data/cache/appeears/ (python -m analisis.appeears descargar). No escribe archivos.
"""
import csv
import statistics as st
from collections import defaultdict

from analisis import modis, tendencias as t
from analisis.appeears import CACHE

AQUA = {"prefijo": "MYD11A2_061", "valor": "MYD11A2_061_LST_Day_1km", "calidad": "MYD11A2_061_QC_Day_MODLAND"}
INICIO_AQUA = 2003  # Aqua empieza el 2002-07-04; 2003 es el primer año completo


def ruta_aqua():
    return next((CACHE / "MYD11A2.061-aqua-zonas").glob("*results.csv"))


def hora_media_por_anio(ruta):
    """{año: hora local media (h)} del campo Day_view_time de Aqua; se descarta el relleno (fuera de 0-24 h)."""
    por = defaultdict(list)
    with open(ruta, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            try:
                v = float(r["MYD11A2_061_Day_view_time"])
            except ValueError:
                continue
            if 0 <= v < 24:
                por[int(r["Date"][:4])].append(v)
    return {a: round(st.mean(v), 2) for a, v in sorted(por.items())}


def serie_ciudad(lecturas, inicio, fin):
    return modis.ciudad({z: modis.matriz(l, inicio, fin) for z, l in lecturas.items()})


def tendencia(mat):
    e = t.tendencia_estacional(mat)
    return e["pendiente_por_anio"], e["p_valor"]


def anual(mat):
    return t.promedio_anual_sin_parcial(mat)


def principal():
    k = lambda v: v - 273.15
    terra = modis.leer(modis.rutas_csv("MOD11A2"), modis.LST, k, lambda v: v > 0)
    aqua = modis.leer(ruta_aqua(), AQUA, k, lambda v: v > 0)
    ult = min(max(a for z in aqua.values() for a, _, _ in z), max(a for z in terra.values() for a, _, _ in z))
    print(f"Hora local media de Aqua (Day_view_time), por año: {hora_media_por_anio(ruta_aqua())}\n")
    print(f"{'periodo':<12}{'satélite':<8}{'Sen °C/año':>12}{'cambio °C':>11}{'p':>10}")
    for fin in (2021, 2025, ult):
        for nombre, lec in (("Terra", terra), ("Aqua", aqua)):
            mat = serie_ciudad(lec, INICIO_AQUA, fin)
            s, p = tendencia(mat)
            print(f"{INICIO_AQUA}-{fin:<7}{nombre:<8}{s:>12.4f}{s * (fin - INICIO_AQUA):>11.2f}{p:>10.4g}")
    print("\nMedia anual de la ciudad (°C): año, Terra, Aqua")
    mt, ma = serie_ciudad(terra, INICIO_AQUA, ult), serie_ciudad(aqua, INICIO_AQUA, ult)
    for i, (a, b) in enumerate(zip(anual(mt), anual(ma))):
        print(INICIO_AQUA + i, f"{a:.2f}", f"{b:.2f}")


if __name__ == "__main__":
    principal()
