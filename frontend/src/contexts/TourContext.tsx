import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCursosQuery } from '../hooks/useCursos';
import { useConfiguracoesQuery } from '../hooks/useConfiguracoes';
import { definirUsuarioMissoes, marcarMissao } from '../lib/missoes';

// "v2": o tutorial interativo substituiu o tour antigo — quem só viu o antigo vê o novo uma vez.
const STORAGE_PREFIX = 'lms_tutorial_v2_seen_';

// Um passo do tutorial (estilo videogame): destaca um elemento real da tela ([data-tour="..."])
// e explica o que ele faz. Passos com "acao" esperam o usuário clicar no elemento para avançar
// ("faça para continuar"); os demais avançam pelo botão Próximo.
export interface TourStep {
  key: string;
  // Tela onde o passo acontece; se a tela atual não casar com "rota", o tutorial navega.
  rota?: RegExp;
  path?: (ctx: { cursoId: string | null }) => string;
  alvo?: string;
  acao?: boolean;
  // Se o elemento não existir para este usuário/tela, o passo é pulado sozinho.
  opcional?: boolean;
}

const PAINEL = /^\/cursos\/?$/;
const CURSO = /^\/cursos\/[^/]+$/;

function montarPassos(ehAdmin: boolean, rankingHabilitado: boolean): TourStep[] {
  const passos: TourStep[] = [
    { key: 'welcome' },
    { key: 'menu', rota: PAINEL, path: () => '/cursos', alvo: 'menu' },
    { key: 'destaque', rota: PAINEL, path: () => '/cursos', alvo: 'destaque', opcional: true },
    { key: 'cursos', rota: PAINEL, path: () => '/cursos', alvo: 'cursos', opcional: true },
    { key: 'abrirCurso', rota: PAINEL, path: () => '/cursos', alvo: 'primeiro-curso', acao: true, opcional: true },
    { key: 'indice', rota: CURSO, path: ({ cursoId }) => (cursoId ? `/cursos/${cursoId}` : '/cursos'), alvo: 'indice', opcional: true },
    { key: 'avancar', rota: CURSO, path: ({ cursoId }) => (cursoId ? `/cursos/${cursoId}` : '/cursos'), alvo: 'avancar', opcional: true },
  ];
  if (rankingHabilitado) {
    passos.push(
      { key: 'irRanking', alvo: 'nav-ranking', acao: true },
      { key: 'ranking', rota: /^\/ranking/, path: () => '/ranking', alvo: 'ranking', opcional: true },
    );
  }
  if (ehAdmin) {
    passos.push(
      { key: 'irAdmin', alvo: 'nav-admin', acao: true },
      { key: 'novoCurso', rota: /^\/admin\/cursos\/?$/, path: () => '/admin/cursos', alvo: 'novo-curso', opcional: true },
      { key: 'relatorios', alvo: 'nav-relatorios' },
    );
  }
  passos.push({ key: 'preferencias', alvo: 'preferencias' }, { key: 'conta', alvo: 'conta', acao: true });
  return passos;
}

interface TourContextValue {
  open: boolean;
  celebrando: boolean;
  stepIndex: number;
  steps: TourStep[];
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  fecharCelebracao: () => void;
}

export const TourContext = createContext<TourContextValue | undefined>(undefined);

function markSeen(userId: string) {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, new Date().toISOString());
  } catch {
    // localStorage indisponível (ex: navegação privada) — não bloqueia o uso do app
  }
}

// Viu o tutorial e o Admin não pediu para rever depois disso. Registros antigos ('1', sem data)
// contam como vistos, a menos que exista uma redefinição.
function hasSeen(userId: string, resetadoEm: string | null): boolean {
  try {
    const visto = localStorage.getItem(STORAGE_PREFIX + userId);
    if (!visto) return false;
    if (!resetadoEm) return true;
    const vistoEm = Date.parse(visto);
    return !Number.isNaN(vistoEm) && vistoEm >= Date.parse(resetadoEm);
  } catch {
    return true;
  }
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cursosQuery = useCursosQuery();
  const configuracoesQuery = useConfiguracoesQuery();
  const [open, setOpen] = useState(false);
  const [celebrando, setCelebrando] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const rankingHabilitado = configuracoesQuery.data?.rankingHabilitado ?? true;
  const ehAdmin = profile?.role === 'admin';
  const steps = useMemo(() => montarPassos(ehAdmin, rankingHabilitado), [ehAdmin, rankingHabilitado]);
  const cursoId = cursosQuery.data?.[0]?.id ?? null;

  useEffect(() => {
    definirUsuarioMissoes(profile?.id ?? null);
    if (!profile) return;
    if (!hasSeen(profile.id, profile.tutorialResetadoEm)) {
      setStepIndex(0);
      setOpen(true);
    }
  }, [profile]);

  // Leva o usuário para a tela do passo, se ele ainda não estiver nela.
  useEffect(() => {
    if (!open) return;
    const passo = steps[stepIndex];
    if (passo.rota && passo.path && !passo.rota.test(location.pathname)) navigate(passo.path({ cursoId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex, steps]);

  const finish = useCallback(
    (concluiu: boolean) => {
      if (profile) {
        markSeen(profile.id);
        if (concluiu) marcarMissao('tutorial', profile.id);
      }
      setOpen(false);
      if (concluiu) setCelebrando(true);
    },
    [profile],
  );

  const next = useCallback(() => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
    else finish(true);
  }, [stepIndex, steps.length, finish]);

  function start() {
    setCelebrando(false);
    setStepIndex(0);
    setOpen(true);
  }

  function prev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <TourContext.Provider
      value={{
        open,
        celebrando,
        stepIndex,
        steps,
        start,
        next,
        prev,
        skip: () => finish(false),
        // Ao fechar a vitória, volta ao painel, onde ficam as missões de Primeiros passos.
        fecharCelebracao: () => {
          setCelebrando(false);
          navigate('/cursos');
        },
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
