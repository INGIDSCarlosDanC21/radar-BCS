/* Mapa de zonas: marcadores con ícono y búsqueda de un lugar (rama prog-b/mapa-iconos). ES5, sin build.
   - Cada zona de zonas.geojson es un píxel MODIS de 1 km: el polígono es la huella del dato y se conserva. Encima va un
     marcador en el centro con el ícono del estado: sube / baja / sin cambio claro / sin datos.
   - Búsqueda: Nominatim (OpenStreetMap, © OpenStreetMap contributors, ODbL) devuelve la coordenada y aquí se calcula
     en qué polígono cae (punto en polígono). Lo más fino que se puede decir es la zona de 1 km, no la calle.
   - Sin autocompletar: solo se busca al enviar (política de uso de Nominatim, máx. 1 petición por segundo).
   Funciones puras donde se puede, para probarlas sin navegador. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  function t(k, v) { return T.t(k, v); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  var TX = {
    es: {
      'zb.etiqueta': 'Buscar una ubicación en La Paz', 'zb.ph': 'Colonia, C.P. o calle', 'zb.buscar': 'Buscar', 'zb.loc': 'Mi ubicación',
      'zb.cargando': 'Buscando…', 'zb.sinRes': 'No encontramos ese lugar. Prueba con la colonia o la calle.',
      'zb.error': 'No pudimos buscar ahora. Revisa tu conexión.', 'zb.locError': 'No pudimos obtener tu ubicación (permiso o señal).',
      'zb.res1': '1 resultado', 'zb.resN': '{n} resultados', 'zb.zona': 'Zona {z}', 'zb.tuUbic': 'Tu ubicación',
      'zb.en': '{l} está en la zona {z}.', 'zb.fuera': '{l} queda fuera de las zonas con dato: solo cubrimos 6 píxeles de 1 km en La Paz.',
      'zb.sinDato': 'Esta zona no tiene dato para este indicador.', 'zb.limite': 'El dato más fino es un píxel de 1 km: dice la zona, no la calle.',
      'zb.privacidad': 'Lo que escribes se envía a Nominatim (OpenStreetMap) para ubicar el lugar.',
      'zb.sube': 'sube', 'zb.baja': 'baja', 'zb.sin': 'sin cambio claro', 'zb.nodato': 'sin datos', 'zb.verZona': 'Zona {z}: {v}',
      'zb.cerrar': 'Quitar', 'zb.leyenda': 'Marcadores'
    },
    en: {
      'zb.etiqueta': 'Search a place in La Paz', 'zb.ph': 'Neighborhood, ZIP or street', 'zb.buscar': 'Search', 'zb.loc': 'My location',
      'zb.cargando': 'Searching…', 'zb.sinRes': "We couldn't find that place. Try the neighborhood or the street.",
      'zb.error': "We couldn't search right now. Check your connection.", 'zb.locError': "We couldn't get your location (permission or signal).",
      'zb.res1': '1 result', 'zb.resN': '{n} results', 'zb.zona': 'Zone {z}', 'zb.tuUbic': 'Your location',
      'zb.en': '{l} is in the {z} zone.', 'zb.fuera': '{l} is outside the zones with data: we only cover 6 pixels of 1 km in La Paz.',
      'zb.sinDato': 'This zone has no data for this indicator.', 'zb.limite': 'The finest data is a 1 km pixel: it tells the zone, not the street.',
      'zb.privacidad': 'What you type is sent to Nominatim (OpenStreetMap) to locate the place.',
      'zb.sube': 'up', 'zb.baja': 'down', 'zb.sin': 'no clear change', 'zb.nodato': 'no data', 'zb.verZona': 'Zone {z}: {v}',
      'zb.cerrar': 'Remove', 'zb.leyenda': 'Markers'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  /* Centro del polígono: promedio de los vértices sin repetir el que cierra. [lat, lon]. */
  function centroide(anillo) {
    var n = anillo.length;
    if (n > 1 && anillo[0][0] === anillo[n - 1][0] && anillo[0][1] === anillo[n - 1][1]) n--;
    var la = 0, lo = 0;
    for (var i = 0; i < n; i++) { lo += anillo[i][0]; la += anillo[i][1]; }
    return [la / n, lo / n];
  }
  /* Punto en polígono por trazado de rayo. El anillo viene como GeoJSON: [lon, lat]. */
  function dentro(lat, lon, anillo) {
    var r = false;
    for (var i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      var xi = anillo[i][0], yi = anillo[i][1], xj = anillo[j][0], yj = anillo[j][1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) r = !r;
    }
    return r;
  }
  function zonaEn(zonas, lat, lon) {
    var fs = (zonas && zonas.features) || [];
    for (var i = 0; i < fs.length; i++) if (dentro(lat, lon, fs[i].geometry.coordinates[0])) return fs[i];
    return null;
  }

  /* Estado de una zona en una capa: sube, baja, sin (sin cambio claro) o nodato. */
  function estado(c) {
    if (!c || c.cambio_total == null) return 'nodato';
    if (c.significativo === false || c.cambio_total === 0) return 'sin';
    return c.cambio_total > 0 ? 'sube' : 'baja';
  }
  /* Glifo de Material Symbols (web/assets/iconos/mapa) por capa y estado; sin glifo = símbolo de texto con CSS. */
  var GLIFO = { calor: { sube: 'local_fire_department', baja: 'ac_unit' }, vegetacion: { sube: 'grass', baja: 'grass' }, lluvia: { sube: 'water_drop', baja: 'water_drop' } };
  function glifo(capa, est) { return GLIFO[capa] && GLIFO[capa][est] ? GLIFO[capa][est] : null; }

  /* HTML del marcador. color = el mismo del relleno del polígono; etiqueta = texto para lector de pantalla. */
  function marcadorHtml(est, capa, color, etiqueta, mini) {
    var g = glifo(capa, est);
    return '<span class="zb-pin zb-' + est + (mini ? ' zb-mini' : '') + '" role="img" aria-label="' + esc(etiqueta) + '" style="--zb-c:' + esc(color) + '">' +
      (g ? '<span class="zb-ico" style="-webkit-mask-image:url(assets/iconos/mapa/' + g + '.svg);mask-image:url(assets/iconos/mapa/' + g + '.svg)"></span>' : '<span class="zb-sim" aria-hidden="true"></span>') +
      '<span class="zb-flecha" aria-hidden="true"></span></span>';
  }

  /* Coincidencias por nombre de zona, sin importar tildes ni mayúsculas. */
  function sinTildes(s) { var m = String(s).toLowerCase(); return m.normalize ? m.normalize('NFD').replace(/[̀-ͯ]/g, '') : m; }
  function zonasPorNombre(zonas, q, nombre) {
    var n = sinTildes(String(q || '').trim());
    if (!n) return [];
    return ((zonas && zonas.features) || []).filter(function (f) { return sinTildes(nombre(f)).indexOf(n) >= 0; });
  }

  /* Nominatim: la consulta se limita a Baja California Sur, México. Devuelve [{nombre, lat, lon}]. */
  var NOMINATIM = 'https://nominatim.openstreetmap.org/search';
  function urlBusqueda(q, idioma) {
    return NOMINATIM + '?format=jsonv2&limit=5&countrycodes=mx&addressdetails=0&accept-language=' + (idioma === 'en' ? 'en' : 'es') +
      '&q=' + encodeURIComponent(String(q).trim() + ', Baja California Sur');
  }
  function interpreta(resp) {
    var a = Object.prototype.toString.call(resp) === '[object Array]' ? resp : [];
    return a.map(function (r) {
      var lat = parseFloat(r.lat), lon = parseFloat(r.lon);
      return { nombre: String(r.display_name || r.name || '').split(',').slice(0, 3).join(',').trim(), lat: lat, lon: lon };
    }).filter(function (r) { return isFinite(r.lat) && isFinite(r.lon) && r.nombre; });
  }
  var CACHE = {};
  function buscar(q, opc) {
    opc = opc || {};
    var clave = String(q).trim().toLowerCase();
    if (!clave) return Promise.resolve([]);
    if (CACHE[clave]) return Promise.resolve(CACHE[clave]);
    var f = opc.fetch || (typeof fetch !== 'undefined' ? fetch.bind(typeof window !== 'undefined' ? window : undefined) : null);
    if (!f) return Promise.reject(new Error('sin fetch'));
    return f(urlBusqueda(q, T.lang ? T.lang() : 'es')).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) { var res = interpreta(j); CACHE[clave] = res; return res; });
  }

  var RBZonas = { centroide: centroide, dentro: dentro, zonaEn: zonaEn, estado: estado, glifo: glifo, marcadorHtml: marcadorHtml,
    zonasPorNombre: zonasPorNombre, urlBusqueda: urlBusqueda, interpreta: interpreta, buscar: buscar, TX: TX, GLIFO: GLIFO };
  if (typeof window !== 'undefined') window.RBZonas = RBZonas;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBZonas;
})();
