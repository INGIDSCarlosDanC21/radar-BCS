# Íconos del estado del cielo (Inicio, #144)

Son glifos de **Google Material Symbols** (Outlined, 24 px), descargados el 2026-11-15 de `fonts.gstatic.com`:
`https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/<nombre>/default/24px.svg`.

- **Licencia:** Apache License 2.0, la misma de los otros íconos (copia en `../LICENSE-material-symbols.txt`). La atribución no es obligatoria.
- **Uso:** en Inicio, en las tarjetas de "El cielo ahora en BCS", en los pines del mapa y en la leyenda "Estado del cielo". El color lo pone la web: ámbar para sol, gris para nubes y niebla, azul para lluvia, y blanco sobre los pines oscuros.
- **Datos:** el código de estado del cielo es el `weather_code` (código WMO) de la API de Open-Meteo (<https://open-meteo.com/en/docs>). Es un modelo meteorológico, no estaciones. Su licencia y la atribución que exige están POR VERIFICAR y hay que registrarlas en `docs/RECURSOS.md` antes de usarlo (decisión de alcance en #144).
- **Día y noche:** con `is_day = 0`, los códigos 0–1 usan `clear_night` y el código 2 usa `partly_cloudy_night`.

| Códigos WMO | Estado (ES / EN) | Ícono de día | Ícono de noche |
|---|---|---|---|
| 0, 1 | Despejado / Clear | `sunny` | `clear_night` |
| 2 | Parcialmente nublado / Partly cloudy | `partly_cloudy_day` | `partly_cloudy_night` |
| 3 | Nublado / Overcast | `cloud` | `cloud` |
| 45, 48 | Niebla / Fog | `foggy` | `foggy` |
| 51, 53, 55, 56, 57 | Llovizna / Drizzle | `rainy_light` | `rainy_light` |
| 61, 63, 65, 66, 67, 80, 81, 82 | Lluvia o chubasco / Rain or showers | `rainy` | `rainy` |
| 71, 73, 75, 77, 85, 86 | Nieve (no esperada en BCS) / Snow | `cloud` | `cloud` |
| 95, 96, 99 | Tormenta / Thunderstorm | `thunderstorm` | `thunderstorm` |

Si llega un código fuera de la tabla, mostrar `cloud` con el texto "Sin dato del cielo" / "No sky data".
