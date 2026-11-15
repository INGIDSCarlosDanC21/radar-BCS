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

  /* Localidades. principal: tarjeta grande; tarjeta: mini-tarjeta; pin: pin del mapa (como en Figma). */
  var LUGARES = [
    { id: 'lapaz', es: 'La Paz', lat: 24.14231, lon: -110.31316, geonames: 4000900, principal: true, pin: 'La Paz' },
    { id: 'loscabos', es: 'Los Cabos', lat: 22.89088, lon: -109.91238, geonames: 3985710, tarjeta: true, pin: 'Cabo San Lucas' },
    { id: 'loreto', es: 'Loreto', lat: 26.01217, lon: -111.34888, geonames: 3998287, tarjeta: true, pin: 'Loreto' },
    { id: 'comondu', es: 'Comondú', lat: 25.0321, lon: -111.66256, geonames: 4013723, tarjeta: true },
    { id: 'mulege', es: 'Mulegé', lat: 26.89141, lon: -111.9826, geonames: 3995236, tarjeta: true },
    { id: 'guerreronegro', es: 'Gmo. Negro', lat: 27.96005, lon: -114.05589, geonames: 4021858, tarjeta: true },
    { id: 'bahiamagdalena', es: 'Bahía Magd.', lat: 24.78874, lon: -112.10504, geonames: 3987485, tarjeta: true, pin: 'Bahía Magd.' },
    { id: 'santarosalia', es: 'Santa Rosalía', lat: 27.34035, lon: -112.26706, geonames: 3983805, pin: 'Santa Rosalía' }
  ];
  var CAJA = { latN: 28.1, latS: 22.8, lonO: -115.3, lonE: -109.3 };
  var API = 'https://api.open-meteo.com/v1/forecast';
  var GOES = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/nrt/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0' +
    '&LAYERS=GOES-West_ABI_GeoColor_v0_NRT&STYLES=&CRS=EPSG:4326&BBOX=22.8,-115.3,28.1,-109.3&WIDTH=1200&HEIGHT=1060&FORMAT=image/jpeg';
  var VIEJO_MIN = 60;

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
      '&daily=temperature_2m_min&timezone=America%2FMazatlan&forecast_days=1';
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
      return { lugar: lugar, c: c, min: d.temperature_2m_min ? d.temperature_2m_min[0] : null, e: estado(c.weather_code, c.is_day) };
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
    var h = '<div class="hm-sec-cab"><div><p class="hm-mono hm-eti"><i class="hm-punto"></i>' + t('cielo.kicker') + '</p>' +
      '<h2 id="hm-cielo-h">' + t('cielo.h2') + '</h2></div>' +
      '<p class="hm-mono hm-pildora">' + esc(t('cielo.actualizado', { h: hora })) + '</p></div>' +
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
    h += '</div></div><p class="hm-mono cl-fuente">' + t('cielo.fuente') + '</p>';
    return h;
  }
  function dato(k, v) {
    return '<div class="hm-dato"><span class="hm-dato-k">' + esc(k) + '</span><span class="hm-dato-v">' + esc(v) + '</span></div>';
  }
  function pines(filas) {
    return filas.filter(function (f) { return f.lugar.pin; }).map(function (f) {
      var p = posicion(f.lugar), oscuro = f.lugar.principal;
      // Los pines del lado este crecen hacia la izquierda y los del borde sur hacia arriba, para no salirse de la imagen.
      var clase = (oscuro ? ' cl-pin-oscuro' : '') + (p.x > 55 ? ' cl-pin-izq' : '') + (p.y > 88 ? ' cl-pin-arriba' : '');
      return '<span class="cl-pin' + clase + '" style="left:' + p.x.toFixed(2) + '%;top:' + p.y.toFixed(2) + '%" role="img" aria-label="' +
        esc(f.lugar.pin + ': ' + f.e.texto + ', ' + num(f.c.temperature_2m) + ' °C') + '">' + icono(f.e, oscuro ? 'cl-blanco' : '') +
        '<span aria-hidden="true">' + esc(f.lugar.pin + ' ' + num(f.c.temperature_2m) + '°C') + '</span></span>';
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
      '<div class="hm-sec-cab"><div><p class="hm-mono hm-eti"><i class="hm-punto"></i>' + t('cielo.kicker') + '</p>' +
      '<h2 id="hm-cielo-h">' + t('cielo.h2') + '</h2></div></div><p class="cl-estado">' + t('cielo.cargando') + '</p></section>';
  }
  function marcoMapa(altMODIS) {
    return '<div class="cl-lienzo"><img class="cl-img" src="' + GOES + '" width="1200" height="1060" alt="' + esc(t('cielo.altGoes')) + '" ' +
      'data-respaldo="img/bcs-modis-2025-04-20.jpg" data-alt-respaldo="' + esc(altMODIS) + '">' +
      '<div class="cl-pines" id="hm-cielo-pines"></div></div>' +
      '<div class="cl-leyenda" id="hm-cielo-leyenda">' + leyenda() + '</div>';
  }

  function cargar(raiz, opciones) {
    opciones = opciones || {};
    if (!raiz || typeof raiz.querySelector !== 'function') return Promise.resolve(false);
    var sec = raiz.querySelector('#hm-cielo'), pin = raiz.querySelector('#hm-cielo-pines'), img = raiz.querySelector('.cl-img');
    if (img) img.onerror = function () { // si GIBS no responde, la imagen MODIS fija
      img.onerror = null; img.src = img.getAttribute('data-respaldo'); img.alt = img.getAttribute('data-alt-respaldo');
      var ins = raiz.querySelector('.hm-insignia'); if (ins) ins.lastChild.nodeValue = t('home.insignia');
      var cr = raiz.querySelector('.hm-cred'); if (cr) cr.textContent = t('home.cred');
    };
    var pedir = opciones.fetch || (typeof fetch !== 'undefined' ? fetch : null);
    if (!sec || !pedir) return Promise.resolve(false);
    return pedir(url()).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (resp) {
      var filas = unir(resp);
      sec.innerHTML = seccion(filas, opciones.ahora);
      sec.removeAttribute('aria-busy');
      if (pin) pin.innerHTML = pines(filas);
      return true;
    }).catch(function () {
      sec.innerHTML = sec.innerHTML.replace(/<p class="cl-estado">[\s\S]*<\/p>/, '<p class="cl-estado cl-error">' + t('cielo.error') + '</p>');
      sec.removeAttribute('aria-busy');
      return false;
    });
  }

  var RBCielo = { LUGARES: LUGARES, ESTADOS: ESTADOS, grupo: grupo, estado: estado, url: url, posicion: posicion, unir: unir,
    minutosDesde: minutosDesde, seccion: seccion, pines: pines, leyenda: leyenda, marcoSeccion: marcoSeccion, marcoMapa: marcoMapa,
    cargar: cargar, uvCat: uvCat, rumbo: rumbo, GOES: GOES };
  if (typeof window !== 'undefined') window.RBCielo = RBCielo;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBCielo;
})();
