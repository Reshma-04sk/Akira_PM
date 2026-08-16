# Database Architecture & Migration Reference — Akira PM

> **Document Version:** 1.0.0  
> **Status:** Production Reference

---

## 1. Overview

Akira PM uses **PostgreSQL 16** managed via asynchronous SQLAlchemy 2.0 ORM (`asyncpg` driver) and **Alembic** migration tracking.

### Key Characteristics

- **UUID Primary Keys**: All entities utilize `uuid.uuid4` identifiers to prevent enumeration attacks and simplify distributed replication.
- **Asynchronous Execution**: All queries are executed non-blockingly using `await session.execute(...)`.
- **Composite Indexing**: Optimized lookup paths on high-frequency tenant queries (`workspace_id`, `project_id`, `assignee_id`).
- **Referential Integrity**: Foreign keys with `ON DELETE CASCADE` where child entities belong exclusively to a parent container (e.g. comments $\rightarrow$ task).

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        string role
        boolean is_active
        boolean is_verified
        timestamp created_at
        timestamp updated_at
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token_hash UK
        timestamp expires_at
        boolean revoked
        timestamp created_at
    }

    WORKSPACES {
        uuid id PK
        string name
        string slug UK
        uuid owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    WORKSPACE_MEMBERS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        string role
        timestamp created_at
    }

    PROJECTS {
        uuid id PK
        uuid workspace_id FK
        uuid owner_id FK
        string name
        string description
        string status
        string key
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_MEMBERS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        string role
        timestamp created_at
    }

    TASKS {
        uuid id PK
        uuid project_id FK
        uuid creator_id FK
        uuid assignee_id FK
        string title
        text description
        string status
        string priority
        timestamp due_date
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        uuid id PK
        uuid task_id FK
        uuid author_id FK
        text content
        timestamp created_at
        timestamp updated_at
    }

    ATTACHMENTS {
        uuid id PK
        uuid task_id FK
        uuid uploader_id FK
        string filename
        string file_path
        integer file_size
        string content_type
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        text message
        string type
        boolean is_read
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        string entity_id
        json details
        timestamp created_at
    }

    USERS ||--o{ REFRESH_TOKENS : owns
    USERS ||--o{ AUDIT_LOGS : triggers
    USERS ||--o{ WORKSPACE_MEMBERS : holds
    USERS ||--o{ PROJECT_MEMBERS : holds
    USERS ||--o{ TASKS : assigns
    USERS ||--o{ COMMENTS : authors
    USERS ||--o{ NOTIFICATIONS : receives

    WORKSPACES ||--o{ WORKSPACE_MEMBERS : contains
    WORKSPACES ||--o{ PROJECTS : contains

    PROJECTS ||--o{ PROJECT_MEMBERS : contains
    PROJECTS ||--o{ TASKS : contains

    TASKS ||--o{ COMMENTS : contains
    TASKS ||--o{ ATTACHMENTS : contains
```

---

## 3. Migration History & Timeline

Migrations are located in `apps/backend/alembic/versions/` and versioned chronologically:

| Migration Revision | Name / Description         | Entities Affected                             |
| :----------------- | :------------------------- | :-------------------------------------------- |
| `001`              | `create_auth_tables`       | `users`, `refresh_tokens`                     |
| `002`              | `create_audit_logs`        | `audit_logs`                                  |
| `e3d29a502efc`     | `create_workspaces`        | `workspaces`, `workspace_members`             |
| `96d52dd28443`     | `create_projects`          | `projects`                                    |
| `358a06ce1e01`     | `create_tasks`             | `tasks`                                       |
| `aff209e05cb7`     | `create_project_members`   | `project_members`                             |
| `1f8ec3da9184`     | `create_comments`          | `comments`                                    |
| `a0a8cd71722f`     | `create_notifications`     | `notifications`                               |
| `ad2717ca52db`     | `create_attachments`       | `attachments`                                 |
| `f0a8cd71723a`     | `add_performance_indexes`  | Composite performance indexes on foreign keys |
| `7a0a8cd7172f`     | `add_missing_user_columns` | Extended profile metadata (**HEAD**)          |

---

## 4. Migration Commands

To manage database revisions locally:

```bash
# Apply all pending migrations to head
cd apps/backend
ENV_STATE=development uv run alembic upgrade head

# Generate a new autodetected migration
ENV_STATE=development uv run alembic revision --autogenerate -m "describe_changes"

# Rollback the last applied migration
ENV_STATE=development uv run alembic downgrade -1

# Show current database revision
ENV_STATE=development uv run alembic current
```
