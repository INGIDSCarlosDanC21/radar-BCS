import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
globalThis.window = {};
const RB = require('../js/reglas.js');
globalThis.window.RB = RB;
const RBHome = require('../js/home.js');
const datos = JSON.parse(readFileSync(new URL('../data/indicadores.json', import.meta.url), 'utf8'));

test('4 tarjetas data-indicador, cada una con Fuente:', () => {
  const h = RBHome.html(datos);
  for (const id of ['calor', 'vegetacion', 'lluvia', 'agua']) {
    const m = h.match(new RegExp('<article[^>]*data-indicador="' + id + '"[\\s\\S]*?</article>'));
    assert.ok(m, 'falta ' + id);
    assert.ok(m[0].includes('Fuente:'), 'sin Fuente: en ' + id);
    assert.ok(m[0].includes('href="#ficha/' + id + '"'));
  }
  assert.equal((h.match(/data-indicador=/g) || []).length, 4);
});

test('sin null/undefined/NaN ni textos de radar', () => {
  const h = RBHome.html(datos);
  // GOES-West sí aparece desde #144 (imagen real de NASA GIBS con su fuente); se sigue prohibiendo el "GOES-18 en vivo" de la maqueta.
  for (const bad of ['null', 'undefined', 'NaN', 'dBZ', 'GOES-18', 'en vivo']) {
    assert.ok(!h.includes(bad), 'aparece ' + bad);
  }
});

test('contenido obligatorio', () => {
  const h = RBHome.html(datos);
  // Desde #144 (pedido de UI/UX) Inicio muestra solo el título "¿Qué cambia?": sin kicker, sin fecha y sin el aviso
  // de causa, que sigue en cada Ficha. Cada tarjeta conserva su "Fuente:".
  assert.ok(h.includes('¿Qué cambia?'));
  assert.ok(!h.includes('Tendencias 2001–2026'));
  assert.equal((h.match(/Fuente: /g) || []).length >= 4, true, 'cada tarjeta muestra su fuente');
  assert.ok(h.includes('Licencia Apache-2.0'));
});

test('render usa html(datos)', () => {
  const main = { innerHTML: '' };
  RBHome.render(main, datos);
  assert.equal(main.innerHTML, RBHome.html(datos));
});
