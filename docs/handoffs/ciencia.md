# Handoff — Ciencia

## Hecho

- `docs/investigacion/contexto-local.md`: las 8 cifras del problema tienen fuente leída y cita literal; tres llevan matiz obligatorio.
- `docs/investigacion/metodo.md`: el método responde las 4 preguntas del reto; referencias y decisiones pendientes anotadas.

## En curso

- Issue #5: validación con NASA POWER hecha y MODIS reproducido con los CSV de Drive y revisado en `hallazgos.md`. Fuentes del contexto local ya verificadas (el acuífero con la fuente oficial del DOF).

## Falta

- Revisar por qué la temperatura de superficie baja en El Centenario y Sur (ver `hallazgos.md`).
- Agua subterránea (GRACE/GLDAS): no empezada; si no se hace, declararlo y poner "No usado".
- (Hecho, PR #57/#65) La web muestra la superficie MODIS como número de Calor y el aire (+1.47 °C) en la nota; ver `docs/decisiones.md`.
- Abrir en navegador los DOI de Hirsch et al. y Sen (ya verificados contra Crossref, no leídos).

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
