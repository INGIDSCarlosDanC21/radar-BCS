// Issue #119 D5: el esqueleto se ve mientras carga, <main> lleva aria-busy, y si falla un JSON o Leaflet
// el error sigue visible. Corre web/js/app.js de verdad con un documento simulado y fetch bloqueado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const JS = ['textos.js', 'reglas.js', 'home.js', 'agricola.js', 'esqueleto.js', 'app.js'].map((f) => [f, leer('../js/' + f)]);

function elemento() {
  return {
    innerHTML: '', textContent: '', hidden: false, attrs: {}, style: {},
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k] ?? null; },
    removeAttribute(k) { delete this.attrs[k]; }, addEventListener() {}, querySelectorAll: () => [], querySelector: () => null
  };
}

// fetchFalso(url) decide qué pasa con cada archivo; L = Leaflet (undefined = no cargó).
async function arrancar({ hash, fetchFalso, L }) {
  const els = {};
  const document = {
    title: '', documentElement: { lang: 'es' }, body: elemento(),
    getElementById: (id) => (id === 'idioma' ? null : (els[id] = els[id] || elemento())),
    querySelectorAll: () => [], querySelector: () => null
  };
  const window = { addEventListener() {}, scrollTo() {} };
  const ctx = { window, document, location: { hash, search: '', pathname: '/' }, fetch: fetchFalso, console, setTimeout, Promise };
  if (L) ctx.L = L;
  window.window = window; window.document = document; window.location = ctx.location;
  vm.createContext(ctx);
  for (const [f, src] of JS) { vm.runInContext(src, ctx, { filename: f }); for (const k of ['RBT', 'RB', 'RBHome', 'RBAgricola', 'RBEsq']) if (window[k]) ctx[k] = window[k]; }
  const main = els.contenido;
  const durante = { html: main.innerHTML, busy: main.getAttribute('aria-busy') };
  await new Promise((r) => setTimeout(r, 20));
  return { main, durante, els };
}
const respuesta = (obj) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(obj) });
const datos = { 'data/indicadores.json': JSON.parse(leer('../data/indicadores.json')), 'data/zonas.geojson': JSON.parse(leer('../data/zonas.geojson')) };

test('mientras carga: esqueleto de la pantalla pedida y aria-busy en <main>', async () => {
  const { durante } = await arrancar({ hash: '#ficha/agua', fetchFalso: () => new Promise(() => {}) });
  assert.match(durante.html, /class="esq esq-ficha"/);
  assert.equal(durante.busy, 'true');
});

test('si se bloquea indicadores.json: el error queda visible, sin esqueleto y sin aria-busy', async () => {
  const { main } = await arrancar({ hash: '#ficha/agua', fetchFalso: (u) => (u === 'data/indicadores.json' ? Promise.resolve({ ok: false, status: 404 }) : respuesta(datos[u])) });
  assert.match(main.innerHTML, /class="error" role="alert"/);
  assert.match(main.innerHTML, /HTTP 404/);
  assert.ok(!/esq-b/.test(main.innerHTML), 'el esqueleto no se queda');
  assert.equal(main.getAttribute('aria-busy'), null);
});

test('si se bloquea agricola.json: el error agrícola queda visible', async () => {
  const { main } = await arrancar({ hash: '#agricola', fetchFalso: (u) => (datos[u] ? respuesta(datos[u]) : Promise.reject(new Error('bloqueado'))) });
  assert.match(main.innerHTML, /class="error" role="alert"/);
  assert.match(main.innerHTML, /bloqueado/);
  assert.equal(main.getAttribute('aria-busy'), null);
});

test('si Leaflet no carga: el mapa avisa y la lista de zonas sigue', async () => {
  const { main, els } = await arrancar({ hash: '#mapa', fetchFalso: (u) => respuesta(datos[u]) });
  assert.equal(main.getAttribute('aria-busy'), null);
  assert.match(els['aviso-mapa'].innerHTML, /class="aviso"/);
  assert.equal(els['mapa-caja'].hidden, true);
  assert.match(els.resumen.innerHTML, /<ol class="top">/);
});
