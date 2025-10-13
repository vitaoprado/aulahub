# AulaHUB — AC1

Aplicação web para gerenciamento de aulas, desenvolvida em **3 camadas**:
- **Backend**: Node.js + Express + PostgreSQL
- **Banco de Dados**: PostgreSQL
- **Frontend**: React (Vite) + React Router + Axios

> **Funcionalidade da AC1**: Autenticação básica (cadastro e login com token), rotas protegidas e layout base (home, login/cadastrar e página protegida “Aulas do Aluno”).

---

## 🎯 Objetivos desta sprint (AC1)

- [x] Configurar ambiente (Node, Postgres, Vite).
- [x] Criar tabela `users` no Postgres.
- [x] Backend: rotas de **cadastro** (`POST /usuarios`), **login** (`POST /login`) e uma rota **protegida** (`GET /private`).
- [x] Frontend: páginas **Login**, **Cadastrar**, **Aulas do Aluno** (rota protegida), **Home** com grade 2x2.
- [x] Contexto de autenticação (token + usuário em `localStorage`), **ProtectedRoute**, e menu que muda quando logado.
- [x] Layout com **tema galáxia**, botões em “pílula”, cards com borda e **status Logado/Não logado**.

---

## 🧱 Arquitetura (resumo)

aulahub/
├─ backend/ # API Node/Express
│ ├─ server.js
│ ├─ .env # credenciais do Postgres
│ ├─ package.json
│ └─ ...
└─ frontend/
└─ vite-project/ # SPA React (Vite)
├─ src/
│ ├─ pages/ # Home, Login, Cadastrar, AulasAluno
│ ├─ components/ # ProtectedRoute
│ ├─ state/ # AuthContext
│ ├─ index.css # tema/estilos
│ └─ main.jsx, App.jsx
└─ package.json


---

## ✅ Pré-requisitos

- **Node.js** 18+  
- **PostgreSQL** 14+ (com `pgAdmin` opcional)
- **npm** 9+ (vem com o Node)

---

## 🗃️ Banco de dados

1. Crie um banco chamado **`aulahub`**.
2. Execute a criação da tabela `users`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

Senha do Postgres: use a sua senha local. (No nosso ambiente de testes usamos SENHA10.)

🔧 Configuração do Backend
cd backend
npm install

Crie o arquivo backend/.env com as suas credenciais:
PGHOST=localhost
PGPORT=5432
PGDATABASE=aulahub
PGUSER=postgres
PGPASSWORD=SUA_SENHA_AQUI

# Porta da API
PORT=5050

# Segredo para assinar o token JWT (qualquer string forte)
JWT_SECRET=um-segredo-bem-forte-aqui

Inicie a API:
npm run dev
# A API deve aparecer em: http://localhost:5050

💻 Configuração do Frontend
cd frontend/vite-project
npm install
npm install react-router-dom axios
npm run dev
# App em http://localhost:5173

🔐 Rotas da API (AC1)

POST /usuarios — cadastro
Body JSON: { "name": "vitor", "email": "vitor@test.com", "password": "123456" }
Resposta: { "user": {...}, "token": "..." }

POST /login — login
Body JSON: { "email": "vitor@test.com", "password": "123456" }
Resposta: { "user": {...}, "token": "..." }

GET /private — rota protegida
Header: Authorization: Bearer <token>
Resposta: { "message": "Bem-vindo, vitor!" , "user": {...} }

🧭 Navegação (Frontend)

Home (/) — grade 2x2 com cards roxos (imagens).

Login (/login) — se logado, redireciona para /aulas-aluno.

Cadastrar (/cadastrar) — acessível pelo link na página de Login (não aparece no menu).

Aulas do Aluno (/aulas-aluno) — rota protegida.

Se não logado → redireciona para /login.

Menu: mostra Aulas apenas quando logado; oculta Login quando logado; exibe status Logado/Não logado e botão Logout.

🧪 Como testar (passo a passo)

Subir o backend (npm run dev dentro de backend).

Subir o frontend (npm run dev dentro de frontend/vite-project).

Acessar http://localhost:5173.

Cadastrar um usuário novo (via link em Login).

Fazer login → usuário e token ficam salvos; você é levado para /aulas-aluno.

Conferir rota protegida (mostra “Bem-vindo…” e dados do usuário).

Logout no topo → menu volta a mostrar Login.

🧰 Tecnologias principais

Backend: Node.js, Express, pg (PostgreSQL), bcryptjs (hash), jsonwebtoken (JWT)

Frontend: React (Vite), React Router, Axios

Banco: PostgreSQL

📎 Entregáveis (links)

Board do projeto (Trello/Jira/GitHub Projects): [coloque o link aqui]

Repositório GitHub: [coloque o link aqui]

Vídeo (AC1): [coloque o link aqui]

🚀 Próximos passos (AC2)

Área do Professor para gerenciar Aulas (CRUD).

Tabela aulas, rotas protegidas POST/GET/PUT/DELETE /aulas.

Listagem no frontend e associação com o professor logado.

👤 Autoria

Aluno: Vitor Prado Gonçalves