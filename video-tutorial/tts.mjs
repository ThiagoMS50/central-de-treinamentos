// Gera a narração de cada cena (voz neural pt-BR) em audio/<id>.mp3 e a duração em audio/duracoes.json.
// Só regenera o que mudou (compara o texto). Uso: node tts.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { CENAS } from './cenas.mjs';

const require = createRequire(import.meta.url);
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

export const VOZ = process.env.VOZ ?? 'pt-BR-ThalitaMultilingualNeural';
const DIR = new URL('./audio/', import.meta.url);
fs.mkdirSync(DIR, { recursive: true });
const arqDuracoes = new URL('duracoes.json', DIR);
const duracoes = fs.existsSync(arqDuracoes) ? JSON.parse(fs.readFileSync(arqDuracoes, 'utf8')) : {};

async function sintetizar(texto, destino) {
  for (let tentativa = 1; tentativa <= 4; tentativa++) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(VOZ, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(texto, { rate: '-3%' });
      const partes = [];
      await new Promise((ok, falha) => {
        audioStream.on('data', (d) => partes.push(d));
        audioStream.on('close', ok);
        audioStream.on('error', falha);
      });
      const buf = Buffer.concat(partes);
      if (buf.length < 2000) throw new Error('áudio vazio');
      fs.writeFileSync(destino, buf);
      return;
    } catch (e) {
      if (tentativa === 4) throw e;
      await new Promise((r) => setTimeout(r, 1500 * tentativa));
    }
  }
}

for (const cena of CENAS) {
  const fala = (cena.fala ?? cena.texto).replace(/[“”"]/g, '');
  const destino = new URL(`${cena.id}.mp3`, DIR);
  const chave = `${VOZ}|${fala}`;
  if (duracoes[cena.id]?.chave === chave && fs.existsSync(destino)) continue;
  await sintetizar(fala, destino);
  const seg = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', destino.pathname.slice(1)]).toString().trim());
  duracoes[cena.id] = { chave, segundos: seg };
  fs.writeFileSync(arqDuracoes, JSON.stringify(duracoes, null, 2));
  console.log(cena.id.padEnd(18), seg.toFixed(1) + 's');
}
const total = CENAS.reduce((s, c) => s + (duracoes[c.id]?.segundos ?? 0), 0);
console.log(`total de narração: ${Math.floor(total / 60)} min ${Math.round(total % 60)} s`);
