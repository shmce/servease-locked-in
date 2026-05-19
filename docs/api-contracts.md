# ServEase API Contracts

Last verified from code: 2026-05-19.

This document describes the HTTP contracts currently exposed by ServEase. It is
based on the NestJS gateway controllers, internal service controllers, and the
published TypeScript SDK contract types.

## Contract Boundaries

- Public clients call the API Gateway on port `5001`.
- Public HTTP routes are versioned under `/v1`.
- Health routes are unversioned: `/health/live` and `/health/ready`.
- Internal service-to-service routes use `/internal/...` and must not be called
  by mobile, browser, SDK, or admin frontend code directly.
- Services communicate through HTTP only, using environment-defined service
  URLs. Do not add event buses, shared DTO packages between services, or
  cross-service database access.
- The gateway may access Supabase Storage for upload workflows. It must not
  access service-owned databases.

## Envelope, Auth, and Headers

Successful JSON responses use:

```json
{
  "data": {}
}
```

Paginated list responses should use:

```json
{
  "data": [],
  "page": {
    "cursor": "next_cursor",
    "hasMore": true
  }
}
```

Errors use the gateway envelope:

```json
{
  "error": {
    "code": "booking_unavailable",
    "message": "This provider is not available at the selected time.",
    "details": {}
  }
}
```

Authentication:

- `Authorization: Bearer <accessToken>` is required wherever the route table says
  `Bearer`.
- Public catalog, public reviews list, public provider availability lookup, and
  registration/auth helper routes do not require a bearer token.
- Admin routes under `/v1/admin/...` require an authenticated admin user.
- Provider routes under `/v1/provider/...` require provider ownership unless the
  route is explicitly public.

Idempotency:

- Side-effect routes that can duplicate money movement, booking changes, or
  external delivery should accept `Idempotency-Key`.
- The current gateway explicitly reads `idempotency-key` for
  `POST /v1/payments/checkout-sessions` and `POST /v1/payments/payouts`.
- The SDK can send `idempotency-key` on any request through
  `ServEaseRequestOptions.idempotencyKey`.

Status code conventions:

| Code | Use |
| ---: | --- |
| 200 | Successful read or synchronous update |
| 201 | Resource created |
| 202 | Accepted async operation |
| 204 | Successful deletion or empty action |
| 400 | Invalid request shape |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but not allowed |
| 404 | Resource not found or not visible |
| 409 | State or idempotency conflict |
| 422 | Business rule failure |
| 429 | Rate limit exceeded |
| 500 | Unexpected server failure |
| 503 | Downstream dependency unavailable |

## Published SDK Contract

The SDK in `packages/servease-sdk` is the typed public contract intended for
external consumers. It calls only `/v1/...` gateway routes and unwraps the
`{ data }` envelope before returning values.

Schema source:

- `packages/servease-sdk/src/client.ts`
- `packages/servease-sdk/src/types/*.ts`

| SDK method | HTTP contract | Auth | Request type | Response type |
| --- | --- | --- | --- | --- |
| `catalog.listCategories()` | `GET /v1/catalog/categories` | None | Query none | `CatalogCategory[]` |
| `catalog.listServices(params)` | `GET /v1/catalog/services` | None | `ListCatalogServicesParams` | `CatalogService[]` |
| `catalog.listProviders(params)` | `GET /v1/catalog/providers` | None | `ListCatalogProvidersParams` | `CatalogProvider[]` |
| `bookings.create(input)` | `POST /v1/bookings` | Bearer | `CreateBookingInput` | `CreateBookingResult` |
| `bookings.list(params)` | `GET /v1/bookings` | Bearer | `ListBookingsParams` | `BookingSummary[]` |
| `bookings.get(id)` | `GET /v1/bookings/:bookingId` | Bearer | Path `bookingId` | `BookingSummary` |
| `bookings.updateStatus(id, input)` | `PATCH /v1/bookings/:bookingId/status` | Bearer | `UpdateBookingStatusInput` | `BookingSummary` |
| `availability.getProviderAvailability(providerId?)` | `GET /v1/provider/availability` or `GET /v1/provider/availability/:providerId` | Mixed | Optional path `providerId` | `ProviderAvailabilitySchedule` |
| `availability.replaceWindows(input)` | `PUT /v1/provider/availability/windows` | Bearer | `ReplaceAvailabilityWindowsInput` | `ProviderAvailabilitySchedule` |
| `availability.addDayOff(input)` | `POST /v1/provider/availability/days-off` | Bearer | `AddProviderDayOffInput` | `ProviderAvailabilitySchedule` |
| `availability.removeDayOff(offDate)` | `DELETE /v1/provider/availability/days-off/:offDate` | Bearer | Path `offDate` | `ProviderAvailabilitySchedule` |
| `pricing.createQuote(input)` | `POST /v1/pricing/quotes` | Bearer | `CreatePricingQuoteRequest` | `PricingQuoteSummary` |
| `pricing.getProviderGuidance(input)` | `POST /v1/provider/pricing/guidance` | Bearer | `ProviderPricingGuidanceRequest` | `ProviderPricingGuidanceSummary` |
| `providerApplications.getMine()` | `GET /v1/auth/provider-application/me` | Bearer | None | `ProviderApplicationStatus` |
| `payments.list()` | `GET /v1/payments` | Bearer | None | `PaymentSummary[]` |
| `payments.create(input)` | `POST /v1/payments` | Bearer | `CreatePaymentRequest` | `PaymentSummary` |
| `payments.createCheckoutSession(input)` | `POST /v1/payments/checkout-sessions` | Bearer | `CreateCheckoutSessionRequest` | `PaymentCheckoutSessionSummary` |
| `payments.getCheckoutStatus(id)` | `GET /v1/payments/checkout-sessions/:checkoutId/status` | Bearer | Path `checkoutId` | `PaymentCheckoutSessionSummary` |
| `payments.validatePromotion(input)` | `POST /v1/payments/promotions/validate` | Bearer | `ValidatePromotionRequest` | `PromotionValidationSummary` |
| `payments.listCustomerMethods()` | `GET /v1/payments/methods` | Bearer | None | `CustomerPaymentMethodSummary[]` |
| `payments.upsertCustomerMethod(input)` | `PUT /v1/payments/methods` | Bearer | `UpsertCustomerPaymentMethodRequest` | `CustomerPaymentMethodSummary` |
| `payments.deleteCustomerMethod(id)` | `DELETE /v1/payments/methods/:methodId` | Bearer | Path `methodId` | `CustomerPaymentMethodSummary` |
| `payments.getPayoutAccount()` | `GET /v1/payments/payout-account` | Bearer | None | `PayoutAccountSummary` |
| `payments.listPayoutMethods()` | `GET /v1/payments/payout-methods` | Bearer | None | `PayoutMethodSummary[]` |
| `payments.upsertPayoutMethod(input)` | `PUT /v1/payments/payout-methods` | Bearer | `UpsertPayoutMethodRequest` | `PayoutMethodSummary` |
| `payments.listPayouts()` | `GET /v1/payments/payouts` | Bearer | None | `PayoutSummary[]` |
| `payments.requestPayout(input)` | `POST /v1/payments/payouts` | Bearer | `RequestPayoutInput` | `PayoutSummary` |
| `messaging.list()` | `GET /v1/conversations` | Bearer | None | `ConversationSummary[]` |
| `messaging.open(input)` | `POST /v1/conversations` | Bearer | `OpenConversationRequest` | `ConversationSummary` |
| `messaging.listMessages(id)` | `GET /v1/conversations/:conversationId/messages` | Bearer | Path `conversationId` | `ConversationMessage[]` |
| `messaging.sendMessage(id, input)` | `POST /v1/conversations/:conversationId/messages` | Bearer | `CreateConversationMessageRequest` | `ConversationMessage` |
| `reviews.listProviderReviews(providerId)` | `GET /v1/reviews?providerId=...` | None | Query `providerId` | `ReviewSummary[]` |
| `reviews.create(input)` | `POST /v1/reviews` | Bearer | `CreateReviewRequest` | `ReviewSummary` |
| `reviews.reply(id, input)` | `POST /v1/reviews/:reviewId/reply` | Bearer | `CreateReviewReplyRequest` | `ReviewResponseSummary` |
| `reviews.flag(id, input?)` | `POST /v1/reviews/:reviewId/flag` | Bearer | `FlagReviewRequest` | `ReviewSummary` |
| `support.listTickets()` | `GET /v1/support/tickets` | Bearer | None | `SupportTicketSummary[]` |
| `support.createTicket(input)` | `POST /v1/support/tickets` | Bearer | `CreateSupportTicketRequest` | `SupportTicketSummary` |
| `support.getTicket(id)` | `GET /v1/support/tickets/:ticketId` | Bearer | Path `ticketId` | `SupportTicketSummary` |
| `support.listReplies(id)` | `GET /v1/support/tickets/:ticketId/replies` | Bearer | Path `ticketId` | `SupportTicketReplySummary[]` |
| `support.reply(id, input)` | `POST /v1/support/tickets/:ticketId/replies` | Bearer | `CreateSupportTicketReplyRequest` | `SupportTicketReplySummary` |
| `notifications.list()` | `GET /v1/notifications` | Bearer | None | `NotificationSummary[]` |
| `notifications.markRead(id)` | `PATCH /v1/notifications/:notificationId/read` | Bearer | Path `notificationId` | `NotificationSummary` |
| `notifications.registerDevice(input)` | `POST /v1/notifications/devices` | Bearer | `RegisterPushDeviceRequest` | `PushDeviceSummary` |
| `notifications.unregisterDevice(token)` | `DELETE /v1/notifications/devices/:token` | Bearer | Path `token` | `{ ok: boolean }` |
| `profile.getCurrent()` | `GET /v1/me` | Bearer | None | `CurrentUserProfile` |
| `profile.update(input)` | `PATCH /v1/me` | Bearer | `UpdateCurrentUserProfileInput` | `CurrentUserProfile` |
| `profile.getPreferences()` | `GET /v1/me/preferences` | Bearer | None | `UserPreferenceSummary` |
| `profile.updatePreferences(input)` | `PUT /v1/me/preferences` | Bearer | `UpdateUserPreferencesRequest` | `UserPreferenceSummary` |
| `geo.geocode(input)` | `POST /v1/geo/geocode` | Bearer | `GeoGeocodeAddressRequest` | `GeoAddressResult` |
| `geo.reverseGeocode(input)` | `POST /v1/geo/reverse-geocode` | Bearer | `GeoReverseGeocodeRequest` | `GeoAddressResult` |
| `geo.directions(input)` | `POST /v1/geo/directions` | Bearer | `GeoDirectionsRequest` | `GeoDirectionsRoute` |
| `referrals.getSummary()` | `GET /v1/referrals` | Bearer | None | `ReferralSummary` |
| `uploads.create(input)` | `POST /v1/uploads` | Bearer | multipart `CreateUploadRequest` | `UploadSummary` |

## Public Gateway Route Inventory

The gateway exposes more routes than the SDK. The table below is the source of
truth for current gateway endpoints. `Body` values that say `inline body in
controller` are anonymous object shapes declared directly in the controller.

### `v1/auth`

Source: `backend/apps/api-gateway/src/features/registration/registration.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| POST | `/v1/auth/register` | None | - | `RegisterAccountRequest` | `RegisteredAccountResponse` |
| POST | `/v1/auth/password-reset` | None | - | `PasswordResetRequest` | `PasswordResetResponse` |
| POST | `/v1/auth/otp/generate` | None | - | `OtpGenerateRequest` | `OtpGenerateResponse` |
| POST | `/v1/auth/otp/verify` | None | - | `OtpVerifyRequest` | `OtpVerifyResponse` |
| GET | `/v1/auth/otp/:otpId/status` | None | - | - | `OtpStatusResponse` |
| POST | `/v1/auth/google/authorize` | None | - | `GoogleAuthorizationUrlRequest` | `GoogleAuthorizationUrlResponse` |
| POST | `/v1/auth/google/token` | None | - | `GoogleTokenExchangeRequest` | `GoogleOAuthTokenResponse` |
| POST | `/v1/auth/google/token/refresh` | None | - | `GoogleTokenRefreshRequest` | `GoogleOAuthTokenResponse` |
| POST | `/v1/auth/google/logout` | None | - | `GoogleLogoutRequest` | `GoogleLogoutResponse` |
| GET | `/v1/auth/provider-application/me` | Bearer | - | - | `ProviderApplicationStatusResponse` |

### `v1/me`

Source: `backend/apps/api-gateway/src/features/current-user/current-user.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| GET | `/v1/me` | Bearer | - | - | `CurrentUserProfile` |
| PATCH | `/v1/me` | Bearer | - | `UpdateCurrentUserProfileInput` | `CurrentUserProfile` |
| PATCH | `/v1/me/password` | Bearer | - | `UpdateCurrentUserPasswordInput` | `UpdateCurrentUserPasswordResponse` |
| DELETE | `/v1/me` | Bearer | - | - | `{ ok: true }` |
| GET | `/v1/me/sessions` | Bearer | - | - | `CurrentUserSessionSummary[]` |
| POST | `/v1/me/two-factor/enable` | Bearer | - | - | `TwoFactorProvisioningResponse` |
| POST | `/v1/me/two-factor/verify` | Bearer | - | `TwoFactorVerificationInput` | `TwoFactorStatusResponse` |
| POST | `/v1/me/two-factor/disable` | Bearer | - | `TwoFactorVerificationInput` | `TwoFactorStatusResponse` |

### `v1/me/preferences`

Source: `backend/apps/api-gateway/src/features/preferences/preference.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| GET | `/v1/me/preferences` | Bearer | - | - | `UserPreferenceSummary` |
| PUT | `/v1/me/preferences` | Bearer | - | `UpdateUserPreferencesRequest` | `UserPreferenceSummary` |

### `v1/catalog`

Source: `backend/apps/api-gateway/src/features/catalog/catalog.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| GET | `/v1/catalog/categories` | None | - | - | `CatalogCategory[]` |
| GET | `/v1/catalog/services` | None | `categoryId: string` | - | `CatalogServiceItem[]` |
| GET | `/v1/catalog/providers` | None | `serviceId: string`, `providerId: string` | - | `ProviderServiceListing[]` |
| GET | `/v1/catalog/providers/:providerId/portfolio` | None | - | - | `ProviderPortfolioMediaSummary[]` |
| POST | `/v1/catalog/provider/portfolio` | Bearer | - | `ProviderPortfolioMediaInput` | `ProviderPortfolioMediaSummary` |
| DELETE | `/v1/catalog/provider/portfolio/:mediaId` | Bearer | - | - | `void` |
| PUT | `/v1/catalog/provider/portfolio/order` | Bearer | - | Inline `{ items?: ProviderPortfolioOrderItem[] }` | `ProviderPortfolioMediaSummary[]` |
| PUT | `/v1/catalog/provider/portfolio/:mediaId` | Bearer | - | `ProviderPortfolioMediaReplacementInput` | `ProviderPortfolioMediaSummary` |

### `v1/bookings`

Source: `backend/apps/api-gateway/src/features/booking/booking.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| GET | `/v1/bookings` | Bearer | `scope: 'customer' \| 'provider'` | - | `BookingSummary[]` |
| POST | `/v1/bookings` | Bearer | - | `CreateBookingRequest` | `BookingSummary` |
| GET | `/v1/bookings/:bookingId` | Bearer | - | - | `BookingSummary` |
| PATCH | `/v1/bookings/:bookingId/status` | Bearer | - | Inline status transition body | `BookingSummary` |
| GET | `/v1/bookings/:bookingId/tracking` | Bearer | - | - | `BookingTrackingSnapshot` |
| GET | `/v1/bookings/:bookingId/tracking/stream` | Bearer | - | - | SSE `tracking` events with `BookingTrackingSnapshot` data |
| PATCH | `/v1/bookings/:bookingId/tracking/location` | Bearer | - | `UpdateBookingLiveLocationRequest` | `BookingTrackingLocation` |
| POST | `/v1/bookings/:bookingId/attachments` | Bearer | - | `AddBookingAttachmentRequest` | `BookingAttachmentSummary` |
| DELETE | `/v1/bookings/:bookingId/attachments/:attachmentId` | Bearer | - | - | `BookingAttachmentSummary` |
| POST | `/v1/bookings/:bookingId/disputes` | Bearer | - | `RaiseBookingDisputeRequest` | `BookingDisputeSummary` |
| GET | `/v1/bookings/:bookingId/service-updates` | Bearer | - | - | `BookingServiceUpdateSummary[]` |
| POST | `/v1/bookings/:bookingId/service-updates` | Bearer | - | `CreateBookingServiceUpdateRequest` | `BookingServiceUpdateSummary` |
| GET | `/v1/bookings/:bookingId/timeline` | Bearer | - | - | `BookingTimelineEventSummary[]` |

### Provider, Availability, and Pricing

Sources:

- `backend/apps/api-gateway/src/features/provider/provider.controller.ts`
- `backend/apps/api-gateway/src/features/availability/availability.controller.ts`
- `backend/apps/api-gateway/src/features/pricing/pricing.controller.ts`
- `backend/apps/api-gateway/src/features/pricing/provider-pricing.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| GET | `/v1/provider/profile` | Bearer | - | - | `ProviderProfileSnapshot` |
| GET | `/v1/provider/dashboard` | Bearer | - | - | `ProviderDashboardSummary` |
| GET | `/v1/provider/services` | Bearer | - | - | `ProviderOwnedServiceSummary[]` |
| PUT | `/v1/provider/services` | Bearer | - | Inline `{ services?: ProviderOwnedServiceInput[] }` | `ProviderOwnedServiceSummary[]` |
| GET | `/v1/provider/availability` | Bearer | - | - | `ProviderAvailabilitySchedule` |
| GET | `/v1/provider/availability/:providerId` | None | - | - | `ProviderAvailabilitySchedule` |
| PUT | `/v1/provider/availability/windows` | Bearer | - | Inline `{ windows: AvailabilityWindowInput[] }` | `ProviderAvailabilitySchedule` |
| POST | `/v1/provider/availability/days-off` | Bearer | - | Inline `{ offDate: string; reason?: string \| null }` | `ProviderAvailabilitySchedule` |
| DELETE | `/v1/provider/availability/days-off/:offDate` | Bearer | - | - | `ProviderAvailabilitySchedule` |
| POST | `/v1/pricing/quotes` | Bearer | - | `CreatePricingQuoteRequest` | `PricingQuoteSummary` |
| POST | `/v1/provider/pricing/guidance` | Bearer | - | Inline provider guidance body | `PricingQuoteSummary` |

### Payments

Source: `backend/apps/api-gateway/src/features/payments/payment.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| GET | `/v1/payments` | Bearer | - | - | `PaymentSummary[]` |
| POST | `/v1/payments` | Bearer | - | Inline payment creation body | `PaymentSummary` |
| POST | `/v1/payments/checkout-sessions` | Bearer + `idempotency-key` supported | - | `CreateCheckoutSessionRequest` | `PaymentCheckoutSessionSummary` |
| GET | `/v1/payments/checkout-sessions/:checkoutId/status` | Bearer | - | - | `PaymentCheckoutSessionSummary` |
| POST | `/v1/payments/webhooks/apicenter` | `x-apicenter-webhook-secret` or `x-webhook-secret`, `x-apicenter-webhook-timestamp` | - | `ApicenterCheckoutWebhookRequest` | `PaymentCheckoutSessionSummary` |
| POST | `/v1/payments/promotions/validate` | Bearer | - | Inline `{ bookingId?: string; code?: string }` | `PromotionValidationSummary` |
| GET | `/v1/payments/payout-account` | Bearer | - | - | `PayoutAccountSummary` |
| GET | `/v1/payments/payout-methods` | Bearer | - | - | `PayoutMethodSummary[]` |
| PUT | `/v1/payments/payout-methods` | Bearer | - | `UpsertPayoutMethodRequest` | `PayoutMethodSummary` |
| GET | `/v1/payments/methods` | Bearer | - | - | `CustomerPaymentMethodSummary[]` |
| PUT | `/v1/payments/methods` | Bearer | - | `UpsertCustomerPaymentMethodRequest` | `CustomerPaymentMethodSummary` |
| DELETE | `/v1/payments/methods/:methodId` | Bearer | - | - | `CustomerPaymentMethodSummary` |
| GET | `/v1/payments/payouts` | Bearer | - | - | `PayoutSummary[]` |
| POST | `/v1/payments/payouts` | Bearer + `idempotency-key` supported | - | Inline `{ amount?: number; payoutMethodId?: string }` | `PayoutSummary` |

### Messaging, Reviews, Support, Notifications, Geo, Referrals, Uploads

Sources:

- `backend/apps/api-gateway/src/features/messaging/messaging.controller.ts`
- `backend/apps/api-gateway/src/features/reviews/review.controller.ts`
- `backend/apps/api-gateway/src/features/support/support.controller.ts`
- `backend/apps/api-gateway/src/features/notifications/notification.controller.ts`
- `backend/apps/api-gateway/src/features/geo/geo.controller.ts`
- `backend/apps/api-gateway/src/features/referrals/referral.controller.ts`
- `backend/apps/api-gateway/src/features/uploads/upload.controller.ts`

| Method | Path | Auth | Query | Body | Response data |
| --- | --- | --- | --- | --- | --- |
| GET | `/v1/conversations` | Bearer | - | - | `ConversationSummary[]` |
| POST | `/v1/conversations` | Bearer | - | Inline `{ bookingId?: string }` | `ConversationSummary` |
| GET | `/v1/conversations/:conversationId/messages` | Bearer | - | - | `ConversationMessage[]` |
| POST | `/v1/conversations/:conversationId/messages` | Bearer | - | Inline message body | `ConversationMessage` |
| GET | `/v1/reviews` | None | `providerId: string` | - | `ReviewSummary[]` |
| POST | `/v1/reviews` | Bearer | - | Inline review body | `ReviewSummary` |
| POST | `/v1/reviews/:reviewId/reply` | Bearer | - | Inline `{ responseText?: string }` | `ReviewResponseSummary` |
| POST | `/v1/reviews/:reviewId/flag` | Bearer | - | Inline `{ reason?: string }` | `ReviewSummary` |
| GET | `/v1/support/tickets` | Bearer | - | - | `SupportTicketSummary[]` |
| POST | `/v1/support/tickets` | Bearer | - | Inline support ticket body | `SupportTicketSummary` |
| GET | `/v1/support/tickets/:ticketId` | Bearer | - | - | `SupportTicketSummary` |
| GET | `/v1/support/tickets/:ticketId/replies` | Bearer | - | - | `SupportTicketReplySummary[]` |
| POST | `/v1/support/tickets/:ticketId/replies` | Bearer | - | Inline `{ message?: string }` | `SupportTicketReplySummary` |
| GET | `/v1/notifications` | Bearer | - | - | `NotificationSummary[]` |
| PATCH | `/v1/notifications/:notificationId/read` | Bearer | - | - | `NotificationSummary` |
| POST | `/v1/notifications/devices` | Bearer | - | `RegisterPushDeviceRequest` | `PushDeviceSummary` |
| DELETE | `/v1/notifications/devices/:token` | Bearer | - | - | `{ ok: boolean }` |
| POST | `/v1/geo/geocode` | Bearer | - | `GeoGeocodeAddressRequest` | `GeoAddressResult` |
| POST | `/v1/geo/reverse-geocode` | Bearer | - | `GeoReverseGeocodeRequest` | `GeoAddressResult` |
| POST | `/v1/geo/geofence/check` | Bearer | - | `GeoFenceCheckRequest` | `GeoFenceCheckResponse` |
| POST | `/v1/geo/directions` | Bearer | - | `GeoDirectionsRequest` | `GeoDirectionsRoute` |
| GET | `/v1/referrals` | Bearer | - | - | `ReferralSummary` |
| POST | `/v1/uploads` | Bearer | - | Multipart form: `kind`, `file`, optional `fileName`, `documentType` | `UploadSummary` |

### Admin Gateway Routes

All admin routes require `Authorization: Bearer <adminAccessToken>`.

| Area | Contracts |
| --- | --- |
| Audit logs | `GET /v1/admin/audit-logs`, `GET /v1/admin/audit-logs/export` |
| Bookings | `GET /v1/admin/bookings/operations/alerts`, `GET /v1/admin/bookings/summary`, `GET /v1/admin/bookings`, `GET /v1/admin/bookings/:bookingId`, `POST /v1/admin/bookings/:bookingId/cancel`, `POST /v1/admin/bookings/:bookingId/escalate`, `POST /v1/admin/bookings/:bookingId/provider-messages`, `GET /v1/admin/bookings/:bookingId/messages`, `POST /v1/admin/bookings/:bookingId/messages` |
| Broadcasts | `GET /v1/admin/broadcasts`, `POST /v1/admin/broadcasts` |
| Catalog | `GET /v1/admin/catalog/categories`, `POST /v1/admin/catalog/categories`, `PATCH /v1/admin/catalog/categories/:id`, `DELETE /v1/admin/catalog/categories/:id`, `GET /v1/admin/catalog/services`, `POST /v1/admin/catalog/services`, `PATCH /v1/admin/catalog/services/:id`, `DELETE /v1/admin/catalog/services/:id` |
| Commission rules | `GET /v1/admin/commission-rules`, `PATCH /v1/admin/commission-rules/:ruleId` |
| Disputes | `GET /v1/admin/disputes`, `GET /v1/admin/disputes/:disputeId`, `POST /v1/admin/disputes/:disputeId/resolve` |
| Integrations | `GET /v1/admin/integrations`, `PATCH /v1/admin/integrations/:provider/credentials`, `POST /v1/admin/integrations/:provider/test` |
| Payments | `GET /v1/admin/payments`, `GET /v1/admin/payments/payouts`, `GET /v1/admin/payments/failures`, `POST /v1/admin/payments/settlements/:settlementId/approve`, `PATCH /v1/admin/payments/payouts/:payoutId/status`, `GET /v1/admin/payments/:paymentId`, `PATCH /v1/admin/payments/:paymentId/status`, `POST /v1/admin/payments/:paymentId/failure`, `POST /v1/admin/payments/:paymentId/retry`, `POST /v1/admin/payments/:paymentId/apicenter-sync` |
| Pricing | `GET /v1/admin/pricing/rules`, `PUT /v1/admin/pricing/rules`, `GET /v1/admin/pricing/fuel-index`, `POST /v1/admin/pricing/fuel-index`, `GET /v1/admin/pricing/quote-audits` |
| Promotions | `GET /v1/admin/promotions`, `POST /v1/admin/promotions`, `PATCH /v1/admin/promotions/:promotionId`, `DELETE /v1/admin/promotions/:promotionId` |
| Provider applications | `GET /v1/admin/provider-applications`, `GET /v1/admin/provider-applications/:applicationId`, `GET /v1/admin/provider-applications/:applicationId/documents/:documentId`, `GET /v1/admin/provider-applications/:applicationId/documents/:documentId/download`, `GET /v1/admin/provider-applications/:applicationId/review`, `PUT /v1/admin/provider-applications/:applicationId/review`, `POST /v1/admin/provider-applications/:applicationId/review/notes`, `POST /v1/admin/provider-applications/:applicationId/ocr`, `POST /v1/admin/provider-applications/:applicationId/approve`, `POST /v1/admin/provider-applications/:applicationId/reject`, `POST /v1/admin/provider-applications/:applicationId/request-info` |
| Providers | `GET /v1/admin/providers`, `GET /v1/admin/providers/:providerId`, `PATCH /v1/admin/providers/:providerId/status`, `GET /v1/admin/providers/:providerId/portfolio`, `DELETE /v1/admin/providers/:providerId/portfolio/:mediaId` |
| Refunds | `GET /v1/admin/refunds`, `POST /v1/admin/refunds/:refundId/approve`, `POST /v1/admin/refunds/:refundId/reject` |
| Reports | `GET /v1/admin/reports/:type/schedules`, `GET /v1/admin/reports/:type.pdf`, `GET /v1/admin/reports/revenue.csv`, `GET /v1/admin/reports/users.csv`, `GET /v1/admin/reports/financial.csv`, `GET /v1/admin/reports/bookings.csv`, `POST /v1/admin/reports/:type`, `POST /v1/admin/reports/:type/schedules` |
| Reviews | `GET /v1/admin/reviews`, `PATCH /v1/admin/reviews/:reviewId/flag` |
| Settlements | `GET /v1/admin/settlements`, `POST /v1/admin/settlements/:settlementId/approve`, `POST /v1/admin/settlements/:settlementId/reject`, `GET /v1/admin/settlements/:settlementId/history`, `POST /v1/admin/settlements/:settlementId/reconcile` |
| Support | `GET /v1/admin/support/tickets`, `GET /v1/admin/support/tickets/:ticketId`, `GET /v1/admin/support/tickets/:ticketId/replies`, `POST /v1/admin/support/tickets/:ticketId/replies`, `PATCH /v1/admin/support/tickets/:ticketId/assignee`, `PATCH /v1/admin/support/tickets/:ticketId/status` |
| Users | `POST /v1/admin/users`, `GET /v1/admin/users/summary`, `GET /v1/admin/users`, `PATCH /v1/admin/users/:userId/status`, `PATCH /v1/admin/users/:userId/access`, `DELETE /v1/admin/users/:userId` |

## Internal Service Contracts

These are service-to-service contracts only. The owning service keeps its DTOs
local; callers should use HTTP clients in the gateway or sibling service.

| Service | Port | Internal route groups |
| --- | ---: | --- |
| `auth-service` | 8501 | `/internal/auth/registrations`, `/internal/auth/password-reset`, `/internal/auth/password-change`, `/internal/auth/shared/otp/*`, `/internal/auth/shared/google/*`, `/internal/auth/admin-users`, `/internal/users/:userId`, `/internal/users/:userId/sessions`, `/internal/users/:userId/two-factor/*` |
| `user-service` | 8502 | `/internal/users/:userId/customer-profile`, `/internal/users/:userId/preferences`, `/internal/users/:userId/referral-summary`, `/internal/shared-geo/*`, `/internal/admin/users/*` |
| `catalog-service` | 8503 | `/internal/catalog/categories`, `/internal/catalog/services`, `/internal/catalog/providers`, `/internal/providers/*`, `/internal/providers/applications/*`, `/internal/admin/catalog/*` |
| `booking-service` | 8504 | `/internal/bookings/*`, `/internal/admin/bookings/*`, `/internal/admin/disputes/*` |
| `availability-service` | 8505 | `/internal/providers/:providerId/availability`, `/internal/providers/:providerId/availability/windows`, `/internal/providers/:providerId/availability/days-off` |
| `messaging-service` | 8506 | `/internal/conversations`, `/internal/conversations/:conversationId`, `/internal/conversations/:conversationId/messages` |
| `payment-service` | 8507 | `/internal/payments/*`, `/internal/pricing/*`, `/internal/admin/payments/*`, `/internal/admin/pricing/*` |
| `review-service` | 8508 | `/internal/reviews`, `/internal/reviews/admin`, `/internal/reviews/:reviewId/reply`, `/internal/reviews/:reviewId/flag`, `/internal/reviews/:reviewId/flagged` |
| `notification-service` | 8509 | `/internal/notifications/*`, `/internal/shared-messaging/email/*`, `/internal/shared-messaging/sms/*` |
| `support-service` | 8510 | `/internal/support/tickets/*`, `/internal/admin/support/tickets/*` |
| `admin-service` | 8511 | `/internal/admin/users/*`, `/internal/admin/bookings/*`, `/internal/admin/catalog/*`, `/internal/admin/payments/*`, `/internal/admin/provider-applications/*`, `/internal/admin/reports/*`, `/internal/admin/integrations/*`, `/internal/admin/audit-logs`, `/internal/admin/broadcasts`, `/internal/admin/disputes`, `/internal/admin/support/tickets` |

Every service also exposes:

- `GET /health/live`
- `GET /health/ready`

## Gateway Type Sources

Use these files for the exact field-level request and response contracts:

- `backend/apps/api-gateway/src/features/admin/admin-audit.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-booking.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-broadcast.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-catalog.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-dispute.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-integration.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-payment.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-provider-application.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-report.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-support.types.ts`
- `backend/apps/api-gateway/src/features/admin/admin-users.types.ts`
- `backend/apps/api-gateway/src/features/availability/availability.types.ts`
- `backend/apps/api-gateway/src/features/booking/booking.types.ts`
- `backend/apps/api-gateway/src/features/catalog/catalog.types.ts`
- `backend/apps/api-gateway/src/features/current-user/current-user.types.ts`
- `backend/apps/api-gateway/src/features/geo/geo.types.ts`
- `backend/apps/api-gateway/src/features/messaging/messaging.types.ts`
- `backend/apps/api-gateway/src/features/notifications/notification.types.ts`
- `backend/apps/api-gateway/src/features/payments/payment.types.ts`
- `backend/apps/api-gateway/src/features/preferences/preference.types.ts`
- `backend/apps/api-gateway/src/features/pricing/pricing.types.ts`
- `backend/apps/api-gateway/src/features/provider/provider.types.ts`
- `backend/apps/api-gateway/src/features/referrals/referral.types.ts`
- `backend/apps/api-gateway/src/features/registration/registration.types.ts`
- `backend/apps/api-gateway/src/features/reviews/review.types.ts`
- `backend/apps/api-gateway/src/features/support/support.types.ts`
- `backend/apps/api-gateway/src/features/uploads/upload.types.ts`

## Change Rules

For every new or changed API contract:

1. Define the method, path, auth, headers, params, query, body, response, and
   errors before implementation.
2. Add or update the local service DTO/type file. Do not share DTOs across
   service boundaries.
3. Update this document and the SDK types when the route is intended for
   external consumers.
4. Add focused tests for validation, authorization, success behavior, and at
   least three failure scenarios: race/state conflict, data integrity violation,
   and boundary/invalid input.
5. Run relevant checks before handoff: backend tests/build for backend changes,
   plus SDK typecheck/tests when SDK contracts change.
