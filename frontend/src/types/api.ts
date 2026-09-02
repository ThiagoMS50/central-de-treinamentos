export type Role = 'aluno' | 'gestor' | 'admin';
export type CursoStatus = 'nao_iniciado' | 'em_andamento' | 'concluido';
export type PrazoStatus = 'em_dia' | 'atrasado' | null;

export interface Profile {
  id: string;
  nome: string;
  email: string;
  role: Role;
  managerId: string | null;
}

export interface CursoListItem {
  id: string;
  titulo: string;
  descricao: string | null;
  cargaHorariaHoras: number;
  temPrazo: boolean;
  prazoDias: number | null;
  status: CursoStatus;
  prazoStatus: PrazoStatus;
  prazoEm: string | null;
}

export interface Material {
  id: string;
  titulo: string;
  ordem: number;
}

export interface CursoDetail extends CursoListItem {
  temQuiz: boolean;
  materiais: Material[];
}

export interface ProgressoCurso {
  cursoId: string;
  titulo: string;
  status: CursoStatus;
  prazoStatus: PrazoStatus;
  iniciadoEm: string | null;
  concluidoEm: string | null;
}

export interface TrilhaListItem {
  id: string;
  titulo: string;
  descricao: string | null;
  totalCursos: number;
  cursosConcluidos: number;
  progressoPercentual: number;
  completa: boolean;
}

export interface TrilhaCurso {
  cursoId: string;
  titulo: string;
  ordem: number;
  status: CursoStatus;
}

export interface TrilhaDetail extends TrilhaListItem {
  cursos: TrilhaCurso[];
}

export interface Alternativa {
  id: string;
  texto: string;
  ordem: number;
  correta: boolean | null;
}

export interface Pergunta {
  id: string;
  enunciado: string;
  ordem: number;
  alternativas: Alternativa[];
  minhaResposta: string | null;
}

export interface Quiz {
  quizId: string | null;
  titulo: string;
  perguntas: Pergunta[];
}

export interface ConcluirCursoResponse {
  concluido: boolean;
  trilhasCompletas: string[];
}

export interface CertificadoListItem {
  id: string;
  tipo: 'curso' | 'trilha';
  titulo: string;
  emitidoEm: string;
  codigoValidacao: string;
}

export interface EquipeProgresso {
  gestorId: string;
  gestorNome: string;
  totalAlunos: number;
  progressoMedioPercentual: number;
}

export interface RelatorioDashboard {
  taxaConclusaoGeral: number;
  tempoMedioConclusaoDias: number;
  notaMediaQuizPercentual: number;
  progressoPorEquipe: EquipeProgresso[];
}

export interface AlunoResumo {
  alunoId: string;
  nome: string;
  totalCursos: number;
  cursosConcluidos: number;
  progressoPercentual: number;
}

export interface Badge {
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  conquistado: boolean;
  conquistadoEm: string | null;
}

export interface MeuProgressoGamificacao {
  totalPontos: number;
  posicao: number;
  badges: Badge[];
}

export interface RankingItem {
  posicao: number;
  alunoId: string;
  nome: string;
  pontos: number;
  souEu: boolean;
  podeVerDetalhes: boolean;
}

export interface ItemConcluido {
  titulo: string;
  pontos: number;
  concluidoEm: string;
}

export interface DetalheParticipante {
  nome: string;
  totalPontos: number;
  cursos: ItemConcluido[];
  trilhas: ItemConcluido[];
  badges: Badge[];
}

export interface Configuracoes {
  rankingHabilitado: boolean;
}
