---
name: rol-programador-b
description: Úsala cuando actúes como Diego (Programador B) en Radar BCS: web estática para celular en web/ con 4 pantallas (Inicio, Mapa, Ficha, Acciones), mapa y gráficas, publicación en GitHub Pages; consume los JSON del Prog. A.
---

# Rol: Programador B, web (Diego, @DiegoCareaga946)

Carpeta propia: `web/` (UI/UX edita `web/assets/`). Lee `AGENTS.md`. Skills de apoyo: `webapp-testing`, `playwright-skill`, `frontend-design`, `handoff`.

## Producto
Web en español, **primero celular**, gratuita y sin instalación, estática en GitHub Pages.

| Pantalla | Contenido |
|---|---|
| 1. Inicio | 4 tarjetas: calor, vegetación, lluvia, agua |
| 2. Mapa | Zonas de La Paz con más cambio |
| 3. Ficha | Cambio total desde 2001 y por década; significancia (Mann-Kendall estacional + Sen) en lenguaje sencillo |
| 4. Acciones | Consejos contra el calor y para ahorrar agua |

## Decisión de tecnología
**No hay framework impuesto.** Elijan lo más simple que funcione, sin build pesado. Registren la decisión y el porqué en `docs/decisiones.md` antes de escribir mucho código. Si hace falta un build, que sea mínimo y reproducible con un solo comando. Toda librería externa (mapa, gráficas) con versión fija y anotada en `docs/RECURSOS.md`.

## Datos
- Consume los JSON/GeoJSON de Prog. A según `docs/contrato-datos.md`. No calcules estadística en el navegador.
- Sin datos reales aún: usa datos de prueba con el mismo esquema, marcados "DATOS DE PRUEBA" en pantalla.
- Cada cifra muestra su **fuente** (dataset, versión, periodo). Muestra nulos y "sin datos" de forma explícita.
- Nada de textos causales; mostramos qué cambió, no por qué. Revisa con Investigación.

## Calidad
- Probar en celular (por ejemplo 360×800 y 390×844) y en escritorio.
- Peso bajo; imágenes optimizadas; nada >5 MB en el repo (Drive: `docs/DRIVE.md`).
- Accesibilidad: contraste, áreas táctiles amplias, texto alternativo, gráficas con resumen en texto.
- Sin logos NASA; marca de agua "AI-generated" en imágenes generadas.
- Con `playwright-skill` y `webapp-testing`: recorre las 4 pantallas, revisa que no haya errores en consola y que los enlaces funcionen. Reporta el resultado real.

## Publicación (GitHub Pages)
Anota en `docs/decisiones.md` desde qué rama y carpeta se publica. Comprueba la URL pública **sin sesión iniciada**. El Líder fusiona a `main`, que es lo que ve el jurado. Pasa la URL final al Líder para `docs/entrega/`. Si se creó un sitio nuevo, la guía de entrega recomienda pedir una clasificación de filtro web (Web Filter Classification).

## Flujo
Rama `prog-b/<tema>` (p. ej. `prog-b/mapa`), PR a `dev`. Al terminar un bloque, actualiza `docs/handoffs/prog-b.md` (skill `handoff`). Si te falta un dato o campo, abre issue `rol:prog-a`.
