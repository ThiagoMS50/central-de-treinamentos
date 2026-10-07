import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CourseThumb } from '../ui/CourseThumb';
import { Icon } from '../ui/Icon';
import { ImagemInvalidaError, TIPOS_CAPA, prepararCapa } from '../../lib/imagem';
import { GaleriaCapasModal } from './GaleriaCapasModal';
import type { CapaGaleriaItem } from '../../hooks/useCapa';

interface CapaUploaderProps {
  tipo: 'curso' | 'trilha';
  id: string;
  // Capa atual (do servidor) ou prévia local de uma imagem ainda não enviada.
  capaUrl: string | null;
  ocupado?: boolean;
  // Recebe a imagem já preparada (redimensionada); quem usa decide se envia na hora ou ao salvar.
  onArquivo: (imagem: Blob) => void | Promise<void>;
  // Recebe a imagem escolhida na galeria de capas prontas.
  onGaleria: (item: CapaGaleriaItem) => void | Promise<void>;
  onRemover?: () => void | Promise<void>;
  // Mensagem extra abaixo da prévia (ex.: "será enviada ao salvar").
  aviso?: string;
}

export function CapaUploader({ tipo, id, capaUrl, ocupado, onArquivo, onGaleria, onRemover, aviso }: CapaUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  const [galeriaAberta, setGaleriaAberta] = useState(false);

  async function handleGaleria(item: CapaGaleriaItem) {
    setGaleriaAberta(false);
    setErro(null);
    try {
      await onGaleria(item);
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : t('common.error'));
    }
  }

  async function handleEscolha(arquivo: File | undefined) {
    if (inputRef.current) inputRef.current.value = '';
    if (!arquivo) return;
    setErro(null);
    setPreparando(true);
    try {
      await onArquivo(await prepararCapa(arquivo));
    } catch (err) {
      if (err instanceof ImagemInvalidaError) {
        setErro(t(err.motivo === 'tipo' ? 'admin.capa.invalidType' : 'admin.capa.tooLarge'));
      } else {
        setErro(err instanceof Error && err.message ? err.message : t('common.error'));
      }
    } finally {
      setPreparando(false);
    }
  }

  const trabalhando = ocupado || preparando;

  return (
    <div className="capa-uploader">
      <span className="campo-label">{t('admin.capa.title')}</span>
      <div className="capa-uploader-corpo">
        <div className={`capa-uploader-previa${trabalhando ? ' capa-uploader-previa-ocupada' : ''}`}>
          <CourseThumb id={id} tipo={tipo} capaUrl={capaUrl} />
          {trabalhando && <span className="spinner capa-uploader-spinner" aria-label={t('admin.capa.sending')} />}
        </div>

        <div className="capa-uploader-acoes">
          <div className="capa-uploader-botoes">
            <button type="button" className="btn btn-secondary btn-sm" disabled={trabalhando} onClick={() => setGaleriaAberta(true)}>
              <Icon name="book" size={14} />
              {t('admin.capa.gallery')}
            </button>
            <label className={`btn btn-secondary btn-sm${trabalhando ? ' btn-desabilitado' : ''}`}>
              <input
                ref={inputRef}
                type="file"
                accept={TIPOS_CAPA.join(',')}
                disabled={trabalhando}
                onChange={(e) => handleEscolha(e.target.files?.[0])}
              />
              <Icon name="file" size={14} />
              {t('admin.capa.choose')}
            </label>
            {capaUrl && onRemover && (
              <button type="button" className="btn btn-danger btn-sm" disabled={trabalhando} onClick={() => onRemover()}>
                <Icon name="trash" size={14} />
                {t('admin.capa.remove')}
              </button>
            )}
          </div>
          <span className="field-hint">{t('admin.capa.hint')}</span>
          {!capaUrl && <span className="field-hint">{t('admin.capa.default')}</span>}
          {aviso && <span className="field-hint capa-uploader-aviso">{aviso}</span>}
          {erro && <span className="capa-uploader-erro">{erro}</span>}
        </div>
      </div>

      {galeriaAberta && (
        <GaleriaCapasModal capaAtualUrl={capaUrl} onEscolher={handleGaleria} onClose={() => setGaleriaAberta(false)} />
      )}
    </div>
  );
}
