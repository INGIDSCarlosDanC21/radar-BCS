---
name: diapositivas-html
description: Úsala cuando edites, rehagas o verifiques la presentación HTML de Radar BCS (carpeta presentacion/): stack, las 6 partes con oradores y tiempos, zona segura, reglas de datos, qué no decir, reglas de menores y cómo iniciarla.
---

# Presentación HTML de Radar BCS

Detalle de diseño, clases y animaciones: **`presentacion/DISENO.md`** (léelo antes de tocar nada; aquí no se repite). Dependencias: `presentacion/vendor/VENDOR.md`.

## Stack
- Reveal.js 5.2.1 + anime.js 3.2.2, **vendorizados** en `presentacion/vendor/`. Sin CDN, sin internet, sin build pesado.
- `node presentacion/build.mjs` une `plantilla.html` + `partes/0N-*.html` en `index.html`. Nunca edites `index.html` a mano.
- Si falta algo en `vendor/`: `presentacion/INSTALAR.bat`.

## Las 6 partes (objetivo 8 min, máximo 10)
| N | Parte | Objetivo | Orador | Tiempo |
|---|---|---|---|---|
| 1 | Gancho | Captar atención y situar el problema | Ehileen | 0:50 |
| 2 | Problema y reto | Conectar el dolor real con el desafío | Roberto | 1:10 |
| 3 | Solución + datos NASA | Presentar el proyecto y su base científica | Carlos | 1:10 |
| 4 | Demostración | Mostrarlo, con capturas reales | Diego | 2:30 |
| 5 | Impacto y escalabilidad | Futuro fuera del hackatón | Integrante 6 | 1:10 |
| 6 | Cierre | Una frase memorable | Luca | 0:40 |

Fuente de verdad de estos datos: `PARTES` en `presentacion/js/deck.js`. Si cambias uno, cámbialo ahí y aquí.

## Estructura y formato
- Cada parte es un archivo `partes/0N-nombre.html` con `<section data-parte="N" data-animacion>` y un `<div class="zona">`. Cada parte se edita solo en su archivo.
- La barra de progreso, el chip, el orador y el cronómetro los pone `deck.js`, no las partes.
- Lienzo **1280x720**. **Zona segura 960x720** centrada (en proyector 4:3, 800x600, se recortan los lados). Todo texto dentro de la zona.
- Mínimos: título 56 px, cuerpo 26 px, etiquetas 18 px. Sin `style=""` ni `<script>` en las partes. ~20 palabras por diapositiva; el resto en `<aside class="notes">`.
- No toques `css/` ni `js/` salvo que seas quien los mantiene; si falta una clase, avisa al líder.
- Verificar: `node presentacion/verificar.mjs <carpeta-fuera-del-repo> offline`. En `informe.txt` la lista `"fuera"` debe quedar vacía y sin errores de consola. Revisa los PNG antes de decir "listo".

## Reglas de datos
- Solo cifras de `data/salida/`, `docs/investigacion/hallazgos.md`, `contexto-local.md` y `eventos-extremos.md`, cada una con su fuente en `<p class="fuente">`. No inventes números (AGENTS.md reglas 1-3).
- Mostramos **qué cambió, no por qué**.

## Qué NO decir
- Causas del cambio (ni "por el cambio climático" ni "por la urbanización").
- "El huracán golpeó La Paz de frente": no está verificado así.
- La cifra de calor de **41.8 %** solo se presenta como cifra **estatal**, nunca de La Paz.
- Naranja solo para calor.

## Menores y marca
- El orador 5 es **"Integrante 6"**: sin nombre, foto ni voz de menores en pantalla, notas ni archivos.
- Sin logos ni marca de la NASA. Todo recurso nuevo se anota en `docs/RECURSOS.md`; imagen o video generado con IA lleva marca de agua.
- Modelos 3D (`vendor/model-viewer`) no funcionan por `file://`; siempre con imagen de respaldo.

## Cómo iniciar
Doble clic en `presentacion/INICIAR-PRESENTACION.bat` (regenera, levanta servidor en 127.0.0.1:8765 y abre Chrome a 1280x720). Teclas: flechas, T cronómetro, R reinicia, S notas, F pantalla completa. Para cerrar: `DETENER-PRESENTACION.bat`. Respaldo sin servidor: abrir `presentacion/index.html`. Guía para el equipo: `docs/entrega/12-presentacion-como-usar.md`.
