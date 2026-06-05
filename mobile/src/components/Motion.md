# Mobile Motion System

Motion is centralized in `Motion.tsx` so route transitions, shared component feedback, loading states, sheets, and success states use the same timing and reduced-motion behavior.

Use opacity and transform animations with `useNativeDriver: true` for broad shared UI. Avoid width, height, and layout animations in reusable components because they run on the JS thread and can resize content while users scroll or tap.

Reduced motion is part of the motion contract. New app-controlled transitions should use the shared reduced-motion state instead of querying `AccessibilityInfo` locally.

`react-native-reanimated` is deferred for this change. Existing `Animated` primitives cover route, card, row, button, tab, skeleton, modal, and success motion without adding a new native dependency.

Map and navigation sheets are the current exception: customer tracking and provider navigation animate sheet height for drag behavior while a map/WebView remains mounted. Those surfaces should stay isolated unless a measured performance issue justifies a dedicated Reanimated follow-up.
