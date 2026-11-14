@AGENTS.md

# Notas para Claude Code

- Al iniciar la sesión carga la skill de tu rol (`rol-lider`, `rol-investigacion`, `rol-programador-a`, `rol-programador-b` o `rol-ui-ux`), `orquestar-barato` y `equipo-sync`.
- Las skills del proyecto están en `.claude/skills/`.
- El modelo principal solo orquesta: delega lectura, búsqueda, redacción y código rutinario a subagentes con modelo pequeño (haiku; sonnet si hace falta razonar).
- Revisa lo que devuelven los subagentes antes de integrarlo.
- Correr `scripts/sync.ps1` al empezar y actualizar `docs/handoffs/<rol>.md` al terminar un bloque.
- Plugin recomendado: superpowers. Si no se instaló solo, ejecuta `/plugin install superpowers@claude-plugins-official`.
- Nunca leas ni imprimas `.env`; las claves no van en el chat ni en commits.
