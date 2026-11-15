# Video de Radar BCS (Remotion)

## Tráiler horizontal de 29 s (`RadarBCSTrailer`), versión principal desde el 2026-11-15

**1920 × 1080, 30 fps, 29 s (870 fotogramas)**, pensado para que el jurado lo vea en pantalla de escritorio.
- Pantallas: la app real en movimiento (clips grabados de la web pública), en teléfonos 3D y en un laptop 3D con la versión de escritorio.
- Ritmo: música a 120 BPM y cortes en múltiplos de 0.5 s.
- Voz "Tamsin" de ElevenLabs (voice library, model Eleven v4, 1.08×): `public/narracion-tamsin.mp3`, 27.31 s.
- Subtítulos en inglés, cinéticos, palabra por palabra, con color en las palabras clave.
- Sin etiquetas de IA en pantalla, sin logos de la NASA, sin personas.

**Clips grabados de la web publicada** el 2026-11-15 entre las 12:32 y las 12:36 (hora de La Paz), desde `https://ingidscarlosdanc21.github.io/radar-BCS/?lang=en`. Esa web corresponde al commit `e0eb13f` de `main`: antes de grabar, `index.html`, `js/app.js`, `js/animacion-satelite.js` y `css/estilos.css` del sitio coincidían byte a byte con `origin/main`, y el despliegue "Publicar web en GitHub Pages" de ese commit había terminado bien.

Escenas (`TRAILER_ESCENAS` en `src/guion.ts`). Cada una tiene su propio fondo (`FondoVivo`: foto GIBS/MODIS con parallax, manchas de color animadas, luz volumétrica y partículas):

| Tiempo | Voz | Plano |
|---|---|---|
| 0–4 | frase 1 | Foto MODIS/GIBS con empuje hacia La Paz, calima y fuga de luz; HEAT · WATER · SEA cuando la voz los dice |
| 4–7.5 | frase 2 | Logo con glitch y barrido. **El laptop abre la tapa** y revela Inicio de escritorio; el teléfono muestra la **barra inferior** cambiando de pantalla (Weather Map con pines, Fishing Map, Farming). Fondo cian de marca |
| 7.5–14 | frase 3 | Ámbar con brasas: contador +1.47 °C, gráfica anual real y sello p < 0.001; el teléfono corre la **simulación "Travel through time"** |
| 14–16 | frase 4 | Cian con lluvia: barras reales, "No clear change" y p = 0.129; el teléfono muestra la **simulación de lluvia** |
| 16–19.5 | frase 5 | Esmeralda: 38 pines en oleadas sobre la foto satelital (al fondo, desenfocada) con contador. Delante, el **laptop con el mapa de escritorio** y el **teléfono con el mismo mapa** (la misma app en computadora y celular) |
| 19.5–23.5 | frase 6 | Verde-azulado: montaje cada 0.5 s que alterna laptop y teléfono (contrapicado, picado, dolly): **GOES-West de 2 h** (laptop), **lluvia IMERG** (teléfono), **Agro con NDVI** (laptop), **calor del suelo desde el espacio** (teléfono) y **"Travel through time"** (laptop). Luego "Model estimates. / Not official warnings." sobre Avisos |
| 23.5–29 | frase 7 | Cálido de marca: "What changed, not why."; logo con destellos delante del **laptop y el teléfono juntos** (desenfocados); URL y fuentes; fundido a negro |

**Lecho de 29 s.** El lecho original dura 28 s. `public/audio/bed-120bpm-29s.mp3` es ese lecho seguido de sus últimos 4 s (24–28 s) en fundido cruzado triangular de 3 s, recortado a 29 s, con fundido de salida de 1.4 s:
```
ffmpeg -i bed-120bpm-28s.mp3 -i bed-120bpm-28s.mp3 -filter_complex "[1:a]atrim=start=24:end=28,asetpts=PTS-STARTPTS[cola];[0:a][cola]acrossfade=d=3:c1=tri:c2=tri,atrim=0:29,afade=t=out:st=27.6:d=1.4[o]" -map "[o]" -c:a libmp3lame -b:a 192k bed-120bpm-29s.mp3
```

### Pasos (desde `video/`)

1. `npm install`. Si el disco C: está lleno, pon `node_modules` en otro disco con una unión: `mklink /J node_modules D:\...\node_modules` (la carpeta destino debe llamarse `node_modules`).
2. **Clips de la app en movimiento** (desde la raíz del repo, de día en La Paz): `node scripts/grabar-clips.mjs video/public/clips`. Graba con Chrome sin ventana (CDP `Page.startScreencast`, celular 390 × 844 y escritorio 1440 × 900 para los clips `esc-*`, ambos a DPR 2) mientras desplaza, arrastra y acerca mapas, toca chips, pines y la barra inferior (cada toque deja un círculo visible), y arma MP4 H.264 de 30 fps (crf 18) por clip. Pesan ~25 MB: conviene que `public/clips` sea una unión a otro disco. `--solo=id1,id2` repite solo algunos; `--explorar` imprime mapas, botones y secciones de cada pantalla. Revisa los clips: si una pantalla salió con "could not be loaded", repítela más tarde.
3. Capturas fijas (solo para el video vertical de respaldo): `node scripts/capturar-video.mjs`.
4. Voz: copia `narracion-tamsin.mp3` a `public/` (no se sube). El nombre está en `VOZ` de `src/guion.ts`.
5. Audio: `public/audio/` (lecho y efectos CC0; fuentes en `public/audio/LICENCIAS.md`, hoja de señales en `docs/entrega/09-audio-trailer.md`). Las señales salen de `SENALES` en `src/guion.ts`. El lecho va a 0.20 mientras habla la voz, 0.28 en los huecos, y sube a 1.0 al terminar la voz.
6. Previsualizar: `npm run dev` y abre `RadarBCSTrailer`.
7. Renderizar: `npx remotion render RadarBCSTrailer out/v.mp4 --codec=h264 --crf=18 --audio-bitrate=192k --concurrency=4`.
8. Normalizar la sonoridad sin recodificar la imagen: `ffmpeg -i out/v.mp4 -c:v copy -af "loudnorm=I=-15:TP=-1.5:LRA=7,aresample=48000" -c:a aac -b:a 192k out/trailer-radar-bcs-v3.mp4`.
9. Verificar: `ffprobe` (1920x1080, 30 fps, ≤ 30 s) y `ffmpeg -i out/trailer-radar-bcs-v3.mp4 -af ebur128=peak=true -f null -` (≈ −15 LUFS, pico ≤ −1 dB). El video debe durar 30 s o menos..

Código del tráiler en `src/trailer/`:
- `Trailer.tsx`: capas, subtítulos cinéticos y audio.
- `Escenas.tsx`: las 7 escenas.
- `Laptop.tsx`: laptop 3D en CSS: tapa con bisel y cámara, clip de escritorio como pantalla, bisagra, base de aluminio con teclado y trackpad, reflejo, sombra de contacto y giro de apertura de la tapa.
- `Telefono.tsx`: teléfono 3D en CSS con un clip real (`<Video>` de `@remotion/media`) o una captura como pantalla.
- `comun.tsx`: `FondoVivo`, grano, viñeta, destellos, fugas de luz, gradación y aberración cromática.
- `datos.ts`: lee la serie anual real de `web/data/indicadores.json` y las coordenadas de `web/data/localidades_tendencias.json`.

Los efectos son CSS/SVG propios (no `@remotion/effects` ni Three.js): se ven igual en el render sin GPU, y `@remotion/effects` dice `"license": "UNLICENSED"` en su `package.json`.

### Re-tiempo cuando cambie la voz (solo se edita `src/guion.ts`)

Ningún componente tiene tiempos de voz escritos a mano.

1. Copia la voz nueva a `public/`, pon su nombre en `VOZ` y mide la duración: `npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 public/<voz>.mp3` (máximo ~27.5 s para que quepa el cierre en 29 s; tope absoluto del video: 30 s).
2. Mide los tramos de voz entre pausas: `ffmpeg -i public/<voz>.mp3 -af silencedetect=n=-35dB:d=0.07 -f null - 2>&1 | findstr silence_` (cada `silence_end` es el inicio de un tramo y cada `silence_start` su fin). Para tiempos por palabra exactos se puede usar Whisper (`npx remotion add @remotion/install-whisper-cpp` y `transcribe()` con `tokenLevelTimestamps`) o la alineación forzada de ElevenLabs.
3. En `src/guion.ts` actualiza `TRAMOS_VOZ`: texto y `desde`/`hasta` de cada tramo. De ahí salen solos:
   - `SUBTITULOS`, que agrupa tramos con `LINEAS`;
   - `PALABRAS`, el tiempo de cada palabra repartido por sílabas;
   - `PALABRAS_APERTURA` y `MOMENTOS` (contador, gráfica, sello, no clear change, pines, La Paz, model estimates, not official, cierre, logo);
   - `SENALES` y el ducking del lecho.
4. Si una frase ya no cabe en su escena, mueve los cortes de `TRAILER_ESCENAS` (múltiplos de 0.5 s, sin huecos).
5. Revisa en Studio y renderiza como en los pasos 7 a 9.

La composición vertical anterior (`RadarBCS30s`, abajo) se conserva como respaldo; usa las mismas `SUBTITULOS`, pero sus escenas no se re-tiempan solas.

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
