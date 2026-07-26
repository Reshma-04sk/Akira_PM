# Backend Audit Report

This report presents a comprehensive technical audit of the FastAPI backend application. It analyzes the system's architecture, database schemas, API routes, services, repositories, testing coverage, security protocols, and performance bottlenecks, providing actionable recommendations for production readiness.

---

## 1. Project Tree

The backend application is structured as a standard modular FastAPI project:

```
apps/backend/
├── alembic/                          # Alembic database migrations configuration
│   ├── versions/                     # Migration scripts
│   ├── env.py                        # Migration environment configuration
│   └── script.py.mako                # Migration script template
├── src/                              # Main application source code
│   ├── api/                          # HTTP controllers / routes
│   │   └── v1/                       # API version 1 sub-routes
│   │       ├── attachments/          # Attachment API endpoints
│   │       ├── audit_log/            # Audit Log API endpoints
│   │       ├── auth/                 # Auth API endpoints
│   │       ├── comments/             # Comments API endpoints
│   │       ├── dashboard/            # Dashboard Analytics API endpoints
│   │       ├── health/               # Health check endpoint
│   │       ├── notifications/        # Notifications API endpoints
│   │       ├── project_members/      # Project Members & RBAC API endpoints
│   │       ├── projects/             # Projects API endpoints
│   │       ├── search/               # Global Search API endpoints
│   │       ├── tasks/                # Tasks API endpoints
│   │       ├── __init__.py           # Routes exports
│   │       └── router.py             # Main API Router
│   ├── core/                         # Core system modules (configuration, logs)
│   │   ├── exceptions.py             # Custom application exceptions
│   │   ├── handlers.py               # Global exception handlers
│   │   ├── logging.py                # Logging configuration
│   │   ├── security.py               # Token & password hashing helpers
│   │   └── settings.py               # App Settings & Pydantic-settings config
│   ├── db/                           # DB configuration
│   │   ├── base.py                   # Declarative Base model
│   │   └── session.py                # Async session maker config
│   ├── dependencies/                 # FastAPI Dependency Injections
│   │   ├── auth.py                   # Authenticated user dependencies
│   │   └── database.py               # Database session dependency
│   ├── models/                       # SQLAlchemy Database Models
│   │   ├── __init__.py               # Model exports
│   │   ├── attachment.py             # File attachments model
│   │   ├── audit_log.py              # Audit logs model
│   │   ├── comment.py                # Task comments model
│   │   ├── notification.py           # User notifications model
│   │   ├── project.py                # Projects model
│   │   ├── project_member.py         # Project membership model (RBAC)
│   │   ├── refresh_token.py          # Session refresh tokens model
│   │   ├── task.py                   # Project tasks model
│   │   └── user.py                   # User model
│   ├── repositories/                 # Data access layer
│   │   ├── __init__.py               # Repositories exports
│   │   ├── attachment_repository.py  # Attachment CRUD queries
│   │   ├── audit_log_repository.py    # Audit log queries
│   │   ├── base.py                   # BaseRepository abstraction
│   │   ├── comment_repository.py     # Comment CRUD queries
│   │   ├── notification_repository.py# Notification CRUD queries
│   │   ├── project_member_repository.py# Project membership CRUD queries
│   │   ├── project_repository.py     # Project queries
│   │   ├── task_repository.py        # Task queries
│   │   └── user_repository.py        # User queries
│   ├── schemas/                      # Pydantic v2 validation models
│   │   ├── attachment.py
│   │   ├── audit_log.py
│   │   ├── auth.py
│   │   ├── comment.py
│   │   ├── dashboard.py
│   │   ├── notification.py
│   │   ├── project.py
│   │   ├── project_member.py
│   │   ├── response.py
│   │   ├── search.py
│   │   ├── task.py
│   │   └── user.py
│   ├── services/                     # Business logic layer
│   │   ├── __init__.py               # Service exports
│   │   ├── attachment_service.py     # File attachment logic
│   │   ├── auth_service.py           # Login, registration, token logic
│   │   ├── comment_service.py        # Comment validation logic
│   │   ├── dashboard_service.py      # Analytics aggregation logic
│   │   ├── notification_service.py   # Notifications CRUD logic
│   │   ├── project_member_service.py # Project membership and RBAC logic
│   │   ├── project_service.py        # Project crud and owner checks
│   │   ├── search_service.py         # Global search service logic
│   │   ├── task_service.py           # Task management logic
│   │   └── user_service.py           # User detail logic
│   ├── __init__.py
│   └── main.py                       # Application entry point
├── tests/                            # Unit and integration test suites
│   ├── conftest.py                   # Pytest fixtures and DB setup
│   ├── test_attachment.py            # Attachment API tests
│   ├── test_audit_log.py             # Audit Log API tests
│   ├── test_auth_api.py              # Authentication API tests
│   ├── test_auth_service.py          # Authentication Service unit tests
│   ├── test_comment_api.py           # Comment API tests
│   ├── test_comment_service.py       # Comment Service unit tests
│   ├── test_dashboard.py             # Dashboard API & Service tests
│   ├── test_health.py                # Health endpoint tests
│   ├── test_notification.py          # Notifications API & trigger tests
│   ├── test_project_api.py           # Project API tests
│   ├── test_project_member_api.py    # Project Member API tests
│   ├── test_project_member_service.py# Project Member Service unit tests
│   ├── test_project_service.py       # Project Service unit tests
│   ├── test_search.py                # Global search tests
│   ├── test_task_api.py              # Task API tests
│   └── test_task_service.py          # Task Service unit tests
├── pyproject.toml                    # Poetry/UV dependency settings
└── uv.lock                           # UV lockfile
```

---

## 2. Database Models

The schema consists of 9 core tables designed using SQLAlchemy 2.0 `Mapped` type annotations:

### 1. `User` (Table: `users`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `email`: `String(255)` (Unique, Indexed, Nullable=False)
  - `hashed_password`: `String(255)` (Nullable=False)
  - `full_name`: `String(255)` (Nullable=True)
  - `role`: `Enum(UserRole)` (values: `admin`, `user`, Nullable=False, default: `user`)
  - `is_active`: `Boolean` (Nullable=False, default: True)
  - `is_verified`: `Boolean` (Nullable=False, default: False)
  - `created_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now)
  - `updated_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now, onupdate: UTC now)
- **Relationships**:
  - `refresh_tokens`: `Mapped[list[RefreshToken]]` (back_populates="user", cascade="all, delete-orphan")
  - `projects`: `Mapped[list[Project]]` (back_populates="owner", cascade="all, delete-orphan")
  - `assigned_tasks`: `Mapped[list[Task]]` (back_populates="assignee")
  - `project_memberships`: `Mapped[list[ProjectMember]]` (foreign_keys="ProjectMember.user_id", back_populates="user", cascade="all, delete-orphan")
  - `invited_members`: `Mapped[list[ProjectMember]]` (foreign_keys="ProjectMember.invited_by", back_populates="inviter")
  - `comments`: `Mapped[list[Comment]]` (back_populates="user", cascade="all, delete-orphan")
  - `notifications`: `Mapped[list[Notification]]` (back_populates="user", cascade="all, delete-orphan")
  - `attachments`: `Mapped[list[Attachment]]` (back_populates="uploader", cascade="all, delete-orphan")
- **Indexes**:
  - `ix_users_email` (Unique index on `email`)

### 2. `RefreshToken` (Table: `refresh_tokens`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `user_id`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `token_hash`: `String(255)` (Unique, Indexed, Nullable=False)
  - `expires_at`: `DateTime(timezone=True)` (Nullable=False)
  - `revoked`: `Boolean` (Nullable=False, default: False)
  - `created_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now)
- **Relationships**:
  - `user`: `Mapped[User]` (back_populates="refresh_tokens")
- **Indexes**:
  - `ix_refresh_tokens_token_hash` (Unique index on `token_hash`)
  - `ix_refresh_tokens_user_id` (Index on `user_id`)

### 3. `AuditLog` (Table: `audit_logs`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `user_id`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE SET NULL`, Nullable=True, Indexed)
  - `action`: `String(100)` (Nullable=False, Indexed)
  - `entity_type`: `String(100)` (Nullable=True)
  - `entity_id`: `String(255)` (Nullable=True)
  - `details`: `JSON` (Nullable=True)
  - `created_at`: `DateTime` (Nullable=False, default: local / UTC now)
- **Relationships**:
  - `user`: `Mapped[User]` (implicitly accessible)
- **Indexes**:
  - `ix_audit_logs_action` (Index on `action`)
  - `ix_audit_logs_user_id` (Index on `user_id`)

### 4. `Project` (Table: `projects`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `name`: `String(255)` (Nullable=False)
  - `description`: `Text` (Nullable=True)
  - `owner_id`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `is_archived`: `Boolean` (Nullable=False, default: False)
  - `created_at`: `DateTime` (Nullable=False)
  - `updated_at`: `DateTime` (Nullable=False)
- **Relationships**:
  - `owner`: `Mapped[Project]` (back_populates="projects")
  - `tasks`: `Mapped[list[Task]]` (back_populates="project", cascade="all, delete-orphan")
  - `members`: `Mapped[list[ProjectMember]]` (back_populates="project", cascade="all, delete-orphan")
- **Indexes**:
  - `ix_projects_owner_id` (Index on `owner_id`)

### 5. `ProjectMember` (Table: `project_members`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `project_id`: `UUID(as_uuid=True)` (ForeignKey: `projects.id` with `ON DELETE CASCADE`, Nullable=False)
  - `user_id`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `role`: `Enum(ProjectRole)` (values: `OWNER`, `MANAGER`, `DEVELOPER`, `VIEWER`, Nullable=False)
  - `invited_by`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE SET NULL`, Nullable=True)
  - `created_at`: `DateTime` (Nullable=False)
  - `updated_at`: `DateTime` (Nullable=False)
- **Constraints**:
  - Unique constraint: `uq_project_member` (`project_id`, `user_id`)
- **Relationships**:
  - `project`: `Mapped[Project]` (back_populates="members")
  - `user`: `Mapped[User]` (foreign_keys="ProjectMember.user_id", back_populates="project_memberships")
  - `inviter`: `Mapped[User]` (foreign_keys="ProjectMember.invited_by", back_populates="invited_members")
- **Indexes**:
  - `ix_project_members_user_id` (Index on `user_id`)

### 6. `Task` (Table: `tasks`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `title`: `String(255)` (Nullable=False)
  - `description`: `Text` (Nullable=True)
  - `status`: `Enum(TaskStatus)` (values: `todo`, `in_progress`, `in_review`, `done`, Nullable=False, default: `todo`)
  - `priority`: `Enum(TaskPriority)` (values: `low`, `medium`, `high`, `critical`, Nullable=False, default: `medium`)
  - `due_date`: `DateTime(timezone=True)` (Nullable=True)
  - `project_id`: `UUID(as_uuid=True)` (ForeignKey: `projects.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `assignee_id`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE SET NULL`, Nullable=True, Indexed)
  - `created_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now)
  - `updated_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now)
- **Relationships**:
  - `project`: `Mapped[Project]` (back_populates="tasks")
  - `assignee`: `Mapped[User]` (back_populates="assigned_tasks")
  - `comments`: `Mapped[list[Comment]]` (back_populates="task", cascade="all, delete-orphan")
  - `attachments`: `Mapped[list[Attachment]]` (back_populates="task", cascade="all, delete-orphan")
- **Indexes**:
  - `ix_tasks_project_id` (Index on `project_id`)
  - `ix_tasks_assignee_id` (Index on `assignee_id`)

### 7. `Comment` (Table: `comments`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `task_id`: `UUID(as_uuid=True)` (ForeignKey: `tasks.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `user_id`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `content`: `Text` (Nullable=False)
  - `created_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now)
  - `updated_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now, onupdate: UTC now)
- **Relationships**:
  - `task`: `Mapped[Task]` (back_populates="comments")
  - `user`: `Mapped[User]` (back_populates="comments")
- **Indexes**:
  - `ix_comments_task_id` (Index on `task_id`)
  - `ix_comments_user_id` (Index on `user_id`)

### 8. `Notification` (Table: `notifications`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `user_id`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `type`: `Enum(NotificationType)` (values: `task_assigned`, `task_updated`, `comment_added`, `project_invite`, `role_changed`, Nullable=False)
  - `title`: `String(255)` (Nullable=False)
  - `message`: `Text` (Nullable=False)
  - `is_read`: `Boolean` (Nullable=False, default: False)
  - `created_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now)
- **Relationships**:
  - `user`: `Mapped[User]` (back_populates="notifications")
- **Indexes**:
  - `ix_notifications_user_id` (Index on `user_id`)

### 9. `Attachment` (Table: `attachments`)
- **Fields**:
  - `id`: `UUID(as_uuid=True)` (Primary Key, default: `uuid.uuid4`)
  - `task_id`: `UUID(as_uuid=True)` (ForeignKey: `tasks.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `uploaded_by`: `UUID(as_uuid=True)` (ForeignKey: `users.id` with `ON DELETE CASCADE`, Nullable=False, Indexed)
  - `filename`: `String(255)` (Nullable=False)
  - `file_path`: `String(512)` (Nullable=False)
  - `mime_type`: `String(100)` (Nullable=False)
  - `file_size`: `Integer` (Nullable=False)
  - `created_at`: `DateTime(timezone=True)` (Nullable=False, default: UTC now)
- **Relationships**:
  - `task`: `Mapped[Task]` (back_populates="attachments")
  - `uploader`: `Mapped[User]` (back_populates="attachments")
- **Indexes**:
  - `ix_attachments_task_id` (Index on `task_id`)
  - `ix_attachments_uploaded_by` (Index on `uploaded_by`)

---

## 3. Alembic Migrations

The migrations list records the database history from base configuration up to the attachments feature implementation:

| Step | Revision ID | Parent Revision ID | Title / Purpose |
| :--- | :--- | :--- | :--- |
| 1 | `001_create_auth_tables` | None (Base) | Creates standard core `users` and session management `refresh_tokens` tables. |
| 2 | `002_create_audit_logs` | `001_create_auth_tables` | Creates system-wide `audit_logs` table for tracking operations. |
| 3 | `96d52dd28443` | `002_create_audit_logs` | Creates main `projects` table. |
| 4 | `358a06ce1e01` | `96d52dd28443` | Creates `tasks` table with relationship mappings. |
| 5 | `aff209e05cb7` | `358a06ce1e01` | Creates project RBAC membership mappings (`project_members` table). |
| 6 | `1f8ec3da9184` | `aff209e05cb7` | Creates task-based `comments` table. |
| 7 | `a0a8cd71722f` | `1f8ec3da9184` | Creates system alerting feed `notifications` table. |
| 8 | `ad2717ca52db` | `a0a8cd71722f` | Creates file management metadata store (`attachments` table). |

---

## 4. API Endpoints

The API is fully documented under Swagger UI and complies with standard REST patterns.

| Method | Path | Auth Required | Request Schema | Response Schema | Details |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **GET** | `/api/v1/health` | No | None | `APIResponse[dict]` | Returns server status and database connectivity status. |
| **POST** | `/api/v1/auth/register` | No | `UserRegister` | `APIResponse[UserResponse]` | Registers a new user. |
| **POST** | `/api/v1/auth/login` | No | `LoginRequest` | `APIResponse[TokenResponse]` | Authenticates user credentials, returns JWT tokens. |
| **POST** | `/api/v1/auth/refresh` | No | `RefreshTokenRequest` | `APIResponse[TokenResponse]` | Issues a new access token via refresh token rotation. |
| **POST** | `/api/v1/auth/logout` | No | `RefreshTokenRequest` | `APIResponse[dict]` | Revokes and blacklists a session refresh token. |
| **GET** | `/api/v1/auth/me` | **JWT** | None | `APIResponse[UserResponse]` | Retrieves current logged-in user profile details. |
| **GET** | `/api/v1/audit-logs` | **JWT** | Query parameters | `PaginatedResponse[AuditLogResponse]` | Lists audit log actions taken by the active user. |
| **POST** | `/api/v1/projects` | **JWT** | `ProjectCreate` | `APIResponse[ProjectResponse]` | Creates a new project. |
| **GET** | `/api/v1/projects` | **JWT** | Query parameters | `APIResponse[ProjectListResponse]` | Lists projects where the user is involved. |
| **GET** | `/api/v1/projects/{project_id}`| **JWT**| None | `APIResponse[ProjectResponse]` | Retrieves detailed metadata of a specific project. |
| **PATCH**| `/api/v1/projects/{project_id}`| **JWT**| `ProjectUpdate` | `APIResponse[ProjectResponse]` | Updates project details (Project owner authorization). |
| **DELETE**| `/api/v1/projects/{project_id}`|**JWT**| None | None (204) | Deletes a project (Project owner authorization). |
| **POST** | `/api/v1/tasks` | **JWT** | `TaskCreate` | `APIResponse[TaskResponse]` | Creates a new project task (Project owner authorization). |
| **GET** | `/api/v1/tasks` | **JWT** | Query parameters | `APIResponse[TaskListResponse]` | Lists tasks filtered by status/priority/assignee. |
| **GET** | `/api/v1/tasks/{task_id}` | **JWT** | None | `APIResponse[TaskResponse]` | Retrieves detailed attributes of a task. |
| **PATCH**| `/api/v1/tasks/{task_id}` | **JWT** | `TaskUpdate` | `APIResponse[TaskResponse]` | Updates task details (Project owner authorization). |
| **DELETE**| `/api/v1/tasks/{task_id}` | **JWT** | None | None (204) | Deletes a task (Project owner authorization). |
| **POST** | `/api/v1/project-members` | **JWT** | `ProjectMemberCreate` | `APIResponse[ProjectMemberResponse]` | Invites a user to a project (Owner/Manager role required). |
| **GET** | `/api/v1/project-members` | **JWT** | Query parameters | `APIResponse[ProjectMemberListResponse]` | Lists memberships associated with a project. |
| **GET** | `/api/v1/project-members/{user_id}`|**JWT**| Query parameters | `APIResponse[ProjectMemberResponse]` | Retrieves membership attributes of a specific user. |
| **PATCH**| `/api/v1/project-members/{user_id}`|**JWT**| `ProjectMemberUpdate` | `APIResponse[ProjectMemberResponse]` | Updates user role (Only OWNER can set/remove OWNER). |
| **DELETE**| `/api/v1/project-members/{user_id}`|**JWT**| Query parameters | None (204) | Removes a user from a project (Last OWNER check enforced). |
| **POST** | `/api/v1/comments` | **JWT** | `CommentCreate` | `APIResponse[CommentResponse]` | Adds a comment to a task (Project member access). |
| **GET** | `/api/v1/comments` | **JWT** | Query parameters | `APIResponse[CommentListResponse]` | Retrieves comments on a task. |
| **PATCH**| `/api/v1/comments/{comment_id}`| **JWT** | `CommentUpdate` | `APIResponse[CommentResponse]` | Edits comment content (Only the commenter authorized). |
| **DELETE**| `/api/v1/comments/{comment_id}`| **JWT** | None | None (204) | Deletes comment (Uploader, Project Owner/Manager only). |
| **GET** | `/api/v1/notifications` | **JWT** | Query parameters | `APIResponse[NotificationListResponse]` | Lists notifications for the active authenticated user. |
| **PATCH**| `/api/v1/notifications/read-all`|**JWT**| None | `APIResponse[None]` | Marks all user notifications as read. |
| **PATCH**| `/api/v1/notifications/{id}/read`|**JWT**| None | `APIResponse[NotificationResponse]` | Marks a specific notification as read. |
| **DELETE**| `/api/v1/notifications/{id}` | **JWT** | None | None (204) | Deletes a notification. |
| **GET** | `/api/v1/dashboard/overview` | **JWT** | None | `APIResponse[DashboardOverviewResponse]`| Retrieves overview statistics across user projects. |
| **GET** | `/api/v1/dashboard/activity` | **JWT** | Query parameters | `APIResponse[DashboardActivityResponse]`| Retrieves recent audit logs related to the user. |
| **GET** | `/api/v1/dashboard/my-tasks` | **JWT** | Query parameters | `APIResponse[DashboardMyTasksResponse]` | Retrieves tasks assigned to the user. |
| **GET** | `/api/v1/dashboard/project/{id}`|**JWT**| None | `APIResponse[DashboardProjectOverviewResponse]`| Retrieves statistics for a specific project. |
| **GET** | `/api/v1/search` | **JWT** | Query parameters | `APIResponse[SearchResultsResponse]` | Global cross-entity text search (partial-matching). |
| **POST** | `/api/v1/attachments` | **JWT** | Form data | `APIResponse[AttachmentResponse]` | Uploads a file attachment for a task. |
| **GET** | `/api/v1/attachments` | **JWT** | Query parameters | `APIResponse[list[AttachmentResponse]]` | Lists all file attachments of a task. |
| **GET** | `/api/v1/attachments/{id}` | **JWT** | None | `FileResponse` | Downloads/serves a task file attachment. |
| **DELETE**| `/api/v1/attachments/{id}` | **JWT** | None | None (204) | Deletes an attachment (Uploader, Project Owner/Manager). |

---

## 5. Services

The business logic is encapsulated in 10 transactional service classes:

1. `UserService`: Handles user fetching operations.
2. `AuthService`: Manages user registration, JWT generation, opaque refresh token lifecycle, and secure revocation.
3. `ProjectService`: Implements logic for project lifecycle, verifying name uniqueness per owner, and restricting reads/writes.
4. `TaskService`: Handles task state transformations, priority bounds, assignee existence validation, and name uniqueness checks.
5. `ProjectMemberService`: Enforces RBAC validations (invitations, role demotions, prevent deleting last OWNER, manager bounds).
6. `CommentService`: Validates commenter's membership in the project and manages modification permissions.
7. `NotificationService`: Implements operations on alert feeds (mark read, delete, lists).
8. `DashboardService`: Aggregates project statistics, count of completed/pending/overdue tasks, priority segments, and activity feeds.
9. `SearchService`: Interfaces with multiple repositories to execute matching on projects, tasks, and comments.
10. `AttachmentService`: Manages disk storage of file payloads, validates file existence, and authorizes CRUD.

---

## 6. Repositories

Database access is segregated into repositories extending a base repository class:

- `BaseRepository[ModelType]`: Abstract class injecting `AsyncSession` providing helper methods (`create`, `update`, `delete`, `flush`, `get_by_id`).
- `UserRepository`: Implements lookups by email and ID.
- `RefreshTokenRepository`: Implements lookup by hashed token, revocation, and cleanup.
- `AuditLogRepository`: Implements paginated retrieval and user activity logs lookup.
- `ProjectRepository`: Handles project retrieval, archive flags, and involved project lookups (where user is owner or member).
- `ProjectMemberRepository`: Implements lookup by project and user, checks existence, counts active owners, and list filters.
- `TaskRepository`: Handles task list querying, sorting, filters, and dashboard statistic counts.
- `CommentRepository`: Implements task comment listings and task text search joins.
- `NotificationRepository`: Handles notifications listing, bulk-read updates, and deletes.
- `AttachmentRepository`: Handles attachment listing and fetching.

---

## 7. Pydantic Schemas

Serialization and API validations are strictly typed using Pydantic v2 schemas:

- **Authentication**: `LoginRequest`, `RefreshTokenRequest`, `TokenResponse`.
- **User**: `UserRegister` (validates email structure, password constraints), `UserResponse`.
- **Response Contracts**: `APIResponse[T]` (standardized JSON envelop), `PaginatedResponse[T]` (includes pagination metadata).
- **Projects**: `ProjectCreate`, `ProjectUpdate`, `ProjectResponse`, `ProjectListResponse` (combines list items, total, pagination bounds).
- **Project Members**: `ProjectMemberCreate` (enforces default `DEVELOPER` role), `ProjectMemberUpdate` (allows role changes), `ProjectMemberResponse`, `ProjectMemberListResponse`.
- **Tasks**: `TaskCreate` (strips input strings, validates assignee), `TaskUpdate`, `TaskResponse`, `TaskListResponse`.
- **Comments**: `CommentCreate`, `CommentUpdate`, `CommentResponse`, `CommentListResponse`.
- **Notifications**: `NotificationResponse`, `NotificationListResponse`.
- **Dashboard**: `DashboardOverviewResponse`, `DashboardProjectOverviewResponse`, `DashboardActivityResponse`, `DashboardMyTasksResponse`.
- **Search**: `SearchResultsResponse` (contains array buckets for projects, tasks, and comments).
- **Attachments**: `AttachmentResponse`.

---

## 8. Middleware

The backend registers the following middleware component in `main.py`:

- `CORSMiddleware` (`fastapi.middleware.cors.CORSMiddleware`):
  - **Function**: Prevents Cross-Origin Resource Sharing (CORS) security issues.
  - **Configuration**:
    - `allow_origins`: Evaluates to `["*"]` in development mode, and defaults to `[]` in production mode.
    - `allow_credentials`: Set to `True` to allow cookies and auth headers.
    - `allow_methods`: Set to `["*"]` to allow all REST verbs.
    - `allow_headers`: Set to `["*"]` to allow custom application headers.

---

## 9. Security Review

### JWT (JSON Web Tokens)
- **Implementation**: Access tokens are signed using `jose.jwt` (HS256 algorithm) using a server secret `BACKEND_SECRET_KEY`.
- **Refresh Strategy**: Avoids storing sensitive long-lived credentials. Instead, uses refresh token rotation with cryptographically random opaque strings (`secrets.token_urlsafe(64)`). The token string is stored securely as a SHA-256 hash in the database.
- **Revocation**: The `logout` flow immediately revokes refresh tokens in the database, blocking subsequent access attempts.

### RBAC (Role-Based Access Control)
- **Global Roles**: Verified via `require_role(UserRole.ADMIN)` dependency (restricts actions like system-wide monitoring).
- **Project Roles**: Custom RBAC logic is embedded within service layers:
  - Only `OWNER` and `MANAGER` can add new project members.
  - Only `OWNER` can elevate or demote another user to `OWNER`.
  - Checks prevent removing or demoting the last `OWNER` of a project, securing project ownership records.
  - Project `MANAGER` cannot remove other managers from the project to prevent escalation of privileges.
  - Non-members are restricted from creating or downloading task comments and file attachments.

### Input Validation
- Request bodies are verified using Pydantic. Validation rules check:
  - Email validity (must conform to standard email syntax).
  - String sanitization (truncates whitespace for project/task names).
  - Enuemeration constraint limits (`TaskStatus`, `TaskPriority`, `ProjectRole` values).
  - SQL Injection / Boundary Limits: The application utilizes SQLAlchemy 2.0 parameterized select models, mitigating SQL injection hazards.

### File Upload Validation
- Attachment uploads are handled as multiparts.
- **Filename Sanitization**: A unique UUID prefix is pre-pended to the filename when written to disk (e.g. `uuid_filename.ext`). This completely neutralizes directory traversal payloads (like `../../etc/passwd` or similar).

---

## 10. Performance Review

### N+1 Queries
- **Current State**: The repository model query builders (e.g. listing projects or tasks) retrieve model relationships on-demand. When converting relationships to Pydantic responses in lists, SQLAlchemy lazy-loads the associated models by executing a separate query for each item, leading to N+1 query execution.
- **Remediation**: Use SQLAlchemy's `selectinload` or `joinedload` options in the list queries for frequently returned nested relationships (such as loading task assignees or project members).

### Missing Indexes
- **Audit Findings**:
  - `project_members`: Standing foreign key index on `project_id` and `invited_by` are absent. (The composite unique constraint index `uq_project_member` mitigates lookups on `project_id` when it's the leading column, but a standalone index is recommended if query patterns change).
  - `refresh_tokens`: Foreign key `user_id` has an index.
  - `audit_logs`: User actions are index-covered.
  - `tasks`: `project_id` and `assignee_id` are covered.
- **Recommendation**: Create indices on query filter fields, specifically tracking task `status` or `priority` if lists grow large, and on member `project_id` / `invited_by` columns.

### Pagination
- Paginated results are consistently implemented via `limit` / `offset` query parameters.
- **Warning**: Offset-based pagination degrades in performance on extremely large datasets (high offset values require reading/discarding rows). For high-scale log tables like `audit_logs`, keyset pagination (cursor-based) is recommended.

### Database Optimization
- **Session Management**: Session cleanup is managed via FastAPI dependencies ensuring connection pooling resources are returned.
- **Bulk Operations**: Bulk operations (e.g. `mark_all_read` notifications) utilize a single update statement instead of updating items iteratively.

---

## 11. Test Summary

The test suite consists of 42 tests checking service logical business constraints and API endpoint behaviors:

- **Unit Tests (Service Layer)**: **22 tests**
  - Verify auth token rotations, register constraints, RBAC role restrictions, comment validation, duplicate task titles, and last-owner protection checks.
- **Integration Tests (API Router Layer)**: **20 tests**
  - Verify JWT auth checks, REST response contracts, HTTP status mappings, dashboard overview counts, search lookups, and multipart attachment uploads.
- **Coverage**:
  - Not configured by default in dependencies (`pytest-cov` is absent).
  - Running the suite returns a **100% success rate** (all 42 tests pass).

---

## 12. Missing Production Features

To achieve a production-ready grade, the backend requires the following additions:

1. **Rate Limiting**:
   - Authentication routes (`/auth/login`, `/auth/register`) do not implement rate limits, exposing the API to brute-force credential stuffing and denial of service.
2. **Virus/Malware Scanning**:
   - File attachment uploads do not parse the files for malware signatures.
3. **Max File Size Constraints**:
   - The application does not enforce a rigid maximum size limit on multipart file uploads, which could lead to resource exhaustion attacks (filling server disk space).
4. **Email Verification Feed**:
   - The model has a verification column `is_verified` but does not implement SMTP server connectors or token generation to enforce verify flows.
5. **Secure Object Storage Integration**:
   - File attachments are stored in a local directory (`uploads/`). This does not scale in a multi-instance containerized cloud deployment (e.g. ECS/Kubernetes) since files uploaded to one container are not accessible to other instances.
6. **Token Blacklist Cache**:
   - Invalidated refresh tokens are kept in the database, but access tokens (JWTs) are stateless and cannot be revoked prior to expiration unless a distributed caching blacklist (like Redis) is implemented.

---

## 13. Suggestions for Improvement

Based on the audit, the following structural enhancements are recommended:

1. **Adopt Object Storage (AWS S3 / Google Cloud Storage)**:
   - Abstract file uploads behind a `StorageService` interface. Write an `S3StorageProvider` for production cloud storage and a `LocalStorageProvider` for local testing.
2. **Implement Keyset Pagination for Audit Logs**:
   - Audit logs grow linearly over time. Replace offset pagination with cursor-based pagination (e.g. querying records `WHERE id < last_id` sorted by id descending) to keep query time constant.
3. **Integrate Distributed Caching (Redis)**:
   - Use Redis to manage rate-limiting states and to store blacklisted stateless JWT access tokens on logout.
4. **Prevent N+1 Queries with Eager Loading**:
   - Modify list query patterns in repositories to explicitly specify `selectinload` for relationships needed by Pydantic response models.
5. **Consolidate Soft Delete Behaviors**:
   - Tasks and comments are hard-deleted. Consider introducing a soft-delete mechanism (e.g. `is_deleted` column) to match the pattern of projects (`is_archived`) and allow for data restoration.
