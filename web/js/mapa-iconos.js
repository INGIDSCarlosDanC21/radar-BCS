/* Mapa de iconos reutilizable (Pesca; después puede usarlo Inicio). ES5, sin build.
   Un mapa Leaflet con base oscura, pines que llevan ícono + valor, y una capa opcional de satélite (NASA GIBS).
   Sin gráficas, sin tablas, sin tarjetas largas: todo el detalle va fuera del mapa. */
(function () {
  'use strict';
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  /* Máscara CSS del SVG (mismo método que cielo.js): el color lo pone la web. */
  function icono(nombre, clase) {
    var u = 'url(assets/iconos/mapa/' + nombre + '.svg)';
    return '<span class="mi-ic' + (clase ? ' ' + clase : '') + '" style="-webkit-mask-image:' + u + ';mask-image:' + u + '" aria-hidden="true"></span>';
  }
  /* HTML de un pin: un botón con ícono y valor. etiqueta: texto accesible. tono: verde|amarillo|rojo|neutro. */
  function htmlPin(p) {
    return '<button type="button" class="mi-pin mi-' + esc(p.tono || 'neutro') + (p.activo ? ' mi-activo' : '') + '" data-id="' + esc(p.id) + '" aria-label="' + esc(p.etiqueta) + '"' +
      (p.activo ? ' aria-current="true"' : '') + '>' + icono(p.icono) + '<span class="mi-val">' + esc(p.valor) + '</span></button>';
  }

  /* crear(el, {centro, zoom, alElegir(id), alError()}) -> {pines(lista), capa(url, atribucion), destruir()} o null si no hay Leaflet. */
  function crear(el, opc) {
    if (typeof L === 'undefined') return null;
    var mapa = L.map(el, { scrollWheelZoom: false, minZoom: opc.minZoom || 6, maxZoom: opc.maxZoom || 9, maxBounds: opc.limites || null, maxBoundsViscosity: 1, zoomControl: true, zoomSnap: 0.5 })
      .setView(opc.centro, opc.zoom);
    // Si se pasa `ajustar`, el mapa se encuadra solo para que quepan todos los pines (con margen para el tamaño del pin).
    if (opc.ajustar) mapa.fitBounds(opc.ajustar, { padding: opc.margen || [56, 56] });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, className: 'mi-base', attribution: '© OpenStreetMap contributors' }).addTo(mapa);
    var marcas = {}, capaActual = null, fallos = 0;
    function clic(ev) {
      var b = ev.target.closest ? ev.target.closest('.mi-pin') : null;
      if (b && opc.alElegir) opc.alElegir(b.getAttribute('data-id'));
    }
    el.addEventListener('click', clic);
    return {
      mapa: mapa,
      pines: function (lista) {
        var vivos = {};
        lista.forEach(function (p) {
          vivos[p.id] = true;
          var icon = L.divIcon({ className: 'mi-caja', iconSize: null, html: htmlPin(p) });
          if (marcas[p.id]) { marcas[p.id].setIcon(icon); marcas[p.id].setZIndexOffset(p.activo ? 1000 : 0); }
          else marcas[p.id] = L.marker([p.lat, p.lon], { icon: icon, keyboard: false, zIndexOffset: p.activo ? 1000 : 0 }).addTo(mapa);
        });
        Object.keys(marcas).forEach(function (id) { if (!vivos[id]) { mapa.removeLayer(marcas[id]); delete marcas[id]; } });
      },
      capa: function (url, atribucion) {
        if (capaActual) { mapa.removeLayer(capaActual); capaActual = null; }
        if (!url) return;
        fallos = 0;
        capaActual = L.tileLayer(url, { maxNativeZoom: 7, maxZoom: opc.maxZoom || 9, opacity: 0.85, attribution: atribucion || '' });
        capaActual.on('tileerror', function () { fallos++; if (fallos === 4 && opc.alError) opc.alError(); });
        capaActual.addTo(mapa);
      },
      destruir: function () { el.removeEventListener('click', clic); try { mapa.remove(); } catch (e) { /* ya quitado */ } }
    };
  }

  var RBMapaIconos = { crear: crear, icono: icono, htmlPin: htmlPin };
  if (typeof window !== 'undefined') window.RBMapaIconos = RBMapaIconos;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBMapaIconos;
})();
