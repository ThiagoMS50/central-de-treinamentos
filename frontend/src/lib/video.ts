export type VideoEmbed = { kind: 'youtube'; embedUrl: string } | { kind: 'vimeo'; embedUrl: string } | { kind: 'file'; src: string };

// Detecta YouTube/Vimeo pelo link e devolve a URL de embed pra usar num <iframe>; qualquer outro
// link cai no fallback "file" pra usar num <video controls> simples. Nunca renderiza uma URL
// arbitrária dentro de um iframe — só provedores reconhecidos ganham esse tratamento.
export function resolveVideoEmbed(url: string): VideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtubeMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  if (youtubeMatch) {
    return { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { kind: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return { kind: 'file', src: trimmed };
}
