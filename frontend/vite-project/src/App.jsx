import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Cadastrar from './pages/Cadastrar.jsx';
import AulasAluno from './pages/AulasAluno.jsx';
import AulaDetalhe from './components/AulaDetalhe.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';

export default function App() {
  return (
    <>
      {/* Menu fixo no topo */}
      <Header />

      {/* Conteúdo das páginas */}
      <main
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '16px 12px 32px'
        }}
      >
        <Routes>
          {/* Home (mural + aulas + cadastro de aula) */}
          <Route path="/" element={<Home />} />

          {/* Login / Cadastro */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastrar" element={<Cadastrar />} />

          {/* Área protegida do aluno */}
          <Route
            path="/aulas-aluno"
            element={
              <ProtectedRoute>
                <AulasAluno />
              </ProtectedRoute>
            }
          />

          {/* Detalhe da aula (pode ser acessada por qualquer um) */}
          <Route path="/aula/:id" element={<AulaDetalhe />} />

          {/* Qualquer rota desconhecida volta para Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
