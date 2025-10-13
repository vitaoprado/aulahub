import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../state/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5050';

export default function Cadastrar() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const { data } = await axios.post(`${API}/usuarios`, form);
      // já mantém logado se quiser; vamos só mostrar mensagem e mandar pro login
      login(data);
      setMsg('Cadastro realizado! Redirecionando para o login...');
      setTimeout(() => nav('/login'), 900);
    } catch (e) {
      setErr(e.response?.data?.error || 'Falha no cadastro');
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '36px auto' }}>
      {/* CARD vermelho */}
      <div className="card card--red">
        <div className="form">
          <h2 style={{ marginTop: 0 }}>Cadastrar</h2>

          <form onSubmit={onSubmit}>
            <input
              className="input"
              placeholder="Nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <br /><br />
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
            <button className="btn" type="submit">Criar conta</button>

            {msg && <p style={{ color: 'var(--green)', marginTop: 10 }}>{msg}</p>}
            {err && <p style={{ color: 'crimson', marginTop: 10 }}>{err}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
