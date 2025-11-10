import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const tileStyle = {
  cursor: 'pointer',
  textAlign: 'center',
  padding: 18
};

export default function GridAulas({ refreshKey }) {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    try {
      const { data } = await axios.get(`${API}/lessons`);
      setList(data);
    } catch (e) {
      setErr('Falha ao carregar aulas');
    }
  }

  useEffect(() => { load(); }, [refreshKey]);

  return (
    <section style={{ marginTop: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {list.map(a => (
          <div
            key={a.id}
            className="card card--purple"
            style={tileStyle}
            onClick={() => nav(`/aula/${a.id}`)}
            title="Abrir Aula"
          >
            <h3 style={{ margin: 0 }}>{a.title}</h3>
          </div>
        ))}
      </div>
      {err && <p style={{ color: 'crimson', marginTop: 10 }}>{err}</p>}
    </section>
  );
}
