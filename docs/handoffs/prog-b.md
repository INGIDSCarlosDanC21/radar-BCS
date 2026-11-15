# Handoff — Programador B

## Hecho

- Web en `web/` (HTML + CSS + JS sin build; Leaflet 1.9.4): 4 pantallas Inicio, Mapa, Ficha y Acciones, navegación por hash. Publicada en Pages (responde 200), aún con datos de prueba hasta que `dev` llegue a `main`.
- **Datos reales conectados** (rama `prog-b/datos-reales`, PR a `dev`): `web/data/indicadores.json` es la salida de Luca (NASA POWER): calor +1.47 °C, tendencia clara; lluvia "Sin cambio claro"; vegetación y agua "Sin datos (pendiente)" con su limitación.
- Issue #36: "Sin cambio claro" sin cifra cuando `significativo: false`; "Fuente: pendiente" cuando falta fuente; franja "DATOS DE PRUEBA" en el Mapa porque `zonas.geojson` sigue siendo sintético (popup, lista y pie lo dicen).
- Reglas de presentación en `web/js/reglas.js`; pruebas con `node --test "web/tests/*.test.mjs"` (12 pass), incluido un validador del contrato.
- Probado a 360×740 claro y oscuro: 7 vistas sin errores de consola, sin "null" y sin scroll horizontal.

- PR #54 (fusionado): vegetación real (−0.019 NDVI, MODIS MOD13Q1) y nota de límite bajo la cifra de calor.
- Issue #9: la pantalla Mapa muestra arriba "Por punto de La Paz (datos reales)" con las tendencias de Luca (`web/data/zonas_tendencias.json`, copia sin BOM de `data/salida/`): temperatura de superficie (MOD11A2) y NDVI (MOD13Q1) en 6 puntos, primero los de tendencia clara. La franja del mapa ahora dice "MAPA DE PRUEBA — las zonas dibujadas no son mediciones".

## En curso

- PR `prog-b/mapa-zonas` → `dev` (issue #9).

## Falta

- Que Carlos fusione `dev` → `main`; luego comprobar la URL pública sin sesión.
- Coordenadas de los 6 puntos (están en los CSV de AppEEARS de Luca, fuera de git) para dibujarlos en el mapa; hasta entonces las zonas dibujadas son de prueba.
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
