// Fichas sin pestaña propia (pedido de UI/UX, 2026-11-15): se abren solo desde las tarjetas de Inicio,
// no tienen el filtrado de indicadores arriba y el botón para regresar dice a dónde lleva.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const leer = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const T = require('../js/textos.js');

test('ningún menú tiene la pestaña Ficha', () => {
  const html = leer('index.html');
  assert.ok(!/data-nav="ficha"/.test(html));
  assert.ok(!/href="#ficha/.test(html));
});

test('la ficha no pinta los chips de indicador y su botón regresa a "¿Qué cambia?" de Inicio', () => {
  const app = leer('js/app.js');
  const ficha = app.slice(app.indexOf('function ficha(id)'), app.indexOf('function ficha(id)') + 1200);
  assert.ok(!ficha.includes('class="chip"'), 'la ficha no lleva filtrado superior');
  assert.ok(!ficha.includes('class="pestanas"'));
  assert.match(ficha, /<a class="volver" href="#inicio\/que-cambia">/);
  assert.match(app, /h\[1\] === 'que-cambia'\) irAQueCambia\(\)/, 'Inicio baja hasta "¿Qué cambia?" al regresar');
  assert.match(app, /location\.hash === '#inicio\/que-cambia' && irAQueCambia\(\)/, 'el cambio de pantalla no lo regresa arriba');
  assert.match(app, /sec === 'ficha' \? 'inicio' : sec/, 'en una ficha se marca Inicio en el menú');
});

test('el botón de regreso no es ambiguo, en español e inglés', () => {
  T.setLang('es'); assert.equal(T.t('fic.volver'), '← Volver a las tendencias de Inicio');
  T.setLang('en'); assert.equal(T.t('fic.volver'), '← Back to the trends on Home');
  T.setLang('es');
  assert.match(leer('css/estilos.css'), /\.volver\{display:inline-flex;[^}]*min-height:44px;[^}]*border:1px solid/);
});

test('solo Inicio enlaza a las fichas (ni el Mapa ni los pies)', () => {
  for (const f of ['js/app.js', 'js/agricola.js']) {
    const s = leer(f).replace(/function ficha\(id\)[\s\S]*?\n  \}\n/, '');
    assert.ok(!/href="#ficha\/' \+ esc\(id\)/.test(s) && !s.includes('href="#ficha/calor"'), f);
  }
  const home = leer('js/home.js');
  assert.ok(home.includes('href="#ficha/'), 'las tarjetas de Inicio abren su ficha');
  assert.ok(!home.includes('href="#ficha/calor">\' + t(\'home.fichas\')'), 'el pie de Inicio ya no enlaza a Fichas');
});
