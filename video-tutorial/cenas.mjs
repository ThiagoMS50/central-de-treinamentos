// Roteiro do vídeo tutorial — fonte única: narração, visual e ações de cada cena.
// Usado pela gravação (gravar.mjs) e para gerar o documento roteiro.md (roteiro.mjs).
//
// Cada cena:
//   id        identificador (nome do arquivo de áudio)
//   cap       capítulo a que pertence
//   tela      tela/área da plataforma mostrada
//   texto     narração (também vira a legenda)
//   visual    o que aparece: destaques, zoom, textos na tela, transições (vai para o roteiro)
//   sons      efeitos sonoros previstos (vai para o roteiro; os cliques entram automaticamente)
//   acao(d)   o que o "diretor" faz na tela enquanto a narração toca

export const CODIGO_CERTIFICADO_LUCAS = gerarCodigo('u-lucas' + 'c-escuta-ativa-na-pratica');
function gerarCodigo(base) {
  // 10 caracteres alfanuméricos, no mesmo estilo dos códigos reais (ex.: UISAZBEK0A).
  let h1 = 7;
  let h2 = 13;
  for (const ch of base) {
    h1 = (h1 * 31 + ch.charCodeAt(0)) >>> 0;
    h2 = (h2 * 131 + ch.charCodeAt(0) * 7) >>> 0;
  }
  return (h1.toString(36) + h2.toString(36)).toUpperCase().padEnd(10, '7').slice(0, 10);
}

export const CAPITULOS = [
  { id: 'abertura', parte: 'Abertura', titulo: 'Boas-vindas e visão geral', alvo: '1 min' },
  { id: 'adm1', parte: 'Parte 1 · Administrador', titulo: 'Capítulo 1 — Primeiro acesso', alvo: '2 min 30 s' },
  { id: 'adm2', parte: 'Parte 1 · Administrador', titulo: 'Capítulo 2 — Criando um curso', alvo: '4 min' },
  { id: 'adm3', parte: 'Parte 1 · Administrador', titulo: 'Capítulo 3 — Criando uma trilha', alvo: '1 min 30 s' },
  { id: 'adm4', parte: 'Parte 1 · Administrador', titulo: 'Capítulo 4 — Usuários, relatórios e configurações', alvo: '2 min 30 s' },
  { id: 'alu1', parte: 'Parte 2 · Aluno', titulo: 'Capítulo 5 — Primeiro acesso do aluno', alvo: '2 min' },
  { id: 'alu2', parte: 'Parte 2 · Aluno', titulo: 'Capítulo 6 — O painel do aluno', alvo: '1 min 30 s' },
  { id: 'alu3', parte: 'Parte 2 · Aluno', titulo: 'Capítulo 7 — Fazendo um curso', alvo: '2 min 30 s' },
  { id: 'alu4', parte: 'Parte 2 · Aluno', titulo: 'Capítulo 8 — Trilhas, ranking e conta', alvo: '2 min' },
  { id: 'fim', parte: 'Encerramento', titulo: 'Encerramento', alvo: '30 s' },
];

const ADMIN = { email: 'ana.ribeiro@peexbrasil.com.br', senha: 'treinamentos2026' };
const ALUNO = { email: 'lucas.almeida@peexbrasil.com.br', senha: 'treinamentos2026' };

export const CENAS = [
  // ================================================================= ABERTURA
  {
    id: 'abertura', cap: 'abertura', tela: 'Cartão de abertura',
    texto: 'Olá! Seja muito bem-vindo à Central de Treinamentos. Neste vídeo, vamos fazer juntos um tour completo pela plataforma, como se você estivesse entrando nela pela primeira vez.',
    visual: 'Cartão de abertura em tela cheia: fundo escuro com brilhos rosa e laranja da marca e losangos flutuando. Etiqueta "Tutorial oficial", título grande em degradê "Central de Treinamentos" e subtítulo "Tudo o que você precisa para administrar e aprender na plataforma".',
    sons: 'Trilha sonora entra em fade-in; whoosh suave na entrada do título.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ tipo: 'abertura', etiqueta: 'Tutorial oficial', titulo: 'Central de Treinamentos', subtitulo: 'Tudo o que você precisa para administrar e aprender na plataforma' });
    },
  },
  {
    id: 'o-que-e', cap: 'abertura', tela: 'Cartão "O que é a plataforma"',
    texto: 'A Central de Treinamentos reúne, em um só lugar, o desenvolvimento de todos os colaboradores. Aqui você encontra cursos com aulas em vídeo e materiais de apoio, trilhas de aprendizagem, quizzes de prática, certificados com código de autenticidade, pontos, conquistas e ranking para engajar a equipe, e relatórios para acompanhar a evolução de todos.',
    visual: 'Cartão "O que é a plataforma" com seis tópicos que entram um a um, sincronizados com a fala.',
    sons: 'Leve "pop" a cada tópico.',
    acao: async (d) => {
      d.cartao({
        etiqueta: 'O que é a plataforma', titulo: 'Seu desenvolvimento, em um só lugar',
        topicos: ['Cursos com vídeo e materiais', 'Trilhas de aprendizagem', 'Quizzes de prática', 'Certificados com validação', 'Pontos, conquistas e ranking', 'Relatórios de acompanhamento'],
      });
    },
  },
  {
    id: 'perfis', cap: 'abertura', tela: 'Cartão "Dois perfis"',
    texto: 'A plataforma tem dois perfis. O administrador cria e organiza os cursos e as trilhas, cuida dos usuários e acompanha os resultados. O aluno é todo colaborador: ele faz os cursos, acompanha o próprio progresso e conquista seus certificados. Vamos começar pela visão do administrador e, depois, ver tudo pelos olhos do aluno.',
    visual: 'Cartão "Dois perfis": tópicos "Administrador — cria, organiza e acompanha" e "Aluno — aprende, evolui e conquista certificados".',
    sons: 'Whoosh de transição ao final.',
    acao: async (d) => {
      d.cartao({
        etiqueta: 'Dois perfis', titulo: 'Quem usa a plataforma',
        topicos: ['Administrador: cria cursos e trilhas', 'Administrador: acompanha os resultados', 'Aluno: faz os cursos no seu ritmo', 'Aluno: ganha pontos e certificados'],
      });
    },
  },

  // ================================================================= PARTE 1 — ADMINISTRADOR
  {
    id: 'cap1', cap: 'adm1', tela: 'Cartão do Capítulo 1',
    texto: 'Parte um: o administrador. Capítulo um, o primeiro acesso.',
    visual: 'Cartão de capítulo: etiqueta "Parte 1 · Administrador", "CAPÍTULO 1", título "Primeiro acesso", subtítulo "Login, tutorial interativo e a tela inicial".',
    sons: 'Whoosh na entrada do cartão.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 1 · Administrador', numero: 'CAPÍTULO 1', titulo: 'Primeiro acesso', subtitulo: 'Login, tutorial interativo e a tela inicial' });
    },
  },
  {
    id: 'login', cap: 'adm1', tela: 'Tela de login',
    texto: 'Esta é a tela de entrada. À esquerda fica o formulário de acesso e, à direita, a arte da marca. Neste botão, no alto, você escolhe o idioma: português, inglês ou espanhol.',
    visual: 'Cartão some revelando o login. Destaque no formulário com o rótulo "Formulário de acesso"; depois destaque no botão de idioma (🌐 PT) com o rótulo "Idioma".',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(900);
      d.destacar('.auth-card form', 'Formulário de acesso');
      await d.noTempo(0.55);
      d.limpar();
      d.destacar('.auth-logo .pill-button', 'Idioma');
      await d.moverPara('.auth-logo .pill-button');
    },
  },
  {
    id: 'login-links', cap: 'adm1', tela: 'Tela de login — links',
    texto: 'Se você esquecer a senha, é só clicar em "Esqueci minha senha" para receber um link de redefinição por e-mail. E quem ainda não tem conta pode se cadastrar sozinho, em "Cadastre-se": todo novo cadastro entra como aluno.',
    visual: 'Destaque em "Esqueci minha senha"; depois em "Cadastre-se". Chamada no canto: "Autocadastro — novos usuários entram como Aluno".',
    acao: async (d) => {
      d.limpar();
      d.destacar('.auth-forgot a', 'Recuperar senha');
      await d.moverPara('.auth-forgot a');
      await d.noTempo(0.5);
      d.limpar();
      d.destacar('.auth-switch a', 'Criar conta');
      await d.moverPara('.auth-switch a');
      d.chamada('Autocadastro', 'Todo novo cadastro entra como Aluno.', '👤');
    },
  },
  {
    id: 'login-entrar', cap: 'adm1', tela: 'Tela de login — entrando',
    texto: 'Vamos entrar com a conta de administradora da Ana. Digitamos o e-mail, depois a senha, e clicamos em Entrar.',
    visual: 'Cursor clica no campo de e-mail e digita; depois a senha; clique em "Entrar".',
    sons: 'Teclas suaves durante a digitação; clique no botão.',
    acao: async (d) => {
      d.limpar();
      d.chamada(null);
      await d.digitar('.auth-card input[type="email"]', ADMIN.email);
      await d.digitar('.auth-card input[type="password"]', ADMIN.senha);
      await d.clicar('.auth-card button[type="submit"]');
    },
  },
  {
    id: 'tutorial-adm', cap: 'adm1', tela: 'Tutorial interativo (primeiro acesso)',
    texto: 'No primeiro acesso, a plataforma abre sozinha um tutorial interativo, no estilo de um videogame. A tela escurece e só o elemento da vez fica iluminado, com uma explicação ao lado e o progresso das missões.',
    visual: 'O tutorial abre sozinho com "Bem-vindo(a)!". Cursor clica em "Começar"; aparece a missão 2 iluminando o menu.',
    acao: async (d) => {
      await d.aguardar('.tutorial-balao', 8000);
      await d.noTempo(0.45);
      await d.clicar('.tutorial-nav .btn-primary');
    },
  },
  {
    id: 'tutorial-adm-2', cap: 'adm1', tela: 'Tutorial interativo — pulando',
    texto: 'Em alguns passos, ele pede que você mesmo faça a ação, como abrir um curso ou um menu, e só avança quando você conclui. Dá para pular quando quiser e rever o tutorial depois, pelo menu do seu nome. Por agora, vamos pular, para conhecer tudo com calma.',
    visual: 'Cursor avança duas missões com "Próximo" e depois clica em "Pular tutorial".',
    acao: async (d) => {
      await d.esperar(1200);
      await d.clicar('.tutorial-nav .btn-primary');
      await d.esperar(2600);
      await d.clicar('.tutorial-nav .btn-primary');
      await d.noTempo(0.82);
      await d.clicar('.tutorial-pular');
      if (await d.existe('.tutorial-balao')) await d.clicar('.tutorial-pular');
    },
  },
  {
    id: 'menu-adm', cap: 'adm1', tela: 'Tela inicial — menu lateral',
    texto: 'Esta é a tela inicial. À esquerda fica o menu principal. Em "Aprender", estão os Cursos e o Ranking. Em "Gestão", que só o administrador vê, ficam os Relatórios e a Administração.',
    visual: 'Zoom suave no menu lateral. Destaques em sequência: "Aprender" (Cursos e Ranking) e "Gestão" (Relatórios e Administração).',
    acao: async (d) => {
      await d.aguardar('[data-tour="menu"]');
      await d.rolarPara(0);
      await d.zoom('[data-tour="menu"]', 1.45);
      d.destacar('[data-tour="menu"]', 'Menu principal');
      await d.noTempo(0.45);
      d.limpar();
      d.destacar('[data-tour="nav-ranking"]', 'Aprender');
      await d.noTempo(0.7);
      d.limpar();
      d.destacar('[data-tour="nav-admin"]', 'Gestão — só o administrador');
      await d.noTempo(0.97);
      d.limpar();
      await d.zoom(null);
    },
  },
  {
    id: 'topo-adm', cap: 'adm1', tela: 'Tela inicial — topo e menu da conta',
    texto: 'No topo, você troca o idioma e o tema: escuro, claro ou o mesmo do seu sistema. E clicando no seu nome, abre o menu da conta, onde dá para alterar o nome de exibição, rever o tutorial ou sair.',
    visual: 'Destaque em idioma e tema. Cursor clica no nome da Ana; o menu da conta abre com "Alterar meu nome", "Ver tutorial novamente" e "Sair".',
    acao: async (d) => {
      d.destacar('[data-tour="preferencias"]', 'Idioma e tema');
      await d.moverPara('[data-tour="preferencias"]');
      await d.noTempo(0.42);
      d.limpar();
      await d.clicar('[data-tour="conta"]');
      await d.esperar(400);
      d.destacar('.dropdown-menu', 'Menu da conta');
      await d.noTempo(0.97);
      d.limpar();
      await d.tecla('Escape');
    },
  },
  {
    id: 'painel-adm', cap: 'adm1', tela: 'Tela inicial — treinamentos e Primeiros passos',
    texto: 'No centro, o administrador vê todos os treinamentos da plataforma: as trilhas e os cursos, cada um com sua capa. E o cartão "Primeiros passos" traz missões que vão se marcando sozinhas conforme você usa o sistema. Algumas já aparecem concluídas, porque esta plataforma já tem cursos e trilhas cadastrados.',
    visual: 'Rolagem suave pelo painel: destaque na faixa de trilhas e na grade de cursos; depois no cartão "Primeiros passos".',
    acao: async (d) => {
      await d.rolar('[data-tour="cursos"]', 'start');
      d.destacar('[data-tour="cursos"] .card-grid', 'Todos os cursos');
      await d.noTempo(0.5);
      d.limpar();
      await d.rolar('.missoes', 'center');
      d.destacar('.missoes', 'Primeiros passos');
      await d.noTempo(0.97);
      d.limpar();
    },
  },

  // ---- Capítulo 2 — curso
  {
    id: 'cap2', cap: 'adm2', tela: 'Cartão do Capítulo 2',
    texto: 'Capítulo dois: criando um curso, do zero até a publicação.',
    visual: 'Cartão: "CAPÍTULO 2 — Criando um curso", subtítulo "Informações, capa, aulas, materiais e quiz".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 1 · Administrador', numero: 'CAPÍTULO 2', titulo: 'Criando um curso', subtitulo: 'Informações, capa, aulas, materiais e quiz' });
    },
  },
  {
    id: 'admin-lista', cap: 'adm2', tela: 'Administração → Cursos',
    texto: 'Para criar conteúdo, vamos até "Administração". Aqui ficam quatro abas: Cursos, Trilhas, Usuários e Configurações. Na aba Cursos, vemos a lista dos cursos já cadastrados, com a carga horária e as ações de editar e excluir.',
    visual: 'Cartão some; cursor clica em "Administração" no menu. Destaque nas abas; depois na tabela de cursos.',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(700);
      await d.clicar('[data-tour="nav-admin"]');
      await d.aguardar('.admin-tabs');
      d.destacar('.admin-tabs', 'Abas da Administração');
      await d.noTempo(0.5);
      d.limpar();
      d.destacar('.data-table', 'Cursos cadastrados');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'novo-curso', cap: 'adm2', tela: 'Novo curso — etapas',
    texto: 'Clicamos em "Novo curso". O cadastro é dividido em três etapas: Informações, Aulas e materiais, e Quiz. Repare que as duas últimas estão bloqueadas: elas são liberadas assim que o curso é salvo pela primeira vez.',
    visual: 'Clique em "Novo curso". Zoom nas etapas; destaque nas abas bloqueadas (cadeado) com o rótulo "Liberadas depois de salvar".',
    acao: async (d) => {
      await d.clicar('[data-tour="novo-curso"]');
      await d.aguardar('.form-steps');
      await d.noTempo(0.3);
      await d.zoom('.form-steps', 1.5);
      d.destacar('.form-steps', 'Três etapas');
      await d.noTempo(0.65);
      d.limpar();
      d.destacar('.form-step:disabled', 'Liberadas depois de salvar');
      await d.noTempo(0.97);
      d.limpar();
      await d.zoom(null);
    },
  },
  {
    id: 'capa-galeria', cap: 'adm2', tela: 'Novo curso — imagem de capa',
    texto: 'Começamos pela imagem de capa, que aparece nos cartões do curso. Você pode escolher uma das ilustrações prontas da galeria, ou enviar uma imagem do seu computador. Este curso será sobre escuta ativa, então vamos abrir a galeria e escolher a ilustração correspondente.',
    visual: 'Destaque na área "Imagem de capa". Clique em "Escolher da galeria": abre o pop-up com as ilustrações. Cursor escolhe "Escuta ativa"; a prévia aparece com o aviso "será aplicada quando você salvar".',
    acao: async (d) => {
      d.destacar('.capa-uploader', 'Imagem de capa');
      await d.noTempo(0.45);
      d.limpar();
      await d.clicar('.capa-uploader-botoes button');
      await d.aguardar('.galeria-item');
      await d.noTempo(0.8);
      await d.clicarTexto('.galeria-item', 'Escuta ativa');
    },
  },
  {
    id: 'campos', cap: 'adm2', tela: 'Novo curso — informações',
    texto: 'Agora, os dados do curso. O título é obrigatório. A descrição aparece na apresentação do curso para o aluno. E a carga horária, em horas, vai aparecer no cartão e no certificado.',
    visual: 'Digitação do título "Escuta Ativa na Prática", da descrição e da carga horária "3". Chamada: "Campo obrigatório: título".',
    sons: 'Teclas suaves.',
    acao: async (d) => {
      d.chamada('Obrigatório', 'O título é o único campo obrigatório.', '✳️');
      await d.digitar('.form-card label.form-grid-full input', 'Escuta Ativa na Prática');
      await d.digitar('.form-card textarea', 'Aprenda técnicas práticas de escuta ativa para melhorar o relacionamento com o cliente.', { rapido: true });
      await d.digitar('.form-card input[type="number"]', '3', { limpar: true });
      d.chamada(null);
    },
  },
  {
    id: 'prazo', cap: 'adm2', tela: 'Novo curso — prazo',
    texto: 'Se o curso tiver prazo, ligue esta chave e informe quantos dias o aluno tem para concluir. O prazo começa a contar no primeiro acesso dele. Depois disso, se não tiver terminado, o curso aparece como atrasado.',
    visual: 'Cursor liga a chave "Este curso tem prazo" e digita "30" dias. Destaque no texto de ajuda do prazo.',
    acao: async (d) => {
      await d.clicar('.switch');
      await d.aguardar('.prazo-campo input[type="number"]');
      await d.digitar('.prazo-campo input[type="number"]', '30');
      d.destacar('.prazo-campo', 'Prazo em dias');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'salvar-curso', cap: 'adm2', tela: 'Novo curso — salvar',
    texto: 'Tudo pronto. Ao clicar em Salvar, o curso é criado, a capa escolhida é aplicada e o sistema leva você direto para a próxima etapa: as aulas.',
    visual: 'Clique em "Salvar". Aviso verde "Salvo com sucesso" e troca automática para a aba "Aulas e materiais".',
    sons: 'Som de sucesso.',
    acao: async (d) => {
      await d.clicar('.form-card-footer .btn-primary');
      await d.aguardar('.aulas-manager > form.add-row', 8000);
      d.som('sucesso');
    },
  },
  {
    id: 'aulas', cap: 'adm2', tela: 'Aulas e materiais',
    texto: 'Cada curso é dividido em aulas, que o aluno faz em sequência. Digitamos o título da primeira aula e clicamos em "Adicionar aula". Vamos criar mais duas da mesma forma.',
    visual: 'Digitação de três aulas: "O que é escuta ativa", "Técnicas para ouvir de verdade" e "Escuta ativa no atendimento". Cada uma vira um cartão numerado.',
    sons: 'Teclas e cliques.',
    acao: async (d) => {
      for (const aula of ['O que é escuta ativa', 'Técnicas para ouvir de verdade', 'Escuta ativa no atendimento']) {
        await d.digitar('.aulas-manager > form.add-row input', aula, { rapido: true });
        await d.clicar('.aulas-manager > form.add-row .btn-primary');
        await d.esperar(500);
      }
    },
  },
  {
    id: 'aula-video', cap: 'adm2', tela: 'Aulas — vídeo e organização',
    texto: 'Cada aula vira um cartão numerado. Pelas setas, você muda a ordem, e pela lixeira, exclui. Aqui embaixo vai o link do vídeo da aula, que pode ser do YouTube, do Vimeo ou um arquivo de vídeo. Ao sair do campo, tudo é salvo automaticamente.',
    visual: 'Zoom no cartão da aula 1: destaque nas setas e na lixeira; depois no campo de vídeo, onde o cursor digita o link. Chamada: "Salvamento automático".',
    acao: async (d) => {
      await d.rolar('.aula-editor', 'start');
      d.destacar('.aula-editor .icon-actions', 'Ordem e exclusão');
      await d.noTempo(0.33);
      d.limpar();
      await d.digitar('.aula-editor input[type="url"]', 'https://videos.peexbrasil.com.br/escuta-ativa/aula-1.mp4', { rapido: true });
      await d.tecla('Tab');
      d.chamada('Salvamento automático', 'Aulas e materiais são salvos ao sair de cada campo.', '💾');
      await d.noTempo(0.97);
    },
  },
  {
    id: 'material', cap: 'adm2', tela: 'Aulas — materiais de apoio',
    texto: 'Também dá para anexar materiais de apoio, como apostilas em PDF ou apresentações. Damos um título, escolhemos o arquivo e clicamos em "Adicionar material". O aluno poderá baixá-lo durante a aula.',
    visual: 'Digitação do título "Guia de escuta ativa (PDF)", escolha do arquivo e clique em "Adicionar material". O material aparece na lista com os botões de baixar e excluir.',
    acao: async (d) => {
      d.chamada(null);
      await d.digitar('.add-row-material input:not([type="file"])', 'Guia de escuta ativa (PDF)', { rapido: true });
      await d.moverPara('.add-row-material .file-picker');
      await d.arquivo('.add-row-material input[type="file"]');
      d.som('clique');
      await d.esperar(600);
      await d.clicar('.add-row-material .btn');
      await d.esperar(700);
      d.destacar('.aula-editor .material-list', 'Material anexado');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'quiz', cap: 'adm2', tela: 'Quiz de prática',
    texto: 'Por último, o quiz de prática, que é opcional e aparece como a última etapa do curso. Adicionamos uma pergunta, escrevemos o enunciado e as alternativas. Para marcar a resposta certa, é só clicar no círculo ao lado dela.',
    visual: 'Clique na aba "Quiz", depois em "Adicionar pergunta". Digitação do enunciado e de três alternativas. Clique no círculo da alternativa correta, que fica verde.',
    acao: async (d) => {
      await d.rolarPara(0);
      await d.clicar('.form-step:nth-child(3)');
      await d.aguardar('.add-dashed');
      await d.clicar('.add-dashed');
      await d.digitar('.pergunta-editor textarea', 'Qual atitude demonstra escuta ativa?', { rapido: true });
      await d.digitar('.alternativa-editor:nth-child(1) input', 'Interromper para resolver mais rápido', { rapido: true });
      await d.digitar('.alternativa-editor:nth-child(2) input', 'Ouvir com atenção e confirmar o que entendeu', { rapido: true });
      await d.clicar('.pergunta-editor .btn-ghost');
      await d.digitar('.alternativa-editor:nth-child(3) input', 'Pensar na resposta enquanto o cliente fala', { rapido: true });
      await d.clicar('.alternativa-editor:nth-child(2) .alternativa-marcador');
    },
  },
  {
    id: 'quiz-regras', cap: 'adm2', tela: 'Quiz — regras e salvar',
    texto: 'O aluno pode responder quantas vezes quiser, mas o curso só é concluído quando ele acerta todas as perguntas. Não se esqueça de clicar em "Salvar quiz".',
    visual: 'Destaque na alternativa correta (verde). Chamada: "Tentativas ilimitadas — conclui ao acertar tudo". Clique em "Salvar quiz" e aviso de sucesso.',
    sons: 'Som de sucesso ao salvar.',
    acao: async (d) => {
      d.destacar('.alternativa-correta', 'Resposta certa');
      d.chamada('Regra do quiz', 'Tentativas ilimitadas. O curso conclui quando todas as respostas estão certas.', '🎯');
      await d.noTempo(0.6);
      d.limpar();
      await d.clicar('.quiz-builder .form-card-footer .btn-primary');
      await d.esperar(500);
      d.som('sucesso');
      d.chamada(null);
    },
  },
  {
    id: 'publicado', cap: 'adm2', tela: 'Curso publicado — Ver como aluno',
    texto: 'E o curso já está publicado. Na Central de Treinamentos não existe etapa de rascunho: assim que é salvo, o curso fica disponível para todos os colaboradores. Pelo botão "Ver como aluno", você confere exatamente o que eles vão ver. Para editar depois, é só voltar à lista e clicar em Editar. Para remover, em Excluir, sempre com uma confirmação antes.',
    visual: 'Destaque em "Ver como aluno" e clique: abre a página do curso com o índice de etapas. Chamada: "Sem rascunho — salvou, publicou".',
    acao: async (d) => {
      await d.rolarPara(0);
      d.chamada('Sem rascunho', 'Salvou, publicou: o curso já aparece para todos.', '🚀');
      d.destacar('.page-header a.btn', 'Ver como aluno');
      await d.noTempo(0.4);
      d.limpar();
      await d.clicar('.page-header a.btn');
      await d.aguardar('.curso-layout');
      await d.esperar(400);
      d.destacar('.curso-layout', 'Como o aluno vê');
      await d.noTempo(0.97);
      d.limpar();
      d.chamada(null);
    },
  },

  // ---- Capítulo 3 — trilha
  {
    id: 'cap3', cap: 'adm3', tela: 'Cartão do Capítulo 3',
    texto: 'Capítulo três: as trilhas. Uma trilha agrupa vários cursos em uma sequência pensada, por exemplo, para a integração de novos colaboradores ou para desenvolver uma competência. Ao concluir todos os cursos, o aluno ganha o certificado da trilha inteira e cinquenta pontos de bônus.',
    visual: 'Cartão: "CAPÍTULO 3 — Criando uma trilha", subtítulo "Cursos em sequência, com progresso e certificado próprio".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 1 · Administrador', numero: 'CAPÍTULO 3', titulo: 'Criando uma trilha', subtitulo: 'Cursos em sequência, com progresso e certificado próprio' });
    },
  },
  {
    id: 'nova-trilha', cap: 'adm3', tela: 'Administração → Trilhas → Nova trilha',
    texto: 'Em Administração, na aba Trilhas, clicamos em "Nova trilha". Como no curso, escolhemos uma capa da galeria, damos um título e uma descrição.',
    visual: 'Clique em "Administração", aba "Trilhas", "Nova trilha". Galeria: "Jornada do cliente". Digitação do título "Jornada de Atendimento ao Cliente" e da descrição.',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(700);
      await d.clicar('[data-tour="nav-admin"]');
      await d.aguardar('.admin-tabs');
      await d.clicarTexto('.admin-tabs a', 'Trilhas');
      await d.esperar(500);
      await d.clicarTexto('.page-header a.btn', 'Nova trilha');
      await d.aguardar('.capa-uploader');
      await d.clicar('.capa-uploader-botoes button');
      await d.aguardar('.galeria-item');
      await d.esperar(700);
      await d.clicarTexto('.galeria-item', 'Jornada do cliente');
      await d.digitar('.form-card label.form-grid-full input', 'Jornada de Atendimento ao Cliente', { rapido: true });
      await d.digitar('.form-card textarea', 'Do primeiro contato à fidelização: comunicação e escuta ativa no atendimento.', { rapido: true });
    },
  },
  {
    id: 'trilha-cursos', cap: 'adm3', tela: 'Nova trilha — cursos e ordem',
    texto: 'Agora, os cursos da trilha. À esquerda ficam os cursos disponíveis. Clicando no sinal de mais, eles passam para a direita, já na ordem em que o aluno deve fazê-los. Pelas setas, você ajusta essa ordem.',
    visual: 'Rolagem até "Cursos desta trilha". Cursor adiciona "Fundamentos de Atendimento ao Cliente", "Comunicação Efetiva no Trabalho" e "Escuta Ativa na Prática"; depois sobe "Escuta Ativa" uma posição com a seta.',
    acao: async (d) => {
      await d.rolar('.trilha-picker', 'center');
      d.destacar('.trilha-picker-column:first-child', 'Disponíveis');
      await d.esperar(1400);
      d.limpar();
      for (const curso of ['Fundamentos de Atendimento', 'Comunicação Efetiva', 'Escuta Ativa']) {
        await d.clicarTexto('.trilha-picker-add', curso);
        await d.esperar(450);
      }
      d.destacar('.trilha-picker-list-selecionados', 'Ordem do aluno');
      await d.esperar(900);
      d.limpar();
      await d.clicar('.trilha-picker-list-selecionados li:nth-child(3) .icon-button:first-child');
      await d.esperar(400);
    },
  },
  {
    id: 'trilha-salvar', cap: 'adm3', tela: 'Nova trilha — salvar',
    texto: 'Clicamos em Salvar, e a trilha já aparece para todos os alunos no painel, com o progresso de cada um.',
    visual: 'Clique em "Salvar"; aviso de sucesso.',
    sons: 'Som de sucesso.',
    acao: async (d) => {
      await d.clicar('.form-card-footer-solto .btn-primary');
      await d.esperar(900);
      d.som('sucesso');
      d.aviso('Trilha publicada');
    },
  },

  // ---- Capítulo 4 — usuários, relatórios e configurações
  {
    id: 'cap4', cap: 'adm4', tela: 'Cartão do Capítulo 4',
    texto: 'Capítulo quatro: usuários, relatórios e configurações.',
    visual: 'Cartão: "CAPÍTULO 4 — Usuários, relatórios e configurações", subtítulo "Acompanhe a equipe e ajuste a plataforma".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 1 · Administrador', numero: 'CAPÍTULO 4', titulo: 'Usuários, relatórios e configurações', subtitulo: 'Acompanhe a equipe e ajuste a plataforma' });
    },
  },
  {
    id: 'usuarios', cap: 'adm4', tela: 'Administração → Usuários',
    texto: 'Na aba Usuários ficam todas as pessoas cadastradas, com nome, e-mail e papel. O papel define o que cada um pode fazer: aluno ou administrador. Para dar acesso de administrador a alguém, basta trocar o papel aqui.',
    visual: 'Clique em "Administração", aba "Usuários". Destaque na tabela; depois na coluna "Papel" de uma pessoa, com o rótulo "Aluno ou Administrador".',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(700);
      await d.clicar('[data-tour="nav-admin"]');
      await d.aguardar('.admin-tabs');
      await d.clicarTexto('.admin-tabs a', 'Usuários');
      await d.aguardar('.data-table');
      d.destacar('.data-table', 'Pessoas cadastradas');
      await d.noTempo(0.45);
      d.limpar();
      d.marcarLinha('Mariana', 'linha-mariana');
      d.destacar('[data-dir="linha-mariana"] select', 'Aluno ou Administrador');
      await d.moverPara('[data-dir="linha-mariana"] select');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'progresso', cap: 'adm4', tela: 'Usuários — Ver progresso',
    texto: 'Em "Ver progresso", você acompanha, curso a curso, a situação de cada pessoa: não iniciado, em andamento ou concluído, com as datas de início e de conclusão.',
    visual: 'Clique em "Ver progresso" da Mariana: abre o pop-up com o status de cada curso e as datas. Fecha no final.',
    acao: async (d) => {
      await d.clicarTexto('[data-dir="linha-mariana"] button', 'Ver progresso');
      await d.aguardar('.modal-card');
      await d.noTempo(0.95);
      await d.clicar('.modal-header .icon-button');
    },
  },
  {
    id: 'redefinir', cap: 'adm4', tela: 'Usuários — Redefinir tutorial e Excluir',
    texto: 'O botão "Redefinir tutorial" faz o tutorial interativo abrir de novo na próxima vez que a pessoa entrar. E "Excluir" remove o usuário por completo, com todo o progresso, depois de uma confirmação. Por segurança, não é possível excluir a própria conta nem o último administrador.',
    visual: 'Destaque em "Redefinir tutorial"; depois em "Excluir". Chamada: "Exclusão é definitiva".',
    acao: async (d) => {
      d.destacar('[data-dir="linha-mariana"] .table-actions button:first-child', 'Redefinir tutorial');
      await d.moverPara('[data-dir="linha-mariana"] .table-actions button:first-child');
      await d.noTempo(0.4);
      d.limpar();
      d.destacar('[data-dir="linha-mariana"] .btn-danger', 'Excluir');
      await d.moverPara('[data-dir="linha-mariana"] .btn-danger');
      d.chamada('Atenção', 'A exclusão remove a conta e todo o progresso, e não pode ser desfeita.', '⚠️');
      await d.noTempo(0.97);
      d.limpar();
      d.chamada(null);
    },
  },
  {
    id: 'relatorios', cap: 'adm4', tela: 'Relatórios — indicadores',
    texto: 'Em Relatórios, o administrador acompanha os resultados de toda a equipe: a taxa de conclusão, o tempo médio para concluir um curso e a nota média nos quizzes.',
    visual: 'Clique em "Relatórios" no menu. Zoom nos três indicadores.',
    acao: async (d) => {
      await d.clicar('[data-tour="nav-relatorios"]');
      await d.aguardar('.kpi-grid');
      await d.noTempo(0.25);
      await d.zoom('.kpi-grid', 1.4);
      d.destacar('.kpi-grid', 'Indicadores');
      await d.noTempo(0.97);
      d.limpar();
      await d.zoom(null);
    },
  },
  {
    id: 'relatorios-2', cap: 'adm4', tela: 'Relatórios — filtros, colaboradores e exportação',
    texto: 'Os indicadores podem ser filtrados por período e por curso. Logo abaixo, a lista de colaboradores mostra quantos cursos cada um concluiu, com acesso ao progresso detalhado. E o botão "Exportar CSV" gera uma planilha com todos os dados, pronta para abrir no Excel.',
    visual: 'Destaques em sequência: filtros, tabela de colaboradores e o botão "Exportar CSV" (clique, com aviso "Planilha exportada").',
    acao: async (d) => {
      d.destacar('.filters-bar', 'Filtros');
      await d.noTempo(0.28);
      d.limpar();
      await d.rolar('.data-table', 'center');
      d.destacar('.data-table', 'Colaboradores');
      await d.noTempo(0.62);
      d.limpar();
      await d.rolarPara(0);
      await d.clicar('.page-header .btn');
      d.aviso('Planilha exportada');
    },
  },
  {
    id: 'config', cap: 'adm4', tela: 'Administração → Configurações',
    texto: 'Por fim, em Configurações, você pode ligar ou desligar o ranking. Ao desligar, os pontos, as conquistas e a página de ranking somem para todo mundo. Repare: o Ranking saiu do menu na mesma hora. Vamos ligar de novo.',
    visual: 'Clique em "Administração", aba "Configurações". Cursor desmarca "Ranking habilitado": o item "Ranking" some do menu (destaque no menu). Depois marca de novo.',
    acao: async (d) => {
      await d.clicar('[data-tour="nav-admin"]');
      await d.aguardar('.admin-tabs');
      await d.clicarTexto('.admin-tabs a', 'Configurações');
      await d.aguardar('.checkbox-label input');
      d.destacar('.form.card', 'Ranking');
      await d.noTempo(0.3);
      d.limpar();
      await d.clicar('.checkbox-label input');
      await d.esperar(600);
      d.destacar('[data-tour="menu"]', 'Ranking saiu do menu');
      await d.noTempo(0.85);
      d.limpar();
      await d.clicar('.checkbox-label input');
    },
  },
  {
    id: 'fim-adm', cap: 'adm4', tela: 'Saindo da conta',
    texto: 'Pronto! Agora você já sabe administrar a plataforma. Vamos sair da conta e ver tudo pelos olhos do aluno.',
    visual: 'Cursor abre o menu do nome e clica em "Sair": volta para a tela de login.',
    acao: async (d) => {
      await d.esperar(500);
      await d.clicar('[data-tour="conta"]');
      await d.esperar(500);
      await d.clicarTexto('.dropdown-item', 'Sair');
    },
  },

  // ================================================================= PARTE 2 — ALUNO
  {
    id: 'cap5', cap: 'alu1', tela: 'Cartão do Capítulo 5',
    texto: 'Parte dois: o aluno. Capítulo cinco, o primeiro acesso.',
    visual: 'Cartão: etiqueta "Parte 2 · Aluno", "CAPÍTULO 5 — Primeiro acesso do aluno", subtítulo "Login e o tutorial interativo, do início ao fim".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 2 · Aluno', numero: 'CAPÍTULO 5', titulo: 'Primeiro acesso do aluno', subtitulo: 'Login e o tutorial interativo, do início ao fim' });
    },
  },
  {
    id: 'login-aluno', cap: 'alu1', tela: 'Login do aluno',
    texto: 'O Lucas é colaborador e já tem acesso à plataforma. Ele entra com o próprio e-mail e a senha, do mesmo jeito.',
    visual: 'Cartão some; digitação do e-mail do Lucas e da senha; clique em "Entrar".',
    sons: 'Teclas e clique.',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(800);
      await d.digitar('.auth-card input[type="email"]', ALUNO.email, { rapido: true });
      await d.digitar('.auth-card input[type="password"]', ALUNO.senha, { rapido: true });
      await d.clicar('.auth-card button[type="submit"]');
    },
  },
  {
    id: 'tut-1', cap: 'alu1', tela: 'Tutorial interativo — início',
    texto: 'Como é o primeiro acesso do Lucas, o tutorial interativo começa. Desta vez, vamos segui-lo até o fim, como em um jogo. Primeiro, ele apresenta o menu, o curso em destaque e a lista de cursos.',
    visual: 'Tutorial abre sozinho. Cursor clica em "Começar" e avança pelas missões do menu, do destaque e da lista de cursos.',
    acao: async (d) => {
      await d.aguardar('.tutorial-balao', 8000);
      await d.esperar(2600);
      await d.clicar('.tutorial-nav .btn-primary');
      for (let i = 0; i < 3; i++) {
        await d.esperar(2300);
        await d.clicar('.tutorial-nav .btn-primary');
      }
    },
  },
  {
    id: 'tut-2', cap: 'alu1', tela: 'Tutorial interativo — missão de ação',
    texto: 'Agora vem uma missão: clicar no curso destacado. O anel pulsando mostra exatamente onde clicar. Quando a ação é feita, o tutorial comemora e segue em frente, já dentro do curso.',
    visual: 'Missão "Abra um curso": anel pulsante no cartão. Cursor clica no cartão iluminado; aparece "Mandou bem!" e o tutorial continua na página do curso (índice e botão Avançar).',
    sons: 'Som de sucesso ao concluir a missão.',
    acao: async (d) => {
      await d.aguardar('.tutorial-anel-acao', 8000);
      await d.noTempo(0.45);
      await d.clicarAnel();
      d.som('sucesso');
      for (let i = 0; i < 2; i++) {
        await d.esperar(2600);
        await d.clicar('.tutorial-nav .btn-primary');
      }
    },
  },
  {
    id: 'tut-3', cap: 'alu1', tela: 'Tutorial interativo — ranking, preferências e conta',
    texto: 'Depois, ele ensina a chegar ao ranking, a trocar o idioma e o tema, e a abrir o menu da conta, sempre esperando que o próprio aluno faça cada ação.',
    visual: 'Missões de ação: clicar em "Ranking" no menu, avançar, e por fim clicar no próprio nome.',
    acao: async (d) => {
      await d.aguardar('.tutorial-anel-acao', 8000);
      await d.esperar(1500);
      await d.clicarAnel();
      d.som('sucesso');
      await d.esperar(2400);
      await d.clicar('.tutorial-nav .btn-primary');
      await d.esperar(2200);
      await d.clicar('.tutorial-nav .btn-primary');
      await d.aguardar('.tutorial-anel-acao', 8000);
      await d.esperar(1200);
      await d.clicarAnel();
      d.som('sucesso');
    },
  },
  {
    id: 'tut-fim', cap: 'alu1', tela: 'Tutorial interativo — vitória',
    texto: 'Missão cumprida! No final, uma tela de vitória celebra a conclusão e leva o aluno de volta ao painel, pronto para começar.',
    visual: 'Tela de vitória com troféu e confetes; cursor clica em "Bora começar" e volta ao painel.',
    sons: 'Fanfarra curta de vitória.',
    acao: async (d) => {
      await d.aguardar('.tutorial-vitoria', 8000);
      d.som('vitoria');
      await d.noTempo(0.8);
      await d.clicar('.tutorial-vitoria .btn-primary');
    },
  },

  // ---- Capítulo 6 — painel
  {
    id: 'cap6', cap: 'alu2', tela: 'Cartão do Capítulo 6',
    texto: 'Capítulo seis: o painel do aluno.',
    visual: 'Cartão: "CAPÍTULO 6 — O painel do aluno", subtítulo "O que fazer agora, pontos, missões e cursos".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 2 · Aluno', numero: 'CAPÍTULO 6', titulo: 'O painel do aluno', subtitulo: 'O que fazer agora, pontos, missões e cursos' });
    },
  },
  {
    id: 'painel-destaque', cap: 'alu2', tela: 'Painel — destaque do topo',
    texto: 'No topo do painel fica o destaque: o curso mais importante para o aluno neste momento. Como o Lucas está com o curso de Segurança da Informação atrasado, ele aparece aqui, com o aviso de prazo vencido e o botão para continuar de onde parou.',
    visual: 'Cartão some; zoom no destaque do topo. Destaque no aviso "Prazo vencido" e no botão "Continuar curso".',
    acao: async (d) => {
      d.fecharCartao();
      await d.rolarPara(0);
      await d.aguardar('[data-tour="destaque"]');
      await d.esperar(600);
      await d.zoom('[data-tour="destaque"]', 1.3);
      d.destacar('.hero-eyebrow', 'Prazo vencido');
      await d.noTempo(0.6);
      d.limpar();
      d.destacar('.hero-actions .btn-primary', 'Continuar de onde parou');
      await d.noTempo(0.97);
      d.limpar();
      await d.zoom(null);
    },
  },
  {
    id: 'painel-pontos', cap: 'alu2', tela: 'Painel — pontos e conquistas',
    texto: 'Ao lado ficam os pontos, a posição no ranking e as conquistas. Cada curso concluído vale dez pontos, cada pergunta de quiz acertada pela primeira vez vale dois, e concluir uma trilha inteira dá cinquenta pontos de bônus.',
    visual: 'Destaque no cartão de gamificação. Chamada: "+10 por curso · +2 por acerto no quiz · +50 por trilha".',
    acao: async (d) => {
      d.destacar('.gamificacao-widget', 'Pontos e conquistas');
      d.chamada('Como ganhar pontos', '+10 por curso concluído · +2 por acerto no quiz · +50 por trilha completa', '⭐');
      await d.noTempo(0.97);
      d.limpar();
      d.chamada(null);
    },
  },
  {
    id: 'painel-missoes', cap: 'alu2', tela: 'Painel — Primeiros passos',
    texto: 'O cartão "Primeiros passos" mostra as missões de início, que vão se marcando sozinhas. Repare que o Lucas já cumpriu algumas: fez o tutorial e visitou o ranking.',
    visual: 'Rolagem até "Primeiros passos"; destaque no cartão e nas missões já concluídas (riscadas, com visto verde).',
    acao: async (d) => {
      await d.rolar('.missoes', 'center');
      d.destacar('.missoes', 'Primeiros passos');
      await d.noTempo(0.5);
      d.limpar();
      d.destacar('.missao-feita', 'Missões cumpridas');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'painel-cursos', cap: 'alu2', tela: 'Painel — trilhas, cursos e filtros',
    texto: 'Mais abaixo, as trilhas, com a barra de progresso de cada uma, e todos os cursos, com capa, carga horária e situação. Os filtros ajudam a encontrar rápido o que está em andamento, o que ainda não começou e o que já foi concluído. E a busca, no topo, procura pelo nome do curso.',
    visual: 'Rolagem pelas trilhas e pelos cursos. Cursor clica nos filtros "Não iniciado" e depois "Todos". Destaque na busca.',
    acao: async (d) => {
      await d.rolar('.trilha-row', 'center');
      d.destacar('.trilha-row', 'Trilhas');
      await d.noTempo(0.25);
      d.limpar();
      await d.rolar('[data-tour="cursos"]', 'start');
      await d.noTempo(0.42);
      await d.clicarTexto('.filter-tab', 'Não iniciado');
      await d.esperar(1500);
      await d.clicarTexto('.filter-tab', 'Todos');
      await d.rolarPara(0);
      d.destacar('.search-input', 'Busca');
      await d.noTempo(0.97);
      d.limpar();
    },
  },

  // ---- Capítulo 7 — fazendo um curso
  {
    id: 'cap7', cap: 'alu3', tela: 'Cartão do Capítulo 7',
    texto: 'Capítulo sete: fazendo um curso, do início ao certificado.',
    visual: 'Cartão: "CAPÍTULO 7 — Fazendo um curso", subtítulo "Aulas, materiais, quiz e certificado".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 2 · Aluno', numero: 'CAPÍTULO 7', titulo: 'Fazendo um curso', subtitulo: 'Aulas, materiais, quiz e certificado' });
    },
  },
  {
    id: 'abrir-curso', cap: 'alu3', tela: 'Abrindo o curso',
    texto: 'Vamos fazer o curso que a Ana acabou de criar: Escuta Ativa na Prática. No cabeçalho estão as informações principais: carga horária, número de aulas, o prazo, porque este curso tem trinta dias para ser concluído, e a situação atual.',
    visual: 'Cartão some; cursor clica no cartão "Escuta Ativa na Prática". Zoom no cabeçalho do curso com destaque nos chips de informação.',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(600);
      await d.rolar('[data-tour="cursos"]', 'start');
      await d.clicarTexto('.course-card', 'Escuta Ativa');
      await d.aguardar('.detalhe-header');
      await d.noTempo(0.35);
      await d.zoom('.detalhe-header', 1.3);
      d.destacar('.meta-chips', 'Carga horária, aulas, prazo e situação');
      await d.noTempo(0.97);
      d.limpar();
      await d.zoom(null);
    },
  },
  {
    id: 'curso-indice', cap: 'alu3', tela: 'Curso — conteúdo e apresentação',
    texto: 'À esquerda fica o conteúdo do curso, etapa por etapa: apresentação, aulas, quiz e certificado. As etapas seguintes ficam com cadeado e vão sendo liberadas conforme o aluno avança, mas ele sempre pode voltar às que já fez. Começamos pela apresentação e clicamos em Avançar.',
    visual: 'Destaque no índice "Conteúdo do curso" e nos cadeados. Clique em "Avançar".',
    acao: async (d) => {
      d.destacar('[data-tour="indice"]', 'Conteúdo do curso');
      await d.noTempo(0.45);
      d.limpar();
      d.destacar('.step-item:disabled', 'Liberadas conforme avança');
      await d.noTempo(0.82);
      d.limpar();
      await d.clicar('[data-tour="avancar"]');
    },
  },
  {
    id: 'aula', cap: 'alu3', tela: 'Curso — aula com vídeo e material',
    texto: 'Cada aula traz o vídeo e, logo abaixo, os materiais de apoio para baixar. Basta clicar em Baixar, e o arquivo vai para o seu computador.',
    visual: 'Destaque no vídeo da aula; depois no material "Guia de escuta ativa (PDF)". Clique em "Baixar" com aviso "Material baixado".',
    acao: async (d) => {
      await d.aguardar('.aula-video-wrapper');
      d.destacar('.aula-video-wrapper', 'Vídeo da aula');
      await d.noTempo(0.45);
      d.limpar();
      await d.rolar('.material-list', 'center');
      d.destacar('.material-list', 'Materiais de apoio');
      await d.esperar(800);
      d.limpar();
      await d.clicar('.material-list .btn');
      d.aviso('Material baixado', '⬇');
    },
  },
  {
    id: 'avancar-aulas', cap: 'alu3', tela: 'Curso — concluindo as aulas',
    texto: 'Terminou a aula? É só clicar em Avançar. A aula é marcada como concluída, ganha um visto no conteúdo do curso, e a próxima é liberada. A barra de progresso no topo acompanha cada passo.',
    visual: 'Cursor clica em "Avançar" três vezes; os vistos aparecem no índice e a barra "aulas concluídas" avança.',
    sons: 'Clique a cada avanço.',
    acao: async (d) => {
      await d.rolarPara(0);
      for (let i = 0; i < 3; i++) {
        await d.esperar(1100);
        await d.clicar('[data-tour="avancar"]');
        await d.esperar(500);
      }
      d.destacar('[data-tour="indice"]', 'Aulas concluídas');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'quiz-aluno', cap: 'alu3', tela: 'Curso — quiz de prática',
    texto: 'Depois das aulas, vem o quiz. Se o aluno erra, o sistema avisa na hora, e ele pode tentar de novo, sem limite. Ao acertar todas as perguntas, o curso é concluído automaticamente.',
    visual: 'Cursor escolhe uma alternativa errada e clica em "Responder": aparece "Incorreto." em vermelho. Escolhe a certa: "Correto!" em verde.',
    sons: 'Som de erro suave; depois som de acerto.',
    acao: async (d) => {
      await d.aguardar('.quiz-question');
      await d.esperar(600);
      await d.clicarTexto('.quiz-option', 'Interromper');
      await d.clicar('.quiz-question .btn-secondary');
      await d.esperar(500);
      d.som('erro');
      await d.noTempo(0.5);
      await d.clicarTexto('.quiz-option', 'Ouvir com atenção');
      await d.clicar('.quiz-question .btn-secondary');
      await d.esperar(400);
      d.som('sucesso');
    },
  },
  {
    id: 'certificado', cap: 'alu3', tela: 'Curso concluído — certificado',
    texto: 'E aqui está a recompensa: o curso concluído e o certificado. Ele sai em PDF, com o nome do aluno, o curso, a carga horária, a data e um código de validação com QR code. E fica disponível para baixar sempre que o aluno quiser.',
    visual: 'Etapa "Curso concluído!" com o ícone de certificado. Clique em "Baixar certificado": o certificado em PDF aparece em tela cheia.',
    sons: 'Fanfarra curta de conquista.',
    acao: async (d) => {
      await d.aguardar('.certificado-step', 10000);
      d.som('vitoria');
      d.destacar('.certificado-step', 'Curso concluído!');
      await d.noTempo(0.22);
      d.limpar();
      await d.clicar('.certificado-step .btn-primary');
      d.imagem('certificado', 'Certificado de conclusão em PDF');
      await d.noTempo(0.97);
      d.imagem(null);
    },
  },

  // ---- Capítulo 8 — trilhas, ranking e conta
  {
    id: 'cap8', cap: 'alu4', tela: 'Cartão do Capítulo 8',
    texto: 'Capítulo oito: trilhas, ranking e a sua conta.',
    visual: 'Cartão: "CAPÍTULO 8 — Trilhas, ranking e conta", subtítulo "Progresso, conquistas e preferências".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Parte 2 · Aluno', numero: 'CAPÍTULO 8', titulo: 'Trilhas, ranking e conta', subtitulo: 'Progresso, conquistas e preferências' });
    },
  },
  {
    id: 'volta-painel', cap: 'alu4', tela: 'Painel após concluir',
    texto: 'De volta ao painel, o curso aparece como concluído, os pontos subiram e uma nova conquista foi desbloqueada: Nota Máxima, por acertar todo o quiz.',
    visual: 'Cartão some; clique em "Cursos" no menu. Destaque nos pontos e na nova conquista.',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(600);
      await d.clicar('a[href="/cursos"]');
      await d.aguardar('.gamificacao-widget');
      await d.esperar(500);
      await d.zoom('.gamificacao-widget', 1.35);
      d.destacar('.gamificacao-widget', 'Pontos e nova conquista');
      await d.noTempo(0.97);
      d.limpar();
      await d.zoom(null);
    },
  },
  {
    id: 'trilha-aluno', cap: 'alu4', tela: 'Trilha — linha do tempo',
    texto: 'Nas trilhas, os cursos aparecem em uma linha do tempo numerada. Os concluídos ganham um visto, e o próximo curso a fazer fica em destaque, com o botão Começar ou Continuar. Quando todos estiverem concluídos, o certificado da trilha aparece aqui mesmo.',
    visual: 'Cursor clica na trilha "Jornada de Atendimento ao Cliente". Destaque no curso concluído (visto verde) e no próximo curso em destaque.',
    acao: async (d) => {
      await d.rolar('.trilha-row', 'center');
      await d.clicarTexto('.trilha-tile', 'Jornada');
      await d.aguardar('.trilha-timeline');
      await d.esperar(500);
      d.destacar('.timeline-item-ok', 'Concluído');
      await d.noTempo(0.4);
      d.limpar();
      d.destacar('.timeline-item-proximo', 'Próximo curso');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'ranking', cap: 'alu4', tela: 'Ranking',
    texto: 'No Ranking, o aluno vê a própria posição e os pontos de cada colega, com medalhas para os três primeiros. Em "Ver detalhes", aparecem as conquistas e os cursos concluídos, com a data e os pontos de cada um.',
    visual: 'Clique em "Ranking" no menu. Destaque na linha do Lucas ("Você"). Clique em "Ver detalhes": pop-up com resumo, conquistas e cursos concluídos.',
    acao: async (d) => {
      await d.clicar('[data-tour="nav-ranking"]');
      await d.aguardar('.ranking-lista');
      d.destacar('.ranking-item-eu', 'Você');
      await d.noTempo(0.42);
      d.limpar();
      await d.clicar('.ranking-item-eu .btn');
      await d.aguardar('.participante');
      await d.noTempo(0.97);
      await d.clicar('.modal-header .icon-button');
    },
  },
  {
    id: 'conta', cap: 'alu4', tela: 'Menu da conta e tema',
    texto: 'No menu do nome, o aluno pode alterar como o próprio nome aparece no ranking e nos certificados, rever o tutorial sempre que quiser, ou sair da conta. E pode deixar a plataforma do seu jeito, por exemplo, trocando para o tema claro.',
    visual: 'Cursor abre o menu do nome e clica em "Alterar meu nome": abre o pop-up (cancelado). Depois troca o tema para "Claro" e volta para "Escuro".',
    acao: async (d) => {
      await d.clicar('[data-tour="conta"]');
      await d.esperar(500);
      await d.clicarTexto('.dropdown-item', 'Alterar meu nome');
      await d.aguardar('.modal-card');
      await d.noTempo(0.45);
      await d.clicar('.modal-actions .btn-secondary');
      await d.esperar(400);
      await d.clicar('[data-tour="preferencias"] .icon-button');
      await d.esperar(400);
      await d.clicarTexto('.dropdown-item', 'Claro');
      await d.noTempo(0.97);
      await d.clicar('[data-tour="preferencias"] .icon-button');
      await d.esperar(400);
      await d.clicarTexto('.dropdown-item', 'Escuro');
    },
  },
  {
    id: 'validar', cap: 'alu4', tela: 'Validar certificado (página pública)',
    texto: 'E a autenticidade dos certificados? Qualquer pessoa, mesmo sem login, pode apontar a câmera para o QR code do certificado, ou digitar o código, e conferir na hora se ele é verdadeiro.',
    visual: 'Abre a página pública "Validar certificado" com o código do certificado do Lucas: resultado "Certificado válido", com nome, curso e data.',
    acao: async (d) => {
      await d.esperar(400);
      d.ir(`/validar/${CODIGO_CERTIFICADO_LUCAS}`);
      await d.aguardar('.validar-ok', 8000);
      d.som('sucesso');
      d.destacar('.validar-ok', 'Certificado válido');
      await d.noTempo(0.97);
      d.limpar();
    },
  },

  // ================================================================= ENCERRAMENTO
  {
    id: 'encerramento', cap: 'fim', tela: 'Cartão de encerramento',
    texto: 'E é isso! Agora você conhece a Central de Treinamentos de ponta a ponta. O administrador cria cursos e trilhas e acompanha os resultados, e o aluno aprende no seu ritmo, conquistando pontos e certificados. Bons estudos!',
    visual: 'Cartão de encerramento: "Pronto para começar?" em degradê, com o resumo "Crie · Aprenda · Conquiste".',
    sons: 'Trilha sobe no final e termina em fade-out.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ tipo: 'encerramento', etiqueta: 'Central de Treinamentos', titulo: 'Pronto para começar?', subtitulo: 'Crie · Aprenda · Conquiste' });
    },
  },
];
