import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Pantalla Clima: textos cli. iguales en español e inglés y buscador de pueblos.
const require = createRequire(import.meta.url);
globalThis.window = {};
const T = require('../js/textos.js'); window.RBT = T;
window.RB = require('../js/reglas.js');
const V = require('../js/datos-vivos.js'); window.RBVivo = V;
window.RBMar = require('../js/reglas-mar.js');
window.RBReglasClima = require('../js/reglas-clima.js');
window.RBCielo = require('../js/cielo.js');
window.RBMapaIconos = {};
const C = require('../js/clima.js');

test('textos cli.: mismas claves y {placeholders} en ES y EN', () => {
  const es = Object.keys(C.TX.es).sort(), en = Object.keys(C.TX.en).sort();
  assert.deepEqual(es, en);
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const k of es) { assert.ok(C.TX.es[k] && C.TX.en[k], k); assert.equal(ph(C.TX.es[k]), ph(C.TX.en[k]), k); }
  assert.doesNotMatch(JSON.stringify(C.TX), /SMN|CONAGUA|boya[^s]|semáforo/i);
});
test('buscarPueblo: sin acentos ni mayúsculas; vacío o desconocido da -1', () => {
  const p = V.PUERTOS;
  assert.equal(p[C.buscarPueblo(p, 'la paz')].id, 'lapaz');
  assert.equal(C.buscarPueblo(p, ''), -1); assert.equal(C.buscarPueblo(p, 'zzzz'), -1);
});
