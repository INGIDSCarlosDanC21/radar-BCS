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
  var RB = { icono: icono, num: num, dec: dec, pTexto: pTexto, signo: signo, clase: clase,
    textoCambio: textoCambio, textoFuente: textoFuente, mostrarFranja: mostrarFranja, explicaMetodo: explicaMetodo,
    sinAcentos: sinAcentos, coincidencias: coincidencias, buscarNombre: buscarNombre };
  if (typeof window !== 'undefined') window.RB = RB;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})();
