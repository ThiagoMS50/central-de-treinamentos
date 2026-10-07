import { useEffect, useState } from 'react';
import type { CapaGaleriaItem, useCapaMutations } from './useCapa';

type Pendente = { tipo: 'arquivo'; imagem: Blob } | { tipo: 'galeria'; item: CapaGaleriaItem } | null;

// Capa escolhida antes de o curso/trilha existir (arquivo enviado ou imagem da galeria): guarda a
// escolha e uma prévia; ao salvar, aplicar() envia de fato. A prévia de arquivo usa um object URL,
// liberado quando a escolha muda ou a tela fecha.
export function useCapaPendente() {
  const [pendente, setPendente] = useState<Pendente>(null);
  const [previaArquivo, setPreviaArquivo] = useState<string | null>(null);

  useEffect(() => {
    if (pendente?.tipo !== 'arquivo') {
      setPreviaArquivo(null);
      return;
    }
    const url = URL.createObjectURL(pendente.imagem);
    setPreviaArquivo(url);
    return () => URL.revokeObjectURL(url);
  }, [pendente]);

  const previa = pendente?.tipo === 'galeria' ? pendente.item.url : previaArquivo;

  async function aplicar(id: string, capa: ReturnType<typeof useCapaMutations>) {
    if (pendente?.tipo === 'arquivo') await capa.enviar.mutateAsync({ id, arquivo: pendente.imagem });
    if (pendente?.tipo === 'galeria') await capa.escolherGaleria.mutateAsync({ id, nome: pendente.item.nome });
  }

  return {
    temEscolha: pendente !== null,
    previa,
    definirArquivo: (imagem: Blob) => setPendente({ tipo: 'arquivo', imagem }),
    definirGaleria: (item: CapaGaleriaItem) => setPendente({ tipo: 'galeria', item }),
    limpar: () => setPendente(null),
    aplicar,
  };
}
