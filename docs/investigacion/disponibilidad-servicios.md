# Disponibilidad de los servicios externos y prueba de día

Fecha: 2026-11-15, 03:00 a 03:30 (hora de La Paz). Repetir antes de enviar y a las 12:00.

## 1. Servicios que usa la web (todos respondieron bien)

Probados con peticiones reales, simulando el origen de GitHub Pages (`https://ingidscarlosdanc21.github.io`). Para las dos APIs que se piden con JavaScript se revisó además el permiso CORS.

| Servicio | Para qué | Respuesta |
|---|---|---|
| Open-Meteo, pronóstico (cielo, 8 puntos) | Inicio | 200, 465 ms, CORS abierto |
| Open-Meteo, pronóstico (Pesca y Avisos, 16 puntos) | Pesca, Avisos | 200, 106 ms, CORS abierto |
| Open-Meteo, marino (8 puntos) | Pesca, Avisos | 200, 912 ms, CORS abierto |
| NASA GIBS, GOES-West (WMS) | Imagen satelital de Inicio | 200, 435 ms, imagen JPEG |
| NASA GIBS, clorofila VIIRS | Capa de Pesca | 200, 386 ms |
| NASA GIBS, Terra a color y calor del suelo | Mapa, "Mira La Paz desde el espacio" | 200, 507 y 263 ms |
| OpenStreetMap (tesela) | Base de los mapas | 200, 171 ms |
| Leaflet (cdnjs), fuentes de Google | Mapas y tipografías | 200, 56 a 232 ms |
| Sitio público de GitHub Pages | La web | 200, 288 ms |
| SMN, NHC, SEMAR, CENAPRED y CONAPESCA | Enlaces oficiales de Avisos | 200 todos |

La **web pública** también se recorrió en un navegador real (Inicio, Pesca con la capa de clorofila, Avisos, Mapa, Ficha y Agro): sin errores de consola y con los datos reales (8 pines, 4 mosaicos, 5 avisos, 6 zonas, control de años hasta 2035).

## 2. Límites de Open-Meteo y qué tan holgado es

Límites del API gratuito (<https://open-meteo.com/en/pricing>, consultado hoy): 600 llamadas por minuto, 5,000 por hora, 10,000 por día y 300,000 por mes, solo uso no comercial. La página **no dice** si una petición con varias ubicaciones cuenta como una o como una por ubicación.

Cálculo conservador (cada ubicación cuenta como una llamada):

| Visita | Ubicaciones pedidas | Con caché del navegador |
|---|---|---|
| Solo Inicio | 8 | una vez por carga |
| Pesca o Avisos | 16 + 8 = 24 | se reutiliza durante 10 minutos |
| Inicio + Pesca + Avisos | 32 | – |

Con 32 por visita completa: unas **310 visitas al día**, unas **150 por hora** y unas **18 por minuto** antes de topar. Para el jurado y el recinto sobra; **no alcanza si el enlace se difunde mucho**. Si las llamadas se cuentan por petición (no por ubicación), el margen es mucho mayor.

Si hiciera falta más margen (no se ha hecho): guardar la caché en `localStorage` (se comparte entre pestañas y visitas, hoy es `sessionStorage` solo para Pesca y Avisos) y subirla de 10 a 15 minutos; usar solo los 8 puntos de mar y quitar los 8 de pueblo en Pesca; y dar caché al cielo de Inicio.

### Clima: una tercera petición, solo en esa pantalla

Regla de conteo, consultada el 2026-11-15 en <https://open-meteo.com/en/pricing>: una petición cuenta como una llamada, y como varias si, **por ubicación**, trae más de 10 variables o abarca más de 2 semanas (ejemplo de la página: 15 variables = 1.5 llamadas). La página **no dice** cómo cuenta varias ubicaciones.

`RBVivo.cargar({clima:true})` agrega una petición solo para los 8 pueblos (6 variables por hora y 6 por día = 12, o 1.2 llamadas por ubicación). Pesca y Avisos siguen con 2 peticiones.

| Visita | Cálculo conservador (cada ubicación cuenta, con el peso por variables) | Llamadas |
|---|---|---|
| Pesca o Avisos | 8 marinas (7 variables) + 16 de pronóstico (5 variables) | 24 |
| Clima | las 24 de arriba + 8 × 1.2 | 33.6 |
| Inicio + Clima | 8 + 33.6 | 41.6 |

Contra los límites gratuitos (600 por minuto, 5,000 por hora, 10,000 por día): unas **297 visitas a Clima al día**, unas 148 por hora y unas 17 por minuto antes de topar. La caché de 10 minutos (propia de Clima) reduce las repetidas. Si las ubicaciones se cuentan como una sola llamada por petición, el margen es mucho mayor. Si hiciera falta menos: pedir Clima sin las 8 de mar ni las 16 de pronóstico, solo con la petición de pueblos.

## 3. Otros riesgos

- **GOES-West:** el cuadro más reciente puede venir vacío durante unos minutos; la web ya cae a la imagen MODIS fija si no carga.
- **Sin conexión:** cada pantalla avisa y el resto de la web sigue.
- **RainViewer** (no se usa): su API pública da radar de las últimas 2 horas, gratis para uso personal o educativo y con atribución, pero no se confirmó que haya radar sobre La Paz y hoy no trae cuadros de satélite.

## 4. Prueba "de día" del mapa de Inicio

Era de noche (03:00), así que se simuló el mediodía: imagen real de GOES-West del 14 de noviembre a las 13:00 (hora de La Paz) y datos de "día" con distintos estados del cielo (despejado, parcialmente nublado, nublado, lluvia, tormenta, niebla).

- Los **pines blancos** mantienen su contraste sobre el relieve claro y las nubes. El pin seleccionado (oscuro) también se ve.
- Los **íconos de día** (sol y sol con nubes en ámbar; nube, lluvia y tormenta en gris y azul) se distinguen en las tarjetas y en los pines.
- La **leyenda** y el crédito de la imagen se leen sobre el fondo azul marino.
- A 1280 px la imagen ocupa la franja central y los costados quedan azul marino (como en el diseño de Figma).
- **Límite de esta prueba:** simula el día con datos modificados (la temperatura y la sensación térmica de la prueba no coinciden entre sí). Falta mirarlo con el sol real a partir de las 07:00.
