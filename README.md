# AulaHUB — TCC IMPACTA
_______________________
AC4 _______________________

# AulaHUB

Plataforma simples para gerenciamento de aulas, mural de recados e acompanhamento de progresso. Stack: Node.js + Express + PostgreSQL + React (Vite).

## Visao geral (features)
- Autenticacao (cadastro/login) com JWT e rota protegida de exemplo.
- Mural de recados (listar, postar, apagar o proprio recado).
- Aulas/Slides: cadastro de aula com 12 slides via senha do professor (sem login), listagem e detalhe.
- Progresso do aluno: marcar/desmarcar aula como concluida e listar progresso do usuario logado.
- Frontend: SPA com Home (mural + cadastro + grid), detalhe da aula, login/cadastro e rota protegida de aluno.

## Requisitos
- Node 18+
- PostgreSQL 14+
- npm 9+ (ou yarn/pnpm)

## Config do ambiente
### Backend (`backend/.env`)
DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/aulahub
JWT_SECRET=um-segredo
PORT=5050
TEACHER_PASS=AdmProfessorOK # senha exigida no POST /lessons



### Frontend (`frontend/vite-project/.env`, opcional)
VITE_API_URL=http://localhost:5050



## Como rodar
### Backend
```bash
cd backend
npm install
npm run dev   # http://localhost:5050
# healthcheck: GET /health -> {"ok":true}
Frontend
bash

cd frontend/vite-project
npm install
npm run dev   # http://localhost:5173
Banco de dados (schemas principais)
sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mural_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  ip INET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_slides (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  slide_no SMALLINT NOT NULL CHECK (slide_no BETWEEN 1 AND 12),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, slide_no)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
Indices criados: idx_lessons_created_at, idx_progress_user, idx_progress_lesson.

API (backend server.js)
Auth:
POST /usuarios — cadastra usuario {name,email,password}.
POST /login — autentica e retorna { user, token }.
GET /private — exemplo de rota protegida (Bearer token).
Mural:
GET /mural?limit=50 — lista recados (mais recentes primeiro).
POST /mural — cria recado { name?, content } (com ou sem login).
DELETE /mural/:id — remove recado (dono logado).
Aulas/Slides:
GET /lessons — lista aulas (id, title, created_at).
GET /lessons/:id — aula + array de 12 slides.
POST /lessons — cria aula (senha do professor obrigatoria):
json

{ "password": "AdmProfessorOK", "title": "Opcional", "slides": ["s1", ... "s12"] }
Progresso do aluno:
GET /me/lessons-progress — aulas concluidas pelo usuario logado.
POST /lessons/:id/progress — marca aula como concluida (upsert).
DELETE /lessons/:id/progress — remove marca de concluida.
Exemplos cURL rapidos:

bash

# listar mural
curl http://localhost:5050/mural

# criar recado
curl -X POST http://localhost:5050/mural -H "Content-Type: application/json" \
  -d '{"name":"Ana","content":"Oi equipe"}'

# criar aula (senha ok)
curl -X POST http://localhost:5050/lessons -H "Content-Type: application/json" \
  -d '{"password":"AdmProfessorOK","slides":["a","b","c","d","e","f","g","h","i","j","k","l"]}'
Frontend (React/Vite)
Rotas principais (src/App.jsx):

/ Home — mural, cadastro de aula (12 slides + senha), grid de aulas.
/aula/:id — detalhe da aula (seleciona slide para visualizar).
/login — login; redireciona se ja logado.
/cadastrar — cadastro de usuario.
/aulas-aluno — rota protegida (exibe aulas do aluno/progresso).
Componentes-chave:

components/Mural.jsx — lista/envia recados.
components/CadastroAula.jsx — formulario de 12 slides + senha do professor.
components/GridAulas.jsx — cards de aulas.
components/AulaDetalhe.jsx — visualizacao de slides.
components/Header.jsx — nav com status de login/logout.
pages/AulasAluno.jsx — exemplo de rota protegida usando token.
Auth Context: state/AuthContext.jsx armazena user + token (localStorage), oferece login/logout e ProtectedRoute.jsx.

Estilos principais: src/index.css, src/App.css (tema espacial com cards).

Estrutura do projeto

backend/
  server.js
  package.json
  .env.example
frontend/vite-project/
  src/
    components/ (Mural, CadastroAula, GridAulas, AulaDetalhe, Header, ProtectedRoute)
    pages/ (Home, Login, Cadastrar, AulasAluno)
    state/AuthContext.jsx
    App.jsx, main.jsx, index.css, App.css
Fluxos de teste rapidos
Suba backend e frontend.
Home: enviar recado e ver listagem atualizada.
Cadastro/Login: criar usuario, logar, acessar /aulas-aluno (deve permitir).
Criar aula: preencher alguns slides, senha AdmProfessorOK, confirmar; grid deve mostrar nova aula; abrir /aula/:id.
Progresso: logado, POST /lessons/:id/progress deve marcar aula; GET /me/lessons-progress lista; DELETE /lessons/:id/progress limpa.
Erro de senha: POST /lessons com senha errada retorna 401 SENHA INCORRETA e nada muda no DB.
Notas de seguranca
Nao exponha TEACHER_PASS no frontend.
Restrinja CORS e variaveis de ambiente em producao.
Tokens JWT expiram em 2h; renove via login.
Changelog resumido
AC1: auth (cadastro/login), rota protegida, tema base.
AC2: mural de recados (API + UI) e tabela mural_messages.
AC3: aulas/slides (tabelas lessons/lesson_slides), endpoints GET/POST, UI de cadastro e detalhe.
Novo: progresso do aluno (tabela lesson_progress + endpoints) e integrações no front.






__________________________
___________________________
Plataforma simples para gerenciamento de aulas com autenticação, mural de recados e **cadastro/visualização de aulas** (AC3).  
Stack: **Node.js + Express + PostgreSQL + React (Vite)**.

## Índice
- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Executando o projeto](#executando-o-projeto)
- [Banco de Dados (AC1, AC2, AC3)](#banco-de-dados-ac1-ac2-ac3)
- [API — Endpoints](#api--endpoints)
  - [Autenticação (AC1)](#autenticação-ac1)
  - [Mural de Recados (AC2)](#mural-de-recados-ac2)
  - [Aulas / Slides (AC3)](#aulas--slides-ac3)
- [Frontend — Rotas / Páginas](#frontend--rotas--páginas)
- [Fluxos de Teste / Evidências](#fluxos-de-teste--evidências)
- [Notas de Segurança](#notas-de-segurança)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Changelog](#changelog)

---

## Arquitetura
- **Backend**: Node.js (Express), conexão com **PostgreSQL** via `pg`, autenticação `JWT`, `bcrypt` p/ senhas, `cors`, `dotenv`.
- **Frontend**: React (Vite), `axios` para consumir API, `react-router-dom` para rotas, Context de autenticação.
- **Banco**: PostgreSQL com tabelas de usuários, mural e, no AC3, **aulas/slides**.

---

## Requisitos
- Node 18+  
- PostgreSQL 14+  
- npm 9+ (ou pnpm/yarn, se preferir)

---

## Configuração de Ambiente

### 1) Backend (`/backend/.env`)
Crie um arquivo `.env` na pasta `backend`:

DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/aulahub
JWT_SECRET=um-segredo
PORT=5050
Senha exigida no endpoint POST /lessons (AC3)
TEACHER_PASS=AdmProfessorOK
perl
Copiar código

> Dica: se sua senha do Postgres tiver caracteres especiais, use normalmente (sem aspas).  
> Caso `TEACHER_PASS` não esteja definido, o backend usa `AdmProfessorOK` como padrão.

### 2) Frontend (`/frontend/vite-project/.env` — opcional)
Se quiser parametrizar a URL da API:
VITE_API_URL=http://localhost:5050
yaml
Copiar código

---

## Executando o projeto

### Backend
```bash
cd backend
npm install
npm run dev
# API em http://localhost:5050
Healthcheck: abra http://localhost:5050/health → {"ok":true}.
Frontend
bash
Copiar código
cd frontend/vite-project
npm install
npm run dev
# App em http://localhost:5173
Banco de Dados (AC1, AC2, AC3)
AC1 — Usuários
Tabela users (id, name, email único, password_hash, created_at).
AC2 — Mural
Tabela mural_messages (id, name, content, user_id (opcional), ip, created_at) + índices.
AC3 — Aulas/Slides (NOVO)
No backend, o boot cria automaticamente se não existir (via ensureLessonsSchema()):
sql
Copiar código
CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_slides (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  slide_no SMALLINT NOT NULL CHECK (slide_no BETWEEN 1 AND 12),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, slide_no)
);

CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at DESC);
API — Endpoints
Autenticação (AC1)
POST /usuarios — cadastra usuário (name, email, password).
POST /login — autentica (email, password) e retorna { user, token }.
GET /private — exemplo de rota protegida (enviar Authorization: Bearer <token>).
Mural de Recados (AC2)
GET /mural — lista recados (ordem desc, ?limit= opcional).
POST /mural — cria recado { name?, content } (com ou sem login).
DELETE /mural/:id — apaga recado (somente o autor quando logado).
Aulas / Slides (AC3)
Sem login. Proteção por senha do professor no servidor (TEACHER_PASS).
GET /lessons
Retorna lista de aulas:
json
Copiar código
[
  { "id": 1, "title": "Aula 1", "created_at": "2025-10-14T10:00:00.000Z" },
  ...
]
GET /lessons/:id
Retorna aula + 12 slides (string vazia quando não preenchido):
json
Copiar código
{
  "id": 3,
  "title": "Aula 3",
  "slides": ["texto do slide 1", "texto do slide 2", ..., ""]
}
POST /lessons
Cria aula (12 slides). Requer senha válida:
json
Copiar código
{
  "password": "AdmProfessorOK",
  "slides": ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12"]
}
Respostas:
201 { "id": 3, "title": "Aula 3" }
401 { "error": "SENHA INCORRETA" }
400 erros de validação
Exemplos cURL
bash
Copiar código
# listar
curl http://localhost:5050/lessons

# detalhes
curl http://localhost:5050/lessons/3

# criar (senha correta)
curl -X POST http://localhost:5050/lessons \
  -H "Content-Type: application/json" \
  -d '{"password":"AdmProfessorOK","slides":["a","b","c","d","e","f","g","h","i","j","k","l"]}'
Frontend — Rotas / Páginas
/ — Home com:
Mural (AC2)
Banners
Cadastro de Aula (AC3): editor com 12 slides, “LIMPAR TUDO”, senha “INSIRA SUA SENHA…”, confirmação antes de enviar.
Grid de Aulas (AC3): cards “Aula X”.
/aula/:id — Visualização da aula (12 caixas “Slide 1..12” + painel com conteúdo do slide selecionado).
/login, /cadastrar — fluxo de autenticação (AC1).
/aulas-aluno — exemplo de rota protegida (AC1).
Fluxos de Teste / Evidências
Antes/Depois no banco (para vídeo):
ANTES (Query Tool no aulahub):
sql
Copiar código
SELECT 'lessons' tabela, COUNT(*) linhas FROM public.lessons
UNION ALL
SELECT 'lesson_slides', COUNT(*) FROM public.lesson_slides;
→ Deve retornar 0 / 0 antes do envio.
Cadastro pela Home:
Preencha alguns slides;
Digite AdmProfessorOK em “INSIRA SUA SENHA…”;
Clique ENVIAR AULA e confirme.
DEPOIS:
Refaça a consulta de contagem (deve ser ≥1 e ≥12);
Confira a última aula e seus slides:
sql
Copiar código
SELECT MAX(id) FROM public.lessons;
SELECT id, title, created_at FROM public.lessons ORDER BY id DESC LIMIT 1;
SELECT slide_no, content FROM public.lesson_slides
  WHERE lesson_id = (SELECT MAX(id) FROM public.lessons)
  ORDER BY slide_no;
Senha incorreta:
Envie com senha errada → frontend mostra “SENHA INCORRETA” e DB não muda (contagens permanecem iguais).
Notas de Segurança
O cadastro de aulas não exige login (requisito do AC3), porém a criação só é aceita com a senha do professor (TEACHER_PASS), validada no backend.
Nunca expor TEACHER_PASS no frontend.
Para produção, restrinja CORS e considere autenticação “professor” real.
Estrutura do Projeto
bash
Copiar código
/backend
  ├─ server.js
  ├─ package.json
  └─ .env

/frontend/vite-project
  ├─ src
  │  ├─ components
  │  │  ├─ Mural.jsx
  │  │  ├─ CadastroAula.jsx        # AC3
  │  │  ├─ GridAulas.jsx           # AC3
  │  │  └─ AulaDetalhe.jsx         # AC3 (pode ficar em /pages)
  │  ├─ pages
  │  │  ├─ Home.jsx                # inclui Cadastro + Grid
  │  │  ├─ Login.jsx
  │  │  ├─ Cadastrar.jsx
  │  │  └─ AulasAluno.jsx
  │  ├─ state/AuthContext.jsx
  │  ├─ App.jsx                    # <Routes/> (BrowserRouter está em main.jsx)
  │  ├─ main.jsx                   # único <BrowserRouter>
  │  └─ index.css
  └─ package.json
Changelog
AC3 (NOVO):
BD: lessons e lesson_slides (+ índice); criação automática no boot.
API: GET /lessons, GET /lessons/:id, POST /lessons (senha TEACHER_PASS).
FE: CadastroAula, GridAulas, AulaDetalhe; Home e rotas atualizadas; correção do <Router> duplicado.
AC2: mural de recados (lista, cria, apaga) e tabela mural_messages.
AC1: autenticação com cadastro/login, JWT e rotas protegidas.
sql
Copiar código

---

## 🔧 Somente o trecho novo (AC3) — para **colar no README existente**
Use este bloco se você preferir **não substituir** o seu README inteiro:

```markdown
### AC3 — Aulas/Slides (NOVO)

**Fluxo:** na Home, bloco “Cadastro de Aula” (sem login) com editor de **12 slides**.  
O envio exige **senha do professor** (“INSIRA SUA SENHA…”) e faz uma confirmação antes de criar.  
Após cadastrar, a aula aparece no **grid** e pode ser aberta em `/aula/:id` para visualização.

**Banco:** tabelas `lessons` e `lesson_slides` (12 slides por aula), criadas automaticamente no boot:
```sql
CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_slides (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  slide_no SMALLINT NOT NULL CHECK (slide_no BETWEEN 1 AND 12),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, slide_no)
);
Variáveis (.env do backend):
ini
Copiar código
TEACHER_PASS=AdmProfessorOK
API:
GET /lessons → lista aulas
GET /lessons/:id → aula + array com 12 slides
POST /lessons → cria aula (requer { password: TEACHER_PASS, slides: [12 strings] })
Testes/Evidências (para vídeo):
Antes: contagens 0/0 (lessons/lesson_slides) no Query Tool;
Envio pela Home (AdmProfessorOK) → grid mostra “Aula X”;
Depois: contagens ≥1/≥12 e consulta de slides;
Senha errada → “SENHA INCORRETA” (HTTP 401) e DB inalterado.

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

