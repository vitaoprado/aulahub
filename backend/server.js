import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

const { Pool } = pkg;

// --- App / Middlewares ---
const app = express();
app.use(cors());
app.use(express.json());

// --- DB Pool ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// --- Configs ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const PORT = process.env.PORT || 5050;
const TEACHER_PASS = process.env.TEACHER_PASS || 'AdmProfessorOK';

// --- Helpers Auth/JWT ---
function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token ausente' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

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

// --- Healthcheck ---
app.get('/health', (_req, res) => res.json({ ok: true }));

// ===================== USERS / AUTH =====================

// Cadastro
app.post('/usuarios', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email e password são obrigatórios' });
    }

    const exist = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exist.rowCount) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(password, 10);
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

// Login
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

// Rota protegida de exemplo
app.get('/private', auth, async (req, res) => {
  return res.json({ message: `Bem-vindo, ${req.user.name}!`, user: req.user });
});

// ===================== MURAL =====================

// Lista recados
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

// Cria recado
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

// Apaga recado (somente dono ou anônimas)
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

// ===================== AULAS / SLIDES =====================

// Garante o schema (cria as tabelas se não existirem)
async function ensureLessonsSchema() {
  // lessons
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lessons (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // lesson_slides (12 por aula)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_slides (
      id BIGSERIAL PRIMARY KEY,
      lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      slide_no SMALLINT NOT NULL CHECK (slide_no BETWEEN 1 AND 12),
      content TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (lesson_id, slide_no)
    );
  `);

  // progresso do aluno nas aulas (você já criou essa tabela via SQL, mas aqui garante idempotência)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, lesson_id)
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);`);
}

// Lista aulas para o grid
app.get('/lessons', async (_req, res) => {
  try {
    const q = await pool.query(
      `SELECT id, title, created_at
         FROM lessons
        ORDER BY id ASC`
    );
    return res.json(q.rows);
  } catch (e) {
    console.error('Erro GET /lessons', e);
    return res.status(500).json({ error: 'Erro ao listar aulas' });
  }
});

// Detalhe de uma aula + slides
app.get('/lessons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID inválido' });

    const aula = await pool.query(
      'SELECT id, title, created_at FROM lessons WHERE id=$1',
      [id]
    );
    if (!aula.rowCount) return res.status(404).json({ error: 'Aula não encontrada' });

    const slides = await pool.query(
      'SELECT slide_no, content FROM lesson_slides WHERE lesson_id=$1 ORDER BY slide_no ASC',
      [id]
    );

    const arr = Array.from({ length: 12 }, (_, i) => {
      const row = slides.rows.find(r => r.slide_no === i + 1);
      return row ? row.content : '';
    });

    return res.json({ id, title: aula.rows[0].title, slides: arr });
  } catch (e) {
    console.error('Erro GET /lessons/:id', e);
    return res.status(500).json({ error: 'Erro ao carregar aula' });
  }
});

// Cria nova aula (checa senha 'AdmProfessorOK')
app.post('/lessons', async (req, res) => {
  const { password, slides, title } = req.body || {};
  try {
    if (password !== TEACHER_PASS) {
      return res.status(401).json({ error: 'SENHA INCORRETA' });
    }
    if (!Array.isArray(slides) || slides.length !== 12) {
      return res.status(400).json({ error: 'slides deve ser um array de 12 textos' });
    }

    const hasContent = slides.some(s => (s || '').trim().length > 0);
    if (!hasContent) {
      return res.status(400).json({ error: 'Preencha ao menos um slide' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Cria aula
      const ins = await client.query(
        'INSERT INTO lessons (title) VALUES ($1) RETURNING id',
        ['Aula']
      );
      const lessonId = ins.rows[0].id;

      // Título final ("Aula <id>" ou o título enviado)
      const finalTitle = (title && String(title).trim()) || `Aula ${lessonId}`;
      await client.query('UPDATE lessons SET title=$1 WHERE id=$2', [finalTitle, lessonId]);

      // Insere 12 slides
      for (let i = 0; i < 12; i++) {
        await client.query(
          'INSERT INTO lesson_slides (lesson_id, slide_no, content) VALUES ($1, $2, $3)',
          [lessonId, i + 1, String(slides[i] || '')]
        );
      }

      await client.query('COMMIT');
      return res.status(201).json({ id: lessonId, title: finalTitle });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Erro POST /lessons (tx)', e);
      return res.status(500).json({ error: 'Erro ao criar aula' });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('Erro POST /lessons', e);
    return res.status(500).json({ error: 'Erro ao criar aula' });
  }
});

// ===================== PROGRESSO DO ALUNO =====================

// Lista progresso do aluno logado (quais aulas ele concluiu)
app.get('/me/lessons-progress', auth, async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT lp.lesson_id, lp.completed_at, l.title
         FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
        WHERE lp.user_id = $1
        ORDER BY lp.completed_at DESC`,
      [req.user.id]
    );
    return res.json(q.rows);
  } catch (e) {
    console.error('Erro GET /me/lessons-progress', e);
    return res.status(500).json({ error: 'Erro ao listar progresso' });
  }
});

// Marca aula como concluída para o aluno logado
app.post('/lessons/:id/progress', auth, async (req, res) => {
  const lessonId = parseInt(req.params.id);
  if (!Number.isFinite(lessonId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const inserted = await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET completed_at = EXCLUDED.completed_at
       RETURNING lesson_id, completed_at`,
      [req.user.id, lessonId]
    );
    return res.status(201).json(inserted.rows[0]);
  } catch (e) {
    console.error('Erro POST /lessons/:id/progress', e);
    return res.status(500).json({ error: 'Erro ao salvar progresso' });
  }
});

// Remove marcação de concluída
app.delete('/lessons/:id/progress', auth, async (req, res) => {
  const lessonId = parseInt(req.params.id);
  if (!Number.isFinite(lessonId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    await pool.query(
      'DELETE FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2',
      [req.user.id, lessonId]
    );
    return res.status(204).send();
  } catch (e) {
    console.error('Erro DELETE /lessons/:id/progress', e);
    return res.status(500).json({ error: 'Erro ao remover progresso' });
  }
});

// ===================== BOOT / START =====================
async function init() {
  try {
    await ensureLessonsSchema(); // garante tabelas de aula/slides/progresso
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Falha ao iniciar API', err);
    process.exit(1);
  }
}

init();
