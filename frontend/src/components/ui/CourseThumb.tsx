// Miniatura de curso/trilha enquanto os cursos não têm imagem própria.
// "neutral" (padrão, usado nos cards): fundo neutro com um toque leve da marca, para que a cor
// fique reservada ao que tem significado (status, progresso, ações).
// "brand": degradê forte da marca, só para o destaque principal da página.
// O tom (posição do brilho) é escolhido pelo id, então não muda entre visitas.
function hash(texto: string) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface CourseThumbProps {
  id: string;
  titulo: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'neutral' | 'brand';
}

export function CourseThumb({ id, titulo, size = 'md', variant = 'neutral' }: CourseThumbProps) {
  const inicial = titulo.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className={`course-thumb course-thumb-${size} course-thumb-${variant}`}
      data-tone={hash(id) % 3}
      aria-hidden="true"
    >
      <span className="course-thumb-letter">{inicial}</span>
    </div>
  );
}
