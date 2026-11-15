/* El cielo ahora en BCS (issue #144, fase 2): estado del cielo en vivo con íconos, como en el frame
   "Inicio" de Figma (diseno/ESPECIFICACION.md §10). ES5, sin build.
   - Datos: Open-Meteo (modelo meteorológico, no estaciones), CC BY 4.0, con enlace de atribución
     junto a los datos: https://open-meteo.com/ (README de github.com/open-meteo/open-meteo).
   - Imagen: NASA GIBS, GOES-West ABI GeoColor casi en tiempo real (cada 10 min), mismo recuadro que la
     imagen MODIS de web/img (lat 22.8 a 28.1, lon -115.3 a -109.3), así los pines usan las mismas cuentas.
   - Íconos: web/assets/iconos/cielo (Material Symbols, Apache 2.0); tabla en su README.
   - Coordenadas: GeoNames (vía la API de geocodificación de Open-Meteo, 2026-11-15), id entre corchetes.
   Si no hay red, Inicio sigue funcionando con las tendencias. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) ||
    (typeof require !== 'undefined' ? require('./textos.js') : null);
  function t(k, v) { return T.t(k, v); }
  function lang() { return T.lang ? T.lang() : 'es'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Localidades: las MISMAS en las tarjetas y en los pines del mapa (mismo nombre, misma lectura de la misma llamada).
     principal: tarjeta grande. lado: hacia dónde crece la etiqueta del pin (izq o der) y v: si queda arriba o abajo del
     punto, para que no se encimen (Comondú y Bahía Magdalena están a unos 50 km) ni se salgan de la imagen. */
  var LUGARES = [
    { id: 'lapaz', es: 'La Paz', lat: 24.14231, lon: -110.31316, geonames: 4000900, principal: true, lado: 'izq' },
    { id: 'loscabos', es: 'Los Cabos', lat: 22.89088, lon: -109.91238, geonames: 3985710, tarjeta: true, lado: 'izq', v: 'arriba' },
    { id: 'loreto', es: 'Loreto', lat: 26.01217, lon: -111.34888, geonames: 3998287, tarjeta: true, lado: 'der' },
    { id: 'comondu', es: 'Comondú', lat: 25.0321, lon: -111.66256, geonames: 4013723, tarjeta: true, lado: 'der', v: 'arriba' },
    { id: 'mulege', es: 'Mulegé', lat: 26.89141, lon: -111.9826, geonames: 3995236, tarjeta: true, lado: 'der' },
    { id: 'guerreronegro', es: 'Gmo. Negro', lat: 27.96005, lon: -114.05589, geonames: 4021858, tarjeta: true, lado: 'der', v: 'abajo' },
    { id: 'bahiamagdalena', es: 'Bahía Magd.', lat: 24.78874, lon: -112.10504, geonames: 3987485, tarjeta: true, lado: 'izq', v: 'abajo' },
    /* Más lugares solo para el mapa de Clima (2026-11-15; pines chicos, sin tarjeta en Inicio ni pin sobre la imagen de Inicio). Coordenadas: GeoNames (CC BY 4.0). */
    { id: 'todossantos', es: 'Todos Santos', lat: 23.44688, lon: -110.22308, extra: true },
    { id: 'santarosalia', es: 'Santa Rosalía', lat: 27.34035, lon: -112.26706, extra: true },
    { id: 'sanjosedelcabo', es: 'San José del Cabo', lat: 23.05406, lon: -109.70367, extra: true },
    { id: 'cabopulmo', es: 'Cabo Pulmo', lat: 23.43718, lon: -109.42924, extra: true },
    { id: 'laribera', es: 'La Ribera', lat: 23.59581, lon: -109.58586, extra: true },
    { id: 'losbarriles', es: 'Los Barriles', lat: 23.68273, lon: -109.69953, extra: true },
    { id: 'laventana', es: 'La Ventana', lat: 24.05178, lon: -109.98918, extra: true },
    { id: 'sanjuandelacosta', es: 'San Juan de la Costa', lat: 24.37364, lon: -110.68983, extra: true },
    { id: 'puertochale', es: 'Puerto Chale', lat: 24.42463, lon: -111.55287, extra: true },
    { id: 'puertolopezmateos', es: 'Puerto López Mateos', lat: 25.19241, lon: -112.1104, extra: true },
    { id: 'puntaabreojos', es: 'Punta Abreojos', lat: 26.71541, lon: -113.57451, extra: true },
    { id: 'bahiaasuncion', es: 'Bahía Asunción', lat: 27.14231, lon: -114.29582, extra: true },
    { id: 'bahiatortugas', es: 'Bahía Tortugas', lat: 27.69132, lon: -114.8948, extra: true }
  ];
  var CADA_MIN = 10; // tarjetas, pines e imagen se actualizan juntos (GOES-West también cambia cada 10 min)
  var CAJA = { latN: 28.1, latS: 22.8, lonO: -115.3, lonE: -109.3 };
  var API = 'https://api.open-meteo.com/v1/forecast';
  var GOES = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/nrt/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0' +
    '&LAYERS=GOES-West_ABI_GeoColor_v0_NRT&STYLES=&CRS=EPSG:4326&BBOX=22.8,-115.3,28.1,-109.3&WIDTH=1200&HEIGHT=1060&FORMAT=image/jpeg';
  var VIEJO_MIN = 60;
  /* GIBS sin TIME devuelve un cuadro viejo (de noche aunque sea de día; visto el 2026-11-15). Se pide el último cuadro publicado:
     ahora menos 40 min (retraso medido de GOES-West), redondeado a 10 min, y hacia atrás si ese cuadro no existe. */
  function tiempoGoes(ahoraMs, atras) {
    var q = 10 * 60000, d = new Date(Math.floor((ahoraMs - 40 * 60000) / q) * q - (atras || 0) * q);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + 'T' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':00Z';
  }
  function urlGoes(ahoraMs, atras) { return GOES + '&TIME=' + tiempoGoes(ahoraMs, atras); }

  /* Código WMO de Open-Meteo -> ícono y texto (web/assets/iconos/cielo/README.md). */
  var ESTADOS = {
    despejado: { dia: 'sunny', noche: 'clear_night', es: 'Despejado', en: 'Clear', color: 'sol' },
    parcial: { dia: 'partly_cloudy_day', noche: 'partly_cloudy_night', es: 'Parcialmente nublado', en: 'Partly cloudy', color: 'sol' },
    nublado: { dia: 'cloud', noche: 'cloud', es: 'Nublado', en: 'Overcast', color: 'nube' },
    niebla: { dia: 'foggy', noche: 'foggy', es: 'Niebla', en: 'Fog', color: 'nube' },
    llovizna: { dia: 'rainy_light', noche: 'rainy_light', es: 'Llovizna', en: 'Drizzle', color: 'lluvia' },
    lluvia: { dia: 'rainy', noche: 'rainy', es: 'Lluvia o chubasco', en: 'Rain or showers', color: 'lluvia' },
    nieve: { dia: 'cloud', noche: 'cloud', es: 'Nieve', en: 'Snow', color: 'nube' },
    tormenta: { dia: 'thunderstorm', noche: 'thunderstorm', es: 'Tormenta', en: 'Thunderstorm', color: 'tormenta' },
    sinDato: { dia: 'cloud', noche: 'cloud', es: 'Sin dato del cielo', en: 'No sky data', color: 'nube' }
  };
  var LEYENDA = ['despejado', 'parcial', 'nublado', 'niebla', 'llovizna', 'lluvia', 'tormenta'];
  function grupo(c) {
    if (c === 0 || c === 1) return 'despejado';
    if (c === 2) return 'parcial';
    if (c === 3) return 'nublado';
    if (c === 45 || c === 48) return 'niebla';
    if (c >= 51 && c <= 57) return 'llovizna';
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return 'lluvia';
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'nieve';
    if (c >= 95 && c <= 99) return 'tormenta';
    return 'sinDato';
  }
  function estado(codigo, esDia) {
    var g = grupo(codigo), e = ESTADOS[g];
    return { grupo: g, icono: esDia === 0 ? e.noche : e.dia, texto: lang() === 'en' ? e.en : e.es, color: e.color };
  }
  function icono(e, clase) {
    return '<img class="cl-ico cl-' + e.color + (clase ? ' ' + clase : '') + '" src="assets/iconos/cielo/' + e.icono + '.svg" alt="" aria-hidden="true" width="24" height="24">';
  }

  /* Índice UV: categorías de la OMS (Global Solar UV Index, 2002): 0-2 bajo, 3-5 moderado, 6-7 alto, 8-10 muy alto, 11+ extremo. */
  function uvCat(u) {
    if (u == null || isNaN(u)) return '';
    var k = u < 3 ? 'bajo' : u < 6 ? 'moderado' : u < 8 ? 'alto' : u < 11 ? 'muyAlto' : 'extremo';
    return t('cielo.uv.' + k);
  }
  /* Dirección del viento en 8 rumbos (de dónde viene). */
  function rumbo(g) {
    if (g == null || isNaN(g)) return '';
    var es = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'], en = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return (lang() === 'en' ? en : es)[Math.round(((g % 360) + 360) % 360 / 45) % 8];
  }
  function num(v, d) { return v == null || isNaN(v) ? '—' : Number(v).toFixed(d == null ? 0 : d); }

  function url() {
    return API + '?latitude=' + LUGARES.map(function (l) { return l.lat; }).join(',') +
      '&longitude=' + LUGARES.map(function (l) { return l.lon; }).join(',') +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index' +
      '&daily=temperature_2m_min,temperature_2m_max,uv_index_max,precipitation_probability_max,wind_gusts_10m_max&timezone=America%2FMazatlan&forecast_days=1';
  }
  /* Posición del pin sobre la imagen (porcentaje del ancho y alto). */
  function posicion(l) {
    return { x: (l.lon - CAJA.lonO) / (CAJA.lonE - CAJA.lonO) * 100, y: (CAJA.latN - l.lat) / (CAJA.latN - CAJA.latS) * 100 };
  }
  /* Une la respuesta (una entrada por coordenada, en el mismo orden) con las localidades. */
  function unir(resp) {
    var l = Object.prototype.toString.call(resp) === '[object Array]' ? resp : [resp];
    return LUGARES.map(function (lugar, k) {
      var r = l[k] || {}, c = r.current || {}, d = r.daily || {};
      function hoy(v) { return d[v] && typeof d[v][0] === 'number' ? d[v][0] : null; }
      return { lugar: lugar, c: c, min: hoy('temperature_2m_min'), max: hoy('temperature_2m_max'), uvMax: hoy('uv_index_max'),
        lluvia: hoy('precipitation_probability_max'), rachas: hoy('wind_gusts_10m_max'), e: estado(c.weather_code, c.is_day) };
    });
  }
  /* Minutos entre la hora del dato (hora local de La Paz) y "ahora" (Date). */
  function minutosDesde(hora, ahora) {
    var m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(hora || '');
    if (!m) return null;
    var utc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] + 7, +m[5]); // America/Mazatlan = UTC-7, sin horario de verano
    return Math.round(((ahora || new Date()).getTime() - utc) / 60000);
  }

  function seccion(filas, ahora) {
    var p = filas[0], c = p.c, hora = (c.time || '').slice(11, 16), viejo = minutosDesde(c.time, ahora);
    // Sin kicker ni párrafo de fuente (pedido de UI/UX). La atribución que exige CC BY 4.0 queda como enlace en la pastilla.
    var h = '<div class="hm-sec-cab"><h2 id="hm-cielo-h">' + t('cielo.h2') + '</h2>' +
      '<p class="hm-mono hm-pildora cl-act">' + esc(t('cielo.actualizado', { h: hora })) + ' · <a href="https://open-meteo.com/">Open-Meteo</a></p></div>' +
      (viejo != null && viejo > VIEJO_MIN ? '<p class="aviso cl-viejo">' + esc(t('cielo.viejo')) + '</p>' : '') +
      '<div class="hm-rejilla"><article class="hm-principal cl-principal" aria-label="' + esc(p.lugar.es + ': ' + p.e.texto + ', ' + num(c.temperature_2m) + ' °C') + '">' +
      '<div class="hm-barra" aria-hidden="true"></div>' +
      '<div class="hm-prin-cab"><div><p class="hm-mono hm-verde">' + t('cielo.capital') + '</p><h3 class="hm-t-prin">' + esc(p.lugar.es) + '</h3></div>' +
      '<span class="hm-ico-circ">' + icono(p.e) + '</span></div>' +
      '<div class="hm-prin-cifra"><p class="hm-cifra-grande">' + num(c.temperature_2m) + '<span class="cl-unidad">°C</span></p>' +
      '<div><p class="cl-cond">' + esc(p.e.texto) + '</p><p class="cl-sens">' + esc(t('cielo.sensacion', { v: num(c.apparent_temperature, 1) })) + '</p></div></div>' +
      '<div class="hm-datos">' +
      dato(t('cielo.humedad'), num(c.relative_humidity_2m) + ' %') +
      dato(t('cielo.viento') + (rumbo(c.wind_direction_10m) ? ' (' + rumbo(c.wind_direction_10m) + ')' : ''), num(c.wind_speed_10m) + ' km/h') +
      dato(t('cielo.uv'), num(c.uv_index) + (uvCat(c.uv_index) ? ' ' + uvCat(c.uv_index) : '')) +
      dato(t('cielo.presion'), num(c.surface_pressure) + ' hPa') +
      '</div></article><div class="hm-peques cl-peques">';
    filas.forEach(function (f) {
      if (!f.lugar.tarjeta) return;
      h += '<article class="hm-peque cl-peque" aria-label="' + esc(f.lugar.es + ': ' + f.e.texto + ', ' + num(f.c.temperature_2m) + ' °C') + '">' +
        '<div class="hm-peq-cab"><h3 class="hm-t-peq">' + esc(f.lugar.es) + '</h3>' + icono(f.e) + '</div>' +
        '<div class="hm-peq-val"><p class="hm-cifra">' + num(f.c.temperature_2m) + '°C</p>' +
        (f.min != null ? '<span class="hm-mono hm-p">' + esc(t('cielo.min', { v: num(f.min) })) + '</span>' : '') + '</div></article>';
    });
    h += '</div></div>';
    return h;
  }
  function dato(k, v) {
    return '<div class="hm-dato"><span class="hm-dato-k">' + esc(k) + '</span><span class="hm-dato-v">' + esc(v) + '</span></div>';
  }
  /* Un pin por tarjeta, con el mismo nombre, ícono y temperatura que su tarjeta. */
  function pines(filas) {
    return filas.filter(function (f) { return !f.lugar.extra; }).map(function (f) {
      var l = f.lugar, p = posicion(l), oscuro = l.principal;
      var clase = (oscuro ? ' cl-pin-oscuro' : '') + (l.lado === 'izq' ? ' cl-pin-izq' : '') + (l.v ? ' cl-pin-' + l.v : '');
      return '<span class="cl-pin' + clase + '" data-lugar="' + esc(l.id) + '" style="left:' + p.x.toFixed(2) + '%;top:' + p.y.toFixed(2) + '%" role="img" aria-label="' +
        esc(l.es + ': ' + f.e.texto + ', ' + num(f.c.temperature_2m) + ' °C') + '">' + icono(f.e, oscuro ? 'cl-blanco' : '') +
        '<span aria-hidden="true">' + esc(l.es + ' ' + num(f.c.temperature_2m) + '°C') + '</span></span>';
    }).join('');
  }
  function leyenda() {
    return '<p class="hm-mono cl-ley-t">' + t('cielo.leyenda') + '</p><ul>' + LEYENDA.map(function (g) {
      var e = ESTADOS[g];
      return '<li>' + icono({ icono: e.dia, color: e.color }) + esc(lang() === 'en' ? e.en : e.es) + '</li>';
    }).join('') + '</ul><p class="hm-mono cl-ley-n">' + t('cielo.leyendaNota') + '</p>';
  }

  /* Marcado inicial (lo pone home.js): sección con "cargando" y mapa con la imagen GOES-West. */
  function marcoSeccion() {
    return '<section class="hm-sec cl-sec" id="hm-cielo" aria-labelledby="hm-cielo-h" aria-busy="true">' +
      '<div class="hm-sec-cab"><h2 id="hm-cielo-h">' + t('cielo.h2') + '</h2></div><p class="cl-estado">' + t('cielo.cargando') + '</p></section>';
  }
  function marcoMapa(altMODIS) {
    return '<div class="cl-lienzo"><img class="cl-img" src="' + urlGoes(Date.now(), 0) + '" width="1200" height="1060" alt="' + esc(t('cielo.altGoes')) + '" ' +
      'data-respaldo="img/bcs-modis-2025-04-20.jpg" data-alt-respaldo="' + esc(altMODIS) + '">' +
      '<div class="cl-pines" id="hm-cielo-pines"></div></div>' +
      '<div class="cl-leyenda" id="hm-cielo-leyenda">' + leyenda() + '</div>';
  }

  var reloj = null;
  /* Vuelve a pedir los datos y la imagen cada CADA_MIN minutos mientras Inicio siga en pantalla. */
  function programar(raiz, opciones) {
    if (reloj) clearTimeout(reloj);
    var ms = opciones.intervalo == null ? CADA_MIN * 60000 : opciones.intervalo;
    if (!ms || typeof setTimeout === 'undefined') return;
    reloj = setTimeout(function () {
      reloj = null;
      var sec = raiz.querySelector('#hm-cielo');
      if (!sec || (sec.isConnected === false)) return; // ya se salió de Inicio
      var img = raiz.querySelector('.cl-img');
      if (img && img.src.indexOf('gibs') >= 0 && !(img.getAttribute && img.getAttribute('data-anim'))) img.src = urlGoes(Date.now(), 0) + '&_=' + Math.floor(Date.now() / (CADA_MIN * 60000));
      cargar(raiz, opciones);
    }, ms);
  }
  /* Animación de la imagen de Inicio (Carlos, 2026-11-15): las últimas 2 horas de cuadros de GOES-West (12 cuadros, cada 10 min) en bucle, con pausa.
     Solo imágenes reales de GIBS que existen (se precargan y se descartan las que fallan). No arranca sola si la persona pide menos movimiento. */
  var ANIM = { cuadros: 12, pausaMs: 600, finMs: 1400 };
  function horaCuadro(iso) {
    try { return new Date(Date.parse(iso)).toLocaleTimeString(T.locale ? T.locale() : 'es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mazatlan' }); } catch (e) { return iso.slice(11, 16); }
  }
  function animar(raiz) {
    var img = raiz.querySelector && raiz.querySelector('.cl-img');
    if (!img || !img.parentNode || (img.getAttribute && img.getAttribute('data-anim')) || String(img.src).indexOf('gibs') < 0 || typeof Image === 'undefined') return;
    var lienzo = img.parentNode, ahora = Date.now(), ok = [], pend = ANIM.cuadros;
    function fin() {
      if (--pend) return;
      ok.sort(function (a, b) { return b.k - a.k; });   // del más viejo al más nuevo
      if (ok.length < 4 || !img.isConnected) return;
      img.setAttribute('data-anim', '1');
      var caja = document.createElement('div'); caja.className = 'cl-anim';
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cl-anim-btn';
      var hora = document.createElement('span'); hora.className = 'cl-anim-hora'; hora.setAttribute('aria-live', 'off');
      caja.appendChild(btn); caja.appendChild(hora); lienzo.appendChild(caja);
      var i = ok.length - 1, timer = null;
      function ver(n) { i = n; img.src = ok[n].u; hora.textContent = horaCuadro(ok[n].iso); }
      function rotulo(on) { btn.textContent = on ? '⏸ ' + t('cielo.pausa') : '▶ ' + t('cielo.play'); btn.setAttribute('aria-label', t('cielo.animAria')); }
      function parar() { if (timer) { clearTimeout(timer); timer = null; } rotulo(false); }
      function paso() {
        timer = setTimeout(function () {
          if (!img.isConnected) { timer = null; return; }
          if (i >= ok.length - 1) { timer = setTimeout(function () { ver(0); paso(); }, ANIM.finMs); return; }
          ver(i + 1); paso();
        }, ANIM.pausaMs);
      }
      function jugar() { rotulo(true); if (i >= ok.length - 1) ver(0); paso(); }
      btn.addEventListener('click', function () { if (timer) parar(); else jugar(); });
      ver(ok.length - 1); rotulo(false);
      var quieto = false;
      try { quieto = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { quieto = false; }
      if (!quieto) jugar();
    }
    for (var k = ANIM.cuadros - 1; k >= 0; k--) (function (k) {
      var u = urlGoes(ahora, k), im = new Image();
      im.onload = function () { ok.push({ k: k, u: u, iso: tiempoGoes(ahora, k) }); fin(); };
      im.onerror = fin;
      im.src = u;
    })(k);
  }
  /* Una sola respuesta compartida por Inicio y la pestaña Mapa durante CADA_MIN minutos: las dos pantallas muestran
     siempre las mismas cifras. opciones.fetch permite probar sin red. */
  var CACHE = null;
  function datos(opciones) {
    opciones = opciones || {};
    var pedir = opciones.fetch || (typeof fetch !== 'undefined' ? fetch : null);
    if (!pedir) return Promise.reject(new Error('sin fetch'));
    var ahora = Date.now();
    if (!opciones.fetch && CACHE && ahora - CACHE.t < CADA_MIN * 60000) return CACHE.p;
    var p = pedir(url()).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(unir);
    if (!opciones.fetch) { CACHE = { t: ahora, p: p }; p.catch(function () { CACHE = null; }); }
    return p;
  }
  function cargar(raiz, opciones) {
    opciones = opciones || {};
    if (!raiz || typeof raiz.querySelector !== 'function') return Promise.resolve(false);
    var sec = raiz.querySelector('#hm-cielo'), pin = raiz.querySelector('#hm-cielo-pines'), img = raiz.querySelector('.cl-img');
    var atras = 0;
    if (img) img.onerror = function () { // si el cuadro no existe, uno anterior (hasta 4); si GIBS no responde, la imagen MODIS fija
      if (atras < 4 && img.src.indexOf('gibs') >= 0) { atras++; img.src = urlGoes(Date.now(), atras); return; }
      img.onerror = null; img.src = img.getAttribute('data-respaldo'); img.alt = img.getAttribute('data-alt-respaldo');
      var ins = raiz.querySelector('.hm-insignia'); if (ins) ins.lastChild.nodeValue = t('home.insignia');
      var cr = raiz.querySelector('.hm-cred'); if (cr) cr.textContent = t('home.cred');
    };
    if (!sec || (!opciones.fetch && typeof fetch === 'undefined')) return Promise.resolve(false);
    return datos(opciones).then(function (filas) {
      // Una sola respuesta pinta las tarjetas, los pines y la hora de la leyenda: siempre coinciden.
      sec.innerHTML = seccion(filas, opciones.ahora);
      sec.removeAttribute('aria-busy');
      if (pin) pin.innerHTML = pines(filas);
      var nota = raiz.querySelector('#hm-cielo-leyenda .cl-ley-n');
      if (nota) nota.textContent = t('cielo.sincro', { h: (filas[0].c.time || '').slice(11, 16) });
      programar(raiz, opciones);
      if (!opciones.fetch) animar(raiz);
      return true;
    }).catch(function () {
      if (sec.innerHTML.indexOf('cl-estado') >= 0) sec.innerHTML = sec.innerHTML.replace(/<p class="cl-estado">[\s\S]*<\/p>/, '<p class="cl-estado cl-error">' + t('cielo.error') + '</p>');
      sec.removeAttribute('aria-busy');
      programar(raiz, opciones);
      return false;
    });
  }

  var RBCielo = { LUGARES: LUGARES, ESTADOS: ESTADOS, grupo: grupo, estado: estado, url: url, posicion: posicion, unir: unir,
    minutosDesde: minutosDesde, seccion: seccion, pines: pines, leyenda: leyenda, marcoSeccion: marcoSeccion, marcoMapa: marcoMapa,
    cargar: cargar, datos: datos, uvCat: uvCat, rumbo: rumbo, num: num, icono: icono, GOES: GOES, ANIM: ANIM, animar: animar, urlGoes: urlGoes, tiempoGoes: tiempoGoes, CADA_MIN: CADA_MIN };
  if (typeof window !== 'undefined') window.RBCielo = RBCielo;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBCielo;
})();
