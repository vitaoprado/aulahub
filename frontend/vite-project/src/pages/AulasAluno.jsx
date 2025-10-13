import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../state/AuthContext.jsx';

const API = 'http://localhost:5050';

export default function AulasAluno() {
  const { token, user } = useAuth();
  const [msg, setMsg] = useState('Carregando...');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/private`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMsg(data.message);
      } catch {
        setMsg('Falha ao carregar dados protegidos.');
      }
    })();
  }, [token]);

  return (
    <div style={{ maxWidth: 960, margin: '36px auto' }}>
      {/* CARD verde */}
      <div className="card card--green">
        <div style={{ maxWidth: 700 }}>
          <h1 style={{ marginTop: 0, marginBottom: 12 }}>Aulas do Aluno</h1>

          <p style={{ margin: '8px 0' }}>
            {msg}
          </p>

          <p style={{ margin: '6px 0' }}>
            Usuário logado: <b>{user?.name}</b> ({user?.email})
          </p>

          <hr style={{ borderColor: 'rgba(255,255,255,.25)', margin: '16px 0' }} />

          <p style={{ opacity: .85 }}>
            (No próximo sprint colocaremos a lista real de aulas aqui.)
          </p>
        </div>
      </div>
    </div>
  );
}
