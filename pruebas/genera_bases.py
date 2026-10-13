"""
RIMA BEAT - generador de 3 bases de prueba (sintesis propia, sin copyright)
Estilos: Boom Bap 88, Chill Lo-Fi 80, Trap 140
"""
import numpy as np, os, wave, struct

SR = 44100
OUT = "C:/Users/user/Desktop/Rima-Beat/pruebas"
os.makedirs(OUT, exist_ok=True)

def midi2f(m): return 440.0 * 2 ** ((m - 69) / 12.0)

def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y

def highpass(x, a):
    return x - lowpass(x, a)

def env_ad(n, a, d, curve=4.0):
    t = np.linspace(0, 1, n)
    at = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * t / max(d, 1e-4))
    return at * dec

# ---------- instrumentos ----------
def kick(dur=0.42, f0=150, f1=46, punch=0.9):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = np.random.randn(n) * np.exp(-t * 260) * 0.35
    return (body * punch + click) * 0.9

def snare(dur=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = highpass(np.random.randn(n), 0.55) * np.exp(-t * 22)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 26) * 0.5
    return (noise * 0.8 + tone) * 0.55

def hat(dur=0.05, open_=False):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = highpass(np.random.randn(n), 0.75)
    e = np.exp(-t * (12 if open_ else 70))
    return nz * e * (0.34 if open_ else 0.24)

def clap():
    n = int(0.18 * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (0, 0.008, 0.016):
        s = int(d * SR)
        out[s:] += np.random.randn(n - s) * np.exp(-np.arange(n - s) / SR * 30)
    out = highpass(out, 0.5)
    return out * 0.35

def bass(freq, dur, sat=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    saw = 2 * (t * freq - np.floor(0.5 + t * freq))
    sq = np.sign(np.sin(2 * np.pi * freq * t))
    x = 0.6 * saw + 0.4 * sq
    x = lowpass(x, 0.09)
    e = env_ad(n, 0.005, dur * 0.7, 3.0)
    return x * e * 0.5 * sat

def b808(freq, dur, glide=None):
    n = int(dur * SR); t = np.arange(n) / SR
    f = freq * (1 + (glide - 1) * np.exp(-t * 14)) if glide else freq * np.ones(n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.tanh(np.sin(ph) * 1.6) * np.exp(-t * (2.2 if dur > 0.5 else 6))
    return x * 0.55

def pad(freqs, dur, detune=0.006, bright=0.10):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for k in (-1, 0, 1):
            ff = f * (1 + k * detune)
            saw = 2 * (t * ff - np.floor(0.5 + t * ff))
            x += saw
    x /= (len(freqs) * 3)
    x = lowpass(x, bright)
    e = env_ad(n, 0.06, dur * 0.6, 1.6)
    return x * e * 0.28

def lead(freq, dur, wave_type="tri"):
    n = int(dur * SR); t = np.arange(n) / SR
    if wave_type == "tri":
        x = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * freq * t))
    else:
        x = np.sign(np.sin(2 * np.pi * freq * t))
    e = env_ad(n, 0.01, dur * 0.5, 3.0)
    return x * e * 0.18

# ---------- mezclador ----------
def add(buf, sig, t0):
    s = int(t0 * SR)
    if s >= len(buf): return
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[:e - s]

def make_beat(bpm, bars, style):
    spb = 60.0 / bpm                 # seg/beat
    step = spb / 4                   # semicorchea
    total = int((bars * 4 * spb + 1.5) * SR)
    L = np.zeros(total); R = np.zeros(total)
    swing = 0.06 if style == "boom" else 0.0

    CH = {
      "boom":  [[50,53,57,60],[43,47,50,53],[48,52,55,59],[45,48,52,55]],
      "chill": [[48,52,55,59],[45,48,52,55],[41,45,48,52],[43,47,50,53]],
      "trap":  [[45,48,52],[41,45,48],[48,52,55],[43,47,50]],
    }[style]
    ROOT = {"boom":[38,31,36,33], "chill":[36,33,29,31], "trap":[33,29,36,31]}[style]

    for bar in range(bars):
        t0 = bar * 4 * spb
        ch = CH[bar % 4]; root = ROOT[bar % 4]
        sec = bar // 8
        # --- pad / acorde ---
        add(L, pad([midi2f(x) for x in ch], 4 * spb) * (0.9 if sec else 0.7), t0)
        add(R, pad([midi2f(x) for x in ch], 4 * spb) * 1.05, t0)
        # --- bateria ---
        if style == "boom":
            for s in (0, 7, 10): add(L, kick() * 0.95, t0 + s * step); add(R, kick() * 0.95, t0 + s * step)
            for s in (4, 12): add(L, snare(), t0 + s * step); add(R, snare(), t0 + s * step)
            for i in range(16):
                if i % 2 == 0:
                    sw = swing if i % 4 == 2 else 0
                    add(L, hat(open_=(i % 8 == 6)) * (1.0 if i % 4 == 0 else 0.7), t0 + i * step + sw * step)
                    add(R, hat() * (1.0 if i % 4 == 0 else 0.7), t0 + i * step + sw * step)
        elif style == "chill":
            for s in (0, 8): add(L, kick(0.5, 130, 44) * 0.8, t0 + s * step); add(R, kick(0.5, 130, 44) * 0.8, t0 + s * step)
            for s in (4, 12): add(L, snare() * 0.6, t0 + s * step); add(R, snare() * 0.6, t0 + s * step)
            for i in range(0, 16, 2): add(L, hat(open_=(i == 10)) * 0.7, t0 + i * step); add(R, hat(open_=(i == 10)) * 0.7, t0 + i * step)
        else:  # trap
            for s in (0, 6, 10): add(L, kick(0.35, 140, 42) * 0.9, t0 + s * step); add(R, kick(0.35, 140, 42) * 0.9, t0 + s * step)
            for s in (4, 12): add(L, clap(), t0 + s * step); add(R, clap(), t0 + s * step)
            for i in range(16):
                h = hat(0.04) * (0.9 if i % 4 == 0 else 0.6)
                add(L, h, t0 + i * step); add(R, h, t0 + i * step)
                if i in (13, 14): add(L, hat(0.03) * 0.5, t0 + i * step + step / 2)
        # --- bajo ---
        if style == "trap":
            for s, g in ((0, 1.0), (10, 0.85)):
                add(L, b808(midi2f(root), step * 8, 1.0) * g, t0 + s * step)
                add(R, b808(midi2f(root), step * 8, 1.0) * g, t0 + s * step)
        else:
            for s in ((0, 7, 10) if style == "boom" else (0, 8)):
                add(L, bass(midi2f(root), step * 4) , t0 + s * step)
                add(R, bass(midi2f(root), step * 4), t0 + s * step)
        # --- melodia (a partir del compas 8) ---
        if bar >= 8:
            mel = {"boom": [0, 3, 7, 5, 3, 0, -2, 0], "chill": [0, 4, 7, 4, 2, 0, -1, 0], "trap": [0, 0, 3, 5, 3, 0, -2, 0]}[style]
            for k, off in enumerate(mel):
                if k % 2 == 0:
                    add(L, lead(midi2f(ch[0] + 12 + off), step * 2, "tri") * 0.9, t0 + k * step * 2)
                    add(R, lead(midi2f(ch[0] + 12 + off), step * 2, "tri"), t0 + k * step * 2)
    return L, R

def save(name, L, R):
    m = max(np.max(np.abs(L)), np.max(np.abs(R)), 1e-9)
    L = np.tanh(L / m * 1.25) * 0.92
    R = np.tanh(R / m * 1.25) * 0.92
    data = np.empty(len(L) * 2)
    data[0::2] = L; data[1::2] = R
    pcm = (data * 32767).astype("<i2")
    path = os.path.join(OUT, name)
    with wave.open(path, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("  ->", name, round(len(L) / SR, 1), "s")

print("Generando bases de prueba...")
for name, bpm, bars, style in [
    ("01-boom-bap-88.wav", 88, 16, "boom"),
    ("02-chill-lofi-80.wav", 80, 16, "chill"),
    ("03-trap-140.wav", 140, 24, "trap"),
]:
    L, R = make_beat(bpm, bars, style)
    save(name, L, R)
print("Listo.")
