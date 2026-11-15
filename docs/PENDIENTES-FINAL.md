# Pendientes finales y traspaso (domingo 15-nov-2026, ~10:50 hora de La Paz)

Para quien continúe (sesión de Ehileen/UI-UX o cualquier agente). Carlos agotó su límite de uso; todo lo siguiente sigue en pie. Reglas en `AGENTS.md`: PR a `dev`; a `main` **solo cuando Carlos diga "fusiona"**; sin `push --force`; sin nombres de menores; sin logos NASA; nada se guarda ni se envía en la plataforma de la NASA sin que Carlos lo pulse.

## Estado
- `main` tiene hasta el PR #216 (menú con íconos, Acciones en Clima, Agro con capas, 38 lugares, animación). Sitio: https://ingidscarlosdanc21.github.io/radar-BCS/
- `dev` va por delante: #217 a #220 y el video (#222). **PR #221 (`dev` → `main`) abierto, limpio, puerta de calidad en verde** (193 pruebas web, 50 de diseño, 76 de análisis). Falta el "fusiona 221" de Carlos. Después, verificar el sitio público a 360/390 px (barra de 5 botones con Inicio al centro, ES/EN).
- Puerta de calidad en esta PC: `PYTHON=py powershell -File scripts/verificar-todo.ps1` (`python` es el alias de la Tienda).

## Video (listo para revisar)
- Archivo: `video/out/radar-bcs-30s.mp4` (26.0 s, 1080×1920) **solo en la PC de Carlos** (git lo ignora). Subirlo a Drive (`video/`) o YouTube "no listado", abrirlo sin sesión, y ese enlace va en el campo de demo (`docs/entrega/02-demo-link.md`, `PLATAFORMA-LISTA.md`).
- Voz: ElevenLabs, voz premade "Sarah" (id `EXAVITQu4vr4xnSDxMaL`), velocidad 1.15, texto = columna de narración de `docs/entrega/08b-video-shotlist.md` en un solo párrafo (sin saltos de línea: el CLI en Windows corta en el primer salto). Duración 25.4 s. Tiempos de subtítulos medidos con alineación forzada de ElevenLabs (`video/src/guion.ts`).
- La clave de ElevenLabs vive solo en `.env.local` de la sesión que la creó; no está en el repo. Si hace falta regenerar, otra sesión necesita su propia clave (aprobación en el navegador de Carlos) y `video/public/narracion.mp3` (ignorado por git).
- Rehacer capturas con el sitio ya actualizado a `main` (de día): `node scripts/capturar-video.mjs`, luego `cd video && npm install && npm run render`; medir con `npm run duracion` (debe ser ≤ 30 s).
- Cuidado: la toma 1 enseña la tarjeta de agua (+1.36 cm) que el guion no menciona; es real, pero se puede acortar el recorrido en `video/src/` si se prefiere.
- Declarado: ElevenLabs "usado" en `docs/RECURSOS.md`, `05-use-of-ai.md` y `PLATAFORMA-LISTA.md`; Remotion en `RECURSOS.md` y `07`.

## Ramas con trabajo sin integrar (decidir con Carlos)
- `ui-ux/ajustes-escritorio` (Ehileen: logo nuevo en cabecera, cabecera a todo lo ancho). Choca con `dev` en `web/css/menu.css` y `web/index.html`; el PR #220 ya integró solo la cabecera ancha en móvil. Si se integra el logo nuevo: registrarlo en `docs/RECURSOS.md`, `05` y `07` y conservar su marca "AI-generated".
- `prog-b/clima-detalle` (Diego: buscador, chips de capa y detalle de tarjetas de Clima). Probar a 360 px antes de fusionar.
- `lider/marca-en-logo`: la marca de IA dentro del imagen del logo; revisar contra lo pedido en el issue #119 (texto visible junto al logo).
- Ramas de Luca (`prog-a/tendencias`, `extender-2026`, `revision-al-dia`, `pruebas-appeears`): solo `analisis/`; no fusionar `tendencias` sin confirmar con Luca (dice "calor con MODIS", y la decisión vigente es aire/NASA POWER).

## Entrega (Carlos, en la plataforma)
- Campos en inglés de `docs/entrega/PLATAFORMA-LISTA.md` (nada de "TODO"; quitar comentarios `<!-- -->` y la frase de celular real del hardware mientras #71 siga abierto), Members, Lock, "Submit for Judging" (meta 13:00, límite 23:59), guardar captura del banner.
- `docs/entrega/02-demo-link.md` sigue en "TODO" hasta tener el enlace del video; `05-use-of-ai.md`: queda por decidir la nota de marca visible en los PNG de Stitch y la casilla "No NASA logos" (revisar a ojo las imágenes).
- Prueba en un celular real (issue #71) y anotar modelo/navegador en `04`.
- Open-Meteo: ~76 coordenadas por carga fría (límite gratuito 10 000/día); vigilar si hay mucho tráfico.

## Documentos en Drive
- "Bitácora Radar BCS" y "Documentación Radar BCS" ya se actualizaron hoy (entradas al final, sin nombres). Confirmar que muestran "Guardado en Drive". Las portadas listan integrantes por nombre: Carlos debe revisarlas por la regla de menores.

## Después de enviar
- Re-proteger `main`. Purga del nombre de un menor del historial y de los archivos que aún lo traen (`AGENTS.md`, `diseno/README.md`, `docs/bitacora.md`, `contrato-datos.md` y otros): **solo con confirmación de Carlos**.
- Cerrar issues ya cumplidos con comentario: #128, #144, #93 (tras revisión del inglés por Ehileen), #78, #117–#120, #92, #82. Siguen abiertos de verdad: #71, #188, #190, #197.
- Revisión del inglés por una persona (Ehileen) pendiente: se declara que no hubo revisión de hablante nativo.
