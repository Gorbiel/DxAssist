# DxAssist

DxAssist is an on-premise clinical decision-support platform for integrating specialized AI diagnostic modules into one system. It is designed for hospital infrastructure and for use by doctors and authorized medical staff.

The system is intended to support, not replace, clinical judgment. It analyzes submitted diagnostic data through registered machine-learning modules and presents structured diagnostic suggestions, confidence information, and supporting details to the doctor.

## Project Goals

- Provide a modular medical diagnostic support platform.
- Support many independent diagnostic modules through a shared integration contract.
- Route analysis requests to suitable modules using a scheduler/orchestrator.
- Allow hospitals to deploy the system locally, including isolated or restricted-network environments.
- Keep user and module management under administrator control.
- Provide reference ML modules for selected diagnostic areas.

The first planned reference domain is atherosclerosis support, including blood screening, urinalysis, and coronary angiogram analysis.

## Architecture

DxAssist is planned as a multi-service system:

- **Frontend**: doctor-facing and administrator-facing web interface built with Next.js.
- **Backend**: Django API for authentication, authorization, user management, analysis request handling, and result presentation.
- **Scheduler**: orchestration service that decides which diagnostic modules should process each request, coordinates module execution, aggregates outputs, and returns results to the backend.
- **Diagnostic modules**: independently deployable ML services exposing a common API and manifest format.
- **PostgreSQL**: primary database for application state.
- **Infrastructure**: containerized local development via Docker Compose, with planned Kubernetes/K3s deployment for on-premise environments.

The scheduler and module architecture is inspired by Mixture-of-Experts systems: each module specializes in a particular diagnostic area or input type, while the scheduler routes data to compatible modules and combines their results.

## Users

- **Doctor**: logs in, selects an analysis area, uploads anonymized diagnostic data, starts analysis, and reviews results.
- **Administrator**: creates user accounts, manages doctors, and registers or monitors diagnostic modules.
- **Module developer**: builds diagnostic modules compatible with the DxAssist integration contract.

There is no public registration flow. User accounts are created by administrators.

## Current Repository Structure

```text
.
├── dxassist-backend/      Django backend API
├── dxassist-frontend/     Next.js frontend
├── docs/                  Project documentation
├── compose.yaml           Development Compose stack
├── compose.prod.yaml      Production-like local Compose override
├── .env.example           Environment variable template
└── README.md
```

Additional planned areas include scheduler services, diagnostic modules, and Kubernetes/GitOps manifests.

## Documentation

- [Compose commands](docs/compose.md)
- [Thesis/project documentation](docs/thesis-documentation.pdf)

## Local Development

Create a local environment file:

```bash
cp .env.example .env
```

Start the development stack:

```bash
docker compose up --build
```

Default local endpoints:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`
- Django admin: `http://localhost:8000/admin/`
- PostgreSQL: `localhost:5432`

Run the production-like local stack:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up --build
```

Stop the stack:

```bash
docker compose down
```

See [docs/compose.md](docs/compose.md) for cleanup and reset commands.

## Backend Development

From `dxassist-backend/`:

```bash
make check-lint
make test
```

Useful commands:

```bash
.venv/bin/python manage.py check
.venv/bin/python manage.py makemigrations
.venv/bin/python manage.py migrate
.venv/bin/python manage.py createadmin --email admin@example.local --name Admin --password change-me
```

## Frontend Development

From `dxassist-frontend/`:

```bash
npm ci
npm run dev
npm run lint
npm run build
```

## Diagnostic Module Integration

Each diagnostic module is expected to expose a minimal API:

```text
GET  /health
GET  /metadata
POST /analyze
```

Modules should provide metadata describing:

- module identifier and human-readable name,
- supported diagnostic area,
- supported input data types and formats,
- API endpoint paths,
- output schema,
- optional resource requirements.

Example diagnostic outputs may include a risk score, confidence value, recommendation text, and supporting factors. Exact contracts are still being refined.

## Data And Safety Assumptions

DxAssist is designed around medical data and hospital deployment constraints. Future implementation should prioritize:

- anonymized or minimized patient data,
- role-based access control,
- audit logs for uploads, analysis requests, module routing, and result access,
- encryption in transit and at rest,
- model versioning and traceability,
- clear uncertainty and confidence reporting,
- graceful handling of unavailable diagnostic modules,
- local deployment without dependency on public cloud services.

## Current Status

This repository currently contains the initial backend and frontend scaffolding, Compose setup, documentation, and CI configuration. The scheduler, diagnostic module registry, analysis workflow, and reference ML modules are planned but not yet complete.

## Disclaimer

DxAssist is a student engineering/research project and a diagnostic support concept. It is not a certified medical device, does not provide autonomous diagnosis, and must not be used as a replacement for qualified medical professionals.
