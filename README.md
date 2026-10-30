# Aegis Frontend — Cinematic Glassmorphism Design System

Premium, local-first password & API-key vault frontend. This repository currently
contains **Phase 0 (reconnaissance/planning)** and **Phase 1 (visual foundation +
design system)** deliverables: a complete token architecture, light/dark themes,
glass-surface primitives, foundational UI components, a centralized motion system,
animated theme switching, and a design-system showcase. No application features
(auth, vault CRUD, backend integration) are implemented yet — by design.

See `docs/PHASE0_RECONNAISSANCE.md` for the full technical assessment.

## Visual Identity — Cinematic Glassmorphism

Aegis feels like an atmospheric, purpose-built security instrument: layered
translucent glass over a soft aurora backdrop, restrained golden lighting, and
deep blue-tinted ink. Blur, gradient, glow and shadow are applied through a
centralized recipe system (`a-glass--*`, tokens in `src/styles/tokens.css`) —
never ad hoc per component.

### Themes

Applied via `<html data-theme="light|dark">`; all colors resolve through semantic
tokens so components never hardcode palette values.

**Light — "Glacier":** soft white/pale-blue backgrounds (`#eef4fc` base), layered
blue-white surfaces, deep muted-blue ink (`--a-blue-ink-900 #16305e`), darker-blue
accents (`--a-blue-500/400`), restrained gold hairlines (`--a-gold-600 #b98f3e`),
delicate shadows, translucent light glass.

**Dark — "Midnight":** deep navy backgrounds (`#050a18` base), midnight-blue
surface tiers, blue-tinted glass (`--glass-bg rgba(18,34,74,.55)` etc.), cool-blue
accent lighting (`--a-blue-400 #6aa5ff`), controlled gold highlights
(`--a-gold-500 #d9b36a`, `--gold-border`, `--shadow-gold`), high-contrast text.
Not an inversion of light mode — its own designed identity.

Key semantic tokens (both themes define these; see `src/styles/tokens.css`):
`--surface-base/primary/secondary/tertiary`, `--glass-bg[-subtle/-elevated/-modal]`,
`--glass-border`, `--text-primary/secondary/tertiary/on-accent`, `--accent-*`,
`--gold*`, `--border-*`, `--shadow-*`, `--gradient-accent`,
`--gradient-gold-hairline`, `--blur-xs…xl`, `--radius-*`, `--focus-ring`.

### Theme switching

`src/composables/useTheme.ts` is the single source of truth:
- Pre-paint bootstrap inline script in `index.html` sets `data-theme` before first
  frame (no wrong-theme flash); persists to localStorage; follows system preference.
- `toggleTheme({ animate: true })` uses the **View Transitions API** (crossfade,
  no layout shift) when available, with a `.theme-animating` CSS-interpolation
  fallback elsewhere. Reduced-motion collapses both paths instantly.
- `ThemeToggle.vue` provides the reusable animated switch (spring knob, icon
  crossfade).

## Typography

Locally bundled variable fonts (WOFF2 in `src/assets/fonts/`, `@font-face` in
`src/styles/fonts.css`) — **zero runtime dependency on external font services**:

| Register | Class | Font |
|---|---|---|
| Display / page titles | `.a-display`, `.a-title` | Sora |
| Section headings | `.a-heading`, `.a-subheading` | Sora |
| Body / supporting | `.a-body`, `.a-supporting` | Inter |
| Labels / metadata | `.a-label`, `.a-meta` | Inter |
| Technical identifiers | `.a-mono` | JetBrains Mono |

Sizes/weights come from the `--text-*` type scale in `tokens.css`; components use
the classes above rather than arbitrary `text-[Npx]`.

## Glass Surfaces

One shared recipe (`.a-glass` + depth modifier) guarantees consistent background
opacity, backdrop blur, border, inner highlight, shadow and radius:

`a-glass--subtle` · `a-glass--standard` · `a-glass--elevated` · `a-glass--modal` ·
`a-glass--focused` · `a-glass--gold` (premium hairline variant).
The ambient backdrop is `.a-aurora` (three slow-drifting blobs; static under
reduced motion). Blur tiers are capped (`--blur-xs 6px … --blur-xl 40px`) to keep
rendering cheap and text readable.

## Component Foundation (`src/components/ui/`, barrel: `@/components/ui`)

Unopinionated visual primitives only — no vault/business logic:

- `AppButton` (variants: primary/secondary/danger/ghost/glass/gold; sizes sm/md/lg;
  loading/disabled; explicit `type="button"`) and `AppIconButton`
- `AppInput`, `AppPasswordInput` (visual primitives), `FieldGroup`
- `AppBadge` (tones incl. gold/success/warning/danger; `solid` fill option),
  `AppDivider`, `AppSpinner`, `EmptyState`, `KeyValue`
- `GlassPanel`, `Card` — glass-depth containers
- `ModalShell` (focus trap, Escape, scroll lock, focus restore, immediate-open),
  `DropdownShell` (WAI-ARIA menu pattern — see below), `AppTabs` (measured sliding
  pill, ResizeObserver-correct), `AppTooltip`, `AppDialog`, `AppToasts`
- `ThemeToggle`

**DropdownShell trigger contract:** by default it renders a real focusable
`<button>` carrying `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.
With a custom `#trigger` slot, the shell exposes `{ open, toggle, menuId,
setTriggerRef }` slot props so your actual control binds the ARIA attributes
(`setTriggerRef` registers it for Escape/focus-return). The old dead-wrapper
attributes are gone. Example usage lives in the showcase.

Icons: `lucide-vue-next` only, passed as components with a consistent size
convention (11–16px inline, via `:size`).

## Motion System (`src/motion/`)

Centralized on `motion-v` with tokens in `tokens.ts`:
- `durations`: micro 0.15s · control 0.22s · component 0.3s · panel 0.38s (+ page)
- `easings`: out `[0.16,1,0.3,1]` · inOut · in
- `springs`: snappy · smooth · dialog
- `presets.ts` interaction bundles: `buttonInteraction`, `cardInteraction`,
  `navItemInteraction`, `confirmPop`, `atmosphereEnter`, `emblemPulse`,
  `themeSurfaceTransition`, `verifySweep` — plus existing page/stagger transitions.

Components consume presets (`v-bind="buttonInteraction"` etc.) instead of
hand-rolling animation objects. Only GPU-friendly transform/opacity animate; no
decorative loops beyond the capped aurora drift.

**Reduced motion:** `useAppReducedMotion()` (JS side) drops interaction bundles
and switches state animations to instant; `global.css` neutralizes CSS
transitions/animations, aurora drift and view-transition duration under
`prefers-reduced-motion`. Functional rotation (spinner) is intentionally kept.

## Design-System Preview

Open **`/#/design-system`** (dev or built site). It mounts
`src/design-system/DesignSystemPreview.vue` instead of the vault shell and
demonstrates both themes, typography hierarchy, palette, glass depths, borders/
shadows, every UI primitive with hover/focus/disabled states, modal/dropdown/tabs
presentation, motion examples, and the animated theme transition. It is a review
surface, not app navigation (`isDesignSystemRoute()` in `src/types/index.ts`).

## Development

```bash
npm install
npm run dev        # http://localhost:3000  (showcase: /#/design-system)
npm run build      # production build (Vite)
npm run typecheck  # vue-tsc strict validation
```

Stack: Vue 3.5 · Vite 6 · TypeScript (strict) · Tailwind CSS v4 · motion-v ·
Pinia · lucide-vue-next. Fonts and all assets bundled locally.

## Status & Boundaries

Phase 1 complete: tokens, both themes, glass primitives, UI foundation, motion
system, theme infrastructure, showcase. Phase 2 (application screens) must build
on these primitives. Backend contracts (`src/services/api/contracts.ts`) remain
untouched; mock client stays clearly development-only.
