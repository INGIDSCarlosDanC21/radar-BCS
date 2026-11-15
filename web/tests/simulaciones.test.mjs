import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

// Simulaciones (decisión de Carlos, 2026-11-15): fotos reales de GIBS con línea de tiempo en el Mapa y "Viaja en el tiempo" en la Ficha.
// Reglas: ninguna cifra inventada; solo se proyecta con tendencia clara y nunca el agua ni la lluvia; la proyección nunca es un pronóstico.
const require = createRequire(import.meta.url);
globalThis.window = {};
const RBT = require('../js/textos.js');
globalThis.window.RBT = RBT;
const RB = require('../js/reglas.js');
globalThis.window.RB = RB;
const S = require('../js/simulaciones.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');
const datos = JSON.parse(leer('data/indicadores.json'));
const ind = (id) => datos.indicadores.find((i) => i.id === id);

test('las fechas de GIBS son compuestos que existen: 8 días desde el día 104 y una foto diaria en abril', () => {
  assert.equal(S.fechaCalor(2001), '2001-04-15');
  assert.equal(S.fechaCalor(2020), '2020-04-14', 'año bisiesto');
  assert.equal(S.fechaCalor(2026), '2026-04-15');
  assert.equal(S.fechaColor(2001), '2001-04-20');
  assert.equal(S.fechaColor(2013), '2013-04-19', 'día elegido por estar sin huecos ni nubes');
  for (let a = 2001; a <= 2026; a++) assert.match(S.fechaColor(a), /^\d{4}-04-(19|20|21)$/);
});

test('las capas apuntan solo a GIBS (datos abiertos de la NASA), con el orden {z}/{y}/{x} de WMTS', () => {
  const calor = S.urlCapa(S.CAPAS.calor, '2025-04-15');
  const color = S.urlCapa(S.CAPAS.color, '2025-04-20');
  assert.equal(calor, 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_L3_Land_Surface_Temp_8Day_Day/default/2025-04-15/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png');
  assert.equal(color, 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2025-04-20/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpeg');
  const fuente = leer('js/simulaciones.js');
  const hosts = [...new Set([...fuente.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]))];
  for (const h of hosts) assert.match(h, /^(gibs\.earthdata\.nasa\.gov|tile\.openstreetmap\.org)$/, 'host inesperado: ' + h);
});

test('solo se proyecta con tendencia clara; nunca el agua (regional) ni la lluvia (sin tendencia)', () => {
  assert.equal(S.permiteProyeccion(ind('calor')), true);
  assert.equal(S.permiteProyeccion(ind('vegetacion')), true);
  assert.equal(S.permiteProyeccion(ind('lluvia')), false);
  assert.equal(S.permiteProyeccion(ind('agua')), false, 'el agua es una anomalía regional, no del acuífero de La Paz');
  const falsa = JSON.parse(JSON.stringify(ind('calor')));
  falsa.significancia.significativo = false;
  assert.equal(S.permiteProyeccion(falsa), false);
  falsa.significancia.significativo = null;
  assert.equal(S.permiteProyeccion(falsa), false);
});

test('el control llega a 2035 solo si se proyecta; si no, termina en el último dato real', () => {
  assert.equal(S.rango(ind('calor')).max, 2035);
  assert.equal(S.rango(ind('calor')).hasta, 2025);
  assert.equal(S.rango(ind('vegetacion')).max, 2035);
  assert.equal(S.rango(ind('lluvia')).max, 2025);
  assert.equal(S.rango(ind('agua')).max, S.rango(ind('agua')).hasta);
});

test('valorEn: dato real tal cual; la proyección sigue el signo de la tendencia; sin dato donde no hay', () => {
  const calor = ind('calor');
  assert.deepEqual(S.valorEn(calor, 2025), { tipo: 'dato', valor: 25.407 });
  const p26 = S.valorEn(calor, 2026), p35 = S.valorEn(calor, 2035);
  assert.equal(p26.tipo, 'proyeccion');
  assert.ok(p35.valor > p26.valor, 'el calor sube con la tendencia');
  assert.ok(Math.abs((p35.valor - p26.valor) / 9 - calor.tendencia_por_decada / 10) < 1e-9, 'la pendiente es la de Sen publicada');
  assert.ok(p35.valor > 25 && p35.valor < 27.5, 'proyección razonable: ' + p35.valor);
  const veg = ind('vegetacion');
  assert.ok(S.valorEn(veg, 2035).valor < S.valorEn(veg, 2025).valor, 'el verdor baja con la tendencia');
  assert.deepEqual(S.valorEn(ind('lluvia'), 2030), { tipo: 'sin-dato', valor: null });
  assert.equal(S.valorEn(ind('agua'), 2002).tipo, 'sin-dato');
});

test('frases: dicen el dato, comparan con el primer año y nunca atribuyen causa', () => {
  RBT.setLang('es');
  const f25 = S.frase(ind('calor'), 2025);
  assert.match(f25, /En 2025, el aire de La Paz promedió 25\.4 °C\./);
  assert.match(f25, /1\.5 °C más caliente que en 2001/);
  assert.match(S.frase(ind('calor'), 2035), /^Si la tendencia sigue igual, en 2035/);
  assert.match(S.frase(ind('lluvia'), 2002), /137 mm/);
  assert.match(S.frase(ind('lluvia'), 2002), /más seco que el promedio/);
  assert.match(S.frase(ind('vegetacion'), 2025), /menos verdor que en 2001/);
  assert.match(S.frase(ind('agua'), 2025), /respecto a su promedio de referencia/);
  for (const id of ['calor', 'vegetacion', 'lluvia', 'agua']) {
    const r = S.rango(ind(id));
    for (let a = r.desde; a <= r.max; a++) assert.doesNotMatch(S.frase(ind(id), a), /porque|debido|culpa|causado|provoca/i, id + ' ' + a);
  }
});

test('la proyección siempre se declara como no pronóstico; lluvia y agua explican por qué no se proyectan', () => {
  RBT.setLang('es');
  const calor = S.maquinaHtml(ind('calor'));
  assert.match(calor, /id="sim-aviso" hidden>Esto no es un pronóstico/);
  assert.match(calor, /max="2035"/);
  assert.match(S.TX.es['maq.etqProy'], /no es un pronóstico/);
  assert.match(S.TX.en['maq.etqProy'], /not a forecast/);
  assert.doesNotMatch(S.maquinaHtml(ind('lluvia')), /sim-aviso/);
  assert.match(S.maquinaHtml(ind('lluvia')), /No proyectamos la lluvia/);
  assert.match(S.maquinaHtml(ind('agua')), /No proyectamos el agua: el dato es regional/);
});

test('inglés: mismas claves y mismos {marcadores} que en español', () => {
  const es = Object.keys(S.TX.es).sort(), en = Object.keys(S.TX.en).sort();
  assert.deepEqual(en, es);
  const marcas = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const k of es) assert.equal(marcas(S.TX.en[k]), marcas(S.TX.es[k]), k);
  RBT.setLang('en');
  assert.match(S.frase(ind('calor'), 2025), /^In 2025, the air in La Paz averaged 25\.4 °C\./);
  assert.match(S.frase(ind('calor'), 2035), /^If the trend continues the same way, in 2035/);
  RBT.setLang('es');
});

test('el gráfico marca el año elegido y distingue la proyección', () => {
  RBT.setLang('es');
  const real = S.grafica(ind('calor'), 2010), proy = S.grafica(ind('calor'), 2032);
  assert.match(real, /class="sim-punto"/);
  assert.match(proy, /sim-punto sim-punto-proy/);
  assert.match(proy, /sim-tend-proy/);
  assert.doesNotMatch(S.grafica(ind('lluvia'), 2010), /sim-tend-proy/);
});

test('index.html carga la hoja y el script antes de app.js, y app.js los usa sin romper si faltan', () => {
  const html = leer('index.html'), app = leer('js/app.js');
  assert.match(html, /<link rel="stylesheet" href="css\/simulaciones\.css">/);
  assert.ok(html.indexOf('js/simulaciones.js') > html.indexOf('js/textos.js') && html.indexOf('js/simulaciones.js') < html.indexOf('js/app.js'));
  assert.match(app, /if \(window\.RBSim\) window\.RBSim\.limpiar\(\);/, 'cada cambio de pantalla apaga el mapa de satélite');
  assert.match(app, /window\.RBSim \? window\.RBSim\.sateliteHtml\(\) : ''/);
  assert.match(app, /window\.RBSim \? window\.RBSim\.maquinaHtml\(i\) : ''/);
});

test('los botones propios no usan .chip (app.js engancha cada .chip del Mapa como selector de indicador)', () => {
  const fuente = leer('js/simulaciones.js');
  assert.doesNotMatch(fuente, /class="chip[ "]/);
});
