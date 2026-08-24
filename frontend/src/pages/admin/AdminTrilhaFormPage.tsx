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

  const [valores, setValores] = useState<TrilhaFormValues>({ titulo: '', descricao: '' });
  const [selecao, setSelecao] = useState<SelecaoCurso[]>([]);
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
  }

  return (
    <div className="page">
      <Link to="/admin/trilhas" className="back-link">
        ← {t('common.back')}
      </Link>

      <h1>{editando ? t('admin.trilhas.edit') : t('admin.trilhas.new')}</h1>

      <form onSubmit={handleSubmit} className="form">
        <label>
          {t('admin.trilhas.titulo')}
          <input required value={valores.titulo} onChange={(e) => setValores({ ...valores, titulo: e.target.value })} />
        </label>
        <label>
          {t('admin.trilhas.descricao')}
          <textarea value={valores.descricao} onChange={(e) => setValores({ ...valores, descricao: e.target.value })} />
        </label>

        <h2>{t('admin.trilhas.availableCourses')}</h2>
        {cursosQuery.isLoading && <Spinner />}
        {cursosQuery.data && (
          <ul className="curso-selection-list">
            {selecao.map((item) => (
              <li key={item.cursoId}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.incluido}
                    onChange={(e) => atualizarSelecao(item.cursoId, { incluido: e.target.checked })}
                  />
                  {item.titulo}
                </label>
                {item.incluido && (
                  <input
                    type="number"
                    className="ordem-input"
                    title={t('admin.trilhas.order')}
                    value={item.ordem}
                    onChange={(e) => atualizarSelecao(item.cursoId, { ordem: Number(e.target.value) })}
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={criarMutation.isPending || atualizarMutation.isPending || salvandoCursos}
        >
          {t('common.save')}
        </button>
      </form>
    </div>
  );
}
