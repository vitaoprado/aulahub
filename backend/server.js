import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

const { Pool } = pkg;

// --- Configurações básicas ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Conexão com o banco ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Config do JWT ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const PORT = process.env.PORT || 5050;

// --- Helper: gerar token ---
function signToken(user) {
  // Colocamos dados mínimos no token; nunca a senha
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// --- Middleware de autenticação ---
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// --- Rota de saúde ---
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- Rota: cadastro de usuário ---
app.post('/usuarios', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email e password são obrigatórios' });
    }

    // Verifica se já existe email
    const exist = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exist.rowCount) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hash = await bcrypt.hash(password, 10);

    // Insere usuário
    const insert = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1,$2,$3)
       RETURNING id, name, email, created_at`,
      [name, email, hash]
    );

    const user = insert.rows[0];
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (e) {
    console.error('Erro /usuarios', e);
    return res.status(500).json({ error: 'Erro ao cadastrar' });
  }
});

// --- Rota: login ---
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email e password são obrigatórios' });
    }

    const q = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email=$1',
      [email]
    );
    if (!q.rowCount) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = q.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = signToken(user);
    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (e) {
    console.error('Erro /login', e);
    return res.status(500).json({ error: 'Erro ao logar' });
  }
});

// --- Exemplo de rota protegida ---
app.get('/private', auth, async (req, res) => {
  return res.json({
    message: `Bem-vindo, ${req.user.name}!`,
    user: req.user
  });
});

// --- Helpers para o mural ---
function tryGetUserFromHeader(req) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// --- Mural: listar mensagens ---
app.get('/mural', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
    const q = await pool.query(
      `SELECT id, name, content, created_at
       FROM mural_messages
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.json(q.rows);
  } catch (e) {
    console.error('Erro GET /mural', e);
    return res.status(500).json({ error: 'Erro ao listar recados' });
  }
});

// --- Mural: criar mensagem ---
app.post('/mural', async (req, res) => {
  try {
    const { name, content } = req.body || {};
    const text = (content || '').trim();
    const displayName = (name || '').trim() || 'Anônimo';
    if (text.length < 1 || text.length > 1000) {
      return res.status(400).json({ error: 'Mensagem deve ter entre 1 e 1000 caracteres' });
    }

    const u = tryGetUserFromHeader(req);
    const userId = u?.id || null;
    const ip = req.ip || null;

    const insert = await pool.query(
      `INSERT INTO mural_messages (name, content, user_id, ip)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, content, created_at`,
      [displayName, text, userId, ip]
    );
    return res.status(201).json(insert.rows[0]);
  } catch (e) {
    console.error('Erro POST /mural', e);
    return res.status(500).json({ error: 'Erro ao salvar recado' });
  }
});

// --- Mural: apagar mensagem (somente dono ou anônimas) ---
app.delete('/mural/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID inválido' });

    const q = await pool.query('SELECT user_id FROM mural_messages WHERE id=$1', [id]);
    if (!q.rowCount) return res.status(404).json({ error: 'Não encontrado' });
    const owner = q.rows[0].user_id;
    if (owner && owner !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await pool.query('DELETE FROM mural_messages WHERE id=$1', [id]);
    return res.status(204).send();
  } catch (e) {
    console.error('Erro DELETE /mural/:id', e);
    return res.status(500).json({ error: 'Erro ao remover recado' });
  }
});

// --- Sobe o servidor ---
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
