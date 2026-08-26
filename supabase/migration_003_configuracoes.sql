-- Configurações gerais do sistema (chave/valor booleano) — rodar no SQL Editor do Supabase.
-- Hoje só guarda se o ranking está habilitado, mas serve pra outras opções futuras do Admin.

create table if not exists public.configuracoes (
  chave text primary key,
  valor boolean not null
);

insert into public.configuracoes (chave, valor) values ('ranking_habilitado', true)
on conflict (chave) do nothing;

alter table public.configuracoes enable row level security;
