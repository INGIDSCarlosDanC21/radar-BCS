# Dependencias locales de la presentación (vendor)

Copias locales para que la presentación HTML funcione sin internet. Ningún archivo supera 5 MB.
Todas las copias son de los paquetes npm indicados, descargados con `npm pack --ignore-scripts` (sin ejecutar scripts de instalación) y sin modificar.

| Nombre | Versión exacta | Origen (npm / repo) | Licencia verificada | Archivos locales | Tamaño |
|---|---|---|---|---|---|
| reveal.js | 5.2.1 | npm: <https://www.npmjs.com/package/reveal.js> · repo: <https://github.com/hakimel/reveal.js> | MIT (`package.json` y `LICENSE`) | `reveal/reveal.js`, `reveal/reveal.css`, `reveal/reset.css`, `reveal/plugin/notes/notes.js`, `reveal/LICENSE` | 236 KB (4 archivos) |
| animejs | 3.2.2 | npm: <https://www.npmjs.com/package/animejs> · repo: <https://github.com/juliangarnier/anime> | MIT (`package.json` y `LICENSE.md`) | `anime/anime.min.js`, `anime/LICENSE.md` | 17 KB |
| @google/model-viewer | 4.4.0 (publicada 2026-10-09) | npm: <https://www.npmjs.com/package/@google/model-viewer> · repo: <https://github.com/google/model-viewer> | Apache-2.0 (`package.json` y `LICENSE`) | `model-viewer/model-viewer.min.js`, `model-viewer/LICENSE` | 1.02 MiB (1 069 272 bytes) |
| Space Grotesk (@fontsource/space-grotesk) | 5.3.0 (fuente original: floriankarsten/space-grotesk) | npm: <https://www.npmjs.com/package/@fontsource/space-grotesk> · repo fuente: <https://github.com/floriankarsten/space-grotesk> | SIL OFL 1.1 (`LICENSE`) | `fonts/space-grotesk-latin-500-normal.woff2`, `fonts/space-grotesk-latin-700-normal.woff2`, `fonts/LICENSE-space-grotesk.txt` | 26 KB (2 woff2) |
| Manrope (@fontsource/manrope) | 5.3.0 (fuente original: sharanda/manrope) | npm: <https://www.npmjs.com/package/@fontsource/manrope> · repo fuente: <https://github.com/sharanda/manrope> | SIL OFL 1.1 (`LICENSE`) | `fonts/manrope-latin-600-normal.woff2`, `fonts/manrope-latin-800-normal.woff2`, `fonts/LICENSE-manrope.txt` | 28 KB (2 woff2) |
| JetBrains Mono (@fontsource/jetbrains-mono) | 5.3.0 (fuente original: JetBrains/JetBrainsMono) | npm: <https://www.npmjs.com/package/@fontsource/jetbrains-mono> · repo fuente: <https://github.com/JetBrains/JetBrainsMono> | SIL OFL 1.1 (`LICENSE`) | `fonts/jetbrains-mono-latin-500-normal.woff2`, `fonts/LICENSE-jetbrains-mono.txt` | 21 KB (1 woff2) |

Notas:
- Fuentes: solo subset `latin` en woff2. `fonts/fuentes.css` define `Space Grotesk` (500, 700), `Manrope` (600, 800) y `JetBrains Mono` (500) con `font-display: swap` y rutas relativas. Incluir con `<link rel="stylesheet" href="vendor/fonts/fuentes.css">`.
- Los repos de fuentes indicados se confirmaron con los avisos de copyright de los `LICENSE` de cada paquete.
- model-viewer, en tiempo de ejecución, descarga sus decodificadores desde `gstatic.com` (Draco 1.5.6 y basis/KTX2) solo si el modelo usa compresión Draco o KTX2. Los modelos `.glb` sin esa compresión no hacen peticiones externas. Si se necesita 100 % offline con esos modelos, habrá que copiar esos decodificadores aparte.
- reveal.js: las URLs de `reveal.css` y `reveal.js` son solo comentarios de cabecera, no se cargan.
