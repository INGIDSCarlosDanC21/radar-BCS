# Texto de la ficha de Agua (para Carlos)

Cifras de `data/salida/indicadores.json` (indicador `agua`), calculadas por código escrito con IA (Claude) y **sin revisar por Investigación**. Fuente: JPL GRACE y GRACE-FO Mascon CRI RL06.3Mv04, PO.DAAC, DOI [10.5067/TEMSC-3JC634](https://doi.org/10.5067/TEMSC-3JC634), descargada el 2026-11-14.

## Cifras

| Dato | Valor |
|---|---|
| Qué mide | Anomalía del agua total almacenada (suelo, agua subterránea y superficial) respecto a un promedio de referencia, en cm de agua equivalente |
| Periodo | abril de 2002 a septiembre de 2026 (2026 es parcial) |
| Cambio total | +1.36 cm (estimación lineal con la pendiente de Sen; no es una medición) |
| Por década | +0.57 cm |
| Promedio 2002-2011 / 2012-2021 / 2022-2025 | -0.09 / +0.74 / +0.67 cm (2026 no entra al promedio por estar incompleto) |
| Significancia | Mann-Kendall estacional + Sen: significativa (p ≈ 1e-17). Con la prueba que corrige la autocorrelación mensual también lo es (con datos hasta 2025, p = 0.0094) |
| Resolución | Malla de 0.5°, interpolada de mascones de 3°; la señal representa cientos de km |

## Texto sugerido para la web (español)

**Agua: la reserva regional ha aumentado desde 2002.**
El agua total almacenada en la región (suelo, ríos y acuíferos juntos) aumentó unos 1.4 cm de agua equivalente entre 2002 y 2026, y el cambio es estadísticamente significativo.

Importante: el satélite mide cientos de kilómetros a la vez. Este dato describe la región y **no el acuífero de La Paz**, así que no dice cuánta agua hay en los pozos de la ciudad. Muestra qué cambió, no por qué.

*Fuente: NASA GRACE y GRACE-FO (JPL Mascon CRI RL06.3Mv04, PO.DAAC), 2002-2026.*

## English (for the delivery)

**Water: regional water storage has increased since 2002.**
Total water stored in the region (soil, surface water and aquifers combined) rose by about 1.4 cm of water equivalent between 2002 and 2026, a statistically significant change. The satellite sees hundreds of kilometres at once, so this describes the region, not the La Paz aquifer. It shows what changed, not why.

*Source: NASA GRACE and GRACE-FO (JPL Mascon CRI RL06.3Mv04, PO.DAAC), 2002-2026.*

## Qué NO decir

- Que "hay más agua en La Paz" o que "el acuífero se recupera": el dato no lo permite.
- Que la causa sea la lluvia, el clima o cualquier otra: solo se observó que la lluvia anual de NASA POWER y la anomalía de agua van en el mismo sentido (Spearman 0.52, p = 0.018, 20 años). Es una correlación, no una explicación (regla 2 de `AGENTS.md`).
- Que esto contradice las cifras de escasez de `docs/investigacion/contexto-local.md`: son otra escala (acuífero local vs. región) y otra variable.

## Límites a mencionar si preguntan

- Faltan 35 meses entre 2002-04 y 2025-12 (hueco entre GRACE y GRACE-FO, jun 2017 - may 2018, y meses sueltos). Los años con menos de 9 meses quedan sin promedio anual.
- Se usó la versión CRI (mejor para costas); la versión estándar "no corrige la fuga de señal en costas" según su ficha.
- No se hizo el contraste con GLDAS-2.2 CLSM (agua subterránea modelada). Pendiente.
- No se encontró un estudio de GRACE sobre el acuífero de La Paz, así que no se cita ninguno.
