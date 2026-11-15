# Video de 30 s de Radar BCS (Remotion)

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
