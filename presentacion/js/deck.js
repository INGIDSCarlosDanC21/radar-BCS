/* Radar BCS · presentación HTML — arranque y movimiento.
   Script clásico (sin módulos ni fetch) para que funcione con doble clic (file://).
   Requiere, antes de este archivo: vendor/reveal/reveal.js, vendor/reveal/plugin/notes/notes.js,
   vendor/anime/anime.min.js.

   Teclas: flechas/espacio = avanzar · S = notas del orador (Reveal) · F = pantalla completa
           T = alterna cronómetro de la parte / global · R = reinicia cronómetros
   Globales para las partes: window.Deck.entrar(el), .contador(el, hasta, decimales, ms), .sello(el) */
(function () {
  'use strict';

  // Estructura FIJA del pitch (no cambiar sin avisar al equipo). Tiempos en segundos.
  var PARTES = [
    { n: 1, nombre: 'EL GANCHO', objetivo: 'Captar atención y situar el problema', orador: 'Ehileen', color: '#51d8e8', seg: 50 },
    { n: 2, nombre: 'PROBLEMA Y RETO', objetivo: 'Conectar el dolor real con el desafío', orador: 'Roberto', color: '#7ed99e', seg: 70 },
    { n: 3, nombre: 'SOLUCIÓN + DATOS DE LA NASA', objetivo: 'Presentar proyecto y validar su base científica', orador: 'Carlos', color: '#90f1ff', seg: 70 },
    { n: 4, nombre: 'DEMOSTRACIÓN', objetivo: 'Mostrarlo', orador: 'Diego', color: '#8fb4ff', seg: 150 },
    { n: 5, nombre: 'IMPACTO Y ESCALABILIDAD', objetivo: 'Futuro fuera del hackatón', orador: 'Integrante 6', color: '#9af6b8', seg: 70 },
    { n: 6, nombre: 'CIERRE', objetivo: 'Frase memorable', orador: 'Luca', color: '#c9d6ea', seg: 40 }
  ];
  var TOTAL = PARTES.reduce(function (s, p) { return s + p.seg; }, 0); // 450 s = 7:30

  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SUAVE = 'cubicBezier(0.16, 1, 0.3, 1)'; // mismo SUAVE del tráiler
  document.documentElement.classList.add('js-anim');

  // ---------- HUD ----------
  var hud = document.createElement('div');
  hud.className = 'hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML =
    '<div class="hud-progreso">' + PARTES.map(function () { return '<div class="hud-seg"><i></i></div>'; }).join('') + '</div>' +
    '<div class="hud-chip"></div>' +
    '<div class="hud-objetivo"></div>' +
    '<div class="hud-orador"><b></b><span></span></div>' +
    '<div class="hud-reloj"><small></small><span></span></div>';
  document.body.appendChild(hud);
  var el = {
    segs: hud.querySelectorAll('.hud-seg'),
    chip: hud.querySelector('.hud-chip'),
    obj: hud.querySelector('.hud-objetivo'),
    punto: hud.querySelector('.hud-orador b'),
    orador: hud.querySelector('.hud-orador span'),
    reloj: hud.querySelector('.hud-reloj'),
    relojEtq: hud.querySelector('.hud-reloj small'),
    relojTxt: hud.querySelector('.hud-reloj span')
  };

  function parteDe(section) {
    var s = section;
    while (s && s.tagName === 'SECTION') {
      if (s.dataset.parte) return Math.min(6, Math.max(1, parseInt(s.dataset.parte, 10) || 1));
      s = s.parentElement;
    }
    return 1;
  }

  var parteActual = 0;
  function pintarHud(section) {
    var n = parteDe(section);
    var p = PARTES[n - 1];
    // Fracción de diapositivas vistas dentro de la parte actual
    var deParte = Array.prototype.filter.call(document.querySelectorAll('.reveal .slides section'), function (s) {
      return !s.querySelector('section') && parteDe(s) === n;
    });
    var idx = deParte.indexOf(section);
    var frac = deParte.length ? (idx + 1) / deParte.length : 1;
    for (var i = 0; i < el.segs.length; i++) {
      el.segs[i].classList.toggle('hecho', i < n - 1);
      el.segs[i].firstChild.style.width = i < n - 1 ? '' : (i === n - 1 ? (frac * 100) + '%' : '0');
    }
    el.chip.textContent = n + '/6 · ' + p.nombre;
    el.obj.textContent = p.objetivo;
    el.orador.textContent = p.orador.toLowerCase();
    el.punto.style.background = p.color;
    el.punto.style.color = p.color;
    if (n !== parteActual) { entrarParte(n); parteActual = n; }
    pintarReloj();
  }

  // Escala propia (Reveal va con disableLayout). En pantallas 16:9 o más anchas cabe el lienzo
  // completo de 1280x720. En pantallas más angostas (proyector 4:3, 800x600) se ajusta la ZONA
  // SEGURA de 960x720 al ancho y se recortan los lados (solo decoración). El HUD usa la misma escala.
  var escala = 1;
  function escalar() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = (vw / vh >= 1280 / 720) ? vh / 720 : Math.min(vw / 1000, vh / 720); // 20 px de aire por lado
    escala = Math.min(1.5, Math.max(0.3, s));
    var t = 'translate(-50%, -50%) scale(' + escala + ')';
    var slides = document.querySelector('.reveal .slides');
    if (slides) slides.style.transform = t;
    hud.style.transform = t;
    document.documentElement.style.setProperty('--p-escala', escala);
  }
  escalar();

  // ---------- Cronómetros ----------
  var acumulado = PARTES.map(function () { return 0; }); // ms por parte
  var inicioTramo = Date.now();
  var inicioGlobal = Date.now();
  var verGlobal = false;

  function entrarParte(n) {
    var ahora = Date.now();
    if (parteActual) acumulado[parteActual - 1] += ahora - inicioTramo;
    inicioTramo = ahora;
  }
  function msParte(n) { return acumulado[n - 1] + (n === parteActual ? Date.now() - inicioTramo : 0); }
  function mmss(ms) {
    var t = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(t / 60), s = t % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function pintarReloj() {
    if (!parteActual) return;
    var p = PARTES[parteActual - 1];
    var usado, meta;
    if (verGlobal) { usado = Date.now() - inicioGlobal; meta = TOTAL * 1000; el.relojEtq.textContent = 'global'; }
    else { usado = msParte(parteActual); meta = p.seg * 1000; el.relojEtq.textContent = 'parte'; }
    el.relojTxt.textContent = mmss(usado) + ' / ' + mmss(meta);
    el.reloj.classList.toggle('pasado', usado > meta);
  }
  function reiniciar() {
    acumulado = PARTES.map(function () { return 0; });
    inicioTramo = inicioGlobal = Date.now();
    pintarReloj();
  }
  setInterval(pintarReloj, 250);

  // ---------- Movimiento (anime.js) ----------
  // Una sola entrada por contenedor: si se vuelve a llamar, se cancela la anterior.
  // Orden: data-entra="lider" primero, luego los demás en orden del documento;
  // data-entra="decor" solo hace fade. Escalonado 30–80 ms con variación determinista.
  function entrar(contenedor) {
    if (!contenedor || !window.anime) return;
    var piezas = Array.prototype.slice.call(contenedor.querySelectorAll('[data-entra]'));
    if (!piezas.length) return;
    if (contenedor._animacion) contenedor._animacion.pause();
    anime.remove(piezas);
    var lideres = piezas.filter(function (p) { return p.dataset.entra === 'lider'; });
    var resto = piezas.filter(function (p) { return p.dataset.entra !== 'lider'; });
    var orden = lideres.concat(resto);

    if (reducido) {
      contenedor._animacion = anime({ targets: orden, opacity: [0, 1], duration: 200, easing: 'linear' });
      return contenedor._animacion;
    }
    var retrasos = [], acum = 0;
    orden.forEach(function (p, i) {
      retrasos.push(acum);
      acum += 30 + Math.round(50 * (0.5 + 0.5 * Math.sin(i * 2.399 + 1))); // 30–80 ms
    });
    var tl = anime.timeline({ autoplay: true });
    orden.forEach(function (p, i) {
      var decor = p.dataset.entra === 'decor';
      var esLider = p.dataset.entra === 'lider';
      tl.add(decor
        ? { targets: p, opacity: [0, 1], duration: 900, easing: 'linear' }
        : { targets: p, opacity: [0, 1], translateY: [esLider ? 26 : 16, 0], duration: esLider ? 760 : 620, easing: SUAVE },
        retrasos[i] + 60);
    });
    contenedor._animacion = tl;
    return tl;
  }

  // Cifra que sube de 0 a "hasta". Formato es-MX. Con movimiento reducido pone el valor final.
  function contador(nodo, hasta, decimales, ms) {
    if (!nodo) return;
    decimales = decimales || 0;
    var fmt = new Intl.NumberFormat('es-MX', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    if (reducido || !window.anime) { nodo.textContent = fmt.format(hasta); return; }
    var o = { v: 0 };
    nodo.textContent = fmt.format(0);
    return anime({
      targets: o, v: hasta, duration: ms || 1400, easing: 'cubicBezier(0.22, 1, 0.36, 1)',
      update: function () { nodo.textContent = fmt.format(o.v); },
      complete: function () { nodo.textContent = fmt.format(hasta); }
    });
  }

  // Sello "p < 0.001": cae con escala y giro, luego un pulso de anillo.
  function sello(nodo) {
    if (!nodo) return;
    if (reducido || !window.anime) { nodo.style.opacity = 1; return; }
    anime.remove(nodo);
    return anime.timeline()
      .add({ targets: nodo, opacity: [0, 1], scale: [1.8, 1], rotate: ['-14deg', '-4deg'], duration: 420, easing: 'cubicBezier(0.3, 1.4, 0.5, 1)' })
      .add({ targets: nodo, boxShadow: ['0 0 0 0 rgba(126,217,158,0.55)', '0 0 0 22px rgba(126,217,158,0)'], duration: 700, easing: 'easeOutQuad',
        complete: function () { nodo.style.boxShadow = 'none'; } });
  }

  // Al mostrar una sección: entrada, contadores (data-contador="12.5" data-decimales="1") y sellos (.sello[data-sello]).
  function alMostrar(section) {
    if (!section) return;
    pintarHud(section);
    if (section.hasAttribute('data-animacion')) {
      entrar(section);
      section.classList.add('visto');
    }
    Array.prototype.forEach.call(section.querySelectorAll('[data-contador]'), function (c) {
      contador(c, parseFloat(c.dataset.contador), parseInt(c.dataset.decimales || '0', 10), parseInt(c.dataset.ms || '1400', 10));
    });
    Array.prototype.forEach.call(section.querySelectorAll('[data-sello]'), function (s) {
      s.style.opacity = 0;
      setTimeout(function () { sello(s); }, parseInt(s.dataset.sello || '600', 10));
    });
  }

  // ---------- Viento: partículas ligeras en canvas ----------
  function viento() {
    var cv = document.querySelector('.fondo-viento');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w, h, lineas = [];
    function medir() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function nueva(azar) {
      return {
        x: azar ? Math.random() * w : -200 * Math.random(),
        y: Math.random() * h,
        largo: 40 + Math.random() * 140,
        vel: 0.35 + Math.random() * 0.9,
        fase: Math.random() * 6.28,
        alfa: 0.04 + Math.random() * 0.1
      };
    }
    medir();
    for (var i = 0; i < 46; i++) lineas.push(nueva(true));
    function dibujar(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (var i = 0; i < lineas.length; i++) {
        var l = lineas[i];
        var y = l.y + Math.sin(t * 0.0004 + l.fase) * 10;
        var g = ctx.createLinearGradient(l.x, 0, l.x + l.largo, 0);
        g.addColorStop(0, 'rgba(144,241,255,0)');
        g.addColorStop(1, 'rgba(144,241,255,' + l.alfa + ')');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(l.x, y); ctx.lineTo(l.x + l.largo, y - l.largo * 0.04); ctx.stroke();
        if (!reducido) { l.x += l.vel; if (l.x > w + 20) lineas[i] = nueva(false); }
      }
    }
    window.addEventListener('resize', function () { medir(); dibujar(0); });
    if (reducido) { dibujar(0); return; }
    function cuadro(t) { if (!document.hidden) dibujar(t); requestAnimationFrame(cuadro); }
    requestAnimationFrame(cuadro);
  }

  // ---------- Tráiler (botón [data-reproducir] o tecla P) ----------
  function alternarVideo(seccion) {
    var v = seccion && seccion.querySelector('video[data-trailer]');
    if (!v) return;
    if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-reproducir]');
    if (b) alternarVideo(b.closest('section'));
  });

  // ---------- Reveal ----------
  Reveal.initialize({
    width: 1280, height: 720, margin: 0, minScale: 0.3, maxScale: 1.5,
    center: false, disableLayout: true, hash: true, controls: false, progress: false, slideNumber: false,
    transition: 'none', backgroundTransition: 'none',
    plugins: [RevealNotes],
    keyboard: {
      84: function () { verGlobal = !verGlobal; pintarReloj(); },        // T
      82: function () { reiniciar(); },                                   // R
      80: function () { alternarVideo(Reveal.getCurrentSlide()); }       // P (tráiler)
      // S (notas) y F (pantalla completa) ya los trae Reveal.
    }
  }).then(function () {
    escalar();
    alMostrar(Reveal.getCurrentSlide());
  });
  window.addEventListener('resize', escalar);
  Reveal.on('slidechanged', function (e) {
    if (e.previousSlide) { var vv = e.previousSlide.querySelector('video[data-trailer]'); if (vv) vv.pause(); }
    alMostrar(e.currentSlide);
  });

  viento();

  window.Deck = { PARTES: PARTES, escala: function () { return escala; }, entrar: entrar, contador: contador, sello: sello };
})();
