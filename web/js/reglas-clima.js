/* Reglas de la pantalla Clima (docs/PLAN-CLIMA.md). Funciones puras, ES5, sin build, mismo estilo que reglas-mar.js.
   Los datos son del modelo de Open-Meteo para el pueblo (no son estaciones) y así se rotulan en pantalla.
   Umbrales y su fuente (ver docs/investigacion/umbrales-clima.md):
   - UV: categorías del Índice UV mundial de la OMS (0-2 bajo, 3-5 moderado, 6-7 alto, 8-10 muy alto, 11 o más extremo).
   - Calor: NO hay etiqueta. Los rangos del índice de calor del NWS son para temperatura del aire y humedad, no para la
     "temperatura aparente" de Open-Meteo, así que nivelCalor() devuelve null y la pantalla muestra solo el número.
   - Viento y oleaje: Beaufort y Douglas de reglas-mar.js. Lluvia: sin umbrales (solo cifras del modelo). */
(function () {
  'use strict';
  var T = (typeof window !== 'undefined' && window.RBT) || (typeof require !== 'undefined' ? require('./textos.js') : null);
  var V = (typeof window !== 'undefined' && window.RBVivo) || (typeof require !== 'undefined' ? require('./datos-vivos.js') : null);
  var M = (typeof window !== 'undefined' && window.RBMar) || (typeof require !== 'undefined' ? require('./reglas-mar.js') : null);
  var t = T.t;

  function en(serie, i) { return serie && serie[i] != null ? serie[i] : null; }
  function redondea(x, d) { if (x == null || isNaN(x)) return null; var f = Math.pow(10, d); return Math.round(x * f) / f; }

  /* 0 bajo, 1 moderado, 2 alto, 3 muy alto, 4 extremo. */
  function nivelUV(uv) {
    if (uv == null || isNaN(uv)) return null;
    return uv >= 11 ? 4 : uv >= 8 ? 3 : uv >= 6 ? 2 : uv >= 3 ? 1 : 0;
  }
  /* Sin fuente primaria para la temperatura aparente de Open-Meteo: no se etiqueta. */
  function nivelCalor() { return null; }
  /* Protección según la OMS (https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index):
     0-2 ninguna, 3-7 sombra al mediodía, camisa, bloqueador y sombrero; 8 o más evitar el exterior al mediodía. Devuelve 0, 1, 2 o null. */
  function proteccionUV(uv) {
    if (uv == null || isNaN(uv)) return null;
    return uv >= 8 ? 2 : uv >= 3 ? 1 : 0;
  }

  /* Horas de sol: sunshine_duration está en segundos. */
  function horasDeSol(seg) { return seg == null ? null : redondea(seg / 3600, 1); }

  function diaDe(datos, k, idx) {
    var f = V.fechaDe(datos.horas[idx]), d = datos.puertos[k].dias || [];
    for (var i = 0; i < d.length; i++) if (d[i].fecha === f) return d[i];
    return null;
  }

  /* Próximas 24 horas (idx+1 a idx+24; Open-Meteo da lluvia y probabilidad de la hora anterior). Máximo o suma, null si no hay datos. */
  function ventana(serie, idx, op) {
    var hay = false, r = 0, max = null, fin = serie ? Math.min(serie.length - 1, idx + 24) : -1;
    for (var i = idx + 1; i <= fin; i++) {
      var v = serie[i];
      if (v == null) continue;
      hay = true; r += v; if (max == null || v > max) max = v;
    }
    if (!hay) return null;
    return op === 'max' ? max : redondea(r, 1);
  }

  /* Todo en null si falta el dato. Viento en nudos, oleaje en metros, periodo en segundos, corriente en km/h (Open-Meteo), temperaturas en °C. */
  function resumenPuerto(datos, idx, k) {
    var p = datos.puertos[k], s = p.s, d = diaDe(datos, k, idx);
    var temp = en(s.temp, idx), sens = en(s.sens, idx), kt = en(s.viento, idx), ola = en(s.ola, idx);
    var uvMax = d ? d.uvmax : null;
    return {
      calor: { temp: temp, sens: sens, max: d ? d.tmax : null, min: d ? d.tmin : null, nivel: nivelCalor(sens) },
      uv: { ahora: en(s.uv, idx), max: uvMax, nivel: nivelUV(uvMax), amanecer: d && d.amanecer ? V.horaDe(d.amanecer) : null,
        anochecer: d && d.anochecer ? V.horaDe(d.anochecer) : null, solH: d ? horasDeSol(d.solS) : null },
      viento: { kt: kt, rachas: en(s.rachas, idx), beaufort: M.beaufort(kt), ola: ola, douglas: M.douglas(ola), periodo: en(s.per, idx),
        corriente: en(s.corr, idx), cdir: en(s.cdir, idx), sst: en(s.sst, idx) },
      lluvia: { hum: en(s.hum, idx), prob24: ventana(s.plluvia, idx, 'max'), mm24: ventana(s.lluvia, idx, 'suma'), codigo: en(s.codigo, idx) }
    };
  }

  /* 25 valores: 12 horas antes, la actual y 12 después. null donde la serie no llega o falta el dato. */
  function curva24(datos, k, serie, idx) {
    var s = datos.puertos[k].s[serie], r = [];
    for (var i = idx - 12; i <= idx + 12; i++) r.push(s && i >= 0 && i < s.length && s[i] != null ? s[i] : null);
    return r;
  }

  /* Textos (ES/EN) con prefijo clm.; mismas claves en los dos idiomas. */
  var TX = {
    es: {
      'clm.uv.0': 'Bajo', 'clm.uv.1': 'Moderado', 'clm.uv.2': 'Alto', 'clm.uv.3': 'Muy alto', 'clm.uv.4': 'Extremo',
      'clm.prot.0': 'Sin medidas de protección en condiciones normales.',
      'clm.prot.1': 'Busca sombra al mediodía y usa camisa, bloqueador solar y sombrero.',
      'clm.prot.2': 'Evita estar afuera al mediodía; busca sombra, y usa camisa, bloqueador solar y sombrero.',
      'clm.sin': 'Sin dato', 'clm.sens': 'Sensación térmica del modelo',
      'clm.fuente': 'Modelo Open-Meteo para el pueblo, no son estaciones.'
    },
    en: {
      'clm.uv.0': 'Low', 'clm.uv.1': 'Moderate', 'clm.uv.2': 'High', 'clm.uv.3': 'Very high', 'clm.uv.4': 'Extreme',
      'clm.prot.0': 'No protection needed under normal conditions.',
      'clm.prot.1': 'Seek shade at midday and use a shirt, sunscreen and a hat.',
      'clm.prot.2': 'Avoid being outside at midday; seek shade, and use a shirt, sunscreen and a hat.',
      'clm.sin': 'No data', 'clm.sens': 'Apparent temperature (model)',
      'clm.fuente': 'Open-Meteo model for the town, not weather stations.'
    }
  };
  ['es', 'en'].forEach(function (l) {
    for (var k in TX[l]) if (Object.prototype.hasOwnProperty.call(TX[l], k)) T.DIC[l][k] = TX[l][k];
  });

  function textoUV(uv) { var n = nivelUV(uv); return n == null ? t('clm.sin') : t('clm.uv.' + n); }
  function textoProteccion(uv) { var n = proteccionUV(uv); return n == null ? t('clm.sin') : t('clm.prot.' + n); }

  var RBReglasClima = { resumenPuerto: resumenPuerto, curva24: curva24, nivelUV: nivelUV, nivelCalor: nivelCalor, proteccionUV: proteccionUV,
    horasDeSol: horasDeSol, textoUV: textoUV, textoProteccion: textoProteccion, TX: TX };
  if (typeof window !== 'undefined') window.RBReglasClima = RBReglasClima;
  if (typeof module !== 'undefined' && module.exports) module.exports = RBReglasClima;
})();
