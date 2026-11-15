/* Clima: buscador, chips de capa y detalle de cada tarjeta (docs/PLAN-CLIMA.md §1 y §4). ES5, sin build.
   - Buscador "Buscar ubicación en BCS…": filtra las 7 localidades del mapa; elegir una la marca en el mapa y cambia el detalle.
   - Chips General, Calor, Viento, UV y Humedad: cambian lo que dice cada pin (lo pinta clima-mapa.js).
   - Detalle debajo de las tarjetas (uno a la vez, con "Cerrar" y foco al título, como las fichas del Agro): cifras del
     pueblo elegido, curva de 24 horas y consejos. Datos de RBVivo.cargar({clima:true}) y reglas de reglas-clima.js.
   - Son datos del modelo Open-Meteo para el pueblo, no estaciones. Comondú no tiene puerto: "sin dato detallado".
   Nada se inventa: lo que falta dice "—" o "sin dato". Textos ES/EN dentro de este archivo (como pesca.js). */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  function t(k, v) { return T.t(k, v); }
  function lib(nombre, ruta) { return (typeof window !== 'undefined' && window[nombre]) || (typeof require !== 'undefined' ? require(ruta) : null); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  var TX = {
    es: {
      'cd.buscar': 'Buscar ubicación en BCS…', 'cd.buscarEt': 'Buscar ubicación en Baja California Sur', 'cd.capas': 'Capa del mapa',
      'cd.res': '{n} ubicaciones encontradas', 'cd.res1': '1 ubicación encontrada', 'cd.res0': 'Sin resultados para esa búsqueda',
      'cd.capa.general': 'General', 'cd.capa.calor': 'Calor', 'cd.capa.viento': 'Viento', 'cd.capa.uv': 'UV', 'cd.capa.humedad': 'Humedad',
      'cd.cerrar': 'Cerrar', 'cd.cargando': 'Cargando el detalle…', 'cd.error': 'No pudimos cargar el detalle. Prueba de nuevo en unos minutos.',
      'cd.sinPuerto': 'Sin dato detallado para esta localidad: el modelo del detalle cubre 6 de las 7 localidades del mapa.',
      'cd.lugar': 'Ubicación: {l}', 'cd.curva': 'Próximas 24 horas (12 antes y 12 después de ahora)', 'cd.ahora': 'ahora', 'cd.h12a': '−12 h', 'cd.h12d': '+12 h',
      'cd.curvaRes': '{n}: mínimo {mi} {u}, máximo {ma} {u}', 'cd.sinCurva': 'Sin datos para la curva.',
      'cd.consejos': 'Consejos', 'cd.fuente': 'Modelo Open-Meteo para el pueblo, no son estaciones. Mapa: © OpenStreetMap contributors.',
      'cd.calor.t': 'Calor y sensación térmica', 'cd.temp': 'Temperatura ahora', 'cd.sens': 'Sensación térmica del modelo', 'cd.max': 'Máxima de hoy', 'cd.min': 'Mínima de hoy',
      'cd.calor.n': 'Temperatura del aire (°C)', 'cd.calor.c': 'Ver consejos contra el calor en Acciones',
      'cd.uv.t': 'Radiación UV y exposición solar', 'cd.uvAhora': 'Índice UV ahora', 'cd.uvMax': 'Índice UV máximo de hoy', 'cd.uvCat': 'Categoría (OMS)',
      'cd.amanecer': 'Amanecer', 'cd.anochecer': 'Anochecer', 'cd.sol': 'Horas de sol', 'cd.uvProt': 'Protección', 'cd.uv.n': 'Índice UV', 'cd.uv.c': 'Ver avisos de UV',
      'cd.v.t': 'Viento, oleaje y corrientes', 'cd.vViento': 'Viento', 'cd.vRachas': 'Rachas', 'cd.vBeau': 'Escala Beaufort', 'cd.vOla': 'Altura de ola',
      'cd.vDoug': 'Estado del mar (modelo)', 'cd.vPer': 'Periodo del oleaje', 'cd.vCorr': 'Corriente marina', 'cd.vSst': 'Temperatura del mar', 'cd.v.n': 'Viento (km/h)', 'cd.v.c': 'Ver pronóstico marino en Pesca',
      'cd.vNota': 'Viento y rachas a 10 m del agua. Oleaje y corriente: modelo marino de unos 9 km, no son boyas.',
      'cd.l.t': 'Humedad y lluvia', 'cd.lHum': 'Humedad ahora', 'cd.lProb': 'Probabilidad de lluvia (24 h)', 'cd.lMm': 'Lluvia esperada (24 h)', 'cd.lCielo': 'Estado del cielo', 'cd.l.n': 'Probabilidad de lluvia (%)', 'cd.l.c': 'Ver avisos de lluvia y tormenta',
      'cd.sinCalor': 'La etiqueta de calor no se muestra: no hay fuente primaria para la temperatura aparente del modelo.'
    },
    en: {
      'cd.buscar': 'Search a place in BCS…', 'cd.buscarEt': 'Search a place in Baja California Sur', 'cd.capas': 'Map layer',
      'cd.res': '{n} places found', 'cd.res1': '1 place found', 'cd.res0': 'No results for that search',
      'cd.capa.general': 'General', 'cd.capa.calor': 'Heat', 'cd.capa.viento': 'Wind', 'cd.capa.uv': 'UV', 'cd.capa.humedad': 'Humidity',
      'cd.cerrar': 'Close', 'cd.cargando': 'Loading the details…', 'cd.error': "We couldn't load the details. Try again in a few minutes.",
      'cd.sinPuerto': 'No detailed data for this place: the detail model covers 6 of the 7 places on the map.',
      'cd.lugar': 'Place: {l}', 'cd.curva': 'Next 24 hours (12 before and 12 after now)', 'cd.ahora': 'now', 'cd.h12a': '−12 h', 'cd.h12d': '+12 h',
      'cd.curvaRes': '{n}: minimum {mi} {u}, maximum {ma} {u}', 'cd.sinCurva': 'No data for the curve.',
      'cd.consejos': 'Tips', 'cd.fuente': 'Open-Meteo model for the town, not weather stations. Map: © OpenStreetMap contributors.',
      'cd.calor.t': 'Heat & feels-like temperature', 'cd.temp': 'Temperature now', 'cd.sens': 'Apparent temperature (model)', 'cd.max': "Today's high", 'cd.min': "Today's low",
      'cd.calor.n': 'Air temperature (°C)', 'cd.calor.c': 'See tips against the heat in Actions',
      'cd.uv.t': 'UV radiation & sun exposure', 'cd.uvAhora': 'UV index now', 'cd.uvMax': "Today's peak UV index", 'cd.uvCat': 'Category (WHO)',
      'cd.amanecer': 'Sunrise', 'cd.anochecer': 'Sunset', 'cd.sol': 'Sunshine hours', 'cd.uvProt': 'Protection', 'cd.uv.n': 'UV index', 'cd.uv.c': 'See UV alerts',
      'cd.v.t': 'Wind, waves & currents', 'cd.vViento': 'Wind', 'cd.vRachas': 'Gusts', 'cd.vBeau': 'Beaufort scale', 'cd.vOla': 'Wave height',
      'cd.vDoug': 'Sea state (model)', 'cd.vPer': 'Wave period', 'cd.vCorr': 'Ocean current', 'cd.vSst': 'Sea temperature', 'cd.v.n': 'Wind (km/h)', 'cd.v.c': 'See the marine forecast in Fishing',
      'cd.vNota': 'Wind and gusts at 10 m over the water. Waves and current: marine model of about 9 km, not buoys.',
      'cd.l.t': 'Humidity and rain', 'cd.lHum': 'Humidity now', 'cd.lProb': 'Chance of rain (24 h)', 'cd.lMm': 'Expected rain (24 h)', 'cd.lCielo': 'Sky condition', 'cd.l.n': 'Chance of rain (%)', 'cd.l.c': 'See rain and storm alerts',
      'cd.sinCalor': 'No heat label is shown: there is no primary source for the model apparent temperature.'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  /* Localidad del mapa -> puerto de datos-vivos.js. Comondú no tiene puerto. */
  var PUERTO = { lapaz: 'lapaz', loscabos: 'cabos', loreto: 'loreto', mulege: 'mulege', guerreronegro: 'guerreronegro', bahiamagdalena: 'bahiamagdalena', comondu: null };
  var KMH = 1.852; // 1 nudo = 1.852 km/h (definición)
  var CAPAS = ['general', 'calor', 'viento', 'uv', 'humedad'];
  var ABIERTA = null, SEL = 'lapaz', DATOS = null, RAIZ = null, ESTADO_CARGA = 'nada';

  function CM() { return lib('RBClimaMapa', './clima-mapa.js'); }
  function CL() { return lib('RBCielo', './cielo.js'); }
  function N(v, d) { return v == null || isNaN(v) ? '—' : Number(v).toFixed(d == null ? 0 : d); }
  function kmh(kt) { return kt == null ? null : kt * KMH; }
  function lugares() { return CL().LUGARES; }
  function lugar(id) { var l = lugares(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return l[0]; }
  function sinTildes(s) { return String(s).toLowerCase().normalize ? String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : String(s).toLowerCase(); }
  /* Nombre completo para buscar: "Gmo. Negro" también se encuentra con "guerrero". */
  var ALIAS = { guerreronegro: 'guerrero negro', bahiamagdalena: 'bahia magdalena' };
  function buscar(q) {
    var n = sinTildes(String(q || '').trim());
    return lugares().filter(function (l) { return !n || sinTildes(l.es + ' ' + (ALIAS[l.id] || '')).indexOf(n) >= 0; });
  }

  /* Buscador y chips (arriba del mapa). */
  function barraHtml() {
    var h = '<div class="cd-barra"><div class="cd-buscar"><label class="sr" for="cd-q">' + esc(t('cd.buscarEt')) + '</label>' +
      '<input id="cd-q" type="search" autocomplete="off" placeholder="' + esc(t('cd.buscar')) + '" aria-controls="cd-res">' +
      '<ul id="cd-res" class="cd-res" hidden></ul><p id="cd-estado" class="sr" role="status" aria-live="polite"></p></div>' +
      '<div class="cd-chips" role="group" aria-label="' + esc(t('cd.capas')) + '">';
    CAPAS.forEach(function (c) {
      var on = CM() && CM().ESTADO ? CM().ESTADO.capa === c : c === 'general';
      h += '<button type="button" class="cd-chip" data-capa="' + c + '" aria-pressed="' + on + '">' + esc(t('cd.capa.' + c)) + '</button>';
    });
    return h + '</div></div>';
  }

  /* Curva de 24 horas en SVG: 25 puntos, huecos donde no hay dato. Lleva texto con mínimo y máximo. */
  function curvaHtml(valores, nombre, unidad, dec) {
    var vs = valores.filter(function (v) { return v != null; });
    if (!vs.length) return '<p class="cd-vacio">' + esc(t('cd.sinCurva')) + '</p>';
    var mi = Math.min.apply(null, vs), ma = Math.max.apply(null, vs), W = 300, H = 90, pad = 6;
    var rango = ma - mi || 1, tramos = [], tr = [];
    valores.forEach(function (v, i) {
      if (v == null) { if (tr.length) { tramos.push(tr); tr = []; } return; }
      tr.push((i / 24 * (W - 2 * pad) + pad).toFixed(1) + ',' + (H - pad - (v - mi) / rango * (H - 2 * pad)).toFixed(1));
    });
    if (tr.length) tramos.push(tr);
    var x0 = (12 / 24 * (W - 2 * pad) + pad).toFixed(1);
    var resumen = t('cd.curvaRes', { n: nombre, mi: N(mi, dec), ma: N(ma, dec), u: unidad });
    return '<figure class="cd-curva"><figcaption>' + esc(t('cd.curva')) + '</figcaption>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(resumen) + '" preserveAspectRatio="none">' +
      '<line class="cd-ahora" x1="' + x0 + '" x2="' + x0 + '" y1="0" y2="' + H + '"/>' +
      tramos.map(function (p) { return p.length > 1 ? '<polyline class="cd-linea" points="' + p.join(' ') + '"/>' : '<circle class="cd-pto" cx="' + p[0].split(',')[0] + '" cy="' + p[0].split(',')[1] + '" r="3"/>'; }).join('') +
      '</svg><div class="cd-eje" aria-hidden="true"><span>' + esc(t('cd.h12a')) + '</span><span>' + esc(t('cd.ahora')) + '</span><span>' + esc(t('cd.h12d')) + '</span></div>' +
      '<p class="cd-curva-res">' + esc(resumen) + '</p></figure>';
  }

  function dato(et, v) { return '<div class="cd-dato"><dt>' + esc(et) + '</dt><dd>' + esc(v) + '</dd></div>'; }
  function g(x, u, d) { return x == null ? '—' : N(x, d) + (u ? ' ' + u : ''); }

  /* Contenido de cada detalle a partir de datos de RBVivo, la hora actual y el puerto. Funciones puras: se prueban sin DOM. */
  function detalleDe(id, datos, idx, k) {
    var R = lib('RBReglasClima', './reglas-clima.js'), M = lib('RBMar', './reglas-mar.js'), V = lib('RBVivo', './datos-vivos.js');
    var r = R.resumenPuerto(datos, idx, k), cu = function (s) { return R.curva24(datos, k, s, idx); };
    var h = '', c = r.calor, u = r.uv, v = r.viento, l = r.lluvia;
    if (id === 'calor') {
      h = dato(t('cd.temp'), g(c.temp, '°C', 1)) + dato(t('cd.sens'), g(c.sens, '°C', 1)) + dato(t('cd.max'), g(c.max, '°C', 1)) + dato(t('cd.min'), g(c.min, '°C', 1));
      return { datos: h, curva: curvaHtml(cu('temp'), t('cd.calor.n'), '°C', 1), nota: t('cd.sinCalor'), enlace: ['#acciones', t('cd.calor.c')] };
    }
    if (id === 'uv') {
      h = dato(t('cd.uvAhora'), g(u.ahora, '', 1)) + dato(t('cd.uvMax'), g(u.max, '', 1)) + dato(t('cd.uvCat'), R.textoUV(u.max)) +
        dato(t('cd.amanecer'), u.amanecer || '—') + dato(t('cd.anochecer'), u.anochecer || '—') + dato(t('cd.sol'), g(u.solH, 'h', 1));
      return { datos: h, curva: curvaHtml(cu('uv'), t('cd.uv.n'), '', 1), nota: t('cd.uvProt') + ': ' + R.textoProteccion(u.max), enlace: ['#avisos', t('cd.uv.c')] };
    }
    if (id === 'viento') {
      h = dato(t('cd.vViento'), g(kmh(v.kt), 'km/h')) + dato(t('cd.vRachas'), g(kmh(v.rachas), 'km/h')) +
        dato(t('cd.vBeau'), v.beaufort == null ? '—' : v.beaufort + ' · ' + M.textoViento(v.kt)) +
        dato(t('cd.vOla'), g(v.ola, 'm', 1)) + dato(t('cd.vDoug'), v.douglas == null ? '—' : v.douglas + ' · ' + M.textoOla(v.ola)) +
        dato(t('cd.vPer'), g(v.periodo, 's', 1)) +
        dato(t('cd.vCorr'), v.corriente == null ? '—' : N(v.corriente, 1) + ' km/h' + (v.corriente > 0 && v.cdir != null ? ' → ' + N(v.cdir) + '°' : '')) +
        dato(t('cd.vSst'), g(v.sst, '°C', 1));
      var ks = cu('viento').map(function (x) { return x == null ? null : x * KMH; });
      return { datos: h, curva: curvaHtml(ks, t('cd.v.n'), 'km/h', 0), nota: t('cd.vNota'), enlace: ['#pesca', t('cd.v.c')] };
    }
    var cielo = l.codigo == null ? '—' : CL().estado(l.codigo, 1).texto;
    h = dato(t('cd.lHum'), g(l.hum, '%')) + dato(t('cd.lProb'), g(l.prob24, '%')) + dato(t('cd.lMm'), g(l.mm24, 'mm', 1)) + dato(t('cd.lCielo'), cielo);
    return { datos: h, curva: curvaHtml(cu('plluvia'), t('cd.l.n'), '%', 0), nota: '', enlace: ['#avisos', t('cd.l.c')] };
  }

  function detalleHtml(id, datos, idx) {
    var lg = lugar(SEL), puerto = PUERTO[lg.id], k = -1, V = lib('RBVivo', './datos-vivos.js');
    if (puerto) for (var i = 0; i < V.PUERTOS.length; i++) if (V.PUERTOS[i].id === puerto) k = i;
    var cab = '<div class="cd-cab"><h3 id="cd-tit" tabindex="-1">' + esc(t('cd.' + (id === 'viento' ? 'v' : id === 'lluvia' ? 'l' : id) + '.t')) + '</h3>' +
      '<button type="button" class="cd-cerrar" data-cerrar="1">' + esc(t('cd.cerrar')) + '</button></div><p class="cd-lugar">' + esc(t('cd.lugar', { l: lg.es })) + '</p>';
    var cuerpo;
    if (k < 0) cuerpo = '<p class="cd-vacio">' + esc(t('cd.sinPuerto')) + '</p>';
    else if (!datos) cuerpo = '<p class="cd-vacio" role="status">' + esc(t(ESTADO_CARGA === 'error' ? 'cd.error' : 'cd.cargando')) + '</p>';
    else {
      var d = detalleDe(id, datos, idx, k);
      cuerpo = '<dl class="cd-datos">' + d.datos + '</dl>' + d.curva + (d.nota ? '<p class="cd-nota">' + esc(d.nota) + '</p>' : '') +
        '<p class="cd-enlace"><a href="' + d.enlace[0] + '">' + esc(d.enlace[1]) + ' →</a></p>';
    }
    return cab + cuerpo + '<p class="cd-fuente">' + esc(t('cd.fuente')) + '</p>';
  }

  /* ---- DOM ---- */
  function pintar(enfocar) {
    if (!RAIZ) return;
    var caja = RAIZ.querySelector('#cd-detalle');
    if (!caja) return;
    if (!ABIERTA) { caja.hidden = true; caja.innerHTML = ''; }
    else {
      var V = lib('RBVivo', './datos-vivos.js');
      caja.hidden = false;
      var teniaFoco = typeof document !== 'undefined' && document.activeElement && document.activeElement.id === 'cd-tit';
      caja.innerHTML = detalleHtml(ABIERTA, DATOS, DATOS ? V.indiceAhora(DATOS.horas) : 0);
      if (enfocar || teniaFoco) { var ti = caja.querySelector('#cd-tit'); if (ti && ti.focus) ti.focus(); }
    }
    RAIZ.querySelectorAll('[data-cd]').forEach(function (a) { a.setAttribute('aria-expanded', String(a.getAttribute('data-cd') === ABIERTA)); });
  }
  function cargarDatos() {
    if (DATOS || ESTADO_CARGA === 'cargando') return;
    var V = lib('RBVivo', './datos-vivos.js');
    ESTADO_CARGA = 'cargando';
    V.cargar({ clima: true }).then(function (r) { DATOS = r.datos; ESTADO_CARGA = 'listo'; pintar(false); },
      function () { ESTADO_CARGA = 'error'; pintar(false); });
  }
  function abrir(id, enfocar) { ABIERTA = id; pintar(enfocar !== false); cargarDatos(); }
  function cerrar() {
    var prev = ABIERTA; ABIERTA = null; pintar(false);
    if (RAIZ && prev) { var a = RAIZ.querySelector('[data-cd="' + prev + '"]'); if (a && a.focus) a.focus(); }
  }
  function elegir(id) {
    SEL = id; if (CM() && CM().elegir) CM().elegir(id);
    if (ABIERTA) pintar(false);
  }
  function resultados(q) {
    var lista = RAIZ.querySelector('#cd-res'), est = RAIZ.querySelector('#cd-estado'), r = buscar(q);
    var abierto = String(q || '').trim() !== '';
    lista.hidden = !abierto;
    lista.innerHTML = abierto ? r.map(function (l) { return '<li><button type="button" class="cd-op" data-lugar="' + l.id + '">' + esc(l.es) + '</button></li>'; }).join('') : '';
    est.textContent = !abierto ? '' : r.length === 0 ? t('cd.res0') : r.length === 1 ? t('cd.res1') : t('cd.res', { n: r.length });
    return r;
  }

  function montar(raiz) {
    RAIZ = raiz;
    if (!raiz || !raiz.querySelector || !raiz.querySelector('#cd-detalle')) return false;
    ABIERTA = null; SEL = (CM() && CM().ESTADO && CM().ESTADO.sel) || 'lapaz';
    if (CM() && CM().alElegir) CM().alElegir(function (id) { elegir(id); });
    var q = raiz.querySelector('#cd-q');
    q.addEventListener('input', function () { resultados(q.value); });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var r = resultados(q.value); if (r.length) { elegir(r[0].id); q.value = r[0].es; resultados(''); } e.preventDefault(); }
      if (e.key === 'Escape') { q.value = ''; resultados(''); }
    });
    raiz.querySelector('#cd-res').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-lugar]') : null;
      if (!b) return;
      elegir(b.getAttribute('data-lugar')); q.value = lugar(SEL).es; resultados('');
    });
    raiz.querySelector('.cd-chips').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-capa]') : null;
      if (!b) return;
      if (CM() && CM().capa) CM().capa(b.getAttribute('data-capa'));
      raiz.querySelectorAll('.cd-chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
    var tarjetas = raiz.querySelector('#cm-tarjetas');
    function alTocar(e) {
      var a = e.target.closest ? e.target.closest('[data-cd]') : null;
      if (!a) return;
      e.preventDefault();
      var id = a.getAttribute('data-cd');
      if (ABIERTA === id) cerrar(); else abrir(id, true);
    }
    tarjetas.addEventListener('click', alTocar);
    tarjetas.addEventListener('keydown', function (e) { if (e.key === ' ') alTocar(e); });
    raiz.querySelector('#cd-detalle').addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-cerrar]')) cerrar();
    });
    return true;
  }

  var RBClimaDetalle = { barraHtml: barraHtml, montar: montar, abrir: abrir, cerrar: cerrar, elegir: elegir, abierta: function () { return ABIERTA; },
    detalleDe: detalleDe, curvaHtml: curvaHtml, buscar: buscar, PUERTO: PUERTO, TX: TX, KMH: KMH };
  if (typeof window !== 'undefined') window.RBClimaDetalle = RBClimaDetalle;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBClimaDetalle;
})();
