# Umbrales del estado del mar y de los avisos del modelo

Fecha: 2026-11-15. Código: `web/js/reglas-mar.js` (pruebas en `web/tests/pesca-avisos.test.mjs`). Pantallas: Pesca y Avisos.

**Todo esto es una estimación sobre un modelo (Open-Meteo, ~9 km). No es un aviso oficial** y la web lo dice. Los avisos oficiales son los de la Capitanía de Puerto (SEMAR), el SMN, el NHC y Protección Civil; la web solo enlaza a ellos.

## Qué se usa y de dónde sale cada umbral

| Regla | Umbral | Fuente | Qué se verificó |
|---|---|---|---|
| Oleaje: amarillo / naranja / rojo | ≥ 1.25 m / ≥ 2.5 m / ≥ 4 m (grados Douglas 4, 5 y 6) | Escala de mar de Douglas (internacional): grado 3 hasta 1.25 m, 4 hasta 2.50 m, 5 hasta 4.00 m, 6 hasta 6.00 m (<https://en.wikipedia.org/wiki/Douglas_sea_scale>) | Tabla consultada el 2026-11-15 (fuente secundaria; la escala es estándar) |
| Viento: amarillo | ≥ 22 nudos (Beaufort 6, "strong breeze") | Escala de Beaufort (<https://en.wikipedia.org/wiki/Beaufort_scale>): 6 = 22 a 27 nudos | Tabla consultada el 2026-11-15 |
| Viento: naranja | ≥ 34 nudos ("gale") | Beaufort 8 = 34 a 40; avisos marinos del NWS de viento duro: 34 a 47 nudos (<https://www.weather.gov/marine/cwd>, páginas archivadas) | Beaufort y NWS coinciden en 34 |
| Viento: rojo | ≥ 48 nudos ("storm") | Beaufort 10 = 48 a 55; aviso de tormenta del NWS: 48 nudos o más | Coinciden en 48 |
| Tormenta eléctrica | código WMO 95, 96 o 99 | Código WMO 4677 que entrega Open-Meteo (<https://open-meteo.com/en/docs>) | Es la definición del propio servicio |
| Lluvia moderada / fuerte | código 63 y 81 / 65, 67 y 82 | Mismo código WMO | Igual |
| UV: amarillo / naranja | ≥ 8 / ≥ 11 | Índice UV mundial de la OMS: 8 a 10 muy alto, 11 o más extremo (<https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index>) | Categorías ya usadas en `cielo.js`; el enlace responde |
| Estado del mar (verde / amarillo / rojo) | verde: oleaje < 1.25 m y viento < 22 nudos; amarillo: alguno en nivel 1; rojo: alguno en nivel 2 o 3 | Combinación de las dos escalas de arriba | Regla propia, explicada en pantalla; si falta oleaje o viento, dice "sin dato" |

## Qué NO se usa, y por qué

- **"Small craft advisory" del NWS:** el umbral cambia por oficina (18 a 33 nudos según la página); no hay un valor único, así que no se usa.
- **Calor (índice de calor del NWS):** las categorías (80 / 90 / 103 / 125 °F) solo aparecieron en fuentes secundarias y la página del NWS las muestra como imagen. Además, la "temperatura aparente" de Open-Meteo no es el índice de calor del NWS. **No hay aviso de calor.**
- **Lluvia en mm/h (2.5 / 7.6 / 50):** el esquema se repite en fuentes secundarias con variantes (la frontera "fuerte" va en 7.6 o en 10). No se pudo confirmar con el glosario de la AMS (403). Se usa solo el código WMO.
- **Banderas de puerto, decretos de la Capitanía, teléfonos, "zona favorable / alta biomasa" y avisos de ejemplo del Figma:** no tienen fuente y no se muestran.

## Límites que se declaran

- La rejilla marina es de ~9 km: dentro de las bahías (La Paz, por ejemplo) no distingue detalle, y dos puntos de prueba cayeron en tierra y se descartaron. Los 8 puntos de mar usados se comprobaron el 2026-11-15 (`elevation` de 0 y datos de oleaje, periodo y temperatura del mar).
- El modelo puede equivocarse; el aviso del modelo no sustituye al oficial.
- **NHC (ciclones):** su feed (`CurrentStorms.json`) responde pero el navegador lo bloquea por CORS, así que solo hay enlace.

## Pendiente de revisión por Investigación (Carlos o Luca)

Confirmar las escalas de Douglas y Beaufort en una fuente primaria (OMM o un manual de servicio meteorológico) si se quiere citar fuera de esta nota.
