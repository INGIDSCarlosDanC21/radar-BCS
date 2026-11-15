> **Nota (2026-11-15): documento histórico; lo que contradiga a `docs/decisiones.md` (2026-11-15) está superado por ese archivo.** Ver la web actual: menú Clima · Pesca · Inicio · Agro · Avisos, 38 lugares en Clima, 19 puertos en Pesca.

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

## 2026-11-15 (madrugada, 03:50 a 05:30)

- **Hecho:** fusionados a `dev` los PR de Ehileen (#157, #159, #162, #164), de Luca (#174, #178 vía #180) y los propios: fuentes e IA fuera de la pantalla (#163), "Ver más" y pliegues (#167, #171), plan de Clima (#165, #168, #173), entrega al día (#169, #170, #182), regla de IA con el texto oficial (#177), marca de agua dentro del logo (#181). `main` recibió #172 (con el "fusiona" de Carlos).
- **Qué hay en `main` y qué falta:** PR #183 (`dev → main`) abierto con Clima, la marca del logo y la entrega lista; **espera el "fusiona" de Carlos**.
- **Qué falta (mío):** prueba con sol real después de las 07:00 y segunda prueba de disponibilidad de servicios a las 12:00 (`docs/investigacion/disponibilidad-servicios.md`).
- **Qué falta (de Carlos):** video de 30 s (hoy, antes de las 23:59), pasos de la plataforma con `docs/entrega/PLATAFORMA-LISTA.md` y Submit for Judging (meta 13:00).
- **Qué bloquea:** nada de mi lado. Aviso: dos PR de Luca se abrieron hacia `main` por error; se redirigieron a `dev` (los PR van siempre a `dev`).

## 2026-11-15 tarde

- **Hecho (a `main`, con el "fusiona" de Carlos):** #183 (05:16), #200 (07:38), #202 (07:52), #205 (08:22), #208 (08:46) y #211 (09:09). Línea de tiempo con horas en `docs/cronologia.md`.
- **En `dev`, todavía no en `main`:** #212 (navegación con íconos, Acciones en Clima, Agro con capas), #213 (19 puertos y 20 lugares) y #214 (animación de 2 horas de GOES-West en Inicio).
- **#216 (`dev` a `main`):** abierto a las 10:04; **espera el "fusiona" de Carlos**. No se fusiona sin esa palabra.
- **Incidente:** al fusionar #214 quedaron marcas de conflicto en `docs/entrega/04-project-details.md`; #215 las corrigió a las 10:04 y no llegaron a `main`. Se revisó el repo: no hay otras.
- **Falta:** video de 30 s y pasos de la plataforma (Carlos), Submit for Judging (meta 13:00, límite 23:59), prueba con sol real y la segunda prueba de disponibilidad de servicios (`docs/investigacion/disponibilidad-servicios.md`).
- **Falta (después de enviar):** limpiar el historial de git (decisión del 2026-11-14) y avisar al equipo para clonar de nuevo.
- **Qué bloquea:** nada de mi lado.
