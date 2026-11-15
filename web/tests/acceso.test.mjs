import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ruta = (p) => fileURLToPath(new URL(p, import.meta.url));
const acceso = readFileSync(ruta('../js/acceso.js'), 'utf8');
const config = readFileSync(ruta('../js/config.js'), 'utf8');

test('acceso.js no pide nombre', () => {
  assert.ok(!acceso.includes('nombre_completo'));
  assert.ok(!acceso.includes('acc-nombre'));
});
test('acceso.js incluye la casilla de 18 años y el aviso', () => {
  assert.ok(acceso.includes('18 años'));
  assert.ok(acceso.includes('solo tu correo'));
});
test('config.js no contiene claves secretas', () => {
  assert.ok(!config.includes('service_role'));
  assert.ok(!config.includes('sb_secret_'));
});
test('ya no existe supabase.sql', () => {
  assert.equal(existsSync(ruta('../tools/supabase.sql')), false);
});
