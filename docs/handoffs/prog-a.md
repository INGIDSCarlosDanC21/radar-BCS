# Handoff — Programador A

## Hecho

- Pipeline de tendencias con NASA POWER (PR #37): `analisis/descargar.py`, `tendencias.py`, `exportar.py`, 9 pruebas.
- `data/salida/indicadores.json` con calor y lluvia reales de La Paz, 2001-2025 (sin revisar por Investigación):
  - Calor (temperatura del aire, T2M): +1.465 °C, significativo (Mann-Kendall estacional + Sen).
  - Lluvia: 0.0 mm/año, no significativa (p = 0.18).
- Vegetación y agua salen como `null` (pendientes).

## En curso

- Esperando revisión del PR #37 y aprobación del contrato v0.1.

## Falta

- Cuenta de NASA Earthdata para MODIS MOD11A2 (temperatura de superficie) y MOD13Q1 (NDVI).
- Agua: GRACE/GLDAS (tendencia regional).
- `zonas.geojson` para el mapa (definir qué es una zona).
- Copiar la salida a `web/data/` (decidir con Diego si es script o PR).
- Registrar NASA POWER y la declaración de IA en `docs/RECURSOS.md`.

## Bloqueos

- Earthdata: la cuenta la crea el humano; sin ella MODIS no se descarga.

## Para otros roles

- Diego: `docs/contrato-datos.md` v0.1 sigue pendiente de aprobación; la salida ya sigue ese esquema.
- Carlos: el "calor" actual es temperatura del aire (POWER), no de superficie; el issue #7 aún dice "Hirsch-Slack", el método es `seasonal_test`.

Probar: `pip install -r analisis/requirements.txt`, `python -m analisis.exportar`, `python -m pytest analisis`.

---

## 2026-11-14

- Entorno del repo configurado.
