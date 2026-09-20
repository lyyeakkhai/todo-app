import { Link } from 'react-router-dom';
import type { User } from '../types';
import { useFetch } from '../hooks/useFetch';

export function UserDirectory() {
  const { data: users, loading, error } = useFetch<User[]>('https://jsonplaceholder.typicode.com/users');

  return (
    <main className="user-directory-card">
      <div className="card-header">
        <h2>User Directory</h2>
        <p className="card-subtitle">Real-time data fetched with race condition protection</p>
      </div>

      {/* State 1: Loading Skeleton */}
      {loading && (
        <div className="skeleton-container" aria-label="Loading users">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-avatar skeleton-pulse"></div>
              <div className="skeleton-text-group">
                <div className="skeleton-line skeleton-title skeleton-pulse"></div>
                <div className="skeleton-line skeleton-subtitle skeleton-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* State 2: Error Message */}
      {!loading && error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          <button type="button" className="retry-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {/* State 3: Empty State */}
      {!loading && !error && users && users.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p className="empty-message">No users found.</p>
        </div>
      )}

      {/* State 4: Data List */}
      {!loading && !error && users && users.length > 0 && (
        <div className="user-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div className="user-info">
                <h3 className="user-name">{user.name}</h3>
                <p className="user-email">{user.email}</p>
                {user.company && (
                  <p className="user-company">🏢 {user.company.name}</p>
                )}
              </div>
              <Link to={`/users/${user.id}`} className="view-profile-btn">
                View Profile →
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
