> **Nota (2026-11-15): documento histórico; lo que contradiga a `docs/decisiones.md` (2026-11-15) está superado por ese archivo.** Ver la web actual: menú Clima · Pesca · Inicio · Agro · Avisos, 38 lugares en Clima, 19 puertos en Pesca.

# Plan Diego (prog-b), 2026-11-15: lluvia/agua en el mapa de zonas, issue de datos de pesca y fichas de pesca

Estado: solo plan, nada implementado. Skills: rol-ui-ux (la carpeta `equipo/UI/UX` no existe; las skills están en `.claude/skills/`), rol-programador-b, orquestar-barato.
Reglas: sin datos inventados (todo número con fuente o "pendiente"), edito solo `web/`, delegación solo a agentes gratuitos (`scripts/delegar.ps1 -Agente ollama|opencode`, nunca `auto`, sin Codex), no fusiono mis PR.

## Hallazgos verificados hoy

1. **PR #189 (Luca, `prog-a/lluvia-imerg`) sigue ABIERTO, sin revisiones ni merge.** Trae `analisis/imerg.py` y pruebas, pero no exporta nada a `data/`: `data/salida/` solo tiene `indicadores.json`, `zonas.geojson`, `zonas_tendencias.json`. Según su cuerpo: 25 celdas de 0.1° (~10 km), ninguna con tendencia significativa (p 0.11 a 0.44), pendientes de -2 a -4 mm/año, 2025 fuera, "falta contar celdas por zona y exportar".
2. Consecuencia: **no hay dato por zona verificable para lluvia ni agua**. La tabla "Cómo cambió cada zona" se completa **solo si** (a) Carlos fusiona #189 y (b) Luca exporta el conteo de celdas por zona. Hasta entonces lluvia/agua quedan como "pendiente" (hoy ya muestran "sin datos"; no se inventa nada).
3. Pesca hoy (`web/js/pesca.js`): 8 puertos, 4 mosaicos fijos (Estado del mar, Condiciones del mar, Viento costero, Clorofila), datos Open-Meteo Marine (~9 km, modelo, no boyas) y GIBS. No son fichas expandibles.
4. Agro (`web/js/agricola.js`): 4 fichas (`ag-ficha`); al abrir una, las otras 3 se ocultan (`hidden`), la abierta ocupa toda la fila (`.ag-abierta{grid-column:1/-1}`), tiene cabecera, dictamen, grupos de tarjetas, notas, fuentes y botón Cerrar, URL `#agricola/<id>`, foco al título, "atrás" cierra.
5. Figma de pesca (`diseno/pantallas/pesca-*.png`), 4 fichas con la misma estructura: cabecera + chip de estado + dictamen + 4 pilares + protocolos + descarga PDF. Casi todo ese contenido (bandera de Capitanía, frecuencias, teléfonos, tallas, vedas por especie, mareas, boyas SEMAR) **no tiene fuente abierta verificada** (ya lo concluyó `docs/PLAN-PESCA-AVISOS.md`). Por eso se copia la estructura y el formato, no el contenido.

## Fase 1 - Lluvia y agua en la tabla de zonas (bloqueada por #189)

- Hacer seguimiento: pedir a Carlos que revise #189 y a Luca el conteo de celdas por zona y la exportación a `data/salida/` (lo revisa solo Carlos).
- Cuando llegue el dato: `RBZonas.estado()` ya soporta sube/baja/sin/nodato; añadir en `GLIFO` los íconos de lluvia (`water_drop`) y agua; mostrar como "sin cambio claro" (todas p>0.05) con la resolución de ~10 km visible. Agua (GRACE, regional, +1.362 cm, p=0.009435) **no se reparte por zona**: panel regional con una cifra, periodo y fuente, sin ícono sube/baja por zona.
- Mientras tanto: sin cambios. Opcional, con visto bueno de Diego: panel regional de lluvia (POWER, p=0.129, no significativo) y agua.
- Hecho cuando: cada cifra visible trae periodo, fuente y resolución; prueba que una zona sin dato muestra "sin datos"; `node --test` y `scripts/verificar-todo.ps1` en verde.

## Fase 2 - Issue para Luca: datos del mapa pesquero (se abre al aprobar este plan)

Basado en lo que pesca.js ya consume y en lo que las 4 fichas necesitan. Texto propuesto del issue:

**Título:** Datos verificables para las 4 fichas del mapa pesquero (descarga, fuente, licencia)
**Asignado:** luca6874. Nota: lo que toque `data/` lo revisa Carlos.

Qué se pide, ficha por ficha (cada fila: fuente, licencia, resolución, fecha de verificación, o "no existe abierta"):
1. **Estado del mar / seguridad:** umbrales de oleaje y viento ya en `docs/investigacion/umbrales-mar.md`; confirmar qué fuente abierta existe para avisos oficiales (SMN, Protección Civil BCS, Capitanía/SEMAR, NHC `CurrentStorms.json`) y si tienen feed o CORS. Si no hay feed, dejar solo enlace.
2. **Condiciones oceanográficas:** mareas y corrientes por puerto (¿existe tabla abierta de SEMAR/CICESE o NOAA para BCS?), fase lunar (cálculo astronómico verificable), oleaje por componentes (mar de fondo y de viento, Open-Meteo trae `swell_wave_*` y `wind_wave_*`: confirmar variables y disponibilidad por punto).
3. **Clima costero:** presión, visibilidad, probabilidad de lluvia, CAPE, punto de rocío, amanecer y atardecer por puerto (Open-Meteo Forecast, ya integrado en `cielo.js`): confirmar variables, unidades y licencia CC BY 4.0.
4. **Potencial y actividad pesquera:** clorofila-a y temperatura superficial del mar con serie reciente por puerto (NASA GIBS solo da imagen: ¿hay valor numérico en OB.DAAC/ERDDAP?), anomalía de SST respecto a climatología (fuente y periodo base), calendario de vedas de CONAPESCA (solo enlace salvo que haya dato abierto con licencia), tallas mínimas NOM-009-SAG/PESC (texto oficial en DOF, con cita).
5. Entregable: una tabla en `docs/investigacion/` con fuente, URL, licencia y estado (verificado / no disponible), más muestras reales guardadas como fixtures de prueba. Sin inventar: lo que no exista se marca "no disponible".
6. Registro en `docs/RECURSOS.md`; claves solo en `.env`.

## Fase 3 - Fichas de pesca iguales a las de agro

Principio: **misma estructura, mismo formato** (colores por tono `ag-t-*`, tipografías Space Grotesk y JetBrains Mono, tamaños, borde de acento, chip, pie "Ver detalle"); el contenido sale solo de datos verificados.

Diseño:
- Reemplazar los 4 mosaicos por 4 fichas `pe-ficha` con el mismo comportamiento: cerrada = ícono + título + subtítulo + chip + enlace; abierta = ocupa todo el ancho, **oculta las otras 3**, foco al título, botón Cerrar arriba y abajo, URL `#pesca/<id>` con `pushState` y "atrás" cierra, `aria-expanded`, región con `aria-labelledby`.
- Acentos ya definidos: seguridad `#fbbf24`, océano `#1eb8c8`, atmósfera `#4b5f7f`, potencial `#006d3d`.
- Contenido por ficha (mismo orden del Figma, cada bloque solo si hay dato):
  - Estado del mar: chip con verde/amarillo/rojo (modelo, con la nota de no oficial), dictamen generado por las reglas de `reglas-mar.js` (Douglas/Beaufort), tarjetas con oleaje, periodo, viento, rachas; enlaces oficiales (SEMAR, Capitanía).
  - Condiciones oceanográficas: oleaje por componentes, SST, corriente, fase lunar; mareas solo si Luca confirma fuente.
  - Clima costero: viento, rachas, presión, visibilidad, lluvia, CAPE, amanecer/atardecer (los que Open-Meteo entregue y Luca confirme).
  - Potencial: clorofila (capa GIBS ya integrada, con fecha), SST y anomalía solo con dato; vedas como enlace a CONAPESCA.
  - Lo que el Figma muestra y no tiene fuente (dictamen "oficial", teléfonos, frecuencias, tallas por especie, ANP, boyas) **no se muestra** o aparece como "pendiente: sin fuente abierta verificada".
- Reutilizar: extraer de `agricola.js` el helper de apertura/cierre a un módulo compartido pequeño solo si no complica el PR; si complica, duplicar las clases `ag-` con prefijo `pe-` y mismas reglas CSS (menos riesgo en una pantalla ya fusionada).
- Archivos (todos en `web/`): `js/pesca.js`, `css/pesca.css`, textos `pes.*` ES/EN, `tests/pesca.test.mjs`.
- Pruebas: abrir una ficha oculta las otras 3 y ocupa el ancho; Cerrar y "atrás" restauran; teclado y foco; 360 y 1280 px sin scroll horizontal; texto ≥12 px; modo oscuro; ES/EN. Verificación con navegador, no solo pruebas unitarias.

## Delegación

- Agentes gratuitos (ollama/opencode, escrito en archivo, yo reviso): redacción de textos ES/EN de las fichas, tabla de claves `pes.*`, casos de prueba rutinarios.
- Yo (modelo principal): diseño de la ficha, JS/CSS, integración, verificación.
- Luca: investigación de datos (issue de la Fase 2).
- Revisión final de contraste y fidelidad al Figma: UI/UX (Ehileen/Roberto).

## Orden y bloqueos

1. Aprobar este plan -> abrir issue de Fase 2.
2. Fase 3 puede empezar ya con los datos que existen (Open-Meteo y GIBS) y sumar bloques cuando Luca confirme fuentes.
3. Fase 1 espera a #189 y la exportación de Luca; no se toca hasta entonces.

## No verificado / pendiente

Prueba en celular real (#71), lector de pantalla real, cobertura real de IMERG sobre las 6 zonas, fuente abierta de mareas, vedas y avisos oficiales, disponibilidad de SST/clorofila numérica por puerto.
