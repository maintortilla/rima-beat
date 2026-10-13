'use strict';
/* ============================================================
   RIMA BEAT - Entrenador de freestyle en espanol  (Fase 1.2)
   Base ALEATORIA + rejilla simple; la pelota arranca en el "drop"
   ============================================================ */

const DATOS = window.PALABRAS || { temas: {} };
const LIB = window.BASES_LIB || [];
const $ = (s) => document.querySelector(s);

const S = {
  base: null, modo: 'lib', fijada: false,
  bpm: 90, spb: 60 / 90, inicio: 0,
  tema: 'TODO', esquema: 'AABB', compases: 8, guias: true,
  bars: [], n: 8, playing: false, countIn: 4,
  raf: null, lastBar: -1, tapTimes: [],
};
const INTRO = 2;   // compases de intro sin palabra (solo base)

let ctx = null, audioEl = null;

/* ---------------- audio (solo cuenta atras) ---------------- */
function initAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
}
function tick(t, accent) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square'; o.frequency.value = accent ? 1250 : 850;
  g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.06);
}

/* ---------------- base aleatoria ---------------- */
function baseAleatoria() {
  if (!LIB.length) return null;
  let i = Math.floor(Math.random() * LIB.length);
  if (LIB.length > 1 && S.base && LIB[i].archivo === S.base.archivo) i = (i + 1) % LIB.length;
  return LIB[i];
}
function setBase(b, fijada) {
  S.base = b; S.modo = 'lib'; S.fijada = !!fijada;
  S.bpm = b.bpm; S.spb = 60 / b.bpm; S.inicio = b.inicio || 0;
  S.beats = (b.beats && b.beats.length > 1) ? b.beats : null; S.bi = 0;
  $('#baseNombre').textContent = b.nombre;
  $('#baseMeta').textContent = `${b.bpm} BPM · ${b.artista}`;
  $('#baseSel').value = b.archivo;
  $('#baseTag2').textContent = S.fijada ? '📌 elegida' : '🎲 aleatoria';
  $('#credito').innerHTML = `${b.licencia} · <a href="${b.url}" target="_blank" rel="noopener">ccMixter</a>`;
}

/* ---------------- generar compases con rimas ---------------- */
function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
function gruposDe(temaKey) {
  if (temaKey === 'TODO') return Object.values(DATOS.temas).flat();
  return DATOS.temas[temaKey] || [];
}
function generarCompases(temaKey, esquema, n) {
  const grupos = gruposDe(temaKey);
  const bars = [];
  if (!grupos.length) return bars;
  const mapa = esquema === 'AABB' ? [0, 0, 1, 1]
             : esquema === 'ABAB' ? [0, 1, 0, 1]
             : [0, 0, 0, 0];
  for (let g = 0; g < n; g += 4) {
    const fA = rand(grupos);
    let fB = rand(grupos);
    if (grupos.length > 1) { let k = 0; while (fB.palabra === fA.palabra && k++ < 8) fB = rand(grupos); }
    const fam = [fA, fB];
    for (let i = 0; i < 4 && g + i < n; i++) {
      const f = fam[mapa[i]];
      const ws = [f.palabra, ...f.rimas];
      bars.push({ palabra: rand(ws), rimas: ws, color: mapa[i] === 0 ? 'A' : 'B' });
    }
  }
  // compases de intro: solo suena la base, sin palabras
  const intro = [];
  for (let i = 0; i < INTRO; i++) intro.push({ palabra: '', rimas: [], color: 'A', intro: true });
  return intro.concat(bars);
}

/* ---------------- pantallas ---------------- */
function mostrar(id) {
  ['setup', 'game', 'review'].forEach((p) => { $('#' + p).hidden = (p !== id); });
}

/* ---------------- UI ---------------- */
function pintarBaseSel() {
  const sel = $('#baseSel'); sel.innerHTML = '';
  LIB.forEach((b) => {
    const o = document.createElement('option');
    o.value = b.archivo; o.textContent = `${b.nombre} · ${b.bpm} BPM`;
    sel.appendChild(o);
  });
  sel.onchange = () => { const b = LIB.find((x) => x.archivo === sel.value); if (b) setBase(b, true); };
}
const EMOJI = {
  'TODO': '🎲', 'Amor y desamor': '💔', 'Dinero y éxito': '💰', 'Calle y hustle': '🔥',
  'Fiesta y lifestyle': '🎉', 'Sueños y ambición': '🚀', 'Dolor y mente': '🧠',
  'Comida y día a día': '🍔', 'Poder y fama': '👑',
};
function pintarTemas() {
  const cont = $('#temas'); cont.innerHTML = '';
  const opciones = ['TODO', ...Object.keys(DATOS.temas)];
  opciones.forEach((k) => {
    const b = document.createElement('button');
    b.className = 'chip' + (k === S.tema ? ' sel' : '');
    b.textContent = (EMOJI[k] || '') + ' ' + (k === 'TODO' ? 'Todo' : k);
    b.onclick = () => { S.tema = k; pintarTemas(); };
    cont.appendChild(b);
  });
}
function pintarOpciones() {
  const esq = $('#esquemas'); esq.innerHTML = '';
  ['AABB', 'ABAB', 'AAAA'].forEach((e) => {
    const b = document.createElement('button');
    b.className = 'chip' + (e === S.esquema ? ' sel' : ''); b.textContent = e;
    b.onclick = () => { S.esquema = e; pintarOpciones(); };
    esq.appendChild(b);
  });
  const dur = $('#duraciones'); dur.innerHTML = '';
  [8, 16, 32].forEach((n) => {
    const b = document.createElement('button');
    b.className = 'chip' + (n === S.compases ? ' sel' : ''); b.textContent = n;
    b.onclick = () => { S.compases = n; pintarOpciones(); };
    dur.appendChild(b);
  });
  const gui = $('#guias'); gui.innerHTML = '';
  [{ v: true, t: '👁 Sí' }, { v: false, t: '🙈 No' }].forEach((o) => {
    const b = document.createElement('button');
    b.className = 'chip' + (S.guias === o.v ? ' sel' : ''); b.textContent = o.t;
    b.onclick = () => { S.guias = o.v; pintarOpciones(); };
    gui.appendChild(b);
  });
}

/* ---------------- tap tempo (base propia) ---------------- */
function tap() {
  const now = performance.now();
  S.tapTimes = S.tapTimes.filter((t) => now - t < 2500);
  S.tapTimes.push(now);
  if (S.tapTimes.length >= 2) {
    let sum = 0;
    for (let i = 1; i < S.tapTimes.length; i++) sum += S.tapTimes[i] - S.tapTimes[i - 1];
    const bpm = Math.round(60000 / (sum / (S.tapTimes.length - 1)));
    if (bpm > 50 && bpm < 220) { S.bpm = bpm; S.spb = 60 / bpm; }
    $('#tapInfo').textContent = S.bpm + ' BPM';
  } else { $('#tapInfo').textContent = 'sigue marcando...'; }
}

/* ---------------- rejilla + pelota ---------------- */
function pintarGrid() {
  const grid = $('#grid'); grid.innerHTML = '';
  const fin = Math.min(S.n, S.lastBar + 4);
  for (let b = S.lastBar; b < fin; b++) {
    const row = document.createElement('div');
    row.className = 'row' + (b === S.lastBar ? ' active' : '');
    const track = document.createElement('div'); track.className = 'track';
    const bar = S.bars[b];
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement('div');
      const esPalabra = c === 3 && !bar.intro;
      cell.className = 'cell' + (esPalabra ? ' word col-' + bar.color : (c === 3 ? ' word vacia' : ''));
      cell.textContent = esPalabra ? bar.palabra : '';
      track.appendChild(cell);
    }
    if (b === S.lastBar) {
      const sh = document.createElement('div'); sh.className = 'ball-shadow'; sh.id = 'ballShadow';
      track.appendChild(sh);
      const ball = document.createElement('div'); ball.className = 'ball'; ball.id = 'ball';
      track.appendChild(ball);
    }
    row.appendChild(track); grid.appendChild(row);
  }
  actualizarPista();
}
function actualizarPista() {
  const cur = S.bars[S.lastBar];
  const pista = $('#pista');
  if (!S.guias) { pista.hidden = true; return; }
  pista.hidden = false;
  if (!cur || cur.intro || !cur.rimas.length) {
    $('#pistaLabel').textContent = 'Intro';
    $('#pistaWords').textContent = 'escucha la base… 🎧';
  } else {
    $('#pistaLabel').textContent = 'Rima con';
    $('#pistaWords').textContent = cur.rimas.slice(0, 9).join(' · ');
  }
}

function tSec() { return audioEl ? audioEl.currentTime - S.inicio : 0; }

/* posicion en "tiempos" usando los beats reales de la base (si los hay) */
function beatPos(tAbs) {
  const bs = S.beats;
  if (!bs || bs.length < 2) return tAbs - S.inicio > 0 ? (tAbs - S.inicio) / S.spb : 0;
  let i = S.bi || 0;
  if (i > bs.length - 2) i = bs.length - 2;
  while (i < bs.length - 1 && bs[i + 1] <= tAbs) i++;
  while (i > 0 && bs[i] > tAbs) i--;
  S.bi = i;
  const span = Math.max(1e-4, bs[i + 1] - bs[i]);
  let f = (tAbs - bs[i]) / span;
  if (f < 0) f = 0; else if (f > 1) f = 1;
  return i + f;
}

function loop() {
  if (!S.playing) return;
  const tAbs = audioEl ? audioEl.currentTime : 0;
  const beat = beatPos(tAbs);
  if (beat < 0) { S.raf = requestAnimationFrame(loop); return; }
  const barIndex = Math.floor(beat / 4);
  if (barIndex >= S.n) { terminar(); return; }
  if (barIndex !== S.lastBar) { S.lastBar = barIndex; pintarGrid(); }
  const beatInBar = beat - barIndex * 4;
  const cell = Math.min(3, Math.floor(beatInBar));
  const frac = beatInBar - cell;
  const ball = $('#ball');
  if (ball) {
    const x = ((cell + frac) / 4) * 100;
    // ---- bote: sube y baja en cada tiempo; aterriza justo en el beat ----
    const arco = 42;                                   // altura maxima del bote (px)
    const alt = Math.sin(Math.PI * frac);              // 0 en el suelo, 1 en el aire
    const subida = arco * alt;
    const estira = 1 + 0.28 * alt;                     // se estira al subir
    const encoge = 1 - 0.22 * alt;                     // se afina al subir
    ball.style.left = x + '%';
    ball.style.transform =
      `translateX(-50%) translateY(${(-subida).toFixed(1)}px) scale(${encoge.toFixed(3)}, ${estira.toFixed(3)})`;
    const sh = $('#ballShadow');
    if (sh) {
      const k = 1 - 0.6 * alt;                         // la sombra encoge al subir
      sh.style.left = x + '%';
      sh.style.transform = `translateX(-50%) scale(${k.toFixed(3)}, ${(0.5 + 0.5 * k).toFixed(3)})`;
      sh.style.opacity = (0.6 - 0.45 * alt).toFixed(2);
    }
  }
  const row = document.querySelector('.row.active .track');
  if (row) [...row.children].forEach((el, i) => el.classList.toggle('on', i === cell && el.classList.contains('cell')));
  $('#progreso').textContent = barIndex < INTRO
    ? 'Intro · escucha la base'
    : `Compas ${barIndex - INTRO + 1} / ${S.compases}`;
  S.raf = requestAnimationFrame(loop);
}

/* ---------------- arranque / parada ---------------- */
function empezar() {
  if (S.modo === 'lib' && !S.fijada) { setBase(baseAleatoria()); }
  if (S.modo === 'file' && !audioEl) { alert('Sube una base o elige una.'); return; }

  S.bars = generarCompases(S.tema, S.esquema, S.compases);
  S.n = S.compases + INTRO; S.spb = 60 / S.bpm; S.lastBar = 0; S.playing = true;
  mostrar('game'); pintarGrid();
  $('#baseTag').textContent = (S.modo === 'lib' ? S.base.nombre + ' · ' : '') + S.bpm + ' BPM';

  if (S.modo === 'lib') {
    audioEl = new Audio('bases/' + S.base.archivo);
    try { audioEl.currentTime = S.inicio; } catch (e) {}
  }
  audioEl.onended = () => { if (S.playing) terminar(); };

  initAudio();
  const now = ctx.currentTime;
  for (let i = 0; i < S.countIn; i++) tick(now + 0.15 + i * S.spb, i === 0);
  const espera = (0.15 + S.countIn * S.spb) * 1000;
  $('#progreso').textContent = 'Preparate...';
  setTimeout(() => {
    if (!S.playing) return;
    try { audioEl.currentTime = S.inicio; } catch (e) {}
    audioEl.play().catch(() => {});
    cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(loop);
  }, espera);
}
function parar() { S.playing = false; cancelAnimationFrame(S.raf); if (audioEl) audioEl.pause(); }
function terminar() {
  parar();
  $('#rCompases').textContent = S.compases;
  $('#rPalabras').textContent = new Set(S.bars.filter((b) => b.palabra).map((b) => b.palabra)).size;
  $('#rTema').textContent = S.tema === 'TODO' ? 'Todo' : S.tema;
  mostrar('review');
}

/* ---------------- init ---------------- */
function init() {
  if (LIB.length) setBase(baseAleatoria());
  pintarBaseSel(); pintarTemas(); pintarOpciones();

  $('#otraBase').onclick = () => setBase(baseAleatoria(), false);
  $('#start').onclick = empezar;
  $('#stop').onclick = () => { parar(); mostrar('setup'); };
  $('#otra').onclick = () => empezar();
  $('#cambiar').onclick = () => { parar(); mostrar('setup'); };
  $('#tapBtn').onclick = tap;

  $('#fileBase').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    audioEl = new Audio(URL.createObjectURL(f));
    S.modo = 'file'; S.inicio = 0; S.base = null;
    $('#fileInfo').textContent = f.name;
    $('#baseNombre').textContent = f.name;
    $('#baseMeta').textContent = 'tu base · marca el ritmo con TAP';
    $('#baseTag2').textContent = '📌 tu base';
    $('#credito').textContent = '';
  };
}
document.addEventListener('DOMContentLoaded', init);
