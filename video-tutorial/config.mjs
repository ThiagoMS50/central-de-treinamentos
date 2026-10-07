// Qual vídeo produzir. Sem variável: o tutorial completo (cenas.mjs).
// ROTEIRO=apresentacao → apresentação do LMS Challenge (cenas-apresentacao.mjs).
// Cada roteiro tem suas próprias pastas de áudio e de saída.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const ROTEIRO = process.env.ROTEIRO ?? 'tutorial';
const modulo = await import(ROTEIRO === 'tutorial' ? './cenas.mjs' : `./cenas-${ROTEIRO}.mjs`);

export const CENAS = modulo.CENAS;
export const CAPITULOS = modulo.CAPITULOS;
export const META = {
  titulo: 'Vídeo tutorial — Central de Treinamentos',
  descricao: 'Roteiro de direção do tutorial oficial da plataforma: um tour guiado, no estilo de introdução de videogame, para quem nunca usou o sistema. Primeiro o **Administrador**, depois o **Aluno**, em um único vídeo.',
  arquivoCenas: 'cenas.mjs',
  arquivoFinal: 'tutorial-central-de-treinamentos.mp4',
  arquivoRoteiro: 'roteiro.md',
  ...(modulo.META ?? {}),
};
export const DIR_AUDIO = path.join(AQUI, ROTEIRO === 'tutorial' ? 'audio' : `audio-${ROTEIRO}`);
export const DIR_SAIDA = path.join(AQUI, ROTEIRO === 'tutorial' ? 'saida' : `saida-${ROTEIRO}`);
