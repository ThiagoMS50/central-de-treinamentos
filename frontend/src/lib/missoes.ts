// Missões de "Primeiros passos" que não dá para descobrir pelos dados do servidor (ex.: visitou o
// ranking, personalizou o tema). Ficam no navegador, por usuário. As demais missões são
// calculadas a partir dos dados (cursos, trilhas, conquistas) no próprio card.
export type MissaoLocal = 'tutorial' | 'ranking' | 'personalizar' | 'relatorios';

const PREFIXO = 'lms_missao_';
const EVENTO = 'lms-missao';

let usuarioAtual: string | null = null;

// Chamado quando o perfil carrega, para que componentes sem acesso ao usuário (ex.: seletor de
// tema) também possam marcar missões.
export function definirUsuarioMissoes(userId: string | null) {
  usuarioAtual = userId;
}

export function missaoFeita(userId: string, missao: MissaoLocal): boolean {
  try {
    return localStorage.getItem(`${PREFIXO}${userId}_${missao}`) === '1';
  } catch {
    return false;
  }
}

export function marcarMissao(missao: MissaoLocal, userId: string | null = usuarioAtual) {
  if (!userId || missaoFeita(userId, missao)) return;
  try {
    localStorage.setItem(`${PREFIXO}${userId}_${missao}`, '1');
  } catch {
    // localStorage indisponível (navegação privada) — a missão só não fica registrada
  }
  window.dispatchEvent(new Event(EVENTO));
}

// Para o card se atualizar na hora quando uma missão é marcada em outro lugar da tela.
export function aoMudarMissoes(callback: () => void) {
  window.addEventListener(EVENTO, callback);
  return () => window.removeEventListener(EVENTO, callback);
}
