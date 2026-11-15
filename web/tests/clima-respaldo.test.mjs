// Respaldo cuando Open-Meteo no responde (429 "Daily API request limit exceeded", visto el 2026-11-15 en la red del equipo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const resp = require('./fixtures/open-meteo-diario-2026-11-15.json');

function memoria() { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m }; }

test('cielo: guarda la última respuesta buena y la usa (marcada como guardada) si llega un 429', async () => {
  const ls = memoria();
  global.localStorage = ls;
  global.fetch = () => Promise.resolve({ ok: true, json: () => resp });
  const CL = require('../js/cielo.js');
  const buenas = await CL.datos();
  assert.equal(buenas.length, 20);
  assert.ok(!buenas.guardado);
  assert.ok(ls.m[CL.GUARDADO], 'se guardó la respuesta');
  global.fetch = () => Promise.resolve({ ok: false, status: 429, json: () => ({ error: true }) });
  // la caché en memoria (10 min) serviría la buena: se recarga el módulo para forzar un pedido nuevo
  delete require.cache[require.resolve('../js/cielo.js')];
  const CL2 = require('../js/cielo.js');
  const filas = await CL2.datos();
  assert.equal(filas.length, 20);
  assert.equal(filas.guardado.motivo, '429');
  assert.equal(filas[0].c.temperature_2m, buenas[0].c.temperature_2m, 'mismo dato que el guardado');
  ls.m[CL2.GUARDADO] = JSON.stringify({ t: Date.now() - 25 * 3600000, r: resp });
  delete require.cache[require.resolve('../js/cielo.js')];
  await assert.rejects(require('../js/cielo.js').datos(), /429/, 'un respaldo de más de 24 h no se usa');
  delete global.fetch; delete global.localStorage;
});

test('datos-vivos: con 429 usa el respaldo de las últimas 24 h e informa su antigüedad', async () => {
  const V = require('../js/datos-vivos.js');
  const lt = memoria();
  const datos = { horas: ['2026-11-15T10:00'], puertos: [] };
  lt.setItem(V.CACHE_CLAVE_CLIMA + '-respaldo', JSON.stringify({ t: 1000, datos }));
  const falla = () => Promise.resolve({ ok: false, status: 429, json: () => ({}) });
  const r = await V.cargar({ fetch: falla, storage: null, respaldo: lt, ahoraMs: 1000 + 3600000, clima: true });
  assert.equal(r.respaldo, true);
  assert.equal(r.edadMs, 3600000);
  assert.deepEqual(r.datos, datos);
  await assert.rejects(V.cargar({ fetch: falla, storage: null, respaldo: memoria(), ahoraMs: 5000, clima: true }));
});

test('mensajes claros del límite en ES y EN, y sin pedidos con la pestaña oculta', () => {
  const fs = require('node:fs');
  const T = require('../js/textos.js');
  const CM = require('../js/clima-mapa.js');
  for (const l of ['es', 'en']) {
    T.setLang(l);
    for (const k of ['cielo.limite', 'cm.limite', 'cm.guardado429', 'cm.guardado']) assert.ok(T.t(k) && T.t(k) !== k, l + ' ' + k);
  }
  T.setLang('es');
  assert.match(T.t('cielo.limite'), /Open-Meteo.*límite.*otra conexión/);
  const cielo = fs.readFileSync(new URL('../js/cielo.js', import.meta.url), 'utf8'), mapa = fs.readFileSync(new URL('../js/clima-mapa.js', import.meta.url), 'utf8');
  assert.match(cielo, /if \(oculta\(\)\) \{ programar\(raiz, opciones\); return; \}/);
  assert.match(mapa, /if \(CL\.oculta && CL\.oculta\(\)\) \{ programar\(raiz, opciones\); return; \}/);
  assert.ok(CM);
});
