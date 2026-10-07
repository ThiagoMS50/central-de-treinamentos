-- Imagem de capa (opcional) de cursos e trilhas — rodar no SQL Editor do Supabase.
-- Guarda só o caminho do arquivo no Storage; a URL pública é montada pelo backend.

alter table public.cursos add column if not exists capa_path text;
alter table public.trilhas add column if not exists capa_path text;

-- Bucket PÚBLICO só para as capas (imagens de vitrine, sem dado sensível): a URL fica fixa e
-- pode ser usada direto no <img>, sem link assinado que expira. Upload/exclusão continuam
-- só pelo backend (com a service role); os materiais dos cursos seguem no bucket privado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('capas', 'capas', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
