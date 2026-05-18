# Admin Roles & Permissions

## Behavior

- Admin users are normal `identity_and_user.users` records with `role = 'admin'`.
- Admin portal access roles are stored separately in `admin.admin_user_access`.
- Admin portal access role IDs are a typed contract:
  - `super-admin`
  - `finance-manager`
  - `operations-manager`
  - `customer-support`
  - `content-moderator`
- The admin website lists only admin users on the Admin Roles & Permissions page.
- Creating an admin user stores the selected access role, delivered invitation state, and two-factor requirement.
- When invitation delivery is requested, admin-service sends the invite through APICenter email and records `invitationSent = true` only after APICenter accepts the message.
- Editing an admin role updates the persisted access role and returns the recalculated permission list.
- Activating or deactivating an admin updates the underlying user status through the user-service.
- Deleting an admin removes the auth/internal user through auth-service and clears admin access metadata.

## API Contract

- `GET /v1/admin/users?role=admin` returns admin users enriched with:
  - `accessRole`
  - `accessRoleLabel`
  - `permissions`
  - `requireTwoFactor`
  - `invitationSent`
- `POST /v1/admin/users` creates the auth/user record through auth-service, optionally sends an APICenter admin invitation email, and persists admin access metadata through admin-service.
- `PATCH /v1/admin/users/:userId/access` updates the admin access role.
- `PATCH /v1/admin/users/:userId/status` activates, suspends, or deactivates the admin user.
- `DELETE /v1/admin/users/:userId` deletes an admin user.

## Failure Handling

- Authentication and admin authorization failures remain gateway-owned.
- User creation validation and conflict responses from downstream services are preserved instead of being converted into generic `Admin service is unavailable` responses.
- Unknown admin access role IDs are rejected at the API gateway instead of silently falling back to `super-admin`.
- APICenter invitation failures do not roll back account creation; the created admin is returned with `invitationSent = false`.
- The gateway rejects deleting the currently signed-in admin.
- Admin-service rejects deleting the last active Super Admin.
- True admin-service or downstream 5xx/unreachable failures still return dependency-unavailable errors.
