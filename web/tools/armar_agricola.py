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
     "nota_geo": "GeoNames lo registra como San Juan de los Planes",
     "nota_geo_en": "GeoNames lists it as San Juan de los Planes"},
    {"id": "el-carrizal", "nombre": "El Carrizal", "lat": 23.78434, "lon": -110.31166, "geonames": 4010618,
     "nota_geo": "GeoNames tiene otros registros con este nombre; se uso el de mayor poblacion del municipio",
     "nota_geo_en": "GeoNames has other records with this name; the one with the largest population in the municipality was used"},
    {"id": "el-centenario", "nombre": "El Centenario", "lat": 24.1025, "lon": -110.41444, "geonames": 8858277,
     "nota_geo": "", "nota_geo_en": ""},
    {"id": "chametla", "nombre": "Chametla", "lat": 24.09926, "lon": -110.37395, "geonames": 4022333,
     "nota_geo": "", "nota_geo_en": ""},
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

# ---------------------------------------------------------------- traducciones al inglés (campos *_en; issue #93)
# Solo traducción: mismas cifras, unidades y fechas. Los nombres propios (SIAP, CONAGUA, DOF, SoilGrids,
# GeoNames, nombres de lugar) no se traducen. Si falta una clave, el generador falla a propósito (KeyError).
SEQUIA_TEXTO_EN = "no category recorded as of 31 Oct 2026; last category: D0 (cuts from 30 Jun to 31 Aug 2026)"
FRASE_0323_EN = "there is no volume available to grant new concessions; on the contrary, its deficit is 2'337,757 m3."
FRASE_0313_EN = ("there is no volume available to grant new concessions; on the contrary, the deficit is "
                 "2,964,513 m3 per year.")
FRASE_0322_EN = "there is a volume available to grant new concessions of 713,376 m3 per year."
FRASE_0324_ESPECIFICO_EN = "resulting in a deficit in the aquifer of 27.82732 million cubic meters per year"
MESES_EN = {"enero": "January", "febrero": "February", "marzo": "March", "abril": "April", "mayo": "May",
            "junio": "June", "julio": "July", "agosto": "August", "septiembre": "September",
            "octubre": "October", "noviembre": "November", "diciembre": "December"}
MESES_CORTO_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
CICLO_EN = {"Otoño-Invierno": "Fall-Winter", "Primavera-Verano": "Spring-Summer", "Perennes": "Perennial"}
MODALIDAD_EN = {"Riego": "Irrigated", "Temporal": "Rainfed"}
UNIDAD_SIAP_EN = {"Tonelada": "Tonne"}
CULTIVO_EN = {"Tomate rojo (jitomate)": "Red tomato (jitomate)", "Chile verde": "Green chili pepper",
              "Mango": "Mango", "Albahaca": "Basil", "Jícama": "Jicama", "Maíz grano": "Grain corn",
              "Palma de ornato": "Ornamental palm", "Higo": "Fig"}
CLASE_USDA_EN = {"arena": "sand", "arena franca": "loamy sand", "franco arenoso": "sandy loam", "franco": "loam",
                 "franco limoso": "silt loam", "limo": "silt", "franco arcillo arenoso": "sandy clay loam",
                 "franco arcilloso": "clay loam", "franco arcillo limoso": "silty clay loam",
                 "arcillo arenoso": "sandy clay", "arcillo limoso": "silty clay", "arcilla": "clay"}
UNIDAD_POWER_EN = {"mm/día": "mm/day", "MJ/m²/día": "MJ/m²/day"}


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


def dictamen_indicadores(inds):
    """Resumen de los 4 indicadores del equipo (ES, EN) desde web/data/indicadores.json.
    Se llama aparte para poder rehacerlo sin descargar nada cuando cambian los indicadores."""
    def linea_ind(i, en=False):
        x = inds[i]
        sig = x["significancia"]
        p = fmt_p(sig["p_valor"])
        if x["cambio_total"] is None:
            if en:
                base = f"{x['titulo_en']}: {x['cambio_total_nota_en'].rstrip('.').lower()} ({p})."
            else:
                base = f"{x['titulo']}: {x['cambio_total_nota'].rstrip('.').lower()} ({p})."
            base = base[0].upper() + base[1:]
            return base
        unidad = {"vegetacion": "NDVI", "agua": "cm"}.get(i, x["unidades"])
        cifra = fmt_signo(x['cambio_total'], 3 if i == 'vegetacion' else 2)
        if en:
            return (f"{x['titulo_en']}: estimated change of {cifra} {unidad} "
                    f"in {x['fuente']['periodo']}, {'statistically significant' if sig['significativo'] else 'not significant'} ({p}).")
        return (f"{x['titulo']}: cambio estimado de {cifra} {unidad} "
                f"en {x['fuente']['periodo']}, {'estadísticamente significativo' if sig['significativo'] else 'no significativo'} ({p}).")

    dictamen_clima = (" ".join(linea_ind(i) for i in ("calor", "vegetacion", "lluvia", "agua")) +
                      " Límites: el calor es temperatura de la superficie, no del aire; la lluvia es de reanálisis "
                      "(~50 km), no de pluviómetro; el agua es una señal regional, no del acuífero de La Paz. "
                      "Mostramos qué cambió, no por qué.")
    dictamen_clima_en = (" ".join(linea_ind(i, True) for i in ("calor", "vegetacion", "lluvia", "agua")) +
                         " Limits: heat is surface temperature, not air temperature; rainfall comes from a reanalysis "
                         "(~50 km), not from a rain gauge; water is a regional signal, not from the La Paz aquifer. "
                         "We show what changed, not why.")
    return dictamen_clima, dictamen_clima_en


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


def fuente(nombre, url, licencia=None, nombre_en=None):
    f = {"nombre": nombre, "nombre_en": nombre_en or nombre, "url": url}
    if licencia:
        f["licencia"] = licencia
    f["consultado"] = HOY
    return f


def lista_en(items):
    items = list(items)
    if len(items) <= 1:
        return "".join(items)
    return ", ".join(items[:-1]) + " and " + items[-1]


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
    ciclos_en = [CICLO_EN[x] for x in ciclos]
    modal = lista_es(sorted(c["modalidades"]))
    modal_en = lista_en(MODALIDAD_EN[x] for x in sorted(c["modalidades"]))
    unidad = "t/ha" if c["unidades"] == {"Tonelada"} else "(" + lista_es(sorted(c["unidades"])) + ")/ha"
    unidad_en = ("t/ha" if c["unidades"] == {"Tonelada"}
                 else "(" + lista_en(UNIDAD_SIAP_EN[x] for x in sorted(c["unidades"])) + ")/ha")
    rend = []
    rend_en = []
    for ciclo in ciclos:
        rs = [x for x in c["ciclos"][ciclo]["rend"] if x is not None]
        rend.append(f"{ciclo}: " + (f"{fmt(rs[0], 2)} {unidad}" if len(rs) == 1 else "sin dato"))
        rend_en.append(f"{CICLO_EN[ciclo]}: " + (f"{fmt(rs[0], 2)} {unidad_en}" if len(rs) == 1 else "no data"))
    v = c["valor"]
    if v >= 1_000_000:
        valor = f"${fmt(v / 1_000_000, 1)} millones MXN"
        valor_en = f"${fmt(v / 1_000_000, 1)} million MXN"
    else:
        valor = f"${fmt(v, 0)} MXN"
        valor_en = valor
    texto = f"Valor de la producción en 2025: {valor}."
    texto_en = f"Value of production in 2025: {valor_en}."
    if c["cosechada"] < c["sembrada"]:
        if c["cosechada"] == 0:
            texto += " El cierre no registra superficie cosechada."
            texto_en += " The close records no harvested area."
        else:
            texto += f" Se registró menos superficie cosechada ({fmt(c['cosechada'])} ha) que sembrada ({fmt(c['sembrada'])} ha)."
            texto_en += (f" Less harvested area ({fmt(c['cosechada'])} ha) than sown area ({fmt(c['sembrada'])} ha) "
                         "was recorded.")
    return {
        "chip": f"{modal} · {lista_es(ciclos)}",
        "chip_en": f"{modal_en} · {lista_en(ciclos_en)}",
        "titulo": c["nombre"],
        "titulo_en": CULTIVO_EN[c["nombre"]],
        "texto": texto,
        "texto_en": texto_en,
        "filas": [["Sembrada", f"{fmt(c['sembrada'])} ha"], ["Cosechada", f"{fmt(c['cosechada'])} ha"],
                  ["Rendimiento (por ciclo)", "; ".join(rend)], ["Ciclo", ", ".join(ciclos)]],
        "filas_en": [["Sown", f"{fmt(c['sembrada'])} ha"], ["Harvested", f"{fmt(c['cosechada'])} ha"],
                     ["Yield (per cycle)", "; ".join(rend_en)], ["Cycle", ", ".join(ciclos_en)]],
        "fuente": "SIAP, cierre agrícola 2025",
        "fuente_en": "SIAP, 2025 agricultural close",
    }


# ---------------------------------------------------------------- 2. NASA POWER
def leer_power(clave, lat, lon):
    datos = descarga(f"power_{clave}.json", URL_POWER.format(lat=lat, lon=lon))
    j = json.loads(datos.decode("utf-8-sig"))
    return j["properties"]["parameter"], j["parameters"], j["geometry"]["coordinates"]


def extremos(mensual, mayor=True):
    objetivo = max(mensual.values()) if mayor else min(mensual.values())
    meses = [MESES[i] for i, c in enumerate(CODIGOS_MES) if mensual[c] == objetivo]
    return lista_es(meses), objetivo, lista_en(MESES_EN[x] for x in meses)


POWER_TARJETAS = [
    ("T2M", "Temperatura del aire a 2 m (T2M)", "°C", 2, "Promedio diario del aire a 2 m de altura."),
    ("T2M_MAX", "Temperatura máxima diaria a 2 m (T2M_MAX)", "°C", 2, "Máxima diaria del aire a 2 m de altura."),
    ("PRECTOTCORR", "Lluvia (PRECTOTCORR)", "mm/día", 2, "Precipitación corregida, en mm por día."),
    ("ALLSKY_SFC_SW_DWN", "Radiación solar en superficie (ALLSKY_SFC_SW_DWN)", "MJ/m²/día", 2,
     "Radiación de onda corta que llega a la superficie con cielo real."),
    ("RH2M", "Humedad relativa a 2 m (RH2M)", "%", 2, "Humedad relativa del aire a 2 m."),
    ("WS2M", "Viento a 2 m (WS2M)", "m/s", 2, "Velocidad del viento a 2 m de altura."),
]
POWER_EN = {
    "T2M": ("Air temperature at 2 m (T2M)", "Daily average of the air at 2 m height."),
    "T2M_MAX": ("Daily maximum temperature at 2 m (T2M_MAX)", "Daily maximum of the air at 2 m height."),
    "PRECTOTCORR": ("Rainfall (PRECTOTCORR)", "Corrected precipitation, in mm per day."),
    "ALLSKY_SFC_SW_DWN": ("Solar radiation at the surface (ALLSKY_SFC_SW_DWN)",
                          "Shortwave radiation reaching the surface under real sky conditions."),
    "RH2M": ("Relative humidity at 2 m (RH2M)", "Relative humidity of the air at 2 m."),
    "WS2M": ("Wind at 2 m (WS2M)", "Wind speed at 2 m height."),
}


def tarjetas_power(param, unidades_api):
    out = []
    for cod, titulo, un, dd, desc in POWER_TARJETAS:
        m = {k: v for k, v in param[cod].items() if k != "ANN"}
        ann = param[cod]["ANN"]
        un_en = UNIDAD_POWER_EN.get(un, un)
        titulo_en, desc_en = POWER_EN[cod]
        texto = desc + " Es un promedio de 2001 a 2025 para la celda de unos 50 km que incluye a La Paz."
        texto_en = desc_en + " It is an average from 2001 to 2025 for the cell of about 50 km that includes La Paz."
        etiqueta_anual = "Anual"
        etiqueta_anual_en = "Annual"
        valor_anual = ann
        if cod == "T2M_MAX" and ann == max(m.values()):
            etiqueta_anual = "Promedio de los 12 meses (calculado)"
            etiqueta_anual_en = "Average of the 12 months (calculated)"
            valor_anual = sum(dec(v) for v in m.values()) / 12
            texto += (f" En la respuesta de POWER, el valor anual (ANN) de esta variable es igual al del mes más alto "
                      f"({fmt(ann, dd)} {un}); por eso se muestra el promedio mensual calculado.")
            texto_en += (f" In the POWER response, the annual value (ANN) of this variable equals that of the highest "
                         f"month ({fmt(ann, dd)} {un_en}); that is why the calculated monthly average is shown.")
        mes_alto, v_alto, mes_alto_en = extremos(m, True)
        mes_bajo, v_bajo, mes_bajo_en = extremos(m, False)
        filas = [[etiqueta_anual, f"{fmt(valor_anual, dd)} {un}"],
                 ["Mes más alto", f"{mes_alto}: {fmt(v_alto, dd)} {un}"],
                 ["Mes más bajo", f"{mes_bajo}: {fmt(v_bajo, dd)} {un}"]]
        filas_en = [[etiqueta_anual_en, f"{fmt(valor_anual, dd)} {un_en}"],
                    ["Highest month", f"{mes_alto_en}: {fmt(v_alto, dd)} {un_en}"],
                    ["Lowest month", f"{mes_bajo_en}: {fmt(v_bajo, dd)} {un_en}"]]
        if cod == "PRECTOTCORR":
            filas.append(["Lluvia anual estimada", f"{fmt(dec(ann) * 365, 1)} mm (estimación: ANN × 365)"])
            filas_en.append(["Estimated annual rainfall", f"{fmt(dec(ann) * 365, 1)} mm (estimate: ANN × 365)"])
        assert unidades_api[cod]["units"].replace("^", "").replace("/", "/") is not None
        out.append({"chip": f"NASA POWER · {un}", "chip_en": f"NASA POWER · {un_en}",
                    "titulo": titulo, "titulo_en": titulo_en, "texto": texto, "texto_en": texto_en,
                    "filas": filas, "filas_en": filas_en,
                    "fuente": "NASA POWER (MERRA-2), climatología 2001-2025",
                    "fuente_en": "NASA POWER (MERRA-2), 2001-2025 climatology"})
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
        "clase_en": CLASE_USDA_EN[clase_usda(arena, limo, arc)],
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
    celda_txt_en = ("the climatology values are identical" if not diferencias else
                    f"{len(diferencias)} of {sum(len(v) for v in p_lp.values())} values differ, and the maximum difference "
                    f"is {fmt(max(abs(dec(p_lp[k][m]) - dec(p_pl[k][m])) for k, m in diferencias), 2)} in their units")

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

    def cifras_acu_en(cod):
        a = acu(cod)
        dma = dec(a["DMA"])
        return (f"Recharge {fmt(a['R'], 1)} hm³/year · committed natural discharge {fmt(a['DNC'], 1)} · "
                f"extraction {fmt(a['VEAS'], 2)} · mean annual availability (DMA) {fmt_signo(dma, 2)} hm³/year "
                f"({'deficit' if dma < 0 else 'available volume'}).")

    corte = "DOF 09/11/2023 (corte 30-dic-2022)"
    corte_en = "DOF 09/11/2023 (cutoff 30-Dec-2022)"
    nota_0324_en = ("For the La Paz aquifer (0324) there are two publications with different figures: the DOF 09/11/2023 "
                    f"table (DMA {fmt_signo(acu('0324')['DMA'], 2)} hm³/year, the one shown) and the specific agreement "
                    "of DOF 17/08/2023, which gives another deficit (27.83 hm³/year, with volumes as of 30-Sep-2021). "
                    "It could not be verified which one governs.")
    nota_0324 = ("Para el acuífero La Paz (0324) hay dos publicaciones con cifras distintas: la tabla del DOF 09/11/2023 "
                 f"(DMA {fmt_signo(acu('0324')['DMA'], 2)} hm³/año, la que se muestra) y el acuerdo específico del DOF 17/08/2023, "
                 "que da otro déficit (27.83 hm³/año, con volúmenes al 30-sep-2021). No se pudo verificar cuál rige.")

    # =============== FICHA CULTIVOS
    alerta_cult = []
    for cod, frase, frase_en, fu in (("0323", FRASE_0323, FRASE_0323_EN, FICHA_0323),
                                      ("0313", FRASE_0313, FRASE_0313_EN, FICHA_0313)):
        a = acu(cod)
        alerta_cult.append({"chip": "Sin disponibilidad", "chip_en": "No availability",
                            "titulo": f"Acuífero {a['nombre']} ({cod})", "titulo_en": f"{a['nombre']} aquifer ({cod})",
                            "texto": cifras_acu(cod), "texto_en": cifras_acu_en(cod),
                            "motivo": f"Ficha de CONAGUA: «{frase}»",
                            "motivo_en": f"CONAGUA fact sheet: \"{frase_en}\"",
                            "fuente": corte, "fuente_en": corte_en})
    alerta_cult.append({"chip": "Sin disponibilidad", "chip_en": "No availability",
                        "titulo": "Acuífero La Paz (0324)", "titulo_en": "La Paz aquifer (0324)",
                        "texto": cifras_acu("0324"), "texto_en": cifras_acu_en("0324"),
                        "motivo": ("La tabla del DOF 09/11/2023 registra DMA negativa. El acuerdo específico del DOF 17/08/2023 "
                                   f"da otro déficit: «{FRASE_0324_ESPECIFICO}» (volúmenes al 30-sep-2021). "
                                   "No se pudo verificar cuál rige."),
                        "motivo_en": ("The DOF 09/11/2023 table records a negative DMA. The specific agreement of DOF 17/08/2023 "
                                      f"gives another deficit: \"{FRASE_0324_ESPECIFICO_EN}\" (volumes as of 30-Sep-2021). "
                                      "It could not be verified which one governs."),
                        "fuente": corte + " y DOF 17/08/2023", "fuente_en": corte_en + " and DOF 17/08/2023"})

    dictamen_cult = (
        f"Cierre agrícola 2025 del municipio de La Paz (SIAP): {total_txt} sembradas, {pct_riego_txt} % bajo riego "
        f"(otoño-invierno {fmt(por_ciclo.get('Otoño-Invierno', 0))} ha, primavera-verano {fmt(por_ciclo.get('Primavera-Verano', 0))} ha, "
        f"perennes {fmt(por_ciclo.get('Perennes', 0))} ha). Los 8 cultivos con más superficie suman {fmt(top_ha)} ha "
        f"({fmt(top_ha / total * 100, 0)} % del total). Valor de la producción del municipio: "
        f"${fmt(valor_total / 1_000_000, 1)} millones MXN. Son cifras del cierre 2025, no indican qué conviene sembrar.")

    dictamen_cult_en = (
        f"2025 agricultural close of the municipality of La Paz (SIAP): {total_txt} sown, {pct_riego_txt} % under irrigation "
        f"(fall-winter {fmt(por_ciclo.get('Otoño-Invierno', 0))} ha, spring-summer {fmt(por_ciclo.get('Primavera-Verano', 0))} ha, "
        f"perennial {fmt(por_ciclo.get('Perennes', 0))} ha). The 8 crops with the largest area add up to {fmt(top_ha)} ha "
        f"({fmt(top_ha / total * 100, 0)} % of the total). Value of the municipality's production: "
        f"${fmt(valor_total / 1_000_000, 1)} million MXN. These are figures from the 2025 close; they do not indicate what is best to plant.")

    ficha_cult = {
        "id": "cultivos", "titulo": "Factibilidad y Cultivos", "subtitulo": "Qué se siembra y qué límites de agua hay",
        "chip": f"{total_txt} sembradas", "enlace": "Ver cultivos sembrados y restricciones de agua",
        "titulo_en": "Feasibility and Crops", "subtitulo_en": "What is planted and what water limits exist",
        "chip_en": f"{total_txt} sown", "enlace_en": "See planted crops and water restrictions",
        "detalle": {
            "chips": ["SIAP · CIERRE AGRÍCOLA 2025", f"{pct_riego_txt} % RIEGO"],
            "chips_en": ["SIAP · 2025 AGRICULTURAL CLOSE", f"{pct_riego_txt} % IRRIGATION"],
            "titulo_largo": "Factibilidad y Cultivos del Municipio de La Paz",
            "titulo_largo_en": "Feasibility and Crops of the Municipality of La Paz",
            "descripcion": ("Los ocho cultivos con más superficie sembrada en el municipio de La Paz en 2025 y la "
                            "disponibilidad de agua subterránea de los acuíferos documentados."),
            "descripcion_en": ("The eight crops with the largest sown area in the municipality of La Paz in 2025 and the "
                               "groundwater availability of the documented aquifers."),
            "veredicto": {"etiqueta": "Superficie sembrada 2025", "etiqueta_en": "Sown area 2025",
                          "valor": total_txt, "valor_en": total_txt},
            "dictamen": {"titulo": "RESUMEN CON DATOS OFICIALES", "titulo_en": "SUMMARY WITH OFFICIAL DATA",
                         "texto": dictamen_cult, "texto_en": dictamen_cult_en},
            "grupo": {"titulo": "Principales cultivos sembrados", "titulo_en": "Main crops planted",
                      "nota": "SIAP, cierre 2025 (suma de ciclos)", "nota_en": "SIAP, 2025 close (sum of cycles)",
                      "tarjetas": [tarjeta_cultivo(c) for c in top]},
            "grupo_alerta": {"titulo": "Restricciones documentadas de agua subterránea",
                             "titulo_en": "Documented groundwater restrictions",
                             "nota": "CONAGUA, DOF 09/11/2023 · es restricción de concesiones de agua, no veda de cultivos",
                             "nota_en": "CONAGUA, DOF 09/11/2023 · it is a restriction on water concessions, not a ban on crops",
                             "tarjetas": alerta_cult},
            "notas": [
                {"titulo": "Sin desglose por valle", "titulo_en": "No breakdown by valley",
                 "texto": "Todo el municipio de La Paz es un solo CADER en el cierre del SIAP; no hay cifras separadas por valle o localidad.",
                 "texto_en": "The whole municipality of La Paz is a single CADER in the SIAP close; there are no separate figures by valley or locality."},
                {"titulo": "Calendarios de siembra", "titulo_en": "Planting calendars",
                 "texto": "Los calendarios de siembra por cultivo no se pudieron verificar con una fuente oficial y por eso no se muestran.",
                 "texto_en": "Planting calendars by crop could not be verified with an official source, so they are not shown."},
                {"titulo": "El Carrizal sí tiene volumen", "titulo_en": "El Carrizal does have volume",
                 "texto": (f"El acuífero El Carrizal (0322) sí tiene volumen disponible para nuevas concesiones: "
                           f"{fmt_signo(acu('0322')['DMA'], 2)} hm³/año ({corte}). La asignación de localidad a acuífero "
                           "se hizo por nombre, no con polígonos."),
                 "texto_en": (f"The El Carrizal aquifer (0322) does have volume available for new concessions: "
                              f"{fmt_signo(acu('0322')['DMA'], 2)} hm³/year ({corte_en}). The assignment of locality to aquifer "
                              "was done by name, not with polygons.")},
            ],
            "fuentes": [
                fuente("SIAP, Cierre de la producción agrícola por municipio 2025", URL_SIAP,
                       nombre_en="SIAP, Close of agricultural production by municipality 2025"),
                fuente("CONAGUA, Acuerdo de disponibilidad media anual de 653 acuíferos (DOF 09/11/2023)", DOF_ACUIFEROS,
                       nombre_en="CONAGUA, Agreement on mean annual availability of 653 aquifers (DOF 09/11/2023)"),
                fuente("CONAGUA, ficha del acuífero Los Planes (0323)", FICHA_0323,
                       nombre_en="CONAGUA, fact sheet of the Los Planes aquifer (0323)"),
                fuente("CONAGUA, ficha del acuífero Todos Santos (0313)", FICHA_0313,
                       nombre_en="CONAGUA, fact sheet of the Todos Santos aquifer (0313)"),
                fuente("DOF 17/08/2023, acuerdo específico acuífero La Paz (0324)", DOF_LAPAZ_ESPECIFICO,
                       nombre_en="DOF 17/08/2023, specific agreement for the La Paz aquifer (0324)"),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "etiqueta_en": "OPEN DATA",
                    "titulo": "¿Quieres revisar los datos originales?", "titulo_en": "Want to check the original data?",
                    "texto": "El cierre agrícola municipal 2025 se descarga completo del portal de datos abiertos del SIAP.",
                    "texto_en": "The full 2025 municipal agricultural close can be downloaded from the SIAP open data portal.",
                    "boton": "Abrir fuente (SIAP)", "boton_en": "Open source (SIAP)", "url": URL_SIAP_PAGINA},
        },
    }

    # =============== FICHA CLIMA
    dictamen_clima, dictamen_clima_en = dictamen_indicadores(inds)
    alerta_clima = []
    for cod, frase, frase_en in (("0322", FRASE_0322, FRASE_0322_EN), ("0323", FRASE_0323, FRASE_0323_EN),
                                 ("0324", None, None)):
        a = acu(cod)
        pos = dec(a["DMA"]) > 0
        if cod == "0324":
            motivo = ("La tabla del DOF 09/11/2023 registra DMA negativa. El acuerdo específico del DOF 17/08/2023 da otro "
                      "déficit; ver la nota sobre la discrepancia.")
            motivo_en = ("The DOF 09/11/2023 table records a negative DMA. The specific agreement of DOF 17/08/2023 gives "
                         "another deficit; see the note on the discrepancy.")
        else:
            motivo = f"Ficha de CONAGUA: «{frase}»"
            motivo_en = f"CONAGUA fact sheet: \"{frase_en}\""
        alerta_clima.append({"chip": "Con volumen disponible" if pos else "Sin disponibilidad",
                             "chip_en": "With available volume" if pos else "No availability",
                             "titulo": f"Acuífero {a['nombre']} ({cod})", "titulo_en": f"{a['nombre']} aquifer ({cod})",
                             "texto": cifras_acu(cod), "texto_en": cifras_acu_en(cod),
                             "motivo": motivo, "motivo_en": motivo_en, "fuente": corte, "fuente_en": corte_en})

    ficha_clima = {
        "id": "clima", "titulo": "Clima y Agua", "subtitulo": "Normales de NASA POWER 2001-2025",
        "chip": f"≈{fmt(lluvia_mm, 1)} mm de lluvia al año (estimación)", "enlace": "Ver clima, tendencias y agua subterránea",
        "titulo_en": "Climate and Water", "subtitulo_en": "NASA POWER normals 2001-2025",
        "chip_en": f"≈{fmt(lluvia_mm, 1)} mm of rain per year (estimate)",
        "enlace_en": "See climate, trends and groundwater",
        "detalle": {
            "chips": ["NASA POWER · 2001-2025", "ESTIMACIÓN DE REANÁLISIS"],
            "chips_en": ["NASA POWER · 2001-2025", "REANALYSIS ESTIMATE"],
            "titulo_largo": "Clima de La Paz y agua subterránea cercana",
            "titulo_largo_en": "Climate of La Paz and nearby groundwater",
            "descripcion": "Temperatura, lluvia, radiación, humedad y viento promedio del punto de La Paz, junto con las tendencias del equipo.",
            "descripcion_en": "Average temperature, rainfall, radiation, humidity and wind at the La Paz point, together with the team's trends.",
            "veredicto": {"etiqueta": "Lluvia anual estimada (POWER × 365)", "etiqueta_en": "Estimated annual rainfall (POWER × 365)",
                          "valor": f"≈{fmt(lluvia_mm, 1)} mm (estimación)", "valor_en": f"≈{fmt(lluvia_mm, 1)} mm (estimate)"},
            "dictamen": {"titulo": "RESUMEN DE LOS 4 INDICADORES DEL EQUIPO", "titulo_en": "SUMMARY OF THE TEAM'S 4 INDICATORS",
                         "texto": dictamen_clima, "texto_en": dictamen_clima_en},
            "grupo": {"titulo": "Climatología de La Paz (24.14, -110.31)", "titulo_en": "Climatology of La Paz (24.14, -110.31)",
                      "nota": "NASA POWER, promedio 2001-2025 · lluvia anual = promedio diario × 365 (derivada)",
                      "nota_en": "NASA POWER, 2001-2025 average · annual rainfall = daily average × 365 (derived)",
                      "tarjetas": tarjetas_power(p_lp, un_lp)},
            "grupo_alerta": {"titulo": "Agua subterránea en acuíferos cercanos", "titulo_en": "Groundwater in nearby aquifers",
                             "nota": "CONAGUA, DOF 09/11/2023 · localidad→acuífero asignada por nombre, no verificada espacialmente",
                             "nota_en": "CONAGUA, DOF 09/11/2023 · locality→aquifer assigned by name, not spatially verified",
                             "tarjetas": alerta_clima},
            "notas": [
                {"titulo": "Reanálisis de ~50 km", "titulo_en": "~50 km reanalysis",
                 "texto": "NASA POWER es un reanálisis (MERRA-2) de unos 50 km: no es una medición local ni de estación.",
                 "texto_en": "NASA POWER is a reanalysis (MERRA-2) of about 50 km: it is not a local or station measurement."},
                {"titulo": "Los Planes en la misma celda", "titulo_en": "Los Planes in the same cell",
                 "texto": f"Los Planes cae en una celda casi idéntica a la de La Paz: {celda_txt}.",
                 "texto_en": f"Los Planes falls in a cell almost identical to that of La Paz: {celda_txt_en}."},
                {"titulo": "Acuífero La Paz (0324): dos cifras", "titulo_en": "La Paz aquifer (0324): two figures",
                 "texto": nota_0324, "texto_en": nota_0324_en},
            ],
            "fuentes": [
                fuente("NASA POWER, climatología (API v2.10.1)", URL_POWER.format(lat=PUNTO_LAPAZ[0], lon=PUNTO_LAPAZ[1]),
                       nombre_en="NASA POWER, climatology (API v2.10.1)"),
                fuente("Indicadores del equipo (MODIS, NASA POWER, GRACE) · web/data/indicadores.json",
                       inds["calor"]["fuente"]["url"],
                       nombre_en="Team indicators (MODIS, NASA POWER, GRACE) · web/data/indicadores.json"),
                fuente("JPL GRACE/GRACE-FO Mascon (PO.DAAC)", inds["agua"]["fuente"]["url"]),
                fuente("CONAGUA, Acuerdo de disponibilidad media anual de 653 acuíferos (DOF 09/11/2023)", DOF_ACUIFEROS,
                       nombre_en="CONAGUA, Agreement on mean annual availability of 653 aquifers (DOF 09/11/2023)"),
                fuente("DOF 17/08/2023, acuerdo específico acuífero La Paz (0324)", DOF_LAPAZ_ESPECIFICO,
                       nombre_en="DOF 17/08/2023, specific agreement for the La Paz aquifer (0324)"),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "etiqueta_en": "OPEN DATA",
                    "titulo": "¿Quieres revisar los datos originales?", "titulo_en": "Want to check the original data?",
                    "texto": "La climatología de NASA POWER se consulta sin cuenta para cualquier punto.",
                    "texto_en": "The NASA POWER climatology can be queried without an account for any point.",
                    "boton": "Abrir fuente (NASA POWER)", "boton_en": "Open source (NASA POWER)",
                    "url": "https://power.larc.nasa.gov/"},
        },
    }

    # =============== FICHA SUELO
    clase_txt = (next(iter(clases)).capitalize() if len(clases) == 1
                 else lista_es(sorted(clases)).capitalize())
    clases_en = {r["clase_en"] for r in res0.values()}
    clase_txt_en = (next(iter(clases_en)).capitalize() if len(clases_en) == 1
                    else lista_en(sorted(clases_en)).capitalize())
    tarjetas_suelo = []
    for i in ("los-planes", "el-carrizal", "el-centenario"):
        r = res0[i]
        loc = LOC[i]
        texto = f"Clase textural USDA (derivada, no es dato de SoilGrids): {r['clase']}."
        texto_en = f"USDA textural class (derived, not a SoilGrids value): {r['clase_en']}."
        if loc["nota_geo"]:
            texto += f" {loc['nota_geo']}."
            texto_en += f" {loc['nota_geo_en']}."
        tarjetas_suelo.append({
            "chip": "SoilGrids 2.0 · 0-5 cm", "chip_en": "SoilGrids 2.0 · 0-5 cm",
            "titulo": loc["nombre"], "titulo_en": loc["nombre"], "texto": texto, "texto_en": texto_en,
            "filas": [["pH", r["ph"]], ["Arena / limo / arcilla", r["textura"]], ["Carbono orgánico", r["soc"]],
                      ["Nitrógeno", r["n"]], ["Capacidad de intercambio catiónico", r["cic"]]],
            "filas_en": [["pH", r["ph"]], ["Sand / silt / clay", r["textura"]], ["Organic carbon", r["soc"]],
                         ["Nitrogen", r["n"]], ["Cation exchange capacity", r["cic"]]],
            "fuente": f"ISRIC SoilGrids v2.0, píxel en {loc['lat']}, {loc['lon']}",
            "fuente_en": f"ISRIC SoilGrids v2.0, pixel at {loc['lat']}, {loc['lon']}"})
    perfil = []
    for prof in ("0-5cm", "5-15cm", "15-30cm", "30-60cm"):
        r = resumen_suelo(suelos["los-planes"], prof)
        perfil.append({"chip": "Perfil · Los Planes", "chip_en": "Profile · Los Planes",
                       "titulo": prof.replace("cm", " cm"), "titulo_en": prof.replace("cm", " cm"),
                       "texto": (f"pH {r['ph']} · arena/limo/arcilla {r['textura']} · carbono orgánico {r['soc']} · "
                                 f"nitrógeno {r['n']} · CIC {r['cic']}."),
                       "texto_en": (f"pH {r['ph']} · sand/silt/clay {r['textura']} · organic carbon {r['soc']} · "
                                    f"nitrogen {r['n']} · CEC {r['cic']}."),
                       "motivo": f"Clase textural USDA (derivada): {r['clase']}.",
                       "motivo_en": f"USDA textural class (derived): {r['clase_en']}.",
                       "fuente": "ISRIC SoilGrids v2.0 (modelo)", "fuente_en": "ISRIC SoilGrids v2.0 (model)"})
    ficha_suelo = {
        "id": "suelo", "titulo": "Salud del Suelo", "subtitulo": "Propiedades modeladas por SoilGrids",
        "chip": f"{clase_txt} (derivada)", "enlace": "Ver propiedades del suelo por localidad",
        "titulo_en": "Soil Health", "subtitulo_en": "Properties modeled by SoilGrids",
        "chip_en": f"{clase_txt_en} (derived)", "enlace_en": "See soil properties by locality",
        "detalle": {
            "chips": ["ISRIC · SOILGRIDS 2.0", "MODELO A 250 M"],
            "chips_en": ["ISRIC · SOILGRIDS 2.0", "250 M MODEL"],
            "titulo_largo": "Suelo en Los Planes, El Carrizal y El Centenario",
            "titulo_largo_en": "Soil in Los Planes, El Carrizal and El Centenario",
            "descripcion": "Propiedades del suelo a 0-5 cm estimadas por un modelo global, en tres localidades del municipio de La Paz.",
            "descripcion_en": "Soil properties at 0-5 cm estimated by a global model, in three localities of the municipality of La Paz.",
            "veredicto": {"etiqueta": "Clase textural USDA a 0-5 cm (derivada)", "etiqueta_en": "USDA textural class at 0-5 cm (derived)",
                          "valor": clase_txt, "valor_en": clase_txt_en},
            "dictamen": {"titulo": "RESUMEN CON DATOS DE MODELO", "titulo_en": "SUMMARY WITH MODEL DATA",
                         "texto_en": ("Textural class derived with the USDA triangle from sand, silt and clay: "
                                      + "; ".join(f"{LOC[i]['nombre']}, {res0[i]['clase_en']}" for i in res0) +
                                      f". pH at 0-5 cm: {lista_en([LOC[i]['nombre'] + ' ' + res0[i]['ph'] for i in res0])}. "
                                      "These are model estimates, not laboratory analyses."),
                         "texto": ("Clase textural derivada con el triángulo USDA a partir de arena, limo y arcilla: "
                                   + "; ".join(f"{LOC[i]['nombre']}, {res0[i]['clase']}" for i in res0) +
                                   f". pH a 0-5 cm: {lista_es([LOC[i]['nombre'] + ' ' + res0[i]['ph'] for i in res0])}. "
                                   "Son estimaciones de modelo, no análisis de laboratorio.")},
            "grupo": {"titulo": "Propiedades a 0-5 cm por localidad", "titulo_en": "Properties at 0-5 cm by locality",
                      "nota": "SoilGrids 2.0, valor medio del modelo", "nota_en": "SoilGrids 2.0, model mean value",
                      "tarjetas": tarjetas_suelo},
            "grupo_alerta": {"titulo": "Perfil por profundidad en Los Planes", "titulo_en": "Depth profile in Los Planes",
                             "tono": "neutro",
                             "nota": "SoilGrids 2.0, valor medio · 0 a 60 cm", "nota_en": "SoilGrids 2.0, mean value · 0 to 60 cm",
                             "tarjetas": perfil},
            "notas": [
                {"titulo": "Modelo, no muestreo", "titulo_en": "Model, not sampling",
                 "texto": "SoilGrids es un modelo global a 250 m de resolución, no un muestreo de laboratorio en el sitio.",
                 "texto_en": "SoilGrids is a global model at 250 m resolution, not a laboratory sampling on site."},
                {"titulo": "Licencia", "titulo_en": "License",
                 "texto": "Los mapas de SoilGrids se publican bajo licencia CC BY 4.0 (ISRIC - World Soil Information).",
                 "texto_en": "SoilGrids maps are published under a CC BY 4.0 license (ISRIC - World Soil Information)."},
                {"titulo": "Edafología INEGI no consultada", "titulo_en": "INEGI soil survey not consulted",
                 "texto": "No se consultó la edafología de INEGI (tipo de suelo); por eso no se muestra.",
                 "texto_en": "The INEGI soil survey (soil type) was not consulted; that is why it is not shown."},
            ],
            "fuentes": [
                fuente("ISRIC, SoilGrids v2.0 (API REST)", URL_SOILGRIDS, "CC BY 4.0",
                       nombre_en="ISRIC, SoilGrids v2.0 (REST API)"),
                fuente("GeoNames, coordenadas de las localidades", "https://www.geonames.org/", "CC BY 4.0",
                       nombre_en="GeoNames, coordinates of the localities"),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "etiqueta_en": "OPEN DATA",
                    "titulo": "¿Quieres revisar los datos originales?", "titulo_en": "Want to check the original data?",
                    "texto": "SoilGrids permite consultar cualquier punto del mundo.",
                    "texto_en": "SoilGrids lets you query any point in the world.",
                    "boton": "Abrir fuente (SoilGrids)", "boton_en": "Open source (SoilGrids)", "url": URL_SOILGRIDS},
        },
    }

    # =============== FICHA RIESGOS
    ficha_riesgos = {
        "id": "riesgos", "titulo": "Riesgos y Sanidad", "subtitulo": "Sequía, sanidad y ciclones",
        "chip": "Sequía: " + SEQUIA_TEXTO.split(";")[0], "enlace": "Ver sequía, sanidad y ciclones",
        "titulo_en": "Risks and Plant Health", "subtitulo_en": "Drought, plant health and cyclones",
        "chip_en": "Drought: " + SEQUIA_TEXTO_EN.split(";")[0], "enlace_en": "See drought, plant health and cyclones",
        "detalle": {
            "chips": ["SMN-CONAGUA · DOF · SEPADA", "SIN FIRMS NI SENASICA"],
            "chips_en": ["SMN-CONAGUA · DOF · SEPADA", "NO FIRMS OR SENASICA"],
            "titulo_largo": "Riesgos para la agricultura en el municipio de La Paz",
            "titulo_largo_en": "Risks for agriculture in the municipality of La Paz",
            "descripcion": "Lo que hay documentado con fuente oficial sobre sequía, mosca de la fruta y ciclones tropicales.",
            "descripcion_en": "What is documented with an official source about drought, fruit flies and tropical cyclones.",
            "veredicto": {"etiqueta": "Monitor de Sequía, La Paz", "etiqueta_en": "Drought Monitor, La Paz",
                          "valor": "Sin categoría al 31 oct 2026", "valor_en": "No category as of 31 Oct 2026"},
            "dictamen": {"titulo": "RESUMEN CON DATOS OFICIALES", "titulo_en": "SUMMARY WITH OFFICIAL DATA",
                         "texto_en": (f"Drought Monitor (municipality of La Paz, 03003): {SEQUIA_TEXTO_EN}. Baja California Sur is "
                                      "declared a free zone of fruit flies of the genus Anastrepha (DOF 05/10/2018), although in 2023 "
                                      "the state government reported outbreaks. For cyclones there is only a state-level classification."),
                         "texto": (f"Monitor de Sequía (municipio de La Paz, 03003): {SEQUIA_TEXTO}. Baja California Sur está "
                                   "declarada zona libre de moscas de la fruta del género Anastrepha (DOF 05/10/2018), aunque en 2023 "
                                   "el gobierno estatal informó brotes. Para ciclones solo hay una clasificación estatal.")},
            "grupo": {"titulo": "Riesgos documentados", "titulo_en": "Documented risks",
                      "nota": "SMN-CONAGUA, DOF, Secretaría de Salud BCS", "nota_en": "SMN-CONAGUA, DOF, BCS Ministry of Health",
                      "tarjetas": [
                          {"chip": "SMN-CONAGUA · municipal", "chip_en": "SMN-CONAGUA · municipal",
                           "titulo": "Monitor de Sequía", "titulo_en": "Drought Monitor",
                           "texto": f"Municipio de La Paz (03003): {SEQUIA_TEXTO}.",
                           "texto_en": f"Municipality of La Paz (03003): {SEQUIA_TEXTO_EN}.",
                           "filas": [["Último corte del archivo", "31 oct 2026"], ["Última categoría registrada", "D0"],
                                     ["Cortes con D0", "30 jun a 31 ago 2026"]],
                           "filas_en": [["Latest cut in the file", "31 Oct 2026"], ["Last category recorded", "D0"],
                                        ["Cuts with D0", "30 Jun to 31 Aug 2026"]],
                           "fuente": "SMN-CONAGUA, tabla MunicipiosSequia",
                           "fuente_en": "SMN-CONAGUA, MunicipiosSequia table"},
                          {"chip": "DOF 05/10/2018", "chip_en": "DOF 05/10/2018",
                           "titulo": "Zona libre de moscas de la fruta", "titulo_en": "Fruit fly free zone",
                           "texto": ("El acuerdo declara zonas libres de moscas de la fruta del género Anastrepha de importancia "
                                     "cuarentenaria a Baja California y Baja California Sur (declaratoria original: DOF 26/02/1998)."),
                           "texto_en": ("The agreement declares Baja California and Baja California Sur free zones of fruit flies "
                                        "of the genus Anastrepha of quarantine importance (original declaration: DOF 26/02/1998)."),
                           "fuente": "DOF 05/10/2018", "fuente_en": "DOF 05/10/2018"},
                          {"chip": "Nivel estatal", "chip_en": "State level",
                           "titulo": "Ciclones tropicales", "titulo_en": "Tropical cyclones",
                           "texto": ("Con base en indicadores del Atlas Nacional de Riesgos, 4 de 5 municipios de Baja California Sur "
                                     "se clasifican con riesgo muy alto de impacto de ciclones tropicales. No se pudo leer el grado "
                                     "específico de La Paz. Temporada en el Pacífico: 15 de mayo al 30 de noviembre."),
                           "texto_en": ("Based on indicators from the National Risk Atlas, 4 of 5 municipalities of Baja California Sur "
                                        "are classified as having very high risk of tropical cyclone impact. The specific level "
                                        "for La Paz could not be read. Season in the Pacific: May 15 to November 30."),
                           "fuente": "Perfil Estatal de Riesgos BCS 2025 (Secretaría de Salud BCS)",
                           "fuente_en": "BCS State Risk Profile 2025 (BCS Ministry of Health)"}]},
            "grupo_alerta": {"titulo": "Brotes de mosca de la fruta en 2023", "titulo_en": "Fruit fly outbreaks in 2023",
                             "nota": "SEPADA BCS (gobierno estatal, no SENASICA), 11 ago 2023",
                             "nota_en": "SEPADA BCS (state government, not SENASICA), 11 Aug 2023",
                             "tarjetas": [{"chip": "Fuente estatal", "chip_en": "State source",
                                           "titulo": "Brotes en La Paz y Los Cabos (2023)",
                                           "titulo_en": "Outbreaks in La Paz and Los Cabos (2023)",
                                           "texto": ("En agosto de 2023 la SEPADA informó que SENASICA y USDA avalaron el Plan Emergente "
                                                     "contra la mosca de la fruta; el foco de los brotes estaba entre los municipios de "
                                                     "La Paz y Los Cabos."),
                                           "texto_en": ("In August 2023 SEPADA reported that SENASICA and USDA endorsed the Emergency "
                                                        "Plan against the fruit fly; the focus of the outbreaks was between the "
                                                        "municipalities of La Paz and Los Cabos."),
                                           "motivo": "Según la SEPADA: «Baja California Sur mantiene su estatus como zona libre de mosca de la fruta».",
                                           "motivo_en": "According to SEPADA: \"Baja California Sur keeps its status as a fruit fly free zone\".",
                                           "fuente": "SEPADA BCS, 11/08/2023", "fuente_en": "SEPADA BCS, 11/08/2023"}]},
            "notas": [
                {"titulo": "SENASICA no consultado", "titulo_en": "SENASICA not consulted",
                 "texto": "Las páginas de SENASICA no se pudieron consultar (error de acceso); no hay estatus fitosanitario 2025-2026 ni campañas vigentes.",
                 "texto_en": "The SENASICA pages could not be consulted (access error); there is no 2025-2026 plant health status or current campaigns."},
                {"titulo": "Ciclones: sin grado municipal", "titulo_en": "Cyclones: no municipal level",
                 "texto": "El grado de peligro de ciclones del municipio de La Paz está en un mapa imagen y no se pudo verificar; no se afirma.",
                 "texto_en": "The cyclone hazard level of the municipality of La Paz is in an image map and could not be verified; it is not stated."},
                {"titulo": "Sequía e incendios", "titulo_en": "Drought and fires",
                 "texto": "En el Monitor de Sequía la celda vacía se reporta como «sin categoría registrada», no como «sin sequía». Los incendios (NASA FIRMS) no se consultaron.",
                 "texto_en": "In the Drought Monitor the empty cell is reported as \"no category recorded\", not as \"no drought\". Fires (NASA FIRMS) were not consulted."},
            ],
            "fuentes": [
                fuente("SMN-CONAGUA, Monitor de Sequía en México (tabla de municipios)", URL_SEQUIA,
                       nombre_en="SMN-CONAGUA, Drought Monitor in Mexico (municipalities table)"),
                fuente("DOF 05/10/2018, zonas libres de moscas de la fruta", URL_DOF_MOSCAS,
                       nombre_en="DOF 05/10/2018, fruit fly free zones"),
                fuente("SEPADA BCS, Plan Emergente contra la mosca de la fruta (11/08/2023)", URL_SEPADA,
                       nombre_en="SEPADA BCS, Emergency Plan against the fruit fly (11/08/2023)"),
                fuente("Secretaría de Salud BCS, Perfil Estatal de Riesgos BCS 2025", URL_PERFIL,
                       nombre_en="BCS Ministry of Health, BCS State Risk Profile 2025"),
            ],
            "cta": {"etiqueta": "DATOS ABIERTOS", "etiqueta_en": "OPEN DATA",
                    "titulo": "¿Quieres revisar los datos originales?", "titulo_en": "Want to check the original data?",
                    "texto": "La tabla del Monitor de Sequía por municipio se descarga del Servicio Meteorológico Nacional.",
                    "texto_en": "The Drought Monitor table by municipality is downloaded from the National Meteorological Service.",
                    "boton": "Abrir fuente (SMN)", "boton_en": "Open source (SMN)", "url": URL_SEQUIA},
        },
    }

    # =============== MAPA
    r_lp, r_ec, r_cen = res0["los-planes"], res0["el-carrizal"], res0["el-centenario"]
    et_en = {
        "los-planes": f"Los Planes: pH {r_lp['ph']} · {r_lp['clase_en']}",
        "el-carrizal": f"El Carrizal: aquifer with {fmt(acu('0322')['DMA'], 2)} hm³/year available",
        "el-centenario": f"El Centenario: pH {r_cen['ph']} · {r_cen['clase_en']}",
        "chametla": f"Chametla: {fmt(POBLACION_CHAMETLA, 0)} inhabitants (INEGI 2020)",
    }
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
        "info": {"titulo": "Municipio de La Paz", "titulo_en": "Municipality of La Paz",
                 "texto": f"{total_txt} sembradas en 2025 (SIAP)", "texto_en": f"{total_txt} sown in 2025 (SIAP)"},
        "localidades": [{"id": l["id"], "nombre": l["nombre"], "lat": l["lat"], "lon": l["lon"],
                         "etiqueta": et[l["id"]], "etiqueta_en": et_en[l["id"]],
                         "fuente_coord": f"GeoNames {l['geonames']} (CC BY 4.0)",
                         "fuente_coord_en": f"GeoNames {l['geonames']} (CC BY 4.0)"}
                        for l in LOCALIDADES],
        "leyenda": {"titulo": f"CAMBIO DE NDVI {periodo['inicio']}–{periodo['fin']}",
                    "titulo_en": f"NDVI CHANGE {periodo['inicio']}–{periodo['fin']}",
                    "etiqueta": "Índice NDVI", "etiqueta_en": "NDVI index",
                    "min": "Baja", "min_en": "Low", "max": "Sube", "max_en": "Rises",
                    "nota": f"{n_zonas} zonas del equipo (zonas.geojson)",
                    "nota_en": f"{n_zonas} team zones (zonas.geojson)"},
        "pie": [f"Acuífero Los Planes: déficit de {fmt(abs(dec(acu('0323')['DMA'])), 2)} hm³/año (DOF 09/11/2023)",
                "Monitor de Sequía: La Paz " + SEQUIA_TEXTO.split(";")[0]],
        "pie_en": [f"Los Planes aquifer: deficit of {fmt(abs(dec(acu('0323')['DMA'])), 2)} hm³/year (DOF 09/11/2023)",
                   "Drought Monitor: La Paz " + SEQUIA_TEXTO_EN.split(";")[0]],
        "fuentes_pie": "SIAP / CONAGUA / ISRIC / NASA", "fuentes_pie_en": "SIAP / CONAGUA / ISRIC / NASA",
    }

    return {
        "generado": HOY, "zona": "Municipio de La Paz, B.C.S.", "zona_en": "Municipality of La Paz, B.C.S.",
        "estado_linea": "DATOS ABIERTOS AGRÍCOLAS · MUNICIPIO DE LA PAZ",
        "estado_linea_en": "AGRICULTURAL OPEN DATA · MUNICIPALITY OF LA PAZ",
        "consulta_linea": f"Consultado: {date.today().day} {MESES_CORTO[date.today().month - 1]} {date.today().year} · SIAP, CONAGUA, ISRIC, NASA",
        "consulta_linea_en": f"Accessed: {date.today().day} {MESES_CORTO_EN[date.today().month - 1]} {date.today().year} · SIAP, CONAGUA, ISRIC, NASA",
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
