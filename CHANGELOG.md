# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.0] - 2026-08-06

### Added
- **Automated Cloud Deployments**: Created production and staging deployment pipelines via Vercel CLI and Render Deploy Hooks.
- **Diagnostics and Tracking**: Integrated Sentry client and backend exception capturing.
- **Request Tracing**: Configured HTTP middlewares to generate and propagate `X-Request-ID` and `X-Correlation-ID` context trace logs.
- **Observability Metrics**: Added custom liveness, readiness, and Prometheus compatible `/metrics` tracking endpoints.
- **Resend Email Service**: Built a lightweight email client using `httpx` for password resets and invites.
- **Quality Gates**: Implemented preventative code quality verification scripts checking for debuggers, conflict markers, console.log statements, and lockfile duplicates.
- **Repository Engineering**: Added `.gitattributes` normalization, `CODEOWNERS` boundaries, `dependabot.yml` updates, and deployment playbooks.

## [1.0.0] - 2026-08-03

### Added
- **Multi-Tenant Workspaces**: Created workspaces and memberships structures to allow clean isolation boundaries.
- **Kanban Task Boards**: Implemented responsive column board managers filtering by status/priority.
- **Activity logs**: Implemented backend logger logic that captures and exposes transaction actions via search and analytics feeds.
- **Notification Feed**: Added system feed notifications triggered by task assignments, edits, or role elevations.
- **Secure File Attachments**: Added task attachment endpoints managing multipart uploads, mime checks, and disk persistence.
- **Global Search**: Instant text search spanning projects, tasks, and comments.
- **GitHub community configs**: Added ISSUE_TEMPLATE configs, PULL_REQUEST_TEMPLATE guidelines, and community governance docs.

### Changed
- **Rate-Limiting Expansion**: Extended sliding-window rate limit checks to sensitive endpoints: password recovery (`/forgot-password`), resets (`/reset-password`), and verification (`/verify-email`).
- **Nginx Security Hardening**: Injected headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy`) directly into production Docker Nginx server config.

### Fixed
- **In-Memory Cache Leaks**: Refactored the fallback rate limiter logging tracker to prune expired timestamps and delete empty keys periodically.
- **Linter Formatting Errors**: Fixed backend import sort orders to resolve Ruff warnings.
