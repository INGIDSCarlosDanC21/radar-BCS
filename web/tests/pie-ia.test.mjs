import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Regla 6 de AGENTS.md: el logo generado con IA se declara en el pie de todas las pantallas, en español e inglés.
// El pie del Mapa Agrícola tiene su propio texto (agricola.js); debe decir lo mismo que `html.ia` de textos.js.
const agricola = readFileSync(new URL('../js/agricola.js', import.meta.url), 'utf8');
const textos = readFileSync(new URL('../js/textos.js', import.meta.url), 'utf8');
const copias = agricola.split('\n').filter((l) => /^\s*copy:/.test(l));

test('el pie del Mapa Agrícola declara el logo generado con IA (Gemini) en español e inglés', () => {
  assert.equal(copias.length, 2, 'se esperan dos textos de pie (ES y EN)');
  assert.ok(copias.some((l) => /logotipo generado con IA \(Gemini\)/.test(l)), 'falta la declaración en español');
  assert.ok(copias.some((l) => /AI-generated logo \(Gemini\)/.test(l)), 'falta la declaración en inglés');
});

test('el pie de Inicio y el del Mapa Agrícola dicen lo mismo sobre la IA', () => {
  assert.match(textos, /'html\.ia': 'Código y análisis escritos con ayuda de IA \(Claude Code\); interfaz diseñada con ayuda de Google Stitch; logotipo generado con IA \(Gemini\)\.'/);
  assert.match(textos, /'html\.ia': 'Code and analysis written with AI assistance \(Claude Code\); interface designed with help from Google Stitch; AI-generated logo \(Gemini\)\.'/);
});
