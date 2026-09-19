import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';

export function UserDirectory() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;

    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load users (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data: User[]) => {
        // Guard against race condition if component unmounted or effect re-ran
        if (!isCancelled) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    // Cleanup: prevents setting state if component unmounts or retry triggers
    return () => {
      isCancelled = true;
    };
  }, [retryTrigger]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryTrigger((prev) => prev + 1);
  };

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
          <button type="button" className="retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}

      {/* State 3: Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p className="empty-message">No users found.</p>
        </div>
      )}

      {/* State 4: Data List */}
      {!loading && !error && users.length > 0 && (
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
