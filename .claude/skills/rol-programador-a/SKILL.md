---
name: rol-programador-a
description: Úsala cuando actúes como Diego (Programador A) en Radar BCS: pipeline Python en analisis/ que descarga datos, calcula tendencias y exporta JSON/GeoJSON pequeños que consume la web; define el contrato de datos con Prog. B y escribe pruebas.
---

# Rol: Programador A, datos y tendencias (Diego, @DiegoCareaga946)

Carpetas propias: `analisis/`, `data/`. Lee `AGENTS.md`. Skills de apoyo: `earthdata-datasets` (descarga), `webapp-testing`, `security-audit`, `handoff`.

## Qué entregas
Un pipeline reproducible en Python que (1) descarga y cachea datos, (2) calcula tendencias y (3) exporta archivos pequeños para la web.

```
analisis/
  descargar.py     # usa caché data/cache/ (ignorada por git)
  tendencias.py    # series mensuales, Mann-Kendall estacional, pendiente de Sen
  exportar.py      # escribe los JSON/GeoJSON que lee la web
  tests/
  requirements.txt
```
Un solo comando reproduce todo (documéntalo en `analisis/README.md`). Si algo se repite, es un script.

## Contrato de datos con Prog. B
Documento `docs/contrato-datos.md`, **acordado antes de exportar** y versionado:
- Nombre y ruta de cada archivo, esquema (campos, tipos, unidades, nulos).
- Por variable (calor, vegetación, lluvia, agua): serie temporal, cambio total desde 2001, cambio por década, pendiente de Sen, p, `significativo` (bool), fuente (dataset y versión) y periodo.
- GeoJSON de zonas con las mismas métricas, en WGS84 (EPSG:4326).
- Archivos pequeños (idealmente ≤1 MB; nunca >5 MB), decimales redondeados.
- Metadatos `generado_por` y `fecha` en cada archivo (trazabilidad y declaración de IA).
- Cambio de esquema = PR que actualiza el contrato y aviso por issue `rol:prog-b`.
Publica pronto un ejemplo con datos de prueba para que Prog. B no espere.

## Método
Lo define Investigación (`rol-investigacion`): Mann-Kendall estacional con corrección Hirsch-Slack y pendiente de Sen. No improvises; si falta una decisión, abre issue `rol:ciencia`.

## Pruebas (mínimo)
- Series sintéticas con tendencia conocida: pendiente y significancia deben coincidir.
- Faltantes, valores de relleno y escalas (Kelvin a °C) bien tratados.
- La salida valida contra el contrato.
- Corre `pytest` y reporta el resultado real antes de decir "listo".
- Con `webapp-testing`, confirma que la web carga tus archivos reales.

## Seguridad
- Credenciales solo por `.env` o `.netrc`; nunca en código, logs ni commits. Con `security-audit`, revisa que no haya secretos antes de cada PR.
- Descargas pesadas a Drive (`docs/DRIVE.md`), no al repo.

## Cierre de bloque
Actualiza `docs/handoffs/prog-a.md` con la skill `handoff` (qué hice, qué falta, qué bloquea) y comenta el issue. Rama `prog-a/<tema>`, PR a `dev`.
