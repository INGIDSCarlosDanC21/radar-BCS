# diseno

**Dueño:** Ehileen (UI/UX), con apoyo de Roberto.
**Propósito:** Paleta, estilo, pantallas de Figma ("Radar paceño") y logotipo. No usar ni modificar marca de la NASA.

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
