# Handoff — Ciencia

## Hecho

- `docs/investigacion/contexto-local.md`: las 8 cifras del problema tienen fuente leída y cita literal; tres llevan matiz obligatorio.
- `docs/investigacion/metodo.md`: el método responde las 4 preguntas del reto; referencias y decisiones pendientes anotadas.

## En curso

- Nada.

## Falta

- Leer la fuente primaria del acuífero (acuerdo DOF del 17/08/2023, CONAGUA 0324) para el déficit oficial.
- Localizar el informe de Temperaturas Naturales Extremas de la Secretaría de Salud (fuente primaria de las cifras de calor).
- Título exacto y fecha del estudio de vulnerabilidad de FMCN.
- Abrir en navegador los DOI de Hirsch et al. (1982), Hirsch y Slack (1984) y Sen (1968).
- Tesis de la UABCS sobre islas de calor: no encontrada.
- Fichas de dataset con URL exactas en `docs/investigacion/datasets.md`.
- `docs/investigacion/hallazgos.md` cuando Prog. A entregue resultados.

## Bloqueos

- Para afirmar "corrección de Hirsch-Slack" hay que confirmar qué calcula `pymannkendall.correlated_seasonal_test` (su README cita a Hipel y McLeod, 1994). Ver `docs/investigacion/metodo.md`.

## Para otros roles

- **Prog. A (Diego):** acordar α, manejo de huecos, mínimo de datos, zonas y filtro de calidad (lista en `metodo.md`); revisar juntos `correlated_seasonal_test`.
- **UI/UX y Prog. B:** las cifras de calor son **estatales**, no de La Paz; la de fugas es una **estimación de 2023**; la de 29,825 habitantes no es de calor. No citar el número de manzanas.

---

## 2026-11-14

- Entorno del repo configurado.
- Fuentes del contexto local verificadas; método documentado.
