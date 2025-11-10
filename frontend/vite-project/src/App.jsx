import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Cadastrar from './pages/Cadastrar.jsx';
import AulasAluno from './pages/AulasAluno.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import AulaDetalhe from './components/AulaDetalhe.jsx';

import { AuthProvider } from './state/AuthContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Home + mural + cadastro de aula + grid */}
        <Route path="/" element={<Home />} />

        {/* Login / Cadastrar */}
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

        {/* Detalhe da Aula */}
        <Route path="/aula/:id" element={<AulaDetalhe />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
