# Video de Radar BCS (Remotion)

## Tráiler horizontal de 28 s (`RadarBCSTrailer`) — versión principal desde el 2026-11-15

**1920 × 1080, 30 fps, 28 s (840 fotogramas)**, para que el jurado lo vea en pantalla de escritorio; los teléfonos aparecen en 3D con perspectiva. Música a 120 BPM: todos los cortes caen en múltiplos de 0.5 s. Misma voz y mismos subtítulos que el video vertical (`SUBTITULOS` en `src/guion.ts`), rediseñados al estilo cine (tercio inferior, fundido, sombra). Sin etiquetas de IA en pantalla, sin logos de la NASA, sin personas.

Escenas (tiempos en `TRAILER_ESCENAS` de `src/guion.ts`): 0–3 apertura con la foto MODIS/GIBS, calima y "HEAT · WATER · SEA"; 3–6 logo con glitch y teléfono que sube (Inicio); 6–12 contador +1.47 °C, gráfica anual real y sello p < 0.001; 12–15.5 barras de lluvia reales y "No clear change" (p = 0.129); 15.5–18.5 la foto satelital inclinada con los 38 lugares en cascada; 18.5–22 cortes rápidos (Clima, Pesca) y "Not official warnings."; 22–28 "What changed, not why.", logo, URL y fuentes, fundido a negro.

Pasos (desde `video/`):

1. `npm install` (si el disco C: está lleno, pon `node_modules` en otro disco con una unión: `mklink /J node_modules D:\...\node_modules`; la carpeta destino debe llamarse `node_modules`).
2. Capturas: `node ../scripts/capturar-video.mjs` (de día en La Paz; 1080 px de ancho ≈ DPR 2.77). Quedan en `public/tomas/`.
3. Voz: copia la narración a `public/narracion.mp3` (no se sube).
4. Audio: `public/audio/` (lecho `bed-120bpm-28s.mp3` y efectos `.wav`, muestras CC0 procesadas; fuentes en `public/audio/LICENCIAS.md`, hoja de señales en `docs/entrega/09-audio-trailer.md`). La composición detecta qué archivos existen y solo coloca esos; las señales están en `LECHO` y `SENALES` de `src/guion.ts`. El lecho va a 0.20 mientras habla la voz y sube a 1.0 entre 25.4 y 26.4 s.
   Después del render se normaliza la sonoridad sin tocar el video: `ffmpeg -i out/v.mp4 -c:v copy -af "loudnorm=I=-15:TP=-1.5:LRA=7,aresample=48000" -c:a aac -b:a 192k out/trailer-radar-bcs-28s.mp4`.
5. Previsualizar: `npm run dev` y abre la composición `RadarBCSTrailer`.
6. Renderizar: `npx remotion render RadarBCSTrailer out/trailer-radar-bcs-28s.mp4 --codec=h264 --crf=18 --audio-bitrate=192k` (con poca RAM, añade `--concurrency=3`).
7. Verificar: `ffprobe` (1920x1080, 30 fps, ≤ 30 s) y `ffmpeg -i out/trailer-radar-bcs-28s.mp4 -af ebur128=peak=true -f null -` (≤ −14 LUFS, pico ≤ −1 dBTP).

Código del tráiler en `src/trailer/`: `Trailer.tsx` (capas, subtítulos, audio), `Escenas.tsx` (las 7 escenas), `Telefono.tsx` (teléfono 3D con transformaciones CSS y la captura real como pantalla), `comun.tsx` (grano, viñeta, destellos, fugas de luz, gradación, aberración cromática), `datos.ts` (lee la serie anual real de `web/data/indicadores.json` y las coordenadas de `web/data/localidades_tendencias.json`). Los efectos se hicieron con CSS/SVG (no con `@remotion/effects` ni Three.js) para que se vean igual en el render sin GPU y para no depender de paquetes con licencia no declarada (`@remotion/effects` dice `"license": "UNLICENSED"` en su `package.json`).

### Re-tiempo cuando cambie la voz (solo se edita `src/guion.ts`)

Ningún componente tiene tiempos de voz escritos a mano: todo sale de `src/guion.ts`.

1. Copia la voz nueva a `public/narracion.mp3` y mide su duración: `npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 public/narracion.mp3` (máximo ~27 s para que quepa el cierre; el video sigue en 28 s, `TRAILER_DURACION_S`).
2. Mide cuándo empieza cada frase. Opción rápida (pausas): `ffmpeg -i public/narracion.mp3 -af silencedetect=n=-35dB:d=0.08 -f null - 2>&1 | findstr silence_end` (cada `silence_end` es el inicio de un tramo de voz). Opción por palabra: Whisper con marcas de tiempo, p. ej. `npx remotion add @remotion/install-whisper-cpp` y su `transcribe()` con `tokenLevelTimestamps`, o la alineación forzada de ElevenLabs (como se hizo el 2026-11-15).
3. En `src/guion.ts` actualiza, en este orden:
   - `SUBTITULOS`: `desde`/`hasta` de cada frase (y el texto si cambió; el último `hasta` también mueve la subida del lecho al final).
   - `PALABRAS_APERTURA`: segundo en que se oye HEAT, WATER y SEA.
   - `MOMENTOS`: contador (`contadorDesde`/`contadorHasta`), gráfica, `sello` (p < 0.001), `noClearChange`, `pLluvia`, `pinesDesde`/`pinesPaso` (38 pines en 4 oleadas), `laPaz`, `modelEstimates`, `notOfficial`, frases del cierre, `logo`, `url`, `fuentes`.
   - `TRAILER_ESCENAS`: los cortes (múltiplos de 0.5 s, sin huecos). Mueve un corte solo si la frase de esa escena ya no cabe.
   - `SENALES` se recalcula solo a partir de escenas y momentos; solo cambia sus volúmenes si hace falta.
4. Revisa en Studio (`npm run dev` → `RadarBCSTrailer`) y renderiza como en los pasos 6 y 7 (render + normalización de sonoridad + `ebur128`).

La composición vertical anterior (`RadarBCS30s`, abajo) se conserva como respaldo.

---

# Video vertical de 30 s (`RadarBCS30s`, respaldo)

Video vertical 1080 × 1920, 30 fps, 27 s, para el campo de demo de la entrega. Guion y reglas: [`docs/entrega/08b-video-shotlist.md`](../docs/entrega/08b-video-shotlist.md) y [`08c-brief-video.md`](../docs/entrega/08c-brief-video.md).

Lleva: capturas de nuestra web pública (en inglés), subtítulos en inglés quemados, tarjeta de título y de cierre con la paleta de la web. Sin personas, sin logos de la NASA (solo se escribe "NASA"); el logo de Radar BCS aparece en su versión limpia. **Sin etiquetas de IA en pantalla** (decisión de Carlos, 2026-11-15, ver `docs/decisiones.md`): la declaración de la voz (ElevenLabs) va en la descripción del video, en `docs/entrega/05-use-of-ai.md`, en `docs/RECURSOS.md` y en el campo de IA de la plataforma.

Remotion tiene licencia propia: es gratis para individuos, organizaciones sin fines de lucro y empresas de hasta 3 empleados ([LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)). Este es un proyecto no comercial de un hackatón y lo renderiza una persona (Carlos).

## Pasos (Carlos)

Requisitos: Node.js 20.19+ y Google Chrome. Todo desde la carpeta `video/`, salvo donde se indica.

1. **Instalar** (una vez): `npm install`
2. **Capturas de la web** (desde la raíz del repo, de día, después de las 07:00 en La Paz):
   `node scripts/capturar-video.mjs` (o `npm run capturas` dentro de `video/`).
   Guarda `public/tomas/*.png` y `public/tomas/tomas.json`. Si una toma dice `AVISO` (faltan datos o sale "no data"), espera y vuelve a correrlo. Para probar con la web local: `node scripts/capturar-video.mjs http://localhost:8000/`.
3. **Voz**: en ElevenLabs genera la narración en inglés con el texto de la columna "Narración" de `08b` (las 6 frases seguidas) y guárdala como **`video/public/narracion.mp3`**. No se sube al repo (está en `.gitignore`).
4. **Previsualizar**: `npm run dev` (abre Remotion Studio en el navegador). Revisa que los subtítulos coincidan con la voz.
5. **Renderizar**: `npm run render` → `video/out/radar-bcs-30s.mp4`. La primera vez Remotion baja su navegador. Si no existe `narracion.mp3`, renderiza igual **en silencio** y lo avisa en la consola (sirve solo como prueba).
6. **Medir la duración** (no a ojo): `npm run duracion` (debe decir 30 o menos; hoy da `27.000000`). La de la voz: `npm run duracion:voz`. Al renderizar, la consola también imprime `Narración: X s; video: 27 s`.
7. **Subir**: YouTube "no listado" o Google Drive con "cualquier persona con el enlace". Descripción (aquí va la declaración de IA, no en pantalla): `Radar BCS (OptiPaz, NASA Space Apps 2026, La Paz). Narration is an AI-generated voice (ElevenLabs). Screen footage is our own website. Data: NASA POWER, MODIS, GRACE, GIBS.` Abre el enlace en una ventana de incógnito (sin sesión) para comprobar que es público y pégalo en el campo de demo.

## Si la voz dura distinto

Todo se edita en **`src/guion.ts`** (en segundos):

- `SUBTITULOS`: cada frase con `desde` y `hasta`. Pon los tiempos en que la voz empieza y termina cada frase (en Studio, mueve el cursor y lee el tiempo arriba del timeline). El texto debe quedar idéntico al de `08b`.
- `ESCENAS`: cuándo empieza y termina cada toma. Deben ir seguidas, sin huecos, y la última termina en `DURACION_S`.
- `DURACION_S`: duración total (máximo 30; si pasa de 30 el render se detiene con error).
- `PLANOS`: dentro de cada toma, a qué segundo se desplaza la pantalla y si es con scroll o fundido.

Si la voz dura más de ~29 s, pide en ElevenLabs una velocidad un poco mayor antes de recortar texto.

## Cuando cambie la web (por ejemplo, al fusionar la UI móvil compacta, rama `lider/movil-compacto`)

Repite las capturas: `node scripts/capturar-video.mjs` y vuelve a renderizar. Las "marcas" (dónde empieza cada tarjeta o sección) se recalculan solas; si una sección cambió de nombre o selector, ajústalo en `TOMAS` dentro de `scripts/capturar-video.mjs`. Con `--explorar` guarda también la página completa en `public/tomas/explorar/` para revisar.

## Estructura

- `src/guion.ts`: texto, tiempos, planos (lo único que normalmente se edita).
- `src/Root.tsx`: composición `RadarBCS30s`; detecta si hay narración y lee `public/tomas/tomas.json`.
- `src/Video.tsx`: una secuencia por toma, subtítulos y audio.
- `src/escenas/`: `TarjetaTitulo`, `TomaPantalla` (captura con scroll/fundido), `TarjetaCierre`.
- `src/componentes/`: `Subtitulos`.
- `src/estilo.ts`: paleta y fuentes de la web (Space Grotesk, Manrope, JetBrains Mono; SIL OFL 1.1).
- `public/logo-radar-bcs.png`: copia del logo del sitio (versión limpia, sin marca en pantalla).

Las capturas (`public/tomas/`, ~3.4 MB), la voz y `out/` no se suben al repo.
