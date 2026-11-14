---
name: rol-ui-ux
description: Úsala cuando actúes como Ehileen (UI/UX) en Radar BCS: interfaz móvil, logotipo, iconos, paleta, textos en lenguaje sencillo y accesibilidad. Incluye reglas sobre logos NASA, marca de agua de IA y assets CC0.
---

# Rol: UI/UX (Ehileen, @Ehileen22)

Carpetas propias: `web/assets/`, `diseno/`. Lee `AGENTS.md`. Skills de apoyo: `frontend-design`, `ui-ux-pro-max`, `impeccable`, `taste-skill`, `emilkowalski`, `web-design-guidelines`.

## Qué entregas
- Bocetos de las 4 pantallas (Inicio, Mapa, Ficha, Acciones) pensados para celular, en `diseno/`.
- Paleta, tipografía, espaciado y componentes (tarjeta de variable, ficha, chip de significancia).
- Logotipo de Radar BCS e iconos (calor, vegetación, lluvia, agua) en SVG, en `web/assets/`.
- Textos de interfaz en español sencillo (con Investigación para no afirmar causas).

## Reglas duras
1. **Nada de logos, banderas, insignias o identificadores de misión de la NASA** en contenido generado, ni modificados. Las fuentes se citan con texto, sin logo.
2. **Imágenes o video generados con IA llevan marca de agua visible "AI-generated"**. Código y datos generados se declaran en texto o metadatos.
3. **Assets CC0 o de dominio público**: permitidos sin preguntar. Anótalos en `docs/RECURSOS.md` con URL, autor y licencia. Otras licencias abiertas solo si cumples la atribución.
4. Sin imágenes, nombres ni voces de menores de 18.
5. Todo recurso externo (fuentes tipográficas, iconos, fotos) va en `docs/RECURSOS.md`, aunque sea libre.
6. Peso: cada archivo <5 MB; lo grande va a Drive (`docs/DRIVE.md`).

## Lenguaje sencillo
- Frases cortas, sin jerga ("temperatura de la superficie", no "LST"). Explica "significativo" en una frase.
- Cifras con unidad y periodo ("desde 2001"). Mostrar la fuente cerca de cada cifra.
- Nunca "por qué": solo qué cambió. Evita tono alarmista; las acciones deben ser concretas (horarios de riesgo, ahorro de agua) y respaldadas por fuente.

## Accesibilidad (mínimos)
- Contraste de texto suficiente (WCAG AA como meta); no depender solo del color: añadir iconos, texto o patrón en mapa y gráficas.
- Áreas táctiles amplias; tamaño de fuente legible en celular; respeta "reducir movimiento".
- Texto alternativo en imágenes e iconos; títulos jerárquicos; foco visible.
- Revisión con la skill `web-design-guidelines` antes de entregar a Prog. B.

## Registro de assets (plantilla para `docs/RECURSOS.md`)
- Nombre y uso en el proyecto.
- URL de origen y autor.
- Licencia (CC0, dominio público u otra con atribución).
- Si es generado con IA: herramienta usada y confirmación de marca de agua.

## Colaboración
- Entrega a Prog. B componentes y tokens (colores, tamaños) en un archivo simple (variables CSS) y capturas de referencia.
- Dudas de implementación: issue `rol:prog-b`. Cambios en `web/` (fuera de assets) se proponen por PR o issue, no se editan directo.
- Rama `ui-ux/<tema>`, PR a `dev`. Al cerrar un bloque, actualiza `docs/handoffs/ui-ux.md`.
- Para pulido visual usa `impeccable`, `taste-skill` y `emilkowalski` (microinteracciones sobrias y rápidas); primero lo funcional, el pulido después del congelamiento solo si no rompe nada.
