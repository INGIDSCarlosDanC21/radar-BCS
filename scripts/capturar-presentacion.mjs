// Capturas de pantallas reales de la web pública (en español) para la presentación.
//
// Uso:
//   node scripts/capturar-presentacion.mjs [URL_BASE]
//   URL_BASE por defecto: https://ingidscarlosdanc21.github.io/radar-BCS/
//   Ejemplo local:        node scripts/capturar-presentacion.mjs http://localhost:8000/
//
// Qué hace: abre Chrome sin ventana (protocolo CDP, sin dependencias de npm), emula un celular de
// 390 x 844 con escala 2 (cada captura mide 780 x 1688 px), modo claro y español por defecto (sin
// ?lang=en). Para cada pantalla espera a que carguen los datos (sin aria-busy, sin "cargando" ni
// esqueletos) y comprueba que en el viewport inicial no haya textos de carga o vacíos ("cargando",
// "sin datos", "no data", "loading"). Si falla, recarga y reintenta hasta 3 veces. Si tras los
// reintentos sigue el problema, guarda igualmente la captura y lo informa con el texto exacto.
// La barra inferior fija se deja visible en todas las capturas.
//
// Salida: presentacion/assets/capturas/<nombre>.png
// Las versiones recortadas (540 x 950, esquinas redondeadas) las genera un paso aparte con Pillow.
//
// Requisito: Google Chrome instalado (ruta configurable con la variable de entorno CHROME).
// Código de salida 2 = alguna captura quedó con AVISO (revisar la imagen antes de publicar).

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith('--')) || 'https://ingidscarlosdanc21.github.io/radar-BCS/').replace(/[?#].*$/, '');
// --solo=pesca,avisos recaptura solo esas pantallas (útil tras un fallo de red puntual).
const SOLO = (args.find((a) => a.startsWith('--solo=')) || '').replace('--solo=', '').split(',').filter(Boolean);
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'presentacion', 'assets', 'capturas');

const ANCHO = 390;
const ALTO = 844;
const ESCALA = 2;

const CHROME = [
  process.env.CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
  .filter(Boolean)
  .find((c) => existsSync(c));
if (!CHROME) {
  console.error('No encontré Chrome. Indica la ruta con la variable de entorno CHROME.');
  process.exit(1);
}

// Pantallas. hash = ruta de web/js/app.js; listo = selector que debe existir al cargar;
// ancla = (opcional) selector al que la propia web lleva el viewport (#acciones, #lugares).
const PANTALLAS = [
  { nombre: 'inicio', hash: '#inicio', listo: '.hm-tarjeta', extra: 1500 },
  { nombre: 'clima', hash: '#clima', listo: '.leaflet-container', extra: 4000 },
  { nombre: 'pesca', hash: '#pesca', listo: 'main h2', extra: 3000 },
  { nombre: 'agro', hash: '#agricola', listo: 'main h2', extra: 2000 },
  { nombre: 'avisos', hash: '#avisos', listo: 'main h2', extra: 3000 },
  { nombre: 'acciones', hash: '#clima/acciones', listo: '#acciones', extra: 4000, ancla: '#acciones' },
  { nombre: 'menu-inferior', hash: '#inicio', listo: '.hm-tarjeta', extra: 1500, barra: true },
  { nombre: 'ficha-calor', hash: '#ficha/calor', listo: 'main h2', extra: 1500 },
  { nombre: 'ficha-lluvia', hash: '#ficha/lluvia', listo: 'main h2', extra: 1500 },
  { nombre: 'mapa-lugares', hash: '#clima/zonas', listo: '#lugares .leaflet-container', extra: 4000, ancla: '#lugares' },
];

// Textos que delatan carga, datos vacíos o error de red en el viewport inicial. Los textos
// largos (una frase explicativa que dice "sin datos") no cuentan: solo nodos cortos o de error.
const PROBLEMA = /^(cargando|loading|sin datos?|no data)\b|no se pudo cargar|error de red|429/i;
const esProblema = (s) => (PROBLEMA.test(s) && s.length <= 60) || /no se pudo cargar|no pudimos cargar|429/i.test(s);

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const puerto = 9400 + Math.floor(Math.random() * 400);
const perfil = join(tmpdir(), 'perfil-cappres-' + puerto);
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, '--no-first-run', '--lang=es-MX', 'about:blank'],
  { stdio: 'ignore' },
);

async function esperarChrome() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + puerto + '/json/version');
      if (r.ok) return;
    } catch {}
    await dormir(250);
  }
  throw new Error('Chrome no abrió el puerto de depuración');
}

let fallos = 0;
try {
  await esperarChrome();
  const pestana = await (await fetch('http://127.0.0.1:' + puerto + '/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let n = 0;
  const pendientes = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pendientes.has(d.id)) {
      pendientes.get(d.id)(d);
      pendientes.delete(d.id);
    }
  };
  const cmd = (method, params = {}) =>
    new Promise((res) => {
      const id = ++n;
      pendientes.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const ev = async (expr) => {
    const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };

  await cmd('Page.enable');
  await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: ESCALA, mobile: true });
  await cmd('Emulation.setTouchEmulationEnabled', { enabled: true });
  await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await cmd('Emulation.setTimezoneOverride', { timezoneId: 'America/Mazatlan' }); // hora de La Paz, B.C.S.
  await cmd('Emulation.setLocaleOverride', { locale: 'es-MX' });
  mkdirSync(SALIDA, { recursive: true });

  for (const p of PANTALLAS.filter((x) => !SOLO.length || SOLO.includes(x.nombre))) {
    const url = BASE + p.hash;
    let problemas = [];
    for (let intento = 1; intento <= 3; intento++) {
      // Espera creciente entre intentos: los datos en vivo (Open-Meteo) limitan la tasa de peticiones.
      if (intento > 1) await dormir(15000 * intento);
      await cmd('Page.navigate', { url: 'about:blank' });
      await dormir(200);
      await cmd('Page.navigate', { url });
      // Espera: <main> sin aria-busy, sin "cargando" ni esqueletos, y con el selector de la pantalla.
      const sel = JSON.stringify(p.listo);
      for (let i = 0; i < 60; i++) {
        await dormir(500);
        const listo = await ev(
          `(()=>{const m=document.querySelector('main');if(!m||m.getAttribute('aria-busy')==='true')return false;` +
            `if(m.querySelector('.cargando, .esqueleto'))return false;return !!document.querySelector(${sel});})()`,
        ).catch(() => false);
        if (listo) break;
      }
      await dormir(p.extra || 1500);
      // Oculta solo el menú flotante, el enlace de salto y el cursor; la barra inferior se queda.
      await ev(
        `(()=>{const s=document.createElement('style');s.textContent='.mas,.saltar{display:none!important}*{caret-color:transparent!important}';` +
          `document.head.appendChild(s);document.activeElement&&document.activeElement.blur&&document.activeElement.blur();return true})()`,
      );
      if (!p.ancla) await ev('window.scrollTo(0,0)');
      await dormir(400);

      // Textos visibles en el viewport actual (lo que ve el lector en la captura).
      const visibles = await ev(
        `(()=>{const H=innerHeight;const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const out=[];` +
          `while(w.nextNode()){const t=w.currentNode;const s=t.textContent.replace(/\\s+/g,' ').trim();if(!s)continue;const el=t.parentElement;` +
          `if(!el||el.closest('script,style,noscript,[hidden]'))continue;const r=document.createRange();r.selectNodeContents(t);` +
          `const b=r.getBoundingClientRect();if(!b.width||!b.height)continue;if(b.bottom<0||b.top>H)continue;out.push(s)}return out})()`,
      );
      const malos = visibles.filter(esProblema);
      // Mensajes de error o estado aunque estén fuera del viewport (p. ej. el de clima bajo el mapa).
      const estados = await ev(
        `[...document.querySelectorAll('#cm-estado, main .error, main [role=alert], main .cargando')].map(e=>e.textContent.replace(/\\s+/g,' ').trim()).filter(Boolean)`,
      );
      const ocupado = await ev(`document.querySelector('main')?.getAttribute('aria-busy')==='true'`);
      problemas = [
        ...malos.map((s) => `texto "${s.slice(0, 80)}"`),
        ...estados.filter((s) => esProblema(s) || /límite de consultas|llegó a su límite/i.test(s)).map((s) => `estado "${s.slice(0, 80)}"`),
        ...(ocupado ? ['main sigue con aria-busy'] : []),
      ];
      if (problemas.length && intento < 3) {
        console.warn(`  ${p.nombre} intento ${intento}: ${problemas.join('; ')}`);
        continue;
      }
      break;
    }
    const r = await cmd('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(SALIDA, p.nombre + '.png'), Buffer.from(r.result.data, 'base64'));
    console.log(`${problemas.length ? 'AVISO' : 'ok   '} ${p.nombre}.png${problemas.length ? '  -> ' + problemas.join('; ') : ''}`);
    if (problemas.length) fallos++;
  }
  ws.close();
} finally {
  chrome.kill();
}
if (fallos) console.warn(`\n${fallos} captura(s) con AVISO: revisa las imágenes antes de usarlas.`);
process.exit(fallos ? 2 : 0);
