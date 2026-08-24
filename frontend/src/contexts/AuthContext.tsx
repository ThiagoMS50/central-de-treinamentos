import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { apiFetch, ApiError } from '../lib/apiClient';
import type { Profile } from '../types/api';

type AuthStatus = 'loading' | 'unauthenticated' | 'needsEmailConfirmation' | 'ready' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  profile: Profile | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (nome: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function bootstrap(currentSession: Session | null) {
      if (!mounted) return;
      if (!currentSession) {
        setSession(null);
        setProfile(null);
        setStatus('unauthenticated');
        return;
      }

      setSession(currentSession);
      try {
        const p = await apiFetch<Profile>('/perfis/ensure', { method: 'POST', body: {} });
        if (!mounted) return;
        setProfile(p);
        setStatus('ready');
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof ApiError ? err.message : String(err));
        setStatus('error');
      }
    }

    supabase.auth.getSession().then(({ data }) => bootstrap(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      bootstrap(newSession);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryTick]);

  async function signIn(email: string, password: string) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
  }

  async function signUp(nome: string, email: string, password: string) {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    });
    if (signUpError) throw signUpError;

    if (!data.session) {
      setStatus('needsEmailConfirmation');
      return { needsEmailConfirmation: true };
    }

    await apiFetch('/perfis/ensure', { method: 'POST', body: { nome } });
    return { needsEmailConfirmation: false };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setStatus('unauthenticated');
  }

  function retry() {
    setStatus('loading');
    setError(null);
    setRetryTick((t) => t + 1);
  }

  return (
    <AuthContext.Provider value={{ status, session, profile, error, signIn, signUp, signOut, retry }}>
      {children}
    </AuthContext.Provider>
  );
}
