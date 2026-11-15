# Umbrales de la pantalla Clima y su fuente

Verificado el 2026-11-15. Código: `web/js/reglas-clima.js`. Todo es del **modelo de Open-Meteo** para el pueblo, no de estaciones, y no es un aviso oficial.

## Lo que se usa

| Regla | Umbral | Fuente | Estado |
|---|---|---|---|
| Nivel de UV | 0-2 bajo, 3-5 moderado, 6-7 alto, 8-10 muy alto, 11 o más extremo | Índice UV mundial de la OMS/OMM/PNUMA/ICNIRP (el plan del Líder y `reglas-mar.js` usan estas 5 categorías) | Los cortes en 3, 8 y 11 coinciden con la página de la OMS; **los nombres de las 5 categorías no aparecen en esa página** (solo da 3 bandas), así que quedan por confirmar en la guía impresa |
| Protección contra el UV | 0-2 ninguna; 3-7 sombra al mediodía, camisa, bloqueador y sombrero; 8 o más evitar el exterior al mediodía | OMS, "Radiation: the ultraviolet (UV) index", consultada el 2026-11-15: <https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index> | Verificado en la página |
| Viento y oleaje | Beaufort y Douglas | Ver `docs/investigacion/umbrales-mar.md` | Ya verificado |
| Horas de sol | `sunshine_duration` / 3600 | Open-Meteo, definición de la variable en <https://open-meteo.com/en/docs> (segundos) | Verificado |

## Lo que NO se usa (y por qué)

- **Etiqueta de calor** (`nivelCalor()` devuelve `null`). El índice de calor del NWS (Caution, Extreme Caution, Danger, Extreme Danger) se calcula con temperatura del aire y humedad, y la propia página del NWS (<https://www.weather.gov/safety/heat-index>, consultada el 2026-11-15) dice que sus valores son para sombra y poco viento, y que el sol directo puede sumar hasta 15 °F. Los rangos numéricos solo están en una imagen que no pude leer. Además, Open-Meteo entrega la temperatura aparente (`apparent_temperature`), que no es ese índice: usar los rangos del NWS sobre ella sería mezclar dos cosas. La pantalla muestra el número como "sensación térmica del modelo", sin etiqueta.
- **Milímetros de lluvia por hora**: sin umbral con fuente primaria. Solo se muestran probabilidad y milímetros de las próximas 24 h.
- **Humedad**: sin categorías, solo el valor.

## Si se quiere una etiqueta de calor

Hace falta una fuente primaria que aplique a la temperatura aparente de Open-Meteo, o calcular el índice de calor del NWS con T y HR y citar la tabla oficial. Decisión del Líder.
