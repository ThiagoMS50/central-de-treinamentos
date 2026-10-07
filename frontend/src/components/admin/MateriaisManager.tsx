import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Material } from '../../types/api';
import { useUploadMaterialMutation, useExcluirMaterialMutation, baixarMaterial } from '../../hooks/useMateriais';
import { Icon } from '../ui/Icon';

export function MateriaisManager({ cursoId, aulaId, materiais }: { cursoId: string; aulaId: string; materiais: Material[] }) {
  const { t } = useTranslation();
  const uploadMutation = useUploadMaterialMutation(cursoId, aulaId);
  const excluirMutation = useExcluirMaterialMutation(cursoId, aulaId);

  const [titulo, setTitulo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!arquivo || !titulo) return;
    uploadMutation.mutate(
      { titulo, ordem: materiais.length, arquivo },
      {
        onSuccess: () => {
          setTitulo('');
          setArquivo(null);
          if (inputArquivoRef.current) inputArquivoRef.current.value = '';
        },
      },
    );
  }

  return (
    <div className="materiais-manager">
      <span className="campo-label">
        <Icon name="file" size={14} />
        {t('admin.cursos.materiais')}
      </span>

      {materiais.length > 0 && (
        <ul className="material-list">
          {materiais.map((material) => (
            <li key={material.id}>
              <span className="material-icone" aria-hidden="true">
                <Icon name="file" size={18} />
              </span>
              <span className="material-titulo">{material.titulo}</span>
              <button
                type="button"
                className="icon-button"
                onClick={() => baixarMaterial(aulaId, material.id)}
                aria-label={t('curso.downloadMaterial')}
                title={t('curso.downloadMaterial')}
              >
                <Icon name="download" size={16} />
              </button>
              <button
                type="button"
                className="icon-button icon-button-danger"
                onClick={() => excluirMutation.mutate(material.id)}
                aria-label={t('common.delete')}
                title={t('common.delete')}
              >
                <Icon name="trash" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* O <input type="file"> nativo fica escondido; o botão mostra o nome do arquivo escolhido. */}
      <form onSubmit={handleUpload} className="add-row add-row-material">
        <input
          placeholder={t('admin.cursos.materialTitulo')}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <label className="file-picker">
          <input ref={inputArquivoRef} type="file" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
          <Icon name="file" size={15} />
          <span className="file-picker-nome">{arquivo ? arquivo.name : t('admin.cursos.chooseFile')}</span>
        </label>
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={uploadMutation.isPending || !arquivo || !titulo.trim()}
        >
          <Icon name="plus" size={15} />
          {t('admin.cursos.addMaterial')}
        </button>
      </form>
    </div>
  );
}
