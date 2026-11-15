# Brief para armar el video de 30 s de Radar BCS (para otro Claude o para quien edite)

Todo lo que necesitas está aquí; no hace falta leer el resto del repositorio. Guion y reglas en [`08b-video-shotlist.md`](08b-video-shotlist.md).

> **Formato nuevo (2026-11-15): tráiler horizontal 16:9, 1920 × 1080, 30 fps, 28 s**, composición `RadarBCSTrailer` en [`video/`](../../video/README.md). Misma voz y mismos subtítulos en inglés; música y efectos hechos con muestras CC0 de Freesound procesadas por script (ver `09-audio-trailer.md`; sin música con copyright); cortes en la rejilla de 120 BPM (0.5 s); teléfonos en 3D con capturas reales de la web; **sin etiquetas visibles de IA**, sin logos de la NASA, sin personas. Lo de abajo describe el video vertical anterior (`RadarBCS30s`), que queda como respaldo.

## Qué entregar

Un video **MP4 vertical 1080 × 1920** (o 390 × 844 escalado), **de 30 s o menos** (apunta a 27 s), con:

1. La voz **en inglés** que Carlos genere en ElevenLabs con el texto del guion (llega como archivo de audio; no la generes tú).
2. **Subtítulos en inglés quemados**, idénticos a lo que dice la voz, letra grande (mínimo 36 px a 1080 de ancho), contraste alto, dentro de la zona segura.
3. **Sin etiqueta de IA visible en pantalla** (decisión de Carlos, 2026-11-15; ver `docs/decisiones.md`). La declaración va en la descripción del video, en `docs/entrega/05-use-of-ai.md`, en `docs/RECURSOS.md` y en el campo de IA de la plataforma.
4. Imágenes **solo de nuestra web pública**: https://ingidscarlosdanc21.github.io/radar-BCS/ (usa `?lang=en` para que la pantalla coincida con la voz).

## Tomas (grabar con Chrome en modo celular 390 × 844, sin cursor ni notificaciones)

| # | Toma | Ruta | Duración |
|---|---|---|---|
| 1 | Tarjeta de título "Radar BCS · OptiPaz" (fondo liso con los colores de la web; **sin** logos de NASA) y luego Inicio | `index.html?lang=en` | ~6 s |
| 2 | Ficha de Calor con la cifra de +1.5 °C y "p < 0.001" visibles | `?lang=en#ficha/calor` | ~6 s |
| 3 | Ficha de Lluvia con "no clear change" visible | `?lang=en#ficha/lluvia` | ~5 s |
| 4 | Mapa de lugares con los pines por estado (sin teclear nada en el buscador) | `?lang=en#clima/zonas` (baja solo hasta el mapa) | ~4 s |
| 5 | Clima (4 tarjetas) y un vistazo a Pesca con la pastilla "model, not official" | `?lang=en#clima`, luego `#pesca` | ~5 s |
| 6 | Texto final: el enlace de la web y `Data: NASA POWER · MODIS · GRACE · GIBS` (solo texto) | tarjeta de cierre | ~3 s |

Si una ruta no abre justo la pantalla, navega con el menú inferior y toca; verifica en pantalla que se vea la cifra o el texto indicado antes de grabar. **Si aparece "sin dato"/"no data", espera y vuelve a cargar**; no grabes con datos vacíos.

## Reglas que no se pueden romper

- **Nadie en cámara y ninguna voz humana:** no hay menores ni personas en el video.
- **Ni logos ni marca de la NASA** (banderas, parches, "meatball"); NASA solo se escribe.
- No decir ni mostrar causas del calor; no decir que la superficie se calentó; no llamar "oficial" a lo que sale del modelo.
- Cifras solo las del guion (`data/salida/indicadores.json`).
- Si el logo de Radar BCS aparece, debe ser el del sitio, en su versión limpia (`logo-radar-bcs.png`, sin marca en pantalla; la declaración de que fue generado con Gemini está en `05` y en `docs/RECURSOS.md`).
- Duración **medida**, no estimada: ≤ 30 s.

## Herramientas

- **Decisión (2026-11-15): el video se arma con Remotion** en [`video/`](../../video/README.md). Capturas: `node scripts/capturar-video.mjs` (Chrome sin ventana, 390 × 844 a 1080 px de ancho, inglés, espera datos). Render: `cd video && npm install && npm run render`. Texto y tiempos en `video/src/guion.ts`. Si cambia la web (p. ej. la UI móvil compacta), repetir las capturas antes de renderizar.

- Esta computadora **no tiene ffmpeg**. Opciones: instalarlo con `winget install Gyan.FFmpeg`, o editar en CapCut, DaVinci Resolve o Clipchamp.
- Para capturas fijas hay un script de Chrome sin ventana en `C:\Users\mitte\.claude\jobs\d07f6ee7\tmp\captura.mjs` (acepta un JSON con la URL, el ancho y pasos de JavaScript/espera/foto). Sirve para tomas fijas; las tomas con movimiento se graban con la grabadora de pantalla.

## Después de armarlo

1. Subir a un enlace público (YouTube "no listado" o Drive con acceso a cualquiera con el enlace) y abrirlo en una ventana **sin sesión**.
2. Descripción del video: `Radar BCS (OptiPaz, NASA Space Apps 2026, La Paz). Narration is an AI-generated voice (ElevenLabs). Screen footage is our own website. Data: NASA POWER, MODIS, GRACE, GIBS.`
3. Pasar el enlace a Carlos; él lo pega en el campo de demo (ver `PLATAFORMA-LISTA.md`).
