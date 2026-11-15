# diseno

**Dueño:** Ehileen (UI/UX), con apoyo de Roberto.
**Propósito:** Paleta, estilo, pantallas de Figma ("Radar paceño") y logotipo. No usar ni modificar marca de la NASA.

## Aviso: las pantallas son maquetas con datos de ejemplo

Las PNG de `pantallas/` y `componentes/` son **maquetas de diseño** (el equipo hizo un prototipo de media fidelidad, se ajustó en Google Stitch, que es IA, y la edición final se hizo a mano en Figma; confirmado por Ehileen el 2026-11-15). Muestran datos **de ejemplo** que no salen de ninguna fuente nuestra: temperaturas de ciudades, "Actualizado hace 4 min", "En vivo, Satélite GOES-18", escala de radar en dBZ, índice UV, viento, presión, alertas, "Red estatal de estaciones" y el texto "Todos los derechos reservados".

**Excepción: Inicio (#144, 2026-11-15).** En `inicio.png` e `inicio-360.png`, la sección "¿Qué cambia?" usa las cifras reales de `web/data/indicadores.json` del 2026-11-15. "El cielo ahora en BCS" y los pines del mapa siguen siendo **de ejemplo**: la web los tomaría de Open-Meteo si se aprueba (ver `ESPECIFICACION.md` §10). La imagen del mapa y del héroe es la de MODIS Terra de `web/img/` (NASA GIBS, CC0).

Reglas (AGENTS.md, reglas 1 y 6):

- **No se copian a la web ni se usan en el video, las diapositivas, capturas de la entrega o el sitio.** La web solo muestra cifras de `data/salida/`.
- Solo se toma de ellas el estilo: disposición, tipografía, colores (`web/assets/tokens.css`) y componentes.
- Si una imagen generada con IA se muestra al público, lleva la marca visible "AI-generated".

## Qué hay aquí

| Ruta | Contenido |
|---|---|
| `pantallas/` | 17 pantallas finales en PNG (más `login.png` y `registrar.png`). |
| `componentes/` | Header, footer y botón "Iniciar simulación" en PNG. |
| `figma-auditoria.json` | Auditoría automática del Figma (pestañas, colores, fuentes, medidas). |
| `ESPECIFICACION.md` | **Guía para Diego**: cómo implementar el diseño en la web. |
| `tests/` | Pruebas automáticas del diseño. |
| `tools/` | Scripts para re-exportar de Figma y verificar. Ver [tools/README.md](tools/README.md). |

Otros archivos relacionados: `web/assets/tokens.css` (variables CSS), `web/assets/logo-radar-bcs.png` y `web/assets/iconos/*.svg`.

## Enlaces

- [ESPECIFICACION.md](ESPECIFICACION.md)
- [tools/README.md](tools/README.md)

## Verificar

```
powershell -File diseno/tools/verificar-diseno.ps1
```
