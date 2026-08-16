# Production Deployment Guide — Akira PM

> **Document Version:** 1.0.0  
> **Status:** Production Reference

---

## 1. Architecture Overview

Akira PM is architected for cloud-native deployment with strict separation between the frontend presentation tier and the backend service tier:

- **Frontend**: React 19 / Vite Single-Page Application (SPA) hosted on **Vercel** Edge Network.
- **Backend**: Containerized FastAPI ASGI application hosted on **Render**.
- **Database**: Managed PostgreSQL instance (Supabase / Render).
- **Cache / Rate Limiting**: Managed Redis instance (Upstash / Render).

---

## 2. Live Production Endpoints

- **Frontend Application**: [https://akira-pm-frontend.vercel.app](https://akira-pm-frontend.vercel.app)
- **Backend API & Health**: [https://akira-pm.onrender.com](https://akira-pm.onrender.com)
- **API Documentation**: [https://akira-pm.onrender.com/docs](https://akira-pm.onrender.com/docs) _(Enabled in non-production environments)_

---

## 3. Frontend Deployment (Vercel)

### Project Configuration

- **Framework Preset**: Vite
- **Root Directory**: `apps/frontend`
- **Build Command**: `pnpm build` (`tsc && vite build`)
- **Output Directory**: `dist`

### Environment Variables

Configure the following environment variables in the Vercel Project Settings:

| Variable          | Example Value                          | Purpose                                   |
| :---------------- | :------------------------------------- | :---------------------------------------- |
| `VITE_API_URL`    | `https://akira-pm.onrender.com/api/v1` | Public backend API URL consumed by Axios. |
| `VITE_SENTRY_DSN` | `https://example@sentry.io/123`        | Browser error tracking DSN (optional).    |

### SPA Fallback Routing (`apps/frontend/vercel.json`)

To prevent `404: NOT_FOUND` errors on client-side route refreshes (`/login`, `/register`, `/dashboard`), `vercel.json` rewrites non-file routes to `/index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 4. Backend Deployment (Render)

### Container Configuration (`apps/backend/Dockerfile`)

The backend is built from a hardened multi-stage Docker image based on `python:3.13-slim`.

- **User**: Non-root `appuser` (UID 8888).
- **Startup Command**:
  ```bash
  sh -c "alembic upgrade head && exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"
  ```
  _This ensures database migrations are executed and verified before FastAPI starts listening for traffic._

### Environment Variables

Configure the following in your Render Web Service Environment Settings:

| Variable                              | Description                                                                                    |
| :------------------------------------ | :--------------------------------------------------------------------------------------------- |
| `ENV_STATE`                           | Must be set to `production`.                                                                   |
| `APP_NAME`                            | `Akira-PM`                                                                                     |
| `BACKEND_SECRET_KEY`                  | Cryptographically random 32+ character string used for JWT signing.                            |
| `BACKEND_ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifespan (default: `30`).                                                                |
| `DATABASE_URL`                        | PostgreSQL async connection string (`postgresql+asyncpg://...`).                               |
| `REDIS_URL`                           | Redis TLS connection string (`rediss://...`).                                                  |
| `CORS_ALLOWED_ORIGINS`                | Comma-separated allowed frontend origins (e.g. `https://akira-pm-frontend.vercel.app`).        |
| `ALLOWED_HOSTS`                       | Comma-separated allowed host headers (e.g. `akira-pm.onrender.com`).                           |
| `AI_PROVIDER`                         | Active LLM provider (`gemini`, `openai`, `anthropic`).                                         |
| `GEMINI_API_KEY`                      | Google Gemini API Key.                                                                         |
| `OPENAI_API_KEY`                      | OpenAI API Key.                                                                                |
| `ANTHROPIC_API_KEY`                   | Anthropic Claude API Key.                                                                      |
| `SENTRY_DSN`                          | Backend Sentry DSN.                                                                            |

---

## 5. Automated CI/CD Pipeline

Continuous deployment is automated via GitHub Actions:

```
git push origin main
       │
       ▼
[ .github/workflows/ci.yml ]
  ├── 1. backend-validation (Python 3.13, uv, ruff, mypy, pytest)
  ├── 2. frontend-validation (Node 22, pnpm, eslint, tsc, vitest, build)
  └── 3. quality-gate (Sanity & hygiene checks)
       │
       ▼ (On main branch success)
[ .github/workflows/deploy.yml ]
  ├── Trigger Render Deploy Hook (Curl POST)
  ├── Poll Backend /health and /ready probes (Up to 5 minutes)
  ├── Deploy Frontend to Vercel (vercel build --prod && vercel deploy --prebuilt)
  └── Verify Live Endpoints & Telemetry
```

---

## 6. Health Checks & Verification

Verify production service readiness using curl:

```bash
# 1. Liveness Probe (Instant 200 OK)
curl -i https://akira-pm.onrender.com/health

# 2. Deep Readiness Probe (Verifies PostgreSQL connection & Redis ping)
curl -i https://akira-pm.onrender.com/ready

# 3. Telemetry & Metrics
curl -i https://akira-pm.onrender.com/metrics
```

---

## 7. Production Troubleshooting Runbook

| Symptom                               | Probable Cause                      | Resolution                                                                                     |
| :------------------------------------ | :---------------------------------- | :--------------------------------------------------------------------------------------------- |
| **`404: NOT_FOUND` on route refresh** | Missing SPA rewrite                 | Verify `apps/frontend/vercel.json` contains `"source": "/(.*)", "destination": "/index.html"`. |
| **Backend `/ready` returns 503**      | Database / Redis connectivity issue | Check database connection pool limits on Supabase / Render; verify SSL mode in `DATABASE_URL`. |
| **`relation "users" does not exist`** | Startup migration did not run       | Verify Docker CMD executes `alembic upgrade head` before Uvicorn starts.                       |
| **CORS Rejected on Frontend**         | Origin mismatch                     | Update `CORS_ALLOWED_ORIGINS` in Render environment to include the exact frontend domain.      |
