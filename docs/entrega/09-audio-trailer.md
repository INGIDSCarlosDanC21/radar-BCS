# Audio del trailer (28 a 30 s): biblioteca de sonido, hoja de señales y volúmenes

Carpeta: `video/public/audio/`. Todo sale de **muestras CC0 reales** (Freesound) procesadas por `scripts/audio/generar_audio.py`;
licencias y URL en `video/public/audio/LICENCIAS.md`, `docs/RECURSOS.md` y `docs/entrega/07-other-resources.md`.
Sin voces ni letras en la música. La narración (`narracion.mp3`) NO está en el repo.

## Archivos

| Archivo | Duración | Uso sugerido | Cuándo colocarlo |
|---|---|---|---|
| `bed-120bpm-28s.mp3` | 28.000 s | Lecho musical completo, 120 BPM (negra = 0.5 s, compás = 2 s), tonalidad de Do. Ya incluye un riser (6 a 12 s), un impacto en 12.0 s y un impacto suave en 24.0 s | En t = 0 (el primer tiempo cae en 0). Arco: 0-4 s tenso y vacío, 4-12 s construcción, 12-13 s revelación, 13-24 s energía, 24-28 s desenlace |
| `hit-impact.wav` | 3.800 s | Impacto cinematográfico con sub (revelación) | En 12.0 s (refuerza el del lecho; volumen bajo) |
| `hit-soft.wav` | 1.300 s | Impacto corto | En cambios de bloque: 15.5 s y 24.0 s |
| `whoosh-short.wav` | 0.500 s | Corte entre escenas. El pico está en 0.35 s | Empezar 0.35 s antes de cada corte |
| `whoosh-long.wav` | 1.200 s | Desplazamiento largo (scroll de la pantalla) | Al inicio del desplazamiento |
| `riser-3s.wav` | 3.000 s | Construcción que **termina exactamente al final del archivo** | Empezar 3 s antes del corte/impacto |
| `riser-6s.wav` | 6.000 s | Igual, 6 s | Empezar 6 s antes del impacto (6.0 s para el de 12.0 s) |
| `reverse-swell.wav` | 2.000 s | Swell invertido, culmina al final del archivo | Empezar 2 s antes del impacto (10.0 s) |
| `ui-tick.wav` | 0.150 s | Microsonido de tarjeta/pin | Cada tarjeta que aparece |
| `ui-pop.wav` | 0.400 s | Pop suave de pin | Cada pin del mapa |
| `counter-tick.wav` | 0.120 s | Tic del contador numérico | Cada paso del conteo |
| `glitch.wav` | 0.300 s | Falla digital | En el salto a la pantalla de Pesca |
| `sparkle-reveal.wav` | 2.500 s | Brillo para el logo | Al aparecer el logo / enlace final |
| `tail-outro.wav` | 3.000 s | Cola final resonante (caída natural de un drone) | Con el logo, hasta el final |
| `mezcla-referencia.mp3` | 28.000 s | Mezcla de referencia (lecho + efectos + narración con ducking) para comparar al oído | Solo referencia: no meter en el video final |

Los efectos están a 48 kHz, 16 bit, picos en -3 dBFS, con fade de 1-2 ms al inicio contra clics (el sonido arranca en el primer milisegundo).
Los dos risers y `whoosh-long` tardan unos 10 a 90 ms en ser audibles porque empiezan muy suaves (son construcciones).
No se cambió ningún nombre de archivo respecto al pedido original.

## Hoja de señales (cue sheet)

Rejilla de 0.5 s. Tiempos en segundos del video. "Vol." es el valor de `<Audio volume>` en Remotion con la narración en 1.0.
Los cortes reales del guion (`video/src/guion.ts`) están en 1.8, 6.2, 12.0, 15.6, 18.2, 19.9 y 21.7 s; las señales de abajo
suponen cortes en la rejilla (2.0, 6.0, 12.0, 15.5, 18.0, 20.0, 21.5). Mover cada corte hasta 0.2 s a la rejilla lo hace
coincidir con los impactos sin perder la sincronía con la voz; si no se mueven, sumar la diferencia al inicio del whoosh.

| Tiempo (s) | Archivo | Vol. | Nota |
|---|---|---|---|
| 0.0 | `bed-120bpm-28s.mp3` | ver "Volúmenes recomendados" | Todo el video |
| 1.65 | `whoosh-short` | 0.18 | Corte título -> Inicio (corte en 2.0) |
| 2.5, 3.0, 3.5, 4.0 | `ui-tick` | 0.15 | Las 4 tarjetas |
| 3.9 | `whoosh-long` | 0.15 | Scroll hacia la tarjeta de agua |
| 5.65 | `whoosh-short` | 0.18 | Corte a Calor (6.0) |
| 6.0 | `riser-6s` | 0.07 | Termina en 12.0 s |
| 7.0 a 8.5, cada 0.25 s | `counter-tick` | 0.125 a 0.185 (sube 0.01 por tic) | Conteo de +1.5 °C |
| 8.55 | `whoosh-short` | 0.15 | Salto a "significancia" |
| 10.0 | `reverse-swell` | 0.15 | Culmina en 12.0 s |
| **12.0** | `hit-impact` | 0.15 | Revelación (ya suena también en el lecho) |
| 12.5 | `riser-3s` | 0.07 | Termina en 15.5 s |
| 15.15 | `whoosh-short` | 0.18 | Corte al mapa (15.5) |
| 15.5 | `hit-soft` | 0.125 | Entra el mapa |
| 16.0, 16.25, 16.5, 16.75, 17.0, 17.25 | `ui-pop` | 0.20 | Pines del mapa |
| 17.65 | `whoosh-short` | 0.18 | Corte a Clima (18.0) |
| 18.5, 18.75, 19.0, 19.25 | `ui-tick` | 0.15 | 4 tarjetas de Clima |
| 19.85 | `glitch` | 0.18 | Salto a Pesca (20.0) |
| 20.5 | `ui-pop` | 0.20 | Pastilla "modelo, no oficial" |
| 21.0 | `riser-3s` | 0.07 | Termina en 24.0 s |
| 21.15 | `whoosh-short` | 0.18 | Corte al cierre (21.5) |
| **24.0** | `hit-soft` + `sparkle-reveal` + `tail-outro` | 0.15 / 0.175 / 0.175 | Logo y enlace final |

Estos volúmenes son los de `mezcla-referencia.mp3` (la constante `FX_REL = 0.5` multiplica el valor `g` de `CUES` en `generar_audio.py`).
Con ellos la música y los efectos quedan 13.3 dB por debajo de la voz; sube un efecto aislado si hace falta, pero cuida ese margen.

## Volúmenes recomendados (narración = 1.0)

| Capa | Volumen | Nota |
|---|---|---|
| Narración | 1.00 | Referencia |
| Lecho mientras habla la voz (0.0 a 25.4 s) | 0.20 | Ducking de -14 dB sobre el archivo (que ya viene a -20 LUFS) |
| Lecho en huecos de la voz de unos 0.3 s (alrededor de 18.0 s y 21.5 s) | 0.20 (opcional 0.30) | La mezcla de referencia los deja en 0.20 a 0.30 |
| Lecho sin voz (de 26.4 s en adelante) | 1.00 | Subir de 0.20 a 1.00 entre 25.4 y 26.4 s (rampa lineal) |
| Impactos (`hit-impact`, `hit-soft`) | 0.125 a 0.15 | |
| Risers y reverse | 0.07 (`riser`), 0.15 (`reverse-swell`) | |
| Whooshes | 0.15 a 0.18 | |
| Ticks, pops, glitch | 0.15 a 0.20 (`glitch` 0.18) | |
| `sparkle-reveal`, `tail-outro` | 0.175 | |

Si el video dura 26 s (como ahora en `guion.ts`), el lecho debe bajar a 0 con una rampa entre 25.4 y 26.0 s (la voz termina en 25.4 s),
y la cola de 3 s del logo (`tail-outro` desde 24.0) se corta en 26.0 s con la misma rampa. Con 28 a 30 s se oye completa.

## Mediciones (`scripts/audio/verificar_audio.py` y `ffmpeg ebur128`)

| Medida | Resultado | Meta |
|---|---|---|
| Lecho: sonoridad integrada | -20.0 LUFS (ebur128) | -22 a -18 |
| Lecho: pico real | -7.6 dBTP | |
| Mezcla de referencia: integrada | -16.1 LUFS | <= -14 |
| Mezcla de referencia: pico real | -3.8 dBTP | <= -1 |
| Narración (original de ElevenLabs) | -16.1 LUFS, pico real -1.1 dBTP | ~ -16 |
| Música + efectos bajo la voz (potencia media en los tramos con voz) | 13.3 dB más bajos (solo lecho: 16.5 dB) | >= 12 |

## Limitaciones

- No se pudo escuchar: la validación es objetiva (duración, espectro, rejilla, niveles). Conviene una escucha humana antes de entregar.
- El pulso rítmico del lecho es una pista real a 97 BPM estirada a 120 BPM (x1.237 con rubberband). Sus ataques caen en la rejilla de
  0.25 s (corcheas), no solo en cada 0.5 s; los graves llevan un desfase medido de unos +15 ms.
- El máximo de graves del impacto del lecho se mide en 12.057 s: el ataque empieza en 12.0 s y el sub tarda unos 50 ms en crecer.
- Las muestras originales son vistas previas MP3 de alta calidad (128 kbps) de Freesound, no los originales sin comprimir.
- El lecho lleva riser e impactos a nivel moderado; los efectos sueltos los refuerzan.
