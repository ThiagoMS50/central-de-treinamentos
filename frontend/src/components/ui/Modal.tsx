import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  // "lg" para conteúdos mais ricos (ex.: detalhes do participante no ranking).
  size?: 'md' | 'lg';
}

export function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`modal-card${size === 'lg' ? ' modal-card-lg' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
