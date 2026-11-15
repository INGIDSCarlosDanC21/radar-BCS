# Presentación HTML: cómo usarla

Carpeta: `presentacion/` (6 partes, 8 min objetivo, 10 máximo). Diseño y reglas: `presentacion/DISENO.md` y la skill `diapositivas-html`.

## Abrir
1. Doble clic en `presentacion/INICIAR-PRESENTACION.bat`. Regenera `index.html`, levanta un servidor local (127.0.0.1:8765) y abre Chrome en modo aplicación a 1280x720.
2. Al terminar, doble clic en `presentacion/DETENER-PRESENTACION.bat` (apaga solo ese servidor).
3. Si falta algo en `vendor/`, corre `presentacion/INSTALAR.bat` (si todo está, dice que no hace falta).

## Teclas
Flechas izquierda/derecha: retroceder y avanzar · **T** cronómetro (parte/global) · **R** reinicia · **S** notas del orador · **F** pantalla completa.

## Ensayo
Ensayen con el cronómetro (T). Tiempos: 0:50, 1:10, 1:10, 2:30, 1:10, 0:40. Pasarse de 10 min es el límite. Orador 5 se presenta como "Integrante 6".

## Si falla el internet
No se necesita: Reveal, anime y fuentes están incluidos y la demo usa capturas ya incluidas (`assets/capturas/`). Las pantallas de clima, pesca y avisos no tienen captura en vivo porque Open-Meteo limitó las consultas; se muestran con las capturas disponibles. Respaldo sin servidor: doble clic en `presentacion/index.html` (el video y el 3D pueden no cargar).

## Qué NO está en git
`trailer.mp4` (`assets/video/`) y los `*.glb` (`assets/modelos/`) están en `.gitignore`. Pásenlos por Drive o USB y colóquenlos en esas carpetas. El video es opcional; el .bat intenta copiarlo desde `video/out/trailer-radar-bcs-v4.mp4`.

## Cambiar un dato
1. Edita solo la parte en `presentacion/partes/0N-nombre.html` (la cifra y su `<p class="fuente">`; el dato debe venir de `data/salida/` o `docs/investigacion/`).
2. Corre `node presentacion/build.mjs`.
3. Opcional: `node presentacion/verificar.mjs <carpeta-fuera-del-repo> offline` y revisa las capturas.
Nunca edites `index.html` a mano.
