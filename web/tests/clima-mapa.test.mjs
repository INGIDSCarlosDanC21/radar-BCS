// Pestaña Mapa como el frame "Clima - Mapa" de Figma: mapa con íconos del cielo y "Diagnóstico Climático Territorial".
// Sin red: usa una respuesta real de Open-Meteo (con datos diarios) guardada el 2026-11-15.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const T = require('../js/textos.js');
const CL = require('../js/cielo.js');
const CM = require('../js/clima-mapa.js');
const resp = require('./fixtures/open-meteo-diario-2026-11-15.json');
const leer = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const conFetch = { fetch: () => Promise.resolve({ ok: true, json: () => resp }), intervalo: 0 };

test('estructura de Figma: título, mapa, leyenda y 4 tarjetas que llevan a pantallas que existen', () => {
  T.setLang('es');
  const h = CM.html();
  assert.match(h, /<h1 id="cm-h1">Mapa Meteorológico<\/h1>/);
  assert.match(h, /<h2>Diagnóstico Climático Territorial<\/h2>/);
  assert.match(h, /id="cm-mapa"/); assert.match(h, /Estado del cielo/);
  const titulos = ['Calor & Sensación Térmica', 'Radiación UV & Exposición Solar', 'Viento, Oleaje & Corrientes', 'Humedad y Lluvia'];
  for (const ti of titulos) assert.ok(h.includes(ti.replace(/&/g, '&amp;')), ti);
  const destinos = [...h.matchAll(/class="cm-tarjeta cm-\w+" href="(#[\w/]+)"/g)].map((m) => m[1]);
  assert.deepEqual(destinos, ['#clima/calor', '#clima/uv', '#clima/viento', '#clima/lluvia']);
  const rutas = leer('js/app.js');
  for (const d of new Set(destinos)) assert.ok(rutas.includes("'" + d.slice(1).split('/')[0] + "'"), 'la ruta ' + d + ' existe');
  for (const ic of CM.TARJETAS.map((k) => k.icono)) assert.ok(fs.existsSync(new URL('../assets/iconos/' + ic + '.svg', import.meta.url)), ic);
});

test('las tarjetas usan cifras reales del modelo (sin las de ejemplo de la maqueta) y "—" si falta un dato', () => {
  T.setLang('es');
  const lp = CL.unir(resp)[0];
  const h = CM.tarjetas(lp);
  assert.ok(h.includes('Máx ' + Math.round(lp.max) + ' °C'));
  assert.ok(h.includes('Índice ' + Math.round(lp.uvMax)));
  assert.ok(h.includes(Math.round(lp.c.wind_speed_10m) + ' km/h ' + CL.rumbo(lp.c.wind_direction_10m)));
  assert.ok(h.includes(Math.round(lp.lluvia) + ' % lluvia'));
  assert.ok(h.includes('Humedad ahora: ' + Math.round(lp.c.relative_humidity_2m) + ' %'));
  for (const bad of ['34.5', 'Índice 11+', '18-25', 'NaN', 'undefined', 'null', 'Alerta de onda']) assert.ok(!h.includes(bad), bad);
  const vacio = CM.tarjetas({ lugar: lp.lugar, c: {}, max: null, uvMax: null, lluvia: null, rachas: null, e: lp.e });
  assert.ok(vacio.includes('Máx — °C') && !/NaN|undefined/.test(vacio));
});

test('los pines del mapa son los 20 lugares; los 7 de Inicio llevan el mismo nombre y la misma temperatura, y los 13 extra son pines chicos', () => {
  T.setLang('es');
  const filas = CL.unir(resp);
  const inicio = CL.pines(filas);
  assert.equal(filas.length, 20);
  assert.equal(filas.filter((f) => f.lugar.extra).length, 13);
  for (const f of filas) {
    const p = CM.pinHtml(f), temp = Math.round(f.c.temperature_2m) + '°C';
    assert.equal(p.includes('cm-pin-mini'), !!f.lugar.extra, 'pin chico solo para los extra: ' + f.lugar.es);
    assert.ok(p.includes('aria-label="' + f.lugar.es + ': ' + f.e.texto + ', ' + Math.round(f.c.temperature_2m) + ' °C"'), f.lugar.es);
    assert.ok(p.includes(temp) && (f.lugar.extra || inicio.includes('>' + f.lugar.es + ' ' + temp + '<')), 'mismo dato que Inicio: ' + f.lugar.es);
    assert.ok(p.includes('assets/iconos/cielo/' + f.e.icono + '.svg'), 'ícono del cielo de ' + f.lugar.es);
  }
});

test('cargar(): llena las tarjetas y dice que son los mismos datos que Inicio; sin red avisa', async () => {
  T.setLang('es');
  const nodos = { '#cm-tarjetas': { innerHTML: CM.tarjetas(null), isConnected: true }, '#cm-estado': { textContent: '', className: 'cm-estado' } };
  const raiz = { querySelector: (q) => nodos[q] || null };
  assert.equal(await CM.cargar(raiz, conFetch), true);
  assert.ok(nodos['#cm-tarjetas'].innerHTML.includes('Máx '));
  const hora = CL.unir(resp)[0].c.time.slice(11, 16);
  assert.equal(nodos['#cm-estado'].textContent, 'Mismos datos que las tarjetas · ' + hora);
  assert.equal(await CM.cargar(raiz, { fetch: () => Promise.reject(new Error('sin red')), intervalo: 0 }), false);
  assert.match(nodos['#cm-estado'].textContent, /tendencias por zona siguen abajo/);
});

test('Inicio y Mapa piden la misma URL y comparten la respuesta (una sola llamada cada 10 min)', async () => {
  assert.match(CL.url(), /daily=temperature_2m_min,temperature_2m_max,uv_index_max,precipitation_probability_max,wind_gusts_10m_max/);
  const app = leer('js/app.js'), html = leer('index.html');
  assert.ok(!/<h1>' \+ t\('titulo\.mapa'\)/.test(app), 'la pestaña Mapa ya no existe: su contenido vive dentro de Clima');
  assert.ok(!/CM\.html\(\)/.test(app.slice(app.indexOf('function mapaVista'), app.indexOf('function buscadorHtml'))));
  assert.match(app, /window\.RBClimaMapa\.cargar\(main, \{ abrir: \(h\[1\] === 'zonas' \|\| h\[1\] === 'acciones'\) \? null : \(h\[1\] \|\| null\), lugar: h\[2\] \|\| null \}\)/, 'la pestaña Clima lo carga');
  const i = (s) => html.indexOf(s);
  assert.ok(i('js/cielo.js') < i('js/clima-mapa.js') && i('js/clima-mapa.js') < i('js/app.js'), 'orden de scripts');
  assert.ok(html.includes('css/clima-mapa.css'));
  assert.match(leer('js/clima-mapa.js'), /CL\.datos\(opciones\)/, 'usa los datos compartidos de cielo.js');
});

test('en inglés', () => {
  T.setLang('en');
  const h = CM.html() + CM.tarjetas(CL.unir(resp)[0]);
  T.setLang('es');
  for (const en of ['Weather Map', 'Regional Climate Overview', 'Heat & Feels-like Temperature', 'See wind, waves and currents', 'How each zone of La Paz has changed since 2001'])
    assert.ok(h.includes(en.replace(/&/g, '&amp;')), en);
  for (const es of ['Mapa Meteorológico', 'Diagnóstico', 'Ver consejos']) assert.ok(!h.includes(es), es);
});

test('lugar elegido: las tarjetas apuntan a #clima/<ficha>/<lugar> con los valores de ese lugar', () => {
  T.setLang('es');
  const filas = CL.unir(resp);
  const loreto = filas.find((f) => f.lugar.id === 'loreto');
  const h = CM.tarjetas(loreto);
  const destinos = [...h.matchAll(/class="cm-tarjeta cm-\w+" href="(#[\w/]+)"/g)].map((m) => m[1]);
  assert.deepEqual(destinos, ['#clima/calor/loreto', '#clima/uv/loreto', '#clima/viento/loreto', '#clima/lluvia/loreto']);
  const nodos = { '#cm-tarjetas': { innerHTML: '' }, '#cm-diag-sub': { innerHTML: '' } };
  const pines = [{ a: 'loreto', c: new Set() }, { a: 'lapaz', c: new Set() }].map((x) => ({ getAttribute: () => x.a, classList: { toggle: (n, on) => (on ? x.c.add(n) : x.c.delete(n)) }, x }));
  const raiz = { querySelector: (q) => nodos[q] || null, querySelectorAll: (q) => (q.startsWith('.cm-pin') ? pines : []) };
  CM.cargar({ querySelector: () => null }, conFetch); // sin nodos: no hace nada
  return CM.cargar({ querySelector: (q) => (q === '#cm-tarjetas' ? nodos[q] : q === '#cm-estado' ? { textContent: '' } : null), querySelectorAll: (q) => (q.startsWith('.cm-pin') ? pines : []) }, conFetch).then(() => {
    CM.elegir(raiz, 'loreto');
    assert.ok(nodos['#cm-diag-sub'].innerHTML.includes('Loreto'));
    assert.ok(nodos['#cm-tarjetas'].innerHTML.includes('/loreto"'));
    assert.ok(pines[0].x.c.has('cm-pin-sel') && !pines[1].x.c.has('cm-pin-sel'));
  });
});

test('fichas: cada lugar del mapa con ficha tiene un pueblo real en RBVivo.PUERTOS; Comondú se avisa sin ficha', () => {
  const clima = leer('js/clima.js'), vivo = leer('js/datos-vivos.js');
  const mapa = clima.match(/var LUGAR_PUEBLO = \{([^}]*)\}/)[1];
  const pares = [...mapa.matchAll(/(\w+): '(\w+)'/g)];
  assert.equal(pares.length, 6);
  for (const [, lugar, pueblo] of pares) {
    assert.ok(CL.LUGARES.some((l) => l.id === lugar), 'lugar ' + lugar);
    assert.ok(vivo.includes("id: '" + pueblo + "'"), 'pueblo ' + pueblo);
  }
  assert.ok(!mapa.includes('comondu') && leer('js/clima-mapa.js').includes('cm.sinFicha'));
});

// Buscador de lugar y fecha (pedido de UI/UX, 2026-11-15) y ficha debajo de su tarjeta.
const diaResp = CL.LUGARES.map((l, k) => ({ daily: { time: ['2026-09-15'], weather_code: [k === 1 ? 61 : 2], temperature_2m_max: [34.1], temperature_2m_min: [25.2],
  apparent_temperature_max: [39.4], apparent_temperature_min: [28.0], uv_index_max: [8.4], sunshine_duration: [39600], sunrise: ['2026-09-15T06:10'], sunset: ['2026-09-15T18:30'],
  wind_speed_10m_max: [13.2], wind_gusts_10m_max: [31.7], wind_direction_10m_dominant: [225], precipitation_sum: [4.2], precipitation_probability_max: [44], relative_humidity_2m_mean: [74] } }));

test('buscador: formulario con lugar y fecha, y búsqueda tolerante a acentos y nombres cortos', () => {
  T.setLang('es');
  const h = CM.html();
  assert.match(h, /<form class="cm-busca" id="cm-busca" role="search"/);
  assert.match(h, /<label for="cm-q">Lugar<\/label><input id="cm-q" type="search" list="cm-lista"/);
  assert.match(h, /<label for="cm-f">Fecha<\/label><input id="cm-f" type="date" min="\d{4}-\d{2}-\d{2}" max="\d{4}-\d{2}-\d{2}" value="\d{4}-\d{2}-\d{2}"/);
  assert.equal(CM.buscarLugar('los cabos').id, 'loscabos');
  assert.equal(CM.buscarLugar('COMONDU').id, 'comondu');
  assert.equal(CM.buscarLugar('Guerrero Negro').id, 'guerreronegro');
  assert.equal(CM.buscarLugar('mulegé').id, 'mulege');
  assert.equal(CM.buscarLugar('xyz'), null);
  assert.equal(CM.buscarLugar('San'), null, 'ambiguo: San José del Cabo y San Juan de la Costa');
});

test('fechas: de hoy − 92 a hoy + 15 días (rango que acepta Open-Meteo) y URL diaria de los 20 lugares', () => {
  const r = CM.rangoFechas(new Date('2026-11-15T18:00:00Z'));
  assert.deepEqual(r, { min: '2026-08-15', max: '2026-11-30', hoy: '2026-11-15' });
  const u = CM.urlDia('2026-09-15');
  assert.match(u, /start_date=2026-09-15&end_date=2026-09-15/);
  assert.match(u, /timezone=America%2FMazatlan/);
  assert.equal(u.split('latitude=')[1].split('&')[0].split(',').length, 20);
  for (const v of ['temperature_2m_max', 'apparent_temperature_max', 'uv_index_max', 'wind_gusts_10m_max', 'precipitation_probability_max', 'relative_humidity_2m_mean']) assert.ok(u.includes(v), v);
});

test('día elegido: tarjetas y ficha con los valores de ese día, sin NaN, en ES y EN', () => {
  T.setLang('es');
  const filas = CM.unirDia(diaResp, '2026-09-15');
  const cabos = filas.find((f) => f.lugar.id === 'loscabos');
  const h = CM.tarjetas(cabos);
  for (const s of ['Máx 34 °C', 'Sensación máxima: 39 °C', 'Índice 8', 'Máximo del día: Muy alto', '13 km/h SO', 'Ráfagas de hasta 32 km/h', '44 % lluvia', 'Humedad media: 74 %']) assert.ok(h.includes(s), s);
  assert.ok(h.includes('href="#clima/calor/loscabos"'));
  const d = CM.detalleDia(cabos, 'lluvia');
  assert.ok(d.includes('Humedad y Lluvia en Los Cabos · 15 de septiembre de 2026'), d.slice(0, 200));
  for (const s of ['4.2 mm', '44 %', '74 %', 'data-cerrar', 'no son estaciones']) assert.ok(d.includes(s), s);
  const com = CM.detalleDia(filas.find((f) => f.lugar.id === 'comondu'), 'viento');
  assert.ok(com.includes('Mapa Pesquero') && com.includes('31.7') === false && com.includes('32 km/h'), 'Comondú tiene ficha del día');
  for (const id of ['calor', 'uv', 'viento', 'lluvia']) assert.ok(!/NaN|undefined|null/.test(CM.detalleDia(cabos, id)), id);
  const vacia = CM.unirDia([{}], '2026-09-15')[0];
  assert.ok(!/NaN|undefined/.test(CM.tarjetas(vacia) + CM.detalleDia(vacia, 'calor')));
  T.setLang('en');
  const en = CM.tarjetas(cabos) + CM.detalleDia(cabos, 'uv');
  T.setLang('es');
  for (const s of ['Highest feels-like: 39 °C', "Day's peak", 'Gusts up to 32 km/h', 'Average humidity: 74 %', 'September 15, 2026', 'Hours of sun']) assert.ok(en.includes(s.replace(/'/g, '&#39;')), s);
});

test('la ficha abierta se coloca justo después de la fila de su tarjeta', () => {
  CM.html(); // reinicia el estado
  const hijos = [];
  const mk = (cls) => ({ className: cls, parentNode: null });
  const grid = { id: 'cm-tarjetas', parentNode: { insertBefore: () => {} },
    querySelectorAll: () => hijos.filter((x) => x.className.startsWith('cm-tarjeta')),
    querySelector: (q) => hijos.find((x) => q.endsWith((x.id ? x.id : x.className.split(' ')[1]))) || null,
    insertBefore: (n, ref) => { const i = hijos.indexOf(n); if (i >= 0) hijos.splice(i, 1); const j = ref ? hijos.indexOf(ref) : hijos.length; hijos.splice(j, 0, n); n.parentNode = grid; } };
  ['calor', 'uv', 'viento', 'lluvia'].forEach((id) => { const c = mk('cm-tarjeta cm-' + id); c.parentNode = grid; hijos.push(c); });
  hijos.forEach((c, i) => { c.nextSibling = undefined; Object.defineProperty(c, 'nextSibling', { get: () => hijos[hijos.indexOf(c) + 1] || null }); });
  const ficha = { id: 'cm-ficha', className: 'cl-det cm-ficha', parentNode: null, hidden: true, innerHTML: '', querySelector: () => null };
  const raiz = { querySelector: (q) => (q === '#cm-ficha' ? ficha : q === '#cm-tarjetas' ? grid : null) };
  global.getComputedStyle = () => ({ gridTemplateColumns: '300px 300px' });
  CM.abrirFicha(raiz, 'calor');
  assert.deepEqual(hijos.map((x) => x.id || x.className.split(' ')[1]), ['cm-calor', 'cm-uv', 'cm-ficha', 'cm-viento', 'cm-lluvia'], 'escritorio: después de la fila 1');
  CM.abrirFicha(raiz, 'lluvia');
  assert.equal(hijos.at(-1), ficha, 'escritorio: fila 2, al final');
  global.getComputedStyle = () => ({ gridTemplateColumns: '360px' });
  CM.abrirFicha(raiz, 'uv');
  assert.deepEqual(hijos.map((x) => x.id || x.className.split(' ')[1]), ['cm-calor', 'cm-uv', 'cm-ficha', 'cm-viento', 'cm-lluvia'], 'celular: justo debajo de su tarjeta');
  delete global.getComputedStyle;
  assert.match(leer('css/clima-mapa.css'), /\.cm-tarjetas>\.cm-ficha\{grid-column:1\/-1/);
});

test('el mapa refleja el filtro: globo con las condiciones del lugar (ahora o del día) y rótulo sobre el mapa', () => {
  T.setLang('es');
  const hoy = CM.popupHtml(CL.unir(resp).find((f) => f.lugar.id === 'loscabos'));
  assert.match(hoy, /<strong>Los Cabos<\/strong><br>Ahora · /);
  assert.match(hoy, /°C \(sensación -?\d+ °C\) · UV máx\. \d+ · viento \d+ km\/h · lluvia \d+ %/);
  const dia = CM.popupHtml(CM.unirDia(diaResp, '2026-09-15').find((f) => f.lugar.id === 'loscabos'));
  assert.ok(dia.includes('15 de septiembre de 2026 · ') && dia.includes('Máx. 34 °C · mín. 25 °C · UV máx. 8 · rachas 32 km/h · lluvia 44 % (4.2 mm)'), dia);
  assert.match(CM.html(), /<p class="cm-mapa-rot" id="cm-mapa-rot" role="status" hidden><\/p>/);
  const js = leer('js/clima-mapa.js');
  assert.match(js, /OPC = opciones; enlazar\(raiz\);/, 'el buscador se activa aunque falle la carga de ahora');
  assert.ok(js.includes("e.message === '429' ? 'cm.limite'"), 'avisa cuando Open-Meteo llega a su límite diario');
});
