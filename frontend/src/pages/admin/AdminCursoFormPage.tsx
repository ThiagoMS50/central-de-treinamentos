import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCursoQuery, useCriarCursoMutation, useAtualizarCursoMutation, type CursoFormValues } from '../../hooks/useCursos';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { Icon, type IconName } from '../../components/ui/Icon';
import { AulasManager } from '../../components/admin/AulasManager';
import { QuizBuilder } from '../../components/admin/QuizBuilder';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { useSavedFeedback } from '../../hooks/useSavedFeedback';

const VALORES_INICIAIS: CursoFormValues = {
  titulo: '',
  descricao: '',
  cargaHorariaHoras: 0,
  temPrazo: false,
  prazoDias: null,
};

type Aba = 'info' | 'aulas' | 'quiz';

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
  const [aba, setAba] = useState<Aba>('info');

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
  // e já abrimos a aba de aulas (o próximo passo natural), usando um sinal passado pelo navigate().
  useEffect(() => {
    if ((location.state as { criadoAgora?: boolean } | null)?.criadoAgora) {
      mostrar();
      setAba('aulas');
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

  const abas: { id: Aba; label: string; icon: IconName; count?: number }[] = [
    { id: 'info', label: t('admin.cursos.stepInfo'), icon: 'info' },
    { id: 'aulas', label: t('admin.cursos.stepAulas'), icon: 'book', count: cursoQuery.data?.aulas.length },
    { id: 'quiz', label: t('admin.cursos.stepQuiz'), icon: 'quiz' },
  ];

  return (
    <div className="page admin-form-page">
      <AdminTabs />
      <Link to="/admin/cursos" className="back-link">
        ← {t('common.back')}
      </Link>

      <div className="page-header">
        <h1>{editando ? valores.titulo || t('admin.cursos.edit') : t('admin.cursos.new')}</h1>
        {editando && (
          <Link to={`/cursos/${id}`} className="btn btn-secondary btn-sm">
            <Icon name="play" size={14} />
            {t('admin.cursos.viewAsStudent')}
          </Link>
        )}
      </div>

      {/* Etapas do cadastro: aulas e quiz só ficam disponíveis depois que o curso existe. */}
      <div className="form-steps" role="tablist">
        {abas.map((item, i) => {
          const bloqueada = item.id !== 'info' && !editando;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={aba === item.id}
              className={`form-step${aba === item.id ? ' form-step-ativa' : ''}`}
              disabled={bloqueada}
              title={bloqueada ? t('admin.cursos.saveFirstHint') : undefined}
              onClick={() => setAba(item.id)}
            >
              <span className="form-step-numero">{bloqueada ? <Icon name="lock" size={13} /> : i + 1}</span>
              <span className="form-step-label">{item.label}</span>
              {typeof item.count === 'number' && <span className="form-step-count">{item.count}</span>}
            </button>
          );
        })}
      </div>
      {!editando && <p className="hint-text">{t('admin.cursos.saveFirstHint')}</p>}

      {aba === 'info' && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-grid">
            <label className="form-grid-full">
              {t('admin.cursos.titulo')}
              <input
                required
                autoFocus={!editando}
                value={valores.titulo}
                onChange={(e) => setValores({ ...valores, titulo: e.target.value })}
              />
            </label>
            <label className="form-grid-full">
              {t('admin.cursos.descricao')}
              <textarea rows={4} value={valores.descricao} onChange={(e) => setValores({ ...valores, descricao: e.target.value })} />
              <span className="field-hint">{t('admin.cursos.descricaoHint')}</span>
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
            <div className="prazo-campo">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={valores.temPrazo}
                  onChange={(e) => setValores({ ...valores, temPrazo: e.target.checked })}
                />
                <span className="switch-trilho" aria-hidden="true" />
                {t('admin.cursos.temPrazo')}
              </label>
              {valores.temPrazo && (
                <label>
                  {t('admin.cursos.prazoDias')}
                  <input
                    type="number"
                    min={1}
                    required
                    value={valores.prazoDias ?? ''}
                    onChange={(e) => setValores({ ...valores, prazoDias: Number(e.target.value) })}
                  />
                  <span className="field-hint">{t('admin.cursos.prazoHint')}</span>
                </label>
              )}
            </div>
          </div>

          <div className="form-card-footer">
            {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
            <button type="submit" className="btn btn-primary" disabled={criarMutation.isPending || atualizarMutation.isPending}>
              {t('common.save')}
            </button>
          </div>
        </form>
      )}

      {aba === 'aulas' && editando && cursoQuery.data && (
        <>
          {salvo && <span className="saved-banner">✓ {t('common.savedSuccessfully')}</span>}
          <p className="hint-text">{t('admin.cursos.autoSaveHint')}</p>
          <AulasManager cursoId={id!} aulas={cursoQuery.data.aulas} />
        </>
      )}

      {aba === 'quiz' && editando && cursoQuery.data && <QuizBuilder cursoId={id!} />}
    </div>
  );
}
