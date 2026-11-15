import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

// Datos y reglas de Clima (docs/PLAN-CLIMA.md). El fixture es una respuesta real de Open-Meteo (no inventada) y las cifras
// se comparan contra la respuesta cruda. Sin fuente primaria no hay etiqueta de calor; el UV usa las categorías de la OMS.
const require = createRequire(import.meta.url);
globalThis.window = {};
const T = require('../js/textos.js'); window.RBT = T;
const V = require('../js/datos-vivos.js'); window.RBVivo = V;
const M = require('../js/reglas-mar.js'); window.RBMar = M;
const C = require('../js/reglas-clima.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const fx = JSON.parse(leer('tests/fixtures/clima-2026-11-15.json'));
const datos = V.unir(fx.mar, fx.pron, fx.clima);
const LAPAZ = V.PUERTOS.findIndex((p) => p.id === 'lapaz');
const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
const crudo = (k) => fx.clima[k].hourly;

test('urlClima: una petición para los 19 lugares, variables del contrato, hora de La Paz y sin claves', () => {
  const u = new URL(V.urlClima());
  assert.equal(u.host, 'api.open-meteo.com');
  assert.equal(u.searchParams.get('latitude').split(',').length, V.PUERTOS.length);
  assert.equal(V.PUERTOS.length, 19);
  assert.equal(u.searchParams.get('hourly'), 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,precipitation,shortwave_radiation');
  assert.equal(u.searchParams.get('daily'), 'temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,sunshine_duration');
  assert.equal(u.searchParams.get('timezone'), 'America/Mazatlan');
  assert.deepEqual(u.searchParams.get('latitude').split(',').map(Number), V.PUERTOS.map((p) => p.pueblo[0]), 'son los pueblos, no los puntos de mar');
  assert.ok(![...u.searchParams.keys()].some((k) => /key|token/i.test(k)));
  assert.match(V.urlMar(), /ocean_current_direction/);
});

test('unir con clima: series por hora y días, iguales a la respuesta cruda', () => {
  assert.equal(datos.horas.length, 96);
  for (const p of datos.puertos) {
    for (const k of ['temp', 'sens', 'hum', 'plluvia', 'lluvia', 'rad', 'cdir']) assert.equal(p.s[k].length, 96, p.id + '.' + k);
    assert.equal(p.dias.length, 4, 'ayer, hoy y 2 días más');
  }
  const h = crudo(LAPAZ);
  assert.deepEqual(datos.puertos[LAPAZ].s.temp, h.temperature_2m);
  assert.deepEqual(datos.puertos[LAPAZ].s.sens, h.apparent_temperature);
  assert.deepEqual(datos.puertos[LAPAZ].s.hum, h.relative_humidity_2m);
  const d = fx.clima[LAPAZ].daily, i = d.time.indexOf('2026-11-15');
  assert.deepEqual(datos.puertos[LAPAZ].dias[i], { fecha: '2026-11-15', tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i], uvmax: d.uv_index_max[i],
    amanecer: d.sunrise[i], anochecer: d.sunset[i], solS: d.sunshine_duration[i] });
});

test('unir sin clima no cambia lo anterior; con clima incompleto rechaza', () => {
  const sin = V.unir(fx.mar, fx.pron);
  assert.equal(sin.puertos[0].s.temp, undefined);
  assert.deepEqual(sin.puertos[0].dias, []);
  assert.equal(sin.puertos[0].s.cdir.length, 96, 'la dirección de la corriente viene en la petición marina');
  assert.equal(V.unir(fx.mar, fx.pron, fx.clima.slice(0, 5)), null);
  const rota = JSON.parse(JSON.stringify(fx)); rota.clima[0].hourly.temperature_2m = rota.clima[0].hourly.temperature_2m.slice(0, 10);
  assert.equal(V.unir(rota.mar, rota.pron, rota.clima).puertos[0].s.temp, null, 'una serie con otra longitud queda en null, no se rellena');
});

test('cargar({clima:true}): 3 llamadas con su propia caché de 10 min; cargar() sigue en 2 y sin clima', async () => {
  let llamadas = 0;
  const f = async (u) => { llamadas++; return { ok: true, json: async () => (u.includes('marine') ? fx.mar : u.includes('uv_index_max') ? fx.clima : fx.pron) }; };
  const mem = {}; const st = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } };
  const a = await V.cargar({ fetch: f, storage: st, ahoraMs: 1000, clima: true });
  assert.equal(llamadas, 3); assert.equal(a.cache, false); assert.equal(a.datos.puertos[0].s.temp.length, 96);
  const b = await V.cargar({ fetch: f, storage: st, ahoraMs: 1000 + 5 * 60 * 1000, clima: true });
  assert.equal(b.cache, true); assert.equal(llamadas, 3);
  const c = await V.cargar({ fetch: f, storage: st, ahoraMs: 2000 });
  assert.equal(c.cache, false, 'la caché de Pesca y Avisos es otra'); assert.equal(llamadas, 5);
  assert.equal(c.datos.puertos[0].s.temp, undefined);
  await assert.rejects(V.cargar({ fetch: async (u) => (u.includes('uv_index_max') ? { ok: false, status: 429 } : { ok: true, json: async () => (u.includes('marine') ? fx.mar : fx.pron) }), storage: null, clima: true }), /HTTP 429/);
});

test('resumenPuerto: cifras iguales a la respuesta cruda (La Paz, 15 nov 10:00)', () => {
  const r = C.resumenPuerto(datos, idx, LAPAZ), h = crudo(LAPAZ), d = fx.clima[LAPAZ].daily, i = d.time.indexOf('2026-11-15');
  assert.equal(r.calor.temp, h.temperature_2m[idx]);
  assert.equal(r.calor.sens, h.apparent_temperature[idx]);
  assert.equal(r.calor.max, d.temperature_2m_max[i]);
  assert.equal(r.calor.min, d.temperature_2m_min[i]);
  assert.equal(r.calor.nivel, null, 'sin fuente primaria no hay etiqueta de calor');
  assert.equal(r.uv.max, d.uv_index_max[i]);
  assert.equal(r.uv.ahora, fx.pron[V.PUERTOS.length + LAPAZ].hourly.uv_index[idx]);
  assert.equal(r.uv.amanecer, d.sunrise[i].slice(11, 16));
  assert.equal(r.uv.anochecer, d.sunset[i].slice(11, 16));
  assert.equal(r.uv.solH, Math.round(d.sunshine_duration[i] / 360) / 10);
  assert.equal(r.viento.kt, fx.pron[LAPAZ].hourly.wind_speed_10m[idx]);
  assert.equal(r.viento.rachas, fx.pron[LAPAZ].hourly.wind_gusts_10m[idx]);
  assert.equal(r.viento.beaufort, M.beaufort(r.viento.kt));
  assert.equal(r.viento.ola, fx.mar[LAPAZ].hourly.wave_height[idx]);
  assert.equal(r.viento.douglas, M.douglas(r.viento.ola));
  assert.equal(r.viento.periodo, fx.mar[LAPAZ].hourly.wave_period[idx]);
  assert.equal(r.viento.corriente, fx.mar[LAPAZ].hourly.ocean_current_velocity[idx]);
  assert.equal(r.viento.cdir, fx.mar[LAPAZ].hourly.ocean_current_direction[idx]);
  assert.equal(r.viento.sst, fx.mar[LAPAZ].hourly.sea_surface_temperature[idx]);
  assert.equal(r.lluvia.hum, h.relative_humidity_2m[idx]);
  assert.equal(r.lluvia.codigo, fx.pron[V.PUERTOS.length + LAPAZ].hourly.weather_code[idx]);
  const sig = (a) => a.slice(idx + 1, idx + 25).filter((x) => x != null);
  assert.equal(r.lluvia.prob24, Math.max(...sig(h.precipitation_probability)));
  assert.equal(r.lluvia.mm24, Math.round(sig(h.precipitation).reduce((a, b) => a + b, 0) * 10) / 10);
});

test('resumenPuerto: sin datos de clima todo queda en null, nada se inventa', () => {
  const sin = V.unir(fx.mar, fx.pron);
  const r = C.resumenPuerto(sin, idx, LAPAZ);
  assert.deepEqual(r.calor, { temp: null, sens: null, max: null, min: null, nivel: null });
  assert.deepEqual(r.uv, { ahora: r.uv.ahora, max: null, nivel: null, amanecer: null, anochecer: null, solH: null });
  assert.deepEqual([r.lluvia.hum, r.lluvia.prob24, r.lluvia.mm24], [null, null, null]);
});

test('curva24: 25 valores (12 antes, ahora y 12 después); null donde la serie no llega', () => {
  const c = C.curva24(datos, LAPAZ, 'temp', idx);
  assert.equal(c.length, 25);
  assert.equal(c[12], datos.puertos[LAPAZ].s.temp[idx]);
  assert.equal(c[0], datos.puertos[LAPAZ].s.temp[idx - 12]);
  const ini = C.curva24(datos, LAPAZ, 'temp', 3);
  assert.equal(ini.length, 25); assert.deepEqual(ini.slice(0, 9), Array(9).fill(null)); assert.equal(ini[9], datos.puertos[LAPAZ].s.temp[0]);
  assert.deepEqual(C.curva24(datos, LAPAZ, 'noexiste', idx), Array(25).fill(null));
});

test('UV de la OMS: 0-2 bajo, 3-5 moderado, 6-7 alto, 8-10 muy alto, 11 o más extremo; protección 0-2, 3-7 y 8 o más', () => {
  assert.deepEqual([0, 2.9, 3, 5.9, 6, 7.9, 8, 10.9, 11, 14].map(C.nivelUV), [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
  assert.deepEqual([2.9, 3, 7.9, 8].map(C.proteccionUV), [0, 1, 1, 2]);
  assert.equal(C.nivelUV(null), null); assert.equal(C.proteccionUV(null), null);
  assert.equal(C.nivelCalor(40), null, 'sin fuente primaria para la temperatura aparente no hay etiqueta');
  assert.equal(C.horasDeSol(5400), 1.5); assert.equal(C.horasDeSol(null), null);
});

test('textos clm.: mismas claves en español e inglés, ninguna vacía, y nada que afirme una fuente oficial', () => {
  const es = Object.keys(C.TX.es).sort(), en = Object.keys(C.TX.en).sort();
  assert.deepEqual(es, en);
  for (const l of ['es', 'en']) for (const k of es) { assert.ok(C.TX[l][k].length > 0, k); assert.equal(T.DIC[l][k], C.TX[l][k]); assert.match(k, /^clm\./); }
  const todo = JSON.stringify(C.TX);
  assert.doesNotMatch(todo, /SMN|CONAGUA|oficial|official|aviso|warning|estaci[oó]n BCS|boya|buoy/i);
  assert.match(C.TX.es['clm.fuente'], /modelo/i); assert.match(C.TX.en['clm.fuente'], /model/i);
  assert.equal(C.textoUV(9), 'Muy alto'); assert.equal(C.textoUV(null), 'Sin dato');
});
