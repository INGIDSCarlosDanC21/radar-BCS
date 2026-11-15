(function () {
  'use strict';
  var main = document.getElementById('contenido');
  var DATOS = null, ZONAS = null, mapa = null, indMapa = 'calor';
  var IDS = ['calor', 'vegetacion', 'lluvia', 'agua'];

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
      fetch('data/zonas.geojson').then(ok)
    ]).then(function (r) { DATOS = r[0]; ZONAS = r[1]; });
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

  function mapaVista() {
    var h = '<h1>' + t('titulo.mapa') + '</h1><p class="lead">' + t('mapa.lead') + '</p><div class="chips" role="group" aria-label="' + t('mapa.grupo') + '">';
    IDS.forEach(function (id) {
      h += '<button type="button" class="chip" data-ind="' + id + '" aria-pressed="' + (id === indMapa) + '">' + esc(tit(ind(id))) + '</button>';
    });
    h += '</div><div id="aviso-mapa"></div><div id="mapa-caja" role="region" aria-label="' + t('mapa.region') + '"></div>' +
      '<div id="leyenda" class="leyenda"></div><div id="resumen"></div>' +
      '<p class="fuente" id="fuente-mapa"></p>';
    main.innerHTML = h;
    main.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () { indMapa = b.getAttribute('data-ind'); ruta(); });
    });
    pintar();
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
    var id = indMapa, i = ind(id), un = i.unidades;
    var esPrueba = ZONAS.datos_de_prueba === true, prueba = esPrueba ? t('mapa.datoPrueba') : '';
    var cfg = esPrueba ? null : CAPA_ZONA[id];
    function cz(f) { return f.properties.cambios[id]; }
    var m = 0;
    ZONAS.features.forEach(function (f) { var c = cz(f); if (c && c.cambio_total != null && c.significativo !== false) m = Math.max(m, Math.abs(c.cambio_total)); });
    function zonaTexto(c) { return c.significativo === false ? t('reg.sinCambio') : signo(c.cambio_total, un); }
    // Capa orientativa (calor): nunca "tendencia clara"; la nota va arriba de la lista.
    function zonaEtiqueta(c) { return cfg && cfg.orientativo ? t('mapa.orient') : etiqueta(c.significativo === undefined ? null : c.significativo)[0]; }
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
        var capa = L.geoJSON(ZONAS, {
          style: function (f) {
            var c = cz(f);
            var v = c ? c.cambio_total : null;
            var fill = (c && c.significativo === false && v != null) ? mezcla(PAL.mid, PAL.mid, 0) : color(v, m);
            return { color: '#333', weight: 1, fillOpacity: 0.75, fillColor: fill, dashArray: v == null ? '4 3' : null };
          },
          onEachFeature: function (f, l) {
            var c = cz(f) || {};
            l.bindPopup('<strong>' + esc(D(f.properties, 'nombre')) + '</strong>' + prueba + '<br>' + esc(tit(i)) + ': ' +
              esc(zonaTexto(c)) + '<br>' + esc(zonaEtiqueta(c)));
          }
        }).addTo(mapa);
        mapa.fitBounds(capa.getBounds());
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
    document.getElementById('leyenda').innerHTML = ley;

    // Real: todas las zonas con dato, primero las de tendencia clara. Prueba: top 5 con cifra.
    var lista = ZONAS.features.filter(function (f) {
      var c = cz(f); return c && c.cambio_total != null && (!esPrueba || c.significativo !== false);
    }).sort(function (a, b) {
      var ca = cz(a), cb = cz(b), sa = ca.significativo === false, sb = cb.significativo === false;
      if (sa !== sb) return sa ? 1 : -1;
      return Math.abs(cb.cambio_total) - Math.abs(ca.cambio_total);
    }).slice(0, esPrueba ? 5 : undefined);
    var hayClaro = lista.some(function (f) { return cz(f).significativo === true; });
    var r = '<h2>' + (cfg && cfg.titulo ? esc(cfg.titulo) : (esPrueba ? t('mapa.hPrueba') : hayClaro ? t('mapa.hMas') : t('mapa.hZonas')) + esc(tit(i))) + '</h2>';
    if (cfg) r += '<p>' + esc(cfg.que) + '</p>';
    if (cfg && cfg.nota && lista.length) r += '<p class="nota-limite">' + esc(cfg.nota) + '</p>';
    if (!lista.length) {
      r += '<p class="aviso">' + esc(t('mapa.regional', { t: tit(i).toLowerCase() })) + '</p>';
    } else {
      r += '<ol class="top">';
      lista.forEach(function (f) {
        var c = cz(f), zt = zonaTexto(c);
        r += '<li><strong>' + esc(D(f.properties, 'nombre')) + '</strong>' + prueba + ': ' +
          (c.significativo === false ? esc(zt) : '<span class="' + clase(c.cambio_total) + '">' + esc(zt) + '</span> — ' + esc(zonaEtiqueta(c))) + '</li>';
      });
      r += '</ol>';
    }
    r += '<p><a href="#ficha/' + esc(id) + '">' + esc(t('mapa.verFicha', { t: tit(i).toLowerCase() })) + '</a></p>';
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
    var h = '<a class="volver" href="#inicio">' + t('fic.volver') + '</a><div class="pestanas" role="group" aria-label="' + t('mapa.grupo') + '">';
    IDS.forEach(function (k) {
      h += '<a class="chip" style="display:inline-flex;align-items:center;text-decoration:none" href="#ficha/' + k + '"' + (k === i.id ? ' aria-current="page"' : '') + '>' + esc(tit(ind(k))) + '</a>';
    });
    h += '</div><h1>' + esc(tit(i)) + '</h1><p class="fuente">' + esc(D(i, 'variable')) + '</p>';
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
    h += '<div class="bloque"><h2>' + t('fic.serie') + '</h2>' + grafica(i) + '</div>';
    var g = i.significancia || {};
    h += '<div class="bloque"><h2>' + t('fic.sig') + '</h2>' +
      '<p><strong>' + esc(conclusion(i)) + '</strong></p>' +
      '<p>' + esc(t('fic.metodo', { m: D(g, 'metodo') || t('fic.sinCalcular') })) + (RB.explicaMetodo(g.metodo) ? ' ' + esc(RB.explicaMetodo(g.metodo)) : '') + '</p>' +
      '<p>' + esc(t('fic.pAlfa', { p: g.p_valor != null ? pTexto(g.p_valor, 3) : t('fic.sinCalcular'), a: g.alfa != null ? num(g.alfa, 2) : t('fic.sinDato') })) + '</p></div>';
    h += '<div class="bloque"><h2>' + t('fic.fuente') + '</h2><p><strong>' + esc(RB.textoFuente(i)) + '</strong></p><p>' +
      (f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.url) + '</a><br>' : '') +
      t('fic.resol') + ' ' + esc(D(f, 'resolucion') || t('fic.sinDato')) + '<br>' + t('fic.periodo') + ' ' + esc(f.periodo || t('fic.sinDato')) + '<br>' + t('fic.descarga') + ' ' + esc(f.fecha_descarga || t('fic.sinDato')) + '</p>' +
      (i.limitacion ? '<p><strong>' + t('fic.limitacion') + '</strong> ' + esc(D(i, 'limitacion')) + '</p>' : '') + '</div>';
    h += '<p class="aviso">' + t('aviso.causa') + '</p>';
    main.innerHTML = h;
  }

  /* ---------- Acciones ---------- */
  function acciones() {
    function sec(tt, items, url, nom) {
      return '<div class="bloque"><h2>' + tt + '</h2><ul>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') +
        '</ul><p class="fuente">' + t('fic.fuente') + ': <a href="' + url + '" target="_blank" rel="noopener">' + nom + '</a></p></div>';
    }
    function ks(p, n) { var r = []; for (var k = 1; k <= n; k++) r.push(esc(t(p + k))); return r; }
    main.innerHTML = '<h1>' + t('acc.h1') + '</h1>' +
      sec(t('acc.calor'), ks('acc.c', 6), 'https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf', 'CDC, Five Steps (Heat Action Plan)') +
      sec(t('acc.agua'), ks('acc.a', 4), 'https://www.epa.gov/watersense/start-saving', 'EPA WaterSense, Start Saving') +
      '<p class="aviso">' + t('acc.aviso') + '</p>';
  }

  /* ---------- Enrutador ---------- */
  function ruta() {
    if (mapa) { try { mapa.remove(); } catch (e) {} mapa = null; }
    var h = (location.hash || '#inicio').slice(1).split('/');
    var sec = ['inicio', 'mapa', 'ficha', 'acciones', 'agricola'].indexOf(h[0]) >= 0 ? h[0] : 'inicio';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === sec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.setAttribute('data-vista', sec);
    if (!DATOS) return;
    franja(sec);
    if (sec === 'inicio') { if (window.RBHome) window.RBHome.render(main, DATOS); else inicio(); }
    else if (sec === 'mapa') mapaVista();
    else if (sec === 'ficha') ficha(h[1]);
    else if (sec === 'agricola') { agricolaVista(h[1] || null); document.title = 'Radar BCS — ' + t('titulo.agricola'); return; }
    else acciones();
    document.title = 'Radar BCS — ' + t('titulo.' + sec);
  }

  /* ---------- Mapa Agrícola (datos en data/agricola.json) ---------- */
  var AGRO = null;
  function agricolaVista(abierta) {
    var pintar = function () { window.RBAgricola.render(main, AGRO, ZONAS, abierta); };
    if (AGRO) return pintar();
    main.innerHTML = '<p class="cargando">' + t('agro.cargando') + '</p>';
    fetch('data/agricola.json').then(ok).then(function (d) { AGRO = d; pintar(); }).catch(function (e) {
      main.innerHTML = '<div class="error" role="alert"><h2>' + t('err.agro') + '</h2><p>' + esc(t('err.detalle', { d: e.message })) + '</p></div>';
    });
  }
  var prev = null;
  /* Accesibilidad (#119 D6). "Saltar al contenido" no cambia el hash: el enrutador lo leía como pantalla
     desconocida y mandaba a Inicio. Al cambiar de pantalla se anuncia el título y el foco va a <main>. */
  var saltar = document.querySelector('.saltar');
  if (saltar) saltar.addEventListener('click', function (ev) { ev.preventDefault(); main.focus(); });
  var anuncio = document.getElementById('anuncio');
  function anunciar() { if (anuncio) anuncio.textContent = document.title; }
  window.addEventListener('hashchange', function (ev) {
    // Dentro del Mapa Agrícola (abrir/cerrar ficha) no se sube al inicio: agricola.js maneja el scroll.
    var deAgro = /#agricola(\/|$)/.test(ev.oldURL || ''), aAgro = /^#agricola(\/|$)/.test(location.hash);
    ruta();
    if (!(deAgro && aAgro)) { window.scrollTo(0, 0); anunciar(); if (main.focus) main.focus({ preventScroll: true }); }
  });
  T.aplicar(document);
  cargar().then(function () { ruta(); }).catch(function (e) {
    main.innerHTML = '<div class="error" role="alert"><h2>' + t('err.datos') + '</h2><p>' + esc(t('err.detalle', { d: e.message })) +
      '</p><p>' + t('err.file') + '</p></div>';
  });
})();
