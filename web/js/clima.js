/* Pantalla Clima (docs/PLAN-CLIMA.md). ES5, sin build. Sigue el patrón de Pesca (mapa de iconos) y del Mapa Agrícola (tarjetas con detalle).
   Mapa con los 19 lugares de RBVivo.PUERTOS, buscador, chips de capa y 4 tarjetas: calor y sensación térmica, UV y sol,
   viento, oleaje y corrientes, humedad y lluvia. Todo sale de Open-Meteo (modelo para el pueblo, NO son estaciones) vía
   RBVivo.cargar({clima:true}) y RBReglasClima; lo que falta se muestra como "sin dato". Sin etiqueta de calor (docs/investigacion/umbrales-clima.md). */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var RB = (typeof window !== 'undefined' && window.RB) || (typeof require !== 'undefined' ? require('./reglas.js') : null);
  var V = (typeof window !== 'undefined' && window.RBVivo) || (typeof require !== 'undefined' ? require('./datos-vivos.js') : null);
  var M = (typeof window !== 'undefined' && window.RBMar) || (typeof require !== 'undefined' ? require('./reglas-mar.js') : null);
  var C = (typeof window !== 'undefined' && window.RBReglasClima) || (typeof require !== 'undefined' ? require('./reglas-clima.js') : null);
  var CI = (typeof window !== 'undefined' && window.RBCielo) || (typeof require !== 'undefined' ? require('./cielo.js') : null);
  var MI = (typeof window !== 'undefined' && window.RBMapaIconos) || (typeof require !== 'undefined' ? require('./mapa-iconos.js') : null);
  var t = T.t;
  var URL_CDC = 'https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf';
  var URL_OMS = 'https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index';
  var CAPAS = ['general', 'calor', 'viento', 'uv', 'humedad'];
  var TARJETAS = ['calor', 'uv', 'viento', 'lluvia'];
  var ICONO_TARJETA = { calor: 'clima-calor-y-sensacion-termica', uv: 'clima-radiacion-uv-y-exposicion-solar', viento: 'clima-viento-oleaje-y-corrientes', lluvia: 'clima-humedad-y-lluvia' };
  var SERIE_CURVA = { calor: 'sens', uv: 'uv', viento: 'viento', lluvia: 'hum' };

  var TX = {
    es: {
      'cli.kicker': 'Ahora · modelo Open-Meteo (no son estaciones)', 'cli.act': 'Actualizado {h} · modelo Open-Meteo, no son estaciones',
      'cli.sub': 'Calor, sol, viento, mar y lluvia en 19 lugares de Baja California Sur.',
      'cli.buscar': 'Buscar un pueblo', 'cli.buscarVacio': 'No hay un pueblo con ese nombre. Prueba con La Paz, Loreto o Cabo San Lucas.',
      'cli.capas': 'Dato en el mapa', 'cli.c.general': 'General', 'cli.c.calor': 'Calor', 'cli.c.viento': 'Viento', 'cli.c.uv': 'UV', 'cli.c.humedad': 'Humedad',
      'cli.mapaReg': 'Mapa de 19 lugares de Baja California Sur con temperatura, sensación térmica, viento, índice UV o humedad',
      'cli.pin.general': '{n}: temperatura {v}', 'cli.pin.calor': '{n}: sensación térmica {v}', 'cli.pin.viento': '{n}: viento {v}',
      'cli.pin.uv': '{n}: índice UV máximo de hoy {v}', 'cli.pin.humedad': '{n}: humedad {v}',
      'cli.zona': 'Pueblo: {z}', 'cli.tarjetas': 'Tarjetas del clima en {z}',
      'cli.t.calor': 'Calor y sensación térmica', 'cli.t.uv': 'Radiación UV y exposición solar', 'cli.t.viento': 'Viento, oleaje y corrientes', 'cli.t.lluvia': 'Humedad y lluvia',
      'cli.g.calor': '{v} °C', 'cli.g.uv': 'UV {v}', 'cli.g.viento': '{v} kt', 'cli.g.lluvia': '{v} % de humedad',
      'cli.e.calor': 'Sensación térmica del modelo', 'cli.e.uv': 'Máximo de hoy',  'cli.e.viento': 'Viento ahora', 'cli.e.lluvia': 'Humedad ahora',
      'cli.f.calor': 'Temperatura {t} °C · máx. {x} °C · mín. {m} °C', 'cli.f.uv': 'Ahora {a} · {h} h de sol hoy',
      'cli.f.viento': 'Rachas {r} kt · Beaufort {b} · oleaje {o} m', 'cli.f.lluvia': 'Lluvia en 24 h: {p} % · {mm} mm',
      'cli.ver': 'Ver detalle', 'cli.cerrar': 'Cerrar detalle', 'cli.detalle': '{t} en {z}',
      'cli.r.temp': 'Temperatura', 'cli.r.sens': 'Sensación térmica (modelo)', 'cli.r.max': 'Máxima de hoy', 'cli.r.min': 'Mínima de hoy',
      'cli.r.uvAhora': 'Índice UV ahora', 'cli.r.uvMax': 'Índice UV máximo de hoy', 'cli.r.amanecer': 'Amanecer', 'cli.r.anochecer': 'Anochecer', 'cli.r.sol': 'Horas de sol hoy',
      'cli.r.viento': 'Viento', 'cli.r.rachas': 'Rachas', 'cli.r.beaufort': 'Escala de Beaufort', 'cli.r.ola': 'Estado del mar (modelo)', 'cli.r.periodo': 'Periodo del oleaje',
      'cli.r.corr': 'Corriente', 'cli.r.sst': 'Temperatura del mar', 'cli.r.hum': 'Humedad', 'cli.r.prob': 'Probabilidad de lluvia (24 h)', 'cli.r.mm': 'Lluvia en 24 h', 'cli.r.cielo': 'Cielo',
      'cli.vDir': '{v} kt (≈ {k} km/h) del {d}', 'cli.oleaje': '{h} m · {e}', 'cli.corr': '{v} km/h · dirección {g}°', 'cli.corrCalma': '{v} km/h',
      'cli.s.sens': 'Sensación térmica (°C)', 'cli.s.uv': 'Índice UV', 'cli.s.viento': 'Viento (kt)', 'cli.s.hum': 'Humedad (%)',
      'cli.curva': 'Últimas y próximas 12 horas', 'cli.curvaAhora': 'ahora', 'cli.curvaAlt': '{s}: mínimo {a}, máximo {b} en 24 horas', 'cli.curvaSin': 'Sin datos para dibujar la curva.',
      'cli.consejos': 'Qué puedes hacer', 'cli.fuenteCdc': 'CDC, Five Steps (Heat Action Plan)',
      'cli.protec': 'Protección (OMS)', 'cli.fuenteOms': 'OMS, índice UV',
      'cli.vientoNota': 'Oleaje y corriente salen de un modelo marino, no de boyas. No es un aviso oficial.',
      'cli.verAvisos': 'Ver los avisos del modelo', 'cli.verPesca': 'Ver el Mapa Pesquero',
      'cli.nota': 'Datos de un modelo meteorológico para cada pueblo: no son estaciones ni avisos oficiales. Datos del tiempo: Open-Meteo.com (CC BY 4.0).',
      'cli.volver': '← Mapa Meteorológico', 'cli.sinFicha': 'Ese lugar no tiene ficha técnica: no hay un pueblo equivalente en los datos. Elige otro lugar en el mapa.',
      'cli.cargando': 'Cargando el clima…', 'cli.error': 'No se pudo cargar el clima (¿sin conexión?). El resto de la web no cambia.', 'cli.sin': 'sin dato',
      'cli.r0': 'norte', 'cli.r1': 'noreste', 'cli.r2': 'este', 'cli.r3': 'sureste', 'cli.r4': 'sur', 'cli.r5': 'suroeste', 'cli.r6': 'oeste', 'cli.r7': 'noroeste'
    },
    en: {
      'cli.kicker': 'Now · Open-Meteo model (not weather stations)', 'cli.act': 'Updated {h} · Open-Meteo model, not weather stations',
      'cli.sub': 'Heat, sun, wind, sea and rain in 19 places of Baja California Sur.',
      'cli.buscar': 'Search for a town', 'cli.buscarVacio': 'No town has that name. Try La Paz, Loreto or Cabo San Lucas.',
      'cli.capas': 'Data on the map', 'cli.c.general': 'General', 'cli.c.calor': 'Heat', 'cli.c.viento': 'Wind', 'cli.c.uv': 'UV', 'cli.c.humedad': 'Humidity',
      'cli.mapaReg': 'Map of 19 places of Baja California Sur with temperature, apparent temperature, wind, UV index or humidity',
      'cli.pin.general': '{n}: temperature {v}', 'cli.pin.calor': '{n}: apparent temperature {v}', 'cli.pin.viento': '{n}: wind {v}',
      'cli.pin.uv': '{n}: highest UV index today {v}', 'cli.pin.humedad': '{n}: humidity {v}',
      'cli.zona': 'Town: {z}', 'cli.tarjetas': 'Weather cards for {z}',
      'cli.t.calor': 'Heat and apparent temperature', 'cli.t.uv': 'UV radiation and sun exposure', 'cli.t.viento': 'Wind, waves and currents', 'cli.t.lluvia': 'Humidity and rain',
      'cli.g.calor': '{v} °C', 'cli.g.uv': 'UV {v}', 'cli.g.viento': '{v} kt', 'cli.g.lluvia': '{v} % humidity',
      'cli.e.calor': 'Apparent temperature (model)', 'cli.e.uv': 'Highest today', 'cli.e.viento': 'Wind now', 'cli.e.lluvia': 'Humidity now',
      'cli.f.calor': 'Temperature {t} °C · high {x} °C · low {m} °C', 'cli.f.uv': 'Now {a} · {h} h of sun today',
      'cli.f.viento': 'Gusts {r} kt · Beaufort {b} · waves {o} m', 'cli.f.lluvia': 'Rain in 24 h: {p} % · {mm} mm',
      'cli.ver': 'See details', 'cli.cerrar': 'Close details', 'cli.detalle': '{t} in {z}',
      'cli.r.temp': 'Temperature', 'cli.r.sens': 'Apparent temperature (model)', 'cli.r.max': 'High today', 'cli.r.min': 'Low today',
      'cli.r.uvAhora': 'UV index now', 'cli.r.uvMax': 'Highest UV index today', 'cli.r.amanecer': 'Sunrise', 'cli.r.anochecer': 'Sunset', 'cli.r.sol': 'Hours of sun today',
      'cli.r.viento': 'Wind', 'cli.r.rachas': 'Gusts', 'cli.r.beaufort': 'Beaufort scale', 'cli.r.ola': 'Sea state (model)', 'cli.r.periodo': 'Wave period',
      'cli.r.corr': 'Current', 'cli.r.sst': 'Sea temperature', 'cli.r.hum': 'Humidity', 'cli.r.prob': 'Chance of rain (24 h)', 'cli.r.mm': 'Rain in 24 h', 'cli.r.cielo': 'Sky',
      'cli.vDir': '{v} kt (≈ {k} km/h) from the {d}', 'cli.oleaje': '{h} m · {e}', 'cli.corr': '{v} km/h · direction {g}°', 'cli.corrCalma': '{v} km/h',
      'cli.s.sens': 'Apparent temperature (°C)', 'cli.s.uv': 'UV index', 'cli.s.viento': 'Wind (kt)', 'cli.s.hum': 'Humidity (%)',
      'cli.curva': 'Last and next 12 hours', 'cli.curvaAhora': 'now', 'cli.curvaAlt': '{s}: low {a}, high {b} over 24 hours', 'cli.curvaSin': 'No data to draw the curve.',
      'cli.consejos': 'What you can do', 'cli.fuenteCdc': 'CDC, Five Steps (Heat Action Plan)',
      'cli.protec': 'Protection (WHO)', 'cli.fuenteOms': 'WHO, UV index',
      'cli.vientoNota': 'Waves and current come from a marine model, not buoys. It is not an official warning.',
      'cli.verAvisos': 'See the model notices', 'cli.verPesca': 'See the Fishing Map',
      'cli.nota': 'Data from a weather model for each town: not weather stations or official warnings. Weather data: Open-Meteo.com (CC BY 4.0).',
      'cli.volver': '← Weather Map', 'cli.sinFicha': 'That place has no data sheet: there is no matching town in the data. Pick another place on the map.',
      'cli.cargando': 'Loading the weather…', 'cli.error': 'The weather could not be loaded (offline?). The rest of the site does not change.', 'cli.sin': 'no data',
      'cli.r0': 'north', 'cli.r1': 'northeast', 'cli.r2': 'east', 'cli.r3': 'southeast', 'cli.r4': 'south', 'cli.r5': 'southwest', 'cli.r6': 'west', 'cli.r7': 'northwest'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function n(v, d) { return v == null || isNaN(v) ? t('cli.sin') : RB.num(v, d == null ? 0 : d); }
  function con(v, d, unidad) { return v == null || isNaN(v) ? t('cli.sin') : RB.num(v, d) + ' ' + unidad; }
  function rumbo(g) { return g == null || isNaN(g) ? '' : t('cli.r' + (Math.round(((g % 360) + 360) % 360 / 45) % 8)); }
  /* Buscador: devuelve el índice del pueblo que coincide con el texto (nombre exacto o, si solo uno lo contiene, ese), o -1.
     La comparación sin acentos está en reglas.js (RB.buscarNombre), compartida con Pesca. */
  function buscarPueblo(puertos, texto) { return RB.buscarNombre(puertos, texto); }

  /* Valor y estilo del pin de cada pueblo según la capa. */
  function pines(datos, idx, capa, activo) {
    return datos.puertos.map(function (p, k) {
      var r = C.resumenPuerto(datos, idx, k), valor, icono, tono = 'neutro', num;
      if (capa === 'calor') { num = r.calor.sens; valor = num == null ? '—' : n(num, 1) + ' °C'; icono = 'thermostat'; }
      else if (capa === 'viento') { num = r.viento.kt; valor = num == null ? '—' : n(num) + ' kt'; icono = 'air'; }
      else if (capa === 'uv') {
        num = r.uv.max; valor = num == null ? '—' : n(num, 1); icono = 'sunny';
        tono = r.uv.nivel == null ? 'neutro' : r.uv.nivel >= 3 ? 'rojo' : r.uv.nivel >= 1 ? 'amarillo' : 'verde';
      }
      else if (capa === 'humedad') { num = r.lluvia.hum; valor = num == null ? '—' : n(num) + ' %'; icono = 'water_drop'; }
      else { num = r.calor.temp; valor = num == null ? '—' : n(num, 1) + ' °C'; icono = 'thermostat'; capa = 'general'; }
      return { id: p.id, lat: p.pueblo[0], lon: p.pueblo[1], icono: icono, valor: valor, tono: tono, activo: p.id === activo,
        etiqueta: t('cli.pin.' + capa, { n: p.nombre, v: valor }) };
    });
  }
  function limitesPueblos(datos) {
    var la = datos.puertos.map(function (p) { return p.pueblo[0]; }), lo = datos.puertos.map(function (p) { return p.pueblo[1]; });
    return [[Math.min.apply(null, la), Math.min.apply(null, lo)], [Math.max.apply(null, la), Math.max.apply(null, lo)]];
  }

  /* Cifra grande y frase corta de cada tarjeta. */
  function resumenTarjeta(id, r) {
    if (id === 'calor') {
      var cifra = r.calor.sens != null ? r.calor.sens : r.calor.temp;
      return { cifra: cifra == null ? t('cli.sin') : t('cli.g.calor', { v: n(cifra, 1) }),
        frase: t('cli.f.calor', { t: n(r.calor.temp, 1), x: n(r.calor.max, 1), m: n(r.calor.min, 1) }) };
    }
    if (id === 'uv') {
      return { cifra: r.uv.max == null ? t('cli.sin') : t('cli.g.uv', { v: n(r.uv.max, 1) }) + ' · ' + C.textoUV(r.uv.max),
        frase: t('cli.f.uv', { a: n(r.uv.ahora, 1), h: n(r.uv.solH, 1) }) };
    }
    if (id === 'viento') {
      return { cifra: r.viento.kt == null ? t('cli.sin') : t('cli.g.viento', { v: n(r.viento.kt) }),
        frase: t('cli.f.viento', { r: n(r.viento.rachas), b: r.viento.beaufort == null ? t('cli.sin') : r.viento.beaufort, o: n(r.viento.ola, 1) }) };
    }
    return { cifra: r.lluvia.hum == null ? t('cli.sin') : t('cli.g.lluvia', { v: n(r.lluvia.hum) }),
      frase: t('cli.f.lluvia', { p: n(r.lluvia.prob24), mm: n(r.lluvia.mm24, 1) }) };
  }

  function tarjetas(r, nombre, abierta) {
    return '<div class="cl-tarjetas" role="group" aria-label="' + esc(t('cli.tarjetas', { z: nombre })) + '">' + TARJETAS.map(function (id) {
      var s = resumenTarjeta(id, r), on = abierta === id;
      return '<article class="cl-t cl-t-' + id + (on ? ' cl-t-on' : '') + '"><button type="button" class="cl-t-btn" data-card="' + id + '" aria-expanded="' + (on ? 'true' : 'false') + '" aria-controls="cl-det">' +
        '<span class="cl-t-cab"><img src="assets/iconos/' + ICONO_TARJETA[id] + '.svg" alt="" aria-hidden="true" width="28" height="28"><span class="cl-t-tit">' + esc(t('cli.t.' + id)) + '</span></span>' +
        '<span class="cl-t-cifra">' + esc(s.cifra) + '</span><span class="cl-t-eti">' + esc(t('cli.e.' + id)) + '</span>' +
        '<span class="cl-t-frase">' + esc(s.frase) + '</span><span class="cl-t-ver">' + esc(t(on ? 'cli.cerrar' : 'cli.ver')) + '</span></button></article>';
    }).join('') + '</div>';
  }

  /* Curva de 24 h (12 antes y 12 después) en SVG simple; los huecos (null) cortan la línea, no se rellenan. */
  function curvaSvg(valores, nombreSerie) {
    var v = valores.filter(function (x) { return x != null; });
    if (!v.length) return '<p class="cl-curva-sin">' + esc(t('cli.curvaSin')) + '</p>';
    var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), W = 320, H = 110, X0 = 8, X1 = 312, Y0 = 14, Y1 = 88;
    var rango = mx - mn || 1;
    function px(i) { return X0 + (X1 - X0) * i / 24; }
    function py(x) { return mx === mn ? (Y0 + Y1) / 2 : Y1 - (Y1 - Y0) * (x - mn) / rango; }
    var trazos = [], tramo = [];
    valores.forEach(function (x, i) {
      if (x == null) { if (tramo.length) trazos.push(tramo); tramo = []; } else tramo.push(px(i).toFixed(1) + ',' + py(x).toFixed(1));
    });
    if (tramo.length) trazos.push(tramo);
    var lineas = trazos.map(function (pts) {
      return pts.length === 1 ? '<circle cx="' + pts[0].split(',')[0] + '" cy="' + pts[0].split(',')[1] + '" r="2.5" class="cl-c-pt"/>' : '<polyline points="' + pts.join(' ') + '" class="cl-c-l"/>';
    }).join('');
    var alt = t('cli.curvaAlt', { s: nombreSerie, a: n(mn, 1), b: n(mx, 1) });
    var ahoraX = px(12).toFixed(1);
    return '<svg class="cl-curva" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(alt) + '"><title>' + esc(alt) + '</title>' +
      '<line x1="' + X0 + '" y1="' + Y1 + '" x2="' + X1 + '" y2="' + Y1 + '" class="cl-c-eje"/>' +
      '<line x1="' + ahoraX + '" y1="' + Y0 + '" x2="' + ahoraX + '" y2="' + Y1 + '" class="cl-c-ahora"/>' + lineas +
      '<text x="' + X0 + '" y="' + (H - 6) + '" class="cl-c-txt">−12 h</text><text x="' + ahoraX + '" y="' + (H - 6) + '" text-anchor="middle" class="cl-c-txt">' + esc(t('cli.curvaAhora')) + '</text>' +
      '<text x="' + X1 + '" y="' + (H - 6) + '" text-anchor="end" class="cl-c-txt">+12 h</text>' +
      '<text x="' + X0 + '" y="10" class="cl-c-txt">' + esc(n(mx, 1)) + '</text><text x="' + X0 + '" y="' + (Y1 - 3) + '" class="cl-c-txt">' + esc(n(mn, 1)) + '</text></svg>';
  }

  function fila(et, valor) { return '<div class="cl-fila"><dt>' + esc(et) + '</dt><dd>' + esc(valor) + '</dd></div>'; }

  function detalle(datos, idx, k, id) {
    var r = C.resumenPuerto(datos, idx, k), p = datos.puertos[k], filas = '', extra = '';
    if (id === 'calor') {
      filas = fila(t('cli.r.temp'), con(r.calor.temp, 1, '°C')) + fila(t('cli.r.sens'), con(r.calor.sens, 1, '°C')) +
        fila(t('cli.r.max'), con(r.calor.max, 1, '°C')) + fila(t('cli.r.min'), con(r.calor.min, 1, '°C'));
      extra = '<h4>' + esc(t('cli.consejos')) + '</h4><ul class="cl-lista">' + [1, 2, 3].map(function (i) { return '<li>' + esc(t('acc.c' + i)) + '</li>'; }).join('') +
        '</ul><p class="fuente">' + esc(t('fic.fuente')) + ': <a href="' + URL_CDC + '" target="_blank" rel="noopener">' + esc(t('cli.fuenteCdc')) + '</a></p>';
    } else if (id === 'uv') {
      filas = fila(t('cli.r.uvAhora'), n(r.uv.ahora, 1)) + fila(t('cli.r.uvMax'), r.uv.max == null ? t('cli.sin') : n(r.uv.max, 1) + ' · ' + C.textoUV(r.uv.max)) +
        fila(t('cli.r.amanecer'), r.uv.amanecer || t('cli.sin')) + fila(t('cli.r.anochecer'), r.uv.anochecer || t('cli.sin')) + fila(t('cli.r.sol'), con(r.uv.solH, 1, 'h'));
      extra = '<h4>' + esc(t('cli.protec')) + '</h4><p>' + esc(C.textoProteccion(r.uv.max)) + '</p>' +
        '<p class="fuente">' + esc(t('fic.fuente')) + ': <a href="' + URL_OMS + '" target="_blank" rel="noopener">' + esc(t('cli.fuenteOms')) + '</a></p>';
    } else if (id === 'viento') {
      var v = r.viento;
      filas = fila(t('cli.r.viento'), v.kt == null ? t('cli.sin') : t('cli.vDir', { v: n(v.kt), k: n(v.kt * 1.852), d: rumbo(p.s.vdir && p.s.vdir[idx]) || '—' })) +
        fila(t('cli.r.rachas'), con(v.rachas, 0, 'kt')) + fila(t('cli.r.beaufort'), v.beaufort == null ? t('cli.sin') : v.beaufort + ' · ' + M.textoViento(v.kt)) +
        fila(t('cli.r.ola'), v.ola == null ? t('cli.sin') : t('cli.oleaje', { h: n(v.ola, 1), e: M.textoOla(v.ola) })) + fila(t('cli.r.periodo'), con(v.periodo, 0, 's')) +
        fila(t('cli.r.corr'), v.corriente == null ? t('cli.sin') : (v.corriente > 0 && v.cdir != null ? t('cli.corr', { v: n(v.corriente, 1), g: n(v.cdir) }) : t('cli.corrCalma', { v: n(v.corriente, 1) }))) +
        fila(t('cli.r.sst'), con(v.sst, 1, '°C'));
      extra = '<p class="fuente">' + esc(t('cli.vientoNota')) + '</p><p class="cl-enlaces"><a href="#avisos">' + esc(t('cli.verAvisos')) + '</a> · <a href="#pesca">' + esc(t('cli.verPesca')) + '</a></p>';
    } else {
      var cielo = r.lluvia.codigo == null ? t('cli.sin') : CI.estado(r.lluvia.codigo, 1).texto;
      filas = fila(t('cli.r.hum'), con(r.lluvia.hum, 0, '%')) + fila(t('cli.r.prob'), con(r.lluvia.prob24, 0, '%')) +
        fila(t('cli.r.mm'), con(r.lluvia.mm24, 1, 'mm')) + fila(t('cli.r.cielo'), cielo);
    }
    var serie = SERIE_CURVA[id];
    return '<div class="cl-det-cab"><h3 id="cl-det-h" tabindex="-1">' + esc(t('cli.detalle', { t: t('cli.t.' + id), z: p.nombre })) + '</h3>' +
      '<button type="button" class="cl-cerrar" data-cerrar>' + esc(t('cli.cerrar')) + '</button></div>' +
      '<dl class="cl-filas">' + filas + '</dl><h4>' + esc(t('cli.curva')) + '</h4>' + curvaSvg(C.curva24(datos, k, serie, idx), t('cli.s.' + (id === 'calor' ? 'sens' : id === 'uv' ? 'uv' : id === 'viento' ? 'viento' : 'hum'))) + extra;
  }

  var est = { mapa: null, ficha: 0 };
  function limpiar() {
    est.ficha++;
    if (est.mapa) { est.mapa.destruir(); est.mapa = null; }
  }

  /* Lugares del Mapa Meteorológico (cielo.js) y su pueblo en estas fichas; Comondú no tiene equivalente. */
  var LUGAR_PUEBLO = { lapaz: 'lapaz', loscabos: 'cabos', loreto: 'loreto', mulege: 'mulege', guerreronegro: 'guerreronegro', bahiamagdalena: 'bahiamagdalena' };
  function puebloDe(lugar) {
    if (!lugar) return 'lapaz';
    if (LUGAR_PUEBLO[lugar]) return LUGAR_PUEBLO[lugar];
    return V.PUERTOS.some(function (p) { return p.id === lugar; }) ? lugar : null;   // los lugares extra del mapa usan el id de su puerto
  }

  function montar(main, datos, abierta, edadMs, lugar) {
    var cuerpo = main.querySelector('#cl-cuerpo');
    var idx = V.indiceAhora(datos.horas);
    var pueblo = puebloDe(lugar), sinFicha = !pueblo;
    var S = { puerto: pueblo || 'lapaz', capa: 'general', card: !sinFicha && TARJETAS.indexOf(abierta) >= 0 ? abierta : null };
    function k() { for (var i = 0; i < datos.puertos.length; i++) if (datos.puertos[i].id === S.puerto) return i; return 0; }
    var hora = (V.ahoraLocal(new Date(Date.now() - (edadMs || 0))) || '').slice(11, 16);
    var pill = main.querySelector('#cl-act'); if (pill) { pill.textContent = t('cli.act', { h: hora || '—' }); pill.hidden = false; }

    if (sinFicha) { cuerpo.innerHTML = '<p class="aviso" role="status">' + esc(t('cli.sinFicha')) + '</p><p><a class="cl-volver" href="#clima">' + esc(t('cli.volver')) + '</a></p>'; return; }
    cuerpo.innerHTML = '<p><a class="cl-volver" href="#clima">' + esc(t('cli.volver')) + '</a></p>' +
      '<div class="cl-busca"><label for="cl-q">' + esc(t('cli.buscar')) + '</label><input id="cl-q" type="search" list="cl-lista" autocomplete="off" placeholder="' + esc(t('cli.buscar')) + '">' +
      '<datalist id="cl-lista">' + datos.puertos.map(function (p) { return '<option value="' + esc(p.nombre) + '"></option>'; }).join('') + '</datalist>' +
      '<p class="cl-busca-msg" id="cl-q-msg" role="status" hidden>' + esc(t('cli.buscarVacio')) + '</p></div>' +
      '<div class="pe-mapa-caja"><div id="cl-mapa" class="pe-mapa" role="region" aria-label="' + esc(t('cli.mapaReg')) + '"></div></div>' +
      '<p class="cl-zona" id="cl-zona"></p><div id="cl-tarj"></div><section class="cl-det" id="cl-det" aria-labelledby="cl-det-h" hidden></section>' +
      '<p class="fuente cl-nota">' + esc(t('cli.nota')) + ' <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a></p>';

    var ancho = cuerpo.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
    est.mapa = MI.crear(cuerpo.querySelector('#cl-mapa'), {
      centro: ancho >= 640 ? [25.4, -111.9] : [25.3, -112.1], zoom: ancho >= 640 ? 7 : 6.5, minZoom: 6, maxZoom: 9, limites: [[21.5, -116.5], [29.5, -107.5]],
      ajustar: limitesPueblos(datos), margen: ancho >= 640 ? [70, 70] : [60, 56],
      alElegir: function (id) { S.puerto = id; pintar(); }
    });

    function url(id) { try { history.replaceState(null, '', id ? '#clima/' + id + (lugar ? '/' + lugar : '') : '#clima'); } catch (e) { /* sin historial */ } }
    function pintar() {
      var i = k(), p = datos.puertos[i], r = C.resumenPuerto(datos, idx, i);
      cuerpo.querySelectorAll('[data-capa]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-capa') === S.capa)); });
      if (est.mapa) est.mapa.pines(pines(datos, idx, S.capa, S.puerto));
      cuerpo.querySelector('#cl-zona').textContent = t('cli.zona', { z: p.nombre });
      cuerpo.querySelector('#cl-tarj').innerHTML = tarjetas(r, p.nombre, S.card);
      var det = cuerpo.querySelector('#cl-det');
      if (S.card) { det.innerHTML = detalle(datos, idx, i, S.card); det.hidden = false; } else { det.innerHTML = ''; det.hidden = true; }
    }
    cuerpo.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('button') : null; if (!b) return;
      if (b.hasAttribute('data-capa')) { S.capa = b.getAttribute('data-capa'); pintar(); }
      else if (b.hasAttribute('data-card')) {
        var id = b.getAttribute('data-card'), abre = S.card !== id;
        S.card = abre ? id : null; url(S.card); pintar();
        if (abre) { var h = cuerpo.querySelector('#cl-det-h'); if (h) { if (h.scrollIntoView) h.scrollIntoView({ block: 'start' }); if (h.focus) h.focus({ preventScroll: true }); } }
      }
      else if (b.hasAttribute('data-cerrar')) {
        var viejo = S.card; S.card = null; url(null); pintar();
        var btn = cuerpo.querySelector('[data-card="' + viejo + '"]'); if (btn && btn.focus) btn.focus();
      }
    });
    var q = cuerpo.querySelector('#cl-q'), msg = cuerpo.querySelector('#cl-q-msg');
    q.addEventListener('input', function () {
      var i = buscarPueblo(datos.puertos, q.value);
      if (i >= 0) { S.puerto = datos.puertos[i].id; msg.hidden = true; pintar(); }
      else msg.hidden = !String(q.value).trim();
    });
    pintar();
  }

  function render(main, abierta, lugar) {
    limpiar();
    var mi = est.ficha;
    main.innerHTML = '<section class="cl" aria-labelledby="cl-h1"><div class="pe-cab"><p class="hm-mono pe-ins"><i class="hm-punto" aria-hidden="true"></i>' + esc(t('cli.kicker')) + '</p>' +
      '<p class="hm-mono hm-pildora pe-act" id="cl-act" hidden></p></div><h1 id="cl-h1">' + esc(t('titulo.clima')) + '</h1><p class="pe-sub">' + esc(t('cli.sub')) + '</p>' +
      '<div id="cl-cuerpo"><p class="pe-carga">' + esc(t('cli.cargando')) + '</p></div></section>';
    return V.cargar({ clima: true }).then(function (r) {
      if (mi !== est.ficha) return;
      main.removeAttribute('aria-busy');
      montar(main, r.datos, abierta, r.edadMs, lugar);
    }).catch(function () {
      if (mi !== est.ficha) return;
      main.removeAttribute('aria-busy');
      var c = main.querySelector('#cl-cuerpo');
      if (c) c.innerHTML = '<p class="aviso" role="alert">' + esc(t('cli.error')) + '</p>';
    });
  }

  var RBClima = { render: render, limpiar: limpiar, montar: montar, pines: pines, tarjetas: tarjetas, detalle: detalle, curvaSvg: curvaSvg, resumenTarjeta: resumenTarjeta,
    buscarPueblo: buscarPueblo, TARJETAS: TARJETAS, CAPAS: CAPAS, TX: TX };
  if (typeof window !== 'undefined') window.RBClima = RBClima;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBClima;
})();
