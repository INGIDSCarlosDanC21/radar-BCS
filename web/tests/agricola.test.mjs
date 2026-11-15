import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const crudo = readFileSync(new URL('../data/agricola.json', import.meta.url), 'utf8');
const datos = JSON.parse(crudo.charCodeAt(0) === 0xFEFF ? crudo.slice(1) : crudo);

function cadenas(v, acc = []) {
  if (typeof v === 'string') acc.push(v);
  else if (Array.isArray(v)) v.forEach((x) => cadenas(x, acc));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => cadenas(x, acc));
  return acc;
}

function tarjetas(f) {
  const d = f.detalle;
  const g = (d.grupo && d.grupo.tarjetas) || [];
  const a = (d.grupo_alerta && d.grupo_alerta.tarjetas) || [];
  return [...g, ...a];
}

test('4 fichas en orden: cultivos, clima, suelo, riesgos', () => {
  assert.deepEqual(datos.fichas.map((f) => f.id), ['cultivos', 'clima', 'suelo', 'riesgos']);
});

test('cada tarjeta tiene fuente no vacía', () => {
  for (const f of datos.fichas) {
    const ts = tarjetas(f);
    assert.ok(ts.length > 0, 'sin tarjetas en ' + f.id);
    for (const t of ts) {
      assert.ok(typeof t.fuente === 'string' && t.fuente.trim().length > 0, 'sin fuente: ' + f.id + ' / ' + t.titulo);
    }
  }
});

test('cada ficha tiene al menos una fuente con url https', () => {
  for (const f of datos.fichas) {
    const fu = f.detalle.fuentes || [];
    assert.ok(fu.some((s) => typeof s.url === 'string' && s.url.startsWith('https://')), 'sin https en ' + f.id);
  }
});

test('el JSON no contiene textos prohibidos', () => {
  const todo = cadenas(datos);
  for (const malo of ['Viabilidad', 'ÓPTIMO', 'en vivo', 'null', 'NaN', 'undefined']) {
    for (const s of todo) assert.ok(!s.includes(malo), 'aparece "' + malo + '" en: ' + s.slice(0, 80));
  }
});

test('el dictamen de cultivos contiene el total sembrado 3,879.6', () => {
  const c = datos.fichas.find((f) => f.id === 'cultivos');
  assert.ok(c.detalle.dictamen.texto.includes('3,879.6'));
});

test('el resumen de la ficha Clima coincide con indicadores.json (no se queda viejo)', async () => {
  const { readFileSync } = await import('node:fs')
  const agro = JSON.parse(readFileSync(new URL('../data/agricola.json', import.meta.url), 'utf8'))
  const ind = JSON.parse(readFileSync(new URL('../data/indicadores.json', import.meta.url), 'utf8'))
  const texto = agro.fichas.find((f) => f.id === 'clima').detalle.dictamen.texto
  for (const i of ind.indicadores) {
    const p = i.significancia.p_valor < 0.001 ? 'p < 0.001' : 'p = ' + i.significancia.p_valor.toFixed(3)
    assert.ok(texto.includes(p), `${i.id}: falta ${p}`)
    if (i.cambio_total !== null) assert.ok(texto.includes(i.fuente.periodo), `${i.id}: falta ${i.fuente.periodo}`)
  }
})
