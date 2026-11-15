// Barra inferior del celular (pedido de Carlos, 2026-11-15): "Inicio en el centro y lo demás a los lados".
// 5 botones iguales, Inicio exactamente al centro, con ícono y etiqueta siempre visibles (nada que sobresalga y los tape),
// área táctil >= 44 px, safe-area abajo, alto en px (sin vh) y compactación de celular solo hasta 480 px.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (r) => readFileSync(new URL('../' + r, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const html = leer('index.html'), menu = leer('css/menu.css'), estilos = leer('css/estilos.css'), movil = leer('css/movil.css');
const barraHtml = html.match(/<nav class="barra"[\s\S]*?<\/nav>/)[0];
const botones = [...barraHtml.matchAll(/<a [^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);

test('barra: 5 botones en orden Clima, Pesca, Inicio, Agro, Avisos; Inicio es el 3.º (centro exacto)', () => {
  assert.equal(botones.length, 5);
  assert.deepEqual(botones.map((b) => b.match(/data-nav="([a-z]+)"/)[1]), ['clima', 'pesca', 'inicio', 'agricola', 'avisos']);
  assert.match(botones[2], /class="barra-centro"/, 'el botón central es Inicio');
  assert.equal(botones.filter((b) => b.includes('barra-centro')).length, 1, 'solo un botón central');
  botones.forEach((b) => {
    assert.match(b, /class="mi-ic"/, 'cada botón lleva ícono');
    assert.match(b, /<span data-t="nav\.[a-z]+">[^<]+<\/span><\/a>$/, 'cada botón lleva etiqueta visible al final');
  });
  assert.match(estilos, /\.barra\{[^}]*grid-template-columns:repeat\(5,1fr\)/, '5 columnas iguales: la 3.ª queda al centro');
});

test('barra: la etiqueta de Inicio no queda tapada (sin círculo que sobresalga, sin transform ni posiciones absolutas)', () => {
  const reglasCentro = [...menu.matchAll(/([^{}]*barra-centro[^{}]*)\{([^}]*)\}/g)];
  assert.ok(reglasCentro.length > 0);
  reglasCentro.forEach(([, sel, cuerpo]) => {
    assert.doesNotMatch(sel, /::?before/, 'nada se dibuja encima del botón central');
    assert.doesNotMatch(cuerpo, /transform|top:-|margin-top:-|position:absolute/, 'nada sube ni se encima: ' + sel);
  });
  assert.doesNotMatch(menu, /\.barra[^{]*\.mi-ic[^{]*\{[^}]*transform/, 'los íconos no se desplazan sobre la etiqueta');
  // La raya del activo va abajo y mide 3 px dentro del relleno inferior (7 px): no toca la etiqueta.
  const raya = menu.match(/\.barra a\[aria-current=page\]::after\{([^}]*)\}/);
  assert.ok(raya, 'el activo lleva raya además de color');
  assert.match(raya[1], /bottom:2px/); assert.match(raya[1], /height:3px/);
  assert.match(menu, /\.barra a\{[^}]*padding:4px 2px 7px/);
});

test('barra: toques >= 44 px, safe-area, alto en px y estado activo claro', () => {
  const a = menu.match(/\n\.barra a\{([^}]*)\}/)[1];
  const alto = Number(a.match(/min-height:(\d+)px/)[1]);
  assert.ok(alto >= 44, 'área táctil de al menos 44 px de alto');
  assert.match(menu, /\.barra\{[^}]*padding:[^;]*env\(safe-area-inset-bottom\)/);
  assert.match(estilos, /body\{[^}]*padding-bottom:calc\(64px \+ env\(safe-area-inset-bottom\)\)/, 'el contenido no queda debajo de la barra');
  assert.ok(alto + 4 + 4 + 1 <= 64, 'la barra cabe en los 64 px reservados en body');
  assert.doesNotMatch(menu + movil, /\d(dvh|svh|lvh|vh)\b/, 'sin vh: no salta cuando Chrome móvil cambia su barra de dirección');
  assert.match(menu, /\.barra a\[aria-current=page\],\.barra a\.barra-centro\[aria-current=page\]\{[^}]*background:var\(--acento\)/, 'activo relleno de azul marino');
});

test('celular compacto: solo hasta 480 px y cargado al final (escritorio no cambia)', () => {
  const sinComentarios = movil.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  assert.match(sinComentarios, /^@media \(max-width:480px\)\{[\s\S]*\}$/, 'todas las reglas dentro del media query de celular');
  const hojas = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map((m) => m[1]);
  assert.equal(hojas[hojas.length - 1], 'css/movil.css');
  // Ningún objetivo táctil baja de 44 px dentro del modo compacto.
  [...sinComentarios.matchAll(/min-height:(\d+)px/g)].forEach((m) => assert.ok(Number(m[1]) >= 44, 'min-height ' + m[1]));
});
