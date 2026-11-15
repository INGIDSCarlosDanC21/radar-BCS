/* "¿Qué puedo hacer?" (decisión de Carlos, 2026-11-15): Acciones ya no es una pantalla de solo texto; vive al final de Clima, con una tarjeta por consejo
   (ícono, título corto y la frase de siempre). Los consejos son los mismos de textos.js (acc.c1 a acc.c6 y acc.a1 a acc.a4), de CDC y EPA WaterSense:
   no se agrega ninguno nuevo. ES5, sin build. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var t = T.t;
  var URL_CDC = 'https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf';
  var URL_EPA = 'https://www.epa.gov/watersense/start-saving';

  var TX = {
    es: {
      'acc.kicker': 'Consejos de CDC y EPA',
      'acc.lead': 'Seis cosas contra el calor y cuatro para cuidar el agua. Toca cualquiera para leerla completa.',
      'acc.t.c1': 'Ropa clara y sombrero', 'acc.t.c2': 'Lo fresco del día', 'acc.t.c3': 'Aire o lugar fresco',
      'acc.t.c4': 'Ventilador, con cuidado', 'acc.t.c5': 'Refréscate', 'acc.t.c6': 'Toma agua',
      'acc.t.a1': 'Cierra la llave', 'acc.t.a2': 'Lava el carro con cubeta', 'acc.t.a3': 'Barre, no mangueres', 'acc.t.a4': 'Revisa tuberías',
      'acc.fCdc': 'CDC, Five Steps (Heat Action Plan)', 'acc.fEpa': 'EPA WaterSense, Start Saving'
    },
    en: {
      'acc.kicker': 'Advice from the CDC and EPA',
      'acc.lead': 'Six things against the heat and four to save water. Tap any of them to read it in full.',
      'acc.t.c1': 'Light clothes and a hat', 'acc.t.c2': 'The cool part of the day', 'acc.t.c3': 'Air conditioning or a cool place',
      'acc.t.c4': 'Fans, with care', 'acc.t.c5': 'Cool off', 'acc.t.c6': 'Drink water',
      'acc.t.a1': 'Turn off the tap', 'acc.t.a2': 'Wash the car with a bucket', 'acc.t.a3': 'Sweep, don’t hose', 'acc.t.a4': 'Check your plumbing',
      'acc.fCdc': 'CDC, Five Steps (Heat Action Plan)', 'acc.fEpa': 'EPA WaterSense, Start Saving'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  /* Íconos de Material Symbols (Apache-2.0, web/assets/iconos/mapa), uno por consejo. */
  var CALOR = [['c1', 'checkroom'], ['c2', 'schedule'], ['c3', 'ac_unit'], ['c4', 'mode_fan'], ['c5', 'shower'], ['c6', 'local_drink']];
  var AGUA = [['a1', 'faucet'], ['a2', 'local_car_wash'], ['a3', 'cleaning_services'], ['a4', 'plumbing']];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n) { return '<span class="ac-ic" style="-webkit-mask-image:url(assets/iconos/mapa/' + n + '.svg);mask-image:url(assets/iconos/mapa/' + n + '.svg)" aria-hidden="true"></span>'; }
  function tarjeta(par) {
    var k = par[0], tipo = k.charAt(0);
    return '<li class="ac-card ac-' + (tipo === 'c' ? 'calor' : 'agua') + '"><details><summary><span class="ac-badge">' + ic(par[1]) + '</span><span class="ac-t">' + esc(t('acc.t.' + k)) + '</span></summary>' +
      '<p>' + esc(t('acc.' + k)) + '</p></details></li>';
  }
  function grupo(clase, icono, titulo, lista, url, fuente) {
    return '<div class="ac-grupo ac-g-' + clase + '"><h3><span class="ac-badge ac-badge-g">' + ic(icono) + '</span>' + esc(titulo) + '</h3>' +
      '<ul class="ac-lista">' + lista.map(tarjeta).join('') + '</ul>' +
      '<p class="fuente">' + esc(t('fic.fuente')) + ': <a href="' + url + '" target="_blank" rel="noopener">' + esc(fuente) + '</a></p></div>';
  }
  function html() {
    return '<section class="bloque ac" id="acciones" aria-labelledby="ac-h"><p class="hm-mono ac-kicker">' + esc(t('acc.kicker')) + '</p>' +
      '<h2 id="ac-h">' + esc(t('acc.h1')) + '</h2><p class="ac-lead">' + esc(t('acc.lead')) + '</p>' +
      grupo('calor', 'thermostat', t('acc.calor'), CALOR, URL_CDC, t('acc.fCdc')) +
      grupo('agua', 'water_drop', t('acc.agua'), AGUA, URL_EPA, t('acc.fEpa')) +
      '<p class="aviso">' + esc(t('acc.aviso')) + '</p></section>';
  }

  var RBAcciones = { html: html, CALOR: CALOR, AGUA: AGUA, TX: TX };
  if (typeof window !== 'undefined') window.RBAcciones = RBAcciones;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBAcciones;
})();
