import { degToRad, normalizeAngleDeg, radToDeg } from '../math/vector2'

export interface Pose {
  x: number
  y: number
  headingDeg: number
}

/**
 * Differential-drive (tank drive) kinematics, Euler-integrated over one tick.
 * `leftSpeed`/`rightSpeed` are in px/s along each wheel's own travel direction;
 * `wheelBase` is the px distance between the two wheels.
 *
 * heading convention: 0deg points along +x, increasing angle rotates toward +y
 * (clockwise in standard screen/canvas space, where +y points down).
 */
export function stepPose(
  pose: Pose,
  leftSpeed: number,
  rightSpeed: number,
  wheelBase: number,
  dtSeconds: number,
): Pose {
  const linearVelocity = (leftSpeed + rightSpeed) / 2
  const angularVelocityRad = (rightSpeed - leftSpeed) / wheelBase

  const headingRad = degToRad(pose.headingDeg)
  const newHeadingDeg = normalizeAngleDeg(pose.headingDeg + radToDeg(angularVelocityRad) * dtSeconds)

  return {
    x: pose.x + linearVelocity * Math.cos(headingRad) * dtSeconds,
    y: pose.y + linearVelocity * Math.sin(headingRad) * dtSeconds,
    headingDeg: newHeadingDeg,
  }
}
