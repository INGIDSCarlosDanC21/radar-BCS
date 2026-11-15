/* Pestaña Pesca (docs/PLAN-PESCA-AVISOS.md). ES5, sin build.
   Mapa de iconos de 8 puertos con oleaje, viento y temperatura del mar de un MODELO (Open-Meteo Marine, ~9 km; no son boyas),
   control de hora con "Iniciar simulación" y 4 mosaicos cortos. Sin gráficas, sin tablas, sin textos largos.
   El "semáforo" del Figma pasa a "Estado del mar (modelo)": verde, amarillo o rojo con la escala de Douglas y de Beaufort
   (web/js/reglas-mar.js). No es una bandera oficial y así se rotula. La capa de clorofila es de NASA GIBS (VIIRS NOAA-20). */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var RB = (typeof window !== 'undefined' && window.RB) || (typeof require !== 'undefined' ? require('./reglas.js') : null);
  var V = (typeof window !== 'undefined' && window.RBVivo) || (typeof require !== 'undefined' ? require('./datos-vivos.js') : null);
  var M = (typeof window !== 'undefined' && window.RBMar) || (typeof require !== 'undefined' ? require('./reglas-mar.js') : null);
  var MI = (typeof window !== 'undefined' && window.RBMapaIconos) || (typeof require !== 'undefined' ? require('./mapa-iconos.js') : null);
  var t = T.t;
  var PASO_MS = 900;
  var URL_CLO = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_Chlorophyll_a/default/';
  var URL_VEDAS = 'https://www.gob.mx/conapesca';
  var URL_CAPITANIA = 'https://www.gob.mx/semar';
  // Escala de la capa de clorofila (https://gibs.earthdata.nasa.gov/colormaps/v1.3/VIIRS_Chlorophyll.xml, 0.01 a 20 mg/m³, logarítmica).
  var LEY_CLO = ['147,0,108', '66,0,189', '0,32,255', '0,186,255', '0,255,135', '96,255,0', '255,219,0', '255,107,0', '250,0,0'];

  var TX = {
    es: {
      'pes.kicker': 'Ahora · modelo marino Open-Meteo (no son boyas)', 'pes.act': 'Modelo de ~9 km · hora de La Paz',
      'pes.sub': 'Oleaje, viento y temperatura del mar en los puertos de BCS.',
      'pes.puerto': 'Puerto', 'pes.var': 'Dato en el mapa', 'pes.v.ola': 'Oleaje', 'pes.v.viento': 'Viento', 'pes.v.sst': 'Temp. del mar',
      'pes.mapaReg': 'Mapa de puertos de Baja California Sur con iconos de oleaje, viento o temperatura del mar',
      'pes.diaAnt': 'Día anterior', 'pes.diaSig': 'Día siguiente', 'pes.ayer': 'Ayer', 'pes.hoy': 'Hoy', 'pes.manana': 'Mañana', 'pes.hora': 'Hora del día',
      'pes.sim': 'Iniciar simulación', 'pes.simPausa': 'Pausar simulación',
      'pes.diag': 'Diagnóstico del mar', 'pes.zona': 'Zona: {z}',
      'pes.m.seg': 'Estado del mar', 'pes.m.oc': 'Condiciones del mar', 'pes.m.cl': 'Viento costero', 'pes.m.clo': 'Clorofila',
      'pes.segNota': 'Estimación del modelo, no es aviso oficial',
      'pes.dOla': 'Oleaje {h} m · viento {v} kt', 'pes.dMar': 'Del {d} · mar {s} °C · corriente {c} km/h',
      'pes.vViento': '{v} kt del {d}', 'pes.dViento': 'Rachas {r} kt · Beaufort {b}', 'pes.vOla': '{h} m · {p} s',
      'pes.cloVer': 'Ver en el mapa', 'pes.cloQuitar': 'Quitar del mapa', 'pes.cloFecha': 'Satélite NASA VIIRS NOAA-20 · {f}',
      'pes.cloTit': 'Clorofila (mg/m³, escala logarítmica)', 'pes.cloError': 'No se pudo cargar la capa de clorofila.',
      'pes.vedas': 'Vedas (CONAPESCA)',
      'pes.ley.verde': 'Verde', 'pes.ley.amarillo': 'Amarillo', 'pes.ley.rojo': 'Rojo',
      'pes.ley.ola.verde': 'menos de 1.25 m', 'pes.ley.ola.amarillo': '1.25 a 2.5 m', 'pes.ley.ola.rojo': '2.5 m o más',
      'pes.ley.viento.verde': 'menos de 22 kt', 'pes.ley.viento.amarillo': '22 a 33 kt', 'pes.ley.viento.rojo': '34 kt o más',
      'pes.nota': 'Estimación de un modelo de ~9 km, no es un aviso oficial. Consulta a la Capitanía de Puerto (SEMAR). Datos del mar: Open-Meteo.com (CC BY 4.0).',
      'pes.cargando': 'Cargando el modelo marino…',
      'pes.error': 'No se pudo cargar el modelo marino (¿sin conexión?). El resto de la web no cambia.',
      'pes.sinDato': 'sin dato', 'pes.sinDatoPuerto': 'Sin dato para esta hora',
      'pes.r0': 'norte', 'pes.r1': 'noreste', 'pes.r2': 'este', 'pes.r3': 'sureste', 'pes.r4': 'sur', 'pes.r5': 'suroeste', 'pes.r6': 'oeste', 'pes.r7': 'noroeste',
      'pes.pinOla': '{n}: oleaje {v}, {e}', 'pes.pinViento': '{n}: viento {v}, {e}', 'pes.pinSst': '{n}: temperatura del mar {v}'
    },
    en: {
      'pes.kicker': 'Now · Open-Meteo marine model (not buoys)', 'pes.act': '~9 km model · La Paz time',
      'pes.sub': 'Waves, wind and sea temperature at the ports of BCS.',
      'pes.puerto': 'Port', 'pes.var': 'Data on the map', 'pes.v.ola': 'Waves', 'pes.v.viento': 'Wind', 'pes.v.sst': 'Sea temp.',
      'pes.mapaReg': 'Map of ports of Baja California Sur with icons for waves, wind or sea temperature',
      'pes.diaAnt': 'Previous day', 'pes.diaSig': 'Next day', 'pes.ayer': 'Yesterday', 'pes.hoy': 'Today', 'pes.manana': 'Tomorrow', 'pes.hora': 'Hour of the day',
      'pes.sim': 'Start simulation', 'pes.simPausa': 'Pause simulation',
      'pes.diag': 'Sea diagnosis', 'pes.zona': 'Area: {z}',
      'pes.m.seg': 'Sea state', 'pes.m.oc': 'Sea conditions', 'pes.m.cl': 'Coastal wind', 'pes.m.clo': 'Chlorophyll',
      'pes.segNota': 'Model estimate, not an official warning',
      'pes.dOla': 'Waves {h} m · wind {v} kt', 'pes.dMar': 'From the {d} · sea {s} °C · current {c} km/h',
      'pes.vViento': '{v} kt from the {d}', 'pes.dViento': 'Gusts {r} kt · Beaufort {b}', 'pes.vOla': '{h} m · {p} s',
      'pes.cloVer': 'Show on the map', 'pes.cloQuitar': 'Remove from the map', 'pes.cloFecha': 'NASA VIIRS NOAA-20 satellite · {f}',
      'pes.cloTit': 'Chlorophyll (mg/m³, logarithmic scale)', 'pes.cloError': 'The chlorophyll layer could not be loaded.',
      'pes.vedas': 'Fishing closures (CONAPESCA)',
      'pes.ley.verde': 'Green', 'pes.ley.amarillo': 'Yellow', 'pes.ley.rojo': 'Red',
      'pes.ley.ola.verde': 'under 1.25 m', 'pes.ley.ola.amarillo': '1.25 to 2.5 m', 'pes.ley.ola.rojo': '2.5 m or more',
      'pes.ley.viento.verde': 'under 22 kt', 'pes.ley.viento.amarillo': '22 to 33 kt', 'pes.ley.viento.rojo': '34 kt or more',
      'pes.nota': 'Estimate from a ~9 km model, not an official warning. Check with the Port Captaincy (SEMAR). Sea data: Open-Meteo.com (CC BY 4.0).',
      'pes.cargando': 'Loading the marine model…',
      'pes.error': 'The marine model could not be loaded (offline?). The rest of the site does not change.',
      'pes.sinDato': 'no data', 'pes.sinDatoPuerto': 'No data for this hour',
      'pes.r0': 'north', 'pes.r1': 'northeast', 'pes.r2': 'east', 'pes.r3': 'southeast', 'pes.r4': 'south', 'pes.r5': 'southwest', 'pes.r6': 'west', 'pes.r7': 'northwest',
      'pes.pinOla': '{n}: waves {v}, {e}', 'pes.pinViento': '{n}: wind {v}, {e}', 'pes.pinSst': '{n}: sea temperature {v}'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function en(serie, i) { return serie && serie[i] != null ? serie[i] : null; }
  function n1(v) { return v == null ? t('pes.sinDato') : RB.num(v, 1); }
  function n0(v) { return v == null ? t('pes.sinDato') : RB.num(v, 0); }
  function rumbo(g) { return g == null ? '' : t('pes.r' + (Math.round(((g % 360) + 360) % 360 / 45) % 8)); }
  function tono(nivel) { return nivel == null ? 'neutro' : nivel >= 2 ? 'rojo' : nivel === 1 ? 'amarillo' : 'verde'; }

  /* Estado de un puerto en la hora idx (todo sale del modelo; lo que falta queda en null). */
  function estadoPuerto(p, idx) {
    var ola = en(p.s.ola, idx), vi = en(p.s.viento, idx);
    return { ola: ola, per: en(p.s.per, idx), dir: en(p.s.dir, idx), sst: en(p.s.sst, idx), corr: en(p.s.corr, idx),
      viento: vi, rachas: en(p.s.rachas, idx), vdir: en(p.s.vdir, idx), estado: M.estadoMar(ola, vi) };
  }
  /* Pines del mapa para la variable v y la hora idx. */
  function pines(datos, idx, v, activo) {
    return datos.puertos.map(function (p) {
      var e = estadoPuerto(p, idx), valor, icono, nivel, etq;
      if (v === 'viento') {
        valor = e.viento == null ? '—' : n0(e.viento) + ' kt'; icono = 'air'; nivel = M.nivelViento(e.viento);
        etq = t('pes.pinViento', { n: p.nombre, v: valor, e: M.textoViento(e.viento) });
      } else if (v === 'sst') {
        valor = e.sst == null ? '—' : n1(e.sst) + ' °C'; icono = 'thermostat'; nivel = null;
        etq = t('pes.pinSst', { n: p.nombre, v: valor });
      } else {
        valor = e.ola == null ? '—' : n1(e.ola) + ' m'; icono = 'waves'; nivel = M.nivelOla(e.ola);
        etq = t('pes.pinOla', { n: p.nombre, v: valor, e: M.textoOla(e.ola) });
      }
      return { id: p.id, lat: p.mar[0], lon: p.mar[1], icono: icono, valor: valor, tono: tono(nivel), etiqueta: etq, activo: p.id === activo };
    });
  }
  /* Caja que contiene todos los puertos: [[lat mín, lon mín], [lat máx, lon máx]]. */
  function limitesPuertos(datos) {
    var la = datos.puertos.map(function (p) { return p.mar[0]; }), lo = datos.puertos.map(function (p) { return p.mar[1]; });
    return [[Math.min.apply(null, la), Math.min.apply(null, lo)], [Math.max.apply(null, la), Math.max.apply(null, lo)]];
  }
  function mosaico(clase, icono, titulo, cuerpo) {
    return '<article class="pe-m pe-m-' + clase + '"><div class="pe-m-cab"><img src="assets/iconos/' + icono + '.svg" alt="" aria-hidden="true" width="24" height="24"><h3>' + esc(titulo) + '</h3></div>' + cuerpo + '</article>';
  }
  function mosaicos(p, idx, cloActiva, cloFecha) {
    var e = estadoPuerto(p, idx), sem = e.estado || 'sin';
    var seg = '<p class="pe-estado"><span class="pe-sem pe-sem-' + sem + '"><i aria-hidden="true"></i>' + esc(t('mar.e.' + sem)) + '</span> ' + esc(e.estado ? t('mar.e.' + sem + 'T') : '') + '</p>' +
      '<p class="pe-dato">' + esc(t('pes.dOla', { h: n1(e.ola), v: n0(e.viento) })) + '</p><p class="pe-peq">' + esc(t('pes.segNota')) + '</p>';
    var oc = '<p class="pe-grande">' + esc(t('pes.vOla', { h: n1(e.ola), p: n0(e.per) })) + '</p>' +
      '<p class="pe-dato">' + esc(t('pes.dMar', { d: rumbo(e.dir) || '—', s: n1(e.sst), c: n1(e.corr) })) + '</p>';
    var cl = '<p class="pe-grande">' + esc(t('pes.vViento', { v: n0(e.viento), d: rumbo(e.vdir) })) + '</p>' +
      '<p class="pe-dato">' + esc(t('pes.dViento', { r: n0(e.rachas), b: M.beaufort(e.viento) == null ? '—' : M.beaufort(e.viento) })) + ' · ' + esc(M.textoViento(e.viento)) + '</p>';
    var clo = '<button type="button" class="pe-btn" id="pe-clo" aria-pressed="' + (cloActiva ? 'true' : 'false') + '">' + esc(t(cloActiva ? 'pes.cloQuitar' : 'pes.cloVer')) + '</button>' +
      '<p class="pe-dato">' + esc(t('pes.cloFecha', { f: cloFecha })) + '</p>' +
      '<p class="pe-peq"><a href="' + URL_VEDAS + '" target="_blank" rel="noopener">' + esc(t('pes.vedas')) + '</a></p>';
    return mosaico('seg', 'pesca-semaforo-de-seguridad', t('pes.m.seg'), seg) + mosaico('oc', 'pesca-condiciones-oceanograficas', t('pes.m.oc'), oc) +
      mosaico('cl', 'pesca-clima-y-atmosfera-costera', t('pes.m.cl'), cl) + mosaico('clo', 'pesca-potencial-y-actividad-pesquera', t('pes.m.clo'), clo);
  }
  function leyenda(v, clo) {
    if (clo) {
      var g = 'linear-gradient(90deg,' + LEY_CLO.map(function (c) { return 'rgb(' + c + ')'; }).join(',') + ')';
      return '<p class="pe-ley-t">' + esc(t('pes.cloTit')) + '</p><div class="pe-ley-barra" style="background:' + g + '"></div>' +
        '<div class="pe-ley-marcas" aria-hidden="true"><span style="left:0">0.01</span><span style="left:30%">0.1</span><span style="left:60%">1</span><span style="left:90%">10</span></div>';
    }
    if (v === 'sst') return '';
    return ['verde', 'amarillo', 'rojo'].map(function (c) {
      return '<span class="pe-ley-i"><i class="pe-pt pe-pt-' + c + '" aria-hidden="true"></i><b>' + esc(t('pes.ley.' + c)) + '</b> ' + esc(t('pes.ley.' + v + '.' + c)) + '</span>';
    }).join('');
  }
  function nombreDia(datos, d) {
    if (d === 0) return t('pes.ayer');
    if (d === 1) return t('pes.hoy');
    if (d === 2) return t('pes.manana');
    try { return new Date(V.fechaDe(datos.horas[d * 24]) + 'T12:00:00Z').toLocaleDateString(T.locale(), { weekday: 'long', timeZone: 'UTC' }); } catch (e) { return V.fechaDe(datos.horas[d * 24]); }
  }

  var est = { mapa: null, ficha: 0, timer: null };
  function parar() { if (est.timer) { clearInterval(est.timer); est.timer = null; } }
  function limpiar() {
    est.ficha++; parar();
    if (est.mapa) { est.mapa.destruir(); est.mapa = null; }
  }

  function montar(main, datos) {
    var cuerpo = main.querySelector('#pe-cuerpo');
    var ahora = V.indiceAhora(datos.horas);
    var S = { dia: Math.min(3, Math.floor(ahora / 24)), h: ahora % 24, puerto: 'lapaz', v: 'ola', clo: false };
    var porId = {}; datos.puertos.forEach(function (p) { porId[p.id] = p; });
    var cloFecha = V.sumaDias(V.fechaDe(datos.horas[ahora]), -1);

    cuerpo.innerHTML =
      '<div class="chips pe-puertos" role="group" aria-label="' + esc(t('pes.puerto')) + '">' + datos.puertos.map(function (p) {
        return '<button type="button" class="pe-chip" data-puerto="' + esc(p.id) + '" aria-pressed="false">' + esc(p.nombre) + '</button>';
      }).join('') + '</div>' +
      '<div class="chips pe-vars" role="group" aria-label="' + esc(t('pes.var')) + '">' + ['ola', 'viento', 'sst'].map(function (v) {
        return '<button type="button" class="pe-chip" data-var="' + v + '" aria-pressed="false">' + esc(t('pes.v.' + v)) + '</button>';
      }).join('') + '</div>' +
      '<div class="pe-mapa-caja"><div id="pe-mapa" class="pe-mapa" role="region" aria-label="' + esc(t('pes.mapaReg')) + '"></div>' +
      '<p class="pe-aviso" id="pe-aviso" hidden></p></div>' +
      '<div class="pe-ley" id="pe-ley"></div>' +
      '<div class="pe-reloj"><button type="button" class="pe-flecha" id="pe-ant"><span class="mi-ic" style="-webkit-mask-image:url(assets/iconos/mapa/skip_previous.svg);mask-image:url(assets/iconos/mapa/skip_previous.svg)" aria-hidden="true"></span><span class="sr">' + esc(t('pes.diaAnt')) + '</span></button>' +
        '<div class="pe-reloj-c"><output class="pe-hora" id="pe-sal" for="pe-rng"></output>' +
        '<label class="sr" for="pe-rng">' + esc(t('pes.hora')) + '</label><input type="range" id="pe-rng" min="0" max="23" step="1" value="' + S.h + '"></div>' +
        '<button type="button" class="pe-flecha" id="pe-sig"><span class="mi-ic" style="-webkit-mask-image:url(assets/iconos/mapa/skip_next.svg);mask-image:url(assets/iconos/mapa/skip_next.svg)" aria-hidden="true"></span><span class="sr">' + esc(t('pes.diaSig')) + '</span></button></div>' +
      '<button type="button" class="pe-sim" id="pe-sim"></button>' +
      '<div class="pe-diag"><h2>' + esc(t('pes.diag')) + '</h2><p class="pe-zona" id="pe-zona"></p></div>' +
      '<div class="pe-mosaicos" id="pe-mos"></div>' +
      '<p class="fuente pe-nota">' + esc(t('pes.nota')) + ' <a href="' + URL_CAPITANIA + '" target="_blank" rel="noopener">SEMAR</a></p>';

    var pill = main.querySelector('#pe-act'); if (pill) { pill.textContent = t('pes.act'); pill.hidden = false; }
    var ancho = cuerpo.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
    est.mapa = MI.crear(cuerpo.querySelector('#pe-mapa'), {
      centro: ancho >= 640 ? [25.4, -111.9] : [25.3, -112.1], zoom: ancho >= 640 ? 7 : 6.5, minZoom: 6, maxZoom: 9, limites: [[21.5, -116.5], [29.5, -107.5]], ajustar: limitesPuertos(datos), margen: ancho >= 640 ? [70, 70] : [60, 56],
      alElegir: function (id) { S.puerto = id; pintar(); },
      alError: function () { var a = cuerpo.querySelector('#pe-aviso'); a.textContent = t('pes.cloError'); a.hidden = false; }
    });
    var rng = cuerpo.querySelector('#pe-rng'), sim = cuerpo.querySelector('#pe-sim');

    function idx() { return S.dia * 24 + S.h; }
    function rotuloSim() { sim.innerHTML = '<span class="mi-ic" style="-webkit-mask-image:url(assets/iconos/mapa/' + (est.timer ? 'pause' : 'play_arrow') + '.svg);mask-image:url(assets/iconos/mapa/' + (est.timer ? 'pause' : 'play_arrow') + '.svg)" aria-hidden="true"></span>' + esc(t(est.timer ? 'pes.simPausa' : 'pes.sim')); }
    function pintar() {
      var i = idx(), p = porId[S.puerto];
      cuerpo.querySelectorAll('[data-puerto]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-puerto') === S.puerto)); });
      cuerpo.querySelectorAll('[data-var]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-var') === S.v)); });
      rng.value = S.h;
      cuerpo.querySelector('#pe-sal').textContent = nombreDia(datos, S.dia) + ' · ' + (S.h < 10 ? '0' : '') + S.h + ':00';
      rng.setAttribute('aria-valuetext', nombreDia(datos, S.dia) + ' ' + S.h + ':00');
      cuerpo.querySelector('#pe-ant').disabled = S.dia <= 0; cuerpo.querySelector('#pe-sig').disabled = S.dia >= 3;
      if (est.mapa) est.mapa.pines(pines(datos, i, S.v, S.puerto));
      cuerpo.querySelector('#pe-ley').innerHTML = leyenda(S.v, S.clo);
      cuerpo.querySelector('#pe-zona').textContent = t('pes.zona', { z: p.nombre });
      cuerpo.querySelector('#pe-mos').innerHTML = mosaicos(p, i, S.clo, cloFecha);
      rotuloSim();
    }
    function capaClo() {
      var a = cuerpo.querySelector('#pe-aviso'); a.hidden = true;
      if (est.mapa) est.mapa.capa(S.clo ? URL_CLO + cloFecha + '/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png' : null, 'NASA EOSDIS GIBS / VIIRS NOAA-20');
    }
    cuerpo.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('button') : null; if (!b) return;
      if (b.hasAttribute('data-puerto')) { S.puerto = b.getAttribute('data-puerto'); pintar(); }
      else if (b.hasAttribute('data-var')) { S.v = b.getAttribute('data-var'); pintar(); }
      else if (b.id === 'pe-clo') { S.clo = !S.clo; capaClo(); pintar(); }
      else if (b.id === 'pe-ant') { parar(); S.dia = Math.max(0, S.dia - 1); pintar(); }
      else if (b.id === 'pe-sig') { parar(); S.dia = Math.min(3, S.dia + 1); pintar(); }
      else if (b.id === 'pe-sim') {
        if (est.timer) { parar(); pintar(); return; }
        if (S.h >= 23) S.h = -1;
        est.timer = setInterval(function () { S.h += 1; if (S.h >= 23) { S.h = 23; parar(); } pintar(); }, PASO_MS);
        S.h += 1; pintar();
      }
    });
    rng.addEventListener('input', function () { parar(); S.h = +rng.value; pintar(); });
    pintar();
  }

  function render(main) {
    limpiar();
    var mi = est.ficha;
    main.innerHTML = '<section class="pe" aria-labelledby="pe-h1"><div class="pe-cab"><p class="hm-mono pe-ins"><i class="hm-punto" aria-hidden="true"></i>' + esc(t('pes.kicker')) + '</p>' +
      '<p class="hm-mono hm-pildora pe-act" id="pe-act" hidden></p></div><h1 id="pe-h1">' + esc(t('titulo.pesca')) + '</h1><p class="pe-sub">' + esc(t('pes.sub')) + '</p>' +
      '<div id="pe-cuerpo"><p class="pe-carga">' + esc(t('pes.cargando')) + '</p></div></section>';
    return V.cargar().then(function (r) {
      if (mi !== est.ficha) return;
      main.removeAttribute('aria-busy');
      montar(main, r.datos);
    }).catch(function () {
      if (mi !== est.ficha) return;
      main.removeAttribute('aria-busy');
      var c = main.querySelector('#pe-cuerpo');
      if (c) c.innerHTML = '<p class="aviso" role="alert">' + esc(t('pes.error')) + '</p>';
    });
  }

  var RBPesca = { render: render, limpiar: limpiar, pines: pines, mosaicos: mosaicos, leyenda: leyenda, estadoPuerto: estadoPuerto, montar: montar, TX: TX };
  if (typeof window !== 'undefined') window.RBPesca = RBPesca;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBPesca;
})();
