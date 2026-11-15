// Pruebas del diseno de Radar BCS. Solo node:test y node:assert.
// Uso: node --test diseno/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const R = (...p) => path.join(RAIZ, ...p);
const auditoria = JSON.parse(fs.readFileSync(R('diseno', 'figma-auditoria.json'), 'utf8'));
const MAX_BYTES = 5 * 1024 * 1024;
const FUENTES = ['Space Grotesk', 'Manrope', 'JetBrains Mono'];

function listar(dir) {
  const salida = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) salida.push(...listar(p));
    else salida.push(p);
  }
  return salida;
}

function leerPNG(archivo) {
  const b = fs.readFileSync(archivo);
  const firma = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (b.length < 24 || !b.subarray(0, 8).equals(firma)) return null;
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20), bytes: b.length };
}

// ---------- (a) auditoria ----------
test('auditoria: 17 pantallas finales', () => {
  assert.equal(auditoria.pantallas.length, 17);
});

test('auditoria: header y footer son instancias de los componentes', () => {
  const nombres = auditoria.componentes.map((c) => c.nombre);
  assert.ok(nombres.includes('Header / Navegación principal'));
  assert.ok(nombres.includes('Footer / Pie de página'));
  for (const p of auditoria.pantallas) {
    assert.equal(p.header?.componente, 'Header / Navegación principal', p.nombre);
    assert.equal(p.footer?.componente, 'Footer / Pie de página', p.nombre);
    assert.equal(p.ancho, 1280, p.nombre);
  }
});

test('auditoria: exactamente una pestana activa y es su seccion', () => {
  for (const p of auditoria.pantallas) {
    assert.equal(p.pestanasActivas.length, 1, p.nombre);
    assert.equal(p.pestanasActivas[0], p.seccion, p.nombre);
    assert.ok(auditoria.pestanas.includes(p.seccion), p.nombre);
  }
});

test('auditoria: solo las 3 fuentes de marca', () => {
  for (const p of auditoria.pantallas) {
    for (const f of Object.keys(p.fuentes)) assert.ok(FUENTES.includes(f), `${p.nombre}: ${f}`);
  }
});

test('auditoria: titulo alineado a x=32 cuando existe', () => {
  for (const p of auditoria.pantallas) {
    if (p.tituloX !== null) assert.equal(p.tituloX, 32, p.nombre);
  }
});

test('auditoria: subsecciones tienen acento y boton de simulacion', () => {
  const subs = auditoria.pantallas.filter((p) => /^(Clima|Agricultura|Pesca) - /.test(p.nombre) && !p.nombre.endsWith(' - Mapa'));
  assert.equal(subs.length, 12);
  for (const p of subs) {
    assert.ok(Array.isArray(p.acento) && p.acento.length > 0, `${p.nombre}: falta acento`);
    assert.equal(p.botonSimulacion, 'Botón / Iniciar simulación', p.nombre);
  }
});

test('auditoria: sin erratas', () => {
  for (const p of auditoria.pantallas) assert.deepEqual(p.erratas, [], p.nombre);
});

// ---------- (b) PNG ----------
// El export de Figma agrega ~8 px de margen por lado (1296 de ancho para un frame de 1280).
test('PNG de la auditoria existen, son validos, ancho 1280 (+ margen de export <= 24 px) y < 5 MB', () => {
  for (const p of auditoria.pantallas) {
    const f = R(...p.archivo.split('/'));
    assert.ok(fs.existsSync(f), `no existe ${p.archivo}`);
    const png = leerPNG(f);
    assert.ok(png, `firma PNG invalida: ${p.archivo}`);
    assert.ok(png.ancho >= 1280 && png.ancho <= 1280 + 24, `${p.archivo}: ancho ${png.ancho}`);
    assert.ok(png.bytes < MAX_BYTES, p.archivo);
  }
});

// login y registrar son frames aparte de 1440x1024 (no estan en la auditoria).
test('login.png y registrar.png existen y son PNG de 1440 de ancho', () => {
  for (const n of ['login', 'registrar']) {
    const png = leerPNG(R('diseno', 'pantallas', `${n}.png`));
    assert.ok(png, n);
    assert.equal(png.ancho, 1440, n);
  }
});

test('todo archivo en web/assets y diseno pesa < 5 MB y todo PNG es valido', () => {
  for (const f of [...listar(R('web', 'assets')), ...listar(R('diseno'))]) {
    assert.ok(fs.statSync(f).size < MAX_BYTES, f);
    if (f.toLowerCase().endsWith('.png')) assert.ok(leerPNG(f), `PNG invalido: ${f}`);
  }
});

// ---------- (c) SVG ----------
const dirIconos = R('web', 'assets', 'iconos');
const svgs = fs.readdirSync(dirIconos).filter((f) => f.endsWith('.svg'));

test('hay 12 iconos SVG', () => {
  assert.equal(svgs.length, 12);
});

for (const nombre of svgs) {
  test(`icono ${nombre}: SVG valido y seguro`, () => {
    const t = fs.readFileSync(path.join(dirIconos, nombre), 'utf8').trim();
    assert.match(t, /^(<\?xml[^>]*>\s*)?<svg[\s>][\s\S]*<\/svg>$/);
    assert.match(t, /<svg[^>]*(viewBox=|width=)/);
    assert.doesNotMatch(t, /<script/i);
    assert.doesNotMatch(t, /(href|src)\s*=\s*["']\s*https?:/i);
    assert.doesNotMatch(t, /nasa/i);
  });
}

// ---------- (d) tokens ----------
test('tokens.css define los colores de acentos y las 3 fuentes', () => {
  const css = fs.readFileSync(R('web', 'assets', 'tokens.css'), 'utf8').toLowerCase();
  const hex = new Set();
  for (const lista of Object.values(auditoria.acentosPorSeccion)) {
    for (const t of lista) {
      for (const r of t.relleno) for (const m of r.match(/#[0-9a-f]{6}/gi) || []) hex.add(m.toLowerCase());
    }
  }
  assert.ok(hex.size >= 10);
  for (const h of hex) assert.ok(css.includes(h), `falta ${h} en tokens.css`);
  for (const f of FUENTES) assert.ok(css.includes(f.toLowerCase()), `falta fuente ${f}`);
  assert.ok(/--rb-margen:\s*32px/.test(css));
  assert.ok(/--rb-ancho-contenido:\s*1216px/.test(css));
  assert.equal(css.match(/^\s*--(?!rb-)[a-z0-9-]+:/gm), null, 'variables sin prefijo --rb-');
});

// ---------- (e) contraste WCAG ----------
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const pares = [
  ['blanco sobre pestana activa', '#ffffff', '#0c2340'],
  ['texto del menu sobre header', '#44474d', '#ffffff'],
  ['tinta sobre fondo de pagina', '#000d21', '#f7f9fc'],
  ['pildora de estado', '#047240', '#97f3b5'],
  ['verde vivo sobre blanco', '#006d3d', '#ffffff'],
];
for (const [nombre, fg, bg] of pares) {
  test(`contraste >= 4.5: ${nombre} (${fg} sobre ${bg})`, () => {
    const r = contraste(fg, bg);
    console.log(`  contraste ${nombre}: ${r.toFixed(2)}:1`);
    assert.ok(r >= 4.5, `${r.toFixed(2)} < 4.5`);
  });
}

// ---------- (f) logo ----------
test('logo existe y es proporcional a 156x44 (exportado a 3x)', () => {
  const png = leerPNG(R('web', 'assets', 'logo-radar-bcs.png'));
  assert.ok(png);
  assert.ok(Math.abs(png.ancho / png.alto - 156 / 44) < 0.03, `${png.ancho}x${png.alto}`);
  assert.ok(Math.abs(png.ancho - 468) <= 4, `ancho ${png.ancho}`);
});
