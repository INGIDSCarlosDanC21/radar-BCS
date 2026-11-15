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
      'cm.fichaCarga': 'Cargando la ficha…', 'cm.fichaError': 'No se pudo cargar la ficha (¿sin conexión?).', 'cm.sinFicha': 'Este lugar no tiene ficha técnica: no hay un pueblo equivalente en los datos. Elige otro lugar en el mapa.',
      'cm.busca': 'Buscar lugar y fecha', 'cm.bLugar': 'Lugar', 'cm.bLugarPh': 'Ej.: Los Cabos', 'cm.bFecha': 'Fecha', 'cm.bVer': 'Ver', 'cm.bHoy': 'Hoy',
      'cm.bVacio': 'No encontramos ese lugar. Prueba con La Paz, Los Cabos, Loreto, Comondú o Mulegé.', 'cm.bFuera': 'Elige una fecha entre el {a} y el {b}.',
      'cm.bAyuda': 'Fechas del {a} al {b}: para días pasados, lo que calculó el modelo; para días que vienen, su pronóstico.',
      'cm.diagSubDia': '{f} en {z}, según el modelo meteorológico <a href="https://open-meteo.com/">Open-Meteo</a>{p}. Toca una tarjeta para ver más.',
      'cm.pron': ' (pronóstico, puede cambiar)', 'cm.pasado': ' (lo que calculó el modelo, no son estaciones)',
      'cm.estadoDia': 'Datos del {f} · modelo Open-Meteo', 'cm.cargaDia': 'Cargando los datos del {f}…', 'cm.errorDia': 'No se pudieron cargar los datos de esa fecha (¿sin conexión?).',
      'cm.calorSD': 'Sensación máxima: {v} °C', 'cm.uvSD': 'Máximo del día: {c}', 'cm.vientoSD': 'Ráfagas de hasta {v} km/h', 'cm.lluviaSD': 'Humedad media: {v} %', 'cm.maxCorto': 'máx.',
      'cm.d.tit': '{t} en {z} · {f}', 'cm.d.cerrar': 'Cerrar detalle', 'cm.d.max': 'Máxima', 'cm.d.min': 'Mínima', 'cm.d.smax': 'Sensación térmica máxima (modelo)', 'cm.d.smin': 'Sensación térmica mínima (modelo)',
      'cm.d.uv': 'Índice UV máximo', 'cm.d.amanecer': 'Amanecer', 'cm.d.anochecer': 'Anochecer', 'cm.d.sol': 'Horas de sol',
      'cm.d.viento': 'Viento máximo', 'cm.d.rachas': 'Rachas máximas', 'cm.d.dir': 'Dirección dominante (de dónde viene)',
      'cm.d.lluvia': 'Lluvia del día', 'cm.d.prob': 'Probabilidad de lluvia (máxima)', 'cm.d.hum': 'Humedad media', 'cm.d.cielo': 'Cielo',
      'cm.d.consejos': 'Qué puedes hacer', 'cm.d.cdc': 'CDC, Five Steps (Heat Action Plan)', 'cm.d.fuente': 'Fuente',
      'cm.d.mar': 'El oleaje y las corrientes del modelo marino solo están para hoy: míralos en el Mapa Pesquero.', 'cm.d.pesca': 'Ver el Mapa Pesquero',
      'cm.pAhora': 'Ahora', 'cm.pHoy': '{v} °C (sensación {s} °C) · UV máx. {u} · viento {k} km/h · lluvia {l} %',
      'cm.pDia': 'Máx. {x} °C · mín. {m} °C · UV máx. {u} · rachas {r} km/h · lluvia {l} % ({mm} mm)',
      'cm.rotHoy': 'Ahora · {z}', 'cm.rotDia': '{f} · {z} · valores del día',
      'cm.limite': 'El servicio del clima (Open-Meteo) llegó a su límite de consultas por hoy desde esta red. Intenta más tarde o desde otra conexión.',
      'cm.d.nota': 'Valores del día del modelo Open-Meteo para este lugar: no son estaciones ni avisos oficiales. Datos del tiempo: Open-Meteo.com (CC BY 4.0).'
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
      'cm.fichaCarga': 'Loading the data sheet…', 'cm.fichaError': 'The data sheet could not be loaded (offline?).', 'cm.sinFicha': 'This place has no data sheet: there is no matching town in the data. Pick another place on the map.',
      'cm.busca': 'Search by place and date', 'cm.bLugar': 'Place', 'cm.bLugarPh': 'e.g. Los Cabos', 'cm.bFecha': 'Date', 'cm.bVer': 'Show', 'cm.bHoy': 'Today',
      'cm.bVacio': "We couldn't find that place. Try La Paz, Los Cabos, Loreto, Comondú or Mulegé.", 'cm.bFuera': 'Pick a date between {a} and {b}.',
      'cm.bAyuda': 'Dates from {a} to {b}: for past days, what the model calculated; for coming days, its forecast.',
      'cm.diagSubDia': '{f} in {z}, from the <a href="https://open-meteo.com/">Open-Meteo</a> weather model{p}. Tap a card to see more.',
      'cm.pron': ' (forecast, it may change)', 'cm.pasado': ' (what the model calculated, not weather stations)',
      'cm.estadoDia': 'Data for {f} · Open-Meteo model', 'cm.cargaDia': 'Loading the data for {f}…', 'cm.errorDia': 'The data for that date could not be loaded (offline?).',
      'cm.calorSD': 'Highest feels-like: {v} °C', 'cm.uvSD': "Day's peak: {c}", 'cm.vientoSD': 'Gusts up to {v} km/h', 'cm.lluviaSD': 'Average humidity: {v} %', 'cm.maxCorto': 'high',
      'cm.d.tit': '{t} in {z} · {f}', 'cm.d.cerrar': 'Close details', 'cm.d.max': 'High', 'cm.d.min': 'Low', 'cm.d.smax': 'Highest apparent temperature (model)', 'cm.d.smin': 'Lowest apparent temperature (model)',
      'cm.d.uv': 'Highest UV index', 'cm.d.amanecer': 'Sunrise', 'cm.d.anochecer': 'Sunset', 'cm.d.sol': 'Hours of sun',
      'cm.d.viento': 'Highest wind', 'cm.d.rachas': 'Highest gusts', 'cm.d.dir': 'Main direction (where it comes from)',
      'cm.d.lluvia': 'Rain that day', 'cm.d.prob': 'Chance of rain (highest)', 'cm.d.hum': 'Average humidity', 'cm.d.cielo': 'Sky',
      'cm.d.consejos': 'What you can do', 'cm.d.cdc': 'CDC, Five Steps (Heat Action Plan)', 'cm.d.fuente': 'Source',
      'cm.d.mar': 'Waves and currents from the marine model are only available for today: see them on the Fishing Map.', 'cm.d.pesca': 'See the Fishing Map',
      'cm.pAhora': 'Now', 'cm.pHoy': '{v} °C (feels like {s} °C) · UV peak {u} · wind {k} km/h · rain {l} %',
      'cm.pDia': 'High {x} °C · low {m} °C · UV peak {u} · gusts {r} km/h · rain {l} % ({mm} mm)',
      'cm.rotHoy': 'Now · {z}', 'cm.rotDia': '{f} · {z} · daily values',
      'cm.limite': 'The weather service (Open-Meteo) reached its request limit for today from this network. Try again later or from another connection.',
      'cm.d.nota': "Daily values from the Open-Meteo model for this place: not weather stations or official warnings. Weather data: Open-Meteo.com (CC BY 4.0)."
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  /* Las 4 tarjetas de Figma: ícono de web/assets/iconos, acento, insignia, renglón y a dónde lleva. */
  /* Con una fecha elegida (f.dia), las tarjetas muestran los valores de ese día (máximas, rachas, humedad media). */
  var TARJETAS = [
    { id: 'calor', icono: 'clima-calor-y-sensacion-termica', href: '#clima/calor',
      insignia: function (f) { return t('cm.calorB', { v: num(f.max) }); },
      renglon: function (f) { return f.dia ? t('cm.calorSD', { v: num(f.dia.apparent_temperature_max) }) : t('cm.calorS', { v: num(f.c.apparent_temperature) }); } },
    { id: 'uv', icono: 'clima-radiacion-uv-y-exposicion-solar', href: '#clima/uv',
      insignia: function (f) { return t('cm.uvB', { v: num(f.uvMax) }); },
      renglon: function (f) { return t(f.dia ? 'cm.uvSD' : 'cm.uvS', { c: CL.uvCat(f.uvMax) || '—' }); } },
    { id: 'viento', icono: 'clima-viento-oleaje-y-corrientes', href: '#clima/viento',
      insignia: function (f) { return f.dia ? t('cm.vientoB', { v: num(f.dia.wind_speed_10m_max), r: CL.rumbo(f.dia.wind_direction_10m_dominant) }) : t('cm.vientoB', { v: num(f.c.wind_speed_10m), r: CL.rumbo(f.c.wind_direction_10m) }); },
      renglon: function (f) { return t(f.dia ? 'cm.vientoSD' : 'cm.vientoS', { v: num(f.rachas) }); } },
    { id: 'lluvia', icono: 'clima-humedad-y-lluvia', href: '#clima/lluvia',
      insignia: function (f) { return t('cm.lluviaB', { v: num(f.lluvia) }); },
      renglon: function (f) { return f.dia ? t('cm.lluviaSD', { v: num(f.dia.relative_humidity_2m_mean) }) : t('cm.lluviaS', { v: num(f.c.relative_humidity_2m) }); } }
  ];

  /* Fechas (hora de La Paz). Open-Meteo acepta de ~3 meses atrás a 16 días adelante (medido el 2026-11-15:
     "allowed range from 2026-08-14 to 2026-11-30"); se ofrece de hoy − 92 a hoy + 15 días. */
  var DIAS_ATRAS = 92, DIAS_ADELANTE = 15;
  function hoyISO(ahora) {
    var d = ahora || new Date();
    try { return d.toLocaleDateString('en-CA', { timeZone: 'America/Mazatlan' }); } catch (e) { return d.toISOString().slice(0, 10); }
  }
  function sumarDias(iso, n) {
    var p = String(iso).split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n, 12));
    return d.toISOString().slice(0, 10);
  }
  function rangoFechas(ahora) { var h = hoyISO(ahora); return { min: sumarDias(h, -DIAS_ATRAS), max: sumarDias(h, DIAS_ADELANTE), hoy: h }; }
  function fechaTexto(iso) {
    var p = String(iso).split('-');
    try { return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)).toLocaleDateString(T.locale ? T.locale() : 'es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
    catch (e) { return iso; }
  }
  /* Nombres completos para el buscador (en el mapa algunos van abreviados). */
  var NOMBRE = { guerreronegro: 'Guerrero Negro', bahiamagdalena: 'Bahía Magdalena' };
  function nombreDe(l) { return NOMBRE[l.id] || l.es; }
  function sinAcentos(s) { var x = String(s || '').toLowerCase().trim(); return x.normalize ? x.normalize('NFD').replace(/[̀-ͯ]/g, '') : x; }
  /* Lugar que coincide con el texto: nombre exacto (completo o corto) o, si solo uno lo contiene, ese; si no, null. */
  function buscarLugar(texto) {
    var q = sinAcentos(texto); if (!q) return null;
    var exacto = null, parciales = [];
    CL.LUGARES.forEach(function (l) {
      var a = sinAcentos(nombreDe(l)), b = sinAcentos(l.es);
      if (a === q || b === q) exacto = l; else if (a.indexOf(q) >= 0 || b.indexOf(q) >= 0) parciales.push(l);
    });
    return exacto || (parciales.length === 1 ? parciales[0] : null);
  }
  var DIARIO = 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,sunshine_duration,sunrise,sunset,' +
    'wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_sum,precipitation_probability_max,relative_humidity_2m_mean';
  function urlDia(fecha) {
    return 'https://api.open-meteo.com/v1/forecast?latitude=' + CL.LUGARES.map(function (l) { return l.lat; }).join(',') +
      '&longitude=' + CL.LUGARES.map(function (l) { return l.lon; }).join(',') +
      '&daily=' + DIARIO + '&timezone=America%2FMazatlan&start_date=' + fecha + '&end_date=' + fecha;
  }
  /* Una fila por lugar con los valores del día; mismos campos que CL.unir para reusar pines y tarjetas. */
  function unirDia(resp, fecha) {
    var l = Object.prototype.toString.call(resp) === '[object Array]' ? resp : [resp];
    return CL.LUGARES.map(function (lugar, k) {
      var d = (l[k] || {}).daily || {}, dia = { fecha: fecha };
      DIARIO.split(',').forEach(function (v) { dia[v] = d[v] && d[v][0] != null ? d[v][0] : null; });
      return { lugar: lugar, dia: dia, c: { temperature_2m: dia.temperature_2m_max }, min: dia.temperature_2m_min, max: dia.temperature_2m_max, uvMax: dia.uv_index_max,
        lluvia: dia.precipitation_probability_max, rachas: dia.wind_gusts_10m_max, e: CL.estado(dia.weather_code, 1) };
    });
  }
  var CACHE_DIA = {};
  function datosDia(fecha, opciones) {
    var pedir = (opciones && opciones.fetch) || (typeof fetch !== 'undefined' ? fetch : null);
    if (!pedir) return Promise.reject(new Error('sin fetch'));
    if (!(opciones && opciones.fetch) && CACHE_DIA[fecha]) return CACHE_DIA[fecha];
    var p = pedir(urlDia(fecha)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { return unirDia(j, fecha); });
    if (!(opciones && opciones.fetch)) { CACHE_DIA[fecha] = p; p.catch(function () { delete CACHE_DIA[fecha]; }); }
    return p;
  }

  function fila(et, valor) { return '<div class="cl-fila"><dt>' + esc(et) + '</dt><dd>' + esc(valor) + '</dd></div>'; }
  function con(v, d, u) { return v == null || isNaN(v) ? '—' : num(v, d) + ' ' + u; }
  /* Ficha de un día elegido: valores diarios del modelo para el lugar (sin curva de 24 h ni modelo marino). */
  function detalleDia(f, id) {
    var d = f.dia, filas = '', extra = '';
    if (id === 'calor') {
      filas = fila(t('cm.d.max'), con(d.temperature_2m_max, 1, '°C')) + fila(t('cm.d.min'), con(d.temperature_2m_min, 1, '°C')) +
        fila(t('cm.d.smax'), con(d.apparent_temperature_max, 1, '°C')) + fila(t('cm.d.smin'), con(d.apparent_temperature_min, 1, '°C'));
      extra = '<h4>' + esc(t('cm.d.consejos')) + '</h4><ul class="cl-lista">' + [1, 2, 3].map(function (i) { return '<li>' + esc(t('acc.c' + i)) + '</li>'; }).join('') + '</ul>' +
        '<p class="fuente">' + esc(t('cm.d.fuente')) + ': <a href="https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf" target="_blank" rel="noopener">' + esc(t('cm.d.cdc')) + '</a></p>';
    } else if (id === 'uv') {
      var RC = typeof window !== 'undefined' && window.RBReglasClima;
      filas = fila(t('cm.d.uv'), d.uv_index_max == null ? '—' : num(d.uv_index_max, 1) + ' · ' + CL.uvCat(d.uv_index_max)) +
        fila(t('cm.d.amanecer'), d.sunrise ? d.sunrise.slice(11, 16) : '—') + fila(t('cm.d.anochecer'), d.sunset ? d.sunset.slice(11, 16) : '—') +
        fila(t('cm.d.sol'), d.sunshine_duration == null ? '—' : num(d.sunshine_duration / 3600, 1) + ' h');
      if (RC && RC.textoProteccion && d.uv_index_max != null) extra = '<p>' + esc(RC.textoProteccion(d.uv_index_max)) + '</p>';
    } else if (id === 'viento') {
      filas = fila(t('cm.d.viento'), con(d.wind_speed_10m_max, 0, 'km/h')) + fila(t('cm.d.rachas'), con(d.wind_gusts_10m_max, 0, 'km/h')) +
        fila(t('cm.d.dir'), CL.rumbo(d.wind_direction_10m_dominant) || '—');
      extra = '<p class="fuente">' + esc(t('cm.d.mar')) + ' <a href="#pesca">' + esc(t('cm.d.pesca')) + '</a></p>';
    } else {
      filas = fila(t('cm.d.lluvia'), con(d.precipitation_sum, 1, 'mm')) + fila(t('cm.d.prob'), con(d.precipitation_probability_max, 0, '%')) +
        fila(t('cm.d.hum'), con(d.relative_humidity_2m_mean, 0, '%')) + fila(t('cm.d.cielo'), d.weather_code == null ? '—' : f.e.texto);
    }
    return '<div class="cl-det-cab"><h3 id="cl-det-h" tabindex="-1">' + esc(t('cm.d.tit', { t: t('cm.' + id), z: nombreDe(f.lugar), f: fechaTexto(d.fecha) })) + '</h3>' +
      '<button type="button" class="cl-cerrar" data-cerrar>' + esc(t('cm.d.cerrar')) + '</button></div>' +
      '<dl class="cl-filas">' + filas + '</dl>' + extra + '<p class="fuente">' + esc(t('cm.d.nota')) + '</p>';
  }

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
  function buscadorHtml() {
    var r = rangoFechas();
    return '<form class="cm-busca" id="cm-busca" role="search" aria-label="' + esc(t('cm.busca')) + '" novalidate>' +
      '<div class="cm-campo cm-campo-l"><label for="cm-q">' + esc(t('cm.bLugar')) + '</label><input id="cm-q" type="search" list="cm-lista" autocomplete="off" placeholder="' + esc(t('cm.bLugarPh')) + '">' +
      '<datalist id="cm-lista">' + CL.LUGARES.map(function (l) { return '<option value="' + esc(nombreDe(l)) + '"></option>'; }).join('') + '</datalist></div>' +
      '<div class="cm-campo"><label for="cm-f">' + esc(t('cm.bFecha')) + '</label><input id="cm-f" type="date" min="' + r.min + '" max="' + r.max + '" value="' + r.hoy + '"></div>' +
      '<div class="cm-acc"><button type="submit" class="cm-btn">' + esc(t('cm.bVer')) + '</button><button type="button" class="cm-btn cm-btn-2" data-hoy>' + esc(t('cm.bHoy')) + '</button></div>' +
      '<p class="cm-busca-msg" id="cm-busca-msg" role="status" hidden></p>' +
      '<p class="cm-busca-ayuda">' + esc(t('cm.bAyuda', { a: fechaTexto(r.min), b: fechaTexto(r.max) })) + '</p></form>';
  }
  function html() {
    S.lugar = 'lapaz'; S.fecha = null; FICHA = null;
    return '<section class="cm" aria-labelledby="cm-h1"><h1 id="cm-h1">' + t('cm.h1') + '</h1><p class="lead">' + t('cm.lead') + '</p>' + buscadorHtml() +
      '<div class="cm-marco"><p class="cm-mapa-rot" id="cm-mapa-rot" role="status" hidden></p><div id="cm-mapa" class="cm-mapa" role="region" aria-label="' + esc(t('cm.region')) + '"></div>' +
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
    var l = f.lugar, mx = f.dia ? t('cm.maxCorto') + ' ' : '';
    return '<span data-lugar="' + l.id + '" class="cm-pin' + (l.extra ? ' cm-pin-mini' : '') + (l.id === S.lugar ? ' cm-pin-sel' : '') + (l.principal ? ' cm-pin-lp' : '') + (IZQ[l.id] ? ' cm-pin-izq' : '') + '" role="img" aria-label="' + esc(l.es + ': ' + f.e.texto + ', ' + mx + num(f.c.temperature_2m) + ' °C') + '">' +
      '<span class="cm-pin-c">' + CL.icono(f.e, l.principal ? 'cl-blanco' : '') + '</span>' +
      '<span class="cm-pin-t" aria-hidden="true"><span class="cm-n">' + esc(l.es) + ' · </span>' + num(f.c.temperature_2m) + '°C<em> ' + esc(f.e.texto) + '</em></span></span>';
  }

  /* Lugar elegido en el mapa: las tarjetas y las fichas (#clima/<ficha>/<lugar>) muestran sus valores. */
  var S = { lugar: 'lapaz', fecha: null }, FILAS = null;
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
  /* La ficha abierta va justo debajo de la fila de su tarjeta (ocupa todo el ancho de la cuadrícula); cerrada, después de las tarjetas. */
  function sacarFicha(raiz) {
    if (typeof raiz.querySelector !== 'function') return;
    var caja = raiz.querySelector('#cm-ficha'), grid = raiz.querySelector('#cm-tarjetas');
    if (caja && grid && caja.parentNode === grid && grid.parentNode) grid.parentNode.insertBefore(caja, grid.nextSibling);
  }
  function colocarFicha(raiz) {
    if (typeof raiz.querySelector !== 'function') return;
    var caja = raiz.querySelector('#cm-ficha'), grid = raiz.querySelector('#cm-tarjetas');
    if (!caja || !grid || typeof grid.querySelectorAll !== 'function') return;
    var tarjetas = [].slice.call(grid.querySelectorAll('.cm-tarjeta')), tarj = FICHA ? grid.querySelector('.cm-tarjeta.cm-' + FICHA) : null;
    if (!tarj) { sacarFicha(raiz); return; }
    var cols = 1;
    try { cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1; } catch (e) { cols = 1; }
    var i = tarjetas.indexOf(tarj), fin = Math.min(Math.floor(i / cols) * cols + cols - 1, tarjetas.length - 1);
    grid.insertBefore(caja, tarjetas[fin].nextSibling);
  }
  function pintarFicha(raiz, enfocar) {
    var caja = raiz.querySelector('#cm-ficha'); if (!caja || !FICHA) return Promise.resolve(false);
    var id = FICHA;
    if (S.fecha) {
      var f = filaDe(S.lugar); if (!f || !f.dia) return Promise.resolve(false);
      caja.hidden = false; caja.innerHTML = detalleDia(f, id);
      var hd = caja.querySelector('#cl-det-h');
      if (enfocar && hd) { if (hd.scrollIntoView) hd.scrollIntoView({ block: 'nearest' }); if (hd.focus) hd.focus({ preventScroll: true }); }
      return Promise.resolve(true);
    }
    if (!PUERTO[S.lugar]) { caja.hidden = false; caja.innerHTML = '<p class="aviso" role="status">' + esc(t('cm.sinFicha')) + '</p>'; return Promise.resolve(false); }
    if (!vivo() || typeof window === 'undefined' || !window.RBClima) return Promise.resolve(false);
    caja.hidden = false;
    if (!caja.innerHTML) caja.innerHTML = '<p class="pe-carga">' + esc(t('cm.fichaCarga')) + '</p>';
    if (!PROMESA) PROMESA = vivo().cargar({ clima: true }).catch(function (e) { PROMESA = null; throw e; });
    return PROMESA.then(function (r) {
      if (FICHA !== id) return false;
      var d = r.datos, k = 0;
      d.puertos.forEach(function (p, i) { if (p.id === PUERTO[S.lugar]) k = i; });
      caja.innerHTML = window.RBClima.detalle(d, vivo().indiceAhora(d.horas), k, id);
      var h = caja.querySelector('#cl-det-h');
      if (enfocar && h) { if (h.scrollIntoView) h.scrollIntoView({ block: 'nearest' }); if (h.focus) h.focus({ preventScroll: true }); }
      return true;
    }, function () { if (FICHA === id) caja.innerHTML = '<p class="aviso" role="alert">' + esc(t('cm.fichaError')) + '</p>'; return false; });
  }
  function abrirFicha(raiz, id) {
    if (FICHAS.indexOf(id) < 0) return Promise.resolve(false);
    var caja = raiz.querySelector('#cm-ficha'); if (caja) caja.innerHTML = '';
    FICHA = id; url(id); marcarTarjetas(raiz); colocarFicha(raiz);
    return pintarFicha(raiz, true);
  }
  function cerrarFicha(raiz) {
    var previa = FICHA, caja = raiz.querySelector('#cm-ficha');
    FICHA = null; url(null);
    if (caja) { caja.hidden = true; caja.innerHTML = ''; }
    marcarTarjetas(raiz); colocarFicha(raiz);
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
      else if (el.closest('#cm-busca [data-hoy]')) {
        var qf = raiz.querySelector('#cm-f'); if (qf) qf.value = rangoFechas().hoy;
        buscar(raiz);
      }
    });
    // Delegados en la raíz (main se reusa al volver a Clima; el formulario se vuelve a crear).
    raiz.addEventListener('submit', function (ev) {
      if (ev.target && ev.target.id === 'cm-busca') { ev.preventDefault(); buscar(raiz); }
    });
    raiz.addEventListener('change', function (ev) {
      var el = ev.target; if (!el) return;
      // Al elegir una opción de la lista (nombre exacto) o una fecha se aplica sin pulsar "Ver".
      if (el.id === 'cm-q' && buscarLugar(el.value)) buscar(raiz);
      else if (el.id === 'cm-f' && el.value) buscar(raiz);
    });
    if (typeof window !== 'undefined' && window.addEventListener) {
      var espera = null;
      window.addEventListener('resize', function () {
        if (espera) clearTimeout(espera);
        espera = setTimeout(function () { if (FICHA && raiz.querySelector('#cm-tarjetas')) colocarFicha(raiz); }, 150);
      });
    }
  }

  /* Buscador: lugar (texto) y fecha. Hoy = datos de ahora (los mismos que Inicio); otra fecha = valores del día. */
  function aviso(raiz, txt) {
    var m = raiz.querySelector('#cm-busca-msg'); if (!m) return;
    m.textContent = txt || ''; m.hidden = !txt;
  }
  function buscar(raiz) {
    var q = raiz.querySelector('#cm-q'), fe = raiz.querySelector('#cm-f'), r = rangoFechas();
    var texto = q ? String(q.value || '').trim() : '', lugar = texto ? buscarLugar(texto) : null;
    if (texto && !lugar) { aviso(raiz, t('cm.bVacio')); return Promise.resolve(false); }
    var fecha = fe && fe.value ? fe.value : r.hoy;
    if (fecha < r.min || fecha > r.max) { aviso(raiz, t('cm.bFuera', { a: fechaTexto(r.min), b: fechaTexto(r.max) })); return Promise.resolve(false); }
    aviso(raiz, '');
    if (lugar) S.lugar = lugar.id;
    var nueva = fecha === r.hoy ? null : fecha, cambia = nueva !== S.fecha;
    S.fecha = nueva;
    var listo = cambia ? (nueva ? cargarDia(raiz) : cargar(raiz, OPC || {})) : Promise.resolve((elegir(raiz, S.lugar), true));
    return listo.then(function (ok) {
      if (ok !== false) mostrarEnMapa(raiz, S.lugar);
      return ok;
    });
  }
  function cargarDia(raiz) {
    var fecha = S.fecha, est = raiz.querySelector('#cm-estado');
    if (reloj) { clearTimeout(reloj); reloj = null; }   // con una fecha elegida no se refresca cada 10 min
    if (est) { est.textContent = t('cm.cargaDia', { f: fechaTexto(fecha) }); est.className = 'cm-estado'; }
    return datosDia(fecha, OPC).then(function (filas) {
      if (S.fecha !== fecha) return false;
      FILAS = filas;
      elegir(raiz, S.lugar);
      if (FICHA) pintarFicha(raiz, false);
      if (est) est.textContent = t('cm.estadoDia', { f: fechaTexto(fecha) });
      pintarMapa(raiz, filas); rotuloMapa(raiz, filaDe(S.lugar));
      return true;
    }).catch(function (e) {
      if (est) { est.textContent = t(e && e.message === '429' ? 'cm.limite' : 'cm.errorDia'); est.className = 'cm-estado cl-error'; }
      return false;
    });
  }

  function elegir(raiz, id) {
    S.lugar = id;
    var f = filaDe(id), caja = raiz.querySelector('#cm-tarjetas'), sub = raiz.querySelector('#cm-diag-sub');
    sacarFicha(raiz);
    if (f && caja) caja.innerHTML = tarjetas(f);
    if (f && sub) sub.innerHTML = S.fecha
      ? t('cm.diagSubDia', { f: esc(fechaTexto(S.fecha)), z: esc(nombreDe(f.lugar)), p: t(S.fecha > hoyISO() ? 'cm.pron' : 'cm.pasado') })
      : t('cm.diagSub', { z: esc(f.lugar.es) });
    marcarTarjetas(raiz); colocarFicha(raiz);
    if (FICHA) { url(FICHA); pintarFicha(raiz, false); }
    if (typeof raiz.querySelectorAll === 'function') raiz.querySelectorAll('.cm-pin[data-lugar]').forEach(function (e) { e.classList.toggle('cm-pin-sel', e.getAttribute('data-lugar') === id); });
  }

  var MAPA = null, CAPA = null, reloj = null, MARCAS = {};
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
    MARCAS = {};
    CAPA = L.layerGroup(filas.map(function (f) {
      // En celular el pin es compacto (ícono y temperatura); al tocarlo se ve el nombre y el estado del cielo.
      var m = L.marker([f.lugar.lat, f.lugar.lon], { icon: L.divIcon({ className: 'cm-pin-wrap', html: pinHtml(f), iconSize: [0, 0], iconAnchor: [0, 0] }), keyboard: false, zIndexOffset: f.lugar.principal ? 1000 : 0 })
        .on('click', function () { elegir(raiz, f.lugar.id); rotuloMapa(raiz, f); })
        .bindPopup(popupHtml(f), { maxWidth: 260, autoPanPaddingTopLeft: [12, 12], autoPanPaddingBottomRight: [12, 64] });
      MARCAS[f.lugar.id] = m;
      return m;
    })).addTo(MAPA);
  }
  /* Condiciones del lugar en el globo del mapa: las de ahora o las del día elegido. */
  function popupHtml(f) {
    var cab = '<strong>' + esc(nombreDe(f.lugar)) + '</strong><br>' + esc(f.dia ? fechaTexto(f.dia.fecha) : t('cm.pAhora')) + ' · ' + esc(f.e.texto) + '<br>';
    if (f.dia) {
      return cab + esc(t('cm.pDia', { x: num(f.max), m: num(f.min), u: num(f.uvMax), r: num(f.rachas), l: num(f.lluvia), mm: num(f.dia.precipitation_sum, 1) }));
    }
    return cab + esc(t('cm.pHoy', { v: num(f.c.temperature_2m), s: num(f.c.apparent_temperature), u: num(f.uvMax), k: num(f.c.wind_speed_10m), l: num(f.lluvia) }));
  }
  /* Rótulo sobre el mapa: qué se está viendo (ahora o el día elegido) y dónde. */
  function rotuloMapa(raiz, f) {
    var r = raiz.querySelector('#cm-mapa-rot'); if (!r || !f) return;
    r.textContent = S.fecha ? t('cm.rotDia', { f: fechaTexto(S.fecha), z: nombreDe(f.lugar) }) : t('cm.rotHoy', { z: nombreDe(f.lugar) });
    r.hidden = false;
  }
  /* Centra el mapa en el lugar y abre su globo con las condiciones. */
  function mostrarEnMapa(raiz, id) {
    var l = null; CL.LUGARES.forEach(function (x) { if (x.id === id) l = x; });
    if (!MAPA || !l) return;
    try { MAPA.setView([l.lat, l.lon], Math.max(MAPA.getZoom(), 8), { animate: false }); } catch (e) { /* sin mapa */ }
    if (MARCAS[id] && MARCAS[id].openPopup) MARCAS[id].openPopup();
    rotuloMapa(raiz, filaDe(id));
  }

  var OPC = null;
  function cargar(raiz, opciones) {
    opciones = opciones || {};
    if (!raiz || typeof raiz.querySelector !== 'function' || !raiz.querySelector('#cm-tarjetas')) return Promise.resolve(false);
    OPC = opciones; enlazar(raiz);   // el buscador funciona aunque falle la carga de ahora
    if (reloj) { clearTimeout(reloj); reloj = null; }
    if (S.fecha) return cargarDia(raiz);
    return CL.datos(opciones).then(function (filas) {
      if (S.fecha) return false;   // mientras cargaba se eligió otra fecha
      FILAS = filas;
      if (opciones.lugar && !opciones._lugar) { opciones._lugar = true; S.lugar = filaDe(opciones.lugar).lugar.id; }
      var lp = filaDe(S.lugar);
      elegir(raiz, lp.lugar.id);
      var est = raiz.querySelector('#cm-estado');
      if (est) est.textContent = t('cielo.sincro', { h: (lp.c.time || '').slice(11, 16) });
      pintarMapa(raiz, filas); rotuloMapa(raiz, lp);
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
      if (S.fecha) return;                             // con una fecha elegida no se refresca
      cargar(raiz, opciones);
    }, ms);
  }

  var RBClimaMapa = { abrirFicha: abrirFicha, cerrarFicha: cerrarFicha, elegir: elegir, html: html, tarjetas: tarjetas, pinHtml: pinHtml, cargar: cargar, TARJETAS: TARJETAS, TX: TX,
    buscar: buscar, buscarLugar: buscarLugar, rangoFechas: rangoFechas, urlDia: urlDia, unirDia: unirDia, detalleDia: detalleDia, colocarFicha: colocarFicha, fechaTexto: fechaTexto, popupHtml: popupHtml };
  if (typeof window !== 'undefined') window.RBClimaMapa = RBClimaMapa;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBClimaMapa;
})();
