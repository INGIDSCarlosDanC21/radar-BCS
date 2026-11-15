// Mapa Agrícola: al elegir una localidad, las tarjetas muestran datos de ese lugar (pedido de UI/UX, 2026-11-15).
// Todo sale de data/agricola.json y data/localidades_tendencias.json; lo que solo existe por municipio se dice así.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const AG = require('../js/agricola.js');
const datos = require('../data/agricola.json');
const locs = require('../data/localidades_tendencias.json');
const loc = (n) => datos.mapa.localidades.find((l) => l.nombre === n);
const ficha = (id) => datos.fichas.find((f) => f.id === id);
function chips(n) {
  AG.SEL.locs = locs; AG.SEL.datos = datos;
  const p = AG.perfil(datos, loc(n));
  return Object.fromEntries(['cultivos', 'clima', 'suelo', 'riesgos'].map((id) => [id, AG.chipLoc(datos, ficha(id), p)]));
}

test('Los Planes: acuífero con su cifra, normales de La Paz (misma celda), suelo propio y riesgos municipales', () => {
  const c = chips('Los Planes');
  assert.equal(c.cultivos, 'Acuífero Los Planes: sin disponibilidad (-2.34 hm³/año)');
  assert.match(c.clima, /normales del punto de La Paz$/);
  assert.equal(c.suelo, 'pH 8.0 · franco arenoso');
  assert.match(c.riesgos, /\(municipio\)$/);
});

test('El Carrizal y El Centenario: cada uno con lo suyo; Chametla sin suelo se dice', () => {
  assert.equal(chips('El Carrizal').cultivos, 'Acuífero El Carrizal: con volumen disponible (+0.71 hm³/año)');
  const ce = chips('El Centenario');
  assert.equal(ce.clima, 'Calor del aire +1.20 °C desde 2001 · ≈247 mm de lluvia al año');
  assert.equal(ce.suelo, 'pH 7.9 · franco arenoso');
  assert.match(ce.cultivos, /\(municipio\)$/, 'sin acuífero asignado: cifra municipal marcada');
  assert.equal(chips('Chametla').suelo, 'Sin dato de suelo para Chametla');
});

test('detalle abierto: bloque "En <localidad>" con notas honestas y sin NaN', () => {
  AG.SEL.locs = locs; AG.SEL.datos = datos;
  const p = AG.perfil(datos, loc('Los Planes'));
  const cul = AG.bloqueLoc(datos, ficha('cultivos'), p);
  assert.ok(cul.includes('En Los Planes') && cul.includes('El SIAP no separa los cultivos por localidad') && cul.includes('Acuífero Los Planes (0323)'));
  const cli = AG.bloqueLoc(datos, ficha('clima'), AG.perfil(datos, loc('El Centenario')));
  assert.ok(cli.includes('Comparte celda con Chametla') && cli.includes('Sin acuífero asignado a El Centenario'));
  for (const n of ['Los Planes', 'El Carrizal', 'El Centenario', 'Chametla'])
    for (const id of ['cultivos', 'clima', 'suelo', 'riesgos']) assert.ok(!/NaN|undefined|null/.test(AG.bloqueLoc(datos, ficha(id), AG.perfil(datos, loc(n)))), n + ' ' + id);
  AG.SEL.loc = null;
});
