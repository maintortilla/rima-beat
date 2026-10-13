"""Genera 3 bases con MusicGen (IA) - suenan mucho mas reales."""
import os, sys, torch, scipy.io.wavfile as wav
from transformers import AutoProcessor, MusicgenForConditionalGeneration

OUT = "C:/Users/user/Desktop/Rima-Beat/pruebas"
os.makedirs(OUT, exist_ok=True)
dev = "cuda" if torch.cuda.is_available() else "cpu"
print("dispositivo:", dev, "|", torch.cuda.get_device_name(0) if dev == "cuda" else "")

MODEL = os.environ.get("MG_MODEL", "facebook/musicgen-small")
print("cargando modelo:", MODEL)
proc = AutoProcessor.from_pretrained(MODEL)
model = MusicgenForConditionalGeneration.from_pretrained(MODEL).to(dev)
model.eval()

PISTAS = [
    ("01-boom-bap-88", "classic boom bap hip hop instrumental, 88 bpm, dusty sampled drums, "
     "punchy kick and snare, jazzy piano loop, warm upright bass, vinyl crackle, 90s east coast rap beat, instrumental only"),
    ("02-chill-lofi-80", "chill lofi hip hop instrumental, 80 bpm, mellow rhodes electric piano chords, "
     "soft lazy drums, deep sub bass, vinyl noise, relaxing study beat, instrumental only"),
    ("03-trap-140", "dark trap beat instrumental, 140 bpm, booming 808 bass, crisp fast hi-hats, "
     "hard snappy snares, eerie melodic bell synth, menacing atmosphere, instrumental only"),
]

DUR = int(os.environ.get("MG_SECONDS", "30"))
for name, prompt in PISTAS:
    print("generando:", name, "...")
    inputs = proc(text=[prompt], padding=True, return_tensors="pt").to(dev)
    with torch.no_grad():
        audio = model.generate(**inputs, do_sample=True, guidance_scale=3.0,
                               max_new_tokens=int(DUR * 50))   # ~50 tokens/s
    sr = model.config.audio_encoder.sampling_rate
    a = audio[0, 0].cpu().numpy()
    path = os.path.join(OUT, name + ".wav")
    wav.write(path, rate=sr, data=a)
    print("   ->", name + ".wav", round(len(a) / sr, 1), "s")
print("HECHO")
