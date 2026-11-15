/* Pantalla Inicio (diseño Figma "Home"), solo con datos de indicadores.json.
   Todo texto de cifras sale de window.RB (reglas.js). ES5, sin build. */
(function () {
  'use strict';
  var RB = (typeof window !== 'undefined' && window.RB) ||
    (typeof require !== 'undefined' ? require('./reglas.js') : null);

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ind(datos, id) {
    var l = (datos && datos.indicadores) || [];
    for (var k = 0; k < l.length; k++) if (l[k].id === id) return l[k];
    return null;
  }
  function sig(i) { return i.significancia ? i.significancia.significativo : null; }
  function etiqueta(i) {
    var s = sig(i);
    if (s === true) return ['Tendencia clara (estadísticamente significativa)', 'si'];
    if (s === false) return ['Sin tendencia clara', 'no'];
    return ['Sin calcular', 'nc'];
  }
  function pTxt(i) {
    var g = i.significancia;
    return g && g.p_valor != null ? 'p = ' + RB.pTexto(g.p_valor, 3) : '';
  }
  function cortoDataset(i) {
    return String(RB.textoFuente(i)).split(' vía ')[0];
  }
  /* Rango de años real, desde fuente.periodo de todos los indicadores. */
  function rango(datos) {
    var min = null, max = null;
    ((datos && datos.indicadores) || []).forEach(function (i) {
      var m = /(\d{4})\D+(\d{4})/.exec((i.fuente && i.fuente.periodo) || '');
      if (!m) return;
      var a = +m[1], b = +m[2];
      if (min === null || a < min) min = a;
      if (max === null || b > max) max = b;
    });
    return min !== null ? min + '–' + max : '';
  }

  function etq(i) {
    var e = etiqueta(i);
    return '<span class="hm-etq hm-etq-' + e[1] + '">' + esc(e[0]) + '</span>';
  }

  function dato(k, v) {
    return '<div class="hm-dato"><span class="hm-dato-k">' + esc(k) + '</span><span class="hm-dato-v">' + esc(v) + '</span></div>';
  }

  function principal(i) {
    var t = RB.textoCambio(i), p = pTxt(i), f = i.fuente || {};
    var h = '<article class="hm-principal" data-indicador="' + esc(i.id) + '">' +
      '<div class="hm-barra" aria-hidden="true"></div>' +
      '<p class="hm-mono hm-verde">Indicador principal</p>' +
      '<h3 class="hm-t-prin">' + esc(i.titulo) + ' en La Paz</h3>' +
      '<p class="hm-cifra-grande ' + esc(t.clase) + '">' + esc(t.texto) + '</p>' +
      '<p class="hm-linea">' + etq(i) + (p ? ' <span class="hm-mono">' + esc(p) + '</span>' : '') + '</p>' +
      (i.limitacion ? '<p class="hm-peq">' + esc(i.limitacion) + '</p>' : '') +
      '<div class="hm-datos">';
    if (f.periodo) h += dato('Periodo', f.periodo);
    if (i.tendencia_por_decada != null) h += dato('Cambio por década', RB.signo(i.tendencia_por_decada, i.unidades));
    if (i.significancia && i.significancia.metodo) h += dato('Prueba', i.significancia.metodo);
    h += dato('Dataset', cortoDataset(i));
    h += '</div><p class="fuente hm-fuente">Fuente: ' + esc(RB.textoFuente(i)) + '</p>' +
      '<a class="hm-enlace" href="#ficha/' + esc(i.id) + '">Ver ficha de ' + esc(String(i.titulo).toLowerCase()) + '</a></article>';
    return h;
  }

  function pequena(i) {
    var t = RB.textoCambio(i), p = pTxt(i);
    var nota = '';
    if (i.id === 'agua' && i.limitacion) nota = String(i.limitacion).split('. ')[0] + '.';
    return '<article class="hm-peque" data-indicador="' + esc(i.id) + '">' +
      '<h3 class="hm-t-peq">' + esc(i.titulo) + '</h3>' +
      '<p class="hm-cifra ' + esc(t.clase) + '">' + esc(t.texto) + '</p>' +
      '<p class="hm-linea">' + etq(i) + (p ? ' <span class="hm-mono">' + esc(p) + '</span>' : '') + '</p>' +
      (nota ? '<p class="hm-peq">' + esc(nota) + '</p>' : '') +
      '<p class="fuente hm-fuente">Fuente: ' + esc(RB.textoFuente(i)) + '</p>' +
      '<a class="hm-enlace" href="#ficha/' + esc(i.id) + '">Ver ficha</a></article>';
  }

  function html(datos) {
    var r = rango(datos);
    var calor = ind(datos, 'calor');
    var h = '<div class="hm">' +
      '<section class="hm-hero" aria-labelledby="hm-h1">' +
        '<div class="hm-hero-img" aria-hidden="true"></div>' +
        '<div class="hm-hero-cont">' +
          '<h1 id="hm-h1">Cómo ha cambiado <span class="hm-resalte">La Paz</span> desde 2001</h1>' +
          '<p class="hm-sub">Calor, vegetación, lluvia y agua en La Paz, B.C.S., con datos abiertos de la NASA.</p>' +
          '<div class="hm-botones"><a class="hm-btn hm-btn-claro" href="#mapa">Ver mapa de zonas</a>' +
          '<a class="hm-btn hm-btn-oscuro" href="#acciones">Qué puedo hacer</a></div>' +
        '</div></section>' +
      '<section class="hm-sec" aria-labelledby="hm-h2"><div class="hm-sec-cab"><div>' +
        '<p class="hm-mono hm-eti"><i class="hm-punto"></i>' + (r ? 'Tendencias ' + esc(r) + ' · NASA' : 'Tendencias · NASA') + '</p>' +
        '<h2 id="hm-h2">¿Qué cambia?</h2></div>' +
        (datos && datos.generado ? '<p class="hm-mono hm-pildora">Datos generados el ' + esc(datos.generado) + '</p>' : '') +
      '</div><div class="hm-rejilla">' +
      (calor ? principal(calor) : '') + '<div class="hm-peques">';
    ['vegetacion', 'lluvia', 'agua'].forEach(function (id) {
      var i = ind(datos, id);
      if (i) h += pequena(i);
    });
    h += '</div></div>' +
      '<p class="aviso hm-aviso">Mostramos qué cambió, no por qué. Una tendencia no prueba la causa.</p></section>' +
      '<section class="hm-sec hm-sec-mapa" aria-labelledby="hm-h3"><div class="hm-marco">' +
        '<div class="hm-marco-cab"><h2 id="hm-h3">Baja California Sur vista por el satélite Terra (MODIS)</h2></div>' +
        '<figure class="hm-fig"><img src="img/bcs-modis-2025-04-20-600.jpg" srcset="img/bcs-modis-2025-04-20-600.jpg 600w, img/bcs-modis-2025-04-20.jpg 1200w" sizes="(min-width: 1024px) 1216px, 100vw" width="1200" height="1060" alt="Imagen de satélite de Baja California Sur, 20 de abril de 2025" loading="lazy">' +
        '<figcaption class="hm-cred">Imagen: NASA EOSDIS GIBS, MODIS Terra, 20 abr 2025 (CC0)</figcaption>' +
        '<a class="hm-btn hm-btn-claro hm-fig-btn" href="#mapa">Ver zonas de La Paz</a></figure>' +
      '</div></section>' +
      '<footer class="hm-pie"><div class="hm-pie-grid">' +
        '<div><p class="hm-marca"><i class="hm-punto"></i>RADAR BCS</p>' +
        '<p class="hm-pie-desc">Tendencias ambientales de La Paz, B.C.S., con datos abiertos de la NASA.</p></div>' +
        '<nav aria-label="Pie de página"><p class="hm-mono hm-negro">Pantallas</p>' +
        '<a href="#inicio">Inicio</a><a href="#mapa">Mapa</a><a href="#ficha/calor">Fichas</a><a href="#acciones">Acciones</a></nav>' +
      '</div><p class="hm-mono hm-copy">© 2026 Equipo OptiPaz · NASA Space Apps Challenge 2026 · Licencia Apache-2.0<br>Código y análisis escritos con ayuda de IA (Claude Code); interfaz diseñada con ayuda de Google Stitch.</p></footer>' +
      '</div>';
    return h;
  }

  function render(main, datos) {
    main.innerHTML = html(datos);
  }

  var RBHome = { html: html, render: render };
  if (typeof window !== 'undefined') window.RBHome = RBHome;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBHome;
})();
