import { useId, useState } from 'react';

// Miniatura de curso/trilha.
// - Com capa (enviada pelo Admin): mostra a imagem, recortada para preencher o espaço.
// - Sem capa: ilustração padrão do tipo — curso (tela com play) ou trilha (caminho até a chegada).
// Variantes: "neutral" (cards: fundo neutro com toque da marca) e "brand" (destaque do topo:
// degradê forte da marca, com a ilustração em branco).
interface CourseThumbProps {
  id: string;
  tipo?: 'curso' | 'trilha';
  capaUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'neutral' | 'brand';
}

function hash(texto: string) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function CourseThumb({ id, tipo = 'curso', capaUrl, size = 'md', variant = 'neutral' }: CourseThumbProps) {
  // Se a imagem falhar (link quebrado, arquivo removido), cai para a ilustração.
  const [falhou, setFalhou] = useState<string | null>(null);
  const mostrarCapa = !!capaUrl && falhou !== capaUrl;

  return (
    <div
      className={`course-thumb course-thumb-${size} course-thumb-${mostrarCapa ? 'capa' : variant}`}
      data-tone={hash(id) % 3}
      aria-hidden="true"
    >
      {mostrarCapa ? (
        <img src={capaUrl!} alt="" loading="lazy" onError={() => setFalhou(capaUrl!)} />
      ) : tipo === 'trilha' ? (
        <IlustracaoTrilha clara={variant === 'brand'} />
      ) : (
        <IlustracaoCurso clara={variant === 'brand'} />
      )}
    </div>
  );
}

// "clara": traços brancos (sobre o degradê da marca); senão, traços nos tons do tema + degradê.
function useCores(clara: boolean) {
  const gradId = useId();
  return {
    gradId,
    destaque: clara ? '#fff' : `url(#${gradId})`,
    contraste: clara ? 'rgba(200, 79, 168, 0.95)' : '#fff',
  };
}

function Degrade({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c84fa8" />
        <stop offset="1" stopColor="#e2734f" />
      </linearGradient>
    </defs>
  );
}

function IlustracaoCurso({ clara }: { clara: boolean }) {
  const { gradId, destaque, contraste } = useCores(clara);
  return (
    <svg className={`ilustracao${clara ? ' ilustracao-clara' : ''}`} viewBox="0 0 120 90" fill="none">
      <Degrade id={gradId} />
      {/* tela */}
      <rect className="ilus-fundo ilus-traco" x="22" y="12" width="76" height="50" rx="7" strokeWidth="2.5" />
      {/* barra de progresso da aula */}
      <rect className="ilus-suave" x="32" y="52" width="56" height="3.5" rx="1.75" />
      <rect x="32" y="52" width="30" height="3.5" rx="1.75" fill={destaque} />
      {/* botão play */}
      <circle cx="60" cy="33" r="11" fill={destaque} />
      <path d="M56.5 27.5v11l9-5.5z" fill={contraste} />
      {/* base do notebook */}
      <path className="ilus-traco" d="M12 68h96l-5 7H17z" strokeWidth="2.5" strokeLinejoin="round" />
      {/* livro ao lado */}
      <rect className="ilus-fundo ilus-traco" x="92" y="48" width="18" height="22" rx="2.5" strokeWidth="2.5" transform="rotate(10 101 59)" />
      <path className="ilus-traco" d="M97 54.5l8 1.4M96.2 59.4l8 1.4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IlustracaoTrilha({ clara }: { clara: boolean }) {
  const { gradId, destaque, contraste } = useCores(clara);
  return (
    <svg className={`ilustracao${clara ? ' ilustracao-clara' : ''}`} viewBox="0 0 120 90" fill="none">
      <Degrade id={gradId} />
      {/* caminho */}
      <path
        className="ilus-traco ilus-caminho"
        d="M16 74c18 0 22-20 40-20s20-22 38-26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 6"
      />
      {/* etapas: concluída, atual, próxima */}
      <circle cx="16" cy="74" r="7" fill={destaque} />
      <path d="M12.8 74.2l2.2 2.2 4.2-4.4" stroke={contraste} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="ilus-fundo" cx="56" cy="54" r="7" stroke={destaque} strokeWidth="2.5" />
      <circle cx="56" cy="54" r="2.5" fill={destaque} />
      {/* bandeira de chegada */}
      <path className="ilus-traco" d="M96 30V8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M96 9h17l-4 6 4 6H96z" fill={destaque} />
      <circle className="ilus-suave" cx="96" cy="31" r="3" />
    </svg>
  );
}
