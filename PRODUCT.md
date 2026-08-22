# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mid/high-school students ("นักเรียนมัธยม") in a robotics/coding classroom, teacher-led. Students sign in with a school-issued 5-digit student ID (no password); the teacher runs the session and separately signs in as admin via username to manage the class.

## Product Purpose

Teach students to program a line-following robot using real Arduino-style code, inside a free, safe, browser-only simulation — no physical robot required to learn or practice. Instant pass/fail feedback and a star rating (based on completion time and how cleanly the robot stayed on track) let students iterate quickly during a lesson.

## Positioning

Unlike block-based robotics teaching tools (Scratch-style drag-and-drop), students write actual C/Arduino-subset syntax — `pinMode`, `digitalRead`, `setMotorSpeed`, `delay`, sensor reads, etc. — run through a real custom lexer/parser/interpreter against a physics-based simulation (differential-drive motion, IR/ultrasonic sensors, obstacles, color zones). The skills and code students write are meant to transfer directly to programming a real Arduino-based robot later.

## Operating Context

Classroom session, teacher-led, students on shared classroom computers/browsers. School internet can be unreliable — the Monaco editor's loader setup is explicitly commented for "offline/classroom reliability." Admin (teacher) has a separate login and dashboard to view/manage the student roster and built-in levels (including their reference solution code, hidden from students). Students onboard on first login by picking a display name and configuring their robot's sensors/motors within a cost budget, then move between: level select, a sensor/motor configurator, a Level Editor (also available to students, for painting custom tracks/obstacles/color zones and exporting/importing them), and the main run screen (Monaco code editor + Konva simulation canvas + run controls + console).

## Capabilities and Constraints

- Custom Arduino-subset interpreter (lexer, parser, runtime) executes student code statement-by-statement against a ticked physics simulation.
- Sensors: IR (digital or analog), ultrasonic — each with a configurable mount position/pin. Motors: left/right, differential drive.
- Sensor/motor "budget" economy (`SENSOR_BUDGET_CREDITS`): students pick and place equipment within a cost limit before coding, mirroring real component tradeoffs.
- 5 built-in levels (straight line, curve, multi-way junction, gapped line, color-zone response), each with an admin-only reference solution and 1–3 star par times/off-track tolerances.
- Pass/fail causes: reaching the finish zone (robot body overlap, not just center point), going off-track too long, colliding with an obstacle, or running out of time.
- Leaderboard (per-level and global) and a Profile page (levels passed, total stars) for motivation.
- Thai and English UI via a toggle; Thai is used throughout as the primary classroom language (including in-code comments students see in reference solutions).
- No confirmed constraint requiring full offline operation or support for a specific physical robot kit — free to adjust as the product evolves.

## Brand Commitments

None confirmed. Current working title in the UI is "Line Tracking Robot Simulator" (package name `robot-arm-web`); no logo, fixed voice, or naming commitment is locked in yet.

## Evidence on Hand

No real student data, school name, or testimonials on record — the running application (levels, interpreter behavior, existing UI copy) is the only evidence available. Do not invent school names, student quotes, usage numbers, or a specific hardware kit this pairs with.

## Product Principles

1. Real syntax over shortcuts — code students write should look and behave like real Arduino C, not a simplified DSL, so the skill transfers to physical hardware.
2. Instant, legible feedback — pass/fail, stars, and the specific failure reason (off-track / collision / timeout) must read clearly at classroom pace.
3. Low-stakes iteration — simulation removes hardware cost and risk so students can fail and retry freely, as many times as a lesson allows.
4. Teacher stays in control — admin can see the roster, manage levels, and view reference solutions without ever exposing solutions to students.
5. Thai-first, bilingual — Thai is the primary classroom language; the English toggle stays available and equally functional.

## Accessibility & Inclusion

No specific standard confirmed. Classroom use implies a range of device/monitor sizes and skill levels; no accessibility requirement beyond that has been established yet.
