import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../state/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5050';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await axios.post(`${API}/login`, form);
      // data = { user, token }
      login(data);
      nav('/aulas-aluno');
    } catch (e) {
      setErr(e.response?.data?.error || 'Falha no login');
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '36px auto' }}>
      {/* CARD vermelho */}
      <div className="card card--red">
        <div className="form">
          <h2 style={{ marginTop: 0 }}>Login</h2>

          <form onSubmit={onSubmit}>
            <input
              className="input"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <br /><br />
            <input
              className="input"
              placeholder="Senha"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <br /><br />
            <button className="btn" type="submit">Entrar</button>
            {err && <p style={{ color: 'crimson', marginTop: 10 }}>{err}</p>}
          </form>

          <p className="helper" style={{ marginTop: 14 }}>
            Não tem conta? <Link to="/cadastrar">Cadastrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
