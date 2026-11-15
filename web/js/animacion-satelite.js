/* Animación del cielo (decisión de Carlos, 2026-11-15): imágenes REALES de satélite de la NASA (servicio GIBS) en secuencia, como las de un noticiero.
   Nubes: GOES-West ABI GeoColor (NOAA), un cuadro cada 10 min. Lluvia: IMERG (NASA GPM), un cuadro cada 30 min.
   Solo se reproducen imágenes que existen: no hay modelo, pronóstico ni trayectoria inventada (regla 1 de AGENTS.md).
   Es un bloque plegable en la pantalla Clima, aislado del resto: si GIBS o Leaflet fallan, solo ese bloque avisa. ES5, sin build. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var t = T.t;
  var GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/';
  var ZONA = 'America/Mazatlan';   // hora de La Paz, B.C.S.
  var PAUSA_MS = 450;              // ms por cuadro al reproducir

  /* Capas medidas en GIBS el 2026-11-15: GOES-West_ABI_GeoColor (10 min, Level7) e IMERG_Precipitation_Rate_30min (30 min, Level6).
     retraso: minutos que se retrocede desde "ahora" antes de buscar el último cuadro publicado (GOES ~40 min; IMERG ~6 h). */
  var CAPAS = {
    nubes: { id: 'GOES-West_ABI_GeoColor', matriz: 'GoogleMapsCompatible_Level7', nativo: 7, ext: 'png', paso: 10, cuadros: 18, retraso: 20, opacidad: 0.9,
             sonda: [7, 55, 24], atrib: 'NASA EOSDIS GIBS / GOES-West (NOAA)' },
    lluvia: { id: 'IMERG_Precipitation_Rate_30min', matriz: 'GoogleMapsCompatible_Level6', nativo: 6, ext: 'png', paso: 30, cuadros: 12, retraso: 180, opacidad: 0.85,
              sonda: [6, 27, 12], atrib: 'NASA EOSDIS GIBS / IMERG (NASA GPM)' }
  };
  /* Colores de la leyenda de lluvia: escala «Rain Rate» (mm/h) de https://gibs.earthdata.nasa.gov/colormaps/v1.3/GPM_Precipitation_Rate.xml, valores 0.1 a 50. */
  var LEY_LLUVIA = [['0.1', '0,118,78'], ['0.5', '69,192,0'], ['1', '195,228,0'], ['2', '255,176,6'], ['5', '255,71,48'], ['10', '231,0,0'], ['20', '156,0,0'], ['50', '63,0,0']];

  var TX = {
    es: {
      'ani.h': 'Ver el cielo moverse', 'ani.sub': 'Imágenes de satélite reales de las últimas horas',
      'ani.lead': 'Fotos reales de satélite de la NASA, una detrás de otra, como las de un noticiero. Elige nubes o lluvia y pulsa Reproducir.',
      'ani.capa': 'Qué ver', 'ani.nubes': 'Nubes', 'ani.lluvia': 'Lluvia',
      'ani.region': 'Mapa animado de satélite de Baja California Sur', 'ani.cuadro': 'Cuadro de la animación',
      'ani.play': 'Reproducir', 'ani.pausa': 'Pausar', 'ani.cargando': 'Buscando la imagen más reciente…',
      'ani.txtNubes': 'Nubes vistas por el satélite GOES-West: de {a} a {b}, hora de La Paz. Un cuadro cada 10 minutos.',
      'ani.txtLluvia': 'Lluvia estimada por satélite (IMERG): de {a} a {b}, hora de La Paz. Un cuadro cada 30 minutos. Llega con unas 6 horas de retraso.',
      'ani.cuando': '{d} · {h}',
      'ani.leyTit': 'Intensidad de la lluvia (mm por hora)', 'ani.leySin': 'Sin color: no se detecta lluvia',
      'ani.aviso': 'Son imágenes reales, no un pronóstico ni un aviso oficial. Si hay un ciclón o una tormenta, aquí ves sus nubes y su lluvia; la trayectoria oficial está en Avisos. La lluvia por satélite es una estimación y puede fallar en lluvias muy ligeras o locales.',
      'ani.cred': 'Imágenes: NASA EOSDIS GIBS. Nubes: GOES-West ABI GeoColor (NOAA). Lluvia: IMERG (NASA GPM). Mapa base: © OpenStreetMap contributors. Sin conexión no se ven.',
      'ani.error': 'No se pudieron cargar las imágenes de satélite (¿sin conexión?). El resto de la pantalla sigue funcionando.',
      'ani.sinImagen': 'No encontramos una imagen reciente de esta capa. Prueba de nuevo en unos minutos.',
      'ani.avisos': 'Ver los avisos oficiales'
    },
    en: {
      'ani.h': 'Watch the sky move', 'ani.sub': 'Real satellite images from the last hours',
      'ani.lead': 'Real NASA satellite images, one after another, like the ones on the news. Choose clouds or rain and press Play.',
      'ani.capa': 'What to see', 'ani.nubes': 'Clouds', 'ani.lluvia': 'Rain',
      'ani.region': 'Animated satellite map of Baja California Sur', 'ani.cuadro': 'Animation frame',
      'ani.play': 'Play', 'ani.pausa': 'Pause', 'ani.cargando': 'Looking for the latest image…',
      'ani.txtNubes': 'Clouds seen by the GOES-West satellite: from {a} to {b}, La Paz time. One frame every 10 minutes.',
      'ani.txtLluvia': 'Rain estimated by satellite (IMERG): from {a} to {b}, La Paz time. One frame every 30 minutes. It arrives about 6 hours late.',
      'ani.cuando': '{d} · {h}',
      'ani.leyTit': 'Rain intensity (mm per hour)', 'ani.leySin': 'No color: no rain detected',
      'ani.aviso': 'These are real images, not a forecast or an official warning. If there is a cyclone or a storm, you see its clouds and rain here; the official track is in Alerts. Satellite rain is an estimate and may miss very light or very local rain.',
      'ani.cred': 'Images: NASA EOSDIS GIBS. Clouds: GOES-West ABI GeoColor (NOAA). Rain: IMERG (NASA GPM). Base map: © OpenStreetMap contributors. They do not show offline.',
      'ani.error': 'The satellite images could not be loaded (offline?). The rest of the screen keeps working.',
      'ani.sinImagen': 'We could not find a recent image for this layer. Try again in a few minutes.',
      'ani.avisos': 'See the official alerts'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /* ---------- Fechas y direcciones (puro, probado en web/tests/animacion-satelite.test.mjs) ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* ISO UTC "2026-11-15T14:30:00Z" del múltiplo de `paso` minutos igual o anterior a `ms`. */
  function iso(ms, paso) {
    var q = paso * 60000, r = Math.floor(ms / q) * q, d = new Date(r);
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':00Z';
  }
  function aMs(isoStr) { return Date.parse(isoStr); }
  /* Candidato más reciente: "ahora" menos el retraso típico de la capa. */
  function candidato(ahoraMs, capa) { return iso(ahoraMs - capa.retraso * 60000, capa.paso); }
  /* Los `n` cuadros que terminan en `finIso`, del más viejo al más nuevo. */
  function cuadros(finIso, n, paso) {
    var fin = aMs(finIso), out = [];
    for (var i = n - 1; i >= 0; i--) out.push(iso(fin - i * paso * 60000, paso));
    return out;
  }
  function plantilla(capa, tiempo) { return GIBS + capa.id + '/default/' + tiempo + '/' + capa.matriz + '/{z}/{y}/{x}.' + capa.ext; }
  function urlSonda(capa, tiempo) {
    var s = capa.sonda;
    return GIBS + capa.id + '/default/' + tiempo + '/' + capa.matriz + '/' + s[0] + '/' + s[1] + '/' + s[2] + '.' + capa.ext;
  }
  function hora(isoStr) {
    try { return new Date(aMs(isoStr)).toLocaleTimeString(T.locale(), { hour: '2-digit', minute: '2-digit', timeZone: ZONA }); } catch (e) { return isoStr.slice(11, 16); }
  }
  function dia(isoStr) {
    try { return new Date(aMs(isoStr)).toLocaleDateString(T.locale(), { day: 'numeric', month: 'short', timeZone: ZONA }); } catch (e) { return isoStr.slice(0, 10); }
  }

  /* ---------- Bloque en pantalla ---------- */
  function degradado() {
    return 'linear-gradient(90deg,' + LEY_LLUVIA.map(function (c) { return 'rgb(' + c[1] + ')'; }).join(',') + ')';
  }
  function html() {
    return '<section class="bloque ani" id="ani" aria-labelledby="ani-h"><details id="ani-det" open>' +
      '<summary class="ani-sum"><span id="ani-h" class="ani-tit">' + esc(t('ani.h')) + '</span><span class="ani-sub">' + esc(t('ani.sub')) + '</span></summary>' +
      '<div class="ani-cuerpo" id="ani-cuerpo"><p>' + esc(t('ani.lead')) + '</p>' +
      '<div class="chips" role="group" aria-label="' + esc(t('ani.capa')) + '">' +
        '<button type="button" class="sim-chip" data-ani="nubes" aria-pressed="true">' + esc(t('ani.nubes')) + '</button>' +
        '<button type="button" class="sim-chip" data-ani="lluvia" aria-pressed="false">' + esc(t('ani.lluvia')) + '</button></div>' +
      '<div id="ani-aviso" role="status"></div>' +
      '<div id="ani-mapa" class="sim-mapa ani-mapa" role="region" aria-label="' + esc(t('ani.region')) + '"></div>' +
      '<div class="sim-ctrl"><button type="button" class="sim-chip sim-play" id="ani-play"></button>' +
        '<label class="sr" for="ani-rng">' + esc(t('ani.cuadro')) + '</label>' +
        '<input type="range" id="ani-rng" min="0" max="0" step="1" value="0" disabled>' +
        '<output class="sim-anio-g sim-anio-ch ani-hora" id="ani-hora" for="ani-rng"></output></div>' +
      '<div id="ani-ley" class="sim-ley"></div>' +
      '<p class="sim-frase" id="ani-txt" aria-live="polite"></p>' +
      '<p class="aviso">' + esc(t('ani.aviso')) + ' <a href="#avisos">' + esc(t('ani.avisos')) + '</a></p>' +
      '<p class="fuente">' + esc(t('ani.cred')) + '</p></div></details></section>';
  }

  var est = { ficha: 0, mapa: null, timer: null, capa: 'nubes', marcos: [], i: 0 };
  function parar() { if (est.timer) { clearTimeout(est.timer); est.timer = null; } }
  function limpiar() {
    est.ficha++;
    parar();
    if (est.mapa) { try { est.mapa.remove(); } catch (e) {} }
    est.mapa = null; est.marcos = []; est.i = 0;
  }

  /* Busca hacia atrás (hasta 8 pasos) el cuadro más reciente cuya imagen existe; devuelve el ISO o null. */
  function ultimoPublicado(capa, ahoraMs, callback) {
    var inicio = aMs(candidato(ahoraMs, capa)), intentos = 0;
    function probar() {
      if (intentos >= 8) return callback(null);
      var tiempo = iso(inicio - intentos * capa.paso * 60000, capa.paso);
      var img = new Image();
      var hecho = false;
      function fin(ok) { if (hecho) return; hecho = true; if (ok) callback(tiempo); else { intentos++; probar(); } }
      img.onload = function () { fin(true); };
      img.onerror = function () { fin(false); };
      setTimeout(function () { fin(false); }, 6000);
      img.src = urlSonda(capa, tiempo);
    }
    probar();
  }

  function reducirMovimiento() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  function activar(raiz) {
    var cont = raiz.querySelector('#ani');
    if (!cont) return;
    limpiar();
    var mi = est.ficha;
    est.capa = 'nubes';
    function q(id) { return cont.querySelector('#' + id); }
    var det = q('ani-det'), rng = q('ani-rng'), play = q('ani-play'), caja = q('ani-mapa'), aviso = q('ani-aviso');
    function rotuloPlay(on) { play.textContent = (on ? '⏸ ' + t('ani.pausa') : '▶ ' + t('ani.play')); }
    rotuloPlay(false);
    var iniciado = false;

    function leyenda() {
      var el = q('ani-ley');
      if (est.capa === 'lluvia') {
        el.innerHTML = '<p class="sim-ley-tit">' + esc(t('ani.leyTit')) + '</p><div class="sim-ley-barra" style="background:' + degradado() + '"></div>' +
          '<div class="sim-ley-marcas" aria-hidden="true">' + LEY_LLUVIA.map(function (c) { return '<span>' + c[0] + '</span>'; }).join('') + '</div>' +
          '<div class="sim-ley-ext"><span>' + esc(t('ani.leySin')) + '</span></div>';
      } else { el.innerHTML = ''; }
    }
    function mostrar(i) {
      if (!est.marcos.length) return;
      i = Math.max(0, Math.min(est.marcos.length - 1, i));
      est.marcos.forEach(function (m, k) { m.capa.setOpacity(k === i ? CAPAS[est.capa].opacidad : 0); });
      est.i = i; rng.value = i;
      var f = est.marcos[i].iso;
      q('ani-hora').textContent = t('ani.cuando', { d: dia(f), h: hora(f) });
      rng.setAttribute('aria-valuetext', hora(f));
    }
    function texto(cuadrosIso) {
      var clave = est.capa === 'nubes' ? 'ani.txtNubes' : 'ani.txtLluvia';
      q('ani-txt').textContent = t(clave, { a: hora(cuadrosIso[0]), b: hora(cuadrosIso[cuadrosIso.length - 1]) });
    }
    function quitarCuadros() {
      parar(); rotuloPlay(false);
      est.marcos.forEach(function (m) { try { est.mapa && est.mapa.removeLayer(m.capa); } catch (e) {} });
      est.marcos = [];
    }
    function cargarCapa() {
      var def = CAPAS[est.capa], capaPedida = est.capa;
      quitarCuadros();
      aviso.innerHTML = '<p class="aviso">' + esc(t('ani.cargando')) + '</p>';
      rng.disabled = true; play.disabled = true; leyenda();
      ultimoPublicado(def, Date.now(), function (fin) {
        if (mi !== est.ficha || capaPedida !== est.capa || !est.mapa) return;
        if (!fin) { aviso.innerHTML = '<p class="aviso">' + esc(t('ani.sinImagen')) + '</p>'; return; }
        aviso.innerHTML = '';
        var lista = cuadros(fin, def.cuadros, def.paso);
        est.marcos = lista.map(function (tiempo) {
          var capa = L.tileLayer(plantilla(def, tiempo), { maxNativeZoom: def.nativo, maxZoom: 8, opacity: 0, zIndex: 5, attribution: def.atrib });
          capa.addTo(est.mapa);
          return { iso: tiempo, capa: capa };
        });
        rng.min = 0; rng.max = lista.length - 1; rng.disabled = false; play.disabled = false;
        texto(lista); mostrar(lista.length - 1);
        if (!reducirMovimiento()) setTimeout(function () { if (mi === est.ficha && capaPedida === est.capa && !est.timer) reproducir(); }, 400);   // arranca sola, salvo que la persona pida menos movimiento
      });
    }
    function reproducir() {
      if (est.timer) { parar(); rotuloPlay(false); return; }
      if (est.i >= est.marcos.length - 1) mostrar(0);
      rotuloPlay(true);
      (function paso() {
        est.timer = setTimeout(function () {
          if (mi !== est.ficha) return;
          if (est.i >= est.marcos.length - 1) {   // da la vuelta como en un noticiero: pausa en el último cuadro y vuelve al primero
            est.timer = setTimeout(function () { if (mi !== est.ficha) return; mostrar(0); paso(); }, 1500);
            return;
          }
          mostrar(est.i + 1); paso();
        }, PAUSA_MS);
      })();
    }
    function iniciar() {
      if (iniciado) return; iniciado = true;
      if (typeof L === 'undefined') { aviso.innerHTML = '<p class="aviso">' + esc(t('ani.error')) + '</p>'; caja.hidden = true; play.disabled = true; return; }
      try {
        est.mapa = L.map(caja, { scrollWheelZoom: false, minZoom: 5, maxZoom: 8 }).setView([24.8, -111.2], 6);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, zIndex: 1, attribution: '© OpenStreetMap contributors' }).addTo(est.mapa);
      } catch (e) { aviso.innerHTML = '<p class="aviso">' + esc(t('ani.error')) + '</p>'; caja.hidden = true; play.disabled = true; return; }
      cargarCapa();
    }
    if (det.open) setTimeout(function () { if (mi === est.ficha) iniciar(); }, 0);   // abierto de entrada: se ve sin tocar nada
    det.addEventListener('toggle', function () {
      if (det.open) { iniciar(); if (est.mapa) setTimeout(function () { try { est.mapa.invalidateSize(); } catch (e) {} }, 60); }
      else { parar(); rotuloPlay(false); }
    });
    cont.querySelectorAll('[data-ani]').forEach(function (b) {
      b.addEventListener('click', function () {
        est.capa = b.getAttribute('data-ani');
        cont.querySelectorAll('[data-ani]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        if (est.mapa) cargarCapa();
      });
    });
    play.addEventListener('click', reproducir);
    rng.addEventListener('input', function () { parar(); rotuloPlay(false); mostrar(+rng.value); });
  }

  var RBAnim = { html: html, activar: activar, limpiar: limpiar, CAPAS: CAPAS, LEY_LLUVIA: LEY_LLUVIA, iso: iso, candidato: candidato, cuadros: cuadros,
    plantilla: plantilla, urlSonda: urlSonda, hora: hora, TX: TX };
  if (typeof window !== 'undefined') window.RBAnim = RBAnim;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBAnim;
})();
