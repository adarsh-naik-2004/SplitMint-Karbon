# SplitMint-Karbon Documentation

## 1) Project overview

SplitMint-Karbon is a full-stack group expense management application built for creating shared groups, recording expenses, splitting costs, and generating settlement guidance.

### Core capabilities
- Authentication with session-based login.
- Group management (create, edit, delete groups and participants).
- Expense tracking with multiple split modes:
  - Equal
  - Custom amounts
  - Percentage
- Balance engine with settlement suggestions designed to reduce transfer count.
- MintSense AI:
  - Natural language expense parsing
  - Auto-category extraction
  - Group summary generation

---

## 2) Monorepo structure

```text
SplitMint-Karbon/
├── backend/        # Express API + MongoDB models + business logic
├── frontend/       # React + Vite client UI
├── package.json    # Workspace scripts
└── documentation.md
```

### Backend highlights
- `src/controllers/` – route handlers for auth, groups, expenses, and AI.
- `src/services/` – balance computation and settlement logic.
- `src/models/` – Mongoose schemas.
- `src/routes/` – API route definitions.
- `src/middleware/` – request validation and error handling.

### Frontend highlights
- `src/App.jsx` – app state orchestration and tab navigation.
- `src/components/` – feature views and UI sections.
- `src/services/api.js` – API client wrappers.
- `src/context/ThemeContext.jsx` – light/dark mode.

---

## 3) Tech stack

### Frontend
- React 18
- Vite 5
- Tailwind CSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- express-session
- express-validator

### AI
- Google Gemini via `@google/genai`

---

## 4) Setup and run

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB URI (local MongoDB or Atlas)

## Install
```bash
npm install
```

## Configure environment
Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Typical keys:
- `PORT` (default backend port 4000)
- `MONGODB_URI`
- `SESSION_SECRET`
- `FRONTEND_URL`
- `GEMINI_API_KEY` (optional but required for full MintSense AI)
- `GEMINI_MODEL` (optional, defaults in code)

## Run development servers
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

---

## 5) Workspace scripts

From repository root:

- `npm run dev` – runs backend and frontend concurrently.
- `npm run build` – builds frontend.
- `npm run test` – runs backend tests.
- `npm run install:all` – workspace install helper.

From frontend workspace:
- `npm run dev -w frontend`
- `npm run build -w frontend`

---

## 6) Functional feature documentation

## 6.1 Authentication
- Register/login with email/password.
- Session cookie auth.
- Endpoint coverage: register, login, me, logout.

## 6.2 Groups and participants
- Create groups and add participants with color tags.
- Edit existing groups.
- Delete groups (including related expense data according to backend behavior).

## 6.3 Expense entry and split modes
For each transaction:
- Description
- Amount
- Date
- Payer
- Category
- Split participants
- Split mode (equal/custom/percentage)

### Split behavior
- Equal mode distributes totals deterministically at cent precision.
- Custom and percentage modes use explicit per-participant values.

## 6.4 Balance and settlement engine
- Net balances are computed from paid vs owed totals.
- Settlement suggestions are generated to reduce number of transfers.
- “Smart Settlements” UI visualizes who should pay whom and how much.

## 6.5 MintSense AI

### Natural language parse
Users can enter plain language in New Entry, e.g.:
- “Paid 850 for groceries today”
- “Uber ride 230 on 2026-02-10”

MintSense extracts:
- `description`
- `amount`
- `date`
- `category`

### AI summary generation
From Overview, user can click **Generate Summary** to request an AI summary for current group expenses.

### Fallback behavior
If AI is unavailable or returns insufficient output, the frontend presents fallback text so users are never left with an empty/unclear result.

---

## 7) API overview

Base URL (local): `http://localhost:4000/api`

## 7.1 Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

## 7.2 Groups
- `GET /groups`
- `POST /groups`
- `PUT /groups/:id`
- `DELETE /groups/:id`

## 7.3 Expenses
- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/:id`
- `DELETE /expenses/:id`
- `GET /expenses/balances/:groupId`

## 7.4 AI
- `POST /ai/parse-expense`
- `POST /ai/generate-summary`

---

## 8) Deployment

## Backend (Render)
1. Create new web service.
2. Set root directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Configure env vars:
   - `MONGODB_URI`
   - `SESSION_SECRET`
   - `FRONTEND_URL`
   - `GEMINI_API_KEY` (optional)

## Frontend (Vercel)
1. Import repository.
2. Root directory: `frontend`
3. Framework: Vite
4. Set env var:
   - `VITE_API_URL` = `<backend-url>/api`

---

## 9) Troubleshooting

## AI summary seems short or incomplete
- Confirm backend has `GEMINI_API_KEY`.
- Check browser network response for `/api/ai/generate-summary`.
- The UI includes fallback summary behavior if AI output is too short.

## AI parse unavailable
- If AI key is missing, parser returns fallback draft and note message.
- User can still manually edit all fields before save.

## Session/auth issues
- Verify frontend and backend origins align with cookie/session config.
- Ensure `FRONTEND_URL` is correct in backend env.

## No settlement suggestions shown
- If balances are already neutral, UI may show “Everything is perfectly balanced!”.

---

## 10) Future improvements (suggested)
- Add full API docs via OpenAPI/Swagger.
- Add end-to-end tests for AI parse + summary flows.
- Add structured analytics for settlement efficiency.
- Add export (CSV/PDF) for summaries and settlements.

