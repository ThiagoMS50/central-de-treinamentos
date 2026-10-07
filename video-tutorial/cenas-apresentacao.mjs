// Roteiro da apresentação do LMS Challenge 2026 (≈ 11 min), no mesmo padrão do tutorial:
//   1) Mostre seu LMS — fluxos do administrador e do aluno (bloco principal)
//   2) Conte como construiu — o que foi fácil, o que foi difícil, onde a IA ajudou
//   3) Mostre o ponto forte — o tutorial interativo, jogado ao vivo
// Mesma estrutura de cena do cenas.mjs (id, cap, tela, texto, visual, sons, acao).

export const META = {
  titulo: 'Apresentação LMS Challenge 2026 — Central de Treinamentos',
  descricao: 'Roteiro do vídeo de apresentação, seguindo o formato do desafio: **Mostre seu LMS** (fluxos do administrador e do aluno), **Conte como construiu** (fácil, difícil e onde a IA ajudou) e **Mostre o ponto forte**.',
  arquivoCenas: 'cenas-apresentacao.mjs',
  arquivoFinal: 'apresentacao-lms-challenge-2026.mp4',
  arquivoRoteiro: 'roteiro-apresentacao.md',
  notaTutorial: '- **O tutorial interativo da própria plataforma** aparece de verdade no vídeo: no administrador e no aluno ele é pulado ("ele volta no final") e, no Bloco 3, o Lucas o reabre e joga até a tela de vitória.',
  cobertura: [
    '**Bloco 1 · Administrador:** login (idioma, recuperação de senha, autocadastro) · menu, idioma, tema e menu da conta · Primeiros passos · Administração → Cursos (lista, editar, excluir) · novo curso em 3 etapas (capa da galeria, título, descrição, carga horária, prazo) · aulas, vídeo, material e salvamento automático · quiz (alternativa correta, tentativas ilimitadas) · publicação imediata e "Ver como aluno" · trilha (capa, cursos, ordem) · usuários (papel, ver progresso, redefinir tutorial, excluir) · relatórios (indicadores, filtros, colaboradores, exportar CSV) · configurações (ranking desligado e religado ao vivo) · sair.',
    '**Bloco 1 · Aluno:** login · painel (destaque com prazo vencido, pontos, regras de pontuação e conquistas, Primeiros passos, trilhas, filtros e busca) · curso (cabeçalho, conteúdo com etapas bloqueadas, vídeo, baixar material, concluir aulas, quiz com erro e acerto) · certificado em PDF e validação pública · nova conquista · trilha em linha do tempo · ranking e detalhes · alterar nome e tema claro/escuro.',
    '**Bloco 2 · Como construímos:** arquitetura (React + TypeScript, C# .NET 8, Supabase, Render) · o que foi fácil · o que foi difícil (fontes do PDF no servidor Linux, CSV no Excel brasileiro, tradução automática do navegador) · onde a IA ajudou. Os fatos vêm do histórico do repositório: 59 commits entre 24/08 e 07/10/2026.',
    '**Bloco 3 · Ponto forte:** o tutorial interativo no estilo videogame, jogado ao vivo do início à tela de vitória, e o porquê dessa escolha.',
  ],
};

const CODIGO_CERTIFICADO_LUCAS = '6MRDF11DAH';
const ADMIN = { email: 'ana.ribeiro@peexbrasil.com.br', senha: 'treinamentos2026' };
const ALUNO = { email: 'lucas.almeida@peexbrasil.com.br', senha: 'treinamentos2026' };

export const CAPITULOS = [
  { id: 'abertura', parte: 'Abertura', titulo: 'Abertura', alvo: '20 s' },
  { id: 'lms-adm', parte: 'Bloco 1 · Mostre seu LMS', titulo: 'Fluxo do administrador', alvo: '4 min' },
  { id: 'lms-alu', parte: 'Bloco 1 · Mostre seu LMS', titulo: 'Fluxo do aluno', alvo: '3 min 15 s' },
  { id: 'como', parte: 'Bloco 2 · Conte como construiu', titulo: 'Como construímos', alvo: '1 min 45 s' },
  { id: 'forte', parte: 'Bloco 3 · Mostre o ponto forte', titulo: 'O tutorial interativo', alvo: '1 min 15 s' },
  { id: 'fim', parte: 'Encerramento', titulo: 'Encerramento', alvo: '15 s' },
];

export const CENAS = [
  // ================================================================= ABERTURA
  {
    id: 'abertura', cap: 'abertura', tela: 'Cartão de abertura',
    texto: 'Olá! Esta é a Central de Treinamentos, a plataforma de capacitação que construímos para o LMS Challenge 2026. Vamos mostrar o sistema funcionando, contar como ele foi construído e apresentar o nosso ponto forte.',
    visual: 'Fade do preto para o cartão de abertura: etiqueta "LMS Challenge 2026", título em degradê "Central de Treinamentos" e subtítulo com os três blocos.',
    sons: 'Trilha entra em fade-in; whoosh no título.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ tipo: 'abertura', etiqueta: 'LMS Challenge 2026', titulo: 'Central de Treinamentos', subtitulo: 'Demonstração · Como construímos · Ponto forte' });
    },
  },

  // ================================================================= BLOCO 1 — ADMINISTRADOR
  {
    id: 'bloco1', cap: 'lms-adm', tela: 'Cartão do Bloco 1',
    texto: 'Primeiro, a plataforma em ação. Ela tem dois perfis: o administrador, que cria cursos e trilhas, cuida dos usuários e acompanha os resultados, e o aluno, que aprende no seu ritmo, ganha pontos e conquista certificados. Começamos pelo administrador.',
    visual: 'Cartão "Bloco 1 — Mostre seu LMS" com os tópicos dos dois perfis entrando um a um.',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({
        etiqueta: 'Bloco 1', numero: 'MOSTRE SEU LMS', titulo: 'A plataforma em ação',
        topicos: ['Administrador: cria cursos e trilhas', 'Administrador: acompanha os resultados', 'Aluno: aprende no seu ritmo', 'Aluno: ganha pontos e certificados'],
      });
    },
  },
  {
    id: 'adm-login', cap: 'lms-adm', tela: 'Tela de login',
    texto: 'Tudo começa na tela de entrada, com a identidade visual da empresa. Ela tem login por e-mail e senha, recuperação de senha por e-mail, autocadastro para novos colaboradores e a escolha do idioma: português, inglês ou espanhol. A Ana, nossa administradora, entra no sistema.',
    visual: 'Fade do cartão para o login. Destaques rápidos: idioma, "Esqueci minha senha" e "Cadastre-se". Digitação do e-mail e da senha da Ana e clique em "Entrar".',
    sons: 'Teclas e clique.',
    acao: async (d) => {
      d.fecharCartao();
      await d.esperar(800);
      d.destacar('.auth-logo .pill-button', 'Idioma');
      await d.noTempo(0.22);
      d.limpar();
      d.destacar('.auth-forgot a', 'Recuperar senha');
      await d.noTempo(0.36);
      d.limpar();
      d.destacar('.auth-switch a', 'Autocadastro');
      await d.noTempo(0.52);
      d.limpar();
      await d.digitar('.auth-card input[type="email"]', ADMIN.email, { rapido: true });
      await d.digitar('.auth-card input[type="password"]', ADMIN.senha, { rapido: true });
      await d.clicar('.auth-card button[type="submit"]');
    },
  },
  {
    id: 'adm-tutorial', cap: 'lms-adm', tela: 'Tutorial interativo (pulado)',
    texto: 'No primeiro acesso, um tutorial interativo se abre sozinho, para que ninguém fique perdido. Ele é o nosso ponto forte, então vamos pular por enquanto e guardá-lo para o final do vídeo.',
    visual: 'O tutorial abre com "Bem-vindo(a)!". Chamada "Ponto forte — no final". Cursor clica em "Pular tutorial".',
    acao: async (d) => {
      await d.aguardar('.tutorial-balao', 8000);
      d.chamada('Ponto forte', 'O tutorial interativo aparece no final do vídeo.', '🎮');
      await d.noTempo(0.7);
      await d.clicar('.tutorial-pular');
      if (await d.existe('.tutorial-balao')) await d.clicar('.tutorial-pular');
      d.chamada(null);
    },
  },
  {
    id: 'adm-painel', cap: 'lms-adm', tela: 'Tela inicial do administrador',
    texto: 'À esquerda fica o menu, dividido em duas partes. Em "Aprender", os Cursos e o Ranking, que todos veem. Em "Gestão", os Relatórios e a Administração, que só aparecem para o administrador. Assim, cada pessoa vê apenas o que faz sentido para o seu papel.',
    visual: 'Zoom no menu lateral com destaques em "Aprender" (Ranking) e "Gestão" (Administração). Volta do zoom.',
    acao: async (d) => {
      await d.rolarPara(0);
      await d.zoom('[data-tour="menu"]', 1.45);
      d.destacar('[data-tour="nav-ranking"]', 'Para todos');
      await d.noTempo(0.4);
      d.limpar();
      d.destacar('[data-tour="nav-admin"]', 'Só o administrador');
      await d.noTempo(0.8);
      d.limpar();
      await d.zoom(null);
    },
  },
  {
    id: 'adm-topo', cap: 'lms-adm', tela: 'Topo, conta e Primeiros passos',
    texto: 'No topo ficam o idioma, o tema claro ou escuro e o menu da conta. No centro, todas as trilhas e cursos, cada um com sua capa. E o cartão "Primeiros passos" traz missões que se marcam sozinhas conforme a pessoa usa o sistema.',
    visual: 'Destaque em idioma e tema. Cursor abre o menu da conta (destaque) e fecha. Rolagem: destaque na grade de cursos e no cartão "Primeiros passos".',
    acao: async (d) => {
      d.destacar('[data-tour="preferencias"]', 'Idioma e tema');
      await d.moverPara('[data-tour="preferencias"]');
      await d.noTempo(0.2);
      d.limpar();
      await d.clicar('[data-tour="conta"]');
      await d.esperar(400);
      d.destacar('.dropdown-menu', 'Menu da conta');
      await d.noTempo(0.38);
      d.limpar();
      await d.tecla('Escape');
      await d.rolar('[data-tour="cursos"]', 'start');
      d.destacar('[data-tour="cursos"] .card-grid', 'Trilhas e cursos');
      await d.noTempo(0.62);
      d.limpar();
      await d.rolar('.missoes', 'center');
      d.destacar('.missoes', 'Primeiros passos');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'adm-cursos', cap: 'lms-adm', tela: 'Administração → Cursos',
    texto: 'Todo o conteúdo é gerenciado em "Administração", com quatro abas: Cursos, Trilhas, Usuários e Configurações. Na aba Cursos, vemos os cursos já cadastrados, com a carga horária e as ações de editar e excluir.',
    visual: 'Clique em "Administração". Destaque nas abas e depois na tabela de cursos.',
    acao: async (d) => {
      await d.rolarPara(0);
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
    id: 'adm-novo-curso', cap: 'lms-adm', tela: 'Novo curso — etapas e capa',
    texto: 'Vamos criar um curso do zero, clicando em "Novo curso". O cadastro tem três etapas: informações, aulas e materiais, e quiz. A capa pode vir de uma galeria de ilustrações prontas, ou ser uma imagem enviada do computador.',
    visual: 'Clique em "Novo curso". Destaque nas três etapas (as duas últimas com cadeado). Abre a galeria de capas e o cursor escolhe "Escuta ativa".',
    acao: async (d) => {
      await d.rolarPara(0);
      await d.aguardar('[data-tour="novo-curso"]');
      await d.clicar('[data-tour="novo-curso"]');
      await d.aguardar('.form-steps');
      d.destacar('.form-steps', 'Três etapas');
      await d.noTempo(0.45);
      d.limpar();
      await d.clicar('.capa-uploader-botoes button');
      await d.aguardar('.galeria-item');
      await d.esperar(900);
      await d.clicarTexto('.galeria-item', 'Escuta ativa');
    },
  },
  {
    id: 'adm-campos', cap: 'lms-adm', tela: 'Novo curso — informações e prazo',
    texto: 'Preenchemos o título, que é obrigatório, a descrição e a carga horária, que vai para o certificado. Este curso terá prazo de trinta dias, contados a partir do primeiro acesso do aluno. Ao salvar, o sistema já abre a etapa de aulas.',
    visual: 'Digitação do título "Escuta Ativa na Prática", da descrição e da carga horária "3". Cursor liga a chave de prazo e digita "30". Clique em "Salvar": aviso de sucesso e troca para "Aulas e materiais".',
    sons: 'Teclas; som de sucesso ao salvar.',
    acao: async (d) => {
      await d.digitar('.form-card label.form-grid-full input', 'Escuta Ativa na Prática', { rapido: true });
      await d.digitar('.form-card textarea', 'Aprenda técnicas práticas de escuta ativa para melhorar o relacionamento com o cliente.', { rapido: true });
      await d.digitar('.form-card input[type="number"]', '3', { limpar: true });
      await d.clicar('.switch');
      await d.aguardar('.prazo-campo input[type="number"]');
      await d.digitar('.prazo-campo input[type="number"]', '30');
      await d.clicar('.form-card-footer .btn-primary');
      await d.aguardar('.aulas-manager > form.add-row', 8000);
      d.som('sucesso');
    },
  },
  {
    id: 'adm-aulas', cap: 'lms-adm', tela: 'Aulas, vídeo e materiais',
    texto: 'Cada curso é dividido em aulas, que o aluno faz em sequência. Cada aula pode ter um vídeo do YouTube, do Vimeo ou um arquivo, e materiais de apoio para baixar. E tudo aqui é salvo automaticamente, ao sair de cada campo.',
    visual: 'Criação de três aulas. No cartão da aula 1, digitação do link do vídeo e anexo do material "Guia de escuta ativa (PDF)". Chamada: "Salvamento automático".',
    sons: 'Teclas e cliques.',
    acao: async (d) => {
      for (const aula of ['O que é escuta ativa', 'Técnicas para ouvir de verdade', 'Escuta ativa no atendimento']) {
        await d.digitar('.aulas-manager > form.add-row input', aula, { rapido: true });
        await d.clicar('.aulas-manager > form.add-row .btn-primary');
        await d.esperar(350);
      }
      await d.rolar('.aula-editor', 'start');
      await d.digitar('.aula-editor input[type="url"]', 'https://videos.peexbrasil.com.br/escuta-ativa/aula-1.mp4', { rapido: true });
      await d.tecla('Tab');
      await d.digitar('.add-row-material input:not([type="file"])', 'Guia de escuta ativa (PDF)', { rapido: true });
      await d.moverPara('.add-row-material .file-picker');
      await d.arquivo('.add-row-material input[type="file"]');
      d.som('clique');
      await d.esperar(400);
      await d.clicar('.add-row-material .btn');
      d.chamada('Salvamento automático', 'Aulas e materiais são salvos ao sair de cada campo.', '💾');
      await d.esperar(600);
      d.destacar('.aula-editor .material-list', 'Material anexado');
      await d.noTempo(0.97);
      d.limpar();
      d.chamada(null);
    },
  },
  {
    id: 'adm-quiz', cap: 'lms-adm', tela: 'Quiz de prática e publicação',
    texto: 'A última etapa é o quiz de prática. Cadastramos as perguntas, quantas alternativas quisermos, e marcamos a certa com um clique. O aluno tem tentativas ilimitadas, mas só conclui o curso, e recebe o certificado, quando acerta todas as respostas.',
    visual: 'Aba "Quiz": pergunta, três alternativas e clique no círculo da correta (fica verde). Chamada "Regra do quiz". Clique em "Salvar quiz".',
    sons: 'Som de sucesso ao salvar.',
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
      d.chamada('Regra do quiz', 'Tentativas ilimitadas. O curso conclui quando todas as respostas estão certas.', '🎯');
      await d.noTempo(0.8);
      await d.clicar('.quiz-builder .form-card-footer .btn-primary');
      d.som('sucesso');
      d.chamada(null);
    },
  },
  {
    id: 'adm-publicado', cap: 'lms-adm', tela: 'Curso publicado — Ver como aluno',
    texto: 'E não existe rascunho: salvou, o curso já está publicado para todos os colaboradores. Pelo botão "Ver como aluno", o administrador confere exatamente o que a equipe vai ver.',
    visual: 'Chamada "Sem rascunho". Destaque em "Ver como aluno" e clique: abre a página do curso como o aluno vê.',
    acao: async (d) => {
      await d.rolarPara(0);
      d.chamada('Sem rascunho', 'Salvou, publicou: o curso já aparece para todos.', '🚀');
      d.destacar('.page-header a.btn', 'Ver como aluno');
      await d.noTempo(0.45);
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
  {
    id: 'adm-trilha', cap: 'lms-adm', tela: 'Nova trilha',
    texto: 'Trilhas agrupam cursos em uma sequência. Escolhemos a capa, o título e os cursos, na ordem em que o aluno deve fazê-los. Ao concluir a trilha inteira, ele ganha um certificado próprio e cinquenta pontos de bônus.',
    visual: 'Administração → Trilhas → Nova trilha. Capa "Jornada do cliente", título "Jornada de Atendimento ao Cliente". Inclusão de três cursos com "+" e ajuste da ordem com a seta. Clique em "Salvar": aviso "Trilha publicada".',
    sons: 'Cliques; som de sucesso.',
    acao: async (d) => {
      await d.clicar('[data-tour="nav-admin"]');
      await d.aguardar('.admin-tabs');
      await d.clicarTexto('.admin-tabs a', 'Trilhas');
      await d.esperar(400);
      await d.clicarTexto('.page-header a.btn', 'Nova trilha');
      await d.aguardar('.capa-uploader');
      await d.clicar('.capa-uploader-botoes button');
      await d.aguardar('.galeria-item');
      await d.esperar(500);
      await d.clicarTexto('.galeria-item', 'Jornada do cliente');
      await d.digitar('.form-card label.form-grid-full input', 'Jornada de Atendimento ao Cliente', { rapido: true });
      await d.rolar('.trilha-picker', 'center');
      for (const curso of ['Fundamentos de Atendimento', 'Comunicação Efetiva', 'Escuta Ativa']) {
        await d.clicarTexto('.trilha-picker-add', curso);
        await d.esperar(250);
      }
      await d.clicar('.trilha-picker-list-selecionados li:nth-child(3) .icon-button:first-child');
      d.destacar('.trilha-picker-list-selecionados', 'Ordem do aluno');
      await d.noTempo(0.85);
      d.limpar();
      await d.clicar('.form-card-footer-solto .btn-primary');
      d.som('sucesso');
      d.aviso('Trilha publicada');
    },
  },
  {
    id: 'adm-usuarios', cap: 'lms-adm', tela: 'Usuários e progresso',
    texto: 'Em Usuários, o administrador define o papel de cada pessoa: aluno ou administrador. E, em "Ver progresso", acompanha cada colaborador curso a curso, com a situação, a data de início e a data de conclusão.',
    visual: 'Aba "Usuários": destaque na coluna de papel. Clique em "Ver progresso" da Mariana: pop-up com o status de cada curso e as datas. Fecha.',
    acao: async (d) => {
      await d.rolarPara(0);
      await d.clicarTexto('.admin-tabs a', 'Usuários');
      await d.aguardar('.data-table');
      d.marcarLinha('Mariana', 'linha-mariana');
      d.destacar('[data-dir="linha-mariana"] select', 'Aluno ou Administrador');
      await d.noTempo(0.3);
      d.limpar();
      await d.clicarTexto('[data-dir="linha-mariana"] button', 'Ver progresso');
      await d.aguardar('.modal-card');
      await d.noTempo(0.85);
      await d.clicar('.modal-header .icon-button');
    },
  },
  {
    id: 'adm-redefinir', cap: 'lms-adm', tela: 'Usuários — redefinir tutorial e excluir',
    texto: 'Se alguém precisar rever o tutorial, basta redefini-lo, e ele abre de novo no próximo acesso. E a exclusão remove o usuário com todo o progresso, sempre depois de uma confirmação. Por segurança, ninguém exclui a própria conta nem o último administrador.',
    visual: 'Na linha da Mariana: destaque e cursor em "Redefinir tutorial"; depois em "Excluir", com a chamada de atenção.',
    acao: async (d) => {
      d.destacar('[data-dir="linha-mariana"] .table-actions button:first-child', 'Redefinir tutorial');
      await d.moverPara('[data-dir="linha-mariana"] .table-actions button:first-child');
      await d.noTempo(0.4);
      d.limpar();
      d.destacar('[data-dir="linha-mariana"] .btn-danger', 'Excluir');
      await d.moverPara('[data-dir="linha-mariana"] .btn-danger');
      d.chamada('Com confirmação', 'A exclusão remove a conta e todo o progresso. Não é possível excluir a si mesmo nem o último administrador.', '⚠️');
      await d.noTempo(0.97);
      d.limpar();
      d.chamada(null);
    },
  },
  {
    id: 'adm-relatorios', cap: 'lms-adm', tela: 'Relatórios — indicadores e filtros',
    texto: 'Em Relatórios, o administrador acompanha os resultados da capacitação: a taxa de conclusão, o tempo médio para concluir os cursos e a nota média nos quizzes. Tudo pode ser filtrado por período e por curso.',
    visual: 'Clique em "Relatórios": zoom nos indicadores e destaque nos filtros.',
    acao: async (d) => {
      await d.clicar('[data-tour="nav-relatorios"]');
      await d.aguardar('.kpi-grid');
      await d.zoom('.kpi-grid', 1.4);
      d.destacar('.kpi-grid', 'Indicadores');
      await d.noTempo(0.6);
      d.limpar();
      await d.zoom(null);
      d.destacar('.filters-bar', 'Filtros');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'adm-colaboradores', cap: 'lms-adm', tela: 'Relatórios — colaboradores e exportação',
    texto: 'Logo abaixo, a lista de colaboradores mostra quantos cursos cada um concluiu, com acesso ao progresso detalhado. E o botão "Exportar CSV" gera uma planilha com todos os dados, pronta para abrir no Excel.',
    visual: 'Rolagem até a tabela de colaboradores (destaque). Volta ao topo e clique em "Exportar CSV" (aviso "Planilha exportada").',
    acao: async (d) => {
      await d.rolar('.data-table', 'center');
      d.destacar('.data-table', 'Colaboradores');
      await d.noTempo(0.55);
      d.limpar();
      await d.rolarPara(0);
      await d.clicar('.page-header .btn');
      d.aviso('Planilha exportada');
      await d.noTempo(0.97);
    },
  },
  {
    id: 'adm-config', cap: 'lms-adm', tela: 'Configurações — ranking ao vivo',
    texto: 'Nas configurações, o ranking pode ser desligado para todos. Repare: o Ranking sai do menu na mesma hora. Vamos ligar de novo e, agora, ver tudo pelos olhos do aluno.',
    visual: 'Administração → Configurações. Cursor desmarca "Ranking habilitado": o item some do menu (destaque). Marca de novo e sai pelo menu da conta.',
    acao: async (d) => {
      await d.clicar('[data-tour="nav-admin"]');
      await d.aguardar('.admin-tabs');
      await d.clicarTexto('.admin-tabs a', 'Configurações');
      await d.aguardar('.checkbox-label input');
      d.destacar('.form.card', 'Ranking');
      await d.noTempo(0.2);
      d.limpar();
      await d.clicar('.checkbox-label input');
      await d.esperar(600);
      d.destacar('[data-tour="menu"]', 'Ranking saiu do menu');
      await d.noTempo(0.6);
      d.limpar();
      await d.clicar('.checkbox-label input');
      await d.noTempo(0.8);
      await d.clicar('[data-tour="conta"]');
      await d.esperar(400);
      await d.clicarTexto('.dropdown-item', 'Sair');
    },
  },

  // ================================================================= BLOCO 1 — ALUNO
  {
    id: 'alu-login', cap: 'lms-alu', tela: 'Login do aluno',
    texto: 'Agora, o outro lado. O Lucas é aluno, um colaborador como qualquer outro. Ele entra com o próprio e-mail e senha e, como é o primeiro acesso, o tutorial aparece também para ele. Por enquanto, ele pula, e voltamos a ele no final.',
    visual: 'Digitação do e-mail e da senha do Lucas; "Entrar"; o tutorial abre e é pulado.',
    sons: 'Teclas e clique.',
    acao: async (d) => {
      await d.aguardar('.auth-card');
      await d.digitar('.auth-card input[type="email"]', ALUNO.email, { rapido: true });
      await d.digitar('.auth-card input[type="password"]', ALUNO.senha, { rapido: true });
      await d.clicar('.auth-card button[type="submit"]');
      await d.aguardar('.tutorial-balao', 8000);
      await d.esperar(700);
      await d.clicar('.tutorial-pular');
      if (await d.existe('.tutorial-balao')) await d.clicar('.tutorial-pular');
    },
  },
  {
    id: 'alu-painel', cap: 'lms-alu', tela: 'Painel do aluno',
    texto: 'O painel mostra primeiro o que importa agora. O curso de Segurança da Informação está com o prazo vencido, então aparece em destaque, com o botão para continuar exatamente de onde parou. Ao lado ficam os pontos, a posição no ranking e as conquistas. Cada curso concluído vale dez pontos, cada acerto no quiz vale dois, e uma trilha completa dá cinquenta de bônus.',
    visual: 'Zoom no destaque do topo ("Prazo vencido"). Destaque no cartão de pontos e conquistas, com a chamada das regras de pontuação.',
    acao: async (d) => {
      await d.rolarPara(0);
      await d.aguardar('[data-tour="destaque"]');
      await d.zoom('[data-tour="destaque"]', 1.3);
      d.destacar('.hero-eyebrow', 'Prazo vencido');
      await d.noTempo(0.42);
      d.limpar();
      await d.zoom(null);
      d.destacar('.gamificacao-widget', 'Pontos e conquistas');
      await d.noTempo(0.6);
      d.chamada('Como ganhar pontos', '+10 por curso concluído · +2 por acerto no quiz · +50 por trilha completa', '⭐');
      await d.noTempo(0.97);
      d.limpar();
      d.chamada(null);
    },
  },
  {
    id: 'alu-painel-cursos', cap: 'lms-alu', tela: 'Painel — missões, trilhas e cursos',
    texto: 'Mais abaixo, as missões de primeiros passos, as trilhas com a barra de progresso e todos os cursos, com capa, carga horária e situação. Os filtros separam o que está em andamento, o que não começou e o que já foi concluído. E a busca, no topo, encontra qualquer curso pelo nome.',
    visual: 'Rolagem: destaque em "Primeiros passos" e nas trilhas. Clique no filtro "Não iniciado" e volta para "Todos". Volta ao topo e destaque na busca.',
    acao: async (d) => {
      await d.rolar('.missoes', 'center');
      d.destacar('.missoes', 'Primeiros passos');
      await d.noTempo(0.16);
      d.limpar();
      await d.rolar('.trilha-row', 'center');
      d.destacar('.trilha-row', 'Trilhas');
      await d.noTempo(0.3);
      d.limpar();
      await d.rolar('[data-tour="cursos"]', 'start');
      await d.noTempo(0.45);
      await d.clicarTexto('.filter-tab', 'Não iniciado');
      await d.esperar(1500);
      await d.clicarTexto('.filter-tab', 'Todos');
      await d.noTempo(0.8);
      await d.rolarPara(0);
      d.destacar('.search-input', 'Busca');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'alu-curso', cap: 'lms-alu', tela: 'Dentro do curso — apresentação',
    texto: 'Vamos fazer o curso que a Ana acabou de criar. No topo, a carga horária, o número de aulas, o prazo de trinta dias e a situação. À esquerda, o conteúdo, etapa por etapa: apresentação, aulas, quiz e certificado. As próximas ficam bloqueadas até o aluno avançar, mas ele sempre pode voltar às que já fez.',
    visual: 'Clique no cartão "Escuta Ativa na Prática". Zoom no cabeçalho; destaque no conteúdo do curso e nas etapas bloqueadas.',
    acao: async (d) => {
      await d.rolar('[data-tour="cursos"]', 'start');
      await d.clicarTexto('.course-card', 'Escuta Ativa');
      await d.aguardar('.detalhe-header');
      await d.zoom('.detalhe-header', 1.3);
      d.destacar('.meta-chips', 'Carga horária, aulas, prazo e situação');
      await d.noTempo(0.36);
      d.limpar();
      await d.zoom(null);
      d.destacar('[data-tour="indice"]', 'Conteúdo do curso');
      await d.noTempo(0.62);
      d.limpar();
      d.destacar('.step-item:disabled', 'Liberadas conforme avança');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'alu-aula', cap: 'lms-alu', tela: 'Aula com vídeo e material',
    texto: 'Clicando em Avançar, chegamos à primeira aula, com o vídeo que a Ana cadastrou e o material de apoio, que o aluno baixa com um clique.',
    visual: '"Avançar" para a aula 1: destaque no vídeo e clique em "Baixar" (aviso "Material baixado").',
    acao: async (d) => {
      await d.clicar('[data-tour="avancar"]');
      await d.aguardar('.aula-video-wrapper');
      d.destacar('.aula-video-wrapper', 'Vídeo da aula');
      await d.noTempo(0.6);
      d.limpar();
      await d.clicar('.material-list .btn');
      d.aviso('Material baixado', '⬇');
    },
  },
  {
    id: 'alu-aulas-quiz', cap: 'lms-alu', tela: 'Concluindo aulas e quiz',
    texto: 'Ao clicar em Avançar, a aula é concluída, ganha um visto no conteúdo, a barra de progresso anda e a próxima aula é liberada. No quiz, o Lucas erra de propósito: o erro aparece na hora e ele pode tentar de novo, quantas vezes quiser. Ao acertar tudo, o curso é concluído automaticamente.',
    visual: 'Três cliques em "Avançar" (vistos no índice, barra de progresso cheia). No quiz: alternativa errada → "Incorreto."; alternativa certa → "Correto!".',
    sons: 'Cliques; tom de erro; som de acerto.',
    acao: async (d) => {
      await d.rolarPara(0);
      for (let i = 0; i < 3; i++) {
        await d.clicar('[data-tour="avancar"]');
        await d.esperar(550);
      }
      await d.aguardar('.quiz-question');
      await d.clicarTexto('.quiz-option', 'Interromper');
      await d.clicar('.quiz-question .btn-secondary');
      await d.esperar(300);
      d.som('erro');
      await d.noTempo(0.72);
      await d.clicarTexto('.quiz-option', 'Ouvir com atenção');
      await d.clicar('.quiz-question .btn-secondary');
      d.som('sucesso');
    },
  },
  {
    id: 'alu-certificado', cap: 'lms-alu', tela: 'Certificado e validação',
    texto: 'Curso concluído! O certificado sai na hora, em PDF, com o nome do aluno, o curso, a carga horária, a data e um QR code. Com esse código, qualquer pessoa, mesmo sem login, consegue conferir se o certificado é autêntico.',
    visual: 'Etapa "Curso concluído!"; clique em "Baixar certificado": o certificado aparece em tela cheia. Depois, a página pública "Validar certificado" confirma o código.',
    sons: 'Fanfarra de conquista.',
    acao: async (d) => {
      await d.aguardar('.certificado-step', 10000);
      d.som('vitoria');
      await d.clicar('.certificado-step .btn-primary');
      d.imagem('certificado', 'Certificado de conclusão em PDF');
      await d.noTempo(0.6);
      d.imagem(null);
      await d.esperar(300);
      d.ir(`/validar/${CODIGO_CERTIFICADO_LUCAS}`);
      await d.aguardar('.validar-ok', 8000);
      d.som('sucesso');
      d.destacar('.validar-ok', 'Certificado válido');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'alu-trilha-ranking', cap: 'lms-alu', tela: 'Pontos, trilha e ranking',
    texto: 'De volta ao painel, os pontos subiram e uma nova conquista foi desbloqueada: Nota Máxima, por acertar todo o quiz. Na trilha que a Ana montou, os cursos ficam em uma linha do tempo numerada: os concluídos ganham um visto, e o próximo fica em destaque, para o aluno saber sempre qual é o passo seguinte.',
    visual: 'Volta ao painel: zoom nos pontos e na conquista nova. Clique na trilha "Jornada de Atendimento ao Cliente": destaque no próximo curso.',
    acao: async (d) => {
      d.ir('/cursos');
      await d.aguardar('.gamificacao-widget');
      await d.zoom('.gamificacao-widget', 1.35);
      d.destacar('.gamificacao-widget', 'Pontos e nova conquista');
      await d.noTempo(0.25);
      d.limpar();
      await d.zoom(null);
      await d.rolar('.trilha-row', 'center');
      await d.clicarTexto('.trilha-tile', 'Jornada');
      await d.aguardar('.trilha-timeline');
      d.destacar('.timeline-item-proximo', 'Próximo curso');
      await d.noTempo(0.97);
      d.limpar();
    },
  },
  {
    id: 'alu-ranking', cap: 'lms-alu', tela: 'Ranking',
    texto: 'No ranking, o aluno vê sua posição entre os colegas, com medalhas para os três primeiros, e a própria linha fica marcada. Em "Ver detalhes", aparecem o resumo, as conquistas e os cursos concluídos, com a data e os pontos de cada um. Uma competição saudável, que incentiva a equipe a continuar aprendendo.',
    visual: 'Clique em "Ranking": destaque na linha "Você". Clique em "Ver detalhes": pop-up com resumo, conquistas e cursos concluídos.',
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
    id: 'alu-conta', cap: 'lms-alu', tela: 'Menu da conta e tema',
    texto: 'No menu do nome, o aluno altera como o próprio nome aparece no ranking e nos certificados. E pode deixar a plataforma do seu jeito, trocando o idioma ou o tema, claro ou escuro. Tudo funciona também no celular, para estudar de qualquer lugar.',
    visual: 'Cursor abre o menu do nome e clica em "Alterar meu nome" (pop-up, cancelado). Troca o tema para "Claro" e volta para "Escuro".',
    acao: async (d) => {
      await d.clicar('[data-tour="conta"]');
      await d.esperar(500);
      await d.clicarTexto('.dropdown-item', 'Alterar meu nome');
      await d.aguardar('.modal-card');
      await d.noTempo(0.4);
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

  // ================================================================= BLOCO 2 — COMO CONSTRUÍMOS
  {
    id: 'como-stack', cap: 'como', tela: 'Cartão "Como construímos"',
    texto: 'Agora, como construímos. Foram cerca de seis semanas, entre agosto e outubro de 2026. O frontend é em React com TypeScript, o backend em C# com .NET 8, o banco de dados, o login e os arquivos ficam no Supabase, e tudo roda como um único serviço no Render, com um contêiner Docker.',
    visual: 'Cartão "Bloco 2 — Conte como construiu" com a arquitetura: React + TypeScript · C# .NET 8 · Supabase · Render.',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({
        etiqueta: 'Bloco 2', numero: 'CONTE COMO CONSTRUIU', titulo: 'Seis semanas, do zero à produção',
        topicos: ['React + TypeScript', 'C# · .NET 8', 'Supabase: banco, login e arquivos', 'Render: um único serviço'],
      });
    },
  },
  {
    id: 'como-linha', cap: 'como', tela: 'Cartão "Linha do tempo"',
    texto: 'Começamos escrevendo as regras do produto, num documento de premissas que guiou cada decisão. No primeiro dia, a primeira versão já estava no ar. Na mesma semana vieram os pontos, as conquistas e o ranking. Depois, as aulas, o quiz e o tema escuro. E, na reta final, o novo visual, as capas, o certificado com QR code e o tutorial interativo.',
    visual: 'Cartão "Linha do tempo" com quatro marcos: 24/08 primeira versão no ar · 26/08 pontos, conquistas e ranking · setembro aulas, quiz e tema · outubro novo visual e tutorial.',
    acao: async (d) => {
      d.cartao({
        etiqueta: 'Bloco 2', numero: 'LINHA DO TEMPO', titulo: 'Das premissas ao produto',
        topicos: ['24/08 · primeira versão no ar', '26/08 · pontos, conquistas e ranking', 'Setembro · aulas, quiz e tema escuro', 'Outubro · novo visual, certificado e tutorial'],
      });
    },
  },
  {
    id: 'como-facil-dificil', cap: 'como', tela: 'Cartão "Fácil e difícil"',
    texto: 'O fácil foi transformar ideias em funcionalidades: com as regras escritas desde o início, recursos inteiros saíram em poucos dias. O difícil foram os detalhes do mundo real, que só aparecem em produção: o certificado falhava por falta de fontes no servidor Linux, a planilha abria desconfigurada no Excel brasileiro, e o navegador traduzia a página sozinho, corrompendo os textos.',
    visual: 'Cartão "Fácil × Difícil": de um lado "Ideias viram funcionalidades em dias"; do outro "Fontes no servidor Linux", "CSV no Excel brasileiro", "Tradução automática do navegador".',
    acao: async (d) => {
      d.cartao({
        etiqueta: 'Bloco 2', numero: 'FÁCIL × DIFÍCIL', titulo: 'O fácil e o difícil',
        topicos: ['Fácil: ideias viram funcionalidades em dias', 'Difícil: fontes do PDF no servidor Linux', 'Difícil: CSV no Excel brasileiro', 'Difícil: tradução automática do navegador'],
      });
    },
  },
  {
    id: 'como-ia', cap: 'como', tela: 'Cartão "Onde a IA ajudou"',
    texto: 'A inteligência artificial trabalhou como parceira de programação: escreveu e revisou o código, investigou a causa de cada problema, testou as telas no computador e no celular e manteve a documentação em dia. Foram cinquenta e nove entregas pequenas e testadas. E até este vídeo foi produzido com ela.',
    visual: 'Cartão "Onde a IA ajudou" com quatro tópicos e o destaque "59 entregas".',
    acao: async (d) => {
      d.cartao({
        etiqueta: 'Bloco 2', numero: 'ONDE A IA AJUDOU', titulo: 'Uma parceira de programação',
        topicos: ['Escreveu e revisou o código', 'Investigou a causa dos problemas', 'Testou as telas no computador e no celular', '59 entregas pequenas e testadas'],
      });
    },
  },

  // ================================================================= BLOCO 3 — PONTO FORTE
  {
    id: 'forte-cartao', cap: 'forte', tela: 'Cartão "Ponto forte"',
    texto: 'Nosso ponto forte é a experiência de quem entra pela primeira vez.',
    visual: 'Cartão "Bloco 3 — Mostre o ponto forte": "Uma plataforma que ensina a si mesma".',
    sons: 'Whoosh.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ etiqueta: 'Bloco 3', numero: 'MOSTRE O PONTO FORTE', titulo: 'Uma plataforma que ensina a si mesma', subtitulo: 'O tutorial interativo, no estilo de um videogame' });
    },
  },
  {
    id: 'forte-tutorial', cap: 'forte', tela: 'Tutorial interativo ao vivo',
    texto: 'Em vez de um manual, a própria plataforma ensina. O Lucas reabre o tutorial pelo menu da conta. Ele escurece a tela e ilumina um elemento de cada vez: primeiro o menu, depois o curso em destaque e a lista de cursos. E, nas missões, não basta ler: o próprio usuário precisa fazer a ação para avançar, como em um videogame.',
    visual: 'O cartão some revelando o painel do Lucas. Cursor abre o menu do nome e clica em "Ver tutorial novamente". O tutorial avança pelas missões: menu, destaque, cursos e a missão de ação "Abra um curso".',
    acao: async (d) => {
      d.fecharCartao();
      d.ir('/cursos');
      await d.esperar(700);
      await d.clicar('[data-tour="conta"]');
      await d.esperar(350);
      await d.clicarTexto('.dropdown-item', 'Ver tutorial novamente');
      await d.aguardar('.tutorial-balao', 8000);
      await d.noTempo(0.3);
      await d.clicar('.tutorial-nav .btn-primary');
      for (const fracao of [0.42, 0.54, 0.66]) {
        await d.noTempo(fracao);
        await d.clicar('.tutorial-nav .btn-primary');
      }
      await d.aguardar('.tutorial-anel-acao', 8000);
      await d.noTempo(0.9);
      await d.clicarAnel();
      d.som('sucesso');
    },
  },
  {
    id: 'forte-missoes', cap: 'forte', tela: 'Tutorial — missões de ação e vitória',
    texto: 'O anel pulsando mostra exatamente onde clicar, e cada missão cumprida é comemorada. O tutorial ensina a chegar ao ranking, a trocar o idioma e o tema e a abrir o menu da conta, sempre esperando que o próprio aluno faça cada ação. No final, vem a tela de vitória.',
    visual: 'O tutorial segue pelas missões restantes (ranking, preferências e conta) até a tela de vitória com troféu e confetes.',
    sons: 'Sons de sucesso nas missões; fanfarra de vitória.',
    acao: async (d) => {
      for (const fracao of [0.12, 0.24]) {
        await d.noTempo(fracao);
        await d.clicar('.tutorial-nav .btn-primary');
      }
      await d.aguardar('.tutorial-anel-acao', 8000);
      await d.noTempo(0.38);
      await d.clicarAnel();
      d.som('sucesso');
      for (const fracao of [0.5, 0.62]) {
        await d.noTempo(fracao);
        await d.clicar('.tutorial-nav .btn-primary');
      }
      await d.aguardar('.tutorial-anel-acao', 8000);
      await d.noTempo(0.78);
      await d.clicarAnel();
      await d.aguardar('.tutorial-vitoria', 8000);
      d.som('vitoria');
    },
  },
  {
    id: 'forte-vitoria', cap: 'forte', tela: 'Tutorial — vitória e aprendizado',
    texto: 'Missão cumprida! E o tutorial não fica perdido: ele pode ser revisto a qualquer momento, e o administrador pode reabri-lo para qualquer pessoa. Esse é o nosso maior aprendizado: um sistema não está pronto quando funciona, e sim quando qualquer pessoa consegue usá-lo sozinha, desde o primeiro clique.',
    visual: 'Tela de vitória com troféu e confetes; chamada "Sempre disponível". Clique em continuar: volta ao painel do Lucas.',
    acao: async (d) => {
      await d.aguardar('.tutorial-vitoria', 8000);
      await d.noTempo(0.3);
      d.chamada('Sempre disponível', 'Reveja pelo menu da conta, ou peça ao administrador para redefinir.', '🔁');
      await d.noTempo(0.55);
      await d.clicar('.tutorial-vitoria .btn-primary');
      await d.noTempo(0.97);
      d.chamada(null);
    },
  },

  // ================================================================= ENCERRAMENTO
  {
    id: 'encerramento', cap: 'fim', tela: 'Cartão de encerramento',
    texto: 'Esta foi a Central de Treinamentos, construída para o LMS Challenge 2026. Crie, aprenda e conquiste. Muito obrigado por assistir!',
    visual: 'Cartão de encerramento: "Obrigado!" em degradê, com "Central de Treinamentos · LMS Challenge 2026". Fade para o preto.',
    sons: 'Trilha sobe e termina em fade-out.',
    acao: async (d) => {
      d.som('whoosh');
      d.cartao({ tipo: 'encerramento', etiqueta: 'LMS Challenge 2026', titulo: 'Obrigado!', subtitulo: 'Central de Treinamentos · Crie · Aprenda · Conquiste' });
    },
  },
];
