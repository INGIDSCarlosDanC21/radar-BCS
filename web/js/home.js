/* Pantalla Inicio (diseño Figma "Home"), solo con datos de indicadores.json.
   Todo texto de cifras sale de window.RB (reglas.js). ES5, sin build. */
(function () {
  'use strict';
  var RB = (typeof window !== 'undefined' && window.RB) ||
    (typeof require !== 'undefined' ? require('./reglas.js') : null);
  var T = (typeof window !== 'undefined' && window.RBT) ||
    (typeof require !== 'undefined' ? require('./textos.js') : null);
  /* El cielo ahora (cielo.js, #144 fase 2). Sin cielo.js, Inicio queda como en la fase 1. */
  var CL = (typeof window !== 'undefined' && window.RBCielo) ||
    (typeof require !== 'undefined' ? require('./cielo.js') : null);
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
  /* Valores cortos para las cajas de la tarjeta principal, como en Figma ("Mann-Kendall", "NASA POWER").
     El nombre completo sigue en la línea "Fuente:" de la tarjeta y en la ficha. */
  function cortoMetodo(m) {
    var s = String(m || '');
    return /Mann-Kendall/i.test(s) ? 'Mann-Kendall' : s.split(' + ')[0];
  }
  function cortoFuente(i) {
    return cortoDataset(i).split(/\s*[(,]|\s+(Monthly|Mascon)\b/)[0];
  }
  function etq(i) {
    var e = etiqueta(i);
    return '<span class="hm-etq hm-etq-' + e[1] + '">' + esc(e[0]) + '</span>';
  }

  function dato(k, v) {
    return '<div class="hm-dato"><span class="hm-dato-k">' + esc(k) + '</span><span class="hm-dato-v">' + esc(v) + '</span></div>';
  }

  /* Las 4 tarjetas de "¿Qué cambia?" son iguales: mismo tamaño y mismos datos (pedido de UI/UX, 2026-11-15).
     Cifra, p-valor, estado, primera frase de la limitación, periodo y fuente; el detalle completo está en la ficha. */
  function nota(i) {
    if (!i.limitacion) return '';
    var s = String(T.d(i, 'limitacion')), k = s.indexOf('. ');
    return k > 0 ? s.slice(0, k + 1) : s;
  }
  function tarjeta(i) {
    var c = RB.textoCambio(i), p = pTxt(i), f = i.fuente || {}, n = nota(i);
    return '<article class="hm-peque hm-tarjeta" data-indicador="' + esc(i.id) + '">' +
      '<div class="hm-barra" aria-hidden="true"></div>' +
      '<div class="hm-peq-cab"><h3 class="hm-t-peq">' + esc(i.id === 'calor' ? t('home.enLaPaz', { t: tit(i) }) : tit(i)) + '</h3>' +
      '<span class="hm-ico-circ hm-ico-chico" aria-hidden="true">' + RB.icono(i.id) + '</span></div>' +
      '<div class="hm-peq-val"><p class="hm-cifra ' + esc(c.clase) + '">' + esc(c.texto) + '</p>' +
      (p ? '<span class="hm-mono hm-p">' + esc(p) + '</span>' : '') + '</div>' +
      '<p class="hm-linea">' + etq(i) + '</p>' +
      (n ? '<p class="hm-peq">' + esc(n) + '</p>' : '') +
      '<div class="hm-datos hm-datos-2">' +
        (f.periodo ? dato(t('home.dPeriodo'), f.periodo) : '') + dato(t('home.dFuente'), cortoFuente(i)) +
      '</div>' +
      '<p class="fuente hm-fuente">' + esc(t('gen.fuente', { f: RB.textoFuente(i) })) + '</p>' +
      '<a class="hm-enlace" href="#ficha/' + esc(i.id) + '">' + esc(t('home.verFichaDe', { t: String(tit(i)).toLowerCase() })) + '</a></article>';
  }

  function html(datos) {
    var h = '<div class="hm">' +
      '<section class="hm-hero" aria-labelledby="hm-h1">' +
        '<div class="hm-hero-img" aria-hidden="true"></div>' +
        '<div class="hm-hero-cont">' +
          '<h1 id="hm-h1">' + t('home.h1') + '</h1>' +
          '<p class="hm-sub">' + t('home.sub') + '</p>' +
          '<div class="hm-botones"><a class="hm-btn hm-btn-claro" href="#mapa">' + t('home.btnMapa') + '</a>' +
          '<a class="hm-btn hm-btn-oscuro" href="#acciones">' + t('home.btnAcc') + '</a></div>' +
        '</div></section>' +
      // Solo el título, a pedido de UI/UX (Ehileen, 2026-11-15). La fuente sigue en cada tarjeta.
      '<section class="hm-sec" aria-labelledby="hm-h2"><div class="hm-sec-cab"><h2 id="hm-h2">' + t('home.h2') + '</h2></div>' +
      '<div class="hm-cuatro">';
    ['calor', 'vegetacion', 'lluvia', 'agua'].forEach(function (id) {
      var i = ind(datos, id);
      if (i) h += tarjeta(i);
    });
    h += '</div>' +
      '</section>' +
      (CL ? CL.marcoSeccion() : '') +
      '<section class="hm-sec hm-sec-mapa" aria-labelledby="hm-h3"><div class="hm-marco">' +
        '<div class="hm-marco-cab"><h2 id="hm-h3">' + t('home.hMapa') + '</h2>' +
        '<p class="hm-mono hm-insignia"><i class="hm-punto" aria-hidden="true"></i>' + t(CL ? 'cielo.insignia' : 'home.insignia') + '</p></div>' +
        '<figure class="hm-fig' + (CL ? ' cl-fig' : '') + '">' + (CL ? CL.marcoMapa(t('home.alt')) :
          '<img src="img/bcs-modis-2025-04-20-600.jpg" srcset="img/bcs-modis-2025-04-20-600.jpg 600w, img/bcs-modis-2025-04-20.jpg 1200w" sizes="(min-width: 1024px) 1216px, 100vw" width="1200" height="1060" alt="' + esc(t('home.alt')) + '" loading="lazy">') +
        '<figcaption class="hm-cred">' + t(CL ? 'cielo.cred' : 'home.cred') + '</figcaption></figure>' +
      '</div></section>' +
      // Pie sencillo (pedido de UI/UX, 2026-11-15): sin lista de pantallas ni enlaces al repositorio.
      // Las fuentes y el uso de IA están documentados en docs/FUENTES-Y-IA.md (regla 6).
      '<footer class="hm-pie"><div class="hm-pie-grid">' +
        '<div><p class="hm-marca"><i class="hm-punto"></i>RADAR BCS</p>' +
        '<p class="hm-pie-desc">' + t('home.pieDesc') + '</p></div>' +
      '</div><div class="hm-pie-barra"><p class="hm-mono hm-copy">' + t('home.copy') + '</p></div></footer>' +
      '</div>';
    return h;
  }

  function render(main, datos) {
    main.innerHTML = html(datos);
    if (CL && typeof window !== 'undefined') CL.cargar(main);
  }

  var RBHome = { html: html, render: render };
  if (typeof window !== 'undefined') window.RBHome = RBHome;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBHome;
})();
