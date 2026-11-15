import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

// Buscador de puertos de Pesca: solo compara con los 19 puertos ya cargados (RB.coincidencias, compartido con Clima).
// No debe hacer ninguna petición (límite por IP de Open-Meteo).
const require = createRequire(import.meta.url);
globalThis.window = {};
const T = require('../js/textos.js'); window.RBT = T;
const RB = require('../js/reglas.js'); window.RB = RB;
const V = require('../js/datos-vivos.js'); window.RBVivo = V;
window.RBMar = require('../js/reglas-mar.js');
window.RBMapaIconos = require('../js/mapa-iconos.js');
const Pesca = require('../js/pesca.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const P = V.PUERTOS;
const id = (r) => (r.i >= 0 ? P[r.i].id : null);

test('coincidencia sin acentos, sin mayúsculas y con espacios de sobra', () => {
  assert.equal(id(Pesca.buscarPuerto(P, 'la paz')), 'lapaz');
  assert.equal(id(Pesca.buscarPuerto(P, '  LA PAZ ')), 'lapaz');
  assert.equal(id(Pesca.buscarPuerto(P, 'mulege')), 'mulege');
  assert.equal(id(Pesca.buscarPuerto(P, 'MULEGÉ')), 'mulege');
  assert.equal(id(Pesca.buscarPuerto(P, 'bahia tortugas')), 'bahiatortugas');
  assert.equal(id(Pesca.buscarPuerto(P, 'santa rosalia')), 'santarosalia');
  assert.equal(id(Pesca.buscarPuerto(P, 'lopez')), 'puertolopezmateos', 'parcial con un solo puerto');
  assert.equal(id(Pesca.buscarPuerto(P, 'Loreto')), 'loreto');
});

test('no encontrado, ambiguo y vacío', () => {
  assert.deepEqual(Pesca.buscarPuerto(P, 'Tijuana'), { i: -1, motivo: 'nada', varios: [] });
  assert.deepEqual(Pesca.buscarPuerto(P, '   '), { i: -1, motivo: 'vacio', varios: [] });
  const r = Pesca.buscarPuerto(P, 'cabo');
  assert.equal(r.motivo, 'varios');
  assert.deepEqual(r.varios.sort(), ['Cabo Pulmo', 'Cabo San Lucas', 'San José del Cabo']);
  // El mensaje de "no hay" da ejemplos reales de la lista de puertos.
  for (const n of ['La Paz', 'Loreto', 'Bahía Tortugas']) {
    assert.ok(P.some((p) => p.nombre === n), n);
    for (const l of ['es', 'en']) assert.ok(Pesca.TX[l]['pes.bVacio'].includes(n), l + ' ' + n);
  }
});

test('buscar un puerto no hace ninguna petición de red', () => {
  const antes = globalThis.fetch;
  let llamadas = 0;
  globalThis.fetch = window.fetch = () => { llamadas++; throw new Error('el buscador no debe pedir nada a la red'); };
  try {
    for (const q of ['la paz', 'cabo', 'zzz', '', 'Bahía Asunción', 'san juan']) Pesca.buscarPuerto(P, q);
    const h = Pesca.buscadorHtml(P);
    assert.match(h, /<label for="pe-q">[^<]+<\/label><input id="pe-q" type="search" list="pe-lista"/);
    assert.match(h, /role="search"/);
    assert.match(h, /id="pe-q-msg" role="status" aria-live="polite"/);
    assert.equal((h.match(/<option /g) || []).length, P.length, 'una opción por cada puerto ya cargado');
  } finally { globalThis.fetch = antes; delete window.fetch; }
  assert.equal(llamadas, 0);
  // El código del buscador dentro de montar() no llama a fetch ni vuelve a cargar datos.
  const src = leer('js/pesca.js');
  const bloque = src.slice(src.indexOf('function aplicarBusqueda'), src.indexOf("addEventListener('submit'"));
  assert.ok(bloque.length > 100);
  assert.doesNotMatch(bloque, /fetch|cargar\(|pedirLuna|XMLHttpRequest/);
});

test('textos del buscador: mismas claves y {placeholders} en ES y EN', () => {
  const es = Object.keys(Pesca.TX.es).sort(), en = Object.keys(Pesca.TX.en).sort();
  assert.deepEqual(es, en);
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const k of es.filter((k) => /^pes\.b/.test(k) || k === 'pes.busca')) {
    assert.ok(Pesca.TX.es[k] && Pesca.TX.en[k], k);
    assert.equal(ph(Pesca.TX.es[k]), ph(Pesca.TX.en[k]), k);
  }
  assert.ok(es.includes('pes.bVacio') && es.includes('pes.bOk') && es.includes('pes.bVarios'));
});

test('campo móvil: 44 px de alto y letra de 16 px (sin zoom al escribir)', () => {
  const css = leer('css/clima-mapa.css');
  assert.match(css, /\.cm-campo input\{min-height:44px;[^}]*font-size:16px/);
  assert.match(leer('js/pesca.js'), /class="cm-campo"><label for="pe-q">/);
});

test('Clima usa el mismo buscador compartido (RB.buscarNombre)', () => {
  assert.equal(RB.buscarNombre(P, 'la paz'), P.findIndex((p) => p.id === 'lapaz'));
  assert.match(leer('js/clima.js'), /RB\.buscarNombre\(puertos, texto\)/);
  assert.match(leer('js/clima-mapa.js'), /RB\.buscarNombre\(CL\.LUGARES/);
});
