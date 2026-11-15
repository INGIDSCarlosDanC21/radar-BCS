#!/usr/bin/env python3
"""Genera la biblioteca de audio del trailer de Radar BCS a partir de muestras CC0 reales.

Material base (todo CC0, ver scripts/audio/fuentes.json y video/public/audio/LICENCIAS.md):
  - Lecho: pulso electronico a 97 BPM (Freesound 529380) estirado a 120 BPM + dos drones en Do
    (Freesound 371194 y 332246) + riser/impacto reales. Todo en tonalidad de Do.
  - Efectos: recortes, fades, EQ, estiramiento y normalizacion de muestras CC0 de Freesound.
Todo el procesado (cortes, filtros con barrido, reverb por convolucion, mezcla, normalizacion LUFS)
es de este script (numpy / scipy / ffmpeg).

Uso (PowerShell):
  uv run --python 3.12 --with numpy --with scipy scripts/audio/generar_audio.py --work D:\\tmp-radar\\audio-trabajo --narracion <ruta a narracion.mp3>
Los originales descargados y los WAV intermedios quedan en --work (fuera del repo).
"""
import argparse, json, os, re, subprocess, sys, tempfile, urllib.request
import numpy as np
from scipy import signal
from scipy.io import wavfile

# ---------------- parametros ----------------
BPM = 120
DURACION = 28.0          # s, lecho
SEED = 20261115
SR = 48000
BEAT = 60.0 / BPM
PICO_FX_DB = -3.0        # picos de los efectos sueltos
LUFS_LECHO = -20.0
QUICK = False
FX_REL = 0.5             # escala global de los efectos en la mezcla de referencia (volumen real = g * FX_REL)

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", ".."))
SALIDA = os.path.join(RAIZ, "video", "public", "audio")

# ---------------- utilidades ----------------
def run(cmd):
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode("utf8", "replace")[-800:])
    return r

def cargar(path, sr=SR):
    """Decodifica con ffmpeg a float32 estereo (2, N) a sr."""
    r = run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(sr), "-f", "f32le", "-"])
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).T.astype(np.float64).copy()

def guardar_wav(path, x):
    y = np.clip(x.T, -1, 1)
    wavfile.write(path, SR, (y * 32767).astype(np.int16))

def estirar(x, tempo, tmp):
    """Estira en el tiempo (tempo>1 = mas rapido) sin cambiar el tono, con rubberband de ffmpeg."""
    a, b = os.path.join(tmp, "_in.wav"), os.path.join(tmp, "_out.wav")
    wavfile.write(a, SR, (np.clip(x.T, -1, 1) * 32767).astype(np.int16))
    run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af",
         f"rubberband=tempo={tempo:.6f}:transients=crisp:pitchq=quality", b])
    return cargar(b)

def recorte(x, t0, dur):
    a = int(round(t0 * SR)); n = int(round(dur * SR))
    y = x[:, a:a + n]
    if y.shape[1] < n:
        y = np.pad(y, ((0, 0), (0, n - y.shape[1])))
    return y.copy()

def fade(x, entrada=0.0, salida=0.0):
    n = x.shape[1]; g = np.ones(n)
    a = int(entrada * SR); b = int(salida * SR)
    if a > 0:
        g[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if b > 0:
        g[n - b:] *= np.cos(np.linspace(0, np.pi / 2, b)) ** 2
    return x * g

def normalizar_pico(x, db=PICO_FX_DB):
    return x * (10 ** (db / 20) / np.max(np.abs(x)))

def rbj(kind, f, q):
    f = float(np.clip(f, 20, SR * 0.45)); w0 = 2 * np.pi * f / SR
    al = np.sin(w0) / (2 * q); c = np.cos(w0)
    if kind == "lp":
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    elif kind == "hp":
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    else:
        b = [al, 0, -al]
    a = [1 + al, -2 * c, 1 - al]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]])

def barrido(x, fc, kind="lp", q=0.8, bloque=256):
    """Filtro resonante con frecuencia de corte variable (fc: array por muestra)."""
    out = np.zeros_like(x)
    for ch in range(x.shape[0]):
        zi = np.zeros((1, 2)); n = x.shape[1]
        for a in range(0, n, bloque):
            b = min(n, a + bloque)
            sos = rbj(kind, fc[(a + b) // 2], q)
            out[ch, a:b], zi = signal.sosfilt(sos, x[ch, a:b], zi=zi)
    return out

def filtro(x, kind, f, q=0.707):
    return signal.sosfilt(rbj(kind, f, q), x, axis=-1)

def curva(puntos, n, log=False):
    """Interpolacion de (t, valor) a una curva por muestra de n muestras."""
    t = np.arange(n) / SR
    ts, vs = zip(*puntos)
    if log:
        return np.exp(np.interp(t, ts, np.log(vs)))
    return np.interp(t, ts, vs)

def ir_reverb(rt=3.0, pre=0.025, seed=1, oscuridad=3500):
    r = np.random.default_rng(seed)
    n = int(rt * SR); t = np.arange(n) / SR
    ir = r.standard_normal((2, n)) * np.exp(-t / (rt / 6.9))
    ir = filtro(ir, "lp", oscuridad, 0.6)
    ir = np.pad(ir, ((0, 0), (int(pre * SR), 0)))
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))

def reverb(x, ir, mezcla=0.3, cola=True):
    n = x.shape[1]
    w = np.stack([signal.fftconvolve(x[c], ir[c]) for c in range(2)])
    if not cola:
        w = w[:, :n]
    else:
        w = np.pad(w, ((0, 0), (0, 0)))
    seco = np.pad(x, ((0, 0), (0, w.shape[1] - n)))
    return seco * (1 - mezcla * 0.5) + w * mezcla

def soft(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)

def mono_graves(x, corte=150):
    m = (x[0] + x[1]) / 2; s = (x[0] - x[1]) / 2
    s = filtro(s, "hp", corte)
    return np.stack([m + s, m - s])

# --- sonoridad ITU-R BS.1770 (K-weighting + compuerta), solo para normalizar ---
def lufs(x):
    sh = signal.lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x, axis=-1)
    hp = signal.lfilter([1, -2, 1], [1, -1.99004745483398, 0.99007225036621], sh, axis=-1)
    w = int(0.4 * SR); h = int(0.1 * SR)
    cs = np.cumsum(np.pad(hp ** 2, ((0, 0), (1, 0))), axis=1)
    z = np.array([(cs[:, a + w] - cs[:, a]).sum() / w for a in range(0, hp.shape[1] - w, h)])
    l = -0.691 + 10 * np.log10(z + 1e-20)
    z1 = z[l > -70]
    if len(z1) == 0:
        return -70.0
    rel = -0.691 + 10 * np.log10(z1.mean()) - 10
    z2 = z[l > rel]
    return -0.691 + 10 * np.log10(z2.mean())

# ---------------- fuentes CC0 ----------------
def descargar_fuentes(work):
    fu = json.load(open(os.path.join(AQUI, "fuentes.json"), encoding="utf8"))
    os.makedirs(os.path.join(work, "orig"), exist_ok=True)
    evid = {}
    for i, d in fu.items():
        # comprobacion de licencia en la pagina del sonido (CC0 = publicdomain/zero)
        html = urllib.request.urlopen(urllib.request.Request(d["pagina"], headers={"User-Agent": "Mozilla/5.0"}), timeout=40).read().decode("utf8", "replace")
        links = sorted(set(re.findall(r"https?://creativecommons\.org/[^\"' <]*", html)))
        if links != ["http://creativecommons.org/publicdomain/zero/1.0/"]:
            raise SystemExit(f"LICENCIA NO CC0 en {d['pagina']}: {links}")
        evid[i] = links
        f = os.path.join(work, "orig", f"{i}.mp3")
        if not os.path.exists(f):
            open(f, "wb").write(urllib.request.urlopen(urllib.request.Request(d["preview_hq"], headers={"User-Agent": "Mozilla/5.0"}), timeout=90).read())
    json.dump(evid, open(os.path.join(work, "licencias_verificadas.json"), "w"), indent=1)

def S(work, i):
    return cargar(os.path.join(work, "orig", f"{i}.mp3"))

# ---------------- efectos ----------------
def fx_todos(work, tmp):
    fx = {}
    # hit-impact: boom de trailer + impacto brillante
    a = recorte(S(work, "816376"), 0, 3.8)
    b = recorte(S(work, "719831"), 0, 3.8) * 0.45
    b = filtro(b, "hp", 120)
    y = soft(a + b, 1.3)
    fx["hit-impact"] = fade(y, 0.002, 1.0)
    # hit-soft: impacto corto
    y = recorte(S(work, "719831"), 0.0, 1.3)
    y = filtro(y, "lp", 9000)
    fx["hit-soft"] = fade(y, 0.002, 0.5)
    # whooshes
    y = recorte(S(work, "877983"), 0.60, 0.5)
    fx["whoosh-short"] = fade(y, 0.05, 0.15)
    y = recorte(S(work, "63829"), 0.40, 1.2)
    fx["whoosh-long"] = fade(y, 0.04, 0.35)
    # risers que terminan exactamente al final del archivo
    y = recorte(S(work, "859482"), 0.15, 2.2)
    y = estirar(y, 2.2 / 3.0, tmp)[:, :int(3.0 * SR)]
    y = np.pad(y, ((0, 0), (0, int(3.0 * SR) - y.shape[1])))
    y = y * np.linspace(0.5, 1, y.shape[1]) ** 1.3
    fx["riser-3s"] = fade(y, 0.01, 0.006)
    y = recorte(S(work, "334525"), 2.0, 6.0)
    g = (0.12 + 0.88 * np.linspace(0, 1, y.shape[1]) ** 1.6)
    fx["riser-6s"] = fade(y * g, 0.01, 0.006)
    # reverse-swell
    y = recorte(S(work, "877966"), 0.25, 2.0)
    fx["reverse-swell"] = fade(y, 0.01, 0.008)
    # interfaz y datos (paquete de pops/clics CC0)
    ui = S(work, "538236")
    fx["ui-tick"] = fade(recorte(ui, 8.93, 0.15), 0.002, 0.04)
    fx["ui-pop"] = fade(recorte(ui, 2.00, 0.40), 0.002, 0.15)
    fx["counter-tick"] = fade(recorte(ui, 11.79, 0.12), 0.002, 0.04)
    fx["glitch"] = fade(recorte(S(work, "90335"), 0.0, 0.3), 0.001, 0.01)
    y = recorte(S(work, "844398"), 0.40, 2.5)
    fx["sparkle-reveal"] = fade(y, 0.02, 0.7)
    # cola final: caida natural del drone cinematografico
    y = recorte(S(work, "371194"), 29.8, 3.0)
    y = reverb(y, ir_reverb(2.0, 0.02, 11), 0.25, cola=False)
    fx["tail-outro"] = fade(y, 0.02, 1.2)
    return {k: normalizar_pico(v) for k, v in fx.items()}

# ---------------- lecho 120 BPM / 28 s ----------------
def lecho(work, tmp, fx):
    N = int(DURACION * SR)
    t = np.arange(N) / SR
    # pulso a 97 BPM -> 120 BPM. Los transitorios del original caen en 0.27 s + k*0.5 s tras estirar.
    pulso_full = estirar(S(work, "529380"), 120.0 / 97.0, tmp)
    ini = 18.27
    P = recorte(pulso_full, ini, DURACION)
    # tonalidad de Do (drones)
    D1 = recorte(S(work, "332246"), 8.0, DURACION)
    D2 = recorte(S(work, "371194"), 0.45, DURACION)

    # drones: entran lentos, filtro que se abre
    f_d = curva([(0, 180), (4, 300), (8, 900), (11.9, 2500), (12.0, 1200), (13, 3500), (24, 3500), (28, 500)], N, True)
    D2f = barrido(D2, f_d, "lp", 0.9)
    g_d1 = curva([(0, 0.25), (2.5, 0.8), (12, 1.0), (24, 1.0), (28, 0.5)], N)
    g_d2 = curva([(0, 0.0), (3, 0.35), (8, 0.55), (12, 0.8), (13, 0.5), (24, 0.5), (28, 0.2)], N)
    dr = D1 * g_d1 + D2f * g_d2

    # pulso: casi mudo y oscuro al inicio, se abre en la construccion, hueco en la revelacion
    f_p = curva([(0, 250), (4, 400), (8, 1400), (11.5, 6000), (11.75, 900), (12.0, 400), (13.0, 400), (13.01, 9000), (24, 9000), (26, 1500), (28, 400)], N, True)
    g_p = curva([(0, 0.10), (4, 0.18), (8, 0.35), (11.5, 0.7), (11.75, 0.0), (12.5, 0.0), (12.99, 0.5), (13.0, 1.5), (24, 1.5), (26, 0.35), (28, 0.10)], N)
    Pf = barrido(P, f_p, "lp", 0.9) * g_p

    # riser real 6->12 s a nivel moderado, impacto real en 12.0, impacto suave en 24.0
    cap = np.zeros((2, N))
    def poner(c, y, t0, g):
        a = int(round(t0 * SR)); b = min(N, a + y.shape[1])
        c[:, a:b] += y[:, :b - a] * g
    poner(cap, fx["riser-6s"], 6.0, 0.35)
    poner(cap, fx["hit-impact"], 12.0, 0.9)
    poner(cap, fx["hit-soft"], 24.0, 0.6)

    ir = ir_reverb(3.2, 0.03, SEED)
    base = dr * 0.9 + Pf * 0.8
    base = base + reverb(Pf, ir, 0.5, cola=False) * 0.25
    x = soft(base + cap, 1.1)
    x = x + 0.5 * filtro(x, "hp", 5000)
    x = mono_graves(x, 150)
    x = fade(x, 0.02, 1.5)
    # normalizacion de sonoridad
    x = x * 10 ** ((LUFS_LECHO - lufs(x)) / 20)
    return x

# ---------------- mezcla de referencia ----------------
CUES = [  # (archivo, t inicio s, volumen 0..1 relativo a la narracion = 1.0)
    ("whoosh-short", 1.65, 0.35), ("ui-tick", 2.5, 0.30), ("ui-tick", 3.0, 0.30), ("ui-tick", 3.5, 0.30), ("ui-tick", 4.0, 0.30),
    ("whoosh-long", 3.9, 0.30), ("whoosh-short", 5.65, 0.35),
    ("counter-tick", 7.0, 0.25), ("counter-tick", 7.25, 0.27), ("counter-tick", 7.5, 0.29), ("counter-tick", 7.75, 0.31),
    ("counter-tick", 8.0, 0.33), ("counter-tick", 8.25, 0.35), ("counter-tick", 8.5, 0.37),
    ("whoosh-short", 8.55, 0.30),
    ("riser-6s", 6.0, 0.14), ("reverse-swell", 10.0, 0.30), ("hit-impact", 12.0, 0.30),
    ("riser-3s", 12.5, 0.14), ("whoosh-short", 15.15, 0.35), ("hit-soft", 15.5, 0.25),
    ("ui-pop", 16.0, 0.40), ("ui-pop", 16.25, 0.40), ("ui-pop", 16.5, 0.40), ("ui-pop", 16.75, 0.40), ("ui-pop", 17.0, 0.40), ("ui-pop", 17.25, 0.40),
    ("whoosh-short", 17.65, 0.35), ("ui-tick", 18.5, 0.30), ("ui-tick", 18.75, 0.30), ("ui-tick", 19.0, 0.30), ("ui-tick", 19.25, 0.30),
    ("glitch", 19.85, 0.35), ("ui-pop", 20.5, 0.40), ("whoosh-short", 21.15, 0.35),
    ("riser-3s", 21.0, 0.14), ("hit-soft", 24.0, 0.30), ("sparkle-reveal", 24.0, 0.35), ("tail-outro", 24.0, 0.35),
]

def envolvente_voz(v, umbral_db=-50, mant=0.25):
    w = int(0.05 * SR)
    e = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, "same"))
    act = 20 * np.log10(e + 1e-9) > umbral_db
    # mantener ducking durante huecos cortos
    k = int(mant * SR)
    act = np.convolve(act.astype(float), np.ones(k), "same") > 0
    return act

def mezclar(work, tmp, lec, fx, narracion, duck_db=14.0):
    N = int(DURACION * SR)
    v = cargar(narracion)[0]
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    gv = 10 ** ((-16.0 - lufs(np.stack([v, v]))) / 20)
    v = v * gv
    act = envolvente_voz(v)
    s = signal.sosfilt(signal.butter(1, 4.0 / (SR / 2), output="sos"), act.astype(float))   # suavizado ~0.25 s
    duck = 10 ** (-duck_db / 20 * np.clip(s, 0, 1))
    bed = lec * duck
    cap = np.zeros((2, N))
    for nombre, t0, g in CUES:
        y = fx[nombre] * g * FX_REL * gv
        a = int(round(t0 * SR)); b = min(N, a + y.shape[1])
        if a < N:
            cap[:, a:b] += y[:, :b - a]
    mezcla = bed + cap + np.stack([v, v])
    return mezcla, v, bed, cap, act, gv

def gv_norm_ref(gv):
    # los volumenes de CUES son relativos a la narracion original (1.0), no a la normalizada a -16 LUFS
    return 1.0 / gv

# ---------------- principal ----------------
def main():
    global QUICK
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", required=True, help="carpeta de trabajo fuera del repo (originales e intermedios)")
    ap.add_argument("--narracion", default=None, help="narracion.mp3 (solo para la mezcla de referencia; no se sube)")
    ap.add_argument("--duck", type=float, default=14.0)
    a = ap.parse_args()
    work = a.work; os.makedirs(work, exist_ok=True)
    tmp = os.path.join(work, "tmp"); os.makedirs(tmp, exist_ok=True)
    os.environ["TMP"] = tmp; os.environ["TEMP"] = tmp
    os.makedirs(SALIDA, exist_ok=True)
    np.random.seed(SEED)

    descargar_fuentes(work)
    fx = fx_todos(work, tmp)
    for k, v in fx.items():
        guardar_wav(os.path.join(SALIDA, k + ".wav"), v)
        print(f"{k}.wav  {v.shape[1] / SR:.3f} s")
    lec = lecho(work, tmp, fx)
    lec_wav = os.path.join(work, "bed.wav")
    guardar_wav(lec_wav, lec)
    run(["ffmpeg", "-v", "error", "-y", "-i", lec_wav, "-b:a", "320k", "-c:a", "libmp3lame", os.path.join(SALIDA, "bed-120bpm-28s.mp3")])
    print("bed-120bpm-28s.mp3", lec.shape[1] / SR, "s", "LUFS", round(lufs(lec), 2), "pico dBFS", round(20 * np.log10(np.abs(lec).max()), 2))

    if a.narracion and os.path.exists(a.narracion):
        mez, v, bed, cap, act, gv = mezclar(work, tmp, lec, fx, a.narracion, a.duck)
        pico = np.abs(mez).max()
        guardar_wav(os.path.join(work, "mezcla_pre.wav"), mez / max(1.0, pico / 0.95))
        # limitador final (ffmpeg) y MP3
        run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(work, "mezcla_pre.wav"), "-af",
             "alimiter=limit=0.80:attack=5:release=60:level=disabled", "-b:a", "320k", "-c:a", "libmp3lame",
             os.path.join(SALIDA, "mezcla-referencia.mp3")])
        # medidas (propias; la verificacion independiente es con ffmpeg ebur128 en verificar_audio.py)
        act_m = act
        rv = 10 * np.log10((v[act_m] ** 2).mean())
        rb = 10 * np.log10(((bed + cap)[:, act_m] ** 2).mean())
        rb0 = 10 * np.log10((bed[:, act_m] ** 2).mean())
        print(f"ganancia de la narracion a -16 LUFS: {20*np.log10(gv):+.2f} dB")
        print(f"con voz: RMS voz {rv:.1f} dB, RMS lecho+fx {rb:.1f} dB -> diferencia {rv-rb:.1f} dB; solo lecho {rv-rb0:.1f} dB")
        # volumen del lecho por tramo (relativo a su version sin ducking) para Remotion
        s = signal.sosfilt(signal.butter(1, 4.0 / (SR / 2), output="sos"), act.astype(float))
        d = 10 ** (-a.duck / 20 * np.clip(s, 0, 1))
        for t0 in range(0, 28):
            seg = d[int(t0 * SR):int((t0 + 1) * SR)]
            print(f"  duck {t0:2d}-{t0+1:2d} s: {seg.mean():.2f}")

if __name__ == "__main__":
    main()
