import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Spinner, ErrorBanner, EmptyState } from '../ui/Feedback';
import { Icon } from '../ui/Icon';
import { useGaleriaCapasQuery, type CapaGaleriaItem } from '../../hooks/useCapa';

interface GaleriaCapasModalProps {
  // URL da capa atual, para destacar a imagem que já está em uso.
  capaAtualUrl: string | null;
  onEscolher: (item: CapaGaleriaItem) => void;
  onClose: () => void;
}

export function GaleriaCapasModal({ capaAtualUrl, onEscolher, onClose }: GaleriaCapasModalProps) {
  const { t } = useTranslation();
  const query = useGaleriaCapasQuery(true);

  // Nome amigável vem das traduções (admin.capa.itens.<arquivo sem extensão>); se a imagem for
  // nova e ainda não tiver tradução, mostra o próprio nome do arquivo.
  const rotulo = (nome: string) => {
    const chave = nome.replace(/\.[a-z0-9]+$/i, '');
    return t(`admin.capa.itens.${chave}`, { defaultValue: chave.replace(/-/g, ' ') });
  };

  return (
    <Modal title={t('admin.capa.galleryTitle')} onClose={onClose} size="lg">
      {query.isLoading && <Spinner />}
      {query.isError && <ErrorBanner onRetry={() => query.refetch()} />}
      {query.data && query.data.length === 0 && <EmptyState message={t('admin.capa.galleryEmpty')} />}
      {query.data && query.data.length > 0 && (
        <>
          <p className="hint-text galeria-dica">{t('admin.capa.galleryHint')}</p>
          <div className="galeria-grid">
            {query.data.map((item) => {
              const atual = item.url === capaAtualUrl;
              return (
                <button
                  key={item.nome}
                  type="button"
                  className={`galeria-item${atual ? ' galeria-item-atual' : ''}`}
                  aria-pressed={atual}
                  onClick={() => onEscolher(item)}
                >
                  <img src={item.url} alt="" loading="lazy" />
                  <span className="galeria-item-nome">
                    {atual && <Icon name="check" size={13} />}
                    {rotulo(item.nome)}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
