# Feature Spec: <Feature Name>

## Status

- Owner:
- Created:
- Implementation status: proposed

## Problem

Describe the user or system problem this feature solves.

## Goals

- 

## Non-Goals

- 

## Users And Roles

- Customer:
- Provider:
- Admin:
- System:

## User Experience

Describe the expected screens, states, and actions. Reference `DESIGN.md` for component and interaction rules.

Required states:

- Loading:
- Empty:
- Success:
- Validation error:
- Network error:
- Permission error:

## Architecture

- Owning service:
- Gateway responsibility:
- Mobile responsibility:
- External dependencies:

## Data Ownership

- Owning schema:
- Tables:
- External service references:
- Migration required:

## API Contracts

### Public Gateway Route

- Method:
- Path:
- Auth:
- Idempotency:

#### Request

```json
{}
```

#### Response

```json
{
  "data": {}
}
```

#### Errors

- 

### Internal Service Route

- Method:
- Path:
- Caller:

## Business Rules

- 

## Security And Authorization

- 

## Observability

- Logs:
- Metrics:
- Audit events:

## Testing Plan

- Unit tests:
- Contract tests:
- Workflow tests:
- Mobile tests:
- Supabase checks:

## Acceptance Criteria

- 

## Verification Commands

```sh
# Backend

# Mobile

# Supabase
```

## Open Questions

- 
