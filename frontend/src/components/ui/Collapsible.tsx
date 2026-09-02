import { useState, type ReactNode } from 'react';

interface CollapsibleProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  disabled?: boolean;
  hint?: string;
  children: ReactNode;
}

export function Collapsible({ title, count, defaultOpen = false, disabled = false, hint, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const aberto = !disabled && open;

  return (
    <div className="collapsible">
      <button
        type="button"
        className="collapsible-header"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={aberto}
      >
        <span className="collapsible-title">
          {title}
          {typeof count === 'number' && <span className="collapsible-count">({count})</span>}
        </span>
        <span className={`collapsible-chevron${aberto ? ' collapsible-chevron-open' : ''}`}>▸</span>
      </button>
      {disabled && hint && <p className="collapsible-hint">{hint}</p>}
      {aberto && <div className="collapsible-body">{children}</div>}
    </div>
  );
}
