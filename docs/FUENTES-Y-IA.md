# Fuentes y uso de IA: dónde están documentados y qué se ve en pantalla

Decisión de Carlos (Líder), 2026-11-15: **toda fuente de información y todo uso de IA debe estar documentado, pero no hace falta repetirlo en cada pantalla**: basta con la documentación del repositorio (GitHub). Así la web tiene menos texto repetido y menos scroll.

> **Texto oficial** (leído el 2026-11-15 en spaceappschallenge.org; las dos páginas están fechadas el 13 de noviembre de 2026):
>
> - La [Guía de envío](https://www.spaceappschallenge.org/resources/project-submission-guide/) exige indicar dónde y cómo se usó SI (la IA, en su vocabulario): las **imágenes y videos** generados deben llevar una "visible watermark" (marca de agua visible); el **audio, el código y los datos** se reconocen en texto descriptivo y metadatos. Los jueces ven esas marcas y evalúan la originalidad y la ejecución de lo asistido por SI.
> - Las [Preguntas frecuentes](https://www.spaceappschallenge.org/resources/participant-faqs/) piden que el envío incluya una **descripción de cómo se usó SI**. Lo que se contesta en la lista desplegable de la plataforma no lo ven los jueces.
>
> **Cómo encaja la regla de Carlos** (documentar todo, sin repetirlo en cada pantalla): cumple lo de la descripción, el audio, el código y los datos. **No sustituye la marca de agua visible en imágenes y videos que pide la guía**; ese punto sigue vigente en el texto oficial. El único material de ese tipo es el logo (Gemini): se quitó la etiqueta junto al logo del encabezado por decisión de Carlos y el logo sigue declarado en el pie de cada pantalla (con la etiqueta del pie de Inicio), en `docs/entrega/05` y en `docs/RECURSOS.md`. La sección 4 dice qué decidir.

## 1. Dónde está documentado cada cosa

| Qué | Dónde |
|---|---|
| Datos de la NASA (MODIS, NASA POWER, GRACE, GIBS) y cómo se usan | `docs/entrega/06-nasa-data.md` |
| Todo recurso externo: código, librerías, imágenes, íconos, fuentes de letra, mapas base, datos de otros organismos | `docs/RECURSOS.md` y `docs/entrega/07-other-resources.md` |
| Herramientas de IA (Claude Code, Google Stitch, Gemini), dónde y cómo se usaron | `docs/entrega/05-use-of-ai.md` y la sección IA de `docs/RECURSOS.md` |
| Código y datos generados con IA | Campo `generado_con` de los JSON; texto descriptivo en el README y en el pie de la web |
| Método estadístico y límites | `docs/investigacion/metodo.md` y cada Ficha de la web |
| Umbrales de mar (Pesca y Avisos) | `docs/investigacion/umbrales-mar.md` |
| Disponibilidad y límites de los servicios | `docs/investigacion/disponibilidad-servicios.md` |
| Fuentes del Mapa Agrícola (DOF, NASA POWER, SoilGrids, SMN, GeoNames) | `docs/RECURSOS.md` y el bloque "Fuentes (n)" de cada ficha agrícola |

La web enlaza a esta documentación desde el pie de Inicio ("Fuentes NASA") y todas las pantallas llevan al final la línea de IA y la licencia.

## 2. Qué se quitó de la pantalla (2026-11-15)

Solo texto repetido. Todo sigue documentado arriba. Se oculta con `web/css/fuentes.css` (para volver a mostrarlo basta borrar la regla).

| Qué | Dónde salía | Alto que ocupaba (celular, 390 px) |
|---|---|---|
| Etiqueta de texto "AI-generated" junto al logo (la marca de agua ahora va **dentro de la imagen del logo**, sin fila extra) | Encabezado de todas las pantallas | 14 px por pantalla (y una fila extra en celular) |
| "Fuente: …" en cada tarjeta | Inicio, 4 tarjetas | unos 112 px |
| Crédito de la imagen GOES (la insignia de arriba ya dice "Imagen GOES-West · NASA GIBS") | Inicio | 40 px |
| "Fuente: …" en cada tarjeta | Mapa Agrícola, unas 9 tarjetas por ficha | unos 340 px en la ficha Clima y Agua |
| Crédito de las imágenes satelitales (ya sale en la esquina del mapa) | Mapa, "Mira La Paz desde el espacio" | 58 px |

Medido antes y después con el navegador (incluye también los cambios de Ehileen ya fusionados, #157 y #162): Inicio 4399 → 3945 px, Agro Clima 6210 → 5836 px, Mapa 2430 → 2366 px.

## 3. Qué se queda en pantalla y por qué

- **Atribución de OpenStreetMap** (esquina de cada mapa): su licencia (ODbL) exige dar el crédito donde se usa el mapa.
- **Atribución de Open-Meteo.com (CC BY 4.0)**: su licencia exige atribución donde se muestran sus datos. Va en una línea corta con enlace.
- **Rótulos de seguridad**: "no es aviso oficial", "no son estaciones", "no son boyas". Son advertencias para el usuario, no solo fuentes.
- **Limitaciones y método** de cada cifra (por ejemplo, la nota de que el calor del Mapa es orientativo). Mezclan método con fuente, por eso no se ocultan.
- **Origen de cada aviso** ("Fuente: SMN-CONAGUA") y los enlaces a las fuentes oficiales.
- **"Fuente: CDC / EPA"** en Acciones: enlazan al consejo original de salud.
- **Pie de página**: licencia Apache-2.0 y la línea de uso de IA ("Código y análisis escritos con ayuda de IA (Claude Code); interfaz diseñada con ayuda de Google Stitch; logotipo generado con IA (Gemini)"). El pie de Inicio conserva además la etiqueta "AI-generated" junto a su logo.
- **Bloque "Fuentes (n)" de cada ficha agrícola** (plegado) y el bloque de fuente de cada Ficha.

## 4. Pendientes

- ~~Borrar el `<span class="marca-ia">` de `web/index.html`~~: hecho el 2026-11-15 tras fusionar #159. Para volver a mostrar la etiqueta hay que poner de nuevo el `span` en el encabezado.
- `diseno/ESPECIFICACION.md` (§7) y el Figma todavía piden la marca junto al logo del encabezado: es referencia de diseño; Ehileen decide si lo actualiza.
- **Marca de agua del logo: resuelta (2026-11-15).** Carlos delegó la decisión; se eligió lo recomendado: la marca "AI-generated" va **dentro de la propia imagen del logo** (`web/assets/logo-radar-bcs-ai-generated.png`), así cumple la "visible watermark" de la guía oficial sin ocupar más espacio (204 × 36 px en celular, encabezado de 56 px). La etiqueta de texto separada sigue fuera.
- Posible siguiente recorte (no hecho): plegar el bloque "Fuente, resolución, periodo y descarga" de cada Ficha como "Sobre los datos" (ver `docs/PLAN-VER-MAS.md`, sección 7).
