import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTour } from '../hooks/useTour';
import { useCursosQuery } from '../hooks/useCursos';
import { useTrilhasQuery } from '../hooks/useTrilhas';
import { useConfiguracoesQuery } from '../hooks/useConfiguracoes';
import { useMeuProgressoGamificacaoQuery } from '../hooks/useGamificacao';
import { aoMudarMissoes, missaoFeita } from '../lib/missoes';
import { Icon } from './ui/Icon';

interface Missao {
  key: string;
  feita: boolean;
  // Atalho para cumprir a missão: um link, uma ação, ou nada (só a dica).
  link?: string;
  acao?: () => void;
}

const OCULTAS = 'lms_missoes_ocultas_';

// "Primeiros passos": missões que se marcam sozinhas conforme a pessoa usa o sistema — parte
// vem dos dados (cursos, trilhas, conquistas), parte de ações registradas no navegador.
export function MissoesCard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { start } = useTour();
  const cursosQuery = useCursosQuery();
  const trilhasQuery = useTrilhasQuery();
  const configuracoesQuery = useConfiguracoesQuery();
  const rankingHabilitado = configuracoesQuery.data?.rankingHabilitado ?? false;
  const ehAdmin = profile?.role === 'admin';
  const gamificacaoQuery = useMeuProgressoGamificacaoQuery(rankingHabilitado && !ehAdmin);

  // Recalcula quando uma missão local é marcada (ex.: trocou o tema no topo da tela).
  const [, setVersao] = useState(0);
  useEffect(() => aoMudarMissoes(() => setVersao((v) => v + 1)), []);

  const [oculto, setOculto] = useState(() => {
    try {
      return !!profile && localStorage.getItem(OCULTAS + profile.id) === '1';
    } catch {
      return false;
    }
  });

  if (!profile || oculto || !cursosQuery.data) return null;

  const cursos = cursosQuery.data;
  const trilhas = trilhasQuery.data ?? [];
  const local = (k: Parameters<typeof missaoFeita>[1]) => missaoFeita(profile.id, k);
  const primeiroCurso = cursos[0] ? `/cursos/${cursos[0].id}` : undefined;

  const missoes: Missao[] = ehAdmin
    ? [
        { key: 'tutorial', feita: local('tutorial'), acao: start },
        { key: 'criarCurso', feita: cursos.length > 0, link: '/admin/cursos/novo' },
        { key: 'capa', feita: cursos.some((c) => c.capaUrl) || trilhas.some((tr) => tr.capaUrl), link: '/admin/cursos' },
        { key: 'criarTrilha', feita: trilhas.length > 0, link: '/admin/trilhas/novo' },
        { key: 'relatorios', feita: local('relatorios'), link: '/relatorios' },
        { key: 'personalizar', feita: local('personalizar') },
      ]
    : [
        { key: 'tutorial', feita: local('tutorial'), acao: start },
        { key: 'abrirCurso', feita: cursos.some((c) => c.status !== 'nao_iniciado'), link: primeiroCurso },
        { key: 'concluirCurso', feita: cursos.some((c) => c.status === 'concluido'), link: primeiroCurso },
        ...(rankingHabilitado
          ? [
              { key: 'ranking', feita: local('ranking'), link: '/ranking' },
              { key: 'conquista', feita: !!gamificacaoQuery.data?.badges.some((b) => b.conquistado), link: '/ranking' },
            ]
          : []),
        { key: 'personalizar', feita: local('personalizar') },
      ];

  const feitas = missoes.filter((m) => m.feita).length;
  const todas = feitas === missoes.length;
  const percentual = Math.round((feitas / missoes.length) * 100);

  function ocultar() {
    try {
      localStorage.setItem(OCULTAS + profile!.id, '1');
    } catch {
      // segue só nesta visita
    }
    setOculto(true);
  }

  return (
    <section className="missoes" aria-label={t('missoes.title')}>
      <div className="missoes-topo">
        <div className="missoes-titulo">
          <span className="missoes-icone" aria-hidden="true">
            <Icon name="trophy" size={18} />
          </span>
          <div>
            <h2>{t('missoes.title')}</h2>
            <span className="missoes-sub">{todas ? t('missoes.allDone') : t('missoes.subtitle', { done: feitas, total: missoes.length })}</span>
          </div>
        </div>
        <div className="missoes-progresso" role="progressbar" aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}>
          <div className="missoes-progresso-fill" style={{ width: `${percentual}%` }} />
        </div>
        {todas && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={ocultar}>
            {t('missoes.hide')}
          </button>
        )}
      </div>

      <ul className="missoes-lista">
        {missoes.map((m) => {
          const conteudo = (
            <>
              <span className="missao-check" aria-hidden="true">
                {m.feita && <Icon name="check" size={13} />}
              </span>
              <span className="missao-texto">
                <span className="missao-nome">{t(`missoes.items.${m.key}.title`)}</span>
                <span className="missao-dica">{t(`missoes.items.${m.key}.hint`)}</span>
              </span>
              {!m.feita && (m.link || m.acao) && (
                <span className="missao-ir" aria-hidden="true">
                  <Icon name="arrowRight" size={14} />
                </span>
              )}
            </>
          );
          const classe = `missao${m.feita ? ' missao-feita' : ''}`;
          return (
            <li key={m.key}>
              {!m.feita && m.link ? (
                <Link to={m.link} className={classe}>
                  {conteudo}
                </Link>
              ) : !m.feita && m.acao ? (
                <button type="button" className={classe} onClick={m.acao}>
                  {conteudo}
                </button>
              ) : (
                <div className={classe}>{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
