# Contrato de datos

Formato acordado entre `analisis/` (Prog. A, produce) y `web/` (Prog. B, consume). Se llena con los dos antes de conectar datos reales.

> **Estado: PROPUESTA v0.1 de Diego (Prog. B), 2026-11-14. PENDIENTE de aprobar por Luca (Prog. A).**
> La web ya lee este formato con datos de prueba (`web/data/*.json`, marcados `"datos_de_prueba": true`).
> Si Luca necesita cambiar algo, se cambia aquí primero y se sube `version_contrato`.

## Archivos de salida

GitHub Pages publica **solo la carpeta `web/`** (`.github/workflows/pages.yml`), así que la web solo puede leer archivos dentro de `web/`.

| Archivo | Lo produce | Lo lee | Contenido |
|---|---|---|---|
| `web/data/indicadores.json` | Prog. A | Pantallas 1 (Inicio) y 3 (Ficha) | Un objeto por indicador: cambio total, por década, significancia, serie anual, fuente |
| `web/data/zonas.geojson` | Prog. A | Pantalla 2 (Mapa) | Zonas de La Paz (polígonos) con el cambio de cada indicador |

Propuesta de flujo: Prog. A escribe sus salidas en `data/salida/` y abre un PR que las copia a `web/data/` (o se agrega un script `scripts/publicar-datos.ps1`; decidirlo con Luca). Prog. B no recalcula nada en el navegador.

Tamaño: cada archivo < 1 MB (simplificar geometrías si hace falta).

## Campos y unidades

### `indicadores.json`

```json
{
  "version_contrato": "0.1",
  "datos_de_prueba": false,
  "generado": "2026-11-14",
  "generado_con": "analisis/<script>.py (código generado con IA: sí/no)",
  "periodo": { "inicio": 2001, "fin": 2025 },
  "indicadores": [
    {
      "id": "calor",
      "titulo": "Calor",
      "variable": "Temperatura de superficie de día (LST)",
      "unidades": "°C",
      "cambio_total": 1.2,
      "cambio_total_nota": "pendiente de Sen por año × número de años; estimación, no medición",
      "tendencia_por_decada": 0.5,
      "por_decada": [
        { "decada": "2001-2010", "media": 33.1 },
        { "decada": "2011-2020", "media": 33.7 },
        { "decada": "2021-2025", "media": null }
      ],
      "significancia": {
        "metodo": "Mann-Kendall estacional + pendiente de Sen",
        "p_valor": 0.01,
        "alfa": 0.05,
        "significativo": true
      },
      "serie_anual": [ { "anio": 2001, "valor": 32.9 } ],
      "fuente": {
        "dataset": "MODIS MOD11A2 v061",
        "url": "https://doi.org/...",
        "resolucion": "1 km",
        "periodo": "2001-2025",
        "fecha_descarga": "2026-11-14"
      },
      "limitacion": "texto corto o null"
    }
  ]
}
```

Reglas:

- `id` ∈ `calor`, `vegetacion`, `lluvia`, `agua` (siempre los cuatro; si no hay dato, el objeto va con valores `null`).
- Unidades: calor en `°C`; vegetación en `NDVI` (adimensional) o `%` si se reporta cambio relativo (indicarlo en `unidades`); lluvia en `mm/año`; agua en `cm` de equivalente de agua (GRACE) o lo que defina Prog. A.
- `cambio_total` y `tendencia_por_decada` en las mismas `unidades`. Signo: positivo = sube.
- `significativo`: `true`, `false` o `null` (no calculado). La web traduce a lenguaje sencillo; no muestra "causas".
- Faltantes: `null`, nunca `0` ni `-9999`. La web muestra "sin datos".

## Zonas / geometrías

`zonas.geojson` es un `FeatureCollection` en WGS84 (EPSG:4326). Cada `Feature`:

```json
{
  "type": "Feature",
  "geometry": { "type": "Polygon", "coordinates": [[[-110.33, 24.13], "..."]] },
  "properties": {
    "id": "z01",
    "nombre": "Nombre de la zona o celda",
    "cambios": {
      "calor":      { "cambio_total": 1.4, "significativo": true },
      "vegetacion": { "cambio_total": -0.03, "significativo": false },
      "lluvia":     { "cambio_total": null, "significativo": null },
      "agua":       { "cambio_total": null, "significativo": null }
    }
  }
}
```

- Qué es una "zona" (colonias, cuadrícula de 1 km, AGEB): **lo decide Prog. A**. Si son colonias, la fuente de los límites va en `docs/RECURSOS.md`.
- Indicadores regionales (lluvia de NASA POWER, agua de GRACE) pueden ir `null` en el mapa; la web lo explica.

## Metadatos de fuente (dataset, versión, fecha de descarga)

Obligatorio en cada indicador: `fuente.dataset` (con versión), `fuente.url` (DOI o página del dataset), `fuente.resolucion`, `fuente.periodo`, `fuente.fecha_descarga`. La web los muestra junto a cada cifra.

## Marca de generación por IA (datos y código generados)

`generado_con` en la raíz dice qué script produjo el archivo y si el código se generó con IA. Los datos de prueba llevan `"datos_de_prueba": true` y la web muestra la franja **"DATOS DE PRUEBA"**.

## Versionado del contrato

| Versión | Fecha | Cambio | Quién |
|---|---|---|---|
| 0.1 | 2026-11-14 | Propuesta inicial | Diego (Prog. B); pendiente de Luca |
