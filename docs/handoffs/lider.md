# Handoff — Líder

## Hecho

- Rúbrica confirmada: es la guía global (5 criterios, 1 a 5). Ver `docs/decisiones.md`.
- Horarios oficiales del domingo: evaluación del jurado **17:00**; hora límite oficial para subir el proyecto **23:59** (confirmada por Carlos).
- Formato de demo decidido: **video de 30 s con subtítulos en inglés**.
- Entrega en inglés `docs/entrega/01` a `07` completada con lo verificado: enlaces de datasets comprobados, URL del sitio, resultados preliminares de NASA POWER, uso de IA real y librerías con licencia.
- `docs/bitacora.md`, `docs/RECURSOS.md`, `docs/investigacion/hallazgos.md` y `metodo.md` al día.

## En curso

- Demo (video): la desarrolla el equipo; guion en `docs/entrega/08-demo-draft.md`.
- Issue #2: quedan solo los TODO que dependen de otros (ver abajo).

## Falta

- Hora límite oficial: **domingo 23:59**. Meta interna: borrador completo a las 11:00 y enviar a más tardar a las 13:00, para practicar antes del jurado de las 17:00.
- **Mañana, después de enviar el proyecto:** limpiar el nombre del integrante menor de 18 del historial de git (reescribir historia y `force push`, coordinado con el equipo: todos deben clonar de nuevo) y pedir a GitHub Support que purgue las referencias de los PR. Decidido por Carlos el 2026-11-14: no influye en la entrega, así que se hace después. Hoy el nombre ya no está en el árbol de `main` ni de `dev`.
- IA: solo Claude (confirmado). Si se agrega voz o imagen generada, declararla en `docs/entrega/05-use-of-ai.md` con marca de agua.
- Pegar el enlace único de la demo en `docs/entrega/02-demo-link.md` cuando exista, y probarlo sin sesión iniciada.
- Actualizar resultados de `docs/entrega/04-project-details.md` y `06-nasa-data.md` cuando lleguen MODIS y el pipeline final.
- Avisar al equipo: no hay congelamiento de funciones; se trabaja hasta que no se pueda, con las 4 pantallas de datos reales como prioridad.

## Bloqueos

- Ninguno técnico.

## Para otros roles

- **Todos:** sin congelamiento de funciones (decisión de Carlos, 2026-11-14): se trabaja hasta que no se pueda. Prioridad: las 4 pantallas con datos reales. Límite oficial 23:59; la meta del equipo es entregar antes de las 13:00.
- **Prog. A (Luca):** avisar cuando MODIS esté analizado y qué datasets se usaron de verdad (`docs/entrega/06-nasa-data.md`, `docs/RECURSOS.md`).
- **Prog. B (Diego):** cuando la web esté lista, avisar para volver a probar la URL pública (`docs/entrega/03-project-link.md`).
- **UI/UX (Ehileen):** las cifras locales que se pueden usar en la web y con qué matiz están en `docs/investigacion/contexto-local.md`.

Cómo revisar: `git diff --stat dev` debe mostrar solo `docs/`.

---

## 2026-11-14

- Entorno del repo configurado.
- Bloque 09:00-14:00: rúbrica, hora límite, fuentes verificadas, borrador de entrega, bitácora.
- Tarde: horarios oficiales, formato de demo, entrega completada (issue #2), validación del método (issue #5).

## Pedidos del Líder tras revisar MODIS (2026-11-14)

- **Luca (Prog. A):** sube a Drive (`datasets/`) los CSV de AppEEARS de las 6 zonas, para que Investigación reproduzca las cifras. Revisa por qué la superficie baja en El Centenario y Sur (calidad 0b01, hora de paso) antes de que se cite.
- **Diego (Prog. B):** hecho en el PR #57: Calor muestra la superficie MODIS con su nota (el aire sube +1.47 °C; no coinciden) y `web/data/` ya tiene la salida nueva. Falta integrar la interfaz de UI/UX.
