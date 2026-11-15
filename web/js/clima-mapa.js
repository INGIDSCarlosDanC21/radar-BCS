/* Pestaña Mapa como el frame "Clima - Mapa" de Figma (diseno/pantallas/clima-mapa.png), con datos reales:
   - "Mapa Meteorológico": mapa de Baja California Sur con el ícono del estado del cielo y la temperatura de las
     7 localidades de Inicio (las MISMAS, de la misma respuesta de Open-Meteo vía RBCielo.datos(): siempre coinciden).
   - "Diagnóstico Climático Territorial": 4 tarjetas con lo que dice el modelo hoy en La Paz (máxima, UV máximo,
     viento y ráfagas, probabilidad de lluvia y humedad). Nada de cifras de ejemplo: si falta un dato dice "—".
   Se actualiza cada 10 minutos mientras la pestaña está en pantalla. ES5, sin build. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var CL = (typeof window !== 'undefined' && window.RBCielo) || (typeof require !== 'undefined' ? require('./cielo.js') : null);
  function t(k, v) { return T.t(k, v); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var num = CL.num;

  /* Textos (ES/EN) de esta pantalla. */
  var TX = {
    es: {
      'cm.h1': 'Mapa Meteorológico',
      'cm.lead': 'El estado del cielo ahora en Baja California Sur y, más abajo, cómo cambió cada zona de La Paz desde 2001.',
      'cm.region': 'Mapa de Baja California Sur con el estado del cielo de 7 localidades',
      'cm.diag': 'Diagnóstico Climático Territorial', 'cm.diagSub': 'Hoy en La Paz, según el modelo meteorológico <a href="https://open-meteo.com/">Open-Meteo</a>. Toca una tarjeta para ver más.',
      'cm.calor': 'Calor & Sensación Térmica', 'cm.calorB': 'Máx {v} °C', 'cm.calorS': 'Sensación térmica ahora: {v} °C', 'cm.calorL': 'Ver consejos contra el calor',
      'cm.uv': 'Radiación UV & Exposición Solar', 'cm.uvB': 'Índice {v}', 'cm.uvS': 'Máximo de hoy: {c}', 'cm.uvL': 'Ver avisos de UV y cómo protegerte',
      'cm.viento': 'Viento, Oleaje & Corrientes', 'cm.vientoB': '{v} km/h {r}', 'cm.vientoS': 'Ráfagas de hasta {v} km/h hoy', 'cm.vientoL': 'Ver pronóstico marino y de viento costero',
      'cm.lluvia': 'Humedad y Lluvia', 'cm.lluviaB': '{v} % lluvia', 'cm.lluviaS': 'Humedad ahora: {v} %', 'cm.lluviaL': 'Ver avisos de lluvia y tormenta',
      'cm.cargando': 'Cargando el cielo de ahora…', 'cm.error': 'No pudimos cargar el clima de ahora. Las tendencias por zona siguen abajo.',
      'cm.zonasH': 'Cómo cambió cada zona de La Paz desde 2001'
    },
    en: {
      'cm.h1': 'Weather Map',
      'cm.lead': 'The sky right now in Baja California Sur and, further down, how each zone of La Paz has changed since 2001.',
      'cm.region': 'Map of Baja California Sur with the sky condition of 7 towns',
      'cm.diag': 'Regional Climate Overview', 'cm.diagSub': 'Today in La Paz, from the <a href="https://open-meteo.com/">Open-Meteo</a> weather model. Tap a card to see more.',
      'cm.calor': 'Heat & Feels-like Temperature', 'cm.calorB': 'High {v} °C', 'cm.calorS': 'Feels like {v} °C now', 'cm.calorL': 'See tips against the heat',
      'cm.uv': 'UV Radiation & Sun Exposure', 'cm.uvB': 'Index {v}', 'cm.uvS': "Today's peak: {c}", 'cm.uvL': 'See UV alerts and how to protect yourself',
      'cm.viento': 'Wind, Waves & Currents', 'cm.vientoB': '{v} km/h {r}', 'cm.vientoS': 'Gusts up to {v} km/h today', 'cm.vientoL': 'See the marine and coastal wind forecast',
      'cm.lluvia': 'Humidity and Rain', 'cm.lluviaB': '{v} % rain', 'cm.lluviaS': 'Humidity now: {v} %', 'cm.lluviaL': 'See rain and storm alerts',
      'cm.cargando': 'Loading the sky now…', 'cm.error': "We couldn't load the current weather. The zone trends are still below.",
      'cm.zonasH': 'How each zone of La Paz has changed since 2001'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  /* Las 4 tarjetas de Figma: ícono de web/assets/iconos, acento, insignia, renglón y a dónde lleva. */
  var TARJETAS = [
    { id: 'calor', icono: 'clima-calor-y-sensacion-termica', href: '#acciones',
      insignia: function (f) { return t('cm.calorB', { v: num(f.max) }); }, renglon: function (f) { return t('cm.calorS', { v: num(f.c.apparent_temperature) }); } },
    { id: 'uv', icono: 'clima-radiacion-uv-y-exposicion-solar', href: '#avisos',
      insignia: function (f) { return t('cm.uvB', { v: num(f.uvMax) }); }, renglon: function (f) { return t('cm.uvS', { c: CL.uvCat(f.uvMax) || '—' }); } },
    { id: 'viento', icono: 'clima-viento-oleaje-y-corrientes', href: '#pesca',
      insignia: function (f) { return t('cm.vientoB', { v: num(f.c.wind_speed_10m), r: CL.rumbo(f.c.wind_direction_10m) }); }, renglon: function (f) { return t('cm.vientoS', { v: num(f.rachas) }); } },
    { id: 'lluvia', icono: 'clima-humedad-y-lluvia', href: '#avisos',
      insignia: function (f) { return t('cm.lluviaB', { v: num(f.lluvia) }); }, renglon: function (f) { return t('cm.lluviaS', { v: num(f.c.relative_humidity_2m) }); } }
  ];

  function tarjetas(f) {
    return TARJETAS.map(function (k) {
      return '<a class="cm-tarjeta cm-' + k.id + '" href="' + k.href + '">' +
        '<span class="cm-acento" aria-hidden="true"></span>' +
        '<span class="cm-cab"><span class="cm-ico" aria-hidden="true"><img src="assets/iconos/' + k.icono + '.svg" alt="" width="28" height="28"></span>' +
        '<span class="cm-tit"><strong>' + esc(t('cm.' + k.id)) + '</strong><span class="cm-renglon">' + esc(f ? k.renglon(f) : t('cm.cargando')) + '</span></span>' +
        '<span class="cm-insignia">' + esc(f ? k.insignia(f) : '—') + '</span></span>' +
        '<span class="cm-ir">' + esc(t('cm.' + k.id + 'L')) + '<span aria-hidden="true">→</span></span></a>';
    }).join('');
  }

  /* Marcado de la parte de arriba (lo pone app.js antes del mapa de zonas). */
  function html() {
    return '<section class="cm" aria-labelledby="cm-h1"><h1 id="cm-h1">' + t('cm.h1') + '</h1><p class="lead">' + t('cm.lead') + '</p>' +
      '<div class="cm-marco"><div id="cm-mapa" class="cm-mapa" role="region" aria-label="' + esc(t('cm.region')) + '"></div>' +
      '<div class="cl-leyenda cm-leyenda" id="cm-leyenda">' + CL.leyenda() + '</div></div>' +
      '<p class="cm-estado" id="cm-estado">' + t('cm.cargando') + '</p>' +
      '<div class="cm-diag-cab"><h2>' + t('cm.diag') + '</h2><p>' + t('cm.diagSub') + '</p></div>' +
      '<div class="cm-tarjetas" id="cm-tarjetas">' + tarjetas(null) + '</div></section>' +
      '<h2 class="cm-zonas-h">' + t('cm.zonasH') + '</h2>';
  }

  /* Pin de Figma: círculo con el ícono del cielo y etiqueta oscura "Lugar · 21°C Despejado"; La Paz resaltada. */
  /* Etiquetas que salen hacia la izquierda para no encimarse (Bahía Magdalena queda a unos 50 km de Comondú). */
  var IZQ = { bahiamagdalena: true };
  function pinHtml(f) {
    var l = f.lugar;
    return '<span class="cm-pin' + (l.principal ? ' cm-pin-lp' : '') + (IZQ[l.id] ? ' cm-pin-izq' : '') + '" role="img" aria-label="' + esc(l.es + ': ' + f.e.texto + ', ' + num(f.c.temperature_2m) + ' °C') + '">' +
      '<span class="cm-pin-c">' + CL.icono(f.e, l.principal ? 'cl-blanco' : '') + '</span>' +
      '<span class="cm-pin-t" aria-hidden="true"><span class="cm-n">' + esc(l.es) + ' · </span>' + num(f.c.temperature_2m) + '°C<em> ' + esc(f.e.texto) + '</em></span></span>';
  }

  var MAPA = null, CAPA = null, reloj = null;
  function pintarMapa(raiz, filas) {
    var caja = raiz.querySelector('#cm-mapa');
    if (!caja || typeof L === 'undefined') return;
    if (!MAPA || MAPA.getContainer() !== caja) {
      if (MAPA) { try { MAPA.remove(); } catch (e) { /* ya no existe */ } }
      MAPA = L.map(caja, { scrollWheelZoom: false, zoomSnap: 0.25 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, attribution: '© OpenStreetMap contributors' }).addTo(MAPA);
      // Encuadre de la península: espacio a la derecha para las etiquetas y la leyenda, y a la izquierda para Bahía Magdalena.
      var ancho = caja.clientWidth || 360;
      MAPA.fitBounds(CL.LUGARES.map(function (l) { return [l.lat, l.lon]; }),
        ancho < 700 ? { paddingTopLeft: [56, 48], paddingBottomRight: [96, 36] } : { paddingTopLeft: [150, 30], paddingBottomRight: [420, 30] });
      CAPA = null;
    }
    if (CAPA) CAPA.remove();
    CAPA = L.layerGroup(filas.map(function (f) {
      // En celular el pin es compacto (ícono y temperatura); al tocarlo se ve el nombre y el estado del cielo.
      return L.marker([f.lugar.lat, f.lugar.lon], { icon: L.divIcon({ className: 'cm-pin-wrap', html: pinHtml(f), iconSize: [0, 0], iconAnchor: [0, 0] }), keyboard: false, zIndexOffset: f.lugar.principal ? 1000 : 0 })
        .bindPopup(esc(f.lugar.es) + ': ' + num(f.c.temperature_2m) + ' °C, ' + esc(f.e.texto));
    })).addTo(MAPA);
  }

  function cargar(raiz, opciones) {
    opciones = opciones || {};
    if (!raiz || typeof raiz.querySelector !== 'function' || !raiz.querySelector('#cm-tarjetas')) return Promise.resolve(false);
    if (reloj) { clearTimeout(reloj); reloj = null; }
    return CL.datos(opciones).then(function (filas) {
      var lp = filas[0];
      raiz.querySelector('#cm-tarjetas').innerHTML = tarjetas(lp);
      var est = raiz.querySelector('#cm-estado');
      if (est) est.textContent = t('cielo.sincro', { h: (lp.c.time || '').slice(11, 16) });
      pintarMapa(raiz, filas);
      programar(raiz, opciones);
      return true;
    }).catch(function () {
      var est = raiz.querySelector('#cm-estado');
      if (est) { est.textContent = t('cm.error'); est.className = 'cm-estado cl-error'; }
      programar(raiz, opciones);
      return false;
    });
  }
  function programar(raiz, opciones) {
    var ms = opciones.intervalo == null ? CL.CADA_MIN * 60000 : opciones.intervalo;
    if (!ms || typeof setTimeout === 'undefined') return;
    reloj = setTimeout(function () {
      reloj = null;
      var caja = raiz.querySelector('#cm-tarjetas');
      if (!caja || caja.isConnected === false) return; // ya se salió de la pestaña Mapa
      cargar(raiz, opciones);
    }, ms);
  }

  var RBClimaMapa = { html: html, tarjetas: tarjetas, pinHtml: pinHtml, cargar: cargar, TARJETAS: TARJETAS, TX: TX };
  if (typeof window !== 'undefined') window.RBClimaMapa = RBClimaMapa;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBClimaMapa;
})();
