// Miniatura de curso/trilha: enquanto os cursos não têm imagem própria, cada um ganha um
// degradê fixo (escolhido pelo id, então não muda entre visitas) com a inicial do título.
const GRADIENTES = [
  'linear-gradient(135deg, #c84fa8, #e2734f)',
  'linear-gradient(135deg, #7c3aed, #c84fa8)',
  'linear-gradient(135deg, #2563eb, #7c3aed)',
  'linear-gradient(135deg, #0d9488, #2563eb)',
  'linear-gradient(135deg, #e2734f, #f5b14c)',
  'linear-gradient(135deg, #db2777, #7c3aed)',
];

function hash(texto: string) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function CourseThumb({ id, titulo, size = 'md' }: { id: string; titulo: string; size?: 'sm' | 'md' | 'lg' }) {
  const inicial = titulo.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className={`course-thumb course-thumb-${size}`} style={{ background: GRADIENTES[hash(id) % GRADIENTES.length] }} aria-hidden="true">
      <span className="course-thumb-letter">{inicial}</span>
    </div>
  );
}
