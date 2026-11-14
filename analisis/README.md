# analisis

**Dueño:** Diego (Prog. A).
**Propósito:** Descarga, procesamiento y estadística de tendencias (Mann-Kendall estacional con corrección Hirsch-Slack y pendiente de Sen) con datos NASA.

## Prototipo NASA POWER (no es el pipeline final)

`prototipo_power.py` baja la serie mensual de NASA POWER (T2M y PRECTOTCORR, punto 24.14 N, -110.31 O, 2001 a ultimo anio completo),
calcula Mann-Kendall estacional + pendiente de Sen y compara con OLS anual. Sin credenciales. Cache en `data/cache/power/` (no se repite la descarga).

```
uv run --python 3.12 --with requests --with pymannkendall --with numpy analisis/prototipo_power.py
```

Salidas en `data/prototipo/` (ver su README). Valores no revisados por Investigacion; el pipeline final es de Diego (issue #7).
