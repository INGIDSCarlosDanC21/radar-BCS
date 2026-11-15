(function () {
  'use strict';
  var main = document.getElementById('contenido');
  var DATOS = null, ZONAS = null, LOCS = null, mapa = null, indMapa = 'calor';
  var capasZona = {}, capaZonas = null, pinBusqueda = null, enfocarFn = null; // marcadores y búsqueda del mapa de zonas
  var IDS = ['calor', 'lluvia', 'vegetacion', 'suelo', 'agua'];   // 'suelo' = calor del suelo (MODIS, 6 zonas de La Paz): usa la clave 'calor' de zonas.geojson

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var num = RB.num, dec = RB.dec, pTexto = RB.pTexto, signo = RB.signo, clase = RB.clase;
  // Idioma (issue #93): t() textos de la interfaz; D(obj, campo) usa campo_en en inglés.
  var T = window.RBT, t = T.t, D = T.d, U = T.unidad;
  function tit(i) { return D(i, 'titulo'); }
  function etiqueta(s) {
    if (s === true) return [t('et.clara'), 'si'];
    if (s === false) return [t('et.noClara'), ''];
    return [t('et.sinCalcular'), ''];
  }
  function ind(id) {
    return DATOS.indicadores.filter(function (i) { return i.id === id; })[0];
  }
  function sig(i) { return i.significancia ? i.significancia.significativo : null; }

  function ok(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  function cargar() {
    return Promise.all([
      fetch('data/indicadores.json').then(ok),
      fetch('data/zonas.geojson').then(ok),
      fetch('data/localidades_tendencias.json').then(ok).catch(function () { return null; })   // opcional: sin él, Calor y Lluvia caen a las 6 zonas
    ]).then(function (r) { DATOS = r[0]; ZONAS = r[1]; LOCS = r[2]; });
  }
  function franja(sec) {
    var f = document.getElementById('franja');
    f.hidden = !RB.mostrarFranja(DATOS, ZONAS, sec);
    f.textContent = (DATOS && DATOS.datos_de_prueba === true) ? t('franja.datos')
      : t('franja.mapa');
  }

  /* ---------- Inicio ---------- */
  function inicio() {
    var h = '<h1>Radar BCS</h1><p class="lead">' + t('ini.lead') + '</p><div class="tarjetas">';
    DATOS.indicadores.forEach(function (i) {
      var e = etiqueta(sig(i)), c = RB.textoCambio(i);
      h += '<a class="tarjeta" href="#ficha/' + esc(i.id) + '"><h2>' + esc(tit(i)) + '</h2>' +
        '<div class="cifra ' + c.clase + '">' + esc(c.texto) + '</div>' +
        ((i.id === 'calor' || i.id === 'agua') && c.tipo !== 'sin-datos' && i.limitacion ? '<p class="nota-limite"><strong>' + t('gen.limite') + '</strong> ' + esc(i.id === 'agua' ? D(i, 'limitacion').split('. ')[0] + '.' : D(i, 'limitacion')) + '</p>' : '') +
        '<p class="fuente">' + esc(t('gen.periodo', { p: (i.fuente && i.fuente.periodo) || t('reg.pendiente') })) + '</p>' +
        '<span class="etiqueta ' + e[1] + '">' + e[0] + '</span>' +
        '<p class="fuente">' + esc(t('gen.fuente', { f: RB.textoFuente(i) })) + '</p>' +
        (c.tipo === 'sin-datos' && i.limitacion ? '<p class="fuente">' + esc(D(i, 'limitacion')) + '</p>' : '') + '</a>';
    });
    main.innerHTML = h + '</div><p class="aviso">' + t('aviso.causa') + '</p>' +
      (DATOS.generado ? '<p class="fuente">' + esc(t('gen.fecha', { f: DATOS.generado })) + '</p>' : '');
  }

  /* ---------- Mapa ---------- */
  var PAL = { neg: [31, 95, 153], pos: [180, 56, 15], mid: [242, 240, 235] };
  function mezcla(a, b, t) {
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * t); }).join(',') + ')';
  }
  function maxAbs(id) {
    var m = 0;
    ZONAS.features.forEach(function (f) {
      var c = f.properties.cambios[id];
      if (c && c.cambio_total != null) m = Math.max(m, Math.abs(c.cambio_total));
    });
    return m;
  }
  function color(v, m) {
    if (v == null) return '#9aa0a6';
    if (!m) return mezcla(PAL.mid, PAL.mid, 0);
    var t = Math.min(Math.abs(v) / m, 1);
    return mezcla(PAL.mid, v < 0 ? PAL.neg : PAL.pos, 0.15 + 0.85 * t);
  }

  /* "Cómo ha cambiado cada lugar": vive dentro de la pantalla Clima (la pestaña Mapa ya no existe). Se vuelve a pintar solo este bloque al cambiar de capa. */
  function mapaVista(cont) {
    if (mapa) { try { mapa.remove(); } catch (e) {} mapa = null; }
    var h = '<h2>' + t('lug.h') + '</h2><p class="lead">' + t('lug.lead') + '</p><div class="chips" role="group" aria-label="' + t('lug.chips') + '">';
    IDS.forEach(function (id) {
      h += '<button type="button" class="chip" data-ind="' + id + '" aria-pressed="' + (id === indMapa) + '">' + esc(t('lug.' + id)) + '</button>';
    });
    h += '</div>' + buscadorHtml() + '<div id="aviso-mapa"></div><div id="mapa-caja" role="region" aria-label="' + t(LOCS && (indMapa === 'calor' || indMapa === 'lluvia') ? 'lug.region' : 'mapa.region') + '"></div>' +
      '<div id="leyenda" class="leyenda"></div><div id="resumen"></div>' +
      '<p class="fuente" id="fuente-mapa"></p>';
    cont.innerHTML = h;
    cont.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () { indMapa = b.getAttribute('data-ind'); mapaVista(cont); });
    });
    pintar();
    bindBusqueda();
  }

  /* Búsqueda de un lugar sobre el mapa de zonas (zonas-busqueda.js). */
  function buscadorHtml() {
    if (!window.RBZonas) return '';
    return '<form class="zb-form" id="zb-form" role="search"><label class="sr" for="zb-q">' + esc(t('zb.etiqueta')) + '</label>' +
      '<input id="zb-q" type="search" autocomplete="off" placeholder="' + esc(t('zb.ph')) + '">' +
      '<button type="submit" class="zb-ir">' + t('zb.buscar') + '</button>' +
      (navigator.geolocation ? '<button type="button" class="zb-loc" id="zb-loc"><img src="assets/iconos/mapa/my_location.svg" alt="" width="20" height="20"> ' + t('zb.loc') + '</button>' : '') +
      '</form><p class="fuente zb-priv">' + t('zb.privacidad') + '</p><ul id="zb-res" class="zb-res" hidden></ul><p id="zb-msg" class="zb-msg" role="status" aria-live="polite"></p>' +
      '<div id="zb-tarjeta" class="zb-tarjeta" hidden></div>';
  }
  function bindBusqueda() {
    var form = document.getElementById('zb-form');
    if (!form || !window.RBZonas) return;
    var q = document.getElementById('zb-q'), res = document.getElementById('zb-res'), msg = document.getElementById('zb-msg'), card = document.getElementById('zb-tarjeta');
    var lista = [];
    function elegir(it) {
      res.hidden = true; q.value = it.etiqueta; msg.textContent = '';
      if (enfocarFn) enfocarFn(it.lat, it.lon, it.nombre || it.etiqueta, it.zona);
    }
    function mostrar(l) {
      lista = l;
      res.innerHTML = l.map(function (x, k) { return '<li><button type="button" class="zb-op" data-k="' + k + '">' + esc(x.etiqueta) + '</button></li>'; }).join('');
      res.hidden = !l.length;
      msg.textContent = l.length === 1 ? t('zb.res1') : t('zb.resN', { n: l.length });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = q.value.trim();
      if (!v) return;
      var locales = RBZonas.zonasPorNombre(ZONAS, v, function (f) { return D(f.properties, 'nombre'); }).map(function (f) {
        var cen = RBZonas.centroide(f.geometry.coordinates[0]);
        return { etiqueta: t('zb.zona', { z: D(f.properties, 'nombre') }), lat: cen[0], lon: cen[1], zona: f };
      });
      msg.textContent = t('zb.cargando'); res.hidden = true;
      RBZonas.buscar(v).then(function (r) {
        var l = locales.concat(r.map(function (x) { return { etiqueta: x.nombre, lat: x.lat, lon: x.lon }; }));
        if (!l.length) { msg.textContent = t('zb.sinRes'); return; }
        if (l.length === 1) elegir(l[0]); else mostrar(l);
      }, function () {
        if (locales.length) mostrar(locales); else msg.textContent = t('zb.error');
      });
    });
    res.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-k]') : null;
      if (b) elegir(lista[+b.getAttribute('data-k')]);
    });
    card.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-zb-x]')) {
        card.hidden = true; card.innerHTML = '';
        if (pinBusqueda) { pinBusqueda.remove(); pinBusqueda = null; }
        q.focus();
      }
    });
    var loc = document.getElementById('zb-loc');
    if (loc) loc.addEventListener('click', function () {
      msg.textContent = t('zb.cargando');
      navigator.geolocation.getCurrentPosition(function (p) {
        msg.textContent = '';
        if (enfocarFn) enfocarFn(p.coords.latitude, p.coords.longitude, t('zb.tuUbic'), null);
      }, function () { msg.textContent = t('zb.locError'); }, { timeout: 10000 });
    });
  }

  /* Qué mide cada capa por zona (MODIS vía AppEEARS). nota: aviso junto al mapa y la lista.
     Calor por zona: superficie Terra 2001-2021, solo orientativa (opción B, decisiones.md 2026-11-15):
     la ficha de calor es la del aire, así que el periodo sale de zonas.geojson y no se dice "tendencia clara". */
  var CAPA_ZONA = {
    calor: { que: t('mapa.calor.que'), fuente: t('mapa.calor.fuente'), nota: t('mapa.calor.nota'), titulo: t('mapa.calor.tit'), orientativo: true, periodoZonas: true },
    vegetacion: { que: t('mapa.veg.que'), fuente: t('mapa.veg.fuente') }
  };

  /* Periodo de la capa: cada producto llega a su propio año (calor 2001-2021, NDVI 2001-2026);
     el periodo global de zonas.geojson es el de calor, así que se toma el de la ficha. */
  function periodoCapa(i, cfg) {
    if (cfg && cfg.periodoZonas && ZONAS.periodo) return ZONAS.periodo.inicio + '–' + ZONAS.periodo.fin;
    var p = i.fuente && i.fuente.periodo;
    if (p) return p.replace('-', '–');
    return ZONAS.periodo ? ZONAS.periodo.inicio + '–' + ZONAS.periodo.fin : t('mapa.periodoPend');
  }

  function pintar() {
    // Calor del aire y lluvia por localidad (lugares.js) y agua como dato regional; el resto son las 6 zonas de La Paz.
    if (window.RBLugares && (indMapa === 'agua' || (LOCS && (indMapa === 'calor' || indMapa === 'lluvia')))) {
      var rr = window.RBLugares.render({ id: indMapa, locs: LOCS, agua: ind('agua'), alPin: function (m) { pinBusqueda = m; } });
      mapa = rr.mapa; enfocarFn = rr.enfocar; capasZona = {}; capaZonas = null; pinBusqueda = null;
      return;
    }
    var id = indMapa === 'suelo' ? 'calor' : indMapa, i = ind(id), un = i.unidades;
    var esPrueba = ZONAS.datos_de_prueba === true, prueba = esPrueba ? t('mapa.datoPrueba') : '';
    var cfg = esPrueba ? null : CAPA_ZONA[id];
    function cz(f) { return f.properties.cambios[id]; }
    var m = 0;
    ZONAS.features.forEach(function (f) { var c = cz(f); if (c && c.cambio_total != null && c.significativo !== false) m = Math.max(m, Math.abs(c.cambio_total)); });
    function zonaTexto(c) { return c.significativo === false ? t('reg.sinCambio') : signo(c.cambio_total, un); }
    // Capa orientativa (calor): nunca "tendencia clara"; la nota va arriba de la lista.
    function zonaEtiqueta(c) { return cfg && cfg.orientativo ? t('mapa.orient') : etiqueta(c.significativo === undefined ? null : c.significativo)[0]; }
    // Real: todas las zonas con dato, primero las de tendencia clara. Prueba: top 5 con cifra.
    var lista = ZONAS.features.filter(function (f) {
      var c = cz(f); return c && c.cambio_total != null && (!esPrueba || c.significativo !== false);
    }).sort(function (a, b) {
      var ca = cz(a), cb = cz(b), sa = ca.significativo === false, sb = cb.significativo === false;
      if (sa !== sb) return sa ? 1 : -1;
      return Math.abs(cb.cambio_total) - Math.abs(ca.cambio_total);
    }).slice(0, esPrueba ? 5 : undefined);
    var puesto = {};
    lista.forEach(function (f, k) { puesto[f.properties.id] = k + 1; });
    var caja = document.getElementById('mapa-caja');
    if (typeof L === 'undefined') {
      document.getElementById('aviso-mapa').innerHTML = '<p class="aviso">' + t('mapa.sinMapa') + '</p>';
      caja.hidden = true;
    } else {
      try {
        mapa = L.map(caja, { scrollWheelZoom: false }).setView([24.125, -110.315], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);
        capasZona = {}; pinBusqueda = null;
        var capa = L.geoJSON(ZONAS, {
          style: function (f) {
            var c = cz(f);
            var v = c ? c.cambio_total : null;
            var fill = (c && c.significativo === false && v != null) ? mezcla(PAL.mid, PAL.mid, 0) : color(v, m);
            return { color: '#333', weight: 1, fillOpacity: 0.75, fillColor: fill, dashArray: v == null ? '4 3' : null };
          },
          onEachFeature: function (f, l) {
            var c = cz(f) || {};
            capasZona[f.properties.id] = l;
            l.bindPopup('<strong>' + esc(D(f.properties, 'nombre')) + '</strong>' + prueba + '<br>' + esc(tit(i)) + ': ' +
              esc(zonaTexto(c)) + '<br>' + esc(zonaEtiqueta(c)));
            if (puesto[f.properties.id]) l.bindTooltip(String(puesto[f.properties.id]), { permanent: true, direction: 'top', offset: [0, -14], className: 'etq-zona' });
          }
        }).addTo(mapa);
        mapa.fitBounds(capa.getBounds());
        capaZonas = capa;
        // Marcador con ícono en el centro de cada zona (el polígono sigue siendo la huella del píxel de 1 km).
        if (window.RBZonas && ZONAS.features.some(function (f) { return RBZonas.estado(cz(f)) !== 'nodato'; })) {
          ZONAS.features.forEach(function (f) {
            var c = cz(f), est = RBZonas.estado(c), cen = RBZonas.centroide(f.geometry.coordinates[0]);
            var col = (c && c.cambio_total != null && c.significativo !== false) ? color(c.cambio_total, m) : '#9aa0a6';
            var etq = D(f.properties, 'nombre') + ': ' + t('zb.' + est) + (est === 'sube' || est === 'baja' ? ', ' + zonaTexto(c) : '');
            L.marker(cen, { icon: L.divIcon({ className: 'zb-wrap', html: RBZonas.marcadorHtml(est, id, col, etq), iconSize: [32, 32], iconAnchor: [16, 16] }),
              title: etq, keyboard: true, zIndexOffset: 500 }).addTo(mapa).on('click', function () { if (capasZona[f.properties.id]) capasZona[f.properties.id].openPopup(cen); });
          });
        }
      } catch (e) {
        document.getElementById('aviso-mapa').innerHTML = '<p class="aviso">' + t('mapa.errorMapa') + '</p>';
        caja.hidden = true;
      }
    }
    var ley = '';
    if (m) {
      [-1, -0.5, 0, 0.5, 1].forEach(function (q) {
        var v = q * m;
        ley += '<span><i style="background:' + color(v, m) + '"></i>' + esc(signo(v, un)) + '</span>';
      });
    }
    if (ZONAS.features.some(function (f) { var c = cz(f); return c && c.cambio_total != null && c.significativo === false; }))
      ley += '<span><i class="sincambio"></i>' + t('mapa.leySinCambio') + '</span>';
    ley += '<span><i class="sindatos"></i>' + t('mapa.leySinDatos') + '</span>';
    if (window.RBZonas && ZONAS.features.some(function (f) { return RBZonas.estado(cz(f)) !== 'nodato'; })) {
      ley += '<span class="zb-ley"><b>' + t('zb.leyenda') + ':</b></span>';
      ['sube', 'baja', 'sin', 'nodato'].forEach(function (e) {
        ley += '<span>' + RBZonas.marcadorHtml(e, id, e === 'sube' ? 'rgb(180,56,15)' : e === 'baja' ? 'rgb(31,95,153)' : '#9aa0a6', t('zb.' + e), true) + ' ' + t('zb.' + e) + '</span>';
      });
    }
    document.getElementById('leyenda').innerHTML = ley;

    /* Búsqueda: pone el pin, acerca el mapa y dice en qué zona cae el lugar y cuánto cambió (cifra, periodo y fuente de la capa). */
    enfocarFn = function (lat, lon, nombre, forzada) {
      var f = forzada || (window.RBZonas ? RBZonas.zonaEn(ZONAS, lat, lon) : null), c = f ? cz(f) : null;
      if (mapa && typeof L !== 'undefined') {
        if (pinBusqueda) pinBusqueda.remove();
        pinBusqueda = L.marker([lat, lon], { icon: L.divIcon({ className: 'zb-wrap', html: '<span class="zb-ubic" role="img" aria-label="' + esc(nombre) + '"></span>', iconSize: [28, 36], iconAnchor: [14, 36] }),
          zIndexOffset: 1000, keyboard: false }).addTo(mapa);
        if (forzada && capasZona[forzada.properties.id]) mapa.fitBounds(capasZona[forzada.properties.id].getBounds(), { maxZoom: 14, padding: [30, 30] });
        else if (f) mapa.setView([lat, lon], 14);
        else if (capaZonas) mapa.fitBounds(capaZonas.getBounds().extend([lat, lon]), { maxZoom: 14, padding: [30, 30] });
      }
      var h = '<button type="button" class="zb-x" data-zb-x="1">' + t('zb.cerrar') + '</button>';
      if (!f) h += '<h3>' + esc(t('zb.fuera', { l: nombre })) + '</h3>';
      else {
        h += '<h3>' + esc(forzada ? nombre : t('zb.en', { l: nombre, z: D(f.properties, 'nombre') })) + '</h3>';
        if (c && c.cambio_total != null) {
          h += '<p class="zb-cifra">' + esc(tit(i)) + ': <span class="' + clase(c.cambio_total) + '">' + esc(zonaTexto(c)) + '</span> — ' + esc(zonaEtiqueta(c)) + '</p>' +
            '<p class="fuente">' + esc(periodoCapa(i, cfg)) + (cfg ? ' · ' + esc(t('gen.fuente', { f: cfg.fuente })) : '') + '</p>';
        } else h += '<p>' + esc(t('zb.sinDato')) + '</p>';
      }
      h += '<p class="fuente">' + esc(t('zb.limite')) + '</p>';
      var card = document.getElementById('zb-tarjeta');
      card.innerHTML = h; card.hidden = false;
      var form = document.getElementById('zb-form');
      if (form && form.scrollIntoView) form.scrollIntoView({ block: 'start' }); // deja a la vista la tarjeta y el mapa con el pin
    };

    var hayClaro = lista.some(function (f) { return cz(f).significativo === true; });
    var r = '<h2>' + (cfg && cfg.titulo ? esc(cfg.titulo) : (esPrueba ? t('mapa.hPrueba') : hayClaro ? t('mapa.hMas') : t('mapa.hZonas')) + esc(tit(i))) + '</h2>';
    if (cfg) r += '<p>' + esc(cfg.que) + '</p>';
    if (cfg && cfg.nota && lista.length) r += '<p class="nota-limite">' + esc(cfg.nota) + '</p>';
    if (!lista.length) {
      r += '<p class="aviso">' + esc(t('mapa.regional', { t: tit(i).toLowerCase() })) + '</p>';
    } else {
      if (window.RBSim) r += '<p class="fuente">' + esc(t('mapa.numeros')) + '</p>';
      r += '<ol class="top">';
      lista.forEach(function (f) {
        var c = cz(f), zt = zonaTexto(c);
        r += '<li><strong>' + esc(D(f.properties, 'nombre')) + '</strong>' + prueba + ': ' +
          (c.significativo === false ? esc(zt) : '<span class="' + clase(c.cambio_total) + '">' + esc(zt) + '</span> — ' + esc(zonaEtiqueta(c))) + '</li>';
      });
      r += '</ol>';
    }
    document.getElementById('resumen').innerHTML = r;
    var nota = ZONAS.features[0] && ZONAS.features[0].properties.nota;
    document.getElementById('fuente-mapa').textContent = (esPrueba ?
      t('mapa.piePrueba') :
      cfg ? t('gen.fuente', { f: cfg.fuente }) + ', ' + periodoCapa(i, cfg) + t('mapa.pieMetodo') : '') +
      t('mapa.pieBase');
  }

  /* ---------- Ficha ---------- */
  function grafica(i) {
    var s = (i.serie_anual || []).filter(function (p) { return p.valor != null; });
    if (s.length < 2) return '<p>' + t('fic.sinSerie') + '</p>';
    var W = 320, H = 180, L0 = 40, R = 10, T = 10, B = 28;
    var xs = s.map(function (p) { return p.anio; }), ys = s.map(function (p) { return p.valor; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if (y0 === y1) { y0 -= 1; y1 += 1; }
    var X = function (v) { return L0 + (v - x0) / (x1 - x0) * (W - L0 - R); };
    var Y = function (v) { return T + (y1 - v) / (y1 - y0) * (H - T - B); };
    var d = s.map(function (p, k) { return (k ? 'L' : 'M') + X(p.anio).toFixed(1) + ' ' + Y(p.valor).toFixed(1); }).join(' ');
    var dy = dec(y1);
    var a = s[0], z = s[s.length - 1];
    var desc = t('fic.graf', { t: tit(i), a: x0, b: x1, v1: num(a.valor, dy), v2: num(z.valor, dy), u: U(i.unidades) });
    return '<svg class="grafica" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="gt gd"><title id="gt">' + esc(t('fic.grafTit', { t: tit(i) })) + '</title><desc id="gd">' + esc(desc) + '</desc>' +
      '<line x1="' + L0 + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '" stroke="currentColor" opacity=".4"/>' +
      '<line x1="' + L0 + '" y1="' + T + '" x2="' + L0 + '" y2="' + (H - B) + '" stroke="currentColor" opacity=".4"/>' +
      '<text x="' + (L0 - 4) + '" y="' + (T + 8) + '" text-anchor="end">' + num(y1, dy) + '</text>' +
      '<text x="' + (L0 - 4) + '" y="' + (H - B) + '" text-anchor="end">' + num(y0, dy) + '</text>' +
      '<text x="' + L0 + '" y="' + (H - 10) + '">' + x0 + '</text>' +
      '<text x="' + (W - R) + '" y="' + (H - 10) + '" text-anchor="end">' + x1 + '</text>' +
      '<text x="' + ((L0 + W) / 2) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(U(i.unidades)) + '</text>' +
      '<path d="' + d + '" fill="none" stroke="var(--acento)" stroke-width="2.5" stroke-linejoin="round"/></svg>' +
      '<p class="fuente">' + esc(desc) + '</p>';
  }

  function conclusion(i) {
    var g = i.significancia || {}, p = g.p_valor, a = g.alfa;
    if (g.significativo === true && p != null && a != null) return t('fic.si', { p: p < 0.001 ? '< 0.001' : '= ' + pTexto(p, 3), a: num(a, 2) });
    if (g.significativo === false && p != null && a != null) return t('fic.no', { p: pTexto(p, 3), a: num(a, 2) });
    return t('fic.nc');
  }

  function ficha(id) {
    var i = ind(id) || ind('calor');
    var f = i.fuente || {}, tc = RB.textoCambio(i);
    // Sin chips de indicador: cada ficha se abre desde su tarjeta de Inicio. El botón regresa a "¿Qué cambia?".
    var h = '<a class="volver" href="#inicio/que-cambia">' + t('fic.volver') + '</a>';
    h += '<h1>' + RB.icono(i.id) + esc(tit(i)) + '</h1><p class="lead">' + esc(t('fic.sub.' + i.id)) + '</p><p class="fuente">' + esc(D(i, 'variable')) + '</p>';
    h += '<div class="bloque"><h2>' + esc(t('fic.desde', { a: ((i.fuente && i.fuente.periodo) || '2001').slice(0, 4) })) + '</h2><div class="grande ' + tc.clase + '">' + esc(tc.texto) + '</div>' +
      (tc.tipo === 'sin-cambio' ? '<p class="fuente">' + t('fic.sinCifra') + '</p>' :
        i.cambio_total_nota ? '<p class="fuente">' + esc(D(i, 'cambio_total_nota')) + '</p>' : '') +
      '<p>' + t('fic.porDecada') + ' <strong>' + esc(tc.tipo === 'sin-cambio' ? t('reg.sinCambio') : signo(i.tendencia_por_decada, i.unidades)) + '</strong></p></div>';
    h += '<div class="bloque"><h2>' + t('fic.media') + '</h2>';
    var dd = i.por_decada || [], mx = 0;
    dd.forEach(function (x) { if (x.media != null) mx = Math.max(mx, Math.abs(x.media)); });
    h += '<div class="barras">';
    dd.forEach(function (x) {
      var w = (x.media != null && mx) ? Math.max(Math.abs(x.media) / mx * 100, 2) : 0;
      h += '<div><span>' + esc(x.decada) + '</span><span>' + (x.media != null ? '<span class="b" style="display:block;width:' + w.toFixed(0) + '%"></span>' : '') + '</span><span>' +
        (x.media != null ? esc(num(x.media, dec(x.media)) + ' ' + U(i.unidades)) : t('reg.sinDatos')) + '</span></div>';
    });
    h += '</div></div>';
    h += (window.RBSim ? window.RBSim.maquinaHtml(i) : '');
    h += '<div class="bloque"><h2>' + t('fic.serie') + '</h2>' + grafica(i) + '</div>';
    var g = i.significancia || {};
    h += '<div class="bloque"><h2>' + t('fic.sig') + '</h2>' +
      '<p><strong>' + esc(conclusion(i)) + '</strong></p>' +
      '<details class="detalles"><summary>' + t('fic.detalles') + '</summary>' +
      '<p>' + esc(t('fic.metodo', { m: D(g, 'metodo') || t('fic.sinCalcular') })) + (RB.explicaMetodo(g.metodo) ? ' ' + esc(RB.explicaMetodo(g.metodo)) : '') + '</p>' +
      '<p>' + esc(t('fic.pAlfa', { p: g.p_valor != null ? pTexto(g.p_valor, 3) : t('fic.sinCalcular'), a: g.alfa != null ? num(g.alfa, 2) : t('fic.sinDato') })) + '</p></details></div>';
    // Menos scroll: enlace, resolución, periodo y descarga quedan en "Sobre los datos"; la fuente y la limitación siguen a la vista.
    h += '<div class="bloque"><h2>' + t('fic.fuente') + '</h2><p><strong>' + esc(RB.textoFuente(i)) + '</strong></p>' +
      '<details class="detalles"><summary>' + t('fic.sobre') + '</summary><p>' +
      (f.url ? '<a class="enlace-fuente" href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(t('fic.abrir', { h: String(f.url).replace(/^https?:\/\//, '').split('/')[0] })) + '</a><br>' : '') +
      t('fic.resol') + ' ' + esc(D(f, 'resolucion') || t('fic.sinDato')) + '<br>' + t('fic.periodo') + ' ' + esc(f.periodo || t('fic.sinDato')) + '<br>' + t('fic.descarga') + ' ' + esc(f.fecha_descarga || t('fic.sinDato')) + '</p></details>' +
      (i.limitacion ? '<p><strong>' + t('fic.limitacion') + '</strong> ' + esc(D(i, 'limitacion')) + '</p>' : '') + '</div>';
    h += '<p class="aviso">' + t('aviso.causa') + '</p>';
    main.innerHTML = h;
    if (window.RBSim) window.RBSim.maquinaActivar(main, i);
  }

  /* ---------- Acciones ---------- */
  /* ---------- Enrutador ---------- */
  function ruta() {
    // La pestaña Mapa se fusionó con Clima: los enlaces viejos (#mapa) llevan a esa sección.
    if (/^#acciones(\/|$)/.test(location.hash || '')) { try { history.replaceState(null, '', '#clima/acciones'); } catch (e) { location.hash = '#clima/acciones'; } }
    if (/^#mapa(\/|$)/.test(location.hash || '')) { try { history.replaceState(null, '', '#clima/zonas'); } catch (e) { location.hash = '#clima/zonas'; } }
    if (mapa) { try { mapa.remove(); } catch (e) {} mapa = null; }
    if (window.RBSim) window.RBSim.limpiar();
    if (window.RBPesca) window.RBPesca.limpiar();
    if (window.RBAvisos) window.RBAvisos.limpiar();
    if (window.RBClima) window.RBClima.limpiar();
    if (window.RBAnim) window.RBAnim.limpiar();
    var h = (location.hash || '#inicio').slice(1).split('/');
    var sec = ['inicio', 'ficha', 'agricola', 'pesca', 'avisos', 'clima'].indexOf(h[0]) >= 0 ? h[0] : 'inicio';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === (sec === 'ficha' ? 'inicio' : sec)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.setAttribute('data-vista', sec);
    // Pesca y Avisos traen sus propios datos en vivo y no esperan a indicadores.json.
    if (sec === 'pesca' || sec === 'avisos' || sec === 'clima') {
      var modulo = sec === 'pesca' ? window.RBPesca : sec === 'avisos' ? window.RBAvisos : window.RBClima;
      document.getElementById('franja').hidden = true;
      main.setAttribute('aria-busy', 'true');
      if (sec === 'clima' && window.RBClimaMapa) {
        // La pestaña Clima muestra el "Mapa Meteorológico" (clima-mapa.js); el detalle de cada tarjeta sigue en clima.js.
        main.innerHTML = window.RBClimaMapa.html().replace(/<h2 class="cm-zonas-h">[^]*?<\/h2>/, '');
        if (window.RBAnim) main.insertAdjacentHTML('beforeend', window.RBAnim.html());   // animación de satélite (aislada; web/js/animacion-satelite.js)
        main.insertAdjacentHTML('beforeend', '<section class="bloque lugares" id="lugares" aria-label="' + esc(t('lug.h')) + '"><p class="cargando">' + esc(t('html.cargando')) + '</p></section>' + (window.RBSim ? window.RBSim.sateliteHtml() : '') + (window.RBAcciones ? window.RBAcciones.html() : ''));
        main.removeAttribute('aria-busy');
        window.RBClimaMapa.cargar(main, { abrir: (h[1] === 'zonas' || h[1] === 'acciones') ? null : (h[1] || null), lugar: h[2] || null });
        if (window.RBAnim) window.RBAnim.activar(main);
        var lug = document.getElementById('lugares');
        if (DATOS && ZONAS) { mapaVista(lug); if (window.RBSim) window.RBSim.sateliteActivar(main); }
        if (h[1] === 'zonas' && DATOS && lug) setTimeout(function () { lug.scrollIntoView({ block: 'start' }); }, 120);
        if (h[1] === 'acciones') setTimeout(function () { var a = document.getElementById('acciones'); if (a) a.scrollIntoView({ block: 'start' }); }, 250);
      } else if (modulo) modulo.render(main, h[1] || null, h[2] || null);
      document.title = 'Radar BCS — ' + t('titulo.' + sec);
      return;
    }
    // aria-busy en <main> mientras carga (#119 D5); se quita al pintar el contenido o el error.
    if (!DATOS) { main.setAttribute('aria-busy', 'true'); if (window.RBEsq) main.innerHTML = window.RBEsq.html(sec, t('html.cargando')); return; }
    main.removeAttribute('aria-busy');
    franja(sec);
    if (sec === 'inicio') {
      if (window.RBHome) window.RBHome.render(main, DATOS); else inicio();
      if (h[1] === 'que-cambia') irAQueCambia();
    }
    else if (sec === 'ficha') ficha(h[1]);
    else if (sec === 'agricola') { agricolaVista(h[1] || null); document.title = 'Radar BCS — ' + t('titulo.agricola'); return; }
    document.title = 'Radar BCS — ' + t('titulo.' + sec);
  }

  /* ---------- Mapa Agrícola (datos en data/agricola.json) ---------- */
  var AGRO = null;
  function agricolaVista(abierta) {
    var pintar = function () { main.removeAttribute('aria-busy'); window.RBAgricola.render(main, AGRO, ZONAS, abierta, LOCS); };
    if (AGRO) return pintar();
    main.setAttribute('aria-busy', 'true');
    main.innerHTML = window.RBEsq ? window.RBEsq.html('agricola', t('agro.cargando')) : '<p class="cargando">' + t('agro.cargando') + '</p>';
    fetch('data/agricola.json').then(ok).then(function (d) { AGRO = d; pintar(); }).catch(function (e) {
      main.removeAttribute('aria-busy');
      main.innerHTML = '<div class="error" role="alert"><h2>' + t('err.agro') + '</h2><p>' + esc(t('err.detalle', { d: e.message })) + '</p></div>';
    });
  }
  var prev = null;
  /* Botón de la ficha "← Volver a las tendencias de Inicio" (#inicio/que-cambia): baja hasta "¿Qué cambia?" y le pasa el foco. */
  function irAQueCambia() {
    var q = document.getElementById('hm-h2');
    if (!q) return false;
    q.setAttribute('tabindex', '-1');
    q.scrollIntoView({ block: 'start' });
    if (q.focus) q.focus({ preventScroll: true });
    return true;
  }
  /* Accesibilidad (#119 D6). "Saltar al contenido" no cambia el hash: el enrutador lo leía como pantalla
     desconocida y mandaba a Inicio. Al cambiar de pantalla se anuncia el título y el foco va a <main>. */
  var saltar = document.querySelector('.saltar');
  if (saltar) saltar.addEventListener('click', function (ev) { ev.preventDefault(); main.focus(); });
  var anuncio = document.getElementById('anuncio');
  // aria-live en <main> leía la pantalla entera en cada cambio; con JS lo sustituye #anuncio (solo el título).
  if (anuncio) main.removeAttribute('aria-live');
  function anunciar() { if (anuncio) anuncio.textContent = document.title; }
  window.addEventListener('hashchange', function (ev) {
    // Dentro del Mapa Agrícola (abrir/cerrar ficha) no se sube al inicio: agricola.js maneja el scroll.
    var deAgro = /#agricola(\/|$)/.test(ev.oldURL || ''), aAgro = /^#agricola(\/|$)/.test(location.hash);
    ruta();
    if (location.hash === '#inicio/que-cambia' && irAQueCambia()) { anunciar(); return; }
    if (!(deAgro && aAgro)) { window.scrollTo(0, 0); anunciar(); if (main.focus) main.focus({ preventScroll: true }); }
  });
  T.aplicar(document);
  ruta(); // sin datos todavía: pinta el esqueleto de la pantalla pedida
  cargar().then(function () { ruta(); }).catch(function (e) {
    main.removeAttribute('aria-busy');
    main.innerHTML = '<div class="error" role="alert"><h2>' + t('err.datos') + '</h2><p>' + esc(t('err.detalle', { d: e.message })) +
      '</p><p>' + t('err.file') + '</p></div>';
  });
})();
