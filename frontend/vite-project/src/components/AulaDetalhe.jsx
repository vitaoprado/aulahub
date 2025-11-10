import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState(Array.from({ length: SLIDE_COUNT }, () => ''));
  const [active, setActive] = useState(1);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get(`${API}/lessons/${id}`);
        setTitle(data.title || `Aula ${id}`);
        setSlides(data.slides || Array.from({ length: SLIDE_COUNT }, () => ''));
      } catch (e) {
        setErr('Falha ao carregar a aula');
      }
    }
    load();
  }, [id]);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
        {Array.from({ length: SLIDE_COUNT }, (_, i) => i + 1).map(n => (
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

      <div className="card" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>{`Slide ${active}`}</h2>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {slides[active - 1] || 'Sem conteúdo.'}
        </p>
      </div>

      {err && <p style={{ color: 'crimson', marginTop: 10 }}>{err}</p>}
    </div>
  );
}
