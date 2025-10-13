import React from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Cadastrar from './pages/Cadastrar.jsx';
import AulasAluno from './pages/AulasAluno.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './state/AuthContext.jsx';

/** Somente visitantes (não logados) podem ver as rotas-filhas */
function GuestRoute({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/aulas-aluno" replace />;
  return children;
}

function Layout({ children }) {
  const nav = useNavigate();
  const { user, logout, token } = useAuth();

  return (
    <div>
      {/* HEADER */}
      <header className="site-header">
        {/* TÍTULO H1 destacado */}
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '.6px'
          }}
        >
          <NavLink to="/" className="brand" style={{ textDecoration: 'none' }}>
            AulaHUB
          </NavLink>
        </h1>

        {/* MENU */}
        <nav className="nav" style={{ marginLeft: 14 }}>
          {/* HOME sempre visível */}
          <NavLink to="/" end>
            Home
          </NavLink>

          {/* AULAS só aparece após login */}
          {token && (
            <NavLink to="/aulas-aluno">
              Aulas
            </NavLink>
          )}

          {/* LOGIN aparece somente se NÃO estiver logado */}
          {!token && <NavLink to="/login">Login</NavLink>}
          {/* Cadastrar foi removido do menu. Continua acessível pelo link dentro da página de Login. */}
        </nav>

        {/* STATUS + LOGOUT */}
        <div className={`status ${user ? 'status--green' : 'status--red'}`} style={{ marginLeft: 'auto' }}>
          {user ? 'Logado' : 'Não logado'}
        </div>

        {user && (
          <button
            className="btn"
            style={{ marginLeft: 12 }}
            onClick={() => {
              logout();
              nav('/login');
            }}
          >
            Logout
          </button>
        )}
      </header>

      {/* Linha fina sob o header */}
      <hr style={{ borderColor: 'rgba(255,255,255,.25)', margin: 0 }} />

      {/* CONTEÚDO */}
      <main style={{ padding: 20 }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* HOME como página inicial */}
        <Route path="/" element={<Home />} />

        {/* LOGIN e CADASTRAR apenas para visitantes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/cadastrar"
          element={
            <GuestRoute>
              <Cadastrar />
            </GuestRoute>
          }
        />

        {/* AULAS protegida */}
        <Route
          path="/aulas-aluno"
          element={
            <ProtectedRoute>
              <AulasAluno />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
