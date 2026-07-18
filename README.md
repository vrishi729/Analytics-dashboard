# DemandIQ — AI Demand Analytics Platform

[![CI](https://github.com/YOUR_USERNAME/demandiq/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/demandiq/actions/workflows/ci.yml)

A web application that helps small and medium-sized businesses forecast product demand by analyzing historical sales data.

> **Status:** MVP in development.

---

## Tech Stack

- **Backend:** FastAPI, Python 3.14, SQLAlchemy, Alembic
- **Frontend:** React 19, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query
- **Database:** PostgreSQL (Neon in production, Docker Compose for local dev)
- **Auth:** JWT (access + refresh token pair)
- **Analytics:** Pandas, NumPy, statsmodels
- **CI:** GitHub Actions

---

## Development

### Prerequisites

- Python 3.12+
- Node.js 22+
- Docker (for local PostgreSQL)

### Setup

```bash
# 1. Start the database
make db-up

# 2. Install backend dependencies
cd backend && uv sync

# 3. Run database migrations
make db-migrate

# 4. Install frontend dependencies
cd frontend && npm install

# 5. Start both servers (in separate terminals)
make dev-backend   # http://localhost:8000
make dev-frontend  # http://localhost:5173
```

---

## Deployment & Free-Tier Trade-offs

### Database: Neon Postgres (Free Tier)

- **Pros:** Permanent storage, no credit card required, 0.5 GB storage.
- **Cons:** Scales to zero on idle (cold start on first request after inactivity), capped at 100 compute-hours/month.
- **Decision rationale:** Fine for a portfolio demo. A real production system would use a provisioned Postgres instance.

### Hosting: Render (Free Web Service)

- **Pros:** Free SSL, automatic deploys from GitHub.
- **Cons:** Spins down after 15 minutes of inactivity (30–60s cold start on next request).
- **Note:** Render's free Postgres tier is *not* used — data is deleted after 30 days. All persistent data lives on Neon.

> If you're evaluating this as a portfolio project: expect ~30s load time on first request after a period of inactivity. Subsequent requests will be fast. This is a documented free-tier constraint, not a performance bug.

---

## Architecture

```
React Frontend (TS)
       │ REST (JWT)
FastAPI Route Layer     ← validation (Pydantic), auth
Service / Business Layer ← cleaning, analytics, forecasting
Data Access Layer (ORM)  ← SQLAlchemy, repository pattern
PostgreSQL (Neon)
```

Analytics and forecasting run in-process (no Celery/RQ for MVP).

---

## License

MIT
