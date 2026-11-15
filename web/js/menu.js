/* Menú de la web: SUPERIOR de texto en escritorio (>= 1024 px) e INFERIOR con iconos en celular (< 1024 px): Clima · Pesca · Inicio (al centro) · Agro · Avisos.
   Los dos menús comparten estas rutas; CSS (menu.css) decide cuál se ve. Aquí: textos de las pestañas y la tabla de rutas. ES5, sin build. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var t = T.t;
  var TX = {
    es: { 'nav.clima': 'Clima', 'titulo.clima': 'Mapa meteorológico', 'nav.pesca': 'Pesca', 'nav.avisos': 'Avisos', 'nav.mas': 'Más', 'titulo.pesca': 'Mapa Pesquero', 'titulo.avisos': 'Avisos y alertas', 'menu.masAria': 'Más secciones', 'menu.secMovil': 'Secciones principales' },
    en: { 'nav.clima': 'Weather', 'titulo.clima': 'Weather Map', 'nav.pesca': 'Fishing', 'nav.avisos': 'Alerts', 'nav.mas': 'More', 'titulo.pesca': 'Fishing Map', 'titulo.avisos': 'Alerts and warnings', 'menu.masAria': 'More sections', 'menu.secMovil': 'Main sections' }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  /* Las fichas ya no tienen pestaña: se abren desde las tarjetas de Inicio (pedido de UI/UX, 2026-11-15). */
  var EN_MAS = [];   // vacío a propósito: ya no hay hoja "Más" (las 5 secciones caben en la barra); se conserva para las pruebas
  function seccionDe(hash) {
    var h = String(hash || '#inicio').slice(1).split('/')[0];
    return ['inicio', 'ficha', 'agricola', 'pesca', 'avisos', 'clima'].indexOf(h) >= 0 ? h : 'inicio';
  }
  function enMas(sec) { return EN_MAS.indexOf(sec) >= 0; }

  var RBMenu = { seccionDe: seccionDe, enMas: enMas, EN_MAS: EN_MAS, TX: TX };
  if (typeof window !== 'undefined') {
    window.RBMenu = RBMenu;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = RBMenu;
})();
