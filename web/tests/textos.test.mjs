// Issue #93: versión en inglés con ?lang=en.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
globalThis.window = globalThis.window || {};
const T = require('../js/textos.js');
globalThis.window.RBT = T;
const RB = require('../js/reglas.js');
globalThis.window.RB = RB;
const RBHome = require('../js/home.js');
const datos = JSON.parse(readFileSync(new URL('../data/indicadores.json', import.meta.url), 'utf8'));
const zonas = JSON.parse(readFileSync(new URL('../data/zonas.geojson', import.meta.url), 'utf8'));

test('el diccionario tiene las mismas claves en español e inglés y ninguna vacía', () => {
  const es = Object.keys(T.DIC.es).sort(), en = Object.keys(T.DIC.en).sort();
  assert.deepEqual(en, es);
  for (const l of ['es', 'en']) for (const k of es) assert.ok(String(T.DIC[l][k]).trim(), `${l}.${k} vacío`);
});

test('solo ?lang=en cambia a inglés; el idioma del navegador no cuenta', () => {
  assert.equal(T.idioma('?lang=en'), 'en');
  assert.equal(T.idioma('?x=1&lang=EN'), 'en');
  assert.equal(T.idioma(''), 'es');
  assert.equal(T.idioma('?lang=es'), 'es');
  assert.equal(T.idioma('?lang=fr'), 'es');
  assert.equal(T.idioma('?language=en'), 'es');
});

test('el enlace al otro idioma conserva la ruta, otros parámetros y la pantalla', () => {
  T.setLang('es');
  assert.equal(T.urlOtro({ pathname: '/radar-BCS/', search: '', hash: '#ficha/agua' }), '/radar-BCS/?lang=en#ficha/agua');
  T.setLang('en');
  assert.equal(T.urlOtro({ pathname: '/radar-BCS/', search: '?lang=en&x=1', hash: '#mapa' }), '/radar-BCS/?x=1#mapa');
  T.setLang('es');
});

test('los datos traen en inglés todos los textos que muestra la web', () => {
  for (const i of datos.indicadores) {
    for (const c of ['titulo', 'variable', 'limitacion', 'cambio_total_nota']) if (i[c]) assert.ok(i[c + '_en'], `${i.id}.${c}_en`);
    for (const c of ['dataset', 'resolucion']) if (i.fuente[c]) assert.ok(i.fuente[c + '_en'], `${i.id}.fuente.${c}_en`);
    if (i.significancia.metodo) assert.ok(i.significancia.metodo_en, `${i.id}.metodo_en`);
  }
  for (const f of zonas.features) assert.ok(f.properties.nombre_en, 'nombre_en de zona');
});

test('Home en inglés: usa los textos _en y no deja textos de la interfaz en español', () => {
  T.setLang('en');
  const h = RBHome.html(datos);
  T.setLang('es');
  for (const i of datos.indicadores) assert.ok(h.includes(i.titulo_en), 'falta ' + i.titulo_en);
  for (const es of ['¿Qué cambia?', 'Ver ficha', 'Fuente:', 'Tendencia clara', 'Sin cambio claro', 'Mostramos qué cambió', 'Datos generados', 'Indicador principal', 'Licencia', 'ayuda de IA'])
    assert.ok(!h.includes(es), 'queda en español: ' + es);
  for (const en of ['What is changing?', 'Source:', 'We show what changed, not why', 'AI assistance'])
    assert.ok(h.includes(en), 'falta en inglés: ' + en);
});

test('Home en español sigue igual que antes (textos clave)', () => {
  T.setLang('es');
  const h = RBHome.html(datos);
  for (const es of ['¿Qué cambia?', 'Fuente:', 'Mostramos qué cambió, no por qué.', 'Licencia Apache-2.0', 'ayuda de IA'])
    assert.ok(h.includes(es), 'falta: ' + es);
});

test('reglas en inglés: sin cambio, unidades y método', () => {
  T.setLang('en');
  const lluvia = datos.indicadores.find((i) => i.id === 'lluvia');
  assert.equal(RB.textoCambio(lluvia).texto, 'No clear change');
  assert.equal(RB.signo(1.5, 'mm/año'), '+1.50 mm/year');
  assert.match(RB.explicaMetodo(lluvia.significancia.metodo), /annual totals/i);
  T.setLang('es');
  assert.equal(RB.signo(1.5, 'mm/año'), '+1.50 mm/año');
});

test('calor por zona (opción B): nota de Aqua visible, orientativo y sin "tendencia clara"', () => {
  for (const l of ['es', 'en']) {
    const d = T.DIC[l];
    assert.match(d['mapa.calor.nota'], /Aqua/, l + ': la nota nombra Aqua');
    assert.match(d['mapa.calor.nota'], /2001-2021/, l + ': la nota da el periodo de Terra');
    assert.match(d['mapa.calor.tit'], l === 'es' ? /orientativo/ : /indicative/);
    assert.match(d['mapa.calor.que'], l === 'es' ? /aire/ : /air/, l + ': aclara que la ficha es el aire');
  }
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.match(app, /calor: \{[^}]*orientativo: true[^}]*periodoZonas: true/, 'la capa de calor es orientativa y usa el periodo de las zonas');
  assert.ok(!/cfg\.nota\) r \+= '<p class="nota-limite">'[\s\S]{0,40}<\/ol>/.test(app), 'la nota no queda escondida tras la lista');
});
