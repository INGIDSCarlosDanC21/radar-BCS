/* Pestaña Pesca (docs/PLAN-PESCA-AVISOS.md). ES5, sin build.
   Mapa de iconos de 8 puertos con oleaje, viento y temperatura del mar de un MODELO (Open-Meteo Marine; no son boyas),
   control de hora con "Iniciar simulación" y 4 mosaicos cortos. Sin gráficas, sin tablas, sin textos largos.
   El "semáforo" del Figma pasa a "Estado del mar (modelo)": verde, amarillo o rojo con la escala de Douglas y de Beaufort
   (web/js/reglas-mar.js). No es una bandera oficial y así se rotula. La capa de clorofila es de NASA GIBS (VIIRS NOAA-20). */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var RB = (typeof window !== 'undefined' && window.RB) || (typeof require !== 'undefined' ? require('./reglas.js') : null);
  var V = (typeof window !== 'undefined' && window.RBVivo) || (typeof require !== 'undefined' ? require('./datos-vivos.js') : null);
  var M = (typeof window !== 'undefined' && window.RBMar) || (typeof require !== 'undefined' ? require('./reglas-mar.js') : null);
  var MI = (typeof window !== 'undefined' && window.RBMapaIconos) || (typeof require !== 'undefined' ? require('./mapa-iconos.js') : null);
  var t = T.t;
  var PASO_MS = 900;
  var URL_CLO = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_Chlorophyll_a/default/';
  var URL_VEDAS = 'https://www.gob.mx/conapesca';
  var URL_CAPITANIA = 'https://www.gob.mx/semar';
  // Escala de la capa de clorofila (https://gibs.earthdata.nasa.gov/colormaps/v1.3/VIIRS_Chlorophyll.xml, 0.01 a 20 mg/m³, logarítmica).
  var LEY_CLO = ['147,0,108', '66,0,189', '0,32,255', '0,186,255', '0,255,135', '96,255,0', '255,219,0', '255,107,0', '250,0,0'];

  var TX = {
    es: {
      'pes.kicker': 'Ahora · modelo marino Open-Meteo (no son boyas)', 'pes.act': 'Modelo marino · hora de La Paz',
      'pes.sub': 'Oleaje, viento y temperatura del mar en los puertos de BCS.',
      'pes.puerto': 'Puerto', 'pes.var': 'Dato en el mapa', 'pes.v.ola': 'Oleaje', 'pes.v.viento': 'Viento', 'pes.v.sst': 'Temp. del mar',
      'pes.mapaReg': 'Mapa de puertos de Baja California Sur con iconos de oleaje, viento o temperatura del mar',
      'pes.diaAnt': 'Día anterior', 'pes.diaSig': 'Día siguiente', 'pes.ayer': 'Ayer', 'pes.hoy': 'Hoy', 'pes.manana': 'Mañana', 'pes.hora': 'Hora del día',
      'pes.sim': 'Iniciar simulación', 'pes.simPausa': 'Pausar simulación',
      'pes.diag': 'Diagnóstico del mar', 'pes.zona': 'Zona: {z}',
      'pes.m.seg': 'Estado del mar', 'pes.m.oc': 'Condiciones del mar', 'pes.m.cl': 'Viento costero', 'pes.m.clo': 'Clorofila',
      'pes.segNota': 'Estimación del modelo, no es aviso oficial',
      'pes.dOla': 'Oleaje {h} m · viento {v} kt', 'pes.dMar': 'Del {d} · mar {s} °C · corriente {c} km/h',
      'pes.vViento': '{v} kt del {d}', 'pes.dViento': 'Rachas {r} kt · Beaufort {b}', 'pes.vOla': '{h} m · {p} s',
      'pes.cloVer': 'Ver en el mapa', 'pes.cloQuitar': 'Quitar del mapa', 'pes.cloFecha': 'Satélite NASA VIIRS NOAA-20 · {f}',
      'pes.cloTit': 'Clorofila (mg/m³, escala logarítmica)', 'pes.cloError': 'No se pudo cargar la capa de clorofila.',
      'pes.vedas': 'Vedas (CONAPESCA)',
      'pes.ley.verde': 'Verde', 'pes.ley.amarillo': 'Amarillo', 'pes.ley.rojo': 'Rojo',
      'pes.ley.ola.verde': 'menos de 1.25 m', 'pes.ley.ola.amarillo': '1.25 a 2.5 m', 'pes.ley.ola.rojo': '2.5 m o más',
      'pes.ley.viento.verde': 'menos de 22 kt', 'pes.ley.viento.amarillo': '22 a 33 kt', 'pes.ley.viento.rojo': '34 kt o más',
      'pes.nota': 'Estimación de un modelo, no es un aviso oficial. Consulta a la Capitanía de Puerto (SEMAR). Datos del mar: Open-Meteo.com (CC BY 4.0).',
      'pes.cargando': 'Cargando el modelo marino…',
      'pes.error': 'No se pudo cargar el modelo marino (¿sin conexión?). El resto de la web no cambia.',
      'pes.f.pilar': 'Pilar {n} · {t}', 'pes.f.mareograma': 'Mareograma (modelo)', 'pes.f.faseLunar': 'Fase lunar', 'pes.f.desglose': 'Desglose por componentes', 'pes.f.componentes': 'Mar de fondo y mar de viento',
      'pes.f.cinematica': 'Cinemática', 'pes.f.vientoRachas': 'Viento y rachas', 'pes.f.barometria': 'Barometría', 'pes.f.conveccion': 'Convección', 'pes.f.optica': 'Óptica náutica', 'pes.f.vedasPil': 'Calendario de vedas',
      'pes.f.oficiales': 'Avisos oficiales', 'pes.f.avisosT': 'Consulta oficial', 'pes.f.avisosTx': 'Solo enlaces: no hay un canal abierto de avisos que podamos leer aquí.',
      'pes.f.ahora': 'Ahora', 'pes.f.maximo': 'Máximo', 'pes.f.minimo': 'Mínimo', 'pes.f.proximas': 'Próximas fases', 'pes.f.lunaNota': 'Hora de La Paz. Fuente: U.S. Naval Observatory.',
      'pes.f.mareaAlt': 'Nivel del mar del día según el modelo: mínimo {a} m a las {ha} y máximo {b} m a las {hb}',
      'pes.f.lunaNueva': 'Luna nueva', 'pes.f.lunaCrec': 'Cuarto creciente', 'pes.f.lunaLlena': 'Luna llena', 'pes.f.lunaMeng': 'Cuarto menguante',
      'pes.f.ver': 'Ver detalle', 'pes.f.cerrar': 'Cerrar', 'pes.f.dictT': 'LECTURA DEL MODELO (NO OFICIAL)', 'pes.f.fuentes': 'Fuentes',
      'pes.f.estadoL': 'Estado (modelo)', 'pes.f.oleaje': 'Oleaje', 'pes.f.vientoT': 'Viento', 'pes.f.altura': 'Altura', 'pes.f.periodo': 'Periodo', 'pes.f.dir': 'Dirección',
      'pes.f.nivel': 'Nivel', 'pes.f.sostenido': 'Sostenido', 'pes.f.rachas': 'Rachas', 'pes.f.escala': 'Escala', 'pes.f.umbrales': 'Umbrales usados',
      'pes.f.fondo': 'Swell', 'pes.f.marFondo': 'Mar de fondo', 'pes.f.mar': 'Mar', 'pes.f.temp': 'Temperatura', 'pes.f.corr': 'Corriente', 'pes.f.corrT': 'Corriente del mar', 'pes.f.vel': 'Velocidad',
      'pes.f.subOc': 'Oleaje, mar de fondo, temperatura y corriente', 'pes.f.subCl': 'Viento sostenido y rachas', 'pes.f.subClo': 'Capa satelital y vedas', 'pes.f.chipClo': 'NASA VIIRS',
      'pes.f.dictClo': 'La clorofila indica dónde hay más fitoplancton, base de la cadena alimentaria. Es una imagen de satélite: no dice dónde hay peces ni autoriza la pesca.',
      'pes.f.capa': 'Capa de clorofila', 'pes.f.vedasT': 'El calendario de vedas lo publica CONAPESCA; aquí solo va el enlace.',
      'pes.f.desc.seg': 'Verde, amarillo o rojo según oleaje y viento del modelo.', 'pes.f.desc.oc': 'Cifras del modelo marino para el puerto y la hora elegidos.',
      'pes.f.desc.cl': 'Viento del modelo en la costa para la hora elegida.', 'pes.f.desc.clo': 'Capa de clorofila de NASA y enlace a las vedas.',
      'pes.f.olaV': 'Mar de viento', 'pes.f.olaVT': 'Oleaje de viento', 'pes.f.nivelMar': 'Modelo', 'pes.f.nivelMarT': 'Nivel del mar', 'pes.f.nivelM': 'Sobre el nivel medio',
      'pes.f.nivelNota': 'Incluye marea, según un modelo global (Open-Meteo). No es la tabla oficial de mareas.',
      'pes.f.pres': 'Presión', 'pes.f.presT': 'Presión atmosférica', 'pes.f.actual': 'Actual', 'pes.f.tend': 'Cambio en 3 h', 'pes.f.lluv': 'Lluvia', 'pes.f.lluvT': 'Lluvia y tormenta',
      'pes.f.prob': 'Probabilidad', 'pes.f.vis': 'Visibilidad', 'pes.f.visT': 'Visibilidad y rocío', 'pes.f.visK': 'Visibilidad', 'pes.f.rocio': 'Punto de rocío',
      'pes.f.sol': 'Sol', 'pes.f.solT': 'Amanecer y atardecer', 'pes.f.amanece': 'Amanece', 'pes.f.anochece': 'Atardece',
      'pes.sinDato': 'sin dato', 'pes.sinDatoPuerto': 'Sin dato para esta hora',
      'pes.r0': 'norte', 'pes.r1': 'noreste', 'pes.r2': 'este', 'pes.r3': 'sureste', 'pes.r4': 'sur', 'pes.r5': 'suroeste', 'pes.r6': 'oeste', 'pes.r7': 'noroeste',
      'pes.pinOla': '{n}: oleaje {v}, {e}', 'pes.pinViento': '{n}: viento {v}, {e}', 'pes.pinSst': '{n}: temperatura del mar {v}',
      'pes.busca': 'Buscar puerto y fecha', 'pes.bLugar': 'Puerto o ciudad', 'pes.bPh': 'Ej.: Loreto', 'pes.bFecha': 'Fecha', 'pes.bVer': 'Ver', 'pes.bHoy': 'Hoy',
      'pes.bVacio': 'No hay un puerto con ese nombre. Prueba con La Paz, Loreto o Bahía Tortugas.',
      'pes.bVarios': 'Hay varios puertos con ese nombre ({n}). Escribe el nombre completo.',
      'pes.bFuera': 'Elige una fecha entre el {a} y el {b}.',
      'pes.bAyuda': 'Del {a} al {b}. Días pasados: lo que calculó el modelo; días que vienen: pronóstico (oleaje y temperatura del mar, solo unos 8 días).', 'pes.kickerDia': 'Fecha elegida · modelo marino Open-Meteo (no son boyas)',
      'pes.bOk': 'Mostrando {n} en el mapa.',
      'pes.actDia': 'Modelo marino · {f}', 'pes.cargaDia': 'Cargando {n} del {f}…', 'pes.estadoDia': '{n} · {f} · modelo Open-Meteo{p}.',
      'pes.pron': ' (pronóstico, puede cambiar)', 'pes.pasado': ' (lo que calculó el modelo, no son boyas)',
      'pes.errorDia': 'No se pudieron cargar los datos de esa fecha (¿sin conexión?).',
      'pes.limite': 'Open-Meteo llegó a su límite de consultas por hoy desde esta red. Intenta más tarde o desde otra conexión.',
      'pes.guardado429': 'Open-Meteo llegó a su límite de consultas por hoy desde esta red: se muestra el dato guardado a las {h}.',
      'pes.guardado': 'Open-Meteo no responde ahora: se muestra el dato guardado a las {h}.',
      'pes.sinMarDia': 'Sin dato del modelo marino para esa fecha (oleaje, temperatura del mar, corriente y nivel).',
      'pes.sinMarFut': ' El modelo marino solo pronostica unos 8 días.',
      'pes.sinPronDia': 'Sin dato del pronóstico para esa fecha (viento, presión, lluvia y visibilidad).',
      'pes.puntoDia': 'En una fecha elegida, el viento, la presión, la lluvia y la visibilidad son del mismo punto de mar del puerto.',
      'pes.pinSinDia': '{n}: sin consultar para esta fecha. Tócalo para ver su dato.',
      'pes.cloSinDia': 'No hay imagen de clorofila para el {f}: el satélite solo tiene días pasados.',
      'pes.parcial429': 'Open-Meteo llegó a su límite de consultas desde esta red: no se pudo pedir {q}.', 'pes.parcial': 'No se pudo pedir {q} (¿sin conexión?).', 'pes.qPron': 'el pronóstico', 'pes.qMar': 'el modelo marino'
    },
    en: {
      'pes.kicker': 'Now · Open-Meteo marine model (not buoys)', 'pes.act': 'Marine model · La Paz time',
      'pes.sub': 'Waves, wind and sea temperature at the ports of BCS.',
      'pes.puerto': 'Port', 'pes.var': 'Data on the map', 'pes.v.ola': 'Waves', 'pes.v.viento': 'Wind', 'pes.v.sst': 'Sea temp.',
      'pes.mapaReg': 'Map of ports of Baja California Sur with icons for waves, wind or sea temperature',
      'pes.diaAnt': 'Previous day', 'pes.diaSig': 'Next day', 'pes.ayer': 'Yesterday', 'pes.hoy': 'Today', 'pes.manana': 'Tomorrow', 'pes.hora': 'Hour of the day',
      'pes.sim': 'Start simulation', 'pes.simPausa': 'Pause simulation',
      'pes.diag': 'Sea diagnosis', 'pes.zona': 'Area: {z}',
      'pes.m.seg': 'Sea state', 'pes.m.oc': 'Sea conditions', 'pes.m.cl': 'Coastal wind', 'pes.m.clo': 'Chlorophyll',
      'pes.segNota': 'Model estimate, not an official warning',
      'pes.dOla': 'Waves {h} m · wind {v} kt', 'pes.dMar': 'From the {d} · sea {s} °C · current {c} km/h',
      'pes.vViento': '{v} kt from the {d}', 'pes.dViento': 'Gusts {r} kt · Beaufort {b}', 'pes.vOla': '{h} m · {p} s',
      'pes.cloVer': 'Show on the map', 'pes.cloQuitar': 'Remove from the map', 'pes.cloFecha': 'NASA VIIRS NOAA-20 satellite · {f}',
      'pes.cloTit': 'Chlorophyll (mg/m³, logarithmic scale)', 'pes.cloError': 'The chlorophyll layer could not be loaded.',
      'pes.vedas': 'Fishing closures (CONAPESCA)',
      'pes.ley.verde': 'Green', 'pes.ley.amarillo': 'Yellow', 'pes.ley.rojo': 'Red',
      'pes.ley.ola.verde': 'under 1.25 m', 'pes.ley.ola.amarillo': '1.25 to 2.5 m', 'pes.ley.ola.rojo': '2.5 m or more',
      'pes.ley.viento.verde': 'under 22 kt', 'pes.ley.viento.amarillo': '22 to 33 kt', 'pes.ley.viento.rojo': '34 kt or more',
      'pes.nota': 'Estimate from a model, not an official warning. Check with the Port Captaincy (SEMAR). Sea data: Open-Meteo.com (CC BY 4.0).',
      'pes.cargando': 'Loading the marine model…',
      'pes.error': 'The marine model could not be loaded (offline?). The rest of the site does not change.',
      'pes.f.pilar': 'Pillar {n} · {t}', 'pes.f.mareograma': 'Tide chart (model)', 'pes.f.faseLunar': 'Moon phase', 'pes.f.desglose': 'Breakdown by component', 'pes.f.componentes': 'Swell and wind sea',
      'pes.f.cinematica': 'Kinematics', 'pes.f.vientoRachas': 'Wind and gusts', 'pes.f.barometria': 'Barometry', 'pes.f.conveccion': 'Convection', 'pes.f.optica': 'Nautical optics', 'pes.f.vedasPil': 'Closure calendar',
      'pes.f.oficiales': 'Official warnings', 'pes.f.avisosT': 'Official sources', 'pes.f.avisosTx': 'Links only: there is no open warning feed we can read here.',
      'pes.f.ahora': 'Now', 'pes.f.maximo': 'High', 'pes.f.minimo': 'Low', 'pes.f.proximas': 'Next phases', 'pes.f.lunaNota': 'La Paz time. Source: U.S. Naval Observatory.',
      'pes.f.mareaAlt': 'Sea level for the day from the model: low {a} m at {ha} and high {b} m at {hb}',
      'pes.f.lunaNueva': 'New moon', 'pes.f.lunaCrec': 'First quarter', 'pes.f.lunaLlena': 'Full moon', 'pes.f.lunaMeng': 'Last quarter',
      'pes.f.ver': 'See details', 'pes.f.cerrar': 'Close', 'pes.f.dictT': 'MODEL READING (NOT OFFICIAL)', 'pes.f.fuentes': 'Sources',
      'pes.f.estadoL': 'State (model)', 'pes.f.oleaje': 'Waves', 'pes.f.vientoT': 'Wind', 'pes.f.altura': 'Height', 'pes.f.periodo': 'Period', 'pes.f.dir': 'Direction',
      'pes.f.nivel': 'Level', 'pes.f.sostenido': 'Sustained', 'pes.f.rachas': 'Gusts', 'pes.f.escala': 'Scale', 'pes.f.umbrales': 'Thresholds used',
      'pes.f.fondo': 'Swell', 'pes.f.marFondo': 'Swell', 'pes.f.mar': 'Sea', 'pes.f.temp': 'Temperature', 'pes.f.corr': 'Current', 'pes.f.corrT': 'Sea current', 'pes.f.vel': 'Speed',
      'pes.f.subOc': 'Waves, swell, temperature and current', 'pes.f.subCl': 'Sustained wind and gusts', 'pes.f.subClo': 'Satellite layer and closures', 'pes.f.chipClo': 'NASA VIIRS',
      'pes.f.dictClo': 'Chlorophyll shows where there is more phytoplankton, the base of the food chain. It is a satellite image: it does not say where fish are or authorize fishing.',
      'pes.f.capa': 'Chlorophyll layer', 'pes.f.vedasT': 'The closure calendar is published by CONAPESCA; only the link is shown here.',
      'pes.f.desc.seg': 'Green, yellow or red from the model waves and wind.', 'pes.f.desc.oc': 'Marine model figures for the chosen port and hour.',
      'pes.f.desc.cl': 'Model coastal wind for the chosen hour.', 'pes.f.desc.clo': 'NASA chlorophyll layer and a link to the closures.',
      'pes.f.olaV': 'Wind sea', 'pes.f.olaVT': 'Wind waves', 'pes.f.nivelMar': 'Model', 'pes.f.nivelMarT': 'Sea level', 'pes.f.nivelM': 'Above mean sea level',
      'pes.f.nivelNota': 'Includes tide, from a global model (Open-Meteo). It is not the official tide table.',
      'pes.f.pres': 'Pressure', 'pes.f.presT': 'Atmospheric pressure', 'pes.f.actual': 'Now', 'pes.f.tend': 'Change in 3 h', 'pes.f.lluv': 'Rain', 'pes.f.lluvT': 'Rain and storms',
      'pes.f.prob': 'Probability', 'pes.f.vis': 'Visibility', 'pes.f.visT': 'Visibility and dew point', 'pes.f.visK': 'Visibility', 'pes.f.rocio': 'Dew point',
      'pes.f.sol': 'Sun', 'pes.f.solT': 'Sunrise and sunset', 'pes.f.amanece': 'Sunrise', 'pes.f.anochece': 'Sunset',
      'pes.sinDato': 'no data', 'pes.sinDatoPuerto': 'No data for this hour',
      'pes.r0': 'north', 'pes.r1': 'northeast', 'pes.r2': 'east', 'pes.r3': 'southeast', 'pes.r4': 'south', 'pes.r5': 'southwest', 'pes.r6': 'west', 'pes.r7': 'northwest',
      'pes.pinOla': '{n}: waves {v}, {e}', 'pes.pinViento': '{n}: wind {v}, {e}', 'pes.pinSst': '{n}: sea temperature {v}',
      'pes.busca': 'Search by port and date', 'pes.bLugar': 'Port or town', 'pes.bPh': 'e.g. Loreto', 'pes.bFecha': 'Date', 'pes.bVer': 'Show', 'pes.bHoy': 'Today',
      'pes.bVacio': 'No port has that name. Try La Paz, Loreto or Bahía Tortugas.',
      'pes.bVarios': 'Several ports match that name ({n}). Type the full name.',
      'pes.bFuera': 'Pick a date between {a} and {b}.',
      'pes.bAyuda': 'From {a} to {b}. Past days: what the model calculated; coming days: forecast (waves and sea temperature, only about 8 days).', 'pes.kickerDia': 'Chosen date · Open-Meteo marine model (not buoys)',
      'pes.bOk': 'Showing {n} on the map.',
      'pes.actDia': 'Marine model · {f}', 'pes.cargaDia': 'Loading {n} for {f}…', 'pes.estadoDia': '{n} · {f} · Open-Meteo model{p}.',
      'pes.pron': ' (forecast, it may change)', 'pes.pasado': ' (what the model calculated, not buoys)',
      'pes.errorDia': 'The data for that date could not be loaded (offline?).',
      'pes.limite': 'Open-Meteo reached its request limit for today from this network. Try again later or from another connection.',
      'pes.guardado429': 'Open-Meteo reached its request limit for today from this network: showing the data saved at {h}.',
      'pes.guardado': 'Open-Meteo is not responding: showing the data saved at {h}.',
      'pes.sinMarDia': 'No marine model data for that date (waves, sea temperature, current and level).',
      'pes.sinMarFut': ' The marine model only forecasts about 8 days.',
      'pes.sinPronDia': 'No forecast data for that date (wind, pressure, rain and visibility).',
      'pes.puntoDia': 'On a chosen date, wind, pressure, rain and visibility come from the same sea point of the port.',
      'pes.pinSinDia': '{n}: not checked for this date. Tap it to see its data.',
      'pes.cloSinDia': 'There is no chlorophyll image for {f}: the satellite only has past days.',
      'pes.parcial429': 'Open-Meteo reached its request limit from this network: {q} could not be requested.', 'pes.parcial': 'Could not request {q} (offline?).', 'pes.qPron': 'the forecast', 'pes.qMar': 'the marine model'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function en(serie, i) { return serie && serie[i] != null ? serie[i] : null; }
  function n1(v) { return v == null ? t('pes.sinDato') : RB.num(v, 1); }
  function n0(v) { return v == null ? t('pes.sinDato') : RB.num(v, 0); }
  function rumbo(g) { return g == null ? '' : t('pes.r' + (Math.round(((g % 360) + 360) % 360 / 45) % 8)); }
  function tono(nivel) { return nivel == null ? 'neutro' : nivel >= 2 ? 'rojo' : nivel === 1 ? 'amarillo' : 'verde'; }

  /* Estado de un puerto en la hora idx (todo sale del modelo; lo que falta queda en null). */
  function estadoPuerto(p, idx) {
    var ola = en(p.s.ola, idx), vi = en(p.s.viento, idx);
    return { ola: ola, per: en(p.s.per, idx), dir: en(p.s.dir, idx), sst: en(p.s.sst, idx), corr: en(p.s.corr, idx),
      viento: vi, rachas: en(p.s.rachas, idx), vdir: en(p.s.vdir, idx), estado: M.estadoMar(ola, vi), swell: en(p.s.swell, idx), cdir: en(p.s.cdir, idx),
      olaV: en(p.s.olaV, idx), perV: en(p.s.perV, idx), dirV: en(p.s.dirV, idx), perS: en(p.s.perS, idx), dirS: en(p.s.dirS, idx), nivel: en(p.s.nivel, idx), pres: en(p.s.pres, idx), presAntes: idx >= 3 ? en(p.s.pres, idx - 3) : null,
      vis: en(p.s.vis, idx), pll: en(p.s.pll, idx), cape: en(p.s.cape, idx), rocio: en(p.s.rocio, idx) };
  }
  /* Pines del mapa para la variable v y la hora idx. */
  function pines(datos, idx, v, activo) {
    return datos.puertos.map(function (p) {
      var e = estadoPuerto(p, idx), valor, icono, nivel, etq;
      if (p.sinDia) {   // fecha elegida: este puerto no se ha consultado (no se piden los 19)
        return { id: p.id, menor: !!p.menor, lat: p.mar[0], lon: p.mar[1], icono: v === 'viento' ? 'air' : v === 'sst' ? 'thermostat' : 'waves', valor: '—', tono: 'neutro',
          etiqueta: t('pes.pinSinDia', { n: p.nombre }), activo: p.id === activo };
      }
      if (v === 'viento') {
        valor = e.viento == null ? '—' : n0(e.viento) + ' kt'; icono = 'air'; nivel = M.nivelViento(e.viento);
        etq = t('pes.pinViento', { n: p.nombre, v: valor, e: M.textoViento(e.viento) });
      } else if (v === 'sst') {
        valor = e.sst == null ? '—' : n1(e.sst) + ' °C'; icono = 'thermostat'; nivel = null;
        etq = t('pes.pinSst', { n: p.nombre, v: valor });
      } else {
        valor = e.ola == null ? '—' : n1(e.ola) + ' m'; icono = 'waves'; nivel = M.nivelOla(e.ola);
        etq = t('pes.pinOla', { n: p.nombre, v: valor, e: M.textoOla(e.ola) });
      }
      return { id: p.id, menor: !!p.menor, lat: p.mar[0], lon: p.mar[1], icono: icono, valor: valor, tono: tono(nivel), etiqueta: etq, activo: p.id === activo };
    });
  }
  /* Buscador de puertos: solo compara con los puertos ya cargados (RB.coincidencias, compartido con Clima); cero peticiones.
     Devuelve {i: índice del puerto o -1, motivo: 'ok' | 'vacio' (sin texto) | 'varios' | 'nada', varios: nombres que coinciden}. */
  function buscarPuerto(puertos, texto) {
    if (!RB.sinAcentos(texto)) return { i: -1, motivo: 'vacio', varios: [] };
    var c = RB.coincidencias(puertos, texto);
    if (c.exacto >= 0) return { i: c.exacto, motivo: 'ok', varios: [] };
    if (c.parciales.length === 1) return { i: c.parciales[0], motivo: 'ok', varios: [] };
    if (c.parciales.length > 1) return { i: -1, motivo: 'varios', varios: c.parciales.map(function (k) { return puertos[k].nombre; }) };
    return { i: -1, motivo: 'nada', varios: [] };
  }
  /* Formulario del buscador: el MISMO que el de Clima (cm-busca, cm-campo, cm-acc; 44 px y letra de 16 px), con puerto/ciudad
     en texto libre (sin lista de sugerencias) y fecha (campo compartido RB.campoFecha, de hoy − 92 a hoy + 15). */
  function buscadorHtml(r) {
    r = r || RB.rangoFechas();
    return '<form class="cm-busca pe-busca" id="pe-busca" role="search" aria-label="' + esc(t('pes.busca')) + '" novalidate>' +
      '<div class="cm-campo cm-campo-l"><label for="pe-q">' + esc(t('pes.bLugar')) + '</label><input id="pe-q" type="search" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="search" placeholder="' + esc(t('pes.bPh')) + '" aria-describedby="pe-q-msg"></div>' +
      RB.campoFecha('pe-f', t('pes.bFecha'), r) +
      '<div class="cm-acc"><button type="submit" class="cm-btn">' + esc(t('pes.bVer')) + '</button><button type="button" class="cm-btn cm-btn-2" data-hoy>' + esc(t('pes.bHoy')) + '</button></div>' +
      '<p class="cm-busca-msg" id="pe-q-msg" role="status" aria-live="polite" hidden></p>' +
      '<p class="cm-busca-ayuda">' + esc(t('pes.bAyuda', { a: RB.fechaTexto(r.min), b: RB.fechaTexto(r.max) })) + '</p></form>';
  }
  /* Valida lo escrito antes de pedir nada: {ok, puerto (id o null = el de ahora), fecha (null = hoy), error}. Cero peticiones. */
  function validar(puertos, texto, fecha, r) {
    r = r || RB.rangoFechas();
    var b = buscarPuerto(puertos, texto), f = fecha || r.hoy;
    if (b.motivo === 'nada') return { ok: false, error: t('pes.bVacio') };
    if (b.motivo === 'varios') return { ok: false, error: t('pes.bVarios', { n: b.varios.join(', ') }) };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || f < r.min || f > r.max) return { ok: false, error: t('pes.bFuera', { a: RB.fechaTexto(r.min), b: RB.fechaTexto(r.max) }) };
    return { ok: true, puerto: b.i >= 0 ? puertos[b.i].id : null, fecha: f === r.hoy ? null : f };
  }
  /* Caja que contiene todos los puertos: [[lat mín, lon mín], [lat máx, lon máx]]. */
  function limitesPuertos(datos) {
    var la = datos.puertos.map(function (p) { return p.mar[0]; }), lo = datos.puertos.map(function (p) { return p.mar[1]; });
    return [[Math.min.apply(null, la), Math.min.apply(null, lo)], [Math.max.apply(null, la), Math.max.apply(null, lo)]];
  }
  /* ---------- Fichas expandibles (mismo formato y clases que las del Mapa Agrícola: .ag-*; 4 pilares como el Figma) ----------
     Solo se muestra lo verificado (docs/investigacion/datos-pesca.md): lo que no tiene fuente abierta verificada no aparece. */
  var TONO_F = { seg: 'ambar', oc: 'cian', cl: 'pizarra', clo: 'verde' };
  var ICO_F = { seg: 'pesca-semaforo-de-seguridad', oc: 'pesca-condiciones-oceanograficas', cl: 'pesca-clima-y-atmosfera-costera', clo: 'pesca-potencial-y-actividad-pesquera' };
  var ORDEN_F = ['seg', 'oc', 'cl', 'clo'];
  var URL_SMN = 'https://smn.conagua.gob.mx/es/', URL_NHC = 'https://www.nhc.noaa.gov/';
  var SVG_X = '<svg class="ag-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var SVG_FLE = '<svg class="ag-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function fila(k, v) { return '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>'; }
  function tarjeta(chip, titulo, filas, texto, extra) {
    return '<article class="ag-tj"><p class="ag-tj-chip">' + esc(chip) + '</p><h4 class="ag-tj-tit">' + esc(titulo) + '</h4>' +
      (extra || '') + (texto ? '<p class="ag-tj-txt">' + esc(texto) + '</p>' : '') + (filas ? '<dl class="ag-tj-filas">' + filas + '</dl>' : '') + '</article>';
  }
  function pilar(n, clave) { return t('pes.f.pilar', { n: n, t: t(clave) }); }
  function kt(v) { return v == null ? t('pes.sinDato') : n0(v) + ' kt'; }
  function mt(v) { return v == null ? t('pes.sinDato') : n1(v) + ' m'; }
  function sd(v, f) { return v == null ? t('pes.sinDato') : f(v); }
  function hhmm(x) { return x ? String(x).slice(11, 16) : t('pes.sinDato'); }

  /* Mareograma del día: nivel del mar por hora (modelo global de Open-Meteo, no es la tabla oficial de mareas). */
  function mareograma(p, idx) {
    var d0 = idx - (idx % 24), v = [], k;
    for (k = 0; k < 24; k++) v.push(en(p.s.nivel, d0 + k));
    var ok = v.filter(function (x) { return x != null; });
    if (ok.length < 12) return null;
    var mn = Math.min.apply(null, ok), mx = Math.max.apply(null, ok), im = v.indexOf(mn), iM = v.indexOf(mx), rg = (mx - mn) || 1, pts = [];
    function y(x) { return (70 - ((x - mn) / rg) * 60).toFixed(1); }
    v.forEach(function (x, i) { if (x != null) pts.push((i * 10 + 5) + ',' + y(x)); });
    var cur = idx % 24, hh = function (i) { return (i < 10 ? '0' : '') + i + ':00'; };
    var svg = '<svg class="pe-curva" viewBox="0 0 240 80" role="img" aria-label="' + esc(t('pes.f.mareaAlt', { a: n1(mn), ha: hh(im), b: n1(mx), hb: hh(iM) })) + '" focusable="false">' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      (v[cur] != null ? '<line x1="' + (cur * 10 + 5) + '" x2="' + (cur * 10 + 5) + '" y1="4" y2="76" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/><circle cx="' + (cur * 10 + 5) + '" cy="' + y(v[cur]) + '" r="4.5" fill="currentColor"/>' : '') + '</svg>';
    return { svg: svg, max: mx, min: mn, hmax: hh(iM), hmin: hh(im), ahora: v[cur] };
  }

  /* Fase lunar: U.S. Naval Observatory (API pública, CORS abierto). Las horas vienen en UT: se pasan a la hora de La Paz. */
  var FASES = { 'New Moon': 'pes.f.lunaNueva', 'First Quarter': 'pes.f.lunaCrec', 'Full Moon': 'pes.f.lunaLlena', 'Last Quarter': 'pes.f.lunaMeng' };
  function urlLuna(fecha) {
    var f = String(fecha).split('-');
    return 'https://aa.usno.navy.mil/api/moon/phases/date?date=' + f[0] + '-' + (+f[1]) + '-' + (+f[2]) + '&nump=4';
  }
  function fasesLunares(json) {
    var a = json && Object.prototype.toString.call(json.phasedata) === '[object Array]' ? json.phasedata : [], res = [];
    a.forEach(function (x) {
      var hm = String(x && x.time || '').split(':'), ms = Date.UTC(+x.year, +x.month - 1, +x.day, +hm[0], +hm[1]);
      if (FASES[x && x.phase] && isFinite(ms)) res.push({ fase: FASES[x.phase], ms: ms });
    });
    return res;
  }
  function cuando(ms) {
    try { return new Date(ms).toLocaleString(T.locale(), { timeZone: 'America/Mazatlan', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (e) { return ''; }
  }
  function pedirLuna(fecha, f) {
    f = f || (typeof fetch !== 'undefined' ? fetch.bind(typeof window !== 'undefined' ? window : undefined) : null);
    if (!f) return Promise.reject(new Error('sin fetch'));
    return f(urlLuna(fecha)).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(fasesLunares);
  }

  /* Contenido de cada ficha: chip, subtítulo, valor destacado, lectura y 4 pilares. */
  function contenidoFicha(id, p, idx, clo, cloFecha, hora, luna) {
    var e = estadoPuerto(p, idx), sem = e.estado || 'sin', c = { chip: '', sub: '', ver: null, dict: '', tjs: [], fuentes: [] };
    var bf = M.beaufort(e.viento);
    if (id === 'seg') {
      c.chip = t('mar.e.' + sem); c.sub = t('pes.segNota'); c.ver = [t('pes.f.estadoL'), t('mar.e.' + sem)];
      c.dict = e.estado ? t('mar.e.' + sem + 'T') : t('pes.sinDatoPuerto');
      c.tjs.push(tarjeta(pilar(1, 'pes.v.ola'), t('pes.f.oleaje'), fila(t('pes.f.altura'), mt(e.ola)) + fila(t('pes.f.nivel'), M.textoOla(e.ola) || t('pes.sinDato'))));
      c.tjs.push(tarjeta(pilar(2, 'pes.v.viento'), t('pes.f.vientoT'), fila(t('pes.f.sostenido'), kt(e.viento)) + fila('Beaufort', bf == null ? t('pes.sinDato') : String(bf)) + fila(t('pes.f.nivel'), M.textoViento(e.viento) || t('pes.sinDato'))));
      c.tjs.push(tarjeta(pilar(3, 'pes.f.escala'), t('pes.f.umbrales'), fila(t('pes.ley.verde'), t('pes.ley.ola.verde') + ' · ' + t('pes.ley.viento.verde')) + fila(t('pes.ley.amarillo'), t('pes.ley.ola.amarillo') + ' · ' + t('pes.ley.viento.amarillo')) + fila(t('pes.ley.rojo'), t('pes.ley.ola.rojo') + ' · ' + t('pes.ley.viento.rojo'))));
      c.tjs.push('<article class="ag-tj"><p class="ag-tj-chip">' + esc(pilar(4, 'pes.f.oficiales')) + '</p><h4 class="ag-tj-tit">' + esc(t('pes.f.avisosT')) + '</h4><p class="ag-tj-txt">' + esc(t('pes.f.avisosTx')) + '</p>' +
        '<ul class="pe-enl"><li><a href="' + URL_CAPITANIA + '" target="_blank" rel="noopener">SEMAR</a></li><li><a href="' + URL_SMN + '" target="_blank" rel="noopener">SMN</a></li><li><a href="' + URL_NHC + '" target="_blank" rel="noopener">NHC</a></li></ul></article>');
    } else if (id === 'oc') {
      var mg = mareograma(p, idx);
      c.chip = mt(e.ola) + (e.per != null ? ' · ' + n0(e.per) + ' s' : ''); c.sub = t('pes.f.subOc'); c.ver = [t('pes.v.ola'), mt(e.ola)];
      c.dict = e.ola == null && e.sst == null && e.corr == null ? t('pes.sinDatoPuerto') : t('pes.dMar', { d: rumbo(e.dir) || '—', s: n1(e.sst), c: n1(e.corr) });
      if (mg) c.tjs.push(tarjeta(pilar(1, 'pes.f.mareograma'), t('pes.f.nivelMarT'), fila(t('pes.f.ahora'), mt(mg.ahora)) + fila(t('pes.f.maximo'), n1(mg.max) + ' m · ' + mg.hmax) + fila(t('pes.f.minimo'), n1(mg.min) + ' m · ' + mg.hmin), t('pes.f.nivelNota'), mg.svg));
      if (luna && luna.length) {
        var fl = luna.slice(0, 3).map(function (x) { return fila(t(x.fase), cuando(x.ms)); }).join('');
        c.tjs.push(tarjeta(pilar(2, 'pes.f.faseLunar'), t('pes.f.proximas'), fl, t('pes.f.lunaNota')));
        c.fuentes.push('<li><a href="https://aa.usno.navy.mil/data/api" target="_blank" rel="noopener">U.S. Naval Observatory, Astronomical Applications API</a></li>');
      }
      c.tjs.push(tarjeta(pilar(3, 'pes.f.desglose'), t('pes.f.componentes'),
        fila(t('pes.f.fondo') + ' · ' + t('pes.f.altura'), mt(e.swell)) + fila(t('pes.f.fondo') + ' · ' + t('pes.f.periodo'), sd(e.perS, function (v) { return n0(v) + ' s'; })) + fila(t('pes.f.fondo') + ' · ' + t('pes.f.dir'), rumbo(e.dirS) || t('pes.sinDato')) +
        fila(t('pes.f.olaV') + ' · ' + t('pes.f.altura'), mt(e.olaV)) + fila(t('pes.f.olaV') + ' · ' + t('pes.f.periodo'), e.perV ? n1(e.perV) + ' s' : t('pes.sinDato')) + fila(t('pes.f.olaV') + ' · ' + t('pes.f.dir'), rumbo(e.dirV) || t('pes.sinDato'))));
      c.tjs.push(tarjeta(pilar(4, 'pes.f.corr'), t('pes.f.corrT'), fila(t('pes.f.vel'), sd(e.corr, function (v) { return n1(v) + ' km/h'; })) + fila(t('pes.f.dir'), rumbo(e.cdir) || t('pes.sinDato')) + fila(t('pes.f.temp'), sd(e.sst, function (v) { return n1(v) + ' °C'; }))));
    } else if (id === 'cl') {
      var dp = e.pres != null && e.presAntes != null ? e.pres - e.presAntes : null, sol = null, fh = String(hora || '').slice(0, 10);
      (p.sol || []).forEach(function (d) { if (d.fecha === fh) sol = d; });
      c.chip = kt(e.viento); c.sub = t('pes.f.subCl'); c.ver = [t('pes.v.viento'), kt(e.viento)];
      c.dict = t('pes.vViento', { v: n0(e.viento), d: rumbo(e.vdir) }) + '. ' + t('pes.dViento', { r: n0(e.rachas), b: bf == null ? '—' : bf }) + ' · ' + M.textoViento(e.viento);
      c.tjs.push(tarjeta(pilar(1, 'pes.f.cinematica'), t('pes.f.vientoRachas'), fila(t('pes.f.sostenido'), kt(e.viento)) + fila(t('pes.f.rachas'), kt(e.rachas)) + fila(t('pes.f.dir'), rumbo(e.vdir) || t('pes.sinDato')) + fila('Beaufort', bf == null ? t('pes.sinDato') : String(bf))));
      c.tjs.push(tarjeta(pilar(2, 'pes.f.barometria'), t('pes.f.presT'), fila(t('pes.f.actual'), sd(e.pres, function (v) { return n1(v) + ' hPa'; })) + fila(t('pes.f.tend'), dp == null ? t('pes.sinDato') : (dp > 0 ? '+' : '') + n1(dp) + ' hPa')));
      c.tjs.push(tarjeta(pilar(3, 'pes.f.conveccion'), t('pes.f.lluvT'), fila(t('pes.f.prob'), sd(e.pll, function (v) { return n0(v) + ' %'; })) + fila('CAPE', sd(e.cape, function (v) { return n0(v) + ' J/kg'; }))));
      c.tjs.push(tarjeta(pilar(4, 'pes.f.optica'), t('pes.f.visT'), fila(t('pes.f.visK'), sd(e.vis, function (v) { return n1(v / 1000) + ' km'; })) + fila(t('pes.f.rocio'), sd(e.rocio, function (v) { return n1(v) + ' °C'; })) +
        fila(t('pes.f.amanece'), sol ? hhmm(sol.amanecer) : t('pes.sinDato')) + fila(t('pes.f.anochece'), sol ? hhmm(sol.anochecer) : t('pes.sinDato'))));
    } else {
      c.chip = t('pes.f.chipClo'); c.sub = t('pes.f.subClo'); c.ver = [t('pes.v.sst'), sd(e.sst, function (v) { return n1(v) + ' °C'; })];
      c.dict = t('pes.f.dictClo');
      // Sin cloFecha (fecha elegida de hoy en adelante) no hay imagen: el satélite solo tiene días pasados (GIBS da 404 a días futuros).
      c.tjs.push('<article class="ag-tj"><p class="ag-tj-chip">' + esc(pilar(1, 'pes.m.clo')) + '</p><h4 class="ag-tj-tit">' + esc(t('pes.f.capa')) + '</h4>' +
        (cloFecha ? '<p class="ag-tj-txt">' + esc(t('pes.cloFecha', { f: cloFecha })) + '</p>' +
          '<button type="button" class="pe-btn" id="pe-clo" aria-pressed="' + (clo ? 'true' : 'false') + '">' + esc(t(clo ? 'pes.cloQuitar' : 'pes.cloVer')) + '</button></article>'
          : '<p class="ag-tj-txt">' + esc(t('pes.cloSinDia', { f: RB.fechaTexto(String(hora || '').slice(0, 10)) })) + '</p></article>'));
      c.tjs.push(tarjeta(pilar(2, 'pes.v.sst'), t('pes.f.mar'), fila(t('pes.f.temp'), sd(e.sst, function (v) { return n1(v) + ' °C'; }))));
      c.tjs.push('<article class="ag-tj"><p class="ag-tj-chip">' + esc(pilar(3, 'pes.f.vedasPil')) + '</p><h4 class="ag-tj-tit">' + esc(t('pes.vedas')) + '</h4>' +
        '<p class="ag-tj-txt">' + esc(t('pes.f.vedasT')) + '</p><ul class="pe-enl"><li><a href="' + URL_VEDAS + '" target="_blank" rel="noopener">gob.mx/conapesca</a></li></ul></article>');
    }
    return c;
  }
  function fichaCerradaHtml(id, p, idx, clo, cloFecha, hora, luna) {
    var c = contenidoFicha(id, p, idx, clo, cloFecha, hora, luna), titulo = t('pes.m.' + id);
    return '<article class="ag-ficha ag-t-' + TONO_F[id] + '" data-ficha="' + id + '"><span class="ag-ficha-borde" aria-hidden="true"></span>' +
      '<button type="button" class="ag-ficha-btn" aria-expanded="false" aria-controls="pe-det-' + id + '"><span class="ag-ficha-cab">' +
      '<span class="ag-ficha-icono"><img class="ag-ico-svg" src="assets/iconos/' + ICO_F[id] + '.svg" alt="" aria-hidden="true" width="24" height="24"></span>' +
      '<span class="ag-ficha-txt"><span class="ag-ficha-tit">' + esc(titulo) + '</span><span class="ag-ficha-sub">' + esc(c.sub) + '</span></span>' +
      '<span class="ag-ficha-chip">' + esc(c.chip) + '</span></span>' +
      '<span class="ag-ficha-pie"><span class="ag-ficha-enlace">' + esc(t('pes.f.ver')) + '</span>' + SVG_FLE + '</span></button></article>';
  }
  function fichaAbiertaHtml(id, p, idx, clo, cloFecha, hora, luna) {
    var c = contenidoFicha(id, p, idx, clo, cloFecha, hora, luna), titulo = t('pes.m.' + id);
    var cerrar = '<button type="button" class="ag-cerrar" data-cerrar="1">' + SVG_X + '<span class="ag-cerrar-t">' + esc(t('pes.f.cerrar')) + '</span></button>';
    return '<article class="ag-ficha ag-abierta ag-t-' + TONO_F[id] + '" data-ficha="' + id + '"><span class="ag-ficha-borde" aria-hidden="true"></span>' +
      '<div id="pe-det-' + id + '" class="ag-detalle" role="region" aria-labelledby="pe-tit-' + id + '">' +
      '<div class="ag-det-cab"><div class="ag-det-cab-izq"><span class="ag-ficha-icono"><img class="ag-ico-svg" src="assets/iconos/' + ICO_F[id] + '.svg" alt="" aria-hidden="true" width="24" height="24"></span>' +
      '<div class="ag-det-cab-txt"><h3 class="ag-det-tit" id="pe-tit-' + id + '" tabindex="-1">' + esc(titulo) + '</h3><p class="ag-det-desc">' + esc(t('pes.f.desc.' + id)) + '</p></div></div>' +
      '<div class="ag-det-cab-der">' + (c.ver ? '<div class="ag-veredicto"><span class="ag-veredicto-e">' + esc(c.ver[0]) + '</span><span class="ag-veredicto-v">' + esc(c.ver[1]) + '</span></div>' : '') + cerrar + '</div></div>' +
      '<section class="ag-dictamen"><p class="ag-mono ag-dictamen-t">' + esc(t('pes.f.dictT')) + '</p><p class="ag-dictamen-txt">' + esc(c.dict) + '</p></section>' +
      '<section class="ag-grupo"><div class="ag-grupo-cab"><h4 class="ag-grupo-tit">' + esc(t('pes.zona', { z: p.nombre })) + '</h4><p class="ag-mono ag-grupo-nota">' + esc(t('pes.act')) + '</p></div><div class="ag-tjs">' + c.tjs.join('') + '</div></section>' +
      '<details class="ag-fuentes"><summary class="ag-mono ag-fuentes-t">' + esc(t('pes.f.fuentes')) + '</summary><ul>' +
      '<li><a href="https://open-meteo.com/en/docs/marine-weather-api" target="_blank" rel="noopener">Open-Meteo Marine</a> · CC BY 4.0</li>' +
      '<li><a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener">Open-Meteo Forecast</a> · CC BY 4.0</li>' +
      '<li><a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA GIBS (VIIRS NOAA-20)</a></li>' + c.fuentes.join('') + '</ul></details>' +
      '<p class="ag-cerrar-pie">' + cerrar + '</p></div></article>';
  }
  /* Las 4 fichas; con una abierta, las otras 3 se omiten y la abierta ocupa todo el ancho (igual que en Agrícola). */
  function fichas(p, idx, abierta, clo, cloFecha, hora, luna) {
    if (abierta && ORDEN_F.indexOf(abierta) >= 0) return fichaAbiertaHtml(abierta, p, idx, clo, cloFecha, hora, luna);
    return ORDEN_F.map(function (id) { return fichaCerradaHtml(id, p, idx, clo, cloFecha, hora, luna); }).join('');
  }
  /* Animación: igual que el Mapa Agrícola (la ficha crece desde su tarjeta y al cerrar vuelve a ella). */
  function reducido() { return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function rel(el, g) { var r = el.getBoundingClientRect(), b = g.getBoundingClientRect(); return { top: r.top - b.top, left: r.left - b.left, w: r.width, h: r.height }; }
  function cajaPorOrden(g, id) {
    var i = Math.max(0, ORDEN_F.indexOf(id)), cols = (getComputedStyle(g).gridTemplateColumns || '').split(' ').filter(Boolean).length || 1;
    var gap = 24, w = (g.clientWidth - gap * (cols - 1)) / cols, h = 176;
    return { top: Math.floor(i / cols) * (h + gap), left: (i % cols) * (w + gap), w: w, h: h };
  }
  function fijaInicio(a, c) {
    var W = a.offsetWidth, H = a.offsetHeight, tp = Math.max(0, c.top), l = Math.max(0, c.left);
    a.style.setProperty('--ag-ini', 'inset(' + tp + 'px ' + Math.max(0, W - l - c.w) + 'px ' + Math.max(0, H - tp - c.h) + 'px ' + l + 'px round 12px)');
  }
  function leyenda(v, clo) {
    if (clo) {
      var g = 'linear-gradient(90deg,' + LEY_CLO.map(function (c) { return 'rgb(' + c + ')'; }).join(',') + ')';
      return '<p class="pe-ley-t">' + esc(t('pes.cloTit')) + '</p><div class="pe-ley-barra" style="background:' + g + '"></div>' +
        '<div class="pe-ley-marcas" aria-hidden="true"><span style="left:0">0.01</span><span style="left:30%">0.1</span><span style="left:60%">1</span><span style="left:90%">10</span></div>';
    }
    if (v === 'sst') return '';
    return ['verde', 'amarillo', 'rojo'].map(function (c) {
      return '<span class="pe-ley-i"><i class="pe-pt pe-pt-' + c + '" aria-hidden="true"></i><b>' + esc(t('pes.ley.' + c)) + '</b> ' + esc(t('pes.ley.' + v + '.' + c)) + '</span>';
    }).join('');
  }
  function nombreDia(datos, d) {
    if (datos.fecha) { try { return new Date(datos.fecha + 'T12:00:00Z').toLocaleDateString(T.locale(), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return datos.fecha; } }
    if (d === 0) return t('pes.ayer');
    if (d === 1) return t('pes.hoy');
    if (d === 2) return t('pes.manana');
    try { return new Date(V.fechaDe(datos.horas[d * 24]) + 'T12:00:00Z').toLocaleDateString(T.locale(), { weekday: 'long', timeZone: 'UTC' }); } catch (e) { return V.fechaDe(datos.horas[d * 24]); }
  }

  var est = { mapa: null, ficha: 0, timer: null };
  function parar() { if (est.timer) { clearInterval(est.timer); est.timer = null; } }
  function limpiar() {
    est.ficha++; parar();
    if (est.mapa) { est.mapa.destruir(); est.mapa = null; }
    if (est.onKey) { document.removeEventListener('keydown', est.onKey); est.onKey = null; }
  }

  function montar(main, datos) {
    var cuerpo = main.querySelector('#pe-cuerpo');
    var ahora = V.indiceAhora(datos.horas);
    var S = { dia: Math.min(3, Math.floor(ahora / 24)), h: ahora % 24, puerto: 'lapaz', v: 'ola', clo: false, ficha: null, cajas: {}, luna: undefined, cerrando: false, fecha: null };
    var diaHoy = S.dia;
    var cloHoy = V.sumaDias(V.fechaDe(datos.horas[ahora]), -1), cloFecha = cloHoy;
    /* Fecha elegida (S.fecha): D = {fecha, horas (24), porId: puertos ya consultados para esa fecha, info}. Solo se pide el puerto elegido;
       los demás pines quedan en "—" (sin consultar) hasta que los toquen. */
    var D = null;
    function vista() {
      if (!S.fecha || !D) return datos;
      return { fecha: D.fecha, horas: D.horas, puertos: datos.puertos.map(function (p) {
        return D.porId[p.id] || { id: p.id, nombre: p.nombre, costa: p.costa, menor: p.menor, mar: p.mar, pueblo: p.pueblo, s: {}, sol: [], sinDia: true };
      }) };
    }
    function puertoDe(vv, id) { var r = vv.puertos[0]; vv.puertos.forEach(function (p) { if (p.id === id) r = p; }); return r; }

    cuerpo.innerHTML = buscadorHtml() + '<p class="pe-dia-estado" id="pe-dia-estado" role="status" aria-live="polite" hidden></p>' +
      '<div class="chips pe-puertos" role="group" aria-label="' + esc(t('pes.puerto')) + '">' + datos.puertos.map(function (p) {
        return '<button type="button" class="pe-chip" data-puerto="' + esc(p.id) + '" aria-pressed="false">' + esc(p.nombre) + '</button>';
      }).join('') + '</div>' +
      '<div class="chips pe-vars" role="group" aria-label="' + esc(t('pes.var')) + '">' + ['ola', 'viento', 'sst'].map(function (v) {
        return '<button type="button" class="pe-chip" data-var="' + v + '" aria-pressed="false">' + esc(t('pes.v.' + v)) + '</button>';
      }).join('') + '</div>' +
      '<div class="pe-mapa-caja"><div id="pe-mapa" class="pe-mapa" role="region" aria-label="' + esc(t('pes.mapaReg')) + '"></div>' +
      '<p class="pe-aviso" id="pe-aviso" hidden></p></div>' +
      '<div class="pe-ley" id="pe-ley"></div>' +
      '<div class="pe-reloj"><button type="button" class="pe-flecha" id="pe-ant"><span class="mi-ic" style="-webkit-mask-image:url(assets/iconos/mapa/skip_previous.svg);mask-image:url(assets/iconos/mapa/skip_previous.svg)" aria-hidden="true"></span><span class="sr">' + esc(t('pes.diaAnt')) + '</span></button>' +
        '<div class="pe-reloj-c"><output class="pe-hora" id="pe-sal" for="pe-rng"></output>' +
        '<label class="sr" for="pe-rng">' + esc(t('pes.hora')) + '</label><input type="range" id="pe-rng" min="0" max="23" step="1" value="' + S.h + '"></div>' +
        '<button type="button" class="pe-flecha" id="pe-sig"><span class="mi-ic" style="-webkit-mask-image:url(assets/iconos/mapa/skip_next.svg);mask-image:url(assets/iconos/mapa/skip_next.svg)" aria-hidden="true"></span><span class="sr">' + esc(t('pes.diaSig')) + '</span></button></div>' +
      '<button type="button" class="pe-sim" id="pe-sim"></button>' +
      '<div class="pe-diag"><h2>' + esc(t('pes.diag')) + '</h2><p class="pe-zona" id="pe-zona"></p></div>' +
      '<div class="ag-fichas pe-fichas" id="pe-mos"></div>' +
      '<p class="fuente pe-nota"><span id="pe-nota-dia"></span>' + esc(t('pes.nota')) + ' <a href="' + URL_CAPITANIA + '" target="_blank" rel="noopener">SEMAR</a></p>';

    var pill = main.querySelector('#pe-act'); if (pill) { pill.textContent = t('pes.act'); pill.hidden = false; }
    var ancho = cuerpo.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
    est.mapa = MI.crear(cuerpo.querySelector('#pe-mapa'), {
      centro: ancho >= 640 ? [25.4, -111.9] : [25.3, -112.1], zoom: ancho >= 640 ? 7 : 6.5, minZoom: 6, maxZoom: 9, zoomMenores: ancho >= 640 ? 0 : 7.5, limites: [[21.5, -116.5], [29.5, -107.5]], ajustar: limitesPuertos(datos), margen: ancho >= 640 ? [70, 70] : [60, 56],
      alElegir: function (id) { elegirPuerto(id); },
      alError: function () { var a = cuerpo.querySelector('#pe-aviso'); a.textContent = t('pes.cloError'); a.hidden = false; }
    });
    var rng = cuerpo.querySelector('#pe-rng'), sim = cuerpo.querySelector('#pe-sim');

    function idx() { return S.fecha ? S.h : S.dia * 24 + S.h; }
    function rotuloSim() { sim.innerHTML = '<span class="mi-ic" style="-webkit-mask-image:url(assets/iconos/mapa/' + (est.timer ? 'pause' : 'play_arrow') + '.svg);mask-image:url(assets/iconos/mapa/' + (est.timer ? 'pause' : 'play_arrow') + '.svg)" aria-hidden="true"></span>' + esc(t(est.timer ? 'pes.simPausa' : 'pes.sim')); }
    function pintar() {
      var vv = vista(), i = idx(), p = puertoDe(vv, S.puerto), r = RB.rangoFechas();
      cuerpo.querySelectorAll('[data-puerto]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-puerto') === S.puerto)); });
      cuerpo.querySelectorAll('[data-var]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-var') === S.v)); });
      rng.value = S.h;
      cuerpo.querySelector('#pe-sal').textContent = nombreDia(vv, S.dia) + ' · ' + (S.h < 10 ? '0' : '') + S.h + ':00';
      rng.setAttribute('aria-valuetext', nombreDia(vv, S.dia) + ' ' + S.h + ':00');
      // Con fecha elegida, las flechas mueven la fecha un día (dentro del rango) y piden solo ese puerto.
      cuerpo.querySelector('#pe-ant').disabled = S.fecha ? S.fecha <= r.min : S.dia <= 0;
      cuerpo.querySelector('#pe-sig').disabled = S.fecha ? S.fecha >= r.max : S.dia >= 3;
      if (est.mapa) est.mapa.pines(pines(vv, i, S.v, S.puerto));
      cuerpo.querySelector('#pe-ley').innerHTML = leyenda(S.v, S.clo);
      cuerpo.querySelector('#pe-zona').textContent = t('pes.zona', { z: p.nombre });
      var mos = cuerpo.querySelector('#pe-mos'); mos.className = 'ag-fichas pe-fichas' + (S.ficha ? ' ag-fichas-abierta' : '');
      mos.innerHTML = fichas(p, i, S.ficha, S.clo, cloFecha, vv.horas[i], S.luna);
      rotuloSim();
    }
    /* ---------- Buscador: puerto/ciudad + fecha (como Clima). Nada se pide al cargar ni al escribir: solo al aplicar. ---------- */
    var q = cuerpo.querySelector('#pe-q'), fe = cuerpo.querySelector('#pe-f'), qmsg = cuerpo.querySelector('#pe-q-msg'), estado = cuerpo.querySelector('#pe-dia-estado');
    var pill = main.querySelector('#pe-act'), kick = main.querySelector('#pe-kick');
    function avisa(txt) { qmsg.textContent = txt || ''; qmsg.hidden = !txt; }
    function ponEstado(txt, error) { estado.textContent = txt || ''; estado.hidden = !txt; estado.className = 'pe-dia-estado' + (error ? ' pe-dia-estado-err' : ''); }
    function centrar(id) {
      var p = null; datos.puertos.forEach(function (x) { if (x.id === id) p = x; });
      var chip = cuerpo.querySelector('[data-puerto="' + id + '"]'), fila = chip && chip.parentNode;   // en celular la fila de puertos se desliza: se lleva el chip a la vista
      if (fila && fila.scrollWidth > fila.clientWidth) fila.scrollLeft = Math.max(0, chip.offsetLeft - fila.offsetLeft - 16);
      if (p && est.mapa && est.mapa.mapa) { try { est.mapa.mapa.panTo([p.mar[0], p.mar[1]], { animate: false }); } catch (x) { /* sin mapa */ } }
    }
    function rotulos() {
      if (pill) pill.textContent = S.fecha ? t('pes.actDia', { f: RB.fechaTexto(S.fecha) }) : t('pes.act');
      if (kick) kick.textContent = t(S.fecha ? 'pes.kickerDia' : 'pes.kicker');
      var nota = cuerpo.querySelector('#pe-nota-dia'); if (nota) { nota.textContent = S.fecha ? t('pes.puntoDia') + ' ' : ''; }
    }
    function textoDia(id) {
      var inf = D.info[id] || {}, f = RB.fechaTexto(D.fecha), n = puertoDe(vista(), id).nombre, hoy = RB.hoyISO();
      if (inf.respaldo) return t(/429/.test(inf.motivo || '') ? 'pes.guardado429' : 'pes.guardado', { h: inf.hora });
      var s = t('pes.estadoDia', { n: n, f: f, p: t(D.fecha > hoy ? 'pes.pron' : 'pes.pasado') });
      if (inf.parcial) s += ' ' + t(/429/.test(inf.motivo || '') ? 'pes.parcial429' : 'pes.parcial', { q: t(inf.parcial === 'pron' ? 'pes.qPron' : 'pes.qMar') });
      if (inf.sinMar && inf.parcial !== 'mar') s += ' ' + t('pes.sinMarDia') + (D.fecha > RB.sumarDias(hoy, 8) ? t('pes.sinMarFut') : '');
      if (inf.sinPron && inf.parcial !== 'pron') s += ' ' + t('pes.sinPronDia');
      return s;
    }
    /* Pide (o toma de la caché) un puerto en una fecha: 1 coordenada marina + 1 de pronóstico. */
    function cargarPuerto(id, fecha) {
      parar();
      var antes = { fecha: S.fecha, D: D };
      if (!D || D.fecha !== fecha) { D = { fecha: fecha, horas: null, porId: {}, info: {} }; S.luna = undefined; }
      var nombre = puertoDe(datos, id).nombre;
      ponEstado(t('pes.cargaDia', { n: nombre, f: RB.fechaTexto(fecha) }));
      return V.cargarDia(id, fecha).then(function (res) {
        if (D.fecha !== fecha) return false;
        if (!D.horas) D.horas = res.dia.horas;
        D.porId[id] = res.dia.puerto;
        D.info[id] = { sinMar: res.dia.sinMar, sinPron: res.dia.sinPron, respaldo: !!res.respaldo, motivo: res.motivo, parcial: res.parcial,
          hora: res.respaldo ? new Date(Date.now() - res.edadMs).toLocaleTimeString(T.locale(), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: V.ZONA }) : '' };
        S.fecha = fecha; S.puerto = id; S.dia = 0;
        cloFecha = fecha < RB.hoyISO() ? fecha : null;
        if (!cloFecha && S.clo) { S.clo = false; capaClo(); } else if (S.clo) capaClo();
        fe.value = fecha; rotulos(); pintar(); centrar(id);
        ponEstado(textoDia(id), !!(D.info[id].respaldo || D.info[id].parcial));
        return true;
      }, function (e) {
        if (!D.horas) { D = antes.D; S.fecha = antes.fecha; }   // sin nada que mostrar para esa fecha: se queda lo de antes
        ponEstado(t(/429/.test(e && e.message || '') ? 'pes.limite' : 'pes.errorDia'), true);
        if (S.fecha) fe.value = S.fecha; else fe.value = RB.rangoFechas().hoy;
        return false;
      });
    }
    function volverAHoy(id) {
      parar(); S.fecha = null; D = null; S.dia = diaHoy; S.luna = undefined; cloFecha = cloHoy;
      if (id) S.puerto = id;
      if (S.clo) capaClo();
      fe.value = RB.rangoFechas().hoy; rotulos(); pintar(); centrar(S.puerto);
      ponEstado(t('pes.bOk', { n: puertoDe(datos, S.puerto).nombre }));
      return Promise.resolve(true);
    }
    /* Tocar un puerto (botón o pin): con fecha elegida y sin consultar, se pide solo ese puerto. */
    function elegirPuerto(id) {
      if (S.fecha && D && !D.porId[id]) { S.puerto = id; pintar(); return cargarPuerto(id, S.fecha); }
      S.puerto = id; pintar();
      if (S.fecha && D) ponEstado(textoDia(id), !!(D.info[id] || {}).respaldo);
      return Promise.resolve(true);
    }
    function aplicar() {
      var r = RB.rangoFechas(), v = validar(datos.puertos, q.value, fe.value, r);
      if (!v.ok) { avisa(v.error); return Promise.resolve(false); }
      avisa('');
      var id = v.puerto || S.puerto;
      if (!v.fecha) return volverAHoy(id);
      if (D && D.fecha === v.fecha && D.porId[id]) { S.puerto = id; pintar(); centrar(id); ponEstado(textoDia(id), !!(D.info[id] || {}).respaldo); return Promise.resolve(true); }
      return cargarPuerto(id, v.fecha);
    }
    function moverFecha(n) {
      var r = RB.rangoFechas(), f = RB.sumarDias(S.fecha, n);
      if (f < r.min || f > r.max) return;
      if (f === r.hoy) { volverAHoy(); return; }
      cargarPuerto(S.puerto, f);
    }
    function capaClo() {
      var a = cuerpo.querySelector('#pe-aviso'); a.hidden = true;
      if (est.mapa) est.mapa.capa(S.clo ? URL_CLO + cloFecha + '/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png' : null, 'NASA EOSDIS GIBS / VIIRS NOAA-20');
    }
    cuerpo.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('button') : null; if (!b) return;
      if (b.hasAttribute('data-cerrar')) { cerrarFicha(); return; }
      if (b.classList.contains('ag-ficha-btn')) { var art = b.closest('[data-ficha]'); if (art) abrirFicha(art.getAttribute('data-ficha')); return; }
      if (b.hasAttribute('data-hoy')) { fe.value = RB.rangoFechas().hoy; aplicar(); }
      else if (b.hasAttribute('data-puerto')) elegirPuerto(b.getAttribute('data-puerto'));
      else if (b.hasAttribute('data-var')) { S.v = b.getAttribute('data-var'); pintar(); }
      else if (b.id === 'pe-clo') { S.clo = !S.clo; capaClo(); pintar(); }
      else if (b.id === 'pe-ant') { parar(); if (S.fecha) moverFecha(-1); else { S.dia = Math.max(0, S.dia - 1); pintar(); } }
      else if (b.id === 'pe-sig') { parar(); if (S.fecha) moverFecha(1); else { S.dia = Math.min(3, S.dia + 1); pintar(); } }
      else if (b.id === 'pe-sim') {
        if (est.timer) { parar(); pintar(); return; }
        if (S.h >= 23) S.h = -1;
        est.timer = setInterval(function () { S.h += 1; if (S.h >= 23) { S.h = 23; parar(); } pintar(); }, PASO_MS);
        S.h += 1; pintar();
      }
    });
    function irAFichas() { var h = cuerpo.querySelector('.pe-diag'); if (h && h.scrollIntoView) h.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' }); }
    function enfocaTitulo() { var tt = cuerpo.querySelector('#pe-tit-' + S.ficha); if (tt && tt.focus) { try { tt.focus({ preventScroll: true }); } catch (x) { tt.focus(); } } }
    /* Abre una ficha: crece desde su tarjeta (como en Agrícola), oculta las otras 3 y lleva el foco al título. */
    function abrirFicha(id) {
      if (S.cerrando || S.ficha === id) return;
      var g = cuerpo.querySelector('#pe-mos'), card = g.querySelector('[data-ficha="' + id + '"]'), caja = card ? rel(card, g) : null;
      parar(); S.ficha = id; pintar();
      var a = g.querySelector('.ag-abierta');
      if (a) {
        if (caja && caja.w) S.cajas[id] = caja;
        fijaInicio(a, S.cajas[id] || cajaPorOrden(g, id));
        if (!reducido()) { a.classList.add('ag-anima'); setTimeout(function () { a.classList.remove('ag-anima'); }, 400); }
      }
      irAFichas(); enfocaTitulo();
      if (id === 'oc' && S.luna === undefined) {
        S.luna = null;
        pedirLuna(V.fechaDe(vista().horas[idx()])).then(function (l) {
          S.luna = l;
          if (S.ficha === 'oc') { var tenia = cuerpo.contains(document.activeElement) && document.activeElement !== cuerpo; pintar(); if (tenia) enfocaTitulo(); }
        }, function () { S.luna = false; });
      }
    }
    function cerrarFicha() {
      var previa = S.ficha; if (!previa || S.cerrando) return;
      var g = cuerpo.querySelector('#pe-mos'), a = g.querySelector('.ag-abierta');
      function termina() {
        S.cerrando = false; S.ficha = null; pintar(); irAFichas();
        var bt = cuerpo.querySelector('[data-ficha="' + previa + '"] .ag-ficha-btn'); if (bt && bt.focus) { try { bt.focus({ preventScroll: true }); } catch (x) { bt.focus(); } }
      }
      if (a && !reducido()) { S.cerrando = true; fijaInicio(a, S.cajas[previa] || cajaPorOrden(g, previa)); a.classList.add('ag-cierra'); setTimeout(termina, 280); return; }
      termina();
    }
    if (est.onKey) document.removeEventListener('keydown', est.onKey);
    est.onKey = function (ev) { if (S.ficha && (ev.key === 'Escape' || ev.key === 'Esc')) cerrarFicha(); };
    document.addEventListener('keydown', est.onKey);
    rng.addEventListener('input', function () { parar(); S.h = +rng.value; pintar(); });
    /* Como en Clima: "Ver" (o Enter) aplica; elegir una fecha o salir del campo con un nombre que coincide también aplica.
       Escribir no aplica nada ni pide nada. Hoy = los datos ya cargados (cero peticiones); otra fecha = solo el puerto elegido. */
    cuerpo.querySelector('#pe-busca').addEventListener('submit', function (ev) { ev.preventDefault(); aplicar(); if (q.blur) q.blur(); });
    fe.addEventListener('change', function () { if (fe.value) aplicar(); });
    q.addEventListener('change', function () { if (buscarPuerto(datos.puertos, q.value).i >= 0) aplicar(); });
    q.addEventListener('input', function () { if (!qmsg.hidden) avisa(''); });
    pintar();
  }

  function render(main) {
    limpiar();
    var mi = est.ficha;
    main.innerHTML = '<section class="pe" aria-labelledby="pe-h1"><div class="pe-cab"><p class="hm-mono pe-ins"><i class="hm-punto" aria-hidden="true"></i><span id="pe-kick">' + esc(t('pes.kicker')) + '</span></p>' +
      '<p class="hm-mono hm-pildora pe-act" id="pe-act" hidden></p></div><h1 id="pe-h1">' + esc(t('titulo.pesca')) + '</h1><p class="pe-sub">' + esc(t('pes.sub')) + '</p>' +
      '<div id="pe-cuerpo"><p class="pe-carga">' + esc(t('pes.cargando')) + '</p></div></section>';
    return V.cargar().then(function (r) {
      if (mi !== est.ficha) return;
      main.removeAttribute('aria-busy');
      montar(main, r.datos);
    }).catch(function () {
      if (mi !== est.ficha) return;
      main.removeAttribute('aria-busy');
      var c = main.querySelector('#pe-cuerpo');
      if (c) c.innerHTML = '<p class="aviso" role="alert">' + esc(t('pes.error')) + '</p>';
    });
  }

  var RBPesca = { render: render, limpiar: limpiar, pines: pines, fichas: fichas, fasesLunares: fasesLunares, urlLuna: urlLuna, pedirLuna: pedirLuna, mareograma: mareograma, leyenda: leyenda, estadoPuerto: estadoPuerto, montar: montar, buscarPuerto: buscarPuerto, buscadorHtml: buscadorHtml, validar: validar, TX: TX };
  if (typeof window !== 'undefined') window.RBPesca = RBPesca;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBPesca;
})();
