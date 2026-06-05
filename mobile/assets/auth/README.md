# Auth visual assets

## auth-brand-mark.png and auth-wordmark.png

Reference-derived transparent PNG assets cropped from the provided target auth screen so the entry screen can reproduce the ServEase brand mark and custom wordmark faithfully instead of approximating them with native text or SVG paths.

These assets are brand presentation only. The auth gate keeps the accessible heading label (`ServEase`) in React Native, and the sign-up/login CTAs remain native pressable controls.

## auth-reference-decorative-plate.png

Generated with the built-in image generation workflow for the reference-composition auth gate pass at the target auth screen ratio (`430:932`). This is the preferred decorative background for the auth gate.

This plate is decorative only. It contains the white canvas, pale mint organic blobs, dotted accent grids, and realistic green-accent service tools around the edge zones. Required auth copy, CTAs, routes, loading states, brand accessibility, and touch targets stay in React Native.

Reference composition acceptance notes:

- Upper-left edge: green-handled pliers crop in from the side without covering the central logo/wordmark safe area.
- Upper-right edge: green brush and paint stroke sit high on the right edge and remain clear of the native brand mark.
- Lower-left edge: broom handle/bristles crop from the bottom-left edge.
- Lower-right edge: silver adjustable wrench and brass faucet crop from the bottom/right edge.
- Center safe area: the middle column remains clean from the brand mark through the CTA stack.
- Supported crop behavior: edge tools may crop on narrow screens, but they must not stretch or cover native auth copy/buttons.

Final generation prompt brief:

Create a vertical decorative-only ServEase auth background plate inspired by the supplied reference composition. Include only the background decoration: clean white canvas, soft pale mint organic blobs, subtle mint dotted accent grids, and realistic green-accent service tools cropped around the extreme edges. Place pliers in the upper-left edge zone, a green paint brush with green paint stroke in the upper-right edge zone, a broom in the lower-left edge zone, and a horizontal silver adjustable wrench with a small brass faucet in the lower-right edge zone. Preserve a large clean central safe column for native UI overlay. Do not include words, letters, brand marks, logos, buttons, status bars, icons, UI controls, watermarks, signatures, or fake app UI.

## layers/

Generated with the built-in image generation workflow for the layered ServEase auth gate refinement. These separate layers are retained as historical/fallback material now that the preferred auth gate uses `auth-reference-decorative-plate.png`.

The current auth gate uses separate decorative tool layers so each tool can be positioned with aspect-ratio-preserving `contain` rendering instead of stretching one full-screen bitmap. Required auth copy, CTAs, loading states, navigation behavior, and accessibility labels stay in React Native.

Layer assets:

- `layers/auth-tool-pliers.png` - upper-left pliers cutout.
- `layers/auth-tool-brush.png` - upper-right brush-only cutout for independent corner placement.
- `layers/auth-paint-stroke.png` - right-edge green paint stroke cutout, separated from the brush so it can be cropped away from the logo.
- `layers/auth-tool-broom.png` - lower-left broom cutout.
- `layers/auth-tool-wrench-faucet.png` - lower-right horizontal wrench and brass faucet cutout.

Prompt brief:

Create isolated realistic service tool cutouts for a ServEase auth screen on a flat `#ff00ff` chroma-key background, with green accents, silver metal, black broom bristles, and brass faucet details. Keep each tool separated, crisp, and free of text, logos, UI controls, watermarks, cast shadows, and non-uniform background effects. Remove the chroma key locally and save final PNGs with alpha.

Art-direction refinement prompt brief:

Create three separate realistic decorative cutouts for a ServEase auth screen: a green-handled paint brush only, a separate sweeping green paint stroke only, and a wide horizontal silver adjustable wrench with a small brass faucet near the right side. Keep the subjects far apart on one flat `#ff00ff` chroma-key sheet so each can be cropped into its own alpha PNG.

Background blobs and dotted accents are rendered as native React Native decorative layers to keep them easy to tune across mobile sizes.

`layers/auth-tool-brush-paint.png` is retained as historical reference material from the first layered pass, but the art-directed auth gate uses the split brush and paint-stroke assets instead.

## auth-reference-frame-v2.png

Generated with the built-in image generation workflow for the ServEase auth gate refresh.

Prompt brief:

Create a very narrow vertical mobile auth decorative background inspired by the supplied ServEase reference: clean white canvas, soft mint-green organic shapes, subtle dotted accent grids, realistic green-accent service tools cropped around only the extreme edges, and a completely clear central safe column for native React Native logo, copy, and buttons. Do not include text, logos, buttons, status icons, watermarks, or UI controls.

The generated frame is decorative only. Required auth copy, CTAs, loading states, and accessibility labels stay in React Native.

This frame is retained as historical reference material and is not the preferred implementation path for the layered auth gate.
