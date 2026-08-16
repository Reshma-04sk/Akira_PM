# Security Architecture & Best Practices — Akira PM

> **Document Version:** 1.0.0  
> **Status:** Production Reference

---

## 1. Security Overview

Akira PM employs defense-in-depth security principles across transport, authentication, authorization, database storage, and runtime infrastructure.

---

## 2. Authentication & Session Security

### Password Hashing

- Utilizes **Bcrypt** with unique cryptographic salt generation per password.
- No plain text passwords are ever logged or persisted.

### JWT Access Tokens

- **Algorithm**: `HS256` signed with `BACKEND_SECRET_KEY`.
- **Lifespan**: Short-lived (30 minutes default).
- **Claims**: Includes unique token ID (`jti`) and typed token indicator (`type: "access"`).

### Single-Use Refresh Token Rotation

- Opaque 64-byte random ASCII tokens (`secrets.token_urlsafe(64)`).
- Stored as SHA-256 hashes (`hashlib.sha256`) in PostgreSQL.
- **Rotation**: Presenting a refresh token immediately revokes the token (`revoked = True`) and issues a fresh Access/Refresh token pair.
- **Replay Attack Mitigation**: Attempted reuse of any revoked token triggers immediate session termination and audit logging.

---

## 3. Role-Based Access Control (RBAC)

Access permissions are enforced dynamically at the route dependency layer:

| Level         | Roles                                              | Enforcement Mechanism                                                          |
| :------------ | :------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Global**    | `admin`, `user`                                    | Checked via `require_role(...)` in `src/dependencies/auth.py`.                 |
| **Workspace** | `owner`, `admin`, `manager`, `developer`, `viewer` | Checked via `check_workspace_role(...)` in `src/dependencies/permissions.py`.  |
| **Project**   | `owner`, `manager`, `developer`, `viewer`          | Checked via `check_project_read/write_permission(...)`.                        |
| **Task**      | Creator, Assignee, Workspace Admin                 | Developers may only update status/priority on tasks assigned directly to them. |

---

## 4. Network & Transport Security

### Security Headers

Configured via `add_security_headers` middleware in `src/main.py`:

- `Content-Security-Policy`: `default-src 'none'; frame-ancestors 'none'; sandbox;`
- `Strict-Transport-Security` (HSTS): `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `DENY` (prevents clickjacking)
- `X-Content-Type-Options`: `nosniff` (prevents MIME-type confusion)
- `Referrer-Policy`: `no-referrer` / `strict-origin-when-cross-origin`
- `Permissions-Policy`: Disables unused browser hardware capabilities (camera, microphone, geolocation).

### Host Header Protection

- `TrustedHostMiddleware` blocks host header spoofing by enforcing an explicit `ALLOWED_HOSTS` whitelist in production.

---

## 5. Rate Limiting & Abuse Prevention

- **Redis Sliding-Window Rate Limiting**: Sensitive endpoints (registration, authentication, password recovery) enforce strict per-IP rate limits (e.g. 5 requests per 60 seconds).
- **Fail-Safe In-Memory Fallback**: If Redis is unavailable, an in-memory sliding window limiter maintains protection.

---

## 6. Data Sanitization & SQL Injection Defense

- **100% Parameterized Queries**: All database queries are executed via async SQLAlchemy 2.0 ORM; no raw string concatenation is permitted.
- **Input Validation**: Pydantic v2 schemas reject malformed data types, oversized strings, and invalid email formats before invoking business logic.

---

## 7. Reporting Security Vulnerabilities

If you discover a security vulnerability within Akira PM, please send an advisory to the maintainers rather than opening a public GitHub issue.
