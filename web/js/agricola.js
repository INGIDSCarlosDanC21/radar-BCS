/* Pantalla Mapa Agrícola (diseño Figma "Mapa Agrícola").
   Todo contenido sale de data/agricola.json (datos) y data/zonas.geojson (NDVI). ES5, sin build.
   API: RBAgricola.html(datos, zonas, abierta) y RBAgricola.render(main, datos, zonas, abierta).
   URL: al abrir una ficha se hace history.pushState('#agricola/<id>'); al cerrar se vuelve con
   history.back() (o replaceState a '#agricola' si no hay entrada propia). pushState NO dispara
   hashchange, y se atiende popstate, así "atrás" cierra la ficha sin recrear el mapa. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function url(u) { return /^https?:\/\//i.test(String(u || '')) ? esc(u) : '#'; }
  function arr(a) { return Object.prototype.toString.call(a) === '[object Array]' ? a : []; }
  function norm(s) {
    var t = String(s || '').toLowerCase();
    if (t.normalize) t = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return t.replace(/\s+/g, ' ').trim();
  }

  /* ---------- Íconos (SVG en línea, decorativos) ---------- */
  var P = {
    lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    diana: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    hoja: '<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-4 6-7 10-9"/>',
    escudo: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="M12 8v4M12 15.5v.1"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    planta: '<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-3 2.5-5 6-5 0 3-2.5 5-6 5z"/><path d="M8 21h8"/>',
    gota: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    capas: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    nota: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    analisis: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 15v-3M12 15V8M16 15v-5"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>'
  };
  function ico(n, c, w) {
    return '<svg class="ag-ico ' + (c || '') + '" viewBox="0 0 24 24" width="' + (w || 16) + '" height="' + (w || 16) +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + P[n] + '</svg>';
  }
  var ICO_FICHA = { cultivos: 'planta', clima: 'gota', suelo: 'capas', riesgos: 'escudo' };
  var TONO = { cultivos: 'verde', clima: 'cian', suelo: 'claro', riesgos: 'ambar' };

  /* ---------- Ficha cerrada ---------- */
  function fichaCerrada(f, abierta) {
    var id = f.id, oculta = abierta && abierta !== id;
    var d = f.detalle || {};
    if (abierta === id) return fichaAbierta(f);
    return '<article class="ag-ficha ag-t-' + esc(TONO[id] || 'verde') + '" data-ficha="' + esc(id) + '"' + (oculta ? ' hidden' : '') + '>' +
      '<span class="ag-ficha-borde" aria-hidden="true"></span>' +
      '<button type="button" class="ag-ficha-btn" aria-expanded="false" aria-controls="ag-det-' + esc(id) + '">' +
        '<span class="ag-ficha-cab">' +
          '<span class="ag-ficha-icono">' + ico(ICO_FICHA[id] || 'planta', '', 24) + '</span>' +
          '<span class="ag-ficha-txt"><span class="ag-ficha-tit">' + esc(f.titulo) + '</span>' +
          '<span class="ag-ficha-sub">' + esc(f.subtitulo) + '</span></span>' +
          (f.chip ? '<span class="ag-ficha-chip">' + esc(f.chip) + '</span>' : '') +
        '</span>' +
        '<span class="ag-ficha-pie"><span class="ag-ficha-enlace">' + esc(f.enlace) + '</span>' + ico('flecha', '', 16) + '</span>' +
      '</button>' +
      '<div id="ag-det-' + esc(id) + '" hidden></div>' +
      '</article>';
  }

  /* ---------- Detalle (mismo molde para las 4) ---------- */
  function tarjeta(t, alerta) {
    var h = '<article class="ag-tj' + (alerta ? ' ag-tj-alerta' : '') + '">';
    if (t.chip) h += '<p class="ag-tj-chip">' + esc(t.chip) + '</p>';
    h += '<h4 class="ag-tj-tit">' + esc(t.titulo) + '</h4>';
    if (t.texto) h += '<p class="ag-tj-txt">' + esc(t.texto) + '</p>';
    var fl = arr(t.filas);
    if (fl.length) {
      h += '<dl class="ag-tj-filas">';
      fl.forEach(function (r) { h += '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; });
      h += '</dl>';
    }
    if (alerta && t.motivo) h += '<p class="ag-tj-motivo"><b>Motivo:</b> ' + esc(t.motivo) + '</p>';
    if (t.fuente) h += '<p class="ag-tj-fuente">Fuente: ' + esc(t.fuente) + '</p>';
    return h + '</article>';
  }

  function detalle(f) {
    var d = f.detalle || {}, id = f.id, h = '';
    var chips = arr(d.chips);
    h += '<div class="ag-det-cab"><div class="ag-det-cab-izq">' +
      '<span class="ag-ficha-icono">' + ico(ICO_FICHA[id] || 'planta', '', 24) + '</span><div class="ag-det-cab-txt">';
    if (chips.length) {
      h += '<div class="ag-det-chips">';
      chips.forEach(function (c, k) { h += '<span class="ag-det-chip' + (k === 0 ? ' ag-det-chip-1' : '') + '">' + esc(c) + '</span>'; });
      h += '</div>';
    }
    h += '<h3 class="ag-det-tit" id="ag-tit-' + esc(id) + '" tabindex="-1">' + esc(d.titulo_largo || f.titulo) + '</h3>';
    if (d.descripcion) h += '<p class="ag-det-desc">' + esc(d.descripcion) + '</p>';
    h += '</div></div><div class="ag-det-cab-der">';
    if (d.veredicto) {
      h += '<div class="ag-veredicto"><span class="ag-veredicto-e">' + esc(d.veredicto.etiqueta) + '</span>' +
        '<span class="ag-veredicto-v">' + esc(d.veredicto.valor) + '</span></div>';
    }
    h += '<button type="button" class="ag-cerrar" data-cerrar="1">' + ico('x', '', 14) + 'Cerrar</button></div></div>';

    if (d.dictamen) {
      h += '<section class="ag-dictamen" aria-label="' + esc(d.dictamen.titulo) + '"><p class="ag-mono ag-dictamen-t">' + ico('check', '', 14) + esc(d.dictamen.titulo) + '</p>' +
        '<p class="ag-dictamen-txt">' + esc(d.dictamen.texto) + '</p></section>';
    }
    if (d.grupo) {
      h += '<section class="ag-grupo"><div class="ag-grupo-cab"><h4 class="ag-grupo-tit">' + ico('hoja', 'ag-verde', 18) + esc(d.grupo.titulo) + '</h4>' +
        (d.grupo.nota ? '<p class="ag-mono ag-grupo-nota">' + esc(d.grupo.nota) + '</p>' : '') + '</div><div class="ag-tjs">';
      arr(d.grupo.tarjetas).forEach(function (t) { h += tarjeta(t, false); });
      h += '</div></section>';
    }
    var ga = d.grupo_alerta;
    if (ga) {
      h += '<section class="ag-grupo"><div class="ag-grupo-cab"><h4 class="ag-grupo-tit">' + ico('escudo', 'ag-rojo', 18) + esc(ga.titulo) + '</h4>' +
        (ga.nota ? '<p class="ag-mono ag-pil-rojo">' + esc(ga.nota) + '</p>' : '') + '</div><div class="ag-tjs">';
      arr(ga.tarjetas).forEach(function (t) { h += tarjeta(t, ga.tono !== 'neutro'); });
      h += '</div></section>';
    }
    var notas = arr(d.notas).slice(0, 3);
    if (notas.length) {
      h += '<div class="ag-notas">';
      notas.forEach(function (n) {
        h += '<article class="ag-nota"><p class="ag-mono ag-nota-t">' + ico('nota', 'ag-verde', 14) + esc(n.titulo) + '</p><p class="ag-nota-txt">' + esc(n.texto) + '</p></article>';
      });
      h += '</div>';
    }
    var fu = arr(d.fuentes);
    if (fu.length) {
      h += '<section class="ag-fuentes"><h4 class="ag-mono ag-fuentes-t">Fuentes</h4><ul>';
      fu.forEach(function (s) {
        h += '<li><a href="' + url(s.url) + '" target="_blank" rel="noopener">' + esc(s.nombre) + '</a>' +
          (s.licencia ? ' · <span>' + esc(s.licencia) + '</span>' : '') +
          (s.consultado ? ' · <span>Consultado: ' + esc(s.consultado) + '</span>' : '') + '</li>';
      });
      h += '</ul></section>';
    }
    return h;
  }

  function cta(d) {
    var c = d && d.cta;
    if (!c) return '';
    return '<aside class="ag-cta"><div><p class="ag-mono ag-cta-e">' + ico('ext', '', 12) + esc(c.etiqueta) + '</p>' +
      '<h4 class="ag-cta-t">' + esc(c.titulo) + '</h4><p class="ag-cta-txt">' + esc(c.texto) + '</p></div>' +
      '<a class="ag-cta-btn" href="' + url(c.url) + '" target="_blank" rel="noopener">' + esc(c.boton) + '</a></aside>';
  }

  function fichaAbierta(f) {
    var id = f.id;
    return '<article class="ag-ficha ag-abierta ag-t-' + esc(TONO[id] || 'verde') + '" data-ficha="' + esc(id) + '">' +
      '<span class="ag-ficha-borde" aria-hidden="true"></span>' +
      '<div class="ag-ficha-resumen">' +
      '<button type="button" class="ag-ficha-btn ag-sr" aria-expanded="true" aria-controls="ag-det-' + esc(id) + '">' + esc(f.titulo) + ': ficha abierta</button></div>' +
      '<div id="ag-det-' + esc(id) + '" class="ag-detalle" role="region" aria-labelledby="ag-tit-' + esc(id) + '">' + detalle(f) + '</div>' +
      '</article>';
  }

  function fichasHtml(datos, abierta) {
    var fs = arr(datos && datos.fichas), h = '';
    fs.forEach(function (f) { h += fichaCerrada(f, abierta); });
    return h;
  }
  function ctaDe(datos, abierta) {
    var fs = arr(datos && datos.fichas);
    for (var k = 0; k < fs.length; k++) if (fs[k].id === abierta) return cta(fs[k].detalle);
    return '';
  }

  /* ---------- Escala de color del NDVI (sale de los datos de zonas) ---------- */
  var C_BAJA = [140, 81, 10], C_MEDIA = [245, 245, 235], C_SUBE = [0, 109, 61];
  function mezcla(a, b, t) {
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * t); }).join(',') + ')';
  }
  function colorValor(v, m) {
    if (v == null || !m) return null;
    var t = Math.max(-1, Math.min(1, v / m));
    return t < 0 ? mezcla(C_MEDIA, C_BAJA, -t) : mezcla(C_MEDIA, C_SUBE, t);
  }
  function vegDe(f) {
    var c = f && f.properties && f.properties.cambios && f.properties.cambios.vegetacion;
    return c || null;
  }
  function maxAbs(zonas) {
    var m = 0;
    arr(zonas && zonas.features).forEach(function (f) {
      var c = vegDe(f);
      if (c && c.significativo !== false && c.cambio_total != null) m = Math.max(m, Math.abs(c.cambio_total));
    });
    return m;
  }

  /* ---------- HTML completo ---------- */
  function html(datos, zonas, abierta) {
    if (!datos || !arr(datos.fichas).length) {
      return '<div class="ag"><p class="ag-error" role="alert">No se pudieron cargar los datos agrícolas.</p></div>';
    }
    var m = datos.mapa || {}, ley = m.leyenda || {}, info = m.info || {}, locs = arr(m.localidades);
    var h = '<div class="ag">' +
      '<div class="ag-cont">' +
      '<div class="ag-estado">' +
        '<p class="ag-mono ag-estado-izq"><i class="ag-dot"></i>' + esc(datos.estado_linea) + '</p>' +
        '<p class="ag-mono ag-estado-der">' + esc(datos.consulta_linea) + '</p></div>' +
      '<header class="ag-cab"><h1>Mapa Agrícola</h1>' +
      '<p class="ag-sub">Vocación de suelos y condiciones agroclimáticas de los valles agrícolas del municipio de La Paz, con datos abiertos oficiales.</p></header>' +
      '<form class="ag-busca" role="search" novalidate>' +
        '<label class="ag-busca-campo">' + ico('lupa', '', 16) + '<span class="ag-sr">Buscar localidad</span>' +
        '<input type="text" id="ag-q" list="ag-locs" autocomplete="off" placeholder="Buscar localidad (Los Planes, El Carrizal…)"></label>' +
        '<datalist id="ag-locs">';
    locs.forEach(function (l) { h += '<option value="' + esc(l.nombre) + '"></option>'; });
    h += '</datalist><button type="submit" class="ag-rastrear">Rastrear Terreno' + ico('diana', '', 16) + '</button></form>' +
      '<p class="ag-msg" id="ag-msg" role="status" aria-live="polite"></p>' +
      '<section class="ag-mapa" aria-label="Mapa de localidades y cambio de vegetación">' +
        '<div class="ag-mapa-caja"><div id="ag-mapa" class="ag-mapa-lf" role="application" aria-label="Mapa interactivo"></div>';
    if (info.titulo || info.texto) {
      h += '<div class="ag-info">' + ico('pin', '', 20) + '<div><p class="ag-info-t">' + esc(info.titulo) + '</p><p class="ag-info-s">' + esc(info.texto) + '</p></div></div>';
    }
    if (ley.titulo) {
      h += '<div class="ag-ley"><div class="ag-ley-cab"><p class="ag-mono ag-ley-t">' + esc(ley.titulo) + '</p>' +
        (ley.etiqueta ? '<span class="ag-ley-pil">' + esc(ley.etiqueta) + '</span>' : '') + '</div>' +
        '<div class="ag-ley-barra" aria-hidden="true"></div>' +
        '<p class="ag-mono ag-ley-mm"><span>' + esc(ley.min) + '</span><span>' + esc(ley.max) + '</span></p>' +
        (ley.nota ? '<p class="ag-ley-nota">' + esc(ley.nota) + '</p>' : '') + '</div>';
    }
    h += '</div><div class="ag-mapa-pie"><ul class="ag-mono ag-mapa-pie-l">';
    arr(m.pie).forEach(function (p, k) { h += '<li><i class="ag-dot ag-dot-' + (k % 2 ? 'cian' : 'verde') + '"></i>' + esc(p) + '</li>'; });
    h += '</ul>' + (m.fuentes_pie ? '<p class="ag-mono ag-mapa-pie-r">Fuentes: <b>' + esc(m.fuentes_pie) + '</b></p>' : '') + '</div></section>' +
      '<section class="ag-fichas-sec" id="ag-fichas-sec" aria-labelledby="ag-h2">' +
        '<div class="ag-sec-cab"><div><p class="ag-mono ag-sec-eti">' + ico('analisis', 'ag-verde', 14) + 'ANÁLISIS AGROCLIMÁTICO</p>' +
        '<h2 id="ag-h2">Diagnóstico Agroclimático &amp; Sanidad de Suelos</h2>' +
        '<p class="ag-sec-sub">Selecciona una dimensión para ver el detalle con datos oficiales y su fuente.</p></div>' +
        (datos.zona ? '<p class="ag-mono ag-zona">' + ico('pin', '', 12) + 'Zona: <b>' + esc(datos.zona) + '</b></p>' : '') + '</div>' +
        '<div class="ag-fichas' + (abierta ? ' ag-fichas-abierta' : '') + '" id="ag-fichas">' + fichasHtml(datos, abierta) + '</div>' +
        '<div id="ag-cta">' + ctaDe(datos, abierta) + '</div>' +
      '</section></div>' +
      '<footer class="ag-pie"><div class="ag-pie-grid"><div><p class="ag-marca"><i class="ag-dot"></i>RADAR BCS</p>' +
        '<p class="ag-pie-desc">Tendencias ambientales de La Paz, B.C.S., con datos abiertos de la NASA.</p></div>' +
        '<nav aria-label="Pie de página"><p class="ag-mono ag-negro">Pantallas</p>' +
        '<a href="#inicio">Inicio</a><a href="#mapa">Mapa</a><a href="#ficha/calor">Fichas</a><a href="#acciones">Acciones</a><a href="#agricola">Mapa Agrícola</a></nav></div>' +
        '<p class="ag-mono ag-copy">© 2026 Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0</p></footer>' +
      '</div>';
    return h;
  }

  /* ---------- Comportamiento ---------- */
  var ESTADO = null;   // {main, datos, abierta, mapa, marcas, onPop, onKey}

  function reducido() {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function idDeHash() {
    var h = String((typeof location !== 'undefined' && location.hash) || '').slice(1).split('/');
    return h[0] === 'agricola' && h[1] ? h[1] : null;
  }
  function existe(datos, id) {
    var fs = arr(datos && datos.fichas);
    for (var k = 0; k < fs.length; k++) if (fs[k].id === id) return true;
    return false;
  }

  function pintaFichas(est, animar) {
    var main = est.main, g = main.querySelector('#ag-fichas');
    if (!g) return;
    // Posición de la tarjeta elegida antes de ocultar las demás: la ficha crece desde ahí
    // hacia el espacio de las tarjetas no seleccionadas.
    var previa = est.abierta && g.querySelector('[data-ficha="' + est.abierta + '"]');
    var caja = previa && !previa.hidden && !previa.classList.contains('ag-abierta') ? rel(previa, g) : null;
    if (caja && !caja.w) caja = null;
    g.className = 'ag-fichas' + (est.abierta ? ' ag-fichas-abierta' : '');
    g.innerHTML = fichasHtml(est.datos, est.abierta);
    main.querySelector('#ag-cta').innerHTML = ctaDe(est.datos, est.abierta);
    if (est.abierta) {
      var a = g.querySelector('.ag-abierta');
      if (!a) return;
      if (caja) est.cajas[est.abierta] = caja;
      fijaInicio(a, est.cajas[est.abierta] || cajaPorOrden(est, g, est.abierta));
      if (animar && !reducido()) { a.classList.add('ag-anima'); setTimeout(function () { a.classList.remove('ag-anima'); }, 400); }
    }
  }
  function rel(el, g) {
    var r = el.getBoundingClientRect(), b = g.getBoundingClientRect();
    return { top: r.top - b.top, left: r.left - b.left, w: r.width, h: r.height };
  }
  // Para una ficha abierta desde la URL: posición que tendría en la cuadrícula cerrada.
  function cajaPorOrden(est, g, id) {
    var fs = arr(est.datos && est.datos.fichas), i = 0;
    for (var k = 0; k < fs.length; k++) if (fs[k].id === id) i = k;
    var cols = (getComputedStyle(g).gridTemplateColumns || '').split(' ').filter(Boolean).length || 1;
    var gap = 24, ancho = g.clientWidth, w = (ancho - gap * (cols - 1)) / cols, h = 176;
    return { top: Math.floor(i / cols) * (h + gap), left: (i % cols) * (w + gap), w: w, h: h };
  }
  // Recorte inicial (y final al cerrar) que deja ver solo el lugar original de la tarjeta.
  function fijaInicio(a, c) {
    var W = a.offsetWidth, H = a.offsetHeight;
    var t = Math.max(0, c.top), l = Math.max(0, c.left);
    var r = Math.max(0, W - l - c.w), b = Math.max(0, H - t - c.h);
    a.style.setProperty('--ag-ini', 'inset(' + t + 'px ' + r + 'px ' + b + 'px ' + l + 'px round 12px)');
  }
  function irASeccion() {
    var s = ESTADO && ESTADO.main.querySelector('#ag-fichas-sec');
    if (s && s.scrollIntoView) s.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
  }

  function cambiar(est, id, opts) {
    opts = opts || {};
    var previa = est.abierta;
    if (id && !existe(est.datos, id)) id = null;
    if (previa === id) return;
    var termina = function () {
      est.abierta = id;
      pintaFichas(est, !!id);
      if (id) {
        var t = est.main.querySelector('#ag-tit-' + id);
        irASeccion();
        if (t && t.focus) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
      } else if (previa) {
        var b = est.main.querySelector('[data-ficha="' + previa + '"] .ag-ficha-btn');
        irASeccion();
        if (b && b.focus) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
      }
    };
    if (!id && previa && !reducido() && !opts.rapido) {
      var a = est.main.querySelector('.ag-abierta');
      if (a) { a.classList.add('ag-cierra'); setTimeout(termina, 280); return; }
    }
    termina();
  }

  function abrirUrl(id) {
    if (typeof history === 'undefined' || !history.pushState) return;
    history.pushState({ ag: 1 }, '', '#agricola/' + id);
  }
  function cerrarUrl(est) {
    if (typeof history === 'undefined') return false;
    if (history.state && history.state.ag && history.back) { history.back(); return true; }
    if (history.replaceState) history.replaceState(null, '', '#agricola');
    return false;
  }

  function buscarLoc(datos, q) {
    var n = norm(q), ls = arr(datos.mapa && datos.mapa.localidades), k;
    if (!n) return null;
    for (k = 0; k < ls.length; k++) if (norm(ls[k].nombre) === n) return ls[k];
    for (k = 0; k < ls.length; k++) if (norm(ls[k].nombre).indexOf(n) >= 0 || n.indexOf(norm(ls[k].nombre)) >= 0) return ls[k];
    return null;
  }

  function montaMapa(est, zonas) {
    var el = est.main.querySelector('#ag-mapa'), m = est.datos.mapa || {};
    if (!el || typeof L === 'undefined') {
      if (el) el.innerHTML = '<p class="ag-error">No se pudo mostrar el mapa.</p>';
      return;
    }
    try {
      var mapa = L.map(el, { zoomControl: false, scrollWheelZoom: false }).setView(m.centro || [0, 0], m.zoom || 9);
      L.control.zoom({ position: 'bottomright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(mapa);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18, attribution: '© OpenStreetMap contributors'
      }).addTo(mapa);
      var mx = maxAbs(zonas);
      if (zonas && zonas.features) {
        L.geoJSON(zonas, {
          style: function (f) {
            var c = vegDe(f);
            var col = c && c.significativo !== false ? colorValor(c.cambio_total, mx) : null;
            return col ? { color: '#44474d', weight: 1, fillColor: col, fillOpacity: 0.7 } :
              { color: '#8a9096', weight: 1, dashArray: '4 3', fill: false };
          },
          onEachFeature: function (f, l) {
            var p = f.properties || {};
            l.bindPopup('<strong>' + esc(p.nombre) + '</strong>');
          }
        }).addTo(mapa);
      }
      est.marcas = {};
      arr(m.localidades).forEach(function (l, k) {
        if (typeof l.lat !== 'number' || typeof l.lon !== 'number') return;
        var icon = L.divIcon({
          className: 'ag-pin-icon',
          html: '<span class="ag-pin"><i class="ag-dot ag-dot-' + (k % 2 ? 'cian' : 'verde') + '"></i>' + esc(l.etiqueta || l.nombre) + '</span>',
          iconSize: null
        });
        var mk = L.marker([l.lat, l.lon], { icon: icon, title: l.nombre, keyboard: true }).addTo(mapa);
        mk.bindPopup('<strong>' + esc(l.nombre) + '</strong>' + (l.etiqueta ? '<br>' + esc(l.etiqueta) : '') +
          (l.fuente_coord ? '<br><small>Coordenadas: ' + esc(l.fuente_coord) + '</small>' : ''));
        est.marcas[l.id] = mk;
      });
      est.mapa = mapa;
      setTimeout(function () { if (est.mapa) est.mapa.invalidateSize(); }, 200);
    } catch (e) {
      el.innerHTML = '<p class="ag-error">No se pudo mostrar el mapa.</p>';
    }
  }

  function destruye() {
    if (!ESTADO) return;
    try { if (ESTADO.mapa) ESTADO.mapa.remove(); } catch (e) { /* ya no existe */ }
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', ESTADO.onPop);
      document.removeEventListener('keydown', ESTADO.onKey);
    }
    ESTADO = null;
  }

  function render(main, datos, zonas, abierta) {
    if (abierta === undefined) abierta = idDeHash();
    if (abierta && !existe(datos, abierta)) abierta = null;
    // Ya pintada: solo sincroniza la ficha, sin recrear el mapa.
    if (ESTADO && ESTADO.main === main && main.querySelector('.ag') && ESTADO.datos === datos) {
      cambiar(ESTADO, abierta, { rapido: true });
      return;
    }
    destruye();
    main.innerHTML = html(datos, zonas, abierta);
    var est = ESTADO = { main: main, datos: datos, abierta: abierta, mapa: null, marcas: {}, cajas: {} };

    main.addEventListener('click', function (e) {
      if (ESTADO !== est) return;
      var t = e.target;
      var cer = t.closest ? t.closest('[data-cerrar]') : null;
      if (cer) { e.preventDefault(); if (!cerrarUrl(est)) cambiar(est, null); return; }
      var bt = t.closest ? t.closest('.ag-ficha-btn') : null;
      if (bt && bt.getAttribute('aria-expanded') === 'false') {
        var art = bt.closest('[data-ficha]');
        var id = art && art.getAttribute('data-ficha');
        if (id) { abrirUrl(id); cambiar(est, id); }
      }
    });

    var form = main.querySelector('.ag-busca');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = main.querySelector('#ag-q').value, msg = main.querySelector('#ag-msg');
      var l = buscarLoc(datos, q);
      if (!l) { msg.textContent = 'No encontramos esa localidad en el mapa.'; msg.className = 'ag-msg ag-msg-on'; return; }
      msg.textContent = ''; msg.className = 'ag-msg';
      if (est.mapa) {
        if (reducido()) est.mapa.setView([l.lat, l.lon], 12); else est.mapa.flyTo([l.lat, l.lon], 12);
        var mk = est.marcas[l.id];
        if (mk) setTimeout(function () { mk.openPopup(); }, reducido() ? 0 : 900);
      }
    });

    est.onPop = function () {
      if (ESTADO !== est) return;
      var id = idDeHash();
      if (typeof location !== 'undefined' && String(location.hash).indexOf('#agricola') !== 0) return;
      cambiar(est, id);
    };
    est.onKey = function (e) {
      if (ESTADO === est && est.abierta && (e.key === 'Escape' || e.key === 'Esc')) {
        if (!cerrarUrl(est)) cambiar(est, null);
      }
    };
    window.addEventListener('popstate', est.onPop);
    document.addEventListener('keydown', est.onKey);
    montaMapa(est, zonas);
  }

  var RBAgricola = { html: html, render: render };
  if (typeof window !== 'undefined') window.RBAgricola = RBAgricola;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBAgricola;
})();
