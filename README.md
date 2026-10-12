# RIMA BEAT 🎤

Entrenador de **freestyle en español** que corre en el navegador (sin instalar nada).

Suena una base, una **pelota marca cada tiempo** y en el **4º tiempo de cada compás**
cae una **palabra** — tú dices en voz alta algo que rime justo ahí.

## Cómo usarlo
1. Abre `index.html` (doble clic o arrástralo al navegador).
2. Elige **base**, **tema de palabras**, **esquema de rima** y **duración**.
3. Dale a **¡A RIMAR!** y a improvisar.

## Qué hay (Fase 1)
- **18 bases reales libres** (ccMixter, licencia CC-BY) con su BPM: de 80 a 165 BPM,
  estilos variados (boom bap, chill, funk, rap, trip-hop…).
- **Sube tu propia base** (MP3/WAV…) y mide el tempo con **TAP** (marcar ritmo).
- **7 temas de palabras** con rimas en español: amor, calle, fiesta, vida, mente, fuego, hampa.
  Sin nombres propios y sin palabras infantiles; vocabulario adulto.
- **Esquemas de rima**: AABB (pareados), ABAB (alterna), AAAA (monorrima).
- **Rejilla + pelota** sincronizada con la música. Duración 8/16/32 compases.
- **Ajuste fino** (◀ ▶) por si una base empieza el beat un pelín antes o después.

## Ficheros
- `index.html` — la web.
- `app.js` — motor (audio, ritmo, rejilla).
- `bases.js` — índice de la biblioteca de bases.
- `datos.js` — las rimas en español.
- `bases/` — los MP3 y `bases/manifest.json` (nombre, artista, BPM y licencia de cada base).
- `data/palabras-es.json` — fuente de las rimas (por si hay que regenerarlas).

## Licencias y créditos (¡importante!)
Las bases son de **ccMixter** y llevan licencia **Creative Commons Attribution (CC-BY)**:
**se pueden usar gratis, también en público, pero hay que citar al autor.**
El crédito de la base elegida aparece en la propia web, y la lista completa está en
`bases/manifest.json`. Si algún día se publica el juego, hay que mantener esos créditos.

Datos de rimas:
- Pronunciación: `open-dict-data/ipa-dict` (es_ES) — CC BY-SA.
- Frecuencia de palabras: `hermitdave/FrequencyWords` (es).

## Pendiente (Fase 2)
- Puntuación por **micrófono** (detectar si caes en el beat), todo en el dispositivo.
- Más niveles de ayuda (todas las palabras / solo la primera / ninguna).
- Más bases y quizá enlaces de YouTube/SoundCloud.
- Publicarla en GitHub Pages (ojo: pesa ~106 MB por los MP3).
