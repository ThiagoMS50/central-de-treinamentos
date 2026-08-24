# Central de Treinamentos (LMS) — MVP

- **O que é o projeto e suas premissas**: [premissas-projeto.md](premissas-projeto.md)
- **Como rodar localmente e publicar**: [guia-deploy.md](guia-deploy.md)

## Estrutura

- `backend/` — API em C# (.NET 8, ASP.NET Core).
- `frontend/` — App em React + Vite + TypeScript.
- `Dockerfile` — build unificado (backend serve o build do frontend), usado no deploy do Render.

## Início rápido

```bash
cd backend && dotnet restore
cd ../frontend && npm install
```

Depois, siga a seção 2 do [guia-deploy.md](guia-deploy.md) para configurar o Supabase e rodar os dois processos.
