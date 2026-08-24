import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';
import { RedirectIfAuthenticated } from './RedirectIfAuthenticated';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { CadastroPage } from '../pages/auth/CadastroPage';
import { DashboardPage } from '../pages/aluno/DashboardPage';
import { CursoDetalhePage } from '../pages/aluno/CursoDetalhePage';
import { TrilhaDetalhePage } from '../pages/aluno/TrilhaDetalhePage';
import { AdminCursosListPage } from '../pages/admin/AdminCursosListPage';
import { AdminCursoFormPage } from '../pages/admin/AdminCursoFormPage';
import { AdminTrilhasListPage } from '../pages/admin/AdminTrilhasListPage';
import { AdminTrilhaFormPage } from '../pages/admin/AdminTrilhaFormPage';
import { AdminUsuariosPage } from '../pages/admin/AdminUsuariosPage';
import { RelatoriosPage } from '../pages/relatorios/RelatoriosPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/cursos" replace />} />
          <Route path="/cursos" element={<DashboardPage />} />
          <Route path="/cursos/:id" element={<CursoDetalhePage />} />
          <Route path="/trilhas/:id" element={<TrilhaDetalhePage />} />

          <Route element={<RequireRole roles={['gestor', 'admin']} />}>
            <Route path="/relatorios" element={<RelatoriosPage />} />
          </Route>

          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="/admin/cursos" element={<AdminCursosListPage />} />
            <Route path="/admin/cursos/novo" element={<AdminCursoFormPage />} />
            <Route path="/admin/cursos/:id/editar" element={<AdminCursoFormPage />} />
            <Route path="/admin/trilhas" element={<AdminTrilhasListPage />} />
            <Route path="/admin/trilhas/novo" element={<AdminTrilhaFormPage />} />
            <Route path="/admin/trilhas/:id/editar" element={<AdminTrilhaFormPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route path="/403" element={<ForbiddenPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
