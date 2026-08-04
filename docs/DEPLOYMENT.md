# Production Deployment Guide

This guide details the complete steps required to deploy Akira-PM in a secure, containerized production environment.

---

## 1. Deployment Topology

```mermaid
graph TD
    User([End User]) -->|HTTPS| Frontend[Vercel Frontend Client]
    Frontend -->|HTTPS REST| Backend[Render FastAPI Backend Service]
    Backend -->|SSL/TLS| DB[(Supabase PostgreSQL)]
    Backend -->|Secure SSL| Cache[(Upstash Redis)]
```

- **Frontend Client**: Static assets served from Vercel edge networks.
- **Backend Service**: Stateful Python ASGI runner deployed on Render.
- **Database Engine**: Managed PostgreSQL hosting provided by Supabase.
- **Cache Provider**: Serverless Redis endpoint provided by Upstash.

---

## 2. Platform Guides

### 1. Database (Supabase Setup)
1. Navigate to the [Supabase Console](https://supabase.com) and create a project.
2. Select **Project Settings** -> **Database**.
3. Retrieve your Transaction Pooler URI string (typically listening on port `6543`).
4. Replace the connection protocol prefix with `postgresql+asyncpg://` to enable async execution.
   * *Example*: `postgresql+asyncpg://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`

---

### 2. Cache & Rate-Limiter (Upstash Redis Setup)
1. Connect to the [Upstash Console](https://console.upstash.com) and create a serverless database.
2. Copy the secure endpoint URI (ensure protocol starts with `rediss://` for secure TLS).
   * *Example*: `rediss://default:[token]@us1-example-redis.upstash.io:32456`

---

### 3. Backend (Render Host Setup)
1. Go to [Render](https://render.com) and register a **New Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Environment**: `Docker`
   - **Docker Context**: `apps/backend`
   - **Dockerfile Path**: `Dockerfile`
4. Inject production environment variables under the **Environment** tab:
   - `ENV_STATE`: `production`
   - `BACKEND_SECRET_KEY`: *[Generate secure 32-character random string]*
   - `DATABASE_URL`: `postgresql+asyncpg://...`
   - `REDIS_URL`: `rediss://...`
   - `CORS_ALLOWED_ORIGINS`: `https://your-app.vercel.app`
   - `ALLOWED_HOSTS`: `your-backend.onrender.com`
5. Once deployment succeeds, connect to the shell or configure a post-deploy command to run database migrations:
   `uv run alembic upgrade head`

---

### 4. Frontend (Vercel Host Setup)
1. Connect to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Configure Vite project values:
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
4. Configure Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api/v1`
5. Trigger initial deploy build.

---

## 3. Maintenance Checklist

- [ ] **Secret Key Protection**: Change keys if any indicators of leaks occur. Never save keys directly into repositories.
- [ ] **Automatic Backups**: Verify that Supabase daily automated database snapshots are active.
- [ ] **TLS Enforcement**: Enforce database SSL connection parameters in backend configurations.
- [ ] **CORS Bounds**: Never set CORS allow origin to wildcard (`*`) in production setups.
- [ ] **Health Monitoring**: Configure synthetic check pings to `/api/v1/health` from your status monitoring software.
