---
name: equipo-sync
description: Úsala al iniciar sesión, antes de subir cambios o al coordinarte con el equipo de Radar BCS: sincronización con scripts/sync.ps1, ramas rol/tema, PR a dev, handoffs, issues con etiquetas, y dónde van los archivos pesados (Drive).
---

# Protocolo de equipo (GitHub + Drive)

## Al iniciar
```
pwsh scripts/sync.ps1      # o: powershell -File scripts/sync.ps1
```
Actualiza `dev`, lista tus issues y los handoffs. Si el script no existe aún, haz a mano:
```
git fetch origin --prune
git switch dev && git pull --ff-only
gh issue list --assignee @me --state open
```
Lee `docs/handoffs/*.md` antes de tocar algo que otro rol hizo.

## Ramas y PR
- `main`: estable, lo ve el jurado. **Solo el Líder fusiona a `main`.**
- `dev`: lo más reciente. Trabaja en `rol/<tema>`: `prog-a/pipeline`, `prog-b/mapa`, `ui-ux/paleta`, `ciencia/metodo`, `lider/entrega`.
```
git switch dev && git pull --ff-only
git switch -c prog-b/mapa
# ... cambios solo en tus carpetas ...
git add <archivos>
git commit -m "Agrega mapa de zonas con datos de prueba"
git push -u origin prog-b/mapa
gh pr create --base dev --title "Mapa de zonas" --body "Qué cambia, cómo probarlo, issue #N"
```
- Commits pequeños y en español. **Sin `push --force`**, sin reescribir historia compartida.
- Cada rol edita solo sus carpetas (`AGENTS.md`). Para tocar las de otro, abre issue o PR y avisa.
- Conflictos: `git fetch && git merge origin/dev` en tu rama, resuelve, prueba, sube.

## Handoff al terminar un bloque
Actualiza `docs/handoffs/<rol>.md` (`lider`, `prog-a`, `prog-b`, `ui-ux`, `ciencia`) con: **qué hice**, **qué falta**, **qué bloquea**, comandos para probarlo. Después comenta el issue y sube.

## Issues y etiquetas
Etiquetas: `rol:lider`, `rol:prog-a`, `rol:prog-b`, `rol:ui-ux`, `rol:ciencia`, `bloqueado`.
```
gh issue create --title "Contrato de datos: campo p-valor" --body "Detalle" --label "rol:prog-a"
gh issue list --label "rol:prog-b" --state open
gh issue comment <n> --body "Listo en PR #<m>"
gh issue edit <n> --add-label "bloqueado"
gh issue close <n>
```
Si las etiquetas no existen: `gh label create "rol:prog-a" --color 0E8A16` (y las demás). Un bloqueo se abre como issue con `bloqueado` y mención a @INGIDSCarlosDanC21.

## Archivos pesados
- **Nada >5 MB en el repo** (datasets, video, 3D, audio, GeoTIFF, NetCDF). Van a Google Drive; el enlace de la carpeta está en `docs/DRIVE.md`. En el repo solo queda el enlace y un README breve.
- La caché `data/cache/` está ignorada por git: no la agregues con `git add -f`.
- Antes de subir: `git status` y `git diff --cached --stat`; revisa tamaños.

## Secretos
El repo es público. Claves en `.env` (ignorado); plantilla en `.env.example` sin valores. Si subiste un secreto por error, avisa al Líder de inmediato y revoca la clave (borrar el commit no basta).

## Antes de decir "listo"
Corre la prueba o abre la página y reporta el resultado real. Registra recursos nuevos en `docs/RECURSOS.md`.
