import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="not-found-card">
      <div className="not-found-content">
        <span className="not-found-code">404</span>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/todos" className="action-btn">
            Go to Todos
          </Link>
          <Link to="/users" className="action-btn secondary">
            Go to Users
          </Link>
        </div>
      </div>
    </main>
  );
}
