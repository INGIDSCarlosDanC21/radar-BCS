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

## Segunda ronda de confirmación (2026-11-15, agentes haiku)
- **Mareas:** NOAA CO-OPS lista la estación TWC0397 (La Paz) pero devuelve "No Predictions data was found". Sin estaciones oficiales abiertas para Loreto, Santa Rosalía, Pichilingue ni Bahía Magdalena; UNAM, SEMAR, CICESE, IOC y UHSLC no dieron datos de BCS (SEMAR 403, CICESE sin respuesta). Open-Meteo Marine sí da `sea_level_height_msl` (La Paz, 168 valores sin nulos, CORS `*`), pero es un **modelo, no marea astronómica ni medición**: no se muestra como marea. Muestra en el scratchpad de la sesión, no en el repo.
- **Avisos:** sin RSS, CAP ni API de SMN, Protección Civil o SEMAR en los intentos; proteccioncivil.gob.mx y bcs.gob.mx no respondieron, así que es "no encontrado", no una prueba. NHC RSS (`index-at.xml`) cubre el Atlántico y no trae CORS; la API de NWS tiene CORS pero no cubre BCS.
- **Vedas:** datos.gob.mx bloquea las consultas automáticas (403); existe un dataset de normatividad de CONAPESCA sin leer (`nube.conapesca.gob.mx/datosabiertos/Normatividad_Pesquera.txt`). No se puede afirmar que no exista un calendario abierto.
- **Tallas:** solo se leyó la NOM-005-PESC-1993 (abulón, península), vigencia sin verificar en el DOF. La NOM-064-SAG/PESC/SEMARNAT-2013 no fija tallas. Langosta, almeja catarina y callo de hacha: sin norma leída. No se cita ninguna talla.
- **Web:** `web/js/pesca.js` muestra ahora, en 3 de los 4 mosaicos, líneas "Pendiente: …" para lo anterior, y ya no dice "~9 km" porque esa resolución no está confirmada.

## Sondeo independiente de Prog. B (2026-11-15, issue #190)
Segundo sondeo hecho por Diego con llamadas reales, guardado en `web/tests/fixtures/pesca-sondeo-2026-11-15.json`. Coincide con lo anterior en lo esencial; añade el producto ERDDAP `nesdisVHNnoaa20chlaDaily` (VIIRS NOAA-20, casi tiempo real, sin CORS) y la advertencia sobre la NOM-009. Donde difiere (p. ej. horas de la muestra), vale la fuente indicada en cada tabla.


Consultado el **2026-11-15** con llamadas reales desde el equipo de Diego. Muestras guardadas en `web/tests/fixtures/pesca-sondeo-2026-11-15.json`.
Estado: **verificado** (respondió y se midió), **parcial** (existe pero con límite) o **no disponible / no verificado**. Lo que no está verificado no se muestra en la web: aparece como "Pendiente".

### Resumen por ficha

| Ficha | Dato | Fuente | Estado | Nota |
|---|---|---|---|---|
| Estado del mar | Oleaje y viento por hora, 8 puertos | Open-Meteo Marine y Forecast | **verificado** | 72 h sin huecos en los 8 puntos de mar |
| Estado del mar | Avisos oficiales de ciclones | NHC `CurrentStorms.json` | **parcial** | Responde 200 (`activeStorms: []`), pero **sin cabecera CORS**: el navegador no puede leerlo. Solo enlace, o que un script de Luca lo guarde en un JSON estático |
| Estado del mar | Avisos de SMN, Protección Civil, Capitanía | sitios oficiales | **no verificado** | No se encontró feed abierto. `smn.conagua.gob.mx/webservices/?method=1` redirige y termina en error 500/404. Solo enlaces |
| Condiciones oceanográficas | Oleaje de fondo (`swell_wave_height`) y de viento (`wind_wave_height`), periodos | Open-Meteo Marine | **verificado** | Sin huecos en los 8 puertos. Hoy la web usa solo altura de swell |
| Condiciones oceanográficas | Nivel del mar con marea (`sea_level_height_msl`) | Open-Meteo Marine | **parcial** | La doc dice "Sea Level Height including tides". En La Paz oscila 0.24 a 0.94 m en 48 h con forma de marea semidiurna. Es **modelo global**, no tabla oficial: se rotula "modelo" y no se presenta como predicción oficial de marea |
| Condiciones oceanográficas | Predicción oficial de mareas (Servicio Mareográfico Nacional, UNAM) | UNAM, estación La Paz (muelle API Pichilingue) | **no verificado** | Sin API ni datos abiertos localizados (el sitio `ssn.unam.mx` rechazó la conexión). Windfinder es comercial: no se usa |
| Condiciones oceanográficas | Fase lunar | cálculo astronómico | **pendiente** | Se puede calcular, pero hay que elegir y citar el algoritmo (p. ej. Meeus). No se muestra hasta tener la cita |
| Clima costero | Presión (`pressure_msl`), visibilidad, probabilidad de lluvia, CAPE, punto de rocío | Open-Meteo Forecast | **verificado** | Sin huecos en La Paz, Cabo, Mulegé y Guerrero Negro. Unidades: hPa, m, %, J/kg, °C |
| Clima costero | Amanecer y atardecer | Open-Meteo Forecast (`daily`) | **verificado** | Ej. La Paz 2026-11-15: 06:36 y 17:34 |
| Potencial pesquero | Imagen de clorofila | NASA GIBS `VIIRS_NOAA20_Chlorophyll_a` | **verificado** (ya integrada) | Solo imagen |
| Potencial pesquero | Clorofila-a numérica por punto | NOAA CoastWatch ERDDAP `nesdisVHNnoaa20chlaDaily` (VIIRS NOAA-20, NRT, 4 km, desde 2017) | **parcial** | Devuelve valor: 2026-11-12, La Paz (24.25, -110.35) 0.585 mg/m³; Bahía Magdalena (24.70, -112.30) 0.197 mg/m³. Retraso de ~3 días, **casi tiempo real (no calidad científica)**, **sin cabecera CORS** (no se puede pedir desde el navegador: debe bajarlo un script de Luca a un JSON). Política de datos NASA: `science.nasa.gov/earth-science/earth-science-data/data-information-policy/` |
| Potencial pesquero | Temperatura del mar | Open-Meteo Marine `sea_surface_temperature` | **verificado** | La Paz 29.2 °C el 2026-11-15 |
| Potencial pesquero | Anomalía de temperatura del mar y frentes térmicos | NOAA/NASA (p. ej. OISST, MUR) | **no verificado** | No se consultó: hace falta elegir producto, periodo base y fuente |
| Potencial pesquero | Calendario de vedas | CONAPESCA / DOF | **solo enlace** | No hay dato abierto estructurado. Las fechas encontradas en prensa son parciales y contradictorias; no se copian (p. ej. langosta, costa occidental de BCS: una fuente dice 16 feb a 14 sep 2026, otra veda sin fecha de término). Se enlaza a `https://www.gob.mx/conapesca` |
| Potencial pesquero | Tallas mínimas por especie | DOF / Carta Nacional Pesquera | **no verificado** | Ver advertencia abajo |
| Potencial pesquero | Áreas protegidas (ANP) | CONANP | **no verificado** | No se consultó |

### Hallazgos que cambian la web

1. **Error en el Figma:** las tarjetas de "Fichas de Captura Legal" citan "NOM-009-SAG/PESC" para las tallas mínimas. Esa norma (DOF 12/02/2016) establece **el procedimiento para determinar épocas y zonas de veda**, no tallas. Las tallas no se pueden atribuir a ella; no se muestran hasta localizar la fuente real.
2. **Variables nuevas listas para usar sin pedir nada más:** presión, visibilidad, probabilidad de lluvia, CAPE, punto de rocío, amanecer y atardecer (Open-Meteo Forecast) y nivel del mar con marea del modelo. Con ellas la ficha de clima costero y la de condiciones se acercan al Figma con datos reales.
3. **Clorofila numérica:** viable solo si Luca agrega un script (`analisis/`) que consulte ERDDAP y guarde un JSON por puerto con fecha; el navegador no puede llamar a ERDDAP ni a NHC directamente (sin CORS).
4. **Licencias:** Open-Meteo, CC BY 4.0 con atribución (ya registrada en `docs/RECURSOS.md`); ERDDAP/VIIRS bajo la política de datos de NASA, registrar en RECURSOS al integrarse.

### Qué falta decidir o verificar (queda pendiente)

- Fuente y cita para la fase lunar.
- Predicción oficial de mareas (contactar al Servicio Mareográfico Nacional o dejar solo el modelo rotulado).
- Anomalía de SST y frentes: elegir producto.
- Tallas mínimas: Carta Nacional Pesquera (DOF), por especie.
- Vedas: lectura manual del acuerdo vigente en DOF antes de mostrar fechas.
- ANP: consultar CONANP.
- Avisos oficiales: confirmar si SMN o Protección Civil BCS publican un feed.
