# Premissas do Projeto — Central de Treinamentos (LMS)

> Documento vivo de definição de escopo, construído por entrevista em 24/08/2026.
> Serve como referência para decisões futuras de produto e arquitetura.

## 1. Visão geral

- **O que é**: um app web tipo LMS (Learning Management System) — uma central de treinamentos.
- **Escopo**: este projeto é um **MVP** (Minimum Viable Product). O objetivo é validar o produto com o essencial funcionando bem, não entregar todas as funcionalidades possíveis de um LMS de uma vez. Tudo listado na seção 13 ("Fora de escopo") é intencionalmente deixado para depois de validado o MVP.
- **Plataforma**: web responsivo. Um único site que se adapta a qualquer tamanho de tela (desktop, tablet, celular), acessado pelo navegador — **sem app nativo** de loja de apps por enquanto.
- **Prazo-alvo**: entrar no ar em 1 a 3 meses (até novembro de 2026).

## 2. Público-alvo

- **Quem usa**: colaboradores internos da empresa (não é para clientes externos, franqueados ou público em geral nesta versão).
- **Escala esperada**: pequena, até 100 usuários.

## 3. Objetivo principal

- Foco em **desenvolvimento contínuo** dos colaboradores (upskilling), e não em compliance obrigatório, onboarding formal ou venda de cursos. Isso influencia o tom do produto: menos "polícia de prazos", mais incentivo a aprender.

## 4. Conteúdo

- **Tipos suportados nesta versão**:
  - Documentos e slides (PDFs, apresentações).
  - Quizzes/avaliações — **sem** nota mínima de aprovação nem limite de tentativas; servem apenas como prática/fixação, não bloqueiam a conclusão do curso.
- **Vídeo**: fora do escopo da v1, deliberadamente. Fica registrado como possível evolução futura.
- **Estrutura de organização**: suporta tanto **cursos avulsos** (independentes) quanto **trilhas de aprendizagem** (sequência de cursos agrupados por tema/cargo, com progressão). Um mesmo curso pode pertencer a **mais de uma trilha** simultaneamente (relação N:N entre cursos e trilhas).
- **Visibilidade**: nesta primeira versão **todos os colaboradores veem todos os cursos e trilhas** disponíveis na plataforma — não há segmentação por área, cargo ou equipe.
- **Prazos de conclusão**: variável por curso — alguns treinamentos podem ter prazo (com cobrança de pendências), outros são livres, sem data limite. A regra é definida curso a curso, não globalmente.

## 5. Papéis e permissões

- **Aluno** (perfil base): todo colaborador cadastrado é automaticamente um Aluno, com acesso aos treinamentos disponíveis para ele. Não é preciso liberar acesso individualmente.
- **Gestor de equipe**: acompanha o progresso dos seus liderados, mas não cria conteúdo.
- **Administrador**: gerencia usuários, permissões e configurações gerais da plataforma.
- *(Não há, por ora, um perfil dedicado de "Instrutor/criador de conteúdo" — a criação de cursos fica a cargo do Administrador, a menos que isso seja revisto depois.)*

## 6. Cadastro de usuários

- Modelo: **autocadastro sem aprovação** nesta primeira versão. O colaborador se cadastra sozinho (provavelmente usando e-mail corporativo) e já tem acesso imediato como Aluno, sem depender de aprovação de um Administrador. *(Pode ser revisto para exigir aprovação ou validação de domínio de e-mail em uma fase futura, se necessário.)*
- **Autenticação**: login próprio (e-mail/senha) gerenciado dentro do próprio LMS — sem SSO corporativo nesta versão.

## 7. Acompanhamento e relatórios

- **Progresso individual**: cada usuário acompanha seu próprio andamento e histórico.
- **Certificado de conclusão**: formato padrão de mercado — PDF gerado automaticamente ao finalizar um curso ou trilha, contendo nome do colaborador, nome do curso/trilha, carga horária, data de conclusão e um código de validação/autenticidade.
- **Relatório gerencial**: seguindo o padrão de mercado de LMS, cobrindo:
  - Taxa de conclusão por curso/trilha (quem completou, quem está em andamento, quem não iniciou).
  - Colaboradores com pendências/atrasados (para cursos com prazo).
  - Tempo médio de conclusão.
  - Nota/desempenho médio nos quizzes de prática.
  - Progresso agregado por equipe/gestor (visão do time de cada Gestor de equipe).
  - Filtros por período, curso/trilha, equipe e colaborador.
  - Exportação dos dados (CSV/Excel).
  - Dashboard com indicadores visuais (gráficos de conclusão, engajamento e pendências), atualizado em tempo real (sem necessidade de gerar relatório periódico agendado nesta versão).

## 8. Engajamento e gamificação

- **Adiado para uma fase futura.** Nesta primeira versão o produto não terá pontos, badges ou ranking — o foco é entregar o essencial (cursos, trilhas, quizzes de prática, certificados e relatórios) antes de investir em gamificação.

## 9. Notificações

- Canal definido: **e-mail** (lembretes de curso pendente, novos conteúdos disponíveis, etc.).
- Notificações dentro do próprio app (sino/central de notificações) não foram priorizadas nesta versão.

## 10. Identidade visual e idiomas

- **Marca**: a plataforma deve refletir a identidade visual da empresa (logo e cores aplicados na interface). Por ora, a marca da PEEX Brasil (logo oficial + paleta rosa/laranja) foi aplicada apenas no **certificado em PDF**; a interface do app segue com o tema neutro provisório.
- **Idiomas**: suporte multi-idioma desde o início — Português, Inglês e Espanhol.

## 11. Integrações

- Nenhuma integração com sistemas externos (RH, calendário, SSO) está prevista nesta primeira versão. Cadastro e gestão de usuários acontecem inteiramente dentro do próprio LMS.

## 12. Stack tecnológica

- **Backend**: C# (.NET) — camada de API e regras de negócio (ex: liberação de cursos, geração de certificado, cálculo de relatórios).
- **Frontend**: React.
- **Banco de dados**: PostgreSQL, gerenciado pelo **Supabase**.
- **Autenticação**: Supabase Auth (login por e-mail/senha, alinhado com o modelo de autocadastro sem aprovação da seção 6).
- **Armazenamento de arquivos**: Supabase Storage, para os documentos/slides dos cursos e os certificados (PDF) gerados.
- **UI/UX**: o produto deve ter um investimento real de design de interface e experiência do usuário (não é só uma tela funcional) — layout responsivo cuidado, states de carregamento/vazio/erro bem tratados, e consistência visual usando a identidade da empresa (ver seção 10).
- **Hospedagem (ambiente de demonstração/MVP, gratuito)**:
  - Frontend e backend **unificados em um único serviço no Render.com**: o próprio ASP.NET Core serve os arquivos estáticos do build do React (mesma origem, sem CORS, uma URL só, uma única env de configuração).
  - Free tier do Render via Docker — sem cota de horas, mas "dorme" após ~15 min de inatividade (é preciso "acordar" antes de uma apresentação ao vivo).
  - Banco/Auth/Storage: Supabase (free tier), como já definido acima.
  - Passo a passo de execução local e publicação: ver [guia-deploy.md](guia-deploy.md).

## 13. Fora de escopo do MVP — registrado para revisão futura

- Suporte a vídeo como tipo de conteúdo.
- App nativo (App Store/Google Play).
- Integrações com sistemas de RH, calendário ou SSO corporativo.
- Nota mínima/tentativas limitadas em quizzes.
- Notificações in-app (além de e-mail).
- Perfil dedicado de "Instrutor" separado do Administrador.
- Gamificação (pontos, badges, ranking).
- Aprovação de autocadastro (todo cadastro nesta versão é liberado automaticamente).

## 14. Pontos em aberto (a decidir com mais informação)

- Nenhum pendente no momento. Todas as premissas levantadas até aqui foram definidas — novos pontos serão adicionados aqui conforme surgirem durante o desenvolvimento.
