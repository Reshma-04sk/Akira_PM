# Configuring Supabase PostgreSQL

Akira-PM uses Supabase as an external managed PostgreSQL database. **Do not containerize PostgreSQL** or create local database services in production environments.

## Setup Steps

### 1. Database Provisioning
- Create a new project in the Supabase Dashboard ([database.new](https://database.new)).
- Store the **Database Password** securely.

### 2. Connection Strings
Retrieve your connection URL under **Project Settings** -> **Database**:
- Use the **Session Pooler** (typically port `5432` or port `6543`) connection string.
- Format the string for Asyncpg (SQLAlchemy async client compatibility):
  - Replace `postgres://` with `postgresql+asyncpg://`.
  - Format: `postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

### 3. Retrieve Client Keys
Retrieve client API keys under **Project Settings** -> **API**:
- **`SUPABASE_URL`**: REST URL for backend integrations.
- **`SUPABASE_ANON_KEY`**: Client public anon token.
- **`SUPABASE_SERVICE_ROLE_KEY`**: High-privilege key (never expose to client side, used only for backend migrations or administrative scripts).
- **`JWT_SECRET`**: Retrieve JWT secret (found under JWT Settings) to align FastAPI verification signatures with Supabase token decoders if using federated logins.

### 4. Database Migrations
Run your alembic migrations against the live Supabase instance:
```bash
cd apps/backend
$env:DATABASE_URL="postgresql+asyncpg://postgres.[ref]:[pwd]@..."
uv run alembic upgrade head
```
