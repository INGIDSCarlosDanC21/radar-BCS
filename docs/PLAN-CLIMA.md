# Plan: Clima, lo que falta (domingo 15 de noviembre)

Origen: documento "Plan de acción" de Nevid/Ehileen y el Figma `diseno/pantallas/clima-*.png`. Pide la vista de Clima con el **buscador arriba**, el mapa y **4 tarjetas** (*Calor y sensación térmica*, *Radiación UV y exposición solar*, *Viento, oleaje y corrientes*, *Humedad y lluvia*), con Agro como referencia. Decisión de Carlos (2026-11-15): entra, **solo con datos reales** y con **corte a las 09:30**; si no está verde, se envía sin lo que falte.

## 0. Qué ya está (actualizado a las 04:50)

El PR #164 de Ehileen (en `dev`) hizo **la pestaña Mapa como el frame "Clima - Mapa"**: título "Mapa Meteorológico", mapa con las 7 localidades de Inicio e íconos del cielo, y **"Diagnóstico Climático Territorial" con las 4 tarjetas** con datos reales de hoy en La Paz (máxima y sensación térmica, UV máximo y categoría OMS, viento y ráfagas, probabilidad de lluvia y humedad). Sus archivos: `web/js/clima-mapa.js`, `web/css/clima-mapa.css`, `web/tests/clima-mapa.test.mjs` y variables diarias nuevas en `cielo.js`. **No hay pestaña "Clima" nueva ni ruta `#clima`**: Clima es la pestaña Mapa. Hoy cada tarjeta lleva a otra pantalla (Acciones, Avisos, Pesca); el documento pide que **abra su detalle debajo, como en Agro**.

## 1. Qué falta

1. **Buscador y chips de capa arriba del mapa** (como en el Figma): "Buscar ubicación en BCS…" filtra las 7 localidades; chips *General, Calor, Viento, UV, Humedad* cambian lo que dice cada pin.
2. **Detalle de cada tarjeta, debajo, al tocarla** (patrón de las fichas del Agro): cifras clave del lugar elegido, **curva de 24 horas** y consejos. El enlace actual de cada tarjeta ("Ver consejos contra el calor →", etc.) queda como enlace secundario dentro del detalle.
3. **Bugs** del documento: la línea dice solo "hu?"; falta que Nevid/Ehileen la aclare en el issue #166.

## 2. Reparto

| Quién | Entrega | Rama | Archivos |
|---|---|---|---|
| Luca | Datos y reglas (primero, en 90 min) | `prog-a/clima-datos` | `web/js/clima-datos.js` (nuevo), `web/js/reglas-clima.js` (nuevo), `web/tests/clima.test.mjs`, `web/tests/fixtures/clima-2026-11-15.json`, `docs/investigacion/umbrales-clima.md` |
| Diego | Buscador, chips y detalle | `prog-b/clima-detalle` | `web/js/clima-detalle.js` (nuevo), `web/css/clima-detalle.css` (nuevo), y cambios chicos en `clima-mapa.js`, `app.js`, `index.html` |
| Asistente del Líder | Revisión, fusión a `dev`, docs | `lider/*` | `docs/` |

Ehileen duerme: `clima-mapa.js` y `cielo.js` son suyos, pero hoy no hay PR abierto suyo sobre ellos; Diego los edita en pequeño y deja anotado en el PR para que ella lo vea. PR a `dev` (nunca a `main`), sin `push --force`, se fusionan de a uno con puerta de calidad.

## 3. Datos (Luca)

**No se tocan `cielo.js` ni `datos-vivos.js`** (Inicio, Pesca y Avisos no se rompen). Nuevo `clima-datos.js`, con el mismo estilo (ES5, caché de 10 minutos en `sessionStorage`, sin inventar: lo que falta queda `null` → "sin dato"):

- **Una llamada** de Open-Meteo Forecast para las **7 localidades de `RBCielo.LUGARES`** (las mismas de los pines), con ayer, hoy y 2 días: por hora `temperature_2m, apparent_temperature, relative_humidity_2m, precipitation_probability, precipitation, uv_index, wind_speed_10m, wind_gusts_10m, wind_direction_10m, shortwave_radiation`; por día `temperature_2m_max/min, uv_index_max, sunrise, sunset, sunshine_duration`.
- **Marino bajo demanda:** solo al abrir el detalle de *Viento, oleaje y corrientes*, se usa `RBVivo.cargar()` (ya existe) y se asocia cada localidad con su puerto: La Paz→`lapaz`, Los Cabos→`cabos`, Loreto→`loreto`, Mulegé→`mulege`, Gmo. Negro→`guerreronegro`, Bahía Magd.→`bahiamagdalena`; **Comondú no tiene punto de mar** (muestra viento y "oleaje: sin dato").
- **Límite de Open-Meteo:** antes de subir el PR, leer la regla de conteo en <https://open-meteo.com/en/pricing> (las peticiones con muchas variables o ubicaciones pueden contar más de una) y anotar el cálculo en `docs/investigacion/disponibilidad-servicios.md`. Si sube mucho, pedir menos variables o solo La Paz hasta que el usuario elija otra localidad.

`reglas-clima.js` exporta `RBReglasClima` (mismo estilo que `reglas-mar.js`; textos ES/EN dentro del archivo con prefijo `clm.`):
- `resumen(datos, k, ahora)` → `{ calor:{temp, sens, max, min}, uv:{ahora, max, nivel, amanecer, anochecer, solH}, viento:{kt, rachas, rumbo, beaufort}, lluvia:{hum, prob24, mm24, codigo} }`.
- `curva24(datos, k, serie, ahora)` → 25 valores (12 horas antes y 12 después) para dibujar.
- `nivelUV(uv)` con la **escala de la OMS** (0-2 bajo, 3-5 moderado, 6-7 alto, 8-10 muy alto, 11+ extremo): coincide con la categoría que ya muestra #164.
- `nivelCalor(sens)` → **`null` hasta que Luca confirme la fuente primaria** en `docs/investigacion/umbrales-clima.md`. Sin fuente no hay etiqueta, solo el número ("sensación térmica del modelo").
- Contrastar también Douglas y Beaufort de `reglas-mar.js` con su fuente primaria (pendiente de Pesca).

## 4. Pantalla (Diego)

1. Buscador arriba y chips de capa (§1.1), con teclado y `aria-live` para el resultado.
2. Al tocar una tarjeta se abre debajo su detalle (uno a la vez, con "Cerrar" y foco al título, como Agro); la **localidad elegida** se marca en el mapa y se puede cambiar tocando un pin.
3. **Detalles:** *Calor* (temperatura, sensación, máxima/mínima, curva 24 h, consejos de Acciones); *UV* (índice ahora y máximo, categoría OMS, amanecer/anochecer, horas de sol, curva, protección); *Viento, oleaje y corrientes* (viento, rachas, Beaufort; oleaje con Douglas "Estado del mar (modelo)", periodo, corriente y temperatura del mar); *Humedad y lluvia* (humedad, probabilidad, mm de 24 h, estado del cielo).
4. Textos ES/EN dentro de `clima-detalle.js` (como `pesca.js`); no se toca `textos.js`.
5. Obligatorio: 360 px sin scroll horizontal, contraste ≥ 4.5:1, teclado y foco, `?lang=en` completo, sin errores de consola, y la **atribución de Open-Meteo y OpenStreetMap** (ya está en el subtítulo y en el mapa).

## 5. Lo que NO se construye (sin fuente en nuestros datos)

"Estación BCS-01" y "Boyas SEMAR" (son modelos, no estaciones ni boyas), bandera o semáforo de navegación (no es aviso oficial), "Red Radar Costero BCS", "Enlace satelital activo", descargar informes en PDF, espectro de energía del oleaje, mareas, visibilidad marina, "Eficacia 99 %", comparación con un "promedio" sin serie propia, y reglas de lluvia en mm por hora (umbrales sin fuente primaria). Lo que quede del Figma sin construir se menciona, si acaso, como trabajo futuro.

## 6. Pruebas

`node --test "web/tests/*.test.mjs"` (hoy 134) y `"diseno/tests/*.test.mjs"` (50) en verde; `clima.test.mjs` para reglas y claves ES/EN; fixture **real** de Open-Meteo (no inventado); cifras de la pantalla comparadas contra la respuesta cruda; navegador sin ventana a 360, 390 y 1280 px en ES y EN; `scripts/verificar-todo.ps1` antes del PR a `main`.
