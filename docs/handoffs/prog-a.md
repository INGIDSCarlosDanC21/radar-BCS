# Handoff — Programador A

Actualizado el 2026-11-15 (issues #97 y #81). Rama de este bloque: `prog-a/pruebas-appeears`; los PR a `dev` los abre el usuario (mi token no puede). Fusionados en `dev`: #103, #109, #113. #108 se cierra sin fusionar (lo reemplazó #109).

## Hecho

- Pipeline de tendencias en `analisis/` (NASA POWER, MODIS por AppEEARS en 6 puntos, GRACE) y exportación según `docs/contrato-datos.md`; 62 pruebas (6 nuevas de `appeears.py`, sin red). `data/salida/` lo genera código escrito con IA, sin revisión de Investigación.
- Cifras vigentes en `data/salida/` (`python -m analisis.exportar --calor-hasta 2021`):
  - Calor (MODIS LST): 2001-2021, +0.94 °C (p = 0.0003). El periodo se corta antes de la deriva de Terra (decisión de Carlos, `docs/decisiones.md`).
  - Vegetación (NDVI): 2001-2026 (2026 parcial), -0.013 (p = 0.0036).
  - Lluvia (POWER, total anual): sin cifra (p = 0.13).
  - Agua (GRACE, regional, no el acuífero): 2002-2026, +1.36 cm (p = 0.0094).
  - `zonas.geojson` y `zonas_tendencias.json` reales (6 zonas = píxeles MODIS).
- Campos `*_en` en `data/salida/` (título, variable, nota del cambio, limitación, método, dataset y resolución de la fuente; `nombre_en` y `nota_en` por zona). Mismas cifras que el español; `analisis.validar` los exige. `variable_en` hace de descripción. Los nombres de zona no se traducen.
- `scripts/verificar-todo.ps1` (acepta una sola prueba por carpeta, #113; pasa completo con Node): pytest, validar, `node --test` (web y diseño), `web/data` = `data/salida` (3 archivos) y archivos de menos de 5 MB. `analisis.publicar` copia también `zonas_tendencias.json`.
- Revisiones de #81: Spearman lluvia-agua con código y prueba (`python -m analisis.correlacion`, rho = 0.52, p = 0.018, n = 20; correlación, no causa); `PLAN.md` y `REVISION.md` al día.
- Deriva de Terra: Day_view_time pasa de ≈10.8 h a 9.17 h en 2026. Contraste con Aqua (`python -m analisis.contraste_aqua`): 2003-2021 Terra +1.04 °C (p = 0.0005), Aqua +0.27 °C (p = 0.29, no significativo). Aqua también cambia su hora desde 2022 (13.4 h a 15.2 h en 2026, más tarde). Aqua no confirma el calentamiento de superficie 2001-2021 y la deriva de Terra no basta como explicación. No se afirma ninguna causa.

## Auditorías hechas (comentarios que pega el usuario, mi token no puede)

- Mapa Agrícola (#88): NO PASA todavía. Ficha Clima con cifras viejas y leyenda "2001–2025". Verificados POWER y la tabla del DOF; sin verificar SIAP, SoilGrids, Monitor de Sequía, GeoNames.
- Login (#77): sin claves secretas, pero `generar-config.ps1` y su prueba no detectan una clave `service_role` en formato JWT; falta la pantalla para fijar la contraseña nueva; textos "Costero" y "Todos los derechos reservados" por corregir; falta configurar Supabase.

## Falta

- Carlos: decidir si el calor se publica con cifra tras el contraste con Aqua y corregir la `limitacion` (hoy atribuye la caída a la deriva); actualizar `docs/investigacion/hallazgos.md` (suyo) con este resultado.
- Diego: copiar `data/salida/` a `web/data/` (`python -m analisis.publicar`), cambiar `CAPA_ZONA.calor.sinCifra` de `web/js/app.js`, usar los `*_en` para ES/EN, regenerar `agricola.json` con cifras vigentes y corregir lo del login.
- Auditar SIAP del #88 (necesita descargar el CSV); repetir la auditoría cuando Diego corrija.
- Opcional: GLDAS-2.2 CLSM como contraste del agua; Carlos revisa `analisis/texto-ficha-agua.md` y define el canal de borrado de cuentas.

## Bloqueos

- Ninguno. Mi token no puede abrir PRs ni comentar: los abre el usuario desde la web.

Probar: `pip install -r analisis/requirements.txt`, `python -m analisis.exportar --calor-hasta 2021`, `python -m analisis.zonas --calor-hasta 2021`, `python -m analisis.validar`, `python -m pytest analisis`, `powershell -File scripts/verificar-todo.ps1`.

---

## 2026-11-14

- Entorno del repo configurado.
