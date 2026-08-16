export interface Vector2 {
  x: number
  y: number
}

export type SensorType = 'ir' | 'ultrasonic' | 'color'

export type IrMode = 'digital' | 'analog'

export interface SensorConfig {
  /** Stable id for this sensor instance within a robot (not the Arduino pin). */
  id: string
  type: SensorType
  /** Arduino pin this sensor is wired to, e.g. "A0", "D2". Must be unique per robot. */
  pin: string
  /**
   * Offset from the robot's center, in world units, robot-local frame at heading 0:
   * +x is straight ahead, +y is to the robot's right. Rotated by the robot's current
   * heading (see sim/math/vector2.ts `rotate`) to get a world-space position.
   */
  position: Vector2
  /** IR sensors only: digital (0/1) vs analog (0-1023 reflectance) reading mode. */
  irMode?: IrMode
  /** Ultrasonic sensors only: beam direction offset from robot heading, in degrees. */
  mountAngleDeg?: number
}

export type MotorSide = 'left' | 'right'

export interface MotorConfig {
  /** Stable id for this motor instance within a robot (not the Arduino pin). */
  id: string
  side: MotorSide
  /** Arduino pin this motor's driver is wired to, e.g. "M1". Fixed 1:1 with `side`. */
  pin: string
  /** Offset from the robot's center, robot-local frame — see SensorConfig.position. */
  position: Vector2
}

export interface RobotConfig {
  name: string
  sensors: SensorConfig[]
  motors: MotorConfig[]
}

export interface User {
  studentId: string
  displayName: string
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
  | { kind: 'sensor'; type: SensorType; pin: string; irMode?: IrMode }
  | { kind: 'motor'; side: MotorSide; pin: string }

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
