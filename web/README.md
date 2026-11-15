# web

**Dueño:** Diego (Prog. B). `web/assets/` es de Ehileen (UI/UX).

**Propósito:** sitio web en español para celular con 4 pantallas (Inicio, Mapa, Ficha y Acciones), publicado en GitHub Pages. Es HTML, CSS y JS sin build; depende de Leaflet 1.9.4 (CDN) y de Google Fonts.

## Probar en local

Desde la raíz del repo, levanta un servidor; abrir con `file://` no funciona porque los JSON se leen con `fetch`:

```
python -m http.server -d web 8000
node --test "web/tests/*.test.mjs"
```

Abre http://localhost:8000. Rutas: `#inicio`, `#mapa`, `#ficha/<id>` y `#acciones`.

## Estructura

```
web/
  index.html              página única
  css/estilos.css         estilos base (tokens en :root, modo oscuro)
  css/home.css            Home (diseño de Figma)
  js/reglas.js            reglas de presentación (window.RB)
  js/home.js              Home con los 4 indicadores
  js/app.js               enrutador por hash, mapa, fichas, acciones
  data/indicadores.json   salida de data/salida/ (formato de docs/contrato-datos.md)
  data/zonas.geojson      6 píxeles MODIS de 1 km en La Paz (salida de data/salida/)
  img/                    imagen NASA GIBS (CC0); fuentes en img/FUENTES.md
  tools/                  scripts auxiliares (Earth Engine)
  tests/                  pruebas con node:test
  assets/                 (Ehileen)
```

## Datos

Los datos son reales: copias de `data/salida/` que genera Prog. A. Hay una franja "DATOS DE PRUEBA" que solo aparece si un archivo trae `"datos_de_prueba": true`; con los datos actuales no se muestra. Todas las rutas son relativas para GitHub Pages.
