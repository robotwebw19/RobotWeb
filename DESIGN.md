---
name: Line Tracking Robot Simulator
description: Browser-based Arduino-style line-following robot simulator for classroom robotics
colors:
  bg: "#062327"
  bg-alt: "#0a3236"
  panel-bg: "#0b3236"
  panel-recessed: "#041619"
  border: "#1d484c"
  text: "#e9f2ef"
  text-heading: "#ffffff"
  text-muted: "#8fb0ac"
  accent: "#c9922f"
  accent-bg: "rgba(201, 146, 47, 0.16)"
  accent-hover: "#e0ac4c"
  on-accent: "#1a1204"
  live: "#ff3b30"
  danger: "#ff3b30"
  success: "#34d058"
  warning: "#ffb020"
  console-bg: "#041619"
  console-text: "#d7e8e4"
  segment-lit: "#ffb020"
  segment-ghost: "rgba(233, 242, 239, 0.08)"
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
    fontFamily: "Kanit, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 600
  body:
    fontFamily: "Kanit, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  meta:
    fontFamily: "Kanit, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "Kanit, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.04em"
  mono:
    fontFamily: "ui-monospace, Consolas, 'Leelawadee UI', 'Noto Sans Thai', monospace"
    fontWeight: 400
rounded:
  xs: "1px"
  sm: "2px"
  md: "3px"
  lg: "4px"
  xl: "5px"
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
    rounded: "{rounded.lg}"
    padding: "10px 20-28px"
  button-secondary:
    backgroundColor: "{colors.panel-bg}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.panel-bg}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: The Silkscreen

## Overview

**Creative North Star: "The Silkscreen"**

This is the app's third visual identity, replacing "The Scoreboard" (a matte instrument-bezel world, amber-on-near-black) wholesale rather than extending it. It reinstates "The Silkscreen" — the grounded candidate that was passed over for The Scoreboard at the original direction roll (seed key `444573ff`, candidate 7) — built now at explicit user request, at Arduino.cc/KiCad official-tool craft level. The direction contract is embedded as the first child of `<body>` in `index.html` and survives the build (confirmed present in `dist/index.html`).

The app chrome IS the circuit board the student is coding for. Every panel reads as a populated PCB island: an Arduino-teal soldermask ground (`--bg`, `#062327`), copper/gold plating as the one interactive signal, white silkscreen ink for text, plated mounting-hole corners on auth cards and modals, and a slow teal sweep behind the flat panel layer standing in for the way light catches a real board's surface. Cards carry four literal screw-mount holes at their corners (`radial-gradient` layered rings, ~16px inset, 6px radius) — a device drawn from PCB manufacturing, not a decorative texture. An earlier pass tried a via-grid dot-pattern background as a stand-in for "PCB texture" on `body`; the project's own detector flagged it as a lazy generic-tech cliché and it was removed in favor of the more literal, motivated devices (mounting holes, copper hairlines) that actually exist on a populated board. **Don't reintroduce a decorative dot/grid-line texture as a substitute for PCB material — the mounting holes and copper hairlines carry that job.**

Real through-hole LED colors — amber, red, green — are unchanged from The Scoreboard and are treated as literal component colors soldered to the board, not part of the bezel material that changed. The seven-segment digit module and star-pip LEDs likewise survive the redesign completely as-is: they were re-contextualized, not replaced, because a genuine soldered 7-segment display module is exactly the kind of part a real Arduino kit ships, so it reads as native to this world rather than a leftover from the last one. The simulation canvas (Konva-rendered track, robot, sensors) stays its own fixed, mode-independent palette, unrelated to the app chrome's tokens — that boundary is unchanged from every prior world and survives this one too. This is a classroom tool for Thai mid/high-school robotics students, run by a teacher, so legibility and instant state-reading still come first; the identity expresses through material (soldermask, copper, silkscreen ink), not through obscuring the task.

**Key Characteristics:**
- Deep-teal soldermask ground, always dark — a soldermask board doesn't get a light-mode variant either; `prefers-color-scheme: light` stays unhonored, same commitment as the prior world, now for a materially different reason.
- One interactive signal: copper/gold (`--accent`, `#c9922f`) — buttons, focus rings, selected states, the Run key, the navbar's copper pad mark.
- Amber, red, green stay reserved for LED status meaning (warning glow, live/fail, pass) — literal component colors, never used for an interactive affordance.
- Plated mounting-hole corners on auth cards and the Result Modal — a literal PCB screw-mount detail, drawn via layered `radial-gradient`s, not applied to every surface (see Shapes and Do's and Don'ts for where it does and doesn't apply).
- A small square copper "pad" chip (7×7px, 1px radius) precedes the navbar wordmark — a reference-designator mark, deliberately near-square and smaller than the app's own 2/3/4/5px radius scale; a new micro-step for this one device, not a mistake.
- Every timed/counted value still renders as real 7-segment digits, unchanged in mechanism from before — see Named Rules under Typography.
- Flat by default, with the same single motivated exception as before: the segment-display "glass" is recessed behind an inset shadow, because that's what a real display window looks like set into a housing.

## Colors

Two families: the **app chrome** (soldermask teal + copper, always dark) and the **simulation world** (fixed, mode-independent, canvas-only, unchanged by this redesign).

### Primary
- **Copper Plate** (`--accent`, `#c9922f`): the one interactive signal. The Run key, focus rings, selected level card, primary buttons, active tab underline, the navbar's pad mark and wordmark, mounting-hole ring color. If a screen has two copper elements competing for attention, that's a violation.
- **Copper Plate, hover** (`--accent-hover`, `#e0ac4c`): hover/press shade for anything filled with Copper Plate.
- **On-Copper Ink** (`--on-accent`, `#1a1204`): the only text color ever placed on a copper fill — copper is too light-luminance for white text to clear contrast.

### Status (literal LED colors — carried forward unchanged from The Scoreboard)
- **Live/Fail Red** (`--live` / `--danger`, `#ff3b30`): the blinking "running" dot and the fail/danger state.
- **Pass Green** (`--success`, `#34d058`): lit segment digits and lit star-pips on a passed result.
- **Warning Amber** (`--warning`, default `--segment-lit`, `#ffb020`): default digit glow, warning state. A distinct hue from Copper Plate on purpose — see the Copper-vs-Amber Rule below.

### Neutral
- **Soldermask** (`--bg`, `#062327`): the page background — Arduino-teal ground.
- **Soldermask, sweep endpoint** (`--bg-alt`, `#0a3236`): the second stop of the animated background sweep; same family as `--panel-bg`, stays dark enough that panels always read as the foreground layer.
- **Board Island** (`--panel-bg`, `#0b3236`): cards, modal, navbar, HUD strip.
- **Recessed Via** (`--panel-recessed`, `#041619`): the segment-display housing and mounting-hole centers — darker than the panel it sits in.
- **Copper Hairline** (`--border`, `#1d484c`): every hairline border, teal-tinted rather than neutral gray.
- **Silkscreen Bright** (`--text-h`, `#ffffff`): headings, high-emphasis labels.
- **Silkscreen** (`--text`, `#e9f2ef`): default body/label ink.
- **Silkscreen Dim** (`--text-muted`, `#8fb0ac`): captions, secondary labels, difficulty tags.

### Segment Display
- **Lit Segment** (`--segment-lit`, `#ffb020`): default digit color, a warning-amber LED glow. Overridden per-instance via the `--segment-lit` custom property where a readout needs to read as an outcome — green on the Result Modal's time, red on the HUD's off-track readout once it starts accumulating.
- **Ghost Segment** (`--segment-ghost`, `rgba(233,242,239,0.08)`): the always-visible unlit cell. Also reused as the unlit fill for `StarPips`.

### Simulation World (canvas-only, unchanged by the redesign)
Robot Blue (`#4c6ef5`), Heading Yellow (`#ffd43b`), IR Pink (`#e64980`), Ultrasonic Cyan (`#15aabf`), Color-Sensor Orange (`#f08c00`), Track Black (`#2b2b2b`), Obstacle Slate (`#495057`), Finish Green (`#40c057` ~20%).

### Named Rules
**The Copper-vs-Amber Rule.** Copper (`--accent`, `#c9922f`) and Amber (`--warning`/default `--segment-lit`, `#ffb020`) are two distinct hues with two distinct jobs, never interchangeable. Copper is plated metal — it means "press me" or "this is selected." Amber is a lit LED — it means "this is a status, a warning, a default glow." Never use copper for a status readout and never use amber for an interactive affordance.
**The One Signal Rule.** Copper Plate marks exactly one focal thing per view — the active tab, the selected card, the primary/Run action. It never doubles as decoration.
**The No-Light-Mode Rule.** This world commits to dark only. A soldermask board doesn't change color with the room; do not add a `prefers-color-scheme: light` branch.

## Typography

**Body/Heading Font:** `Kanit, system-ui, 'Segoe UI', Roboto, sans-serif` — one face for both Latin and Thai UI text (Kanit covers both scripts), used everywhere including `h1`/`h2`/`h3`. Unchanged by this redesign; no font swap was made.
**Body/Heading Font (Thai/`lang=th`):** `'Kanit', 'Leelawadee UI', 'Noto Sans Thai', Tahoma, system-ui, sans-serif` — same family, Thai-capable fallbacks appended; see the Lang-Follows-Language Rule below.
**Code/Mono Font:** `ui-monospace, Consolas, 'Leelawadee UI', 'Noto Sans Thai', monospace`
**Numeral system:** 7-segment cells (`SevenSegmentDisplay`), not a font at all — CSS `clip-path` shapes, so it costs no network request and stays crisp at any size.

**Character:** Kanit for everything read as prose — headings included; monospace is not a costume for a "technical-feeling" title. Mono stays reserved for what it was always for: code, console, IDs, and short data-style labels (level/team names, HUD field labels, the navbar wordmark). Segment cells render anything that's a number the product is timing or counting.

### Hierarchy
- **Heading** (Kanit, 600, 18–20px): modal titles, page titles, section headers.
- **Body** (Kanit, 400, 15px, 1.45 line-height): the root font; default paragraph and control text.
- **Meta** (Kanit, 400, 14px): subtitles, nav status, modal timestamps.
- **Label** (Kanit, 700, 11px, uppercase): difficulty placards, tab labels, small captions.
- **Mono** (400, 12–14px): code editor, console, level-card names, the Run-controls key legends, the navbar wordmark.
- **Segment** (variable `size` px): elapsed/off-track HUD readouts (18px), Result Modal time (26px), level-card best time (12px), leaderboard star/levels-passed tallies (14px).

### Named Rule: The Lang-Follows-Language Rule
`<html lang>` is kept in sync with the language toggle at all times (`src/App.tsx`, a `useLayoutEffect` on `useLanguageStore`) — Thai body line-height steps up to `1.7` only via `:lang(th)` selectors in `src/index.css`, which only match when `lang` is correct. Independent of visual world — this rule survives any future redesign.

### Named Rule: The No-Decoration Mono Rule
Monospace appears only where the content genuinely is code, console output, an ID, or a short data-style label (level/team name, HUD field label, the navbar wordmark) — never as a stylistic flourish on ordinary UI prose or headings.

## Layout

Unchanged in structure by the redesign: the three-column app shell (`AppShell`) — narrow left island (levels/sensors/level-editor tabs), center simulation stage (the test bench), right island (code editor + console) — separated by `1px solid var(--border)` copper hairlines only. On the run screen this reads as a three-island board: level/config, simulation canvas, and code+console, each its own populated PCB island bordered by the same hairline. Compact, information-dense (13–15px body, 8–16px padding) to fit a lesson's toolkit on one screen. Auth/onboarding screens break into a single centered card, `max-width 360–720px`, `padding 24–32px`.

## Elevation & Depth

**Flat by default, with one motivated exception.** No ambient shadow on cards, buttons, panels, or the modal — depth is border and fill contrast. The one exception, the only `box-shadow` in the shipped stylesheet: `SevenSegmentDisplay`'s housing (`--panel-recessed`) carries `box-shadow: inset 0 2px 6px rgba(0,0,0,0.6)` — a recessed-glass cue, because a real segment display sits behind a dark window in its housing, not flush with it. A specific, singular device tied to one component, not a general license for shadows.

The page background carries a slow diagonal teal sweep (`boardSweep`, 20s ease-in-out, `linear-gradient(160deg, --bg, --bg-alt, --bg)` at 220% background-size) behind the flat panel layer — panels stay solid `--panel-bg` on top, unaffected by the sweep, per the Flat-By-Default Rule. Motion elsewhere stays the vocabulary established before this redesign — scale + `cubic-bezier(0.16, 1, 0.3, 1)`, 60–350ms, for buttons/cards/modal chrome — with numeric content still never tweening: a `SevenSegmentDisplay` value change is an instant segment swap, no morph, no count-up.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit flush with their background at rest — shadows are reserved for the one recessed-glass exception above, nowhere else. The board sweep lives on `body` only, never on a panel surface.
**The Instant-Segment Rule.** Numeric readouts (`SevenSegmentDisplay`) never animate their own value change — no easing, no count-up. Everything else may still use the shared motion vocabulary.
**The One Motion Vocabulary Rule.** Tactile chrome (buttons, cards, modal, tabs) reuses one set of values: scale, `cubic-bezier(0.16, 1, 0.3, 1)`, 60–350ms, `--accent-hover` for the pressed state.

## Shapes

Corner radius scales with a surface's size on the same four fixed steps as before this redesign — a milled panel edge, not a soft card:
- **2px** — the difficulty placard tag.
- **3px** — small controls: run/pause/step/reset keys, tabs' container, nav buttons, auth cards, the Result Modal panel itself.
- **4px** — inputs, primary/secondary submit buttons, level cards, the Result Modal's retry button, medium admin rows.
- **5px** — display cards: sensor catalog cards, profile stat cards, sensor configurator rows.
- **1px** — the navbar's copper pad mark (`.logo::before`, 7×7px) — a new, deliberately near-square micro-step added for this redesign, one size below the 2px placard step, sized for this one small device only. Do not reuse 1px elsewhere; it belongs to the pad mark.

Segment-display housing and star/status pips use proportional/circular radii tied to their own size, not this fixed scale. The robot sprite's chassis keeps its own 6px corner radius at simulation scale (Konva `Rect cornerRadius={6}`, canvas world, unaffected by chrome).

**Plated mounting holes** (auth cards, the Result Modal) are the redesign's signature form device: four layered `radial-gradient` corner rings (`--panel-recessed` center, `--accent` ring, ~16px inset, 6px radius), literal PCB screw-mounts. They appear on the two surfaces that read as discrete, removable boards (login/onboarding cards, the result modal) — not on every panel; the three-island run-screen shell uses copper hairline borders instead, per Layout, because those islands read as soldered-in-place, not socketed.

## Components

### Buttons
- **Shape:** 3px (compact controls) or 4px (form submits/level-card-scale actions), never pill-shaped.
- **Primary** (login/onboarding submit, `Try Again`, the **Run** key): solid `--accent` fill, `--on-accent` text (never white), weight 600–700, `padding: 10px 20–28px`. Hover shifts to `--accent-hover` + `scale(1.02–1.03)`; `:active` compresses to `scale(0.96–0.98)` over 60ms; `:focus-visible` gets a 2px accent outline.
- **Secondary/Ghost** (other run controls, nav actions, admin actions, level-card/tab selection): `--panel-bg` fill, `1px solid var(--border)`, `--text-h` text, uppercase mono-weight label. Hover swaps the border to `--accent` — no background fill. `:active` compresses to `scale(0.94–0.98)`; same focus outline as primary.
- **Disabled:** `opacity: 0.4–0.5`, `cursor: not-allowed`.

### Seven-Segment Display (signature component — the board's soldered timer module)
`src/components/common/SevenSegmentDisplay.tsx` — a CSS `clip-path` digit cell inside a recessed housing (`--panel-recessed` + the system's only `box-shadow`). Every cell shows its ghost ring even when unlit. `size` scales the cell proportionally (12–14px on level cards/leaderboards, 18px on the HUD, 24px on profile stats, 26px on the Result Modal). Color defaults to `--segment-lit`; override per-instance via the `--segment-lit` custom property to recolor for context (green for a pass, red for an accumulating off-track warning). Used for every timed/counted value app-wide. Kept fully unchanged through this redesign — a real Arduino kit genuinely ships a 7-segment module, so this device re-contextualizes as a literally soldered part of the board rather than a leftover instrument-bezel motif.

### Star Pips (signature component)
`src/components/common/StarPips.tsx` — `lit`/`total` lit-or-ghost LED pip circles (`--success` when lit, `--segment-ghost` when not), flat fill only, no glow, no inset. Used on level cards, the Result Modal, and the level leaderboard table. Kept unchanged through this redesign.

### Cards
- **Corner Style:** 4px for the level-select card, 5px for display cards (sensor catalog, profile stats).
- **Background:** `--panel-bg`, `1px solid var(--border)`.
- **Selected state:** border switches to `--accent`, background washes to `--accent-bg` — the one selection idiom system-wide, unchanged by this redesign.
- **Level card:** difficulty renders as a small bordered tag (2px radius, uppercase, `--text-muted`); a completed run shows 3 star-pips plus a small `SevenSegmentDisplay` best time; an incomplete level shows plain "not completed" text rather than a fake `00.0`.

### Result Modal ("board flash")
Dark scrim (`rgba(0,0,0,0.7)`), 3px-radius panel with the plated mounting-hole treatment (see Shapes) on `--panel-bg`, `1px solid var(--border)`. Title renders in the standard heading style, `--success`/`--danger` colored. On a pass: 3 star-pips + a labeled `SevenSegmentDisplay` (26px, recolored green via `--segment-lit: var(--success)`). On a fail: the specific reason (off-track/collision/timeout) in muted meta text. The `Try Again` button (4px radius, `1px solid var(--accent-hover)`) pops in as the resolving beat after pips/time settle.

### HUD (instrument strip)
`SimHud` — a `--panel-bg` strip along the run screen with a copper hairline top border. Status shows a blinking red live-dot while running plus success/danger-colored status text on pass/fail. Elapsed and off-track each render as a labeled `SevenSegmentDisplay` (18px); the off-track readout recolors to `--danger` once it starts accumulating.

### Navigation
- **Navbar:** `--panel-bg` bar, `1px solid var(--border)` bottom edge, uppercase copper-colored wordmark (16px) preceded by a small square copper pad mark (`.logo::before`, 7×7px, 1px radius — see Shapes). 14px muted links darkening to `--text-h` on hover.
- **Tabs:** underline style — `2px solid transparent` bottom border becoming `--accent` when active; label color shifts `--text-muted` → `--text-h` on hover/active.

### Inputs
- **Style:** `--bg` fill, `1px solid var(--border)`, 4px radius.
- **Focus:** `2px solid var(--accent)` outline, `2px` offset — no glow, no shadow.
- **Signature variant — the digit ID field:** 32px mono text, `12px` letter-spacing, center-aligned; shakes and reddens briefly (`--danger` border) on a rejected admin login.

## Do's and Don'ts

### Do:
- **Do** render every timed/counted value through `SevenSegmentDisplay` — never plain text for a number the product is timing.
- **Do** keep numeric value changes instant, no easing (the Instant-Segment Rule).
- **Do** keep Copper Plate to one focal element per screen (the One Signal Rule), and keep it distinct from Warning Amber (the Copper-vs-Amber Rule).
- **Do** use `--on-accent` for any text placed on a copper fill — never white.
- **Do** reserve the plated mounting-hole corner treatment for standalone/removable-feeling surfaces (auth cards, the Result Modal) — use copper hairline borders for the run screen's soldered-in-place islands instead.
- **Do** scale radius with a surface's size on the confirmed 2/3/4/5px steps, plus the 1px micro-step reserved for the navbar pad mark only.
- **Do** keep the simulation canvas's palette self-contained and independent of the app chrome's tokens.
- **Do** keep `document.documentElement.lang` in sync with `useLanguageStore` (the Lang-Follows-Language Rule).

### Don't:
- **Don't** add a `prefers-color-scheme: light` branch back (the No-Light-Mode Rule) — a soldermask board is dark by identity, not by omission.
- **Don't** add `box-shadow` anywhere except the segment-display recessed-glass exception.
- **Don't** use Copper Plate for a status/warning meaning, or Warning Amber for an interactive affordance (the Copper-vs-Amber Rule).
- **Don't** put white text on a copper fill — use `--on-accent`.
- **Don't** add a decorative dot/grid-line "via" texture as a stand-in for PCB texture — this was tried during the build, flagged by the project's own defect detector as a generic tech cliché, and removed. Mounting holes and copper hairlines carry that job literally; a texture overlay doesn't.
- **Don't** use monospace decoratively on prose or headings.
- **Don't** let the simulation canvas's sensor/robot colors bleed into app-chrome UI, or vice versa.
- **Don't** animate a `SevenSegmentDisplay` value with a tween/count-up — it must jump.
- **Don't** apply Latin type-ramp assumptions (line-height, tracking) to Thai copy unexamined.
