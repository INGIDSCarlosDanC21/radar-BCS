// Issue #128: Mapa Agrícola a 360 px (pines cortados, zoom sobre la leyenda, chip de estado).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const css = leer('../css/agricola.css'), js = leer('../js/agricola.js');
const datos = JSON.parse(leer('../data/agricola.json'));

test('a menos de 480 px el marcador muestra solo el nombre; el dato sigue en el popup', () => {
  assert.match(css, /@media \(max-width:479px\)\{\.ag-pin-dato\{display:none\}\}/);
  assert.match(js, /<span class="ag-pin-nom">' \+ esc\(l\.nombre\) \+ '<\/span><span class="ag-pin-dato">/);
  assert.match(js, /mk\.bindPopup\('<strong>' \+ esc\(l\.nombre\) \+ '<\/strong>' \+ \(l\.etiqueta \? '<br>' \+ esc\(D\(l, 'etiqueta'\)\)/);
  for (const l of datos.mapa.localidades) {
    assert.ok(l.etiqueta.startsWith(l.nombre + ': '), 'la etiqueta empieza con el nombre: ' + l.nombre);
    assert.ok(l.etiqueta_en.startsWith(l.nombre + ': '), 'etiqueta_en empieza con el nombre: ' + l.nombre);
  }
});

test('localidades a menos de 0.1° separan sus etiquetas (El Centenario arriba, Chametla abajo)', () => {
  assert.match(js, /Math\.abs\(o\.lat - l\.lat\) < 0\.1 && Math\.abs\(o\.lon - l\.lon\) < 0\.1/);
  assert.match(css, /\.ag-pin\.ag-pin-arriba\{transform:translate\(-50%,-110%\)\}\.ag-pin\.ag-pin-abajo\{transform:translate\(-50%,10%\)\}/);
  const loc = Object.fromEntries(datos.mapa.localidades.map((l) => [l.nombre, l]));
  assert.ok(Math.abs(loc['El Centenario'].lat - loc.Chametla.lat) < 0.1 && loc['El Centenario'].lon < loc.Chametla.lon);
});

test('hasta 1023 px la leyenda va debajo del mapa (no tapa pines ni la tocan los botones de zoom)', () => {
  assert.match(css, /@media \(max-width:1023px\)\{\s*\.ag-mapa-caja\{height:auto\}\s*\.ag-mapa \.ag-mapa-lf\{position:relative;inset:auto;height:320px\}\s*\.ag-mapa \.ag-ley\{position:static/);
});

test('el chip de estado de dos líneas tiene esquinas de 8 px bajo 640 px', () => {
  assert.match(css, /@media \(max-width:639px\)\{\.ag-estado-izq\{border-radius:8px\}\}/);
});
