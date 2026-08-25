import { useRef } from 'react'
import { Circle, Group, Rect, Wedge } from 'react-konva'
import type { SensorConfig } from '../../types/domain'
import type { Pose } from '../../sim/engine/RobotPhysics'
import type { SensorReading } from '../../sim/engine/SensorSampling'
import { sensorWorldPosition } from '../../sim/engine/SensorSampling'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'
import { PX_PER_CM, ULTRASONIC_MAX_RANGE_CM } from '../../utils/constants'

/** HC-SR04's documented ~15° measuring angle, drawn a bit wide (full cone) so it reads clearly at UI scale. */
const ULTRASONIC_BEAM_ANGLE_DEG = 30

interface SensorOverlayProps {
  pose: Pose
  sensors: SensorConfig[]
  sensorReadings?: Record<string, SensorReading>
  viewport?: Viewport
}

/** Whether a sensor is currently picking something up — drives the "detecting" glow. */
function isDetecting(sensor: SensorConfig, reading: SensorReading | undefined): boolean {
  if (reading === undefined) return false
  if (sensor.type === 'ir') {
    return reading === 1
  }
  return reading <= ULTRASONIC_MAX_RANGE_CM * 0.25
}

/**
 * Stylized reflectance-module body (TCRT5000-style breakout: PCB + emitter/receiver lens pair +
 * status LED) instead of a bare dot, so the IR sensor reads as real hardware bolted to the
 * chassis rather than an abstract marker. Drawn in the module's own local frame — lens pair runs
 * along local y (perpendicular to travel) since the caller rotates the whole Group to heading.
 */
function IrModule({ scale, active, pulse }: { scale: number; active: boolean; pulse: number }) {
  const pcbThick = 5.5 * scale
  const pcbLen = 9 * scale
  const lensRadius = 1.6 * scale
  const lensOffset = pcbLen * 0.27
  const ledRadius = 0.7 * scale

  return (
    <Group>
      {active && (
        // Soft radial spill standing in for the (invisible) IR beam actually reflecting off the
        // ground — a real center-to-edge falloff reads as light hitting a surface, not a flat tinted disc.
        // Two layers: a wide faint halo for reach, a tighter brighter core near the module.
        <>
          <Circle
            radius={lensRadius * (9 + pulse * 2.5)}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={lensRadius * (9 + pulse * 2.5)}
            fillRadialGradientColorStops={[
              0,
              `rgba(255,60,40,${0.32 - pulse * 0.08})`,
              0.4,
              `rgba(255,60,40,${0.14 - pulse * 0.04})`,
              1,
              'rgba(255,60,40,0)',
            ]}
            listening={false}
          />
          <Circle
            radius={lensRadius * (3.4 + pulse * 1.1)}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={lensRadius * (3.4 + pulse * 1.1)}
            fillRadialGradientColorStops={[
              0,
              `rgba(255,60,40,${0.55 - pulse * 0.15})`,
              0.5,
              `rgba(255,60,40,${0.22 - pulse * 0.08})`,
              1,
              'rgba(255,60,40,0)',
            ]}
            listening={false}
          />
        </>
      )}
      {/* PCB */}
      <Rect
        x={-pcbThick / 2}
        y={-pcbLen / 2}
        width={pcbThick}
        height={pcbLen}
        cornerRadius={0.8 * scale}
        fill="#0f6b3a"
        stroke="#083f22"
        strokeWidth={0.4 * scale}
      />
      <Rect
        x={-pcbThick / 2}
        y={-pcbLen / 2}
        width={pcbThick}
        height={pcbLen}
        cornerRadius={0.8 * scale}
        fillLinearGradientStartPoint={{ x: -pcbThick / 2, y: -pcbLen / 2 }}
        fillLinearGradientEndPoint={{ x: pcbThick / 2, y: pcbLen / 2 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.3)', 0.55, 'rgba(255,255,255,0)', 1, 'rgba(0,0,0,0.3)']}
        listening={false}
      />
      {/* Emitter lens — lights up red while actually emitting, dim clear/bluish dome when idle. */}
      <Circle
        y={-lensOffset}
        radius={lensRadius}
        fill={active ? '#ff4d3d' : '#4a5a8a'}
        stroke={active ? '#8f1a10' : '#1c2340'}
        strokeWidth={0.35 * scale}
        shadowColor="#ff2d2d"
        shadowBlur={active ? lensRadius * 2.2 : 0}
        shadowOpacity={active ? 0.85 : 0}
      />
      <Circle y={-lensOffset} radius={lensRadius * 0.45} fill="rgba(255,255,255,0.5)" listening={false} />
      {/* Receiver lens (dark phototransistor) */}
      <Circle y={lensOffset} radius={lensRadius} fill="#151515" stroke="#000000" strokeWidth={0.35 * scale} />
      <Circle y={lensOffset} radius={lensRadius * 0.4} fill="rgba(255,255,255,0.15)" listening={false} />
      {/* Status LED */}
      <Circle
        x={pcbThick / 2 - ledRadius * 1.2}
        y={0}
        radius={ledRadius}
        fill={active ? '#ff2d2d' : '#5a1414'}
        shadowColor="#ff2d2d"
        shadowBlur={active ? ledRadius * 3 : 0}
        shadowOpacity={active ? 0.9 : 0}
        listening={false}
      />
    </Group>
  )
}

/**
 * Stylized ultrasonic-module body (HC-SR04-style breakout: PCB + twin transducer cups) instead of
 * a bare dot. Cups sit side-by-side along local y, both opening along local +x (forward) — the
 * caller rotates the whole Group to pose.headingDeg + mountAngleDeg, the same heading
 * SensorSampling.ts uses to actually cast the beam — so the module visually looks the way it
 * measures. The beam cone reaches exactly as far as the current reading (capped at sensor max
 * range), not a fixed glow radius, so it reads as the sensor's real detection range.
 */
function UltrasonicModule({
  scale,
  active,
  pulse,
  rangePx,
}: {
  scale: number
  active: boolean
  pulse: number
  /** Current reading distance in stage px (worldToStage-scaled), capped at the sensor's max range. */
  rangePx: number
}) {
  const pcbWidth = 10 * scale // local y — spans the two cups side by side
  const pcbDepth = 6 * scale // local x — forward/back
  const cupRadius = 2.1 * scale
  const cupOffset = pcbWidth * 0.28
  const ledRadius = 0.7 * scale
  const halfBeamAngle = ULTRASONIC_BEAM_ANGLE_DEG / 2

  function Cup({ y }: { y: number }) {
    return (
      <Group y={y}>
        <Circle radius={cupRadius} fill="#8a939b" stroke="#4a5157" strokeWidth={0.35 * scale} />
        <Circle radius={cupRadius * 0.72} fill="#5f676d" stroke="#3a4046" strokeWidth={0.25 * scale} />
        <Circle radius={cupRadius * 0.4} fill={active ? '#15aabf' : '#2b3236'} />
        <Circle radius={cupRadius * 0.18} fill="rgba(255,255,255,0.4)" listening={false} />
      </Group>
    )
  }

  return (
    <Group>
      {/* Forward-facing detection cone, centered on local +x (the beam heading the caller rotated
          us to) — always shown at the real measured range, brighter/pulsing while actively close. */}
      <Wedge
        radius={rangePx}
        angle={ULTRASONIC_BEAM_ANGLE_DEG}
        rotation={-halfBeamAngle}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={rangePx}
        fillRadialGradientColorStops={
          active
            ? [0, `rgba(21,170,191,${0.5 - pulse * 0.15})`, 0.6, `rgba(21,170,191,${0.2 - pulse * 0.06})`, 1, 'rgba(21,170,191,0)']
            : [0, 'rgba(21,170,191,0.14)', 0.6, 'rgba(21,170,191,0.05)', 1, 'rgba(21,170,191,0)']
        }
        listening={false}
      />
      {/* PCB */}
      <Rect
        x={-pcbDepth / 2}
        y={-pcbWidth / 2}
        width={pcbDepth}
        height={pcbWidth}
        cornerRadius={0.8 * scale}
        fill="#1c1f26"
        stroke="#0a0c10"
        strokeWidth={0.4 * scale}
      />
      <Rect
        x={-pcbDepth / 2}
        y={-pcbWidth / 2}
        width={pcbDepth}
        height={pcbWidth}
        cornerRadius={0.8 * scale}
        fillLinearGradientStartPoint={{ x: -pcbDepth / 2, y: -pcbWidth / 2 }}
        fillLinearGradientEndPoint={{ x: pcbDepth / 2, y: pcbWidth / 2 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.25)', 0.55, 'rgba(255,255,255,0)', 1, 'rgba(0,0,0,0.3)']}
        listening={false}
      />
      <Cup y={-cupOffset} />
      <Cup y={cupOffset} />
      {/* Status LED, tucked at the back edge */}
      <Circle
        x={-pcbDepth / 2 + ledRadius * 1.2}
        y={0}
        radius={ledRadius}
        fill={active ? '#15aabf' : '#153238'}
        shadowColor="#15aabf"
        shadowBlur={active ? ledRadius * 3 : 0}
        shadowOpacity={active ? 0.9 : 0}
        listening={false}
      />
    </Group>
  )
}

export function SensorOverlay({ pose, sensors, sensorReadings = {}, viewport = defaultViewport }: SensorOverlayProps) {
  // A free-running clock (real elapsed time, accumulated across renders) drives the pulsing glow.
  // SensorOverlay re-renders every physics tick while running, so this animates during a run and
  // simply stops advancing once paused/idle.
  const clockRef = useRef({ seconds: 0, lastTimeMs: null as number | null })
  const now = performance.now()
  clockRef.current.seconds += clockRef.current.lastTimeMs !== null ? (now - clockRef.current.lastTimeMs) / 1000 : 0
  clockRef.current.lastTimeMs = now
  const pulse = (Math.sin(clockRef.current.seconds * 6) + 1) / 2 // 0..1

  return (
    <>
      {sensors.map((sensor) => {
        const stagePos = worldToStage(sensorWorldPosition(pose, sensor), viewport)
        const active = isDetecting(sensor, sensorReadings[sensor.id])

        if (sensor.type === 'ir') {
          // Rotate with the chassis so the module stays bolted on face-down as the robot turns.
          return (
            <Group key={sensor.id} x={stagePos.x} y={stagePos.y} rotation={pose.headingDeg}>
              <IrModule scale={viewport.scale} active={active} pulse={pulse} />
            </Group>
          )
        }

        // Rotate to the actual beam heading — same value SensorSampling.ts casts the beam along.
        const beamHeadingDeg = pose.headingDeg + (sensor.mountAngleDeg ?? 0)
        const reading = sensorReadings[sensor.id]
        const rangeCm = typeof reading === 'number' ? reading : ULTRASONIC_MAX_RANGE_CM
        const rangePx = rangeCm * PX_PER_CM * viewport.scale
        return (
          <Group key={sensor.id} x={stagePos.x} y={stagePos.y} rotation={beamHeadingDeg}>
            <UltrasonicModule scale={viewport.scale} active={active} pulse={pulse} rangePx={rangePx} />
          </Group>
        )
      })}
    </>
  )
}
