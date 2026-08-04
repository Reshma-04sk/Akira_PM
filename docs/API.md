# API Reference Guide

Akira-PM provides a RESTful API. This guide outlines standard HTTP response envelopes, error structures, authentication protocols, and primary API routes.

---

## 1. Request and Response Envelopes

All responses conform to a unified wrapper structure to simplify parsing in client applications:

### Success Response
* **HTTP Status Code**: `200 OK` / `201 Created`
* **JSON Payload**:
  ```json
  {
    "data": {
      "id": "c3abf156-6f97-41b1-b1f2-b6acc68570e8",
      "name": "Project Alpha",
      "is_archived": false
    }
  }
  ```

### Paginated Success Response
* **JSON Payload**:
  ```json
  {
    "items": [...],
    "total": 45,
    "page": 1,
    "page_size": 20
  }
  ```

### Error Response
* **HTTP Status Code**: `400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found` / `422 Unprocessable Content` / `500 Internal Server Error`
* **JSON Payload**:
  ```json
  {
    "error": {
      "message": "Resource not found",
      "field": null
    }
  }
  ```

---

## 2. Authentication Flow

Authentication is managed via HTTP Authorization header with standard JWT bearer token:

`Authorization: Bearer <access_token>`

- **Lifespan**: Access tokens expire in 30 minutes.
- **Rotation**: Clients must call the refresh endpoint `/auth/refresh` using their opaque refresh token to receive a new set of credentials before the access token expires.

---

## 3. Route Index

### 🔐 Authentication (`/api/v1/auth`)

#### `POST /auth/register`
* **Auth required**: No (Rate limited)
* **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "full_name": "Developer User"
  }
  ```
* **Success (201)**: Returns registered User details.

#### `POST /auth/login`
* **Auth required**: No (Rate limited)
* **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
* **Success (200)**: Returns JWT access token and opaque refresh token.

#### `POST /auth/refresh`
* **Auth required**: No
* **Request Payload**:
  ```json
  {
    "refresh_token": "opaque_refresh_token_string..."
  }
  ```
* **Success (200)**: Returns new JWT access and refresh token pair.

---

### 📂 Projects (`/api/v1/projects`)

#### `GET /projects`
* **Auth required**: **JWT**
* **Query Parameters**:
  - `page`: default `1`
  - `page_size`: default `20`
* **Success (200)**: Returns array of Projects where user is Owner or Member.

#### `POST /projects`
* **Auth required**: **JWT**
* **Request Payload**:
  ```json
  {
    "name": "Project Beta",
    "description": "Beta launch tasks"
  }
  ```
* **Success (201)**: Returns created Project details.

---

### 📝 Tasks (`/api/v1/tasks`)

#### `GET /tasks`
* **Auth required**: **JWT**
* **Query Parameters**:
  - `project_id`: optional UUID
  - `assignee_id`: optional UUID
  - `status`: optional enum (`todo`, `in_progress`, `in_review`, `done`)
  - `priority`: optional enum (`low`, `medium`, `high`, `critical`)
* **Success (200)**: Returns array of Tasks with nested Project and Assignee models.

#### `POST /tasks`
* **Auth required**: **JWT**
* **Request Payload**:
  ```json
  {
    "title": "Fix Rate Limiting Leak",
    "description": "Prune stale dictionary records in fallback",
    "status": "todo",
    "priority": "high",
    "project_id": "c3abf156-6f97-41b1-b1f2-b6acc68570e8"
  }
  ```

---

### 📎 Attachments (`/api/v1/attachments`)

#### `POST /attachments`
* **Auth required**: **JWT**
* **Content-Type**: `multipart/form-data`
* **Form Parameters**:
  - `task_id`: UUID
  - `file`: binary file payload (Max size 10MB)
* **Success (201)**: Returns attachment details.

#### `GET /attachments/{attachment_id}`
* **Auth required**: **JWT**
* **Success (200)**: Direct file stream with appropriate MIME headers.

---

## 4. OpenAPI / Swagger Documentation
Full interactive endpoints catalog is compiled in uvicorn environment. Developers can access UI configurations locally:
* **Swagger Docs UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Catalog**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
