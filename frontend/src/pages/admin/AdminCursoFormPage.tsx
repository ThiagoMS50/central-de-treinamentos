import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCursoQuery, useCriarCursoMutation, useAtualizarCursoMutation, type CursoFormValues } from '../../hooks/useCursos';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { AulasManager } from '../../components/admin/AulasManager';
import { QuizBuilder } from '../../components/admin/QuizBuilder';
import { useSavedFeedback } from '../../hooks/useSavedFeedback';

const VALORES_INICIAIS: CursoFormValues = {
  titulo: '',
  descricao: '',
  cargaHorariaHoras: 0,
  temPrazo: false,
  prazoDias: null,
};

export function AdminCursoFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const editando = !!id;

  const cursoQuery = useCursoQuery(id);
  const criarMutation = useCriarCursoMutation();
  const atualizarMutation = useAtualizarCursoMutation(id ?? '');
  const { salvo, mostrar } = useSavedFeedback();

  const [valores, setValores] = useState<CursoFormValues>(VALORES_INICIAIS);

  useEffect(() => {
    if (!cursoQuery.data) return;
    setValores({
      titulo: cursoQuery.data.titulo,
      descricao: cursoQuery.data.descricao ?? '',
      cargaHorariaHoras: cursoQuery.data.cargaHorariaHoras,
      temPrazo: cursoQuery.data.temPrazo,
      prazoDias: cursoQuery.data.prazoDias,
    });
  }, [cursoQuery.data]);

  // Ao criar um curso novo, a página navega direto pra tela de edição — mostramos a confirmação
  // já nessa tela de destino, usando um sinal passado pelo navigate().
  useEffect(() => {
    if ((location.state as { criadoAgora?: boolean } | null)?.criadoAgora) {
      mostrar();
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (editando && cursoQuery.isLoading) return <Spinner />;
  if (editando && cursoQuery.isError) return <ErrorBanner onRetry={() => cursoQuery.refetch()} />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editando) {
      await atualizarMutation.mutateAsync(valores);
      mostrar();
    } else {
      const criado = await criarMutation.mutateAsync(valores);
      navigate(`/admin/cursos/${criado.id}/editar`, { replace: true, state: { criadoAgora: true } });
    }
  }

  return (
    <div className="page">
      <Link to="/admin/cursos" className="back-link">
        ← {t('common.back')}
      </Link>

      <h1>{editando ? t('admin.cursos.edit') : t('admin.cursos.new')}</h1>

      <form onSubmit={handleSubmit} className="form">
        <label>
          {t('admin.cursos.titulo')}
          <input required value={valores.titulo} onChange={(e) => setValores({ ...valores, titulo: e.target.value })} />
        </label>
        <label>
          {t('admin.cursos.descricao')}
          <textarea value={valores.descricao} onChange={(e) => setValores({ ...valores, descricao: e.target.value })} />
        </label>
        <label>
          {t('admin.cursos.cargaHoraria')}
          <input
            type="number"
            min={0}
            step={0.5}
            value={valores.cargaHorariaHoras}
            onChange={(e) => setValores({ ...valores, cargaHorariaHoras: Number(e.target.value) })}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={valores.temPrazo}
            onChange={(e) => setValores({ ...valores, temPrazo: e.target.checked })}
          />
          {t('admin.cursos.temPrazo')}
        </label>
        {valores.temPrazo && (
          <label>
            {t('admin.cursos.prazoDias')}
            <input
              type="number"
              min={1}
              value={valores.prazoDias ?? ''}
              onChange={(e) => setValores({ ...valores, prazoDias: Number(e.target.value) })}
            />
          </label>
        )}

        <div className="form-inline">
          <button type="submit" className="btn btn-primary" disabled={criarMutation.isPending || atualizarMutation.isPending}>
            {t('common.save')}
          </button>
          {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
        </div>
      </form>

      {editando && cursoQuery.data && (
        <>
          <section>
            <h2>{t('admin.cursos.aulas')}</h2>
            <AulasManager cursoId={id!} aulas={cursoQuery.data.aulas} />
          </section>

          <section>
            <QuizBuilder cursoId={id!} />
          </section>
        </>
      )}
    </div>
  );
}
