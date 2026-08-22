// Arduino Uno-like board layout: A0-A7 analog pins, D2-D13 digital pins (D0/D1 reserved for
// Serial, matching real hardware). Shared by the sensor catalog (which pins are offered for
// mounting), the motor catalog (which pins the L298N driver is wired to), and the interpreter
// (which pin names are valid identifiers in Arduino code).
export const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
export const DIGITAL_PINS = ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13']

export const ALL_PINS = [...ANALOG_PINS, ...DIGITAL_PINS]
