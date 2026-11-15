# Presentación HTML · sistema de diseño

**Idea:** la misma marca de la web (marino, cian, Space Grotesk/Manrope/JetBrains Mono) en modo noche, con el movimiento del tráiler (curva SUAVE `cubic-bezier(0.16,1,0.3,1)`, grano, viñeta, viento). Lienzo 1280×720. **Zona segura 960×720 centrada** (x 160–1120): en 16:9 se ve todo; en 4:3 (proyector 800×600) `deck.js` ajusta la zona segura al ancho y recorta los lados, que solo llevan decoración.

**Estructura fija (la pone `js/deck.js`, no las partes):** barra de 6 segmentos, chip `N/6 · PARTE`, línea de objetivo, orador abajo a la izquierda y cronómetro abajo a la derecha. Partes, oradores, objetivos y tiempos están en `PARTES` dentro de `deck.js`. Teclas: **T** cronómetro parte/global · **R** reinicia · **S** notas · **F** pantalla completa.

**Ritmo de movimiento:** una sola entrada por diapositiva (`data-animacion` en la `<section>`, `data-entra` en cada pieza). Líder primero (`data-entra="lider"`, sube 26 px, 760 ms), resto escalonado 30–80 ms (16 px, 620 ms), decoración solo fundido (`data-entra="decor"`). Cifras: `data-contador="1.47" data-decimales="2"` (sube en 1.4 s, formato es-MX). Sello: `<span class="sello" data-sello="700">p &lt; 0.001</span>` (cae a los 700 ms). Con `prefers-reduced-motion` todo se vuelve fundido de opacidad y el viento queda quieto.

**Qué usar en cada parte**
| Parte | Recurso principal |
|---|---|
| 1 Gancho | `display` + una `cifra` grande; poca tinta, mucho fondo |
| 2 Problema | `titulo` + `lista` o `rejilla-3` de `tarjeta`; calor solo con `.calor` |
| 3 Solución + NASA | `columnas texto-captura` con `telefono`; `chip-dato` por dataset; `sello` |
| 4 Demo | `telefono` con `assets/capturas/*.png`, una captura por diapositiva, `etiqueta` arriba |
| 5 Impacto | `rejilla-3`/`rejilla-4` de `tarjeta acento` |
| 6 Cierre | una frase en `display`, `zona centro`, nada más |

**Reglas para mantener coherencia**
1. Todo texto dentro de `<div class="zona">` (x 160–1120, y 148–636). Fuera de la zona solo decoración en `.sangrado`.
2. Tamaños mínimos: título 56 px, cuerpo 26 px, etiquetas 18 px. No bajar con estilos propios.
3. Sin `style=""` ni `<script>` en las partes; si falta una clase, se agrega a `css/deck.css` (avisar al líder). `build.mjs` avisa si los encuentra.
4. Naranja (`.calor`, `--p-calor`) **solo** para calor. Cian = dato/foco; verde = significativo/confirmado.
5. Toda cifra lleva `<p class="fuente">` con dataset real (AGENTS.md reglas 1–3). Decir qué cambió, no por qué. Sin logos de la NASA. Sin nombre, foto ni voz de menores (el orador 5 es "Integrante 6").
6. Máximo una idea y ~20 palabras visibles por diapositiva; lo demás va a `<aside class="notes">`.
7. **3D:** `vendor/model-viewer` es módulo ES y carga `.glb` con fetch: **no funciona con doble clic (file://)**, solo servido por http. Si se usa, debe tener una imagen de respaldo; no depender de él en vivo.

**Verificar:** `node presentacion/build.mjs` y luego `node presentacion/verificar.mjs <carpeta-fuera-del-repo> offline` (PNG a 1280×720 y 800×600; en `informe.txt` la lista `"fuera"` debe quedar vacía y sin errores de consola).

## Añadir o llenar una parte (6 pasos)
1. Edita solo tu archivo `partes/0N-nombre.html`; borra el bloque `[CONTENIDO PENDIENTE]`.
2. Cada diapositiva: `<section data-parte="N" data-animacion>` con `<div class="zona">` dentro.
3. Marca piezas con `data-entra` (una `lider`) y usa clases de `css/deck.css`.
4. Notas del orador en `<aside class="notes">` dentro de cada `<section>`.
5. `node presentacion/build.mjs` (regenera `index.html`; nunca edites `index.html` a mano).
6. `node presentacion/verificar.mjs <carpeta-tmp> offline` y revisa las capturas antes de avisar.
