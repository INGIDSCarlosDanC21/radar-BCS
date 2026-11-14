# Handoff — Ciencia

## Hecho

- `docs/investigacion/contexto-local.md`: las 8 cifras del problema tienen fuente leída y cita literal; tres llevan matiz obligatorio.
- `docs/investigacion/metodo.md`: el método responde las 4 preguntas del reto; referencias y decisiones pendientes anotadas.

## En curso

- Issue #5: validación con NASA POWER hecha (reproducción del PR #20, contrastes en `metodo.md`, primeros hallazgos en `hallazgos.md`). Falta repetirla con MODIS y con el pipeline final de Luca.

## Falta

- Leer la fuente primaria del acuífero (acuerdo DOF del 17/08/2023, CONAGUA 0324) para el déficit oficial.
- Localizar el informe de Temperaturas Naturales Extremas de la Secretaría de Salud (fuente primaria de las cifras de calor).
- Título exacto y fecha del estudio de vulnerabilidad de FMCN.
- Abrir en navegador los DOI de Hirsch et al. (1982), Hirsch y Slack (1984) y Sen (1968).
- Tesis de la UABCS sobre islas de calor: no encontrada.
- Fichas de dataset con URL exactas en `docs/investigacion/datasets.md`.
- Actualizar `docs/investigacion/hallazgos.md` con el pipeline final de Luca y agregar MODIS cuando haya datos.

## Bloqueos

- Ninguno. La afirmación "Hirsch-Slack" ya se retiró (PR #21): se dice "Mann-Kendall estacional contrastado con `correlated_seasonal_test`".

## Para otros roles

- **Prog. A (Luca):** (1) en lluvia **no uses la pendiente de Sen estacional**: da 0.0 por los meses sin lluvia; calcula con el total anual (o jun-oct) y reporta solo "sin cambio claro" si no es significativo. (2) Guarda p como "< 0.001" cuando sea casi cero, no 0.0. (3) Acordar α, manejo de huecos, mínimo de datos, zonas y filtro de calidad (lista en `metodo.md`). Detalle en `metodo.md` y `hallazgos.md`.
- **UI/UX y Prog. B (Diego):** las frases de `hallazgos.md` ya están revisadas contra causalidad; son preliminares hasta que salga el pipeline final.
- **UI/UX y Prog. B (Diego):** las cifras de calor son **estatales**, no de La Paz; la de fugas es una **estimación de 2023**; la de 29,825 habitantes no es de calor. No citar el número de manzanas.

---

## 2026-11-14

- Entorno del repo configurado.
- Fuentes del contexto local verificadas; método documentado.
