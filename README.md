# SplitMint-Karbon

A full-stack expense splitting app with authentication, group + participant management, flexible split logic, balance engine with simplified settlements, search/filter endpoints, and AI-assisted expense parsing (MintSense).

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: Email/password + express-session
- AI: Google Gemini API endpoint for natural language expense parsing

## Monorepo structure
- `frontend/` React client
- `backend/` Express API

## Local setup
```bash
npm install
cp backend/.env.example backend/.env
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:4000`.

## Core API coverage
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- Groups: CRUD `/api/groups`
- Expenses: CRUD `/api/expenses`, balances `/api/expenses/balances/:groupId`
- AI: `/api/ai/parse-expense`

## Deployment guide
### Backend (Render)
1. Create new Web Service from repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env vars:
   - `MONGODB_URI`
   - `SESSION_SECRET`
   - `FRONTEND_URL`
   - `GEMINI_API_KEY` (optional)

### Frontend (Vercel)
1. Import repo in Vercel.
2. Root directory: `frontend`
3. Framework preset: Vite
4. Env var: `VITE_API_URL` = deployed backend URL + `/api`

## MongoDB Atlas
Use free-tier cluster and set `MONGODB_URI` in Render + local `.env`.

## Notes
- Optional `GEMINI_MODEL` defaults to `gemini-1.5-flash` for MintSense.
- Group size is capped at 4 total members (owner + up to 3 additional participants).
- Split modes: equal, custom fixed amounts, percentage.
- Equal split uses cent-level deterministic remainder distribution.
