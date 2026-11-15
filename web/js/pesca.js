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
      'pes.f.pendSeg': 'Pendiente (sin fuente abierta verificada): bandera de puerto, avisos y protocolos oficiales. Consulta a la Capitanía de Puerto.',
      'pes.f.pendOc': 'Pendiente (sin fuente verificada): mareas oficiales, fase lunar y ventanas de cruce.',
      'pes.f.pendCl': 'Pendiente (sin fuente verificada): avisos oficiales de tormenta y radar de lluvia.',
      'pes.f.pendClo': 'Pendiente (sin fuente verificada): temperatura de frentes, especies, tallas y áreas protegidas.',
      'pes.sinDato': 'sin dato', 'pes.sinDatoPuerto': 'Sin dato para esta hora',
      'pes.r0': 'norte', 'pes.r1': 'noreste', 'pes.r2': 'este', 'pes.r3': 'sureste', 'pes.r4': 'sur', 'pes.r5': 'suroeste', 'pes.r6': 'oeste', 'pes.r7': 'noroeste',
      'pes.pinOla': '{n}: oleaje {v}, {e}', 'pes.pinViento': '{n}: viento {v}, {e}', 'pes.pinSst': '{n}: temperatura del mar {v}'
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
      'pes.f.pendSeg': 'Pending (no verified open source): port flag, official warnings and protocols. Check with the Port Captaincy.',
      'pes.f.pendOc': 'Pending (no verified source): official tides, moon phase and crossing windows.',
      'pes.f.pendCl': 'Pending (no verified source): official storm warnings and rain radar.',
      'pes.f.pendClo': 'Pending (no verified source): thermal fronts, species, sizes and protected areas.',
      'pes.sinDato': 'no data', 'pes.sinDatoPuerto': 'No data for this hour',
      'pes.r0': 'north', 'pes.r1': 'northeast', 'pes.r2': 'east', 'pes.r3': 'southeast', 'pes.r4': 'south', 'pes.r5': 'southwest', 'pes.r6': 'west', 'pes.r7': 'northwest',
      'pes.pinOla': '{n}: waves {v}, {e}', 'pes.pinViento': '{n}: wind {v}, {e}', 'pes.pinSst': '{n}: sea temperature {v}'
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
      olaV: en(p.s.olaV, idx), perV: en(p.s.perV, idx), nivel: en(p.s.nivel, idx), pres: en(p.s.pres, idx), presAntes: idx >= 3 ? en(p.s.pres, idx - 3) : null,
      vis: en(p.s.vis, idx), pll: en(p.s.pll, idx), cape: en(p.s.cape, idx), rocio: en(p.s.rocio, idx) };
  }
  /* Pines del mapa para la variable v y la hora idx. */
  function pines(datos, idx, v, activo) {
    return datos.puertos.map(function (p) {
      var e = estadoPuerto(p, idx), valor, icono, nivel, etq;
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
      return { id: p.id, lat: p.mar[0], lon: p.mar[1], icono: icono, valor: valor, tono: tono(nivel), etiqueta: etq, activo: p.id === activo };
    });
  }
  /* Caja que contiene todos los puertos: [[lat mín, lon mín], [lat máx, lon máx]]. */
  function limitesPuertos(datos) {
    var la = datos.puertos.map(function (p) { return p.mar[0]; }), lo = datos.puertos.map(function (p) { return p.mar[1]; });
    return [[Math.min.apply(null, la), Math.min.apply(null, lo)], [Math.max.apply(null, la), Math.max.apply(null, lo)]];
  }
  /* ---------- Fichas expandibles (mismo formato y clases que las del Mapa Agrícola: .ag-*) ---------- */
  var TONO_F = { seg: 'ambar', oc: 'cian', cl: 'pizarra', clo: 'verde' };
  var ICO_F = { seg: 'pesca-semaforo-de-seguridad', oc: 'pesca-condiciones-oceanograficas', cl: 'pesca-clima-y-atmosfera-costera', clo: 'pesca-potencial-y-actividad-pesquera' };
  var ORDEN_F = ['seg', 'oc', 'cl', 'clo'];
  var SVG_X = '<svg class="ag-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var SVG_FLE = '<svg class="ag-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function fila(k, v) { return '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>'; }
  function tarjeta(chip, titulo, filas, texto) {
    return '<article class="ag-tj"><p class="ag-tj-chip">' + esc(chip) + '</p><h4 class="ag-tj-tit">' + esc(titulo) + '</h4>' +
      (texto ? '<p class="ag-tj-txt">' + esc(texto) + '</p>' : '') + (filas ? '<dl class="ag-tj-filas">' + filas + '</dl>' : '') + '</article>';
  }
  function kt(v) { return v == null ? t('pes.sinDato') : n0(v) + ' kt'; }
  function mt(v) { return v == null ? t('pes.sinDato') : n1(v) + ' m'; }
  /* Texto de cada ficha: solo cifras del modelo (Open-Meteo) y reglas de reglas-mar.js; lo demás queda como pendiente. */
  function hhmm(x) { return x ? String(x).slice(11, 16) : t('pes.sinDato'); }
  function contenidoFicha(id, p, idx, clo, cloFecha, hora) {
    var e = estadoPuerto(p, idx), sem = e.estado || 'sin', c = { chip: '', sub: '', ver: null, dict: '', tjs: [], pend: '' };
    var bf = M.beaufort(e.viento);
    if (id === 'seg') {
      c.chip = t('mar.e.' + sem); c.sub = t('pes.segNota'); c.ver = [t('pes.f.estadoL'), t('mar.e.' + sem)];
      c.dict = e.estado ? t('mar.e.' + sem + 'T') : t('pes.sinDatoPuerto');
      c.tjs.push(tarjeta(t('pes.v.ola'), t('pes.f.oleaje'), fila(t('pes.f.altura'), mt(e.ola)) + fila(t('pes.f.nivel'), M.textoOla(e.ola) || t('pes.sinDato'))));
      c.tjs.push(tarjeta(t('pes.v.viento'), t('pes.f.vientoT'), fila(t('pes.f.sostenido'), kt(e.viento)) + fila('Beaufort', bf == null ? t('pes.sinDato') : String(bf)) + fila(t('pes.f.nivel'), M.textoViento(e.viento) || t('pes.sinDato'))));
      c.tjs.push(tarjeta(t('pes.f.escala'), t('pes.f.umbrales'), fila(t('pes.ley.verde'), t('pes.ley.ola.verde') + ' · ' + t('pes.ley.viento.verde')) + fila(t('pes.ley.amarillo'), t('pes.ley.ola.amarillo') + ' · ' + t('pes.ley.viento.amarillo')) + fila(t('pes.ley.rojo'), t('pes.ley.ola.rojo') + ' · ' + t('pes.ley.viento.rojo'))));
      c.pend = t('pes.f.pendSeg');
    } else if (id === 'oc') {
      c.chip = mt(e.ola) + (e.per != null ? ' · ' + n0(e.per) + ' s' : ''); c.sub = t('pes.f.subOc'); c.ver = [t('pes.v.ola'), mt(e.ola)];
      c.dict = t('pes.dMar', { d: rumbo(e.dir) || '—', s: n1(e.sst), c: n1(e.corr) });
      c.tjs.push(tarjeta(t('pes.v.ola'), t('pes.f.oleaje'), fila(t('pes.f.altura'), mt(e.ola)) + fila(t('pes.f.periodo'), e.per == null ? t('pes.sinDato') : n0(e.per) + ' s') + fila(t('pes.f.dir'), rumbo(e.dir) || t('pes.sinDato'))));
      c.tjs.push(tarjeta(t('pes.f.fondo'), t('pes.f.marFondo'), fila(t('pes.f.altura'), mt(e.swell))));
      c.tjs.push(tarjeta(t('pes.v.sst'), t('pes.f.mar'), fila(t('pes.f.temp'), e.sst == null ? t('pes.sinDato') : n1(e.sst) + ' °C')));
      c.tjs.push(tarjeta(t('pes.f.olaV'), t('pes.f.olaVT'), fila(t('pes.f.altura'), mt(e.olaV)) + fila(t('pes.f.periodo'), !e.perV ? t('pes.sinDato') : n0(e.perV) + ' s')));
      c.tjs.push(tarjeta(t('pes.f.nivelMar'), t('pes.f.nivelMarT'), fila(t('pes.f.nivelM'), e.nivel == null ? t('pes.sinDato') : n1(e.nivel) + ' m'), t('pes.f.nivelNota')));
      c.tjs.push(tarjeta(t('pes.f.corr'), t('pes.f.corrT'), fila(t('pes.f.vel'), e.corr == null ? t('pes.sinDato') : n1(e.corr) + ' km/h') + fila(t('pes.f.dir'), rumbo(e.cdir) || t('pes.sinDato'))));
      c.pend = t('pes.f.pendOc');
    } else if (id === 'cl') {
      c.chip = kt(e.viento); c.sub = t('pes.f.subCl'); c.ver = [t('pes.v.viento'), kt(e.viento)];
      c.dict = t('pes.vViento', { v: n0(e.viento), d: rumbo(e.vdir) }) + '. ' + t('pes.dViento', { r: n0(e.rachas), b: bf == null ? '—' : bf }) + ' · ' + M.textoViento(e.viento);
      c.tjs.push(tarjeta(t('pes.v.viento'), t('pes.f.vientoT'), fila(t('pes.f.sostenido'), kt(e.viento)) + fila(t('pes.f.rachas'), kt(e.rachas)) + fila(t('pes.f.dir'), rumbo(e.vdir) || t('pes.sinDato')) + fila('Beaufort', bf == null ? t('pes.sinDato') : String(bf))));
      var dp = e.pres != null && e.presAntes != null ? e.pres - e.presAntes : null, sol = null, fh = String(hora || '').slice(0, 10);
      (p.sol || []).forEach(function (d) { if (d.fecha === fh) sol = d; });
      c.tjs.push(tarjeta(t('pes.f.pres'), t('pes.f.presT'), fila(t('pes.f.actual'), e.pres == null ? t('pes.sinDato') : n1(e.pres) + ' hPa') + fila(t('pes.f.tend'), dp == null ? t('pes.sinDato') : (dp > 0 ? '+' : '') + n1(dp) + ' hPa')));
      c.tjs.push(tarjeta(t('pes.f.lluv'), t('pes.f.lluvT'), fila(t('pes.f.prob'), e.pll == null ? t('pes.sinDato') : n0(e.pll) + ' %') + fila('CAPE', e.cape == null ? t('pes.sinDato') : n0(e.cape) + ' J/kg')));
      c.tjs.push(tarjeta(t('pes.f.vis'), t('pes.f.visT'), fila(t('pes.f.visK'), e.vis == null ? t('pes.sinDato') : n1(e.vis / 1000) + ' km') + fila(t('pes.f.rocio'), e.rocio == null ? t('pes.sinDato') : n1(e.rocio) + ' °C')));
      c.tjs.push(tarjeta(t('pes.f.sol'), t('pes.f.solT'), fila(t('pes.f.amanece'), sol ? hhmm(sol.amanecer) : t('pes.sinDato')) + fila(t('pes.f.anochece'), sol ? hhmm(sol.anochecer) : t('pes.sinDato'))));
      c.pend = t('pes.f.pendCl');
    } else {
      c.chip = t('pes.f.chipClo'); c.sub = t('pes.f.subClo'); c.ver = null;
      c.dict = t('pes.f.dictClo');
      c.tjs.push('<article class="ag-tj"><p class="ag-tj-chip">' + esc(t('pes.m.clo')) + '</p><h4 class="ag-tj-tit">' + esc(t('pes.f.capa')) + '</h4>' +
        '<p class="ag-tj-txt">' + esc(t('pes.cloFecha', { f: cloFecha })) + '</p>' +
        '<button type="button" class="pe-btn" id="pe-clo" aria-pressed="' + (clo ? 'true' : 'false') + '">' + esc(t(clo ? 'pes.cloQuitar' : 'pes.cloVer')) + '</button></article>');
      c.tjs.push('<article class="ag-tj"><p class="ag-tj-chip">CONAPESCA</p><h4 class="ag-tj-tit">' + esc(t('pes.vedas')) + '</h4>' +
        '<p class="ag-tj-txt">' + esc(t('pes.f.vedasT')) + '</p><p class="ag-tj-fuente"><a href="' + URL_VEDAS + '" target="_blank" rel="noopener">gob.mx/conapesca</a></p></article>');
      c.pend = t('pes.f.pendClo');
    }
    return c;
  }
  function fichaCerradaHtml(id, p, idx, clo, cloFecha, hora) {
    var c = contenidoFicha(id, p, idx, clo, cloFecha, hora), titulo = t('pes.m.' + id);
    return '<article class="ag-ficha ag-t-' + TONO_F[id] + '" data-ficha="' + id + '"><span class="ag-ficha-borde" aria-hidden="true"></span>' +
      '<button type="button" class="ag-ficha-btn" aria-expanded="false" aria-controls="pe-det-' + id + '"><span class="ag-ficha-cab">' +
      '<span class="ag-ficha-icono"><img class="ag-ico-svg" src="assets/iconos/' + ICO_F[id] + '.svg" alt="" aria-hidden="true" width="24" height="24"></span>' +
      '<span class="ag-ficha-txt"><span class="ag-ficha-tit">' + esc(titulo) + '</span><span class="ag-ficha-sub">' + esc(c.sub) + '</span></span>' +
      '<span class="ag-ficha-chip">' + esc(c.chip) + '</span></span>' +
      '<span class="ag-ficha-pie"><span class="ag-ficha-enlace">' + esc(t('pes.f.ver')) + '</span>' + SVG_FLE + '</span></button></article>';
  }
  function fichaAbiertaHtml(id, p, idx, clo, cloFecha, hora) {
    var c = contenidoFicha(id, p, idx, clo, cloFecha, hora), titulo = t('pes.m.' + id);
    var cerrar = '<button type="button" class="ag-cerrar" data-cerrar="1">' + SVG_X + '<span class="ag-cerrar-t">' + esc(t('pes.f.cerrar')) + '</span></button>';
    return '<article class="ag-ficha ag-abierta ag-t-' + TONO_F[id] + '" data-ficha="' + id + '"><span class="ag-ficha-borde" aria-hidden="true"></span>' +
      '<div id="pe-det-' + id + '" class="ag-detalle" role="region" aria-labelledby="pe-tit-' + id + '">' +
      '<div class="ag-det-cab"><div class="ag-det-cab-izq"><span class="ag-ficha-icono"><img class="ag-ico-svg" src="assets/iconos/' + ICO_F[id] + '.svg" alt="" aria-hidden="true" width="24" height="24"></span>' +
      '<div class="ag-det-cab-txt"><h3 class="ag-det-tit" id="pe-tit-' + id + '" tabindex="-1">' + esc(titulo) + '</h3><p class="ag-det-desc">' + esc(t('pes.f.desc.' + id)) + '</p></div></div>' +
      '<div class="ag-det-cab-der">' + (c.ver ? '<div class="ag-veredicto"><span class="ag-veredicto-e">' + esc(c.ver[0]) + '</span><span class="ag-veredicto-v">' + esc(c.ver[1]) + '</span></div>' : '') + cerrar + '</div></div>' +
      '<section class="ag-dictamen"><p class="ag-mono ag-dictamen-t">' + esc(t('pes.f.dictT')) + '</p><p class="ag-dictamen-txt">' + esc(c.dict) + '</p></section>' +
      '<section class="ag-grupo"><div class="ag-grupo-cab"><h4 class="ag-grupo-tit">' + esc(t('pes.zona', { z: p.nombre })) + '</h4><p class="ag-mono ag-grupo-nota">' + esc(t('pes.act')) + '</p></div><div class="ag-tjs">' + c.tjs.join('') + '</div></section>' +
      '<p class="ag-mono pe-pend">' + esc(c.pend) + '</p>' +
      '<details class="ag-fuentes"><summary class="ag-mono ag-fuentes-t">' + esc(t('pes.f.fuentes')) + '</summary><ul>' +
      '<li><a href="https://open-meteo.com/en/docs/marine-weather-api" target="_blank" rel="noopener">Open-Meteo Marine</a> · CC BY 4.0</li>' +
      '<li><a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener">Open-Meteo Forecast</a> · CC BY 4.0</li>' +
      '<li><a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA GIBS (VIIRS NOAA-20)</a></li></ul></details>' +
      '<p class="ag-cerrar-pie">' + cerrar + '</p></div></article>';
  }
  /* Las 4 fichas; con una abierta, las otras 3 se omiten y la abierta ocupa todo el ancho (igual que en Agrícola). */
  function fichas(p, idx, abierta, clo, cloFecha, hora) {
    if (abierta && ORDEN_F.indexOf(abierta) >= 0) return fichaAbiertaHtml(abierta, p, idx, clo, cloFecha, hora);
    return ORDEN_F.map(function (id) { return fichaCerradaHtml(id, p, idx, clo, cloFecha, hora); }).join('');
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
    var S = { dia: Math.min(3, Math.floor(ahora / 24)), h: ahora % 24, puerto: 'lapaz', v: 'ola', clo: false, ficha: null };
    var porId = {}; datos.puertos.forEach(function (p) { porId[p.id] = p; });
    var cloFecha = V.sumaDias(V.fechaDe(datos.horas[ahora]), -1);

    cuerpo.innerHTML =
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
      '<p class="fuente pe-nota">' + esc(t('pes.nota')) + ' <a href="' + URL_CAPITANIA + '" target="_blank" rel="noopener">SEMAR</a></p>';

    var pill = main.querySelector('#pe-act'); if (pill) { pill.textContent = t('pes.act'); pill.hidden = false; }
    var ancho = cuerpo.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
    est.mapa = MI.crear(cuerpo.querySelector('#pe-mapa'), {
      centro: ancho >= 640 ? [25.4, -111.9] : [25.3, -112.1], zoom: ancho >= 640 ? 7 : 6.5, minZoom: 6, maxZoom: 9, limites: [[21.5, -116.5], [29.5, -107.5]], ajustar: limitesPuertos(datos), margen: ancho >= 640 ? [70, 70] : [60, 56],
      alElegir: function (id) { S.puerto = id; pintar(); },
      alError: function () { var a = cuerpo.querySelector('#pe-aviso'); a.textContent = t('pes.cloError'); a.hidden = false; }
    });
    var rng = cuerpo.querySelector('#pe-rng'), sim = cuerpo.querySelector('#pe-sim');

    function idx() { return S.dia * 24 + S.h; }
    function rotuloSim() { sim.innerHTML = '<span class="mi-ic" style="-webkit-mask-image:url(assets/iconos/mapa/' + (est.timer ? 'pause' : 'play_arrow') + '.svg);mask-image:url(assets/iconos/mapa/' + (est.timer ? 'pause' : 'play_arrow') + '.svg)" aria-hidden="true"></span>' + esc(t(est.timer ? 'pes.simPausa' : 'pes.sim')); }
    function pintar() {
      var i = idx(), p = porId[S.puerto];
      cuerpo.querySelectorAll('[data-puerto]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-puerto') === S.puerto)); });
      cuerpo.querySelectorAll('[data-var]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-var') === S.v)); });
      rng.value = S.h;
      cuerpo.querySelector('#pe-sal').textContent = nombreDia(datos, S.dia) + ' · ' + (S.h < 10 ? '0' : '') + S.h + ':00';
      rng.setAttribute('aria-valuetext', nombreDia(datos, S.dia) + ' ' + S.h + ':00');
      cuerpo.querySelector('#pe-ant').disabled = S.dia <= 0; cuerpo.querySelector('#pe-sig').disabled = S.dia >= 3;
      if (est.mapa) est.mapa.pines(pines(datos, i, S.v, S.puerto));
      cuerpo.querySelector('#pe-ley').innerHTML = leyenda(S.v, S.clo);
      cuerpo.querySelector('#pe-zona').textContent = t('pes.zona', { z: p.nombre });
      var mos = cuerpo.querySelector('#pe-mos'); mos.className = 'ag-fichas pe-fichas' + (S.ficha ? ' ag-fichas-abierta' : '');
      mos.innerHTML = fichas(p, i, S.ficha, S.clo, cloFecha, datos.horas[i]);
      rotuloSim();
    }
    function capaClo() {
      var a = cuerpo.querySelector('#pe-aviso'); a.hidden = true;
      if (est.mapa) est.mapa.capa(S.clo ? URL_CLO + cloFecha + '/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png' : null, 'NASA EOSDIS GIBS / VIIRS NOAA-20');
    }
    cuerpo.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('button') : null; if (!b) return;
      if (b.hasAttribute('data-cerrar')) { cerrarFicha(); return; }
      if (b.classList.contains('ag-ficha-btn')) {
        var art = b.closest('[data-ficha]'); parar(); S.ficha = art && art.getAttribute('data-ficha'); pintar();
        var tt = cuerpo.querySelector('#pe-tit-' + S.ficha); irAFichas();
        if (tt && tt.focus) { try { tt.focus({ preventScroll: true }); } catch (x) { tt.focus(); } }
        return;
      }
      if (b.hasAttribute('data-puerto')) { S.puerto = b.getAttribute('data-puerto'); pintar(); }
      else if (b.hasAttribute('data-var')) { S.v = b.getAttribute('data-var'); pintar(); }
      else if (b.id === 'pe-clo') { S.clo = !S.clo; capaClo(); pintar(); }
      else if (b.id === 'pe-ant') { parar(); S.dia = Math.max(0, S.dia - 1); pintar(); }
      else if (b.id === 'pe-sig') { parar(); S.dia = Math.min(3, S.dia + 1); pintar(); }
      else if (b.id === 'pe-sim') {
        if (est.timer) { parar(); pintar(); return; }
        if (S.h >= 23) S.h = -1;
        est.timer = setInterval(function () { S.h += 1; if (S.h >= 23) { S.h = 23; parar(); } pintar(); }, PASO_MS);
        S.h += 1; pintar();
      }
    });
    function irAFichas() { var h = cuerpo.querySelector('.pe-diag'); if (h && h.scrollIntoView) h.scrollIntoView({ block: 'start' }); }
    function cerrarFicha() {
      var previa = S.ficha; if (!previa) return;
      S.ficha = null; pintar(); irAFichas();
      var bt = cuerpo.querySelector('[data-ficha="' + previa + '"] .ag-ficha-btn'); if (bt && bt.focus) { try { bt.focus({ preventScroll: true }); } catch (x) { bt.focus(); } }
    }
    if (est.onKey) document.removeEventListener('keydown', est.onKey);
    est.onKey = function (ev) { if (S.ficha && (ev.key === 'Escape' || ev.key === 'Esc')) cerrarFicha(); };
    document.addEventListener('keydown', est.onKey);
    rng.addEventListener('input', function () { parar(); S.h = +rng.value; pintar(); });
    pintar();
  }

  function render(main) {
    limpiar();
    var mi = est.ficha;
    main.innerHTML = '<section class="pe" aria-labelledby="pe-h1"><div class="pe-cab"><p class="hm-mono pe-ins"><i class="hm-punto" aria-hidden="true"></i>' + esc(t('pes.kicker')) + '</p>' +
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

  var RBPesca = { render: render, limpiar: limpiar, pines: pines, fichas: fichas, leyenda: leyenda, estadoPuerto: estadoPuerto, montar: montar, TX: TX };
  if (typeof window !== 'undefined') window.RBPesca = RBPesca;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBPesca;
})();
