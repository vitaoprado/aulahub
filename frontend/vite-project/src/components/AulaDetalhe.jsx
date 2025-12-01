import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5050';
const SLIDE_COUNT = 12;

const tile = (active) => ({
  cursor: 'pointer',
  padding: 20,
  border: active ? '2px solid white' : undefined,
  textAlign: 'center',
  fontWeight: 700
});

export default function AulaDetalhe() {
  const { id } = useParams();
  const nav = useNavigate();
  const { token, logout } = useAuth();

  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState(
    Array.from({ length: SLIDE_COUNT }, () => '')
  );
  const [active, setActive] = useState(1);
  const [err, setErr] = useState('');

  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Carrega dados da aula
  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get(`${API}/lessons/${id}`);
        setTitle(data.title || `Aula ${id}`);
        setSlides(
          data.slides || Array.from({ length: SLIDE_COUNT }, () => '')
        );
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setErr('Falha ao carregar a aula');
      }
    }
    load();
  }, [id]);

  // Carrega progresso do aluno para essa aula (se estiver logado)
  useEffect(() => {
    if (!token) {
      setCompleted(false);
      return;
    }

    async function loadProgress() {
      try {
        const { data } = await axios.get(`${API}/me/lessons-progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const found = data.some((p) => p.lesson_id === Number(id));
        setCompleted(found);
      } catch {
        // se der erro aqui, apenas não marca como concluída
      }
    }

    loadProgress();
  }, [id, token]);

  async function toggleProgress() {
    if (!token) {
      alert('Faça login para marcar a aula como concluída.');
      nav('/login');
      return;
    }

    setSavingProgress(true);
    try {
      if (!completed) {
        await axios.post(
          `${API}/lessons/${id}/progress`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompleted(true);
      } else {
        await axios.delete(`${API}/lessons/${id}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompleted(false);
      }
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error;

      if (status === 401) {
        alert('Sua sessão expirou. Faça login novamente.');
        logout();
        nav('/login');
      } else {
        alert(msg || 'Erro ao atualizar progresso');
      }
    } finally {
      setSavingProgress(false);
    }
  }

  const statusLabel = completed ? 'Concluída ✅' : 'Em andamento ⏳';
  const buttonLabel = completed
    ? 'Marcar como NÃO concluída'
    : 'Marcar como concluída';

  return (
    <div className="card card--purple" style={{ marginTop: 24 }}>
      <button
        onClick={() => nav(-1)}
        style={{
          textDecoration: 'none',
          color: 'var(--text)',
          background: 'transparent',
          borderRadius: 999,
          padding: '10px 14px',
          fontWeight: 700,
          border: '2px solid var(--purple)',
          cursor: 'pointer',
          marginBottom: 10
        }}
      >
        VOLTAR
      </button>

      <h1 style={{ marginTop: 0, textAlign: 'center' }}>{title}</h1>

      {/* Status / botão de progresso */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 8,
          marginBottom: 8
        }}
      >
        <span style={{ fontWeight: 700 }}>Status: {statusLabel}</span>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={toggleProgress}
          disabled={savingProgress}
        >
          {savingProgress ? 'Salvando...' : buttonLabel}
        </button>
      </div>

      {/* Seleção de slides */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 12
        }}
      >
        {Array.from({ length: SLIDE_COUNT }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className="card card--purple"
            onClick={() => setActive(n)}
            style={tile(active === n)}
            title={`Ver Slide ${n}`}
          >
            {`Slide ${n}`}
          </div>
        ))}
      </div>

      {/* Conteúdo do slide ativo */}
      <div className="card" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          {`Slide ${active}`}
        </h2>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {slides[active - 1] || 'Sem conteúdo.'}
        </p>
      </div>

      {err && (
        <p style={{ color: 'crimson', marginTop: 10 }}>
          {err}
        </p>
      )}
    </div>
  );
}
