import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// La web es siempre clara: el diseño de Figma solo tiene modo claro, y Inicio y Agro ya eran claras.
// Si el sistema está en modo oscuro, Mapa, Ficha y Acciones no deben pintarse oscuras (reporte de Carlos, 2026-11-15).
const raiz = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', raiz), 'utf8');

test('index.html declara solo el esquema claro', () => {
  assert.match(html, /<meta name="color-scheme" content="light">/);
  assert.doesNotMatch(html, /content="[^"]*dark[^"]*"/);
});

test('las hojas de estilo enlazadas no cambian de colores con el modo oscuro del sistema', () => {
  const hojas = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(hojas.length >= 3, 'se esperan al menos 3 hojas locales');
  for (const h of hojas) {
    const css = readFileSync(new URL(h, raiz), 'utf8');
    assert.doesNotMatch(css, /prefers-color-scheme\s*:\s*dark/, h + ' no debe tener bloque de modo oscuro');
  }
});
