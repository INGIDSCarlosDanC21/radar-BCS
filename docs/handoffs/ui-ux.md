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
- PR: #PR_PENDIENTE

## En curso

## Falta

- Revisión en celular real (#71).
- Confirmar la herramienta de IA que generó el logotipo.
- Confirmar origen y licencia de los íconos.
- Modo oscuro de los tokens.
- Revisar las pantallas Ficha y Acciones a 360 px.

## Bloqueos

- Nada.

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
