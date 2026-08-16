# GitHub Secrets & Environment Protection

This guide details how to configure GitHub Action repository secrets and target environments for deployment and CI/CD pipelines.

## GitHub Repository Secrets

Configure the following secrets in your repository settings under **Settings** -> **Secrets and variables** -> **Actions**:

### 1. Database & Cache Secrets (Backend Configuration)

| Secret Name | Category | Description |
|:---|:---|:---|
| `DATABASE_URL` | Production | Connection pooler endpoint for Supabase database. |
| `REDIS_URL` | Production | Secure connection URL for Upstash Redis database. |
| `SUPABASE_URL` | Integration | Supabase API REST URL. |
| `SUPABASE_ANON_KEY` | Integration | Client anon token. |
| `SUPABASE_SERVICE_ROLE_KEY` | Integration | Service role key. |
| `JWT_SECRET` | Authentication | Cryptographic key signature for signups/auth. |
| `RESEND_API_KEY` | Delivery | Email delivery is currently mocked/simulated; the configuration contains a provider key placeholder for future integration. |
| `SENTRY_DSN` | Diagnostics | Backend diagnostics endpoint. |
| `VITE_SENTRY_DSN` | Diagnostics | Frontend diagnostics endpoint. |

### 2. DevOps Deployment Secrets (Automation Configuration)

| Secret Name | Category | Description |
|:---|:---|:---|
| `VERCEL_TOKEN` | Automation | Security token generated from Vercel Account Settings. |
| `VERCEL_ORG_ID` | Automation | Organization identifier found in `.vercel/project.json`. |
| `VERCEL_PROJECT_ID` | Automation | Project identifier found in `.vercel/project.json`. |
| `RENDER_DEPLOY_HOOK_URL` | Automation | HTTP hook copied from Render Web Service settings page. |
| `BACKEND_URL` | Verification | The live URL endpoint of the Render service (e.g. `https://akira-pm.onrender.com`). |

---

## Environment Protection Rules

To configure environments:
1. Go to your GitHub repository -> **Settings** -> **Environments**.
2. Click **New environment** and create:
   - `Staging` (Preview deployments)
   - `Production` (Production deployments)
3. Under `Production`:
   - Enforce **Required reviewers** (e.g., tech-lead approval required before deployment merges execute).
   - Enforce **Deployment branches** to restrict execution to `main`.
