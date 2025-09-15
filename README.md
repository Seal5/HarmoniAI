# HarmoniAI — Agentic LLM Therapist

Build empathetic, safer AI therapy experiences with multi‑agent LLMs, RAG, and clinically aligned monitoring.

## Why HarmoniAI
- Empathetic conversations guided by an agentic LLM workflow
- Grounded answers via RAG + reranking to reduce unsupported claims
- Built‑in PHQ‑9 tracking and safety checks for responsible guidance

## What’s Inside
- Agentic orchestration (Intake, RAG, Therapy Coach, Safety)
- OpenAI‑compatible generation and Cohere Rerank support
- Next.js app with Prisma + Postgres for users, chats, and PHQ‑9

## Stack
- Next.js 15 + React 19
- PostgreSQL 15/16
- Prisma ORM
- Tailwind CSS 4
- Optional: Redis (disabled by default)
 - Optional: OpenAI‑compatible LLM endpoint, Cohere Rerank for RAG

## Prerequisites
- Node.js 18+
- PostgreSQL on localhost:5432 (see `POSTGRESQL_SETUP_GUIDE.md`)

## Quick Start
1) Install dependencies
```powershell
cd "C:\Users\<you>\Documents\GitHub\harmoniai"
npm ci
```

2) Create the database and user (once)
```powershell
psql -U postgres -h localhost -p 5432
```
Inside psql:
```sql
CREATE DATABASE harmonidb;
CREATE USER harmoni WITH PASSWORD 'harmoni123';
GRANT ALL PRIVILEGES ON DATABASE harmonidb TO harmoni;
\c harmonidb
GRANT ALL ON SCHEMA public TO harmoni;
\q
```
More details: `POSTGRESQL_SETUP_GUIDE.md`.

3) Create `.env.local`
```env
# PostgreSQL
DATABASE_URL="postgresql://harmoni:harmoni123@localhost:5432/harmonidb?schema=public"
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=harmonidb
POSTGRES_USER=harmoni
POSTGRES_PASSWORD=harmoni123

# Gemini AI API Key
GEMINI_API_KEY=REPLACE_WITH_YOUR_KEY

# Redis (disabled locally)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NODE_ENV=development
```

4) Generate Prisma client and sync schema
```powershell
npx prisma generate
npx prisma db push
```

5) Run the app
```powershell
npm run dev
# or
./run-dev.bat
```
Open http://localhost:3000

## AI & RAG Configuration (optional)
Add to `.env.local` as needed (use your own keys):
```env
# OpenAI‑compatible base (e.g., local open‑weight server or provider)
OPENAI_API_KEY=sk-your-key
OPENAI_BASE_URL=https://your-openai-compatible-host/v1
OPENAI_MODEL=gpt-4o-mini

# Cohere Rerank
COHERE_API_KEY=your-cohere-key
COHERE_RERANK_MODEL=rerank-english-v3.0

# Embeddings/Vector store (example)
VECTOR_DB_URL=http://localhost:6333
VECTOR_DB_API_KEY=
```

## Prisma Workflow (dev)
- Update models in `prisma/schema.prisma`
- Regenerate client after changes:
```powershell
npx prisma generate
```
- Sync schema to the database (development):
```powershell
npx prisma db push
```
- Visual data browser:
```powershell
npx prisma studio
```
- Migrations (when you need tracked changes):
```powershell
npx prisma migrate dev -n "describe_change"
# in CI/prod
npx prisma migrate deploy
```

## Useful Scripts
- `npm run dev` — start Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — start production server

## Project Structure (high‑level)
- `src/` — application source code (Next.js)
- `prisma/` — Prisma schema and migrations
- `backend/` — backend utilities or services (if applicable)
- `public/` — static assets
- `scripts/` — helper scripts (e.g., `init-db.sql` for Docker)
