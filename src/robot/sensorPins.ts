/** The pin fields common to both `SensorConfig` and `RequiredEquipmentItem`'s sensor variant —
 * structural, so this works for either without importing one just to type the other. */
interface WiredSensor {
  pin: string
  echoPin?: string
  s0Pin?: string
  s1Pin?: string
  s2Pin?: string
  s3Pin?: string
}

/** Every physical pin a sensor occupies — not just `pin`, but any type-specific extra pins
 * (ultrasonic's `echoPin`; color's `s0Pin`-`s3Pin`). Shared by pin-allocation, pin-collision
 * validation, and equipment-label display so all three stay in sync as sensor types grow wiring. */
export function sensorPins(sensor: WiredSensor): string[] {
  const pins = [sensor.pin]
  if (sensor.echoPin) pins.push(sensor.echoPin)
  if (sensor.s0Pin) pins.push(sensor.s0Pin)
  if (sensor.s1Pin) pins.push(sensor.s1Pin)
  if (sensor.s2Pin) pins.push(sensor.s2Pin)
  if (sensor.s3Pin) pins.push(sensor.s3Pin)
  return pins
}
