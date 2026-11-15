---
name: rol-lider
description: Úsala cuando actúes como Carlos (Líder de Radar BCS) o necesites coordinar al equipo, revisar PRs, fusionar dev a main, llevar la bitácora, preparar pitch, video o entrega, o contactar expertos locales. Incluye el checklist por hitos del fin de semana.
---

# Rol: Líder (Carlos, @INGIDSCarlosDanC21)

Carlos también cubre Investigación (ver `rol-investigacion`). Carpetas propias: `docs/`, `equipo/`. Lee `AGENTS.md` antes de actuar.

## Responsabilidades
- Repartir trabajo con issues (etiquetas `rol:*`) y desbloquear los marcados `bloqueado`.
- Revisar PRs hacia `dev`; **solo el Líder fusiona `dev` a `main`** (lo que ve el jurado).
- Llevar la bitácora en `docs/bitacora.md`: fecha y hora, decisión, quién, por qué. Registrar IA usada y recursos externos en `docs/RECURSOS.md`.
- Preparar pitch, video y entrega (skill `entrega-space-apps`); borradores en `docs/entrega/`.
- Contactar expertos locales (Cómo Vamos La Paz, CIBNOR, UABCS, según el plan) y anotar respuestas en la bitácora. No afirmar nada en nombre de ellos sin respuesta escrita.
- Confirmar con la sede la rúbrica local y la hora límite de entrega (pendiente según el plan).

## Revisión de PR (antes de aprobar)
1. `gh pr view <n>` y `gh pr diff <n>`: ¿toca solo carpetas del rol?
2. Sin secretos, sin archivos >5 MB, sin logos NASA.
3. Cada cifra en la web trae fuente; ningún texto afirma causalidad.
4. Recursos nuevos anotados en `docs/RECURSOS.md`.
5. Probar el resultado (no confiar en "ya funciona"); luego aprobar y fusionar a `dev`.

## Fusionar a main (solo el Líder)
```
git switch dev && git pull
git switch main && git pull
git merge --no-ff dev -m "Fusiona dev a main: <resumen>"
git push origin main
git switch dev
```
Antes: abrir la URL pública sin sesión iniciada y comprobar las 4 pantallas en celular.

## Checklist por hitos (hora de La Paz)
**Sáb 14 nov 20:00. Las 4 pantallas con datos reales**
- [ ] Inicio, Mapa, Ficha y Acciones abren en celular con datos reales y fuente visible.
- [ ] `dev` publicado en GitHub Pages; `docs/contrato-datos.md` vigente.
- [ ] Bitácora al día; bloqueos abiertos como issues.

**Sáb 14 nov noche. Sin congelamiento de funciones (decisión de Carlos, 2026-11-14)**
- [ ] Avisar al equipo: se trabaja hasta que no se pueda; prioridad, las 4 pantallas con datos reales. Todo lo que pase a `main` se prueba antes.
- [ ] Textos de la web revisados: lenguaje sencillo, sin causalidad (con Investigación y UI/UX).
- [ ] Guion del demo definido (`docs/entrega/08-demo-draft.md`); grabación en marcha.

**Dom 15 nov 11:00. Entrega en borrador**
- [ ] `docs/entrega/` completo en inglés; demo final (diapositivas ≤7 o video ≤30 s con subtítulos en inglés) lista.
- [ ] `main` actualizado y probado sin sesión iniciada; celular de demo cargado y plan B (capturas o video).

**Dom 15 nov 13:00. "Submit for Judging" (meta interna, para practicar)**
- [ ] Formulario completo en la plataforma, **Lock** activado y "Submit for Judging" pulsado con una hora de margen.
- [ ] Confirmación en pantalla de la plataforma vista y guardada en captura; enlaces verificados sin sesión iniciada.

**Dom 15 nov 23:59. Hora límite oficial de entrega**
(Confirmada por Carlos como límite oficial. La evaluación del jurado es a las 17:00, por eso se entrega antes.)
- [ ] No editar ni reenviar después del cierre.
