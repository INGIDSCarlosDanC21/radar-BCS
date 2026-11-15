# Plan: pantalla de Clima (domingo 15 de noviembre)

Origen: documento "Plan de acción" de Nevid/Ehileen (Google Docs) y el Figma `diseno/pantallas/clima-*.png`. Pide la vista **Clima** con el buscador arriba (como en el Figma), el mapa y **4 tarjetas**: *Calor y sensación térmica*, *Radiación UV y exposición solar*, *Viento, oleaje y corrientes*, *Humedad y lluvia*, con Agro como referencia ("las tarjetas de abajo" y "la parte de arriba del mapa"). Decisión de Carlos (2026-11-15): **entra, con alcance acotado y solo con datos reales**. Corte: **09:30**; si no está verde, se envía sin Clima.

## 1. Reparto

| Quién | Entrega | Rama | Archivos |
|---|---|---|---|
| Luca | Datos y reglas (primero) | `prog-a/clima-datos` | `web/js/datos-vivos.js` (solo agregar), `web/js/reglas-clima.js`, `web/tests/clima.test.mjs`, `web/tests/fixtures/clima-2026-11-15.json`, `docs/investigacion/umbrales-clima.md` |
| Diego | Pantalla | `prog-b/clima` | `web/js/clima.js`, `web/css/clima.css`, y una línea cada uno en `app.js`, `menu.js`, `index.html` |
| Asistente del Líder | "Ver más", revisión, fusión a `dev`, docs | `lider/*` | `ver-mas.*`, `docs/` |

Luca debe tener su **primer PR en 90 minutos** (datos + `resumenPuerto` + fixture) para que Diego integre. Mientras tanto Diego arma la pantalla con lo que `datos-vivos.js` ya trae (viento, rachas, UV, oleaje, corrientes, temperatura del mar) y deja "sin dato" en lo nuevo. PR a `dev`, nunca a `main`, sin `push --force`. Se fusionan de a uno, con puerta de calidad.

## 2. Lugares

Los **8 puertos de `RBVivo.PUERTOS`** (Bahía Magdalena, Guerrero Negro, Todos Santos, Cabo San Lucas, La Paz, Loreto, Mulegé, Santa Rosalía): coinciden con los pueblos del Figma, tienen punto de mar para oleaje y reutilizan la llamada que ya hace Pesca y Avisos. (Los 7 de Inicio incluyen Comondú y no tienen punto de mar; no se usan aquí.) **Buscador:** filtra esos 8 por nombre (sin geocodificación abierta). **Mapa:** Leaflet con los pines de `mapa-iconos.js`, como Pesca.

## 3. Contrato de datos (Luca → Diego)

`RBVivo.cargar()` sigue devolviendo `{datos}` con `datos.puertos[k].s` y se **agregan** series por hora (misma longitud que `datos.horas`, `null` si falta):

| Serie | Variable de Open-Meteo | Punto | Unidad |
|---|---|---|---|
| `temp` | `temperature_2m` | pueblo | °C |
| `sens` | `apparent_temperature` | pueblo | °C |
| `hum` | `relative_humidity_2m` | pueblo | % |
| `plluvia` | `precipitation_probability` | pueblo | % |
| `lluvia` | `precipitation` | pueblo | mm |
| `rad` | `shortwave_radiation` | pueblo | W/m² |
| `cdir` | `ocean_current_direction` | mar | ° |

Y por día en `datos.puertos[k].dias` = `[{ fecha, tmax, tmin, uvmax, amanecer, anochecer, solS }]` (de `temperature_2m_max/min`, `uv_index_max`, `sunrise`, `sunset`, `sunshine_duration`).

**Límite de Open-Meteo:** no agregar ubicaciones. Antes de subir el PR, leer la regla de conteo en <https://open-meteo.com/en/pricing> (las peticiones con muchas variables pueden contar más de una) y anotar el cálculo en `docs/investigacion/disponibilidad-servicios.md`. Si sube mucho, pedir las variables nuevas solo para los 8 pueblos en una petición aparte. El caché de 10 min se conserva y las pruebas actuales de Pesca y Avisos no se rompen.

`web/js/reglas-clima.js` exporta `RBReglasClima` (ES5, sin build, mismo estilo que `reglas-mar.js`; textos ES/EN dentro del archivo con prefijo `clm.`):

- `resumenPuerto(datos, idx, k)` → `{ calor:{temp, sens, max, min, nivel}, uv:{ahora, max, nivel, amanecer, anochecer, solH}, viento:{kt, rachas, beaufort, ola, douglas, periodo, corriente, cdir, sst}, lluvia:{hum, prob24, mm24, codigo} }`. Todo `null` si falta el dato.
- `curva24(datos, k, serie, idx)` → 25 valores (12 horas antes y 12 después) para dibujar la curva.
- `nivelUV(uv)` con la **escala de la OMS** (0-2 bajo, 3-5 moderado, 6-7 alto, 8-10 muy alto, 11+ extremo).
- `nivelCalor(sens)` → **`null` hasta que Luca confirme la fuente primaria** del umbral en `docs/investigacion/umbrales-clima.md`. Sin fuente no hay etiqueta, solo el número ("sensación térmica del modelo").

## 4. Pantalla (Diego)

Ruta `#clima` y `#clima/calor|uv|viento|lluvia`; sigue el patrón de `pesca.js` y `agricola.js`.

1. Encabezado "Mapa meteorológico" y pastilla "Actualizado hh:mm · modelo Open-Meteo, no son estaciones".
2. **Buscador arriba** y chips de capa (*General, Calor, Viento, UV, Humedad*) que cambian lo que muestra y el color de cada pin.
3. **Mapa** con los 8 pines.
4. **4 tarjetas** con barra de acento (`--rb-acento-clima-*` en `web/assets/tokens.css`, íconos `web/assets/iconos/clima-*.svg`): título, una cifra y una frase. Al tocar una se abre debajo el detalle (como las fichas del Agro).
5. **Detalle:** cifras clave del lugar seleccionado y una curva de 24 horas en SVG simple. Calor: temperatura, sensación, máxima/mínima. UV: índice ahora y máximo, amanecer/anochecer, horas de sol, protección (OMS). Viento: viento, rachas, escala de Beaufort, oleaje con Douglas ("Estado del mar (modelo)"), periodo, corriente, temperatura del mar. Lluvia: humedad, probabilidad de lluvia, mm de las próximas 24 h y estado del cielo.
6. Consejos de mitigación: reutilizar los de Acciones (CDC y EPA, ya citados). Sin "eficacia 99 %".
7. Menú: barra inferior **Inicio · Mapa · Clima · Pesca · Más** (Agro, Avisos, Acciones); superior de texto con Clima. Avisos se enlaza desde las tarjetas de Clima y Pesca.
8. Textos ES/EN dentro de `clima.js` (como `pesca.js`); no se toca `textos.js`.

Obligatorio: 360 px sin scroll horizontal, contraste ≥ 4.5:1, teclado y foco visibles, `?lang=en` completo, sin errores de consola, y la **atribución de Open-Meteo y OpenStreetMap** (se queda, ver `FUENTES-Y-IA.md`).

## 5. Lo que NO se construye (sin fuente en nuestros datos)

"Estación BCS-01" y "Boyas SEMAR" (no hay estaciones ni boyas: son modelos), bandera o semáforo de navegación (no es aviso oficial), "Red Radar Costero BCS", "Enlace satelital activo", descargar informes en PDF, espectro de energía del oleaje, mareas (pleamar y bajamar), visibilidad marina, "Eficacia 99 %", clima mundial y comparación con el "promedio" (sin serie propia), y reglas de lluvia en mm por hora (umbrales sin fuente primaria). Todo lo que quede en el Figma sin construir se menciona, si acaso, como trabajo futuro.

## 6. Pruebas y verificación

- `node --test "web/tests/*.test.mjs"` y `"diseno/tests/*.test.mjs"` en verde (hoy 120 y 50). Pruebas nuevas: `clima.test.mjs` (reglas, claves ES/EN iguales, nada de texto que afirme una fuente oficial).
- El fixture de Clima sale de una **respuesta real** de Open-Meteo (no inventada) y las cifras de la pantalla se comparan contra la respuesta cruda.
- Navegador sin ventana a 360, 390 y 1280 px, ES y EN: tarjetas y detalle con cifras, sin errores de consola, sin scroll horizontal, contraste 0 fallas.
- `scripts/verificar-todo.ps1` completo antes del PR a `main`.

## 7. Dudas pendientes del documento

El documento solo trae esta tarea y una línea de "Bugs" que dice "hu?" sin detalle. Que Nevid (o quien lo escribió) aclare el bug y complete la comparación Web vs Figma en el issue de Clima; no se adivina.
