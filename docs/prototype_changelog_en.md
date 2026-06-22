# DxAssist - Prototype Changelog

Document status: June 22, 2026.

## Purpose Of The Current Prototype

The current DxAssist prototype demonstrates the full flow from user login, through selecting a diagnostic module and submitting data, to receiving an example analysis result.

The main goal of this version is to confirm that the parts of the system can work together:

- the user interface lets a doctor start an analysis,
- the backend accepts the request and restricts access to logged-in users,
- the scheduler forwards data to the appropriate modules,
- diagnostic modules return results,
- the result is shown back to the user in a readable form.

This is still a technical prototype. It is not a finished medical product and is not intended for use with real patient data.

## What Has Been Done

### 1. Runnable Local System

A local set of services has been prepared and can be started with Docker Compose. In the current configuration, it includes:

- the frontend application for the user,
- the backend API,
- the PostgreSQL database,
- the scheduler, which coordinates analyses,
- an example angiography module,
- an example blood-test module.

This makes it possible to run the whole prototype as a group of cooperating containers and verify the data flow between them.

### 2. Login And Access Control

A basic user login mechanism has been added. A user can:

- log in with an email address and password,
- access protected screens after logging in,
- have their session refreshed automatically,
- log out of the system,
- retrieve and update basic profile information.

There is no public registration flow in the prototype. User accounts are created administratively, in line with the assumption that the system is used in a controlled environment, such as a medical facility.

### 3. Basic User Management

The backend includes an administrative user management mechanism. An administrator can create, view, edit, and delete accounts.

At this stage, this is a basic administrative mechanism. There is no extended role model yet, no approval workflow, no change history, and no detailed permissions for different staff groups.

### 4. Diagnostic Screen For The User

The frontend includes a screen where a logged-in user can:

- view available diagnostic modules,
- select the type of analysis,
- add input files,
- start the analysis,
- view the result as a report.

Files are currently converted in the browser into a text representation and passed on to the backend. The backend does not store those files on disk.

### 5. List Of Available Analyses

The backend currently returns three diagnostic options:

- `dxassist-angiography` - angiography image analysis,
- `dxassist-screening` - blood-test data analysis,
- `dxassist-heartdisease` - combined analysis using angiography and blood-test data.

The list is currently hardcoded in the backend. It is not yet loaded from a central module registry.

### 6. Backend To Scheduler Connection

The most important prototype change is the working connection between the backend and the scheduler.

From the user's perspective, the flow is simple: the user starts an analysis and waits for the result. In the background, the backend sends the request to the scheduler, the scheduler contacts the appropriate diagnostic module, and the result returns through the same path to the user interface.

The backend also handles error situations, such as no connection to the scheduler, request timeout, or an invalid response.

### 7. Single Analysis Support

For a single module, the scheduler forwards data to one model and returns its response.

The current version includes two example single modules:

- angiography,
- blood-test screening.

These are demonstration modules. They return fixed example results and do not perform real medical analysis.

### 8. Combined Analysis Support

A prototype of combined heart-disease analysis has been added. This scenario uses more than one diagnostic module.

The current flow works as follows:

1. The scheduler starts the first module, which is angiography.
2. After receiving the result, it asks the backend for data for the next module.
3. The backend provides blood-test data if it was already supplied by the frontend.
4. The scheduler starts the second module.
5. The scheduler combines the results using configured weights.
6. The backend returns the final result to the frontend.

In the current configuration, the combined analysis uses these weights:

- angiography: 40%,
- blood-test screening: 60%.

The result-combining logic is currently simplified. The scheduler looks for the same numeric fields in module responses and calculates a weighted average from them. This is enough to demonstrate the concept, but it is not the target clinical algorithm.

### 9. Example Diagnostic Modules

The repository contains two simple demonstration modules:

- the angiography module returns an example probability of coronary disease,
- the blood-test module returns an example probability and example elevated-marker information.

These modules are used to demonstrate communication between services. They do not analyze real images or real test results.

### 10. Result Report

The frontend can show the analysis result as a report:

- main numeric result,
- risk bars for numeric parameters,
- partial-result details for combined analysis,
- information about module weights,
- a message reminding the user that the result requires clinical verification.

The report is demonstrational. There is no complete, medically approved reporting format yet.

### 11. Basic Integration Documentation

Documentation has been added describing:

- the backend's role in the prototype,
- how the backend communicates with the frontend,
- how the backend communicates with the scheduler,
- the scheduler communication protocol,
- local startup with Docker Compose,
- known limitations of the prototype version.

## Current Prototype Capabilities

At this stage, the prototype can demonstrate:

- user login,
- protection of screens that require login,
- fetching the list of available analyses,
- submitting data for analysis,
- running a single analysis,
- running a combined analysis with two modules,
- passing module results to the scheduler,
- combining results through the scheduler,
- returning the result to the backend,
- showing the report in the frontend application,
- handling some typical communication errors.

The prototype therefore demonstrates the intended DxAssist concept: one system can act as an intermediary between the user and multiple specialized diagnostic modules.

## Key Limitations

### 1. No Real Medical Models

The current diagnostic modules are placeholders. They return fixed example values regardless of the submitted data.

This means the results shown in the application have no medical value and must not be interpreted as patient analysis.

### 2. No Analysis Storage

The backend currently does not store:

- submitted data,
- analysis history,
- analysis results,
- reports,
- information about the request flow.

After the request is completed, the result is returned to the user, but it is not saved as case history.

### 3. No Medical Audit Trail

There is no audit log yet showing:

- who started an analysis,
- when it was started,
- which modules were used,
- which module version returned the result,
- who viewed the result,
- whether the result was accepted or rejected.

This kind of audit trail will be required before real use in a medical environment.

### 4. No Target Module Management Yet

The module list is currently static. The system does not yet have a panel or registry where an administrator can:

- add new modules,
- disable modules,
- check their status,
- view model versions,
- manage weights or rules.

### 5. Simplified Scheduler

The scheduler works as a technical coordinator, but its logic is still very simple.

In particular, it does not yet:

- dynamically select the best modules for a given case,
- assess the quality of input data,
- understand the full clinical context,
- handle advanced module-failure scenarios,
- use anything beyond simplified combining of shared numeric values.

The current version confirms that module orchestration is possible, but it is not the target decision-making mechanism.

### 6. No Advanced Data Validation

The system performs basic checks on whether the request has the right structure, but it does not yet validate the medical correctness of the data.

There is no validation yet for:

- image quality,
- medical file formats,
- completeness of test results,
- laboratory units,
- reference ranges,
- consistency of data with a specific clinical scenario.

### 7. No Full File-Attachment Handling

The frontend can accept a file and pass it on, but the backend does not yet include the target file-upload system.

At the moment, there is no:

- file storage,
- file scanning,
- file type and size control,
- retention policy,
- encrypted attachment storage.

### 8. Analyses Are Synchronous

The user waits for the result within one request. There is no job queue, background processing, or progress tracking yet.

For real models that may take longer to run, the system will need asynchronous jobs, statuses, and completion notifications.

### 9. Limited Permission Model

The system distinguishes between a logged-in user and an administrator, but it does not yet have a full clinical role model.

There are no separate permissions yet for roles such as attending physician, consultant, technical administrator, auditor, or module maintainer.

### 10. Not Production Ready

The prototype is not ready for production deployment. It is still missing, among other things:

- full monitoring,
- alerts,
- backups and recovery procedures,
- strict resource limits,
- certified security for medical data,
- encryption and data-retention policies,
- load testing,
- a model approval process,
- operational documentation for a medical facility.

## Known Inconsistencies And Notes

Some of the main project documentation still describes the scheduler and modules as planned elements. The current prototype branch already includes a working scheduler and two demonstration diagnostic modules, so the code is newer than some of the general project documentation in this area.

Example results in the integration documentation are illustrative. In the current code, the values returned by the demonstration modules are fixed and may differ from older textual examples.

## Client Summary

The current prototype shows that the DxAssist architecture can work as a system that sits between a doctor and multiple diagnostic modules. Login, analysis selection, data submission, scheduler-based module communication, and result presentation are all working.

The main value of this version is confirming the full flow from the user to the modules and back. The main limitation is that the medical layer is still demonstrational: the modules are placeholders, result-combining logic is simplified, and the system does not store history or provide the audit trail required for a real clinical environment.

The next stage should focus on replacing the demonstration modules with real modules, adding persistent analysis history, audit logging, a module registry, model versioning, and secure handling of medical data.
