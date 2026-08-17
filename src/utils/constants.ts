// World-space units are pixels. This constant is the only place cm<->px conversion happens,
// so ultrasonic readings (reported in cm, matching real Arduino code) stay consistent everywhere.
export const PX_PER_CM = 4

export const ROBOT_RADIUS_PX = 40
export const ROBOT_WHEEL_BASE_PX = 60

export const LINE_HALF_WIDTH_PX = 8

export const ULTRASONIC_MAX_RANGE_CM = 200

/** Speed of sound, cm per microsecond (0.0343 cm/µs ≈ 343 m/s at room temperature) — the real
 * HC-SR04 constant, used to convert a physics distance reading into the pulseIn() duration a
 * student's own code measures, and back. */
export const SPEED_OF_SOUND_CM_PER_US = 0.0343

/** TCS230-style color read: the channel matching the surface's true color pulses fast (a short
 * pulseIn() duration — strong signal); the other two channels pulse slow. Real hardware values
 * vary with lighting/calibration; these are representative round numbers for a two-threshold
 * classroom read, the same way real TCS230 tutorials tell students to calibrate their own. */
export const COLOR_CHANNEL_STRONG_PULSE_US = 50
export const COLOR_CHANNEL_WEAK_PULSE_US = 600

export const MAX_OFF_TRACK_MS_BEFORE_FAIL = 1000

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
