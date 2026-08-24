import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="page status-message-page">
      <h1>403</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link to="/cursos" className="btn btn-primary">
        Voltar
      </Link>
    </div>
  );
}
