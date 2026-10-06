import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from './ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../lib/apiClient';

const NOME_MAX = 120;

export function EditarNomeModal({ nomeAtual, onClose }: { nomeAtual: string; onClose: () => void }) {
  const { t } = useTranslation();
  const { updateNome } = useAuth();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState(nomeAtual);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const nomeLimpo = nome.trim();
  const semMudanca = nomeLimpo === nomeAtual.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nomeLimpo) {
      setErro(t('userMenu.nameRequired'));
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await updateNome(nomeLimpo);
      // O nome aparece no ranking e nos detalhes de gamificação: recarrega o que estiver em cache.
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
      onClose();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal title={t('userMenu.editNameTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <label>
          {t('userMenu.nameLabel')}
          <input
            autoFocus
            required
            maxLength={NOME_MAX}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <span className="field-hint">{t('userMenu.nameHint')}</span>
        </label>

        {erro && <div className="error-banner">{erro}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={salvando || semMudanca || !nomeLimpo}>
            {salvando ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
