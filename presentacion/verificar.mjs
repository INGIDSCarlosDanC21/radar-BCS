// Verifica la presentación con Chrome sin ventana por CDP (Node >= 22, sin dependencias).
// Recorre todas las diapositivas a 1280x720 y 800x600, guarda PNG + informe.txt y lista:
// textos fuera de la zona segura 960x720 ("fuera"), fuentes cargadas, errores de consola y red externa.
// Uso: node presentacion/verificar.mjs <carpeta-salida-FUERA-del-repo> [url] [offline]
//   url por defecto: index.html de esta carpeta (file://). "offline" corta la red para probar que no hace falta.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [, , salida, urlArg, modo] = process.argv;
if (!salida) { console.error('Uso: node presentacion/verificar.mjs <carpeta-salida> [url] [offline]'); process.exit(1); }
const base = urlArg && urlArg !== 'offline' ? urlArg : pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'index.html')).href;
const modoFinal = urlArg === 'offline' ? 'offline' : modo;
mkdirSync(salida, { recursive: true });
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const puerto = 9300 + Math.floor(Math.random() * 500);
const perfil = join(tmpdir(), 'radar-deck-perfil-' + puerto);
const ch = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
  '--no-first-run', '--disable-gpu', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

let tabs;
for (let i = 0; i < 50; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); break; } catch { await dormir(200); } }
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const consola = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === 'Runtime.consoleAPICalled') consola.push(`[console.${m.params.type}] ` + m.params.args.map((a) => a.value ?? a.description).join(' '));
  if (m.method === 'Runtime.exceptionThrown') consola.push('[excepción] ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Log.entryAdded') consola.push(`[log.${m.params.entry.level}] ${m.params.entry.text} ${m.params.entry.url || ''}`);
  if (m.method === 'Network.loadingFailed') consola.push(`[red-fallo] ${m.params.errorText} ${m.params.requestId}`);
  if (m.method === 'Network.requestWillBeSent' && !/^(file|data|about|blob):/.test(m.params.request.url) && !m.params.request.url.startsWith(base.split('/').slice(0, 3).join('/')))
    consola.push(`[red-externa] ${m.params.request.url}`);
});
const cdp = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Page.enable'); await cdp('Network.enable');
if (modoFinal === 'offline') await cdp('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

const COMPROBAR = `(() => {
  const esc = window.Deck ? Deck.escala() : 1;
  const slides = document.querySelector('.reveal .slides').getBoundingClientRect();
  const z = { l: slides.left + 160 * esc - 1, r: slides.left + 1120 * esc + 1, t: slides.top - 1, b: slides.top + 720 * esc + 1 };
  const vis = [...document.querySelectorAll('.reveal .slides section.present *, .hud *')].filter((e) => {
    if (e.closest('aside.notes') || e.closest('.sangrado')) return false;
    const tieneTexto = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    return tieneTexto && e.getClientRects().length;
  });
  const fuera = vis.map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 40), r }; })
    .filter(({ r }) => r.left < z.l || r.right > z.r || r.top < z.t || r.bottom > z.b || r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight)
    .map(({ t, r }) => t + ' @' + [r.left, r.top, r.right, r.bottom].map(Math.round).join(','));
  return JSON.stringify({ hash: location.hash, escala: +esc.toFixed(3), chip: document.querySelector('.hud-chip')?.textContent,
    objetivo: document.querySelector('.hud-objetivo')?.textContent, orador: document.querySelector('.hud-orador span')?.textContent,
    reloj: document.querySelector('.hud-reloj')?.textContent, textos: vis.length, fuera,
    fuentes: ['700 56px "Space Grotesk"', '600 26px Manrope', '500 18px "JetBrains Mono"'].map((f) => f + ':' + document.fonts.check(f)),
    cargadas: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight) });
})()`;

const informe = [];
for (const [w, h] of [[1280, 720], [800, 600]]) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base + '#/0' });
  await dormir(1800);
  const n = JSON.parse((await cdp('Runtime.evaluate', { expression: 'Reveal.getTotalSlides()', returnByValue: true })).result.result.value);
  for (let i = 0; i < n; i++) {
    await cdp('Runtime.evaluate', { expression: `Reveal.slide(${i})` });
    await dormir(1600);
    const r = (await cdp('Runtime.evaluate', { expression: COMPROBAR, returnByValue: true })).result.result.value;
    informe.push(`${w}x${h} #${i}: ${r}`);
    const png = (await cdp('Page.captureScreenshot', { format: 'png' })).result.data;
    writeFileSync(join(salida, `${w}x${h}-diapo-${String(i + 1).padStart(2, '0')}.png`), Buffer.from(png, 'base64'));
  }
}
informe.push('CONSOLA/RED:', ...(consola.length ? consola : ['(sin mensajes)']));
writeFileSync(join(salida, 'informe.txt'), informe.join('\n'));
console.log(informe.join('\n'));
ws.close(); ch.kill();
