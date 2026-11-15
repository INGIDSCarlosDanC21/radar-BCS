import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.window = {};
const VM = require('../js/ver-mas.js');

const lee = (r) => readFileSync(new URL(r, import.meta.url), 'utf8');
const ancho = (n) => 'x'.repeat(n);

test('solo se eligen textos de 130 caracteres o más', () => {
  assert.equal(VM.elegibleTexto('Texto corto.'), false);
  assert.equal(VM.elegibleTexto(ancho(VM.MIN_CARACTERES - 1)), false);
  assert.equal(VM.elegibleTexto(ancho(VM.MIN_CARACTERES)), true);
  assert.equal(VM.elegibleTexto('Limitación: ' + 'Es temperatura del aire a 2 m, no una medición local. '.repeat(3)), true);
});

test('nunca se pliega seguridad, atribución, licencia ni IA (ES y EN)', () => {
  const largo = (s) => s + ' ' + ancho(140);
  const NO = [
    'Esto no es aviso oficial', 'Los avisos con ícono de modelo no son avisos oficiales', 'This is not an official warning',
    'Datos del tiempo: Open-Meteo.com (CC BY 4.0)', 'Weather data by Open-Meteo.com', 'no son mediciones de estación', 'they are not stations',
    'no son boyas', 'are not buoys', 'Logotipo AI-generated', 'logotipo generado con IA (Gemini)', 'Código escrito con ayuda de IA',
    'Code written with AI assistance', 'Licencia Apache-2.0', '© OpenStreetMap contributors', 'Licencia CC BY 4.0'
  ];
  NO.forEach((s) => assert.equal(VM.elegibleTexto(largo(s)), false, 'se pliega algo que no debe: ' + s));
});

test('regla de líneas: se pliega con más de 4, se deja en 3', () => {
  assert.equal(VM.lineasDe(72, 18), 4);
  assert.equal(VM.debePlegar(4), false);
  assert.equal(VM.debePlegar(5), true);
  assert.equal(VM.lineasDe(0, 18), 0);
  assert.equal(VM.lineasDe(72, 0), 0);
  assert.equal(VM.LINEAS, 3);
  assert.equal(VM.UMBRAL, 4);
});

test('el contenedor excluye pie, menús, mapas, alertas, encabezados y botones', () => {
  for (const s of ['footer', '.pie', 'nav', '.leaflet-container', '[role="alert"]', 'summary', 'button', 'h2', '[data-vm="no"]']) {
    assert.ok(VM.EXCLUIR_CONTENEDOR.includes(s), 'falta excluir ' + s);
  }
});

test('CSS: recorte por líneas (no por caracteres), botón de 44 px y foco visible', () => {
  const css = lee('../css/ver-mas.css');
  assert.match(css, /-webkit-line-clamp:\s*var\(--vm-lineas,\s*3\)/);
  assert.match(css, /\.vm-btn\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /\.vm-btn:focus-visible/);
  assert.match(css, /\.vm-subir\s*\{[^}]*min-height:\s*44px/);
  assert.match(css, /bottom:\s*calc\(76px/, '"Subir" debe quedar sobre la barra inferior de 64 px');
});

test('JS: botón real con aria-expanded y aria-controls; el texto completo sigue en la página', () => {
  const js = lee('../js/ver-mas.js');
  assert.match(js, /createElement\('button'\)/);
  assert.match(js, /b\.type = 'button'/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /aria-controls/);
  assert.ok(!/textContent\s*=\s*[^;]*substr|\.slice\(0,\s*\d+\)\s*\+\s*'…'/.test(js), 'no debe cortar el texto por caracteres');
});

test('textos del botón: mismas claves en español e inglés y distintos entre sí', () => {
  assert.deepEqual(Object.keys(VM.TX.es).sort(), Object.keys(VM.TX.en).sort());
  for (const k of Object.keys(VM.TX.es)) assert.notEqual(VM.TX.es[k], VM.TX.en[k], 'sin traducir: ' + k);
  assert.equal(VM.TX.es['vm.mas'], 'Ver más');
  assert.equal(VM.TX.en['vm.mas'], 'See more');
});

test('index.html carga el estilo y el script', () => {
  const h = lee('../index.html');
  assert.ok(h.includes('href="css/ver-mas.css"'));
  assert.ok(h.includes('src="js/ver-mas.js"'));
  assert.ok(h.indexOf('js/ver-mas.js') > h.indexOf('js/textos.js'), 'ver-mas.js va después de textos.js');
});

test('consejos de CDC y EPA: el texto de cada desplegable se muestra completo, sin "Ver más" (pedido de UI/UX)', () => {
  const js = lee('../js/acciones.js');
  assert.match(js, /<li class="ac-card ac-' \+ \(tipo === 'c' \? 'calor' : 'agua'\) \+ '" data-vm="no">/);
});

test('el aviso médico de los consejos nunca se pliega', () => {
  assert.ok(lee('../js/acciones.js').includes(`'<p class="aviso" data-vm="no">' + esc(t('acc.aviso'))`));
});
