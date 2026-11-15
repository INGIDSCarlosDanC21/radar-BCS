import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// #129: Mapa, Ficha y Acciones usan la misma paleta y letra de Figma que Inicio y Agro (antes crema, azul y system-ui).
const raiz = new URL('../', import.meta.url);
const css = readFileSync(new URL('css/estilos.css', raiz), 'utf8');
const home = readFileSync(new URL('css/home.css', raiz), 'utf8');
const root = css.match(/:root\{([^}]*)\}/)[1];

test('estilos.css usa la paleta de Figma de Inicio (fondo, tinta, texto suave)', () => {
  assert.match(root, /--fondo:#f7f9fc/);
  assert.match(root, /--texto:#000d21/);
  assert.match(root, /--suave:#44474d/);
  assert.doesNotMatch(root, /#f6f4ef|#0b5cad/, 'quedan colores de la paleta anterior');
});

test('el cuerpo usa Manrope y los títulos y cifras Space Grotesk, como Inicio', () => {
  assert.match(root, /--f-cuerpo:"Manrope"/);
  assert.match(root, /--f-titulo:"Space Grotesk"/);
  assert.match(root, /--f-datos:"JetBrains Mono"/);
  assert.match(css, /body\{[^}]*font:1rem\/1\.5 var\(--f-cuerpo\)/);
  assert.match(css, /h1,h2,\.cifra,\.grande\{font-family:var\(--f-titulo\)\}/);
  assert.doesNotMatch(css, /system-ui,-apple-system/);
});

test('las tres fuentes se cargan desde index.html', () => {
  const html = readFileSync(new URL('index.html', raiz), 'utf8');
  for (const f of ['Space+Grotesk', 'Manrope', 'JetBrains+Mono']) assert.ok(html.includes(f), f);
});

test('la etiqueta de Inicio no es una píldora cuando ocupa varias líneas', () => {
  assert.match(home, /\.hm-etq\{[^}]*border-radius:12px/);
});
