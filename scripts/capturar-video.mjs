// Capturas de la web pública para el video de 30 s (proyecto Remotion en video/).
//
// Uso:
//   node scripts/capturar-video.mjs [URL_BASE] [--explorar]
//   URL_BASE por defecto: https://ingidscarlosdanc21.github.io/radar-BCS/
//   Ejemplo local:        node scripts/capturar-video.mjs http://localhost:8000/
//
// Qué hace: abre Chrome sin ventana (protocolo CDP, sin dependencias de npm), emula un celular
// de 390 x 844 a escala 1080/390 (~2.77) para que cada captura mida 1080 px de ancho, abre cada
// toma del brief (docs/entrega/08c-brief-video.md) en inglés (?lang=en) y en modo claro, espera a
// que haya datos y comprueba que en la zona capturada no haya nodos "no data"/"sin dato"/"loading"
// y sí aparezcan los textos clave de la toma. Si falla, recarga y reintenta (3 veces).
// Oculta la barra inferior fija de la web (si no, saldría a media captura).
// Las capturas son "altas": Remotion hace el scroll suave entre las marcas guardadas.
// Salida: video/public/tomas/<toma>.png y video/public/tomas/tomas.json (marcas en px de imagen).
// Con --explorar guarda además la página completa a escala 1 en video/public/tomas/explorar/.
//
// Requisito: Google Chrome instalado (ruta configurable con la variable de entorno CHROME).
// "De día": los íconos del cielo dependen de la hora real en La Paz; correr después de las 07:00.
// Código de salida 2 = alguna toma quedó con AVISO (revisar la imagen antes de renderizar).

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const EXPLORAR = args.includes('--explorar');
const BASE = (args.find((a) => !a.startsWith('--')) || 'https://ingidscarlosdanc21.github.io/radar-BCS/').replace(/[?#].*$/, '');
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'video', 'public', 'tomas');

const ANCHO = 390;
const ALTO = 844;
const ESCALA = 1080 / ANCHO; // 2.769...

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

// Tomas del brief. Cada toma guarda una captura alta que va de la primera a la última "marca"
// (más MARGEN_ABAJO). Una marca es un punto de la página: {y} fijo, {sel} selector CSS o
// {texto} de un título (h1-h4). Se guardan en tomas.json en px de la imagen y las escenas de
// Remotion se mueven entre ellas (ver video/src/guion.ts).
// debe = textos que tienen que aparecer dentro de la captura (sin distinguir mayúsculas).
const TOMAS = [
  {
    id: 'toma1-inicio',
    hash: '#inicio',
    esperaSelector: '.hm-tarjeta',
    marcas: { arriba: { y: 0 }, tarjetas: { sel: '#hm-h2' }, agua: { sel: 'article[data-indicador="agua"]' } },
    debe: ['What is changing', '+1.47'],
  },
  {
    id: 'toma2-calor',
    hash: '#ficha/calor',
    esperaSelector: 'main h2',
    marcas: { arriba: { y: 0 }, significancia: { texto: 'Is it statistically significant' } },
    debe: ['+1.47', '< 0.001'],
  },
  {
    id: 'toma3-lluvia',
    hash: '#ficha/lluvia',
    esperaSelector: 'main h2',
    marcas: { arriba: { y: 0 } },
    debe: ['No clear change'],
  },
  {
    id: 'toma4-mapa',
    hash: '#clima/zonas',
    esperaSelector: '#lugares .leaflet-marker-icon, #lugares .leaflet-interactive',
    esperaExtra: 4000, // teselas del mapa
    marcas: { lugares: { sel: '#lugares' }, mapa: { sel: '#lugares .leaflet-container', margen: 60 } },
    debe: ['38 places'],
  },
  {
    id: 'toma5a-clima',
    hash: '#clima',
    esperaSelector: 'main h2',
    esperaExtra: 3000,
    marcas: { resumen: { texto: 'Regional Climate Overview' } },
    debe: ['Regional Climate Overview'],
  },
  {
    id: 'toma5b-pesca',
    hash: '#pesca',
    esperaSelector: 'main h2',
    esperaExtra: 3000,
    marcas: { arriba: { y: 0 }, diagnostico: { texto: 'Sea diagnosis' } },
    debe: ['not buoys', 'not an official warning'],
  },
];

// Nodos de texto que indican datos vacíos o carga a medias (se compara el texto completo del nodo).
const PROHIBIDOS = /^(no data|no data \(pending\)|sin dato|sin datos|loading.*|cargando.*|--)$/i;
const MARGEN_ABAJO = 760; // px CSS que se capturan debajo de la última marca

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const puerto = 9400 + Math.floor(Math.random() * 400);
const perfil = join(tmpdir(), 'perfil-capvideo-' + puerto);
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, '--no-first-run', '--lang=en-US', 'about:blank'],
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
const manifiesto = { generado: new Date().toISOString(), base: BASE, ancho: 1080, escala: ESCALA, tomas: {} };
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
  const metricas = (escala) => cmd('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: escala, mobile: true });

  await cmd('Page.enable');
  await cmd('Runtime.enable');
  await metricas(ESCALA);
  await cmd('Emulation.setTouchEmulationEnabled', { enabled: true });
  await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await cmd('Emulation.setTimezoneOverride', { timezoneId: 'America/Mazatlan' }); // hora de La Paz, B.C.S.
  await cmd('Emulation.setLocaleOverride', { locale: 'en-US' });
  mkdirSync(SALIDA, { recursive: true });

  for (const toma of TOMAS) {
    const url = BASE + '?lang=en' + toma.hash;
    for (let intento = 1; intento <= 3; intento++) {
      await cmd('Page.navigate', { url: 'about:blank' });
      await dormir(200);
      await cmd('Page.navigate', { url });
      // Espera: <main> sin aria-busy, sin "cargando" y con el selector de la toma.
      const sel = JSON.stringify(toma.esperaSelector || 'main');
      for (let i = 0; i < 60; i++) {
        await dormir(500);
        const listo = await ev(
          `(()=>{const m=document.querySelector('main');if(!m||m.getAttribute('aria-busy')==='true')return false;` +
            `if(m.querySelector('.cargando, .esqueleto'))return false;return !!document.querySelector(${sel});})()`,
        ).catch(() => false);
        if (listo) break;
      }
      await dormir(toma.esperaExtra || 1500);
      // Sin barra inferior fija, sin menú flotante y sin foco visible.
      await ev(
        `(()=>{const s=document.createElement('style');s.textContent='.barra,.mas,.saltar{display:none!important}*{caret-color:transparent!important}';` +
          `document.head.appendChild(s);document.activeElement&&document.activeElement.blur&&document.activeElement.blur();window.scrollTo(0,0);return true})()`,
      );
      await dormir(300);

      // Posición de cada marca (px CSS en la página).
      const marcasCss = await ev(
        `(()=>{const M=${JSON.stringify(toma.marcas)};const o={};for(const k in M){const m=M[k];let e=null;` +
          `if(m.y!=null){o[k]=m.y;continue}` +
          `if(m.sel)e=document.querySelector(m.sel);` +
          `if(m.texto){e=[...document.querySelectorAll('h1,h2,h3,h4')].find(h=>h.textContent.toLowerCase().includes(m.texto.toLowerCase()));` +
          `if(e)e=e.closest('section,article,.tarjeta,.bloque')&&e.closest('section,article,.tarjeta,.bloque').getBoundingClientRect().height<900?e.closest('section,article,.tarjeta,.bloque'):e;}` +
          `o[k]=e?Math.max(0,Math.round(e.getBoundingClientRect().top+scrollY-(m.margen!=null?m.margen:12))):null}return o})()`,
      );
      const faltaMarca = Object.keys(marcasCss).filter((k) => marcasCss[k] == null);
      const ys = Object.values(marcasCss).filter((v) => v != null);
      const altoPagina = await ev('Math.ceil(document.documentElement.scrollHeight)');
      const y0 = Math.min(...ys);
      const alto = Math.min(Math.max(...ys) + MARGEN_ABAJO, altoPagina) - y0;

      // Texto visible dentro de la zona capturada (por nodo).
      const nodos = await ev(
        `(()=>{const y0=${y0},y1=${y0 + alto};const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const out=[];` +
          `while(w.nextNode()){const t=w.currentNode;const s=t.textContent.replace(/\\s+/g,' ').trim();if(!s)continue;const el=t.parentElement;` +
          `if(!el)continue;const d=el.closest('details:not([open])');if(d&&!el.closest('summary'))continue;` +
          `const r=document.createRange();r.selectNodeContents(t);const b=r.getBoundingClientRect();if(!b.width||!b.height)continue;` +
          `const top=b.top+scrollY;if(top>=y0&&top<y1)out.push(s)}return out})()`,
      );
      const texto = nodos.join(' ').toLowerCase();
      const faltan = toma.debe.filter((d) => !texto.includes(d.toLowerCase()));
      const malos = nodos.filter((s) => PROHIBIDOS.test(s));
      const problema = faltan.length || malos.length || faltaMarca.length;
      if (problema) {
        console.warn(`  ${toma.id} intento ${intento}: faltan [${faltan.join(', ')}] vacíos [${malos.join(', ')}] marcas sin encontrar [${faltaMarca.join(', ')}]`);
        if (intento < 3) continue;
      }
      const r = await cmd('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: y0, width: ANCHO, height: alto, scale: 1 },
      });
      writeFileSync(join(SALIDA, toma.id + '.png'), Buffer.from(r.result.data, 'base64'));
      const marcas = {};
      for (const k in marcasCss) marcas[k] = marcasCss[k] == null ? 0 : Math.round((marcasCss[k] - y0) * ESCALA);
      manifiesto.tomas[toma.id] = { archivo: 'tomas/' + toma.id + '.png', alto: Math.round(alto * ESCALA), marcas, url };
      console.log(`${problema ? 'AVISO' : 'ok   '} ${toma.id}.png  ${Math.round(alto * ESCALA)} px de alto  marcas ${JSON.stringify(marcas)}`);
      if (problema) fallos++;
      if (EXPLORAR) {
        const ex = join(SALIDA, 'explorar');
        mkdirSync(ex, { recursive: true });
        await metricas(1);
        const c = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: ANCHO, height: Math.min(altoPagina, 8000), scale: 1 } });
        writeFileSync(join(ex, toma.id + '-completa.png'), Buffer.from(c.result.data, 'base64'));
        await metricas(ESCALA);
      }
      break;
    }
  }
  ws.close();
} finally {
  chrome.kill();
}
writeFileSync(join(SALIDA, 'tomas.json'), JSON.stringify(manifiesto, null, 2) + '\n');
console.log('Manifiesto: video/public/tomas/tomas.json');
if (fallos) console.warn(`\n${fallos} toma(s) con AVISO: revisa las imágenes antes de renderizar.`);
process.exit(fallos ? 2 : 0);
