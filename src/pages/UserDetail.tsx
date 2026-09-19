import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { User } from '../types';

function UserDetailContent({ id }: { id: string | undefined }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`User with ID ${id} not found (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data: User) => {
        if (!isCancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    // Cleanup: prevents race conditions and state updates if :id changes or component unmounts
    return () => {
      isCancelled = true;
    };
  }, [id]);

  return (
    <main className="user-detail-card">
      <div className="back-nav">
        <Link to="/users" className="back-link">
          ← Back to Users
        </Link>
      </div>

      {loading && (
        <div className="skeleton-container">
          <div className="skeleton-card detail-skeleton">
            <div className="skeleton-avatar large skeleton-pulse"></div>
            <div className="skeleton-text-group">
              <div className="skeleton-line skeleton-title skeleton-pulse"></div>
              <div className="skeleton-line skeleton-subtitle skeleton-pulse"></div>
              <div className="skeleton-line skeleton-subtitle skeleton-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          <Link to="/users" className="action-btn">
            Return to User Directory
          </Link>
        </div>
      )}

      {!loading && !error && user && (
        <article className="profile-content">
          <header className="profile-header">
            <div className="profile-avatar">{user.name.charAt(0)}</div>
            <div>
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-username">@{user.username}</p>
            </div>
          </header>

          <section className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{user.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Website</span>
              <span className="detail-value">
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.website}
                </a>
              </span>
            </div>
            {user.company && (
              <div className="detail-item">
                <span className="detail-label">Company</span>
                <span className="detail-value">
                  {user.company.name} — <em>"{user.company.catchPhrase}"</em>
                </span>
              </div>
            )}
            {user.address && (
              <div className="detail-item full-width">
                <span className="detail-label">Address</span>
                <span className="detail-value">
                  {user.address.suite}, {user.address.street}, {user.address.city}, {user.address.zipcode}
                </span>
              </div>
            )}
          </section>
        </article>
      )}
    </main>
  );
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  return <UserDetailContent key={id} id={id} />;
}
