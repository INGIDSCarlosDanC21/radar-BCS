# Datos verificables para las 4 fichas del mapa pesquero (issue #190)

Consultado el 2026-11-15 con `curl` y lectura de páginas oficiales. Estado: **verificado** (se obtuvo la respuesta real), **parcial** o **no disponible** (se intentó y no se pudo). La web debe mostrar "pendiente" en lo que no esté verificado. Los datos de Open-Meteo son de un **modelo**, no de boyas ni estaciones, y no son aviso oficial.

Muestras reales guardadas en `web/tests/fixtures/` (los archivos de `web/` los integra Diego).

## 1. Estado del mar (avisos)

| Fuente | Qué da | CORS desde navegador | Estado |
|---|---|---|---|
| NHC `https://www.nhc.noaa.gov/CurrentStorms.json` | Tormentas activas en JSON. Hoy `activeStorms: []` (`nhc-currentstorms-2026-11-15.json`) | **No**: la respuesta no trae `Access-Control-Allow-Origin`; hace falta proxy o solo enlace | JSON verificado; uso directo en el navegador no disponible |
| SMN (CONAGUA) <https://smn.conagua.gob.mx/es/> | Avisos en páginas HTML | No verificado | Sin feed abierto encontrado: solo enlace |
| Protección Civil BCS | Sin URL oficial confirmada; solo prensa | No verificado | No disponible: solo enlace si Carlos confirma la URL |
| SEMAR / Capitanía de puerto | Avisos náuticos en PDF | No verificado | Sin API encontrada: solo enlace |

## 2. Condiciones oceanográficas

| Dato | Fuente | Resolución / licencia | Estado |
|---|---|---|---|
| Oleaje de fondo y de viento (`swell_wave_height/period/direction`, `wind_wave_height/period/direction`, `wave_height`), temperatura del mar y corriente | Open-Meteo Marine <https://open-meteo.com/en/docs/marine-weather-api> | CC BY 4.0, uso no comercial. La documentación dice 5 km por hora; **el JSON no trae modelo ni resolución**, no se confirmó | **Verificado** para los 8 puertos: 48 h × 8 puertos, 0 valores nulos en las 9 variables (`pesca-marine-8puertos-2026-11-15.json`). CORS `*` |
| Mareas y corrientes por puerto | NOAA CO-OPS, SEMAR/UNAM, CICESE | — | **No disponible** como dato abierto para BCS: CO-OPS sin estaciones de BCS halladas; mareógrafo UNAM/SEMAR de La Paz solo aparece en un documento de 2018, sin confirmar que siga activo; CICESE sin cobertura hallada. Windfinder (Loreto, Santa Rosalía) es comercial y no oficial: no se usa |
| Fase lunar | USNO <https://aa.usno.navy.mil/api/moon/phases/date?date=AAAA-M-D&nump=N> | Fechas en UTC; sin licencia explícita (por confirmar) | Endpoint verificado, CORS `*`. Alternativa sin red: cálculo astronómico citando el algoritmo (por elegir) |

## 3. Clima costero (Open-Meteo Forecast, 8 pueblos)

Fuente <https://open-meteo.com/en/docs>, CC BY 4.0, uso no comercial, límites publicados de 10 000 llamadas por día. Respuesta real: `pesca-forecast-8pueblos-2026-11-15.json`, CORS `*`.

| Variable | Unidades | Estado |
|---|---|---|
| `pressure_msl` | hPa | Verificado, 0 nulos |
| `visibility` | m | Verificado, 0 nulos |
| `precipitation_probability` | % | Verificado, 0 nulos |
| `cape` | J/kg | Verificado, 0 nulos |
| `dew_point_2m` | °C | Verificado, 0 nulos |
| `sunrise`, `sunset` (diario, con `timezone`) | ISO 8601 | Verificado, 0 nulos |

Sin verificar: modelo exacto y resolución por punto (la documentación solo dice que `best_match` elige el mejor modelo disponible), el texto exacto de atribución (la página `/en/license` llegó vacía) y la cobertura en cada pueblo más allá de la prueba de hoy. Hoy `web/js/datos-vivos.js` no pide estas variables.

## 4. Potencial pesquero

| Dato | Fuente | Resultado | Estado |
|---|---|---|---|
| Clorofila-a numérica | NOAA CoastWatch ERDDAP `https://coastwatch.pfeg.noaa.gov/erddap/griddap/erdVHNchla1day` (VIIRS, mg m⁻³, diario, 750 m, 2015-02-25 a 2026-11-07) | Bahía Magdalena, 2026-11-07: valores de 0.31 a 1.02 mg m⁻³ en la caja consultada (`erddap-viirs-chla-bahia-magdalena-2026-11-07.csv`). Caja de La Paz (24.10 a 24.20, −110.36 a −110.26): solo NaN (costa o nubes; no se probó un punto en mar abierto) | **Parcial**: funciona por punto, pero con huecos; **sin CORS** (`Access-Control-Allow-Origin` ausente): requiere consulta desde el pipeline, no desde el navegador. Licencia: texto estándar NOAA, por confirmar |
| Temperatura del mar numérica | ERDDAP `jplMURSST41` (MUR, JPL PO.DAAC, °C, 0.01°, diario, 2002-06-01 a 2026-11-14) | Bahía Magdalena, 2026-11-13: 28.1 a 28.2 °C en la esquina consultada (`erddap-mur-sst-bahia-magdalena-2026-11-13.csv`). La Paz: NaN en 2026-11-12 y 13 | **Parcial**, mismo límite de CORS. Licencia: PO.DAAC, uso gratuito (por confirmar el texto) |
| Anomalía de SST | ERDDAP `jplMURSST41anom1day` (existe); NOAA Coral Reef Watch 5 km publica anomalía con base 1991-2020 | No se consultó ningún valor ni se confirmó la climatología de MUR | **No verificado**. No citar periodo base de MUR hasta leerlo |
| Calendario de vedas CONAPESCA | gob.mx/conapesca | Sin dataset abierto hallado (datos.gob.mx dio 403); la prensa reporta fechas que se contradicen | **Solo enlace**; no usar fechas sin fuente oficial |
| Tallas mínimas | DOF y normas por especie | La NOM-009-SAG/PESC-2015 trata épocas y zonas de veda, no tallas. DOF dio error de certificado; las normas candidatas (p. ej. NOM-004-PESC-2015 almeja catarina, NOM-039-PESC-2003 jaiba) salen de buscadores y no se leyeron | **No verificado**: ninguna talla se cita hasta leer el DOF desde un navegador |

## Pendiente para el equipo
- Carlos o Diego: abrir desde un navegador el DOF (tallas y vedas) y la página de CONAPESCA.
- Diego: probar el consumo real desde el navegador (CORS) y decidir si NHC va por proxy o solo enlace.
- Decisión: la clorofila y la SST numéricas por punto solo se pueden pedir desde el pipeline (`analisis/`), no desde la web, y requieren un punto en mar abierto por puerto. Cualquier archivo nuevo en `data/` lo revisa y fusiona el Líder.

Investigación en línea delegada a subagentes haiku de Claude Code y revisada por Luca (ver `docs/RECURSOS.md`, sección IA).
