# Backend Prototype Overview

This document describes the current backend prototype state. It is intentionally
small and focused on proving the frontend-to-scheduler flow.

## Purpose

The backend currently acts as the HTTP API layer for the DxAssist prototype.
Its main role is to:

- authenticate frontend users,
- expose basic user/admin endpoints,
- expose diagnostics endpoints for the frontend,
- translate frontend HTTP diagnostics requests into scheduler TCP requests,
- return scheduler/model results in a frontend-friendly JSON response.

The backend does not run diagnostic models itself. It delegates analysis to the
scheduler, which then calls the configured model services.

## Current Architecture

The prototype backend is a Django 6 and Django REST Framework service.

Main app areas:

- `apps.authentication`: JWT login, refresh, logout, and current-user profile.
- `apps.users`: basic admin-only user management.
- `apps.diagnostics`: prototype diagnostics bridge to the scheduler.
- `config.settings`: environment-specific Django settings.

Request flow for diagnostics:

```text
Frontend
  -> HTTP /api/diagnostics/analyze/
Backend
  -> TCP JSON request to scheduler
Scheduler
  -> model service(s)
Scheduler
  -> TCP JSON response to backend
Backend
  -> HTTP JSON response to frontend
```

For combined models, the scheduler may ask for more data while the TCP
connection is open. The backend handles that conversation internally. The
frontend sends all known combined-model input data in the original HTTP request.

## Implemented Features

### Authentication

The backend supports JWT-based authentication:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `PATCH /api/auth/me/`

There is no public registration flow. Users are intended to be created by an
administrator.

### User Management

The backend exposes admin-only user management through:

```text
/api/users/
```

This is currently a standard DRF model viewset for the custom user model.

### Diagnostics Scheduler Bridge

The backend exposes:

- `GET /api/diagnostics/models/`
- `POST /api/diagnostics/analyze/`

The models endpoint returns static prototype metadata for:

- `dxassist-angiography`
- `dxassist-screening`
- `dxassist-heartdisease`

The analyze endpoint opens a TCP connection to the scheduler, sends a
newline-terminated JSON request, waits for scheduler responses, handles combined
model partial prompts, and returns the final result to the frontend.

Scheduler connection settings:

| Setting | Default | Description |
|---|---:|---|
| `SCHEDULER_HOST` | `scheduler` | Hostname used by the backend to reach the scheduler. |
| `SCHEDULER_PORT` | `8001` | Scheduler TCP port. |
| `SCHEDULER_TIMEOUT_SECONDS` | `15` | Socket timeout for scheduler communication. |

## What Is Not Implemented Yet

The prototype deliberately does not include:

- persisted diagnostics requests,
- diagnostics history,
- audit logs,
- file upload storage,
- database-backed model registry,
- scheduler health endpoint,
- async/background analysis jobs,
- progress streaming to the frontend,
- role model beyond staff/superuser checks,
- detailed medical-domain validation of submitted data,
- model version traceability,
- result approval/review workflow,
- production-grade observability.

The current diagnostics API is synchronous. A frontend request waits until the
scheduler returns a result or an error.

## Data Handling Assumptions

The current API expects diagnostic input to be JSON-serializable.

For the prototype:

- images should be sent as base64 strings,
- blood-test input can be sent as base64 or plain text,
- no uploaded files are stored by the backend,
- results are passed through from the scheduler with minimal transformation.

Because results are model-defined, frontend rendering should tolerate unknown
keys and nested objects.

## Error Handling

The diagnostics bridge maps scheduler communication failures to HTTP responses:

- `400`: combined model requested additional data that was not supplied,
- `502`: scheduler returned invalid protocol data,
- `503`: scheduler could not be reached,
- `504`: scheduler request timed out.

Normal DRF validation errors are returned for malformed HTTP request bodies.

## Testing

Current backend verification includes:

- Django system checks through `manage.py check`,
- pytest test execution,
- Django test runner execution for diagnostics client tests,
- Ruff lint checks.

Diagnostics scheduler-client tests use Django `SimpleTestCase`, so they can run
with both:

```bash
.venv/bin/python -m pytest apps/diagnostics/tests/test_scheduler_client.py
.venv/bin/python manage.py test apps.diagnostics.tests.test_scheduler_client
```

## Local Development Notes

From `dxassist-backend/`:

```bash
make check-lint
make test
```

Useful direct commands:

```bash
.venv/bin/python manage.py check
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
```

The full local stack is started from the repository root:

```bash
docker compose up --build
```

Default local endpoints:

- Backend API: `http://localhost:8000/api/`
- Django admin: `http://localhost:8000/admin/`
- Frontend: `http://localhost:3000`
- Scheduler TCP port: `8001`

## Known Prototype Caveats

- The scheduler must be reachable from the backend container. In Docker Compose,
  the backend expects `scheduler:8001`.
- If the scheduler binds only to `127.0.0.1` inside its own container, other
  containers cannot reach it through the Compose network. It should bind to an
  interface reachable from the backend container for container-to-container
  communication.
- Diagnostics model metadata is static in backend code and may drift from the
  scheduler config.
- The backend does not currently store analysis inputs or outputs.
- The backend is not ready for real medical data or production deployment.

## Related Documentation

- `docs/backend_integration.md`: frontend-facing endpoint contracts.
- `dxassist-scheduler/API.md`: scheduler TCP protocol.
