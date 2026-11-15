/* Menú de la web: SUPERIOR de texto en escritorio (>= 1024 px) e INFERIOR con iconos en celular (< 1024 px), con "Más" para no pasar de 5.
   Los dos menús comparten estas rutas; CSS (menu.css) decide cuál se ve. Aquí: textos de las pestañas nuevas, la hoja "Más" y su estado. ES5, sin build. */
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

  /* Secciones que viven dentro de "Más" en celular. */
  /* Las fichas ya no tienen pestaña: se abren desde las tarjetas de Inicio (pedido de UI/UX, 2026-11-15). */
  var EN_MAS = ['agricola', 'acciones', 'avisos'];
  function seccionDe(hash) {
    var h = String(hash || '#inicio').slice(1).split('/')[0];
    return ['inicio', 'ficha', 'acciones', 'agricola', 'pesca', 'avisos', 'clima'].indexOf(h) >= 0 ? h : 'inicio';
  }
  function enMas(sec) { return EN_MAS.indexOf(sec) >= 0; }

  function iniciar(doc) {
    var boton = doc.getElementById('mas-btn'), hoja = doc.getElementById('mas');
    if (!boton || !hoja) return;
    function abrir(si) {
      hoja.hidden = !si;
      boton.setAttribute('aria-expanded', String(!!si));
    }
    function actual() {
      var sec = seccionDe(doc.defaultView ? doc.defaultView.location.hash : '#inicio');
      if (enMas(sec)) boton.setAttribute('aria-current', 'page'); else boton.removeAttribute('aria-current');
    }
    boton.addEventListener('click', function (ev) { ev.stopPropagation(); abrir(hoja.hidden); });
    hoja.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('a')) abrir(false); });
    doc.addEventListener('click', function (ev) { if (!hoja.hidden && !(ev.target.closest && ev.target.closest('#mas, #mas-btn'))) abrir(false); });
    doc.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !hoja.hidden) { abrir(false); boton.focus(); } });
    if (doc.defaultView) doc.defaultView.addEventListener('hashchange', function () { abrir(false); actual(); });
    actual();
  }

  var RBMenu = { seccionDe: seccionDe, enMas: enMas, iniciar: iniciar, EN_MAS: EN_MAS, TX: TX };
  if (typeof window !== 'undefined') {
    window.RBMenu = RBMenu;
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { iniciar(document); });
      else iniciar(document);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = RBMenu;
})();
