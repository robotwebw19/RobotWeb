import { describe, expect, it } from 'vitest'
import { parseProgram } from '../parser/parser'
import { Interpreter } from './Interpreter'
import { ArduinoRuntimeAPI, type ArduinoRuntimeDeps } from './ArduinoRuntimeAPI'
import type { SensorConfig } from '../../types/domain'
import { RuntimeError } from './errors'

function build(source: string, overrides: Partial<ArduinoRuntimeDeps> = {}) {
  const serialOutput: string[] = []
  const motorCalls: [number, number][] = []
  let elapsedMs = 0

  const deps: ArduinoRuntimeDeps = {
    sensors: [],
    getSensorReadings: () => ({}),
    getElapsedMs: () => elapsedMs,
    setMotorSpeeds: (left, right) => motorCalls.push([left, right]),
    onSerialOutput: (text) => serialOutput.push(text),
    ...overrides,
  }
  const api = new ArduinoRuntimeAPI(deps)
  const interpreter = new Interpreter(parseProgram(source), api)

  function advanceElapsed(ms: number) {
    elapsedMs += ms
    interpreter.notifyElapsed(elapsedMs)
  }

  return { interpreter, serialOutput, motorCalls, advanceElapsed }
}

describe('Interpreter — setup/loop lifecycle', () => {
  it('runs setup() exactly once, then loop() repeatedly', () => {
    const { interpreter, serialOutput } = build(`
      int setupCount = 0;
      int loopCount = 0;
      void setup() {
        setupCount = setupCount + 1;
        Serial.println(setupCount);
      }
      void loop() {
        loopCount = loopCount + 1;
        Serial.println(loopCount);
      }
    `)

    for (let i = 0; i < 12; i++) interpreter.step()

    expect(serialOutput).toEqual(['1\n', '1\n', '2\n', '3\n'])
  })
})

describe('Interpreter — motor commands', () => {
  it('turnLeft decreases heading (counterclockwise, a real left turn) and turnRight increases it', () => {
    // Cross-check against RobotPhysics: heading increases clockwise on screen (see
    // RobotPhysics.test.ts "turns in place" — left=-50,right=50 increases heading). A real left
    // turn must therefore be left-forward/right-backward: left > right.
    const left = build(`void setup() { turnLeft(100); } void loop() {}`)
    left.interpreter.step()
    expect(left.motorCalls).toEqual([[60, -60]])

    const right = build(`void setup() { turnRight(100); } void loop() {}`)
    right.interpreter.step()
    expect(right.motorCalls).toEqual([[-60, 60]])
  })

  it('moveForward drives both wheels equally and stopMotors zeroes them', () => {
    const { interpreter, motorCalls } = build(`
      void setup() {
        moveForward(100);
        stopMotors();
      }
      void loop() {}
    `)
    interpreter.step()
    interpreter.step()
    expect(motorCalls).toEqual([
      [60, 60],
      [0, 0],
    ])
  })
})

describe('Interpreter — delay()', () => {
  it('pauses without blocking and keeps the last motor command active until the delay elapses', () => {
    const { interpreter, motorCalls, advanceElapsed } = build(`
      void setup() {
        setMotorSpeed(100, 100);
        delay(500);
        stopMotors();
      }
      void loop() {}
    `)

    interpreter.step() // setMotorSpeed(100, 100)
    expect(motorCalls).toEqual([[60, 60]])

    interpreter.step() // delay(500)
    expect(interpreter.isWaitingOnDelay()).toBe(true)
    expect(interpreter.step()).toBe('waiting')
    expect(motorCalls).toHaveLength(1)

    advanceElapsed(499)
    expect(interpreter.step()).toBe('waiting')

    advanceElapsed(1)
    expect(interpreter.isWaitingOnDelay()).toBe(false)
    interpreter.step() // stopMotors()
    expect(motorCalls).toEqual([
      [60, 60],
      [0, 0],
    ])
  })
})

describe('Interpreter — busy-loop guard', () => {
  it('throws when loop() runs an unbounded loop without ever calling delay()', () => {
    const { interpreter } = build(`
      int x = 0;
      void setup() {}
      void loop() {
        while (true) {
          x = x + 1;
        }
      }
    `)

    expect(() => {
      for (let i = 0; i < 500_000; i++) interpreter.step()
    }).toThrow(/infinite loop/i)
  })

  it('does not trip the guard for an empty-body loop bounded by a condition', () => {
    const { interpreter } = build(`
      void setup() {}
      void loop() {
        for (int i = 0; i < 5; i = i + 1) {}
        stopMotors();
      }
    `)
    expect(() => {
      for (let i = 0; i < 100; i++) interpreter.step()
    }).not.toThrow()
  })
})

describe('Interpreter — arithmetic errors', () => {
  it('throws a RuntimeError on division by zero', () => {
    const { interpreter } = build(`
      void setup() {
        int y = 1 / 0;
      }
      void loop() {}
    `)
    expect(() => interpreter.step()).toThrow(/division by zero/i)
  })
})

describe('Interpreter — sensor reads', () => {
  const irSensor: SensorConfig = { id: 'ir1', type: 'ir', pin: 'A0', position: { x: 0, y: 0 }, irMode: 'digital' }
  const ultrasonicSensor: SensorConfig = { id: 'us1', type: 'ultrasonic', pin: 'D7', position: { x: 0, y: 0 } }
  const colorSensor: SensorConfig = { id: 'cs1', type: 'color', pin: 'D8', position: { x: 0, y: 0 } }

  it('throws a clear error when reading an unconfigured pin', () => {
    const { interpreter } = build(`
      void setup() { int v = digitalRead(A0); }
      void loop() {}
    `)
    expect(() => interpreter.step()).toThrow(/no sensor is wired to pin A0/)
  })

  it('throws when using digitalRead on a pin configured for analog mode', () => {
    const analogIr: SensorConfig = { ...irSensor, irMode: 'analog' }
    const { interpreter } = build(
      `void setup() { int v = digitalRead(A0); } void loop() {}`,
      { sensors: [analogIr] },
    )
    expect(() => interpreter.step()).toThrow(/analogRead/)
  })

  it('reads ultrasonic distance and color sensor readings by pin', () => {
    const { interpreter, serialOutput } = build(
      `
        void setup() {}
        void loop() {
          Serial.println(readUltrasonic(D7));
          Serial.println(readColorSensor(D8));
        }
      `,
      {
        sensors: [ultrasonicSensor, colorSensor],
        getSensorReadings: () => ({ us1: 42, cs1: 'red' }),
      },
    )
    interpreter.step() // empty setup() completes immediately
    for (let i = 0; i < 3; i++) interpreter.step() // one loop() iteration: 2 statements + iteration-complete

    expect(serialOutput).toEqual(['42\n', 'red\n'])
  })

  it('throws RuntimeError (not a generic error) for a wrong-type sensor call', () => {
    const { interpreter } = build(
      `void setup() { float d = readUltrasonic(A0); } void loop() {}`,
      { sensors: [irSensor] },
    )
    let caught: unknown
    try {
      interpreter.step()
    } catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(RuntimeError)
  })
})

describe('Interpreter — control flow and formatting', () => {
  it('sums with a for-loop and prints ints without decimals', () => {
    const { interpreter, serialOutput } = build(`
      int total = 0;
      void setup() {
        for (int i = 0; i < 5; i = i + 1) {
          total = total + i;
        }
        Serial.println(total);
      }
      void loop() {}
    `)
    for (let i = 0; i < 100; i++) interpreter.step()
    expect(serialOutput).toEqual(['10\n'])
  })

  it('formats floats with two decimals and booleans as 1/0', () => {
    const { interpreter, serialOutput } = build(`
      void setup() {
        float f = 1.5;
        Serial.println(f);
        bool flag = true;
        Serial.println(flag);
      }
      void loop() {}
    `)
    for (let i = 0; i < 10; i++) interpreter.step()
    expect(serialOutput).toEqual(['1.50\n', '1\n'])
  })

  it('declares a string variable and compares it to a color sensor reading', () => {
    const colorSensor: SensorConfig = { id: 'cs1', type: 'color', pin: 'D8', position: { x: 0, y: 0 } }
    const { interpreter, serialOutput } = build(
      `
        void setup() {
          string color = readColorSensor(D8);
          if (color == "red") {
            Serial.println("stop");
          } else {
            Serial.println("go");
          }
        }
        void loop() {}
      `,
      { sensors: [colorSensor], getSensorReadings: () => ({ cs1: 'red' }) },
    )
    for (let i = 0; i < 10; i++) interpreter.step()
    expect(serialOutput).toEqual(['stop\n'])
  })

  it('takes the else-if branch matching the condition', () => {
    const { interpreter, serialOutput } = build(`
      int x = -5;
      void setup() {
        if (x > 0) {
          Serial.println("positive");
        } else if (x < 0) {
          Serial.println("negative");
        } else {
          Serial.println("zero");
        }
      }
      void loop() {}
    `)
    for (let i = 0; i < 10; i++) interpreter.step()
    expect(serialOutput).toEqual(['negative\n'])
  })
})
