# AulaHUB — AC2

Aplicação web para gerenciamento de aulas, desenvolvida em 3 camadas:

- Backend: Node.js + Express + PostgreSQL
- Banco de Dados: PostgreSQL
- Frontend: React (Vite) + React Router + Axios

---

## Funcionalidade da AC2

Mural de recados na Home:

- Frontend: formulário com nome opcional + mensagem, listagem em ordem decrescente e estilos dedicados (botão “ghost”).
- Backend: API do mural
  - `GET /mural` → lista recados
  - `POST /mural` → cria recado `{ name, content }`
  - `DELETE /mural/:id` → remove recado (somente do dono quando houver `user_id`)
- Banco: tabela `public.mural_messages` com índices e restrições.
- Testes: requests via Insomnia (GET/POST), validação de retorno 200/201.

---

## 🎯 Objetivos desta sprint (AC2)

- Entregar mural de recados integrado ao backend.
- Manter autenticação JWT e rotas protegidas.
- Garantir tema/layout e navegação funcionando com o novo recurso.

---

## 🧱 Arquitetura (resumo)

Pastas:

- `backend`: API Node/Express (`server.js`), CORS, JSON, JWT, conexão PG via Pool.
- `frontend/vite-project`: React (Vite), rotas, estado de auth, componentes e estilos (`index.css`).
- `banco`: PostgreSQL com tabelas `users` (auth) e `mural_messages` (AC2).

Fluxo do Mural:

- Home renderiza `<Mural />`.
- Mural: `GET /mural` ao carregar e `POST /mural` ao enviar.
- API persiste no Postgres e retorna `{ id, name, content, created_at }`.

---

## ✅ Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL 14+
- `backend/.env`:

```
DATABASE_URL=postgres://USUARIO:SENHA@localhost:5432/aulahub
JWT_SECRET=um-segredo
PORT=5050
```

- Opcional: Insomnia/Postman

---

## 🗃️ Banco de dados (AC2)

Tabela do mural:

```sql
CREATE TABLE IF NOT EXISTS public.mural_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  user_id INTEGER NULL REFERENCES public.users(id) ON DELETE SET NULL,
  ip INET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Índices:

```sql
CREATE INDEX IF NOT EXISTS idx_mural_messages_created_at_desc ON public.mural_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mural_messages_user_id ON public.mural_messages (user_id);
```

Consultas úteis:

```sql
SELECT id, name, content, created_at FROM public.mural_messages ORDER BY created_at DESC;
TRUNCATE TABLE public.mural_messages RESTART IDENTITY;
```

---

# AulaHUB — AC1

Aplicação web para gerenciamento de aulas, desenvolvida em 3 camadas:

- Backend: Node.js + Express + PostgreSQL
- Banco de Dados: PostgreSQL
- Frontend: React (Vite) + React Router + Axios

Funcionalidade da AC1: Autenticação básica (cadastro e login com token), rotas protegidas e layout base (home, login/cadastrar e página protegida “Aulas do Aluno”).

---

## 🎯 Objetivos desta sprint (AC1)

- [x] Configurar ambiente (Node, Postgres, Vite).
- [x] Criar tabela `users` no Postgres.
- [x] Backend: rotas de cadastro (`POST /usuarios`), login (`POST /login`) e uma rota protegida (`GET /private`).
- [x] Frontend: páginas Login, Cadastrar, Aulas do Aluno (rota protegida), Home com grade 2x2.
- [x] Contexto de autenticação (token + usuário em `localStorage`), ProtectedRoute e menu que muda quando logado.
- [x] Layout com tema galáxia, botões em “pílula”, cards com borda e status Logado/Não logado.

---

## 🧱 Arquitetura (resumo)

```text
aulahub/
├─ backend/                 # API Node/Express
│  ├─ server.js
│  ├─ .env                  # credenciais do Postgres
│  ├─ package.json
│  └─ ...
└─ frontend/
   └─ vite-project/         # SPA React (Vite)
      ├─ src/
      │  ├─ pages/          # Home, Login, Cadastrar, AulasAluno
      │  ├─ components/     # ProtectedRoute
      │  ├─ state/          # AuthContext
      │  ├─ index.css       # tema/estilos
      │  └─ main.jsx, App.jsx
      └─ package.json
```

---

## ✅ Pré-requisitos

- Node.js 18+
- PostgreSQL 14+ (com pgAdmin opcional)
- npm 9+ (vem com o Node)

---

## 🗃️ Banco de dados (AC1)

Crie um banco chamado `aulahub` e execute:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

> Senha do Postgres: use a sua senha local.

---

## 🔧 Configuração do Backend

```bash
cd backend
npm install

# backend/.env
PGHOST=localhost
PGPORT=5432
PGDATABASE=aulahub
PGUSER=postgres
PGPASSWORD=SUA_SENHA_AQUI

# Porta da API
PORT=5050

# Segredo do JWT
JWT_SECRET=um-segredo-bem-forte-aqui

# Iniciar API
npm run dev
# http://localhost:5050
```

## 💻 Configuração do Frontend

```bash
cd frontend/vite-project
npm install
npm install react-router-dom axios
npm run dev
# http://localhost:5173
```

---

## 🔐 Rotas da API (AC1)

```
POST /usuarios   # cadastro
Body: { "name": "vitor", "email": "vitor@test.com", "password": "123456" }

POST /login      # login
Body: { "email": "vitor@test.com", "password": "123456" }

GET /private     # rota protegida
Header: Authorization: Bearer <token>
```

---

## 🧭 Navegação (Frontend)

- Home (/) — grade 2x2 com cards roxos (imagens).
- Login (/login) — se logado, redireciona para /aulas-aluno.
- Cadastrar (/cadastrar) — acessível via link na página de Login (não aparece no menu).
- Aulas do Aluno (/aulas-aluno) — rota protegida.
- Se não logado → redireciona para /login.
- Menu: mostra Aulas apenas quando logado; oculta Login quando logado; exibe status Logado/Não logado e botão Logout.

---

## 🧪 Como testar (passo a passo)

1) Subir o backend (`npm run dev` dentro de `backend`).
2) Subir o frontend (`npm run dev` dentro de `frontend/vite-project`).
3) Acessar `http://localhost:5173`.
4) Cadastrar usuário novo (via link em Login).
5) Fazer login → usuário e token salvos; redireciona para `/aulas-aluno`.
6) Conferir rota protegida (retorna “Bem-vindo…” e dados do usuário).
7) Fazer logout no topo → menu volta a mostrar Login.

---

## 🧰 Tecnologias principais

- Backend: Node.js, Express, pg (PostgreSQL), bcrypt (hash), jsonwebtoken (JWT)
- Frontend: React (Vite), React Router, Axios
- Banco: PostgreSQL

---

## 📎 Entregáveis (links)

- Board do projeto (Trello/Jira/GitHub Projects): adicione aqui
- Repositório GitHub: https://github.com/vitaoprado/aulahub
- Vídeo (AC1/AC2): adicione aqui

---

## 🚀 Próximos passos (AC2)

- Área do Professor para gerenciar Aulas (CRUD).
- Tabela `aulas`, rotas protegidas `POST/GET/PUT/DELETE /aulas`.
- Listagem no frontend e associação com o professor logado.

---

## 👤 Autoria

Aluno: Vitor Prado Gonçalves

