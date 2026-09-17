import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUsuariosQuery, useAtualizarUsuarioMutation, useExcluirUsuarioMutation } from '../../hooks/useUsuarios';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { AlunoProgressoModal } from '../../components/AlunoProgressoModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import type { Role } from '../../types/api';

const PAPEIS: Role[] = ['aluno', 'gestor', 'admin'];

export function AdminUsuariosPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const usuariosQuery = useUsuariosQuery();
  const atualizarMutation = useAtualizarUsuarioMutation();
  const excluirMutation = useExcluirUsuarioMutation();
  const [alunoSelecionado, setAlunoSelecionado] = useState<{ id: string; nome: string } | null>(null);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<{ id: string; nome: string } | null>(null);

  if (usuariosQuery.isLoading) return <Spinner />;
  if (usuariosQuery.isError) return <ErrorBanner onRetry={() => usuariosQuery.refetch()} />;
  if (!usuariosQuery.data) return null;

  const usuarios = usuariosQuery.data;
  const erroExclusao = excluirMutation.error instanceof ApiError ? excluirMutation.error.message : null;

  return (
    <div className="page">
      <AdminTabs />
      <h1>{t('admin.usuarios.title')}</h1>

      {erroExclusao && <ErrorBanner message={erroExclusao} />}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('admin.usuarios.nome')}</th>
              <th>{t('admin.usuarios.email')}</th>
              <th>{t('admin.usuarios.role')}</th>
              <th>{t('admin.usuarios.manager')}</th>
              <th></th>
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
                <td className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAlunoSelecionado({ id: usuario.id, nome: usuario.nome })}
                  >
                    {t('admin.usuarios.viewProgress')}
                  </button>
                  {usuario.id !== profile?.id && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setUsuarioParaExcluir({ id: usuario.id, nome: usuario.nome })}
                    >
                      {t('common.delete')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alunoSelecionado && (
        <AlunoProgressoModal
          alunoId={alunoSelecionado.id}
          nome={alunoSelecionado.nome}
          onClose={() => setAlunoSelecionado(null)}
        />
      )}

      {usuarioParaExcluir && (
        <ConfirmDialog
          title={t('admin.usuarios.deleteTitle')}
          message={t('admin.usuarios.confirmDeleteUser', { nome: usuarioParaExcluir.nome })}
          confirmLabel={t('common.delete')}
          onConfirm={() => {
            excluirMutation.mutate(usuarioParaExcluir.id);
            setUsuarioParaExcluir(null);
          }}
          onCancel={() => setUsuarioParaExcluir(null)}
        />
      )}
    </div>
  );
}
