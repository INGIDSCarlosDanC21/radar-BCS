# Handoff — Programador A

Actualizado el 2026-11-15 (issues #97 y #81). Rama de este bloque: `prog-a/campos-en`; los PR a `dev` los abre el usuario (mi token no puede).

## Hecho

- Pipeline de tendencias en `analisis/` (NASA POWER, MODIS por AppEEARS en 6 puntos, GRACE) y exportación según `docs/contrato-datos.md`; 56 pruebas. `data/salida/` lo genera código escrito con IA, sin revisión de Investigación.
- Cifras vigentes en `data/salida/` (`python -m analisis.exportar --calor-hasta 2021`):
  - Calor (opción B): aire NASA POWER T2M, 2001-2025, +1.47 °C (p = 2.8e-17). La superficie MODIS (+0.94 °C 2001-2021) queda solo por zona, como orientativa.
  - Vegetación (NDVI): 2001-2026 (2026 parcial), -0.013 (p = 0.0036).
  - Lluvia (POWER, total anual): sin cifra (p = 0.13).
  - Agua (GRACE, regional, no el acuífero): 2002-2026, +1.36 cm (p = 0.0094).
  - `zonas.geojson` y `zonas_tendencias.json` reales (6 zonas = píxeles MODIS).
- Campos `*_en` en `data/salida/` (título, variable, nota del cambio, limitación, método, dataset y resolución de la fuente; `nombre_en` y `nota_en` por zona). Mismas cifras que el español; `analisis.validar` los exige. `variable_en` hace de descripción. Los nombres de zona no se traducen.
- `scripts/verificar-todo.ps1`: pytest, validar, `node --test` (web y diseño), `web/data` = `data/salida` (3 archivos) y archivos de menos de 5 MB. `analisis.publicar` copia también `zonas_tendencias.json`.
- Revisiones de #81: Spearman lluvia-agua con código y prueba (`python -m analisis.correlacion`, rho = 0.52, p = 0.018, n = 20; correlación, no causa); `PLAN.md` y `REVISION.md` al día.
- Deriva de Terra: Day_view_time pasa de ≈10.8 h a 9.17 h en 2026. Contraste con Aqua (`python -m analisis.contraste_aqua`): 2003-2021 Terra +1.04 °C (p = 0.0005), Aqua +0.27 °C (p = 0.29, no significativo). Aqua también cambia su hora desde 2022 (13.4 h a 15.2 h en 2026, más tarde). Aqua no confirma el calentamiento de superficie 2001-2021 y la deriva de Terra no basta como explicación. No se afirma ninguna causa.

## Auditorías hechas (comentarios que pega el usuario, mi token no puede)

- Mapa Agrícola (#88): NO PASA todavía. Ficha Clima con cifras viejas y leyenda "2001–2025". Verificados POWER y la tabla del DOF; sin verificar SIAP, SoilGrids, Monitor de Sequía, GeoNames.
- Login (#77): sin claves secretas, pero `generar-config.ps1` y su prueba no detectan una clave `service_role` en formato JWT; falta la pantalla para fijar la contraseña nueva; textos "Costero" y "Todos los derechos reservados" por corregir; falta configurar Supabase.

## Clima: datos y reglas (2026-11-15, rama `prog-a/clima-datos`)

Parte de Luca de `docs/PLAN-CLIMA.md`. PR a `dev` (lo abre el usuario). Solo agrega; Pesca y Avisos no cambian.

- `web/js/datos-vivos.js`: `urlClima()`, series `temp, sens, hum, plluvia, lluvia, rad` y `dias` por puerto, y `cdir` (dirección de la corriente) en la petición marina. **Diego:** las series de clima solo vienen con `RBVivo.cargar({clima:true})` (3 peticiones y caché propia); sin esa opción no existen y `dias` es `[]`.
- `web/js/reglas-clima.js` (`RBReglasClima`): `resumenPuerto`, `curva24`, `nivelUV` (OMS), `proteccionUV`, `nivelCalor` (siempre `null`), `horasDeSol`, `textoUV`, `textoProteccion`; textos ES/EN con prefijo `clm.`.
- `web/tests/clima.test.mjs` (9 pruebas) y fixture real `web/tests/fixtures/clima-2026-11-15.json` (respuesta cruda de Open-Meteo, 144 KB, bajada el 2026-11-15 04:20); las cifras se comparan contra ella.
- `docs/investigacion/umbrales-clima.md` y conteo de llamadas en `disponibilidad-servicios.md` (33.6 llamadas por visita a Clima en el cálculo conservador).
- Detalles para la pantalla: `viento.corriente` viene en km/h (unidad por defecto de Open-Meteo, sin verificar aquí) y `cdir` no significa nada cuando la corriente es 0; `uv.nivel` es el del máximo del día (`uv.ahora` es de la hora); `prob24` y `mm24` son de las próximas 24 h (hora+1 a hora+24).
- Falta: Carlos decide si hace falta etiqueta de calor (hoy solo el número); confirmar los nombres de las 5 categorías UV en la guía impresa de la OMS.

## Bloque autónomo #118 (2026-11-15)

Ramas subidas, sin PR abierto (mi token no abre PR; los abre el usuario, a `dev`). Orden de fusión: 1, luego 2 a 5.

1. `prog-a/calor-aire` (L1, P0, cifras: revisa el Líder): el calor sale de POWER T2M, +1.47 °C 2001-2025 (p = 2.8e-17, por década +0.611); `validar` exige T2M, periodo desde 2001 y a Aqua en la limitación. Con esta rama, `web/tests` falla 2 pruebas de Diego: `agricola.test.mjs` (el resumen de Clima sigue en +0.94 °C) y `home.test.mjs` (fija «Datos generados el 2026-11-14»).
2. `prog-a/auditoria-agricola` (L2): `docs/investigacion/auditoria-agricola.md`. Veredicto NO PASA todavía: 3 correcciones para Diego (#119) y SIAP y SEPADA sin comprobar (servidores sin respuesta).
3. `prog-a/cifras-entrega` (L3): `test_cifras_entrega.py`; pasa con L1 (las cifras de `docs/entrega/04` y `08` coinciden con `data/salida`). Sin L1, falla contra la superficie vieja.
4. `prog-a/reproducir-aqua` (L4): sección del README. El CSV de Aqua (1.7 MB) está solo en mi caché local; alguien debe subirlo a Drive `datasets/appeears-6-zonas/` y anotarlo en `docs/DRIVE.md`.
5. `prog-a/pruebas-appeears`: 6 pruebas sin red para `appeears.py`.

L5: los PR abiertos de Diego (#116, #121, #122) y de UI/UX (#123, #124) no tocan cifras ni datos; no hay nada que revisar por esa regla. No aprobé #85: la puerta falla 2 pruebas de web con L1 y el Mapa Agrícola no pasa.

## Falta

- Carlos: revisar la `limitacion` nueva del calor y que `docs/entrega/04` y `hallazgos.md` digan lo mismo.
- Diego: copiar `data/salida/` a `web/data/` (`python -m analisis.publicar`), cambiar `CAPA_ZONA.calor.sinCifra` de `web/js/app.js`, usar los `*_en` para ES/EN, regenerar `agricola.json` con cifras vigentes y corregir lo del login.
- Auditar SIAP del #88 (necesita descargar el CSV); repetir la auditoría cuando Diego corrija.
- Opcional: GLDAS-2.2 CLSM como contraste del agua; pruebas para `analisis/appeears.py`; Carlos revisa `analisis/texto-ficha-agua.md` y define el canal de borrado de cuentas.

## Bloqueos

- Ninguno. Mi token no puede abrir PRs ni comentar: los abre el usuario desde la web.

Probar: `pip install -r analisis/requirements.txt`, `python -m analisis.exportar --calor-hasta 2021`, `python -m analisis.zonas --calor-hasta 2021`, `python -m analisis.validar`, `python -m pytest analisis`, `powershell -File scripts/verificar-todo.ps1`.

---

## 2026-11-14

- Entorno del repo configurado.
