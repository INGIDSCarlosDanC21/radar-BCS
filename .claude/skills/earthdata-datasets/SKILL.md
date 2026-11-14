---
name: earthdata-datasets
description: Úsala para descubrir, autenticarte y descargar los datasets NASA de Radar BCS (NASA POWER, MOD11A2, MOD13Q1, GRACE/GLDAS, ECOSTRESS, NASADEM) con earthaccess o AppEEARS, con caché local en data/cache/ y sin repetir consultas ni subir credenciales.
---

# Datasets NASA: descubrir, autenticar, descargar

Verificado el 2026-11-14 en documentación oficial y con llamadas reales a las APIs públicas. Lo no confirmado dice **POR VERIFICAR**.

## Reglas
- **Caché primero**: antes de descargar, revisa `data/cache/<dataset>/`. Nombre de archivo determinista (dataset, versión, zona, periodo). Si existe, no vuelvas a pedir. `data/cache/` está en `.gitignore`; nunca `git add -f`.
- **Credenciales**: nunca en el repo ni en chats con agentes externos. Usa `.env` (ignorado; plantilla `.env.example` sin valores) o `.netrc`.
- Archivos pesados a Drive (`docs/DRIVE.md`); al repo solo salidas pequeñas.
- Anota cada dataset usado (URL, versión) en `docs/RECURSOS.md` para la entrega.

## Zona de estudio (La Paz, B.C.S.)
**No inventes el recuadro.** Para el caso de prueba basta un punto; la ciudad según Wikipedia (infobox) está en 24°08′55″N 110°18′24″O (24.1486, -110.3067). Fuente: https://es.wikipedia.org/wiki/La_Paz_(Baja_California_Sur). Un artículo de Wikipedia no sirve como límite urbano: el recuadro o polígono (`bounding_box` = oeste, sur, este, norte) queda **POR DEFINIR**; Investigación lo toma de una fuente oficial citable (p. ej. marco geoestadístico del INEGI: POR VERIFICAR) y lo guarda en un solo archivo de configuración.

## NASA POWER (sin cuenta) — verificado con una llamada real
- Endpoint puntual diario: `https://power.larc.nasa.gov/api/temporal/daily/point`. Regional: `/api/temporal/daily/regional` (usa `latitude-min/max`, `longitude-min/max`, un solo parámetro).
- Parámetros: `parameters` (hasta 20 en puntual), `community` (`AG` o `SB`), `latitude`, `longitude`, `start`, `end` (YYYYMMDD), `format` (JSON, CSV, NetCDF, ASCII).
- Variables probadas: `PRECTOTCORR` (mm/día), `T2M` y `T2M_MAX` (°C). Valor de relleno en la respuesta: `-999`. Datos diarios desde 1981; resolución nativa ~0.5° (los ~50 km del plan).
- Código 429 = demasiadas peticiones; no pidas el mismo punto repetidamente (puede bloquear). Una sola descarga por punto y periodo, guardada en caché.
```
curl "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M&community=AG&longitude=<LON>&latitude=<LAT>&start=20010101&end=20251231&format=JSON"
```

## earthaccess (cuenta Earthdata gratuita)
Instalar: `python -m pip install earthaccess`.
- Login: `earthaccess.login()` (firma `login(strategy="all", persist=False)`). Orden con `"all"`: variables de entorno `EARTHDATA_USERNAME` y `EARTHDATA_PASSWORD`, luego `.netrc` (en Windows `_netrc`: POR VERIFICAR), luego interactivo. `persist=True` guarda en `.netrc` (en la máquina personal, no en el repo).
- `earthaccess.search_datasets(count=-1, **kwargs)` para descubrir colecciones; `earthaccess.search_data(count=-1, **kwargs)` con `short_name`, `bounding_box=(oeste, sur, este, norte)`, `temporal=("2001-01-01", "2025-12-31")`, `count`.
- `earthaccess.download(granulos, local_path, threads=8, force=False)` devuelve rutas; `earthaccess.open(...)` abre en flujo. Si `download` omite archivos ya presentes: POR VERIFICAR (haz tu propio chequeo de caché).
```python
import earthaccess
earthaccess.login()
g = earthaccess.search_data(short_name="MOD11A2", version="061",
        bounding_box=(OESTE, SUR, ESTE, NORTE), temporal=("2001-01-01", "2025-12-31"))
earthaccess.download(g, "data/cache/MOD11A2.061")   # revisa caché antes
```
(`version=` como argumento de búsqueda: POR VERIFICAR; se probó el patrón `short_name`/`bounding_box`/`temporal`/`count` de la documentación.)

## Colecciones (short_name verificados en el catálogo de Earthdata)
| Dato | short_name y versión | Notas |
|---|---|---|
| Temperatura de superficie | `MOD11A2` 061 | 1 km, 8 días, desde 2000-02-18; capa `LST_Day_1km` en Kelvin (LP DAAC) |
| NDVI | `MOD13Q1` 061 | 250 m, 16 días; capa `250m 16 days NDVI`, factor de escala 0.0001 (LP DAAC) |
| Relieve | `NASADEM_HGT` 001 | 30 m; versión NetCDF `NASADEM_NC` 001 (LP DAAC) |
| Calor por colonia (foto) | `ECO_L2T_LSTE` 002 | 70 m, desde 2018-07-09, fechas irregulares, COG por tesela MGRS; no usar para tendencia |
| Agua subterránea (regional) | GRACE/GRACE-FO mascones JPL RL06.3 v04 | **short_name POR VERIFICAR** (existe un producto "TELLUS_GRFO_L3_JPL_RL06.3_LND_v04"); resolución gruesa, solo tendencia regional |
| Humedad/agua del suelo | GLDAS | **short_name POR VERIFICAR** (en GES DISC) |

## AppEEARS (recorte por zona sin bajar escenas completas)
Base: `https://appeears.earthdatacloud.nasa.gov/api`. Login `POST /login` (Basic con usuario y contraseña de Earthdata; el token vence a ~48 h). Tarea `POST /task` con `Authorization: Bearer <token>`; estado `GET /status/{task_id}`; archivos `GET /bundle/{task_id}` y `GET /bundle/{task_id}/{file_id}` (redirección 302 a S3).
- Productos verificados con `GET /product`: `MOD11A2.061` (capas `LST_Day_1km`, `LST_Night_1km`, `QC_Day`...), `MOD13Q1.061` (capas `_250m_16_days_NDVI`, `_250m_16_days_pixel_reliability`...). `NASADEM_NC.001` aparece; `NASADEM_HGT` y ECOSTRESS: POR VERIFICAR.
- Tarea tipo punto: `task_type:"point"`, `params:{dates:[{startDate:"MM-DD-YYYY",endDate:"MM-DD-YYYY"}], layers:[{product:"MOD11A2.061",layer:"LST_Day_1km"}], coordinates:[{latitude:..,longitude:..}]}`. Tipo área: `task_type:"area"` más `geo` (GeoJSON geográfico) y `output:{format:{type:"geotiff"|"netcdf4"}, projection:"native"}`.
- Guarda el `task_id` en `data/cache/` para no reenviar la misma tarea. Las credenciales vienen de `.env`.

## Pasos recomendados
1. Empezar con POWER (inmediato, sin cuenta) para tener series de lluvia y temperatura del aire.
2. MOD11A2 y MOD13Q1 por AppEEARS (área) o earthaccess; cachear.
3. GRACE/GLDAS al final y solo regional.
4. No se probaron aquí descargas de granulos con cuenta Earthdata (sin credenciales): cualquier script de descarga con earthaccess está **no probado**.
