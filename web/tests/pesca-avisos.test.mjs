import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';

// Pesca y Avisos (docs/PLAN-PESCA-AVISOS.md). Reglas: ningún dato ni aviso inventado, umbrales con fuente,
// "estado del mar" y avisos del modelo rotulados como NO oficiales, sin tablas ni gráficas, menú superior de texto y menú inferior con iconos.
const require = createRequire(import.meta.url);
globalThis.window = {};
const T = require('../js/textos.js'); window.RBT = T;
window.RB = require('../js/reglas.js');
const V = require('../js/datos-vivos.js'); window.RBVivo = V;
const M = require('../js/reglas-mar.js'); window.RBMar = M;
window.RBMapaIconos = require('../js/mapa-iconos.js');
const Pesca = require('../js/pesca.js');
const Avisos = require('../js/avisos.js');
const Menu = require('../js/menu.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const fx = JSON.parse(leer('tests/fixtures/mar-2026-11-15.json'));
const datos = V.unir(fx.mar, fx.pron);

test('escala de Douglas: grados y límites (fuente en reglas-mar.js)', () => {
  const casos = [[0, 0], [0.05, 1], [0.1, 2], [0.49, 2], [0.5, 3], [1.24, 3], [1.25, 4], [2.49, 4], [2.5, 5], [3.99, 5], [4, 6], [6, 7], [9, 8], [14, 9], [20, 9]];
  for (const [h, g] of casos) assert.equal(M.douglas(h), g, h + ' m');
  assert.equal(M.douglas(null), null);
});

test('escala de Beaufort: fuerzas y límites en nudos', () => {
  const casos = [[0.5, 0], [1, 1], [4, 2], [7, 3], [11, 4], [17, 5], [21.9, 5], [22, 6], [28, 7], [34, 8], [41, 9], [48, 10], [56, 11], [64, 12]];
  for (const [kt, f] of casos) assert.equal(M.beaufort(kt), f, kt + ' kt');
});

test('niveles de aviso: oleaje (>=1.25, >=2.5, >=4 m), viento (>=22, >=34, >=48 kt), código WMO y UV de la OMS', () => {
  assert.deepEqual([1.24, 1.25, 2.5, 4].map(M.nivelOla), [0, 1, 2, 3]);
  assert.deepEqual([21, 22, 33, 34, 47, 48].map(M.nivelViento), [0, 1, 1, 2, 2, 3]);
  assert.deepEqual([0, 61, 63, 81, 65, 67, 82, 95, 96, 99].map(M.nivelCodigo), [0, 0, 1, 1, 2, 2, 2, 2, 2, 2]);
  assert.deepEqual([7.9, 8, 10.9, 11].map(M.nivelUV), [0, 1, 1, 2]);
  assert.equal(M.nivelOla(null), null);
});

test('estado del mar: verde, amarillo o rojo con el peor de oleaje y viento; si falta un dato dice "sin dato"', () => {
  assert.equal(M.estadoMar(1.0, 10), 'verde');
  assert.equal(M.estadoMar(1.3, 10), 'amarillo');
  assert.equal(M.estadoMar(0.5, 22), 'amarillo');
  assert.equal(M.estadoMar(2.5, 5), 'rojo');
  assert.equal(M.estadoMar(0.5, 34), 'rojo');
  assert.equal(M.estadoMar(null, 10), null, 'sin oleaje no se adivina');
  assert.equal(M.estadoMar(1, null), null);
  assert.equal(M.estadoMar(null, null), null);
});

test('no se usan umbrales sin fuente verificada (calor ni milímetros por hora)', () => {
  const f = leer('js/reglas-mar.js');
  assert.match(f, /NO se usan umbrales de calor ni de milímetros por hora/);
  assert.doesNotMatch(f.replace(/\/\*[\s\S]*?\*\//, ''), /apparent|heat|calor|mm\/h/i);
});

test('datos-vivos: dos llamadas a Open-Meteo, 19 puertos, 96 horas, hora de La Paz y viento en nudos', () => {
  const m = new URL(V.urlMar()), p = new URL(V.urlPron());
  assert.equal(m.host, 'marine-api.open-meteo.com'); assert.equal(p.host, 'api.open-meteo.com');
  assert.equal(m.searchParams.get('latitude').split(',').length, 19);
  assert.equal(p.searchParams.get('latitude').split(',').length, 38, '19 de mar + 19 pueblos');
  for (const u of [m, p]) { assert.equal(u.searchParams.get('timezone'), 'America/Mazatlan'); assert.equal(u.searchParams.get('past_days'), '1'); assert.equal(u.searchParams.get('forecast_days'), '3'); }
  assert.equal(p.searchParams.get('wind_speed_unit'), 'kn');
  assert.ok(![...m.searchParams.keys(), ...p.searchParams.keys()].some((k) => /key|token/i.test(k)));
  assert.equal(V.PUERTOS.length, 19);
  for (const q of V.PUERTOS) { assert.ok(q.mar[0] > 22 && q.mar[0] < 28.5 && q.mar[1] < -109 && q.mar[1] > -115.5, q.nombre); }
});

test('datos-vivos: unir con respuestas reales; rechaza respuestas incompletas', () => {
  assert.equal(datos.puertos.length, 19); assert.equal(datos.horas.length, 96);
  for (const p of datos.puertos) for (const k of ['ola', 'per', 'dir', 'sst', 'viento', 'rachas', 'codigo', 'uv']) assert.equal(p.s[k].length, 96, p.id + '.' + k);
  assert.equal(V.unir(fx.mar.slice(0, 5), fx.pron), null);
  assert.equal(V.unir(fx.mar, fx.pron.slice(0, 10)), null);
  assert.equal(V.unir(null, null), null);
  const rota = JSON.parse(JSON.stringify(fx)); rota.mar[0].hourly.wave_height = rota.mar[0].hourly.wave_height.slice(0, 10);
  assert.equal(V.unir(rota.mar, rota.pron).puertos[0].s.ola, null, 'una serie con otra longitud queda en null, no se rellena');
});

test('datos-vivos: índice de la hora actual en hora de La Paz', () => {
  assert.equal(datos.horas[V.indiceAhora(datos.horas, '2026-11-15 10:30')], '2026-11-15T10:00');
  assert.equal(V.indiceAhora(datos.horas, '2026-11-14 00:05'), 0);
  assert.equal(V.fechaDe('2026-11-15T10:00'), '2026-11-15'); assert.equal(V.horaDe('2026-11-15T10:00'), '10:00');
  assert.equal(V.sumaDias('2026-11-01', -1), '2026-10-31');
});

test('datos-vivos: caché de 10 minutos, errores HTTP y respuestas que no cuadran', async () => {
  let llamadas = 0;
  const f = async (u) => { llamadas++; return { ok: true, json: async () => (u.includes('marine') ? fx.mar : fx.pron) }; };
  const mem = {}; const st = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } };
  const a = await V.cargar({ fetch: f, storage: st, ahoraMs: 1000 });
  assert.equal(a.cache, false); assert.equal(llamadas, 2);
  const b = await V.cargar({ fetch: f, storage: st, ahoraMs: 1000 + 5 * 60 * 1000 });
  assert.equal(b.cache, true); assert.equal(llamadas, 2, 'dentro de 10 minutos no vuelve a llamar');
  await V.cargar({ fetch: f, storage: st, ahoraMs: 1000 + 11 * 60 * 1000 });
  assert.equal(llamadas, 4, 'pasados 10 minutos vuelve a pedir');
  await assert.rejects(V.cargar({ fetch: async () => ({ ok: false, status: 500 }), storage: null }), /HTTP 500/);
  await assert.rejects(V.cargar({ fetch: async () => ({ ok: true, json: async () => ({}) }), storage: null }), /incompleta/);
  await assert.rejects(V.cargar({ fetch: async () => { throw new Error('sin red'); }, storage: null }), /sin red/);
});

// Datos sintéticos para forzar cada regla (todo en calma salvo lo que se cambia).
function calma() {
  const H = 96, ceros = () => new Array(H).fill(0.1);
  return { horas: Array.from({ length: H }, (_, i) => '2026-11-15T' + String(i % 24).padStart(2, '0') + ':00'), puertos: V.PUERTOS.map((p) => ({ id: p.id, nombre: p.nombre, s: { ola: ceros(), per: ceros(), dir: ceros(), sst: ceros(), corr: ceros(), viento: new Array(H).fill(5), rachas: ceros(), vdir: ceros(), codigo: new Array(H).fill(0), uv: new Array(H).fill(2) } })) };
}
test('avisos del modelo: cada regla se dispara con su umbral y no antes', () => {
  const d = calma(); const i0 = 30;
  assert.deepEqual(M.avisos(d, i0, 24), [], 'todo en calma: ningún aviso');
  d.puertos[0].s.ola[i0 + 5] = 2.6; d.puertos[1].s.ola[i0 + 2] = 2.6;
  let r = M.avisos(d, i0, 24); assert.equal(r.length, 1);
  assert.equal(r[0].id, 'ola.2'); assert.equal(r[0].nivel, 2); assert.equal(r[0].desde, i0 + 2); assert.deepEqual(r[0].zonas.sort(), [d.puertos[0].nombre, d.puertos[1].nombre].sort()); assert.equal(r[0].pico, 2.6);
  d.puertos[2].s.viento[i0] = 50; d.puertos[3].s.codigo[i0 + 1] = 95; d.puertos[4].s.uv[i0 + 3] = 12; d.puertos[5].s.codigo[i0 + 4] = 65; d.puertos[6].s.codigo[i0 + 4] = 63;
  r = M.avisos(d, i0, 24); const ids = r.map((x) => x.id);
  for (const id of ['ola.2', 'viento.3', 'tormenta.2', 'uv.2', 'lluvia.2', 'lluvia.1']) assert.ok(ids.includes(id), id);
  assert.equal(r[0].nivel, 3, 'los críticos van primero'); assert.equal(r.find((x) => x.id === 'viento.3').ahora, true);
  // fuera de la ventana de 24 h no cuenta
  const d2 = calma(); d2.puertos[0].s.ola[i0 + 30] = 5; assert.deepEqual(M.avisos(d2, i0, 24), []);
});
test('avisos del modelo: sin datos no hay avisos (nunca se inventa uno)', () => {
  const d = calma(); d.puertos.forEach((p) => { for (const k of Object.keys(p.s)) p.s[k] = null; });
  assert.deepEqual(M.avisos(d, 30, 24), []); assert.deepEqual(M.tranquilos(d, 30), []);
});
test('avisos con datos reales: cada aviso trae zonas, hora dentro de la ventana y un umbral cumplido', () => {
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  const lista = M.avisos(datos, idx, 24);
  for (const a of lista) {
    assert.ok(a.zonas.length > 0 && a.nivel >= 1 && a.desde >= idx && a.desde < idx + 24, a.id);
    if (a.tema === 'ola') assert.ok(a.pico >= 1.25, a.id);
    if (a.tema === 'viento') assert.ok(a.pico >= 22, a.id);
  }
});

test('Pesca: 19 pines por variable con tono por umbral y nombre accesible; sin dato = "—"', () => {
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  for (const v of ['ola', 'viento', 'sst']) {
    const ps = Pesca.pines(datos, idx, v, 'lapaz');
    assert.equal(ps.length, 19); assert.equal(ps.filter((p) => p.activo).length, 1);
    for (const p of ps) { assert.ok(p.etiqueta.length > 8 && p.valor && p.icono, p.id); assert.ok(['verde', 'amarillo', 'rojo', 'neutro'].includes(p.tono)); }
  }
  assert.ok(Pesca.pines(datos, idx, 'sst', 'lapaz').every((p) => p.tono === 'neutro'));
  const d = JSON.parse(JSON.stringify(datos)); d.puertos[0].s.ola = null;
  const p0 = Pesca.pines(d, idx, 'ola', 'x')[0]; assert.equal(p0.valor, '—'); assert.equal(p0.tono, 'neutro');
});
test('Pesca: 4 fichas cerradas con el formato de Agrícola, rotuladas como estimación y sin tablas ni gráficas', () => {
  T.setLang('es');
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  const html = Pesca.fichas(datos.puertos[0], idx, null, false, '2026-11-14');
  assert.equal((html.match(/class="ag-ficha ag-t-/g) || []).length, 4);
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 4);
  assert.match(html, /no es aviso oficial/); assert.match(html, /Estado del mar/);
  assert.doesNotMatch(html, /<table|<canvas|<td|<th|bandera/i);
});
test('Pesca: una ficha abierta muestra solo esa ficha (las otras 3 se omiten), con cierre y fuentes, sin textos de pendiente', () => {
  T.setLang('es');
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  for (const id of ['seg', 'oc', 'cl', 'clo']) {
    const html = Pesca.fichas(datos.puertos[0], idx, id, false, '2026-11-14');
    assert.equal((html.match(/data-ficha=/g) || []).length, 1, id);
    assert.match(html, /ag-abierta/); assert.match(html, /data-cerrar="1"/); assert.match(html, /role="region"/);
    assert.doesNotMatch(html, /Pendiente|Pending/); assert.match(html, /Open-Meteo/); assert.match(html, /Pilar \d/);
  }
  assert.match(Pesca.fichas(datos.puertos[0], idx, 'clo', true, '2026-11-14'), /aria-pressed="true"/);
  assert.match(Pesca.fichas(datos.puertos[0], idx, 'clo', false, '2026-11-14'), /aria-pressed="false"/);
});
test('Pesca: con datos faltantes la ficha dice "sin dato" y no inventa cifras', () => {
  T.setLang('es');
  const d = JSON.parse(JSON.stringify(datos)); const s = d.puertos[0].s;
  for (const k of Object.keys(s)) if (Array.isArray(s[k])) s[k] = s[k].map(() => null);
  const html = Pesca.fichas(d.puertos[0], 30, 'oc', false, '2026-11-14');
  assert.match(html, /sin dato/); assert.doesNotMatch(html, /NaN|undefined|null/);
});
test('Pesca: fichas en inglés', () => {
  T.setLang('en');
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  const html = Pesca.fichas(datos.puertos[0], idx, 'seg', false, '2026-11-14');
  assert.match(html, /Close/); assert.match(html, /Pillar 1/); assert.doesNotMatch(html, /Cerrar|Pendiente|Pilar/);
  T.setLang('es');
});
test('Pesca: la leyenda dice los umbrales y la de clorofila trae la escala', () => {
  T.setLang('es');
  assert.match(Pesca.leyenda('ola', false), /1\.25 a 2\.5 m/); assert.match(Pesca.leyenda('viento', false), /34 kt o más/);
  assert.equal(Pesca.leyenda('sst', false), '');
  assert.match(Pesca.leyenda('ola', true), /0\.01.*0\.1.*>1<|escala logarítmica/s);
});

test('Avisos: contador, filtros y grupos salen de los avisos reales; enlaces oficiales solo https a sitios oficiales', () => {
  T.setLang('es');
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  const modelo = Avisos.avisosModelo(datos, idx);
  const agro = Avisos.avisosAgro(JSON.parse(leer('data/agricola.json')));
  assert.ok(agro.length >= 1 && agro[0].detalle.length > 5 && agro.every((a) => a.fuente), 'avisos agrícolas con su fuente');
  const c = Avisos.cuerpo(modelo, agro);
  assert.equal(c.total, modelo.length + agro.length);
  assert.match(c.html, new RegExp('Todas \\(' + c.total + '\\)'));
  assert.match(c.html, /no son oficiales/);
  for (const g of ['meteo', 'agro', 'mar']) assert.match(c.html, new RegExp('data-grupo="' + g + '"'));
  const enlaces = [...c.html.matchAll(/class="av-of" href="([^"]+)"/g)].map((m) => new URL(m[1]).host);
  assert.deepEqual(enlaces.sort(), ['smn.conagua.gob.mx', 'www.gob.mx', 'www.gob.mx', 'www.gob.mx', 'www.nhc.noaa.gov']);
  assert.doesNotMatch(c.html, /<table|<canvas|<svg/i);
  assert.deepEqual(Avisos.avisosAgro(null), []); assert.deepEqual(Avisos.avisosAgro({ fichas: [] }), []);
});
test('Avisos: sin avisos del modelo se dice, y el aviso de modelo lleva su etiqueta', () => {
  T.setLang('es');
  const c = Avisos.cuerpo([], []);
  assert.equal(c.total, 0); assert.match(c.html, /Sin avisos del modelo ahora/);
  const a = Avisos.tarjeta({ grupo: 'mar', nivel: 2, tema: 'ola', titulo: 'Oleaje fuerte', detalle: 'Hasta 3.4 m', zonas: ['A', 'B', 'C', 'D', 'E'], cuando: 'Ahora', modelo: true });
  assert.match(a, />Modelo</); assert.match(a, /y 2 más/); assert.match(a, /Severo/);
});

test('inglés: mismas claves y {marcadores} en Pesca, Avisos, reglas del mar y menú; el diccionario las incluye', () => {
  const marcas = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const mod of [Pesca, Avisos, M, Menu]) {
    assert.deepEqual(Object.keys(mod.TX.en).sort(), Object.keys(mod.TX.es).sort());
    for (const k of Object.keys(mod.TX.es)) { assert.equal(marcas(mod.TX.en[k]), marcas(mod.TX.es[k]), k); assert.equal(T.DIC.es[k], mod.TX.es[k]); assert.equal(T.DIC.en[k], mod.TX.en[k]); }
  }
  T.setLang('en');
  assert.equal(M.textoOla(1.8), 'Moderate waves'); assert.match(T.t('pes.vViento', { v: 7, d: T.t('pes.r6') }), /7 kt from the west/);
  assert.equal(T.t('titulo.pesca'), 'Fishing Map'); assert.equal(T.t('niv.2'), 'Severe');
  T.setLang('es');
});

// Sin pestaña "Ficha" (pedido de UI/UX, 2026-11-15): las fichas se abren solo desde las tarjetas de Inicio.
test('menú: 5 secciones con ícono, Inicio al centro, sin hoja "Más" (Acciones vive dentro de Clima)', () => {
  const html = leer('index.html'), css = leer('css/menu.css');
  const sup = html.match(/<nav class="menu-sup"[\s\S]*?<\/nav>/)[0];
  const orden = ['clima', 'pesca', 'inicio', 'agricola', 'avisos'];
  assert.deepEqual([...sup.matchAll(/href="#([a-z]+)"/g)].map((m) => m[1]), orden, 'Inicio en el medio');
  assert.equal((sup.match(/mi-ic/g) || []).length, 5, 'el menú superior también lleva íconos');
  assert.ok(!html.includes('data-nav="ficha"'), 'ningún menú lleva la pestaña Ficha');
  assert.ok(!html.includes('data-nav="acciones"') && !html.includes('data-nav="mapa"') && !html.includes('id="mas"') && !html.includes('mas-btn'), 'sin Mapa, Acciones ni "Más"');
  const barra = html.match(/<nav class="barra"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...barra.matchAll(/href="#([a-z]+)"/g)].map((m) => m[1]), orden);
  assert.equal((barra.match(/mi-ic/g) || []).length, 5, 'cada pestaña de abajo lleva ícono');
  assert.match(barra, /<a href="#inicio" data-nav="inicio" class="barra-centro">/, 'Inicio es el botón central');
  assert.match(css, /\.menu-sup\{display:none\}/); assert.match(css, /@media \(min-width:1024px\)\{[\s\S]*\.menu-sup\{display:flex/); assert.match(css, /\.barra,\.mas\{display:none\}/);
  assert.match(css, /\.barra a\.barra-centro::before/);
  assert.equal(Menu.enMas('agricola'), false); assert.equal(Menu.enMas('acciones'), false);
  assert.equal(Menu.seccionDe('#pesca'), 'pesca'); assert.equal(Menu.seccionDe('#ficha/calor'), 'ficha'); assert.equal(Menu.seccionDe('#nada'), 'inicio');
});
test('rutas: app.js conoce #pesca y #avisos y no espera a indicadores.json; scripts y estilos cargados antes de app.js', () => {
  const app = leer('js/app.js'), html = leer('index.html');
  assert.match(app, /\['inicio', 'ficha', 'agricola', 'pesca', 'avisos', 'clima'\]/);
  assert.match(app, /if \(sec === 'pesca' \|\| sec === 'avisos' \|\| sec === 'clima'\)/);
  assert.match(app, /RBPesca\.limpiar\(\)/); assert.match(app, /RBAvisos\.limpiar\(\)/); assert.match(app, /RBClima\.limpiar\(\)/);
  const orden = ['textos', 'reglas', 'datos-vivos', 'reglas-mar', 'mapa-iconos', 'menu', 'reglas-clima', 'pesca', 'avisos', 'clima', 'app'].map((s) => html.indexOf('js/' + s + '.js'));
  assert.ok(orden.every((n) => n > 0) && orden.every((n, i) => i === 0 || n > orden[i - 1]), 'orden de scripts: ' + orden);
  for (const c of ['menu', 'pesca', 'avisos', 'clima']) assert.match(html, new RegExp('<link rel="stylesheet" href="css/' + c + '\\.css">'));
});
test('todos los iconos que usan Pesca, Avisos y el menú existen en web/assets/iconos', () => {
  const usados = new Set();
  const fuentes = ['js/pesca.js', 'js/avisos.js', 'js/mapa-iconos.js', 'js/menu.js', 'index.html'].map(leer).join('\n');
  for (const m of fuentes.matchAll(/iconos\/mapa\/([a-z_]+)\.svg/g)) usados.add('mapa/' + m[1]);
  for (const m of fuentes.matchAll(/(?:icono|icon)\('([a-z_]+)'/g)) usados.add('mapa/' + m[1]);
  for (const m of fuentes.matchAll(/icono = '([a-z_]+)'/g)) usados.add('mapa/' + m[1]);
  for (const m of fuentes.matchAll(/ICONO_NIVEL = \{([^}]*)\}/g)) for (const n of m[1].matchAll(/'([a-z_]+)'/g)) usados.add('mapa/' + n[1]);
  for (const m of fuentes.matchAll(/assets\/iconos\/(pesca-[a-z-]+)\.svg|'(pesca-[a-z-]+)'/g)) usados.add(m[1] || m[2]);
  assert.ok(usados.size >= 12, 'se esperaban varios iconos: ' + [...usados]);
  for (const u of usados) assert.ok(existsSync(new URL('assets/iconos/' + u + '.svg', raiz)), u);
});
test('sin afirmaciones oficiales inventadas: ni bandera, ni decretos, ni "alta biomasa" en las pantallas', () => {
  // Se ignoran los nombres de clase CSS (ag-dictamen se reutiliza del formato de Agrícola): importa el texto que ve la persona.
  const f = ['js/pesca.js', 'js/avisos.js', 'js/reglas-mar.js'].map(leer).join('\n').replace(/ag-dictamen(-t|-txt)?/g, 'ag-caja');
  assert.doesNotMatch(f, /Bandera Amarilla|decreta|Alta Biomasa|Zona Favorable|dictamen/i);
});

test('datos-vivos: las peticiones traen las variables nuevas de las fichas (presión, visibilidad, lluvia, CAPE, rocío, sol, mar de viento, nivel del mar)', () => {
  const p = new URL(V.urlPron()), m = new URL(V.urlMar());
  for (const k of ['pressure_msl', 'visibility', 'precipitation_probability', 'cape', 'dew_point_2m']) assert.ok(p.searchParams.get('hourly').split(',').includes(k), k);
  assert.equal(p.searchParams.get('daily'), 'sunrise,sunset');
  for (const k of ['wind_wave_height', 'wind_wave_period', 'sea_level_height_msl']) assert.ok(m.searchParams.get('hourly').split(',').includes(k), k);
});
test('Pesca: las fichas de condiciones y clima costero muestran las cifras nuevas tal cual y "sin dato" si faltan', () => {
  T.setLang('es');
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30'), p = JSON.parse(JSON.stringify(datos.puertos[0]));
  const sin = Pesca.fichas(p, idx, 'cl', false, '2026-11-14', datos.horas[idx]);
  assert.match(sin, /sin dato/); assert.doesNotMatch(sin, /NaN|undefined/);
  const n = datos.horas.length, rep = (v) => Array.from({ length: n }, () => v);
  Object.assign(p.s, { pres: rep(998.4), vis: rep(24000), pll: rep(35), cape: rep(120), rocio: rep(15.2), olaV: rep(0.6), perV: rep(4), nivel: rep(0.45) });
  p.sol = [{ fecha: datos.horas[idx].slice(0, 10), amanecer: '2026-11-15T06:36', anochecer: '2026-11-15T17:34' }];
  const cl = Pesca.fichas(p, idx, 'cl', false, '2026-11-14', datos.horas[idx]);
  assert.match(cl, /998[.,]4 hPa/); assert.match(cl, /24[.,]0 km/); assert.match(cl, /35 %/); assert.match(cl, /120 J\/kg/); assert.match(cl, /15[.,]2 °C/);
  assert.match(cl, /06:36/); assert.match(cl, /17:34/); assert.match(cl, /Cambio en 3 h/);
  const oc = Pesca.fichas(p, idx, 'oc', false, '2026-11-14', datos.horas[idx]);
  assert.match(oc, /0[.,]6 m/); assert.match(oc, /0[.,]5 m|0[.,]4 m/); assert.match(oc, /No es la tabla oficial de mareas/);
});

test('Pesca: mareograma del día con máximo y mínimo del modelo, y sin curva si faltan datos', () => {
  T.setLang('es');
  const idx = 24 + 10, p = JSON.parse(JSON.stringify(datos.puertos[0]));
  p.s.nivel = Array.from({ length: datos.horas.length }, (_, i) => Math.round((0.5 + 0.4 * Math.sin(i / 2)) * 100) / 100);
  const m = Pesca.mareograma(p, idx);
  const dia = p.s.nivel.slice(24, 48);
  assert.equal(m.max, Math.max(...dia)); assert.equal(m.min, Math.min(...dia));
  assert.match(m.svg, /<svg[^>]*role="img"[^>]*aria-label="Nivel del mar del día/); assert.match(m.svg, /<polyline/);
  const html = Pesca.fichas(p, idx, 'oc', false, '2026-11-14', datos.horas[idx], null);
  assert.match(html, /Pilar 1 · Mareograma \(modelo\)/); assert.match(html, /No es la tabla oficial de mareas/);
  p.s.nivel = null; assert.equal(Pesca.mareograma(p, idx), null);
  assert.doesNotMatch(Pesca.fichas(p, idx, 'oc', false, '2026-11-14', datos.horas[idx], null), /Mareograma/);
});
test('Pesca: fase lunar del U.S. Naval Observatory pasada a la hora de La Paz; sin respuesta, la tarjeta no aparece', async () => {
  T.setLang('es');
  assert.equal(Pesca.urlLuna('2026-11-05'), 'https://aa.usno.navy.mil/api/moon/phases/date?date=2026-11-5&nump=4');
  const crudo = { phasedata: [{ day: 17, month: 11, phase: 'First Quarter', time: '11:48', year: 2026 }, { day: 24, month: 11, phase: 'Full Moon', time: '14:53', year: 2026 }, { day: 1, month: 12, phase: 'Raro', time: '06:08', year: 2026 }] };
  const f = Pesca.fasesLunares(crudo);
  assert.equal(f.length, 2, 'una fase desconocida se descarta');
  assert.equal(f[0].ms, Date.UTC(2026, 10, 17, 11, 48)); assert.equal(f[0].fase, 'pes.f.lunaCrec');
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  const con = Pesca.fichas(datos.puertos[0], idx, 'oc', false, '2026-11-14', datos.horas[idx], f);
  assert.match(con, /Cuarto creciente/); assert.match(con, /Luna llena/); assert.match(con, /Naval Observatory/);
  assert.match(con, /04:48/, '11:48 UT son las 04:48 en La Paz (UTC-7)');
  for (const sin of [null, false, undefined, []]) assert.doesNotMatch(Pesca.fichas(datos.puertos[0], idx, 'oc', false, '2026-11-14', datos.horas[idx], sin), /Fase lunar/);
  assert.deepEqual(Pesca.fasesLunares(null), []);
  await assert.rejects(Pesca.pedirLuna('2026-11-15', async () => ({ ok: false, status: 500 })), /HTTP 500/);
  const ok = await Pesca.pedirLuna('2026-11-15', async () => ({ ok: true, json: async () => crudo }));
  assert.equal(ok.length, 2);
});
test('Pesca: ninguna ficha muestra textos de pendiente ni tallas, vedas con fechas o avisos oficiales inventados', () => {
  const idx = V.indiceAhora(datos.horas, '2026-11-15 10:30');
  for (const lang of ['es', 'en']) {
    T.setLang(lang);
    for (const id of ['seg', 'oc', 'cl', 'clo']) {
      const h = Pesca.fichas(datos.puertos[0], idx, id, false, '2026-11-14', datos.horas[idx], null);
      assert.doesNotMatch(h, /Pendiente|Pending|talla|size limit|bandera|flag/i, lang + id);
    }
  }
  T.setLang('es');
});
test('datos-vivos: pide también dirección y periodo del mar de fondo y la dirección del mar de viento', () => {
  const m = new URL(V.urlMar()).searchParams.get('hourly').split(',');
  for (const k of ['swell_wave_period', 'swell_wave_direction', 'wind_wave_direction']) assert.ok(m.includes(k), k);
});
