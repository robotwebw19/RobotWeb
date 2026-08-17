export interface Vector2 {
  x: number
  y: number
}

export type SensorType = 'ir' | 'ultrasonic' | 'color'

export interface SensorConfig {
  /** Stable id for this sensor instance within a robot (not the Arduino pin). */
  id: string
  type: SensorType
  /** Arduino pin this sensor is wired to, e.g. "A0", "D2". Must be unique per robot. For an
   * ultrasonic sensor this is the Trig (output) pin (see `echoPin`); for a color sensor this is
   * the OUT (frequency output) pin (see `s0Pin`-`s3Pin`). */
  pin: string
  /**
   * Offset from the robot's center, in world units, robot-local frame at heading 0:
   * +x is straight ahead, +y is to the robot's right. Rotated by the robot's current
   * heading (see sim/math/vector2.ts `rotate`) to get a world-space position.
   */
  position: Vector2
  /** Ultrasonic sensors only: the Echo (input) pin, wired alongside `pin` (Trig) — a real
   * HC-SR04 needs both, `pulseIn(echoPin, HIGH)` after triggering `pin`. */
  echoPin?: string
  /** Color sensors only: a real TCS230/TCS3200's frequency-scaling select pins — wired for
   * realism (typically set once in setup(), e.g. S0=HIGH/S1=LOW), not read by the simulator. */
  s0Pin?: string
  s1Pin?: string
  /** Color sensors only: the filter-select pins — S2/S3 choose which color's photodiode `pin`
   * (OUT) reports: LOW/LOW=red, HIGH/HIGH=green, LOW/HIGH=blue, HIGH/LOW=clear (unfiltered). */
  s2Pin?: string
  s3Pin?: string
  /** Ultrasonic sensors only: beam direction offset from robot heading, in degrees. */
  mountAngleDeg?: number
}

export type MotorSide = 'left' | 'right'

export interface MotorConfig {
  /** Stable id for this motor instance within a robot (not the Arduino pin). */
  id: string
  side: MotorSide
  /** Real L298N control pins for this motor, fixed 1:1 with `side`: IN1/IN2 pick direction
   * (digitalWrite HIGH/LOW — one HIGH one LOW drives, matching values stop/brake), enablePin
   * sets speed magnitude (analogWrite 0-255 PWM). */
  in1Pin: string
  in2Pin: string
  enablePin: string
  /** Offset from the robot's center, robot-local frame — see SensorConfig.position. */
  position: Vector2
}

export interface RobotConfig {
  sensors: SensorConfig[]
  motors: MotorConfig[]
}

export type StudentPrefix = 'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว'

export interface User {
  studentId: string
  /** Full name for display, derived from prefix + firstName + lastName at onboarding time. */
  displayName: string
  prefix: StudentPrefix
  firstName: string
  lastName: string
  /** e.g. "ม.1" .. "ม.6" */
  grade: string
  classroom: string
  studentNumber: string
  robotConfig: RobotConfig
  createdAt: string
}

export type ColorZoneColor = 'red' | 'green' | 'blue' | 'black' | 'white'

export interface Obstacle {
  x: number
  y: number
  radius: number
}

export interface ColorZone {
  x: number
  y: number
  radius: number
  color: ColorZoneColor
}

export interface StartPosition {
  x: number
  y: number
  headingDeg: number
}

export interface FinishZone {
  x: number
  y: number
  radius: number
}

export interface ParConditions {
  /** Finishing at or under this time earns 3 stars (if offTrackEvents allowance also met). */
  threeStarTimeMs: number
  /** Finishing at or under this time earns 2 stars. Anything slower (but passing) earns 1 star. */
  twoStarTimeMs: number
  /** Max off-track events still eligible for 3 stars. */
  maxOffTrackEventsForThreeStars: number
}

export type LevelDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

export interface Level {
  id: string
  name: string
  difficulty: LevelDifficulty
  /** Track line(s), each an ordered polyline of world-space points. Disjoint arrays = gaps. */
  trackPath: Vector2[][]
  obstacles: Obstacle[]
  colorZones: ColorZone[]
  startPosition: StartPosition
  finishZone: FinishZone
  /** World-space Y splitting this track into two reflectance polarities — a real digital line
   * sensor has a fixed light/dark threshold, so if the line/ground colors swap, the digitalRead
   * bit that means "on the line" swaps too. Points with y < this stay normal (black line/white
   * ground, matching every other level); y >= this are inverted (white line/black ground).
   * Undefined = no inversion. See sim/engine/SensorSampling.ts sampleIrDigital. */
  lineInversionBoundaryY?: number
  timeLimitMs: number
  parConditions: ParConditions
  /** studentId of the creator, or undefined for built-in seed levels. */
  createdBy?: string
  /** Reference solving code, visible to admins only (see components/admin). */
  solutionCode?: string
  /** Sensors/motors + pins the solutionCode assumes, shown alongside it in the admin panel. */
  requiredEquipment?: RequiredEquipmentItem[]
}

export type RequiredEquipmentItem =
  | {
      kind: 'sensor'
      type: SensorType
      pin: string
      echoPin?: string
      s0Pin?: string
      s1Pin?: string
      s2Pin?: string
      s3Pin?: string
    }
  | { kind: 'motor'; side: MotorSide; in1Pin: string; in2Pin: string; enablePin: string }

export interface UserCode {
  studentId: string
  levelId: string
  sourceCode: string
  updatedAt: string
}

export interface LevelResult {
  studentId: string
  levelId: string
  completionTimeMs: number
  stars: 0 | 1 | 2 | 3
  passed: boolean
  submittedAt: string
}
