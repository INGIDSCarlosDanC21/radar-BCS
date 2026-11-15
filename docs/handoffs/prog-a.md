# Handoff — Programador A

## Hecho

- Pipeline de tendencias (PR #37, #38, #52): `analisis/` con NASA POWER, MODIS (AppEEARS, 6 puntos), GRACE y exportación según `docs/contrato-datos.md`; 22 pruebas.
- `data/salida/` (cifras calculadas por código generado con IA, sin revisión de Investigación):
  - Calor = MODIS LST (decisión de Carlos), 2001-2025: sin cambio claro (p = 0.11), por eso sin cifra; el aire POWER sube +1.47 °C y se cita en la limitación.
  - Calor = MODIS LST (aceptado por Carlos, `docs/decisiones.md`), 2001-2025: sin cambio claro (p = 0.11), por eso sin cifra; el aire POWER sube +1.47 °C y se cita en la limitación.
  - Lluvia (total anual, POWER): sin cambio claro (p = 0.13), sin cifra.
  - Agua = GRACE (JPL Mascon CRI), 2002-2026 (2026 parcial): +1.36 cm, regional, significativo; no es el acuífero.
  - `zonas.geojson` real (6 zonas = píxeles MODIS de 1 km) y `zonas_tendencias.json`.
- CSV de AppEEARS (6 zonas) en Drive: `datasets/appeears-6-zonas/`.
- Texto de la ficha de agua listo para Carlos: `analisis/texto-ficha-agua.md`.
- Estado completo y decisiones: `analisis/PLAN.md`.
- `analisis/validar.py` (`python -m analisis.validar`): valida `data/salida/` contra el contrato; 41 pruebas pasan.
- `analisis/REVISION.md`: cómo reproducir cada cifra; comprobadas contra la caché calor 2001, lluvia 2001 y agua en 5 años.
- Calidad MODIS revisada (causa en `analisis/PLAN.md`): LST Oriente/Sur por precisión de emisividad; NDVI Centro parece artefacto de costa. Aceptar 0b10 no cambia la conclusión (NDVI -0.0205, p = 1.9e-6).
## En curso

- PR `prog-a/calor-coherencia` (README y PLAN alineados con Calor) y rama `prog-a/revision-validacion` (validar.py, REVISION.md, notas de calidad).

## Falta

- (Hecho: `web/data/` ya coincide con `data/salida/` desde el PR #57.) Antes: copiar la salida con `analisis.publicar` (los 6 puntos: están en `zonas.geojson`).
- Agua: contraste con GLDAS-2.2 CLSM (GWS); opcional.
- Revisión humana de cifras y código por Luca e Investigación.

## Bloqueos

- Ninguno por mi parte. Necesito a Carlos para fusionar y a Diego para acordar la copia a `web/`.

## Para otros roles

- Carlos: revisar `analisis/texto-ficha-agua.md`; marcar como reemplazada la entrada de Calor "aire y superficie juntos" en `docs/decisiones.md` y alinear `hallazgos.md` y los handoffs `ciencia`/`lider`.
- Diego: alinear `docs/handoffs/prog-b.md` y `prog-b-plan-2026-11-14.md` (siguen diciendo calor = aire +1.47 °C); correr `web/tests` con node.

Probar: `pip install -r analisis/requirements.txt`, `python -m analisis.exportar`, `python -m analisis.zonas`, `python -m pytest analisis`.

---

## 2026-11-14

- Entorno del repo configurado.
