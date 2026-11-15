import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.window = {};
const RBT = require('../js/textos.js');
const RBAgricola = require('../js/agricola.js');

const crudo = readFileSync(new URL('../data/agricola.json', import.meta.url), 'utf8');
const datos = JSON.parse(crudo.charCodeAt(0) === 0xFEFF ? crudo.slice(1) : crudo);
const zonas = { type: 'FeatureCollection', features: [] };

// Claves que no son texto de la interfaz (ids, enlaces, números, nombres propios, licencias, fechas ISO).
const NO_TEXTO = new Set(['id', 'url', 'generado', 'consultado', 'tono', 'centro', 'zoom', 'lat', 'lon', 'nombre_loc', 'licencia']);
const NOMBRES = /Los Planes|El Carrizal|El Centenario|La Paz|Todos Santos/g;   // nombres de lugar: no se traducen
const PALABRAS_ES = /\b(de|del|la|las|el|los|con|en|para|por|que|y|sin|al|es|no|se|un|una)\b/i;

/* Recorre todo el JSON: para cada texto visible, el hermano *_en debe existir. */
function recorre(v, ruta, fn, padre) {
  if (Array.isArray(v)) { v.forEach((x, i) => recorre(x, ruta + '[' + i + ']', fn, padre)); return; }
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) {
      if (k.endsWith('_en')) continue;
      const x = v[k], r = ruta + '/' + k;
      const esLocalidad = k === 'nombre' && 'lat' in v;   // nombre de lugar: no se traduce
      if (NO_TEXTO.has(k) || esLocalidad) continue;
      const visible = typeof x === 'string' || (Array.isArray(x) && x.length && (typeof x[0] === 'string' || Array.isArray(x[0])));
      if (visible) fn(v, k, r);
      else recorre(x, r, fn, v);
    }
  }
}
const aplana = (x) => (Array.isArray(x) ? x.flatMap(aplana) : [x]);
const nums = (s) => (String(s).match(/\d[\d.,']*\d|\d/g) || []).sort();

test('todo texto visible de agricola.json tiene su hermano _en (misma forma, no vacío)', () => {
  let n = 0;
  recorre(datos, '', (obj, k, ruta) => {
    n++;
    assert.ok(k + '_en' in obj, 'falta ' + ruta + '_en');
    const es = aplana(obj[k]), en = aplana(obj[k + '_en']);
    assert.equal(en.length, es.length, 'forma distinta en ' + ruta);
    assert.deepEqual(JSON.stringify(obj[k + '_en']).length > 2, true);
    en.forEach((t, i) => {
      assert.equal(typeof t, 'string', ruta);
      assert.ok(t.trim() !== '', 'vacío ' + ruta);
      // Igual al español solo si es nombre propio o cifra (sin palabras en español).
      if (t === es[i]) assert.ok(!PALABRAS_ES.test(t.replace(NOMBRES, '')), 'sin traducir: ' + ruta + ' = ' + t);
    });
  });
  assert.ok(n > 100, 'recorrido sospechosamente corto: ' + n);
});

test('la traducción no cambia cifras: mismos números en español e inglés', () => {
  recorre(datos, '', (obj, k, ruta) => {
    const es = aplana(obj[k]), en = aplana(obj[k + '_en']);
    es.forEach((t, i) => assert.deepEqual(nums(en[i]), nums(t), ruta + '\n  ES: ' + t + '\n  EN: ' + en[i]));
  });
});

test('ningún campo _en huérfano (sin su campo en español)', () => {
  (function huerfanos(v, ruta) {
    if (Array.isArray(v)) v.forEach((x, i) => huerfanos(x, ruta + '[' + i + ']'));
    else if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        if (k.endsWith('_en')) assert.ok(k.slice(0, -3) in v, 'huérfano ' + ruta + '/' + k);
        else huerfanos(v[k], ruta + '/' + k);
      }
    }
  })(datos, '');
});

function paginas(lang) {
  RBT.setLang(lang);
  const hs = [RBAgricola.html(datos, zonas, null)];
  for (const f of datos.fichas) hs.push(RBAgricola.html(datos, zonas, f.id));
  return hs.join('\n');
}

test('inglés: la pantalla agrícola no deja palabras de interfaz en español', (t) => {
  t.after(() => RBT.setLang('es'));
  const h = paginas('en');
  for (const es of ['Cerrar', 'Fuentes', 'Fuente:', 'Buscar', 'Rastrear', 'Consultado', 'Motivo', 'Zona:', 'Pantallas',
    'Acciones', 'Inicio', 'Fichas', 'ANÁLISIS', 'Diagnóstico', 'ficha abierta', 'Pie de página', 'Selecciona',
    'Mapa interactivo', 'No se pudo', 'Equipo OptiPaz', 'Licencia']) {
    assert.ok(!h.includes(es), 'queda en español: ' + es);
  }
  for (const en of ['Close', 'Sources', 'Source:', 'Reason:', 'Accessed:', 'Search locality', 'Track Terrain', 'Zone:',
    'Screens', 'Actions', 'Home', 'AGROCLIMATIC ANALYSIS', 'Interactive map', 'details open', 'Page footer',
    'Farming Map', 'Team OptiPaz']) {
    assert.ok(h.includes(en), 'falta en inglés: ' + en);
  }
  assert.ok(h.includes('Feasibility and Crops'));
  assert.ok(h.includes('Municipality of La Paz'));
  assert.ok(!/[áéíóúñ¿¡]/i.test(h.replace(/&[a-z]+;/g, '')), 'quedan caracteres del español: ' + (h.match(/.{20}[áéíóúñ¿¡].{20}/i) || [''])[0]);
});

test('español sin parámetro: textos y marcas de siempre', (t) => {
  t.after(() => RBT.setLang('es'));
  const h = paginas('es');
  for (const es of ['>Mapa Agrícola</h1>', 'Cerrar</span></button>', '>Fuentes (', 'Fuente: ', '<b>Motivo:</b>', 'Consultado: ',
    'Rastrear Terreno', 'placeholder="Buscar localidad (Los Planes, El Carrizal…)"', 'ANÁLISIS AGROCLIMÁTICO',
    'Diagnóstico Agroclimático &amp; Sanidad de Suelos', 'Zona: <b>Municipio de La Paz, B.C.S.</b>', 'ficha abierta',
    'aria-label="Pie de página"', 'Licencia Apache-2.0', 'Factibilidad y Cultivos', 'Tomate rojo (jitomate)']) {
    assert.ok(h.includes(es), 'cambió el español: ' + es);
  }
  assert.ok(!h.includes('Farming Map') && !h.includes('Close</button>'));
});

test('inglés: si un dato no trae _en se muestra el español (respaldo)', (t) => {
  t.after(() => RBT.setLang('es'));
  RBT.setLang('en');
  const copia = JSON.parse(JSON.stringify(datos));
  delete copia.fichas[0].titulo_en;
  const h = RBAgricola.html(copia, zonas, null);
  assert.ok(h.includes('Factibilidad y Cultivos'));
  assert.ok(h.includes('Climate and Water'));
});
