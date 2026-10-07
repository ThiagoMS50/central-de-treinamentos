import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  useTrilhaQuery,
  useCriarTrilhaMutation,
  useAtualizarTrilhaMutation,
  type TrilhaFormValues,
} from '../../hooks/useTrilhas';
import { useCursosQuery } from '../../hooks/useCursos';
import { apiFetch } from '../../lib/apiClient';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { useSavedFeedback } from '../../hooks/useSavedFeedback';
import { Icon } from '../../components/ui/Icon';

interface SelecaoCurso {
  cursoId: string;
  titulo: string;
  incluido: boolean;
  ordem: number;
}

export function AdminTrilhaFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editando = !!id;

  const trilhaQuery = useTrilhaQuery(id);
  const cursosQuery = useCursosQuery();
  const criarMutation = useCriarTrilhaMutation();
  const atualizarMutation = useAtualizarTrilhaMutation(id ?? '');
  const queryClient = useQueryClient();
  const { salvo, mostrar } = useSavedFeedback();

  const [valores, setValores] = useState<TrilhaFormValues>({ titulo: '', descricao: '' });
  const [selecao, setSelecao] = useState<SelecaoCurso[]>([]);
  const [busca, setBusca] = useState('');
  const [salvandoCursos, setSalvandoCursos] = useState(false);

  useEffect(() => {
    if (!trilhaQuery.data) return;
    setValores({ titulo: trilhaQuery.data.titulo, descricao: trilhaQuery.data.descricao ?? '' });
  }, [trilhaQuery.data]);

  useEffect(() => {
    if (!cursosQuery.data) return;
    const incluidosPorId = new Map((trilhaQuery.data?.cursos ?? []).map((c) => [c.cursoId, c.ordem]));
    setSelecao(
      cursosQuery.data.map((curso) => ({
        cursoId: curso.id,
        titulo: curso.titulo,
        incluido: incluidosPorId.has(curso.id),
        ordem: incluidosPorId.get(curso.id) ?? 0,
      })),
    );
  }, [cursosQuery.data, trilhaQuery.data]);

  if (editando && trilhaQuery.isLoading) return <Spinner />;
  if (editando && trilhaQuery.isError) return <ErrorBanner onRetry={() => trilhaQuery.refetch()} />;

  function atualizarSelecao(cursoId: string, patch: Partial<SelecaoCurso>) {
    setSelecao((prev) => prev.map((s) => (s.cursoId === cursoId ? { ...s, ...patch } : s)));
  }

  const incluidos = selecao.filter((s) => s.incluido).sort((a, b) => a.ordem - b.ordem);
  const disponiveis = selecao
    .filter((s) => !s.incluido)
    .filter((s) => s.titulo.toLowerCase().includes(busca.toLowerCase()));

  function adicionar(cursoId: string) {
    atualizarSelecao(cursoId, { incluido: true, ordem: incluidos.length });
  }

  function remover(cursoId: string) {
    atualizarSelecao(cursoId, { incluido: false });
  }

  function mover(cursoId: string, direcao: -1 | 1) {
    const index = incluidos.findIndex((s) => s.cursoId === cursoId);
    const alvoIndex = index + direcao;
    if (index < 0 || alvoIndex < 0 || alvoIndex >= incluidos.length) return;
    const atual = incluidos[index];
    const alvo = incluidos[alvoIndex];
    atualizarSelecao(atual.cursoId, { ordem: alvo.ordem });
    atualizarSelecao(alvo.cursoId, { ordem: atual.ordem });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    let trilhaId = id;
    if (editando) {
      await atualizarMutation.mutateAsync(valores);
    } else {
      const criada = await criarMutation.mutateAsync(valores);
      trilhaId = criada.id;
    }

    if (trilhaId) {
      const cursos = selecao.filter((s) => s.incluido).map((s) => ({ cursoId: s.cursoId, ordem: s.ordem }));
      setSalvandoCursos(true);
      try {
        await apiFetch(`/trilhas/${trilhaId}/cursos`, { method: 'PUT', body: { cursos } });
        await queryClient.invalidateQueries({ queryKey: ['trilhas'] });
      } finally {
        setSalvandoCursos(false);
      }
    }

    if (!editando && trilhaId) {
      navigate(`/admin/trilhas/${trilhaId}/editar`, { replace: true });
    }
    mostrar();
  }

  return (
    <div className="page admin-form-page">
      <AdminTabs />
      <Link to="/admin/trilhas" className="back-link">
        ← {t('common.back')}
      </Link>

      <h1>{editando ? valores.titulo || t('admin.trilhas.edit') : t('admin.trilhas.new')}</h1>

      <form onSubmit={handleSubmit} className="form-stack">
        <section className="form-card">
          <h2 className="form-card-titulo">{t('admin.trilhas.infoTitle')}</h2>
          <div className="form-grid">
            <label className="form-grid-full">
              {t('admin.trilhas.titulo')}
              <input
                required
                autoFocus={!editando}
                value={valores.titulo}
                onChange={(e) => setValores({ ...valores, titulo: e.target.value })}
              />
            </label>
            <label className="form-grid-full">
              {t('admin.trilhas.descricao')}
              <textarea rows={3} value={valores.descricao} onChange={(e) => setValores({ ...valores, descricao: e.target.value })} />
            </label>
          </div>
        </section>

        <section className="form-card">
          <h2 className="form-card-titulo">{t('admin.trilhas.assignCourses')}</h2>
          <p className="hint-text">{t('admin.trilhas.coursesHint')}</p>
          {cursosQuery.isLoading && <Spinner />}
          {cursosQuery.data && (
            <div className="trilha-picker">
              <div className="trilha-picker-column">
                <h3>
                  {t('admin.trilhas.availableCourses')} <span className="form-step-count">{disponiveis.length}</span>
                </h3>
                <input
                  className="search-input"
                  type="search"
                  placeholder={t('common.search')}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <ul className="trilha-picker-list">
                  {disponiveis.length === 0 && <li className="trilha-picker-empty">{t('admin.trilhas.emptyAvailable')}</li>}
                  {disponiveis.map((item) => (
                    <li key={item.cursoId}>
                      <button type="button" className="trilha-picker-item trilha-picker-add" onClick={() => adicionar(item.cursoId)}>
                        <span className="trilha-picker-item-label">{item.titulo}</span>
                        <span className="trilha-picker-plus" aria-label={t('admin.trilhas.addCourse')}>
                          <Icon name="plus" size={15} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="trilha-picker-column">
                <h3>
                  {t('admin.trilhas.selectedCourses')} <span className="form-step-count">{incluidos.length}</span>
                </h3>
                <ul className="trilha-picker-list trilha-picker-list-selecionados">
                  {incluidos.length === 0 && <li className="trilha-picker-empty">{t('admin.trilhas.emptySelected')}</li>}
                  {incluidos.map((item, index) => (
                    <li key={item.cursoId} className="trilha-picker-item">
                      <span className="trilha-picker-order">{index + 1}</span>
                      <span className="trilha-picker-item-label">{item.titulo}</span>
                      <div className="icon-actions">
                        <button
                          type="button"
                          className="icon-button"
                          disabled={index === 0}
                          onClick={() => mover(item.cursoId, -1)}
                          aria-label={t('common.moveUp')}
                          title={t('common.moveUp')}
                        >
                          <Icon name="arrowUp" size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={index === incluidos.length - 1}
                          onClick={() => mover(item.cursoId, 1)}
                          aria-label={t('common.moveDown')}
                          title={t('common.moveDown')}
                        >
                          <Icon name="arrowDown" size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-button icon-button-danger"
                          onClick={() => remover(item.cursoId)}
                          aria-label={t('common.remove')}
                          title={t('common.remove')}
                        >
                          <Icon name="close" size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <div className="form-card-footer form-card-footer-solto">
          {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={criarMutation.isPending || atualizarMutation.isPending || salvandoCursos}
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
