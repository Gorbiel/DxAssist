# Contribution Guidelines

This document describes the development workflow, repository conventions, and collaboration rules used within the project.

---

# Branch Strategy

The repository uses two main long-lived branches:

| Branch       | Purpose | Merge Strategy |
|--------------|---------|----------------|
| `production` | Stable branch used for production-ready code and Continuous Deployment | Squash |
| `master`     | Main development branch used for integrating ongoing work | Squash/Rebase |

All new development branches should be created from `master`.

The `production` branch should only receive changes through Pull Requests from `dev` after the current development state is considered stable.

---

# Development Workflow

1. Create or select an existing GitHub Issue.
2. Assign yourself to the issue.
3. Create a branch from the issue using GitHub.
4. Make sure the branch is based on `master`.
5. Implement the required changes.
6. Open a Pull Request into `master`.
7. Request review from another team member.
8. Merge into `master` after review and successful validation.
9. Merge `master` into `production` only for stable releases or deployment-ready milestones.

Direct commits to `production` and `master` are prohibited.

---

# Branch Naming Convention

Branches should generally be created from GitHub Issues. GitHub may automatically generate branch names based on the issue title.

If a branch is created manually, it should follow a readable format:

```text
<type>/<issue-number>-<short-description>
```

Examples:

```text
feature/12-diagnostic-request-endpoint
fix/18-scheduler-timeout
infra/24-k3s-ingress
docs/31-km2-report
ml/35-blood-module-training
```

All manually created branches should be based on `master`.

## Recommended Branch Types

| Type | Description |
|------|-------------|
| `feature` | New functionality |
| `fix` | Bug fixes |
| `refactor` | Code restructuring without feature changes |
| `infra` | Infrastructure and deployment |
| `ml` | Machine learning modules and training |
| `docs` | Documentation |
| `integration` | Integration between components |

---

# Commit Naming Convention

Commits should use descriptive prefixes:

```text
Feature: add diagnostic request endpoint
Fix: handle scheduler timeout errors
Refactor: simplify backend service structure
Docs: update architecture diagram
Infra: add postgres persistent volume
ML: train initial blood screening model
Integration: connect scheduler with ML module API
Test: add backend authentication tests
```

## Recommended Commit Prefixes

| Prefix | Description |
|--------|-------------|
| `Feature:` | New functionality |
| `Fix:` | Bug fix |
| `Refactor:` | Refactoring |
| `Docs:` | Documentation |
| `Infra:` | Infrastructure/configuration |
| `ML:` | Machine learning related changes |
| `Integration:` | Component integration |
| `Test:` | Tests |

---

# Pull Requests

Each Pull Request should:

- reference related issues,
- clearly describe implemented changes,
- include testing instructions if applicable,
- update documentation when necessary,
- avoid unrelated changes in a single PR.

Large changes should be split into smaller reviewable Pull Requests whenever possible.

---

# Project Structure

The repository is organized into multiple logical areas:

```text
/frontend        Frontend application
/backend         Backend API and business logic
/infra           Infrastructure, Kubernetes manifests, GitOps
/ml-modules      Diagnostic ML modules
/docs            Documentation and milestone reports
```

Additional directories may be added as the project evolves.

---

# Infrastructure and Deployment

Infrastructure changes should be treated carefully.

When modifying deployment-related configuration:

- document important changes,
- avoid committing secrets or credentials,
- verify manifests before deployment,
- keep infrastructure configuration reproducible.

---

# Machine Learning Modules

ML modules should:

- expose a documented interface,
- follow the module integration specification,
- document required input/output formats,
- provide basic evaluation metrics,
- remain independent from other modules whenever possible.

---

# Documentation

Architecture changes, API modifications, and module integration changes should be reflected in documentation.

Diagrams and examples should be updated when no longer accurate.

---

# General Guidelines

- Prefer readable and maintainable code over unnecessary complexity.
- Keep commits focused and logically separated.
- Avoid committing temporary/debug code.
- Discuss major architectural decisions with the team before implementation.
- Follow existing conventions used within the repository.
