// World-space units are pixels. This constant is the only place cm<->px conversion happens,
// so ultrasonic readings (reported in cm, matching real Arduino code) stay consistent everywhere.
export const PX_PER_CM = 4

export const ROBOT_RADIUS_PX = 40
export const ROBOT_WHEEL_BASE_PX = 60

export const LINE_HALF_WIDTH_PX = 8
export const IR_SENSE_RADIUS_PX = 20

export const ULTRASONIC_MAX_RANGE_CM = 200

export const MAX_OFF_TRACK_MS_BEFORE_FAIL = 3000

export const IR_ROW_SPACING_PX = 12

/** Scales Arduino-style PWM motor arguments (-255..255) into px/s for the physics engine. */
export const MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT = 0.6

/** Upper bound on interpreter statements executed per animation frame — keeps the tab responsive. */
export const MAX_STATEMENTS_PER_FRAME = 2000

// Level Editor defaults
export const EDITOR_OBSTACLE_RADIUS_PX = 24
export const EDITOR_COLOR_ZONE_RADIUS_PX = 20
export const EDITOR_FINISH_RADIUS_PX = 24
export const EDITOR_ERASE_HIT_RADIUS_PX = 16
export const EDITOR_CANVAS_WIDTH_PX = 800
export const EDITOR_CANVAS_HEIGHT_PX = 500

// The editor lives in the ~280px left sidebar, so it renders at a scaled-down display size while
// trackPath/obstacles/etc stay in full EDITOR_CANVAS_WIDTH_PX x EDITOR_CANVAS_HEIGHT_PX world
// coordinates — the same coordinates the level plays back at full size in the center panel.
export const EDITOR_DISPLAY_WIDTH_PX = 248
export const EDITOR_DISPLAY_HEIGHT_PX = Math.round(
  (EDITOR_DISPLAY_WIDTH_PX / EDITOR_CANVAS_WIDTH_PX) * EDITOR_CANVAS_HEIGHT_PX,
)
