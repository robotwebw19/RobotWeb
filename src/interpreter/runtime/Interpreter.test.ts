import { describe, expect, it } from 'vitest'
import { parseProgram } from '../parser/parser'
import { Interpreter } from './Interpreter'
import { ArduinoRuntimeAPI, type ArduinoRuntimeDeps } from './ArduinoRuntimeAPI'
import type { MotorConfig, SensorConfig } from '../../types/domain'
import { RuntimeError } from './errors'

const leftMotor: MotorConfig = { id: 'm1', side: 'left', in1Pin: 'D10', in2Pin: 'D11', enablePin: 'A0', position: { x: 0, y: 0 } }
const rightMotor: MotorConfig = { id: 'm2', side: 'right', in1Pin: 'D12', in2Pin: 'D13', enablePin: 'A1', position: { x: 0, y: 0 } }

function build(source: string, overrides: Partial<ArduinoRuntimeDeps> = {}) {
  const serialOutput: string[] = []
  let elapsedMs = 0

  const deps: ArduinoRuntimeDeps = {
    sensors: [],
    motors: [],
    getSensorReadings: () => ({}),
    getElapsedMs: () => elapsedMs,
    onSerialOutput: (text) => serialOutput.push(text),
    ...overrides,
  }
  const api = new ArduinoRuntimeAPI(deps)
  const interpreter = new Interpreter(parseProgram(source), api)

  function advanceElapsed(ms: number) {
    elapsedMs += ms
    interpreter.notifyElapsed(elapsedMs)
  }

  return { interpreter, serialOutput, advanceElapsed }
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

describe('Interpreter — motor commands (real L298N pins, read via getMotorSpeeds)', () => {
  it('reads D10/D11 direction and the A0/A1 PWM magnitude into a signed px/s speed per side', () => {
    const { interpreter } = build(
      `
        void setup() {
          pinMode(D10, OUTPUT);
          pinMode(D11, OUTPUT);
          pinMode(A0, OUTPUT);
          pinMode(D12, OUTPUT);
          pinMode(D13, OUTPUT);
          pinMode(A1, OUTPUT);
          digitalWrite(D10, HIGH);
          digitalWrite(D11, LOW);
          analogWrite(A0, 100);
          digitalWrite(D12, LOW);
          digitalWrite(D13, HIGH);
          analogWrite(A1, 100);
        }
        void loop() {}
      `,
      { motors: [leftMotor, rightMotor] },
    )
    for (let i = 0; i < 20; i++) interpreter.step()
    expect(interpreter.getMotorSpeeds()).toEqual({ left: 60, right: -60 })
  })

  it('matching (or unset) direction pins reads as stopped, regardless of PWM value', () => {
    const { interpreter } = build(
      `
        void setup() {
          pinMode(A0, OUTPUT);
          analogWrite(A0, 200); // PWM alone shouldn't move the wheel without a direction set
        }
        void loop() {}
      `,
      { motors: [leftMotor] },
    )
    for (let i = 0; i < 10; i++) interpreter.step()
    expect(interpreter.getMotorSpeeds().left).toBe(0)
  })

  it('supports a zero-arg helper function driving both motors — the real Arduino void-helper pattern', () => {
    const { interpreter } = build(
      `
        int leftSpeed = 0;
        int rightSpeed = 0;

        void setup() {
          pinMode(D10, OUTPUT);
          pinMode(D11, OUTPUT);
          pinMode(A0, OUTPUT);
          pinMode(D12, OUTPUT);
          pinMode(D13, OUTPUT);
          pinMode(A1, OUTPUT);
        }

        void applyMotorSpeeds() {
          if (leftSpeed > 0) {
            digitalWrite(D10, HIGH);
            digitalWrite(D11, LOW);
            analogWrite(A0, leftSpeed);
          } else {
            digitalWrite(D10, LOW);
            digitalWrite(D11, LOW);
            analogWrite(A0, 0);
          }
          digitalWrite(D12, LOW);
          digitalWrite(D13, LOW);
          analogWrite(A1, 0);
        }

        void loop() {
          leftSpeed = 120;
          applyMotorSpeeds();
        }
      `,
      { motors: [leftMotor, rightMotor] },
    )
    for (let i = 0; i < 20; i++) interpreter.step()
    expect(interpreter.getMotorSpeeds()).toEqual({ left: 72, right: 0 }) // 120 * 0.6 scale
  })

  it('a helper function calling itself throws a clear RuntimeError instead of overflowing the stack', () => {
    const { interpreter } = build(`
      void recurse() { recurse(); }
      void setup() { recurse(); }
      void loop() {}
    `)
    expect(() => interpreter.step()).toThrow(/nested calls to recurse/)
  })
})

describe('Interpreter — delay()', () => {
  it('pauses without blocking and keeps the last motor pin state active until the delay elapses', () => {
    const { interpreter, advanceElapsed } = build(
      `
        void setup() {
          pinMode(D10, OUTPUT);
          pinMode(D11, OUTPUT);
          pinMode(A0, OUTPUT);
          digitalWrite(D10, HIGH);
          digitalWrite(D11, LOW);
          analogWrite(A0, 100);
          delay(500);
          digitalWrite(D10, LOW);
          digitalWrite(D11, LOW);
          analogWrite(A0, 0);
        }
        void loop() {}
      `,
      { motors: [leftMotor] },
    )

    for (let i = 0; i < 6; i++) interpreter.step() // pinMode x3, digitalWrite x2, analogWrite
    expect(interpreter.getMotorSpeeds().left).toBe(60)

    interpreter.step() // delay(500)
    expect(interpreter.isWaitingOnDelay()).toBe(true)
    expect(interpreter.step()).toBe('waiting')
    expect(interpreter.getMotorSpeeds().left).toBe(60) // still driving through the delay

    advanceElapsed(499)
    expect(interpreter.step()).toBe('waiting')

    advanceElapsed(1)
    expect(interpreter.isWaitingOnDelay()).toBe(false)
    for (let i = 0; i < 3; i++) interpreter.step() // digitalWrite x2, analogWrite after the delay
    expect(interpreter.getMotorSpeeds().left).toBe(0)
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
        Serial.print("");
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
  const irSensor: SensorConfig = { id: 'ir1', type: 'ir', pin: 'A0', position: { x: 0, y: 0 } }
  const ultrasonicSensor: SensorConfig = {
    id: 'us1',
    type: 'ultrasonic',
    pin: 'D7',
    echoPin: 'D6',
    position: { x: 0, y: 0 },
  }
  it('throws a clear error when reading an unconfigured pin', () => {
    const { interpreter } = build(`
      void setup() { int v = digitalRead(A0); }
      void loop() {}
    `)
    expect(() => interpreter.step()).toThrow(/no sensor is wired to pin A0/)
  })

  it('throws when calling analogRead on an IR sensor — IR is digital-only', () => {
    const { interpreter } = build(
      `void setup() { int v = analogRead(A0); } void loop() {}`,
      { sensors: [irSensor] },
    )
    expect(() => interpreter.step()).toThrow(/digital-only/)
  })

  it('pulseIn(echoPin) converts the physics distance into the matching real HC-SR04 duration', () => {
    const { interpreter, serialOutput } = build(
      `
        void setup() {}
        void loop() {
          Serial.println(pulseIn(D6, HIGH));
        }
      `,
      {
        // 34.3cm round-trip at 0.0343 cm/us -> exactly 2000us: duration = distance*2/0.0343.
        sensors: [ultrasonicSensor],
        getSensorReadings: () => ({ us1: 34.3 }),
      },
    )
    interpreter.step() // empty setup() completes immediately
    for (let i = 0; i < 2; i++) interpreter.step() // one loop() iteration: 1 statement + iteration-complete

    expect(serialOutput).toEqual(['2000\n'])
  })

  it('supports the full real trig/echo sequence: pinMode, digitalWrite pulse, delayMicroseconds, then pulseIn', () => {
    const { interpreter, serialOutput, advanceElapsed } = build(
      `
        void setup() {
          pinMode(D7, OUTPUT);
        }
        void loop() {
          digitalWrite(D7, LOW);
          delayMicroseconds(2);
          digitalWrite(D7, HIGH);
          delayMicroseconds(10);
          digitalWrite(D7, LOW);
          int duration = pulseIn(D6, HIGH);
          Serial.println(duration);
        }
      `,
      {
        sensors: [ultrasonicSensor],
        getSensorReadings: () => ({ us1: 34.3 }),
      },
    )

    // Pump the interpreter, nudging simulated time forward whenever a delayMicroseconds() pause
    // is blocking, until one full loop() iteration completes and prints.
    for (let i = 0; i < 20 && serialOutput.length === 0; i++) {
      if (interpreter.step() === 'waiting') advanceElapsed(1)
    }

    expect(serialOutput).toEqual(['2000\n'])
  })

  it('throws RuntimeError (not a generic error) for pulseIn on a pin with no ultrasonic echo wired', () => {
    const { interpreter } = build(
      `void setup() { int d = pulseIn(A0, HIGH); } void loop() {}`,
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

  it('declares a string variable and compares it with ==', () => {
    const { interpreter, serialOutput } = build(`
      void setup() {
        string color = "red";
        if (color == "red") {
          Serial.println("stop");
        } else {
          Serial.println("go");
        }
      }
      void loop() {}
    `)
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
