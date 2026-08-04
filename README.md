# Akira-PM

> **Cinematic Project Management, Refined.**

Akira-PM is a production-ready, enterprise-grade project management application inspired by tools like Linear, Apple Vision Pro, and Claude AI. It features a luxury Obsidian Black and Matte Gold design system, interactive WebGL 3D canvas layouts, and a decoupled high-performance FastAPI/React architecture.

---

## 📖 System Architecture & Design Specifications

We maintain comprehensive specifications detailing the platform's components, designs, and schemas:

- 📊 **[High-Level Design (HLD)](file:///home/cholan0415/Documents/Akira_PM/docs/hld/HLD.md)** — Architectural diagrams, request boundaries, and multi-tenant isolation flows.
- ⚙️ **[Low-Level Design (LLD)](file:///home/cholan0415/Documents/Akira_PM/docs/lld/LLD.md)** — Relational SQL databases structures, Axios client classes, and React Query key caches.
- 🎨 **[Design System Documentation](file:///home/cholan0415/Documents/Akira_PM/docs/DesignSystem.md)** — Core luxury color tokens, typography guides, micro-interactions, and glass assets.
- 🔌 **[API Documentation](file:///home/cholan0415/Documents/Akira_PM/docs/API.md)** — FastAPI REST endpoints, JSON payloads, and response validators.
- 🗄️ **[Database Blueprint](file:///home/cholan0415/Documents/Akira_PM/docs/Database.md)** — Alembic schema blueprints, indexes, and constraint triggers.
- 🚀 **[Deployment Guidelines](file:///home/cholan0415/Documents/Akira_PM/docs/DEPLOYMENT.md)** — Single command setups with Docker Compose or standalone packages.

---

## 🛠️ Stack Configuration

### Frontend Layer
- **Framework**: React 19 SPA
- **Tooling & Bundler**: Vite, TypeScript
- **Styling**: Tailwind CSS & Vanilla HSL luxury variables
- **3D Engine**: React Three Fiber (`@react-three/fiber`), `@react-three/drei`
- **Animations**: Framer Motion

### Backend API Layer
- **Framework**: FastAPI (Python ASGI)
- **Database Engine**: SQLAlchemy 2.0 ORM (Async driver)
- **Data Validation**: Pydantic v2
- **Migrations**: Alembic

---

## 🚀 Getting Started

Ensure you have **Python 3.12+**, **Node.js 20+**, and **pnpm** installed on your workstation.

### 1. Database Setup
Launch local PostgreSQL and Redis pools using Docker Compose:
```bash
docker-compose up -d
```

### 2. Launch FastAPI Backend
Install Python packages using `uv` and start the Uvicorn ASGI server:
```bash
cd apps/backend
uv sync
uv run uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 3. Launch React Frontend
Install dependencies and launch the Vite development server:
```bash
pnpm install
pnpm --filter saas-frontend dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing and Verification

To verify components integrity across the client and server pipelines, execute:

### Frontend Unit Tests
```bash
pnpm --filter saas-frontend test -- --run
```

### Backend Unit Tests
```bash
cd apps/backend
ENV_STATE=testing PYTHONPATH=. uv run pytest
```