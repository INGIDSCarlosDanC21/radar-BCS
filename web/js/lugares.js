/* "Cómo ha cambiado cada lugar" (pantalla Clima; decisión de Carlos, 2026-11-15): el mapa de zonas ahora vive en Clima.
   Calor del aire y lluvia por localidad (38 lugares de BCS, NASA POWER por celda de ~50 km; data/localidades_tendencias.json)
   y agua como dato regional (GRACE no se puede repartir por lugar). Vegetación y calor del suelo siguen siendo las 6 zonas de La Paz (app.js).
   Solo muestra qué cambió, no por qué; sin cifra donde no hay cambio claro (regla 1 y 2 de AGENTS.md). ES5, sin build. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var t = T.t;
  var Z = (typeof window !== 'undefined' && window.RBZonas) || null;
  var BCS = [[22.7, -115.3], [28.1, -109.2]];
  var ZOOM_TODOS = 8;   // con menos zoom se muestra un lugar por celda de POWER para que no se encimen

  var TX = {
    es: {
      'lug.h': 'Cómo ha cambiado cada lugar',
      'lug.lead': 'Elige qué quieres ver. Calor del aire y lluvia: 38 lugares de Baja California Sur, de 2001 a 2025. Vegetación y calor del suelo: 6 zonas dentro de La Paz.',
      'lug.chips': 'Qué ver en el mapa',
      'lug.calor': 'Calor del aire', 'lug.lluvia': 'Lluvia', 'lug.vegetacion': 'Vegetación (La Paz)', 'lug.suelo': 'Calor del suelo (La Paz)', 'lug.agua': 'Agua',
      'lug.calor.que': 'Cuánto cambió la temperatura del aire (a 2 m) de 2001 a 2025 en cada lugar. Naranja: subió.',
      'lug.lluvia.que': 'Cuántos milímetros cambió el total de lluvia de un año entre 2001 y 2025. Azul: llueve más. Solo hay cifra donde el cambio es claro; en los demás lugares no se detecta cambio.',
      'lug.tituloCalor': 'Lugares: calor del aire', 'lug.tituloLluvia': 'Lugares: lluvia',
      'lug.celdas': 'NASA POWER mide celdas de unos 50 km. Los {n} lugares caen en {c} celdas: los lugares de una misma celda muestran la misma cifra, porque comparten el dato.',
      'lug.comparte': 'Misma celda que: {l}.',
      'lug.clara': 'Cambio claro', 'lug.sinCambio': 'No se detecta cambio claro',
      'lug.leySube': 'sube', 'lug.leyBaja': 'baja', 'lug.leySin': 'sin cambio claro',
      'lug.region': 'Mapa de Baja California Sur con la tendencia de cada lugar',
      'lug.mas': 'Ver los {n} lugares', 'lug.top': 'Más cambio',
      'lug.cerca': '{l} queda a {d} km de {c}: ',
      'lug.lejos': '{l} queda fuera de la cobertura: el lugar más cercano con dato está a {d} km.',
      'lug.limite': 'Dato de reanálisis de ~50 km: dice la región, no la calle ni el barrio.',
      'lug.fuenteCalor': 'Fuente: NASA POWER Monthly (MERRA-2), temperatura del aire a 2 m (T2M), 2001-2025; Mann-Kendall estacional y pendiente de Sen. Coordenadas: GeoNames (CC BY 4.0).',
      'lug.fuenteLluvia': 'Fuente: NASA POWER Monthly (MERRA-2), precipitación corregida (PRECTOTCORR), total anual 2001-2025; Mann-Kendall y pendiente de Sen. Coordenadas: GeoNames (CC BY 4.0).',
      'lug.aguaH': 'Agua: solo hay dato de la región',
      'lug.aguaTxt': 'El satélite GRACE mide cientos de kilómetros a la vez, así que no se puede repartir por lugar. En toda la región, el agua almacenada (suelo, agua superficial y acuíferos juntos) cambió {c} entre 2002 y 2026. No es el acuífero de La Paz.',
      'lug.aguaVer': 'Ver la ficha del agua',
      'lug.aguaFuente': 'Fuente: NASA GRACE y GRACE-FO (JPL Mascon), tendencia regional.',
      'lug.sinArchivo': 'No se pudieron cargar los lugares. Prueba más tarde.'
    },
    en: {
      'lug.h': 'How each place has changed',
      'lug.lead': 'Choose what to see. Air heat and rainfall: 38 places in Baja California Sur, 2001 to 2025. Vegetation and ground heat: 6 zones inside La Paz.',
      'lug.chips': 'What to see on the map',
      'lug.calor': 'Air heat', 'lug.lluvia': 'Rainfall', 'lug.vegetacion': 'Vegetation (La Paz)', 'lug.suelo': 'Ground heat (La Paz)', 'lug.agua': 'Water',
      'lug.calor.que': 'How much the air temperature (at 2 m) changed from 2001 to 2025 in each place. Orange: it rose.',
      'lug.lluvia.que': 'How many millimeters the total rainfall of one year changed between 2001 and 2025. Blue: more rain. There is a figure only where the change is clear; in the other places no change is detected.',
      'lug.tituloCalor': 'Places: air heat', 'lug.tituloLluvia': 'Places: rainfall',
      'lug.celdas': 'NASA POWER measures cells of about 50 km. The {n} places fall in {c} cells: places in the same cell show the same figure because they share the data.',
      'lug.comparte': 'Same cell as: {l}.',
      'lug.clara': 'Clear change', 'lug.sinCambio': 'No clear change detected',
      'lug.leySube': 'rises', 'lug.leyBaja': 'falls', 'lug.leySin': 'no clear change',
      'lug.region': 'Map of Baja California Sur with the trend of each place',
      'lug.mas': 'See all {n} places', 'lug.top': 'Most change',
      'lug.cerca': '{l} is {d} km from {c}: ',
      'lug.lejos': '{l} is outside the coverage: the nearest place with data is {d} km away.',
      'lug.limite': 'Reanalysis data of ~50 km: it describes the region, not the street or the neighborhood.',
      'lug.fuenteCalor': 'Source: NASA POWER Monthly (MERRA-2), air temperature at 2 m (T2M), 2001-2025; seasonal Mann-Kendall and Sen’s slope. Coordinates: GeoNames (CC BY 4.0).',
      'lug.fuenteLluvia': 'Source: NASA POWER Monthly (MERRA-2), corrected precipitation (PRECTOTCORR), annual total 2001-2025; Mann-Kendall and Sen’s slope. Coordinates: GeoNames (CC BY 4.0).',
      'lug.aguaH': 'Water: only regional data exists',
      'lug.aguaTxt': 'The GRACE satellite measures hundreds of kilometers at once, so it cannot be split by place. Across the whole region, stored water (soil, surface water and aquifers together) changed {c} between 2002 and 2026. It is not the La Paz aquifer.',
      'lug.aguaVer': 'See the water details',
      'lug.aguaFuente': 'Source: NASA GRACE and GRACE-FO (JPL Mascon), regional trend.',
      'lug.sinArchivo': 'The places could not be loaded. Try again later.'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nombre(l) { return T.lang() === 'en' && l.nombre_en ? l.nombre_en : l.nombre; }
  function fmt(v, un) {
    var n = Math.abs(v), s = n.toLocaleString(T.locale(), { maximumFractionDigits: un === 'mm/año' ? 0 : un === 'cm' ? 1 : 2 });
    return (v > 0 ? '+' : v < 0 ? '−' : '') + s + ' ' + (un === 'mm/año' ? 'mm' : un);   // lluvia: milímetros de diferencia en el total de un año
  }
  /* Texto de una localidad para un indicador ('calor' o 'lluvia'). */
  function cifra(l, id) {
    var c = l[id];
    return c.cambio_total != null && c.significativo ? fmt(c.cambio_total, c.unidades) : t('lug.sinCambio');
  }
  /* Estado del pin: 'sin' si el cambio no es claro (aunque no haya cifra: no es lo mismo que "sin dato"), 'sube' o 'baja' con cambio claro. */
  function estadoLugar(c) {
    if (!c || c.significativo == null) return 'nodato';
    if (!c.significativo || c.cambio_total == null || c.cambio_total === 0) return 'sin';
    return c.cambio_total > 0 ? 'sube' : 'baja';
  }
  function distKm(a, b, c, d) {
    var R = 6371, rad = Math.PI / 180, dLa = (c - a) * rad, dLo = (d - b) * rad;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  /* Lugar con dato más cercano a un punto: {l, km}. */
  function cercano(locs, lat, lon) {
    var best = null;
    locs.forEach(function (l) { var d = distKm(lat, lon, l.lat, l.lon); if (!best || d < best.km) best = { l: l, km: d }; });
    return best;
  }
  /* Un lugar por celda de POWER (el primero de la lista, que va de más a menos habitado): para el zoom lejano. */
  function representantes(locs) {
    var visto = {}, out = {};
    locs.forEach(function (l) { var k = l.celda.join(','); if (!visto[k]) { visto[k] = 1; out[l.id] = true; } });
    return out;
  }
  var PAL = { neg: [31, 95, 153], pos: [180, 56, 15], mid: [242, 240, 235] };
  function mezcla(a, b, f) { return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); }).join(',') + ')'; }
  /* Calor: sube = naranja. Lluvia: sube = azul (más lluvia), baja = naranja. */
  function color(v, m, id) {
    if (v == null) return '#9aa0a6';
    if (!m) return mezcla(PAL.mid, PAL.mid, 0);
    var f = 0.15 + 0.85 * Math.min(Math.abs(v) / m, 1);
    var haciaNaranja = id === 'lluvia' ? v < 0 : v > 0;
    return mezcla(PAL.mid, haciaNaranja ? PAL.pos : PAL.neg, f);
  }

  /* Pinta el mapa y las listas de un indicador por localidad, o el panel regional del agua.
     ctx: { id, locs (localidades_tendencias.json), agua (indicador del agua), alPin(marker) }. Devuelve { mapa, enfocar }. */
  function render(ctx) {
    var id = ctx.id, DOC = function (x) { return document.getElementById(x); };
    var caja = DOC('mapa-caja'), aviso = DOC('aviso-mapa'), ley = DOC('leyenda'), res = DOC('resumen'), fte = DOC('fuente-mapa');
    var mapa = null, pin = null;
    if (id === 'agua') {
      var ag = ctx.agua, c = ag && ag.cambio_total != null ? fmt(ag.cambio_total, ag.unidades || 'cm') : t('lug.sinCambio');
      caja.hidden = true; ley.innerHTML = '';
      res.innerHTML = '<div class="aviso lug-agua"><h2>' + esc(t('lug.aguaH')) + '</h2><p>' + esc(t('lug.aguaTxt', { c: c })) + '</p>' +
        '<p><a href="#ficha/agua">' + esc(t('lug.aguaVer')) + '</a></p></div>';
      fte.textContent = t('lug.aguaFuente') + t('mapa.pieBase');
      return { mapa: null, enfocar: null };
    }
    var locs = ctx.locs.localidades, esCalor = id === 'calor';
    var m = 0;
    locs.forEach(function (l) { var c2 = l[id]; if (c2.cambio_total != null && c2.significativo) m = Math.max(m, Math.abs(c2.cambio_total)); });
    var rep = representantes(locs), marcas = [];
    if (typeof L === 'undefined') { aviso.innerHTML = '<p class="aviso">' + esc(t('mapa.sinMapa')) + '</p>'; caja.hidden = true; }
    else {
      try {
        mapa = L.map(caja, { scrollWheelZoom: false, minZoom: 5, maxZoom: 11 });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(mapa);
        mapa.fitBounds(BCS);
        locs.forEach(function (l) {
          var c2 = l[id], est = estadoLugar(c2);
          var col = c2.cambio_total != null && c2.significativo ? color(c2.cambio_total, m, id) : '#9aa0a6';
          var etq = nombre(l) + ' (' + l.municipio + '): ' + cifra(l, id);
          var mk = L.marker([l.lat, l.lon], { icon: L.divIcon({ className: 'zb-wrap', html: Z ? Z.marcadorHtml(est, id, col, etq) : '', iconSize: [32, 32], iconAnchor: [16, 16] }),
            title: etq, keyboard: true, zIndexOffset: 500 });
          var comp = l.comparte_celda_con.length ? '<br>' + esc(t('lug.comparte', { l: l.comparte_celda_con.map(function (x) { var o = locs.filter(function (y) { return y.id === x; })[0]; return o ? nombre(o) : x; }).join(', ') })) : '';
          mk.bindPopup('<strong>' + esc(nombre(l)) + '</strong> · ' + esc(l.municipio) + '<br>' + esc(t(esCalor ? 'lug.tituloCalor' : 'lug.tituloLluvia')) + ': ' + esc(cifra(l, id)) + comp);
          marcas.push({ id: l.id, mk: mk });
        });
        var actualizar = function () {
          var todos = mapa.getZoom() >= ZOOM_TODOS;
          marcas.forEach(function (o) { var on = todos || rep[o.id]; if (on && !mapa.hasLayer(o.mk)) o.mk.addTo(mapa); else if (!on && mapa.hasLayer(o.mk)) mapa.removeLayer(o.mk); });
        };
        mapa.on('zoomend', actualizar); actualizar();
      } catch (e) { aviso.innerHTML = '<p class="aviso">' + esc(t('mapa.errorMapa')) + '</p>'; caja.hidden = true; mapa = null; }
    }
    var h = '';
    if (m) [-1, -0.5, 0, 0.5, 1].forEach(function (q) { var v = q * m; h += '<span><i style="background:' + color(v, m, id) + '"></i>' + esc(fmt(v, esCalor ? '°C' : 'mm/año')) + '</span>'; });
    h += '<span><i class="sincambio"></i>' + esc(t('lug.leySin')) + '</span>';
    ley.innerHTML = h;

    var orden = locs.slice().sort(function (a, b) {
      var ca = a[id], cb = b[id], sa = !(ca.cambio_total != null && ca.significativo), sb = !(cb.cambio_total != null && cb.significativo);
      if (sa !== sb) return sa ? 1 : -1;
      return Math.abs(cb.cambio_total || 0) - Math.abs(ca.cambio_total || 0);
    });
    function fila(l) {
      var c2 = l[id], claro = c2.cambio_total != null && c2.significativo;
      return '<li><strong>' + esc(nombre(l)) + '</strong> <span class="fuente">(' + esc(l.municipio) + ')</span>: ' + (claro ? '<span' + (esCalor && window.RB ? ' class="' + window.RB.clase(c2.cambio_total) + '"' : '') + '>' + esc(cifra(l, id)) + '</span> — ' + esc(t('lug.clara')) : esc(cifra(l, id))) + '</li>';
    }
    var r = '<h2>' + esc(t(esCalor ? 'lug.tituloCalor' : 'lug.tituloLluvia')) + '</h2><p>' + esc(t(esCalor ? 'lug.calor.que' : 'lug.lluvia.que')) + '</p>' +
      '<p class="nota-limite">' + esc(t('lug.celdas', { n: locs.length, c: ctx.locs.celdas_distintas })) + '</p><ol class="top">' + orden.slice(0, 8).map(fila).join('') + '</ol>' +
      '<details class="lug-mas"><summary>' + esc(t('lug.mas', { n: locs.length })) + '</summary><ol class="top" start="9">' + orden.slice(8).map(fila).join('') + '</ol></details>';
    res.innerHTML = r;
    fte.textContent = t(esCalor ? 'lug.fuenteCalor' : 'lug.fuenteLluvia') + t('mapa.pieBase');

    /* Búsqueda: pin en el lugar y la cifra del lugar con dato más cercano. */
    function enfocar(lat, lon, nom) {
      var cr = cercano(locs, lat, lon), card = DOC('zb-tarjeta');
      if (mapa && typeof L !== 'undefined') {
        if (pin) pin.remove();
        pin = L.marker([lat, lon], { icon: L.divIcon({ className: 'zb-wrap', html: '<span class="zb-ubic" role="img" aria-label="' + esc(nom) + '"></span>', iconSize: [28, 36], iconAnchor: [14, 36] }), zIndexOffset: 1000, keyboard: false }).addTo(mapa);
        if (ctx.alPin) ctx.alPin(pin);
        mapa.setView([lat, lon], cr && cr.km < 100 ? 9 : 7);
      }
      var x = '<button type="button" class="zb-x" data-zb-x="1">' + esc(t('zb.cerrar')) + '</button>';
      if (!cr || cr.km > 100) x += '<h3>' + esc(t('lug.lejos', { l: nom, d: cr ? Math.round(cr.km) : '—' })) + '</h3>';
      else x += '<h3>' + esc(t('lug.cerca', { l: nom, d: Math.round(cr.km), c: nombre(cr.l) })) + esc(cifra(cr.l, id)) + '</h3><p class="fuente">' + esc(t(esCalor ? 'lug.fuenteCalor' : 'lug.fuenteLluvia')) + '</p>';
      x += '<p class="fuente">' + esc(t('lug.limite')) + '</p>';
      card.innerHTML = x; card.hidden = false;
    }
    return { mapa: mapa, enfocar: enfocar };
  }

  var RBLugares = { render: render, estadoLugar: estadoLugar, cercano: cercano, representantes: representantes, distKm: distKm, color: color, cifra: cifra, fmt: fmt, TX: TX };
  if (typeof window !== 'undefined') window.RBLugares = RBLugares;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBLugares;
})();
