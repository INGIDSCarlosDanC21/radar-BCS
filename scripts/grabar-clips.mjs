// Graba CLIPS EN MOVIMIENTO de la web pública para el tráiler (video/, composición RadarBCSTrailer).
//
// Uso (desde la raíz del repo):
//   node scripts/grabar-clips.mjs [SALIDA] [--solo=id1,id2] [--explorar]
//   SALIDA por defecto: video/public/clips  (pesa decenas de MB: conviene una unión a otro disco)
//
// Qué hace: abre Chrome sin ventana (CDP, sin dependencias de npm), emula un celular de 390 x 844
// con devicePixelRatio 2 (los clips "esc-" emulan un escritorio de 1440 x 900), y para cada clip navega a la pantalla (en inglés), espera los datos y
// graba con Page.startScreencast mientras hace interacciones reales (desplazar, arrastrar y hacer
// zoom en los mapas, tocar pines, chips y pestañas de la barra inferior, dejar correr las
// animaciones satelitales y las simulaciones). Cada toque se marca con un círculo en la página.
// Luego ffmpeg arma un MP4 H.264 de 30 fps (crf 18) por clip respetando los tiempos reales de
// cada cuadro. Requisitos: Google Chrome y ffmpeg en el PATH. Correr de día en La Paz (> 07:00).
import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = resolve(args.find((a) => !a.startsWith('--')) || join(RAIZ, 'video', 'public', 'clips'));
const SOLO = (args.find((a) => a.startsWith('--solo=')) || '').slice(7).split(',').filter(Boolean);
const EXPLORAR = args.includes('--explorar');
const BASE = 'https://ingidscarlosdanc21.github.io/radar-BCS/';
const ANCHO = 390;
const ALTO = 844;
const DPR = 2;

const CHROME = [process.env.CHROME, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', '/usr/bin/google-chrome']
  .filter(Boolean)
  .find((c) => existsSync(c));
if (!CHROME) throw new Error('No encontré Chrome (variable CHROME).');

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const puerto = 9800 + Math.floor(Math.random() * 150);
const perfil = join(process.env.TEMP || tmpdir(), 'perfil-clips-' + puerto);
const chrome = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, '--no-first-run', '--lang=en-US', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });

// ── Guiones de cada clip ─────────────────────────────────────────────────────────────────────
// Acciones: ir(hash) · esperar(ms) · ver(selector, bloque) desplaza suave hasta el elemento ·
// arrastrar(selector, dx, dy, ms) · rueda(selector, delta) · tocar(selector | {texto}) · recargar
const CLIPS = [
  // Inicio: cabecera y "cielo vivo"
  { id: "inicio-cielo", hash: "#inicio", espera: ".hm-tarjeta", pasos: [["esperar", 1500], ["desplazar", 520, 1400], ["esperar", 900], ["desplazar", 1300, 2200], ["esperar", 3000]] },
  // Barra inferior: cambio de pantallas
  { id: "barra", hash: "#inicio", espera: ".hm-tarjeta", pasos: [["esperar", 1200], ["tocar", ".barra a[data-nav=\"clima\"]"], ["esperar", 1500], ["tocar", ".barra a[data-nav=\"pesca\"]"], ["esperar", 1500], ["tocar", ".barra a[data-nav=\"agricola\"]"], ["esperar", 1500], ["tocar", ".barra a[data-nav=\"avisos\"]"], ["esperar", 1500], ["tocar", ".barra a[data-nav=\"inicio\"]"], ["esperar", 1500]] },
  // Clima: animación GOES-West (nubes, 2 h) y lluvia IMERG
  { id: "clima-satelite", hash: "#clima", espera: "#ani-mapa", pasos: [["esperar", 2500], ["ver", "#ani", "start"], ["esperar", 6000], ["tocar", "[data-ani=\"lluvia\"]"], ["esperar", 5000]] },
  // Clima: mapa de 38 lugares, capas y pines
  { id: "lugares", hash: "#clima/zonas", espera: "#mapa-caja", pasos: [["esperar", 1500], ["ver", "#mapa-caja", "center"], ["esperar", 2500], ["tocar", "[data-ind=\"lluvia\"], .chip:nth-of-type(2)"], ["esperar", 1800], ["tocar", "[data-ind=\"calor\"], .chip:nth-of-type(1)"], ["esperar", 1500], ["zoom", "#mapa-caja", 1], ["esperar", 1500], ["tocar", "#mapa-caja .leaflet-marker-icon, #mapa-caja path.leaflet-interactive"], ["esperar", 2500]] },
  // Clima: simulación satelital (color verdadero / calor del suelo)
  { id: "sim-satelite", hash: "#clima", espera: "#sim-sat-mapa", pasos: [["esperar", 2500], ["ver", "#sim-sat", "start"], ["esperar", 2500], ["tocar", "#sim-sat-play"], ["esperar", 3500], ["tocar", "#sim-sat [data-capa]:nth-of-type(2)"], ["esperar", 3500]] },
  // Pesca: mapa de puertos, fichas y variables
  { id: "pesca", hash: "#pesca", espera: "main h2", pasos: [["esperar", 9000], ["ver", ".leaflet-container", "center"], ["esperar", 1500], ["tocar", ".pe-chip:nth-of-type(2)"], ["esperar", 2000], ["tocar", ".pe-vars button:nth-of-type(2)"], ["esperar", 2000], ["arrastrar", ".leaflet-container", 70, -40, 800], ["esperar", 1500], ["desplazar", 700, 1800], ["esperar", 1500]] },
  // Agrícola: mapa con capas y fichas
  { id: "agricola", hash: "#agricola", espera: "#ag-mapa", pasos: [["esperar", 3500], ["arrastrar", "#ag-mapa", -60, -40, 800], ["esperar", 800], ["zoom", "#ag-mapa", 1], ["esperar", 1500], ["desplazar", 650, 1500], ["tocar", ".ag-ficha-btn"], ["esperar", 3000]] },
  // Ficha de Calor: simulación "Travel through time" y gráfica
  { id: "calor-simulacion", hash: "#ficha/calor", espera: "#sim-play", pasos: [["esperar", 1500], ["desplazar", 560, 1200], ["esperar", 600], ["tocar", "#sim-play"], ["esperar", 7000]] },
  { id: "calor-ficha", hash: "#ficha/calor", espera: "main h2", pasos: [["esperar", 1500], ["desplazar", 1500, 3500], ["esperar", 1000]] },
  { id: "lluvia-ficha", hash: "#ficha/lluvia", espera: "main h2", pasos: [["esperar", 1500], ["desplazar", 560, 1200], ["tocar", "#sim-play"], ["esperar", 5000]] },
  // ESCRITORIO (1440 x 900, DPR 2): para el laptop del tráiler. Sin pantallas que dependan de Open-Meteo.
  { id: "esc-inicio", escritorio: true, hash: "#inicio", espera: ".hm-tarjeta", pasos: [["esperar", 1500], ["desplazar", 650, 2600], ["esperar", 1500]] },
  { id: "esc-satelite", escritorio: true, hash: "#clima", espera: "#ani-mapa", pasos: [["esperar", 2500], ["ver", "#ani", "center"], ["esperar", 6000], ["tocar", "[data-ani=\"lluvia\"]"], ["esperar", 4500]] },
  { id: "esc-lugares", escritorio: true, hash: "#clima/zonas", espera: "#mapa-caja", pasos: [["esperar", 1500], ["ver", "#mapa-caja", "center"], ["esperar", 2500], ["tocar", "[data-ind=\"lluvia\"]"], ["esperar", 1800], ["tocar", "[data-ind=\"calor\"]"], ["esperar", 1200], ["zoom", "#mapa-caja", 1], ["esperar", 1200], ["arrastrar", "#mapa-caja", -140, 60, 900], ["esperar", 800], ["tocar", "#mapa-caja .leaflet-marker-icon, #mapa-caja path.leaflet-interactive"], ["esperar", 2000]] },
  { id: "esc-calor", escritorio: true, hash: "#ficha/calor", espera: "#sim-play", pasos: [["esperar", 1500], ["ver", "#sim-play", "center"], ["esperar", 800], ["tocar", "#sim-play"], ["esperar", 7000]] },
  { id: "esc-agro", escritorio: true, hash: "#agricola", espera: "#ag-mapa", pasos: [["esperar", 3500], ["ver", "#ag-mapa", "center"], ["esperar", 800], ["arrastrar", "#ag-mapa", -120, -50, 900], ["esperar", 600], ["zoom", "#ag-mapa", 1], ["esperar", 2000], ["tocar", ".ag-ficha-btn"], ["esperar", 2500]] },
  // Avisos: filtros
  { id: "avisos", hash: "#avisos", espera: "main h2", pasos: [["esperar", 2000], ["tocar", ".av-chip:nth-of-type(3)"], ["esperar", 1500], ["desplazar", 500, 1500], ["esperar", 1500]] },
];

async function main() {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch('http://127.0.0.1:' + puerto + '/json/version')).ok) break;
    } catch {}
    await dormir(250);
  }
  const pestana = await (await fetch('http://127.0.0.1:' + puerto + '/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(pestana.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let n = 0;
  const pendientes = new Map();
  let alCuadro = null;
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pendientes.has(d.id)) {
      pendientes.get(d.id)(d);
      pendientes.delete(d.id);
    } else if (d.method === 'Page.screencastFrame' && alCuadro) alCuadro(d.params);
  };
  const cmd = (method, params = {}) =>
    new Promise((res) => {
      const id = ++n;
      pendientes.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
      // si Chrome no responde (pestaña ocupada), no se queda colgado: sigue a los 15 s
      setTimeout(() => {
        if (pendientes.has(id)) {
          pendientes.delete(id);
          res({});
        }
      }, 15000);
    });
  const ev = async (expr) => {
    const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    return r.result?.result?.value;
  };
  await cmd('Page.enable');
  await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: DPR, mobile: true });
  await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await cmd('Emulation.setTimezoneOverride', { timezoneId: 'America/Mazatlan' });
  await cmd('Emulation.setLocaleOverride', { locale: 'en-US' });

  // Círculo de toque visible (se anima en la página y queda grabado).
  const TOQUE = `window.__toque=(x,y)=>{let s=document.getElementById('__toque_css');if(!s){s=document.createElement('style');s.id='__toque_css';s.textContent='@keyframes __tq{0%{transform:translate(-50%,-50%) scale(.4);opacity:.9}100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}.__tq{position:fixed;width:46px;height:46px;border-radius:50%;background:rgba(81,216,232,.35);border:3px solid rgba(255,255,255,.95);box-shadow:0 0 18px rgba(0,0,0,.35);pointer-events:none;z-index:99999;animation:__tq .6s ease-out forwards}';document.head.appendChild(s)}const d=document.createElement('div');d.className='__tq';d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),700)};true`;
  const caja = (sel) => ev(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}})()`);
  const raton = (type, x, y, extra = {}) => cmd('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });

  const acciones = {
    esperar: (ms) => dormir(ms),
    ver: async (sel, bloque) => {
      await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel.split(',')[0])})||document.querySelector(${JSON.stringify(sel)});if(e)e.scrollIntoView({behavior:'smooth',block:${JSON.stringify(bloque || 'center')}});return !!e})()`);
      await dormir(1100);
    },
    desplazar: async (px, ms) => {
      // desplazamiento suave y uniforme hecho por pasos (se ve fluido en la grabación)
      const pasos = Math.round(ms / 16);
      for (let i = 1; i <= pasos; i++) {
        const f = 0.5 - Math.cos((Math.PI * i) / pasos) / 2;
        const g = 0.5 - Math.cos((Math.PI * (i - 1)) / pasos) / 2;
        await ev(`window.scrollBy(0, ${(f - g) * px});true`);
        await dormir(16);
      }
    },
    arrastrar: async (sel, dx, dy, ms) => {
      const c = await caja(sel);
      if (!c) return console.log('   (sin', sel, ')');
      await raton('mousePressed', c.x, c.y);
      const pasos = Math.round(ms / 16);
      for (let i = 1; i <= pasos; i++) {
        const f = 0.5 - Math.cos((Math.PI * i) / pasos) / 2;
        await raton('mouseMoved', c.x + dx * f, c.y + dy * f, { buttons: 1 });
        await dormir(16);
      }
      await raton('mouseReleased', c.x + dx, c.y + dy);
    },
    zoom: async (sel, niveles) => {
      // doble toque = acercar en Leaflet
      const c = await caja(sel);
      if (!c) return console.log('   (sin', sel, ')');
      for (let k = 0; k < niveles; k++) {
        await ev(`window.__toque(${c.x},${c.y})`);
        await raton('mousePressed', c.x, c.y, { clickCount: 1 });
        await raton('mouseReleased', c.x, c.y, { clickCount: 1 });
        await raton('mousePressed', c.x, c.y, { clickCount: 2 });
        await raton('mouseReleased', c.x, c.y, { clickCount: 2 });
        await dormir(400);
      }
    },
    tocar: async (sel) => {
      const c = await caja(sel);
      if (!c) return console.log('   (sin', sel, ')');
      await ev(`window.__toque(${c.x},${c.y})`);
      await dormir(120);
      await raton('mouseMoved', c.x, c.y);
      await raton('mousePressed', c.x, c.y);
      await raton('mouseReleased', c.x, c.y);
    },
  };

  mkdirSync(SALIDA, { recursive: true });
  const informe = {};
  for (const clip of CLIPS) {
    if (SOLO.length && !SOLO.includes(clip.id)) continue;
    for (let intento = 1; intento <= 3; intento++) {
      console.log(`clip ${clip.id} (intento ${intento})`);
      const W = clip.escritorio ? 1440 : ANCHO;
      const H = clip.escritorio ? 900 : ALTO;
      await cmd('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: !clip.escritorio });
      await cmd('Page.navigate', { url: 'about:blank' });
      await dormir(200);
      await cmd('Page.navigate', { url: BASE + '?lang=en' + clip.hash });
      let listo = false;
      for (let i = 0; i < 60 && !listo; i++) {
        await dormir(500);
        listo = await ev(`(()=>{const m=document.querySelector('main');if(!m||m.getAttribute('aria-busy')==='true')return false;return !!document.querySelector(${JSON.stringify(clip.espera)})})()`);
      }
      await ev(TOQUE);
      await ev(`(()=>{const s=document.createElement('style');s.textContent='.saltar{display:none!important}*{caret-color:transparent!important}';document.head.appendChild(s);window.scrollTo(0,0);return true})()`);
      if (EXPLORAR) {
        const info = await ev(`(()=>{const o={alto:document.documentElement.scrollHeight,mapas:[],botones:[],secciones:[]};document.querySelectorAll('.leaflet-container').forEach(e=>{const r=e.getBoundingClientRect();o.mapas.push({id:e.id,padre:e.parentElement&&(e.parentElement.id||e.parentElement.className),y:Math.round(r.top+scrollY),h:Math.round(r.height)})});document.querySelectorAll('button,[role=tab]').forEach(e=>{const r=e.getBoundingClientRect();if(r.width)o.botones.push({t:e.textContent.trim().slice(0,30),c:e.className,y:Math.round(r.top+scrollY),d:Object.keys(e.dataset).join('|')})});document.querySelectorAll('section[id],h2').forEach(e=>{const r=e.getBoundingClientRect();o.secciones.push({id:e.id||e.textContent.trim().slice(0,40),y:Math.round(r.top+scrollY)})});return o})()`);
        informe[clip.id] = { listo, ...info };
        break;
      }
      // grabar
      const dir = join(SALIDA, 'tmp-' + clip.id);
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      const cuadros = [];
      alCuadro = (p) => {
        const archivo = join(dir, String(cuadros.length).padStart(5, '0') + '.jpg');
        writeFileSync(archivo, Buffer.from(p.data, 'base64'));
        cuadros.push({ archivo, t: p.metadata.timestamp });
        cmd('Page.screencastFrameAck', { sessionId: p.sessionId });
      };
      await cmd('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: W * DPR, maxHeight: H * DPR, everyNthFrame: 1 });
      const t0 = Date.now() / 1000;
      for (const [nombre, ...a] of clip.pasos) await acciones[nombre](...a);
      const t1 = Date.now() / 1000;
      await cmd('Page.stopScreencast');
      alCuadro = null;
      await dormir(300);
      if (cuadros.length < 10) {
        console.log('   pocos cuadros:', cuadros.length);
        continue;
      }
      // lista concat con la duración real de cada cuadro (la pantalla solo emite cuadros si cambia)
      const lineas = [];
      for (let i = 0; i < cuadros.length; i++) {
        const fin = i + 1 < cuadros.length ? cuadros[i + 1].t : Math.max(cuadros[i].t + 0.04, cuadros[0].t + (t1 - t0));
        lineas.push(`file '${cuadros[i].archivo.replace(/\\/g, '/')}'`, `duration ${Math.max(0.001, fin - cuadros[i].t).toFixed(4)}`);
      }
      lineas.push(`file '${cuadros[cuadros.length - 1].archivo.replace(/\\/g, '/')}'`);
      writeFileSync(join(dir, 'lista.txt'), lineas.join('\n'));
      const mp4 = join(SALIDA, clip.id + '.mp4');
      const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(dir, 'lista.txt'), '-vf', `fps=30,scale=${W * DPR}:${H * DPR}:force_original_aspect_ratio=decrease,pad=${W * DPR}:${H * DPR}:(ow-iw)/2:0:color=white,format=yuv420p`, '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
      rmSync(dir, { recursive: true, force: true });
      if (r.status !== 0) {
        console.log('   ffmpeg falló');
        continue;
      }
      informe[clip.id] = { cuadros: cuadros.length, segundos: +(t1 - t0).toFixed(2), archivo: clip.id + '.mp4' };
      console.log(`   ok ${cuadros.length} cuadros, ${(t1 - t0).toFixed(1)} s`);
      break;
    }
  }
  const ruta = join(SALIDA, EXPLORAR ? 'explorar.json' : 'clips.json');
  let previo = {};
  try {
    previo = JSON.parse(readFileSync(ruta, 'utf8')).clips || {};
  } catch {}
  writeFileSync(ruta, JSON.stringify({ generado: new Date().toISOString(), base: BASE, dpr: DPR, clips: { ...previo, ...informe } }, null, 2));
}

try {
  await main();
} finally {
  chrome.kill();
  await dormir(500);
  try {
    rmSync(perfil, { recursive: true, force: true });
  } catch {}
}
process.exit(0);
