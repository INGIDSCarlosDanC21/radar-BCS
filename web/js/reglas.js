(function () {
  'use strict';
  function num(n, d) {
    return n.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function dec(n) { var a = Math.abs(n); return a >= 10 ? 1 : a >= 1 ? 2 : 3; }
  function pTexto(p, d) { return p < 0.001 ? '< 0.001' : num(p, d); }
  function signo(n, un) {
    if (n == null) return 'sin datos';
    return (n > 0 ? '+' : n < 0 ? '−' : '') + num(Math.abs(n), dec(n)) + (un ? ' ' + un : '');
  }
  function clase(n) { return n > 0 ? 'sube' : n < 0 ? 'baja' : ''; }
  function textoCambio(i) {
    var s = i.significancia;
    if (s && s.significativo === false) return { texto: 'Sin cambio claro', clase: '', tipo: 'sin-cambio' };
    if (i.cambio_total == null) return { texto: 'Sin datos (pendiente)', clase: '', tipo: 'sin-datos' };
    return { texto: signo(i.cambio_total, i.unidades), clase: clase(i.cambio_total), tipo: 'cifra' };
  }
  function textoFuente(i) {
    return (i.fuente && i.fuente.dataset) || 'pendiente';
  }
  function mostrarFranja(datos, zonas, vista) {
    if (datos && datos.datos_de_prueba === true) return true;
    return vista === 'mapa' && !!zonas && zonas.datos_de_prueba === true;
  }
  // Explicación en lenguaje sencillo del método que trae cada indicador (significancia.metodo).
  // Textos según docs/investigacion/metodo.md y analisis/exportar.py.
  function explicaMetodo(metodo) {
    var m = String(metodo || '').toLowerCase();
    var sen = ' La pendiente de Sen estima cuánto cambia por año.';
    if (m.indexOf('total anual') >= 0)
      return 'Suma la lluvia de cada año y ve si esos totales suben o bajan de forma consistente. Se usa el total anual porque muchos meses no llueve nada.' + sen;
    if (m.indexOf('autocorrel') >= 0)
      return 'Compara cada mes del año con los mismos meses de otros años y ve si el dato sube o baja de forma consistente. El p-valor corrige la autocorrelación entre meses (un mes se parece al anterior), así que es más prudente.' + sen;
    if (m.indexOf('estacional') >= 0)
      return 'Compara cada mes del año con los mismos meses de otros años y ve si el dato sube o baja de forma consistente.' + sen;
    return '';
  }
  var RB = { num: num, dec: dec, pTexto: pTexto, signo: signo, clase: clase,
    textoCambio: textoCambio, textoFuente: textoFuente, mostrarFranja: mostrarFranja, explicaMetodo: explicaMetodo };
  if (typeof window !== 'undefined') window.RB = RB;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})();
