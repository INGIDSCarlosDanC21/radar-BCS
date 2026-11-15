# Herramientas de diseno

Scripts para volver a sacar los diseños de Figma ("Radar paceño", id `ae9KMSMZUexeV0dBhDkNR1`) y revisar que todo siga bien.

| Archivo | Para qué sirve |
|---|---|
| `receptor.py` | Servidor local (solo 127.0.0.1:8765). Recibe archivos que Figma envía y los guarda en `diseno/` o `web/assets/`. |
| `auditar-figma.js` | Script que se pega en la consola de Figma. Define `radarAuditar()` y `radarExportar()`. |
| `verificar-diseno.ps1` | Corre las pruebas de diseño y las de la web de Diego. Sale con error si algo falla. |

## Cómo volver a exportar desde Figma

1. En la raíz del repo, inicia el receptor (déjalo abierto):
   ```
   python -I diseno/tools/receptor.py .
   ```
2. Abre el archivo en Figma en el navegador. Abre la consola (F12).
3. Carga el auditor desde el receptor y evalúalo:
   ```js
   const codigo = await (await fetch('http://127.0.0.1:8765/leer?ruta=diseno/tools/auditar-figma.js')).text();
   eval(codigo);
   ```
4. Ejecuta:
   ```js
   await radarAuditar();   // genera diseno/figma-auditoria.json
   await radarExportar();  // exporta PNG a diseno/ y web/assets/
   ```
5. Cierra el receptor (Ctrl+C) y verifica:
   ```
   powershell -File diseno/tools/verificar-diseno.ps1
   ```

## Qué revisa `verificar-diseno.ps1`

- `node --test "diseno/tests/*.test.mjs"`: auditoría (17 pantallas, header/footer, pestaña activa, fuentes), PNG y SVG válidos, tokens, contraste y logo.
- `node --test "web/tests/*.test.mjs"`: pruebas de Diego, para confirmar que no se rompió nada.

Nota: en Node 22 o más nuevo, `node --test diseno/tests/` (carpeta sola) da error; usa el patrón con comillas.

## Notas

- Los PNG salen con unos 8 px de margen por lado (1296 de ancho para un frame de 1280); es normal.
- El receptor solo escribe dentro de `diseno/` y `web/assets/`.
