# Handoff — Programador A

## Hecho

- Pipeline de tendencias (PR #37, #38, #52, #63, #70): `analisis/` con NASA POWER, MODIS (AppEEARS, 6 puntos), GRACE y exportación según `docs/contrato-datos.md`; 47 pruebas.
- `data/salida/` (cifras calculadas por código generado con IA, sin revisión de Investigación):
  - Calor = MODIS LST (aceptado por Carlos, `docs/decisiones.md`), 2001-2025: sin cambio claro (p = 0.11), sin cifra; el aire POWER sube +1.47 °C y se cita en la limitación.
  - Lluvia (total anual, POWER): sin cambio claro (p = 0.13), sin cifra.
  - Agua = GRACE (JPL Mascon CRI), 2002-2026 (2026 parcial): +1.36 cm, regional, significativo; no es el acuífero.
  - `zonas.geojson` real (6 zonas = píxeles MODIS de 1 km) y `zonas_tendencias.json`. `web/data/` coincide con `data/salida/` en `dev`.
- `python -m analisis.validar` valida `data/salida/` contra el contrato; `analisis/REVISION.md` dice cómo reproducir cada cifra.
- Calidad MODIS revisada (causa en `analisis/PLAN.md`): LST Oriente/Sur por precisión de emisividad; NDVI Centro parece artefacto de costa. Aceptar 0b10 no cambia la conclusión.
- Spearman lluvia vs agua: `python -m analisis.correlacion` (rho = 0.52, p = 0.018, n = 20, 2003-2025), con pruebas. Es correlación, no causa.
- Texto de la ficha de agua: `analisis/texto-ficha-agua.md`. CSV de AppEEARS en Drive: `datasets/appeears-6-zonas/`.

## En curso

- Rama `prog-a/extender-2026`: código de 2026 y vegetación 2001-2026 (parcial: -0.013, p = 0.0036). Calor queda en 2001-2025 (`python -m analisis.exportar --calor-hasta 2025`).
- Con 2026, calor sale -1.06 °C significativo y baja pareja en las 6 zonas desde 2022: sospechoso (deriva del paso de Terra). Se pidió a AppEEARS la hora de observación (`python -m analisis.appeears enviarhora`, luego `descargar`); falta compararla por año. No se cita como causa hasta comprobarlo.

## Falta

- Hora de paso de Terra (o MYD11A2 de Aqua) y resultado para `docs/investigacion/hallazgos.md` (de Carlos).
- Avisar a Diego de los cambios en `web/data/` (vegetación a 2026, etiquetas de década) y regenerar la copia en un PR suyo.
- Agua: contraste con GLDAS-2.2 CLSM; opcional.
- Revisión humana de cifras y código por Luca e Investigación.

## Bloqueos

- Ninguno por mi parte. Mi token no puede abrir PRs ni comentar; los abre el usuario desde la web.

## Para otros roles

- Carlos: revisar `analisis/texto-ficha-agua.md`; el Spearman ya tiene código. Calor ahora es 2001-2021, +0.94 °C (p = 0.0003) por la deriva de Terra: alinear `docs/investigacion/hallazgos.md` y `docs/decisiones.md`.
- Diego: copiar `data/salida/` a `web/data/` (calor con cifra; vegetación y agua a 2026; etiquetas de década nuevas) y cambiar el texto `CAPA_ZONA.calor.sinCifra` de `web/js/app.js`, que ya no aplica.
- Diego: correr `web/tests` con node; ver los hallazgos de seguridad del login (#77).

Probar: `pip install -r analisis/requirements.txt`, `python -m analisis.exportar`, `python -m analisis.zonas`, `python -m analisis.validar`, `python -m pytest analisis`.

---

## 2026-11-14

- Entorno del repo configurado.
