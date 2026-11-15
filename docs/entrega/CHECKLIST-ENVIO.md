# Qué hay que entregar (lista para TODO el equipo)

Fuente: el PDF oficial de envío de la sede (`docs/referencia/originales/Project Submission - NASA SAC LPZ 26.pdf`), verificado diapositiva por diapositiva el 2026-11-14. Resumen: `docs/referencia/envio-del-proyecto.md`. Texto literal: `docs/referencia/envio-del-proyecto-literal.md`. Borradores de cada campo: esta carpeta (`01` a `08`).

## Plazo

- Se entrega en la plataforma: icono de perfil → **My Team** → pestaña **Project** → **Edit Details**. Abre sáb 14 nov 9:00; **cierra dom 15 nov 23:59 hora de La Paz**. Nuestra meta: enviar el domingo antes de las 13:00.
- **Nada guardado ni enviado después de las 23:59 cuenta.** Sin excepciones ni ediciones tardías. La hora del envío debe ser anterior al cierre.
- Solo lo que se publica con **Submit for Judging** lo ven los jueces. **Reenviar después de cada cambio.** "Save Progress" solo guarda.
- Una sola persona edita a la vez: **Lock en ON**, y avisar al equipo antes de quitarlo.
- Si falta una sección obligatoria, la plataforma no deja enviar.

## Los 7 campos y su borrador

| Campo de la plataforma | Borrador | Qué pide |
|---|---|---|
| High-Level Summary | `01` | Nombre del proyecto y resumen de 50-200 palabras: qué se desarrolló, cómo responde al reto, por qué importa. |
| Project Demo | `02`, `08` | **UN solo enlace** público, sin contraseña ni registro, probado sin sesión iniciada. Diapositivas (máx. 7, la portada cuenta) **o** video de 30 s o menos. Nuestro formato: video con subtítulos en inglés. |
| Final Project | `03` | Enlace público al proyecto (nuestra web). |
| Project Details | `04` | Qué hace, cómo funciona, beneficios, qué esperamos lograr, herramientas, lenguajes y hardware. |
| Use of SI (IA) | `05` | Qué herramientas de IA se usaron, dónde y cómo (lista desplegable). |
| Space Agency Data | `06` | Datos NASA usados, cómo, cómo inspiraron el proyecto. **Al menos un recurso NASA del reto** para optar a premios globales. |
| References | `07` | Todo lo demás: código, texto, imágenes, fuentes, íconos, audio, aunque sea libre. |

Al final, dos casillas obligatorias: **Agree to Terms and Conditions** y **Confirm All Work is Original** (todo recurso externo está listado en `06` y `07`; nada con derechos de autor sin permiso).

## Reglas que descalifican o bajan puntos

1. **Inglés escrito** en la página de entrega, **en el enlace del proyecto final (nuestra web)** y en la demo. El video puede hablarse en español con subtítulos en inglés. **Nuestra web hoy está en español: ver el issue de la versión en inglés.**
2. **Menores de 18: ni nombre, ni voz, ni imagen** en la demo, en el proyecto ni en ninguna parte de lo que se entrega. Los mayores que aparezcan o se nombren deben estar de acuerdo con que NASA use su nombre e imagen en relación con el material.
3. **IA:** imágenes y videos generados llevan marca de agua visible "AI-generated"; el código y los datos generados se reconocen en texto descriptivo y metadatos. **Nada de logos, banderas ni identificadores de misión de NASA** en lo generado.
4. **Todos los miembros** registrados en la plataforma, en La Paz, listados en la Project Page y fuera de la lista de espera. Después del cierre no se pueden agregar.
5. Sin groserías ni contenido inapropiado.
6. Los enlaces (demo y proyecto) abiertos sin sesión, sin contraseña, sin pedir registro. Revisarlos antes del cierre.

## Cómo se ve un envío exitoso

Aparece **un banner arriba de la pantalla con un mensaje de confirmación**, y el panel pasa de "Project Requires Submission for Judging" a **"Project Submitted for Judging"**, con "Last Saved" y "Last Submitted". Guardar **captura de pantalla** en esta carpeta.

## Lo que muestra el formulario real (revisado en la plataforma el 2026-11-14, 22:50, sin guardar ni enviar nada)

Se abrió Edit Details como dueño del equipo y solo se leyó. Estado de la página: todo vacío; "Project OptiPaz — Check back later". Datos que **no** estaban en el PDF o que conviene saber:

- **El Summary tiene tope de 1500 caracteres** (contador "0/1500"), además de las 50-200 palabras sugeridas. Nuestro `01` mide unos 1100 caracteres: cabe.
- **"Project Name"** viene con el texto "Project OptiPaz"; hay que cambiarlo por el nombre real (Radar BCS).
- **Project Details** es un editor de texto enriquecido: se pega el texto de `04` (sin formato raro).
- **La pregunta "Use of Super Intelligence (SI)" es una lista de opciones múltiples** ("select all that apply") y la respuesta **no la ven los jueces**, solo sirve para recopilar datos. Lo que sí ven son las marcas "AI-generated", el texto descriptivo y los metadatos dentro del proyecto. Se elige todo lo que usamos, sin omitir nada (regla 10).
- **NASA Data y Space Agency Partner & Other Data** son filas de "Link Text" + "Link Url" con botón "Add New Link": una fila por recurso, con la URL completa (https://...). El texto largo de `06` y `07` se resume en esas filas.
- **Las dos casillas finales son obligatorias** ("Agree to Terms and Conditions" y "Confirm All Work is Original").
- **Save Progress NO envía el proyecto ni lo cierra** (lo dice la plataforma), pero **desde ahí los cambios quedan visibles para cualquiera que abra la página del equipo**. No se guarda texto a medias, con TODO, con nombres de menores ni en español. Solo se guarda lo que ya se pueda leer públicamente.
- **Solo cuenta el último clic en "Submit for Judging"**; tras el cierre (dom 15 nov 23:59, hora de La Paz) "submission is final".
- Con el **Lock** en OFF, otro miembro puede abrir y sobrescribir. Poner ON al empezar a llenar y avisar al equipo.

## Estado (se actualiza aquí; última revisión 2026-11-14 noche)

- [x] 01 resumen (153 palabras)
- [ ] 02 enlace de la demo (video aún no grabado)
- [ ] 03 enlace del proyecto: falta confirmar las 4 pantallas y **la versión en inglés**
- [ ] 04 detalles: falta celular real (#71) y confirmar equipos
- [ ] 05 uso de IA: falta lo de Stitch (#79)
- [x] 06 datos NASA (revisar con el último PR de Luca)
- [ ] 07 referencias: faltan íconos, logo, audio y Supabase si el login sale
- [ ] Plataforma: Lock, Submit for Judging, captura del banner
- [ ] Todos en la pestaña Members

Los pendientes de cada persona están en sus issues (#78, #79, #80, #81, #82).
