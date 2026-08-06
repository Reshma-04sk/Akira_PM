# Deploying Backend to Render

This guide describes how to configure, deploy, and rollback the FastAPI backend of Akira-PM on Render.

## Prerequisites
1. A Render Account ([render.com](https://render.com)).
2. An active Supabase project (for database url).
3. An active Upstash Redis instance (for cache url).
4. GitHub repository connection authorized.

## Configuration Steps

### 1. Create a Web Service
- Click **New +** in the Render Dashboard and choose **Web Service**.
- Connect your GitHub repository.
- Configure the service details:
  - **Name**: `akira-pm-api`
  - **Root Directory**: `apps/backend`
  - **Runtime**: `Docker`
  - **Branch**: `main` or `develop`

### 2. Configure Environment Variables
Under the **Environment** tab, configure the following variables:

| Key | Value | Description |
|:---|:---|:---|
| `ENV_STATE` | `production` | Enables production settings, secure headers, and JSON logging. |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Connection URL from Supabase. |
| `REDIS_URL` | `rediss://...` | Secure connection string from Upstash Redis. |
| `BACKEND_SECRET_KEY` | *[Secure Random String]* | Used for JWT access tokens. |
| `AI_PROVIDER` | `gemini` | Choice of active LLM provider (`gemini`, `openai`, `anthropic`). |
| `GEMINI_API_KEY` | *[Optional API Key]* | Gemini client token. |
| `OPENAI_API_KEY` | *[Optional API Key]* | OpenAI client token. |
| `ANTHROPIC_API_KEY` | *[Optional API Key]* | Anthropic client token. |
| `RESEND_API_KEY` | *[Optional API Key]* | Resend API key for custom transactional emails. |
| `SENTRY_DSN` | *[Optional DSN]* | Sentry DSN endpoint for exception tracking. |
| `CORS_ALLOWED_ORIGINS` | `https://akira-pm.vercel.app` | Production origin address. |
| `ALLOWED_HOSTS` | `akira-pm-api.onrender.com` | Production hostname binding. |

### 3. Deploy Hook Setup
To trigger deployments automatically from our GitHub Action pipeline:
- Go to the Render service dashboard page, select **Settings**.
- Scroll to the **Deploy Hook** section.
- Copy the **Deploy Hook URL** (looks like `https://api.render.com/deploy/srv-...`).
- Save this URL as a GitHub secret named `RENDER_DEPLOY_HOOK_URL`.

---

## Rollback Procedures

If a deployment fails the verification checks, you must revert to the last stable version immediately.

### Rollback via Render Dashboard
1. Go to your Web Service in the Render Console.
2. Select the **Events** or **Deploys** tab from the left sidebar.
3. Locate the previous successful deploy.
4. Click on the three dots next to that deploy entry and select **Rollback to this deploy**.
5. Render will rebuild and redeploy that specific commit, redirecting routing to the fallback container.

### Rollback via Git Reversion
1. If the failure was due to code changes merged to `main`, revert the commit locally:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. The push will automatically run the deployment pipeline and restore the previous codebase state.
