// El cielo ahora en BCS (#144, fase 2). Sin red: usa una respuesta real de Open-Meteo guardada el 2026-11-15.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const T = require('../js/textos.js');
const CL = require('../js/cielo.js');
const resp = require('./fixtures/open-meteo-2026-11-15.json');
const readme = fs.readFileSync(new URL('../assets/iconos/cielo/README.md', import.meta.url), 'utf8');

test('cada código WMO tiene estado e ícono existente, igual que la tabla del README', () => {
  const tabla = { 0: 'sunny', 1: 'sunny', 2: 'partly_cloudy_day', 3: 'cloud', 45: 'foggy', 48: 'foggy', 51: 'rainy_light', 57: 'rainy_light',
    61: 'rainy', 67: 'rainy', 80: 'rainy', 82: 'rainy', 71: 'cloud', 86: 'cloud', 95: 'thunderstorm', 99: 'thunderstorm' };
  for (const [c, ic] of Object.entries(tabla)) {
    const e = CL.estado(+c, 1);
    assert.equal(e.icono, ic, 'código ' + c);
    assert.ok(fs.existsSync(new URL('../assets/iconos/cielo/' + e.icono + '.svg', import.meta.url)), e.icono);
    assert.ok(readme.includes('`' + ic + '`'));
  }
  assert.equal(CL.estado(0, 0).icono, 'clear_night');
  assert.equal(CL.estado(2, 0).icono, 'partly_cloudy_night');
  assert.equal(CL.estado(12345, 1).grupo, 'sinDato');
  assert.equal(CL.estado(undefined, 1).icono, 'cloud');
});

test('una sola llamada a Open-Meteo con las 7 localidades de las tarjetas, sin clave y en hora de La Paz', () => {
  const u = CL.url();
  assert.match(u, /^https:\/\/api\.open-meteo\.com\/v1\/forecast\?/);
  assert.equal(u.split('latitude=')[1].split('&')[0].split(',').length, 7);
  assert.match(u, /weather_code/); assert.match(u, /is_day/); assert.match(u, /timezone=America%2FMazatlan/);
  assert.doesNotMatch(u, /apikey|key=/i);
});

test('los pines caen dentro de la imagen (mismo recuadro que la MODIS) y en su lugar', () => {
  for (const l of CL.LUGARES) {
    const p = CL.posicion(l);
    assert.ok(p.x > 0 && p.x < 100 && p.y > 0 && p.y < 100, l.id);
  }
  const lp = CL.posicion(CL.LUGARES.find((l) => l.id === 'lapaz'));
  const cabo = CL.posicion(CL.LUGARES.find((l) => l.id === 'loscabos'));
  assert.ok(cabo.y > lp.y, 'Cabo San Lucas queda al sur de La Paz');
  assert.match(CL.GOES, /LAYERS=GOES-West_ABI_GeoColor_v0_NRT/);
  assert.match(CL.GOES, /BBOX=22\.8,-115\.3,28\.1,-109\.3/);
});

test('la sección se arma con los datos reales: sin null/undefined/NaN, con atribución y aria-label', () => {
  T.setLang('es');
  const filas = CL.unir(resp);
  const h = CL.seccion(filas, new Date('2026-11-15T09:10:00Z'));
  for (const bad of ['null', 'undefined', 'NaN']) assert.ok(!h.includes(bad), bad);
  assert.ok(h.includes('href="https://open-meteo.com/"'), 'falta el enlace de atribución (CC BY 4.0)');
  assert.ok(h.includes('Actualizado 02:00 · hora de La Paz'));
  assert.ok(h.includes('aria-label="La Paz: Despejado, 22 °C"'));
  assert.equal((h.match(/class="hm-peque cl-peque"/g) || []).length, 6, '6 tarjetas como en Figma');
  assert.ok(!h.includes('cl-viejo'), 'dato de hace 10 min no es viejo');
  const p = CL.pines(filas);
  assert.equal((p.match(/class="cl-pin/g) || []).length, 7, 'un pin por tarjeta');
  // Mismos lugares, mismo nombre y misma temperatura en tarjeta y pin (sincronizados).
  for (const f of filas) {
    const temp = Math.round(f.c.temperature_2m) + '°C';
    assert.ok(h.includes('<h3 class="hm-t-' + (f.lugar.principal ? 'prin' : 'peq') + '">' + f.lugar.es + '</h3>'), 'tarjeta ' + f.lugar.es);
    assert.ok(p.includes('>' + f.lugar.es + ' ' + temp + '<'), 'pin ' + f.lugar.es + ' ' + temp);
  }
  assert.ok(!p.includes('Santa Rosalía') && !p.includes('Cabo San Lucas'), 'el mapa no muestra lugares que no están en las tarjetas');
  assert.ok(p.includes('role="img"'));
});

test('aviso cuando el dato tiene más de 1 hora, y textos en inglés', () => {
  T.setLang('es');
  const filas = CL.unir(resp);
  assert.ok(CL.seccion(filas, new Date('2026-11-15T12:00:00Z')).includes('cl-viejo'));
  T.setLang('en');
  const h = CL.seccion(CL.unir(resp), new Date('2026-11-15T09:10:00Z'));
  assert.ok(h.includes('The sky now in BCS'));
  assert.ok(h.includes('Clear'));
  T.setLang('es');
});

test('sin red: cargar() deja el mensaje de error y no rompe Inicio', async () => {
  T.setLang('es');
  const sec = { innerHTML: CL.marcoSeccion(), removeAttribute() {} };
  const raiz = { querySelector: (q) => (q === '#hm-cielo' ? sec : null) };
  const ok = await CL.cargar(raiz, { fetch: () => Promise.reject(new Error('sin red')), intervalo: 0 });
  assert.equal(ok, false);
  assert.ok(sec.innerHTML.includes('Las tendencias siguen disponibles'));
});

test('con datos: cargar() llena la sección y los pines', async () => {
  T.setLang('es');
  const sec = { innerHTML: CL.marcoSeccion(), removeAttribute() {} };
  const pines = { innerHTML: '' };
  const raiz = { querySelector: (q) => (q === '#hm-cielo' ? sec : q === '#hm-cielo-pines' ? pines : null) };
  const nota = { textContent: '' };
  raiz.querySelector = ((q0) => (q) => (q === '#hm-cielo-leyenda .cl-ley-n' ? nota : q0(q)))(raiz.querySelector);
  const ok = await CL.cargar(raiz, { fetch: () => Promise.resolve({ ok: true, json: () => resp }), ahora: new Date('2026-11-15T09:10:00Z'), intervalo: 0 });
  assert.equal(ok, true);
  assert.ok(sec.innerHTML.includes('El cielo ahora en BCS'));
  assert.ok(pines.innerHTML.includes('Comondú') && pines.innerHTML.includes('Gmo. Negro'));
  assert.equal(nota.textContent, 'Mismos datos que las tarjetas · 02:00', 'la leyenda dice la hora de los mismos datos');
});

test('índice UV por categorías de la OMS y rumbo del viento', () => {
  T.setLang('es');
  assert.equal(CL.uvCat(2), 'Bajo'); assert.equal(CL.uvCat(5), 'Moderado'); assert.equal(CL.uvCat(7), 'Alto');
  assert.equal(CL.uvCat(8), 'Muy alto'); assert.equal(CL.uvCat(11), 'Extremo');
  assert.equal(CL.rumbo(225), 'SO'); assert.equal(CL.rumbo(0), 'N'); assert.equal(CL.rumbo(359), 'N');
  T.setLang('en'); assert.equal(CL.rumbo(225), 'SW'); T.setLang('es');
});

test('tarjetas, pines e imagen se vuelven a pedir juntos cada 10 minutos', async () => {
  T.setLang('es');
  assert.equal(CL.CADA_MIN, 10);
  let llamadas = 0, reloj = null;
  const real = globalThis.setTimeout, realClear = globalThis.clearTimeout;
  globalThis.setTimeout = (fn, ms) => { reloj = { fn, ms }; return 1; };
  globalThis.clearTimeout = () => { reloj = null; };
  try {
    const sec = { innerHTML: CL.marcoSeccion(), removeAttribute() {}, isConnected: true };
    const pines = { innerHTML: '' };
    const img = { src: CL.GOES };
    const raiz = { querySelector: (q) => (q === '#hm-cielo' ? sec : q === '#hm-cielo-pines' ? pines : q === '.cl-img' ? img : null) };
    const fetch = () => { llamadas++; return Promise.resolve({ ok: true, json: () => resp }); };
    await CL.cargar(raiz, { fetch });
    assert.equal(llamadas, 1);
    assert.equal(reloj.ms, 10 * 60000, 'próxima actualización en 10 min');
    reloj.fn();
    await new Promise((r) => real(r, 0));
    assert.equal(llamadas, 2, 'vuelve a pedir los datos');
    assert.match(img.src, /GOES-West_ABI_GeoColor_v0_NRT[\s\S]*&_=\d+$/, 'y la imagen más reciente');
    sec.isConnected = false; reloj.fn();
    await new Promise((r) => real(r, 0));
    assert.equal(llamadas, 2, 'si ya no está Inicio, deja de pedir');
  } finally {
    globalThis.setTimeout = real; globalThis.clearTimeout = realClear;
  }
});
