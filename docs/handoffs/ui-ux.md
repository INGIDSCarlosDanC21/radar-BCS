> **Nota (2026-11-15): documento histórico; lo que contradiga a `docs/decisiones.md` (2026-11-15) está superado por ese archivo.** Ver la web actual: menú Clima · Pesca · Inicio · Agro · Avisos, 38 lugares en Clima, 19 puertos en Pesca.

# Handoff — UI/UX

## Hecho

- **2026-11-14**: pulido de las 17 pantallas en Figma "Radar paceño" (id `ae9KMSMZUexeV0dBhDkNR1`):
  - Encabezado con el logo como componente y pestaña activa por sección; pie y botón de simulación como componentes.
  - Cabeceras de subpantallas iguales a su pantalla maestra.
  - Acentos de color por subsección.
  - Fuentes de respaldo reemplazadas por Space Grotesk, Manrope y JetBrains Mono.
  - Marcos renombrados.
- Exportados: `diseno/pantallas/` y `diseno/componentes/`; `web/assets/` (logo `logo-radar-bcs.png`, íconos `iconos/*.svg`, `tokens.css`).
- Especificación: `diseno/ESPECIFICACION.md`.
- Pruebas: `powershell -File diseno/tools/verificar-diseno.ps1`.
- PR: #99 (fusionado en `dev`).
- **2026-11-14 (cierre, #98):** íconos identificados como Google Material Symbols (Apache 2.0, licencia en `web/assets/iconos/`); marca "AI-generated" junto al logo en el componente de encabezado y `web/assets/logo-radar-bcs-ai-generated.png`; términos de Gemini registrados (Stitch: sin página pública, NO VERIFICADO); revisión de personas/menores: ninguna en imágenes, se quitaron 2 nombres reales de ejemplo de las maquetas ("Ramón Bareño", "Armando Castro"); revisión de la web a 360 px en `diseno/revision-360/REPORTE.md`. PR: #104
- **2026-11-14 (noche, bloque A):** segunda revisión a 360 px sobre `dev` con Agrícola e inglés (script `diseno/tools/revisar-360.js`; resultados al inicio de `diseno/revision-360/REPORTE.md`). Nuevos: etiquetas de los pines de Agrícola cortadas y modo oscuro roto en Inicio y Agrícola (contraste 1.80:1). Tokens de modo oscuro en `tokens.css` con 12 pruebas de contraste (45/45 en verde). Spec §5 actualizada a la barra inferior. PR: #104
- **2026-11-15 (plan autónomo #117, issue #120, Ehileen):** U1 inglés de `textos.js` → PR #123; lista de `*_en` para Luca en #118. U3 revisión visual contra Figma → tabla en #120 e issues #127 (P0 modo oscuro), #128 y #129. U4 textos alternativos y microtextos → comentario en #119. U5 uso de IA → PR #126 (Líder; se apoya en #124). U7 revisión de #116, #121, #122 y #125: "Revisado: pruebas en verde", sin fusionar. Los commits que no entraron en #104 van en PR #124 (Líder).
- **2026-11-15 (#144, Inicio fiel a Figma):** frame "Inicio" con textos verdaderos (sin estaciones, radar en dBZ, avisos ni enlaces inexistentes), sección "¿Qué cambia?" con cifras reales, íconos del cielo en tarjetas y pines, leyenda "Estado del cielo" e imagen MODIS real. Pie corregido en las 17 pantallas. Frame nuevo "Inicio · 360". 9 íconos de Material Symbols en `web/assets/iconos/cielo/`. Spec §10. Se cerró el TODO de 07 sobre los íconos de `agricola.js` (código propio, no son de Lucide). Scripts: `diseno/tools/inicio-figma.js` e `inicio-360-figma.js`. Falta la decisión de Carlos sobre la fase 2 (clima en vivo).
- **2026-11-15 (mañana, Ehileen):**
  - **Ajustes de escritorio del plan de acción:** cabecera a todo lo ancho, pies sin lista de pantallas ni enlaces al repositorio, 4 tarjetas iguales en "¿Qué cambia?" y ciudades a la altura de La Paz. PR #195, fusionado.
  - **Logo nuevo:** ícono sin fondo de Gemini (`web/assets/logo-radar-bcs-icono.png`) más el texto "Radar BCS" en Manrope 700 azul marino. Cabecera a todo lo ancho también en celular. Enlace del logo de 44 px de alto. Registro en RECURSOS, 05 y 07. PR **#224**: los commits no habían entrado en #195.
  - **Revisión de textos con el checklist de Investigación:** cumple. 5 ajustes menores en **#225**.
  - **Tercera revisión a 360 px:**
    - resueltos el P0 de lluvia, la letra menor de 12 px, el zoom y el modo oscuro;
    - nuevos: el foco cian de Inicio (1.61:1) y áreas táctiles chicas en Pesca, Avisos y Clima. Van en **#226**;
    - el reporte va en el PR **#227**.
  - **Inglés:** las 171 claves coinciden y no queda español en las pantallas ni en los atributos. Resultado en #93.

## En curso

- PR #224 (logo) y PR #227 (reporte y este handoff) esperan revisión y fusión a `dev`.

## Falta

- Revisión en celular real (#71).
- ~~Términos de Stitch~~ Hecho el 2026-11-14: Ehileen compartió los términos y el aviso de privacidad desde la app; registrados en `docs/RECURSOS.md` y `05-use-of-ai.md`, capturas en `diseno/evidencias/`.
- Íconos: los 12 exportados son Google Material Symbols (Apache 2.0, verificado el 2026-11-14; ver `web/assets/iconos/README.md`). Si en otra pantalla se usó un ícono de Flaticon, falta identificarlo y poner su atribución.
- ~~Modo oscuro de los tokens~~ Hecho (propuesta, sin Figma).
- Que Diego corrija lo de #226 (foco de Inicio y áreas táctiles) y #128 (pines de Agro). El P0 de lluvia y el modo oscuro ya están resueltos (revisión del 2026-11-15).
- Que Diego y Carlos apliquen los ajustes de texto de #225 (en especial "no es casualidad" → "poco probable por azar").
- ~~Inglés (#93)~~ Revisado el 2026-11-15: completo. Queda solo la sugerencia de conservar la pantalla al cambiar de idioma.
- Decisión del Líder: ¿las PNG de maquetas de `diseno/` necesitan la etiqueta "AI-generated" en la imagen? (PR #126).
- ~~Lista de pantallas de Stitch~~ Hecho el 2026-11-15: todas siguieron el mismo flujo (prototipo de media fidelidad del equipo → ajuste en Stitch → edición final a mano en Figma).

## Bloqueos

- Decisión de Carlos (regla 6, pregunta en #224): ¿el ícono nuevo de Gemini lleva la marca visible "AI-generated" en la cabecera? Si no hay respuesta antes de pasar a `main`, la recomendación de UI/UX es ponerla.

## Para otros roles

---

## 2026-11-14

- Entorno del repo configurado.

## 2026-11-14 (noche)

- **Roberto (`rvega22`) se suma a UI/UX** junto con Ehileen: invitación enviada con permiso de escritura (debe aceptarla en GitHub). Los dos comparten rol y carpetas (`web/assets/`, `diseno/`).
- Para no pisarse: cada quien trabaja en su propia rama `ui-ux/<tema>` (por ejemplo `ui-ux/logo`, `ui-ux/paleta`), abre PR hacia `dev` y avisa en este archivo qué tomó. **Nunca a `main`**: solo el Líder fusiona a `main`.
- Roberto: corre `scripts/sync.ps1`, carga la skill `rol-ui-ux` y usa `equipo/INICIO-ehileen.md` como mensaje de inicio (cambiando nombre y usuario). Todo asset externo se registra en `docs/RECURSOS.md` con licencia; si el diseño sale de Stitch u otra herramienta de IA, se declara en `docs/entrega/05-use-of-ai.md`.

## 2026-11-14 (noche): Stitch ya está declarado

- Carlos confirmó que la interfaz se diseña en Google Stitch. Quedó declarado como **Usado** en `docs/RECURSOS.md` (sección IA) y en `docs/entrega/05-use-of-ai.md`.
- **Tarea para Ehileen y Roberto** (lo antes posible; ya no hay congelamiento): anotar en la fila de Stitch de `docs/RECURSOS.md` qué pantallas, imágenes o logotipo salieron de Stitch, y revisar sus términos de uso (qué se puede hacer con lo generado). Lo que sea imagen generada lleva marca visible "AI-generated". Nada de logos ni marca de la NASA.
