import { useEffect, useState } from 'react';

// Imagem de capa escolhida antes de o curso/trilha existir: guarda o arquivo e uma prévia local
// (object URL), que é liberada quando a imagem muda ou a tela fecha.
export function useCapaPendente() {
  const [imagem, setImagem] = useState<Blob | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);

  useEffect(() => {
    if (!imagem) {
      setPrevia(null);
      return;
    }
    const url = URL.createObjectURL(imagem);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [imagem]);

  return { imagem, previa, definir: setImagem, limpar: () => setImagem(null) };
}
