# Fuentes y uso de IA: dónde están documentados y qué se ve en pantalla

Decisión de Carlos (Líder), 2026-11-15: **toda fuente de información y todo uso de IA debe estar documentado, pero no hace falta repetirlo en cada pantalla**: basta con la documentación del repositorio (GitHub). Así la web tiene menos texto repetido y menos scroll.

> **Nota de honestidad.** El texto oficial de esta regla nueva no está citado en el repositorio: Carlos la indicó en el chat. Los documentos oficiales que tenemos en `docs/referencia/` son la versión anterior (la diapositiva de envío pide "una marca de agua visible" en las imágenes y videos generados; la página de Componentes dice "marca de agua o descripción del proyecto"). Cuando Carlos tenga el texto de la regla nueva, pegarlo en `docs/referencia/` y citarlo aquí. Todo lo que se documenta abajo cumple las dos versiones, salvo la marca junto al logo del encabezado, que quitamos por esta regla.

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
| Etiqueta "AI-generated" junto al logo | Encabezado de todas las pantallas | 14 px por pantalla (y una fila extra en celular) |
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

- Borrar el `<span class="marca-ia">` de `web/index.html` cuando se fusione el PR #159 de Ehileen (toca esa misma línea); hoy solo está oculto con CSS.
- `diseno/ESPECIFICACION.md` (§7) y el Figma todavía piden la marca junto al logo del encabezado: es referencia de diseño; Ehileen decide si lo actualiza.
- Pegar aquí el texto oficial de la regla nueva (ver la nota del principio).
- Posible siguiente recorte (no hecho): plegar el bloque "Fuente, resolución, periodo y descarga" de cada Ficha como "Sobre los datos" (ver `docs/PLAN-VER-MAS.md`, sección 7).
