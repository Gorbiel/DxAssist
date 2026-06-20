# Modular AI-Assisted Diagnostic Platform

Modular medical diagnostic support platform based on machine learning and microservice architecture.

## Overview

This project focuses on the development of an extensible diagnostic platform capable of integrating multiple specialized machine learning modules within a single system.

The platform is designed for deployment in local medical infrastructure and aims to support healthcare professionals by providing diagnostic suggestions based on medical data analysis.

The system follows a modular architecture inspired by the *Mixture of Experts* approach, where independent diagnostic modules analyze specific types of medical data.

---

## Main Features

- Modular microservice-based architecture
- Support for multiple diagnostic modules
- Extensible module integration system
- On-premise deployment support
- ML-powered diagnostic assistance
- GitOps and container orchestration workflow
- Separation of frontend, backend, infrastructure, and ML services

---

## Planned Reference Modules

- Blood screening and urinalysis analysis
- Coronary angiogram analysis

---

## Repository Structure

```text
/dxassist-frontend  Frontend application
/dxassist-backend   Backend API and business logic
/k8s                Infrastructure and deployment configuration
/ml-modules         Machine learning diagnostic modules
/docs               Project documentation
```

---

## Development Workflow

The project uses:

- GitHub Projects for task management
- GitHub Issues and Pull Requests
- Git-based development workflow
- CI/CD automation
- GitOps-based infrastructure management

See `CONTRIBUTING.md` for development conventions and repository workflow. Docker Compose commands are documented in `docs/compose.md`.

---

## Disclaimer

This project is intended as a diagnostic support system only and does not replace qualified medical professionals.
