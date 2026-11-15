import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

// "Cómo ha cambiado cada lugar" (decisión de Carlos, 2026-11-15): el mapa de zonas vive dentro de Clima, con 38 localidades de BCS
// para calor del aire y lluvia (NASA POWER por celda) y el agua como dato regional. Reglas: sin cifra donde no hay cambio claro,
// las localidades de una misma celda se declaran, y nada se inventa.
const require = createRequire(import.meta.url);
globalThis.window = {};
const RBT = require('../js/textos.js');
globalThis.window.RBT = RBT;
globalThis.window.RB = require('../js/reglas.js');
globalThis.window.RBZonas = require('../js/zonas-busqueda.js');
const LU = require('../js/lugares.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const LOCS = JSON.parse(leer('data/localidades_tendencias.json'));
const IND = JSON.parse(leer('data/indicadores.json')).indicadores;

function elemento() { return { innerHTML: '', textContent: '', hidden: false }; }
function domFalso() {
  const els = {};
  globalThis.document = { getElementById: (id) => (els[id] = els[id] || elemento()) };
  delete globalThis.L;   // sin Leaflet
  return els;
}

test('los datos publicados: 38 localidades en 21 celdas, de 5 municipios, con cifra solo si el cambio es claro', () => {
  assert.equal(LOCS.localidades.length, 38);
  assert.equal(LOCS.celdas_distintas, 21);
  assert.equal(new Set(LOCS.localidades.map((l) => l.municipio)).size, 5);
  for (const l of LOCS.localidades) for (const id of ['calor', 'lluvia']) {
    const c = l[id];
    assert.equal(c.cambio_total != null, c.significativo === true, l.nombre + ' ' + id + ': cifra solo si es significativo');
  }
});

test('las localidades de una celda se declaran entre sí (misma serie, mismo resultado)', () => {
  const por = new Map(LOCS.localidades.map((l) => [l.id, l]));
  for (const l of LOCS.localidades) for (const otro of l.comparte_celda_con) {
    const o = por.get(otro);
    assert.deepEqual(o.celda, l.celda, l.id + ' y ' + otro);
    assert.equal(o.calor.cambio_total, l.calor.cambio_total);
    assert.equal(o.lluvia.cambio_total, l.lluvia.cambio_total);
    assert.ok(o.comparte_celda_con.includes(l.id), 'es simétrico');
  }
});

test('representantes: un lugar por celda de POWER para el zoom lejano', () => {
  const rep = LU.representantes(LOCS.localidades);
  assert.equal(Object.keys(rep).length, 21);
  assert.ok(rep.lapaz && rep.cabosanlucas && !rep.sanjosedelcabo, 'el primero de cada celda (la lista va de más a menos habitado)');
});

test('cercano: el lugar con dato más cercano y la distancia', () => {
  const c = LU.cercano(LOCS.localidades, 24.14, -110.31);
  assert.equal(c.l.id, 'lapaz'); assert.ok(c.km < 1);
  const d = LU.cercano(LOCS.localidades, 32.5, -117.0);   // Tijuana: lejos de cualquier lugar de BCS
  assert.ok(d.km > 400);
  assert.ok(Math.abs(LU.distKm(24.14, -110.31, 22.89, -109.91) - 145) < 10, 'La Paz a Cabo San Lucas, unos 145 km');
});

test('cifra: sin cambio claro no hay número; con cambio claro lleva signo y unidad', () => {
  const lp = LOCS.localidades.find((l) => l.id === 'lapaz'), cabo = LOCS.localidades.find((l) => l.id === 'cabosanlucas');
  assert.match(LU.cifra(lp, 'calor'), /^\+1[.,]47 °C$/);
  assert.equal(LU.cifra(lp, 'lluvia'), RBT.t('lug.sinCambio'));
  assert.match(LU.cifra(cabo, 'lluvia'), /^\+167 mm$/);
});

test('La Paz coincide con la ficha de Inicio: mismo cambio de calor y mismo p de lluvia', () => {
  const lp = LOCS.localidades.find((l) => l.id === 'lapaz');
  const calor = IND.find((i) => i.id === 'calor'), lluvia = IND.find((i) => i.id === 'lluvia');
  assert.equal(lp.calor.cambio_total, calor.cambio_total);
  assert.equal(lp.lluvia.p_valor, lluvia.significancia.p_valor);
});

test('render sin Leaflet: el mapa avisa, se oculta y la lista de lugares sigue (calor)', () => {
  const els = domFalso();
  const r = LU.render({ id: 'calor', locs: LOCS, agua: IND.find((i) => i.id === 'agua') });
  assert.equal(r.mapa, null);
  assert.match(els['aviso-mapa'].innerHTML, /class="aviso"/);
  assert.equal(els['mapa-caja'].hidden, true);
  const ol = els.resumen.innerHTML;
  assert.equal((ol.match(/<li>/g) || []).length, 38, 'los 38 lugares: 8 a la vista y 30 dentro del plegable');
  assert.match(ol, /<details class="lug-mas">/);
  assert.match(ol, /celdas/, 'dice que los lugares comparten celdas');
  assert.match(els['fuente-mapa'].textContent, /NASA POWER/);
});

test('render de lluvia: solo cifra donde hay cambio claro y la lista no pone colores de alarma', () => {
  const els = domFalso();
  LU.render({ id: 'lluvia', locs: LOCS, agua: null });
  assert.match(els.resumen.innerHTML, /\+167 mm/);
  assert.match(els.resumen.innerHTML, /No se detecta cambio claro/);
  assert.doesNotMatch(els.resumen.innerHTML, /class="(sube|baja)"/, 'más lluvia no es "sube" en rojo');
});

test('agua: panel regional con la cifra de GRACE y sin mapa', () => {
  const els = domFalso();
  const r = LU.render({ id: 'agua', locs: LOCS, agua: IND.find((i) => i.id === 'agua') });
  assert.equal(r.mapa, null); assert.equal(els['mapa-caja'].hidden, true);
  assert.match(els.resumen.innerHTML, /GRACE/);
  assert.match(els.resumen.innerHTML, /No es el acuífero de La Paz/);
  assert.match(els.resumen.innerHTML, /\+1[.,]4/);
  assert.match(els.resumen.innerHTML, /href="#ficha\/agua"/);
});

test('textos: mismas claves en español e inglés y avisan lo que no es', () => {
  assert.deepEqual(Object.keys(LU.TX.es).sort(), Object.keys(LU.TX.en).sort());
  assert.match(LU.TX.es['lug.aguaTxt'], /No es el acuífero/);
  assert.match(LU.TX.en['lug.aguaTxt'], /not the La Paz aquifer/);
  assert.match(LU.TX.es['lug.celdas'], /misma celda muestran la misma cifra/);
});

test('conexión: la pestaña Mapa ya no existe, #mapa lleva a Clima y los scripts están en orden', () => {
  const html = leer('index.html'), app = leer('js/app.js');
  assert.ok(!html.includes('data-nav="mapa"') && !html.includes('href="#mapa"'));
  assert.match(app, /\^#mapa\(\\\/\|\$\)/, 'los enlaces viejos #mapa se redirigen');
  assert.match(app, /#clima\/zonas/);
  assert.ok(leer('js/home.js').includes('href="#clima/zonas"'), 'el botón de Inicio apunta al mapa dentro de Clima');
  const i = (s) => html.indexOf(s);
  assert.ok(i('js/zonas-busqueda.js') < i('js/lugares.js') && i('js/lugares.js') < i('js/app.js'));
  assert.ok(html.includes('css/lugares.css'));
});

test('estadoLugar: sin cambio claro es "sin" (guion), no "sin dato" (?)', () => {
  assert.equal(LU.estadoLugar({ cambio_total: null, significativo: false }), 'sin');
  assert.equal(LU.estadoLugar({ cambio_total: 1.2, significativo: true }), 'sube');
  assert.equal(LU.estadoLugar({ cambio_total: -3, significativo: true }), 'baja');
  assert.equal(LU.estadoLugar(null), 'nodato');
  for (const l of LOCS.localidades) for (const id of ['calor', 'lluvia']) assert.notEqual(LU.estadoLugar(l[id]), 'nodato', l.nombre + ' ' + id);
});
