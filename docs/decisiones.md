# Decisiones

Registro de decisiones del equipo. Una entrada por decisión; no se borran, se reemplazan con otra entrada.

## Plantilla

### AAAA-MM-DD — Título
- **Contexto:**
- **Decisión:**
- **Alternativas descartadas:**
- **Quién decidió:**

---

### 2026-11-14 — Rúbrica de evaluación: se usa la guía global

- **Contexto:** La rúbrica local estaba PENDIENTE (issue #1). Carlos la preguntó en la sede.
- **Decisión:** La sede evalúa con la guía oficial *2026 Judging & Awards Guide*: <https://www.spaceappschallenge.org/resources/judging-awards-guide/> (consultada el 2026-11-14). Cinco criterios, cada uno de 1 a 5, en todos los niveles de evaluación:
  - **Impact:** tamaño del problema que atiende y a cuánta gente inspira o ayuda.
  - **Creativity:** originalidad; concepto nuevo o mejora significativa de algo existente.
  - **Validity:** base científica, factibilidad técnica, qué tan completo y usable es.
  - **Relevance:** responde directamente al reto y usa datos NASA como parte central, no como adorno.
  - **Presentation:** claridad y narrativa; los jueces califican con el demo **y** el proyecto completo.
- **Datos de la misma guía que nos afectan:** todo en inglés (un video puede hablarse en otro idioma con subtítulos en inglés); demo de máximo 7 diapositivas (contando portada e introducción) o video de máximo 30 s; equipo de máximo 6 personas, todas registradas en la misma sede; todo recurso externo va en el campo *References*. Nominados globales: 3 dic 2026. Existe un premio global **Local Impact Award**.
- **Alternativas descartadas:** ninguna; no hay rúbrica local distinta.
- **Quién decidió:** la sede (informado por Carlos).

### 2026-11-14 — Hora límite de entrega de la sede: domingo 15 nov, 12 pm  *(REEMPLAZADA por la entrada "Calendario adelantado por el cierre a mediodía")*

- **Contexto:** `AGENTS.md` y el plan asumían cierre en la plataforma el dom 15 nov a las 23:59 y evaluación del jurado a las 17:00. La guía global dice 23:59 hora local, pero remite al Local Lead para la hora de cada sede.
- **Decisión:** La sede informó que **las entregas se cierran el domingo 15 de noviembre a las 12 pm** (dato dado por Carlos, sin documento escrito). Se trabaja con esa hora como límite real.
- ~~POR CONFIRMAR: que "12 pm" es mediodía~~ → confirmado por Carlos el 2026-11-14 (ver la entrada siguiente).
- **Consecuencia (propuesta, pendiente de aprobar por el Líder):** el calendario de `AGENTS.md` y de la skill `rol-lider` queda desfasado. Propuesta: congelar funciones el **sábado a las 22:00**, entrega completa en borrador el **domingo a las 09:00**, y pulsar "Submit for Judging" a más tardar a las **11:00**.
- **Quién decidió:** la sede (informado por Carlos).

### 2026-11-14 — Calendario adelantado por el cierre a mediodía

- **Contexto:** Carlos confirmó por chat el 2026-11-14 que "12 pm" es **mediodía** del domingo 15 de noviembre (confirmación verbal de la sede; **no hay documento escrito**, POR VERIFICAR con el Local Lead). El calendario de `AGENTS.md` (congelar dom 12:00, jurado 17:00, cierre 23:59) ya no sirve. Esta entrada reemplaza los "POR CONFIRMAR" y la propuesta de la entrada anterior.
- **Decisión:** nuevo calendario, hora de La Paz:
  - **Sáb 14 nov 20:00** — las 4 pantallas con datos reales (sin cambio).
  - **Sáb 14 nov 22:00** — congelar funciones; después solo bugs, textos y entrega.
  - **Dom 15 nov 09:00** — entrega completa en borrador (`docs/entrega/`), demo lista y `main` actualizado.
  - **Dom 15 nov 11:00** — "Submit for Judging" pulsado, con una hora de margen.
  - **Dom 15 nov 12:00** — cierre de entregas de la sede. Sin excepciones.
- **Hecho:** `AGENTS.md` y la skill `rol-lider` ya tienen estas horas. La hora de la evaluación del jurado con el nuevo cierre no se ha confirmado.
- **Alternativas descartadas:** mantener el calendario original (dejaba el congelamiento a la misma hora del cierre).
- **Quién decidió:** Carlos (Líder).

### 2026-11-14 — Tecnología y publicación de la web

- **Contexto:** la skill `rol-programador-b` pide elegir lo más simple que funcione, sin build pesado, y anotar desde dónde se publica.
- **Decisión:** HTML + CSS + JavaScript sin framework ni build. Mapa con **Leaflet 1.9.4** (versión fija, desde cdnjs) y teselas de OpenStreetMap; gráficas en SVG hecho a mano (sin librería). Los datos son JSON/GeoJSON estáticos en `web/data/` según `docs/contrato-datos.md`. Publicación: GitHub Pages con el workflow `.github/workflows/pages.yml`, que sube la carpeta `web/` al hacer push a `main` (solo el Líder fusiona a `main`). URL: <https://ingidscarlosdanc21.github.io/radar-BCS/>.
- **Alternativas descartadas:** React/Vite (requiere build y más peso), Chart.js (no hace falta para una línea y unas barras), MapLibre (más pesado que Leaflet para polígonos simples).
- **Quién decidió:** Diego (Prog. B).

### 2026-11-14 — Horarios oficiales del domingo: contradicen el cierre a mediodía

- **Contexto:** Carlos compartió la diapositiva oficial "Horarios del evento, domingo 15 de noviembre" de NASA International Space Apps Challenge La Paz 2026 (sede: Comunidad Educativa Juan Pablo II). Dice: 06:00 permisos para abandonar o reincorporarse al recinto; **17:00 evaluación del jurado**; 21:00 cierre del recinto; **23:59 hora límite para subir el proyecto a la plataforma**.
- **Decisión:**
  - La **evaluación del jurado es el domingo a las 17:00** (ya con documento).
  - La hora límite en la plataforma que muestra el documento es **23:59**, no las 12:00 que se dijo de palabra. Las dos fuentes se contradecían.
  - **Aclarado el mismo día:** Carlos preguntó al Local Lead y este **confirmó de palabra que el límite es 12:00** (sigue sin documento escrito; la diapositiva oficial dice 23:59). **Rige el límite de las 12:00.**
  - Se mantiene el calendario adelantado: pulsar "Submit for Judging" a más tardar el domingo a las 11:00, una hora antes del límite y seis horas antes de que evalúe el jurado.
- **Alternativas descartadas:** volver al calendario original de golpe, porque la hora de las 12:00 podría ser real; y quedarse solo con las 12:00, porque el documento escrito dice otra cosa.
- **Quién decidió:** Carlos (Líder) aportó el documento; la decisión de mantener la entrega a las 11:00 es del Líder asistido por Claude, por reversible y prudente.

### 2026-11-14 — La demo será un video de 30 segundos

- **Contexto:** issues #3 y #13 pedían elegir entre diapositivas (máx. 7) y video (máx. 30 s con subtítulos en inglés).
- **Decisión:** **video de 30 s o menos, con subtítulos en inglés.** La demo la está desarrollando el equipo; el guion de la opción B está en `docs/entrega/08-demo-draft.md`.
- **Alternativas descartadas:** diapositivas. Ventaja perdida: se editan hasta el último minuto. Riesgo del video: un error de subtítulos obliga a regrabar; por eso se graba con margen antes de las 09:00 del domingo.
- **Quién decidió:** Carlos (Líder).

### 2026-11-14 — Un integrante es menor de edad: no aparece en la demo ni en el proyecto

- **Contexto:** el requisito oficial de la demo dice: "Do NOT include names, voices, or likenesses of anyone under the age of 18" (`docs/referencia/envio-del-proyecto.md`; regla 7 de `AGENTS.md`). Carlos informó que **un integrante es menor de edad** y que el resto son mayores.
- **Decisión:** esa persona **no se nombra ni se muestra ni se oye** en el video, las diapositivas, las capturas, la página del proyecto ni los textos de entrega. Puede seguir registrada en la pestaña *Members* de la plataforma, que es un requisito de elegibilidad. Por privacidad **no se anota aquí quién es**.
- **Hecho:** el nombre se quitó de la lista de integrantes de `docs/entrega/08-demo-draft.md` (diapositiva 1) el 2026-11-14. **Hecho también (2026-11-14, por indicación de Carlos):** se tacharon las dos menciones de esa persona en `docs/referencia/plan-radar-paceno.md` (documento original del equipo, repositorio público), donde figuraba por su nombre de pila con tareas de diseño y de video y narración. Quitarlo no borra el nombre del historial de git. **Hecho:** el `.docx` original se borró del repositorio (`main` y `dev`) el 2026-11-14 por indicación de Carlos, y se corrigieron las dos referencias que apuntaban a él. **Pendiente, decidido por Carlos para mañana, después de la entrega:** quitar el nombre del historial de git (reescribir la historia y `force push`, con todo el equipo avisado) y pedir a GitHub Support que purgue las referencias de los PR; no afecta a la entrega.
- **Quién decidió:** Carlos (Líder).

### 2026-11-14 — Hora límite de subida: 14:00 (reemplaza las 12:00)

- **Contexto:** Carlos informó que "la hora de subir es a las 2 pm realmente, ya que el equipo necesita tiempo para practicar". Antes se había dicho 12:00 (confirmación verbal del Local Lead); la diapositiva oficial dice 23:59 y el jurado evalúa a las 17:00. Sigue sin haber documento escrito de la sede.
- **Decisión:** el límite que rige es **dom 15 nov 14:00**. Se mantiene una hora de margen, así que "Submit for Judging" se pulsa **a más tardar a las 13:00**, y el borrador completo queda a las **11:00**. El congelamiento de funciones (sáb 22:00) no cambia. Se conserva el margen porque la hora sigue sin respaldo escrito.
- **Pendiente:** pedir al Local Lead la hora por escrito (o ver si la plataforma muestra el cierre). Si Carlos aclara que las 14:00 es solo una meta interna del equipo y no un cambio de la sede, el límite sigue siendo 12:00 y el envío debe ser antes de las 11:00.
- **Alternativas descartadas:** volver a 11:00 por precaución; Carlos prefirió dar tiempo de práctica.
- **Quién decidió:** Carlos (Líder).

### 2026-11-14 — Hora límite oficial: domingo 23:59 (reemplaza 12:00 y 14:00)

- **Contexto:** se habían dicho de palabra las 12:00 y luego las 14:00. Carlos aclaró que la hora límite **oficial** es el domingo 15 de noviembre a las **23:59**, lo que coincide con la diapositiva oficial de horarios y con la guía global.
- **Decisión:** el límite oficial es **23:59**. Se conserva como **meta interna** pulsar "Submit for Judging" a más tardar a las **13:00** (borrador completo a las 11:00), para que el equipo practique antes de la evaluación del jurado (17:00). El congelamiento de funciones (sáb 22:00) no cambia.
- **Cierra el pendiente** de conseguir la hora por escrito: ya hay documento (diapositiva oficial). Reemplaza las entradas "12:00" y "14:00".
- **Quién decidió:** Carlos (Líder).

### 2026-11-14 — Calor: la web muestra el aire y la superficie juntos

- **Contexto:** con MODIS (Luca, PR #50), la temperatura de superficie de día (6 puntos) no muestra cambio claro (p = 0.11), mientras el aire de NASA POWER sube +1.465 °C (significativo). Mostrar solo el aire daría una historia más fuerte, pero ocultaría un resultado que lo contradice.
- **Decisión:** la tarjeta y la ficha de **Calor** muestran las dos mediciones y dicen que no coinciden y que no se sabe por qué. El número principal sigue siendo el del aire (es el indicador del contrato), pero la `limitacion` que menciona la superficie debe verse junto a la cifra, no escondida. No se interpreta la baja de ~1.3 °C en El Centenario y Sur hasta revisarla. Frases en `docs/investigacion/hallazgos.md`.
- **Alternativas descartadas:** mostrar solo el aire; mostrar solo la superficie; promediar ambas (no tiene sentido físico).
- **Quién decidió:** Carlos (Líder) con Investigación; propuesta de Claude, pendiente de que Carlos la confirme si prefiere otra cosa.

### 2026-11-14 — Sin congelamiento de funciones

- **Contexto:** el calendario tenía "congelar funciones el sábado a las 22:00". Carlos decidió que no se congela.
- **Decisión:** el equipo trabaja hasta que ya no pueda. La prioridad es que las 4 pantallas muestren datos reales. El agua (issue #7) se hace si llega; si no, se declara "sin datos". Sigue la meta interna de enviar a las 13:00 del domingo y el límite oficial de las 23:59. Lo que sí se mantiene: probar antes de pasar a `main` (regla 9).
- **Reemplaza** el congelamiento de las entradas anteriores sobre el calendario.
- **Quién decidió:** Carlos (Líder).

### 2026-11-14 — Calor: el número principal es la superficie (MODIS); el aire va en la nota

- **Contexto:** el PR #63 de Luca (ya en `main` desde el PR #65) cambió Calor a la temperatura de superficie de MODIS, y lo anotó como "decisión de Carlos". Carlos aclaró que **no la había tomado**; dijo que debe ser lo más conveniente y que la anotación fue un error suyo.
- **Decisión:** se acepta lo que quedó, porque es lo más coherente con las reglas 1 y 2: la tarjeta de Calor muestra la superficie MODIS ("sin cambio claro", p = 0.11, sin cifra) y su nota dice que el aire de NASA POWER sí sube +1.47 °C y que las dos medidas no coinciden. No se esconde ninguna de las dos. En el mapa, calor por zona dice "Sin cambio claro" con la nota de que la baja de El Centenario y Sur depende de la prueba y de 2022-2025.
- **Reemplaza** la entrada anterior ("la web muestra el aire y la superficie juntos") solo en cuál es el número principal; sigue valiendo que las dos mediciones se ven y que se dice que no coinciden.
- **Cómo se revierte:** si Carlos prefiere al aire como número principal, es un cambio en `analisis/exportar.py` (indicador `calor`) y en `web/data/indicadores.json`.
- **Quién decidió:** Carlos (Líder) la acepta el 2026-11-14 sin haberla propuesto; propuesta original de Luca, revisada por Claude e Investigación.

### 2026-11-14 — Login con Supabase: clave publishable en el repo y correo de contacto

- **Contexto:** Programación B implementa un login opcional con Supabase Auth (issue #73). Hacía falta decidir cómo llega la clave publishable a GitHub Pages y qué correo pone el aviso de privacidad para borrar cuentas.
- **Decisión:** (1) la clave **publishable/anon** de Supabase **sí se sube al repo** (en `web/js/config.js`), porque es pública por diseño y la protegen las reglas de Row Level Security; **nunca** `service_role` ni `sb_secret_`. (2) El correo de contacto del aviso de privacidad para pedir que se borre una cuenta es el que dio Carlos (contactarfloppa@gmail.com). (3) Carlos comprobó que el correo de confirmación de Supabase sí llega.
- **Condiciones que siguen valiendo:** login opcional, solo correo y contraseña, corte el domingo a las 09:00 (issue #73).
- **Quién decidió:** Carlos (Líder), 2026-11-14.

### 2026-11-14 — Calor de superficie: la serie se corta en 2021 por la deriva de Terra

- **Contexto:** con 2001-2025 la superficie MODIS daba "sin cambio claro" (p = 0.11); con 2026 daba una baja de -1.06 °C. Luca comprobó con `Day_view_time` de MOD11A2 que desde 2022 Terra pasa cada vez más temprano (hora local media de unas 10.8 h a 9.2 h en 2026), así que la superficie se mide antes de calentarse y la serie baja de forma artificial. Con 2001-2021 sale +0.94 °C significativo (p = 0.0003) y El Centenario y Sur (la "baja" que reproduje) dejan de salir significativos (PR #90).
- **Decisión:** Calor muestra la superficie MODIS en 2001-2021 (+0.94 °C) y el aire POWER (+1.47 °C, 2001-2025) en la nota; la limitación explica el corte completo en la tarjeta. Falta el contraste con Aqua (MYD11A2): si Aqua no muestra calentamiento, se revisa. Es la causa más probable, no está probada; la web no la presenta como hecho.
- **Reemplaza** la entrada "Calor: el número principal es la superficie (MODIS)" solo en el periodo y en la cifra: antes "sin cifra".
- **Cómo se revierte:** `python -m analisis.exportar --calor-hasta 2025` y `python -m analisis.zonas --calor-hasta 2025`, y copiar a `web/data/`.
- **Quién decidió:** propuesta de Luca, aceptada en `dev` por el asistente del Líder; **confirmada por Carlos el 2026-11-14** (ver la entrada siguiente).

### 2026-11-14 — Carlos confirma Calor 2001-2021; entra el Mapa Agrícola; el PR #85 se queda como vehículo a `main`

- **Calor:** Carlos confirmó la superficie MODIS en 2001-2021 (+0.94 °C) **con la condición de que no haya datos de superficie más recientes y confiables**. Si el contraste con Aqua (#87) u otro producto permite medir bien 2022-2026, se vuelve a revisar con él. Mientras tanto no se extiende la serie.
- **Mapa Agrícola (PR #88, Diego):** Carlos decidió que **entra**. No lo pidió el reto; se acepta como pantalla extra. Condiciones que siguen vigentes: auditoría de fuentes por Luca antes de `main`, versión en inglés, y todo recurso nuevo (SIAP, CONAGUA/DOF, SoilGrids CC BY 4.0, SMN, GeoNames, NASA POWER) en `docs/RECURSOS.md` y `docs/entrega/07`. Si no pasa la auditoría, se deja fuera de `main`.
- **PR #85 (dev → main):** lo decidió el asistente del Líder por encargo de Carlos. Es un PR de rama a rama y se actualiza solo con `dev`, así que **se conserva como vehículo** (no se cierra ni se reabre otro). Se retituló y su descripción lleva la puerta de calidad; **no se fusiona hasta que pase** y Carlos lo apruebe.

### 2026-11-15 — Aqua no confirma la subida de la superficie: se revisa la presentación del calor

- **Contexto:** la entrada del 2026-11-14 dejó Calor en 2001-2021 (+0.94 °C, Terra) y dijo "si Aqua no muestra calentamiento, se revisa". Luca (PR #103, `analisis.contraste_aqua`) encontró que en 2003-2021 Terra da +1.04 °C (p = 0.0005) y Aqua +0.27 °C (p = 0.29, no significativo); Aqua también cambia su hora de paso desde 2022 (13.4 h a 15.2 h, más tarde). Carlos confirmó el corte en 2021 con la condición de "datos más recientes y confiables"; esta es una información nueva, no cubierta por esa confirmación.
- **Estado:** **resuelto: Carlos eligió la opción B** (ver la entrada siguiente).
- **Opciones:** (A) mantener Terra como cifra principal y agregar que Aqua no lo confirma; (B) **recomendada por el asistente:** encabezar con la temperatura del aire (+1.47 °C, POWER, significativa) y mostrar la superficie como no concluyente (Terra +0.9 °C, Aqua sin cambio claro, ninguna con hora de paso estable), sin cifra principal de superficie; (C) volver a "sin cambio claro" para la superficie. Cualquier opción exige cambiar la limitación en `exportar.py` (ES y EN), `web/data/`, y `docs/entrega/04`, `06`, `08`.

### 2026-11-15 — El login con Supabase no entra a la entrega

- **Decisión:** el asistente del Líder, por encargo de Carlos ("decide"). Se cierra el PR #77 **sin fusionar**; la rama `prog-b/login` y el proyecto de Supabase se conservan para después del evento.
- **Por qué:**
  1. **No cumple una función para quien lo usa.** La cuenta no guarda nada ni personaliza nada; las 4 preguntas del reto se responden sin cuenta, y el relato dice "sin cuenta".
  2. **Agrega obligaciones sin tiempo para cumplirlas:** correos de residentes (datos personales; solo +18, aviso de privacidad, canal de borrado), pantallas en inglés, revisión de seguridad de Luca y una prueba real de registro en celular que nadie ha hecho; además, el correo predeterminado de Supabase tiene límites y puede fallar justo cuando el jurado lo pruebe.
  3. **La prioridad que Carlos fijó** era 1) interfaz, 2) celular real, 3) login. El tiempo se usa mejor en el inglés de la web (requisito de elegibilidad) y en la puerta de calidad.
- **Qué se hace:** `docs/entrega/07` y `CHECKLIST-ENVIO` ya no esperan Supabase; `docs/RECURSOS.md` marca `supabase-js` y Supabase Auth como "no se usa en la entrega". No hay que quitar nada de `web/` (el login nunca llegó a `dev`).
- **Cómo se retoma:** después de la entrega, abrir de nuevo la rama `prog-b/login` (22 pruebas, clave publishable ya conectada) y cerrar lo pendiente: propósito de la cuenta, revisión de Luca y prueba real de registro.

### 2026-11-15 — Calor: Carlos elige la opción B (aire principal, superficie no concluyente)

- **Decisión de Carlos:** opción **B**. Resuelve la entrada anterior ("Aqua no confirma la subida de la superficie").
- **Qué se muestra:** la tarjeta de calor encabeza con la **temperatura del aire (NASA POWER T2M): +1.47 °C en 2001-2025, significativa**. La **superficie MODIS** se muestra solo como **no concluyente**, sin cifra principal: Terra +0.9 °C (2001-2021), Aqua sin cambio claro (+0.27 °C, p = 0.29, 2003-2021), y la hora de paso de ambos satélites se mueve desde 2022. Es lo que dice la limitación (ES y EN).
- **Mapa de calor por zona:** conserva las cifras por zona de la serie Terra 2001-2021, **con una nota visible** de que Aqua no confirma la tendencia de superficie y que son orientativas. No se presenta ninguna como "significativa" sin esa nota. (Decisión del asistente del Líder dentro de la opción B; Carlos la puede cambiar a "sin cifra por zona".)
- **Cómo se implementa:** Luca cambia `exportar.py` para que `calor` salga de POWER T2M (la rama que ya existe) con la limitación nueva en ES y EN; Diego ajusta la nota del calor por zona (ES y EN). Los textos de `docs/entrega/04`, `06`, `08` y `hallazgos.md` ya están alineados. `docs/entrega/06` suma MYD11A2 (Aqua) como dato NASA usado.
- **Reemplaza** la presentación de Calor de las entradas del 2026-11-14 ("el número principal es la superficie (MODIS)" y "Calor 2001-2021"); el corte de Terra en 2021 sigue.

### 2026-11-15 — Simulaciones en el Mapa y la Ficha, y lenguaje sencillo

- **Decisión de Carlos (en el chat, madrugada del 15 nov):** construir las cuatro cosas, porque los mapas eran "recuadros rojos aburridos" y la web tenía muchos tecnicismos.
- **1. Mapa, "Mira La Paz desde el espacio":** fotos reales del satélite Terra de la NASA (servicio GIBS), una por año, 2001-2026, tomadas en abril, con control de año y botón Reproducir. Dos vistas: "Vista real" (color) y "Calor del suelo" (compuesto de 8 días, con la escala de colores oficial de GIBS en °C). El bloque dice que es **una foto por año, no una tendencia**, y que la temperatura del suelo no es la del aire (Aqua no la confirma). No se agrega ninguna cifra: son imágenes de la NASA.
- **2. Ficha, "Viaja en el tiempo":** control de año con la serie anual real de cada indicador (`serie_anual`), con una frase en palabras sencillas, un medidor y una gráfica con la línea de tendencia.
- **3. Proyección "si la tendencia sigue":** solo **calor y vegetación** (tendencia clara), hasta **2035**. Prolonga la línea de Sen publicada (`tendencia_por_decada`), con el intercepto como mediana de y − m·x. Se muestra con borde punteado y la etiqueta "Si la tendencia sigue (no es un pronóstico)", más un aviso: solo prolonga la línea de los últimos años, el clima real puede cambiar y no explica por qué cambia (regla 2). **No se proyecta la lluvia** (sin tendencia clara) **ni el agua** (anomalía regional, no del acuífero de La Paz); la pantalla explica por qué.
- **4. Lenguaje sencillo:** cada ficha abre con una frase de qué mide; el método (Mann-Kendall, Sen), el p-valor y alfa pasan a un desplegable "Detalles técnicos"; la pregunta oficial "¿Es estadísticamente significativo?" se conserva con la respuesta en palabras simples primero. El mapa de zonas numera cada zona con su lugar en la lista de abajo.
- **Qué cambia respecto a `docs/PLAN-CIERRE.md` (regla 2):** el botón "Iniciar simulación" de Figma sigue sin construirse tal cual (su función era "por confirmar"); lo que se agrega son simulaciones que **solo usan datos reales del proyecto o imágenes de la NASA**. Sigue vigente que no se inventan números.
- **Riesgos y cómo se quitan:** (a) la proyección es una extrapolación lineal; si Carlos prefiere no mostrarla, basta que `permiteProyeccion` devuelva `false` en `web/js/simulaciones.js` y el control termina en 2025; (b) las imágenes de GIBS necesitan conexión (sin ella se avisa y el resto del mapa sigue); (c) la capa "Calor del suelo" es Terra, que marcamos como no concluyente: por eso el bloque la presenta como foto y remite a la Ficha.
- **Pendiente:** mencionar las simulaciones en `docs/entrega/04` y en el guion del video (`08`) cuando Carlos revise; Ehileen puede pulir el aspecto con su diseño.

### 2026-11-15 — El Mapa Agrícola entra a `main` con la reserva de SIAP y SEPADA; la proyección se queda

- **Decisión de Carlos (chat):** la proyección "si la tendencia sigue" **se queda**; la reserva del Mapa Agrícola la decide el asistente ("toma la mejor decisión para esta situación"); fusionar el PR #85 si se puede.
- **Intento de cerrar la reserva (2026-11-15, ~02:00):** SIAP (`nube.agricultura.gob.mx`) no respondió en 21 s y SEPADA (`sepada.bcs.gob.mx`) tampoco en 10 s. No hay caché de la descarga en este equipo (la de Diego está en el suyo). No se pudo verificar nada nuevo.
- **Decisión del asistente del Líder:** el Mapa Agrícola entra **completo**, con la reserva declarada. Razones: (1) las cifras de Cultivos salen de la descarga directa del SIAP del 14 nov con `web/tools/armar_agricola.py`, no se escribieron a mano; (2) la aritmética interna cuadra (2,620.5 / 3,879.6 ha = 67.5 %); (3) nada contradice su fuente, solo no se pudo reabrir; (4) cada ficha muestra su fuente y la fecha de consulta (14 nov 2026); (5) quitar Cultivos dejaría el mapa sin su dato principal y la regla 1 se cumple diciendo qué no se pudo verificar.
- **Qué se declara:** en la entrega y ante el jurado, las cifras de SIAP 2025 y la cita de SEPADA son de la consulta del 14 nov y **no se volvieron a verificar el 15 nov**.
- **Cómo se cierra o se revierte:** Luca (`docs/investigacion/auditoria-agricola.md`) las compara con el SIAP en cuanto responda y el veredicto pasa a "pasa". Si algo no coincide, se corrige en `web/data/agricola.json` (o se retira esa ficha) y se avisa a Carlos. Carlos puede cambiar esta decisión en cualquier momento.
- **Proyección:** se queda tal como está (solo calor y vegetación, hasta 2035, "no es un pronóstico"); queda registrada en la entrada "Simulaciones en el Mapa y la Ficha".

### 2026-11-15 — El cielo ahora en BCS (clima en vivo) entra a Inicio

- **Decisión de Carlos (chat, tras el #145):** "conecta los iconos". Resuelve la decisión 1 de #144: el clima en vivo entra **hoy, antes de enviar**; la proyección de las fichas también se queda.
- **Qué es:** sección "El cielo ahora en BCS" en Inicio, con estado del cielo (íconos de Material Symbols) y temperatura de 8 puntos de BCS (La Paz, Los Cabos, Loreto, Comondú, Mulegé, Guerrero Negro, Bahía Magdalena y Santa Rosalía) y el mapa "Monitoreo satelital" con la imagen casi en tiempo real de GOES-West (NASA GIBS) y pines de ícono y temperatura. **Versión final: la de Ehileen (#152, fiel al frame de Figma)**; sustituyó a mi primera versión (#149, mapa con VIIRS NOAA-20), que se retiró al fusionar.
- **Fuente:** API de Open-Meteo, una llamada desde el navegador, sin clave. Licencia: CC BY 4.0 con atribución y uso no comercial (términos del API gratuito, consultados hoy; la página /en/license no cargó). El proyecto es gratuito y sin anuncios, así que cumple; la web muestra la atribución con enlace. Coordenadas de GeoNames (vía el geocodificador de Open-Meteo): Los Cabos = Cabo San Lucas, Comondú = Ciudad Constitución, Bahía Magdalena = Puerto San Carlos.
- **Cómo se presenta:** "Ahora · modelo Open-Meteo (no son estaciones)"; la nota dice que es el estado de ahora, no una tendencia ni una medición de estación. Es contexto: no responde las preguntas del reto ni sustituye ninguna tendencia. `docs/entrega/04` y `07` y `docs/RECURSOS.md` lo registran.
- **Cómo falla:** sin conexión, la sección dice que no se pudo cargar y el resto de Inicio no cambia; si GIBS no responde, se usa la imagen MODIS fija. Un código desconocido dice "Sin dato del cielo"; nunca se muestra un valor inventado. Un dato de más de 1 hora lleva aviso.
- **Riesgos:** depende de un servicio externo y su IP-limit gratuito (menos de 10,000 llamadas por día: sobrado); cada visitante le envía su IP a Open-Meteo (anotado en `RECURSOS`). Carlos puede quitarla borrando `web/js/cielo.js` del `index.html`.

### 2026-11-15 — Entran las pestañas Pesca y Avisos (mapa de iconos, datos reales)

- **Pedido de Carlos (chat):** agregar Pesca y Avisos y Alertas, fieles al Figma con ajustes de proporciones; mapa de iconos; sin gráficas, tablas ni descripciones largas; iconos libres; bien integradas. Plan: `docs/PLAN-PESCA-AVISOS.md`. **Reabre** la regla 1 de `docs/PLAN-CIERRE.md` (Pesca no se construye), con la condición de siempre: nada inventado.
- **Decisiones 2 y 4 del plan** (Carlos pidió terminar lo que faltaba y no las contestó, así que se aplicó lo recomendado; las puede cambiar): **(2)** el "Semáforo de Seguridad" del Figma se llama **"Estado del mar (modelo)"**, verde, amarillo o rojo con las escalas de Douglas y Beaufort y la leyenda "no es aviso oficial" (no se muestra una bandera que parezca decretada por la Capitanía); **(4)** Pesca primero y Avisos después, con corte duro a las 10:30; Clima queda fuera.
- **Qué se quitó del Figma por no tener fuente:** dictamen de SEMAR, 4 pilares, teléfonos y frecuencias, protocolos, descarga de PDF, tabla de mareas, "Bandera Amarilla", "Zona favorable / alta biomasa", "Red de Boyas SEMAR" y los 8 avisos de ejemplo.
- **Fuentes:** Open-Meteo Marine y Forecast (modelo de ~9 km, no boyas; CC BY 4.0, atribución en pantalla), capa de clorofila VIIRS NOAA-20 de NASA GIBS, y las escalas citadas en `docs/investigacion/umbrales-mar.md`. **Sin regla de calor ni de lluvia en mm/h:** sus umbrales solo se confirmaron en fuentes secundarias y con variantes. **NHC solo como enlace:** su feed responde pero el navegador lo bloquea por CORS.
- **Avisos:** automáticos del modelo (rotulados "Modelo", no oficiales), los dos avisos agrícolas ya auditados y enlaces oficiales (SMN, NHC, CENAPRED, SEMAR, CONAPESCA). Si no hay ninguno, la pantalla lo dice.
- **Menú (indicación de Carlos):** superior de texto en escritorio (>= 1024 px) e inferior con iconos en celular, con "Más" (Ficha, Agro, Acciones) para no pasar de 5.
- **Límites declarados:** la rejilla marina de ~9 km no distingue dentro de las bahías; depende de Open-Meteo y NASA GIBS (sin conexión avisa y el resto de la web no cambia).

## Fuentes e IA documentadas, no repetidas en pantalla (Carlos, 2026-11-15)

- **Regla (la indicó Carlos en el chat; el texto oficial está por citar):** toda fuente de información y toda IA se documentan en `docs/` o en GitHub; no hace falta repetirlas en cada pantalla. Documento central: `docs/FUENTES-Y-IA.md`.
- **Qué se quitó:** la etiqueta "AI-generated" junto al logo del encabezado, las líneas "Fuente: …" de las tarjetas de Inicio y del Mapa Agrícola, y dos créditos de imagen repetidos. **Qué se queda:** atribución de OpenStreetMap y de Open-Meteo (sus licencias la exigen), rótulos de seguridad, limitaciones, pie con licencia y línea de IA. Ahorro medido en celular: Inicio 4399 → 3945 px, Agro Clima 6210 → 5836 px.
- **Riesgo declarado:** la diapositiva oficial de envío que tenemos pide marca de agua visible en imágenes generadas; el logo (única imagen generada) conserva la declaración en el pie y en `docs/entrega/05`, y la etiqueta en el pie de Inicio. Si la sede o la NASA lo piden, se vuelve a mostrar quitando `.marca-ia{display:none}` de `web/css/fuentes.css`.
