/* Login, Registro y cuenta en el encabezado (Supabase Auth).
   Sin build, sin módulos. Nunca guarda ni registra contraseñas. */
(function () {
  'use strict';

  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.min.js';
  var SDK_SRI = 'sha384-UagCvVPT5XXA0Hx+nJYUAGBFseHT9zBgpJMSebsAxl9lciTwbT+39j5VfRjdP5Tp';
  var cliente = null;      // cliente de Supabase, o null si no hay configuración
  var promesa = null;      // inicialización única
  var sesion = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cargarScript(src, integrity) {
    return new Promise(function (ok, fallo) {
      var s = document.createElement('script');
      s.src = src;
      if (integrity) { s.integrity = integrity; s.crossOrigin = 'anonymous'; }
      s.onload = function () { ok(); };
      s.onerror = function () { fallo(new Error('no cargó')); };
      document.head.appendChild(s);
    });
  }

  /* Carga config.local.js y el SDK una sola vez. Resuelve al cliente o a null. */
  function iniciar() {
    if (promesa) return promesa;
    promesa = cargarScript('js/config.local.js').catch(function () {}).then(function () {
      var c = window.RB_CONFIG;
      if (!c || !c.supabaseUrl || !c.supabaseKey) return null;
      return cargarScript(SDK_URL, SDK_SRI).then(function () {
        if (!window.supabase || !window.supabase.createClient) return null;
        cliente = window.supabase.createClient(c.supabaseUrl, c.supabaseKey);
        cliente.auth.onAuthStateChange(function (_evento, s) {
          sesion = s || null;
          pintarCuenta();
        });
        return cliente.auth.getSession().then(function (r) {
          sesion = (r && r.data && r.data.session) || null;
          return cliente;
        });
      }).catch(function () { return null; });
    });
    return promesa;
  }

  /* ---------- Cuenta en el encabezado ---------- */
  function pintarCuenta() {
    var cont = document.getElementById('cuenta');
    if (!cont) return;
    if (cliente && sesion && sesion.user) {
      var u = sesion.user;
      var nombre = (u.user_metadata && u.user_metadata.nombre_completo) || u.email || '';
      cont.innerHTML = '<span class="cuenta-nombre">Hola, ' + esc(nombre) + '</span>' +
        '<button type="button" id="cuenta-salir">Cerrar sesión</button>';
      document.getElementById('cuenta-salir').addEventListener('click', function () {
        cliente.auth.signOut().then(function () { sesion = null; pintarCuenta(); });
      });
    } else {
      cont.innerHTML = '<a href="#login">Iniciar sesión</a><a href="#registro">Registro</a>';
    }
  }

  /* ---------- Textos de error ---------- */
  function traducir(err) {
    var cod = (err && (err.code || '')) + '', msg = ((err && err.message) || '') + '';
    if (cod === 'invalid_credentials' || /invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
    if (cod === 'email_not_confirmed' || /email not confirmed/i.test(msg)) return 'Falta confirmar tu correo. Revisa tu bandeja de entrada.';
    if (cod === 'weak_password' || /password/i.test(msg) && /(short|weak|least)/i.test(msg)) return 'La contraseña es muy débil. Usa al menos 8 caracteres.';
    if (cod === 'over_request_rate_limit' || cod === 'over_email_send_rate_limit' || (err && err.status === 429)) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    if ((err && /Retryable|Fetch/i.test(err.name || '')) || /fetch|network/i.test(msg)) return 'No hay conexión con el servicio. Revisa tu internet e inténtalo de nuevo.';
    return 'No se pudo completar la acción. Inténtalo de nuevo.';
  }

  /* ---------- Piezas de HTML ---------- */
  var ICONO_VOLVER = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5"/></svg>';
  var ICONO_OJO = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z"/><circle cx="10" cy="10" r="2.5"/></svg>';

  function panelImagen() {
    return '<section class="acc-img" aria-label="Imagen satelital de Baja California Sur">' +
      '<div class="acc-etq-caja"><span class="acc-etq">IMAGEN SATELITAL NASA</span></div>' +
      '<div class="acc-pie-img">' +
      '<h2 class="acc-bienv">Bienvenidos a Radar BCS</h2>' +
      // TEXTO PENDIENTE UI/UX (#11): en Registro el diseño trae texto de relleno; se usa el del Login.
      '<p class="acc-bajada">Vigilancia satelital y conservación de nuestros ecosistemas marinos y terrestres.</p>' +
      '<div class="acc-barras" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<p class="acc-credito">Imagen: NASA EOSDIS GIBS, MODIS Terra, 20 abr 2025 (CC0)</p>' +
      '</div></section>';
  }

  function barraSuperior() {
    return '<div class="acc-barra"><a class="acc-volver" href="#inicio" aria-label="Volver al inicio">' + ICONO_VOLVER + '</a>' +
      // Sin logo oficial aún (issue #12 de UI/UX): texto.
      '<span class="acc-logo">RADAR BCS</span></div>';
  }

  function campo(id, etiqueta, tipo, auto, ph, extra) {
    var pw = tipo === 'password';
    return '<div class="acc-campo"><div class="acc-fila"><label for="' + id + '">' + etiqueta + '</label>' + (extra || '') + '</div>' +
      '<div class="acc-entrada' + (pw ? ' acc-pw' : '') + '"><input id="' + id + '" name="' + id + '" type="' + tipo + '" autocomplete="' + auto + '" placeholder="' + ph + '" required>' +
      (pw ? '<button type="button" class="acc-ojo" data-ojo="' + id + '" aria-label="Mostrar contraseña" aria-pressed="false">' + ICONO_OJO + '</button>' : '') +
      '</div></div>';
  }

  var SUB = 'Plataforma de Monitoreo Ambiental y Costero de Baja California Sur. Accede a tu cuenta para continuar.';

  function htmlLogin() {
    return '<div class="acc-pagina"><div class="acc-tarjeta">' + panelImagen() +
      '<section class="acc-form-caja" aria-labelledby="acc-t">' + barraSuperior() +
      '<div class="acc-centro"><h1 class="acc-h1" id="acc-t">Inicia sesión</h1>' +
      '<p class="acc-sub">' + SUB + '</p>' +
      '<form class="acc-form" id="acc-form" novalidate>' +
      campo('acc-correo', 'Correo electrónico', 'email', 'email', 'tu@email.com') +
      campo('acc-clave', 'Contraseña', 'password', 'current-password', '••••••••',
        '<button type="button" class="acc-olvido" id="acc-olvido">¿Olvidaste tu contraseña?</button>') +
      '<p class="acc-msg" id="acc-msg" hidden></p>' +
      '<button type="submit" class="acc-btn">Iniciar sesión</button></form>' +
      '<p class="acc-cambio">¿No tienes cuenta? <a href="#registro">Regístrate</a></p></div>' +
      '<p class="acc-legal">Sistema de Acceso Seguro © 2026 Radar BCS. Todos los derechos reservados.</p>' +
      '</section></div></div>';
  }

  function htmlRegistro() {
    return '<div class="acc-pagina acc-reg"><div class="acc-tarjeta">' + panelImagen() +
      '<section class="acc-form-caja" aria-labelledby="acc-t">' +
      '<div>' + barraSuperior() +
      '<div class="acc-centro"><h1 class="acc-h1" id="acc-t">Crear una cuenta</h1>' +
      // TEXTO PENDIENTE UI/UX (#11): el diseño trae "Ingresa texto"; se usa el subtítulo del Login.
      '<p class="acc-sub">' + SUB + '</p>' +
      '<form class="acc-form" id="acc-form" novalidate>' +
      campo('acc-nombre', 'Nombre completo', 'text', 'name', 'Ej. Armando Castro') +
      campo('acc-correo', 'Correo electrónico', 'email', 'email', 'tu@email.com') +
      campo('acc-clave', 'Contraseña', 'password', 'new-password', '••••••••') +
      campo('acc-clave2', 'Confirmar contraseña', 'password', 'new-password', '••••••••') +
      '<p class="acc-msg" id="acc-msg" hidden></p>' +
      '<button type="submit" class="acc-btn">Registrarse</button></form>' +
      '<p class="acc-cambio">¿Ya tienes cuenta? <a href="#login">Inicia sesión</a></p></div></div>' +
      // TEXTO PENDIENTE UI/UX (#11): las páginas de Términos y Privacidad no existen; van sin enlace.
      '<p class="acc-legal">Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.</p>' +
      '</section></div></div>';
  }

  /* ---------- Comportamiento ---------- */
  function mostrar(tipo, html) {
    var m = document.getElementById('acc-msg');
    if (!m) return;
    m.className = 'acc-msg ' + (tipo === 'err' ? 'acc-err' : 'acc-info');
    m.setAttribute('role', tipo === 'err' ? 'alert' : 'status');
    m.innerHTML = html;
    m.hidden = false;
  }
  var AVISO_SIN_CONFIG = 'Las cuentas aún no están activas en esta versión. Puedes usar Radar BCS sin cuenta. <a href="#inicio">Ir al inicio</a>';

  function valor(id) { var e = document.getElementById(id); return e ? e.value : ''; }
  function ocupado(b, v) { if (b) { b.disabled = v; } }

  function enviarLogin(btn) {
    var correo = valor('acc-correo').trim(), clave = valor('acc-clave');
    if (!correo || !clave) { mostrar('err', 'Escribe tu correo y tu contraseña.'); return; }
    ocupado(btn, true);
    iniciar().then(function (c) {
      if (!c) { mostrar('info', AVISO_SIN_CONFIG); return; }
      return c.auth.signInWithPassword({ email: correo, password: clave }).then(function (r) {
        if (r.error) { mostrar('err', esc(traducir(r.error))); return; }
        location.hash = '#inicio';
      });
    }).catch(function (e) { mostrar('err', esc(traducir(e))); }).then(function () { ocupado(btn, false); });
  }

  function olvido() {
    var correo = valor('acc-correo').trim();
    if (!correo) { mostrar('err', 'Escribe tu correo en el campo de arriba y vuelve a pulsar el enlace.'); return; }
    iniciar().then(function (c) {
      if (!c) { mostrar('info', AVISO_SIN_CONFIG); return; }
      return c.auth.resetPasswordForEmail(correo, { redirectTo: location.origin + location.pathname + '#login' }).then(function (r) {
        if (r.error && (r.error.status === 429 || /Retryable|Fetch/i.test(r.error.name || ''))) { mostrar('err', esc(traducir(r.error))); return; }
        mostrar('info', 'Si el correo existe, te enviamos un enlace.');
      });
    }).catch(function (e) { mostrar('err', esc(traducir(e))); });
  }

  function enviarRegistro(btn) {
    var nombre = valor('acc-nombre').trim(), correo = valor('acc-correo').trim();
    var clave = valor('acc-clave'), clave2 = valor('acc-clave2');
    if (!nombre) { mostrar('err', 'Escribe tu nombre completo.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { mostrar('err', 'Escribe un correo válido.'); return; }
    if (clave.length < 8) { mostrar('err', 'La contraseña debe tener al menos 8 caracteres.'); return; }
    if (clave !== clave2) { mostrar('err', 'Las contraseñas no coinciden.'); return; }
    ocupado(btn, true);
    iniciar().then(function (c) {
      if (!c) { mostrar('info', AVISO_SIN_CONFIG); return; }
      return c.auth.signUp({
        email: correo, password: clave,
        options: { data: { nombre_completo: nombre }, emailRedirectTo: location.origin + location.pathname + '#login' }
      }).then(function (r) {
        if (r.error) { mostrar('err', esc(traducir(r.error))); return; }
        if (r.data && r.data.session) { location.hash = '#inicio'; return; }
        mostrar('info', 'Revisa tu correo para confirmar la cuenta');
      });
    }).catch(function (e) { mostrar('err', esc(traducir(e))); }).then(function () { ocupado(btn, false); });
  }

  function render(main, modo) {
    var reg = modo === 'registro';
    main.innerHTML = reg ? htmlRegistro() : htmlLogin();
    var form = document.getElementById('acc-form');
    var btn = form.querySelector('button[type=submit]');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (reg) enviarRegistro(btn); else enviarLogin(btn);
    });
    Array.prototype.forEach.call(form.querySelectorAll('[data-ojo]'), function (b) {
      b.addEventListener('click', function () {
        var inp = document.getElementById(b.getAttribute('data-ojo'));
        var ver = inp.type === 'password';
        inp.type = ver ? 'text' : 'password';
        b.setAttribute('aria-pressed', ver ? 'true' : 'false');
        b.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
      });
    });
    var o = document.getElementById('acc-olvido');
    if (o) o.addEventListener('click', olvido);
    iniciar();
  }

  window.RBAcceso = { render: render, pintarCuenta: pintarCuenta };
  pintarCuenta();
  iniciar().then(pintarCuenta);
})();
