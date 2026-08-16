import type { Obstacle } from '../../types/domain'
import type { Pose } from './RobotPhysics'

/** Robot and obstacles are both treated as circles for collision purposes (documented simplification). */
export function findCollidingObstacle(pose: Pose, robotRadius: number, obstacles: Obstacle[]): Obstacle | null {
  for (const obstacle of obstacles) {
    const dx = pose.x - obstacle.x
    const dy = pose.y - obstacle.y
    if (Math.hypot(dx, dy) <= robotRadius + obstacle.radius) {
      return obstacle
    }
  }
  return null
}
