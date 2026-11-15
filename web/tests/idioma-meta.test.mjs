// Issue #119 D3: con ?lang=en cambian <html lang>, la descripción, la vista previa al compartir,
// el aria-label de la barra y el lang del interruptor; sin el parámetro vuelven al español.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
globalThis.window = globalThis.window || {};
const T = require('../js/textos.js');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Documento mínimo a partir de los atributos reales de index.html.
function docFalso() {
  const metas = {};
  for (const m of html.matchAll(/<meta (name|property)="([^"]+)" content="([^"]*)">/g)) metas[`meta[${m[1]}="${m[2]}"]`] = { content: m[3], setAttribute(k, v) { this[k] = v; } };
  const barra = { attrs: {}, getAttribute: () => 'html.secciones', setAttribute(k, v) { this.attrs[k] = v; } };
  const boton = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
  return {
    documentElement: { lang: 'es' }, metas, barra, boton,
    querySelector: (s) => metas[s] || null,
    querySelectorAll: (s) => (s === '[data-t-aria]' ? [barra] : []),
    getElementById: (id) => (id === 'idioma' ? boton : null)
  };
}

test('index.html trae descripción y etiquetas og en español, con imagen absoluta del sitio publicado', () => {
  assert.match(html, /<meta name="description" content="([^"]+)">/);
  assert.equal(html.match(/<meta name="description" content="([^"]+)">/)[1], T.DIC.es['html.desc']);
  assert.match(html, /property="og:image" content="https:\/\/ingidscarlosdanc21\.github\.io\/radar-BCS\/img\/bcs-modis-2025-04-20-600\.jpg"/);
  assert.match(html, /property="og:locale" content="es_MX"/);
});

test('aplicar(): inglés con ?lang=en y de vuelta a español sin el parámetro', () => {
  globalThis.location = { pathname: '/radar-BCS/', search: '?lang=en', hash: '#mapa' };
  for (const l of ['en', 'es']) {
    T.setLang(l);
    const d = docFalso();
    T.aplicar(d);
    assert.equal(d.documentElement.lang, l);
    assert.equal(d.metas['meta[name="description"]'].content, T.DIC[l]['html.desc']);
    assert.equal(d.metas['meta[property="og:title"]'].content, T.DIC[l]['html.ogTitulo']);
    assert.equal(d.metas['meta[property="og:locale"]'].content, l === 'en' ? 'en_US' : 'es_MX');
    assert.equal(d.barra.attrs['aria-label'], T.DIC[l]['html.secciones']);
    assert.equal(d.boton.attrs.lang, l === 'en' ? 'es' : 'en', 'el interruptor anuncia el otro idioma');
  }
  assert.match(T.DIC.en['html.desc'], /with open NASA data/);
  assert.equal(T.DIC.en['titulo.mapa'], 'Map');
});
