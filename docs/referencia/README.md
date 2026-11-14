# Documentos de referencia del evento

Material oficial y de planeación convertido a Markdown para que cualquier agente lo lea barato.
Los originales están en `originales/`. Conversión hecha con
[markitdown](https://github.com/microsoft/markitdown) (`markitdown <archivo> -o <salida>.md`).

| Archivo | Qué es | Origen |
|---|---|---|
| `componentes-del-proyecto.md` | Los componentes que exige el formulario de entrega (resumen, demo, detalles, uso de IA, datos NASA, otros recursos). | `originales/La Paz 26 Components of Project - NASA Space Apps Challenge.pdf` (PDF de la sede La Paz) |
| `envio-del-proyecto.md` | Nota: el PDF de envío es una presentación de 22 páginas solo con imágenes, sin texto extraíble. Hay que leer el original. | `originales/Project Submission - NASA SAC LPZ 26.pdf` |
| `plan-radar-paceno.md` | Plan del proyecto Radar Paceño / Radar BCS: reto, problema, solución, pantallas y método (13 nov 2026, Carlos). | `originales/Radar_Paceno_Space_Apps_La_Paz.docx` |

Para regenerar: `uv tool install "markitdown[all]"` (lo hace `scripts/setup.ps1`) y vuelve a correr markitdown
sobre el original. Si cambia un original, reconviértelo y no edites a mano el `.md` generado.
