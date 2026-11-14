import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function leer(ruta) {
  const texto = readFileSync(new URL(ruta, import.meta.url), 'utf8')
  if (texto.charCodeAt(0) === 0xFEFF) {
    return JSON.parse(texto.slice(1))
  }
  return JSON.parse(texto)
}

const indicadores = leer('../data/indicadores.json')
const zonas = leer('../data/zonas.geojson')

function recorrerNumeros(valor) {
  if (typeof valor === 'number') {
    assert.notStrictEqual(valor, -9999)
  } else if (Array.isArray(valor)) {
    for (const elemento of valor) {
      recorrerNumeros(elemento)
    }
  } else if (valor !== null && typeof valor === 'object') {
    for (const valorProp of Object.values(valor)) {
      recorrerNumeros(valorProp)
    }
  }
}

test('los ids de indicadores ordenados son exactamente los cuatro esperados', () => {
  const ids = indicadores.indicadores.map((ind) => ind.id).sort()
  assert.deepStrictEqual(ids, ['agua', 'calor', 'lluvia', 'vegetacion'])
})

test('ningun numero en indicadores ni zonas vale -9999', () => {
  recorrerNumeros(indicadores)
  recorrerNumeros(zonas)
})

test('fuente completa para indicadores con cambio_total no nulo', () => {
  for (const ind of indicadores.indicadores) {
    if (ind.cambio_total !== null) {
      assert.ok(typeof ind.fuente.dataset === 'string' && ind.fuente.dataset.length > 0)
      assert.ok(typeof ind.fuente.url === 'string' && ind.fuente.url.length > 0)
      assert.ok(typeof ind.fuente.periodo === 'string' && ind.fuente.periodo.length > 0)
      assert.ok(typeof ind.fuente.fecha_descarga === 'string' && ind.fuente.fecha_descarga.length > 0)
    }
  }
})

test('significancia.metodo es null o contiene Mann-Kendall y nunca Hirsch', () => {
  for (const ind of indicadores.indicadores) {
    const metodo = ind.significancia.metodo
    if (metodo === null) continue
    assert.ok(typeof metodo === 'string' && metodo.includes('Mann-Kendall'))
    assert.ok(!metodo.includes('Hirsch'))
  }
})

test('zonas es FeatureCollection con cambios de los cuatro indicadores', () => {
  assert.strictEqual(zonas.type, 'FeatureCollection')
  for (const feature of zonas.features) {
    assert.deepStrictEqual(Object.keys(feature.properties.cambios).sort(), ['agua', 'calor', 'lluvia', 'vegetacion'])
  }
})

test('datos_de_prueba de zonas es true si hay celdas de prueba y no son indicadores de prueba', () => {
  if (indicadores.datos_de_prueba === false) {
    const tieneCelda = zonas.features.some((f) => String(f.properties.nombre).startsWith('Celda '))
    if (tieneCelda) {
      assert.strictEqual(zonas.datos_de_prueba, true)
    }
  }
})
