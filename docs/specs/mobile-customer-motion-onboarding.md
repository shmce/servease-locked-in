# Mobile Customer Motion and Onboarding UX

## Goal

Make the mobile customer experience feel more polished and less static without changing backend contracts or core navigation. Motion should be subtle, fast, and applied through shared UI primitives so it improves many screens at once.

## Scope

- Add a shared screen transition for customer and provider in-app routes.
- Add subtle entrance animation to shared cards.
- Add press feedback to shared primary buttons.
- Add active-state motion to bottom navigation items.
- Add a dismissible customer getting-started guide on the Explore screen.

## Behavior

- Route changes fade and slide the active screen content into place.
- Cards fade and lift in when mounted.
- Primary buttons scale down slightly while pressed.
- Bottom navigation active icons scale softly when selected.
- The Explore guide shows three steps: find a service, pick a provider, and track updates. Customers can move through tips or dismiss the guide for the current app session.

## Constraints

- Use React Native's built-in `Animated` API only. Do not add Reanimated or new native dependencies for this slice.
- Animate transform and opacity where practical.
- Keep the bottom navigation visible and stable during route transitions.
- Do not change API contracts, persisted data, or booking workflows.

## Acceptance Criteria

- Customer and provider screen content animates on route changes.
- Shared `Card`, `PrimaryButton`, and `BottomNavigation` components provide motion feedback.
- Explore includes a customer-facing guide with next and dismiss controls.
- TypeScript typecheck succeeds for the mobile app.
- Existing mobile tests still pass.
