// Issue #96 / diseno/revision-360/REPORTE.md: reglas de 360 px que se pueden revisar sin navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('ninguna hoja de estilos usa letra menor de 12 px', () => {
  for (const f of ['estilos.css', 'home.css', 'agricola.css']) {
    const malos = [...leer('../css/' + f).matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].filter((m) => Number(m[1]) < 12);
    assert.deepEqual(malos.map((m) => m[0]), [], f);
  }
});

test('la ficha no pone la URL cruda de la fuente como texto (desbordaba a 360 px)', () => {
  const app = leer('../js/app.js');
  assert.ok(!app.includes(">' + esc(f.url) + '</a>"), 'el enlace muestra texto corto, no la URL');
  assert.match(app, /class="enlace-fuente"/);
});

test('botones del mapa y enlaces de fuente miden al menos 44 px', () => {
  const css = leer('../css/estilos.css') + leer('../css/agricola.css');
  assert.match(css, /#mapa-caja \.leaflet-bar a\{width:44px;height:44px/);
  assert.match(css, /\.ag-mapa \.leaflet-control-zoom a\{width:44px;height:44px/);
  assert.match(css, /a\.enlace-fuente\{[^}]*min-height:44px/);
});

test('Mapa Agrícola: buscador de 44 px, marcadores con área táctil de 44 px y botón oculto visible al enfocarlo', () => {
  const css = leer('../css/agricola.css');
  assert.match(css, /\.ag-busca-campo input\{[^}]*height:44px/);
  assert.match(css, /\.ag-pin::after\{[^}]*height:44px/);
  assert.match(css, /\.ag-ficha-btn\.ag-sr:focus-visible\{[^}]*min-height:44px/);
});
