/* Pantalla Clima (antes pestaña Mapa) como el frame "Clima - Mapa" de Figma (diseno/pantallas/clima-mapa.png), con datos reales:
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
      'cm.lead': 'El estado del cielo ahora en Baja California Sur. Toca un lugar del mapa y luego una tarjeta para ver su ficha.',
      'cm.region': 'Mapa de Baja California Sur con el estado del cielo de 7 localidades',
      'cm.diag': 'Diagnóstico Climático Territorial', 'cm.diagSub': 'Hoy en {z}, según el modelo meteorológico <a href="https://open-meteo.com/">Open-Meteo</a>. Toca una tarjeta para ver más.',
      'cm.calor': 'Calor & Sensación Térmica', 'cm.calorB': 'Máx {v} °C', 'cm.calorS': 'Sensación térmica ahora: {v} °C', 'cm.calorL': 'Ver consejos contra el calor',
      'cm.uv': 'Radiación UV & Exposición Solar', 'cm.uvB': 'Índice {v}', 'cm.uvS': 'Máximo de hoy: {c}', 'cm.uvL': 'Ver el índice UV y cómo protegerte',
      'cm.viento': 'Viento, Oleaje & Corrientes', 'cm.vientoB': '{v} km/h {r}', 'cm.vientoS': 'Ráfagas de hasta {v} km/h hoy', 'cm.vientoL': 'Ver viento, oleaje y corrientes',
      'cm.lluvia': 'Humedad y Lluvia', 'cm.lluviaB': '{v} % lluvia', 'cm.lluviaS': 'Humedad ahora: {v} %', 'cm.lluviaL': 'Ver humedad y lluvia en detalle',
      'cm.cargando': 'Cargando el cielo de ahora…', 'cm.error': 'No pudimos cargar el clima de ahora. Las tendencias por zona siguen abajo.',
      'cm.zonasH': 'Cómo cambió cada zona de La Paz desde 2001',
      'cm.fichaCarga': 'Cargando la ficha…', 'cm.fichaError': 'No se pudo cargar la ficha (¿sin conexión?).', 'cm.sinFicha': 'Este lugar no tiene ficha técnica: no hay un pueblo equivalente en los datos. Elige otro lugar en el mapa.'
    },
    en: {
      'cm.h1': 'Weather Map',
      'cm.lead': 'The sky right now in Baja California Sur. Tap a place on the map, then a card, to see its data sheet.',
      'cm.region': 'Map of Baja California Sur with the sky condition of 7 towns',
      'cm.diag': 'Regional Climate Overview', 'cm.diagSub': 'Today in {z}, from the <a href="https://open-meteo.com/">Open-Meteo</a> weather model. Tap a card to see more.',
      'cm.calor': 'Heat & Feels-like Temperature', 'cm.calorB': 'High {v} °C', 'cm.calorS': 'Feels like {v} °C now', 'cm.calorL': 'See tips against the heat',
      'cm.uv': 'UV Radiation & Sun Exposure', 'cm.uvB': 'Index {v}', 'cm.uvS': "Today's peak: {c}", 'cm.uvL': 'See the UV index and how to protect yourself',
      'cm.viento': 'Wind, Waves & Currents', 'cm.vientoB': '{v} km/h {r}', 'cm.vientoS': 'Gusts up to {v} km/h today', 'cm.vientoL': 'See wind, waves and currents',
      'cm.lluvia': 'Humidity and Rain', 'cm.lluviaB': '{v} % rain', 'cm.lluviaS': 'Humidity now: {v} %', 'cm.lluviaL': 'See humidity and rain in detail',
      'cm.cargando': 'Loading the sky now…', 'cm.error': "We couldn't load the current weather. The zone trends are still below.",
      'cm.zonasH': 'How each zone of La Paz has changed since 2001',
      'cm.fichaCarga': 'Loading the data sheet…', 'cm.fichaError': 'The data sheet could not be loaded (offline?).', 'cm.sinFicha': 'This place has no data sheet: there is no matching town in the data. Pick another place on the map.'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  /* Las 4 tarjetas de Figma: ícono de web/assets/iconos, acento, insignia, renglón y a dónde lleva. */
  var TARJETAS = [
    { id: 'calor', icono: 'clima-calor-y-sensacion-termica', href: '#clima/calor',
      insignia: function (f) { return t('cm.calorB', { v: num(f.max) }); }, renglon: function (f) { return t('cm.calorS', { v: num(f.c.apparent_temperature) }); } },
    { id: 'uv', icono: 'clima-radiacion-uv-y-exposicion-solar', href: '#clima/uv',
      insignia: function (f) { return t('cm.uvB', { v: num(f.uvMax) }); }, renglon: function (f) { return t('cm.uvS', { c: CL.uvCat(f.uvMax) || '—' }); } },
    { id: 'viento', icono: 'clima-viento-oleaje-y-corrientes', href: '#clima/viento',
      insignia: function (f) { return t('cm.vientoB', { v: num(f.c.wind_speed_10m), r: CL.rumbo(f.c.wind_direction_10m) }); }, renglon: function (f) { return t('cm.vientoS', { v: num(f.rachas) }); } },
    { id: 'lluvia', icono: 'clima-humedad-y-lluvia', href: '#clima/lluvia',
      insignia: function (f) { return t('cm.lluviaB', { v: num(f.lluvia) }); }, renglon: function (f) { return t('cm.lluviaS', { v: num(f.c.relative_humidity_2m) }); } }
  ];

  function tarjetas(f) {
    return TARJETAS.map(function (k) {
      return '<a class="cm-tarjeta cm-' + k.id + '" href="' + k.href + (f ? '/' + f.lugar.id : '') + '">' +
        '<span class="cm-acento" aria-hidden="true"></span>' +
        '<span class="cm-cab"><span class="cm-ico" aria-hidden="true"><img src="assets/iconos/' + k.icono + '.svg" alt="" width="28" height="28"></span>' +
        '<span class="cm-tit"><strong>' + esc(t('cm.' + k.id)) + '</strong><span class="cm-renglon">' + esc(f ? k.renglon(f) : t('cm.cargando')) + '</span></span>' +
        '<span class="cm-insignia">' + esc(f ? k.insignia(f) : '—') + '</span></span>' +
        '<span class="cm-ir">' + esc(t('cm.' + k.id + 'L')) + '<span aria-hidden="true">→</span></span></a>';
    }).join('');
  }

  /* Marcado de la parte de arriba (lo pone app.js antes del mapa de zonas). */
  function html() {
    S.lugar = 'lapaz'; FICHA = null;
    return '<section class="cm" aria-labelledby="cm-h1"><h1 id="cm-h1">' + t('cm.h1') + '</h1><p class="lead">' + t('cm.lead') + '</p>' +
      '<div class="cm-marco"><div id="cm-mapa" class="cm-mapa" role="region" aria-label="' + esc(t('cm.region')) + '"></div>' +
      '<div class="cl-leyenda cm-leyenda" id="cm-leyenda">' + CL.leyenda() + '</div></div>' +
      '<p class="cm-estado" id="cm-estado">' + t('cm.cargando') + '</p>' +
      '<div class="cm-diag-cab"><h2>' + t('cm.diag') + '</h2><p id="cm-diag-sub">' + t('cm.diagSub', { z: 'La Paz' }) + '</p></div>' +
      '<div class="cm-tarjetas" id="cm-tarjetas">' + tarjetas(null) + '</div>' +
      '<section class="cl-det cm-ficha" id="cm-ficha" aria-labelledby="cl-det-h" hidden></section></section>' +
      '<h2 class="cm-zonas-h">' + t('cm.zonasH') + '</h2>';
  }

  /* Pin de Figma: círculo con el ícono del cielo y etiqueta oscura "Lugar · 21°C Despejado"; La Paz resaltada. */
  /* Etiquetas que salen hacia la izquierda para no encimarse (Bahía Magdalena queda a unos 50 km de Comondú). */
  var IZQ = { bahiamagdalena: true };
  function pinHtml(f) {
    var l = f.lugar;
    return '<span data-lugar="' + l.id + '" class="cm-pin' + (l.extra ? ' cm-pin-mini' : '') + (l.id === S.lugar ? ' cm-pin-sel' : '') + (l.principal ? ' cm-pin-lp' : '') + (IZQ[l.id] ? ' cm-pin-izq' : '') + '" role="img" aria-label="' + esc(l.es + ': ' + f.e.texto + ', ' + num(f.c.temperature_2m) + ' °C') + '">' +
      '<span class="cm-pin-c">' + CL.icono(f.e, l.principal ? 'cl-blanco' : '') + '</span>' +
      '<span class="cm-pin-t" aria-hidden="true"><span class="cm-n">' + esc(l.es) + ' · </span>' + num(f.c.temperature_2m) + '°C<em> ' + esc(f.e.texto) + '</em></span></span>';
  }

  /* Lugar elegido en el mapa: las tarjetas y las fichas (#clima/<ficha>/<lugar>) muestran sus valores. */
  var S = { lugar: 'lapaz' }, FILAS = null;
  function filaDe(id) { var r = null; (FILAS || []).forEach(function (f) { if (f.lugar.id === id) r = f; }); return r || (FILAS && FILAS[0]) || null; }
  /* Fichas técnicas en la misma pantalla (sin cambiar de vista): datos de RBVivo.cargar({clima:true}) y detalle de RBClima.
     Se buscan al usarlos: datos-vivos.js y clima.js se cargan después de este archivo. */
  var PUERTO = { lapaz: 'lapaz', loscabos: 'cabos', loreto: 'loreto', mulege: 'mulege', guerreronegro: 'guerreronegro', bahiamagdalena: 'bahiamagdalena' };
  CL.LUGARES.forEach(function (l) { if (l.extra) PUERTO[l.id] = l.id; });   // los lugares extra tienen el mismo id que su puerto de RBVivo.PUERTOS
  var FICHAS = ['calor', 'uv', 'viento', 'lluvia'], FICHA = null, PROMESA = null;
  function vivo() { return (typeof window !== 'undefined' && window.RBVivo) || (typeof require !== 'undefined' ? require('./datos-vivos.js') : null); }
  function url(id) { try { history.replaceState(null, '', id ? '#clima/' + id + '/' + S.lugar : '#clima'); } catch (e) { /* sin historial */ } }
  function marcarTarjetas(raiz) {
    if (typeof raiz.querySelectorAll !== 'function') return;
    raiz.querySelectorAll('#cm-tarjetas .cm-tarjeta').forEach(function (a) {
      a.setAttribute('aria-expanded', String((a.getAttribute('href') || '').split('/')[1] === FICHA)); a.setAttribute('aria-controls', 'cm-ficha');
    });
  }
  function pintarFicha(raiz, enfocar) {
    var caja = raiz.querySelector('#cm-ficha'); if (!caja || !FICHA) return Promise.resolve(false);
    var id = FICHA;
    if (!PUERTO[S.lugar]) { caja.hidden = false; caja.innerHTML = '<p class="aviso" role="status">' + esc(t('cm.sinFicha')) + '</p>'; return Promise.resolve(false); }
    if (!vivo() || !window.RBClima) return Promise.resolve(false);
    caja.hidden = false;
    if (!caja.innerHTML) caja.innerHTML = '<p class="pe-carga">' + esc(t('cm.fichaCarga')) + '</p>';
    if (!PROMESA) PROMESA = vivo().cargar({ clima: true }).catch(function (e) { PROMESA = null; throw e; });
    return PROMESA.then(function (r) {
      if (FICHA !== id) return false;
      var d = r.datos, k = 0;
      d.puertos.forEach(function (p, i) { if (p.id === PUERTO[S.lugar]) k = i; });
      caja.innerHTML = window.RBClima.detalle(d, vivo().indiceAhora(d.horas), k, id);
      var h = caja.querySelector('#cl-det-h');
      if (enfocar && h) { if (h.scrollIntoView) h.scrollIntoView({ block: 'start' }); if (h.focus) h.focus({ preventScroll: true }); }
      return true;
    }, function () { if (FICHA === id) caja.innerHTML = '<p class="aviso" role="alert">' + esc(t('cm.fichaError')) + '</p>'; return false; });
  }
  function abrirFicha(raiz, id) {
    if (FICHAS.indexOf(id) < 0) return Promise.resolve(false);
    var caja = raiz.querySelector('#cm-ficha'); if (caja) caja.innerHTML = '';
    FICHA = id; url(id); marcarTarjetas(raiz);
    return pintarFicha(raiz, true);
  }
  function cerrarFicha(raiz) {
    var previa = FICHA, caja = raiz.querySelector('#cm-ficha');
    FICHA = null; url(null);
    if (caja) { caja.hidden = true; caja.innerHTML = ''; }
    marcarTarjetas(raiz);
    var a = previa && raiz.querySelector('#cm-tarjetas .cm-' + previa); if (a && a.focus) a.focus();
  }
  function enlazar(raiz) {
    if (raiz._cmFichas || typeof raiz.addEventListener !== 'function') return;
    raiz._cmFichas = true;
    raiz.addEventListener('click', function (ev) {
      var el = ev.target && ev.target.closest ? ev.target : null; if (!el) return;
      var tarj = el.closest('#cm-tarjetas .cm-tarjeta'), cer = el.closest('#cm-ficha [data-cerrar]');
      if (tarj) {
        ev.preventDefault();
        var id = (tarj.getAttribute('href') || '').split('/')[1];
        if (FICHA === id) cerrarFicha(raiz); else abrirFicha(raiz, id);
      } else if (cer) cerrarFicha(raiz);
    });
  }

  function elegir(raiz, id) {
    S.lugar = id;
    var f = filaDe(id), caja = raiz.querySelector('#cm-tarjetas'), sub = raiz.querySelector('#cm-diag-sub');
    if (f && caja) caja.innerHTML = tarjetas(f);
    if (f && sub) sub.innerHTML = t('cm.diagSub', { z: esc(f.lugar.es) });
    marcarTarjetas(raiz);
    if (FICHA) { url(FICHA); pintarFicha(raiz, false); }
    if (typeof raiz.querySelectorAll === 'function') raiz.querySelectorAll('.cm-pin[data-lugar]').forEach(function (e) { e.classList.toggle('cm-pin-sel', e.getAttribute('data-lugar') === id); });
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
      // Lejos (poco zoom) los pines chicos muestran solo el ícono; con zoom 8 o más, también la temperatura.
      var lejos = function () {
        var z = MAPA.getZoom();
        caja.classList.toggle('cm-z-lejos', z < 8);
        caja.classList.toggle('cm-z-estrecho', z < 7.5 && (caja.clientWidth || 360) < 640);   // en celular, con poco zoom solo los lugares principales
      };
      MAPA.on('zoomend', lejos); lejos();
    }
    if (CAPA) CAPA.remove();
    CAPA = L.layerGroup(filas.map(function (f) {
      // En celular el pin es compacto (ícono y temperatura); al tocarlo se ve el nombre y el estado del cielo.
      return L.marker([f.lugar.lat, f.lugar.lon], { icon: L.divIcon({ className: 'cm-pin-wrap', html: pinHtml(f), iconSize: [0, 0], iconAnchor: [0, 0] }), keyboard: false, zIndexOffset: f.lugar.principal ? 1000 : 0 })
        .on('click', function () { elegir(raiz, f.lugar.id); })
        .bindPopup(esc(f.lugar.es) + ': ' + num(f.c.temperature_2m) + ' °C, ' + esc(f.e.texto));
    })).addTo(MAPA);
  }

  function cargar(raiz, opciones) {
    opciones = opciones || {};
    if (!raiz || typeof raiz.querySelector !== 'function' || !raiz.querySelector('#cm-tarjetas')) return Promise.resolve(false);
    if (reloj) { clearTimeout(reloj); reloj = null; }
    return CL.datos(opciones).then(function (filas) {
      FILAS = filas;
      if (opciones.lugar && !opciones._lugar) { opciones._lugar = true; S.lugar = filaDe(opciones.lugar).lugar.id; }
      var lp = filaDe(S.lugar); enlazar(raiz);
      elegir(raiz, lp.lugar.id);
      var est = raiz.querySelector('#cm-estado');
      if (est) est.textContent = t('cielo.sincro', { h: (lp.c.time || '').slice(11, 16) });
      pintarMapa(raiz, filas);
      programar(raiz, opciones);
      if (opciones.abrir && !opciones._abierta && FICHAS.indexOf(opciones.abrir) >= 0) { opciones._abierta = true; abrirFicha(raiz, opciones.abrir); }
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
      if (!caja || caja.isConnected === false) return; // ya se salió de la pantalla Clima
      cargar(raiz, opciones);
    }, ms);
  }

  var RBClimaMapa = { abrirFicha: abrirFicha, cerrarFicha: cerrarFicha, elegir: elegir, html: html, tarjetas: tarjetas, pinHtml: pinHtml, cargar: cargar, TARJETAS: TARJETAS, TX: TX };
  if (typeof window !== 'undefined') window.RBClimaMapa = RBClimaMapa;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBClimaMapa;
})();
