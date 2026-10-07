// Preparo da imagem de capa no navegador, antes do upload.
export const TIPOS_CAPA = ['image/jpeg', 'image/png', 'image/webp'];
export const TAMANHO_MAX_CAPA = 5 * 1024 * 1024;
const LADO_MAX = 1600;

export class ImagemInvalidaError extends Error {
  motivo: 'tipo' | 'tamanho';

  constructor(motivo: 'tipo' | 'tamanho') {
    super(motivo);
    this.motivo = motivo;
  }
}

// Reduz fotos grandes (máx. 1600 px no maior lado) e converte para WebP: o upload fica mais
// rápido e o painel mais leve. Se o navegador não conseguir converter, envia o arquivo original.
export async function prepararCapa(arquivo: File): Promise<Blob> {
  if (!TIPOS_CAPA.includes(arquivo.type)) throw new ImagemInvalidaError('tipo');

  let resultado: Blob = arquivo;
  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const convertido = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (convertido && convertido.type === 'image/webp' && convertido.size < arquivo.size) resultado = convertido;
  } catch {
    // mantém o original
  }

  if (resultado.size > TAMANHO_MAX_CAPA) throw new ImagemInvalidaError('tamanho');
  return resultado;
}
