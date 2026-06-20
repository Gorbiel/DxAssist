# Docker Compose

This document covers the Docker Compose files in the repository root.

## Services

The development stack starts:

- `db`: PostgreSQL 17
- `backend`: Django API from `./dxassist-backend`
- `frontend`: Next.js app from `./dxassist-frontend`

The backend depends on a healthy PostgreSQL container. The frontend depends on the backend container.

## Required Environment

Create a root `.env` file or export these variables before starting the stack:

```bash
POSTGRES_DB=dxassist
POSTGRES_USER=dxassist
POSTGRES_PASSWORD=change-me
SECRET_KEY=change-me
```

`SECRET_KEY` has an insecure local fallback for production-like runs, but should be set explicitly whenever testing deployment behavior.

## Development

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`
- Django admin: `http://localhost:8000/admin/`

## Production-Like Local Run

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --build
```

This uses the same local topology, but runs the backend with Gunicorn and the frontend with `npm run start`.

## Stop

Development:

```bash
docker compose down
```

Production-like:

```bash
docker compose -f compose.yaml -f compose.prod.yaml down
```

## Full Cleanup

Use this when debugging Compose, Dockerfile, dependency, or volume issues.

Development:

```bash
docker compose down --volumes --rmi local --remove-orphans
```

Production-like:

```bash
docker compose -f compose.yaml -f compose.prod.yaml down \
  --volumes \
  --rmi local \
  --remove-orphans
```

This removes named volumes, locally built images, and orphaned containers. It also wipes local PostgreSQL data and frontend cache volumes.

## Reset Frontend Volumes

If Next.js cache or dependencies get into a bad state:

```bash
docker compose down
docker volume rm dxassist_frontend_node_modules dxassist_frontend_next
docker compose up --build
```

## Machine-Wide Docker Cleanup

Rarely needed:

```bash
docker system prune -a --volumes
```

This removes stopped containers, unused images, unused volumes, and unused networks across the whole machine.
