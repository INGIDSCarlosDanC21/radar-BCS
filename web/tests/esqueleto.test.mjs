// Issue #96: esqueleto de carga.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const E = require('../js/esqueleto.js');
const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('hay esqueleto para cada pantalla y uno de respaldo', () => {
  for (const s of ['inicio', 'mapa', 'ficha', 'acciones', 'agricola']) assert.match(E.html(s, 'x'), new RegExp('esq-' + s));
  assert.match(E.html('otra', 'x'), /esq-inicio/);
});

test('el lector de pantalla oye solo el texto de carga; los bloques son decorativos', () => {
  const h = E.html('ficha', 'Cargando <datos>');
  assert.match(h, /role="status" aria-busy="true"/);
  assert.match(h, /<span class="sr">Cargando &lt;datos&gt;<\/span>/);
  assert.match(h, /<div aria-hidden="true"><div class="esq-b/);
});

test('sin animación con prefers-reduced-motion y el error sigue reemplazando al esqueleto', () => {
  const css = leer('../css/estilos.css');
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.esq-b\{animation:none\}\}/);
  const app = leer('../js/app.js');
  // ruta() pinta el esqueleto antes de cargar(); el catch de cargar() escribe el error después.
  assert.ok(app.indexOf('ruta(); // sin datos') < app.indexOf('cargar().then(function () { ruta(); }).catch'));
  assert.match(app, /fetch\('data\/agricola\.json'\)[\s\S]{0,200}class="error" role="alert"/);
});
