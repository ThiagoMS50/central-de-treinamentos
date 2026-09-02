import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Aula } from '../../types/api';
import { useCriarAulaMutation, useExcluirAulaMutation, useAtualizarAulaMutation } from '../../hooks/useAulas';
import { MateriaisManager } from './MateriaisManager';
import { EmptyState } from '../ui/Feedback';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function AulasManager({ cursoId, aulas }: { cursoId: string; aulas: Aula[] }) {
  const { t } = useTranslation();
  const criarMutation = useCriarAulaMutation(cursoId);
  const excluirMutation = useExcluirAulaMutation(cursoId);
  const atualizarMutation = useAtualizarAulaMutation(cursoId);

  const [titulo, setTitulo] = useState('');
  const [aulaParaExcluir, setAulaParaExcluir] = useState<Aula | null>(null);

  function handleCriar(e: FormEvent) {
    e.preventDefault();
    if (!titulo) return;
    criarMutation.mutate({ titulo, ordem: aulas.length }, { onSuccess: () => setTitulo('') });
  }

  function handleRenomear(aula: Aula, novoTitulo: string) {
    if (!novoTitulo || novoTitulo === aula.titulo) return;
    atualizarMutation.mutate({ aulaId: aula.id, titulo: novoTitulo, ordem: aula.ordem });
  }

  function mover(index: number, direcao: -1 | 1) {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= aulas.length) return;
    const atual = aulas[index];
    const outra = aulas[alvo];
    atualizarMutation.mutate({ aulaId: atual.id, titulo: atual.titulo, ordem: outra.ordem });
    atualizarMutation.mutate({ aulaId: outra.id, titulo: outra.titulo, ordem: atual.ordem });
  }

  return (
    <div className="aulas-manager">
      {aulas.length === 0 && <EmptyState message={t('curso.noAulas')} />}

      {aulas.map((aula, index) => (
        <div key={aula.id} className="aula-card">
          <div className="aula-admin-row">
            <div className="reorder-controls">
              <button
                type="button"
                className="btn-icon"
                disabled={index === 0}
                onClick={() => mover(index, -1)}
                aria-label={t('common.moveUp')}
              >
                ↑
              </button>
              <button
                type="button"
                className="btn-icon"
                disabled={index === aulas.length - 1}
                onClick={() => mover(index, 1)}
                aria-label={t('common.moveDown')}
              >
                ↓
              </button>
            </div>
            <input
              key={aula.id + aula.titulo}
              className="aula-titulo-input"
              defaultValue={aula.titulo}
              onBlur={(e) => handleRenomear(aula, e.target.value)}
            />
            <button type="button" className="btn btn-danger" onClick={() => setAulaParaExcluir(aula)}>
              {t('common.delete')}
            </button>
          </div>
          <MateriaisManager cursoId={cursoId} aulaId={aula.id} materiais={aula.materiais} />
        </div>
      ))}

      <form onSubmit={handleCriar} className="form-inline">
        <input placeholder={t('admin.cursos.aulaTitulo')} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <button type="submit" className="btn btn-secondary" disabled={criarMutation.isPending}>
          {t('admin.cursos.addAula')}
        </button>
      </form>

      {aulaParaExcluir && (
        <ConfirmDialog
          title={t('common.delete')}
          message={t('common.confirmDelete')}
          onConfirm={() => {
            excluirMutation.mutate(aulaParaExcluir.id);
            setAulaParaExcluir(null);
          }}
          onCancel={() => setAulaParaExcluir(null)}
        />
      )}
    </div>
  );
}
