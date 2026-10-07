-- Permite ao Administrador "redefinir o tutorial" de uma pessoa — rodar no SQL Editor do Supabase.
-- Guarda quando o tutorial foi redefinido; se a pessoa viu o tutorial antes dessa data (registro
-- no navegador dela), ele abre de novo automaticamente na próxima vez que ela entrar.
alter table public.profiles add column if not exists tutorial_resetado_em timestamptz;
