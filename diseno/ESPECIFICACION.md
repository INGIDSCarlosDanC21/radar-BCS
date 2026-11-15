# Especificación de implementación (para Diego, Prog. B)

Fuente: Figma "Radar paceño" (id `ae9KMSMZUexeV0dBhDkNR1`) y `diseno/figma-auditoria.json` (generado 2026-11-15). Autora: Ehileen (UI/UX).
Todo lo que diga **(propuesta)** no está en Figma: es una sugerencia de UI/UX para celular.
Los PNG miden 1296 px de ancho: son frames de 1280 px más ~8 px de margen por lado del export.

## 1. Pantallas

Rutas sugeridas (sugerida = no existe aún; Diego decide el enrutado).

| Pantalla | Sección | PNG | Ruta (sugerida) |
|---|---|---|---|
| Inicio | Inicio | `diseno/pantallas/inicio.png` | `#inicio` |
| Clima - Mapa | Clima | `diseno/pantallas/clima-mapa.png` | `#clima` |
| Clima - Calor y Sensación Térmica | Clima | `diseno/pantallas/clima-calor-y-sensacion-termica.png` | `#clima/calor` |
| Clima - Radiación UV y Exposición Solar | Clima | `diseno/pantallas/clima-radiacion-uv-y-exposicion-solar.png` | `#clima/uv` |
| Clima - Viento, Oleaje y Corrientes | Clima | `diseno/pantallas/clima-viento-oleaje-y-corrientes.png` | `#clima/viento` |
| Clima - Humedad y Lluvia | Clima | `diseno/pantallas/clima-humedad-y-lluvia.png` | `#clima/lluvia` |
| Agricultura - Mapa | Agricultura | `diseno/pantallas/agricultura-mapa.png` | `#agricultura` |
| Agricultura - Factibilidad y Vocación | Agricultura | `diseno/pantallas/agricultura-factibilidad-y-vocacion.png` | `#agricultura/cultivos` |
| Agricultura - Clima y Agua | Agricultura | `diseno/pantallas/agricultura-clima-y-agua.png` | `#agricultura/agua` |
| Agricultura - Salud del Suelo | Agricultura | `diseno/pantallas/agricultura-salud-del-suelo.png` | `#agricultura/suelo` |
| Agricultura - Riesgos y Sanidad | Agricultura | `diseno/pantallas/agricultura-riesgos-y-sanidad.png` | `#agricultura/riesgos` |
| Pesca - Mapa | Pesca | `diseno/pantallas/pesca-mapa.png` | `#pesca` |
| Pesca - Semáforo de Seguridad | Pesca | `diseno/pantallas/pesca-semaforo-de-seguridad.png` | `#pesca/seguridad` |
| Pesca - Condiciones Oceanográficas | Pesca | `diseno/pantallas/pesca-condiciones-oceanograficas.png` | `#pesca/oceano` |
| Pesca - Clima y Atmósfera Costera | Pesca | `diseno/pantallas/pesca-clima-y-atmosfera-costera.png` | `#pesca/atmosfera` |
| Pesca - Potencial y Actividad Pesquera | Pesca | `diseno/pantallas/pesca-potencial-y-actividad-pesquera.png` | `#pesca/potencial` |
| Avisos y Alertas | Avisos y Alertas | `diseno/pantallas/avisos-y-alertas.png` | `#avisos` |
| Inicio de sesión (1440x1024, fuera de la auditoría) | - | `diseno/pantallas/login.png` | `#login` |
| Registro (1440x1024, fuera de la auditoría) | - | `diseno/pantallas/registrar.png` | `#registro` |

Login/registro: el AGENTS.md habla de login opcional con Supabase; confirmar con Carlos si entra en la entrega (POR CONFIRMAR).

Estructura de cada pantalla de subsección (igual en las 12): barra de estado + título + buscador (copia de su pantalla "Mapa") → mapa → botón "Iniciar simulación" → tarjeta de diagnóstico con barra de acento arriba → footer.
El título (x=32) es "Mapa Meteorológico" (Clima), "Mapa Agrícola" (Agricultura) o "Mapa Pesquero" (Pesca). Inicio y Avisos no llevan ese bloque.

## 2. Cuadrícula y componentes

- Marco de escritorio: 1280 px. Margen lateral 32 px, contenido 1216 px (`--rb-margen`, `--rb-ancho-contenido`).
- Fondo de página `#f7f9fc`; tarjetas `#ffffff`.

**Header** ("Header / Navegación principal", 1280x64, fondo `#ffffff` con sombra, PNG `diseno/componentes/header-navegacion-principal.png`)
- Izquierda: logo 156x44 en x=32, y=10 (`web/assets/logo-radar-bcs.png`, imagen exportada a 3x: 470x132).
- Centro: enlaces Inicio, Clima, Agricultura, Pesca, Avisos y Alertas. Manrope 14, color `#44474d`, relleno 4px 16px, radio 8.
- Derecha: "Inicio de sesión" (JetBrains Mono 12, `#000d21`) y botón "Registro" (fondo `#0c2340`, texto blanco, JetBrains Mono 12, redondeado tipo píldora).

**Regla de pestaña activa:** exactamente una por pantalla, la de su sección (confirmado en las 17). Activa = fondo `#0c2340` + texto `#ffffff`. En Inicio es "Inicio"; en cualquier pantalla de Clima, "Clima"; etc. Poner `aria-current="page"` en esa pestaña.

**Footer** ("Footer / Pie de página", 1280x262, PNG `diseno/componentes/footer-pie-de-pagina.png`): descripción de la plataforma, columnas de enlaces y línea "© 2026 RADAR BCS. Todos los derechos reservados." Se coloca 40 px debajo del contenido. Los textos de enlaces (Privacidad, Términos, "Protocolo OGC", "API meteorológica", etc.) son del mockup: confirmar cuáles existen realmente antes de mostrarlos.

**Botón "Iniciar simulación"** (1216x56, ancho completo del contenido, azul marino oscuro, ícono + texto centrados, PNG `diseno/componentes/boton-iniciar-simulacion.png`). Qué hace la simulación: POR CONFIRMAR con el equipo.

## 3. Historia de color por sección

Cada tarjeta de subsección en la pantalla maestra ("Mapa") tiene una barra superior de color; la pantalla de esa subsección usa **el mismo color** en su tarjeta de diagnóstico ("Acento de sección"). Clima: degradado de 6 px; Agricultura y Pesca: sólido de 4 px. Los valores están en `web/assets/tokens.css`.

| Subsección | Acento | Token | Ícono |
|---|---|---|---|
| Clima - Calor y Sensación Térmica | `#fbbf24` a `#d97706` | `--rb-acento-clima-calor` | `web/assets/iconos/clima-calor-y-sensacion-termica.svg` |
| Clima - Radiación UV | `#f97316` a `#dc2626` | `--rb-acento-clima-uv` | `.../clima-radiacion-uv-y-exposicion-solar.svg` |
| Clima - Viento, Oleaje y Corrientes | `#14b8a6` a `#006d3d` | `--rb-acento-clima-viento` | `.../clima-viento-oleaje-y-corrientes.svg` |
| Clima - Humedad y Lluvia | `#60a5fa` a `#0c2340` | `--rb-acento-clima-lluvia` | `.../clima-humedad-y-lluvia.svg` |
| Agricultura - Factibilidad y Cultivos | `#006d3d` | `--rb-acento-agri-cultivos` | `.../agricultura-factibilidad-y-cultivos.svg` |
| Agricultura - Clima y Agua | `#51d8e8` | `--rb-acento-agri-agua` | `.../agricultura-clima-y-agua.svg` |
| Agricultura - Salud del Suelo | `#7ed99e` | `--rb-acento-agri-suelo` | `.../agricultura-salud-del-suelo.svg` |
| Agricultura - Riesgos y Sanidad | `#fbbf24` | `--rb-acento-agri-riesgos` | `.../agricultura-riesgos-y-sanidad.svg` |
| Pesca - Semáforo de Seguridad | `#fbbf24` | `--rb-acento-pesca-seguridad` | `.../pesca-semaforo-de-seguridad.svg` |
| Pesca - Condiciones Oceanográficas | `#1eb8c8` | `--rb-acento-pesca-oceano` | `.../pesca-condiciones-oceanograficas.svg` |
| Pesca - Clima y Atmósfera Costera | `#4b5f7f` | `--rb-acento-pesca-atmosfera` | `.../pesca-clima-y-atmosfera-costera.svg` |
| Pesca - Potencial y Actividad Pesquera | `#006d3d` | `--rb-acento-pesca-potencial` | `.../pesca-potencial-y-actividad-pesquera.svg` |

Nota de nombres: la pantalla se llama "Factibilidad y Vocación", pero el ícono y la tarjeta se llaman "Factibilidad y Cultivos".
Los SVG traen el relleno `#0C2340` fijo; úsalos con `<img>` o inline. No cambian de color con `currentColor`.

## 4. Tipografía (observada en Figma)

Solo 3 fuentes de Google Fonts, licencia SIL OFL 1.1 (registrar en `docs/RECURSOS.md`). `web/index.html` ya las carga.

| Uso | Fuente | Token |
|---|---|---|
| Títulos (H1 "Mapa Meteorológico", títulos de tarjeta, "RADAR BCS") | Space Grotesk | `--rb-fuente-titulo` |
| Texto corrido, menú | Manrope (14 en el menú) | `--rb-fuente-cuerpo` |
| Etiquetas, datos, botones, estados, pie | JetBrains Mono (12 en header) | `--rb-fuente-datos` |

Tamaños de H1 y tarjetas: aproximados en el PNG, no medidos en la auditoría (POR CONFIRMAR en Figma; en el mockup el H1 se ve de unos 44 a 48 px).

## 5. Responsive a 360 px

Figma solo tiene escritorio (1280). Lo siguiente es **(propuesta de UI/UX, no está en Figma)**:
- Header: logo a la izquierda + botón de menú (hamburguesa) a la derecha; el menú se abre como lista vertical con las 5 pestañas, "Inicio de sesión" y "Registro". Alternativa: barra de pestañas con scroll horizontal. Mantener la regla de pestaña activa.
- Márgenes laterales de 16 px en vez de 32; contenido a todo el ancho.
- Tarjetas de diagnóstico: 1 columna (en escritorio son 2).
- Buscador y chips de filtro: chips en una fila con scroll horizontal.
- Botón "Iniciar simulación": ancho completo, alto mínimo 56 px.
- Footer: columnas apiladas.
- Mapa: alto fijo (p. ej. 360 px, propuesta) y controles de zoom grandes.
- Usar `--rb-alto-header` (64 px) para el relleno superior si el header es fijo.

## 6. Accesibilidad

Resultados de contraste (WCAG 2.1, calculados en `diseno/tests/diseno.test.mjs`; texto normal exige 4.5:1):

| Par | Razón | Resultado |
|---|---|---|
| Blanco sobre `#0c2340` (pestaña activa) | 15.79:1 | Pasa |
| `#44474d` sobre `#ffffff` (menú) | 9.32:1 | Pasa |
| `#000d21` sobre `#f7f9fc` (título/fondo) | 18.44:1 | Pasa |
| `#047240` sobre `#97f3b5` (píldora de estado) | 4.53:1 | Pasa por poco; no oscurecer el fondo |
| `#006d3d` sobre `#ffffff` (verde vivo) | 6.45:1 | Pasa |

Sin hallazgos de contraste fallido en estos 5 pares. No se revisaron los demás pares del diseño (por ejemplo, texto naranja/ámbar de etiquetas sobre fondos claros, que en el mockup se ve de bajo contraste): POR REVISAR.

Lista de revisión:
- [ ] Foco visible en enlaces, pestañas y botones (`:focus-visible` con contorno de 2 px de `--rb-marino` o `--rb-verde-vivo`; no quitar `outline`).
- [ ] Pestaña activa con `aria-current="page"`.
- [ ] Logo con `alt="Radar BCS"`.
- [ ] Íconos decorativos con `aria-hidden="true"` (si van junto a un texto) o `alt=""` en `<img>`.
- [ ] No depender solo del color: las barras de acento van acompañadas del título y el ícono; el semáforo de pesca debe llevar texto ("Seguro", "Precaución", etc.).
- [ ] Un solo `<h1>` por pantalla, títulos jerárquicos.
- [ ] Áreas táctiles de al menos 44x44 px en celular.
- [ ] `prefers-reduced-motion` respetado en animaciones.
- [ ] Mapa: alternativa en texto o tabla para lo que muestran los marcadores.
- [ ] Texto de JetBrains Mono de 12 px es pequeño: en celular usar 12 px como mínimo y no por debajo.

## 7. Declaración de IA del logotipo

El logo fue generado con **Gemini** (Google), confirmado por Ehileen el 2026-11-14 y registrado en `docs/RECURSOS.md`, sección IA. Regla del proyecto: marca visible "AI-generated" o mención en el texto del sitio.
Instrucción: en el footer agregar el texto **"Logotipo generado con IA (Gemini) · AI-generated"**.

**Íconos:** los 12 de `web/assets/iconos/` son Google Material Symbols (Apache 2.0; ver `web/assets/iconos/README.md` y `LICENSE-material-symbols.txt`). No hace falta atribución en la web. Si se agrega un ícono de Flaticon, su licencia gratuita exige en la página o en el pie una línea por autor: *"Icon made by [autor] from www.flaticon.com"* ([guía de Flaticon](https://support.flaticon.com/s/article/Attribution-How-when-and-where-FI?language=en_US)).

## 8. Qué NO hacer

- No usar, copiar ni imitar logos o marca de la NASA (ni en mapas, ni en íconos, ni en el footer).
- No dejar las cifras de los PNG: **todas son de ejemplo del mockup** (28°C, 34.5°C Max, "Índice 11+", "18-25 km/h NO", "0% Lluvia", "Actualizado: 13:45 MST", etc.). Usar datos reales con fuente a la vista (regla 1 y 3 de AGENTS.md).
- No dejar textos del mockup que afirmen cosas no verificadas: "ENLACE SATELITAL ACTIVO", "en tiempo real", "Fuente de telemetría: CONAGUA / SMN / Red Radar Costero BCS", "Protocolo OGC", "API meteorológica". Cada uno requiere confirmar que existe o cambiarlo.
- No afirmar causas ("por qué"): solo qué cambió.
- No agregar más fuentes ni colores fuera de `tokens.css`.
- No inventar colores de modo oscuro (pendiente en Figma).
- No editar `diseno/pantallas/*.png` a mano: se regeneran desde Figma (ver `diseno/tools/README.md`).
- No usar imágenes de personas menores de 18.

## 9. Cómo implementarlo (en orden)

1. Leer `AGENTS.md`, esta guía y mirar `diseno/componentes/*.png` y `diseno/pantallas/clima-mapa.png`.
2. Enlazar `web/assets/tokens.css` en `index.html` antes de `estilos.css` y `home.css`. Usar `var(--rb-...)`, no colores sueltos.
3. Confirmar que las 3 fuentes están cargadas (ya lo están en `index.html`).
4. Construir el componente Header: logo, 5 pestañas, regla de pestaña activa con `aria-current="page"`, botones de sesión.
5. Construir el Footer (con la línea de IA del logo) y colocarlo 40 px bajo el contenido.
6. Construir el botón "Iniciar simulación" como componente reutilizable.
7. Pantalla Inicio, luego los 3 mapas maestros (Clima, Agricultura, Pesca) con su bloque de estado + título + buscador.
8. Pantallas de subsección: mismo bloque superior, mapa, botón, tarjeta con barra de acento (tabla de la sección 3) e ícono SVG.
9. Avisos y Alertas; login y registro si Carlos los confirma.
10. Versión móvil de 360 px (sección 5) y revisión con la lista de accesibilidad (sección 6).
11. Reemplazar todos los números de ejemplo por datos reales con fuente.
12. Correr `powershell -File diseno/tools/verificar-diseno.ps1` y `node --test "web/tests/*.test.mjs"`; abrir PR a `dev`.
