// Arduino Uno-like board layout: A0-A7 analog pins, D2-D13 digital pins (D0/D1 reserved for
// Serial, matching real hardware). Shared by the sensor catalog (which pins are offered for
// mounting) and the interpreter (which pin names are valid identifiers in Arduino code).
export const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
export const DIGITAL_PINS = ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13']

// L298N motor driver pins — real hardware names. IN1/IN2 pick motor A's (left) direction,
// ENA is its PWM speed pin; IN3/IN4/ENB are the same for motor B (right).
export const MOTOR_PIN_IN1 = 'IN1'
export const MOTOR_PIN_IN2 = 'IN2'
export const MOTOR_PIN_ENA = 'ENA'
export const MOTOR_PIN_IN3 = 'IN3'
export const MOTOR_PIN_IN4 = 'IN4'
export const MOTOR_PIN_ENB = 'ENB'
export const MOTOR_PINS = [MOTOR_PIN_IN1, MOTOR_PIN_IN2, MOTOR_PIN_ENA, MOTOR_PIN_IN3, MOTOR_PIN_IN4, MOTOR_PIN_ENB]

export const ALL_PINS = [...ANALOG_PINS, ...DIGITAL_PINS, ...MOTOR_PINS]
