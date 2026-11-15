# Prog. B: datos reales en la web — plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans. Los pasos usan casillas (`- [ ]`).

**Objetivo:** que las 4 pantallas muestren los datos reales de Luca (`data/salida/indicadores.json`) sin presentar como medición nada que no lo sea. Meta: 20:00. Sin congelamiento de funciones (decisión de Carlos).

**Arquitectura:** la web sigue siendo estática y sin build. Las reglas de presentación que hoy están mezcladas en `web/js/app.js` pasan a un archivo puro, `web/js/reglas.js`, que expone `window.RB` y `module.exports`. Así se puede probar con `node --test`, sin navegador. `app.js` solo arma HTML con esas reglas.

**Stack:** HTML/CSS/JS vanilla, Leaflet 1.9.4 (cdnjs) y Node 22 (`node --test`, ya instalado) solo para las pruebas.

**Spec:** `docs/contrato-datos.md` (v0.1 acordado, incluido el Anexo de Investigación) e issue #36.

## Estado al 2026-11-14, 15:05

### Hecho
- **PR #25 fusionado a `dev`:** las 4 pantallas con datos de prueba.
- **Pages publicado:** https://ingidscarlosdanc21.github.io/radar-BCS/ responde 200 y sirve la web, con datos de prueba.
- **Contrato v0.1 acordado:** lo confirmó Carlos y le agregó el Anexo de Investigación.
- **Carlos ya corrigió en `dev`:**
  - SRI en Leaflet.
  - `p < 0.001`.
  - Textos de Acciones verificados contra CDC y EPA.
- **Luca exportó** `data/salida/indicadores.json`:
  - Calor y lluvia vienen de NASA POWER.
  - Vegetación y agua van en `null`, "Pendiente".
- **Issue #42 abierto** (delegar.ps1 y OpenCode).

### Falla o está mal (verificado)
1. **Lluvia:** Luca entrega `cambio_total: 0.0` con `significativo: false`, y la web mostraría "0,000 mm/año". El Anexo, regla 3, pide "Sin cambio claro" y ninguna cifra.
2. **Vegetación y agua llegan con `fuente: null`:**
   - Inicio muestra "Fuente: " vacío.
   - El mapa muestra "Fuente: null".
   - Debe decir "pendiente" y mostrar `limitacion`.
3. **El mapa engañaría:**
   - Al copiar los datos reales, `DATOS.datos_de_prueba` pasa a `false` y la franja desaparece.
   - Pero `zonas.geojson` sigue siendo una cuadrícula sintética (issue #36, punto 2).
4. **Calor trae `p_valor: 0.0`:** el Anexo, regla 4, lo prohíbe. La web ya lo muestra como `< 0.001`, pero hay que avisar a Luca.
5. **Problemas de la salida de Luca:**
   - **Lluvia:** sigue con Sen estacional mensual, y el Anexo, regla 2, pide total anual.
   - **BOM UTF-8:** el JSON trae BOM; los navegadores lo toleran, pero Python necesita `utf-8-sig`.
   - **Ubicación:** lo escribe en `data/salida/` y no en `web/data/`.
6. **Rama local:** `prog-b/web-base` va 9 commits atrás y ya está fusionada; hay que trabajar desde `dev`.
7. **delegar.ps1 con OpenCode:** `-Agente opencode` falla (issue #42). Mientras tanto, llamar `opencode run` directo.

### Falta (de la agenda)
- Datos reales en las 4 pantallas, con fuente visible en cada cifra (Tareas 1 a 4).
- Pruebas en 360 px, modo oscuro, contraste y enlaces (Tarea 5).
- Comentarios en los issues:
  - Cerrar #10.
  - Comentar #9 y #36.
  - Avisar a Luca en #7.
  - Avisarle a Carlos para que vuelva a probar la URL pública (Tarea 7).

### Se puede mejorar o adelantar
- Mostrar "Datos generados el …" a partir de `generado` (Tarea 4, barato).
- Capturas de las 4 pantallas para la demo de Carlos (#13), hechas en la Tarea 5.
- Paleta y logo de Ehileen (#11, #12): integrarlos en cuanto lleguen, siempre que no rompan `dev`. Fuera de este plan.

## Restricciones globales
- **No inventes datos:** todo número lleva fuente verificable; lo no verificado se marca como pendiente.
- Edita solo `web/` (y tu handoff). Lo que sea de Luca va por comentario o issue, nunca editando `analisis/` ni `data/`.
- Faltantes: `null` se muestra como texto ("sin datos", "pendiente"), nunca como `0`.
- `significativo: false` se muestra como "Sin cambio claro", nunca como cifra de cambio.
- Método: "Mann-Kendall estacional + pendiente de Sen" (nunca "Hirsch-Slack").
- Las claves solo van en `.env`. No leer ni imprimir `.env`.
- Rama `prog-b/datos-reales` desde `origin/dev`; PR a `dev`.

## Foco de revisión
1. **Lluvia** (`significativo: false`, `cambio_total: 0.0` o `null`): la tarjeta y la ficha dicen "Sin cambio claro", sin cifra y sin color sube/baja. → Prueba en la Tarea 1.
2. **Indicador con `fuente: null`:** dice "Fuente: pendiente" y muestra `limitacion`. Nunca "null" ni vacío. → Pruebas en las Tareas 1 y 4.
3. **Indicadores reales con zonas sintéticas:** la franja "DATOS DE PRUEBA" aparece en el Mapa y no en Inicio ni en Ficha. → Prueba en la Tarea 1 y archivo en la Tarea 3.
4. **`p_valor: 0.0`:** se muestra `p < 0.001` y la conclusión dice "Sí". → Prueba en la Tarea 1.
5. **Indicador sin nada** (`significativo: null`, serie vacía): dice "Sin datos (pendiente)" y "Sin datos suficientes para la gráfica", sin error en consola. → Pruebas en las Tareas 1 y 5.

## Orquestación (ahorro de tokens)

| Quién | Para qué | Tareas |
|---|---|---|
| **Yo (Opus, sesión principal)** | Solo orquesto: reparto, reviso los diffs que devuelven y hago los commits finales | todas |
| **Subagente `haiku`** | Mecánico: rama, copiar datos, comandos y verificación en navegador | 0, 3, 5, 7 |
| **OpenCode gratis** (`opencode run -m opencode/nemotron-3.5-super-vl-free`) | Borrador del validador del contrato; lo reviso antes de usarlo | 2 |
| **Ollama `gemma3:4b`** (`scripts/delegar.ps1 ... -Agente ollama`) | Borradores de texto: comentarios de issues y handoff; los reviso | 7 |
| **Subagente `sonnet`** | Lógica con criterio: `reglas.js` con TDD y conectarlo en `app.js` | 1, 4 |
| **Subagente `opus` (caro)** | Una sola revisión final de toda la rama: honestidad de cifras, contrato y regresiones | 6 |

Nunca `-Agente auto`. Corren en paralelo la 1 con la 2, y la 5 con la 7a. Lo demás va en orden.

---

### Tarea 0: Rama de trabajo (haiku)
- [ ] `git switch -c prog-b/datos-reales origin/dev`. Esperado: `web/js/app.js` ya trae `pTexto` (`git grep -n pTexto web/js/app.js` encuentra la línea).

### Tarea 1: Reglas puras con pruebas (sonnet)

**Archivos:** crear `web/js/reglas.js` y `web/tests/reglas.test.mjs`.

**Interfaces que produce** (`window.RB` en el navegador y `module.exports` en Node):
- `num(n, d) -> string`, `dec(n) -> number`, `pTexto(p, d) -> string`: se mueven tal cual desde `app.js`.
- `textoCambio(i) -> {texto: string, clase: 'sube'|'baja'|'', tipo: 'cifra'|'sin-cambio'|'sin-datos'}`. Reglas en este orden:
  1. `significancia.significativo === false` → `{texto: 'Sin cambio claro', clase: '', tipo: 'sin-cambio'}`.
  2. `cambio_total == null` → `{texto: 'Sin datos (pendiente)', clase: '', tipo: 'sin-datos'}`.
  3. En otro caso → texto igual al `signo(n, un)` actual y `clase` igual al `clase(n)` actual.
- `textoFuente(i) -> string`: devuelve `fuente.dataset`, o `'pendiente'` si `fuente` o `dataset` es `null`.
- `mostrarFranja(datos, zonas, vista) -> boolean`: devuelve `true` si `datos.datos_de_prueba === true`, o si `vista === 'mapa'` y `zonas.datos_de_prueba === true`.

- [ ] **Paso 1: escribir las pruebas** (`node:test` + `node:assert/strict`):
  - **Lluvia sin cambio claro, con 0.0 y con null:**
    - Caso `{cambio_total: 0.0, unidades: 'mm/año', significancia: {significativo: false}}`.
    - Caso igual pero con `cambio_total: null`.
    - Los dos dan `tipo === 'sin-cambio'` y `texto === 'Sin cambio claro'`.
  - **Calor con cifra:** `{cambio_total: 1.465, unidades: '°C', significancia: {significativo: true}}` da `texto === '+1,47 °C'` y `clase === 'sube'`. (Si el ICU de Node formatea distinto, ajustar la prueba al formato del navegador `es-MX` y anotarlo.)
  - **Vegetación vacía:** `{cambio_total: null, unidades: null, significancia: {significativo: null}}` da `texto === 'Sin datos (pendiente)'`.
  - **Fuente:** `textoFuente({fuente: null}) === 'pendiente'` y `textoFuente({fuente: {dataset: 'X'}}) === 'X'`.
  - **p-valor:** `pTexto(0.0, 3) === '< 0.001'` y `pTexto(0.1782, 3) === '0,178'`.
  - **Franja:**
    - `mostrarFranja({datos_de_prueba: false}, {datos_de_prueba: true}, 'mapa') === true`.
    - Lo mismo con `'inicio'` da `false`.
    - `mostrarFranja({datos_de_prueba: true}, {}, 'ficha') === true`.
- [ ] **Paso 2:** `node --test web/tests/`. Esperado: FALLA porque no existe `reglas.js`.
- [ ] **Paso 3:** implementar `reglas.js` como IIFE que asigna `window.RB` y, si existe `module`, `module.exports`. Sin dependencias.
- [ ] **Paso 4:** `node --test web/tests/`. Esperado: todas pasan.
- [ ] **Paso 5:** commit `feat(web): reglas de presentación probables (sin cambio claro, fuente pendiente, franja por vista)`.

### Tarea 2: Validador del contrato (borrador con OpenCode; lo reviso yo)

**Archivo:** `web/tests/contrato.test.mjs`. Lee `web/data/indicadores.json` y `web/data/zonas.geojson` quitando el BOM (`.replace(/^﻿/, '')`).

- [ ] **Paso 1: pruebas.**
  - **Ids:** son exactamente `calor`, `vegetacion`, `lluvia`, `agua`.
  - **Faltantes:** ningún número vale `-9999`.
  - **Fuente completa:** si `cambio_total != null`, entonces `fuente.dataset`, `fuente.url`, `fuente.periodo` y `fuente.fecha_descarga` no están vacíos.
  - **Método:** `significancia.metodo` es `null` o contiene `'Mann-Kendall'`, y nunca contiene `'Hirsch'`.
  - **Zonas:** `zonas.geojson` es un `FeatureCollection` y sus 4 claves de `properties.cambios` son los mismos ids.
  - **Franja:** si `indicadores.datos_de_prueba === false` y las zonas siguen siendo la cuadrícula sintética (`nombre` empieza con `'Celda '`), entonces `zonas.datos_de_prueba === true`.
- [ ] **Paso 2:** `node --test web/tests/contrato.test.mjs`. Con los datos de prueba actuales debe PASAR.
- [ ] **Paso 3:** commit `test(web): valida web/data contra el contrato v0.1`.

### Tarea 3: Copiar los datos reales (haiku; depende de la Tarea 2)
- [ ] Copiar `data/salida/indicadores.json` a `web/data/indicadores.json` sin BOM: leer con `utf-8-sig` y escribir con `utf-8`. No tocar ningún valor.
- [ ] En `web/data/zonas.geojson`, agregar en la raíz `"datos_de_prueba": true` (Anexo, regla 6).
- [ ] `node --test web/tests/`. Esperado: pasa. Si el validador falla por datos de Luca, **no corregir el dato**: anotarlo para la Tarea 7.
- [ ] Commit `data(web): indicadores reales de NASA POWER (Prog. A) y zonas marcadas de prueba`.

### Tarea 4: Conectar las reglas en `app.js` (sonnet; depende de las Tareas 1 y 3)

**Archivos:** modificar `web/index.html` (cargar `js/reglas.js` antes de `js/app.js`) y `web/js/app.js`.

- [ ] **Reemplazar los helpers:** quitar `num`, `dec` y `pTexto` locales y usar los de `RB`.
- [ ] **`inicio()`:**
  - La cifra usa `RB.textoCambio(i)` (texto y clase).
  - "Fuente: " usa `RB.textoFuente(i)`.
  - "Periodo" usa `i.fuente && i.fuente.periodo`, o `'pendiente'`.
  - Si `tipo === 'sin-datos'` y hay `i.limitacion`, mostrarla en `<p class="fuente">`.
- [ ] **`ficha()`:**
  - El bloque "Cambio total" usa `RB.textoCambio(i)`.
  - Si `tipo === 'sin-cambio'`: la tendencia por década dice "Sin cambio claro" y se muestra `cambio_total_nota` solo si existe.
  - El bloque Fuente usa `RB.textoFuente(i)`.
- [ ] **`pintar()`** (línea de `fuente-mapa`): usar `RB.textoFuente(i)`.
- [ ] **Franja por vista:** `franja()` pasa a `franja(sec)` con `RB.mostrarFranja(DATOS, ZONAS, sec)`; se llama en `ruta()` después de elegir `sec`.
- [ ] **Fecha de los datos:** pie en Inicio: "Datos generados el " + `DATOS.generado`.
- [ ] **Verificar:** `node --test web/tests/` pasa, y `python -m http.server -d web 8765` carga las 4 pantallas sin errores en consola.
- [ ] Commit `feat(web): datos reales con "sin cambio claro", fuente pendiente y franja en el mapa (#36)`.

### Tarea 5: Verificación en navegador (haiku con el navegador integrado)
- [ ] Servidor `web` de `.claude/launch.json` (padre del repo). Revisar 375×812 y 360×740 en las 4 pantallas y en `#ficha/lluvia`, `#ficha/vegetacion` y `#ficha/agua`. Esperado:
  - Sin scroll horizontal.
  - Consola sin errores.
  - Lluvia dice "Sin cambio claro".
  - Vegetación dice "Fuente: pendiente".
  - Franja solo en `#mapa`.
- [ ] Repetir con `colorScheme: dark` y comprobar que el texto se lee.
- [ ] Abrir los 3 enlaces externos (CDC PDF, EPA Start Saving, POWER docs) y anotar el código o el resultado.
- [ ] Guardar capturas de las 4 pantallas a 375 px en el scratchpad para la demo (#13) y enviarlas a Diego.

### Tarea 6: Revisión final cara (subagente opus, una vez)
- [ ] Revisar `git diff origin/dev...prog-b/datos-reales` contra el contrato, el Anexo y el Foco de revisión.
- [ ] Reportar solo hallazgos con escenario concreto. Yo corrijo o delego en sonnet y vuelvo a correr `node --test web/tests/`.

### Tarea 7: Cierre (haiku + gemma para borradores; yo reviso y publico)
- [ ] **7a, borradores con gemma:**
  - Comentario a Luca en #7: `p_valor` 0.0 (regla 4), lluvia con total anual (regla 2), BOM, y que exporte directo a `web/data/` o que Diego copia.
  - Comentarios en #36 y #9.
  - Cierre de #10 ("Pages publica la web; 200 verificado el 2026-11-14").
- [ ] **7b:** push de `prog-b/datos-reales` y PR a `dev` que cierra #36.
- [ ] **7c:** actualizar `docs/handoffs/prog-b.md` (Hecho / En curso / Falta / Bloqueos) y avisar a Carlos para que vuelva a probar la URL pública cuando fusione a `main`.
