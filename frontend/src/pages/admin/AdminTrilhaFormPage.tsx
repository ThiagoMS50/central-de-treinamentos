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

      <h1>{editando ? t('admin.trilhas.edit') : t('admin.trilhas.new')}</h1>

      <form onSubmit={handleSubmit} className="form" style={{ maxWidth: 'none' }}>
        <label>
          {t('admin.trilhas.titulo')}
          <input required value={valores.titulo} onChange={(e) => setValores({ ...valores, titulo: e.target.value })} />
        </label>
        <label>
          {t('admin.trilhas.descricao')}
          <textarea value={valores.descricao} onChange={(e) => setValores({ ...valores, descricao: e.target.value })} />
        </label>

        <h2>{t('admin.trilhas.assignCourses')}</h2>
        {cursosQuery.isLoading && <Spinner />}
        {cursosQuery.data && (
          <div className="trilha-picker">
            <div className="trilha-picker-column">
              <h3>
                {t('admin.trilhas.availableCourses')} ({disponiveis.length})
              </h3>
              <input
                className="search-input"
                type="search"
                placeholder={t('common.search')}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <ul className="trilha-picker-list">
                {disponiveis.length === 0 && <li className="trilha-picker-empty">{t('common.empty')}</li>}
                {disponiveis.map((item) => (
                  <li key={item.cursoId} className="trilha-picker-item">
                    <span className="trilha-picker-item-label">{item.titulo}</span>
                    <button type="button" className="btn-icon" onClick={() => adicionar(item.cursoId)} aria-label={t('admin.trilhas.addCourse')}>
                      +
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="trilha-picker-column">
              <h3>
                {t('admin.trilhas.selectedCourses')} ({incluidos.length})
              </h3>
              <ul className="trilha-picker-list">
                {incluidos.length === 0 && <li className="trilha-picker-empty">{t('common.empty')}</li>}
                {incluidos.map((item, index) => (
                  <li key={item.cursoId} className="trilha-picker-item">
                    <span className="trilha-picker-order">{index + 1}.</span>
                    <span className="trilha-picker-item-label">{item.titulo}</span>
                    <div className="reorder-controls">
                      <button
                        type="button"
                        className="btn-icon"
                        disabled={index === 0}
                        onClick={() => mover(item.cursoId, -1)}
                        aria-label={t('common.moveUp')}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        disabled={index === incluidos.length - 1}
                        onClick={() => mover(item.cursoId, 1)}
                        aria-label={t('common.moveDown')}
                      >
                        ↓
                      </button>
                    </div>
                    <button type="button" className="btn-icon" onClick={() => remover(item.cursoId)} aria-label={t('common.remove')}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="form-inline">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={criarMutation.isPending || atualizarMutation.isPending || salvandoCursos}
          >
            {t('common.save')}
          </button>
          {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
        </div>
      </form>
    </div>
  );
}
