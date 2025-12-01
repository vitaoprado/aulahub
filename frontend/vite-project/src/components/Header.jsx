import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function Header() {
  const { token, user, logout } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav('/login');
  }

  return (
    <header className="site-header">
      {/* Logo/brand */}
      <Link to="/" className="brand">
        AulaHUB
      </Link>

      {/* Menu */}
      <nav className="nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Home
        </NavLink>

        {token && (
          <NavLink
            to="/aulas-aluno"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Aulas
          </NavLink>
        )}

        {!token && (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Login
          </NavLink>
        )}
      </nav>

      {/* Status + Logout */}
      <div className={`status ${token ? 'status--green' : 'status--red'}`}>
        {token ? (
          <>
            Logado como: {user?.name || user?.email}
            <button
              type="button"
              className="btn btn--ghost"
              style={{ marginLeft: 10 }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          'Não logado'
        )}
      </div>
    </header>
  );
}
