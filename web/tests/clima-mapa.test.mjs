// Pestaña Mapa como el frame "Clima - Mapa" de Figma: mapa con íconos del cielo y "Diagnóstico Climático Territorial".
// Sin red: usa una respuesta real de Open-Meteo (con datos diarios) guardada el 2026-11-15.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const T = require('../js/textos.js');
const CL = require('../js/cielo.js');
const CM = require('../js/clima-mapa.js');
const resp = require('./fixtures/open-meteo-diario-2026-11-15.json');
const leer = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const conFetch = { fetch: () => Promise.resolve({ ok: true, json: () => resp }), intervalo: 0 };

test('estructura de Figma: título, mapa, leyenda y 4 tarjetas que llevan a pantallas que existen', () => {
  T.setLang('es');
  const h = CM.html();
  assert.match(h, /<h1 id="cm-h1">Mapa Meteorológico<\/h1>/);
  assert.match(h, /<h2>Diagnóstico Climático Territorial<\/h2>/);
  assert.match(h, /id="cm-mapa"/); assert.match(h, /Estado del cielo/);
  const titulos = ['Calor & Sensación Térmica', 'Radiación UV & Exposición Solar', 'Viento, Oleaje & Corrientes', 'Humedad y Lluvia'];
  for (const ti of titulos) assert.ok(h.includes(ti.replace(/&/g, '&amp;')), ti);
  const destinos = [...h.matchAll(/class="cm-tarjeta cm-\w+" href="(#\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(destinos, ['#acciones', '#avisos', '#pesca', '#avisos']);
  const rutas = leer('js/app.js');
  for (const d of new Set(destinos)) assert.ok(rutas.includes("'" + d.slice(1) + "'"), 'la ruta ' + d + ' existe');
  for (const ic of CM.TARJETAS.map((k) => k.icono)) assert.ok(fs.existsSync(new URL('../assets/iconos/' + ic + '.svg', import.meta.url)), ic);
});

test('las tarjetas usan cifras reales del modelo (sin las de ejemplo de la maqueta) y "—" si falta un dato', () => {
  T.setLang('es');
  const lp = CL.unir(resp)[0];
  const h = CM.tarjetas(lp);
  assert.ok(h.includes('Máx ' + Math.round(lp.max) + ' °C'));
  assert.ok(h.includes('Índice ' + Math.round(lp.uvMax)));
  assert.ok(h.includes(Math.round(lp.c.wind_speed_10m) + ' km/h ' + CL.rumbo(lp.c.wind_direction_10m)));
  assert.ok(h.includes(Math.round(lp.lluvia) + ' % lluvia'));
  assert.ok(h.includes('Humedad ahora: ' + Math.round(lp.c.relative_humidity_2m) + ' %'));
  for (const bad of ['34.5', 'Índice 11+', '18-25', 'NaN', 'undefined', 'null', 'Alerta de onda']) assert.ok(!h.includes(bad), bad);
  const vacio = CM.tarjetas({ lugar: lp.lugar, c: {}, max: null, uvMax: null, lluvia: null, rachas: null, e: lp.e });
  assert.ok(vacio.includes('Máx — °C') && !/NaN|undefined/.test(vacio));
});

test('los pines del mapa son los mismos 7 lugares, con el mismo nombre y la misma temperatura que en Inicio', () => {
  T.setLang('es');
  const filas = CL.unir(resp);
  const inicio = CL.pines(filas);
  assert.equal(filas.length, 7);
  for (const f of filas) {
    const p = CM.pinHtml(f), temp = Math.round(f.c.temperature_2m) + '°C';
    assert.ok(p.includes('aria-label="' + f.lugar.es + ': ' + f.e.texto + ', ' + Math.round(f.c.temperature_2m) + ' °C"'), f.lugar.es);
    assert.ok(p.includes(temp) && inicio.includes('>' + f.lugar.es + ' ' + temp + '<'), 'mismo dato que Inicio: ' + f.lugar.es);
    assert.ok(p.includes('assets/iconos/cielo/' + f.e.icono + '.svg'), 'ícono del cielo de ' + f.lugar.es);
  }
});

test('cargar(): llena las tarjetas y dice que son los mismos datos que Inicio; sin red avisa', async () => {
  T.setLang('es');
  const nodos = { '#cm-tarjetas': { innerHTML: CM.tarjetas(null), isConnected: true }, '#cm-estado': { textContent: '', className: 'cm-estado' } };
  const raiz = { querySelector: (q) => nodos[q] || null };
  assert.equal(await CM.cargar(raiz, conFetch), true);
  assert.ok(nodos['#cm-tarjetas'].innerHTML.includes('Máx '));
  const hora = CL.unir(resp)[0].c.time.slice(11, 16);
  assert.equal(nodos['#cm-estado'].textContent, 'Mismos datos que las tarjetas · ' + hora);
  assert.equal(await CM.cargar(raiz, { fetch: () => Promise.reject(new Error('sin red')), intervalo: 0 }), false);
  assert.match(nodos['#cm-estado'].textContent, /tendencias por zona siguen abajo/);
});

test('Inicio y Mapa piden la misma URL y comparten la respuesta (una sola llamada cada 10 min)', async () => {
  assert.match(CL.url(), /daily=temperature_2m_min,temperature_2m_max,uv_index_max,precipitation_probability_max,wind_gusts_10m_max/);
  const app = leer('js/app.js'), html = leer('index.html');
  assert.match(app, /var h = \(CM \? CM\.html\(\) : '<h1>'/, 'la pestaña Mapa tiene un solo <h1>');
  assert.match(app, /if \(CM\) CM\.cargar\(main\);/);
  const i = (s) => html.indexOf(s);
  assert.ok(i('js/cielo.js') < i('js/clima-mapa.js') && i('js/clima-mapa.js') < i('js/app.js'), 'orden de scripts');
  assert.ok(html.includes('css/clima-mapa.css'));
  assert.match(leer('js/clima-mapa.js'), /CL\.datos\(opciones\)/, 'usa los datos compartidos de cielo.js');
});

test('en inglés', () => {
  T.setLang('en');
  const h = CM.html() + CM.tarjetas(CL.unir(resp)[0]);
  T.setLang('es');
  for (const en of ['Weather Map', 'Regional Climate Overview', 'Heat & Feels-like Temperature', 'See the marine and coastal wind forecast', 'How each zone of La Paz has changed since 2001'])
    assert.ok(h.includes(en.replace(/&/g, '&amp;')), en);
  for (const es of ['Mapa Meteorológico', 'Diagnóstico', 'Ver consejos']) assert.ok(!h.includes(es), es);
});
