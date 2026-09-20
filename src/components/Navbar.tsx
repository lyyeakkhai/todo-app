import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { WindowWidthTracker } from './WindowWidthTracker';
import { useAuth } from '../context/AuthContext';
import { SignInModal } from './auth/SignInModal';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="brand">
            <span className="brand-logo">✓</span>
            <h1 className="brand-title">Mission App</h1>
          </div>

          <nav className="main-nav">
            <NavLink
              to="/todos"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Todos
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Users
            </NavLink>
          </nav>

          <div className="header-actions">
            <div className="auth-nav-section">
              {user ? (
                <div className="user-session-badge">
                  <span className="user-greeting">Hi, {user.email}</span>
                  <button
                    type="button"
                    className="auth-btn sign-out-btn"
                    onClick={signOut}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="auth-btn sign-in-btn"
                  onClick={() => setIsSignInOpen(true)}
                >
                  Sign in
                </button>
              )}
            </div>

            <WindowWidthTracker />
          </div>
        </div>
      </header>

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
}
