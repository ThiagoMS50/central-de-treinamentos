-- Esquema inicial da Central de Treinamentos (LMS) — rodar no SQL Editor do Supabase.
-- Segurança: RLS habilitado em todas as tabelas SEM policies de acesso via anon/authenticated.
-- Isso significa que só a service_role key (usada exclusivamente pelo backend C#) consegue
-- ler/escrever essas tabelas — o frontend nunca acessa o banco diretamente, só via API do backend.

create extension if not exists "pgcrypto";

-- 1. Perfis (estende auth.users do Supabase)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  role text not null default 'aluno' check (role in ('aluno', 'gestor', 'admin')),
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2. Trilhas de aprendizagem
create table if not exists public.trilhas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  created_at timestamptz not null default now()
);

-- 3. Cursos
create table if not exists public.cursos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  carga_horaria_horas numeric(6,2) not null default 0,
  tem_prazo boolean not null default false,
  prazo_dias integer,
  created_at timestamptz not null default now()
);

-- 4. Relação N:N entre cursos e trilhas (um curso pode estar em mais de uma trilha)
create table if not exists public.curso_trilhas (
  curso_id uuid not null references public.cursos(id) on delete cascade,
  trilha_id uuid not null references public.trilhas(id) on delete cascade,
  ordem integer not null default 0,
  primary key (curso_id, trilha_id)
);

-- 5. Materiais (documentos/slides) de um curso — arquivos ficam no Supabase Storage
create table if not exists public.materiais (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  titulo text not null,
  storage_path text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

-- 6. Quiz de prática (opcional, um por curso) — sem nota mínima, só para fixação
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null unique references public.cursos(id) on delete cascade,
  titulo text not null default 'Quiz de prática'
);

create table if not exists public.perguntas (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  enunciado text not null,
  ordem integer not null default 0
);

create table if not exists public.alternativas (
  id uuid primary key default gen_random_uuid(),
  pergunta_id uuid not null references public.perguntas(id) on delete cascade,
  texto text not null,
  correta boolean not null default false,
  ordem integer not null default 0
);

-- 7. Matrículas / progresso (todo aluno vê todos os cursos; a matrícula nasce no primeiro acesso)
create table if not exists public.matriculas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  curso_id uuid not null references public.cursos(id) on delete cascade,
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  unique (aluno_id, curso_id)
);

-- 8. Respostas do quiz de prática (guarda só a última resposta de cada pergunta, sem bloquear conclusão)
create table if not exists public.respostas_quiz (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  pergunta_id uuid not null references public.perguntas(id) on delete cascade,
  alternativa_id uuid not null references public.alternativas(id) on delete cascade,
  respondido_em timestamptz not null default now(),
  unique (aluno_id, pergunta_id)
);

-- 9. Certificados (gerados sob demanda pelo backend; o registro aqui é o que garante o código de validação)
create table if not exists public.certificados (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  curso_id uuid references public.cursos(id) on delete cascade,
  trilha_id uuid references public.trilhas(id) on delete cascade,
  codigo_validacao text not null unique,
  emitido_em timestamptz not null default now(),
  constraint certificado_tem_curso_ou_trilha check (curso_id is not null or trilha_id is not null)
);

-- 10. Gamificação: pontos (histórico de eventos, não só um total, pra auditoria) e badges
create table if not exists public.pontos_eventos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('curso_concluido', 'quiz_correto', 'trilha_concluida')),
  pontos integer not null,
  referencia_id uuid,
  criado_em timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  descricao text not null,
  icone text not null default '🏆'
);

create table if not exists public.aluno_badges (
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  conquistado_em timestamptz not null default now(),
  primary key (aluno_id, badge_id)
);

-- Índices de apoio para os relatórios gerenciais e o ranking de gamificação
create index if not exists idx_matriculas_curso on public.matriculas(curso_id);
create index if not exists idx_matriculas_aluno on public.matriculas(aluno_id);
create index if not exists idx_profiles_manager on public.profiles(manager_id);
create index if not exists idx_pontos_eventos_aluno on public.pontos_eventos(aluno_id);

-- RLS: habilitado em tudo, sem policies — só a service_role key (backend) acessa.
alter table public.profiles enable row level security;
alter table public.trilhas enable row level security;
alter table public.cursos enable row level security;
alter table public.curso_trilhas enable row level security;
alter table public.materiais enable row level security;
alter table public.quizzes enable row level security;
alter table public.perguntas enable row level security;
alter table public.alternativas enable row level security;
alter table public.matriculas enable row level security;
alter table public.respostas_quiz enable row level security;
alter table public.certificados enable row level security;
alter table public.pontos_eventos enable row level security;
alter table public.badges enable row level security;
alter table public.aluno_badges enable row level security;

insert into public.badges (codigo, nome, descricao, icone) values
  ('primeiro_curso', 'Primeiro Passo', 'Concluiu o primeiro curso', '🥇'),
  ('cinco_cursos', 'Maratonista', 'Concluiu 5 cursos', '🏃'),
  ('dez_cursos', 'Mestre em Aprendizado', 'Concluiu 10 cursos', '🎓'),
  ('trilha_completa', 'Trilha Completa', 'Concluiu uma trilha inteira', '🧭'),
  ('quiz_perfeito', 'Nota Máxima', 'Acertou 100% em um quiz de prática', '🎯')
on conflict (codigo) do nothing;
