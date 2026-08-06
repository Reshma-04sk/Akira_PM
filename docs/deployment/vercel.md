# Deploying Frontend to Vercel

This guide explains how to deploy and rollback the React frontend of Akira-PM on Vercel.

## Prerequisites
1. A Vercel Account ([vercel.com](https://vercel.com)).
2. Connected GitHub workspace.

## Configuration Steps

### 1. Import Project
- Click **Add New** -> **Project** in your Vercel Dashboard.
- Connect your repository.
- Adjust project settings:
  - **Framework Preset**: `Vite`
  - **Root Directory**: `apps/frontend`
  - **Build Command**: `tsc && vite build`
  - **Output Directory**: `dist`

### 2. Environment Variables
Configure build-time and runtime environment variables:

| Key | Value | Description |
|:---|:---|:---|
| `VITE_API_URL` | `https://akira-pm-api.onrender.com/api/v1` | Public API endpoint (FastAPI backend url). |
| `VITE_SENTRY_DSN` | *[Optional DSN]* | Sentry DSN endpoint for browser tracking. |

### 3. Retrieve Vercel IDs
Vercel CLI deployments in GitHub Actions require the org and project IDs:
- Inside your local workspace, run:
  ```bash
  pnpm install -g vercel
  vercel link
  ```
- This creates a `.vercel/project.json` file. Retrieve the fields:
  - `orgId` -> Save as `VERCEL_ORG_ID` GitHub secret.
  - `projectId` -> Save as `VERCEL_PROJECT_ID` GitHub secret.
- Go to Vercel **Account Settings** -> **Tokens**, create a new token, and save it as `VERCEL_TOKEN` GitHub secret.

---

## Rollback Procedures

### Rollback via Vercel Dashboard
1. Open the Vercel project dashboard.
2. Select the **Deployments** tab.
3. Find the previous stable deployment (the one that passed staging checks).
4. Click on the three dots next to the entry and click **Promote to Production**.
5. Vercel will instantaneously route production traffic back to that deployment cache without rebuild time.

### Rollback via Vercel CLI
If you want to rollback using the CLI tools:
```bash
# Rollback to a specific deployment URL or deployment ID
vercel rollback [deployment-id-or-url] --token=${{ secrets.VERCEL_TOKEN }}
```
