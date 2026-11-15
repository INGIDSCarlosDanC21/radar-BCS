// Clima: buscador, chips y detalle (docs/PLAN-CLIMA.md §4). Cifras comparadas contra la respuesta cruda del fixture real de Open-Meteo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
globalThis.window = {};
const T = require('../js/textos.js'); window.RBT = T;
const V = require('../js/datos-vivos.js'); window.RBVivo = V;
const M = require('../js/reglas-mar.js'); window.RBMar = M;
const CL = require('../js/cielo.js'); window.RBCielo = CL;
const R = require('../js/reglas-clima.js'); window.RBReglasClima = R;
const CM = require('../js/clima-mapa.js'); window.RBClimaMapa = CM;
const D = require('../js/clima-detalle.js'); window.RBClimaDetalle = D;
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const fx = JSON.parse(leer('tests/fixtures/clima-2026-11-15.json'));
const datos = V.unir(fx.mar, fx.pron, fx.clima);
const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
const LAPAZ = V.PUERTOS.findIndex((p) => p.id === 'lapaz');
const crudo = fx.clima[LAPAZ].hourly;

test('mismas claves cd.* en español e inglés y ninguna vacía', () => {
  const es = Object.keys(D.TX.es).sort(), en = Object.keys(D.TX.en).sort();
  assert.deepEqual(en, es);
  for (const l of ['es', 'en']) for (const k of es) assert.ok(String(D.TX[l][k]).trim(), `${l}.${k}`);
  assert.deepEqual(Object.keys(T.DIC.en).sort(), Object.keys(T.DIC.es).sort());
});

test('buscador: filtra las 7 localidades sin importar tildes ni mayúsculas; vacío las trae todas', () => {
  assert.equal(D.buscar('').length, 7);
  assert.deepEqual(D.buscar('MULEGE').map((l) => l.id), ['mulege']);
  assert.deepEqual(D.buscar('guerrero').map((l) => l.id), ['guerreronegro']);
  assert.deepEqual(D.buscar('comondu').map((l) => l.id), ['comondu']);
  assert.equal(D.buscar('zzz').length, 0);
});

test('cada localidad con puerto apunta a un puerto real; Comondú no tiene', () => {
  for (const [l, p] of Object.entries(D.PUERTO)) if (p) assert.ok(V.PUERTOS.some((x) => x.id === p), l);
  assert.equal(D.PUERTO.comondu, null);
  assert.equal(Object.keys(D.PUERTO).length, 7);
});

test('detalle de calor: temperatura, sensación, máxima y mínima salen de la respuesta cruda', () => {
  const h = D.detalleDe('calor', datos, idx, LAPAZ).datos;
  assert.ok(h.includes(crudo.temperature_2m[idx].toFixed(1) + ' °C'));
  assert.ok(h.includes(crudo.apparent_temperature[idx].toFixed(1) + ' °C'));
  const d = fx.clima[LAPAZ].daily, i = d.time.indexOf('2026-11-15');
  assert.ok(h.includes(d.temperature_2m_max[i].toFixed(1) + ' °C'));
  assert.ok(h.includes(d.temperature_2m_min[i].toFixed(1) + ' °C'));
  assert.ok(!/Alto|Peligro|Extremo/.test(h), 'sin etiqueta de calor');
});

test('detalle de UV: máximo, categoría OMS y horas de sol', () => {
  const d = fx.clima[LAPAZ].daily, i = d.time.indexOf('2026-11-15');
  const h = D.detalleDe('uv', datos, idx, LAPAZ).datos;
  assert.ok(h.includes(d.uv_index_max[i].toFixed(1)));
  assert.ok(h.includes(R.textoUV(d.uv_index_max[i])));
  assert.ok(h.includes((Math.round(d.sunshine_duration[i] / 360) / 10).toFixed(1) + ' h'));
});

test('detalle de viento: viento en km/h (1 nudo = 1.852 km/h), Beaufort y Douglas de reglas-mar', () => {
  const kt = datos.puertos[LAPAZ].s.viento[idx];
  const h = D.detalleDe('viento', datos, idx, LAPAZ).datos;
  assert.ok(h.includes(Math.round(kt * 1.852) + ' km/h'));
  assert.ok(h.includes(M.beaufort(kt) + ' · ' + M.textoViento(kt)));
  assert.match(h, /Estado del mar \(modelo\)/);
});

test('detalle de lluvia: humedad, probabilidad y mm de 24 h', () => {
  const h = D.detalleDe('lluvia', datos, idx, LAPAZ).datos;
  assert.ok(h.includes(Math.round(crudo.relative_humidity_2m[idx]) + ' %'));
  const r = R.resumenPuerto(datos, idx, LAPAZ).lluvia;
  assert.ok(h.includes(Math.round(r.prob24) + ' %'));
});

test('detalle en inglés: sin textos de la interfaz en español', () => {
  T.setLang('en');
  const todo = ['calor', 'uv', 'viento', 'lluvia'].map((i) => { const d = D.detalleDe(i, datos, idx, LAPAZ); return d.datos + d.curva + d.nota + d.enlace[1]; }).join(' ');
  T.setLang('es');
  for (const es of ['Temperatura ahora', 'Índice UV', 'Humedad ahora', 'Próximas 24', 'Ver consejos', 'Sin dato']) assert.ok(!todo.includes(es), es);
  assert.match(todo, /Temperature now/);
});

test('curva: 25 puntos, hueco donde falta el dato y aria-label con mínimo y máximo; sin datos lo dice', () => {
  const v = Array.from({ length: 25 }, (_, i) => (i === 5 ? null : 20 + i));
  const h = D.curvaHtml(v, 'Temp', '°C', 0);
  assert.match(h, /role="img" aria-label="Temp: mínimo 20 °C, máximo 44 °C"/);
  assert.equal((h.match(/<polyline/g) || []).length, 2, 'el hueco parte la línea en dos');
  assert.match(D.curvaHtml(Array(25).fill(null), 'x', '', 0), /Sin datos para la curva/);
});

test('un dato que falta queda en "—", no en 0', () => {
  const vacio = JSON.parse(JSON.stringify(datos));
  vacio.puertos[LAPAZ].s.temp = Array(96).fill(null);
  assert.ok(D.detalleDe('calor', vacio, idx, LAPAZ).datos.includes('<dd>—</dd>'));
});

test('pines: el chip cambia lo que dice cada pin y la localidad elegida queda marcada', () => {
  const fila = { lugar: CL.LUGARES[0], e: { texto: 'Despejado', icono: 'x', color: 'a' }, c: { temperature_2m: 25.4, apparent_temperature: 26.1, relative_humidity_2m: 40, wind_speed_10m: 12, wind_direction_10m: 90 }, uvMax: 7.3 };
  assert.match(CM.pinHtml(fila, 'general'), /25°C/);
  assert.match(CM.pinHtml(fila, 'calor'), /25° \(sens\. 26°\)/);
  assert.match(CM.pinHtml(fila, 'uv'), /UV máx 7/);
  assert.match(CM.pinHtml(fila, 'humedad'), /40 % hum\./);
  assert.match(CM.pinHtml(fila, 'viento'), /12 km\/h E/);
  CM.ESTADO.sel = 'lapaz';
  assert.match(CM.pinHtml(fila, 'general'), /cm-pin-sel/);
});

test('cableado: app.js monta el detalle antes de cargar y index.html trae los archivos', () => {
  assert.match(leer('js/app.js'), /RBClimaDetalle\.montar\(main\);\s*if \(CM\) CM\.cargar\(main\);/);
  const idxh = leer('index.html');
  assert.ok(idxh.indexOf('js/reglas-clima.js') < idxh.indexOf('js/clima-detalle.js'));
  assert.match(idxh, /css\/clima-detalle\.css/);
});
