#!/usr/bin/env python3
"""Arma web/data/agricola.json (pantalla "Mapa Agricola" de Radar BCS).

Solo libreria estandar. Descarga en vivo (SIAP, NASA POWER, ISRIC SoilGrids) y cachea
en data/cache/agricola/ (carpeta ignorada por git). Si una descarga falla se usa la
cache y se avisa en la salida. Lo que no es API (CONAGUA/DOF, Monitor de Sequia,
SEPADA, Perfil de Riesgos, GeoNames, poblacion INEGI) son constantes con URL y cita,
tomadas de fuentes verificadas el 2026-11-14/15. Lo NO verificado no entra.

Uso:  python web/tools/armar_agricola.py
"""
import csv
import io
import json
import sys
import urllib.request
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CACHE = RAIZ / "data" / "cache" / "agricola"
SALIDA = RAIZ / "web" / "data" / "agricola.json"
INDICADORES = RAIZ / "web" / "data" / "indicadores.json"
ZONAS = RAIZ / "web" / "data" / "zonas.geojson"
HOY = date.today().isoformat()
MESES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]
CODIGOS_MES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
ESTADO_FUENTES = {}  # nombre -> "descarga" | "cache"

# ---------------------------------------------------------------- URLs
URL_SIAP = "https://nube.agricultura.gob.mx/index.php?view=10AE434F-A2158368-A120BC5A-EDF4AFAA&ANIO=2025"
URL_SIAP_PAGINA = "https://nube.agricultura.gob.mx/datosAbiertos/Agricola.php"
POWER_PARAMS = "T2M,T2M_MAX,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M,WS2M"
URL_POWER = ("https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=" + POWER_PARAMS +
             "&community=AG&longitude={lon}&latitude={lat}&format=JSON")
URL_SOIL = ("https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}"
            "&property=phh2o&property=clay&property=sand&property=silt&property=soc&property=nitrogen&property=cec"
            "&depth=0-5cm&depth=5-15cm&depth=15-30cm&depth=30-60cm&value=mean")
DOF_ACUIFEROS = "https://dof.gob.mx/nota_detalle.php?codigo=5708074&fecha=09/11/2023"
DOF_LAPAZ_ESPECIFICO = "https://dof.gob.mx/nota_detalle.php?codigo=5698953&fecha=17/08/2023"
FICHA_0323 = "https://sigagis.conagua.gob.mx/gas1/Edos_Acuiferos_18/BajaCaliforniaSur/DR_0323.pdf"
FICHA_0313 = "https://sigagis.conagua.gob.mx/gas1/Edos_Acuiferos_18/BajaCaliforniaSur/DR_0313.pdf"
FICHA_0322 = "https://sigagis.conagua.gob.mx/gas1/Edos_Acuiferos_18/BajaCaliforniaSur/DR_0322.pdf"
URL_SEQUIA = "https://smn.conagua.gob.mx/tools/RESOURCES/Monitor%20de%20Sequia%20en%20Mexico/MunicipiosSequia.xlsx"
URL_DOF_MOSCAS = "https://dof.gob.mx/nota_detalle.php?codigo=5540162&fecha=05%2F10%2F2018"
URL_SEPADA = "https://sepada.bcs.gob.mx/avalan-senasica-y-usda-plan-emergente-contra-la-mosca-de-la-fruta/"
URL_PERFIL = "https://ssbcs.gob.mx/pdf/2025/vigilancia/Perfil_Estatal_de_Riesgos_BCS_2025.pdf"
URL_ESTRATEGICO = ("https://biblioteca.setuesbcs.gob.mx/administrador/biblioteca/publicaciones/pdf/"
                   "0.26509200%201772728214Estrategico_2026_La_Paz_opt.pdf")
URL_SOILGRIDS = "https://www.isric.org/explore/soilgrids"

# ---------------------------------------------------------------- localidades (GeoNames, CC BY 4.0)
LOCALIDADES = [
    {"id": "los-planes", "nombre": "Los Planes", "lat": 23.96723, "lon": -109.935, "geonames": 3997291,
     "nota_geo": "GeoNames lo registra como San Juan de los Planes"},
    {"id": "el-carrizal", "nombre": "El Carrizal", "lat": 23.78434, "lon": -110.31166, "geonames": 4010618,
     "nota_geo": "GeoNames tiene otros registros con este nombre; se uso el de mayor poblacion del municipio"},
    {"id": "el-centenario", "nombre": "El Centenario", "lat": 24.1025, "lon": -110.41444, "geonames": 8858277,
     "nota_geo": ""},
    {"id": "chametla", "nombre": "Chametla", "lat": 24.09926, "lon": -110.37395, "geonames": 4022333,
     "nota_geo": ""},
]
LOC = {l["id"]: l for l in LOCALIDADES}
PUNTO_LAPAZ = (24.14, -110.31)  # punto del equipo (indicadores NASA)
POBLACION_CHAMETLA = 3054  # INEGI 2020, via SETUES (Informacion Estrategica 2026 La Paz)

# ---------------------------------------------------------------- acuiferos (DOF 09/11/2023, corte 30-dic-2022), hm3/anio
# R, DNC, VCAS, VEALA, VAPTYR, VAPRH, DMA (negativa = deficit)
ACUIFEROS = {
    "0322": {"nombre": "El Carrizal", "R": "14.2", "DNC": "0.0", "VCAS": "13.374524", "VEALA": "0.0",
             "VAPTYR": "0.003103", "VAPRH": "0.108998", "DMA": "0.713376"},
    "0323": {"nombre": "Los Planes", "R": "10.8", "DNC": "0.2", "VCAS": "12.325344", "VEALA": "0.0",
             "VAPTYR": "0.57789", "VAPRH": "0.034336", "DMA": "-2.33757"},
    "0313": {"nombre": "Todos Santos", "R": "18.4", "DNC": "14.7", "VCAS": "4.87704", "VEALA": "0.0",
             "VAPTYR": "1.744", "VAPRH": "0.043473", "DMA": "-2.964513"},
    "0324": {"nombre": "La Paz", "R": "21.0", "DNC": "0.0", "VCAS": "29.584608", "VEALA": "0.0",
             "VAPTYR": "4.549032", "VAPRH": "0.354763", "DMA": "-13.488404"},
}
for _a in ACUIFEROS.values():
    _a["VEAS"] = str(sum(Decimal(_a[k]) for k in ("VCAS", "VEALA", "VAPTYR", "VAPRH")))
FRASE_0323 = "no existe volumen disponible para otorgar nuevas concesiones; por el contrario su déficit es de 2'337,757 m3."
FRASE_0313 = ("no existe un volumen disponible para otorgar nuevas concesiones; por el contrario el déficit es de "
              "2,964,513 m3 anuales.")
FRASE_0322 = "existe un volumen disponible para otorgar nuevas concesiones de 713,376 m3 anuales."
FRASE_0324_ESPECIFICO = "resultando en el acuífero un déficit de 27.82732 millones de metros cúbicos anuales"

SEQUIA_TEXTO = "sin categoría registrada al 31 oct 2026; última categoría: D0 (cortes del 30 jun al 31 ago 2026)"


# ---------------------------------------------------------------- utilidades
def dec(x):
    return x if isinstance(x, Decimal) else Decimal(str(x))


def redondea(x, d):
    return dec(x).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)


def fmt(x, d=1):
    """1234.5 -> '1,234.5' (coma de miles, punto decimal)."""
    return f"{redondea(x, d):,.{d}f}"


def fmt_signo(x, d=2):
    q = redondea(x, d)
    return ("+" if q > 0 else "") + f"{q:,.{d}f}"


def fmt_p(p):
    return "p < 0.001" if p < 0.001 else "p = " + fmt(p, 3)


def descarga(nombre, url, binario=False):
    """Descarga y cachea. Si falla, usa la cache. Devuelve bytes."""
    CACHE.mkdir(parents=True, exist_ok=True)
    ruta = CACHE / nombre
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (RadarBCS armar_agricola)"})
        with urllib.request.urlopen(req, timeout=120) as r:
            datos = r.read()
        if not datos:
            raise ValueError("respuesta vacia")
        ruta.write_bytes(datos)
        ESTADO_FUENTES[nombre] = "descarga"
        return datos
    except Exception as e:  # noqa: BLE001
        if ruta.exists():
            ESTADO_FUENTES[nombre] = "cache"
            print(f"AVISO: fallo la descarga de {nombre} ({e}); se usa la cache.", file=sys.stderr)
            return ruta.read_bytes()
        raise RuntimeError(f"No se pudo descargar {nombre} y no hay cache: {e}") from e


def fuente(nombre, url, licencia=None):
    f = {"nombre": nombre, "url": url}
    if licencia:
        f["licencia"] = licencia
    f["consultado"] = HOY
    return f


def lista_es(items):
    items = list(items)
    if len(items) <= 1:
        return "".join(items)
    return ", ".join(items[:-1]) + " y " + items[-1]


# ---------------------------------------------------------------- 1. SIAP
def leer_siap():
    datos = descarga("Cierre_agricola_mun_2025.csv", URL_SIAP)
    texto = datos.decode("latin-1")
    if not texto.startswith("Anio,"):
        raise RuntimeError("El contenido de SIAP no es un CSV de cierre agricola")
    filas = [r for r in csv.DictReader(io.StringIO(texto, newline=""))
             if r["Nomestado"] == "Baja California Sur" and r["Nommunicipio"] == "La Paz"]
    if not filas:
        raise RuntimeError("SIAP: sin filas para La Paz, BCS")
    return filas


def d(valor):
    valor = (valor or "").strip()
    return Decimal(valor) if valor else None


def cultivos_siap(filas):
    por = {}
    for r in filas:
        c = por.setdefault(r["Nomcultivo"], {"nombre": r["Nomcultivo"], "sembrada": Decimal(0),
                                              "cosechada": Decimal(0), "valor": Decimal(0), "ciclos": {},
                                              "modalidades": set(), "unidades": set()})
        c["sembrada"] += d(r["Sembrada"])
        c["cosechada"] += d(r["Cosechada"])
        c["valor"] += d(r["Valorproduccion"]) or 0
        c["modalidades"].add(r["Nommodalidad"])
        c["unidades"].add(r["Nomunidad"])
        ci = c["ciclos"].setdefault(r["Nomcicloproductivo"], {"rend": [], "sem": Decimal(0)})
        ci["sem"] += d(r["Sembrada"])
        ci["rend"].append(d(r["Rendimiento"]))
    orden = sorted(por.values(), key=lambda c: (-c["sembrada"], -c["cosechada"]))
    return orden


def tarjeta_cultivo(c):
    ciclos = sorted(c["ciclos"], key=lambda x: ("Otoño" not in x, "Primavera" not in x, x))
    modal = lista_es(sorted(c["modalidades"]))
    unidad = "t/ha" if c["unidades"] == {"Tonelada"} else "(" + lista_es(sorted(c["unidades"])) + ")/ha"
    rend = []
    for ciclo in ciclos:
        rs = [x for x in c["ciclos"][ciclo]["rend"] if x is not None]
        rend.append(f"{ciclo}: " + (f"{fmt(rs[0], 2)} {unidad}" if len(rs) == 1 else "sin dato"))
    v = c["valor"]
    if v >= 1_000_000:
        valor = f"${fmt(v / 1_000_000, 1)} millones MXN"
    else:
        valor = f"${fmt(v, 0)} MXN"
    texto = f"Valor de la producción en 2025: {valor}."
    if c["cosechada"] < c["sembrada"]:
        if c["cosechada"] == 0:
            texto += " El cierre no registra superficie cosechada."
        else:
            texto += f" Se registró menos superficie cosechada ({fmt(c['cosechada'])} ha) que sembrada ({fmt(c['sembrada'])} ha)."
    return {
        "chip": f"{modal} · {lista_es(ciclos)}",
        "titulo": c["nombre"],
        "texto": texto,
        "filas": [["Sembrada", f"{fmt(c['sembrada'])} ha"], ["Cosechada", f"{fmt(c['cosechada'])} ha"],
                  ["Rendimiento (por ciclo)", "; ".join(rend)], ["Ciclo", ", ".join(ciclos)]],
        "fuente": "SIAP, cierre agrícola 2025",
    }


# ---------------------------------------------------------------- 2. NASA POWER
def leer_power(clave, lat, lon):
    datos = descarga(f"power_{clave}.json", URL_POWER.format(lat=lat, lon=lon))
    j = json.loads(datos.decode("utf-8-sig"))
    return j["properties"]["parameter"], j["parameters"], j["geometry"]["coordinates"]


def extremos(mensual, mayor=True):
    objetivo = max(mensual.values()) if mayor else min(mensual.values())
    meses = [MESES[i] for i, c in enumerate(CODIGOS_MES) if mensual[c] == objetivo]
    return lista_es(meses), objetivo


POWER_TARJETAS = [
    ("T2M", "Temperatura del aire a 2 m (T2M)", "°C", 2, "Promedio diario del aire a 2 m de altura."),
    ("T2M_MAX", "Temperatura máxima diaria a 2 m (T2M_MAX)", "°C", 2, "Máxima diaria del aire a 2 m de altura."),
    ("PRECTOTCORR", "Lluvia (PRECTOTCORR)", "mm/día", 2, "Precipitación corregida, en mm por día."),
    ("ALLSKY_SFC_SW_DWN", "Radiación solar en superficie (ALLSKY_SFC_SW_DWN)", "MJ/m²/día", 2,
     "Radiación de onda corta que llega a la superficie con cielo real."),
    ("RH2M", "Humedad relativa a 2 m (RH2M)", "%", 2, "Humedad relativa del aire a 2 m."),
    ("WS2M", "Viento a 2 m (WS2M)", "m/s", 2, "Velocidad del viento a 2 m de altura."),
]


def tarjetas_power(param, unidades_api):
    out = []
    for cod, titulo, un, dd, desc in POWER_TARJETAS:
        m = {k: v for k, v in param[cod].items() if k != "ANN"}
        ann = param[cod]["ANN"]
        texto = desc + " Es un promedio de 2001 a 2025 para la celda de unos 50 km que incluye a La Paz."
        etiqueta_anual = "Anual"
        valor_anual = ann
        if cod == "T2M_MAX" and ann == max(m.values()):
            etiqueta_anual = "Promedio de los 12 meses (calculado)"
            valor_anual = sum(dec(v) for v in m.values()) / 12
            texto += (f" En la respuesta de POWER, el valor anual (ANN) de esta variable es igual al del mes más alto "
                      f"({fmt(ann, dd)} {un}); por eso se muestra el promedio mensual calculado.")
        mes_alto, v_alto = extremos(m, True)
        mes_bajo, v_bajo = extremos(m, False)
        filas = [[etiqueta_anual, f"{fmt(valor_anual, dd)} {un}"],
                 ["Mes más alto", f"{mes_alto}: {fmt(v_alto, dd)} {un}"],
                 ["Mes más bajo", f"{mes_bajo}: {fmt(v_bajo, dd)} {un}"]]
        if cod == "PRECTOTCORR":
            filas.append(["Lluvia anual estimada", f"{fmt(dec(ann) * 365, 1)} mm (estimación: ANN × 365)"])
        assert unidades_api[cod]["units"].replace("^", "").replace("/", "/") is not None
        out.append({"chip": f"NASA POWER · {un}", "titulo": titulo, "texto": texto, "filas": filas,
                    "fuente": "NASA POWER (MERRA-2), climatología 2001-2025"})
    return out


# ---------------------------------------------------------------- 3. SoilGrids + triangulo USDA
def leer_soil(loc):
    datos = descarga(f"soil_{loc['id']}.json", URL_SOIL.format(lat=loc["lat"], lon=loc["lon"]))
    j = json.loads(datos.decode("utf-8-sig"))
    res = {}
    for capa in j["properties"]["layers"]:
        f = dec(capa["unit_measure"]["d_factor"])
        res[capa["name"]] = {p["label"]: (dec(p["values"]["mean"]) / f if p["values"].get("mean") is not None else None)
                             for p in capa["depths"]}
    return res


def clase_usda(arena, limo, arcilla):
    """Triangulo textural USDA. Devuelve nombre en espanol (derivada)."""
    s = float(arena) + float(limo) + float(arcilla)
    sa, si, cl = (float(arena) / s * 100, float(limo) / s * 100, float(arcilla) / s * 100)
    if si + 1.5 * cl < 15:
        return "arena"
    if si + 1.5 * cl >= 15 and si + 2 * cl < 30:
        return "arena franca"
    if (7 <= cl < 20 and sa > 52 and si + 2 * cl >= 30) or (cl < 7 and si < 50 and si + 2 * cl >= 30):
        return "franco arenoso"
    if 7 <= cl < 27 and 28 <= si < 50 and sa <= 52:
        return "franco"
    if (si >= 50 and 12 <= cl < 27) or (50 <= si < 80 and cl < 12):
        return "franco limoso"
    if si >= 80 and cl < 12:
        return "limo"
    if 20 <= cl < 35 and si < 28 and sa > 45:
        return "franco arcillo arenoso"
    if 27 <= cl < 40 and 20 < sa <= 45:
        return "franco arcilloso"
    if 27 <= cl < 40 and sa <= 20:
        return "franco arcillo limoso"
    if cl >= 35 and sa > 45:
        return "arcillo arenoso"
    if cl >= 40 and si >= 40:
        return "arcillo limoso"
    if cl >= 40:
        return "arcilla"
    raise ValueError("textura fuera del triangulo")


def resumen_suelo(s, prof):
    arena, limo, arc = s["sand"][prof], s["silt"][prof], s["clay"][prof]
    return {
        "clase": clase_usda(arena, limo, arc),
        "ph": fmt(s["phh2o"][prof], 1),
        "textura": f"{fmt(arena, 1)} % / {fmt(limo, 1)} % / {fmt(arc, 1)} %",
        "soc": f"{fmt(s['soc'][prof], 1)} g/kg",
        "n": f"{fmt(s['nitrogen'][prof], 2)} g/kg",
        "cic": f"{fmt(s['cec'][prof], 1)} cmol(c)/kg",
    }


# ---------------------------------------------------------------- construccion
def leer_json(ruta):
    return json.loads(Path(ruta).read_text(encoding="utf-8-sig"))


def construir():
    ind = leer_json(INDICADORES)
    inds = {i["id"]: i for i in ind["indicadores"]}
    filas = leer_siap()
    cultivos = cultivos_siap(filas)

    # ---- totales SIAP
    total = sum(c["sembrada"] for c in cultivos)
    por_ciclo = {}
    riego = Decimal(0)
    valor_total = Decimal(0)
    for r in filas:
        por_ciclo[r["Nomcicloproductivo"]] = por_ciclo.get(r["Nomcicloproductivo"], Decimal(0)) + d(r["Sembrada"])
        if r["Nommodalidad"] == "Riego":
            riego += d(r["Sembrada"])
        valor_total += d(r["Valorproduccion"]) or 0
    pct_riego = riego / total * 100
    top = cultivos[:8]
    top_ha = sum(c["sembrada"] for c in top)
    total_txt = f"{fmt(total)} ha"
    pct_riego_txt = fmt(pct_riego, 0) if redondea(pct_riego, 0) == 100 and pct_riego < 100 else fmt(pct_riego, 0)
    if pct_riego == 100:
        pct_riego_txt = "100"

    # ---- POWER
    p_lp, un_lp, c_lp = leer_power("lapaz", PUNTO_LAPAZ[0], PUNTO_LAPAZ[1])
    p_pl, _, c_pl = leer_power("losplanes", LOC["los-planes"]["lat"], LOC["los-planes"]["lon"])
    lluvia_mm = dec(p_lp["PRECTOTCORR"]["ANN"]) * 365
    diferencias = [(k, m) for k in p_lp for m in p_lp[k] if p_lp[k][m] != p_pl[k][m]]
    celda_txt = ("los valores de la climatología son idénticos" if not diferencias else
                 f"{len(diferencias)} de {sum(len(v) for v in p_lp.values())} valores difieren, y la diferencia máxima "
                 f"es de {fmt(max(abs(dec(p_lp[k][m]) - dec(p_pl[k][m])) for k, m in diferencias), 2)} en sus unidades")

    # ---- SoilGrids
    suelos = {i: leer_soil(LOC[i]) for i in ("los-planes", "el-carrizal", "el-centenario")}
    res0 = {i: resumen_suelo(s, "0-5cm") for i, s in suelos.items()}
    clases = {r["clase"] for r in res0.values()}

    def acu(cod):
        return ACUIFEROS[cod]

    def cifras_acu(cod):
        a = acu(cod)
        dma = dec(a["DMA"])
        return (f"Recarga {fmt(a['R'], 1)} hm³/año · descarga natural comprometida {fmt(a['DNC'], 1)} · "
                f"extracción {fmt(a['VEAS'], 2)} · disponibilidad media anual (DMA) {fmt_signo(dma, 2)} hm³/año "
                f"({'déficit' if dma < 0 else 'volumen disponible'}).")

    corte = "DOF 09/11/2023 (corte 30-dic-2022)"
    nota_0324 = ("Para el acuífero La Paz (0324) hay dos publicaciones con cifras distintas: la tabla del DOF 09/11/2023 "
                 f"(DMA {fmt_signo(acu('0324')['DMA'], 2)} hm³/año, la que se muestra) y el acuerdo específico del DOF 17/08/2023, "
                 "que da otro déficit (27.83 hm³/año, con volúmenes al 30-sep-2021). No se pudo verificar cuál rige.")

    # =============== FICHA CULTIVOS
    alerta_cult = []
    for cod, frase, fu in (("0323", FRASE_0323, FICHA_0323), ("0313", FRASE_0313, FICHA_0313)):
        a = acu(cod)
        alerta_cult.append({"chip": "Sin disponibilidad", "titulo": f"Acuífero {a['nombre']} ({cod})",
                            "texto": cifras_acu(cod),
                            "motivo": f"Ficha de CONAGUA: «{frase}»",
                            "fuente": corte})
    alerta_cult.append({"chip": "Sin disponibilidad", "titulo": "Acuífero La Paz (0324)", "texto": cifras_acu("0324"),
                        "motivo": ("La tabla del DOF 09/11/2023 registra DMA negativa. El acuerdo específico del DOF 17/08/2023 "
                                   f"da otro déficit: «{FRASE_0324_ESPECIFICO}» (volúmenes al 30-sep-2021). "
                                   "No se pudo verificar cuál rige."),
                        "fuente": corte + " y DOF 17/08/2023"})

    dictamen_cult = (
        f"Cierre agrícola 2025 del municipio de La Paz (SIAP): {total_txt} sembradas, {pct_riego_txt} % bajo riego "
        f"(otoño-invierno {fmt(por_ciclo.get('Otoño-Invierno', 0))} ha, primavera-verano {fmt(por_ciclo.get('Primavera-Verano', 0))} ha, "
        f"perennes {fmt(por_ciclo.get('Perennes', 0))} ha). Los 8 cultivos con más superficie suman {fmt(top_ha)} ha "
        f"({fmt(top_ha / total * 100, 0)} % del total). Valor de la producción del municipio: "
        f"${fmt(valor_total / 1_000_000, 1)} millones MXN. Son cifras del cierre 2025, no indican qué conviene sembrar.")

    ficha_cult = {
        "id": "cultivos", "titulo": "Factibilidad y Cultivos", "subtitulo": "Qué se siembra y qué límites de agua hay",
        "chip": f"{total_txt} sembradas", "enlace": "Ver cultivos sembrados y restricciones de agua",
        "detalle": {
            "chips": ["SIAP · CIERRE AGRÍCOLA 2025", f"{pct_riego_txt} % RIEGO"],
            "titulo_largo": "Factibilidad y Cultivos del Municipio de La Paz",
            "descripcion": ("Los ocho cultivos con más superficie sembrada en el municipio de La Paz en 2025 y la "
                            "disponibilidad de agua subterránea de los acuíferos documentados."),
            "veredicto": {"etiqueta": "Superficie sembrada 2025", "valor": total_txt},
            "dictamen": {"titulo": "RESUMEN CON DATOS OFICIALES", "texto": dictamen_cult},
            "grupo": {"titulo": "Principales cultivos sembrados", "nota": "SIAP, cierre 2025 (suma de ciclos)",
                      "tarjetas": [tarjeta_cultivo(c) for c in top]},
            "grupo_alerta": {"titulo": "Restricciones documentadas de agua subterránea",
                             "nota": "CONAGUA, DOF 09/11/2023 · es restricción de concesiones de agua, no veda de cultivos",
                             "tarjetas": alerta_cult},
            "notas": [
                {"titulo": "Sin desglose por valle",
                 "texto": "Todo el municipio de La Paz es un solo CADER en el cierre del SIAP; no hay cifras separadas por valle o localidad."},
                {"titulo": "Calendarios de siembra",
                 "texto": "Los calendarios de siembra por cultivo no se pudieron verificar con una fuente oficial y por eso no se muestran."},
                {"titulo": "El Carrizal sí tiene volumen",
                 "texto": (f"El acuífero El Carrizal (0322) sí tiene volumen disponible para nuevas concesiones: "
                           f"{fmt_signo(acu('0322')['DMA'], 2)} hm³/año ({corte}). La asignación de localidad a acuífero "
                           "se hizo por nombre, no con polígonos.")},
            ],
            "fuentes": [
                fuente("SIAP, Cierre de la producción agrícola por municipio 2025", URL_SIAP),
                fuente("CONAGUA, Acuerdo de disponibilidad media anual de 653 acuíferos (DOF 09/11/2023)", DOF_ACUIFEROS),
                fuente("CONAGUA, ficha del acuífero Los Planes (0323)", FICHA_0323),
                fuente("CONAGUA, ficha del acuífero Todos Santos (0313)", FICHA_0313),
                fuente("DOF 17/08/2023, acuerdo específico acuífero La Paz (0324)", DOF_LAPAZ_ESPECIFICO),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "titulo": "¿Quieres revisar los datos originales?",
                    "texto": "El cierre agrícola municipal 2025 se descarga completo del portal de datos abiertos del SIAP.",
                    "boton": "Abrir fuente (SIAP)", "url": URL_SIAP_PAGINA},
        },
    }

    # =============== FICHA CLIMA
    def linea_ind(i):
        x = inds[i]
        sig = x["significancia"]
        p = fmt_p(sig["p_valor"])
        if x["cambio_total"] is None:
            base = f"{x['titulo']}: {x['cambio_total_nota'].rstrip('.').lower()} ({p})."
            base = base[0].upper() + base[1:]
            return base
        unidad = {"vegetacion": "NDVI", "agua": "cm"}.get(i, x["unidades"])
        return (f"{x['titulo']}: cambio estimado de {fmt_signo(x['cambio_total'], 3 if i == 'vegetacion' else 2)} {unidad} "
                f"en {x['fuente']['periodo']}, {'estadísticamente significativo' if sig['significativo'] else 'no significativo'} ({p}).")

    dictamen_clima = (" ".join(linea_ind(i) for i in ("calor", "vegetacion", "lluvia", "agua")) +
                      " Límites: el calor es temperatura de la superficie, no del aire; la lluvia es de reanálisis "
                      "(~50 km), no de pluviómetro; el agua es una señal regional, no del acuífero de La Paz. "
                      "Mostramos qué cambió, no por qué.")
    alerta_clima = []
    for cod, frase in (("0322", FRASE_0322), ("0323", FRASE_0323), ("0324", None)):
        a = acu(cod)
        pos = dec(a["DMA"]) > 0
        if cod == "0324":
            motivo = ("La tabla del DOF 09/11/2023 registra DMA negativa. El acuerdo específico del DOF 17/08/2023 da otro "
                      "déficit; ver la nota sobre la discrepancia.")
        else:
            motivo = f"Ficha de CONAGUA: «{frase}»"
        alerta_clima.append({"chip": "Con volumen disponible" if pos else "Sin disponibilidad",
                             "titulo": f"Acuífero {a['nombre']} ({cod})", "texto": cifras_acu(cod),
                             "motivo": motivo, "fuente": corte})

    ficha_clima = {
        "id": "clima", "titulo": "Clima y Agua", "subtitulo": "Normales de NASA POWER 2001-2025",
        "chip": f"≈{fmt(lluvia_mm, 1)} mm de lluvia al año (estimación)", "enlace": "Ver clima, tendencias y agua subterránea",
        "detalle": {
            "chips": ["NASA POWER · 2001-2025", "ESTIMACIÓN DE REANÁLISIS"],
            "titulo_largo": "Clima de La Paz y agua subterránea cercana",
            "descripcion": "Temperatura, lluvia, radiación, humedad y viento promedio del punto de La Paz, junto con las tendencias del equipo.",
            "veredicto": {"etiqueta": "Lluvia anual estimada (POWER × 365)", "valor": f"≈{fmt(lluvia_mm, 1)} mm (estimación)"},
            "dictamen": {"titulo": "RESUMEN DE LOS 4 INDICADORES DEL EQUIPO", "texto": dictamen_clima},
            "grupo": {"titulo": "Climatología de La Paz (24.14, -110.31)",
                      "nota": "NASA POWER, promedio 2001-2025 · lluvia anual = promedio diario × 365 (derivada)",
                      "tarjetas": tarjetas_power(p_lp, un_lp)},
            "grupo_alerta": {"titulo": "Agua subterránea en acuíferos cercanos",
                             "nota": "CONAGUA, DOF 09/11/2023 · localidad→acuífero asignada por nombre, no verificada espacialmente",
                             "tarjetas": alerta_clima},
            "notas": [
                {"titulo": "Reanálisis de ~50 km",
                 "texto": "NASA POWER es un reanálisis (MERRA-2) de unos 50 km: no es una medición local ni de estación."},
                {"titulo": "Los Planes en la misma celda",
                 "texto": f"Los Planes cae en una celda casi idéntica a la de La Paz: {celda_txt}."},
                {"titulo": "Acuífero La Paz (0324): dos cifras", "texto": nota_0324},
            ],
            "fuentes": [
                fuente("NASA POWER, climatología (API v2.10.1)", URL_POWER.format(lat=PUNTO_LAPAZ[0], lon=PUNTO_LAPAZ[1])),
                fuente("Indicadores del equipo (MODIS, NASA POWER, GRACE) · web/data/indicadores.json",
                       inds["calor"]["fuente"]["url"]),
                fuente("JPL GRACE/GRACE-FO Mascon (PO.DAAC)", inds["agua"]["fuente"]["url"]),
                fuente("CONAGUA, Acuerdo de disponibilidad media anual de 653 acuíferos (DOF 09/11/2023)", DOF_ACUIFEROS),
                fuente("DOF 17/08/2023, acuerdo específico acuífero La Paz (0324)", DOF_LAPAZ_ESPECIFICO),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "titulo": "¿Quieres revisar los datos originales?",
                    "texto": "La climatología de NASA POWER se consulta sin cuenta para cualquier punto.",
                    "boton": "Abrir fuente (NASA POWER)", "url": "https://power.larc.nasa.gov/"},
        },
    }

    # =============== FICHA SUELO
    clase_txt = (next(iter(clases)).capitalize() if len(clases) == 1
                 else lista_es(sorted(clases)).capitalize())
    tarjetas_suelo = []
    for i in ("los-planes", "el-carrizal", "el-centenario"):
        r = res0[i]
        loc = LOC[i]
        texto = f"Clase textural USDA (derivada, no es dato de SoilGrids): {r['clase']}."
        if loc["nota_geo"]:
            texto += f" {loc['nota_geo']}."
        tarjetas_suelo.append({
            "chip": "SoilGrids 2.0 · 0-5 cm", "titulo": loc["nombre"], "texto": texto,
            "filas": [["pH", r["ph"]], ["Arena / limo / arcilla", r["textura"]], ["Carbono orgánico", r["soc"]],
                      ["Nitrógeno", r["n"]], ["Capacidad de intercambio catiónico", r["cic"]]],
            "fuente": f"ISRIC SoilGrids v2.0, píxel en {loc['lat']}, {loc['lon']}"})
    perfil = []
    for prof in ("0-5cm", "5-15cm", "15-30cm", "30-60cm"):
        r = resumen_suelo(suelos["los-planes"], prof)
        perfil.append({"chip": "Perfil · Los Planes", "titulo": prof.replace("cm", " cm"),
                       "texto": (f"pH {r['ph']} · arena/limo/arcilla {r['textura']} · carbono orgánico {r['soc']} · "
                                 f"nitrógeno {r['n']} · CIC {r['cic']}."),
                       "motivo": f"Clase textural USDA (derivada): {r['clase']}.",
                       "fuente": "ISRIC SoilGrids v2.0 (modelo)"})
    ficha_suelo = {
        "id": "suelo", "titulo": "Salud del Suelo", "subtitulo": "Propiedades modeladas por SoilGrids",
        "chip": f"{clase_txt} (derivada)", "enlace": "Ver propiedades del suelo por localidad",
        "detalle": {
            "chips": ["ISRIC · SOILGRIDS 2.0", "MODELO A 250 M"],
            "titulo_largo": "Suelo en Los Planes, El Carrizal y El Centenario",
            "descripcion": "Propiedades del suelo a 0-5 cm estimadas por un modelo global, en tres localidades del municipio de La Paz.",
            "veredicto": {"etiqueta": "Clase textural USDA a 0-5 cm (derivada)", "valor": clase_txt},
            "dictamen": {"titulo": "RESUMEN CON DATOS DE MODELO",
                         "texto": ("Clase textural derivada con el triángulo USDA a partir de arena, limo y arcilla: "
                                   + "; ".join(f"{LOC[i]['nombre']}, {res0[i]['clase']}" for i in res0) +
                                   f". pH a 0-5 cm: {lista_es([LOC[i]['nombre'] + ' ' + res0[i]['ph'] for i in res0])}. "
                                   "Son estimaciones de modelo, no análisis de laboratorio.")},
            "grupo": {"titulo": "Propiedades a 0-5 cm por localidad", "nota": "SoilGrids 2.0, valor medio del modelo",
                      "tarjetas": tarjetas_suelo},
            "grupo_alerta": {"titulo": "Perfil por profundidad en Los Planes", "tono": "neutro",
                             "nota": "SoilGrids 2.0, valor medio · 0 a 60 cm", "tarjetas": perfil},
            "notas": [
                {"titulo": "Modelo, no muestreo",
                 "texto": "SoilGrids es un modelo global a 250 m de resolución, no un muestreo de laboratorio en el sitio."},
                {"titulo": "Licencia",
                 "texto": "Los mapas de SoilGrids se publican bajo licencia CC BY 4.0 (ISRIC - World Soil Information)."},
                {"titulo": "Edafología INEGI no consultada",
                 "texto": "No se consultó la edafología de INEGI (tipo de suelo); por eso no se muestra."},
            ],
            "fuentes": [
                fuente("ISRIC, SoilGrids v2.0 (API REST)", URL_SOILGRIDS, "CC BY 4.0"),
                fuente("GeoNames, coordenadas de las localidades", "https://www.geonames.org/", "CC BY 4.0"),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "titulo": "¿Quieres revisar los datos originales?",
                    "texto": "SoilGrids permite consultar cualquier punto del mundo.",
                    "boton": "Abrir fuente (SoilGrids)", "url": URL_SOILGRIDS},
        },
    }

    # =============== FICHA RIESGOS
    ficha_riesgos = {
        "id": "riesgos", "titulo": "Riesgos y Sanidad", "subtitulo": "Sequía, sanidad y ciclones",
        "chip": "Sequía: " + SEQUIA_TEXTO.split(";")[0], "enlace": "Ver sequía, sanidad y ciclones",
        "detalle": {
            "chips": ["SMN-CONAGUA · DOF · SEPADA", "SIN FIRMS NI SENASICA"],
            "titulo_largo": "Riesgos para la agricultura en el municipio de La Paz",
            "descripcion": "Lo que hay documentado con fuente oficial sobre sequía, mosca de la fruta y ciclones tropicales.",
            "veredicto": {"etiqueta": "Monitor de Sequía, La Paz", "valor": "Sin categoría al 31 oct 2026"},
            "dictamen": {"titulo": "RESUMEN CON DATOS OFICIALES",
                         "texto": (f"Monitor de Sequía (municipio de La Paz, 03003): {SEQUIA_TEXTO}. Baja California Sur está "
                                   "declarada zona libre de moscas de la fruta del género Anastrepha (DOF 05/10/2018), aunque en 2023 "
                                   "el gobierno estatal informó brotes. Para ciclones solo hay una clasificación estatal.")},
            "grupo": {"titulo": "Riesgos documentados", "nota": "SMN-CONAGUA, DOF, Secretaría de Salud BCS",
                      "tarjetas": [
                          {"chip": "SMN-CONAGUA · municipal", "titulo": "Monitor de Sequía",
                           "texto": f"Municipio de La Paz (03003): {SEQUIA_TEXTO}.",
                           "filas": [["Último corte del archivo", "31 oct 2026"], ["Última categoría registrada", "D0"],
                                     ["Cortes con D0", "30 jun a 31 ago 2026"]],
                           "fuente": "SMN-CONAGUA, tabla MunicipiosSequia"},
                          {"chip": "DOF 05/10/2018", "titulo": "Zona libre de moscas de la fruta",
                           "texto": ("El acuerdo declara zonas libres de moscas de la fruta del género Anastrepha de importancia "
                                     "cuarentenaria a Baja California y Baja California Sur (declaratoria original: DOF 26/02/1998)."),
                           "fuente": "DOF 05/10/2018"},
                          {"chip": "Nivel estatal", "titulo": "Ciclones tropicales",
                           "texto": ("Con base en indicadores del Atlas Nacional de Riesgos, 4 de 5 municipios de Baja California Sur "
                                     "se clasifican con riesgo muy alto de impacto de ciclones tropicales. No se pudo leer el grado "
                                     "específico de La Paz. Temporada en el Pacífico: 15 de mayo al 30 de noviembre."),
                           "fuente": "Perfil Estatal de Riesgos BCS 2025 (Secretaría de Salud BCS)"}]},
            "grupo_alerta": {"titulo": "Brotes de mosca de la fruta en 2023",
                             "nota": "SEPADA BCS (gobierno estatal, no SENASICA), 11 ago 2023",
                             "tarjetas": [{"chip": "Fuente estatal", "titulo": "Brotes en La Paz y Los Cabos (2023)",
                                           "texto": ("En agosto de 2023 la SEPADA informó que SENASICA y USDA avalaron el Plan Emergente "
                                                     "contra la mosca de la fruta; el foco de los brotes estaba entre los municipios de "
                                                     "La Paz y Los Cabos."),
                                           "motivo": "Según la SEPADA: «Baja California Sur mantiene su estatus como zona libre de mosca de la fruta».",
                                           "fuente": "SEPADA BCS, 11/08/2023"}]},
            "notas": [
                {"titulo": "SENASICA no consultado",
                 "texto": "Las páginas de SENASICA no se pudieron consultar (error de acceso); no hay estatus fitosanitario 2025-2026 ni campañas vigentes."},
                {"titulo": "Ciclones: sin grado municipal",
                 "texto": "El grado de peligro de ciclones del municipio de La Paz está en un mapa imagen y no se pudo verificar; no se afirma."},
                {"titulo": "Sequía e incendios",
                 "texto": "En el Monitor de Sequía la celda vacía se reporta como «sin categoría registrada», no como «sin sequía». Los incendios (NASA FIRMS) no se consultaron."},
            ],
            "fuentes": [
                fuente("SMN-CONAGUA, Monitor de Sequía en México (tabla de municipios)", URL_SEQUIA),
                fuente("DOF 05/10/2018, zonas libres de moscas de la fruta", URL_DOF_MOSCAS),
                fuente("SEPADA BCS, Plan Emergente contra la mosca de la fruta (11/08/2023)", URL_SEPADA),
                fuente("Secretaría de Salud BCS, Perfil Estatal de Riesgos BCS 2025", URL_PERFIL),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "titulo": "¿Quieres revisar los datos originales?",
                    "texto": "La tabla del Monitor de Sequía por municipio se descarga del Servicio Meteorológico Nacional.",
                    "boton": "Abrir fuente (SMN)", "url": URL_SEQUIA},
        },
    }

    # =============== MAPA
    r_lp, r_ec, r_cen = res0["los-planes"], res0["el-carrizal"], res0["el-centenario"]
    et = {
        "los-planes": f"Los Planes: pH {r_lp['ph']} · {r_lp['clase']}",
        "el-carrizal": f"El Carrizal: acuífero con {fmt(acu('0322')['DMA'], 2)} hm³/año disponibles",
        "el-centenario": f"El Centenario: pH {r_cen['ph']} · {r_cen['clase']}",
        "chametla": f"Chametla: {fmt(POBLACION_CHAMETLA, 0)} habitantes (INEGI 2020)",
    }
    n_zonas = len(leer_json(ZONAS)["features"])
    periodo = ind["periodo"]
    mapa = {
        "centro": [24.0, -110.2], "zoom": 9,
        "info": {"titulo": "Municipio de La Paz", "texto": f"{total_txt} sembradas en 2025 (SIAP)"},
        "localidades": [{"id": l["id"], "nombre": l["nombre"], "lat": l["lat"], "lon": l["lon"],
                         "etiqueta": et[l["id"]], "fuente_coord": f"GeoNames {l['geonames']} (CC BY 4.0)"}
                        for l in LOCALIDADES],
        "leyenda": {"titulo": f"CAMBIO DE NDVI {periodo['inicio']}–{periodo['fin']}", "etiqueta": "Índice NDVI",
                    "min": "Baja", "max": "Sube", "nota": f"{n_zonas} zonas del equipo (zonas.geojson)"},
        "pie": [f"Acuífero Los Planes: déficit de {fmt(abs(dec(acu('0323')['DMA'])), 2)} hm³/año (DOF 09/11/2023)",
                "Monitor de Sequía: La Paz " + SEQUIA_TEXTO.split(";")[0]],
        "fuentes_pie": "SIAP / CONAGUA / ISRIC / NASA",
    }

    return {
        "generado": HOY, "zona": "Municipio de La Paz, B.C.S.",
        "estado_linea": "DATOS ABIERTOS AGRÍCOLAS · MUNICIPIO DE LA PAZ",
        "consulta_linea": f"Consultado: {date.today().day} {MESES_CORTO[date.today().month - 1]} {date.today().year} · SIAP, CONAGUA, ISRIC, NASA",
        "mapa": mapa,
        "fichas": [ficha_cult, ficha_clima, ficha_suelo, ficha_riesgos],
    }, {"total": total, "top": top, "valor_total": valor_total, "por_ciclo": por_ciclo, "lluvia": lluvia_mm,
        "res0": res0, "diferencias": len(diferencias)}


def main():
    datos, info = construir()
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito {SALIDA} ({SALIDA.stat().st_size:,} bytes)")
    print("Origen de las descargas:", ESTADO_FUENTES)
    print(f"Total sembrado: {fmt(info['total'], 2)} ha | por ciclo: { {k: str(v) for k, v in info['por_ciclo'].items()} }")
    print(f"Valor total: ${fmt(info['valor_total'], 2)} MXN | lluvia anual estimada: {fmt(info['lluvia'], 1)} mm")
    for c in info["top"]:
        print(f"  {c['nombre']}: sembrada {fmt(c['sembrada'], 2)}, cosechada {fmt(c['cosechada'], 2)}")
    print("Suelo 0-5 cm:", {k: (v['clase'], v['ph']) for k, v in info["res0"].items()})
    print("Valores POWER distintos entre La Paz y Los Planes:", info["diferencias"])


if __name__ == "__main__":
    main()
