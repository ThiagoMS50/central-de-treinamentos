import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Aula } from '../../types/api';
import { useCriarAulaMutation, useExcluirAulaMutation } from '../../hooks/useAulas';
import { MateriaisManager } from './MateriaisManager';
import { EmptyState } from '../ui/Feedback';

export function AulasManager({ cursoId, aulas }: { cursoId: string; aulas: Aula[] }) {
  const { t } = useTranslation();
  const criarMutation = useCriarAulaMutation(cursoId);
  const excluirMutation = useExcluirAulaMutation(cursoId);

  const [titulo, setTitulo] = useState('');

  function handleCriar(e: FormEvent) {
    e.preventDefault();
    if (!titulo) return;
    criarMutation.mutate({ titulo, ordem: aulas.length }, { onSuccess: () => setTitulo('') });
  }

  return (
    <div className="aulas-manager">
      {aulas.length === 0 && <EmptyState message={t('curso.noAulas')} />}

      {aulas.map((aula, index) => (
        <div key={aula.id} className="aula-card">
          <div className="aula-card-header">
            <h3>
              {index + 1}. {aula.titulo}
            </h3>
            <button type="button" className="btn btn-danger" onClick={() => excluirMutation.mutate(aula.id)}>
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
    </div>
  );
}
