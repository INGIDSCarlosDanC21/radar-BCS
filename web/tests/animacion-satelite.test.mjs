import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

// Animación del cielo (decisión de Carlos, 2026-11-15): imágenes reales de GIBS en secuencia, dentro de la pantalla Clima.
// Reglas: solo imágenes que existen (nada de pronóstico ni trayectorias), todo viene de GIBS, y el bloque no puede romper el resto.
const require = createRequire(import.meta.url);
globalThis.window = {};
const RBT = require('../js/textos.js');
globalThis.window.RBT = RBT;
const A = require('../js/animacion-satelite.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');

test('iso redondea hacia abajo al paso de la capa y cuadros devuelve los más nuevos al final', () => {
  const ms = Date.UTC(2026, 10, 15, 14, 47, 30);
  assert.equal(A.iso(ms, 10), '2026-11-15T14:40:00Z');
  assert.equal(A.iso(ms, 30), '2026-11-15T14:30:00Z');
  const c = A.cuadros('2026-11-15T14:30:00Z', 4, 10);
  assert.deepEqual(c, ['2026-11-15T14:00:00Z', '2026-11-15T14:10:00Z', '2026-11-15T14:20:00Z', '2026-11-15T14:30:00Z']);
  assert.equal(A.cuadros('2026-11-15T00:00:00Z', 2, 30)[0], '2026-11-14T23:30:00Z', 'cruza la medianoche UTC');
});

test('el candidato resta el retraso típico de cada capa (GOES ~40 min, IMERG ~6 h) antes de buscar', () => {
  const ahora = Date.UTC(2026, 10, 15, 15, 27);
  assert.equal(A.candidato(ahora, A.CAPAS.nubes), '2026-11-15T15:00:00Z');
  assert.equal(A.candidato(ahora, A.CAPAS.lluvia), '2026-11-15T12:00:00Z');
});

test('las dos capas apuntan solo a GIBS, con el orden {z}/{y}/{x} de WMTS y la matriz de su nivel nativo', () => {
  for (const [k, c] of Object.entries(A.CAPAS)) {
    const u = A.plantilla(c, '2026-11-15T14:30:00Z');
    assert.match(u, /^https:\/\/gibs\.earthdata\.nasa\.gov\/wmts\/epsg3857\/best\//, k);
    assert.ok(u.endsWith('/{z}/{y}/{x}.png'), k);
    assert.ok(u.includes('GoogleMapsCompatible_Level' + c.nativo), k + ': matriz = nivel nativo');
    assert.ok(A.urlSonda(c, '2026-11-15T14:30:00Z').includes('/' + c.sonda.join('/')), k + ': tesela de prueba');
  }
  assert.equal(A.CAPAS.nubes.id, 'GOES-West_ABI_GeoColor');
  assert.equal(A.CAPAS.lluvia.id, 'IMERG_Precipitation_Rate_30min');
  assert.equal(A.CAPAS.nubes.cuadros * A.CAPAS.nubes.paso, 180, '3 horas de nubes');
  assert.equal(A.CAPAS.lluvia.cuadros * A.CAPAS.lluvia.paso, 360, '6 horas de lluvia');
});

test('los textos existen en español e inglés con las mismas claves y avisan que no es pronóstico ni aviso oficial', () => {
  assert.deepEqual(Object.keys(A.TX.es).sort(), Object.keys(A.TX.en).sort());
  for (const l of ['es', 'en']) for (const [k, v] of Object.entries(A.TX[l])) assert.ok(v && v.length > 1, l + ' ' + k);
  assert.match(A.TX.es['ani.aviso'], /no un pronóstico ni un aviso oficial/);
  assert.match(A.TX.en['ani.aviso'], /not a forecast or an official warning/);
  assert.match(A.TX.es['ani.txtLluvia'], /6 horas de retraso/);
  assert.match(A.TX.en['ani.txtLluvia'], /6 hours late/);
});

test('el bloque HTML es plegable, accesible y trae los controles', () => {
  const h = A.html();
  assert.match(h, /<details id="ani-det">/);
  assert.match(h, /role="group"/);
  assert.match(h, /id="ani-rng"[^>]*disabled/, 'el control arranca deshabilitado hasta que hay cuadros');
  assert.match(h, /<label class="sr" for="ani-rng">/);
  assert.match(h, /href="#avisos"/, 'enlaza a los avisos oficiales');
  assert.match(h, /aria-live="polite"/);
});

test('la leyenda de lluvia usa 8 colores de la escala de GIBS, de 0.1 a 50 mm/h', () => {
  assert.equal(A.LEY_LLUVIA.length, 8);
  assert.equal(A.LEY_LLUVIA[0][0], '0.1');
  assert.equal(A.LEY_LLUVIA[7][0], '50');
});

test('está conectado sin tocar el resto: un script, una hoja de estilos y tres líneas en app.js', () => {
  const idx = leer('index.html');
  assert.equal((idx.match(/js\/animacion-satelite\.js/g) || []).length, 1);
  assert.equal((idx.match(/css\/animacion-satelite\.css/g) || []).length, 1);
  assert.ok(idx.indexOf('js/textos.js') < idx.indexOf('js/animacion-satelite.js'), 'después de textos.js');
  const app = leer('js/app.js');
  assert.match(app, /window\.RBAnim\.limpiar\(\)/, 'se limpia al cambiar de pantalla');
  assert.match(app, /window\.RBAnim\.activar\(main\)/);
  assert.match(app, /if \(window\.RBAnim\) main\.insertAdjacentHTML/);
});

test('el módulo no usa fetch ni claves: solo imágenes de GIBS y Leaflet', () => {
  const js = leer('js/animacion-satelite.js');
  assert.doesNotMatch(js, /\bfetch\(|XMLHttpRequest|api[_-]?key|localStorage/i);
  const hosts = new Set((js.match(/https:\/\/[a-z.\-]+/g) || []));
  for (const h of hosts) assert.match(h, /gibs\.earthdata\.nasa\.gov|tile\.openstreetmap\.org|nasa\.gov$/, h);
});
