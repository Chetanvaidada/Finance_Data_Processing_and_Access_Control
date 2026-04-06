# Zorvyn Financial Management System

A full-stack financial tracking app with role-based access control, JWT authentication, and dashboard analytics.

## Setup Process

### 1) Prerequisites

- Python 3.10+ (backend)
- Node.js 18+ and npm (frontend)
- PostgreSQL for local development (optional if using hosted DB)

### 2) Backend Setup

1. Open a terminal in `backend`.
2. Create and activate a virtual environment:
   - Windows PowerShell:
     - `python -m venv venv`
     - `.\venv\Scripts\Activate.ps1`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Configure environment variables in `backend/.env`:
   - Required keys:
     - `DATABASE_URL`
     - `SECRET_KEY`
     - `ALGORITHM`
     - `ACCESS_TOKEN_EXPIRE_MINUTES`
     - `CORS_ORIGINS`
     - `APP_NAME`
     - `DEBUG`
5. Run the API server:
   - `uvicorn app.main:app --reload --port 8000`
6. Optional: seed demo data:
   - `python -m app.db.seed`

### 3) Frontend Setup

1. Open a terminal in `frontend`.
2. Install dependencies:
   - `npm install`
3. Start the app:
   - `npm run dev`
4. Open the UI (typically `http://localhost:5173`).

### 4) Verify the Application

- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Frontend talks to backend at `http://localhost:8000/api/v1`

## Deployment Setup (Current)

- Backend is deployed as a FastAPI web service on Render.
- PostgreSQL database is hosted on Supabase.
- Application configuration is provided through Render environment variables (not committed in code).
- Frontend should consume the deployed backend base URL through environment-based configuration.

### Required Production Environment Variables

- `DATABASE_URL` (Supabase Postgres connection string)
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ORIGINS` (JSON array format)
- `APP_NAME`
- `DEBUG` (`False` in production)

## API Explanation

The API is built with FastAPI and mounted under `/api/v1`.

### Authentication

- `POST /auth/register` - Register a new user (default role: `viewer`).
- `POST /auth/login` - Login with OAuth2 form fields (`username` as email, `password`).
- `GET /auth/me` - Get current authenticated user profile.

### User Management (Admin)

- `GET /users/` - List users.
- `POST /users/` - Create user with chosen role.
- `PATCH /users/{user_id}` - Update user details/role/active status.

### Transactions

- `GET /transactions/` - List transactions with filters and pagination (`analyst`, `admin`).
- `GET /transactions/{transaction_id}` - Get one transaction (`admin`).
- `POST /transactions/` - Create transaction (`admin`).
- `PUT /transactions/{transaction_id}` - Update transaction (`admin`).
- `DELETE /transactions/{transaction_id}` - Delete transaction (`admin`).

### Dashboard

- `GET /dashboard/summary` - Totals and balance.
- `GET /dashboard/trends` - Monthly trends.
- `GET /dashboard/categories` - Category totals.
- `GET /dashboard/recent` - Recent transactions.
- `GET /dashboard/` - Full dashboard payload.

### Authorization Model

- `admin`: full access to users + transaction CRUD + dashboard
- `analyst`: can view transactions list + dashboard
- `viewer`: dashboard/authenticated views only

## Assumptions Made

- The app supports both local development and hosted deployment.
- In production, the backend is hosted on Render and the database is hosted on Supabase.
- All secrets and runtime settings are injected via environment variables.
- JWT is the preferred authentication mechanism for this project scope.
- The backend owns role enforcement; frontend UX visibility is not treated as a security boundary.
- Default seeded users and data are acceptable for development/demo environments.

## Tradeoffs Considered

- **Fast setup vs strict production hardening**  
  `Base.metadata.create_all()` and optional seed script improve onboarding speed, but migration-first workflows are safer for production.

- **Simple JWT auth vs advanced session controls**  
  JWT keeps implementation straightforward and stateless, but does not include token revocation/refresh lifecycle by default.

- **Role-based access vs fine-grained permissions**  
  Three fixed roles (`admin`, `analyst`, `viewer`) keep code and policies simple, but limit flexibility for custom enterprise permission models.

- **Single API service vs decomposed services**  
  A monolithic FastAPI app is easier to maintain early, but may become harder to scale organizationally as domains grow.

- **Hardcoded frontend API base URL vs environment-driven frontend config**  
  A fixed base URL reduces config complexity in local dev, but environment-based frontend configuration is better for staging/production deployments.

- **Managed cloud services vs local infrastructure control**  
  Render + Supabase reduce operational overhead and speed up deployment, but add platform dependencies and require careful env/config management.
