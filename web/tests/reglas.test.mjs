import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const RB = require('../js/reglas.js');

test('lluvia sin cambio claro con 0.0 y con null', () => {
  for (const ct of [0.0, null]) {
    const r = RB.textoCambio({ cambio_total: ct, unidades: 'mm/año', significancia: { significativo: false } });
    assert.equal(r.tipo, 'sin-cambio');
    assert.equal(r.texto, 'Sin cambio claro');
    assert.equal(r.clase, '');
  }
});

test('calor con cifra', () => {
  const r = RB.textoCambio({ cambio_total: 1.465, unidades: '°C', significancia: { significativo: true } });
  // es-MX usa punto decimal en Node/ICU (y en el navegador): '+1.47 °C'
  assert.equal(r.texto, '+1.47 °C');
  assert.equal(r.clase, 'sube');
  assert.equal(r.tipo, 'cifra');
});

test('vegetacion vacia', () => {
  const r = RB.textoCambio({ cambio_total: null, unidades: null, significancia: { significativo: null } });
  assert.equal(r.texto, 'Sin datos (pendiente)');
  assert.equal(r.tipo, 'sin-datos');
});

test('fuente', () => {
  assert.equal(RB.textoFuente({ fuente: null }), 'pendiente');
  assert.equal(RB.textoFuente({ fuente: { dataset: null } }), 'pendiente');
  assert.equal(RB.textoFuente({ fuente: { dataset: 'X' } }), 'X');
});

test('p-valor', () => {
  assert.equal(RB.pTexto(0.0, 3), '< 0.001');
  assert.equal(RB.pTexto(0.1782, 3), '0.178');
});

test('franja', () => {
  assert.equal(RB.mostrarFranja({ datos_de_prueba: false }, { datos_de_prueba: true }, 'mapa'), true);
  assert.equal(RB.mostrarFranja({ datos_de_prueba: false }, { datos_de_prueba: true }, 'inicio'), false);
  assert.equal(RB.mostrarFranja({ datos_de_prueba: true }, {}, 'ficha'), true);
});

test('cada ficha explica su propio método (#78)', async () => {
  const fs = await import('node:fs');
  const d = JSON.parse(fs.readFileSync(new URL('../data/indicadores.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
  const txt = id => RB.explicaMetodo(d.indicadores.find(i => i.id === id).significancia.metodo);
  assert.match(txt('lluvia'), /total/);
  assert.doesNotMatch(txt('lluvia'), /cada mes/);
  assert.match(txt('agua'), /autocorrelación/);
  assert.match(txt('calor'), /cada mes/);
  assert.doesNotMatch(txt('calor'), /autocorrelación/);
  assert.equal(RB.explicaMetodo(null), '');
});
