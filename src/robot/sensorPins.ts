/** The pin fields common to both `SensorConfig` and `RequiredEquipmentItem`'s sensor variant —
 * structural, so this works for either without importing one just to type the other. */
interface WiredSensor {
  pin: string
  echoPin?: string
}

/** Every physical pin a sensor occupies — not just `pin`, but any type-specific extra pins
 * (ultrasonic's `echoPin`). Shared by pin-allocation, pin-collision validation, and
 * equipment-label display so all three stay in sync as sensor types grow wiring. */
export function sensorPins(sensor: WiredSensor): string[] {
  const pins = [sensor.pin]
  if (sensor.echoPin) pins.push(sensor.echoPin)
  return pins
}
