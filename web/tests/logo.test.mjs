// Issue #96: logo con marca AI-generated e íconos de sección.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('logo en la cabecera con la marca "AI-generated" legible al lado y alt en ES/EN', () => {
  const html = leer('../index.html');
  assert.match(html, /<a class="marca" href="#inicio"><img src="assets\/logo-radar-bcs\.png"[^>]*data-t-alt="html\.logo"><\/a><span class="marca-ia"[^>]*>AI-generated<\/span>/);
  const T = leer('../js/textos.js');
  assert.match(T, /'html\.logo': 'Radar BCS, inicio'/);
  assert.match(T, /'html\.logo': 'Radar BCS, home'/);
});

test('los íconos de sección existen en web/assets/iconos', async () => {
  const { existsSync } = await import('node:fs');
  const reglas = leer('../js/reglas.js');
  const nombres = [...reglas.matchAll(/: '([a-z-]+)'/g)].map((m) => m[1]).filter((n) => n.startsWith('clima-') || n.startsWith('agricultura-'));
  assert.equal(nombres.length, 4);
  for (const n of nombres) assert.ok(existsSync(new URL('../assets/iconos/' + n + '.svg', import.meta.url)), n);
});

test('las 4 fichas del Mapa Agrícola usan sus íconos de web/assets/iconos', async () => {
  const { existsSync } = await import('node:fs');
  const js = leer('../js/agricola.js');
  for (const n of ['agricultura-factibilidad-y-cultivos', 'agricultura-clima-y-agua', 'agricultura-salud-del-suelo', 'agricultura-riesgos-y-sanidad']) {
    assert.ok(js.includes("'" + n + "'"), n);
    assert.ok(existsSync(new URL('../assets/iconos/' + n + '.svg', import.meta.url)), n);
  }
  assert.ok(!/pesca-/.test(js + leer('../js/reglas.js') + leer('../js/app.js')), 'sin íconos de pesca: no hay pantalla de pesca');
});
