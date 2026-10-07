import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DropdownProps {
  // Conteúdo do botão que abre o menu.
  trigger: ReactNode;
  triggerClassName?: string;
  label: string;
  // Marca o botão para o tutorial (data-tour).
  dataTour?: string;
  align?: 'left' | 'right';
  // Recebe uma função para fechar o menu (ex.: depois de escolher uma opção).
  children: (close: () => void) => ReactNode;
}

// Menu suspenso simples: abre no clique, fecha ao clicar fora, com Esc ou ao escolher uma opção.
export function Dropdown({ trigger, triggerClassName = 'icon-button', label, dataTour, align = 'right', children }: DropdownProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    function onTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false);
    }
    document.addEventListener('mousedown', onClickFora);
    document.addEventListener('keydown', onTecla);
    return () => {
      document.removeEventListener('mousedown', onClickFora);
      document.removeEventListener('keydown', onTecla);
    };
  }, [aberto]);

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className={triggerClassName}
        data-tour={dataTour}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={label}
        title={label}
        onClick={() => setAberto((v) => !v)}
      >
        {trigger}
      </button>
      {aberto && (
        <div className={`dropdown-menu dropdown-menu-${align}`} role="menu">
          {children(() => setAberto(false))}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon?: ReactNode;
  children: ReactNode;
  selected?: boolean;
  danger?: boolean;
  onSelect: () => void;
}

export function DropdownItem({ icon, children, selected, danger, onSelect }: DropdownItemProps) {
  return (
    <button
      type="button"
      role={selected === undefined ? 'menuitem' : 'menuitemradio'}
      aria-checked={selected}
      className={`dropdown-item${selected ? ' dropdown-item-selected' : ''}${danger ? ' dropdown-item-danger' : ''}`}
      onClick={onSelect}
    >
      {icon && <span className="dropdown-item-icon">{icon}</span>}
      <span className="dropdown-item-label">{children}</span>
      {selected && <span className="dropdown-item-check">✓</span>}
    </button>
  );
}
