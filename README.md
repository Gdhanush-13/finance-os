# Finance OS

A full-stack personal finance management application built with **Next.js 14** (frontend) and **Express 5 + MongoDB** (backend).

Track accounts, plan budgets, hit savings goals, and visualize your cashflow — all in one calm dashboard.

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui components
- **React Query** (TanStack Query) for data fetching
- **React Hook Form** + Zod for form validation
- **Recharts** for data visualization
- **Axios** for API calls

### Backend
- **Express 5** (Node.js)
- **MongoDB** + Mongoose ODM
- **JWT** authentication (bcryptjs for hashing)
- **Zod** request validation
- **Jest** + Supertest for testing (mongodb-memory-server)

## Project Structure

```
finance-os/
├── src/                    # Next.js frontend
│   ├── app/                # App Router pages
│   │   ├── (auth)/         # Login & Register
│   │   └── (dashboard)/    # Dashboard, Accounts, Transactions, etc.
│   ├── auth/               # AuthContext provider
│   ├── components/         # UI components (shared + shadcn/ui)
│   ├── hooks/              # React Query hooks (useAccounts, useTransactions, etc.)
│   ├── lib/                # API client, config, formatters
│   └── types/              # TypeScript interfaces
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB connection, env validation
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, validation, rate limiting, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic (transactions, recurring)
│   │   ├── utils/          # ApiError, asyncHandler, JWT, logger
│   │   └── validators/     # Zod schemas for request validation
│   └── tests/              # Jest test suites
└── .github/workflows/      # CI pipeline
```

## Features

- **Accounts** — Bank, cash, credit card, investment, loan, wallet tracking
- **Transactions** — Income, expense, and transfer with category tagging
- **Budgets** — Weekly, monthly, yearly budgets with spend tracking
- **Goals** — Savings goals with contribution tracking
- **Categories** — Custom income/expense categories with colors and icons
- **Recurring** — Automated recurring transaction rules
- **Analytics** — Summary dashboard, cashflow charts, category breakdowns
- **Import/Export** — CSV import and export of transactions

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/Gdhanush-13/finance-os.git
cd finance-os
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET
npm install
npm run dev
```

The API will start on `http://localhost:5000`.

### 3. Set up the frontend

```bash
# From repo root
cp .env.example .env.local
# Edit .env.local if your backend is on a different URL
npm install
npm run dev
```

The app will start on `http://localhost:3000`.

### Environment Variables

#### Frontend (`.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:5000` |

#### Backend (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | — (required) |
| `JWT_SECRET` | JWT signing secret (min 16 chars) | — (required) |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `300` |

## Running Tests

```bash
cd server
npm test
```

Tests use `mongodb-memory-server` so no external MongoDB is needed.

## CI

GitHub Actions runs on every push/PR to `main`:

- **backend-test** — Installs deps, runs Jest test suite
- **frontend-build** — Installs deps, runs ESLint, builds Next.js

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for full REST API reference.

## License

MIT
