# Mobile Skeleton Loading Design

## Purpose

ServEase mobile should feel stable while structured data loads. Skeleton frames will replace blank list areas and generic spinners on high-traffic screens where the final layout is predictable before API data arrives.

## Scope

Add a shared skeleton loading pattern for the Expo React Native app under `mobile/`. The first implementation should cover:

- Booking lists that render `BookingCard`.
- Customer service and provider list rows.
- Saved payment method rows.
- Profile or detail summary cards where the final layout is known.

Do not use skeletons for short button actions, form submission progress, map route calculation, uploads, or flows where the eventual layout is not predictable.

## Component Design

Create reusable skeleton primitives in the mobile shared UI layer:

- `SkeletonBlock`: rectangular placeholder with configurable width, height, radius, and style.
- `SkeletonLine`: text-line placeholder with preset height and configurable width.
- `SkeletonCircle`: circular placeholder for avatars or icons.
- `SkeletonCard`: card shell that matches the existing `Card` visual language.

The skeleton primitives should use React Native's built-in `Animated` API for a subtle pulse. No new runtime dependency is required.

Build layout-specific skeletons close to the components they mimic:

- `BookingCardSkeleton` near `BookingCard`.
- `ServiceListItemSkeleton` near `ServiceListItem`.
- `ProviderListItemSkeleton` near `ProviderListItem`.
- `PaymentMethodRowSkeleton` near payment method views or the shared display component if reused.

## Screen Behavior

Screens should render skeletons only while initial structured data is loading:

- If `isLoading` is true, render a fixed number of skeleton rows or cards.
- If `isLoading` is false and data exists, render the real content.
- If `isLoading` is false and data is empty, render the existing `EmptyState`.

Refresh actions should not replace already visible content with skeletons. Existing content should remain on screen while refresh buttons show their existing disabled or busy state.

## Accessibility

Skeleton containers should be hidden from screen readers where possible because they do not contain useful content. The screen can expose a concise loading state through existing labels or accessibility state if needed.

The pulse animation should respect reduced-motion settings when practical. If reduced motion is enabled, render static placeholders.

## Visual Rules

Skeletons should match the final content geometry:

- Cards use the same width, padding, border radius, and background family as real cards.
- Avatar placeholders match real avatar dimensions.
- Text placeholders use realistic line widths instead of full-width bars everywhere.
- Color contrast stays subtle against `palette.cream`, `palette.white`, and card backgrounds.

Avoid adding explanatory in-app text such as "loading skeleton" or fake labels inside placeholders.

## Data Shape And Contracts

No backend contract changes are required. The feature consumes existing view model loading state such as `isLoading`, `busyAction`, and empty data arrays.

Where a screen currently infers loading from an empty array, the view model should make that explicit if the distinction between "loading" and "empty" matters.

## Acceptance Criteria

- Shared skeleton primitives are available to mobile screens without adding a new package.
- Booking, service, provider, and payment method loading states use layout-matched skeletons.
- Empty states only appear after loading is complete.
- Refreshing existing data does not blank out the current list.
- Skeleton animation is subtle and does not shift layout.
- TypeScript checks pass for changed mobile files.
- Relevant Jest tests are updated or added where view model loading behavior changes.

## Testing Plan

- Run `cd mobile && npm run typecheck`.
- Run targeted Jest tests for any changed view models.
- For UI changes, run Expo web or the relevant local app target and inspect at least one customer and one provider screen with loading states forced or mocked.
