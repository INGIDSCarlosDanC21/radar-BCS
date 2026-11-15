import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.window = {};
const RBAgricola = require('../js/agricola.js');

const det = (id) => ({
  chips: ['FUENTE A', 'DATO B'],
  titulo_largo: 'Detalle ' + id,
  descripcion: 'Descripción de prueba',
  veredicto: { etiqueta: 'Etiqueta', valor: 'Valor' },
  dictamen: { titulo: 'RESUMEN', texto: 'Texto del resumen' },
  grupo: { titulo: 'Grupo', nota: 'Nota', tarjetas: [{ chip: 'c', titulo: 'T1', texto: 'x', filas: [['A', 'B']], fuente: 'F' }] },
  grupo_alerta: { titulo: 'Alertas', nota: 'N', tarjetas: [{ chip: 'c', titulo: 'T2', texto: 'x', motivo: 'm', fuente: 'F' }] },
  notas: [{ titulo: 'n1', texto: 't' }, { titulo: 'n2', texto: 't' }, { titulo: 'n3', texto: 't' }],
  fuentes: [{ nombre: 'Fuente', url: 'https://example.org', licencia: 'Abierta', consultado: '2026-11-15' }],
  cta: { etiqueta: 'DATOS', titulo: 'Título', texto: 'Texto', boton: 'Abrir fuente', url: 'https://example.org' }
});
const datos = {
  generado: '2026-11-15', zona: 'Zona de prueba',
  estado_linea: 'ESTADO', consulta_linea: 'Consultado',
  mapa: {
    centro: [24, -110], zoom: 9,
    info: { titulo: 'Municipio', texto: 'texto' },
    localidades: [{ id: 'a', nombre: 'Los Planes', lat: 23.9, lon: -109.9, etiqueta: 'Los Planes: x', fuente_coord: 'GeoNames' }],
    leyenda: { titulo: 'CAMBIO', etiqueta: 'Índice', min: 'Baja', max: 'Sube', nota: 'nota' },
    pie: ['uno', 'dos'], fuentes_pie: 'SIAP'
  },
  fichas: ['cultivos', 'clima', 'suelo', 'riesgos'].map((id) => ({
    id, titulo: 'Ficha ' + id, subtitulo: 'sub', chip: 'chip', enlace: 'Ver ' + id, detalle: det(id)
  }))
};
const zonas = { type: 'FeatureCollection', features: [] };

function malos(h) {
  for (const bad of ['Viabilidad', 'en vivo', 'null', 'undefined', 'NaN', 'Descargar Informe']) {
    assert.ok(!h.includes(bad), 'aparece ' + bad);
  }
}

test('cerrado: 4 fichas con aria-expanded="false"', () => {
  const h = RBAgricola.html(datos, zonas, null);
  assert.equal((h.match(/aria-expanded="false"/g) || []).length, 4);
  assert.equal((h.match(/aria-expanded="true"/g) || []).length, 0);
  assert.ok(h.includes('No encontramos') === false);
  assert.ok(h.includes('placeholder="Buscar localidad (Los Planes, El Carrizal…)"'));
  assert.ok(h.includes('Rastrear Terreno'));
  malos(h);
});

test('abierta suelo: una visible, tres hidden, botón Cerrar', () => {
  const h = RBAgricola.html(datos, zonas, 'suelo');
  assert.equal((h.match(/aria-expanded="true"/g) || []).length, 1);
  assert.equal((h.match(/<article class="ag-ficha[^>]*data-ficha="[a-z]+" hidden>/g) || []).length, 3);
  assert.equal((h.match(/<article class="ag-ficha[^>]*data-ficha="suelo"[^>]*>/g) || []).length, 1);
  assert.ok(!/data-ficha="suelo"[^>]*hidden/.test(h));
  assert.ok(h.includes('Cerrar'));
  assert.ok(h.includes('Motivo:'));
  assert.ok(h.includes('rel="noopener"'));
  assert.ok(h.includes('Abrir fuente'));
  malos(h);
});

test('escapa HTML', () => {
  const d = JSON.parse(JSON.stringify(datos));
  d.fichas[0].titulo = '<img src=x onerror=1>';
  const h = RBAgricola.html(d, zonas, null);
  assert.ok(!h.includes('<img src=x'));
});
