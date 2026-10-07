// Monta o vídeo final: mistura narração + efeitos sonoros + trilha sonora (com a música abaixando
// automaticamente quando a narradora fala) e junta com o vídeo gravado.
// Uso: node montar.mjs   →  saida/tutorial-central-de-treinamentos.mp4
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DIR_AUDIO, DIR_SAIDA, META } from './config.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SAIDA = DIR_SAIDA;
const TAXA = 48000;
const tl = JSON.parse(fs.readFileSync(path.join(SAIDA, 'linha-do-tempo.json'), 'utf8'));
const total = Math.ceil((tl.duracaoMs / 1000) * TAXA);
const amostra = (ms) => Math.round((ms / 1000) * TAXA);

// ---------------------------------------------------------------- Narração
const voz = new Float32Array(total);
for (const n of tl.narracoes) {
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(DIR_AUDIO, `${n.id}.mp3`), '-f', 'f32le', '-ac', '1', '-ar', String(TAXA), '-'], { maxBuffer: 1 << 30 });
  const dados = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);
  const ini = amostra(n.ms);
  for (let i = 0; i < dados.length && ini + i < total; i++) voz[ini + i] += dados[i] * 1.05;
}

// ---------------------------------------------------------------- Efeitos sonoros (sintetizados)
const efeitos = {
  clique: (t) => (Math.exp(-t * 140) * Math.sin(2 * Math.PI * 2100 * t) * 0.32 + Math.exp(-t * 400) * (Math.random() * 2 - 1) * 0.12),
  tecla: (t) => Math.exp(-t * 320) * (Math.sin(2 * Math.PI * 1300 * t) * 0.09 + (Math.random() * 2 - 1) * 0.05),
  whoosh: (() => {
    let filtrado = 0;
    return (t) => {
      const env = Math.sin(Math.PI * Math.min(1, t / 0.9)) ** 2;
      const corte = 0.04 + 0.25 * (t / 0.9);
      filtrado += corte * ((Math.random() * 2 - 1) - filtrado);
      return filtrado * env * 0.55;
    };
  })(),
  sucesso: (t) => {
    const nota = (f, ini) => (t >= ini ? Math.exp(-(t - ini) * 5) * Math.sin(2 * Math.PI * f * (t - ini)) : 0);
    return (nota(784, 0) + nota(988, 0.09) + nota(1319, 0.18)) * 0.16;
  },
  erro: (t) => Math.exp(-t * 7) * (Math.sin(2 * Math.PI * 220 * t) + 0.5 * Math.sin(2 * Math.PI * 233 * t)) * 0.12,
  vitoria: (t) => {
    const nota = (f, ini, dur = 1.2) => (t >= ini ? Math.exp(-(t - ini) * (3 / dur)) * (Math.sin(2 * Math.PI * f * (t - ini)) + 0.3 * Math.sin(4 * Math.PI * f * (t - ini))) : 0);
    return (nota(523, 0) + nota(659, 0.12) + nota(784, 0.24) + nota(1047, 0.36, 2)) * 0.12;
  },
};
const duracaoEfeito = { clique: 0.08, tecla: 0.03, whoosh: 0.95, sucesso: 0.9, erro: 0.6, vitoria: 2.4 };
const sfx = new Float32Array(total);
for (const s of tl.sons) {
  const gerar = efeitos[s.tipo];
  if (!gerar) continue;
  const ini = amostra(s.ms);
  const n = Math.round(duracaoEfeito[s.tipo] * TAXA);
  for (let i = 0; i < n && ini + i < total; i++) sfx[ini + i] += gerar(i / TAXA);
}

// ---------------------------------------------------------------- Trilha sonora (pad ambiente + arpejo)
// Progressão Cmaj7 – Am7 – Fmaj7 – G6, 4 s cada, em loop, com eco suave (estéreo).
const acordes = [
  [130.81, 261.63, 329.63, 392.0, 493.88],
  [110.0, 220.0, 261.63, 329.63, 392.0],
  [87.31, 174.61, 220.0, 261.63, 329.63],
  [98.0, 196.0, 246.94, 293.66, 329.63],
];
const DUR_ACORDE = 4;
const esq = new Float32Array(total);
const dir = new Float32Array(total);
for (let i = 0; i < total; i++) {
  const t = i / TAXA;
  const idx = Math.floor(t / DUR_ACORDE) % acordes.length;
  const tc = t % DUR_ACORDE;
  const env = Math.min(1, tc / 1.2) * Math.min(1, (DUR_ACORDE - tc) / 0.9);
  let l = 0;
  let r = 0;
  acordes[idx].forEach((f, k) => {
    const peso = k === 0 ? 0.5 : 0.22;
    l += Math.sin(2 * Math.PI * f * 0.998 * t + k) * peso;
    r += Math.sin(2 * Math.PI * f * 1.002 * t + k * 1.3) * peso;
  });
  // arpejo "pluck" em colcheias (90 bpm), uma oitava acima
  const passo = 60 / 90 / 2;
  const nArp = Math.floor(tc / passo);
  const tArp = tc - nArp * passo;
  const notasArp = acordes[idx].slice(1);
  const fArp = notasArp[nArp % notasArp.length] * 2;
  const arp = Math.exp(-tArp * 9) * Math.sin(2 * Math.PI * fArp * tArp) * 0.18;
  const pulso = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.1 * t);
  esq[i] = (l * env * 0.5 + arp * (nArp % 2 ? 0.6 : 1)) * pulso;
  dir[i] = (r * env * 0.5 + arp * (nArp % 2 ? 1 : 0.6)) * pulso;
}
// eco estéreo (pingue-pongue)
const atraso = Math.round(0.33 * TAXA);
for (let i = atraso; i < total; i++) {
  esq[i] += dir[i - atraso] * 0.28;
  dir[i] += esq[i - atraso] * 0.28;
}

// ---------------------------------------------------------------- Ducking + fades + mixagem
// Duas passadas sem arrays extras (economiza memória): 1) acha o pico, 2) grava o PCM.
const ataque = Math.exp(-1 / (0.03 * TAXA));
const soltura = Math.exp(-1 / (0.45 * TAXA));
const fadeIn = 3 * TAXA;
const fadeOut = 4 * TAXA;
function percorrer(visitar) {
  let e = 0;
  for (let i = 0; i < total; i++) {
    const v = Math.abs(voz[i]);
    e = v > e ? ataque * e + (1 - ataque) * v : soltura * e + (1 - soltura) * v;
    const duck = 1 - 0.68 * Math.min(1, e / 0.05);
    let musica = 0.2 * duck;
    if (i < fadeIn) musica *= i / fadeIn;
    if (i > total - fadeOut) musica *= Math.max(0, (total - i) / fadeOut);
    visitar(i, voz[i] + sfx[i] + esq[i] * musica, voz[i] + sfx[i] + dir[i] * musica);
  }
}
let pico = 0;
percorrer((_i, l, r) => { pico = Math.max(pico, Math.abs(l), Math.abs(r)); });
const ganho = pico > 0.97 ? 0.97 / pico : 1;
const saida = Buffer.alloc(total * 4); // 16 bits estéreo
const q = (x) => Math.max(-32768, Math.min(32767, Math.round(x * ganho * 32767)));
percorrer((i, l, r) => { saida.writeInt16LE(q(l), i * 4); saida.writeInt16LE(q(r), i * 4 + 2); });

function wav(dados, canais) {
  const cab = Buffer.alloc(44);
  cab.write('RIFF', 0); cab.writeUInt32LE(36 + dados.length, 4); cab.write('WAVE', 8);
  cab.write('fmt ', 12); cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20); cab.writeUInt16LE(canais, 22);
  cab.writeUInt32LE(TAXA, 24); cab.writeUInt32LE(TAXA * canais * 2, 28); cab.writeUInt16LE(canais * 2, 32); cab.writeUInt16LE(16, 34);
  cab.write('data', 36); cab.writeUInt32LE(dados.length, 40);
  return Buffer.concat([cab, dados]);
}
const arqAudio = path.join(SAIDA, 'audio.wav');
fs.writeFileSync(arqAudio, wav(saida, 2));
console.log(`áudio mixado (${(total / TAXA / 60).toFixed(1)} min, ganho ${ganho.toFixed(2)})`);

// ---------------------------------------------------------------- Vídeo final
const final = path.join(SAIDA, META.arquivoFinal);
execFileSync('ffmpeg', [
  '-y', '-v', 'error', '-i', path.join(SAIDA, 'video.mp4'), '-i', arqAudio,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000',
  '-movflags', '+faststart', '-shortest', final,
]);
console.log('vídeo final:', final);
