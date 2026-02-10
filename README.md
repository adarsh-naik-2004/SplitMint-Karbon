# SplitMint-Karbon

SplitMint-Karbon is a full-stack group expense management platform for teams, friends, trips, and shared households. It helps users create groups, track spending, split costs fairly, and settle balances with minimal payment transfers.

It includes **MintSense AI** for natural-language expense parsing and readable group-level financial summaries.

---

## Table of Contents
- [1. What this project does](#1-what-this-project-does)
- [2. Complete feature list](#2-complete-feature-list)
- [3. Product flow](#3-product-flow)
- [4. Tech stack](#4-tech-stack)
- [5. Monorepo structure](#5-monorepo-structure)
- [6. Local setup](#6-local-setup)
- [7. Environment variables](#7-environment-variables)
- [8. Available scripts](#8-available-scripts)
- [9. API coverage](#9-api-coverage)
- [10. MintSense AI capabilities](#10-mintsense-ai-capabilities)
- [11. Smart settlement engine](#11-smart-settlement-engine)
- [12. Deployment guide](#12-deployment-guide)
- [13. Troubleshooting](#13-troubleshooting)
- [14. Extended docs](#14-extended-docs)

---

## 1. What this project does

SplitMint-Karbon solves three core problems in shared expenses:

1. **Tracking:** Capture who paid, how much, for what, and when.
2. **Splitting:** Divide expenses by equal, custom amount, or percentage logic.
3. **Settling:** Compute net balances and recommend minimal payment paths.

---

## 2. Complete feature list

## A) Authentication & user session
- User registration with name/email/password.
- Login/logout with session cookie auth.
- Authenticated `me` endpoint for persistent app session.

## B) Group management
- Create groups with participants.
- Edit group details and participants.
- Delete groups.
- Color-coded participant identities for easier tracking in UI.

## C) Expense management
- Create, update, delete expenses.
- Expense attributes include:
  - Description
  - Amount
  - Date
  - Payer
  - Category
  - Notes (if provided)
  - Split participants and split values
- Filter/search support (query, participant, amount range, date range, category via backend API).

## D) Split modes
- **Equal split:** deterministic distribution with cent precision.
- **Custom split:** user-defined fixed amount per participant.
- **Percentage split:** user-defined % split per participant.

## E) Balance & settlements
- Net balances per participant (paid vs owed).
- Suggested settlement transfers to reduce number of transactions.
- “Smart Settlements” UI showing payer → receiver → amount.

## F) MintSense AI
- Parse plain language into structured expense draft.
- Auto-categorize parsed expense.
- Generate readable group summaries.
- Fallback summary behavior if AI output is too short/unavailable.

## G) Responsive UI
- Dashboard-first tab experience.
- Mobile menu for accessing tabs/pages on small devices.
- Reused responsive sidebar patterns across breakpoints.

---

## 3. Product flow

1. User signs in.
2. User creates/selects a group.
3. User records expenses (manual form or AI parse).
4. App computes balances and settlement recommendations.
5. User checks Overview:
   - total spend,
   - personal net,
   - pending settlements,
   - AI summary.

---

## 4. Tech stack

### Frontend
- React 18
- Vite 5
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- express-session
- express-validator

### AI integration
- Google Gemini via `@google/genai`

---

## 5. Monorepo structure

```text
SplitMint-Karbon/
├── backend/              # Express API, controllers, models, services
├── frontend/             # React UI
├── documentation.md      # Detailed technical/product documentation
├── package.json          # Workspace scripts
└── package-lock.json
```

---

## 6. Local setup

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)

### Install dependencies
```bash
npm install
```

### Configure backend environment
```bash
cp backend/.env.example backend/.env
```

### Run development mode
```bash
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

---

## 7. Environment variables

Set in `backend/.env`:

- `PORT` (optional; defaults to backend config)
- `MONGODB_URI` (required)
- `SESSION_SECRET` (required)
- `FRONTEND_URL` (required for cookie/session origin policy)
- `GEMINI_API_KEY` (optional, required for full MintSense AI)
- `GEMINI_MODEL` (optional, defaults in code)

Set in frontend deployment env:
- `VITE_API_URL` → `<your-backend-url>/api`

---

## 8. Available scripts

From repo root:

- `npm run dev` — run backend + frontend concurrently.
- `npm run build` — build frontend production bundle.
- `npm run test` — run backend tests.
- `npm run install:all` — install all workspace dependencies.

Frontend workspace examples:
- `npm run dev -w frontend`
- `npm run build -w frontend`

---

## 9. API coverage

Base URL (local): `http://localhost:4000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Groups
- `GET /groups`
- `POST /groups`
- `PUT /groups/:id`
- `DELETE /groups/:id`

### Expenses
- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/:id`
- `DELETE /expenses/:id`
- `GET /expenses/balances/:groupId`

### AI
- `POST /ai/parse-expense`
- `POST /ai/generate-summary`

---

## 10. MintSense AI capabilities

## 10.1 Natural-language expense parsing
Example prompts:
- “Paid 850 for groceries today”
- “Uber ride 230 on 2026-02-10”
- “Dinner at BBQ Nation yesterday 1800”

Parser extracts:
- Description
- Amount
- Date
- Category

## 10.2 AI summary generation
Overview includes **Generate Summary**, which requests a readable narrative for current group expenses.

## 10.3 Fallback handling
If AI output is too short or AI endpoint fails, the UI displays a computed fallback summary for reliability.

---

## 11. Smart settlement engine

The settlement engine computes net balances and recommends transfer paths designed to minimize transaction count.

In UI, this appears in the **Overview → Smart Settlements** section.

---

## 12. Deployment guide

## Backend (Render)
1. Create web service from repo.
2. Set root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Configure env vars:
   - `MONGODB_URI`
   - `SESSION_SECRET`
   - `FRONTEND_URL`
   - optional `GEMINI_API_KEY`

## Frontend (Vercel)
1. Import repo.
2. Set root directory: `frontend`
3. Framework: Vite
4. Set env var:
   - `VITE_API_URL=<backend-url>/api`

---

## 13. Troubleshooting

## AI summary not useful/too short
- Verify `GEMINI_API_KEY` is configured in backend.
- Check network response of `/api/ai/generate-summary`.
- App includes fallback summary logic on short/error responses.

## AI parsing unavailable
- Without Gemini key, parser returns fallback draft and note.
- User can still manually complete and save expense.

## Settlement list empty
- Possible that balances are already neutral.
- Check if expenses exist and participant splits are valid.

## Session/login issues
- Ensure backend `FRONTEND_URL` matches frontend origin.
- Verify cookies are not blocked by browser/site policy.

---

## 14. Extended docs

For deeper documentation (architecture notes, implementation details, and expanded references), see:

- [`documentation.md`](./documentation.md)

