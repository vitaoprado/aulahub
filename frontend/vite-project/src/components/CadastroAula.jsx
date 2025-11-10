import React, { useMemo, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5050';
const SLIDE_COUNT = 12;

const btnStyle = (secondary = false, active = false) => ({
  textDecoration: 'none',
  color: 'var(--text)',
  background: secondary ? 'transparent' : 'var(--purple)',
  borderRadius: 999,
  padding: '10px 14px',
  fontWeight: 700,
  display: 'inline-block',
  border: secondary ? '2px solid var(--purple)' : '2px solid var(--purple)',
  boxShadow: active
    ? '0 0 0 2px var(--purple), 0 0 28px rgba(122,77,255,.25), 0 0 6px var(--purple)'
    : '0 0 0 2px var(--purple), 0 0 20px rgba(122,77,255,.25) inset',
  cursor: 'pointer'
});

export default function CadastroAula({ onCreated }) {
  const [active, setActive] = useState(1);
  const [slides, setSlides] = useState(() => Array.from({ length: SLIDE_COUNT }, () => ''));
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const placeholder = useMemo(() => `Insira o conteúdo do Slide ${active}...`, [active]);

  function updateSlideContent(value) {
    setSlides((prev) => {
      const next = [...prev];
      next[active - 1] = value;
      return next;
    });
  }

  function limparTudo() {
    const ok = window.confirm('Você realmente deseja apagar todas as informações dos slides?');
    if (!ok) return;
    setSlides(Array.from({ length: SLIDE_COUNT }, () => ''));
    setMsg('');
    setErr('');
  }

  async function enviarAula() {
    setMsg(''); setErr('');
    if (!password) {
      setErr('Informe a senha.');
      return;
    }
    const ok = window.confirm('Gostaria de enviar a sua aula?');
    if (!ok) return;

    try {
      setSending(true);
      const payload = { password, slides };
      const { data } = await axios.post(`${API}/lessons`, payload);
      setMsg(`Aula criada: ${data.title} (id=${data.id})`);
      setSlides(Array.from({ length: SLIDE_COUNT }, () => ''));
      setPassword('');
      if (onCreated) onCreated(); // avisa o pai pra recarregar o grid
    } catch (e) {
      const m = e.response?.data?.error || 'Falha ao enviar aula';
      setErr(m);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card card--purple" style={{ marginTop: 24 }}>
      <h2 style={{ marginTop: 0 }}>Cadastro de Aula</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Editor: textarea do slide ativo */}
        <div style={{ flex: '1 1 520px', minWidth: 320 }}>
          <textarea
            className="input"
            rows={12}
            placeholder={placeholder}
            value={slides[active - 1]}
            onChange={(e) => updateSlideContent(e.target.value)}
            style={{ width: '100%', minHeight: 260 }}
          />
        </div>

        {/* Botões de Slides (1..12) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, minWidth: 260 }}>
          {Array.from({ length: SLIDE_COUNT }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              style={btnStyle(false, active === n)}
              onClick={() => setActive(n)}
              title={`Editar Slide ${n}`}
            >
              {`Slide ${n}`}
            </button>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle(true)} onClick={limparTudo}>
          LIMPAR TUDO
        </button>

        <button type="button" style={btnStyle()} onClick={enviarAula} disabled={sending}>
          {sending ? 'Enviando...' : 'ENVIAR AULA'}
        </button>

        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="INSIRA SUA SENHA..."
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {msg && <p style={{ color: 'var(--green)', marginTop: 10 }}>{msg}</p>}
      {err && <p style={{ color: 'crimson', marginTop: 10 }}>{err}</p>}
    </section>
  );
}
