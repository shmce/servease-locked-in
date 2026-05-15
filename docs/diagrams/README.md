# ServEase Diagrams

This directory contains the standard capstone/thesis diagram package for ServEase.
The editable sources are Mermaid files in `source/`. Generated exports are stored in
`exports/svg/` and `exports/png/`.

## Diagram Index

| # | Diagram | Purpose |
| ---: | --- | --- |
| 1 | System Context | Shows ServEase, its users, and external systems. |
| 2 | Use Case | Summarizes customer, provider, admin, and support use cases. |
| 3 | Component | Shows the mobile app, API Gateway, backend services, and Supabase ownership. |
| 4 | Deployment | Shows runtime nodes, service ports, and Supabase dependencies. |
| 5 | Entity Relationship | Shows the major persisted entities by service-owned schema. |
| 6 | Data Flow Level 0 | Shows high-level data movement between actors, processes, and stores. |
| 7 | Booking State Machine | Shows valid booking lifecycle transitions. |
| 8 | Customer Booking Activity | Shows the customer booking workflow. |
| 9 | Provider Job Activity | Shows the provider workflow for accepting and completing jobs. |
| 10 | Login and Profile Sequence | Shows authentication and profile loading through the gateway. |
| 11 | Catalog Browse Sequence | Shows category, service, provider, and review browsing. |
| 12 | Booking Creation Sequence | Shows booking request creation and availability validation. |
| 13 | Provider Status Update Sequence | Shows provider booking status transitions. |
| 14 | Messaging Sequence | Shows conversation creation and message sending. |
| 15 | Payment Reservation Sequence | Shows payment reservation through the payment service. |
| 16 | Review Submission Sequence | Shows completed-booking review submission. |
| 17 | Support Ticket Sequence | Shows support ticket creation and admin handling. |
| 18 | Domain Model | Shows the main domain classes and relationships. |

## Regenerating Exports

Install or run Mermaid CLI with `npx`:

```bash
npx @mermaid-js/mermaid-cli -i docs/diagrams/source/01-system-context.mmd -o docs/diagrams/exports/svg/01-system-context.svg
npx @mermaid-js/mermaid-cli -i docs/diagrams/source/01-system-context.mmd -o docs/diagrams/exports/png/01-system-context.png
```

To regenerate every diagram:

```bash
for file in docs/diagrams/source/*.mmd; do
  name="$(basename "$file" .mmd)"
  npx @mermaid-js/mermaid-cli -i "$file" -o "docs/diagrams/exports/svg/$name.svg"
  npx @mermaid-js/mermaid-cli -i "$file" -o "docs/diagrams/exports/png/$name.png"
done
```

## Architecture Notes

- Public clients call only the API Gateway.
- The API Gateway routes requests to backend services over HTTP.
- Backend services own their data and access only their service-owned Supabase schemas.
- Cross-service references are opaque IDs, not cross-schema database constraints.
- The design intentionally excludes Kafka, RabbitMQ, event buses, and cross-service database access.
