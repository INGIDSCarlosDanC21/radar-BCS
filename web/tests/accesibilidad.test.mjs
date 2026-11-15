// Issue #119 D6: saltar al contenido sin cambiar de pantalla, anuncio de pantalla, foco visible y cabecera legible.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const html = leer('../index.html'), app = leer('../js/app.js'), css = leer('../css/estilos.css');

test('"Saltar al contenido" mueve el foco a <main> sin tocar el hash (antes mandaba a Inicio)', () => {
  assert.match(html, /<a class="saltar" href="#contenido"/);
  assert.match(html, /<main id="contenido" tabindex="-1">/);
  assert.match(app, /saltar\.addEventListener\('click', function \(ev\) \{ ev\.preventDefault\(\); main\.focus\(\); \}\)/);
});

test('al cambiar de pantalla se anuncia el título en una región aparte; <main> ya no es aria-live', () => {
  assert.match(html, /<p id="anuncio" class="sr" aria-live="polite"><\/p>/);
  assert.ok(!/<main[^>]*aria-live/.test(html), 'aria-live en <main> leía la pantalla entera');
  assert.match(app, /anunciar\(\); if \(main\.focus\) main\.focus\(\{ preventScroll: true \}\)/);
});

test('foco visible en enlaces, botones, campos, tabindex y el mapa', () => {
  assert.match(css, /a:focus-visible,button:focus-visible\{outline:3px solid/);
  assert.match(css, /input:focus-visible,select:focus-visible,summary:focus-visible,\[tabindex\]:not\(\[tabindex="-1"\]\):focus-visible,\.leaflet-container:focus-visible\{outline:3px solid/);
});

test('Inicio y Mapa Agrícola (claros también en modo oscuro) usan colores claros en la cabecera', () => {
  assert.match(css, /body\[data-vista=inicio\] \.cabecera,body\[data-vista=agricola\] \.cabecera[^{]*\{\s*--texto:#1b1f23;--suave:#4a525a/);
});
