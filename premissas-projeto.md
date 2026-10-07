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

- **Estrutura de um curso**: um curso é dividido em **aulas**, e o aluno navega aula por aula (passo a passo, com botões Anterior/Avançar e um índice lateral das etapas). Cada aula pode ter:
  - Documentos e slides (PDFs, apresentações) como materiais de apoio para baixar.
  - Um **vídeo** (link do YouTube, Vimeo ou um arquivo de vídeo direto) — opcional, embutido na própria tela da aula. É só um link cadastrado pelo Administrador, sem upload de arquivo de vídeo.
  - O curso é considerado concluído quando o aluno concluir todas as aulas dele.
- **Quizzes/avaliações** — **sem** limite de tentativas (o aluno pode responder de novo quantas vezes quiser). Quando o curso tem quiz, ele é a última etapa: o curso só é considerado concluído (e o certificado só é emitido) depois de todas as aulas feitas **e** de todas as perguntas do quiz respondidas corretamente.
- **Estrutura de organização**: suporta tanto **cursos avulsos** (independentes) quanto **trilhas de aprendizagem** (sequência de cursos agrupados por tema/cargo, com progressão). Um mesmo curso pode pertencer a **mais de uma trilha** simultaneamente (relação N:N entre cursos e trilhas).
- **Visibilidade**: nesta primeira versão **todos os colaboradores veem todos os cursos e trilhas** disponíveis na plataforma — não há segmentação por área, cargo ou equipe.
  - No painel do aluno, os cursos podem ser filtrados por status (Todos / Em andamento / Não iniciado / Concluído, com a contagem de cada um) e aparecem ordenados pelo que pede ação: atrasados primeiro, depois em andamento, não iniciados e, por último, concluídos.
- **Prazos de conclusão**: variável por curso — alguns treinamentos podem ter prazo (com cobrança de pendências), outros são livres, sem data limite. A regra é definida curso a curso, não globalmente.

## 5. Papéis e permissões

- **Aluno** (perfil base): todo colaborador cadastrado é automaticamente um Aluno, com acesso aos treinamentos disponíveis para ele. Não é preciso liberar acesso individualmente.
- **Administrador**: gerencia usuários, permissões, relatórios e configurações gerais da plataforma — incluindo excluir um usuário por completo (a conta de login e todo o progresso, pontos, badges, certificados e respostas de quiz dessa pessoa são removidos juntos, sem deixar rastro; não é possível excluir a própria conta nem o último Administrador restante).
- **Só dois papéis**: o antigo papel de "Gestor de equipe" (que acompanhava os próprios liderados) foi removido — o acompanhamento de progresso e os relatórios ficam com o Administrador.
- *(Não há, por ora, um perfil dedicado de "Instrutor/criador de conteúdo" — a criação de cursos fica a cargo do Administrador, a menos que isso seja revisto depois.)*

## 6. Cadastro de usuários

- Modelo: **autocadastro sem aprovação** nesta primeira versão. O colaborador se cadastra sozinho (provavelmente usando e-mail corporativo) e já tem acesso imediato como Aluno, sem depender de aprovação de um Administrador. *(Pode ser revisto para exigir aprovação ou validação de domínio de e-mail em uma fase futura, se necessário.)*
- **Autenticação**: login próprio (e-mail/senha) gerenciado dentro do próprio LMS — sem SSO corporativo nesta versão.
- **Alterar o próprio nome**: qualquer usuário (Aluno ou Administrador) pode alterar o próprio nome pelo menu que abre ao clicar no seu nome, no topo da tela ("Alterar meu nome"). Só o nome: o papel continua sendo definido apenas pelo Administrador. O novo nome passa a valer no ranking e também nos certificados, inclusive nos já emitidos (o PDF é gerado na hora com o nome atual).

## 7. Acompanhamento e relatórios

- **Progresso individual**: cada usuário acompanha seu próprio andamento e histórico.
- **Certificado de conclusão**: formato padrão de mercado — PDF gerado automaticamente ao finalizar um curso ou trilha, contendo nome do colaborador, nome do curso/trilha, carga horária, data de conclusão e um código de validação/autenticidade.
  - **Visual no padrão da plataforma**: A4 paisagem com faixa lateral no degradê rosa → laranja da marca (selo com estrela e "CERTIFICADO de conclusão"), logo da PEEX, fonte Plus Jakarta Sans (a mesma da interface), frases de ligação ("CERTIFICAMOS QUE", "CONCLUIU COM ÊXITO O CURSO") no mesmo estilo de rótulo em maiúsculas, nome em destaque com sublinhado no degradê, curso/trilha em rosa, cartões com carga horária, data de conclusão por extenso e emissor, e rodapé com o código de validação. Nomes e títulos longos quebram em até duas linhas.
  - **Autenticidade por QR code**: o certificado traz um QR code que abre a página pública **Validar certificado** (/validar/<código>), sem precisar de login — ela confirma se o código existe e mostra a quem, a que curso/trilha e quando foi emitido; também dá para digitar o código à mão em /validar.
- **Relatório gerencial** (acesso só do Administrador): seguindo o padrão de mercado de LMS, cobrindo:
  - Taxa de conclusão por curso/trilha (quem completou, quem está em andamento, quem não iniciou).
  - Colaboradores com pendências/atrasados (para cursos com prazo).
  - Tempo médio de conclusão.
  - Nota/desempenho médio nos quizzes de prática.
  - Filtros por período, curso/trilha e colaborador.
  - Exportação dos dados (CSV/Excel).
  - Dashboard com indicadores visuais (gráficos de conclusão, engajamento e pendências), atualizado em tempo real (sem necessidade de gerar relatório periódico agendado nesta versão).

## 8. Engajamento e gamificação

- **Implementado**, seguindo o padrão comum de mercado em plataformas de treinamento (pontos por progresso + badges de marco + ranking geral):
  - **Pontos**: +10 por curso concluído, +2 por resposta correta em quiz de prática (só na primeira vez que aquela pergunta é acertada, pra evitar "farmar" pontos respondendo repetidamente), +50 de bônus ao concluir uma trilha inteira.
  - **Badges (conquistas)**: 5 selos fixos de marco — Primeiro Passo (1º curso concluído), Maratonista (5 cursos), Mestre em Aprendizado (10 cursos), Trilha Completa (1ª trilha concluída) e Nota Máxima (100% de acerto em um quiz).
  - **Ranking**: lista geral de colaboradores ordenada por pontos, visível para todos (reforça o engajamento, no estilo Duolingo/plataformas de e-learning gamificadas). O Administrador não participa do ranking (ele gerencia conteúdo, não "estuda").
  - **Tela do ranking**: lista com posição (medalhas de ouro/prata/bronze no top 3), avatar, nome, pontos e botão "Ver detalhes"; a linha da própria pessoa fica destacada com a etiqueta "Você".
  - **Detalhe por participante**: no ranking, dá pra abrir um pop-up com um resumo (pontos e quantidade de cursos, trilhas e conquistas), as conquistas (as obtidas com a data, as bloqueadas esmaecidas com cadeado) e os cursos/trilhas concluídos com os pontos e a data de cada um — respeitando uma regra de visibilidade: o Aluno só vê o próprio detalhe e o Administrador vê o de todo mundo.
  - **Configurável pelo Administrador**: o ranking (pontos, badges e a própria página) pode ser inteiramente desativado em Administração → Configurações. Quando desativado, ele some do menu, do painel principal, do tutorial e das missões de Primeiros passos — para todo mundo, não só pra quem desativou.
  - *(Pontuação e badges continuam com regras fixas no código, não configuráveis pelo Administrador nesta versão — deixar administrável fica registrado como possível evolução futura.)*

## 8.1 Tutorial e Primeiros passos

- **Tutorial interativo (estilo videogame)**: abre sozinho no primeiro acesso e pode ser revisto pelo menu do nome ("Ver tutorial novamente"). A tela escurece e só o elemento da vez fica iluminado (cliques fora dele ficam bloqueados), com um balão explicando o que ele faz e o progresso "Missão X de N". Em alguns passos o usuário precisa **fazer a ação** para avançar (abrir um curso, ir ao Ranking, ir à Administração, abrir o menu do próprio nome). Ao final, uma tela de vitória leva de volta ao painel.
  - O roteiro muda por papel: o Aluno vê painel, cursos, dentro de um curso, ranking, preferências e conta; o Administrador vê também Administração, criação de curso e Relatórios. Passos cujo elemento não existe para aquele usuário são pulados sozinhos, e no celular (menu lateral recolhido) os passos de ação viram "Próximo".
- **Primeiros passos (missões)**: card no painel com missões que se marcam sozinhas conforme o uso, com barra de progresso; quando todas são concluídas, pode ser ocultado.
  - Aluno: fazer o tutorial, abrir o primeiro curso, concluir um curso, visitar o ranking, ganhar a primeira conquista e personalizar tema/idioma (ranking e conquista só aparecem com o ranking ligado).
  - Administrador: fazer o tutorial, criar um curso, definir uma capa, criar uma trilha, ver os relatórios e personalizar tema/idioma.
  - As missões que dependem de ações na tela (tutorial, ranking, relatórios, personalizar) ficam registradas no navegador da pessoa; as demais vêm dos dados do sistema.

## 9. Notificações

- Canal definido: **e-mail** (lembretes de curso pendente, novos conteúdos disponíveis, etc.).
- Notificações dentro do próprio app (sino/central de notificações) não foram priorizadas nesta versão.

## 10. Identidade visual e idiomas

- **Marca**: a plataforma deve refletir a identidade visual da empresa (logo e cores aplicados na interface). A paleta rosa/laranja da PEEX Brasil é usada no **certificado em PDF** e na interface do app (degradê nos botões principais, item ativo do menu, barras de progresso, avatar e pontos). Na interface, o nome do sistema aparece como texto no degradê da marca enquanto não houver uma versão do logo com fundo transparente — e esse nome é traduzido junto com o idioma (Central de Treinamentos / Training Hub / Central de Capacitaciones), inclusive no título da aba do navegador.
- **Uso da cor**: cor forte só onde tem significado — status, progresso, ações principais e o destaque do topo do painel. Os cards de cursos e trilhas usam miniaturas neutras (fundo da superfície com um toque leve da marca), para não competir com essas informações.
- **Imagem de capa**: cada curso e cada trilha pode ter uma imagem de capa (opcional), escolhida pelo Administrador no cadastro de duas formas: **da galeria** de ilustrações prontas no estilo da marca (atendimento, segurança, ética, comunicação, gestão do tempo, escuta ativa, jornada do cliente etc. — compartilhadas entre cursos e nunca apagadas ao trocar a capa; novas opções entram só enviando imagens para a pasta `galeria/` do bucket) ou **enviando uma imagem própria** do computador — JPG, PNG ou WebP até 5 MB, de preferência horizontal (ex.: 1600 × 700 px). O navegador reduz fotos grandes e converte para WebP antes de enviar. A capa aparece nos cards do painel, no destaque do topo e na linha do tempo da trilha, recortada no formato do card. Sem capa (ou se a imagem não carregar), o card mostra uma ilustração padrão do tipo: curso (tela com play) ou trilha (caminho até a bandeira de chegada). As capas ficam num bucket público do Storage (`capas`), separado do bucket privado dos materiais.
- **Layout**: menu lateral fixo (seções Aprender / Gestão), que no celular vira uma gaveta aberta pelo botão ☰. No painel do aluno: destaque no topo com o curso sugerido (o mais prioritário ainda não concluído: atrasado → em andamento → não iniciado), card de gamificação ao lado (pontos, posição e conquistas), trilhas em faixa com progresso e cursos em cards com miniatura. Os cards mostram a capa do curso/trilha ou, sem capa, a ilustração padrão do tipo. Dentro do curso, o aluno vê um cabeçalho com carga horária, nº de aulas, prazo e progresso, e um índice lateral "Conteúdo do curso" (Apresentação → aulas → quiz → certificado): pode voltar a qualquer etapa já liberada, e as próximas ficam bloqueadas até concluir as anteriores (o Admin navega livremente). Dentro da trilha, os cursos aparecem numa linha do tempo numerada, com o próximo curso a fazer em destaque e um botão Começar / Continuar / Revisar em cada um. No Admin, o cadastro de curso é dividido em etapas (Informações → Aulas e materiais → Quiz — as duas últimas liberadas depois de salvar o curso, e ao criar um curso o sistema já leva para as aulas), com aulas em cards numerados, materiais com seletor de arquivo e quiz com a alternativa correta marcada por um círculo verde; o de trilha tem um card de informações e o seletor de cursos em duas colunas. A tela de login (e as demais de autenticação) tem duas colunas: formulário à esquerda (onde o olhar começa, então a tarefa vem primeiro) e arte da marca animada à direita; o cursor já abre no primeiro campo.
- **Idiomas**: suporte multi-idioma desde o início — Português, Inglês e Espanhol.
- **Tema claro/escuro**: o usuário pode escolher entre Sistema (segue a preferência do sistema operacional), Claro e Escuro, num menu com ícone no topo da tela (☾ / ☀ / monitor), ao lado do seletor de idioma (🌐 PT/EN/ES). O idioma também pode ser trocado nas telas de login, cadastro e recuperação de senha. **Escuro é o padrão** para quem ainda não escolheu. A escolha fica salva no navegador (localStorage) e persiste entre sessões.

## 11. Integrações

- Nenhuma integração com sistemas externos (RH, calendário, SSO) está prevista nesta primeira versão. Cadastro e gestão de usuários acontecem inteiramente dentro do próprio LMS.

## 12. Stack tecnológica

- **Backend**: C# (.NET) — camada de API e regras de negócio (ex: liberação de cursos, geração de certificado, cálculo de relatórios).
- **Frontend**: React.
- **Banco de dados**: PostgreSQL, gerenciado pelo **Supabase**.
- **Autenticação**: Supabase Auth (login por e-mail/senha, alinhado com o modelo de autocadastro sem aprovação da seção 6).
- **Armazenamento de arquivos**: Supabase Storage, para os documentos/slides das aulas e os certificados (PDF) gerados. O vídeo das aulas não usa Storage — é só um link (YouTube/Vimeo/arquivo direto), ver seção 4.
- **UI/UX**: o produto deve ter um investimento real de design de interface e experiência do usuário (não é só uma tela funcional) — layout responsivo cuidado, states de carregamento/vazio/erro bem tratados, e consistência visual usando a identidade da empresa (ver seção 10).
- **Hospedagem (ambiente de demonstração/MVP, gratuito)**:
  - Frontend e backend **unificados em um único serviço no Render.com**: o próprio ASP.NET Core serve os arquivos estáticos do build do React (mesma origem, sem CORS, uma URL só, uma única env de configuração).
  - Free tier do Render via Docker — sem cota de horas, mas "dorme" após ~15 min de inatividade (é preciso "acordar" antes de uma apresentação ao vivo).
  - Banco/Auth/Storage: Supabase (free tier), como já definido acima.
  - Passo a passo de execução local e publicação: ver [guia-deploy.md](guia-deploy.md).

## 13. Fora de escopo do MVP — registrado para revisão futura

- Upload de arquivo de vídeo (o vídeo suportado hoje é só por link — ver seção 4). Player com streaming adaptativo/qualidade ajustável.
- App nativo (App Store/Google Play).
- Integrações com sistemas de RH, calendário ou SSO corporativo.
- Tentativas limitadas em quizzes.
- Notificações in-app (além de e-mail).
- Perfil dedicado de "Instrutor" separado do Administrador.
- Regras de pontuação/badges configuráveis pelo Administrador (por ora são fixas no código — ver seção 8).
- Aprovação de autocadastro (todo cadastro nesta versão é liberado automaticamente).

## 14. Pontos em aberto (a decidir com mais informação)

- Nenhum pendente no momento. Todas as premissas levantadas até aqui foram definidas — novos pontos serão adicionados aqui conforme surgirem durante o desenvolvimento.
