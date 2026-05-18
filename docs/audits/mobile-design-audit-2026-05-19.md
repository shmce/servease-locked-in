# Mobile Design Audit — 2026-05-19

Scope: visual design language, not UX flow (those are in [mobile-ux-audit-2026-05-18.md](./mobile-ux-audit-2026-05-18.md) and the re-audit). Read against `mobile/src/theme/serveaseDesign.ts`, `mobile/src/components/{ui,DesignKit,AppDisplay,Motion}.tsx`, and the 10,400-line `mobile/App.tsx`.

**Verdict:** the design isn't bad in the small — individual cards, chips, and hero strips read fine. It feels bad in aggregate for five concrete reasons, each fixable. None of them require a redesign — they require *design system discipline.* The reason the screens feel "off" everywhere is that the same primitives are getting copy-pasted with subtle drift inside one mega-file, so the eye never gets to anchor.

---

## The five root causes

### 1. Everything is mint
`palette.mint` (`#56C490`) is doing the job of brand color, primary action, selected-state fill, link text, icon tint, focused-state border, avatar background, hero/header background, badge fill, and progress dot. When a single hue has nine jobs, none of them register. The hero band is mint, the search bar shadow is tinted mint, the avatar inside the hero is also mint with a slight alpha, the bell chip is mint with an alpha, the next-tip arrow is mint, "Verified" is mint, the selected date chip is mint — you scroll and the eye has nothing to latch onto.

There are also **three near-identical highlight greens** doing different jobs:
- `palette.mintSoft` `#EEF9F3` — section pill backgrounds, category-tile-selected
- `#F0FFF4` — methodCardSelected, notificationCardUnread, dateRailCue
- `#FAFFFE` — faqCardOpen

They're not on a scale, they're three accidents. They read the same on device.

**Fix.** Split the mint role into three semantic tokens, then forbid raw mint in screens:

```ts
// theme/colors.ts
export const brand = {
  primary: '#00A055',      // existing mintDeep — anchors hero, primary CTAs
  primaryHover: '#0B8C4E',
  primarySubtle: '#E8F6EE',// the ONE tint for selected/highlighted backgrounds
  primaryBorder: '#9FDFBE',
};
export const accent = {
  info: '#5AAFF0',
  warn: '#F5A83A',
  danger: '#EF4444',
  success: '#00A055',
};
```
Then `palette.mint` becomes deprecated; new code reaches for `brand.primary`/`brand.primarySubtle` only. The hero band, link text, and selected-state can co-exist because they're variants on one scale rather than three different greens.

### 2. Type scale has no body voice
`theme/serveaseDesign.ts` has six type styles. Five of them are `fontWeight: '800'`; even `body` is `500`; `caption` is `500`. Across `App.tsx` the actual weights used are `'700' / '800' / '900'` for everything from screen titles down to muted micro-labels (`heroMuted`, `dateChipDow`, `categorySub`). There is **no regular weight** anywhere. The screen has no whisper — it shouts at three volumes.

**Fix.** Adopt a 4-step weight scale and use weight, not size, to express hierarchy:

```ts
export const text = {
  display:  { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title:    { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  section:  { fontSize: 15, lineHeight: 20, fontWeight: '600', letterSpacing: 0.2 },
  body:     { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong:{fontSize: 15, lineHeight: 22, fontWeight: '600' },
  label:    { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption:  { fontSize: 12, lineHeight: 16, fontWeight: '400', color: muted },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
};
```
Use `display`/`title` for one anchor per screen. Everything else is `body`. The current habit of bolding muted captions (`heroMuted` is `700`, `categorySub` is `600`) is reverse-hierarchy.

### 3. Card soup — every row is its own elevated container
List items in the mobile app are not list items, they're stacked cards with borders + shadows. Inventory:

| style | radius | borderWidth | shadow |
|---|---|---|---|
| `faqCard` | 14 | 2 | `0 4px 8px rgba(0,0,0,.04)` |
| `notificationCard` | 16 (lg) | 2 | `0 4px 8px rgba(0,0,0,.08)` |
| `methodCard` | 12 (md) | 2 | none |
| `roleCard` | 16 (lg) | 2 | `0 4px 8px rgba(0,0,0,.05)` |
| `categoryTile` | 20 | 1 | `0 5px 10px rgba(0,0,0,.05)` |
| `bookAgainCard` | 20 | — | `0 6px 16px rgba(0,0,0,.07)` |
| `searchBar` | 16 (lg) | — | `0 6px 16px rgba(44,90,60,.12)` |

Six radii (8/12/14/16/20/22), five shadow recipes, two border widths. The eye reads this as "every row is the most important thing on the screen," which is the same as none of them being important. Stack ten cards and you have a wall of equally-pillowed pills.

**Fix.** Define an elevation scale (3 levels max) as tokens, then use **borders OR shadows, never both**, and pick one radius per role:

```ts
export const elevation = {
  flat:  {}, // borderColor: line, borderWidth: StyleSheet.hairlineWidth
  lifted:{ shadowColor:'#000', shadowOffset:{w:0,h:1}, shadowOpacity:.06, shadowRadius:2, elevation:1 },
  floating:{ shadowColor:'#000', shadowOffset:{w:0,h:8}, shadowOpacity:.10, shadowRadius:20, elevation:6 },
};
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 }; // collapse 8/12/14/16/22
```
Rule of thumb: list rows are `flat` with a hairline divider. Picked-out cards (Active booking, primary recommendation) are `lifted`. Bottom sheets and modals are `floating`. Don't apply `boxShadow` inline anywhere — those shadow strings drift every time someone copy-pastes a row.

### 4. The hero band eats the screen
Every customer + provider top-level screen begins with a solid `palette.mint` slab: avatar + greeting + bell + search. It's ~140–180px of saturated green before any content. Then the next screen does it again. By the third screen the brand stops feeling premium and starts feeling loud.

**Fix.** Demote the hero from "color block" to "contextual band":
- On the home screen only, keep a *short* mint band (~64px) with the greeting and bell — no big avatar.
- The search bar becomes a sticky, neutral-white element under the band (or above the tab bar on Explore).
- All other screens use a white app header with a small back/title row. The mint shows up only in the active tab, the primary CTA, and category icons.

This frees the eye to actually use the brand color when it matters — on a primary action.

### 5. The structural cause: one 10,400-line file
`App.tsx` is 10,400 lines containing every screen as a `render…()` method on a single component, with one shared 1,500-line `StyleSheet.create({...})` at the bottom. The visual drift in §1–§3 isn't a taste problem — it's the *direct mechanical consequence* of this layout. When two screens need a similar card, someone defines `faqCard` near `notificationCard`, slightly differently, because there's no `<ListCard>` to reach for. The audit at `mobile-ux-reaudit-2026-05-18.md` already identified messaging/navigation drift from the same root cause.

**Fix.** This is the highest-leverage change of the five. Even without redesigning anything visually, splitting the file forces consolidation:

```
mobile/src/
├── theme/
│   ├── colors.ts          # brand, accent, neutral scales
│   ├── typography.ts
│   ├── elevation.ts
│   ├── radii.ts
│   └── index.ts
├── components/
│   ├── primitives/        # Box, Stack, Text, Pressable, Divider
│   ├── ui/                # Button, Card, ListRow, Chip, Avatar,
│   │                      # SearchField, EmptyState, SectionHeader,
│   │                      # Badge, Switch, BottomSheet
│   └── patterns/          # ScreenHeader, BookingCard, ProviderHero
└── screens/
    ├── customer/          # one file per screen
    └── provider/
```
Every screen imports from `components/ui` and `theme`. No screen owns a `StyleSheet` larger than ~80 lines. The `ui` layer is where the design rules live, and reviewers can enforce "no raw `palette.mint` in screen code" with one ESLint rule.

---

## Secondary issues worth fixing in the same pass

| # | Issue | Fix |
|---|---|---|
| D1 | Border radii are ad-hoc (`14`, `20` appear inline alongside `radius.md/lg`) | Collapse to `{sm:10, md:14, lg:20, pill:999}` and remove inline numbers |
| D2 | `spacing.xl` (24) is used both as gutter and as section padding — they should differ | Add `spacing.gutter = 20`, `spacing.sectionY = 28` |
| D3 | Pressed/hover state is invisible on every tappable card — `Motion.tsx` exists but isn't wired into `Card`/`ListRow` | One `usePressFeedback()` hook that drives a 0.97 scale + opacity 0.92 on press, applied at the primitive level |
| D4 | Empty states are wordy paragraphs in muted gray; no illustration, no icon, no scale | Build an `<EmptyState icon title body action />` primitive and replace all six current variants |
| D5 | Bottom-nav clearance is two magic numbers (`paddingBottom: 108` and `132`) duplicated across screens | Compute from `useSafeAreaInsets()` + nav height constant |
| D6 | Icons are tinted in a mix of `palette.mint`, `palette.faint`, `palette.muted`, and white-on-green — no rule | Tint rule: brand-colored icon = active state only; otherwise `neutral.700` (body) or `neutral.500` (muted) |
| D7 | No dark mode plumbing. Hex literals everywhere — flipping themes would be a rewrite | Wrap palette in `useColorScheme()`-aware `useTheme()`, even if dark mode ships later |
| D8 | "Selected" / "unread" / "highlighted" all use a near-white green tint — they look the same | One semantic token `surface.selected` for selection, a separate `surface.unreadDot` (just the dot, not the row tint) for unread |
| D9 | `fontWeight: '900'` is used on screen titles — most system fonts don't have a true 900 cut, so the render leans on synthetic bold and looks crunchy on Android | Cap weight at `700`; reserve `800` for the one display per screen |
| D10 | No motion tokens (durations / easing); every spring/timing call has hard-coded numbers | `motion.spring.standard = { stiffness: 180, damping: 20 }`, etc. — exported from `theme/motion.ts` |
| D11 | Accessibility-wise the contrast of `muted` (`#6B7280`) on `cream` (`#FAF8F5`) is ~4.4:1 — passes AA for body but fails for the 12px captions used everywhere | Drop caption color to `#4B5563` *or* raise caption size to 13px |

---

## Suggested order of attack

If you do them in this order, each step makes the next step easier:

1. **Tokens first (1 day).** Write the new `theme/{colors,typography,elevation,radii,motion}.ts` modules. Keep the legacy `palette` as a re-export with `@deprecated` JSDoc so nothing breaks.
2. **Primitives (2 days).** Build `Text`, `Stack`, `Card`, `ListRow`, `Chip`, `Button`, `SearchField`, `ScreenHeader`, `EmptyState`. These read from tokens only.
3. **Split `App.tsx` (3–5 days).** One screen per file under `screens/`. Each screen replaces inline JSX with the new primitives. This is where you'll feel the design improve, because every drift gets collapsed during the move.
4. **Hero demotion (0.5 day).** Replace the heavy mint hero with the `ScreenHeader` pattern on all non-home screens.
5. **Pass on lists (1 day).** Convert notifications / settings / FAQ / role pickers from "stack of cards" to "list rows on a single surface."
6. **Polish pass (1 day).** Add pressed-state feedback at the primitive layer, the empty-state component, and the motion tokens.

A reasonable target: ~1.5 weeks for one engineer to make the app feel materially different without changing what any screen does.

---

## What to keep
This isn't all bad. Things that are working and shouldn't change:
- The mint-as-brand is a defensible choice — the issue is overuse, not the color itself.
- Lucide iconography is consistent and legible — keep it.
- Spacing scale (`xxs…xxl`) is reasonable; just add gutter/section semantic tokens on top.
- The booking-form date strip and time grid are the cleanest patterns in the app — they're a good blueprint for the new chip/tile primitives.
- `Motion.tsx` is a good starting point for press feedback once it's wired through primitives.

---

## Appendix — quick wins you can ship before the bigger refactor
If you want one PR that visibly improves things tomorrow:
1. Drop `fontWeight` to `'600'` on `heroMuted`, `categorySub`, `dateChipDow`, `dateChipMonth`, `bookAgainTitle` (`'900'` is the worst offender — change everywhere).
2. Replace all three "selected green" backgrounds (`#F0FFF4`, `#FAFFFE`, `mintSoft`) with a single `brand.primarySubtle` token.
3. Remove the avatar from the hero on every screen that isn't `Home`. Replace with a short white header + title.
4. Remove the 2px border on `notificationCard` / `faqCard` / `methodCard` / `roleCard` — keep just the shadow, or just the border, never both.
5. Pick *one* shadow recipe (`elevation.lifted` above) and replace the seven `boxShadow:` strings with it.

Those five changes alone change the apparent design quality more than any single visual flourish would.
