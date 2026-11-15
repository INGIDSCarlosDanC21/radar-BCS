# Revisión del inglés de la web (issue #93)

Fecha: 2026-11-15. Revisado sobre `origin/dev` (2c21191) con `?lang=en`, en las 8 rutas: `#inicio`, `#mapa`, `#ficha/{calor|vegetacion|lluvia|agua}`, `#agricola` y `#acciones`. Revisó UI/UX (Ehileen, con Claude Code). Falta el visto bueno de Roberto.

## Estado (2026-11-15, plan autónomo #117/#120)

- `textos.js`: corregido en el PR #123 ("Statistical test", "NASA data", "details", "Downloaded on", "Year by year", "rainfall").
- Pie con el logo de IA: lo resuelve el PR #121 de Diego.
- Campos `*_en` de los datos (PRECTOTCORR, "Rain" → "Rainfall", "REGIONAL"): lista exacta para Luca en #118. La nota de calor de abajo es anterior a la opción B (`docs/decisiones.md`); Luca decide su texto final.
- "Track Terrain" (`agricola.js`), "2021-2021" (`app.js`), "P" mayúscula (`home.css`) y fechas: en #119 para Diego. Los textos de `agricola.json` le tocan a Roberto (U1 de #120).
- "Water" se queda así: GRACE mide toda el agua almacenada, no solo el agua subterránea ("groundwater" sería incorrecto).

## Resultado general

- **Cobertura:** en inglés, casi todo el texto visible está traducido. El script buscó palabras en español en el texto, en `alt`, en `aria-label` y en `placeholder`. Solo encontró "parámetro PRECTOTCORR", en la fuente de la lluvia. "Español" y "Ver este sitio en español" están bien así: son el botón para volver al español y llevan `lang="es"`.
- **Calidad:** el inglés es correcto y claro. Lo que sigue son ajustes de lenguaje sencillo y de consistencia. Ninguno cambia cifras ni afirmaciones (regla 1).
- **Cambios en mis carpetas:** ninguno. Los textos viven en `web/` (Diego) y en `analisis/exportar.py` (Luca). Aquí solo van las propuestas.

## P1: corregir antes de la entrega

| Dónde | Hoy | Propuesta | Archivo (dueño) |
|---|---|---|---|
| Fuente de la lluvia (Inicio y Ficha) | NASA POWER Monthly (MERRA-2), **parámetro** PRECTOTCORR, community AG | NASA POWER Monthly (MERRA-2), PRECTOTCORR parameter, AG community | `analisis/exportar.py` → `indicadores.json`, campo `*_en` (Luca) |
| Agrícola, botón del buscador | Track Terrain | Search | `web/js/agricola.js`, clave `rastrear` (Diego). La prueba `agricola-en.test.mjs` espera "Track": hay que actualizarla. En español, "Rastrear Terreno" también confunde; propuesta: "Buscar" |
| Pie (todas las pantallas) | Code and analysis written with AI assistance (Claude Code); interface designed with help from Google Stitch. | Agregar al final: "Logo generated with AI (Gemini) · AI-generated". En español: "Logotipo generado con IA (Gemini) · AI-generated" | `web/js/textos.js`, clave `html.ia`, y `agricola.js` (Diego). Lo pide la regla 6 y la §7 de la especificación |
| Inicio, etiqueta de la prueba estadística | Test | Statistical test | `textos.js`, `home.dPrueba` (Diego). "Test" se confunde con "TEST DATA" |
| Inicio, encabezado de tendencias | TRENDS 2001–2026 · NASA | TRENDS SINCE 2001 · NASA DATA | `textos.js`, `home.tend` (Diego). Calor termina en 2021 y Agua empieza en 2003; "· NASA" a secas puede leerse como un sello de la NASA |
| Ficha de calor, medias por década | 2021-2021 | 2021 | `web/js/app.js` (Diego): si la década tiene un solo año, mostrar solo el año |

## P2: lenguaje sencillo y consistencia

**Nota de calor** (`analisis/exportar.py`, campo `limitacion_en`; dueño: Luca). Hoy es un párrafo largo y técnico. Propuesta, con las mismas cifras:

> Surface temperature (ground and roofs), not air temperature. Missing values and cloudy readings are removed. Air temperature (NASA POWER, ~50 km reanalysis) does rise: +1.47 °C in 2001–2025. The two measure different things, and we have not explained the difference. The period ends in 2021 on purpose: since 2022, the Terra satellite has been passing over earlier each year (average local time moved from 10:48 to 9:12 by 2026, from the Day_view_time field of MOD11A2). The ground is measured before it warms up, so the series drops artificially. This is the most likely reason, but we have not proven it explains the whole drop.

(10.8 h = 10:48 y 9.2 h = 9:12. Solo cambia el formato, no la cifra.)

| Dónde | Hoy | Propuesta | Archivo (dueño) |
|---|---|---|---|
| Agua, Inicio | **REGIONAL** trend of total stored water… | Regional trend of total stored water… (negrita, no mayúsculas) | `exportar.py` (Luca) |
| Inicio, valor p | P < 0.001 · P = 0.004 | p < 0.001 · p = 0.004 (como en la Ficha: "p-value"). El texto ya es "p"; la mayúscula la pone `text-transform: uppercase` | `web/css/home.css` (Diego): quitar `uppercase` en ese elemento |
| Ficha, texto alternativo de la gráfica | Line chart of **Heat** from 2001… | Line chart of **heat** from 2001… (minúscula a media frase) | `textos.js`, `fic.graf` (Diego) |
| Nombre de la pantalla 3 | Details / "See the heat page" / "indicator page" / "its page" | Usar siempre "details": "See heat details", "See details", "See its details" | `textos.js`: `mapa.verFicha`, `home.verFichaDe`, `mapa.regional`, `mapa.piePrueba` (Diego) |
| Ficha | Download date: | Downloaded on: | `textos.js`, `fic.descarga` (Diego) |
| Ficha | Yearly series | Year by year | `textos.js`, `fic.serie` (Diego) |
| Lluvia | "Rain" en tarjetas y pestañas, "rainfall" en el subtítulo | Elegir uno; propuesta: "rain" en todo | `textos.js`, `ini.lead` y `home.sub` (Diego) |
| Fechas | "2026-11-14", "Apr 20, 2025", "14 Nov 2026", "31 Oct 2026" | Formato de EE. UU. en todo: "Nov 14, 2026" | `home.js` y `agricola.json` (Diego) |
| Agrícola, buscador | Search locality | Search a town | `agricola.js` (Diego) |
| Agrícola, leyenda | NDVI index · Low · Rises | NDVI (vegetation index) · Falls · Rises | `armar_agricola.py` → `agricola.json` (Diego) |
| Agrícola, leyenda | 6 team zones (zonas.geojson) | The team's 6 zones | `armar_agricola.py` (Diego). No mostrar nombres de archivo |
| Agrícola, sequía | Drought Monitor: La Paz no category recorded as of 31 Oct 2026 | Drought Monitor: no drought category for La Paz as of Oct 31, 2026 | `armar_agricola.py` (Diego) |
| Agrícola, Chametla | 3,054 inhabitants | 3,054 residents | `armar_agricola.py` (Diego) |
| Pie de Agrícola | …with NASA open data · La Paz, B.C.S. | …using NASA open data · La Paz, Baja California Sur (igual que Inicio) | `agricola.js` (Diego) |

## Lo que está bien y no hay que tocar

- El aviso "We show what changed, not why. A trend does not prove the cause." aparece en Inicio y en la Ficha.
- "Clear trend (statistically significant)" / "No clear trend" y la explicación del p-valor y alfa son claras para el público.
- Los consejos de Acciones (CDC y EPA) son frases cortas y en imperativo, y no inventan cifras.
- El botón de idioma conserva la ruta (`#ficha/calor`) al cambiar y lleva `lang` y `hreflang` correctos.

## Cómo se revisó

Script en el navegador sobre la web servida de `origin/dev`: recorre las 8 rutas con `?lang=en`, junta el texto visible y los atributos `alt`, `aria-label`, `placeholder` y `title`, y marca los que tienen palabras o acentos del español, quitando nombres propios (La Paz, Chametla, SIAP, etc.). Después se leyó a mano todo el texto de Inicio, la Ficha de calor y Agrícola, y el diccionario `web/js/textos.js` completo.
