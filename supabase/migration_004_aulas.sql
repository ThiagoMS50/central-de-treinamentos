-- Aulas dentro de um curso — rodar no SQL Editor do Supabase.
-- Cria a tabela de aulas, migra os materiais existentes (hoje presos direto no curso) para uma
-- aula "Conteúdo" automática por curso, e cria o controle de conclusão por aula.
-- A partir de agora, um curso só é considerado concluído quando o aluno concluir TODAS as aulas
-- dele (isso substitui o antigo botão único de "marcar curso como concluído").

create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  titulo text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_aulas_curso on public.aulas(curso_id);
alter table public.aulas enable row level security;

-- Cria uma aula padrão ("Conteúdo") para cada curso que ainda não tem nenhuma aula, para que os
-- materiais já cadastrados tenham onde ficar.
insert into public.aulas (curso_id, titulo, ordem)
select c.id, 'Conteúdo', 0
from public.cursos c
where not exists (select 1 from public.aulas a where a.curso_id = c.id);

-- Move os materiais da coluna antiga (curso_id) para a nova (aula_id), apontando pra aula
-- padrão criada acima, e remove a coluna antiga. Só roda se a coluna antiga ainda existir
-- (seguro rodar essa migração mais de uma vez).
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'materiais' and column_name = 'curso_id') then
    alter table public.materiais add column if not exists aula_id uuid references public.aulas(id) on delete cascade;

    update public.materiais m
    set aula_id = a.id
    from public.aulas a
    where a.curso_id = m.curso_id and m.aula_id is null;

    alter table public.materiais alter column aula_id set not null;
    alter table public.materiais drop column curso_id;
  end if;
end $$;

create index if not exists idx_materiais_aula on public.materiais(aula_id);

create table if not exists public.aula_progresso (
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  aula_id uuid not null references public.aulas(id) on delete cascade,
  concluida_em timestamptz not null default now(),
  primary key (aluno_id, aula_id)
);

create index if not exists idx_aula_progresso_aluno on public.aula_progresso(aluno_id);
alter table public.aula_progresso enable row level security;
