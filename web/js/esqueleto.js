/* Esqueleto de carga (#96): bloques grises con el tamaño aproximado de cada pantalla a 360 px,
   para que la página no salte cuando llegan los datos. Los bloques son decorativos (aria-hidden);
   el lector de pantalla oye solo el texto "Cargando…". Sin animación si el usuario pide menos movimiento (CSS). */
(function () {
  'use strict';
  // Alturas en px medidas en el navegador a 360 px (2026-11-15) con los datos reales.
  var FORMAS = {
    inicio: [['esq-hero', 386], ['esq-linea', 32], ['esq-tarjeta', 280], ['esq-tarjeta', 180], ['esq-tarjeta', 180], ['esq-tarjeta', 180]],
    mapa: [['esq-linea', 31], ['esq-texto', 50], ['esq-chips', 96], ['esq-mapa', 320], ['esq-texto', 47], ['esq-tarjeta', 220]],
    ficha: [['esq-linea', 44], ['esq-chips', 96], ['esq-linea', 31], ['esq-texto', 38], ['esq-tarjeta', 201], ['esq-tarjeta', 157], ['esq-tarjeta', 260]],
    acciones: [['esq-linea', 31], ['esq-tarjeta', 619], ['esq-tarjeta', 331]],
    agricola: [['esq-hero', 260], ['esq-mapa', 420], ['esq-tarjeta', 180], ['esq-tarjeta', 180]]
  };

  function html(sec, texto) {
    var f = FORMAS[sec] || FORMAS.inicio;
    var b = f.map(function (x) { return '<div class="esq-b ' + x[0] + '" style="height:' + x[1] + 'px"></div>'; }).join('');
    return '<div class="esq esq-' + (FORMAS[sec] ? sec : 'inicio') + '" role="status" aria-busy="true">' +
      '<span class="sr">' + String(texto).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }) + '</span>' +
      '<div aria-hidden="true">' + b + '</div></div>';
  }

  var RBEsq = { html: html, FORMAS: FORMAS };
  if (typeof window !== 'undefined') window.RBEsq = RBEsq;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBEsq;
})();
