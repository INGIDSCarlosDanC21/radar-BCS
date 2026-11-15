import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

// Buscador de Pesca: puerto/ciudad (texto libre, sin lista de sugerencias) + fecha, como el de Clima.
// Cuidar el límite por IP de Open-Meteo: buscar no pide nada; una fecha distinta a hoy pide SOLO el puerto elegido
// (1 coordenada marina + 1 de pronóstico), con caché por (puerto, fecha) y respaldo ante 429.
const require = createRequire(import.meta.url);
globalThis.window = {};
const T = require('../js/textos.js'); window.RBT = T;
const RB = require('../js/reglas.js'); window.RB = RB;
const V = require('../js/datos-vivos.js'); window.RBVivo = V;
window.RBMar = require('../js/reglas-mar.js');
window.RBMapaIconos = require('../js/mapa-iconos.js');
const Pesca = require('../js/pesca.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const P = V.PUERTOS;
const id = (r) => (r.i >= 0 ? P[r.i].id : null);
const R = RB.rangoFechas(new Date('2026-11-15T18:00:00Z'));   // { min: 2026-08-15, max: 2026-11-30, hoy: 2026-11-15 }

test('coincidencia sin acentos, sin mayúsculas y con espacios de sobra', () => {
  assert.equal(id(Pesca.buscarPuerto(P, 'la paz')), 'lapaz');
  assert.equal(id(Pesca.buscarPuerto(P, '  LA PAZ ')), 'lapaz');
  assert.equal(id(Pesca.buscarPuerto(P, 'mulege')), 'mulege');
  assert.equal(id(Pesca.buscarPuerto(P, 'MULEGÉ')), 'mulege');
  assert.equal(id(Pesca.buscarPuerto(P, 'bahia tortugas')), 'bahiatortugas');
  assert.equal(id(Pesca.buscarPuerto(P, 'santa rosalia')), 'santarosalia');
  assert.equal(id(Pesca.buscarPuerto(P, 'lopez')), 'puertolopezmateos', 'parcial con un solo puerto');
  assert.equal(id(Pesca.buscarPuerto(P, 'Loreto')), 'loreto');
});

test('no encontrado, ambiguo y vacío', () => {
  assert.deepEqual(Pesca.buscarPuerto(P, 'Tijuana'), { i: -1, motivo: 'nada', varios: [] });
  assert.deepEqual(Pesca.buscarPuerto(P, '   '), { i: -1, motivo: 'vacio', varios: [] });
  const r = Pesca.buscarPuerto(P, 'cabo');
  assert.equal(r.motivo, 'varios');
  assert.deepEqual(r.varios.sort(), ['Cabo Pulmo', 'Cabo San Lucas', 'San José del Cabo']);
  // El mensaje de "no hay" da ejemplos reales de la lista de puertos.
  for (const n of ['La Paz', 'Loreto', 'Bahía Tortugas']) {
    assert.ok(P.some((p) => p.nombre === n), n);
    for (const l of ['es', 'en']) assert.ok(Pesca.TX[l]['pes.bVacio'].includes(n), l + ' ' + n);
  }
});

test('formulario: igual al de Clima (cm-busca), ciudad sin datalist y fecha con el rango de Clima', () => {
  T.setLang('es');
  const h = Pesca.buscadorHtml(R);
  assert.doesNotMatch(h, /datalist|list=|<option/i, 'sin lista de sugerencias');
  assert.match(h, /<form class="cm-busca pe-busca" id="pe-busca" role="search" aria-label="Buscar puerto y fecha"/);
  assert.match(h, /<div class="cm-campo cm-campo-l"><label for="pe-q">Puerto o ciudad<\/label><input id="pe-q" type="search" autocomplete="off"/);
  assert.match(h, /<div class="cm-campo"><label for="pe-f">Fecha<\/label><input id="pe-f" type="date" min="2026-08-15" max="2026-11-30" value="2026-11-15">/);
  assert.match(h, /class="cm-acc"><button type="submit" class="cm-btn">Ver<\/button><button type="button" class="cm-btn cm-btn-2" data-hoy>Hoy<\/button>/);
  assert.match(h, /id="pe-q-msg" role="status" aria-live="polite" hidden/);
  assert.match(h, /aria-describedby="pe-q-msg"/);
  // Mismo campo de fecha que Clima (compartido en reglas.js).
  assert.match(leer('js/clima-mapa.js'), /RB\.campoFecha\('cm-f'/);
  assert.match(leer('js/pesca.js'), /RB\.campoFecha\('pe-f'/);
  const CM = require('../js/clima-mapa.js');
  assert.deepEqual(CM.rangoFechas(new Date('2026-11-15T18:00:00Z')), R);
});

test('validar: no encontrado, ambiguo, fecha fuera de rango y fecha válida, sin pedir nada', () => {
  T.setLang('es');
  const antes = globalThis.fetch; let llamadas = 0;
  globalThis.fetch = window.fetch = () => { llamadas++; throw new Error('validar no debe pedir nada'); };
  try {
    assert.equal(Pesca.validar(P, 'Tijuana', '2026-11-15', R).ok, false);
    assert.match(Pesca.validar(P, 'Tijuana', '2026-11-15', R).error, /No hay un puerto con ese nombre/);
    assert.match(Pesca.validar(P, 'cabo', '2026-11-15', R).error, /Cabo Pulmo/);
    const f1 = Pesca.validar(P, 'loreto', '2026-08-14', R), f2 = Pesca.validar(P, 'loreto', '2026-12-01', R);
    assert.equal(f1.ok, false); assert.equal(f2.ok, false);
    assert.match(f1.error, /Elige una fecha entre el 15 de agosto de 2026 y el 30 de noviembre de 2026/);
    assert.deepEqual(Pesca.validar(P, 'LORETO', '2026-11-15', R), { ok: true, puerto: 'loreto', fecha: null }, 'hoy = datos ya cargados');
    assert.deepEqual(Pesca.validar(P, 'mulegé', '2026-09-16', R), { ok: true, puerto: 'mulege', fecha: '2026-09-16' });
    assert.deepEqual(Pesca.validar(P, '', '2026-11-22', R), { ok: true, puerto: null, fecha: '2026-11-22' }, 'sin texto: el puerto actual');
  } finally { globalThis.fetch = antes; delete window.fetch; }
  assert.equal(llamadas, 0);
  // El código de montar() no pide nada al escribir: el evento input solo borra el mensaje.
  const src = leer('js/pesca.js');
  const ev = src.slice(src.indexOf("q.addEventListener('input'"), src.indexOf("q.addEventListener('input'") + 120);
  assert.doesNotMatch(ev, /fetch|cargar|aplicar/);
});

// fetch falso que cuenta coordenadas (latitude=a,b,c → 3) y responde como Open-Meteo.
function falso({ estado = 200, marNull = false } = {}) {
  const log = [];
  const horas = Array.from({ length: 24 }, (_, h) => '2026-09-16T' + String(h).padStart(2, '0') + ':00');
  const f = async (url) => {
    const coords = new URL(url).searchParams.get('latitude').split(',').length;
    log.push({ url, coords });
    if (estado !== 200) return { ok: false, status: estado, json: async () => ({}) };
    const marina = url.includes('marine-api');
    const hourly = { time: horas };
    const vars = new URL(url).searchParams.get('hourly').split(',');
    for (const v of vars) hourly[v] = horas.map((_, i) => (marina && marNull ? null : 1 + i / 10));
    const r = { hourly };
    if (!marina) r.daily = { time: ['2026-09-16'], sunrise: ['2026-09-16T06:08'], sunset: ['2026-09-16T18:23'] };
    return { ok: true, status: 200, json: async () => r };
  };
  return { f, log };
}
function almacen() { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m }; }

test('fecha válida: pide SOLO el puerto elegido (2 peticiones, 1 coordenada cada una, solo ese día)', async () => {
  const { f, log } = falso(), st = almacen();
  const r = await V.cargarDia('loreto', '2026-09-16', { fetch: f, storage: st, respaldo: null, ahoraMs: 1e12, hoy: '2026-11-15' });
  assert.equal(log.length, 2);
  assert.deepEqual(log.map((x) => x.coords), [1, 1], 'nunca los 19 puertos');
  assert.equal(log.reduce((a, x) => a + x.coords, 0), 2);
  for (const x of log) {
    assert.match(x.url, /start_date=2026-09-16&end_date=2026-09-16/);
    assert.doesNotMatch(x.url, /past_days|forecast_days/);
    assert.match(x.url, /latitude=26\.01&longitude=-111\.25/, 'punto de mar de Loreto');
  }
  assert.ok(log.some((x) => x.url.startsWith('https://marine-api.open-meteo.com/v1/marine?')));
  assert.ok(log.some((x) => x.url.startsWith('https://api.open-meteo.com/v1/forecast?')));
  assert.equal(r.dia.horas.length, 24);
  assert.equal(r.dia.puerto.id, 'loreto');
  assert.equal(r.dia.puerto.s.ola.length, 24);
  assert.equal(r.dia.puerto.sol[0].amanecer, '2026-09-16T06:08');
  assert.equal(r.dia.sinMar, false); assert.equal(r.dia.sinPron, false);
  // Segunda vez, misma (puerto, fecha): caché de sessionStorage, cero peticiones.
  const r2 = await V.cargarDia('loreto', '2026-09-16', { fetch: f, storage: st, respaldo: null, ahoraMs: 1e12 + 60000, hoy: '2026-11-15' });
  assert.equal(r2.cache, true); assert.equal(log.length, 2);
  // Otro puerto: otras 2 coordenadas, no 19.
  await V.cargarDia('lapaz', '2026-09-16', { fetch: f, storage: st, respaldo: null, ahoraMs: 1e12, hoy: '2026-11-15' });
  assert.equal(log.reduce((a, x) => a + x.coords, 0), 4);
});

test('sin dato del modelo marino para esa fecha: queda en null y se marca (nunca se inventa)', async () => {
  const { f } = falso({ marNull: true });
  const r = await V.cargarDia('lapaz', '2026-11-28', { fetch: f, storage: null, respaldo: null, ahoraMs: 1e12, hoy: '2026-11-15' });
  assert.equal(r.dia.sinMar, true);
  assert.equal(r.dia.puerto.s.ola.every((x) => x === null), true);
  assert.equal(r.dia.sinPron, false);
  const e = Pesca.estadoPuerto(r.dia.puerto, 12);
  assert.equal(e.ola, null); assert.equal(e.estado, null);
  T.setLang('es');
  assert.match(Pesca.fichas(r.dia.puerto, 12, 'oc', false, null, r.dia.horas[12]), /sin dato/);
  // Clorofila sin fecha (días futuros): lo dice, sin botón.
  const clo = Pesca.fichas(r.dia.puerto, 12, 'clo', false, null, '2026-11-28T12:00');
  assert.match(clo, /No hay imagen de clorofila para el 28 de noviembre de 2026/);
  assert.doesNotMatch(clo, /id="pe-clo"/);
});

test('respaldo ante 429: usa lo guardado de ese puerto y fecha; sin respaldo, rechaza con 429', async () => {
  const ok = falso(), lt = almacen();
  await V.cargarDia('mulege', '2026-09-16', { fetch: ok.f, storage: null, respaldo: lt, ahoraMs: 1e12, hoy: '2026-11-15' });
  const lim = falso({ estado: 429 });
  const r = await V.cargarDia('mulege', '2026-09-16', { fetch: lim.f, storage: null, respaldo: lt, ahoraMs: 1e12 + 3600000, hoy: '2026-11-15' });
  assert.equal(r.respaldo, true); assert.match(r.motivo, /429/); assert.equal(r.edadMs, 3600000);
  assert.equal(r.dia.puerto.id, 'mulege');
  await assert.rejects(V.cargarDia('loreto', '2026-09-17', { fetch: lim.f, storage: null, respaldo: lt, ahoraMs: 1e12, hoy: '2026-11-15' }), /429/);
  // Respaldo de más de 24 h no se usa.
  await assert.rejects(V.cargarDia('mulege', '2026-09-16', { fetch: lim.f, storage: null, respaldo: lt, ahoraMs: 1e12 + 25 * 3600000, hoy: '2026-11-15' }), /429/);
  for (const l of ['es', 'en']) for (const k of ['pes.limite', 'pes.guardado429', 'pes.guardado']) assert.ok(Pesca.TX[l][k], l + k);
});

test('pines: con fecha elegida los puertos no consultados quedan en "—" y lo dicen', () => {
  T.setLang('es');
  const datos = { horas: ['2026-09-16T12:00'], puertos: [{ id: 'loreto', nombre: 'Loreto', mar: [26.01, -111.25], s: {}, sinDia: true }] };
  const [p] = Pesca.pines(datos, 0, 'ola', 'lapaz');
  assert.equal(p.valor, '—'); assert.equal(p.tono, 'neutro');
  assert.match(p.etiqueta, /Loreto: sin consultar para esta fecha/);
});

test('textos del buscador: mismas claves y {placeholders} en ES y EN', () => {
  const es = Object.keys(Pesca.TX.es).sort(), en = Object.keys(Pesca.TX.en).sort();
  assert.deepEqual(es, en);
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const k of es) assert.equal(ph(Pesca.TX.es[k]), ph(Pesca.TX.en[k]), k);
  for (const k of ['pes.bVacio', 'pes.bVarios', 'pes.bFuera', 'pes.bAyuda', 'pes.bFecha', 'pes.bVer', 'pes.bHoy', 'pes.sinMarDia', 'pes.sinPronDia', 'pes.pinSinDia', 'pes.cloSinDia']) assert.ok(es.includes(k), k);
});

test('campo móvil: 44 px de alto y letra de 16 px (sin zoom al escribir)', () => {
  const css = leer('css/clima-mapa.css');
  assert.match(css, /\.cm-campo input\{min-height:44px;[^}]*font-size:16px/);
  assert.match(css, /\.cm-btn\{min-height:44px/);
  assert.match(leer('js/pesca.js'), /class="cm-campo cm-campo-l"><label for="pe-q">/);
});

test('Clima usa el mismo buscador compartido (RB.buscarNombre)', () => {
  assert.equal(RB.buscarNombre(P, 'la paz'), P.findIndex((p) => p.id === 'lapaz'));
  assert.match(leer('js/clima.js'), /RB\.buscarNombre\(puertos, texto\)/);
  assert.match(leer('js/clima-mapa.js'), /RB\.buscarNombre\(CL\.LUGARES/);
});

test('si solo falla el pronóstico (429), se muestra el modelo marino y el resto queda en null, sin guardarlo', async () => {
  const ok = falso(), st = almacen();
  const f = async (url) => (url.includes('marine-api') ? ok.f(url) : { ok: false, status: 429, json: async () => ({}) });
  const r = await V.cargarDia('loreto', '2026-09-16', { fetch: f, storage: st, respaldo: null, ahoraMs: 1e12, hoy: '2026-11-15' });
  assert.equal(r.parcial, 'pron'); assert.match(r.motivo, /429/);
  assert.equal(r.dia.sinMar, false); assert.equal(r.dia.sinPron, true);
  assert.equal(r.dia.puerto.s.viento, null);
  assert.equal(st.getItem(V.CACHE_DIA), null, 'un dato parcial no se guarda en caché');
  for (const l of ['es', 'en']) for (const k of ['pes.parcial429', 'pes.parcial', 'pes.qPron', 'pes.qMar']) assert.ok(Pesca.TX[l][k], l + k);
});
