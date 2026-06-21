# Backend Integration Guide

This document describes the HTTP API contract used by the frontend prototype.

## Base URL

Local Compose defaults:

```text
http://localhost:8000/api/
```

Frontend code running inside Docker Compose can use:

```text
http://backend:8000/api/
```

The frontend service currently receives `BACKEND_URL` from Compose. Browser-side
requests should use the exposed host URL, for example `http://localhost:8000`.

## Authentication

The backend uses JWT bearer tokens. Except for login and token refresh, frontend
requests should include:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Login

```http
POST /api/auth/login/
```

Request:

```json
{
  "email": "doctor@example.local",
  "password": "change-me"
}
```

Success response:

```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>",
  "user": {
    "id": 1,
    "email": "doctor@example.local",
    "name": "Doctor",
    "is_active": true,
    "is_staff": false,
    "is_superuser": false,
    "date_joined": "2026-06-21T10:00:00Z"
  }
}
```

Validation error response:

```json
{
  "non_field_errors": ["Invalid email or password."]
}
```

### Refresh Access Token

```http
POST /api/auth/refresh/
```

Request:

```json
{
  "refresh": "<refresh_token>"
}
```

Success response:

```json
{
  "access": "<new_access_token>"
}
```

### Current User

```http
GET /api/auth/me/
```

Requires bearer token.

Success response:

```json
{
  "id": 1,
  "email": "doctor@example.local",
  "name": "Doctor",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "date_joined": "2026-06-21T10:00:00Z"
}
```

### Update Current User

```http
PATCH /api/auth/me/
```

Requires bearer token.

Request:

```json
{
  "name": "Updated Name"
}
```

The password cannot be changed through this endpoint.

### Logout

```http
POST /api/auth/logout/
```

Requires bearer token.

Request:

```json
{
  "refresh": "<refresh_token>"
}
```

Success response:

```json
{
  "detail": "Successfully logged out."
}
```

## Diagnostics API

Diagnostics endpoints are the frontend bridge to the scheduler. The frontend
communicates with the backend over HTTP. The backend communicates with the
scheduler over its TCP JSON protocol.

All diagnostics endpoints require a bearer token.

### List Diagnostic Models

```http
GET /api/diagnostics/models/
```

Success response:

```json
{
  "models": [
    {
      "id": "dxassist-angiography",
      "name": "Angiography",
      "type": "single",
      "description": "Coronary angiography image analysis.",
      "input_schema": {
        "image": "Base64-encoded angiography image."
      }
    },
    {
      "id": "dxassist-screening",
      "name": "Blood screening",
      "type": "single",
      "description": "Blood-test screening analysis.",
      "input_schema": {
        "blood_test": "Base64-encoded or plain-text blood-test data."
      }
    },
    {
      "id": "dxassist-heartdisease",
      "name": "Heart disease",
      "type": "combined",
      "description": "Combined angiography and blood screening analysis.",
      "input_schema": {
        "image": "Base64-encoded angiography image for the first model."
      },
      "additional_data_schema": {
        "dxassist-screening": {
          "blood_test": "Base64-encoded or plain-text blood-test data."
        }
      }
    }
  ]
}
```

### Run Analysis

```http
POST /api/diagnostics/analyze/
```

Request fields:

| Field | Type | Required | Description |
|---|---:|---:|---|
| `model` | string | yes | Scheduler model identifier. |
| `data` | object | yes | Initial model input passed to the scheduler. |
| `additional_data` | object | no | Data keyed by model id for combined-model follow-up prompts. |

Single-model request:

```json
{
  "model": "dxassist-angiography",
  "data": {
    "image": "base64_encoded_image_string"
  }
}
```

Single-model success response:

```json
{
  "model": "dxassist-angiography",
  "status": "completed",
  "result": {
    "coronary_disease_probability": 98
  },
  "intermediate_requests": []
}
```

Combined-model request:

```json
{
  "model": "dxassist-heartdisease",
  "data": {
    "image": "base64_encoded_angiography_image"
  },
  "additional_data": {
    "dxassist-screening": {
      "blood_test": "base64_encoded_or_text_data"
    }
  }
}
```

Combined-model success response:

```json
{
  "model": "dxassist-heartdisease",
  "status": "completed",
  "result": {
    "aggregated": {
      "coronary_disease_probability": 81.2
    },
    "details": {
      "dxassist-angiography": {
        "coronary_disease_probability": 98
      },
      "dxassist-screening": {
        "atherosclerosis_risk": 72,
        "inflammation_marker": "elevated"
      }
    },
    "weights": {
      "dxassist-angiography": 0.4,
      "dxassist-screening": 0.6
    },
    "combined_model": "dxassist-heartdisease"
  },
  "intermediate_requests": [
    {
      "status": "partial",
      "message": "Please provide data for dxassist-screening",
      "model_index": 2,
      "total_models": 2,
      "current_model": "dxassist-screening",
      "previous_results": {
        "dxassist-angiography": {
          "coronary_disease_probability": 98
        }
      }
    }
  ]
}
```

If a combined model needs data that was not supplied:

```json
{
  "detail": "Missing additional data for scheduler prompt 'dxassist-screening'. Provide it under additional_data.dxassist-screening.",
  "current_model": "dxassist-screening",
  "partial_request": {
    "status": "partial",
    "message": "Please provide data for dxassist-screening",
    "model_index": 2,
    "total_models": 2,
    "current_model": "dxassist-screening",
    "previous_results": {}
  }
}
```

HTTP status: `400`.

Scheduler unavailable response:

```json
{
  "detail": "Scheduler is unavailable."
}
```

HTTP status: `503`.

Scheduler timeout response:

```json
{
  "detail": "Scheduler request timed out."
}
```

HTTP status: `504`.

Invalid scheduler response:

```json
{
  "detail": "Scheduler returned an invalid response."
}
```

HTTP status: `502`.

## Users API

User management endpoints are intended for administrators. They require a bearer
token and admin permissions.

```http
GET    /api/users/
POST   /api/users/
GET    /api/users/{id}/
PUT    /api/users/{id}/
PATCH  /api/users/{id}/
DELETE /api/users/{id}/
```

Create user request:

```json
{
  "email": "doctor@example.local",
  "name": "Doctor",
  "password": "change-me"
}
```

User response:

```json
{
  "id": 1,
  "email": "doctor@example.local",
  "name": "Doctor",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "date_joined": "2026-06-21T10:00:00Z"
}
```

## Frontend Notes

- Treat `access` as the short-lived bearer token and `refresh` as the token used
  to obtain new access tokens.
- Store the current user from `/api/auth/login/` or `/api/auth/me/`.
- Send all available combined-model inputs in one `/api/diagnostics/analyze/`
  request. The backend keeps the scheduler socket open and handles scheduler
  follow-up prompts internally.
- File uploads are not implemented yet. Convert uploaded files to base64 in the
  frontend before calling diagnostics endpoints.
- Result object fields are scheduler/model-defined and may differ by model. The
  frontend should render unknown result keys generically for the prototype.

## Prototype Caveats

- Diagnostics requests are not persisted in the database.
- There is no audit log or request history yet.
- Scheduler host, port, and timeout are configured by backend environment
  variables: `SCHEDULER_HOST`, `SCHEDULER_PORT`, and
  `SCHEDULER_TIMEOUT_SECONDS`.
- In Docker Compose, the backend expects the scheduler at
  `scheduler:8001`. The scheduler must bind to an interface reachable from the
  backend container.
