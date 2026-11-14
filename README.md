# Radar BCS

Web en español, pensada para celular, gratuita y sin instalación, que muestra con datos abiertos de la NASA cómo han cambiado el calor, la vegetación, la lluvia y el agua en La Paz, B.C.S., desde 2001, y qué puede hacer cada vecino al respecto.

Proyecto del **NASA Space Apps Challenge 2026, sede La Paz, México**. Reto: *Be An Earth System Trend Detective!* (Ciencias de la Tierra y Software).

> Mostramos qué cambió, no por qué. Una tendencia no prueba la causa.

## Equipo OptiPaz

| Persona | GitHub | Rol |
|---|---|---|
| Carlos | [@INGIDSCarlosDanC21](https://github.com/INGIDSCarlosDanC21) | Líder + investigación/ciencia |
| Diego | [@DiegoCareaga946](https://github.com/DiegoCareaga946) | Programador A: datos y tendencias (Python) |
| Luca | [@luca6874](https://github.com/luca6874) | Programador B: web, mapa, fichas, GitHub Pages |
| Ehileen | [@Ehileen22](https://github.com/Ehileen22) | UI/UX: interfaz, logotipo, assets |

## Cómo empezar

```bash
git clone https://github.com/INGIDSCarlosDanC21/radar-BCS.git
cd radar-BCS
git checkout dev
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

En macOS/Linux usa `scripts/setup.sh`. Después abre tu archivo `equipo/INICIO-<nombre>.md` (carlos, diego, luca o ehileen), cópialo en una sesión nueva de Claude Code (o Codex/OpenCode) y el agente hace el resto. Las reglas para cualquier agente están en [`AGENTS.md`](AGENTS.md).

Plugin recomendado, superpowers: `.claude/settings.json` lo declara; si no se instala solo, ejecuta en Claude Code `/plugin install superpowers@claude-plugins-official`.

Las claves van en `.env` (copia de `.env.example`), que nunca se sube.

## Estructura

| Carpeta | Contenido | Dueño |
|---|---|---|
| `web/` | Sitio (4 pantallas) y `web/assets/` | Luca / Ehileen |
| `analisis/` | Scripts de datos y estadística (Mann-Kendall, Sen) | Diego |
| `data/` | Datos procesados pequeños; lo pesado va en Drive | Diego |
| `diseno/` | Paleta, bocetos, logotipo | Ehileen |
| `docs/` | Documentación, handoffs, borradores de entrega, investigación | Carlos |
| `equipo/` | Mensajes de inicio por persona | Carlos |
| `scripts/` | Utilidades (setup, sync, delegar) | Todos |
| `.claude/skills/` | Skills del proyecto | Carlos |

Archivos pesados (datasets, video, 3D, audio): Google Drive, ver [`docs/DRIVE.md`](docs/DRIVE.md).

## Ramas

- `main`: estable, lo que ve el jurado; solo el Líder fusiona.
- `dev`: pruebas, lo más reciente.
- `rol/<tema>` (p. ej. `prog-b/mapa`): trabajo diario; PR hacia `dev`.

## Licencia

Apache License 2.0. Ver [`LICENSE`](LICENSE). Los recursos de terceros y sus licencias se registran en [`docs/RECURSOS.md`](docs/RECURSOS.md).

## Uso de inteligencia artificial

Este proyecto se desarrolla con herramientas de IA (por ejemplo Claude Code para la configuración del repositorio, la documentación y el código). El uso se declara en [`docs/RECURSOS.md`](docs/RECURSOS.md); las imágenes y el video generados llevan marca de agua visible "AI-generated" y el código o los datos generados se reconocen en texto y metadatos. No se usa ni modifica marca de la NASA.
