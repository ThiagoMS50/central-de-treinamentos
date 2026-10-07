// MODO DEMONSTRAÇÃO: imagens da galeria de capas e o vídeo de aula usados no vídeo tutorial.
// Importados pelo Vite só no build/execução do demo (não entram no app de produção).
const arquivos = import.meta.glob('./capas/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const capasDemo: Record<string, string> = Object.fromEntries(
  Object.entries(arquivos).map(([caminho, url]) => [caminho.replace('./capas/', '').replace('.webp', ''), url]),
);

export { default as videoAulaDemo } from './aula.mp4?url';
