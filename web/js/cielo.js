/* "El cielo ahora en BCS" (Inicio): estado del cielo y temperatura de 7 localidades con íconos (#144, fase 2; Carlos lo aprobó en el chat el 2026-11-15).
   Datos: Open-Meteo (modelo meteorológico, NO son estaciones), CC BY 4.0 con atribución en pantalla; se piden desde el navegador.
   Es el estado de ahora, no una tendencia: la sección lo dice. Íconos: Google Material Symbols (web/assets/iconos/cielo/, Apache-2.0).
   Foto de fondo del mapa: NASA GIBS, VIIRS NOAA-20 a color, del día anterior (franja ancha: sin huecos negros como los de MODIS). ES5, sin build. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var RB = (typeof window !== 'undefined' && window.RB) || (typeof require !== 'undefined' ? require('./reglas.js') : null);
  var t = T.t;

  /* Localidades (GeoNames, vía https://geocoding-api.open-meteo.com, 2026-11-15). Los Cabos = Cabo San Lucas;
     Comondú = Ciudad Constitución; Bahía Magdalena = Puerto San Carlos. */
  var LOC = [
    { id: 'lapaz', nombre: 'La Paz', lat: 24.142, lon: -110.313 },
    { id: 'cabos', nombre: 'Los Cabos', lat: 22.891, lon: -109.912 },
    { id: 'loreto', nombre: 'Loreto', lat: 26.012, lon: -111.349 },
    { id: 'comondu', nombre: 'Comondú', lat: 25.032, lon: -111.663 },
    { id: 'mulege', nombre: 'Mulegé', lat: 26.891, lon: -111.983 },
    { id: 'guerrero', nombre: 'Guerrero Negro', lat: 27.96, lon: -114.056, izq: true },
    { id: 'magdalena', nombre: 'Bahía Magdalena', lat: 24.789, lon: -112.105, izq: true }
  ];
  var ZONA = 'America/Mazatlan';   // hora de La Paz, B.C.S.
  var ESPERA_MS = 9000;

  var TX = {
    es: {
      'cielo.eti': 'Ahora · modelo Open-Meteo (no son estaciones)',
      'cielo.h': 'El cielo ahora en BCS',
      'cielo.cap': 'Capital del estado', 'cielo.min': 'Mín {v}', 'cielo.max': 'Máx {v}',
      'cielo.sens': 'Sensación térmica: {v}', 'cielo.hum': 'Humedad', 'cielo.viento': 'Viento', 'cielo.pres': 'Presión',
      'cielo.act': 'Actualizado {h} · hora de La Paz',
      'cielo.cargando': 'Cargando el estado del cielo…',
      'cielo.error': 'No se pudo cargar el estado del cielo (¿sin conexión?). Las tendencias de arriba no dependen de esto.',
      'cielo.nota': 'Es el estado de ahora según un modelo meteorológico, no una tendencia ni una medición de estación. Datos del clima: Open-Meteo.com (CC BY 4.0).',
      'cielo.mapaH': 'Estado del cielo en el mapa', 'cielo.mapaReg': 'Mapa de Baja California Sur con el estado del cielo de 7 localidades',
      'cielo.foto': 'Foto del satélite NOAA-20 (VIIRS) del {f}. Imagen: NASA EOSDIS GIBS.',
      'cielo.sinDato': 'Sin dato del cielo',
      'cielo.e.despejado': 'Despejado', 'cielo.e.parcial': 'Parcialmente nublado', 'cielo.e.nublado': 'Nublado', 'cielo.e.niebla': 'Niebla',
      'cielo.e.llovizna': 'Llovizna', 'cielo.e.lluvia': 'Lluvia o chubasco', 'cielo.e.nieve': 'Nieve', 'cielo.e.tormenta': 'Tormenta'
    },
    en: {
      'cielo.eti': 'Now · Open-Meteo model (not weather stations)',
      'cielo.h': 'The sky now in BCS',
      'cielo.cap': 'State capital', 'cielo.min': 'Min {v}', 'cielo.max': 'Max {v}',
      'cielo.sens': 'Feels like: {v}', 'cielo.hum': 'Humidity', 'cielo.viento': 'Wind', 'cielo.pres': 'Pressure',
      'cielo.act': 'Updated {h} · La Paz time',
      'cielo.cargando': 'Loading the sky conditions…',
      'cielo.error': 'The sky conditions could not be loaded (offline?). The trends above do not depend on this.',
      'cielo.nota': 'This is the state right now according to a weather model, not a trend or a station measurement. Weather data: Open-Meteo.com (CC BY 4.0).',
      'cielo.mapaH': 'Sky conditions on the map', 'cielo.mapaReg': 'Map of Baja California Sur with the sky conditions of 7 places',
      'cielo.foto': 'NOAA-20 (VIIRS) satellite photo from {f}. Image: NASA EOSDIS GIBS.',
      'cielo.sinDato': 'No sky data',
      'cielo.e.despejado': 'Clear', 'cielo.e.parcial': 'Partly cloudy', 'cielo.e.nublado': 'Overcast', 'cielo.e.niebla': 'Fog',
      'cielo.e.llovizna': 'Drizzle', 'cielo.e.lluvia': 'Rain or showers', 'cielo.e.nieve': 'Snow', 'cielo.e.tormenta': 'Thunderstorm'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Código WMO (weather_code de Open-Meteo) -> estado e ícono; tabla de web/assets/iconos/cielo/README.md.
     Con is_day = 0, los códigos 0-1 usan clear_night y el 2 usa partly_cloudy_night. Código desconocido: sin dato. */
  function estado(codigo, esDia) {
    var c = Number(codigo), dia = esDia !== 0 && esDia !== false;
    if (codigo == null || isNaN(c)) return { clave: 'sinDato', icono: 'cloud', tono: 'nube' };
    if (c === 0 || c === 1) return { clave: 'despejado', icono: dia ? 'sunny' : 'clear_night', tono: dia ? 'sol' : 'nube' };
    if (c === 2) return { clave: 'parcial', icono: dia ? 'partly_cloudy_day' : 'partly_cloudy_night', tono: dia ? 'sol' : 'nube' };
    if (c === 3) return { clave: 'nublado', icono: 'cloud', tono: 'nube' };
    if (c === 45 || c === 48) return { clave: 'niebla', icono: 'foggy', tono: 'nube' };
    if (c >= 51 && c <= 57) return { clave: 'llovizna', icono: 'rainy_light', tono: 'agua' };
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return { clave: 'lluvia', icono: 'rainy', tono: 'agua' };
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { clave: 'nieve', icono: 'cloud', tono: 'nube' };
    if (c === 95 || c === 96 || c === 99) return { clave: 'tormenta', icono: 'thunderstorm', tono: 'agua' };
    return { clave: 'sinDato', icono: 'cloud', tono: 'nube' };
  }
  function textoEstado(e) { return t(e.clave === 'sinDato' ? 'cielo.sinDato' : 'cielo.e.' + e.clave); }

  function urlApi() {
    return 'https://api.open-meteo.com/v1/forecast?latitude=' + LOC.map(function (l) { return l.lat; }).join(',') +
      '&longitude=' + LOC.map(function (l) { return l.lon; }).join(',') +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,surface_pressure,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=' + encodeURIComponent(ZONA);
  }
  /* Una localidad por respuesta, en el mismo orden que LOC. Devuelve null si algo no cuadra (nunca se inventa un dato). */
  function leer(json) {
    var r = Object.prototype.toString.call(json) === '[object Array]' ? json : (json ? [json] : []);
    if (r.length !== LOC.length) return null;
    return LOC.map(function (l, k) {
      var c = r[k] && r[k].current, d = r[k] && r[k].daily;
      if (!c || typeof c.temperature_2m !== 'number') return { loc: l, ok: false };
      return {
        loc: l, ok: true, hora: String(c.time || ''), temp: c.temperature_2m, sens: c.apparent_temperature, hum: c.relative_humidity_2m,
        viento: c.wind_speed_10m, pres: c.surface_pressure, estado: estado(c.weather_code, c.is_day),
        min: d && d.temperature_2m_min ? d.temperature_2m_min[0] : null, max: d && d.temperature_2m_max ? d.temperature_2m_max[0] : null
      };
    });
  }

  function grados(v) { return v == null || isNaN(v) ? '—' : RB.num(v, 0) + '°C'; }
  function icono(e, extra) {
    var u = 'url(assets/iconos/cielo/' + e.icono + '.svg)';
    return '<span class="cielo-ic cielo-' + e.tono + (extra ? ' ' + extra : '') + '" style="-webkit-mask-image:' + u + ';mask-image:' + u + '" aria-hidden="true"></span>';
  }
  function tarjetaPeq(d) {
    if (!d.ok) return '<div class="cielo-c"><p class="cielo-nom">' + esc(d.loc.nombre) + '</p><p class="cielo-est">' + esc(t('cielo.sinDato')) + '</p></div>';
    return '<div class="cielo-c"><div class="cielo-fila"><p class="cielo-nom">' + esc(d.loc.nombre) + '</p>' + icono(d.estado) + '</div>' +
      '<div class="cielo-fila"><p class="cielo-temp">' + esc(grados(d.temp)) + '</p><p class="cielo-min">' + esc(d.min == null ? '' : t('cielo.min', { v: grados(d.min) })) + '</p></div>' +
      '<p class="cielo-est">' + esc(textoEstado(d.estado)) + '</p></div>';
  }
  function tarjetaCap(d) {
    if (!d.ok) return '<div class="cielo-cap"><p class="cielo-nom">' + esc(d.loc.nombre) + '</p><p class="cielo-est">' + esc(t('cielo.sinDato')) + '</p></div>';
    var dato = function (rot, v) { return '<div class="cielo-dato"><span class="cielo-rot">' + esc(rot) + '</span><span class="cielo-val">' + esc(v) + '</span></div>'; };
    return '<div class="cielo-cap"><div class="cielo-fila"><div><p class="cielo-eti2">' + esc(t('cielo.cap')) + '</p><p class="cielo-nom cielo-nom-g">' + esc(d.loc.nombre) + '</p></div>' + icono(d.estado, 'cielo-ic-g') + '</div>' +
      '<p class="cielo-temp cielo-temp-g">' + esc(grados(d.temp)) + '</p>' +
      '<p class="cielo-est cielo-est-g">' + esc(textoEstado(d.estado)) + (d.sens != null ? ' · ' + esc(t('cielo.sens', { v: grados(d.sens) })) : '') + '</p>' +
      '<div class="cielo-datos">' + dato(t('cielo.hum'), d.hum == null ? '—' : RB.num(d.hum, 0) + ' %') + dato(t('cielo.viento'), d.viento == null ? '—' : RB.num(d.viento, 0) + ' km/h') +
      dato(t('cielo.pres'), d.pres == null ? '—' : RB.num(d.pres, 0) + ' hPa') + '</div></div>';
  }
  function html(datos) {
    var h = '<div class="cielo-rej">' + tarjetaCap(datos[0]) + '<div class="cielo-peqs">';
    datos.slice(1).forEach(function (d) { h += tarjetaPeq(d); });
    return h + '</div></div>';
  }
  function horaDe(datos) {
    var d = datos.filter(function (x) { return x.ok && /T(\d\d:\d\d)/.test(x.hora); })[0];
    return d ? /T(\d\d:\d\d)/.exec(d.hora)[1] : null;
  }
  function ayer() { return new Date(Date.now() - 86400000).toISOString().slice(0, 10); }
  function fechaLarga(iso) {
    try { return new Date(iso + 'T00:00:00Z').toLocaleDateString(T.locale(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return iso; }
  }

  var est = { mapa: null, ficha: 0, abort: null };
  function limpiar() {
    est.ficha++;
    if (est.abort) { try { est.abort.abort(); } catch (e) {} est.abort = null; }
    if (est.mapa) { try { est.mapa.remove(); } catch (e) {} est.mapa = null; }
  }

  function pintarMapa(sec, datos) {
    var caja = sec.querySelector('#cielo-mapa');
    if (!caja || typeof L === 'undefined') { if (caja) caja.hidden = true; return; }
    try {
      var f = ayer();
      var ancho = caja.clientWidth || 360;
      est.mapa = L.map(caja, { scrollWheelZoom: false, minZoom: 6, maxZoom: 9, maxBounds: [[21.5, -116.5], [29.5, -107.5]], maxBoundsViscosity: 1 })
        .setView([25.4, -111.8], ancho >= 600 ? 7 : 6);
      L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/' + f + '/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpeg', {
        maxNativeZoom: 9, maxZoom: 9, attribution: 'NASA EOSDIS GIBS / VIIRS NOAA-20'
      }).addTo(est.mapa);
      datos.forEach(function (d) {
        if (!d.ok) return;
        var ic = icono(d.estado, 'cielo-ic-p');
        L.marker([d.loc.lat, d.loc.lon], {
          interactive: false, keyboard: false,
          icon: L.divIcon({ className: 'cielo-pin-caja', iconSize: null, html: '<span class="cielo-pin' + (d.loc.izq ? ' cielo-pin-izq' : '') + '">' + ic + '<span class="cielo-pin-n">' + esc(d.loc.nombre) + '&nbsp;</span>' + esc(grados(d.temp)) + '</span>' })
        }).addTo(est.mapa);
      });
      var pie = sec.querySelector('#cielo-foto');
      if (pie) pie.textContent = t('cielo.foto', { f: fechaLarga(f) });
    } catch (e) { caja.hidden = true; }
  }

  function activar(raiz) {
    limpiar();
    var antes = raiz.querySelector('.hm-sec-mapa');
    if (!antes) return;
    var sec = document.createElement('section');
    sec.className = 'hm-sec cielo'; sec.id = 'cielo'; sec.setAttribute('aria-labelledby', 'cielo-h');
    sec.innerHTML = '<div class="hm-sec-cab"><div><p class="hm-mono hm-eti"><i class="hm-punto"></i>' + esc(t('cielo.eti')) + '</p>' +
      '<h2 id="cielo-h">' + esc(t('cielo.h')) + '</h2></div><p class="hm-mono hm-pildora" id="cielo-hora" hidden></p></div>' +
      '<div id="cielo-cuerpo"><p class="cielo-cargando">' + esc(t('cielo.cargando')) + '</p></div>' +
      '<p class="fuente cielo-nota">' + esc(t('cielo.nota')) + ' <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a></p>';
    antes.parentNode.insertBefore(sec, antes);
    var mi = est.ficha, cuerpo = sec.querySelector('#cielo-cuerpo');
    function falla() { if (mi === est.ficha) cuerpo.innerHTML = '<p class="aviso">' + esc(t('cielo.error')) + '</p>'; }
    if (typeof fetch === 'undefined') return falla();
    var opts = {};
    if (typeof AbortController !== 'undefined') { est.abort = new AbortController(); opts.signal = est.abort.signal; }
    var plazo = setTimeout(function () { if (est.abort) try { est.abort.abort(); } catch (e) {} }, ESPERA_MS);
    fetch(urlApi(), opts).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (json) {
      clearTimeout(plazo);
      if (mi !== est.ficha) return;
      var datos = leer(json);
      if (!datos || !datos.some(function (d) { return d.ok; })) return falla();
      cuerpo.innerHTML = html(datos) +
        '<h3 class="cielo-h3">' + esc(t('cielo.mapaH')) + '</h3><div id="cielo-mapa" class="cielo-mapa" role="region" aria-label="' + esc(t('cielo.mapaReg')) + '"></div>' +
        '<p class="fuente" id="cielo-foto"></p>';
      var hora = horaDe(datos), ph = sec.querySelector('#cielo-hora');
      if (hora && ph) { ph.textContent = t('cielo.act', { h: hora }); ph.hidden = false; }
      pintarMapa(sec, datos);
    }).catch(function () { clearTimeout(plazo); falla(); });
  }

  var RBCielo = { activar: activar, limpiar: limpiar, estado: estado, urlApi: urlApi, leer: leer, html: html, LOC: LOC, TX: TX, textoEstado: textoEstado };
  if (typeof window !== 'undefined') window.RBCielo = RBCielo;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBCielo;
})();
