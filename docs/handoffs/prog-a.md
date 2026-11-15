# Handoff — Programador A

## Hecho

- Pipeline de tendencias (PR #37, #38, #52): `analisis/` con NASA POWER, MODIS (AppEEARS, 6 puntos), GRACE y exportación según `docs/contrato-datos.md`; 22 pruebas.
- `data/salida/` (cifras calculadas por código generado con IA, sin revisión de Investigación):
  - Calor = MODIS LST (decisión de Carlos), 2001-2025: sin cambio claro (p = 0.11), por eso sin cifra; el aire POWER sube +1.47 °C y se cita en la limitación.
  - Vegetación = NDVI MODIS: -0.019, significativo.
  - Lluvia (total anual, POWER): sin cambio claro (p = 0.13), sin cifra.
  - Agua = GRACE (JPL Mascon CRI), 2002-2026 (2026 parcial): +1.36 cm, regional, significativo; no es el acuífero.
  - `zonas.geojson` real (6 zonas = píxeles MODIS de 1 km) y `zonas_tendencias.json`.
- CSV de AppEEARS (6 zonas) en Drive: `datasets/appeears-6-zonas/`.
- Texto de la ficha de agua listo para Carlos: `analisis/texto-ficha-agua.md`.
- Estado completo y decisiones: `analisis/PLAN.md`.

## En curso

- PR con los últimos cambios (calor MODIS, agua hasta 2026, p-valor real, texto de la ficha de agua).

## Falta

- Extensión a 2026 (rama `prog-a/extender-2026`): vegetación sale a 2001-2026 (parcial; -0.013, p = 0.0036). Calor queda en 2001-2025 (`python -m analisis.exportar --calor-hasta 2025`) hasta revisar la deriva de Terra con la hora de paso (`python -m analisis.appeears enviarhora`): con 2026 sale -1.06 °C significativo y baja pareja en las 6 zonas desde 2022, sospechoso.

- Copiar la salida a `web/data/` con `python -m analisis.publicar`, en un PR acordado con Diego (su PR #57 de mapa pide las coordenadas de los 6 puntos: están en `zonas.geojson`).
- Agua: contraste con GLDAS-2.2 CLSM (GWS); opcional.
- Revisión humana de cifras y código por Luca e Investigación.

## Bloqueos

- Ninguno por mi parte. Necesito a Carlos para fusionar y a Diego para acordar la copia a `web/`.

## Para otros roles

- Carlos: revisar `analisis/texto-ficha-agua.md`; comentar y cerrar el issue #7 (todo lo pedido está hecho).
- Diego: `data/salida/zonas.geojson` y `indicadores.json` actualizados; falta copiarlos a `web/data/`.

Probar: `pip install -r analisis/requirements.txt`, `python -m analisis.exportar`, `python -m analisis.zonas`, `python -m pytest analisis`.

---

## 2026-11-14

- Entorno del repo configurado.
