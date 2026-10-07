// MODO DEMONSTRAÇÃO: autenticação simulada (sem Supabase). Usa o mesmo AuthContext do app, então
// as telas reais de login, cadastro e as rotas protegidas funcionam normalmente.
import { useState, type ReactNode } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { apiFetch } from '../lib/apiClient';
import type { Profile } from '../types/api';
import { buscarUsuarioDemo, criarAlunoDemo, definirUsuarioDemo } from './servidor';

const CHAVE = 'demo_usuario_logado';

function carregarLogado(): Profile | null {
  try {
    const email = sessionStorage.getItem(CHAVE);
    const u = email ? buscarUsuarioDemo(email) : null;
    if (u) definirUsuarioDemo(u.id);
    return u;
  } catch {
    return null;
  }
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(carregarLogado);

  async function signIn(email: string, password: string) {
    await new Promise((r) => setTimeout(r, 450));
    const u = buscarUsuarioDemo(email);
    if (!u || password.length < 6) throw new Error('Credenciais inválidas');
    definirUsuarioDemo(u.id);
    sessionStorage.setItem(CHAVE, u.email);
    setProfile({ ...u });
  }

  async function signUp(nome: string, email: string, password: string) {
    if (password.length < 6) throw new Error('Senha curta');
    const u = criarAlunoDemo(nome, email);
    definirUsuarioDemo(u.id);
    sessionStorage.setItem(CHAVE, u.email);
    setProfile({ ...u });
    return { needsEmailConfirmation: false };
  }

  async function signOut() {
    sessionStorage.removeItem(CHAVE);
    definirUsuarioDemo(null);
    setProfile(null);
  }

  async function updateNome(nome: string) {
    const atualizado = await apiFetch<Profile>('/perfis/me', { method: 'PUT', body: { nome } });
    setProfile({ ...atualizado });
  }

  return (
    <AuthContext.Provider
      value={{
        status: profile ? 'ready' : 'unauthenticated',
        session: null,
        profile,
        error: null,
        signIn,
        signUp,
        signOut,
        updateNome,
        retry: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
