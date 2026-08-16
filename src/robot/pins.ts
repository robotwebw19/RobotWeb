// Arduino Uno-like board layout: A0-A7 analog pins, D2-D13 digital pins (D0/D1 reserved for
// Serial, matching real hardware). Shared by the sensor catalog (which pins are offered for
// mounting) and the interpreter (which pin names are valid identifiers in Arduino code).
export const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
export const DIGITAL_PINS = ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13']

// Motor driver pins — fixed 1:1 with left/right, like a typical motor shield's dedicated headers.
export const MOTOR_PIN_LEFT = 'M1'
export const MOTOR_PIN_RIGHT = 'M2'
export const MOTOR_PINS = [MOTOR_PIN_LEFT, MOTOR_PIN_RIGHT]

export const ALL_PINS = [...ANALOG_PINS, ...DIGITAL_PINS, ...MOTOR_PINS]
