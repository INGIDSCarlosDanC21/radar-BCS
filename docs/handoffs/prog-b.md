# Handoff — Programador B

## Hecho

- Web base en `web/` (HTML + CSS + JS sin build; Leaflet 1.9.4): 4 pantallas Inicio, Mapa, Ficha y Acciones, navegación por hash (`#inicio`, `#mapa`, `#ficha/<id>`, `#acciones`).
- Datos de prueba en `web/data/indicadores.json` y `web/data/zonas.geojson` (cuadrícula 3×3 sintética), con franja "DATOS DE PRUEBA" en todas las pantallas. Cada cifra muestra su fuente.
- Propuesta de contrato de datos v0.1 en `docs/contrato-datos.md` (pendiente de Luca).
- Decisión de tecnología y publicación en `docs/decisiones.md`; Leaflet, OSM, CDC y EPA en `docs/RECURSOS.md`.
- Probado en navegador a 375×812: 4 pantallas sin errores de consola y sin scroll horizontal.

## En curso

- PR `prog-b/web-base` → `dev` (issues #9 y #10).

## Falta

- Que Luca apruebe o ajuste el contrato y entregue `web/data/` con datos reales (15:00-20:00).
- Que Carlos fusione `dev` → `main` para que Pages publique (el workflow solo publica desde `main`). Hoy Pages muestra el placeholder.
- Revisar con Investigación los consejos de Acciones y los textos de significancia.
- Probar 360×800 y modo oscuro con datos reales; revisar contraste.

## Bloqueos

- Ninguno técnico. Publicar depende de la fusión a `main` (Líder).

## Para otros roles

- **Luca (Prog. A):** formato en `docs/contrato-datos.md`; los `id` son `calor`, `vegetacion`, `lluvia`, `agua`; nulos como `null`.
- **Ehileen (UI/UX):** los colores son tokens en `:root` de `web/css/estilos.css`; logotipo e íconos pueden ir en `web/assets/`.
- **Carlos (Líder):** URL de Pages: <https://ingidscarlosdanc21.github.io/radar-BCS/> (se actualiza al fusionar a `main`).

## Cómo probar

```
python -m http.server -d web 8000
# abrir http://localhost:8000
```

---

## 2026-11-14

- Entorno del repo configurado.
- Web base con 4 pantallas y datos de prueba; contrato de datos propuesto.
