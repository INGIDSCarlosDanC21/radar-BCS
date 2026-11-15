# Plan: pestañas Pesca y Avisos (fieles a Figma, mapa de iconos, datos reales)

Pedido de Carlos (chat, 2026-11-15): agregar las pestañas **Pesca** y **Avisos y Alertas**, fieles al Figma con ajustes de proporciones; el mapa es de **iconos**; **sin gráficas, sin tablas y sin descripciones largas**; iconos CC0 o libres; bien integradas. Esto **reabre** la regla 1 de `docs/PLAN-CIERRE.md` ("Pesca no se construye"), con la condición de siempre: **ninguna cifra ni aviso inventado** (regla 1 de `AGENTS.md`).

Este plan es una propuesta de ejecución. Las decisiones que necesitan el OK de Carlos están en la sección 8.

## 1. Qué se conserva del Figma y qué se quita

Las pantallas `diseno/pantallas/pesca-*.png` y `avisos-y-alertas.png` están llenas de contenido de ejemplo que **no tiene fuente** (decretos de SEMAR, teléfonos, "Bandera Amarilla", 8 avisos inventados). En una pantalla de seguridad marina, un aviso falso es un riesgo real. Por eso se conserva el **diseño** (estructura, paleta, componentes, proporciones) y se sustituye el **contenido** por datos reales.

| Elemento del Figma | Qué se hace |
|---|---|
| Encabezado, navegación, pie, tipografías, paleta, tarjetas con barra de acento | Se conservan (ya están en `estilos.css` y `home.css`). Acentos de Pesca: seguridad `#fbbf24`, océano `#1eb8c8`, atmósfera `#4b5f7f`, potencial `#006d3d` (`diseno/ESPECIFICACION.md` §4) |
| Título "Mapa Pesquero" + subtítulo | Se conserva con **una sola línea** de subtítulo |
| Buscador de zona | Pasa a **chips de puerto** (7 a 8 puertos), sin campo de texto |
| Mapa oscuro con pines, tarjeta de zona y 3 datos flotantes (swell, viento, SST) | **Mapa de iconos**: un pin por puerto con ícono de estado + 1 valor. Sin tarjeta larga |
| Línea de horas 06:00–13:00 con "día anterior / siguiente" | Se conserva: es un control de hora real sobre el pronóstico por hora |
| Botón "Iniciar simulación" | Reproduce las horas del día (datos del modelo). Resuelve el "por confirmar" del Figma sin inventar nada |
| 4 tarjetas de diagnóstico (Semáforo, Condiciones, Clima costero, Potencial) | **4 mosaicos compactos**: ícono + estado de 2 a 3 palabras + 1 cifra. Sin tablas, sin gráficas, sin párrafos |
| Dictamen SEMAR, 4 pilares, protocolos, frecuencias, teléfonos, descarga de PDF, tabla de mareas | **Se quitan** (contenido sin fuente o texto largo) |
| "Red de Boyas SEMAR / NOAA en tiempo real", "Bandera Amarilla", "Zona Favorable / Alta Biomasa" | **Se quitan** (afirmaciones que no podemos respaldar) |
| Avisos: título, contador, filtros (Todas / Meteorológicas / Agrícolas / Pesca), simbología de 4 colores | Se conservan |
| Avisos: 8 notificaciones de ejemplo | **Se quitan.** Se sustituyen por los avisos reales de la sección 3 |
| Pestaña Clima | **Fuera de alcance** (Carlos pidió Pesca y Avisos). "El cielo ahora en BCS" de Inicio cubre lo esencial |

## 2. Datos reales de cada elemento

Verificado hoy (2026-11-15) con llamadas reales:

| Elemento | Fuente | Estado |
|---|---|---|
| Oleaje, periodo, dirección, swell, corriente y temperatura del mar, por hora | **Open-Meteo Marine** (`marine-api.open-meteo.com`), CC BY 4.0, la misma licencia y atribución que el cielo | Funciona. Rejilla de ~9 km: en 9 de 11 puntos de prueba devuelve datos de mar; 2 cayeron en tierra (`elevation` > 0) y se descartan. Hay contraste real: Pacífico con oleaje de 2.2 a 2.7 m y 14 s, Golfo en calma de 0.1 a 0.2 m |
| Viento, ráfagas, lluvia, temperatura, UV, por hora | Open-Meteo Forecast (ya integrado en `cielo.js`) | Funciona |
| Capa de **clorofila** y de **temperatura del mar** en el mapa | **NASA GIBS**: `VIIRS_NOAA20_Chlorophyll_a` (hasta 2026-11-14) y `MODIS_Aqua_L2_Sea_Surface_Temp_Day` | La capa existe. **Por verificar** que tenga cobertura útil sobre BCS y sin huecos antes de ofrecerla (misma prueba que se hizo con Terra) |
| Ciclones activos en el Pacífico | **NHC** `https://www.nhc.noaa.gov/CurrentStorms.json` | Responde (`activeStorms: []` hoy). **Por verificar** CORS desde el navegador; si no, solo enlace |
| Avisos oficiales (SMN, Protección Civil BCS, Capitanía) | Sitios oficiales | **Solo enlaces**. No hay un feed abierto verificado: no se copian ni se simulan |
| Vedas de pesca | Calendario de CONAPESCA | **Solo enlace** |
| Avisos agrícolas | Ya auditados en `web/data/agricola.json` (Monitor de Sequía SMN y sanidad vegetal DOF) | Se reutilizan: 1 línea cada uno, con su fuente y fecha |

**Dos cambios de nombre obligatorios** (para no afirmar lo que no sabemos):

1. **"Semáforo de Seguridad" → "Estado del mar (modelo)"**. La bandera de un puerto la decreta la Capitanía de Puerto; nosotros no. Mostramos Verde / Amarillo / Rojo calculado con **umbrales publicados** (escala de mar de la OMM/Douglas y criterios de embarcaciones menores del NWS) y la leyenda "Estimación del modelo, no es un aviso oficial. Consulta a la Capitanía de Puerto". **Los umbrales exactos se verifican contra su fuente antes de programarlos** (tarea F0.2).
2. **"Avisos" → dos grupos claramente separados**: **Avisos del modelo** (reglas automáticas sobre el pronóstico por hora; rótulo "automático, no oficial") y **Avisos oficiales** (solo enlaces a SMN, Protección Civil y NHC). Si no hay ninguno: "Sin avisos del modelo ahora". Nunca se muestra un aviso que no salga de un dato.

## 3. Avisos del modelo (reglas, con fuente a confirmar en F0.2)

Cada regla se evalúa por hora y por zona con datos de Open-Meteo y lleva su umbral y su fuente en `web/js/reglas-mar.js`. Propuesta de categorías (de las 4 del Figma, con color **y** texto **y** ícono, nunca solo color):

| Color del Figma | Nivel | Ejemplos de regla (umbral por confirmar) |
|---|---|---|
| Azul | Informativo | Mar en calma y buenas condiciones |
| Amarillo | Preventivo | Oleaje elevado; rachas moderadas; calor |
| Naranja | Severo | Viento o rachas fuertes; lluvia intensa |
| Rojo | Crítico | Solo si hay un ciclón activo de NHC cerca, o umbrales extremos |

Filtros: **Todas · Meteorológicas · Agrícolas · Pesca y marítimo**, con contador.

## 4. Navegación (pide decisión)

Hoy la barra inferior tiene 5 pestañas (Inicio, Mapa, Ficha, Agro, Acciones). Con Pesca y Avisos serían 7, y la guía de `ui-ux-pro-max` dice **máximo 5 en la barra inferior**.

**Propuesta:** en celular (< 1024 px) la barra queda en **Inicio · Mapa · Pesca · Avisos · Más**; "Más" abre una hoja con Ficha, Agro y Acciones. En escritorio (≥ 1024 px) el menú de arriba lleva todas las pestañas, como en el Figma. Rutas `#pesca` y `#avisos`, con enlace directo y sin romper las actuales.

## 5. Arquitectura (para no escribir lo mismo dos veces)

Se reutiliza lo que ya existe en `cielo.js` y `simulaciones.js` (máscara de íconos, pines, capa de GIBS, tarjeta, reproducción).

| Pieza | Archivo nuevo | Para qué |
|---|---|---|
| Datos | `web/js/datos-vivos.js` | Una sola llamada por tema a Open-Meteo (forecast + marine), caché de 10 minutos en `sessionStorage`, plazo de 9 s, error limpio |
| Reglas | `web/js/reglas-mar.js` | Función pura: datos → estado del mar y avisos, con umbrales y fuentes. Probada con pruebas |
| Mapa de iconos | `web/js/mapa-iconos.js` | Mapa Leaflet con pines de ícono + valor, capa opcional de GIBS, control de hora y botón de reproducir. Lo usan Pesca y Avisos (y después `cielo.js`) |
| Pantallas | `web/js/pesca.js`, `web/js/avisos.js` | Una por ruta, textos ES/EN en el diccionario como `cielo.js` |
| Estilos | `web/css/pesca.css`, `web/css/avisos.css` | Solo variables de `estilos.css`, sin colores sueltos |
| Iconos | `web/assets/iconos/mapa/*.svg` | **Ya descargados** (sección 6) |
| Ganchos | `index.html`, `app.js`, `esqueleto.js`, `textos.js` | Rutas, barra y esqueleto de carga. Cambios mínimos |

Reglas de diseño: sin gráficas, sin tablas, sin párrafos de más de una línea en las tarjetas; cada dato con ícono + texto (accesibilidad); pines de 44 px de área táctil; en 360 px los pines llevan solo ícono y valor; el detalle va en un panel corto al tocar el pin.

## 6. Iconos (ya descargados)

44 SVG de **Google Material Symbols** (Apache-2.0, la misma licencia ya registrada para los otros íconos del proyecto; atribución no obligatoria) en `web/assets/iconos/mapa/`, de `fonts.gstatic.com`, descargados el 2026-11-15 y revisados (SVG sin scripts, enlaces ni estilos). Cubren: oleaje (`waves`, `tsunami`), viento (`air`), barco y pesca (`sailing`, `phishing`, `set_meal`, `anchor`, `directions_boat`), alertas (`warning`, `error`, `info`, `crisis_alert`, `notifications`, `cyclone`, `thunderstorm`, `storm`, `flood`), clima (`sunny`, `rainy`, `water_drop`, `ac_unit`, `thermostat`, `local_fire_department`, `visibility`), agro (`agriculture`, `grass`, `bug_report`, `compost`) y controles (`play_arrow`, `pause`, `skip_previous`, `skip_next`, `chevron_left`, `chevron_right`, `layers`, `filter_alt`, `close`, `check_circle`, `schedule`, `my_location`, `navigation`, `speed`, `water`, `wb_twilight`). Quedan registrados en `docs/RECURSOS.md`. **Solo se cargan en la web los que se usen**; `docs/entrega/07` se actualiza con esos.

## 7. Skills de UI/UX cargadas y dónde se usan

Del repositorio (`.claude/skills/`), en este orden de uso:

| Skill | Se usa para |
|---|---|
| `rol-ui-ux` | Reglas del proyecto: sin logos NASA, IA declarada, assets registrados, lenguaje sencillo, accesibilidad mínima |
| `ui-ux-pro-max` | Guías de UX (barra inferior ≤ 5, no depender solo del color, áreas táctiles, rendimiento). Buscador local: `.claude/skills/ui-ux-pro-max/scripts/search.py` |
| `impeccable` (`shape`, `layout`, `polish`, `critique`) | Planear cada pantalla antes de programar y pulirla al final. Modo **Operate**: claridad y consistencia antes que expresión |
| `web-design-guidelines` | Revisión final del código contra las guías de interfaz web |
| `mobile-native` | Detalles de celular: toque, `100vh`, zona segura, scroll del mapa |
| `break-ui` | Probar con datos extremos: sin datos, oleaje enorme, 0 avisos, 20 avisos |
| `webapp-testing` / `playwright-skill` | Capturas a 360, 390 y 1280 px |

## 8. Decisiones que necesitan el OK de Carlos

1. **Navegación:** barra de celular "Inicio · Mapa · Pesca · Avisos · Más" (recomendada) frente a 7 pestañas apretadas.
2. **Semáforo:** renombrarlo "Estado del mar (modelo)" con umbrales publicados (recomendado) frente a mostrar una "bandera" que parezca oficial. Mostrar una bandera que no decretó la Capitanía no es una opción que recomiende.
3. **Avisos:** avisos automáticos del modelo + enlaces a avisos oficiales (recomendado) frente a solo enlaces.
4. **Alcance:** Pesca primero y Avisos después. Si a las 10:00 Avisos no está listo, se entrega solo Pesca y Avisos queda para después de enviar.
5. **Clima:** no entra (sigue fuera). Si Carlos lo quiere, es una fase 3 después de enviar.

## 9. Reparto y orden de trabajo (en paralelo, sin pisarse)

| Quién | Qué | Carpeta |
|---|---|---|
| **Líder (esta sesión)** | `datos-vivos.js`, `reglas-mar.js`, `mapa-iconos.js`, `pesca.js`, `avisos.js`, pruebas, docs de datos y recursos | `web/js/` nuevos, `docs/` |
| **Diego** | Barra responsive con "Más", rutas `#pesca` y `#avisos`, esqueleto de carga, 360 px | `index.html`, `app.js`, `esqueleto.js`, `estilos.css` |
| **Ehileen** | Actualizar en Figma Pesca y Avisos con mapa de iconos y sin texto largo, versión de 360 px, y revisar con `impeccable critique` y `web-design-guidelines` | `diseno/`, `web/assets/` |
| **Luca** | Verificar las fuentes de los umbrales (F0.2), revisar `reglas-mar.js` (es "ciencia") y comprobar que cada cifra de pantalla se puede rastrear | revisión; `analisis/` no cambia |
| **Roberto** (no disponible) | Revisión del inglés y texto alternativo cuando regrese | |

### Fases y puntos de corte (hoy domingo 15 nov; meta de envío 13:00)

- [ ] **F0 · Verificar (≈ 30 min).** F0.1 puntos de mar válidos por puerto (hecho en parte: ver sección 2); F0.2 fuentes y umbrales del estado del mar y de los avisos; F0.3 cobertura de las capas de GIBS (clorofila y temperatura del mar); F0.4 CORS de NHC.
- [ ] **F1 · Base (≈ 60 min).** Rutas y barra (Diego) en paralelo con `datos-vivos.js`, `reglas-mar.js` y `mapa-iconos.js` (Líder), con pruebas.
- [ ] **F2 · Pesca (≈ 60 min).** Mapa de iconos, 7 a 8 puertos, control de hora y reproducir, 4 mosaicos, capa de clorofila / temperatura del mar si F0.3 sale bien.
- [ ] **F3 · Avisos (≈ 60 min).** Contador, filtros, simbología, avisos del modelo, avisos agrícolas reutilizados, enlaces oficiales y NHC si F0.4 sale bien.
- [ ] **F4 · Pulido y pruebas (≈ 45 min).** `impeccable polish`, `web-design-guidelines`, `break-ui`, 360 / 390 / 1280 px, contraste, inglés, sin conexión, `verificar-todo.ps1`.
- [ ] **F5 · Entrega.** Docs (`04`, `07`, `RECURSOS`, `decisiones`), PR a `dev` y, con OK de Carlos, PR a `main`. **Corte duro: a las 10:30 se congela; lo que no esté listo no entra.**

### Definición de terminado (cada pantalla)

- Todo número o aviso sale de un dato con fuente; hay una prueba que lo comprueba y ninguna cifra queda fija en el código.
- Sin gráficas, sin tablas y sin texto largo.
- Cada estado lleva ícono + texto, no solo color. Contraste ≥ 4.5:1, toques de 44 px, 0 fallas en 360 px.
- En inglés y en español, con las mismas claves.
- Sin conexión avisa y el resto de la web no cambia.
- Rótulo visible: "modelo, no estaciones" y "no es un aviso oficial".
- Fuentes y licencias en `RECURSOS`, `07` y `04`.

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| La rejilla marina de 9 km no distingue dentro de bahías (La Paz da 0.14 m en cualquier punto de la bahía) | Se rotula "modelo de ~9 km" y se eligen puntos de mar verificados; no se promete detalle de bahía |
| Open-Meteo caído o con límite | Una llamada por tema, caché de 10 minutos, aviso de error; el límite gratuito es de menos de 10,000 llamadas por día |
| Alguien lee "Estado del mar" como aviso oficial | Rótulo fijo y enlace a Capitanía de Puerto y SMN junto al estado |
| El tiempo no alcanza | Corte duro a las 10:30; Pesca antes que Avisos; el mapa de iconos es reutilizable |
| Conflictos de código con Ehileen y Diego | Archivos nuevos para casi todo; solo 4 ganchos en archivos compartidos, a cargo de Diego |
