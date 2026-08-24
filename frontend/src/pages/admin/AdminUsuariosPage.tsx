import { useTranslation } from 'react-i18next';
import { useUsuariosQuery, useAtualizarUsuarioMutation } from '../../hooks/useUsuarios';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { AdminTabs } from '../../components/admin/AdminTabs';
import type { Role } from '../../types/api';

const PAPEIS: Role[] = ['aluno', 'gestor', 'admin'];

export function AdminUsuariosPage() {
  const { t } = useTranslation();
  const usuariosQuery = useUsuariosQuery();
  const atualizarMutation = useAtualizarUsuarioMutation();

  if (usuariosQuery.isLoading) return <Spinner />;
  if (usuariosQuery.isError) return <ErrorBanner onRetry={() => usuariosQuery.refetch()} />;
  if (!usuariosQuery.data) return null;

  const usuarios = usuariosQuery.data;

  return (
    <div className="page">
      <AdminTabs />
      <h1>{t('admin.usuarios.title')}</h1>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('admin.usuarios.nome')}</th>
              <th>{t('admin.usuarios.email')}</th>
              <th>{t('admin.usuarios.role')}</th>
              <th>{t('admin.usuarios.manager')}</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                  <select
                    value={usuario.role}
                    onChange={(e) =>
                      atualizarMutation.mutate({ id: usuario.id, role: e.target.value as Role, managerId: usuario.managerId })
                    }
                  >
                    {PAPEIS.map((papel) => (
                      <option key={papel} value={papel}>
                        {t(`roles.${papel}`)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={usuario.managerId ?? ''}
                    onChange={(e) =>
                      atualizarMutation.mutate({
                        id: usuario.id,
                        role: usuario.role,
                        managerId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">{t('admin.usuarios.none')}</option>
                    {usuarios
                      .filter((u) => u.id !== usuario.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
