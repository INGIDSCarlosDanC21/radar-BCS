/* Datos en vivo para Pesca y Avisos (docs/PLAN-PESCA-AVISOS.md). ES5, sin build.
   - Mar: Open-Meteo Marine (modelo de ~9 km, no boyas), CC BY 4.0. Viento, lluvia (código WMO) y UV: Open-Meteo Forecast.
   - Una llamada de cada una para los 8 puertos, con ayer, hoy y 2 días más (96 horas). Caché de 10 min en sessionStorage.
   - Nunca se inventa un dato: un valor que falta queda en null y la pantalla dice "sin dato".
   Puntos de mar elegidos y comprobados el 2026-11-15: la rejilla marina es de ~9 km y dos puntos de prueba cayeron en tierra. */
(function () {
  'use strict';
  var ZONA = 'America/Mazatlan';   // hora de La Paz, B.C.S.
  var CACHE_CLAVE = 'rb-vivo-mar-v1', CACHE_MS = 10 * 60 * 1000, ESPERA_MS = 10000;
  var MAR = 'https://marine-api.open-meteo.com/v1/marine';
  var PRON = 'https://api.open-meteo.com/v1/forecast';

  /* mar = punto de agua para oleaje y viento; pueblo = el puerto para lluvia y UV (GeoNames, vía geocodificación de Open-Meteo). */
  var PUERTOS = [
    { id: 'bahiamagdalena', nombre: 'Bahía Magdalena', costa: 'pacifico', mar: [24.70, -112.30], pueblo: [24.789, -112.105] },
    { id: 'guerreronegro', nombre: 'Guerrero Negro', costa: 'pacifico', mar: [27.90, -114.45], pueblo: [27.960, -114.056] },
    { id: 'todossantos', nombre: 'Todos Santos', costa: 'pacifico', mar: [23.40, -110.35], pueblo: [23.447, -110.223] },
    { id: 'cabos', nombre: 'Cabo San Lucas', costa: 'cabo', mar: [22.85, -109.90], pueblo: [22.891, -109.912] },
    { id: 'lapaz', nombre: 'La Paz', costa: 'golfo', mar: [24.25, -110.35], pueblo: [24.142, -110.313] },
    { id: 'loreto', nombre: 'Loreto', costa: 'golfo', mar: [26.01, -111.25], pueblo: [26.012, -111.349] },
    { id: 'mulege', nombre: 'Mulegé', costa: 'golfo', mar: [26.90, -111.85], pueblo: [26.891, -111.983] },
    { id: 'santarosalia', nombre: 'Santa Rosalía', costa: 'golfo', mar: [27.34, -112.15], pueblo: [27.340, -112.267] }
  ];

  var VAR_MAR = 'wave_height,wave_period,wave_direction,swell_wave_height,sea_surface_temperature,ocean_current_velocity';
  var VAR_PRON = 'wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code,uv_index';

  function coords(f) { return PUERTOS.map(function (p) { return f(p); }); }
  function urlMar() {
    return MAR + '?latitude=' + coords(function (p) { return p.mar[0]; }).join(',') + '&longitude=' + coords(function (p) { return p.mar[1]; }).join(',') +
      '&hourly=' + VAR_MAR + '&past_days=1&forecast_days=3&timezone=' + encodeURIComponent(ZONA);
  }
  /* 16 puntos: los 8 de mar (viento sobre el agua) seguidos de los 8 pueblos (lluvia, tormenta y UV). */
  function urlPron() {
    var la = coords(function (p) { return p.mar[0]; }).concat(coords(function (p) { return p.pueblo[0]; }));
    var lo = coords(function (p) { return p.mar[1]; }).concat(coords(function (p) { return p.pueblo[1]; }));
    return PRON + '?latitude=' + la.join(',') + '&longitude=' + lo.join(',') + '&hourly=' + VAR_PRON +
      '&wind_speed_unit=kn&past_days=1&forecast_days=3&timezone=' + encodeURIComponent(ZONA);
  }

  function arr(x) { return Object.prototype.toString.call(x) === '[object Array]' ? x : (x ? [x] : []); }
  function serie(h, k, n) {
    var v = h && h[k];
    if (!v || v.length !== n) return null;
    return v.map(function (x) { return typeof x === 'number' ? x : null; });
  }
  /* Une las dos respuestas en {horas, puertos:[{...puerto, s:{ola, per, dir, swell, sst, corr, viento, rachas, vdir, codigo, uv}}]}.
     Devuelve null si no cuadra la cantidad de puntos o de horas. */
  function unir(mar, pron) {
    mar = arr(mar); pron = arr(pron);
    var n = PUERTOS.length;
    if (mar.length !== n || pron.length !== 2 * n) return null;
    var horas = mar[0] && mar[0].hourly && mar[0].hourly.time;
    if (!horas || !horas.length) return null;
    var H = horas.length;
    var res = PUERTOS.map(function (p, k) {
      var m = mar[k] && mar[k].hourly, v = pron[k] && pron[k].hourly, u = pron[n + k] && pron[n + k].hourly;
      return {
        id: p.id, nombre: p.nombre, costa: p.costa, mar: p.mar, pueblo: p.pueblo,
        s: {
          ola: serie(m, 'wave_height', H), per: serie(m, 'wave_period', H), dir: serie(m, 'wave_direction', H), swell: serie(m, 'swell_wave_height', H),
          sst: serie(m, 'sea_surface_temperature', H), corr: serie(m, 'ocean_current_velocity', H),
          viento: serie(v, 'wind_speed_10m', H), rachas: serie(v, 'wind_gusts_10m', H), vdir: serie(v, 'wind_direction_10m', H),
          codigo: serie(u, 'weather_code', H), uv: serie(u, 'uv_index', H)
        }
      };
    });
    return { horas: horas, puertos: res, zona: ZONA };
  }

  /* Índice de la hora actual dentro de datos.horas. ahoraLocal: 'YYYY-MM-DD HH:MM' en hora de La Paz (se pasa en las pruebas). */
  function ahoraLocal(fecha) {
    try {
      var d = fecha || new Date();
      return d.toLocaleString('sv-SE', { timeZone: ZONA }).slice(0, 16);
    } catch (e) { return null; }
  }
  function indiceAhora(horas, ahora) {
    var a = (ahora || ahoraLocal() || '').replace(' ', 'T').slice(0, 13) + ':00';
    var i = horas.indexOf(a);
    if (i >= 0) return i;
    // fuera de rango (reloj raro): la hora más cercana por orden de texto
    for (var k = 0; k < horas.length; k++) if (horas[k] >= a) return k;
    return horas.length - 1;
  }
  function fechaDe(hora) { return String(hora).slice(0, 10); }
  function horaDe(hora) { return String(hora).slice(11, 16); }
  function sumaDias(iso, n) {
    var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
  }

  function pedir(url, f, ms) {
    var abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var plazo = setTimeout(function () { if (abort) try { abort.abort(); } catch (e) {} }, ms);
    return f(url, abort ? { signal: abort.signal } : {}).then(function (r) {
      clearTimeout(plazo);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function (e) { clearTimeout(plazo); throw e; });
  }

  /* cargar({fetch, storage, ahora}) -> Promise({datos, cache:boolean, edadMs}). Rechaza si no hay red o los datos no cuadran. */
  function cargar(opc) {
    opc = opc || {};
    var f = opc.fetch || (typeof fetch !== 'undefined' ? fetch.bind(typeof window !== 'undefined' ? window : undefined) : null);
    var st = opc.storage !== undefined ? opc.storage : (typeof sessionStorage !== 'undefined' ? sessionStorage : null);
    var ahora = opc.ahoraMs != null ? opc.ahoraMs : Date.now();
    if (st) {
      try {
        var c = JSON.parse(st.getItem(CACHE_CLAVE) || 'null');
        if (c && c.t && ahora - c.t < CACHE_MS && c.datos && c.datos.horas) return Promise.resolve({ datos: c.datos, cache: true, edadMs: ahora - c.t });
      } catch (e) { /* sin caché */ }
    }
    if (!f) return Promise.reject(new Error('sin fetch'));
    // La web pinta dos veces al abrir: la segunda reutiliza la petición en curso (solo con el fetch real, no en pruebas).
    if (enVuelo && !opc.fetch) return enVuelo;
    var p = Promise.all([pedir(urlMar(), f, ESPERA_MS), pedir(urlPron(), f, ESPERA_MS)]).then(function (r) {
      var datos = unir(r[0], r[1]);
      if (!datos) throw new Error('respuesta incompleta');
      if (st) { try { st.setItem(CACHE_CLAVE, JSON.stringify({ t: ahora, datos: datos })); } catch (e) { /* cuota llena */ } }
      return { datos: datos, cache: false, edadMs: 0 };
    });
    if (!opc.fetch) { enVuelo = p; var libre = function () { if (enVuelo === p) enVuelo = null; }; p.then(libre, libre); }
    return p;
  }
  var enVuelo = null;

  var RBVivo = { PUERTOS: PUERTOS, ZONA: ZONA, urlMar: urlMar, urlPron: urlPron, unir: unir, cargar: cargar, indiceAhora: indiceAhora, ahoraLocal: ahoraLocal,
    fechaDe: fechaDe, horaDe: horaDe, sumaDias: sumaDias, CACHE_CLAVE: CACHE_CLAVE, CACHE_MS: CACHE_MS };
  if (typeof window !== 'undefined') window.RBVivo = RBVivo;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBVivo;
})();
