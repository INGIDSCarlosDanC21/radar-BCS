# Handoff — Programador B

## Hecho

- Web en `web/` (HTML + CSS + JS sin build; Leaflet 1.9.4): 4 pantallas Inicio, Mapa, Ficha y Acciones, navegación por hash. Publicada en Pages (responde 200), aún con datos de prueba hasta que `dev` llegue a `main`.
- **Datos reales conectados** (rama `prog-b/datos-reales`, PR a `dev`): `web/data/indicadores.json` es la salida de Luca (NASA POWER): calor +1.47 °C, tendencia clara; lluvia "Sin cambio claro"; vegetación y agua "Sin datos (pendiente)" con su limitación.
- Issue #36: "Sin cambio claro" sin cifra cuando `significativo: false`; "Fuente: pendiente" cuando falta fuente; franja "DATOS DE PRUEBA" en el Mapa porque `zonas.geojson` sigue siendo sintético (popup, lista y pie lo dicen).
- Reglas de presentación en `web/js/reglas.js`; pruebas con `node --test "web/tests/*.test.mjs"` (12 pass), incluido un validador del contrato.
- Probado a 360×740 claro y oscuro: 7 vistas sin errores de consola, sin "null" y sin scroll horizontal.

- PR #54 (fusionado): vegetación real (−0.019 NDVI, MODIS MOD13Q1) y nota de límite bajo la cifra de calor.
- Issue #9: mapa real. `web/data/zonas.geojson` es copia sin BOM de `data/salida/zonas.geojson` (Luca): 6 píxeles MODIS de 1 km (Centro, Chametla, El Centenario, Oriente, Sur, Surponiente), `datos_de_prueba: false`, así que ya no sale la franja. Vegetación muestra cifra y color en las 4 zonas con tendencia clara. Calor (superficie) muestra "Sin cambio claro" sin cifra en todas, por decisión de Investigación (`docs/investigacion/hallazgos.md`: la baja por zona depende de la prueba). Lluvia y agua: escala regional. Con la nota de Carlos (revisión del PR #57) bajo la lista de calor.
- Salida nueva de Luca copiada a `web/data/indicadores.json`: calor = superficie MODIS "Sin cambio claro" (p = 0.11) con nota que dice que el aire sí sube +1.47 °C; agua real GRACE +1.36 cm (2002-2026, tendencia clara, regional). La ficha dice "Cambio total desde" el primer año del periodo.

- PR #57 fusionado y `dev` → `main` (PR #64).
- Pantallas de Figma (rama `prog-b/figma-pantallas`). Plan en `docs/handoffs/prog-b-plan-figma-2026-11-14.md`.
  - **Home** (`web/js/home.js`, `web/css/home.css`): reemplaza Inicio con el diseño de Figma y solo datos de `indicadores.json`. Se quitaron las temperaturas en vivo, el radar dBZ, GOES-18 y los avisos, que eran ficticios.
  - **Imagen:** MODIS Terra de NASA GIBS (CC0), en `web/img/` con su `FUENTES.md`.
  - **Earth Engine:** script `web/tools/gee_imagen_bcs.py` para un compuesto MCD43A4. Requiere cuenta y no se ha corrido.
- **Login y Register:** por el issue #73, se sacaron del PR #69 y pasaron a la rama `prog-b/login`, con su PR aparte a `dev`. Corte: domingo 15 nov, 09:00.
- **Issue #78** (rama `prog-b/issue-78`), atendiendo la auditoría de Carlos:
  - **Método por ficha:** cada ficha explica su propio método según `significancia.metodo`. Calor y vegetación usan la prueba estacional; lluvia, el total anual; agua, la corrección por autocorrelación. La función es `RB.explicaMetodo` en `reglas.js` y tiene prueba.
  - **Aviso de IA:** está en el pie general y en el pie de la Home: "Código y análisis escritos con ayuda de IA (Claude Code); interfaz diseñada con ayuda de Google Stitch". Ambas herramientas están declaradas en `docs/RECURSOS.md`.
- **Datos de vegetación 2001-2026:** todavía no se copian a `web/data/`. Se copian una sola vez, cuando Luca suba la frase nueva de Calor; al 15 nov 00:00 aún no está en `dev`.

## En curso

- PR #69 (`prog-b/figma-pantallas` → `dev`): Home e imagen NASA, sin login.
- Rama `prog-b/login`: ajustar el login a las condiciones del #73.

## Falta

- **Login (#73):**
  - Definir para qué sirve la cuenta.
  - Crear el proyecto de Supabase con confirmación de correo y límites de tasa.
  - Definir un canal para pedir el borrado de una cuenta.
  - Probarlo en un celular real (#71).
- **Textos de relleno de Register** y logotipo: Ehileen (#11, #12).
- **Registrar en `docs/RECURSOS.md`:** la imagen GIBS y Space Grotesk, Manrope y JetBrains Mono (OFL).

- Que Carlos fusione `dev` → `main`; luego comprobar la URL pública sin sesión.
- Si Investigación cambia la prueba para la superficie por zona, quitar `sinCifra` de `CAPA_ZONA.calor` en `web/js/app.js`.
- `p_valor: 0.0` en NDVI de Chametla (regla 4 del Anexo); la web muestra "p < 0.001".
- Caso no cubierto: `significativo: null` con `cambio_total` con valor mostraría la cifra con "Sin calcular" (hoy no ocurre en los datos).

## Bloqueos

- Ninguno técnico. Publicar depende de la fusión a `main` (Líder).

## Para otros roles

- **Luca (Prog. A):** pendientes del Anexo comentados en #7: `p_valor` de calor en 0.0, lluvia con total anual, BOM en el JSON. Validador: `node --test "web/tests/*.test.mjs"`.
- **Ehileen (UI/UX):** colores como tokens en `:root` de `web/css/estilos.css`; logotipo e íconos en `web/assets/`.
- **Carlos (Líder):** URL de Pages: <https://ingidscarlosdanc21.github.io/radar-BCS/>. Plan del bloque en `docs/handoffs/prog-b-plan-2026-11-14.md`.

## Cómo probar

```
python -m http.server -d web 8000
# abrir http://localhost:8000
node --test "web/tests/*.test.mjs"
```

---

## 2026-11-14

- Entorno del repo configurado.
- Web base con 4 pantallas y datos de prueba; contrato de datos propuesto.
- Tarde: datos reales de NASA POWER conectados e issue #36 resuelto.
- Noche: vegetación real (PR #54) y tendencias reales por punto en el Mapa (issue #9).

## 2026-11-14 (noche): AVISO de Carlos sobre el login con Supabase (leer antes de seguir)

Carlos pidió dejar esto por escrito. El detalle completo y la lista de condiciones están en el issue #73; resumen:

- **El login es opcional.** Las 4 pantallas funcionan sin cuenta; el jurado y la demo entran sin cuenta. Si lo vuelves obligatorio, avisa a Carlos antes (cambia el relato "sin cuenta").
- **Solo Supabase Auth con correo y contraseña.** No pidas nada más (nombre, edad, teléfono, foto). Row Level Security en cualquier tabla. **Nunca** `service_role` ni claves en el repo (es público); usa `.env`.
- **Aviso en el sitio:** qué se guarda (solo el correo), para mayores de 18, cómo borrar la cuenta.
- **Registra Supabase** en `docs/RECURSOS.md` y en `docs/entrega/04-project-details.md`, y arregla ahí la frase "needs no account".
- **Rama `prog-b/login`, PR a `dev`.** **Hora de corte: domingo 15 nov, 09:00:** si no está probado (con y sin sesión, 360 px y celular real, issue #71) y opcional, no entra a `main`.
- **Prioridad:** 1) integrar la interfaz de UI/UX, 2) probar en celular real (#71), 3) login.
