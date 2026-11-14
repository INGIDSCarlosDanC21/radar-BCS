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
- **Hecho:** el nombre se quitó de la lista de integrantes de `docs/entrega/08-demo-draft.md` (diapositiva 1) el 2026-11-14. **Hecho también (2026-11-14, por indicación de Carlos):** se tacharon las dos menciones de esa persona en `docs/referencia/plan-radar-paceno.md` (documento original del equipo, repositorio público), donde figuraba por su nombre de pila con tareas de diseño y de video y narración. Quitarlo no borra el nombre del historial de git. **Hecho:** el `.docx` original se borró del repositorio (`main` y `dev`) el 2026-11-14 por indicación de Carlos, y se corrigieron las dos referencias que apuntaban a él. **Pendiente:** el nombre sigue en el historial de git; quitarlo exige reescribir la historia y `force push` (decisión de Carlos, con las consecuencias explicadas en el chat).
- **Quién decidió:** Carlos (Líder).
