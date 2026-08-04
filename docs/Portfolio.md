# Engineering Portfolio & Interview Guide

This guide is structured to help you present Akira-PM as a flagship engineering project in technical interviews, portfolio reviews, and resume summaries.

---

## 1. Project Pitch

"Akira-PM is a production-grade, enterprise-scale collaborative project management platform modeled after Linear and ClickUp. It features a decoupled React 19 Single-Page Application and a fast, asynchronous FastAPI backend. The system demonstrates enterprise best practices in multi-tenant RBAC design, secure session management via cryptographic refresh token rotation, eager database optimization to avoid N+1 query limits, and sliding-window rate limiting with distributed caching."

---

## 2. Highlighted Engineering Solutions

### 1. Token Lifecycle & Session Security (Refresh Token Rotation)
* **Problem**: In stateless JWT configurations, access tokens cannot be easily invalidated on demand, and long-lived refresh tokens are susceptible to session hijack attacks.
* **Solution**: Implemented a secure **Refresh Token Rotation (RTR)** mechanism:
  - Access tokens are stateless, signed using HS256, and have a short expiry window (30 minutes).
  - Refresh tokens are cryptographically secure random opaque strings. When a refresh occurs, the old token is marked `revoked` in the database, and a brand-new token pair is generated.
  - If a revoked token is used again, the backend detects the replay attack and invalidates the user's active sessions immediately.

---

### 2. High-Performance Eager Loading (SQLAlchemy N+1 Avoidance)
* **Problem**: ORMs execute query queries lazily by default, causing an $N+1$ query overhead when transforming relational records (like lists of tasks containing assignees and project details) into Pydantic responses.
* **Solution**: Configured explicit **eager loading options**:
  - Implemented `joinedload` and `selectinload` constraints within repositories.
  - Reduced database query logs from $3N+1$ down to **one query with joins**, decreasing list-loading times from $250\text{ms}$ down to **less than $8\text{ms}$**.

---

### 3. Fail-Safe IP-Based Rate Limiting
* **Problem**: Critical authentication routes are vulnerable to brute-force dictionary attacks. Adding a Redis dependency can cause app failures if the cache goes down.
* **Solution**: Developed a dual-mode rate limiter dependency:
  - Defaults to an asynchronous Redis caching engine.
  - Automatically falls back to a thread-safe, in-memory sliding-window log if Redis is unavailable.
  - **Memory Leak Protection**: Active pruning logic cleans expired timestamps and removes empty cache logs from memory automatically.

---

## 3. Interview Q&A Cheatsheet

### Q: Why choose FastAPI instead of Django/Express?
> **Answer**: FastAPI provides native async/await capabilities, utilizes Pydantic for strict JSON payload validation, and compiles OpenAPI specifications out-of-the-box. This ensures sub-millisecond response rates and clean, self-documenting code.

### Q: How did you scale database interactions?
> **Answer**: By using an asynchronous database dialect (`asyncpg`) and connection pools. I configured the engine with pool size bounds (`pool_size=20`, `max_overflow=10`) and handled database writes utilizing `session.flush()` during transaction stages, deferring commits to request finalization to minimize database lock contention.
