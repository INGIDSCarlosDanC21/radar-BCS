/* Simulaciones (decisión de Carlos, 2026-11-15; docs/decisiones.md). ES5, sin build.
   1) "Mira La Paz desde el espacio" (pantalla Mapa): fotos REALES del satélite Terra de la NASA (servicio GIBS),
      una por año en abril, con control de año y reproducción. Son fotos, no una tendencia.
   2) "Viaja en el tiempo" (pantalla Ficha): control de año con los datos reales de cada indicador (serie_anual).
      Solo si la tendencia es clara (significancia) y no es regional (agua) se puede ver "si la tendencia sigue"
      hasta 2035: prolonga la línea de Sen, no es un pronóstico y no dice por qué cambia (regla 2 de AGENTS.md).
   Ninguna cifra se inventa: todo sale de data/indicadores.json o de las imágenes de GIBS. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var RB = (typeof window !== 'undefined' && window.RB) || (typeof require !== 'undefined' ? require('./reglas.js') : null);
  var t = T.t;
  var HORIZONTE = 2035;
  var DIA_MAQ = 650;   // ms por año al reproducir la máquina del tiempo
  var DIA_SAT = 1000;  // ms de pausa por foto al reproducir el satélite

  /* ---------- Textos (se agregan al diccionario de textos.js; mismas claves en ES y EN) ---------- */
  var TX = {
    es: {
      'sat.h': 'Mira La Paz desde el espacio',
      'sat.lead': 'Fotos reales del satélite Terra de la NASA, una por año, tomadas en abril. Mueve el año o pulsa Reproducir y compara.',
      'sat.capa': 'Tipo de imagen', 'sat.color': 'Vista real', 'sat.calor': 'Calor del suelo',
      'sat.region': 'Mapa de satélite de La Paz', 'sat.anio': 'Año de la foto',
      'sat.play': 'Reproducir', 'sat.pausa': 'Pausar',
      'sat.txtColor': 'Foto del satélite Terra del {f}. Verde: plantas. Café y beige: suelo seco. Azul oscuro: mar. Blanco: nubes.',
      'sat.txtCalor': 'Calor del suelo: promedio de 8 días a partir del {f}. Más rojizo es más caliente; más verde amarillento, más fresco.',
      'sat.leyMin': 'más fresco', 'sat.leyMax': 'más caliente', 'sat.leyTit': 'Temperatura del suelo (°C)',
      'sat.aviso': 'Es una foto de cada año, no una tendencia: un solo día puede ser más caliente, más seco o traer nubes. Para saber si el cambio es real, mira la Ficha. La temperatura del suelo no es la del aire: el satélite Aqua no confirma su tendencia, por eso la cifra de calor del proyecto es la del aire.',
      'sat.cred': 'Imágenes: NASA EOSDIS GIBS, MODIS Terra (datos abiertos de la NASA). Escala de colores: capa «Land Surface Temperature» de GIBS. Sin conexión no se ven.',
      'sat.error': 'No se pudieron cargar las imágenes del satélite (¿sin conexión?). El resto del mapa sigue funcionando.',
      'sat.ciudad': 'La Paz',
      'mapa.numeros': 'El número de cada zona en el mapa es su lugar en esta lista.',
      'maq.h': 'Viaja en el tiempo',
      'maq.lead': 'Mueve el año y mira cómo estaba. Son datos reales de cada año.',
      'maq.leadProy': 'Mueve el año y mira cómo estaba. Después de {a} puedes ver qué pasaría si la tendencia siguiera igual (no es un pronóstico).',
      'maq.anio': 'Año', 'maq.play': 'Reproducir', 'maq.pausa': 'Pausar',
      'maq.etqDato': 'Dato real', 'maq.etqProy': 'Si la tendencia sigue (no es un pronóstico)',
      'maq.avisoProy': 'Esto no es un pronóstico: solo prolonga la línea de los últimos {n} años. El clima real puede cambiar y esta línea no explica por qué cambia.',
      'maq.sinProy.lluvia': 'No proyectamos la lluvia: no hay tendencia clara y cambia mucho de un año a otro.',
      'maq.sinProy.agua': 'No proyectamos el agua: el dato es regional, no del acuífero de La Paz.',
      'maq.sinProy': 'Este indicador no se proyecta.',
      'maq.sinDato': 'Para {a} no hay dato (el año está incompleto o falta la lectura).',
      'maq.calor.dato': 'En {a}, el aire de La Paz promedió {v}.',
      'maq.calor.proy': 'Si la tendencia sigue igual, en {a} el aire promediaría unos {v}.',
      'maq.calor.mas': ' Es {d} más caliente que en {b}.', 'maq.calor.menos': ' Es {d} menos caliente que en {b}.',
      'maq.vegetacion.dato': 'En {a}, el índice de verdor visto por satélite fue de {v} (0 es suelo sin plantas; 1, vegetación muy densa).',
      'maq.vegetacion.proy': 'Si la tendencia sigue igual, en {a} el índice de verdor sería de unos {v}.',
      'maq.vegetacion.mas': ' Hay {d} más verdor que en {b}.', 'maq.vegetacion.menos': ' Hay {d} menos verdor que en {b}.',
      'maq.lluvia.dato': 'En {a} cayeron {v} de lluvia en total.',
      'maq.lluvia.mas': ' Fue un año más lluvioso que el promedio ({m}).', 'maq.lluvia.menos': ' Fue un año más seco que el promedio ({m}).',
      'maq.lluvia.igual': ' Fue un año cercano al promedio ({m}).',
      'maq.agua.dato': 'En {a}, el agua almacenada en la región estaba {v} respecto a su promedio de referencia.',
      'maq.agua.mas': ' Es {d} más que en {b}.', 'maq.agua.menos': ' Es {d} menos que en {b}.',
      'maq.grafTit': '{t} por año y línea de tendencia', 'maq.grafDesc': 'Gráfica de {t} de {a} a {b}. El punto marca {y}: {v}.'
    },
    en: {
      'sat.h': 'See La Paz from space',
      'sat.lead': 'Real photos from NASA’s Terra satellite, one per year, taken in April. Move the year or press Play and compare.',
      'sat.capa': 'Image type', 'sat.color': 'True color', 'sat.calor': 'Ground heat',
      'sat.region': 'Satellite map of La Paz', 'sat.anio': 'Year of the photo',
      'sat.play': 'Play', 'sat.pausa': 'Pause',
      'sat.txtColor': 'Terra satellite photo from {f}. Green: plants. Brown and beige: dry ground. Dark blue: sea. White: clouds.',
      'sat.txtCalor': 'Ground heat: 8-day average starting {f}. Redder is hotter; yellow-green is cooler.',
      'sat.leyMin': 'cooler', 'sat.leyMax': 'hotter', 'sat.leyTit': 'Ground temperature (°C)',
      'sat.aviso': 'This is one photo per year, not a trend: a single day can be hotter, drier or cloudy. To know whether the change is real, see the Details. Ground temperature is not air temperature: the Aqua satellite does not confirm its trend, which is why the project’s heat figure is the air one.',
      'sat.cred': 'Images: NASA EOSDIS GIBS, MODIS Terra (NASA open data). Color scale: GIBS “Land Surface Temperature” layer. They do not show offline.',
      'sat.error': 'The satellite images could not be loaded (offline?). The rest of the map still works.',
      'sat.ciudad': 'La Paz',
      'mapa.numeros': 'The number on each zone in the map is its place in this list.',
      'maq.h': 'Travel through time',
      'maq.lead': 'Move the year and see how it was. These are real data for each year.',
      'maq.leadProy': 'Move the year and see how it was. After {a} you can see what would happen if the trend continued the same way (not a forecast).',
      'maq.anio': 'Year', 'maq.play': 'Play', 'maq.pausa': 'Pause',
      'maq.etqDato': 'Real data', 'maq.etqProy': 'If the trend continues (not a forecast)',
      'maq.avisoProy': 'This is not a forecast: it only extends the line of the last {n} years. The real climate can change, and this line does not explain why it changes.',
      'maq.sinProy.lluvia': 'We do not project rainfall: there is no clear trend and it changes a lot from one year to the next.',
      'maq.sinProy.agua': 'We do not project water: the data is regional, not for the La Paz aquifer.',
      'maq.sinProy': 'This indicator is not projected.',
      'maq.sinDato': 'There is no data for {a} (the year is incomplete or the reading is missing).',
      'maq.calor.dato': 'In {a}, the air in La Paz averaged {v}.',
      'maq.calor.proy': 'If the trend continues the same way, in {a} the air would average about {v}.',
      'maq.calor.mas': ' That is {d} hotter than in {b}.', 'maq.calor.menos': ' That is {d} cooler than in {b}.',
      'maq.vegetacion.dato': 'In {a}, the greenness index seen from satellite was {v} (0 is bare ground; 1 is very dense vegetation).',
      'maq.vegetacion.proy': 'If the trend continues the same way, in {a} the greenness index would be about {v}.',
      'maq.vegetacion.mas': ' There is {d} more greenness than in {b}.', 'maq.vegetacion.menos': ' There is {d} less greenness than in {b}.',
      'maq.lluvia.dato': 'In {a}, {v} of rain fell in total.',
      'maq.lluvia.mas': ' It was a wetter year than average ({m}).', 'maq.lluvia.menos': ' It was a drier year than average ({m}).',
      'maq.lluvia.igual': ' It was a year close to average ({m}).',
      'maq.agua.dato': 'In {a}, the water stored in the region was {v} compared with its reference average.',
      'maq.agua.mas': ' That is {d} more than in {b}.', 'maq.agua.menos': ' That is {d} less than in {b}.',
      'maq.grafTit': '{t} per year and trend line', 'maq.grafDesc': 'Chart of {t} from {a} to {b}. The dot marks {y}: {v}.'
    }
  };
  (function () {
    ['es', 'en'].forEach(function (l) {
      for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
    });
  })();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Matemática de la máquina del tiempo (pura, probada en web/tests/simulaciones.test.mjs) ---------- */
  function mediana(a) {
    var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length;
    if (!n) return null;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  function puntos(i) {
    return ((i && i.serie_anual) || []).filter(function (p) { return p && p.valor != null; });
  }
  /* Línea de tendencia: pendiente de Sen del indicador (tendencia_por_decada / 10) e intercepto = mediana de y − m·x,
     como en Theil-Sen. Se usa la pendiente publicada para que coincida con la cifra de la ficha. */
  function ajuste(i) {
    var pts = puntos(i);
    if (pts.length < 2 || i.tendencia_por_decada == null) return null;
    var m = i.tendencia_por_decada / 10;
    return { pend: m, interc: mediana(pts.map(function (p) { return p.valor - m * p.anio; })) };
  }
  /* Solo se proyecta con tendencia clara, y nunca el agua: es una anomalía regional, no del acuífero de La Paz. */
  function permiteProyeccion(i) {
    return !!(i && i.id !== 'agua' && i.significancia && i.significancia.significativo === true && ajuste(i));
  }
  function rango(i) {
    var pts = puntos(i);
    var z = pts[pts.length - 1].anio;
    return { desde: pts[0].anio, hasta: z, max: permiteProyeccion(i) ? HORIZONTE : z };
  }
  function valorEn(i, anio) {
    var pts = puntos(i), k;
    for (k = 0; k < pts.length; k++) if (pts[k].anio === anio) return { tipo: 'dato', valor: pts[k].valor };
    if (permiteProyeccion(i) && anio > pts[pts.length - 1].anio) {
      var f = ajuste(i);
      return { tipo: 'proyeccion', valor: f.interc + f.pend * anio };
    }
    return { tipo: 'sin-dato', valor: null };
  }
  function escala(i) {
    var r = rango(i), v = puntos(i).map(function (p) { return p.valor; }), a;
    for (a = r.hasta + 1; a <= r.max; a++) v.push(valorEn(i, a).valor);
    return { min: Math.min.apply(null, v), max: Math.max.apply(null, v) };
  }
  function media(i) {
    var v = puntos(i).map(function (p) { return p.valor; });
    return v.reduce(function (s, x) { return s + x; }, 0) / v.length;
  }
  function fmt(i, v) {
    if (v == null) return '—';
    if (i.id === 'lluvia') return RB.num(v, 0) + ' mm';
    if (i.id === 'agua') return RB.signo(Math.round(v * 10) / 10, 'cm');
    if (i.id === 'calor') return RB.num(v, 1) + ' °C';
    return RB.num(v, 3);
  }
  function frase(i, anio) {
    var p = valorEn(i, anio);
    if (p.tipo === 'sin-dato') return t('maq.sinDato', { a: anio });
    var id = i.id, base = puntos(i)[0], s = t('maq.' + id + (p.tipo === 'proyeccion' ? '.proy' : '.dato'), { a: anio, v: fmt(i, p.valor) });
    if (id === 'lluvia') {
      if (p.tipo !== 'dato') return s;
      var m = media(i), q = p.valor / m;
      return s + t('maq.lluvia.' + (q > 1.15 ? 'mas' : q < 0.85 ? 'menos' : 'igual'), { m: fmt(i, m) });
    }
    if (anio === base.anio) return s;
    var dif = p.valor - base.valor, d;
    if (id === 'vegetacion') {
      var pct = dif / base.valor * 100;
      if (Math.abs(pct) < 1) return s;
      d = RB.num(Math.abs(pct), 0) + ' %';
    } else {
      if (Math.abs(dif) < (id === 'calor' ? 0.05 : 0.05)) return s;
      d = id === 'calor' ? RB.num(Math.abs(dif), 1) + ' °C' : RB.num(Math.abs(dif), 1) + ' cm';
    }
    return s + t('maq.' + id + (dif > 0 ? '.mas' : '.menos'), { d: d, b: base.anio });
  }

  /* Gráfica con la serie real, la línea de tendencia (a trazos después del último dato) y un punto en el año elegido. */
  function grafica(i, anio) {
    var pts = puntos(i), f = ajuste(i), r = rango(i), proy = permiteProyeccion(i), E = escala(i);
    var W = 320, H = 190, L0 = 38, R = 10, T0 = 12, B = 30;
    var y0 = E.min, y1 = E.max;
    if (f) { y0 = Math.min(y0, f.interc + f.pend * r.desde); y1 = Math.max(y1, f.interc + f.pend * r.max); }
    if (y0 === y1) { y0 -= 1; y1 += 1; }
    var pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
    var X = function (v) { return L0 + (v - r.desde) / (r.max - r.desde) * (W - L0 - R); };
    var Y = function (v) { return T0 + (y1 - v) / (y1 - y0) * (H - T0 - B); };
    var dp = pts.map(function (p, k) { return (k ? 'L' : 'M') + X(p.anio).toFixed(1) + ' ' + Y(p.valor).toFixed(1); }).join(' ');
    var s = '<svg class="grafica sim-graf" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="sim-gt sim-gd">';
    var pv = valorEn(i, anio);
    s += '<title id="sim-gt">' + esc(t('maq.grafTit', { t: D(i, 'titulo') })) + '</title>';
    s += '<desc id="sim-gd">' + esc(t('maq.grafDesc', { t: D(i, 'titulo'), a: r.desde, b: r.max, y: anio, v: fmt(i, pv.valor) })) + '</desc>';
    if (proy) {
      s += '<rect class="sim-zona" x="' + X(r.hasta).toFixed(1) + '" y="' + T0 + '" width="' + (X(r.max) - X(r.hasta)).toFixed(1) + '" height="' + (H - T0 - B) + '"/>';
    }
    s += '<line x1="' + L0 + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '" stroke="currentColor" opacity=".4"/>';
    s += '<line x1="' + L0 + '" y1="' + T0 + '" x2="' + L0 + '" y2="' + (H - B) + '" stroke="currentColor" opacity=".4"/>';
    if (f) {
      s += '<path class="sim-tend" d="M' + X(r.desde).toFixed(1) + ' ' + Y(f.interc + f.pend * r.desde).toFixed(1) + ' L' + X(r.hasta).toFixed(1) + ' ' + Y(f.interc + f.pend * r.hasta).toFixed(1) + '" fill="none"/>';
      if (proy) s += '<path class="sim-tend sim-tend-proy" d="M' + X(r.hasta).toFixed(1) + ' ' + Y(f.interc + f.pend * r.hasta).toFixed(1) + ' L' + X(r.max).toFixed(1) + ' ' + Y(f.interc + f.pend * r.max).toFixed(1) + '" fill="none"/>';
    }
    s += '<path d="' + dp + '" fill="none" stroke="var(--acento)" stroke-width="2.5" stroke-linejoin="round"/>';
    s += '<line class="sim-guia" x1="' + X(anio).toFixed(1) + '" y1="' + T0 + '" x2="' + X(anio).toFixed(1) + '" y2="' + (H - B) + '"/>';
    if (pv.valor != null) s += '<circle class="sim-punto' + (pv.tipo === 'proyeccion' ? ' sim-punto-proy' : '') + '" cx="' + X(anio).toFixed(1) + '" cy="' + Y(pv.valor).toFixed(1) + '" r="6"/>';
    s += '<text x="' + (L0 - 4) + '" y="' + (T0 + 8) + '" text-anchor="end">' + esc(fmtEje(i, y1 - pad)) + '</text>';
    s += '<text x="' + (L0 - 4) + '" y="' + (H - B) + '" text-anchor="end">' + esc(fmtEje(i, y0 + pad)) + '</text>';
    s += '<text x="' + L0 + '" y="' + (H - 10) + '">' + r.desde + '</text>';
    s += '<text x="' + (W - R) + '" y="' + (H - 10) + '" text-anchor="end">' + r.max + '</text>';
    return s + '</svg>';
  }
  function fmtEje(i, v) {
    if (i.id === 'lluvia') return RB.num(v, 0);
    if (i.id === 'calor') return RB.num(v, 1);
    return RB.num(v, i.id === 'agua' ? 1 : 2);
  }
  function D(o, c) { return T.d(o, c); }

  /* ---------- Máquina del tiempo (Ficha) ---------- */
  var maq = { timer: null };
  function maquinaHtml(i) {
    if (puntos(i).length < 2) return '';
    var r = rango(i), proy = permiteProyeccion(i), nota;
    if (proy) nota = '<p class="aviso" id="sim-aviso" hidden>' + esc(t('maq.avisoProy', { n: r.hasta - r.desde })) + '</p>';
    else nota = '<p class="fuente">' + esc(T.DIC.es['maq.sinProy.' + i.id] ? t('maq.sinProy.' + i.id) : t('maq.sinProy')) + '</p>';
    return '<div class="bloque sim-maq" id="sim-maq" data-ind="' + esc(i.id) + '">' +
      '<h2>' + esc(t('maq.h')) + '</h2>' +
      '<p>' + esc(proy ? t('maq.leadProy', { a: r.hasta }) : t('maq.lead')) + '</p>' +
      '<div class="sim-tarjeta" id="sim-tarjeta">' +
        '<div class="sim-etq" id="sim-etq"></div>' +
        '<div class="sim-fila"><span class="sim-anio-g" id="sim-anio-g"></span><span class="sim-valor" id="sim-valor"></span></div>' +
        '<div class="sim-med" aria-hidden="true"><span class="sim-med-r" id="sim-med-r"></span></div>' +
        '<div class="sim-med-et" aria-hidden="true"><span id="sim-med-min"></span><span id="sim-med-max"></span></div>' +
        '<p class="sim-frase" id="sim-frase"></p>' +
      '</div>' +
      '<div class="sim-ctrl"><button type="button" class="sim-chip sim-play" id="sim-play"></button>' +
        '<label class="sr" for="sim-anio">' + esc(t('maq.anio')) + '</label>' +
        '<input type="range" id="sim-anio" min="' + r.desde + '" max="' + r.max + '" step="1" value="' + r.hasta + '">' +
      '</div>' +
      '<div id="sim-graf"></div>' + nota + '</div>';
  }
  function detener() {
    if (maq.timer) { clearInterval(maq.timer); maq.timer = null; }
  }
  function maquinaActivar(raiz, i) {
    var cont = raiz.querySelector('#sim-maq');
    if (!cont) return;
    var r = rango(i), E = escala(i), proy = permiteProyeccion(i);
    function q(id) { return cont.querySelector('#' + id); }
    var rng = q('sim-anio'), play = q('sim-play');
    q('sim-med-min').textContent = fmt(i, E.min);
    q('sim-med-max').textContent = fmt(i, E.max);
    function pintarAnio(a) {
      var p = valorEn(i, a), esProy = p.tipo === 'proyeccion';
      q('sim-etq').textContent = esProy ? t('maq.etqProy') : t('maq.etqDato');
      q('sim-tarjeta').className = 'sim-tarjeta' + (esProy ? ' sim-proy' : '');
      q('sim-anio-g').textContent = a;
      q('sim-valor').textContent = fmt(i, p.valor);
      var pct = p.valor == null ? 0 : (E.max === E.min ? 50 : (p.valor - E.min) / (E.max - E.min) * 100);
      q('sim-med-r').style.width = Math.max(pct, 4).toFixed(0) + '%';
      q('sim-frase').textContent = frase(i, a);
      q('sim-graf').innerHTML = grafica(i, a);
      var av = q('sim-aviso'); if (av) av.hidden = !esProy;
      rng.setAttribute('aria-valuetext', a + ': ' + fmt(i, p.valor));
    }
    function rotuloPlay(on) { play.textContent = (on ? '⏸ ' + t('maq.pausa') : '▶ ' + t('maq.play')); }
    rotuloPlay(false);
    rng.addEventListener('input', function () { detener(); rotuloPlay(false); pintarAnio(+rng.value); });
    play.addEventListener('click', function () {
      if (maq.timer) { detener(); rotuloPlay(false); return; }
      var a = +rng.value;
      if (a >= r.max) a = r.desde - 1;
      rotuloPlay(true);
      maq.timer = setInterval(function () {
        a += 1; rng.value = a; pintarAnio(a);
        if (a >= r.max) { detener(); rotuloPlay(false); }
      }, DIA_MAQ);
    });
    pintarAnio(+rng.value);
  }

  /* ---------- Satélite NASA (Mapa) ---------- */
  var GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/';
  // Día de abril de cada año con la foto más limpia (sin huecos negros ni nubes sobre La Paz); el resto, el 20.
  // Medido el 2026-11-15 sobre la tesela 9/ de La Paz; si falta un año se usa el 20.
  var DIA_COLOR = { 2002: 21, 2005: 21, 2007: 21, 2013: 19, 2015: 21, 2022: 21, 2024: 19 };
  function fechaColor(a) { return a + '-04-' + (DIA_COLOR[a] || 20); }
  // Compuesto de 8 días de GIBS: el que empieza el día 104 del año (14 o 15 de abril).
  function fechaCalor(a) { return new Date(Date.UTC(a, 0, 1 + 8 * 13)).toISOString().slice(0, 10); }
  var CAPAS = {
    color: { id: 'MODIS_Terra_CorrectedReflectance_TrueColor', ext: 'jpeg', matriz: 'GoogleMapsCompatible_Level9', nativo: 9, fecha: fechaColor, txt: 'sat.txtColor' },
    calor: { id: 'MODIS_Terra_L3_Land_Surface_Temp_8Day_Day', ext: 'png', matriz: 'GoogleMapsCompatible_Level7', nativo: 7, fecha: fechaCalor, txt: 'sat.txtCalor', pixel: true }
  };
  function urlCapa(c, fecha) { return GIBS + c.id + '/default/' + fecha + '/' + c.matriz + '/{z}/{y}/{x}.' + c.ext; }
  // Colores de la leyenda: entradas de https://gibs.earthdata.nasa.gov/colormaps/v1.3/MODIS_Land_Surface_Temp.xml (10 a 65 °C, de 5 en 5).
  var LEY_CALOR = ['149,255,0', '179,255,0', '215,255,0', '244,255,0', '255,241,0', '255,214,0', '255,190,0', '255,166,0', '255,136,0', '255,112,0', '255,88,0', '255,61,0'];
  function degradado() { return 'linear-gradient(90deg,' + LEY_CALOR.map(function (c) { return 'rgb(' + c + ')'; }).join(',') + ')'; }
  function fechaLarga(iso) {
    var d = new Date(iso + 'T00:00:00Z');
    try { return d.toLocaleDateString(T.locale(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return iso; }
  }

  var sat = { mapa: null, timer: null, capa: 'color', anio: 2025, activa: null, fallos: 0, cargas: 0 };
  function limpiar() {
    detener();
    if (sat.timer) { clearTimeout(sat.timer); sat.timer = null; }
    if (sat.mapa) { try { sat.mapa.remove(); } catch (e) {} }
    sat.mapa = null; sat.activa = null; sat.capas = []; sat.fallos = 0; sat.cargas = 0;
  }
  function sateliteHtml() {
    return '<section class="bloque sim-sat" id="sim-sat" aria-labelledby="sim-sat-h">' +
      '<h2 id="sim-sat-h">' + esc(t('sat.h')) + '</h2><p>' + esc(t('sat.lead')) + '</p>' +
      '<div class="chips" role="group" aria-label="' + esc(t('sat.capa')) + '">' +
        '<button type="button" class="sim-chip" data-capa="color" aria-pressed="true">' + esc(t('sat.color')) + '</button>' +
        '<button type="button" class="sim-chip" data-capa="calor" aria-pressed="false">' + esc(t('sat.calor')) + '</button></div>' +
      '<div id="sim-sat-aviso"></div>' +
      '<div id="sim-sat-mapa" class="sim-mapa" role="region" aria-label="' + esc(t('sat.region')) + '"></div>' +
      '<div class="sim-ctrl"><button type="button" class="sim-chip sim-play" id="sim-sat-play"></button>' +
        '<label class="sr" for="sim-sat-anio">' + esc(t('sat.anio')) + '</label>' +
        '<input type="range" id="sim-sat-anio" min="2001" max="2026" step="1" value="2025">' +
        '<output class="sim-anio-g sim-anio-ch" id="sim-sat-sal" for="sim-sat-anio">2025</output></div>' +
      '<div id="sim-sat-ley" class="sim-ley"></div>' +
      '<p class="sim-frase" id="sim-sat-txt" aria-live="polite"></p>' +
      '<p class="aviso">' + esc(t('sat.aviso')) + '</p>' +
      '<p class="fuente">' + esc(t('sat.cred')) + '</p></section>';
  }
  function sateliteActivar(raiz) {
    var cont = raiz.querySelector('#sim-sat');
    if (!cont) return;
    limpiar();
    sat.capa = 'color'; sat.anio = 2025;
    function q(id) { return cont.querySelector('#' + id); }
    var rng = q('sim-sat-anio'), play = q('sim-sat-play'), caja = q('sim-sat-mapa');
    function rotuloPlay(on) { play.textContent = (on ? '⏸ ' + t('sat.pausa') : '▶ ' + t('sat.play')); }
    rotuloPlay(false);
    if (typeof L === 'undefined') {
      q('sim-sat-aviso').innerHTML = '<p class="aviso">' + esc(t('sat.error')) + '</p>';
      caja.hidden = true; play.disabled = true; rng.disabled = true;
      return;
    }
    function leyenda() {
      var el = q('sim-sat-ley');
      if (sat.capa === 'calor') {
        var marcas = [10, 20, 30, 40, 50, 60].map(function (g) { return '<span>' + g + '</span>'; }).join('');
        el.innerHTML = '<p class="sim-ley-tit">' + esc(t('sat.leyTit')) + '</p><div class="sim-ley-barra" style="background:' + degradado() + '"></div>' +
          '<div class="sim-ley-marcas" aria-hidden="true">' + marcas + '</div>' +
          '<div class="sim-ley-ext"><span>' + esc(t('sat.leyMin')) + '</span><span>' + esc(t('sat.leyMax')) + '</span></div>';
      } else {
        el.innerHTML = '';
      }
    }
    function texto() {
      var c = CAPAS[sat.capa];
      q('sim-sat-txt').textContent = t(c.txt, { f: fechaLarga(c.fecha(sat.anio)) });
      q('sim-sat-sal').textContent = sat.anio;
      rng.value = sat.anio;
      rng.setAttribute('aria-valuetext', String(sat.anio));
    }
    try {
      sat.mapa = L.map(caja, { scrollWheelZoom: false, minZoom: 8, maxZoom: 12 }).setView([24.14, -110.31], 10);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, zIndex: 1, attribution: '© OpenStreetMap contributors' }).addTo(sat.mapa);
      L.circleMarker([24.1426, -110.3128], { radius: 6, color: '#fff', weight: 2, fillColor: '#0c2340', fillOpacity: 1 })
        .bindTooltip(t('sat.ciudad'), { permanent: true, direction: 'right', offset: [8, 0], className: 'sim-ciudad' }).addTo(sat.mapa);
    } catch (e) {
      q('sim-sat-aviso').innerHTML = '<p class="aviso">' + esc(t('sat.error')) + '</p>';
      caja.hidden = true; return;
    }
    var z = 2;
    function mostrar(despues) {
      var c = CAPAS[sat.capa], fecha = c.fecha(sat.anio);
      var capa = L.tileLayer(urlCapa(c, fecha), {
        maxNativeZoom: c.nativo, maxZoom: 12, zIndex: ++z, opacity: 0, className: c.pixel ? 'sim-pix' : '',
        attribution: 'NASA EOSDIS GIBS / MODIS Terra'
      });
      var listo = false;
      sat.capas = (sat.capas || []).concat(capa);
      function entrar() {
        if (listo) return; listo = true;
        // Si ya se pidió otra foto después de ésta, esta ya no se muestra.
        if (sat.activa !== capa) { try { sat.mapa && sat.mapa.removeLayer(capa); } catch (e) {} return; }
        capa.setOpacity(1);
        var viejas = sat.capas.filter(function (l) { return l !== capa; });
        sat.capas = [capa];
        setTimeout(function () { viejas.forEach(function (l) { try { sat.mapa && sat.mapa.removeLayer(l); } catch (e) {} }); }, 450);
        if (despues) despues();
      }
      capa.on('load', function () { sat.cargas++; entrar(); });
      capa.on('tileerror', function () {
        sat.fallos++;
        if (sat.fallos >= 4 && !sat.cargas) q('sim-sat-aviso').innerHTML = '<p class="aviso">' + esc(t('sat.error')) + '</p>';
      });
      capa.addTo(sat.mapa);
      sat.activa = capa;
      setTimeout(entrar, 4500);   // si la red es lenta, no se queda esperando para seguir
      texto();
    }
    function parar() { if (sat.timer) { clearTimeout(sat.timer); sat.timer = null; } rotuloPlay(false); }
    cont.querySelectorAll('[data-capa]').forEach(function (b) {
      b.addEventListener('click', function () {
        sat.capa = b.getAttribute('data-capa');
        cont.querySelectorAll('[data-capa]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        leyenda(); mostrar();
      });
    });
    rng.addEventListener('input', function () { parar(); sat.anio = +rng.value; mostrar(); });
    play.addEventListener('click', function () {
      if (sat.timer) { parar(); return; }
      rotuloPlay(true);
      if (sat.anio >= 2026) { sat.anio = 2000; }
      (function paso() {
        sat.anio += 1;
        mostrar(function () {
          if (sat.anio >= 2026) { parar(); return; }
          sat.timer = setTimeout(paso, DIA_SAT);
        });
      })();
    });
    leyenda(); mostrar();
  }

  var RBSim = {
    maquinaHtml: maquinaHtml, maquinaActivar: maquinaActivar, sateliteHtml: sateliteHtml, sateliteActivar: sateliteActivar, limpiar: limpiar,
    ajuste: ajuste, permiteProyeccion: permiteProyeccion, rango: rango, valorEn: valorEn, frase: frase, grafica: grafica,
    fechaColor: fechaColor, fechaCalor: fechaCalor, urlCapa: urlCapa, CAPAS: CAPAS, HORIZONTE: HORIZONTE, TX: TX
  };
  if (typeof window !== 'undefined') window.RBSim = RBSim;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBSim;
})();
