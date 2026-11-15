# Plan de estado — Programador A (2026-11-14)

Código generado con IA (Claude); revisar antes de citar cifras.

## Completo
- MODIS por zona (`modis.py`, 13 pruebas): `vegetacion` (NDVI ciudad −0.019 en 24 años, significativo) y `data/salida/zonas_tendencias.json`.
- Pipeline NASA POWER (`descargar.py`, `tendencias.py`, `exportar.py`): MK estacional + Sen, cambio total y por década (PR #37, fusionado).
- Lluvia con total anual y sin cifra cuando no hay cambio claro (PR #38 de Carlos, fusionado en esta rama).
- 10 pruebas pasan (`python -m pytest analisis`), incluida `tendencia_anual()`.
- Salida `data/salida/indicadores.json` según `docs/contrato-datos.md`.
- Credenciales solo en `.env`; caché `data/cache/` fuera de git.
- NASA POWER y uso de IA registrados en `docs/RECURSOS.md`.

## Falla o bloquea
- **Tarea MOD13Q1 de AppEEARS** sigue descargando (~26%); no hace falta para los resultados porque se usan los CSV de 6 zonas de Luca (`data/cache/appeears/usuario/`). MOD11A2 de la tarea del pipeline ya bajó.
- **Calor: POWER (aire) y MODIS (superficie) no coinciden.** Aire +1.465 °C (significativo); LST MODIS ciudad −0.02 °C/año, p = 0.11 (no significativa). Solo El Centenario y Sur bajan significativamente. Falta que Investigación decida qué se muestra; hoy `calor` = aire y la limitación lo dice.
- LST: Oriente y Sur solo tienen calidad MODLAND 0b01 (no 0b00); NDVI de Centro pierde 167 meses al filtrar.
- `web/data/zonas.geojson` sigue siendo la cuadrícula sintética (issue #36); no copiar `indicadores.json` a `web/data/` sin resolverlo.
- `p_valor` del calor sale 0.0 (la web muestra "p < 0.001").
- Issue #7 aún dice "Hirsch-Slack" (el método es `seasonal_test`).
- `appeears.py` sin pruebas.

## Mejoras
- (Hecho en `analisis/modis.py`) Procesar MODIS: LST ×0.02 K→°C y NDVI ×0.0001 (verificar factores en LP DAAC), filtrar por QC/pixel_reliability, promedio mensual, MK estacional + Sen.
- Validar la salida con un esquema JSON; cruzar con `correlated_seasonal_test`.
- Script para copiar la salida a `web/data/` (acordar con Diego).
- Verificar licencia de pytest en RECURSOS (anotada de memoria).
- Registrar MODIS/AppEEARS como "Usado" solo tras descargar.

Probar: `python -m analisis.appeears descargar` y luego `python -m analisis.exportar`.

## Verificación cruzada con el punto de la tarea del pipeline (24.14 N, -110.31 O)
Es otro píxel que los de las 6 zonas, así que no se compara valor por valor; solo la señal. Informativo, no entra a `indicadores.json`.
- LST: -0.030 °C/año, -0.72 °C en 2001-2025, p = 0.0235, significativa (1142 lecturas válidas).
- NDVI: -0.0009/año, -0.023 en total, p = 0.00017, significativa, pero solo 188 de 576 lecturas pasan el filtro (150 meses sin dato): poco fiable.
- Conclusión: el signo coincide con las zonas (la temperatura de superficie MODIS no sube y el NDVI baja); sigue sin coincidir con el aire de POWER.

## Pendientes 1-7 (actualización)
1. **PR a `dev`**: abierto (PR #52). Su título quedó con el texto del último commit; conviene cambiarlo desde la web.
2. **Calor, decisión de Carlos/Investigación** (no la toma el código). Cifras, todas con Mann-Kendall estacional + Sen, 2001-2025:

   | Serie | Pendiente | Significativa |
   |---|---|---|
   | Aire, NASA POWER T2M (~50 km) | +0.061 °C/año (+1.465 °C) | sí, p = 5e-5 (prueba correlacionada también) |
   | Superficie, MODIS LST, promedio de 6 zonas | -0.020 °C/año | no, p = 0.11 (correlacionada: p = 0.38) |
   | Superficie, MODIS LST, solo El Centenario / Sur | -0.054 / -0.053 °C/año | sí |

   Opciones: (a) mostrar el aire de POWER como hoy, con la limitación visible; (b) mostrar MODIS (el contrato original pedía LST) y "sin cambio claro"; (c) mostrar ambos y explicar que miden cosas distintas (aire vs. superficie). Recomendación del código: (c). No se explica la causa del desacuerdo.
3. **`zonas.geojson`**: generado en `data/salida/zonas.geojson` (`python -m analisis.zonas`). Zona = píxel MODIS de 1 km donde se midió (6 zonas); `calor` y `vegetacion` reales, `lluvia` y `agua` en `null`, `datos_de_prueba: false`. Los polígonos salen de la rejilla sinusoidal de MODIS y su centro cae a menos de 0.65 km del punto pedido. No se ha copiado a `web/`.
4. **Copia a `web/data/`**: `analisis/publicar.py`, **sin ejecutar** (la carpeta es de Diego). Falta acordar con Diego que se hará en un PR aparte; `web/data/zonas.geojson` sigue siendo el sintético hasta entonces.
5. **Agua**: resuelto después con GRACE (sección "Agua" abajo). Antes: no se pudo avanzar. GLDAS y GRACE no están en el catálogo de AppEEARS (revisado el 2026-11-14: solo hay SMAP, 2015 en adelante, que no sirve para una tendencia desde 2001). Requiere otra vía (GES DISC / PO.DAAC), el producto y el DOI siguen **POR CONFIRMAR** en `docs/investigacion/datasets.md`, y GRACE solo da agua regional. `agua` sigue en `null`.
6. **Calidad**:
   - LST Oriente y Sur: todas las lecturas son "LST producida, otra calidad, revisar QA" (MODLAND 0b01); el indicador de calidad de datos es "bueno" y el error de LST es ≤ 2 K en la mayoría. El filtro las conserva; no es evidencia de datos malos.
   - NDVI: la máscara de tierra/agua marca "costa o lago" en 568 de 576 fechas de Centro (y casi todas en Surponiente, El Centenario y Chametla). En Centro 405 de 576 fechas salen "probablemente nublado". Es compatible con un píxel costero que mezcla agua; no se confirmó. Las zonas Oriente y Sur son mayormente tierra.
7. **Mejoras**: contraste con `correlated_seasonal_test` hecho (misma señal en las tres series, ver tabla); pruebas nuevas para `zonas.py` y `appeears.py` (17 en total); licencia de pytest verificada en PyPI (MIT, 9.2.0). Sin hacer: validación con un esquema JSON formal.

## Agua (GRACE) — hecho el 2026-11-14
- Fuente: JPL GRACE/GRACE-FO Mascon **CRI** RL06.3Mv04 (PO.DAAC, DOI 10.5067/TEMSC-3JC634), un archivo netCDF de 46 MB (en `data/cache/grace/`, no se sube). Celda más cercana a La Paz: 24.25 N, -110.25 O (malla 0.5°).
- Resultado (anomalía de agua total almacenada, 2002-2025): **+0.053 cm/año, +1.213 cm en total**, significativa. Contraste: prueba con autocorrelación p = 0.0094 y Mann-Kendall sobre el total anual p = 0.0017; las tres coinciden en signo y significancia. El p = 3e-15 del MK estacional simple es demasiado optimista por la autocorrelación mensual.
- Faltan 35 meses entre 2002-04 y 2025-12 (hueco GRACE → GRACE-FO y algunos meses sueltos); los años con menos de 9 meses (2002, 2015, 2017, 2018) quedan en `null`.
- **Lectura prudente:** el agua total regional *sube* (decenios: -0.09, +0.74, +0.67 cm). No es agua subterránea de La Paz ni dice nada del acuífero; puede reflejar años más lluviosos, y no se explica la causa. Esto choca con el mensaje "se pierde agua": Carlos debe decidir cómo presentarlo.
- **Sin hacer:** contraste con GLDAS-2.2 CLSM (`GWS_tavg`, agua subterránea modelada, desde 2003): requiere GES DISC o Google Earth Engine. Sigue como mejora.
- `zonas.geojson` mantiene `agua: null` (la señal es regional).
