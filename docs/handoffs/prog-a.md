# Handoff — Programador A

## Hecho

- Pipeline de tendencias con NASA POWER (PR #37): `analisis/descargar.py`, `tendencias.py`, `exportar.py`, 9 pruebas.
- `data/salida/indicadores.json` con calor y lluvia reales de La Paz, 2001-2025 (sin revisar por Investigación):
  - Calor (temperatura del aire, T2M): +1.465 °C, significativo (Mann-Kendall estacional + Sen).
  - Lluvia: 0.0 mm/año, no significativa (p = 0.18).
- Vegetación: NDVI MODIS de 6 zonas, −0.019 (significativo). Agua sale `null`.
- Aviso a Carlos: LST MODIS no muestra tendencia en la ciudad (p=0.11), el aire POWER sí; ver `analisis/PLAN.md`.

## En curso

- PR #37 fusionado; PR #38 (lluvia anual) fusionado en `prog-a/tendencias`.
- Tareas MODIS enviadas a AppEEARS (MOD11A2 `processing`, MOD13Q1 `pending`). Estado completo en `analisis/PLAN.md`.

## Falta

- Procesar MODIS cuando terminen las tareas (`python -m analisis.appeears descargar`).
- Agua: GRACE/GLDAS (tendencia regional).
- `zonas.geojson` para el mapa (definir qué es una zona).
- Copiar la salida a `web/data/` (decidir con Diego si es script o PR).
- **Pedido del Líder (2026-11-14):** el contrato de datos quedó acordado; lee el *Anexo de Investigación* de `docs/contrato-datos.md` (reglas para lluvia, `p_valor`, nombre del método y zonas de prueba) y exporta los datos reales a `web/data/`. Meta: las 4 pantallas con datos reales hoy a las 20:00; congelar funciones a las 22:00. Detalle en los issues #7 y #8.

## Bloqueos

- Cola de AppEEARS (sin fecha estimada).

## Para otros roles

- Diego: `docs/contrato-datos.md` v0.1 sigue pendiente de aprobación; la salida ya sigue ese esquema.
- Carlos: el "calor" actual es temperatura del aire (POWER), no de superficie; el issue #7 aún dice "Hirsch-Slack", el método es `seasonal_test`.

Probar: `pip install -r analisis/requirements.txt`, `python -m analisis.exportar`, `python -m pytest analisis`.

---

## 2026-11-14

- Entorno del repo configurado.
