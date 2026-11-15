// Une plantilla.html + partes/0N-*.html en index.html. Node sin dependencias.
// Uso (desde la raíz del repo o desde presentacion/): node presentacion/build.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(fileURLToPath(import.meta.url));
const MARCADOR = '<!-- @@PARTES@@ -->';

const plantilla = readFileSync(join(raiz, 'plantilla.html'), 'utf8');
if (!plantilla.includes(MARCADOR)) {
  console.error(`Falta el marcador ${MARCADOR} en plantilla.html`);
  process.exit(1);
}

const archivos = readdirSync(join(raiz, 'partes'))
  .filter((f) => /^0[1-6]-[a-z0-9-]+\.html$/.test(f))
  .sort();

const avisos = [];
const bloques = archivos.map((f) => {
  const n = Number(f.slice(0, 2));
  const html = readFileSync(join(raiz, 'partes', f), 'utf8').trim();
  const sinComentarios = html.replace(/<!--[\s\S]*?-->/g, '');
  // Cada <section> de nivel superior debe declarar su parte.
  const secciones = [...sinComentarios.matchAll(/<section\b([^>]*)>/g)];
  if (!secciones.length) avisos.push(`${f}: no tiene <section>`);
  for (const [, attrs] of secciones) {
    const m = attrs.match(/data-parte="(\d)"/);
    if (m && Number(m[1]) !== n) avisos.push(`${f}: data-parte="${m[1]}" no coincide con el archivo (${n})`);
  }
  if (/\sstyle="/.test(sinComentarios)) avisos.push(`${f}: tiene style="" en línea; usa clases de css/deck.css`);
  if (/<script\b/i.test(sinComentarios)) avisos.push(`${f}: tiene <script>; la lógica común va en js/deck.js`);
  const pendientes = (sinComentarios.match(/\[CONTENIDO PENDIENTE\]/g) || []).length;
  if (pendientes) avisos.push(`${f}: ${pendientes} marcador(es) [CONTENIDO PENDIENTE]`);
  return `<!-- ===== ${f} ===== -->\n${html}`;
});

const faltan = [1, 2, 3, 4, 5, 6].filter((n) => !archivos.some((f) => Number(f.slice(0, 2)) === n));
if (faltan.length) avisos.push(`Faltan partes: ${faltan.join(', ')}`);

writeFileSync(join(raiz, 'index.html'), plantilla.replace(MARCADOR, bloques.join('\n\n')), 'utf8');
console.log(`index.html generado con ${archivos.length} partes: ${archivos.join(', ')}`);
for (const a of avisos) console.log(`  aviso: ${a}`);
