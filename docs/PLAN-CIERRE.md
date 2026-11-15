> **Nota (2026-11-15): documento histórico; lo que contradiga a `docs/decisiones.md` (2026-11-15) está superado por ese archivo.** Ver la web actual: menú Clima · Pesca · Inicio · Agro · Avisos, 38 lugares en Clima, 19 puertos en Pesca.

# Plan de cierre: noche del sábado 14 de noviembre

Escrito por el asistente del Líder a las 22:30 (hora de La Paz), tras revisar `dev`, los PR abiertos y las ramas de cada quien. Carlos lo confirma o lo corrige. Lista de lo que se entrega en la plataforma: [`entrega/CHECKLIST-ENVIO.md`](entrega/CHECKLIST-ENVIO.md).

## Qué significa "terminado esta noche"

La web de `dev` está lista para pasar a `main` y probarse en el celular mañana temprano. Eso quiere decir:

1. Las 4 pantallas (Inicio, Mapa, Ficha, Acciones) abren con **datos reales y vigentes** y con la fuente visible.
2. La web se puede leer **en inglés** con `?lang=en` (requisito oficial: el enlace final va en inglés escrito).
3. Todas las pruebas pasan y hay **un solo comando** que las corre.
4. Ninguna cifra ni texto de la web contradice `data/salida/` ni los documentos de `docs/entrega/`.
5. Cada recurso externo (imagen, fuentes, ícono, logo, librería) está declarado en `docs/RECURSOS.md` y en `docs/entrega/07-other-resources.md`, y lo generado con IA lleva su marca "AI-generated".

Lo que no se llega a hacer esta noche queda anotado como pendiente de mañana; no se mete a medias a `main`.

## Estado a las 22:30

| Qué | Quién | Estado |
|---|---|---|
| Calor 2001-2021 (+0.94 °C), vegetación a 2026, agua GRACE | Luca | En `dev` (PR #84, #90). Falta que `web/data/` los copie |
| PR #83 sin datos de prueba | Diego | Abierto, fusiona limpio con `dev` |
| PR #89 método por ficha y aviso de IA en el pie | Diego | Abierto; solo choca en `docs/handoffs/prog-b.md` |
| PR #77 login con Supabase (Auth, opcional) | Diego | **Pospuesto y cerrado sin fusionar** (decisión del 2026-11-15); la rama `prog-b/login` queda para después del evento |
| PR #88 Mapa Agrícola | Diego | Abierto; **Carlos decidió que entra**; trae fuentes nuevas (SIAP, CONAGUA, SoilGrids, SMN, GeoNames) |
| Rama `ui-ux/pantallas-figma` (17 pantallas, logo, íconos, tokens) | Ehileen | Subida hace minutos, **sin PR** (el handoff dice `#PR_PENDIENTE`) |
| Ramas `prog-a/revision-al-dia` y `prog-a/extender-2026` (REVISION y PLAN al día) | Luca | Subidas, **sin PR** |
| #87 contraste de Calor con Aqua | Luca | Pendiente |
| #93 versión en inglés | todos | Sin empezar |
| PR #85 "Dev → main" | Carlos | Se conserva como vehículo a `main` (se actualiza solo con `dev`); no se fusiona hasta pasar la puerta de calidad |

## Reglas de alcance de esta noche

1. **Solo entran a la web cosas con datos reales y fuente.** Las pantallas de Figma de Clima (humedad, UV, viento y oleaje, sensación térmica) y Pesca (oceanografía, potencial pesquero, semáforo de seguridad) no tienen datos nuestros. Se quedan como diseño de referencia en `diseno/`, **no se construyen** y no se mencionan en la entrega salvo como trabajo futuro.
2. **El botón "Iniciar simulación" del diseño no se construye.** La especificación dice "qué hace: por confirmar". No se inventa una simulación con números que no salen de los datos. *(Actualizado el 2026-11-15: Carlos pidió simulaciones con datos reales; ver `docs/decisiones.md`, "Simulaciones en el Mapa y la Ficha". Siguen sin inventarse números.)*
3. **Mapa Agrícola (#88)**: Carlos decidió que entra. Antes de `main` necesita la auditoría de fuentes de Luca (ver abajo) y su versión en inglés. Si la auditoría falla o no llega a tiempo, se deja fuera de `main`: no es una de las 4 pantallas del reto.
4. **Login (#77):** no entra a la entrega (decidido el 2026-11-15, ver `docs/decisiones.md`). La web funciona sin cuenta, como dice el relato.
5. Sin congelamiento de funciones (decisión de Carlos), pero **todo lo que va a `main` se prueba antes** con la puerta de calidad.
6. Las prioridades, de mayor a menor: **P0** lo necesario para entregar; **P1** mejora que entra si no rompe nada; **P2** solo si sobra tiempo.

## Cola de fusión a `dev` (en este orden)

Una a la vez; después de cada una se corren las pruebas. La revisión la hace el asistente del Líder en un worktree aparte.

1. **PR de Luca** con REVISION y PLAN al día (documentos; sin riesgo). P0
2. **#83** sin datos de prueba. P0
3. **#89** método por ficha y aviso de IA. P0 (Diego resuelve el choque de `docs/handoffs/prog-b.md`)
4. **Copia de `data/salida/` a `web/data/`** y texto de calor por zona (`CAPA_ZONA.calor.sinCifra`, que ya tiene cifra). P0. Se puede hacer en el mismo PR que #89 o en uno chico aparte.
5. **PR de Ehileen** con diseño, assets y tokens (solo `diseno/`, `web/assets/` y `docs/`). P1
6. **#88** Mapa Agrícola, después de la auditoría de Luca y de ponerlo al día con `dev`. P1
7. ~~#77 login~~ Pospuesto: no entra.
8. **Integración visual** de logo, íconos y tokens en `web/` (Diego). P1
9. **Interruptor ES/EN** (#93) con `?lang=en`. P0 (puede entrar antes que 5 a 8 si hace falta)

## Tareas por persona

### Diego (Prog. B): cuando termine #78
1. Copiar `data/salida/` a `web/data/` una sola vez (ya está en `dev` Calor 2001-2021) y cambiar el texto de calor por zona: hoy dice "sin cifra" y ahora hay cifra, con 4 zonas significativas y 2 sin cambio claro.
2. Poner al día #77 y #88 con `dev` (hoy chocan en `web/index.html`; en #77 los archivos de login aparecen borrados en `dev` porque Login y Register se sacaron del PR de pantallas, se vuelven a agregar como archivos nuevos).
3. Interruptor ES/EN y versión en inglés de la interfaz (#93): diccionario ES/EN en un solo archivo, `?lang=en` abre en inglés, el idioma del navegador no cambia nada por sí solo, `<html lang>` cambia con el idioma. Los textos del JSON en inglés vienen de Luca (`*_en`).
4. Integrar logo, íconos y tokens de Ehileen **solo después** de que ella aclare su origen y licencia (ver abajo).
5. Revisión a 360 px de las 4 pantallas y teclado/foco, `alt` en imágenes, contraste.
6. No agregar pantallas nuevas ni fuentes de datos nuevas esta noche.

### Luca (Prog. A)
1. **Abrir los PR** de `prog-a/revision-al-dia` y de lo que falte de `prog-a/extender-2026` hacia `dev` (no hacia `main`).
2. **Auditar la fuente de datos del Mapa Agrícola (#88)** como revisor independiente: que cada cifra de `web/data/agricola.json` salga de la fuente que dice (SIAP 2025, CONAGUA/DOF, NASA POWER, SoilGrids CC BY 4.0, SMN, GeoNames), que haya enlace y fecha de consulta, y que no haya números sin origen. Resultado en un comentario del PR: "pasa" o lista de lo que falla.
3. **Campos `*_en`** en `data/salida/*.json` (título, descripción, método, limitación, fuente) y que `analisis.validar` los exija (#93).
4. **Un solo comando de verificación** (`scripts/verificar-todo.ps1`): pytest de `analisis`, `analisis.validar`, `node --test` de web y de diseño, que `web/data/{indicadores.json,zonas.geojson,zonas_tendencias.json}` sean idénticos a `data/salida/`, y que ningún archivo del repo pese más de 5 MB. Que falle con mensaje claro.
5. **Contraste de Calor con Aqua (#87)** (MYD11A2), con resultado escrito aunque salga mal para la hipótesis. Carlos confirmó el corte en 2021 mientras no haya datos más recientes y confiables; si Aqua lo contradice, se revisa.
6. **Revisión de seguridad del login (#81)**: llave publishable (no secret), RLS, correo de borrado de cuenta, sin datos personales en el repo.

### Ehileen y Roberto (UI/UX)
1. **Abrir el PR de `ui-ux/pantallas-figma` hacia `dev`** y quitar `#PR_PENDIENTE` del handoff. Solo `diseno/`, `web/assets/` y `docs/`.
2. **Logotipo (Roberto):** decir qué herramienta de IA lo generó, con enlace a sus términos de uso. Si no se puede confirmar que se puede usar, se sustituye por un logotipo hecho a mano o por texto. Se declara en pantalla como "AI-generated" (marca visible, no solo en el pie).
3. **Íconos:** decir de dónde salen los 12 SVG y su licencia. Si no se sabe, se usan solo los que se puedan declarar y el resto se quita. Solo se usan los que correspondan a pantallas que sí existen.
4. **Revisar el inglés** de la interfaz que escriba Diego (diccionario ES/EN): frases cortas, sin falsos amigos, con "may", "suggests" y "no clear change" donde no hay causa ni certeza.
5. **Ficha y Acciones a 360 px** (su propio pendiente) y modo oscuro: **no** se hace esta noche (P2).
6. Confirmar que ninguna pantalla, imagen ni texto muestra rostros, nombres ni voces de menores de 18.
7. Actualizar `docs/entrega/05` y `07` si cambia algo (ya lo dejaron como "por confirmar").

### Carlos
1. ~~Confirmar Calor 2001-2021~~ Hecho (con la condición de datos más recientes y confiables).
2. ~~Decidir si Mapa Agrícola entra~~ Hecho: entra, sujeto a la auditoría de fuentes.
3. ~~Cerrar o sustituir el PR #85~~ Hecho: se conserva como vehículo a `main`.
4. Probar en un celular real (#71) cuando `main` tenga la nueva versión.
5. Grabar el video de 30 s (≤30 s, subtítulos en inglés, sin menores) con el guion de `08`.
6. Pasos de la plataforma y confirmar la hora del Local Lead.

### Asistente del Líder
1. Revisar cada PR en un worktree (pruebas, `validar`, cifras contra `data/salida/`, textos, recursos) y fusionar a `dev`.
2. Poner al día `docs/investigacion/hallazgos.md` (hoy dice calor -0.02, 2001-2025; vegetación sin los 2026).
3. Alinear `docs/entrega/` con la web final (03 enlace y pantallas, 04, 05, 07).
4. Pasar la puerta de calidad y preparar el PR `dev → main` para que Carlos lo apruebe.
5. Cuando haya primera versión funcional, contrastar `docs/entrega/02` a `07` contra el sitio público abierto sin sesión.

## Puerta de calidad antes de pasar `dev` a `main`

Todo en verde, o no pasa:

- [ ] `uv run --python 3.12 --with pymannkendall --with numpy --with requests --with scipy --with netCDF4 --with pytest python -m pytest analisis`
- [ ] `python -m analisis.validar` (con los campos `*_en`).
- [ ] `node --test "web/tests/*.test.mjs"` y `node --test "diseno/tests/*.test.mjs"` (si el PR de Ehileen ya entró).
- [ ] `web/data/` idéntico a `data/salida/` para los tres archivos de indicadores.
- [ ] Cada cifra de la web coincide con `data/salida/` y con `docs/entrega/04` (calor: aire +1.47 °C 2001-2025 como cifra principal y superficie "no concluyente" sin cifra principal; vegetación -0.013 p = 0.004 a 2026; lluvia sin cambio claro p = 0.129; agua +1.36 cm p = 0.009, regional).
- [ ] Sitio abierto **sin sesión iniciada**, en ES y con `?lang=en`: sin errores en la consola, sin pedir registro, 4 pantallas con fuente visible, y a 360 px sin scroll horizontal.
- [ ] No hay nombre, foto ni voz de menores de 18 en el repo ni en el sitio (búsqueda del nombre que indicó Carlos; no se escribe en ningún archivo).
- [ ] No hay logos de NASA, claves secretas ni archivos de más de 5 MB.
- [ ] El aviso de IA se ve en el pie; el logo generado con IA lleva su marca.
- [ ] `docs/RECURSOS.md` y `docs/entrega/07` listan todo lo que carga la web (imagen GIBS, fuentes, supabase-js si entra, íconos, logo).

## Línea de tiempo (hora de La Paz)

| Hora | Qué |
|---|---|
| 22:30-23:30 | Ronda 1: Ehileen y Luca abren sus PR; Diego copia `web/data/` y texto de calor; se fusionan los PR 1 a 4 de la cola. |
| 23:30-01:00 | Ronda 2: auditoría de #88; #88 y #77 al día; EN en JSON (Luca) y diccionario ES/EN (Diego); logo e íconos aclarados. |
| 01:00-02:00 | Ronda 3: interruptor ES/EN en `dev`, integración visual, 360 px, revisión de inglés. |
| 02:00-02:30 | Puerta de calidad y PR `dev → main`. Si algo falla, pasa lo que está verde y el resto queda para mañana. |
| Dom 08:00-09:00 | Primera revisión del sitio público sin sesión. |
| Dom 09:00-11:00 | Prueba en celular real (#71), video, textos finales. |
| Dom 11:00 | Borrador de entrega completo. |
| Dom 13:00 | **Submit for Judging** (límite oficial 23:59). |

## Riesgos que seguimos de cerca

- **Web solo en español:** riesgo de elegibilidad. Tiene prioridad sobre cualquier pulido.
- **Cansancio y fusiones apuradas:** dos PR de Diego tocan los mismos archivos; se fusiona uno por uno.
- **Logo e íconos sin origen confirmado:** pueden obligar a quitarlos antes de enviar.
- **Calor:** el corte en 2021 depende de una explicación probable (deriva de Terra) todavía sin el contraste de Aqua.
- **Login:** pospuesto; no es un riesgo de la entrega.
