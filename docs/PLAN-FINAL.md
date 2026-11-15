# Plan para terminar lo que falta (domingo 15 de noviembre)

Escrito a las 03:28 (hora de La Paz) por el asistente del Líder. Quedan **9 h 30 min** para la meta interna (**Submit for Judging a las 13:00**) y **20 h 30 min** para el cierre oficial (23:59). Este plan reemplaza las listas sueltas del chat. Lo anterior está en [`PLAN-CIERRE.md`](PLAN-CIERRE.md) (noche del sábado) y la lista de campos de la plataforma en [`entrega/CHECKLIST-ENVIO.md`](entrega/CHECKLIST-ENVIO.md).

## 0. Estado en una mirada (actualizado a las 05:20)

| Área | Estado |
|---|---|
| Web (Inicio, Mapa, Clima, Ficha, Agro, Pesca, Avisos, Acciones, ES/EN) | **Terminada en `dev`**, con puerta de calidad y revisión a 360, 390 y 1280 px |
| `main` (lo que ve el jurado) | Tiene todo hasta #172; **falta pasar** Clima, la marca en el logo, `PLATAFORMA-LISTA` y los ajustes de la entrega (PR `dev → main` abierto, espera el "fusiona" de Carlos) |
| Clima (buscador, chips, 4 tarjetas con detalle) | Hecho por Luca (#178), integrado en #180; las tarjetas de la pestaña Mapa llevan a su detalle |
| "Ver más" y pliegues | Hecho (#167, #171) |
| Fuentes e IA documentadas fuera de pantalla | Hecho (`FUENTES-Y-IA.md`); marca de agua del logo **dentro de la imagen** (#181), según el texto oficial |
| Borradores de entrega `01` a `08b` | Al día; paquete para pegar en `PLATAFORMA-LISTA.md` |
| Video de 30 s | **Sin grabar** (guion listo); debe estar hoy, antes de las 23:59 |
| Plataforma | Nada guardado ni enviado (a propósito) |
| Falta de mi lado | Prueba con sol real (después de las 07:00) y segunda prueba de servicios (12:00) |

## 1. Lo que solo Carlos puede decidir o hacer

Marcado con quién bloquea y a qué hora conviene tenerlo.

| # | Qué | Por qué importa | Para cuándo |
|---|---|---|---|
| 1 | **Decir "fusiona" para pasar `dev` a `main`** (con `--admin`) cuando la puerta esté en verde | Lo que ve el jurado es `main`; hoy le faltan #157, #162, fuentes y lo que venga | 10:30 |
| 2 | Decidir si se fusiona el **#159** de Ehileen (quita la pestaña Ficha y los chips de arriba) | Toca `index.html`, `app.js`, `menu.js`, `agricola.js`; mientras esté abierto otros cambios pueden chocar | cuanto antes |
| 3 | Contestar las 4 decisiones de **"Ver más"** (`PLAN-VER-MAS.md`, sección 8) | Sin ellas no se programa; son unas 2 h | 05:00 para que alcance |
| 4 | Pegar el **texto oficial de la regla nueva** de fuentes e IA | Hoy solo lo tenemos por ti; los documentos oficiales del repo dicen otra cosa (ver `FUENTES-Y-IA.md`) | antes de enviar |
| 5 | **Grabar el video de 30 s** (o decidir diapositivas) | Es el campo `02`; sin demo no hay envío completo. Carlos dijo "mañana" a las 04:40: **si es hoy domingo, entra; si fuera el lunes, ya no** (la plataforma cierra el domingo a las 23:59) | hoy, antes de las 23:59 |
| 6 | **Pasos de la plataforma**: Lock en ON, llenar los 7 campos, 2 casillas finales, Submit | Solo tú tienes la sesión; el envío es final | 11:00 a 13:00 |
| 7 | Confirmar con el Local Lead la **hora de la evaluación** | AGENTS dice "por confirmar" | hoy |
| 8 | Confirmar que **todos están en Members** de la plataforma y sin lista de espera | Regla que descalifica; no se puede arreglar después del cierre | antes de enviar |

## 2. Línea de tiempo (hora de La Paz)

| Hora | Bloque | Quién |
|---|---|---|
| 03:30 a 04:30 | Fusionar el PR de fuentes a `dev`; revisar #159 con Carlos; alinear `04` a `07` con la web actual (Pesca, Avisos, simulaciones, cielo en vivo, menú) | Asistente |
| 04:30 a 05:00 | Carlos contesta "Ver más" y decide #159 | Carlos |
| 05:00 a 07:00 | "Ver más" (si se aprueba): componente, pruebas, 3 anchos, ES/EN | Asistente |
| 07:00 a 08:00 | **Prueba con sol real**: pines e íconos de día en el mapa de Inicio y en Pesca; contraste a 360 px; repetir disponibilidad de servicios | Asistente |
| 08:00 a 09:00 | Puerta de calidad completa y PR `dev` → `main`; sitio público sin sesión, ES y `?lang=en` | Asistente, Carlos fusiona |
| 09:00 a 11:00 | Video: guion actualizado (ver 3.4), grabación, subtítulos en inglés, sin menores; prueba en celular real | Carlos (+ Ehileen) |
| 11:00 | Borrador de entrega completo (`01` a `08` finales) | Asistente |
| 11:00 a 12:30 | Llenar la plataforma (solo guardar si Carlos lo decide), revisar enlaces **sin sesión**, captura | Carlos |
| 12:00 | Segunda prueba de disponibilidad de servicios | Asistente |
| **13:00** | **Submit for Judging** | Carlos |
| 13:00 a 23:59 | Margen: solo correcciones graves y **reenviar**; practicar el pitch | Todos |

## 3. Lo incompleto, por área

### 3.1 Web
- [ ] **Clima** (`PLAN-CLIMA.md`): Luca datos y reglas, Diego pantalla; corte 09:30, si no está verde se envía sin Clima. Decisión de Carlos: elegir lo mejor para el proyecto.
- [x] **#159** fusionado a `dev` (2026-11-15 04:00).
- [x] Borrado el `<span class="marca-ia">` de `index.html` (tras #159).
- [x] **"Ver más"** implementado (`PLAN-VER-MAS.md`): 19 textos plegados, botón "Subir"; extras de Agro y Ficha también hechos.
- [ ] **"Ver más"** (`PLAN-VER-MAS.md`): esperando decisiones.
- [ ] **Prueba con sol real** de pines e íconos (la de día fue simulada).
- [ ] **Agro a 360 px** (issue #128, Diego): revisar pines cortados y chip de estado; se midió contraste, no esto.
- [ ] **Tarjetas del Agro del mismo tamaño** (pedido de Ehileen): hecho para dos o más columnas; en celular cada tarjeta mide lo que necesita. Decidir si Carlos quiere igual altura también ahí (suma scroll).
- [ ] Revisar el **menú** en celular tras #159 (Ehileen avisó que no lo revisó a 360 px).
- [ ] Opcional: caché de Open-Meteo de 10 a 15 min y en `localStorage` si se espera mucho tráfico (`investigacion/disponibilidad-servicios.md`).
- [ ] Opcional (≈ 2 h, solo si sobra): viento animado y bucle de GOES. Radar no: sin cobertura confirmada.

### 3.2 Datos y ciencia
- [ ] **Luca:** aprobación y resumen final de datos (#118, #81: seguridad del login ya no aplica porque login no entra).
- [ ] **Escalas de Douglas y Beaufort** (Pesca y Avisos): contrastar contra la fuente primaria; hoy están en fuentes secundarias (`investigacion/umbrales-mar.md`). Si no se confirma, dejar la frase "según la escala citada" y no más.
- [ ] **SIAP 2025 y SEPADA** del Mapa Agrícola: siguen sin poder verificarse; la reserva está declarada en la web y en `decisiones.md`. Intentar de nuevo a las 07:00 por si el servicio vuelve.
- [ ] `web/data/agricola.json` sin campo `generado_con` (ver `entrega/05`): confirmar con Diego si `armar_agricola.py` se hizo con IA y agregarlo.

### 3.3 Documentación y entrega
- [ ] **`04` Project Details**: alinear con la web final (Pesca, Avisos, menú, simulaciones, cielo en vivo, límites: "modelo, no estaciones").
- [ ] **`05` Uso de IA**: ya refleja la regla nueva; falta el menú de la plataforma ("Google Stitch" u "Other") y confirmar que no hay otra herramienta usada.
- [ ] **`06` y `07`**: una fila por recurso con URL completa; incluir Open-Meteo, VIIRS NOAA-20, GOES-West, OpenStreetMap, Material Symbols (Apache-2.0, nunca CC0), Leaflet, fuentes de letra.
- [ ] **`01` Summary**: máximo 1500 caracteres (hoy ~1100); revisar que mencione lo nuevo sin pasarse.
- [ ] **`02` enlace de la demo** y **`03` enlace del proyecto**: probar sin sesión, sin contraseña.
- [ ] **Bitácora** y **documentación de Drive** (Roberto, #80): sin respuesta; si no llega, el asistente deja la bitácora al día con lo que está en git.
- [ ] **Inglés**: revisión final de Pesca, Avisos, simulaciones y Agro con `?lang=en` (hay pruebas automáticas; falta lectura humana de Ehileen).

### 3.4 Video (guion `08`)
El guion fue escrito antes de Pesca, Avisos, simulaciones y cielo en vivo. Propuesta de 30 s (sin menores, sin voz generada, subtítulos en inglés): 5 s gancho "¿qué cambió en La Paz?" (Inicio con las 4 tarjetas) → 8 s Ficha de calor con la cifra y la prueba estadística → 7 s "Viaja en el tiempo" / "Mira La Paz desde el espacio" → 6 s Pesca y Avisos con "modelo, no oficial" → 4 s cierre con enlace. Si no hay tiempo de grabar, **diapositivas** (máx. 7, portada incluida) como plan B.

### 3.5 Plataforma
- [ ] Lock en ON, avisar al equipo.
- [ ] Project Name: cambiar "Project OptiPaz" por "Radar BCS".
- [ ] 7 campos y 2 casillas finales ("Agree to Terms" y "Confirm All Work is Original").
- [ ] Todo en **inglés** y sin nombres de menores.
- [ ] Después de enviar: captura del banner y de "Project Submitted for Judging".

### 3.6 Después de enviar
- [ ] Quitar el nombre del menor del historial de git (requiere reescribir historia: se hace **solo después** del envío y con el permiso de Carlos, nunca en medio del evento).
- [ ] Decidir si se quita el correo de contacto de los documentos públicos.
- [ ] Preparar el pitch para la evaluación del jurado.

## 4. Riesgos que vigilamos

1. **Un envío que no llegó:** solo cuenta el último clic en "Submit for Judging". Enviar a las 13:00, no a las 23:00.
2. **`main` desactualizado:** el jurado ve `main`. La puerta de calidad y el PR a `main` van a las 08:00, no al final.
3. **Cambios de última hora que chocan:** mientras #159 esté abierto, los cambios a `index.html`, `app.js`, `menu.js` y `agricola.js` se hacen en ramas cortas y se prueba la fusión en seco con `dev` antes de abrir PR.
4. **Marca de IA:** la regla nueva la fija Carlos; el texto oficial por citar. Si la sede o la NASA piden la marca, se vuelve a mostrar quitando una regla de CSS (`fuentes.css`).
5. **Open-Meteo con mucho tráfico:** no alcanza si el enlace se difunde mucho; margen en `disponibilidad-servicios.md`.
6. **Cansancio:** una sola cosa a la vez; nada a medias a `main`.

## 5. Puerta de calidad antes de pasar a `main`

Igual que en `PLAN-CIERRE.md`, más lo nuevo: `node --test "web/tests/*.test.mjs"` y `"diseno/tests/*.test.mjs"` en verde; `scripts/verificar-todo.ps1`; sitio sin sesión en ES y `?lang=en` sin errores de consola; sin menores, sin logos de NASA, sin secretos, sin archivos de más de 5 MB; `RECURSOS.md` y `07` listan todo lo que carga la web.
