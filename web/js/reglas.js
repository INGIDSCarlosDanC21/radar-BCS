(function () {
  'use strict';
  // Textos por idioma (textos.js, issue #93). En Node se carga con require.
  var T = (typeof window !== 'undefined' && window.RBT) ||
    (typeof require !== 'undefined' ? require('./textos.js') : null);
  function num(n, d) {
    return n.toLocaleString(T.locale(), { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function dec(n) { var a = Math.abs(n); return a >= 10 ? 1 : a >= 1 ? 2 : 3; }
  function pTexto(p, d) { return p < 0.001 ? '< 0.001' : num(p, d); }
  function signo(n, un) {
    if (n == null) return T.t('reg.sinDatos');
    return (n > 0 ? '+' : n < 0 ? '−' : '') + num(Math.abs(n), dec(n)) + (un ? ' ' + T.unidad(un) : '');
  }
  function clase(n) { return n > 0 ? 'sube' : n < 0 ? 'baja' : ''; }
  function textoCambio(i) {
    var s = i.significancia;
    if (s && s.significativo === false) return { texto: T.t('reg.sinCambio'), clase: '', tipo: 'sin-cambio' };
    if (i.cambio_total == null) return { texto: T.t('reg.sinDatosPend'), clase: '', tipo: 'sin-datos' };
    return { texto: signo(i.cambio_total, i.unidades), clase: clase(i.cambio_total), tipo: 'cifra' };
  }
  function textoFuente(i) {
    return (i.fuente && T.d(i.fuente, 'dataset')) || T.t('reg.pendiente');
  }
  function mostrarFranja(datos, zonas, vista) {
    if (datos && datos.datos_de_prueba === true) return true;
    return vista === 'mapa' && !!zonas && zonas.datos_de_prueba === true;
  }
  // Explicación en lenguaje sencillo del método que trae cada indicador (significancia.metodo).
  // Textos según docs/investigacion/metodo.md y analisis/exportar.py.
  function explicaMetodo(metodo) {
    var m = String(metodo || '').toLowerCase();
    // Se compara con el método en español (significancia.metodo); el texto sale en el idioma activo.
    var sen = T.t('met.sen');
    if (m.indexOf('total anual') >= 0) return T.t('met.anual') + sen;
    if (m.indexOf('autocorrel') >= 0) return T.t('met.autocorr') + sen;
    if (m.indexOf('estacional') >= 0) return T.t('met.estacional') + sen;
    return '';
  }
  /* Íconos de sección (Material Symbols, Apache-2.0; web/assets/iconos/README.md). Decorativos: alt vacío. */
  var ICONOS = { calor: 'clima-calor-y-sensacion-termica', vegetacion: 'agricultura-factibilidad-y-cultivos',
    lluvia: 'clima-humedad-y-lluvia', agua: 'agricultura-clima-y-agua' };
  function icono(id) {
    return ICONOS[id] ? '<img class="ico" src="assets/iconos/' + ICONOS[id] + '.svg" alt="" aria-hidden="true" height="20">' : '';
  }
  /* Buscador de lugares compartido (Clima y Pesca): sin acentos, sin mayúsculas y sin espacios de sobra. Solo compara
     texto con la lista que ya está en memoria: no hace ninguna petición. nombres(x) da los nombres de cada elemento
     (por omisión [x.nombre]). Devuelve {exacto: índice o -1, parciales: [índices que contienen el texto]}. */
  function sinAcentos(s) { var x = String(s == null ? '' : s).toLowerCase().trim(); return x.normalize ? x.normalize('NFD').replace(/[̀-ͯ]/g, '') : x; }
  function coincidencias(lista, texto, nombres) {
    var q = sinAcentos(texto), r = { exacto: -1, parciales: [] };
    if (!q) return r;
    (lista || []).forEach(function (x, i) {
      var ns = (nombres ? nombres(x) : [x.nombre]).map(sinAcentos);
      if (ns.indexOf(q) >= 0) { if (r.exacto < 0) r.exacto = i; }
      else if (ns.some(function (n) { return n.indexOf(q) >= 0; })) r.parciales.push(i);
    });
    return r;
  }
  /* Índice del elemento con ese nombre exacto o, si solo uno lo contiene, ese; si no, -1. */
  function buscarNombre(lista, texto, nombres) {
    var r = coincidencias(lista, texto, nombres);
    return r.exacto >= 0 ? r.exacto : r.parciales.length === 1 ? r.parciales[0] : -1;
  }
  /* Campo de fecha compartido (Clima y Pesca), hora de La Paz. Open-Meteo Forecast acepta de ~3 meses atrás a 16 días
     adelante (medido el 2026-11-15: "allowed range from 2026-08-14 to 2026-11-30"); se ofrece de hoy − 92 a hoy + 15. */
  var DIAS_ATRAS = 92, DIAS_ADELANTE = 15;
  function hoyISO(ahora) {
    var d = ahora || new Date();
    try { return d.toLocaleDateString('en-CA', { timeZone: 'America/Mazatlan' }); } catch (e) { return d.toISOString().slice(0, 10); }
  }
  function sumarDias(iso, n) {
    var p = String(iso).split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n, 12));
    return d.toISOString().slice(0, 10);
  }
  function rangoFechas(ahora) { var h = hoyISO(ahora); return { min: sumarDias(h, -DIAS_ATRAS), max: sumarDias(h, DIAS_ADELANTE), hoy: h }; }
  function fechaTexto(iso) {
    var p = String(iso).split('-');
    try { return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)).toLocaleDateString(T.locale ? T.locale() : 'es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
    catch (e) { return iso; }
  }
  /* <div class="cm-campo"> con su <label> y un <input type="date"> limitado al rango (mismo estilo en Clima y Pesca). */
  function campoFecha(id, etiqueta, r, valor) {
    var e = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    return '<div class="cm-campo"><label for="' + e(id) + '">' + e(etiqueta) + '</label><input id="' + e(id) + '" type="date" min="' + r.min + '" max="' + r.max + '" value="' + (valor || r.hoy) + '"></div>';
  }
  var RB = { icono: icono, num: num, dec: dec, pTexto: pTexto, signo: signo, clase: clase,
    textoCambio: textoCambio, textoFuente: textoFuente, mostrarFranja: mostrarFranja, explicaMetodo: explicaMetodo,
    sinAcentos: sinAcentos, coincidencias: coincidencias, buscarNombre: buscarNombre,
    DIAS_ATRAS: DIAS_ATRAS, DIAS_ADELANTE: DIAS_ADELANTE, hoyISO: hoyISO, sumarDias: sumarDias, rangoFechas: rangoFechas, fechaTexto: fechaTexto, campoFecha: campoFecha };
  if (typeof window !== 'undefined') window.RB = RB;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})();
