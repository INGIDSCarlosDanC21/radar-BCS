# Datos para las 4 fichas del mapa pesquero (respuesta a #190)

Consultado el **2026-11-15** con llamadas reales desde el equipo de Diego. Muestras guardadas en `web/tests/fixtures/pesca-sondeo-2026-11-15.json`.
Estado: **verificado** (respondió y se midió), **parcial** (existe pero con límite) o **no disponible / no verificado**. Lo que no está verificado no se muestra en la web: aparece como "Pendiente".

## Resumen por ficha

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

## Hallazgos que cambian la web

1. **Error en el Figma:** las tarjetas de "Fichas de Captura Legal" citan "NOM-009-SAG/PESC" para las tallas mínimas. Esa norma (DOF 12/02/2016) establece **el procedimiento para determinar épocas y zonas de veda**, no tallas. Las tallas no se pueden atribuir a ella; no se muestran hasta localizar la fuente real.
2. **Variables nuevas listas para usar sin pedir nada más:** presión, visibilidad, probabilidad de lluvia, CAPE, punto de rocío, amanecer y atardecer (Open-Meteo Forecast) y nivel del mar con marea del modelo. Con ellas la ficha de clima costero y la de condiciones se acercan al Figma con datos reales.
3. **Clorofila numérica:** viable solo si Luca agrega un script (`analisis/`) que consulte ERDDAP y guarde un JSON por puerto con fecha; el navegador no puede llamar a ERDDAP ni a NHC directamente (sin CORS).
4. **Licencias:** Open-Meteo, CC BY 4.0 con atribución (ya registrada en `docs/RECURSOS.md`); ERDDAP/VIIRS bajo la política de datos de NASA, registrar en RECURSOS al integrarse.

## Qué falta decidir o verificar (queda pendiente)

- Fuente y cita para la fase lunar.
- Predicción oficial de mareas (contactar al Servicio Mareográfico Nacional o dejar solo el modelo rotulado).
- Anomalía de SST y frentes: elegir producto.
- Tallas mínimas: Carta Nacional Pesquera (DOF), por especie.
- Vedas: lectura manual del acuerdo vigente en DOF antes de mostrar fechas.
- ANP: consultar CONANP.
- Avisos oficiales: confirmar si SMN o Protección Civil BCS publican un feed.
