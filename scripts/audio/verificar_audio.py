#!/usr/bin/env python3
"""Verificacion objetiva de video/public/audio: duraciones, picos, bordes, espectro y rejilla ritmica.
Uso: uv run --python 3.12 --with numpy --with scipy scripts/audio/verificar_audio.py
La sonoridad (LUFS) y el pico real se miden aparte con ffmpeg ebur128 (ver README)."""
import glob, os, subprocess
import numpy as np
from scipy import signal

SR = 48000
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "video", "public", "audio")

def cargar(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).T.astype(np.float64)

def banda(x, a, b):
    f, P = signal.welch(x, SR, nperseg=8192)
    return 10 * np.log10(P[(f >= a) & (f < b)].sum() / P.sum() + 1e-12)

print("== efectos sueltos ==")
for p in sorted(glob.glob(os.path.join(D, "*.wav"))):
    x = cargar(p); m = x.mean(0); n = x.shape[1]
    pico = 20 * np.log10(np.abs(x).max())
    nz = np.argmax(np.abs(m) > 1e-4)
    fin = np.abs(m[-int(0.005 * SR):]).max()
    cl = np.abs(np.diff(m)).max()
    print(f"{os.path.basename(p):20s} dur {n/SR:6.3f} s | pico {pico:5.2f} dBFS | 1a muestra audible a {nz/SR*1000:5.1f} ms | ultimos 5 ms max {fin:.4f} | salto max {cl:.3f}")

print("\n== lecho ==")
x = cargar(os.path.join(D, "bed-120bpm-28s.mp3"))
m = x.mean(0); n = len(m)
print(f"duracion {n/SR:.3f} s, pico {20*np.log10(np.abs(x).max()):.2f} dBFS")
print("bandas (dB relativos a la potencia total): sub 30-90 %.1f | graves 90-250 %.1f | medios 250-2k %.1f | presencia 2k-8k %.1f | aire 8k-12k %.1f" %
      (banda(m, 30, 90), banda(m, 90, 250), banda(m, 250, 2000), banda(m, 2000, 8000), banda(m, 8000, 12000)))
w = int(0.1 * SR)
rms = np.array([10 * np.log10((m[a:a + w] ** 2).mean() + 1e-12) for a in range(0, n - w, w)])
print("nivel minimo en ventanas de 100 ms: %.1f dBFS (sin silencios digitales)" % rms.min())
print("RMS por segundo (dBFS):", [round(10 * np.log10((m[a:a + SR] ** 2).mean() + 1e-12)) for a in range(0, n - SR + 1, SR)])
print("mono vs estereo: correlacion L/R %.3f; pico de M/pico de L %.2f" % (np.corrcoef(x[0], x[1])[0, 1], np.abs(m).max() / np.abs(x[0]).max()))

# rejilla ritmica: se pliega el flujo de energia de cada banda sobre el periodo de la rejilla; si los
# transitorios caen en la rejilla, el perfil plegado tiene un pico fuerte y su fase es ~0 ms.
def flujo(y, hop=48):
    e = np.sqrt(np.convolve(y ** 2, np.ones(hop) / hop, "valid")[::hop]); fs = SR / hop
    return np.maximum(np.diff(e, prepend=0), 0), fs
for nombre, f1, f2 in [("graves 30-250 Hz", 30, 250), ("medios 250-2k", 250, 2000), ("ataques 2-9 kHz", 2000, 9000)]:
    y = signal.sosfilt(signal.butter(4, [f1, f2], "bp", fs=SR, output="sos"), m)
    d, fs = flujo(y); t = np.arange(len(d)) / fs
    for ini, fin in [(13, 24)]:
        sel = (t > ini) & (t < fin)
        for per in (0.5, 0.25):
            prof = np.bincount(((t[sel] % per) / per * 50).astype(int), weights=d[sel], minlength=50)
            k = np.argmax(prof); fase = (k + 0.5) / 50 * per * 1000
            fase = fase if fase < per * 500 else fase - per * 1000
            print(f"[{nombre}, {ini}-{fin} s] rejilla {per} s: fuerza del pico {prof.max()/prof.mean():.2f} (1 = sin ritmo), fase del pico {fase:+.0f} ms")
    # transitorios fuertes: distancia a la rejilla de 0.25 s
    pk, _ = signal.find_peaks(d, height=d.max() * 0.4, distance=int(0.1 * fs)); tt = pk / fs
    res = (tt + 0.125) % 0.25 - 0.125
    print(f"   {len(tt)} transitorios fuertes; a menos de 25 ms de la rejilla de 0.25 s: {(np.abs(res) <= 0.025).sum()}")
# pico del impacto en 12.0 s
sos = signal.butter(4, [30, 120], "bp", fs=SR, output="sos"); y = np.abs(signal.sosfilt(sos, m))
ven = y[int(11.5 * SR):int(13.5 * SR)]
print("maximo de graves (30-120 Hz) entre 11.5 y 13.5 s en t = %.3f s" % (11.5 + np.argmax(ven) / SR))
