import { NavLink } from 'react-router-dom';
import { WindowWidthTracker } from './WindowWidthTracker';

export function Navbar() {
  return (
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
        <WindowWidthTracker />
      </div>
    </header>
  );
}
