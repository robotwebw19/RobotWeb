import type { Level } from '../../types/domain'
import { TWO_IR_AND_MOTORS } from './equipmentPresets'

export const level04GappedLine: Level = {
  id: 'level-04-gapped-line',
  name: '4. Gapped Line',
  difficulty: 'medium',
  trackPath: [
    [
      { x: 40, y: 250 },
      { x: 220, y: 250 },
    ],
    [
      { x: 280, y: 250 },
      { x: 460, y: 250 },
    ],
    [
      { x: 520, y: 250 },
      { x: 760, y: 250 },
    ],
  ],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 40, y: 250, headingDeg: 0 },
  finishZone: { x: 760, y: 250, radius: 24 },
  timeLimitMs: 25_000,
  parConditions: { threeStarTimeMs: 9000, twoStarTimeMs: 15_000, maxOffTrackEventsForThreeStars: 2 },
  requiredEquipment: TWO_IR_AND_MOTORS,
  solutionCode: `int leftSpeed = 0; // ความเร็วที่ต้องการของล้อซ้าย (ลบ = ถอยหลัง)
int rightSpeed = 0; // ความเร็วที่ต้องการของล้อขวา

void setup() {
  pinMode(D2, INPUT); // ตั้งขา D2 (เซนเซอร์ซ้าย) เป็นอินพุต
  pinMode(D3, INPUT); // ตั้งขา D3 (เซนเซอร์ขวา) เป็นอินพุต
  pinMode(IN1, OUTPUT); // ขาเลือกทิศมอเตอร์ซ้าย (L298N)
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT); // ขา PWM ความเร็วมอเตอร์ซ้าย
  pinMode(IN3, OUTPUT); // ขาเลือกทิศมอเตอร์ขวา
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT); // ขา PWM ความเร็วมอเตอร์ขวา
}

// สั่งขา IN1/IN2/ENA และ IN3/IN4/ENB จริงตาม leftSpeed/rightSpeed ที่ตั้งไว้
void applyMotorSpeeds() {
  if (leftSpeed > 0) {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, leftSpeed);
  } else if (leftSpeed < 0) {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    analogWrite(ENA, -leftSpeed);
  } else {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, 0);
  }

  if (rightSpeed > 0) {
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENB, rightSpeed);
  } else if (rightSpeed < 0) {
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, HIGH);
    analogWrite(ENB, -rightSpeed);
  } else {
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
    analogWrite(ENB, 0);
  }
}

void loop() {
  int left = digitalRead(D2); // อ่านค่าเซนเซอร์ IR ฝั่งซ้าย
  int right = digitalRead(D3); // อ่านค่าเซนเซอร์ IR ฝั่งขวา

  if (left == 1 && right == 1) { // เซนเซอร์ทั้งสองเจอเส้น = อยู่กึ่งกลางเส้นพอดี
    leftSpeed = 140; // เดินหน้าตรงด้วยความเร็วคงที่
    rightSpeed = 140;
  } else if (left == 1 && right == 0) { // มีแค่เซนเซอร์ซ้ายเจอเส้น = หลุดไปทางขวา
    leftSpeed = 90; // เลี้ยวซ้ายกลับเข้าหาเส้น (หมุนอยู่กับที่)
    rightSpeed = -90;
  } else if (left == 0 && right == 1) { // มีแค่เซนเซอร์ขวาเจอเส้น = หลุดไปทางซ้าย
    leftSpeed = -90; // เลี้ยวขวากลับเข้าหาเส้น (หมุนอยู่กับที่)
    rightSpeed = 90;
  } else { // เซนเซอร์ทั้งคู่หลุดเส้น (น่าจะเจอช่องเส้นขาด)
    leftSpeed = 140; // เดินหน้าตรงต่อไปเพื่อไถลผ่านช่องเส้นขาดจนกลับไปเจอเส้น
    rightSpeed = 140;
  }
  applyMotorSpeeds();

  delay(20); // หน่วงเวลาเล็กน้อยก่อนวนลูปอ่านเซนเซอร์รอบถัดไป
}
`,
}
