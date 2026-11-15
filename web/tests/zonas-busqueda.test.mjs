// Mapa de zonas: marcadores con ícono y búsqueda (zonas-busqueda.js). Zonas reales de web/data; la respuesta de Nominatim es real
// (consulta "Centro, La Paz, Baja California Sur" del 2026-11-15).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
globalThis.window = {};
const T = require('../js/textos.js'); window.RBT = T;
const Z = require('../js/zonas-busqueda.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const zonas = JSON.parse(leer('data/zonas.geojson'));
const nom = JSON.parse(leer('tests/fixtures/nominatim-centro-2026-11-15.json'));
const id = (f) => f.properties.id;

test('el centro de cada zona cae dentro de su propio polígono y de ningún otro', () => {
  for (const f of zonas.features) {
    const [la, lo] = Z.centroide(f.geometry.coordinates[0]);
    assert.equal(id(Z.zonaEn(zonas, la, lo)), id(f), id(f));
  }
});

test('un punto fuera de las 6 zonas da null (centro de La Paz y un punto lejano)', () => {
  assert.equal(Z.zonaEn(zonas, 24.1423, -110.3132), null);
  assert.equal(Z.zonaEn(zonas, 24.8, -110.0), null);
});

test('Nominatim: la URL limita a México y a BCS, sin autocompletar; la respuesta real se interpreta', () => {
  const u = new URL(Z.urlBusqueda('Centro', 'es'));
  assert.equal(u.host, 'nominatim.openstreetmap.org');
  assert.equal(u.searchParams.get('countrycodes'), 'mx');
  assert.equal(u.searchParams.get('q'), 'Centro, Baja California Sur');
  assert.equal(new URL(Z.urlBusqueda('x', 'en')).searchParams.get('accept-language'), 'en');
  const r = Z.interpreta(nom);
  assert.equal(r.length, 1);
  assert.equal(r[0].lat, parseFloat(nom[0].lat));
  assert.equal(r[0].lon, parseFloat(nom[0].lon));
  assert.match(r[0].nombre, /^Centro, La Paz/);
  assert.equal(id(Z.zonaEn(zonas, r[0].lat, r[0].lon)), 'z01', 'el barrio Centro de OSM cae en la zona Centro');
  assert.deepEqual(Z.interpreta({ error: 1 }), []);
  assert.deepEqual(Z.interpreta([{ lat: 'x', lon: 'y', display_name: 'a' }]), []);
});

test('buscar(): usa el fetch recibido, guarda en caché y rechaza si falla la red', async () => {
  let n = 0;
  const f = () => { n++; return Promise.resolve({ ok: true, json: () => Promise.resolve(nom) }); };
  assert.equal((await Z.buscar('Centro', { fetch: f })).length, 1);
  await Z.buscar('centro ', { fetch: f });
  assert.equal(n, 1, 'la segunda consulta sale de la caché');
  assert.deepEqual(await Z.buscar('  ', { fetch: f }), []);
  await assert.rejects(Z.buscar('otra', { fetch: () => Promise.resolve({ ok: false, status: 429 }) }), /HTTP 429/);
});

test('coincidencia por nombre de zona sin tildes ni mayúsculas', () => {
  const nombre = (f) => f.properties.nombre;
  assert.deepEqual(Z.zonasPorNombre(zonas, 'CENTENARIO', nombre).map(id), ['z03']);
  assert.deepEqual(Z.zonasPorNombre(zonas, 'centro', nombre).map(id), ['z01']);
  assert.equal(Z.zonasPorNombre(zonas, '', nombre).length, 0);
});

test('estado de cada zona con los datos reales: calor sube/sin cambio claro, vegetación baja/sube', () => {
  const e = (cap) => Object.fromEntries(zonas.features.map((f) => [id(f), Z.estado(f.properties.cambios[cap])]));
  assert.deepEqual(e('calor'), { z01: 'sube', z02: 'sube', z03: 'sin', z04: 'sube', z05: 'sin', z06: 'sube' });
  assert.deepEqual(e('vegetacion'), { z01: 'baja', z02: 'baja', z03: 'baja', z04: 'sube', z05: 'sube', z06: 'baja' });
  assert.equal(Z.estado(zonas.features[0].properties.cambios.lluvia), 'nodato');
  assert.equal(Z.estado(undefined), 'nodato');
});

test('marcadores: cada glifo existe en web/assets, lleva texto alternativo y flecha, y no depende solo del color', () => {
  for (const cap of Object.keys(Z.GLIFO)) for (const est of Object.keys(Z.GLIFO[cap])) {
    assert.ok(existsSync(new URL('assets/iconos/mapa/' + Z.GLIFO[cap][est] + '.svg', raiz)), Z.GLIFO[cap][est]);
  }
  const h = Z.marcadorHtml('sube', 'calor', 'rgb(1,2,3)', 'Centro: sube, +1.09 °C');
  assert.match(h, /role="img" aria-label="Centro: sube, \+1\.09 °C"/);
  assert.match(h, /local_fire_department\.svg/);
  assert.match(h, /zb-flecha/);
  assert.match(Z.marcadorHtml('baja', 'calor', '#00f', 'x'), /ac_unit\.svg/);
  assert.match(Z.marcadorHtml('nodato', 'calor', '#999', 'x'), /zb-sim/);
});

test('textos zb.*: mismas claves en español e inglés, ninguna vacía y con lo que dice el límite de 1 km', () => {
  assert.deepEqual(Object.keys(Z.TX.en).sort(), Object.keys(Z.TX.es).sort());
  for (const l of ['es', 'en']) for (const k of Object.keys(Z.TX[l])) assert.ok(Z.TX[l][k].trim(), l + k);
  assert.match(Z.TX.es['zb.limite'], /1 km/);
  assert.match(Z.TX.en['zb.limite'], /1 km/);
  assert.deepEqual(Object.keys(T.DIC.en).sort(), Object.keys(T.DIC.es).sort());
});

test('cableado: app.js usa RBZonas y index.html carga el script y el estilo', () => {
  const app = leer('js/app.js'), idx = leer('index.html');
  assert.match(app, /bindBusqueda\(\);/);
  assert.match(app, /RBZonas\.marcadorHtml/);
  assert.match(idx, /js\/zonas-busqueda\.js/);
  assert.match(idx, /css\/zonas-busqueda\.css/);
  assert.ok(idx.indexOf('js/textos.js') < idx.indexOf('js/zonas-busqueda.js'));
});
