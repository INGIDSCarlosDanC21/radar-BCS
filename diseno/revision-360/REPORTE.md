> **Nota (2026-11-15): documento histórico; lo que contradiga a `docs/decisiones.md` (2026-11-15) está superado por ese archivo. Documento de diseño de 2026-11-14 (barra de 4 pestañas, 6 o 7 localidades).** Ver la web actual: menú Clima · Pesca · Inicio · Agro · Avisos, 38 lugares en Clima, 19 puertos en Pesca.

# Revisión a 360 px del sitio real (issue #98)

## Tercera pasada sobre `dev` (2026-11-15, 11:00, Ehileen)

Medición con la lógica de `diseno/tools/revisar-360.js`, en un viewport de 360x800, sobre `dev` en `223099a`, con la navegación actual (Clima · Pesca · Inicio · Agro · Avisos).
- **Rutas revisadas:** `#inicio`, `#clima`, `#clima/acciones`, `#pesca`, `#agricola`, `#avisos` y `#ficha/{calor|vegetacion|lluvia|agua}`, en español; también las principales en inglés.
- **Cómo se midió:**
  - contraste de texto con el sistema en modo claro y en modo oscuro;
  - foco con la tecla Tab real;
  - reglas `:focus-visible` de todas las hojas de estilo;
  - `prefers-reduced-motion` en el código.

**Resultado global:**
- Ninguna pantalla tiene scroll horizontal, ni en español ni en inglés.
- No aparecen "null", "undefined" ni "NaN".
- Cada pantalla tiene un solo `<h1>`.
- En inglés no quedan textos en español.

| Hallazgo | Estado | Dato medido |
|---|---|---|
| P0 Scroll horizontal en Ficha de lluvia | **Resuelto** | La página mide 360 px |
| P1 Letra de 10–11 px en Inicio, Fichas y Agro | **Resuelto** | 0 textos menores de 12 px en Inicio, Clima, Agro y las 4 Fichas |
| P1 Zoom del mapa de 30 px | **Resuelto** | Mide 40x40 en Clima |
| P1 Modo oscuro roto en Inicio y Agro | **Resuelto** | La web declara `color-scheme: light` y se ve siempre en claro. Con el sistema en oscuro, 0 textos bajo 4.5:1 en las 6 rutas |
| P1 Pines de Agro cortados (#128) | **Sigue, menor** | Las etiquetas ya no tapan la vista. Los pines miden 24 px de alto y 16x16 los puntos chicos (45 áreas táctiles menores de 44 px en Agro) |
| P1 Pines de Pesca | **Nuevo** | `button.mi-pin` de 77x34 px (menos de 44 de alto); 14 áreas táctiles chicas |
| P1 Avisos: letra y enlaces chicos | **Nuevo** | 8 etiquetas `.av-cat` ("Agrícola", "Mar") en 11 px; enlaces "Ver ficha" de 65x16 px |
| P1 Clima: enlace "Open-Meteo" | **Nuevo** | 82x19 px |
| P1 Foco poco visible en Inicio | **Nuevo** | `home.css:29` (`.hm a:focus-visible`) usa un contorno cian `#51d8e8`, que sobre las tarjetas claras da 1.61:1 (WCAG 2.4.11 pide 3:1). Arreglo: dejar el cian solo en el bloque oscuro de arriba y usar `var(--acento)` (#0c2340) en las tarjetas |
| P2 Logo de la cabecera | **Nuevo** | El enlace `.marca` mide 128x36 px (menos de 44 de alto). Se corrige en el PR del logo |
| P2 Chips de puertos en Pesca | Nota | 19 chips en una fila con scroll lateral (2601 px). Funciona, pero no hay pista visual de que hay más chips a la derecha |
| Reducir movimiento | **OK** | Las animaciones de satélite, cielo, Pesca, Agro, "Ver más" y el esqueleto de carga se detienen con `prefers-reduced-motion` |

Falta revisar con un lector de pantalla real y en un teléfono real (#71).

## Actualización: segunda pasada sobre `dev` (2026-11-14, noche)

Medición automática con `diseno/tools/revisar-360.js` (viewport 360x800) sobre `origin/dev` en d86cc87, ya con el Mapa Agrícola (#88) y la versión en inglés (`?lang=en`). Rutas: `#inicio`, `#mapa`, `#ficha/{calor|vegetacion|lluvia|agua}`, `#agricola`, `#acciones`, en español e inglés (los resultados coinciden).

| Hallazgo | Estado | Dato medido |
|---|---|---|
| **P0** Scroll horizontal en Ficha de lluvia | **Sigue** | La página mide 492 px (desborde de 132 px) por el enlace `https://power.larc.nasa.gov/docs/service...` de 459 px |
| **P1 nuevo** Mapa Agrícola: etiquetas de los pines cortadas | **Nuevo** | El mapa va de x=16 a x=344; las 4 etiquetas se salen: "Los Planes…" llega a 523, "El Carrizal…" a 476, "Chametla…" a 387, "El Centenario…" a 366. Sugerencia: a 360 px mostrar solo el nombre del lugar y el resto en el popup, o `max-width: 160px; white-space: normal` |
| P1 Mapa Agrícola: letra pequeña | Nuevo | 17 textos de 10 px (`.ag-mono`, `.ag-pin`) y 5 de 11 px (lista de acuíferos, fuentes). Mínimo 12 px |
| P1 Mapa Agrícola: enlace "Leaflet" | Nuevo | 45x14 px. Los botones de zoom sí miden 40x40 (casi 44) |
| P1 Leyenda del mapa: "sin datos" frente a "Sin cambio claro" | **Sigue** | En inglés la leyenda dice "no data" y la lista "No clear change" para Sur y El Centenario |
| P1 Zoom del mapa principal | **Sigue** | 30x30 px (en Agrícola ya son 40x40) |
| P1 Letra de 10 px en Inicio | **Sigue** | 8 textos (`.hm-mono`, `.hm-dato-k`) |
| P1 Ejes de las fichas en 11 px | **Sigue** | 5 textos por ficha |
| P1 Enlaces de fuente de 17–21 px de alto | **Sigue** | En las 4 fichas y en Acciones |
| P1 Marca "AI-generated" y logo en la cabecera | **Sigue** | La cabecera solo tiene el texto "Radar BCS"; no hay `<img>` del logo ni la marca |
| `#agricola` no existía | **Resuelto** | Ya existe (PR #88) |
| **P1 nuevo** Modo oscuro roto en Inicio y Agrícola | **Nuevo** | Con el sistema en oscuro, `home.css` y `agricola.css` dejan el fondo claro `#f7f9fc` y la cabecera y el pie usan texto claro: "La Paz, B.C.S." y el pie a 1.80:1, "English" a 1.96:1. Mapa, Ficha y Acciones pasan. En modo claro las 5 rutas pasan 4.5:1. Arreglo: usar los tokens `--rb-*` (ya traen bloque oscuro) en vez de hex fijos |

Sin scroll horizontal en las demás rutas (también en inglés). La cabecera ya tiene el enlace "English".


Fecha: 2026-11-14. Rama `ui-ux/cierre-98`. Sitio servido de `web/` en local; medición en viewport emulado 360x800 (script en página: desbordes, texto "null/undefined/NaN", fuentes <12 px, áreas táctiles <44 px) y capturas con Edge headless (iframe de 360 px, recortadas a 360 de ancho; tema oscuro del sistema).
Rutas: `#inicio`, `#mapa`, `#ficha/{calor|vegetacion|lluvia|agua}`, `#acciones`. **`#agricola` no existe** en la web: cae en Inicio (no hay Mapa Agrícola que revisar).

Resultado global: sin "null/undefined/NaN" en ninguna pantalla. Sin scroll horizontal en 6 de 7 pantallas; falla Ficha de lluvia. Un solo `<h1>` por pantalla. La marca "AI-generated" no aparece en ninguna pantalla.

## Hallazgos por pantalla

| Pantalla | Captura | Problema (sev.) | Sugerencia |
|---|---|---|---|
| Ficha lluvia | `ficha-lluvia.png` | **P0** Desborde horizontal: la página mide 492 px. La URL larga de la fuente (power.larc.nasa.gov/...) no se parte y estira la barra inferior y la página. En la captura se corta. | Diego: en el bloque Fuente `a{overflow-wrap:anywhere}` y `body{overflow-x:hidden}` solo como red. Mejor texto corto ("NASA POWER, documentación") en vez de la URL cruda. |
| Ficha lluvia | `ficha-lluvia.png` | P1 En "Media por década" la unidad "mm/año" parte en 2 líneas; filas desiguales. | Diego: `white-space:nowrap` en el valor; barra `flex:1 1 0; min-width:0`, valor `flex:0 0 auto`. |
| Ficha (las 4) | `ficha-calor.png`, `ficha-vegetacion.png`, `ficha-agua.png` | P1 Enlace de fuente (URL AppEEARS/DOI) de 21 px de alto, bajo 44 px. | Diego: `a{display:inline-block; min-height:44px; padding-block:12px}`. |
| Ficha (las 4) | `ficha-calor.png` | P1 Texto de ejes del SVG de 11 px; "°C" centrado bajo el eje X parece título del eje. | Diego: `font-size:12px` mínimo; unidad arriba a la izquierda del eje Y. |
| Ficha calor | `ficha-calor.png` | P1 Titular "Sin cambio claro" (~48 px) en 2 líneas sin número; el pie del gráfico dice "pasa de 35.8 a 32.2 °C", que parece contradecir "sin cambio" (la caída final sugiere 2025 incompleto: POR VERIFICAR con Luca). | Diego/Luca: avisar "2025 puede estar incompleto" si aplica. UI/UX: titular `clamp(1.75rem,8vw,2.25rem)`. |
| Ficha (las 4) | `ficha-calor.png` | P2 Chips de variable en 2 filas (Agua sola). Miden ≥44 px. | Diego: fila con `overflow-x:auto; flex-wrap:nowrap` (spec sec. 5) o cuadrícula 2x2. |
| Ficha (las 4) | `ficha-agua.png` | P2 Párrafos de método y limitación largos, con negrita en el bloque entero. | UI/UX: negrita solo en la primera frase; "Método" en `<details>` "Cómo se calculó". |
| Inicio | `inicio.png` | P1 10 px en `.hm-pildora`, `.hm-verde`, `.hm-dato-k`, `.hm-cred`, `.hm-copy`. Spec sec. 6: mínimo 12 px. | Diego: `font-size:max(12px,.75rem)` en `home.css`. |
| Inicio | `inicio.png` | P1 "La Paz, B.C.S." del encabezado, gris sobre fondo muy oscuro: contraste bajo (no medido). | Diego: color de texto secundario claro de `--rb-*`; verificar ≥4.5:1. |
| Inicio | `inicio.png` | P1 "Ver ficha de X" de 21 px de alto. | Diego: `display:flex; min-height:44px; align-items:center`, o toda la tarjeta enlazada. |
| Inicio | `inicio.png` | P1 Imagen satelital MODIS salió negra en la captura (posible carga lenta; POR VERIFICAR). Si falla, el botón queda sobre fondo vacío. | Diego: fondo de respaldo `--rb-marino`, `alt` descriptivo, confirmar que carga. |
| Inicio | `inicio.png` | P2 "P = < 0.001" y "P = 0.110" en las tarjetas: jerga. | UI/UX: llevar a "Ver detalle"; dejar solo "Tendencia clara/Sin tendencia clara". |
| Mapa | `mapa.png` | **P1** Zonas en gris con trama "sin datos", pero la lista dice "Sin cambio claro" en las 6 (sí hay datos). Leyenda inconsistente. | Diego: color y leyenda propios para "Sin cambio claro" (neutro `--rb-*`); trama solo para sin datos. |
| Mapa | `mapa.png` | P1 Botones de zoom 30x30 px (spec pide grandes); enlace "Leaflet" 21 px. | Diego: `.leaflet-control-zoom a{width:44px;height:44px;line-height:44px}`. |
| Mapa | `mapa.png` | P2 Mapa de ~320 px de alto, zonas diminutas. Mapa base no visible en captura (sin red en headless; POR VERIFICAR). Crédito OSM y fuente presentes. | Diego: alto `min(70vh,420px)`; `fitBounds` con padding 24 px. |
| Mapa | `mapa.png` | P2 Texto "una prueba marca baja, pero con otra no es significativa" largo y técnico. | UI/UX con Investigación: 2 frases cortas. |
| Acciones | `acciones.png` | P2 Enlaces de fuente de 17 px de alto; 7 viñetas densas. | Diego: `a{display:inline-block; padding-block:13px}`. UI/UX: icono + frase en negrita por consejo. |
| Acciones | `acciones.png` | P2 Hay fuente por tarjeta y aviso médico (bien). Cifra "32 °C" del ventilador sin fuente propia: POR REVISAR. | Investigación: confirmar que está en la página CDC citada. |
| Global | todas | **P1** Sin declaración "AI-generated" visible (logo generado con Gemini, spec sec. 7). El pie solo dice equipo, NASA Space Apps y licencia. El logo tampoco se ve en el encabezado (solo texto "Radar BCS"). | Diego: en el pie "Logotipo generado con IA (AI-generated)". UI/UX: entregar logo con marca para la cabecera, `alt="Radar BCS"`. |
| Global | todas | P2 "Saltar al contenido" 132x24, fuera de pantalla (correcto); al enfocar debe medir 44 px. | Diego: `.saltar:focus{min-height:44px; left:16px}`. |
| Global | todas | P2 Barra inferior de 4 pestañas cumple (≥44 px, `aria-current`, raya superior activa). No hay hamburguesa como propone la spec sec. 5; es mejor opción. | UI/UX: actualizar spec sec. 5 a "barra inferior". |

## Cumplimiento de criterios

- Sin scroll horizontal: falla solo Ficha de lluvia (492 px).
- Fuente junto a cada cifra: sí en las 4 pantallas; en Fichas es URL cruda.
- Sin causas: sí; aviso "Mostramos qué cambió, no por qué" en Inicio y Ficha, no en Mapa ni Acciones (P2).
- Español sencillo: bien en general; jerga "p-valor", "alfa", "Mann-Kendall", "pendiente de Sen" en Inicio y Ficha (P2: pasar a `<details>`).
- Números inventados: no se detectó ninguno; no se contrastó cada cifra con `web/data/indicadores.json`.

## Qué cambia quién

**Diego debe cambiar en `web/` (proponer):** desborde de lluvia (P0), 10 px en `home.css`, zoom del mapa, áreas táctiles de enlaces, leyenda "Sin cambio claro" vs "sin datos", disclaimer AI en el pie, foco de "Saltar", respaldo de la imagen satelital, chips en una fila, unidades de la media por década sin partir.

**UI/UX puede resolver en diseño (`diseno/`, `web/assets/`):** colores de leyenda del mapa con tokens `--rb-*`, jerarquía del titular de cifra, textos cortos del método, actualizar spec sec. 5, logo con marca AI, tarjeta de acción con icono.

## No se pudo comprobar

- Contraste con herramienta (solo observación visual); modo claro (capturas en tema oscuro).
- Mapa base OSM e imagen satelital con red real; dispositivos físicos; lector de pantalla.
- Mapa Agrícola (`#agricola` no existe).
