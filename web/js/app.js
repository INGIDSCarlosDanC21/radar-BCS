(function () {
  'use strict';
  var main = document.getElementById('contenido');
  var DATOS = null, ZONAS = null, mapa = null, indMapa = 'calor';
  var IDS = ['calor', 'vegetacion', 'lluvia', 'agua'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var num = RB.num, dec = RB.dec, pTexto = RB.pTexto, signo = RB.signo, clase = RB.clase;
  function etiqueta(s) {
    if (s === true) return ['Tendencia clara (estadísticamente significativa)', 'si'];
    if (s === false) return ['Sin tendencia clara', ''];
    return ['Sin calcular', ''];
  }
  function ind(id) {
    return DATOS.indicadores.filter(function (i) { return i.id === id; })[0];
  }
  function sig(i) { return i.significancia ? i.significancia.significativo : null; }

  function ok(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  function cargar() {
    return Promise.all([
      fetch('data/indicadores.json').then(ok),
      fetch('data/zonas.geojson').then(ok)
    ]).then(function (r) { DATOS = r[0]; ZONAS = r[1]; });
  }
  function franja(sec) {
    var f = document.getElementById('franja');
    f.hidden = !RB.mostrarFranja(DATOS, ZONAS, sec);
    f.textContent = (DATOS && DATOS.datos_de_prueba === true) ? 'DATOS DE PRUEBA — no son mediciones reales'
      : 'MAPA DE PRUEBA — las zonas dibujadas no son mediciones';
  }

  /* ---------- Inicio ---------- */
  function inicio() {
    var h = '<h1>Radar BCS</h1><p class="lead">Cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz desde 2001, con datos abiertos de la NASA.</p><div class="tarjetas">';
    DATOS.indicadores.forEach(function (i) {
      var e = etiqueta(sig(i)), t = RB.textoCambio(i);
      h += '<a class="tarjeta" href="#ficha/' + esc(i.id) + '"><h2>' + esc(i.titulo) + '</h2>' +
        '<div class="cifra ' + t.clase + '">' + esc(t.texto) + '</div>' +
        ((i.id === 'calor' || i.id === 'agua') && t.tipo !== 'sin-datos' && i.limitacion ? '<p class="nota-limite"><strong>Límite:</strong> ' + esc(i.id === 'agua' ? i.limitacion.split('. ')[0] + '.' : i.limitacion) + '</p>' : '') +
        '<p class="fuente">Periodo: ' + esc((i.fuente && i.fuente.periodo) || 'pendiente') + '</p>' +
        '<span class="etiqueta ' + e[1] + '">' + e[0] + '</span>' +
        '<p class="fuente">Fuente: ' + esc(RB.textoFuente(i)) + '</p>' +
        (t.tipo === 'sin-datos' && i.limitacion ? '<p class="fuente">' + esc(i.limitacion) + '</p>' : '') + '</a>';
    });
    main.innerHTML = h + '</div><p class="aviso">Mostramos qué cambió, no por qué. Una tendencia no prueba la causa.</p>' +
      (DATOS.generado ? '<p class="fuente">Datos generados el ' + esc(DATOS.generado) + '</p>' : '');
  }

  /* ---------- Mapa ---------- */
  var PAL = { neg: [31, 95, 153], pos: [180, 56, 15], mid: [242, 240, 235] };
  function mezcla(a, b, t) {
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * t); }).join(',') + ')';
  }
  function maxAbs(id) {
    var m = 0;
    ZONAS.features.forEach(function (f) {
      var c = f.properties.cambios[id];
      if (c && c.cambio_total != null) m = Math.max(m, Math.abs(c.cambio_total));
    });
    return m;
  }
  function color(v, m) {
    if (v == null) return '#9aa0a6';
    if (!m) return mezcla(PAL.mid, PAL.mid, 0);
    var t = Math.min(Math.abs(v) / m, 1);
    return mezcla(PAL.mid, v < 0 ? PAL.neg : PAL.pos, 0.15 + 0.85 * t);
  }

  function mapaVista() {
    var h = '<h1>Mapa</h1><p class="lead">Zonas de La Paz según el cambio desde 2001. Elige un indicador.</p><div class="chips" role="group" aria-label="Indicador">';
    IDS.forEach(function (id) {
      h += '<button type="button" class="chip" data-ind="' + id + '" aria-pressed="' + (id === indMapa) + '">' + esc(ind(id).titulo) + '</button>';
    });
    h += '</div><div id="aviso-mapa"></div><div id="mapa-caja" role="region" aria-label="Mapa de zonas de La Paz"></div>' +
      '<div id="leyenda" class="leyenda"></div><div id="resumen"></div>' +
      '<p class="fuente" id="fuente-mapa"></p>';
    main.innerHTML = h;
    main.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () { indMapa = b.getAttribute('data-ind'); ruta(); });
    });
    pintar();
  }

  /* Qué mide cada capa por zona (MODIS vía AppEEARS). sinCifra: decisión de Investigación
     (docs/investigacion/hallazgos.md): la baja de superficie por zona depende de la prueba; no se cita cifra. */
  var CAPA_ZONA = {
    calor: { que: 'Temperatura de la superficie (satélite MODIS), no la del aire.',
      fuente: 'MODIS MOD11A2.061 (temperatura de superficie, 1 km) vía NASA AppEEARS',
      sinCifra: 'En El Centenario y Sur una prueba estadística marca una baja de la temperatura de superficie, pero con otra prueba no es significativa y viene de 2022-2025; no la interpretamos todavía.' },
    vegetacion: { que: 'Índice de vegetación (NDVI). Algunos meses no tienen lectura válida en la ciudad: es un panorama aproximado.',
      fuente: 'MODIS MOD13Q1.061 (NDVI, 250 m) vía NASA AppEEARS' }
  };

  function pintar() {
    var id = indMapa, i = ind(id), un = i.unidades;
    var esPrueba = ZONAS.datos_de_prueba === true, prueba = esPrueba ? ' (dato de prueba)' : '';
    var cfg = esPrueba ? null : CAPA_ZONA[id];
    function cz(f) {
      var c = f.properties.cambios[id];
      if (c && cfg && cfg.sinCifra && c.cambio_total != null) return { cambio_total: c.cambio_total, significativo: false };
      return c;
    }
    var m = 0;
    ZONAS.features.forEach(function (f) { var c = cz(f); if (c && c.cambio_total != null && c.significativo !== false) m = Math.max(m, Math.abs(c.cambio_total)); });
    function zonaTexto(c) { return c.significativo === false ? 'Sin cambio claro' : signo(c.cambio_total, un); }
    var caja = document.getElementById('mapa-caja');
    if (typeof L === 'undefined') {
      document.getElementById('aviso-mapa').innerHTML = '<p class="aviso">No se pudo cargar el mapa (¿sin conexión?). La lista de zonas de abajo sigue disponible.</p>';
      caja.hidden = true;
    } else {
      try {
        mapa = L.map(caja, { scrollWheelZoom: false }).setView([24.125, -110.315], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);
        var capa = L.geoJSON(ZONAS, {
          style: function (f) {
            var c = cz(f);
            var v = c ? c.cambio_total : null;
            var fill = (c && c.significativo === false && v != null) ? mezcla(PAL.mid, PAL.mid, 0) : color(v, m);
            return { color: '#333', weight: 1, fillOpacity: 0.75, fillColor: fill, dashArray: v == null ? '4 3' : null };
          },
          onEachFeature: function (f, l) {
            var c = cz(f) || {};
            var e = etiqueta(c.significativo === undefined ? null : c.significativo);
            l.bindPopup('<strong>' + esc(f.properties.nombre) + '</strong>' + prueba + '<br>' + esc(i.titulo) + ': ' +
              esc(zonaTexto(c)) + '<br>' + e[0]);
          }
        }).addTo(mapa);
        mapa.fitBounds(capa.getBounds());
      } catch (e) {
        document.getElementById('aviso-mapa').innerHTML = '<p class="aviso">No se pudo mostrar el mapa. La lista de zonas sigue disponible.</p>';
        caja.hidden = true;
      }
    }
    var ley = '';
    if (m) {
      [-1, -0.5, 0, 0.5, 1].forEach(function (t) {
        var v = t * m;
        ley += '<span><i style="background:' + color(v, m) + '"></i>' + esc(signo(v, un)) + '</span>';
      });
    }
    ley += '<span><i class="sindatos"></i>sin datos</span>';
    document.getElementById('leyenda').innerHTML = ley;

    // Real: todas las zonas con dato, primero las de tendencia clara. Prueba: top 5 con cifra.
    var lista = ZONAS.features.filter(function (f) {
      var c = cz(f); return c && c.cambio_total != null && (!esPrueba || c.significativo !== false);
    }).sort(function (a, b) {
      var ca = cz(a), cb = cz(b), sa = ca.significativo === false, sb = cb.significativo === false;
      if (sa !== sb) return sa ? 1 : -1;
      return Math.abs(cb.cambio_total) - Math.abs(ca.cambio_total);
    }).slice(0, esPrueba ? 5 : undefined);
    var r = '<h2>' + (esPrueba ? 'Zonas de prueba del mapa (no son mediciones): ' : 'Zonas con más cambio: ') + esc(i.titulo) + '</h2>';
    if (cfg) r += '<p>' + esc(cfg.que) + '</p>';
    if (!lista.length) {
      r += '<p class="aviso">Este indicador se mide a escala regional, no por zona; por eso el mapa no tiene datos para ' + esc(i.titulo.toLowerCase()) + '. Mira la ficha para ver el cambio en La Paz.</p>';
    } else {
      r += '<ol class="top">';
      lista.forEach(function (f) {
        var c = cz(f), t = zonaTexto(c);
        r += '<li><strong>' + esc(f.properties.nombre) + '</strong>' + prueba + ': ' +
          (c.significativo === false ? esc(t) : '<span class="' + clase(c.cambio_total) + '">' + esc(t) + '</span> — ' + etiqueta(c.significativo)[0]) + '</li>';
      });
      r += '</ol>';
      if (cfg && cfg.sinCifra) r += '<p class="nota-limite">' + esc(cfg.sinCifra) + '</p>';
    }
    r += '<p><a href="#ficha/' + esc(id) + '">Ver ficha de ' + esc(i.titulo.toLowerCase()) + '</a></p>';
    document.getElementById('resumen').innerHTML = r;
    var nota = ZONAS.features[0] && ZONAS.features[0].properties.nota;
    document.getElementById('fuente-mapa').textContent = (esPrueba ?
      'Zonas: datos de prueba sintéticos, no son mediciones; el mapa por zona espera datos de MODIS. El dato real de La Paz está en la ficha.' :
      cfg ? 'Fuente: ' + cfg.fuente + ', ' + (ZONAS.periodo ? ZONAS.periodo.inicio + '–' + ZONAS.periodo.fin : 'periodo pendiente') +
        '; Mann-Kendall estacional y pendiente de Sen. Son puntos, no zonas completas: cada uno se dibuja como el píxel de 1 km que lo contiene.' : '') +
      ' Mapa base: © OpenStreetMap contributors.';
  }

  /* ---------- Ficha ---------- */
  function grafica(i) {
    var s = (i.serie_anual || []).filter(function (p) { return p.valor != null; });
    if (s.length < 2) return '<p>Sin datos suficientes para la gráfica.</p>';
    var W = 320, H = 180, L0 = 40, R = 10, T = 10, B = 28;
    var xs = s.map(function (p) { return p.anio; }), ys = s.map(function (p) { return p.valor; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if (y0 === y1) { y0 -= 1; y1 += 1; }
    var X = function (v) { return L0 + (v - x0) / (x1 - x0) * (W - L0 - R); };
    var Y = function (v) { return T + (y1 - v) / (y1 - y0) * (H - T - B); };
    var d = s.map(function (p, k) { return (k ? 'L' : 'M') + X(p.anio).toFixed(1) + ' ' + Y(p.valor).toFixed(1); }).join(' ');
    var dy = dec(y1);
    var a = s[0], z = s[s.length - 1];
    var desc = 'Gráfica de línea de ' + i.titulo + ' de ' + x0 + ' a ' + x1 + ': pasa de ' + num(a.valor, dy) + ' a ' + num(z.valor, dy) + ' ' + i.unidades + '.';
    return '<svg class="grafica" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="gt gd"><title id="gt">' + esc(i.titulo) + ' por año</title><desc id="gd">' + esc(desc) + '</desc>' +
      '<line x1="' + L0 + '" y1="' + (H - B) + '" x2="' + (W - R) + '" y2="' + (H - B) + '" stroke="currentColor" opacity=".4"/>' +
      '<line x1="' + L0 + '" y1="' + T + '" x2="' + L0 + '" y2="' + (H - B) + '" stroke="currentColor" opacity=".4"/>' +
      '<text x="' + (L0 - 4) + '" y="' + (T + 8) + '" text-anchor="end">' + num(y1, dy) + '</text>' +
      '<text x="' + (L0 - 4) + '" y="' + (H - B) + '" text-anchor="end">' + num(y0, dy) + '</text>' +
      '<text x="' + L0 + '" y="' + (H - 10) + '">' + x0 + '</text>' +
      '<text x="' + (W - R) + '" y="' + (H - 10) + '" text-anchor="end">' + x1 + '</text>' +
      '<text x="' + ((L0 + W) / 2) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(i.unidades) + '</text>' +
      '<path d="' + d + '" fill="none" stroke="var(--acento)" stroke-width="2.5" stroke-linejoin="round"/></svg>' +
      '<p class="fuente">' + esc(desc) + '</p>';
  }

  function conclusion(i) {
    var g = i.significancia || {}, p = g.p_valor, a = g.alfa;
    if (g.significativo === true && p != null && a != null) return 'Sí. La tendencia es clara: con p ' + (p < 0.001 ? '< 0.001' : '= ' + num(p, 2)) + ' (menor que alfa = ' + num(a, 2) + ') es poco probable que se deba solo al azar.';
    if (g.significativo === false && p != null && a != null) return 'No se detecta un cambio claro. Con p = ' + num(p, 2) + ' (no menor que alfa = ' + num(a, 2) + ') lo que vemos cabe dentro de la variación normal de un año a otro. Que no se detecte un cambio no prueba que no exista.';
    return 'Todavía no se calcula para este indicador, así que no podemos decir si la tendencia es clara.';
  }

  function ficha(id) {
    var i = ind(id) || ind('calor');
    var f = i.fuente || {}, tc = RB.textoCambio(i);
    var h = '<a class="volver" href="#inicio">← Inicio</a><div class="pestanas" role="group" aria-label="Indicador">';
    IDS.forEach(function (k) {
      h += '<a class="chip" style="display:inline-flex;align-items:center;text-decoration:none" href="#ficha/' + k + '"' + (k === i.id ? ' aria-current="page"' : '') + '>' + esc(ind(k).titulo) + '</a>';
    });
    h += '</div><h1>' + esc(i.titulo) + '</h1><p class="fuente">' + esc(i.variable) + '</p>';
    h += '<div class="bloque"><h2>Cambio total desde ' + esc(((i.fuente && i.fuente.periodo) || '2001').slice(0, 4)) + '</h2><div class="grande ' + tc.clase + '">' + esc(tc.texto) + '</div>' +
      (tc.tipo === 'sin-cambio' ? '<p class="fuente">No se detecta un cambio claro; por eso no se muestra una cifra de cambio.</p>' :
        i.cambio_total_nota ? '<p class="fuente">' + esc(i.cambio_total_nota) + '</p>' : '') +
      '<p>Tendencia por década: <strong>' + esc(tc.tipo === 'sin-cambio' ? 'Sin cambio claro' : signo(i.tendencia_por_decada, i.unidades)) + '</strong></p></div>';
    h += '<div class="bloque"><h2>Media por década</h2>';
    var dd = i.por_decada || [], mx = 0;
    dd.forEach(function (x) { if (x.media != null) mx = Math.max(mx, Math.abs(x.media)); });
    h += '<div class="barras">';
    dd.forEach(function (x) {
      var w = (x.media != null && mx) ? Math.max(Math.abs(x.media) / mx * 100, 2) : 0;
      h += '<div><span>' + esc(x.decada) + '</span><span>' + (x.media != null ? '<span class="b" style="display:block;width:' + w.toFixed(0) + '%"></span>' : '') + '</span><span>' +
        (x.media != null ? esc(num(x.media, dec(x.media)) + ' ' + i.unidades) : 'sin datos') + '</span></div>';
    });
    h += '</div></div>';
    h += '<div class="bloque"><h2>Serie por año</h2>' + grafica(i) + '</div>';
    var g = i.significancia || {};
    h += '<div class="bloque"><h2>¿Es estadísticamente significativo?</h2>' +
      '<p><strong>' + esc(conclusion(i)) + '</strong></p>' +
      '<p>Método: ' + esc(g.metodo || 'sin calcular') + '. Compara cada mes del año con los mismos meses de otros años y ve si el dato sube o baja de forma consistente; la pendiente de Sen estima cuánto cambia por año.</p>' +
      '<p>p-valor: ' + (g.p_valor != null ? esc(pTexto(g.p_valor, 3)) : 'sin calcular') + ' · alfa: ' + (g.alfa != null ? esc(num(g.alfa, 2)) : 'sin dato') +
      '. Si p es menor que alfa, la tendencia se considera clara.</p></div>';
    h += '<div class="bloque"><h2>Fuente</h2><p><strong>' + esc(RB.textoFuente(i)) + '</strong></p><p>' +
      (f.url ? '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.url) + '</a><br>' : '') +
      'Resolución: ' + esc(f.resolucion || 'sin dato') + '<br>Periodo: ' + esc(f.periodo || 'sin dato') + '<br>Fecha de descarga: ' + esc(f.fecha_descarga || 'sin dato') + '</p>' +
      (i.limitacion ? '<p><strong>Limitación:</strong> ' + esc(i.limitacion) + '</p>' : '') + '</div>';
    h += '<p class="aviso">Mostramos qué cambió, no por qué. Una tendencia no prueba la causa.</p>';
    main.innerHTML = h;
  }

  /* ---------- Acciones ---------- */
  function acciones() {
    function sec(t, items, url, nom) {
      return '<div class="bloque"><h2>' + t + '</h2><ul>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') +
        '</ul><p class="fuente">Fuente: <a href="' + url + '" target="_blank" rel="noopener">' + nom + '</a></p></div>';
    }
    main.innerHTML = '<h1>¿Qué puedo hacer?</h1>' +
      sec('Contra el calor', [
        'Usa ropa holgada y de colores claros que cubra brazos y piernas, y un sombrero de ala que dé sombra a la cara, las orejas y la nuca.',
        'Si puedes, haz tus actividades al aire libre en lo más fresco del día o en la noche.',
        'Si tienes aire acondicionado, úsalo; si no, busca un lugar fresco. Aun unas horas en un lugar fresco bajan el riesgo.',
        'Usa ventilador solo si adentro hace menos de 32 °C: por encima de eso puede subir la temperatura del cuerpo.',
        'Refréscate con una ducha fresca, un paño húmedo o un rociador con agua fresca.',
        'Toma agua, que suele ser la mejor bebida, y evita el alcohol porque deshidrata.'
      ], 'https://www.cdc.gov/heat-health/media/pdfs/2025/09/Five-Heat-Steps-factsheet-508.pdf', 'CDC, Five Steps (Heat Action Plan)') +
      sec('Para ahorrar agua', [
        'Cierra la llave mientras te lavas los dientes o te rasuras.',
        'Lava el carro con agua de una cubeta, no con la manguera abierta.',
        'Barre la banqueta, la entrada y los escalones en lugar de lavarlos con manguera.',
        'Revisa cada año tus instalaciones de plomería y tu sistema de riego.'
      ], 'https://www.epa.gov/watersense/start-saving', 'EPA WaterSense, Start Saving') +
      '<p class="aviso">Consejos generales de CDC y EPA, adaptados al español. Revisados contra las páginas citadas el 14 de noviembre de 2026; no sustituyen la atención médica.</p>';
  }

  /* ---------- Enrutador ---------- */
  function ruta() {
    if (mapa) { try { mapa.remove(); } catch (e) {} mapa = null; }
    var h = (location.hash || '#inicio').slice(1).split('/');
    var sec = ['inicio', 'mapa', 'ficha', 'acciones', 'login', 'registro'].indexOf(h[0]) >= 0 ? h[0] : 'inicio';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === sec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.setAttribute('data-vista', sec);
    if (sec === 'login' || sec === 'registro') {
      document.getElementById('franja').hidden = true;
      window.RBAcceso.render(main, sec);
      document.title = 'Radar BCS — ' + (sec === 'login' ? 'Iniciar sesión' : 'Crear cuenta');
      return;
    }
    if (!DATOS) return;
    franja(sec);
    if (sec === 'inicio') { if (window.RBHome) window.RBHome.render(main, DATOS); else inicio(); }
    else if (sec === 'mapa') mapaVista();
    else if (sec === 'ficha') ficha(h[1]);
    else acciones();
    document.title = 'Radar BCS — ' + sec.charAt(0).toUpperCase() + sec.slice(1);
  }
  var prev = null;
  window.addEventListener('hashchange', function () { ruta(); window.scrollTo(0, 0); });
  var h0 = (location.hash || '').slice(1).split('/')[0];
  if (h0 === 'login' || h0 === 'registro') ruta();
  cargar().then(function () { if (h0 !== 'login' && h0 !== 'registro') ruta(); }).catch(function (e) {
    main.innerHTML = '<div class="error" role="alert"><h2>No se pudieron cargar los datos</h2><p>Detalle: ' + esc(e.message) +
      '.</p><p>Si abriste el archivo con doble clic (file://), no funciona: usa un servidor local, por ejemplo <code>python -m http.server -d web 8000</code> y abre http://localhost:8000.</p></div>';
  });
})();
