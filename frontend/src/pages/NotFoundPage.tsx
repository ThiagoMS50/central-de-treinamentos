import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page status-message-page">
      <h1>404</h1>
      <p>Página não encontrada.</p>
      <Link to="/cursos" className="btn btn-primary">
        Voltar
      </Link>
    </div>
  );
}
