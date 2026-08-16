---
name: Line Tracking Robot Simulator
description: Browser-based Arduino-style line-following robot simulator for classroom robotics
colors:
  bg: "#0d0c0a"
  panel-bg: "#17150f"
  panel-recessed: "#0a0908"
  border: "#322e26"
  text: "#d8d4c9"
  text-heading: "#f5f2e8"
  text-muted: "#8a8577"
  accent: "#ffb020"
  accent-bg: "rgba(255, 176, 32, 0.12)"
  accent-hover: "#ffc966"
  on-accent: "#1a1204"
  live: "#ff3b30"
  danger: "#ff3b30"
  success: "#34d058"
  warning: "#ffb020"
  console-bg: "#0a0908"
  console-text: "#d8d4c9"
  segment-lit: "#ff9d00"
  segment-ghost: "rgba(216, 212, 201, 0.07)"
  robot-body: "#4c6ef5"
  robot-heading: "#ffd43b"
  sensor-ir: "#e64980"
  sensor-ultrasonic: "#15aabf"
  sensor-color: "#f08c00"
  track-line: "#2b2b2b"
  obstacle: "#495057"
  finish-zone: "#40c057"
typography:
  heading:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 600
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  meta:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.04em"
  mono:
    fontFamily: "ui-monospace, Consolas, 'Leelawadee UI', 'Noto Sans Thai', monospace"
    fontWeight: 400
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "5px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "10px 20-28px"
  button-secondary:
    backgroundColor: "{colors.panel-bg}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.panel-bg}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: The Scoreboard

## Overview

**Creative North Star: "The Scoreboard"**

This is a redesign — the app's second visual identity, replacing "The Circuit Board" (a flat, purple-accented, bordered system) wholesale rather than extending it. It was chosen through a structured direction roll (`concept-seed.mjs --scope direction --mode operate`, seed `444573ff`): the assigned grounded candidate was a literal circuit-board/silkscreen reading, but a dealt challenger — the seven-segment display family (bedside clocks, gas-station price totems, scoreboards) — won on both audience identification and product clarity and became the build. See `index.html`'s opening HTML comment for the full direction contract.

Every number in this app is a real LED segment digit, not a themed numeral font, because the product's core feedback loop — elapsed time, off-track time, best times, star counts — genuinely is a timing instrument's job. The interface is a matte, near-black instrument bezel: silkscreen off-white labels, one amber signal for anything live or interactive, red and green reserved strictly for running/pass outcomes, exactly like a real scoreboard's lamp colors. This is a classroom tool for Thai mid/high-school robotics students, run by a teacher, so legibility and instant state-reading still come first — the identity expresses through material and precision, not through obscuring the task.

The simulation canvas (the Konva-rendered track, robot, and sensors) stays its own fixed, mode-independent palette, unrelated to the app chrome's tokens — it's a physical simulated world, not a themed UI surface, and that boundary survived the redesign unchanged.

**Key Characteristics:**
- Every timed/counted value renders as real 7-segment digits (`SevenSegmentDisplay`, CSS-built, no webfont) — unlit ("ghost") cells always faintly visible, value changes are instant segment swaps, never a count-up tween.
- Matte near-black bezel, always dark — a real LED instrument doesn't have a light mode; its housing is dark plastic under any ambient light. `prefers-color-scheme: light` is not honored here (verified absent from the stylesheet), a deliberate identity commitment, not an oversight.
- One accent: amber (`--accent`), for anything live/interactive/primary — including the single "Run" key, which is the one control the whole console is built around.
- Red and green are reserved for outcome states (running/live, pass) — never decoration, never a second accent.
- Sharp, small corner radii (2–5px) — a milled panel edge, not a soft rounded card.
- Flat by default, with one motivated exception: segment-display "glass" is recessed behind a subtle inset shadow, because that's what a real display window looks like set into a bezel — this is the only `box-shadow` anywhere in the stylesheet.
- Thai gets its own system-font stack, line-height, and `:lang(th)` sync — unchanged from before the redesign, since that was a correctness fix independent of visual world.

## Colors

Two families, unchanged in structure from before the redesign: the **app chrome** (now fixed dark, no light variant) and the **simulation world** (fixed, mode-independent, canvas-only).

### Primary
- **Signal Amber** (`#ffb020`): the one accent. The Run key, focus rings, selected level card, primary buttons, active tab underline, the navbar wordmark. If a screen has two amber elements competing for attention, that's a violation.
- **Signal Amber, pressed** (`--accent-hover`, `#ffc966`): hover/press shade for anything filled with Signal Amber.
- **On-Amber Ink** (`--on-accent`, `#1a1204`): the only text color ever placed on an amber fill — amber is too light-luminance for white text to clear contrast.

### Status
- **Live Red** (`--live` / `--danger`, `#ff3b30`): a blinking dot for "running," and the fail/danger state — one hue, two related jobs, same as a real panel's single red lamp.
- **Pass Green** (`--success`, `#34d058`): lit segment digits and lit star-pips on a passed result, nothing else.

### Neutral
- **Bezel** (`--bg`, `#0d0c0a`): the page background.
- **Panel Face** (`--panel-bg`, `#17150f`): cards, modal, navbar, HUD strip.
- **Recessed Glass** (`--panel-recessed`, `#0a0908`): the segment-display housing specifically — darker than the panel it sits in, with the one sanctioned inset shadow.
- **Seam** (`--border`, `#322e26`): every hairline border.
- **Silkscreen Bright** (`--text-h`, `#f5f2e8`): headings, high-emphasis labels.
- **Silkscreen** (`--text`, `#d8d4c9`): default body/label ink.
- **Silkscreen Dim** (`--text-muted`, `#8a8577`): captions, secondary labels, difficulty tags.

### Segment Display
- **Lit Segment** (`--segment-lit`, `#ff9d00`): default digit color (amber-red LED). Overridden per-instance via the `--segment-lit` custom property where a readout needs to read as an outcome — green on the Result Modal's time (`--segment-lit: var(--success)`), red on the HUD's off-track readout once it starts accumulating.
- **Ghost Segment** (`--segment-ghost`, `rgba(216,212,201,0.07)`): the always-visible unlit cell — absence is drawn as deliberately as light, same as the source hardware. Also reused as the unlit fill for `StarPips`.

### Simulation World (canvas-only, unchanged by the redesign)
Robot Blue (`#4c6ef5`), Heading Yellow (`#ffd43b`), IR Pink (`#e64980`), Ultrasonic Cyan (`#15aabf`), Color-Sensor Orange (`#f08c00`), Track Black (`#2b2b2b`) on Floor Off-White (`#f7f7f5`), Obstacle Slate (`#495057`), Finish Green (`#40c057` ~20%).

### Named Rules
**The One Signal Rule.** Signal Amber marks exactly one focal thing per view — the active tab, the selected card, the primary/Run action. It never doubles as decoration.
**The Segment-First Rule.** Any value that is a duration, a time, or a count (elapsed, off-track, best time, star tally, levels-passed tally) renders through `SevenSegmentDisplay`, not as plain text — that's what makes this a scoreboard and not a dashboard with numbers on it.
**The No-Light-Mode Rule.** This world commits to dark only. Do not add a `prefers-color-scheme: light` branch back — a scoreboard's bezel doesn't change color with the room.

## Typography

**Body/Heading Font (Latin/`lang=en`):** `system-ui, 'Segoe UI', Roboto, sans-serif`
**Body/Heading Font (Thai/`lang=th`):** `'Leelawadee UI', 'Noto Sans Thai', Tahoma, system-ui, sans-serif` — unchanged by the redesign; see the Lang-Follows-Language Rule below.
**Code/Mono Font:** `ui-monospace, Consolas, 'Leelawadee UI', 'Noto Sans Thai', monospace`
**Numeral system:** 7-segment cells (`SevenSegmentDisplay`), not a font at all — CSS `clip-path` shapes, so it costs no network request and stays crisp at any size.

**Character:** System sans for everything read as prose — headings included; per the craft floor, monospace is not a costume for a "technical-feeling" title. `h1`/`h2`/`h3` are plain `var(--sans)`, weight 600 — confirmed directly in `src/index.css`, not a mono/uppercase "placard" treatment. Mono stays reserved for what it was always for: code, console, IDs, and short data-style labels (level/team names, HUD field labels, the navbar wordmark). Segment cells for anything that's a number the product is timing or counting. Three signals, never substituted for each other, none of them a network font.

**`--mono` carries a Thai fallback.** `ui-monospace`/`Consolas` have no Thai glyphs, and `--mono` labels several places that carry translated Thai text (level names, HUD labels). `'Leelawadee UI'`/`'Noto Sans Thai'` ride at the end of the stack as a per-character fallback: Latin/digit characters still render genuinely monospace, and only the glyphs those fonts lack (Thai) fall through to a real Thai face instead of an undefined OS default — standard CSS font-stack fallback, not a hack. (Note: a stray code comment in `src/index.css` still describes this stack as backing "headings" — that refers to a reverted, no-longer-shipped placard treatment and does not reflect the actual `h1`/`h2`/`h3` rule below it in the same file; headings use `var(--sans)`.)

### Hierarchy
- **Heading** (sans, 600, 18–20px): modal titles, page titles, section headers — the app's `h1`/`h2`/`h3` default. An earlier pass during this redesign tried an uppercase-mono "placard" treatment here; reverted after finish review correctly called it monospace-as-costume on plain prose (see `Do's and Don'ts`). The navbar wordmark keeps its own small, separate mono/uppercase/amber treatment as a brand mark, not a heading-role default — see Components → Navigation.
- **Body** (400, 15px, 1.45 line-height): the root font; default paragraph and control text.
- **Meta** (400, 14px): subtitles, nav status, modal timestamps.
- **Label** (700, 11px, uppercase): difficulty placards, tab labels, small captions.
- **Mono** (400, 12–14px): code editor, console, level-card names, the Run-controls key legends, the navbar wordmark.
- **Segment** (variable `size` px): elapsed/off-track HUD readouts (18px), Result Modal time (26px), level-card best time (12px), leaderboard star/levels-passed tallies (14px).

**Type scale steps in use:** `10px` (difficulty placard), `11px` (label), `12px` (mono captions, small segment digits), `13px` (secondary controls, level-card name), `14px` (meta, leaderboard segment tallies), `15px` (body), `16px` (navbar wordmark), `18px` (heading, HUD segment digits), `20px` (login/onboarding heading), `26px` (Result Modal segment digits), `32px` (student-ID mono digit field).

### Named Rule: The Lang-Follows-Language Rule
`<html lang>` is kept in sync with the language toggle at all times (`src/App.tsx`, a `useLayoutEffect` on `useLanguageStore`) — `--sans` swaps to the Thai stack and body line-height steps up to `1.7` only via `:lang(th)` selectors in `src/index.css`, which only match when `lang` is correct; Thai word-segmentation in narrow containers depends on it too. Independent of visual world — this rule survives any future redesign.

### Named Rule: The No-Decoration Mono Rule
Monospace appears only where the content genuinely is code, console output, an ID, or a short data-style label (level/team name, HUD field label, the navbar wordmark) — never as a stylistic flourish on ordinary UI prose or headings.

## Layout

Unchanged by the redesign: the three-column app shell (`AppShell`) — narrow left sidebar (levels/sensors/level-editor tabs), center simulation stage, right panel (code editor + console) — separated by `1px solid var(--border)` only. Compact, information-dense (13–15px body, 8–16px padding) to fit a lesson's toolkit on one screen. Auth/onboarding screens break into a single centered card, `max-width 360–720px`, `padding 24–32px`.

## Elevation & Depth

**Flat by default, with one motivated exception.** No ambient shadow on cards, buttons, panels, or the modal — depth there is still border and fill contrast, unchanged in principle from the prior world. The one exception, confirmed as the only `box-shadow` declaration in the shipped stylesheet: `SevenSegmentDisplay`'s housing (`--panel-recessed`) carries `box-shadow: inset 0 2px 6px rgba(0,0,0,0.6)` — a recessed-glass cue, because a real segment display sits behind a dark window in its bezel, not flush with it. This is a specific, singular device tied to one component, not a general license for shadows.

Motion stays the vocabulary established before the redesign — scale + `cubic-bezier(0.16, 1, 0.3, 1)`, 60–350ms, for buttons/cards/modal chrome — with one addition: **numeric content never tweens.** A `SevenSegmentDisplay` value change is an instant segment swap in the same frame, no morph, no count-up, matching the source hardware's own rule ("every change is an instant segment swap") and keeping the readout legible mid-lesson rather than decorative.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flush with their background at rest — shadows are reserved for the one recessed-glass exception above, nowhere else.
**The Instant-Segment Rule.** Numeric readouts (`SevenSegmentDisplay`) never animate their own value change — no easing, no count-up. Everything else may still use the shared motion vocabulary.
**The One Motion Vocabulary Rule.** Tactile chrome (buttons, cards, modal, tabs) reuses one set of values: scale, `cubic-bezier(0.16, 1, 0.3, 1)`, 60–350ms, `--accent-hover` for the pressed state.

## Shapes

Corner radius scales with a surface's size, now on a tighter, more mechanical scale than before the redesign — a milled panel edge, not a soft card. Confirmed against every `border-radius` in the shipped component CSS; the system uses exactly four fixed steps:
- **2px** — the difficulty placard tag.
- **3px** — small controls: run/pause/step/reset keys, tabs' container, nav buttons, auth cards, the Result Modal panel itself.
- **4px** — inputs, primary/secondary submit buttons, level cards, the Result Modal's retry button, medium admin rows.
- **5px** — display cards: sensor catalog cards, profile stat cards, sensor configurator rows.
- Segment-display housing and star/status pips use proportional/circular radii tied to their own size, not this fixed scale.

The robot sprite's chassis keeps its own 6px corner radius at simulation scale (`RobotSprite.tsx`, Konva `Rect cornerRadius={6}`); obstacles, the finish zone, and sensor markers stay circles (canvas world, unaffected by the chrome's redesign, and not part of the chrome's 2/3/4/5px scale).

## Components

### Buttons
- **Shape:** 3px (compact controls) or 4px (form submits/level-card-scale actions), never pill-shaped.
- **Primary** (`Login submit`, `Onboarding submit`, `Try Again`, the **Run** key): solid `--accent` fill, `--on-accent` text (never white — see Colors), weight 600–700, `padding: 10px 20–28px`. Hover shifts to `--accent-hover` + `scale(1.02–1.03)`; `:active` compresses to `scale(0.96–0.98)` over 60ms; `:focus-visible` gets a 2px accent outline. `Try Again` additionally pops in on mount (it resolves a level attempt); the Run key and form submits don't need an entrance, only the interactive states.
- **Secondary/Ghost** (other run controls, nav actions, admin actions, level-card/tab selection): `--panel-bg` fill, `1px solid var(--border)`, `--text-h` text, uppercase mono-weight label. Hover swaps the border to `--accent` — no background fill, keeping it visually distinct from primary. `:active` compresses to `scale(0.94–0.98)`; same focus outline as primary.
- **Disabled:** `opacity: 0.4–0.5`, `cursor: not-allowed`.

### Seven-Segment Display (signature component)
`src/components/common/SevenSegmentDisplay.tsx` — takes a string of digits/`.`/`:`/`-`, renders each as a CSS `clip-path` cell inside a recessed housing (`--panel-recessed` + inset shadow — the system's *only* shadow anywhere; every other surface is flat). Every cell shows its ghost ring even when unlit. `size` prop scales the whole cell proportionally (12–14px on level cards/leaderboards, 18px on the HUD, 24px on profile stats, 26px on the Result Modal). Color defaults to `--segment-lit`; override per-instance via the `--segment-lit` custom property to recolor for context (green for a pass, red for an accumulating off-track warning). This is the system's central device — used for every timed/counted value app-wide: HUD elapsed/off-track, level-card and leaderboard best times, the Result Modal time, and profile/leaderboard star and level-passed counts. Reach for it before rendering any such number as plain text.

### Star Pips (signature component)
`src/components/common/StarPips.tsx` — the system's one star-rating idiom: `lit`/`total` lit-or-ghost LED pip circles (`--success` when lit, `--segment-ghost` when not), no glow, no inset — flat fill only, same discipline as the segment cells. Replaces the raw `★`/`☆` glyphs used before the redesign (and briefly left in place on the Leaderboard/Profile tables during the redesign's first pass — a documentation/build gap caught and closed by finish review; verified absent from the shipped source, no glyph stars remain anywhere in `src/`). Used on level cards, the Result Modal, and the level leaderboard table. (The global leaderboard table renders a player's total-star tally as a `SevenSegmentDisplay` digit count, not as pips — a tally is a number, per the Segment-First Rule, while a single result's rating stays pips.)

### Cards
- **Corner Style:** 4px for the level-select card (a clickable list row), 5px for display cards (sensor catalog, profile stats).
- **Background:** `--panel-bg`, `1px solid var(--border)`.
- **Selected state:** border switches to `--accent`, background washes to `--accent-bg` — unchanged idiom from before the redesign, still the one selection pattern system-wide.
- **Level card ("heat placard"):** difficulty renders as a small bordered tag (2px radius, uppercase, `--text-muted`), not plain text; a completed run shows 3 star-pips (lit = `--success`) plus a small `SevenSegmentDisplay` best time; an incomplete level shows plain "not completed" text instead of blank/zeroed digits, so it never reads as a fake `00.0` result.
- **Interaction:** hover/select/press states reuse the shared motion vocabulary (border/background transition 150ms, `:active` scale 0.98).

### Result Modal ("scoreboard flash")
Dark scrim (`rgba(0,0,0,0.7)`, darker than before the redesign to make the panel read as lit against it), 3px-radius panel (`--panel-bg`, `1px solid var(--border)`). Title renders in the standard sans heading style, `--success`/`--danger` colored. On a pass: 3 star-pips (small lit/unlit circles, not glyph stars) + a labeled `SevenSegmentDisplay` (26px, recolored green via `--segment-lit: var(--success)`) for completion time. On a fail: the specific reason (off-track/collision/timeout) in muted meta text. The `Try Again` button (4px radius) is still the resolving beat, popping in after the pips/time settle — see Elevation & Depth for the full three-stage entrance timing.

### HUD (instrument strip)
`SimHud` — a panel-bg strip along the run screen. Status shows a blinking red live-dot while running plus success/danger-colored status text on pass/fail. Elapsed and off-track each render as a labeled `SevenSegmentDisplay` (18px, fixed-width `SS.s` formatting so the readout never reflows mid-run); the off-track readout recolors to `--danger` once it starts accumulating, a visible warning building toward the fail threshold.

### Navigation
- **Navbar:** `--panel-bg` bar, `1px solid var(--border)` bottom edge, uppercase mono `--accent`-colored wordmark (16px), 14px muted links darkening to `--text-h` on hover. The wordmark's mono/uppercase/amber treatment is a deliberate, single, small brand mark — not the heading default (see Typography → Hierarchy) — the one place in the system a name gets stylized this way.
- **Tabs:** underline style — `2px solid transparent` bottom border becoming `--accent` when active; label color shifts `--text-muted` → `--text-h` on hover/active. No filled/pill treatment.

### Inputs
- **Style:** `--bg` fill, `1px solid var(--border)`, 4px radius.
- **Focus:** `2px solid var(--accent)` outline, `2px` offset — no glow, no shadow.
- **Signature variant — the digit ID field:** 32px mono text, `12px` letter-spacing, center-aligned; shakes and reddens briefly (`--danger` border) on a rejected admin login.

## Do's and Don'ts

### Do:
- **Do** render every timed/counted value through `SevenSegmentDisplay` (the Segment-First Rule) — never plain text for a number the product is timing.
- **Do** keep numeric value changes instant, no easing (the Instant-Segment Rule); reserve the shared eased motion vocabulary for chrome (buttons, cards, modal).
- **Do** keep Signal Amber to one focal element per screen (the One Signal Rule).
- **Do** use `--on-accent` for any text placed on an amber fill — never white.
- **Do** scale radius with a surface's size on the confirmed 2/3/4/5px steps, not the prior system's 6/8/10/12px.
- **Do** reuse the level card's selected pattern (accent border + `--accent-bg` wash) as the one selection idiom.
- **Do** keep the simulation canvas's palette self-contained and independent of the app chrome's tokens.
- **Do** keep `document.documentElement.lang` in sync with `useLanguageStore` (the Lang-Follows-Language Rule).
- **Do** style text through `var(--sans)`/`var(--mono)` rather than a hardcoded stack, so it inherits the Thai stack under `:lang(th)`.

### Don't:
- **Don't** add a `prefers-color-scheme: light` branch back (the No-Light-Mode Rule) — this world is dark-only by identity, not by omission.
- **Don't** add `box-shadow` anywhere except the segment-display recessed-glass exception — that's a named, singular device, not a general permission.
- **Don't** introduce a second accent hue; amber is the only interactive signal, red/green are outcome-only.
- **Don't** put white text on an amber fill — contrast fails; use `--on-accent`.
- **Don't** load a custom webfont for any purpose, including for the segment digits — they're CSS shapes specifically so no font (and no network request) is needed. (No confirmed product constraint forces this; it is a system convention this build establishes and keeps.)
- **Don't** use monospace decoratively on prose or headings.
- **Don't** let the simulation canvas's sensor/robot colors bleed into app-chrome UI, or vice versa.
- **Don't** animate a `SevenSegmentDisplay` value with a tween/count-up — it must jump, per the Instant-Segment Rule.
- **Don't** animate on every re-render or add page-load choreography that delays interaction — motion stays fast (60–350ms) and fires once per real event.
- **Don't** apply Latin type-ramp assumptions (line-height, tracking) to Thai copy unexamined.
