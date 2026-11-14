# data/prototipo

Salidas del prototipo `analisis/prototipo_power.py` (NASA POWER, La Paz). Prototipo; valores no revisados por Investigacion.
`docs/contrato-datos.md` esta vacio, asi que este es un esquema propuesto (no acordado con Prog. B).

- `power_lapaz_series.json`: `series.<VARIABLE>.promedio_anual{anio: valor}` y `unidades`; metadatos `punto`, `fecha_descarga`.
- `power_lapaz_tendencias.json`: lista `tendencias[]` con `variable`, `unidades`, `periodo`, `metodo`, `tendencia_por_anio`,
  `cambio_total_estimado` (estimacion lineal), `p_valor`, `significativo_alfa_0.05` (si/no), `fuente` (URL, consulta, fecha) y `verificacion_cruzada` (OLS).
