# RIMA BEAT 🎤

Entrenador de **freestyle en español** que corre en el navegador (sin instalar nada).

Suena una base, una **pelota marca cada tiempo** y en el **4º tiempo de cada compás**
cae una **palabra** — tú dices en voz alta algo que rime justo ahí.

🌐 **Online:** https://maintortilla.github.io/rima-beat/

## Cómo se usa (simple)
1. Abre la web (o `index.html`).
2. Te sale una **base aleatoria** ya elegida. Si no te gusta, dale a **🎲 Otra base**
   (o elige una concreta en la lista).
3. Elige **tema de palabras**, **esquema** y **duración** (o déjalo como está).
4. **▶ A RIMAR** → cuenta atrás de 4 tiempos → a improvisar.

## Detalles que importan
- **La base es aleatoria** en cada partida: cada vez que le das a **▶ A RIMAR** te sale
  una distinta (y "Otra vez" también). Si eliges una de la lista, se queda fija (📌).
- **2 compases de intro**: al empezar suenan 2 compases de base **sin palabras** para
  escucharla y coger el ritmo antes de entrar.
- **Pelota que bota**: la pelota salta en cada tiempo y aterriza justo en el beat.
- **Guías de rima opcionales**: puedes mostrar las palabras que riman (Sí) o ir a pelo (No).
- **Sincronía real con la música**: en vez de un BPM fijo, cada base lleva **los tiempos
  exactos de sus beats** analizados del audio (con `librosa`), así que la pelota cae en el
  beat de verdad, sin desviarse. El juego arranca en el primer beat tras el "drop" (donde
  entran los tambores) y `bases/manifest.json` guarda el BPM medido y la lista de beats.
- **Sin ajustes raros**: nada de sumar/restar milisegundos.

## Qué hay (Fase 1)
- **18 bases reales libres** (ccMixter, CC-BY), de 80 a 165 BPM.
- **8 temas de rimas** en español + **🎲 Todo**: Amor y desamor, Dinero y éxito, Calle y hustle,
  Fiesta y lifestyle, Sueños y ambición, Dolor y mente, Comida y día a día, Poder y fama.
  Sin nombres propios ni palabras infantiles; vocabulario adulto.
- **Esquemas**: AABB (pareados), ABAB (alterna), AAAA (monorrima).
- **Duración**: 8 / 16 / 32 compases o **🎵 Canción** (dura toda la canción).
- **Subir tu propia base** + **TAP** para medir el ritmo (opcional, en "Subir mi propia base").

## Ficheros
- `index.html` — la web. · `app.js` — motor. · `bases.js` — índice de bases.
- `datos.js` — rimas. · `bases/` — los MP3 y `bases/manifest.json` (con BPM, licencia y `inicio`).
- `data/palabras-es.json` — fuente de las rimas.

## Licencias (¡importante!)
Las bases son de **ccMixter** con licencia **Creative Commons Attribution (CC-BY)**: gratis,
también en público, pero **hay que citar al autor**. El crédito de la base aparece en la web
y la lista completa está en `bases/manifest.json`.

Datos de rimas: `open-dict-data/ipa-dict` (es_ES, CC BY-SA) y `hermitdave/FrequencyWords` (es).

## Pendiente (Fase 2)
- Puntuación por **micrófono** (detectar si caes en el beat), en el dispositivo.
- Niveles de ayuda (todas las palabras / solo la primera / ninguna).
- Más bases.
