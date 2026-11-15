# Handoff — Programador B

## Hecho

- Web en `web/` (HTML + CSS + JS sin build; Leaflet 1.9.4): 4 pantallas Inicio, Mapa, Ficha y Acciones, navegación por hash. Publicada en Pages (responde 200), aún con datos de prueba hasta que `dev` llegue a `main`.
- **Datos reales conectados** (rama `prog-b/datos-reales`, PR a `dev`): `web/data/indicadores.json` es la salida de Luca (NASA POWER): calor +1.47 °C, tendencia clara; lluvia "Sin cambio claro"; vegetación y agua "Sin datos (pendiente)" con su limitación.
- Issue #36: "Sin cambio claro" sin cifra cuando `significativo: false`; "Fuente: pendiente" cuando falta fuente; franja "DATOS DE PRUEBA" en el Mapa porque `zonas.geojson` sigue siendo sintético (popup, lista y pie lo dicen).
- Reglas de presentación en `web/js/reglas.js`; pruebas con `node --test "web/tests/*.test.mjs"` (12 pass), incluido un validador del contrato.
- Probado a 360×740 claro y oscuro: 7 vistas sin errores de consola, sin "null" y sin scroll horizontal.

- PR #54 (fusionado): vegetación real (−0.019 NDVI, MODIS MOD13Q1) y nota de límite bajo la cifra de calor.
- Issue #9: mapa real. `web/data/zonas.geojson` es copia sin BOM de `data/salida/zonas.geojson` (Luca): 6 píxeles MODIS de 1 km (Centro, Chametla, El Centenario, Oriente, Sur, Surponiente), `datos_de_prueba: false`, así que ya no sale la franja. Vegetación muestra cifra y color en las 4 zonas con tendencia clara. Calor (superficie) muestra "Sin cambio claro" sin cifra en todas, por decisión de Investigación (`docs/investigacion/hallazgos.md`: la baja por zona depende de la prueba). Lluvia y agua: escala regional. Con la nota de Carlos (revisión del PR #57) bajo la lista de calor.
- Salida nueva de Luca copiada a `web/data/indicadores.json`: calor = superficie MODIS "Sin cambio claro" (p = 0.11) con nota que dice que el aire sí sube +1.47 °C; agua real GRACE +1.36 cm (2002-2026, tendencia clara, regional). La ficha dice "Cambio total desde" el primer año del periodo.

- PR #57 fusionado y `dev` → `main` (PR #64).
- Pantallas de Figma (rama `prog-b/figma-pantallas`). Plan en `docs/handoffs/prog-b-plan-figma-2026-11-14.md`.
  - **Home** (`web/js/home.js`, `web/css/home.css`): reemplaza Inicio con el diseño de Figma y solo datos de `indicadores.json`. Se quitaron las temperaturas en vivo, el radar dBZ, GOES-18 y los avisos, que eran ficticios.
  - **Imagen:** MODIS Terra de NASA GIBS (CC0), en `web/img/` con su `FUENTES.md`.
  - **Earth Engine:** script `web/tools/gee_imagen_bcs.py` para un compuesto MCD43A4. Requiere cuenta y no se ha corrido.
- **Login y Register:** por el issue #73, se sacaron del PR #69 y pasaron a la rama `prog-b/login` (PR #77, en borrador). Corte: domingo 15 nov, 09:00.
- PR #69 (Home e imagen NASA) fusionado en `dev`.
- **Issue #78** (rama `prog-b/sin-datos-prueba`):
  - Se quitaron los textos "DATOS DE PRUEBA" de `web/README.md` y del HTML. La franja la escribe el JS y solo sale si `datos_de_prueba` es true.
  - En el mapa, el título dice "Zonas:" en lugar de "Zonas con más cambio:" cuando ninguna zona tiene una tendencia clara (pasa con calor).
  - Revisión a 360 px: Inicio, las 4 fichas, Mapa (6 polígonos) y Acciones, sin null, sin scroll horizontal, sin errores de consola y sin franja. Calor aparece como "Sin cambio claro" y agua aparece como regional.
- **Mapa Agrícola** (rama `prog-b/mapa-agricola`, ruta `#agricola`): diseño de Figma con 4 fichas (Factibilidad y Cultivos, Clima y Agua, Salud del Suelo, Riesgos y Sanidad). Al hacer clic, la ficha se expande y oculta las demás; "✕ Cerrar", Esc o el botón atrás la regresan a la lista de fichas.
  - **Datos:** `web/data/agricola.json` lo arma `web/tools/armar_agricola.py`, con caché en `data/cache/agricola/`. Fuentes y cifras:
    - SIAP, cierre agrícola 2025, municipio de La Paz: 3,879.6 ha, 100 % riego.
    - CONAGUA, DOF 09/11/2023: disponibilidad de 4 acuíferos.
    - NASA POWER: clima.
    - ISRIC SoilGrids (CC BY 4.0): suelo.
    - SMN: Monitor de Sequía.
    - DOF 2018: zona libre de moscas de la fruta.
    - Perfil Estatal de Riesgos BCS 2025: ciclones.
    - GeoNames (CC BY 4.0): coordenadas.
  - **Quitado de Figma por no ser verificable:** "Viabilidad %", "ÓPTIMO", temperaturas en vivo, "Iniciar simulación", flujo de viento, PDF y calendarios de siembra.
  - **Discrepancia sin resolver:** para el acuífero La Paz 0324, el DOF 09/11/2023 da −13.49 hm³/año y el DOF del 17/08/2023 da un déficit de 27.83 hm³/año. No se sabe cuál rige y la ficha lo dice.
  - **Fuentes registradas** en `docs/RECURSOS.md` y `docs/entrega/07` (SIAP, CONAGUA/DOF, NASA POWER, SoilGrids, GeoNames, SMN, SEPADA, Salud BCS). Las licencias de los datos del gobierno de México quedan "por confirmar; solo se citan".
- **Issue #78, auditoría de Carlos** (rama `prog-b/issue-78`, PR #89):
  - **Método por ficha:** cada ficha explica su propio método según `significancia.metodo`. Calor y vegetación usan la prueba estacional; lluvia, el total anual; agua, la corrección por autocorrelación. La función es `RB.explicaMetodo` en `reglas.js` y tiene prueba.
  - **Aviso de IA:** está en el pie general y en el pie de la Home: "Código y análisis escritos con ayuda de IA (Claude Code); interfaz diseñada con ayuda de Google Stitch". Ambas herramientas están declaradas en `docs/RECURSOS.md`.
  - **Datos nuevos copiados una sola vez** (punto 4 de la cola de `docs/PLAN-CIERRE.md`): `web/data/{indicadores.json,zonas.geojson,zonas_tendencias.json}` son copia exacta de `data/salida/` (una prueba nueva lo exige). Calor +0.935 °C 2001-2021 (p < 0.001); vegetación −0.013 NDVI 2001-2026 (p = 0.004).
  - **Calor por zona con cifra:** se quitó el "sin cifra"; 4 zonas con tendencia clara (Chametla +1.50, Oriente +1.10, Centro +1.09, Surponiente +0.897 °C) y 2 sin cambio claro (Sur, El Centenario), con nota del corte en 2021.
  - **Arreglos:** el pie del mapa toma el periodo de cada capa (vegetación decía 2001–2021, que es el de calor); la conclusión de la ficha mostraba "p = 0.00" en vegetación por redondear a 2 decimales, ahora usa 3 como el resto; la Home dice "p < 0.001" en vez de "p = < 0.001".
- **Issue #93, versión en inglés** (rama `prog-b/ingles`):
  - `web/js/textos.js`: diccionario ES/EN en un solo archivo. `RBT.t(clave)` da los textos de la interfaz y `RBT.d(obj, campo)` usa `campo_en` de los datos de Luca. Lo usan `app.js`, `home.js` y `reglas.js`; los textos fijos de `index.html` llevan `data-t`.
  - **Cómo se elige el idioma:** `?lang=en` abre en inglés; sin parámetro, en español. El idioma del navegador no cuenta. `<html lang>` cambia. El botón "English / Español" de la cabecera conserva la pantalla (el hash).
  - **Probado a 360 px con `?lang=en`:** Inicio, Mapa, las 4 fichas y Acciones, sin líneas en español, sin scroll horizontal y sin null. Pruebas en `web/tests/textos.test.mjs`.
  - **Arreglo de paso:** la barra inferior tenía 4 columnas para 5 enlaces y "Acciones" caía a otra fila; ahora tiene 5.
  - **Mapa Agrícola en inglés:** `agricola.js` tiene su propio diccionario y lee los campos `*_en` que ahora escribe `armar_agricola.py`. Al JSON solo se le agregaron campos `_en` (comprobado quitándolos y comparando con `dev`); lo tradujo un subagente Sonnet y lo revisé.
  - **Resumen de la ficha Clima corregido:** decía calor "sin cambio claro" y vegetación −0.019 (2001-2025), con los datos de antes. Ahora sale de `indicadores.json` vigente (+0.94 °C 2001-2021; −0.013 NDVI 2001-2026), con la función `dictamen_indicadores` y una prueba que lo exige.
  - **Falta:** que Ehileen y Roberto revisen el inglés (#93) y probar el login en inglés cuando entre el #77.

## En curso

- PR #77 (`prog-b/login`): faltan el propósito de la cuenta, el proyecto de Supabase, el canal de borrado y la prueba en celular.

## Falta

- **#78-1:** integrar las 2 pantallas de UI/UX cuando Ehileen y Roberto las entreguen (#11 no tiene entregas todavía).
- **#78-4 y #71:** probar en un celular real con Carlos y Roberto.
- **Login (#73):**
  - Definir para qué sirve la cuenta.
  - Crear el proyecto de Supabase con confirmación de correo y límites de tasa.
  - Definir un canal para pedir el borrado de una cuenta.
- **Textos de relleno de Register** y logotipo: Ehileen (#11, #12).

- Que Carlos fusione `dev` → `main`; luego comprobar la URL pública sin sesión.
- Si Investigación cambia la prueba para la superficie por zona, quitar `sinCifra` de `CAPA_ZONA.calor` en `web/js/app.js`.
- `p_valor: 0.0` en NDVI de Chametla (regla 4 del Anexo); la web muestra "p < 0.001".
- Caso no cubierto: `significativo: null` con `cambio_total` con valor mostraría la cifra con "Sin calcular" (hoy no ocurre en los datos).

## Bloqueos

- Ninguno técnico. Publicar depende de la fusión a `main` (Líder).

## Para otros roles

- **Luca (Prog. A):** pendientes del Anexo comentados en #7: `p_valor` de calor en 0.0, lluvia con total anual, BOM en el JSON. Validador: `node --test "web/tests/*.test.mjs"`.
- **Ehileen (UI/UX):** colores como tokens en `:root` de `web/css/estilos.css`; logotipo e íconos en `web/assets/`.
- **Carlos (Líder):** URL de Pages: <https://ingidscarlosdanc21.github.io/radar-BCS/>. Plan del bloque en `docs/handoffs/prog-b-plan-2026-11-14.md`.

## Cómo probar

```
python -m http.server -d web 8000
# abrir http://localhost:8000
node --test "web/tests/*.test.mjs"
```

---

## 2026-11-14

- Entorno del repo configurado.
- Web base con 4 pantallas y datos de prueba; contrato de datos propuesto.
- Tarde: datos reales de NASA POWER conectados e issue #36 resuelto.
- Noche: vegetación real (PR #54) y tendencias reales por punto en el Mapa (issue #9).

## 2026-11-14 (noche): AVISO de Carlos sobre el login con Supabase (leer antes de seguir)

Carlos pidió dejar esto por escrito. El detalle completo y la lista de condiciones están en el issue #73; resumen:

- **El login es opcional.** Las 4 pantallas funcionan sin cuenta; el jurado y la demo entran sin cuenta. Si lo vuelves obligatorio, avisa a Carlos antes (cambia el relato "sin cuenta").
- **Solo Supabase Auth con correo y contraseña.** No pidas nada más (nombre, edad, teléfono, foto). Row Level Security en cualquier tabla. **Nunca** `service_role` ni claves en el repo (es público); usa `.env`.
- **Aviso en el sitio:** qué se guarda (solo el correo), para mayores de 18, cómo borrar la cuenta.
- **Registra Supabase** en `docs/RECURSOS.md` y en `docs/entrega/04-project-details.md`, y arregla ahí la frase "needs no account".
- **Rama `prog-b/login`, PR a `dev`.** **Hora de corte: domingo 15 nov, 09:00:** si no está probado (con y sin sesión, 360 px y celular real, issue #71) y opcional, no entra a `main`.
- **Prioridad:** 1) integrar la interfaz de UI/UX, 2) probar en celular real (#71), 3) login.

## 2026-11-15: decisión sobre el login (Carlos, por el asistente del Líder)

El PR #77 se cerró sin fusionar: el login con Supabase **no entra a la entrega**. Tu rama `prog-b/login` y el proyecto de Supabase se conservan para después del evento. Motivos en `docs/decisiones.md` (2026-11-15). Tu tiempo ahora: 1) versión en inglés (#93), 2) correcciones a 360 px, 3) integrar logo e íconos. No borres la rama.

## 2026-11-15: issue #96 (cierre de la noche)

Hecho, un PR por tarea, todos hacia `dev`:
- **#115, calor por zona orientativo (opción B):** la nota de Carlos (Aqua no confirma) va arriba de la lista, junto al mapa; título "Zonas: superficie, Terra (orientativo)"; ninguna zona dice "tendencia clara"; el periodo del mapa sale de `zonas.geojson` (2001-2021). La leyenda separa "sin cambio claro" de "sin datos". ES y EN. Conviene fusionarlo junto con el PR de Luca que pasa la ficha de calor al aire.
- **#116, 360 px (reporte de Ehileen):** se quitó el scroll de la ficha de lluvia (la URL cruda pasa a "Abrir la fuente (dominio)"). Letra mínima de 12 px y toques de 44 px (zoom de los dos mapas, enlaces de fuente, "Saltar"). La unidad de "Media por década" ya no se parte.
- **#121, logo e íconos:** logo en la cabecera con la marca "AI-generated" como texto legible al lado, `alt` en ES/EN y aviso de IA en el pie. Íconos Material Symbols en las tarjetas de Inicio y en el título de la ficha.

- **#122, esqueleto de carga:** bloques con el alto de cada pantalla mientras llegan los JSON (también `agricola.json`); `aria-hidden` en los bloques y `role=status` con el texto de carga; quieto con `prefers-reduced-motion`; el error de carga lo sigue reemplazando.

Los cuatro se fusionan sin choques entre sí (comprobado con `git merge-tree`). Pruebas de `web/tests` en verde en cada rama. `verificar-todo.ps1`: pasa todo menos el pytest de `analisis`, porque pytest no está instalado en mi máquina (no toqué `analisis/`).

Falta:
- Que Carlos actualice la fila del logo en `docs/entrega/07`: la marca es texto junto al logo, no el PNG con la etiqueta.
- Teléfono real (#71) y contraste medido con herramienta.
- P2 del reporte que no hice: chips de la ficha en una fila y `<details>` para el método.

## 2026-11-15: bloque autónomo #119 (reglas del #117)

| Tarea | PR | Estado |
|---|---|---|
| D1 360 px | #116 (actualizado) | Abierto. Sin scroll a 360 px en ES/EN (5 pantallas y 4 fichas de Agro); toques de 44 px, también el buscador y los marcadores de Agro |
| D2 logo e íconos | #121 (actualizado) | Abierto. Logo de 44 px desde 400 px; las 4 fichas de Agro con sus íconos `agricultura-*`; lista de archivos usados en el PR para `docs/entrega/07` y `05` |
| D3 idioma y vista previa | #125 | Abierto. `description` y `og:*` en ES/EN; la vista previa real sale en español porque los rastreadores no corren JS |
| D4 auditoría de Luca | #130 | **Listo para revisión del Líder** (toca `web/data/agricola.json`). Correcciones 2, 3 y 5 aplicadas; la 1 sale sola al regenerar cuando entre el calor del aire |
| D5 esqueleto | #122 (actualizado) | Abierto. `aria-busy` en `<main>` y prueba del estado de error con el `app.js` real |
| D6 accesibilidad | #131 | Abierto. "Saltar al contenido" mandaba a Inicio (arreglado); anuncio de pantalla; foco visible; contraste AA en modo claro y oscuro |
| D7 matriz | comentario en #85, issue #132 | `dev` falla solo en lluvia a 360 y 390 px (lo arregla #116); la suma de mis PRs pasa |
| D8 revisión | #123 (Ehileen) | Revisado y en verde; **no lo fusioné**, mi sesión no tiene permiso |

Los 6 PRs se fusionan entre sí sin choques (62 pruebas en la suma). `verificar-todo.ps1` pasa completo en cada rama, con un `uv venv` en `.venv` (ignorado por git).

Pendiente de personas: fusionar los PRs (no fusiono los míos), regenerar `agricola.json` cuando entre el calor del aire de Luca, teléfono real (#71), lector de pantalla real y vista previa al compartir.

## Clima: pantalla #clima (2026-11-15, rama prog-b/clima, depende de prog-a/clima-datos)
- Qué hice: `web/js/clima.js` y `web/css/clima.css`; mapa de 8 pueblos con chips (General, Calor, Viento, UV, Humedad), buscador, 4 tarjetas (calor, UV, viento y mar, humedad y lluvia) y detalle al elegir una (`#clima/calor|uv|viento|lluvia`) con cifras, curva de 24 h, consejos y fuente. Menú: Clima en la barra y Avisos pasó a "Más".
- Datos: Open-Meteo (modelo, no estaciones) vía `RBVivo.cargar({clima:true})`; sin etiqueta de calor.
- Probar: `python -m http.server 8777` en `web/` y abrir `#clima`; `node --test web/tests/`.
- Falta: confirmar unidad y dirección de la corriente (se muestra km/h y grados); revisión visual de Ehileen; el servidor de red del equipo debe servir esta rama.

## 2026-11-15: mapa de zonas con íconos y búsqueda (rama `prog-b/mapa-iconos`)

- **Hecho:** cada zona lleva un marcador con ícono en su centro (calor: llama ▲ si sube con tendencia clara, copo ▼ si baja; vegetación: pasto ▲/▼; guion si no hay cambio claro; "?" sin datos). El polígono se conserva: es la huella del píxel MODIS de 1 km. Barra de búsqueda "Colonia, C.P. o calle" (Nominatim/OpenStreetMap, solo al enviar), botón "Mi ubicación" y tarjeta que dice en qué zona cae el lugar, cuánto cambió, periodo y fuente de la capa; fuera de las 6 zonas lo dice. Búsqueda por nombre de zona también.
- **Archivos:** `web/js/zonas-busqueda.js`, `web/css/zonas-busqueda.css`, `web/tests/zonas-busqueda.test.mjs` (nuevos); `app.js` e `index.html` (cambios chicos).
- **Medido:** 360 y 1280 px (ES y EN) sin scroll horizontal, 6 marcadores, sin textos menores de 12 px, sin errores; vegetación cambia los íconos y lluvia no muestra marcadores (no hay dato por zona).
- **No verificado:** teléfono real (#71), lector de pantalla real, modo oscuro, "Mi ubicación" (necesita permiso del navegador; solo se probó que el botón existe). Las 8 imágenes de la carpeta de Drive no se usaron: son PNG de origen y licencia sin confirmar; se usaron los glifos Material Symbols que ya están en `web/assets/iconos/mapa`. Ehileen puede entregar SVG propios.
- **Límites:** el código postal solo aparece si Nominatim lo trae en el nombre; no se inventa. El centro de La Paz (24.1423, -110.3132) queda fuera de las 6 zonas con dato.

## 2026-11-15: fichas expandibles del Mapa Pesquero (rama `prog-b/pesca-fichas`)

- **Hecho:** los 4 mosaicos de Pesca pasan a fichas como las del Mapa Agrícola (mismas clases `.ag-*`, mismo formato): al abrir una se ocultan las otras 3 y ocupa todo el ancho; cabecera con ícono, lectura del modelo (no oficial), tarjetas con cifras, pendientes, fuentes y Cerrar (arriba, abajo y con Escape).
- **Datos:** solo Open-Meteo (modelo) y NASA GIBS; reglas de `reglas-mar.js`. Lo del Figma sin fuente abierta (bandera, frecuencias, teléfonos, tallas, mareas, ANP) aparece como "Pendiente (sin fuente verificada)". Issue de datos para Luca: #190.
- **Archivos:** `web/js/pesca.js`, `web/css/pesca.css`, `web/tests/pesca-avisos.test.mjs`; plan en `docs/handoffs/prog-b-plan-pesca-2026-11-15.md`.
- **Medido:** 160 pruebas pasan; verificar-todo OK; 360 y 1280 px sin scroll horizontal, 0 textos menores de 12 px, foco al título al abrir y al botón al cerrar.
- **Diferencia con Agrícola:** la ficha abierta no cambia la URL (`#pesca/<id>`), para no recrear el mapa con el router.
- **Lluvia y agua por zona:** #189 (Luca) sigue abierto y no exporta nada a `data/`; la tabla de zonas no cambia hasta que haya dato por zona.
- **No verificado:** teléfono real (#71), lector de pantalla real, modo oscuro de las fichas.
