---
name: orquestar-barato
description: Úsala al iniciar cualquier tarea no trivial en Radar BCS para decidir a quién delegar (subagentes haiku o sonnet, o agentes externos con scripts/delegar.ps1) y así ahorrar tokens. El modelo principal solo orquesta: planea, reparte, revisa e integra.
---

# Orquestar barato

El modelo principal **no** lee archivos grandes ni escribe código repetitivo: planea, reparte, revisa e integra (regla de `AGENTS.md`).

## A quién delegar
| Tarea | Quién | Cómo |
|---|---|---|
| Leer, buscar en el repo, resumir documentos, extraer datos de una página | Subagente **haiku** | Herramienta Agent con `model: "haiku"` |
| Código con razonamiento, depurar, diseñar un módulo, revisar un diff | Subagente **sonnet** | Agent con `model: "sonnet"` |
| Volumen: muchos archivos, redacción larga, traducciones, tablas, código rutinario | Agente externo gratuito | `scripts/delegar.ps1 "<tarea>" [-Agente codex\|opencode\|gemini\|ollama] [-Salida archivo]` |
| Decisiones, integración, revisión final, mensajes al equipo | Modelo principal | Directo |

Sin `-Agente`, el script usa el primero disponible (según `AGENTS.md`). Con `-Salida` guarda la respuesta en un archivo: léela por partes, no la pegues entera en el chat. Si `scripts/delegar.ps1` no existe todavía, pídelo al Líder o usa un subagente.

## Cómo escribir un encargo autocontenido
El agente empieza sin contexto. Incluye siempre:
1. **Objetivo** en una frase y para qué sirve en Radar BCS.
2. **Entradas**: rutas absolutas de archivos o texto pegado; nada de "como hablamos".
3. **Salida exacta**: formato, ruta de destino, longitud, idioma (español de México; entrega oficial en inglés).
4. **Restricciones**: carpetas que sí puede tocar, no tocar otras, sin commit ni push, sin inventar datos (marcar "POR VERIFICAR"), sin logos NASA.
5. **Criterio de aceptación**: cómo sabremos que está bien (prueba que corre, enlace que abre).
Pide que reporte lo que no pudo verificar.

## Cómo revisar el resultado
- Nunca integres sin leerlo. Para código: corre la prueba o el script y mira la salida real.
- Verifica 2 o 3 datos o enlaces al azar; los números deben tener fuente.
- Confirma que solo tocó lo permitido (`git status`, `git diff --stat`).
- Busca invenciones: nombres de funciones, URLs, cifras. Si dudas, vuelve a la documentación oficial.
- Si falla dos veces, reformula el encargo o hazlo tú; no insistas en bucle.

## Cuándo NO delegar
- Tareas de 1 o 2 pasos que cuestan menos hacerlas que explicarlas.
- Decisiones de alcance, prioridades o conflictos entre roles (es del Líder).
- Cualquier cosa con credenciales, `.env` o datos personales.
- Mensajes públicos o acciones irreversibles (enviar, publicar, fusionar a `main`).
- Trabajo que depende de contexto fino de la conversación.

## Seguridad
**Nunca** envíes claves, tokens, contenido de `.env`/`.netrc` ni datos personales a un agente externo. El proyecto no maneja datos sensibles, pero el repo es público: lo que mandes debe poder estar ahí. Registra en `docs/RECURSOS.md` (sección IA) qué herramienta generó qué.

## Ahorro
- Pide resúmenes y rutas, no volcados completos. Guarda descargas en caché (`data/cache/`) y reutiliza.
- Si algo se hará más de una vez, que el agente escriba un script en `scripts/`.

## Restricción sobre modelos chinos

No delegues a modelos de empresas chinas (DeepSeek, Qwen, Kimi, GLM, MiniMax, LongCat, MiMo), tampoco los "gratis" de OpenCode u OpenRouter, hasta que el Local Lead confirme que no afectan la elegibilidad (regla 10 de `AGENTS.md`). `scripts/delegar.ps1` ya fija un modelo no chino para OpenCode.
