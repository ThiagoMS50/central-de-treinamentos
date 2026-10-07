-- Remove o papel "gestor" — o sistema passa a ter só Aluno e Administrador.
-- Rodar no SQL Editor do Supabase (opcional: o backend já não usa gestor nem manager_id; isto
-- só limpa o banco e impede que o papel volte a ser gravado).

-- Quem ainda estiver como gestor vira aluno (em 07/10/2026 não havia nenhum).
update public.profiles set role = 'aluno' where role = 'gestor';

-- Só aceita os dois papéis.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('aluno', 'admin'));

-- Vínculo aluno → gestor não existe mais.
drop index if exists public.idx_profiles_manager;
alter table public.profiles drop column if exists manager_id;
