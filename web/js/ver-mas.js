/* "Ver más": recorta a 3 líneas los textos largos (más de 4 líneas en pantalla) y pone un botón para ver el resto.
   Plan: docs/PLAN-VER-MAS.md. Menos scroll sin editar las pantallas: observa <main> y actúa sobre cualquier párrafo, lista o definición
   de 130 caracteres o más. El texto completo sigue en la página (se puede buscar y lo lee un lector de pantalla).
   Se excluye por contenido (seguridad, atribución, licencias, IA), por contenedor (pie, menús, mapas, alertas) y a mano con data-vm="no".
   Otro límite de líneas: data-vm-lineas="2". Incluye el botón flotante "Subir". ES5, sin build. */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);

  var MIN_CARACTERES = 130;   // textos más cortos no se tocan
  var LINEAS = 3;             // se deja en 3 líneas...
  var UMBRAL = 4;             // ...solo si ocupa más de 4
  var SUBIR_PANTALLAS = 2;    // el botón "Subir" aparece después de bajar más de 2 pantallas

  /* Nunca se pliega lo que es advertencia de seguridad, atribución, licencia o declaración de IA. */
  var EXCLUIR_TEXTO = /no es (un )?aviso oficial|no son avisos oficiales|not (an )?official|are not official|no son (estaciones|boyas|mediciones)|are not (stations|buoys|measurements)|AI-generated|generad[oa]s? con IA|con ayuda de IA|AI assistance|Open-Meteo|CC BY|Apache|OpenStreetMap|©|licen[cs]/i;
  var EXCLUIR_CONTENEDOR = 'footer, .pie, .hm-pie, .hm-pie-barra, .ag-pie, nav, .menu-sup, .menu-inf, .mas, [role="alert"], [role="status"], .cargando, .leaflet-container, .leaflet-control-attribution, .vm-btn, summary, button, h1, h2, h3, h4, [data-vm="no"]';

  var TX = {
    es: { 'vm.mas': 'Ver más', 'vm.menos': 'Ver menos', 'vm.subir': 'Subir', 'vm.subirAria': 'Volver al inicio de la página' },
    en: { 'vm.mas': 'See more', 'vm.menos': 'See less', 'vm.subir': 'Top', 'vm.subirAria': 'Back to the top of the page' }
  };
  if (T && T.DIC) ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });
  function t(k) { return T && T.t ? T.t(k) : TX.es[k]; }

  /* ---- Reglas puras (con pruebas) ---- */
  function elegibleTexto(texto) {
    var s = String(texto || '').replace(/\s+/g, ' ').trim();
    return s.length >= MIN_CARACTERES && !EXCLUIR_TEXTO.test(s);
  }
  function lineasDe(alto, interlineado) {
    if (!(alto > 0) || !(interlineado > 0)) return 0;
    return Math.round(alto / interlineado);
  }
  function debePlegar(lineas, umbral) { return lineas > (umbral || UMBRAL); }

  /* ---- DOM ---- */
  var contador = 0;
  var estado = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  function interlineado(el, doc) {
    var cs = doc.defaultView.getComputedStyle(el);
    var lh = parseFloat(cs.lineHeight);
    if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.4;
    return lh;
  }
  function esCandidato(el) {
    if (!elegibleTexto(el.textContent)) return false;
    if (el.closest && el.closest(EXCLUIR_CONTENEDOR)) return false;
    if (el.getAttribute('data-vm') === 'no') return false;
    return true;
  }
  function medir(el, doc) {
    var quitar = el.classList.contains('vm-clamp');
    if (quitar) el.classList.remove('vm-clamp');
    var n = lineasDe(el.getBoundingClientRect().height, interlineado(el, doc));
    if (quitar) el.classList.add('vm-clamp');
    return n;
  }
  function lineasMax(el) {
    var v = parseInt(el.getAttribute('data-vm-lineas'), 10);
    return v > 0 ? v : LINEAS;
  }
  function aplicar(el, doc) {
    var st = estado.get(el);
    if (!st) {
      var id = el.id || ('vm-' + (++contador));
      if (!el.id) el.id = id;
      var b = doc.createElement('button');
      b.type = 'button'; b.className = 'vm-btn'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', id);
      b.hidden = true;
      b.addEventListener('click', function () { alternar(el, b, doc); });
      el.parentNode.insertBefore(b, el.nextSibling);
      st = { boton: b, abierto: false };
      estado.set(el, st);
    }
    if (st.abierto) { st.boton.hidden = false; return; }
    var max = lineasMax(el);
    el.style.setProperty('--vm-lineas', String(max));
    var n = medir(el, doc);
    if (debePlegar(n, max === LINEAS ? UMBRAL : max + 1)) {
      el.classList.add('vm-clamp');
      st.boton.hidden = false;
      st.boton.textContent = t('vm.mas');
      st.boton.setAttribute('aria-expanded', 'false');
    } else {
      el.classList.remove('vm-clamp');
      st.boton.hidden = true;
    }
  }
  function alternar(el, b, doc) {
    var st = estado.get(el);
    st.abierto = !st.abierto;
    if (st.abierto) { el.classList.remove('vm-clamp'); b.textContent = t('vm.menos'); }
    else {
      el.classList.add('vm-clamp'); b.textContent = t('vm.mas');
      // Al plegar, la pantalla no salta: si el párrafo quedó arriba del borde visible, vuelve a mostrarse su inicio.
      var r = el.getBoundingClientRect();
      if (r.top < 0 && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }
    b.setAttribute('aria-expanded', String(st.abierto));
  }
  function revisar(doc) {
    var raiz = doc.getElementById('contenido') || doc.querySelector('main');
    if (!raiz || !estado) return 0;
    var lista = raiz.querySelectorAll('p, li, dd'), n = 0;
    for (var i = 0; i < lista.length; i++) {
      var el = lista[i];
      if (!esCandidato(el)) continue;
      aplicar(el, doc);
      if (el.classList.contains('vm-clamp')) n++;
    }
    return n;
  }

  /* ---- Botón "Subir" ---- */
  function iniciarSubir(doc) {
    var win = doc.defaultView, b = doc.createElement('button');
    b.type = 'button'; b.className = 'vm-subir'; b.hidden = true;
    b.setAttribute('aria-label', t('vm.subirAria'));
    b.innerHTML = '<span aria-hidden="true">↑</span><span class="vm-subir-t">' + t('vm.subir') + '</span>';
    b.addEventListener('click', function () {
      var reducido = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
      win.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' });
      var m = doc.getElementById('contenido'); if (m && m.focus) m.focus({ preventScroll: true });
    });
    doc.body.appendChild(b);
    var vivo = false;
    function ver() {
      var si = (win.pageYOffset || doc.documentElement.scrollTop) > SUBIR_PANTALLAS * win.innerHeight;
      if (si === vivo) return; vivo = si; b.hidden = !si;
    }
    win.addEventListener('scroll', ver, { passive: true });
    win.addEventListener('resize', ver);
    ver();
  }

  function iniciar(doc) {
    var win = doc.defaultView, pend = null;
    function pronto() {
      if (pend) return;
      pend = setTimeout(function () { pend = null; revisar(doc); }, 120);
    }
    var raiz = doc.getElementById('contenido') || doc.querySelector('main');
    if (raiz && typeof MutationObserver !== 'undefined') {
      new MutationObserver(function (ms) {
        for (var i = 0; i < ms.length; i++) {
          var a = ms[i].addedNodes;
          for (var j = 0; j < a.length; j++) if (!(a[j].classList && a[j].classList.contains('vm-btn'))) { pronto(); return; }
        }
      }).observe(raiz, { childList: true, subtree: true, characterData: true });
    }
    var ancho = win.innerWidth;
    win.addEventListener('resize', function () { if (win.innerWidth !== ancho) { ancho = win.innerWidth; pronto(); } });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(pronto);
    win.addEventListener('load', pronto);
    pronto();
    iniciarSubir(doc);
  }

  var RBVerMas = { elegibleTexto: elegibleTexto, lineasDe: lineasDe, debePlegar: debePlegar, revisar: revisar, iniciar: iniciar, TX: TX,
    MIN_CARACTERES: MIN_CARACTERES, LINEAS: LINEAS, UMBRAL: UMBRAL, EXCLUIR_TEXTO: EXCLUIR_TEXTO, EXCLUIR_CONTENEDOR: EXCLUIR_CONTENEDOR };
  if (typeof window !== 'undefined') {
    window.RBVerMas = RBVerMas;
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { iniciar(document); });
      else iniciar(document);
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = RBVerMas;
})();
