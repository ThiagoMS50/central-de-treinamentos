import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useUsuariosQuery,
  useAtualizarUsuarioMutation,
  useExcluirUsuarioMutation,
  useRedefinirTutorialMutation,
} from '../../hooks/useUsuarios';
import { Spinner, ErrorBanner } from '../../components/ui/Feedback';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { AlunoProgressoModal } from '../../components/AlunoProgressoModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import type { Role } from '../../types/api';

const PAPEIS: Role[] = ['aluno', 'admin'];

export function AdminUsuariosPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const usuariosQuery = useUsuariosQuery();
  const atualizarMutation = useAtualizarUsuarioMutation();
  const excluirMutation = useExcluirUsuarioMutation();
  const redefinirTutorialMutation = useRedefinirTutorialMutation();
  const [tutorialParaRedefinir, setTutorialParaRedefinir] = useState<{ id: string; nome: string } | null>(null);
  const [tutorialRedefinido, setTutorialRedefinido] = useState<string | null>(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState<{ id: string; nome: string } | null>(null);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<{ id: string; nome: string } | null>(null);

  if (usuariosQuery.isLoading) return <Spinner />;
  if (usuariosQuery.isError) return <ErrorBanner onRetry={() => usuariosQuery.refetch()} />;
  if (!usuariosQuery.data) return null;

  const usuarios = usuariosQuery.data;
  const erroExclusao = excluirMutation.error instanceof ApiError ? excluirMutation.error.message : null;
  const erroTutorial = redefinirTutorialMutation.error instanceof ApiError ? redefinirTutorialMutation.error.message : null;

  return (
    <div className="page">
      <AdminTabs />
      <h1>{t('admin.usuarios.title')}</h1>

      {erroExclusao && <ErrorBanner message={erroExclusao} />}
      {erroTutorial && <ErrorBanner message={erroTutorial} />}
      {tutorialRedefinido && (
        <div className="success-banner" role="status">
          {t('admin.usuarios.resetTutorialDone', { nome: tutorialRedefinido })}
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('admin.usuarios.nome')}</th>
              <th>{t('admin.usuarios.email')}</th>
              <th>{t('admin.usuarios.role')}</th>
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
                      atualizarMutation.mutate({ id: usuario.id, role: e.target.value as Role })
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
                  <div className="table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      title={t('admin.usuarios.resetTutorialHint')}
                      onClick={() => setTutorialParaRedefinir({ id: usuario.id, nome: usuario.nome })}
                    >
                      {t('admin.usuarios.resetTutorial')}
                    </button>
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
                  </div>
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

      {tutorialParaRedefinir && (
        <ConfirmDialog
          title={t('admin.usuarios.resetTutorial')}
          message={t('admin.usuarios.resetTutorialConfirm', { nome: tutorialParaRedefinir.nome })}
          confirmLabel={t('admin.usuarios.resetTutorialAction')}
          variant="primary"
          onConfirm={() => {
            const alvo = tutorialParaRedefinir;
            setTutorialParaRedefinir(null);
            setTutorialRedefinido(null);
            redefinirTutorialMutation.mutate(alvo.id, { onSuccess: () => setTutorialRedefinido(alvo.nome) });
          }}
          onCancel={() => setTutorialParaRedefinir(null)}
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
