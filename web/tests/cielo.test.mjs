import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';

// "El cielo ahora en BCS" (Inicio, #144 fase 2): estado del cielo de Open-Meteo con íconos de Material Symbols.
// Reglas: es un modelo (no estaciones) y se rotula así; nunca se inventa un dato; la atribución a Open-Meteo está en pantalla.
const require = createRequire(import.meta.url);
globalThis.window = {};
const RBT = require('../js/textos.js');
globalThis.window.RBT = RBT;
globalThis.window.RB = require('../js/reglas.js');
const C = require('../js/cielo.js');
const raiz = new URL('../', import.meta.url);
const leer = (p) => readFileSync(new URL(p, raiz), 'utf8');

test('código WMO -> estado e ícono, como la tabla de web/assets/iconos/cielo/README.md', () => {
  const caso = (c, dia) => C.estado(c, dia);
  assert.deepEqual([caso(0, 1).clave, caso(0, 1).icono], ['despejado', 'sunny']);
  assert.deepEqual([caso(1, 0).clave, caso(1, 0).icono], ['despejado', 'clear_night']);
  assert.equal(caso(2, 1).icono, 'partly_cloudy_day');
  assert.equal(caso(2, 0).icono, 'partly_cloudy_night');
  assert.equal(caso(3, 1).icono, 'cloud');
  for (const c of [45, 48]) assert.equal(caso(c, 1).icono, 'foggy');
  for (const c of [51, 53, 55, 56, 57]) assert.equal(caso(c, 1).clave, 'llovizna');
  for (const c of [61, 63, 65, 66, 67, 80, 81, 82]) assert.equal(caso(c, 0).icono, 'rainy');
  for (const c of [71, 73, 75, 77, 85, 86]) assert.deepEqual([caso(c, 1).clave, caso(c, 1).icono], ['nieve', 'cloud']);
  for (const c of [95, 96, 99]) assert.equal(caso(c, 1).icono, 'thunderstorm');
});

test('un código fuera de la tabla o ausente dice "sin dato", nunca un estado inventado', () => {
  for (const c of [null, undefined, 'x', 4, 10, 999]) {
    assert.equal(C.estado(c, 1).clave, 'sinDato', String(c));
    assert.equal(C.estado(c, 1).icono, 'cloud');
  }
  RBT.setLang('es');
  assert.equal(C.textoEstado(C.estado(null, 1)), 'Sin dato del cielo');
});

test('los 9 íconos usados existen en web/assets/iconos/cielo', () => {
  const usados = new Set();
  for (let c = 0; c <= 99; c++) for (const d of [0, 1]) usados.add(C.estado(c, d).icono);
  assert.deepEqual([...usados].sort(), ['clear_night', 'cloud', 'foggy', 'partly_cloudy_day', 'partly_cloudy_night', 'rainy', 'rainy_light', 'sunny', 'thunderstorm']);
  for (const i of usados) assert.ok(existsSync(new URL('assets/iconos/cielo/' + i + '.svg', raiz)), i);
});

test('la petición es una sola llamada a Open-Meteo para las 7 localidades, sin clave y en hora de La Paz', () => {
  const u = new URL(C.urlApi());
  assert.equal(u.host, 'api.open-meteo.com');
  assert.equal(u.searchParams.get('latitude').split(',').length, 7);
  assert.equal(u.searchParams.get('longitude').split(',').length, 7);
  assert.equal(u.searchParams.get('timezone'), 'America/Mazatlan');
  assert.match(u.searchParams.get('current'), /temperature_2m.*weather_code.*is_day/);
  assert.ok(![...u.searchParams.keys()].some((k) => /key|token|apikey/i.test(k)));
  assert.equal(C.LOC[0].nombre, 'La Paz');
  assert.deepEqual(C.LOC.map((l) => l.nombre), ['La Paz', 'Los Cabos', 'Loreto', 'Comondú', 'Mulegé', 'Guerrero Negro', 'Bahía Magdalena']);
  for (const l of C.LOC) assert.ok(l.lat > 22 && l.lat < 28.5 && l.lon > -115 && l.lon < -109, l.nombre);
});

const resp = (temp, codigo) => ({ current: { time: '2026-11-15T10:30', temperature_2m: temp, apparent_temperature: temp + 1, relative_humidity_2m: 50, weather_code: codigo, is_day: 1, surface_pressure: 1010, wind_speed_10m: 12 }, daily: { temperature_2m_min: [temp - 5], temperature_2m_max: [temp + 5] } });

test('leer: una localidad por respuesta; si la respuesta no cuadra devuelve null; sin lectura -> sin dato', () => {
  const buenas = C.LOC.map((_, k) => resp(20 + k, 0));
  const d = C.leer(buenas);
  assert.equal(d.length, 7);
  assert.equal(d[0].loc.nombre, 'La Paz'); assert.equal(d[0].temp, 20); assert.equal(d[0].min, 15); assert.equal(d[0].max, 25);
  assert.equal(C.leer(buenas.slice(0, 3)), null, 'faltan localidades');
  assert.equal(C.leer(null), null);
  assert.equal(C.leer({}), null);
  const rota = buenas.slice(); rota[2] = { error: true };
  const d2 = C.leer(rota);
  assert.equal(d2[2].ok, false, 'sin lectura no se inventa temperatura');
  assert.equal(d2[1].ok, true);
});

test('html: nombres, temperaturas y rótulos; una localidad sin lectura dice sin dato y no muestra NaN', () => {
  RBT.setLang('es');
  const buenas = C.LOC.map((_, k) => resp(20 + k, k === 3 ? 63 : 0)); buenas[5] = { error: 1 };
  const h = C.html(C.leer(buenas));
  for (const n of ['La Paz', 'Los Cabos', 'Loreto', 'Comondú', 'Mulegé', 'Guerrero Negro', 'Bahía Magdalena']) assert.ok(h.includes(n), n);
  assert.ok(h.includes('20°C') && h.includes('Lluvia o chubasco'));
  assert.ok(h.includes('Sin dato del cielo'));
  assert.doesNotMatch(h, /NaN|undefined|null/);
  assert.match(h, /assets\/iconos\/cielo\/rainy\.svg/);
  assert.match(h, /aria-hidden="true"/, 'los íconos son decorativos: el estado va escrito');
});

test('se rotula como modelo (no estaciones) y no tendencia, con atribución a Open-Meteo, en español e inglés', () => {
  assert.match(C.TX.es['cielo.eti'], /Open-Meteo \(no son estaciones\)/);
  assert.match(C.TX.en['cielo.eti'], /not weather stations/);
  for (const l of ['es', 'en']) {
    assert.match(C.TX[l]['cielo.nota'], /Open-Meteo\.com \(CC BY 4\.0\)/);
    assert.match(C.TX[l]['cielo.nota'], l === 'es' ? /no una tendencia/ : /not a trend/);
  }
  assert.match(leer('js/cielo.js'), /href="https:\/\/open-meteo\.com\/"/);
});

test('el mapa usa VIIRS NOAA-20 de NASA GIBS (franja ancha, sin huecos negros) y lo dice en la foto', () => {
  assert.match(leer('js/cielo.js'), /gibs\.earthdata\.nasa\.gov\/wmts\/epsg3857\/best\/VIIRS_NOAA20_CorrectedReflectance_TrueColor\/default\//);
  assert.match(C.TX.es['cielo.foto'], /NOAA-20 \(VIIRS\)/);
  assert.match(C.TX.en['cielo.foto'], /NOAA-20 \(VIIRS\)/);
});

test('inglés: mismas claves y mismos {marcadores}; las claves se agregan al diccionario', () => {
  assert.deepEqual(Object.keys(C.TX.en).sort(), Object.keys(C.TX.es).sort());
  const marcas = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const k of Object.keys(C.TX.es)) {
    assert.equal(marcas(C.TX.en[k]), marcas(C.TX.es[k]), k);
    assert.equal(RBT.DIC.es[k], C.TX.es[k]); assert.equal(RBT.DIC.en[k], C.TX.en[k]);
  }
  RBT.setLang('en');
  assert.equal(C.textoEstado(C.estado(0, 1)), 'Clear');
  RBT.setLang('es');
});

test('solo se contactan Open-Meteo y NASA GIBS; index.html y app.js la cargan sin romper si falta', () => {
  const fuente = leer('js/cielo.js');
  const hosts = [...new Set([...fuente.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]))];
  for (const h of hosts) assert.match(h, /^(api\.open-meteo\.com|geocoding-api\.open-meteo\.com|open-meteo\.com|gibs\.earthdata\.nasa\.gov)$/, h);
  const html = leer('index.html'), app = leer('js/app.js');
  assert.match(html, /<link rel="stylesheet" href="css\/cielo\.css">/);
  assert.ok(html.indexOf('js/cielo.js') > html.indexOf('js/textos.js') && html.indexOf('js/cielo.js') < html.indexOf('js/app.js'));
  assert.match(app, /if \(window\.RBCielo\) window\.RBCielo\.limpiar\(\);/);
  assert.match(app, /window\.RBHome\.render\(main, DATOS\); if \(window\.RBCielo\) window\.RBCielo\.activar\(main\);/);
});
