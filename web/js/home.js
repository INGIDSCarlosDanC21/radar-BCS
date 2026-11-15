/* Pantalla Inicio (diseño Figma "Home"), solo con datos de indicadores.json.
   Todo texto de cifras sale de window.RB (reglas.js). ES5, sin build. */
(function () {
  'use strict';
  var RB = (typeof window !== 'undefined' && window.RB) ||
    (typeof require !== 'undefined' ? require('./reglas.js') : null);
  var T = (typeof window !== 'undefined' && window.RBT) ||
    (typeof require !== 'undefined' ? require('./textos.js') : null);
  function t(k, v) { return T.t(k, v); }
  function tit(i) { return T.d(i, 'titulo'); }

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
    if (s === true) return [t('et.clara'), 'si'];
    if (s === false) return [t('et.noClara'), 'no'];
    return [t('et.sinCalcular'), 'nc'];
  }
  function pTxt(i) {
    var g = i.significancia;
    if (!g || g.p_valor == null) return '';
    var pt = RB.pTexto(g.p_valor, 3);
    return pt.charAt(0) === '<' ? 'p ' + pt : 'p = ' + pt;
  }
  function cortoDataset(i) {
    return String(RB.textoFuente(i)).split(/ v[ií]a /)[0];
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
    var c = RB.textoCambio(i), p = pTxt(i), f = i.fuente || {};
    var h = '<article class="hm-principal" data-indicador="' + esc(i.id) + '">' +
      '<div class="hm-barra" aria-hidden="true"></div>' +
      '<p class="hm-mono hm-verde">' + t('home.principal') + '</p>' +
      '<h3 class="hm-t-prin">' + esc(t('home.enLaPaz', { t: tit(i) })) + '</h3>' +
      '<p class="hm-cifra-grande ' + esc(c.clase) + '">' + esc(c.texto) + '</p>' +
      '<p class="hm-linea">' + etq(i) + (p ? ' <span class="hm-mono">' + esc(p) + '</span>' : '') + '</p>' +
      (i.limitacion ? '<p class="hm-peq">' + esc(T.d(i, 'limitacion')) + '</p>' : '') +
      '<div class="hm-datos">';
    if (f.periodo) h += dato(t('home.dPeriodo'), f.periodo);
    if (i.tendencia_por_decada != null) h += dato(t('home.dDecada'), RB.signo(i.tendencia_por_decada, i.unidades));
    if (i.significancia && i.significancia.metodo) h += dato(t('home.dPrueba'), T.d(i.significancia, 'metodo'));
    h += dato(t('home.dDataset'), cortoDataset(i));
    h += '</div><p class="fuente hm-fuente">' + esc(t('gen.fuente', { f: RB.textoFuente(i) })) + '</p>' +
      '<a class="hm-enlace" href="#ficha/' + esc(i.id) + '">' + esc(t('home.verFichaDe', { t: String(tit(i)).toLowerCase() })) + '</a></article>';
    return h;
  }

  function pequena(i) {
    var c = RB.textoCambio(i), p = pTxt(i);
    var nota = '';
    if (i.id === 'agua' && i.limitacion) nota = String(T.d(i, 'limitacion')).split('. ')[0] + '.';
    return '<article class="hm-peque" data-indicador="' + esc(i.id) + '">' +
      '<h3 class="hm-t-peq">' + esc(tit(i)) + '</h3>' +
      '<p class="hm-cifra ' + esc(c.clase) + '">' + esc(c.texto) + '</p>' +
      '<p class="hm-linea">' + etq(i) + (p ? ' <span class="hm-mono">' + esc(p) + '</span>' : '') + '</p>' +
      (nota ? '<p class="hm-peq">' + esc(nota) + '</p>' : '') +
      '<p class="fuente hm-fuente">' + esc(t('gen.fuente', { f: RB.textoFuente(i) })) + '</p>' +
      '<a class="hm-enlace" href="#ficha/' + esc(i.id) + '">' + t('home.verFicha') + '</a></article>';
  }

  function html(datos) {
    var r = rango(datos);
    var calor = ind(datos, 'calor');
    var h = '<div class="hm">' +
      '<section class="hm-hero" aria-labelledby="hm-h1">' +
        '<div class="hm-hero-img" aria-hidden="true"></div>' +
        '<div class="hm-hero-cont">' +
          '<h1 id="hm-h1">' + t('home.h1') + '</h1>' +
          '<p class="hm-sub">' + t('home.sub') + '</p>' +
          '<div class="hm-botones"><a class="hm-btn hm-btn-claro" href="#mapa">' + t('home.btnMapa') + '</a>' +
          '<a class="hm-btn hm-btn-oscuro" href="#acciones">' + t('home.btnAcc') + '</a></div>' +
        '</div></section>' +
      '<section class="hm-sec" aria-labelledby="hm-h2"><div class="hm-sec-cab"><div>' +
        '<p class="hm-mono hm-eti"><i class="hm-punto"></i>' + (r ? esc(t('home.tend', { r: r })) : t('home.tendSin')) + '</p>' +
        '<h2 id="hm-h2">' + t('home.h2') + '</h2></div>' +
        (datos && datos.generado ? '<p class="hm-mono hm-pildora">' + esc(t('gen.fecha', { f: datos.generado })) + '</p>' : '') +
      '</div><div class="hm-rejilla">' +
      (calor ? principal(calor) : '') + '<div class="hm-peques">';
    ['vegetacion', 'lluvia', 'agua'].forEach(function (id) {
      var i = ind(datos, id);
      if (i) h += pequena(i);
    });
    h += '</div></div>' +
      '<p class="aviso hm-aviso">' + t('aviso.causa') + '</p></section>' +
      '<section class="hm-sec hm-sec-mapa" aria-labelledby="hm-h3"><div class="hm-marco">' +
        '<div class="hm-marco-cab"><h2 id="hm-h3">' + t('home.hMapa') + '</h2></div>' +
        '<figure class="hm-fig"><img src="img/bcs-modis-2025-04-20-600.jpg" srcset="img/bcs-modis-2025-04-20-600.jpg 600w, img/bcs-modis-2025-04-20.jpg 1200w" sizes="(min-width: 1024px) 1216px, 100vw" width="1200" height="1060" alt="' + esc(t('home.alt')) + '" loading="lazy">' +
        '<figcaption class="hm-cred">' + t('home.cred') + '</figcaption>' +
        '<a class="hm-btn hm-btn-claro hm-fig-btn" href="#mapa">' + t('home.btnZonas') + '</a></figure>' +
      '</div></section>' +
      '<footer class="hm-pie"><div class="hm-pie-grid">' +
        '<div><p class="hm-marca"><i class="hm-punto"></i>RADAR BCS</p>' +
        '<p class="hm-pie-desc">' + t('home.pieDesc') + '</p></div>' +
        '<nav aria-label="' + t('home.piePag') + '"><p class="hm-mono hm-negro">' + t('home.pantallas') + '</p>' +
        '<a href="#inicio">' + t('nav.inicio') + '</a><a href="#mapa">' + t('nav.mapa') + '</a><a href="#ficha/calor">' + t('home.fichas') + '</a><a href="#acciones">' + t('nav.acciones') + '</a></nav>' +
      '</div><p class="hm-mono hm-copy">' + t('home.copy') + '<br>' + t('html.ia') + '</p></footer>' +
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
