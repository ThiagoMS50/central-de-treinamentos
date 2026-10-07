// MODO DEMONSTRAÇÃO (usado só para gravar o vídeo tutorial — não entra no build de produção).
// Servidor falso em memória: intercepta o fetch de /api/* e responde como o backend real, com as
// mesmas regras (matrícula ao abrir o curso, conclusão por aulas + quiz, pontos, conquistas,
// prazo). O estado fica no sessionStorage, então sobrevive a recarregar a página.
import { capasDemo, videoAulaDemo } from './capas';

type Papel = 'aluno' | 'admin';
interface Usuario { id: string; nome: string; email: string; role: Papel; tutorialResetadoEm: string | null }
interface Material { id: string; titulo: string; ordem: number }
interface Aula { id: string; titulo: string; ordem: number; videoUrl: string | null; materiais: Material[] }
interface Alternativa { id: string; texto: string; ordem: number; correta: boolean }
interface Pergunta { id: string; enunciado: string; ordem: number; alternativas: Alternativa[] }
interface Curso {
  id: string; titulo: string; descricao: string | null; cargaHorariaHoras: number; temPrazo: boolean; prazoDias: number | null;
  capa: string | null; aulas: Aula[]; quiz: { titulo: string; perguntas: Pergunta[] } | null; criadoEm: string;
}
interface Trilha { id: string; titulo: string; descricao: string | null; capa: string | null; cursos: { cursoId: string; ordem: number }[] }
interface Matricula { alunoId: string; cursoId: string; iniciadoEm: string; concluidoEm: string | null }
interface Banco {
  usuarios: Usuario[]; cursos: Curso[]; trilhas: Trilha[]; matriculas: Matricula[];
  aulasConcluidas: { alunoId: string; aulaId: string }[];
  respostas: { alunoId: string; perguntaId: string; alternativaId: string; correta: boolean }[];
  pontos: { alunoId: string; tipo: string; ref: string; pontos: number; em: string }[];
  badges: { alunoId: string; codigo: string; em: string }[];
  certificados: { codigo: string; alunoId: string; cursoId?: string; trilhaId?: string; em: string }[];
  rankingHabilitado: boolean;
  seq: number;
}

const CHAVE = 'demo_banco_v1';
const dias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export function buscarUsuarioDemo(email: string) {
  return banco.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function criarAlunoDemo(nome: string, email: string) {
  const u: Usuario = { id: novoId('u'), nome, email, role: 'aluno', tutorialResetadoEm: null };
  banco.usuarios.push(u);
  salvar();
  return u;
}

export const USUARIOS_DEMO = {
  admin: { id: 'u-admin', nome: 'Ana Ribeiro', email: 'ana.ribeiro@peexbrasil.com.br', role: 'admin' as Papel },
  aluno: { id: 'u-lucas', nome: 'Lucas Almeida', email: 'lucas.almeida@peexbrasil.com.br', role: 'aluno' as Papel },
};

function semente(): Banco {
  const aula = (id: string, titulo: string, ordem: number, materiais: string[] = [], video = true): Aula => ({
    id, titulo, ordem, videoUrl: video ? `https://videos.peexbrasil.com.br/aulas/${id}.mp4` : null,
    materiais: materiais.map((m, i) => ({ id: `${id}-m${i}`, titulo: m, ordem: i })),
  });
  const alt = (id: string, textos: string[], certa: number): Alternativa[] =>
    textos.map((texto, i) => ({ id: `${id}-a${i}`, texto, ordem: i, correta: i === certa }));
  const cursos: Curso[] = [
    {
      id: 'c-atendimento', titulo: 'Fundamentos de Atendimento ao Cliente', descricao: 'Como oferecer um atendimento de qualidade e encantar clientes.',
      cargaHorariaHoras: 4, temPrazo: false, prazoDias: null, capa: 'atendimento', criadoEm: dias(90),
      aulas: [aula('a1', 'O cliente no centro', 0, ['Guia de atendimento (PDF)']), aula('a2', 'Primeiro contato', 1), aula('a3', 'Resolvendo problemas', 2)],
      quiz: { titulo: 'Quiz de prática', perguntas: [{ id: 'q1', enunciado: 'Qual é o primeiro passo de um bom atendimento?', ordem: 0, alternativas: alt('q1', ['Ouvir o cliente com atenção', 'Oferecer um desconto', 'Transferir para outro setor'], 0) }] },
    },
    {
      id: 'c-boasvindas', titulo: 'Bem-vindo à Empresa', descricao: 'Uma introdução à nossa história, missão e valores.',
      cargaHorariaHoras: 2, temPrazo: false, prazoDias: null, capa: 'boas-vindas', criadoEm: dias(120),
      aulas: [aula('b1', 'Nossa história', 0), aula('b2', 'Missão e valores', 1, ['Manual do colaborador (PDF)'])], quiz: null,
    },
    {
      id: 'c-seguranca', titulo: 'Segurança da Informação', descricao: 'Boas práticas para proteger dados e sistemas da empresa.',
      cargaHorariaHoras: 3, temPrazo: true, prazoDias: 30, capa: 'seguranca', criadoEm: dias(100),
      aulas: [aula('s1', 'Por que segurança importa', 0), aula('s2', 'Senhas e dois fatores', 1, ['Checklist de senhas (PDF)']), aula('s3', 'Como reconhecer phishing', 2)],
      quiz: { titulo: 'Quiz de prática', perguntas: [{ id: 'q2', enunciado: 'Qual é a melhor prática para senhas?', ordem: 0, alternativas: alt('q2', ['Usar a mesma senha em tudo', 'Senhas longas e únicas, com dois fatores', 'Anotar a senha no monitor'], 1) }] },
    },
    {
      id: 'c-etica', titulo: 'Código de Conduta e Ética', descricao: 'Princípios éticos e de conduta esperados de todos os colaboradores.',
      cargaHorariaHoras: 2, temPrazo: false, prazoDias: null, capa: 'etica', criadoEm: dias(80),
      aulas: [aula('e1', 'Nossos princípios', 0), aula('e2', 'Situações do dia a dia', 1)], quiz: null,
    },
    {
      id: 'c-comunicacao', titulo: 'Comunicação Efetiva no Trabalho', descricao: 'Técnicas para melhorar a comunicação com colegas e clientes.',
      cargaHorariaHoras: 3, temPrazo: false, prazoDias: null, capa: 'comunicacao', criadoEm: dias(60),
      aulas: [aula('m1', 'Comunicação clara', 0), aula('m2', 'Feedback que ajuda', 1)], quiz: null,
    },
    {
      id: 'c-tempo', titulo: 'Gestão do Tempo e Produtividade', descricao: 'Ferramentas práticas para organizar prioridades e ganhar produtividade.',
      cargaHorariaHoras: 2, temPrazo: false, prazoDias: null, capa: 'tempo', criadoEm: dias(50),
      aulas: [aula('t1', 'Prioridades', 0), aula('t2', 'Rotina produtiva', 1)], quiz: null,
    },
  ];
  const usuarios: Usuario[] = [
    { ...USUARIOS_DEMO.admin, tutorialResetadoEm: null },
    { ...USUARIOS_DEMO.aluno, tutorialResetadoEm: null },
    { id: 'u-mariana', nome: 'Mariana Costa', email: 'mariana.costa@peexbrasil.com.br', role: 'aluno', tutorialResetadoEm: null },
    { id: 'u-pedro', nome: 'Pedro Henrique', email: 'pedro.henrique@peexbrasil.com.br', role: 'aluno', tutorialResetadoEm: null },
    { id: 'u-juliana', nome: 'Juliana Santos', email: 'juliana.santos@peexbrasil.com.br', role: 'aluno', tutorialResetadoEm: null },
    { id: 'u-rafael', nome: 'Rafael Oliveira', email: 'rafael.oliveira@peexbrasil.com.br', role: 'aluno', tutorialResetadoEm: null },
  ];
  const b: Banco = {
    usuarios, cursos,
    trilhas: [{ id: 't-onboarding', titulo: 'Trilha de Onboarding', descricao: 'Conteúdos essenciais para os primeiros dias na empresa.', capa: 'caminho', cursos: [{ cursoId: 'c-boasvindas', ordem: 0 }, { cursoId: 'c-etica', ordem: 1 }, { cursoId: 'c-seguranca', ordem: 2 }] }],
    matriculas: [], aulasConcluidas: [], respostas: [], pontos: [], badges: [], certificados: [], rankingHabilitado: true, seq: 1,
  };
  // Histórico de outras pessoas (para ranking e relatórios terem vida).
  const concluir = (alunoId: string, cursoId: string, inicio: number, fim: number) => {
    b.matriculas.push({ alunoId, cursoId, iniciadoEm: dias(inicio), concluidoEm: dias(fim) });
    b.cursos.find((c) => c.id === cursoId)!.aulas.forEach((a) => b.aulasConcluidas.push({ alunoId, aulaId: a.id }));
    b.pontos.push({ alunoId, tipo: 'curso_concluido', ref: cursoId, pontos: 10, em: dias(fim) });
    b.certificados.push({ codigo: gerarCodigo(alunoId + cursoId), alunoId, cursoId, em: dias(fim) });
  };
  concluir('u-mariana', 'c-boasvindas', 60, 58); concluir('u-mariana', 'c-etica', 55, 50); concluir('u-mariana', 'c-seguranca', 50, 41);
  concluir('u-mariana', 'c-atendimento', 40, 33); concluir('u-mariana', 'c-comunicacao', 30, 26);
  b.pontos.push({ alunoId: 'u-mariana', tipo: 'trilha_concluida', ref: 't-onboarding', pontos: 50, em: dias(41) });
  ['primeiro_curso', 'cinco_cursos', 'trilha_completa', 'quiz_perfeito'].forEach((codigo) => b.badges.push({ alunoId: 'u-mariana', codigo, em: dias(30) }));
  concluir('u-pedro', 'c-boasvindas', 45, 44); concluir('u-pedro', 'c-atendimento', 40, 31); concluir('u-pedro', 'c-tempo', 25, 20);
  b.badges.push({ alunoId: 'u-pedro', codigo: 'primeiro_curso', em: dias(44) });
  b.matriculas.push({ alunoId: 'u-pedro', cursoId: 'c-seguranca', iniciadoEm: dias(12), concluidoEm: null });
  concluir('u-juliana', 'c-boasvindas', 20, 18); concluir('u-juliana', 'c-etica', 15, 12);
  b.badges.push({ alunoId: 'u-juliana', codigo: 'primeiro_curso', em: dias(18) });
  b.matriculas.push({ alunoId: 'u-rafael', cursoId: 'c-boasvindas', iniciadoEm: dias(3), concluidoEm: null });
  // Lucas (o aluno do vídeo): concluiu as boas-vindas e está atrasado em Segurança.
  concluir('u-lucas', 'c-boasvindas', 45, 43);
  b.badges.push({ alunoId: 'u-lucas', codigo: 'primeiro_curso', em: dias(43) });
  b.matriculas.push({ alunoId: 'u-lucas', cursoId: 'c-seguranca', iniciadoEm: dias(40), concluidoEm: null });
  b.aulasConcluidas.push({ alunoId: 'u-lucas', aulaId: 's1' });
  return b;
}

function gerarCodigo(base: string) {
  // 10 caracteres alfanuméricos, no mesmo estilo dos códigos reais (ex.: UISAZBEK0A).
  let h1 = 7;
  let h2 = 13;
  for (const ch of base) {
    h1 = (h1 * 31 + ch.charCodeAt(0)) >>> 0;
    h2 = (h2 * 131 + ch.charCodeAt(0) * 7) >>> 0;
  }
  return (h1.toString(36) + h2.toString(36)).toUpperCase().padEnd(10, '7').slice(0, 10);
}

let banco: Banco = carregar();
function carregar(): Banco {
  try {
    const salvo = sessionStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);
  } catch { /* começa do zero */ }
  return semente();
}
function salvar() {
  try { sessionStorage.setItem(CHAVE, JSON.stringify(banco)); } catch { /* ignora */ }
}
export function reiniciarDemo() {
  banco = semente();
  salvar();
}

let usuarioAtual: string | null = null;
export function definirUsuarioDemo(id: string | null) { usuarioAtual = id; }
const eu = () => banco.usuarios.find((u) => u.id === usuarioAtual)!;
const ehAdmin = () => eu()?.role === 'admin';
const novoId = (p: string) => `${p}-${banco.seq++}`;
// Id previsível a partir do título (o vídeo calcula o código do certificado antes de gravar).
const idPorTitulo = (p: string, titulo: string) =>
  `${p}-${titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
const capaUrl = (capa: string | null) => (capa ? capasDemo[capa] ?? null : null);

// ---------- Regras (iguais às do backend) ----------
function matricula(alunoId: string, cursoId: string) {
  return banco.matriculas.find((m) => m.alunoId === alunoId && m.cursoId === cursoId);
}
function status(curso: Curso, m?: Matricula) {
  const st = !m ? 'nao_iniciado' : m.concluidoEm ? 'concluido' : 'em_andamento';
  let prazoEm: string | null = null;
  let prazoStatus: string | null = null;
  if (curso.temPrazo && curso.prazoDias && m) {
    prazoEm = new Date(Date.parse(m.iniciadoEm) + curso.prazoDias * 86400000).toISOString();
    prazoStatus = !m.concluidoEm && Date.parse(prazoEm) < Date.now() ? 'atrasado' : 'em_dia';
  }
  return { status: st, prazoStatus, prazoEm };
}
function cursoLista(c: Curso, alunoId: string) {
  return {
    id: c.id, titulo: c.titulo, descricao: c.descricao, cargaHorariaHoras: c.cargaHorariaHoras, temPrazo: c.temPrazo,
    prazoDias: c.prazoDias, ...status(c, matricula(alunoId, c.id)), capaUrl: capaUrl(c.capa),
  };
}
function cursoDetalhe(c: Curso, alunoId: string) {
  return {
    ...cursoLista(c, alunoId), temQuiz: !!c.quiz?.perguntas.length,
    aulas: c.aulas.slice().sort((a, b) => a.ordem - b.ordem).map((a) => ({
      ...a, concluida: banco.aulasConcluidas.some((x) => x.alunoId === alunoId && x.aulaId === a.id),
      // O aluno assiste ao vídeo de demonstração; o admin continua vendo o link que cadastrou.
      videoUrl: a.videoUrl && !ehAdmin() ? videoAulaDemo : a.videoUrl,
      materiais: a.materiais.slice().sort((x, y) => x.ordem - y.ordem),
    })),
  };
}
function trilhaProgresso(t: Trilha, alunoId: string) {
  const total = t.cursos.length;
  const concluidos = t.cursos.filter((tc) => matricula(alunoId, tc.cursoId)?.concluidoEm).length;
  return { total, concluidos, progresso: total ? Math.round((concluidos / total) * 100) : 0, completa: total > 0 && concluidos === total };
}
function trilhaLista(t: Trilha, alunoId: string) {
  const p = trilhaProgresso(t, alunoId);
  return { id: t.id, titulo: t.titulo, descricao: t.descricao, totalCursos: p.total, cursosConcluidos: p.concluidos, progressoPercentual: p.progresso, completa: p.completa, capaUrl: capaUrl(t.capa) };
}
function pontosDe(alunoId: string) { return banco.pontos.filter((p) => p.alunoId === alunoId).reduce((s, p) => s + p.pontos, 0); }
const BADGES = [
  ['primeiro_curso', 'Primeiro Passo', 'Concluiu o primeiro curso', '🚀'],
  ['cinco_cursos', 'Maratonista', 'Concluiu 5 cursos', '🏃'],
  ['dez_cursos', 'Mestre em Aprendizado', 'Concluiu 10 cursos', '🎓'],
  ['trilha_completa', 'Trilha Completa', 'Concluiu uma trilha inteira', '🧭'],
  ['quiz_perfeito', 'Nota Máxima', 'Acertou 100% em um quiz de prática', '🎯'],
];
function badgesDe(alunoId: string) {
  return BADGES.map(([codigo, nome, descricao, icone]) => {
    const b = banco.badges.find((x) => x.alunoId === alunoId && x.codigo === codigo);
    return { codigo, nome, descricao, icone, conquistado: !!b, conquistadoEm: b?.em ?? null };
  });
}
function darBadge(alunoId: string, codigo: string) {
  if (!banco.badges.some((b) => b.alunoId === alunoId && b.codigo === codigo)) banco.badges.push({ alunoId, codigo, em: new Date().toISOString() });
}
function ranking() {
  const alunos = banco.usuarios.filter((u) => u.role !== 'admin').map((u) => ({ u, pontos: pontosDe(u.id) })).filter((x) => x.pontos > 0);
  alunos.sort((a, b) => b.pontos - a.pontos);
  return alunos.map((x, i) => ({ posicao: i + 1, alunoId: x.u.id, nome: x.u.nome, pontos: x.pontos, souEu: x.u.id === usuarioAtual, podeVerDetalhes: ehAdmin() || x.u.id === usuarioAtual }));
}
// Fecha o curso quando todas as aulas estão concluídas e o quiz (se houver) foi todo acertado.
function verificarConclusao(alunoId: string, curso: Curso) {
  const m = matricula(alunoId, curso.id);
  if (!m || m.concluidoEm) return { cursoConcluido: false, trilhasCompletas: [] as string[] };
  const aulasOk = curso.aulas.every((a) => banco.aulasConcluidas.some((x) => x.alunoId === alunoId && x.aulaId === a.id));
  const quizOk = !curso.quiz || curso.quiz.perguntas.every((p) => banco.respostas.some((r) => r.alunoId === alunoId && r.perguntaId === p.id && r.correta));
  if (!aulasOk || !quizOk) return { cursoConcluido: false, trilhasCompletas: [] as string[] };
  m.concluidoEm = new Date().toISOString();
  banco.pontos.push({ alunoId, tipo: 'curso_concluido', ref: curso.id, pontos: 10, em: m.concluidoEm });
  banco.certificados.push({ codigo: gerarCodigo(alunoId + curso.id), alunoId, cursoId: curso.id, em: m.concluidoEm });
  const concluidos = banco.matriculas.filter((x) => x.alunoId === alunoId && x.concluidoEm).length;
  darBadge(alunoId, 'primeiro_curso');
  if (concluidos >= 5) darBadge(alunoId, 'cinco_cursos');
  if (concluidos >= 10) darBadge(alunoId, 'dez_cursos');
  const trilhasCompletas: string[] = [];
  for (const t of banco.trilhas) {
    if (!t.cursos.some((tc) => tc.cursoId === curso.id)) continue;
    if (trilhaProgresso(t, alunoId).completa && !banco.pontos.some((p) => p.alunoId === alunoId && p.ref === t.id)) {
      banco.pontos.push({ alunoId, tipo: 'trilha_concluida', ref: t.id, pontos: 50, em: m.concluidoEm });
      banco.certificados.push({ codigo: gerarCodigo(alunoId + t.id), alunoId, trilhaId: t.id, em: m.concluidoEm });
      darBadge(alunoId, 'trilha_completa');
      trilhasCompletas.push(t.id);
    }
  }
  return { cursoConcluido: true, trilhasCompletas };
}

// ---------- Rotas ----------
type Rota = [string, RegExp, (m: RegExpMatchArray, corpo: any) => unknown];
const rotas: Rota[] = [
  ['POST', /^\/perfis\/ensure$/, () => eu()],
  ['PUT', /^\/perfis\/me$/, (_m, c) => { eu().nome = c.nome; return eu(); }],
  ['GET', /^\/perfis$/, () => banco.usuarios.slice().sort((a, b) => a.nome.localeCompare(b.nome))],
  ['PUT', /^\/perfis\/([^/]+)$/, (m, c) => { const u = banco.usuarios.find((x) => x.id === m[1])!; u.role = c.role; return u; }],
  ['POST', /^\/perfis\/([^/]+)\/tutorial\/redefinir$/, (m) => { const u = banco.usuarios.find((x) => x.id === m[1])!; u.tutorialResetadoEm = new Date().toISOString(); return u; }],
  ['GET', /^\/perfis\/([^/]+)\/progresso$/, (m) => banco.cursos.map((c) => {
    const mt = matricula(m[1], c.id);
    return { cursoId: c.id, titulo: c.titulo, ...status(c, mt), iniciadoEm: mt?.iniciadoEm ?? null, concluidoEm: mt?.concluidoEm ?? null };
  })],
  ['GET', /^\/configuracoes$/, () => ({ rankingHabilitado: banco.rankingHabilitado })],
  ['PUT', /^\/configuracoes$/, (_m, c) => { banco.rankingHabilitado = c.rankingHabilitado; return { rankingHabilitado: banco.rankingHabilitado }; }],
  ['GET', /^\/cursos$/, () => banco.cursos.slice().sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)).map((c) => cursoLista(c, usuarioAtual!))],
  ['GET', /^\/cursos\/([^/]+)$/, (m) => {
    const c = banco.cursos.find((x) => x.id === m[1])!;
    if (!ehAdmin() && !matricula(usuarioAtual!, c.id)) banco.matriculas.push({ alunoId: usuarioAtual!, cursoId: c.id, iniciadoEm: new Date().toISOString(), concluidoEm: null });
    return cursoDetalhe(c, usuarioAtual!);
  }],
  ['POST', /^\/cursos$/, (_m, c) => {
    const novo: Curso = { id: idPorTitulo('c', c.titulo), titulo: c.titulo, descricao: c.descricao || null, cargaHorariaHoras: c.cargaHorariaHoras, temPrazo: c.temPrazo, prazoDias: c.temPrazo ? c.prazoDias : null, capa: null, aulas: [], quiz: null, criadoEm: new Date().toISOString() };
    banco.cursos.push(novo);
    return cursoLista(novo, usuarioAtual!);
  }],
  ['PUT', /^\/cursos\/([^/]+)$/, (m, c) => { const x = banco.cursos.find((k) => k.id === m[1])!; Object.assign(x, { titulo: c.titulo, descricao: c.descricao || null, cargaHorariaHoras: c.cargaHorariaHoras, temPrazo: c.temPrazo, prazoDias: c.temPrazo ? c.prazoDias : null }); return cursoLista(x, usuarioAtual!); }],
  ['DELETE', /^\/cursos\/([^/]+)$/, (m) => { banco.cursos = banco.cursos.filter((x) => x.id !== m[1]); return undefined; }],
  ['POST', /^\/cursos\/([^/]+)\/aulas$/, (m, c) => { const x = banco.cursos.find((k) => k.id === m[1])!; const a: Aula = { id: novoId('a'), titulo: c.titulo, ordem: c.ordem, videoUrl: null, materiais: [] }; x.aulas.push(a); return { ...a, concluida: false }; }],
  ['PUT', /^\/aulas\/([^/]+)$/, (m, c) => { const a = banco.cursos.flatMap((k) => k.aulas).find((k) => k.id === m[1])!; Object.assign(a, { titulo: c.titulo, ordem: c.ordem, videoUrl: c.videoUrl }); return { ...a, concluida: false }; }],
  ['DELETE', /^\/aulas\/([^/]+)$/, (m) => { banco.cursos.forEach((k) => (k.aulas = k.aulas.filter((a) => a.id !== m[1]))); return undefined; }],
  ['POST', /^\/aulas\/([^/]+)\/materiais$/, (m, c) => { const a = banco.cursos.flatMap((k) => k.aulas).find((k) => k.id === m[1])!; const mat = { id: novoId('m'), titulo: String(c.get?.('titulo') ?? 'Material'), ordem: a.materiais.length }; a.materiais.push(mat); return mat; }],
  ['DELETE', /^\/aulas\/([^/]+)\/materiais\/([^/]+)$/, (m) => { const a = banco.cursos.flatMap((k) => k.aulas).find((k) => k.id === m[1])!; a.materiais = a.materiais.filter((x) => x.id !== m[2]); return undefined; }],
  ['GET', /^\/aulas\/([^/]+)\/materiais\/([^/]+)\/download$/, () => ({ url: '#material' })],
  ['POST', /^\/aulas\/([^/]+)\/concluir$/, (m) => {
    const curso = banco.cursos.find((k) => k.aulas.some((a) => a.id === m[1]))!;
    if (!banco.aulasConcluidas.some((x) => x.alunoId === usuarioAtual && x.aulaId === m[1])) banco.aulasConcluidas.push({ alunoId: usuarioAtual!, aulaId: m[1] });
    return verificarConclusao(usuarioAtual!, curso);
  }],
  ['GET', /^\/cursos\/([^/]+)\/quiz$/, (m) => quizResposta(m[1])],
  ['PUT', /^\/cursos\/([^/]+)\/quiz$/, (m, c) => {
    const x = banco.cursos.find((k) => k.id === m[1])!;
    x.quiz = { titulo: c.titulo, perguntas: c.perguntas.map((p: any, i: number) => { const pid = novoId('q'); return { id: pid, enunciado: p.enunciado, ordem: i, alternativas: p.alternativas.map((a: any, j: number) => ({ id: `${pid}-a${j}`, texto: a.texto, ordem: j, correta: a.correta })) }; }) };
    return quizResposta(x.id);
  }],
  ['POST', /^\/cursos\/([^/]+)\/quiz\/responder\/([^/]+)$/, (m, c) => {
    const curso = banco.cursos.find((k) => k.id === m[1])!;
    const p = curso.quiz!.perguntas.find((k) => k.id === m[2])!;
    const certa = p.alternativas.find((a) => a.correta)!;
    const correta = c.alternativaId === certa.id;
    const primeiraVez = correta && !banco.respostas.some((r) => r.alunoId === usuarioAtual && r.perguntaId === p.id && r.correta);
    banco.respostas.push({ alunoId: usuarioAtual!, perguntaId: p.id, alternativaId: c.alternativaId, correta });
    if (primeiraVez) banco.pontos.push({ alunoId: usuarioAtual!, tipo: 'quiz_correto', ref: p.id, pontos: 2, em: new Date().toISOString() });
    if (curso.quiz!.perguntas.every((k) => banco.respostas.some((r) => r.alunoId === usuarioAtual && r.perguntaId === k.id && r.correta))) darBadge(usuarioAtual!, 'quiz_perfeito');
    return { correta, alternativaCorretaId: certa.id, cursoConcluido: verificarConclusao(usuarioAtual!, curso).cursoConcluido };
  }],
  ['GET', /^\/capas\/galeria$/, () => Object.entries(capasDemo).map(([k, url]) => ({ nome: `${k}.webp`, url })).sort((a, b) => a.nome.localeCompare(b.nome))],
  ['PUT', /^\/(cursos|trilhas)\/([^/]+)\/capa\/galeria$/, (m, c) => { const alvo = (m[1] === 'cursos' ? banco.cursos : banco.trilhas).find((k) => k.id === m[2])!; alvo.capa = String(c.nome).replace(/\.webp$/, ''); return { capaUrl: capaUrl(alvo.capa) }; }],
  ['DELETE', /^\/(cursos|trilhas)\/([^/]+)\/capa$/, (m) => { const alvo = (m[1] === 'cursos' ? banco.cursos : banco.trilhas).find((k) => k.id === m[2])!; alvo.capa = null; return { capaUrl: null }; }],
  ['GET', /^\/trilhas$/, () => banco.trilhas.map((t) => trilhaLista(t, usuarioAtual!))],
  ['GET', /^\/trilhas\/([^/]+)$/, (m) => {
    const t = banco.trilhas.find((k) => k.id === m[1])!;
    return {
      ...trilhaLista(t, usuarioAtual!),
      cursos: t.cursos.slice().sort((a, b) => a.ordem - b.ordem).map((tc) => {
        const c = banco.cursos.find((k) => k.id === tc.cursoId)!;
        return { cursoId: c.id, titulo: c.titulo, ordem: tc.ordem, status: status(c, matricula(usuarioAtual!, c.id)).status, capaUrl: capaUrl(c.capa) };
      }),
    };
  }],
  ['POST', /^\/trilhas$/, (_m, c) => { const t: Trilha = { id: idPorTitulo('t', c.titulo), titulo: c.titulo, descricao: c.descricao || null, capa: null, cursos: [] }; banco.trilhas.push(t); return trilhaLista(t, usuarioAtual!); }],
  ['PUT', /^\/trilhas\/([^/]+)$/, (m, c) => { const t = banco.trilhas.find((k) => k.id === m[1])!; Object.assign(t, { titulo: c.titulo, descricao: c.descricao || null }); return trilhaLista(t, usuarioAtual!); }],
  ['PUT', /^\/trilhas\/([^/]+)\/cursos$/, (m, c) => { const t = banco.trilhas.find((k) => k.id === m[1])!; t.cursos = c.cursos; return undefined; }],
  ['DELETE', /^\/trilhas\/([^/]+)$/, (m) => { banco.trilhas = banco.trilhas.filter((t) => t.id !== m[1]); return undefined; }],
  ['GET', /^\/gamificacao\/me$/, () => {
    const pos = ranking().find((r) => r.alunoId === usuarioAtual)?.posicao ?? 0;
    return { totalPontos: pontosDe(usuarioAtual!), posicao: pos, badges: badgesDe(usuarioAtual!) };
  }],
  ['GET', /^\/gamificacao\/ranking$/, () => ranking()],
  ['GET', /^\/gamificacao\/participante\/([^/]+)$/, (m) => {
    const u = banco.usuarios.find((k) => k.id === m[1])!;
    const pts = (ref: string) => banco.pontos.find((p) => p.alunoId === u.id && p.ref === ref)?.pontos ?? 0;
    return {
      nome: u.nome, totalPontos: pontosDe(u.id), badges: badgesDe(u.id),
      cursos: banco.matriculas.filter((x) => x.alunoId === u.id && x.concluidoEm).map((x) => ({ titulo: banco.cursos.find((c) => c.id === x.cursoId)!.titulo, pontos: pts(x.cursoId), concluidoEm: x.concluidoEm })),
      trilhas: banco.pontos.filter((p) => p.alunoId === u.id && p.tipo === 'trilha_concluida').map((p) => ({ titulo: banco.trilhas.find((t) => t.id === p.ref)?.titulo ?? '?', pontos: p.pontos, concluidoEm: p.em })),
    };
  }],
  ['GET', /^\/relatorios\/dashboard/, () => {
    const ms = banco.matriculas;
    const concl = ms.filter((m) => m.concluidoEm);
    const tempo = concl.length ? concl.reduce((s, m) => s + (Date.parse(m.concluidoEm!) - Date.parse(m.iniciadoEm)) / 86400000, 0) / concl.length : 0;
    const resp = banco.respostas;
    return {
      taxaConclusaoGeral: ms.length ? Math.round((concl.length / ms.length) * 1000) / 10 : 0,
      tempoMedioConclusaoDias: Math.round(tempo * 10) / 10,
      notaMediaQuizPercentual: resp.length ? Math.round((resp.filter((r) => r.correta).length / resp.length) * 1000) / 10 : 87.5,
    };
  }],
  ['GET', /^\/relatorios\/por-aluno$/, () => banco.usuarios.filter((u) => u.role !== 'admin').map((u) => {
    const concluidos = banco.matriculas.filter((m) => m.alunoId === u.id && m.concluidoEm).length;
    return { alunoId: u.id, nome: u.nome, totalCursos: banco.cursos.length, cursosConcluidos: concluidos, progressoPercentual: Math.round((concluidos / banco.cursos.length) * 1000) / 10 };
  }).sort((a, b) => b.progressoPercentual - a.progressoPercentual)],
  ['GET', /^\/certificados\/validar\/([^/]+)$/, (m) => {
    const c = banco.certificados.find((k) => k.codigo === decodeURIComponent(m[1]));
    if (!c) throw new ErroDemo(404, 'Não encontrado');
    return { nomeAluno: banco.usuarios.find((u) => u.id === c.alunoId)!.nome, tipo: c.cursoId ? 'curso' : 'trilha', titulo: c.cursoId ? banco.cursos.find((k) => k.id === c.cursoId)!.titulo : banco.trilhas.find((t) => t.id === c.trilhaId)!.titulo, emitidoEm: c.em };
  }],
];
function quizResposta(cursoId: string) {
  const c = banco.cursos.find((k) => k.id === cursoId)!;
  if (!c.quiz) return { quizId: null, titulo: 'Quiz de prática', perguntas: [] };
  return {
    quizId: `quiz-${c.id}`,
    titulo: c.quiz.titulo,
    perguntas: c.quiz.perguntas.map((p) => ({
      id: p.id,
      enunciado: p.enunciado,
      ordem: p.ordem,
      minhaResposta: banco.respostas.filter((r) => r.alunoId === usuarioAtual && r.perguntaId === p.id).at(-1)?.alternativaId ?? null,
      alternativas: p.alternativas.map((a) => ({ id: a.id, texto: a.texto, ordem: a.ordem, correta: ehAdmin() ? a.correta : null })),
    })),
  };
}

class ErroDemo extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Certificado/CSV: o vídeo mostra o certificado por uma imagem; aqui só evita o download real.
const DOWNLOADS = [/^\/certificados\//, /^\/relatorios\/export\.csv/];

export function instalarServidorDemo() {
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url;
    const caminho = url.replace(location.origin, '');
    if (!caminho.startsWith('/api/')) return fetchOriginal(entrada, init);
    const [rota] = caminho.slice(4).split('?');
    const metodo = (init?.method ?? 'GET').toUpperCase();
    await new Promise((r) => setTimeout(r, 140)); // latência realista
    if (metodo === 'POST' && DOWNLOADS.some((d) => d.test(rota)) || metodo === 'GET' && /^\/relatorios\/export/.test(rota)) {
      window.dispatchEvent(new CustomEvent('demo-download', { detail: rota }));
      return new Response(new Blob(['demo'], { type: 'application/pdf' }), { status: 200 });
    }
    for (const [m, re, fn] of rotas) {
      const achou = rota.match(re);
      if (m !== metodo || !achou) continue;
      try {
        const corpo = init?.body instanceof FormData ? init.body : init?.body ? JSON.parse(String(init.body)) : null;
        const res = fn(achou, corpo);
        salvar();
        return res === undefined ? new Response(null, { status: 204 }) : new Response(JSON.stringify(res), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        const status = e instanceof ErroDemo ? e.status : 500;
        return new Response(JSON.stringify({ message: (e as Error).message }), { status, headers: { 'Content-Type': 'application/json' } });
      }
    }
    console.warn('[demo] rota sem simulação:', metodo, rota);
    return new Response(JSON.stringify({ message: 'rota sem simulação' }), { status: 404 });
  };
  // Material "baixado": avisa o diretor em vez de abrir outra aba.
  window.open = ((u?: string | URL) => { window.dispatchEvent(new CustomEvent('demo-download', { detail: String(u) })); return null; }) as typeof window.open;
}

export function codigoCertificadoDemo(alunoId: string, cursoId: string) {
  return gerarCodigo(alunoId + cursoId);
}
