# Cronología del proyecto

Generada el 2026-11-15 (10:15, hora de La Paz) con `gh pr list --state merged`, `gh pr view` y `git log origin/dev`. Horas de La Paz (UTC-7), convertidas desde UTC. Solo hitos; el repositorio tiene unos 400 commits y 168 PR fusionados en estos tres días. Rol "Líder" = cuenta del Líder (Carlos) con su asistente Claude.

## Viernes 13 de noviembre

| Hora (La Paz) | Qué pasó | PR/commit | Quién |
|---|---|---|---|
| 15:12 | Se crea el repositorio (commit inicial) | `3eb6bcd` | Líder |

## Sábado 14 de noviembre

| Hora (La Paz) | Qué pasó | PR/commit | Quién |
|---|---|---|---|
| 10:44 | Base del entorno: reglas, roles, documentos y archivos de inicio | `3e6d2bc` | Líder |
| 12:10 | Rúbrica, hora límite, fuentes verificadas y borrador de entrega | #14 | Líder |
| 12:50 | Validación del método con NASA POWER y primeros hallazgos | #23 | Líder (Investigación) |
| 13:00 | Entrega completa en inglés (issue #2); horarios, formato de demo (video de 30 s) y regla de menores | #24 | Líder |
| 13:28 | Web base: 4 pantallas con datos de prueba y contrato de datos v0.1 | #25 | Prog. B |
| 13:29 | Limpieza de `main` (docx original y nombre de un integrante menor de 18); se trae a `dev` a las 13:30 | #30, #31 | Líder |
| 15:22 | Contrato de datos acordado | #35 | Líder |
| 15:38 | Pipeline de tendencias con NASA POWER según el contrato | #37 | Prog. A |
| 16:25 | Hora límite oficial: domingo 23:59 (meta interna 13:00) | #48 | Líder |
| 16:31 | Web con datos reales de NASA POWER | #45 | Prog. B |
| 16:48 | MODIS por zona (vegetación y calor) y cliente AppEEARS | #50 | Prog. A |
| 17:49 | Web: vegetación real (MODIS NDVI) | #54 | Prog. B |
| 18:47 | Se declara Google Stitch como IA usada y se quita Gemini | #58 | Líder |
| 18:51 | Decisión de Carlos: sin congelamiento de funciones | #60 | Líder |
| 19:43 | Mapa con zonas reales de MODIS (cierra #9) | #57 | Prog. B |
| 19:48 | Primera fusión grande `dev` a `main`: mapa real, calor MODIS y agua GRACE | #65 | Líder |
| 20:34 | Pantalla Home de Figma con datos reales | #69 | Prog. B |
| 21:51 | Guía oficial de envío verificada y CHECKLIST-ENVIO | #91 | Líder |
| 21:53 | Calor 2001-2021 (+0.94 °C): se corta antes de la deriva de Terra | #90 | Prog. A |
| 22:43 | Pulido de las 17 pantallas de Figma, assets y tokens | #99 | UI/UX |
| 23:09 | El login con Supabase no entra a la entrega | #107 | Líder |
| 23:27 | Decisión de Carlos: Calor opción B (aire principal, superficie no concluyente) | #111 | Líder |
| 23:29 | Versión en inglés con `?lang=en` e interruptor ES/EN | #110 | Prog. B |

## Domingo 15 de noviembre

| Hora (La Paz) | Qué pasó | PR/commit | Quién |
|---|---|---|---|
| 00:45 | Calor opción B en el código: el indicador sale de NASA POWER T2M (aire, +1.47 °C 2001-2025) | #133 | Líder |
| 01:52 | Decisión: el Mapa Agrícola entra con la reserva de SIAP y SEPADA | #148 | Líder |
| 02:01 | Inicio: estado del cielo en vivo en BCS con íconos | #149 | Líder |
| 02:42 | Pesca y Avisos: mapa de íconos con datos reales, menú superior (escritorio) e inferior (celular) | #155 | Líder |
| 04:17 | Pestaña Mapa como el frame Clima de Figma | #164 | UI/UX |
| 04:57 | Clima: pantalla con detalle de las 4 tarjetas (reemplaza #178) | #180 | Líder |
| 04:58 | Marca de agua AI-generated dentro de la imagen del logo | #181 | Líder |
| 05:02 | Entrega lista: borradores al día y paquete para pegar en la plataforma | #182 | Líder |
| 06:18 | Lluvia por celda de 0.1° con IMERG para La Paz | #189 | Prog. A |
| 07:36 | Clorofila, SST y anomalía por puerto desde ERDDAP | #198 | Prog. A |
| 08:08 | Clima: Mapa Meteorológico con fichas por lugar | #203 | Prog. B |
| 08:17 | Guía del equipo, video (voz ElevenLabs) y ajustes de la entrega | #204 | Líder |
| 08:36 | Animación del cielo en Clima (GIBS: nubes y lluvia en secuencia) | #207 | Líder |
| 09:07 | Mapa dentro de Clima, 38 localidades (calor del aire y lluvia) y animación visible | #210 | Líder |
| 10:02 | Navegación con íconos e Inicio al centro; Acciones dentro de Clima; mapa Agro con capas | #212 | Líder |
| 10:03 | 19 puertos (Pesca/Clima) y 20 lugares en el mapa del tiempo | #213 | Líder |
| 10:03 | Inicio: animación de las últimas 2 horas de satélite (GOES-West) | #214 | Líder |
| 10:04 | Corrección: marcas de conflicto en `docs/entrega/04-project-details.md` que quedaron al fusionar #214; arregladas en #215 al minuto y nunca llegaron a `main` | #215 | Líder |
| 10:04 | Se abre `dev` a `main` con todo lo anterior; espera el "fusiona" de Carlos | #216 (abierto) | Líder |

## Fusiones a `main` (hora de La Paz)

Sábado 14: #15 (12:13), #18 (12:19), #19 (12:20), #21 (12:25), #22 (12:38), #26 (12:58), #29 (13:29), #30 (13:29), #34 (15:19), #47 (16:21), #51 (16:43), #55 (17:50), #59 (18:51), #61 (18:52), #64 (19:33), **#65 (19:48)**.

Domingo 15: **#85 (01:53)**, **#150 (02:18)**, **#156 (02:56)**, **#172 (04:37)**, **#183 (05:16)**, #189 (06:18, abierto por error hacia `main`), #193 (06:22), #192 (06:30), **#200 (07:38)**, #202 (07:52), **#205 (08:22)**, **#208 (08:46)**, **#211 (09:09)**.

Pendiente: #216 (`dev` a `main`), abierto a las 10:04.
