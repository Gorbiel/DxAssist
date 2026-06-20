# DxAssist

DxAssist is a planned on-premise clinical decision-support system for hospitals. It is intended for doctors only. Administrators create doctor accounts; there is no public self-registration flow.

The product goal is to help a doctor evaluate how probable a selected illness is for a patient based on uploaded test results and structured clinical inputs. DxAssist should support the clinician's diagnostic workflow; it must not be treated as an autonomous diagnosis engine or a replacement for medical judgment.

## Planned Architecture

DxAssist is planned as a multi-service system:

- Frontend: doctor-facing interface for selecting an illness, uploading patient test results, reviewing model output, and managing clinical workflow.
- Backend: Django API responsible for authentication, authorization, doctor/admin account management, request lifecycle tracking, and final response construction.
- Scheduler: orchestration service that receives diagnostic analysis requests from the backend, decides which model nodes should process which data, coordinates cross-node data sharing when needed, aggregates node outputs, and returns structured results to the backend.
- Model nodes: isolated services hosting ML models or expert modules. Each node receives only the data assigned by the scheduler and returns structured findings, scores, uncertainty, and supporting signals.

The intended model orchestration resembles a Mixture-of-Experts architecture. The scheduler acts as the routing and aggregation layer: it selects expert nodes, controls data flow, collects model responses, and provides the backend with enough structured evidence to build a doctor-readable answer.

## Deployment Model

DxAssist is designed for hospital on-premise deployment. The system should assume:

- Restricted internal network access.
- PostgreSQL as the primary database.
- Explicit admin-created user accounts.
- No public registration.
- Strong auditability around access, uploaded patient data, model routing, and generated outputs.
- Clear separation between application services and ML model nodes.

## Current Backend Scope

The current backend scaffold contains:

- Django configuration split by environment.
- PostgreSQL-oriented settings.
- JWT authentication.
- Admin-created custom user accounts for doctors and administrators.
- A service-style apps layout under `dxassist-backend/apps`.
- Docker, Docker Compose, and entrypoint scaffolding for containerized deployment.

## Safety And Governance Notes

Because DxAssist handles medical and patient-related data, future implementation should prioritize:

- Role-based access control for doctors and admins.
- Audit logs for login, upload, analysis request, scheduler routing, model output, and final answer access.
- Explicit patient data retention and deletion policies.
- Encryption in transit and at rest.
- Model versioning and traceability.
- Confidence/probability calibration and uncertainty reporting.
- Human-readable explanations of what evidence influenced the result.
- Clear UI language that the output is decision support for doctors, not a definitive diagnosis.

## Open Design Questions

- What patient identifiers, if any, should the backend store?
- Which test result formats should be accepted first?
- Should uploads be normalized in the backend or by scheduler-side preprocessing nodes?
- What minimum evidence should the final answer show to doctors?
- How should model-node failures be represented in final results?
- What audit-log format will satisfy hospital governance requirements?
- How will model versions be deployed, approved, and rolled back?
