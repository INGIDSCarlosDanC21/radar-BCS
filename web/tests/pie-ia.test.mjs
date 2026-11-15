import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Pedido de UI/UX (2026-11-15, plan de ajustes): pies sencillos, sin lista de pantallas, sin enlaces al repositorio
// y sin la línea de uso de IA. El uso de IA sigue declarado en docs/FUENTES-Y-IA.md y docs/RECURSOS.md (regla 6 de AGENTS.md).
const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const agricola = leer('../js/agricola.js');
const home = leer('../js/home.js');
const index = leer('../index.html');

test('los pies no repiten el uso de IA en pantalla', () => {
  const copias = agricola.split('\n').filter((l) => /^\s*copy:/.test(l));
  assert.equal(copias.length, 2, 'se esperan dos textos de pie (ES y EN)');
  for (const l of copias) assert.ok(!/IA|AI/.test(l), 'el pie del Mapa Agrícola no debe hablar de IA');
  assert.ok(!home.includes("t('html.ia')") && !home.includes('AI-generated'), 'el pie de Inicio no debe hablar de IA');
  assert.ok(!index.includes('pie-ia'), 'el pie general no debe hablar de IA');
});

test('los pies no enlazan al repositorio ni listan pantallas', () => {
  assert.ok(!/github\.com/.test(home), 'Inicio sin enlaces al repositorio');
  assert.ok(!home.includes("t('home.pantallas')"), 'Inicio sin lista de pantallas');
  assert.ok(!agricola.includes("tx('pantallas')"), 'Mapa Agrícola sin lista de pantallas');
});
