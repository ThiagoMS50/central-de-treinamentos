import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Aula } from '../../types/api';
import { useCriarAulaMutation, useExcluirAulaMutation, useAtualizarAulaMutation } from '../../hooks/useAulas';
import { MateriaisManager } from './MateriaisManager';
import { EmptyState } from '../ui/Feedback';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Icon } from '../ui/Icon';

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
    atualizarMutation.mutate({ aulaId: aula.id, titulo: novoTitulo, ordem: aula.ordem, videoUrl: aula.videoUrl });
  }

  function handleVideoUrlChange(aula: Aula, novoValor: string) {
    const novoVideoUrl = novoValor.trim() === '' ? null : novoValor.trim();
    if (novoVideoUrl === aula.videoUrl) return;
    atualizarMutation.mutate({ aulaId: aula.id, titulo: aula.titulo, ordem: aula.ordem, videoUrl: novoVideoUrl });
  }

  function mover(index: number, direcao: -1 | 1) {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= aulas.length) return;
    const atual = aulas[index];
    const outra = aulas[alvo];
    atualizarMutation.mutate({ aulaId: atual.id, titulo: atual.titulo, ordem: outra.ordem, videoUrl: atual.videoUrl });
    atualizarMutation.mutate({ aulaId: outra.id, titulo: outra.titulo, ordem: atual.ordem, videoUrl: outra.videoUrl });
  }

  return (
    <div className="aulas-manager">
      {aulas.length === 0 && <EmptyState message={t('curso.noAulas')} />}

      {aulas.map((aula, index) => (
        <section key={aula.id} className="aula-editor">
          <div className="aula-editor-header">
            <span className="aula-editor-numero">{index + 1}</span>
            <input
              key={aula.id + aula.titulo}
              className="aula-titulo-input"
              aria-label={t('admin.cursos.lessonN', { n: index + 1 })}
              defaultValue={aula.titulo}
              onBlur={(e) => handleRenomear(aula, e.target.value)}
            />
            <div className="icon-actions">
              <button
                type="button"
                className="icon-button"
                disabled={index === 0}
                onClick={() => mover(index, -1)}
                aria-label={t('common.moveUp')}
                title={t('common.moveUp')}
              >
                <Icon name="arrowUp" size={16} />
              </button>
              <button
                type="button"
                className="icon-button"
                disabled={index === aulas.length - 1}
                onClick={() => mover(index, 1)}
                aria-label={t('common.moveDown')}
                title={t('common.moveDown')}
              >
                <Icon name="arrowDown" size={16} />
              </button>
              <button
                type="button"
                className="icon-button icon-button-danger"
                onClick={() => setAulaParaExcluir(aula)}
                aria-label={t('common.delete')}
                title={t('common.delete')}
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>

          <div className="aula-editor-body">
            <label className="campo">
              <span className="campo-label">
                <Icon name="play" size={14} />
                {t('admin.cursos.aulaVideoUrl')}
              </span>
              <input
                key={aula.id + (aula.videoUrl ?? '')}
                type="url"
                placeholder="https://"
                defaultValue={aula.videoUrl ?? ''}
                onBlur={(e) => handleVideoUrlChange(aula, e.target.value)}
              />
            </label>

            <MateriaisManager cursoId={cursoId} aulaId={aula.id} materiais={aula.materiais} />
          </div>
        </section>
      ))}

      <form onSubmit={handleCriar} className="add-row">
        <input placeholder={t('admin.cursos.aulaTitulo')} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={criarMutation.isPending || !titulo.trim()}>
          <Icon name="plus" size={16} />
          {t('admin.cursos.addAula')}
        </button>
      </form>

      {aulaParaExcluir && (
        <ConfirmDialog
          title={t('common.delete')}
          message={t('common.confirmDeleteNamed', { nome: aulaParaExcluir.titulo })}
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
