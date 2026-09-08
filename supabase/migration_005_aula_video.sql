-- Vídeo (link) nas aulas — rodar no SQL Editor do Supabase.
-- Guarda só a URL (YouTube, Vimeo ou link direto de vídeo); o player é resolvido no frontend.

alter table public.aulas add column if not exists video_url text;
