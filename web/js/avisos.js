/* Pestaña Avisos (docs/PLAN-PESCA-AVISOS.md). ES5, sin build.
   Tres fuentes, claramente separadas y rotuladas:
   1) Avisos AUTOMÁTICOS del modelo (web/js/reglas-mar.js): oleaje, viento, lluvia, tormenta y UV de las próximas 24 h. No son oficiales.
   2) Avisos agrícolas: se reutilizan los de la ficha "Riesgos y Sanidad" ya auditada (web/data/agricola.json), con su fuente.
   3) Avisos OFICIALES: solo enlaces (SMN, NHC, CENAPRED, SEMAR, CONAPESCA). No hay un feed abierto verificado y no se simulan.
   Si no hay ningún aviso, se dice. Nunca se muestra un aviso que no salga de un dato. Sin gráficas ni tablas. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var V = (typeof window !== 'undefined' && window.RBVivo) || (typeof require !== 'undefined' ? require('./datos-vivos.js') : null);
  var M = (typeof window !== 'undefined' && window.RBMar) || (typeof require !== 'undefined' ? require('./reglas-mar.js') : null);
  var t = T.t;
  var OFICIALES = [
    { id: 'smn', url: 'https://smn.conagua.gob.mx/' }, { id: 'nhc', url: 'https://www.nhc.noaa.gov/?epac' },
    { id: 'cenapred', url: 'https://www.gob.mx/cenapred' }, { id: 'semar', url: 'https://www.gob.mx/semar' }, { id: 'conapesca', url: 'https://www.gob.mx/conapesca' }
  ];
  var ICONO_NIVEL = { 3: 'crisis_alert', 2: 'warning', 1: 'error', 0: 'info' };
  var TEMAS_MAR = { ola: true, viento: true, calma: true };

  var TX = {
    es: {
      'avs.sync': 'Última sincronización: {h} · hora de La Paz', 'avs.sub': 'Avisos automáticos del modelo y enlaces oficiales para Baja California Sur.',
      'avs.total': 'Total de avisos:', 'avs.filtros': 'Tipo de aviso',
      'avs.f.todas': 'Todas', 'avs.f.meteo': 'Meteorológicas', 'avs.f.agro': 'Agrícolas', 'avs.f.mar': 'Pesca y marítimo',
      'avs.g.meteo': 'Información meteorológica', 'avs.g.agro': 'Información agrícola', 'avs.g.mar': 'Información pesquera y marítima',
      'avs.c.meteo': 'Meteorología', 'avs.c.agro': 'Agrícola', 'avs.c.mar': 'Mar',
      'avs.n': '{n} avisos', 'avs.n1': '1 aviso', 'avs.vacio': 'Sin avisos del modelo ahora.', 'avs.vacioAgro': 'Sin avisos agrícolas.',
      'avs.simb': 'Simbología de avisos', 'avs.s.3': 'Riesgo extremo', 'avs.s.2': 'Condición severa', 'avs.s.1': 'Precaución', 'avs.s.0': 'Informativo',
      'avs.of': 'Avisos oficiales', 'avs.of.smn': 'SMN (clima y ciclones)', 'avs.of.nhc': 'NHC (ciclones del Pacífico)', 'avs.of.cenapred': 'Protección Civil (CENAPRED)',
      'avs.of.semar': 'Capitanía de Puerto (SEMAR)', 'avs.of.conapesca': 'Vedas de pesca (CONAPESCA)',
      'avs.nota': 'Los avisos con ícono de modelo son automáticos y no son oficiales. Los avisos oficiales están en los enlaces. Datos: Open-Meteo.com (CC BY 4.0).',
      'avs.zona': 'Zona: {z}', 'avs.masN': 'y {n} más', 'avs.ahora': 'Ahora', 'avs.desde': 'Desde {d} {h}', 'avs.hoy': 'hoy', 'avs.manana': 'mañana', 'avs.pasado': 'pasado mañana',
      'avs.modelo': 'Modelo', 'avs.fuente': 'Fuente: {f}', 'avs.ver': 'Ver ficha',
      'avs.cargando': 'Cargando los avisos…', 'avs.error': 'No se pudo cargar el modelo (¿sin conexión?). Los avisos oficiales siguen en los enlaces.',
      'avs.agro.sequia': 'Sequía en La Paz', 'avs.agro.mosca': 'Zona libre de moscas de la fruta'
    },
    en: {
      'avs.sync': 'Last sync: {h} · La Paz time', 'avs.sub': 'Automatic model notices and official links for Baja California Sur.',
      'avs.total': 'Total notices:', 'avs.filtros': 'Type of notice',
      'avs.f.todas': 'All', 'avs.f.meteo': 'Weather', 'avs.f.agro': 'Farming', 'avs.f.mar': 'Fishing and marine',
      'avs.g.meteo': 'Weather information', 'avs.g.agro': 'Farming information', 'avs.g.mar': 'Fishing and marine information',
      'avs.c.meteo': 'Weather', 'avs.c.agro': 'Farming', 'avs.c.mar': 'Sea',
      'avs.n': '{n} notices', 'avs.n1': '1 notice', 'avs.vacio': 'No model notices right now.', 'avs.vacioAgro': 'No farming notices.',
      'avs.simb': 'Notice legend', 'avs.s.3': 'Extreme risk', 'avs.s.2': 'Severe condition', 'avs.s.1': 'Caution', 'avs.s.0': 'Informational',
      'avs.of': 'Official warnings', 'avs.of.smn': 'SMN (weather and cyclones)', 'avs.of.nhc': 'NHC (Pacific cyclones)', 'avs.of.cenapred': 'Civil Protection (CENAPRED)',
      'avs.of.semar': 'Port Captaincy (SEMAR)', 'avs.of.conapesca': 'Fishing closures (CONAPESCA)',
      'avs.nota': 'Notices marked as model are automatic and not official. Official warnings are in the links. Data: Open-Meteo.com (CC BY 4.0).',
      'avs.zona': 'Area: {z}', 'avs.masN': 'and {n} more', 'avs.ahora': 'Now', 'avs.desde': 'From {d} {h}', 'avs.hoy': 'today', 'avs.manana': 'tomorrow', 'avs.pasado': 'the day after tomorrow',
      'avs.modelo': 'Model', 'avs.fuente': 'Source: {f}', 'avs.ver': 'See details',
      'avs.cargando': 'Loading the notices…', 'avs.error': 'The model could not be loaded (offline?). Official warnings are still in the links.',
      'avs.agro.sequia': 'Drought in La Paz', 'avs.agro.mosca': 'Fruit fly free zone'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function icono(n, clase) {
    var u = 'url(assets/iconos/mapa/' + n + '.svg)';
    return '<span class="mi-ic' + (clase ? ' ' + clase : '') + '" style="-webkit-mask-image:' + u + ';mask-image:' + u + '" aria-hidden="true"></span>';
  }
  function zonasTexto(z) {
    var s = z.slice(0, 3).join(', ');
    return z.length > 3 ? s + ' ' + t('avs.masN', { n: z.length - 3 }) : s;
  }
  function momento(datos, g, ahora) {
    if (g.ahora) return t('avs.ahora');
    var d = Math.floor(g.desde / 24) - Math.floor(ahora / 24), h = V.horaDe(datos.horas[g.desde]);
    return t('avs.desde', { d: t(d <= 0 ? 'avs.hoy' : d === 1 ? 'avs.manana' : 'avs.pasado'), h: h });
  }

  /* Lista de avisos del modelo (con "mar tranquilo" informativo) lista para pintar. Solo lee `datos` y `ahora` (índice de hora). */
  function avisosModelo(datos, ahora) {
    var lista = M.avisos(datos, ahora, 24).map(function (g) {
      var det = '';
      if (g.tema === 'ola' && g.pico != null) det = t('avi.det.ola', { v: Number(g.pico).toFixed(1) });
      else if (g.tema === 'viento' && g.pico != null) det = t('avi.det.viento', { v: Math.round(g.pico) });
      else if (g.tema === 'uv' && g.pico != null) det = t('avi.det.uv', { v: Math.round(g.pico) });
      return { grupo: g.grupo, nivel: g.nivel, tema: g.tema, titulo: t('avi.' + g.tema + '.' + g.nivel), detalle: det, zonas: g.zonas, cuando: momento(datos, g, ahora), modelo: true };
    });
    var calmos = M.tranquilos(datos, ahora);
    if (calmos.length) lista.push({ grupo: 'mar', nivel: 0, tema: 'calma', titulo: t('avi.calma'), detalle: '', zonas: calmos, cuando: t('avs.ahora'), modelo: true });
    return lista;
  }
  /* Busca en agricola.json el aviso con ese texto (riesgos y sanidad, ya auditado). Devuelve null si no está. */
  function buscar(o, pred) {
    if (!o || typeof o !== 'object') return null;
    if (pred(o)) return o;
    var ks = Object.keys(o);
    for (var i = 0; i < ks.length; i++) { var r = buscar(o[ks[i]], pred); if (r) return r; }
    return null;
  }
  function avisosAgro(agro) {
    if (!agro || !agro.fichas) return [];
    var f = agro.fichas.filter(function (x) { return x.id === 'riesgos'; })[0];
    if (!f) return [];
    var res = [];
    var chip = T.d(f, 'chip');
    if (chip) res.push({ grupo: 'agro', nivel: 0, tema: 'sequia', titulo: t('avs.agro.sequia'), detalle: chip, zonas: [], cuando: '', fuente: 'SMN-CONAGUA', enlace: '#agricola/riesgos' });
    var m = buscar(f, function (o) { return typeof o.titulo === 'string' && /moscas de la fruta/i.test(o.titulo) && o.chip; });
    if (m) res.push({ grupo: 'agro', nivel: 0, tema: 'mosca', titulo: T.d(m, 'titulo'), detalle: T.d(m, 'chip'), zonas: [], cuando: '', fuente: 'DOF', enlace: '#agricola/riesgos' });
    return res;
  }

  function tarjeta(a) {
    var cat = t('avs.c.' + a.grupo);
    return '<article class="av-c av-n' + a.nivel + '" data-grupo="' + a.grupo + '"><div class="av-fila">' +
      '<span class="av-niv av-niv-' + a.nivel + '">' + icono(ICONO_NIVEL[a.nivel], 'av-ic') + esc(t('niv.' + a.nivel)) + '</span>' +
      '<span class="av-cat">' + esc(cat) + '</span>' + (a.modelo ? '<span class="av-cat av-mod">' + esc(t('avs.modelo')) + '</span>' : '') +
      (a.cuando ? '<span class="av-hora">' + esc(a.cuando) + '</span>' : '') + '</div>' +
      '<h3 class="av-t">' + esc(a.titulo) + '</h3>' + (a.detalle ? '<p class="av-det">' + esc(a.detalle) + '</p>' : '') +
      (a.zonas && a.zonas.length ? '<p class="av-zona">' + esc(t('avs.zona', { z: zonasTexto(a.zonas) })) + '</p>' : '') +
      (a.fuente ? '<p class="av-zona">' + esc(t('avs.fuente', { f: a.fuente })) + (a.enlace ? ' · <a href="' + a.enlace + '">' + esc(t('avs.ver')) + '</a>' : '') + '</p>' : '') + '</article>';
  }
  function grupo(g, lista, vacio) {
    var n = lista.length;
    return '<section class="av-g" data-grupo="' + g + '" aria-labelledby="av-h-' + g + '"><div class="av-g-cab"><h2 id="av-h-' + g + '">' + esc(t('avs.g.' + g)) + '</h2>' +
      '<span class="av-cuenta">' + esc(n === 1 ? t('avs.n1') : t('avs.n', { n: n })) + '</span></div>' +
      (n ? lista.map(tarjeta).join('') : '<p class="av-vacio">' + icono('check_circle', 'av-ic') + esc(vacio) + '</p>') + '</section>';
  }
  /* Todo el cuerpo de la pantalla a partir de las listas ya calculadas. */
  function cuerpo(modelo, agro) {
    var por = { meteo: [], agro: agro.slice(), mar: [] };
    modelo.forEach(function (a) { por[TEMAS_MAR[a.tema] ? 'mar' : 'meteo'].push(a); });
    var total = por.meteo.length + por.agro.length + por.mar.length;
    var cuentas = { todas: total, meteo: por.meteo.length, agro: por.agro.length, mar: por.mar.length };
    var filtros = ['todas', 'meteo', 'agro', 'mar'].map(function (f, i) {
      return '<button type="button" class="av-chip" data-filtro="' + f + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + esc(t('avs.f.' + f)) + ' (' + cuentas[f] + ')</button>';
    }).join('');
    var simb = [3, 2, 1, 0].map(function (n) {
      return '<li class="av-s av-s' + n + '"><span class="av-niv av-niv-' + n + '">' + icono(ICONO_NIVEL[n], 'av-ic') + esc(t('niv.' + n)) + '</span> ' + esc(t('avs.s.' + n)) + '</li>';
    }).join('');
    var of = OFICIALES.map(function (o) { return '<a class="av-of" href="' + o.url + '" target="_blank" rel="noopener">' + esc(t('avs.of.' + o.id)) + '</a>'; }).join('');
    return { total: total, html:
      '<div class="av-barra"><div class="chips av-filtros" role="group" aria-label="' + esc(t('avs.filtros')) + '">' + filtros + '</div></div>' +
      '<section class="av-simb" aria-label="' + esc(t('avs.simb')) + '"><ul>' + simb + '</ul></section>' +
      grupo('meteo', por.meteo, t('avs.vacio')) + grupo('agro', por.agro, t('avs.vacioAgro')) + grupo('mar', por.mar, t('avs.vacio')) +
      '<section class="av-ofi" aria-label="' + esc(t('avs.of')) + '"><h2>' + esc(t('avs.of')) + '</h2><p>' + of + '</p></section>' +
      '<p class="fuente av-nota">' + esc(t('avs.nota')) + '</p>' };
  }

  var est = { ficha: 0 };
  function limpiar() { est.ficha++; }
  function pedirAgro() {
    if (typeof fetch === 'undefined') return Promise.resolve(null);
    return fetch('data/agricola.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function filtrar(raiz, f) {
    raiz.querySelectorAll('.av-g').forEach(function (s) { s.hidden = !(f === 'todas' || s.getAttribute('data-grupo') === f); });
    raiz.querySelectorAll('[data-filtro]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtro') === f)); });
  }
  function render(main) {
    limpiar();
    var mi = est.ficha;
    main.innerHTML = '<section class="av" aria-labelledby="av-h1"><div class="av-cab"><p class="hm-mono hm-pildora av-sync" id="av-sync" hidden></p></div>' +
      '<div class="av-titulo"><div><h1 id="av-h1">' + esc(t('titulo.avisos')) + '</h1><p class="av-sub">' + esc(t('avs.sub')) + '</p></div>' +
      '<p class="av-total">' + esc(t('avs.total')) + ' <span class="av-num" id="av-num">…</span></p></div>' +
      '<div id="av-cuerpo"><p class="pe-carga">' + esc(t('avs.cargando')) + '</p></div></section>';
    return Promise.all([V.cargar().then(function (r) { return r.datos; }, function () { return null; }), pedirAgro()]).then(function (r) {
      if (mi !== est.ficha) return;
      main.removeAttribute('aria-busy');
      var datos = r[0], agro = avisosAgro(r[1]), cu = main.querySelector('#av-cuerpo');
      var modelo = datos ? avisosModelo(datos, V.indiceAhora(datos.horas)) : [];
      var c = cuerpo(modelo, agro);
      cu.innerHTML = (datos ? '' : '<p class="aviso" role="alert">' + esc(t('avs.error')) + '</p>') + c.html;
      main.querySelector('#av-num').textContent = c.total;
      var a = V.ahoraLocal(); var s = main.querySelector('#av-sync');
      if (datos && a && s) { s.textContent = t('avs.sync', { h: a.slice(11, 16) }); s.hidden = false; }
      cu.addEventListener('click', function (ev) {
        var b = ev.target.closest ? ev.target.closest('[data-filtro]') : null;
        if (b) filtrar(cu, b.getAttribute('data-filtro'));
      });
    });
  }

  var RBAvisos = { render: render, limpiar: limpiar, avisosModelo: avisosModelo, avisosAgro: avisosAgro, cuerpo: cuerpo, tarjeta: tarjeta, TX: TX };
  if (typeof window !== 'undefined') window.RBAvisos = RBAvisos;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBAvisos;
})();
