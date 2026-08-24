import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Material } from '../../types/api';
import { useUploadMaterialMutation, useExcluirMaterialMutation, baixarMaterial } from '../../hooks/useMateriais';

export function MateriaisManager({ cursoId, materiais }: { cursoId: string; materiais: Material[] }) {
  const { t } = useTranslation();
  const uploadMutation = useUploadMaterialMutation(cursoId);
  const excluirMutation = useExcluirMaterialMutation(cursoId);

  const [titulo, setTitulo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);

  function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!arquivo || !titulo) return;
    uploadMutation.mutate(
      { titulo, ordem: materiais.length, arquivo },
      {
        onSuccess: () => {
          setTitulo('');
          setArquivo(null);
        },
      },
    );
  }

  return (
    <div className="materiais-manager">
      <ul className="material-list">
        {materiais.map((material) => (
          <li key={material.id}>
            <span>{material.titulo}</span>
            <button type="button" className="btn btn-secondary" onClick={() => baixarMaterial(cursoId, material.id)}>
              {t('curso.downloadMaterial')}
            </button>
            <button type="button" className="btn btn-danger" onClick={() => excluirMutation.mutate(material.id)}>
              {t('common.delete')}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleUpload} className="form-inline">
        <input placeholder={t('admin.cursos.titulo')} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <input type="file" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
        <button type="submit" className="btn btn-secondary" disabled={uploadMutation.isPending}>
          {t('admin.cursos.addMaterial')}
        </button>
      </form>
    </div>
  );
}
