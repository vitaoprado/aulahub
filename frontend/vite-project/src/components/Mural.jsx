import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5050';

function formatDate(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return '';
  }
}

export default function Mural() {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setErr('');
      try {
        const { data } = await axios.get(`${API}/mural?limit=50`);
        if (alive) setMessages(data);
      } catch (e) {
        if (alive) setErr('Falha ao carregar recados');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const canSend = text.trim().length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSend) return;
    try {
      const payload = { name: name.trim(), content: text.trim() };
      const { data } = await axios.post(`${API}/mural`, payload);
      setMessages((prev) => [data, ...prev]);
      setText('');
    } catch (e) {
      setErr(e.response?.data?.error || 'Falha ao enviar recado');
    }
  }

  const count = messages.length;
  const header = useMemo(() => (count === 1 ? '1 recado' : `${count} recados`), [count]);

  return (
    <section className="card card--purple mural" aria-label="Mural de recados">
      <div className="mural__header">
        <h2 className="mural__title">Mural</h2>
        <div className="mural__meta">{header}</div>
      </div>

      <form className="mural-form" onSubmit={handleSubmit}>
        <div className="mural-form__row">
          <input
            className="input"
            placeholder="Seu nome (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Nome"
          />
        </div>
        <div className="mural-form__row">
          <textarea
            className="input mural-form__textarea"
            placeholder="Escreva uma mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            aria-label="Mensagem"
          />
        </div>
        <div className="mural-form__actions">
          <button type="submit" className="btn" disabled={!canSend}>
            Enviar
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setText('')}>
            Limpar campo
          </button>
        </div>
      </form>

      {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}

      <ul className="mural-list">
        {!loading && messages.map((m) => (
          <li key={m.id} className="mural-item">
            <div className="mural-item__header">
              <strong className="mural-item__author">{m.name}</strong>
              <span className="mural-item__date">{formatDate(m.created_at || m.createdAt)}</span>
            </div>
            <p className="mural-item__text">{m.content || m.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
