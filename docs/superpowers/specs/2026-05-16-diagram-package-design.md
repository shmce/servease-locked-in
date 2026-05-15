# ServEase Capstone Diagram Package Design

## Purpose

Create a standard capstone/thesis diagram package for ServEase that is suitable for academic documentation, defense materials, and developer handoff. The package must include editable source diagrams and generated image exports.

## Audience

The primary audience is a school thesis or capstone evaluator. The diagrams should explain the system clearly without requiring the reader to inspect source code.

## Source Context

The diagrams will align with the existing repository documentation and implementation:

- `mobile/` is an Expo React Native app for customer and provider workflows.
- `backend/` is a NestJS monorepo with an API Gateway and independent HTTP services.
- The API Gateway runs on port `5001` and is the only public backend entry point.
- Backend services run on ports `8501` through `8511`.
- Services communicate through HTTP only.
- Services own their data schemas and do not access other services' database objects directly.
- Supabase provides persistence, auth integration where applicable, and storage.

## Diagram Set

The package will include these diagrams:

1. System Context Diagram
2. Use Case Diagram
3. Component Diagram
4. Deployment Diagram
5. Entity Relationship Diagram
6. Level 0 Data Flow Diagram
7. Booking State Machine
8. Activity Diagram: Customer Booking Flow
9. Activity Diagram: Provider Job Flow
10. Sequence Diagram: Login and Profile Load
11. Sequence Diagram: Catalog Browse
12. Sequence Diagram: Booking Creation
13. Sequence Diagram: Provider Booking Status Update
14. Sequence Diagram: Messaging
15. Sequence Diagram: Payment Reservation
16. Sequence Diagram: Review Submission
17. Sequence Diagram: Support Ticket Flow
18. Domain/Class Model Diagram

## File Organization

The implementation will create this structure:

```text
docs/diagrams/
  README.md
  source/
    01-system-context.mmd
    02-use-case.mmd
    03-component.mmd
    04-deployment.mmd
    05-entity-relationship.mmd
    06-data-flow-level-0.mmd
    07-booking-state-machine.mmd
    08-customer-booking-activity.mmd
    09-provider-job-activity.mmd
    10-login-profile-sequence.mmd
    11-catalog-browse-sequence.mmd
    12-booking-creation-sequence.mmd
    13-provider-status-update-sequence.mmd
    14-messaging-sequence.mmd
    15-payment-reservation-sequence.mmd
    16-review-submission-sequence.mmd
    17-support-ticket-sequence.mmd
    18-domain-model.mmd
  exports/
    svg/
    png/
```

## Diagram Content Rules

- Diagrams must reflect ServEase's actual architecture: mobile app to gateway, gateway to services, services to owned Supabase schemas.
- Diagrams must not introduce Kafka, RabbitMQ, event buses, or cross-service database access.
- Public flows must show the mobile app calling only the API Gateway.
- Internal service flows must use HTTP calls and environment-configured service URLs.
- Data diagrams must show service-owned schemas and opaque cross-service IDs instead of cross-schema foreign keys.
- Sequence diagrams should focus on major user workflows rather than every route.
- Labels should be presentation-friendly and concise enough for paper insertion.

## Export Workflow

Mermaid will be the source format. Export generation will use Mermaid CLI when available:

```bash
npx @mermaid-js/mermaid-cli -i docs/diagrams/source/<name>.mmd -o docs/diagrams/exports/svg/<name>.svg
npx @mermaid-js/mermaid-cli -i docs/diagrams/source/<name>.mmd -o docs/diagrams/exports/png/<name>.png
```

If Mermaid CLI cannot produce PNGs in the local environment, SVG exports are still required and the README will document the PNG limitation.

## Acceptance Criteria

- Each listed diagram exists as an editable `.mmd` source file.
- SVG exports exist for all diagram sources.
- PNG exports exist when the local Mermaid CLI environment supports raster export.
- `docs/diagrams/README.md` explains the purpose of each diagram and the regeneration commands.
- The diagram set is consistent with `docs/architecture.md`, `docs/data-ownership.md`, `docs/api-contracts.md`, and the current backend/mobile code.
- A verification step confirms that Mermaid can parse and export the diagrams, or records the exact export limitation.

## Out of Scope

- Changing application source code.
- Changing database migrations.
- Adding new backend services or mobile features.
- Creating school-specific diagrams that are not part of the standard capstone set unless requested later.
