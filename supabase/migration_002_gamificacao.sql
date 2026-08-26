-- Gamificação (pontos, badges, ranking) — rodar no SQL Editor do Supabase.
-- Adiciona só o que falta em relação ao schema.sql original (seguro rodar mesmo que
-- alguma dessas tabelas já exista, graças ao "if not exists").

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

create index if not exists idx_pontos_eventos_aluno on public.pontos_eventos(aluno_id);

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
