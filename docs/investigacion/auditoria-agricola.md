# Auditoría de fuentes del Mapa Agrícola (`web/data/agricola.json`)

Auditor: Luca (Prog. A), con ayuda de Claude (IA). Fecha: 2026-11-15. Condición de Carlos para que el Mapa Agrícola entre a `main` (`docs/decisiones.md`, 2026-11-14), PR #88 y PR #85.

**Veredicto: NO PASA todavía.** Todo lo que pude abrir coincide con su fuente. Quedan 3 correcciones en la web y 2 fuentes sin comprobar (SIAP y SEPADA: sus servidores no respondieron desde mi conexión). Cuando Diego corrija y el SIAP se confirme, el veredicto pasa a "pasa".

## Cómo se verificó

Cada cifra se comparó con la fuente que declara la ficha, abierta el 2026-11-15: PDF de CONAGUA y DOF leídos como texto, consulta directa a la API de SoilGrids, páginas de GeoNames, el xlsx del Monitor de Sequía y el PDF del Perfil Estatal. "Coincide" significa que el valor del JSON es igual al de la fuente, con el redondeo de la ficha. Ninguna ficha dice "por culpa de…": no hay causalidad.

## Tabla de cifras

### Ficha Factibilidad y Cultivos (SIAP, cierre agrícola 2025, municipio de La Paz)

| Cifra | Fuente declarada | Enlace | ¿Coincide? |
|---|---|---|---|
| 3,879.6 ha sembradas; 100 % riego; ciclos OI 2,424.5 / PV 424.3 / perennes 1,030.8 ha | SIAP, cierre 2025 | `nube.agricultura.gob.mx/datosAbiertos/Agricola.php` | **No verificada**: el servidor no respondió (sin respuesta tras 25 s y tras 500 s). La suma interna cuadra (2,424.5 + 424.3 + 1,030.8 = 3,879.6) |
| 8 cultivos suman 2,620.5 ha (68 %); valor $1,210.0 millones MXN | SIAP | igual | **No verificada**; la suma interna cuadra (2,620.5 / 3,879.6 = 67.5 %, la ficha redondea a 68 %) |
| Tomate 902.5 ha, chile 742.0 ha, mango 344.0 / 231.5 ha, albahaca y demás tarjetas | SIAP | igual | **No verificada** (mismo motivo) |

### Ficha Clima y Agua

| Cifra | Fuente | Enlace | ¿Coincide? |
|---|---|---|---|
| T2M 24.71 °C, lluvia 0.72 mm/día, radiación 20.87, humedad 59.79 %, viento 2.71 m/s y meses extremos | NASA POWER, climatología 2001-2025 (API v2.10.1) | `power.larc.nasa.gov` (responde) | Coincide (auditoría del 2026-11-14). La climatología (24.71 °C, 0.72 mm/día) difiere de nuestra serie mensual (24.79, 0.76); la ficha ya lo dice |
| Lluvia anual ≈ 262.8 mm (ANN × 365) | derivada de la anterior | — | Aritmética correcta (0.72 × 365); está marcada como estimación |
| Resumen de los 4 indicadores (calor +0.94 °C 2001-2021, vegetación −0.013, lluvia p = 0.129, agua +1.36 cm) | `web/data/indicadores.json`; GRACE: PO.DAAC DOI 10.5067/TEMSC-3JC634 (responde) | — | Coincidía con `data/salida` hasta la opción B. **Falla ahora**: el calor es el del aire, +1.47 °C en 2001-2025 (ver Correcciones) |
| El Carrizal (0322): R 14.2, DNC 0.0, DMA +0.71 hm³/año; «713,376 m3» | CONAGUA, DOF 09/11/2023 y ficha DR_0322 | `dof.gob.mx/nota_detalle.php?codigo=5708074` (responde); `sigagis.conagua.gob.mx/.../DR_0322.pdf` (responde) | Coincide. La ficha: 14.2 − 0.0 − 13.486624 = 0.713376 |
| Los Planes (0323): R 10.8, DNC 0.2, DMA −2.34 hm³/año; déficit «2'337,757 m3» | DOF 09/11/2023 y DR_0323 | igual | Coincide. El PDF escribe −2.337570 hm³ en la cuenta y 2'337,757 m³ en la frase: error de la propia fuente; la ficha cita la frase tal cual |
| La Paz (0324): R 21.0, DNC 0.0, DMA −13.49 hm³/año | DOF 09/11/2023 | igual | Coincide: déficit −13.488404 (corte 30-dic-2022). Ver la precisión sobre «extracción» en Correcciones |
| La Paz (0324), segundo déficit 27.83 hm³/año (corte 30-sep-2021) | DOF 17/08/2023, acuerdo específico | `dof.gob.mx/nota_detalle.php?codigo=5698953` | Coincide: 27.827320 millones de m³ anuales |
| «Los Planes cae en una celda casi idéntica: 13 de 78 valores difieren, máximo 0.75» | cálculo del equipo con POWER | — | **No verificada** (cálculo propio de Diego; no repetí la consulta) |

### Ficha Salud del Suelo (ISRIC SoilGrids 2.0)

| Cifra | Fuente | ¿Coincide? |
|---|---|---|
| Los Planes 0-5 cm: pH 8.0; arena/limo/arcilla 55.8 / 31.8 / 12.4 % | API `rest.isric.org` (consulta directa, valor medio) | Coincide (pH 80/10; 558, 318 y 124 g/kg) |
| El Centenario 0-5 cm: pH 7.9; 53.7 / 31.3 / 14.9 % | igual | Coincide (79; 537, 313 y 149) |
| El Carrizal 0-5 cm: pH 8.0; 66.7 / 20.5 / 12.7 % | igual | **No verificada**: la API no respondió para ese punto (sí para los otros dos) |
| Carbono orgánico, nitrógeno, CIC y perfil 5-60 cm de Los Planes | igual | No verificadas una por una (solo pedí pH y textura) |
| Clase «franco arenoso» (3 localidades) | derivada con el triángulo USDA | Correcta con los porcentajes de la ficha. El Centenario queda en el borde (53.7 % de arena contra el límite de 52 %); la ficha ya la llama «derivada» |
| Licencia CC BY 4.0 | ISRIC | No la verifiqué en el sitio de ISRIC en esta pasada |

### Ficha Riesgos y Sanidad

| Cifra | Fuente | Enlace | ¿Coincide? |
|---|---|---|---|
| Monitor de Sequía, La Paz (03003): sin categoría al 31 oct 2026; última categoría D0 (30 jun a 31 ago 2026) | SMN-CONAGUA, `MunicipiosSequia.xlsx` | `smn.conagua.gob.mx/tools/RESOURCES/Monitor de Sequia en Mexico/MunicipiosSequia.xlsx` (responde, 2.1 MB) | Coincide: D0 en los 5 cortes del 30-jun al 31-ago-2026; celdas vacías hasta el corte del 31-oct-2026. La celda vacía no significa «sin sequía» y la ficha lo dice |
| Zona libre de moscas de la fruta: Baja California y BCS, declaratoria original DOF 26/02/1998 | DOF 05/10/2018 | `dof.gob.mx/nota_detalle.php?codigo=5540162` (responde) | Coincide (el acuerdo de 2018 abroga la de 1998; la ficha la cita como «original») |
| 4 de 5 municipios de BCS con riesgo «muy alto» de ciclones; temporada 15 may - 30 nov en el Pacífico | Perfil Estatal de Riesgos BCS 2025 | `ssbcs.gob.mx/pdf/2025/vigilancia/Perfil_Estatal_de_Riesgos_BCS_2025.pdf` (responde) | Coincide (texto literal del PDF). La ficha no afirma el grado de La Paz |
| Brotes en La Paz y Los Cabos en 2023; cita «Baja California Sur mantiene su estatus…» | SEPADA BCS, 11/08/2023 | `sepada.bcs.gob.mx/...` | **No verificada**: la página no respondió desde mi conexión |

### Localidades (GeoNames, CC BY 4.0)

| Cifra | ¿Coincide? |
|---|---|
| Coordenadas de Los Planes (3997291), El Carrizal (4010618), El Centenario (8858277) y Chametla (4022333) | Coinciden con las páginas de GeoNames; las 4 están en el municipio de La Paz. GeoNames registra Los Planes como «San Juan de los Planes», como dice la ficha |
| Chametla «3,054 habitantes (INEGI 2020)» | **No verificada**: GeoNames da 2,178; la ficha cita INEGI y no abrí esa fuente |

## Discrepancia del acuífero La Paz (0324)

Hay dos publicaciones oficiales con cifras distintas:

| Publicación | Corte de volúmenes | Resultado |
|---|---|---|
| DOF 17/08/2023, acuerdo específico del acuífero | 30-sep-2021 | Déficit 27.827320 hm³/año (VEAS 29.478300; 6.15002 pendientes de titulación) |
| DOF 09/11/2023, actualización de 653 acuíferos | 30-dic-2022 | DMA 0, déficit −13.488404 hm³/año |

**Cuál rige:** no puedo afirmarlo con lo que pude leer. Lo verificable es que la del 09/11/2023 es más reciente y tiene el corte más reciente, y se presenta como una actualización de la disponibilidad; no pude leer sus artículos transitorios para ver si sustituye el acuerdo de agosto. Los dos números usan cortes y métodos distintos.

**Redacción que puede usar la web (solo lo verificado):** conservar las dos cifras con su corte, sin decir cuál rige. La nota actual ya lo hace; basta añadir los cortes: «La tabla del DOF 09/11/2023 (corte 30-dic-2022) da un déficit de 13.49 hm³/año; el acuerdo específico del DOF 17/08/2023 (corte 30-sep-2021) da 27.83 hm³/año. Son publicaciones distintas y no se afirma cuál rige.» En ambas el acuífero queda sin disponibilidad, que es lo que dicen los chips.

## Correcciones para Diego (#119; yo no edito `web/`)

| # | Qué | Corrección exacta |
|---|---|---|
| 1 | **Resumen de Clima desfasado por la opción B.** `fichas[clima].detalle.dictamen.texto` y `descripcion` dicen «Calor: +0.94 °C en 2001-2021 … el calor es temperatura de la superficie, no del aire» | Regenerar `agricola.json` con `data/salida/` de la rama `prog-a/calor-aire` (calor = aire, +1.47 °C, 2001-2025, p < 0.001). Texto sugerido: «Calor: la temperatura del aire (NASA POWER) subió un estimado de +1.47 °C en 2001-2025, estadísticamente significativo (p < 0.001); la temperatura de la superficie vista por satélite no es concluyente.» Y cambiar «el calor es temperatura de la superficie, no del aire» por «el calor es temperatura del aire de un reanálisis de ~50 km». La prueba `agricola.test.mjs` («el resumen de la ficha Clima coincide con indicadores.json») lo comprueba |
| 2 | **Leyenda del NDVI** `mapa.leyenda.titulo`: «CAMBIO DE NDVI 2001–2025» | «CAMBIO DE NDVI 2001–2026» (periodo vigente de la vegetación; 2026 es parcial), y `titulo_en` igual |
| 3 | **Etiqueta «extracción» de los acuíferos.** Las tarjetas dicen «extracción 13.49» (0322), «12.94» (0323) y «34.49» (0324) | Esas cifras son VEAS + VCAS + VEALA de la tabla del DOF (0324: 29.584608 + 4.549032 + 0.354763 = 34.488403), no la columna VEAS sola (29.58). Cambiar «extracción» por «volumen de extracción total» o mostrar la columna VEAS |
| 4 | La línea «Consultado: 14 nov 2026» | Tras regenerar, queda con la fecha de la regeneración |
| 5 | `web/tests/home.test.mjs` fija «Datos generados el 2026-11-14» | `data/salida` trae ahora `generado: 2026-11-15`; leer la fecha de `indicadores.json` en la prueba en lugar de fijarla |

Nota: regenerar `agricola.json` con `web/tools/armar_agricola.py` vuelve a descargar el SIAP; si su servidor sigue caído, usar la caché de Diego o editar solo el texto del Clima.

## Sin números sin origen ni causalidad

Revisé las 4 fichas: cada número tiene fuente y fecha de consulta en `fuentes`; no hay frases de causa; las estimaciones (lluvia anual, clase textural, 68 %) están marcadas como derivadas. Las fichas dicen lo que no se consultó (SENASICA, edafología de INEGI, FIRMS, grado de ciclones de La Paz).

## Lo que falta para pasar a «pasa»

1. Diego aplica las correcciones 1 a 3 y regenera `agricola.json`.
2. Confirmar el SIAP 2025 contra el CSV (cuando el servidor responda) y la página de SEPADA.
3. Opcional: El Carrizal en SoilGrids, la población de Chametla (INEGI) y la licencia de SoilGrids.
