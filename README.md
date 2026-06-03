# Finance OS

A full-stack personal finance management application built with **Next.js 14** (frontend) and **Express 5 + MongoDB** (backend).

Track accounts, plan budgets, hit savings goals, and visualize your cashflow — all in one calm dashboard.

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui components
- **TanStack React Query v5** — data fetching with optimistic updates
- **React Hook Form** + Zod — form validation
- **Recharts** — analytics charts
- **Axios** — API client with silent refresh token retry
- **Sonner** — toast notifications
- **Vitest** + React Testing Library — unit tests

### Backend
- **Express 5** + Node.js
- **MongoDB** + Mongoose ODM
- **JWT** — httpOnly cookie auth with 15-min access tokens + 7-day refresh tokens
- **Zod** — request validation on all endpoints
- **Helmet** — security headers
- **node-cron** — recurring transaction automation
- **Jest** + Supertest + `mongodb-memory-server` — integration tests

---

## Project Structure

```
finance-os/
├── src/                        # Next.js frontend
│   ├── app/
│   │   ├── (auth)/             # Login & Register
│   │   └── (dashboard)/        # All protected pages
│   │       ├── analytics/      # Charts & summary
│   │       ├── accounts/
│   │       ├── budgets/
│   │       ├── categories/
│   │       ├── goals/
│   │       ├── import-export/
│   │       ├── profile/
│   │       ├── recurring/
│   │       └── transactions/
│   ├── auth/                   # AuthContext, useAuth hook
│   ├── components/
│   │   ├── features/           # MainLayout, AuthGuard
│   │   ├── providers/          # QueryClient, Toaster, AuthProvider
│   │   ├── shared/             # ErrorBoundary, EmptyState, FAB, Modal, etc.
│   │   └── ui/                 # shadcn/ui primitives
│   ├── hooks/                  # React Query hooks per domain
│   ├── lib/                    # api.ts, queryKeys.ts, format.ts, cleanPayload.ts
│   ├── test/                   # Vitest unit tests
│   └── types/                  # TypeScript interfaces
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # env.js (Zod-validated), db.js
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # auth, validate, rateLimit, errorHandler
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── services/           # transaction, recurring, seed, cron
│   │   ├── utils/              # ApiError, asyncHandler, generateToken, logger
│   │   └── validators/         # Zod schemas
│   └── tests/                  # Jest integration tests
├── .github/workflows/ci.yml    # CI pipeline
├── .husky/pre-commit           # Lint-staged pre-commit hook
└── vitest.config.ts
```

---

## Features

### Core
- **Accounts** — Bank, cash, credit card, investment, loan, wallet
- **Transactions** — Income, expense, transfer with pagination, search, and filters
- **Budgets** — Weekly/monthly/yearly with spend tracking and alert thresholds
- **Goals** — Savings goals with contribution tracking
- **Categories** — Custom categories with color and icon
- **Recurring** — Rule-based recurring transactions (daily/weekly/monthly/yearly)
- **Analytics** — Summary cards, cashflow bar chart, category pie chart, trend line
- **Import/Export** — CSV import and export

### Security
- JWT stored in **httpOnly cookies** (not localStorage)
- **15-minute access tokens** with **7-day refresh tokens** — silent renewal via `/auth/refresh`
- Axios interceptor queues concurrent requests during token refresh and retries them
- **Brute-force rate limiting** on login (5 attempts / 15 min)
- **Helmet.js** security headers on all responses
- **Custom NoSQL injection sanitizer** on request body (strips `$`-prefixed keys)
- Strong password policy enforced in Zod (uppercase + number + special character)
- `CORS_ORIGINS` **must** be explicitly set in production — server refuses to start with wildcard

### UX
- **Dark mode** toggle (persisted)
- **Global error boundary** wrapping all dashboard pages
- **Empty states** with CTAs on every list page
- **Optimistic deletes** — transactions and accounts removed from UI instantly, rolled back on error
- **Debounced search** on transactions page (300ms)
- **Floating action button** for quick transaction entry
- **Loading skeletons** on all data-heavy pages

### Backend reliability
- **Atomic transfers** — `POST /transactions/transfer` uses MongoDB sessions
- **Soft deletes** on transactions (`deletedAt`) to preserve history
- **Daily cron job** (`node-cron`) processes all due recurring transactions at midnight
- Currency copied from account at transaction creation time
- MongoDB compound indexes for user + date + account queries

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local instance or Atlas)

### 1. Clone

```bash
git clone https://github.com/Gdhanush-13/finance-os.git
cd finance-os/finance-os-main
```

### 2. Backend

```bash
cd server
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                 # starts on http://localhost:5000
```

### 3. Frontend

```bash
# from repo root
cp .env.example .env.local  # set NEXT_PUBLIC_API_BASE_URL if needed
npm install
npm run dev                 # starts on http://localhost:3000
```

---

## Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL | `http://localhost:5000` |

### Backend (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` / `test` / `production` | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | **required** |
| `JWT_SECRET` | Access token signing secret (min 16 chars) | **required** |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_SECRET` | Refresh token secret (defaults to `JWT_SECRET + "_refresh"`) | optional |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `CORS_ORIGINS` | Allowed origins, comma-separated | **required in production** |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `300` |

> **Production note:** `CORS_ORIGINS` cannot be a wildcard (`*`) in `NODE_ENV=production` — the server will exit with an error.

---

## Running Tests

### Backend (Jest + Supertest)
```bash
cd server
npm test
```
Uses `mongodb-memory-server` — no external MongoDB needed.

### Frontend (Vitest)
```bash
# from repo root
npm test
```

### Both
```bash
# from repo root
npm test && cd server && npm test
```

---

## Pre-commit Hooks

Husky + lint-staged run `eslint --fix --max-warnings=0` on all staged `src/**/*.{ts,tsx}` files before every commit.

```bash
# Hooks are installed automatically via:
npm install   # runs "prepare": "husky"
```

---

## CI

GitHub Actions (`ci.yml`) runs on every push/PR to `main`:

| Job | Steps |
|---|---|
| **backend-test** | `npm ci` → `npm test` (Jest + mongodb-memory-server) |
| **frontend-build** | `npm ci` → `tsc --noEmit` → `next lint` → `next build` |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register (issues access + refresh cookies) |
| `POST` | `/api/auth/login` | Login (issues access + refresh cookies) |
| `POST` | `/api/auth/refresh` | Silent token renewal via refresh cookie |
| `POST` | `/api/auth/logout` | Clears both cookies |
| `GET` | `/api/auth/me` | Current user profile |
| `PATCH` | `/api/auth/profile` | Update profile |
| `POST` | `/api/auth/change-password` | Change password |
| `GET/POST` | `/api/accounts` | List / create accounts |
| `PATCH/DELETE` | `/api/accounts/:id` | Update / delete account |
| `GET/POST` | `/api/transactions` | List (paginated) / create |
| `POST` | `/api/transactions/transfer` | Atomic transfer (MongoDB session) |
| `PATCH/DELETE` | `/api/transactions/:id` | Update / soft-delete |
| `GET/POST` | `/api/budgets` | List / create budgets |
| `GET/POST` | `/api/goals` | List / create goals |
| `POST` | `/api/goals/:id/contribute` | Add contribution |
| `GET/POST` | `/api/categories` | List / create categories |
| `GET/POST` | `/api/recurring` | List / create recurring rules |
| `POST` | `/api/recurring/:id/run-now` | Trigger rule immediately |
| `GET` | `/api/analytics/summary` | Income, expense, savings rate |
| `GET` | `/api/analytics/cashflow` | Monthly cashflow series |
| `GET` | `/api/analytics/categories` | Spending by category |
| `POST/GET` | `/api/transactions-io` | CSV import / export |

---

## License

MIT
