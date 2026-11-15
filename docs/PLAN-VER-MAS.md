# Plan: textos largos con "Ver más" (menos scroll)

Pedido de Carlos (chat, 2026-11-15): que los textos largos se acorten y ofrezcan un botón **"Ver más"** con el resto de la información, para optimizar el espacio. La gente hace mucho scroll.

Este documento es un **plan**. Todavía no se programó nada. Las decisiones que necesitan el OK de Carlos están en la sección 8.

## 1. Cuánto pesan hoy los textos largos (medido el 2026-11-15, celular de 390 px)

Se midieron los párrafos, elementos de lista y definiciones con 130 caracteres o más, en cada pantalla, con datos reales.

| Pantalla | Alto de la página | Textos largos | Parte de la página | Los más grandes (alto en px) |
|---|---|---|---|---|
| Inicio | 4399 | 2 | 6 % | Limitación del calor (162); pie de página (96) |
| Mapa | 2430 | 4 | 17 % | Aviso "es una foto de cada año…" (182); línea de fuente de la capa (96); nota del calor (76) |
| Ficha de calor | 2851 | 2 | 15 % | **Limitación (288)** |
| Ficha de agua | 2959 | 2 | 17 % | **Limitación (336)** |
| Ficha de lluvia | 2739 | 3 | 13 % | "No se detecta un cambio claro…" (120); limitación (96) |
| Acciones | 1470 | 2 | 14 % | Aviso de CDC y EPA (113); primer consejo (96) |
| Agro, ficha Cultivos | 6188 | 9 | 14 % | **Resumen con datos oficiales (207)**; motivo del acuífero (112); nota (95) |
| Agro, ficha Clima y Agua | 6210 | 11 | 20 % | **Resumen con datos oficiales (391)**; nota (114); tarjeta (108) |
| Agro, ficha Suelo | 4763 | 3 | 8 % | Resumen (161) |
| Agro, ficha Riesgos | 4303 | 6 | 15 % | Resumen (207); tarjeta (108) |
| Pesca | 2264 | 1 | 4 % | Nota de la estimación (82) |
| Avisos | 2127 | 2 | 15 % | Enlaces oficiales (252, no es texto corrido); nota (58) |

**Lectura honesta:** los textos largos son entre 4 % y 20 % de cada pantalla. "Ver más" ahorra entre unos 50 y 280 px por texto: **un ahorro real pero moderado**. Los mayores están en el resumen de la ficha de Clima del Agro, la limitación de las fichas de agua y calor, y el aviso del Mapa. Por eso la sección 7 propone, aparte, otros recortes que pesan más.

## 2. Cómo funciona (un solo componente, sin editar pantallas ajenas)

**Archivos nuevos:** `web/js/ver-mas.js` y `web/css/ver-mas.css`, más 2 líneas en `index.html`. No se toca `home.js`, `cielo.js`, `textos.js` ni `home.css` (los de Ehileen) ni `agricola.js` (el de Diego).

1. **Recorte por líneas con CSS** (`-webkit-line-clamp`), no cortando el texto en un carácter. Así el texto completo sigue en la página (lo lee un lector de pantalla y se puede buscar), no se rompe a media frase ni se tocan los enlaces de adentro, y funciona igual en español e inglés.
2. **Solo si hace falta:** un texto se recorta únicamente si en la pantalla ocupa **más de 4 líneas**; se deja en **3 líneas** y aparece el botón. En escritorio, donde el texto es más ancho, casi nada se recorta.
3. **Botón "Ver más" / "Ver menos"** justo debajo del texto: `button` real con `aria-expanded` y `aria-controls`, área de toque de 44 px, foco visible y flecha. Al plegar, la pantalla no salta: vuelve al inicio del párrafo.
4. **Se aplica solo** a cualquier pantalla: observa el contenido de `<main>`, revisa los textos con 130 caracteres o más y se vuelve a calcular al cambiar de pantalla, al girar el celular o al cambiar el tamaño. Quien quiera excluir un texto pone `data-vm="no"`; quien quiera otro límite, `data-vm-lineas="2"`.
5. **Textos del botón** en el diccionario (ES/EN, mismas claves): "Ver más" / "See more", "Ver menos" / "See less".

## 3. Qué NO se pliega nunca

Regla automática (por contenido, no por pantalla) y excepciones por contenedor:

- Rótulos de **seguridad y honestidad**: "no es aviso oficial", "no son estaciones", "no es una tendencia" cuando es la advertencia principal, y las **tarjetas de avisos** con su zona y hora.
- **Atribuciones y licencias**: "Open-Meteo.com (CC BY 4.0)", créditos de NASA GIBS, "AI-generated", "generado con IA (Gemini)" y la licencia Apache-2.0.
- **Pie de página y menús**; mensajes de error (`role="alert"`); títulos y cifras; botones y enlaces sueltos.
- Si el rótulo importante cae más allá de la 3.ª línea, **se reescribe el texto para que empiece por él** (no se esconde).

## 4. Dónde se aplica y en qué orden

| Orden | Pantalla | Qué se pliega | Ahorro estimado* |
|---|---|---|---|
| 1 | **Agro, 4 fichas** | Resumen con datos oficiales; motivos; notas; descripciones de tarjeta | 45 a 275 px por ficha |
| 2 | **Ficha** (calor, vegetación, lluvia, agua) | "Limitación" y "No se detecta un cambio claro" | 170 a 220 px |
| 3 | **Mapa** | Aviso de la foto de cada año; nota del calor | unos 65 px |
| 4 | **Acciones** | Aviso de CDC y EPA | poco |
| 5 | **Inicio** | Limitación del calor | **la decide Ehileen** (ver sección 6) |
| – | **Pesca y Avisos** | Nada: ya son cortos | – |

\* Estimación: un texto recortado queda en unos 116 px (3 líneas más el botón). Se confirma midiendo antes y después.

## 5. Pruebas

- **Pruebas automáticas** (`web/tests/ver-mas.test.mjs`): la regla de qué textos se eligen (largo mínimo, exclusiones de seguridad, atribución y licencia), que el CSS use el recorte por líneas, que el botón sea un `button` con `aria-expanded`/`aria-controls` y que las claves ES/EN coincidan.
- **Prueba en navegador** (Chrome sin ventana, como las demás): por cada pantalla, a 360, 390 y 1280 px, en español e inglés: cuántos textos se recortan, que el botón aparezca solo cuando hay recorte, que "Ver más" muestre todo el texto y "Ver menos" lo vuelva a plegar sin saltar, y que no haya scroll horizontal.
- **Medición** del alto de cada pantalla antes y después, para confirmar el ahorro.
- Contraste del botón (≥ 4.5:1), foco visible y teclado (Tab, Enter y Espacio).
- `scripts/verificar-todo.ps1` completo y `web/tests` sin romper nada.

## 6. Cómo evitar choques con Ehileen y Diego

**Estado al 2026-11-15, 03:05:** Ehileen tiene abierto el **PR #157** ("Inicio: solo los títulos en ¿Qué cambia? y El cielo ahora; sin aviso ni textos de Open-Meteo"). Está limpio y sin conflictos con `dev`. Toca `home.js`, `cielo.js`, `textos.js`, `cielo.css`, sus pruebas y `diseno/ESPECIFICACION.md`. **Va en la misma dirección** que este plan: ella ya recorta textos de Inicio.

| Archivo | Quién lo toca ahora | Este plan |
|---|---|---|
| `home.js`, `home.css`, `cielo.js`, `cielo.css`, `textos.js` | Ehileen (#157 y pulido de UI/UX) | **No se toca** |
| `agricola.js`, `agricola.css` | Diego; yo hice la limpieza del #158 | No se toca: el componente actúa desde afuera |
| `app.js` | Compartido | No se toca |
| `index.html` | Compartido | 2 líneas (el estilo y el script) |
| `ver-mas.js`, `ver-mas.css`, `ver-mas.test.mjs` | Nadie | Archivos nuevos |

Reglas para no chocar:
1. **No empezar hasta que Carlos apruebe** este plan, y avisar a Ehileen antes (mensaje abajo).
2. **Inicio queda fuera** del componente mientras Ehileen lo esté puliendo: el componente trae una lista de exclusión (`.hm`) que se quita cuando ella lo confirme.
3. Rama propia `lider/ver-mas` y PR a `dev`; antes de abrirlo, traer `dev` para detectar choques.
4. Si el #157 se fusiona antes, se vuelve a medir Inicio.

**Mensaje sugerido para Ehileen (issue #119 o #144):** "Voy a agregar un componente aparte, `ver-mas.js` y `ver-mas.css`, que recorta a 3 líneas los textos de más de 4 líneas y pone 'Ver más'. No toca tus archivos (`home.*`, `cielo.*`, `textos.js`). Inicio queda fuera hasta que me digas. Si algún texto no debe plegarse, ponle `data-vm="no"`."

## 7. Otros recortes de scroll que pesan más (opcional, fuera de "Ver más")

Salen de las mismas mediciones; cada uno se decide por separado:

1. **Agro:** cada ficha abierta mide unos 4300 a 6200 px. Plegar por defecto los grupos secundarios ("Notas", segundo grupo de tarjetas) con un título de una línea.
2. **Ficha:** el bloque "Fuente, resolución, periodo y descarga" (144 a 168 px) puede ir plegado como "Sobre los datos".
3. **Avisos:** los 5 enlaces oficiales (252 px en celular) pueden ir en una fila que se desliza, o plegados.
4. **Botón "Subir"** flotante después de bajar más de dos pantallas, para no depender del scroll.
5. **Pie de página:** la línea de licencia y de uso de IA (96 a 128 px en cada pantalla) puede ocupar menos, sin quitar la declaración.

## 8. Decisiones para Carlos

1. **Umbral:** recortar a 3 líneas los textos de más de 4 líneas (recomendado).
2. **Excepciones** de la sección 3 (seguridad, atribución, licencia, "AI-generated"): confirmar que no se pliegan nunca (recomendado).
3. **Inicio:** esperar a que Ehileen termine antes de aplicarlo ahí (recomendado).
4. **Extras** de la sección 7: ¿cuáles sí? Recomendado: 1, 2 y 4.

## 9. Tiempo estimado

Componente y estilos, 40 min; reglas y exclusiones, 20 min; pruebas, 20 min; revisión en navegador a tres anchos y dos idiomas con medición antes y después, 30 min; documentación (`04`, `07` no cambian; se anota en `decisiones.md`) y PR, 15 min. **Total ≈ 2 horas**, dentro del corte de las 10:30.
