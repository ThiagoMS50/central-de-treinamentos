import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCursosQuery } from '../hooks/useCursos';

const STORAGE_PREFIX = 'lms_tour_seen_';

interface TourStep {
  key: string;
  path: (exemploCursoId: string | null) => string;
}

const BASE_STEPS: TourStep[] = [
  { key: 'welcome', path: () => '/cursos' },
  { key: 'dashboard', path: () => '/cursos' },
  { key: 'curso', path: (cursoId) => (cursoId ? `/cursos/${cursoId}` : '/cursos') },
  { key: 'certificado', path: (cursoId) => (cursoId ? `/cursos/${cursoId}` : '/cursos') },
  { key: 'idioma', path: () => '/cursos' },
];

const RANKING_STEP: TourStep = { key: 'ranking', path: () => '/ranking' };
const GESTOR_STEP: TourStep = { key: 'relatorios', path: () => '/relatorios' };
const ADMIN_STEP: TourStep = { key: 'admin', path: () => '/admin/cursos' };

function buildSteps(role: string | undefined): TourStep[] {
  const steps = [...BASE_STEPS];
  // Administrador gerencia o conteúdo mas não participa da gamificação (não é "aluno" pra isso).
  if (role !== 'admin') steps.splice(4, 0, RANKING_STEP);
  if (role === 'gestor' || role === 'admin') steps.push(GESTOR_STEP);
  if (role === 'admin') steps.push(ADMIN_STEP);
  return steps;
}

interface TourContextValue {
  open: boolean;
  stepIndex: number;
  steps: TourStep[];
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
}

export const TourContext = createContext<TourContextValue | undefined>(undefined);

function markSeen(userId: string) {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, '1');
  } catch {
    // localStorage indisponível (ex: navegação privada) — não bloqueia o uso do app
  }
}

function hasSeen(userId: string): boolean {
  try {
    return !!localStorage.getItem(STORAGE_PREFIX + userId);
  } catch {
    return true;
  }
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const cursosQuery = useCursosQuery();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => buildSteps(profile?.role), [profile?.role]);
  const exemploCursoId = cursosQuery.data?.[0]?.id ?? null;

  useEffect(() => {
    if (!profile) return;
    if (!hasSeen(profile.id)) {
      setStepIndex(0);
      setOpen(true);
    }
  }, [profile]);

  // Navega para a tela real de cada passo sempre que o tour está aberto e o passo muda.
  useEffect(() => {
    if (!open) return;
    navigate(steps[stepIndex].path(exemploCursoId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex, steps, exemploCursoId]);

  function start() {
    setStepIndex(0);
    setOpen(true);
  }

  function finish() {
    if (profile) markSeen(profile.id);
    setOpen(false);
  }

  function next() {
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
    else finish();
  }

  function prev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <TourContext.Provider value={{ open, stepIndex, steps, start, next, prev, skip: finish }}>
      {children}
    </TourContext.Provider>
  );
}
