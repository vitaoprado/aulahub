import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../state/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export default function AulasAluno() {
  const { token, user } = useAuth();
  const [msg, setMsg] = useState('Carregando...');
  const [progress, setProgress] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const [privRes, progRes] = await Promise.all([
          axios.get(`${API}/private`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/me/lessons-progress`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setMsg(privRes.data.message);
        setProgress(progRes.data);
      } catch (e) {
        setErr(e.response?.data?.error || 'Falha ao carregar dados do aluno.');
      }
    }

    load();
  }, [token]);

  return (
    <div style={{ maxWidth: 960, margin: '36px auto' }}>
      <div className="card card--green">
        <div style={{ maxWidth: 700 }}>
          <h1 style={{ marginTop: 0, marginBottom: 12 }}>Aulas do Aluno</h1>

          {err && <p style={{ color: 'crimson' }}>{err}</p>}

          <p style={{ margin: '8px 0' }}>{msg}</p>

          <p style={{ margin: '6px 0' }}>
            Usuário logado: <b>{user?.name}</b> ({user?.email})
          </p>

          <hr
            style={{
              borderColor: 'rgba(255,255,255,.25)',
              margin: '16px 0'
            }}
          />

          <h2 style={{ marginTop: 0 }}>Progresso nas aulas</h2>

          {progress.length === 0 && (
            <p style={{ opacity: 0.85 }}>
              Você ainda não marcou nenhuma aula como concluída.
            </p>
          )}

          {progress.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {progress.map((p) => (
                <li
                  key={p.lesson_id}
                  style={{
                    marginBottom: 8,
                    padding: 8,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,.18)',
                    background: 'rgba(0,0,0,.18)'
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {p.title || `Aula ${p.lesson_id}`}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--muted)'
                    }}
                  >
                    Concluída em{' '}
                    {new Date(p.completed_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p
            style={{
              marginTop: 16,
              opacity: 0.8,
              fontSize: 13
            }}
          >
            (Esta lista é baseada nas aulas que você marcou como concluídas
            na tela de detalhes da aula.)
          </p>
        </div>
      </div>
    </div>
  );
}
