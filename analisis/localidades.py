"""Tendencias de calor del aire y lluvia por localidad de Baja California Sur (38 lugares) con NASA POWER mensual.

Un solo comando:  python -m analisis.localidades        (desde la raíz del repo; sin credenciales)

Mismo método que indicadores.json: calor = temperatura del aire a 2 m (T2M), Mann-Kendall estacional + pendiente de Sen;
lluvia = total anual (PRECTOTCORR x días del mes), Mann-Kendall sobre el total anual + Sen; alfa = 0.05, 2001-2025.
POWER es un reanálisis MERRA-2 en una malla de 0.5° x 0.625° (~50 km): las localidades que caen en la misma celda reciben la misma serie.
Esto se declara con el campo `celda` y `comparte_celda_con`. Sin cambio claro no se publica cifra de cambio (contrato, anexo 3).
Las coordenadas son de GeoNames (CC BY 4.0, <https://www.geonames.org/>), IDs en `geonames`.
"""
import datetime as dt
import json
from pathlib import Path

import numpy as np

from analisis import descargar, tendencias as t

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "data" / "salida" / "localidades_tendencias.json"
GENERADO_CON = "analisis/localidades.py (código generado con IA: sí, Claude)"
INICIO = descargar.INICIO
FIN = 2025

# (id, GeoNames, nombre, municipio, lat, lon); municipio por el código admin2 de GeoNames (Guerrero Negro no lo trae: Mulegé).
_LOC = [
    ("lapaz", 4000900, "La Paz", "La Paz", descargar.LAT, descargar.LON),   # mismo punto que indicadores.json (24.14, -110.31): la ciudad cae justo en el borde de dos celdas y así coinciden las cifras de Inicio y del mapa
    ("cabosanlucas", 3985710, "Cabo San Lucas", "Los Cabos", 22.89088, -109.91238),
    ("sanjosedelcabo", 3986172, "San José del Cabo", "Los Cabos", 23.05406, -109.70367),
    ("coloniadelsol", 11121204, "Colonia del Sol", "Los Cabos", 22.91273, -109.92655),
    ("ciudadconstitucion", 4013723, "Ciudad Constitución", "Comondú", 25.0321, -111.66256),
    ("loreto", 3998287, "Loreto", "Loreto", 26.01217, -111.34888),
    ("guerreronegro", 4021858, "Guerrero Negro", "Mulegé", 27.96005, -114.05589),
    ("santarosalia", 3983805, "Santa Rosalía", "Mulegé", 27.34035, -112.26706),
    ("laspalmas", 8858141, "Las Palmas", "Los Cabos", 22.93672, -109.94235),
    ("lasveredas", 8858156, "Las Veredas", "Los Cabos", 23.15028, -109.70611),
    ("ciudadinsurgentes", 4011574, "Ciudad Insurgentes", "Comondú", 25.26345, -111.77444),
    ("villaalvaradoaramburo", 8858204, "Villa Alberto Andrés Alvarado Arámburo", "Mulegé", 27.64444, -113.38472),
    ("puertosancarlos", 3987485, "Puerto San Carlos", "Comondú", 24.78874, -112.10504),
    ("todossantos", 3981432, "Todos Santos", "La Paz", 23.44688, -110.22308),
    ("elcentenario", 8858277, "El Centenario", "La Paz", 24.1025, -110.41444),
    ("mulege", 3995236, "Mulegé", "Mulegé", 26.89141, -111.9826),
    ("bahiatortugas", 3991337, "Bahía Tortugas", "Mulegé", 27.69132, -114.8948),
    ("elpescadero", 4022368, "El Pescadero", "La Paz", 23.36417, -110.16833),
    ("puertolopezmateos", 3999504, "Puerto Adolfo López Mateos", "Comondú", 25.19241, -112.1104),
    ("chametla", 4022333, "Chametla", "La Paz", 24.09926, -110.37395),
    ("laribera", 4000444, "La Ribera", "Los Cabos", 23.59581, -109.58586),
    ("melitonalbanez", 8858983, "Melitón Albáñez Domínguez", "La Paz", 23.66139, -110.42083),
    ("bahiaasuncion", 4021921, "Bahía Asunción", "Mulegé", 27.14231, -114.29582),
    ("laplaya", 8859159, "La Playa", "Los Cabos", 23.06417, -109.66833),
    ("miraflores", 3995741, "Miraflores", "Los Cabos", 23.36975, -109.77436),
    ("elsilencio", 8859501, "El Silencio", "Mulegé", 27.46801, -113.29987),
    ("losbarriles", 3998075, "Los Barriles", "La Paz", 23.68273, -109.69953),
    ("santiago", 3983676, "Santiago", "Los Cabos", 23.47855, -109.71515),
    ("sanignacio", 3986837, "San Ignacio", "Mulegé", 27.28232, -112.89637),
    ("puntaabreojos", 8015082, "Punta Abreojos", "Mulegé", 26.71541, -113.57451),
    ("elsargento", 4022397, "El Sargento", "La Paz", 24.08352, -109.99401),
    ("lapurisima", 4000564, "La Purísima", "Comondú", 26.1865, -112.07473),
    ("sanjuandelacosta", 3985884, "San Juan de la Costa", "La Paz", 24.37364, -110.68983),
    ("cabopulmo", 7302527, "Cabo Pulmo", "Los Cabos", 23.43718, -109.42924),
    ("sanjosedecomondu", 4013098, "San José de Comondú", "Comondú", 26.05876, -111.82416),
    ("puertochale", 3991412, "Puerto Chale", "La Paz", 24.42463, -111.55287),
    ("sanbartolo", 3987608, "San Bartolo", "La Paz", 23.73849, -109.84658),
    ("lasbarrancas", 4000215, "Las Barrancas", "Comondú", 26.00148, -112.19806),
]
LOCALIDADES = _LOC


def _r(x, n=3):
    return None if x is None or (isinstance(x, float) and np.isnan(x)) else round(float(x), n)


def _prueba(est, inicio, fin, unidad_nota):
    """Cifra solo si el cambio es claro (alfa 0.05); si no, None (no se publica una pendiente engañosa)."""
    claro = est["significativo"]
    return {"cambio_total": _r(t.cambio_total(est["pendiente_por_anio"], inicio, fin)) if claro else None,
            "significativo": bool(claro), "p_valor": float(f"{est['p_valor']:.4g}"), "unidades": unidad_nota}


def tendencias_localidad(datos, inicio=INICIO, fin=FIN):
    """{'calor': {...}, 'lluvia': {...}, 'lluvia_media_anual_mm': float} desde un JSON de NASA POWER."""
    t2m = t.matriz_mensual(datos, "T2M", inicio, fin)
    mm = t.mm_por_mes(t.matriz_mensual(datos, "PRECTOTCORR", inicio, fin), inicio)
    anual = t.suma_anual(mm)
    return {"calor": _prueba(t.tendencia_estacional(t2m), inicio, fin, "°C"),
            "lluvia": _prueba(t.tendencia_anual(anual), inicio, fin, "mm/año"),
            "calor_medio_c": _r(float(np.nanmean(t2m)), 2),
            "lluvia_media_anual_mm": _r(float(np.nanmean(anual)), 0)}


def celda(lat, lon):
    """Centro [lat, lon] de la celda de POWER (MERRA-2: 0.5° de latitud x 0.625° de longitud, centros en múltiplos de 0.5 y de 0.625 desde -180).
    Comprobado el 2026-11-15 contra las 38 series: las localidades con el mismo centro tienen series idénticas (21 celdas)."""
    return [round(lat / 0.5) * 0.5, round(round((lon + 180) / 0.625) * 0.625 - 180, 3)]


def construir(descargar_fn=None, inicio=INICIO, fin=FIN):
    """Arma el JSON de salida. descargar_fn(lat, lon) -> (datos, fecha); por omisión usa la caché de analisis.descargar."""
    descargar_fn = descargar_fn or (lambda la, lo: descargar.descargar_power(inicio, fin, la, lo))
    filas, fecha = [], None
    for id_, geo, nombre, muni, la, lo in LOCALIDADES:
        datos, fecha = descargar_fn(la, lo)
        r = tendencias_localidad(datos, inicio, fin)
        filas.append({"id": id_, "nombre": nombre, "nombre_en": nombre, "municipio": muni, "lat": la, "lon": lo, "geonames": geo,
                      "celda": celda(la, lo), **r})
    por_celda = {}
    for f in filas:
        por_celda.setdefault(tuple(f["celda"]), []).append(f["id"])
    for f in filas:
        f["comparte_celda_con"] = [x for x in por_celda[tuple(f["celda"])] if x != f["id"]]
    return {
        "generado": dt.date.today().isoformat(), "generado_con": GENERADO_CON, "periodo": {"inicio": inicio, "fin": fin},
        "fecha_descarga": fecha, "alfa": t.ALFA,
        "fuente": {"dataset": "NASA POWER Monthly (MERRA-2), parámetros T2M y PRECTOTCORR, community AG", "url": descargar.DOCS,
                   "resolucion": "reanálisis MERRA-2, malla de 0.5° x 0.625° (~50 km): localidades cercanas comparten celda",
                   "coordenadas": "GeoNames (CC BY 4.0), https://www.geonames.org/"},
        "metodo": {"calor": "Mann-Kendall estacional + pendiente de Sen (temperatura del aire a 2 m)",
                   "lluvia": "Mann-Kendall sobre el total anual + pendiente de Sen (PRECTOTCORR x días del mes)"},
        "nota": "No es una medición local: dato de reanálisis. Muestra qué cambió, no por qué. Vegetación y agua no se calculan por localidad.",
        "localidades": filas,
        "celdas_distintas": len(por_celda),
    }


def main():
    out = construir()
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    n = len(out["localidades"])
    print(f"{n} localidades en {out['celdas_distintas']} celdas de POWER -> {SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
