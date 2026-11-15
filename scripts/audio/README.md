# Audio del trailer

`generar_audio.py` descarga (vista previa HQ de Freesound, solo sonidos CC0 de `fuentes.json`), comprueba la licencia
de cada uno en su página, recorta/estira/mezcla y escribe en `video/public/audio/` el lecho de 28 s a 120 BPM,
13 efectos sueltos (WAV 48 kHz 16 bit, picos a -3 dBFS) y `mezcla-referencia.mp3`.

Necesita `ffmpeg` (con `rubberband`) y `ffprobe` en el PATH. Los originales y los intermedios van a `--work`
(fuera del repo; pesan unos 25 MB).

```powershell
uv run --python 3.12 --with numpy --with scipy scripts/audio/generar_audio.py --work D:\tmp-radar\audio-trabajo --narracion <ruta a video\public\narracion.mp3>
uv run --python 3.12 --with numpy --with scipy scripts/audio/verificar_audio.py
```

- Sin `--narracion` no se crea la mezcla de referencia (la narración no se sube al repo).
- Parámetros al inicio del script: `BPM=120`, `DURACION=28`, `SEED`, `LUFS_LECHO=-20`, `FX_REL=0.5`; la lista `CUES` es la línea de tiempo de la mezcla.
- Sonoridad y pico real: `ffmpeg -i archivo -af ebur128=peak=true -f null -`.
- Tarda unos 2 minutos (estiramiento con rubberband y filtros con barrido).
- Licencias: `video/public/audio/LICENCIAS.md`.
