// Extras de "Ver más" (docs/PLAN-VER-MAS.md, sección 7): notas del Agro y "Sobre los datos" de la Ficha plegados.
// Plegar no es quitar: el texto sigue en la página y la Limitación (advertencia) queda siempre a la vista.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.window = {};
const RBT = require('../js/textos.js');
const RBAgricola = require('../js/agricola.js');

const crudo = readFileSync(new URL('../data/agricola.json', import.meta.url), 'utf8');
const datos = JSON.parse(crudo.charCodeAt(0) === 0xFEFF ? crudo.slice(1) : crudo);
const zonas = { type: 'FeatureCollection', features: [] };
const leer = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('Agro: las notas van en un <details> con etiqueta de una línea y su texto sigue en la página (ES y EN)', (t) => {
  t.after(() => RBT.setLang('es'));
  for (const [lang, etiqueta] of [['es', 'Notas y límites'], ['en', 'Notes and limits']]) {
    RBT.setLang(lang);
    let conNotas = 0;
    for (const f of datos.fichas) {
      const h = RBAgricola.html(datos, zonas, f.id);
      const d = f.detalle || datos.detalles?.[f.id];
      if (!h.includes('class="ag-notas-pl"')) continue;
      conNotas++;
      assert.match(h, new RegExp('<details class="ag-notas-pl"><summary class="ag-mono">' + etiqueta + ' \\(\\d\\)</summary><div class="ag-notas">'), lang);
      assert.ok(h.includes('class="ag-nota"'), 'las notas siguen en el HTML');
      assert.ok(h.indexOf('class="ag-notas-pl"') < h.indexOf('class="ag-nota"'));
    }
    assert.ok(conNotas >= 1, 'ninguna ficha del Agro trae notas plegadas en ' + lang);
  }
});

test('Ficha: "Sobre los datos" pliega enlace, resolución, periodo y descarga; la fuente y la Limitación quedan a la vista', () => {
  const app = leer('../js/app.js');
  const i = app.indexOf("t('fic.fuente') + '</h2><p><strong>'");
  assert.ok(i > 0, 'bloque de fuente de la Ficha');
  const bloque = app.slice(i, app.indexOf("'<p class=\"aviso\">'", i));
  assert.ok(bloque.includes("t('fic.sobre')"), 'falta "Sobre los datos"');
  assert.ok(bloque.indexOf('<details') < bloque.indexOf("t('fic.resol')"), 'la resolución va dentro del <details>');
  assert.ok(bloque.indexOf('</details>') < bloque.indexOf("t('fic.limitacion')"), 'la Limitación va FUERA del <details>');
  assert.ok(bloque.indexOf('RB.textoFuente(i)') < bloque.indexOf('<details'), 'la fuente va fuera del <details>');
});

test('textos de "Sobre los datos" en español e inglés', () => {
  assert.equal(RBT.DIC.es['fic.sobre'], 'Sobre los datos');
  assert.equal(RBT.DIC.en['fic.sobre'], 'About the data');
});
