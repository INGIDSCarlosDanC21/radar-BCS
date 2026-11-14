# web

**Dueño:** Diego (Prog. B); `web/assets/` es de Ehileen (UI/UX).
**Propósito:** Sitio web en español para celular con las 4 pantallas (Inicio, Mapa, Ficha, Acciones), publicado en GitHub Pages. HTML + CSS + JS sin build; solo depende de Leaflet 1.9.4 (CDN).

## Probar en local

Desde la raíz del repo (abrir con `file://` no funciona porque se leen JSON con `fetch`):

```
python -m http.server -d web 8000
```

Abrir http://localhost:8000. Rutas: `#inicio`, `#mapa`, `#ficha/<id>`, `#acciones`.

## Estructura

```
web/
  index.html              página única
  css/estilos.css         estilos (tokens en :root, modo oscuro)
  js/app.js               enrutador por hash, pantallas, gráfica SVG, mapa
  data/indicadores.json   formato de docs/contrato-datos.md
  data/zonas.geojson      zonas (cuadrícula 3x3 de prueba)
  assets/                 (Ehileen)
```

Los datos actuales son **sintéticos de prueba** (`"datos_de_prueba": true`); la web muestra una franja de aviso. Todas las rutas son relativas para GitHub Pages.
