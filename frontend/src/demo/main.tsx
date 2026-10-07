// MODO DEMONSTRAÇÃO — entrada usada só para gravar o vídeo tutorial (demo.html).
// O app é exatamente o mesmo (rotas, telas, estilos); só a API e o login são simulados.
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import '../index.css';
import '../theme/tokens.css';
import i18n from '../i18n';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AppRouter } from '../routes/AppRouter';
import { DemoAuthProvider } from './auth';
import { instalarServidorDemo, reiniciarDemo } from './servidor';
import './diretor';

if (new URLSearchParams(location.search).has('reiniciar')) {
  reiniciarDemo();
  sessionStorage.removeItem('demo_usuario_logado');
  history.replaceState(null, '', location.pathname);
}
instalarServidorDemo();
// Vídeo gravado em português, no tema escuro.
localStorage.setItem('lms_language', 'pt');
i18n.changeLanguage('pt');
if (!localStorage.getItem('theme')) localStorage.setItem('theme', 'dark');

// Deixa o script de gravação navegar (ex.: abrir a página pública de validação).
function ExporNavegacao() {
  const navigate = useNavigate();
  (window as unknown as { __navegar: (p: string) => void }).__navegar = (p: string) => navigate(p);
  return null;
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <DemoAuthProvider>
          <ExporNavegacao />
          <AppRouter />
        </DemoAuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  </ThemeProvider>,
);
