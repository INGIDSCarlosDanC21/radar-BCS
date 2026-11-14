# Plan de estado — Programador A (2026-11-14)

Código generado con IA (Claude); revisar antes de citar cifras.

## Completo
- Pipeline NASA POWER (`descargar.py`, `tendencias.py`, `exportar.py`): MK estacional + Sen, cambio total y por década (PR #37, fusionado).
- Lluvia con total anual y sin cifra cuando no hay cambio claro (PR #38 de Carlos, fusionado en esta rama).
- 10 pruebas pasan (`python -m pytest analisis`), incluida `tendencia_anual()`.
- Salida `data/salida/indicadores.json` según `docs/contrato-datos.md`.
- Credenciales solo en `.env`; caché `data/cache/` fuera de git.
- NASA POWER y uso de IA registrados en `docs/RECURSOS.md`.

## Falla o bloquea
- **MODIS en cola en AppEEARS** (última revisión: MOD11A2 `processing`, MOD13Q1 `pending`). Hasta que terminen, `vegetacion` es `null`.
- **Calor = temperatura del aire (T2M, ~50 km)**, no de superficie (LST). Se sustituye cuando llegue MOD11A2.
- `agua` sin datos (GRACE/GLDAS sin empezar).
- `web/data/zonas.geojson` sigue siendo la cuadrícula sintética (issue #36); no copiar `indicadores.json` a `web/data/` sin resolverlo.
- `p_valor` del calor sale 0.0 (la web muestra "p < 0.001").
- Issue #7 aún dice "Hirsch-Slack" (el método es `seasonal_test`).
- `appeears.py` sin pruebas.

## Mejoras
- Procesar MODIS: LST ×0.02 K→°C y NDVI ×0.0001 (verificar factores en LP DAAC), filtrar por QC/pixel_reliability, promedio mensual, MK estacional + Sen.
- Validar la salida con un esquema JSON; cruzar con `correlated_seasonal_test`.
- Script para copiar la salida a `web/data/` (acordar con Diego).
- Verificar licencia de pytest en RECURSOS (anotada de memoria).
- Registrar MODIS/AppEEARS como "Usado" solo tras descargar.

Probar: `python -m analisis.appeears descargar` y luego `python -m analisis.exportar`.
