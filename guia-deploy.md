# Guia de Execução e Publicação — Central de Treinamentos (LMS)

> Complementa o [premissas-projeto.md](premissas-projeto.md). Modelo de hospedagem: **Supabase** (banco/auth/storage) + **um único serviço no Render** (o backend ASP.NET Core serve os arquivos estáticos do build do React — mesma origem, sem CORS, uma URL só).
>
> Estrutura real do repositório (já criada):
> - `backend/` — projeto .NET (`LmsApi.csproj`), com pasta `wwwroot/` gerada pelo build do React.
> - `frontend/` — projeto React + Vite + TypeScript.
> - `Dockerfile` (raiz) — builda os dois juntos, usado pelo Render.

## 0. Pré-requisitos (instalar uma vez)

- [Node.js](https://nodejs.org/) (LTS) — para rodar/buildar o frontend React. *(já testado nesta máquina: Node 24, npm 11)*
- [.NET SDK 8](https://dotnet.microsoft.com/download) — para rodar o backend C#. *(já testado nesta máquina: .NET 8.0.423)*
- [Git](https://git-scm.com/) e uma conta no [GitHub](https://github.com/) — o deploy do Render puxa direto de um repositório Git.
- Contas gratuitas em: [Supabase](https://supabase.com/) e [Render](https://render.com/).

## 1. Configurar o Supabase (banco, auth e storage)

1. Crie um projeto novo em [supabase.com](https://supabase.com/) (escolha a região mais próxima, ex: São Paulo/`sa-east-1`).
2. Em **Project Settings → API**, anote:
   - `Project URL`
   - `anon public key` (usada pelo frontend)
   - `service_role key` (usada só pelo backend — nunca expor no frontend)
3. Em **Authentication → Providers**, confirme que **Email** está habilitado (login por e-mail/senha), alinhado com o modelo de autocadastro sem aprovação (seção 6 do documento de premissas).
   - **Importante**: por padrão o Supabase exige que a pessoa confirme o e-mail (clicando num link) antes de liberar o acesso. Isso é diferente de "aprovação" (ninguém precisa aprovar manualmente), mas ainda depende do envio de e-mail estar funcionando. Para uma apresentação sem depender de checar caixa de entrada, você pode desligar essa confirmação em **Authentication → Sign In / Providers → Email → "Confirm email"** (desmarcar). Com isso, o cadastro libera acesso imediato.
4. No **SQL Editor**, cole e rode o conteúdo de [supabase/schema.sql](supabase/schema.sql) — cria todas as tabelas (perfis, cursos, trilhas, matrículas, quiz, certificados) com RLS habilitado (só a `service_role` key do backend acessa).
5. Em **Storage**, crie o bucket `materiais-cursos` (documentos/slides dos cursos) — **deixe como privado** (não marcar "Public bucket"). Os certificados são gerados na hora pelo backend, não precisam de bucket próprio.

## 2. Rodar o projeto localmente

### 2.1 Instalar dependências (primeira vez)

```bash
cd backend && dotnet restore
cd ../frontend && npm install
```

### 2.2 Configurar variáveis de ambiente

Já existem arquivos de exemplo no projeto — copie e preencha com os dados reais do seu Supabase:

- `backend/appsettings.Development.json` já tem a seção `Supabase` pronta para preencher (`Url`, `AnonKey`, `ServiceRoleKey`, `AdminBootstrapEmail` — o e-mail que vira Administrador automaticamente no primeiro cadastro). Esse arquivo **não é commitado no Git** (está no `.gitignore`).
- `frontend/.env.local.example` → copie para `frontend/.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Esse arquivo também não é commitado.

### 2.3 Rodar em modo desenvolvimento (dois processos, com hot-reload)

Terminal 1 — backend:
```bash
cd backend
dotnet run
```
API disponível em `http://localhost:5080` (Swagger em `http://localhost:5080/swagger`).

Terminal 2 — frontend:
```bash
cd frontend
npm run dev
```
App disponível em `http://localhost:5173`. O Vite já tem um proxy configurado (`vite.config.ts`) que redireciona chamadas `/api/*` para `http://localhost:5080` — não precisa configurar CORS nem URL da API à mão.

### 2.4 Como saber que funcionou

Abra `http://localhost:5173` no navegador — deve aparecer a tela de **login**. Crie uma conta pela tela de cadastro: o e-mail que bater com `AdminBootstrapEmail` vira Administrador automaticamente; qualquer outro e-mail vira Aluno. Depois de logado, o Administrador tem acesso a **Administração** (criar cursos, trilhas, materiais, quiz, gerenciar usuários) e **Relatórios** no menu; um Aluno comum só vê os cursos/trilhas.

### 2.5 Rodar em modo "produção local" (um processo só, igual ao Render)

Isso já foi testado e funciona:
```bash
cd frontend
npm run build
```
O build do React vai **direto** para `backend/wwwroot` (configurado em `vite.config.ts`). Depois:
```bash
cd ../backend
dotnet bin/Debug/net8.0/LmsApi.dll
```
*(rodar o `.dll` publicado, e não `dotnet run`, porque `dotnet run` usa o `launchSettings.json` que força o ambiente Development — no Render, quem sobe é o `.dll` direto, então testar assim é mais fiel.)*

Acesse `http://localhost:5080` — o próprio backend serve a tela React, numa única URL, sem CORS.

## 3. Subir o código para o GitHub

```bash
git init
git add .
git commit -m "Versão inicial do MVP"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```
*(pule o `git init` se o repositório já existir.)*

## 4. Publicar no Render (backend + frontend juntos)

1. Acesse [render.com](https://render.com/) e faça login com sua conta GitHub.
2. Clique em **New → Web Service** e selecione o repositório.
3. O Render detecta o `Dockerfile` na raiz e usa Docker automaticamente (ele já faz o build do React e do backend em conjunto — veja o `Dockerfile` na raiz do projeto).
4. Em **Environment Variables**, adicione:
   - `Supabase__Url`
   - `Supabase__AnonKey`
   - `Supabase__ServiceRoleKey`
   - `Supabase__AdminBootstrapEmail`
5. Selecione o plano **Free** e clique em **Create Web Service**. O Render injeta a variável `PORT` automaticamente — o `Dockerfile` já está preparado pra escutar nela. O Render gera uma URL pública (ex: `https://seu-projeto.onrender.com`) — essa é a única URL do sistema, front e back juntos.

## 5. Checklist antes de uma apresentação ao vivo

- [ ] Acessar a URL do Render **uns 5-10 minutos antes** para "acordar" o serviço (o free tier dorme após inatividade e o primeiro acesso pode demorar ~30-60s).
- [ ] Testar o fluxo completo na URL de produção: cadastro, login, acesso a um curso, quiz, conclusão e emissão de certificado.
- [ ] Confirmar que as variáveis de ambiente de produção no Render estão corretas.
- [ ] Ter um usuário de teste já cadastrado, caso o cadastro ao vivo falhe por algum motivo de rede.
