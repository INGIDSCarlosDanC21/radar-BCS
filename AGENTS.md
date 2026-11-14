# AGENTS.md — Radar BCS (equipo OptiPaz)

Fuente única de reglas para cualquier agente (Claude Code, Codex, OpenCode, Crush, Gemini…).
Léelo completo antes de trabajar. Responde y escribe documentación en español; la **entrega oficial va en inglés**.

## Qué es

Proyecto del **NASA Space Apps Challenge 2026, sede La Paz, B.C.S., México**. Equipo **OptiPaz**.
Reto: *Be An Earth System Trend Detective!* (Ciencias de la Tierra y Software).

**Radar BCS** es una web en español, pensada para celular, gratuita y sin instalación, que muestra con datos abiertos de la NASA cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz desde 2001, y qué puede hacer cada vecino. En nuestra división lo que más pesa es el **impacto local**.

La herramienta debe responder cuatro preguntas (confirmadas en la página oficial del reto el 2026-11-14; ver `docs/referencia/reto-earth-system-trend-detective.md`):

| Pregunta | Pantalla | Cómo |
|---|---|---|
| ¿Qué cambia? | 1. Inicio | 4 tarjetas: calor, vegetación, lluvia, agua |
| ¿Dónde? | 2. Mapa | Zonas de La Paz con más cambio |
| ¿Cuánto? | 3. Ficha | Cambio total desde 2001 y por década |
| ¿Es estadísticamente significativo? | 3. Ficha | Mann-Kendall estacional (corrección Hirsch-Slack) + pendiente de Sen |
| (extra) ¿Qué hago? | 4. Acciones | Consejos contra el calor y para ahorrar agua |

Detalle completo: `docs/referencia/` (documentos del evento convertidos a Markdown).

## Fechas (hora local de La Paz)

- Sáb 14 nov 20:00 — las 4 pantallas con datos reales.
- Dom 15 nov 12:00 — congelar funciones; solo bugs.
- **Dom 15 nov 17:00 — evaluación del jurado.**
- **Dom 15 nov 23:59 — cierre de entrega en la plataforma** ("Submit for Judging"). Sin excepciones.

## Equipo y roles

| Persona | GitHub | Rol | Skill | Carpetas propias |
|---|---|---|---|---|
| Carlos | INGIDSCarlosDanC21 | Líder + Investigación/ciencia | `rol-lider`, `rol-investigacion` | `docs/`, `equipo/` |
| Diego | DiegoCareaga946 | Programador A: datos y tendencias (Python) | `rol-programador-a` | `analisis/`, `data/` |
| Luca | luca6874 | Programador B: web, mapa, fichas, GitHub Pages | `rol-programador-b` | `web/` |
| Ehileen | Ehileen22 | UI/UX: interfaz, logotipo, assets | `rol-ui-ux` | `web/assets/`, `diseno/` |

Cada rol edita solo sus carpetas. Si necesitas tocar la de otro, abre un issue o PR y avisa.

## Reglas que no se rompen

1. **No inventes datos.** Todo número, fecha o afirmación lleva fuente verificable (URL o dataset). Si no la tienes: investiga o pregunta. Si algo no se pudo verificar, dilo explícitamente.
2. **Mostramos qué cambió, no por qué.** Una tendencia no prueba la causa.
3. **Datos NASA primero.** Cada cifra en la web muestra su fuente. Datasets previstos: MODIS MOD11A2 (temperatura de superficie, 1 km), MODIS MOD13Q1 (NDVI, 250 m), NASA POWER (lluvia y temperatura del aire, sin cuenta), GRACE/GLDAS (agua subterránea, solo tendencia regional), ECOSTRESS (70 m, foto, no tendencia), NASADEM (relieve). Ver skill `earthdata-datasets`.
4. **Nunca subas secretos.** El repo es público. Las claves van en `.env` (ignorado por git); plantilla en `.env.example`.
5. **Registra todo recurso externo** (código, texto, imágenes, datos, audio, modelos 3D) en `docs/RECURSOS.md` con URL y licencia. La entrega lo exige.
6. **Uso de IA declarado.** Imágenes y video generados llevan marca de agua visible "AI-generated". Código y datos generados se reconocen en texto/metadatos (`docs/RECURSOS.md`, sección IA). **Prohibido usar, incluir o modificar logos o marca de la NASA** en contenido generado.
7. **Sin menores de 18** (nombre, voz o imagen) en demo o proyecto.
8. **No repitas trabajo.** Si una tarea se va a hacer más de una vez, escribe un script en `scripts/` y úsalo. Guarda descargas en caché.
9. Verifica antes de decir "listo": corre el código o la prueba y reporta el resultado real.

10. **Sin servicios de empresas chinas hasta confirmar con el Local Lead.** La NASA revisa a los equipos por actividad bilateral con China o con entidades de propiedad china para la ronda global (`docs/referencia/guia-de-calificacion.md`). No uses DeepSeek, Qwen/Alibaba, Kimi, GLM/Zhipu, MiniMax, LongCat/Meituan ni MiMo/Xiaomi, ni sus modelos "gratis" dentro de OpenCode u OpenRouter. Modelos permitidos por ahora: Claude, Codex/OpenAI, Gemini, Ollama con Gemma o Llama, NVIDIA Nemotron. Si dudas de otra herramienta o fuente de datos, pregunta.

## Recursos en línea

Tienes **permiso total** para descargar y usar recursos **CC0 o de dominio público** sin preguntar; anótalos en `docs/RECURSOS.md`. Otras licencias abiertas (CC-BY, MIT, Apache) también se permiten si cumples la atribución. Si no existe un recurso adecuado, dilo y créalo (Tripo3D para 3D, ElevenLabs para voz, Gemini Pro para imagen/texto), con marca de agua de IA.

## Orquestación y ahorro de tokens

El modelo principal de la sesión **solo orquesta**: planea, reparte, revisa e integra. No lee archivos grandes ni escribe código repetitivo él mismo.

- Lectura, búsqueda, redacción y código rutinario → subagentes con modelo pequeño (haiku; sonnet si hace falta razonar).
- Trabajo en volumen → agentes externos gratuitos con `scripts/delegar.ps1 "<tarea>"` (Codex, OpenCode, Gemini CLI, Ollama; usa el primero disponible y guarda la respuesta en un archivo).
- No hay datos sensibles en este proyecto, así que se puede mandar contexto a agentes externos. **Nunca** claves ni datos personales.
- Revisa siempre lo que devuelve un agente antes de integrarlo.

Ver skill `orquestar-barato`.

## Cómo trabajamos juntos

- **GitHub** = código y coordinación. **Google Drive** = archivos pesados (datasets, video, 3D, audio); enlace en `docs/DRIVE.md`.
- Ramas: `main` (estable, lo que ve el jurado; solo el Líder fusiona) y `dev` (pruebas, lo más reciente). Trabaja en `rol/<tema>` (p. ej. `prog-b/mapa`) y abre PR hacia `dev`.
- Al iniciar sesión: `scripts/sync.ps1` (actualiza `dev`, lista tus issues y los handoffs).
- Al terminar un bloque: actualiza `docs/handoffs/<rol>.md` (qué hice, qué falta, qué bloquea), comenta el issue y sube.
- Bloqueos: issue con etiqueta `bloqueado` mencionando a @INGIDSCarlosDanC21.
- Commits pequeños y en español; no reescribas historia compartida (sin `push --force`).

Ver skill `equipo-sync`.

## Entrega (resumen; detalle en skill `entrega-space-apps`)

Página del proyecto en inglés · resumen de 50–200 palabras · **un** enlace de demo público (máx. 7 diapositivas contando portada, o video ≤30 s con subtítulos en inglés) · enlace al proyecto · detalles · uso de IA · datos NASA con enlaces · otros recursos · licencia Apache-2.0. Borradores en `docs/entrega/`.
Criterios (1–5, también en la evaluación local): Impact, Creativity, Validity, Relevance, Presentation. Detalle y premios en `docs/referencia/guia-de-calificacion.md`. Meta principal: **Local Impact Award**; también Best Use of Data y Best Use of Science. Presentación vale igual que los otros cuatro criterios.
