> **Nota (2026-11-15): documento histórico; lo que contradiga a `docs/decisiones.md` (2026-11-15) está superado por ese archivo.** Ver la web actual: menú Clima · Pesca · Inicio · Agro · Avisos, 38 lugares en Clima, 19 puertos en Pesca.

# Plan Prog. B — pantallas de Figma (Login, Register, Home)

Fecha: 2026-11-14, noche. Meta: `main` actualizado el dom 15 a las 11:00.
Fuente del diseño: archivo de Figma "Untitled" (`9znfJWmVQctIprm41kf6Zg`), página "Page 1". Lo leí en solo lectura, con la API `figma` del editor; no cambié nada.

## 1. Estado del proyecto (verificado hoy)

| Tema | Estado | Evidencia |
|---|---|---|
| Web con 4 pantallas (Inicio, Mapa, Ficha, Acciones) y datos reales | Hecho | `web/`, `node --test "web/tests/*.test.mjs"`: 12 pass |
| PR #57 (mapa real) | Fusionado en `dev`; `dev` → `main` en PR #64 | `git log origin/main` |
| Issue #9 | Sigue abierto, aunque su PR ya se fusionó: el cierre automático solo ocurre al fusionar en `main` por PR directo | `gh issue list` |
| URL pública con los datos nuevos | **Sin verificar** | Pendiente: abrir Pages sin sesión |
| PRs abiertos | Ninguno | `gh pr list` |

## 2. Lo que hay en Figma

| Marco | Tamaño | Nodos | Textos clave |
|---|---|---|---|
| Login | 1440×1024 | 67 | "Inicia sesión", correo, contraseña, "¿Olvidaste tu contraseña?", "Regístrate" |
| Register | 1440×1024 | 77 | "Crear una cuenta", nombre, correo, contraseña ×2, términos |
| Home | 1280×2261 | 320 | Héroe "Observatorio Costero y Meteorológico de BCS", clima por ciudad, estación La Paz, mapa radar, pie |
| Clima | 1280×1815 | 320 | No se pidió; queda fuera |

Tokens que salen del archivo:
- **Fuentes:** Space Grotesk (títulos y formularios), Manrope (texto de Home) y JetBrains Mono (etiquetas de Home). Las tres están en Google Fonts; su licencia (se espera OFL) hay que confirmarla en fonts.google.com y registrarla en `docs/RECURSOS.md`.
- **Colores:**
  - Login y Register: base `#0c2340` y `#0f172a`, grises `#334155`, `#64748b`, `#94a3b8`, `#e2e8f0`, acentos `#22d3ee` y `#34d399`.
  - Home: `#000d21`, `#006d3d`, `#0098a6`, `#44474d` y `#f7f9fc`.
- **Radios:** Login 8, 24 y 9999. Register 12, 32 y 9999. Home 2, 8, 12 y 9999.
- **Imágenes:**
  - Login y Register: una "Vista satelital de la Península de BCS".
  - Home: "Imagen de Fondo Satelital" y una imagen de 1280×640.
  - Logo: un "Brand Logo" en Login y un "Logo Radar BCS" en Register.

## 3. Problemas encontrados (hay que resolverlos antes de copiar el diseño)

1. **Home trae datos que no se pueden verificar.**
   - **Qué trae:** temperaturas "en vivo" por ciudad (Los Cabos 27 °C…), "Actualizado hace 4 min", "Satélite GOES-18 en vivo", escala de radar en dBZ, humedad 62 %, UV 8, presión 1013 hPa, "Avisos Activos (3)" y "CONAGUA / SMN".
   - **Por qué no sirven:** ninguno sale de `indicadores.json` ni tiene fuente. Además, el proyecto mide tendencias desde 2001, no el clima del momento.
   - **Qué hacer:** regla 1 → se descartan. Se conserva la estructura visual y esos huecos se llenan con los 4 indicadores reales: calor, vegetación, lluvia y agua, cada uno con su fuente.
2. **Login y Register no tienen servidor.**
   - **El problema:** GitHub Pages es estático. Una cuenta real necesita un servicio externo con claves, lo que suma riesgo y tiempo. Un formulario que pide contraseña y no hace nada engaña al usuario.
   - **Además:** AGENTS.md describe la web como "gratuita y sin instalación", y nada del reto pide cuentas.
   - **Opción recomendada:** pantallas visuales, fieles al diseño, sin guardar ni enviar nada. Llevarían un aviso visible ("Demo: las cuentas aún no están disponibles") y un botón "Entrar sin cuenta" que lleve a Home.
   - **Decisión:** la tomas tú; si hace falta, con Carlos.
3. **Faltan textos en Register.** El subtítulo dice "Ingresa texto", y bajo "Bienvenidos" va un texto de relleno ("Ingresa texto igilanci sajkaksjkjas…"). Se dejan como "pendiente" y se piden a Ehileen (#11); no se inventan.
4. **Imágenes sin origen conocido.** La foto satelital y el fondo de Home no traen ninguna fuente en el archivo. Si no se confirma que son de NASA, de dominio público o CC0, se reemplazan por una imagen de NASA Worldview o Earth Observatory, registrada en `docs/RECURSOS.md`. El logo lo hace Ehileen (#12).
5. **Navegación y pie fuera del alcance.** El menú de Figma tiene Clima, Agricultura, Pesca y Avisos, y el pie trae "API meteorológica", "Protocolo OGC" y "© 2024". Esas pantallas no existen y se quitan. Se conserva la navegación de las 4 preguntas del reto (Inicio, Mapa, Ficha, Acciones) con el estilo de Figma, y el año va como 2026.
6. **Solo hay diseño de escritorio.** Los marcos miden 1280 y 1440 px, pero la web es para celular (se prueba a 360 px). Para el celular se apilan las columnas: en Login y Register la imagen queda arriba como franja y el formulario abajo. Si Ehileen tiene marcos móviles, mandan esos.

## 4. Reparto de trabajo (modelo según la carga)

| Tarea | Carga | Quién |
|---|---|---|
| T0. Verificar la URL pública y comentar el cierre del issue #9 | Baja | Haiku |
| T1. Guardar la especificación de Figma (tokens, textos, medidas por nodo) en `web/diseno-figma.json` | Baja, mecánica | Yo, en el navegador; son lecturas de la API, sin interpretar |
| T2. Confirmar la licencia de las fuentes y del origen de las imágenes; preparar las entradas para `docs/RECURSOS.md` | Baja | Ollama local (`scripts/delegar.ps1 -Agente ollama`) para redactar; Haiku comprueba las URLs |
| T3. `web/css/tokens.css` y fuentes de Google | Baja | Haiku |
| T4. Pantallas Login y Register (HTML/CSS, rutas `#login` y `#registro`, sin envío de datos) | Media | Sonnet |
| T5. Home: héroe, 4 tarjetas reales, mapa Leaflet en el hueco del radar y pie corregido, en lugar del Inicio actual | Alta (datos y layout) | Sonnet, con mi revisión de cada cifra contra `indicadores.json` |
| T6. Pruebas: el contrato sigue pasando, ninguna cifra sin fuente, sin "null" y sin scroll a 360 px; comparación visual contra Figma a 1280 px | Media | Haiku corre las pruebas y las capturas; yo comparo |
| T7. Revisión final del diff, handoff, PR a `dev` y comentarios en #9 y #11 | Alta (criterio) | Yo (Opus) |

Sin Codex y nunca `-Agente auto` (regla de la sesión). OpenCode es la alternativa si Ollama no responde.

## 5. Tareas

Rama: `prog-b/figma-pantallas` desde `origin/dev`. Edito solo `web/` (y mi handoff). Lo de `docs/RECURSOS.md` va en un PR aparte o se le pide a Carlos.

- [ ] **T1 Especificación.**
  - **Hecho cuando:** existe `web/diseno-figma.json` con, por marco, la lista de nodos (tipo, nombre, x, y, w, h, relleno, fuente, texto y radio).
  - **Uso:** es la referencia única de medidas; nadie mide "a ojo".
- [ ] **T3 Tokens.**
  - **Hecho cuando:** `tokens.css` define las variables `--login-*` y `--home-*` con los hex de la sección 2, y `estilos.css` las usa.
  - **Prueba:** los colores actuales de Inicio, Mapa, Ficha y Acciones no cambian.
- [ ] **T4 Login y Register.**
  - **Hecho cuando:** `#login` y `#registro` se ven como en Figma a 1440 px y apilados a 360 px.
  - **Formulario:**
    - Los formularios tienen `novalidate` y su `submit` solo muestra el aviso de demo, sin `fetch`, `localStorage` ni otro guardado.
    - Las etiquetas de los campos están asociadas a su campo con `<label for>`.
  - **Textos:** los de relleno se muestran como "Texto pendiente (UI/UX)".
- [ ] **T5 Home.**
  - **Hecho cuando:** `#inicio` tiene el héroe de Figma con un texto acorde al reto, que pasa la revisión de Carlos (sin "en vivo" ni "radar").
  - **Las 4 tarjetas:** cada una muestra la cifra que dan `RB.textoCambio` y `RB.textoFuente`. Si `significativo` es false, dice "Sin cambio claro".
  - **Mapa:** el hueco del radar lleva el mapa de zonas que ya existe, o un enlace a `#mapa`.
  - **Se elimina:** todo número que no venga de `web/data/`.
- [ ] **T6 Pruebas.**
  - **Nueva prueba:** `web/tests/home.test.mjs` revisa que cada `<data-indicador>` de Home tenga fuente y que no aparezca ningún grado sin origen.
  - **Al final:** `node --test` en verde y capturas a 360 px y a 1280 px.
- [ ] **T7 PR** a `dev`, con capturas y la lista de lo que se descartó y por qué.

## 6. Riesgos a vigilar

- Que un agente "complete" textos o cifras de Figma sin fuente. Se revisa con un `grep` de "°C|km/h|hPa|dBZ|%" en el diff.
- Que se rompa la navegación por hash o el mapa al cambiar Inicio. T6 lo cubre.
- Que se suban imágenes de origen desconocido. Ninguna imagen entra sin su línea en RECURSOS.
