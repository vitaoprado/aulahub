import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  // se não tiver token, manda para /login
  if (!token) return <Navigate to="/login" replace />;
  // se tiver token, mostra a página protegida
  return children;
}
