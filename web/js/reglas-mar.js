/* Reglas del estado del mar y de los avisos del modelo (docs/PLAN-PESCA-AVISOS.md). Funciones puras, ES5, sin build.
   NADA de esto es un aviso oficial: son estimaciones sobre un modelo y así se rotulan en pantalla.
   Umbrales y su fuente (verificados el 2026-11-15; ver docs/investigacion/umbrales-mar.md):
   - Oleaje: escala de mar de Douglas (internacional): 0 sin olas; 1 hasta 0.10 m; 2 hasta 0.50; 3 hasta 1.25; 4 hasta 2.50; 5 hasta 4.00;
     6 hasta 6.00; 7 hasta 9.00; 8 hasta 14.00; 9 más de 14 m. https://en.wikipedia.org/wiki/Douglas_sea_scale
   - Viento: escala de Beaufort (nudos): 0 <1; 1 1-3; 2 4-6; 3 7-10; 4 11-16; 5 17-21; 6 22-27; 7 28-33; 8 34-40; 9 41-47; 10 48-55; 11 56-63; 12 >=64.
     https://en.wikipedia.org/wiki/Beaufort_scale. Viento duro (gale) 34-47 kt y tormenta >=48 kt: avisos marinos del NWS
     (https://www.weather.gov/marine/cwd; el umbral de "small craft advisory" cambia por oficina y NO se usa).
   - Tormenta y lluvia: códigos WMO 4677 que entrega Open-Meteo (https://open-meteo.com/en/docs): 63 y 81 lluvia/chubasco moderado;
     65, 67 y 82 fuerte o violento; 95, 96 y 99 tormenta eléctrica.
   - UV: categorías de la OMS (Índice UV mundial): 8-10 muy alto, 11 o más extremo.
   - NO se usan umbrales de calor ni de milímetros por hora de lluvia: solo se confirmaron en fuentes secundarias y con variantes. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var V = (typeof window !== 'undefined' && window.RBVivo) || (typeof require !== 'undefined' ? require('./datos-vivos.js') : null);
  var t = T.t;

  /* Límites inferiores (incluidos) de cada grado de Douglas; el grado 0 es solo "sin olas" (0 m exacto). */
  var DOUGLAS = [0.10, 0.50, 1.25, 2.50, 4.00, 6.00, 9.00, 14.00];
  function douglas(h) {
    if (h == null || isNaN(h)) return null;
    if (h <= 0) return 0;
    var g = 1;
    for (var i = 0; i < DOUGLAS.length; i++) if (h >= DOUGLAS[i]) g = i + 2;
    return g;
  }
  var BEAUFORT = [1, 4, 7, 11, 17, 22, 28, 34, 41, 48, 56, 64];
  function beaufort(kt) {
    if (kt == null || isNaN(kt)) return null;
    var f = 0;
    for (var i = 0; i < BEAUFORT.length; i++) if (kt >= BEAUFORT[i]) f = i + 1;
    return f;
  }

  /* Niveles de aviso: 0 informativo (azul), 1 preventivo (amarillo), 2 severo (naranja), 3 crítico (rojo). */
  function nivelOla(h) { var g = douglas(h); return g == null ? null : g >= 6 ? 3 : g >= 5 ? 2 : g >= 4 ? 1 : 0; }
  function nivelViento(kt) { return kt == null || isNaN(kt) ? null : kt >= 48 ? 3 : kt >= 34 ? 2 : kt >= 22 ? 1 : 0; }
  function nivelCodigo(c) {
    if (c == null) return null;
    if (c === 95 || c === 96 || c === 99) return 2;
    if (c === 65 || c === 67 || c === 82) return 2;
    if (c === 63 || c === 81) return 1;
    return 0;
  }
  function esTormenta(c) { return c === 95 || c === 96 || c === 99; }
  function nivelUV(u) { return u == null || isNaN(u) ? null : u >= 11 ? 2 : u >= 8 ? 1 : 0; }

  /* Estado del mar (reemplaza al "semáforo" del Figma, que parecía una bandera oficial): verde, amarillo o rojo según el peor de oleaje y viento. */
  function estadoMar(ola, viento) {
    var a = nivelOla(ola), b = nivelViento(viento);
    // Si falta alguno de los dos datos, no se adivina: "sin dato" (un verde sin oleaje podría engañar).
    if (a == null || b == null) return null;
    var n = Math.max(a, b);
    return n >= 2 ? 'rojo' : n === 1 ? 'amarillo' : 'verde';
  }

  function en(serie, i) { return serie && serie[i] != null ? serie[i] : null; }

  /* Avisos del modelo en las próximas `ventana` horas desde idx. Cada aviso agrupa los puertos con el mismo tema y nivel.
     {id, grupo:'mar'|'meteo', tema, nivel, zonas:[nombres], desde:índice de hora, ahora:boolean, pico:número|null} */
  function avisos(datos, idx, ventana) {
    ventana = ventana || 24;
    var fin = Math.min(datos.horas.length, idx + ventana);
    var temas = [
      { tema: 'ola', grupo: 'mar', serie: 's.ola', nivel: nivelOla, pico: 'max' },
      { tema: 'viento', grupo: 'mar', serie: 's.viento', nivel: nivelViento, pico: 'max' },
      { tema: 'tormenta', grupo: 'meteo', serie: 's.codigo', nivel: function (c) { return esTormenta(c) ? 2 : 0; }, pico: null },
      { tema: 'lluvia', grupo: 'meteo', serie: 's.codigo', nivel: function (c) { return esTormenta(c) ? 0 : nivelCodigo(c); }, pico: null },
      { tema: 'uv', grupo: 'meteo', serie: 's.uv', nivel: nivelUV, pico: 'max' }
    ];
    var grupos = {}, orden = [];
    temas.forEach(function (tm) {
      datos.puertos.forEach(function (p) {
        var s = p.s[tm.serie.slice(2)], mejor = 0, desde = -1, pico = null, k, nv;
        for (k = idx; k < fin; k++) {
          var v = en(s, k);
          if (v == null) continue;
          nv = tm.nivel(v);
          if (nv == null) continue;
          if (nv > mejor) { mejor = nv; desde = k; }
          if (tm.pico && (pico == null || v > pico)) pico = v;
        }
        if (mejor < 1) return;
        // primer momento en que se alcanza el nivel máximo
        for (k = idx; k < fin; k++) { var vv = en(s, k); if (vv != null && tm.nivel(vv) >= mejor) { desde = k; break; } }
        var id = tm.tema + '.' + mejor;
        if (!grupos[id]) { grupos[id] = { id: id, grupo: tm.grupo, tema: tm.tema, nivel: mejor, zonas: [], desde: desde, ahora: false, pico: null }; orden.push(id); }
        var g = grupos[id];
        g.zonas.push(p.nombre);
        if (desde < g.desde) g.desde = desde;
        if (pico != null && (g.pico == null || pico > g.pico)) g.pico = pico;
      });
    });
    var res = orden.map(function (id) { var g = grupos[id]; g.ahora = g.desde <= idx; return g; });
    res.sort(function (a, b) { return b.nivel - a.nivel || a.desde - b.desde || (a.id < b.id ? -1 : 1); });
    return res;
  }
  /* Puertos con mar verde en la hora idx (aviso informativo "mar tranquilo"). */
  function tranquilos(datos, idx) {
    return datos.puertos.filter(function (p) { return estadoMar(en(p.s.ola, idx), en(p.s.viento, idx)) === 'verde'; }).map(function (p) { return p.nombre; });
  }

  /* Textos (ES/EN) que se agregan al diccionario de textos.js; mismas claves en los dos idiomas. */
  var TX = {
    es: {
      'mar.g0': 'Calma', 'mar.g1': 'Calma', 'mar.g2': 'Poco oleaje', 'mar.g3': 'Oleaje ligero', 'mar.g4': 'Oleaje moderado',
      'mar.g5': 'Oleaje fuerte', 'mar.g6': 'Oleaje muy fuerte', 'mar.g7': 'Oleaje extremo', 'mar.g8': 'Oleaje extremo', 'mar.g9': 'Oleaje extremo',
      'mar.b.0': 'Viento suave', 'mar.b.1': 'Viento moderado', 'mar.b.2': 'Viento fuerte', 'mar.b.3': 'Viento muy fuerte', 'mar.b.4': 'Viento de tormenta', 'mar.b.5': 'Viento de huracán',
      'mar.e.verde': 'Verde', 'mar.e.amarillo': 'Amarillo', 'mar.e.rojo': 'Rojo', 'mar.e.sin': 'Sin dato',
      'mar.e.verdeT': 'Mar tranquilo', 'mar.e.amarilloT': 'Mar moderado', 'mar.e.rojoT': 'Mar agitado',
      'niv.0': 'Informativo', 'niv.1': 'Preventivo', 'niv.2': 'Severo', 'niv.3': 'Crítico',
      'avi.ola.1': 'Oleaje moderado', 'avi.ola.2': 'Oleaje fuerte', 'avi.ola.3': 'Oleaje muy fuerte',
      'avi.viento.1': 'Viento fuerte', 'avi.viento.2': 'Viento duro (temporal)', 'avi.viento.3': 'Viento de tormenta',
      'avi.tormenta.2': 'Tormenta eléctrica', 'avi.lluvia.1': 'Lluvia moderada', 'avi.lluvia.2': 'Lluvia fuerte',
      'avi.uv.1': 'Índice UV muy alto', 'avi.uv.2': 'Índice UV extremo',
      'avi.calma': 'Mar tranquilo',
      'avi.det.ola': 'Hasta {v} m', 'avi.det.viento': 'Hasta {v} nudos', 'avi.det.uv': 'Índice hasta {v}'
    },
    en: {
      'mar.g0': 'Calm', 'mar.g1': 'Calm', 'mar.g2': 'Smooth', 'mar.g3': 'Slight', 'mar.g4': 'Moderate waves',
      'mar.g5': 'Rough', 'mar.g6': 'Very rough', 'mar.g7': 'Extreme waves', 'mar.g8': 'Extreme waves', 'mar.g9': 'Extreme waves',
      'mar.b.0': 'Light wind', 'mar.b.1': 'Moderate wind', 'mar.b.2': 'Strong wind', 'mar.b.3': 'Very strong wind', 'mar.b.4': 'Storm-force wind', 'mar.b.5': 'Hurricane-force wind',
      'mar.e.verde': 'Green', 'mar.e.amarillo': 'Yellow', 'mar.e.rojo': 'Red', 'mar.e.sin': 'No data',
      'mar.e.verdeT': 'Calm sea', 'mar.e.amarilloT': 'Moderate sea', 'mar.e.rojoT': 'Rough sea',
      'niv.0': 'Informational', 'niv.1': 'Cautionary', 'niv.2': 'Severe', 'niv.3': 'Critical',
      'avi.ola.1': 'Moderate waves', 'avi.ola.2': 'Rough seas', 'avi.ola.3': 'Very rough seas',
      'avi.viento.1': 'Strong wind', 'avi.viento.2': 'Gale-force wind', 'avi.viento.3': 'Storm-force wind',
      'avi.tormenta.2': 'Thunderstorm', 'avi.lluvia.1': 'Moderate rain', 'avi.lluvia.2': 'Heavy rain',
      'avi.uv.1': 'Very high UV index', 'avi.uv.2': 'Extreme UV index',
      'avi.calma': 'Calm sea',
      'avi.det.ola': 'Up to {v} m', 'avi.det.viento': 'Up to {v} knots', 'avi.det.uv': 'Index up to {v}'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function textoOla(h) { var g = douglas(h); return g == null ? t('mar.e.sin') : t('mar.g' + g); }
  function textoViento(kt) {
    var f = beaufort(kt);
    if (f == null) return t('mar.e.sin');
    return t('mar.b.' + (f <= 3 ? 0 : f <= 5 ? 1 : f <= 7 ? 2 : f <= 9 ? 3 : f <= 11 ? 4 : 5));
  }

  var RBMar = { douglas: douglas, beaufort: beaufort, nivelOla: nivelOla, nivelViento: nivelViento, nivelCodigo: nivelCodigo, nivelUV: nivelUV, esTormenta: esTormenta,
    estadoMar: estadoMar, avisos: avisos, tranquilos: tranquilos, textoOla: textoOla, textoViento: textoViento, TX: TX };
  if (typeof window !== 'undefined') window.RBMar = RBMar;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBMar;
})();
